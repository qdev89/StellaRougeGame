/**
 * Sound Manager
 * Centralized system for handling all game audio
 * Currently disabled for this phase of development
 */
class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false; // Sound is disabled for now
    }

    /**
     * Play a sound effect if enabled
     * @param {string} key - The sound key to play
     * @param {object} config - Configuration options for the sound
     * @returns {Phaser.Sound.BaseSound|null} - The sound object or null if disabled
     */
    play(key, config = {}) {
        // Sound is disabled, so return null
        return null;
    }

    /**
     * Play background music if enabled
     * @param {string} key - The music key to play
     * @param {object} config - Configuration options for the music
     * @returns {Phaser.Sound.BaseSound|null} - The music object or null if disabled
     */
    playMusic(key, config = {}) {
        // Music is disabled, so return null
        return null;
    }

    /**
     * Stop a sound or music
     * @param {string} key - The sound key to stop
     */
    stop(key) {
        // No-op since sound is disabled
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        // No-op since sound is disabled
    }

    /**
     * Check if a sound exists
     * @param {string} key - The sound key to check
     * @returns {boolean} - Whether the sound exists
     */
    exists(key) {
        // Always return false since sound is disabled
        return false;
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
