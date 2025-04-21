/**
 * Game Tutorial
 * Tutorial specifically for the main gameplay
 */
class GameTutorial extends TutorialSystem {
    constructor(scene) {
        super(scene);
        
        // Set up tutorial steps
        this.steps = [
            {
                title: "WELCOME TO STELLAR ROGUE",
                description: "This tutorial will guide you through the basics of gameplay. Press NEXT to continue or SKIP TUTORIAL to jump right in.",
                highlight: null
            },
            {
                title: "SHIP CONTROLS",
                description: "Use WASD or ARROW KEYS to move your ship. Your ship will automatically fire when enemies are in range.",
                highlight: { selector: 'player' }
            },
            {
                title: "HEALTH & SHIELDS",
                description: "Your ship has both HULL INTEGRITY (health) and SHIELDS. Shields regenerate over time, but hull damage is permanent until repaired.",
                highlight: { selector: 'healthBar' }
            },
            {
                title: "WEAPONS",
                description: "Press 1-7 to switch between different weapons. Each weapon has different properties and ammo types.",
                highlight: null
            },
            {
                title: "SPECIAL ABILITIES",
                description: "Press SPACE to use your DASH ability, which gives you a quick burst of speed and temporary invulnerability.",
                highlight: null
            },
            {
                title: "ENEMIES",
                description: "Different enemy types have unique behaviors and attack patterns. Learn to recognize them to survive longer.",
                highlight: null
            },
            {
                title: "POWERUPS",
                description: "Collect powerups dropped by enemies to restore health, shields, ammo, or gain score bonuses.",
                highlight: null
            },
            {
                title: "SECTOR PROGRESS",
                description: "Your goal is to reach the end of each sector and defeat the boss to progress to the next sector.",
                highlight: null
            },
            {
                title: "GOOD LUCK, PILOT!",
                description: "You're now ready to take on the challenges of space. Remember, each run will be different, so adapt your strategy accordingly!",
                highlight: null
            }
        ];
    }
    
    /**
     * Get the key for this specific tutorial
     */
    getTutorialKey() {
        return 'gameplay';
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.GameTutorial = GameTutorial;
}
