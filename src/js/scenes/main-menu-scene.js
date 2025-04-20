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
        // Create an enhanced space background
        this.createEnhancedBackground();
    }

    createEnhancedBackground() {
        console.log('Creating enhanced space background');

        // Create a gradient background
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a container for all background elements
        this.bgContainer = this.add.container(0, 0);

        // Deep space background with gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000022, 0x000033, 0x000066, 0x000044, 1);
        bg.fillRect(0, 0, width, height);
        this.bgContainer.add(bg);

        // Create a large nebula in the background
        const nebulaColors = [
            { color: 0x3366cc, alpha: 0.05 },
            { color: 0x6633cc, alpha: 0.04 },
            { color: 0x3399ff, alpha: 0.03 }
        ];

        // Create multiple overlapping nebula layers
        nebulaColors.forEach(({ color, alpha }) => {
            for (let i = 0; i < 3; i++) {
                const x = Phaser.Math.Between(width * 0.2, width * 0.8);
                const y = Phaser.Math.Between(height * 0.2, height * 0.8);
                const size = Phaser.Math.Between(200, 400);

                const nebula = this.add.graphics();
                nebula.fillStyle(color, alpha);
                nebula.fillCircle(x, y, size);
                this.bgContainer.add(nebula);

                // Add subtle movement
                this.tweens.add({
                    targets: nebula,
                    x: x + Phaser.Math.Between(-30, 30),
                    y: y + Phaser.Math.Between(-30, 30),
                    duration: Phaser.Math.Between(15000, 25000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Create distant stars (small, many)
        this.stars = [];
        for (let i = 0; i < 300; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(0.5, 2);
            const alpha = Phaser.Math.FloatBetween(0.4, 1);

            const star = this.add.circle(x, y, size, 0xffffff, alpha);
            this.bgContainer.add(star);
            this.stars.push(star);

            // Add subtle twinkling effect to some stars
            if (Math.random() > 0.6) {
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

        // Create a few brighter stars with glow effects
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(1.5, 3);

            // Create star with glow effect
            const star = this.add.circle(x, y, size, 0xffffff, 1);
            const glow = this.add.circle(x, y, size * 3, 0x3399ff, 0.3);
            this.bgContainer.add(star);
            this.bgContainer.add(glow);

            // Add pulsing effect
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.3, to: 0.1 },
                scale: { from: 1, to: 1.5 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Add a few shooting stars that appear occasionally
        this.time.addEvent({
            delay: 3000,
            callback: this.createShootingStar,
            callbackScope: this,
            loop: true
        });

        // Create a few distant planets
        for (let i = 0; i < 2; i++) {
            const x = Phaser.Math.Between(width * 0.1, width * 0.9);
            const y = Phaser.Math.Between(height * 0.1, height * 0.4);
            const size = Phaser.Math.Between(15, 30);

            // Planet colors
            const planetColors = [0x3366cc, 0x33ccff, 0x66cc99, 0xcc6666];
            const color = planetColors[Math.floor(Math.random() * planetColors.length)];

            // Create planet
            const planet = this.add.circle(x, y, size, color, 1);
            this.bgContainer.add(planet);

            // Add a subtle glow
            const planetGlow = this.add.circle(x, y, size * 1.3, color, 0.2);
            this.bgContainer.add(planetGlow);
        }

        // Set a property to handle updates in our update method
        this.usingEnhancedBackground = true;
    }

    createShootingStar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Only create a shooting star 30% of the time
        if (Math.random() > 0.3) return;

        // Create a shooting star
        const startX = Phaser.Math.Between(0, width);
        const startY = Phaser.Math.Between(0, height/3);
        const angle = Phaser.Math.FloatBetween(Math.PI * 0.1, Math.PI * 0.4);
        const length = Phaser.Math.Between(50, 150);

        // Calculate end point
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;

        // Create the shooting star
        const shootingStar = this.add.graphics();
        shootingStar.lineStyle(2, 0xffffff, 1);
        shootingStar.lineBetween(startX, startY, startX, startY); // Start with a point
        this.bgContainer.add(shootingStar);

        // Create a glow effect
        const glow = this.add.graphics();
        glow.lineStyle(4, 0xffffff, 0.3);
        glow.lineBetween(startX, startY, startX, startY); // Start with a point
        this.bgContainer.add(glow);

        // Animate the shooting star
        this.tweens.add({
            targets: [shootingStar, glow],
            x: endX - startX,
            y: endY - startY,
            duration: 500,
            ease: 'Cubic.easeIn',
            onUpdate: (tween, target) => {
                const progress = tween.progress;
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;

                if (target === shootingStar) {
                    shootingStar.clear();
                    shootingStar.lineStyle(2, 0xffffff, 1);
                    shootingStar.lineBetween(currentX, currentY, currentX - (endX - startX) * 0.2, currentY - (endY - startY) * 0.2);
                } else {
                    glow.clear();
                    glow.lineStyle(4, 0xffffff, 0.3);
                    glow.lineBetween(currentX, currentY, currentX - (endX - startX) * 0.3, currentY - (endY - startY) * 0.3);
                }
            },
            onComplete: () => {
                shootingStar.destroy();
                glow.destroy();
            }
        });
    }

    createMenuButtons(width, height) {
        // Create a modern menu panel with a more futuristic design
        const panelWidth = 320;
        let panelHeight = 420;
        const panelX = width / 2;
        const panelY = height / 2 + 50;

        // Create a container for the menu
        const menuContainer = this.add.container(0, 0);

        // Create a semi-transparent panel background with rounded corners and gradient
        const panel = this.add.graphics();
        const gradientColors = [0x000033, 0x000044, 0x000066, 0x000055];
        panel.fillGradientStyle(gradientColors[0], gradientColors[1], gradientColors[2], gradientColors[3], 0.8);
        panel.fillRoundedRect(panelX - panelWidth/2, panelY - panelHeight/2, panelWidth, panelHeight, 15);
        menuContainer.add(panel);

        // Add a glowing border with animation
        const border = this.add.graphics();
        border.lineStyle(2, 0x33aaff, 0.8);
        border.strokeRoundedRect(panelX - panelWidth/2, panelY - panelHeight/2, panelWidth, panelHeight, 15);
        menuContainer.add(border);

        // Add a pulsing effect to the border
        this.tweens.add({
            targets: border,
            alpha: { from: 0.8, to: 0.4 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add decorative elements to the panel
        // Top header with gradient
        const headerHeight = 60;
        const header = this.add.graphics();
        header.fillGradientStyle(0x3366cc, 0x3355aa, 0x3344aa, 0x3355aa, 0.6);
        header.fillRoundedRect(panelX - panelWidth/2, panelY - panelHeight/2, panelWidth, headerHeight, { tl: 15, tr: 15, bl: 0, br: 0 });
        menuContainer.add(header);

        // Add decorative lines to the panel
        const decorLines = this.add.graphics();
        decorLines.lineStyle(1, 0x33aaff, 0.3);

        // Horizontal lines
        for (let i = 1; i < 4; i++) {
            const y = panelY - panelHeight/2 + headerHeight + i * 90;
            decorLines.lineBetween(panelX - panelWidth/2 + 20, y, panelX + panelWidth/2 - 20, y);
        }

        // Vertical accent lines
        decorLines.lineStyle(2, 0x33aaff, 0.2);
        decorLines.lineBetween(panelX - panelWidth/2 + 15, panelY - panelHeight/2 + headerHeight,
                              panelX - panelWidth/2 + 15, panelY + panelHeight/2 - 15);
        decorLines.lineBetween(panelX + panelWidth/2 - 15, panelY - panelHeight/2 + headerHeight,
                              panelX + panelWidth/2 - 15, panelY + panelHeight/2 - 15);
        menuContainer.add(decorLines);

        // Add header text with enhanced styling
        const headerText = this.add.text(panelX, panelY - panelHeight/2 + headerHeight/2, 'COMMAND CONSOLE', {
            fontFamily: 'monospace',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000033',
            strokeThickness: 3,
            shadow: { offsetX: 1, offsetY: 1, color: '#33aaff', blur: 3, stroke: true }
        }).setOrigin(0.5);
        menuContainer.add(headerText);

        // Add a subtle animation to the header text
        this.tweens.add({
            targets: headerText,
            scale: { from: 1, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Adjust panel height to accommodate the new button
        panelHeight = 500;

        // Button configs with icons
        const buttonConfigs = [
            {
                text: 'START MISSION',
                icon: '🚀',
                y: panelY - panelHeight/2 + headerHeight + 70,
                handler: () => this.startGame()
            },
            {
                text: 'PILOT PROFILE',
                icon: '👨‍🚀',
                y: panelY - panelHeight/2 + headerHeight + 150,
                handler: () => this.openProfile()
            },
            {
                text: 'NEMESIS INFO',
                icon: '👾',
                y: panelY - panelHeight/2 + headerHeight + 230,
                handler: () => this.openNemesisInfo()
            },
            {
                text: 'DIFFICULTY',
                icon: '🎯',
                y: panelY - panelHeight/2 + headerHeight + 310,
                handler: () => this.openDifficultySelector()
            },
            {
                text: 'HANGAR BAY',
                icon: '🛸',
                y: panelY - panelHeight/2 + headerHeight + 390,
                handler: () => this.openHangar()
            },
            {
                text: 'SYSTEM CONFIG',
                icon: '⚙️',
                y: panelY - panelHeight/2 + headerHeight + 470,
                handler: () => this.openOptions()
            }
        ];

        // Create modern, futuristic buttons
        buttonConfigs.forEach(config => {
            // Create button container
            const buttonContainer = this.add.container(panelX, config.y);
            menuContainer.add(buttonContainer);

            // Create button background with gradient
            const buttonWidth = 260;
            const buttonHeight = 60;
            const button = this.add.graphics();

            // Default state - gradient background
            button.fillGradientStyle(0x222244, 0x222255, 0x222266, 0x222255, 0.8);
            button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            button.lineStyle(1, 0x33aaff, 0.5);
            button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonContainer.add(button);

            // Add a left accent bar
            const accentBar = this.add.rectangle(-buttonWidth/2 + 5, 0, 3, buttonHeight - 10, 0x33aaff, 0.7)
                .setOrigin(0.5);
            buttonContainer.add(accentBar);

            // Create an invisible interactive area
            const hitArea = this.add.rectangle(0, 0, buttonWidth, buttonHeight)
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5)
                .setAlpha(0.001);
            buttonContainer.add(hitArea);

            // Add icon if available
            if (config.icon) {
                const iconText = this.add.text(-buttonWidth/2 + 25, 0, config.icon, {
                    fontSize: '24px'
                }).setOrigin(0.5);
                buttonContainer.add(iconText);
            }

            // Button text with enhanced styling
            const buttonText = this.add.text(config.icon ? -buttonWidth/2 + 60 : 0, 0, config.text, {
                fontFamily: 'monospace',
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 1, offsetY: 1, color: '#33aaff', blur: 5, stroke: true }
            }).setOrigin(config.icon ? 0 : 0.5, 0.5);
            buttonContainer.add(buttonText);

            // Add a subtle glow effect behind the button
            const glow = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x33aaff, 0)
                .setOrigin(0.5);
            buttonContainer.add(glow);
            buttonContainer.sendToBack(glow);

            // Button hover and click effects
            hitArea.on('pointerover', () => {
                // Clear and redraw with hover style
                button.clear();
                button.fillGradientStyle(0x3344aa, 0x3355bb, 0x3366cc, 0x3355bb, 0.9);
                button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
                button.lineStyle(2, 0x33ccff, 0.8);
                button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

                // Enhance text glow
                buttonText.setShadow(1, 1, '#33ccff', 10, true);

                // Animate the accent bar
                this.tweens.add({
                    targets: accentBar,
                    scaleY: 1.2,
                    duration: 200
                });

                // Show the glow effect
                this.tweens.add({
                    targets: glow,
                    alpha: 0.2,
                    duration: 200
                });
            });

            hitArea.on('pointerout', () => {
                // Clear and redraw with default style
                button.clear();
                button.fillGradientStyle(0x222244, 0x222255, 0x222266, 0x222255, 0.8);
                button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
                button.lineStyle(1, 0x33aaff, 0.5);
                button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

                // Reset text glow
                buttonText.setShadow(1, 1, '#33aaff', 5, true);

                // Reset the accent bar
                this.tweens.add({
                    targets: accentBar,
                    scaleY: 1,
                    duration: 200
                });

                // Hide the glow effect
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
                button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

                // Add press effect
                buttonContainer.y += 2;

                // Flash the glow
                this.tweens.add({
                    targets: glow,
                    alpha: { from: 0.4, to: 0 },
                    duration: 300
                });

                // Call the handler after a short delay for visual feedback
                this.time.delayedCall(100, () => {
                    buttonContainer.y -= 2;
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

    /**
     * Open the difficulty selector
     */
    openDifficultySelector() {
        console.log('Opening difficulty selector');

        // Create difficulty selector if it doesn't exist
        if (!this.difficultySelector) {
            this.difficultySelector = new DifficultySelector(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
        }

        // Show the difficulty selector
        this.difficultySelector.show((selectedLevel) => {
            console.log(`Selected difficulty: ${selectedLevel.key} (${selectedLevel.value})`);

            // Initialize dynamic difficulty system if it doesn't exist
            if (!this.game.global.dynamicDifficulty) {
                this.game.global.dynamicDifficulty = new DynamicDifficultySystem(this.game);
            }

            // Apply selected difficulty
            if (selectedLevel.key === 'adaptive') {
                this.game.global.dynamicDifficulty.setAdaptiveDifficulty(true);
                this.game.global.dynamicDifficulty.setBaseDifficulty(0.5); // Default to normal for adaptive
            } else {
                this.game.global.dynamicDifficulty.setAdaptiveDifficulty(false);
                this.game.global.dynamicDifficulty.setBaseDifficulty(selectedLevel.value);
            }

            // Show confirmation message
            this.showMessage(`Difficulty set to ${selectedLevel.label}`);
        });
    }

    openNemesisInfo() {
        console.log('Opening Nemesis information screen...');

        // Initialize Nemesis systems if they don't exist
        if (!this.game.global.nemesisSystem) {
            this.game.global.nemesisSystem = new NemesisSystem(this.game);
        }

        if (!this.game.global.nemesisDifficulty) {
            this.game.global.nemesisDifficulty = new NemesisDifficulty(this.game);
        }

        // Start the Nemesis info scene
        this.scene.start(CONSTANTS.SCENES.NEMESIS_INFO, {
            returnScene: CONSTANTS.SCENES.MAIN_MENU
        });
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
        } else if (this.usingEnhancedBackground) {
            // Add subtle movement to stars for parallax effect
            if (this.stars && this.stars.length > 0) {
                for (let i = 0; i < this.stars.length; i++) {
                    // Move stars at different speeds based on their size (smaller = further away = slower)
                    const star = this.stars[i];
                    const speed = star.width < 1 ? 0.05 : (star.width < 2 ? 0.1 : 0.2);
                    star.y += speed;

                    // Wrap stars around when they go off screen
                    if (star.y > this.cameras.main.height) {
                        star.y = 0;
                        star.x = Phaser.Math.Between(0, this.cameras.main.width);
                    }
                }
            }
        }
    }

    /**
     * Show a message popup
     * @param {string} message - The message to display
     */
    showMessage(message) {
        // Create a container for the message
        const container = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        container.setDepth(1000);

        // Create a semi-transparent background
        const bg = this.add.rectangle(0, 0, 400, 150, 0x000000, 0.8);
        bg.setStrokeStyle(2, 0x3399ff);
        container.add(bg);

        // Create the message text
        const text = this.add.text(0, 0, message, {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 380 }
        }).setOrigin(0.5);
        container.add(text);

        // Create a close button
        const closeButton = this.add.text(0, 60, 'OK', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#3399ff'
        }).setOrigin(0.5);
        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on('pointerover', () => closeButton.setColor('#33ccff'));
        closeButton.on('pointerout', () => closeButton.setColor('#3399ff'));
        closeButton.on('pointerdown', () => {
            // Destroy the container when clicked
            container.destroy();
        });
        container.add(closeButton);

        // Add a fade-in animation
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });

        // Auto-close after 5 seconds
        this.time.delayedCall(5000, () => {
            if (container.active) {
                this.tweens.add({
                    targets: container,
                    alpha: 0,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => container.destroy()
                });
            }
        });
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