/**
 * Player Ship Class
 * Handles the player-controlled ship behavior, input, combat and upgrades
 */
class PlayerShip extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set up physics body
        this.body.setCollideWorldBounds(true);
        this.setDepth(10);

        // Ship properties
        this.health = CONSTANTS.PLAYER.STARTING_HEALTH;
        this.maxHealth = CONSTANTS.PLAYER.STARTING_HEALTH;
        this.shields = CONSTANTS.PLAYER.STARTING_SHIELDS;
        this.maxShields = CONSTANTS.PLAYER.STARTING_SHIELDS;
        this.speed = CONSTANTS.PLAYER.MOVEMENT_SPEED;
        this.fireRate = CONSTANTS.PLAYER.FIRE_RATE;

        // Combat properties
        this.canFire = true;
        this.invincible = false;
        this.weaponType = 'BASIC_LASER';
        this.projectiles = scene.physics.add.group();

        // Synergy-related properties
        this.damageMultiplier = 1;
        this.energyConsumption = 1;
        this.cooldownReduction = 0;
        this.heatGeneration = 1;
        this.shieldRegenRate = 1;
        this.dashCooldown = CONSTANTS.PLAYER.DASH_COOLDOWN;
        this.criticalChance = 0;
        this.damageReduction = 0;
        this.detectionRange = 300;

        // Engine effects
        this.createEngineEffects();

        // Controller input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });

        // Dash ability
        this.canDash = true;
        this.isDashing = false;
        this.dashDirection = { x: 0, y: 0 };
    }

    createEngineEffects() {
        try {
            // Create a simple engine effect
            this.engines = this.scene.add.rectangle(this.x, this.y + 20, 10, 15, 0xff9900)
                .setOrigin(0.5);

            // Add a simple pulse effect
            this.scene.tweens.add({
                targets: this.engines,
                scaleY: 1.5,
                alpha: 0.7,
                duration: 200,
                yoyo: true,
                repeat: -1
            });

            // Add a particle effect for the engines
            if (this.scene.textures.exists('star-particle')) {
                this.engineParticles = this.scene.add.particles('star-particle');

                this.engineEmitter = this.engineParticles.createEmitter({
                    x: this.x,
                    y: this.y + 20,
                    speed: { min: 50, max: 100 },
                    angle: { min: 80, max: 100 },
                    scale: { start: 0.5, end: 0 },
                    lifespan: 300,
                    blendMode: 'ADD',
                    frequency: 50,
                    tint: 0xff9900
                });
            }
        } catch (error) {
            console.warn('Could not create engine effects:', error);

            // Create a very simple fallback if everything else fails
            this.engines = this.scene.add.rectangle(this.x, this.y + 20, 10, 15, 0xff9900)
                .setOrigin(0.5);
        }
    }

    update() {
        if (this.active) {
            // Handle movement input
            this.handleMovement();

            // Handle weapons input
            this.handleWeapons();

            // Update engine effects position
            if (this.engines && this.engines.active) {
                this.engines.setPosition(this.x, this.y + 20);
            }

            // Update engine particles position
            if (this.engineEmitter) {
                this.engineEmitter.setPosition(this.x, this.y + 20);
            }

            // Check if dash has finished
            if (this.isDashing) {
                this.updateDash();
            }

            // Shield recharge logic
            this.rechargeShields(0.02); // Slow passive shield recharge
        }
    }

    handleMovement() {
        // Reset velocity
        this.body.setVelocity(0);

        // Don't process movement during dash
        if (this.isDashing) {
            return;
        }

        // Movement speed (use dash speed if dashing)
        const speed = this.speed;

        // Process keyboard input for 8-directional movement
        const left = this.cursors.left.isDown || this.keys.a.isDown;
        const right = this.cursors.right.isDown || this.keys.d.isDown;
        const up = this.cursors.up.isDown || this.keys.w.isDown;
        const down = this.cursors.down.isDown || this.keys.s.isDown;

        // Diagonal movement - normalize for consistent speed
        if ((left || right) && (up || down)) {
            const factor = Math.SQRT1_2; // 1/sqrt(2) ~= 0.7071

            // Horizontal
            if (left) {
                this.body.velocity.x = -speed * factor;
            } else if (right) {
                this.body.velocity.x = speed * factor;
            }

            // Vertical
            if (up) {
                this.body.velocity.y = -speed * factor;
            } else if (down) {
                this.body.velocity.y = speed * factor;
            }
        } else {
            // Cardinal movement (full speed)
            if (left) {
                this.body.velocity.x = -speed;
            } else if (right) {
                this.body.velocity.x = speed;
            }

            if (up) {
                this.body.velocity.y = -speed;
            } else if (down) {
                this.body.velocity.y = speed;
            }
        }

        // Handle dash ability
        if (this.canDash && Phaser.Input.Keyboard.JustDown(this.keys.shift)) {
            this.initiateDash();
        }
    }

    initiateDash() {
        // Store the direction the player is moving for the dash
        this.dashDirection = {
            x: this.body.velocity.x !== 0 ? Math.sign(this.body.velocity.x) : 0,
            y: this.body.velocity.y !== 0 ? Math.sign(this.body.velocity.y) : -1 // Default to up if not moving
        };

        // Start dash
        this.isDashing = true;
        this.canDash = false;

        // Set dash velocity
        this.body.setVelocity(
            this.dashDirection.x * CONSTANTS.PLAYER.DASH_SPEED,
            this.dashDirection.y * CONSTANTS.PLAYER.DASH_SPEED
        );

        // Temporary invincibility during dash
        this.setInvincible(true);

        // Set a timer to end the dash
        this.scene.time.delayedCall(CONSTANTS.PLAYER.DASH_DURATION, () => {
            this.isDashing = false;
            this.setInvincible(false);
        });

        // Set cooldown for the dash ability (affected by synergies)
        this.scene.time.delayedCall(this.dashCooldown, () => {
            this.canDash = true;
        });
    }

    updateDash() {
        // Maintain dash velocity
        this.body.setVelocity(
            this.dashDirection.x * CONSTANTS.PLAYER.DASH_SPEED,
            this.dashDirection.y * CONSTANTS.PLAYER.DASH_SPEED
        );

        // Add dash visual effect (could be particle trail)
    }

    handleWeapons() {
        // Fire weapons with spacebar
        if ((this.cursors.space.isDown || this.keys.space.isDown) && this.canFire) {
            this.fireWeapon();

            // Set fire rate cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate, () => {
                this.canFire = true;
            });
        }
    }

    fireWeapon() {
        // Get weapon settings from constants
        const weaponSettings = CONSTANTS.WEAPONS[this.weaponType];

        // Create projectile based on weapon type
        switch (this.weaponType) {
            case 'SPREAD_SHOT':
                this.fireSpreadShot(weaponSettings);
                break;

            case 'PLASMA_BOLT':
                this.firePlasmaBolt(weaponSettings);
                break;

            case 'HOMING_MISSILE':
                this.fireHomingMissile(weaponSettings);
                break;

            case 'BASIC_LASER':
            default:
                this.fireBasicLaser(weaponSettings);
                break;
        }

        // Sound is disabled
        // No weapon sound will be played
    }

    fireBasicLaser(settings) {
        // Create laser projectile
        const laser = this.projectiles.create(this.x, this.y - 20, 'laser-blue');

        // Set up physics body
        laser.setVelocity(0, -settings.SPEED);
        laser.setActive(true);
        laser.setVisible(true);

        // Store damage value for collision handling
        laser.damage = settings.DAMAGE * this.damageMultiplier;

        // Auto-destroy when out of bounds
        this.scene.time.delayedCall(settings.LIFESPAN, () => {
            if (laser.active) {
                laser.destroy();
            }
        });
    }

    fireSpreadShot(settings) {
        // Create multiple projectiles in a spread pattern
        const angles = [-settings.SPREAD_ANGLE, 0, settings.SPREAD_ANGLE];

        for (const angle of angles) {
            const projectile = this.projectiles.create(this.x, this.y - 20, 'laser-blue');

            // Calculate velocity based on angle
            const radians = Phaser.Math.DegToRad(angle - 90); // -90 to make 0 degrees point up
            const velocityX = Math.cos(radians) * settings.SPEED;
            const velocityY = Math.sin(radians) * settings.SPEED;

            // Set up physics body
            projectile.setVelocity(velocityX, velocityY);
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.damage = settings.DAMAGE * this.damageMultiplier;

            // Auto-destroy when out of bounds
            this.scene.time.delayedCall(settings.LIFESPAN, () => {
                if (projectile.active) {
                    projectile.destroy();
                }
            });
        }
    }

    firePlasmaBolt(settings) {
        // Create plasma bolt projectile (larger, more powerful)
        const plasma = this.projectiles.create(this.x, this.y - 20, 'plasma-bolt');

        // Set up physics body
        plasma.setVelocity(0, -settings.SPEED);
        plasma.setActive(true);
        plasma.setVisible(true);
        plasma.setScale(1.5);

        // Store damage value for collision handling
        plasma.damage = settings.DAMAGE * this.damageMultiplier;

        // Auto-destroy when out of bounds
        this.scene.time.delayedCall(settings.LIFESPAN, () => {
            if (plasma.active) {
                plasma.destroy();
            }
        });
    }

    fireHomingMissile(settings) {
        // Create missile projectile
        const missile = this.projectiles.create(this.x, this.y - 20, 'missile');

        // Set up physics body
        missile.setVelocity(0, -settings.SPEED);
        missile.setActive(true);
        missile.setVisible(true);

        // Store damage and homing properties
        missile.damage = settings.DAMAGE * this.damageMultiplier;
        missile.tracking = true;
        missile.trackingSpeed = settings.TRACKING_SPEED;

        // Store reference to track the missile in the scene update
        missile.update = (target) => {
            if (!target || !target.active) return;

            // Calculate angle to target
            const dx = target.x - missile.x;
            const dy = target.y - missile.y;
            const angle = Math.atan2(dy, dx);

            // Gradually adjust velocity toward target
            missile.body.velocity.x += Math.cos(angle) * missile.trackingSpeed * settings.SPEED;
            missile.body.velocity.y += Math.sin(angle) * missile.trackingSpeed * settings.SPEED;

            // Normalize velocity to maintain speed
            const currentSpeed = Math.sqrt(
                missile.body.velocity.x * missile.body.velocity.x +
                missile.body.velocity.y * missile.body.velocity.y
            );

            missile.body.velocity.x = (missile.body.velocity.x / currentSpeed) * settings.SPEED;
            missile.body.velocity.y = (missile.body.velocity.y / currentSpeed) * settings.SPEED;

            // Rotate missile to face direction of travel
            missile.rotation = angle + Math.PI / 2;
        };

        // Auto-destroy when out of bounds
        this.scene.time.delayedCall(settings.LIFESPAN, () => {
            if (missile.active) {
                missile.destroy();
            }
        });
    }

    takeDamage(amount) {
        // Ignore damage if invincible
        if (this.invincible || this.scene.game.global.debug.invincible) {
            return false;
        }

        // Apply damage reduction from synergies
        if (this.damageReduction > 0) {
            amount = Math.max(1, Math.floor(amount * (1 - this.damageReduction)));
        }

        // Apply damage to shields first
        if (this.shields > 0) {
            if (this.shields >= amount) {
                this.shields -= amount;
                amount = 0;
            } else {
                amount -= this.shields;
                this.shields = 0;
            }
        }

        // Apply remaining damage to health
        if (amount > 0) {
            this.health -= amount;

            // Check for death
            if (this.health <= 0) {
                this.health = 0;
                this.die();
                return true;
            }

            // Hit effect
            this.playHitAnimation();

            // Temporary invincibility after hit
            this.setInvincible(true);
            this.scene.time.delayedCall(CONSTANTS.PLAYER.INVINCIBILITY_DURATION, () => {
                this.setInvincible(false);
            });
        }

        // Sound is disabled
        // No hit sound will be played

        return true;
    }

    playHitAnimation() {
        // Flash the ship to indicate damage
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }

    setInvincible(isInvincible) {
        this.invincible = isInvincible;

        // Visual indicator of invincibility
        if (isInvincible) {
            this.alpha = 0.7;
        } else {
            this.alpha = 1.0;
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        // Sound is disabled
    }

    rechargeShields(amount) {
        // Apply shield regen rate from synergies
        const adjustedAmount = amount * this.shieldRegenRate;
        this.shields = Math.min(this.shields + adjustedAmount, this.maxShields);
        // Sound is disabled
    }

    die() {
        // Play death animation
        this.setActive(false);
        this.setVisible(false);

        try {
            // Create explosion
            const explosion = this.scene.add.sprite(this.x, this.y, 'explosion');

            // Check if the animation exists before playing it
            if (this.scene.anims.exists('explosion-anim')) {
                explosion.play('explosion-anim');
            } else {
                // Create a simple explosion effect as fallback
                this.scene.tweens.add({
                    targets: explosion,
                    alpha: 0,
                    scale: 3,
                    duration: 800,
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

        // Clean up
        if (this.engines) {
            this.engines.setVisible(false);
        }

        // Signal to game scene that player has died
        this.scene.time.delayedCall(2000, () => {
            this.scene.events.emit('playerDeath');
        });
    }

    applyUpgrade(upgrade) {
        // Apply upgrade effects to ship stats and weapons
        switch (upgrade.type) {
            case 'weapon':
                this.weaponType = upgrade.value;
                break;
            case 'health':
                this.maxHealth += upgrade.value;
                this.health += upgrade.value;
                break;
            case 'shield':
                this.maxShields += upgrade.value;
                this.shields += upgrade.value;
                break;
            case 'speed':
                this.speed += upgrade.value;
                break;
            case 'fireRate':
                this.fireRate = Math.max(this.fireRate - upgrade.value, 50); // Minimum fire rate
                break;
            // Add more upgrade types as needed
        }

        // Sound is disabled
        // No powerup sound will be played
    }

    applyPenalty(penalty) {
        // Apply penalty effects to ship stats and systems
        switch (penalty.type) {
            case 'health':
                this.maxHealth = Math.max(this.maxHealth - penalty.value, 10); // Minimum health
                this.health = Math.min(this.health, this.maxHealth);
                break;
            case 'shield':
                this.maxShields = Math.max(this.maxShields - penalty.value, 0);
                this.shields = Math.min(this.shields, this.maxShields);
                break;
            case 'speed':
                this.speed = Math.max(this.speed - penalty.value, 100); // Minimum speed
                break;
            case 'fireRate':
                this.fireRate += penalty.value;
                break;
            // Add more penalty types as needed
        }
    }
}