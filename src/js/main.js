/**
 * Main Game Entry Point
 * Initializes the Phaser game instance and global game state
 */
window.onload = function() {
    console.log('Initializing game - v1.0.2');
    let game;

    try {
        // Initialize Phaser game with scenes already defined in config
        game = new Phaser.Game(config);
    } catch (error) {
        console.error('Failed to initialize game:', error);
        return;
    }

    // Attach global game state
    game.global = gameState;

    // Add event listeners for browser visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // Auto-pause game when tab is not visible
            if (game.isRunning) {
                game.loop.sleep();
                // Sound is already muted for this phase
                console.log('Game auto-paused');
            }
        } else {
            // Resume game when tab is visible again
            if (game.loop.sleeping) {
                game.loop.wake();
                // Sound remains muted for this phase
                console.log('Game resumed');
            }
        }
    });

    // Handle localStorage for persistent game state
    const storageKey = 'stellar_rogue_save';

    // Save handler - called when game state should be saved
    game.saveGameState = function() {
        try {
            const saveData = {
                metaProgress: game.global.metaProgress,
                audio: game.global.audio,
                lastPlayed: Date.now()
            };
            localStorage.setItem(storageKey, JSON.stringify(saveData));
            console.log('Game state saved');
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    };

    // Load previous state if available
    game.loadGameState = function() {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                game.global.metaProgress = parsedData.metaProgress || game.global.metaProgress;
                game.global.audio = parsedData.audio || game.global.audio;
                console.log('Game state loaded');
            } else {
                console.log('No saved game found, using default state');
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
    };

    // Add game state saving on page unload
    window.addEventListener('beforeunload', function() {
        game.saveGameState();
    });

    // Reset game state
    game.resetGameState = function() {
        // Reset current run only (not meta-progression)
        game.global.currentRun = {
            sector: 1,
            score: 0,
            shipType: 'fighter',
            upgrades: [],
            penalties: []
        };
        console.log('Game run state reset');
    };

    // Print debug info
    console.log('STELLAR ROGUE game initialized');
};