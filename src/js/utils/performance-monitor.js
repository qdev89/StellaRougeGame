/**
 * Performance Monitoring System for STELLAR ROGUE
 * Tracks and optimizes game performance
 */
class PerformanceMonitor {
    constructor() {
        this.enabled = false;
        this.metrics = {
            fps: [],
            drawCalls: 0,
            activeEntities: 0,
            particleCount: 0,
            memoryUsage: 0
        };
        this.fpsHistory = [];
        this.maxHistoryLength = 60; // Keep 60 frames of history
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.displayElement = null;

        // Performance thresholds
        this.thresholds = {
            fps: {
                good: 55,
                warning: 40,
                critical: 25
            },
            entities: {
                good: 50,
                warning: 100,
                critical: 150
            },
            particles: {
                good: 100,
                warning: 200,
                critical: 300
            }
        };

        // Optimization settings
        this.qualitySettings = {
            particles: 'high', // high, medium, low
            effects: 'high',
            maxEnemies: 20,
            maxParticles: 200
        };

        this.initialize();
    }

    /**
     * Initialize performance monitoring
     */
    initialize() {
        // Check if performance monitoring is enabled
        const urlParams = new URLSearchParams(window.location.search);
        const perfParam = urlParams.get('performance');

        if (perfParam === 'true') {
            this.enabled = true;
            this.createDisplayElement();
        }

        // Set up auto-optimization if enabled
        const autoOptimize = urlParams.get('autoOptimize');
        if (autoOptimize === 'true') {
            this.enableAutoOptimization();
        }
    }

    /**
     * Create display element for performance metrics
     */
    createDisplayElement() {
        this.displayElement = document.createElement('div');
        this.displayElement.id = 'performance-monitor';
        this.displayElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border: 1px solid #00ff00;
            min-width: 200px;
        `;
        document.body.appendChild(this.displayElement);
    }

    /**
     * Update performance metrics
     * @param {object} scene - Phaser scene
     */
    update(scene) {
        if (!this.enabled) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Calculate FPS
        const fps = Math.round(1000 / deltaTime);
        this.fpsHistory.push(fps);

        // Keep only recent history
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }

        // Update metrics
        this.metrics.fps = this.fpsHistory;
        this.metrics.activeEntities = this.countActiveEntities(scene);
        this.metrics.particleCount = this.countParticles(scene);

        // Update memory usage if available
        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // Convert to MB
        }

        // Update display
        this.updateDisplay();

        // Check for performance issues
        this.checkPerformance();

        this.frameCount++;
    }

    /**
     * Count active entities in the scene
     * @param {object} scene - Phaser scene
     * @returns {number} Number of active entities
     */
    countActiveEntities(scene) {
        if (!scene || !scene.children) return 0;

        let count = 0;
        scene.children.list.forEach(child => {
            if (child.active) count++;
        });

        return count;
    }

    /**
     * Count active particles in the scene
     * @param {object} scene - Phaser scene
     * @returns {number} Number of active particles
     */
    countParticles(scene) {
        if (!scene || !scene.children) return 0;

        let count = 0;
        scene.children.list.forEach(child => {
            if (child.type === 'ParticleEmitterManager') {
                child.emitters.list.forEach(emitter => {
                    count += emitter.getAliveParticleCount();
                });
            }
        });

        return count;
    }

    /**
     * Update performance display
     */
    updateDisplay() {
        if (!this.displayElement) return;

        const avgFps = this.getAverageFPS();
        const fpsColor = this.getFPSColor(avgFps);

        let html = `<div style="margin-bottom: 5px; font-weight: bold;">Performance Monitor</div>`;
        html += `<div style="color: ${fpsColor}">FPS: ${avgFps}</div>`;
        html += `<div>Entities: ${this.metrics.activeEntities}</div>`;
        html += `<div>Particles: ${this.metrics.particleCount}</div>`;

        if (this.metrics.memoryUsage > 0) {
            html += `<div>Memory: ${this.metrics.memoryUsage} MB</div>`;
        }

        html += `<div style="margin-top: 5px; font-size: 10px;">Quality: ${this.qualitySettings.particles}</div>`;

        this.displayElement.innerHTML = html;
    }

    /**
     * Get average FPS
     * @returns {number} Average FPS
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;

        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    /**
     * Get color based on FPS
     * @param {number} fps - Current FPS
     * @returns {string} Color code
     */
    getFPSColor(fps) {
        if (fps >= this.thresholds.fps.good) return '#00ff00';
        if (fps >= this.thresholds.fps.warning) return '#ffff00';
        return '#ff0000';
    }

    /**
     * Check for performance issues
     */
    checkPerformance() {
        const avgFps = this.getAverageFPS();

        // Log performance warnings
        if (avgFps < this.thresholds.fps.warning && this.frameCount % 60 === 0) {
            console.warn('Performance Warning: Low FPS detected -', avgFps);
        }

        if (this.metrics.activeEntities > this.thresholds.entities.warning) {
            console.warn('Performance Warning: High entity count -', this.metrics.activeEntities);
        }

        if (this.metrics.particleCount > this.thresholds.particles.warning) {
            console.warn('Performance Warning: High particle count -', this.metrics.particleCount);
        }
    }

    /**
     * Enable auto-optimization
     */
    enableAutoOptimization() {
        setInterval(() => {
            const avgFps = this.getAverageFPS();

            // Auto-adjust quality based on FPS
            if (avgFps < this.thresholds.fps.critical) {
                this.setQuality('low');
            } else if (avgFps < this.thresholds.fps.warning) {
                this.setQuality('medium');
            } else if (avgFps >= this.thresholds.fps.good) {
                this.setQuality('high');
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Set quality level
     * @param {string} level - Quality level (high, medium, low)
     */
    setQuality(level) {
        if (this.qualitySettings.particles === level) return;

        this.qualitySettings.particles = level;
        this.qualitySettings.effects = level;

        switch (level) {
            case 'low':
                this.qualitySettings.maxEnemies = 10;
                this.qualitySettings.maxParticles = 50;
                break;
            case 'medium':
                this.qualitySettings.maxEnemies = 15;
                this.qualitySettings.maxParticles = 100;
                break;
            case 'high':
                this.qualitySettings.maxEnemies = 20;
                this.qualitySettings.maxParticles = 200;
                break;
        }

        console.log('Quality adjusted to:', level);
    }

    /**
     * Get quality settings
     * @returns {object} Current quality settings
     */
    getQualitySettings() {
        return { ...this.qualitySettings };
    }

    /**
     * Get performance report
     * @returns {object} Performance report
     */
    getReport() {
        return {
            averageFPS: this.getAverageFPS(),
            minFPS: Math.min(...this.fpsHistory),
            maxFPS: Math.max(...this.fpsHistory),
            activeEntities: this.metrics.activeEntities,
            particleCount: this.metrics.particleCount,
            memoryUsage: this.metrics.memoryUsage,
            qualitySettings: this.qualitySettings,
            frameCount: this.frameCount
        };
    }

    /**
     * Enable/disable performance monitoring
     * @param {boolean} enabled - Whether to enable monitoring
     */
    setEnabled(enabled) {
        this.enabled = enabled;

        if (enabled && !this.displayElement) {
            this.createDisplayElement();
        } else if (!enabled && this.displayElement) {
            this.displayElement.remove();
            this.displayElement = null;
        }
    }

    /**
     * Reset performance metrics
     */
    reset() {
        this.fpsHistory = [];
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
}
