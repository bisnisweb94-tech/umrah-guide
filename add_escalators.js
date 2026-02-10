var markers = [
    // Escalators found from scan
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8228696, 21.4198481] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8231105, 21.4204201] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8226620, 21.4240541] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8231730, 21.4248131] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8234278, 21.4250853] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8247166, 21.4258793] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8251846, 21.4260241] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8260322, 21.4261464] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8274467, 21.4248656] }
    },
    {
        "type": "Feature",
        "properties": { "name": "Escalator/Elevator", "name_en": "Escalator/Elevator", "type": "Support", "icon": "fa-elevator", "description": "Akses lift/eskalator." },
        "geometry": { "type": "Point", "coordinates": [39.8277420, 21.4225647] }
    }
];

// Read file and append
const fs = require('fs');
const path = '/Users/aditya/.gemini/antigravity/scratch/umrah-guide/masjidil-haram-data.js';

let content = fs.readFileSync(path, 'utf8');

// Prepare string
let new_items_str = markers.map(m => JSON.stringify(m, null, 4)).join(',\n');

// Find end of array
let last_brace = content.lastIndexOf('];');
if (last_brace !== -1) {
    let new_content = content.substring(0, last_brace) + ',\n' + new_items_str + '\n' + content.substring(last_brace);
    fs.writeFileSync(path, new_content);
    console.log('Added escalators.');
}
