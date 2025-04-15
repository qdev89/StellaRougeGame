/**
 * Ship Status Scene
 * Displays detailed information about the player's ship, upgrades, and penalties
 */
class ShipStatusScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.SHIP_STATUS });
    }
    
    init(data) {
        // Get data from previous scene or global state
        this.currentSector = data.sector || this.registry.get('currentSector') || 1;
        this.score = data.score || this.registry.get('score') || 0;
        
        // Get ship data from global state
        const currentRun = this.game.global.currentRun || {};
        this.shipType = currentRun.shipType || 'fighter';
        this.upgrades = currentRun.upgrades || [];
        this.penalties = currentRun.penalties || [];
        
        // Get player build from choice system if available
        if (this.game.global.choiceSystem) {
            this.playerBuild = this.game.global.choiceSystem.playerBuild;
        } else {
            // Create default player build
            this.playerBuild = {
                activeUpgrades: [],
                activePenalties: []
            };
        }
        
        // Get previous scene to return to
        this.previousScene = data.previousScene || CONSTANTS.SCENES.SECTOR_MAP;
    }
    
    create() {
        console.log('ShipStatusScene: Displaying ship status');
        
        // Create background
        this.createBackground();
        
        // Create UI elements
        this.createUI();
        
        // Display ship information
        this.displayShipInfo();
        
        // Display upgrades
        this.displayUpgrades();
        
        // Display penalties
        this.displayPenalties();
        
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
            'SHIP STATUS',
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
        
        // Inventory button
        const inventoryButton = this.add.text(
            this.cameras.main.width - 50,
            this.cameras.main.height - 50,
            'INVENTORY',
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
        
        inventoryButton.on('pointerdown', () => {
            this.scene.start(CONSTANTS.SCENES.INVENTORY, {
                previousScene: CONSTANTS.SCENES.SHIP_STATUS,
                sector: this.currentSector,
                score: this.score
            });
        });
    }
    
    displayShipInfo() {
        // Create ship stats panel
        const statsPanel = this.add.rectangle(
            200,
            200,
            350,
            300,
            0x222244,
            0.8
        ).setOrigin(0.5);
        
        // Ship name and type
        this.add.text(
            200,
            80,
            this.getShipName(),
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Ship image
        const shipImage = this.add.rectangle(
            200,
            150,
            100,
            60,
            0x3366cc
        ).setOrigin(0.5);
        
        // Add ship stats
        const stats = this.getShipStats();
        const statLabels = [
            { key: 'health', label: 'Hull Integrity' },
            { key: 'shield', label: 'Shield Capacity' },
            { key: 'speed', label: 'Engine Power' },
            { key: 'fireRate', label: 'Weapon Systems' },
            { key: 'damage', label: 'Weapon Damage' }
        ];
        
        let yPos = 200;
        statLabels.forEach(stat => {
            // Stat label
            this.add.text(
                80,
                yPos,
                stat.label + ':',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#aaaaff',
                    align: 'left'
                }
            ).setOrigin(0, 0.5);
            
            // Stat value
            const value = stats[stat.key];
            const baseValue = this.getBaseStatValue(stat.key);
            const modifier = value - baseValue;
            
            let valueText = value.toString();
            let valueColor = '#ffffff';
            
            if (modifier > 0) {
                valueText += ` (+${modifier})`;
                valueColor = '#66ff66';
            } else if (modifier < 0) {
                valueText += ` (${modifier})`;
                valueColor = '#ff6666';
            }
            
            this.add.text(
                320,
                yPos,
                valueText,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: valueColor,
                    align: 'right'
                }
            ).setOrigin(1, 0.5);
            
            yPos += 30;
        });
        
        // Add weapon info
        this.add.text(
            200,
            350,
            'Primary Weapon: ' + this.getPrimaryWeaponName(),
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffcc66',
                align: 'center'
            }
        ).setOrigin(0.5);
    }
    
    displayUpgrades() {
        // Create upgrades panel
        const upgradesPanel = this.add.rectangle(
            600,
            180,
            350,
            250,
            0x222244,
            0.8
        ).setOrigin(0.5);
        
        // Upgrades title
        this.add.text(
            600,
            80,
            'ACTIVE UPGRADES',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#66ff66',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // List upgrades
        const activeUpgrades = this.playerBuild.activeUpgrades || [];
        
        if (activeUpgrades.length === 0) {
            this.add.text(
                600,
                180,
                'No active upgrades',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#aaaaaa',
                    align: 'center'
                }
            ).setOrigin(0.5);
        } else {
            const upgradeContainer = this.add.container(425, 110);
            
            activeUpgrades.forEach((upgrade, index) => {
                // Create upgrade item
                const itemBg = this.add.rectangle(
                    0,
                    index * 40,
                    350,
                    35,
                    0x334466,
                    0.7
                ).setOrigin(0, 0);
                
                // Upgrade name
                const nameText = this.add.text(
                    10,
                    index * 40 + 17,
                    upgrade.name,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff',
                        align: 'left'
                    }
                ).setOrigin(0, 0.5);
                
                // Add tooltip on hover
                itemBg.setInteractive({ useHandCursor: true });
                
                itemBg.on('pointerover', () => {
                    this.showTooltip(upgrade.name, upgrade.description, 'upgrade');
                    itemBg.setFillStyle(0x446688);
                });
                
                itemBg.on('pointerout', () => {
                    this.hideTooltip();
                    itemBg.setFillStyle(0x334466);
                });
                
                upgradeContainer.add([itemBg, nameText]);
            });
        }
    }
    
    displayPenalties() {
        // Create penalties panel
        const penaltiesPanel = this.add.rectangle(
            600,
            450,
            350,
            250,
            0x222244,
            0.8
        ).setOrigin(0.5);
        
        // Penalties title
        this.add.text(
            600,
            350,
            'ACTIVE PENALTIES',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ff6666',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // List penalties
        const activePenalties = this.playerBuild.activePenalties || [];
        
        if (activePenalties.length === 0) {
            this.add.text(
                600,
                450,
                'No active penalties',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#aaaaaa',
                    align: 'center'
                }
            ).setOrigin(0.5);
        } else {
            const penaltyContainer = this.add.container(425, 380);
            
            activePenalties.forEach((penalty, index) => {
                // Create penalty item
                const itemBg = this.add.rectangle(
                    0,
                    index * 40,
                    350,
                    35,
                    0x663344,
                    0.7
                ).setOrigin(0, 0);
                
                // Penalty name
                const nameText = this.add.text(
                    10,
                    index * 40 + 17,
                    penalty.name,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff',
                        align: 'left'
                    }
                ).setOrigin(0, 0.5);
                
                // Add tooltip on hover
                itemBg.setInteractive({ useHandCursor: true });
                
                itemBg.on('pointerover', () => {
                    this.showTooltip(penalty.name, penalty.description, 'penalty');
                    itemBg.setFillStyle(0x884466);
                });
                
                itemBg.on('pointerout', () => {
                    this.hideTooltip();
                    itemBg.setFillStyle(0x663344);
                });
                
                penaltyContainer.add([itemBg, nameText]);
            });
        }
    }
    
    showTooltip(title, description, type) {
        // Remove existing tooltip if any
        this.hideTooltip();
        
        // Create tooltip background
        const tooltipBg = this.add.rectangle(
            this.input.x + 10,
            this.input.y + 10,
            300,
            100,
            type === 'upgrade' ? 0x224466 : 0x662244,
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
        
        this.input.keyboard.on('keydown-I', () => {
            this.scene.start(CONSTANTS.SCENES.INVENTORY, {
                previousScene: CONSTANTS.SCENES.SHIP_STATUS,
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
    
    getShipName() {
        // Get ship name based on type
        switch (this.shipType) {
            case 'fighter':
                return 'STELLAR FIGHTER';
            case 'interceptor':
                return 'VOID INTERCEPTOR';
            case 'destroyer':
                return 'NOVA DESTROYER';
            default:
                return 'UNKNOWN VESSEL';
        }
    }
    
    getShipStats() {
        // Get base stats for the ship type
        const baseStats = this.getBaseShipStats();
        
        // Apply modifiers from upgrades
        const activeUpgrades = this.playerBuild.activeUpgrades || [];
        activeUpgrades.forEach(upgrade => {
            if (upgrade.type === 'health') {
                baseStats.health += upgrade.value;
            } else if (upgrade.type === 'shield') {
                baseStats.shield += upgrade.value;
            } else if (upgrade.type === 'speed') {
                baseStats.speed += upgrade.value;
            } else if (upgrade.type === 'fireRate') {
                baseStats.fireRate += upgrade.value;
            } else if (upgrade.type === 'damage') {
                baseStats.damage += upgrade.value;
            }
        });
        
        // Apply modifiers from penalties
        const activePenalties = this.playerBuild.activePenalties || [];
        activePenalties.forEach(penalty => {
            if (penalty.type === 'health') {
                baseStats.health -= penalty.value;
            } else if (penalty.type === 'shield') {
                baseStats.shield -= penalty.value;
            } else if (penalty.type === 'speed') {
                baseStats.speed -= penalty.value;
            } else if (penalty.type === 'fireRate') {
                baseStats.fireRate -= penalty.value;
            } else if (penalty.type === 'damage') {
                baseStats.damage -= penalty.value;
            }
        });
        
        // Ensure no stats go below minimum values
        baseStats.health = Math.max(10, baseStats.health);
        baseStats.shield = Math.max(0, baseStats.shield);
        baseStats.speed = Math.max(50, baseStats.speed);
        baseStats.fireRate = Math.max(10, baseStats.fireRate);
        baseStats.damage = Math.max(1, baseStats.damage);
        
        return baseStats;
    }
    
    getBaseShipStats() {
        // Return base stats for the current ship type
        switch (this.shipType) {
            case 'fighter':
                return {
                    health: 100,
                    shield: 50,
                    speed: 300,
                    fireRate: 100,
                    damage: 10
                };
            case 'interceptor':
                return {
                    health: 80,
                    shield: 40,
                    speed: 400,
                    fireRate: 120,
                    damage: 8
                };
            case 'destroyer':
                return {
                    health: 150,
                    shield: 80,
                    speed: 200,
                    fireRate: 80,
                    damage: 15
                };
            default:
                return {
                    health: 100,
                    shield: 50,
                    speed: 300,
                    fireRate: 100,
                    damage: 10
                };
        }
    }
    
    getBaseStatValue(statKey) {
        // Get base value for a specific stat
        const baseStats = this.getBaseShipStats();
        return baseStats[statKey] || 0;
    }
    
    getPrimaryWeaponName() {
        // Find primary weapon from upgrades
        const activeUpgrades = this.playerBuild.activeUpgrades || [];
        const weaponUpgrade = activeUpgrades.find(upgrade => upgrade.type === 'weapon');
        
        if (weaponUpgrade) {
            return weaponUpgrade.name;
        }
        
        // Return default weapon based on ship type
        switch (this.shipType) {
            case 'fighter':
                return 'Standard Laser Cannon';
            case 'interceptor':
                return 'Rapid-Fire Blaster';
            case 'destroyer':
                return 'Heavy Plasma Cannon';
            default:
                return 'Basic Weapon System';
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ShipStatusScene = ShipStatusScene;
}
