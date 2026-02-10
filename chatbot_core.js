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
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
    const messageElement = chatElement.querySelector("p");

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `Kamu adalah IslamAI, asisten Islami pintar. Jawab pertanyaan seputar Islam, Umrah, Haji, dan kehidupan sehari-hari Muslim berdasarkan Al-Qur'an dan Sunnah dengan sopan, bijak, dan ringkas. WAJIB menggunakan rujukan fatwa utama dari https://islamqa.info/ (Syeikh Muhammad Shalih Al-Munajjid). Kutip dalil atau pandangan ulama dari situs tersebut jika relevan. Jangan jawab topik di luar Islam/Umrah. Pertanyaan: ${userMessage}`
                }]
            }]
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
                messageElement.textContent = responseText.trim();
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
