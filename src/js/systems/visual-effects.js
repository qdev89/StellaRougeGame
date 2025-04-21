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
     * Create explosion particle emitters with enhanced visual effects
     */
    createExplosionEmitters() {
        // Small explosion emitter - more dynamic with varied colors
        this.emitters.smallExplosion = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 300, max: 600 },
            speed: { min: 60, max: 180 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.8, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xffff99, 0xff9900, 0xff6600, 0xff3300], // More color variation
            emitting: false,
            rotate: { min: 0, max: 360 }, // Add rotation for more dynamic effect
            accelerationY: { min: -20, max: 20 }, // Add some vertical drift
            frequency: 50,
            quantity: 1
        });

        // Medium explosion emitter - more particles and visual interest
        this.emitters.mediumExplosion = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 400, max: 800 },
            speed: { min: 100, max: 250 },
            scale: { start: 0.9, end: 0 },
            alpha: { start: 0.9, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xffffff, 0xffff99, 0xff9900, 0xff6600, 0xff3300], // More color variation including white
            emitting: false,
            rotate: { min: 0, max: 360 },
            accelerationY: { min: -30, max: 30 },
            frequency: 40,
            quantity: 2
        });

        // Large explosion emitter - spectacular with more effects
        this.emitters.largeExplosion = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 600, max: 1000 },
            speed: { min: 150, max: 300 },
            scale: { start: 1.4, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xffffff, 0xffffcc, 0xffff99, 0xff9900, 0xff6600, 0xff3300], // Full range of explosion colors
            emitting: false,
            rotate: { min: 0, max: 360 },
            accelerationY: { min: -40, max: 40 },
            frequency: 30,
            quantity: 3
        });

        // Shockwave emitter for larger explosions
        this.emitters.shockwave = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: 400,
            speed: { min: 200, max: 400 },
            scale: { start: 0.2, end: 0.8 },
            alpha: { start: 0.6, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: 0xffffff,
            emitting: false
        });

        // Ember emitter for lingering fire effects
        this.emitters.embers = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 800, max: 1500 },
            speed: { min: 20, max: 80 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.7, end: 0 },
            gravityY: -20, // Embers rise
            blendMode: 'ADD',
            tint: [0xff9900, 0xff6600, 0xff3300],
            emitting: false,
            frequency: 100,
            quantity: 1
        });

        // Debris emitter - enhanced with more realistic physics
        this.emitters.debris = this.scene.add.particles(0, 0, 'particles', {
            frame: ['square', 'triangle'], // Use multiple shapes for debris
            lifespan: { min: 800, max: 1500 },
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0.1 }, // Debris shrinks but doesn't disappear completely
            alpha: { start: 1, end: 0 },
            gravityY: 50, // Stronger gravity effect
            blendMode: 'NORMAL',
            tint: [0xffffff, 0xcccccc, 0x999999, 0x666666], // More color variation
            emitting: false,
            accelerationY: { min: 0, max: 100 }, // Additional acceleration for more dynamic movement
            frequency: 80,
            quantity: 1
        });

        // Smoke emitter for aftermath
        this.emitters.smoke = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 1000, max: 2000 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.8, end: 1.5 }, // Smoke expands
            alpha: { start: 0.3, end: 0 },
            gravityY: -15, // Smoke rises
            blendMode: 'SCREEN',
            tint: [0x666666, 0x999999, 0xcccccc],
            emitting: false,
            frequency: 200,
            quantity: 1
        });
    }

    /**
     * Create enhanced thruster particle emitters with more dynamic and realistic effects
     */
    createThrusterEmitters() {
        // Player thruster emitter - blue energy with more dynamic properties
        this.emitters.playerThruster = this.scene.add.particles(0, 0, 'particles', {
            frame: ['circle', 'circle', 'circle', 'square'], // Occasionally use square for variation
            lifespan: { min: 200, max: 400 },
            speed: { min: 40, max: 80 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xffffff, 0x99ccff, 0x3399ff, 0x0066cc], // More color variation with white core
            emitting: false,
            rotate: { min: 0, max: 360 }, // Add rotation for more dynamic effect
            frequency: 30,
            quantity: 2,
            accelerationY: { min: -5, max: 5 }, // Slight vertical drift
            angle: { min: 85, max: 95 } // Slightly varied angle for more natural look
        });

        // Player thruster core - brighter center
        this.emitters.playerThrusterCore = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 100, max: 200 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: 0xffffff, // Bright white core
            emitting: false,
            frequency: 40,
            quantity: 1
        });

        // Enemy thruster emitter - red energy with more aggressive look
        this.emitters.enemyThruster = this.scene.add.particles(0, 0, 'particles', {
            frame: ['circle', 'circle', 'square'], // More varied shapes
            lifespan: { min: 150, max: 300 },
            speed: { min: 30, max: 60 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.7, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xffcc99, 0xff6600, 0xff3300, 0xcc0000], // Orange-red gradient
            emitting: false,
            rotate: { min: 0, max: 360 },
            frequency: 40,
            quantity: 1,
            accelerationY: { min: -5, max: 5 },
            angle: { min: 85, max: 95 }
        });

        // Boss thruster emitter - larger, more impressive with pulsing effect
        this.emitters.bossThruster = this.scene.add.particles(0, 0, 'particles', {
            frame: ['circle', 'circle', 'square'],
            lifespan: { min: 300, max: 600 },
            speed: { min: 50, max: 100 },
            scale: { start: 0.7, end: 0 },
            alpha: { start: 0.9, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: [0xffffcc, 0xffcc66, 0xff9900, 0xff6600], // Yellow-orange gradient
            emitting: false,
            rotate: { min: 0, max: 360 },
            frequency: 20,
            quantity: 2,
            accelerationY: { min: -10, max: 10 },
            angle: { min: 80, max: 100 } // Wider angle for more impressive effect
        });

        // Boss thruster core - brighter center
        this.emitters.bossThrusterCore = this.scene.add.particles(0, 0, 'particles', {
            frame: 'circle',
            lifespan: { min: 150, max: 250 },
            speed: { min: 20, max: 40 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 0,
            blendMode: 'ADD',
            tint: 0xffffff, // Bright white core
            emitting: false,
            frequency: 30,
            quantity: 1
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
     * Create an enhanced explosion effect with multiple particle systems
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} size - Size of explosion ('small', 'medium', 'large')
     */
    createExplosion(x, y, size = 'medium') {
        // Determine particle count based on quality setting
        let particleCount;
        switch (this.settings.particleQuality) {
            case 'low':
                particleCount = size === 'small' ? 8 : (size === 'medium' ? 15 : 25);
                break;
            case 'medium':
                particleCount = size === 'small' ? 15 : (size === 'medium' ? 30 : 50);
                break;
            case 'high':
            default:
                particleCount = size === 'small' ? 25 : (size === 'medium' ? 50 : 80);
                break;
        }

        // Create explosion particles with layered effects for more visual impact
        switch (size) {
            case 'small':
                // Main explosion
                this.emitters.smallExplosion.explode(particleCount, x, y);

                // Add a few debris particles
                this.emitters.debris.explode(Math.floor(particleCount / 5), x, y);

                // Add a small flash
                this.createFlash(x, y, 'small');
                break;

            case 'medium':
                // Main explosion
                this.emitters.mediumExplosion.explode(particleCount, x, y);

                // Add debris
                this.emitters.debris.explode(Math.floor(particleCount / 3), x, y);

                // Add shockwave
                this.emitters.shockwave.explode(Math.floor(particleCount / 4), x, y);

                // Add embers for lingering effect
                this.emitters.embers.explode(Math.floor(particleCount / 3), x, y);

                // Add smoke that lingers
                this.scene.time.delayedCall(200, () => {
                    this.emitters.smoke.explode(Math.floor(particleCount / 4), x, y);
                });

                // Add a medium flash
                this.createFlash(x, y, 'medium');
                break;

            case 'large':
                // Main explosion - bigger and more dramatic
                this.emitters.largeExplosion.explode(particleCount, x, y);

                // Add lots of debris
                this.emitters.debris.explode(Math.floor(particleCount / 2), x, y);

                // Add stronger shockwave
                this.emitters.shockwave.explode(Math.floor(particleCount / 3), x, y);

                // Add more embers for lingering effect
                this.emitters.embers.explode(Math.floor(particleCount / 2), x, y);

                // Add secondary explosion after a short delay
                this.scene.time.delayedCall(100, () => {
                    this.emitters.mediumExplosion.explode(Math.floor(particleCount / 3),
                        x + Phaser.Math.Between(-20, 20),
                        y + Phaser.Math.Between(-20, 20));
                });

                // Add smoke that lingers longer
                this.scene.time.delayedCall(300, () => {
                    this.emitters.smoke.explode(Math.floor(particleCount / 3), x, y);
                });

                // Add a large flash
                this.createFlash(x, y, 'large');
                break;
        }

        // Add screen shake with enhanced parameters
        if (this.settings.screenShake) {
            const intensity = size === 'small' ? 0.003 : (size === 'medium' ? 0.007 : 0.012);
            const duration = size === 'small' ? 150 : (size === 'medium' ? 300 : 500);
            this.createScreenShake(intensity, duration);
        }

        // Play explosion sound if available
        if (this.scene.sound && this.scene.sound.play) {
            const soundKey = size === 'small' ? 'explosion-small' :
                           (size === 'medium' ? 'explosion-medium' : 'explosion-large');

            try {
                this.scene.sound.play(soundKey, {
                    volume: size === 'small' ? 0.3 : (size === 'medium' ? 0.5 : 0.7)
                });
            } catch (e) {
                // Sound not available, ignore
            }
        }
    }

    /**
     * Create an enhanced thruster effect with multiple particle systems for more visual impact
     * @param {object} entity - The entity to attach the thruster to
     * @param {string} type - Type of thruster ('player', 'enemy', 'boss')
     * @param {number} offsetX - X offset from entity position
     * @param {number} offsetY - Y offset from entity position
     * @param {object} options - Additional options for customization
     */
    createThruster(entity, type = 'player', offsetX = 0, offsetY = 20, options = {}) {
        let mainEmitter, coreEmitter;
        let thrusterWidth = options.width || 1.0; // Width multiplier
        let thrusterIntensity = options.intensity || 1.0; // Intensity multiplier

        // Select the appropriate emitters based on type
        switch (type) {
            case 'player':
                mainEmitter = this.emitters.playerThruster;
                coreEmitter = this.emitters.playerThrusterCore;
                break;
            case 'enemy':
                mainEmitter = this.emitters.enemyThruster;
                coreEmitter = null; // Enemies don't have core emitter for performance
                break;
            case 'boss':
                mainEmitter = this.emitters.bossThruster;
                coreEmitter = this.emitters.bossThrusterCore;
                break;
            default:
                mainEmitter = this.emitters.playerThruster;
                coreEmitter = this.emitters.playerThrusterCore;
        }

        // Determine particle frequency based on quality setting and intensity
        let frequency;
        switch (this.settings.particleQuality) {
            case 'low':
                frequency = Math.round(100 / thrusterIntensity);
                break;
            case 'medium':
                frequency = Math.round(50 / thrusterIntensity);
                break;
            case 'high':
            default:
                frequency = Math.round(20 / thrusterIntensity);
                break;
        }

        // Apply frequency and quantity adjustments
        mainEmitter.setFrequency(frequency);
        mainEmitter.setQuantity(Math.max(1, Math.round(thrusterIntensity * 2)));

        // Apply width adjustment (affects particle spread)
        if (thrusterWidth !== 1.0) {
            // Adjust angle range for width
            const baseAngle = 90; // Straight down
            const angleVariation = 5 * thrusterWidth; // Default is ±5 degrees
            mainEmitter.setAngle({ min: baseAngle - angleVariation, max: baseAngle + angleVariation });
        }

        // Set emitter position relative to entity
        mainEmitter.setPosition(entity.x + offsetX, entity.y + offsetY);
        mainEmitter.start();

        // Set up core emitter if available
        if (coreEmitter) {
            coreEmitter.setPosition(entity.x + offsetX, entity.y + offsetY);
            coreEmitter.setFrequency(frequency * 1.5); // Core emits less frequently
            coreEmitter.start();
        }

        // Create a pulsing effect for boss thrusters
        let pulseTimer = null;
        if (type === 'boss' && this.settings.particleQuality !== 'low') {
            pulseTimer = this.scene.time.addEvent({
                delay: 1000, // Pulse every second
                callback: () => {
                    // Temporarily increase particle emission
                    const originalFrequency = mainEmitter.frequency;
                    const originalQuantity = mainEmitter.quantity;

                    mainEmitter.setFrequency(originalFrequency / 3);
                    mainEmitter.setQuantity(originalQuantity * 2);

                    // Reset after pulse
                    this.scene.time.delayedCall(200, () => {
                        mainEmitter.setFrequency(originalFrequency);
                        mainEmitter.setQuantity(originalQuantity);
                    });
                },
                loop: true
            });
        }

        // Return a function to update the emitter position
        return function updateThruster() {
            mainEmitter.setPosition(entity.x + offsetX, entity.y + offsetY);

            if (coreEmitter) {
                coreEmitter.setPosition(entity.x + offsetX, entity.y + offsetY);
            }

            // Method to stop the thruster
            this.stop = () => {
                mainEmitter.stop();
                if (coreEmitter) coreEmitter.stop();
                if (pulseTimer) pulseTimer.remove();
            };
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
     * Create an enhanced flash effect with multiple layers for more visual impact
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} size - Size of flash ('small', 'medium', 'large')
     */
    createFlash(x, y, size = 'medium') {
        // Determine flash size and properties
        let flashSize, flashDuration, flashIntensity;
        switch (size) {
            case 'small':
                flashSize = 60;
                flashDuration = 250;
                flashIntensity = 0.8;
                break;
            case 'medium':
                flashSize = 120;
                flashDuration = 350;
                flashIntensity = 0.9;
                break;
            case 'large':
                flashSize = 180;
                flashDuration = 450;
                flashIntensity = 1.0;
                break;
            default:
                flashSize = 120;
                flashDuration = 350;
                flashIntensity = 0.9;
        }

        // Create main bright flash
        const mainFlash = this.scene.add.sprite(x, y, 'particles', 'circle');
        mainFlash.setScale(flashSize / 32); // Assuming 'circle' texture is 32x32
        mainFlash.setAlpha(flashIntensity);
        mainFlash.setTint(0xffffff);
        mainFlash.setBlendMode('ADD');
        mainFlash.setDepth(100); // Make sure flash appears above other elements

        // Create outer glow for more dramatic effect
        const outerGlow = this.scene.add.sprite(x, y, 'particles', 'circle');
        outerGlow.setScale((flashSize * 1.5) / 32);
        outerGlow.setAlpha(flashIntensity * 0.5);
        outerGlow.setTint(0xffffcc); // Slightly yellow tint for outer glow
        outerGlow.setBlendMode('ADD');
        outerGlow.setDepth(99); // Below the main flash

        // Create a third layer for even more dramatic effect on large explosions
        if (size === 'medium' || size === 'large') {
            const thirdLayer = this.scene.add.sprite(x, y, 'particles', 'circle');
            thirdLayer.setScale((flashSize * 2) / 32);
            thirdLayer.setAlpha(flashIntensity * 0.3);
            thirdLayer.setTint(0xff9900); // Orange tint for outer layer
            thirdLayer.setBlendMode('ADD');
            thirdLayer.setDepth(98); // Below the other layers

            // Animate third layer
            this.scene.tweens.add({
                targets: thirdLayer,
                alpha: 0,
                scale: thirdLayer.scale * 1.8,
                duration: flashDuration * 1.5,
                ease: 'Power2',
                onComplete: () => {
                    thirdLayer.destroy();
                }
            });
        }

        // Animate main flash with a more dynamic effect
        this.scene.tweens.add({
            targets: mainFlash,
            alpha: 0,
            scale: mainFlash.scale * 1.3,
            duration: flashDuration,
            ease: 'Power2',
            onComplete: () => {
                mainFlash.destroy();
            }
        });

        // Animate outer glow with a slightly different timing for more interesting effect
        this.scene.tweens.add({
            targets: outerGlow,
            alpha: 0,
            scale: outerGlow.scale * 1.6,
            duration: flashDuration * 1.2,
            ease: 'Power2',
            onComplete: () => {
                outerGlow.destroy();
            }
        });

        // Add a camera flash effect for large explosions
        if (size === 'large' && this.settings.screenShake) {
            this.scene.cameras.main.flash(flashDuration * 0.7, 255, 255, 255, 0.3);
        }
    }

    /**
     * Create an enhanced shield ripple effect with multiple layers and dynamic properties
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Radius of the shield
     */
    createShieldRipple(x, y, radius = 30) {
        // Create main ripple sprite with improved visuals
        const mainRipple = this.scene.add.sprite(x, y, 'particles', 'circle');
        mainRipple.setScale(radius / 16); // Assuming 'circle' texture is 32x32
        mainRipple.setAlpha(0.6);
        mainRipple.setTint(0x3399ff); // Blue shield color
        mainRipple.setBlendMode('ADD');
        mainRipple.setDepth(90);

        // Create inner ripple for more visual interest
        const innerRipple = this.scene.add.sprite(x, y, 'particles', 'circle');
        innerRipple.setScale((radius * 0.8) / 16);
        innerRipple.setAlpha(0.7);
        innerRipple.setTint(0x66ccff); // Lighter blue for inner ripple
        innerRipple.setBlendMode('ADD');
        innerRipple.setDepth(91);

        // Create outer ripple for more visual interest
        const outerRipple = this.scene.add.sprite(x, y, 'particles', 'circle');
        outerRipple.setScale((radius * 1.2) / 16);
        outerRipple.setAlpha(0.4);
        outerRipple.setTint(0x0066cc); // Darker blue for outer ripple
        outerRipple.setBlendMode('ADD');
        outerRipple.setDepth(89);

        // Create a highlight effect at impact point
        const highlight = this.scene.add.sprite(x, y, 'particles', 'circle');
        highlight.setScale(radius * 0.2 / 16);
        highlight.setAlpha(0.9);
        highlight.setTint(0xffffff); // White highlight
        highlight.setBlendMode('ADD');
        highlight.setDepth(92);

        // Animate main ripple with improved animation
        this.scene.tweens.add({
            targets: mainRipple,
            alpha: 0,
            scale: mainRipple.scale * 1.6,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                mainRipple.destroy();
            }
        });

        // Animate inner ripple with slightly different timing
        this.scene.tweens.add({
            targets: innerRipple,
            alpha: 0,
            scale: innerRipple.scale * 1.8,
            duration: 350,
            ease: 'Power2',
            onComplete: () => {
                innerRipple.destroy();
            }
        });

        // Animate outer ripple with different timing
        this.scene.tweens.add({
            targets: outerRipple,
            alpha: 0,
            scale: outerRipple.scale * 1.5,
            duration: 450,
            ease: 'Power2',
            onComplete: () => {
                outerRipple.destroy();
            }
        });

        // Animate highlight with quick fade
        this.scene.tweens.add({
            targets: highlight,
            alpha: 0,
            scale: highlight.scale * 3,
            duration: 200,
            ease: 'Power3',
            onComplete: () => {
                highlight.destroy();
            }
        });

        // Add a subtle screen flash for larger shields
        if (radius > 50 && this.settings.screenShake) {
            this.scene.cameras.main.flash(200, 100, 150, 255, 0.1); // Subtle blue flash
        }
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
     * Create a portal effect for level completion
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {object} The portal sprite
     */
    createPortalEffect(x, y) {
        // Create the portal sprite
        const portal = this.scene.add.sprite(x, y, 'portal');
        portal.setDepth(CONSTANTS.GAME.POWERUP_Z_INDEX + 10); // Above most game elements
        portal.setScale(0.1); // Start small

        // Add rotation animation
        this.scene.tweens.add({
            targets: portal,
            angle: 360,
            duration: 10000,
            repeat: -1
        });

        // Add pulsing effect
        this.scene.tweens.add({
            targets: portal,
            scale: 1.2,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add particle effects around the portal
        const particles = this.scene.add.particles('star-particle');

        // Orbiting particles
        const orbiter = particles.createEmitter({
            x: x,
            y: y,
            speed: 100,
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 2,
            tint: [0x66ccff, 0x3366ff, 0xffffff],
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Circle(0, 0, 70),
                quantity: 32
            }
        });

        // Inward flowing particles
        const inflow = particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 100 },
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 1,
            tint: [0x66ccff, 0x3366ff, 0xffffff],
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Circle(0, 0, 100),
                quantity: 48
            },
            accelerationX: { min: -100, max: 100 },
            accelerationY: { min: -100, max: 100 }
        });

        // Create a flash effect
        this.createFlash(x, y, 'medium');

        // Add screen shake
        this.createScreenShake(0.005, 300);

        // Store emitters with the portal for later cleanup
        portal.particles = particles;
        portal.emitters = [orbiter, inflow];

        return portal;
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
