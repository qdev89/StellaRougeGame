/**
 * Boss Enemy
 * Base class for boss enemies with multiple phases and special attack patterns
 */
class BossEnemy extends Enemy {
    constructor(scene, x, y, texture, config) {
        super(scene, x, y, texture);

        // Boss-specific properties
        this.phases = config.phases || [];
        this.currentPhase = 0;
        this.phaseThresholds = config.phaseThresholds || [0.75, 0.5, 0.25];
        this.maxHealth = config.health || 1000;
        this.health = this.maxHealth;
        this.attackPatterns = config.attackPatterns || [];
        this.currentPattern = null;
        this.rewards = config.rewards || [];

        // Visual elements
        this.shieldEffect = null;
        this.weaponPorts = [];
        this.engineEffect = null;

        // State management
        this.stateMachine = new StateMachine(this);
        this.setupStateMachine();

        // Initialize boss
        this.setupPhysics();
        this.setupWeapons();
        this.setupVisuals();
    }

    setupStateMachine() {
        // Define states for different phases and behaviors
        this.stateMachine.addState('spawn', {
            onEnter: this.onSpawnEnter.bind(this),
            onUpdate: this.onSpawnUpdate.bind(this),
            onExit: this.onSpawnExit.bind(this)
        });

        this.stateMachine.addState('phase1', {
            onEnter: this.onPhase1Enter.bind(this),
            onUpdate: this.onPhase1Update.bind(this),
            onExit: this.onPhase1Exit.bind(this)
        });

        this.stateMachine.addState('phase2', {
            onEnter: this.onPhase2Enter.bind(this),
            onUpdate: this.onPhase2Update.bind(this),
            onExit: this.onPhase2Exit.bind(this)
        });

        this.stateMachine.addState('phase3', {
            onEnter: this.onPhase3Enter.bind(this),
            onUpdate: this.onPhase3Update.bind(this),
            onExit: this.onPhase3Exit.bind(this)
        });

        this.stateMachine.addState('phase4', {
            onEnter: this.onPhase4Enter.bind(this),
            onUpdate: this.onPhase4Update.bind(this),
            onExit: this.onPhase4Exit.bind(this)
        });

        this.stateMachine.addState('defeated', {
            onEnter: this.onDefeatedEnter.bind(this),
            onUpdate: this.onDefeatedUpdate.bind(this)
        });

        // Start with spawn state
        this.stateMachine.setState('spawn');
    }

    setupPhysics() {
        // Set up physics body
        this.scene.physics.world.enable(this);
        this.body.setCollideWorldBounds(true);

        // Boss has a larger hitbox
        this.body.setSize(this.width * 0.8, this.height * 0.8);

        // Set boss mass (affects collision response)
        this.body.mass = 10;
    }

    setupWeapons() {
        // Create weapon ports based on boss type
        this.weaponPorts = [];

        // Default weapon ports (can be overridden by specific boss types)
        const portPositions = [
            { x: -this.width * 0.3, y: this.height * 0.3 },
            { x: 0, y: this.height * 0.4 },
            { x: this.width * 0.3, y: this.height * 0.3 }
        ];

        portPositions.forEach(pos => {
            const port = {
                x: pos.x,
                y: pos.y,
                cooldown: 0,
                active: true
            };
            this.weaponPorts.push(port);
        });
    }

    setupVisuals() {
        // Set up visual effects
        this.setScale(2); // Bosses are larger

        // Add shield effect
        this.shieldEffect = this.scene.add.graphics();
        this.updateShieldEffect();

        // Add engine effect
        this.engineEffect = this.scene.add.particles('particle-blue').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 50, max: 100 },
            angle: { min: 80, max: 100 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            on: false
        });
    }

    update(time, delta) {
        super.update(time, delta);

        // Update state machine
        this.stateMachine.update(delta);

        // Check for phase transitions
        this.checkPhaseTransition();

        // Update visual effects
        this.updateVisuals(delta);

        // Position effects relative to boss
        if (this.shieldEffect) {
            this.shieldEffect.x = this.x;
            this.shieldEffect.y = this.y;
        }

        if (this.engineEffect) {
            this.engineEffect.setPosition(this.x, this.y + this.height * 0.4);
        }
    }

    checkPhaseTransition() {
        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth;

        // Check if we should transition to a new phase
        for (let i = this.currentPhase; i < this.phaseThresholds.length; i++) {
            if (healthPercentage <= this.phaseThresholds[i]) {
                this.transitionToPhase(i + 1);
                break;
            }
        }
    }

    transitionToPhase(phaseIndex) {
        if (phaseIndex === this.currentPhase) return;

        this.currentPhase = phaseIndex;
        this.stateMachine.setState(`phase${phaseIndex}`);

        // Trigger phase transition effects
        this.scene.cameras.main.shake(500, 0.01);
        this.scene.events.emit('boss-phase-change', this.currentPhase);

        console.log(`Boss transitioning to phase ${phaseIndex}`);
    }

    takeDamage(amount) {
        // Apply damage
        this.health -= amount;

        // Flash effect
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });

        // Update health bar if it exists
        if (this.scene.bossHealthBar) {
            this.scene.bossHealthBar.setScale(Math.max(0, this.health / this.maxHealth), 1);
        }

        // Check if boss is defeated
        if (this.health <= 0) {
            this.health = 0;
            this.stateMachine.setState('defeated');
        }

        // Emit damage event
        this.scene.events.emit('boss-damage', amount, this.health / this.maxHealth);
    }

    updateVisuals(delta) {
        // Update shield effect
        this.updateShieldEffect();

        // Update engine effect
        if (this.engineEffect) {
            if (this.body.velocity.y < 0) {
                this.engineEffect.on = true;
                this.engineEffect.setSpeed({ min: Math.abs(this.body.velocity.y) * 0.5, max: Math.abs(this.body.velocity.y) });
            } else {
                this.engineEffect.on = false;
            }
        }
    }

    updateShieldEffect() {
        if (!this.shieldEffect) return;

        // Clear previous shield
        this.shieldEffect.clear();

        // Only show shield in certain phases
        if (this.currentPhase === 0 || this.currentPhase === 1) {
            // Draw shield based on health percentage
            const healthPercent = this.health / this.maxHealth;
            const shieldAlpha = 0.3 + (0.3 * (1 - healthPercent));
            const shieldRadius = this.width * 0.6;

            this.shieldEffect.fillStyle(0x3388ff, shieldAlpha);
            this.shieldEffect.fillCircle(0, 0, shieldRadius);

            this.shieldEffect.lineStyle(2, 0x66aaff, 0.8);
            this.shieldEffect.strokeCircle(0, 0, shieldRadius);
        }
    }

    fireWeapon(portIndex, projectileType = 'boss-projectile') {
        // Check if port exists and is not on cooldown
        if (!this.weaponPorts[portIndex] || this.weaponPorts[portIndex].cooldown > 0) {
            return;
        }

        const port = this.weaponPorts[portIndex];

        // Calculate world position of port
        const portX = this.x + port.x;
        const portY = this.y + port.y;

        // Create projectile
        const projectile = this.scene.physics.add.sprite(portX, portY, projectileType);
        projectile.setScale(1.5);

        // Add to enemy projectiles group
        if (this.scene.enemyProjectiles) {
            this.scene.enemyProjectiles.add(projectile);
        }

        // Set velocity (downward by default)
        projectile.setVelocity(0, 300);

        // Set damage
        projectile.damage = 10;

        // Auto-destroy when off screen
        projectile.checkWorldBounds = true;
        projectile.outOfBoundsKill = true;

        // Set cooldown
        port.cooldown = 1000; // 1 second cooldown

        // Reset cooldown after delay
        this.scene.time.delayedCall(port.cooldown, () => {
            if (port) {
                port.cooldown = 0;
            }
        });

        return projectile;
    }

    fireSpreadShot(portIndex, count = 5, spreadAngle = 60) {
        // Fire multiple projectiles in a spread pattern
        const centerAngle = 90; // Downward
        const angleStep = spreadAngle / (count - 1);

        for (let i = 0; i < count; i++) {
            const angle = centerAngle - (spreadAngle / 2) + (angleStep * i);
            const projectile = this.fireWeapon(portIndex);

            if (projectile) {
                // Set velocity based on angle
                const speed = 300;
                const radians = Phaser.Math.DegToRad(angle);
                const velocityX = Math.cos(radians) * speed;
                const velocityY = Math.sin(radians) * speed;

                projectile.setVelocity(velocityX, velocityY);
            }
        }
    }

    deployDrones(count = 2) {
        // Deploy drone enemies
        for (let i = 0; i < count; i++) {
            // Calculate spawn position
            const offsetX = (i % 2 === 0) ? -100 : 100;
            const offsetY = 50;

            // Create drone
            const drone = new EnemyDrone(
                this.scene,
                this.x + offsetX,
                this.y + offsetY,
                'enemy-drone'
            );

            // Add to enemies group
            if (this.scene.enemies) {
                this.scene.enemies.add(drone);
            }

            // Set drone behavior
            drone.setData('behavior', 'orbit');
            drone.setData('orbitTarget', this);
            drone.setData('orbitDistance', 150);
            drone.setData('orbitSpeed', 0.02);
            drone.setData('orbitOffset', i * Math.PI);
        }
    }

    grantRewards() {
        // Return rewards for defeating this boss
        return this.rewards;
    }

    // State handlers for different phases
    onSpawnEnter() {
        console.log('Boss spawn phase entered');

        // Set initial position off-screen
        this.y = -this.height;

        // Disable collisions during spawn
        this.body.enable = false;

        // Start engine effect
        if (this.engineEffect) {
            this.engineEffect.on = true;
        }
    }

    onSpawnUpdate(delta) {
        // Move to initial position
        this.y += 2;

        // Check if reached target position
        if (this.y >= 150) {
            this.stateMachine.setState('phase1');
        }
    }

    onSpawnExit() {
        // Enable collisions
        this.body.enable = true;

        // Stop engine effect
        if (this.engineEffect) {
            this.engineEffect.on = false;
        }
    }

    onPhase1Enter() {
        console.log('Boss phase 1 entered');

        // Setup for first phase
        this.currentPattern = 'spread';

        // Activate all weapon ports
        this.weaponPorts.forEach(port => {
            port.active = true;
            port.cooldown = 0;
        });
    }

    onPhase1Update(delta) {
        // Move side to side slowly
        this.x += Math.sin(this.scene.time.now * 0.001) * 1;

        // Fire weapons periodically
        if (this.scene.time.now % 2000 < 50) { // Every 2 seconds
            this.fireSpreadShot(1, 3, 30); // Center port, 3 projectiles, 30 degree spread
        }
    }

    onPhase1Exit() {
        // Flash effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }

    onPhase2Enter() {
        console.log('Boss phase 2 entered');

        // Setup for second phase
        this.currentPattern = 'drones';

        // Deploy drones
        this.deployDrones(2);
    }

    onPhase2Update(delta) {
        // Move in a figure-8 pattern
        const t = this.scene.time.now * 0.001;
        const centerX = this.scene.cameras.main.width / 2;
        const amplitude = 150;

        this.x = centerX + Math.sin(t) * amplitude;
        this.y = 150 + Math.sin(t * 2) * 50;

        // Fire weapons periodically
        if (this.scene.time.now % 1500 < 50) { // Every 1.5 seconds
            this.fireWeapon(0); // Left port
            this.fireWeapon(2); // Right port
        }
    }

    onPhase2Exit() {
        // Flash effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }

    onPhase3Enter() {
        console.log('Boss phase 3 entered');

        // Setup for third phase
        this.currentPattern = 'beam';

        // Deploy more drones
        this.deployDrones(2);
    }

    onPhase3Update(delta) {
        // Move more aggressively
        const t = this.scene.time.now * 0.001;
        const centerX = this.scene.cameras.main.width / 2;
        const amplitude = 200;

        this.x = centerX + Math.sin(t * 1.5) * amplitude;
        this.y = 150 + Math.cos(t * 0.5) * 70;

        // Fire weapons more frequently
        if (this.scene.time.now % 1000 < 50) { // Every 1 second
            this.fireSpreadShot(1, 5, 60); // Center port, 5 projectiles, 60 degree spread
        }

        // Occasionally fire from all ports
        if (this.scene.time.now % 3000 < 50) { // Every 3 seconds
            this.weaponPorts.forEach((port, index) => {
                this.fireWeapon(index);
            });
        }
    }

    onPhase3Exit() {
        // Flash effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }

    onPhase4Enter() {
        console.log('Boss phase 4 entered');

        // Setup for final phase
        this.currentPattern = 'desperate';

        // Tint to indicate rage mode
        this.setTint(0xff3333);

        // Deploy final wave of drones
        this.deployDrones(3);
    }

    onPhase4Update(delta) {
        // Erratic movement
        const t = this.scene.time.now * 0.001;
        const centerX = this.scene.cameras.main.width / 2;
        const amplitude = 250;

        this.x = centerX + Math.sin(t * 2) * amplitude * Math.sin(t * 0.5);
        this.y = 150 + Math.cos(t) * 100;

        // Rapid fire
        if (this.scene.time.now % 500 < 50) { // Every 0.5 seconds
            const randomPort = Phaser.Math.Between(0, this.weaponPorts.length - 1);
            this.fireSpreadShot(randomPort, 3, 30);
        }

        // Occasionally fire massive spread
        if (this.scene.time.now % 4000 < 50) { // Every 4 seconds
            this.fireSpreadShot(1, 9, 120); // Center port, 9 projectiles, 120 degree spread
        }
    }

    onPhase4Exit() {
        // Clear tint
        this.clearTint();
    }

    onDefeatedEnter() {
        console.log('Boss defeated');

        // Stop all movement
        this.body.setVelocity(0, 0);

        // Disable collisions
        this.body.enable = false;

        // Start defeat sequence
        this.scene.events.emit('boss-defeated', this);

        // Create explosion effect
        this.createExplosionEffect();
    }

    createExplosionEffect() {
        // Use visual effects system if available
        if (this.scene.visualEffects) {
            // Create a large explosion
            this.scene.visualEffects.createExplosion(this.x, this.y, 'large');

            // Add multiple smaller explosions around the boss
            const explosionCount = 8;
            const radius = this.width * 0.7;

            // Create a sequence of explosions
            for (let i = 0; i < explosionCount; i++) {
                this.scene.time.delayedCall(i * 200, () => {
                    // Calculate random position around the boss
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * radius;
                    const x = this.x + Math.cos(angle) * distance;
                    const y = this.y + Math.sin(angle) * distance;

                    // Create explosion
                    const size = Math.random() < 0.5 ? 'small' : 'medium';
                    this.scene.visualEffects.createExplosion(x, y, size);
                });
            }

            // Final large explosion after the sequence
            this.scene.time.delayedCall(explosionCount * 200 + 500, () => {
                this.scene.visualEffects.createExplosion(this.x, this.y, 'large');
                this.scene.visualEffects.createScreenShake(0.02, 500);
            });
        } else {
            // Fallback to simple explosion animation
            const explosion = this.scene.add.sprite(this.x, this.y, 'explosion');

            if (this.scene.anims.exists('explosion-anim')) {
                explosion.play('explosion-anim');
            } else {
                this.scene.tweens.add({
                    targets: explosion,
                    alpha: 0,
                    scale: 3,
                    duration: 1000,
                    onComplete: () => {
                        explosion.destroy();
                    }
                });
            }
        }
    }

    onDefeatedUpdate(delta) {
        // Slowly fade out
        this.alpha -= 0.01;

        // Create occasional small explosions
        if (Math.random() < 0.1) {
            const offsetX = Phaser.Math.Between(-this.width/2, this.width/2);
            const offsetY = Phaser.Math.Between(-this.height/2, this.height/2);

            const explosion = this.scene.add.sprite(
                this.x + offsetX,
                this.y + offsetY,
                'explosion'
            );

            explosion.setScale(0.5);
            if (explosion.anims && explosion.anims.exists('explosion')) {
                explosion.play('explosion');
                explosion.once('animationcomplete', () => {
                    explosion.destroy();
                });
            } else {
                // Fallback if animation doesn't exist
                this.scene.tweens.add({
                    targets: explosion,
                    alpha: 0,
                    scale: 1.5,
                    duration: 300,
                    onComplete: () => {
                        explosion.destroy();
                    }
                });
            }
        }

        // Remove when fully faded
        if (this.alpha <= 0) {
            this.destroy();

            // Ensure the level completes if it hasn't already
            if (this.scene && !this.scene.levelCompleting) {
                console.log('Boss fully destroyed, ensuring level completion');
                this.scene.time.delayedCall(1000, () => {
                    if (this.scene && !this.scene.levelCompleting) {
                        this.scene.completeLevel();
                    }
                });
            }
        }
    }

    // Note: This is an enhanced version of the createExplosionEffect method above
    // that adds more visual effects and ensures proper cleanup
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.BossEnemy = BossEnemy;
}
