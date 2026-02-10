import json
import math

GRAPH_FILE = "/Users/aditya/.gemini/antigravity/scratch/umrah-guide/haram-routing-graph.js"

# Gates from masjidil-haram-data.js
GATES = {
    "Gate 30 (Fateh)": [21.4240151, 39.8265147],
    "Gate 100 (King Abdullah)": [21.425391, 39.824132]
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
    with open(GRAPH_FILE, 'r') as f:
        content = f.read()
        # Remove "const routingGraph = " and ";"
        json_str = content.replace("const routingGraph = ", "").rstrip(";")
        data = json.loads(json_str)
    
    nodes = data['nodes']
    adj = data['adj']
    
    print(f"Total Nodes in Graph: {len(nodes)}")
    
    for gate_name, gate_coords in GATES.items():
        gate_lat, gate_lon = gate_coords
        min_dist = float('inf')
        nearest_node = None
        
        for node_id, coords in nodes.items():
            dist = haversine(gate_lat, gate_lon, coords[0], coords[1])
            if dist < min_dist:
                min_dist = dist
                nearest_node = node_id
        
        print(f"\n{gate_name}:")
        print(f"  Nearest Node ID: {nearest_node}")
        print(f"  Distance: {min_dist:.2f} meters")
        
        if nearest_node in adj:
            neighbors = len(adj[nearest_node])
            print(f"  Connectivity: {neighbors} neighbors (Terhubung)")
        else:
            print("  Connectivity: 0 neighbors (TERPUTUS)")

if __name__ == "__main__":
    main()
