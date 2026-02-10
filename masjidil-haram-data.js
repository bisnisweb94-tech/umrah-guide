// Data Lokasi Penting Masjidil Haram - Versi Premium (OSM Map-2)
// Diperbarui dengan koordinat lebih akurat dan kategori tambahan

const masjidilHaramLocations = [
    // === TEMPAT SUCI UTAMA ===
    {
        "type": "Feature",
        "properties": {
            "name": "الكعبة",
            "name_en": "Ka'bah",
            "type": "Holy Site",
            "icon": "fa-kaaba",
            "image": "kaaba_illustration_1770741171195.png",
            "description": "Pusat kiblat umat Islam di seluruh dunia. Terletak di tengah-tengah Masjidil Haram."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.826206, 21.422487]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "الحجر الأسود",
            "name_en": "Black Stone (Hajar Aswad)",
            "type": "Holy Site",
            "icon": "fa-gem",
            "image": "black_stone_illustration_1770741195739.png",
            "description": "Batu suci di sudut tenggara Ka'bah. Sunnah untuk dicium atau disentuh saat Tawaf."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8262546, 21.4224985]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "الركن اليماني",
            "name_en": "Yemeni Corner",
            "type": "Holy Site",
            "icon": "fa-cube",
            "description": "Sudut Ka'bah yang menghadap ke arah Yaman. Terletak sebelum rukun Hajar Aswad."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8261735, 21.4224468]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "الركن الشامي",
            "name_en": "Shami Corner",
            "type": "Holy Site",
            "icon": "fa-cube",
            "description": "Sudut Ka'bah yang menghadap ke arah Syam (Barat Laut)."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8261095, 21.4225371]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "الركن العراقي",
            "name_en": "Iraqi Corner",
            "type": "Holy Site",
            "icon": "fa-cube",
            "description": "Sudut Ka'bah yang menghadap ke arah Irak (Timur Laut)."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8261922, 21.4225861]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "مقام إبراهيم",
            "name_en": "Maqam Ibrahim",
            "type": "Holy Site",
            "icon": "fa-monument",
            "description": "Batu tempat berdirinya Nabi Ibrahim AS saat membangun Ka'bah."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8263, 21.4225]
        }
    },

    // === AREA SA'I ===
    {
        "type": "Feature",
        "properties": {
            "name": "الصفا",
            "name_en": "Safa Hill",
            "type": "Landmark",
            "icon": "fa-mountain",
            "description": "Bukit titik awal ibadah Sa'i."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8274307, 21.4217996]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "المروة",
            "name_en": "Marwah Hill",
            "type": "Landmark",
            "icon": "fa-mountain",
            "description": "Bukit titik akhir ibadah Sa'i."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8271276, 21.4251754]
        }
    },

    // === GERBANG UTAMA ===
    {
        "type": "Feature",
        "properties": {
            "name": "باب الملك عبد العزیز",
            "name_en": "King Abdul Aziz Gate (No. 1)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "image": "gate_illustration_1770741218993.png",
            "ref": "1",
            "description": "Salah satu gerbang utama terbesar di sisi selatan."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8258406, 21.4210447]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب الملك فھد",
            "name_en": "King Fahd Gate (No. 79)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "ref": "79",
            "description": "Gerbang utama menuju area perluasan kedua Masjidil Haram."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8240461, 21.4212320]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب الملك عبد الله",
            "name_en": "King Abdullah Gate (No. 100)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "ref": "100",
            "description": "Gerbang utama baru di sisi perluasan utara."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.824132, 21.425391]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب العمرة",
            "name_en": "Umrah Gate (No. 40)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "ref": "40",
            "description": "Gerbang utama bersejarah di sisi barat daya."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8245696, 21.4228378]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب الفتح",
            "name_en": "Fateh Gate (No. 30)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "ref": "30",
            "description": "Gerbang kemenangan, salah satu akses utama tertua."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8265147, 21.4240151]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب قريش",
            "name_en": "Quraish Gate (No. 28)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "ref": "28",
            "description": "Gerbang akses penting di area Masa'a."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8269231, 21.4254428]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب المروة",
            "name_en": "Al-Marwah Gate (No. 25)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "ref": "25",
            "description": "Gerbang akses langsung ke bukit Marwah."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8273872, 21.4253183]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب السلام",
            "name_en": "Al Salam Gate (No. 2)",
            "type": "Main Gate",
            "icon": "fa-archway",
            "ref": "2",
            "description": "Gerbang Salam, akses tradisional masuk ke area Mataf."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8275662, 21.4230322]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "باب 3 أجياد",
            "name_en": "Bab Ajyad (Gate 3)",
            "type": "Gate",
            "ref": "3",
            "icon": "fa-door-open",
            "description": "Gerbang akses dari arah jalan Ajyad. Ramah kursi roda."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8266416, 21.4212097]
        }
    },

    // === FASILITAS & MEDIS ===
    {
        "type": "Feature",
        "properties": {
            "name": "مستشفى الحرم للطوارئ",
            "name_en": "Al Haram Emergency Hospital",
            "type": "Medical",
            "icon": "fa-hospital",
            "description": "Fasilitas medis darurat utama di dalam kompleks Masjidil Haram."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8232661, 21.4267071]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "سلالم كهربائية",
            "name_en": "Escalator",
            "type": "Support",
            "icon": "fa-stairs",
            "description": "Akses tangga berjalan antar lantai masjid."
        },
        "geometry": {
            "type": "Point",
            "coordinates": [39.8254126, 21.4209651]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8300843,
                21.4343522
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8304693,
                21.4352325
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet (Pria)",
            "name_en": "Public Toilet (Men)",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-person",
            "description": "Fasilitas toilet umum.",
            "gender": "Male"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8286892,
                21.4248517
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet (Wanita)",
            "name_en": "Public Toilet (Women)",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-person-dress",
            "description": "Fasilitas toilet umum.",
            "gender": "Female"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8282164,
                21.4250444
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet (Pria)",
            "name_en": "Public Toilet (Men)",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-person",
            "description": "Fasilitas toilet umum.",
            "gender": "Male"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8300249,
                21.4232362
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet (Wanita)",
            "name_en": "Public Toilet (Women)",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-person-dress",
            "description": "Fasilitas toilet umum.",
            "gender": "Female"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.83031,
                21.4229161
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "حمامات رجال (Pria)",
            "name_en": "Men's WC - 8 (Men)",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-person",
            "description": "Fasilitas toilet umum.",
            "gender": "Male"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8237035,
                21.4206025
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet for Men (Pria)",
            "name_en": "Public Toilet (Men)",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-person",
            "description": "Fasilitas toilet umum.",
            "gender": "Male"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.829182,
                21.4295167
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8213574,
                21.4251632
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8211451,
                21.4252752
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8207911,
                21.4254201
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8216689,
                21.4258089
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8213928,
                21.4260725
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8219166,
                21.4256376
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8226032,
                21.4264151
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8224758,
                21.4266457
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8222847,
                21.4269422
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.823849,
                21.4273442
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.823849,
                21.4275946
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8238278,
                21.4278515
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8249391,
                21.4276934
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8248966,
                21.4279306
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8248825,
                21.4281744
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8258522,
                21.4277922
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Toilet",
            "name_en": "Public Toilet",
            "type": "Support",
            "subtype": "Toilet",
            "icon": "fa-restroom",
            "description": "Fasilitas toilet umum.",
            "gender": "Unspecified"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                39.8258805,
                21.4282074
            ]
        }
    }

];

// Helper functions (Tetap sama)
function getAllLocations() {
    return masjidilHaramLocations;
}

function getLocationsByType(type) {
    return masjidilHaramLocations.filter(loc => loc.properties.type === type);
}

function searchLocation(query) {
    const lowerQuery = query.toLowerCase();
    return masjidilHaramLocations.filter(loc =>
        loc.properties.name.toLowerCase().includes(lowerQuery) ||
        loc.properties.name_en.toLowerCase().includes(lowerQuery)
    );
}
