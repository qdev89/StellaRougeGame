/**
 * Subsystem Grid Scene
 * Displays and manages the 3x3 grid of ship subsystems that create synergy effects
 */
class SubsystemGridScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.SUBSYSTEM_GRID });
    }

    init(data) {
        // Get data from previous scene or global state
        this.currentSector = data.sector || this.registry.get('currentSector') || 1;
        this.score = data.score || this.registry.get('score') || 0;

        // Get ship data from global state
        const currentRun = this.game.global.currentRun || {};
        this.shipType = currentRun.shipType || 'fighter';
        this.upgrades = currentRun.upgrades || [];

        // Get subsystem grid from global state or initialize if not exists
        this.subsystemGrid = currentRun.subsystemGrid || this.initializeEmptyGrid();

        // Get previous scene to return to
        this.previousScene = data.previousScene || CONSTANTS.SCENES.SHIP_STATUS;
    }

    create() {
        console.log('SubsystemGridScene: Displaying subsystem grid');

        // Create background
        this.createBackground();

        // Create UI elements
        this.createUI();

        // Create the 3x3 grid
        this.createSubsystemGrid();

        // Display available upgrades
        this.displayAvailableUpgrades();

        // Set up event handlers
        this.setupEvents();
    }

    createBackground() {
        // Create a dark background with grid pattern (similar to other scenes)
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000022, 0.9)
            .setOrigin(0, 0);

        // Add grid lines
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x333366, 0.3);

        // Draw horizontal grid lines
        for (let y = 0; y < this.cameras.main.height; y += 50) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(this.cameras.main.width, y);
            gridGraphics.strokePath();
        }

        // Draw vertical grid lines
        for (let x = 0; x < this.cameras.main.width; x += 50) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, this.cameras.main.height);
            gridGraphics.strokePath();
        }
    }

    createUI() {
        // Title text
        this.add.text(
            this.cameras.main.width / 2,
            30,
            'SUBSYSTEM SYNERGY GRID',
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Subtitle text
        this.add.text(
            this.cameras.main.width / 2,
            70,
            'Place compatible upgrades in adjacent slots to create powerful synergies',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
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
            this.saveGridState();
            this.returnToPreviousScene();
        });

        // Help button
        const helpButton = this.add.text(
            this.cameras.main.width - 50,
            this.cameras.main.height - 50,
            'HELP',
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

        helpButton.on('pointerdown', () => {
            this.showHelpOverlay();
        });
    }

    createSubsystemGrid() {
        // Grid container
        this.gridContainer = this.add.container(
            this.cameras.main.width / 2,
            250
        );

        // Grid cells (3x3)
        this.gridCells = [];
        const cellSize = 80;
        const padding = 10;
        const totalWidth = (cellSize * 3) + (padding * 2);
        const startX = -totalWidth / 2 + cellSize / 2;
        const startY = -totalWidth / 2 + cellSize / 2;

        // Create grid cells
        for (let row = 0; row < 3; row++) {
            this.gridCells[row] = [];
            for (let col = 0; col < 3; col++) {
                // Calculate position
                const x = startX + (col * (cellSize + padding));
                const y = startY + (row * (cellSize + padding));

                // Create cell background
                const cell = this.add.rectangle(
                    x,
                    y,
                    cellSize,
                    cellSize,
                    0x333366,
                    0.8
                ).setStrokeStyle(2, 0x6666cc);

                // Make cell interactive
                cell.setInteractive({ useHandCursor: true, dropZone: true });

                // Add cell to container
                this.gridContainer.add(cell);

                // Store cell reference
                this.gridCells[row][col] = {
                    cell: cell,
                    x: x,
                    y: y,
                    width: cellSize,
                    height: cellSize,
                    upgrade: null
                };

                // Add subsystem label based on position
                const subsystemType = this.getSubsystemTypeForPosition(row, col);
                const subsystemLabel = this.add.text(
                    x,
                    y + (cellSize / 2) - 10,
                    subsystemType.toUpperCase(),
                    {
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: '#aaaaff',
                        align: 'center'
                    }
                ).setOrigin(0.5);

                this.gridContainer.add(subsystemLabel);

                // Add upgrade from grid state if exists
                if (this.subsystemGrid[row][col]) {
                    this.placeUpgradeInCell(this.subsystemGrid[row][col], row, col);
                }
            }
        }

        // Add grid border
        const gridBorder = this.add.rectangle(
            0,
            0,
            totalWidth + 10,
            totalWidth + 10,
            0x000000,
            0
        ).setStrokeStyle(3, 0x6666cc);

        this.gridContainer.add(gridBorder);

        // Add synergy indicators
        this.createSynergyIndicators();
    }

    displayAvailableUpgrades() {
        // Create upgrades panel
        const upgradesPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            550,
            600,
            200,
            0x222244,
            0.8
        ).setStrokeStyle(2, 0x6666cc);

        // Upgrades title
        this.add.text(
            this.cameras.main.width / 2,
            450,
            'AVAILABLE UPGRADES',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#66ff66',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Create scrollable container for upgrades
        const upgradesContainer = this.add.container(
            this.cameras.main.width / 2 - 280,
            480
        );

        // Get available upgrades
        const availableUpgrades = this.getAvailableUpgrades();

        // Display upgrades
        if (availableUpgrades.length === 0) {
            // No upgrades available
            this.add.text(
                this.cameras.main.width / 2,
                550,
                'No upgrades available.\nDefeat bosses and complete sectors to earn upgrades.',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#aaaaaa',
                    align: 'center'
                }
            ).setOrigin(0.5);
        } else {
            // Create upgrade items
            availableUpgrades.forEach((upgrade, index) => {
                // Calculate position
                const itemWidth = 120;
                const itemHeight = 150;
                const itemsPerRow = 4;
                const row = Math.floor(index / itemsPerRow);
                const col = index % itemsPerRow;
                const x = col * (itemWidth + 20);
                const y = row * (itemHeight + 20);

                // Create upgrade item container
                const itemContainer = this.add.container(x, y);

                // Create item background
                const itemBg = this.add.rectangle(
                    0,
                    0,
                    itemWidth,
                    itemHeight,
                    0x334466,
                    0.7
                ).setStrokeStyle(2, 0x6666cc);

                // Make item draggable
                itemBg.setInteractive({ useHandCursor: true, draggable: true });

                // Store upgrade data with the item
                itemBg.upgrade = upgrade;

                // Upgrade icon (placeholder)
                const icon = this.add.rectangle(
                    0,
                    -40,
                    50,
                    50,
                    this.getColorForUpgradeType(upgrade.type),
                    1
                );

                // Upgrade name
                const nameText = this.add.text(
                    0,
                    0,
                    upgrade.name,
                    {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#ffffff',
                        align: 'center'
                    }
                ).setOrigin(0.5);

                // Upgrade type
                const typeText = this.add.text(
                    0,
                    20,
                    upgrade.type.toUpperCase(),
                    {
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: '#aaaaff',
                        align: 'center'
                    }
                ).setOrigin(0.5);

                // Add elements to container
                itemContainer.add([itemBg, icon, nameText, typeText]);

                // Add container to upgrades container
                upgradesContainer.add(itemContainer);

                // Setup drag events
                this.setupDragEvents(itemBg, upgrade);
            });
        }
    }

    setupDragEvents(item, upgrade) {
        // Setup drag events
        this.input.setDraggable(item);

        // On drag start
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setTint(0x66ff66);
            this.children.bringToTop(gameObject);

            // Create drag preview
            this.createDragPreview(gameObject, pointer);
        });

        // On drag
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            // Update drag preview position
            if (this.dragPreview) {
                this.dragPreview.x = pointer.x;
                this.dragPreview.y = pointer.y;
            }
        });

        // On drag end
        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.clearTint();

            // Remove drag preview
            if (this.dragPreview) {
                this.dragPreview.destroy();
                this.dragPreview = null;
            }
        });

        // On drop
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            // Find which cell was dropped on
            const cell = this.findCellFromDropZone(dropZone);

            if (cell) {
                // Check if upgrade can be placed in this cell
                const canPlace = this.canPlaceUpgradeInCell(gameObject.upgrade, cell.row, cell.col);

                if (canPlace) {
                    // Place upgrade in cell
                    this.placeUpgradeInCell(gameObject.upgrade, cell.row, cell.col);

                    // Update grid state
                    this.subsystemGrid[cell.row][cell.col] = gameObject.upgrade;

                    // Check for synergies
                    this.checkForSynergies();
                } else {
                    // Show error feedback
                    this.showPlacementError(cell.row, cell.col);
                }
            }
        });
    }

    createDragPreview(gameObject, pointer) {
        // Create a preview of the dragged item
        this.dragPreview = this.add.rectangle(
            pointer.x,
            pointer.y,
            50,
            50,
            this.getColorForUpgradeType(gameObject.upgrade.type),
            0.8
        ).setStrokeStyle(2, 0xffffff);

        // Add name text
        const nameText = this.add.text(
            pointer.x,
            pointer.y,
            gameObject.upgrade.name,
            {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: {
                    x: 5,
                    y: 2
                }
            }
        ).setOrigin(0.5);

        // Add to preview container
        this.dragPreview.add(nameText);
    }

    findCellFromDropZone(dropZone) {
        // Find which cell corresponds to the drop zone
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.gridCells[row][col].cell === dropZone) {
                    return {
                        row: row,
                        col: col,
                        ...this.gridCells[row][col]
                    };
                }
            }
        }

        return null;
    }

    canPlaceUpgradeInCell(upgrade, row, col) {
        // Check if cell is empty
        if (this.subsystemGrid[row][col]) {
            return false;
        }

        // Check if upgrade type is compatible with subsystem type
        const subsystemType = this.getSubsystemTypeForPosition(row, col);
        return this.isUpgradeCompatibleWithSubsystem(upgrade, subsystemType);
    }

    placeUpgradeInCell(upgrade, row, col) {
        // Create upgrade visual in the cell
        const cell = this.gridCells[row][col];

        // Create upgrade visual
        const upgradeVisual = this.add.rectangle(
            cell.x,
            cell.y,
            cell.width * 0.8,
            cell.height * 0.8,
            this.getColorForUpgradeType(upgrade.type),
            0.9
        ).setStrokeStyle(2, 0xffffff);

        // Add upgrade name
        const nameText = this.add.text(
            cell.x,
            cell.y,
            upgrade.name,
            {
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Make upgrade removable
        upgradeVisual.setInteractive({ useHandCursor: true });
        upgradeVisual.on('pointerdown', () => {
            this.removeUpgradeFromCell(row, col);
        });

        // Add to grid container
        this.gridContainer.add(upgradeVisual);
        this.gridContainer.add(nameText);

        // Store references
        cell.upgradeVisual = upgradeVisual;
        cell.nameText = nameText;
        cell.upgrade = upgrade;
    }

    removeUpgradeFromCell(row, col) {
        // Remove upgrade from cell
        const cell = this.gridCells[row][col];

        // Remove visual elements
        if (cell.upgradeVisual) {
            cell.upgradeVisual.destroy();
            cell.upgradeVisual = null;
        }

        if (cell.nameText) {
            cell.nameText.destroy();
            cell.nameText = null;
        }

        // Clear upgrade data
        cell.upgrade = null;
        this.subsystemGrid[row][col] = null;

        // Check for synergies
        this.checkForSynergies();
    }

    showPlacementError(row, col) {
        // Show error feedback when placement is invalid
        const cell = this.gridCells[row][col];

        // Flash the cell red
        this.tweens.add({
            targets: cell.cell,
            fillColor: 0x993333,
            duration: 200,
            yoyo: true,
            repeat: 1
        });
    }

    createSynergyIndicators() {
        // Create indicators for active synergies
        this.synergyIndicators = [];

        // Horizontal synergy indicators
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
                const x1 = this.gridCells[row][col].x;
                const y1 = this.gridCells[row][col].y;
                const x2 = this.gridCells[row][col + 1].x;
                const y2 = this.gridCells[row][col + 1].y;

                const indicator = this.add.line(
                    0, 0,
                    x1, y1,
                    x2, y2,
                    0x66ff66, 0
                ).setLineWidth(3);

                this.gridContainer.add(indicator);

                this.synergyIndicators.push({
                    indicator: indicator,
                    cells: [
                        { row: row, col: col },
                        { row: row, col: col + 1 }
                    ]
                });
            }
        }

        // Vertical synergy indicators
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const x1 = this.gridCells[row][col].x;
                const y1 = this.gridCells[row][col].y;
                const x2 = this.gridCells[row + 1][col].x;
                const y2 = this.gridCells[row + 1][col].y;

                const indicator = this.add.line(
                    0, 0,
                    x1, y1,
                    x2, y2,
                    0x66ff66, 0
                ).setLineWidth(3);

                this.gridContainer.add(indicator);

                this.synergyIndicators.push({
                    indicator: indicator,
                    cells: [
                        { row: row, col: col },
                        { row: row + 1, col: col }
                    ]
                });
            }
        }
    }

    checkForSynergies() {
        // Create synergy system if it doesn't exist
        if (!this.synergySystem) {
            this.synergySystem = new SynergySystem(this);
        }

        // Check for synergies between adjacent upgrades
        this.synergyIndicators.forEach(indicator => {
            const cell1 = indicator.cells[0];
            const cell2 = indicator.cells[1];

            const upgrade1 = this.subsystemGrid[cell1.row][cell1.col];
            const upgrade2 = this.subsystemGrid[cell2.row][cell2.col];

            // Check if both cells have upgrades and they create a synergy
            if (upgrade1 && upgrade2) {
                const synergy = this.synergySystem.checkSynergy(upgrade1, upgrade2);
                if (synergy) {
                    // Show synergy indicator
                    indicator.indicator.setAlpha(1);

                    // Display synergy name on hover
                    indicator.indicator.setInteractive({ useHandCursor: true });
                    indicator.indicator.on('pointerover', () => {
                        this.showSynergyTooltip(synergy, indicator.indicator.x, indicator.indicator.y);
                    });
                    indicator.indicator.on('pointerout', () => {
                        this.hideSynergyTooltip();
                    });
                } else {
                    // Hide synergy indicator
                    indicator.indicator.setAlpha(0);
                }
            } else {
                // Hide synergy indicator
                indicator.indicator.setAlpha(0);
            }
        });
    }

    showSynergyTooltip(synergy, x, y) {
        // Remove existing tooltip if any
        this.hideSynergyTooltip();

        // Create tooltip background
        const tooltipBg = this.add.rectangle(
            x,
            y,
            250,
            100,
            0x224466,
            0.9
        ).setOrigin(0.5).setDepth(100);

        // Add title
        const tooltipTitle = this.add.text(
            x,
            y - 30,
            synergy.name,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#66ff66',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(101);

        // Add description
        const tooltipDesc = this.add.text(
            x,
            y + 5,
            synergy.description,
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: 230 }
            }
        ).setOrigin(0.5, 0).setDepth(101);

        // Adjust tooltip height based on text height
        tooltipBg.height = Math.max(100, tooltipDesc.height + 60);

        // Store tooltip elements
        this.synergyTooltip = {
            bg: tooltipBg,
            title: tooltipTitle,
            desc: tooltipDesc
        };
    }

    hideSynergyTooltip() {
        if (this.synergyTooltip) {
            this.synergyTooltip.bg.destroy();
            this.synergyTooltip.title.destroy();
            this.synergyTooltip.desc.destroy();
            this.synergyTooltip = null;
        }
    }

    getSubsystemTypeForPosition(row, col) {
        // Define subsystem types for each position in the grid
        const subsystemTypes = [
            ['weapon', 'shield', 'sensor'],
            ['engine', 'reactor', 'computer'],
            ['hull', 'power', 'cooling']
        ];

        return subsystemTypes[row][col];
    }

    isUpgradeCompatibleWithSubsystem(upgrade, subsystemType) {
        // Check if an upgrade is compatible with a subsystem type
        // For now, simple check: upgrade type matches subsystem type
        return upgrade.type === subsystemType;
    }

    getColorForUpgradeType(type) {
        // Return color based on upgrade type
        const colors = {
            'weapon': 0xff6666,
            'shield': 0x66ccff,
            'sensor': 0xffcc66,
            'engine': 0x66ff66,
            'reactor': 0xcc66ff,
            'computer': 0x66ffcc,
            'hull': 0xcccccc,
            'power': 0xffff66,
            'cooling': 0x6666ff
        };

        return colors[type] || 0xffffff;
    }

    getAvailableUpgrades() {
        // Get available upgrades from player's inventory
        // For testing, return some sample upgrades
        return [
            {
                id: 'advanced_laser',
                name: 'Advanced Laser',
                type: 'weapon',
                description: 'Increases weapon damage by 25%',
                value: 25
            },
            {
                id: 'shield_amplifier',
                name: 'Shield Amplifier',
                type: 'shield',
                description: 'Increases shield capacity by 30%',
                value: 30
            },
            {
                id: 'targeting_system',
                name: 'Targeting System',
                type: 'sensor',
                description: 'Increases accuracy by 20%',
                value: 20
            },
            {
                id: 'ion_thrusters',
                name: 'Ion Thrusters',
                type: 'engine',
                description: 'Increases ship speed by 15%',
                value: 15
            },
            {
                id: 'fusion_core',
                name: 'Fusion Core',
                type: 'reactor',
                description: 'Increases energy output by 25%',
                value: 25
            },
            {
                id: 'quantum_processor',
                name: 'Quantum Processor',
                type: 'computer',
                description: 'Reduces ability cooldowns by 20%',
                value: 20
            },
            {
                id: 'reinforced_plating',
                name: 'Reinforced Plating',
                type: 'hull',
                description: 'Increases hull integrity by 30%',
                value: 30
            },
            {
                id: 'power_amplifier',
                name: 'Power Amplifier',
                type: 'power',
                description: 'Increases all damage output by 15%',
                value: 15
            },
            {
                id: 'heat_sink',
                name: 'Heat Sink',
                type: 'cooling',
                description: 'Reduces weapon heat generation by 25%',
                value: 25
            }
        ];
    }

    initializeEmptyGrid() {
        // Create an empty 3x3 grid
        const grid = [];
        for (let row = 0; row < 3; row++) {
            grid[row] = [];
            for (let col = 0; col < 3; col++) {
                grid[row][col] = null;
            }
        }
        return grid;
    }

    saveGridState() {
        // Save the current grid state to the global game state
        if (this.game.global.currentRun) {
            this.game.global.currentRun.subsystemGrid = this.subsystemGrid;
            console.log('Subsystem grid state saved');
        }
    }

    showHelpOverlay() {
        // Create help overlay
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.8
        ).setOrigin(0).setInteractive();

        // Help title
        const helpTitle = this.add.text(
            this.cameras.main.width / 2,
            100,
            'SUBSYSTEM SYNERGY GRID HELP',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Help content
        const helpContent = this.add.text(
            this.cameras.main.width / 2,
            200,
            'The Subsystem Synergy Grid allows you to place upgrades in a 3x3 grid to create powerful synergies.\n\n' +
            'Each cell in the grid represents a different subsystem of your ship.\n' +
            'Drag upgrades from the available upgrades section to compatible subsystem slots.\n\n' +
            'When compatible upgrades are placed in adjacent slots, they create a synergy that provides additional benefits.\n' +
            'Synergies are indicated by green lines connecting the upgrades.\n\n' +
            'Click on an upgrade in the grid to remove it.\n\n' +
            'Experiment with different combinations to find powerful synergies!',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: 600 }
            }
        ).setOrigin(0.5, 0);

        // Close button
        const closeButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            'CLOSE',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#333333',
                padding: {
                    x: 20,
                    y: 10
                }
            }
        ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => {
            overlay.destroy();
            helpTitle.destroy();
            helpContent.destroy();
            closeButton.destroy();
        });
    }

    setupEvents() {
        // Setup keyboard events
        this.input.keyboard.on('keydown-ESC', () => {
            this.saveGridState();
            this.returnToPreviousScene();
        });
    }

    returnToPreviousScene() {
        this.scene.start(this.previousScene, {
            sector: this.currentSector,
            score: this.score
        });
    }

    update() {
        // Update logic if needed
    }
}
