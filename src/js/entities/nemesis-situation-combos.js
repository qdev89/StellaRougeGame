/**
 * Nemesis Situation-Specific Combo Attacks
 * Provides specialized combo attacks based on specific game situations
 */
class NemesisSituationCombos {
    constructor(scene, boss, comboManager) {
        this.scene = scene;
        this.boss = boss;
        this.comboManager = comboManager;
        
        // Situation tracking
        this.situations = {
            playerLowHealth: false,
            playerCornerTrapped: false,
            playerUsingSpecificWeapon: false,
            playerStationary: false,
            playerAggressive: false,
            playerDefensive: false,
            bossLowHealth: false,
            bossShieldActive: false
        };
        
        // Specialized combo definitions
        this.specialCombos = {
            // When player is trapped in a corner
            cornerTrap: {
                name: 'Corner Trap',
                patterns: ['mines', 'artillery', 'beam'],
                delays: [0, 1000, 2000],
                telegraph: {
                    color: 0xff3333,
                    duration: 1500,
                    text: 'CORNER TRAP ACTIVATED'
                }
            },
            
            // When player is low on health
            finisher: {
                name: 'Finisher',
                patterns: ['spread', 'artillery', 'bombs'],
                delays: [0, 800, 1600],
                telegraph: {
                    color: 0xff0000,
                    duration: 1500,
                    text: 'EXECUTING FINISHER'
                }
            },
            
            // When player is using a specific weapon too much
            counterAttack: {
                name: 'Counter Attack',
                patterns: ['shield', 'phaseShift', 'spread'],
                delays: [0, 1500, 2000],
                telegraph: {
                    color: 0x33ccff,
                    duration: 1500,
                    text: 'COUNTER ATTACK INITIATED'
                }
            },
            
            // When player is stationary for too long
            punishCamping: {
                name: 'Punish Camping',
                patterns: ['artillery', 'bombs', 'mines'],
                delays: [0, 1000, 2000],
                telegraph: {
                    color: 0xffcc33,
                    duration: 1500,
                    text: 'AREA DENIAL ACTIVATED'
                }
            },
            
            // When player is being too aggressive
            defensiveBarrage: {
                name: 'Defensive Barrage',
                patterns: ['shield', 'drones', 'spread', 'spread'],
                delays: [0, 1000, 2000, 2500],
                telegraph: {
                    color: 0x33ff33,
                    duration: 1500,
                    text: 'DEFENSIVE BARRAGE'
                }
            },
            
            // When player is being too defensive
            shieldBreaker: {
                name: 'Shield Breaker',
                patterns: ['beam', 'artillery', 'beam'],
                delays: [0, 2000, 3000],
                telegraph: {
                    color: 0xff6633,
                    duration: 1500,
                    text: 'SHIELD BREAKER ACTIVATED'
                }
            },
            
            // When boss is low on health (last stand)
            lastStand: {
                name: 'Last Stand',
                patterns: ['shield', 'cloak', 'bombs', 'artillery', 'beam'],
                delays: [0, 1000, 2000, 3000, 4000],
                telegraph: {
                    color: 0xff0000,
                    duration: 2000,
                    text: 'LAST STAND PROTOCOL'
                }
            },
            
            // When boss has shield active
            shieldedAssault: {
                name: 'Shielded Assault',
                patterns: ['drones', 'spread', 'artillery'],
                delays: [0, 1000, 2000],
                telegraph: {
                    color: 0x33ff33,
                    duration: 1500,
                    text: 'SHIELDED ASSAULT'
                }
            }
        };
        
        // Tracking variables
        this.playerLastPosition = { x: 0, y: 0 };
        this.playerStationaryTime = 0;
        this.playerLastWeapon = '';
        this.playerWeaponUseCount = {};
        this.playerAggressiveCount = 0;
        this.playerDefensiveCount = 0;
        
        // Cooldowns
        this.situationCooldowns = {};
        Object.keys(this.specialCombos).forEach(key => {
            this.situationCooldowns[key] = 0;
        });
        
        // Cooldown time (ms)
        this.cooldownTime = 20000;
    }
    
    /**
     * Update method called every frame
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update situation detection
        this.updateSituationDetection(time, delta);
        
        // Update cooldowns
        Object.keys(this.situationCooldowns).forEach(key => {
            if (this.situationCooldowns[key] > 0) {
                this.situationCooldowns[key] -= delta;
            }
        });
    }
    
    /**
     * Update situation detection
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateSituationDetection(time, delta) {
        // Get player reference
        const player = this.scene.player;
        if (!player || !player.active) return;
        
        // Check player health
        this.situations.playerLowHealth = player.health / player.maxHealth < 0.3;
        
        // Check boss health
        this.situations.bossLowHealth = this.boss.health / this.boss.maxHealth < 0.2;
        
        // Check boss shield
        this.situations.bossShieldActive = this.boss.activeEffects && this.boss.activeEffects.shield;
        
        // Check if player is trapped in a corner
        this.detectCornerTrap(player);
        
        // Check if player is using a specific weapon too much
        this.detectWeaponOveruse(player);
        
        // Check if player is stationary
        this.detectPlayerStationary(player, delta);
        
        // Check player aggression/defense
        this.detectPlayerStyle(player);
    }
    
    /**
     * Detect if player is trapped in a corner
     * @param {object} player - Player object
     */
    detectCornerTrap(player) {
        // Get screen bounds
        const bounds = {
            left: 0,
            right: this.scene.cameras.main.width,
            top: this.scene.cameras.main.scrollY,
            bottom: this.scene.cameras.main.scrollY + this.scene.cameras.main.height
        };
        
        // Check if player is near edges
        const edgeThreshold = 100;
        const nearLeft = player.x < bounds.left + edgeThreshold;
        const nearRight = player.x > bounds.right - edgeThreshold;
        const nearTop = player.y < bounds.top + edgeThreshold;
        const nearBottom = player.y > bounds.bottom - edgeThreshold;
        
        // Player is in corner if near two edges
        this.situations.playerCornerTrapped = 
            (nearLeft && nearTop) || 
            (nearLeft && nearBottom) || 
            (nearRight && nearTop) || 
            (nearRight && nearBottom);
    }
    
    /**
     * Detect if player is using a specific weapon too much
     * @param {object} player - Player object
     */
    detectWeaponOveruse(player) {
        // Get current weapon
        const currentWeapon = player.currentWeapon;
        
        // Skip if no weapon or same as last frame
        if (!currentWeapon || currentWeapon === this.playerLastWeapon) return;
        
        // Update last weapon
        this.playerLastWeapon = currentWeapon;
        
        // Increment use count for this weapon
        this.playerWeaponUseCount[currentWeapon] = (this.playerWeaponUseCount[currentWeapon] || 0) + 1;
        
        // Check for overuse
        const totalUses = Object.values(this.playerWeaponUseCount).reduce((sum, count) => sum + count, 0);
        const threshold = 0.7; // 70% usage of one weapon is considered overuse
        
        this.situations.playerUsingSpecificWeapon = 
            totalUses > 5 && // Need at least 5 weapon switches to detect
            this.playerWeaponUseCount[currentWeapon] / totalUses > threshold;
    }
    
    /**
     * Detect if player is stationary
     * @param {object} player - Player object
     * @param {number} delta - Time since last update
     */
    detectPlayerStationary(player, delta) {
        // Calculate distance moved since last frame
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            this.playerLastPosition.x, this.playerLastPosition.y
        );
        
        // Update last position
        this.playerLastPosition.x = player.x;
        this.playerLastPosition.y = player.y;
        
        // Update stationary time
        if (distance < 5) { // Less than 5 pixels is considered stationary
            this.playerStationaryTime += delta;
        } else {
            this.playerStationaryTime = 0;
        }
        
        // Player is stationary if not moved for 2 seconds
        this.situations.playerStationary = this.playerStationaryTime > 2000;
    }
    
    /**
     * Detect player's combat style (aggressive or defensive)
     * @param {object} player - Player object
     */
    detectPlayerStyle(player) {
        // These values are updated by event listeners in the scene
        
        // Reset counters periodically
        if (this.scene.time.now % 10000 < 20) { // Reset every 10 seconds
            this.playerAggressiveCount = 0;
            this.playerDefensiveCount = 0;
        }
        
        // Determine style based on counts
        this.situations.playerAggressive = this.playerAggressiveCount > 5;
        this.situations.playerDefensive = this.playerDefensiveCount > 5;
    }
    
    /**
     * Try to execute a situation-specific combo
     * @returns {boolean} Whether a combo was executed
     */
    trySituationCombo() {
        // Skip if combo manager is busy
        if (this.comboManager.activeCombo) return false;
        
        // Check each situation in priority order
        if (this.situations.bossLowHealth && this.checkCooldown('lastStand')) {
            return this.executeSpecialCombo('lastStand');
        }
        
        if (this.situations.playerLowHealth && this.checkCooldown('finisher')) {
            return this.executeSpecialCombo('finisher');
        }
        
        if (this.situations.playerCornerTrapped && this.checkCooldown('cornerTrap')) {
            return this.executeSpecialCombo('cornerTrap');
        }
        
        if (this.situations.playerUsingSpecificWeapon && this.checkCooldown('counterAttack')) {
            return this.executeSpecialCombo('counterAttack');
        }
        
        if (this.situations.playerStationary && this.checkCooldown('punishCamping')) {
            return this.executeSpecialCombo('punishCamping');
        }
        
        if (this.situations.playerAggressive && this.checkCooldown('defensiveBarrage')) {
            return this.executeSpecialCombo('defensiveBarrage');
        }
        
        if (this.situations.playerDefensive && this.checkCooldown('shieldBreaker')) {
            return this.executeSpecialCombo('shieldBreaker');
        }
        
        if (this.situations.bossShieldActive && this.checkCooldown('shieldedAssault')) {
            return this.executeSpecialCombo('shieldedAssault');
        }
        
        return false;
    }
    
    /**
     * Check if a combo is off cooldown
     * @param {string} comboKey - Key of the combo to check
     * @returns {boolean} Whether the combo is off cooldown
     */
    checkCooldown(comboKey) {
        return this.situationCooldowns[comboKey] <= 0;
    }
    
    /**
     * Execute a special combo
     * @param {string} comboKey - Key of the combo to execute
     * @returns {boolean} Whether the combo was executed
     */
    executeSpecialCombo(comboKey) {
        // Get combo data
        const combo = this.specialCombos[comboKey];
        if (!combo) return false;
        
        // Set cooldown
        this.situationCooldowns[comboKey] = this.cooldownTime;
        
        // Execute the combo
        this.executeCombo(combo);
        
        console.log(`Executing situation-specific combo: ${combo.name}`);
        return true;
    }
    
    /**
     * Execute a combo
     * @param {object} combo - Combo data
     */
    executeCombo(combo) {
        // Show telegraph for the combo
        this.showTelegraph(combo.telegraph);
        
        // Set up the combo execution
        const startTime = this.scene.time.now;
        const pendingAttacks = [];
        
        // Schedule each attack in the combo
        combo.patterns.forEach((pattern, index) => {
            pendingAttacks.push({
                pattern: pattern,
                executeTime: startTime + combo.telegraph.duration + combo.delays[index]
            });
        });
        
        // Set active combo in combo manager
        this.comboManager.activeCombo = {
            name: combo.name,
            pendingAttacks: pendingAttacks,
            startTime: startTime
        };
    }
    
    /**
     * Show telegraph for an upcoming combo
     * @param {object} telegraph - Telegraph configuration
     */
    showTelegraph(telegraph) {
        // Skip if no telegraph
        if (!telegraph) return;
        
        // Use the boss's telegraph manager if available
        if (this.boss.telegraphManager) {
            // Create custom telegraph
            const container = this.scene.add.container(this.boss.x, this.boss.y - 50);
            container.setDepth(1000);
            
            // Create telegraph background
            const bg = this.scene.add.rectangle(
                0, 0,
                300, 40,
                telegraph.color,
                0.7
            );
            bg.setStrokeStyle(2, 0xffffff, 0.5);
            
            // Create telegraph text
            const text = this.scene.add.text(
                0, 0,
                telegraph.text,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            // Add to container
            container.add([bg, text]);
            
            // Add pulsing effect
            this.scene.tweens.add({
                targets: container,
                scaleX: { from: 1, to: 1.1 },
                scaleY: { from: 1, to: 1.1 },
                alpha: { from: 1, to: 0.8 },
                duration: 300,
                yoyo: true,
                repeat: -1
            });
            
            // Add visual effect on boss
            if (this.boss.effectsManager) {
                this.boss.effectsManager.showAttackEffect({
                    color: telegraph.color,
                    duration: telegraph.duration
                });
            }
            
            // Destroy after duration
            this.scene.time.delayedCall(telegraph.duration, () => {
                // Fade out
                this.scene.tweens.add({
                    targets: container,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        container.destroy();
                    }
                });
            });
        }
    }
    
    /**
     * Track player attack (for style detection)
     */
    trackPlayerAttack() {
        this.playerAggressiveCount++;
    }
    
    /**
     * Track player defense (for style detection)
     */
    trackPlayerDefense() {
        this.playerDefensiveCount++;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Nothing to clean up
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisSituationCombos = NemesisSituationCombos;
}
