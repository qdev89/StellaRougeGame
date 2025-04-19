/**
 * Balance Configuration System
 * Central configuration for game balance parameters
 * This allows for easier tuning and adjustment of game difficulty
 */
class BalanceConfig {
    constructor() {
        // Core difficulty settings
        this.difficulty = {
            // Base values for different difficulty levels (0.0 to 1.0)
            veryEasy: 0.2,
            easy: 0.4,
            normal: 0.5,
            hard: 0.7,
            veryHard: 0.9,
            
            // Adaptive difficulty settings
            adaptiveMinimum: 0.2,
            adaptiveMaximum: 0.8,
            adaptationRate: 0.05, // How quickly difficulty adapts (reduced from 0.1 for smoother transitions)
            
            // Performance metrics weights
            performanceWeights: {
                healthRatio: 0.2,
                avoidanceRatio: 0.3,
                killEfficiency: 0.2,
                ammoEfficiency: 0.1,
                progressionSpeed: 0.2
            },
            
            // Thresholds for difficulty adjustment
            increaseThreshold: 0.7, // Performance above this increases difficulty
            decreaseThreshold: 0.3  // Performance below this decreases difficulty
        };
        
        // Enemy scaling multipliers
        this.enemyScaling = {
            // Health scaling (how much enemy health changes with difficulty)
            healthScalingFactor: 0.3, // Results in 0.7x to 1.3x health
            
            // Damage scaling (how much enemy damage changes with difficulty)
            damageScalingFactor: 0.25, // Results in 0.75x to 1.25x damage (reduced from 0.3)
            
            // Speed scaling (how much enemy speed changes with difficulty)
            speedScalingFactor: 0.15, // Results in 0.85x to 1.15x speed (reduced from 0.2)
            
            // Spawn rate scaling (how much enemy count changes with difficulty)
            spawnRateScalingFactor: 0.25, // Results in 0.75x to 1.25x enemies (reduced from 0.3)
            
            // Fire rate scaling (how much enemy fire rate changes with difficulty)
            fireRateScalingFactor: 0.15, // Results in 0.85x to 1.15x fire rate (reduced from 0.2)
            
            // Elite enemy chance scaling
            eliteChanceBase: 0.1, // Base chance for elite enemies
            eliteChanceScalingFactor: 0.1 // How much elite chance scales with difficulty
        };
        
        // Boss scaling multipliers
        this.bossScaling = {
            // Health scaling (how much boss health changes with difficulty)
            healthScalingFactor: 0.4, // Results in 0.8x to 1.4x health (reduced from 0.5)
            
            // Damage scaling (how much boss damage changes with difficulty)
            damageScalingFactor: 0.3, // Results in 0.85x to 1.3x damage (reduced from 0.4)
            
            // Attack frequency scaling
            attackFrequencyScalingFactor: 0.2, // Results in 0.9x to 1.1x attack frequency
            
            // Phase transition scaling
            phaseTransitionScalingFactor: 0.1 // How much phase transitions are affected by difficulty
        };
        
        // Reward scaling multipliers
        this.rewardScaling = {
            // Ammo drop rate scaling (inverse relationship with difficulty)
            ammoDropRateScalingFactor: 0.2, // Results in 1.2x to 0.8x drop rate (reduced from 0.3)
            
            // Health pickup scaling (inverse relationship with difficulty)
            healthPickupScalingFactor: 0.2, // Results in 1.2x to 0.8x health pickups
            
            // Score scaling (direct relationship with difficulty)
            scoreScalingFactor: 0.2 // Results in 0.9x to 1.1x score
        };
        
        // Weapon balance
        this.weapons = {
            // Base damage values
            baseDamage: {
                BASIC_LASER: 15,
                SPREAD_SHOT: 12,
                PLASMA_BOLT: 30,
                HOMING_MISSILE: 25,
                DUAL_CANNON: 10,
                LASER_BEAM: 5, // Damage per tick
                SCATTER_BOMB: 20,
                QUANTUM_BEAM: 40
            },
            
            // Fire rate values (ms between shots)
            fireRate: {
                BASIC_LASER: 250,
                SPREAD_SHOT: 400,
                PLASMA_BOLT: 800,
                HOMING_MISSILE: 1000,
                DUAL_CANNON: 300,
                LASER_BEAM: 50, // Damage tick rate
                SCATTER_BOMB: 1200,
                QUANTUM_BEAM: 1500
            },
            
            // Ammo consumption per shot
            ammoConsumption: {
                BASIC_LASER: 0,
                SPREAD_SHOT: 2,
                PLASMA_BOLT: 3,
                HOMING_MISSILE: 5,
                DUAL_CANNON: 1,
                LASER_BEAM: 0.5, // Per tick
                SCATTER_BOMB: 6,
                QUANTUM_BEAM: 8
            },
            
            // Projectile speed
            projectileSpeed: {
                BASIC_LASER: 600,
                SPREAD_SHOT: 500,
                PLASMA_BOLT: 450,
                HOMING_MISSILE: 350,
                DUAL_CANNON: 550,
                LASER_BEAM: 0, // Instant hit
                SCATTER_BOMB: 300,
                QUANTUM_BEAM: 700
            },
            
            // Special properties
            special: {
                SPREAD_SHOT: {
                    spreadAngle: 30,
                    projectileCount: 3
                },
                HOMING_MISSILE: {
                    trackingStrength: 0.05,
                    maxTurnRate: 0.03
                },
                DUAL_CANNON: {
                    offset: 10,
                    delay: 50
                },
                SCATTER_BOMB: {
                    fragmentCount: 8,
                    fragmentDamage: 10,
                    fragmentSpeed: 200
                }
            }
        };
        
        // Enemy balance
        this.enemies = {
            // Base health values
            baseHealth: {
                DRONE: 30,
                GUNSHIP: 60,
                DESTROYER: 120,
                INTERCEPTOR: 40,
                BOMBER: 80,
                STEALTH: 50,
                TURRET: 100,
                CARRIER: 150
            },
            
            // Base speed values
            baseSpeed: {
                DRONE: 150,
                GUNSHIP: 120,
                DESTROYER: 80,
                INTERCEPTOR: 200,
                BOMBER: 100,
                STEALTH: 180,
                TURRET: 0,
                CARRIER: 60
            },
            
            // Base fire rate values (ms between shots)
            baseFireRate: {
                DRONE: 12000,
                GUNSHIP: 9000,
                DESTROYER: 18000,
                INTERCEPTOR: 6000,
                BOMBER: 24000,
                STEALTH: 15000,
                TURRET: 8000,
                CARRIER: 30000
            },
            
            // Base score values
            baseScore: {
                DRONE: 100,
                GUNSHIP: 250,
                DESTROYER: 500,
                INTERCEPTOR: 150,
                BOMBER: 300,
                STEALTH: 350,
                TURRET: 200,
                CARRIER: 400
            },
            
            // Elite enemy multipliers
            elite: {
                healthMultiplier: 2.0,
                damageMultiplier: 1.5,
                speedMultiplier: 1.2,
                scoreMultiplier: 3.0,
                sizeMultiplier: 1.3
            }
        };
        
        // Boss balance
        this.bosses = {
            // Base health values
            baseHealth: {
                SCOUT_COMMANDER: 500,
                BATTLE_CARRIER: 800,
                DESTROYER_PRIME: 1000,
                STEALTH_OVERLORD: 900,
                DREADNOUGHT: 1500,
                NEMESIS: 2000
            },
            
            // Base score values
            baseScore: {
                SCOUT_COMMANDER: 2000,
                BATTLE_CARRIER: 3000,
                DESTROYER_PRIME: 4000,
                STEALTH_OVERLORD: 4500,
                DREADNOUGHT: 5000,
                NEMESIS: 10000
            },
            
            // Phase count
            phaseCount: {
                SCOUT_COMMANDER: 2,
                BATTLE_CARRIER: 3,
                DESTROYER_PRIME: 3,
                STEALTH_OVERLORD: 3,
                DREADNOUGHT: 4,
                NEMESIS: 5
            }
        };
        
        // Player balance
        this.player = {
            // Base stats
            baseHealth: 100,
            baseShield: 100,
            baseSpeed: 300,
            baseFireRate: 1.0, // Multiplier
            
            // Regeneration rates
            shieldRegenRate: 0.1, // Per second
            ammoRegenRate: 0.5, // Per second
            
            // Invincibility duration after taking damage (ms)
            invincibilityDuration: 1000,
            
            // Starting ammo
            startingAmmo: 50,
            maxAmmo: 100
        };
        
        // Sector generation
        this.sector = {
            // Base sector length
            length: 10000,
            
            // Enemy counts
            minEnemies: 8,
            maxEnemies: 15,
            
            // Hazard frequency
            hazardFrequency: 0.2,
            
            // Upgrade nodes per sector
            upgradeNodes: 3,
            
            // Difficulty scaling per sector
            difficultyScaling: 0.05,
            
            // Wave patterns
            wavePatterns: [
                'line',
                'v_formation',
                'diamond',
                'square',
                'cluster'
            ],
            
            // Enemy weights (chance of spawning)
            enemyWeights: {
                DRONE: 60,
                GUNSHIP: 20,
                DESTROYER: 5,
                INTERCEPTOR: 25,
                BOMBER: 10,
                STEALTH: 15,
                TURRET: 5,
                CARRIER: 3
            }
        };
        
        // Powerup balance
        this.powerups = {
            // Drop chances
            dropChance: {
                base: 0.2,
                eliteBonus: 0.15,
                bossGuaranteed: true
            },
            
            // Powerup effects
            effects: {
                health: 30,
                shield: 30,
                ammo: 25,
                score: 500
            },
            
            // Powerup weights (chance of each type)
            weights: {
                health: 20,
                shield: 20,
                weapon: 15,
                score: 15,
                ammo: 30
            }
        };
    }
    
    /**
     * Get difficulty multipliers based on current difficulty level
     * @param {number} difficultyLevel - Current difficulty level (0.0 to 1.0)
     * @returns {object} Object containing all difficulty multipliers
     */
    getDifficultyMultipliers(difficultyLevel) {
        // Calculate difficulty factor (-1.0 to 1.0)
        // 0.5 is neutral, below 0.5 is easier, above 0.5 is harder
        const difficultyFactor = (difficultyLevel - 0.5) * 2;
        
        return {
            // Enemy multipliers
            enemy: {
                health: 1.0 + (difficultyFactor * this.enemyScaling.healthScalingFactor),
                damage: 1.0 + (difficultyFactor * this.enemyScaling.damageScalingFactor),
                speed: 1.0 + (difficultyFactor * this.enemyScaling.speedScalingFactor),
                spawnRate: 1.0 + (difficultyFactor * this.enemyScaling.spawnRateScalingFactor),
                fireRate: 1.0 + (difficultyFactor * this.enemyScaling.fireRateScalingFactor),
                eliteChance: this.enemyScaling.eliteChanceBase + (difficultyFactor * this.enemyScaling.eliteChanceScalingFactor)
            },
            
            // Boss multipliers
            boss: {
                health: 1.0 + (difficultyFactor * this.bossScaling.healthScalingFactor),
                damage: 1.0 + (difficultyFactor * this.bossScaling.damageScalingFactor),
                attackFrequency: 1.0 + (difficultyFactor * this.bossScaling.attackFrequencyScalingFactor)
            },
            
            // Reward multipliers
            reward: {
                ammoDropRate: 1.0 - (difficultyFactor * this.rewardScaling.ammoDropRateScalingFactor),
                healthPickup: 1.0 - (difficultyFactor * this.rewardScaling.healthPickupScalingFactor),
                score: 1.0 + (difficultyFactor * this.rewardScaling.scoreScalingFactor)
            }
        };
    }
    
    /**
     * Get weapon stats based on weapon type
     * @param {string} weaponType - The type of weapon
     * @returns {object} Weapon stats
     */
    getWeaponStats(weaponType) {
        return {
            damage: this.weapons.baseDamage[weaponType] || 10,
            fireRate: this.weapons.fireRate[weaponType] || 300,
            ammoConsumption: this.weapons.ammoConsumption[weaponType] || 1,
            projectileSpeed: this.weapons.projectileSpeed[weaponType] || 500,
            special: this.weapons.special[weaponType] || {}
        };
    }
    
    /**
     * Get enemy stats based on enemy type and difficulty
     * @param {string} enemyType - The type of enemy
     * @param {number} difficultyLevel - Current difficulty level (0.0 to 1.0)
     * @param {boolean} isElite - Whether the enemy is an elite variant
     * @returns {object} Enemy stats
     */
    getEnemyStats(enemyType, difficultyLevel, isElite = false) {
        // Get base stats
        const baseStats = {
            health: this.enemies.baseHealth[enemyType] || 50,
            speed: this.enemies.baseSpeed[enemyType] || 100,
            fireRate: this.enemies.baseFireRate[enemyType] || 10000,
            score: this.enemies.baseScore[enemyType] || 100
        };
        
        // Get difficulty multipliers
        const multipliers = this.getDifficultyMultipliers(difficultyLevel).enemy;
        
        // Apply difficulty scaling
        const scaledStats = {
            health: Math.round(baseStats.health * multipliers.health),
            speed: baseStats.speed * multipliers.speed,
            fireRate: baseStats.fireRate / multipliers.fireRate, // Lower is faster
            score: Math.round(baseStats.score * multipliers.score)
        };
        
        // Apply elite bonuses if applicable
        if (isElite) {
            scaledStats.health = Math.round(scaledStats.health * this.enemies.elite.healthMultiplier);
            scaledStats.speed = scaledStats.speed * this.enemies.elite.speedMultiplier;
            scaledStats.score = Math.round(scaledStats.score * this.enemies.elite.scoreMultiplier);
        }
        
        return scaledStats;
    }
    
    /**
     * Get boss stats based on boss type and difficulty
     * @param {string} bossType - The type of boss
     * @param {number} difficultyLevel - Current difficulty level (0.0 to 1.0)
     * @returns {object} Boss stats
     */
    getBossStats(bossType, difficultyLevel) {
        // Get base stats
        const baseStats = {
            health: this.bosses.baseHealth[bossType] || 1000,
            score: this.bosses.baseScore[bossType] || 5000,
            phases: this.bosses.phaseCount[bossType] || 3
        };
        
        // Get difficulty multipliers
        const multipliers = this.getDifficultyMultipliers(difficultyLevel).boss;
        
        // Apply difficulty scaling
        return {
            health: Math.round(baseStats.health * multipliers.health),
            score: Math.round(baseStats.score),
            phases: baseStats.phases
        };
    }
    
    /**
     * Get player stats based on ship type and upgrades
     * @param {string} shipType - The type of player ship
     * @param {array} upgrades - Array of active upgrades
     * @returns {object} Player stats
     */
    getPlayerStats(shipType, upgrades = []) {
        // Base stats (could be expanded with different ship types)
        const baseStats = {
            health: this.player.baseHealth,
            shield: this.player.baseShield,
            speed: this.player.baseSpeed,
            fireRate: this.player.baseFireRate,
            shieldRegenRate: this.player.shieldRegenRate,
            ammoRegenRate: this.player.ammoRegenRate,
            startingAmmo: this.player.startingAmmo,
            maxAmmo: this.player.maxAmmo
        };
        
        // Apply ship-specific modifications
        switch (shipType) {
            case 'fighter':
                // Balanced ship
                break;
            case 'interceptor':
                // Fast but fragile
                baseStats.speed *= 1.3;
                baseStats.health *= 0.8;
                baseStats.fireRate *= 1.2;
                break;
            case 'destroyer':
                // Slow but tough
                baseStats.speed *= 0.8;
                baseStats.health *= 1.5;
                baseStats.shield *= 1.3;
                baseStats.fireRate *= 0.9;
                break;
            case 'scout':
                // Fast with good shields but weak weapons
                baseStats.speed *= 1.2;
                baseStats.shield *= 1.2;
                baseStats.fireRate *= 0.9;
                baseStats.shieldRegenRate *= 1.5;
                break;
            case 'gunship':
                // Strong weapons but slow
                baseStats.speed *= 0.9;
                baseStats.fireRate *= 1.3;
                baseStats.ammoRegenRate *= 1.2;
                baseStats.maxAmmo *= 1.3;
                break;
        }
        
        // Apply upgrades
        const finalStats = { ...baseStats };
        
        upgrades.forEach(upgrade => {
            if (upgrade.type === 'health') {
                finalStats.health += upgrade.value;
            } else if (upgrade.type === 'shield') {
                finalStats.shield += upgrade.value;
            } else if (upgrade.type === 'speed') {
                finalStats.speed += upgrade.value;
            } else if (upgrade.type === 'fireRate') {
                finalStats.fireRate += upgrade.value / 100; // Convert from percentage
            } else if (upgrade.type === 'shieldRegenRate') {
                finalStats.shieldRegenRate += upgrade.value;
            } else if (upgrade.type === 'ammoRegen') {
                finalStats.ammoRegenRate += upgrade.value;
            } else if (upgrade.type === 'ammoCapacity') {
                finalStats.maxAmmo += upgrade.value;
            }
            // Additional upgrade types can be handled here
        });
        
        return finalStats;
    }
    
    /**
     * Get powerup drop chance based on enemy type and difficulty
     * @param {string} enemyType - The type of enemy
     * @param {boolean} isElite - Whether the enemy is an elite variant
     * @param {number} difficultyLevel - Current difficulty level (0.0 to 1.0)
     * @returns {number} Drop chance (0.0 to 1.0)
     */
    getPowerupDropChance(enemyType, isElite, difficultyLevel) {
        // Base chance
        let chance = this.powerups.dropChance.base;
        
        // Elite bonus
        if (isElite) {
            chance += this.powerups.dropChance.eliteBonus;
        }
        
        // Apply difficulty scaling
        const multipliers = this.getDifficultyMultipliers(difficultyLevel).reward;
        chance *= multipliers.ammoDropRate;
        
        // Ensure chance is within valid range
        return Math.max(0.05, Math.min(0.5, chance));
    }
    
    /**
     * Get sector generation parameters based on sector number and difficulty
     * @param {number} sectorNumber - Current sector number
     * @param {number} difficultyLevel - Current difficulty level (0.0 to 1.0)
     * @returns {object} Sector generation parameters
     */
    getSectorParams(sectorNumber, difficultyLevel) {
        // Base parameters
        const baseParams = {
            length: this.sector.length,
            minEnemies: this.sector.minEnemies,
            maxEnemies: this.sector.maxEnemies,
            hazardFrequency: this.sector.hazardFrequency,
            upgradeNodes: this.sector.upgradeNodes
        };
        
        // Scale based on sector number
        const sectorScaling = 1.0 + ((sectorNumber - 1) * this.sector.difficultyScaling);
        
        // Apply sector scaling
        const sectorScaled = {
            length: baseParams.length,
            minEnemies: Math.round(baseParams.minEnemies * sectorScaling),
            maxEnemies: Math.round(baseParams.maxEnemies * sectorScaling),
            hazardFrequency: baseParams.hazardFrequency * sectorScaling,
            upgradeNodes: baseParams.upgradeNodes
        };
        
        // Apply difficulty scaling
        const multipliers = this.getDifficultyMultipliers(difficultyLevel);
        
        return {
            length: sectorScaled.length,
            minEnemies: Math.round(sectorScaled.minEnemies * multipliers.enemy.spawnRate),
            maxEnemies: Math.round(sectorScaled.maxEnemies * multipliers.enemy.spawnRate),
            hazardFrequency: sectorScaled.hazardFrequency,
            upgradeNodes: sectorScaled.upgradeNodes,
            enemyWeights: this.sector.enemyWeights,
            wavePatterns: this.sector.wavePatterns,
            eliteChance: this.enemyScaling.eliteChanceBase * sectorScaling * multipliers.enemy.eliteChance
        };
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.BalanceConfig = BalanceConfig;
}
