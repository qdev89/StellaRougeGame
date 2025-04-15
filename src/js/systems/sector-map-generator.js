/**
 * Sector Map Generator
 * Generates a map of interconnected sectors with different types and paths
 */
class SectorMapGenerator {
    constructor() {
        // Map structure settings
        this.mapWidth = 4;      // Number of nodes horizontally
        this.mapHeight = 3;     // Number of layers vertically
        this.branchFactor = 2;  // Maximum connections from one node
        
        // Sector type weights (chance of each type appearing)
        this.sectorTypeWeights = {
            COMBAT: 50,
            ELITE: 15,
            HAZARD: 20,
            MERCHANT: 10,
            EVENT: 5
        };
        
        // Boss is always at the end
        this.bossNodePosition = this.mapHeight;
        
        // Store the generated map
        this.sectorMap = null;
    }
    
    /**
     * Generate a complete sector map
     * @param {number} startSector - The starting sector number
     * @returns {Object} The generated sector map
     */
    generateMap(startSector = 1) {
        // Initialize empty map
        this.sectorMap = {
            startSector: startSector,
            nodes: [],
            paths: []
        };
        
        // Generate nodes
        this.generateNodes();
        
        // Generate paths between nodes
        this.generatePaths();
        
        // Ensure all nodes are reachable
        this.ensureConnectivity();
        
        // Assign sector types
        this.assignSectorTypes();
        
        return this.sectorMap;
    }
    
    /**
     * Generate the nodes for the map
     */
    generateNodes() {
        // Create start node (always centered)
        const startNode = {
            id: 0,
            x: Math.floor(this.mapWidth / 2),
            y: 0,
            type: 'START',
            connections: []
        };
        
        this.sectorMap.nodes.push(startNode);
        
        // Create intermediate layer nodes
        let nodeId = 1;
        
        // Generate nodes for each layer
        for (let y = 1; y < this.mapHeight; y++) {
            // Number of nodes in this layer
            const nodesInLayer = Math.min(this.mapWidth, y + 2);
            
            // Create nodes evenly distributed across the width
            for (let i = 0; i < nodesInLayer; i++) {
                const x = i * (this.mapWidth / (nodesInLayer - 1));
                
                const node = {
                    id: nodeId++,
                    x: x,
                    y: y,
                    type: 'UNKNOWN', // Will be assigned later
                    connections: []
                };
                
                this.sectorMap.nodes.push(node);
            }
        }
        
        // Create boss node (always centered)
        const bossNode = {
            id: nodeId,
            x: Math.floor(this.mapWidth / 2),
            y: this.mapHeight,
            type: 'BOSS',
            connections: []
        };
        
        this.sectorMap.nodes.push(bossNode);
    }
    
    /**
     * Generate paths between nodes
     */
    generatePaths() {
        // For each layer except the last
        for (let y = 0; y < this.mapHeight; y++) {
            // Get nodes in current layer
            const currentLayerNodes = this.sectorMap.nodes.filter(node => node.y === y);
            
            // Get nodes in next layer
            const nextLayerNodes = this.sectorMap.nodes.filter(node => node.y === y + 1);
            
            // For each node in current layer
            for (const sourceNode of currentLayerNodes) {
                // Determine how many connections to make
                const connectionCount = Math.min(
                    this.branchFactor,
                    nextLayerNodes.length
                );
                
                // Sort next layer nodes by distance to current node
                const sortedTargets = [...nextLayerNodes].sort((a, b) => {
                    const distA = Math.abs(a.x - sourceNode.x);
                    const distB = Math.abs(b.x - sourceNode.x);
                    return distA - distB;
                });
                
                // Connect to the closest nodes
                for (let i = 0; i < connectionCount; i++) {
                    const targetNode = sortedTargets[i];
                    
                    // Create path
                    const path = {
                        source: sourceNode.id,
                        target: targetNode.id
                    };
                    
                    // Add to paths list
                    this.sectorMap.paths.push(path);
                    
                    // Update node connections
                    sourceNode.connections.push(targetNode.id);
                    targetNode.connections.push(sourceNode.id);
                }
            }
        }
    }
    
    /**
     * Ensure all nodes are reachable from the start
     */
    ensureConnectivity() {
        // Check if all nodes are reachable from start
        const reachableNodes = this.findReachableNodes(0);
        
        // If not all nodes are reachable
        if (reachableNodes.size < this.sectorMap.nodes.length) {
            // For each unreachable node
            for (const node of this.sectorMap.nodes) {
                if (!reachableNodes.has(node.id) && node.id !== 0) {
                    // Find closest reachable node in previous layer
                    const prevLayerNodes = this.sectorMap.nodes.filter(n => 
                        n.y === node.y - 1 && reachableNodes.has(n.id)
                    );
                    
                    if (prevLayerNodes.length > 0) {
                        // Sort by distance
                        prevLayerNodes.sort((a, b) => {
                            const distA = Math.abs(a.x - node.x);
                            const distB = Math.abs(b.x - node.x);
                            return distA - distB;
                        });
                        
                        // Connect to closest reachable node
                        const sourceNode = prevLayerNodes[0];
                        
                        // Create path
                        const path = {
                            source: sourceNode.id,
                            target: node.id
                        };
                        
                        // Add to paths list
                        this.sectorMap.paths.push(path);
                        
                        // Update node connections
                        sourceNode.connections.push(node.id);
                        node.connections.push(sourceNode.id);
                        
                        // Update reachable nodes
                        reachableNodes.add(node.id);
                    }
                }
            }
        }
    }
    
    /**
     * Find all nodes reachable from a starting node
     * @param {number} startNodeId - The ID of the starting node
     * @returns {Set} Set of reachable node IDs
     */
    findReachableNodes(startNodeId) {
        const visited = new Set();
        const queue = [startNodeId];
        
        while (queue.length > 0) {
            const nodeId = queue.shift();
            
            if (!visited.has(nodeId)) {
                visited.add(nodeId);
                
                // Find the node
                const node = this.sectorMap.nodes.find(n => n.id === nodeId);
                
                // Add all connections to queue
                if (node) {
                    for (const connectedId of node.connections) {
                        if (!visited.has(connectedId)) {
                            queue.push(connectedId);
                        }
                    }
                }
            }
        }
        
        return visited;
    }
    
    /**
     * Assign sector types to nodes
     */
    assignSectorTypes() {
        // For each node except start and boss
        for (const node of this.sectorMap.nodes) {
            if (node.type === 'UNKNOWN') {
                // Determine node type based on weights
                node.type = this.selectWeightedSectorType(node.y);
                
                // Ensure elite enemies are more common in later layers
                if (node.y === this.mapHeight - 1) {
                    // Last layer before boss has higher chance of elite
                    if (node.type === 'COMBAT' && Math.random() < 0.5) {
                        node.type = 'ELITE';
                    }
                }
            }
        }
    }
    
    /**
     * Select a sector type based on weights and layer
     * @param {number} layer - The vertical layer (0-based)
     * @returns {string} The selected sector type
     */
    selectWeightedSectorType(layer) {
        // Adjust weights based on layer
        const adjustedWeights = {...this.sectorTypeWeights};
        
        // Later layers have more elites and hazards
        if (layer > 1) {
            adjustedWeights.ELITE += 5 * (layer - 1);
            adjustedWeights.HAZARD += 3 * (layer - 1);
            adjustedWeights.COMBAT -= 8 * (layer - 1);
        }
        
        // Ensure weights don't go below zero
        for (const type in adjustedWeights) {
            adjustedWeights[type] = Math.max(0, adjustedWeights[type]);
        }
        
        // Calculate total weight
        const totalWeight = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
        
        // Generate random value
        let random = Math.random() * totalWeight;
        
        // Select type based on weights
        for (const [type, weight] of Object.entries(adjustedWeights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        // Fallback to COMBAT
        return 'COMBAT';
    }
    
    /**
     * Get available paths from a node
     * @param {number} nodeId - The ID of the node
     * @returns {Array} Array of available next nodes
     */
    getAvailablePaths(nodeId) {
        // Find the node
        const node = this.sectorMap.nodes.find(n => n.id === nodeId);
        
        if (!node) return [];
        
        // Get all connected nodes in the next layer
        return node.connections
            .map(id => this.sectorMap.nodes.find(n => n.id === id))
            .filter(n => n.y === node.y + 1);
    }
    
    /**
     * Get node details by ID
     * @param {number} nodeId - The ID of the node
     * @returns {Object} The node details
     */
    getNodeDetails(nodeId) {
        return this.sectorMap.nodes.find(n => n.id === nodeId);
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.SectorMapGenerator = SectorMapGenerator;
}
