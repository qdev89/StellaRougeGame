/**
 * Nemesis Rewards System
 * Handles special rewards for defeating the Nemesis boss
 */
class NemesisRewards {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Generate rewards for defeating the Nemesis boss
     * @param {number} nemesisDefeats - Number of times the Nemesis has been defeated
     * @returns {array} Array of reward objects
     */
    generateRewards(nemesisDefeats = 0) {
        const rewards = [];
        
        // Base rewards that are always given
        rewards.push(this.generateBaseRewards());
        
        // Special rewards based on number of Nemesis defeats
        rewards.push(this.generateSpecialReward(nemesisDefeats));
        
        // Adaptive rewards based on player's playstyle
        if (this.game.global.nemesisSystem) {
            rewards.push(this.generateAdaptiveReward());
        }
        
        // Flatten the array and filter out any null values
        return rewards.flat().filter(reward => reward !== null);
    }
    
    /**
     * Generate base rewards for defeating the Nemesis
     * @returns {array} Array of base reward objects
     */
    generateBaseRewards() {
        return [
            {
                type: 'credits',
                value: 1000,
                description: 'Bonus credits for defeating the Nemesis'
            },
            {
                type: 'upgrade',
                id: 'nemesis_core',
                name: 'Nemesis Core',
                description: 'Harvested from the Nemesis. Increases all weapon damage by 15%.',
                effects: {
                    weaponDamage: 0.15
                },
                rarity: 'legendary',
                icon: 'nemesis-core'
            }
        ];
    }
    
    /**
     * Generate a special reward based on number of Nemesis defeats
     * @param {number} nemesisDefeats - Number of times the Nemesis has been defeated
     * @returns {object} Special reward object
     */
    generateSpecialReward(nemesisDefeats) {
        // Different rewards based on how many times the Nemesis has been defeated
        switch (nemesisDefeats) {
            case 0: // First defeat
                return {
                    type: 'unlock',
                    id: 'nemesis_hunter',
                    name: 'Nemesis Hunter',
                    description: 'A ship designed to hunt the Nemesis. Starts with enhanced shields and weapons.',
                    icon: 'nemesis-hunter'
                };
                
            case 1: // Second defeat
                return {
                    type: 'upgrade',
                    id: 'adaptive_shields',
                    name: 'Adaptive Shields',
                    description: 'Shields that adapt to incoming damage types. Reduces all damage by 10%.',
                    effects: {
                        damageReduction: 0.1
                    },
                    rarity: 'legendary',
                    icon: 'adaptive-shields'
                };
                
            case 2: // Third defeat
                return {
                    type: 'upgrade',
                    id: 'phase_shift_drive',
                    name: 'Phase Shift Drive',
                    description: 'Allows your ship to briefly phase out of reality when taking fatal damage. Once per run.',
                    effects: {
                        extraLife: 1
                    },
                    rarity: 'legendary',
                    icon: 'phase-shift'
                };
                
            default: // Fourth+ defeat
                return {
                    type: 'upgrade',
                    id: 'nemesis_mastery',
                    name: 'Nemesis Mastery ' + (nemesisDefeats - 2),
                    description: 'Your experience fighting the Nemesis has made you stronger. All stats +' + (5 * (nemesisDefeats - 2)) + '%',
                    effects: {
                        allStats: 0.05 * (nemesisDefeats - 2)
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-mastery'
                };
        }
    }
    
    /**
     * Generate an adaptive reward based on player's playstyle
     * @returns {object} Adaptive reward object
     */
    generateAdaptiveReward() {
        // Get player's dominant weapon and build style
        const nemesisSystem = this.game.global.nemesisSystem;
        const dominantWeapon = nemesisSystem.getDominantWeaponType();
        const dominantBuildStyle = nemesisSystem.getDominantBuildStyle();
        
        // Generate reward based on dominant weapon
        const weaponReward = this.generateWeaponBasedReward(dominantWeapon);
        
        // Generate reward based on build style
        const buildReward = this.generateBuildBasedReward(dominantBuildStyle);
        
        return [weaponReward, buildReward];
    }
    
    /**
     * Generate a reward based on player's dominant weapon
     * @param {string} weaponType - The player's dominant weapon type
     * @returns {object} Weapon-based reward object
     */
    generateWeaponBasedReward(weaponType) {
        switch (weaponType) {
            case 'laser':
                return {
                    type: 'upgrade',
                    id: 'nemesis_laser',
                    name: 'Nemesis Laser',
                    description: 'An enhanced laser weapon that pierces through enemies. +30% laser damage.',
                    effects: {
                        laserDamage: 0.3,
                        piercing: true
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-laser'
                };
                
            case 'triBeam':
                return {
                    type: 'upgrade',
                    id: 'nemesis_tri_beam',
                    name: 'Nemesis Tri-Beam',
                    description: 'A spread weapon that fires 5 beams instead of 3. +25% tri-beam damage.',
                    effects: {
                        triBeamDamage: 0.25,
                        extraProjectiles: 2
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-tri-beam'
                };
                
            case 'plasmaBolt':
                return {
                    type: 'upgrade',
                    id: 'nemesis_plasma',
                    name: 'Nemesis Plasma',
                    description: 'Plasma bolts that explode on impact. +35% plasma damage.',
                    effects: {
                        plasmaDamage: 0.35,
                        aoeEffect: true
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-plasma'
                };
                
            case 'homingMissile':
                return {
                    type: 'upgrade',
                    id: 'nemesis_missiles',
                    name: 'Nemesis Missiles',
                    description: 'Advanced homing missiles that split into multiple warheads. +25% missile damage.',
                    effects: {
                        missileDamage: 0.25,
                        missileCount: 3
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-missiles'
                };
                
            case 'dualCannon':
                return {
                    type: 'upgrade',
                    id: 'nemesis_cannon',
                    name: 'Nemesis Cannon',
                    description: 'A quad cannon that fires four projectiles. +30% cannon damage.',
                    effects: {
                        cannonDamage: 0.3,
                        extraCannons: 2
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-cannon'
                };
                
            case 'beamLaser':
                return {
                    type: 'upgrade',
                    id: 'nemesis_beam',
                    name: 'Nemesis Beam',
                    description: 'A continuous beam that grows stronger the longer it hits a target. +25% beam damage.',
                    effects: {
                        beamDamage: 0.25,
                        rampingDamage: true
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-beam'
                };
                
            case 'scatterBomb':
                return {
                    type: 'upgrade',
                    id: 'nemesis_bombs',
                    name: 'Nemesis Bombs',
                    description: 'Bombs that create a massive explosion and leave a damage field. +30% bomb damage.',
                    effects: {
                        bombDamage: 0.3,
                        persistentField: true
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-bombs'
                };
                
            default:
                return {
                    type: 'upgrade',
                    id: 'nemesis_weapon',
                    name: 'Nemesis Weapon',
                    description: 'An advanced weapon system that enhances all weapons. +15% all weapon damage.',
                    effects: {
                        allWeaponDamage: 0.15
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-weapon'
                };
        }
    }
    
    /**
     * Generate a reward based on player's build style
     * @param {string} buildStyle - The player's dominant build style
     * @returns {object} Build-based reward object
     */
    generateBuildBasedReward(buildStyle) {
        switch (buildStyle) {
            case 'offensive':
                return {
                    type: 'upgrade',
                    id: 'nemesis_offensive',
                    name: 'Nemesis Offensive Core',
                    description: 'Enhances all offensive capabilities. +25% damage, +10% fire rate.',
                    effects: {
                        damage: 0.25,
                        fireRate: 0.1
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-offensive'
                };
                
            case 'defensive':
                return {
                    type: 'upgrade',
                    id: 'nemesis_defensive',
                    name: 'Nemesis Defensive Core',
                    description: 'Enhances all defensive capabilities. +30% shields, +20% health.',
                    effects: {
                        shields: 0.3,
                        health: 0.2
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-defensive'
                };
                
            case 'utility':
                return {
                    type: 'upgrade',
                    id: 'nemesis_utility',
                    name: 'Nemesis Utility Core',
                    description: 'Enhances all utility capabilities. +25% speed, +20% cooldown reduction.',
                    effects: {
                        speed: 0.25,
                        cooldown: 0.2
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-utility'
                };
                
            case 'balanced':
            default:
                return {
                    type: 'upgrade',
                    id: 'nemesis_balanced',
                    name: 'Nemesis Balanced Core',
                    description: 'Enhances all capabilities equally. +15% to all stats.',
                    effects: {
                        allStats: 0.15
                    },
                    rarity: 'legendary',
                    icon: 'nemesis-balanced'
                };
        }
    }
    
    /**
     * Apply rewards to the player's game state
     * @param {array} rewards - Array of reward objects
     */
    applyRewards(rewards) {
        if (!rewards || !rewards.length) return;
        
        console.log('Applying Nemesis rewards:', rewards);
        
        rewards.forEach(reward => {
            switch (reward.type) {
                case 'credits':
                    // Add credits to meta-progression
                    this.game.global.metaProgress.credits += reward.value;
                    break;
                    
                case 'upgrade':
                    // Add upgrade to player's collection
                    this.game.global.currentRun.upgrades.push(reward);
                    break;
                    
                case 'unlock':
                    // Unlock new ship if not already unlocked
                    if (!this.game.global.metaProgress.unlockedShips.includes(reward.id)) {
                        this.game.global.metaProgress.unlockedShips.push(reward.id);
                    }
                    break;
            }
        });
        
        // Save game after applying rewards
        if (this.game.global.saveManager) {
            this.game.global.saveManager.saveGame(false);
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisRewards = NemesisRewards;
}
