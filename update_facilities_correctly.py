import json

# Read the original file (now restored with hotels)
with open('masjidil-haram-data.js', 'r') as f:
    content = f.read()

# Extract the array content
import re
match = re.search(r'const masjidilHaramLocations = \[(.*)\];', content, re.DOTALL)
if not match:
    print("Error: Could not find array")
    exit(1)

# Parse the JSON array
array_str = '[' + match.group(1) + ']'
try:
    existing_data = json.loads(array_str)
except Exception as e:
    print(f"Parse error: {e}")
    exit(1)

print(f"Loaded {len(existing_data)} existing items")

# Filter out OLD toilets and escalators only
filtered_data = []
for item in existing_data:
    subtype = item['properties'].get('subtype')
    if subtype not in ['Toilet', 'Escalator']:
        filtered_data.append(item)

print(f"After filtering: {len(filtered_data)} items (removed {len(existing_data) - len(filtered_data)} old facilities)")

# Load new facilities
with open('facilities_update.json', 'r') as f:
    new_facilities = json.load(f)

print(f"Adding {len(new_facilities)} new facilities")

# Combine
final_data = filtered_data + new_facilities

print(f"Final total: {len(final_data)} items")

# Write back
output_js = f"""// Data Lokasi Penting Masjidil Haram - Versi Premium (OSM Map-3)
// Diperbarui dengan koordinat lebih akurat dan kategori tambahan

const masjidilHaramLocations = {json.dumps(final_data, indent=4, ensure_ascii=False)};

// Helper functions (Tetap sama)
function getAllLocations() {{
    return masjidilHaramLocations;
}}

function getLocationsByType(type) {{
    return masjidilHaramLocations.filter(loc => loc.properties.type === type);
}}

function searchLocation(query) {{
    const lowerQuery = query.toLowerCase();
    return masjidilHaramLocations.filter(loc =>
        loc.properties.name.toLowerCase().includes(lowerQuery) ||
        loc.properties.name_en.toLowerCase().includes(lowerQuery)
    );
}}
"""

with open('masjidil-haram-data.js', 'w', encoding='utf-8') as f:
    f.write(output_js)

print("Successfully updated masjidil-haram-data.js with hotels preserved!")
