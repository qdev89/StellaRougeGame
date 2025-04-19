/**
 * Nemesis Difficulty System
 * Handles scaling the difficulty of the Nemesis boss based on player performance
 */
class NemesisDifficulty {
    constructor(game) {
        this.game = game;
    }
    
    /**
     * Calculate difficulty multipliers for the Nemesis boss
     * @returns {object} Difficulty multipliers for various aspects of the boss
     */
    calculateDifficultyMultipliers() {
        const multipliers = {
            health: 1.0,
            damage: 1.0,
            speed: 1.0,
            adaptationRate: 1.0,
            resistanceStrength: 1.0
        };
        
        // Apply base difficulty setting
        this.applyDifficultySettings(multipliers);
        
        // Apply scaling based on player performance
        this.applyPerformanceScaling(multipliers);
        
        // Apply scaling based on previous Nemesis encounters
        this.applyNemesisEncounterScaling(multipliers);
        
        // Apply scaling based on player upgrades
        this.applyUpgradeScaling(multipliers);
        
        // Apply scaling based on player ship type
        this.applyShipTypeScaling(multipliers);
        
        // Cap multipliers to reasonable ranges
        this.capMultipliers(multipliers);
        
        console.log('Nemesis difficulty multipliers:', multipliers);
        return multipliers;
    }
    
    /**
     * Apply base difficulty settings
     * @param {object} multipliers - Difficulty multipliers to modify
     */
    applyDifficultySettings(multipliers) {
        const difficulty = this.game.global.settings.difficulty || 'normal';
        
        switch (difficulty) {
            case 'easy':
                multipliers.health *= 0.8;
                multipliers.damage *= 0.8;
                multipliers.speed *= 0.9;
                multipliers.adaptationRate *= 0.7;
                multipliers.resistanceStrength *= 0.7;
                break;
                
            case 'normal':
                // Default values
                break;
                
            case 'hard':
                multipliers.health *= 1.2;
                multipliers.damage *= 1.2;
                multipliers.speed *= 1.1;
                multipliers.adaptationRate *= 1.3;
                multipliers.resistanceStrength *= 1.2;
                break;
                
            case 'nightmare':
                multipliers.health *= 1.5;
                multipliers.damage *= 1.4;
                multipliers.speed *= 1.2;
                multipliers.adaptationRate *= 1.5;
                multipliers.resistanceStrength *= 1.4;
                break;
        }
    }
    
    /**
     * Apply scaling based on player performance
     * @param {object} multipliers - Difficulty multipliers to modify
     */
    applyPerformanceScaling(multipliers) {
        // Get player statistics
        const stats = this.game.global.statistics || {};
        
        // Scale based on highest score
        const highestScore = stats.highestScore || 0;
        const scoreScaling = Math.min(highestScore / 50000, 0.5); // Up to 50% increase
        
        // Scale based on bosses defeated
        const bossesDefeated = stats.bossesDefeated || 0;
        const bossScaling = Math.min(bossesDefeated * 0.05, 0.3); // Up to 30% increase
        
        // Scale based on total runs
        const totalRuns = stats.totalRuns || 0;
        const runScaling = Math.min(totalRuns * 0.02, 0.2); // Up to 20% increase
        
        // Apply performance scaling
        multipliers.health *= (1 + scoreScaling + bossScaling);
        multipliers.damage *= (1 + scoreScaling + runScaling);
        multipliers.speed *= (1 + bossScaling * 0.5);
        multipliers.adaptationRate *= (1 + runScaling + bossScaling * 0.5);
        multipliers.resistanceStrength *= (1 + scoreScaling * 0.5 + bossScaling * 0.5);
    }
    
    /**
     * Apply scaling based on previous Nemesis encounters
     * @param {object} multipliers - Difficulty multipliers to modify
     */
    applyNemesisEncounterScaling(multipliers) {
        // Get Nemesis data
        const nemesisData = this.game.global.nemesisData || {};
        
        // Scale based on number of encounters
        const encounters = nemesisData.encounters || 0;
        const encounterScaling = Math.min(encounters * 0.1, 0.5); // Up to 50% increase
        
        // Scale based on number of defeats
        const defeats = nemesisData.defeats || 0;
        const defeatScaling = Math.min(defeats * 0.15, 0.6); // Up to 60% increase
        
        // Apply Nemesis encounter scaling
        multipliers.health *= (1 + encounterScaling + defeatScaling);
        multipliers.damage *= (1 + encounterScaling * 0.5 + defeatScaling * 0.7);
        multipliers.speed *= (1 + encounterScaling * 0.3 + defeatScaling * 0.4);
        multipliers.adaptationRate *= (1 + encounterScaling * 0.4 + defeatScaling * 0.6);
        multipliers.resistanceStrength *= (1 + encounterScaling * 0.3 + defeatScaling * 0.5);
    }
    
    /**
     * Apply scaling based on player upgrades
     * @param {object} multipliers - Difficulty multipliers to modify
     */
    applyUpgradeScaling(multipliers) {
        // Get player upgrades
        const upgrades = this.game.global.currentRun.upgrades || [];
        
        // Count legendary and epic upgrades
        const legendaryCount = upgrades.filter(u => u.rarity === 'legendary').length;
        const epicCount = upgrades.filter(u => u.rarity === 'epic').length;
        
        // Calculate upgrade scaling
        const upgradeScaling = Math.min((legendaryCount * 0.08) + (epicCount * 0.04), 0.4); // Up to 40% increase
        
        // Apply upgrade scaling
        multipliers.health *= (1 + upgradeScaling);
        multipliers.damage *= (1 + upgradeScaling * 0.8);
        multipliers.speed *= (1 + upgradeScaling * 0.5);
        multipliers.adaptationRate *= (1 + upgradeScaling * 0.7);
        multipliers.resistanceStrength *= (1 + upgradeScaling * 0.6);
    }
    
    /**
     * Apply scaling based on player ship type
     * @param {object} multipliers - Difficulty multipliers to modify
     */
    applyShipTypeScaling(multipliers) {
        // Get player ship type
        const shipType = this.game.global.currentRun.shipType || 'fighter';
        
        // Apply ship-specific scaling
        switch (shipType) {
            case 'fighter':
                // Balanced scaling
                break;
                
            case 'interceptor':
                // Fast but fragile ship - increase damage, decrease health
                multipliers.damage *= 1.1;
                multipliers.health *= 0.95;
                break;
                
            case 'destroyer':
                // Tanky ship - increase health, decrease adaptation
                multipliers.health *= 1.15;
                multipliers.adaptationRate *= 0.9;
                break;
                
            case 'nemesis_hunter':
                // Ship specifically designed to hunt the Nemesis - significant increase
                multipliers.health *= 1.3;
                multipliers.damage *= 1.2;
                multipliers.speed *= 1.1;
                multipliers.adaptationRate *= 1.2;
                multipliers.resistanceStrength *= 1.2;
                break;
        }
    }
    
    /**
     * Cap multipliers to reasonable ranges
     * @param {object} multipliers - Difficulty multipliers to cap
     */
    capMultipliers(multipliers) {
        // Set minimum and maximum values for each multiplier
        multipliers.health = Math.max(0.5, Math.min(multipliers.health, 3.0));
        multipliers.damage = Math.max(0.5, Math.min(multipliers.damage, 2.5));
        multipliers.speed = Math.max(0.7, Math.min(multipliers.speed, 2.0));
        multipliers.adaptationRate = Math.max(0.5, Math.min(multipliers.adaptationRate, 2.5));
        multipliers.resistanceStrength = Math.max(0.5, Math.min(multipliers.resistanceStrength, 2.0));
    }
    
    /**
     * Apply difficulty multipliers to Nemesis configuration
     * @param {object} nemesisConfig - Nemesis boss configuration
     * @returns {object} Modified Nemesis configuration with difficulty applied
     */
    applyDifficultyToConfig(nemesisConfig) {
        if (!nemesisConfig) return null;
        
        // Calculate difficulty multipliers
        const multipliers = this.calculateDifficultyMultipliers();
        
        // Apply multipliers to configuration
        nemesisConfig.health = Math.floor(nemesisConfig.health * multipliers.health);
        nemesisConfig.maxHealth = nemesisConfig.health;
        
        // Apply to damage values if they exist
        if (nemesisConfig.damage) {
            nemesisConfig.damage = Math.floor(nemesisConfig.damage * multipliers.damage);
        }
        
        // Apply to speed values if they exist
        if (nemesisConfig.speed) {
            nemesisConfig.speed = nemesisConfig.speed * multipliers.speed;
        }
        
        // Apply to adaptation rate
        nemesisConfig.adaptationRate = (nemesisConfig.adaptationRate || 1.0) * multipliers.adaptationRate;
        
        // Apply to resistances
        if (nemesisConfig.resistances) {
            Object.keys(nemesisConfig.resistances).forEach(key => {
                if (nemesisConfig.resistances[key] > 0) {
                    nemesisConfig.resistances[key] = Math.min(
                        nemesisConfig.resistances[key] * multipliers.resistanceStrength,
                        0.8 // Cap resistance at 80%
                    );
                }
            });
        }
        
        // Store difficulty multipliers in config for reference
        nemesisConfig.difficultyMultipliers = multipliers;
        
        return nemesisConfig;
    }
    
    /**
     * Get difficulty description for the current Nemesis
     * @returns {string} Description of the current difficulty level
     */
    getDifficultyDescription() {
        const multipliers = this.calculateDifficultyMultipliers();
        
        // Calculate average multiplier
        const avgMultiplier = (
            multipliers.health +
            multipliers.damage +
            multipliers.speed +
            multipliers.adaptationRate +
            multipliers.resistanceStrength
        ) / 5;
        
        // Determine difficulty level based on average multiplier
        if (avgMultiplier < 0.8) {
            return "Weakened - The Nemesis is still recovering from previous defeats.";
        } else if (avgMultiplier < 1.0) {
            return "Standard - The Nemesis is at its baseline power.";
        } else if (avgMultiplier < 1.3) {
            return "Enhanced - The Nemesis has adapted to your previous encounters.";
        } else if (avgMultiplier < 1.6) {
            return "Formidable - The Nemesis has significantly evolved its capabilities.";
        } else if (avgMultiplier < 2.0) {
            return "Overwhelming - The Nemesis has reached a dangerous level of power.";
        } else {
            return "Apocalyptic - The Nemesis has transcended its previous limitations.";
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisDifficulty = NemesisDifficulty;
}
