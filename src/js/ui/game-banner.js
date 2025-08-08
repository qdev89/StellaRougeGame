/**
 * Game Banner
 * Creates a stylized banner overlay for the game title
 */
class GameBanner {
    /**
     * Create a new game banner
     * @param {Phaser.Scene} scene - The scene to add the banner to
     * @param {number} x - The x position of the banner
     * @param {number} y - The y position of the banner
     * @param {Object} options - Additional options
     */
    constructor(scene, x, y, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.options = Object.assign({
            width: 500,
            height: 120,
            title: 'STELLA ROUGE',
            subtitle: 'SPACE ADVENTURE',
            titleColor: '#33aaff',
            subtitleColor: '#ffffff',
            backgroundColor: 0x000033,
            borderColor: 0x3366cc,
            glow: true,
            animate: true
        }, options);
        
        // Create the banner
        this.container = this.scene.add.container(this.x, this.y);
        this.create();
    }
    
    /**
     * Create the banner elements
     */
    create() {
        // Create background with gradient
        const bg = this.scene.add.graphics();
        bg.fillGradientStyle(
            this.options.backgroundColor, 
            this.options.backgroundColor, 
            Phaser.Display.Color.ValueToColor(this.options.backgroundColor).darken(20).color, 
            Phaser.Display.Color.ValueToColor(this.options.backgroundColor).darken(20).color, 
            0.9
        );
        
        // Create a stylized shape for the banner
        const width = this.options.width;
        const height = this.options.height;
        
        // Draw the main banner shape
        bg.fillRoundedRect(-width/2, -height/2, width, height, 10);
        
        // Add decorative elements
        bg.fillStyle(this.options.borderColor, 0.7);
        
        // Left accent
        bg.fillRoundedRect(-width/2 - 10, -height/2 + 20, 10, height - 40, { tl: 5, bl: 5, tr: 0, br: 0 });
        
        // Right accent
        bg.fillRoundedRect(width/2, -height/2 + 20, 10, height - 40, { tl: 0, bl: 0, tr: 5, br: 5 });
        
        // Top accent line
        bg.fillRect(-width/2 + 20, -height/2 - 5, width - 40, 5);
        
        // Bottom accent line
        bg.fillRect(-width/2 + 20, height/2, width - 40, 5);
        
        // Add to container
        this.container.add(bg);
        
        // Create title text with enhanced styling
        const titleText = this.scene.add.text(0, -20, this.options.title, {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: this.options.titleColor,
            align: 'center',
            stroke: '#000033',
            strokeThickness: 8,
            shadow: { offsetX: 2, offsetY: 2, color: '#0066cc', blur: 10, stroke: true }
        }).setOrigin(0.5);
        
        // Add to container
        this.container.add(titleText);
        
        // Create subtitle text
        const subtitleText = this.scene.add.text(0, 20, this.options.subtitle, {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: this.options.subtitleColor,
            align: 'center',
            stroke: '#000033',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Add to container
        this.container.add(subtitleText);
        
        // Add glow effect
        if (this.options.glow) {
            // Create glow graphics
            const glow = this.scene.add.graphics();
            glow.fillStyle(this.options.borderColor, 0.2);
            glow.fillRoundedRect(-width/2 - 20, -height/2 - 20, width + 40, height + 40, 20);
            
            // Add to container behind other elements
            this.container.add(glow);
            this.container.sendToBack(glow);
            
            // Animate glow
            if (this.options.animate) {
                this.scene.tweens.add({
                    targets: glow,
                    alpha: { from: 0.2, to: 0.4 },
                    duration: 1500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
        
        // Add animation
        if (this.options.animate) {
            // Subtle floating animation
            this.scene.tweens.add({
                targets: this.container,
                y: this.y - 5,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Title text pulsing
            this.scene.tweens.add({
                targets: titleText,
                scale: { from: 1, to: 1.05 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Add stars around the banner
        this.addStars();
    }
    
    /**
     * Add decorative stars around the banner
     */
    addStars() {
        const width = this.options.width;
        const height = this.options.height;
        
        // Create stars
        for (let i = 0; i < 20; i++) {
            // Random position around the banner
            const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
            const distance = Phaser.Math.Between(width/2 + 10, width/2 + 50);
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // Create star
            const size = Phaser.Math.FloatBetween(1, 3);
            const star = this.scene.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.8));
            
            // Add to container
            this.container.add(star);
            
            // Add twinkling animation
            if (this.options.animate) {
                this.scene.tweens.add({
                    targets: star,
                    alpha: { from: star.alpha, to: 0.2 },
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }
    
    /**
     * Set the visibility of the banner
     * @param {boolean} visible - Whether the banner should be visible
     */
    setVisible(visible) {
        this.container.setVisible(visible);
    }
    
    /**
     * Set the alpha of the banner
     * @param {number} alpha - The alpha value (0-1)
     */
    setAlpha(alpha) {
        this.container.setAlpha(alpha);
    }
    
    /**
     * Destroy the banner
     */
    destroy() {
        this.container.destroy();
    }
}
