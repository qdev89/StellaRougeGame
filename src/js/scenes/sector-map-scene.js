/**
 * Sector Map Scene
 * Displays the sector map and allows the player to choose their path
 */
class SectorMapScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.SECTOR_MAP });
    }

    init(data) {
        // Get data from previous scene or global state
        this.currentSector = data.sector || this.game.global.currentRun.sector || 1;
        this.score = data.score || this.game.global.currentRun.score || 0;

        // Current position in the map
        this.currentNodeId = data.currentNodeId || 0;

        // Track if we've already generated a map for this sector
        this.mapGenerated = false;
    }

    create() {
        console.log('SectorMapScene: Displaying sector map for sector', this.currentSector);

        // Create background
        this.createBackground();

        // Create UI elements
        this.createUI();

        // Generate or retrieve sector map
        if (!this.game.global.currentRun.sectorMap || !this.mapGenerated) {
            this.generateSectorMap();
            this.mapGenerated = true;
        }

        // Display the sector map
        this.displaySectorMap();

        // Set up event handlers
        this.setupEvents();
    }

    createBackground() {
        // Create a starfield background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000022)
            .setOrigin(0, 0);

        // Add some stars
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);

            this.add.circle(x, y, size, 0xffffff, 0.7);
        }
    }

    createUI() {
        // Title text
        this.add.text(
            this.cameras.main.width / 2,
            50,
            `SECTOR ${this.currentSector} MAP`,
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Instructions text
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            'Click on a node to select your next destination',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Back button
        const backButton = this.add.text(
            50,
            this.cameras.main.height - 50,
            'BACK',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                backgroundColor: '#333333',
                padding: {
                    x: 10,
                    y: 5
                }
            }
        ).setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });

        // Ship status button
        const shipStatusButton = this.add.text(
            this.cameras.main.width - 50,
            this.cameras.main.height - 50,
            'SHIP STATUS',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                backgroundColor: '#333333',
                padding: {
                    x: 10,
                    y: 5
                }
            }
        ).setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true });

        shipStatusButton.on('pointerdown', () => {
            this.scene.start(CONSTANTS.SCENES.SHIP_STATUS, {
                previousScene: CONSTANTS.SCENES.SECTOR_MAP,
                sector: this.currentSector,
                score: this.score
            });
        });

        // Node info panel (hidden initially)
        this.infoPanel = this.add.container(this.cameras.main.width - 200, 200);
        this.infoPanel.setVisible(false);

        // Info panel background
        const infoPanelBg = this.add.rectangle(0, 0, 180, 200, 0x222244, 0.8)
            .setOrigin(0, 0);

        this.infoPanel.add(infoPanelBg);

        // Info panel title
        this.infoPanelTitle = this.add.text(
            10,
            10,
            'NODE INFO',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'left'
            }
        ).setOrigin(0, 0);

        this.infoPanel.add(this.infoPanelTitle);

        // Info panel type
        this.infoPanelType = this.add.text(
            10,
            40,
            'Type: Unknown',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#cccccc',
                align: 'left'
            }
        ).setOrigin(0, 0);

        this.infoPanel.add(this.infoPanelType);

        // Info panel description
        this.infoPanelDesc = this.add.text(
            10,
            70,
            'No information available.',
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#aaaaaa',
                align: 'left',
                wordWrap: { width: 160 }
            }
        ).setOrigin(0, 0);

        this.infoPanel.add(this.infoPanelDesc);

        // Travel button
        this.travelButton = this.add.text(
            90,
            170,
            'TRAVEL',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#446688',
                padding: {
                    x: 10,
                    y: 5
                }
            }
        ).setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true });

        this.travelButton.on('pointerdown', () => {
            this.travelToSelectedNode();
        });

        this.infoPanel.add(this.travelButton);
    }

    generateSectorMap() {
        // Create sector map generator
        this.mapGenerator = new SectorMapGenerator();

        // Generate map for current sector
        this.sectorMap = this.mapGenerator.generateMap(this.currentSector);

        // Store in global state
        this.game.global.currentRun.sectorMap = this.sectorMap;
        this.game.global.currentRun.currentNodeId = 0; // Start at node 0
    }

    displaySectorMap() {
        // Map container
        this.mapContainer = this.add.container(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        );

        // Constants for map display
        const nodeRadius = 20;
        const horizontalSpacing = 120;
        const verticalSpacing = 100;

        // Calculate map dimensions
        const mapWidth = this.mapGenerator.mapWidth * horizontalSpacing;
        const mapHeight = this.mapGenerator.mapHeight * verticalSpacing;

        // Center the map
        const offsetX = -mapWidth / 2;
        const offsetY = -mapHeight / 2;

        // Draw paths first (so they're behind nodes)
        this.drawPaths(offsetX, offsetY, horizontalSpacing, verticalSpacing);

        // Draw nodes
        this.nodeSprites = [];

        for (const node of this.sectorMap.nodes) {
            // Calculate position
            const x = offsetX + node.x * horizontalSpacing;
            const y = offsetY + node.y * verticalSpacing;

            // Determine node color based on type
            let color = 0x888888; // Default gray

            switch (node.type) {
                case 'START':
                    color = 0x00ff00; // Green
                    break;
                case 'BOSS':
                    color = 0xff0000; // Red
                    break;
                case 'COMBAT':
                    color = 0x3366cc; // Blue
                    break;
                case 'ELITE':
                    color = 0xcc3366; // Pink
                    break;
                case 'HAZARD':
                    color = 0xffaa00; // Orange
                    break;
                case 'MERCHANT':
                    color = 0x33cc66; // Green
                    break;
                case 'EVENT':
                    color = 0xaa33cc; // Purple
                    break;
            }

            // Create node sprite
            const nodeSprite = this.add.circle(x, y, nodeRadius, color);

            // Add border
            const border = this.add.circle(x, y, nodeRadius + 2, 0xffffff, 0.5);

            // Add to container
            this.mapContainer.add(border);
            this.mapContainer.add(nodeSprite);

            // Add node label
            const label = this.add.text(
                x,
                y,
                this.getNodeLabel(node),
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);

            this.mapContainer.add(label);

            // Make node interactive if it's connected to current node
            const isConnected = this.isNodeConnectedToCurrent(node.id);
            const isCurrentNode = (node.id === this.currentNodeId);

            if (isConnected || isCurrentNode) {
                nodeSprite.setInteractive({ useHandCursor: true });

                // Highlight current node
                if (isCurrentNode) {
                    const highlight = this.add.circle(x, y, nodeRadius + 5, 0xffffff, 0.3);
                    this.mapContainer.add(highlight);
                }

                // Add event handlers
                nodeSprite.on('pointerover', () => {
                    this.showNodeInfo(node);
                    nodeSprite.setScale(1.2);
                });

                nodeSprite.on('pointerout', () => {
                    if (this.selectedNode !== node.id) {
                        this.infoPanel.setVisible(false);
                    }
                    nodeSprite.setScale(1.0);
                });

                nodeSprite.on('pointerdown', () => {
                    this.selectNode(node.id);
                });
            } else {
                // Dim inaccessible nodes
                nodeSprite.setAlpha(0.5);
                label.setAlpha(0.5);
            }

            // Store reference to node sprite
            this.nodeSprites[node.id] = nodeSprite;
        }
    }

    drawPaths(offsetX, offsetY, horizontalSpacing, verticalSpacing) {
        // Draw each path individually for better control
        for (const path of this.sectorMap.paths) {
            // Find source and target nodes
            const sourceNode = this.sectorMap.nodes.find(n => n.id === path.source);
            const targetNode = this.sectorMap.nodes.find(n => n.id === path.target);

            if (sourceNode && targetNode) {
                // Calculate positions
                const x1 = offsetX + sourceNode.x * horizontalSpacing;
                const y1 = offsetY + sourceNode.y * verticalSpacing;
                const x2 = offsetX + targetNode.x * horizontalSpacing;
                const y2 = offsetY + targetNode.y * verticalSpacing;

                // Create path graphics
                const pathGraphics = this.add.graphics();

                // Check if this path is from current node
                const isFromCurrent = sourceNode.id === this.currentNodeId;

                // Style based on path properties
                if (isFromCurrent) {
                    // Use the path's difficulty color if available
                    const pathColor = path.color || 0x33aaff;
                    pathGraphics.lineStyle(3, pathColor, 0.8);

                    // Add a glow effect for harder paths
                    if (path.difficulty === 'HARD' || path.difficulty === 'EXTREME') {
                        const glowGraphics = this.add.graphics();
                        glowGraphics.lineStyle(6, pathColor, 0.3);
                        glowGraphics.beginPath();
                        glowGraphics.moveTo(x1, y1);
                        glowGraphics.lineTo(x2, y2);
                        glowGraphics.strokePath();
                        this.mapContainer.add(glowGraphics);
                    }

                    // Add difficulty indicator
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;

                    // Create a small icon to indicate difficulty
                    let difficultyIcon;
                    let difficultyText;

                    switch (path.difficulty) {
                        case 'EASY':
                            difficultyIcon = this.add.circle(midX, midY, 5, 0x33cc33, 0.8);
                            difficultyText = 'EASY';
                            break;
                        case 'NORMAL':
                            difficultyIcon = this.add.circle(midX, midY, 5, 0x3399ff, 0.8);
                            difficultyText = 'NORMAL';
                            break;
                        case 'HARD':
                            difficultyIcon = this.add.circle(midX, midY, 5, 0xff9933, 0.8);
                            difficultyText = 'HARD';
                            break;
                        case 'EXTREME':
                            difficultyIcon = this.add.circle(midX, midY, 5, 0xff3333, 0.8);
                            difficultyText = 'EXTREME';
                            break;
                    }

                    // Add tooltip on hover
                    if (difficultyIcon) {
                        // Add a pulsing animation to the difficulty icon
                        this.tweens.add({
                            targets: difficultyIcon,
                            alpha: { from: 0.7, to: 1 },
                            scale: { from: 1, to: 1.3 },
                            duration: 800,
                            yoyo: true,
                            repeat: -1
                        });

                        // Make icon interactive
                        difficultyIcon.setInteractive({ useHandCursor: true });

                        // Create tooltip (initially hidden)
                        const rewardMultiplier = path.rewardMultiplier || 1.0;
                        const tooltipText = `${difficultyText}\nRewards: ${Math.round(rewardMultiplier * 100)}%`;
                        const tooltip = this.add.text(midX, midY - 20, tooltipText, {
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#ffffff',
                            align: 'center',
                            backgroundColor: '#000000',
                            padding: { x: 5, y: 3 }
                        }).setOrigin(0.5).setAlpha(0);

                        // Show tooltip on hover
                        difficultyIcon.on('pointerover', () => {
                            tooltip.setAlpha(1);
                        });

                        difficultyIcon.on('pointerout', () => {
                            tooltip.setAlpha(0);
                        });

                        this.mapContainer.add(difficultyIcon);
                        this.mapContainer.add(tooltip);
                    }
                } else {
                    // Non-current paths are dimmed
                    pathGraphics.lineStyle(2, 0x666666, 0.5);
                }

                // Draw the path
                pathGraphics.beginPath();
                pathGraphics.moveTo(x1, y1);
                pathGraphics.lineTo(x2, y2);
                pathGraphics.strokePath();

                // Add to container
                this.mapContainer.add(pathGraphics);
            }
        }
    }

    getNodeLabel(node) {
        switch (node.type) {
            case 'START':
                return 'S';
            case 'BOSS':
                return 'B';
            case 'COMBAT':
                return 'C';
            case 'ELITE':
                return 'E';
            case 'HAZARD':
                return 'H';
            case 'MERCHANT':
                return 'M';
            case 'EVENT':
                return '?';
            default:
                return '';
        }
    }

    isNodeConnectedToCurrent(nodeId) {
        // Find current node
        const currentNode = this.sectorMap.nodes.find(n => n.id === this.currentNodeId);

        if (!currentNode) return false;

        // Check if target node is connected to current node
        return currentNode.connections.includes(nodeId);
    }

    showNodeInfo(node) {
        // Show info panel
        this.infoPanel.setVisible(true);

        // Update info panel content
        this.infoPanelTitle.setText(`NODE ${node.id}`);
        this.infoPanelType.setText(`Type: ${node.type}`);

        // Set description based on node type
        let description = '';

        switch (node.type) {
            case 'START':
                description = 'Your starting position in this sector.';
                break;
            case 'BOSS':
                description = 'A powerful enemy guards the exit to the next sector.';
                break;
            case 'COMBAT':
                description = 'Standard combat encounter with enemy ships.';
                break;
            case 'ELITE':
                description = 'Difficult combat with elite enemy ships. Higher rewards.';
                break;
            case 'HAZARD':
                description = 'Navigate through hazardous space with environmental dangers.';
                break;
            case 'MERCHANT':
                description = 'A trading post where you can purchase upgrades.';
                break;
            case 'EVENT':
                description = 'An unknown encounter that could be beneficial or dangerous.';
                break;
            default:
                description = 'No information available.';
        }

        // Add reward multiplier information if available
        if (node.rewardMultiplier && node.rewardMultiplier !== 1.0) {
            const rewardPercentage = Math.round(node.rewardMultiplier * 100);
            const rewardText = rewardPercentage > 100 ?
                `Enhanced Rewards: ${rewardPercentage}%` :
                `Reduced Rewards: ${rewardPercentage}%`;

            description += `\n\n${rewardText}`;

            // Add difficulty information if available
            if (node.incomingPaths && node.incomingPaths.length > 0) {
                // Find the path from current node if it exists
                const pathFromCurrent = node.incomingPaths.find(p => p.sourceId === this.currentNodeId);

                if (pathFromCurrent) {
                    description += `\nPath Difficulty: ${pathFromCurrent.difficulty}`;
                }
            }
        }

        this.infoPanelDesc.setText(description);

        // Enable/disable travel button based on connectivity
        const isConnected = this.isNodeConnectedToCurrent(node.id);
        const isCurrentNode = (node.id === this.currentNodeId);

        this.travelButton.setVisible(isConnected && !isCurrentNode);

        // If this is a connected node, show a difficulty indicator on the travel button
        if (isConnected && !isCurrentNode) {
            // Find the path from current node
            const path = this.sectorMap.paths.find(p =>
                p.source === this.currentNodeId && p.target === node.id);

            if (path && path.difficulty) {
                // Update travel button text with difficulty
                this.travelButton.setText(`TRAVEL (${path.difficulty})`);

                // Set button color based on difficulty
                let buttonColor;
                switch (path.difficulty) {
                    case 'EASY': buttonColor = 0x33cc33; break;
                    case 'NORMAL': buttonColor = 0x3399ff; break;
                    case 'HARD': buttonColor = 0xff9933; break;
                    case 'EXTREME': buttonColor = 0xff3333; break;
                    default: buttonColor = 0x3399ff;
                }

                // Update button style
                this.travelButton.setStyle({ backgroundColor: '#' + buttonColor.toString(16) });
            } else {
                this.travelButton.setText('TRAVEL');
            }
        }

        // Store selected node
        this.selectedNode = node.id;
    }

    selectNode(nodeId) {
        // Show node info
        const node = this.sectorMap.nodes.find(n => n.id === nodeId);

        if (node) {
            this.showNodeInfo(node);
        }
    }

    travelToSelectedNode() {
        if (this.selectedNode !== undefined) {
            // Update current node
            this.currentNodeId = this.selectedNode;
            this.game.global.currentRun.currentNodeId = this.selectedNode;

            // Get node details
            const node = this.sectorMap.nodes.find(n => n.id === this.selectedNode);

            if (node) {
                // Determine which scene to start based on node type
                let nextScene = CONSTANTS.SCENES.GAME;

                switch (node.type) {
                    case 'BOSS':
                        // Boss encounter
                        nextScene = CONSTANTS.SCENES.GAME;

                        // Show boss warning
                        this.showBossWarning();
                        break;
                    case 'MERCHANT':
                        // Merchant encounter
                        nextScene = CONSTANTS.SCENES.UPGRADE;
                        break;
                    case 'EVENT':
                        // Event encounter
                        nextScene = CONSTANTS.SCENES.UPGRADE;
                        break;
                    default:
                        // Combat encounter
                        nextScene = CONSTANTS.SCENES.GAME;
                }

                // Store node type in registry for other scenes to access
                this.registry.set('nodeType', node.type);

                // Get the reward multiplier for this node
                const rewardMultiplier = node.rewardMultiplier || 1.0;

                // Store reward multiplier in registry
                this.registry.set('rewardMultiplier', rewardMultiplier);

                // Find the path that was taken
                const path = this.sectorMap.paths.find(p =>
                    p.source === this.game.global.currentRun.currentNodeId &&
                    p.target === node.id
                );

                // Store path difficulty in registry if available
                if (path && path.difficulty) {
                    this.registry.set('pathDifficulty', path.difficulty);
                }

                // Start the appropriate scene
                this.scene.start(nextScene, {
                    sector: this.currentSector,
                    score: this.score,
                    nodeType: node.type,
                    nodeId: node.id,
                    rewardMultiplier: rewardMultiplier,
                    pathDifficulty: path ? path.difficulty : 'NORMAL'
                });
            }
        }
    }

    setupEvents() {
        // Add keyboard controls
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });
    }

    /**
     * Show a warning when selecting a boss node
     */
    showBossWarning() {
        // Create a warning overlay
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.7
        ).setOrigin(0).setScrollFactor(0).setDepth(1000);

        // Create warning text
        const warningText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'WARNING!\nBOSS ENCOUNTER AHEAD',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ff0000',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

        // Create boss name based on sector
        let bossName = "UNKNOWN ENTITY";
        switch (this.currentSector % 5) {
            case 1:
                bossName = "THE GUARDIAN";
                break;
            case 2:
                bossName = "THE CARRIER";
                break;
            case 3:
                bossName = "DESTROYER PRIME";
                break;
            case 4:
                bossName = "THE DREADNOUGHT";
                break;
            case 0: // Every 5th sector
                bossName = "THE NEMESIS";
                break;
        }

        // Add boss name text
        const bossNameText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 30,
            bossName,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffff00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

        // Add continue prompt
        const continueText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Press SPACE to continue',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

        // Make continue text blink
        this.tweens.add({
            targets: continueText,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Wait for space key to continue
        const spaceKey = this.input.keyboard.addKey('SPACE');
        spaceKey.once('down', () => {
            // Clean up
            overlay.destroy();
            warningText.destroy();
            bossNameText.destroy();
            continueText.destroy();

            // Get node details
            const node = this.sectorMap.nodes.find(n => n.id === this.selectedNode);

            // Get the reward multiplier for this node
            const rewardMultiplier = node && node.rewardMultiplier ? node.rewardMultiplier : 1.0;

            // Continue to game scene
            this.scene.start(CONSTANTS.SCENES.GAME, {
                sector: this.currentSector,
                score: this.score,
                nodeType: 'BOSS',
                nodeId: this.selectedNode,
                rewardMultiplier: rewardMultiplier,
                pathDifficulty: 'BOSS'
            });
        });
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.SectorMapScene = SectorMapScene;
}
