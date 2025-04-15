/**
 * Game Over Scene
 * Displays game over screen with score and options to restart or return to menu
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.GAME_OVER });
    }

    init(data) {
        // Get data from previous scene
        this.score = data.score || 0;
        this.sector = data.sector || 1;
        this.enemiesDefeated = data.enemiesDefeated || 0;
        this.timeElapsed = data.timeElapsed || 0;
        this.upgrades = data.upgrades || [];
        this.penalties = data.penalties || [];
    }

    create() {
        console.log('GameOverScene: Displaying game over screen');

        // Create background
        this.createBackground();

        // Create UI elements
        this.createUI();

        // Calculate and update meta-progression
        this.updateMetaProgression();

        // Set up event handlers
        this.setupEvents();
    }

    createBackground() {
        // Create a dark background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000022, 0.9)
            .setOrigin(0, 0);

        // Add some stars
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);

            this.add.circle(x, y, size, 0xffffff, 0.7);
        }
    }

    createUI() {
        // Game over text
        this.gameOverText = this.add.text(
            this.cameras.main.width / 2,
            100,
            'MISSION FAILED',
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#ff3333',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add score text
        this.finalScoreText = this.add.text(
            this.cameras.main.width / 2,
            180,
            `FINAL SCORE: ${this.score}`,
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add sector reached text
        this.sectorText = this.add.text(
            this.cameras.main.width / 2,
            230,
            `SECTOR: ${this.sector}`,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#aaaaff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add enemies defeated text
        this.enemiesText = this.add.text(
            this.cameras.main.width / 2,
            270,
            `ENEMIES DEFEATED: ${this.enemiesDefeated}`,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#aaffaa',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add time elapsed text
        const minutes = Math.floor(this.timeElapsed / 60000);
        const seconds = Math.floor((this.timeElapsed % 60000) / 1000);
        this.timeText = this.add.text(
            this.cameras.main.width / 2,
            310,
            `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#aaffaa',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add restart button
        this.restartButton = this.add.text(
            this.cameras.main.width / 2,
            400,
            'TRY AGAIN',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#33ff33',
                align: 'center',
                backgroundColor: '#333333',
                padding: {
                    x: 20,
                    y: 10
                }
            }
        ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        this.restartButton.on('pointerdown', () => {
            this.restartGame();
        });

        // Add menu button
        this.menuButton = this.add.text(
            this.cameras.main.width / 2,
            470,
            'RETURN TO MENU',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#33ff33',
                align: 'center',
                backgroundColor: '#333333',
                padding: {
                    x: 20,
                    y: 10
                }
            }
        ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        this.menuButton.on('pointerdown', () => {
            this.returnToMainMenu();
        });

        // Make buttons pulse
        this.tweens.add({
            targets: [this.restartButton, this.menuButton],
            alpha: 0.7,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    updateMetaProgression() {
        // Calculate credits earned from this run
        const creditsEarned = Math.floor(this.score / 10);

        // Update global meta-progression
        if (!this.game.global.metaProgress) {
            this.game.global.metaProgress = {
                credits: 0,
                highestSector: 1,
                unlockedShips: ['fighter'],
                unlockedUpgrades: [],
                achievements: {}
            };
        }

        // Add credits
        this.game.global.metaProgress.credits += creditsEarned;

        // Update highest sector reached
        if (this.sector > this.game.global.metaProgress.highestSector) {
            this.game.global.metaProgress.highestSector = this.sector;
        }

        // Initialize save manager if it doesn't exist
        if (!this.game.global.saveManager) {
            this.game.global.saveManager = new SaveManager(this.game);
        }

        // Update statistics
        const stats = {
            totalRuns: 1,
            totalPlayTime: this.timeElapsed,
            enemiesDefeated: this.enemiesDefeated,
            deaths: 1
        };

        // Update highest score if applicable
        if (this.score > (this.game.global.statistics?.highestScore || 0)) {
            stats.highestScore = this.score;
        }

        // Save statistics
        this.game.global.saveManager.saveStats(stats);

        // Save meta-progression
        this.game.global.saveManager.saveGame(false);

        // Display credits earned
        this.creditsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            `CREDITS EARNED: ${creditsEarned}`,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffff00',
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    setupEvents() {
        // Add keyboard controls
        this.input.keyboard.on('keydown-R', () => {
            this.restartGame();
        });

        this.input.keyboard.on('keydown-M', () => {
            this.returnToMainMenu();
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.restartGame();
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToMainMenu();
        });
    }

    restartGame() {
        // Reset the game state and start a new run
        console.log('Restarting game...');

        // Reset current run state
        this.game.global.currentRun = {
            sector: 1,
            score: 0,
            shipType: 'fighter',
            upgrades: [],
            penalties: []
        };

        // Start the sector map scene
        this.scene.start(CONSTANTS.SCENES.SECTOR_MAP, {
            sector: 1,
            score: 0
        });
    }

    returnToMainMenu() {
        // Return to the main menu
        console.log('Returning to main menu...');

        this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.GameOverScene = GameOverScene;
}
