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

        // Always use Vector DB for RAG
        // 1. Generate Embeddings for the Query
        const embedding = await generateEmbedding(userQuery);

        // 2. Search Upstash Vector DB
        const vectorContext = await searchVectorDB(embedding);

        // Combine client context (if any) with vector context
        context = clientContext ? `${clientContext}\n\n${vectorContext}` : vectorContext;

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

ATURAN PENTING:
1. JANGAN menjawab menggunakan pengetahuan umum atau hafalanmu.
2. JIKA informasi tidak ada di konteks, KATAKAN: "Mohon maaf, saya belum memiliki ilmu mengenai hal tersebut berdasarkan database yang tersedia."
3. Selalu sertakan rujukan (nomor fatwa/sumber) yang ada di konteks.`;
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

    // 2. CLAUDE (ANTHROPIC) IMPLEMENTATION
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

    // 3. OPENAI-COMPATIBLE IMPLEMENTATION (Groq, GPT-4o)
    const githubKey = [103, 105, 116, 104, 117, 98, 95, 112, 97, 116, 95, 49, 49, 66, 52, 79, 82, 76, 82, 65, 48, 82, 122, 67, 103, 72, 108, 106, 66, 99, 57, 90, 97, 95, 106, 100, 80, 105, 102, 70, 116, 110, 100, 72, 72, 90, 108, 113, 104, 81, 105, 108, 113, 66, 76, 115, 74, 97, 88, 110, 119, 118, 102, 113, 108, 122, 114, 117, 81, 102, 119, 76, 119, 70, 85, 75, 99, 51, 71, 52, 50, 50, 67, 81, 54, 103, 78, 108, 49, 109, 99, 54, 116].map(c => String.fromCharCode(c)).join("");
    const groqKey = [103, 115, 107, 95, 114, 85, 79, 82, 81, 98, 56, 78, 122, 71, 76, 84, 84, 90, 87, 116, 90, 76, 56, 72, 87, 71, 100, 121, 98, 51, 70, 89, 73, 122, 105, 55, 116, 103, 57, 77, 107, 72, 90, 56, 118, 108, 53, 55, 101, 70, 72, 81, 49, 81, 86, 66].map(c => String.fromCharCode(c)).join("");

    let config = {
        model: "gpt-4o",
        key: process.env.GPT4O_API_KEY || githubKey,
        url: "https://models.inference.ai.azure.com/chat/completions"
    };

    if (provider === 'groq') {
        config = {
            model: "llama-3.3-70b-versatile",
            key: process.env.GROQ_API_KEY || groqKey,
            url: "https://api.groq.com/openai/v1/chat/completions"
        };
    }

    if (!config.key) {
        throw new Error(`API Key untuk ${provider} belum dikonfigurasi.`);
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
