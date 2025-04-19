/**
 * Dynamic Difficulty System
 * Adjusts game difficulty based on player performance across all gameplay
 */
class DynamicDifficultySystem {
    constructor(game) {
        this.game = game;

        // Initialize with default settings
        this.initialize();
    }

    /**
     * Initialize the dynamic difficulty system
     */
    initialize() {
        // Initialize balance configuration
        this.balanceConfig = new BalanceConfig();

        // Performance metrics
        this.metrics = {
            // Combat metrics
            damageDealt: 0,
            damageTaken: 0,
            enemiesDefeated: 0,
            playerDeaths: 0,
            hitsTaken: 0,
            hitsAvoided: 0,
            criticalHitsLanded: 0,

            // Progression metrics
            sectorsCompleted: 0,
            bossesDefeated: 0,
            upgradesCollected: 0,
            penaltiesReceived: 0,

            // Resource management metrics
            ammoEfficiency: 0,
            healthEfficiency: 0,
            shieldEfficiency: 0,

            // Time-based metrics
            averageSectorTime: 0,
            totalPlayTime: 0,

            // Weapon usage
            weaponUsage: {}
        };

        // Difficulty settings
        this.settings = {
            // Base difficulty level (0.0 to 1.0)
            baseDifficulty: this.balanceConfig.difficulty.normal,

            // Whether adaptive difficulty is enabled
            adaptiveDifficultyEnabled: true,

            // How quickly difficulty adapts (0.0 to 1.0)
            adaptationRate: this.balanceConfig.difficulty.adaptationRate,

            // Difficulty multipliers
            enemyHealthMultiplier: 1.0,
            enemyDamageMultiplier: 1.0,
            enemySpeedMultiplier: 1.0,
            enemySpawnRateMultiplier: 1.0,
            enemyFireRateMultiplier: 1.0,
            bossHealthMultiplier: 1.0,
            bossDamageMultiplier: 1.0,

            // Reward multipliers
            rewardFrequencyMultiplier: 1.0,
            ammoDropRateMultiplier: 1.0,

            // Difficulty bounds (prevents the game from becoming too easy or too hard)
            minDifficulty: this.balanceConfig.difficulty.adaptiveMinimum,
            maxDifficulty: this.balanceConfig.difficulty.adaptiveMaximum
        };

        // Current difficulty level (0.0 to 1.0)
        this.currentDifficulty = this.settings.baseDifficulty;

        // Load saved settings if available
        this.loadSettings();
    }

    /**
     * Load saved difficulty settings
     */
    loadSettings() {
        if (this.game.global && this.game.global.settings && this.game.global.settings.difficulty) {
            // Load base difficulty from game settings
            this.settings.baseDifficulty = this.game.global.settings.difficulty;
            this.currentDifficulty = this.settings.baseDifficulty;

            // Load adaptive difficulty setting
            if (this.game.global.settings.adaptiveDifficulty !== undefined) {
                this.settings.adaptiveDifficultyEnabled = this.game.global.settings.adaptiveDifficulty;
            }

            console.log(`Loaded difficulty settings: ${this.settings.baseDifficulty.toFixed(2)}, Adaptive: ${this.settings.adaptiveDifficultyEnabled}`);
        }
    }

    /**
     * Save current difficulty settings
     */
    saveSettings() {
        if (this.game.global) {
            if (!this.game.global.settings) {
                this.game.global.settings = {};
            }

            // Save current settings
            this.game.global.settings.difficulty = this.settings.baseDifficulty;
            this.game.global.settings.adaptiveDifficulty = this.settings.adaptiveDifficultyEnabled;

            // Save to persistent storage if save manager exists
            if (this.game.global.saveManager) {
                this.game.global.saveManager.saveGame();
            }
        }
    }

    /**
     * Set base difficulty level
     * @param {number} difficulty - Difficulty level (0.0 to 1.0)
     */
    setBaseDifficulty(difficulty) {
        // Clamp difficulty to valid range
        this.settings.baseDifficulty = Math.max(0.0, Math.min(1.0, difficulty));
        this.currentDifficulty = this.settings.baseDifficulty;

        // Update multipliers based on new difficulty
        this.updateMultipliers();

        // Save settings
        this.saveSettings();

        console.log(`Base difficulty set to ${this.settings.baseDifficulty.toFixed(2)}`);
    }

    /**
     * Enable or disable adaptive difficulty
     * @param {boolean} enabled - Whether adaptive difficulty is enabled
     */
    setAdaptiveDifficulty(enabled) {
        this.settings.adaptiveDifficultyEnabled = enabled;

        // Save settings
        this.saveSettings();

        console.log(`Adaptive difficulty ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Update difficulty based on player performance
     * @param {object} scene - The current game scene
     */
    updateDifficulty(scene) {
        // Skip if adaptive difficulty is disabled
        if (!this.settings.adaptiveDifficultyEnabled) {
            return;
        }

        // Calculate performance score (0.0 to 1.0, higher means player is doing well)
        const performanceScore = this.calculatePerformanceScore(scene);

        // Get thresholds from balance configuration
        const increaseThreshold = this.balanceConfig.difficulty.increaseThreshold;
        const decreaseThreshold = this.balanceConfig.difficulty.decreaseThreshold;

        // Adjust difficulty based on performance
        // If player is doing well, increase difficulty; if struggling, decrease it
        if (performanceScore > increaseThreshold) {
            // Player is doing very well, increase difficulty
            this.currentDifficulty = Math.min(
                this.settings.maxDifficulty,
                this.currentDifficulty + this.settings.adaptationRate
            );
        } else if (performanceScore < decreaseThreshold) {
            // Player is struggling, decrease difficulty
            this.currentDifficulty = Math.max(
                this.settings.minDifficulty,
                this.currentDifficulty - this.settings.adaptationRate
            );
        }

        // Update multipliers based on new difficulty
        this.updateMultipliers();

        console.log(`Dynamic difficulty updated: ${this.currentDifficulty.toFixed(2)}, Performance: ${performanceScore.toFixed(2)}`);
    }

    /**
     * Calculate player performance score
     * @param {object} scene - The current game scene
     * @returns {number} Performance score (0.0 to 1.0)
     */
    calculatePerformanceScore(scene) {
        // Get player reference
        const player = scene.player;
        if (!player) return 0.5; // Default to middle if no player

        // Calculate health ratio (higher is better for player)
        const healthRatio = player.health / player.maxHealth;

        // Calculate hit avoidance ratio (higher is better for player)
        const totalHits = this.metrics.hitsTaken + this.metrics.hitsAvoided;
        const avoidanceRatio = totalHits > 0 ? this.metrics.hitsAvoided / totalHits : 0.5;

        // Calculate kill efficiency (higher is better for player)
        const killEfficiency = this.metrics.enemiesDefeated / Math.max(1, this.metrics.damageDealt / 100);

        // Calculate ammo efficiency (higher is better for player)
        const ammoEfficiency = this.metrics.ammoEfficiency;

        // Calculate progression speed (higher is better for player)
        const progressionSpeed = this.metrics.sectorsCompleted / Math.max(1, this.metrics.totalPlayTime / 60000);

        // Get performance weights from balance configuration
        const weights = this.balanceConfig.difficulty.performanceWeights;

        // Weighted performance score
        const performanceScore = (
            (healthRatio * weights.healthRatio) +
            (avoidanceRatio * weights.avoidanceRatio) +
            (killEfficiency * weights.killEfficiency) +
            (ammoEfficiency * weights.ammoEfficiency) +
            (progressionSpeed * weights.progressionSpeed)
        );

        // Clamp to valid range
        return Math.max(0.0, Math.min(1.0, performanceScore));
    }

    /**
     * Update difficulty multipliers based on current difficulty
     */
    updateMultipliers() {
        // Calculate difficulty factor (-1.0 to 1.0)
        // 0.5 is neutral, below 0.5 is easier, above 0.5 is harder
        const difficultyFactor = (this.currentDifficulty - 0.5) * 2;

        // Get multipliers from balance configuration
        const enemyScaling = this.balanceConfig.enemyScaling;
        const bossScaling = this.balanceConfig.bossScaling;
        const rewardScaling = this.balanceConfig.rewardScaling;

        // Update enemy health multiplier
        this.settings.enemyHealthMultiplier = 1.0 + (difficultyFactor * enemyScaling.healthScalingFactor);

        // Update enemy damage multiplier
        this.settings.enemyDamageMultiplier = 1.0 + (difficultyFactor * enemyScaling.damageScalingFactor);

        // Update enemy speed multiplier
        this.settings.enemySpeedMultiplier = 1.0 + (difficultyFactor * enemyScaling.speedScalingFactor);

        // Update enemy spawn rate multiplier
        this.settings.enemySpawnRateMultiplier = 1.0 + (difficultyFactor * enemyScaling.spawnRateScalingFactor);

        // Update enemy fire rate multiplier
        this.settings.enemyFireRateMultiplier = 1.0 + (difficultyFactor * enemyScaling.fireRateScalingFactor);

        // Update boss health multiplier
        this.settings.bossHealthMultiplier = 1.0 + (difficultyFactor * bossScaling.healthScalingFactor);

        // Update boss damage multiplier
        this.settings.bossDamageMultiplier = 1.0 + (difficultyFactor * bossScaling.damageScalingFactor);

        // Update reward frequency multiplier
        // Note: Inverse relationship - higher difficulty means fewer rewards
        this.settings.rewardFrequencyMultiplier = 1.0 - (difficultyFactor * rewardScaling.ammoDropRateScalingFactor);

        // Update ammo drop rate multiplier
        // Note: Inverse relationship - higher difficulty means less ammo
        this.settings.ammoDropRateMultiplier = 1.0 - (difficultyFactor * rewardScaling.ammoDropRateScalingFactor);
    }

    /**
     * Apply difficulty scaling to enemy stats
     * @param {object} enemy - The enemy to scale
     * @returns {object} The scaled enemy
     */
    applyEnemyScaling(enemy) {
        if (!enemy) return enemy;

        // Scale health
        if (enemy.maxHealth) {
            const originalHealth = enemy.maxHealth;
            enemy.maxHealth = Math.round(originalHealth * this.settings.enemyHealthMultiplier);
            enemy.health = enemy.maxHealth;
        }

        // Scale damage
        if (enemy.damage) {
            enemy.damage = Math.round(enemy.damage * this.settings.enemyDamageMultiplier);
        }

        // Scale speed
        if (enemy.speed) {
            enemy.speed = enemy.speed * this.settings.enemySpeedMultiplier;
        }

        // Scale fire rate (lower value = faster firing)
        if (enemy.fireRate) {
            enemy.fireRate = enemy.fireRate / this.settings.enemyFireRateMultiplier;
        }

        return enemy;
    }

    /**
     * Apply difficulty scaling to boss stats
     * @param {object} boss - The boss to scale
     * @returns {object} The scaled boss
     */
    applyBossScaling(boss) {
        if (!boss) return boss;

        // Scale health
        if (boss.maxHealth) {
            const originalHealth = boss.maxHealth;
            boss.maxHealth = Math.round(originalHealth * this.settings.bossHealthMultiplier);
            boss.health = boss.maxHealth;
        }

        // Scale damage
        if (boss.damage) {
            boss.damage = Math.round(boss.damage * this.settings.bossDamageMultiplier);
        }

        // Scale other boss-specific properties
        if (boss.phaseThresholds) {
            // Adjust phase transition thresholds
            for (let i = 0; i < boss.phaseThresholds.length; i++) {
                boss.phaseThresholds[i] = Math.round(boss.phaseThresholds[i] * this.settings.bossHealthMultiplier);
            }
        }

        return boss;
    }

    /**
     * Get the adjusted ammo drop chance
     * @param {number} baseChance - The base chance of dropping ammo
     * @returns {number} The adjusted drop chance
     */
    getAdjustedAmmoDropChance(baseChance) {
        return baseChance * this.settings.ammoDropRateMultiplier;
    }

    /**
     * Get the adjusted enemy count for a wave
     * @param {number} baseCount - The base number of enemies
     * @returns {number} The adjusted enemy count
     */
    getAdjustedEnemyCount(baseCount) {
        // Calculate adjusted count
        const adjustedCount = Math.round(baseCount * this.settings.enemySpawnRateMultiplier);

        // Ensure at least one enemy
        return Math.max(1, adjustedCount);
    }

    /**
     * Record player hit by enemy
     * @param {number} damage - Amount of damage taken
     */
    recordPlayerHit(damage) {
        this.metrics.hitsTaken++;
        this.metrics.damageTaken += damage;
    }

    /**
     * Record player avoiding an enemy attack
     */
    recordPlayerAvoid() {
        this.metrics.hitsAvoided++;
    }

    /**
     * Record player defeating an enemy
     * @param {object} enemy - The defeated enemy
     * @param {number} damage - Amount of damage dealt to defeat the enemy
     */
    recordEnemyDefeated(enemy, damage) {
        this.metrics.enemiesDefeated++;
        this.metrics.damageDealt += damage;

        // Record weapon usage if available
        if (enemy.scene && enemy.scene.player) {
            const weaponType = enemy.scene.player.weaponType;
            if (weaponType) {
                this.metrics.weaponUsage[weaponType] = (this.metrics.weaponUsage[weaponType] || 0) + 1;
            }
        }
    }

    /**
     * Record player death
     */
    recordPlayerDeath() {
        this.metrics.playerDeaths++;
    }

    /**
     * Record sector completion
     * @param {number} sectorNumber - The completed sector number
     * @param {number} timeSpent - Time spent in the sector (ms)
     */
    recordSectorCompleted(sectorNumber, timeSpent) {
        this.metrics.sectorsCompleted++;

        // Update average sector time
        const totalSectorTime = this.metrics.averageSectorTime * (this.metrics.sectorsCompleted - 1) + timeSpent;
        this.metrics.averageSectorTime = totalSectorTime / this.metrics.sectorsCompleted;

        // Update total play time
        this.metrics.totalPlayTime += timeSpent;
    }

    /**
     * Record boss defeated
     * @param {string} bossType - The type of boss defeated
     */
    recordBossDefeated(bossType) {
        this.metrics.bossesDefeated++;
    }

    /**
     * Record upgrade collected
     * @param {object} upgrade - The collected upgrade
     */
    recordUpgradeCollected(upgrade) {
        this.metrics.upgradesCollected++;
    }

    /**
     * Record penalty received
     * @param {object} penalty - The received penalty
     */
    recordPenaltyReceived(penalty) {
        this.metrics.penaltiesReceived++;
    }

    /**
     * Record ammo usage efficiency
     * @param {number} shotsHit - Number of shots that hit enemies
     * @param {number} shotsFired - Total number of shots fired
     */
    recordAmmoEfficiency(shotsHit, shotsFired) {
        if (shotsFired > 0) {
            this.metrics.ammoEfficiency = shotsHit / shotsFired;
        }
    }

    /**
     * Reset metrics for a new game
     */
    resetMetrics() {
        this.metrics = {
            damageDealt: 0,
            damageTaken: 0,
            enemiesDefeated: 0,
            playerDeaths: 0,
            hitsTaken: 0,
            hitsAvoided: 0,
            criticalHitsLanded: 0,
            sectorsCompleted: 0,
            bossesDefeated: 0,
            upgradesCollected: 0,
            penaltiesReceived: 0,
            ammoEfficiency: 0,
            healthEfficiency: 0,
            shieldEfficiency: 0,
            averageSectorTime: 0,
            totalPlayTime: 0,
            weaponUsage: {}
        };
    }

    /**
     * Get difficulty level name based on current difficulty
     * @returns {string} Difficulty level name
     */
    getDifficultyName() {
        if (this.settings.adaptiveDifficultyEnabled) {
            return 'Adaptive';
        }

        if (this.settings.baseDifficulty < 0.25) {
            return 'Very Easy';
        } else if (this.settings.baseDifficulty < 0.45) {
            return 'Easy';
        } else if (this.settings.baseDifficulty < 0.55) {
            return 'Normal';
        } else if (this.settings.baseDifficulty < 0.75) {
            return 'Hard';
        } else {
            return 'Very Hard';
        }
    }

    /**
     * Get difficulty color based on current difficulty
     * @returns {string} Hex color code
     */
    getDifficultyColor() {
        if (this.settings.adaptiveDifficultyEnabled) {
            return '#33ccff'; // Blue for adaptive
        }

        if (this.settings.baseDifficulty < 0.25) {
            return '#33ff33'; // Green for very easy
        } else if (this.settings.baseDifficulty < 0.45) {
            return '#66ff66'; // Light green for easy
        } else if (this.settings.baseDifficulty < 0.55) {
            return '#ffcc33'; // Yellow for normal
        } else if (this.settings.baseDifficulty < 0.75) {
            return '#ff9933'; // Orange for hard
        } else {
            return '#ff3333'; // Red for very hard
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.DynamicDifficultySystem = DynamicDifficultySystem;
}
