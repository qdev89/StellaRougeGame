/**
 * Enhanced Nemesis Visual Effects Manager
 * Provides advanced visual effects for the Nemesis boss
 */
class NemesisEnhancedEffects {
    constructor(scene, boss) {
        this.scene = scene;
        this.boss = boss;
        
        // Effect containers
        this.effectsContainer = scene.add.container(0, 0);
        this.effectsContainer.setDepth(100);
        
        // Particle emitters
        this.emitters = {};
        
        // Active effects
        this.activeEffects = {};
        
        // Initialize effects
        this.initializeEffects();
    }
    
    /**
     * Initialize all visual effects
     */
    initializeEffects() {
        // Create particle emitters for different effects
        this.createParticleEmitters();
        
        // Create shader effects
        this.createShaderEffects();
    }
    
    /**
     * Create particle emitters for different effects
     */
    createParticleEmitters() {
        // Core particles (always present)
        this.emitters.core = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 20, max: 50 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 1,
            frequency: 50,
            alpha: { start: 0.6, end: 0 },
            on: false
        });
        
        // Adaptation particles (when adapting to player attacks)
        this.emitters.adaptation = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 50, max: 100 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 2,
            frequency: 20,
            tint: 0xff33ff,
            on: false
        });
        
        // Morphing particles (when changing forms)
        this.emitters.morphing = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 1200,
            quantity: 5,
            frequency: 10,
            tint: 0x33ffff,
            on: false
        });
        
        // Phase transition particles (when changing phases)
        this.emitters.phaseTransition = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 150, max: 300 },
            scale: { start: 1.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 1500,
            quantity: 10,
            frequency: 5,
            tint: 0xffff33,
            on: false
        });
        
        // Damage particles (when taking damage)
        this.emitters.damage = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 80, max: 150 },
            scale: { start: 0.7, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            quantity: 3,
            frequency: 30,
            tint: 0xff3333,
            on: false
        });
        
        // Attack particles (when attacking)
        this.emitters.attack = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 60, max: 120 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 2,
            frequency: 40,
            tint: 0x33ff33,
            on: false
        });
        
        // Death particles (when defeated)
        this.emitters.death = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 200, max: 400 },
            scale: { start: 1.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            quantity: 20,
            frequency: 5,
            tint: 0xffffff,
            on: false
        });
    }
    
    /**
     * Create shader effects for the Nemesis
     */
    createShaderEffects() {
        // Create graphics objects for shader effects
        this.shieldEffect = this.scene.add.graphics();
        this.auraEffect = this.scene.add.graphics();
        this.pulseEffect = this.scene.add.graphics();
        
        // Add to effects container
        this.effectsContainer.add(this.shieldEffect);
        this.effectsContainer.add(this.auraEffect);
        this.effectsContainer.add(this.pulseEffect);
    }
    
    /**
     * Update all active effects
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update position to follow the boss
        if (this.boss && this.boss.active) {
            this.updatePosition();
            this.updateShaderEffects(time, delta);
        }
    }
    
    /**
     * Update position to follow the boss
     */
    updatePosition() {
        // Update emitter positions
        Object.values(this.emitters).forEach(emitter => {
            emitter.setPosition(this.boss.x, this.boss.y);
        });
        
        // Update shader effect positions
        this.shieldEffect.x = this.boss.x;
        this.shieldEffect.y = this.boss.y;
        this.auraEffect.x = this.boss.x;
        this.auraEffect.y = this.boss.y;
        this.pulseEffect.x = this.boss.x;
        this.pulseEffect.y = this.boss.y;
    }
    
    /**
     * Update shader effects
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateShaderEffects(time, delta) {
        // Clear previous graphics
        this.shieldEffect.clear();
        this.auraEffect.clear();
        this.pulseEffect.clear();
        
        // Update shield effect if active
        if (this.activeEffects.shield) {
            this.updateShieldEffect(time);
        }
        
        // Update aura effect if active
        if (this.activeEffects.aura) {
            this.updateAuraEffect(time);
        }
        
        // Update pulse effect if active
        if (this.activeEffects.pulse) {
            this.updatePulseEffect(time);
        }
    }
    
    /**
     * Update shield effect
     * @param {number} time - Current time
     */
    updateShieldEffect(time) {
        const shieldData = this.activeEffects.shield;
        const radius = shieldData.radius + Math.sin(time * 0.002) * 5;
        const alpha = shieldData.alpha + Math.sin(time * 0.003) * 0.1;
        
        // Draw shield
        this.shieldEffect.fillStyle(shieldData.color, alpha);
        this.shieldEffect.fillCircle(0, 0, radius);
        
        // Draw shield border
        this.shieldEffect.lineStyle(3, 0xffffff, alpha + 0.2);
        this.shieldEffect.strokeCircle(0, 0, radius);
        
        // Draw shield pattern
        this.shieldEffect.lineStyle(1, 0xffffff, alpha * 0.7);
        for (let i = 0; i < 360; i += 45) {
            const angle = Phaser.Math.DegToRad(i + (time * 0.02));
            const x1 = Math.cos(angle) * (radius * 0.7);
            const y1 = Math.sin(angle) * (radius * 0.7);
            const x2 = Math.cos(angle) * radius;
            const y2 = Math.sin(angle) * radius;
            
            this.shieldEffect.beginPath();
            this.shieldEffect.moveTo(x1, y1);
            this.shieldEffect.lineTo(x2, y2);
            this.shieldEffect.closePath();
            this.shieldEffect.strokePath();
        }
    }
    
    /**
     * Update aura effect
     * @param {number} time - Current time
     */
    updateAuraEffect(time) {
        const auraData = this.activeEffects.aura;
        const radius = auraData.radius + Math.sin(time * 0.001) * 10;
        const alpha = auraData.alpha + Math.sin(time * 0.002) * 0.1;
        
        // Draw aura
        this.auraEffect.fillStyle(auraData.color, alpha * 0.3);
        this.auraEffect.fillCircle(0, 0, radius);
        
        // Draw aura waves
        for (let i = 0; i < 3; i++) {
            const waveRadius = radius * (0.6 + (i * 0.2));
            const waveAlpha = alpha * (0.5 - (i * 0.1));
            
            this.auraEffect.lineStyle(2, auraData.color, waveAlpha);
            this.auraEffect.strokeCircle(0, 0, waveRadius);
        }
    }
    
    /**
     * Update pulse effect
     * @param {number} time - Current time
     */
    updatePulseEffect(time) {
        const pulseData = this.activeEffects.pulse;
        const radius = pulseData.radius * (1 + Math.sin(time * 0.003) * 0.2);
        const alpha = pulseData.alpha * (0.5 + Math.sin(time * 0.004) * 0.5);
        
        // Draw pulse
        this.pulseEffect.fillStyle(pulseData.color, alpha * 0.2);
        this.pulseEffect.fillCircle(0, 0, radius);
        
        // Draw pulse lines
        this.pulseEffect.lineStyle(2, pulseData.color, alpha);
        for (let i = 0; i < 8; i++) {
            const angle = Phaser.Math.DegToRad(i * 45 + (time * 0.05));
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            this.pulseEffect.beginPath();
            this.pulseEffect.moveTo(0, 0);
            this.pulseEffect.lineTo(x, y);
            this.pulseEffect.closePath();
            this.pulseEffect.strokePath();
        }
    }
    
    /**
     * Show core particles effect
     * @param {object} options - Effect options
     */
    showCoreEffect(options = {}) {
        const defaults = {
            duration: 2000,
            color: 0x3366ff
        };
        
        const settings = { ...defaults, ...options };
        
        // Set emitter properties
        this.emitters.core.setTint(settings.color);
        this.emitters.core.setPosition(this.boss.x, this.boss.y);
        this.emitters.core.start();
        
        // Stop after duration
        if (settings.duration > 0) {
            this.scene.time.delayedCall(settings.duration, () => {
                this.emitters.core.stop();
            });
        }
    }
    
    /**
     * Show adaptation effect
     * @param {object} options - Effect options
     */
    showAdaptationEffect(options = {}) {
        const defaults = {
            duration: 1500,
            color: 0xff33ff
        };
        
        const settings = { ...defaults, ...options };
        
        // Set emitter properties
        this.emitters.adaptation.setTint(settings.color);
        this.emitters.adaptation.setPosition(this.boss.x, this.boss.y);
        this.emitters.adaptation.start();
        
        // Create shield effect
        this.activeEffects.shield = {
            radius: this.boss.width * 0.6,
            color: settings.color,
            alpha: 0.3
        };
        
        // Add a flash effect
        this.boss.setTint(settings.color);
        this.scene.time.delayedCall(300, () => {
            this.boss.clearTint();
        });
        
        // Stop after duration
        if (settings.duration > 0) {
            this.scene.time.delayedCall(settings.duration, () => {
                this.emitters.adaptation.stop();
                delete this.activeEffects.shield;
            });
        }
        
        // Add camera effects
        this.scene.cameras.main.shake(200, 0.005);
    }
    
    /**
     * Show morphing effect
     * @param {object} options - Effect options
     */
    showMorphingEffect(options = {}) {
        const defaults = {
            duration: 2000,
            color: 0x33ffff
        };
        
        const settings = { ...defaults, ...options };
        
        // Set emitter properties
        this.emitters.morphing.setTint(settings.color);
        this.emitters.morphing.setPosition(this.boss.x, this.boss.y);
        this.emitters.morphing.start();
        
        // Create aura effect
        this.activeEffects.aura = {
            radius: this.boss.width * 0.8,
            color: settings.color,
            alpha: 0.4
        };
        
        // Add a flash effect
        this.boss.setTint(settings.color);
        this.scene.time.delayedCall(500, () => {
            this.boss.clearTint();
        });
        
        // Stop after duration
        if (settings.duration > 0) {
            this.scene.time.delayedCall(settings.duration, () => {
                this.emitters.morphing.stop();
                delete this.activeEffects.aura;
            });
        }
        
        // Add camera effects
        this.scene.cameras.main.flash(300, 100, 255, 255, 0.3);
        this.scene.cameras.main.shake(300, 0.01);
    }
    
    /**
     * Show phase transition effect
     * @param {object} options - Effect options
     */
    showPhaseTransitionEffect(options = {}) {
        const defaults = {
            duration: 3000,
            color: 0xffff33
        };
        
        const settings = { ...defaults, ...options };
        
        // Set emitter properties
        this.emitters.phaseTransition.setTint(settings.color);
        this.emitters.phaseTransition.setPosition(this.boss.x, this.boss.y);
        this.emitters.phaseTransition.start();
        
        // Create pulse effect
        this.activeEffects.pulse = {
            radius: this.boss.width * 1.2,
            color: settings.color,
            alpha: 0.5
        };
        
        // Add a flash effect
        this.boss.setTint(settings.color);
        this.scene.time.delayedCall(800, () => {
            this.boss.clearTint();
        });
        
        // Stop after duration
        if (settings.duration > 0) {
            this.scene.time.delayedCall(settings.duration, () => {
                this.emitters.phaseTransition.stop();
                delete this.activeEffects.pulse;
            });
        }
        
        // Add camera effects
        this.scene.cameras.main.flash(500, 255, 255, 100, 0.4);
        this.scene.cameras.main.shake(500, 0.02);
    }
    
    /**
     * Show damage effect
     * @param {object} options - Effect options
     */
    showDamageEffect(options = {}) {
        const defaults = {
            duration: 500,
            color: 0xff3333
        };
        
        const settings = { ...defaults, ...options };
        
        // Set emitter properties
        this.emitters.damage.setTint(settings.color);
        this.emitters.damage.setPosition(this.boss.x, this.boss.y);
        this.emitters.damage.start();
        
        // Add a flash effect
        this.boss.setTint(settings.color);
        this.scene.time.delayedCall(100, () => {
            this.boss.clearTint();
        });
        
        // Stop after duration
        if (settings.duration > 0) {
            this.scene.time.delayedCall(settings.duration, () => {
                this.emitters.damage.stop();
            });
        }
    }
    
    /**
     * Show attack effect
     * @param {object} options - Effect options
     */
    showAttackEffect(options = {}) {
        const defaults = {
            duration: 800,
            color: 0x33ff33
        };
        
        const settings = { ...defaults, ...options };
        
        // Set emitter properties
        this.emitters.attack.setTint(settings.color);
        this.emitters.attack.setPosition(this.boss.x, this.boss.y);
        this.emitters.attack.start();
        
        // Stop after duration
        if (settings.duration > 0) {
            this.scene.time.delayedCall(settings.duration, () => {
                this.emitters.attack.stop();
            });
        }
    }
    
    /**
     * Show death effect
     * @param {object} options - Effect options
     */
    showDeathEffect(options = {}) {
        const defaults = {
            duration: 3000,
            color: 0xffffff
        };
        
        const settings = { ...defaults, ...options };
        
        // Set emitter properties
        this.emitters.death.setTint(settings.color);
        this.emitters.death.setPosition(this.boss.x, this.boss.y);
        this.emitters.death.start();
        
        // Create all effects
        this.activeEffects.shield = {
            radius: this.boss.width * 0.6,
            color: settings.color,
            alpha: 0.5
        };
        
        this.activeEffects.aura = {
            radius: this.boss.width * 0.8,
            color: settings.color,
            alpha: 0.6
        };
        
        this.activeEffects.pulse = {
            radius: this.boss.width * 1.2,
            color: settings.color,
            alpha: 0.7
        };
        
        // Add a flash effect
        this.boss.setTint(settings.color);
        
        // Add camera effects
        this.scene.cameras.main.flash(1000, 255, 255, 255, 0.7);
        this.scene.cameras.main.shake(1000, 0.03);
        
        // Create explosion sequence
        this.scene.time.delayedCall(1000, () => {
            // Create multiple explosions
            for (let i = 0; i < 5; i++) {
                this.scene.time.delayedCall(i * 300, () => {
                    const offsetX = Phaser.Math.Between(-this.boss.width/2, this.boss.width/2);
                    const offsetY = Phaser.Math.Between(-this.boss.height/2, this.boss.height/2);
                    
                    this.createExplosion(this.boss.x + offsetX, this.boss.y + offsetY);
                });
            }
            
            // Final explosion
            this.scene.time.delayedCall(1500, () => {
                this.createExplosion(this.boss.x, this.boss.y, { scale: 2 });
                
                // Clear all effects
                this.scene.time.delayedCall(500, () => {
                    this.clearAllEffects();
                });
            });
        });
    }
    
    /**
     * Create an explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} options - Explosion options
     */
    createExplosion(x, y, options = {}) {
        const defaults = {
            scale: 1,
            color: 0xffffff
        };
        
        const settings = { ...defaults, ...options };
        
        // Create explosion particles
        const explosion = this.scene.add.particles('particle-blue').createEmitter({
            x: x,
            y: y,
            speed: { min: 100 * settings.scale, max: 300 * settings.scale },
            scale: { start: 1 * settings.scale, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 20,
            tint: settings.color
        });
        
        // Create flash
        const flash = this.scene.add.circle(x, y, 30 * settings.scale, 0xffffff, 1);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 3,
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Auto-destroy particles
        this.scene.time.delayedCall(800, () => {
            explosion.stop();
            this.scene.time.delayedCall(800, () => {
                explosion.remove();
            });
        });
        
        // Add camera shake
        this.scene.cameras.main.shake(300, 0.01 * settings.scale);
    }
    
    /**
     * Clear all active effects
     */
    clearAllEffects() {
        // Stop all emitters
        Object.values(this.emitters).forEach(emitter => {
            emitter.stop();
        });
        
        // Clear all active effects
        this.activeEffects = {};
        
        // Clear graphics
        this.shieldEffect.clear();
        this.auraEffect.clear();
        this.pulseEffect.clear();
    }
    
    /**
     * Destroy all effects and clean up
     */
    destroy() {
        // Clear all effects
        this.clearAllEffects();
        
        // Destroy all emitters
        Object.values(this.emitters).forEach(emitter => {
            emitter.remove();
        });
        
        // Destroy graphics
        this.shieldEffect.destroy();
        this.auraEffect.destroy();
        this.pulseEffect.destroy();
        
        // Destroy container
        this.effectsContainer.destroy();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisEnhancedEffects = NemesisEnhancedEffects;
}
