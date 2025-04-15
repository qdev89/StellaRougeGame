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

        // Set up empty collections for game objects
        this.enemies = this.physics.add.group();
        this.hazards = this.physics.add.group();
        this.specialEncounters = [];

        // Track the player's progress through the sector
        this.sectorProgress = 0;

        // Game state flags
        this.isPaused = false;
        this.isGameOver = false;
        this.bossEncountered = false;
    }

    create() {
        try {
            console.log('GameScene: Starting sector', this.currentSector);

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

            // Set up UI elements
            this.createUI();

            // Collision handlers are set up in setupPhysics()

            // Set up event handlers
            this.setupEvents();

            // Create procedural generator with error handling
            try {
                this.procGen = new ProceduralGenerator(this);

                // Generate the current sector
                this.currentSectorData = this.procGen.generateSector(this.currentSector);
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
            waves: [
                {
                    position: -1000,
                    length: 200,
                    enemies: [
                        {
                            type: 'DRONE',
                            position: { x: 200, y: -200 },
                            isElite: false
                        },
                        {
                            type: 'DRONE',
                            position: { x: 400, y: -300 },
                            isElite: false
                        }
                    ],
                    spawned: false
                }
            ],
            hazards: [],
            specialEncounters: [],
            bossEncounter: {
                type: 'DESTROYER',
                position: -5000,
                arena: 'arena_1',
                healthMultiplier: 1.0
            }
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

    showUpgradeChoice() {
        // Pause the game while showing the choice UI
        this.pauseGameplay();

        // Generate a choice from the choice system
        const choice = this.choiceSystem.generateChoice('standard');

        // In a complete implementation, this would open a UI panel
        console.log('Showing upgrade choice:', choice);

        // For now, just apply a random upgrade
        const randomOption = Phaser.Math.Between(0, choice.options.length - 1);
        const result = this.choiceSystem.applyChoice(randomOption, choice);

        console.log('Applied choice:', result);

        // Resume gameplay after a short delay
        this.time.delayedCall(1000, () => {
            this.resumeGameplay();
        });
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

        // Create a boss based on the type
        let boss;

        // For now, use a super-sized destroyer as the boss
        boss = new EnemyDestroyer(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.scrollY - 200
        );

        // Scale up the boss and give it more health
        boss.setScale(3.0);
        boss.health *= bossData.healthMultiplier;
        boss.maxHealth *= bossData.healthMultiplier;

        // If it has shields, boost those too
        if (boss.hasShield) {
            boss.shieldHealth *= bossData.healthMultiplier;
            boss.maxShieldHealth *= bossData.healthMultiplier;
        }

        // Make the boss elite for extra challenge
        boss.isElite = true;
        boss.applyEliteBuffs();

        // Add to enemies physics group
        this.enemies.add(boss);

        // Create a boss announcement
        this.createBossAnnouncement(bossData.type);

        // Play boss music if available
        if (this.sound.get('boss-music')) {
            this.sound.play('boss-music', { volume: 0.7 });
        }
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

            // Animate warning text
            this.tweens.add({
                targets: warningText,
                alpha: 1,
                y: warningText.y - 20,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    // Hold for a moment then fade out
                    this.tweens.add({
                        targets: warningText,
                        alpha: 0,
                        y: warningText.y - 20,
                        delay: 1500,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            warningText.destroy();
                        }
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

        // Create game over overlay
        this.gameOverOverlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000, 0.8
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(100);

        // Add game over text with animation
        this.gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            'MISSION FAILED',
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#ff3333',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

        // Add score text
        this.finalScoreText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `FINAL SCORE: ${this.score}`,
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

        // Add sector reached text
        this.sectorText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 50,
            `SECTOR: ${this.currentSector}`,
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#aaaaff',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

        // Add restart option
        this.restartText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 120,
            'Press R to try again',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#33ff33',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

        // Add continue to menu option
        this.menuText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 160,
            'Press M for menu',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#33ff33',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

        // Animate text elements sequentially
        this.time.delayedCall(500, () => {
            this.tweens.add({
                targets: this.gameOverText,
                alpha: 1,
                y: this.gameOverText.y + 20,
                duration: 500,
                ease: 'Power2'
            });
        });

        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets: this.finalScoreText,
                alpha: 1,
                y: this.finalScoreText.y + 10,
                duration: 400
            });
        });

        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: this.sectorText,
                alpha: 1,
                y: this.sectorText.y + 10,
                duration: 400
            });
        });

        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [this.restartText, this.menuText],
                alpha: 1,
                y: '+=10',
                duration: 400,
                ease: 'Back.easeOut',
                onComplete: () => {
                    // Make option text blink
                    this.tweens.add({
                        targets: [this.restartText, this.menuText],
                        alpha: 0.5,
                        ease: 'Sine.easeInOut',
                        duration: 500,
                        yoyo: true,
                        repeat: -1
                    });
                }
            });

            // Calculate and update meta-progression
            this.updateMetaProgression();

            // Add key handlers for restart and menu
            this.input.keyboard.once('keydown-R', this.restartGame, this);
            this.input.keyboard.once('keydown-M', this.returnToMainMenu, this);
        });
    }

    updateMetaProgression() {
        // Calculate credits earned from this run
        const creditsEarned = Math.floor(this.score / 10);

        // Update global meta-progression
        if (!this.game.global.metaProgress) {
            this.game.global.metaProgress = {
                credits: 0,
                highestSector: 1,
                unlockedShips: ['fighter'],
                unlockedUpgrades: []
            };
        }

        // Add credits
        this.game.global.metaProgress.credits += creditsEarned;

        // Update highest sector reached
        if (this.currentSector > this.game.global.metaProgress.highestSector) {
            this.game.global.metaProgress.highestSector = this.currentSector;
        }

        // Check if we've unlocked any new content
        this.checkForUnlocks();

        // Display credits earned
        this.creditsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            `CREDITS EARNED: ${creditsEarned}`,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffff00',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

        this.tweens.add({
            targets: this.creditsText,
            alpha: 1,
            y: this.creditsText.y - 10,
            duration: 500,
            delay: 300
        });
    }

    checkForUnlocks() {
        // Check if we've reached certain milestones to unlock content
        const metaProgress = this.game.global.metaProgress;

        // Example: Unlock second ship type after reaching sector 3
        if (this.currentSector >= 3 && !metaProgress.unlockedShips.includes('interceptor')) {
            metaProgress.unlockedShips.push('interceptor');

            // Show unlock message
            this.showUnlockMessage('New ship type: INTERCEPTOR');
        }

        // Example: Unlock special upgrade at score threshold
        if (this.score >= 50000 && !metaProgress.unlockedUpgrades.includes('advanced_shields')) {
            metaProgress.unlockedUpgrades.push('advanced_shields');

            // Show unlock message
            this.showUnlockMessage('New upgrade: ADVANCED SHIELDS');
        }
    }

    showUnlockMessage(message) {
        // Create a popup for the unlock message
        const unlockText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            `UNLOCKED: ${message}`,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#ffcc00',
                align: 'center',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102).setAlpha(0);

        // Animate popup
        this.tweens.add({
            targets: unlockText,
            alpha: 1,
            y: unlockText.y - 20,
            duration: 800,
            ease: 'Back.easeOut',
            yoyo: true,
            hold: 2000,
            repeat: 0,
            onComplete: () => {
                unlockText.destroy();
            }
        });
    }

    restartGame() {
        // Reset the game state and start a new run
        console.log('Restarting game...');

        // Optionally play a sound
        // this.sound.play('restart-sound');

        // Start a new game at sector 1
        this.scene.start(CONSTANTS.SCENES.GAME, {
            sector: 1,
            score: 0
        });
    }

    returnToMainMenu() {
        // Return to the main menu
        console.log('Returning to main menu...');

        // Optionally play a sound
        // this.sound.play('menu-sound');

        this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
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
        try {
            // Play background music if it exists
            if (this.cache.audio.exists('game-music')) {
                if (!this.sound.get('game-music')) {
                    const music = this.sound.add('game-music', {
                        volume: 0.5,
                        loop: true
                    });

                    music.play();
                }
            } else {
                console.log('Game music not found, continuing without background music');
            }
        } catch (error) {
            console.warn('Could not play music:', error);
        }
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