/**
 * Nemesis Tutorial System
 * Provides in-game tutorials and help for the Nemesis boss fight
 */
class NemesisTutorial {
    constructor(scene) {
        this.scene = scene;
        
        // Tutorial state
        this.active = false;
        this.currentStep = 0;
        this.tutorialComplete = false;
        
        // Tutorial elements
        this.container = null;
        this.background = null;
        this.titleText = null;
        this.descriptionText = null;
        this.nextButton = null;
        this.skipButton = null;
        
        // Tutorial steps
        this.steps = [
            {
                title: "THE NEMESIS",
                description: "You face the ultimate enemy: THE NEMESIS. This powerful boss adapts to your playstyle and uses attacks from all previous bosses you've defeated.",
                highlight: "boss"
            },
            {
                title: "ATTACK TELEGRAPHS",
                description: "The Nemesis will telegraph its attacks with colored indicators. Pay attention to these warnings to avoid taking damage!",
                highlight: "telegraph"
            },
            {
                title: "COLOR CODING",
                description: "Different colors indicate different attack types:\n• RED: High damage attacks\n• BLUE: Spread attacks\n• YELLOW: Area effects\n• GREEN: Defensive abilities\n• PURPLE: Movement abilities",
                highlight: "colors"
            },
            {
                title: "COMBO ATTACKS",
                description: "The Nemesis can chain multiple attacks together in devastating combos. These are telegraphed with special warnings. Prepare to dodge multiple attacks in sequence!",
                highlight: "combo"
            },
            {
                title: "ADAPTATION",
                description: "The Nemesis adapts to your weapons and tactics. If you rely too heavily on one weapon, it will develop resistance. Vary your approach to maximize damage!",
                highlight: "adaptation"
            },
            {
                title: "PHASES",
                description: "The Nemesis fight has 5 phases, each with increasing difficulty and new attack patterns. Survive all phases to defeat this ultimate enemy!",
                highlight: "phases"
            },
            {
                title: "READY FOR BATTLE",
                description: "You now know the basics of fighting The Nemesis. Good luck, pilot. The fate of the galaxy rests on your success!",
                highlight: "none"
            }
        ];
        
        // Help tooltips for specific attack types
        this.attackTooltips = {
            beam: {
                title: "BEAM ATTACK",
                description: "A continuous high-damage beam. Move perpendicular to the beam path to avoid it!"
            },
            phaseShift: {
                title: "PHASE SHIFT",
                description: "The Nemesis will teleport to a new position and attack. Watch for the destination indicators!"
            },
            shield: {
                title: "SHIELD ACTIVATION",
                description: "The Nemesis is generating a protective shield. Focus fire to break through or wait for it to expire."
            },
            drones: {
                title: "DRONE DEPLOYMENT",
                description: "Small attack drones will pursue you. Destroy them quickly or outmaneuver them!"
            },
            mines: {
                title: "MINE DEPLOYMENT",
                description: "Proximity mines will be placed in the arena. Keep your distance or they'll explode!"
            },
            artillery: {
                title: "ARTILLERY STRIKE",
                description: "High-damage projectiles with area effect. Watch for target indicators and move away!"
            },
            spread: {
                title: "SPREAD ATTACK",
                description: "Multiple projectiles fired in a wide pattern. Find the gaps between projectiles!"
            },
            cloak: {
                title: "CLOAKING",
                description: "The Nemesis becomes partially invisible and may launch surprise attacks. Stay alert!"
            },
            bombs: {
                title: "BOMB DROP",
                description: "Explosive bombs with large blast radius. Move away from the drop zones!"
            },
            adaptive: {
                title: "ADAPTIVE ATTACK",
                description: "The Nemesis is analyzing your tactics. Prepare for a counterattack!"
            }
        };
        
        // Check if tutorial has been completed before
        this.checkTutorialStatus();
    }
    
    /**
     * Check if the tutorial has been completed before
     */
    checkTutorialStatus() {
        try {
            const completed = localStorage.getItem('nemesis_tutorial_complete');
            this.tutorialComplete = completed === 'true';
        } catch (error) {
            console.warn('Failed to check Nemesis tutorial status', error);
            this.tutorialComplete = false;
        }
    }
    
    /**
     * Start the tutorial
     */
    startTutorial() {
        // Skip if already active or completed
        if (this.active) return;
        
        // If tutorial is complete, only show if explicitly requested
        if (this.tutorialComplete) return;
        
        // Set active
        this.active = true;
        this.currentStep = 0;
        
        // Pause the game
        this.scene.scene.pause();
        
        // Create tutorial UI
        this.createTutorialUI();
        
        // Show first step
        this.showStep(0);
    }
    
    /**
     * Create the tutorial UI
     */
    createTutorialUI() {
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
            0.7
        );
        
        // Create title text
        this.titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            "NEMESIS TUTORIAL",
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Create description text
        this.descriptionText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            "Learn how to fight the Nemesis boss",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#cccccc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                wordWrap: { width: this.scene.cameras.main.width * 0.8 }
            }
        ).setOrigin(0.5);
        
        // Create next button
        this.nextButton = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 150,
            "NEXT",
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setInteractive();
        
        // Add hover effect to next button
        this.nextButton.on('pointerover', () => {
            this.nextButton.setScale(1.1);
        });
        
        this.nextButton.on('pointerout', () => {
            this.nextButton.setScale(1);
        });
        
        // Add click handler to next button
        this.nextButton.on('pointerdown', () => {
            this.nextStep();
        });
        
        // Create skip button
        this.skipButton = this.scene.add.text(
            this.scene.cameras.main.width - 20,
            20,
            "SKIP TUTORIAL",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'right',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(1, 0).setInteractive();
        
        // Add hover effect to skip button
        this.skipButton.on('pointerover', () => {
            this.skipButton.setScale(1.1);
        });
        
        this.skipButton.on('pointerout', () => {
            this.skipButton.setScale(1);
        });
        
        // Add click handler to skip button
        this.skipButton.on('pointerdown', () => {
            this.endTutorial();
        });
        
        // Add elements to container
        this.container.add([
            this.background,
            this.titleText,
            this.descriptionText,
            this.nextButton,
            this.skipButton
        ]);
    }
    
    /**
     * Show a specific tutorial step
     * @param {number} stepIndex - Index of the step to show
     */
    showStep(stepIndex) {
        // Validate step index
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            this.endTutorial();
            return;
        }
        
        // Get step data
        const step = this.steps[stepIndex];
        
        // Update title and description
        this.titleText.setText(step.title);
        this.descriptionText.setText(step.description);
        
        // Update button text for last step
        if (stepIndex === this.steps.length - 1) {
            this.nextButton.setText("START BATTLE");
        } else {
            this.nextButton.setText("NEXT");
        }
        
        // Show highlight if needed
        this.showHighlight(step.highlight);
    }
    
    /**
     * Show highlight for a specific element
     * @param {string} highlightType - Type of element to highlight
     */
    showHighlight(highlightType) {
        // Remove any existing highlight
        if (this.highlight) {
            this.highlight.destroy();
            this.highlight = null;
        }
        
        // Create new highlight based on type
        switch (highlightType) {
            case "boss":
                // Highlight the boss
                if (this.scene.nemesisBoss) {
                    this.highlight = this.scene.add.circle(
                        this.scene.nemesisBoss.x,
                        this.scene.nemesisBoss.y,
                        100,
                        0xffffff,
                        0.3
                    );
                    this.highlight.setStrokeStyle(4, 0xffffff, 0.7);
                    this.container.add(this.highlight);
                }
                break;
                
            case "telegraph":
                // Create example telegraph
                this.highlight = this.scene.add.container(
                    this.scene.cameras.main.width / 2,
                    this.scene.cameras.main.height / 2 + 70
                );
                
                const telegraphBg = this.scene.add.rectangle(0, 0, 200, 40, 0xff3333, 0.7);
                telegraphBg.setStrokeStyle(2, 0xffffff, 0.5);
                
                const telegraphText = this.scene.add.text(
                    0, 0,
                    "BEAM ATTACK",
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ffffff',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5);
                
                this.highlight.add([telegraphBg, telegraphText]);
                
                // Add pulsing effect
                this.scene.tweens.add({
                    targets: this.highlight,
                    scaleX: { from: 1, to: 1.1 },
                    scaleY: { from: 1, to: 1.1 },
                    alpha: { from: 1, to: 0.8 },
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
                
                this.container.add(this.highlight);
                break;
                
            case "colors":
                // Create color examples
                this.highlight = this.scene.add.container(
                    this.scene.cameras.main.width / 2,
                    this.scene.cameras.main.height / 2 + 100
                );
                
                const colors = [
                    { color: 0xff3333, text: "DAMAGE" },
                    { color: 0x33ccff, text: "SPREAD" },
                    { color: 0xffcc33, text: "AREA" },
                    { color: 0x33ff33, text: "DEFENSE" },
                    { color: 0x9933cc, text: "MOVEMENT" }
                ];
                
                let xOffset = -300;
                colors.forEach(colorInfo => {
                    const colorBox = this.scene.add.rectangle(
                        xOffset, 0,
                        100, 30,
                        colorInfo.color,
                        0.7
                    );
                    colorBox.setStrokeStyle(2, 0xffffff, 0.5);
                    
                    const colorText = this.scene.add.text(
                        xOffset, 40,
                        colorInfo.text,
                        {
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#ffffff',
                            align: 'center',
                            stroke: '#000000',
                            strokeThickness: 1
                        }
                    ).setOrigin(0.5);
                    
                    this.highlight.add([colorBox, colorText]);
                    xOffset += 150;
                });
                
                this.container.add(this.highlight);
                break;
                
            case "combo":
                // Create combo example
                this.highlight = this.scene.add.container(
                    this.scene.cameras.main.width / 2,
                    this.scene.cameras.main.height / 2 + 70
                );
                
                const comboBg = this.scene.add.rectangle(0, 0, 300, 40, 0xff0000, 0.7);
                comboBg.setStrokeStyle(2, 0xffffff, 0.5);
                
                const comboText = this.scene.add.text(
                    0, 0,
                    "EXTINCTION PROTOCOL ACTIVATED",
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5);
                
                this.highlight.add([comboBg, comboText]);
                
                // Add pulsing effect
                this.scene.tweens.add({
                    targets: this.highlight,
                    scaleX: { from: 1, to: 1.1 },
                    scaleY: { from: 1, to: 1.1 },
                    alpha: { from: 1, to: 0.8 },
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
                
                this.container.add(this.highlight);
                break;
                
            case "adaptation":
                // Create adaptation example
                this.highlight = this.scene.add.container(
                    this.scene.cameras.main.width / 2,
                    this.scene.cameras.main.height / 2 + 70
                );
                
                const adaptBg = this.scene.add.rectangle(0, 0, 200, 40, 0x33ccff, 0.7);
                adaptBg.setStrokeStyle(2, 0xffffff, 0.5);
                
                const adaptText = this.scene.add.text(
                    0, 0,
                    "ANALYZING",
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ffffff',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 2
                    }
                ).setOrigin(0.5);
                
                // Add shield effect
                const shield = this.scene.add.circle(0, 0, 80, 0x33ccff, 0.3);
                shield.setStrokeStyle(2, 0x33ccff, 0.7);
                
                this.highlight.add([shield, adaptBg, adaptText]);
                
                // Add pulsing effect
                this.scene.tweens.add({
                    targets: [adaptBg, adaptText],
                    scaleX: { from: 1, to: 1.1 },
                    scaleY: { from: 1, to: 1.1 },
                    alpha: { from: 1, to: 0.8 },
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
                
                this.scene.tweens.add({
                    targets: shield,
                    alpha: { from: 0.3, to: 0.5 },
                    scale: { from: 1, to: 1.2 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                
                this.container.add(this.highlight);
                break;
                
            case "phases":
                // Create phase example
                this.highlight = this.scene.add.container(
                    this.scene.cameras.main.width / 2,
                    this.scene.cameras.main.height / 2 + 70
                );
                
                const phaseTexts = [
                    { text: "PHASE 1: ADAPTATION", color: 0x33cc33 },
                    { text: "PHASE 2: AGGRESSIVE", color: 0x33ccff },
                    { text: "PHASE 3: DEFENSIVE", color: 0xffcc33 },
                    { text: "PHASE 4: DESPERATE", color: 0xff6633 },
                    { text: "PHASE 5: FINAL", color: 0xff3333 }
                ];
                
                let yOffset = -60;
                phaseTexts.forEach(phase => {
                    const phaseText = this.scene.add.text(
                        0, yOffset,
                        phase.text,
                        {
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            color: '#ffffff',
                            align: 'center',
                            stroke: '#000000',
                            strokeThickness: 2
                        }
                    ).setOrigin(0.5);
                    
                    // Add color indicator
                    const colorBox = this.scene.add.rectangle(
                        -120, yOffset,
                        20, 20,
                        phase.color,
                        0.7
                    );
                    
                    this.highlight.add([phaseText, colorBox]);
                    yOffset += 30;
                });
                
                this.container.add(this.highlight);
                break;
        }
    }
    
    /**
     * Move to the next tutorial step
     */
    nextStep() {
        this.currentStep++;
        
        if (this.currentStep >= this.steps.length) {
            this.endTutorial();
        } else {
            this.showStep(this.currentStep);
        }
    }
    
    /**
     * End the tutorial
     */
    endTutorial() {
        // Mark tutorial as complete
        this.tutorialComplete = true;
        
        try {
            localStorage.setItem('nemesis_tutorial_complete', 'true');
        } catch (error) {
            console.warn('Failed to save Nemesis tutorial status', error);
        }
        
        // Destroy tutorial UI
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        // Set inactive
        this.active = false;
        
        // Resume the game
        this.scene.scene.resume();
    }
    
    /**
     * Show a tooltip for a specific attack type
     * @param {string} attackType - Type of attack
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showAttackTooltip(attackType, x, y) {
        // Skip if tutorial is active
        if (this.active) return;
        
        // Get tooltip data
        const tooltip = this.attackTooltips[attackType];
        if (!tooltip) return;
        
        // Create tooltip container
        const container = this.scene.add.container(x, y - 80);
        container.setDepth(1500);
        
        // Create background
        const bg = this.scene.add.rectangle(
            0, 0,
            300, 80,
            0x000000,
            0.8
        );
        bg.setStrokeStyle(2, 0xffffff, 0.5);
        
        // Create title
        const title = this.scene.add.text(
            0, -25,
            tooltip.title,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create description
        const description = this.scene.add.text(
            0, 5,
            tooltip.description,
            {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#cccccc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 1,
                wordWrap: { width: 280 }
            }
        ).setOrigin(0.5);
        
        // Add elements to container
        container.add([bg, title, description]);
        
        // Fade in
        container.alpha = 0;
        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            duration: 200
        });
        
        // Auto-destroy after delay
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: container,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    container.destroy();
                }
            });
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
    window.NemesisTutorial = NemesisTutorial;
}
