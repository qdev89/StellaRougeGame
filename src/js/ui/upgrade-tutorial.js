/**
 * Upgrade Tutorial
 * Tutorial specifically for the upgrade screen
 */
class UpgradeTutorial extends TutorialSystem {
    constructor(scene) {
        super(scene);
        
        // Set up tutorial steps
        this.steps = [
            {
                title: "UPGRADE SYSTEM",
                description: "This is the UPGRADE SCREEN. Here you can choose upgrades to improve your ship's capabilities.",
                highlight: null
            },
            {
                title: "UPGRADE CHOICES",
                description: "You'll be presented with multiple upgrade options. Choose the one that best complements your current build and playstyle.",
                highlight: null
            },
            {
                title: "UPGRADE TIERS",
                description: "Upgrades come in different TIERS:\n• TIER 1: Basic upgrades\n• TIER 2: Advanced upgrades\n• TIER 3: Elite upgrades\n\nHigher tier upgrades become available in later sectors.",
                highlight: null
            },
            {
                title: "UPGRADE TYPES",
                description: "There are several types of upgrades:\n• STAT BOOSTS: Improve ship stats\n• WEAPONS: New or improved weapons\n• ABILITIES: Special abilities and effects\n• SUBSYSTEMS: Components for the Synergy Grid",
                highlight: null
            },
            {
                title: "SYNERGIES",
                description: "Some upgrades work well together, creating SYNERGIES that provide additional benefits. Experiment with different combinations!",
                highlight: null
            }
        ];
    }
    
    /**
     * Get the key for this specific tutorial
     */
    getTutorialKey() {
        return 'upgrade';
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.UpgradeTutorial = UpgradeTutorial;
}
