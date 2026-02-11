/**
 * Vercel Serverless Function: Chat with Vector RAG
 * Handles query -> embeddings -> vector search -> AI response
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, provider = 'gemini', context: clientContext } = req.body;
    const userQuery = messages[messages.length - 1].content;

    try {
        let context = clientContext;

        // Only use Vector DB if no client context provided (server-side backup)
        if (!context) {
            // 1. Generate Embeddings for the Query
            const embedding = await generateEmbedding(userQuery);

            // 2. Search Upstash Vector DB
            context = await searchVectorDB(embedding);
        }

        // 3. Construct System Prompt with Context
        const systemPrompt = constructSystemPrompt(context);

        // 4. Call AI Provider
        const response = await callAIProvider(provider, systemPrompt, messages);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Chat API Error:', error);
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

async function searchVectorDB(embedding) {
    const URL = process.env.UPSTASH_VECTOR_REST_URL;
    const TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

    const response = await fetch(`${URL}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            vector: embedding,
            topK: 3,
            includeMetadata: true
        })
    });

    const data = await response.json();
    return data.result.map(match => match.metadata.text).join('\n\n---\n\n');
}

function constructSystemPrompt(context) {
    return `Kamu adalah IslamAI, asisten Islami yang hangat dan bijaksana.
Sampaikan jawaban HANYA berdasarkan konteks berikut:
${context}

Jika tidak ada di konteks, katakan tidak tahu. Selalu sertakan rujukan dari teks tersebut.`;
}

async function callAIProvider(provider, systemPrompt, messages) {
    // 1. GEMINI IMPLEMENTATION
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

    // 2. OPENAI-COMPATIBLE IMPLEMENTATION (Groq, GPT-4o)
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
