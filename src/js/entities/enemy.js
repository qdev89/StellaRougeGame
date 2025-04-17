/**
 * Enemy Class
 * Base class for all enemy ships with behavior patterns and combat logic
 */
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, enemyType) {
        super(scene, x, y, texture);

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Enemy type from constants
        this.enemyType = enemyType;
        this.settings = CONSTANTS.ENEMIES.TYPES[enemyType];

        // Set up properties based on enemy type
        this.health = this.settings.HEALTH;
        this.maxHealth = this.settings.HEALTH;
        this.speed = this.settings.SPEED;
        this.score = this.settings.SCORE;
        this.fireRate = this.settings.FIRE_RATE;

        // Elite status (more powerful variant)
        this.isElite = false;

        // Combat properties
        this.canFire = true;
        this.projectiles = scene.physics.add.group();

        // Movement pattern and behavior
        this.movementPattern = 'direct'; // default movement pattern
        this.behaviorTimer = null;
        this.targetPosition = new Phaser.Math.Vector2(x, y);

        // Setup behavior based on enemy type
        this.setupBehavior();
    }

    setupBehavior() {
        // Set depth based on enemy size
        switch (this.enemyType) {
            case 'DESTROYER':
                this.setDepth(5);
                this.setScale(1.5);
                break;
            case 'GUNSHIP':
                this.setDepth(4);
                this.setScale(1.2);
                break;
            case 'DRONE':
            default:
                this.setDepth(3);
                this.setScale(1.0);
                break;
        }

        // Apply elite buffs if this is an elite enemy
        if (this.isElite) {
            this.applyEliteBuffs();
        }

        // Start behavior pattern based on type
        switch (this.enemyType) {
            case 'DESTROYER':
                this.movementPattern = 'slow_approach';
                this.body.setSize(48, 48); // Larger hitbox
                break;
            case 'GUNSHIP':
                this.movementPattern = 'strafe';
                this.body.setSize(32, 32);
                break;
            case 'DRONE':
            default:
                this.movementPattern = 'swarm';
                this.body.setSize(24, 24); // Smaller hitbox
                break;
        }
    }

    applyEliteBuffs() {
        // Elite enemies get increased stats
        this.health *= 1.5;
        this.maxHealth *= 1.5;
        this.speed *= 1.2;
        this.score *= 2;
        this.fireRate *= 0.8; // Faster firing

        // Visual indicator for elite enemies (tint)
        this.setTint(0xff5500);
    }

    update(time, delta, playerShip) {
        if (this.active) {
            // Move according to the current pattern
            this.updateMovement(playerShip);

            // Attack if player is in range
            if (playerShip && playerShip.active && this.canFire) {
                this.fireAtPlayer(playerShip);
            }
        }
    }

    updateMovement(playerShip) {
        if (!playerShip || !playerShip.active) {
            // Default downward movement if no player target
            this.body.velocity.y = this.speed;
            return;
        }

        // Execute movement pattern based on enemy type
        switch (this.movementPattern) {
            case 'slow_approach':
                this.moveSlowApproach(playerShip);
                break;

            case 'strafe':
                this.moveStrafe(playerShip);
                break;

            case 'swarm':
                this.moveSwarm(playerShip);
                break;

            case 'direct':
            default:
                this.moveDirectly(playerShip);
                break;
        }
    }

    moveDirectly(playerShip) {
        // Move directly towards the player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );

        // Set velocity based on angle
        this.body.velocity.x = Math.cos(angle) * this.speed;
        this.body.velocity.y = Math.sin(angle) * this.speed;
    }

    moveSlowApproach(playerShip) {
        // Slow, steady approach that stays at distance
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );

        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );

        // If too close, back away slightly
        if (distance < 200) {
            this.body.velocity.x = -Math.cos(angle) * (this.speed * 0.5);
            this.body.velocity.y = -Math.sin(angle) * (this.speed * 0.5);
        }
        // If at good distance, move to maintain it
        else if (distance < 300) {
            // Calculate sideways angle (perpendicular to player)
            const sideAngle = angle + (Math.PI / 2);
            this.body.velocity.x = Math.cos(sideAngle) * this.speed;
            this.body.velocity.y = Math.sin(sideAngle) * (this.speed * 0.5);
        }
        // If too far, approach player
        else {
            this.body.velocity.x = Math.cos(angle) * this.speed;
            this.body.velocity.y = Math.sin(angle) * this.speed;
        }
    }

    moveStrafe(playerShip) {
        // Strafing movement side to side
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );

        // If we don't have a target position or reached it, get a new one
        if (!this.targetPosition ||
            Phaser.Math.Distance.Between(this.x, this.y, this.targetPosition.x, this.targetPosition.y) < 10) {

            // Pick a random point at the same Y level as the current position
            // but offset to the left or right of the player
            const offset = Phaser.Math.Between(-200, 200);
            this.targetPosition = new Phaser.Math.Vector2(
                playerShip.x + offset,
                this.y
            );
        }

        // Move towards the target position
        const targetAngle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.targetPosition.x, this.targetPosition.y
        );

        // Set velocity based on angle to target
        this.body.velocity.x = Math.cos(targetAngle) * this.speed;
        this.body.velocity.y = Math.sin(targetAngle) * (this.speed * 0.2);

        // Ensure we're always moving downward slowly
        this.body.velocity.y = Math.max(this.body.velocity.y, this.speed * 0.3);
    }

    moveSwarm(playerShip) {
        // Calculate base movement for swarm behavior
        if (!this.behaviorTimer) {
            // Initialize behavior timer for pattern change
            this.behaviorTimer = this.scene.time.addEvent({
                delay: Phaser.Math.Between(1000, 3000),
                callback: () => {
                    // Make sure the scene and cameras still exist
                    if (this.scene && this.scene.cameras && this.scene.cameras.main) {
                        // Change direction randomly
                        this.targetPosition = new Phaser.Math.Vector2(
                            Phaser.Math.Between(50, this.scene.cameras.main.width - 50),
                            Phaser.Math.Between(50, this.scene.cameras.main.height - 50)
                        );
                    }
                },
                loop: true
            });

            // Initial target
            this.targetPosition = new Phaser.Math.Vector2(
                playerShip.x,
                playerShip.y - 100 // Aim slightly above player
            );
        }

        // Move towards current target position
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.targetPosition.x, this.targetPosition.y
        );

        // Set velocity based on angle
        this.body.velocity.x = Math.cos(angle) * this.speed;
        this.body.velocity.y = Math.sin(angle) * this.speed;

        // Add slight attraction to player position
        const playerAngle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );

        this.body.velocity.x += Math.cos(playerAngle) * (this.speed * 0.2);
        this.body.velocity.y += Math.sin(playerAngle) * (this.speed * 0.2);

        // Normalize velocity to maintain speed
        const currentSpeed = Math.sqrt(
            this.body.velocity.x * this.body.velocity.x +
            this.body.velocity.y * this.body.velocity.y
        );

        this.body.velocity.x = (this.body.velocity.x / currentSpeed) * this.speed;
        this.body.velocity.y = (this.body.velocity.y / currentSpeed) * this.speed;
    }

    fireAtPlayer(playerShip) {
        if (!this.canFire) return;

        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );

        // Create projectile
        const laser = this.projectiles.create(this.x, this.y, 'laser-red');

        // Calculate velocity based on angle
        const speed = 300;
        laser.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Rotate laser to face direction
        laser.rotation = angle + Math.PI / 2;

        // Set damage based on enemy type (reduced by 50%)
        switch (this.enemyType) {
            case 'DESTROYER':
                laser.damage = 10; // Reduced from 20
                laser.setScale(1.5);
                break;
            case 'GUNSHIP':
                laser.damage = 5; // Reduced from 10
                laser.setScale(1.2);
                break;
            case 'DRONE':
            default:
                laser.damage = 3; // Reduced from 5
                break;
        }

        // Elite enemies deal more damage
        if (this.isElite) {
            laser.damage *= 1.5;
            laser.setTint(0xff5500);
        }

        // Auto-destroy after lifespan
        this.scene.time.delayedCall(2000, () => {
            if (laser.active) {
                laser.destroy();
            }
        });

        // Set fire rate cooldown
        this.canFire = false;
        this.scene.time.delayedCall(this.fireRate, () => {
            this.canFire = true;
        });
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash effect on hit
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 50,
            yoyo: true
        });

        // Check if dead
        if (this.health <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    die() {
        // Award score
        if (this.scene.updateScore) {
            this.scene.updateScore(this.score);
        }

        try {
            // Play explosion animation
            const explosion = this.scene.add.sprite(this.x, this.y, 'explosion');

            // Check if animation exists before trying to play it
            if (this.scene.anims.exists('explosion-anim')) {
                explosion.play('explosion-anim');
            } else {
                // Simple fallback explosion effect
                this.scene.tweens.add({
                    targets: explosion,
                    alpha: 0,
                    scale: 2,
                    duration: 600,
                    onComplete: () => {
                        explosion.destroy();
                    }
                });
            }

            // Sound is disabled
            // No explosion sound will be played
        } catch (error) {
            console.warn('Error creating explosion effect:', error);
        }

        // Chance to drop powerup
        this.dropPowerup();

        // Destroy enemy
        this.destroy();
    }

    dropPowerup() {
        // Chance to drop based on enemy type (increased for easier gameplay)
        let dropChance = 0;

        switch (this.enemyType) {
            case 'DESTROYER':
                dropChance = 0.8; // 80% chance (increased from 40%)
                break;
            case 'GUNSHIP':
                dropChance = 0.4; // 40% chance (increased from 20%)
                break;
            case 'DRONE':
                dropChance = 0.15; // 15% chance (increased from 5%)
                break;
            case 'INTERCEPTOR':
                dropChance = 0.3; // 30% chance
                break;
            case 'BOMBER':
                dropChance = 0.5; // 50% chance
                break;
            case 'STEALTH':
                dropChance = 0.4; // 40% chance
                break;
            case 'TURRET':
                dropChance = 0.6; // 60% chance
                break;
            case 'CARRIER':
                dropChance = 0.7; // 70% chance
                break;
        }

        // Elite enemies have doubled drop chance
        if (this.isElite) {
            dropChance *= 2;
        }

        // Roll for drop
        if (Math.random() < dropChance) {
            // If a powerup system exists in the scene, create one
            if (this.scene.createPowerup) {
                this.scene.createPowerup(this.x, this.y);
            }
        }
    }
}