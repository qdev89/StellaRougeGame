/**
 * Nemesis Attack Guide
 * Provides a comprehensive guide to all Nemesis attack patterns and how to counter them
 */
class NemesisAttackGuide {
    constructor(scene) {
        this.scene = scene;
        
        // Attack patterns information
        this.attackPatterns = [
            {
                key: 'adaptive',
                name: 'Adaptive Attack',
                color: 0x33ccff,
                description: 'The Nemesis analyzes your tactics and adapts its attacks accordingly.',
                telegraph: 'Blue "ANALYZING" warning appears above the boss.',
                counters: [
                    'Vary your weapons and attack patterns',
                    'Don\'t rely on a single weapon type',
                    'Change position frequently'
                ],
                dangerLevel: 2
            },
            {
                key: 'phaseShift',
                name: 'Phase Shift',
                color: 0x9933cc,
                description: 'The Nemesis teleports to a new position and launches a surprise attack.',
                telegraph: 'Purple "PHASE SHIFT" warning with ghost images showing potential destinations.',
                counters: [
                    'Keep moving to avoid being cornered',
                    'Watch for the destination indicators',
                    'Be ready to dodge immediately after teleport'
                ],
                dangerLevel: 3
            },
            {
                key: 'beam',
                name: 'Beam Attack',
                color: 0xff3333,
                description: 'Fires a continuous high-damage beam that can quickly deplete health and shields.',
                telegraph: 'Red "CHARGING BEAM" warning with a line showing beam trajectory.',
                counters: [
                    'Move perpendicular to the beam path',
                    'Use cover if available',
                    'Keep moving to avoid being tracked'
                ],
                dangerLevel: 4
            },
            {
                key: 'shield',
                name: 'Shield Activation',
                color: 0x33ff33,
                description: 'Creates a protective shield that reduces incoming damage.',
                telegraph: 'Green "SHIELD ACTIVATION" warning with a circle around the boss.',
                counters: [
                    'Focus fire to break through the shield',
                    'Use high-damage weapons',
                    'Or wait for the shield to expire before attacking'
                ],
                dangerLevel: 1
            },
            {
                key: 'drones',
                name: 'Drone Deployment',
                color: 0xff9933,
                description: 'Deploys small attack drones that pursue the player and fire projectiles.',
                telegraph: 'Orange "DEPLOYING DRONES" warning.',
                counters: [
                    'Destroy drones quickly before they spread out',
                    'Use area-of-effect weapons',
                    'Keep moving to avoid being surrounded'
                ],
                dangerLevel: 3
            },
            {
                key: 'mines',
                name: 'Mine Deployment',
                color: 0xffcc33,
                description: 'Places proximity mines that explode when the player gets close.',
                telegraph: 'Yellow "DEPLOYING MINES" warning with circles showing mine locations.',
                counters: [
                    'Keep track of mine positions',
                    'Maintain distance from mines',
                    'Shoot mines from a safe distance to detonate them'
                ],
                dangerLevel: 3
            },
            {
                key: 'artillery',
                name: 'Artillery Strike',
                color: 0xff3333,
                description: 'Fires high-damage projectiles with area effect damage on impact.',
                telegraph: 'Red "ARTILLERY STRIKE" warning with target indicators.',
                counters: [
                    'Watch for target indicators and move away',
                    'Keep moving to avoid predictive targeting',
                    'Use short bursts of speed to evade'
                ],
                dangerLevel: 4
            },
            {
                key: 'spread',
                name: 'Spread Attack',
                color: 0x33ccff,
                description: 'Fires multiple projectiles in a wide pattern, covering a large area.',
                telegraph: 'Blue "SPREAD ATTACK" warning.',
                counters: [
                    'Find the gaps between projectiles',
                    'Move to the edge of the pattern',
                    'Time your movements carefully'
                ],
                dangerLevel: 2
            },
            {
                key: 'cloak',
                name: 'Cloaking',
                color: 0x9933cc,
                description: 'Becomes partially invisible and may launch surprise attacks.',
                telegraph: 'Purple "CLOAKING" warning with fading effect.',
                counters: [
                    'Watch for subtle visual cues',
                    'Keep moving to avoid surprise attacks',
                    'Listen for audio cues (when sound is enabled)'
                ],
                dangerLevel: 3
            },
            {
                key: 'bombs',
                name: 'Bomb Drop',
                color: 0xff6633,
                description: 'Drops explosive bombs with large blast radius and chain reactions.',
                telegraph: 'Orange "DROPPING BOMBS" warning with target zones.',
                counters: [
                    'Move away from drop zones',
                    'Keep distance from bombs',
                    'Watch for secondary explosions'
                ],
                dangerLevel: 4
            }
        ];
        
        // Combo attacks information
        this.comboAttacks = [
            {
                name: 'Extinction Protocol',
                description: 'A devastating sequence combining shield, beam, bombs, artillery, and spread attacks.',
                telegraph: 'Red "EXTINCTION PROTOCOL ACTIVATED" warning.',
                counters: [
                    'Prioritize dodging over attacking',
                    'Focus on survival through the sequence',
                    'Use shield or invulnerability abilities if available'
                ],
                dangerLevel: 5,
                phase: 'Final'
            },
            {
                name: 'Nemesis Fury',
                description: 'A rapid sequence of teleports, cloaking, drones, bombs, and beam attacks.',
                telegraph: 'Red "NEMESIS FURY UNLEASHED" warning.',
                counters: [
                    'Keep moving constantly',
                    'Destroy drones when possible',
                    'Watch for beam telegraph during the sequence'
                ],
                dangerLevel: 5,
                phase: 'Final'
            },
            {
                name: 'Corner Trap',
                description: 'A tactical combo using mines, artillery, and beam to trap the player in a corner.',
                telegraph: 'Red "CORNER TRAP ACTIVATED" warning.',
                counters: [
                    'Move to the center of the arena immediately',
                    'Avoid corners at all costs',
                    'Use dash or boost abilities to escape'
                ],
                dangerLevel: 4,
                phase: 'Defensive'
            },
            {
                name: 'Defensive Barrage',
                description: 'A defensive combo using shield, drones, and spread attacks to counter aggressive players.',
                telegraph: 'Green "DEFENSIVE BARRAGE" warning.',
                counters: [
                    'Back off temporarily',
                    'Focus on destroying drones',
                    'Attack from a distance'
                ],
                dangerLevel: 3,
                phase: 'Defensive'
            },
            {
                name: 'Overwhelming Force',
                description: 'An aggressive combo using artillery and multiple spread attacks.',
                telegraph: 'Red "CHARGING WEAPONS" warning.',
                counters: [
                    'Focus on evasion',
                    'Use cover if available',
                    'Time your movements between spread waves'
                ],
                dangerLevel: 4,
                phase: 'Aggressive'
            }
        ];
        
        // UI elements
        this.container = null;
        this.currentPage = 'attacks'; // 'attacks' or 'combos'
        this.currentAttackIndex = 0;
        this.currentComboIndex = 0;
    }
    
    /**
     * Show the attack guide
     */
    show() {
        // Pause the game
        this.scene.scene.pause();
        
        // Create UI
        this.createUI();
        
        // Show first attack
        this.showAttack(0);
        
        // Animate in
        this.animateIn();
    }
    
    /**
     * Create the UI elements
     */
    createUI() {
        // Create container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(2000);
        
        // Create semi-transparent background
        this.background = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.8
        );
        
        // Create title
        this.titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            30,
            "NEMESIS ATTACK GUIDE",
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Create tabs
        this.createTabs();
        
        // Create main panel
        this.mainPanel = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 20,
            700,
            400,
            0x333333,
            0.7
        );
        this.mainPanel.setStrokeStyle(2, 0x666666, 1);
        
        // Create content container
        this.contentContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 20
        );
        
        // Create navigation buttons
        this.createNavigationButtons();
        
        // Create close button
        this.closeButton = this.scene.add.text(
            this.scene.cameras.main.width - 20,
            20,
            "CLOSE",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ff3333',
                align: 'right',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(1, 0).setInteractive();
        
        // Add hover effect to close button
        this.closeButton.on('pointerover', () => {
            this.closeButton.setScale(1.1);
        });
        
        this.closeButton.on('pointerout', () => {
            this.closeButton.setScale(1);
        });
        
        // Add click handler to close button
        this.closeButton.on('pointerdown', () => {
            this.hide();
        });
        
        // Add elements to container
        this.container.add([
            this.background,
            this.titleText,
            this.mainPanel,
            this.contentContainer,
            this.closeButton
        ]);
        
        // Set initial alpha to 0
        this.container.alpha = 0;
    }
    
    /**
     * Create tabs for switching between attacks and combos
     */
    createTabs() {
        // Create tabs container
        this.tabsContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            80
        );
        
        // Create attacks tab
        this.attacksTab = this.scene.add.rectangle(
            -100, 0,
            180, 40,
            0x333333,
            0.7
        );
        this.attacksTab.setStrokeStyle(2, 0x666666, 1);
        this.attacksTab.setInteractive();
        
        this.attacksTabText = this.scene.add.text(
            -100, 0,
            "ATTACK PATTERNS",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create combos tab
        this.combosTab = this.scene.add.rectangle(
            100, 0,
            180, 40,
            0x333333,
            0.7
        );
        this.combosTab.setStrokeStyle(2, 0x666666, 1);
        this.combosTab.setInteractive();
        
        this.combosTabText = this.scene.add.text(
            100, 0,
            "COMBO ATTACKS",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Add hover effects
        this.attacksTab.on('pointerover', () => {
            this.attacksTab.setScale(1.05);
            this.attacksTabText.setScale(1.05);
        });
        
        this.attacksTab.on('pointerout', () => {
            this.attacksTab.setScale(1);
            this.attacksTabText.setScale(1);
        });
        
        this.combosTab.on('pointerover', () => {
            this.combosTab.setScale(1.05);
            this.combosTabText.setScale(1.05);
        });
        
        this.combosTab.on('pointerout', () => {
            this.combosTab.setScale(1);
            this.combosTabText.setScale(1);
        });
        
        // Add click handlers
        this.attacksTab.on('pointerdown', () => {
            this.setPage('attacks');
        });
        
        this.combosTab.on('pointerdown', () => {
            this.setPage('combos');
        });
        
        // Add to tabs container
        this.tabsContainer.add([
            this.attacksTab,
            this.attacksTabText,
            this.combosTab,
            this.combosTabText
        ]);
        
        // Add to main container
        this.container.add(this.tabsContainer);
        
        // Highlight active tab
        this.highlightActiveTab();
    }
    
    /**
     * Highlight the active tab
     */
    highlightActiveTab() {
        // Reset both tabs
        this.attacksTab.setFillStyle(0x333333, 0.7);
        this.combosTab.setFillStyle(0x333333, 0.7);
        
        // Highlight active tab
        if (this.currentPage === 'attacks') {
            this.attacksTab.setFillStyle(0x666666, 0.9);
        } else {
            this.combosTab.setFillStyle(0x666666, 0.9);
        }
    }
    
    /**
     * Create navigation buttons
     */
    createNavigationButtons() {
        // Create previous button
        this.prevButton = this.scene.add.triangle(
            -350, 0,
            0, 0,
            -20, 20,
            -20, -20,
            0xffffff, 0.7
        );
        this.prevButton.setInteractive();
        
        // Create next button
        this.nextButton = this.scene.add.triangle(
            350, 0,
            0, 0,
            20, 20,
            20, -20,
            0xffffff, 0.7
        );
        this.nextButton.setInteractive();
        
        // Add hover effects
        this.prevButton.on('pointerover', () => {
            this.prevButton.setScale(1.2);
        });
        
        this.prevButton.on('pointerout', () => {
            this.prevButton.setScale(1);
        });
        
        this.nextButton.on('pointerover', () => {
            this.nextButton.setScale(1.2);
        });
        
        this.nextButton.on('pointerout', () => {
            this.nextButton.setScale(1);
        });
        
        // Add click handlers
        this.prevButton.on('pointerdown', () => {
            if (this.currentPage === 'attacks') {
                this.showPreviousAttack();
            } else {
                this.showPreviousCombo();
            }
        });
        
        this.nextButton.on('pointerdown', () => {
            if (this.currentPage === 'attacks') {
                this.showNextAttack();
            } else {
                this.showNextCombo();
            }
        });
        
        // Add to content container
        this.contentContainer.add([this.prevButton, this.nextButton]);
    }
    
    /**
     * Set the current page
     * @param {string} page - Page to show ('attacks' or 'combos')
     */
    setPage(page) {
        this.currentPage = page;
        
        // Highlight active tab
        this.highlightActiveTab();
        
        // Show appropriate content
        if (page === 'attacks') {
            this.showAttack(this.currentAttackIndex);
        } else {
            this.showCombo(this.currentComboIndex);
        }
    }
    
    /**
     * Show a specific attack
     * @param {number} index - Index of the attack to show
     */
    showAttack(index) {
        // Validate index
        if (index < 0) {
            index = this.attackPatterns.length - 1;
        } else if (index >= this.attackPatterns.length) {
            index = 0;
        }
        
        // Update current index
        this.currentAttackIndex = index;
        
        // Clear content container
        this.clearContent();
        
        // Get attack data
        const attack = this.attackPatterns[index];
        
        // Create attack name
        const nameText = this.scene.add.text(
            0, -170,
            attack.name,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#' + attack.color.toString(16).padStart(6, '0'),
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Create danger level
        const dangerText = this.scene.add.text(
            0, -140,
            `Danger Level: ${this.getDangerStars(attack.dangerLevel)}`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: this.getDangerColor(attack.dangerLevel),
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create description
        const descriptionText = this.scene.add.text(
            0, -100,
            attack.description,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: 600 }
            }
        ).setOrigin(0.5);
        
        // Create telegraph info
        const telegraphTitle = this.scene.add.text(
            -250, -50,
            "TELEGRAPH:",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffcc33',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0, 0.5);
        
        const telegraphText = this.scene.add.text(
            -250, -20,
            attack.telegraph,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: 600 }
            }
        ).setOrigin(0, 0);
        
        // Create counters
        const countersTitle = this.scene.add.text(
            -250, 50,
            "HOW TO COUNTER:",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#33ff33',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0, 0.5);
        
        // Create counter items
        const counterItems = [];
        attack.counters.forEach((counter, i) => {
            const counterText = this.scene.add.text(
                -230, 80 + (i * 30),
                `• ${counter}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'left',
                    stroke: '#000000',
                    strokeThickness: 2,
                    wordWrap: { width: 580 }
                }
            ).setOrigin(0, 0);
            
            counterItems.push(counterText);
        });
        
        // Create page indicator
        const pageText = this.scene.add.text(
            0, 170,
            `${index + 1}/${this.attackPatterns.length}`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Add all elements to content container
        this.contentContainer.add([
            nameText,
            dangerText,
            descriptionText,
            telegraphTitle,
            telegraphText,
            countersTitle,
            ...counterItems,
            pageText
        ]);
    }
    
    /**
     * Show a specific combo
     * @param {number} index - Index of the combo to show
     */
    showCombo(index) {
        // Validate index
        if (index < 0) {
            index = this.comboAttacks.length - 1;
        } else if (index >= this.comboAttacks.length) {
            index = 0;
        }
        
        // Update current index
        this.currentComboIndex = index;
        
        // Clear content container
        this.clearContent();
        
        // Get combo data
        const combo = this.comboAttacks[index];
        
        // Create combo name
        const nameText = this.scene.add.text(
            0, -170,
            combo.name,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ff3333',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Create phase info
        const phaseText = this.scene.add.text(
            0, -140,
            `Phase: ${combo.phase}`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffcc33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create danger level
        const dangerText = this.scene.add.text(
            0, -110,
            `Danger Level: ${this.getDangerStars(combo.dangerLevel)}`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: this.getDangerColor(combo.dangerLevel),
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create description
        const descriptionText = this.scene.add.text(
            0, -70,
            combo.description,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: 600 }
            }
        ).setOrigin(0.5);
        
        // Create telegraph info
        const telegraphTitle = this.scene.add.text(
            -250, -20,
            "TELEGRAPH:",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffcc33',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0, 0.5);
        
        const telegraphText = this.scene.add.text(
            -250, 10,
            combo.telegraph,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: 600 }
            }
        ).setOrigin(0, 0);
        
        // Create counters
        const countersTitle = this.scene.add.text(
            -250, 50,
            "HOW TO COUNTER:",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#33ff33',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0, 0.5);
        
        // Create counter items
        const counterItems = [];
        combo.counters.forEach((counter, i) => {
            const counterText = this.scene.add.text(
                -230, 80 + (i * 30),
                `• ${counter}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'left',
                    stroke: '#000000',
                    strokeThickness: 2,
                    wordWrap: { width: 580 }
                }
            ).setOrigin(0, 0);
            
            counterItems.push(counterText);
        });
        
        // Create page indicator
        const pageText = this.scene.add.text(
            0, 170,
            `${index + 1}/${this.comboAttacks.length}`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Add all elements to content container
        this.contentContainer.add([
            nameText,
            phaseText,
            dangerText,
            descriptionText,
            telegraphTitle,
            telegraphText,
            countersTitle,
            ...counterItems,
            pageText
        ]);
    }
    
    /**
     * Clear the content container
     */
    clearContent() {
        // Remove all children except navigation buttons
        const children = [...this.contentContainer.getAll()];
        children.forEach(child => {
            if (child !== this.prevButton && child !== this.nextButton) {
                this.contentContainer.remove(child, true);
            }
        });
    }
    
    /**
     * Show the next attack
     */
    showNextAttack() {
        this.showAttack(this.currentAttackIndex + 1);
    }
    
    /**
     * Show the previous attack
     */
    showPreviousAttack() {
        this.showAttack(this.currentAttackIndex - 1);
    }
    
    /**
     * Show the next combo
     */
    showNextCombo() {
        this.showCombo(this.currentComboIndex + 1);
    }
    
    /**
     * Show the previous combo
     */
    showPreviousCombo() {
        this.showCombo(this.currentComboIndex - 1);
    }
    
    /**
     * Get danger level stars
     * @param {number} level - Danger level (1-5)
     * @returns {string} Star representation
     */
    getDangerStars(level) {
        return '★'.repeat(level) + '☆'.repeat(5 - level);
    }
    
    /**
     * Get color for danger level
     * @param {number} level - Danger level (1-5)
     * @returns {string} Color in hex format
     */
    getDangerColor(level) {
        switch (level) {
            case 1: return '#33ff33'; // Green
            case 2: return '#ffcc33'; // Yellow
            case 3: return '#ff9933'; // Orange
            case 4: return '#ff6633'; // Dark Orange
            case 5: return '#ff3333'; // Red
            default: return '#ffffff'; // White
        }
    }
    
    /**
     * Animate the UI in
     */
    animateIn() {
        // Fade in container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }
    
    /**
     * Hide the attack guide
     */
    hide() {
        // Fade out container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Destroy container
                this.container.destroy();
                
                // Resume game
                this.scene.scene.resume();
            }
        });
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisAttackGuide = NemesisAttackGuide;
}
