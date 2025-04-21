/**
 * Sector Map Tutorial
 * Tutorial specifically for the sector map screen
 */
class SectorMapTutorial extends TutorialSystem {
    constructor(scene) {
        super(scene);
        
        // Set up tutorial steps
        this.steps = [
            {
                title: "SECTOR MAP",
                description: "This is the SECTOR MAP. Here you can choose your path through the sector. Each path offers different challenges and rewards.",
                highlight: null
            },
            {
                title: "NODES",
                description: "Each NODE represents an encounter. Different node types offer different experiences:\n• COMBAT: Battle enemies\n• ELITE: Tougher enemies with better rewards\n• MERCHANT: Buy upgrades and items\n• EVENT: Random events with choices\n• BOSS: Sector boss battle",
                highlight: null
            },
            {
                title: "PATH DIFFICULTY",
                description: "Paths have different DIFFICULTY levels indicated by their color:\n• GREEN: Easy (80% rewards)\n• BLUE: Normal (100% rewards)\n• ORANGE: Hard (130% rewards)\n• RED: Extreme (160% rewards)",
                highlight: null
            },
            {
                title: "CHOOSING PATHS",
                description: "Harder paths have more enemies but offer better rewards. Choose wisely based on your current ship condition and playstyle.",
                highlight: null
            },
            {
                title: "PROGRESS",
                description: "Your goal is to reach the BOSS at the end of the sector. Defeat it to advance to the next sector with more challenges and better rewards.",
                highlight: null
            }
        ];
    }
    
    /**
     * Get the key for this specific tutorial
     */
    getTutorialKey() {
        return 'sector_map';
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.SectorMapTutorial = SectorMapTutorial;
}
