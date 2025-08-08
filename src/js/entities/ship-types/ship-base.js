/**
 * Ship Base Class
 * Base class for all player ship types with common functionality
 */
class ShipBase {
    /**
     * Create a new ship type
     * @param {Object} config - Ship configuration
     */
    constructor(config = {}) {
        // Default configuration
        this.config = Object.assign({
            id: 'base_ship',
            name: 'Base Ship',
            description: 'Basic ship with balanced stats',
            sprite: 'ship-fighter',
            unlockCriteria: null,
            unlockMessage: 'New ship unlocked!',
            difficulty: 'medium',
            specialAbility: null
        }, config);
        
        // Base stats
        this.baseStats = {
            health: 100,
            shield: 50,
            speed: 300,
            fireRate: 100,
            damage: 10,
            shieldRegenRate: 1.0,
            ammoRegenRate: 1.0,
            maxAmmo: 1.0,
            specialCooldown: 10000, // 10 seconds
            dashCooldown: 3000,     // 3 seconds
            dashDistance: 150,       // Dash distance
            dashDuration: 200        // Dash duration in ms
        };
        
        // Stat modifiers (applied to base stats)
        this.statModifiers = {
            health: 1.0,
            shield: 1.0,
            speed: 1.0,
            fireRate: 1.0,
            damage: 1.0,
            shieldRegenRate: 1.0,
            ammoRegenRate: 1.0,
            maxAmmo: 1.0,
            specialCooldown: 1.0,
            dashCooldown: 1.0,
            dashDistance: 1.0,
            dashDuration: 1.0
        };
        
        // Starting weapons
        this.startingWeapons = ['BASIC_LASER'];
        
        // Special ability configuration
        this.specialAbility = {
            name: 'None',
            description: 'No special ability',
            cooldown: 10000,
            duration: 0,
            isActive: false,
            lastUsed: 0,
            icon: '⚡',
            execute: (ship) => {
                // Base implementation does nothing
                console.log('Special ability not implemented');
                return false;
            }
        };
        
        // Visual effects configuration
        this.visualEffects = {
            engineColor: 0x33aaff,
            trailColor: 0x3366ff,
            shieldColor: 0x33ccff,
            dashColor: 0x66ffff,
            specialColor: 0xffaa33
        };
        
        // Ship-specific synergies
        this.synergies = [];
    }
    
    /**
     * Get the final stats with modifiers applied
     * @returns {Object} Final ship stats
     */
    getStats() {
        const stats = {};
        
        // Apply modifiers to base stats
        Object.keys(this.baseStats).forEach(key => {
            stats[key] = this.baseStats[key] * this.statModifiers[key];
        });
        
        return stats;
    }
    
    /**
     * Apply the ship's configuration to a player ship instance
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applyToShip(playerShip) {
        // Get final stats
        const stats = this.getStats();
        
        // Apply stats to player ship
        playerShip.maxHealth = stats.health;
        playerShip.health = stats.health;
        playerShip.maxShields = stats.shield;
        playerShip.shields = stats.shield;
        playerShip.speed = stats.speed;
        playerShip.fireRate = stats.fireRate;
        playerShip.baseDamage = stats.damage;
        playerShip.shieldRegenRate = stats.shieldRegenRate;
        playerShip.ammoRegenRate = stats.ammoRegenRate;
        
        // Apply dash settings
        playerShip.dashCooldown = stats.dashCooldown;
        playerShip.dashDistance = stats.dashDistance;
        playerShip.dashDuration = stats.dashDuration;
        
        // Apply special ability
        playerShip.specialAbility = this.specialAbility;
        
        // Apply visual effects
        this.applyVisualEffects(playerShip);
        
        // Set starting weapons
        playerShip.unlockedWeapons = [...this.startingWeapons];
        if (playerShip.unlockedWeapons.length > 0) {
            playerShip.weaponType = playerShip.unlockedWeapons[0];
        }
        
        // Apply ship-specific synergies
        this.applySynergies(playerShip);
        
        console.log(`Applied ${this.config.name} configuration to player ship`);
    }
    
    /**
     * Apply visual effects to the player ship
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applyVisualEffects(playerShip) {
        // Set ship texture
        playerShip.setTexture(this.config.sprite);
        
        // Apply engine color
        if (playerShip.engineEmitter) {
            playerShip.engineEmitter.setTint(this.visualEffects.engineColor);
        }
        
        // Apply shield color
        if (playerShip.shieldSprite) {
            playerShip.shieldSprite.setTint(this.visualEffects.shieldColor);
        }
    }
    
    /**
     * Apply ship-specific synergies
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applySynergies(playerShip) {
        // Base implementation does nothing
        // Override in subclasses
    }
    
    /**
     * Use the ship's special ability
     * @param {PlayerShip} playerShip - The player ship instance
     * @returns {boolean} Whether the ability was successfully used
     */
    useSpecialAbility(playerShip) {
        // Check if ability is on cooldown
        const now = playerShip.scene.time.now;
        if (now - this.specialAbility.lastUsed < this.specialAbility.cooldown) {
            console.log('Special ability on cooldown');
            return false;
        }
        
        // Execute the ability
        const success = this.specialAbility.execute(playerShip);
        
        if (success) {
            // Update last used time
            this.specialAbility.lastUsed = now;
            
            // Set active state if ability has duration
            if (this.specialAbility.duration > 0) {
                this.specialAbility.isActive = true;
                
                // Set timer to deactivate
                playerShip.scene.time.delayedCall(
                    this.specialAbility.duration,
                    () => {
                        this.specialAbility.isActive = false;
                        this.deactivateSpecialAbility(playerShip);
                    }
                );
            }
        }
        
        return success;
    }
    
    /**
     * Deactivate the ship's special ability
     * @param {PlayerShip} playerShip - The player ship instance
     */
    deactivateSpecialAbility(playerShip) {
        // Base implementation does nothing
        // Override in subclasses
    }
    
    /**
     * Get the cooldown progress of the special ability
     * @param {PlayerShip} playerShip - The player ship instance
     * @returns {number} Cooldown progress (0-1)
     */
    getSpecialCooldownProgress(playerShip) {
        const now = playerShip.scene.time.now;
        const elapsed = now - this.specialAbility.lastUsed;
        return Math.min(1, elapsed / this.specialAbility.cooldown);
    }
    
    /**
     * Check if the ship is unlocked for the player
     * @param {Object} gameGlobal - The game's global state
     * @returns {boolean} Whether the ship is unlocked
     */
    isUnlocked(gameGlobal) {
        // If no unlock criteria, ship is always available
        if (!this.config.unlockCriteria) {
            return true;
        }
        
        // Check if ship is in unlocked ships list
        if (gameGlobal.metaProgress && gameGlobal.metaProgress.unlockedShips) {
            return gameGlobal.metaProgress.unlockedShips.includes(this.config.id);
        }
        
        return false;
    }
    
    /**
     * Get ship info for display
     * @returns {Object} Ship information
     */
    getInfo() {
        return {
            id: this.config.id,
            name: this.config.name,
            description: this.config.description,
            sprite: this.config.sprite,
            difficulty: this.config.difficulty,
            stats: this.getStats(),
            specialAbility: {
                name: this.specialAbility.name,
                description: this.specialAbility.description,
                cooldown: this.specialAbility.cooldown,
                icon: this.specialAbility.icon
            }
        };
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ShipBase = ShipBase;
}
