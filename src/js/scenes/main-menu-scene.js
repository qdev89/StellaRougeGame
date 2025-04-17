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

        // Create a title container for animations
        const titleContainer = this.add.container(width / 2, height / 5);

        // Title text with enhanced styling
        const titleText = this.add.text(0, 0, 'STELLAR ROGUE', {
            fontFamily: 'monospace',
            fontSize: '52px',
            fontStyle: 'bold',
            color: '#33aaff',
            align: 'center',
            stroke: '#000033',
            strokeThickness: 8,
            shadow: { offsetX: 2, offsetY: 2, color: '#0066cc', blur: 10, stroke: true }
        }).setOrigin(0.5);

        // Add a glow effect behind the title
        const titleGlow = this.add.graphics();
        titleGlow.fillStyle(0x33aaff, 0.2);
        titleGlow.fillCircle(0, 0, 180);

        // Add elements to container in correct order (glow behind text)
        titleContainer.add([titleGlow, titleText]);

        // Animate the title with a gentle floating effect
        this.tweens.add({
            targets: titleContainer,
            y: titleContainer.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle text with enhanced styling
        const subtitleText = this.add.text(width / 2, titleContainer.y + 80, 'RETRO ROGUELIKE FLYING SHOOTER', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000033',
            strokeThickness: 3,
            shadow: { offsetX: 1, offsetY: 1, color: '#33aaff', blur: 5, stroke: true }
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
            // Fallback: create an enhanced space background
            console.log('Using enhanced fallback background');

            // Create a gradient background
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;

            // Deep space background with gradient
            const bg = this.add.graphics();
            bg.fillGradientStyle(0x000022, 0x000022, 0x000044, 0x000033, 1);
            bg.fillRect(0, 0, width, height);

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

            // Create a few brighter stars
            for (let i = 0; i < 30; i++) {
                const x = Phaser.Math.Between(0, width);
                const y = Phaser.Math.Between(0, height);
                const size = Phaser.Math.FloatBetween(1.5, 3);

                // Create star with glow effect
                const star = this.add.circle(x, y, size, 0xffffff, 1);
                const glow = this.add.circle(x, y, size * 2, 0x3399ff, 0.3);

                // Add pulsing effect
                this.tweens.add({
                    targets: glow,
                    alpha: 0.1,
                    scale: 1.5,
                    duration: Phaser.Math.Between(2000, 4000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            // Add a few nebula-like clouds
            for (let i = 0; i < 5; i++) {
                const x = Phaser.Math.Between(0, width);
                const y = Phaser.Math.Between(0, height);
                const size = Phaser.Math.Between(100, 200);

                // Create a nebula cloud with random color
                const colors = [0x3366ff, 0x6633ff, 0x3399ff, 0x33ccff];
                const color = colors[Math.floor(Math.random() * colors.length)];

                const nebula = this.add.graphics();
                nebula.fillStyle(color, 0.05);
                nebula.fillCircle(x, y, size);

                // Add subtle movement
                this.tweens.add({
                    targets: nebula,
                    x: x + Phaser.Math.Between(-20, 20),
                    y: y + Phaser.Math.Between(-20, 20),
                    duration: 10000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            // Set a property to handle updates in our update method
            this.usingFallbackBackground = true;
        }
    }

    createMenuButtons(width, height) {
        // Create a modern menu panel
        const panelWidth = 300;
        const panelHeight = 400;
        const panelX = width / 2;
        const panelY = height / 2 + 50;

        // Create a semi-transparent panel background with rounded corners
        const panel = this.add.graphics();
        panel.fillStyle(0x000033, 0.7);
        panel.fillRoundedRect(panelX - panelWidth/2, panelY - panelHeight/2, panelWidth, panelHeight, 15);

        // Add a glowing border
        const border = this.add.graphics();
        border.lineStyle(2, 0x33aaff, 0.8);
        border.strokeRoundedRect(panelX - panelWidth/2, panelY - panelHeight/2, panelWidth, panelHeight, 15);

        // Add a decorative header to the panel
        const headerHeight = 50;
        const header = this.add.graphics();
        header.fillStyle(0x33aaff, 0.3);
        header.fillRoundedRect(panelX - panelWidth/2, panelY - panelHeight/2, panelWidth, headerHeight, { tl: 15, tr: 15, bl: 0, br: 0 });

        // Add header text
        const headerText = this.add.text(panelX, panelY - panelHeight/2 + headerHeight/2, 'MAIN MENU', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Button configs
        const buttonConfigs = [
            {
                text: 'START MISSION',
                y: panelY - panelHeight/2 + headerHeight + 70,
                handler: () => this.startGame()
            },
            {
                text: 'PROFILE',
                y: panelY - panelHeight/2 + headerHeight + 140,
                handler: () => this.openProfile()
            },
            {
                text: 'HANGAR BAY',
                y: panelY - panelHeight/2 + headerHeight + 210,
                handler: () => this.openHangar()
            },
            {
                text: 'OPTIONS',
                y: panelY - panelHeight/2 + headerHeight + 280,
                handler: () => this.openOptions()
            }
        ];

        // Create modern, sleek buttons
        buttonConfigs.forEach(config => {
            // Create button background with gradient
            const buttonWidth = 240;
            const buttonHeight = 50;
            const button = this.add.graphics();

            // Default state
            button.fillStyle(0x222244, 0.8);
            button.fillRoundedRect(panelX - buttonWidth/2, config.y - buttonHeight/2, buttonWidth, buttonHeight, 10);
            button.lineStyle(1, 0x33aaff, 0.5);
            button.strokeRoundedRect(panelX - buttonWidth/2, config.y - buttonHeight/2, buttonWidth, buttonHeight, 10);

            // Create an invisible interactive area
            const hitArea = this.add.rectangle(panelX, config.y, buttonWidth, buttonHeight)
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5)
                .setAlpha(0.001);

            // Button text with glow effect
            const buttonText = this.add.text(panelX, config.y, config.text, {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
                shadow: { offsetX: 1, offsetY: 1, color: '#33aaff', blur: 5, stroke: true }
            }).setOrigin(0.5);

            // Button hover and click effects
            hitArea.on('pointerover', () => {
                button.clear();
                button.fillStyle(0x3344aa, 0.9);
                button.fillRoundedRect(panelX - buttonWidth/2, config.y - buttonHeight/2, buttonWidth, buttonHeight, 10);
                button.lineStyle(2, 0x33ccff, 0.8);
                button.strokeRoundedRect(panelX - buttonWidth/2, config.y - buttonHeight/2, buttonWidth, buttonHeight, 10);
                buttonText.setShadow(1, 1, '#33ccff', 10, true);
                buttonText.setColor('#ffffff');
            });

            hitArea.on('pointerout', () => {
                button.clear();
                button.fillStyle(0x222244, 0.8);
                button.fillRoundedRect(panelX - buttonWidth/2, config.y - buttonHeight/2, buttonWidth, buttonHeight, 10);
                button.lineStyle(1, 0x33aaff, 0.5);
                button.strokeRoundedRect(panelX - buttonWidth/2, config.y - buttonHeight/2, buttonWidth, buttonHeight, 10);
                buttonText.setShadow(1, 1, '#33aaff', 5, true);
                buttonText.setColor('#ffffff');
            });

            hitArea.on('pointerdown', () => {
                button.clear();
                button.fillStyle(0x2233aa, 1);
                button.fillRoundedRect(panelX - buttonWidth/2, config.y - buttonHeight/2, buttonWidth, buttonHeight, 10);
                buttonText.setY(config.y + 2); // Small press effect

                // Call the handler after a short delay for visual feedback
                this.time.delayedCall(100, () => {
                    buttonText.setY(config.y);
                    config.handler();
                });
            });
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
            // Sound is disabled
            // No click sound will be played

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
                penalties: [],
                inventory: this.createDefaultInventory()
            };

            // Initialize meta-progression if not exists
            if (!this.game.global.metaProgress) {
                this.game.global.metaProgress = {
                    credits: 0,
                    highestSector: 1,
                    unlockedShips: ['fighter'],
                    unlockedUpgrades: []
                };
            }

            // Create a loading overlay
            const overlay = this.add.rectangle(
                0, 0,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000022, 0.8
            ).setOrigin(0, 0).setDepth(100);

            // Create a loading container
            const loadingContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2).setDepth(101);

            // Add a glowing border
            const loadingBorder = this.add.graphics().setDepth(101);
            loadingBorder.lineStyle(3, 0x33aaff, 0.8);
            loadingBorder.strokeRoundedRect(-150, -80, 300, 160, 15);
            loadingContainer.add(loadingBorder);

            // Add loading text with enhanced styling
            const loadingText = this.add.text(
                0, -40,
                'INITIALIZING MISSION',
                {
                    fontFamily: 'monospace',
                    fontSize: '24px',
                    color: '#33aaff',
                    align: 'center',
                    stroke: '#000033',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
            loadingContainer.add(loadingText);

            // Create animated dots for loading
            const loadingDots = this.add.text(
                0, -10,
                '...',
                {
                    fontFamily: 'monospace',
                    fontSize: '32px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
            loadingContainer.add(loadingDots);

            // Animate the dots
            let dots = 0;
            const dotAnimation = this.time.addEvent({
                delay: 300,
                callback: () => {
                    dots = (dots + 1) % 4;
                    loadingDots.setText('.'.repeat(dots));
                },
                loop: true
            });

            // Create a progress bar
            const progressBarWidth = 250;
            const progressBarHeight = 15;

            // Progress bar background
            const progressBarBg = this.add.graphics().setDepth(101);
            progressBarBg.fillStyle(0x222244, 1);
            progressBarBg.fillRoundedRect(-progressBarWidth/2, 20, progressBarWidth, progressBarHeight, 5);
            loadingContainer.add(progressBarBg);

            // Progress bar fill
            const progressBarFill = this.add.graphics().setDepth(102);
            loadingContainer.add(progressBarFill);

            // Add ship icon that moves along the progress bar
            const shipIcon = this.add.triangle(-progressBarWidth/2, 20 + progressBarHeight/2, 0, -10, 10, 10, 0, 5)
                .setFillStyle(0x33aaff)
                .setDepth(103);
            loadingContainer.add(shipIcon);

            // Create loading steps
            const loadingSteps = [
                { text: 'INITIALIZING SYSTEMS', duration: 500 },
                { text: 'LOADING WEAPONS', duration: 400 },
                { text: 'CALIBRATING SHIELDS', duration: 300 },
                { text: 'PLOTTING COURSE', duration: 400 },
                { text: 'READY FOR LAUNCH', duration: 400 }
            ];

            // Function to update progress
            let currentStep = 0;
            let totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
            let elapsedTime = 0;

            // Start the loading sequence
            const updateLoading = (delta) => {
                if (currentStep >= loadingSteps.length) {
                    // Loading complete, start the game
                    this.scene.start(CONSTANTS.SCENES.SECTOR_MAP, {
                        sector: 1,
                        score: 0
                    });
                    return;
                }

                // Update progress bar
                elapsedTime += delta;
                const stepProgress = Math.min(elapsedTime / loadingSteps[currentStep].duration, 1);
                const totalProgress = (currentStep + stepProgress) / loadingSteps.length;

                // Update progress bar fill
                progressBarFill.clear();
                progressBarFill.fillStyle(0x33aaff, 1);
                progressBarFill.fillRoundedRect(
                    -progressBarWidth/2,
                    20,
                    progressBarWidth * totalProgress,
                    progressBarHeight,
                    { tl: 5, bl: 5, tr: 0, br: 0 }
                );

                // Update ship icon position
                shipIcon.x = -progressBarWidth/2 + progressBarWidth * totalProgress;

                // Update loading text
                loadingText.setText(loadingSteps[currentStep].text);

                // Move to next step if current step is complete
                if (stepProgress >= 1) {
                    currentStep++;
                    elapsedTime = 0;
                }
            };

            // Create an update event
            this.events.on('update', (time, delta) => {
                updateLoading(delta);
            });

            // Add some particle effects
            if (this.textures.exists('star-particle')) {
                const particles = this.add.particles('star-particle').setDepth(101);
                particles.createEmitter({
                    x: { min: -120, max: 120 },
                    y: 50,
                    speedX: { min: -20, max: 20 },
                    speedY: { min: -40, max: -20 },
                    scale: { start: 0.4, end: 0 },
                    lifespan: 1000,
                    blendMode: 'ADD',
                    frequency: 50
                });
                loadingContainer.add(particles);
            }
        }
        catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start game. Check console for details.');
        }
    }

    openProfile() {
        console.log('Opening profile management...');

        // Initialize save manager if it doesn't exist
        if (!this.game.global.saveManager) {
            this.game.global.saveManager = new SaveManager(this.game);
        }

        // Start profile scene
        this.scene.start(CONSTANTS.SCENES.PROFILE, {
            previousScene: CONSTANTS.SCENES.MAIN_MENU
        });
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
        // Sound is permanently disabled
        this.game.sound.mute = true;
        this.game.sound.volume = 0;
        console.log('Sound is permanently disabled');
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
        // Sound is disabled
        console.log('Sound is disabled - skipping background music');
        return;
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

    createDefaultInventory() {
        // Create a default inventory with some starter items
        return {
            consumables: [
                {
                    id: 'repair_kit',
                    name: 'Repair Kit',
                    description: 'Repairs 25% of your ship\'s hull integrity.',
                    quantity: 2,
                    usable: true,
                    effect: {
                        type: 'repair',
                        value: 0.25
                    }
                },
                {
                    id: 'shield_booster',
                    name: 'Shield Booster',
                    description: 'Temporarily increases shield capacity by 50% for 30 seconds.',
                    quantity: 1,
                    usable: true,
                    effect: {
                        type: 'boost',
                        stat: 'shield',
                        value: 0.5,
                        duration: 30
                    }
                }
            ],
            materials: [
                {
                    id: 'scrap_metal',
                    name: 'Scrap Metal',
                    description: 'Common salvaged material used for basic repairs and crafting.',
                    quantity: 15,
                    usable: false
                },
                {
                    id: 'energy_cell',
                    name: 'Energy Cell',
                    description: 'Standard power source for various ship systems and equipment.',
                    quantity: 8,
                    usable: false
                }
            ],
            special: [
                {
                    id: 'mysterious_artifact',
                    name: 'Mysterious Artifact',
                    description: 'An unknown device of alien origin. Its purpose is unclear.',
                    quantity: 1,
                    usable: true,
                    effect: {
                        type: 'special',
                        action: 'revealMap'
                    }
                }
            ]
        };
    }
}