/**
 * Nemesis Health Bar
 * A specialized health bar for the Nemesis boss that shows phase transitions and current form
 */
class NemesisHealthBar {
    constructor(scene, nemesis) {
        this.scene = scene;
        this.nemesis = nemesis;
        
        // Create container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000);
        this.container.setScrollFactor(0);
        
        // Create background
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0x000000, 0.7);
        this.background.fillRect(0, 0, this.scene.cameras.main.width, 50);
        
        // Create boss name text
        this.nameText = this.scene.add.text(
            20,
            10,
            'THE NEMESIS',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'left'
            }
        );
        
        // Create health bar background
        this.healthBarBg = this.scene.add.graphics();
        this.healthBarBg.fillStyle(0x333333, 1);
        this.healthBarBg.fillRect(20, 35, this.scene.cameras.main.width - 40, 10);
        
        // Create health bar
        this.healthBar = this.scene.add.graphics();
        
        // Create phase markers
        this.phaseMarkers = [];
        
        // Add all elements to container
        this.container.add([
            this.background,
            this.nameText,
            this.healthBarBg,
            this.healthBar
        ]);
        
        // Initialize health bar
        this.createPhaseMarkers();
        this.updateHealthBar();
    }
    
    /**
     * Create phase markers based on nemesis phase thresholds
     */
    createPhaseMarkers() {
        // Clear existing markers
        this.phaseMarkers.forEach(marker => marker.destroy());
        this.phaseMarkers = [];
        
        // Get phase thresholds from nemesis
        const thresholds = this.nemesis.phaseThresholds || [];
        
        // Create a marker for each threshold
        thresholds.forEach(threshold => {
            const marker = this.scene.add.graphics();
            marker.lineStyle(2, 0xffffff, 0.8);
            
            const x = 20 + ((this.scene.cameras.main.width - 40) * (1 - threshold));
            marker.lineBetween(x, 33, x, 47);
            
            this.container.add(marker);
            this.phaseMarkers.push(marker);
        });
    }
    
    /**
     * Update the health bar based on current nemesis health
     */
    updateHealthBar() {
        if (!this.nemesis || !this.nemesis.active) return;
        
        // Calculate health percentage
        const healthPercent = this.nemesis.health / this.nemesis.maxHealth;
        
        // Clear existing health bar
        this.healthBar.clear();
        
        // Determine color based on health percentage
        let color;
        if (healthPercent > 0.6) {
            color = 0x33ff33; // Green
        } else if (healthPercent > 0.3) {
            color = 0xffff33; // Yellow
        } else {
            color = 0xff3333; // Red
        }
        
        // Draw health bar
        this.healthBar.fillStyle(color, 1);
        this.healthBar.fillRect(
            20,
            35,
            (this.scene.cameras.main.width - 40) * healthPercent,
            10
        );
        
        // Update boss name with current form if morphing
        if (this.nemesis.morphForms && this.nemesis.morphForms.length > 0) {
            const currentForm = this.nemesis.morphForms[this.nemesis.currentMorphForm];
            let formName = "THE NEMESIS";
            
            switch (currentForm) {
                case 'SCOUT_COMMANDER':
                    formName = "THE GUARDIAN";
                    break;
                case 'BATTLE_CARRIER':
                    formName = "THE CARRIER";
                    break;
                case 'DESTROYER_PRIME':
                    formName = "DESTROYER PRIME";
                    break;
                case 'STEALTH_OVERLORD':
                    formName = "STEALTH OVERLORD";
                    break;
                case 'DREADNOUGHT':
                    formName = "THE DREADNOUGHT";
                    break;
                case 'BOMBER_TITAN':
                    formName = "BOMBER TITAN";
                    break;
                case 'NEMESIS':
                    formName = "THE NEMESIS";
                    break;
            }
            
            this.nameText.setText(`${formName} (PHASE ${this.nemesis.currentPhase + 1})`);
            
            // Set text color based on current form
            switch (currentForm) {
                case 'SCOUT_COMMANDER':
                    this.nameText.setColor('#33ff33'); // Green
                    break;
                case 'BATTLE_CARRIER':
                    this.nameText.setColor('#ffcc33'); // Yellow
                    break;
                case 'DESTROYER_PRIME':
                    this.nameText.setColor('#ff3333'); // Red
                    break;
                case 'STEALTH_OVERLORD':
                    this.nameText.setColor('#cc33ff'); // Purple
                    break;
                case 'DREADNOUGHT':
                    this.nameText.setColor('#ffffff'); // White
                    break;
                case 'BOMBER_TITAN':
                    this.nameText.setColor('#ff9933'); // Orange
                    break;
                case 'NEMESIS':
                    this.nameText.setColor('#3366cc'); // Blue
                    break;
                default:
                    this.nameText.setColor('#ffffff'); // White
            }
        } else {
            this.nameText.setText(`THE NEMESIS (PHASE ${this.nemesis.currentPhase + 1})`);
        }
    }
    
    /**
     * Update method called every frame
     */
    update() {
        if (this.nemesis && this.nemesis.active) {
            this.updateHealthBar();
        }
    }
    
    /**
     * Show the health bar
     */
    show() {
        this.container.setVisible(true);
    }
    
    /**
     * Hide the health bar
     */
    hide() {
        this.container.setVisible(false);
    }
    
    /**
     * Clean up resources when destroyed
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisHealthBar = NemesisHealthBar;
}
