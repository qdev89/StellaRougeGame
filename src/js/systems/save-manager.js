/**
 * Save Manager
 * Handles saving and loading game data to/from localStorage
 */
class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'stellarRogue_saveData';
        this.settingsKey = 'stellarRogue_settings';
        this.statsKey = 'stellarRogue_statistics';

        // Initialize with default values
        this.initializeDefaults();
    }

    /**
     * Initialize default values for a new game
     */
    initializeDefaults() {
        // Default meta-progression data
        this.defaultMetaProgress = {
            credits: 0,
            highestSector: 1,
            unlockedShips: ['fighter'],
            unlockedUpgrades: [],
            achievements: {}
        };

        // Default settings
        this.defaultSettings = {
            soundVolume: 0, // Sound is disabled
            musicVolume: 0, // Music is disabled
            particleEffects: true,
            screenShake: true,
            difficulty: 'normal'
        };

        // Default statistics
        this.defaultStats = {
            totalRuns: 0,
            totalPlayTime: 0,
            highestScore: 0,
            enemiesDefeated: 0,
            bossesDefeated: 0,
            upgradesCollected: 0,
            itemsUsed: 0,
            deaths: 0
        };
    }

    /**
     * Save the current game state
     * @param {boolean} showFeedback - Whether to show save feedback
     * @returns {boolean} Success status
     */
    saveGame(showFeedback = true) {
        try {
            // Get current meta-progression data
            const metaProgress = this.game.global.metaProgress || this.defaultMetaProgress;

            // Create save data object
            const saveData = {
                metaProgress: metaProgress,
                timestamp: Date.now(),
                version: this.game.global.gameVersion || '1.0.0'
            };

            // Save to localStorage
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));

            // Show feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('Game saved successfully!');
            }

            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving game:', error);

            // Show error feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('Error saving game!', true);
            }

            return false;
        }
    }

    /**
     * Load saved game data
     * @param {boolean} showFeedback - Whether to show load feedback
     * @returns {boolean} Success status
     */
    loadGame(showFeedback = true) {
        try {
            // Get save data from localStorage
            const saveDataString = localStorage.getItem(this.saveKey);

            // If no save data exists, return false
            if (!saveDataString) {
                console.log('No save data found');
                return false;
            }

            // Parse save data
            const saveData = JSON.parse(saveDataString);

            // Validate save data
            if (!this.validateSaveData(saveData)) {
                console.error('Invalid save data');
                return false;
            }

            // Apply save data to game state
            this.game.global.metaProgress = saveData.metaProgress;

            // Show feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('Game loaded successfully!');
            }

            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading game:', error);

            // Show error feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('Error loading game!', true);
            }

            return false;
        }
    }

    /**
     * Save game settings
     * @param {Object} settings - Settings object
     * @returns {boolean} Success status
     */
    saveSettings(settings) {
        try {
            // Merge with default settings
            const mergedSettings = {...this.defaultSettings, ...settings};

            // Save to localStorage
            localStorage.setItem(this.settingsKey, JSON.stringify(mergedSettings));

            // Apply settings to game
            this.game.global.settings = mergedSettings;

            console.log('Settings saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    /**
     * Load game settings
     * @returns {Object} Settings object or default settings
     */
    loadSettings() {
        try {
            // Get settings from localStorage
            const settingsString = localStorage.getItem(this.settingsKey);

            // If no settings exist, return defaults
            if (!settingsString) {
                console.log('No settings found, using defaults');
                return this.defaultSettings;
            }

            // Parse settings
            const settings = JSON.parse(settingsString);

            // Merge with default settings to ensure all properties exist
            const mergedSettings = {...this.defaultSettings, ...settings};

            // Apply settings to game
            this.game.global.settings = mergedSettings;

            console.log('Settings loaded successfully');
            return mergedSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.defaultSettings;
        }
    }

    /**
     * Save game statistics
     * @param {Object} stats - Statistics object to merge with existing stats
     * @returns {boolean} Success status
     */
    saveStats(stats) {
        try {
            // Get existing stats
            const existingStats = this.loadStats();

            // Merge with new stats
            const mergedStats = {...existingStats};

            // Update each stat
            for (const [key, value] of Object.entries(stats)) {
                if (typeof mergedStats[key] === 'number') {
                    mergedStats[key] += value;
                } else {
                    mergedStats[key] = value;
                }
            }

            // Save to localStorage
            localStorage.setItem(this.statsKey, JSON.stringify(mergedStats));

            // Apply stats to game
            this.game.global.statistics = mergedStats;

            console.log('Statistics saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving statistics:', error);
            return false;
        }
    }

    /**
     * Load game statistics
     * @returns {Object} Statistics object or default statistics
     */
    loadStats() {
        try {
            // Get stats from localStorage
            const statsString = localStorage.getItem(this.statsKey);

            // If no stats exist, return defaults
            if (!statsString) {
                console.log('No statistics found, using defaults');
                return this.defaultStats;
            }

            // Parse stats
            const stats = JSON.parse(statsString);

            // Merge with default stats to ensure all properties exist
            const mergedStats = {...this.defaultStats, ...stats};

            // Apply stats to game
            this.game.global.statistics = mergedStats;

            console.log('Statistics loaded successfully');
            return mergedStats;
        } catch (error) {
            console.error('Error loading statistics:', error);
            return this.defaultStats;
        }
    }

    /**
     * Update a specific statistic
     * @param {string} statName - Name of the statistic to update
     * @param {number} value - Value to add to the statistic
     */
    updateStat(statName, value) {
        // Get current stats
        const currentStats = this.game.global.statistics || this.loadStats();

        // Update the specific stat
        if (typeof currentStats[statName] === 'number') {
            currentStats[statName] += value;
        } else {
            currentStats[statName] = value;
        }

        // Save updated stats
        this.saveStats({[statName]: value});
    }

    /**
     * Check if a save file exists
     * @returns {boolean} Whether a save file exists
     */
    saveExists() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Delete save data
     * @param {boolean} showFeedback - Whether to show feedback
     * @returns {boolean} Success status
     */
    deleteSave(showFeedback = true) {
        try {
            // Remove save data
            localStorage.removeItem(this.saveKey);

            // Reset meta-progression to defaults
            this.game.global.metaProgress = {...this.defaultMetaProgress};

            // Show feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('Save data deleted!');
            }

            console.log('Save data deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting save data:', error);

            // Show error feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('Error deleting save data!', true);
            }

            return false;
        }
    }

    /**
     * Reset all data (save, settings, stats)
     * @param {boolean} showFeedback - Whether to show feedback
     * @returns {boolean} Success status
     */
    resetAllData(showFeedback = true) {
        try {
            // Remove all data
            localStorage.removeItem(this.saveKey);
            localStorage.removeItem(this.settingsKey);
            localStorage.removeItem(this.statsKey);

            // Reset game state to defaults
            this.game.global.metaProgress = {...this.defaultMetaProgress};
            this.game.global.settings = {...this.defaultSettings};
            this.game.global.statistics = {...this.defaultStats};

            // Show feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('All data reset!');
            }

            console.log('All data reset successfully');
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);

            // Show error feedback if requested
            if (showFeedback && this.game.scene.isActive('MainMenuScene')) {
                this.showSaveFeedback('Error resetting data!', true);
            }

            return false;
        }
    }

    /**
     * Validate save data structure
     * @param {Object} saveData - Save data to validate
     * @returns {boolean} Whether the save data is valid
     */
    validateSaveData(saveData) {
        // Check if save data has required properties
        if (!saveData || !saveData.metaProgress || !saveData.timestamp || !saveData.version) {
            return false;
        }

        // Check if meta-progress has required properties
        const metaProgress = saveData.metaProgress;
        if (typeof metaProgress.credits !== 'number' ||
            typeof metaProgress.highestSector !== 'number' ||
            !Array.isArray(metaProgress.unlockedShips) ||
            !Array.isArray(metaProgress.unlockedUpgrades)) {
            return false;
        }

        return true;
    }

    /**
     * Show save/load feedback message
     * @param {string} message - Message to display
     * @param {boolean} isError - Whether this is an error message
     */
    showSaveFeedback(message, isError = false) {
        // Get active scene
        const scene = this.game.scene.getScene('MainMenuScene');

        if (!scene) return;

        // Create feedback text
        const feedbackText = scene.add.text(
            scene.cameras.main.width / 2,
            scene.cameras.main.height - 50,
            message,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: isError ? '#ff6666' : '#66ff66',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5).setDepth(100);

        // Fade out after a delay
        scene.tweens.add({
            targets: feedbackText,
            alpha: 0,
            y: feedbackText.y - 30,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                feedbackText.destroy();
            }
        });
    }

    /**
     * Get save data summary for display
     * @returns {Object} Save data summary
     */
    getSaveSummary() {
        // If no save exists, return null
        if (!this.saveExists()) {
            return null;
        }

        try {
            // Get save data
            const saveDataString = localStorage.getItem(this.saveKey);
            const saveData = JSON.parse(saveDataString);

            // Create summary
            const summary = {
                credits: saveData.metaProgress.credits,
                highestSector: saveData.metaProgress.highestSector,
                unlockedShips: saveData.metaProgress.unlockedShips.length,
                timestamp: new Date(saveData.timestamp).toLocaleString(),
                version: saveData.version
            };

            return summary;
        } catch (error) {
            console.error('Error getting save summary:', error);
            return null;
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.SaveManager = SaveManager;
}
