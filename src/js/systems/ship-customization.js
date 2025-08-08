/**
 * Ship Customization System
 * Manages visual customization options for player ships
 */
class ShipCustomizationSystem {
    /**
     * Initialize the ship customization system
     * @param {Phaser.Game} game - The game instance
     */
    constructor(game) {
        this.game = game;
        
        // Initialize customization options
        this.colorSchemes = {};
        this.engineEffects = {};
        this.shipDecorations = {};
        this.weaponSkins = {};
        
        // Register default customization options
        this.registerDefaultOptions();
        
        // Load unlocked customizations
        this.loadUnlockedOptions();
        
        console.log('Ship customization system initialized');
    }
    
    /**
     * Register default customization options
     */
    registerDefaultOptions() {
        // Register color schemes
        this.registerColorScheme('default', {
            id: 'default',
            name: 'Default',
            description: 'Standard ship colors',
            primaryColor: 0x3366cc,
            secondaryColor: 0x66aaff,
            accentColor: 0x99ccff,
            cost: 0,
            unlocked: true
        });
        
        this.registerColorScheme('crimson', {
            id: 'crimson',
            name: 'Crimson',
            description: 'Red and black color scheme',
            primaryColor: 0xcc0000,
            secondaryColor: 0xff3333,
            accentColor: 0xff6666,
            cost: 500,
            unlocked: false
        });
        
        this.registerColorScheme('emerald', {
            id: 'emerald',
            name: 'Emerald',
            description: 'Green and gold color scheme',
            primaryColor: 0x009900,
            secondaryColor: 0x33cc33,
            accentColor: 0xffcc00,
            cost: 500,
            unlocked: false
        });
        
        this.registerColorScheme('phantom', {
            id: 'phantom',
            name: 'Phantom',
            description: 'Purple and black color scheme',
            primaryColor: 0x660099,
            secondaryColor: 0x9933cc,
            accentColor: 0xcc66ff,
            cost: 750,
            unlocked: false
        });
        
        this.registerColorScheme('golden', {
            id: 'golden',
            name: 'Golden',
            description: 'Gold and white color scheme',
            primaryColor: 0xcc9900,
            secondaryColor: 0xffcc00,
            accentColor: 0xffffff,
            cost: 1000,
            unlocked: false
        });
        
        // Register engine effects
        this.registerEngineEffect('standard', {
            id: 'standard',
            name: 'Standard',
            description: 'Standard engine exhaust',
            particleColor: 0x3366cc,
            particleAlpha: 0.7,
            particleScale: 1.0,
            particleSpeed: 1.0,
            cost: 0,
            unlocked: true
        });
        
        this.registerEngineEffect('plasma', {
            id: 'plasma',
            name: 'Plasma',
            description: 'High-energy plasma exhaust',
            particleColor: 0x33ccff,
            particleAlpha: 0.8,
            particleScale: 1.2,
            particleSpeed: 1.3,
            cost: 500,
            unlocked: false
        });
        
        this.registerEngineEffect('fire', {
            id: 'fire',
            name: 'Fire',
            description: 'Intense flame exhaust',
            particleColor: 0xff6600,
            particleAlpha: 0.9,
            particleScale: 1.1,
            particleSpeed: 1.2,
            cost: 500,
            unlocked: false
        });
        
        this.registerEngineEffect('quantum', {
            id: 'quantum',
            name: 'Quantum',
            description: 'Exotic quantum particle exhaust',
            particleColor: 0xff00ff,
            particleAlpha: 0.6,
            particleScale: 0.8,
            particleSpeed: 1.5,
            cost: 750,
            unlocked: false
        });
        
        this.registerEngineEffect('stealth', {
            id: 'stealth',
            name: 'Stealth',
            description: 'Low-visibility stealth exhaust',
            particleColor: 0x333333,
            particleAlpha: 0.4,
            particleScale: 0.7,
            particleSpeed: 0.9,
            cost: 750,
            unlocked: false
        });
        
        // Register ship decorations
        this.registerShipDecoration('none', {
            id: 'none',
            name: 'None',
            description: 'No additional decorations',
            cost: 0,
            unlocked: true
        });
        
        this.registerShipDecoration('stripes', {
            id: 'stripes',
            name: 'Racing Stripes',
            description: 'Sleek racing stripes along the hull',
            cost: 300,
            unlocked: false
        });
        
        this.registerShipDecoration('wings', {
            id: 'wings',
            name: 'Extended Wings',
            description: 'Decorative wing extensions',
            cost: 500,
            unlocked: false
        });
        
        this.registerShipDecoration('armor', {
            id: 'armor',
            name: 'Armor Plating',
            description: 'Decorative armor plating',
            cost: 500,
            unlocked: false
        });
        
        this.registerShipDecoration('lights', {
            id: 'lights',
            name: 'Running Lights',
            description: 'Decorative light strips along the hull',
            cost: 400,
            unlocked: false
        });
        
        // Register weapon skins
        this.registerWeaponSkin('default', {
            id: 'default',
            name: 'Default',
            description: 'Standard weapon appearance',
            cost: 0,
            unlocked: true
        });
        
        this.registerWeaponSkin('energy', {
            id: 'energy',
            name: 'Energy',
            description: 'Energy-based weapon appearance',
            cost: 500,
            unlocked: false
        });
        
        this.registerWeaponSkin('plasma', {
            id: 'plasma',
            name: 'Plasma',
            description: 'Plasma-based weapon appearance',
            cost: 500,
            unlocked: false
        });
        
        this.registerWeaponSkin('laser', {
            id: 'laser',
            name: 'Laser',
            description: 'Laser-based weapon appearance',
            cost: 500,
            unlocked: false
        });
        
        this.registerWeaponSkin('quantum', {
            id: 'quantum',
            name: 'Quantum',
            description: 'Exotic quantum weapon appearance',
            cost: 750,
            unlocked: false
        });
    }
    
    /**
     * Register a color scheme
     * @param {string} id - Color scheme identifier
     * @param {Object} config - Color scheme configuration
     */
    registerColorScheme(id, config) {
        this.colorSchemes[id] = config;
    }
    
    /**
     * Register an engine effect
     * @param {string} id - Engine effect identifier
     * @param {Object} config - Engine effect configuration
     */
    registerEngineEffect(id, config) {
        this.engineEffects[id] = config;
    }
    
    /**
     * Register a ship decoration
     * @param {string} id - Ship decoration identifier
     * @param {Object} config - Ship decoration configuration
     */
    registerShipDecoration(id, config) {
        this.shipDecorations[id] = config;
    }
    
    /**
     * Register a weapon skin
     * @param {string} id - Weapon skin identifier
     * @param {Object} config - Weapon skin configuration
     */
    registerWeaponSkin(id, config) {
        this.weaponSkins[id] = config;
    }
    
    /**
     * Get all color schemes
     * @returns {Array} Array of color schemes
     */
    getAllColorSchemes() {
        return Object.values(this.colorSchemes);
    }
    
    /**
     * Get all engine effects
     * @returns {Array} Array of engine effects
     */
    getAllEngineEffects() {
        return Object.values(this.engineEffects);
    }
    
    /**
     * Get all ship decorations
     * @returns {Array} Array of ship decorations
     */
    getAllShipDecorations() {
        return Object.values(this.shipDecorations);
    }
    
    /**
     * Get all weapon skins
     * @returns {Array} Array of weapon skins
     */
    getAllWeaponSkins() {
        return Object.values(this.weaponSkins);
    }
    
    /**
     * Get unlocked color schemes
     * @returns {Array} Array of unlocked color schemes
     */
    getUnlockedColorSchemes() {
        return Object.values(this.colorSchemes).filter(scheme => scheme.unlocked);
    }
    
    /**
     * Get unlocked engine effects
     * @returns {Array} Array of unlocked engine effects
     */
    getUnlockedEngineEffects() {
        return Object.values(this.engineEffects).filter(effect => effect.unlocked);
    }
    
    /**
     * Get unlocked ship decorations
     * @returns {Array} Array of unlocked ship decorations
     */
    getUnlockedShipDecorations() {
        return Object.values(this.shipDecorations).filter(decoration => decoration.unlocked);
    }
    
    /**
     * Get unlocked weapon skins
     * @returns {Array} Array of unlocked weapon skins
     */
    getUnlockedWeaponSkins() {
        return Object.values(this.weaponSkins).filter(skin => skin.unlocked);
    }
    
    /**
     * Get a color scheme by ID
     * @param {string} id - Color scheme identifier
     * @returns {Object} Color scheme configuration
     */
    getColorScheme(id) {
        return this.colorSchemes[id] || this.colorSchemes['default'];
    }
    
    /**
     * Get an engine effect by ID
     * @param {string} id - Engine effect identifier
     * @returns {Object} Engine effect configuration
     */
    getEngineEffect(id) {
        return this.engineEffects[id] || this.engineEffects['standard'];
    }
    
    /**
     * Get a ship decoration by ID
     * @param {string} id - Ship decoration identifier
     * @returns {Object} Ship decoration configuration
     */
    getShipDecoration(id) {
        return this.shipDecorations[id] || this.shipDecorations['none'];
    }
    
    /**
     * Get a weapon skin by ID
     * @param {string} id - Weapon skin identifier
     * @returns {Object} Weapon skin configuration
     */
    getWeaponSkin(id) {
        return this.weaponSkins[id] || this.weaponSkins['default'];
    }
    
    /**
     * Unlock a customization option
     * @param {string} type - Customization type ('colorScheme', 'engineEffect', 'shipDecoration', 'weaponSkin')
     * @param {string} id - Option identifier
     * @returns {boolean} Whether the option was successfully unlocked
     */
    unlockOption(type, id) {
        let collection;
        
        // Get the appropriate collection
        switch (type) {
            case 'colorScheme':
                collection = this.colorSchemes;
                break;
            case 'engineEffect':
                collection = this.engineEffects;
                break;
            case 'shipDecoration':
                collection = this.shipDecorations;
                break;
            case 'weaponSkin':
                collection = this.weaponSkins;
                break;
            default:
                console.warn(`Invalid customization type: ${type}`);
                return false;
        }
        
        // Check if option exists
        if (!collection[id]) {
            console.warn(`Customization option not found: ${id}`);
            return false;
        }
        
        // Check if already unlocked
        if (collection[id].unlocked) {
            return false;
        }
        
        // Unlock the option
        collection[id].unlocked = true;
        
        // Save unlocked options
        this.saveUnlockedOptions();
        
        console.log(`Unlocked ${type}: ${id}`);
        return true;
    }
    
    /**
     * Purchase a customization option
     * @param {string} type - Customization type ('colorScheme', 'engineEffect', 'shipDecoration', 'weaponSkin')
     * @param {string} id - Option identifier
     * @returns {boolean} Whether the purchase was successful
     */
    purchaseOption(type, id) {
        let collection;
        
        // Get the appropriate collection
        switch (type) {
            case 'colorScheme':
                collection = this.colorSchemes;
                break;
            case 'engineEffect':
                collection = this.engineEffects;
                break;
            case 'shipDecoration':
                collection = this.shipDecorations;
                break;
            case 'weaponSkin':
                collection = this.weaponSkins;
                break;
            default:
                console.warn(`Invalid customization type: ${type}`);
                return false;
        }
        
        // Check if option exists
        if (!collection[id]) {
            console.warn(`Customization option not found: ${id}`);
            return false;
        }
        
        // Check if already unlocked
        if (collection[id].unlocked) {
            return false;
        }
        
        // Check if player has enough credits
        const cost = collection[id].cost;
        if (!this.game.global || !this.game.global.metaProgress || !this.game.global.metaProgress.credits) {
            console.warn('Game global state not available, cannot purchase option');
            return false;
        }
        
        if (this.game.global.metaProgress.credits < cost) {
            console.log(`Not enough credits to purchase ${id}. Required: ${cost}, Available: ${this.game.global.metaProgress.credits}`);
            return false;
        }
        
        // Deduct credits
        this.game.global.metaProgress.credits -= cost;
        
        // Unlock the option
        collection[id].unlocked = true;
        
        // Save unlocked options
        this.saveUnlockedOptions();
        
        // Save game state
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }
        
        console.log(`Purchased ${type}: ${id} for ${cost} credits`);
        return true;
    }
    
    /**
     * Apply customization to a player ship
     * @param {PlayerShip} playerShip - The player ship instance
     * @param {Object} customization - Customization options
     */
    applyCustomization(playerShip, customization) {
        // Default customization if not provided
        const options = customization || {
            colorScheme: 'default',
            engineEffect: 'standard',
            shipDecoration: 'none',
            weaponSkin: 'default'
        };
        
        // Apply color scheme
        this.applyColorScheme(playerShip, options.colorScheme);
        
        // Apply engine effect
        this.applyEngineEffect(playerShip, options.engineEffect);
        
        // Apply ship decoration
        this.applyShipDecoration(playerShip, options.shipDecoration);
        
        // Apply weapon skin
        this.applyWeaponSkin(playerShip, options.weaponSkin);
        
        console.log('Applied ship customization');
    }
    
    /**
     * Apply color scheme to a player ship
     * @param {PlayerShip} playerShip - The player ship instance
     * @param {string} schemeId - Color scheme identifier
     */
    applyColorScheme(playerShip, schemeId) {
        const scheme = this.getColorScheme(schemeId);
        
        // Apply primary color to ship
        playerShip.setTint(scheme.primaryColor);
        
        // Apply secondary color to shield
        if (playerShip.shieldSprite) {
            playerShip.shieldSprite.setTint(scheme.secondaryColor);
        }
        
        // Store customization info
        playerShip.customization = playerShip.customization || {};
        playerShip.customization.colorScheme = schemeId;
    }
    
    /**
     * Apply engine effect to a player ship
     * @param {PlayerShip} playerShip - The player ship instance
     * @param {string} effectId - Engine effect identifier
     */
    applyEngineEffect(playerShip, effectId) {
        const effect = this.getEngineEffect(effectId);
        
        // Apply to engine emitter if it exists
        if (playerShip.engineEmitter) {
            playerShip.engineEmitter.setTint(effect.particleColor);
            playerShip.engineEmitter.setAlpha(effect.particleAlpha);
            playerShip.engineEmitter.setScale(effect.particleScale);
            playerShip.engineEmitter.setSpeed(playerShip.engineEmitter.speed.propertyValue * effect.particleSpeed);
        }
        
        // Store customization info
        playerShip.customization = playerShip.customization || {};
        playerShip.customization.engineEffect = effectId;
    }
    
    /**
     * Apply ship decoration to a player ship
     * @param {PlayerShip} playerShip - The player ship instance
     * @param {string} decorationId - Ship decoration identifier
     */
    applyShipDecoration(playerShip, decorationId) {
        const decoration = this.getShipDecoration(decorationId);
        
        // Remove existing decoration
        if (playerShip.decorationSprite) {
            playerShip.decorationSprite.destroy();
            playerShip.decorationSprite = null;
        }
        
        // Skip if 'none' decoration
        if (decorationId === 'none') {
            return;
        }
        
        // Create decoration based on type
        switch (decorationId) {
            case 'stripes':
                this.createStripesDecoration(playerShip);
                break;
            case 'wings':
                this.createWingsDecoration(playerShip);
                break;
            case 'armor':
                this.createArmorDecoration(playerShip);
                break;
            case 'lights':
                this.createLightsDecoration(playerShip);
                break;
        }
        
        // Store customization info
        playerShip.customization = playerShip.customization || {};
        playerShip.customization.shipDecoration = decorationId;
    }
    
    /**
     * Create stripes decoration
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createStripesDecoration(playerShip) {
        // Create graphics for stripes
        const graphics = playerShip.scene.add.graphics();
        
        // Get color scheme
        const schemeId = playerShip.customization?.colorScheme || 'default';
        const scheme = this.getColorScheme(schemeId);
        
        // Draw stripes
        graphics.fillStyle(scheme.accentColor, 1);
        
        // Left stripe
        graphics.fillRect(-15, -25, 5, 50);
        
        // Right stripe
        graphics.fillRect(10, -25, 5, 50);
        
        // Generate texture
        graphics.generateTexture('ship-stripes', 40, 60);
        graphics.destroy();
        
        // Create sprite
        playerShip.decorationSprite = playerShip.scene.add.sprite(0, 0, 'ship-stripes');
        
        // Add to visuals container if it exists
        if (playerShip.visualsContainer) {
            playerShip.visualsContainer.add(playerShip.decorationSprite);
        } else {
            // Otherwise, make it follow the player
            playerShip.scene.tweens.add({
                targets: playerShip.decorationSprite,
                x: playerShip.x,
                y: playerShip.y,
                duration: 0,
                repeat: -1
            });
        }
    }
    
    /**
     * Create wings decoration
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createWingsDecoration(playerShip) {
        // Create graphics for wings
        const graphics = playerShip.scene.add.graphics();
        
        // Get color scheme
        const schemeId = playerShip.customization?.colorScheme || 'default';
        const scheme = this.getColorScheme(schemeId);
        
        // Draw wings
        graphics.fillStyle(scheme.primaryColor, 1);
        graphics.lineStyle(2, scheme.accentColor, 1);
        
        // Left wing
        graphics.fillTriangle(-15, 0, -40, -15, -40, 15);
        graphics.strokeTriangle(-15, 0, -40, -15, -40, 15);
        
        // Right wing
        graphics.fillTriangle(15, 0, 40, -15, 40, 15);
        graphics.strokeTriangle(15, 0, 40, -15, 40, 15);
        
        // Generate texture
        graphics.generateTexture('ship-wings', 100, 40);
        graphics.destroy();
        
        // Create sprite
        playerShip.decorationSprite = playerShip.scene.add.sprite(0, 0, 'ship-wings');
        
        // Add to visuals container if it exists
        if (playerShip.visualsContainer) {
            playerShip.visualsContainer.add(playerShip.decorationSprite);
        } else {
            // Otherwise, make it follow the player
            playerShip.scene.tweens.add({
                targets: playerShip.decorationSprite,
                x: playerShip.x,
                y: playerShip.y,
                duration: 0,
                repeat: -1
            });
        }
    }
    
    /**
     * Create armor decoration
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createArmorDecoration(playerShip) {
        // Create graphics for armor
        const graphics = playerShip.scene.add.graphics();
        
        // Get color scheme
        const schemeId = playerShip.customization?.colorScheme || 'default';
        const scheme = this.getColorScheme(schemeId);
        
        // Draw armor plates
        graphics.lineStyle(3, scheme.accentColor, 0.8);
        
        // Top plate
        graphics.strokeRect(-20, -30, 40, 10);
        
        // Side plates
        graphics.strokeRect(-25, -20, 10, 40);
        graphics.strokeRect(15, -20, 10, 40);
        
        // Bottom plate
        graphics.strokeRect(-20, 20, 40, 10);
        
        // Generate texture
        graphics.generateTexture('ship-armor', 60, 60);
        graphics.destroy();
        
        // Create sprite
        playerShip.decorationSprite = playerShip.scene.add.sprite(0, 0, 'ship-armor');
        
        // Add to visuals container if it exists
        if (playerShip.visualsContainer) {
            playerShip.visualsContainer.add(playerShip.decorationSprite);
        } else {
            // Otherwise, make it follow the player
            playerShip.scene.tweens.add({
                targets: playerShip.decorationSprite,
                x: playerShip.x,
                y: playerShip.y,
                duration: 0,
                repeat: -1
            });
        }
    }
    
    /**
     * Create lights decoration
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createLightsDecoration(playerShip) {
        // Create graphics for lights
        const graphics = playerShip.scene.add.graphics();
        
        // Get color scheme
        const schemeId = playerShip.customization?.colorScheme || 'default';
        const scheme = this.getColorScheme(schemeId);
        
        // Draw lights
        graphics.fillStyle(scheme.accentColor, 1);
        
        // Top light
        graphics.fillCircle(0, -25, 3);
        
        // Side lights
        graphics.fillCircle(-20, -10, 2);
        graphics.fillCircle(-20, 10, 2);
        graphics.fillCircle(20, -10, 2);
        graphics.fillCircle(20, 10, 2);
        
        // Bottom lights
        graphics.fillCircle(-10, 25, 2);
        graphics.fillCircle(10, 25, 2);
        
        // Generate texture
        graphics.generateTexture('ship-lights', 50, 60);
        graphics.destroy();
        
        // Create sprite
        playerShip.decorationSprite = playerShip.scene.add.sprite(0, 0, 'ship-lights');
        
        // Add to visuals container if it exists
        if (playerShip.visualsContainer) {
            playerShip.visualsContainer.add(playerShip.decorationSprite);
        } else {
            // Otherwise, make it follow the player
            playerShip.scene.tweens.add({
                targets: playerShip.decorationSprite,
                x: playerShip.x,
                y: playerShip.y,
                duration: 0,
                repeat: -1
            });
        }
        
        // Add pulsing animation
        playerShip.scene.tweens.add({
            targets: playerShip.decorationSprite,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Apply weapon skin to a player ship
     * @param {PlayerShip} playerShip - The player ship instance
     * @param {string} skinId - Weapon skin identifier
     */
    applyWeaponSkin(playerShip, skinId) {
        const skin = this.getWeaponSkin(skinId);
        
        // Store customization info
        playerShip.customization = playerShip.customization || {};
        playerShip.customization.weaponSkin = skinId;
        
        // Apply skin to weapon fire method
        const originalFireMethod = playerShip.fireWeapon;
        
        // Override fire weapon method to apply skin
        playerShip.fireWeapon = function() {
            // Call original method
            originalFireMethod.call(this);
            
            // Apply skin to last fired projectile
            if (this.lastFiredProjectile && this.lastFiredProjectile.active) {
                switch (skinId) {
                    case 'energy':
                        this.lastFiredProjectile.setTint(0x33ffff);
                        break;
                    case 'plasma':
                        this.lastFiredProjectile.setTint(0xff66cc);
                        break;
                    case 'laser':
                        this.lastFiredProjectile.setTint(0xff3333);
                        break;
                    case 'quantum':
                        this.lastFiredProjectile.setTint(0xaa33ff);
                        // Add pulsing effect
                        this.scene.tweens.add({
                            targets: this.lastFiredProjectile,
                            alpha: 0.7,
                            duration: 200,
                            yoyo: true,
                            repeat: -1
                        });
                        break;
                }
            }
        };
    }
    
    /**
     * Save unlocked options
     */
    saveUnlockedOptions() {
        // Check if game global state is available
        if (!this.game.global) return;
        
        // Create unlocked options data
        const unlockedOptions = {
            colorSchemes: Object.keys(this.colorSchemes).filter(id => this.colorSchemes[id].unlocked),
            engineEffects: Object.keys(this.engineEffects).filter(id => this.engineEffects[id].unlocked),
            shipDecorations: Object.keys(this.shipDecorations).filter(id => this.shipDecorations[id].unlocked),
            weaponSkins: Object.keys(this.weaponSkins).filter(id => this.weaponSkins[id].unlocked)
        };
        
        // Save to meta progress
        if (!this.game.global.metaProgress) {
            this.game.global.metaProgress = {};
        }
        
        this.game.global.metaProgress.unlockedCustomizations = unlockedOptions;
        
        // Save game state
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }
    }
    
    /**
     * Load unlocked options
     */
    loadUnlockedOptions() {
        // Check if game global state is available
        if (!this.game.global || !this.game.global.metaProgress || !this.game.global.metaProgress.unlockedCustomizations) {
            return;
        }
        
        const unlockedOptions = this.game.global.metaProgress.unlockedCustomizations;
        
        // Load unlocked color schemes
        if (unlockedOptions.colorSchemes) {
            unlockedOptions.colorSchemes.forEach(id => {
                if (this.colorSchemes[id]) {
                    this.colorSchemes[id].unlocked = true;
                }
            });
        }
        
        // Load unlocked engine effects
        if (unlockedOptions.engineEffects) {
            unlockedOptions.engineEffects.forEach(id => {
                if (this.engineEffects[id]) {
                    this.engineEffects[id].unlocked = true;
                }
            });
        }
        
        // Load unlocked ship decorations
        if (unlockedOptions.shipDecorations) {
            unlockedOptions.shipDecorations.forEach(id => {
                if (this.shipDecorations[id]) {
                    this.shipDecorations[id].unlocked = true;
                }
            });
        }
        
        // Load unlocked weapon skins
        if (unlockedOptions.weaponSkins) {
            unlockedOptions.weaponSkins.forEach(id => {
                if (this.weaponSkins[id]) {
                    this.weaponSkins[id].unlocked = true;
                }
            });
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ShipCustomizationSystem = ShipCustomizationSystem;
}
