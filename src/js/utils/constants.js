/**
 * Game Constants
 * Contains all global constants used throughout the game
 */
const CONSTANTS = {
    // Game version
    GAME_VERSION: '0.6.0',

    // Scene keys
    SCENES: {
        BOOT: 'BootScene',
        LOADING: 'LoadingScene',
        MAIN_MENU: 'MainMenuScene',
        SECTOR_MAP: 'SectorMapScene',
        GAME: 'GameScene',
        UPGRADE: 'UpgradeScene',
        GAME_OVER: 'GameOverScene',
        SHIP_STATUS: 'ShipStatusScene',
        INVENTORY: 'InventoryScene',
        PROFILE: 'ProfileScene',
        SUBSYSTEM_GRID: 'SubsystemGridScene',
        NEMESIS_INFO: 'NemesisInfoScene',
        HELP: 'HelpScene',
        GAME_SETTINGS: 'GameSettingsScene'
    },

    // Player ship settings
    PLAYER: {
        STARTING_HEALTH: 100,
        STARTING_SHIELDS: 50,
        MOVEMENT_SPEED: 300,
        FIRE_RATE: 300, // milliseconds between shots
        DASH_SPEED: 800,
        DASH_DURATION: 200, // milliseconds
        DASH_COOLDOWN: 2000, // milliseconds
        INVINCIBILITY_DURATION: 1000 // milliseconds after taking damage
    },

    // Enemy settings
    ENEMIES: {
        TYPES: {
            DRONE: {
                HEALTH: 30,
                SPEED: 150,
                SCORE: 100,
                FIRE_RATE: 12000 // Further increased from 8000 (originally 2000)
            },
            GUNSHIP: {
                HEALTH: 60,
                SPEED: 120,
                SCORE: 250,
                FIRE_RATE: 9000 // Further increased from 6000 (originally 1500)
            },
            DESTROYER: {
                HEALTH: 120,
                SPEED: 80,
                SCORE: 500,
                FIRE_RATE: 18000 // Further increased from 12000 (originally 3000)
            },
            INTERCEPTOR: {
                HEALTH: 40,
                SPEED: 200,
                SCORE: 150,
                FIRE_RATE: 6000 // Further increased from 4000 (originally 1000)
            },
            BOMBER: {
                HEALTH: 80,
                SPEED: 100,
                SCORE: 300,
                FIRE_RATE: 24000 // Further increased from 16000 (originally 4000)
            },
            STEALTH: {
                HEALTH: 50,
                SPEED: 180,
                SCORE: 350,
                FIRE_RATE: 15000 // Further increased from 10000 (originally 2500)
            },
            TURRET: {
                HEALTH: 150,
                SPEED: 0,
                SCORE: 400,
                FIRE_RATE: 7200 // Further increased from 4800 (originally 1200)
            },
            CARRIER: {
                HEALTH: 200,
                SPEED: 60,
                SCORE: 600,
                FIRE_RATE: 30000 // Further increased from 20000 (originally 5000)
            }
        },

        // Mini-boss settings
        MINI_BOSSES: {
            ASSAULT_CAPTAIN: {
                HEALTH: 300,
                SPEED: 100,
                SCORE: 1000,
                FIRE_RATE: 6000, // Further increased from 4000 (originally 1000)
                PHASES: 2,
                ATTACK_PATTERNS: ['spread', 'charge']
            },
            SHIELD_MASTER: {
                HEALTH: 250,
                SPEED: 80,
                SCORE: 1000,
                FIRE_RATE: 12000, // Further increased from 8000 (originally 2000)
                PHASES: 2,
                ATTACK_PATTERNS: ['shield', 'burst']
            },
            DRONE_COMMANDER: {
                HEALTH: 200,
                SPEED: 70,
                SCORE: 1000,
                FIRE_RATE: 18000, // Further increased from 12000 (originally 3000)
                PHASES: 2,
                ATTACK_PATTERNS: ['drones', 'support']
            },
            STEALTH_HUNTER: {
                HEALTH: 220,
                SPEED: 150,
                SCORE: 1000,
                FIRE_RATE: 9000, // Further increased from 6000 (originally 1500)
                PHASES: 2,
                ATTACK_PATTERNS: ['cloak', 'ambush']
            },
            BOMBER_CHIEF: {
                HEALTH: 280,
                SPEED: 60,
                SCORE: 1000,
                FIRE_RATE: 15000, // Further increased from 10000 (originally 2500)
                PHASES: 2,
                ATTACK_PATTERNS: ['bombs', 'mines']
            }
        },

        // Boss enemy settings
        BOSSES: {
            // Sector 1 Boss
            SCOUT_COMMANDER: {
                HEALTH: 500,
                SCORE: 2000,
                PHASES: 2,
                ATTACK_PATTERNS: ['spread', 'drones', 'beam', 'ramming']
            },
            // Sector 2 Boss
            BATTLE_CARRIER: {
                HEALTH: 800,
                SCORE: 3000,
                PHASES: 3,
                ATTACK_PATTERNS: ['drones', 'missiles', 'beam', 'shield']
            },
            // Sector 3 Boss
            DESTROYER_PRIME: {
                HEALTH: 1000,
                SCORE: 4000,
                PHASES: 3,
                ATTACK_PATTERNS: ['artillery', 'mines', 'charge', 'burst']
            },
            // Sector 4 Boss
            STEALTH_OVERLORD: {
                HEALTH: 900,
                SCORE: 4500,
                PHASES: 3,
                ATTACK_PATTERNS: ['cloak', 'ambush', 'mines', 'spread']
            },
            // Sector 5 Boss
            DREADNOUGHT: {
                HEALTH: 1500,
                SCORE: 5000,
                PHASES: 4,
                ATTACK_PATTERNS: ['artillery', 'drones', 'beam', 'shield', 'missiles']
            },
            // Sector 6 Boss
            BOMBER_TITAN: {
                HEALTH: 1300,
                SCORE: 5500,
                PHASES: 3,
                ATTACK_PATTERNS: ['bombs', 'mines', 'artillery', 'drones']
            },
            // Final Boss
            NEMESIS: {
                HEALTH: 2000,
                SCORE: 10000,
                PHASES: 5,
                ATTACK_PATTERNS: ['all']
            }
        }
    },

    // Weapon settings - Enhanced for better gameplay
    WEAPONS: {
        BASIC_LASER: {
            DAMAGE: 15,           // Increased from 10
            SPEED: 600,          // Increased from 500
            FIRE_RATE: 250,      // Faster fire rate (was 300ms)
            LIFESPAN: 2000,      // milliseconds before auto-destruction
            COLOR: 0x33ccff,     // Light blue
            DESCRIPTION: 'Enhanced rapid-fire laser with improved damage and fire rate.'
        },
        SPREAD_SHOT: {
            DAMAGE: 12,           // Increased from 8
            SPEED: 500,          // Increased from 450
            FIRE_RATE: 400,      // Faster fire rate (was 500ms)
            LIFESPAN: 1800,      // milliseconds before auto-destruction
            SPREAD_ANGLE: 30,    // Wider spread (was 25 degrees)
            COLOR: 0x33ff33,     // Green
            DESCRIPTION: 'Fires three powerful projectiles in a wide spread pattern.'
        },
        PLASMA_BOLT: {
            DAMAGE: 35,           // Increased from 25
            SPEED: 350,          // Increased from 300
            FIRE_RATE: 600,      // Faster fire rate (was 800ms)
            LIFESPAN: 2500,      // milliseconds before auto-destruction
            COLOR: 0xff33ff,     // Purple
            DESCRIPTION: 'High-damage plasma projectile with improved fire rate.'
        },
        HOMING_MISSILE: {
            DAMAGE: 30,           // Increased from 20
            SPEED: 400,          // Increased from 350
            FIRE_RATE: 900,      // Faster fire rate (was 1200ms)
            LIFESPAN: 4000,      // milliseconds before auto-destruction
            TRACKING_SPEED: 0.05, // Better tracking (was 0.03)
            COLOR: 0xff9933,     // Orange
            DESCRIPTION: 'Enhanced guided missile with improved tracking and damage.'
        },
        DUAL_CANNON: {
            DAMAGE: 18,           // Increased from 12
            SPEED: 600,          // Increased from 550
            FIRE_RATE: 300,      // Faster fire rate (was 400ms)
            LIFESPAN: 2000,      // milliseconds before auto-destruction
            SPACING: 20,         // spacing between the two projectiles
            COLOR: 0xffff33,     // Yellow
            DESCRIPTION: 'Fires two powerful parallel projectiles with excellent fire rate.'
        },
        LASER_BEAM: {
            DAMAGE: 5,            // Increased from 3 damage per frame
            RANGE: 500,          // Longer range (was 400)
            FIRE_RATE: 40,       // Faster updates (was 50ms)
            WIDTH: 10,           // Wider beam (was 8)
            COLOR: 0xff3333,     // Red
            DESCRIPTION: 'Enhanced continuous laser beam with improved damage and range.'
        },
        SCATTER_BOMB: {
            DAMAGE: 20,           // Increased from 15 initial damage
            SPEED: 300,          // Increased from 250
            FIRE_RATE: 1200,     // Faster fire rate (was 1500ms)
            LIFESPAN: 1500,      // milliseconds before explosion
            FRAGMENT_COUNT: 10,  // More fragments (was 8)
            FRAGMENT_DAMAGE: 12, // Increased from 8 damage per fragment
            FRAGMENT_SPEED: 350, // Faster fragments (was 300)
            FRAGMENT_LIFESPAN: 1000, // milliseconds before fragment destruction
            COLOR: 0xff6633,     // Orange-red
            DESCRIPTION: 'Enhanced explosive projectile that splits into multiple deadly fragments.'
        }
    },

    // Sector generation settings - Further reduced for easier gameplay
    SECTOR: {
        LENGTH: 10000, // virtual pixel length of a sector
        MIN_ENEMIES: 8,  // Further reduced from 12 (originally 24)
        MAX_ENEMIES: 15, // Further reduced from 20 (originally 40)
        HAZARD_FREQUENCY: 0.2, // Further reduced from 0.3 (originally 0.6)
        UPGRADE_NODES: 3, // Increased from 2 for more upgrades
        DIFFICULTY_SCALING: 0.05 // Further reduced from 0.1 (originally 0.2)
    },

    // Game settings
    GAME: {
        BACKGROUND_SCROLL_SPEED: 1,
        PLAYER_Z_INDEX: 1000,
        ENEMY_Z_INDEX: 900,
        PROJECTILE_Z_INDEX: 800,
        POWERUP_Z_INDEX: 700,
        BACKGROUND_Z_INDEX: 0
    },

    // Meta-progression settings
    META: {
        STARTING_CREDITS: 0,
        UPGRADE_COSTS: {
            TIER_1: 500,
            TIER_2: 1500,
            TIER_3: 3000
        }
    },

    // Time-pressure choice settings
    TIME_PRESSURE: {
        // Time limits in milliseconds
        STANDARD_CHOICE_TIME: 20000,  // 20 seconds for standard choices
        EMERGENCY_CHOICE_TIME: 10000,  // 10 seconds for emergency choices
        CRITICAL_CHOICE_TIME: 5000,    // 5 seconds for critical choices

        // Penalties for timeout
        DEFAULT_TIMEOUT_PENALTY: { type: 'health', value: 10 },
        EMERGENCY_TIMEOUT_PENALTY: { type: 'health', value: 25 },
        CRITICAL_TIMEOUT_PENALTY: { type: 'health', value: 40 },

        // Probability settings
        EMERGENCY_CHANCE_BASE: 0.1,     // Base chance of emergency per sector
        EMERGENCY_CHANCE_SCALING: 0.05, // Additional chance per sector
        CRITICAL_CHANCE_BASE: 0.05,     // Base chance of critical emergency
        CRITICAL_CHANCE_SCALING: 0.03   // Additional chance per sector
    }
};

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
}