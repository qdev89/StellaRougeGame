/**
 * Performance Optimizer
 * Handles performance optimizations for different devices
 */
class PerformanceOptimizer {
    /**
     * Initialize the performance optimizer
     * @param {Phaser.Game} game - The Phaser game instance
     */
    constructor(game) {
        this.game = game;
        this.deviceDetector = game.deviceDetector || (typeof DeviceDetector !== 'undefined' ? new DeviceDetector() : null);
        
        // Default settings
        this.settings = {
            particleMultiplier: 1.0,
            maxParticles: 200,
            shadowQuality: 'high',
            backgroundDetail: 'high',
            antialiasing: true,
            maxEnemiesOnScreen: 20,
            usePostProcessing: true,
            textureQuality: 'high',
            drawDistance: 'far',
            updateRate: 'normal',
            cacheSprites: true,
            useLightEffects: true,
            useBlur: true,
            useGlow: true,
            maxDebris: 50,
            maxProjectiles: 100,
            maxExplosions: 10,
            cullDistance: 1000,
            useCompressedTextures: false,
            batchSize: 512
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the optimizer
     */
    init() {
        // Detect device capabilities
        this.detectCapabilities();
        
        // Apply optimizations
        this.applyOptimizations();
        
        // Listen for resize events
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.handleResize());
        }
        
        console.log('Performance optimizer initialized with profile:', this.settings);
    }
    
    /**
     * Detect device capabilities
     */
    detectCapabilities() {
        // Use device detector if available
        if (this.deviceDetector) {
            // Get performance profile from device detector
            const profile = this.deviceDetector.getPerformanceProfile();
            this.settings = { ...this.settings, ...profile };
        } else {
            // Fallback detection
            this.detectFallback();
        }
        
        // Additional detection
        this.detectGPUCapabilities();
    }
    
    /**
     * Fallback device detection
     */
    detectFallback() {
        // Check if mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Check pixel ratio
        const pixelRatio = window.devicePixelRatio || 1;
        
        // Check screen size
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Adjust settings based on detected capabilities
        if (isMobile) {
            // Lower settings for mobile
            this.settings.particleMultiplier = 0.5;
            this.settings.maxParticles = 100;
            this.settings.shadowQuality = 'low';
            this.settings.backgroundDetail = 'medium';
            this.settings.antialiasing = false;
            this.settings.maxEnemiesOnScreen = 12;
            this.settings.usePostProcessing = false;
            this.settings.textureQuality = 'medium';
            this.settings.drawDistance = 'medium';
            this.settings.updateRate = 'low';
            this.settings.useLightEffects = false;
            this.settings.useBlur = false;
            this.settings.useGlow = false;
            this.settings.maxDebris = 20;
            this.settings.maxProjectiles = 50;
            this.settings.maxExplosions = 5;
            this.settings.cullDistance = 800;
            this.settings.useCompressedTextures = true;
            this.settings.batchSize = 256;
            
            // Further reduce for low-end devices
            if (pixelRatio < 2 || screenWidth < 400) {
                this.settings.particleMultiplier = 0.3;
                this.settings.maxParticles = 50;
                this.settings.backgroundDetail = 'low';
                this.settings.maxEnemiesOnScreen = 8;
                this.settings.textureQuality = 'low';
                this.settings.drawDistance = 'near';
                this.settings.updateRate = 'very-low';
                this.settings.maxDebris = 10;
                this.settings.maxProjectiles = 30;
                this.settings.maxExplosions = 3;
                this.settings.cullDistance = 600;
                this.settings.batchSize = 128;
            }
        }
    }
    
    /**
     * Detect GPU capabilities
     */
    detectGPUCapabilities() {
        // Try to get GPU info from WebGL
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    console.log('GPU detected:', renderer);
                    
                    // Check for known low-end GPUs
                    const isLowEnd = /Intel|HD Graphics|GMA|Mali-4|Adreno 3|PowerVR/i.test(renderer);
                    
                    // Check for known high-end GPUs
                    const isHighEnd = /NVIDIA|RTX|GTX|AMD|Radeon|Mali-G|Adreno 6|Apple GPU/i.test(renderer);
                    
                    // Adjust settings based on GPU
                    if (isLowEnd) {
                        this.settings.usePostProcessing = false;
                        this.settings.useLightEffects = false;
                        this.settings.useBlur = false;
                        this.settings.useGlow = false;
                        this.settings.antialiasing = false;
                        this.settings.textureQuality = 'low';
                    } else if (isHighEnd && !this.deviceDetector?.isMobile) {
                        // Boost settings for high-end desktop GPUs
                        this.settings.particleMultiplier = 1.2;
                        this.settings.maxParticles = 300;
                        this.settings.usePostProcessing = true;
                        this.settings.useLightEffects = true;
                    }
                }
                
                // Check available memory (Chrome only)
                if (gl.getParameter) {
                    try {
                        const memory = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                        if (memory < 4096) {
                            // Very limited texture memory
                            this.settings.textureQuality = 'low';
                            this.settings.useCompressedTextures = true;
                        }
                    } catch (e) {
                        // Ignore errors
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to detect GPU capabilities:', e);
        }
    }
    
    /**
     * Apply performance optimizations
     */
    applyOptimizations() {
        // Apply to game config if possible
        if (this.game.config) {
            // Antialiasing
            if (this.game.config.render && this.game.config.render.antialias !== undefined) {
                this.game.config.render.antialias = this.settings.antialiasing;
            }
            
            // Batch size
            if (this.game.config.render && this.game.config.render.batchSize !== undefined) {
                this.game.config.render.batchSize = this.settings.batchSize;
            }
        }
        
        // Apply to game renderer if available
        if (this.game.renderer) {
            // Antialiasing
            if (this.game.renderer.config && this.game.renderer.config.antialias !== undefined) {
                this.game.renderer.config.antialias = this.settings.antialiasing;
            }
        }
        
        // Apply to active scenes
        this.applyToScenes();
    }
    
    /**
     * Apply optimizations to all active scenes
     */
    applyToScenes() {
        if (!this.game.scene) return;
        
        // Get all active scenes
        const scenes = this.game.scene.scenes;
        
        // Apply optimizations to each scene
        scenes.forEach(scene => {
            if (scene.sys && scene.sys.settings.active) {
                this.applyToScene(scene);
            }
        });
    }
    
    /**
     * Apply optimizations to a specific scene
     * @param {Phaser.Scene} scene - The scene to optimize
     */
    applyToScene(scene) {
        // Skip if scene is not fully initialized
        if (!scene.sys || !scene.sys.settings.active) return;
        
        // Optimize particle systems
        this.optimizeParticles(scene);
        
        // Optimize physics
        this.optimizePhysics(scene);
        
        // Optimize rendering
        this.optimizeRendering(scene);
        
        // Set scene data for other systems to use
        scene.performanceSettings = this.settings;
        
        // Emit event for scene components to respond to
        scene.events.emit('performance-optimized', this.settings);
    }
    
    /**
     * Optimize particle systems in a scene
     * @param {Phaser.Scene} scene - The scene to optimize
     */
    optimizeParticles(scene) {
        // Find particle emitters
        if (scene.particles) {
            const emitters = scene.particles.emitters;
            if (emitters && emitters.getAll) {
                const allEmitters = emitters.getAll();
                
                // Adjust each emitter
                allEmitters.forEach(emitter => {
                    // Reduce particle count
                    if (emitter.maxParticles) {
                        const newMax = Math.floor(emitter.maxParticles * this.settings.particleMultiplier);
                        emitter.setMaxParticles(newMax);
                    }
                    
                    // Reduce frequency on mobile
                    if (this.deviceDetector && this.deviceDetector.isMobile && emitter.frequency) {
                        // Increase frequency (higher number = less frequent)
                        emitter.frequency *= 1.5;
                    }
                });
            }
        }
    }
    
    /**
     * Optimize physics in a scene
     * @param {Phaser.Scene} scene - The scene to optimize
     */
    optimizePhysics(scene) {
        // Adjust physics settings if available
        if (scene.physics && scene.physics.world) {
            const world = scene.physics.world;
            
            // Adjust update rate for mobile
            if (this.deviceDetector && this.deviceDetector.isMobile) {
                // Reduce physics steps on mobile
                if (world.fps) {
                    // Map update rate to FPS
                    const fpsMap = {
                        'normal': 60,
                        'low': 45,
                        'very-low': 30
                    };
                    
                    const targetFps = fpsMap[this.settings.updateRate] || 60;
                    world.setFPS(targetFps);
                }
            }
            
            // Set debug settings
            if (world.debugGraphic) {
                world.debugGraphic.clear();
                world.drawDebug = false;
            }
        }
    }
    
    /**
     * Optimize rendering in a scene
     * @param {Phaser.Scene} scene - The scene to optimize
     */
    optimizeRendering(scene) {
        // Adjust camera settings
        if (scene.cameras && scene.cameras.main) {
            const camera = scene.cameras.main;
            
            // Disable unnecessary camera effects on mobile
            if (this.deviceDetector && this.deviceDetector.isMobile) {
                // Remove any flash/fade/shake effects
                camera.resetFX();
                
                // Disable camera culling for better performance
                camera.disableCull = false;
                
                // Set reasonable cull padding
                camera.cullPadding = 0;
            }
        }
    }
    
    /**
     * Handle resize events
     */
    handleResize() {
        // Re-detect capabilities
        this.detectCapabilities();
        
        // Re-apply optimizations
        this.applyOptimizations();
    }
    
    /**
     * Get current performance settings
     * @returns {Object} Current performance settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Update a specific setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    updateSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            
            // Re-apply optimizations
            this.applyOptimizations();
        }
    }
    
    /**
     * Get recommended texture quality based on device
     * @param {string} textureKey - Base texture key
     * @returns {string} Texture key with appropriate quality suffix
     */
    getTextureQuality(textureKey) {
        // Add quality suffix based on settings
        const quality = this.settings.textureQuality;
        
        if (quality === 'low') {
            return `${textureKey}-low`;
        } else if (quality === 'medium') {
            return `${textureKey}-med`;
        }
        
        // Default to high quality
        return textureKey;
    }
    
    /**
     * Get recommended particle count for an effect
     * @param {number} baseCount - Base particle count
     * @returns {number} Adjusted particle count
     */
    getParticleCount(baseCount) {
        return Math.floor(baseCount * this.settings.particleMultiplier);
    }
    
    /**
     * Check if a specific effect should be enabled
     * @param {string} effectType - Type of effect to check
     * @returns {boolean} Whether the effect should be enabled
     */
    shouldEnableEffect(effectType) {
        switch (effectType) {
            case 'postprocessing':
                return this.settings.usePostProcessing;
            case 'light':
                return this.settings.useLightEffects;
            case 'blur':
                return this.settings.useBlur;
            case 'glow':
                return this.settings.useGlow;
            case 'shadow':
                return this.settings.shadowQuality !== 'off';
            default:
                return true;
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
}
