/**
 * Visual Effects System
 * Enhances the game's visual presentation with particles, animations, and effects
 */
class VisualEffects {
    constructor(scene) {
        this.scene = scene;
        
        // Initialize particle emitters
        this.emitters = {};
        
        // Initialize animation registry
        this.animations = {};
        
        // Initialize effect settings
        this.settings = {
            particleQuality: 'high', // 'low', 'medium', 'high'
            screenShake: true,
            animationSpeed: 1.0,
            colorIntensity: 1.0
        };
        
        // Load settings from global config if available
        this.loadSettings();
        
        // Create particle manager
        this.createParticleManager();
    }
    
    /**
     * Load effect settings from global config
     */
    loadSettings() {
        if (this.scene.game.global && this.scene.game.global.settings) {
            // Load particle quality setting
            if (this.scene.game.global.settings.particleQuality) {
                this.settings.particleQuality = this.scene.game.global.settings.particleQuality;
            }
            
            // Load screen shake setting
            if (this.scene.game.global.settings.screenShake !== undefined) {
                this.settings.screenShake = this.scene.game.global.settings.screenShake;
            }
        }
    }
    
    /**
     * Create particle manager and define particle configurations
     */
    createParticleManager() {
        // Create particle emitters for different effects
        this.createExplosionEmitters();
        this.createThrusterEmitters();
        this.createWeaponEmitters();
        this.createImpactEmitters();
        this.createEnvironmentalEmitters();
    }
    
    /**
     * Create explosion particle emitters
     */
    createExplosionEmitters() {
        // Small explosion emitter
        this.emitters.smallExplosion = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 300, max: 500 },
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xff9900, 0xff6600, 0xff3300],
            emitting: false
        });
        
        // Medium explosion emitter
        this.emitters.mediumExplosion = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 400, max: 600 },
            speed: { min: 100, max: 200 },
            scale: { start: 0.8, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xff9900, 0xff6600, 0xff3300],
            emitting: false
        });
        
        // Large explosion emitter
        this.emitters.largeExplosion = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 500, max: 800 },
            speed: { min: 150, max: 250 },
            scale: { start: 1.2, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xff9900, 0xff6600, 0xff3300],
            emitting: false
        });
        
        // Debris emitter
        this.emitters.debris = this.scene.add.particles(0, 0, 'particles', {
            frame: 'square',
            lifespan: { min: 600, max: 1000 },
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            gravityY: 20,
            blendMode: 'NORMAL',
            tint: [0xcccccc, 0x999999, 0x666666],
            emitting: false
        });
    }
    
    /**
     * Create thruster particle emitters
     */
    createThrusterEmitters() {
        // Player thruster emitter
        this.emitters.playerThruster = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 200, max: 300 },
            speed: { min: 30, max: 60 },
            scale: { start: 0.4, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0x3399ff, 0x0066cc],
            emitting: false
        });
        
        // Enemy thruster emitter
        this.emitters.enemyThruster = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 150, max: 250 },
            speed: { min: 20, max: 40 },
            scale: { start: 0.3, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xff3300, 0xcc0000],
            emitting: false
        });
        
        // Boss thruster emitter
        this.emitters.bossThruster = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 300, max: 500 },
            speed: { min: 40, max: 80 },
            scale: { start: 0.6, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xff9900, 0xff6600],
            emitting: false
        });
    }
    
    /**
     * Create weapon particle emitters
     */
    createWeaponEmitters() {
        // Laser impact emitter
        this.emitters.laserImpact = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 100, max: 200 },
            speed: { min: 30, max: 60 },
            scale: { start: 0.3, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0x33ff33, 0x00cc00],
            emitting: false
        });
        
        // Plasma impact emitter
        this.emitters.plasmaImpact = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 200, max: 300 },
            speed: { min: 40, max: 80 },
            scale: { start: 0.5, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0x9933ff, 0x6600cc],
            emitting: false
        });
        
        // Missile trail emitter
        this.emitters.missileTrail = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 300, max: 500 },
            speed: { min: 10, max: 20 },
            scale: { start: 0.2, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xff9900, 0xff6600],
            emitting: false
        });
    }
    
    /**
     * Create impact particle emitters
     */
    createImpactEmitters() {
        // Shield impact emitter
        this.emitters.shieldImpact = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 200, max: 300 },
            speed: { min: 50, max: 100 },
            scale: { start: 0.4, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0x3399ff, 0x0066cc],
            emitting: false
        });
        
        // Hull impact emitter
        this.emitters.hullImpact = this.scene.add.particles(0, 0, 'particles', {
            frame: 'square',
            lifespan: { min: 300, max: 500 },
            speed: { min: 30, max: 60 },
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            gravityY: 10,
            blendMode: 'NORMAL',
            tint: [0xcccccc, 0x999999],
            emitting: false
        });
    }
    
    /**
     * Create environmental particle emitters
     */
    createEnvironmentalEmitters() {
        // Space dust emitter
        this.emitters.spaceDust = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 2000, max: 3000 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.1, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xffffff, 0xcccccc],
            emitting: false
        });
        
        // Nebula emitter
        this.emitters.nebula = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 3000, max: 5000 },
            speed: { min: 5, max: 15 },
            scale: { start: 0.2, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0x9933ff, 0x6600cc, 0x3399ff],
            emitting: false
        });
    }
    
    /**
     * Create an explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} size - Size of explosion ('small', 'medium', 'large')
     */
    createExplosion(x, y, size = 'medium') {
        // Determine particle count based on quality setting
        let particleCount;
        switch (this.settings.particleQuality) {
            case 'low':
                particleCount = size === 'small' ? 5 : (size === 'medium' ? 10 : 15);
                break;
            case 'medium':
                particleCount = size === 'small' ? 10 : (size === 'medium' ? 20 : 30);
                break;
            case 'high':
            default:
                particleCount = size === 'small' ? 15 : (size === 'medium' ? 30 : 50);
                break;
        }
        
        // Create explosion particles
        switch (size) {
            case 'small':
                this.emitters.smallExplosion.explode(particleCount, x, y);
                break;
            case 'medium':
                this.emitters.mediumExplosion.explode(particleCount, x, y);
                // Add some debris
                this.emitters.debris.explode(Math.floor(particleCount / 3), x, y);
                break;
            case 'large':
                this.emitters.largeExplosion.explode(particleCount, x, y);
                // Add more debris
                this.emitters.debris.explode(Math.floor(particleCount / 2), x, y);
                break;
        }
        
        // Add screen shake if enabled
        if (this.settings.screenShake) {
            const intensity = size === 'small' ? 0.003 : (size === 'medium' ? 0.005 : 0.01);
            const duration = size === 'small' ? 100 : (size === 'medium' ? 200 : 300);
            this.createScreenShake(intensity, duration);
        }
        
        // Add flash effect
        this.createFlash(x, y, size);
    }
    
    /**
     * Create a thruster effect
     * @param {object} entity - The entity to attach the thruster to
     * @param {string} type - Type of thruster ('player', 'enemy', 'boss')
     * @param {number} offsetX - X offset from entity position
     * @param {number} offsetY - Y offset from entity position
     */
    createThruster(entity, type = 'player', offsetX = 0, offsetY = 20) {
        let emitter;
        
        // Select the appropriate emitter
        switch (type) {
            case 'player':
                emitter = this.emitters.playerThruster;
                break;
            case 'enemy':
                emitter = this.emitters.enemyThruster;
                break;
            case 'boss':
                emitter = this.emitters.bossThruster;
                break;
            default:
                emitter = this.emitters.playerThruster;
        }
        
        // Determine particle frequency based on quality setting
        let frequency;
        switch (this.settings.particleQuality) {
            case 'low':
                frequency = 100;
                break;
            case 'medium':
                frequency = 50;
                break;
            case 'high':
            default:
                frequency = 20;
                break;
        }
        
        // Set emitter position relative to entity
        emitter.setPosition(entity.x + offsetX, entity.y + offsetY);
        
        // Start emitting
        emitter.start();
        
        // Return a function to update the emitter position
        return function updateThruster() {
            emitter.setPosition(entity.x + offsetX, entity.y + offsetY);
        };
    }
    
    /**
     * Create a weapon impact effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Type of impact ('laser', 'plasma', 'missile')
     */
    createWeaponImpact(x, y, type = 'laser') {
        let emitter;
        let particleCount;
        
        // Select the appropriate emitter
        switch (type) {
            case 'laser':
                emitter = this.emitters.laserImpact;
                particleCount = this.settings.particleQuality === 'low' ? 5 : (this.settings.particleQuality === 'medium' ? 10 : 15);
                break;
            case 'plasma':
                emitter = this.emitters.plasmaImpact;
                particleCount = this.settings.particleQuality === 'low' ? 8 : (this.settings.particleQuality === 'medium' ? 15 : 25);
                break;
            case 'missile':
                // For missiles, create a small explosion instead
                this.createExplosion(x, y, 'small');
                return;
            default:
                emitter = this.emitters.laserImpact;
                particleCount = this.settings.particleQuality === 'low' ? 5 : (this.settings.particleQuality === 'medium' ? 10 : 15);
        }
        
        // Create impact particles
        emitter.explode(particleCount, x, y);
    }
    
    /**
     * Create a shield impact effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Radius of the shield
     */
    createShieldImpact(x, y, radius = 30) {
        // Determine particle count based on quality setting
        const particleCount = this.settings.particleQuality === 'low' ? 10 : (this.settings.particleQuality === 'medium' ? 20 : 30);
        
        // Create shield impact particles
        this.emitters.shieldImpact.explode(particleCount, x, y);
        
        // Create shield ripple effect
        this.createShieldRipple(x, y, radius);
    }
    
    /**
     * Create a hull impact effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createHullImpact(x, y) {
        // Determine particle count based on quality setting
        const particleCount = this.settings.particleQuality === 'low' ? 5 : (this.settings.particleQuality === 'medium' ? 10 : 15);
        
        // Create hull impact particles
        this.emitters.hullImpact.explode(particleCount, x, y);
    }
    
    /**
     * Create a missile trail effect
     * @param {object} missile - The missile to attach the trail to
     * @returns {function} Function to update the trail position
     */
    createMissileTrail(missile) {
        // Determine particle frequency based on quality setting
        let frequency;
        switch (this.settings.particleQuality) {
            case 'low':
                frequency = 100;
                break;
            case 'medium':
                frequency = 50;
                break;
            case 'high':
            default:
                frequency = 20;
                break;
        }
        
        // Set emitter position to missile
        this.emitters.missileTrail.setPosition(missile.x, missile.y);
        
        // Start emitting
        this.emitters.missileTrail.start();
        
        // Return a function to update the emitter position
        return function updateTrail() {
            this.emitters.missileTrail.setPosition(missile.x, missile.y);
        }.bind(this);
    }
    
    /**
     * Create a screen shake effect
     * @param {number} intensity - Intensity of the shake (0.0 to 1.0)
     * @param {number} duration - Duration of the shake in ms
     */
    createScreenShake(intensity = 0.005, duration = 200) {
        // Skip if screen shake is disabled
        if (!this.settings.screenShake) return;
        
        // Apply screen shake
        this.scene.cameras.main.shake(duration, intensity);
    }
    
    /**
     * Create a flash effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} size - Size of flash ('small', 'medium', 'large')
     */
    createFlash(x, y, size = 'medium') {
        // Determine flash size
        let flashSize;
        switch (size) {
            case 'small':
                flashSize = 50;
                break;
            case 'medium':
                flashSize = 100;
                break;
            case 'large':
                flashSize = 150;
                break;
            default:
                flashSize = 100;
        }
        
        // Create flash sprite
        const flash = this.scene.add.sprite(x, y, 'particles', 'circle');
        flash.setScale(flashSize / 32); // Assuming 'circle' texture is 32x32
        flash.setAlpha(0.8);
        flash.setTint(0xffffff);
        flash.setBlendMode('ADD');
        
        // Animate flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: flash.scale * 1.5,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    /**
     * Create a shield ripple effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Radius of the shield
     */
    createShieldRipple(x, y, radius = 30) {
        // Create ripple sprite
        const ripple = this.scene.add.sprite(x, y, 'particles', 'circle');
        ripple.setScale(radius / 16); // Assuming 'circle' texture is 32x32
        ripple.setAlpha(0.5);
        ripple.setTint(0x3399ff);
        ripple.setBlendMode('ADD');
        
        // Animate ripple
        this.scene.tweens.add({
            targets: ripple,
            alpha: 0,
            scale: ripple.scale * 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                ripple.destroy();
            }
        });
    }
    
    /**
     * Create space dust particles in the background
     * @param {number} count - Number of particles to create
     */
    createSpaceDust(count = 50) {
        // Adjust count based on quality setting
        count = this.settings.particleQuality === 'low' ? Math.floor(count / 3) : 
                (this.settings.particleQuality === 'medium' ? Math.floor(count / 1.5) : count);
        
        // Set emitter to cover the entire screen
        this.emitters.spaceDust.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
        this.emitters.spaceDust.setEmitZone({
            type: 'random',
            source: new Phaser.Geom.Rectangle(-this.scene.cameras.main.width / 2, -this.scene.cameras.main.height / 2, 
                                             this.scene.cameras.main.width, this.scene.cameras.main.height)
        });
        
        // Start emitting
        this.emitters.spaceDust.start();
    }
    
    /**
     * Create nebula particles in the background
     * @param {number} count - Number of particles to create
     * @param {array} colors - Array of colors for the nebula
     */
    createNebula(count = 30, colors = [0x9933ff, 0x6600cc, 0x3399ff]) {
        // Adjust count based on quality setting
        count = this.settings.particleQuality === 'low' ? Math.floor(count / 3) : 
                (this.settings.particleQuality === 'medium' ? Math.floor(count / 1.5) : count);
        
        // Set emitter to cover the entire screen
        this.emitters.nebula.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
        this.emitters.nebula.setEmitZone({
            type: 'random',
            source: new Phaser.Geom.Rectangle(-this.scene.cameras.main.width / 2, -this.scene.cameras.main.height / 2, 
                                             this.scene.cameras.main.width, this.scene.cameras.main.height)
        });
        
        // Set nebula colors
        this.emitters.nebula.setTint(colors);
        
        // Start emitting
        this.emitters.nebula.start();
    }
    
    /**
     * Create a powerup pickup effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Type of powerup ('health', 'shield', 'ammo', 'weapon')
     */
    createPowerupEffect(x, y, type = 'health') {
        // Determine color based on powerup type
        let color;
        switch (type) {
            case 'health':
                color = 0xff3333;
                break;
            case 'shield':
                color = 0x3399ff;
                break;
            case 'ammo':
                color = 0xffcc33;
                break;
            case 'weapon':
                color = 0x33ff33;
                break;
            default:
                color = 0xffffff;
        }
        
        // Create particles
        const emitter = this.scene.add.particles(x, y, 'particles', {
            frame: 'circle',
            lifespan: 500,
            speed: { min: 50, max: 100 },
            scale: { start: 0.4, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: color,
            emitting: false
        });
        
        // Determine particle count based on quality setting
        const particleCount = this.settings.particleQuality === 'low' ? 10 : 
                             (this.settings.particleQuality === 'medium' ? 20 : 30);
        
        // Explode particles
        emitter.explode(particleCount, x, y);
        
        // Create flash
        this.createFlash(x, y, 'small');
        
        // Clean up emitter after particles are done
        this.scene.time.delayedCall(500, () => {
            emitter.destroy();
        });
    }
    
    /**
     * Create a level up effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createLevelUpEffect(x, y) {
        // Create particles
        const emitter = this.scene.add.particles(x, y, 'particles', {
            frame: 'circle',
            lifespan: 1000,
            speed: { min: 100, max: 200 },
            scale: { start: 0.5, end: 0 },
            gravityY: -50,
            blendMode: 'ADD',
            tint: [0x33ff33, 0x66ff66, 0x99ff99],
            emitting: false
        });
        
        // Determine particle count based on quality setting
        const particleCount = this.settings.particleQuality === 'low' ? 20 : 
                             (this.settings.particleQuality === 'medium' ? 40 : 60);
        
        // Explode particles
        emitter.explode(particleCount, x, y);
        
        // Create flash
        this.createFlash(x, y, 'medium');
        
        // Add screen shake
        this.createScreenShake(0.003, 300);
        
        // Clean up emitter after particles are done
        this.scene.time.delayedCall(1000, () => {
            emitter.destroy();
        });
    }
    
    /**
     * Create a boss entrance effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createBossEntranceEffect(x, y) {
        // Create flash
        this.createFlash(x, y, 'large');
        
        // Add screen shake
        this.createScreenShake(0.01, 500);
        
        // Create particles
        const emitter = this.scene.add.particles(x, y, 'particles', {
            frame: 'circle',
            lifespan: 1500,
            speed: { min: 100, max: 300 },
            scale: { start: 0.8, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xff3300, 0xff6600, 0xff9900],
            emitting: false
        });
        
        // Determine particle count based on quality setting
        const particleCount = this.settings.particleQuality === 'low' ? 30 : 
                             (this.settings.particleQuality === 'medium' ? 60 : 100);
        
        // Explode particles
        emitter.explode(particleCount, x, y);
        
        // Clean up emitter after particles are done
        this.scene.time.delayedCall(1500, () => {
            emitter.destroy();
        });
    }
    
    /**
     * Create a teleport effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Color of the teleport effect
     */
    createTeleportEffect(x, y, color = 0x3399ff) {
        // Create particles
        const emitter = this.scene.add.particles(x, y, 'particles', {
            frame: 'circle',
            lifespan: 800,
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: color,
            emitting: false
        });
        
        // Determine particle count based on quality setting
        const particleCount = this.settings.particleQuality === 'low' ? 15 : 
                             (this.settings.particleQuality === 'medium' ? 30 : 50);
        
        // Explode particles
        emitter.explode(particleCount, x, y);
        
        // Create flash
        this.createFlash(x, y, 'medium');
        
        // Clean up emitter after particles are done
        this.scene.time.delayedCall(800, () => {
            emitter.destroy();
        });
    }
    
    /**
     * Set particle quality
     * @param {string} quality - Quality level ('low', 'medium', 'high')
     */
    setParticleQuality(quality) {
        this.settings.particleQuality = quality;
        
        // Save to global settings if available
        if (this.scene.game.global && this.scene.game.global.settings) {
            this.scene.game.global.settings.particleQuality = quality;
        }
    }
    
    /**
     * Set screen shake enabled/disabled
     * @param {boolean} enabled - Whether screen shake is enabled
     */
    setScreenShake(enabled) {
        this.settings.screenShake = enabled;
        
        // Save to global settings if available
        if (this.scene.game.global && this.scene.game.global.settings) {
            this.scene.game.global.settings.screenShake = enabled;
        }
    }
    
    /**
     * Clean up all particle emitters
     */
    cleanup() {
        // Stop and destroy all emitters
        Object.values(this.emitters).forEach(emitter => {
            if (emitter) {
                emitter.stop();
                emitter.destroy();
            }
        });
        
        // Clear emitters object
        this.emitters = {};
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.VisualEffects = VisualEffects;
}
