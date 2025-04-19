/**
 * Game Scene
 * Main gameplay scene that handles the core mechanics of the game
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.GAME });
    }

    init(data) {
        // Get data from global game state if not provided directly
        const currentRun = this.game.global.currentRun || {};

        // Initialize with data passed from previous scene or use values from global state
        this.currentSector = data.sector || currentRun.sector || 1;
        this.score = data.score || currentRun.score || 0;

        // Get node type and ID from sector map
        this.nodeType = data.nodeType || 'COMBAT';
        this.nodeId = data.nodeId || 0;

        // Set up empty collections for game objects
        this.enemies = this.physics.add.group();
        this.hazards = this.physics.add.group();
        this.specialEncounters = [];

        // Track the player's progress through the sector
        this.sectorProgress = 0;

        // Game state flags
        this.isPaused = false;
        this.isGameOver = false;
        this.bossEncountered = this.nodeType === 'BOSS';
    }

    create() {
        try {
            console.log(`GameScene: Starting sector ${this.currentSector}, node type: ${this.nodeType}`);

            // Initialize game.global if it doesn't exist
            if (!this.game.global) {
                this.game.global = {
                    currentRun: {
                        sector: 1,
                        score: 0
                    },
                    debug: {
                        invincible: false
                    }
                };
            }

            // Create scrolling background
            this.createBackground();

            // Create the player
            this.createPlayer();

            // Apply synergies from subsystem grid if available
            this.applySynergies();

            // Set up UI elements
            this.createUI();
            this.createAmmoUI();

            // Collision handlers are set up in setupPhysics()

            // Set up event handlers
            this.setupEvents();

            // Create procedural generator with error handling
            try {
                this.procGen = new ProceduralGenerator(this);

                // Generate the current sector with node type
                this.currentSectorData = this.procGen.generateSector(this.currentSector, this.nodeType);
            } catch (error) {
                console.error('Error initializing procedural generator:', error);
                // Create a minimal fallback sector data
                this.createFallbackSectorData();
            }

            // Create choice system with error handling
            try {
                this.choiceSystem = new ChoiceSystem(this);
            } catch (error) {
                console.error('Error initializing choice system:', error);
                this.choiceSystem = {
                    playerBuild: { activeUpgrades: [], activePenalties: [] },
                    generateChoice: () => ({ options: [] }),
                    applyChoice: () => ({})
                };
            }

            // Initialize dynamic difficulty system
            this.initializeDynamicDifficulty();

            // Initialize visual effects system
            this.initializeVisualEffects();

            // Set up physics and collisions
            this.setupPhysics();

            // Set up event handlers
            this.setupEvents();

            // Start sector music
            this.playMusic();

            // Create a camera that follows the player
            this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
            this.cameras.main.setDeadzone(100, 200);

            console.log('GameScene: Initialization complete');
        } catch (error) {
            console.error('Fatal error in game initialization:', error);
            // If a critical error occurs, try to return to the main menu
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        }
    }

    // Fallback method to create minimal sector data if generation fails
    createFallbackSectorData() {
        console.log('Creating fallback sector data');
        this.currentSectorData = {
            number: this.currentSector,
            nodeType: this.nodeType,
            waves: [
                {
                    position: -1000,
                    length: 200,
                    enemies: [
                        {
                            type: 'DRONE',
                            position: { x: 200, y: -200 },
                            isElite: this.nodeType === 'ELITE'
                        },
                        {
                            type: 'DRONE',
                            position: { x: 400, y: -300 },
                            isElite: this.nodeType === 'ELITE'
                        }
                    ],
                    spawned: false
                }
            ],
            hazards: [],
            specialEncounters: [],
            bossEncounter: this.nodeType === 'BOSS' ? {
                type: 'DESTROYER',
                position: -5000,
                arena: 'arena_1',
                healthMultiplier: 1.0
            } : null
        };

        // Initialize sectorProgress for the fallback progress tracking
        this.sectorProgress = 0;
    }

    /**
     * Initialize or get the dynamic difficulty system
     */
    initializeDynamicDifficulty() {
        try {
            // Check if dynamic difficulty system already exists in game.global
            if (!this.game.global.dynamicDifficulty) {
                console.log('Creating new dynamic difficulty system');
                this.game.global.dynamicDifficulty = new DynamicDifficultySystem(this.game);
            }

            // Store reference to the dynamic difficulty system
            this.dynamicDifficulty = this.game.global.dynamicDifficulty;

            // Reset metrics for a new game if this is sector 1
            if (this.currentSector === 1) {
                this.dynamicDifficulty.resetMetrics();
            }

            // Record sector start time for difficulty metrics
            this.sectorStartTime = this.time.now;

            console.log(`Dynamic difficulty initialized: ${this.dynamicDifficulty.getDifficultyName()}`);
        } catch (error) {
            console.error('Error initializing dynamic difficulty system:', error);
            // Create a dummy difficulty system if initialization fails
            this.dynamicDifficulty = {
                applyEnemyScaling: (enemy) => enemy,
                applyBossScaling: (boss) => boss,
                getAdjustedAmmoDropChance: (chance) => chance,
                getAdjustedEnemyCount: (count) => count,
                recordPlayerHit: () => {},
                recordPlayerAvoid: () => {},
                recordEnemyDefeated: () => {},
                recordPlayerDeath: () => {},
                recordSectorCompleted: () => {},
                recordBossDefeated: () => {},
                updateDifficulty: () => {}
            };
        }
    }

    /**
     * Initialize visual effects system
     */
    initializeVisualEffects() {
        try {
            // Create visual effects system
            this.visualEffects = new VisualEffects(this);

            // Create space dust particles
            this.visualEffects.createSpaceDust();

            // Create nebula effect for certain sectors
            if (this.currentSector % 2 === 0) { // Even-numbered sectors have nebula
                const sectorColors = {
                    2: [0x3399ff, 0x0066cc, 0x66ccff], // Blue nebula
                    4: [0xff9933, 0xcc6600, 0xffcc66], // Orange nebula
                    6: [0x99ff33, 0x66cc00, 0xccff66], // Green nebula
                    8: [0xff3399, 0xcc0066, 0xff66cc]  // Pink nebula
                };

                const colors = sectorColors[this.currentSector] || [0x9933ff, 0x6600cc, 0x3399ff];
                this.visualEffects.createNebula(30, colors);
            }

            console.log('Visual effects system initialized');
        } catch (error) {
            console.error('Error initializing visual effects system:', error);
            // Create a dummy visual effects system if initialization fails
            this.visualEffects = {
                createExplosion: () => {},
                createThruster: () => () => {},
                createWeaponImpact: () => {},
                createShieldImpact: () => {},
                createHullImpact: () => {},
                createMissileTrail: () => () => {},
                createScreenShake: () => {},
                createFlash: () => {},
                createPowerupEffect: () => {},
                createLevelUpEffect: () => {},
                createBossEntranceEffect: () => {},
                createTeleportEffect: () => {},
                cleanup: () => {}
            };
        }
    }

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;

        // Update player
        if (this.player && this.player.active) {
            this.player.update(time, delta);

            // Update player projectiles vs homing targets
            if (this.player.weaponType === 'HOMING_MISSILE') {
                this.updateHomingMissiles();
            }

            // Update health and shield UI
            this.updateHealthUI();
        }

        // Update dynamic difficulty system
        if (this.dynamicDifficulty && time % 10000 < 16) { // Update roughly every 10 seconds
            this.dynamicDifficulty.updateDifficulty(this);
        }

        // Update Nemesis health bar if it exists
        if (this.nemesisHealthBar) {
            this.nemesisHealthBar.update();
        }

        // Update enemies
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                enemy.update(time, delta, this.player);

                // Check if enemy is off screen and should be removed
                if (enemy.y > this.cameras.main.scrollY + this.cameras.main.height + 100) {
                    enemy.destroy();
                }
            }
        });

        // Update sector progress based on player movement
        this.updateSectorProgress(delta);

        // Spawn enemies based on sector data and progression
        this.updateEnemySpawning();

        // Update collision handlers for enemy projectiles
        if (this.updateEnemyProjectileCollisions) {
            this.updateEnemyProjectileCollisions();
        }

        // Update hazards
        this.updateHazards();

        // Check for special encounters
        this.checkSpecialEncounters();

        // Check for random emergency events (time-pressure choices)
        // Only check occasionally to avoid constant checks
        if (time % 5000 < 16) { // Check roughly every 5 seconds
            this.checkForEmergencyEvent();
        }

        // UI elements are updated in player update

        // Enhanced parallax scrolling for background layers
        // Check if the background layers are actual sprites or dummy objects
        if (this.bgStars && this.bgStars.tilePositionY !== undefined) {
            // Stars move slowly, creating a distant background effect
            this.bgStars.tilePositionY -= 0.5 * (delta / 16);

            // Add subtle horizontal drift to stars for more dynamic feel
            if (!this.starsHorizontalDrift) {
                this.starsHorizontalDrift = 0;
                this.starsHorizontalDirection = 1;
                this.starsHorizontalSpeed = 0.02;
            }

            // Slowly change horizontal drift direction
            this.starsHorizontalDrift += this.starsHorizontalSpeed * this.starsHorizontalDirection * (delta / 16);
            if (Math.abs(this.starsHorizontalDrift) > 10) {
                this.starsHorizontalDirection *= -1; // Reverse direction
            }

            this.bgStars.tilePositionX = this.starsHorizontalDrift;
        }

        if (this.bgNebula && this.bgNebula.tilePositionY !== undefined) {
            // Nebula moves very slowly, creating a mid-distance effect
            this.bgNebula.tilePositionY -= 0.2 * (delta / 16);

            // Add subtle pulsing effect to nebula
            if (!this.nebulaAlphaPulse) {
                this.nebulaAlphaPulse = 0;
                this.nebulaAlphaDirection = 1;
                this.nebulaAlphaSpeed = 0.0005;
            }

            this.nebulaAlphaPulse += this.nebulaAlphaSpeed * this.nebulaAlphaDirection * (delta / 16);
            if (this.nebulaAlphaPulse > 0.1 || this.nebulaAlphaPulse < 0) {
                this.nebulaAlphaDirection *= -1; // Reverse direction
            }

            // Subtle alpha pulsing between 0.4 and 0.5
            this.bgNebula.alpha = 0.4 + this.nebulaAlphaPulse;

            // Very subtle horizontal drift opposite to stars
            if (this.starsHorizontalDrift) {
                this.bgNebula.tilePositionX = -this.starsHorizontalDrift * 0.3;
            }
        }

        if (this.bgDust && this.bgDust.tilePositionY !== undefined) {
            // Dust moves quickly, creating a foreground effect
            this.bgDust.tilePositionY -= 1.2 * (delta / 16);

            // Add subtle horizontal drift to dust based on player movement
            if (this.player && this.player.body) {
                // Dust reacts to player horizontal velocity
                const playerHorizontalVelocity = this.player.body.velocity.x;
                if (!this.dustHorizontalOffset) this.dustHorizontalOffset = 0;

                // Dust moves slightly in the opposite direction of player movement
                this.dustHorizontalOffset -= playerHorizontalVelocity * 0.01 * (delta / 16);

                // Limit the offset to prevent extreme values
                this.dustHorizontalOffset = Phaser.Math.Clamp(this.dustHorizontalOffset, -50, 50);

                this.bgDust.tilePositionX = this.dustHorizontalOffset;
            }
        }
    }

    createBackground() {
        try {
            // Create multiple parallax layers with different scroll speeds
            // Helper function to create a background layer with fallback
            const createBgLayer = (key, depth, alpha = 1.0) => {
                if (this.textures.exists(key)) {
                    return this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, key)
                        .setOrigin(0, 0)
                        .setScrollFactor(0)
                        .setAlpha(alpha)
                        .setDepth(depth);
                } else {
                    // Create a colored rectangle as fallback
                    const colors = {
                        'bg-stars': 0x000022,
                        'bg-nebula': 0x110022,
                        'bg-dust': 0x111122
                    };

                    const color = colors[key] || 0x000011;

                    // Create a background rectangle
                    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, color)
                        .setOrigin(0, 0)
                        .setScrollFactor(0)
                        .setAlpha(alpha)
                        .setDepth(depth);

                    // Create a dummy sprite for scrolling
                    return { tilePositionY: 0 };
                }
            };

            // Background (farthest layer - stars)
            this.bgStars = createBgLayer('bg-stars', CONSTANTS.GAME.BACKGROUND_Z_INDEX);

            // Middle layer (nebula)
            this.bgNebula = createBgLayer('bg-nebula', CONSTANTS.GAME.BACKGROUND_Z_INDEX + 10, 0.5);

            // Foreground layer (dust particles)
            this.bgDust = createBgLayer('bg-dust', CONSTANTS.GAME.BACKGROUND_Z_INDEX + 20, 0.3);

            // Create enhanced star field particle effects
            try {
                if (this.textures.exists('star-particle')) {
                    // Main star particles (small, fast-moving stars)
                    this.starParticles = this.add.particles('star-particle');

                    // Fast-moving small stars (main effect)
                    this.starEmitter = this.starParticles.createEmitter({
                        x: { min: 0, max: this.cameras.main.width },
                        y: 0,
                        lifespan: { min: 2000, max: 5000 },
                        speedY: { min: 100, max: 200 },
                        scale: { start: 0.2, end: 0 },
                        quantity: 1,
                        blendMode: 'ADD',
                        frequency: 300, // More frequent stars
                        tint: [ 0xffffff, 0xaaaaff, 0xffaaaa, 0xffffaa ] // Varied colors
                    });

                    // Medium-speed medium stars (less frequent)
                    this.mediumStarEmitter = this.starParticles.createEmitter({
                        x: { min: 0, max: this.cameras.main.width },
                        y: 0,
                        lifespan: { min: 3000, max: 7000 },
                        speedY: { min: 50, max: 100 },
                        scale: { start: 0.4, end: 0.1 },
                        quantity: 1,
                        blendMode: 'ADD',
                        frequency: 1000,
                        tint: [ 0xffffff, 0x8888ff, 0xff8888 ] // Varied colors
                    });

                    // Slow-moving large stars (rare)
                    this.largeStarEmitter = this.starParticles.createEmitter({
                        x: { min: 0, max: this.cameras.main.width },
                        y: 0,
                        lifespan: { min: 5000, max: 10000 },
                        speedY: { min: 20, max: 40 },
                        scale: { start: 0.7, end: 0.3 },
                        alpha: { start: 1, end: 0 },
                        quantity: 1,
                        blendMode: 'ADD',
                        frequency: 3000, // Very infrequent
                        tint: [ 0xffffff, 0xaaddff, 0xffddaa ] // Varied colors
                    });

                    // Star particles should be fixed to camera
                    this.starParticles.setScrollFactor(0).setDepth(CONSTANTS.GAME.BACKGROUND_Z_INDEX + 15);

                    // Create occasional shooting stars
                    this.shootingStarParticles = this.add.particles('star-particle');

                    this.shootingStarEmitter = this.shootingStarParticles.createEmitter({
                        x: { min: -100, max: this.cameras.main.width + 100 },
                        y: { min: -100, max: 100 },
                        lifespan: 1000,
                        speedX: { min: -300, max: 300 },
                        speedY: { min: 300, max: 600 },
                        scale: { start: 0.8, end: 0.1 },
                        quantity: 1,
                        blendMode: 'ADD',
                        frequency: 8000, // Very rare
                        tint: 0xffffff,
                        // Add particle trail
                        emitCallback: (particle) => {
                            // Store initial position and velocity for the trail
                            particle.data = {
                                initialX: particle.x,
                                initialY: particle.y,
                                velocityX: particle.velocityX,
                                velocityY: particle.velocityY
                            };
                        },
                        deathCallback: (particle) => {
                            // Create a small explosion effect when the shooting star burns out
                            for (let i = 0; i < 5; i++) {
                                this.starParticles.emitParticle(
                                    1,
                                    particle.x,
                                    particle.y,
                                    'star-particle',
                                    {
                                        scale: { start: 0.3, end: 0 },
                                        speed: { min: 50, max: 100 },
                                        lifespan: { min: 300, max: 600 },
                                        blendMode: 'ADD',
                                        tint: 0xffffaa
                                    }
                                );
                            }
                        }
                    });

                    // Add trail to shooting stars
                    this.shootingStarTrailEmitter = this.shootingStarParticles.createEmitter({
                        scale: { start: 0.4, end: 0 },
                        alpha: { start: 0.6, end: 0 },
                        lifespan: 300,
                        blendMode: 'ADD',
                        tint: 0xffffaa,
                        follow: this.shootingStarEmitter,
                        frequency: 50,
                        quantity: 2
                    });

                    this.shootingStarParticles.setScrollFactor(0).setDepth(CONSTANTS.GAME.BACKGROUND_Z_INDEX + 16);
                } else {
                    console.warn('Star particle texture not found, skipping particle effect');
                }
            } catch (error) {
                console.warn('Error creating star particles:', error);
            }

            // Create a virtual boundary for the game world
            this.physics.world.setBounds(0, -CONSTANTS.SECTOR.LENGTH, this.cameras.main.width, CONSTANTS.SECTOR.LENGTH + this.cameras.main.height);

            // Set camera bounds to follow the player within the world bounds
            this.cameras.main.setBounds(0, -CONSTANTS.SECTOR.LENGTH, this.cameras.main.width, CONSTANTS.SECTOR.LENGTH + this.cameras.main.height);

            console.log('Background created successfully');
        } catch (error) {
            console.error('Error creating background:', error);

            // Create a simple fallback background if the normal one fails
            this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000022)
                .setOrigin(0, 0)
                .setScrollFactor(0);

            // Create simple stars as fallback
            for (let i = 0; i < 100; i++) {
                const x = Phaser.Math.Between(0, this.cameras.main.width);
                const y = Phaser.Math.Between(0, this.cameras.main.height);
                const size = Phaser.Math.Between(1, 3);

                this.add.circle(x, y, size, 0xffffff, 0.7)
                    .setScrollFactor(0);
            }
        }
    }

    createPlayer() {
        // Create player in the bottom center of the screen
        // Use the new space.jfif sprite if available, otherwise fall back to the default
        const shipTexture = this.textures.exists('player-ship-sprite') ? 'player-ship-sprite' : 'player-ship';
        console.log('Using ship texture:', shipTexture);

        this.player = new PlayerShip(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            shipTexture
        );

        // Unlock additional weapons for testing
        this.player.unlockedWeapons = [
            'BASIC_LASER',
            'SPREAD_SHOT',
            'PLASMA_BOLT',
            'HOMING_MISSILE',
            'DUAL_CANNON',
            'LASER_BEAM',
            'SCATTER_BOMB'
        ];

        // Fill ammo for all weapons
        Object.keys(this.player.ammo).forEach(weaponType => {
            this.player.ammo[weaponType] = this.player.maxAmmo[weaponType];
        });
    }

    createUI() {
        // Create UI container that stays fixed to the camera
        this.uiContainer = this.add.container(0, 0)
            .setScrollFactor(0);

        // Create a container for weapon and ammo UI
        this.weaponContainer = this.add.container(0, 0)
            .setScrollFactor(0);
        this.uiContainer.add(this.weaponContainer);

        // Score text with enhanced styling
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#33ff33',
            stroke: '#0A0A1F',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
        }).setScrollFactor(0);

        this.uiContainer.add(this.scoreText);

        // Enhanced health bar with improved visibility and effects
        const healthBarWidth = 250;
        const healthBarHeight = 30; // Increased height for better visibility
        const healthBarRadius = 8;  // Increased radius for more rounded corners

        // Create health bar container
        this.healthBarContainer = this.add.container(20, 60).setScrollFactor(0);

        // Create health bar label with enhanced styling
        this.healthLabel = this.add.text(-10, 0, 'HULL', { // Changed from HEALTH to HULL for space theme
            fontFamily: 'monospace',
            fontSize: '16px', // Larger font
            color: '#33ff33',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
        }).setScrollFactor(0).setOrigin(0, 0.5);
        this.healthBarContainer.add(this.healthLabel);

        // Create health bar outer border with glow effect
        this.healthBarOuterBorder = this.add.rectangle(40, 0, healthBarWidth + 6, healthBarHeight + 6, 0x000000)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        this.healthBarContainer.add(this.healthBarOuterBorder);

        // Add glow effect to health bar border
        this.healthBarGlow = this.add.rectangle(40, 0, healthBarWidth + 10, healthBarHeight + 10, 0x33ff33, 0.2)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        this.healthBarContainer.add(this.healthBarGlow);
        this.healthBarContainer.sendToBack(this.healthBarGlow);

        // Create health bar background with pattern
        this.healthBarBg = this.add.rectangle(42, 0, healthBarWidth, healthBarHeight, 0x222233)
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setStrokeStyle(2, 0x33ff33, 0.7); // Thicker, more visible stroke
        this.healthBarContainer.add(this.healthBarBg);

        // Add pattern to health bar background
        const healthBarPattern = this.add.graphics().setScrollFactor(0);
        healthBarPattern.lineStyle(1, 0x33ff33, 0.2);
        for (let i = 0; i < healthBarWidth; i += 10) {
            healthBarPattern.lineBetween(42 + i, -healthBarHeight/2, 42 + i, healthBarHeight/2);
        }
        this.healthBarContainer.add(healthBarPattern);

        // Create health bar fill with gradient
        const healthBarGraphics = this.add.graphics().setScrollFactor(0);
        this.healthBarGraphics = healthBarGraphics;
        this.healthBarContainer.add(healthBarGraphics);

        // Add health text with enhanced styling
        this.healthText = this.add.text(healthBarWidth / 2 + 42, 0, `${CONSTANTS.PLAYER.STARTING_HEALTH}/${CONSTANTS.PLAYER.STARTING_HEALTH}`, {
            fontFamily: 'monospace',
            fontSize: '16px', // Larger font
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
        }).setScrollFactor(0).setOrigin(0.5, 0.5);
        this.healthBarContainer.add(this.healthText);

        // Add a subtle animation to the health bar
        this.tweens.add({
            targets: this.healthBarGlow,
            alpha: { from: 0.2, to: 0.4 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.uiContainer.add(this.healthBarContainer);

        // Enhanced shield bar with improved visibility and effects
        const shieldBarWidth = 250;
        const shieldBarHeight = 20; // Increased height for better visibility
        const shieldBarRadius = 6;  // Increased radius for more rounded corners

        // Create shield bar container
        this.shieldBarContainer = this.add.container(20, 100).setScrollFactor(0); // Moved down slightly

        // Create shield bar label with enhanced styling
        this.shieldLabel = this.add.text(-10, 0, 'SHIELD', {
            fontFamily: 'monospace',
            fontSize: '16px', // Larger font
            color: '#3388ff',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 3, fill: true }
        }).setScrollFactor(0).setOrigin(0, 0.5);
        this.shieldBarContainer.add(this.shieldLabel);

        // Create shield bar outer border with glow effect
        this.shieldBarOuterBorder = this.add.rectangle(40, 0, shieldBarWidth + 6, shieldBarHeight + 6, 0x000000)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        this.shieldBarContainer.add(this.shieldBarOuterBorder);

        // Add glow effect to shield bar border
        this.shieldBarGlow = this.add.rectangle(40, 0, shieldBarWidth + 10, shieldBarHeight + 10, 0x3388ff, 0.2)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        this.shieldBarContainer.add(this.shieldBarGlow);
        this.shieldBarContainer.sendToBack(this.shieldBarGlow);

        // Create shield bar background with pattern
        this.shieldBarBg = this.add.rectangle(42, 0, shieldBarWidth, shieldBarHeight, 0x222233)
            .setOrigin(0, 0.5)
            .setScrollFactor(0)
            .setStrokeStyle(2, 0x3388ff, 0.7); // Thicker, more visible stroke
        this.shieldBarContainer.add(this.shieldBarBg);

        // Add pattern to shield bar background
        const shieldBarPattern = this.add.graphics().setScrollFactor(0);
        shieldBarPattern.lineStyle(1, 0x3388ff, 0.2);
        for (let i = 0; i < shieldBarWidth; i += 10) {
            shieldBarPattern.lineBetween(42 + i, -shieldBarHeight/2, 42 + i, shieldBarHeight/2);
        }
        this.shieldBarContainer.add(shieldBarPattern);

        // Create shield bar fill with gradient
        const shieldBarGraphics = this.add.graphics().setScrollFactor(0);
        this.shieldBarGraphics = shieldBarGraphics;
        this.shieldBarContainer.add(shieldBarGraphics);

        // Add shield text with enhanced styling
        this.shieldText = this.add.text(shieldBarWidth / 2 + 42, 0, `${CONSTANTS.PLAYER.STARTING_SHIELDS}/${CONSTANTS.PLAYER.STARTING_SHIELDS}`, {
            fontFamily: 'monospace',
            fontSize: '16px', // Larger font
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
        }).setScrollFactor(0).setOrigin(0.5, 0.5);
        this.shieldBarContainer.add(this.shieldText);

        // Add a subtle animation to the shield bar with electric effect
        this.tweens.add({
            targets: this.shieldBarGlow,
            alpha: { from: 0.2, to: 0.5 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.uiContainer.add(this.shieldBarContainer);

        // Enhanced sector progress bar with gradient
        const progressBarWidth = 200;
        const progressBarHeight = 10;
        const progressBarRadius = 3;
        const progressBarX = this.cameras.main.width - 220;
        const progressBarY = 20;

        // Create a background with rounded corners
        const progressBarBg = this.add.graphics()
            .setScrollFactor(0);
        progressBarBg.fillStyle(0x222233, 1);
        progressBarBg.fillRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarRadius);
        progressBarBg.lineStyle(1, 0xaaaacc, 0.3);
        progressBarBg.strokeRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarRadius);

        // Create a mask for the progress bar fill
        const progressBarMask = this.add.graphics()
            .setScrollFactor(0);
        progressBarMask.fillStyle(0xffffff);
        progressBarMask.fillRoundedRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, progressBarRadius);

        // Create the progress bar fill with gradient
        this.progressBarFill = this.add.graphics()
            .setScrollFactor(0);

        // Set mask for the progress bar fill
        this.progressBarFill.setMask(new Phaser.Display.Masks.GeometryMask(this, progressBarMask));

        // Create a function to update the progress bar fill
        this.updateProgressBarFill = (percent) => {
            this.progressBarFill.clear();

            if (percent > 0) {
                const width = progressBarWidth * percent;

                // Progress bar - solid color (no gradient for compatibility)
                this.progressBarFill.fillStyle(0x33ffff, 1);
                this.progressBarFill.fillRoundedRect(progressBarX, progressBarY, Math.max(width, progressBarRadius * 2), progressBarHeight, progressBarRadius);
            }
        };

        // Enhanced sector text
        this.sectorText = this.add.text(progressBarX, progressBarY + 15, 'SECTOR: 1', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#0A0A1F',
            strokeThickness: 2
        }).setScrollFactor(0);

        this.uiContainer.add([this.progressBarFill, this.sectorText]);

        // Enhanced pause button with glow effect
        const pauseButtonSize = 40;
        const pauseButtonX = this.cameras.main.width - 30;
        const pauseButtonY = 30;

        // Create a circular pause button with glow
        const pauseButtonBg = this.add.graphics()
            .setScrollFactor(0);
        pauseButtonBg.fillStyle(0x222233, 0.7);
        pauseButtonBg.fillCircle(pauseButtonX, pauseButtonY, pauseButtonSize/2);
        pauseButtonBg.lineStyle(2, 0x33ff33, 0.5);
        pauseButtonBg.strokeCircle(pauseButtonX, pauseButtonY, pauseButtonSize/2);

        // Create an interactive area for the pause button
        this.pauseButton = this.add.circle(pauseButtonX, pauseButtonY, pauseButtonSize/2)
            .setScrollFactor(0)
            .setInteractive();

        // Make the pause button invisible (just for interaction)
        this.pauseButton.setAlpha(0);

        // Pause icon
        this.pauseText = this.add.text(pauseButtonX, pauseButtonY, 'II', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0);

        this.uiContainer.add([pauseButtonBg, this.pauseButton, this.pauseText]);

        // Set up pause button interaction with visual feedback
        this.pauseButton.on('pointerover', () => {
            pauseButtonBg.clear();
            pauseButtonBg.fillStyle(0x333344, 0.8);
            pauseButtonBg.fillCircle(pauseButtonX, pauseButtonY, pauseButtonSize/2);
            pauseButtonBg.lineStyle(2, 0x33ff33, 0.8);
            pauseButtonBg.strokeCircle(pauseButtonX, pauseButtonY, pauseButtonSize/2);
            this.pauseText.setColor('#33ff33');
        });

        this.pauseButton.on('pointerout', () => {
            pauseButtonBg.clear();
            pauseButtonBg.fillStyle(0x222233, 0.7);
            pauseButtonBg.fillCircle(pauseButtonX, pauseButtonY, pauseButtonSize/2);
            pauseButtonBg.lineStyle(2, 0x33ff33, 0.5);
            pauseButtonBg.strokeCircle(pauseButtonX, pauseButtonY, pauseButtonSize/2);
            this.pauseText.setColor('#ffffff');
        });

        this.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });

        // Enhanced ship status button
        const shipStatusButtonX = this.cameras.main.width - 120;
        const shipStatusButtonY = 70;
        const shipStatusButtonWidth = 120;
        const shipStatusButtonHeight = 30;
        const shipStatusButtonRadius = 5;

        // Create a background with rounded corners and gradient
        const shipStatusButtonBg = this.add.graphics()
            .setScrollFactor(0);
        shipStatusButtonBg.fillStyle(0x222233, 0.8);
        shipStatusButtonBg.fillRoundedRect(
            shipStatusButtonX - shipStatusButtonWidth/2,
            shipStatusButtonY - shipStatusButtonHeight/2,
            shipStatusButtonWidth,
            shipStatusButtonHeight,
            shipStatusButtonRadius
        );
        shipStatusButtonBg.lineStyle(1, 0x33ff33, 0.5);
        shipStatusButtonBg.strokeRoundedRect(
            shipStatusButtonX - shipStatusButtonWidth/2,
            shipStatusButtonY - shipStatusButtonHeight/2,
            shipStatusButtonWidth,
            shipStatusButtonHeight,
            shipStatusButtonRadius
        );

        // Ship status text
        const shipStatusText = this.add.text(shipStatusButtonX, shipStatusButtonY, 'SHIP STATUS', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0);

        // Create an interactive area for the ship status button
        const shipStatusButton = this.add.rectangle(
            shipStatusButtonX,
            shipStatusButtonY,
            shipStatusButtonWidth,
            shipStatusButtonHeight
        ).setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

        // Make the button area invisible (just for interaction)
        shipStatusButton.setAlpha(0);

        // Add hover effects
        shipStatusButton.on('pointerover', () => {
            shipStatusButtonBg.clear();
            shipStatusButtonBg.fillStyle(0x333344, 0.9);
            shipStatusButtonBg.fillRoundedRect(
                shipStatusButtonX - shipStatusButtonWidth/2,
                shipStatusButtonY - shipStatusButtonHeight/2,
                shipStatusButtonWidth,
                shipStatusButtonHeight,
                shipStatusButtonRadius
            );
            shipStatusButtonBg.lineStyle(1, 0x33ff33, 0.8);
            shipStatusButtonBg.strokeRoundedRect(
                shipStatusButtonX - shipStatusButtonWidth/2,
                shipStatusButtonY - shipStatusButtonHeight/2,
                shipStatusButtonWidth,
                shipStatusButtonHeight,
                shipStatusButtonRadius
            );
            shipStatusText.setColor('#33ff33');
        });

        shipStatusButton.on('pointerout', () => {
            shipStatusButtonBg.clear();
            shipStatusButtonBg.fillStyle(0x222233, 0.8);
            shipStatusButtonBg.fillRoundedRect(
                shipStatusButtonX - shipStatusButtonWidth/2,
                shipStatusButtonY - shipStatusButtonHeight/2,
                shipStatusButtonWidth,
                shipStatusButtonHeight,
                shipStatusButtonRadius
            );
            shipStatusButtonBg.lineStyle(1, 0x33ff33, 0.5);
            shipStatusButtonBg.strokeRoundedRect(
                shipStatusButtonX - shipStatusButtonWidth/2,
                shipStatusButtonY - shipStatusButtonHeight/2,
                shipStatusButtonWidth,
                shipStatusButtonHeight,
                shipStatusButtonRadius
            );
            shipStatusText.setColor('#ffffff');
        });

        shipStatusButton.on('pointerdown', () => {
            // Pause the game
            this.pauseGameplay();

            // Start the ship status scene
            this.scene.launch(CONSTANTS.SCENES.SHIP_STATUS, {
                previousScene: CONSTANTS.SCENES.GAME,
                sector: this.currentSector,
                score: this.score
            });

            // When the ship status scene is closed, resume gameplay
            this.events.once('resume', () => {
                this.resumeGameplay();
            });
        });

        this.uiContainer.add([shipStatusButtonBg, shipStatusText, shipStatusButton]);

        // Create ammo UI
        this.createAmmoUI();
    }

    createAmmoUI() {
        // Position for the ammo UI (bottom left)
        const ammoX = 20;
        const ammoY = this.cameras.main.height - 60;

        // Create background for ammo display
        const ammoBg = this.add.graphics()
            .setScrollFactor(0);
        ammoBg.fillStyle(0x222233, 0.7);
        ammoBg.fillRoundedRect(ammoX, ammoY, 200, 40, 5);
        ammoBg.lineStyle(1, 0x33ff33, 0.5);
        ammoBg.strokeRoundedRect(ammoX, ammoY, 200, 40, 5);

        // Create weapon icon
        this.weaponIcon = this.add.rectangle(ammoX + 20, ammoY + 20, 30, 30, 0x33ff33)
            .setScrollFactor(0);

        // Create weapon name text
        this.weaponNameText = this.add.text(ammoX + 40, ammoY + 10, 'BASIC LASER', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);

        // Create ammo counter text
        this.ammoText = this.add.text(ammoX + 40, ammoY + 25, '100 / 100', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#33ff33',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);

        // Create ammo bar background
        const ammoBarBg = this.add.graphics()
            .setScrollFactor(0);
        ammoBarBg.fillStyle(0x333344, 1);
        ammoBarBg.fillRect(ammoX + 120, ammoY + 15, 70, 10);

        // Create ammo bar fill
        this.ammoBarFill = this.add.graphics()
            .setScrollFactor(0);

        // Create weapon selector icons
        this.weaponIcons = [];
        const iconSize = 25;
        const iconSpacing = 30;
        const iconsY = ammoY + 60;

        // Create background for weapon selector
        const selectorBg = this.add.graphics()
            .setScrollFactor(0);
        selectorBg.fillStyle(0x222233, 0.7);
        selectorBg.fillRoundedRect(ammoX, iconsY - iconSize/2, iconSpacing * 7 + 20, iconSize + 10, 5);
        selectorBg.lineStyle(1, 0x33ff33, 0.5);
        selectorBg.strokeRoundedRect(ammoX, iconsY - iconSize/2, iconSpacing * 7 + 20, iconSize + 10, 5);

        // Add weapon selector to container
        this.weaponContainer.add(selectorBg);

        // Create weapon icons with key numbers
        const weaponTypes = [
            'BASIC_LASER',
            'SPREAD_SHOT',
            'PLASMA_BOLT',
            'HOMING_MISSILE',
            'DUAL_CANNON',
            'LASER_BEAM',
            'SCATTER_BOMB'
        ];

        weaponTypes.forEach((type, index) => {
            const x = ammoX + 20 + index * iconSpacing;
            const settings = CONSTANTS.WEAPONS[type];
            const color = settings?.COLOR || 0xffffff;

            // Create icon
            const icon = this.add.rectangle(x, iconsY, iconSize, iconSize, color, 0.7)
                .setScrollFactor(0);

            // Create number label
            const keyNumber = this.add.text(x, iconsY, (index + 1).toString(), {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0);

            // Store reference
            this.weaponIcons.push({ icon, keyNumber, type });

            // Add to container
            this.weaponContainer.add([icon, keyNumber]);
        });

        // Add all elements to the weapon container
        this.weaponContainer.add([ammoBg, this.weaponIcon, this.weaponNameText, this.ammoText, ammoBarBg, this.ammoBarFill]);

        // Initial update
        this.updateAmmoUI();
    }

    updateAmmoUI() {
        // Only update if player exists
        if (!this.player) return;

        // Get current ammo info
        const ammoInfo = this.player.getCurrentAmmo();

        // Update weapon name
        const weaponName = this.getWeaponDisplayName(this.player.weaponType);
        this.weaponNameText.setText(weaponName);

        // Update ammo counter
        this.ammoText.setText(`${ammoInfo.current} / ${ammoInfo.max}`);

        // Update ammo bar color based on percentage
        let color;
        if (ammoInfo.percentage > 0.6) {
            color = 0x33ff33; // Green
        } else if (ammoInfo.percentage > 0.3) {
            color = 0xffff33; // Yellow
        } else {
            color = 0xff3333; // Red
        }

        // Update ammo bar fill
        const ammoX = 20;
        const ammoY = this.cameras.main.height - 60;
        this.ammoBarFill.clear();
        this.ammoBarFill.fillStyle(color, 1);
        this.ammoBarFill.fillRect(ammoX + 120, ammoY + 15, 70 * ammoInfo.percentage, 10);

        // Update weapon icon color to match ammo bar
        this.weaponIcon.setFillStyle(color);

        // Update weapon selector icons
        if (this.weaponIcons) {
            // Get weapon settings for current weapon
            const settings = CONSTANTS.WEAPONS[this.player.weaponType];
            const weaponColor = settings?.COLOR || 0xffffff;

            // Update each icon
            this.weaponIcons.forEach(iconData => {
                // Check if this is the current weapon
                const isCurrentWeapon = iconData.type === this.player.weaponType;

                // Check if weapon is unlocked
                const isUnlocked = this.player.unlockedWeapons.includes(iconData.type);

                // Update icon appearance
                if (isCurrentWeapon) {
                    // Highlight current weapon
                    iconData.icon.setStrokeStyle(2, weaponColor);
                    iconData.icon.setAlpha(1.0);
                    iconData.keyNumber.setAlpha(1.0);
                } else {
                    // Normal appearance for other weapons
                    iconData.icon.setStrokeStyle(0);

                    // Dim locked weapons
                    if (isUnlocked) {
                        iconData.icon.setAlpha(0.7);
                        iconData.keyNumber.setAlpha(0.7);
                    } else {
                        iconData.icon.setAlpha(0.3);
                        iconData.keyNumber.setAlpha(0.3);
                    }
                }
            });
        }
    }

    getWeaponDisplayName(weaponType) {
        // Convert weapon type constant to display name
        switch (weaponType) {
            case 'BASIC_LASER':
                return 'BASIC LASER';
            case 'SPREAD_SHOT':
                return 'TRI-BEAM';
            case 'PLASMA_BOLT':
                return 'PLASMA BOLT';
            case 'HOMING_MISSILE':
                return 'HOMING MISSILE';
            case 'DUAL_CANNON':
                return 'DUAL CANNON';
            case 'LASER_BEAM':
                return 'BEAM LASER';
            case 'SCATTER_BOMB':
                return 'SCATTER BOMB';
            default:
                return weaponType.replace('_', ' ');
        }
    }

    setupPhysics() {
        // Set up player vs enemy collisions
        this.physics.add.collider(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        // Player projectiles vs enemies
        this.physics.add.collider(
            this.player.projectiles,
            this.enemies,
            this.handlePlayerProjectileEnemyCollision,
            null,
            this
        );

        // Create a function to update collision handlers for enemy projectiles
        this.updateEnemyProjectileCollisions = () => {
            try {
                // Clean up any existing colliders
                if (this.enemyProjectilesCollider) {
                    this.enemyProjectilesCollider.destroy();
                }

                // Get all enemy projectile groups
                const enemyProjectiles = this.enemies.getChildren()
                    .filter(enemy => enemy.active && enemy.projectiles)
                    .map(enemy => enemy.projectiles);

                // Create new collider for each enemy projectile group vs player
                enemyProjectiles.forEach(projectileGroup => {
                    this.physics.add.collider(
                        this.player,
                        projectileGroup,
                        this.handleEnemyProjectilePlayerCollision,
                        null,
                        this
                    );
                });
            } catch (error) {
                console.warn('Error updating enemy projectile collisions:', error);
            }
        };

        // Initial update of enemy projectile collisions
        this.updateEnemyProjectileCollisions();

        // Initialize health and shield UI
        this.updateHealthUI();

        // Initialize ammo UI
        this.updateAmmoUI();
    }

    applySynergies() {
        try {
            // Check if subsystem grid exists in the current run
            const currentRun = this.game.global.currentRun || {};
            const subsystemGrid = currentRun.subsystemGrid;

            if (subsystemGrid && this.player) {
                console.log('Applying synergies from subsystem grid');

                // Create synergy system if it doesn't exist
                this.synergySystem = new SynergySystem(this);

                // Process all synergies in the grid and apply their effects to the player ship
                this.synergySystem.processSynergies(subsystemGrid, this.player);
            }
        } catch (error) {
            console.error('Error applying synergies:', error);
        }
    }

    setupEvents() {
        try {
            // Handle player death event
            this.events.on('playerDeath', () => {
                this.gameOver();
            });

            // Handle events for collecting powerups, etc.

            // Handle keyboard events for pausing
            this.input.keyboard.on('keydown-P', () => {
                this.togglePause();
            });

            // Handle keyboard events for debug mode
            this.input.keyboard.on('keydown-B', () => {
                if (this.game.global && this.game.global.debug) {
                    this.game.global.debug.invincible = !this.game.global.debug.invincible;
                    console.log('Debug: Invincibility', this.game.global.debug.invincible ? 'ON' : 'OFF');
                }
            });

            console.log('Events set up successfully');
        } catch (error) {
            console.error('Error setting up events:', error);
        }
    }

    updateSectorProgress(delta) {
        // Calculate progress based on camera scroll
        if (this.player && this.player.active) {
            // Create a "pull" effect that moves the camera forward
            // This creates the sense of level progression
            const scrollSpeed = CONSTANTS.GAME.BACKGROUND_SCROLL_SPEED * (delta / 16);
            this.cameras.main.scrollY -= scrollSpeed; // Scroll rate based on delta time

            // Update the progress bar based on sector position
            if (this.procGen && typeof this.procGen.updateProgress === 'function') {
                const progress = this.procGen.updateProgress(scrollSpeed);

                // Store progress for UI updates
                this.sectorProgress = progress;

                // Update the progress bar using our enhanced gradient bar
                if (this.updateProgressBarFill) {
                    this.updateProgressBarFill(progress);
                }

                // Check if we've reached the boss
                if (this.procGen.reachedBoss() && !this.bossEncountered) {
                    this.spawnBoss();
                }
            } else {
                // Fallback if procGen is not available
                this.sectorProgress = (this.sectorProgress || 0) + scrollSpeed;
                const progress = Math.min(this.sectorProgress / CONSTANTS.SECTOR.LENGTH, 1);

                // Update the progress bar using our enhanced gradient bar
                if (this.updateProgressBarFill) {
                    this.updateProgressBarFill(progress);
                }
            }
        }
    }

    updateEnemySpawning() {
        // Find waves that should be spawned based on current camera position
        if (!this.currentSectorData) return;

        const cameraY = this.cameras.main.scrollY;
        const visibleBottom = cameraY + this.cameras.main.height;

        // Check each wave in the sector data
        this.currentSectorData.waves.forEach(wave => {
            // If wave is close to coming on screen and hasn't been spawned yet
            if (!wave.spawned && wave.position > cameraY - 500 && wave.position < visibleBottom + 500) {
                this.spawnWave(wave);
                wave.spawned = true;
            }
        });
    }

    spawnWave(wave) {
        // Apply dynamic difficulty to adjust enemy count
        let enemiesToSpawn = wave.enemies;

        // Adjust enemy count based on dynamic difficulty if available
        if (this.dynamicDifficulty) {
            // Get base enemy count
            const baseCount = wave.enemies.length;

            // Get adjusted count
            const adjustedCount = this.dynamicDifficulty.getAdjustedEnemyCount(baseCount);

            // If adjusted count is different, modify the enemies array
            if (adjustedCount !== baseCount) {
                if (adjustedCount < baseCount) {
                    // Reduce enemies by randomly removing some
                    const toRemove = baseCount - adjustedCount;
                    for (let i = 0; i < toRemove; i++) {
                        if (enemiesToSpawn.length > 1) { // Always keep at least one enemy
                            const randomIndex = Math.floor(Math.random() * enemiesToSpawn.length);
                            enemiesToSpawn.splice(randomIndex, 1);
                        }
                    }
                } else if (adjustedCount > baseCount) {
                    // Add more enemies by duplicating existing ones with slight position offsets
                    const toAdd = adjustedCount - baseCount;
                    for (let i = 0; i < toAdd; i++) {
                        if (enemiesToSpawn.length > 0) {
                            const randomIndex = Math.floor(Math.random() * enemiesToSpawn.length);
                            const enemyToDuplicate = enemiesToSpawn[randomIndex];

                            // Create a copy with slightly different position
                            const newEnemy = {
                                ...enemyToDuplicate,
                                position: {
                                    x: enemyToDuplicate.position.x + Phaser.Math.Between(-50, 50),
                                    y: enemyToDuplicate.position.y + Phaser.Math.Between(-50, 50)
                                }
                            };

                            enemiesToSpawn.push(newEnemy);
                        }
                    }
                }
            }
        }

        // Create enemies from the adjusted wave data
        enemiesToSpawn.forEach(enemyData => {
            // Create the enemy based on its type
            let enemy;

            switch (enemyData.type) {
                case 'DRONE':
                    enemy = new EnemyDrone(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                case 'GUNSHIP':
                    enemy = new EnemyGunship(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                case 'DESTROYER':
                    enemy = new EnemyDestroyer(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                case 'INTERCEPTOR':
                    enemy = new EnemyInterceptor(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                case 'BOMBER':
                    enemy = new EnemyBomber(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                case 'STEALTH':
                    enemy = new EnemyStealth(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                case 'TURRET':
                    enemy = new EnemyTurret(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                case 'CARRIER':
                    enemy = new EnemyCarrier(
                        this,
                        enemyData.position.x,
                        enemyData.position.y
                    );
                    break;

                default:
                    // Fallback to base enemy class if type is unknown
                    enemy = new Enemy(
                        this,
                        enemyData.position.x,
                        enemyData.position.y,
                        `enemy-${enemyData.type.toLowerCase()}`,
                        enemyData.type
                    );
                    break;
            }

            // Apply elite status if applicable
            if (enemyData.isElite) {
                enemy.isElite = true;
                enemy.applyEliteBuffs();
            }

            // Apply dynamic difficulty scaling to enemy stats
            if (this.dynamicDifficulty) {
                enemy = this.dynamicDifficulty.applyEnemyScaling(enemy);
            }

            // Add to the enemies physics group
            this.enemies.add(enemy);
        });
    }

    updateHazards() {
        // Similar to enemy spawning, but for hazards
        if (!this.currentSectorData) return;

        const cameraY = this.cameras.main.scrollY;
        const visibleBottom = cameraY + this.cameras.main.height;

        // Check each hazard in the sector data
        this.currentSectorData.hazards.forEach(hazard => {
            // If hazard is close to coming on screen and hasn't been spawned yet
            if (!hazard.spawned && hazard.position > cameraY - 500 && hazard.position < visibleBottom + 500) {
                this.spawnHazard(hazard);
                hazard.spawned = true;
            }
        });
    }

    spawnHazard(hazard) {
        // Create a hazard based on its type
        let hazardObject;

        switch (hazard.type) {
            case 'asteroid':
                // Create an asteroid field
                this.createAsteroidField(hazard);
                break;

            case 'radiation':
                // Create a radiation zone
                this.createRadiationZone(hazard);
                break;

            case 'mines':
                // Create a mine field
                this.createMineField(hazard);
                break;

            case 'lasers':
                // Create a laser grid
                this.createLaserGrid(hazard);
                break;
        }

        // Register hazard for updates and collision checking
        if (hazardObject) {
            this.hazards.push(hazardObject);
        }
    }

    createAsteroidField(hazard) {
        // For now, just create some basic asteroid objects
        // In a full implementation, this would generate asteroids based on the hazard pattern
        console.log('Creating asteroid field at position', hazard.position);
    }

    createRadiationZone(hazard) {
        // Create a radiation zone that damages the player over time
        console.log('Creating radiation zone at position', hazard.position);
    }

    createMineField(hazard) {
        // Create mines that explode on contact
        console.log('Creating mine field at position', hazard.position);
    }

    createLaserGrid(hazard) {
        // Create moving laser barriers
        console.log('Creating laser grid at position', hazard.position);
    }

    checkSpecialEncounters() {
        // Similar to hazards, check for special encounters
        if (!this.currentSectorData) return;

        const cameraY = this.cameras.main.scrollY;
        const visibleBottom = cameraY + this.cameras.main.height;

        // Check each special encounter in the sector data
        this.currentSectorData.specialEncounters.forEach(encounter => {
            // If encounter is close to coming on screen and hasn't been triggered yet
            if (!encounter.triggered && encounter.position > cameraY && encounter.position < visibleBottom) {
                this.triggerSpecialEncounter(encounter);
                encounter.triggered = true;
            }
        });
    }

    triggerSpecialEncounter(encounter) {
        // Handle different types of special encounters
        switch (encounter.type) {
            case 'upgrade':
                // Show upgrade choice UI
                this.showUpgradeChoice();
                break;

            case 'resource':
                // Spawn a resource cache
                this.spawnResourceCache(encounter.position);
                break;

            case 'repair':
                // Spawn a repair station
                this.spawnRepairStation(encounter.position);
                break;

            case 'event':
                // Trigger a random event
                this.triggerRandomEvent();
                break;
        }
    }

    /**
     * Show a random emergency choice with time pressure
     */
    showEmergencyChoice() {
        // Pause the game while showing the choice UI
        this.pauseGameplay();

        // Flash warning effect
        this.cameras.main.flash(500, 255, 0, 0, 0.3);

        // Play alert sound if available
        // if (this.sound.get('alert')) {
        //     this.sound.play('alert', { volume: 0.7 });
        // }

        // Generate an emergency choice with time pressure
        const choice = this.choiceSystem.generateChoice('time_pressure', this.currentSector, 'HAZARD', true);

        // Create UI panel for the choice with time pressure
        this.createChoiceUI(choice, true);
    }

    /**
     * Check if an emergency event should occur based on sector progress
     */
    checkForEmergencyEvent() {
        // Only trigger emergencies if player is active and not in a boss encounter
        if (!this.player || !this.player.active || this.bossEncountered) return false;

        // Calculate chance based on sector number
        const baseChance = CONSTANTS.TIME_PRESSURE.EMERGENCY_CHANCE_BASE;
        const scalingChance = CONSTANTS.TIME_PRESSURE.EMERGENCY_CHANCE_SCALING * (this.currentSector - 1);
        const emergencyChance = baseChance + scalingChance;

        // Roll for emergency event
        if (Math.random() < emergencyChance) {
            console.log('Emergency event triggered!');
            this.showEmergencyChoice();
            return true;
        }

        return false;
    }

    showUpgradeChoice() {
        // Pause the game while showing the choice UI
        this.pauseGameplay();

        // Generate a choice from the choice system based on sector and node type
        const choice = this.choiceSystem.generateChoice('standard', this.currentSector, this.nodeType);

        // Create a UI panel for the choice
        this.createChoiceUI(choice);
    }

    createChoiceUI(choice, isTimePressure = false) {
        // Create a semi-transparent background
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.7
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(100);

        // Create a panel for the choice
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            600, 400,
            isTimePressure || choice.isTimePressure ? 0x663333 : 0x333366, 0.9 // Red background for time pressure
        ).setScrollFactor(0).setDepth(101);

        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 150,
            choice.title,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: isTimePressure || choice.isTimePressure ? '#ff3333' : '#ffffff', // Red text for time pressure
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        // Add description
        const description = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 110,
            choice.description,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: 550 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        // Add option buttons
        const optionButtons = [];
        const buttonHeight = 70;
        const buttonSpacing = 10;
        const startY = this.cameras.main.height / 2 - 50;

        // Create UI elements array for later cleanup
        const uiElements = [overlay, panel, title, description];

        // Add timer if this is a time pressure choice
        let timerBar, timerText, timerEvent;
        if (isTimePressure || choice.isTimePressure) {
            // Get time limit from choice or use default
            const timeLimit = choice.timeLimit || CONSTANTS.TIME_PRESSURE.STANDARD_CHOICE_TIME;

            // Create timer bar background
            const timerBarBg = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 180,
                550, 15,
                0x333333, 1
            ).setScrollFactor(0).setDepth(102);

            // Create timer bar fill
            timerBar = this.add.rectangle(
                this.cameras.main.width / 2 - 275,
                this.cameras.main.height / 2 - 180,
                550, 15,
                0xff3333, 1
            ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(102);

            // Create timer text
            timerText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 180,
                (timeLimit / 1000).toFixed(1) + 's',
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(103);

            // Add timer elements to UI elements array
            uiElements.push(timerBarBg, timerBar, timerText);

            // Create timer event
            let timeRemaining = timeLimit;
            timerEvent = this.time.addEvent({
                delay: 100, // Update every 100ms for smooth timer
                callback: () => {
                    timeRemaining -= 100;

                    // Update timer bar width
                    const progress = timeRemaining / timeLimit;
                    timerBar.width = 550 * progress;

                    // Update timer text
                    timerText.setText((timeRemaining / 1000).toFixed(1) + 's');

                    // Flash timer when low on time
                    if (timeRemaining <= 3000) {
                        timerBar.setFillStyle(0xff0000);
                        if (timeRemaining % 500 < 250) {
                            timerText.setColor('#ff0000');
                        } else {
                            timerText.setColor('#ffffff');
                        }
                    }

                    // Time's up!
                    if (timeRemaining <= 0) {
                        this.handleChoiceTimeout(choice, uiElements, timerEvent);
                    }
                },
                callbackScope: this,
                loop: true
            });
        }

        choice.options.forEach((option, index) => {
            // Create button background
            const button = this.add.rectangle(
                this.cameras.main.width / 2,
                startY + (buttonHeight + buttonSpacing) * index,
                550, buttonHeight,
                0x446688, 0.9
            ).setScrollFactor(0).setDepth(102)
            .setInteractive({ useHandCursor: true });

            // Add option text
            const text = this.add.text(
                this.cameras.main.width / 2 - 260,
                startY + (buttonHeight + buttonSpacing) * index - 25,
                option.text,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'left'
                }
            ).setScrollFactor(0).setDepth(103);

            // Add option description
            const optDesc = this.add.text(
                this.cameras.main.width / 2 - 260,
                startY + (buttonHeight + buttonSpacing) * index + 5,
                option.description,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#aaaaaa',
                    align: 'left',
                    wordWrap: { width: 500 }
                }
            ).setScrollFactor(0).setDepth(103);

            // Add event handler
            button.on('pointerdown', () => {
                // Cancel timer if it exists
                if (timerEvent) {
                    timerEvent.remove();
                }

                this.selectChoiceOption(index, choice, uiElements);
            });

            // Add hover effect
            button.on('pointerover', () => {
                button.setFillStyle(0x5588aa);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x446688);
            });

            optionButtons.push({ button, text, desc: optDesc });
            uiElements.push(button, text, optDesc);
        });

        // Store UI elements for later cleanup
        this.choiceUI = {
            overlay,
            panel,
            title,
            description,
            optionButtons,
            timerBar,
            timerText,
            timerEvent
        };
    }

    selectChoiceOption(index, choice, uiElements) {
        // Apply the choice
        const result = this.choiceSystem.applyChoice(index, choice);

        console.log('Applied choice:', result);

        // Show feedback
        this.showChoiceFeedback(result);

        // Clean up UI elements after a delay
        this.time.delayedCall(1500, () => {
            uiElements.forEach(element => element.destroy());
            this.resumeGameplay();
        });
    }

    showChoiceFeedback(result) {
        // Create feedback text
        let feedbackText = result.isTimeout ? 'Time Expired:' : 'Choice applied:';

        // Add rewards
        if (result.rewards && result.rewards.length > 0) {
            feedbackText += '\n\nRewards:';
            result.rewards.forEach(reward => {
                feedbackText += `\n- ${reward.name || reward.type}: ${reward.description || reward.value}`;
            });
        }

        // Add penalties
        if (result.penalties && result.penalties.length > 0) {
            feedbackText += '\n\nPenalties:';
            result.penalties.forEach(penalty => {
                feedbackText += `\n- ${penalty.name || this.getPenaltyDescription(penalty)}`;
            });
        }

        // Display feedback
        const feedback = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            feedbackText,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: result.isTimeout ? '#ff6666' : '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 20, y: 20 },
                wordWrap: { width: 500 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(105);

        // Add to UI elements for cleanup
        this.choiceUI.feedback = feedback;
    }

    /**
     * Handle timeout for time-pressure choices
     */
    handleChoiceTimeout(choice, uiElements, timerEvent) {
        // Cancel the timer event
        if (timerEvent) {
            timerEvent.remove();
        }

        console.log('Choice timeout!', choice);

        // Flash screen red
        this.cameras.main.flash(500, 255, 0, 0, 0.5);

        // Apply timeout consequences
        const result = this.choiceSystem.applyChoice(-1, choice, true);

        // Show timeout feedback
        this.showTimeoutFeedback(result, choice);

        // Clean up UI elements after a delay
        this.time.delayedCall(2000, () => {
            uiElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.resumeGameplay();
        });
    }

    /**
     * Show feedback for timeout
     */
    showTimeoutFeedback(result, choice) {
        // Create timeout message
        const timeoutText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 200,
            'TIME EXPIRED',
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ff0000',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // Create consequence text
        const consequenceText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 160,
            choice.timeoutOption ? choice.timeoutOption.description : 'You failed to make a decision in time.',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ff9999',
                align: 'center',
                wordWrap: { width: 500 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // List penalties
        if (result.penalties && result.penalties.length > 0) {
            let penaltyText = 'Consequences:\n';
            result.penalties.forEach(penalty => {
                penaltyText += `- ${this.getPenaltyDescription(penalty)}\n`;
            });

            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 100,
                penaltyText,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ff6666',
                    align: 'center'
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        }

        // Animate the text
        this.tweens.add({
            targets: [timeoutText, consequenceText],
            y: '-=20',
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2'
        });
    }

    /**
     * Get a human-readable description of a penalty
     */
    getPenaltyDescription(penalty) {
        switch (penalty.type) {
            case 'health':
                return `Ship integrity reduced by ${penalty.value}%`;
            case 'shield':
                return `Shield capacity reduced by ${penalty.value}%`;
            case 'speed':
                return `Engine efficiency reduced by ${penalty.value}%`;
            case 'fireRate':
                return `Weapon systems degraded by ${penalty.value}%`;
            case 'weakness':
                return `New vulnerability: ${penalty.value}`;
            default:
                return `${penalty.type}: ${penalty.value}`;
        }
    }

    spawnResourceCache(position) {
        // Spawn a resource cache at the given position
        console.log('Spawning resource cache at position', position);
    }

    spawnRepairStation(position) {
        // Spawn a repair station at the given position
        console.log('Spawning repair station at position', position);
    }

    triggerRandomEvent() {
        // Generate and trigger a random event
        console.log('Triggering random event');
    }

    spawnBoss() {
        // Mark the boss as encountered
        this.bossEncountered = true;

        // Get the boss data from the sector data
        const bossData = this.currentSectorData.bossEncounter;

        console.log('Spawning boss:', bossData.type);

        // Set up the boss arena first
        this.setupBossArena(bossData);

        // Create a boss based on the type
        let boss;

        // Initialize nemesis system if it doesn't exist
        if (!this.game.global.nemesisSystem && bossData.type === 'NEMESIS') {
            this.game.global.nemesisSystem = new NemesisSystem(this.game);
        }

        // Create the appropriate boss based on sector and type
        switch (bossData.type) {
            case 'SCOUT_COMMANDER':
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;

            case 'BATTLE_CARRIER':
                // Placeholder - will be implemented later
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;

            case 'DESTROYER_PRIME':
                // Placeholder - will be implemented later
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;

            case 'STEALTH_OVERLORD':
                // Placeholder - will be implemented later
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;

            case 'DREADNOUGHT':
                // Placeholder - will be implemented later
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;

            case 'BOMBER_TITAN':
                // Placeholder - will be implemented later
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;

            case 'NEMESIS':
                // Create the Nemesis boss with adaptive configuration
                if (this.game.global.nemesisSystem) {
                    // Generate base Nemesis configuration
                    let nemesisConfig = this.game.global.nemesisSystem.generateNemesisConfig();

                    // Initialize Nemesis difficulty system if it doesn't exist
                    if (!this.game.global.nemesisDifficulty) {
                        this.game.global.nemesisDifficulty = new NemesisDifficulty(this.game);
                    }

                    // Apply difficulty scaling to Nemesis configuration
                    if (this.game.global.nemesisDifficulty) {
                        nemesisConfig = this.game.global.nemesisDifficulty.applyDifficultyToConfig(nemesisConfig);
                        console.log('Applied difficulty scaling to Nemesis boss:', nemesisConfig.difficultyMultipliers);
                    }

                    // Create the Nemesis boss with the scaled configuration
                    boss = new BossNemesis(
                        this,
                        this.cameras.main.width / 2,
                        this.cameras.main.scrollY - 200,
                        nemesisConfig
                    );
                } else {
                    // Fallback if nemesis system is not available
                    boss = new BossNemesis(
                        this,
                        this.cameras.main.width / 2,
                        this.cameras.main.scrollY - 200
                    );
                }
                break;

            // Default fallback
            default:
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;
        }

        // Apply health multiplier based on sector difficulty
        boss.health *= bossData.healthMultiplier;
        boss.maxHealth *= bossData.healthMultiplier;

        // Apply dynamic difficulty scaling to boss stats
        if (this.dynamicDifficulty && boss.type !== 'NEMESIS') { // Skip for Nemesis which has its own scaling
            boss = this.dynamicDifficulty.applyBossScaling(boss);
        }

        // Add to enemies physics group
        this.enemies.add(boss);

        // Create boss health bar
        this.createBossHealthBar(boss);

        // Create a boss announcement
        this.createBossAnnouncement(bossData.type);

        // Set up boss event listeners
        this.setupBossEvents(boss);

        // Sound is disabled
        // No boss music will be played

        // Return the boss reference
        return boss;
    }

    createBossAnnouncement(bossType) {
        // Create a dramatic announcement for the boss
        console.log(`Boss approaching: ${bossType}`);
        try {
            // Add a flash effect
            const flash = this.add.rectangle(
                0, 0,
                this.cameras.main.width,
                this.cameras.main.height,
                0xffffff, 0.7
            ).setScrollFactor(0).setDepth(1000);

            this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 500,
                ease: 'Power2'
            });

            // Add warning text
            const warningText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'WARNING!\nBOSS APPROACHING',
                {
                    fontFamily: 'monospace',
                    fontSize: '32px',
                    color: '#ff0000',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(0);

            // Create boss name text based on type
            let bossName = "UNKNOWN ENTITY";
            switch (bossType) {
                case 'SCOUT_COMMANDER':
                    bossName = "THE GUARDIAN";
                    break;
                case 'BATTLE_CARRIER':
                    bossName = "THE CARRIER";
                    break;
                case 'DESTROYER_PRIME':
                    bossName = "DESTROYER PRIME";
                    break;
                case 'DREADNOUGHT':
                    bossName = "THE DREADNOUGHT";
                    break;
                case 'NEMESIS':
                    bossName = "THE NEMESIS";
                    break;
            }

            // Add boss name text
            const bossNameText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 60,
                bossName,
                {
                    fontFamily: 'monospace',
                    fontSize: '24px',
                    color: '#ffff00',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(0);

            // Animate warning text
            this.tweens.add({
                targets: warningText,
                alpha: 1,
                y: warningText.y - 20,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    // Animate boss name text after warning
                    this.tweens.add({
                        targets: bossNameText,
                        alpha: 1,
                        duration: 500,
                        ease: 'Power2'
                    });

                    // Hold for a moment then fade out
                    this.time.delayedCall(3000, () => {
                        this.tweens.add({
                            targets: [warningText, bossNameText],
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => {
                                warningText.destroy();
                                bossNameText.destroy();
                            }
                        });
                    });
                }
            });
        } catch (error) {
            console.warn('Could not create boss announcement:', error);
        }
    }

    updateHomingMissiles() {
        // Find active missiles and update their tracking
        this.player.projectiles.getChildren().forEach(missile => {
            if (missile.tracking && missile.active) {
                // Find the closest enemy
                let closestEnemy = null;
                let closestDistance = Infinity;

                this.enemies.forEach(enemy => {
                    if (enemy.active) {
                        const distance = Phaser.Math.Distance.Between(
                            missile.x, missile.y,
                            enemy.x, enemy.y
                        );

                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestEnemy = enemy;
                        }
                    }
                });

                // Update missile tracking if we found a target
                if (closestEnemy && closestDistance < 500) {
                    missile.update(closestEnemy);
                }
            }
        });
    }

    handlePlayerEnemyCollision(player, enemy) {
        // Handle collision between player and enemy
        if (!player.invincible) {
            // Apply damage to player
            const damage = enemy.isElite ? 30 : 20;
            player.takeDamage(damage);

            // Update UI
            this.updateHealthUI();

            // Track hit for dynamic difficulty
            if (this.dynamicDifficulty) {
                this.dynamicDifficulty.recordPlayerHit(damage);
            }

            // Apply damage to enemy
            enemy.takeDamage(50);

            // Create a collision effect
            this.createCollisionEffect(player.x, player.y);
        }
    }

    handlePlayerProjectileEnemyCollision(projectile, enemy) {
        // Apply damage to enemy
        const damage = projectile.damage || 10;
        const killed = enemy.takeDamage(damage);

        // If enemy was killed, update score and potentially drop ammo
        if (killed) {
            this.updateScore(enemy.score);

            // Chance to drop ammo based on enemy type
            this.tryDropAmmo(enemy);

            // Track enemy defeated for dynamic difficulty
            if (this.dynamicDifficulty) {
                this.dynamicDifficulty.recordEnemyDefeated(enemy, damage);
            }
        }

        // Create hit effect at impact point
        this.createHitEffect(projectile.x, projectile.y, projectile.settings?.COLOR);

        // Special handling for scatter bombs
        if (projectile.isScatterBomb && projectile.explode) {
            projectile.explode();
            return; // Skip normal destruction since explode handles it
        }

        // Destroy projectile unless it's a penetrating type
        if (projectile.active && !projectile.isPenetrating) {
            projectile.destroy();
        }
    }

    tryDropAmmo(enemy) {
        // Base chance to drop ammo
        let dropChance = 0.2; // 20% base chance

        // Adjust chance based on enemy type
        switch (enemy.type) {
            case 'DRONE':
                dropChance = 0.15;
                break;
            case 'GUNSHIP':
                dropChance = 0.25;
                break;
            case 'DESTROYER':
                dropChance = 0.35;
                break;
            case 'INTERCEPTOR':
                dropChance = 0.20;
                break;
            case 'BOMBER':
                dropChance = 0.30;
                break;
            case 'STEALTH':
                dropChance = 0.25;
                break;
            case 'TURRET':
                dropChance = 0.40;
                break;
            case 'CARRIER':
                dropChance = 0.50;
                break;
            default:
                dropChance = 0.20;
        }

        // Elite enemies have higher chance
        if (enemy.isElite) {
            dropChance += 0.15;
        }

        // Apply dynamic difficulty adjustment to drop chance
        if (this.dynamicDifficulty) {
            dropChance = this.dynamicDifficulty.getAdjustedAmmoDropChance(dropChance);
        }

        // Roll for ammo drop
        if (Math.random() < dropChance) {
            // Create ammo powerup at enemy position
            this.createPowerup(enemy.x, enemy.y, 'ammo');
        }
    }

    handleEnemyProjectilePlayerCollision(player, projectile) {
        // Apply damage to player
        const damage = projectile.damage || 10;
        const hitSuccess = player.takeDamage(damage);

        // Update UI
        if (hitSuccess) {
            this.updateHealthUI();

            // Track hit for dynamic difficulty
            if (this.dynamicDifficulty) {
                this.dynamicDifficulty.recordPlayerHit(damage);
            }
        } else {
            // Player avoided damage (invincible)
            if (this.dynamicDifficulty) {
                this.dynamicDifficulty.recordPlayerAvoid();
            }
        }

        // Create hit effect at impact point
        this.createHitEffect(projectile.x, projectile.y, 0xff0000);

        // Destroy projectile
        projectile.destroy();
    }

    createHitEffect(x, y, color = 0x33ff33) {
        // Use visual effects system if available
        if (this.visualEffects) {
            // Determine weapon type based on color
            let weaponType = 'laser';
            if (color === 0x9933ff || color === 0x6600cc) {
                weaponType = 'plasma';
            } else if (color === 0xff9900 || color === 0xff6600) {
                weaponType = 'missile';
            }

            // Create weapon impact effect
            this.visualEffects.createWeaponImpact(x, y, weaponType);
        } else {
            // Fallback to simple particle effect
            try {
                const particles = this.add.particles('star-particle');

                const emitter = particles.createEmitter({
                    x: x,
                    y: y,
                    speed: { min: 50, max: 150 },
                    scale: { start: 0.5, end: 0 },
                    lifespan: 300,
                    blendMode: 'ADD',
                    quantity: 5
                });

                // Set particle color
                if (color) {
                    emitter.setTint(color);
                }

                // Add a small flash effect
                const flash = this.add.circle(x, y, 10, color, 0.7);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    scale: 2,
                    duration: 200,
                    onComplete: () => {
                        flash.destroy();
                    }
                });

                // Auto-destroy after particles are done
                this.time.delayedCall(300, () => {
                    particles.destroy();
                });
            } catch (error) {
                console.warn('Could not create hit effect:', error);
            }
        }
    }

    createCollisionEffect(x, y) {
        // Use visual effects system if available
        if (this.visualEffects) {
            // Create medium explosion for collision
            this.visualEffects.createExplosion(x, y, 'medium');

            // Add screen shake
            this.visualEffects.createScreenShake(0.005, 200);
        } else {
            // Fallback to simple particle effect
            try {
                const particles = this.add.particles('star-particle');

                const emitter = particles.createEmitter({
                    x: x,
                    y: y,
                    speed: { min: 100, max: 200 },
                    scale: { start: 1, end: 0 },
                    lifespan: 500,
                    blendMode: 'ADD',
                    quantity: 15
                });

                // Set particle color - orange for collisions
                emitter.setTint(0xff6600);

                // Auto-destroy after particles are done
                this.time.delayedCall(500, () => {
                    particles.destroy();
                });

                // Add a flash effect
                const flash = this.add.circle(x, y, 30, 0xffffff, 0.8);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    scale: 2,
                    duration: 200,
                    onComplete: () => {
                        flash.destroy();
                    }
                });
            } catch (error) {
                console.warn('Could not create collision effect:', error);
            }
        }
    }

    updateScore(amount) {
        // Add to score
        this.score += amount;

        // Update UI
        this.scoreText.setText(`SCORE: ${this.score}`);
    }

    updateHealthUI() {
        // Update health and shield bars with enhanced visuals
        if (!this.player) {
            console.warn('updateHealthUI called but player is not defined');
            return;
        }

        try {
            // Calculate health and shield percentages
            const healthPercentage = this.player.health / this.player.maxHealth;
            const shieldPercentage = this.player.shields / this.player.maxShields;

            // Update health bar with enhanced graphics
            const healthBarWidth = 250;

            if (this.healthBarGraphics) {
                // Clear previous graphics
                this.healthBarGraphics.clear();

                // Determine color based on health percentage with more vibrant colors
                let healthColor;
                let healthGlowColor;
                let healthLabelColor;
                if (healthPercentage > 0.6) {
                    healthColor = 0x44ff44; // Brighter green
                    healthGlowColor = 0x88ff88; // Brighter light green
                    healthLabelColor = '#44ff44';
                } else if (healthPercentage > 0.3) {
                    healthColor = 0xffff44; // Brighter yellow
                    healthGlowColor = 0xffff88; // Brighter light yellow
                    healthLabelColor = '#ffff44';
                } else {
                    healthColor = 0xff4444; // Brighter red
                    healthGlowColor = 0xff8888; // Brighter light red
                    healthLabelColor = '#ff4444';
                }

                // Draw health bar with enhanced gradient and 3D effect
                if (healthPercentage > 0) {
                    // Create main fill
                    this.healthBarGraphics.fillStyle(healthColor, 1);
                    this.healthBarGraphics.fillRect(42, -15, healthBarWidth * healthPercentage, 30);

                    // Add highlight line at the top for 3D effect
                    this.healthBarGraphics.lineStyle(3, healthGlowColor, 0.9);
                    this.healthBarGraphics.lineBetween(42, -14, 42 + (healthBarWidth * healthPercentage), -14);

                    // Add shadow line at the bottom for 3D effect
                    this.healthBarGraphics.lineStyle(2, 0x000000, 0.3);
                    this.healthBarGraphics.lineBetween(42, 14, 42 + (healthBarWidth * healthPercentage), 14);

                    // Add vertical line at the end of the health bar for better visibility
                    if (healthPercentage < 1.0) {
                        this.healthBarGraphics.lineStyle(2, healthGlowColor, 0.9);
                        this.healthBarGraphics.lineBetween(
                            42 + (healthBarWidth * healthPercentage),
                            -15,
                            42 + (healthBarWidth * healthPercentage),
                            15
                        );
                    }

                    // Add tick marks for better readability
                    this.healthBarGraphics.lineStyle(1, 0xffffff, 0.4);
                    for (let i = 0.25; i < 1; i += 0.25) {
                        const x = 42 + (healthBarWidth * i);
                        if (x <= 42 + (healthBarWidth * healthPercentage)) {
                            this.healthBarGraphics.lineBetween(x, -15, x, 15);
                        }
                    }
                }

                // Update health bar glow with enhanced effect
                if (this.healthBarGlow) {
                    this.healthBarGlow.fillColor = healthColor;
                    this.healthBarGlow.alpha = 0.3; // Increased base alpha for better visibility
                    this.healthBarGlow.width = (healthBarWidth * healthPercentage) + 15; // Match width to health
                }

                // Update health label color with enhanced visibility
                if (this.healthLabel) {
                    this.healthLabel.setColor(healthLabelColor);
                    this.healthLabel.setStroke('#000000', 4); // Thicker stroke for better contrast
                }

                // Add enhanced pulsing effect when health is low
                if (healthPercentage <= 0.3 && !this.healthPulseEffect) {
                    this.healthPulseEffect = this.tweens.add({
                        targets: this.healthBarGlow,
                        alpha: { from: 0.4, to: 0.7 }, // Increased alpha range for better visibility
                        duration: 400, // Faster pulse for urgency
                        yoyo: true,
                        repeat: -1
                    });

                    // Also pulse the health text for additional visibility
                    if (this.healthText) {
                        this.healthTextPulse = this.tweens.add({
                            targets: this.healthText,
                            scale: { from: 1.0, to: 1.2 },
                            duration: 400,
                            yoyo: true,
                            repeat: -1
                        });
                    }
                } else if (healthPercentage > 0.3 && this.healthPulseEffect) {
                    this.healthPulseEffect.stop();
                    this.healthPulseEffect = null;
                    this.healthBarGlow.alpha = 0.3;

                    if (this.healthTextPulse) {
                        this.healthTextPulse.stop();
                        this.healthTextPulse = null;
                        this.healthText.setScale(1.0);
                    }
                }
            }

            // Update health text with enhanced visibility
            if (this.healthText) {
                this.healthText.setText(`${Math.ceil(this.player.health)}/${this.player.maxHealth}`);
                this.healthText.setStroke('#000000', 4); // Thicker stroke for better contrast
            }

            // Update shield bar with enhanced graphics
            const shieldBarWidth = 250;

            if (this.shieldBarGraphics) {
                // Clear previous graphics
                this.shieldBarGraphics.clear();

                // Draw shield bar with enhanced electric effect
                if (shieldPercentage > 0) {
                    // Create shield fill with brighter color
                    this.shieldBarGraphics.fillStyle(0x44aaff, 1); // Brighter blue
                    this.shieldBarGraphics.fillRect(42, -10, shieldBarWidth * shieldPercentage, 20);

                    // Add highlight line at the top for 3D effect
                    this.shieldBarGraphics.lineStyle(2, 0x88ddff, 0.9); // Brighter highlight
                    this.shieldBarGraphics.lineBetween(42, -9, 42 + (shieldBarWidth * shieldPercentage), -9);

                    // Add shadow line at the bottom for 3D effect
                    this.shieldBarGraphics.lineStyle(1, 0x000000, 0.3);
                    this.shieldBarGraphics.lineBetween(42, 9, 42 + (shieldBarWidth * shieldPercentage), 9);

                    // Add enhanced electric effect (more visible zigzag lines)
                    this.shieldBarGraphics.lineStyle(1.5, 0xccffff, 0.9); // Brighter, thicker lines
                    const zigzagWidth = 8; // Smaller zigzags for more detail
                    const zigzagHeight = 4; // Taller zigzags for better visibility
                    for (let x = 42; x < 42 + (shieldBarWidth * shieldPercentage); x += zigzagWidth * 2) {
                        this.shieldBarGraphics.beginPath();
                        this.shieldBarGraphics.moveTo(x, -5);
                        this.shieldBarGraphics.lineTo(x + zigzagWidth/2, -5 + zigzagHeight);
                        this.shieldBarGraphics.lineTo(x + zigzagWidth, -5);
                        this.shieldBarGraphics.lineTo(x + zigzagWidth*1.5, -5 - zigzagHeight);
                        this.shieldBarGraphics.lineTo(x + zigzagWidth*2, -5);
                        this.shieldBarGraphics.stroke();
                    }

                    // Add vertical line at the end of the shield bar for better visibility
                    if (shieldPercentage < 1.0) {
                        this.shieldBarGraphics.lineStyle(2, 0x88ddff, 0.9);
                        this.shieldBarGraphics.lineBetween(
                            42 + (shieldBarWidth * shieldPercentage),
                            -10,
                            42 + (shieldBarWidth * shieldPercentage),
                            10
                        );
                    }

                    // Add tick marks for better readability
                    this.shieldBarGraphics.lineStyle(1, 0xffffff, 0.4);
                    for (let i = 0.25; i < 1; i += 0.25) {
                        const x = 42 + (shieldBarWidth * i);
                        if (x <= 42 + (shieldBarWidth * shieldPercentage)) {
                            this.shieldBarGraphics.lineBetween(x, -10, x, 10);
                        }
                    }
                }

                // Update shield bar glow with enhanced effect
                if (this.shieldBarGlow) {
                    // Update shield glow width and alpha
                    this.shieldBarGlow.width = (shieldBarWidth * shieldPercentage) + 15; // Match width to shield
                    this.shieldBarGlow.alpha = shieldPercentage > 0 ? 0.4 : 0; // Increased alpha for better visibility

                    // Add enhanced pulsing effect when shield is active
                    if (shieldPercentage > 0 && !this.shieldPulseEffect) {
                        this.shieldPulseEffect = this.tweens.add({
                            targets: this.shieldBarGlow,
                            alpha: { from: 0.4, to: 0.7 }, // Increased alpha range for better visibility
                            duration: 600,
                            yoyo: true,
                            repeat: -1
                        });

                        // Add electric shimmer effect for shields
                        this.shieldShimmerEffect = this.time.addEvent({
                            delay: 150,
                            callback: () => {
                                if (this.shieldBarGraphics && shieldPercentage > 0) {
                                    // Random electric spark
                                    const sparkX = Phaser.Math.Between(
                                        42,
                                        42 + (shieldBarWidth * shieldPercentage)
                                    );
                                    this.shieldBarGraphics.lineStyle(2, 0xffffff, 0.9);
                                    this.shieldBarGraphics.lineBetween(sparkX, -10, sparkX + 5, 10);

                                    // Auto-fade the spark
                                    this.time.delayedCall(100, () => {
                                        if (this.shieldBarGraphics) {
                                            // Only redraw if still active
                                            this.updateHealthUI();
                                        }
                                    });
                                }
                            },
                            callbackScope: this,
                            loop: true
                        });
                    } else if (shieldPercentage <= 0) {
                        // Stop effects when shield is depleted
                        if (this.shieldPulseEffect) {
                            this.shieldPulseEffect.stop();
                            this.shieldPulseEffect = null;
                        }
                        if (this.shieldShimmerEffect) {
                            this.shieldShimmerEffect.remove();
                            this.shieldShimmerEffect = null;
                        }
                        this.shieldBarGlow.alpha = 0;
                    }
                }
            }

            // Update shield text with enhanced visibility
            if (this.shieldText) {
                this.shieldText.setText(`${Math.ceil(this.player.shields)}/${this.player.maxShields}`);
                this.shieldText.setStroke('#000000', 4); // Thicker stroke for better contrast
            }

            // Update sector progress bar
            if (this.updateProgressBarFill && this.sectorProgress !== undefined) {
                this.updateProgressBarFill(this.sectorProgress);
            }

            // Update ammo UI
            this.updateAmmoUI();

        } catch (error) {
            console.error('Error updating health UI:', error);
        }
    }

    togglePause() {
        if (this.isPaused) {
            this.resumeGameplay();
        } else {
            this.pauseGameplay();
        }
    }

    pauseGameplay() {
        this.isPaused = true;
        this.physics.pause();

        // Show pause menu
        this.pauseText.setText('▶');

        // Add a semi-transparent overlay
        this.pauseOverlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.7
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(100);

        // Add pause menu text
        this.pauseMenuText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'PAUSED\n\nPress P to Resume\nPress M for Menu',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // Add key handler for menu
        this.input.keyboard.once('keydown-M', () => {
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });
    }

    resumeGameplay() {
        this.isPaused = false;
        this.physics.resume();

        // Hide pause menu
        this.pauseText.setText('II');

        // Remove pause overlay and menu
        if (this.pauseOverlay) this.pauseOverlay.destroy();
        if (this.pauseMenuText) this.pauseMenuText.destroy();

        // Remove key handler
        this.input.keyboard.off('keydown-M');
    }

    gameOver() {
        // Set game over state
        this.isGameOver = true;
        this.physics.pause();

        // Count defeated enemies safely
        let defeatedCount = 0;
        try {
            if (this.enemies && typeof this.enemies.getChildren === 'function') {
                defeatedCount = this.enemies.getChildren().filter(e => !e.active).length;
            }
        } catch (error) {
            console.warn('Could not count defeated enemies:', error);
        }

        // Record player death for dynamic difficulty
        if (this.dynamicDifficulty) {
            this.dynamicDifficulty.recordPlayerDeath();
        }

        // Track game over in analytics
        if (this.game.global.analytics) {
            this.game.global.analytics.trackGameplay('progression', 'game_over', {
                sector: this.currentSector,
                score: this.score,
                enemiesDefeated: defeatedCount,
                timeElapsed: this.time.now - this.sectorStartTime,
                upgrades: this.choiceSystem ? this.choiceSystem.playerBuild.activeUpgrades.length : 0,
                penalties: this.choiceSystem ? this.choiceSystem.playerBuild.activePenalties.length : 0
            });
        }

        // Store run data for meta-progression and statistics
        const runData = {
            sector: this.currentSector,
            score: this.score,
            enemiesDefeated: defeatedCount,
            upgrades: this.choiceSystem ? this.choiceSystem.playerBuild.activeUpgrades : [],
            penalties: this.choiceSystem ? this.choiceSystem.playerBuild.activePenalties : [],
            timeElapsed: this.time.now
        };

        // Store in global state
        this.game.global.lastRun = runData;

        // Add a brief delay before transitioning to game over scene
        this.time.delayedCall(1000, () => {
            // Start the game over scene
            this.scene.start(CONSTANTS.SCENES.GAME_OVER, {
                score: this.score,
                sector: this.currentSector,
                enemiesDefeated: defeatedCount,
                timeElapsed: this.time.now,
                upgrades: this.choiceSystem ? this.choiceSystem.playerBuild.activeUpgrades : [],
                penalties: this.choiceSystem ? this.choiceSystem.playerBuild.activePenalties : []
            });
        });
    }









    /**
     * Create a health bar for the boss
     */
    createBossHealthBar(boss) {
        // Check if this is the Nemesis boss
        if (boss instanceof BossNemesis) {
            // Create specialized Nemesis health bar
            this.nemesisHealthBar = new NemesisHealthBar(this, boss);

            // Store a reference to the health bar for updates
            this.bossHealthBar = {
                width: 400, // Initial width
                // Custom update method for Nemesis health bar
                updateWidth: function(percentage) {
                    this.width = 400 * percentage;
                }
            };

            return;
        }

        // For other bosses, create standard health bar
        // Create container for boss UI elements
        this.bossUI = this.add.container(0, 0).setScrollFactor(0).setDepth(900);

        // Create boss health bar background
        const barBg = this.add.rectangle(
            this.cameras.main.width / 2,
            20,
            400,
            20,
            0x333333
        ).setScrollFactor(0);

        // Create boss health bar fill
        this.bossHealthBar = this.add.rectangle(
            this.cameras.main.width / 2 - 200,
            20,
            400,
            20,
            0xff3333
        ).setScrollFactor(0).setOrigin(0, 0.5);

        // Create boss name text
        const bossNameText = this.add.text(
            this.cameras.main.width / 2,
            40,
            boss.name || 'BOSS',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        ).setScrollFactor(0).setOrigin(0.5, 0);

        // Add elements to container
        this.bossUI.add(barBg);
        this.bossUI.add(this.bossHealthBar);
        this.bossUI.add(bossNameText);

        // Make the UI initially invisible and fade it in
        this.bossUI.setAlpha(0);
        this.tweens.add({
            targets: this.bossUI,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });
    }

    /**
     * Set up event listeners for boss events
     */
    setupBossEvents(boss) {
        // Listen for boss phase changes
        this.events.on('boss-phase-change', this.onBossPhaseChange, this);

        // Listen for boss damage
        this.events.on('boss-damage', this.onBossDamage, this);

        // Listen for boss defeat
        this.events.on('boss-defeated', this.onBossDefeated, this);
    }

    /**
     * Handle boss phase change event
     */
    onBossPhaseChange(phase) {
        console.log('Boss entering phase', phase);

        // Visual feedback
        this.cameras.main.flash(500, 255, 0, 0, 0.5);
        this.cameras.main.shake(300, 0.01);

        // Add phase indicator
        const phaseText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `PHASE ${phase}`,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ff3333',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(0);

        // Animate phase text
        this.tweens.add({
            targets: phaseText,
            alpha: 1,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Hold for a moment, then fade out
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: phaseText,
                        alpha: 0,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            phaseText.destroy();
                        }
                    });
                });
            }
        });
    }

    /**
     * Handle boss damage event
     */
    onBossDamage(amount, healthPercentage) {
        // Update boss health bar
        if (this.bossHealthBar) {
            if (typeof this.bossHealthBar.updateWidth === 'function') {
                // For Nemesis health bar
                this.bossHealthBar.updateWidth(healthPercentage);
            } else {
                // For standard health bar
                this.bossHealthBar.width = 400 * healthPercentage;
            }
        }

        // Update Nemesis health bar if it exists
        if (this.nemesisHealthBar) {
            this.nemesisHealthBar.update();
        }
    }

    /**
     * Set up the boss arena environment
     */
    setupBossArena(bossData) {
        console.log('Setting up boss arena for', bossData.type);

        // Record the time when the boss encounter started (for Nemesis System)
        this.bossEncounterTime = this.time.now;

        // Create arena boundaries
        this.createArenaBoundaries();

        // Create arena hazards based on boss type
        this.createArenaHazards(bossData);

        // Slow down background scrolling for boss fight
        this.backgroundScrollSpeed = CONSTANTS.GAME.BACKGROUND_SCROLL_SPEED * 0.5;

        // Add visual effects for the arena
        this.createArenaVisualEffects(bossData);

        // Initialize Nemesis System if needed
        if (!this.game.global.nemesisSystem) {
            this.game.global.nemesisSystem = new NemesisSystem(this.game);
        }
    }

    /**
     * Create visual boundaries for the boss arena
     */
    createArenaBoundaries() {
        // Create a container for arena elements
        this.arenaElements = this.add.group();

        // Create top and bottom boundaries
        const arenaTop = this.cameras.main.scrollY - 50;
        const arenaBottom = this.cameras.main.scrollY + this.cameras.main.height + 50;

        // Visual indicators for arena boundaries
        const topBoundary = this.add.rectangle(
            this.cameras.main.width / 2,
            arenaTop,
            this.cameras.main.width,
            10,
            0xff3333
        ).setAlpha(0.7).setScrollFactor(1, 1);

        const bottomBoundary = this.add.rectangle(
            this.cameras.main.width / 2,
            arenaBottom,
            this.cameras.main.width,
            10,
            0xff3333
        ).setAlpha(0.7).setScrollFactor(1, 1);

        // Add to arena elements group
        this.arenaElements.add(topBoundary);
        this.arenaElements.add(bottomBoundary);

        // Store arena boundaries for collision detection
        this.arenaBounds = {
            top: arenaTop,
            bottom: arenaBottom,
            left: 0,
            right: this.cameras.main.width
        };
    }

    /**
     * Create hazards specific to the boss type
     */
    createArenaHazards(bossData) {
        // Create a group for arena hazards
        this.arenaHazards = this.physics.add.group();

        // Add hazards based on boss type
        switch (bossData.type) {
            case 'SCOUT_COMMANDER': // The Guardian
                this.createGuardianArenaHazards(bossData);
                break;

            case 'BATTLE_CARRIER': // The Carrier
                this.createCarrierArenaHazards(bossData);
                break;

            case 'DESTROYER_PRIME': // Destroyer Prime
                this.createDestroyerArenaHazards(bossData);
                break;

            default:
                // Default hazards for any boss
                this.createDefaultArenaHazards(bossData);
                break;
        }

        // Set up collisions between player and hazards
        this.physics.add.collider(
            this.player,
            this.arenaHazards,
            this.onPlayerHazardCollision,
            null,
            this
        );
    }

    /**
     * Create hazards specific to the Guardian boss
     */
    createGuardianArenaHazards(bossData) {
        // Create asteroid field
        this.createAsteroidField({
            position: this.cameras.main.scrollY + 200,
            width: this.cameras.main.width,
            count: 10,
            size: { min: 20, max: 40 },
            speed: { min: 30, max: 60 },
            damage: 10
        });

        // Create shield generators
        this.createShieldGenerators(bossData);

        // Create energy barriers that activate periodically
        this.createEnergyBarriers(bossData);
    }

    /**
     * Create shield generators for the Guardian boss
     */
    createShieldGenerators(bossData) {
        // Create 3 shield generators that orbit around a center point
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.scrollY + 100;

        // Create shield generators
        this.shieldGenerators = [];

        for (let i = 0; i < 3; i++) {
            // Position in a triangle formation
            const angle = (i * Math.PI * 2 / 3) + Math.PI / 6;
            const distance = 150;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            // Create shield generator
            const generator = this.physics.add.sprite(x, y, 'enemy-turret');
            generator.setScale(0.8);
            generator.setTint(0x3399ff);
            generator.health = 50;
            generator.maxHealth = 50;
            generator.setData('orbitCenter', { x: centerX, y: centerY });
            generator.setData('orbitDistance', distance);
            generator.setData('orbitSpeed', 0.001 * (i + 1));
            generator.setData('orbitAngle', angle);
            generator.setData('generatorIndex', i);

            // Add to physics group
            this.arenaHazards.add(generator);

            // Add to shield generators array
            this.shieldGenerators.push(generator);

            // Create shield effect
            const shieldEffect = this.add.graphics();
            shieldEffect.fillStyle(0x3399ff, 0.3);
            shieldEffect.fillCircle(x, y, 30);
            shieldEffect.setData('generator', generator);

            // Add update function for shield effect
            this.events.on('update', (time, delta) => {
                if (generator.active) {
                    // Update shield effect position
                    const genX = generator.x;
                    const genY = generator.y;

                    shieldEffect.clear();
                    shieldEffect.fillStyle(0x3399ff, 0.3);
                    shieldEffect.fillCircle(genX, genY, 30);
                } else {
                    // Destroy shield effect if generator is destroyed
                    shieldEffect.destroy();
                }
            });
        }
    }

    /**
     * Create energy barriers for the boss arena
     */
    createEnergyBarriers(bossData) {
        // Create energy barriers that activate periodically
        this.energyBarriers = [];

        // Create 2 horizontal barriers
        const barrierY1 = this.cameras.main.scrollY + this.cameras.main.height * 0.3;
        const barrierY2 = this.cameras.main.scrollY + this.cameras.main.height * 0.7;

        // Create barriers
        const barrier1 = this.add.rectangle(
            this.cameras.main.width / 2,
            barrierY1,
            this.cameras.main.width,
            10,
            0xff3333
        ).setAlpha(0);

        const barrier2 = this.add.rectangle(
            this.cameras.main.width / 2,
            barrierY2,
            this.cameras.main.width,
            10,
            0xff3333
        ).setAlpha(0);

        // Add physics bodies
        this.physics.add.existing(barrier1);
        this.physics.add.existing(barrier2);

        // Make them static
        barrier1.body.setImmovable(true);
        barrier2.body.setImmovable(true);

        // Disable initially
        barrier1.body.enable = false;
        barrier2.body.enable = false;

        // Add to hazards group
        this.arenaHazards.add(barrier1);
        this.arenaHazards.add(barrier2);

        // Add to energy barriers array
        this.energyBarriers.push(barrier1, barrier2);

        // Set up barrier activation timer
        this.barrierTimer = this.time.addEvent({
            delay: 5000, // 5 seconds
            callback: this.toggleEnergyBarriers,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Toggle energy barriers on/off
     */
    toggleEnergyBarriers() {
        if (!this.energyBarriers || this.energyBarriers.length === 0) return;

        // Toggle each barrier
        this.energyBarriers.forEach(barrier => {
            // Toggle active state
            const isActive = barrier.alpha > 0;

            if (isActive) {
                // Deactivate barrier
                this.tweens.add({
                    targets: barrier,
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        barrier.body.enable = false;
                    }
                });
            } else {
                // Activate barrier
                barrier.body.enable = true;

                this.tweens.add({
                    targets: barrier,
                    alpha: 0.7,
                    duration: 500,
                    ease: 'Power2'
                });

                // Add warning flash
                this.cameras.main.flash(300, 255, 0, 0, 0.3);
            }
        });
    }

    /**
     * Create asteroid field hazard
     */
    createAsteroidField(config) {
        const { position, width, count, size, speed, damage } = config;

        // Create asteroids
        for (let i = 0; i < count; i++) {
            // Random position within field
            const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
            const y = position + Phaser.Math.Between(-50, 50);

            // Create asteroid
            const asteroid = this.physics.add.sprite(x, y, 'asteroid');

            // Set random size
            const scale = Phaser.Math.FloatBetween(
                size.min / 100,
                size.max / 100
            );
            asteroid.setScale(scale);

            // Set random rotation
            asteroid.setAngularVelocity(Phaser.Math.FloatBetween(-50, 50));

            // Set random velocity
            const vx = Phaser.Math.FloatBetween(-speed.max, speed.max);
            const vy = Phaser.Math.FloatBetween(-speed.min, speed.min);
            asteroid.body.setVelocity(vx, vy);

            // Set damage amount
            asteroid.setData('damage', damage);

            // Add to hazards group
            this.arenaHazards.add(asteroid);

            // Set up collision with arena boundaries
            asteroid.setData('updateCallback', (time, delta) => {
                // Bounce off arena boundaries
                if (asteroid.x < 0 || asteroid.x > this.cameras.main.width) {
                    asteroid.body.velocity.x *= -1;
                }

                if (asteroid.y < this.arenaBounds.top || asteroid.y > this.arenaBounds.bottom) {
                    asteroid.body.velocity.y *= -1;
                }
            });

            // Add update listener
            this.events.on('update', asteroid.getData('updateCallback'));
        }
    }

    /**
     * Create visual effects for the boss arena
     */
    createArenaVisualEffects(bossData) {
        // Add background elements specific to boss type
        switch (bossData.type) {
            case 'SCOUT_COMMANDER':
                // Add space station elements in background
                this.createSpaceStationBackground();
                break;

            default:
                // Default background elements
                break;
        }

        // Add particle effects
        this.createArenaParticleEffects(bossData);
    }

    /**
     * Create space station background elements
     */
    createSpaceStationBackground() {
        // Add some background elements to suggest a space station environment
        const bgElements = [
            { x: 100, y: this.cameras.main.scrollY + 100, scale: 0.7 },
            { x: this.cameras.main.width - 100, y: this.cameras.main.scrollY + 150, scale: 0.8 },
            { x: 150, y: this.cameras.main.scrollY + this.cameras.main.height - 100, scale: 0.6 },
            { x: this.cameras.main.width - 150, y: this.cameras.main.scrollY + this.cameras.main.height - 150, scale: 0.7 }
        ];

        // Create each element
        bgElements.forEach(element => {
            const sprite = this.add.sprite(element.x, element.y, 'asteroid');
            sprite.setScale(element.scale);
            sprite.setTint(0x666666);
            sprite.setAlpha(0.5);
            sprite.setDepth(-10);

            // Add to arena elements group
            this.arenaElements.add(sprite);
        });
    }

    /**
     * Create particle effects for the arena
     */
    createArenaParticleEffects(bossData) {
        // Add particle effects based on boss type
        switch (bossData.type) {
            case 'SCOUT_COMMANDER':
                // Add shield particles
                if (this.particles) {
                    const shieldParticles = this.particles.createEmitter({
                        frame: 'blue',
                        x: this.cameras.main.width / 2,
                        y: this.cameras.main.scrollY + 100,
                        speed: { min: 20, max: 40 },
                        scale: { start: 0.2, end: 0 },
                        blendMode: 'ADD',
                        lifespan: 1000,
                        quantity: 1,
                        frequency: 100
                    });
                }
                break;

            default:
                break;
        }
    }

    /**
     * Handle collision between player and hazard
     */
    onPlayerHazardCollision(player, hazard) {
        // Apply damage to player based on hazard type
        const damage = hazard.getData('damage') || 10;

        // Apply damage to player
        if (player.takeDamage) {
            player.takeDamage(damage);
        }

        // Visual feedback
        this.cameras.main.shake(100, 0.01);
    }

    /**
     * Handle boss defeat event
     */
    onBossDefeated(boss) {
        console.log('Boss defeated!', boss);

        // Stop scrolling
        this.scrollSpeed = 0;

        // Screen effects
        this.cameras.main.flash(1000, 255, 255, 255, 0.8);
        this.cameras.main.shake(500, 0.02);

        // Update statistics
        this.game.global.statistics.bossesDefeated++;

        // Record boss defeated for dynamic difficulty
        if (this.dynamicDifficulty) {
            this.dynamicDifficulty.recordBossDefeated(boss.type);
        }

        // Track boss defeat in analytics
        if (this.game.global.analytics) {
            this.game.global.analytics.trackGameplay('combat', 'boss_defeated', {
                bossType: boss.type,
                sector: this.currentSector,
                score: this.score,
                timeElapsed: this.time.now - this.sectorStartTime,
                playerHealth: this.player ? this.player.health : 0,
                playerShield: this.player ? this.player.shield : 0
            });
        }

        // Initialize Nemesis systems if they don't exist
        if (!this.game.global.nemesisSystem) {
            this.game.global.nemesisSystem = new NemesisSystem(this.game);
        }

        if (!this.game.global.nemesisDifficulty) {
            this.game.global.nemesisDifficulty = new NemesisDifficulty(this.game);
        }

        // Record boss defeat for Nemesis System if it's not the Nemesis itself
        if (boss.type !== 'NEMESIS' && this.game.global.nemesisSystem) {
            // Gather data about how the boss was defeated
            const defeatData = this.collectBossDefeatData(boss);

            // Record the defeat in the Nemesis System
            this.game.global.nemesisSystem.recordBossDefeat(boss.type, defeatData);
            console.log(`Recorded defeat of ${boss.type} for Nemesis System`);
        }

        // Show victory message
        const victoryText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'BOSS DEFEATED',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setAlpha(0);

        // Animate victory text
        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        // Show boss rewards after a delay
        this.time.delayedCall(2000, () => {
            this.showBossRewards(boss);
        });

        // Clean up arena elements
        this.cleanupBossArena();
    }

    /**
     * Collect data about how the boss was defeated for the Nemesis System
     * @param {BossEnemy} boss - The defeated boss
     * @returns {object} Data about the defeat
     */
    collectBossDefeatData(boss) {
        // Default data
        const defeatData = {
            dominantWeapon: 'laser', // Default weapon
            buildType: 'balanced',   // Default build type
            timeToDefeat: 0,         // Time taken to defeat the boss
            weaponUsage: {},         // Weapon usage statistics
            buildStyle: {}           // Build style statistics
        };

        try {
            // Get the player's current weapon
            if (this.player && this.player.currentWeapon) {
                defeatData.dominantWeapon = this.player.currentWeapon;
            }

            // Calculate time to defeat (approximate)
            if (this.bossEncounterTime) {
                defeatData.timeToDefeat = this.time.now - this.bossEncounterTime;
            }

            // Analyze player's weapon usage during the boss fight
            if (this.player && this.player.weaponUsage) {
                defeatData.weaponUsage = { ...this.player.weaponUsage };
            } else {
                // Create default weapon usage based on available weapons
                const weapons = ['laser', 'triBeam', 'plasmaBolt', 'homingMissile', 'dualCannon', 'beamLaser', 'scatterBomb'];
                weapons.forEach(weapon => {
                    defeatData.weaponUsage[weapon] = 0;
                });
                // Set the current weapon as the most used
                if (this.player && this.player.currentWeapon) {
                    defeatData.weaponUsage[this.player.currentWeapon] = 10;
                } else {
                    defeatData.weaponUsage.laser = 10; // Default
                }
            }

            // Analyze player's build style based on active upgrades
            if (this.choiceSystem && this.choiceSystem.playerBuild) {
                const upgrades = this.choiceSystem.playerBuild.activeUpgrades || [];

                // Initialize build style counters
                defeatData.buildStyle = {
                    offensive: 0,
                    defensive: 0,
                    utility: 0,
                    balanced: 0
                };

                // Categorize each upgrade
                upgrades.forEach(upgrade => {
                    if (!upgrade || !upgrade.type) return;

                    // Categorize based on upgrade type or id
                    if (upgrade.id && upgrade.id.includes('damage')) {
                        defeatData.buildStyle.offensive += 1;
                    } else if (upgrade.id && (upgrade.id.includes('shield') || upgrade.id.includes('health'))) {
                        defeatData.buildStyle.defensive += 1;
                    } else if (upgrade.id && (upgrade.id.includes('speed') || upgrade.id.includes('cooldown'))) {
                        defeatData.buildStyle.utility += 1;
                    } else {
                        defeatData.buildStyle.balanced += 1;
                    }
                });

                // Determine dominant build style
                let maxValue = 0;
                let dominantStyle = 'balanced';

                Object.keys(defeatData.buildStyle).forEach(style => {
                    if (defeatData.buildStyle[style] > maxValue) {
                        maxValue = defeatData.buildStyle[style];
                        dominantStyle = style;
                    }
                });

                defeatData.buildType = dominantStyle;
            }

        } catch (error) {
            console.warn('Error collecting boss defeat data:', error);
        }

        return defeatData;
    }

    /**
     * Show rewards after defeating a boss
     */
    showBossRewards(boss) {
        // Get rewards from boss
        if (!boss || !boss.grantRewards) return;

        const rewards = boss.grantRewards();
        if (!rewards || rewards.length === 0) return;

        console.log('Showing boss rewards:', rewards);

        // Check if this is the Nemesis boss
        if (boss instanceof BossNemesis) {
            // Collect performance metrics for Nemesis boss
            const metrics = this.collectPerformanceMetrics(boss);

            // Use the enhanced Nemesis reward display for Nemesis boss
            this.showNemesisRewards(boss, rewards, metrics);
        } else {
            // Use the standard reward display for other bosses
            this.showStandardBossRewards(boss, rewards);
        }
    }

    /**
     * Show enhanced visual rewards for Nemesis boss
     * @param {BossNemesis} boss - The Nemesis boss
     * @param {array} rewards - Array of reward objects
     * @param {object} metrics - Performance metrics
     */
    showNemesisRewards(boss, rewards, metrics) {
        // Initialize the reward display if needed
        if (!this.nemesisRewardDisplay) {
            this.nemesisRewardDisplay = new NemesisRewardDisplay(this);
        }

        // Show the rewards with the enhanced display
        this.nemesisRewardDisplay.showRewards(rewards, {
            title: 'NEMESIS DEFEATED',
            onClose: () => {
                // Apply rewards
                rewards.forEach(reward => {
                    this.applyReward(reward);
                });

                // Show performance summary
                this.showPerformanceSummary(metrics);
            }
        });
    }

    /**
     * Show standard rewards for regular bosses
     * @param {BossEnemy} boss - The boss enemy
     * @param {array} rewards - Array of reward objects
     */
    showStandardBossRewards(boss, rewards) {
        // Create a rewards container
        const rewardsContainer = this.add.container(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        ).setScrollFactor(0).setDepth(1002);

        // Add background panel
        const panel = this.add.rectangle(
            0, 0,
            400, 300,
            0x000000, 0.8
        ).setOrigin(0.5);

        // Add title
        const title = this.add.text(
            0, -120,
            'BOSS REWARDS',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffff00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);

        // Add rewards to container
        rewardsContainer.add([panel, title]);

        // Add each reward
        let yOffset = -70;

        rewards.forEach((reward, index) => {
            // Create reward item based on type
            const rewardItem = this.createRewardItem(reward, 0, yOffset);
            rewardsContainer.add(rewardItem);

            // Increment y offset for next reward
            yOffset += 60;
        });

        // Add continue button
        const continueButton = this.add.text(
            0, 120,
            'CONTINUE',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setInteractive();

        // Add button to container
        rewardsContainer.add(continueButton);

        // Add hover effect
        continueButton.on('pointerover', () => {
            continueButton.setScale(1.1);
        });

        continueButton.on('pointerout', () => {
            continueButton.setScale(1);
        });

        // Add click handler
        continueButton.on('pointerdown', () => {
            // Apply rewards
            rewards.forEach(reward => {
                this.applyReward(reward);
            });

            // Remove rewards container
            rewardsContainer.destroy();

            // Complete the level
            this.completeLevel();
        });

        // Animate container in
        rewardsContainer.setAlpha(0);
        this.tweens.add({
            targets: rewardsContainer,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }

    /**
     * Create a reward item display
     */
    createRewardItem(reward, x, y) {
        // Create a container for the reward
        const container = this.add.container(x, y);

        // Create different displays based on reward type
        switch (reward.type) {
            case 'upgrade':
                // Create upgrade display
                const upgradeIcon = this.add.rectangle(-70, 0, 40, 40, 0x3399ff).setOrigin(0.5);
                const upgradeName = this.add.text(
                    0, -10,
                    reward.name || 'Unknown Upgrade',
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                ).setOrigin(0, 0.5);

                const upgradeDesc = this.add.text(
                    0, 10,
                    reward.description || '',
                    {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#aaaaaa'
                    }
                ).setOrigin(0, 0.5);

                // Add rarity indicator
                let rarityColor = 0xaaaaaa; // Common
                if (reward.rarity === 'rare') rarityColor = 0x3399ff;
                if (reward.rarity === 'epic') rarityColor = 0x9933cc;
                if (reward.rarity === 'legendary') rarityColor = 0xff9900;

                upgradeIcon.setStrokeStyle(2, rarityColor);

                // Add to container
                container.add([upgradeIcon, upgradeName, upgradeDesc]);
                break;

            case 'credits':
                // Create credits display
                const creditsIcon = this.add.rectangle(-70, 0, 40, 40, 0xffcc00).setOrigin(0.5);
                const creditsText = this.add.text(
                    0, 0,
                    `${reward.value} CREDITS`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ffcc00'
                    }
                ).setOrigin(0, 0.5);

                // Add to container
                container.add([creditsIcon, creditsText]);
                break;

            case 'unlock':
                // Create unlock display
                const unlockIcon = this.add.rectangle(-70, 0, 40, 40, 0xff3333).setOrigin(0.5);
                const unlockText = this.add.text(
                    0, -10,
                    `NEW SHIP UNLOCKED`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ff3333'
                    }
                ).setOrigin(0, 0.5);

                const shipName = this.add.text(
                    0, 10,
                    reward.id.toUpperCase(),
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#ffffff'
                    }
                ).setOrigin(0, 0.5);

                // Add to container
                container.add([unlockIcon, unlockText, shipName]);
                break;

            default:
                // Generic reward
                const genericIcon = this.add.rectangle(-70, 0, 40, 40, 0xaaaaaa).setOrigin(0.5);
                const genericText = this.add.text(
                    0, 0,
                    'UNKNOWN REWARD',
                    {
                        fontFamily: 'monospace',
                        fontSize: '16px',
                        color: '#ffffff'
                    }
                ).setOrigin(0, 0.5);

                // Add to container
                container.add([genericIcon, genericText]);
                break;
        }

        return container;
    }

    /**
     * Clean up boss arena elements
     */
    cleanupBossArena() {
        // Clean up arena elements
        if (this.arenaElements) {
            this.arenaElements.clear(true, true);
        }

        // Clean up arena hazards
        if (this.arenaHazards) {
            this.arenaHazards.clear(true, true);
        }

        // Clean up shield generators
        if (this.shieldGenerators) {
            this.shieldGenerators = [];
        }

        // Clean up energy barriers
        if (this.energyBarriers) {
            this.energyBarriers = [];
        }

        // Stop barrier timer
        if (this.barrierTimer) {
            this.barrierTimer.remove();
        }

        // Clean up Nemesis health bar if it exists
        if (this.nemesisHealthBar) {
            this.nemesisHealthBar.destroy();
            this.nemesisHealthBar = null;
        }

        // Reset background scroll speed
        this.backgroundScrollSpeed = CONSTANTS.GAME.BACKGROUND_SCROLL_SPEED;
    }

    /**
     * Create default arena hazards for any boss type
     */
    createDefaultArenaHazards(bossData) {
        // Create a basic asteroid field
        this.createAsteroidField({
            position: this.cameras.main.scrollY + 200,
            width: this.cameras.main.width,
            count: 5,
            size: { min: 20, max: 40 },
            speed: { min: 20, max: 40 },
            damage: 10
        });
    }

    /**
     * Create hazards for the Carrier boss
     */
    createCarrierArenaHazards(bossData) {
        // Create drone spawners
        // This is a placeholder for future implementation
        console.log('Creating Carrier arena hazards');
    }

    /**
     * Create hazards for the Destroyer boss
     */
    createDestroyerArenaHazards(bossData) {
        // Create artillery impact zones
        // This is a placeholder for future implementation
        console.log('Creating Destroyer arena hazards');
    }

    // The following methods are now handled by the new boss rewards system

    /**
     * Process rewards from boss defeat
     */
    processRewards(rewards) {
        if (!rewards || !rewards.length) return;

        console.log('Processing boss rewards:', rewards);

        // Display rewards
        const rewardsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            'REWARDS:',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffff33',
                align: 'center'
            }
        ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001).setAlpha(0);

        // Animate rewards text
        this.tweens.add({
            targets: rewardsText,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            delay: 1000
        });

        // Process each reward
        let yOffset = 80;
        rewards.forEach((reward, index) => {
            // Create reward text
            const rewardText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + yOffset,
                this.getRewardText(reward),
                {
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    color: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001).setAlpha(0);

            // Animate reward text with delay
            this.tweens.add({
                targets: rewardText,
                alpha: 1,
                duration: 500,
                ease: 'Power2',
                delay: 1500 + (index * 300)
            });

            // Apply the reward
            this.applyReward(reward);

            yOffset += 25;
        });
    }

    /**
     * Get display text for a reward
     */
    getRewardText(reward) {
        switch (reward.type) {
            case 'upgrade':
                return `${reward.name}: ${reward.description}`;
            case 'credits':
                return `${reward.value} Credits`;
            case 'unlock':
                return `New Ship Unlocked: ${reward.name}`;
            default:
                return `Unknown Reward: ${reward.type}`;
        }
    }

    /**
     * Apply a reward to the player
     */
    applyReward(reward) {
        switch (reward.type) {
            case 'upgrade':
                // Add upgrade to player's collection
                this.game.global.currentRun.upgrades.push(reward);
                break;
            case 'credits':
                // Add credits to meta-progression
                this.game.global.metaProgress.credits += reward.value;
                break;
            case 'unlock':
                // Unlock new ship if not already unlocked
                if (!this.game.global.metaProgress.unlockedShips.includes(reward.id)) {
                    this.game.global.metaProgress.unlockedShips.push(reward.id);
                }
                break;
        }

        // Save game after applying rewards
        if (this.game.saveGameState) {
            this.game.saveGameState();
        }
    }

    /**
     * Show performance summary after defeating Nemesis
     * @param {object} metrics - Performance metrics
     */
    showPerformanceSummary(metrics) {
        // Create performance summary if it doesn't exist
        if (!this.performanceSummary) {
            this.performanceSummary = new NemesisPerformanceSummary(this);
        }

        // Set metrics
        this.performanceSummary.setMetrics(metrics);

        // Show the summary
        this.performanceSummary.show();

        // Listen for summary closed event
        this.events.once('summary-closed', () => {
            this.completeLevel();
        });
    }

    /**
     * Collect performance metrics for Nemesis fight
     * @param {BossNemesis} nemesis - The defeated Nemesis boss
     * @returns {object} Performance metrics
     */
    collectPerformanceMetrics(nemesis) {
        // Get metrics from adaptive difficulty system if available
        let metrics = {};

        if (nemesis && nemesis.adaptiveDifficulty) {
            metrics = nemesis.adaptiveDifficulty.metrics;
        }

        // Add additional metrics
        metrics.timeInFight = metrics.timeInFight || 0;
        metrics.damageDealt = metrics.damageDealt || 0;
        metrics.damageTaken = metrics.damageTaken || 0;
        metrics.hitsLanded = metrics.hitsLanded || 0;
        metrics.hitsTaken = metrics.hitsTaken || 0;
        metrics.attacksAvoided = metrics.attacksAvoided || 0;
        metrics.weaponsUsed = metrics.weaponsUsed || {};
        metrics.combosAvoided = metrics.combosAvoided || 0;
        metrics.combosTaken = metrics.combosTaken || 0;

        // Add weapon usage data
        if (this.player && this.player.weaponStats) {
            metrics.weaponsUsed = this.player.weaponStats;
        }

        // Add difficulty level
        if (nemesis && nemesis.adaptiveDifficulty) {
            metrics.difficultyLevel = nemesis.adaptiveDifficulty.difficultyLevel;
        } else {
            metrics.difficultyLevel = 0.5; // Default to normal
        }

        return metrics;
    }

    completeLevel() {
        // Record sector completion for dynamic difficulty
        if (this.dynamicDifficulty && this.sectorStartTime) {
            const timeSpent = this.time.now - this.sectorStartTime;
            this.dynamicDifficulty.recordSectorCompleted(this.currentSector, timeSpent);
        }

        // Track sector completion in analytics
        if (this.game.global.analytics) {
            this.game.global.analytics.trackGameplay('progression', 'sector_completed', {
                sector: this.currentSector,
                score: this.score,
                timeSpent: this.time.now - this.sectorStartTime,
                enemiesDefeated: this.dynamicDifficulty ? this.dynamicDifficulty.metrics.enemiesDefeated : 0,
                upgrades: this.choiceSystem ? this.choiceSystem.playerBuild.activeUpgrades.length : 0,
                penalties: this.choiceSystem ? this.choiceSystem.playerBuild.activePenalties.length : 0
            });
        }

        // Level is complete, transition to upgrade scene
        this.scene.start(CONSTANTS.SCENES.UPGRADE, {
            sector: this.currentSector + 1,
            score: this.score,
            shipType: this.game.global.currentRun.shipType,
            upgrades: this.game.global.currentRun.upgrades,
            penalties: this.game.global.currentRun.penalties
        });
    }

    playMusic() {
        // Sound is disabled
        console.log('Sound is disabled - skipping music playback');
        return;
    }

    createPowerup(x, y, specificType = null) {
        let type;

        if (specificType) {
            // Use the specified type if provided
            type = specificType;
        } else {
            // Create a random powerup at the given location
            const powerupTypes = ['health', 'shield', 'weapon', 'score', 'ammo'];

            // Weight the probabilities - make ammo more common
            const weights = [20, 20, 15, 15, 30]; // Total: 100

            // Select a type based on weights
            let random = Math.random() * 100;
            let cumulativeWeight = 0;
            type = 'ammo'; // Default

            for (let i = 0; i < powerupTypes.length; i++) {
                cumulativeWeight += weights[i];
                if (random <= cumulativeWeight) {
                    type = powerupTypes[i];
                    break;
                }
            }
        }

        // Create powerup group if it doesn't exist
        if (!this.powerups) {
            this.powerups = this.physics.add.group();
        }

        // Create the powerup object
        const powerup = new PowerUp(this, x, y, type);

        // Set up collision with player
        this.physics.add.overlap(this.player, powerup, this.collectPowerup, null, this);

        return powerup;
    }

    collectPowerup(player, powerup) {
        // Apply the powerup effect
        powerup.applyEffect(player);

        // Update UI if needed
        this.updateHealthUI();

        // Create visual effect for powerup collection
        if (this.visualEffects) {
            this.visualEffects.createPowerupEffect(powerup.x, powerup.y, powerup.type);
        }

        // Destroy the powerup
        powerup.destroy();
    }
}