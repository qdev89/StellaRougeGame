/**
 * Subsystem Grid Tutorial
 * Tutorial specifically for the subsystem grid screen
 */
class SubsystemGridTutorial extends TutorialSystem {
    constructor(scene) {
        super(scene);
        
        // Set up tutorial steps
        this.steps = [
            {
                title: "SUBSYSTEM SYNERGY GRID",
                description: "This is the SUBSYSTEM SYNERGY GRID. Here you can arrange your subsystems to create powerful synergies.",
                highlight: null
            },
            {
                title: "GRID SLOTS",
                description: "The grid has 9 slots arranged in a 3×3 pattern. Each slot can hold one subsystem component.",
                highlight: null
            },
            {
                title: "SUBSYSTEM COMPONENTS",
                description: "Subsystem components are special upgrades that can be placed in the grid. They provide bonuses on their own, but their true power comes from synergies.",
                highlight: null
            },
            {
                title: "SYNERGIES",
                description: "When compatible subsystems are placed adjacent to each other, they create SYNERGIES that provide additional bonuses.",
                highlight: null
            },
            {
                title: "COMPATIBILITY",
                description: "Not all subsystems are compatible with each other. Compatible subsystems will show a green connection, while incompatible ones will show a red connection.",
                highlight: null
            },
            {
                title: "REARRANGING",
                description: "You can drag and drop subsystems to rearrange them on the grid. Experiment with different arrangements to find powerful combinations!",
                highlight: null
            }
        ];
    }
    
    /**
     * Get the key for this specific tutorial
     */
    getTutorialKey() {
        return 'subsystem_grid';
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.SubsystemGridTutorial = SubsystemGridTutorial;
}
