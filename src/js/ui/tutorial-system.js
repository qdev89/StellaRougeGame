/**
 * Tutorial System
 * Provides in-game tutorials and help for new players
 */
class TutorialSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Tutorial state
        this.active = false;
        this.currentStep = 0;
        this.tutorialComplete = false;
        
        // Tutorial elements
        this.container = null;
        this.background = null;
        this.titleText = null;
        this.descriptionText = null;
        this.nextButton = null;
        this.skipButton = null;
        this.highlightBox = null;
        
        // Tutorial steps - will be set by specific tutorial types
        this.steps = [];
        
        // Check if tutorial has been completed before
        this.checkTutorialStatus();
    }
    
    /**
     * Check if the tutorial has been completed before
     */
    checkTutorialStatus() {
        try {
            const tutorialKey = `tutorial_complete_${this.getTutorialKey()}`;
            const completed = localStorage.getItem(tutorialKey);
            this.tutorialComplete = completed === 'true';
        } catch (error) {
            console.warn('Failed to check tutorial status', error);
            this.tutorialComplete = false;
        }
    }
    
    /**
     * Get the key for this specific tutorial
     * Override in subclasses
     */
    getTutorialKey() {
        return 'base';
    }
    
    /**
     * Start the tutorial
     * @param {boolean} force - Force tutorial to show even if completed before
     */
    startTutorial(force = false) {
        // Skip if already active
        if (this.active) return;
        
        // If tutorial is complete, only show if explicitly requested
        if (this.tutorialComplete && !force) return;
        
        // Set active
        this.active = true;
        this.currentStep = 0;
        
        // Pause the game if in a gameplay scene
        if (this.scene.scene.key === CONSTANTS.SCENES.GAME) {
            this.scene.scene.pause();
        }
        
        // Create tutorial UI
        this.createTutorialUI();
        
        // Show first step
        this.showStep(0);
    }
    
    /**
     * Create the tutorial UI
     */
    createTutorialUI() {
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
            0.7
        );
        
        // Create title text
        this.titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            "TUTORIAL",
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Create description text
        this.descriptionText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            "Learn how to play Stellar Rogue",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#cccccc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: this.scene.cameras.main.width * 0.8 }
            }
        ).setOrigin(0.5);
        
        // Create next button
        this.nextButton = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 150,
            "NEXT",
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Add hover effect to next button
        this.nextButton.on('pointerover', () => {
            this.nextButton.setScale(1.1);
        });
        
        this.nextButton.on('pointerout', () => {
            this.nextButton.setScale(1);
        });
        
        // Add click handler to next button
        this.nextButton.on('pointerdown', () => {
            this.nextStep();
        });
        
        // Create skip button
        this.skipButton = this.scene.add.text(
            this.scene.cameras.main.width - 20,
            20,
            "SKIP TUTORIAL",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'right',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        
        // Add hover effect to skip button
        this.skipButton.on('pointerover', () => {
            this.skipButton.setColor('#ffffff');
        });
        
        this.skipButton.on('pointerout', () => {
            this.skipButton.setColor('#cccccc');
        });
        
        // Add click handler to skip button
        this.skipButton.on('pointerdown', () => {
            this.endTutorial();
        });
        
        // Add elements to container
        this.container.add([this.background, this.titleText, this.descriptionText, this.nextButton, this.skipButton]);
        
        // Add keyboard controls
        this.scene.input.keyboard.on('keydown-SPACE', this.handleKeyboardNext, this);
        this.scene.input.keyboard.on('keydown-ENTER', this.handleKeyboardNext, this);
        this.scene.input.keyboard.on('keydown-ESC', this.handleKeyboardSkip, this);
    }
    
    /**
     * Handle keyboard next
     */
    handleKeyboardNext() {
        if (this.active) {
            this.nextStep();
        }
    }
    
    /**
     * Handle keyboard skip
     */
    handleKeyboardSkip() {
        if (this.active) {
            this.endTutorial();
        }
    }
    
    /**
     * Show a specific tutorial step
     * @param {number} stepIndex - Index of the step to show
     */
    showStep(stepIndex) {
        // Validate step index
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            this.endTutorial();
            return;
        }
        
        // Get step data
        const step = this.steps[stepIndex];
        
        // Update title and description
        this.titleText.setText(step.title);
        this.descriptionText.setText(step.description);
        
        // Update button text for last step
        if (stepIndex === this.steps.length - 1) {
            this.nextButton.setText("FINISH");
        } else {
            this.nextButton.setText("NEXT");
        }
        
        // Show highlight if needed
        this.showHighlight(step.highlight);
    }
    
    /**
     * Show highlight for a specific element
     * @param {Object} highlight - Highlight configuration
     */
    showHighlight(highlight) {
        // Remove existing highlight
        if (this.highlightBox) {
            this.highlightBox.destroy();
            this.highlightBox = null;
        }
        
        // Skip if no highlight
        if (!highlight) return;
        
        // Get target element
        let target = null;
        
        if (highlight.element) {
            // Direct element reference
            target = highlight.element;
        } else if (highlight.selector) {
            // Find element by selector (custom implementation)
            target = this.findElementBySelector(highlight.selector);
        }
        
        // Skip if no target found
        if (!target) return;
        
        // Create highlight box
        const padding = highlight.padding || 10;
        this.highlightBox = this.scene.add.rectangle(
            target.x,
            target.y,
            target.width + padding * 2,
            target.height + padding * 2,
            0x33aaff,
            0.3
        ).setOrigin(0.5);
        
        // Add stroke
        this.highlightBox.setStrokeStyle(2, 0x33aaff, 1);
        
        // Add to container
        this.container.add(this.highlightBox);
        
        // Add pulsing animation
        this.scene.tweens.add({
            targets: this.highlightBox,
            alpha: { from: 0.3, to: 0.6 },
            scale: { from: 1, to: 1.05 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Find element by selector
     * @param {string} selector - Element selector
     * @returns {Object} - Found element or null
     */
    findElementBySelector(selector) {
        // This is a simplified implementation
        // In a real game, you would have a more robust system
        
        // Check for special selectors
        if (selector === 'player') {
            return this.scene.player;
        } else if (selector === 'healthBar') {
            return this.scene.healthBar;
        } else if (selector === 'shieldBar') {
            return this.scene.shieldBar;
        } else if (selector === 'scoreText') {
            return this.scene.scoreText;
        }
        
        // Default to null
        return null;
    }
    
    /**
     * Go to the next step
     */
    nextStep() {
        this.currentStep++;
        
        if (this.currentStep >= this.steps.length) {
            this.endTutorial();
        } else {
            this.showStep(this.currentStep);
        }
    }
    
    /**
     * End the tutorial
     */
    endTutorial() {
        // Mark tutorial as complete
        this.tutorialComplete = true;
        
        try {
            const tutorialKey = `tutorial_complete_${this.getTutorialKey()}`;
            localStorage.setItem(tutorialKey, 'true');
        } catch (error) {
            console.warn('Failed to save tutorial status', error);
        }
        
        // Remove keyboard listeners
        this.scene.input.keyboard.off('keydown-SPACE', this.handleKeyboardNext, this);
        this.scene.input.keyboard.off('keydown-ENTER', this.handleKeyboardNext, this);
        this.scene.input.keyboard.off('keydown-ESC', this.handleKeyboardSkip, this);
        
        // Destroy tutorial UI
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        // Set inactive
        this.active = false;
        
        // Resume the game if in a gameplay scene
        if (this.scene.scene.key === CONSTANTS.SCENES.GAME) {
            this.scene.scene.resume();
        }
    }
    
    /**
     * Reset tutorial completion status
     */
    resetTutorialStatus() {
        try {
            const tutorialKey = `tutorial_complete_${this.getTutorialKey()}`;
            localStorage.removeItem(tutorialKey);
            this.tutorialComplete = false;
        } catch (error) {
            console.warn('Failed to reset tutorial status', error);
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.TutorialSystem = TutorialSystem;
}
