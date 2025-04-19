/**
 * Phaser Game Configuration
 * Sets up the Phaser game instance with proper configuration
 */
const config = {
    type: Phaser.CANVAS, // Use CANVAS explicitly instead of AUTO
    width: 640,
    height: 800,
    backgroundColor: '#000000',
    parent: 'game-container',
    pixelArt: true,
    renderType: 1, // Explicitly set renderType to 1 (CANVAS)
    canvasStyle: 'width: 100%; height: 100%;',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    // Define scenes with their class references
    scene: [
        BootScene,
        LoadingScene,
        MainMenuScene,
        SectorMapScene,
        GameScene,
        UpgradeScene,
        GameOverScene,
        ShipStatusScene,
        InventoryScene,
        ProfileScene,
        NemesisInfoScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Global game state storage
const gameState = {
    // Current run data
    currentRun: {
        sector: 1,
        score: 0,
        shipType: 'fighter',
        upgrades: [],
        penalties: []
    },

    // Meta-progression (persists between runs)
    metaProgress: {
        credits: CONSTANTS.META.STARTING_CREDITS,
        highestSector: 1,
        unlockedShips: ['fighter'],
        permanentUpgrades: []
    },

    // Audio settings - completely disabled
    audio: {
        music: false,
        sfx: false,
        volume: 0
    },

    // Debug settings - disable in production
    debug: {
        invincible: false,
        unlockAll: false,
        showFps: false
    }
};