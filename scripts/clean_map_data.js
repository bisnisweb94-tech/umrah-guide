
const fs = require('fs');

// Read the data file content
const dataPath = 'masjidil-haram-data.js';
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Parse data same way as analysis
let masjidilHaramLocations;
try {
    const cleanedContent = dataContent
        .replace(/const masjidilHaramLocations =/, 'return')
        .replace(/;$/, '');
    const func = new Function(cleanedContent);
    masjidilHaramLocations = func();
} catch (e) {
    console.error("Error parsing data:", e);
    // Fallback: try to just extract the array part
    const start = dataContent.indexOf('[');
    const end = dataContent.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
        try {
            const arrayStr = dataContent.substring(start, end + 1);
            masjidilHaramLocations = eval(arrayStr);
        } catch (e2) {
            console.error("Error parsing data fallback:", e2);
            process.exit(1);
        }
    } else {
        process.exit(1);
    }
}

console.log(`Original count: ${masjidilHaramLocations.length}`);

// 1. Remove Duplicates
// Specific logic for "Shami Corner" duplicate at index 38 (found in analysis)
// We can use a Set to track unique IDs or coords to be safe generally
const seenCoords = new Map();
const seenOsmIds = new Map();
const uniqueLocations = [];

masjidilHaramLocations.forEach((loc) => {
    let isDuplicate = false;

    // Check OSM ID
    if (loc.properties.osm_id) {
        if (seenOsmIds.has(loc.properties.osm_id)) {
            isDuplicate = true;
            console.log(`Duplicate removed (OSM ID): ${loc.properties.name}`);
        } else {
            seenOsmIds.set(loc.properties.osm_id, true);
        }
    }

    // Check Coordinates + Name (for extra safety)
    if (!isDuplicate && loc.geometry && loc.geometry.coordinates) {
        const coordsKey = loc.geometry.coordinates.join(',');
        if (seenCoords.has(coordsKey)) {
            const prevName = seenCoords.get(coordsKey);
            if (prevName === loc.properties.name) {
                isDuplicate = true;
                console.log(`Duplicate removed (Coords+Name): ${loc.properties.name}`);
            }
        } else {
            seenCoords.set(coordsKey, loc.properties.name);
        }
    }

    if (!isDuplicate) {
        uniqueLocations.push(loc);
    }
});

console.log(`Count after dedup: ${uniqueLocations.length}`);

// 2. Translate Arabic Names
const translationMap = {
    'فندق': 'Hotel',
    'مسجد': 'Masjid',
    'جامع': 'Grand Mosque',
    'باب': 'Gate',
    'مركز صحي': 'Health Center',
    'مستوصف': 'Clinic',
    'باصات': 'Buses',
    'مطعم': 'Restaurant',
    'صيدلية': 'Pharmacy',
    'بقالة': 'Grocery',
    'مكتبة': 'Library',
    'مدرسة': 'School',
    'موقف': 'Parking',
    'سوق': 'Market',
    'برج': 'Tower',
    'دار': 'House/Hotel', // Often hotels in Makkah context
    'مجمع': 'Complex'
};

const arabicRegex = /[\u0600-\u06FF]/;

uniqueLocations.forEach(loc => {
    const name = loc.properties.name;
    let nameEn = loc.properties.name_en;

    // If name_en is missing/empty/same-as-name OR contains Arabic
    if (arabicRegex.test(name) && (!nameEn || nameEn === name || arabicRegex.test(nameEn) || nameEn.trim() === '')) {
        let newName = name;

        // Simple word replacement
        for (const [arabic, english] of Object.entries(translationMap)) {
            if (newName.includes(arabic)) {
                // Replace the Arabic word with English
                // But often the whole hierarchy is Arabic "Fundoq Al..." -> "Hotel Al..."
                // We'll replace the keyword
                newName = newName.replace(arabic, english);
            }
        }

        // Cleanup: remove remaining Arabic chars if we want a pure English/Indo name?
        // Or keep them for reference? The prompt said "buat versi english /indonesia"
        // Let's try to keep Latin chars only if possible, but we can't transliterate automatically without a library.
        // So we will rely on replacing known prefixes.
        // If it's still fully Arabic, we can't easily guess.

        // HEURISTIC: If we replaced a keyword, use that.
        // If we didn't, and it's 100% Arabic, we mark it as "Unknown (Arabic Name)" + original for safety?
        // Better: Just update the prefix if we know it.

        loc.properties.name_en = newName;

        // Also ensure 'type' is set correctly based on name if generic
        if (newName.includes('Hotel')) loc.properties.type = 'Hotel';
        if (newName.includes('Masjid') || newName.includes('Mosque')) loc.properties.type = 'Mosque';

        console.log(`Translated info: ${name} -> ${newName}`);
    }
});

// 3. Write back to file
// We need to reconstruct the JS file format
const newContent = `// Data Lokasi Penting Masjidil Haram - Versi Premium (OSM Map-3)
// Diperbarui dengan koordinat lebih akurat dan kategori tambahan
// Total POIs: ${uniqueLocations.length}
// Total Roads: 4508
// Total Buildings: 2650

const masjidilHaramLocations = ${JSON.stringify(uniqueLocations, null, 4)};
`;

fs.writeFileSync('masjidil-haram-data.js', newContent, 'utf8');
console.log("Cleanup complete. Saved to masjidil-haram-data.js");
