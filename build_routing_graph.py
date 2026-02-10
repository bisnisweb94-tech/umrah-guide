import xml.etree.ElementTree as ET
import sys
import math
import json

OSM_FILE = "/Users/aditya/Downloads/map-3.osm"
OUTPUT_FILE = "/Users/aditya/.gemini/antigravity/scratch/umrah-guide/haram-routing-graph.js"

# Allowed highway types for walking (expanded for full Makkah coverage)
WALKABLE_TYPES = {
    'footway', 'pedestrian', 'path', 'steps', 'corridor', 'service', 
    'track', 'residential', 'living_street', 'elevator',
    'primary', 'secondary', 'tertiary', 'trunk', 'unclassified'
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371e3
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return c * R

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print(f"Building routing graph from {OSM_FILE}...")
    
    # 1. First pass: Collect all Nodes in memory (ID -> Lat/Lon)
    # We only need nodes that are part of walkable ways.
    # To save memory, we might need 2 passes: 
    # Pass 1: Find walkable Ways and their Node IDs.
    # Pass 2: Load coords for those Node IDs.
    
    print("Pass 1: Identifying relevant nodes from walkable ways...")
    relevant_node_ids = set()
    walkable_ways = [] # List of lists of node IDs

    context = ET.iterparse(OSM_FILE, events=('end',))
    for event, elem in context:
        if elem.tag == 'way':
            tags = {child.get('k'): child.get('v') for child in elem.findall('tag')}
            highway = tags.get('highway')
            
            # Check if walkable
            if highway in WALKABLE_TYPES or tags.get('foot') == 'yes':
                nds = [nd.get('ref') for nd in elem.findall('nd')]
                if len(nds) > 1:
                    walkable_ways.append(nds)
                    relevant_node_ids.update(nds)
            
            elem.clear()
            
    print(f"Found {len(walkable_ways)} walkable ways. Relevant nodes: {len(relevant_node_ids)}")
    
    # 2. Pass 2: Get coordinates for relevant nodes
    print("Pass 2: Extracting coordinates...")
    node_coords = {} # ID -> [lat, lon]
    
    context = ET.iterparse(OSM_FILE, events=('end',))
    for event, elem in context:
        if elem.tag == 'node':
            id_ = elem.get('id')
            if id_ in relevant_node_ids:
                node_coords[id_] = [float(elem.get('lat')), float(elem.get('lon'))]
            elem.clear()
            
    print(f"Loaded coordinates for {len(node_coords)} nodes.")

    # 3. Build Adjacency Graph
    # Structure: node_id -> { neighbor_id: distance, ... }
    print("Building adjacency graph...")
    graph = {} 
    
    for way_nodes in walkable_ways:
        for i in range(len(way_nodes) - 1):
            u, v = way_nodes[i], way_nodes[i+1]
            
            if u not in node_coords or v not in node_coords:
                continue # Skip if missing coords (shouldn't happen)
            
            dist = haversine(node_coords[u][0], node_coords[u][1], node_coords[v][0], node_coords[v][1])
            dist = round(dist, 2) # Round to cm
            
            # Add edge U -> V
            if u not in graph: graph[u] = {}
            graph[u][v] = dist
            
            # Add edge V -> U (Undirected)
            if v not in graph: graph[v] = {}
            graph[v][u] = dist

    # 4. Serialize to efficient JSON
    # We'll save: 
    # nodes: { id: [lat, lon] }
    # adj: { id: { neighbor_id: dist } }
    
    output_data = {
        "nodes": node_coords,
        "adj": graph
    }
    
    print(f"Writing to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w') as f:
        f.write("const routingGraph = ")
        json.dump(output_data, f)
        f.write(";")
        
    print("Done!")

if __name__ == "__main__":
    main()
