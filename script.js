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

const TRANSCRIPT_DATA = [
    { start: 0, ar: "في هذا العام قرر عبد الله ان يذهب الى مكه ليعتمر بصحبه زوجه", id: "Tahun ini, Abdullah memutuskan pergi ke Mekkah untuk Umrah bersama istrinya." },
    { start: 15, ar: "في اثناء الرحله نادى قائد الطائره بان الرحله قد دخلت ميقات الاحرام", id: "Di perjalanan, pilot mengumumkan bahwa pesawat telah memasuki kawasan Miqat Ihram." },
    { start: 25, ar: "الحج والعمره خمسه مواقيت مكانيه لا يجوز تجاوزها الا باحرام", id: "Haji dan Umrah memiliki lima miqat makani yang tidak boleh dilewati tanpa berihram." },
    { start: 30, ar: "والمواقيت هي ابيار علي رابغ السيل الكبير السعديه ذات عرق", id: "Miqat tersebut adalah: Dzulhulaifah, Al-Juhfah, Qarnul Manazil, Yalamlam, dan Dzat Irq." },
    { start: 39, ar: "اما من كان مكانه اقرب الى مكه من هذه المواقيت فمي قاته هو مكانه", id: "Bagi yang posisinya lebih dekat ke Mekkah dari miqat, maka miqatnya adalah tempat tinggalnya." },
    { start: 48, ar: "ومن مر بالمواقيت ولم يحرم فعليه الرجوع والاحرام منها", id: "Siapa yang melewati miqat tanpa ihram wajib kembali untuk berihram dari sana." },
    { start: 53, ar: "فان لم يرجع فعليه فديه وهي ذبح شات وتوزيعها على مساكين الحرم", id: "Jika tidak kembali, wajib membayar fidyah yaitu menyembelih kambing untuk fakir miskin Tanah Haram." },
    { start: 59, ar: "وعند الوصول للميقات يسن للمعتمر ازاله شعر الابط والعانه وتقليم الاظافر والاغتسال", id: "Saat tiba di miqat, disunnahkan membersihkan bulu ketiak & kemaluan, memotong kuku, dan mandi." },
    { start: 67, ar: "وتطيب البدن دون ملابس الاحرام", id: "Disunnahkan memakai wewangian di badan (bukan di kain ihram)." },
    { start: 71, ar: "ثم يقوم المعتمر بلبس ثياب الاحرام وهي الرداء والازار والنعل للرجال", id: "Kemudian memakai pakaian ihram: kain Rida dan Izar serta sandal bagi pria." },
    { start: 84, ar: "اما المراه فترتدي ملابسها العاديه على النقاب للوجه والقفازين لليد", id: "Wanita memakai pakaian biasa, namun dilarang memakai niqab dan sarung tangan." },
    { start: 101, ar: "بعد ان هيا عبد الله نفسه للاحرام بدا يتلو وزوجه امنيه قائلين لبيك اللهم عمره", id: "Setelah siap, Abdullah dan istrinya berniat: 'Labbaik Allahumma Umrah'." },
    { start: 110, ar: "وشرعا في التلبيه مع باقي المعتمرين على الطائره", id: "Mereka mulai bertalbiyah bersama jemaah lain di pesawat." },
    { start: 121, ar: "ثم بدا عبد الله في تذكر محظورات الاحرام فلا يجوز ازاله شيء من شعر البدن او الاظافر", id: "Abdullah mengingat larangan ihram: tidak boleh mencukur rambut atau memotong kuku." },
    { start: 142, ar: "او تطييب البدن او لباس الاحرام او تغطيه الراس او لبس اي مخيط مفصل على قدر العضو", id: "Tidak boleh memakai parfum, menutup kepala (pria), atau pakaian berjahit (pria)." },
    { start: 155, ar: "او الجماع او مباشره بشهوه عقد النكاح والخطبه", id: "Dilarang berhubungan suami istri, bermesraan, menikah, atau melamar." },
    { start: 162, ar: "او التعرض للصيد البري بالقتل او بالتنفير", id: "Dilarang berburu hewan darat atau mengganggunya." },
    { start: 168, ar: "وصلت الرحله وتوجه لبيت الله الحرام", id: "Perjalanan sampai, mereka menuju Baitullah (Masjidil Haram)." },
    { start: 174, ar: "حتى اذا ما شرعا في الطواف توقفا عن التلبيه", id: "Ketika hendak memulai Tawaf, mereka berhenti bertalbiyah." },
    { start: 181, ar: "وتوجه نحو ركن الحجر الاسود فجعل عبد الله رداءه الايمن تحت ابطه ليكشف عن كتفه الايمن", id: "Menuju Hajar Aswad, Abdullah melakukan Idhtiba (membuka bahu kanan)." },
    { start: 201, ar: "وعندما وصل للحجر الاسود اكتفيا بالاشاره نحوه نظرا للزحام", id: "Di Hajar Aswad, mereka cukup memberi isyarat karena kondisi padat." },
    { start: 221, ar: "بعد ذلك بدا الطواف من الحجر الاسود والطواف سبعه اشواط", id: "Kemudian memulai Tawaf dari Hajar Aswad sebanyak tujuh putaran." },
    { start: 235, ar: "واثناء الطواف له ان يدعو ويذكر الله بما شاء", id: "Selama Tawaf, boleh berdoa dan berzikir apa saja." },
    { start: 245, ar: "كان عبد الله على علم بانه كلما حاذا الركن الذي قبل الحجر الاسود يسن استلامه بيده", id: "Setiap melewati Rukun Yamani, disunnahkan mengusapnya." },
    { start: 255, ar: "فان لم يستطع فليمضي دون ان يشير اليه", id: "Jika tidak bisa mengusap Rukun Yamani, lewat saja tanpa isyarat." },
    { start: 263, ar: "ويسن القول وقتها ربنا اتنا في الدنيا حسناه وفي الاخره حسناه وقنا عذاب النار", id: "Antara Rukun Yamani dan Hajar Aswad disunnahkan membaca: 'Rabbana atina fid dunya hasanah...'." },
    { start: 280, ar: "وخلال طواف عبد الله حرص على ان لا يدافع او يزاحم", id: "Selama tawaf, Abdullah menjaga agar tidak mendorong orang lain." },
    { start: 290, ar: "كما حرص الا يطوف من داخل حجر اسماعيل لانه جزء من الكعبه", id: "Ia juga tidak masuk Hijr Ismail, karena itu bagian dari Ka'bah." },
    { start: 305, ar: "وفي نهايه الشوط السابع غطى عبد الله كتفه الايمن", id: "Di akhir putaran ketujuh, Abdullah kembali menutup bahu kanannya." },
    { start: 312, ar: "ثم ذهبا خلف مقام ابراهيم لصلاه ركعتي الطواف", id: "Lalu pergi ke belakang Maqam Ibrahim untuk shalat sunnah Tawaf dua rakaat." },
    { start: 322, ar: "اتجه عبد الله مع زوجه بعد الصلاه الى المسعى", id: "Setelah shalat, Abdullah dan istri menuju tempat Sa'i." },
    { start: 330, ar: "وفي طريقهما شربا من ماء زمزم كما سنى النبي عليه الصلاه والسلام", id: "Di jalan, mereka minum air Zamzam sebagaimana sunnah Nabi SAW." },
    { start: 339, ar: "ثم صعدا الى الصفا من باب الصفا وتل حين الصعود قوله تعالى", id: "Kemudian naik ke bukit Safa dan membaca firman Allah:" },
    { start: 346, ar: "ان الصفا والمروه من شعائر الله فمن حج البيت او اعتمر فلا جناح عليه ان يطوف بهما", id: "'Sesungguhnya Safa dan Marwah adalah sebahagian dari syi'ar Allah...' (QS. Al-Baqarah: 158)." },
    { start: 365, ar: "ثم وقفا يدعوان الله مستقبلين الكعبه", id: "Lalu mereka berdiri di Safa menghadap Ka'bah dan berdoa." },
    { start: 375, ar: "ثم بدا في النزول من الصفا والاتجاه نحو المروه مشيا", id: "Kemudian turun dari Safa berjalan menuju Marwah." },
    { start: 385, ar: "حتى اذا ما بلغ المروه كرر ما قيل عند الصفا دون قراءه الايه", id: "Di Marwah, mereka berdoa seperti di Safa, tanpa membaca ayat tadi." },
    { start: 395, ar: "ليكونا قد اتما شوطا من اصل سبعه اشواط", id: "Ini terhitung satu putaran (dari Safa ke Marwah)." },
    { start: 403, ar: "ثم عاد مره اخرى للصفا بالكيف نفسها وظل هكذا حتى الشوط السابع", id: "Kembali ke Safa (putaran kedua), begitu seterusnya hingga putaran ketujuh." },
    { start: 415, ar: "فصعد على المروه دون قول اي شيء", id: "Di akhir putaran ketujuh (di Marwah), selesai tanpa doa khusus." },
    { start: 422, ar: "وبهذا اتما سعيهما بعد السعي قام عبد الله بحلق شعر راسه", id: "Setelah Sa'i, Abdullah melakukan Tahallul dengan mencukur habis rambutnya." },
    { start: 432, ar: "اما زوجه فقد قامت بقس ما مقداره راس الاصبع من جميع نواحي شعرها", id: "Sedangkan istrinya memotong rambutnya seujung jari (sekitar 1-2 cm)." },
    { start: 445, ar: "وبهذا قد اتم عبد الله وزوجه مناسك العمره", id: "Dengan demikian, selesailah rangkaian ibadah Umrah Abdullah dan istrinya." }
];

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
    isPlaying: false,
    ytPlayer: null,
    ytReady: false,
    syncInterval: null,
    activeSubIdx: -1
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
        // Init video player when Tata Cara accordion opens
        if (item.querySelector('#yt-player') && typeof YT !== 'undefined') {
            initVideoPlayer();
        }
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

// --- VIDEO TRANSCRIPT PLAYER ---

function onYouTubeIframeAPIReady() {
    // Defer player creation until accordion is opened
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function initVideoPlayer() {
    if (state.ytPlayer) return;
    state.ytPlayer = new YT.Player('yt-player', {
        videoId: 'mJktplaNBkU',
        playerVars: { playsinline: 1, modestbranding: 1, rel: 0, cc_load_policy: 0 },
        events: {
            onReady: function () {
                state.ytReady = true;
                renderTranscript();
            },
            onStateChange: function (e) {
                if (e.data === YT.PlayerState.PLAYING) startSync();
                else stopSync();
            }
        }
    });
}

function renderTranscript() {
    const container = document.getElementById('transcript-container');
    if (!container) return;
    container.innerHTML = TRANSCRIPT_DATA.map((item, i) => {
        const m = Math.floor(item.start / 60);
        const s = Math.floor(item.start % 60);
        const time = m + ':' + String(s).padStart(2, '0');
        return '<div class="tr-card" id="sub-' + i + '" onclick="seekTo(' + item.start + ')">' +
            '<div class="tr-time">' + time + '</div>' +
            '<p class="tr-arabic">' + item.ar + '</p>' +
            '<p class="tr-indo">' + item.id + '</p>' +
        '</div>';
    }).join('');
}

function startSync() {
    if (state.syncInterval) return;
    state.syncInterval = setInterval(syncSubtitles, 250);
}

function stopSync() {
    if (state.syncInterval) {
        clearInterval(state.syncInterval);
        state.syncInterval = null;
    }
}

function syncSubtitles() {
    if (!state.ytPlayer || !state.ytReady) return;
    const t = state.ytPlayer.getCurrentTime();
    let idx = -1;
    for (let i = TRANSCRIPT_DATA.length - 1; i >= 0; i--) {
        if (TRANSCRIPT_DATA[i].start <= t) { idx = i; break; }
    }
    if (idx === state.activeSubIdx) return;

    if (state.activeSubIdx >= 0) {
        const prev = document.getElementById('sub-' + state.activeSubIdx);
        if (prev) prev.classList.remove('active');
    }
    if (idx >= 0) {
        const cur = document.getElementById('sub-' + idx);
        if (cur) {
            cur.classList.add('active');
            const container = document.getElementById('transcript-container');
            container.scrollTo({
                left: cur.offsetLeft - container.offsetLeft - 16,
                behavior: 'smooth'
            });
        }
    }
    state.activeSubIdx = idx;
}

function seekTo(time) {
    if (state.ytPlayer && state.ytReady) {
        state.ytPlayer.seekTo(time, true);
        state.ytPlayer.playVideo();
        triggerHaptic(20);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
