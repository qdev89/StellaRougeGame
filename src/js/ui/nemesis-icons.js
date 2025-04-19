/**
 * Nemesis Icons Manager
 * Handles the creation and management of icons for Nemesis rewards and UI elements
 */
class NemesisIcons {
    constructor(scene) {
        this.scene = scene;
        this.initialized = false;
        this.icons = {};
        
        // Initialize the icons
        this.initializeIcons();
    }
    
    /**
     * Initialize all Nemesis icons
     */
    initializeIcons() {
        if (this.initialized) return;
        
        // Create a texture atlas for the icons
        this.createIconAtlas();
        
        // Define icon mappings
        this.defineIconMappings();
        
        this.initialized = true;
    }
    
    /**
     * Create a texture atlas for Nemesis icons
     */
    createIconAtlas() {
        // Create a graphics object to draw our icons
        const graphics = this.scene.make.graphics();
        
        // Create base shapes for different icon types
        this.createBaseShapes(graphics);
        
        // Generate the texture atlas
        graphics.generateTexture('nemesis-icons', 512, 512);
        graphics.destroy();
    }
    
    /**
     * Create base shapes for different icon types
     * @param {Phaser.GameObjects.Graphics} graphics - The graphics object to draw on
     */
    createBaseShapes(graphics) {
        // Clear the graphics object
        graphics.clear();
        
        // Define colors
        const colors = {
            core: 0xff3333,       // Red
            weapon: 0x33ccff,     // Blue
            defensive: 0x33ff33,  // Green
            utility: 0xffcc33,    // Yellow
            balanced: 0xcc33ff,   // Purple
            legendary: 0xff9900   // Orange
        };
        
        // Define icon size
        const iconSize = 64;
        const halfSize = iconSize / 2;
        const quarterSize = iconSize / 4;
        const padding = 4;
        
        // Create Nemesis Core icon
        graphics.fillStyle(colors.core);
        graphics.fillCircle(halfSize, halfSize, halfSize - padding);
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeCircle(halfSize, halfSize, halfSize - padding);
        
        // Add inner details
        graphics.lineStyle(2, 0xffffff, 0.6);
        graphics.beginPath();
        graphics.moveTo(halfSize - quarterSize, halfSize - quarterSize);
        graphics.lineTo(halfSize + quarterSize, halfSize + quarterSize);
        graphics.moveTo(halfSize + quarterSize, halfSize - quarterSize);
        graphics.lineTo(halfSize - quarterSize, halfSize + quarterSize);
        graphics.closePath();
        graphics.strokePath();
        
        // Create Nemesis Weapon icon
        graphics.fillStyle(colors.weapon);
        graphics.fillRect(iconSize + padding, padding, iconSize - padding * 2, iconSize - padding * 2);
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeRect(iconSize + padding, padding, iconSize - padding * 2, iconSize - padding * 2);
        
        // Add inner details
        graphics.lineStyle(2, 0xffffff, 0.6);
        graphics.beginPath();
        graphics.moveTo(iconSize + halfSize, padding + quarterSize);
        graphics.lineTo(iconSize + halfSize, padding + iconSize - quarterSize);
        graphics.moveTo(iconSize + padding + quarterSize, halfSize);
        graphics.lineTo(iconSize + padding + iconSize - quarterSize, halfSize);
        graphics.closePath();
        graphics.strokePath();
        
        // Create Nemesis Defensive icon
        graphics.fillStyle(colors.defensive);
        graphics.fillRoundedRect(iconSize * 2 + padding, padding, iconSize - padding * 2, iconSize - padding * 2, 16);
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeRoundedRect(iconSize * 2 + padding, padding, iconSize - padding * 2, iconSize - padding * 2, 16);
        
        // Add inner details (shield shape)
        graphics.lineStyle(2, 0xffffff, 0.6);
        graphics.beginPath();
        graphics.moveTo(iconSize * 2 + halfSize, padding + quarterSize);
        graphics.lineTo(iconSize * 2 + padding + iconSize - quarterSize, halfSize);
        graphics.lineTo(iconSize * 2 + halfSize, padding + iconSize - quarterSize);
        graphics.lineTo(iconSize * 2 + padding + quarterSize, halfSize);
        graphics.closePath();
        graphics.strokePath();
        
        // Create Nemesis Utility icon
        graphics.fillStyle(colors.utility);
        graphics.fillTriangle(
            iconSize * 3 + halfSize, padding,
            iconSize * 3 + padding, padding + iconSize - padding,
            iconSize * 3 + iconSize - padding, padding + iconSize - padding
        );
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeTriangle(
            iconSize * 3 + halfSize, padding,
            iconSize * 3 + padding, padding + iconSize - padding,
            iconSize * 3 + iconSize - padding, padding + iconSize - padding
        );
        
        // Add inner details
        graphics.lineStyle(2, 0xffffff, 0.6);
        graphics.beginPath();
        graphics.moveTo(iconSize * 3 + halfSize, padding + quarterSize);
        graphics.lineTo(iconSize * 3 + halfSize, padding + iconSize - quarterSize);
        graphics.closePath();
        graphics.strokePath();
        
        // Create Nemesis Balanced icon
        graphics.fillStyle(colors.balanced);
        graphics.fillCircle(halfSize, iconSize + halfSize, halfSize - padding);
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeCircle(halfSize, iconSize + halfSize, halfSize - padding);
        
        // Add inner details (yin-yang style)
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(halfSize, iconSize + halfSize - quarterSize, quarterSize / 2);
        graphics.fillStyle(colors.balanced);
        graphics.fillCircle(halfSize, iconSize + halfSize + quarterSize, quarterSize / 2);
        
        // Create Nemesis Legendary icon
        graphics.fillStyle(colors.legendary);
        graphics.fillStar(
            iconSize + halfSize, iconSize + halfSize,
            5, halfSize - padding, halfSize / 2
        );
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeStar(
            iconSize + halfSize, iconSize + halfSize,
            5, halfSize - padding, halfSize / 2
        );
        
        // Add inner details
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(iconSize + halfSize, iconSize + halfSize, quarterSize / 2);
        
        // Create Nemesis Adaptive icon
        graphics.fillStyle(0x33ccff);
        graphics.fillCircle(iconSize * 2 + halfSize, iconSize + halfSize, halfSize - padding);
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeCircle(iconSize * 2 + halfSize, iconSize + halfSize, halfSize - padding);
        
        // Add inner details (spiral pattern)
        graphics.lineStyle(2, 0xffffff, 0.6);
        graphics.beginPath();
        for (let i = 0; i < 360; i += 30) {
            const angle = Phaser.Math.DegToRad(i);
            const radius = (i / 360) * (halfSize - padding);
            const x = iconSize * 2 + halfSize + Math.cos(angle) * radius;
            const y = iconSize + halfSize + Math.sin(angle) * radius;
            
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        graphics.closePath();
        graphics.strokePath();
        
        // Create Nemesis Phase Shift icon
        graphics.fillStyle(0x9933cc);
        graphics.fillCircle(iconSize * 3 + halfSize, iconSize + halfSize, halfSize - padding);
        graphics.lineStyle(3, 0xffffff, 0.8);
        graphics.strokeCircle(iconSize * 3 + halfSize, iconSize + halfSize, halfSize - padding);
        
        // Add inner details (phase shift effect)
        graphics.lineStyle(2, 0xffffff, 0.6);
        graphics.beginPath();
        for (let i = 0; i < 3; i++) {
            const offset = i * 5;
            graphics.strokeCircle(iconSize * 3 + halfSize + offset, iconSize + halfSize, quarterSize);
            graphics.strokeCircle(iconSize * 3 + halfSize - offset, iconSize + halfSize, quarterSize);
        }
        graphics.closePath();
    }
    
    /**
     * Define mappings between reward IDs and icon frames
     */
    defineIconMappings() {
        // Map reward IDs to icon frames
        this.icons = {
            // Core rewards
            'nemesis_core': { x: 0, y: 0, width: 64, height: 64 },
            
            // Weapon rewards
            'nemesis_laser': { x: 64, y: 0, width: 64, height: 64 },
            'nemesis_tri_beam': { x: 64, y: 0, width: 64, height: 64 },
            'nemesis_plasma': { x: 64, y: 0, width: 64, height: 64 },
            'nemesis_missiles': { x: 64, y: 0, width: 64, height: 64 },
            'nemesis_cannon': { x: 64, y: 0, width: 64, height: 64 },
            'nemesis_beam': { x: 64, y: 0, width: 64, height: 64 },
            'nemesis_bombs': { x: 64, y: 0, width: 64, height: 64 },
            'nemesis_weapon': { x: 64, y: 0, width: 64, height: 64 },
            
            // Defensive rewards
            'adaptive_shields': { x: 128, y: 0, width: 64, height: 64 },
            'nemesis_defensive': { x: 128, y: 0, width: 64, height: 64 },
            
            // Utility rewards
            'nemesis_utility': { x: 192, y: 0, width: 64, height: 64 },
            
            // Balanced rewards
            'nemesis_balanced': { x: 0, y: 64, width: 64, height: 64 },
            
            // Legendary rewards
            'nemesis_mastery': { x: 64, y: 64, width: 64, height: 64 },
            
            // Special rewards
            'adaptive_shields': { x: 128, y: 64, width: 64, height: 64 },
            'phase_shift_drive': { x: 192, y: 64, width: 64, height: 64 },
            
            // Default icon for unknown rewards
            'default': { x: 0, y: 0, width: 64, height: 64 }
        };
    }
    
    /**
     * Get the icon frame for a specific reward ID
     * @param {string} rewardId - The ID of the reward
     * @returns {object} The icon frame data
     */
    getIconFrame(rewardId) {
        return this.icons[rewardId] || this.icons['default'];
    }
    
    /**
     * Create an icon sprite for a reward
     * @param {number} x - The x position
     * @param {number} y - The y position
     * @param {string} rewardId - The ID of the reward
     * @returns {Phaser.GameObjects.Sprite} The icon sprite
     */
    createIcon(x, y, rewardId) {
        const frame = this.getIconFrame(rewardId);
        
        // Create a sprite using the atlas
        const sprite = this.scene.add.sprite(x, y, 'nemesis-icons');
        
        // Set the frame based on the icon mapping
        sprite.setFrame(frame);
        
        return sprite;
    }
    
    /**
     * Create a reward icon with glow effect
     * @param {number} x - The x position
     * @param {number} y - The y position
     * @param {string} rewardId - The ID of the reward
     * @param {object} options - Additional options
     * @returns {Phaser.GameObjects.Container} Container with the icon and effects
     */
    createRewardIcon(x, y, rewardId, options = {}) {
        // Create a container for the icon and effects
        const container = this.scene.add.container(x, y);
        
        // Get the frame data
        const frame = this.getIconFrame(rewardId);
        
        // Create a glow effect
        const glow = this.scene.add.sprite(0, 0, 'nemesis-icons');
        glow.setFrame(frame);
        glow.setTint(0xffffff);
        glow.setAlpha(0.5);
        glow.setScale(1.2);
        
        // Create the main icon
        const icon = this.scene.add.sprite(0, 0, 'nemesis-icons');
        icon.setFrame(frame);
        
        // Add to container
        container.add([glow, icon]);
        
        // Add animation if requested
        if (options.animate) {
            this.scene.tweens.add({
                targets: glow,
                alpha: { from: 0.5, to: 0.2 },
                scale: { from: 1.2, to: 1.4 },
                duration: 1500,
                yoyo: true,
                repeat: -1
            });
            
            this.scene.tweens.add({
                targets: icon,
                angle: { from: -5, to: 5 },
                duration: 2000,
                yoyo: true,
                repeat: -1
            });
        }
        
        return container;
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisIcons = NemesisIcons;
}
