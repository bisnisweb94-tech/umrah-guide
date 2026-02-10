
import json
import os

# Kategori Fatwa
CATEGORIES = {
    "aqidah": "Aqidah & Tauhid",
    "shalat": "Shalat & Thaharah",
    "puasa": "Puasa Ramadhan",
    "zakat": "Zakat & Sedekah",
    "umrah": "Haji & Umrah",
    "adab": "Adab & Doa Sehari-hari",
    "quran": "Al-Qur'an & Hadits"
}

# Database Fatwa (50 Fatwa Pilihan)
fatwas = [
    # --- AQIDAH (5) ---
    {
        "id": "1",
        "title_id": "Rukun Iman",
        "question_id": "Apa saja rukun iman?",
        "answer_id": "Rukun iman ada enam: 1. Iman kepada Allah, 2. Malaikat-Nya, 3. Kitab-kitab-Nya, 4. Rasul-rasul-Nya, 5. Hari Akhir, 6. Qadha dan Qadar yang baik maupun buruk.",
        "url": "https://islamqa.info/id/answers/1084",
        "category": "aqidah",
        "keywords": ["rukun", "iman", "percaya", "allah", "malaikat"]
    },
    {
        "id": "2",
        "title_id": "Makna Tauhid",
        "question_id": "Apa itu tauhid?",
        "answer_id": "Tauhid adalah mengesakan Allah dalam ibadah, rububiyah (penciptaan/pengaturan), dan asma wa shifat (nama dan sifat-Nya). Lawan dari tauhid adalah syirik.",
        "url": "https://islamqa.info/id/answers/49030",
        "category": "aqidah",
        "keywords": ["tauhid", "syirik", "esa", "tuhan"]
    },
    {
        "id": "3",
        "title_id": "Bahaya Syirik",
        "question_id": "Apa dosa paling besar?",
        "answer_id": "Dosa paling besar adalah syirik (menyekutukan Allah). Allah tidak akan mengampuni dosa syirik jika pelakunya meninggal dunia sebelum bertobat. (QS. An-Nisa: 48)",
        "url": "https://islamqa.info/id/answers/34817",
        "category": "aqidah",
        "keywords": ["syirik", "dosa", "besar", "musyrik"]
    },
    {
        "id": "4",
        "title_id": "Syarat Diterimanya Amal",
        "question_id": "Apa syarat amal diterima?",
        "answer_id": "Syarat diterimanya amal ada dua: 1. Ikhlas karena Allah semata, 2. Ittiba' (mengikuti tuntunan) Nabi Muhammad shallallahu 'alaihi wa sallam.",
        "url": "https://islamqa.info/id/answers/12204",
        "category": "aqidah",
        "keywords": ["syarat", "amal", "terima", "ikhlas", "ittiba"]
    },
    {
        "id": "5",
        "title_id": "Makna Laa Ilaaha Illallah",
        "question_id": "Apa arti kalimat syahadat?",
        "answer_id": "Laa ilaaha illallah artinya tidak ada sesembahan yang berhak disembah dengan benar kecuali Allah. Ini menafikan segala sesembahan selain Allah dan menetapkan ibadah hanya untuk Allah.",
        "url": "https://islamqa.info/id/answers/13529",
        "category": "aqidah",
        "keywords": ["syahadat", "arti", "makna", "tauhid"]
    },

    # --- SHALAT & THAHARAH (10) ---
    {
        "id": "6",
        "title_id": "Syarat Sah Shalat",
        "question_id": "Apa syarat sah shalat?",
        "answer_id": "Syarat sah shalat: 1. Masuk waktu shalat, 2. Suci dari hadats besar dan kecil, 3. Menutup aurat, 4. Menghadap kiblat, 5. Niat.",
        "url": "https://islamqa.info/id/answers/21516",
        "category": "shalat",
        "keywords": ["syarat", "sah", "shalat", "wudhu", "kiblat"]
    },
    {
        "id": "7",
        "title_id": "Tata Cara Wudhu",
        "question_id": "Bagaimana cara wudhu yang benar?",
        "answer_id": "Tata cara wudhu: Niat, membasuh telapak tangan, berkumur, istinsyaq (menghirup air ke hidung), membasuh wajah, membasuh tangan sampai siku, mengusap kepala, membasuh kaki sampai mata kaki. Tertib (berurutan).",
        "url": "https://islamqa.info/id/answers/11497",
        "category": "shalat",
        "keywords": ["cara", "wudhu", "benar", "tertib", "sunnah"]
    },
    {
        "id": "8",
        "title_id": "Pembatal Wudhu",
        "question_id": "Apa saja yang membatalkan wudhu?",
        "answer_id": "Pembatal wudhu: 1. Keluar sesuatu dari dua jalan (kubul/dubur), 2. Hilang akal (tidur nyenyak/gila/pingsan), 3. Menyentuh kemaluan tanpa alas, 4. Makan daging unta.",
        "url": "https://islamqa.info/id/answers/14321",
        "category": "shalat",
        "keywords": ["batal", "wudhu", "kentut", "tidur", "unta"]
    },
    {
        "id": "9",
        "title_id": "Tayamum",
        "question_id": "Kapan boleh tayamum?",
        "answer_id": "Tayamum diperbolehkan jika: 1. Tidak ada air setelah berusaha mencari, 2. Ada air tapi tidak cukup, 3. Sakit yang membahayakan jika terkena air, 4. Cuaca sangat dingin yang membahayakan.",
        "url": "https://islamqa.info/id/answers/11621",
        "category": "shalat",
        "keywords": ["tayamum", "debu", "tanah", "air", "sakit"]
    },
    {
        "id": "10",
        "title_id": "Shalat Jama' Qashar",
        "question_id": "Kapan boleh menjama' dan mengqashar shalat?",
        "answer_id": "Boleh menjama' (menggabung) dan mengqashar (meringkas 4 rakaat jadi 2) shalat ketika dalam perjalanan (safar) yang jaraknya sekitar 80 km atau lebih. Jama' boleh taqdim atau ta'khir.",
        "url": "https://islamqa.info/id/answers/105109",
        "category": "shalat",
        "keywords": ["jama", "qashar", "safar", "perjalanan", "musafir"]
    },
    {
        "id": "11",
        "title_id": "Shalat Dhuha",
        "question_id": "Kapan waktu shalat dhuha?",
        "answer_id": "Waktu shalat Dhuha dimulai setelah matahari meninggi (sekitar 15 menit setelah terbit) sampai sesaat sebelum waktu Zhuhur (waktu zawal).",
        "url": "https://islamqa.info/id/answers/22389",
        "category": "shalat",
        "keywords": ["dhuha", "pagi", "matahari", "sunnah"]
    },
    {
        "id": "12",
        "title_id": "Sujud Sahwi",
        "question_id": "Kapan harus sujud sahwi?",
        "answer_id": "Sujud sahwi dilakukan jika: 1. Menambah rakaat/gerakan karena lupa, 2. Mengurangi rukun/wajib karena lupa, 3. Ragu jumlah rakaat. Dilakukan dengan dua kali sujud sebelum atau sesudah salam.",
        "url": "https://islamqa.info/id/answers/22650",
        "category": "shalat",
        "keywords": ["sujud", "sahwi", "lupa", "rakaat", "ragu"]
    },
    {
        "id": "13",
        "title_id": "Shalat Witir",
        "question_id": "Berapa rakaat shalat witir?",
        "answer_id": "Shalat witir minimal 1 rakaat, dan bisa 3, 5, 7, 9, atau 11 rakaat. Waktunya setelah shalat Isya sampai sebelum Subuh.",
        "url": "https://islamqa.info/id/answers/46544",
        "category": "shalat",
        "keywords": ["witir", "ganjil", "malam", "rakaat"]
    },
    {
        "id": "14",
        "title_id": "Mandi Wajib (Junub)",
        "question_id": "Bagaimana cara mandi wajib?",
        "answer_id": "Cara mandi wajib: Niat, membasuh kedua tangan, mencuci kemaluan, berwudhu, menyela pangkal rambut dengan air, menyiram seluruh tubuh dimulai dari yang kanan. Pastikan air merata ke seluruh kulit.",
        "url": "https://islamqa.info/id/answers/82344",
        "category": "shalat",
        "keywords": ["mandi", "wajib", "junub", "basah", "besar"]
    },
    {
        "id": "15",
        "title_id": "Shalat Tahajud",
        "question_id": "Apakah harus tidur dulu sebelum tahajud?",
        "answer_id": "Sebagian ulama mensyaratkan tidur dulu sebelum shalat tahajud, namun shalat malam (qiyamul lail) secara umum tidak harus tidur dulu. Shalat tahajud adalah shalat malam setelah bangun tidur.",
        "url": "https://islamqa.info/id/answers/143128",
        "category": "shalat",
        "keywords": ["tahajud", "malam", "tidur", "qiyamul"]
    },

    # --- UMRAH & HAJI (15) ---
    {
        "id": "16",
        "title_id": "Syarat Haji dan Umrah",
        "category": "umrah",
        "question_id": "Apa saja syarat haji dan umrah?",
        "answer_id": "Syarat haji dan umrah ada lima: Islam, berakal, baligh, merdeka, dan mampu. Kemampuan mencakup: kemampuan fisik dan finansial, keamanan jalan, dan bagi wanita harus bersama mahram.",
        "url": "https://islamqa.info/ar/answers/31819",
        "keywords": ["syarat", "umrah", "haji", "mahram", "mampu"]
    },
    {
        "id": "17",
        "title_id": "Rukun Umrah",
        "category": "umrah",
        "question_id": "Apa saja rukun umrah?",
        "answer_id": "Rukun umrah ada tiga: 1. Ihram (niat), 2. Tawaf, 3. Sa'i. Jika rukun ditinggalkan, umrah tidak sah dan tidak bisa diganti dengan dam.",
        "url": "https://islamqa.info/ar/answers/109280",
        "keywords": ["rukun", "umrah", "ihram", "tawaf", "sai"]
    },
    {
        "id": "18",
        "title_id": "Wajib Umrah",
        "category": "umrah",
        "question_id": "Apa bedanya rukun dan wajib umrah?",
        "answer_id": "Wajib umrah ada dua: 1. Ihram dari miqat, 2. Tahallul (cukur/potong rambut). Jika wajib ditinggalkan, umrah tetap sah tapi WAJIB membayar dam (denda) berupa menyembelih seekor kambing.",
        "url": "https://islamqa.info/ar/answers/146571",
        "keywords": ["wajib", "rukun", "beda", "umrah", "dam"]
    },
    {
        "id": "19",
        "title_id": "Larangan Ihram",
        "category": "umrah",
        "question_id": "Apa larangan saat ihram?",
        "answer_id": "Larangan ihram: 1. Mencukur rambut/bulu, 2. Memotong kuku, 3. Memakai wewangian, 4. Menutup kepala (bagi laki-laki), 5. Memakai pakaian berjahit (bagi laki-laki), 6. Membunuh hewan buruan, 7. Akad nikah, 8. Hubungan suami istri.",
        "url": "https://islamqa.info/ar/answers/106576",
        "keywords": ["larangan", "ihram", "haram", "cukur", "wangi"]
    },
    {
        "id": "20",
        "title_id": "Wanita Haid Saat Umrah",
        "category": "umrah",
        "question_id": "Bolehkah wanita haid umrah?",
        "answer_id": "Wanita haid boleh melakukan semua amalan umrah (ihram, sa'i, tahallul) KECUALI Tawaf. Ia harus menunggu suci dulu baru tawaf. Jika terdesak waktu, pendapat Syaikhul Islam Ibnu Taimiyah membolehkan tawaf dengan pembalut yang aman, tapi mayoritas ulama melarang.",
        "url": "https://islamqa.info/id/answers/36868",
        "keywords": ["haid", "wanita", "umrah", "tawaf", "mens"]
    },
    {
        "id": "21",
        "title_id": "Miqat Makani",
        "question_id": "Di mana miqat bagi jamaah Indonesia?",
        "answer_id": "Bagi jamaah yang datang dari Indonesia dengan pesawat dan turun di Jeddah, mayoritas ulama mewajibkan ihram saat pesawat sejajar dengan Qarnul Manazil atau Yalamlam (sekitar 20-30 menit sebelum mendarat). Tidak boleh mengakhirkan niat ihram sampai Jeddah, kecuali mampir Madinah dulu maka miqatnya Dzulhulaifah (Bir Ali).",
        "url": "https://islamqa.info/ar/answers/41696",
        "category": "umrah",
        "keywords": ["miqat", "tempat", "indonesia", "pesawat", "jeddah"]
    },
    {
        "id": "22",
        "title_id": "Tahallul bagi Wanita",
        "question_id": "Bagaimana cara tahallul bagi wanita?",
        "answer_id": "Wanita bertahallul dengan cara mengumpulkan ujung rambutnya lalu memotongnya seukuran ujung jari (sekitar 1-2 cm). Tidak boleh mencukur habis.",
        "url": "https://islamqa.info/ar/answers/110804",
        "category": "umrah",
        "keywords": ["tahallul", "wanita", "potong", "rambut", "pendek"]
    },
    {
        "id": "23",
        "title_id": "Dam Melanggar Larangan",
        "question_id": "Apa denda jika melanggar larangan ihram?",
        "answer_id": "Jika melanggar larangan ihram (seperti pakai wangi, pakai topi, potong kuku) karena lupa atau tidak tahu, tidak ada denda. Jika sengaja, wajib bayar fidyah: memilih antara puasa 3 hari, atau memberi makan 6 orang miskin, atau menyembelih seekor kambing.",
        "url": "https://islamqa.info/ar/answers/36522",
        "category": "umrah",
        "keywords": ["dam", "denda", "larangan", "fidyah", "sengaja"]
    },
    {
        "id": "24",
        "title_id": "Membaca Talbiyah",
        "question_id": "Kapan mulai dan berhenti talbiyah umrah?",
        "answer_id": "Talbiyah umrah dimulai sejak niat ihram di miqat, dan berhenti saat melihat Ka'bah untuk memulai tawaf.",
        "url": "https://islamqa.info/ar/answers/109282",
        "category": "umrah",
        "keywords": ["talbiyah", "kapan", "mulai", "berhenti", "bacaan"]
    },
    {
        "id": "25",
        "title_id": "Mina dan Arafah",
        "question_id": "Apa yang dilakukan di Mina dan Arafah?",
        "answer_id": "Ini adalah rangkaian Haji (bukan umrah). Di Mina jamaah mabit (menginap) dan melempar jumrah. Di Arafah jamaah wukuf pada tanggal 9 Dzulhijjah, yang merupakan puncak ibadah haji.",
        "url": "https://islamqa.info/ar/answers/109311",
        "category": "haji",
        "keywords": ["mina", "arafah", "wukuf", "haji", "jumrah"]
    },
    {
        "id": "26",
        "title_id": "Doa Tawaf",
        "question_id": "Adakah doa khusus tawaf?",
        "answer_id": "Tidak ada doa khusus untuk setiap putaran tawaf. Namun disunnahkan membaca 'Rabbana aatina fid dunya hasanah...' saat di antara Rukun Yamani dan Hajar Aswad.",
        "url": "https://islamqa.info/ar/answers/109281",
        "category": "umrah",
        "keywords": ["doa", "tawaf", "bacaan", "rukun", "yamani"]
    },
    {
        "id": "27",
        "title_id": "Shalat di Hijir Ismail",
        "question_id": "Apa hukum shalat di Hijir Ismail?",
        "answer_id": "Shalat di Hijir Ismail hukumnya sunnah dan pahalanya seperti shalat di dalam Ka'bah, karena Hijir Ismail adalah bagian dari Ka'bah.",
        "url": "https://islamqa.info/ar/answers/22004",
        "category": "umrah",
        "keywords": ["hijir", "ismail", "shalat", "kaabah"]
    },
    {
        "id": "28",
        "title_id": "Mencium Hajar Aswad",
        "question_id": "Hukum mencium Hajar Aswad?",
        "answer_id": "Mencium Hajar Aswad hukumnya sunnah jika mampu dan tidak menyakiti orang lain. Jika berdesakan, cukup memberi isyarat dengan tangan.",
        "url": "https://islamqa.info/ar/answers/2650",
        "category": "umrah",
        "keywords": ["hajar", "aswad", "cium", "sunnah"]
    },
    {
        "id": "29",
        "title_id": "Shalat Arbain di Madinah",
        "question_id": "Apakah shalat arbain di Madinah wajib?",
        "answer_id": "Hadits tentang shalat Arbain (40 waktu berturut-turut) di Masjid Nabawi dinilai lemah (dhaif) oleh para ulama peneliti hadits. Jadi itu bukan syarat sah haji/umrah, meskipun shalat di Masjid Nabawi sendiri pahalanya sangat besar.",
        "url": "https://islamqa.info/ar/answers/36736",
        "category": "haji",
        "keywords": ["arbain", "madinah", "nabawi", "40", "shalat"]
    },
    {
        "id": "30",
        "title_id": "Badal Haji/Umrah",
        "question_id": "Syarat membadalkan haji/umrah?",
        "answer_id": "Syarat membadalkan haji/umrah: 1. Yang dibadalkan sudah meninggal atau sakit parah yang tidak bisa sembuh (tidak mampu fisik), 2. Pelaksana badal sudah pernah haji/umrah untuk dirinya sendiri.",
        "url": "https://islamqa.info/ar/answers/41819",
        "category": "haji",
        "keywords": ["badal", "ganti", "wakil", "meninggal"]
    },

    # --- PUASA (5) ---
    {
        "id": "31",
        "title_id": "Hal Pembatal Puasa",
        "question_id": "Apa saja yang membatalkan puasa?",
        "answer_id": "Pembatal puasa: 1. Makan/minum dengan sengaja, 2. Hubungan suami istri, 3. Muntah dengan sengaja, 4. Keluar mani dengan sengaja, 5. Haid/Nifas, 6. Murtad.",
        "url": "https://islamqa.info/id/answers/38023",
        "category": "puasa",
        "keywords": ["batal", "puasa", "makan", "muntah", "haid"]
    },
    {
        "id": "32",
        "title_id": "Sikat Gigi Saat Puasa",
        "question_id": "Bolehkah sikat gigi saat puasa?",
        "answer_id": "Boleh bersiwak atau sikat gigi (dengan pasta gigi) saat puasa, asalkan menjaga agar tidak ada yang tertelan. Jika tertelan tanpa sengaja, puasa tetap sah.",
        "url": "https://islamqa.info/id/answers/13819",
        "category": "puasa",
        "keywords": ["sikat", "gigi", "siwak", "odol", "puasa"]
    },
    {
        "id": "33",
        "title_id": "Hamil dan Menyusui",
        "question_id": "Apakah wanita hamil/menyusui wajib puasa?",
        "answer_id": "Wanita hamil atau menyusui jika khawatir terhadap dirinya atau bayinya, boleh tidak puasa dan wajib menggantinya (qadha) di hari lain. Sebagian ulama berpendapat cukup bayar fidyah.",
        "url": "https://islamqa.info/id/answers/50005",
        "category": "puasa",
        "keywords": ["hamil", "menyusui", "puasa", "qadha", "fidyah"]
    },
    {
        "id": "34",
        "title_id": "Niat Puasa",
        "question_id": "Kapan waktu niat puasa?",
        "answer_id": "Untuk puasa wajib (Ramadhan), niat harus dilakukan di malam hari sebelum fajar (Subuh). Untuk puasa sunnah, boleh niat di pagi hari asalkan belum makan/minum.",
        "url": "https://islamqa.info/id/answers/22909",
        "category": "puasa",
        "keywords": ["niat", "puasa", "malam", "fajar", "siang"]
    },
    {
        "id": "35",
        "title_id": "Mimsan/Tetes Mata",
        "question_id": "Apakah tetes mata dan telinga membatalkan puasa?",
        "answer_id": "Obat tetes mata dan telinga tidak membatalkan puasa menurut pendapat yang lebih kuat, karena mata dan telinga bukan jalur masuk makanan ke lambung.",
        "url": "https://islamqa.info/id/answers/22238",
        "category": "puasa",
        "keywords": ["tetes", "mata", "telinga", "obat", "batal"]
    },

    # --- ZAKAT & SEDEKAH (5) ---
    {
        "id": "36",
        "title_id": "Nisab Zakat Mal",
        "question_id": "Berapa nisab zakat mal?",
        "answer_id": "Nisab zakat mal (harta) adalah setara dengan 85 gram emas murni. Jika harta telah mencapai nisab dan bertahan selama satu tahun (haul), wajib dikeluarkan zakatnya sebesar 2.5%.",
        "url": "https://islamqa.info/id/answers/26113",
        "category": "zakat",
        "keywords": ["nisab", "zakat", "mal", "emas", "persen"]
    },
    {
        "id": "37",
        "title_id": "Penerima Zakat",
        "question_id": "Siapa yang berhak menerima zakat?",
        "answer_id": "Ada 8 golongan (ashnaf) penerima zakat: 1. Fakir, 2. Miskin, 3. Amil, 4. Mualaf, 5. Riqab (hamba sahaya), 6. Gharim (orang berhutang), 7. Fisabilillah, 8. Ibnu Sabil (musafir).",
        "url": "https://islamqa.info/id/answers/46209",
        "category": "zakat",
        "keywords": ["penerima", "zakat", "mustahik", "ashnaf", "miskin"]
    },
    {
        "id": "38",
        "title_id": "Zakat Fitrah",
        "question_id": "Berapa besaran zakat fitrah?",
        "answer_id": "Zakat fitrah wajib dikeluarkan berupa makanan pokok sebanyak 1 sha' (sekitar 2.5 - 3 kg) per jiwa. Wajib bagi setiap muslim, kecil/besar, laki/perempuan, merdeka/hamba. Harus ditunaikan sebelum shalat Idul Fitri.",
        "url": "https://islamqa.info/id/answers/12459",
        "category": "zakat",
        "keywords": ["fitrah", "beras", "makanan", "idul", "fitri"]
    },
    {
        "id": "39",
        "title_id": "Zakat Penghasilan",
        "question_id": "Apakah ada zakat profesi/penghasilan?",
        "answer_id": "Mayoritas ulama terdahulu tidak mengenal istilah zakat profesi. Namun jika gaji ditabung hingga mencapai nisab dan haul (satu tahun), maka kena zakat 2.5%. Jika langsung habis terpakai, tidak ada zakatnya.",
        "url": "https://islamqa.info/id/answers/114972",
        "category": "zakat",
        "keywords": ["profesi", "gaji", "penghasilan", "bulan", "zakat"]
    },
    {
        "id": "40",
        "title_id": "Sedekah Paling Utama",
        "question_id": "Sedekah apa yang paling utama?",
        "answer_id": "Sedekah yang paling utama adalah: 1. Sedekah kepada kerabat yang memusuhi, 2. Sedekah saat sehat dan kikir (sayang harta), 3. Sedekah jariyah (wakaf) yang pahalanya mengalir terus.",
        "url": "https://islamqa.info/id/answers/36737",
        "category": "zakat",
        "keywords": ["sedekah", "utama", "terbaik", "jariyah"]
    },

    # --- ADAB & DOA (5) ---
    {
        "id": "41",
        "title_id": "Doa Masuk Masjid",
        "question_id": "Apa doa masuk masjid?",
        "answer_id": "Doa masuk masjid: 'Allahummaf-tah lii abwaaba rahmatik' (Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu). Disunnahkan mendahulukan kaki kanan.",
        "url": "https://islamqa.info/id/answers/32468",
        "category": "adab",
        "keywords": ["doa", "masjid", "masuk", "kaki"]
    },
    {
        "id": "42",
        "title_id": "Adab Makan",
        "question_id": "Bagaimana adab makan dalam Islam?",
        "answer_id": "Adab makan: 1. Membaca Bismillah, 2. Makan dengan tangan kanan, 3. Makan makanan yang dekat, 4. Tidak mencela makanan, 5. Mengakhiri dengan Alhamdulillah.",
        "url": "https://islamqa.info/id/answers/13348",
        "category": "adab",
        "keywords": ["adab", "makan", "minum", "tangan", "kanan"]
    },
    {
        "id": "43",
        "title_id": "Doa Tidur",
        "question_id": "Apa doa sebelum tidur?",
        "answer_id": "Doa sebelum tidur: 'Bismika Allahumma amuutu wa ahyaa' (Dengan nama-Mu Ya Allah aku mati dan aku hidup). Disunnahkan berwudhu, mengibaskan tempat tidur, dan membaca ayat kursi.",
        "url": "https://islamqa.info/id/answers/145543",
        "category": "adab",
        "keywords": ["doa", "tidur", "bangun", "mimpi"]
    },
    {
        "id": "44",
        "title_id": "Adab di Kamar Mandi",
        "question_id": "Apa doa masuk WC?",
        "answer_id": "Doa masuk WC: 'Allahumma inni a'udzu bika minal khubutsi wal khabaits'. Masuk dengan kaki kiri, keluar dengan kaki kanan dan membaca 'Ghufranak'.",
        "url": "https://islamqa.info/id/answers/2532",
        "category": "adab",
        "keywords": ["wc", "toilet", "kamar", "mandi", "kaki"]
    },
    {
        "id": "45",
        "title_id": "Menjawab Salam",
        "question_id": "Apa hukum menjawab salam?",
        "answer_id": "Memulai salam hukumnya sunnah muakkad, sedangkan menjawab salam hukumnya fardhu kifayah (jika dalam kelompok) atau fardhu 'ain (jika sendirian).",
        "url": "https://islamqa.info/id/answers/7074",
        "category": "adab",
        "keywords": ["salam", "hukum", "jawab", "assalamualaikum"]
    },

    # --- FIQIH WANITA (5) ---
    {
        "id": "46",
        "title_id": "Shalat Wanita di Masjid",
        "question_id": "Mana lebih utama wanita shalat di masjid atau rumah?",
        "answer_id": "Shalat wanita di rumahnya lebih utama daripada di masjid, bahkan di Masjidil Haram sekalipun. Namun tidak boleh melarang wanita jika ingin ke masjid dengan syarat menutup aurat sempurna dan tidak memakai wewangian.",
        "url": "https://islamqa.info/id/answers/90071",
        "category": "fiqih_wanita",
        "keywords": ["wanita", "masjid", "rumah", "shalat", "utama"]
    },
    {
        "id": "47",
        "title_id": "Memakai Cadar Saat Ihram",
        "question_id": "Bolehkah memakai cadar saat ihram?",
        "answer_id": "Wanita yang sedang ihram dilarang memakai niqab (cadar yang dijahit sesuai bentuk wajah) dan sarung tangan. Namun WAJIB menutup wajahnya dengan kain kerudung jika berpapasan dengan laki-laki yang bukan mahram.",
        "url": "https://islamqa.info/id/answers/4182",
        "category": "umrah",
        "keywords": ["cadar", "niqab", "wajah", "ihram", "wanita"]
    },
    {
        "id": "48",
        "title_id": "Hukum Safar Wanita Tanpa Mahram",
        "question_id": "Bolehkah wanita umrah tanpa mahram?",
        "answer_id": "Pendapat yang kuat menyatakan wanita tidak boleh safar (termasuk haji/umrah) tanpa mahram. Namun pemerintah Saudi saat ini membolehkan visa umrah wanita tanpa mahram jika bersama rombongan wanita yang terpercaya (al-rufqa al-ma'munah), mengikuti pendapat sebagian ulama Syafi'iyah.",
        "url": "https://islamqa.info/id/answers/34380",
        "category": "fiqih_wanita",
        "keywords": ["mahram", "safar", "wanita", "umrah", "sendiri"]
    },
    {
        "id": "49",
        "title_id": "Warna Pakaian Ihram Wanita",
        "question_id": "Apa warna baju ihram wanita?",
        "answer_id": "Tidak ada warna khusus untuk pakaian ihram wanita. Boleh putih, hitam, atau warna lain asalkan tidak tabarruj (mencolok perhiasannya) dan menutup aurat sempurna. Tidak disyaratkan putih seperti laki-laki.",
        "url": "https://islamqa.info/id/answers/109325",
        "category": "fiqih_wanita",
        "keywords": ["baju", "warna", "ihram", "wanita", "putih"]
    },
    {
        "id": "50",
        "title_id": "Hukum Potong Rambut Pendek Wanita",
        "question_id": "Bolehkah wanita memotong rambut pendek?",
        "answer_id": "Wanita boleh memotong rambut pendek asalkan tidak menyerupai laki-laki (tasyabbuh) dan tidak menyerupai wanita kafir/fasik. Potongan rambut harus tetap menjaga feminitas.",
        "url": "https://islamqa.info/id/answers/45191",
        "category": "fiqih_wanita",
        "keywords": ["potong", "rambut", "pendek", "wanita", "hukum"]
    }
]

output_data = {
    "metadata": {
        "version": "2.1",
        "source": "islamqa.info",
        "count": len(fatwas),
        "last_updated": "2026-02-11"
    },
    "fatwas": fatwas
}

with open('knowledge/islamqa_db.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"✅ Successfully generated {len(fatwas)} fatwas in knowledge/islamqa_db.json")
