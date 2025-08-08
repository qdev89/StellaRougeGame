/**
 * Phaser Game Configuration
 * Sets up the Phaser game instance with proper configuration
 * Includes mobile support and responsive scaling
 */
// Define a function to create the config object after all scripts are loaded
function createGameConfig() {
    // Detect if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    (window.innerWidth <= 800 && window.innerHeight <= 900);

    // Detect device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;

    // Base configuration
    const config = {
        type: Phaser.AUTO, // Use AUTO to let Phaser choose the best renderer
        width: 640,
        height: 800,
        backgroundColor: '#000000',
        parent: 'game-container',
        pixelArt: true,
        canvasStyle: 'width: 100%; height: 100%;',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false,
                fps: isMobile ? 30 : 60 // Lower physics update rate on mobile
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
            SubsystemGridScene,
            NemesisInfoScene,
            HelpScene,
            GameSettingsScene
        ],
        scale: {
            mode: Phaser.Scale.RESIZE, // Use RESIZE for better mobile support
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%'
        },
        // Mobile-specific settings
        input: {
            activePointers: 3, // Support multi-touch with up to 3 fingers
            touch: {
                capture: true,
                target: window,
                maxTouches: 3
            }
        },
        // Rendering settings
        render: {
            antialias: !isMobile, // Disable antialiasing on mobile for better performance
            pixelArt: true,
            roundPixels: true,
            transparent: false,
            clearBeforeRender: true,
            premultipliedAlpha: true,
            batchSize: isMobile ? 256 : 2048 // Smaller batch size on mobile
        },
        // Audio settings
        audio: {
            disableWebAudio: false,
            noAudio: false
        },
        // Banner settings (disable in production)
        banner: false,
        // FPS settings
        fps: {
            min: 10,
            target: isMobile ? 30 : 60, // Target lower FPS on mobile
            forceSetTimeOut: isMobile, // Use setTimeout instead of requestAnimationFrame on mobile
            deltaHistory: 10
        },
        // Power settings for mobile
        powerPreference: isMobile ? 'low-power' : 'high-performance'
    };

    // Log configuration
    console.log(`Game config: Mobile: ${isMobile}, Pixel Ratio: ${pixelRatio}`);

    return config;
}

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