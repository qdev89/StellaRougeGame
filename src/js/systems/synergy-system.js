/**
 * Synergy System
 * Manages synergies between upgrades in the Subsystem Grid
 */
class SynergySystem {
    constructor(scene) {
        this.scene = scene;

        // Initialize synergy types
        this.synergyTypes = this.initializeSynergyTypes();

        // Initialize element-based synergies
        this.elementSynergies = this.initializeElementSynergies();
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
     * Initialize element-based synergies
     * @returns {Object} Element synergy types and their effects
     */
    initializeElementSynergies() {
        return {
            // Basic elements
            'fire': {
                name: 'Fire Element',
                description: 'Adds fire damage to weapons',
                color: 0xff3300,
                effect: {
                    type: 'elementalDamage',
                    element: 'fire',
                    value: 0.2,
                    duration: 3000 // DoT duration in ms
                }
            },
            'ice': {
                name: 'Ice Element',
                description: 'Adds freezing effect to weapons',
                color: 0x33ccff,
                effect: {
                    type: 'elementalEffect',
                    element: 'ice',
                    value: 0.15, // Slow amount
                    duration: 2000 // Slow duration in ms
                }
            },
            'electric': {
                name: 'Electric Element',
                description: 'Adds chain lightning to weapons',
                color: 0x66ccff,
                effect: {
                    type: 'elementalChain',
                    element: 'electric',
                    value: 0.5, // Damage reduction per jump
                    chainCount: 3 // Number of chain jumps
                }
            },
            'toxic': {
                name: 'Toxic Element',
                description: 'Adds poison damage over time',
                color: 0x33cc33,
                effect: {
                    type: 'elementalDamage',
                    element: 'toxic',
                    value: 0.1, // Damage per tick
                    duration: 5000, // DoT duration in ms
                    tickRate: 500 // Damage tick rate in ms
                }
            },

            // Element combinations
            'fire_ice': {
                name: 'Steam Burst',
                description: 'Creates a steam explosion on impact',
                color: 0xccffff,
                effect: {
                    type: 'elementalExplosion',
                    value: 0.3, // Explosion damage
                    radius: 100 // Explosion radius
                }
            },
            'fire_electric': {
                name: 'Plasma Surge',
                description: 'Creates a plasma field that damages enemies',
                color: 0xff66ff,
                effect: {
                    type: 'elementalField',
                    value: 0.15, // Field damage per tick
                    duration: 4000, // Field duration in ms
                    radius: 80 // Field radius
                }
            },
            'ice_electric': {
                name: 'Cryo-Shock',
                description: 'Freezes enemies and chains to nearby targets',
                color: 0x00ffff,
                effect: {
                    type: 'elementalCombo',
                    value: 0.2, // Damage
                    duration: 2500, // Freeze duration
                    chainCount: 2 // Number of chain jumps
                }
            },
            'toxic_fire': {
                name: 'Corrosive Flame',
                description: 'Melts enemy armor and applies burning damage',
                color: 0x99cc00,
                effect: {
                    type: 'elementalArmor',
                    value: 0.3, // Armor reduction
                    damage: 0.15, // DoT damage
                    duration: 4000 // Effect duration
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

        // Check for element synergy if both upgrades have elements
        if (upgrade1.element && upgrade2.element) {
            const elementKey1 = `${upgrade1.element}_${upgrade2.element}`;
            const elementKey2 = `${upgrade2.element}_${upgrade1.element}`;

            const elementSynergy = this.elementSynergies[elementKey1] || this.elementSynergies[elementKey2];
            if (elementSynergy) {
                return elementSynergy;
            }
        }

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
            // Element-based synergy effects
            case 'elementalDamage':
                // Apply elemental damage effect to player's weapons
                this.applyElementalDamage(playerShip, effect);
                break;
            case 'elementalEffect':
                // Apply elemental status effect to player's weapons
                this.applyElementalEffect(playerShip, effect);
                break;
            case 'elementalChain':
                // Apply chain effect to player's weapons
                this.applyElementalChain(playerShip, effect);
                break;
            case 'elementalExplosion':
                // Apply explosion effect to player's weapons
                this.applyElementalExplosion(playerShip, effect);
                break;
            case 'elementalField':
                // Apply field effect to player's weapons
                this.applyElementalField(playerShip, effect);
                break;
            case 'elementalCombo':
                // Apply combo effect to player's weapons
                this.applyElementalCombo(playerShip, effect);
                break;
            case 'elementalArmor':
                // Apply armor reduction effect to player's weapons
                this.applyElementalArmor(playerShip, effect);
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
     * Apply elemental damage effect to player's weapons
     * @param {PlayerShip} playerShip - Player ship to apply effect to
     * @param {Object} effect - Elemental effect data
     */
    applyElementalDamage(playerShip, effect) {
        // Store the elemental effect on the player ship
        playerShip.elementalEffects = playerShip.elementalEffects || {};
        playerShip.elementalEffects.damage = playerShip.elementalEffects.damage || [];

        // Add or update the effect
        const existingEffect = playerShip.elementalEffects.damage.find(e => e.element === effect.element);
        if (existingEffect) {
            existingEffect.value = Math.max(existingEffect.value, effect.value);
            existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
        } else {
            playerShip.elementalEffects.damage.push({
                element: effect.element,
                value: effect.value,
                duration: effect.duration,
                tickRate: effect.tickRate || 1000
            });
        }

        // Override the player's fire weapon method to apply elemental damage
        if (!playerShip._originalFireWeapon) {
            playerShip._originalFireWeapon = playerShip.fireWeapon;

            playerShip.fireWeapon = function() {
                // Call original method
                this._originalFireWeapon.call(this);

                // Apply elemental effects to the last fired projectile
                if (this.lastFiredProjectile && this.lastFiredProjectile.active && this.elementalEffects) {
                    this.lastFiredProjectile.elementalEffects = this.elementalEffects;

                    // Add visual effect based on element
                    if (this.elementalEffects.damage) {
                        this.elementalEffects.damage.forEach(effect => {
                            let color;
                            switch (effect.element) {
                                case 'fire': color = 0xff3300; break;
                                case 'ice': color = 0x33ccff; break;
                                case 'electric': color = 0x66ccff; break;
                                case 'toxic': color = 0x33cc33; break;
                                default: color = 0xffffff;
                            }

                            // Apply color tint
                            this.lastFiredProjectile.setTint(color);

                            // Add particle trail if visual effects system exists
                            if (this.scene.visualEffects) {
                                this.scene.visualEffects.createElementalTrail(
                                    this.lastFiredProjectile,
                                    effect.element,
                                    color
                                );
                            }
                        });
                    }
                }
            };
        }
    }

    /**
     * Apply elemental status effect to player's weapons
     * @param {PlayerShip} playerShip - Player ship to apply effect to
     * @param {Object} effect - Elemental effect data
     */
    applyElementalEffect(playerShip, effect) {
        // Store the elemental effect on the player ship
        playerShip.elementalEffects = playerShip.elementalEffects || {};
        playerShip.elementalEffects.status = playerShip.elementalEffects.status || [];

        // Add or update the effect
        const existingEffect = playerShip.elementalEffects.status.find(e => e.element === effect.element);
        if (existingEffect) {
            existingEffect.value = Math.max(existingEffect.value, effect.value);
            existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
        } else {
            playerShip.elementalEffects.status.push({
                element: effect.element,
                value: effect.value,
                duration: effect.duration
            });
        }
    }

    /**
     * Apply elemental chain effect to player's weapons
     * @param {PlayerShip} playerShip - Player ship to apply effect to
     * @param {Object} effect - Elemental effect data
     */
    applyElementalChain(playerShip, effect) {
        // Store the elemental effect on the player ship
        playerShip.elementalEffects = playerShip.elementalEffects || {};
        playerShip.elementalEffects.chain = {
            element: effect.element,
            value: effect.value,
            chainCount: effect.chainCount
        };
    }

    /**
     * Apply elemental explosion effect to player's weapons
     * @param {PlayerShip} playerShip - Player ship to apply effect to
     * @param {Object} effect - Elemental effect data
     */
    applyElementalExplosion(playerShip, effect) {
        // Store the elemental effect on the player ship
        playerShip.elementalEffects = playerShip.elementalEffects || {};
        playerShip.elementalEffects.explosion = {
            value: effect.value,
            radius: effect.radius
        };
    }

    /**
     * Apply elemental field effect to player's weapons
     * @param {PlayerShip} playerShip - Player ship to apply effect to
     * @param {Object} effect - Elemental effect data
     */
    applyElementalField(playerShip, effect) {
        // Store the elemental effect on the player ship
        playerShip.elementalEffects = playerShip.elementalEffects || {};
        playerShip.elementalEffects.field = {
            value: effect.value,
            duration: effect.duration,
            radius: effect.radius
        };
    }

    /**
     * Apply elemental combo effect to player's weapons
     * @param {PlayerShip} playerShip - Player ship to apply effect to
     * @param {Object} effect - Elemental effect data
     */
    applyElementalCombo(playerShip, effect) {
        // Store the elemental effect on the player ship
        playerShip.elementalEffects = playerShip.elementalEffects || {};
        playerShip.elementalEffects.combo = {
            value: effect.value,
            duration: effect.duration,
            chainCount: effect.chainCount
        };
    }

    /**
     * Apply elemental armor reduction effect to player's weapons
     * @param {PlayerShip} playerShip - Player ship to apply effect to
     * @param {Object} effect - Elemental effect data
     */
    applyElementalArmor(playerShip, effect) {
        // Store the elemental effect on the player ship
        playerShip.elementalEffects = playerShip.elementalEffects || {};
        playerShip.elementalEffects.armor = {
            value: effect.value,
            damage: effect.damage,
            duration: effect.duration
        };
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

        // Reset elemental effects
        playerShip.elementalEffects = {};

        // Restore original fire weapon method if it was overridden
        if (playerShip._originalFireWeapon) {
            playerShip.fireWeapon = playerShip._originalFireWeapon;
            playerShip._originalFireWeapon = null;
        }

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
