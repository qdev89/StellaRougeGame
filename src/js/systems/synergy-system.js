/**
 * Synergy System
 * Manages synergies between upgrades in the Subsystem Grid
 */
class SynergySystem {
    constructor(scene) {
        this.scene = scene;
        
        // Initialize synergy types
        this.synergyTypes = this.initializeSynergyTypes();
    }
    
    /**
     * Initialize the different types of synergies
     * @returns {Object} Synergy types and their effects
     */
    initializeSynergyTypes() {
        return {
            // Same type synergies
            'weapon_weapon': {
                name: 'Weapon Amplification',
                description: 'Increases weapon damage by 25%',
                effect: {
                    type: 'damage',
                    value: 0.25
                }
            },
            'shield_shield': {
                name: 'Shield Reinforcement',
                description: 'Increases shield capacity by 30%',
                effect: {
                    type: 'shield',
                    value: 0.3
                }
            },
            'sensor_sensor': {
                name: 'Enhanced Sensors',
                description: 'Increases detection range by 40%',
                effect: {
                    type: 'detection',
                    value: 0.4
                }
            },
            'engine_engine': {
                name: 'Engine Overcharge',
                description: 'Increases ship speed by 20%',
                effect: {
                    type: 'speed',
                    value: 0.2
                }
            },
            'reactor_reactor': {
                name: 'Reactor Efficiency',
                description: 'Reduces energy consumption by 25%',
                effect: {
                    type: 'energy',
                    value: 0.25
                }
            },
            'computer_computer': {
                name: 'Processing Boost',
                description: 'Reduces ability cooldowns by 30%',
                effect: {
                    type: 'cooldown',
                    value: 0.3
                }
            },
            'hull_hull': {
                name: 'Hull Reinforcement',
                description: 'Increases hull integrity by 35%',
                effect: {
                    type: 'health',
                    value: 0.35
                }
            },
            'power_power': {
                name: 'Power Surge',
                description: 'Increases all damage output by 20%',
                effect: {
                    type: 'allDamage',
                    value: 0.2
                }
            },
            'cooling_cooling': {
                name: 'Advanced Cooling',
                description: 'Reduces weapon heat generation by 35%',
                effect: {
                    type: 'heat',
                    value: 0.35
                }
            },
            
            // Complementary type synergies
            'weapon_power': {
                name: 'Weapon Overcharge',
                description: 'Increases weapon damage by 40% but generates more heat',
                effect: {
                    type: 'damageHeat',
                    value: 0.4,
                    penalty: 0.2
                }
            },
            'shield_reactor': {
                name: 'Shield Modulation',
                description: 'Shields regenerate 30% faster',
                effect: {
                    type: 'shieldRegen',
                    value: 0.3
                }
            },
            'engine_cooling': {
                name: 'Engine Efficiency',
                description: 'Dash cooldown reduced by 40%',
                effect: {
                    type: 'dashCooldown',
                    value: 0.4
                }
            },
            'sensor_computer': {
                name: 'Targeting Matrix',
                description: 'Increases critical hit chance by 25%',
                effect: {
                    type: 'critical',
                    value: 0.25
                }
            },
            'hull_armor': {
                name: 'Reinforced Structure',
                description: 'Reduces all damage taken by 20%',
                effect: {
                    type: 'damageReduction',
                    value: 0.2
                }
            }
        };
    }
    
    /**
     * Check if two upgrades create a synergy
     * @param {Object} upgrade1 - First upgrade
     * @param {Object} upgrade2 - Second upgrade
     * @returns {Object|null} Synergy effect or null if no synergy
     */
    checkSynergy(upgrade1, upgrade2) {
        // Check for same type synergy
        if (upgrade1.type === upgrade2.type) {
            const synergyKey = `${upgrade1.type}_${upgrade2.type}`;
            return this.synergyTypes[synergyKey] || null;
        }
        
        // Check for complementary type synergy
        const synergyKey1 = `${upgrade1.type}_${upgrade2.type}`;
        const synergyKey2 = `${upgrade2.type}_${upgrade1.type}`;
        
        return this.synergyTypes[synergyKey1] || this.synergyTypes[synergyKey2] || null;
    }
    
    /**
     * Apply synergy effects to the player ship
     * @param {Object} synergy - Synergy effect to apply
     * @param {PlayerShip} playerShip - Player ship to apply effects to
     */
    applySynergyEffect(synergy, playerShip) {
        if (!synergy || !playerShip) return;
        
        const effect = synergy.effect;
        
        switch (effect.type) {
            case 'damage':
                playerShip.damageMultiplier = (playerShip.damageMultiplier || 1) + effect.value;
                break;
            case 'shield':
                playerShip.maxShields *= (1 + effect.value);
                playerShip.shields = Math.min(playerShip.shields, playerShip.maxShields);
                break;
            case 'detection':
                playerShip.detectionRange = (playerShip.detectionRange || 300) * (1 + effect.value);
                break;
            case 'speed':
                playerShip.speed *= (1 + effect.value);
                break;
            case 'energy':
                playerShip.energyConsumption = (playerShip.energyConsumption || 1) * (1 - effect.value);
                break;
            case 'cooldown':
                playerShip.cooldownReduction = (playerShip.cooldownReduction || 0) + effect.value;
                break;
            case 'health':
                playerShip.maxHealth *= (1 + effect.value);
                playerShip.health = Math.min(playerShip.health, playerShip.maxHealth);
                break;
            case 'allDamage':
                playerShip.damageMultiplier = (playerShip.damageMultiplier || 1) + effect.value;
                break;
            case 'heat':
                playerShip.heatGeneration = (playerShip.heatGeneration || 1) * (1 - effect.value);
                break;
            case 'damageHeat':
                playerShip.damageMultiplier = (playerShip.damageMultiplier || 1) + effect.value;
                playerShip.heatGeneration = (playerShip.heatGeneration || 1) * (1 + effect.penalty);
                break;
            case 'shieldRegen':
                playerShip.shieldRegenRate = (playerShip.shieldRegenRate || 1) * (1 + effect.value);
                break;
            case 'dashCooldown':
                playerShip.dashCooldown = CONSTANTS.PLAYER.DASH_COOLDOWN * (1 - effect.value);
                break;
            case 'critical':
                playerShip.criticalChance = (playerShip.criticalChance || 0) + effect.value;
                break;
            case 'damageReduction':
                playerShip.damageReduction = (playerShip.damageReduction || 0) + effect.value;
                break;
            default:
                console.warn(`Unknown synergy effect type: ${effect.type}`);
        }
    }
    
    /**
     * Process all synergies in the grid and apply their effects
     * @param {Array} grid - 2D array representing the subsystem grid
     * @param {PlayerShip} playerShip - Player ship to apply effects to
     */
    processSynergies(grid, playerShip) {
        if (!grid || !playerShip) return;
        
        // Reset synergy effects on player ship
        this.resetSynergyEffects(playerShip);
        
        // Check horizontal synergies
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const upgrade1 = grid[row][col];
                const upgrade2 = grid[row][col + 1];
                
                if (upgrade1 && upgrade2) {
                    const synergy = this.checkSynergy(upgrade1, upgrade2);
                    if (synergy) {
                        this.applySynergyEffect(synergy, playerShip);
                    }
                }
            }
        }
        
        // Check vertical synergies
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const upgrade1 = grid[row][col];
                const upgrade2 = grid[row + 1][col];
                
                if (upgrade1 && upgrade2) {
                    const synergy = this.checkSynergy(upgrade1, upgrade2);
                    if (synergy) {
                        this.applySynergyEffect(synergy, playerShip);
                    }
                }
            }
        }
    }
    
    /**
     * Reset synergy effects on player ship
     * @param {PlayerShip} playerShip - Player ship to reset
     */
    resetSynergyEffects(playerShip) {
        // Reset all synergy-affected properties to their base values
        playerShip.damageMultiplier = 1;
        playerShip.maxShields = CONSTANTS.PLAYER.STARTING_SHIELDS;
        playerShip.detectionRange = 300;
        playerShip.speed = CONSTANTS.PLAYER.MOVEMENT_SPEED;
        playerShip.energyConsumption = 1;
        playerShip.cooldownReduction = 0;
        playerShip.maxHealth = CONSTANTS.PLAYER.STARTING_HEALTH;
        playerShip.heatGeneration = 1;
        playerShip.shieldRegenRate = 1;
        playerShip.dashCooldown = CONSTANTS.PLAYER.DASH_COOLDOWN;
        playerShip.criticalChance = 0;
        playerShip.damageReduction = 0;
        
        // Apply individual upgrades first
        this.applyIndividualUpgrades(playerShip);
    }
    
    /**
     * Apply individual upgrade effects (without synergies)
     * @param {PlayerShip} playerShip - Player ship to apply upgrades to
     */
    applyIndividualUpgrades(playerShip) {
        // Get upgrades from player's current run
        const upgrades = playerShip.scene.game.global.currentRun.upgrades || [];
        
        // Apply each upgrade individually
        upgrades.forEach(upgrade => {
            playerShip.applyUpgrade(upgrade);
        });
    }
    
    /**
     * Get all active synergies in the grid
     * @param {Array} grid - 2D array representing the subsystem grid
     * @returns {Array} List of active synergies
     */
    getActiveSynergies(grid) {
        if (!grid) return [];
        
        const activeSynergies = [];
        
        // Check horizontal synergies
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const upgrade1 = grid[row][col];
                const upgrade2 = grid[row][col + 1];
                
                if (upgrade1 && upgrade2) {
                    const synergy = this.checkSynergy(upgrade1, upgrade2);
                    if (synergy) {
                        activeSynergies.push({
                            synergy: synergy,
                            position: {
                                row1: row, col1: col,
                                row2: row, col2: col + 1
                            }
                        });
                    }
                }
            }
        }
        
        // Check vertical synergies
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const upgrade1 = grid[row][col];
                const upgrade2 = grid[row + 1][col];
                
                if (upgrade1 && upgrade2) {
                    const synergy = this.checkSynergy(upgrade1, upgrade2);
                    if (synergy) {
                        activeSynergies.push({
                            synergy: synergy,
                            position: {
                                row1: row, col1: col,
                                row2: row + 1, col2: col
                            }
                        });
                    }
                }
            }
        }
        
        return activeSynergies;
    }
}
