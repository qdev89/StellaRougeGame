/**
 * Nemesis Achievements System
 * Manages achievements related to the Nemesis boss fight
 */
class NemesisAchievements {
    constructor(game) {
        this.game = game;
        
        // Achievement definitions
        this.achievements = {
            // Grade-based achievements
            perfectGrade: {
                id: 'nemesis_perfect_grade',
                name: 'Perfect Nemesis',
                description: 'Defeat the Nemesis with an S grade',
                icon: 'trophy-gold',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 1000
                }
            },
            excellentGrade: {
                id: 'nemesis_excellent_grade',
                name: 'Excellent Nemesis Hunter',
                description: 'Defeat the Nemesis with an A grade',
                icon: 'trophy-silver',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 500
                }
            },
            goodGrade: {
                id: 'nemesis_good_grade',
                name: 'Skilled Nemesis Hunter',
                description: 'Defeat the Nemesis with a B grade',
                icon: 'trophy-bronze',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 250
                }
            },
            
            // Difficulty-based achievements
            veryHardDifficulty: {
                id: 'nemesis_very_hard',
                name: 'Nemesis Master',
                description: 'Defeat the Nemesis on Very Hard difficulty',
                icon: 'difficulty-very-hard',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 1500
                }
            },
            hardDifficulty: {
                id: 'nemesis_hard',
                name: 'Nemesis Expert',
                description: 'Defeat the Nemesis on Hard difficulty',
                icon: 'difficulty-hard',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 750
                }
            },
            
            // Performance-based achievements
            flawlessVictory: {
                id: 'nemesis_flawless',
                name: 'Flawless Victory',
                description: 'Defeat the Nemesis without taking any damage',
                icon: 'shield-perfect',
                unlocked: false,
                secret: true,
                reward: {
                    type: 'credits',
                    value: 2000
                }
            },
            speedRunner: {
                id: 'nemesis_speed',
                name: 'Speed Runner',
                description: 'Defeat the Nemesis in under 3 minutes',
                icon: 'clock-fast',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 1000
                }
            },
            comboMaster: {
                id: 'nemesis_combo_master',
                name: 'Combo Master',
                description: 'Avoid 10 Nemesis combo attacks in a single fight',
                icon: 'dodge-master',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 750
                }
            },
            
            // Weapon-based achievements
            weaponVariety: {
                id: 'nemesis_weapon_variety',
                name: 'Weapon Tactician',
                description: 'Defeat the Nemesis using at least 5 different weapons',
                icon: 'weapons-variety',
                unlocked: false,
                secret: false,
                reward: {
                    type: 'credits',
                    value: 500
                }
            },
            singleWeaponMaster: {
                id: 'nemesis_single_weapon',
                name: 'Weapon Specialist',
                description: 'Defeat the Nemesis using only a single weapon type',
                icon: 'weapon-master',
                unlocked: false,
                secret: true,
                reward: {
                    type: 'credits',
                    value: 750
                }
            },
            
            // Milestone achievements
            nemesisSlayer: {
                id: 'nemesis_slayer',
                name: 'Nemesis Slayer',
                description: 'Defeat the Nemesis 5 times',
                icon: 'nemesis-defeated',
                unlocked: false,
                secret: false,
                progress: 0,
                maxProgress: 5,
                reward: {
                    type: 'credits',
                    value: 1000
                }
            },
            nemesisNemesis: {
                id: 'nemesis_nemesis',
                name: 'Nemesis of the Nemesis',
                description: 'Defeat the Nemesis 10 times',
                icon: 'nemesis-master',
                unlocked: false,
                secret: false,
                progress: 0,
                maxProgress: 10,
                reward: {
                    type: 'credits',
                    value: 2000
                }
            }
        };
        
        // Load achievements from storage
        this.loadAchievements();
    }
    
    /**
     * Load achievements from local storage
     */
    loadAchievements() {
        try {
            const savedData = localStorage.getItem('nemesis_achievements');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Update achievement unlocked status
                Object.keys(data).forEach(id => {
                    if (this.achievements[id]) {
                        this.achievements[id].unlocked = data[id].unlocked;
                        
                        // Update progress for milestone achievements
                        if (data[id].progress !== undefined) {
                            this.achievements[id].progress = data[id].progress;
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load Nemesis achievements', error);
        }
    }
    
    /**
     * Save achievements to local storage
     */
    saveAchievements() {
        try {
            const data = {};
            
            // Extract relevant data for saving
            Object.keys(this.achievements).forEach(id => {
                data[id] = {
                    unlocked: this.achievements[id].unlocked
                };
                
                // Save progress for milestone achievements
                if (this.achievements[id].progress !== undefined) {
                    data[id].progress = this.achievements[id].progress;
                }
            });
            
            localStorage.setItem('nemesis_achievements', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save Nemesis achievements', error);
        }
    }
    
    /**
     * Check for achievements based on performance metrics
     * @param {object} metrics - Performance metrics from Nemesis fight
     * @returns {array} Newly unlocked achievements
     */
    checkAchievements(metrics) {
        const newlyUnlocked = [];
        
        // Check grade-based achievements
        if (metrics.grade === 'S' && !this.achievements.perfectGrade.unlocked) {
            this.achievements.perfectGrade.unlocked = true;
            newlyUnlocked.push(this.achievements.perfectGrade);
        } else if (metrics.grade === 'A' && !this.achievements.excellentGrade.unlocked) {
            this.achievements.excellentGrade.unlocked = true;
            newlyUnlocked.push(this.achievements.excellentGrade);
        } else if (metrics.grade === 'B' && !this.achievements.goodGrade.unlocked) {
            this.achievements.goodGrade.unlocked = true;
            newlyUnlocked.push(this.achievements.goodGrade);
        }
        
        // Check difficulty-based achievements
        if (metrics.difficultyLevel >= 0.9 && !this.achievements.veryHardDifficulty.unlocked) {
            this.achievements.veryHardDifficulty.unlocked = true;
            newlyUnlocked.push(this.achievements.veryHardDifficulty);
        } else if (metrics.difficultyLevel >= 0.7 && !this.achievements.hardDifficulty.unlocked) {
            this.achievements.hardDifficulty.unlocked = true;
            newlyUnlocked.push(this.achievements.hardDifficulty);
        }
        
        // Check performance-based achievements
        if (metrics.damageTaken === 0 && !this.achievements.flawlessVictory.unlocked) {
            this.achievements.flawlessVictory.unlocked = true;
            newlyUnlocked.push(this.achievements.flawlessVictory);
        }
        
        // Check time-based achievements (3 minutes = 180000ms)
        if (metrics.timeInFight <= 180000 && !this.achievements.speedRunner.unlocked) {
            this.achievements.speedRunner.unlocked = true;
            newlyUnlocked.push(this.achievements.speedRunner);
        }
        
        // Check combo avoidance achievement
        if (metrics.combosAvoided >= 10 && !this.achievements.comboMaster.unlocked) {
            this.achievements.comboMaster.unlocked = true;
            newlyUnlocked.push(this.achievements.comboMaster);
        }
        
        // Check weapon variety achievement
        const weaponCount = Object.keys(metrics.weaponsUsed).length;
        if (weaponCount >= 5 && !this.achievements.weaponVariety.unlocked) {
            this.achievements.weaponVariety.unlocked = true;
            newlyUnlocked.push(this.achievements.weaponVariety);
        }
        
        // Check single weapon achievement
        if (weaponCount === 1 && metrics.damageDealt > 0 && !this.achievements.singleWeaponMaster.unlocked) {
            this.achievements.singleWeaponMaster.unlocked = true;
            newlyUnlocked.push(this.achievements.singleWeaponMaster);
        }
        
        // Update milestone achievements
        if (!this.achievements.nemesisSlayer.unlocked) {
            this.achievements.nemesisSlayer.progress += 1;
            
            if (this.achievements.nemesisSlayer.progress >= this.achievements.nemesisSlayer.maxProgress) {
                this.achievements.nemesisSlayer.unlocked = true;
                newlyUnlocked.push(this.achievements.nemesisSlayer);
            }
        }
        
        if (!this.achievements.nemesisNemesis.unlocked) {
            this.achievements.nemesisNemesis.progress += 1;
            
            if (this.achievements.nemesisNemesis.progress >= this.achievements.nemesisNemesis.maxProgress) {
                this.achievements.nemesisNemesis.unlocked = true;
                newlyUnlocked.push(this.achievements.nemesisNemesis);
            }
        }
        
        // Save achievements
        this.saveAchievements();
        
        return newlyUnlocked;
    }
    
    /**
     * Get all achievements
     * @param {boolean} includeSecret - Whether to include secret achievements
     * @returns {array} Array of achievement objects
     */
    getAllAchievements(includeSecret = true) {
        return Object.values(this.achievements).filter(achievement => {
            return includeSecret || !achievement.secret || achievement.unlocked;
        });
    }
    
    /**
     * Get unlocked achievements
     * @returns {array} Array of unlocked achievement objects
     */
    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(achievement => achievement.unlocked);
    }
    
    /**
     * Get locked achievements
     * @param {boolean} includeSecret - Whether to include secret achievements
     * @returns {array} Array of locked achievement objects
     */
    getLockedAchievements(includeSecret = true) {
        return Object.values(this.achievements).filter(achievement => {
            return !achievement.unlocked && (includeSecret || !achievement.secret);
        });
    }
    
    /**
     * Get achievement by ID
     * @param {string} id - Achievement ID
     * @returns {object} Achievement object
     */
    getAchievement(id) {
        return this.achievements[id];
    }
    
    /**
     * Reset all achievements
     */
    resetAchievements() {
        Object.keys(this.achievements).forEach(id => {
            this.achievements[id].unlocked = false;
            
            // Reset progress for milestone achievements
            if (this.achievements[id].progress !== undefined) {
                this.achievements[id].progress = 0;
            }
        });
        
        this.saveAchievements();
    }
    
    /**
     * Apply rewards for newly unlocked achievements
     * @param {array} unlockedAchievements - Array of newly unlocked achievements
     */
    applyAchievementRewards(unlockedAchievements) {
        unlockedAchievements.forEach(achievement => {
            if (achievement.reward) {
                switch (achievement.reward.type) {
                    case 'credits':
                        // Add credits to meta-progression
                        if (this.game.global && this.game.global.metaProgress) {
                            this.game.global.metaProgress.credits += achievement.reward.value;
                        }
                        break;
                    // Add other reward types as needed
                }
            }
        });
        
        // Save game state if possible
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisAchievements = NemesisAchievements;
}
