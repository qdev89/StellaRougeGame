/**
 * Nemesis System
 * Tracks boss defeat methods and adapts the final Nemesis boss accordingly
 */
class NemesisSystem {
    constructor(game) {
        this.game = game;
        
        // Initialize nemesis data if it doesn't exist
        if (!this.game.global.nemesisData) {
            this.initializeNemesisData();
        }
    }
    
    /**
     * Initialize default nemesis data
     */
    initializeNemesisData() {
        this.game.global.nemesisData = {
            // Track which bosses have been defeated
            defeatedBosses: {
                SCOUT_COMMANDER: false,
                BATTLE_CARRIER: false,
                DESTROYER_PRIME: false,
                STEALTH_OVERLORD: false,
                DREADNOUGHT: false,
                BOMBER_TITAN: false
            },
            
            // Track defeat methods for each boss
            defeatMethods: {
                SCOUT_COMMANDER: { weaponType: null, buildType: null, timeToDefeat: 0 },
                BATTLE_CARRIER: { weaponType: null, buildType: null, timeToDefeat: 0 },
                DESTROYER_PRIME: { weaponType: null, buildType: null, timeToDefeat: 0 },
                STEALTH_OVERLORD: { weaponType: null, buildType: null, timeToDefeat: 0 },
                DREADNOUGHT: { weaponType: null, buildType: null, timeToDefeat: 0 },
                BOMBER_TITAN: { weaponType: null, buildType: null, timeToDefeat: 0 }
            },
            
            // Track player's dominant weapon usage
            weaponUsage: {
                laser: 0,
                triBeam: 0,
                plasmaBolt: 0,
                homingMissile: 0,
                dualCannon: 0,
                beamLaser: 0,
                scatterBomb: 0
            },
            
            // Track player's dominant build style
            buildStyle: {
                offensive: 0,
                defensive: 0,
                utility: 0,
                balanced: 0
            },
            
            // Track nemesis encounters
            encounters: 0,
            
            // Track nemesis defeats
            defeats: 0
        };
    }
    
    /**
     * Record a boss defeat with details about how it was defeated
     * @param {string} bossType - The type of boss that was defeated
     * @param {object} defeatData - Data about how the boss was defeated
     */
    recordBossDefeat(bossType, defeatData) {
        console.log(`Recording defeat of ${bossType} boss`, defeatData);
        
        // Ensure nemesis data exists
        if (!this.game.global.nemesisData) {
            this.initializeNemesisData();
        }
        
        // Mark boss as defeated
        this.game.global.nemesisData.defeatedBosses[bossType] = true;
        
        // Record defeat method
        this.game.global.nemesisData.defeatMethods[bossType] = {
            weaponType: defeatData.dominantWeapon || 'laser',
            buildType: defeatData.buildType || 'balanced',
            timeToDefeat: defeatData.timeToDefeat || 0
        };
        
        // Update weapon usage stats
        if (defeatData.weaponUsage) {
            Object.keys(defeatData.weaponUsage).forEach(weapon => {
                if (this.game.global.nemesisData.weaponUsage[weapon] !== undefined) {
                    this.game.global.nemesisData.weaponUsage[weapon] += defeatData.weaponUsage[weapon];
                }
            });
        }
        
        // Update build style stats
        if (defeatData.buildStyle) {
            Object.keys(defeatData.buildStyle).forEach(style => {
                if (this.game.global.nemesisData.buildStyle[style] !== undefined) {
                    this.game.global.nemesisData.buildStyle[style] += defeatData.buildStyle[style];
                }
            });
        }
        
        // Save the updated nemesis data
        this.saveNemesisData();
        
        console.log('Updated nemesis data:', this.game.global.nemesisData);
    }
    
    /**
     * Get the dominant weapon type used by the player
     * @returns {string} The dominant weapon type
     */
    getDominantWeaponType() {
        const weaponUsage = this.game.global.nemesisData.weaponUsage;
        let dominantWeapon = 'laser';
        let maxUsage = 0;
        
        Object.keys(weaponUsage).forEach(weapon => {
            if (weaponUsage[weapon] > maxUsage) {
                maxUsage = weaponUsage[weapon];
                dominantWeapon = weapon;
            }
        });
        
        return dominantWeapon;
    }
    
    /**
     * Get the dominant build style used by the player
     * @returns {string} The dominant build style
     */
    getDominantBuildStyle() {
        const buildStyle = this.game.global.nemesisData.buildStyle;
        let dominantStyle = 'balanced';
        let maxValue = 0;
        
        Object.keys(buildStyle).forEach(style => {
            if (buildStyle[style] > maxValue) {
                maxValue = buildStyle[style];
                dominantStyle = style;
            }
        });
        
        return dominantStyle;
    }
    
    /**
     * Get the number of bosses defeated
     * @returns {number} The number of bosses defeated
     */
    getDefeatedBossCount() {
        const defeatedBosses = this.game.global.nemesisData.defeatedBosses;
        let count = 0;
        
        Object.keys(defeatedBosses).forEach(boss => {
            if (defeatedBosses[boss]) {
                count++;
            }
        });
        
        return count;
    }
    
    /**
     * Check if a specific boss has been defeated
     * @param {string} bossType - The type of boss to check
     * @returns {boolean} Whether the boss has been defeated
     */
    isBossDefeated(bossType) {
        return this.game.global.nemesisData.defeatedBosses[bossType] || false;
    }
    
    /**
     * Get the defeat method for a specific boss
     * @param {string} bossType - The type of boss to get the defeat method for
     * @returns {object} The defeat method data
     */
    getBossDefeatMethod(bossType) {
        return this.game.global.nemesisData.defeatMethods[bossType] || {
            weaponType: null,
            buildType: null,
            timeToDefeat: 0
        };
    }
    
    /**
     * Generate Nemesis configuration based on player's history
     * @returns {object} Configuration for the Nemesis boss
     */
    generateNemesisConfig() {
        // Get the number of bosses defeated
        const defeatedCount = this.getDefeatedBossCount();
        
        // Base health and scaling based on defeated bosses
        const baseHealth = CONSTANTS.ENEMIES.BOSSES.NEMESIS.HEALTH;
        const healthScaling = 1 + (defeatedCount * 0.1); // 10% increase per defeated boss
        
        // Get dominant weapon and build style
        const dominantWeapon = this.getDominantWeaponType();
        const dominantBuildStyle = this.getDominantBuildStyle();
        
        // Generate resistances based on dominant weapon
        const resistances = this.generateResistances(dominantWeapon);
        
        // Generate attack patterns based on player's build style
        const attackPatterns = this.generateAttackPatterns(dominantBuildStyle);
        
        // Generate visual appearance based on defeated bosses
        const appearance = this.generateAppearance();
        
        // Create the Nemesis configuration
        const nemesisConfig = {
            health: Math.floor(baseHealth * healthScaling),
            resistances: resistances,
            attackPatterns: attackPatterns,
            appearance: appearance,
            phases: Math.min(2 + defeatedCount, 5), // Up to 5 phases based on defeated bosses
            phaseThresholds: this.generatePhaseThresholds(Math.min(2 + defeatedCount, 5)),
            adaptiveBehavior: true,
            defeatedBosses: this.game.global.nemesisData.defeatedBosses,
            defeatMethods: this.game.global.nemesisData.defeatMethods
        };
        
        console.log('Generated Nemesis configuration:', nemesisConfig);
        return nemesisConfig;
    }
    
    /**
     * Generate resistances based on player's dominant weapon
     * @param {string} dominantWeapon - The player's dominant weapon type
     * @returns {object} Resistance configuration
     */
    generateResistances(dominantWeapon) {
        const resistances = {
            laser: 0,
            triBeam: 0,
            plasmaBolt: 0,
            homingMissile: 0,
            dualCannon: 0,
            beamLaser: 0,
            scatterBomb: 0
        };
        
        // Increase resistance to dominant weapon
        resistances[dominantWeapon] = 0.5; // 50% resistance
        
        return resistances;
    }
    
    /**
     * Generate attack patterns based on player's build style
     * @param {string} dominantBuildStyle - The player's dominant build style
     * @returns {array} Attack patterns
     */
    generateAttackPatterns(dominantBuildStyle) {
        // Base attack patterns that all Nemesis versions have
        const basePatterns = ['adaptive', 'phase-shift'];
        
        // Add specific patterns based on build style
        switch (dominantBuildStyle) {
            case 'offensive':
                // Counter offensive builds with defensive patterns
                return [...basePatterns, 'shield', 'reflect', 'absorb'];
                
            case 'defensive':
                // Counter defensive builds with penetrating attacks
                return [...basePatterns, 'pierce', 'overload', 'drain'];
                
            case 'utility':
                // Counter utility builds with direct damage
                return [...basePatterns, 'beam', 'burst', 'artillery'];
                
            case 'balanced':
            default:
                // For balanced builds, use a mix of everything
                return [...basePatterns, 'beam', 'shield', 'drones', 'mines'];
        }
    }
    
    /**
     * Generate visual appearance based on defeated bosses
     * @returns {object} Appearance configuration
     */
    generateAppearance() {
        const appearance = {
            baseColor: '#3366cc', // Default blue
            highlights: [],
            parts: []
        };
        
        // Add visual elements from each defeated boss
        const defeatedBosses = this.game.global.nemesisData.defeatedBosses;
        
        if (defeatedBosses.SCOUT_COMMANDER) {
            appearance.highlights.push('#33ff33'); // Green
            appearance.parts.push('shield_generators');
        }
        
        if (defeatedBosses.BATTLE_CARRIER) {
            appearance.highlights.push('#ffcc33'); // Yellow
            appearance.parts.push('drone_bays');
        }
        
        if (defeatedBosses.DESTROYER_PRIME) {
            appearance.highlights.push('#ff3333'); // Red
            appearance.parts.push('artillery_cannons');
        }
        
        if (defeatedBosses.STEALTH_OVERLORD) {
            appearance.highlights.push('#cc33ff'); // Purple
            appearance.parts.push('cloaking_device');
        }
        
        if (defeatedBosses.DREADNOUGHT) {
            appearance.highlights.push('#ffffff'); // White
            appearance.parts.push('heavy_armor');
        }
        
        if (defeatedBosses.BOMBER_TITAN) {
            appearance.highlights.push('#ff9933'); // Orange
            appearance.parts.push('bomb_launchers');
        }
        
        return appearance;
    }
    
    /**
     * Generate phase thresholds based on number of phases
     * @param {number} phases - Number of phases
     * @returns {array} Phase thresholds
     */
    generatePhaseThresholds(phases) {
        const thresholds = [];
        const step = 1 / phases;
        
        for (let i = 1; i < phases; i++) {
            thresholds.push(1 - (step * i));
        }
        
        return thresholds;
    }
    
    /**
     * Record a Nemesis encounter
     */
    recordNemesisEncounter() {
        this.game.global.nemesisData.encounters++;
        this.saveNemesisData();
    }
    
    /**
     * Record a Nemesis defeat
     */
    recordNemesisDefeat() {
        this.game.global.nemesisData.defeats++;
        this.saveNemesisData();
    }
    
    /**
     * Save nemesis data to persistent storage
     */
    saveNemesisData() {
        // Use the save manager if available
        if (this.game.global.saveManager) {
            this.game.global.saveManager.saveGame(false);
        }
    }
    
    /**
     * Reset nemesis data (for testing)
     */
    resetNemesisData() {
        this.initializeNemesisData();
        this.saveNemesisData();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisSystem = NemesisSystem;
}
