/**
 * Device Detector
 * Utility for detecting device type and capabilities
 */
class DeviceDetector {
    /**
     * Initialize the device detector
     */
    constructor() {
        this.isMobile = this.detectMobile();
        this.isIOS = this.detectIOS();
        this.isAndroid = this.detectAndroid();
        this.hasTouch = this.detectTouch();
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.pixelRatio = window.devicePixelRatio || 1;
        
        // Listen for orientation changes
        window.addEventListener('resize', () => this.handleResize());
        
        console.log(`Device detected: ${this.getDeviceInfo()}`);
    }
    
    /**
     * Get detailed device information
     * @returns {string} Device information string
     */
    getDeviceInfo() {
        return `Mobile: ${this.isMobile}, iOS: ${this.isIOS}, Android: ${this.isAndroid}, Touch: ${this.hasTouch}, ` +
               `Screen: ${this.screenWidth}x${this.screenHeight}, Ratio: ${this.pixelRatio}`;
    }
    
    /**
     * Detect if the device is mobile
     * @returns {boolean} True if mobile device
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 800 && window.innerHeight <= 900);
    }
    
    /**
     * Detect if the device is iOS
     * @returns {boolean} True if iOS device
     */
    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    
    /**
     * Detect if the device is Android
     * @returns {boolean} True if Android device
     */
    detectAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    
    /**
     * Detect if the device has touch capabilities
     * @returns {boolean} True if touch is available
     */
    detectTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    /**
     * Handle window resize or orientation change
     */
    handleResize() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        
        // Dispatch a custom event that game components can listen for
        const event = new CustomEvent('game-resize', {
            detail: {
                width: this.screenWidth,
                height: this.screenHeight,
                isPortrait: this.isPortrait()
            }
        });
        window.dispatchEvent(event);
        
        console.log(`Screen resized: ${this.screenWidth}x${this.screenHeight}, Portrait: ${this.isPortrait()}`);
    }
    
    /**
     * Check if the device is in portrait orientation
     * @returns {boolean} True if in portrait mode
     */
    isPortrait() {
        return this.screenHeight > this.screenWidth;
    }
    
    /**
     * Get the recommended game scale based on device
     * @returns {number} Recommended scale factor
     */
    getRecommendedScale() {
        if (this.isMobile) {
            // For mobile, scale based on screen size
            const baseWidth = 640; // Base game width
            const scale = this.screenWidth / baseWidth;
            return Math.min(Math.max(scale, 0.5), 1.2); // Clamp between 0.5 and 1.2
        }
        
        // For desktop, use pixel ratio with a cap
        return Math.min(this.pixelRatio, 2);
    }
    
    /**
     * Get recommended performance settings based on device
     * @returns {Object} Performance settings
     */
    getPerformanceProfile() {
        // Default high performance settings
        const profile = {
            particleMultiplier: 1.0,
            maxParticles: 200,
            shadowQuality: 'high',
            backgroundDetail: 'high',
            antialiasing: true,
            maxEnemiesOnScreen: 20,
            usePostProcessing: true
        };
        
        // Adjust for mobile
        if (this.isMobile) {
            // Lower settings for mobile
            profile.particleMultiplier = 0.5;
            profile.maxParticles = 100;
            profile.shadowQuality = 'low';
            profile.backgroundDetail = 'medium';
            profile.antialiasing = false;
            profile.maxEnemiesOnScreen = 12;
            profile.usePostProcessing = false;
            
            // Further reduce for low-end devices
            if (this.pixelRatio < 2 || this.screenWidth < 400) {
                profile.particleMultiplier = 0.3;
                profile.maxParticles = 50;
                profile.backgroundDetail = 'low';
                profile.maxEnemiesOnScreen = 8;
            }
        }
        
        return profile;
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.DeviceDetector = DeviceDetector;
}
