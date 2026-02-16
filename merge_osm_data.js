#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const OSM_DATA_FILE = path.join(__dirname, 'osm_data/osm_all_pois.json');
const OSM_ROADS_FILE = path.join(__dirname, 'osm_data/osm_roads.json');
const OSM_BUILDINGS_FILE = path.join(__dirname, 'osm_data/osm_buildings.json');
const EXISTING_DATA_FILE = path.join(__dirname, 'masjidil-haram-data.js');
const OUTPUT_FILE = path.join(__dirname, 'masjidil-haram-data.js');
const BACKUP_FILE = path.join(__dirname, 'masjidil-haram-data-backup.js');

const COORD_THRESHOLD = 0.0001;

function loadExistingData() {
    console.log('Loading existing data...');
    if (!fs.existsSync(EXISTING_DATA_FILE)) return [];

    // Backup first
    fs.copyFileSync(EXISTING_DATA_FILE, BACKUP_FILE);
    console.log(`  Backup created: ${BACKUP_FILE}`);

    const content = fs.readFileSync(EXISTING_DATA_FILE, 'utf-8');

    // Replace const with var to allow vm context capture
    // Robust replacement for variable declaration
    const code = content.replace(/const\s+masjidilHaramLocations\s*=/, 'var masjidilHaramLocations =');

    const sandbox = {};
    vm.createContext(sandbox);

    try {
        vm.runInContext(code, sandbox);
    } catch (e) {
        console.error('  Error parsing existing JS:', e.message);
        return [];
    }

    const locations = sandbox.masjidilHaramLocations || [];
    console.log(`  Found ${locations.length} existing POIs`);
    return locations;
}

function loadJSON(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

function isDuplicate(poi1, poi2, threshold = COORD_THRESHOLD) {
    // Get coordinates
    const coords1 = poi1.geometry?.coordinates;
    const coords2 = poi2.geometry?.coordinates;

    if (!coords1 || !coords2) return false;

    // Check coordinate proximity
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const latDiff = Math.abs(lat1 - lat2);
    const lonDiff = Math.abs(lon1 - lon2);

    if (latDiff < threshold && lonDiff < threshold) {
        return true;
    }

    // Check name similarity
    const name1 = (poi1.properties?.name || '').toLowerCase();
    const name2 = (poi2.properties?.name || '').toLowerCase();

    if (name1 && name2 && name1 === name2) {
        return true;
    }

    // Check OSM ID match (Idempotency)
    const id1 = poi1.properties?.osm_id;
    const id2 = poi2.properties?.osm_id;
    if (id1 && id2 && String(id1) === String(id2)) {
        return true;
    }

    return false;
}

function mergePOIs(existingPOIs, osmPOIs) {
    console.log('\nMerging and deduplicating POIs...');

    const merged = [...existingPOIs];
    let duplicates = 0;
    let added = 0;

    for (const osmPOI of osmPOIs) {
        // Check if this POI is a duplicate
        const isDup = merged.some(existing => isDuplicate(existing, osmPOI));

        if (!isDup) {
            merged.push(osmPOI);
            added++;
        } else {
            duplicates++;
        }
    }

    console.log(`  Duplicates found: ${duplicates}`);
    console.log(`  New POIs added: ${added}`);
    console.log(`  Total POIs: ${merged.length}`);

    return merged;
}

function sortPOIs(pois) {
    const typeOrder = {
        'Holy Site': 0,
        'Main Gate': 1,
        'Gate': 2,
        'W C': 3,          // New High Priority
        'Zamzam/Water': 4, // New High Priority
        'Medical': 5,
        'Transportation': 6,
        'Hotel': 7,
        'Amenities': 8,
        'Escalator': 9,    // Facilities
        'Elevator': 10,    // Facilities
        'Stairs': 11,      // Facilities
        'Support': 12,
        'Landmark': 13,
    };

    return pois.sort((a, b) => {
        const typeA = a.properties?.type || 'Landmark';
        const typeB = b.properties?.type || 'Landmark';

        const orderA = typeOrder[typeA] ?? 99;
        const orderB = typeOrder[typeB] ?? 99;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        const nameA = a.properties?.name || '';
        const nameB = b.properties?.name || '';

        return nameA.localeCompare(nameB);
    });
}

function saveAllData(pois, roads, buildings) {
    console.log('\nSaving merged data...');

    // Sort POIs
    const sortedPOIs = sortPOIs(pois);

    // Create JavaScript file content
    const jsContent = `// Data Lokasi Penting Masjidil Haram - Versi Premium (OSM Map-4)
// Diperbarui dengan koordinat lebih akurat dan kategori tambahan
// Total POIs: ${sortedPOIs.length}
// Total Roads: ${roads.length}
// Total Buildings: ${buildings.length}

const masjidilHaramLocations = ${JSON.stringify(sortedPOIs, null, 4)};

const masjidilHaramRoads = ${JSON.stringify(roads, null, 4)};

const masjidilHaramBuildings = ${JSON.stringify(buildings, null, 4)};
`;

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf-8');

    console.log(`  Saved to ${OUTPUT_FILE}`);

    // Print statistics
    console.log('\nFinal Statistics by Type:');
    const typeCounts = {};
    for (const poi of sortedPOIs) {
        const poiType = poi.properties?.type || 'Unknown';
        typeCounts[poiType] = (typeCounts[poiType] || 0) + 1;
    }

    for (const [type, count] of Object.entries(typeCounts).sort()) {
        console.log(`  ${type}: ${count}`);
    }
}


function main() {
    console.log('='.repeat(60));
    console.log('OSM Data Gen Tool (Node.js)');
    console.log('='.repeat(60));

    try {
        // Load Fresh OSM Data
        const osmPOIs = loadJSON(OSM_DATA_FILE);
        const osmRoads = loadJSON(OSM_ROADS_FILE);
        const osmBuildings = loadJSON(OSM_BUILDINGS_FILE);

        console.log(`\nLoaded Fresh OSM Data:`);
        console.log(`  POIs: ${osmPOIs.length}`);
        console.log(`  Roads: ${osmRoads.length}`);
        console.log(`  Buildings: ${osmBuildings.length}`);

        // Save (Overwrite)
        saveAllData(osmPOIs, osmRoads, osmBuildings);

        console.log('\n' + '='.repeat(60));
        console.log('Generation Complete!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\nERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
