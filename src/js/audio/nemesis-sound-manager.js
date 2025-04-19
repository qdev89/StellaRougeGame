/**
 * Nemesis Sound Manager
 * Manages sound effects for the Nemesis boss
 * Note: Currently disabled but ready for when sound is re-enabled
 */
class NemesisSoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.enabled = false; // Sound is currently disabled
        
        // Initialize sounds if enabled
        if (this.enabled) {
            this.initializeSounds();
        }
    }
    
    /**
     * Initialize all sound effects
     */
    initializeSounds() {
        // Attack sounds
        this.loadSound('adaptive', 'adaptive-attack');
        this.loadSound('phaseShift', 'phase-shift');
        this.loadSound('beam', 'beam-attack');
        this.loadSound('shield', 'shield-activate');
        this.loadSound('drones', 'drones-deploy');
        this.loadSound('mines', 'mines-deploy');
        this.loadSound('artillery', 'artillery-fire');
        this.loadSound('spread', 'spread-attack');
        this.loadSound('cloak', 'cloak-activate');
        this.loadSound('bombs', 'bomb-drop');
        
        // Impact sounds
        this.loadSound('explosion', 'explosion');
        this.loadSound('hit', 'hit');
        this.loadSound('shield-hit', 'shield-hit');
        
        // State change sounds
        this.loadSound('morph', 'morph');
        this.loadSound('phase-transition', 'phase-transition');
        this.loadSound('death', 'death');
        
        // Ambient sounds
        this.loadSound('nemesis-ambient', 'nemesis-ambient', true);
    }
    
    /**
     * Load a sound effect
     * @param {string} key - Key to reference the sound
     * @param {string} assetKey - Asset key in the scene
     * @param {boolean} loop - Whether the sound should loop
     */
    loadSound(key, assetKey, loop = false) {
        if (!this.enabled) return;
        
        try {
            // Create sound with configuration
            this.sounds[key] = this.scene.sound.add(assetKey, {
                volume: 0.5,
                loop: loop
            });
            
            console.log(`Loaded sound: ${key}`);
        } catch (error) {
            console.warn(`Failed to load sound: ${key}`, error);
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} key - Key of the sound to play
     * @param {object} options - Options for playing the sound
     */
    play(key, options = {}) {
        // Skip if sound is disabled
        if (!this.enabled) return;
        
        // Skip if sound doesn't exist
        if (!this.sounds[key]) {
            console.warn(`Sound not found: ${key}`);
            return;
        }
        
        // Default options
        const config = {
            volume: options.volume || 0.5,
            detune: options.detune || 0,
            seek: options.seek || 0,
            loop: options.loop || false,
            delay: options.delay || 0
        };
        
        // Play the sound
        try {
            this.sounds[key].play(config);
        } catch (error) {
            console.warn(`Failed to play sound: ${key}`, error);
        }
    }
    
    /**
     * Stop a sound effect
     * @param {string} key - Key of the sound to stop
     */
    stop(key) {
        // Skip if sound is disabled
        if (!this.enabled) return;
        
        // Skip if sound doesn't exist
        if (!this.sounds[key]) {
            console.warn(`Sound not found: ${key}`);
            return;
        }
        
        // Stop the sound
        try {
            this.sounds[key].stop();
        } catch (error) {
            console.warn(`Failed to stop sound: ${key}`, error);
        }
    }
    
    /**
     * Play an attack sound
     * @param {string} attackType - Type of attack
     */
    playAttackSound(attackType) {
        this.play(attackType);
    }
    
    /**
     * Play an explosion sound with random variation
     */
    playExplosionSound() {
        this.play('explosion', {
            volume: 0.6,
            detune: Math.random() * 200 - 100 // Random pitch variation
        });
    }
    
    /**
     * Play a hit sound
     * @param {boolean} shielded - Whether the hit is on a shield
     */
    playHitSound(shielded = false) {
        if (shielded) {
            this.play('shield-hit', { volume: 0.4 });
        } else {
            this.play('hit', { volume: 0.5 });
        }
    }
    
    /**
     * Play morph sound
     */
    playMorphSound() {
        this.play('morph', { volume: 0.7 });
    }
    
    /**
     * Play phase transition sound
     */
    playPhaseTransitionSound() {
        this.play('phase-transition', { volume: 0.8 });
    }
    
    /**
     * Play death sound
     */
    playDeathSound() {
        this.stop('nemesis-ambient');
        this.play('death', { volume: 1.0 });
    }
    
    /**
     * Start ambient sound
     */
    startAmbientSound() {
        this.play('nemesis-ambient', { volume: 0.3, loop: true });
    }
    
    /**
     * Stop ambient sound
     */
    stopAmbientSound() {
        this.stop('nemesis-ambient');
    }
    
    /**
     * Enable or disable all sounds
     * @param {boolean} enabled - Whether sounds should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        // Initialize sounds if being enabled
        if (enabled && Object.keys(this.sounds).length === 0) {
            this.initializeSounds();
        }
    }
    
    /**
     * Clean up all sounds
     */
    destroy() {
        // Stop all sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.stop) {
                sound.stop();
            }
        });
        
        // Clear sounds object
        this.sounds = {};
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisSoundManager = NemesisSoundManager;
}
