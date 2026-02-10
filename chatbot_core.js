const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const aiSelector = document.querySelector(".ai-selector");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;
let chatHistory = [];

// AI Provider Configuration
const AI_PROVIDERS = {
    gemini: {
        name: "Gemini Flash",
        keys: [
            "AIzaSyBod86uKNfCRbuQw9DaQbYAJzIWrlFeyts",
            "AIzaSyCSn38z15_DaQxJCWGZ4sjYTHcpg4U0bkg",
            "AIzaSyC2Kwu6gHkKdLLyWaCB73r70mY6WGuCjRw"
        ],
        currentKeyIndex: 0,
        model: "gemini-3-flash-preview",
        endpoint: (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`
    },
    deepseek: {
        name: "DeepSeek",
        keys: ["sk-564151247ee84356bfffc6133be76431"],
        currentKeyIndex: 0,
        model: "deepseek-chat",
        endpoint: () => "https://api.deepseek.com/v1/chat/completions"
    }
};

let currentProvider = "gemini"; // Default provider

const linkify = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const showLimitNotification = (provider) => {
    const notification = document.createElement("div");
    notification.className = "limit-notification";
    notification.innerHTML = `⚠️ ${AI_PROVIDERS[provider].name} mencapai limit. Mencoba provider lain...`;
    chatbox.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

const generateResponseGemini = (chatElement, retryCount = 0) => {
    const provider = AI_PROVIDERS.gemini;
    const API_KEY = provider.keys[provider.currentKeyIndex];
    const API_URL = provider.endpoint(API_KEY);
    const messageElement = chatElement.querySelector("p");

    const systemInstruction = `Kamu adalah IslamAI, asisten Islami yang hangat, empati, dan bijaksana. Berlakulah seperti seorang pembimbing ibadah yang ramah dan menyejukkan hati. 

ATURAN PENTING DALAM MENJAWAB:
1.  **GREETING & DO'A**: Hanya berikan salam (Assalamu'alaikum) dan doa pembuka jika ini adalah pesan pertama dalam percakapan. Jika diskusi berlanjut dan user bertanya lagi, LANGSUNG berikan jawaban inti tanpa mengulang salam formal atau doa pembuka yang sama agar percakapan terasa lebih mengalir (fluid).
2.  **AKURASI NOMOR FATWA**: DILARANG KERAS mengarang (hallucination) Nomor Fatwa. Jika fatwa terkait tidak ditemukan atau Anda ragu dengan nomor spesifiknya, JANGAN MENGARANG nomor tersebut. Dalam kondisi ini, sampaikan inti jawabannya saja secara bijak tanpa mencantumkan nomor fatwa.
3.  **REFERENSI**: WAJIB menggunakan rujukan utama dari https://islamqa.info/ (Syeikh Muhammad Shalih Al-Munajjid).
4.  **DALIL**: Jika mengutip Al-Qur'an atau Hadits, WAJIB sertakan **TEKS ARAB ASLI**, baru kemudian terjemahannya.
5.  **HUKUM/FATWA**: Jika menyampaikan hukum atau fatwa, WAJIB sertakan **NOMOR FATWA YANG BENAR** dan **LINK URL LENGKAP** yang bisa diklik menuju halaman sumber di islamqa.info.
6.  **PENUTUP**: Gunakan kalimat penutup yang mendoakan dan santun.`;

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: chatHistory
        })
    }

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error(`Gemini Error:`, data.error);

                if ((data.error.code === 429 || data.error.status === "RESOURCE_EXHAUSTED") && retryCount < provider.keys.length - 1) {
                    provider.currentKeyIndex = (provider.currentKeyIndex + 1) % provider.keys.length;
                    showLimitNotification("gemini");
                    generateResponseGemini(chatElement, retryCount + 1);
                    return;
                }

                // Switch to DeepSeek if all Gemini keys exhausted
                if (retryCount >= provider.keys.length - 1) {
                    showLimitNotification("gemini");
                    currentProvider = "deepseek";
                    generateResponseDeepSeek(chatElement);
                    return;
                }

                messageElement.textContent = `Maaf, sistem sedang sibuk. Silakan coba lagi nanti.\n(Pesan: ${data.error.message})`;
                messageElement.classList.add("error");
            } else {
                let responseText = data.candidates[0].content.parts[0].text;
                messageElement.innerHTML = linkify(responseText.trim());
                chatHistory.push({ role: "model", parts: [{ text: responseText }] });
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
            }
        }).catch((error) => {
            console.error("Fetch Error:", error);
            messageElement.classList.add("error");
            messageElement.textContent = "Maaf, koneksi terputus. Mohon periksa internet Anda.";
        }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const generateResponseDeepSeek = (chatElement) => {
    const provider = AI_PROVIDERS.deepseek;
    const API_KEY = provider.keys[provider.currentKeyIndex];
    const API_URL = provider.endpoint();
    const messageElement = chatElement.querySelector("p");

    const systemMessage = `Kamu adalah IslamAI, asisten Islami yang hangat, empati, dan bijaksana. Berlakulah seperti seorang pembimbing ibadah yang ramah dan menyejukkan hati. 

ATURAN PENTING DALAM MENJAWAB:
1.  **GREETING & DO'A**: Hanya berikan salam (Assalamu'alaikum) dan doa pembuka jika ini adalah pesan pertama dalam percakapan. Jika diskusi berlanjut dan user bertanya lagi, LANGSUNG berikan jawaban inti tanpa mengulang salam formal atau doa pembuka yang sama agar percakapan terasa lebih mengalir (fluid).
2.  **AKURASI NOMOR FATWA**: DILARANG KERAS mengarang (hallucination) Nomor Fatwa. Jika fatwa terkait tidak ditemukan atau Anda ragu dengan nomor spesifiknya, JANGAN MENGARANG nomor tersebut. Dalam kondisi ini, sampaikan inti jawabannya saja secara bijak tanpa mencantumkan nomor fatwa.
3.  **REFERENSI**: WAJIB menggunakan rujukan utama dari https://islamqa.info/ (Syeikh Muhammad Shalih Al-Munajjid).
4.  **DALIL**: Jika mengutip Al-Qur'an atau Hadits, WAJIB sertakan **TEKS ARAB ASLI**, baru kemudian terjemahannya.
5.  **HUKUM/FATWA**: Jika menyampaikan hukum atau fatwa, WAJIB sertakan **NOMOR FATWA YANG BENAR** dan **LINK URL LENGKAP** yang bisa diklik menuju halaman sumber di islamqa.info.
6.  **PENUTUP**: Gunakan kalimat penutup yang mendoakan dan santun.`;

    const messages = [{ role: "system", content: systemMessage }];
    chatHistory.forEach(msg => {
        messages.push({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.parts[0].text
        });
    });

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: provider.model,
            messages: messages,
            temperature: 0.7
        })
    }

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error(`DeepSeek Error:`, data.error);
                messageElement.textContent = `Maaf, sistem sedang sibuk. Silakan coba lagi nanti.\n(Pesan: ${data.error.message})`;
                messageElement.classList.add("error");
            } else {
                let responseText = data.choices[0].message.content;
                messageElement.innerHTML = linkify(responseText.trim());
                chatHistory.push({ role: "model", parts: [{ text: responseText }] });
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
            }
        }).catch((error) => {
            console.error("Fetch Error:", error);
            messageElement.classList.add("error");
            messageElement.textContent = "Maaf, koneksi terputus. Mohon periksa internet Anda.";
        }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const generateResponse = (chatElement) => {
    if (currentProvider === "gemini") {
        generateResponseGemini(chatElement);
    } else {
        generateResponseDeepSeek(chatElement);
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

// AI Selector Event
document.querySelectorAll(".ai-option").forEach(option => {
    option.addEventListener("click", () => {
        document.querySelectorAll(".ai-option").forEach(opt => opt.classList.remove("active"));
        option.classList.add("active");
        currentProvider = option.dataset.provider;
        console.log(`Switched to ${AI_PROVIDERS[currentProvider].name}`);
    });
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
