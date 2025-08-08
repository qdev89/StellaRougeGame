/**
 * Achievement System
 * Manages game achievements and rewards
 */
class AchievementSystem {
    /**
     * Initialize the achievement system
     * @param {Phaser.Game} game - The game instance
     */
    constructor(game) {
        this.game = game;
        
        // Initialize achievements
        this.achievements = {};
        
        // Register default achievements
        this.registerDefaultAchievements();
        
        // Load achievement progress
        this.loadProgress();
        
        console.log('Achievement system initialized');
    }
    
    /**
     * Register default achievements
     */
    registerDefaultAchievements() {
        // Combat achievements
        this.registerAchievement('enemy_destroyer', {
            id: 'enemy_destroyer',
            name: 'Enemy Destroyer',
            description: 'Defeat 100 enemies',
            category: 'combat',
            icon: '💥',
            thresholds: [10, 50, 100, 500, 1000],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 100 },
                { type: 'credits', value: 250 },
                { type: 'unlock', value: 'dual_cannon_weapon' },
                { type: 'credits', value: 500 },
                { type: 'unlock', value: 'scout_ship' }
            ]
        });
        
        this.registerAchievement('boss_slayer', {
            id: 'boss_slayer',
            name: 'Boss Slayer',
            description: 'Defeat boss enemies',
            category: 'combat',
            icon: '👑',
            thresholds: [1, 3, 5, 10],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 200 },
                { type: 'unlock', value: 'plasma_bolt_weapon' },
                { type: 'credits', value: 500 },
                { type: 'unlock', value: 'tank_ship' }
            ]
        });
        
        // Exploration achievements
        this.registerAchievement('sector_explorer', {
            id: 'sector_explorer',
            name: 'Sector Explorer',
            description: 'Reach higher sectors',
            category: 'exploration',
            icon: '🌌',
            thresholds: [2, 4, 6, 8, 10],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 150 },
                { type: 'unlock', value: 'homing_missile_weapon' },
                { type: 'credits', value: 300 },
                { type: 'unlock', value: 'support_ship' },
                { type: 'unlock', value: 'experimental_ship' }
            ]
        });
        
        this.registerAchievement('path_finder', {
            id: 'path_finder',
            name: 'Path Finder',
            description: 'Explore different path types',
            category: 'exploration',
            icon: '🧭',
            thresholds: [3, 5],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 100 },
                { type: 'unlock', value: 'scatter_bomb_weapon' }
            ]
        });
        
        // Collection achievements
        this.registerAchievement('weapon_collector', {
            id: 'weapon_collector',
            name: 'Weapon Collector',
            description: 'Unlock different weapons',
            category: 'collection',
            icon: '🔫',
            thresholds: [3, 5, 7],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 150 },
                { type: 'credits', value: 300 },
                { type: 'unlock', value: 'laser_beam_weapon' }
            ]
        });
        
        this.registerAchievement('upgrade_enthusiast', {
            id: 'upgrade_enthusiast',
            name: 'Upgrade Enthusiast',
            description: 'Apply ship upgrades',
            category: 'collection',
            icon: '⚙️',
            thresholds: [5, 15, 30],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 100 },
                { type: 'credits', value: 250 },
                { type: 'permanent_upgrade', value: 'shield_capacity' }
            ]
        });
        
        // Survival achievements
        this.registerAchievement('survivor', {
            id: 'survivor',
            name: 'Survivor',
            description: 'Complete sectors without dying',
            category: 'survival',
            icon: '🛡️',
            thresholds: [1, 3, 5, 10],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 100 },
                { type: 'credits', value: 250 },
                { type: 'permanent_upgrade', value: 'health_capacity' },
                { type: 'credits', value: 1000 }
            ]
        });
        
        this.registerAchievement('close_call', {
            id: 'close_call',
            name: 'Close Call',
            description: 'Survive with less than 10% health',
            category: 'survival',
            icon: '😰',
            thresholds: [1, 5, 10],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 50 },
                { type: 'credits', value: 150 },
                { type: 'permanent_upgrade', value: 'emergency_shield' }
            ]
        });
        
        // Score achievements
        this.registerAchievement('high_scorer', {
            id: 'high_scorer',
            name: 'High Scorer',
            description: 'Reach high scores',
            category: 'score',
            icon: '🏆',
            thresholds: [1000, 5000, 10000, 50000, 100000],
            currentValue: 0,
            unlocked: false,
            rewards: [
                { type: 'credits', value: 100 },
                { type: 'credits', value: 250 },
                { type: 'permanent_upgrade', value: 'score_multiplier' },
                { type: 'credits', value: 500 },
                { type: 'unlock', value: 'experimental_ship' }
            ]
        });
    }
    
    /**
     * Register a new achievement
     * @param {string} id - Achievement identifier
     * @param {Object} config - Achievement configuration
     */
    registerAchievement(id, config) {
        this.achievements[id] = config;
    }
    
    /**
     * Update achievement progress
     * @param {string} id - Achievement identifier
     * @param {number} value - New value or increment
     * @param {boolean} increment - Whether to increment or set the value
     * @returns {Object|null} Reward if achievement level increased, null otherwise
     */
    updateAchievement(id, value, increment = true) {
        // Check if achievement exists
        if (!this.achievements[id]) {
            console.warn(`Achievement ${id} not found`);
            return null;
        }
        
        const achievement = this.achievements[id];
        const oldValue = achievement.currentValue;
        
        // Update value
        if (increment) {
            achievement.currentValue += value;
        } else {
            achievement.currentValue = Math.max(achievement.currentValue, value);
        }
        
        // Check if achievement level increased
        const oldLevel = this.getAchievementLevel(oldValue, achievement.thresholds);
        const newLevel = this.getAchievementLevel(achievement.currentValue, achievement.thresholds);
        
        // Save progress
        this.saveProgress();
        
        // Return reward if level increased
        if (newLevel > oldLevel) {
            // Mark as unlocked
            achievement.unlocked = true;
            
            // Get reward for the new level
            const reward = achievement.rewards[newLevel - 1];
            
            // Create notification
            this.createAchievementNotification(achievement, newLevel);
            
            // Apply reward
            this.applyReward(reward);
            
            return {
                achievement: achievement,
                level: newLevel,
                reward: reward
            };
        }
        
        return null;
    }
    
    /**
     * Get achievement level based on value and thresholds
     * @param {number} value - Current value
     * @param {Array} thresholds - Achievement thresholds
     * @returns {number} Achievement level (0 if not reached any threshold)
     */
    getAchievementLevel(value, thresholds) {
        let level = 0;
        
        for (let i = 0; i < thresholds.length; i++) {
            if (value >= thresholds[i]) {
                level = i + 1;
            } else {
                break;
            }
        }
        
        return level;
    }
    
    /**
     * Create achievement notification
     * @param {Object} achievement - Achievement data
     * @param {number} level - Achievement level
     */
    createAchievementNotification(achievement, level) {
        // Check if game scene is available
        if (!this.game.scene || !this.game.scene.scenes) return;
        
        // Find active scene
        const activeScene = this.game.scene.scenes.find(scene => 
            scene.sys && scene.sys.settings.active
        );
        
        if (!activeScene) return;
        
        // Create notification container
        const container = activeScene.add.container(
            activeScene.cameras.main.width / 2,
            100
        ).setDepth(1000).setScrollFactor(0);
        
        // Create background
        const bg = activeScene.add.rectangle(
            0, 0, 400, 100,
            0x003366, 0.8
        ).setStrokeStyle(2, 0x33aaff);
        
        container.add(bg);
        
        // Create achievement icon
        const iconText = activeScene.add.text(
            -170, 0,
            achievement.icon,
            {
                fontSize: '32px'
            }
        ).setOrigin(0.5);
        
        container.add(iconText);
        
        // Create title
        const titleText = activeScene.add.text(
            -120, -25,
            `${achievement.name} - Level ${level}`,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#33aaff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0, 0.5);
        
        container.add(titleText);
        
        // Create description
        const descText = activeScene.add.text(
            -120, 5,
            achievement.description,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff'
            }
        ).setOrigin(0, 0.5);
        
        container.add(descText);
        
        // Create reward text
        const reward = achievement.rewards[level - 1];
        const rewardText = activeScene.add.text(
            -120, 30,
            `Reward: ${this.getRewardText(reward)}`,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffaa33',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0, 0.5);
        
        container.add(rewardText);
        
        // Animate in
        container.setAlpha(0);
        container.y = 50;
        
        activeScene.tweens.add({
            targets: container,
            alpha: 1,
            y: 100,
            duration: 500,
            ease: 'Back.out'
        });
        
        // Animate out after delay
        activeScene.time.delayedCall(5000, () => {
            activeScene.tweens.add({
                targets: container,
                alpha: 0,
                y: 50,
                duration: 500,
                onComplete: () => container.destroy()
            });
        });
    }
    
    /**
     * Get human-readable reward text
     * @param {Object} reward - Reward data
     * @returns {string} Reward text
     */
    getRewardText(reward) {
        if (!reward) return 'None';
        
        switch (reward.type) {
            case 'credits':
                return `${reward.value} Credits`;
            case 'unlock':
                return `Unlock: ${this.getUnlockName(reward.value)}`;
            case 'permanent_upgrade':
                return `Permanent Upgrade: ${this.getUpgradeName(reward.value)}`;
            default:
                return reward.type;
        }
    }
    
    /**
     * Get unlock name
     * @param {string} unlockId - Unlock identifier
     * @returns {string} Unlock name
     */
    getUnlockName(unlockId) {
        // Map unlock IDs to readable names
        const unlockNames = {
            'dual_cannon_weapon': 'Dual Cannon Weapon',
            'plasma_bolt_weapon': 'Plasma Bolt Weapon',
            'homing_missile_weapon': 'Homing Missile Weapon',
            'scatter_bomb_weapon': 'Scatter Bomb Weapon',
            'laser_beam_weapon': 'Laser Beam Weapon',
            'scout_ship': 'Scout Ship',
            'tank_ship': 'Juggernaut Ship',
            'support_ship': 'Technician Ship',
            'experimental_ship': 'Prototype X Ship'
        };
        
        return unlockNames[unlockId] || unlockId;
    }
    
    /**
     * Get upgrade name
     * @param {string} upgradeId - Upgrade identifier
     * @returns {string} Upgrade name
     */
    getUpgradeName(upgradeId) {
        // Map upgrade IDs to readable names
        const upgradeNames = {
            'shield_capacity': 'Shield Capacity',
            'health_capacity': 'Health Capacity',
            'emergency_shield': 'Emergency Shield',
            'score_multiplier': 'Score Multiplier'
        };
        
        return upgradeNames[upgradeId] || upgradeId;
    }
    
    /**
     * Apply reward
     * @param {Object} reward - Reward data
     */
    applyReward(reward) {
        if (!reward) return;
        
        // Check if game global state is available
        if (!this.game.global) {
            console.warn('Game global state not available, cannot apply reward');
            return;
        }
        
        switch (reward.type) {
            case 'credits':
                // Add credits to meta progress
                if (!this.game.global.metaProgress) {
                    this.game.global.metaProgress = {};
                }
                
                if (!this.game.global.metaProgress.credits) {
                    this.game.global.metaProgress.credits = 0;
                }
                
                this.game.global.metaProgress.credits += reward.value;
                console.log(`Added ${reward.value} credits`);
                break;
                
            case 'unlock':
                // Unlock item
                this.unlockReward(reward.value);
                break;
                
            case 'permanent_upgrade':
                // Add permanent upgrade
                this.addPermanentUpgrade(reward.value);
                break;
        }
        
        // Save game state
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }
    }
    
    /**
     * Unlock a reward
     * @param {string} unlockId - Unlock identifier
     */
    unlockReward(unlockId) {
        // Check if it's a weapon unlock
        if (unlockId.endsWith('_weapon')) {
            // Extract weapon type
            const weaponType = unlockId.replace('_weapon', '').toUpperCase();
            
            // Add to unlocked weapons
            if (this.game.global.currentRun && this.game.global.currentRun.unlockedWeapons) {
                if (!this.game.global.currentRun.unlockedWeapons.includes(weaponType)) {
                    this.game.global.currentRun.unlockedWeapons.push(weaponType);
                    console.log(`Unlocked weapon: ${weaponType}`);
                }
            }
        }
        // Check if it's a ship unlock
        else if (unlockId.endsWith('_ship')) {
            // Extract ship type
            const shipType = unlockId.replace('_ship', '');
            
            // Add to unlocked ships
            if (this.game.global.metaProgress) {
                if (!this.game.global.metaProgress.unlockedShips) {
                    this.game.global.metaProgress.unlockedShips = ['fighter'];
                }
                
                if (!this.game.global.metaProgress.unlockedShips.includes(shipType)) {
                    this.game.global.metaProgress.unlockedShips.push(shipType);
                    console.log(`Unlocked ship: ${shipType}`);
                }
            }
        }
    }
    
    /**
     * Add permanent upgrade
     * @param {string} upgradeId - Upgrade identifier
     */
    addPermanentUpgrade(upgradeId) {
        // Initialize permanent upgrades array if it doesn't exist
        if (!this.game.global.metaProgress) {
            this.game.global.metaProgress = {};
        }
        
        if (!this.game.global.metaProgress.permanentUpgrades) {
            this.game.global.metaProgress.permanentUpgrades = [];
        }
        
        // Add upgrade if not already present
        if (!this.game.global.metaProgress.permanentUpgrades.includes(upgradeId)) {
            this.game.global.metaProgress.permanentUpgrades.push(upgradeId);
            console.log(`Added permanent upgrade: ${upgradeId}`);
        }
    }
    
    /**
     * Get all achievements
     * @returns {Array} Array of all achievements
     */
    getAllAchievements() {
        return Object.values(this.achievements);
    }
    
    /**
     * Get achievements by category
     * @param {string} category - Achievement category
     * @returns {Array} Array of achievements in the category
     */
    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(
            achievement => achievement.category === category
        );
    }
    
    /**
     * Get achievement progress
     * @param {string} id - Achievement identifier
     * @returns {Object} Achievement progress data
     */
    getAchievementProgress(id) {
        const achievement = this.achievements[id];
        if (!achievement) return null;
        
        const level = this.getAchievementLevel(achievement.currentValue, achievement.thresholds);
        const nextThreshold = level < achievement.thresholds.length ? achievement.thresholds[level] : null;
        const progress = nextThreshold ? achievement.currentValue / nextThreshold : 1;
        
        return {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            category: achievement.category,
            icon: achievement.icon,
            currentValue: achievement.currentValue,
            level: level,
            maxLevel: achievement.thresholds.length,
            nextThreshold: nextThreshold,
            progress: progress,
            unlocked: achievement.unlocked
        };
    }
    
    /**
     * Save achievement progress
     */
    saveProgress() {
        // Check if game global state is available
        if (!this.game.global) return;
        
        // Create achievement progress data
        const progressData = {};
        
        Object.keys(this.achievements).forEach(id => {
            const achievement = this.achievements[id];
            progressData[id] = {
                currentValue: achievement.currentValue,
                unlocked: achievement.unlocked
            };
        });
        
        // Save to meta progress
        if (!this.game.global.metaProgress) {
            this.game.global.metaProgress = {};
        }
        
        this.game.global.metaProgress.achievements = progressData;
        
        // Save game state
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }
    }
    
    /**
     * Load achievement progress
     */
    loadProgress() {
        // Check if game global state is available
        if (!this.game.global || !this.game.global.metaProgress || !this.game.global.metaProgress.achievements) {
            return;
        }
        
        const progressData = this.game.global.metaProgress.achievements;
        
        // Load progress for each achievement
        Object.keys(progressData).forEach(id => {
            if (this.achievements[id]) {
                this.achievements[id].currentValue = progressData[id].currentValue || 0;
                this.achievements[id].unlocked = progressData[id].unlocked || false;
            }
        });
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.AchievementSystem = AchievementSystem;
}
