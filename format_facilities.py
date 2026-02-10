import json

# Load facilities data
with open('facilities_update.json', 'r') as f:
    facilities = json.load(f)

# Convert to JS format
js_entries = []
for item in facilities:
    js_entries.append(json.dumps(item, indent=4, ensure_ascii=False))

# Join with commas
facilities_js = ',\n'.join(js_entries)

# Save to a separate file that can be manually inserted
with open('facilities_to_insert.txt', 'w', encoding='utf-8') as f:
    f.write(facilities_js)

print(f"Generated {len(facilities)} facility entries")
print("Saved to facilities_to_insert.txt")
print("\nYou can now manually insert this after the last hotel entry in masjidil-haram-data.js")
