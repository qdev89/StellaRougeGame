/**
 * Profile Scene
 * Allows players to manage their save data, view statistics, and adjust settings
 */
class ProfileScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.PROFILE });
    }
    
    init(data) {
        // Get previous scene to return to
        this.previousScene = data.previousScene || CONSTANTS.SCENES.MAIN_MENU;
    }
    
    create() {
        console.log('ProfileScene: Displaying profile management');
        
        // Create save manager if it doesn't exist
        if (!this.game.global.saveManager) {
            this.game.global.saveManager = new SaveManager(this.game);
        }
        
        // Create background
        this.createBackground();
        
        // Create UI elements
        this.createUI();
        
        // Display profile information
        this.displayProfileInfo();
        
        // Display statistics
        this.displayStatistics();
        
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
            'PROFILE MANAGEMENT',
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
        
        // Create tabs
        this.createTabs();
        
        // Create action buttons
        this.createActionButtons();
    }
    
    createTabs() {
        // Tab container
        this.tabContainer = this.add.container(0, 80);
        
        // Tab definitions
        const tabs = [
            { id: 'profile', text: 'PROFILE', x: this.cameras.main.width / 4 },
            { id: 'statistics', text: 'STATISTICS', x: this.cameras.main.width / 2 },
            { id: 'settings', text: 'SETTINGS', x: (this.cameras.main.width / 4) * 3 }
        ];
        
        // Create tabs
        this.tabs = {};
        
        tabs.forEach(tab => {
            // Tab background
            const tabBg = this.add.rectangle(
                tab.x,
                0,
                200,
                40,
                0x333366,
                0.8
            ).setOrigin(0.5, 0);
            
            // Tab text
            const tabText = this.add.text(
                tab.x,
                20,
                tab.text,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // Make tab interactive
            tabBg.setInteractive({ useHandCursor: true });
            
            tabBg.on('pointerdown', () => {
                this.selectTab(tab.id);
            });
            
            // Add to container
            this.tabContainer.add([tabBg, tabText]);
            
            // Store reference
            this.tabs[tab.id] = {
                bg: tabBg,
                text: tabText,
                content: null
            };
        });
        
        // Create content containers for each tab
        this.createTabContents();
        
        // Select default tab
        this.selectTab('profile');
    }
    
    createTabContents() {
        // Profile tab content
        this.tabs.profile.content = this.add.container(0, 130);
        
        // Statistics tab content
        this.tabs.statistics.content = this.add.container(0, 130);
        this.tabs.statistics.content.setVisible(false);
        
        // Settings tab content
        this.tabs.settings.content = this.add.container(0, 130);
        this.tabs.settings.content.setVisible(false);
    }
    
    selectTab(tabId) {
        // Update tab visuals
        for (const [id, tab] of Object.entries(this.tabs)) {
            if (id === tabId) {
                tab.bg.setFillStyle(0x446688);
                tab.content.setVisible(true);
            } else {
                tab.bg.setFillStyle(0x333366);
                tab.content.setVisible(false);
            }
        }
        
        // Store active tab
        this.activeTab = tabId;
    }
    
    createActionButtons() {
        // Action buttons container
        this.actionContainer = this.add.container(0, this.cameras.main.height - 100);
        
        // Save button
        const saveButton = this.add.text(
            this.cameras.main.width / 2 - 150,
            0,
            'SAVE GAME',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#66ff66',
                align: 'center',
                backgroundColor: '#224422',
                padding: {
                    x: 10,
                    y: 5
                }
            }
        ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        saveButton.on('pointerdown', () => {
            this.saveGame();
        });
        
        // Load button
        const loadButton = this.add.text(
            this.cameras.main.width / 2,
            0,
            'LOAD GAME',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#66ccff',
                align: 'center',
                backgroundColor: '#224466',
                padding: {
                    x: 10,
                    y: 5
                }
            }
        ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        loadButton.on('pointerdown', () => {
            this.loadGame();
        });
        
        // Reset button
        const resetButton = this.add.text(
            this.cameras.main.width / 2 + 150,
            0,
            'RESET DATA',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ff6666',
                align: 'center',
                backgroundColor: '#662222',
                padding: {
                    x: 10,
                    y: 5
                }
            }
        ).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        resetButton.on('pointerdown', () => {
            this.confirmReset();
        });
        
        // Add to container
        this.actionContainer.add([saveButton, loadButton, resetButton]);
    }
    
    displayProfileInfo() {
        // Get save manager
        const saveManager = this.game.global.saveManager;
        
        // Get meta-progression data
        const metaProgress = this.game.global.metaProgress || saveManager.defaultMetaProgress;
        
        // Get save summary
        const saveSummary = saveManager.getSaveSummary();
        
        // Profile panel
        const profilePanel = this.add.rectangle(
            this.cameras.main.width / 2,
            250,
            600,
            250,
            0x222244,
            0.8
        ).setOrigin(0.5);
        
        this.tabs.profile.content.add(profilePanel);
        
        // Credits display
        const creditsText = this.add.text(
            this.cameras.main.width / 2,
            150,
            `CREDITS: ${metaProgress.credits}`,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffff66',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.tabs.profile.content.add(creditsText);
        
        // Profile info
        const infoItems = [
            { label: 'Highest Sector Reached', value: metaProgress.highestSector },
            { label: 'Unlocked Ships', value: metaProgress.unlockedShips.length },
            { label: 'Unlocked Upgrades', value: metaProgress.unlockedUpgrades.length }
        ];
        
        // Add save timestamp if available
        if (saveSummary) {
            infoItems.push({ label: 'Last Saved', value: saveSummary.timestamp });
            infoItems.push({ label: 'Game Version', value: saveSummary.version });
        }
        
        // Display info items
        let yPos = 200;
        infoItems.forEach(item => {
            // Label
            const label = this.add.text(
                this.cameras.main.width / 2 - 200,
                yPos,
                item.label + ':',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#aaaaff',
                    align: 'left'
                }
            ).setOrigin(0, 0.5);
            
            // Value
            const value = this.add.text(
                this.cameras.main.width / 2 + 200,
                yPos,
                item.value.toString(),
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'right'
                }
            ).setOrigin(1, 0.5);
            
            this.tabs.profile.content.add([label, value]);
            
            yPos += 30;
        });
        
        // Unlocked ships section
        const shipsTitle = this.add.text(
            this.cameras.main.width / 2,
            350,
            'UNLOCKED SHIPS',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#66ccff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.tabs.profile.content.add(shipsTitle);
        
        // Display unlocked ships
        const shipContainer = this.add.container(this.cameras.main.width / 2 - 250, 380);
        this.tabs.profile.content.add(shipContainer);
        
        metaProgress.unlockedShips.forEach((ship, index) => {
            // Ship item
            const shipBg = this.add.rectangle(
                (index % 3) * 180,
                Math.floor(index / 3) * 40,
                160,
                35,
                0x334466,
                0.7
            ).setOrigin(0, 0);
            
            // Ship name
            const shipName = this.add.text(
                (index % 3) * 180 + 80,
                Math.floor(index / 3) * 40 + 17,
                this.getShipName(ship),
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            shipContainer.add([shipBg, shipName]);
        });
    }
    
    displayStatistics() {
        // Get save manager
        const saveManager = this.game.global.saveManager;
        
        // Get statistics
        const stats = this.game.global.statistics || saveManager.loadStats();
        
        // Statistics panel
        const statsPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            250,
            600,
            300,
            0x222244,
            0.8
        ).setOrigin(0.5);
        
        this.tabs.statistics.content.add(statsPanel);
        
        // Statistics title
        const statsTitle = this.add.text(
            this.cameras.main.width / 2,
            150,
            'GAME STATISTICS',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#66ccff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.tabs.statistics.content.add(statsTitle);
        
        // Statistics items
        const statItems = [
            { label: 'Total Runs', value: stats.totalRuns },
            { label: 'Total Play Time', value: this.formatPlayTime(stats.totalPlayTime) },
            { label: 'Highest Score', value: stats.highestScore },
            { label: 'Enemies Defeated', value: stats.enemiesDefeated },
            { label: 'Bosses Defeated', value: stats.bossesDefeated },
            { label: 'Upgrades Collected', value: stats.upgradesCollected },
            { label: 'Items Used', value: stats.itemsUsed },
            { label: 'Deaths', value: stats.deaths }
        ];
        
        // Display stat items
        let yPos = 200;
        statItems.forEach(item => {
            // Label
            const label = this.add.text(
                this.cameras.main.width / 2 - 200,
                yPos,
                item.label + ':',
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#aaaaff',
                    align: 'left'
                }
            ).setOrigin(0, 0.5);
            
            // Value
            const value = this.add.text(
                this.cameras.main.width / 2 + 200,
                yPos,
                item.value.toString(),
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'right'
                }
            ).setOrigin(1, 0.5);
            
            this.tabs.statistics.content.add([label, value]);
            
            yPos += 30;
        });
    }
    
    setupEvents() {
        // Add keyboard controls
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToPreviousScene();
        });
    }
    
    returnToPreviousScene() {
        this.scene.start(this.previousScene);
    }
    
    saveGame() {
        // Get save manager
        const saveManager = this.game.global.saveManager;
        
        // Save game
        saveManager.saveGame(true);
        
        // Refresh display
        this.refreshDisplay();
    }
    
    loadGame() {
        // Get save manager
        const saveManager = this.game.global.saveManager;
        
        // Check if save exists
        if (!saveManager.saveExists()) {
            saveManager.showSaveFeedback('No save data found!', true);
            return;
        }
        
        // Load game
        saveManager.loadGame(true);
        
        // Refresh display
        this.refreshDisplay();
    }
    
    confirmReset() {
        // Create confirmation dialog
        const dialogBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            400,
            200,
            0x000000,
            0.9
        ).setOrigin(0.5).setDepth(100);
        
        const dialogText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'Are you sure you want to reset all data?\nThis cannot be undone!',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(101);
        
        // Yes button
        const yesButton = this.add.text(
            this.cameras.main.width / 2 - 80,
            this.cameras.main.height / 2 + 30,
            'YES',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ff6666',
                align: 'center',
                backgroundColor: '#662222',
                padding: {
                    x: 20,
                    y: 10
                }
            }
        ).setOrigin(0.5).setDepth(101)
        .setInteractive({ useHandCursor: true });
        
        yesButton.on('pointerdown', () => {
            // Reset all data
            this.game.global.saveManager.resetAllData(true);
            
            // Remove dialog
            dialogBg.destroy();
            dialogText.destroy();
            yesButton.destroy();
            noButton.destroy();
            
            // Refresh display
            this.refreshDisplay();
        });
        
        // No button
        const noButton = this.add.text(
            this.cameras.main.width / 2 + 80,
            this.cameras.main.height / 2 + 30,
            'NO',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#66ff66',
                align: 'center',
                backgroundColor: '#224422',
                padding: {
                    x: 20,
                    y: 10
                }
            }
        ).setOrigin(0.5).setDepth(101)
        .setInteractive({ useHandCursor: true });
        
        noButton.on('pointerdown', () => {
            // Remove dialog
            dialogBg.destroy();
            dialogText.destroy();
            yesButton.destroy();
            noButton.destroy();
        });
    }
    
    refreshDisplay() {
        // Restart scene to refresh display
        this.scene.restart({
            previousScene: this.previousScene
        });
    }
    
    getShipName(shipType) {
        // Get ship name based on type
        switch (shipType) {
            case 'fighter':
                return 'STELLAR FIGHTER';
            case 'interceptor':
                return 'VOID INTERCEPTOR';
            case 'destroyer':
                return 'NOVA DESTROYER';
            default:
                return shipType.toUpperCase();
        }
    }
    
    formatPlayTime(milliseconds) {
        // Convert milliseconds to hours, minutes, seconds
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        // Format as HH:MM:SS
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ProfileScene = ProfileScene;
}
