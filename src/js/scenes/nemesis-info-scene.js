/**
 * Nemesis Information Scene
 * Displays information about the Nemesis boss and how it adapts to the player
 */
class NemesisInfoScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.NEMESIS_INFO });
    }

    init(data) {
        this.returnScene = data.returnScene || CONSTANTS.SCENES.MAIN_MENU;
        this.returnData = data.returnData || {};
    }

    create() {
        // Initialize icons manager if needed
        this.iconsManager = new NemesisIcons(this);

        // Create background
        this.createBackground();

        // Create UI elements
        this.createUI();

        // Create Nemesis information display
        this.createNemesisInfo();

        // Create navigation buttons
        this.createNavigationButtons();

        // Add keyboard handlers
        this.addKeyboardHandlers();

        // Add entrance animation
        this.addEntranceAnimation();
    }

    /**
     * Add entrance animation for the scene
     */
    addEntranceAnimation() {
        // Flash effect
        this.cameras.main.flash(500, 0, 0, 0, 0.5);

        // Fade in effect
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createBackground() {
        // Create a dark background with stars
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000022)
            .setOrigin(0, 0);

        // Create a grid pattern
        this.createGridPattern();

        // Add star particles
        if (this.textures.exists('star-particle')) {
            const particles = this.add.particles('star-particle');

            particles.createEmitter({
                x: { min: 0, max: this.cameras.main.width },
                y: { min: 0, max: this.cameras.main.height },
                lifespan: { min: 2000, max: 5000 },
                scale: { start: 0.2, end: 0 },
                alpha: { start: 1, end: 0 },
                quantity: 1,
                blendMode: 'ADD',
                frequency: 500
            });
        }

        // Add a subtle glow effect in the center
        const glow = this.add.circle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            200,
            0x3366cc,
            0.1
        );

        // Animate the glow
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.1, to: 0.2 },
            scale: { from: 1, to: 1.2 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Add a Nemesis silhouette in the background
        this.createNemesisSilhouette();
    }

    /**
     * Create a grid pattern for the background
     */
    createGridPattern() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x3366cc, 0.2);

        // Draw horizontal lines
        for (let y = 0; y < this.cameras.main.height; y += 40) {
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(this.cameras.main.width, y);
            graphics.closePath();
            graphics.strokePath();
        }

        // Draw vertical lines
        for (let x = 0; x < this.cameras.main.width; x += 40) {
            graphics.beginPath();
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.cameras.main.height);
            graphics.closePath();
            graphics.strokePath();
        }
    }

    /**
     * Create a Nemesis silhouette in the background
     */
    createNemesisSilhouette() {
        // Create a container for the silhouette
        const container = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);

        // Create the silhouette shape
        const graphics = this.add.graphics();
        graphics.fillStyle(0x3366cc, 0.05);

        // Draw a complex shape representing the Nemesis
        graphics.beginPath();

        // Main body
        graphics.fillCircle(0, 0, 100);

        // Wings/appendages
        graphics.fillTriangle(-120, -20, -20, -80, -20, 40);
        graphics.fillTriangle(120, -20, 20, -80, 20, 40);
        graphics.fillTriangle(-80, 80, -20, 20, 40, 100);
        graphics.fillTriangle(80, 80, 20, 20, -40, 100);

        // Add to container
        container.add(graphics);

        // Add a pulsing effect
        this.tweens.add({
            targets: container,
            scaleX: { from: 1, to: 1.05 },
            scaleY: { from: 1, to: 1.05 },
            alpha: { from: 1, to: 0.8 },
            duration: 3000,
            yoyo: true,
            repeat: -1
        });

        // Add a slow rotation
        this.tweens.add({
            targets: container,
            angle: { from: -2, to: 2 },
            duration: 5000,
            yoyo: true,
            repeat: -1
        });
    }

    createUI() {
        // Create title container
        const titleContainer = this.add.container(this.cameras.main.width / 2, 30);

        // Create title glow
        const titleGlow = this.add.text(
            0,
            0,
            'THE NEMESIS',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#3366cc',
                align: 'center',
                stroke: '#3366cc',
                strokeThickness: 8
            }
        ).setOrigin(0.5, 0);
        titleGlow.setAlpha(0.5);

        // Create title text
        const titleText = this.add.text(
            0,
            0,
            'THE NEMESIS',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5, 0);

        // Add to container
        titleContainer.add([titleGlow, titleText]);

        // Add animation to title
        this.tweens.add({
            targets: titleGlow,
            alpha: { from: 0.3, to: 0.7 },
            scale: { from: 1, to: 1.05 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Create subtitle with icon
        const subtitleContainer = this.add.container(this.cameras.main.width / 2, 70);

        // Create subtitle text
        const subtitleText = this.add.text(
            0,
            0,
            'ADAPTIVE FINAL BOSS',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5, 0);

        // Create decorative elements
        const leftLine = this.add.line(-150, 10, 0, 0, 100, 0, 0x3366cc, 0.8);
        const rightLine = this.add.line(150, 10, 0, 0, -100, 0, 0x3366cc, 0.8);

        // Create decorative icons if icons manager is available
        if (this.iconsManager) {
            const leftIcon = this.iconsManager.createIcon(-180, 10, 'nemesis_core');
            const rightIcon = this.iconsManager.createIcon(180, 10, 'nemesis_core');
            leftIcon.setScale(0.5);
            rightIcon.setScale(0.5);
            subtitleContainer.add([leftIcon, rightIcon]);
        }

        // Add to container
        subtitleContainer.add([leftLine, rightLine, subtitleText]);
    }

    createNemesisInfo() {
        // Create container for Nemesis information
        this.infoContainer = this.add.container(0, 0);

        // Create tabs for different information sections
        this.createInfoTabs();

        // Create initial content (overview tab)
        this.showOverviewTab();
    }

    createInfoTabs() {
        const tabY = 110;
        const tabWidth = 150;
        const tabHeight = 30;
        const tabSpacing = 10;

        // Tab data
        const tabs = [
            { key: 'overview', text: 'OVERVIEW', x: this.cameras.main.width / 2 - tabWidth - tabSpacing },
            { key: 'adaptation', text: 'ADAPTATION', x: this.cameras.main.width / 2 },
            { key: 'history', text: 'HISTORY', x: this.cameras.main.width / 2 + tabWidth + tabSpacing }
        ];

        // Create tab buttons
        this.tabButtons = {};

        tabs.forEach(tab => {
            // Create tab background
            const tabBg = this.add.rectangle(
                tab.x,
                tabY,
                tabWidth,
                tabHeight,
                0x222244,
                0.8
            ).setInteractive();

            // Create tab text
            const tabText = this.add.text(
                tab.x,
                tabY,
                tab.text,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0.5);

            // Store tab elements
            this.tabButtons[tab.key] = {
                background: tabBg,
                text: tabText,
                key: tab.key
            };

            // Add tab click handler
            tabBg.on('pointerdown', () => {
                this.selectTab(tab.key);
            });

            // Add hover effect
            tabBg.on('pointerover', () => {
                tabBg.setFillStyle(0x3366cc, 0.5);
            });

            tabBg.on('pointerout', () => {
                if (this.activeTab !== tab.key) {
                    tabBg.setFillStyle(0x222244, 0.8);
                }
            });
        });

        // Set initial active tab
        this.selectTab('overview');
    }

    selectTab(tabKey) {
        // Clear previous content
        if (this.contentContainer) {
            this.contentContainer.destroy();
        }

        // Create new content container
        this.contentContainer = this.add.container(0, 150);
        this.infoContainer.add(this.contentContainer);

        // Reset all tab styles
        Object.values(this.tabButtons).forEach(tab => {
            tab.background.setFillStyle(0x222244, 0.8);
        });

        // Set active tab style
        this.tabButtons[tabKey].background.setFillStyle(0x3366cc, 0.8);
        this.activeTab = tabKey;

        // Show content based on selected tab
        switch (tabKey) {
            case 'overview':
                this.showOverviewTab();
                break;
            case 'adaptation':
                this.showAdaptationTab();
                break;
            case 'history':
                this.showHistoryTab();
                break;
        }
    }

    showOverviewTab() {
        // Create content background with enhanced visuals
        this.createEnhancedContentBackground();

        // Create Nemesis visual representation
        this.createNemesisVisual();

        // Create Nemesis description
        const description = [
            "THE NEMESIS is the ultimate challenge in Stellar Rogue - a final boss that learns from your previous encounters and adapts to counter your preferred strategies.",
            "",
            "Each time you defeat a boss, the Nemesis studies your tactics and becomes stronger against them. It will develop resistances to your favorite weapons and adopt attack patterns that counter your preferred build style.",
            "",
            "The Nemesis appears as the final boss in Sector 10. By this point, it will have studied your tactics from previous boss encounters and will be fully prepared to counter your strategies.",
            "",
            "The Nemesis can morph between different boss forms during battle, taking on characteristics of bosses you've already defeated. Recognize these patterns to anticipate its attacks."
        ].join('\n');

        // Create a panel for the description
        const descPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            180,
            this.cameras.main.width - 100,
            160,
            0x000033,
            0.5
        );
        descPanel.setStrokeStyle(1, 0x3366cc, 0.3);
        this.contentContainer.add(descPanel);

        const descriptionText = this.add.text(
            this.cameras.main.width / 2,
            180,
            description,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: this.cameras.main.width - 120 }
            }
        ).setOrigin(0.5, 0.5);

        this.contentContainer.add(descriptionText);

        // Create difficulty information
        let difficultyText = "CURRENT DIFFICULTY: Unknown";
        let difficultyDescription = "The Nemesis has not yet been encountered.";
        let difficultyPercentage = 0;

        // Get difficulty information if available
        if (this.game.global.nemesisDifficulty) {
            difficultyDescription = this.game.global.nemesisDifficulty.getDifficultyDescription();

            // Calculate average multiplier if available
            if (this.game.global.nemesisSystem) {
                const multipliers = this.game.global.nemesisDifficulty.calculateDifficultyMultipliers();
                const avgMultiplier = (
                    multipliers.health +
                    multipliers.damage +
                    multipliers.speed +
                    multipliers.adaptationRate +
                    multipliers.resistanceStrength
                ) / 5;

                difficultyPercentage = Math.floor(avgMultiplier * 100);
                difficultyText = `CURRENT DIFFICULTY: ${difficultyPercentage}%`;
            }
        }

        // Create difficulty panel
        const difficultyPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            350,
            this.cameras.main.width - 100,
            80,
            0x330000,
            0.3
        );
        difficultyPanel.setStrokeStyle(1, 0xff3333, 0.3);
        this.contentContainer.add(difficultyPanel);

        // Create difficulty meter
        this.createDifficultyMeter(difficultyPercentage);

        const difficultyTitle = this.add.text(
            this.cameras.main.width / 2,
            330,
            difficultyText,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ff3333',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5, 0);

        const difficultyDesc = this.add.text(
            this.cameras.main.width / 2,
            370,
            difficultyDescription,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: this.cameras.main.width - 120 }
            }
        ).setOrigin(0.5, 0.5);

        this.contentContainer.add(difficultyTitle);
        this.contentContainer.add(difficultyDesc);

        // Create tips section with visual enhancements
        const tipsPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            460,
            this.cameras.main.width - 100,
            120,
            0x003300,
            0.3
        );
        tipsPanel.setStrokeStyle(1, 0x33ff33, 0.3);
        this.contentContainer.add(tipsPanel);

        const tipsTitle = this.add.text(
            this.cameras.main.width / 2,
            410,
            'TIPS FOR VICTORY',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5, 0);

        const tips = [
            "• Diversify your arsenal - don't rely on a single weapon type",
            "• Be adaptable - change tactics when the Nemesis morphs",
            "• Watch for weaknesses during form changes and phase transitions",
            "• Balance your build with offensive, defensive, and utility upgrades",
            "• Save your most powerful abilities for the final phase"
        ].join('\n');

        const tipsText = this.add.text(
            this.cameras.main.width / 2,
            460,
            tips,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: this.cameras.main.width - 120 }
            }
        ).setOrigin(0.5, 0.5);

        this.contentContainer.add(tipsTitle);
        this.contentContainer.add(tipsText);

        // Add tip icons if icons manager is available
        if (this.iconsManager) {
            const tipIcon = this.iconsManager.createIcon(
                this.cameras.main.width / 2 - (this.cameras.main.width - 120) / 2 - 20,
                410,
                'nemesis_balanced'
            );
            tipIcon.setScale(0.5);
            this.contentContainer.add(tipIcon);
        }
    }

    /**
     * Create enhanced content background with visual effects
     */
    createEnhancedContentBackground() {
        // Create main content background
        const contentBg = this.add.rectangle(
            this.cameras.main.width / 2,
            300,
            this.cameras.main.width - 60,
            450,
            0x000033,
            0.7
        );
        contentBg.setStrokeStyle(2, 0x3366cc, 0.5);

        // Create top accent bar
        const topBar = this.add.rectangle(
            this.cameras.main.width / 2,
            150,
            this.cameras.main.width - 60,
            10,
            0x3366cc,
            0.5
        );

        // Create bottom accent bar
        const bottomBar = this.add.rectangle(
            this.cameras.main.width / 2,
            450,
            this.cameras.main.width - 60,
            10,
            0x3366cc,
            0.5
        );

        // Add to container
        this.contentContainer.add([contentBg, topBar, bottomBar]);

        // Add corner decorations
        this.addCornerDecorations();
    }

    /**
     * Add decorative elements to the corners of the content background
     */
    addCornerDecorations() {
        const width = this.cameras.main.width - 60;
        const height = 450;
        const x = this.cameras.main.width / 2;
        const y = 300;

        // Create corner graphics
        const cornerSize = 20;
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x3366cc, 0.8);

        // Top-left corner
        graphics.beginPath();
        graphics.moveTo(x - width/2, y - height/2 + cornerSize);
        graphics.lineTo(x - width/2, y - height/2);
        graphics.lineTo(x - width/2 + cornerSize, y - height/2);
        graphics.strokePath();

        // Top-right corner
        graphics.beginPath();
        graphics.moveTo(x + width/2, y - height/2 + cornerSize);
        graphics.lineTo(x + width/2, y - height/2);
        graphics.lineTo(x + width/2 - cornerSize, y - height/2);
        graphics.strokePath();

        // Bottom-left corner
        graphics.beginPath();
        graphics.moveTo(x - width/2, y + height/2 - cornerSize);
        graphics.lineTo(x - width/2, y + height/2);
        graphics.lineTo(x - width/2 + cornerSize, y + height/2);
        graphics.strokePath();

        // Bottom-right corner
        graphics.beginPath();
        graphics.moveTo(x + width/2, y + height/2 - cornerSize);
        graphics.lineTo(x + width/2, y + height/2);
        graphics.lineTo(x + width/2 - cornerSize, y + height/2);
        graphics.strokePath();

        this.contentContainer.add(graphics);
    }

    /**
     * Create a visual representation of the Nemesis
     */
    createNemesisVisual() {
        // Create a container for the Nemesis visual
        const visualContainer = this.add.container(this.cameras.main.width - 150, 180);

        // Create the Nemesis shape
        const graphics = this.add.graphics();

        // Draw Nemesis outline
        graphics.lineStyle(2, 0x3366cc, 0.8);
        graphics.fillStyle(0x000066, 0.5);

        // Draw a complex shape representing the Nemesis
        graphics.beginPath();

        // Main body (hexagon)
        const radius = 40;
        for (let i = 0; i < 6; i++) {
            const angle = Phaser.Math.DegToRad(i * 60);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();

        // Draw inner details
        graphics.lineStyle(1, 0x3366cc, 0.5);

        // Inner hexagon
        graphics.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Phaser.Math.DegToRad(i * 60);
            const x = Math.cos(angle) * (radius * 0.7);
            const y = Math.sin(angle) * (radius * 0.7);

            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        graphics.closePath();
        graphics.strokePath();

        // Center circle
        graphics.fillStyle(0x3366cc, 0.5);
        graphics.fillCircle(0, 0, radius * 0.3);
        graphics.lineStyle(1, 0xffffff, 0.5);
        graphics.strokeCircle(0, 0, radius * 0.3);

        // Add to container
        visualContainer.add(graphics);

        // Add a pulsing effect
        this.tweens.add({
            targets: visualContainer,
            scaleX: { from: 1, to: 1.1 },
            scaleY: { from: 1, to: 1.1 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Add a slow rotation
        this.tweens.add({
            targets: visualContainer,
            angle: { from: 0, to: 360 },
            duration: 20000,
            repeat: -1
        });

        this.contentContainer.add(visualContainer);
    }

    /**
     * Create a difficulty meter
     * @param {number} percentage - Difficulty percentage (0-100)
     */
    createDifficultyMeter(percentage) {
        // Create container for the meter
        const meterContainer = this.add.container(this.cameras.main.width / 2, 350);

        // Create meter background
        const meterBg = this.add.rectangle(
            0, 0,
            200, 20,
            0x222222,
            0.8
        );
        meterBg.setStrokeStyle(1, 0xffffff, 0.5);

        // Create meter fill
        const fillWidth = (percentage / 100) * 200;
        const meterFill = this.add.rectangle(
            -100 + (fillWidth / 2), 0,
            fillWidth, 20,
            this.getDifficultyColor(percentage),
            0.8
        );
        meterFill.setOrigin(0, 0.5);

        // Add to container
        meterContainer.add([meterBg, meterFill]);

        // Add percentage markers
        for (let i = 0; i <= 100; i += 25) {
            const markerX = -100 + (i * 2);
            const markerHeight = i % 50 === 0 ? 16 : 10;

            const marker = this.add.line(
                markerX, 0,
                0, -markerHeight/2,
                0, markerHeight/2,
                0xffffff,
                0.5
            );

            meterContainer.add(marker);

            // Add percentage text for major markers
            if (i % 50 === 0) {
                const percentText = this.add.text(
                    markerX, 15,
                    `${i}%`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: '#ffffff',
                        align: 'center'
                    }
                ).setOrigin(0.5, 0);

                meterContainer.add(percentText);
            }
        }

        this.contentContainer.add(meterContainer);
    }

    /**
     * Get color for difficulty meter based on percentage
     * @param {number} percentage - Difficulty percentage (0-100)
     * @returns {number} Color value
     */
    getDifficultyColor(percentage) {
        if (percentage < 50) {
            return 0x33cc33; // Green
        } else if (percentage < 75) {
            return 0xffcc33; // Yellow
        } else if (percentage < 90) {
            return 0xff6633; // Orange
        } else {
            return 0xff3333; // Red
        }
    }

    showAdaptationTab() {
        // Create content background
        const contentBg = this.add.rectangle(
            this.cameras.main.width / 2,
            300,
            this.cameras.main.width - 60,
            450,
            0x000033,
            0.7
        );

        this.contentContainer.add(contentBg);

        // Create adaptation description
        const description = [
            "The Nemesis adapts to your playstyle in several ways:",
            "",
            "WEAPON ADAPTATION: The Nemesis develops resistances to your most-used weapons. It will take less damage from weapons you rely on heavily.",
            "",
            "BUILD ADAPTATION: The Nemesis counters your preferred build style. If you favor offensive builds, it will develop stronger defenses. If you prefer defensive builds, it will develop armor-piercing attacks.",
            "",
            "MORPHING: During battle, the Nemesis can morph between different boss forms, taking on characteristics of bosses you've already defeated."
        ].join('\n');

        const descriptionText = this.add.text(
            this.cameras.main.width / 2,
            180,
            description,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: this.cameras.main.width - 100 }
            }
        ).setOrigin(0.5, 0);

        this.contentContainer.add(descriptionText);

        // Create player analysis section if Nemesis system exists
        if (this.game.global.nemesisSystem) {
            // Get player's dominant weapon and build style
            const dominantWeapon = this.game.global.nemesisSystem.getDominantWeaponType();
            const dominantBuildStyle = this.game.global.nemesisSystem.getDominantBuildStyle();

            // Create analysis title
            const analysisTitle = this.add.text(
                this.cameras.main.width / 2,
                350,
                'NEMESIS ANALYSIS OF YOUR PLAYSTYLE',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ff3333',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(analysisTitle);

            // Create weapon analysis
            let weaponName = "Unknown";
            switch (dominantWeapon) {
                case 'laser': weaponName = "Basic Laser"; break;
                case 'triBeam': weaponName = "Tri-Beam"; break;
                case 'plasmaBolt': weaponName = "Plasma Bolt"; break;
                case 'homingMissile': weaponName = "Homing Missile"; break;
                case 'dualCannon': weaponName = "Dual Cannon"; break;
                case 'beamLaser': weaponName = "Beam Laser"; break;
                case 'scatterBomb': weaponName = "Scatter Bomb"; break;
            }

            const weaponAnalysis = this.add.text(
                this.cameras.main.width / 2,
                380,
                `DOMINANT WEAPON: ${weaponName}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(weaponAnalysis);

            // Create build style analysis
            let buildName = "Unknown";
            switch (dominantBuildStyle) {
                case 'offensive': buildName = "Offensive"; break;
                case 'defensive': buildName = "Defensive"; break;
                case 'utility': buildName = "Utility"; break;
                case 'balanced': buildName = "Balanced"; break;
            }

            const buildAnalysis = this.add.text(
                this.cameras.main.width / 2,
                410,
                `DOMINANT BUILD STYLE: ${buildName}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(buildAnalysis);

            // Create adaptation warning
            const adaptationWarning = this.add.text(
                this.cameras.main.width / 2,
                450,
                `WARNING: The Nemesis will develop resistances to ${weaponName} weapons\nand will counter your ${buildName} build style.`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ff3333',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(adaptationWarning);

            // Create counter strategy
            let counterStrategy = "";
            switch (dominantBuildStyle) {
                case 'offensive':
                    counterStrategy = "Consider incorporating more defensive upgrades and using a variety of weapons.";
                    break;
                case 'defensive':
                    counterStrategy = "Consider incorporating more offensive upgrades and weapons that can penetrate shields.";
                    break;
                case 'utility':
                    counterStrategy = "Consider incorporating more direct damage upgrades and weapons with high burst damage.";
                    break;
                case 'balanced':
                    counterStrategy = "Your balanced approach is good, but consider specializing more in areas the Nemesis is weak against.";
                    break;
                default:
                    counterStrategy = "Diversify your weapon usage and build style to prevent the Nemesis from adapting too effectively.";
            }

            const strategyText = this.add.text(
                this.cameras.main.width / 2,
                500,
                `COUNTER STRATEGY: ${counterStrategy}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#33ff33',
                    align: 'center',
                    wordWrap: { width: this.cameras.main.width - 100 }
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(strategyText);
        } else {
            // No Nemesis system data available
            const noDataText = this.add.text(
                this.cameras.main.width / 2,
                400,
                "No Nemesis analysis data available yet.\nDefeat more bosses to generate adaptation data.",
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(noDataText);
        }
    }

    showHistoryTab() {
        // Create content background
        const contentBg = this.add.rectangle(
            this.cameras.main.width / 2,
            300,
            this.cameras.main.width - 60,
            450,
            0x000033,
            0.7
        );

        this.contentContainer.add(contentBg);

        // Create history title
        const historyTitle = this.add.text(
            this.cameras.main.width / 2,
            180,
            'NEMESIS ENCOUNTER HISTORY',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#3366cc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5, 0);

        this.contentContainer.add(historyTitle);

        // Get Nemesis data if available
        if (this.game.global.nemesisData) {
            const nemesisData = this.game.global.nemesisData;

            // Create encounter statistics
            const statsText = this.add.text(
                this.cameras.main.width / 2,
                220,
                `TOTAL ENCOUNTERS: ${nemesisData.encounters || 0}\nTOTAL DEFEATS: ${nemesisData.defeats || 0}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(statsText);

            // Create defeated bosses section
            const bossesTitle = this.add.text(
                this.cameras.main.width / 2,
                280,
                'DEFEATED BOSSES',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#33ff33',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(bossesTitle);

            // Create list of defeated bosses
            const defeatedBosses = nemesisData.defeatedBosses || {};
            const bossNames = {
                SCOUT_COMMANDER: "The Guardian",
                BATTLE_CARRIER: "The Carrier",
                DESTROYER_PRIME: "Destroyer Prime",
                STEALTH_OVERLORD: "Stealth Overlord",
                DREADNOUGHT: "The Dreadnought",
                BOMBER_TITAN: "Bomber Titan"
            };

            let bossListText = "";
            let defeatedCount = 0;

            Object.entries(defeatedBosses).forEach(([bossType, defeated]) => {
                if (defeated) {
                    defeatedCount++;
                    const bossName = bossNames[bossType] || bossType;
                    bossListText += `• ${bossName}\n`;
                }
            });

            if (defeatedCount === 0) {
                bossListText = "No bosses defeated yet.";
            }

            const bossListDisplay = this.add.text(
                this.cameras.main.width / 2,
                310,
                bossListText,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(bossListDisplay);

            // Create weapon usage statistics
            const weaponTitle = this.add.text(
                this.cameras.main.width / 2,
                400,
                'WEAPON USAGE STATISTICS',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#33ff33',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(weaponTitle);

            // Create weapon usage bars
            const weaponUsage = nemesisData.weaponUsage || {};
            const weaponNames = {
                laser: "Basic Laser",
                triBeam: "Tri-Beam",
                plasmaBolt: "Plasma Bolt",
                homingMissile: "Homing Missile",
                dualCannon: "Dual Cannon",
                beamLaser: "Beam Laser",
                scatterBomb: "Scatter Bomb"
            };

            // Find the maximum usage value
            let maxUsage = 1; // Avoid division by zero
            Object.values(weaponUsage).forEach(usage => {
                if (usage > maxUsage) maxUsage = usage;
            });

            // Create usage bars
            let yOffset = 430;
            Object.entries(weaponUsage).forEach(([weapon, usage]) => {
                const weaponName = weaponNames[weapon] || weapon;
                const percentage = Math.min(100, Math.floor((usage / maxUsage) * 100));

                // Create weapon name text
                const nameText = this.add.text(
                    100,
                    yOffset,
                    weaponName,
                    {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#ffffff',
                        align: 'left'
                    }
                ).setOrigin(0, 0.5);

                // Create usage bar background
                const barBg = this.add.rectangle(
                    250,
                    yOffset,
                    200,
                    10,
                    0x222244
                ).setOrigin(0, 0.5);

                // Create usage bar fill
                const barFill = this.add.rectangle(
                    250,
                    yOffset,
                    (percentage / 100) * 200,
                    10,
                    0x3366cc
                ).setOrigin(0, 0.5);

                // Create percentage text
                const percentText = this.add.text(
                    460,
                    yOffset,
                    `${percentage}%`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#ffffff',
                        align: 'right'
                    }
                ).setOrigin(0, 0.5);

                this.contentContainer.add(nameText);
                this.contentContainer.add(barBg);
                this.contentContainer.add(barFill);
                this.contentContainer.add(percentText);

                yOffset += 20;
            });
        } else {
            // No Nemesis data available
            const noDataText = this.add.text(
                this.cameras.main.width / 2,
                300,
                "No Nemesis history data available yet.",
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0);

            this.contentContainer.add(noDataText);
        }
    }

    createNavigationButtons() {
        // Create back button
        const backButton = this.add.rectangle(
            100,
            this.cameras.main.height - 50,
            150,
            40,
            0x222244,
            0.8
        ).setInteractive();

        const backText = this.add.text(
            100,
            this.cameras.main.height - 50,
            'BACK',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Add hover effect
        backButton.on('pointerover', () => {
            backButton.setFillStyle(0x3366cc, 0.8);
        });

        backButton.on('pointerout', () => {
            backButton.setFillStyle(0x222244, 0.8);
        });

        // Add click handler
        backButton.on('pointerdown', () => {
            this.returnToPreviousScene();
        });

        // Create attack guide button
        const guideButton = this.add.rectangle(
            this.cameras.main.width - 100,
            this.cameras.main.height - 50,
            180,
            40,
            0x223322,
            0.8
        ).setInteractive();

        const guideText = this.add.text(
            this.cameras.main.width - 100,
            this.cameras.main.height - 50,
            'ATTACK GUIDE',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Add hover effect
        guideButton.on('pointerover', () => {
            guideButton.setFillStyle(0x33cc33, 0.8);
        });

        guideButton.on('pointerout', () => {
            guideButton.setFillStyle(0x223322, 0.8);
        });

        // Add click handler
        guideButton.on('pointerdown', () => {
            this.showAttackGuide();
        });

        // Create difficulty selector button
        const difficultyButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            180,
            40,
            0x222233,
            0.8
        ).setInteractive();

        const difficultyText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'SET DIFFICULTY',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Add hover effect
        difficultyButton.on('pointerover', () => {
            difficultyButton.setFillStyle(0xffcc33, 0.8);
        });

        difficultyButton.on('pointerout', () => {
            difficultyButton.setFillStyle(0x222233, 0.8);
        });

        // Add click handler
        difficultyButton.on('pointerdown', () => {
            this.showDifficultySelector();
        });

        // Create history button
        const historyButton = this.add.rectangle(
            this.cameras.main.width / 2 + 200,
            this.cameras.main.height - 50,
            180,
            40,
            0x332222,
            0.8
        ).setInteractive();

        const historyText = this.add.text(
            this.cameras.main.width / 2 + 200,
            this.cameras.main.height - 50,
            'PERFORMANCE',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);

        // Add hover effect
        historyButton.on('pointerover', () => {
            historyButton.setFillStyle(0xff6633, 0.8);
        });

        historyButton.on('pointerout', () => {
            historyButton.setFillStyle(0x332222, 0.8);
        });

        // Add click handler
        historyButton.on('pointerdown', () => {
            this.showPerformanceHistory();
        });

        // Create reset button (for testing)
        if (this.game.global.debug && this.game.global.debug.unlockAll) {
            const resetButton = this.add.rectangle(
                this.cameras.main.width / 2 - 200,
                this.cameras.main.height - 50,
                150,
                40,
                0x442222,
                0.8
            ).setInteractive();

            const resetText = this.add.text(
                this.cameras.main.width / 2 - 200,
                this.cameras.main.height - 50,
                'RESET DATA',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0.5);

            // Add hover effect
            resetButton.on('pointerover', () => {
                resetButton.setFillStyle(0xcc3333, 0.8);
            });

            resetButton.on('pointerout', () => {
                resetButton.setFillStyle(0x442222, 0.8);
            });

            // Add click handler
            resetButton.on('pointerdown', () => {
                this.resetNemesisData();
            });
        }
    }

    addKeyboardHandlers() {
        // Add ESC key handler to return to previous scene
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToPreviousScene();
        });
    }

    returnToPreviousScene() {
        this.scene.start(this.returnScene, this.returnData);
    }

    resetNemesisData() {
        // Reset Nemesis data if system exists
        if (this.game.global.nemesisSystem) {
            this.game.global.nemesisSystem.resetNemesisData();

            // Show confirmation message
            const confirmText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'NEMESIS DATA RESET',
                {
                    fontFamily: 'monospace',
                    fontSize: '24px',
                    color: '#ff3333',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5, 0.5);

            // Fade out and refresh
            this.tweens.add({
                targets: confirmText,
                alpha: 0,
                duration: 1500,
                onComplete: () => {
                    confirmText.destroy();
                    this.scene.restart();
                }
            });
        }
    }

    /**
     * Show the attack guide
     */
    showAttackGuide() {
        // Create attack guide if it doesn't exist
        if (!this.attackGuide) {
            this.attackGuide = new NemesisAttackGuide(this);
        }

        // Show the guide
        this.attackGuide.show();
    }

    /**
     * Show the difficulty selector
     */
    showDifficultySelector() {
        // Create difficulty selector if it doesn't exist
        if (!this.difficultySelector) {
            this.difficultySelector = new NemesisDifficultySelector(this);
        }

        // Show the selector with callback
        this.difficultySelector.show((difficulty) => {
            // Apply selected difficulty if nemesis system exists
            if (this.game.global.nemesisDifficulty) {
                // Apply difficulty value
                if (difficulty.value >= 0) {
                    // Fixed difficulty
                    this.game.global.nemesisDifficulty.setFixedDifficulty(difficulty.value);
                } else {
                    // Adaptive difficulty
                    this.game.global.nemesisDifficulty.setAdaptiveDifficulty(true);
                }

                // Show confirmation message
                const confirmText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    `DIFFICULTY SET: ${difficulty.label}`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '24px',
                        color: '#' + difficulty.color.replace('#', ''),
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5, 0.5);

                // Fade out and refresh
                this.tweens.add({
                    targets: confirmText,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => {
                        confirmText.destroy();
                        this.scene.restart();
                    }
                });
            }
        });
    }

    /**
     * Show performance history
     */
    showPerformanceHistory() {
        try {
            // Get performance history from local storage
            const historyData = localStorage.getItem('nemesis_performance_history');
            if (!historyData) {
                // Show message if no history
                const noHistoryText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    'NO PERFORMANCE HISTORY AVAILABLE',
                    {
                        fontFamily: 'monospace',
                        fontSize: '18px',
                        color: '#cccccc',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5, 0.5);

                // Fade out
                this.tweens.add({
                    targets: noHistoryText,
                    alpha: 0,
                    duration: 1500,
                    delay: 1000,
                    onComplete: () => {
                        noHistoryText.destroy();
                    }
                });
                return;
            }

            // Parse history data
            const history = JSON.parse(historyData);

            // Create container for history display
            const historyContainer = this.add.container(0, 0);
            historyContainer.setDepth(1000);

            // Create background
            const bg = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000,
                0.8
            );

            // Create title
            const title = this.add.text(
                this.cameras.main.width / 2,
                50,
                'NEMESIS PERFORMANCE HISTORY',
                {
                    fontFamily: 'monospace',
                    fontSize: '24px',
                    color: '#ffffff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);

            // Create close button
            const closeButton = this.add.text(
                this.cameras.main.width - 20,
                20,
                'CLOSE',
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ff3333',
                    align: 'right',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(1, 0).setInteractive();

            // Add hover effect
            closeButton.on('pointerover', () => {
                closeButton.setScale(1.1);
            });

            closeButton.on('pointerout', () => {
                closeButton.setScale(1);
            });

            // Add click handler
            closeButton.on('pointerdown', () => {
                // Fade out and destroy
                this.tweens.add({
                    targets: historyContainer,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        historyContainer.destroy();
                    }
                });
            });

            // Add elements to container
            historyContainer.add([bg, title, closeButton]);

            // Create entries (most recent first)
            const entries = history.slice().reverse();
            const maxEntries = Math.min(entries.length, 5); // Show up to 5 entries

            for (let i = 0; i < maxEntries; i++) {
                const entry = entries[i];
                const metrics = entry.metrics;
                const date = new Date(entry.date);
                const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                // Create entry panel
                const panel = this.add.rectangle(
                    this.cameras.main.width / 2,
                    120 + (i * 80),
                    this.cameras.main.width - 100,
                    70,
                    0x222244,
                    0.7
                );
                panel.setStrokeStyle(1, 0x3366cc, 0.5);

                // Create date text
                const dateText = this.add.text(
                    this.cameras.main.width / 2 - 200,
                    100 + (i * 80),
                    dateStr,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#cccccc',
                        align: 'left'
                    }
                ).setOrigin(0, 0);

                // Create grade
                const gradeColor = this.getGradeColor(metrics.grade);
                const gradeText = this.add.text(
                    this.cameras.main.width / 2 + 200,
                    100 + (i * 80),
                    `GRADE: ${metrics.grade}`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '18px',
                        color: gradeColor,
                        align: 'right',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(1, 0);

                // Create stats text
                const statsText = this.add.text(
                    this.cameras.main.width / 2 - 200,
                    125 + (i * 80),
                    `Time: ${this.formatTime(metrics.timeInFight)} | Damage: ${Math.floor(metrics.damageDealt)} | Hits: ${metrics.hitsLanded}`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff',
                        align: 'left'
                    }
                ).setOrigin(0, 0);

                // Add to container
                historyContainer.add([panel, dateText, gradeText, statsText]);
            }

            // Set initial alpha to 0
            historyContainer.alpha = 0;

            // Fade in
            this.tweens.add({
                targets: historyContainer,
                alpha: 1,
                duration: 300
            });
        } catch (error) {
            console.warn('Failed to show performance history', error);
        }
    }

    /**
     * Format time in milliseconds to MM:SS format
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get color for grade
     * @param {string} grade - Grade (S, A, B, C, D, F)
     * @returns {string} Color in hex format
     */
    getGradeColor(grade) {
        switch (grade) {
            case 'S': return '#ffcc00';
            case 'A': return '#33ff33';
            case 'B': return '#33ccff';
            case 'C': return '#ffcc33';
            case 'D': return '#ff9933';
            case 'F': return '#ff3333';
            default: return '#ffffff';
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisInfoScene = NemesisInfoScene;
}
