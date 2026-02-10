/**
 * AL HARAMAIN - Panduan Umrah Digital
 * Premium Ritual Logic & UI Controller
 */

const DATA_DOA = {
    tawaf: [
        {
            title: "Doa Awal Tawaf / Istilam",
            arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
            latin: "Bismillahi wallahu akbar",
            arti: "Dengan nama Allah dan Allah Maha Besar. (Dibaca setiap memulai putaran di Hajar Aswad).",
            audio: "assets/audio/tawaf_start.mp3"
        },
        {
            title: "Dzikir Umum Tawaf",
            arabic: "سُبْحَانَ اللهِ وَالْحَمْدُ ِللهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ",
            latin: "Subhanallah, walhamdulillah, wa laa ilaha illallah, wallahu akbar",
            arti: "Maha Suci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, Allah Maha Besar.",
            audio: "assets/audio/tawaf_general.mp3"
        },
        {
            title: "Doa Sapu Jagat (Akhir Putaran)",
            arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
            latin: "Rabbana atina fid dunya hasanah wa fil akhirati hasanah wa qina 'adzaban naar.",
            arti: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat dan peliharalah kami dari siksa neraka.",
            audio: "assets/audio/tawaf_end.mp3"
        }
    ],
    maqam: {
        arabic: "وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى",
        latin: "Wattakhidzu min maqami Ibrahima mushalla.",
        arti: "Dan jadikanlah sebagian Maqam Ibrahim tempat shalat. (Q.S Al-Baqarah: 125)",
        audio: "assets/audio/maqam.mp3"
    },
    sai: {
        arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ",
        latin: "Innash shafa wal marwata min sya'airillah.",
        arti: "Sesungguhnya Safa dan Marwah adalah sebahagian dari syi'ar Allah.",
        audio: "assets/audio/sai.mp3"
    },
    tahallul: {
        arabic: "اَللَّهُمَّ اغْفِرْ لِلْمُحَلِّقِيْنَ",
        latin: "Allahummaghfir lil muhalliqin (3x).",
        arti: "Ya Allah, ampunilah mereka yang mencukur habis rambutnya. (H.R Bukhari & Muslim)",
        audio: "assets/audio/tahallul.mp3"
    }
};

const state = {
    activeTab: 'panduan',
    currentStep: 'ihram',
    counts: {
        tawaf: 0,
        sai: 0
    },
    maxCounts: {
        tawaf: 7,
        sai: 7
    },
    audio: null,
    isPlaying: false
};

// --- CORE FUNCTIONS ---

function init() {
    renderDoa('tawaf', 0);
    renderDoa('maqam');
    renderDoa('sai');
    renderDoa('tahallul');
    
    // Add event listeners for haptics if available
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => triggerHaptic(20));
    });
}

function triggerHaptic(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function switchTab(tab) {
    state.activeTab = tab;
    document.getElementById('nav-panduan').classList.toggle('active', tab === 'panduan');
    document.getElementById('nav-rukun').classList.toggle('active', tab === 'rukun');
    
    document.getElementById('view-panduan').classList.toggle('hidden', tab !== 'panduan');
    document.getElementById('view-rukun').classList.toggle('hidden', tab !== 'rukun');
}

// --- RITUAL LOGIC ---

function incrementCounter(type) {
    if (state.counts[type] < state.maxCounts[type]) {
        state.counts[type]++;
        updateCounterUI(type);
        triggerHaptic(60);
        stopAudio();

        if (type === 'tawaf') {
            handleTawafRotation();
        } else if (type === 'sai') {
            handleSaiRotation();
        }
    }
}

function decrementCounter(type) {
    if (state.counts[type] > 0) {
        state.counts[type]--;
        updateCounterUI(type);
        triggerHaptic(30);
        
        // Hide next button if count goes below max
        if (state.counts[type] < state.maxCounts[type]) {
            document.getElementById(`btn-next-${type}`).classList.add('hidden');
        }
    }
}

function updateCounterUI(type) {
    const numDisplay = document.getElementById(`num-${type}`);
    const ring = document.getElementById(`ring-${type}`);
    const circumference = 628; // 2 * PI * 100
    
    numDisplay.innerText = state.counts[type];
    
    const percent = state.counts[type] / state.maxCounts[type];
    const offset = circumference - (percent * circumference);
    ring.style.strokeDashoffset = offset;
}

function handleTawafRotation() {
    const count = state.counts.tawaf;
    showToast(`Putaran ke-${count} dimulai`);
    
    const badge = document.getElementById('badge-tawaf');
    if (count >= 1 && count <= 3) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    let doaIdx = 1; // Default general dzikir
    if (count === 1) doaIdx = 0; // First round
    if (count === 7) doaIdx = 2; // Final round
    
    renderDoa('tawaf', doaIdx);
    document.getElementById('doa-title-tawaf').innerText = DATA_DOA.tawaf[doaIdx].title;

    if (count === 7) {
        document.getElementById('btn-next-tawaf').classList.remove('hidden');
        showToast("Tawaf Selesai. Lanjut ke Maqam Ibrahim.");
    }
}

function handleSaiRotation() {
    const count = state.counts.sai;
    const directionEl = document.getElementById('sai-direction-text');
    
    const isOdd = count % 2 !== 0;
    const direction = isOdd ? "Bukit Marwah" : "Bukit Safa";
    directionEl.innerText = `Menuju ${direction}`;
    
    showToast(`Perjalanan ke-${count}`);

    if (count === 7) {
        document.getElementById('btn-next-sai').classList.remove('hidden');
        showToast("Sa'i Selesai. Lanjut ke Tahallul.");
    }
}

function renderDoa(section, index = null) {
    const container = document.getElementById(`content-${section}`);
    if (!container) return;

    const data = index !== null ? DATA_DOA[section][index] : DATA_DOA[section];
    
    container.innerHTML = `
        <p class="doa-arabic ${data.arabic.length > 50 ? 'small' : ''}">${data.arabic}</p>
        <p class="doa-latin">${data.latin}</p>
        <p class="doa-translation">"${data.arti}"</p>
    `;
}

// --- NAVIGATION ---

function finishStep(current) {
    stopAudio();
    const sequence = ['ihram', 'tawaf', 'maqam', 'sai', 'tahallul'];
    const currentIdx = sequence.indexOf(current);
    
    if (currentIdx !== -1 && currentIdx < sequence.length - 1) {
        const next = sequence[currentIdx + 1];
        
        // Update Stepper
        const currentDot = document.getElementById(`dot-${current}`);
        currentDot.classList.remove('active');
        currentDot.classList.add('completed');
        
        const nextDot = document.getElementById(`dot-${next}`);
        nextDot.classList.add('active');
        
        // Switch Cards
        document.getElementById(`card-${current}`).classList.add('hidden');
        document.getElementById(`card-${next}`).classList.remove('hidden');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goBack(target) {
    stopAudio();
    const sequence = ['ihram', 'tawaf', 'maqam', 'sai', 'tahallul'];
    const current = sequence.find(s => !document.getElementById(`card-${s}`).classList.contains('hidden'));
    
    document.getElementById(`card-${current}`).classList.add('hidden');
    document.getElementById(`card-${target}`).classList.remove('hidden');
    
    document.getElementById(`dot-${current}`).classList.remove('active');
    document.getElementById(`dot-${target}`).classList.add('active');
    document.getElementById(`dot-${target}`).classList.remove('completed');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function finishUmrah() {
    state.finished = true;
    document.getElementById('tahallul-guide').classList.add('hidden');
    document.getElementById('success-area').classList.remove('hidden');
    document.getElementById('btn-finish').classList.add('hidden');
    document.getElementById('btn-back-tahallul').classList.add('hidden');
    document.getElementById('btn-reset').classList.remove('hidden');
    
    document.getElementById('dot-tahallul').classList.add('completed');
    document.getElementById('dot-tahallul').classList.remove('active');
    
    showToast("Alhamdulillah! Umrah Anda Selesai.");
    triggerHaptic(100);
}

function resetProgress() {
    if (!confirm("Ingin mengulangi panduan dari awal?")) return;
    
    state.counts = { tawaf: 0, sai: 0 };
    updateCounterUI('tawaf');
    updateCounterUI('sai');
    
    document.querySelectorAll('.step-dot').forEach(dot => {
        dot.classList.remove('active', 'completed');
    });
    document.querySelectorAll('.ritual-card').forEach(card => card.classList.add('hidden'));
    
    document.getElementById('dot-ihram').classList.add('active');
    document.getElementById('card-ihram').classList.remove('hidden');
    
    document.getElementById('tahallul-guide').classList.remove('hidden');
    document.getElementById('success-area').classList.add('hidden');
    document.getElementById('btn-finish').classList.remove('hidden');
    document.getElementById('btn-back-tahallul').classList.remove('hidden');
    document.getElementById('btn-reset').classList.add('hidden');
    
    init();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- UI HELPERS ---

function toggleAccordion(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close others
    document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));
    
    if (!isActive) {
        item.classList.add('active');
    }
}

function toggleAudio(section) {
    const btn = document.getElementById(`btn-play-${section}`);
    let data;
    
    if (section === 'tawaf') {
        const count = state.counts.tawaf;
        let idx = 1;
        if (count <= 1) idx = 0;
        if (count === 7) idx = 2;
        data = DATA_DOA.tawaf[idx];
    } else {
        data = DATA_DOA[section];
    }

    if (state.audio && state.isPlaying) {
        stopAudio();
    } else {
        state.audio = new Audio(data.audio);
        state.audio.play().then(() => {
            state.isPlaying = true;
            btn.classList.add('active');
            state.audio.onended = () => {
                state.isPlaying = false;
                btn.classList.remove('active');
            };
        }).catch(err => {
            console.warn("Audio file not found. This is expected in demo mode.");
            showToast("Audio belum tersedia (Demo)");
        });
    }
}

function stopAudio() {
    if (state.audio) {
        state.audio.pause();
        state.audio.currentTime = 0;
    }
    state.isPlaying = false;
    document.querySelectorAll('.audio-toggle').forEach(b => b.classList.remove('active'));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
