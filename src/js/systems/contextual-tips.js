/**
 * Contextual Tips System
 * Provides contextual gameplay tips based on player actions and game state
 */
class ContextualTips {
    constructor(scene) {
        this.scene = scene;
        this.tipQueue = [];
        this.activeTip = null;
        this.tipElement = null;
        this.tipTimeout = null;
        this.cooldowns = {};
        this.shownTips = new Set();
        
        // Define available tips
        this.defineTips();
    }
    
    /**
     * Define all available contextual tips
     */
    defineTips() {
        this.tips = {
            // Basic gameplay tips
            game_start: {
                text: 'Move your ship with WASD or ARROW KEYS. Your weapons fire automatically.',
                priority: 10,
                cooldown: 60000, // 1 minute
                condition: () => true // Always show on game start
            },
            
            // Combat tips
            multiple_enemies: {
                text: 'When facing multiple enemies, try switching weapons with number keys 1-7.',
                priority: 7,
                cooldown: 30000, // 30 seconds
                condition: () => this.scene.enemies && this.scene.enemies.getChildren().length > 2
            },
            new_enemy_type: {
                text: 'Different enemy types have different attack patterns. Watch and learn their behaviors.',
                priority: 8,
                cooldown: 45000, // 45 seconds
                condition: () => true // Condition checked when triggered
            },
            boss_encounter: {
                text: 'BOSS ENCOUNTER! Bosses have multiple attack phases. Watch for patterns and adapt your strategy.',
                priority: 10,
                cooldown: 120000, // 2 minutes
                condition: () => this.scene.bossEncountered
            },
            
            // Health and shield tips
            health_low: {
                text: 'HULL INTEGRITY LOW! Avoid enemy fire and look for repair powerups.',
                priority: 9,
                cooldown: 20000, // 20 seconds
                condition: () => this.scene.player && this.scene.player.health / this.scene.player.maxHealth <= 0.3
            },
            shields_low: {
                text: 'SHIELDS LOW! Retreat temporarily to allow shields to recharge.',
                priority: 8,
                cooldown: 20000, // 20 seconds
                condition: () => this.scene.player && this.scene.player.shields / this.scene.player.maxShields <= 0.2
            },
            
            // Weapon tips
            ammo_low: {
                text: 'AMMO LOW! Switch to a different weapon or look for ammo drops from defeated enemies.',
                priority: 7,
                cooldown: 25000, // 25 seconds
                condition: () => {
                    if (!this.scene.player) return false;
                    const ammoInfo = this.scene.player.getCurrentAmmo();
                    return ammoInfo && ammoInfo.percentage <= 0.2;
                }
            },
            weapon_switch: {
                text: 'You switched weapons! Each weapon has different strengths against different enemy types.',
                priority: 6,
                cooldown: 40000, // 40 seconds
                condition: () => true // Condition checked when triggered
            },
            
            // Powerup tips
            powerup_collected: {
                text: 'Powerup collected! Look for more powerups to enhance your ship.',
                priority: 5,
                cooldown: 30000, // 30 seconds
                condition: () => true // Condition checked when triggered
            },
            
            // Hazard tips
            hazard_nearby: {
                text: 'HAZARD DETECTED! Avoid environmental hazards or use them against enemies.',
                priority: 8,
                cooldown: 35000, // 35 seconds
                condition: () => true // Condition checked when triggered
            }
        };
    }
    
    /**
     * Check if a tip should be triggered
     * @param {string} tipId - The ID of the tip to check
     */
    checkTrigger(tipId) {
        // Skip if tip doesn't exist
        if (!this.tips[tipId]) {
            console.warn(`Tip with ID "${tipId}" not found`);
            return;
        }
        
        const tip = this.tips[tipId];
        
        // Skip if tip is on cooldown
        if (this.cooldowns[tipId] && Date.now() < this.cooldowns[tipId]) {
            return;
        }
        
        // Skip if tip has already been shown and is a one-time tip
        if (tip.showOnce && this.shownTips.has(tipId)) {
            return;
        }
        
        // Check tip condition
        if (tip.condition && !tip.condition()) {
            return;
        }
        
        // Add tip to queue
        this.queueTip(tipId);
    }
    
    /**
     * Add a tip to the queue
     * @param {string} tipId - The ID of the tip to queue
     */
    queueTip(tipId) {
        const tip = this.tips[tipId];
        
        // Add to queue with ID and priority
        this.tipQueue.push({
            id: tipId,
            priority: tip.priority
        });
        
        // Sort queue by priority (highest first)
        this.tipQueue.sort((a, b) => b.priority - a.priority);
        
        // Process queue if no tip is currently active
        if (!this.activeTip) {
            this.processQueue();
        }
    }
    
    /**
     * Process the tip queue
     */
    processQueue() {
        if (this.tipQueue.length === 0) {
            return;
        }
        
        // Get the highest priority tip
        const nextTip = this.tipQueue.shift();
        this.activeTip = nextTip.id;
        
        // Show the tip
        this.showTip(nextTip.id);
        
        // Set cooldown
        const tip = this.tips[nextTip.id];
        if (tip.cooldown) {
            this.cooldowns[nextTip.id] = Date.now() + tip.cooldown;
        }
        
        // Mark as shown if it's a one-time tip
        if (tip.showOnce) {
            this.shownTips.add(nextTip.id);
        }
    }
    
    /**
     * Show a tip on screen
     * @param {string} tipId - The ID of the tip to show
     */
    showTip(tipId) {
        // Clear any existing tip
        this.clearTip();
        
        const tip = this.tips[tipId];
        if (!tip) return;
        
        // Create tip container
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create tip panel
        const panel = this.scene.add.rectangle(
            width / 2,
            height - 80,
            width * 0.8,
            60,
            0x000033,
            0.8
        ).setScrollFactor(0).setStrokeStyle(2, 0x3399ff).setDepth(900);
        
        // Create tip text
        const text = this.scene.add.text(
            width / 2,
            height - 80,
            tip.text,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 2,
                wordWrap: { width: width * 0.75 }
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(901);
        
        // Store tip element for later cleanup
        this.tipElement = { panel, text };
        
        // Add entrance animation
        this.scene.tweens.add({
            targets: [panel, text],
            y: { from: height, to: height - 80 },
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Power2'
        });
        
        // Set timeout to hide tip
        this.tipTimeout = this.scene.time.delayedCall(5000, () => {
            this.hideTip();
        });
    }
    
    /**
     * Hide the current tip
     */
    hideTip() {
        if (!this.tipElement) return;
        
        // Add exit animation
        this.scene.tweens.add({
            targets: [this.tipElement.panel, this.tipElement.text],
            y: { to: this.scene.cameras.main.height + 50 },
            alpha: { to: 0 },
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.clearTip();
                this.activeTip = null;
                
                // Process next tip in queue
                this.scene.time.delayedCall(500, () => {
                    this.processQueue();
                });
            }
        });
    }
    
    /**
     * Clear the current tip
     */
    clearTip() {
        if (this.tipTimeout) {
            this.tipTimeout.remove();
            this.tipTimeout = null;
        }
        
        if (this.tipElement) {
            if (this.tipElement.panel) this.tipElement.panel.destroy();
            if (this.tipElement.text) this.tipElement.text.destroy();
            this.tipElement = null;
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.clearTip();
        this.tipQueue = [];
        this.activeTip = null;
        this.cooldowns = {};
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ContextualTips = ContextualTips;
}
