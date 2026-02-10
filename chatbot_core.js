const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

// IMPORTANT: Masukkan API Key Google Gemini Anda di sini agar Chatbot berfungsi.
// Dapatkan API Key Gratis di: https://aistudio.google.com/app/apikey
const API_KEY = "AIzaSyBod86uKNfCRbuQw9DaQbYAJzIWrlFeyts";

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement) => {
    // Switching to gemini-pro-latest which is confirmed available on this key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${API_KEY}`;
    const messageElement = chatElement.querySelector("p");

    // Define the properties and message for the API request
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

    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error("Gemini API Error:", data.error);
                if (API_KEY === "YOUR_API_KEY_HERE") {
                    messageElement.textContent = "Mohon maaf, API Key belum diatur.";
                } else {
                    messageElement.textContent = `Terjadi kesalahan pada AI. Silakan refresh halaman.\n(Teknis: ${data.error.message})`;
                }
                messageElement.classList.add("error");
            } else {
                let responseText = data.candidates[0].content.parts[0].text;
                messageElement.textContent = responseText.trim();
            }
        }).catch((error) => {
            console.error("Fetch/Network Error:", error);
            messageElement.classList.add("error");
            messageElement.textContent = "Maaf, ada gangguan koneksi internet. Coba lagi nanti.";
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
