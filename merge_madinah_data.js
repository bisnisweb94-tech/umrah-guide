#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OSM_DATA_FILE = path.join(__dirname, 'osm_data/madinah/osm_all_pois.json');
const OSM_ROADS_FILE = path.join(__dirname, 'osm_data/madinah/osm_roads.json');
const OSM_BUILDINGS_FILE = path.join(__dirname, 'osm_data/madinah/osm_buildings.json');
const OUTPUT_FILE = path.join(__dirname, 'madinah-data.js');

function loadJSON(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

function sortPOIs(pois) {
    const typeOrder = {
        'Holy Site': 0,
        'Mosque': 1,
        'Gate': 2,
        'W C': 3,
        'Zamzam/Water': 4,
        'Medical': 5,
        'Transportation': 6,
        'Hotel': 7,
        'Food': 8,
        'Amenities': 9,
        'Support': 10,
        'Landmark': 11,
    };

    return pois.sort((a, b) => {
        const typeA = a.properties?.type || 'Landmark';
        const typeB = b.properties?.type || 'Landmark';
        const orderA = typeOrder[typeA] ?? 99;
        const orderB = typeOrder[typeB] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const nameA = a.properties?.name || '';
        const nameB = b.properties?.name || '';
        return nameA.localeCompare(nameB);
    });
}

function main() {
    console.log('='.repeat(60));
    console.log('Madinah Data Generator');
    console.log('='.repeat(60));

    try {
        const osmPOIs = loadJSON(OSM_DATA_FILE);
        const osmRoads = loadJSON(OSM_ROADS_FILE);
        const osmBuildings = loadJSON(OSM_BUILDINGS_FILE);

        console.log(`\nLoaded Madinah OSM Data:`);
        console.log(`  POIs: ${osmPOIs.length}`);
        console.log(`  Roads: ${osmRoads.length}`);
        console.log(`  Buildings: ${osmBuildings.length}`);

        const sortedPOIs = sortPOIs(osmPOIs);

        const jsContent = `// Data Lokasi Penting Madinah - Masjid Nabawi & Sekitarnya (OSM Map-4)
// Total POIs: ${sortedPOIs.length}
// Total Roads: ${osmRoads.length}
// Total Buildings: ${osmBuildings.length}

const madinahLocations = ${JSON.stringify(sortedPOIs, null, 4)};

const madinahRoads = ${JSON.stringify(osmRoads, null, 4)};

const madinahBuildings = ${JSON.stringify(osmBuildings, null, 4)};
`;

        fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf-8');
        console.log(`\nSaved to ${OUTPUT_FILE}`);

        console.log('\nStatistics by Type:');
        const typeCounts = {};
        for (const poi of sortedPOIs) {
            const poiType = poi.properties?.type || 'Unknown';
            typeCounts[poiType] = (typeCounts[poiType] || 0) + 1;
        }
        for (const [type, count] of Object.entries(typeCounts).sort()) {
            console.log(`  ${type}: ${count}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('Generation Complete!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\nERROR:', error.message);
        process.exit(1);
    }
}

main();
