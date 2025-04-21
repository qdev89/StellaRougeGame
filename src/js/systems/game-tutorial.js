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
        
        // Create panel background
        const panelWidth = 400;
        const panelHeight = 150;
        const panel = this.scene.add.rectangle(
            panelX, panelY,
            panelWidth, panelHeight,
            0x000033, 0.8
        ).setScrollFactor(0).setStrokeStyle(2, 0x3399ff).setDepth(1000);
        
        // Create title text
        const title = this.scene.add.text(
            panelX, panelY - 50,
            step.title,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#3399ff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 4
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1001);
        
        // Create content text
        const content = this.scene.add.text(
            panelX, panelY,
            step.content,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 2,
                wordWrap: { width: panelWidth - 40 }
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1001);
        
        // Create next button
        const nextButton = this.scene.add.text(
            panelX, panelY + 50,
            'NEXT',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 2
            }
        ).setScrollFactor(0).setOrigin(0.5).setDepth(1001)
          .setInteractive({ useHandCursor: true });
        
        // Add hover effect to next button
        nextButton.on('pointerover', () => {
            nextButton.setColor('#ffffff');
        });
        
        nextButton.on('pointerout', () => {
            nextButton.setColor('#33ff33');
        });
        
        // Add click handler to next button
        nextButton.on('pointerdown', () => {
            this.nextStep();
        });
        
        // Add elements to the tutorial elements array for later cleanup
        this.tutorialElements.push(panel, title, content, nextButton);
        
        // Add entrance animation
        this.scene.tweens.add({
            targets: [panel, title, content, nextButton],
            alpha: { from: 0, to: 1 },
            y: { from: panelY - 20, to: panelY },
            duration: 300,
            ease: 'Power2',
            onStart: () => {
                title.y -= 50;
                content.y += 0;
                nextButton.y += 50;
            }
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
            // Create highlight rectangle
            const highlight = this.scene.add.rectangle(
                x, y, width, height,
                0x3399ff, 0.3
            ).setScrollFactor(elementType === 'player' ? 1 : 0)
             .setStrokeStyle(2, 0x3399ff)
             .setDepth(999);
            
            // Add pulsing animation
            this.scene.tweens.add({
                targets: highlight,
                alpha: { from: 0.3, to: 0.6 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
            
            // Add to tutorial elements for cleanup
            this.tutorialElements.push(highlight);
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
            this.endTutorial();
        } else {
            this.showCurrentStep();
        }
    }
    
    /**
     * End the tutorial
     */
    endTutorial() {
        if (!this.tutorialActive) return;
        
        console.log('Tutorial completed');
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
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.GameTutorial = GameTutorial;
}
