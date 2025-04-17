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

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;

        // Update player
        if (this.player && this.player.active) {
            this.player.update();

            // Update player projectiles vs homing targets
            if (this.player.weaponType === 'HOMING_MISSILE') {
                this.updateHomingMissiles();
            }
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

        // Update UI elements
        this.updateHealthUI();

        // Scroll background layers at different speeds for parallax effect
        // Check if the background layers are actual sprites or dummy objects
        if (this.bgStars && this.bgStars.tilePositionY !== undefined) {
            this.bgStars.tilePositionY -= 0.5 * (delta / 16);
        }

        if (this.bgNebula && this.bgNebula.tilePositionY !== undefined) {
            this.bgNebula.tilePositionY -= 0.2 * (delta / 16);
        }

        if (this.bgDust && this.bgDust.tilePositionY !== undefined) {
            this.bgDust.tilePositionY -= 1.0 * (delta / 16);
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

            // Create distant star field particle effect
            try {
                if (this.textures.exists('star-particle')) {
                    this.starParticles = this.add.particles('star-particle');

                    this.starEmitter = this.starParticles.createEmitter({
                        x: { min: 0, max: this.cameras.main.width },
                        y: 0,
                        lifespan: { min: 2000, max: 5000 },
                        speedY: { min: 100, max: 200 },
                        scale: { start: 0.2, end: 0 },
                        quantity: 1,
                        blendMode: 'ADD',
                        frequency: 500
                    });

                    // Star particles should be fixed to camera
                    this.starParticles.setScrollFactor(0).setDepth(CONSTANTS.GAME.BACKGROUND_Z_INDEX + 15);
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
        this.player = new PlayerShip(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            'player-ship'
        );
    }

    createUI() {
        // Create UI container that stays fixed to the camera
        this.uiContainer = this.add.container(0, 0)
            .setScrollFactor(0);

        // Score text
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#33ff33'
        }).setScrollFactor(0);

        this.uiContainer.add(this.scoreText);

        // Health bar
        const healthBarBg = this.add.rectangle(20, 60, 200, 20, 0x222222)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.healthBar = this.add.rectangle(20, 60, 200, 20, 0x33ff33)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.uiContainer.add([healthBarBg, this.healthBar]);

        // Shield bar
        const shieldBarBg = this.add.rectangle(20, 85, 200, 10, 0x222222)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.shieldBar = this.add.rectangle(20, 85, 200, 10, 0x3388ff)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.uiContainer.add([shieldBarBg, this.shieldBar]);

        // Sector progress bar
        const progressBarBg = this.add.rectangle(this.cameras.main.width - 220, 20, 200, 10, 0x222222)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.progressBar = this.add.rectangle(this.cameras.main.width - 220, 20, 0, 10, 0xffffff)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.sectorText = this.add.text(this.cameras.main.width - 220, 35, 'SECTOR: 1', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff'
        }).setScrollFactor(0);

        this.uiContainer.add([progressBarBg, this.progressBar, this.sectorText]);

        // Pause button
        this.pauseButton = this.add.image(this.cameras.main.width - 30, 30, 'button')
            .setScrollFactor(0)
            .setScale(0.5)
            .setInteractive();

        this.pauseText = this.add.text(this.pauseButton.x, this.pauseButton.y, 'II', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0);

        this.uiContainer.add([this.pauseButton, this.pauseText]);

        // Set up pause button interaction
        this.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });

        // Ship status button
        const shipStatusButton = this.add.text(
            this.cameras.main.width - 120,
            70,
            'SHIP STATUS',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#cccccc',
                align: 'center',
                backgroundColor: '#333333',
                padding: {
                    x: 8,
                    y: 4
                }
            }
        ).setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

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

        this.uiContainer.add(shipStatusButton);
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

        // No need to call updateEnemyProjectileCollisions again as it's already called above
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
                this.progressBar.width = 200 * progress;

                // Check if we've reached the boss
                if (this.procGen.reachedBoss() && !this.bossEncountered) {
                    this.spawnBoss();
                }
            } else {
                // Fallback if procGen is not available
                this.sectorProgress += scrollSpeed;
                const progress = this.sectorProgress / CONSTANTS.SECTOR.LENGTH;
                this.progressBar.width = 200 * Math.min(progress, 1);
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
        // Create enemies from the wave data
        wave.enemies.forEach(enemyData => {
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

        // Create the appropriate boss based on sector and type
        switch (bossData.type) {
            case 'SCOUT_COMMANDER':
                boss = new BossGuardian(
                    this,
                    this.cameras.main.width / 2,
                    this.cameras.main.scrollY - 200
                );
                break;

            // For other boss types, use a placeholder for now
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

        // If enemy was killed, update score
        if (killed) {
            this.updateScore(enemy.score);
        }

        // Create hit effect at impact point
        this.createHitEffect(projectile.x, projectile.y);

        // Destroy projectile unless it's a penetrating type
        if (projectile.active && !projectile.isPenetrating) {
            projectile.destroy();
        }
    }

    handleEnemyProjectilePlayerCollision(player, projectile) {
        // Apply damage to player
        const damage = projectile.damage || 10;
        const hitSuccess = player.takeDamage(damage);

        // Update UI
        if (hitSuccess) {
            this.updateHealthUI();
        }

        // Create hit effect at impact point
        this.createHitEffect(projectile.x, projectile.y, 0xff0000);

        // Destroy projectile
        projectile.destroy();
    }

    createHitEffect(x, y, color = 0x33ff33) {
        // Create a simple particle effect for projectile hits
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

            // Auto-destroy after particles are done
            this.time.delayedCall(300, () => {
                particles.destroy();
            });
        } catch (error) {
            console.warn('Could not create hit effect:', error);
        }
    }

    createCollisionEffect(x, y) {
        // Create a larger effect for ship collisions
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

    updateScore(amount) {
        // Add to score
        this.score += amount;

        // Update UI
        this.scoreText.setText(`SCORE: ${this.score}`);
    }

    updateHealthUI() {
        // Update health and shield bars
        if (this.player) {
            // Update health bar
            const healthPercentage = this.player.health / this.player.maxHealth;
            this.healthBar.width = 200 * healthPercentage;

            // Change color based on health level
            if (healthPercentage < 0.2) {
                this.healthBar.fillColor = 0xff0000;
            } else if (healthPercentage < 0.5) {
                this.healthBar.fillColor = 0xffff00;
            } else {
                this.healthBar.fillColor = 0x33ff33;
            }

            // Update shield bar
            const shieldPercentage = this.player.shields / this.player.maxShields;
            this.shieldBar.width = 200 * shieldPercentage;
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
            this.bossHealthBar.width = 400 * healthPercentage;
        }
    }

    /**
     * Set up the boss arena environment
     */
    setupBossArena(bossData) {
        console.log('Setting up boss arena for', bossData.type);

        // Create arena boundaries
        this.createArenaBoundaries();

        // Create arena hazards based on boss type
        this.createArenaHazards(bossData);

        // Slow down background scrolling for boss fight
        this.backgroundScrollSpeed = CONSTANTS.GAME.BACKGROUND_SCROLL_SPEED * 0.5;

        // Add visual effects for the arena
        this.createArenaVisualEffects(bossData);
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
     * Show rewards after defeating a boss
     */
    showBossRewards(boss) {
        // Get rewards from boss
        if (!boss || !boss.grantRewards) return;

        const rewards = boss.grantRewards();
        if (!rewards || rewards.length === 0) return;

        console.log('Showing boss rewards:', rewards);

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

    completeLevel() {
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

    createPowerup(x, y) {
        // Create a random powerup at the given location
        const powerupTypes = ['health', 'shield', 'weapon', 'score'];
        const type = powerupTypes[Phaser.Math.Between(0, powerupTypes.length - 1)];

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

        // Destroy the powerup
        powerup.destroy();
    }
}