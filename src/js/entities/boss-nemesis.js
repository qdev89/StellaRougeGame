/**
 * Nemesis Boss
 * Final boss that adapts based on player's previous boss encounters
 * Extends the BossEnemy class
 */
class BossNemesis extends BossEnemy {
    constructor(scene, x, y, config) {
        // Default configuration if none provided
        const nemesisConfig = config || {
            health: CONSTANTS.ENEMIES.BOSSES.NEMESIS.HEALTH,
            score: CONSTANTS.ENEMIES.BOSSES.NEMESIS.SCORE,
            phaseThresholds: [0.8, 0.6, 0.4, 0.2], // 5 phases
            phases: ['adaptive', 'aggressive', 'defensive', 'desperate', 'final'],
            attackPatterns: ['adaptive', 'phaseShift', 'beam', 'shield', 'drones', 'mines', 'artillery', 'spread', 'cloak', 'bombs'],
            resistances: {},
            appearance: {
                baseColor: '#3366cc',
                highlights: [],
                parts: []
            }
        };

        // Call parent constructor with nemesis configuration
        super(scene, x, y, 'boss-nemesis', nemesisConfig);

        // Nemesis-specific properties
        this.name = "THE NEMESIS";
        this.adaptiveBehavior = nemesisConfig.adaptiveBehavior || false;
        this.resistances = nemesisConfig.resistances || {};
        this.appearance = nemesisConfig.appearance || {};
        this.defeatedBosses = nemesisConfig.defeatedBosses || {};
        this.defeatMethods = nemesisConfig.defeatMethods || {};

        // Adaptive properties
        this.adaptationTimer = 0;
        this.adaptationInterval = 5000; // ms between adaptations
        this.lastAdaptedWeapon = null;

        // Morphing properties
        this.morphTimer = 0;
        this.morphInterval = 10000; // ms between morphs
        this.currentMorphForm = 0;
        this.morphForms = this.generateMorphForms();

        // Attack pattern properties
        this.attackPatternTimer = 0;
        this.attackPatternInterval = 3000; // ms between attacks
        this.attackPatterns = nemesisConfig.attackPatterns || [];
        this.currentPattern = 'adaptive';

        // Combo attack properties
        this.comboTimer = 0;
        this.comboInterval = 15000; // 15 seconds between combo attempts

        // Damage multiplier (for adaptive difficulty)
        this.damageMultiplier = 1.0;

        // Create nemesis-specific visual effects
        this.createNemesisEffects();

        // Create attack pattern manager
        this.createAttackPatternManager();

        // Create sound manager
        this.createSoundManager();

        // Create attack telegraph
        this.createAttackTelegraph();

        // Create combo attack manager
        this.createComboAttackManager();

        // Create adaptive difficulty system
        this.createAdaptiveDifficulty();

        // Create tutorial system
        this.createTutorialSystem();

        // Create situation-specific combo system
        this.createSituationCombos();

        // Record encounter in nemesis system
        if (scene.game.global.nemesisSystem) {
            scene.game.global.nemesisSystem.recordNemesisEncounter();
        }

        // Show tutorial on first encounter
        this.showTutorial();
    }

    /**
     * Generate morph forms based on defeated bosses
     * @returns {array} Array of boss types to morph into
     */
    generateMorphForms() {
        const forms = [];

        // Add forms for each defeated boss
        if (this.defeatedBosses.SCOUT_COMMANDER) forms.push('SCOUT_COMMANDER');
        if (this.defeatedBosses.BATTLE_CARRIER) forms.push('BATTLE_CARRIER');
        if (this.defeatedBosses.DESTROYER_PRIME) forms.push('DESTROYER_PRIME');
        if (this.defeatedBosses.STEALTH_OVERLORD) forms.push('STEALTH_OVERLORD');
        if (this.defeatedBosses.DREADNOUGHT) forms.push('DREADNOUGHT');
        if (this.defeatedBosses.BOMBER_TITAN) forms.push('BOMBER_TITAN');

        // If no bosses defeated, use default forms
        if (forms.length === 0) {
            forms.push('SCOUT_COMMANDER', 'BATTLE_CARRIER', 'DESTROYER_PRIME');
        }

        // Add NEMESIS as the final form
        forms.push('NEMESIS');

        return forms;
    }

    /**
     * Create visual effects specific to the Nemesis boss
     */
    createNemesisEffects() {
        // Create enhanced visual effects using the NemesisEnhancedEffects class
        this.effectsManager = new NemesisEnhancedEffects(this.scene, this);

        // Show initial core effect
        if (this.effectsManager) {
            this.effectsManager.showCoreEffect({
                duration: 0,  // Continuous effect
                color: 0x3366cc
            });
        }
    }

    /**
     * Create attack pattern manager
     */
    createAttackPatternManager() {
        // Create attack pattern manager
        this.attackManager = new NemesisAttackPatterns(this.scene, this);
    }

    /**
     * Create sound manager
     */
    createSoundManager() {
        // Create sound manager
        this.soundManager = new NemesisSoundManager(this.scene);
    }

    /**
     * Create attack telegraph
     */
    createAttackTelegraph() {
        // Create attack telegraph
        this.telegraphManager = new NemesisAttackTelegraph(this.scene);
    }

    /**
     * Create combo attack manager
     */
    createComboAttackManager() {
        // Create combo attack manager
        this.comboManager = new NemesisComboAttacks(this.scene, this, this.attackManager);
    }

    /**
     * Create adaptive difficulty system
     */
    createAdaptiveDifficulty() {
        // Create adaptive difficulty system
        this.adaptiveDifficulty = new NemesisAdaptiveDifficulty(this.scene);

        // Apply initial settings
        this.adaptiveDifficulty.applySettings(this);
    }

    /**
     * Create tutorial system
     */
    createTutorialSystem() {
        // Create tutorial system
        this.tutorial = new NemesisTutorial(this.scene);
    }

    /**
     * Create situation-specific combo system
     */
    createSituationCombos() {
        // Create situation-specific combo system
        this.situationCombos = new NemesisSituationCombos(this.scene, this, this.comboManager);
    }

    /**
     * Show tutorial for first encounter
     */
    showTutorial() {
        // Show tutorial if it exists
        if (this.tutorial) {
            this.tutorial.startTutorial();
        }
    }

    /**
     * Update method called every frame
     */
    update(time, delta) {
        super.update(time, delta);

        // Update visual effects
        if (this.effectsManager) {
            this.effectsManager.update(time, delta);
        }

        // Update attack pattern manager
        if (this.attackManager) {
            this.attackManager.update(time, delta);
        }

        // Update telegraph manager
        if (this.telegraphManager) {
            this.telegraphManager.update(time, delta);
        }

        // Update combo manager
        if (this.comboManager) {
            this.comboManager.update(time, delta);
        }

        // Update adaptive difficulty
        if (this.adaptiveDifficulty) {
            this.adaptiveDifficulty.update(delta);
        }

        // Update situation combos
        if (this.situationCombos) {
            this.situationCombos.update(time, delta);
        }

        // Handle adaptive behavior
        if (this.adaptiveBehavior) {
            this.handleAdaptiveBehavior();
        }

        // Handle morphing between forms
        this.handleMorphing();

        // Handle attack patterns
        this.handleAttackPatterns(time, delta);

        // Handle combo attacks
        this.handleComboAttacks(time, delta);

        // Handle situation-specific combos
        this.handleSituationCombos(time, delta);
    }

    /**
     * Handle attack patterns
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    handleAttackPatterns(time, delta) {
        // Increment attack pattern timer
        this.attackPatternTimer += delta;

        // Check if it's time to execute an attack pattern
        if (this.attackPatternTimer >= this.attackPatternInterval) {
            this.attackPatternTimer = 0;
            this.executeAttackPattern();
        }
    }

    /**
     * Execute the current attack pattern
     */
    executeAttackPattern() {
        // Skip if no attack manager
        if (!this.attackManager) return;

        // Determine the pattern to execute
        let pattern;
        if (this.currentPattern === 'all') {
            // In 'all' mode, randomly choose from available patterns
            pattern = this.attackPatterns[Math.floor(Math.random() * this.attackPatterns.length)];
        } else {
            // Use the current pattern
            pattern = this.currentPattern;
        }

        // Show telegraph for the attack
        if (this.telegraphManager) {
            this.telegraphManager.showTelegraph(pattern, this);
        }

        // Play sound for the attack
        if (this.soundManager) {
            this.soundManager.playAttackSound(pattern);
        }

        // Execute the pattern after a short delay
        this.scene.time.delayedCall(800, () => {
            this.attackManager.executePattern(pattern);
        });
    }

    /**
     * Handle combo attacks
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    handleComboAttacks(time, delta) {
        // Skip if no combo manager
        if (!this.comboManager) return;

        // Increment combo timer
        this.comboTimer += delta;

        // Check if it's time to try a combo
        if (this.comboTimer >= this.comboInterval) {
            this.comboTimer = 0;

            // Try to execute a combo
            const executed = this.comboManager.tryExecuteCombo();

            // If combo executed, play sound
            if (executed && this.soundManager) {
                this.soundManager.play('morph', { volume: 0.7 });
            }
        }
    }

    /**
     * Handle situation-specific combo attacks
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    handleSituationCombos(time, delta) {
        // Skip if no situation combos manager
        if (!this.situationCombos) return;

        // Only try situation combos if not already executing a combo
        if (this.comboManager && !this.comboManager.activeCombo) {
            // Try to execute a situation-specific combo
            const executed = this.situationCombos.trySituationCombo();

            // If combo executed, play sound
            if (executed && this.soundManager) {
                this.soundManager.play('morph', { volume: 0.8 });
            }
        }
    }

    /**
     * Handle adaptive behavior based on player actions
     */
    handleAdaptiveBehavior() {
        // Increment adaptation timer
        this.adaptationTimer += this.scene.time.deltaTime;

        // Check if it's time to adapt
        if (this.adaptationTimer >= this.adaptationInterval) {
            this.adaptationTimer = 0;
            this.adaptToPlayerWeapon();
        }
    }

    /**
     * Adapt to the player's current weapon
     */
    adaptToPlayerWeapon() {
        // Get player's current weapon
        const player = this.scene.player;
        if (!player) return;

        const currentWeapon = player.currentWeapon;

        // Don't adapt if it's the same as last time
        if (currentWeapon === this.lastAdaptedWeapon) return;

        // Adapt resistances based on weapon
        this.lastAdaptedWeapon = currentWeapon;

        // Visual feedback for adaptation
        this.showAdaptationEffect(currentWeapon);

        console.log(`Nemesis adapting to weapon: ${currentWeapon}`);
    }

    /**
     * Show visual effect for adaptation
     * @param {string} weaponType - Type of weapon being adapted to
     */
    showAdaptationEffect(weaponType) {
        // Create flash effect
        this.scene.cameras.main.flash(500, 255, 255, 255, 0.3);

        // Use the effects manager to show the adaptation effect
        if (this.effectsManager) {
            // Get color based on weapon type
            let color = 0xff33ff; // Default purple

            switch (weaponType) {
                case 'laser':
                    color = 0xff3333; // Red
                    break;
                case 'triBeam':
                    color = 0x33ff33; // Green
                    break;
                case 'plasmaBolt':
                    color = 0x3333ff; // Blue
                    break;
                case 'homingMissile':
                    color = 0xffff33; // Yellow
                    break;
                case 'dualCannon':
                    color = 0xff9933; // Orange
                    break;
                case 'beamLaser':
                    color = 0x33ffff; // Cyan
                    break;
                case 'scatterBomb':
                    color = 0xff33ff; // Magenta
                    break;
            }

            this.effectsManager.showAdaptationEffect({
                color: color,
                duration: 1500
            });
        }
    }

    /**
     * Handle morphing between different boss forms
     */
    handleMorphing() {
        // Only morph if we have defeated bosses to morph into
        if (this.morphForms.length <= 1) return;

        // Increment morph timer
        this.morphTimer += this.scene.time.deltaTime;

        // Check if it's time to morph
        if (this.morphTimer >= this.morphInterval) {
            this.morphTimer = 0;
            this.morphToNextForm();
        }
    }

    /**
     * Morph to the next boss form
     */
    morphToNextForm() {
        // Increment form index
        this.currentMorphForm = (this.currentMorphForm + 1) % this.morphForms.length;

        // Get the new form
        const newForm = this.morphForms[this.currentMorphForm];

        // Visual effect for morphing
        this.showMorphEffect(newForm);

        console.log(`Nemesis morphing to: ${newForm}`);
    }

    /**
     * Show visual effect for morphing
     * @param {string} bossType - Type of boss being morphed into
     */
    showMorphEffect(bossType) {
        // Create flash effect
        this.scene.cameras.main.flash(500, 255, 255, 255, 0.5);

        // Use the effects manager to show the morph effect
        if (this.effectsManager) {
            // Get color based on boss type
            let color = 0x33ffff; // Default cyan

            switch (bossType) {
                case 'SCOUT_COMMANDER':
                    color = 0x33ff33; // Green
                    break;
                case 'BATTLE_CARRIER':
                    color = 0xff9933; // Orange
                    break;
                case 'DESTROYER_PRIME':
                    color = 0xff3333; // Red
                    break;
                case 'STEALTH_OVERLORD':
                    color = 0x9933ff; // Purple
                    break;
                case 'DREADNOUGHT':
                    color = 0x3333ff; // Blue
                    break;
                case 'BOMBER_TITAN':
                    color = 0xffff33; // Yellow
                    break;
                case 'NEMESIS':
                    color = 0x3366cc; // Nemesis blue
                    break;
            }

            this.effectsManager.showMorphingEffect({
                color: color,
                duration: 2000
            });
        }

        // Change attack patterns based on the new form
        this.updateAttackPatternsForForm(bossType);
    }

    /**
     * Update attack patterns based on the current form
     * @param {string} bossType - Type of boss to use attack patterns from
     */
    updateAttackPatternsForForm(bossType) {
        // Each boss type has different attack patterns
        switch (bossType) {
            case 'SCOUT_COMMANDER':
                this.currentPattern = 'spread';
                break;
            case 'BATTLE_CARRIER':
                this.currentPattern = 'drones';
                break;
            case 'DESTROYER_PRIME':
                this.currentPattern = 'artillery';
                break;
            case 'STEALTH_OVERLORD':
                this.currentPattern = 'cloak';
                break;
            case 'DREADNOUGHT':
                this.currentPattern = 'beam';
                break;
            case 'BOMBER_TITAN':
                this.currentPattern = 'bombs';
                break;
            case 'NEMESIS':
                this.currentPattern = 'adaptive';
                break;
        }
    }

    /**
     * Override takeDamage to handle resistances
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        // Get player's current weapon
        const player = this.scene.player;
        if (!player) {
            super.takeDamage(amount);
            return;
        }

        const currentWeapon = player.currentWeapon;

        // Apply resistance if applicable
        let damageAmount = amount;
        if (this.resistances[currentWeapon]) {
            damageAmount = amount * (1 - this.resistances[currentWeapon]);

            // Show resistance effect
            this.showResistanceEffect(currentWeapon);

            // Show tooltip for resistance if tutorial exists
            if (this.tutorial) {
                this.tutorial.showAttackTooltip('adaptive', this.x, this.y);
            }
        }

        // Track damage for situation combos
        if (this.situationCombos) {
            this.situationCombos.trackPlayerAttack();
        }

        // Apply adaptive difficulty damage multiplier
        if (this.damageMultiplier !== 1.0) {
            damageAmount *= this.damageMultiplier;
        }

        // Call parent method with modified damage
        super.takeDamage(damageAmount);
    }

    /**
     * Show visual effect for damage resistance
     * @param {string} weaponType - Type of weapon being resisted
     */
    showResistanceEffect(weaponType) {
        // Use the effects manager to show the resistance effect
        if (this.effectsManager) {
            // Get color based on weapon type (similar to adaptation but with different hue)
            let color = 0x9933cc; // Default purple

            switch (weaponType) {
                case 'laser':
                    color = 0xcc3333; // Dark red
                    break;
                case 'triBeam':
                    color = 0x33cc33; // Dark green
                    break;
                case 'plasmaBolt':
                    color = 0x3333cc; // Dark blue
                    break;
                case 'homingMissile':
                    color = 0xcccc33; // Dark yellow
                    break;
                case 'dualCannon':
                    color = 0xcc6633; // Dark orange
                    break;
                case 'beamLaser':
                    color = 0x33cccc; // Dark cyan
                    break;
                case 'scatterBomb':
                    color = 0xcc33cc; // Dark magenta
                    break;
            }

            // Show shield effect with the appropriate color
            this.effectsManager.showDamageEffect({
                color: color,
                duration: 300
            });
        }
    }

    /**
     * Handle phase transition
     * @param {number} newPhase - New phase index
     */
    onPhaseTransition(newPhase) {
        super.onPhaseTransition(newPhase);

        // Additional effects for Nemesis phase transitions
        this.scene.cameras.main.flash(1000, 255, 255, 255, 0.7);
        this.scene.cameras.main.shake(500, 0.02);

        // Change attack pattern based on phase
        switch (newPhase) {
            case 1: // Phase 2
                this.currentPattern = 'beam';
                break;
            case 2: // Phase 3
                this.currentPattern = 'drones';
                break;
            case 3: // Phase 4
                this.currentPattern = 'artillery';
                break;
            case 4: // Phase 5 (final)
                this.currentPattern = 'all';
                // Increase morph rate in final phase
                this.morphInterval = 5000;
                break;
        }

        // Show phase transition effect
        this.showPhaseTransitionEffect(newPhase);
    }

    /**
     * Show visual effect for phase transition
     * @param {number} phaseIndex - Index of the new phase
     */
    showPhaseTransitionEffect(phaseIndex) {
        // Create text effect for the main screen
        const phaseText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            `NEMESIS PHASE ${phaseIndex + 1}`,
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ff3333',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(0);

        // Create subtitle text
        const subtitleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 40,
            this.getPhaseDescription(phaseIndex),
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(0);

        // Animate phase text
        this.scene.tweens.add({
            targets: [phaseText, subtitleText],
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Hold for a moment, then fade out
                this.scene.time.delayedCall(2000, () => {
                    this.scene.tweens.add({
                        targets: [phaseText, subtitleText],
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            phaseText.destroy();
                            subtitleText.destroy();
                        }
                    });
                });
            }
        });

        // Use the effects manager to show local phase transition effect
        if (this.effectsManager) {
            // Get color based on phase
            let color;
            switch (phaseIndex) {
                case 0: // Phase 1
                    color = 0x33cc33; // Green
                    break;
                case 1: // Phase 2
                    color = 0x33ccff; // Cyan
                    break;
                case 2: // Phase 3
                    color = 0xffcc33; // Yellow
                    break;
                case 3: // Phase 4
                    color = 0xff6633; // Orange
                    break;
                case 4: // Phase 5 (final)
                    color = 0xff3333; // Red
                    break;
                default:
                    color = 0xffffff; // White
            }

            this.effectsManager.showPhaseTransitionEffect({
                color: color,
                duration: 3000
            });
        }
    }

    /**
     * Get description text for each phase
     * @param {number} phaseIndex - Index of the phase
     * @returns {string} Description of the phase
     */
    getPhaseDescription(phaseIndex) {
        const descriptions = [
            "ADAPTATION PHASE",
            "AGGRESSIVE PHASE",
            "DEFENSIVE PHASE",
            "DESPERATE PHASE",
            "FINAL PHASE"
        ];

        return descriptions[phaseIndex] || "UNKNOWN PHASE";
    }

    /**
     * Override onDefeatedEnter to record Nemesis defeat
     */
    onDefeatedEnter() {
        super.onDefeatedEnter();

        // Record Nemesis defeat in nemesis system
        if (this.scene.game.global.nemesisSystem) {
            this.scene.game.global.nemesisSystem.recordNemesisDefeat();
        }

        // Show death effect
        if (this.effectsManager) {
            this.effectsManager.showDeathEffect({
                color: 0xffffff,
                duration: 3000
            });
        }

        // Play death sound
        if (this.soundManager) {
            this.soundManager.playDeathSound();
        }

        // Clean up attack pattern manager
        if (this.attackManager) {
            this.attackManager.destroy();
        }

        // Clean up telegraph manager
        if (this.telegraphManager) {
            this.telegraphManager.destroy();
        }

        // Clean up combo manager
        if (this.comboManager) {
            this.comboManager.destroy();
        }

        // Clean up sound manager
        if (this.soundManager) {
            this.soundManager.destroy();
        }

        // Clean up adaptive difficulty system
        if (this.adaptiveDifficulty) {
            this.adaptiveDifficulty.destroy();
        }

        // Clean up tutorial system
        if (this.tutorial) {
            this.tutorial.destroy();
        }

        // Clean up situation combos
        if (this.situationCombos) {
            this.situationCombos.destroy();
        }
    }

    /**
     * Override grantRewards to provide special Nemesis rewards
     * @returns {array} Array of reward objects
     */
    grantRewards() {
        // Initialize Nemesis rewards system if it doesn't exist
        if (!this.scene.game.global.nemesisRewards) {
            this.scene.game.global.nemesisRewards = new NemesisRewards(this.scene.game);
        }

        // Get the number of times the Nemesis has been defeated
        const nemesisDefeats = this.scene.game.global.nemesisData ?
            this.scene.game.global.nemesisData.defeats || 0 : 0;

        // Generate special Nemesis rewards
        const rewards = this.scene.game.global.nemesisRewards.generateRewards(nemesisDefeats);

        // Add base rewards from parent class
        const baseRewards = super.grantRewards();

        // Combine rewards
        return [...baseRewards, ...rewards];
    }

    /**
     * Clean up all effects when destroyed
     */
    destroy() {
        // Clean up all visual effects
        if (this.effectsManager) {
            this.effectsManager.destroy();
        }

        super.destroy();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.BossNemesis = BossNemesis;
}
