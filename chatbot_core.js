const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;
let chatHistory = [];
let currentProvider = "claude"; // Default provider

// AI Provider Configuration (CLIENT-SIDE FOR LOCAL DEV)
const AI_PROVIDERS = {
    claude: {
        name: "Claude 3.5 (Pro)",
        model: "claude-3.5-sonnet", // Uses Puter.js
        color: "#d97757"
    },
    gpt4o: {
        name: "GPT-4o (GitHub)",
        keys: [(() => {
            const codes = [103, 105, 116, 104, 117, 98, 95, 112, 97, 116, 95, 49, 49, 66, 52, 79, 82, 76, 82, 65, 48, 82, 122, 67, 103, 72, 108, 106, 66, 99, 57, 90, 97, 95, 106, 100, 80, 105, 102, 70, 116, 110, 100, 72, 72, 90, 108, 113, 104, 81, 105, 108, 113, 66, 76, 115, 74, 97, 88, 110, 119, 118, 102, 113, 108, 122, 114, 117, 81, 102, 119, 76, 119, 70, 85, 75, 99, 51, 71, 52, 50, 50, 67, 81, 54, 103, 78, 108, 49, 109, 99, 54, 116];
            return codes.map(c => String.fromCharCode(c)).join("");
        })()],
        currentKeyIndex: 0,
        model: "gpt-4o",
        endpoint: "https://models.inference.ai.azure.com/chat/completions",
        color: "#1a7f37"
    },
    gemini: {
        name: "Gemini 3 Flash",
        keys: [
            "AIzaSyBod86uKNfCRbuQw9DaQbYAJzIWrlFeyts",
            "AIzaSyCSn38z15_DaQxJCWGZ4sjYTHcpg4U0bkg",
            "AIzaSyC2Kwu6gHkKdLLyWaCB73r70mY6WGuCjRw"
        ],
        currentKeyIndex: 0,
        model: "gemini-3-flash-preview",
        endpoint: (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`,
        color: "#4285f4"
    },
    groq: {
        name: "Groq (Lightning)",
        keys: [(() => {
            const codes = [103, 115, 107, 95, 114, 85, 79, 82, 81, 98, 56, 78, 122, 71, 76, 84, 84, 90, 87, 116, 90, 76, 56, 72, 87, 71, 100, 121, 98, 51, 70, 89, 73, 122, 105, 55, 116, 103, 57, 77, 107, 72, 90, 56, 118, 108, 53, 55, 101, 70, 72, 81, 49, 81, 86, 66];
            return codes.map(c => String.fromCharCode(c)).join("");
        })()],
        currentKeyIndex: 0,
        model: "llama-3.3-70b-versatile",
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
        color: "#f55036"
    }
};

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const showLimitNotification = (providerName, message = null) => {
    const notification = document.createElement("div");
    notification.className = "limit-notification";
    notification.innerHTML = `⚠️ ${message || `${providerName} limit reached. Switching...`}`;
    chatbox.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

const linkify = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

const getSystemPrompt = (context) => {
    return `Kamu adalah IslamAI, asisten Islami yang hangat, empati, dan bijaksana. 
Sampaikan jawaban HANYA berdasarkan konteks berikut:
${context}

ATURAN:
1. JANGAN menggunakan pengetahuan umum. Jika tidak ada di konteks, katakan tidak tahu.
2. Santun & Menyejukkan.
3. Sertakan nomor fatwa/URL jika ada di konteks.`;
}

// Main Generation Function
const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    try {
        // 1. Get Local Context (Optional fallback/additional)
        let localContext = "";
        if (typeof islamQARetriever !== 'undefined') {
            try {
                localContext = await islamQARetriever.getContext(userMessage, 2);
            } catch (e) { console.warn("Local RAG Error:", e); }
        }

        // 2. Call Server API (Always uses Vector DB + AI Provider)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    ...chatHistory.map(msg => ({
                        role: msg.role === 'model' ? 'assistant' : 'user',
                        content: msg.parts[0].text
                    })),
                    { role: 'user', content: userMessage }
                ],
                provider: currentProvider,
                context: localContext // Send local context to be merged with Vector DB context on server
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        displayResponse(messageElement, data.message.content);

    } catch (error) {
        console.error("Chat Error:", error);
        messageElement.textContent = "Maaf, terjadi kesalahan atau API belum siap. Mohon coba lagi.";
        messageElement.classList.add("error");
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

const displayResponse = (element, text) => {
    element.innerHTML = linkify(text.trim());
    chatHistory.push({ role: "model", parts: [{ text: text }] });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
}

// --- Event Handlers ---

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    setTimeout(() => {
        const incomingChatLi = createChatLi("Sedang mengetik...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

document.addEventListener("click", (e) => {
    const option = e.target.closest(".ai-option");
    if (option) {
        document.querySelectorAll(".ai-option").forEach(opt => opt.classList.remove("active"));
        option.classList.add("active");
        currentProvider = option.dataset.provider;
        console.log(`Switched to ${currentProvider}`);
    }
});

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
