/**
 * Main Game Entry Point
 * Initializes the Phaser game instance and global game state
 */
// This function is called when all scripts are loaded
(function() {
    console.log('Initializing game - v1.0.2');
    let game;

    try {
        // Hide loading screen (in case it wasn't already hidden)
        if (document.getElementById('loading')) {
            document.getElementById('loading').style.display = 'none';
        }

        // Initialize device detector
        const deviceDetector = new DeviceDetector();

        // Create the game configuration
        const config = createGameConfig();

        // Initialize Phaser game with the configuration
        game = new Phaser.Game(config);

        // Attach device detector to game
        game.deviceDetector = deviceDetector;

        // Initialize performance optimizer
        game.performanceOptimizer = new PerformanceOptimizer(game);

        // Set up mobile-specific handlers
        setupMobileHandlers(game, deviceDetector);
    } catch (error) {
        console.error('Failed to initialize game:', error);
        if (document.getElementById('loading')) {
            document.getElementById('loading').innerHTML = '<h1>Error</h1><p>' + error.message + '</p>';
            document.getElementById('loading').style.display = 'block';
        }
        return;
    }

    // Attach global game state
    game.global = gameState;

    // Initialize debug tools
    game.global.debugTools = new DebugTools(game);

    // Initialize analytics
    game.global.analytics = new GameAnalytics();

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

    /**
     * Set up mobile-specific event handlers and optimizations
     * @param {Phaser.Game} game - The game instance
     * @param {DeviceDetector} deviceDetector - The device detector instance
     */
    function setupMobileHandlers(game, deviceDetector) {
        // Only apply mobile handlers if on a mobile device
        if (!deviceDetector || !deviceDetector.isMobile) return;

        console.log('Setting up mobile handlers');

        // Handle orientation changes
        window.addEventListener('orientationchange', function() {
            // Force resize event after orientation change completes
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));

                // Update performance settings based on new orientation
                if (game.performanceOptimizer) {
                    game.performanceOptimizer.handleResize();
                }

                console.log('Orientation changed, game resized');
            }, 200);
        });

        // Handle fullscreen for iOS Safari
        if (deviceDetector.isIOS) {
            // iOS doesn't support true fullscreen, but we can hide browser UI
            window.addEventListener('touchend', function() {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                }
            }, { once: true });
        }

        // Prevent pinch zoom on mobile
        document.addEventListener('touchmove', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });

        // Prevent context menu on long press
        window.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });

        // Add viewport meta tags for mobile if not already present
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            document.head.appendChild(viewportMeta);

            // Add Apple mobile web app capable meta tag
            const appleMeta = document.createElement('meta');
            appleMeta.name = 'apple-mobile-web-app-capable';
            appleMeta.content = 'yes';
            document.head.appendChild(appleMeta);
        }

        // Add touch action CSS to prevent browser handling of touch events
        const style = document.createElement('style');
        style.textContent = `
            #game-container {
                touch-action: none;
                -ms-touch-action: none;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
        `;
        document.head.appendChild(style);

        // Set up battery optimization if Battery API is available
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                // If battery level is low, apply more aggressive optimizations
                if (battery.level < 0.3 && !battery.charging) {
                    if (game.performanceOptimizer) {
                        // Apply low battery optimizations
                        game.performanceOptimizer.updateSetting('particleMultiplier', 0.2);
                        game.performanceOptimizer.updateSetting('usePostProcessing', false);
                        game.performanceOptimizer.updateSetting('useLightEffects', false);
                        game.performanceOptimizer.updateSetting('useBlur', false);
                        game.performanceOptimizer.updateSetting('useGlow', false);

                        console.log('Applied low battery optimizations');
                    }
                }

                // Listen for battery level changes
                battery.addEventListener('levelchange', function() {
                    if (battery.level < 0.3 && !battery.charging && game.performanceOptimizer) {
                        // Apply low battery optimizations
                        game.performanceOptimizer.updateSetting('particleMultiplier', 0.2);
                    } else if (battery.level > 0.5 && game.performanceOptimizer) {
                        // Restore normal settings
                        game.performanceOptimizer.updateSetting('particleMultiplier', 0.5);
                    }
                });
            });
        }
    }
})();