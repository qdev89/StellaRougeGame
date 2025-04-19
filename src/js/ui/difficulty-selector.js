/**
 * Difficulty Selector UI Component
 * Allows players to select game difficulty from the main menu
 */
class DifficultySelector {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // UI elements
        this.container = null;
        this.background = null;
        this.titleText = null;
        this.difficultyButtons = {};
        this.descriptionText = null;
        this.closeButton = null;

        // Initialize balance configuration
        this.balanceConfig = new BalanceConfig();

        // Difficulty levels
        this.difficultyLevels = [
            { key: 'veryEasy', label: 'VERY EASY', value: this.balanceConfig.difficulty.veryEasy, color: '#33ff33', description: 'For players new to the game. Fewer enemies, slower projectiles, less damage.' },
            { key: 'easy', label: 'EASY', value: this.balanceConfig.difficulty.easy, color: '#66ff66', description: 'For casual players. Balanced for an enjoyable experience with moderate challenge.' },
            { key: 'normal', label: 'NORMAL', value: this.balanceConfig.difficulty.normal, color: '#ffcc33', description: 'The standard experience. Recommended for most players.' },
            { key: 'hard', label: 'HARD', value: this.balanceConfig.difficulty.hard, color: '#ff9933', description: 'For experienced players seeking a challenge. More enemies, faster projectiles, increased damage.' },
            { key: 'veryHard', label: 'VERY HARD', value: this.balanceConfig.difficulty.veryHard, color: '#ff3333', description: 'For expert players. Maximum enemies, fast projectiles, maximum damage.' },
            { key: 'adaptive', label: 'ADAPTIVE', value: -1, color: '#33ccff', description: 'Difficulty adjusts based on your performance. Gets easier if you struggle, harder if you excel.' }
        ];

        // Selected difficulty
        this.selectedDifficulty = 'adaptive';

        // Callback function
        this.callback = null;

        // Create UI elements
        this.createUI();

        // Hide by default
        this.hide();
    }

    /**
     * Create UI elements
     */
    createUI() {
        // Create container
        this.container = this.scene.add.container(this.x, this.y);

        // Create background
        this.background = this.scene.add.rectangle(0, 0, 500, 400, 0x000000, 0.9)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x3399ff);
        this.container.add(this.background);

        // Create title
        this.titleText = this.scene.add.text(0, -160, 'SELECT DIFFICULTY', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.titleText);

        // Create difficulty buttons
        this.createDifficultyButtons();

        // Create description text
        this.descriptionText = this.scene.add.text(0, 120, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 450 }
        }).setOrigin(0.5);
        this.container.add(this.descriptionText);

        // Create close button
        this.closeButton = this.scene.add.text(0, 170, 'CONFIRM', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#3399ff',
            align: 'center'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                this.closeButton.setColor('#33ccff');
            })
            .on('pointerout', () => {
                this.closeButton.setColor('#3399ff');
            })
            .on('pointerdown', () => {
                this.hide();

                // Call callback with selected difficulty
                if (this.callback) {
                    const selectedLevel = this.difficultyLevels.find(level => level.key === this.selectedDifficulty);
                    if (selectedLevel) {
                        this.callback(selectedLevel);
                    }
                }
            });
        this.container.add(this.closeButton);
    }

    /**
     * Create difficulty buttons
     */
    createDifficultyButtons() {
        // Calculate vertical spacing
        const buttonHeight = 40;
        const spacing = 10;
        const totalHeight = (this.difficultyLevels.length * buttonHeight) + ((this.difficultyLevels.length - 1) * spacing);
        const startY = -totalHeight / 2 + buttonHeight / 2;

        // Create buttons for each difficulty level
        this.difficultyLevels.forEach((level, index) => {
            // Calculate y position
            const y = startY + (index * (buttonHeight + spacing));

            // Create button background
            const buttonBg = this.scene.add.rectangle(0, y, 300, buttonHeight, 0x222222, 0.8)
                .setOrigin(0.5)
                .setStrokeStyle(2, 0x333333)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => {
                    buttonBg.setStrokeStyle(2, level.color.replace('#', '0x'));
                    buttonText.setColor(level.color);
                    this.updateDescription(level);
                })
                .on('pointerout', () => {
                    if (this.selectedDifficulty !== level.key) {
                        buttonBg.setStrokeStyle(2, 0x333333);
                        buttonText.setColor('#ffffff');
                    }
                })
                .on('pointerdown', () => {
                    this.selectDifficulty(level.key);
                });

            // Create button text
            const buttonText = this.scene.add.text(0, y, level.label, {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            // Add to container
            this.container.add(buttonBg);
            this.container.add(buttonText);

            // Store references
            this.difficultyButtons[level.key] = {
                background: buttonBg,
                text: buttonText
            };
        });

        // Set initial selection
        this.selectDifficulty('adaptive');
    }

    /**
     * Select a difficulty level
     * @param {string} key - The difficulty key to select
     */
    selectDifficulty(key) {
        // Reset all buttons
        Object.keys(this.difficultyButtons).forEach(buttonKey => {
            const button = this.difficultyButtons[buttonKey];
            button.background.setStrokeStyle(2, 0x333333);
            button.text.setColor('#ffffff');
        });

        // Highlight selected button
        const selectedButton = this.difficultyButtons[key];
        if (selectedButton) {
            const level = this.difficultyLevels.find(level => level.key === key);
            if (level) {
                selectedButton.background.setStrokeStyle(2, level.color.replace('#', '0x'));
                selectedButton.text.setColor(level.color);
                this.updateDescription(level);
            }
        }

        // Update selected difficulty
        this.selectedDifficulty = key;
    }

    /**
     * Update description text
     * @param {object} level - The difficulty level
     */
    updateDescription(level) {
        if (this.descriptionText) {
            this.descriptionText.setText(level.description);
        }
    }

    /**
     * Show the difficulty selector
     * @param {function} callback - Function to call when difficulty is selected
     */
    show(callback) {
        this.container.setVisible(true);
        this.callback = callback;

        // Set initial selection based on current game settings
        if (this.scene.game.global && this.scene.game.global.dynamicDifficulty) {
            const difficultySystem = this.scene.game.global.dynamicDifficulty;

            if (difficultySystem.settings.adaptiveDifficultyEnabled) {
                this.selectDifficulty('adaptive');
            } else {
                // Find closest matching difficulty
                const baseDifficulty = difficultySystem.settings.baseDifficulty;
                let closestLevel = this.difficultyLevels[0];
                let smallestDiff = Math.abs(baseDifficulty - this.difficultyLevels[0].value);

                for (let i = 1; i < this.difficultyLevels.length; i++) {
                    const level = this.difficultyLevels[i];
                    if (level.value >= 0) { // Skip adaptive
                        const diff = Math.abs(baseDifficulty - level.value);
                        if (diff < smallestDiff) {
                            smallestDiff = diff;
                            closestLevel = level;
                        }
                    }
                }

                this.selectDifficulty(closestLevel.key);
            }
        }
    }

    /**
     * Hide the difficulty selector
     */
    hide() {
        this.container.setVisible(false);
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.DifficultySelector = DifficultySelector;
}
