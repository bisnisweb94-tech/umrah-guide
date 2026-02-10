
// Array of Hotels
var hotels = [
    {
        "type": "Feature",
        "properties": { "name": "Dar Al Ghufran - Al Safwah Towers Hotel", "name_en": "Dar Al Ghufran", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel di dekat Haram." },
        "geometry": { "type": "Point", "coordinates": [39.8265113, 21.4193627] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Al Marwa Rayhaan by Rotana", "name_en": "Al Marwa Rayhaan", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel mewah dengan akses langsung ke Masjidil Haram." },
        "geometry": { "type": "Point", "coordinates": [39.8260952, 21.4191648] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Raffles Makkah Palace", "name_en": "Raffles Makkah Palace", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel mewah dekat Haram." },
        "geometry": { "type": "Point", "coordinates": [39.8249791, 21.4192239] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Dar Al Eiman Royal Hotel", "name_en": "Dar Al Eiman Royal", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel dekat Haram." },
        "geometry": { "type": "Point", "coordinates": [39.826808, 21.418874] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Swissôtel Makkah", "name_en": "Swissôtel Makkah", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel dengan pemandangan Ka'bah." },
        "geometry": { "type": "Point", "coordinates": [39.8268075, 21.41838] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Mövenpick Hotel & Residence Hajar Tower Makkah", "name_en": "Mövenpick Hajar Tower", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel di menara jam." },
        "geometry": { "type": "Point", "coordinates": [39.8262712, 21.4183039] }
    },
    {
        "type": "Feature",
        "properties": { "name": "pulman zamzam", "name_en": "Pullman ZamZam Makkah", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel ikonik di kompleks Abraj Al Bait." },
        "geometry": { "type": "Point", "coordinates": [39.8249601, 21.4183327] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Fairmont Makkah Clock Royal Tower", "name_en": "Fairmont Makkah", "type": "Hotel", "icon": "fa-hotel", "description": "Hotel di menara jam utama." },
        "geometry": { "type": "Point", "coordinates": [39.825302, 21.4180383] }
    }
];

const fs = require('fs');
const path = '/Users/aditya/.gemini/antigravity/scratch/umrah-guide/masjidil-haram-data.js';

let content = fs.readFileSync(path, 'utf8');
let new_items_str = hotels.map(m => JSON.stringify(m, null, 4)).join(',\n');

let last_brace = content.lastIndexOf('];');
if (last_brace !== -1) {
    let new_content = content.substring(0, last_brace) + ',\n' + new_items_str + '\n' + content.substring(last_brace);

    // Also update markerColors and typeOrder if possible, but let's do it manually via replace
    fs.writeFileSync(path, new_content);
    console.log('Added hotels.');
}
