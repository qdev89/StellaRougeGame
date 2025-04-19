/**
 * Nemesis Difficulty Selector
 * Allows players to select the difficulty level for the Nemesis boss fight
 */
class NemesisDifficultySelector {
    constructor(scene) {
        this.scene = scene;
        
        // Difficulty levels
        this.difficultyLevels = [
            { key: 'veryEasy', label: 'VERY EASY', value: 0.1, color: '#33ff33', description: 'For players new to the game. Longer telegraph times, slower projectiles, less damage.' },
            { key: 'easy', label: 'EASY', value: 0.3, color: '#66ff66', description: 'For casual players. Balanced for an enjoyable experience with moderate challenge.' },
            { key: 'normal', label: 'NORMAL', value: 0.5, color: '#ffcc33', description: 'The standard experience. Recommended for most players.' },
            { key: 'hard', label: 'HARD', value: 0.7, color: '#ff9933', description: 'For experienced players seeking a challenge. Faster attacks and more complex patterns.' },
            { key: 'veryHard', label: 'VERY HARD', value: 0.9, color: '#ff3333', description: 'For expert players. Minimal telegraph times, fast projectiles, maximum damage.' },
            { key: 'adaptive', label: 'ADAPTIVE', value: -1, color: '#33ccff', description: 'Difficulty adjusts based on your performance. Gets easier if you struggle, harder if you excel.' }
        ];
        
        // Selected difficulty
        this.selectedDifficulty = 'adaptive';
        
        // UI elements
        this.container = null;
        this.background = null;
        this.titleText = null;
        this.difficultyButtons = {};
        this.descriptionText = null;
        this.confirmButton = null;
        this.cancelButton = null;
        
        // Load saved difficulty
        this.loadSavedDifficulty();
    }
    
    /**
     * Load saved difficulty from local storage
     */
    loadSavedDifficulty() {
        try {
            const savedDifficulty = localStorage.getItem('nemesis_selected_difficulty');
            if (savedDifficulty) {
                this.selectedDifficulty = savedDifficulty;
            }
        } catch (error) {
            console.warn('Failed to load saved difficulty', error);
        }
    }
    
    /**
     * Show the difficulty selector
     * @param {function} onConfirm - Callback when difficulty is confirmed
     */
    show(onConfirm) {
        this.onConfirmCallback = onConfirm;
        
        // Create UI
        this.createUI();
        
        // Animate in
        this.animateIn();
    }
    
    /**
     * Create the UI elements
     */
    createUI() {
        // Create container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(2000);
        
        // Create semi-transparent background
        this.background = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.8
        );
        
        // Create title
        this.titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            50,
            "SELECT NEMESIS DIFFICULTY",
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Create difficulty panel
        this.difficultyPanel = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 50,
            600,
            300,
            0x333333,
            0.7
        );
        this.difficultyPanel.setStrokeStyle(2, 0x666666, 1);
        
        // Create difficulty buttons
        this.createDifficultyButtons();
        
        // Create description text
        this.descriptionText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 100,
            "Select a difficulty level",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: 500 }
            }
        ).setOrigin(0.5);
        
        // Create confirm button
        this.confirmButton = this.scene.add.text(
            this.scene.cameras.main.width / 2 + 100,
            this.scene.cameras.main.height - 50,
            "CONFIRM",
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setInteractive();
        
        // Add hover effect to confirm button
        this.confirmButton.on('pointerover', () => {
            this.confirmButton.setScale(1.1);
        });
        
        this.confirmButton.on('pointerout', () => {
            this.confirmButton.setScale(1);
        });
        
        // Add click handler to confirm button
        this.confirmButton.on('pointerdown', () => {
            this.confirm();
        });
        
        // Create cancel button
        this.cancelButton = this.scene.add.text(
            this.scene.cameras.main.width / 2 - 100,
            this.scene.cameras.main.height - 50,
            "CANCEL",
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ff3333',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setInteractive();
        
        // Add hover effect to cancel button
        this.cancelButton.on('pointerover', () => {
            this.cancelButton.setScale(1.1);
        });
        
        this.cancelButton.on('pointerout', () => {
            this.cancelButton.setScale(1);
        });
        
        // Add click handler to cancel button
        this.cancelButton.on('pointerdown', () => {
            this.hide();
        });
        
        // Add elements to container
        this.container.add([
            this.background,
            this.titleText,
            this.difficultyPanel,
            this.descriptionText,
            this.confirmButton,
            this.cancelButton
        ]);
        
        // Set initial alpha to 0
        this.container.alpha = 0;
        
        // Update description for selected difficulty
        this.updateDescription();
    }
    
    /**
     * Create difficulty buttons
     */
    createDifficultyButtons() {
        const startX = this.scene.cameras.main.width / 2 - 250;
        const startY = this.scene.cameras.main.height / 2 - 120;
        const buttonWidth = 150;
        const buttonHeight = 40;
        const buttonSpacing = 20;
        const buttonsPerRow = 3;
        
        this.difficultyLevels.forEach((difficulty, index) => {
            // Calculate position
            const row = Math.floor(index / buttonsPerRow);
            const col = index % buttonsPerRow;
            const x = startX + (col * (buttonWidth + buttonSpacing));
            const y = startY + (row * (buttonHeight + buttonSpacing));
            
            // Create button background
            const buttonBg = this.scene.add.rectangle(
                x + buttonWidth / 2,
                y + buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                parseInt(difficulty.color.replace('#', '0x')),
                0.7
            );
            buttonBg.setStrokeStyle(2, 0xffffff, 0.5);
            
            // Create button text
            const buttonText = this.scene.add.text(
                x + buttonWidth / 2,
                y + buttonHeight / 2,
                difficulty.label,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            // Make button interactive
            buttonBg.setInteractive();
            
            // Add hover effect
            buttonBg.on('pointerover', () => {
                buttonBg.setScale(1.05);
                buttonText.setScale(1.05);
            });
            
            buttonBg.on('pointerout', () => {
                buttonBg.setScale(1);
                buttonText.setScale(1);
            });
            
            // Add click handler
            buttonBg.on('pointerdown', () => {
                this.selectDifficulty(difficulty.key);
            });
            
            // Store button references
            this.difficultyButtons[difficulty.key] = {
                background: buttonBg,
                text: buttonText
            };
            
            // Add to container
            this.container.add([buttonBg, buttonText]);
        });
        
        // Highlight selected difficulty
        this.highlightSelectedDifficulty();
    }
    
    /**
     * Highlight the selected difficulty button
     */
    highlightSelectedDifficulty() {
        // Reset all buttons
        Object.values(this.difficultyButtons).forEach(button => {
            button.background.setStrokeStyle(2, 0xffffff, 0.5);
        });
        
        // Highlight selected button
        if (this.difficultyButtons[this.selectedDifficulty]) {
            this.difficultyButtons[this.selectedDifficulty].background.setStrokeStyle(4, 0xffffff, 1);
        }
    }
    
    /**
     * Select a difficulty level
     * @param {string} difficultyKey - Key of the selected difficulty
     */
    selectDifficulty(difficultyKey) {
        this.selectedDifficulty = difficultyKey;
        
        // Highlight selected button
        this.highlightSelectedDifficulty();
        
        // Update description
        this.updateDescription();
    }
    
    /**
     * Update the description text for the selected difficulty
     */
    updateDescription() {
        // Find selected difficulty
        const difficulty = this.difficultyLevels.find(d => d.key === this.selectedDifficulty);
        
        if (difficulty) {
            this.descriptionText.setText(difficulty.description);
        }
    }
    
    /**
     * Animate the UI in
     */
    animateIn() {
        // Fade in container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }
    
    /**
     * Hide the difficulty selector
     */
    hide() {
        // Fade out container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Destroy container
                this.container.destroy();
                
                // Resume game
                this.scene.scene.resume();
            }
        });
    }
    
    /**
     * Confirm the selected difficulty
     */
    confirm() {
        // Save selected difficulty
        this.saveDifficulty();
        
        // Hide the selector
        this.hide();
        
        // Call the confirm callback
        if (this.onConfirmCallback) {
            // Find selected difficulty
            const difficulty = this.difficultyLevels.find(d => d.key === this.selectedDifficulty);
            
            if (difficulty) {
                this.onConfirmCallback(difficulty);
            }
        }
    }
    
    /**
     * Save selected difficulty to local storage
     */
    saveDifficulty() {
        try {
            localStorage.setItem('nemesis_selected_difficulty', this.selectedDifficulty);
        } catch (error) {
            console.warn('Failed to save selected difficulty', error);
        }
    }
    
    /**
     * Get the selected difficulty value
     * @returns {number} Difficulty value (-1 for adaptive)
     */
    getSelectedDifficultyValue() {
        const difficulty = this.difficultyLevels.find(d => d.key === this.selectedDifficulty);
        return difficulty ? difficulty.value : 0.5;
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisDifficultySelector = NemesisDifficultySelector;
}
