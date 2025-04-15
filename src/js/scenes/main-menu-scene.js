/**
 * Main Menu Scene
 * Game title screen with menu options
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.MAIN_MENU });
    }

    create() {
        console.log('MainMenuScene: Creating menu interface...');

        // Variables for positioning
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a simple background if image assets aren't available
        this.createBackground();

        // Title text
        const titleText = this.add.text(width / 2, height / 4, 'STELLAR ROGUE', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#33ff33',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle text
        const subtitleText = this.add.text(width / 2, titleText.y + 60, 'RETRO ROGUELIKE FLYING SHOOTER', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Version text
        this.add.text(width - 20, height - 20, `v${CONSTANTS.GAME_VERSION || '0.1.0'}`, {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#666666'
        }).setOrigin(1);

        // Create menu buttons
        this.createMenuButtons(width, height);

        // Try to play background music if available
        this.tryPlayBackgroundMusic();
    }

    createBackground() {
        // Check if background assets were loaded
        if (this.textures.exists('bg-stars')) {
            // Create parallax background layers
            this.bgStars = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-stars')
                .setOrigin(0, 0)
                .setScrollFactor(0);

            if (this.textures.exists('bg-nebula')) {
                this.bgNebula = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-nebula')
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setAlpha(0.5);
            }

            if (this.textures.exists('bg-planets')) {
                this.bgPlanets = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-planets')
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setAlpha(0.8);
            }
        } else {
            // Fallback: create a gradient background
            console.log('Using fallback background (no image assets found)');

            // Create a simple dark background
            this.add.rectangle(
                0,
                0,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000
            ).setOrigin(0, 0);

            // Add some star-like dots
            for (let i = 0; i < 100; i++) {
                const x = Phaser.Math.Between(0, this.cameras.main.width);
                const y = Phaser.Math.Between(0, this.cameras.main.height);
                const size = Phaser.Math.Between(1, 3);
                const alpha = Phaser.Math.FloatBetween(0.3, 1.0);

                this.add.circle(x, y, size, 0xffffff)
                    .setAlpha(alpha);
            }

            // Set a property to handle updates in our update method
            this.usingFallbackBackground = true;
        }
    }

    createMenuButtons(width, height) {
        // Check if button texture was loaded
        const useTextButtons = !this.textures.exists('button');

        // Button configs
        const buttonConfigs = [
            {
                text: 'START MISSION',
                y: height / 2 + 40,
                handler: () => this.startGame()
            },
            {
                text: 'HANGAR BAY',
                y: height / 2 + 120,
                handler: () => this.openHangar()
            },
            {
                text: 'OPTIONS',
                y: height / 2 + 200,
                handler: () => this.openOptions()
            },
            {
                text: 'DEBUG START',
                y: height / 2 + 280,
                handler: () => this.debugStartGame()
            }
        ];

        // Create buttons based on available assets
        buttonConfigs.forEach(config => {
            let button;
            let buttonText;

            if (useTextButtons) {
                // Fallback: create text-based buttons
                button = this.add.rectangle(
                    width / 2,
                    config.y,
                    220,
                    60,
                    0x333333
                )
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5);

                // Add a border
                this.add.rectangle(
                    width / 2,
                    config.y,
                    220,
                    60,
                    0x33ff33
                )
                .setOrigin(0.5)
                .setStrokeStyle(2, 0x33ff33);

                buttonText = this.add.text(width / 2, config.y, config.text, {
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    color: '#ffffff'
                }).setOrigin(0.5);
            } else {
                // Use image-based buttons
                button = this.add.image(width / 2, config.y, 'button')
                    .setInteractive()
                    .setDisplaySize(220, 60);

                buttonText = this.add.text(button.x, button.y, config.text, {
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    color: '#ffffff'
                }).setOrigin(0.5);
            }

            // Button hover and click effects
            this.setupButtonInteractions(button, buttonText, config.handler, useTextButtons);
        });
    }

    setupButtonInteractions(button, buttonText, clickHandler, useTextButtons) {
        button.on('pointerover', () => {
            if (useTextButtons) {
                button.fillColor = 0x444444;
                buttonText.setStyle({ color: '#33ff33' });
            } else if (this.textures.exists('button-hover')) {
                button.setTexture('button-hover');
            }
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            if (useTextButtons) {
                button.fillColor = 0x333333;
                buttonText.setStyle({ color: '#ffffff' });
            } else {
                button.setTexture('button');
            }
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            // Play click sound if available
            if (this.sound.get('click-sound')) {
                this.sound.play('click-sound');
            }

            // Call the provided click handler
            clickHandler();
        });
    }

    startGame() {
        try {
            console.log('Starting new game...');

            // Clear any existing game state
            if (this.scene.get(CONSTANTS.SCENES.GAME)) {
                console.log('Stopping any existing game scene');
                this.scene.stop(CONSTANTS.SCENES.GAME);
            }

            // Reset current run state
            this.game.global.currentRun = {
                sector: 1,
                score: 0,
                shipType: 'fighter',
                upgrades: [],
                penalties: []
            };

            // Add a visual indicator that game is starting
            const loadingText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 100,
                'STARTING MISSION...',
                {
                    fontFamily: 'monospace',
                    fontSize: '24px',
                    color: '#33ff33',
                    align: 'center'
                }
            ).setOrigin(0.5);

            // Start the game scene with a slight delay
            this.time.delayedCall(500, () => {
                // Start the game scene explicitly with data
                console.log('Starting game scene with fresh data');
                this.scene.start(CONSTANTS.SCENES.GAME, {
                    sector: 1,
                    score: 0
                });
            });
        }
        catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start game. Check console for details.');
        }
    }

    openHangar() {
        console.log('Opening hangar bay...');
        // This would transition to a ship selection scene
        // For now, just log available ships
        console.log('Available ships:', this.game.global.metaProgress.unlockedShips);
    }

    openOptions() {
        console.log('Opening options menu...');
        // This would open an options menu
        // For now, just toggle sound
        this.game.sound.mute = !this.game.sound.mute;
        console.log('Sound muted:', this.game.sound.mute);
    }

    debugStartGame() {
        console.log('DEBUG: Starting game with direct scene transition...');

        // Skip all the fancy transitions and just start the game scene directly
        this.scene.start(CONSTANTS.SCENES.GAME, {
            sector: 1,
            score: 0
        });
    }

    tryPlayBackgroundMusic() {
        // Try to play main theme music if it exists
        try {
            if (!this.sound.get('main-theme')) {
                if (this.cache.audio.exists('main-theme')) {
                    const music = this.sound.add('main-theme', {
                        volume: 0.5,
                        loop: true
                    });

                    music.play();
                }
            }
        } catch (e) {
            console.warn('Could not play background music:', e);
        }
    }

    update() {
        // Only update background if using tile sprites
        if (this.bgStars) {
            this.bgStars.tilePositionY -= 0.2;

            if (this.bgNebula) {
                this.bgNebula.tilePositionY -= 0.1;
            }

            if (this.bgPlanets) {
                this.bgPlanets.tilePositionY -= 0.05;
            }
        } else if (this.usingFallbackBackground) {
            // Add some animation for fallback background if needed
        }
    }
}