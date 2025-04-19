/**
 * Nemesis Attack Telegraph
 * Creates visual cues to telegraph upcoming Nemesis attacks
 */
class NemesisAttackTelegraph {
    constructor(scene) {
        this.scene = scene;
        this.telegraphs = [];
        
        // Telegraph styles for different attack types
        this.telegraphStyles = {
            adaptive: {
                color: 0x33ccff,
                text: 'ADAPTIVE ATTACK',
                icon: 'adaptive',
                duration: 1000
            },
            phaseShift: {
                color: 0x9933cc,
                text: 'PHASE SHIFT',
                icon: 'phase-shift',
                duration: 1000
            },
            beam: {
                color: 0xff3333,
                text: 'CHARGING BEAM',
                icon: 'beam',
                duration: 1500
            },
            shield: {
                color: 0x33ff33,
                text: 'SHIELD ACTIVATION',
                icon: 'shield',
                duration: 1000
            },
            drones: {
                color: 0xff9933,
                text: 'DEPLOYING DRONES',
                icon: 'drones',
                duration: 1000
            },
            mines: {
                color: 0xffcc33,
                text: 'DEPLOYING MINES',
                icon: 'mines',
                duration: 1000
            },
            artillery: {
                color: 0xff3333,
                text: 'ARTILLERY STRIKE',
                icon: 'artillery',
                duration: 1500
            },
            spread: {
                color: 0x33ccff,
                text: 'SPREAD ATTACK',
                icon: 'spread',
                duration: 800
            },
            cloak: {
                color: 0x9933cc,
                text: 'CLOAKING',
                icon: 'cloak',
                duration: 1000
            },
            bombs: {
                color: 0xff6633,
                text: 'DROPPING BOMBS',
                icon: 'bombs',
                duration: 1500
            }
        };
    }
    
    /**
     * Show telegraph for an upcoming attack
     * @param {string} attackType - Type of attack
     * @param {Phaser.GameObjects.Sprite} source - Source of the attack
     * @param {object} options - Additional options
     */
    showTelegraph(attackType, source, options = {}) {
        // Get telegraph style
        const style = this.telegraphStyles[attackType];
        if (!style) return;
        
        // Merge options with style
        const config = {
            ...style,
            ...options
        };
        
        // Create telegraph based on attack type
        switch (attackType) {
            case 'beam':
                this.createBeamTelegraph(source, config);
                break;
            case 'mines':
            case 'bombs':
                this.createAreaTelegraph(source, config);
                break;
            case 'artillery':
                this.createTargetTelegraph(source, config);
                break;
            case 'phaseShift':
                this.createPhaseShiftTelegraph(source, config);
                break;
            default:
                this.createStandardTelegraph(source, config);
                break;
        }
        
        // Play sound if available
        if (source.soundManager) {
            source.soundManager.playAttackSound(attackType);
        }
    }
    
    /**
     * Create a standard telegraph for most attacks
     * @param {Phaser.GameObjects.Sprite} source - Source of the attack
     * @param {object} config - Telegraph configuration
     */
    createStandardTelegraph(source, config) {
        // Create container
        const container = this.scene.add.container(source.x, source.y - 50);
        container.setDepth(1000);
        
        // Create background
        const bg = this.scene.add.rectangle(
            0, 0,
            200, 40,
            config.color,
            0.7
        );
        bg.setStrokeStyle(2, 0xffffff, 0.5);
        
        // Create text
        const text = this.scene.add.text(
            0, 0,
            config.text,
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
        
        // Add icon if available
        if (config.icon && this.scene.iconsManager) {
            const icon = this.scene.iconsManager.createIcon(-80, 0, config.icon);
            icon.setScale(0.5);
            container.add(icon);
        }
        
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
        
        // Add to telegraphs array
        this.telegraphs.push(container);
        
        // Destroy after duration
        this.scene.time.delayedCall(config.duration, () => {
            // Remove from array
            const index = this.telegraphs.indexOf(container);
            if (index !== -1) {
                this.telegraphs.splice(index, 1);
            }
            
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
     * Create a beam telegraph
     * @param {Phaser.GameObjects.Sprite} source - Source of the attack
     * @param {object} config - Telegraph configuration
     */
    createBeamTelegraph(source, config) {
        // Create standard telegraph
        this.createStandardTelegraph(source, config);
        
        // Get player reference
        const player = this.scene.player;
        if (!player) return;
        
        // Calculate direction to player
        const angle = Phaser.Math.Angle.Between(
            source.x, source.y,
            player.x, player.y
        );
        
        // Create beam preview
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(20, config.color, 0.3);
        graphics.beginPath();
        
        // Calculate beam length
        const beamLength = 1000;
        const endX = source.x + Math.cos(angle) * beamLength;
        const endY = source.y + Math.sin(angle) * beamLength;
        
        // Draw beam
        graphics.moveTo(source.x, source.y);
        graphics.lineTo(endX, endY);
        graphics.strokePath();
        
        // Add pulsing effect
        this.scene.tweens.add({
            targets: graphics,
            alpha: { from: 0.3, to: 0.6 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });
        
        // Destroy after duration
        this.scene.time.delayedCall(config.duration, () => {
            // Fade out
            this.scene.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    graphics.destroy();
                }
            });
        });
    }
    
    /**
     * Create an area telegraph for mines or bombs
     * @param {Phaser.GameObjects.Sprite} source - Source of the attack
     * @param {object} config - Telegraph configuration
     */
    createAreaTelegraph(source, config) {
        // Create standard telegraph
        this.createStandardTelegraph(source, config);
        
        // Create area indicators
        const areaCount = config.areaCount || 5;
        const areaRadius = config.areaRadius || 100;
        
        for (let i = 0; i < areaCount; i++) {
            // Calculate position
            const angle = Phaser.Math.DegToRad(i * (360 / areaCount));
            const distance = Phaser.Math.Between(50, 200);
            const x = source.x + Math.cos(angle) * distance;
            const y = source.y + Math.sin(angle) * distance;
            
            // Create area indicator
            const area = this.scene.add.circle(x, y, areaRadius, config.color, 0.2);
            area.setStrokeStyle(2, config.color, 0.5);
            
            // Add pulsing effect
            this.scene.tweens.add({
                targets: area,
                alpha: { from: 0.2, to: 0.4 },
                scale: { from: 0.8, to: 1.2 },
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            // Destroy after duration
            this.scene.time.delayedCall(config.duration, () => {
                // Fade out
                this.scene.tweens.add({
                    targets: area,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        area.destroy();
                    }
                });
            });
        }
    }
    
    /**
     * Create a target telegraph for artillery
     * @param {Phaser.GameObjects.Sprite} source - Source of the attack
     * @param {object} config - Telegraph configuration
     */
    createTargetTelegraph(source, config) {
        // Create standard telegraph
        this.createStandardTelegraph(source, config);
        
        // Get player reference
        const player = this.scene.player;
        if (!player) return;
        
        // Calculate target position (lead the player)
        const playerVelocity = player.body.velocity;
        const leadFactor = 0.5; // How much to lead the player
        const targetX = player.x + playerVelocity.x * leadFactor;
        const targetY = player.y + playerVelocity.y * leadFactor;
        
        // Create target indicator
        const target = this.scene.add.circle(targetX, targetY, 60, config.color, 0.3);
        target.setStrokeStyle(2, config.color, 0.6);
        
        // Create crosshair
        const crosshair = this.scene.add.graphics();
        crosshair.lineStyle(2, config.color, 0.8);
        
        // Draw crosshair
        crosshair.beginPath();
        crosshair.moveTo(targetX - 30, targetY);
        crosshair.lineTo(targetX + 30, targetY);
        crosshair.moveTo(targetX, targetY - 30);
        crosshair.lineTo(targetX, targetY + 30);
        crosshair.strokePath();
        
        // Add pulsing effect
        this.scene.tweens.add({
            targets: [target, crosshair],
            alpha: { from: 0.6, to: 0.9 },
            scale: { from: 0.9, to: 1.1 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });
        
        // Destroy after duration
        this.scene.time.delayedCall(config.duration, () => {
            // Fade out
            this.scene.tweens.add({
                targets: [target, crosshair],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    target.destroy();
                    crosshair.destroy();
                }
            });
        });
    }
    
    /**
     * Create a phase shift telegraph
     * @param {Phaser.GameObjects.Sprite} source - Source of the attack
     * @param {object} config - Telegraph configuration
     */
    createPhaseShiftTelegraph(source, config) {
        // Create standard telegraph
        this.createStandardTelegraph(source, config);
        
        // Create phase shift effect
        const phaseEffect = this.scene.add.graphics();
        phaseEffect.fillStyle(config.color, 0.3);
        phaseEffect.fillCircle(source.x, source.y, source.width);
        
        // Create ghost images
        const ghostCount = 3;
        const ghosts = [];
        
        for (let i = 0; i < ghostCount; i++) {
            // Calculate position
            const angle = Phaser.Math.DegToRad(i * (360 / ghostCount));
            const distance = 100;
            const x = source.x + Math.cos(angle) * distance;
            const y = source.y + Math.sin(angle) * distance;
            
            // Create ghost
            const ghost = this.scene.add.sprite(x, y, source.texture.key);
            ghost.setScale(source.scaleX, source.scaleY);
            ghost.setAlpha(0.3);
            ghost.setTint(config.color);
            
            // Add to array
            ghosts.push(ghost);
        }
        
        // Animate ghosts
        this.scene.tweens.add({
            targets: ghosts,
            alpha: { from: 0.3, to: 0 },
            scale: { from: 0.8, to: 1.2 },
            duration: 500,
            repeat: Math.floor(config.duration / 500) - 1
        });
        
        // Destroy after duration
        this.scene.time.delayedCall(config.duration, () => {
            // Fade out phase effect
            this.scene.tweens.add({
                targets: phaseEffect,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    phaseEffect.destroy();
                }
            });
            
            // Destroy ghosts
            ghosts.forEach(ghost => {
                ghost.destroy();
            });
        });
    }
    
    /**
     * Update all telegraphs
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update position of telegraphs to follow their sources
        this.telegraphs.forEach(telegraph => {
            if (telegraph.source && telegraph.source.active) {
                telegraph.x = telegraph.source.x;
                telegraph.y = telegraph.source.y - 50;
            }
        });
    }
    
    /**
     * Clean up all telegraphs
     */
    destroy() {
        // Destroy all telegraphs
        this.telegraphs.forEach(telegraph => {
            telegraph.destroy();
        });
        
        // Clear array
        this.telegraphs = [];
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisAttackTelegraph = NemesisAttackTelegraph;
}
