/**
 * Nemesis Combo Attacks
 * Manages complex attack combinations for the Nemesis boss
 */
class NemesisComboAttacks {
    constructor(scene, boss, attackManager) {
        this.scene = scene;
        this.boss = boss;
        this.attackManager = attackManager;
        
        // Combo definitions
        this.combos = {
            // Phase 1 combos (Adaptation Phase)
            adaptation: [
                {
                    name: 'Analyze and Strike',
                    patterns: ['adaptive', 'spread'],
                    delays: [0, 1000],
                    telegraph: {
                        color: 0x33ccff,
                        duration: 1000,
                        text: 'ANALYZING'
                    }
                },
                {
                    name: 'Tactical Deployment',
                    patterns: ['mines', 'phaseShift', 'spread'],
                    delays: [0, 1500, 2000],
                    telegraph: {
                        color: 0xffcc33,
                        duration: 1000,
                        text: 'DEPLOYING MINES'
                    }
                }
            ],
            
            // Phase 2 combos (Aggressive Phase)
            aggressive: [
                {
                    name: 'Overwhelming Force',
                    patterns: ['artillery', 'spread', 'spread'],
                    delays: [0, 1000, 2000],
                    telegraph: {
                        color: 0xff3333,
                        duration: 1500,
                        text: 'CHARGING WEAPONS'
                    }
                },
                {
                    name: 'Drone Swarm',
                    patterns: ['drones', 'drones', 'phaseShift'],
                    delays: [0, 1000, 3000],
                    telegraph: {
                        color: 0xff9933,
                        duration: 1500,
                        text: 'DEPLOYING DRONES'
                    }
                }
            ],
            
            // Phase 3 combos (Defensive Phase)
            defensive: [
                {
                    name: 'Impenetrable Defense',
                    patterns: ['shield', 'mines', 'drones'],
                    delays: [0, 1000, 2000],
                    telegraph: {
                        color: 0x33ff33,
                        duration: 1500,
                        text: 'ACTIVATING SHIELDS'
                    }
                },
                {
                    name: 'Tactical Retreat',
                    patterns: ['phaseShift', 'cloak', 'mines'],
                    delays: [0, 1000, 2000],
                    telegraph: {
                        color: 0x9933cc,
                        duration: 1500,
                        text: 'INITIATING PHASE SHIFT'
                    }
                }
            ],
            
            // Phase 4 combos (Desperate Phase)
            desperate: [
                {
                    name: 'Desperate Measures',
                    patterns: ['bombs', 'artillery', 'phaseShift', 'spread'],
                    delays: [0, 1000, 2500, 3000],
                    telegraph: {
                        color: 0xff6633,
                        duration: 2000,
                        text: 'WARNING: BOMBS DETECTED'
                    }
                },
                {
                    name: 'Last Stand',
                    patterns: ['beam', 'mines', 'drones', 'artillery'],
                    delays: [0, 2000, 2500, 4000],
                    telegraph: {
                        color: 0xff3333,
                        duration: 2000,
                        text: 'CHARGING BEAM'
                    }
                }
            ],
            
            // Phase 5 combos (Final Phase)
            final: [
                {
                    name: 'Extinction Protocol',
                    patterns: ['shield', 'beam', 'bombs', 'artillery', 'spread'],
                    delays: [0, 1000, 3000, 4000, 5000],
                    telegraph: {
                        color: 0xff0000,
                        duration: 2500,
                        text: 'EXTINCTION PROTOCOL ACTIVATED'
                    }
                },
                {
                    name: 'Nemesis Fury',
                    patterns: ['phaseShift', 'cloak', 'drones', 'bombs', 'beam'],
                    delays: [0, 1500, 2000, 3500, 5000],
                    telegraph: {
                        color: 0xff3366,
                        duration: 2500,
                        text: 'NEMESIS FURY UNLEASHED'
                    }
                }
            ]
        };
        
        // Active combo
        this.activeCombo = null;
        
        // Combo cooldown
        this.comboCooldown = 0;
        this.comboCooldownTime = 10000; // 10 seconds between combos
    }
    
    /**
     * Update method called every frame
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update combo cooldown
        if (this.comboCooldown > 0) {
            this.comboCooldown -= delta;
        }
        
        // Update active combo
        if (this.activeCombo) {
            this.updateActiveCombo(time, delta);
        }
    }
    
    /**
     * Update the active combo
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateActiveCombo(time, delta) {
        // Check if combo has pending attacks
        if (this.activeCombo.pendingAttacks.length > 0) {
            // Get the next attack
            const nextAttack = this.activeCombo.pendingAttacks[0];
            
            // Check if it's time to execute the attack
            if (time >= nextAttack.executeTime) {
                // Execute the attack
                this.attackManager.executePattern(nextAttack.pattern);
                
                // Remove the attack from pending
                this.activeCombo.pendingAttacks.shift();
                
                // If no more pending attacks, end the combo
                if (this.activeCombo.pendingAttacks.length === 0) {
                    this.activeCombo = null;
                    this.comboCooldown = this.comboCooldownTime;
                }
            }
        }
    }
    
    /**
     * Execute a combo attack
     * @param {string} phase - Current phase of the boss
     * @returns {boolean} Whether a combo was executed
     */
    executeCombo(phase) {
        // Skip if on cooldown or already executing a combo
        if (this.comboCooldown > 0 || this.activeCombo) {
            return false;
        }
        
        // Get combos for the current phase
        const phaseCombos = this.combos[phase];
        if (!phaseCombos || phaseCombos.length === 0) {
            return false;
        }
        
        // Select a random combo
        const combo = phaseCombos[Math.floor(Math.random() * phaseCombos.length)];
        
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
        
        // Set active combo
        this.activeCombo = {
            name: combo.name,
            pendingAttacks: pendingAttacks,
            startTime: startTime
        };
        
        console.log(`Executing combo: ${combo.name}`);
        return true;
    }
    
    /**
     * Show telegraph for an upcoming combo
     * @param {object} telegraph - Telegraph configuration
     */
    showTelegraph(telegraph) {
        // Skip if no telegraph
        if (!telegraph) return;
        
        // Create telegraph container
        const container = this.scene.add.container(this.boss.x, this.boss.y - 50);
        container.setDepth(1000);
        
        // Create telegraph background
        const bg = this.scene.add.rectangle(
            0, 0,
            200, 40,
            telegraph.color,
            0.7
        );
        
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
    
    /**
     * Get combo chance based on boss health
     * @returns {number} Chance of executing a combo (0-1)
     */
    getComboChance() {
        // Higher chance at lower health
        const healthPercent = this.boss.health / this.boss.maxHealth;
        
        if (healthPercent < 0.2) {
            return 0.8; // 80% chance in final phase
        } else if (healthPercent < 0.4) {
            return 0.6; // 60% chance in desperate phase
        } else if (healthPercent < 0.6) {
            return 0.4; // 40% chance in defensive phase
        } else if (healthPercent < 0.8) {
            return 0.3; // 30% chance in aggressive phase
        } else {
            return 0.2; // 20% chance in adaptation phase
        }
    }
    
    /**
     * Try to execute a combo based on current phase and chance
     * @returns {boolean} Whether a combo was executed
     */
    tryExecuteCombo() {
        // Get current phase
        const phaseIndex = this.boss.getCurrentPhaseIndex();
        const phase = this.boss.phases[phaseIndex];
        
        // Calculate chance
        const chance = this.getComboChance();
        
        // Roll for combo
        if (Math.random() < chance) {
            return this.executeCombo(phase);
        }
        
        return false;
    }
    
    /**
     * Clean up all active combos
     */
    destroy() {
        this.activeCombo = null;
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisComboAttacks = NemesisComboAttacks;
}
