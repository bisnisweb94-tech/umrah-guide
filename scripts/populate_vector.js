/**
 * Script untuk pre-populate Upstash Vector DB
 * Menggunakan Gemini + Google Search untuk mengumpulkan data dari trusted sites
 * Jalankan: node scripts/populate_vector.js
 */

const GEMINI_API_KEY = "AIzaSyCPL7Q2HN-En_6rKkfFdVCp5Nbxu06-x-U";
const UPSTASH_URL = "https://adapting-aardvark-73650-us1-vector.upstash.io";
const UPSTASH_TOKEN = "ABsFMGFkYXB0aW5nLWFhcmR2YXJrLTczNjUwLXVzMWFkbWluT1RFMk56VTJNakV0WkdVeE9DMDBNVGxqTFdFMk1HVXROemcwWTJaaU16UTBNR0Zp";

// Topik-topik yang akan dicari dan disimpan
const TOPICS = [
    "tata cara umrah lengkap dari awal sampai akhir",
    "rukun umrah dan penjelasannya",
    "syarat wajib umrah",
    "cara berihram untuk umrah",
    "doa niat umrah",
    "larangan saat ihram umrah",
    "cara melakukan tawaf di Masjidil Haram",
    "doa tawaf mengelilingi kabah",
    "cara melakukan sai antara Safa dan Marwah",
    "doa sai antara Safa dan Marwah",
    "tahallul setelah umrah potong rambut",
    "perbedaan haji dan umrah",
    "hukum umrah dalam Islam wajib atau sunah",
    "miqat untuk umrah dari berbagai negara",
    "pakaian ihram pria dan wanita umrah",
    "tips umrah pertama kali",
    "umrah untuk wanita haid",
    "doa di depan Kabah",
    "doa di Multazam",
    "sholat sunah di Masjidil Haram",
    "minum air zamzam doa dan adab",
    "ziarah Masjid Nabawi Madinah",
    "raudhah di Masjid Nabawi",
    "ziarah ke makam Rasulullah",
    "sholat di Masjid Quba keutamaan",
    "rukun iman dalam Islam",
    "rukun Islam lima",
    "cara sholat yang benar sesuai sunnah",
    "doa setelah sholat fardhu",
    "keutamaan membaca Al-Quran",
    "puasa sunah Senin Kamis",
    "zakat fitrah dan zakat mal",
    "hukum riba dalam Islam",
    "adab berdoa dalam Islam",
    "istighfar dan dzikir sehari-hari",
];

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate embedding
async function generateEmbedding(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
            outputDimensionality: 768
        })
    });
    const data = await res.json();
    if (!data.embedding) throw new Error('Embedding failed: ' + JSON.stringify(data));
    return data.embedding.values;
}

// Search web via Gemini Google Search grounding
async function searchWeb(topic) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: `Cari informasi tentang: "${topic}". Fokus dari situs islamqa.info, binbaz.org.sa, islamweb.net. Berikan jawaban lengkap dalam bahasa Indonesia beserta sumber URL.` }] }],
            tools: [{ google_search: {} }]
        })
    });
    const data = await res.json();

    if (!data.candidates || !data.candidates[0]) return null;

    const candidate = data.candidates[0];
    const parts = candidate.content?.parts || [];
    const text = parts.map(p => p.text || '').join('');

    const gm = candidate.groundingMetadata || {};
    const chunks = gm.groundingChunks || [];
    const sources = chunks
        .map(ch => ch.web)
        .filter(Boolean)
        .map(w => `${w.title || ''}: ${w.uri || ''}`)
        .join('\n');

    return { text, sources };
}

// Upload to Upstash Vector
async function upsertToVector(id, vector, metadata) {
    const res = await fetch(`${UPSTASH_URL}/upsert`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${UPSTASH_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, vector, metadata })
    });
    return res.json();
}

// Main
async function main() {
    console.log(`\n=== Populate Vector DB ===`);
    console.log(`Total topik: ${TOPICS.length}\n`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < TOPICS.length; i++) {
        const topic = TOPICS[i];
        console.log(`[${i + 1}/${TOPICS.length}] ${topic}`);

        try {
            // Step 1: Search web
            console.log('  -> Searching web...');
            const result = await searchWeb(topic);

            if (!result || !result.text) {
                console.log('  -> No results, skipping');
                failed++;
                await sleep(3000);
                continue;
            }

            const fullText = `${result.text}\n\nSumber:\n${result.sources}`;
            console.log(`  -> Got ${fullText.length} chars`);

            // Step 2: Generate embedding
            console.log('  -> Generating embedding...');
            const embedding = await generateEmbedding(fullText.slice(0, 8000));

            // Step 3: Upload to Vector DB
            console.log('  -> Uploading to Vector DB...');
            const metadata = {
                text: fullText.slice(0, 2000),
                topic: topic,
                source: "web_search_bulk",
                ingested_at: new Date().toISOString()
            };

            await upsertToVector(`topic-${i}`, embedding, metadata);
            console.log('  -> OK\n');
            success++;

        } catch (error) {
            console.log(`  -> ERROR: ${error.message}\n`);
            failed++;
        }

        // Rate limiting: tunggu 5 detik antar request
        if (i < TOPICS.length - 1) {
            console.log('  (waiting 5s...)\n');
            await sleep(5000);
        }
    }

    console.log(`\n=== Selesai ===`);
    console.log(`Berhasil: ${success}`);
    console.log(`Gagal: ${failed}`);
    console.log(`Total di Vector DB: cek di Upstash dashboard`);
}

main().catch(console.error);
