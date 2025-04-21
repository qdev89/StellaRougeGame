/**
 * Contextual Tips System
 * Provides context-sensitive tips during gameplay
 */
class ContextualTips {
    constructor(scene) {
        this.scene = scene;
        
        // Tips state
        this.shownTips = new Set();
        this.activeTip = null;
        this.tipQueue = [];
        this.tipContainer = null;
        
        // Load previously shown tips
        this.loadShownTips();
        
        // Define all available tips
        this.defineTips();
    }
    
    /**
     * Load previously shown tips from localStorage
     */
    loadShownTips() {
        try {
            const shownTipsJson = localStorage.getItem('shown_tips');
            if (shownTipsJson) {
                const shownTipsArray = JSON.parse(shownTipsJson);
                this.shownTips = new Set(shownTipsArray);
            }
        } catch (error) {
            console.warn('Failed to load shown tips', error);
            this.shownTips = new Set();
        }
    }
    
    /**
     * Save shown tips to localStorage
     */
    saveShownTips() {
        try {
            const shownTipsArray = Array.from(this.shownTips);
            localStorage.setItem('shown_tips', JSON.stringify(shownTipsArray));
        } catch (error) {
            console.warn('Failed to save shown tips', error);
        }
    }
    
    /**
     * Define all available tips
     */
    defineTips() {
        // Combat tips
        this.tips = {
            // Movement tips
            movement_basics: {
                id: 'movement_basics',
                title: 'SHIP MOVEMENT',
                text: 'Use WASD or ARROW KEYS to move your ship.',
                trigger: 'game_start',
                priority: 100
            },
            dash_ability: {
                id: 'dash_ability',
                title: 'DASH ABILITY',
                text: 'Press SPACE to dash, giving you a burst of speed and temporary invulnerability.',
                trigger: 'enemy_nearby',
                priority: 90
            },
            
            // Combat tips
            weapon_switching: {
                id: 'weapon_switching',
                title: 'WEAPON SWITCHING',
                text: 'Press 1-7 to switch between different weapons. Each has unique properties.',
                trigger: 'multiple_enemies',
                priority: 80
            },
            enemy_patterns: {
                id: 'enemy_patterns',
                title: 'ENEMY PATTERNS',
                text: 'Different enemies have unique attack patterns. Learn to recognize them!',
                trigger: 'new_enemy_type',
                priority: 70
            },
            
            // Health and shields
            shield_regen: {
                id: 'shield_regen',
                title: 'SHIELD REGENERATION',
                text: 'Shields regenerate over time. Try to avoid damage to let them recharge.',
                trigger: 'shields_low',
                priority: 95
            },
            health_critical: {
                id: 'health_critical',
                title: 'CRITICAL DAMAGE',
                text: 'Your hull integrity is critical! Find health pickups or play defensively.',
                trigger: 'health_low',
                priority: 100
            },
            
            // Powerups
            powerup_types: {
                id: 'powerup_types',
                title: 'POWERUP TYPES',
                text: 'Collect powerups to restore health (red), shields (blue), ammo (yellow), or score (green).',
                trigger: 'powerup_spawned',
                priority: 85
            },
            
            // Sector map
            path_difficulty: {
                id: 'path_difficulty',
                title: 'PATH DIFFICULTY',
                text: 'Harder paths (orange/red) have more enemies but offer better rewards.',
                trigger: 'sector_map_opened',
                priority: 90
            },
            
            // Upgrades
            upgrade_synergies: {
                id: 'upgrade_synergies',
                title: 'UPGRADE SYNERGIES',
                text: 'Some upgrades work well together. Look for complementary effects!',
                trigger: 'upgrade_screen',
                priority: 80
            },
            
            // Boss fights
            boss_patterns: {
                id: 'boss_patterns',
                title: 'BOSS PATTERNS',
                text: 'Bosses have multiple attack phases. Watch for visual cues before attacks!',
                trigger: 'boss_encounter',
                priority: 100
            }
        };
    }
    
    /**
     * Check if a tip should be shown based on a trigger
     * @param {string} trigger - The trigger event
     * @param {Object} context - Additional context for the trigger
     */
    checkTrigger(trigger, context = {}) {
        // Skip if a tip is already showing
        if (this.activeTip) return;
        
        // Find all tips that match this trigger
        const matchingTips = Object.values(this.tips).filter(tip => 
            tip.trigger === trigger && !this.shownTips.has(tip.id)
        );
        
        // Skip if no matching tips
        if (matchingTips.length === 0) return;
        
        // Sort by priority (highest first)
        matchingTips.sort((a, b) => b.priority - a.priority);
        
        // Queue the highest priority tip
        this.queueTip(matchingTips[0]);
    }
    
    /**
     * Queue a tip to be shown
     * @param {Object} tip - The tip to queue
     */
    queueTip(tip) {
        // Add to queue
        this.tipQueue.push(tip);
        
        // Process queue if not already processing
        if (!this.activeTip) {
            this.processQueue();
        }
    }
    
    /**
     * Process the tip queue
     */
    processQueue() {
        // Skip if queue is empty
        if (this.tipQueue.length === 0) return;
        
        // Get next tip
        const tip = this.tipQueue.shift();
        
        // Show the tip
        this.showTip(tip);
    }
    
    /**
     * Show a tip
     * @param {Object} tip - The tip to show
     */
    showTip(tip) {
        // Set as active tip
        this.activeTip = tip;
        
        // Create container if it doesn't exist
        if (!this.tipContainer) {
            this.createTipContainer();
        }
        
        // Update tip content
        this.updateTipContent(tip);
        
        // Show the container
        this.tipContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: this.tipContainer,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // Auto-hide after delay
        this.scene.time.delayedCall(5000, () => {
            this.hideTip();
        });
        
        // Mark tip as shown
        this.shownTips.add(tip.id);
        this.saveShownTips();
    }
    
    /**
     * Create the tip container
     */
    createTipContainer() {
        // Create container
        this.tipContainer = this.scene.add.container(0, 0);
        this.tipContainer.setDepth(1000);
        
        // Position at bottom of screen
        const x = this.scene.cameras.main.width / 2;
        const y = this.scene.cameras.main.height - 100;
        this.tipContainer.setPosition(x, y);
        
        // Create background
        this.tipBackground = this.scene.add.rectangle(
            0, 0,
            400, 80,
            0x000000,
            0.8
        );
        this.tipBackground.setStrokeStyle(2, 0x3399ff, 1);
        
        // Create title text
        this.tipTitle = this.scene.add.text(
            0, -25,
            "TIP",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#3399ff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create tip text
        this.tipText = this.scene.add.text(
            0, 5,
            "Tip text goes here",
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 1,
                wordWrap: { width: 380 }
            }
        ).setOrigin(0.5);
        
        // Create dismiss button
        this.dismissButton = this.scene.add.text(
            180, -30,
            "✕",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#999999',
                align: 'center'
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Add hover effect to dismiss button
        this.dismissButton.on('pointerover', () => {
            this.dismissButton.setColor('#ffffff');
        });
        
        this.dismissButton.on('pointerout', () => {
            this.dismissButton.setColor('#999999');
        });
        
        // Add click handler to dismiss button
        this.dismissButton.on('pointerdown', () => {
            this.hideTip();
        });
        
        // Add elements to container
        this.tipContainer.add([this.tipBackground, this.tipTitle, this.tipText, this.dismissButton]);
    }
    
    /**
     * Update tip content
     * @param {Object} tip - The tip to display
     */
    updateTipContent(tip) {
        // Update title and text
        this.tipTitle.setText(tip.title);
        this.tipText.setText(tip.text);
        
        // Adjust background height based on text height
        const height = Math.max(80, this.tipText.height + 60);
        this.tipBackground.height = height;
    }
    
    /**
     * Hide the current tip
     */
    hideTip() {
        // Skip if no active tip
        if (!this.activeTip) return;
        
        // Hide with animation
        this.scene.tweens.add({
            targets: this.tipContainer,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Clear active tip
                this.activeTip = null;
                
                // Process next tip in queue
                this.processQueue();
            }
        });
    }
    
    /**
     * Reset all tips (for testing)
     */
    resetAllTips() {
        this.shownTips.clear();
        this.saveShownTips();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ContextualTips = ContextualTips;
}
