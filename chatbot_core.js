const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;
let chatHistory = [];
let currentProvider = "gemini"; // Default provider

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

// Main Generation Function — semua lewat /api/chat (server-side)
const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: chatHistory.map(msg => ({
                    role: msg.role === 'model' ? 'assistant' : 'user',
                    content: msg.parts[0].text
                })),
                provider: currentProvider
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
        }

        const data = await response.json();
        const responseText = data.message.content;

        messageElement.innerHTML = linkify(responseText.trim());
        chatHistory.push({ role: "model", parts: [{ text: responseText }] });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

    } catch (error) {
        console.error("Chat Error:", error);
        messageElement.textContent = "Maaf, terjadi kesalahan koneksi ke server. Mohon coba lagi.";
        messageElement.classList.add("error");
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
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
        const incomingChatLi = createChatLi("Mencari jawaban...", "incoming");
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
