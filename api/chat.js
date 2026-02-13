/**
 * Vercel Serverless Function: Chat with Live RAG
 * Flow: Input → Vector DB → Web Search (fallback) → Auto-Ingest → LLM → Output
 */

// Website terpercaya yang diizinkan untuk web search
const TRUSTED_SITES = [
    "islamqa.info",
    "binbaz.org.sa",
    "islamweb.net",
    "muslim.or.id",
    "almanhaj.or.id"
];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, provider = 'gemini' } = req.body;
    const userQuery = messages[messages.length - 1].content;

    try {
        // Step 1: Generate embedding dari pertanyaan user
        const embedding = await generateEmbedding(userQuery);

        // Step 2: Cari di Vector DB
        const { context: vectorContext, hasStrongMatch } = await searchVectorDB(embedding);

        // Step 3: Kalau hasil vector lemah → cari di web (trusted sites only)
        let webContext = "";
        if (!hasStrongMatch) {
            webContext = await searchWeb(userQuery);

            // Step 4: Auto-simpan hasil web ke Vector DB (untuk pertanyaan serupa di masa depan)
            if (webContext) {
                // Non-blocking: jangan tunggu selesai
                ingestToVector(webContext, userQuery).catch(err =>
                    console.error('Auto-ingest error (non-blocking):', err)
                );
            }
        }

        // Step 5: Gabungkan semua konteks
        const context = [vectorContext, webContext].filter(Boolean).join('\n\n---\n\n');

        // Step 6: Bangun system prompt & kirim ke LLM
        const systemPrompt = constructSystemPrompt(context);
        const response = await callAIProvider(provider, systemPrompt, messages);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// ============================================================
// EMBEDDING
// ============================================================
async function generateEmbedding(text) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
            outputDimensionality: 768
        })
    });

    const data = await response.json();
    if (!data.embedding) throw new Error('Embedding generation failed');
    return data.embedding.values;
}

// ============================================================
// VECTOR DB SEARCH (dengan score threshold)
// ============================================================
async function searchVectorDB(embedding) {
    const URL = process.env.UPSTASH_VECTOR_REST_URL;
    const TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

    if (!URL || !TOKEN) {
        console.warn('Vector DB not configured');
        return { context: "", hasStrongMatch: false };
    }

    try {
        const response = await fetch(`${URL}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                vector: embedding,
                topK: 5,
                includeMetadata: true
            })
        });

        const data = await response.json();

        if (!data.result || data.result.length === 0) {
            return { context: "", hasStrongMatch: false };
        }

        // Cek apakah ada hasil dengan similarity score tinggi (threshold: 0.7)
        const MIN_SCORE = 0.7;
        const strongResults = data.result.filter(m => m.score >= MIN_SCORE);
        const hasStrongMatch = strongResults.length > 0;

        const results = hasStrongMatch ? strongResults : data.result.slice(0, 3);
        const context = results
            .map(match => match.metadata?.text || '')
            .filter(Boolean)
            .join('\n\n---\n\n');

        return { context, hasStrongMatch };
    } catch (error) {
        console.error('Vector DB Error:', error);
        return { context: "", hasStrongMatch: false };
    }
}

// ============================================================
// WEB SEARCH (Gemini Google Search grounding — trusted sites)
// ============================================================
async function searchWeb(query) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not configured, skipping web search');
        return "";
    }

    try {
        // Gunakan Gemini 2.5 Flash dengan Google Search grounding
        const siteHint = TRUSTED_SITES.slice(0, 3).join(', ');
        const searchPrompt = `Cari informasi tentang: "${query}". Fokus cari dari situs: ${siteHint}. Berikan jawaban ringkas beserta sumber URL.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: searchPrompt }] }],
                tools: [{ google_search: {} }]
            })
        });

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) return "";

        const candidate = data.candidates[0];
        // Ambil teks jawaban dari Gemini
        const parts = candidate.content?.parts || [];
        const text = parts.map(p => p.text || '').join('');

        // Ambil sumber dari grounding metadata
        const gm = candidate.groundingMetadata || {};
        const chunks = gm.groundingChunks || [];
        const sources = chunks
            .map(ch => ch.web)
            .filter(Boolean)
            .map(w => `Sumber: ${w.title || ''} - ${w.uri || ''}`)
            .join('\n');

        if (!text) return "";

        return `[HASIL WEB SEARCH]\n${text}\n\n${sources}`;
    } catch (error) {
        console.error('Web Search Error:', error);
        return "";
    }
}

// ============================================================
// AUTO-INGEST KE VECTOR DB (simpan hasil web untuk masa depan)
// ============================================================
async function ingestToVector(text, query) {
    try {
        const embedding = await generateEmbedding(text.slice(0, 8000));

        const URL = process.env.UPSTASH_VECTOR_REST_URL;
        const TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

        if (!URL || !TOKEN) return;

        await fetch(`${URL}/upsert`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: `web-${Date.now()}`,
                vector: embedding,
                metadata: {
                    text: text.slice(0, 2000),
                    source: "web_search",
                    query: query,
                    ingested_at: new Date().toISOString()
                }
            })
        });
    } catch (error) {
        console.error('Auto-ingest Error:', error);
    }
}

// ============================================================
// SYSTEM PROMPT (ketat — hanya jawab dari konteks)
// ============================================================
function constructSystemPrompt(context) {
    const sourceList = TRUSTED_SITES.map(s => `- ${s}`).join('\n');

    if (!context) {
        return `Kamu adalah IslamAI, asisten Islami yang hangat dan bijaksana.

ATURAN KETAT:
1. TIDAK ADA konteks yang ditemukan di database maupun web.
2. Jawab: "Mohon maaf, saya belum memiliki informasi mengenai hal tersebut. Silakan kunjungi langsung islamqa.info untuk mencari jawabannya."
3. JANGAN mengarang jawaban.`;
    }

    return `Kamu adalah IslamAI, asisten Islami yang hangat dan bijaksana.

Jawab HANYA berdasarkan konteks berikut:
${context}

ATURAN KETAT:
1. DILARANG menjawab di luar konteks yang diberikan di atas.
2. DILARANG menggunakan pengetahuan umum atau hafalanmu sendiri.
3. Sumber yang diizinkan HANYA dari website berikut:
${sourceList}
4. Jika pertanyaan TIDAK tercakup dalam konteks, jawab:
   "Mohon maaf, saya belum memiliki informasi mengenai hal tersebut. Silakan kunjungi langsung islamqa.info."
5. SELALU sertakan URL sumber dari konteks.
6. Tetap santun & menyejukkan.
7. JANGAN mengarang atau mengira-ngira jawaban.`;
}

// ============================================================
// AI PROVIDER CALLS
// ============================================================
async function callAIProvider(provider, systemPrompt, messages) {
    // 1. GEMINI
    if (provider === 'gemini') {
        const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [process.env.GEMINI_API_KEY];
        const GEMINI_API_KEY = keys[Math.floor(Math.random() * keys.length)];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

        const contents = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: contents
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return { message: { content: data.candidates[0].content.parts[0].text } };
    }

    // 2. CLAUDE (ANTHROPIC)
    if (provider === 'claude') {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is not set on server.');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                system: systemPrompt,
                messages: messages.map(m => ({
                    role: m.role === 'model' ? 'assistant' : (m.role === 'assistant' ? 'assistant' : 'user'),
                    content: m.content
                }))
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
        return { message: { content: data.content[0].text } };
    }

    // 3. OPENAI-COMPATIBLE (Groq, GPT-4o)
    let config = {
        model: "gpt-4o",
        key: process.env.GPT4O_API_KEY,
        url: "https://models.inference.ai.azure.com/chat/completions"
    };

    if (provider === 'groq') {
        config = {
            model: "llama-3.3-70b-versatile",
            key: process.env.GROQ_API_KEY,
            url: "https://api.groq.com/openai/v1/chat/completions"
        };
    }

    if (!config.key) {
        throw new Error(`API Key untuk ${provider} belum dikonfigurasi di environment variables.`);
    }

    const response = await fetch(config.url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }))
            ],
            temperature: 0.7
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return { message: { content: data.choices[0].message.content } };
}
