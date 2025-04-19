/**
 * Nemesis Adaptive Difficulty System
 * Adjusts difficulty of Nemesis boss fight based on player performance
 */
class NemesisAdaptiveDifficulty {
    constructor(scene) {
        this.scene = scene;
        
        // Performance metrics
        this.metrics = {
            playerHitCount: 0,
            playerDodgeCount: 0,
            playerDeathCount: 0,
            damageDealt: 0,
            damageTaken: 0,
            timeInFight: 0,
            attacksAvoided: 0,
            attacksHit: 0
        };
        
        // Difficulty settings
        this.settings = {
            telegraphDuration: 1000, // Base duration in ms
            comboCooldown: 15000,    // Base cooldown in ms
            attackInterval: 3000,    // Base interval in ms
            projectileSpeed: 1.0,    // Multiplier
            damageMultiplier: 1.0,   // Multiplier
            patternComplexity: 1.0   // Multiplier
        };
        
        // Difficulty level (0-1, where 0 is easiest, 1 is hardest)
        this.difficultyLevel = 0.5;
        
        // Adaptation rate (how quickly difficulty changes)
        this.adaptationRate = 0.05;
        
        // Initialize from saved data if available
        this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners to track player performance
     */
    setupEventListeners() {
        // Track player hits
        this.scene.events.on('player-hit', (damage) => {
            this.metrics.playerHitCount++;
            this.metrics.damageTaken += damage;
            this.updateDifficulty();
        });
        
        // Track player attacks
        this.scene.events.on('player-attack', (damage) => {
            this.metrics.damageDealt += damage;
        });
        
        // Track successful dodges
        this.scene.events.on('attack-missed', () => {
            this.metrics.playerDodgeCount++;
            this.metrics.attacksAvoided++;
            this.updateDifficulty();
        });
        
        // Track successful hits on player
        this.scene.events.on('attack-hit', () => {
            this.metrics.attacksHit++;
            this.updateDifficulty();
        });
        
        // Track player deaths
        this.scene.events.on('player-death', () => {
            this.metrics.playerDeathCount++;
            this.updateDifficulty();
        });
    }
    
    /**
     * Update difficulty based on player performance
     */
    updateDifficulty() {
        // Calculate dodge ratio (higher is better for player)
        const totalAttacks = this.metrics.attacksAvoided + this.metrics.attacksHit;
        const dodgeRatio = totalAttacks > 0 ? this.metrics.attacksAvoided / totalAttacks : 0.5;
        
        // Calculate health ratio (higher is better for player)
        const player = this.scene.player;
        const healthRatio = player ? player.health / player.maxHealth : 0.5;
        
        // Calculate performance score (0-1, higher means player is doing well)
        const performanceScore = (dodgeRatio * 0.7) + (healthRatio * 0.3);
        
        // Adjust difficulty based on performance
        // If player is doing well, increase difficulty; if struggling, decrease it
        if (performanceScore > 0.7) {
            // Player is doing very well, increase difficulty
            this.difficultyLevel = Math.min(1.0, this.difficultyLevel + this.adaptationRate);
        } else if (performanceScore < 0.3) {
            // Player is struggling, decrease difficulty
            this.difficultyLevel = Math.max(0.0, this.difficultyLevel - this.adaptationRate);
        }
        
        // Update settings based on new difficulty level
        this.updateSettings();
        
        console.log(`Nemesis difficulty updated: ${this.difficultyLevel.toFixed(2)}, Performance: ${performanceScore.toFixed(2)}`);
    }
    
    /**
     * Update settings based on current difficulty level
     */
    updateSettings() {
        // Telegraph duration (lower is harder)
        // Range: 1500ms (easy) to 500ms (hard)
        this.settings.telegraphDuration = 1500 - (this.difficultyLevel * 1000);
        
        // Combo cooldown (lower is harder)
        // Range: 20000ms (easy) to 10000ms (hard)
        this.settings.comboCooldown = 20000 - (this.difficultyLevel * 10000);
        
        // Attack interval (lower is harder)
        // Range: 4000ms (easy) to 2000ms (hard)
        this.settings.attackInterval = 4000 - (this.difficultyLevel * 2000);
        
        // Projectile speed (higher is harder)
        // Range: 0.8 (easy) to 1.2 (hard)
        this.settings.projectileSpeed = 0.8 + (this.difficultyLevel * 0.4);
        
        // Damage multiplier (higher is harder)
        // Range: 0.8 (easy) to 1.2 (hard)
        this.settings.damageMultiplier = 0.8 + (this.difficultyLevel * 0.4);
        
        // Pattern complexity (higher is harder)
        // Range: 0.8 (easy) to 1.2 (hard)
        this.settings.patternComplexity = 0.8 + (this.difficultyLevel * 0.4);
        
        // Save settings
        this.saveSettings();
    }
    
    /**
     * Apply settings to a Nemesis boss
     * @param {BossNemesis} boss - The Nemesis boss to apply settings to
     */
    applySettings(boss) {
        if (!boss) return;
        
        // Apply telegraph duration
        if (boss.telegraphManager) {
            boss.telegraphManager.defaultDuration = this.settings.telegraphDuration;
        }
        
        // Apply combo cooldown
        if (boss.comboManager) {
            boss.comboInterval = this.settings.comboCooldown;
        }
        
        // Apply attack interval
        boss.attackPatternInterval = this.settings.attackInterval;
        
        // Apply projectile speed to attack manager
        if (boss.attackManager) {
            boss.attackManager.projectileSpeedMultiplier = this.settings.projectileSpeed;
        }
        
        // Apply damage multiplier
        boss.damageMultiplier = this.settings.damageMultiplier;
        
        // Apply pattern complexity
        if (boss.comboManager) {
            boss.comboManager.complexityMultiplier = this.settings.patternComplexity;
        }
        
        console.log('Applied adaptive difficulty settings to Nemesis boss');
    }
    
    /**
     * Get telegraph duration for a specific attack
     * @param {string} attackType - Type of attack
     * @returns {number} Telegraph duration in ms
     */
    getTelegraphDuration(attackType) {
        // Base duration from current settings
        let duration = this.settings.telegraphDuration;
        
        // Adjust based on attack type
        switch (attackType) {
            case 'beam':
            case 'artillery':
            case 'bombs':
                // More dangerous attacks get longer telegraphs
                duration *= 1.2;
                break;
            case 'spread':
            case 'drones':
                // Less dangerous attacks get shorter telegraphs
                duration *= 0.8;
                break;
            case 'phaseShift':
            case 'cloak':
                // Movement abilities get medium telegraphs
                duration *= 1.0;
                break;
        }
        
        return Math.round(duration);
    }
    
    /**
     * Get projectile speed multiplier
     * @returns {number} Speed multiplier
     */
    getProjectileSpeedMultiplier() {
        return this.settings.projectileSpeed;
    }
    
    /**
     * Get damage multiplier
     * @returns {number} Damage multiplier
     */
    getDamageMultiplier() {
        return this.settings.damageMultiplier;
    }
    
    /**
     * Save settings to local storage
     */
    saveSettings() {
        try {
            const data = {
                difficultyLevel: this.difficultyLevel,
                settings: this.settings,
                metrics: this.metrics
            };
            
            localStorage.setItem('nemesis_adaptive_difficulty', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save Nemesis adaptive difficulty settings', error);
        }
    }
    
    /**
     * Load settings from local storage
     */
    loadSettings() {
        try {
            const data = localStorage.getItem('nemesis_adaptive_difficulty');
            if (data) {
                const parsed = JSON.parse(data);
                
                // Load difficulty level
                this.difficultyLevel = parsed.difficultyLevel || 0.5;
                
                // Load settings
                if (parsed.settings) {
                    this.settings = {
                        ...this.settings,
                        ...parsed.settings
                    };
                }
                
                // Load metrics
                if (parsed.metrics) {
                    this.metrics = {
                        ...this.metrics,
                        ...parsed.metrics
                    };
                }
                
                console.log('Loaded Nemesis adaptive difficulty settings');
            }
        } catch (error) {
            console.warn('Failed to load Nemesis adaptive difficulty settings', error);
        }
    }
    
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            playerHitCount: 0,
            playerDodgeCount: 0,
            playerDeathCount: 0,
            damageDealt: 0,
            damageTaken: 0,
            timeInFight: 0,
            attacksAvoided: 0,
            attacksHit: 0
        };
    }
    
    /**
     * Update time in fight
     * @param {number} delta - Time since last update in ms
     */
    update(delta) {
        // Update time in fight
        this.metrics.timeInFight += delta;
    }
    
    /**
     * Clean up event listeners
     */
    destroy() {
        // Remove event listeners
        this.scene.events.off('player-hit');
        this.scene.events.off('player-attack');
        this.scene.events.off('attack-missed');
        this.scene.events.off('attack-hit');
        this.scene.events.off('player-death');
        
        // Save settings before destroying
        this.saveSettings();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisAdaptiveDifficulty = NemesisAdaptiveDifficulty;
}
