
const fs = require('fs');

const toiletData = {
    "type": "FeatureCollection",
    "generator": "overpass-turbo",
    "copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.",
    "timestamp": "2026-02-12T14:43:44Z",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "@id": "way/444718630",
                "access": "permissive",
                "amenity": "toilets",
                "building": "yes",
                "fee": "no",
                "male": "yes",
                "name": "دورات مياه الرجال - 6",
                "name:en": "Men's Toilets - 6"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8231372, 21.4204508], [39.8231334, 21.4204389], [39.8230994, 21.4204482], [39.8230939, 21.4204307],
                        [39.8230721, 21.4204366], [39.8230671, 21.420421], [39.8230512, 21.4204254], [39.823, 21.4202638],
                        [39.8232158, 21.4202045], [39.8232653, 21.4203605], [39.8232535, 21.4203638], [39.8232591, 21.4203815],
                        [39.823232, 21.4203889], [39.8232387, 21.4204099], [39.8232173, 21.4204158], [39.8232211, 21.4204277],
                        [39.8231372, 21.4204508]
                    ]
                ]
            },
            "id": "way/444718630"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427918",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8252752, 21.4265989], [39.8253151, 21.4264403], [39.825412, 21.4264608], [39.8253747, 21.4266231], [39.8252752, 21.4265989]
                    ]
                ]
            },
            "id": "way/620427918"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427920",
                "amenity": "toilets",
                "building": "yes",
                "female": "yes",
                "height": "2.5",
                "name:tr": "Kadınlar Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8256969, 21.4266483], [39.8257168, 21.4264756], [39.8258233, 21.4264862], [39.8258034, 21.426659], [39.8256969, 21.4266483]
                    ]
                ]
            },
            "id": "way/620427920"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427922",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name": "دورات مياه الرجال - 13",
                "name:en": "Men's Toilets - 13",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8250195, 21.4261655], [39.8250802, 21.4259834], [39.8252029, 21.4260146], [39.8251471, 21.4262012], [39.8250195, 21.4261655]
                    ]
                ]
            },
            "id": "way/620427922"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427924",
                "amenity": "toilets",
                "building": "yes",
                "female": "yes",
                "height": "2.5",
                "name": "دورات مياه النساء - 14",
                "name:en": "Women's Toiltets - 14",
                "name:tr": "Kadınlar Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8260134, 21.4263157], [39.8260138, 21.4261307], [39.8261442, 21.4261315], [39.8261373, 21.426321], [39.8260134, 21.4263157]
                    ]
                ]
            },
            "id": "way/620427924"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427925",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8246296, 21.4260335], [39.8247061, 21.4258593], [39.8248235, 21.4259026], [39.8247499, 21.4260768], [39.8246296, 21.4260335]
                    ]
                ]
            },
            "id": "way/620427925"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427927",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8238216, 21.42608], [39.8239343, 21.4259195], [39.8240438, 21.4259804], [39.8239389, 21.4261427], [39.8238216, 21.42608]
                    ]
                ]
            },
            "id": "way/620427927"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427929",
                "amenity": "toilets",
                "building": "yes",
                "female": "yes",
                "height": "2.5",
                "name:tr": "Kadınlar Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8234695, 21.4258504], [39.8235925, 21.4256982], [39.8236967, 21.4257752], [39.8235708, 21.4259248], [39.8234695, 21.4258504]
                    ]
                ]
            },
            "id": "way/620427929"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427930",
                "amenity": "toilets",
                "building": "yes",
                "female": "yes",
                "height": "2.5",
                "name": "دورات مياه النساء - 11",
                "name:en": "Women's Toiltets - 11",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8232884, 21.4252093], [39.8232163, 21.4251435], [39.8232726, 21.4250945], [39.8232925, 21.4251108],
                        [39.823321, 21.4250861], [39.8233056, 21.4250724], [39.8233575, 21.4250283], [39.823351, 21.4250218],
                        [39.8233655, 21.42501], [39.8234457, 21.425087], [39.8234267, 21.4251024], [39.8233518, 21.4251664],
                        [39.8233437, 21.4251607], [39.8233198, 21.425182], [39.8232884, 21.4252093]
                    ]
                ]
            },
            "id": "way/620427930"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427931",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti",
                "ref": "T10"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8224313, 21.4248165], [39.8225979, 21.424709], [39.8226732, 21.424809], [39.8225039, 21.4249153], [39.8224313, 21.4248165]
                    ]
                ]
            },
            "id": "way/620427931"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427932",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti",
                "ref": "T9"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8222784, 21.4245817], [39.8222161, 21.4244743], [39.8223933, 21.4243852], [39.8224556, 21.4244926], [39.8222784, 21.4245817]
                    ]
                ]
            },
            "id": "way/620427932"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427933",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti",
                "ref": "T8"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.822495, 21.4241433], [39.8224439, 21.4240392], [39.8226327, 21.4239587], [39.8226839, 21.4240627], [39.822495, 21.4241433]
                    ]
                ]
            },
            "id": "way/620427933"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620427934",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8230268, 21.4249317], [39.8229466, 21.4248366], [39.8231092, 21.4247177], [39.8231894, 21.4248128], [39.8230268, 21.4249317]
                    ]
                ]
            },
            "id": "way/620427934"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620428885",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8223369, 21.4237732], [39.8222985, 21.4236616], [39.8224904, 21.4236068], [39.822525, 21.4237147], [39.8223369, 21.4237732]
                    ]
                ]
            },
            "id": "way/620428885"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620428886",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8221952, 21.4233397], [39.822169, 21.4232141], [39.822371, 21.4231776], [39.8223972, 21.4233032], [39.8221952, 21.4233397]
                    ]
                ]
            },
            "id": "way/620428886"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620428887",
                "amenity": "toilets",
                "building": "yes",
                "female": "yes",
                "height": "2.5",
                "name": "دورات مياه النساء - 8",
                "name:en": "Women's WC - 8",
                "name:tr": "Kadınlar Tuvaleti - 8"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8225749, 21.4226116], [39.8225773, 21.4225831], [39.8225794, 21.422559], [39.8225809, 21.4224893],
                        [39.8228, 21.422504], [39.8227943, 21.4226215], [39.8225749, 21.4226116]
                    ]
                ]
            },
            "id": "way/620428887"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620428888",
                "amenity": "toilets",
                "building": "yes",
                "height": "2.5",
                "male": "yes",
                "name:tr": "Erkekler Tuvaleti"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8230239, 21.4231774], [39.8230011, 21.423062], [39.8231963, 21.4230286], [39.8232192, 21.4231439], [39.8230239, 21.4231774]
                    ]
                ]
            },
            "id": "way/620428888"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/620428889",
                "amenity": "toilets",
                "building": "yes",
                "female": "yes",
                "height": "2.5",
                "name": "دورات مياه النساء - 7",
                "name:en": "Women's WC - 7",
                "name:tr": "Kadınlar Tuvaleti - 7"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8225895, 21.4222742], [39.8225905, 21.4222435], [39.8225913, 21.4222163], [39.8225941, 21.4221533],
                        [39.8228079, 21.4221605], [39.8228023, 21.4222804], [39.8225895, 21.4222742]
                    ]
                ]
            },
            "id": "way/620428889"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "way/621288961",
                "amenity": "toilets",
                "building": "yes",
                "female": "yes"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [39.8244831, 21.4204047], [39.8244504, 21.4203216], [39.8246092, 21.4202635], [39.8246447, 21.4203466], [39.8244831, 21.4204047]
                    ]
                ]
            },
            "id": "way/621288961"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/5862054603", "amenity": "toilets", "check_date": "2021-10-19", "male": "yes" },
            "geometry": { "type": "Point", "coordinates": [39.8286892, 21.4248517] },
            "id": "node/5862054603"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/5862054604", "amenity": "toilets", "check_date": "2021-10-19", "female": "yes" },
            "geometry": { "type": "Point", "coordinates": [39.8282164, 21.4250444] },
            "id": "node/5862054604"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/5862288832", "amenity": "toilets", "male": "yes" },
            "geometry": { "type": "Point", "coordinates": [39.8300249, 21.4232362] },
            "id": "node/5862288832"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/5862288833", "amenity": "toilets", "female": "yes" },
            "geometry": { "type": "Point", "coordinates": [39.83031, 21.4229161] },
            "id": "node/5862288833"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/5869157285", "amenity": "toilets", "male": "yes", "name": "حمامات رجال", "name:ar": "حمامات رجال", "name:en": "Men's WC - 8" },
            "geometry": { "type": "Point", "coordinates": [39.8237035, 21.4206025] },
            "id": "node/5869157285"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339022", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8213574, 21.4251632] },
            "id": "node/12898339022"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339023", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8211451, 21.4252752] },
            "id": "node/12898339023"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339024", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8207911, 21.4254201] },
            "id": "node/12898339024"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339025", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8216689, 21.4258089] },
            "id": "node/12898339025"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339026", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8213928, 21.4260725] },
            "id": "node/12898339026"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339027", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8219166, 21.4256376] },
            "id": "node/12898339027"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339028", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8226032, 21.4264151] },
            "id": "node/12898339028"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339029", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8224758, 21.4266457] },
            "id": "node/12898339029"
        },
        {
            "type": "Feature",
            "properties": { "@id": "node/12898339030", "amenity": "toilets" },
            "geometry": { "type": "Point", "coordinates": [39.8222847, 21.4269422] },
            "id": "node/12898339030"
        }
    ]
};

// --- Helpers ---

function calculateCentroid(coordinates) {
    if (coordinates.length === 0) return [0, 0];
    let lat = 0, lon = 0;
    const ring = coordinates[0];
    ring.forEach(c => {
        lon += c[0];
        lat += c[1];
    });
    return [lon / ring.length, lat / ring.length];
}

// --- Load Current Data ---
const currentPath = 'masjidil-haram-data.js';
let currentContent = fs.readFileSync(currentPath, 'utf8');
const locationsMatch = currentContent.match(/const masjidilHaramLocations = (\[[\s\S]*?\]);/);
let locations = JSON.parse(locationsMatch[1]);

const existingIds = new Set(locations.map(l => String(l.properties.osm_id)));
let addedCount = 0;

// --- Process Toilet Data ---
toiletData.features.forEach(f => {
    const props = f.properties;
    const id = String(f.id);

    if (existingIds.has(id)) return;

    let coords;
    if (f.geometry.type === 'Polygon') {
        coords = calculateCentroid(f.geometry.coordinates);
    } else {
        coords = f.geometry.coordinates;
    }

    let name = props.name || props['name:en'] || props['name:tr'] || 'Toilet';
    let nameEn = props['name:en'] || props.name || 'Toilet';

    // Determine specific icon/label if gender is known
    let icon = 'fa-restroom';
    let typeLabel = 'Toilet';

    if (props.male === 'yes') {
        icon = 'fa-male';
        typeLabel = 'Toilet (Men)';
        if (!nameEn.toLowerCase().includes('men')) nameEn += ' (Men)';
    } else if (props.female === 'yes') {
        icon = 'fa-female';
        typeLabel = 'Toilet (Women)';
        if (!nameEn.toLowerCase().includes('women')) nameEn += ' (Women)';
    }

    const feature = {
        "type": "Feature",
        "properties": {
            "name": name,
            "name_en": nameEn,
            "type": "Toilet",
            "icon": icon,
            "description": `${typeLabel} - ${nameEn}`,
            "osm_id": id
        },
        "geometry": {
            "type": "Point",
            "coordinates": coords
        }
    };

    locations.push(feature);
    addedCount++;
});

// --- Save ---
const newContent = `// Data Lokasi Penting Masjidil Haram - Versi Premium (OSM Map-3 Updated)
// Diperbarui dengan data dari map-3.osm, overpass-turbo (toilets), dan transliterasi otomatis
// Total POIs: ${locations.length}

const masjidilHaramLocations = ${JSON.stringify(locations, null, 4)};
`;

fs.writeFileSync(currentPath, newContent);
console.log(`Added ${addedCount} toilets. Total POIs: ${locations.length}`);
