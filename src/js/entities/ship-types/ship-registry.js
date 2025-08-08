/**
 * Ship Registry
 * Manages all available ship types and their unlocking
 */
class ShipRegistry {
    /**
     * Initialize the ship registry
     */
    constructor() {
        // Initialize ship types
        this.shipTypes = {};
        
        // Register default ships
        this.registerDefaultShips();
    }
    
    /**
     * Register default ship types
     */
    registerDefaultShips() {
        // Fighter (default ship)
        this.registerShip('fighter', {
            id: 'fighter',
            name: 'Fighter',
            description: 'Standard combat vessel with balanced stats. Good for beginners.',
            sprite: 'ship-fighter',
            unlockCriteria: null, // Always unlocked
            difficulty: 'easy'
        });
        
        // Register Scout ship if available
        if (typeof ScoutShip !== 'undefined') {
            this.registerShipClass('scout', ScoutShip);
        }
        
        // Register Tank ship if available
        if (typeof TankShip !== 'undefined') {
            this.registerShipClass('tank', TankShip);
        }
        
        // Register Support ship if available
        if (typeof SupportShip !== 'undefined') {
            this.registerShipClass('support', SupportShip);
        }
        
        // Register Experimental ship if available
        if (typeof ExperimentalShip !== 'undefined') {
            this.registerShipClass('experimental', ExperimentalShip);
        }
    }
    
    /**
     * Register a new ship type
     * @param {string} id - Unique ship identifier
     * @param {Object} config - Ship configuration
     */
    registerShip(id, config) {
        // Create ship instance
        const ship = new ShipBase(config);
        
        // Store in registry
        this.shipTypes[id] = ship;
        
        console.log(`Registered ship type: ${config.name}`);
    }
    
    /**
     * Register a ship class
     * @param {string} id - Unique ship identifier
     * @param {Class} ShipClass - Ship class constructor
     */
    registerShipClass(id, ShipClass) {
        try {
            // Create instance of the ship class
            const ship = new ShipClass();
            
            // Store in registry
            this.shipTypes[id] = ship;
            
            console.log(`Registered ship class: ${ship.config.name}`);
        } catch (error) {
            console.error(`Failed to register ship class ${id}:`, error);
        }
    }
    
    /**
     * Get a ship type by ID
     * @param {string} id - Ship identifier
     * @returns {ShipBase} Ship instance
     */
    getShip(id) {
        // Return requested ship or default to fighter
        return this.shipTypes[id] || this.shipTypes['fighter'];
    }
    
    /**
     * Get all available ship types
     * @param {Object} gameGlobal - Game global state
     * @returns {Array} Array of available ship types
     */
    getAvailableShips(gameGlobal) {
        // Filter ships by unlock status
        return Object.values(this.shipTypes).filter(ship => 
            ship.isUnlocked(gameGlobal)
        );
    }
    
    /**
     * Get all ship types
     * @returns {Array} Array of all ship types
     */
    getAllShips() {
        return Object.values(this.shipTypes);
    }
    
    /**
     * Check if a ship is unlocked
     * @param {string} id - Ship identifier
     * @param {Object} gameGlobal - Game global state
     * @returns {boolean} Whether the ship is unlocked
     */
    isShipUnlocked(id, gameGlobal) {
        const ship = this.getShip(id);
        return ship ? ship.isUnlocked(gameGlobal) : false;
    }
    
    /**
     * Unlock a ship
     * @param {string} id - Ship identifier
     * @param {Object} gameGlobal - Game global state
     * @returns {boolean} Whether the ship was successfully unlocked
     */
    unlockShip(id, gameGlobal) {
        // Check if ship exists
        const ship = this.getShip(id);
        if (!ship) return false;
        
        // Check if already unlocked
        if (ship.isUnlocked(gameGlobal)) return false;
        
        // Initialize unlockedShips array if it doesn't exist
        if (!gameGlobal.metaProgress.unlockedShips) {
            gameGlobal.metaProgress.unlockedShips = ['fighter'];
        }
        
        // Add to unlocked ships
        gameGlobal.metaProgress.unlockedShips.push(id);
        
        console.log(`Unlocked ship: ${ship.config.name}`);
        return true;
    }
    
    /**
     * Apply ship configuration to player ship
     * @param {string} id - Ship identifier
     * @param {PlayerShip} playerShip - Player ship instance
     */
    applyShipToPlayer(id, playerShip) {
        const ship = this.getShip(id);
        if (ship) {
            ship.applyToShip(playerShip);
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ShipRegistry = ShipRegistry;
}
