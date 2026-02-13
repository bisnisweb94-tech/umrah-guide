
const fs = require('fs');

// --- 1. Load Data ---

// Load current data
const currentDataPath = 'masjidil-haram-data.js';
const currentDataContent = fs.readFileSync(currentDataPath, 'utf8');

let currentLocations;
try {
    const cleanedContent = currentDataContent
        .replace(/const masjidilHaramLocations =/, 'return')
        .replace(/;$/, '');
    const func = new Function(cleanedContent);
    currentLocations = func();
} catch (e) {
    console.error("Error parsing current data:", e);
    process.exit(1);
}

console.log(`Current locations: ${currentLocations.length}`);

// Load OSM XML Source
const osmSourcePath = 'osm_data/map-3.osm';
const osmXmlContent = fs.readFileSync(osmSourcePath, 'utf8');
console.log(`Loaded OSM XML: ${osmXmlContent.length} bytes`);

// --- 2. Parse OSM XML (Regex based) ---

const osmNodes = [];
const osmMap = new Map(); // Key: OSM ID

// Regex to find node blocks
const nodeRegex = /<node id="(\d+)"[^>]+lat="([\d\.]+)"[^>]+lon="([\d\.]+)"[^>]*>([\s\S]*?)<\/node>/g;
// Regex to find tags inside a block
const tagRegex = /<tag k="([^"]+)" v="([^"]+)"\/>/g;

let match;
let nodeCount = 0;

while ((match = nodeRegex.exec(osmXmlContent)) !== null) {
    const id = match[1];
    const lat = parseFloat(match[2]);
    const lon = parseFloat(match[3]);
    const innerContent = match[4];

    const tags = {};
    let tagMatch;
    while ((tagMatch = tagRegex.exec(innerContent)) !== null) {
        tags[tagMatch[1]] = tagMatch[2];
    }

    // Only keep interesting nodes (must have a name)
    if (tags['name']) {
        const node = {
            id: id,
            lat: lat,
            lon: lon,
            tags: tags
        };
        osmNodes.push(node);
        osmMap.set(id, node);
        nodeCount++;
    }
}

console.log(`Parsed ${nodeCount} relevant nodes from OSM XML.`);

// --- 3. Transliteration Helpers ---

const arabicRegex = /[\u0600-\u06FF]/;

// Simple mapping for common prefixes/words
const dictionary = {
    'فندق': 'Hotel',
    'مسجد': 'Masjid',
    'جامع': 'Grand Mosque',
    'باب': 'Gate',
    'مركز': 'Center',
    'صحي': 'Health',
    'مستوصف': 'Clinic',
    'مدرسة': 'School',
    'طريق': 'Road',
    'شارع': 'Street',
    'جبل': 'Mount',
    'بئر': 'Well',
    'مقبرة': 'Cemetery',
    'مكتبة': 'Library',
    'سوق': 'Market',
    'برج': 'Tower',
    'عمائر': 'Buildings',
    'شركة': 'Company',
    'مؤسسة': 'Establishment/Foundation',
    'مطعم': 'Restaurant',
    'بقالة': 'Grocery',
    'صراف': 'ATM',
    'مصرف': 'Bank'
};

// Basic letter mapping
const charMap = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
    'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
    'ط': 't', 'ظ': 'z', 'ع': "'", 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
    'ة': 'ah', 'ى': 'a', 'ء': "'", 'ئ': "'", 'ؤ': "'"
};

function transliterate(arabicText) {
    let text = arabicText;
    for (const [ar, en] of Object.entries(dictionary)) {
        const regex = new RegExp(ar, 'g');
        text = text.replace(regex, en);
    }
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (charMap[char]) {
            result += charMap[char];
        } else if (/\s/.test(char) || /[0-9]/.test(char) || /[a-zA-Z]/.test(char)) {
            result += char;
        }
    }
    result = result.replace(/\s+/g, ' ').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
}

// Helper to determine type and icon
function determineTypeAndIcon(tags) {
    let type = 'Landmark';
    let icon = 'fa-map-marker-alt';

    if (tags['amenity'] === 'place_of_worship' || tags['religion'] === 'muslim') {
        type = 'Mosque';
        icon = 'fa-mosque';
    } else if (tags['tourism'] === 'hotel' || tags['building'] === 'hotel') {
        type = 'Hotel';
        icon = 'fa-hotel';
    } else if (tags['amenity'] === 'restaurant' || tags['amenity'] === 'fast_food') {
        type = 'Food';
        icon = 'fa-utensils';
    } else if (tags['amenity'] === 'hospital' || tags['amenity'] === 'clinic') {
        type = 'Medical';
        icon = 'fa-clinic-medical';
    } else if (tags['shop']) {
        type = 'Shop';
        icon = 'fa-shopping-cart';
    } else if (tags['historic']) {
        type = 'History';
        icon = 'fa-landmark';
    } else if (tags['barrier'] === 'gate' || tags['entrance']) {
        type = 'Gate';
        icon = 'fa-door-open';
    }

    // Heuristics based on name
    const name = tags['name'] || '';
    if (name.includes('فندق') || name.includes('Hotel')) {
        type = 'Hotel';
        icon = 'fa-hotel';
    }

    return { type, icon };
}

// --- 4. Process Data ---

const existingOsmIds = new Set();
let updatedCount = 0;
let newCount = 0;

// Pass 1: Enhance Existing with XML Data
currentLocations.forEach(loc => {
    const props = loc.properties;
    let osmId = String(props.osm_id);

    // Some IDs might be like "way_..." or just number. Try to match number.
    // Our map-3.osm only has nodes. If current data has 'way_' it won't match, which is fine.

    // Strip non-numeric for lookup if needed, but let's try direct first.
    // Actually, osm_id in current data might handle ways differently.
    // Let's rely on basic string matching.

    let osmNode = osmMap.get(osmId);

    // If not found, try stripping non-digits
    if (!osmNode) {
        const numericId = osmId.replace(/\D/g, '');
        osmNode = osmMap.get(numericId);
    }

    if (osmNode) {
        existingOsmIds.add(osmNode.id); // Mark as processed

        // Enhance Name
        if (!props.name_en || arabicRegex.test(props.name_en) || props.name_en === props.name) {
            if (osmNode.tags['name:en']) {
                props.name_en = osmNode.tags['name:en'];
                updatedCount++;
            } else if (osmNode.tags['name:id']) { // Indonesian
                props.name_en = osmNode.tags['name:id'];
                updatedCount++;
            } else {
                // If still Arabic, transliterate
                if (props.name_en && arabicRegex.test(props.name_en)) {
                    props.name_en = transliterate(props.name_en);
                    updatedCount++;
                }
            }
        }
    } else {
        // Node not found in XML (maybe it's a Way, or from another source)
        // Just transliterate if needed
        if (props.name_en && arabicRegex.test(props.name_en)) {
            props.name_en = transliterate(props.name_en);
            updatedCount++;
        }
    }
});

console.log(`Updated/Transliterated ${updatedCount} existing locations.`);

// Pass 2: Add New Locations from XML
const currentNames = new Set(currentLocations.map(l => l.properties.name));

osmNodes.forEach(node => {
    if (!existingOsmIds.has(node.id)) {
        // Check if name already exists to avoid duplicates
        if (currentNames.has(node.tags['name'])) return;

        // Skip roads (highways) unless specific types? 
        // Nodes don't usually represent whole roads, but points.
        // Skip if highway tag is present and likely just a node on a road?
        if (node.tags['highway'] && node.tags['highway'] !== 'bus_stop') return;

        const { type, icon } = determineTypeAndIcon(node.tags);

        // Prepare new feature
        let nameEn = node.tags['name:en'] || node.tags['name:id'];
        if (!nameEn) {
            nameEn = transliterate(node.tags['name']);
        }

        const newFeature = {
            "type": "Feature",
            "properties": {
                "name": node.tags['name'],
                "name_en": nameEn,
                "type": type,
                "icon": icon,
                "description": `${type} - ${nameEn}`,
                "osm_id": node.id
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    node.lon,
                    node.lat
                ]
            }
        };

        currentLocations.push(newFeature);
        newCount++;
    }
});

console.log(`Added ${newCount} new locations from Map-3 OSM.`);
console.log(`Total locations now: ${currentLocations.length}`);

// --- 5. Save ---

const outputContent = `// Data Lokasi Penting Masjidil Haram - Versi Premium (OSM Map-3 Updated)
// Diperbarui dengan data dari map-3.osm dan transliterasi otomatis
// Total POIs: ${currentLocations.length}

const masjidilHaramLocations = ${JSON.stringify(currentLocations, null, 4)};
`;

fs.writeFileSync(currentDataPath, outputContent, 'utf8');
console.log("Done. Saved to " + currentDataPath);
