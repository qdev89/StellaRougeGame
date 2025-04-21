/**
 * Help Scene
 * Provides detailed help and instructions for the game
 */
class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.HELP });
    }

    init(data) {
        // Store the previous scene to return to
        this.previousScene = data.previousScene || CONSTANTS.SCENES.MAIN_MENU;
    }

    create() {
        console.log('HelpScene: Creating help interface...');

        // Variables for positioning
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create background
        this.createBackground();

        // Create header
        this.createHeader();

        // Create tabs
        this.createTabs();

        // Create content panel
        this.createContentPanel();

        // Create return button
        this.createReturnButton();

        // Show the first tab content by default
        this.showTabContent('basics');

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
            'HELP & INSTRUCTIONS',
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
            'Learn how to play Stellar Rogue',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    createTabs() {
        // Tab definitions
        this.tabs = [
            { id: 'basics', label: 'BASICS', x: 150 },
            { id: 'combat', label: 'COMBAT', x: 300 },
            { id: 'upgrades', label: 'UPGRADES', x: 450 },
            { id: 'sectors', label: 'SECTORS', x: 600 },
            { id: 'advanced', label: 'ADVANCED', x: 750 }
        ];

        // Create tab container
        this.tabContainer = this.add.container(0, 120);

        // Create tabs
        this.tabButtons = {};
        this.tabs.forEach(tab => {
            // Create tab background
            const tabBg = this.add.rectangle(
                tab.x,
                0,
                120,
                40,
                0x224466,
                0.7
            ).setInteractive({ useHandCursor: true });

            // Create tab text
            const tabText = this.add.text(
                tab.x,
                0,
                tab.label,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);

            // Store reference
            this.tabButtons[tab.id] = { bg: tabBg, text: tabText };

            // Add to container
            this.tabContainer.add([tabBg, tabText]);

            // Add click handler
            tabBg.on('pointerdown', () => {
                this.showTabContent(tab.id);
            });

            // Add hover effect
            tabBg.on('pointerover', () => {
                tabBg.setFillStyle(0x3399ff, 0.7);
            });

            tabBg.on('pointerout', () => {
                if (this.activeTab !== tab.id) {
                    tabBg.setFillStyle(0x224466, 0.7);
                }
            });
        });
    }

    createContentPanel() {
        // Create content panel
        this.contentPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            this.cameras.main.width - 100,
            this.cameras.main.height - 250,
            0x000000,
            0.7
        );
        this.contentPanel.setStrokeStyle(2, 0x3399ff, 1);

        // Create content container
        this.contentContainer = this.add.container(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50
        );

        // Prepare content for each tab
        this.prepareTabContent();
    }

    prepareTabContent() {
        // Create content for each tab
        this.tabContent = {};

        // Basics tab content
        this.tabContent.basics = this.createBasicsContent();

        // Combat tab content
        this.tabContent.combat = this.createCombatContent();

        // Upgrades tab content
        this.tabContent.upgrades = this.createUpgradesContent();

        // Sectors tab content
        this.tabContent.sectors = this.createSectorsContent();

        // Advanced tab content
        this.tabContent.advanced = this.createAdvancedContent();

        // Hide all content initially
        Object.values(this.tabContent).forEach(content => {
            content.setVisible(false);
        });
    }

    createBasicsContent() {
        const container = this.add.container(0, 0);

        // Title
        const title = this.add.text(
            0,
            -this.contentPanel.height / 2 + 30,
            'GAME BASICS',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#3399ff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Content sections
        const sections = [
            {
                title: 'CONTROLS',
                content: [
                    'MOVEMENT: WASD or ARROW KEYS',
                    'DASH: SPACE',
                    'WEAPON SWITCH: 1-7 number keys',
                    'PAUSE: ESC'
                ]
            },
            {
                title: 'OBJECTIVE',
                content: [
                    'Navigate through sectors, defeating enemies and collecting upgrades.',
                    'Reach and defeat the boss at the end of each sector to progress.',
                    'The ultimate goal is to defeat the final Nemesis boss in Sector 6.'
                ]
            },
            {
                title: 'SHIP STATS',
                content: [
                    'HULL: Your ship\'s health. When it reaches zero, your run ends.',
                    'SHIELDS: Absorbs damage and regenerates over time.',
                    'SPEED: How quickly your ship moves.',
                    'FIRE RATE: How quickly your weapons fire.'
                ]
            },
            {
                title: 'PROGRESSION',
                content: [
                    'Each run is unique with procedurally generated sectors.',
                    'Credits earned during runs can be spent on permanent upgrades.',
                    'Unlock new ships and starting equipment as you progress.'
                ]
            }
        ];

        // Create section texts
        let yOffset = -this.contentPanel.height / 2 + 80;
        sections.forEach(section => {
            // Section title
            const sectionTitle = this.add.text(
                -this.contentPanel.width / 2 + 40,
                yOffset,
                section.title,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'left'
                }
            ).setOrigin(0);

            // Add underline
            const underline = this.add.rectangle(
                -this.contentPanel.width / 2 + 40,
                yOffset + 20,
                200,
                2,
                0x3399ff,
                1
            ).setOrigin(0);

            // Add to container
            container.add([sectionTitle, underline]);

            // Section content
            yOffset += 40;
            section.content.forEach(line => {
                const contentText = this.add.text(
                    -this.contentPanel.width / 2 + 60,
                    yOffset,
                    line,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#cccccc',
                        align: 'left',
                        wordWrap: { width: this.contentPanel.width - 120 }
                    }
                ).setOrigin(0);

                // Add to container
                container.add(contentText);

                // Update offset based on text height
                yOffset += contentText.height + 10;
            });

            // Add spacing between sections
            yOffset += 20;
        });

        // Add all elements to container
        container.add(title);

        // Add to content container
        this.contentContainer.add(container);

        return container;
    }

    createCombatContent() {
        const container = this.add.container(0, 0);

        // Title
        const title = this.add.text(
            0,
            -this.contentPanel.height / 2 + 30,
            'COMBAT GUIDE',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#3399ff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Content sections
        const sections = [
            {
                title: 'WEAPONS',
                content: [
                    'BLASTER: Balanced weapon with moderate damage and fire rate.',
                    'DUAL CANNON: Fires two parallel projectiles for increased coverage.',
                    'LASER BEAM: Continuous damage beam with high penetration.',
                    'SCATTER BOMB: Explodes into multiple fragments for area damage.',
                    'RAILGUN: High damage, slow fire rate, pierces multiple enemies.',
                    'PULSE CANNON: Rapid fire, low damage, good for swarms.',
                    'MISSILE LAUNCHER: Homing projectiles with splash damage.'
                ]
            },
            {
                title: 'ENEMY TYPES',
                content: [
                    'DRONE: Basic enemy with simple movement and attacks.',
                    'FIGHTER: Faster enemy that strafes while attacking.',
                    'INTERCEPTOR: Aggressively pursues the player with high speed.',
                    'BOMBER: Slow but drops explosive mines.',
                    'STEALTH: Can cloak and ambush with surprise attacks.',
                    'TURRET: Stationary enemy with long-range attacks.',
                    'CARRIER: Spawns smaller drone enemies.'
                ]
            },
            {
                title: 'TACTICS',
                content: [
                    'Use your dash ability to avoid concentrated enemy fire.',
                    'Switch weapons based on the enemy types you\'re facing.',
                    'Prioritize dangerous enemies like Carriers and Bombers.',
                    'Use cover and environmental obstacles when available.',
                    'Don\'t be afraid to retreat temporarily to let shields recharge.'
                ]
            },
            {
                title: 'BOSS FIGHTS',
                content: [
                    'Bosses have multiple attack phases based on their health.',
                    'Watch for visual cues that telegraph their attacks.',
                    'Focus on destroying any additional components or minions.',
                    'Save your most powerful weapons and abilities for boss fights.',
                    'Learn boss patterns to anticipate and avoid their attacks.'
                ]
            }
        ];

        // Create section texts
        let yOffset = -this.contentPanel.height / 2 + 80;
        sections.forEach(section => {
            // Section title
            const sectionTitle = this.add.text(
                -this.contentPanel.width / 2 + 40,
                yOffset,
                section.title,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'left'
                }
            ).setOrigin(0);

            // Add underline
            const underline = this.add.rectangle(
                -this.contentPanel.width / 2 + 40,
                yOffset + 20,
                200,
                2,
                0x3399ff,
                1
            ).setOrigin(0);

            // Add to container
            container.add([sectionTitle, underline]);

            // Section content
            yOffset += 40;
            section.content.forEach(line => {
                const contentText = this.add.text(
                    -this.contentPanel.width / 2 + 60,
                    yOffset,
                    line,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#cccccc',
                        align: 'left',
                        wordWrap: { width: this.contentPanel.width - 120 }
                    }
                ).setOrigin(0);

                // Add to container
                container.add(contentText);

                // Update offset based on text height
                yOffset += contentText.height + 10;
            });

            // Add spacing between sections
            yOffset += 20;
        });

        // Add all elements to container
        container.add(title);

        // Add to content container
        this.contentContainer.add(container);

        return container;
    }

    createUpgradesContent() {
        const container = this.add.container(0, 0);

        // Title
        const title = this.add.text(
            0,
            -this.contentPanel.height / 2 + 30,
            'UPGRADES & PROGRESSION',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#3399ff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Content sections
        const sections = [
            {
                title: 'UPGRADE TYPES',
                content: [
                    'STAT BOOSTS: Directly improve ship statistics like health, shields, speed, or fire rate.',
                    'WEAPONS: New weapons or improvements to existing ones.',
                    'ABILITIES: Special abilities like improved dash, shield overcharge, or weapon effects.',
                    'SUBSYSTEMS: Components that can be placed in the Synergy Grid for additional bonuses.'
                ]
            },
            {
                title: 'UPGRADE TIERS',
                content: [
                    'TIER 1: Basic upgrades available from the start.',
                    'TIER 2: Advanced upgrades available from Sector 3.',
                    'TIER 3: Elite upgrades available from Sector 5.',
                    'Higher tier upgrades provide stronger effects but are rarer.'
                ]
            },
            {
                title: 'SUBSYSTEM SYNERGY GRID',
                content: [
                    'The Synergy Grid is a 3×3 grid where you can place subsystem components.',
                    'Adjacent compatible components create synergies for additional bonuses.',
                    'Experiment with different arrangements to find powerful combinations.',
                    'Some rare components can create special synergies with unique effects.'
                ]
            },
            {
                title: 'META-PROGRESSION',
                content: [
                    'Credits earned during runs can be spent on permanent upgrades.',
                    'Unlock new ships with different starting stats and equipment.',
                    'Complete achievements to unlock special items and bonuses.',
                    'The Nemesis system adapts to your playstyle across multiple runs.'
                ]
            }
        ];

        // Create section texts
        let yOffset = -this.contentPanel.height / 2 + 80;
        sections.forEach(section => {
            // Section title
            const sectionTitle = this.add.text(
                -this.contentPanel.width / 2 + 40,
                yOffset,
                section.title,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'left'
                }
            ).setOrigin(0);

            // Add underline
            const underline = this.add.rectangle(
                -this.contentPanel.width / 2 + 40,
                yOffset + 20,
                200,
                2,
                0x3399ff,
                1
            ).setOrigin(0);

            // Add to container
            container.add([sectionTitle, underline]);

            // Section content
            yOffset += 40;
            section.content.forEach(line => {
                const contentText = this.add.text(
                    -this.contentPanel.width / 2 + 60,
                    yOffset,
                    line,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#cccccc',
                        align: 'left',
                        wordWrap: { width: this.contentPanel.width - 120 }
                    }
                ).setOrigin(0);

                // Add to container
                container.add(contentText);

                // Update offset based on text height
                yOffset += contentText.height + 10;
            });

            // Add spacing between sections
            yOffset += 20;
        });

        // Add all elements to container
        container.add(title);

        // Add to content container
        this.contentContainer.add(container);

        return container;
    }

    createSectorsContent() {
        const container = this.add.container(0, 0);

        // Title
        const title = this.add.text(
            0,
            -this.contentPanel.height / 2 + 30,
            'SECTORS & NAVIGATION',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#3399ff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Content sections
        const sections = [
            {
                title: 'SECTOR MAP',
                content: [
                    'The Sector Map shows your possible paths through the current sector.',
                    'Each node represents an encounter you\'ll face.',
                    'Plan your route carefully based on your ship\'s condition and your playstyle.',
                    'Paths have different difficulty levels indicated by their color.'
                ]
            },
            {
                title: 'NODE TYPES',
                content: [
                    'COMBAT: Standard battle against enemy ships.',
                    'ELITE: Tougher enemies with better rewards.',
                    'MERCHANT: Buy upgrades, items, and repairs with credits.',
                    'EVENT: Random events with choices and consequences.',
                    'BOSS: Powerful boss enemy guarding the path to the next sector.'
                ]
            },
            {
                title: 'PATH DIFFICULTY',
                content: [
                    'GREEN: Easy path with fewer enemies but only 80% of normal rewards.',
                    'BLUE: Normal path with standard enemy count and 100% rewards.',
                    'ORANGE: Hard path with more enemies but 130% rewards.',
                    'RED: Extreme path with many tough enemies but 160% rewards.',
                    'Harder paths also provide merchant discounts.'
                ]
            },
            {
                title: 'SECTOR PROGRESSION',
                content: [
                    'SECTOR 1: Tutorial area with basic enemies.',
                    'SECTOR 2-3: Introduces more enemy types and elite encounters.',
                    'SECTOR 4-5: Advanced enemies and environmental hazards.',
                    'SECTOR 6: Final sector with the Nemesis boss.',
                    'Each sector has a unique boss with special mechanics.'
                ]
            }
        ];

        // Create section texts
        let yOffset = -this.contentPanel.height / 2 + 80;
        sections.forEach(section => {
            // Section title
            const sectionTitle = this.add.text(
                -this.contentPanel.width / 2 + 40,
                yOffset,
                section.title,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'left'
                }
            ).setOrigin(0);

            // Add underline
            const underline = this.add.rectangle(
                -this.contentPanel.width / 2 + 40,
                yOffset + 20,
                200,
                2,
                0x3399ff,
                1
            ).setOrigin(0);

            // Add to container
            container.add([sectionTitle, underline]);

            // Section content
            yOffset += 40;
            section.content.forEach(line => {
                const contentText = this.add.text(
                    -this.contentPanel.width / 2 + 60,
                    yOffset,
                    line,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#cccccc',
                        align: 'left',
                        wordWrap: { width: this.contentPanel.width - 120 }
                    }
                ).setOrigin(0);

                // Add to container
                container.add(contentText);

                // Update offset based on text height
                yOffset += contentText.height + 10;
            });

            // Add spacing between sections
            yOffset += 20;
        });

        // Add all elements to container
        container.add(title);

        // Add to content container
        this.contentContainer.add(container);

        return container;
    }

    createAdvancedContent() {
        const container = this.add.container(0, 0);

        // Title
        const title = this.add.text(
            0,
            -this.contentPanel.height / 2 + 30,
            'ADVANCED MECHANICS',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#3399ff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Content sections
        const sections = [
            {
                title: 'NEMESIS SYSTEM',
                content: [
                    'The Nemesis boss adapts to your playstyle across multiple runs.',
                    'It learns from your tactics and develops counters to your preferred strategies.',
                    'Each encounter with the Nemesis is recorded and influences future encounters.',
                    'The Nemesis incorporates abilities from bosses you\'ve previously defeated.'
                ]
            },
            {
                title: 'TIME PRESSURE CHOICES',
                content: [
                    'Some events have time limits for making decisions.',
                    'STANDARD: 20 seconds to choose with minor penalty for timeout.',
                    'EMERGENCY: 10 seconds to choose with moderate penalty for timeout.',
                    'CRITICAL: 5 seconds to choose with severe penalty for timeout.',
                    'Failing to choose in time usually results in hull damage.'
                ]
            },
            {
                title: 'DYNAMIC DIFFICULTY',
                content: [
                    'The game adjusts difficulty based on your performance.',
                    'Performing well increases enemy strength but also improves rewards.',
                    'Struggling will cause the game to ease up slightly.',
                    'You can set a base difficulty level in the main menu.'
                ]
            },
            {
                title: 'ADVANCED COMBAT TACTICS',
                content: [
                    'Use environmental hazards to your advantage by luring enemies into them.',
                    'Chain weapon effects for maximum damage (e.g., slow enemies with EMP then hit with missiles).',
                    'Position yourself to hit multiple enemies with piercing or area weapons.',
                    'Time your dash to avoid boss attacks and reposition for counterattacks.',
                    'Save powerful consumables for elite encounters and boss fights.'
                ]
            }
        ];

        // Create section texts
        let yOffset = -this.contentPanel.height / 2 + 80;
        sections.forEach(section => {
            // Section title
            const sectionTitle = this.add.text(
                -this.contentPanel.width / 2 + 40,
                yOffset,
                section.title,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'left'
                }
            ).setOrigin(0);

            // Add underline
            const underline = this.add.rectangle(
                -this.contentPanel.width / 2 + 40,
                yOffset + 20,
                200,
                2,
                0x3399ff,
                1
            ).setOrigin(0);

            // Add to container
            container.add([sectionTitle, underline]);

            // Section content
            yOffset += 40;
            section.content.forEach(line => {
                const contentText = this.add.text(
                    -this.contentPanel.width / 2 + 60,
                    yOffset,
                    line,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#cccccc',
                        align: 'left',
                        wordWrap: { width: this.contentPanel.width - 120 }
                    }
                ).setOrigin(0);

                // Add to container
                container.add(contentText);

                // Update offset based on text height
                yOffset += contentText.height + 10;
            });

            // Add spacing between sections
            yOffset += 20;
        });

        // Add all elements to container
        container.add(title);

        // Add to content container
        this.contentContainer.add(container);

        return container;
    }

    createReturnButton() {
        // Create return button
        const returnButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'RETURN TO MENU',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000033',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Add hover effect
        returnButton.on('pointerover', () => {
            returnButton.setColor('#3399ff');
        });

        returnButton.on('pointerout', () => {
            returnButton.setColor('#ffffff');
        });

        // Add click handler
        returnButton.on('pointerdown', () => {
            this.returnToPreviousScene();
        });
    }

    showTabContent(tabId) {
        // Skip if already active
        if (this.activeTab === tabId) return;

        // Update active tab
        this.activeTab = tabId;

        // Update tab visuals
        Object.entries(this.tabButtons).forEach(([id, elements]) => {
            if (id === tabId) {
                elements.bg.setFillStyle(0x3399ff, 0.7);
                elements.text.setColor('#ffffff');
            } else {
                elements.bg.setFillStyle(0x224466, 0.7);
                elements.text.setColor('#cccccc');
            }
        });

        // Hide all content
        Object.values(this.tabContent).forEach(content => {
            content.setVisible(false);
        });

        // Show selected content
        this.tabContent[tabId].setVisible(true);
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
    window.HelpScene = HelpScene;
}
