/**
 * Choice System
 * Manages player choices, rewards, and consequences that form the core roguelike progression
 */
class ChoiceSystem {
    constructor(scene) {
        this.scene = scene;

        // Database of upgrades, penalties, and choices
        this.upgrades = this.initializeUpgrades();
        this.penalties = this.initializePenalties();
        this.choices = this.initializeChoices();

        // Track choices made during this run
        this.choiceHistory = [];

        // Reference to player's current build
        this.playerBuild = {
            shipType: 'fighter',
            activeUpgrades: [],
            activePenalties: []
        };
    }

    /**
     * Generate a choice scenario with options
     * @param {string} choiceType - The type of choice to generate (standard, path, emergency, time_pressure, merchant, event)
     * @param {number} sectorNumber - The current sector number (for difficulty scaling)
     * @param {string} nodeType - The type of node (for themed choices)
     * @param {boolean} isTimePressure - Whether this is a time-pressure choice
     */
    generateChoice(choiceType = 'standard', sectorNumber = 1, nodeType = 'COMBAT', isTimePressure = false) {
        // Determine appropriate tier based on sector number
        const tier = sectorNumber <= 3 ? 1 : 2;

        // Get choice templates based on type and tier
        let availableChoices = this.choices.filter(choice =>
            choice.type === choiceType &&
            (!choice.tier || choice.tier <= tier)
        );

        // If no choices of the requested type are available, try to find any appropriate choices
        if (availableChoices.length === 0) {
            availableChoices = this.choices.filter(choice =>
                (!choice.tier || choice.tier <= tier)
            );
        }

        // If still no choices, use fallback
        if (availableChoices.length === 0) {
            return this.generateFallbackChoice();
        }

        // Weight choices by tier and node type
        const weightedChoices = availableChoices.map(choice => {
            let weight = 1;

            // Higher tier choices become more common in later sectors
            if (choice.tier === 2 && sectorNumber >= 3) {
                weight += (sectorNumber - 2) * 0.5; // Gradually increase weight
            }

            // Favor choices that match the node type
            if (nodeType === 'ELITE' && choice.tier === 2) {
                weight *= 2; // Elite nodes favor higher tier choices
            }
            if (nodeType === 'HAZARD' && choice.type === 'emergency') {
                weight *= 1.5; // Hazard nodes favor emergency choices
            }
            if (nodeType === 'MERCHANT' && choice.type === 'merchant') {
                weight *= 3; // Merchant nodes strongly favor merchant choices
            }
            if (nodeType === 'EVENT' && choice.type === 'event') {
                weight *= 3; // Event nodes strongly favor event choices
            }

            return { choice, weight };
        });

        // Select a choice based on weights
        const totalWeight = weightedChoices.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedChoice = weightedChoices[0].choice;

        for (const item of weightedChoices) {
            random -= item.weight;
            if (random <= 0) {
                selectedChoice = item.choice;
                break;
            }
        }

        // Create a copy of the template
        const choice = JSON.parse(JSON.stringify(selectedChoice));

        // Fill in dynamic options for each option
        choice.options.forEach(option => {
            // Generate appropriate upgrades/penalties for each option
            if (option.rewards) {
                option.rewards = this.generateRewards(option.rewards, this.playerBuild, sectorNumber);
            }

            if (option.penalties) {
                option.penalties = this.generatePenalties(option.penalties, this.playerBuild, sectorNumber);
            }
        });

        // Add time pressure properties if needed
        if (isTimePressure || choiceType === 'time_pressure' || choiceType === 'emergency') {
            // Determine the appropriate time limit based on choice type
            let timeLimit;
            let timeoutPenalty;

            if (choiceType === 'emergency' || nodeType === 'HAZARD') {
                timeLimit = CONSTANTS.TIME_PRESSURE.EMERGENCY_CHOICE_TIME;
                timeoutPenalty = CONSTANTS.TIME_PRESSURE.EMERGENCY_TIMEOUT_PENALTY;
            } else if (choiceType === 'time_pressure') {
                timeLimit = CONSTANTS.TIME_PRESSURE.CRITICAL_CHOICE_TIME;
                timeoutPenalty = CONSTANTS.TIME_PRESSURE.CRITICAL_TIMEOUT_PENALTY;
            } else {
                timeLimit = CONSTANTS.TIME_PRESSURE.STANDARD_CHOICE_TIME;
                timeoutPenalty = CONSTANTS.TIME_PRESSURE.DEFAULT_TIMEOUT_PENALTY;
            }

            // Scale time limit based on sector number (harder in later sectors)
            const scaleFactor = Math.max(0.6, 1 - (sectorNumber - 1) * 0.05);
            timeLimit = Math.floor(timeLimit * scaleFactor);

            // Add time pressure properties to the choice
            choice.isTimePressure = true;
            choice.timeLimit = timeLimit;
            choice.timeoutPenalty = timeoutPenalty;
            choice.timeoutOption = this.generateTimeoutOption(choiceType, timeoutPenalty);
        }

        return choice;
    }

    /**
     * Generate a fallback choice if no appropriate choices are available
     */
    generateFallbackChoice() {
        return {
            type: 'standard',
            title: 'Tactical Decision',
            description: 'You encounter a tactical decision point.',
            options: [
                {
                    text: 'Enhance Weapons',
                    description: 'Optimize your weapon systems at the cost of shield capacity.',
                    rewards: [
                        { type: 'fireRate', value: 30 }
                    ],
                    penalties: [
                        { type: 'shield', value: 10 }
                    ]
                },
                {
                    text: 'Reinforce Shields',
                    description: 'Strengthen your shields at the cost of engine power.',
                    rewards: [
                        { type: 'shield', value: 25 }
                    ],
                    penalties: [
                        { type: 'speed', value: 30 }
                    ]
                },
                {
                    text: 'Overcharge Engines',
                    description: 'Increase engine output at the cost of weapon effectiveness.',
                    rewards: [
                        { type: 'speed', value: 50 }
                    ],
                    penalties: [
                        { type: 'fireRate', value: 20 }
                    ]
                }
            ]
        };
    }

    /**
     * Generate specific rewards based on the reward type and player's current build
     * @param {Array} rewardTemplates - Templates for rewards to generate
     * @param {Object} playerBuild - The player's current build
     * @param {number} sectorNumber - The current sector number (for scaling rewards)
     * @returns {Array} Generated rewards
     */
    generateRewards(rewardTemplates, playerBuild, sectorNumber = 1) {
        const generatedRewards = [];

        // Get reward multiplier from scene if available
        const rewardMultiplier = this.scene.rewardMultiplier || 1.0;

        // Log if reward multiplier is applied
        if (rewardMultiplier !== 1.0) {
            console.log(`ChoiceSystem: Applying reward multiplier ${rewardMultiplier} to rewards`);
        }

        // Determine appropriate tier based on sector number
        const maxTier = sectorNumber <= 2 ? 1 : (sectorNumber <= 4 ? 2 : 3);

        rewardTemplates.forEach(template => {
            switch (template.type) {
                case 'weapon':
                    // If a specific weapon is requested, use that
                    if (template.value) {
                        const weaponInfo = this.upgrades.find(u => u.type === 'weapon' && u.value === template.value);
                        if (weaponInfo) {
                            generatedRewards.push({
                                type: 'weapon',
                                value: template.value,
                                name: weaponInfo.name,
                                description: weaponInfo.description,
                                tier: weaponInfo.tier
                            });
                            break;
                        }
                    }

                    // Otherwise, select a weapon the player doesn't already have
                    // Filter weapons by tier based on sector number
                    const availableWeapons = this.upgrades.filter(upgrade =>
                        upgrade.type === 'weapon' &&
                        upgrade.tier <= maxTier &&
                        !playerBuild.activeUpgrades.some(u => u.type === 'weapon' && u.value === upgrade.value)
                    );

                    if (availableWeapons.length > 0) {
                        // Weight weapons by tier - higher tiers are less common
                        const weightedWeapons = availableWeapons.map(weapon => {
                            let weight = 1;
                            if (weapon.tier === 1) weight = 3;
                            if (weapon.tier === 2) weight = 2;
                            if (weapon.tier === 3) weight = 1;

                            // Adjust weights based on sector
                            if (sectorNumber >= 3 && weapon.tier >= 2) weight += 1;
                            if (sectorNumber >= 5 && weapon.tier === 3) weight += 2;

                            return { weapon, weight };
                        });

                        // Select weapon based on weights
                        const totalWeight = weightedWeapons.reduce((sum, item) => sum + item.weight, 0);
                        let random = Math.random() * totalWeight;
                        let selectedWeapon = weightedWeapons[0].weapon;

                        for (const item of weightedWeapons) {
                            random -= item.weight;
                            if (random <= 0) {
                                selectedWeapon = item.weapon;
                                break;
                            }
                        }

                        generatedRewards.push({
                            type: 'weapon',
                            value: selectedWeapon.value,
                            name: selectedWeapon.name,
                            description: selectedWeapon.description,
                            tier: selectedWeapon.tier
                        });
                    } else {
                        // Fallback to weapon upgrade
                        const upgradeValue = 15 + (sectorNumber * 5); // Scale with sector
                        generatedRewards.push({
                            type: 'fireRate',
                            value: upgradeValue,
                            name: 'Weapon Tuning',
                            description: 'Increases fire rate by fine-tuning weapon systems.'
                        });
                    }
                    break;

                case 'statBoost':
                    // Generate a random stat boost scaled by sector
                    const statMultiplier = 1 + ((sectorNumber - 1) * 0.2); // 20% increase per sector

                    // Filter stat upgrades by tier based on sector number
                    const availableStats = this.upgrades.filter(upgrade =>
                        (upgrade.type === 'health' || upgrade.type === 'shield' ||
                         upgrade.type === 'speed' || upgrade.type === 'fireRate') &&
                        upgrade.tier <= maxTier
                    );

                    if (availableStats.length > 0) {
                        // Weight stats by tier - higher tiers are less common
                        const weightedStats = availableStats.map(stat => {
                            let weight = 1;
                            if (stat.tier === 1) weight = 3;
                            if (stat.tier === 2) weight = 2;
                            if (stat.tier === 3) weight = 1;

                            // Adjust weights based on sector
                            if (sectorNumber >= 3 && stat.tier >= 2) weight += 1;
                            if (sectorNumber >= 5 && stat.tier === 3) weight += 2;

                            return { stat, weight };
                        });

                        // Select stat based on weights
                        const totalWeight = weightedStats.reduce((sum, item) => sum + item.weight, 0);
                        let random = Math.random() * totalWeight;
                        let selectedStat = weightedStats[0].stat;

                        for (const item of weightedStats) {
                            random -= item.weight;
                            if (random <= 0) {
                                selectedStat = item.stat;
                                break;
                            }
                        }

                        // Apply sector scaling and reward multiplier to value
                        const scaledValue = Math.round(selectedStat.value * statMultiplier * rewardMultiplier);

                        generatedRewards.push({
                            type: selectedStat.type,
                            value: scaledValue,
                            name: selectedStat.name,
                            description: selectedStat.description,
                            tier: selectedStat.tier
                        });
                    } else {
                        // Fallback to basic stat boost with reward multiplier applied
                        const stats = [
                            { type: 'health', value: Math.round(25 * statMultiplier * rewardMultiplier), name: 'Hull Reinforcement', description: 'Increases maximum health.' },
                            { type: 'shield', value: Math.round(20 * statMultiplier * rewardMultiplier), name: 'Shield Amplifier', description: 'Increases maximum shield capacity.' },
                            { type: 'speed', value: Math.round(30 * statMultiplier * rewardMultiplier), name: 'Engine Boost', description: 'Increases movement speed.' },
                            { type: 'fireRate', value: Math.round(15 * statMultiplier * rewardMultiplier), name: 'Firing System Upgrade', description: 'Decreases time between shots.' }
                        ];

                        const selectedStat = stats[Math.floor(Math.random() * stats.length)];
                        generatedRewards.push(selectedStat);
                    }
                    break;

                case 'special':
                    // If a specific special is requested, use that
                    if (template.value) {
                        const specialInfo = this.upgrades.find(u => u.type === 'special' && u.value === template.value);
                        if (specialInfo) {
                            generatedRewards.push({
                                type: 'special',
                                value: template.value,
                                name: specialInfo.name,
                                description: specialInfo.description,
                                tier: specialInfo.tier
                            });
                            break;
                        }
                    }

                    // Otherwise, select a special ability based on tier
                    const availableSpecials = this.upgrades.filter(upgrade =>
                        upgrade.type === 'special' &&
                        upgrade.tier <= maxTier &&
                        !playerBuild.activeUpgrades.some(u => u.type === 'special' && u.value === upgrade.value)
                    );

                    if (availableSpecials.length > 0) {
                        // Weight specials by tier - higher tiers are less common
                        const weightedSpecials = availableSpecials.map(special => {
                            let weight = 1;
                            if (special.tier === 1) weight = 3;
                            if (special.tier === 2) weight = 2;
                            if (special.tier === 3) weight = 1;

                            // Adjust weights based on sector
                            if (sectorNumber >= 3 && special.tier >= 2) weight += 1;
                            if (sectorNumber >= 5 && special.tier === 3) weight += 2;

                            return { special, weight };
                        });

                        // Select special based on weights
                        const totalWeight = weightedSpecials.reduce((sum, item) => sum + item.weight, 0);
                        let random = Math.random() * totalWeight;
                        let selectedSpecial = weightedSpecials[0].special;

                        for (const item of weightedSpecials) {
                            random -= item.weight;
                            if (random <= 0) {
                                selectedSpecial = item.special;
                                break;
                            }
                        }

                        generatedRewards.push({
                            type: 'special',
                            value: selectedSpecial.value,
                            name: selectedSpecial.name,
                            description: selectedSpecial.description,
                            tier: selectedSpecial.tier
                        });
                    } else {
                        // Fallback to basic special
                        const specials = [
                            {
                                type: 'special',
                                value: 'energyConverter',
                                name: 'Energy Converter',
                                description: 'Converts excess shield energy to weapon power, increasing damage when shields are full.'
                            }
                        ];

                        const selectedSpecial = specials[Math.floor(Math.random() * specials.length)];
                        generatedRewards.push(selectedSpecial);
                    }
                    break;

                default:
                    // Just pass through directly specified rewards
                    generatedRewards.push(template);
            }
        });

        return generatedRewards;
    }

    /**
     * Generate specific penalties based on the penalty type and player's current build
     * @param {Array} penaltyTemplates - Templates for penalties to generate
     * @param {Object} playerBuild - The player's current build
     * @param {number} sectorNumber - The current sector number (for scaling penalties)
     * @returns {Array} Generated penalties
     */
    generatePenalties(penaltyTemplates, playerBuild, sectorNumber = 1) {
        const generatedPenalties = [];

        // Determine appropriate severity based on sector number
        let maxSeverity = 'minor';
        if (sectorNumber >= 3) maxSeverity = 'moderate';
        if (sectorNumber >= 5) maxSeverity = 'severe';

        penaltyTemplates.forEach(template => {
            switch (template.type) {
                case 'statReduction':
                    // If a specific stat reduction is requested, use that
                    if (template.value) {
                        generatedPenalties.push(template);
                        break;
                    }

                    // Filter penalties by severity based on sector number
                    let availablePenalties = this.penalties.filter(penalty =>
                        (penalty.type === 'health' || penalty.type === 'shield' ||
                         penalty.type === 'speed' || penalty.type === 'fireRate')
                    );

                    // Apply severity filter
                    if (maxSeverity === 'minor') {
                        availablePenalties = availablePenalties.filter(p => p.severity === 'minor');
                    } else if (maxSeverity === 'moderate') {
                        availablePenalties = availablePenalties.filter(p =>
                            p.severity === 'minor' || p.severity === 'moderate');
                    }

                    // Make sure we don't reduce a stat below minimum viable level
                    const viablePenalties = availablePenalties.filter(penalty => {
                        // Don't apply penalties that would make a stat too low
                        // This is simplified - in a real game, you'd check current values
                        return !playerBuild.activePenalties.some(p =>
                            p.type === penalty.type && p.value >= 50);
                    });

                    if (viablePenalties.length > 0) {
                        // Weight penalties by severity - more severe penalties are less common
                        const weightedPenalties = viablePenalties.map(penalty => {
                            let weight = 1;
                            if (penalty.severity === 'minor') weight = 3;
                            if (penalty.severity === 'moderate') weight = 2;
                            if (penalty.severity === 'severe') weight = 1;

                            // Adjust weights based on sector
                            if (sectorNumber >= 3 && penalty.severity === 'moderate') weight += 1;
                            if (sectorNumber >= 5 && penalty.severity === 'severe') weight += 1;

                            return { penalty, weight };
                        });

                        // Select penalty based on weights
                        const totalWeight = weightedPenalties.reduce((sum, item) => sum + item.weight, 0);
                        let random = Math.random() * totalWeight;
                        let selectedPenalty = weightedPenalties[0].penalty;

                        for (const item of weightedPenalties) {
                            random -= item.weight;
                            if (random <= 0) {
                                selectedPenalty = item.penalty;
                                break;
                            }
                        }

                        generatedPenalties.push(selectedPenalty);
                    } else {
                        // Fallback to a minor penalty
                        generatedPenalties.push({
                            type: 'fireRate',
                            value: 10,
                            name: 'Minor System Lag',
                            description: 'Slightly increases time between shots.',
                            severity: 'minor'
                        });
                    }
                    break;

                case 'weakness':
                    // If a specific weakness is requested, use that
                    if (template.value) {
                        const weaknessInfo = this.penalties.find(p =>
                            p.type === 'weakness' && p.value === template.value);

                        if (weaknessInfo) {
                            generatedPenalties.push(weaknessInfo);
                            break;
                        }
                    }

                    // Filter weaknesses by severity based on sector number
                    let availableWeaknesses = this.penalties.filter(penalty =>
                        penalty.type === 'weakness'
                    );

                    // Apply severity filter
                    if (maxSeverity === 'minor') {
                        availableWeaknesses = availableWeaknesses.filter(p => p.severity === 'minor');
                    } else if (maxSeverity === 'moderate') {
                        availableWeaknesses = availableWeaknesses.filter(p =>
                            p.severity === 'minor' || p.severity === 'moderate');
                    }

                    // Make sure we don't apply the same weakness twice
                    availableWeaknesses = availableWeaknesses.filter(weakness => {
                        return !playerBuild.activePenalties.some(p =>
                            p.type === 'weakness' && p.value === weakness.value);
                    });

                    if (availableWeaknesses.length > 0) {
                        // Weight weaknesses by severity - more severe weaknesses are less common
                        const weightedWeaknesses = availableWeaknesses.map(weakness => {
                            let weight = 1;
                            if (weakness.severity === 'minor') weight = 3;
                            if (weakness.severity === 'moderate') weight = 2;
                            if (weakness.severity === 'severe') weight = 1;

                            // Adjust weights based on sector
                            if (sectorNumber >= 3 && weakness.severity === 'moderate') weight += 1;
                            if (sectorNumber >= 5 && weakness.severity === 'severe') weight += 1;

                            return { weakness, weight };
                        });

                        // Select weakness based on weights
                        const totalWeight = weightedWeaknesses.reduce((sum, item) => sum + item.weight, 0);
                        let random = Math.random() * totalWeight;
                        let selectedWeakness = weightedWeaknesses[0].weakness;

                        for (const item of weightedWeaknesses) {
                            random -= item.weight;
                            if (random <= 0) {
                                selectedWeakness = item.weakness;
                                break;
                            }
                        }

                        generatedPenalties.push(selectedWeakness);
                    } else {
                        // Fallback to a basic weakness
                        generatedPenalties.push({
                            type: 'weakness',
                            value: 'asteroidVulnerability',
                            name: 'Fragile Hull Plating',
                            description: 'Take increased damage from asteroid collisions.',
                            severity: 'moderate'
                        });
                    }
                    break;

                case 'specialWeakness':
                    // Legacy case - redirect to weakness
                    this.generatePenalties([{ type: 'weakness' }], playerBuild, sectorNumber)
                        .forEach(penalty => generatedPenalties.push(penalty));
                    break;

                default:
                    // Just pass through directly specified penalties
                    generatedPenalties.push(template);
            }
        });

        return generatedPenalties;
    }

    /**
     * Generate a timeout option for time-pressure choices
     * @param {string} choiceType - The type of choice
     * @param {Object} penalty - The penalty to apply on timeout
     * @returns {Object} The timeout option
     */
    generateTimeoutOption(choiceType, penalty) {
        // Create different timeout options based on choice type
        let timeoutOption = {
            text: 'Time Expired',
            description: 'You failed to make a decision in time.',
            penalties: [penalty]
        };

        // Add more severe consequences for emergency choices
        if (choiceType === 'emergency') {
            timeoutOption.description = 'The emergency situation worsened due to your indecision.';
            // Add an additional penalty
            timeoutOption.penalties.push({ type: 'speed', value: 20 });
        } else if (choiceType === 'time_pressure') {
            timeoutOption.description = 'The critical situation has resulted in severe damage to your ship.';
            // Add multiple additional penalties
            timeoutOption.penalties.push({ type: 'speed', value: 30 });
            timeoutOption.penalties.push({ type: 'fireRate', value: 20 });
        }

        return timeoutOption;
    }

    /**
     * Apply choice consequences to the player
     * @param {number} choiceIndex - The index of the chosen option
     * @param {Object} choice - The choice object
     * @param {boolean} isTimeout - Whether this is a timeout application
     */
    applyChoice(choiceIndex, choice, isTimeout = false) {
        // If this is a timeout, use the timeout option
        const selectedOption = isTimeout ? choice.timeoutOption : choice.options[choiceIndex];

        if (!selectedOption) {
            console.error('Invalid choice option:', choiceIndex, choice);
            return { rewards: [], penalties: [] };
        }

        // Apply cost modifier for merchant choices
        if (choice.type === 'merchant' && this.scene.costModifier) {
            // Log the cost adjustment
            console.log(`ChoiceSystem: Applying cost modifier ${this.scene.costModifier} to merchant choice`);

            // For merchant choices, adjust the penalties (costs) based on the cost modifier
            if (selectedOption.penalties) {
                selectedOption.penalties.forEach(penalty => {
                    // Only adjust numeric values
                    if (typeof penalty.value === 'number') {
                        // Round to nearest integer for cleaner values
                        penalty.value = Math.round(penalty.value * this.scene.costModifier);
                    }
                });
            }
        }

        // Record the choice for history
        this.choiceHistory.push({
            title: choice.title,
            optionChosen: selectedOption.text,
            rewards: selectedOption.rewards,
            penalties: selectedOption.penalties,
            isTimeout: isTimeout
        });

        // Apply rewards
        if (selectedOption.rewards) {
            selectedOption.rewards.forEach(reward => {
                // Add to player's build record
                this.playerBuild.activeUpgrades.push(reward);

                // Apply to player ship if it exists
                if (this.scene.player && this.scene.player.applyUpgrade) {
                    this.scene.player.applyUpgrade(reward);
                }
            });
        }

        // Apply penalties
        if (selectedOption.penalties) {
            selectedOption.penalties.forEach(penalty => {
                // Add to player's build record
                this.playerBuild.activePenalties.push(penalty);

                // Apply to player ship if it exists
                if (this.scene.player && this.scene.player.applyPenalty) {
                    this.scene.player.applyPenalty(penalty);
                }
            });
        }

        // Return the consequences for UI feedback
        return {
            rewards: selectedOption.rewards || [],
            penalties: selectedOption.penalties || [],
            isTimeout: isTimeout
        };
    }

    /**
     * Initialize the database of upgrades
     */
    initializeUpgrades() {
        return [
            // Weapons - Tier 1
            {
                type: 'weapon',
                value: 'BASIC_LASER',
                name: 'Basic Laser Cannon',
                description: 'Standard issue laser weapon with balanced properties.',
                tier: 1
            },
            {
                type: 'weapon',
                value: 'DUAL_CANNON',
                name: 'Dual Cannon',
                description: 'Fires two projectiles in quick succession with good accuracy.',
                tier: 1
            },
            // Weapons - Tier 2
            {
                type: 'weapon',
                value: 'SPREAD_SHOT',
                name: 'Tri-Beam Array',
                description: 'Fires three beams in a spread pattern for wider coverage.',
                tier: 2
            },
            {
                type: 'weapon',
                value: 'PLASMA_BOLT',
                name: 'Plasma Accelerator',
                description: 'Fires high-damage plasma projectiles at a slower rate.',
                tier: 2
            },
            {
                type: 'weapon',
                value: 'LASER_BEAM',
                name: 'Continuous Laser Beam',
                description: 'Fires a continuous beam that deals damage over time.',
                tier: 2
            },
            // Weapons - Tier 3
            {
                type: 'weapon',
                value: 'HOMING_MISSILE',
                name: 'Tracking Missile Launcher',
                description: 'Launches missiles that seek out nearby enemies.',
                tier: 3
            },
            {
                type: 'weapon',
                value: 'QUANTUM_BEAM',
                name: 'Quantum Beam Emitter',
                description: 'Fires a continuous beam that penetrates through enemies.',
                tier: 3
            },
            {
                type: 'weapon',
                value: 'SCATTER_BOMB',
                name: 'Scatter Bomb Launcher',
                description: 'Launches bombs that explode into multiple projectiles.',
                tier: 3
            },

            // Hull Upgrades - Tier 1
            {
                type: 'health',
                value: 25,
                name: 'Hull Reinforcement I',
                description: 'Basic reinforced hull plating increases maximum health.',
                tier: 1
            },
            {
                type: 'health',
                value: 35,
                name: 'Reactive Armor Plating',
                description: 'Armor that hardens on impact, increasing maximum health.',
                tier: 1
            },
            // Hull Upgrades - Tier 2
            {
                type: 'health',
                value: 50,
                name: 'Hull Reinforcement II',
                description: 'Advanced composite plating significantly increases maximum health.',
                tier: 2
            },
            {
                type: 'health',
                value: 60,
                name: 'Ablative Armor System',
                description: 'Multi-layered armor that absorbs damage, significantly increasing maximum health.',
                tier: 2
            },
            // Hull Upgrades - Tier 3
            {
                type: 'health',
                value: 100,
                name: 'Adaptive Hull Matrix',
                description: 'Self-repairing nanomaterial hull dramatically increases maximum health.',
                tier: 3
            },
            {
                type: 'health',
                value: 120,
                name: 'Quantum-Locked Hull',
                description: 'Hull reinforced with quantum-locked materials, dramatically increasing maximum health.',
                tier: 3
            },

            // Shield Upgrades - Tier 1
            {
                type: 'shield',
                value: 20,
                name: 'Shield Amplifier I',
                description: 'Enhanced shield generators increase maximum shield capacity.',
                tier: 1
            },
            {
                type: 'shield',
                value: 25,
                name: 'Deflector Array',
                description: 'Specialized shield geometry increases maximum shield capacity.',
                tier: 1
            },
            // Shield Upgrades - Tier 2
            {
                type: 'shield',
                value: 40,
                name: 'Shield Amplifier II',
                description: 'Advanced shield harmonics significantly increase maximum shield capacity.',
                tier: 2
            },
            {
                type: 'shield',
                value: 50,
                name: 'Resonance Barrier',
                description: 'Shield that resonates at enemy weapon frequencies, significantly increasing maximum shield capacity.',
                tier: 2
            },
            // Shield Upgrades - Tier 3
            {
                type: 'shield',
                value: 80,
                name: 'Quantum Shield Matrix',
                description: 'Experimental shield technology dramatically increases maximum shield capacity.',
                tier: 3
            },
            {
                type: 'shield',
                value: 100,
                name: 'Dimensional Barrier',
                description: 'Shield that exists partially in another dimension, dramatically increasing maximum shield capacity.',
                tier: 3
            },

            // Engine Upgrades - Tier 1
            {
                type: 'speed',
                value: 30,
                name: 'Engine Boost I',
                description: 'Upgraded engine components increase overall speed.',
                tier: 1
            },
            {
                type: 'speed',
                value: 40,
                name: 'Thruster Optimization',
                description: 'Recalibrated thrusters increase overall speed.',
                tier: 1
            },
            // Engine Upgrades - Tier 2
            {
                type: 'speed',
                value: 60,
                name: 'Engine Boost II',
                description: 'Advanced propulsion system significantly increases overall speed.',
                tier: 2
            },
            {
                type: 'speed',
                value: 70,
                name: 'Plasma Injection System',
                description: 'High-energy plasma injectors significantly increase overall speed.',
                tier: 2
            },
            // Engine Upgrades - Tier 3
            {
                type: 'speed',
                value: 100,
                name: 'Quantum Propulsion',
                description: 'Experimental drive technology dramatically increases overall speed.',
                tier: 3
            },
            {
                type: 'speed',
                value: 120,
                name: 'Subspace Drive',
                description: 'Engine that warps local space-time, dramatically increasing overall speed.',
                tier: 3
            },

            // Weapon System Upgrades - Tier 1
            {
                type: 'fireRate',
                value: 15,
                name: 'Firing System Upgrade I',
                description: 'Optimized weapon cooling decreases time between shots.',
                tier: 1
            },
            {
                type: 'fireRate',
                value: 20,
                name: 'Rapid Cycling Mechanism',
                description: 'Enhanced weapon cycling decreases time between shots.',
                tier: 1
            },
            // Weapon System Upgrades - Tier 2
            {
                type: 'fireRate',
                value: 30,
                name: 'Firing System Upgrade II',
                description: 'Advanced cooling system significantly decreases time between shots.',
                tier: 2
            },
            {
                type: 'fireRate',
                value: 40,
                name: 'Accelerated Weapon Matrix',
                description: 'Synchronized weapon systems significantly decrease time between shots.',
                tier: 2
            },
            // Weapon System Upgrades - Tier 3
            {
                type: 'fireRate',
                value: 50,
                name: 'Quantum Targeting Matrix',
                description: 'Experimental weapon system dramatically decreases time between shots.',
                tier: 3
            },
            {
                type: 'fireRate',
                value: 60,
                name: 'Temporal Acceleration Field',
                description: 'Localized time dilation dramatically decreases time between shots.',
                tier: 3
            },

            // Damage Multiplier Upgrades - Tier 1
            {
                type: 'damageMultiplier',
                value: 0.1,
                name: 'Weapon Calibration',
                description: 'Fine-tuned weapon systems increase damage output by 10%.',
                tier: 1
            },
            // Damage Multiplier Upgrades - Tier 2
            {
                type: 'damageMultiplier',
                value: 0.25,
                name: 'Overcharged Weapons',
                description: 'Overcharged power systems increase damage output by 25%.',
                tier: 2
            },
            // Damage Multiplier Upgrades - Tier 3
            {
                type: 'damageMultiplier',
                value: 0.5,
                name: 'Quantum Amplification',
                description: 'Quantum-enhanced weapon systems increase damage output by 50%.',
                tier: 3
            },

            // Shield Regeneration Upgrades - Tier 1
            {
                type: 'shieldRegenRate',
                value: 0.2,
                name: 'Shield Capacitor',
                description: 'Enhanced shield capacitors improve shield regeneration rate.',
                tier: 1
            },
            // Shield Regeneration Upgrades - Tier 2
            {
                type: 'shieldRegenRate',
                value: 0.4,
                name: 'Advanced Shield Capacitor',
                description: 'Advanced shield capacitors significantly improve shield regeneration rate.',
                tier: 2
            },
            // Shield Regeneration Upgrades - Tier 3
            {
                type: 'shieldRegenRate',
                value: 0.8,
                name: 'Quantum Shield Capacitor',
                description: 'Experimental shield capacitors dramatically improve shield regeneration rate.',
                tier: 3
            },

            // Cooldown Reduction Upgrades - Tier 1
            {
                type: 'cooldownReduction',
                value: 0.1,
                name: 'Coolant Injection System',
                description: 'Improved cooling reduces ability cooldowns by 10%.',
                tier: 1
            },
            // Cooldown Reduction Upgrades - Tier 2
            {
                type: 'cooldownReduction',
                value: 0.2,
                name: 'Advanced Coolant System',
                description: 'Advanced cooling significantly reduces ability cooldowns by 20%.',
                tier: 2
            },
            // Cooldown Reduction Upgrades - Tier 3
            {
                type: 'cooldownReduction',
                value: 0.3,
                name: 'Cryogenic Cooling Matrix',
                description: 'Experimental cooling dramatically reduces ability cooldowns by 30%.',
                tier: 3
            },

            // Critical Chance Upgrades - Tier 1
            {
                type: 'criticalChance',
                value: 0.05,
                name: 'Targeting Computer',
                description: 'Enhanced targeting increases critical hit chance by 5%.',
                tier: 1
            },
            // Critical Chance Upgrades - Tier 2
            {
                type: 'criticalChance',
                value: 0.1,
                name: 'Advanced Targeting System',
                description: 'Advanced targeting significantly increases critical hit chance by 10%.',
                tier: 2
            },
            // Critical Chance Upgrades - Tier 3
            {
                type: 'criticalChance',
                value: 0.2,
                name: 'Quantum Targeting System',
                description: 'Experimental targeting dramatically increases critical hit chance by 20%.',
                tier: 3
            },

            // Damage Reduction Upgrades - Tier 1
            {
                type: 'damageReduction',
                value: 0.1,
                name: 'Structural Reinforcement',
                description: 'Reinforced structure reduces incoming damage by 10%.',
                tier: 1
            },
            // Damage Reduction Upgrades - Tier 2
            {
                type: 'damageReduction',
                value: 0.2,
                name: 'Advanced Structural Matrix',
                description: 'Advanced structural reinforcement reduces incoming damage by 20%.',
                tier: 2
            },
            // Damage Reduction Upgrades - Tier 3
            {
                type: 'damageReduction',
                value: 0.3,
                name: 'Quantum Structural Field',
                description: 'Experimental structural field reduces incoming damage by 30%.',
                tier: 3
            },

            // Ammo Regeneration Upgrades - Tier 1
            {
                type: 'ammoRegen',
                value: 0.2,
                name: 'Ammo Synthesizer',
                description: 'Basic synthesizer increases ammo regeneration rate.',
                tier: 1
            },
            // Ammo Regeneration Upgrades - Tier 2
            {
                type: 'ammoRegen',
                value: 0.4,
                name: 'Advanced Ammo Synthesizer',
                description: 'Advanced synthesizer significantly increases ammo regeneration rate.',
                tier: 2
            },
            // Ammo Regeneration Upgrades - Tier 3
            {
                type: 'ammoRegen',
                value: 0.8,
                name: 'Quantum Ammo Synthesizer',
                description: 'Experimental synthesizer dramatically increases ammo regeneration rate.',
                tier: 3
            },

            // Projectile Size Upgrades - Tier 1
            {
                type: 'projectileSize',
                value: 0.2,
                name: 'Expanded Munitions',
                description: 'Enlarged projectiles increase hit area by 20%.',
                tier: 1
            },
            // Projectile Size Upgrades - Tier 2
            {
                type: 'projectileSize',
                value: 0.4,
                name: 'Heavy Munitions',
                description: 'Significantly enlarged projectiles increase hit area by 40%.',
                tier: 2
            },
            // Projectile Size Upgrades - Tier 3
            {
                type: 'projectileSize',
                value: 0.6,
                name: 'Massive Munitions',
                description: 'Dramatically enlarged projectiles increase hit area by 60%.',
                tier: 3
            },

            // Projectile Speed Upgrades - Tier 1
            {
                type: 'projectileSpeed',
                value: 0.2,
                name: 'Accelerated Munitions',
                description: 'Enhanced propellant increases projectile speed by 20%.',
                tier: 1
            },
            // Projectile Speed Upgrades - Tier 2
            {
                type: 'projectileSpeed',
                value: 0.4,
                name: 'High-Velocity Munitions',
                description: 'Advanced propellant significantly increases projectile speed by 40%.',
                tier: 2
            },
            // Projectile Speed Upgrades - Tier 3
            {
                type: 'projectileSpeed',
                value: 0.6,
                name: 'Hypersonic Munitions',
                description: 'Experimental propellant dramatically increases projectile speed by 60%.',
                tier: 3
            },

            // Special Upgrades - Tier 1
            {
                type: 'special',
                value: 'energyConverter',
                name: 'Energy Converter',
                description: 'Converts excess shield energy to weapon power, increasing damage when shields are full.',
                tier: 1
            },
            {
                type: 'special',
                value: 'temporaryInvulnerability',
                name: 'Emergency Shield Burst',
                description: 'Provides brief invulnerability when activated.',
                tier: 1
            },
            // Special Upgrades - Tier 2
            {
                type: 'special',
                value: 'shieldRecharge',
                name: 'Shield Regenerator',
                description: 'Advanced shield technology allows shields to recharge over time.',
                tier: 2
            },
            {
                type: 'special',
                value: 'emergencyThrusters',
                name: 'Emergency Thrusters',
                description: 'Automatically boosts speed when health is low.',
                tier: 2
            },
            {
                type: 'special',
                value: 'powerSurge',
                name: 'Power Surge',
                description: 'Temporarily boosts weapon damage when activated.',
                tier: 2
            },
            // Special Upgrades - Tier 3
            {
                type: 'special',
                value: 'secondaryWeapon',
                name: 'Secondary Weapon System',
                description: 'Installs a secondary weapon turret that fires automatically.',
                tier: 3
            },
            {
                type: 'special',
                value: 'pointDefense',
                name: 'Point Defense System',
                description: 'Automated defense system shoots down some enemy projectiles.',
                tier: 3
            },
            {
                type: 'special',
                value: 'phaseShift',
                name: 'Phase Shift Device',
                description: 'Briefly makes your ship intangible when taking fatal damage. Has a long cooldown.',
                tier: 3
            },
            {
                type: 'special',
                value: 'multiShot',
                name: 'Multi-Shot System',
                description: 'Weapons occasionally fire multiple projectiles at once.',
                tier: 3
            },
            {
                type: 'special',
                value: 'projectilePenetration',
                name: 'Penetrator Rounds',
                description: 'Projectiles can pass through enemies, hitting multiple targets.',
                tier: 3
            },
            {
                type: 'special',
                value: 'shieldBurst',
                name: 'Shield Burst Generator',
                description: 'Releases a damaging energy wave when shields are depleted.',
                tier: 3
            }
        ];
    }

    /**
     * Initialize the database of penalties
     */
    initializePenalties() {
        return [
            // Hull Penalties - Minor
            {
                type: 'health',
                value: 10,
                name: 'Minor Hull Damage',
                description: 'Minor structural damage decreases maximum health.',
                severity: 'minor'
            },
            {
                type: 'health',
                value: 15,
                name: 'Hull Micro-fractures',
                description: 'Small cracks in the hull structure decrease maximum health.',
                severity: 'minor'
            },
            // Hull Penalties - Moderate
            {
                type: 'health',
                value: 25,
                name: 'Moderate Hull Damage',
                description: 'Significant structural damage decreases maximum health.',
                severity: 'moderate'
            },
            {
                type: 'health',
                value: 35,
                name: 'Compromised Hull Integrity',
                description: 'Weakened structural supports significantly decrease maximum health.',
                severity: 'moderate'
            },
            // Hull Penalties - Severe
            {
                type: 'health',
                value: 50,
                name: 'Severe Hull Damage',
                description: 'Critical structural damage significantly decreases maximum health.',
                severity: 'severe'
            },
            {
                type: 'health',
                value: 70,
                name: 'Catastrophic Hull Failure',
                description: 'Major breaches in hull integrity critically decrease maximum health.',
                severity: 'severe'
            },

            // Shield Penalties - Minor
            {
                type: 'shield',
                value: 15,
                name: 'Minor Shield Interference',
                description: 'Minor power fluctuations decrease maximum shield capacity.',
                severity: 'minor'
            },
            {
                type: 'shield',
                value: 20,
                name: 'Shield Emitter Misalignment',
                description: 'Misaligned emitters decrease maximum shield capacity.',
                severity: 'minor'
            },
            // Shield Penalties - Moderate
            {
                type: 'shield',
                value: 30,
                name: 'Moderate Shield Interference',
                description: 'Significant power fluctuations decrease maximum shield capacity.',
                severity: 'moderate'
            },
            {
                type: 'shield',
                value: 40,
                name: 'Shield Generator Damage',
                description: 'Damaged generator components significantly decrease maximum shield capacity.',
                severity: 'moderate'
            },
            // Shield Penalties - Severe
            {
                type: 'shield',
                value: 60,
                name: 'Severe Shield Interference',
                description: 'Critical power fluctuations significantly decrease maximum shield capacity.',
                severity: 'severe'
            },
            {
                type: 'shield',
                value: 80,
                name: 'Shield Matrix Collapse',
                description: 'Collapsed shield matrix critically decreases maximum shield capacity.',
                severity: 'severe'
            },

            // Engine Penalties - Minor
            {
                type: 'speed',
                value: 25,
                name: 'Minor Engine Strain',
                description: 'Minor engine degradation decreases movement speed.',
                severity: 'minor'
            },
            {
                type: 'speed',
                value: 35,
                name: 'Thruster Misalignment',
                description: 'Misaligned thrusters decrease movement speed.',
                severity: 'minor'
            },
            // Engine Penalties - Moderate
            {
                type: 'speed',
                value: 50,
                name: 'Moderate Engine Strain',
                description: 'Significant engine degradation decreases movement speed.',
                severity: 'moderate'
            },
            {
                type: 'speed',
                value: 65,
                name: 'Propulsion System Damage',
                description: 'Damaged propulsion components significantly decrease movement speed.',
                severity: 'moderate'
            },
            // Engine Penalties - Severe
            {
                type: 'speed',
                value: 100,
                name: 'Severe Engine Strain',
                description: 'Critical engine degradation significantly decreases movement speed.',
                severity: 'severe'
            },
            {
                type: 'speed',
                value: 120,
                name: 'Engine Core Meltdown',
                description: 'Overheated engine core critically decreases movement speed.',
                severity: 'severe'
            },

            // Weapon Penalties - Minor
            {
                type: 'fireRate',
                value: 30,
                name: 'Minor Weapon Destabilization',
                description: 'Minor weapon system instability increases time between shots.',
                severity: 'minor'
            },
            {
                type: 'fireRate',
                value: 40,
                name: 'Targeting System Glitch',
                description: 'Targeting computer glitches increase time between shots.',
                severity: 'minor'
            },
            // Weapon Penalties - Moderate
            {
                type: 'fireRate',
                value: 60,
                name: 'Moderate Weapon Destabilization',
                description: 'Significant weapon system instability increases time between shots.',
                severity: 'moderate'
            },
            {
                type: 'fireRate',
                value: 80,
                name: 'Weapon Capacitor Damage',
                description: 'Damaged weapon capacitors significantly increase time between shots.',
                severity: 'moderate'
            },
            // Weapon Penalties - Severe
            {
                type: 'fireRate',
                value: 120,
                name: 'Severe Weapon Destabilization',
                description: 'Critical weapon system instability significantly increases time between shots.',
                severity: 'severe'
            },
            {
                type: 'fireRate',
                value: 150,
                name: 'Weapon System Failure',
                description: 'Failed weapon systems critically increase time between shots.',
                severity: 'severe'
            },

            // Damage Multiplier Penalties - Minor to Severe
            {
                type: 'damageMultiplier',
                value: 0.1,
                name: 'Weapon Power Fluctuation',
                description: 'Power fluctuations reduce weapon damage output by 10%.',
                severity: 'minor'
            },
            {
                type: 'damageMultiplier',
                value: 0.2,
                name: 'Weapon Alignment Failure',
                description: 'Misaligned weapon components reduce damage output by 20%.',
                severity: 'moderate'
            },
            {
                type: 'damageMultiplier',
                value: 0.3,
                name: 'Critical Weapon Malfunction',
                description: 'Severe weapon malfunctions reduce damage output by 30%.',
                severity: 'severe'
            },

            // Ammo Capacity Penalties - Minor to Severe
            {
                type: 'ammoCapacity',
                value: 10,
                name: 'Ammo Storage Damage',
                description: 'Damaged ammo storage reduces maximum ammo capacity.',
                severity: 'minor'
            },
            {
                type: 'ammoCapacity',
                value: 25,
                name: 'Ammo Fabricator Malfunction',
                description: 'Malfunctioning fabricators significantly reduce maximum ammo capacity.',
                severity: 'moderate'
            },
            {
                type: 'ammoCapacity',
                value: 40,
                name: 'Critical Ammo System Failure',
                description: 'Failed ammo systems severely reduce maximum ammo capacity.',
                severity: 'severe'
            },

            // Cooldown Increase Penalties - Minor to Severe
            {
                type: 'cooldownIncrease',
                value: 0.2,
                name: 'Cooling System Damage',
                description: 'Damaged cooling systems increase ability cooldowns by 20%.',
                severity: 'minor'
            },
            {
                type: 'cooldownIncrease',
                value: 0.4,
                name: 'Coolant Leak',
                description: 'Leaking coolant significantly increases ability cooldowns by 40%.',
                severity: 'moderate'
            },
            {
                type: 'cooldownIncrease',
                value: 0.6,
                name: 'Cooling System Failure',
                description: 'Failed cooling systems severely increase ability cooldowns by 60%.',
                severity: 'severe'
            },

            // Projectile Size Penalties - Minor to Severe
            {
                type: 'projectileSize',
                value: 0.1,
                name: 'Munition Compressor Damage',
                description: 'Damaged compressors reduce projectile size by 10%.',
                severity: 'minor'
            },
            {
                type: 'projectileSize',
                value: 0.2,
                name: 'Munition Fabrication Error',
                description: 'Fabrication errors significantly reduce projectile size by 20%.',
                severity: 'moderate'
            },
            {
                type: 'projectileSize',
                value: 0.3,
                name: 'Critical Munition Failure',
                description: 'Severe munition failures reduce projectile size by 30%.',
                severity: 'severe'
            },

            // Projectile Speed Penalties - Minor to Severe
            {
                type: 'projectileSpeed',
                value: 0.1,
                name: 'Propellant Degradation',
                description: 'Degraded propellant reduces projectile speed by 10%.',
                severity: 'minor'
            },
            {
                type: 'projectileSpeed',
                value: 0.2,
                name: 'Accelerator Damage',
                description: 'Damaged accelerators significantly reduce projectile speed by 20%.',
                severity: 'moderate'
            },
            {
                type: 'projectileSpeed',
                value: 0.3,
                name: 'Propulsion System Failure',
                description: 'Failed propulsion systems severely reduce projectile speed by 30%.',
                severity: 'severe'
            },

            // Critical Vulnerability Penalties - Minor to Severe
            {
                type: 'criticalVulnerability',
                value: 0.05,
                name: 'Hull Weak Points',
                description: 'Structural weak points increase chance of taking critical damage by 5%.',
                severity: 'minor'
            },
            {
                type: 'criticalVulnerability',
                value: 0.1,
                name: 'Exposed Power Conduits',
                description: 'Exposed conduits significantly increase chance of taking critical damage by 10%.',
                severity: 'moderate'
            },
            {
                type: 'criticalVulnerability',
                value: 0.2,
                name: 'Critical System Exposure',
                description: 'Exposed critical systems severely increase chance of taking critical damage by 20%.',
                severity: 'severe'
            },

            // System Failure Penalties - Various Severities
            {
                type: 'systemFailure',
                value: 'weaponMalfunction',
                name: 'Weapon Malfunction',
                description: 'Weapons occasionally jam during combat.',
                severity: 'moderate'
            },
            {
                type: 'systemFailure',
                value: 'shieldFluctuation',
                name: 'Shield Fluctuation',
                description: 'Shields occasionally flicker when hit.',
                severity: 'moderate'
            },
            {
                type: 'systemFailure',
                value: 'engineStutter',
                name: 'Engine Stutter',
                description: 'Engines occasionally stutter during movement.',
                severity: 'moderate'
            },
            {
                type: 'systemFailure',
                value: 'powerSurges',
                name: 'Power Core Instability',
                description: 'Unstable power core causes random system failures.',
                severity: 'severe'
            },
            {
                type: 'systemFailure',
                value: 'sensorGlitches',
                name: 'Sensor Array Damage',
                description: 'Damaged sensors occasionally show false readings.',
                severity: 'moderate'
            },

            // Environmental Weaknesses
            {
                type: 'weakness',
                value: 'asteroidVulnerability',
                name: 'Fragile Hull Plating',
                description: 'Weakened hull plating causes increased damage from asteroid collisions.',
                severity: 'moderate'
            },
            {
                type: 'weakness',
                value: 'radiationVulnerability',
                name: 'Radiation Shielding Failure',
                description: 'Damaged radiation shielding causes increased damage in radiation zones.',
                severity: 'moderate'
            },
            {
                type: 'weakness',
                value: 'thermalVulnerability',
                name: 'Thermal Regulation Failure',
                description: 'Failed thermal systems cause increased damage in extreme temperature zones.',
                severity: 'moderate'
            },

            // Combat Weaknesses
            {
                type: 'weakness',
                value: 'enemyAccuracy',
                name: 'Targeting Beacon Malfunction',
                description: 'Malfunctioning stealth systems make enemy targeting more accurate.',
                severity: 'moderate'
            },
            {
                type: 'weakness',
                value: 'eliteVulnerability',
                name: 'Elite Enemy Vulnerability',
                description: 'Ship systems are particularly vulnerable to elite enemy weapons.',
                severity: 'severe'
            },
            {
                type: 'weakness',
                value: 'bossVulnerability',
                name: 'Boss Weapon Vulnerability',
                description: 'Ship defenses are particularly vulnerable to boss weapons.',
                severity: 'severe'
            },

            // System Weaknesses
            {
                type: 'weakness',
                value: 'shieldDisruption',
                name: 'Shield Harmonics Flaw',
                description: 'Shield synchronization issues extend recharge time after damage.',
                severity: 'moderate'
            },
            {
                type: 'weakness',
                value: 'weaponOverheat',
                name: 'Weapon Cooling System Failure',
                description: 'Weapons have a chance to temporarily overheat after extended firing.',
                severity: 'moderate'
            },
            {
                type: 'weakness',
                value: 'engineStall',
                name: 'Engine Ignition Failure',
                description: 'Engines have a small chance to temporarily stall during rapid maneuvers.',
                severity: 'severe'
            },
            {
                type: 'weakness',
                value: 'ammoLeakage',
                name: 'Ammo Storage Leak',
                description: 'Ammo occasionally leaks, reducing available ammunition during combat.',
                severity: 'moderate'
            },

            // Critical Weaknesses
            {
                type: 'weakness',
                value: 'systemInstability',
                name: 'Critical System Instability',
                description: 'All ship systems have a small chance to temporarily fail under stress.',
                severity: 'severe'
            },
            {
                type: 'weakness',
                value: 'powerFluctuation',
                name: 'Power Core Fluctuation',
                description: 'Ship occasionally experiences power surges that temporarily disable shields.',
                severity: 'severe'
            },
            {
                type: 'weakness',
                value: 'cascadingFailure',
                name: 'Cascading System Failure',
                description: 'When one system fails, others have an increased chance of failing as well.',
                severity: 'severe'
            }
        ];
    }

    /**
     * Initialize the database of choice templates
     */
    initializeChoices() {
        return [
            // Standard upgrade choices - Tier 1
            {
                type: 'standard',
                tier: 1,
                title: 'Ship Systems Upgrade',
                description: 'You discover an upgrade station with various enhancements available.',
                options: [
                    {
                        text: 'Weapon Systems',
                        description: 'Enhance your offensive capabilities.',
                        rewards: [
                            { type: 'weapon' }
                        ]
                    },
                    {
                        text: 'Defense Systems',
                        description: 'Reinforce your protective systems.',
                        rewards: [
                            { type: 'shield', value: 20 }
                        ]
                    },
                    {
                        text: 'Engine Systems',
                        description: 'Improve your ship\'s maneuverability.',
                        rewards: [
                            { type: 'speed', value: 30 }
                        ]
                    }
                ]
            },

            // Standard upgrade choices - Tier 2
            {
                type: 'standard',
                tier: 2,
                title: 'Advanced Systems Upgrade',
                description: 'You discover an advanced upgrade station with powerful enhancements.',
                options: [
                    {
                        text: 'Advanced Weapons',
                        description: 'Significantly enhance your offensive capabilities.',
                        rewards: [
                            { type: 'weapon' },
                            { type: 'fireRate', value: 15 }
                        ]
                    },
                    {
                        text: 'Advanced Defenses',
                        description: 'Significantly reinforce your protective systems.',
                        rewards: [
                            { type: 'shield', value: 40 },
                            { type: 'health', value: 25 }
                        ]
                    },
                    {
                        text: 'Advanced Propulsion',
                        description: 'Significantly improve your ship\'s maneuverability.',
                        rewards: [
                            { type: 'speed', value: 60 },
                            { type: 'special', value: 'emergencyThrusters' }
                        ]
                    }
                ]
            },

            // Risk/reward tradeoff choices - Tier 1
            {
                type: 'standard',
                tier: 1,
                title: 'Unstable Technology',
                description: 'You discover experimental technology with powerful but unstable properties.',
                options: [
                    {
                        text: 'Overclocked Weapons',
                        description: 'Dramatically increase fire rate at the cost of hull integrity.',
                        rewards: [
                            { type: 'fireRate', value: 50 }
                        ],
                        penalties: [
                            { type: 'health', value: 20 }
                        ]
                    },
                    {
                        text: 'Shield Resonance Matrix',
                        description: 'Significantly boost shields but reduce engine efficiency.',
                        rewards: [
                            { type: 'shield', value: 40 }
                        ],
                        penalties: [
                            { type: 'speed', value: 40 }
                        ]
                    },
                    {
                        text: 'Experimental Propulsion',
                        description: 'Greatly enhance speed but destabilize weapon systems.',
                        rewards: [
                            { type: 'speed', value: 60 }
                        ],
                        penalties: [
                            { type: 'fireRate', value: 40 }
                        ]
                    }
                ]
            },

            // Risk/reward tradeoff choices - Tier 2
            {
                type: 'standard',
                tier: 2,
                title: 'Prototype Technology',
                description: 'You discover highly experimental prototype technology with extreme power but significant drawbacks.',
                options: [
                    {
                        text: 'Quantum Weapon Matrix',
                        description: 'Revolutionary weapon system dramatically increases firepower but at a severe cost to ship integrity.',
                        rewards: [
                            { type: 'weapon', value: 'QUANTUM_BEAM' },
                            { type: 'fireRate', value: 30 }
                        ],
                        penalties: [
                            { type: 'health', value: 50 },
                            { type: 'weakness', value: 'weaponOverheat' }
                        ]
                    },
                    {
                        text: 'Phase Shield Generator',
                        description: 'Experimental shield technology provides exceptional protection but severely impacts other systems.',
                        rewards: [
                            { type: 'shield', value: 80 },
                            { type: 'special', value: 'shieldRecharge' }
                        ],
                        penalties: [
                            { type: 'speed', value: 50 },
                            { type: 'fireRate', value: 60 }
                        ]
                    },
                    {
                        text: 'Dimensional Shift Drive',
                        description: 'Revolutionary propulsion system allows unprecedented maneuverability but destabilizes core systems.',
                        rewards: [
                            { type: 'speed', value: 100 },
                            { type: 'special', value: 'phaseShift' }
                        ],
                        penalties: [
                            { type: 'health', value: 25 },
                            { type: 'shield', value: 30 },
                            { type: 'weakness', value: 'systemInstability' }
                        ]
                    }
                ]
            },

            // Path choices
            {
                type: 'path',
                tier: 1,
                title: 'Navigation Decision',
                description: 'You must choose your next route through the sector.',
                options: [
                    {
                        text: 'Asteroid Field',
                        description: 'Dense asteroid field with valuable mineral deposits but hazardous navigation.',
                        rewards: [
                            { type: 'statBoost' }
                        ],
                        penalties: [
                            { type: 'weakness', value: 'asteroidVulnerability' }
                        ]
                    },
                    {
                        text: 'Enemy Territory',
                        description: 'A sector controlled by hostile forces with valuable technology.',
                        rewards: [
                            { type: 'weapon' }
                        ],
                        penalties: [
                            { type: 'statReduction' }
                        ]
                    },
                    {
                        text: 'Radiation Zone',
                        description: 'An area affected by dangerous radiation but with unique resources.',
                        rewards: [
                            { type: 'special' }
                        ],
                        penalties: [
                            { type: 'weakness', value: 'radiationVulnerability' }
                        ]
                    }
                ]
            },

            // Advanced path choices
            {
                type: 'path',
                tier: 2,
                title: 'Critical Navigation Decision',
                description: 'You must choose a dangerous route to proceed. All options carry significant risk.',
                options: [
                    {
                        text: 'Unstable Wormhole',
                        description: 'A spatial anomaly that could provide a shortcut but with unpredictable effects on ship systems.',
                        rewards: [
                            { type: 'special' },
                            { type: 'statBoost' }
                        ],
                        penalties: [
                            { type: 'weakness', value: 'systemInstability' },
                            { type: 'health', value: 25 }
                        ]
                    },
                    {
                        text: 'Elite Enemy Blockade',
                        description: 'A heavily defended sector with elite enemy ships guarding valuable technology.',
                        rewards: [
                            { type: 'weapon' },
                            { type: 'fireRate', value: 30 }
                        ],
                        penalties: [
                            { type: 'weakness', value: 'eliteVulnerability' },
                            { type: 'shield', value: 30 }
                        ]
                    },
                    {
                        text: 'Quantum Radiation Field',
                        description: 'An area of intense exotic radiation that could enhance or destroy ship systems.',
                        rewards: [
                            { type: 'special', value: 'phaseShift' },
                            { type: 'shield', value: 40 }
                        ],
                        penalties: [
                            { type: 'weakness', value: 'powerFluctuation' },
                            { type: 'fireRate', value: 60 }
                        ]
                    }
                ]
            },

            // Emergency choices
            {
                type: 'emergency',
                tier: 1,
                title: 'Critical Systems Failure',
                description: 'A power surge has damaged multiple systems. You must make an emergency decision.',
                options: [
                    {
                        text: 'Divert Power to Weapons',
                        description: 'Keep weapons online at the cost of defense.',
                        rewards: [
                            { type: 'fireRate', value: 20 }
                        ],
                        penalties: [
                            { type: 'shield', value: 30 }
                        ]
                    },
                    {
                        text: 'Divert Power to Shields',
                        description: 'Maintain shields at the cost of mobility.',
                        rewards: [
                            { type: 'shield', value: 25 }
                        ],
                        penalties: [
                            { type: 'speed', value: 30 }
                        ]
                    },
                    {
                        text: 'Divert Power to Engines',
                        description: 'Preserve mobility at the cost of combat effectiveness.',
                        rewards: [
                            { type: 'speed', value: 40 }
                        ],
                        penalties: [
                            { type: 'fireRate', value: 40 }
                        ]
                    }
                ]
            },

            // Severe emergency choices
            {
                type: 'emergency',
                tier: 2,
                title: 'Catastrophic Systems Failure',
                description: 'Multiple critical systems are failing simultaneously. You must make a desperate decision to survive.',
                options: [
                    {
                        text: 'Emergency Weapon Override',
                        description: 'Force weapons to remain operational by redirecting all available power.',
                        rewards: [
                            { type: 'weapon', value: 'PLASMA_BOLT' },
                            { type: 'fireRate', value: 30 }
                        ],
                        penalties: [
                            { type: 'shield', value: 60 },
                            { type: 'speed', value: 50 },
                            { type: 'weakness', value: 'weaponOverheat' }
                        ]
                    },
                    {
                        text: 'Emergency Shield Reinforcement',
                        description: 'Strengthen shields by cannibalizing other system components.',
                        rewards: [
                            { type: 'shield', value: 60 },
                            { type: 'special', value: 'shieldRecharge' }
                        ],
                        penalties: [
                            { type: 'health', value: 25 },
                            { type: 'fireRate', value: 60 },
                            { type: 'weakness', value: 'powerFluctuation' }
                        ]
                    },
                    {
                        text: 'Emergency Engine Reconfiguration',
                        description: 'Maintain escape capability by sacrificing all other systems.',
                        rewards: [
                            { type: 'speed', value: 80 },
                            { type: 'special', value: 'emergencyThrusters' }
                        ],
                        penalties: [
                            { type: 'health', value: 25 },
                            { type: 'shield', value: 30 },
                            { type: 'fireRate', value: 60 },
                            { type: 'weakness', value: 'engineStall' }
                        ]
                    }
                ]
            },

            // Time-pressure choices - Critical situations
            {
                type: 'time_pressure',
                tier: 1,
                title: 'Imminent Collision',
                description: 'WARNING: Asteroid field detected directly ahead! Immediate action required!',
                options: [
                    {
                        text: 'Emergency Evasive Maneuvers',
                        description: 'Attempt a risky high-speed evasive maneuver.',
                        rewards: [
                            { type: 'special', value: 'temporaryInvulnerability' }
                        ],
                        penalties: [
                            { type: 'health', value: 10 } // Minor damage from stress on the ship
                        ]
                    },
                    {
                        text: 'Full Power to Shields',
                        description: 'Divert all power to forward shields to withstand impact.',
                        rewards: [
                            { type: 'shield', value: 30 }
                        ],
                        penalties: [
                            { type: 'speed', value: 40 },
                            { type: 'fireRate', value: 20 }
                        ]
                    },
                    {
                        text: 'Weapons Barrage',
                        description: 'Blast a path through the asteroids with all weapons.',
                        rewards: [
                            { type: 'fireRate', value: 25 }
                        ],
                        penalties: [
                            { type: 'shield', value: 20 }
                        ]
                    }
                ]
            },

            // Time-pressure choices - System failures
            {
                type: 'time_pressure',
                tier: 1,
                title: 'Reactor Overload',
                description: 'CRITICAL ALERT: Ship reactor approaching meltdown! Immediate action required!',
                options: [
                    {
                        text: 'Emergency Shutdown',
                        description: 'Shut down the reactor completely. Safe but will leave systems underpowered.',
                        rewards: [
                            { type: 'health', value: 20 } // Repair some damage
                        ],
                        penalties: [
                            { type: 'speed', value: 30 },
                            { type: 'fireRate', value: 30 }
                        ]
                    },
                    {
                        text: 'Vent Plasma',
                        description: 'Vent excess plasma to space. Risky but maintains power levels.',
                        rewards: [
                            { type: 'special', value: 'powerSurge' }
                        ],
                        penalties: [
                            { type: 'health', value: 15 }
                        ]
                    },
                    {
                        text: 'Reroute Power',
                        description: 'Reroute power through secondary systems. Balanced approach.',
                        rewards: [
                            { type: 'shield', value: 15 }
                        ],
                        penalties: [
                            { type: 'fireRate', value: 15 }
                        ]
                    }
                ]
            },

            // Time-pressure choices - Combat situations
            {
                type: 'time_pressure',
                tier: 2,
                title: 'Ambush Alert',
                description: 'PROXIMITY ALERT: Multiple hostile signatures detected closing in from all sides!',
                options: [
                    {
                        text: 'Evasive Action',
                        description: 'Focus on evading the ambush with maximum speed.',
                        rewards: [
                            { type: 'speed', value: 50 },
                            { type: 'special', value: 'temporaryInvulnerability' }
                        ],
                        penalties: [
                            { type: 'fireRate', value: 40 }
                        ]
                    },
                    {
                        text: 'Defensive Posture',
                        description: 'Maximize shields and prepare to weather the attack.',
                        rewards: [
                            { type: 'shield', value: 50 },
                            { type: 'special', value: 'shieldRecharge' }
                        ],
                        penalties: [
                            { type: 'speed', value: 30 }
                        ]
                    },
                    {
                        text: 'Preemptive Strike',
                        description: 'Launch an all-out attack before they can coordinate.',
                        rewards: [
                            { type: 'fireRate', value: 40 },
                            { type: 'weapon', value: 'SPREAD_SHOT' }
                        ],
                        penalties: [
                            { type: 'shield', value: 30 }
                        ]
                    }
                ]
            },

            // Merchant choices
            {
                type: 'merchant',
                tier: 1,
                title: 'Trading Outpost',
                description: 'You encounter a merchant willing to trade valuable upgrades for your existing technology.',
                options: [
                    {
                        text: 'Trade Weapon Components',
                        description: 'Trade some weapon efficiency for improved defenses.',
                        rewards: [
                            { type: 'shield', value: 30 },
                            { type: 'health', value: 20 }
                        ],
                        penalties: [
                            { type: 'fireRate', value: 30 }
                        ]
                    },
                    {
                        text: 'Trade Shield Components',
                        description: 'Trade some shield capacity for improved weapons.',
                        rewards: [
                            { type: 'weapon' },
                            { type: 'fireRate', value: 20 }
                        ],
                        penalties: [
                            { type: 'shield', value: 30 }
                        ]
                    },
                    {
                        text: 'Trade Engine Components',
                        description: 'Trade some engine efficiency for improved overall systems.',
                        rewards: [
                            { type: 'health', value: 15 },
                            { type: 'shield', value: 15 },
                            { type: 'fireRate', value: 15 }
                        ],
                        penalties: [
                            { type: 'speed', value: 40 }
                        ]
                    }
                ]
            },

            // Event choices
            {
                type: 'event',
                tier: 1,
                title: 'Derelict Ship',
                description: 'You discover an abandoned ship drifting in space. Its systems appear to be partially functional.',
                options: [
                    {
                        text: 'Salvage Weapons',
                        description: 'Strip the ship of its weapon systems for your own use.',
                        rewards: [
                            { type: 'weapon' },
                            { type: 'fireRate', value: 15 }
                        ]
                    },
                    {
                        text: 'Salvage Shields',
                        description: 'Recover the shield generator for your own ship.',
                        rewards: [
                            { type: 'shield', value: 40 }
                        ]
                    },
                    {
                        text: 'Salvage Engine',
                        description: 'Extract the propulsion system for your own use.',
                        rewards: [
                            { type: 'speed', value: 50 }
                        ]
                    },
                    {
                        text: 'Attempt Full Recovery',
                        description: 'Try to recover all systems, but risk triggering the ship\'s security measures.',
                        rewards: [
                            { type: 'statBoost' },
                            { type: 'statBoost' }
                        ],
                        penalties: [
                            { type: 'statReduction' }
                        ]
                    }
                ]
            }
        ];
    }

    /**
     * Get the display name for a weapon type
     */
    getWeaponName(weaponType) {
        const weapon = this.upgrades.find(upgrade => upgrade.type === 'weapon' && upgrade.value === weaponType);
        return weapon ? weapon.name : 'Unknown Weapon';
    }

    /**
     * Get the description for a weapon type
     */
    getWeaponDescription(weaponType) {
        const weapon = this.upgrades.find(upgrade => upgrade.type === 'weapon' && upgrade.value === weaponType);
        return weapon ? weapon.description : 'No information available.';
    }

    /**
     * Reset the choice system for a new run
     */
    resetForNewRun(shipType = 'fighter') {
        this.choiceHistory = [];
        this.playerBuild = {
            shipType: shipType,
            activeUpgrades: [],
            activePenalties: []
        };
    }
}