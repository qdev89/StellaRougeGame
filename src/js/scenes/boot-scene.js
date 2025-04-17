/**
 * Boot Scene
 * First scene that loads, handles initial setup and loading essential assets
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.BOOT });
    }

    preload() {
        console.log('BootScene: Initializing game boot sequence...');
        // We don't need to preload anything in boot scene anymore
        // Assets will be handled in the loading scene with error handling
    }

    create() {
        console.log('BootScene: Game is booting...');

        // Initialize any game systems that need to be set up before main asset loading
        this.initGameSettings();
        this.loadSaveData();

        // Proceed to the loading scene where the bulk of the assets will be loaded
        this.scene.start(CONSTANTS.SCENES.LOADING);
    }

    initGameSettings() {
        // Set up any global game settings
        this.game.sound.mute = true; // Sound is completely disabled
        this.game.sound.volume = 0;

        // Initialize the sound manager (completely disabled)
        this.game.soundManager = new SoundManager(this);

        // Disable all sound-related functionality
        if (this.sound) {
            this.sound.mute = true;
            this.sound.volume = 0;
        }

        console.log('Game settings initialized - Sound disabled');
    }

    loadSaveData() {
        // Initialize the save manager
        this.game.global.saveManager = new SaveManager(this.game);

        // Try to load save data
        try {
            // Load game settings
            const settings = this.game.global.saveManager.loadSettings();
            console.log('Settings loaded:', settings);

            // Load game statistics
            const stats = this.game.global.saveManager.loadStats();
            console.log('Statistics loaded:', stats);

            // Load save data
            if (this.game.global.saveManager.saveExists()) {
                const success = this.game.global.saveManager.loadGame(false);

                if (success) {
                    console.log('Save data loaded successfully');
                } else {
                    console.warn('Failed to load save data, using defaults');
                    this.resetToDefaults();
                }
            } else {
                console.log('No save data found, using defaults');
                this.resetToDefaults();
            }
        } catch (e) {
            console.warn('Could not access localStorage. Save functionality may be limited.');
            this.resetToDefaults();
        }
    }

    resetToDefaults() {
        console.log('Using default game state');
        this.game.global.metaProgress = {
            credits: 0,
            unlockedShips: ['fighter'],
            unlockedUpgrades: [],
            achievements: {},
            highestSector: 1
        };
    }
}