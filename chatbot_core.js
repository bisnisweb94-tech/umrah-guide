const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

// List API Keys untuk rotasi jika satu key kena limit
const API_KEYS = [
    "AIzaSyBod86uKNfCRbuQw9DaQbYAJzIWrlFeyts",
    "AIzaSyCSn38z15_DaQxJCWGZ4sjYTHcpg4U0bkg",
    "AIzaSyC2Kwu6gHkKdLLyWaCB73r70mY6WGuCjRw"
];
let currentKeyIndex = 0;
let chatHistory = []; // Untuk menyimpan riwayat percakapan agar AI punya konteks

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

const generateResponse = (chatElement, retryCount = 0) => {
    const API_KEY = API_KEYS[currentKeyIndex];
    // Back to gemini-3-flash-preview for speed and quota
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
    const messageElement = chatElement.querySelector("p");

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: {
                parts: [{
                    text: `Kamu adalah IslamAI, asisten Islami yang hangat, empati, dan bijaksana. Berlakulah seperti seorang pembimbing ibadah yang ramah dan menyejukkan hati. 

ATURAN PENTING DALAM MENJAWAB:
1.  **GREETING & DO'A**: Hanya berikan salam (Assalamu'alaikum) dan doa pembuka jika ini adalah pesan pertama dalam percakapan. Jika diskusi berlanjut dan user bertanya lagi, LANGSUNG berikan jawaban inti tanpa mengulang salam formal atau doa pembuka yang sama agar percakapan terasa lebih mengalir (fluid).
2.  **AKURASI NOMOR FATWA**: DILARANG KERAS mengarang (hallucination) Nomor Fatwa. Jika fatwa terkait tidak ditemukan atau Anda ragu dengan nomor spesifiknya, JANGAN MENGARANG nomor tersebut. Dalam kondisi ini, sampaikan inti jawabannya saja secara bijak tanpa mencantumkan nomor fatwa.
3.  **REFERENSI**: WAJIB menggunakan rujukan utama dari https://islamqa.info/ (Syeikh Muhammad Shalih Al-Munajjid).
4.  **DALIL**: Jika mengutip Al-Qur'an atau Hadits, WAJIB sertakan **TEKS ARAB ASLI**, baru kemudian terjemahannya.
5.  **HUKUM/FATWA**: Jika menyampaikan hukum atau fatwa, WAJIB sertakan **NOMOR FATWA YANG BENAR** dan **LINK URL LENGKAP** yang bisa diklik menuju halaman sumber di islamqa.info.
6.  **PENUTUP**: Gunakan kalimat penutup yang mendoakan dan santun.`
                }]
            },
            contents: chatHistory
        })
    }

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error(`Error with Key ${currentKeyIndex}:`, data.error);

                // Jika error Quota (429) dan masih ada key cadangan
                if ((data.error.code === 429 || data.error.status === "RESOURCE_EXHAUSTED") && retryCount < API_KEYS.length - 1) {
                    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
                    console.log(`Rotating to Key ${currentKeyIndex}...`);
                    generateResponse(chatElement, retryCount + 1);
                    return;
                }

                messageElement.textContent = `Maaf, sistem sedang sibuk. Silakan coba lagi nanti.\n(Pesan: ${data.error.message})`;
                messageElement.classList.add("error");
            } else {
                let responseText = data.candidates[0].content.parts[0].text;
                messageElement.innerHTML = linkify(responseText.trim());

                // Simpan jawaban AI ke history
                chatHistory.push({ role: "model", parts: [{ text: responseText }] });
                // Batasi history agar tidak terlalu panjang (misal 10 turn)
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
            }
        }).catch((error) => {
            console.error("Fetch Error:", error);
            messageElement.classList.add("error");
            messageElement.textContent = "Maaf, koneksi terputus. Mohon periksa internet Anda.";
        }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Simpan pesan user ke history
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    // Display "Thinking..." message while waiting for the response
    setTimeout(() => {
        const incomingChatLi = createChatLi("Sedang mengetik...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
