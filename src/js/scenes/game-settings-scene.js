/**
 * Game Settings Scene
 * Provides access to game settings, help, and difficulty options
 */
class GameSettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.GAME_SETTINGS });
    }

    init(data) {
        // Store the previous scene to return to
        this.previousScene = data.previousScene || CONSTANTS.SCENES.MAIN_MENU;
    }

    create() {
        console.log('GameSettingsScene: Creating settings interface...');

        // Variables for positioning
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create background
        this.createBackground();

        // Create header
        this.createHeader();

        // Create settings panel
        this.createSettingsPanel();

        // Create return button
        this.createReturnButton();

        // Add keyboard controls
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToPreviousScene();
        });
    }

    createBackground() {
        // Create a simple background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033).setOrigin(0);

        // Add stars
        this.bgStars = this.add.tileSprite(
            0, 0,
            this.cameras.main.width, this.cameras.main.height,
            'background', 'stars'
        ).setOrigin(0).setScrollFactor(0);

        // Add nebula if available
        if (this.textures.exists('background') && this.textures.get('background').has('nebula')) {
            this.bgNebula = this.add.tileSprite(
                0, 0,
                this.cameras.main.width, this.cameras.main.height,
                'background', 'nebula'
            ).setOrigin(0).setScrollFactor(0).setAlpha(0.5);
        }
    }

    createHeader() {
        // Create header text
        this.add.text(
            this.cameras.main.width / 2,
            40,
            'GAME SETTINGS',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Create subtitle
        this.add.text(
            this.cameras.main.width / 2,
            80,
            'Configure game options and access help',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    createSettingsPanel() {
        // Create panel background
        const panelWidth = 600;
        const panelHeight = 500;
        const panelX = this.cameras.main.width / 2;
        const panelY = this.cameras.main.height / 2 + 30;

        // Create a container for the settings panel
        this.settingsContainer = this.add.container(0, 0);

        // Create panel background with gradient
        const panel = this.add.graphics();
        panel.fillGradientStyle(0x222244, 0x222255, 0x222266, 0x222255, 0.8);
        panel.fillRoundedRect(
            panelX - panelWidth/2,
            panelY - panelHeight/2,
            panelWidth,
            panelHeight,
            15
        );
        panel.lineStyle(2, 0x33aaff, 0.5);
        panel.strokeRoundedRect(
            panelX - panelWidth/2,
            panelY - panelHeight/2,
            panelWidth,
            panelHeight,
            15
        );
        this.settingsContainer.add(panel);

        // Create settings buttons
        this.createSettingsButtons(panelX, panelY, panelWidth, panelHeight);
    }

    createSettingsButtons(panelX, panelY, panelWidth, panelHeight) {
        // Button configs
        const buttonConfigs = [
            {
                text: 'DIFFICULTY SETTINGS',
                icon: '🎯',
                description: 'Adjust game difficulty and challenge level',
                handler: () => this.openDifficultySelector()
            },
            {
                text: 'HELP & TUTORIAL',
                icon: '❓',
                description: 'View game instructions and start the tutorial',
                handler: () => this.openHelp()
            },
            {
                text: 'VISUAL EFFECTS',
                icon: '✨',
                description: 'Configure particle effects and visual quality',
                handler: () => this.toggleVisualEffects()
            },
            {
                text: 'SCREEN SHAKE',
                icon: '📳',
                description: 'Toggle screen shake effects during gameplay',
                handler: () => this.toggleScreenShake()
            }
        ];

        // Button dimensions
        const buttonWidth = 500;
        const buttonHeight = 80;
        const buttonSpacing = 20;
        const startY = panelY - panelHeight/2 + 80;

        // Create buttons
        buttonConfigs.forEach((config, index) => {
            const buttonY = startY + (index * (buttonHeight + buttonSpacing));

            // Create button background with gradient
            const button = this.add.graphics();
            button.fillGradientStyle(0x222244, 0x222255, 0x222266, 0x222255, 0.8);
            button.fillRoundedRect(
                panelX - buttonWidth/2,
                buttonY - buttonHeight/2,
                buttonWidth,
                buttonHeight,
                10
            );
            button.lineStyle(1, 0x33aaff, 0.5);
            button.strokeRoundedRect(
                panelX - buttonWidth/2,
                buttonY - buttonHeight/2,
                buttonWidth,
                buttonHeight,
                10
            );

            // Add a left accent bar
            const accentBar = this.add.rectangle(
                panelX - buttonWidth/2 + 5,
                buttonY,
                3,
                buttonHeight - 10,
                0x33aaff,
                0.7
            ).setOrigin(0.5);

            // Create an invisible interactive area
            const hitArea = this.add.rectangle(
                panelX,
                buttonY,
                buttonWidth,
                buttonHeight
            ).setInteractive({ useHandCursor: true }).setOrigin(0.5).setAlpha(0.001);

            // Add icon
            const iconText = this.add.text(
                panelX - buttonWidth/2 + 25,
                buttonY,
                config.icon,
                { fontSize: '24px' }
            ).setOrigin(0.5);

            // Button text
            const buttonText = this.add.text(
                panelX - buttonWidth/2 + 60,
                buttonY - 12,
                config.text,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    fontStyle: 'bold',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 1, offsetY: 1, color: '#33aaff', blur: 5, stroke: true }
                }
            ).setOrigin(0, 0.5);

            // Description text
            const descText = this.add.text(
                panelX - buttonWidth/2 + 60,
                buttonY + 12,
                config.description,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#aaaaaa',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            ).setOrigin(0, 0.5);

            // Add a subtle glow effect behind the button
            const glow = this.add.rectangle(
                panelX,
                buttonY,
                buttonWidth,
                buttonHeight,
                0x33aaff,
                0
            ).setOrigin(0.5);

            // Add all elements to container
            this.settingsContainer.add([button, accentBar, hitArea, iconText, buttonText, descText, glow]);

            // Add hover effect
            hitArea.on('pointerover', () => {
                button.clear();
                button.fillGradientStyle(0x2233aa, 0x2244bb, 0x2255cc, 0x2244bb, 0.8);
                button.fillRoundedRect(
                    panelX - buttonWidth/2,
                    buttonY - buttonHeight/2,
                    buttonWidth,
                    buttonHeight,
                    10
                );
                button.lineStyle(2, 0x33aaff, 0.8);
                button.strokeRoundedRect(
                    panelX - buttonWidth/2,
                    buttonY - buttonHeight/2,
                    buttonWidth,
                    buttonHeight,
                    10
                );

                // Scale up text slightly
                this.tweens.add({
                    targets: [buttonText],
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100,
                    ease: 'Power1'
                });

                // Glow effect
                this.tweens.add({
                    targets: glow,
                    alpha: 0.2,
                    duration: 200
                });
            });

            hitArea.on('pointerout', () => {
                button.clear();
                button.fillGradientStyle(0x222244, 0x222255, 0x222266, 0x222255, 0.8);
                button.fillRoundedRect(
                    panelX - buttonWidth/2,
                    buttonY - buttonHeight/2,
                    buttonWidth,
                    buttonHeight,
                    10
                );
                button.lineStyle(1, 0x33aaff, 0.5);
                button.strokeRoundedRect(
                    panelX - buttonWidth/2,
                    buttonY - buttonHeight/2,
                    buttonWidth,
                    buttonHeight,
                    10
                );

                // Scale back to normal
                this.tweens.add({
                    targets: [buttonText],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Power1'
                });

                // Remove glow
                this.tweens.add({
                    targets: glow,
                    alpha: 0,
                    duration: 200
                });
            });

            hitArea.on('pointerdown', () => {
                // Clear and redraw with pressed style
                button.clear();
                button.fillGradientStyle(0x2233aa, 0x2244bb, 0x2255cc, 0x2244bb, 1);
                button.fillRoundedRect(
                    panelX - buttonWidth/2,
                    buttonY - buttonHeight/2,
                    buttonWidth,
                    buttonHeight,
                    10
                );

                // Add press effect
                this.tweens.add({
                    targets: [buttonText, descText, iconText],
                    y: '+=2',
                    duration: 50,
                    yoyo: true
                });

                // Flash the glow
                this.tweens.add({
                    targets: glow,
                    alpha: { from: 0.4, to: 0 },
                    duration: 300
                });

                // Call the handler after a short delay for visual feedback
                this.time.delayedCall(100, config.handler);
            });
        });

        // Add status indicators for toggleable settings
        this.createStatusIndicators(panelX, panelWidth, buttonConfigs, startY, buttonHeight, buttonSpacing);
    }

    createStatusIndicators(panelX, panelWidth, buttonConfigs, startY, buttonHeight, buttonSpacing) {
        // Load current settings
        const settings = this.game.global.settings || {};

        // Visual Effects status
        const visualEffectsEnabled = settings.particleEffects !== false;
        this.visualEffectsStatus = this.add.text(
            panelX + panelWidth/2 - 20,
            startY + (2 * (buttonHeight + buttonSpacing)),
            visualEffectsEnabled ? 'ON' : 'OFF',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: visualEffectsEnabled ? '#33ff33' : '#ff3333',
                fontStyle: 'bold'
            }
        ).setOrigin(1, 0.5);
        this.settingsContainer.add(this.visualEffectsStatus);

        // Screen Shake status
        const screenShakeEnabled = settings.screenShake !== false;
        this.screenShakeStatus = this.add.text(
            panelX + panelWidth/2 - 20,
            startY + (3 * (buttonHeight + buttonSpacing)),
            screenShakeEnabled ? 'ON' : 'OFF',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: screenShakeEnabled ? '#33ff33' : '#ff3333',
                fontStyle: 'bold'
            }
        ).setOrigin(1, 0.5);
        this.settingsContainer.add(this.screenShakeStatus);
    }

    createReturnButton() {
        // Create return button
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = this.cameras.main.width / 2;
        const buttonY = this.cameras.main.height - 60;

        // Create button background with gradient
        const buttonBg = this.add.graphics();
        buttonBg.fillGradientStyle(0x222244, 0x222255, 0x222266, 0x222255, 0.8);
        buttonBg.fillRoundedRect(
            buttonX - buttonWidth/2,
            buttonY - buttonHeight/2,
            buttonWidth,
            buttonHeight,
            10
        );
        buttonBg.lineStyle(1, 0x33aaff, 0.5);
        buttonBg.strokeRoundedRect(
            buttonX - buttonWidth/2,
            buttonY - buttonHeight/2,
            buttonWidth,
            buttonHeight,
            10
        );

        // Create return text
        const returnText = this.add.text(
            buttonX,
            buttonY,
            'RETURN TO MENU',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        // Create hit area
        const hitArea = this.add.rectangle(
            buttonX,
            buttonY,
            buttonWidth,
            buttonHeight
        ).setInteractive({ useHandCursor: true }).setOrigin(0.5).setAlpha(0.001);

        // Add hover effect
        hitArea.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillGradientStyle(0x2233aa, 0x2244bb, 0x2255cc, 0x2244bb, 0.8);
            buttonBg.fillRoundedRect(
                buttonX - buttonWidth/2,
                buttonY - buttonHeight/2,
                buttonWidth,
                buttonHeight,
                10
            );
            buttonBg.lineStyle(2, 0x33aaff, 0.8);
            buttonBg.strokeRoundedRect(
                buttonX - buttonWidth/2,
                buttonY - buttonHeight/2,
                buttonWidth,
                buttonHeight,
                10
            );

            // Scale up text slightly
            this.tweens.add({
                targets: returnText,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power1'
            });
        });

        hitArea.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillGradientStyle(0x222244, 0x222255, 0x222266, 0x222255, 0.8);
            buttonBg.fillRoundedRect(
                buttonX - buttonWidth/2,
                buttonY - buttonHeight/2,
                buttonWidth,
                buttonHeight,
                10
            );
            buttonBg.lineStyle(1, 0x33aaff, 0.5);
            buttonBg.strokeRoundedRect(
                buttonX - buttonWidth/2,
                buttonY - buttonHeight/2,
                buttonWidth,
                buttonHeight,
                10
            );

            // Scale back to normal
            this.tweens.add({
                targets: returnText,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power1'
            });
        });

        // Add click handler
        hitArea.on('pointerdown', () => {
            // Add click feedback
            this.tweens.add({
                targets: returnText,
                y: '+=2',
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.returnToPreviousScene();
                }
            });
        });

        // Add to container
        this.settingsContainer.add([buttonBg, returnText, hitArea]);
    }

    openDifficultySelector() {
        console.log('Opening difficulty selector');

        // Create difficulty selector if it doesn't exist
        if (!this.difficultySelector) {
            this.difficultySelector = new DifficultySelector(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
        }

        // Show the selector with callback
        this.difficultySelector.show((difficulty) => {
            // Apply selected difficulty if dynamic difficulty system exists
            if (this.game.global.dynamicDifficulty) {
                if (difficulty.key === 'adaptive') {
                    this.game.global.dynamicDifficulty.setAdaptiveDifficulty(true);
                } else {
                    this.game.global.dynamicDifficulty.setAdaptiveDifficulty(false);
                    this.game.global.dynamicDifficulty.setBaseDifficulty(difficulty.value);
                }
            }

            // Save settings
            if (this.game.global.saveManager) {
                const settings = this.game.global.settings || {};
                settings.difficulty = difficulty.key;
                this.game.global.saveManager.saveSettings(settings);
            }

            // Show confirmation message
            this.showConfirmationMessage(`DIFFICULTY SET: ${difficulty.label}`, difficulty.color);
        });
    }

    openHelp() {
        console.log('Opening help and tutorial screen...');

        // Start the help scene
        this.scene.start(CONSTANTS.SCENES.HELP, {
            previousScene: CONSTANTS.SCENES.GAME_SETTINGS
        });
    }

    toggleVisualEffects() {
        console.log('Toggling visual effects');

        // Get current settings
        const settings = this.game.global.settings || {};

        // Toggle particle effects
        settings.particleEffects = !settings.particleEffects;

        // Update status text
        this.visualEffectsStatus.setText(settings.particleEffects ? 'ON' : 'OFF');
        this.visualEffectsStatus.setColor(settings.particleEffects ? '#33ff33' : '#ff3333');

        // Save settings
        if (this.game.global.saveManager) {
            this.game.global.saveManager.saveSettings(settings);
        }

        // Show confirmation message
        this.showConfirmationMessage(
            `VISUAL EFFECTS: ${settings.particleEffects ? 'ENABLED' : 'DISABLED'}`,
            settings.particleEffects ? '#33ff33' : '#ff3333'
        );
    }

    toggleScreenShake() {
        console.log('Toggling screen shake');

        // Get current settings
        const settings = this.game.global.settings || {};

        // Toggle screen shake
        settings.screenShake = !settings.screenShake;

        // Update status text
        this.screenShakeStatus.setText(settings.screenShake ? 'ON' : 'OFF');
        this.screenShakeStatus.setColor(settings.screenShake ? '#33ff33' : '#ff3333');

        // Save settings
        if (this.game.global.saveManager) {
            this.game.global.saveManager.saveSettings(settings);
        }

        // Show confirmation message
        this.showConfirmationMessage(
            `SCREEN SHAKE: ${settings.screenShake ? 'ENABLED' : 'DISABLED'}`,
            settings.screenShake ? '#33ff33' : '#ff3333'
        );
    }

    showConfirmationMessage(message, color) {
        // Create confirmation message
        const confirmText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            message,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: color || '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(1000);

        // Add background
        const bg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            confirmText.width + 40,
            confirmText.height + 20,
            0x000000,
            0.7
        ).setOrigin(0.5).setDepth(999);

        // Animate in
        this.tweens.add({
            targets: [bg, confirmText],
            alpha: { from: 0, to: 1 },
            duration: 200,
            ease: 'Power2'
        });

        // Animate out after delay
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: [bg, confirmText],
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    bg.destroy();
                    confirmText.destroy();
                }
            });
        });
    }

    returnToPreviousScene() {
        this.scene.start(this.previousScene);
    }

    update() {
        // Update background if using tile sprites
        if (this.bgStars) {
            this.bgStars.tilePositionY -= 0.2;

            if (this.bgNebula) {
                this.bgNebula.tilePositionY -= 0.1;
            }
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.GameSettingsScene = GameSettingsScene;
}
