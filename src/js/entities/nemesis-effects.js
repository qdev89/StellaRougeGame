/**
 * Nemesis Visual Effects
 * Handles the creation and management of visual effects for the Nemesis boss
 */
class NemesisEffects {
    constructor(scene, nemesis) {
        this.scene = scene;
        this.nemesis = nemesis;
        this.effects = [];
        
        // Base colors for different boss types
        this.bossColors = {
            SCOUT_COMMANDER: 0x33ff33,    // Green
            BATTLE_CARRIER: 0xffcc33,     // Yellow
            DESTROYER_PRIME: 0xff3333,    // Red
            STEALTH_OVERLORD: 0xcc33ff,   // Purple
            DREADNOUGHT: 0xffffff,        // White
            BOMBER_TITAN: 0xff9933,       // Orange
            NEMESIS: 0x3366cc             // Blue
        };
        
        // Initialize effects container
        this.container = this.scene.add.container(nemesis.x, nemesis.y);
        
        // Create base effects
        this.createBaseEffects();
    }
    
    /**
     * Create base visual effects for the Nemesis
     */
    createBaseEffects() {
        // Create core
        this.core = this.scene.add.graphics();
        this.core.fillStyle(0xffffff, 0.8);
        this.core.fillCircle(0, 0, 20);
        
        // Create inner aura
        this.innerAura = this.scene.add.graphics();
        this.innerAura.fillStyle(this.nemesis.appearance.baseColor || this.bossColors.NEMESIS, 0.5);
        this.innerAura.fillCircle(0, 0, 50);
        
        // Create outer aura
        this.outerAura = this.scene.add.graphics();
        this.outerAura.fillStyle(this.nemesis.appearance.baseColor || this.bossColors.NEMESIS, 0.3);
        this.outerAura.fillCircle(0, 0, 80);
        
        // Add to container
        this.container.add([this.outerAura, this.innerAura, this.core]);
        
        // Add pulsing effect to auras
        this.scene.tweens.add({
            targets: this.innerAura,
            alpha: { from: 0.5, to: 0.7 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });
        
        this.scene.tweens.add({
            targets: this.outerAura,
            alpha: { from: 0.3, to: 0.5 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
        
        // Add rotating effect to core
        this.scene.tweens.add({
            targets: this.core,
            angle: { from: 0, to: 360 },
            duration: 3000,
            repeat: -1
        });
        
        // Create adaptive parts based on appearance
        this.createAdaptiveParts();
    }
    
    /**
     * Create adaptive parts based on the Nemesis appearance
     */
    createAdaptiveParts() {
        // Clear any existing adaptive parts
        if (this.adaptiveParts) {
            this.adaptiveParts.forEach(part => part.destroy());
        }
        
        this.adaptiveParts = [];
        
        // Create parts based on defeated bosses
        if (this.nemesis.appearance && this.nemesis.appearance.parts) {
            this.nemesis.appearance.parts.forEach((part, index) => {
                this.createPartEffect(part, index);
            });
        }
        
        // Create highlight rings based on highlight colors
        if (this.nemesis.appearance && this.nemesis.appearance.highlights) {
            this.nemesis.appearance.highlights.forEach((color, index) => {
                this.createHighlightRing(color, index);
            });
        }
    }
    
    /**
     * Create a part effect based on the part type
     */
    createPartEffect(partType, index) {
        let part;
        const angle = (index % 6) * (Math.PI / 3);
        const distance = 60;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        switch (partType) {
            case 'shield_generators':
                part = this.createShieldGenerator(x, y);
                break;
            case 'drone_bays':
                part = this.createDroneBay(x, y);
                break;
            case 'artillery_cannons':
                part = this.createArtilleryCannon(x, y, angle);
                break;
            case 'cloaking_device':
                part = this.createCloakingDevice();
                break;
            case 'heavy_armor':
                part = this.createHeavyArmor();
                break;
            case 'bomb_launchers':
                part = this.createBombLauncher(x, y);
                break;
            default:
                return;
        }
        
        if (part) {
            this.container.add(part);
            this.adaptiveParts.push(part);
        }
    }
    
    /**
     * Create a shield generator effect
     */
    createShieldGenerator(x, y) {
        const generator = this.scene.add.graphics();
        generator.fillStyle(this.bossColors.SCOUT_COMMANDER, 0.8);
        generator.fillCircle(x, y, 10);
        
        // Add shield effect
        const shield = this.scene.add.graphics();
        shield.lineStyle(2, this.bossColors.SCOUT_COMMANDER, 0.5);
        shield.strokeCircle(x, y, 15);
        
        // Add pulsing effect
        this.scene.tweens.add({
            targets: shield,
            scaleX: { from: 1, to: 1.5 },
            scaleY: { from: 1, to: 1.5 },
            alpha: { from: 0.5, to: 0 },
            duration: 1000,
            repeat: -1
        });
        
        this.container.add(shield);
        this.adaptiveParts.push(shield);
        
        return generator;
    }
    
    /**
     * Create a drone bay effect
     */
    createDroneBay(x, y) {
        const droneBay = this.scene.add.graphics();
        droneBay.fillStyle(this.bossColors.BATTLE_CARRIER, 0.8);
        droneBay.fillRect(x - 15, y - 10, 30, 20);
        
        // Add occasional drone launch effect
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(5000, 10000),
            callback: () => {
                this.createDroneLaunchEffect(x, y);
            },
            callbackScope: this,
            loop: true
        });
        
        return droneBay;
    }
    
    /**
     * Create a drone launch effect
     */
    createDroneLaunchEffect(x, y) {
        if (!this.nemesis.active) return;
        
        const drone = this.scene.add.graphics();
        drone.fillStyle(this.bossColors.BATTLE_CARRIER, 0.8);
        drone.fillCircle(0, 0, 5);
        drone.x = x;
        drone.y = y;
        
        this.container.add(drone);
        
        // Animate drone
        this.scene.tweens.add({
            targets: drone,
            x: x + Phaser.Math.Between(-100, 100),
            y: y + Phaser.Math.Between(-100, 100),
            alpha: { from: 1, to: 0 },
            duration: 2000,
            onComplete: () => {
                drone.destroy();
            }
        });
    }
    
    /**
     * Create an artillery cannon effect
     */
    createArtilleryCannon(x, y, angle) {
        const cannon = this.scene.add.graphics();
        cannon.fillStyle(this.bossColors.DESTROYER_PRIME, 0.8);
        cannon.fillRect(-5, -20, 10, 40);
        cannon.x = x;
        cannon.y = y;
        cannon.rotation = angle;
        
        // Add occasional firing effect
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(4000, 8000),
            callback: () => {
                this.createCannonFireEffect(x, y, angle);
            },
            callbackScope: this,
            loop: true
        });
        
        return cannon;
    }
    
    /**
     * Create a cannon fire effect
     */
    createCannonFireEffect(x, y, angle) {
        if (!this.nemesis.active) return;
        
        const flash = this.scene.add.graphics();
        flash.fillStyle(this.bossColors.DESTROYER_PRIME, 1);
        flash.fillCircle(0, 0, 8);
        flash.x = x + Math.cos(angle) * 25;
        flash.y = y + Math.sin(angle) * 25;
        
        this.container.add(flash);
        
        // Animate flash
        this.scene.tweens.add({
            targets: flash,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 2 },
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    /**
     * Create a cloaking device effect
     */
    createCloakingDevice() {
        const cloakEffect = this.scene.add.graphics();
        cloakEffect.fillStyle(this.bossColors.STEALTH_OVERLORD, 0.2);
        cloakEffect.fillCircle(0, 0, 90);
        
        // Add flickering effect
        this.scene.tweens.add({
            targets: cloakEffect,
            alpha: { from: 0.2, to: 0.1 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Add occasional stealth effect
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(10000, 15000),
            callback: () => {
                this.createStealthEffect();
            },
            callbackScope: this,
            loop: true
        });
        
        return cloakEffect;
    }
    
    /**
     * Create a stealth effect
     */
    createStealthEffect() {
        if (!this.nemesis.active) return;
        
        // Make the nemesis semi-transparent
        this.scene.tweens.add({
            targets: this.container,
            alpha: { from: 1, to: 0.3 },
            duration: 1000,
            yoyo: true,
            hold: 2000,
            onComplete: () => {
                this.container.alpha = 1;
            }
        });
    }
    
    /**
     * Create a heavy armor effect
     */
    createHeavyArmor() {
        const armor = this.scene.add.graphics();
        armor.fillStyle(0x666666, 0.6);
        armor.fillRect(-40, -40, 80, 80);
        
        // Add inner highlight
        const highlight = this.scene.add.graphics();
        highlight.lineStyle(2, this.bossColors.DREADNOUGHT, 0.5);
        highlight.strokeRect(-35, -35, 70, 70);
        
        this.container.add(highlight);
        this.adaptiveParts.push(highlight);
        
        return armor;
    }
    
    /**
     * Create a bomb launcher effect
     */
    createBombLauncher(x, y) {
        const launcher = this.scene.add.graphics();
        launcher.fillStyle(this.bossColors.BOMBER_TITAN, 0.8);
        launcher.fillCircle(x, y, 15);
        
        // Add occasional bomb launch effect
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(6000, 12000),
            callback: () => {
                this.createBombEffect(x, y);
            },
            callbackScope: this,
            loop: true
        });
        
        return launcher;
    }
    
    /**
     * Create a bomb effect
     */
    createBombEffect(x, y) {
        if (!this.nemesis.active) return;
        
        const bomb = this.scene.add.graphics();
        bomb.fillStyle(this.bossColors.BOMBER_TITAN, 0.8);
        bomb.fillCircle(0, 0, 10);
        bomb.x = x;
        bomb.y = y;
        
        this.container.add(bomb);
        
        // Animate bomb
        this.scene.tweens.add({
            targets: bomb,
            x: x + Phaser.Math.Between(-50, 50),
            y: y + Phaser.Math.Between(50, 100),
            duration: 1500,
            onComplete: () => {
                // Create explosion
                const explosion = this.scene.add.graphics();
                explosion.fillStyle(this.bossColors.BOMBER_TITAN, 0.6);
                explosion.fillCircle(bomb.x, bomb.y, 20);
                this.container.add(explosion);
                
                // Animate explosion
                this.scene.tweens.add({
                    targets: explosion,
                    alpha: { from: 0.6, to: 0 },
                    scale: { from: 1, to: 3 },
                    duration: 500,
                    onComplete: () => {
                        explosion.destroy();
                    }
                });
                
                bomb.destroy();
            }
        });
    }
    
    /**
     * Create a highlight ring
     */
    createHighlightRing(color, index) {
        const hexColor = typeof color === 'string' ? parseInt(color.replace('#', '0x')) : color;
        const radius = 70 - (index * 5);
        
        const ring = this.scene.add.graphics();
        ring.lineStyle(2, hexColor, 0.6);
        ring.strokeCircle(0, 0, radius);
        
        // Add rotation effect
        this.scene.tweens.add({
            targets: ring,
            angle: { from: 0, to: 360 },
            duration: 10000 + (index * 2000),
            repeat: -1
        });
        
        this.container.add(ring);
        this.adaptiveParts.push(ring);
    }
    
    /**
     * Show adaptation effect when the Nemesis adapts to a weapon
     */
    showAdaptationEffect(weaponType) {
        // Create flash effect
        const flash = this.scene.add.graphics();
        flash.fillStyle(0xffffff, 0.5);
        flash.fillCircle(0, 0, 100);
        this.container.add(flash);
        
        // Animate flash
        this.scene.tweens.add({
            targets: flash,
            alpha: { from: 0.5, to: 0 },
            scale: { from: 1, to: 2 },
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Create text effect
        let color;
        switch (weaponType) {
            case 'laser':
                color = 0x33ccff;
                break;
            case 'triBeam':
                color = 0x33ff33;
                break;
            case 'plasmaBolt':
                color = 0xff33ff;
                break;
            case 'homingMissile':
                color = 0xff9933;
                break;
            case 'dualCannon':
                color = 0xffff33;
                break;
            case 'beamLaser':
                color = 0xff3333;
                break;
            case 'scatterBomb':
                color = 0xff6633;
                break;
            default:
                color = 0xffffff;
        }
        
        const text = this.scene.add.text(0, -80, `ADAPTING TO ${weaponType.toUpperCase()}`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: `#${color.toString(16).padStart(6, '0')}`,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.container.add(text);
        
        // Animate text
        this.scene.tweens.add({
            targets: text,
            y: -120,
            alpha: { from: 1, to: 0 },
            duration: 1500,
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    /**
     * Show morphing effect when the Nemesis morphs to a different boss form
     */
    showMorphEffect(bossType) {
        // Create flash effect
        const flash = this.scene.add.graphics();
        flash.fillStyle(this.bossColors[bossType] || 0xffffff, 0.7);
        flash.fillCircle(0, 0, 120);
        this.container.add(flash);
        
        // Animate flash
        this.scene.tweens.add({
            targets: flash,
            alpha: { from: 0.7, to: 0 },
            scale: { from: 1, to: 2 },
            duration: 800,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Create text effect
        let bossName;
        switch (bossType) {
            case 'SCOUT_COMMANDER':
                bossName = "THE GUARDIAN";
                break;
            case 'BATTLE_CARRIER':
                bossName = "THE CARRIER";
                break;
            case 'DESTROYER_PRIME':
                bossName = "DESTROYER PRIME";
                break;
            case 'STEALTH_OVERLORD':
                bossName = "STEALTH OVERLORD";
                break;
            case 'DREADNOUGHT':
                bossName = "THE DREADNOUGHT";
                break;
            case 'BOMBER_TITAN':
                bossName = "BOMBER TITAN";
                break;
            case 'NEMESIS':
                bossName = "THE NEMESIS";
                break;
            default:
                bossName = "UNKNOWN ENTITY";
        }
        
        const text = this.scene.add.text(0, -100, `MORPHING: ${bossName}`, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: `#${this.bossColors[bossType].toString(16).padStart(6, '0')}`,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.container.add(text);
        
        // Animate text
        this.scene.tweens.add({
            targets: text,
            y: -150,
            alpha: { from: 1, to: 0 },
            duration: 2000,
            onComplete: () => {
                text.destroy();
            }
        });
        
        // Change core color
        this.scene.tweens.add({
            targets: this.core,
            fillColor: this.bossColors[bossType],
            duration: 1000
        });
        
        // Change aura colors
        this.scene.tweens.add({
            targets: [this.innerAura, this.outerAura],
            fillColor: this.bossColors[bossType],
            duration: 1000
        });
    }
    
    /**
     * Show phase transition effect
     */
    showPhaseTransitionEffect(phaseIndex) {
        // Create expanding rings
        for (let i = 0; i < 3; i++) {
            const ring = this.scene.add.graphics();
            ring.lineStyle(3, 0xffffff, 0.8);
            ring.strokeCircle(0, 0, 50);
            ring.alpha = 0.8;
            ring.scale = 0.5;
            
            this.container.add(ring);
            
            // Animate ring
            this.scene.tweens.add({
                targets: ring,
                scale: { from: 0.5, to: 3 },
                alpha: { from: 0.8, to: 0 },
                duration: 1000,
                delay: i * 300,
                onComplete: () => {
                    ring.destroy();
                }
            });
        }
        
        // Create text effect
        const text = this.scene.add.text(0, 0, `PHASE ${phaseIndex + 1}`, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ff3333',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.container.add(text);
        
        // Animate text
        this.scene.tweens.add({
            targets: text,
            scale: { from: 0.5, to: 2 },
            alpha: { from: 1, to: 0 },
            duration: 1500,
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    /**
     * Show resistance effect when damage is resisted
     */
    showResistanceEffect(weaponType) {
        // Create shield flash effect
        const shield = this.scene.add.graphics();
        shield.lineStyle(4, 0xffffff, 0.8);
        shield.strokeCircle(0, 0, 60);
        this.container.add(shield);
        
        // Animate shield
        this.scene.tweens.add({
            targets: shield,
            alpha: { from: 0.8, to: 0 },
            scale: { from: 1, to: 1.5 },
            duration: 500,
            onComplete: () => {
                shield.destroy();
            }
        });
        
        // Create text effect
        const text = this.scene.add.text(0, -50, 'RESISTED', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.container.add(text);
        
        // Animate text
        this.scene.tweens.add({
            targets: text,
            y: -80,
            alpha: { from: 1, to: 0 },
            duration: 800,
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    /**
     * Update the effects position to match the Nemesis
     */
    update() {
        if (this.container && this.nemesis) {
            this.container.setPosition(this.nemesis.x, this.nemesis.y);
        }
    }
    
    /**
     * Clean up all effects
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        
        this.effects.forEach(effect => {
            if (effect) effect.destroy();
        });
        
        this.effects = [];
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisEffects = NemesisEffects;
}
