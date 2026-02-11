const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;
let chatHistory = [];
let currentProvider = "claude"; // Default provider (Claude 3.5 Sonnet)

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
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
${context || "Gunakan pengetahuan umum Islami jika konteks tidak spesifik, namun utamakan rujukan IslamQA."}

ATURAN:
1. Santun & Menyejukkan.
2. Sertakan nomor fatwa/URL jika ada di konteks.
3. Jangan mengarang informasi.`;
}

const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    try {
        let context = "";
        if (typeof islamQARetriever !== 'undefined') {
            context = await islamQARetriever.getContext(userMessage, 3);
        }

        // 1. CLAUDE via PUTER (Frontend)
        if (currentProvider === "claude") {
            const messages = [{ role: "system", content: getSystemPrompt(context) }];
            chatHistory.forEach(msg => {
                messages.push({
                    role: msg.role === "model" ? "assistant" : "user",
                    content: msg.parts[0].text
                });
            });

            const response = await puter.ai.chat(messages, { model: 'claude-3.5-sonnet' });
            const responseText = response.message.content;
            messageElement.innerHTML = linkify(responseText.trim());
            chatHistory.push({ role: "model", parts: [{ text: responseText }] });
        }
        // 2. OTHER PROVIDERS via BACKEND
        else {
            const apiMessages = chatHistory.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.parts[0].text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    provider: currentProvider,
                    context: context
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server Error');

            const responseText = data.message.content;
            messageElement.innerHTML = linkify(responseText.trim());
            chatHistory.push({ role: "model", parts: [{ text: responseText }] });
        }
    } catch (error) {
        console.error("Chat Error:", error);
        messageElement.textContent = "Maaf, terjadi kesalahan. Mohon coba lagi.";
        messageElement.classList.add("error");
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

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

// AI Selector Click Handler
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
