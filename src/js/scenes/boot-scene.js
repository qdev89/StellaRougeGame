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
        this.game.sound.mute = true; // Sound is disabled for this phase
        this.game.sound.volume = 0;

        // Initialize the sound manager (disabled for now)
        this.game.soundManager = new SoundManager(this);

        console.log('Game settings initialized');
    }

    loadSaveData() {
        // Try to load save data from localStorage
        try {
            let saveData = localStorage.getItem('stellar_rogue_save');

            if (saveData) {
                try {
                    saveData = JSON.parse(saveData);
                    this.game.global.metaProgress = saveData.metaProgress || this.game.global.metaProgress;
                    console.log('Save data loaded successfully');
                } catch (error) {
                    console.error('Error parsing save data:', error);
                    // Reset to defaults if there was an error
                    this.resetToDefaults();
                }
            } else {
                console.log('No save data found, using defaults');
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
            unlockedTechnologies: [],
            highestSector: 1
        };
    }
}