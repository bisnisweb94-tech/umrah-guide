#!/usr/bin/env python3
"""
Merge extracted OSM data with existing masjidil-haram-data.js
Handles deduplication and creates comprehensive dataset.
"""

import json
import re
from pathlib import Path

# Paths
OSM_DATA_DIR = Path('/Users/aditya/.gemini/antigravity/scratch/umrah-guide/osm_data/')
EXISTING_DATA_FILE = Path('/Users/aditya/.gemini/antigravity/scratch/umrah-guide/masjidil-haram-data.js')
OUTPUT_FILE = Path('/Users/aditya/.gemini/antigravity/scratch/umrah-guide/masjidil-haram-data-merged.js')

# Deduplication threshold (in degrees, ~11 meters)
COORD_THRESHOLD = 0.0001

def load_existing_data():
    """Load existing JavaScript data file."""
    print("Loading existing data...")
    
    with open(EXISTING_DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract JSON array from JavaScript file
    # Find the start of the array
    start_idx = content.find('const masjidilHaramLocations = [')
    if start_idx == -1:
        print("ERROR: Could not find masjidilHaramLocations array")
        return []
    
    # Find the matching closing bracket
    start_idx += len('const masjidilHaramLocations = ')
    bracket_count = 0
    end_idx = start_idx
    
    for i in range(start_idx, len(content)):
        if content[i] == '[':
            bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_idx = i + 1
                break
    
    json_str = content[start_idx:end_idx]
    existing_pois = json.loads(json_str)
    
    print(f"  Found {len(existing_pois)} existing POIs")
    return existing_pois

def load_osm_data():
    """Load all extracted OSM data."""
    print("\nLoading OSM data...")
    
    osm_file = OSM_DATA_DIR / 'osm_all_pois.json'
    with open(osm_file, 'r', encoding='utf-8') as f:
        osm_pois = json.load(f)
    
    print(f"  Found {len(osm_pois)} OSM POIs")
    return osm_pois

def normalize_coordinates(coords):
    """Normalize coordinates to [lon, lat] format."""
    if isinstance(coords, list) and len(coords) == 2:
        return coords
    return None

def is_duplicate(poi1, poi2, threshold=COORD_THRESHOLD):
    """Check if two POIs are duplicates based on coordinates or name."""
    # Get coordinates
    coords1 = poi1.get('geometry', {}).get('coordinates')
    coords2 = poi2.get('geometry', {}).get('coordinates')
    
    if not coords1 or not coords2:
        return False
    
    # Check coordinate proximity
    lon1, lat1 = coords1[0], coords1[1]
    lon2, lat2 = coords2[0], coords2[1]
    
    lat_diff = abs(lat1 - lat2)
    lon_diff = abs(lon1 - lon2)
    
    if lat_diff < threshold and lon_diff < threshold:
        return True
    
    # Check name similarity
    name1 = poi1.get('properties', {}).get('name', '').lower()
    name2 = poi2.get('properties', {}).get('name', '').lower()
    
    if name1 and name2 and name1 == name2:
        return True
    
    return False

def merge_pois(existing_pois, osm_pois):
    """Merge OSM POIs with existing POIs, removing duplicates."""
    print("\nMerging and deduplicating...")
    
    merged = existing_pois.copy()
    duplicates = 0
    added = 0
    
    for osm_poi in osm_pois:
        # Check if this POI is a duplicate
        is_dup = False
        for existing_poi in merged:
            if is_duplicate(existing_poi, osm_poi):
                is_dup = True
                duplicates += 1
                break
        
        if not is_dup:
            merged.append(osm_poi)
            added += 1
    
    print(f"  Duplicates found: {duplicates}")
    print(f"  New POIs added: {added}")
    print(f"  Total POIs: {len(merged)}")
    
    return merged

def sort_pois(pois):
    """Sort POIs by type and name."""
    type_order = {
        'Holy Site': 0,
        'Main Gate': 1,
        'Gate': 2,
        'Hotel': 3,
        'Medical': 4,
        'Transportation': 5,
        'Amenities': 6,
        'Support': 7,
        'Landmark': 8,
    }
    
    def sort_key(poi):
        poi_type = poi.get('properties', {}).get('type', 'Landmark')
        poi_name = poi.get('properties', {}).get('name', '')
        return (type_order.get(poi_type, 99), poi_name)
    
    return sorted(pois, key=sort_key)

def save_merged_data(pois):
    """Save merged data to JavaScript file."""
    print("\nSaving merged data...")
    
    # Sort POIs
    pois = sort_pois(pois)
    
    # Convert to JSON string
    json_str = json.dumps(pois, ensure_ascii=False, indent=4)
    
    # Create JavaScript file content
    js_content = f"""/**
 * Masjidil Haram POI Data
 * Combined from manual entries and OSM extraction
 * Total POIs: {len(pois)}
 */

const masjidilHaramLocations = {json_str};
"""
    
    # Save to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"  Saved to {OUTPUT_FILE}")
    
    # Print statistics
    print("\nFinal Statistics by Type:")
    type_counts = {}
    for poi in pois:
        poi_type = poi.get('properties', {}).get('type', 'Unknown')
        type_counts[poi_type] = type_counts.get(poi_type, 0) + 1
    
    for poi_type, count in sorted(type_counts.items()):
        print(f"  {poi_type}: {count}")

def main():
    """Main merge process."""
    print("=" * 60)
    print("OSM Data Merge Tool")
    print("=" * 60)
    
    # Load data
    existing_pois = load_existing_data()
    osm_pois = load_osm_data()
    
    # Merge
    merged_pois = merge_pois(existing_pois, osm_pois)
    
    # Save
    save_merged_data(merged_pois)
    
    print("\n" + "=" * 60)
    print("Merge Complete!")
    print("=" * 60)
    print(f"\nNext step: Review {OUTPUT_FILE}")
    print("If satisfied, replace masjidil-haram-data.js with this file.")

if __name__ == '__main__':
    main()
