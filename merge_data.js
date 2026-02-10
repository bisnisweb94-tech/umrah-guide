const fs = require('fs');

// Read the original JS file
let originalContent = fs.readFileSync('masjidil-haram-data.js', 'utf8');

// Extract the array part (rough parsing)
const startMatch = originalContent.indexOf('const masjidilHaramLocations = [');
const endMatch = originalContent.lastIndexOf('];');

if (startMatch === -1 || endMatch === -1) {
    console.error("Could not find data array in file.");
    process.exit(1);
}

const header = originalContent.substring(0, startMatch + 'const masjidilHaramLocations = '.length);
const footer = originalContent.substring(endMatch + 1);

// Get current data
let currentDataString = originalContent.substring(startMatch + 'const masjidilHaramLocations = '.length, endMatch + 1);
// Fix JSON syntax for parsing (remove JS comments if any, though our file is cleanish)
// A safer way is to just eval it or use a regex to remove comments, but let's try strict JSON parse after minor cleanup if needed. 
// Actually, since it's a JS file, it might have unquoted keys or comments. 
// Let's rely on the structure being close to JSON.
// To be safe, let's just REPLACE the last item.

// Wait, I can just use string manipulation to remove the last item and append the new file content.
const lastItemIndex = currentDataString.lastIndexOf('{'); // Find start of last item
const dataWithoutLastItem = currentDataString.substring(0, lastItemIndex).trim();
// Remove trailing comma if exists
const cleanDataStart = dataWithoutLastItem.replace(/,$/, '');

// Read new toilets data
const toiletsData = fs.readFileSync('toilets_data.json', 'utf8');
const toiletsArrayString = toiletsData.trim().substring(1, toiletsData.trim().length - 1); // Remove [ and ]

// Merge
const newData = cleanDataStart + ",\n" + toiletsArrayString + "\n]";

const newFileContent = header + newData + footer;

fs.writeFileSync('masjidil-haram-data.js', newFileContent);
console.log("Data merged successfully.");
