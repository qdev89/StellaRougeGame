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
     */
    generateChoice(choiceType = 'standard') {
        // Get choice templates based on type
        const availableChoices = this.choices.filter(choice => choice.type === choiceType);
        
        if (availableChoices.length === 0) {
            return this.generateFallbackChoice();
        }
        
        // Select a random choice template
        const choiceTemplate = availableChoices[Math.floor(Math.random() * availableChoices.length)];
        
        // Create a copy of the template
        const choice = JSON.parse(JSON.stringify(choiceTemplate));
        
        // Fill in dynamic options for each option
        choice.options.forEach(option => {
            // Generate appropriate upgrades/penalties for each option
            if (option.rewards) {
                option.rewards = this.generateRewards(option.rewards, this.playerBuild);
            }
            
            if (option.penalties) {
                option.penalties = this.generatePenalties(option.penalties, this.playerBuild);
            }
        });
        
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
     */
    generateRewards(rewardTemplates, playerBuild) {
        const generatedRewards = [];
        
        rewardTemplates.forEach(template => {
            switch (template.type) {
                case 'weapon':
                    // Select a weapon the player doesn't already have
                    const weapons = ['BASIC_LASER', 'SPREAD_SHOT', 'PLASMA_BOLT', 'HOMING_MISSILE'];
                    const availableWeapons = weapons.filter(weapon => {
                        return !playerBuild.activeUpgrades.some(u => u.type === 'weapon' && u.value === weapon);
                    });
                    
                    if (availableWeapons.length > 0) {
                        const selectedWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
                        generatedRewards.push({
                            type: 'weapon',
                            value: selectedWeapon,
                            name: this.getWeaponName(selectedWeapon),
                            description: this.getWeaponDescription(selectedWeapon)
                        });
                    } else {
                        // Fallback to weapon upgrade
                        generatedRewards.push({
                            type: 'fireRate',
                            value: 20,
                            name: 'Weapon Tuning',
                            description: 'Increases fire rate by fine-tuning weapon systems.'
                        });
                    }
                    break;
                    
                case 'statBoost':
                    // Generate a random stat boost
                    const stats = [
                        { type: 'health', value: 25, name: 'Hull Reinforcement', description: 'Increases maximum health.' },
                        { type: 'shield', value: 20, name: 'Shield Amplifier', description: 'Increases maximum shield capacity.' },
                        { type: 'speed', value: 30, name: 'Engine Boost', description: 'Increases movement speed.' },
                        { type: 'fireRate', value: 15, name: 'Firing System Upgrade', description: 'Decreases time between shots.' }
                    ];
                    
                    const selectedStat = stats[Math.floor(Math.random() * stats.length)];
                    generatedRewards.push(selectedStat);
                    break;
                    
                case 'special':
                    // Generate a special ability or unique upgrade
                    const specials = [
                        { 
                            type: 'special',
                            value: 'secondaryWeapon', 
                            name: 'Secondary Weapon System', 
                            description: 'Adds a second weapon that fires automatically.'
                        },
                        {
                            type: 'special',
                            value: 'shieldRecharge',
                            name: 'Shield Regenerator',
                            description: 'Shields slowly recharge over time.'
                        },
                        {
                            type: 'special',
                            value: 'pointDefense',
                            name: 'Point Defense System',
                            description: 'Automatically shoots down some enemy projectiles.'
                        }
                    ];
                    
                    const selectedSpecial = specials[Math.floor(Math.random() * specials.length)];
                    generatedRewards.push(selectedSpecial);
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
     */
    generatePenalties(penaltyTemplates, playerBuild) {
        const generatedPenalties = [];
        
        penaltyTemplates.forEach(template => {
            switch (template.type) {
                case 'statReduction':
                    // Generate a random stat reduction
                    const penalties = [
                        { type: 'health', value: 10, name: 'Hull Damage', description: 'Decreases maximum health.' },
                        { type: 'shield', value: 15, name: 'Shield Interference', description: 'Decreases maximum shield capacity.' },
                        { type: 'speed', value: 25, name: 'Engine Strain', description: 'Decreases movement speed.' },
                        { type: 'fireRate', value: 30, name: 'Weapon Destabilization', description: 'Increases time between shots.' }
                    ];
                    
                    // Make sure we don't reduce a stat below minimum viable level
                    const viablePenalties = penalties.filter(penalty => {
                        // Don't apply penalties that would make a stat too low
                        // This is simplified - in a real game, you'd check current values
                        return !playerBuild.activePenalties.some(p => 
                            p.type === penalty.type && p.value >= 50);
                    });
                    
                    if (viablePenalties.length > 0) {
                        const selectedPenalty = viablePenalties[Math.floor(Math.random() * viablePenalties.length)];
                        generatedPenalties.push(selectedPenalty);
                    } else {
                        // Fallback to a minor penalty
                        generatedPenalties.push({ 
                            type: 'fireRate', 
                            value: 10, 
                            name: 'Minor System Lag',
                            description: 'Slightly increases time between shots.'
                        });
                    }
                    break;
                    
                case 'specialWeakness':
                    // Generate a special weakness or vulnerability
                    const weaknesses = [
                        { 
                            type: 'weakness',
                            value: 'asteroidVulnerability', 
                            name: 'Fragile Hull Plating', 
                            description: 'Take increased damage from asteroid collisions.'
                        },
                        {
                            type: 'weakness',
                            value: 'enemyAccuracy',
                            name: 'Targeting Beacon Malfunction',
                            description: 'Enemy targeting systems are more effective against your ship.'
                        },
                        {
                            type: 'weakness',
                            value: 'shieldDisruption',
                            name: 'Shield Harmonics Flaw',
                            description: 'Shields take longer to begin recharging after damage.'
                        }
                    ];
                    
                    const selectedWeakness = weaknesses[Math.floor(Math.random() * weaknesses.length)];
                    generatedPenalties.push(selectedWeakness);
                    break;
                    
                default:
                    // Just pass through directly specified penalties
                    generatedPenalties.push(template);
            }
        });
        
        return generatedPenalties;
    }
    
    /**
     * Apply choice consequences to the player
     */
    applyChoice(choiceIndex, choice) {
        const selectedOption = choice.options[choiceIndex];
        
        // Record the choice for history
        this.choiceHistory.push({
            title: choice.title,
            optionChosen: selectedOption.text,
            rewards: selectedOption.rewards,
            penalties: selectedOption.penalties
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
            penalties: selectedOption.penalties || []
        };
    }
    
    /**
     * Initialize the database of upgrades
     */
    initializeUpgrades() {
        return [
            // Weapons
            {
                type: 'weapon',
                value: 'BASIC_LASER',
                name: 'Basic Laser Cannon',
                description: 'Standard issue laser weapon with balanced properties.',
                tier: 1
            },
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
                value: 'HOMING_MISSILE',
                name: 'Tracking Missile Launcher',
                description: 'Launches missiles that seek out nearby enemies.',
                tier: 3
            },
            
            // Stat boosts
            {
                type: 'health',
                value: 25,
                name: 'Hull Reinforcement',
                description: 'Reinforced hull plating increases maximum health.',
                tier: 1
            },
            {
                type: 'shield',
                value: 20,
                name: 'Shield Amplifier',
                description: 'Enhanced shield generators increase maximum shield capacity.',
                tier: 1
            },
            {
                type: 'speed',
                value: 30,
                name: 'Engine Boost',
                description: 'Upgraded engine components increase overall speed.',
                tier: 1
            },
            {
                type: 'fireRate',
                value: 15,
                name: 'Firing System Upgrade',
                description: 'Optimized weapon cooling decreases time between shots.',
                tier: 1
            },
            
            // Special upgrades
            {
                type: 'special',
                value: 'secondaryWeapon',
                name: 'Secondary Weapon System',
                description: 'Installs a secondary weapon turret that fires automatically.',
                tier: 3
            },
            {
                type: 'special',
                value: 'shieldRecharge',
                name: 'Shield Regenerator',
                description: 'Advanced shield technology allows shields to recharge over time.',
                tier: 2
            },
            {
                type: 'special',
                value: 'pointDefense',
                name: 'Point Defense System',
                description: 'Automated defense system shoots down some enemy projectiles.',
                tier: 3
            }
        ];
    }
    
    /**
     * Initialize the database of penalties
     */
    initializePenalties() {
        return [
            // Stat penalties
            {
                type: 'health',
                value: 10,
                name: 'Hull Damage',
                description: 'Structural damage decreases maximum health.'
            },
            {
                type: 'shield',
                value: 15,
                name: 'Shield Interference',
                description: 'Power fluctuations decrease maximum shield capacity.'
            },
            {
                type: 'speed',
                value: 25,
                name: 'Engine Strain',
                description: 'Engine degradation decreases movement speed.'
            },
            {
                type: 'fireRate',
                value: 30,
                name: 'Weapon Destabilization',
                description: 'Weapon system instability increases time between shots.'
            },
            
            // Special weaknesses
            {
                type: 'weakness',
                value: 'asteroidVulnerability',
                name: 'Fragile Hull Plating',
                description: 'Weakened hull plating causes increased damage from asteroid collisions.'
            },
            {
                type: 'weakness',
                value: 'enemyAccuracy',
                name: 'Targeting Beacon Malfunction',
                description: 'Malfunctioning stealth systems make enemy targeting more accurate.'
            },
            {
                type: 'weakness',
                value: 'shieldDisruption',
                name: 'Shield Harmonics Flaw',
                description: 'Shield synchronization issues extend recharge time after damage.'
            }
        ];
    }
    
    /**
     * Initialize the database of choice templates
     */
    initializeChoices() {
        return [
            // Standard upgrade choices
            {
                type: 'standard',
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
            
            // Risk/reward tradeoff choices
            {
                type: 'standard',
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
            
            // Path choices
            {
                type: 'path',
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
                            { type: 'health', value: 15 }
                        ]
                    }
                ]
            },
            
            // Emergency choices
            {
                type: 'emergency',
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