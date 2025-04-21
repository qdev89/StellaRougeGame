/**
 * Game Tutorial System
 * Provides step-by-step tutorial guidance for new players
 */
class GameTutorial {
    constructor(scene) {
        this.scene = scene;
        this.steps = [];
        this.currentStep = 0;
        this.tutorialActive = false;
        this.tutorialComplete = this.checkTutorialComplete();
        this.tutorialElements = [];

        // Define tutorial steps
        this.defineSteps();
    }

    /**
     * Check if the tutorial has been completed before
     */
    checkTutorialComplete() {
        // Check if tutorial completion is stored in game state
        if (this.scene.game.global && this.scene.game.global.tutorialComplete) {
            return true;
        }

        // Default to false if not found
        return false;
    }

    /**
     * Define the tutorial steps
     */
    defineSteps() {
        this.steps = [
            {
                id: 'guide_intro',
                type: 'Guide and Tutorial',
                title: 'STELLAR ROGUE GUIDE',
                content: 'Welcome to Stellar Rogue! This guide will help you learn the basics of the game. Press NEXT to continue or SKIP ALL to jump right in.',
                position: 'center',
                highlight: null,
                action: null,
                nextTrigger: 'button',
                nextDelay: 0
            },
            {
                id: 'welcome',
                title: 'WELCOME TO STELLAR ROGUE',
                content: 'This tutorial will guide you through the basics of gameplay.',
                position: 'center',
                highlight: null,
                action: null,
                nextTrigger: 'time',
                nextDelay: 3000
            },
            {
                id: 'movement',
                title: 'SHIP MOVEMENT',
                content: 'Use WASD or ARROW KEYS to move your ship.',
                position: 'bottom',
                highlight: 'player',
                action: null,
                nextTrigger: 'movement',
                nextDelay: 0
            },
            {
                id: 'shooting',
                title: 'WEAPONS',
                content: 'Your ship fires automatically. Move to aim at enemies.',
                position: 'right',
                highlight: 'weapon',
                action: null,
                nextTrigger: 'enemy_hit',
                nextDelay: 0
            },
            {
                id: 'dash',
                title: 'DASH ABILITY',
                content: 'Press SPACE to dash and avoid enemy fire.',
                position: 'bottom',
                highlight: 'player',
                action: null,
                nextTrigger: 'dash',
                nextDelay: 0
            },
            {
                id: 'health',
                title: 'HULL INTEGRITY',
                content: 'This is your ship\'s health. Don\'t let it reach zero!',
                position: 'left',
                highlight: 'health',
                action: null,
                nextTrigger: 'time',
                nextDelay: 5000
            },
            {
                id: 'shields',
                title: 'SHIELD SYSTEM',
                content: 'Shields absorb damage and recharge over time.',
                position: 'left',
                highlight: 'shield',
                action: null,
                nextTrigger: 'time',
                nextDelay: 5000
            },
            {
                id: 'weapons_switch',
                title: 'WEAPON SWITCHING',
                content: 'Press 1-7 number keys to switch between weapons.',
                position: 'right',
                highlight: 'weapon_icons',
                action: null,
                nextTrigger: 'weapon_switch',
                nextDelay: 0
            },
            {
                id: 'ammo',
                title: 'WEAPON AMMO',
                content: 'Special weapons have limited ammo. Defeat enemies to find more.',
                position: 'right',
                highlight: 'ammo',
                action: null,
                nextTrigger: 'time',
                nextDelay: 5000
            },
            {
                id: 'progress',
                title: 'SECTOR PROGRESS',
                content: 'This bar shows your progress through the current sector.',
                position: 'top',
                highlight: 'progress',
                action: null,
                nextTrigger: 'time',
                nextDelay: 5000
            },
            {
                id: 'enemies',
                title: 'ENEMY TYPES',
                content: 'Different enemies have different behaviors and attacks.',
                position: 'center',
                highlight: null,
                action: null,
                nextTrigger: 'time',
                nextDelay: 5000
            },
            {
                id: 'completion',
                title: 'TUTORIAL COMPLETE',
                content: 'You\'re ready to play! Good luck, pilot!',
                position: 'center',
                highlight: null,
                action: null,
                nextTrigger: 'time',
                nextDelay: 3000
            }
        ];
    }

    /**
     * Start the tutorial sequence
     */
    startTutorial() {
        if (this.tutorialComplete) {
            console.log('Tutorial already completed, skipping...');
            return;
        }

        console.log('Starting tutorial...');
        this.tutorialActive = true;
        this.currentStep = 0;

        // Show the first step
        this.showCurrentStep();

        // Set up event listeners for tutorial progression
        this.setupEventListeners();

        // Add ESC key to skip tutorial
        this.escKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on('down', () => {
            this.endTutorial();
        });
    }

    /**
     * Show the current tutorial step
     */
    showCurrentStep() {
        if (!this.tutorialActive || this.currentStep >= this.steps.length) {
            this.endTutorial();
            return;
        }

        // Clear any existing tutorial elements
        this.clearTutorialElements();

        // Get the current step
        const step = this.steps[this.currentStep];
        console.log(`Showing tutorial step: ${step.id}`);

        // Create tutorial panel
        this.createTutorialPanel(step);

        // Highlight relevant UI element if specified
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }

        // Set up automatic progression if using time trigger
        if (step.nextTrigger === 'time') {
            this.scene.time.delayedCall(step.nextDelay, () => {
                this.nextStep();
            });
        }
    }

    /**
     * Create the tutorial panel UI
     */
    createTutorialPanel(step) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Determine panel position based on step.position
        let panelX, panelY;
        switch (step.position) {
            case 'top':
                panelX = width / 2;
                panelY = 100;
                break;
            case 'bottom':
                panelX = width / 2;
                panelY = height - 100;
                break;
            case 'left':
                panelX = 200;
                panelY = height / 2;
                break;
            case 'right':
                panelX = width - 200;
                panelY = height / 2;
                break;
            case 'center':
            default:
                panelX = width / 2;
                panelY = height / 2;
                break;
        }

        // Create skip tutorial button in the top-right corner
        const skipButton = this.scene.add.text(
            width - 20,
            20,
            'SKIP STEP',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'right',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
            }
        ).setScrollFactor(0).setOrigin(1, 0).setDepth(1002)
         .setInteractive({ useHandCursor: true });

        // Add hover effect to skip button
        skipButton.on('pointerover', () => {
            skipButton.setColor('#ffffff');
            skipButton.setShadow(1, 1, '#33aaff', 5, true);
        });

        skipButton.on('pointerout', () => {
            skipButton.setColor('#cccccc');
            skipButton.setShadow(1, 1, '#000000', 2, true);
        });

        // Add click handler to skip button
        skipButton.on('pointerdown', () => {
            this.nextStep();
        });

        // Create skip ALL tutorial button below the skip step button - with enhanced visibility
        // Create button background for better visibility
        const skipAllBg = this.scene.add.rectangle(
            width - 70,
            50,
            100, 30,
            0xaa3333, 0.8
        ).setScrollFactor(0).setStrokeStyle(2, 0xff3333, 0.9).setDepth(1001)
         .setInteractive({ useHandCursor: true });

        const skipAllButton = this.scene.add.text(
            width - 70,
            50,
            'SKIP ALL',
            {
                fontFamily: 'monospace',
                fontSize: '18px', // Increased size
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true },
                fontWeight: 'bold' // Added bold
            }
        ).setScrollFactor(0).setOrigin(0.5, 0.5).setDepth(1002);

        // Add hover effect to skip all button
        skipAllBg.on('pointerover', () => {
            skipAllBg.setFillStyle(0xff3333, 0.9); // Brighter red
            skipAllButton.setColor('#ffffff');
            skipAllButton.setShadow(1, 1, '#ffff33', 5, true);

            // Add scale animation on hover
            this.scene.tweens.add({
                targets: [skipAllBg, skipAllButton],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: 'Power1'
            });
        });

        skipAllBg.on('pointerout', () => {
            skipAllBg.setFillStyle(0xaa3333, 0.8); // Return to original color
            skipAllButton.setColor('#ffffff');
            skipAllButton.setShadow(1, 1, '#000000', 2, true);

            // Reset scale on pointer out
            this.scene.tweens.add({
                targets: [skipAllBg, skipAllButton],
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power1'
            });
        });

        // Add click handler to skip all button with enhanced feedback
        skipAllBg.on('pointerdown', () => {
            // Add click feedback
            this.scene.tweens.add({
                targets: [skipAllBg, skipAllButton],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                ease: 'Power1',
                onComplete: () => {
                    this.endTutorial();
                }
            });
        });

        // Add to tutorial elements for cleanup
        this.tutorialElements.push(skipButton, skipAllBg, skipAllButton);

        // Create panel background with enhanced styling
        const panelWidth = 450; // Increased from 400
        const panelHeight = 180; // Increased from 150

        // Add glow effect behind panel
        const glow = this.scene.add.rectangle(
            panelX, panelY,
            panelWidth + 20, panelHeight + 20,
            0x3399ff, 0.2
        ).setScrollFactor(0).setDepth(999);

        // Create main panel with enhanced styling
        const panel = this.scene.add.rectangle(
            panelX, panelY,
            panelWidth, panelHeight,
            0x000033, 0.9 // Increased opacity from 0.8
        ).setScrollFactor(0).setStrokeStyle(3, 0x3399ff, 0.8).setDepth(1000); // Thicker stroke

        // Add step indicator (e.g., "Step 3/11")
        const stepIndicator = this.scene.add.text(
            panelX, panelY - panelHeight/2 - 15,
            `STEP ${this.currentStep + 1}/${this.steps.length}`,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#66ccff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 2
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1001);

        // Create title text with enhanced styling
        const title = this.scene.add.text(
            panelX, panelY - 60,
            step.title,
            {
                fontFamily: 'monospace',
                fontSize: '24px', // Increased from 20px
                color: '#3399ff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 4,
                fontWeight: 'bold', // Added bold
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true } // Added shadow
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1001);

        // Create content text with enhanced styling
        const content = this.scene.add.text(
            panelX, panelY,
            step.content,
            {
                fontFamily: 'monospace',
                fontSize: '18px', // Increased from 16px
                color: '#ffffff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 3, // Increased from 2
                wordWrap: { width: panelWidth - 60 } // Adjusted for larger panel
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1001);

        // Create next button with enhanced styling
        // Create button background
        const buttonBg = this.scene.add.rectangle(
            panelX, panelY + 60,
            100, 40,
            0x33aa33, 0.7
        ).setScrollFactor(0).setStrokeStyle(2, 0x33ff33, 0.8).setDepth(1001)
          .setInteractive({ useHandCursor: true });

        // Create button text
        const nextButton = this.scene.add.text(
            panelX, panelY + 60,
            'NEXT',
            {
                fontFamily: 'monospace',
                fontSize: '18px', // Increased from 16px
                color: '#ffffff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 3, // Increased from 2
                fontWeight: 'bold' // Added bold
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1002);

        // Add hover effect to next button with enhanced feedback
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x33ff33, 0.9); // Brighter green
            nextButton.setColor('#ffffff');

            // Add scale animation on hover
            this.scene.tweens.add({
                targets: [buttonBg, nextButton],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: 'Power1'
            });
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x33aa33, 0.7); // Return to original color
            nextButton.setColor('#ffffff');

            // Reset scale on pointer out
            this.scene.tweens.add({
                targets: [buttonBg, nextButton],
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power1'
            });
        });

        // Add click handler to next button with enhanced feedback
        buttonBg.on('pointerdown', () => {
            // Add click feedback
            this.scene.tweens.add({
                targets: [buttonBg, nextButton],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                ease: 'Power1',
                onComplete: () => {
                    this.nextStep();
                }
            });
        });

        // Add elements to the tutorial elements array for later cleanup
        this.tutorialElements.push(panel, glow, stepIndicator, title, content, buttonBg, nextButton);

        // Add entrance animation with enhanced effect
        this.scene.tweens.add({
            targets: [panel, glow, stepIndicator, title, content, buttonBg, nextButton],
            alpha: { from: 0, to: 1 },
            y: { from: panelY - 30, to: panelY }, // Increased from -20 for more dramatic effect
            duration: 500, // Increased from 300
            ease: 'Back.easeOut', // Changed from Power2 for more dynamic effect
            onStart: () => {
                title.y -= 60;
                content.y += 0;
                buttonBg.y += 60;
                nextButton.y += 60;
                stepIndicator.y -= 15;
            }
        });

        // Add subtle pulse animation to glow
        this.scene.tweens.add({
            targets: glow,
            alpha: { from: 0.2, to: 0.4 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Highlight a UI element for the tutorial
     */
    highlightElement(elementType) {
        let element;
        let x, y, width, height;

        // Find the element to highlight
        switch (elementType) {
            case 'player':
                element = this.scene.player;
                if (element) {
                    x = element.x;
                    y = element.y;
                    width = 80;
                    height = 80;
                }
                break;
            case 'health':
                if (this.scene.healthBarContainer) {
                    x = this.scene.healthBarContainer.x + 150;
                    y = this.scene.healthBarContainer.y;
                    width = 300;
                    height = 50;
                }
                break;
            case 'shield':
                if (this.scene.shieldBarContainer) {
                    x = this.scene.shieldBarContainer.x + 150;
                    y = this.scene.shieldBarContainer.y;
                    width = 300;
                    height = 50;
                }
                break;
            case 'weapon':
                if (this.scene.weaponNameText) {
                    x = this.scene.weaponNameText.x;
                    y = this.scene.weaponNameText.y;
                    width = 200;
                    height = 50;
                }
                break;
            case 'ammo':
                if (this.scene.ammoText) {
                    x = this.scene.ammoText.x;
                    y = this.scene.ammoText.y;
                    width = 150;
                    height = 50;
                }
                break;
            case 'weapon_icons':
                if (this.scene.weaponIconsContainer) {
                    x = this.scene.weaponIconsContainer.x;
                    y = this.scene.weaponIconsContainer.y;
                    width = 350;
                    height = 60;
                }
                break;
            case 'progress':
                if (this.scene.progressBarContainer) {
                    x = this.scene.progressBarContainer.x;
                    y = this.scene.progressBarContainer.y;
                    width = 300;
                    height = 40;
                }
                break;
            default:
                return; // No element to highlight
        }

        // If element was found, create highlight effect
        if (x !== undefined && y !== undefined) {
            // Create outer glow effect
            const outerGlow = this.scene.add.rectangle(
                x, y, width + 20, height + 20,
                0x66ccff, 0.2
            ).setScrollFactor(elementType === 'player' ? 1 : 0)
             .setDepth(998);

            // Create highlight rectangle with enhanced styling
            const highlight = this.scene.add.rectangle(
                x, y, width, height,
                0x3399ff, 0.4 // Increased from 0.3
            ).setScrollFactor(elementType === 'player' ? 1 : 0)
             .setStrokeStyle(3, 0x66ccff, 0.8) // Thicker, brighter stroke
             .setDepth(999);

            // Create corner markers for better visibility
            const cornerSize = 10;
            const halfWidth = width / 2;
            const halfHeight = height / 2;

            // Top-left corner
            const topLeft = this.scene.add.graphics()
                .setScrollFactor(elementType === 'player' ? 1 : 0)
                .setDepth(999);
            topLeft.lineStyle(3, 0xffffff, 1);
            topLeft.beginPath();
            topLeft.moveTo(x - halfWidth, y - halfHeight + cornerSize);
            topLeft.lineTo(x - halfWidth, y - halfHeight);
            topLeft.lineTo(x - halfWidth + cornerSize, y - halfHeight);
            topLeft.strokePath();

            // Top-right corner
            const topRight = this.scene.add.graphics()
                .setScrollFactor(elementType === 'player' ? 1 : 0)
                .setDepth(999);
            topRight.lineStyle(3, 0xffffff, 1);
            topRight.beginPath();
            topRight.moveTo(x + halfWidth - cornerSize, y - halfHeight);
            topRight.lineTo(x + halfWidth, y - halfHeight);
            topRight.lineTo(x + halfWidth, y - halfHeight + cornerSize);
            topRight.strokePath();

            // Bottom-left corner
            const bottomLeft = this.scene.add.graphics()
                .setScrollFactor(elementType === 'player' ? 1 : 0)
                .setDepth(999);
            bottomLeft.lineStyle(3, 0xffffff, 1);
            bottomLeft.beginPath();
            bottomLeft.moveTo(x - halfWidth, y + halfHeight - cornerSize);
            bottomLeft.lineTo(x - halfWidth, y + halfHeight);
            bottomLeft.lineTo(x - halfWidth + cornerSize, y + halfHeight);
            bottomLeft.strokePath();

            // Bottom-right corner
            const bottomRight = this.scene.add.graphics()
                .setScrollFactor(elementType === 'player' ? 1 : 0)
                .setDepth(999);
            bottomRight.lineStyle(3, 0xffffff, 1);
            bottomRight.beginPath();
            bottomRight.moveTo(x + halfWidth - cornerSize, y + halfHeight);
            bottomRight.lineTo(x + halfWidth, y + halfHeight);
            bottomRight.lineTo(x + halfWidth, y + halfHeight - cornerSize);
            bottomRight.strokePath();

            // Add pulsing animation with enhanced effect
            this.scene.tweens.add({
                targets: [highlight, outerGlow],
                alpha: { from: highlight.alpha, to: highlight.alpha + 0.3 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Add subtle scale animation to corner markers
            this.scene.tweens.add({
                targets: [topLeft, topRight, bottomLeft, bottomRight],
                scaleX: { from: 1, to: 1.2 },
                scaleY: { from: 1, to: 1.2 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Add to tutorial elements for cleanup
            this.tutorialElements.push(highlight, outerGlow, topLeft, topRight, bottomLeft, bottomRight);
        }
    }

    /**
     * Set up event listeners for tutorial progression
     */
    setupEventListeners() {
        // Movement detection
        this.movementDetected = false;
        this.scene.input.keyboard.on('keydown-W', this.onMovement, this);
        this.scene.input.keyboard.on('keydown-A', this.onMovement, this);
        this.scene.input.keyboard.on('keydown-S', this.onMovement, this);
        this.scene.input.keyboard.on('keydown-D', this.onMovement, this);
        this.scene.input.keyboard.on('keydown-UP', this.onMovement, this);
        this.scene.input.keyboard.on('keydown-LEFT', this.onMovement, this);
        this.scene.input.keyboard.on('keydown-DOWN', this.onMovement, this);
        this.scene.input.keyboard.on('keydown-RIGHT', this.onMovement, this);

        // Dash detection
        this.dashDetected = false;
        this.scene.input.keyboard.on('keydown-SPACE', this.onDash, this);

        // Weapon switch detection
        this.weaponSwitchDetected = false;
        for (let i = 1; i <= 7; i++) {
            this.scene.input.keyboard.on(`keydown-${i}`, this.onWeaponSwitch, this);
        }

        // Enemy hit detection
        this.enemyHitDetected = false;
        if (this.scene.events) {
            this.scene.events.on('enemy-hit', this.onEnemyHit, this);
        }
    }

    /**
     * Handle movement event
     */
    onMovement() {
        if (!this.tutorialActive) return;

        this.movementDetected = true;

        // Check if current step is waiting for movement
        const currentStep = this.steps[this.currentStep];
        if (currentStep && currentStep.nextTrigger === 'movement') {
            this.nextStep();
        }
    }

    /**
     * Handle dash event
     */
    onDash() {
        if (!this.tutorialActive) return;

        this.dashDetected = true;

        // Check if current step is waiting for dash
        const currentStep = this.steps[this.currentStep];
        if (currentStep && currentStep.nextTrigger === 'dash') {
            this.nextStep();
        }
    }

    /**
     * Handle weapon switch event
     */
    onWeaponSwitch() {
        if (!this.tutorialActive) return;

        this.weaponSwitchDetected = true;

        // Check if current step is waiting for weapon switch
        const currentStep = this.steps[this.currentStep];
        if (currentStep && currentStep.nextTrigger === 'weapon_switch') {
            this.nextStep();
        }
    }

    /**
     * Handle enemy hit event
     */
    onEnemyHit() {
        if (!this.tutorialActive) return;

        this.enemyHitDetected = true;

        // Check if current step is waiting for enemy hit
        const currentStep = this.steps[this.currentStep];
        if (currentStep && currentStep.nextTrigger === 'enemy_hit') {
            this.nextStep();
        }
    }

    /**
     * Advance to the next tutorial step
     */
    nextStep() {
        if (!this.tutorialActive) return;

        this.currentStep++;

        if (this.currentStep >= this.steps.length) {
            this.endTutorial(true); // Pass true to indicate natural completion
        } else {
            this.showCurrentStep();
        }
    }

    /**
     * End the tutorial
     * @param {boolean} completed - Whether the tutorial was completed naturally (true) or skipped (false)
     */
    endTutorial(completed = false) {
        if (!this.tutorialActive) return;

        console.log(completed ? 'Tutorial completed naturally' : 'Tutorial skipped');
        this.tutorialActive = false;
        this.tutorialComplete = true;

        // Store tutorial completion in game state
        if (this.scene.game.global) {
            this.scene.game.global.tutorialComplete = true;
        }

        // Clean up tutorial elements
        this.clearTutorialElements();

        // Remove event listeners
        this.removeEventListeners();

        // Remove ESC key listener
        if (this.escKey) {
            this.escKey.removeAllListeners();
        }

        // Show a brief message based on how the tutorial ended
        if (completed) {
            this.showTutorialCompletedMessage();
        } else {
            this.showTutorialSkippedMessage();
        }
    }

    /**
     * Clear all tutorial UI elements
     */
    clearTutorialElements() {
        this.tutorialElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });

        this.tutorialElements = [];
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        // Remove keyboard listeners
        this.scene.input.keyboard.off('keydown-W', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-A', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-S', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-D', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-UP', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-LEFT', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-DOWN', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-RIGHT', this.onMovement, this);
        this.scene.input.keyboard.off('keydown-SPACE', this.onDash, this);

        for (let i = 1; i <= 7; i++) {
            this.scene.input.keyboard.off(`keydown-${i}`, this.onWeaponSwitch, this);
        }

        // Remove game event listeners
        if (this.scene.events) {
            this.scene.events.off('enemy-hit', this.onEnemyHit, this);
        }
    }

    /**
     * Show a brief message when the tutorial is skipped
     */
    showTutorialSkippedMessage() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Create message text
        const message = this.scene.add.text(
            width / 2,
            height / 2,
            'TUTORIAL SKIPPED\nPress H for help anytime',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ff9999', // Red tint for skipped
                align: 'center',
                stroke: '#000033',
                strokeThickness: 4,
                fontWeight: 'bold',
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1005);

        // Add fade in/out animation
        this.scene.tweens.add({
            targets: message,
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            hold: 1500,
            onComplete: () => {
                message.destroy();
            }
        });
    }

    /**
     * Show a brief message when tutorial is completed naturally
     */
    showTutorialCompletedMessage() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Create message text
        const message = this.scene.add.text(
            width / 2,
            height / 2 - 20,
            'TUTORIAL COMPLETED',
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#99ff99', // Green tint for completion
                align: 'center',
                stroke: '#000033',
                strokeThickness: 4,
                fontWeight: 'bold',
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1005);

        // Add a congratulatory subtext
        const subtext = this.scene.add.text(
            width / 2,
            height / 2 + 20,
            'You\'re ready for action!\nPress H for help anytime',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 3,
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1005);

        // Add fade in/out animation for both texts
        this.scene.tweens.add({
            targets: [message, subtext],
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            hold: 2000,
            onComplete: () => {
                message.destroy();
                subtext.destroy();
            }
        });
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.GameTutorial = GameTutorial;
}
