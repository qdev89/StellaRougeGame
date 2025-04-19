/**
 * Nemesis Reward Display
 * Creates a visually appealing display for Nemesis rewards
 */
class NemesisRewardDisplay {
    constructor(scene) {
        this.scene = scene;
        this.rewards = [];
        this.container = null;
        this.iconsManager = null;
        
        // Initialize the icons manager
        this.initializeIconsManager();
    }
    
    /**
     * Initialize the icons manager
     */
    initializeIconsManager() {
        this.iconsManager = new NemesisIcons(this.scene);
    }
    
    /**
     * Show rewards in a visually appealing display
     * @param {array} rewards - Array of reward objects
     * @param {object} options - Display options
     * @returns {Phaser.GameObjects.Container} The rewards container
     */
    showRewards(rewards, options = {}) {
        const defaults = {
            x: this.scene.cameras.main.width / 2,
            y: this.scene.cameras.main.height / 2,
            width: 500,
            height: 400,
            title: 'NEMESIS REWARDS',
            onClose: null,
            autoClose: false,
            closeDelay: 5000
        };
        
        const settings = { ...defaults, ...options };
        this.rewards = rewards;
        
        // Create container
        this.container = this.scene.add.container(settings.x, settings.y);
        this.container.setDepth(1000);
        
        // Create background with glow
        this.createBackground(settings);
        
        // Create title
        this.createTitle(settings);
        
        // Create rewards display
        this.createRewardsDisplay(settings);
        
        // Create close button
        this.createCloseButton(settings);
        
        // Add entrance animation
        this.animateEntrance();
        
        // Auto-close if requested
        if (settings.autoClose) {
            this.scene.time.delayedCall(settings.closeDelay, () => {
                this.close(settings.onClose);
            });
        }
        
        return this.container;
    }
    
    /**
     * Create background with glow effect
     * @param {object} settings - Display settings
     */
    createBackground(settings) {
        // Create outer glow
        const glow = this.scene.add.rectangle(
            0, 0,
            settings.width + 20, settings.height + 20,
            0x3366cc, 0.3
        );
        
        // Create main background
        const bg = this.scene.add.rectangle(
            0, 0,
            settings.width, settings.height,
            0x000033, 0.9
        );
        bg.setStrokeStyle(2, 0x3366cc);
        
        // Create top accent bar
        const topBar = this.scene.add.rectangle(
            0, -settings.height/2 + 30,
            settings.width, 60,
            0x3366cc, 0.2
        );
        
        // Create bottom accent bar
        const bottomBar = this.scene.add.rectangle(
            0, settings.height/2 - 40,
            settings.width, 80,
            0x3366cc, 0.2
        );
        
        // Add to container
        this.container.add([glow, bg, topBar, bottomBar]);
        
        // Animate glow
        this.scene.tweens.add({
            targets: glow,
            alpha: { from: 0.3, to: 0.5 },
            scale: { from: 1, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Create title with effects
     * @param {object} settings - Display settings
     */
    createTitle(settings) {
        // Create title text
        const title = this.scene.add.text(
            0, -settings.height/2 + 30,
            settings.title,
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ffffff',
                align: 'center',
                stroke: '#3366cc',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create subtitle
        const subtitle = this.scene.add.text(
            0, -settings.height/2 + 60,
            'ADAPTIVE TECHNOLOGY SALVAGED',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#3366cc',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add to container
        this.container.add([title, subtitle]);
        
        // Add pulse effect to title
        this.scene.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Create rewards display
     * @param {object} settings - Display settings
     */
    createRewardsDisplay(settings) {
        // Create rewards container
        const rewardsContainer = this.scene.add.container(0, 0);
        this.container.add(rewardsContainer);
        
        // Calculate layout
        const startY = -settings.height/2 + 120;
        const itemHeight = 80;
        const padding = 10;
        
        // Create reward items
        this.rewards.forEach((reward, index) => {
            // Skip non-object rewards or rewards without IDs
            if (typeof reward !== 'object' || !reward.id) return;
            
            // Create reward item container
            const itemY = startY + (index * (itemHeight + padding));
            const itemContainer = this.createRewardItem(reward, 0, itemY, settings.width - 40);
            
            // Add to rewards container
            rewardsContainer.add(itemContainer);
            
            // Add entrance animation with delay based on index
            itemContainer.setAlpha(0);
            itemContainer.setScale(0.8);
            this.scene.tweens.add({
                targets: itemContainer,
                alpha: 1,
                scale: 1,
                duration: 500,
                delay: 200 + (index * 100),
                ease: 'Back.easeOut'
            });
        });
    }
    
    /**
     * Create a single reward item
     * @param {object} reward - Reward object
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Item width
     * @returns {Phaser.GameObjects.Container} The reward item container
     */
    createRewardItem(reward, x, y, width) {
        // Create item container
        const itemContainer = this.scene.add.container(x, y);
        
        // Create item background
        const itemBg = this.scene.add.rectangle(
            0, 0,
            width, 70,
            0x111144, 0.7
        );
        itemBg.setStrokeStyle(1, 0x3366cc);
        
        // Create reward icon
        const iconContainer = this.iconsManager.createRewardIcon(
            -width/2 + 40, 0,
            reward.id,
            { animate: true }
        );
        
        // Create reward name
        const nameText = this.scene.add.text(
            -width/2 + 90, -15,
            reward.name || 'Unknown Reward',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'left'
            }
        ).setOrigin(0, 0.5);
        
        // Create reward description
        const descText = this.scene.add.text(
            -width/2 + 90, 10,
            reward.description || '',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#aaaaaa',
                align: 'left',
                wordWrap: { width: width - 150 }
            }
        ).setOrigin(0, 0.5);
        
        // Create rarity indicator if available
        if (reward.rarity) {
            const rarityColors = {
                common: 0xaaaaaa,
                uncommon: 0x33cc33,
                rare: 0x3399ff,
                epic: 0xcc33ff,
                legendary: 0xff9900
            };
            
            const rarityColor = rarityColors[reward.rarity] || 0xaaaaaa;
            
            const rarityText = this.scene.add.text(
                width/2 - 20, -15,
                reward.rarity.toUpperCase(),
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: Phaser.Display.Color.RGBToString(
                        (rarityColor >> 16) & 0xff,
                        (rarityColor >> 8) & 0xff,
                        rarityColor & 0xff
                    ),
                    align: 'right'
                }
            ).setOrigin(1, 0.5);
            
            itemContainer.add(rarityText);
        }
        
        // Add hover effect
        itemBg.setInteractive();
        itemBg.on('pointerover', () => {
            itemBg.fillColor = 0x3366cc;
            itemBg.fillAlpha = 0.3;
        });
        
        itemBg.on('pointerout', () => {
            itemBg.fillColor = 0x111144;
            itemBg.fillAlpha = 0.7;
        });
        
        // Add to container
        itemContainer.add([itemBg, iconContainer, nameText, descText]);
        
        return itemContainer;
    }
    
    /**
     * Create close button
     * @param {object} settings - Display settings
     */
    createCloseButton(settings) {
        // Create button container
        const buttonContainer = this.scene.add.container(0, settings.height/2 - 40);
        this.container.add(buttonContainer);
        
        // Create button background
        const buttonBg = this.scene.add.rectangle(
            0, 0,
            200, 50,
            0x3366cc, 0.5
        );
        buttonBg.setStrokeStyle(2, 0x3366cc);
        
        // Create button text
        const buttonText = this.scene.add.text(
            0, 0,
            'CONTINUE',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add to container
        buttonContainer.add([buttonBg, buttonText]);
        
        // Add hover effect
        buttonBg.setInteractive();
        buttonBg.on('pointerover', () => {
            buttonBg.fillColor = 0x3366cc;
            buttonBg.fillAlpha = 0.8;
            buttonText.setStyle({ color: '#ffffff' });
        });
        
        buttonBg.on('pointerout', () => {
            buttonBg.fillColor = 0x3366cc;
            buttonBg.fillAlpha = 0.5;
            buttonText.setStyle({ color: '#ffffff' });
        });
        
        // Add click handler
        buttonBg.on('pointerdown', () => {
            this.close(settings.onClose);
        });
        
        // Add pulse effect
        this.scene.tweens.add({
            targets: buttonContainer,
            scale: { from: 1, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Animate entrance of the rewards display
     */
    animateEntrance() {
        // Set initial state
        this.container.setAlpha(0);
        this.container.setScale(0.8);
        
        // Animate entrance
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Add camera effects
        this.scene.cameras.main.flash(500, 0, 0, 0, 0.5);
    }
    
    /**
     * Close the rewards display
     * @param {function} callback - Callback to execute after closing
     */
    close(callback) {
        // Animate exit
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scale: 0.8,
            duration: 300,
            onComplete: () => {
                // Destroy container
                this.container.destroy();
                
                // Execute callback if provided
                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
        
        // Add camera effects
        this.scene.cameras.main.flash(300, 0, 0, 0, 0.3);
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisRewardDisplay = NemesisRewardDisplay;
}
