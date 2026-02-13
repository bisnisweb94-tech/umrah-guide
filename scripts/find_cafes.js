
const fs = require('fs');
const readline = require('readline');

// Kaaba Coordinates (Center)
const CENTER_LAT = 21.422487;
const CENTER_LON = 39.826206;

const COFFEE_BRANDS = ['starbucks', 'dunkin', 'costa', 'tim hortons', 'caribou', 'barn', 'half million', 'overdose', 'jolt', 'arabica'];

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function isCoffeeRelated(name, tags) {
    if (!name) return false;
    const lowName = name.toLowerCase();

    if (lowName.includes('cafe') || lowName.includes('coffee') || lowName.includes('مقاهي') || lowName.includes('كوفي') || lowName.includes('مقهى')) {
        return true;
    }

    if (COFFEE_BRANDS.some(brand => lowName.includes(brand))) {
        return true;
    }

    if (tags && (tags['amenity'] === 'cafe' || tags['amenity'] === 'coffee_shop')) {
        return true;
    }

    return false;
}

// 1. Search in masjidil-haram-data.js
const currentDataContent = fs.readFileSync('masjidil-haram-data.js', 'utf8');
const cleanedContent = currentDataContent.replace(/const masjidilHaramLocations =/, 'return').replace(/;$/, '');
const currentLocations = new Function(cleanedContent)();

const foundInDB = currentLocations.filter(loc => {
    const props = loc.properties;
    return isCoffeeRelated(props.name, props) || isCoffeeRelated(props.name_en, props);
}).map(loc => {
    const [lon, lat] = loc.geometry.coordinates;
    const dist = haversine(CENTER_LAT, CENTER_LON, lat, lon);
    return {
        name: loc.properties.name,
        name_en: loc.properties.name_en,
        distance: dist.toFixed(2),
        source: 'Database'
    };
}).filter(item => item.distance <= 2);

// 2. Search in map-3.osm (Line by line)
async function searchOsm() {
    const fileStream = fs.createReadStream('osm_data/map-3.osm');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentNode = null;
    let foundInOsm = [];

    for await (const line of rl) {
        if (line.includes('<node')) {
            const idMatch = line.match(/id="(\d+)"/);
            const latMatch = line.match(/lat="([\d\.]+)"/);
            const lonMatch = line.match(/lon="([\d\.]+)"/);
            if (idMatch && latMatch && lonMatch) {
                currentNode = {
                    id: idMatch[1],
                    lat: parseFloat(latMatch[2]),
                    lon: parseFloat(lonMatch[3]),
                    tags: {}
                };
            }
        } else if (line.includes('<tag') && currentNode) {
            const kMatch = line.match(/k="([^"]+)"/);
            const vMatch = line.match(/v="([^"]+)"/);
            if (kMatch && vMatch) {
                currentNode.tags[kMatch[1]] = vMatch[2];
            }
        } else if (line.includes('</node>') && currentNode) {
            const tags = currentNode.tags;
            if (isCoffeeRelated(tags['name'], tags) || isCoffeeRelated(tags['name:en'], tags)) {
                const dist = haversine(CENTER_LAT, CENTER_LON, currentNode.lat, currentNode.lon);
                if (dist <= 2) {
                    foundInOsm.push({
                        name: tags['name'] || 'Unnamed Cafe',
                        name_en: tags['name:en'] || tags['name'] || '',
                        distance: dist.toFixed(2),
                        source: 'OSM XML'
                    });
                }
            }
            currentNode = null;
        }
    }
    return foundInOsm;
}

searchOsm().then(foundInOsm => {
    const allCafes = [...foundInDB, ...foundInOsm];
    const uniqueCafes = [];
    const seen = new Set();
    allCafes.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).forEach(c => {
        const key = (c.name_en || c.name).toLowerCase() + '|' + c.distance;
        // Simple deduplication if name and distance are very close
        if (!uniqueCafes.some(existing => (existing.name_en === c.name_en || existing.name === c.name) && Math.abs(parseFloat(existing.distance) - parseFloat(c.distance)) < 0.01)) {
            uniqueCafes.push(c);
        }
    });
    console.log(JSON.stringify(uniqueCafes, null, 2));
});
