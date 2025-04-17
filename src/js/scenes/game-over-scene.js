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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000022, 0x000022, 0x220000, 0x220000, 1);
        bg.fillRect(0, 0, width, height);

        // Add a vignette effect
        const vignette = this.add.graphics();
        const vignetteColor = 0x000000;
        vignette.fillStyle(vignetteColor, 0);
        vignette.fillCircle(width/2, height/2, height);
        vignette.fillGradientStyle(vignetteColor, vignetteColor, vignetteColor, vignetteColor, 0.8, 0.8, 0, 0);
        vignette.fillRect(0, 0, width, height);

        // Create distant stars (small, many)
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(0.5, 2);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.9);

            const star = this.add.circle(x, y, size, 0xffffff, alpha);

            // Add subtle twinkling effect to some stars
            if (Math.random() > 0.7) {
                this.tweens.add({
                    targets: star,
                    alpha: 0.2,
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }

        // Add some debris particles floating in space
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 5);
            const rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);

            // Create a small piece of debris
            const debris = this.add.graphics();
            const debrisColor = Phaser.Math.RND.pick([0x555555, 0x777777, 0x444444]);
            debris.fillStyle(debrisColor, 1);

            // Random shape for debris
            if (Math.random() > 0.5) {
                // Triangle
                debris.fillTriangle(-size, -size, size, 0, -size, size);
            } else {
                // Rectangle
                debris.fillRect(-size, -size, size * 2, size * 2);
            }

            debris.x = x;
            debris.y = y;
            debris.rotation = rotation;

            // Add slow rotation and movement
            this.tweens.add({
                targets: debris,
                rotation: rotation + Math.PI * 2,
                x: x + Phaser.Math.Between(-50, 50),
                y: y + Phaser.Math.Between(-50, 50),
                duration: Phaser.Math.Between(20000, 40000),
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }

        // Add a red emergency light effect
        const emergencyLight = this.add.graphics();
        emergencyLight.fillStyle(0xff0000, 0.1);
        emergencyLight.fillRect(0, 0, width, height);

        this.tweens.add({
            targets: emergencyLight,
            alpha: { from: 0.1, to: 0.2 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a container for all UI elements
        this.uiContainer = this.add.container(width / 2, 0);

        // Add a damaged ship image in the background
        if (this.textures.exists('player-ship')) {
            const damagedShip = this.add.image(0, height / 2 - 50, 'player-ship')
                .setAlpha(0.2)
                .setTint(0x555555)
                .setScale(3)
                .setAngle(15);

            // Add some damage effects
            const damageOverlay = this.add.graphics();
            damageOverlay.fillStyle(0xff0000, 0.3);
            damageOverlay.fillRect(-50, -30, 100, 60);
            damageOverlay.x = 0;
            damageOverlay.y = height / 2 - 50;

            // Add to container
            this.uiContainer.add([damagedShip, damageOverlay]);

            // Add some smoke particles
            if (this.textures.exists('smoke-particle')) {
                const particles = this.add.particles('smoke-particle');
                particles.createEmitter({
                    x: 0,
                    y: height / 2 - 30,
                    speed: { min: 20, max: 50 },
                    angle: { min: 230, max: 310 },
                    scale: { start: 0.6, end: 0 },
                    alpha: { start: 0.5, end: 0 },
                    lifespan: 2000,
                    frequency: 200
                });
                this.uiContainer.add(particles);
            }
        }

        // Create a glowing red alert effect for the title
        const alertGlow = this.add.graphics();
        alertGlow.fillStyle(0xff0000, 0.2);
        alertGlow.fillCircle(0, 100, 150);
        this.uiContainer.add(alertGlow);

        // Animate the alert glow
        this.tweens.add({
            targets: alertGlow,
            alpha: { from: 0.2, to: 0.4 },
            scale: { from: 1, to: 1.2 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Game over text with enhanced styling
        this.gameOverText = this.add.text(
            0, 100,
            'MISSION FAILED',
            {
                fontFamily: 'monospace',
                fontSize: '52px',
                color: '#ff3333',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6,
                shadow: { offsetX: 2, offsetY: 2, color: '#990000', blur: 10, stroke: true }
            }
        ).setOrigin(0.5);
        this.uiContainer.add(this.gameOverText);

        // Create a stats panel
        const panelWidth = 350;
        const panelHeight = 220;
        const panelY = 280;

        // Panel background with border
        const panel = this.add.graphics();
        panel.fillStyle(0x000033, 0.7);
        panel.fillRoundedRect(-panelWidth/2, panelY - panelHeight/2, panelWidth, panelHeight, 15);
        panel.lineStyle(2, 0xff3333, 0.5);
        panel.strokeRoundedRect(-panelWidth/2, panelY - panelHeight/2, panelWidth, panelHeight, 15);
        this.uiContainer.add(panel);

        // Add score text with enhanced styling
        this.finalScoreText = this.add.text(
            0, panelY - panelHeight/2 + 40,
            `FINAL SCORE: ${this.score}`,
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        this.uiContainer.add(this.finalScoreText);

        // Add sector reached text
        this.sectorText = this.add.text(
            0, panelY - panelHeight/2 + 90,
            `SECTOR: ${this.sector}`,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#aaaaff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        this.uiContainer.add(this.sectorText);

        // Add enemies defeated text
        this.enemiesText = this.add.text(
            0, panelY - panelHeight/2 + 130,
            `ENEMIES DEFEATED: ${this.enemiesDefeated}`,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#aaffaa',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        this.uiContainer.add(this.enemiesText);

        // Add time elapsed text
        const minutes = Math.floor(this.timeElapsed / 60000);
        const seconds = Math.floor((this.timeElapsed % 60000) / 1000);
        this.timeText = this.add.text(
            0, panelY - panelHeight/2 + 170,
            `TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#aaffaa',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        this.uiContainer.add(this.timeText);

        // Create modern buttons
        const buttonY = panelY + panelHeight/2 + 70;
        const buttonSpacing = 70;

        // Try Again button
        const tryAgainButton = this.createButton(
            0, buttonY,
            'TRY AGAIN',
            0xff3333,
            () => this.restartGame()
        );
        this.uiContainer.add(tryAgainButton);

        // Return to Menu button
        const menuButton = this.createButton(
            0, buttonY + buttonSpacing,
            'RETURN TO MENU',
            0x3366ff,
            () => this.returnToMainMenu()
        );
        this.uiContainer.add(menuButton);

        // Add keyboard hint text
        const keyHintText = this.add.text(
            0, height - 40,
            'PRESS [R] TO RESTART OR [M] FOR MENU',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#aaaaaa',
                align: 'center'
            }
        ).setOrigin(0.5);
        this.uiContainer.add(keyHintText);

        // Animate the UI container entrance
        this.uiContainer.y = -100;
        this.tweens.add({
            targets: this.uiContainer,
            y: 0,
            duration: 1000,
            ease: 'Back.easeOut'
        });
    }

    // Helper method to create a modern button
    createButton(x, y, text, color, callback) {
        const buttonWidth = 220;
        const buttonHeight = 50;
        const buttonContainer = this.add.container(x, y);

        // Button background with gradient
        const button = this.add.graphics();
        button.fillStyle(0x000000, 0.6);
        button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        button.lineStyle(2, color, 0.8);
        button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        buttonContainer.add(button);

        // Button text
        const buttonText = this.add.text(
            0, 0,
            text,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        buttonContainer.add(buttonText);

        // Make the button interactive
        const hitArea = this.add.rectangle(0, 0, buttonWidth, buttonHeight)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setAlpha(0.001);
        buttonContainer.add(hitArea);

        // Button hover and click effects
        hitArea.on('pointerover', () => {
            button.clear();
            button.fillStyle(color, 0.3);
            button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            button.lineStyle(2, color, 1);
            button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonText.setShadow(2, 2, color, 10, true);
        });

        hitArea.on('pointerout', () => {
            button.clear();
            button.fillStyle(0x000000, 0.6);
            button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            button.lineStyle(2, color, 0.8);
            button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonText.setShadow(0, 0, '#000000', 0);
        });

        hitArea.on('pointerdown', () => {
            button.clear();
            button.fillStyle(color, 0.5);
            button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonText.setY(2); // Small press effect

            // Call the handler after a short delay for visual feedback
            this.time.delayedCall(100, () => {
                buttonText.setY(0);
                callback();
            });
        });

        // Add a subtle pulse animation
        this.tweens.add({
            targets: button,
            alpha: { from: 1, to: 0.8 },
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        return buttonContainer;
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
