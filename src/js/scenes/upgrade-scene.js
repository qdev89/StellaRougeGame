/**
 * Upgrade Scene
 * Displayed between sectors, shows major upgrade choices and sector info
 */
class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.UPGRADE });
    }

    init(data) {
        // Store the data passed from the previous scene
        this.nextSector = data.sector || 1;
        this.score = data.score || 0;
        this.shipType = data.shipType || 'fighter';
        this.upgrades = data.upgrades || [];
        this.penalties = data.penalties || [];
    }

    create() {
        console.log('UpgradeScene: Preparing for sector', this.nextSector);
        
        // Create background
        this.createBackground();
        
        // Setup UI elements
        this.createUI();
        
        // Create choice system if it doesn't exist
        this.choiceSystem = this.choiceSystem || new ChoiceSystem(this);
        
        // Generate a special between-sector choice
        this.currentChoice = this.choiceSystem.generateChoice('path');
        
        // Display the choice UI
        this.displayChoiceUI();
        
        // Setup event handlers
        this.setupEvents();
        
        // Calculate reward modifiers based on previous sector
        this.calculateRewardModifiers();
        
        // Play background music
        // this.playMusic();
    }

    createBackground() {
        // Create a starfield background
        this.bgStars = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-stars')
            .setOrigin(0, 0)
            .setScrollFactor(0);
            
        // Add a nebula effect
        this.bgNebula = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-nebula')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(0.4);
        
        // Add a planet in the background for visual interest
        this.bgPlanets = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg-planets')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(0.8);
    }

    createUI() {
        // Add header text
        this.add.text(this.cameras.main.width / 2, 50, 'SECTOR COMPLETE', {
            fontFamily: 'monospace',
            fontSize: '36px',
            color: '#33ff33',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add sector info
        this.add.text(this.cameras.main.width / 2, 100, `ENTERING SECTOR ${this.nextSector}`, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add score
        this.add.text(this.cameras.main.width / 2, 140, `SCORE: ${this.score}`, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffff33',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add ship status section
        this.add.text(100, 200, 'SHIP STATUS:', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#33ff33',
            align: 'left'
        });
        
        // Ship type
        this.add.text(120, 230, `TYPE: ${this.capitalizeFirst(this.shipType)}`, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            align: 'left'
        });
        
        // Active upgrades
        this.add.text(120, 260, 'UPGRADES:', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#3388ff',
            align: 'left'
        });
        
        // List upgrades (simplified for now)
        let yPos = 290;
        this.upgrades.forEach((upgrade, index) => {
            if (index < 4) { // Show max 4 upgrades to avoid cluttering UI
                this.add.text(140, yPos, `• ${upgrade.name || upgrade.type}`, {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'left'
                });
                yPos += 25;
            } else if (index === 4) {
                this.add.text(140, yPos, `• And ${this.upgrades.length - 4} more...`, {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'left'
                });
            }
        });
        
        if (this.upgrades.length === 0) {
            this.add.text(140, yPos, '• None', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'left'
            });
            yPos += 25;
        }
        
        // Active penalties
        yPos += 10;
        this.add.text(120, yPos, 'SYSTEM DAMAGE:', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ff3333',
            align: 'left'
        });
        
        // List penalties
        yPos += 30;
        this.penalties.forEach((penalty, index) => {
            if (index < 3) { // Show max 3 penalties
                this.add.text(140, yPos, `• ${penalty.name || penalty.type}`, {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'left'
                });
                yPos += 25;
            } else if (index === 3) {
                this.add.text(140, yPos, `• And ${this.penalties.length - 3} more...`, {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'left'
                });
            }
        });
        
        if (this.penalties.length === 0) {
            this.add.text(140, yPos, '• None', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'left'
            });
        }
    }

    displayChoiceUI() {
        // Display the choice title
        this.add.text(this.cameras.main.width / 2, 220, this.currentChoice.title.toUpperCase(), {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#33ff33',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display the choice description
        this.add.text(this.cameras.main.width / 2, 260, this.currentChoice.description, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5);
        
        // Display option buttons
        this.optionButtons = [];
        const startY = 320;
        const spacing = 150;
        
        this.currentChoice.options.forEach((option, index) => {
            // Create button background
            const button = this.add.image(
                this.cameras.main.width / 2,
                startY + (index * spacing),
                'button'
            )
            .setDisplaySize(500, 120)
            .setInteractive();
            
            // Create option title
            const title = this.add.text(
                button.x,
                button.y - 30,
                option.text.toUpperCase(),
                {
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // Create option description
            const description = this.add.text(
                button.x,
                button.y + 5,
                option.description,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#cccccc',
                    align: 'center',
                    wordWrap: { width: 450 }
                }
            ).setOrigin(0.5);
            
            // Create rewards/penalties text
            let rewardsText = '';
            if (option.rewards && option.rewards.length > 0) {
                rewardsText += 'Rewards: ' + option.rewards.map(r => r.name || r.type).join(', ');
            }
            
            if (option.penalties && option.penalties.length > 0) {
                if (rewardsText) rewardsText += ' | ';
                rewardsText += 'Penalties: ' + option.penalties.map(p => p.name || p.type).join(', ');
            }
            
            const rewards = this.add.text(
                button.x,
                button.y + 40,
                rewardsText,
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#33ff33',
                    align: 'center',
                    wordWrap: { width: 450 }
                }
            ).setOrigin(0.5);
            
            // Set up button interactions
            this.setupButtonInteractions(button, index);
            
            // Store button components for later use
            this.optionButtons.push({ button, title, description, rewards });
        });
    }

    setupButtonInteractions(button, index) {
        button.on('pointerover', () => {
            button.setTint(0x44ff44);
            button.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.clearTint();
            button.setScale(1);
        });
        
        button.on('pointerdown', () => {
            // Apply the selected choice
            const result = this.choiceSystem.applyChoice(index, this.currentChoice);
            
            // Show feedback that choice was made
            this.showChoiceFeedback(index, result);
            
            // Disable all buttons to prevent multiple choices
            this.optionButtons.forEach(optionButton => {
                optionButton.button.disableInteractive();
                if (optionButton.button !== button) {
                    optionButton.button.setAlpha(0.5);
                    optionButton.title.setAlpha(0.5);
                    optionButton.description.setAlpha(0.5);
                    optionButton.rewards.setAlpha(0.5);
                }
            });
            
            // Continue to next sector after a delay
            this.time.delayedCall(2000, () => {
                this.continueToBattle();
            });
        });
    }

    showChoiceFeedback(selectedIndex, result) {
        // Highlight selected button
        const selectedButton = this.optionButtons[selectedIndex];
        selectedButton.button.setTint(0x00ff00);
        
        // Create a "choice made" text
        this.add.text(
            selectedButton.button.x,
            selectedButton.button.y - 70,
            'CHOICE CONFIRMED',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#33ff33',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create a continue text
        this.continueText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'Preparing for next sector...',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Make continue text blink
        this.tweens.add({
            targets: this.continueText,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
    }

    setupEvents() {
        // Setup keyboard events
        this.input.keyboard.on('keydown-SPACE', () => {
            // Skip to next sector if debugging
            if (this.game.global.debug.invincible) {
                this.continueToBattle();
            }
        });
    }

    calculateRewardModifiers() {
        // Calculate reward modifiers based on sector number and player stats
        // This is a placeholder - in a full implementation, this would adjust 
        // the rewards based on game progression
        this.rewardModifier = 1 + (0.1 * (this.nextSector - 1));
    }

    continueToBattle() {
        // Store the player's upgraded state in the global game state
        this.game.global.currentRun.sector = this.nextSector;
        this.game.global.currentRun.score = this.score;
        this.game.global.currentRun.upgrades = this.upgrades;
        this.game.global.currentRun.penalties = this.penalties;
        
        // Start the game scene with the updated data
        this.scene.start(CONSTANTS.SCENES.GAME, {
            sector: this.nextSector,
            score: this.score
        });
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    update() {
        // Update background animations
        this.bgStars.tilePositionY += 0.2;
        this.bgNebula.tilePositionY += 0.1;
    }
}