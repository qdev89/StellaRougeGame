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
        GAME: 'GameScene',
        UPGRADE: 'UpgradeScene',
        GAME_OVER: 'GameOverScene'
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
                FIRE_RATE: 2000 // milliseconds between shots
            },
            GUNSHIP: {
                HEALTH: 60,
                SPEED: 120,
                SCORE: 250,
                FIRE_RATE: 1500 // milliseconds between shots
            },
            DESTROYER: {
                HEALTH: 120,
                SPEED: 80,
                SCORE: 500,
                FIRE_RATE: 3000 // milliseconds between shots
            }
        },

        // Boss enemy settings
        BOSSES: {
            SCOUT_COMMANDER: {
                HEALTH: 500,
                SCORE: 2000,
                PHASES: 2
            },
            BATTLE_CARRIER: {
                HEALTH: 800,
                SCORE: 3000,
                PHASES: 3
            },
            DESTROYER_PRIME: {
                HEALTH: 1000,
                SCORE: 4000,
                PHASES: 3
            },
            DREADNOUGHT: {
                HEALTH: 1500,
                SCORE: 5000,
                PHASES: 4
            },
            NEMESIS: {
                HEALTH: 2000,
                SCORE: 10000,
                PHASES: 5
            }
        }
    },

    // Weapon settings
    WEAPONS: {
        BASIC_LASER: {
            DAMAGE: 10,
            SPEED: 500,
            FIRE_RATE: 300, // milliseconds between shots
            LIFESPAN: 2000 // milliseconds before auto-destruction
        },
        SPREAD_SHOT: {
            DAMAGE: 8,
            SPEED: 450,
            FIRE_RATE: 500, // milliseconds between shots
            LIFESPAN: 1800, // milliseconds before auto-destruction
            SPREAD_ANGLE: 25 // degrees of spread
        },
        PLASMA_BOLT: {
            DAMAGE: 25,
            SPEED: 300,
            FIRE_RATE: 800, // milliseconds between shots
            LIFESPAN: 2500 // milliseconds before auto-destruction
        },
        HOMING_MISSILE: {
            DAMAGE: 20,
            SPEED: 350,
            FIRE_RATE: 1200, // milliseconds between shots
            LIFESPAN: 4000, // milliseconds before auto-destruction
            TRACKING_SPEED: 0.03 // rate at which the missile adjusts course
        }
    },

    // Sector generation settings
    SECTOR: {
        LENGTH: 10000, // virtual pixel length of a sector
        MIN_ENEMIES: 25, // minimum enemies per sector
        MAX_ENEMIES: 40, // maximum enemies per sector
        HAZARD_FREQUENCY: 0.5, // hazards per 1000 pixels
        UPGRADE_NODES: 2, // number of upgrade nodes per sector
        DIFFICULTY_SCALING: 0.2 // difficulty increase per sector
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
    }
};

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.CONSTANTS = CONSTANTS;
}