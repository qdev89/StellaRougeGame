/**
 * Game Constants
 * Contains all global constants used throughout the game
 */
const CONSTANTS = {
    // Game version
    GAME_VERSION: '0.1.0',

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
        SUBSYSTEM_GRID: 'SubsystemGridScene'
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
                FIRE_RATE: 8000 // milliseconds between shots (quadrupled for reduced ammo frequency)
            },
            GUNSHIP: {
                HEALTH: 60,
                SPEED: 120,
                SCORE: 250,
                FIRE_RATE: 6000 // milliseconds between shots (quadrupled for reduced ammo frequency)
            },
            DESTROYER: {
                HEALTH: 120,
                SPEED: 80,
                SCORE: 500,
                FIRE_RATE: 12000 // milliseconds between shots (quadrupled for reduced ammo frequency)
            },
            INTERCEPTOR: {
                HEALTH: 40,
                SPEED: 200,
                SCORE: 150,
                FIRE_RATE: 4000 // milliseconds between shots (quadrupled for reduced ammo frequency)
            },
            BOMBER: {
                HEALTH: 80,
                SPEED: 100,
                SCORE: 300,
                FIRE_RATE: 16000 // milliseconds between shots (quadrupled for reduced ammo frequency)
            },
            STEALTH: {
                HEALTH: 50,
                SPEED: 180,
                SCORE: 350,
                FIRE_RATE: 10000 // milliseconds between shots (quadrupled for reduced ammo frequency)
            },
            TURRET: {
                HEALTH: 150,
                SPEED: 0,
                SCORE: 400,
                FIRE_RATE: 4800 // milliseconds between shots (quadrupled for reduced ammo frequency)
            },
            CARRIER: {
                HEALTH: 200,
                SPEED: 60,
                SCORE: 600,
                FIRE_RATE: 20000 // milliseconds between shots (quadrupled for reduced ammo frequency)
            }
        },

        // Mini-boss settings
        MINI_BOSSES: {
            ASSAULT_CAPTAIN: {
                HEALTH: 300,
                SPEED: 100,
                SCORE: 1000,
                FIRE_RATE: 4000, // quadrupled for reduced ammo frequency
                PHASES: 2,
                ATTACK_PATTERNS: ['spread', 'charge']
            },
            SHIELD_MASTER: {
                HEALTH: 250,
                SPEED: 80,
                SCORE: 1000,
                FIRE_RATE: 8000, // quadrupled for reduced ammo frequency
                PHASES: 2,
                ATTACK_PATTERNS: ['shield', 'burst']
            },
            DRONE_COMMANDER: {
                HEALTH: 200,
                SPEED: 70,
                SCORE: 1000,
                FIRE_RATE: 12000, // quadrupled for reduced ammo frequency
                PHASES: 2,
                ATTACK_PATTERNS: ['drones', 'support']
            },
            STEALTH_HUNTER: {
                HEALTH: 220,
                SPEED: 150,
                SCORE: 1000,
                FIRE_RATE: 6000, // quadrupled for reduced ammo frequency
                PHASES: 2,
                ATTACK_PATTERNS: ['cloak', 'ambush']
            },
            BOMBER_CHIEF: {
                HEALTH: 280,
                SPEED: 60,
                SCORE: 1000,
                FIRE_RATE: 10000, // quadrupled for reduced ammo frequency
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

    // Weapon settings
    WEAPONS: {
        BASIC_LASER: {
            DAMAGE: 10,
            SPEED: 500,
            FIRE_RATE: 300, // milliseconds between shots
            LIFESPAN: 2000, // milliseconds before auto-destruction
            COLOR: 0x33ccff, // Light blue
            DESCRIPTION: 'Standard rapid-fire laser with balanced damage and fire rate.'
        },
        SPREAD_SHOT: {
            DAMAGE: 8,
            SPEED: 450,
            FIRE_RATE: 500, // milliseconds between shots
            LIFESPAN: 1800, // milliseconds before auto-destruction
            SPREAD_ANGLE: 25, // degrees of spread
            COLOR: 0x33ff33, // Green
            DESCRIPTION: 'Fires three projectiles in a spread pattern, great for hitting multiple targets.'
        },
        PLASMA_BOLT: {
            DAMAGE: 25,
            SPEED: 300,
            FIRE_RATE: 800, // milliseconds between shots
            LIFESPAN: 2500, // milliseconds before auto-destruction
            COLOR: 0xff33ff, // Purple
            DESCRIPTION: 'High-damage plasma projectile that can penetrate weak enemies.'
        },
        HOMING_MISSILE: {
            DAMAGE: 20,
            SPEED: 350,
            FIRE_RATE: 1200, // milliseconds between shots
            LIFESPAN: 4000, // milliseconds before auto-destruction
            TRACKING_SPEED: 0.03, // rate at which the missile adjusts course
            COLOR: 0xff9933, // Orange
            DESCRIPTION: 'Guided missile that tracks the nearest enemy.'
        },
        DUAL_CANNON: {
            DAMAGE: 12,
            SPEED: 550,
            FIRE_RATE: 400, // milliseconds between shots
            LIFESPAN: 2000, // milliseconds before auto-destruction
            SPACING: 20, // spacing between the two projectiles
            COLOR: 0xffff33, // Yellow
            DESCRIPTION: 'Fires two parallel projectiles with good damage and fire rate.'
        },
        LASER_BEAM: {
            DAMAGE: 3, // damage per frame
            RANGE: 400, // beam length
            FIRE_RATE: 50, // continuous beam, updates every 50ms
            WIDTH: 8, // beam width
            COLOR: 0xff3333, // Red
            DESCRIPTION: 'Continuous laser beam that deals damage over time.'
        },
        SCATTER_BOMB: {
            DAMAGE: 15, // initial damage
            SPEED: 250,
            FIRE_RATE: 1500, // milliseconds between shots
            LIFESPAN: 1500, // milliseconds before explosion
            FRAGMENT_COUNT: 8, // number of fragments after explosion
            FRAGMENT_DAMAGE: 8, // damage per fragment
            FRAGMENT_SPEED: 300, // speed of fragments
            FRAGMENT_LIFESPAN: 1000, // milliseconds before fragment destruction
            COLOR: 0xff6633, // Orange-red
            DESCRIPTION: 'Explosive projectile that splits into multiple fragments on impact or timeout.'
        }
    },

    // Sector generation settings
    SECTOR: {
        LENGTH: 10000, // virtual pixel length of a sector
        MIN_ENEMIES: 12, // minimum enemies per sector (reduced by 50%)
        MAX_ENEMIES: 20, // maximum enemies per sector (reduced by 50%)
        HAZARD_FREQUENCY: 0.3, // hazards per 1000 pixels (reduced)
        UPGRADE_NODES: 2, // number of upgrade nodes per sector
        DIFFICULTY_SCALING: 0.1 // difficulty increase per sector (reduced)
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