/**
 * Inventory Scene
 * Displays and manages the player's inventory of items and consumables
 */
class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.INVENTORY });
    }
    
    init(data) {
        // Get data from previous scene or global state
        this.currentSector = data.sector || this.registry.get('currentSector') || 1;
        this.score = data.score || this.registry.get('score') || 0;
        
        // Get inventory from global state
        const currentRun = this.game.global.currentRun || {};
        this.inventory = currentRun.inventory || this.createDefaultInventory();
        
        // Get previous scene to return to
        this.previousScene = data.previousScene || CONSTANTS.SCENES.SECTOR_MAP;
    }
    
    create() {
        console.log('InventoryScene: Displaying inventory');
        
        // Create background
        this.createBackground();
        
        // Create UI elements
        this.createUI();
        
        // Display inventory items
        this.displayInventory();
        
        // Set up event handlers
        this.setupEvents();
    }
    
    createBackground() {
        // Create a dark background with grid pattern
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
            'INVENTORY',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
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
            this.returnToPreviousScene();
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
                previousScene: this.previousScene,
                sector: this.currentSector,
                score: this.score
            });
        });
        
        // Credits display
        this.add.text(
            this.cameras.main.width / 2,
            80,
            `CREDITS: ${this.getCredits()}`,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffff66',
                align: 'center'
            }
        ).setOrigin(0.5);
    }
    
    displayInventory() {
        // Create inventory categories
        const categories = [
            { id: 'consumables', name: 'CONSUMABLES', x: 200, y: 150 },
            { id: 'materials', name: 'MATERIALS', x: 600, y: 150 },
            { id: 'special', name: 'SPECIAL ITEMS', x: 400, y: 350 }
        ];
        
        // Create category panels
        categories.forEach(category => {
            // Create category panel
            const panel = this.add.rectangle(
                category.x,
                category.y + 80,
                350,
                250,
                0x222244,
                0.8
            ).setOrigin(0.5);
            
            // Category title
            this.add.text(
                category.x,
                category.y,
                category.name,
                {
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    color: '#66ccff',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // Get items for this category
            const items = this.inventory[category.id] || [];
            
            if (items.length === 0) {
                this.add.text(
                    category.x,
                    category.y + 80,
                    'No items',
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#aaaaaa',
                        align: 'center'
                    }
                ).setOrigin(0.5);
            } else {
                // Create scrollable container for items
                const itemContainer = this.add.container(category.x - 160, category.y + 20);
                
                items.forEach((item, index) => {
                    // Create item background
                    const itemBg = this.add.rectangle(
                        0,
                        index * 40,
                        320,
                        35,
                        0x334466,
                        0.7
                    ).setOrigin(0, 0);
                    
                    // Item name and quantity
                    const nameText = this.add.text(
                        10,
                        index * 40 + 17,
                        `${item.name} ${item.quantity > 1 ? '(' + item.quantity + ')' : ''}`,
                        {
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            color: '#ffffff',
                            align: 'left'
                        }
                    ).setOrigin(0, 0.5);
                    
                    // Add use button if item is usable
                    if (item.usable) {
                        const useButton = this.add.text(
                            280,
                            index * 40 + 17,
                            'USE',
                            {
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                color: '#66ff66',
                                align: 'center',
                                backgroundColor: '#224422',
                                padding: {
                                    x: 5,
                                    y: 2
                                }
                            }
                        ).setOrigin(0.5)
                        .setInteractive({ useHandCursor: true });
                        
                        useButton.on('pointerdown', () => {
                            this.useItem(category.id, index);
                        });
                        
                        itemContainer.add(useButton);
                    }
                    
                    // Add tooltip on hover
                    itemBg.setInteractive({ useHandCursor: true });
                    
                    itemBg.on('pointerover', () => {
                        this.showTooltip(item.name, item.description);
                        itemBg.setFillStyle(0x446688);
                    });
                    
                    itemBg.on('pointerout', () => {
                        this.hideTooltip();
                        itemBg.setFillStyle(0x334466);
                    });
                    
                    itemContainer.add([itemBg, nameText]);
                });
            }
        });
    }
    
    showTooltip(title, description) {
        // Remove existing tooltip if any
        this.hideTooltip();
        
        // Create tooltip background
        const tooltipBg = this.add.rectangle(
            this.input.x + 10,
            this.input.y + 10,
            300,
            100,
            0x224466,
            0.9
        ).setOrigin(0, 0).setDepth(100);
        
        // Add title
        const tooltipTitle = this.add.text(
            this.input.x + 20,
            this.input.y + 20,
            title,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'left'
            }
        ).setOrigin(0, 0).setDepth(101);
        
        // Add description
        const tooltipDesc = this.add.text(
            this.input.x + 20,
            this.input.y + 45,
            description,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#cccccc',
                align: 'left',
                wordWrap: { width: 280 }
            }
        ).setOrigin(0, 0).setDepth(101);
        
        // Adjust tooltip height based on text height
        tooltipBg.height = Math.max(100, tooltipDesc.height + 60);
        
        // Store tooltip elements
        this.tooltip = {
            bg: tooltipBg,
            title: tooltipTitle,
            desc: tooltipDesc
        };
    }
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.bg.destroy();
            this.tooltip.title.destroy();
            this.tooltip.desc.destroy();
            this.tooltip = null;
        }
    }
    
    setupEvents() {
        // Add keyboard controls
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToPreviousScene();
        });
        
        this.input.keyboard.on('keydown-S', () => {
            this.scene.start(CONSTANTS.SCENES.SHIP_STATUS, {
                previousScene: this.previousScene,
                sector: this.currentSector,
                score: this.score
            });
        });
    }
    
    returnToPreviousScene() {
        this.scene.start(this.previousScene, {
            sector: this.currentSector,
            score: this.score
        });
    }
    
    getCredits() {
        // Get credits from meta-progression
        return this.game.global.metaProgress?.credits || 0;
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
    
    useItem(categoryId, itemIndex) {
        // Get the item
        const item = this.inventory[categoryId][itemIndex];
        
        if (!item || !item.usable || item.quantity <= 0) {
            return;
        }
        
        // Apply item effect
        this.applyItemEffect(item);
        
        // Reduce quantity
        item.quantity--;
        
        // Remove item if quantity is zero
        if (item.quantity <= 0) {
            this.inventory[categoryId].splice(itemIndex, 1);
        }
        
        // Update inventory in global state
        if (this.game.global.currentRun) {
            this.game.global.currentRun.inventory = this.inventory;
        }
        
        // Show feedback
        this.showItemUseFeedback(item);
        
        // Refresh display
        this.scene.restart({
            previousScene: this.previousScene,
            sector: this.currentSector,
            score: this.score
        });
    }
    
    applyItemEffect(item) {
        // Apply effect based on item type
        if (!item.effect) return;
        
        switch (item.effect.type) {
            case 'repair':
                // Repair ship hull
                console.log(`Repairing ship hull by ${item.effect.value * 100}%`);
                // In a real implementation, this would modify the player's health
                break;
                
            case 'boost':
                // Apply temporary stat boost
                console.log(`Boosting ${item.effect.stat} by ${item.effect.value * 100}% for ${item.effect.duration} seconds`);
                // In a real implementation, this would apply a temporary buff
                break;
                
            case 'special':
                // Apply special effect
                console.log(`Using special item effect: ${item.effect.action}`);
                // In a real implementation, this would trigger a special action
                break;
        }
    }
    
    showItemUseFeedback(item) {
        // Create feedback text
        const feedbackText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Used ${item.name}:\n${item.description}`,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 20, y: 20 },
                wordWrap: { width: 400 }
            }
        ).setOrigin(0.5).setDepth(100);
        
        // Fade out after a delay
        this.tweens.add({
            targets: feedbackText,
            alpha: 0,
            y: feedbackText.y - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                feedbackText.destroy();
            }
        });
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.InventoryScene = InventoryScene;
}
