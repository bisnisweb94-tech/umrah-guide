/**
 * Vercel Serverless Function: Ingest Knowledge from URL
 * Scrapes website -> chunks -> embeddings -> save to Upstash
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    try {
        // 1. Scrape Content
        const htmlResponse = await fetch(url);
        const html = await htmlResponse.text();

        // Simple text extraction (in a real app, use a proper library like Cheerio)
        const text = html.replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 5000); // Limit for demo

        // 2. Generate Embedding
        const embedding = await generateEmbedding(text);

        // 3. Save to Upstash Vector
        await saveToVectorDB(url, text, embedding);

        return res.status(200).json({ success: true, message: `Knowledge from ${url} ingested.` });
    } catch (error) {
        console.error('Ingest API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

async function generateEmbedding(text) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text }] }
        })
    });

    const data = await response.json();
    return data.embedding.values;
}

async function saveToVectorDB(sourceUrl, text, embedding) {
    const URL = process.env.UPSTASH_VECTOR_REST_URL;
    const TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

    await fetch(`${URL}/upsert`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: Buffer.from(sourceUrl).toString('base64'),
            vector: embedding,
            metadata: {
                url: sourceUrl,
                text: text
            }
        })
    });
}
