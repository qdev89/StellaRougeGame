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

        // Apply visual enhancements
        this.enhanceVisuals();

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

        // Ammo system
        this.ammo = {
            BASIC_LASER: 100,
            SPREAD_SHOT: 60,
            PLASMA_BOLT: 40,
            HOMING_MISSILE: 20,
            DUAL_CANNON: 80,
            LASER_BEAM: 50,
            SCATTER_BOMB: 30
        };

        // Maximum ammo capacity
        this.maxAmmo = {
            BASIC_LASER: 100,
            SPREAD_SHOT: 60,
            PLASMA_BOLT: 40,
            HOMING_MISSILE: 20,
            DUAL_CANNON: 80,
            LASER_BEAM: 50,
            SCATTER_BOMB: 30
        };

        // Ammo regeneration rates (ammo per second)
        this.ammoRegenRate = {
            BASIC_LASER: 0.5,
            SPREAD_SHOT: 0.3,
            PLASMA_BOLT: 0.2,
            HOMING_MISSILE: 0.1,
            DUAL_CANNON: 0.4,
            LASER_BEAM: 0.25,
            SCATTER_BOMB: 0.15
        };

        // Weapon unlocks (which weapons the player has access to)
        this.unlockedWeapons = ['BASIC_LASER'];

        // Ammo consumption per shot
        this.ammoConsumption = {
            BASIC_LASER: 1,
            SPREAD_SHOT: 3,
            PLASMA_BOLT: 5,
            HOMING_MISSILE: 8,
            DUAL_CANNON: 2,
            LASER_BEAM: 10, // Per second of continuous fire
            SCATTER_BOMB: 10
        };

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
            // Create a container for all engine effects
            this.engineContainer = this.scene.add.container(this.x, this.y);

            // Create a glowing engine core
            this.engineCore = this.scene.add.rectangle(0, 20, 8, 12, 0xffdd00)
                .setOrigin(0.5);
            this.engineContainer.add(this.engineCore);

            // Add a pulsing effect to the core
            this.scene.tweens.add({
                targets: this.engineCore,
                scaleY: 1.5,
                scaleX: 1.2,
                alpha: { from: 1, to: 0.7 },
                duration: 150,
                yoyo: true,
                repeat: -1
            });

            // Create an outer glow for the engine
            this.engineGlow = this.scene.add.rectangle(0, 20, 12, 18, 0xff6600, 0.6)
                .setOrigin(0.5);
            this.engineContainer.add(this.engineGlow);

            // Add a different pulse to the glow
            this.scene.tweens.add({
                targets: this.engineGlow,
                scaleY: 1.8,
                scaleX: 1.4,
                alpha: { from: 0.6, to: 0.3 },
                duration: 200,
                yoyo: true,
                repeat: -1
            });

            // Add main engine particle effect
            if (this.scene.textures.exists('star-particle')) {
                this.engineParticles = this.scene.add.particles('star-particle');

                // Main thruster
                this.engineEmitter = this.engineParticles.createEmitter({
                    x: this.x,
                    y: this.y + 20,
                    speed: { min: 60, max: 120 },
                    angle: { min: 85, max: 95 },
                    scale: { start: 0.6, end: 0 },
                    lifespan: { min: 200, max: 400 },
                    blendMode: 'ADD',
                    frequency: 30,
                    tint: [ 0xffdd00, 0xff9900, 0xff6600 ]
                });

                // Side thrusters (for turning effect)
                this.leftThruster = this.engineParticles.createEmitter({
                    x: this.x - 10,
                    y: this.y + 15,
                    speed: { min: 30, max: 60 },
                    angle: { min: 60, max: 80 },
                    scale: { start: 0.3, end: 0 },
                    lifespan: { min: 100, max: 200 },
                    blendMode: 'ADD',
                    frequency: 60,  // Less frequent
                    tint: [ 0xffdd00, 0xff9900 ],
                    on: false  // Start disabled
                });

                this.rightThruster = this.engineParticles.createEmitter({
                    x: this.x + 10,
                    y: this.y + 15,
                    speed: { min: 30, max: 60 },
                    angle: { min: 100, max: 120 },
                    scale: { start: 0.3, end: 0 },
                    lifespan: { min: 100, max: 200 },
                    blendMode: 'ADD',
                    frequency: 60,  // Less frequent
                    tint: [ 0xffdd00, 0xff9900 ],
                    on: false  // Start disabled
                });

                // Boost particles (for dash effect)
                this.boostEmitter = this.engineParticles.createEmitter({
                    x: this.x,
                    y: this.y + 20,
                    speed: { min: 100, max: 200 },
                    angle: { min: 80, max: 100 },
                    scale: { start: 0.8, end: 0 },
                    lifespan: { min: 300, max: 500 },
                    blendMode: 'ADD',
                    frequency: 10,
                    tint: [ 0x33aaff, 0x3366ff ],
                    on: false  // Start disabled
                });
            }

            // Create a shield effect
            this.shieldEffect = this.scene.add.circle(0, 0, 30, 0x3399ff, 0)
                .setOrigin(0.5);
            this.engineContainer.add(this.shieldEffect);

            // Create a hit effect (initially invisible)
            this.hitEffect = this.scene.add.circle(0, 0, 25, 0xff3333, 0)
                .setOrigin(0.5);
            this.engineContainer.add(this.hitEffect);

        } catch (error) {
            console.warn('Could not create engine effects:', error);

            // Create a very simple fallback if everything else fails
            this.engines = this.scene.add.rectangle(this.x, this.y + 20, 10, 15, 0xff9900)
                .setOrigin(0.5);
        }
    }

    update(time, delta) {
        if (this.active) {
            // Handle movement input
            this.handleMovement();

            // Handle weapons input
            this.handleWeapons();

            // Update engine effects position
            this.updateEngineEffects();

            // Update visuals container position
            if (this.visualsContainer) {
                this.visualsContainer.setPosition(this.x, this.y);
            }

            // Check if dash has finished
            if (this.isDashing) {
                this.updateDash();
            }

            // Shield recharge logic
            this.rechargeShields(0.02); // Slow passive shield recharge

            // Update shield visual effect
            this.updateShieldEffect();

            // Ammo regeneration logic
            this.regenerateAmmo(delta);
        }
    }

    updateEngineEffects() {
        // Update engine container position
        if (this.engineContainer) {
            this.engineContainer.setPosition(this.x, this.y);
        }

        // Update fallback engine position if using fallback
        if (this.engines && this.engines.active) {
            this.engines.setPosition(this.x, this.y + 20);
        }

        // Update all particle emitters
        if (this.engineEmitter) {
            this.engineEmitter.setPosition(this.x, this.y + 20);
        }

        if (this.leftThruster) {
            this.leftThruster.setPosition(this.x - 10, this.y + 15);
        }

        if (this.rightThruster) {
            this.rightThruster.setPosition(this.x + 10, this.y + 15);
        }

        if (this.boostEmitter) {
            this.boostEmitter.setPosition(this.x, this.y + 20);
        }

        // Update side thrusters based on movement direction
        if (this.leftThruster && this.rightThruster) {
            // Get current movement direction
            const movingLeft = this.body.velocity.x < -10;
            const movingRight = this.body.velocity.x > 10;

            // Enable/disable thrusters based on movement
            this.leftThruster.on = movingRight;  // Left thruster fires when moving right
            this.rightThruster.on = movingLeft;  // Right thruster fires when moving left
        }

        // Update boost emitter based on dash state
        if (this.boostEmitter) {
            this.boostEmitter.on = this.isDashing;
        }
    }

    updateShieldEffect() {
        if (this.shieldEffect) {
            // Calculate shield percentage
            const shieldPercent = this.shields / this.maxShields;

            // Only show shield effect if shields are active
            if (shieldPercent > 0) {
                // Set shield opacity based on shield percentage
                const opacity = 0.1 + (shieldPercent * 0.2);  // 0.1 to 0.3 range
                this.shieldEffect.setAlpha(opacity);

                // Pulse the shield when it's low
                if (shieldPercent < 0.3 && !this.shieldPulse) {
                    this.shieldPulse = this.scene.tweens.add({
                        targets: this.shieldEffect,
                        alpha: { from: opacity, to: opacity * 2 },
                        duration: 300,
                        yoyo: true,
                        repeat: -1
                    });
                } else if (shieldPercent >= 0.3 && this.shieldPulse) {
                    // Stop pulsing if shields recover
                    this.shieldPulse.stop();
                    this.shieldPulse = null;
                }
            } else {
                // No shields, hide effect
                this.shieldEffect.setAlpha(0);

                // Stop any active pulse
                if (this.shieldPulse) {
                    this.shieldPulse.stop();
                    this.shieldPulse = null;
                }
            }
        }
    }

    regenerateAmmo(delta) {
        // Convert delta (ms) to seconds for regeneration calculation
        const deltaSeconds = delta / 1000;

        // Regenerate ammo for all weapon types
        Object.keys(this.ammo).forEach(weaponType => {
            // Only regenerate if below max capacity
            if (this.ammo[weaponType] < this.maxAmmo[weaponType]) {
                // Calculate regeneration amount based on rate and time
                const regenAmount = this.ammoRegenRate[weaponType] * deltaSeconds;

                // Add regenerated ammo (capped at max capacity)
                this.ammo[weaponType] = Math.min(
                    this.ammo[weaponType] + regenAmount,
                    this.maxAmmo[weaponType]
                );
            }
        });
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
            // Check if we have enough ammo (basic laser is always available)
            const ammoRequired = this.weaponType === 'BASIC_LASER' ? 0 : (this.ammoConsumption[this.weaponType] || 1);

            if (this.weaponType === 'BASIC_LASER' || this.ammo[this.weaponType] >= ammoRequired) {
                // Consume ammo and fire (but not for basic laser)
                if (this.weaponType !== 'BASIC_LASER') {
                    this.ammo[this.weaponType] -= ammoRequired;
                }
                this.fireWeapon();

                // Update UI if available
                if (this.scene.updateAmmoUI) {
                    this.scene.updateAmmoUI();
                }

                // Set fire rate cooldown
                this.canFire = false;
                this.scene.time.delayedCall(this.fireRate, () => {
                    this.canFire = true;
                });
            } else {
                // Not enough ammo - play feedback
                this.playNoAmmoFeedback();

                // Set a shorter cooldown for the no-ammo click
                this.canFire = false;
                this.scene.time.delayedCall(200, () => {
                    this.canFire = true;
                });
            }
        }

        // Weapon switching with number keys (1-7)
        this.handleWeaponSwitching();
    }

    handleWeaponSwitching() {
        // Check for number key presses to switch weapons
        // Only process if we have the necessary input setup
        if (!this.scene.input || !this.scene.input.keyboard) return;

        // Define weapon key mappings if not already defined
        if (!this.weaponKeys) {
            this.weaponKeys = {
                '1': { key: this.scene.input.keyboard.addKey('ONE'), weapon: 'BASIC_LASER' },
                '2': { key: this.scene.input.keyboard.addKey('TWO'), weapon: 'SPREAD_SHOT' },
                '3': { key: this.scene.input.keyboard.addKey('THREE'), weapon: 'PLASMA_BOLT' },
                '4': { key: this.scene.input.keyboard.addKey('FOUR'), weapon: 'HOMING_MISSILE' },
                '5': { key: this.scene.input.keyboard.addKey('FIVE'), weapon: 'DUAL_CANNON' },
                '6': { key: this.scene.input.keyboard.addKey('SIX'), weapon: 'LASER_BEAM' },
                '7': { key: this.scene.input.keyboard.addKey('SEVEN'), weapon: 'SCATTER_BOMB' }
            };
        }

        // Check each key and switch weapon if pressed
        Object.values(this.weaponKeys).forEach(keyInfo => {
            if (Phaser.Input.Keyboard.JustDown(keyInfo.key)) {
                // Try to switch to this weapon
                if (this.unlockedWeapons.includes(keyInfo.weapon)) {
                    // Switch weapon
                    if (this.weaponType !== keyInfo.weapon) {
                        this.weaponType = keyInfo.weapon;

                        // Update UI
                        if (this.scene.updateAmmoUI) {
                            this.scene.updateAmmoUI();
                        }

                        // Show weapon switch feedback
                        this.showWeaponSwitchFeedback(keyInfo.weapon);
                    }
                } else {
                    // Weapon not unlocked - show feedback
                    this.showWeaponLockedFeedback();
                }
            }
        });
    }

    showWeaponSwitchFeedback(weaponType) {
        // Visual feedback for weapon switch
        const settings = CONSTANTS.WEAPONS[weaponType];
        const color = settings?.COLOR || 0xffffff;

        // Create a flash effect around the ship
        try {
            const flash = this.scene.add.circle(this.x, this.y, 30, color, 0.5);
            this.scene.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 2,
                duration: 300,
                onComplete: () => {
                    flash.destroy();
                }
            });

            // Create a text popup with weapon name
            const weaponName = this.scene.getWeaponDisplayName(weaponType);
            const text = this.scene.add.text(this.x, this.y - 50, weaponName, {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);

            // Animate the text
            this.scene.tweens.add({
                targets: text,
                y: this.y - 80,
                alpha: 0,
                duration: 800,
                onComplete: () => {
                    text.destroy();
                }
            });
        } catch (error) {
            console.warn('Could not create weapon switch feedback:', error);
        }
    }

    showWeaponLockedFeedback() {
        // Visual feedback for locked weapon
        try {
            // Create a text popup
            const text = this.scene.add.text(this.x, this.y - 50, 'WEAPON LOCKED', {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ff3333',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);

            // Animate the text
            this.scene.tweens.add({
                targets: text,
                y: this.y - 80,
                alpha: 0,
                duration: 800,
                onComplete: () => {
                    text.destroy();
                }
            });
        } catch (error) {
            console.warn('Could not create weapon locked feedback:', error);
        }
    }

    playNoAmmoFeedback() {
        // Visual feedback for no ammo
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 50,
            yoyo: true,
            repeat: 1
        });

        // Sound is disabled, but we'd play a click sound here
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

            case 'DUAL_CANNON':
                this.fireDualCannon(weaponSettings);
                break;

            case 'LASER_BEAM':
                this.fireLaserBeam(weaponSettings);
                break;

            case 'SCATTER_BOMB':
                this.fireScatterBomb(weaponSettings);
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

        // Set tint based on weapon color
        if (settings.COLOR) {
            laser.setTint(settings.COLOR);
        }

        // Add a glow effect
        laser.setAlpha(0.9);
        this.scene.tweens.add({
            targets: laser,
            alpha: 1,
            duration: 50,
            yoyo: true,
            repeat: 1
        });

        // Store damage value for collision handling
        laser.damage = settings.DAMAGE * this.damageMultiplier;

        // Add muzzle flash effect
        this.createMuzzleFlash(settings.COLOR || 0x33aaff);

        // Auto-destroy when out of bounds
        this.scene.time.delayedCall(settings.LIFESPAN, () => {
            if (laser.active) {
                laser.destroy();
            }
        });
    }

    // Create a muzzle flash effect when firing
    createMuzzleFlash(color) {
        try {
            // Create a flash effect at the muzzle
            const flash = this.scene.add.circle(this.x, this.y - 20, 5, color, 0.8);

            // Animate the flash
            this.scene.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 2,
                duration: 100,
                onComplete: () => {
                    flash.destroy();
                }
            });
        } catch (error) {
            console.warn('Could not create muzzle flash:', error);
        }
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

        // Set tint based on weapon color
        if (settings.COLOR) {
            missile.setTint(settings.COLOR);
        }

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

            // Add particle trail effect
            if (this.scene.add && this.scene.add.particles) {
                try {
                    const particles = this.scene.add.particles('star-particle');
                    const emitter = particles.createEmitter({
                        x: missile.x,
                        y: missile.y,
                        speed: { min: 10, max: 30 },
                        scale: { start: 0.5, end: 0 },
                        lifespan: 300,
                        blendMode: 'ADD',
                        quantity: 1
                    });

                    // Set particle color
                    if (settings.COLOR) {
                        emitter.setTint(settings.COLOR);
                    }

                    // Auto-destroy after particles are done
                    this.scene.time.delayedCall(300, () => {
                        particles.destroy();
                    });
                } catch (error) {
                    // Silently fail if particles can't be created
                }
            }
        };

        // Auto-destroy when out of bounds
        this.scene.time.delayedCall(settings.LIFESPAN, () => {
            if (missile.active) {
                missile.destroy();
            }
        });
    }

    fireDualCannon(settings) {
        // Create two parallel laser projectiles
        const spacing = settings.SPACING || 20;
        const leftLaser = this.projectiles.create(this.x - spacing/2, this.y - 20, 'laser-blue');
        const rightLaser = this.projectiles.create(this.x + spacing/2, this.y - 20, 'laser-blue');

        // Set tint based on weapon color
        if (settings.COLOR) {
            leftLaser.setTint(settings.COLOR);
            rightLaser.setTint(settings.COLOR);
        }

        // Set up physics bodies
        leftLaser.setVelocity(0, -settings.SPEED);
        leftLaser.setActive(true);
        leftLaser.setVisible(true);
        leftLaser.damage = settings.DAMAGE * this.damageMultiplier;

        rightLaser.setVelocity(0, -settings.SPEED);
        rightLaser.setActive(true);
        rightLaser.setVisible(true);
        rightLaser.damage = settings.DAMAGE * this.damageMultiplier;

        // Auto-destroy when out of bounds
        this.scene.time.delayedCall(settings.LIFESPAN, () => {
            if (leftLaser.active) leftLaser.destroy();
            if (rightLaser.active) rightLaser.destroy();
        });
    }

    fireLaserBeam(settings) {
        // Create a continuous laser beam
        const beamLength = settings.RANGE || 400;
        const beamWidth = settings.WIDTH || 8;

        // Create a graphics object for the beam
        const beam = this.scene.add.graphics();

        // Set beam color
        const beamColor = settings.COLOR || 0xff0000;
        beam.lineStyle(beamWidth, beamColor, 0.8);

        // Draw the beam line
        beam.beginPath();
        beam.moveTo(this.x, this.y - 20);
        beam.lineTo(this.x, this.y - 20 - beamLength);
        beam.strokePath();

        // Add glow effect
        const glowBeam = this.scene.add.graphics();
        glowBeam.lineStyle(beamWidth + 4, beamColor, 0.3);
        glowBeam.beginPath();
        glowBeam.moveTo(this.x, this.y - 20);
        glowBeam.lineTo(this.x, this.y - 20 - beamLength);
        glowBeam.strokePath();

        // Create a collision area for the beam
        const beamHitbox = this.projectiles.create(this.x, this.y - beamLength/2 - 10, 'laser-blue');
        beamHitbox.setVisible(false); // Invisible hitbox
        beamHitbox.setScale(0.5, beamLength / 20); // Adjust scale to match beam length
        beamHitbox.damage = settings.DAMAGE * this.damageMultiplier;
        beamHitbox.isPenetrating = true; // Beam can hit multiple enemies

        // Pulse animation for the beam
        this.scene.tweens.add({
            targets: [beam, glowBeam],
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                beam.destroy();
                glowBeam.destroy();
                beamHitbox.destroy();
            }
        });
    }

    fireScatterBomb(settings) {
        // Create the main bomb projectile
        const bomb = this.projectiles.create(this.x, this.y - 20, 'plasma-bolt');

        // Set tint based on weapon color
        if (settings.COLOR) {
            bomb.setTint(settings.COLOR);
        }

        // Make it larger to look like a bomb
        bomb.setScale(2);

        // Set up physics body
        bomb.setVelocity(0, -settings.SPEED);
        bomb.setActive(true);
        bomb.setVisible(true);

        // Store damage value for collision handling
        bomb.damage = settings.DAMAGE * this.damageMultiplier;

        // Store reference to the player and settings for explosion
        bomb.playerRef = this;
        bomb.settings = settings;

        // Set a flag to identify it as a scatter bomb
        bomb.isScatterBomb = true;

        // Add custom collision handler to create explosion
        bomb.explode = () => {
            // Create explosion effect
            try {
                const explosion = this.scene.add.particles('star-particle');
                const emitter = explosion.createEmitter({
                    x: bomb.x,
                    y: bomb.y,
                    speed: { min: 50, max: 200 },
                    scale: { start: 1, end: 0 },
                    lifespan: 800,
                    blendMode: 'ADD',
                    quantity: 20
                });

                // Set explosion color
                if (settings.COLOR) {
                    emitter.setTint(settings.COLOR);
                }

                // Auto-destroy after explosion
                this.scene.time.delayedCall(800, () => {
                    explosion.destroy();
                });
            } catch (error) {
                console.warn('Could not create explosion effect:', error);
            }

            // Create fragments
            const fragmentCount = settings.FRAGMENT_COUNT || 8;
            const angleStep = (Math.PI * 2) / fragmentCount;

            for (let i = 0; i < fragmentCount; i++) {
                const angle = angleStep * i;
                const fragment = this.projectiles.create(bomb.x, bomb.y, 'laser-blue');

                // Set tint based on weapon color
                if (settings.COLOR) {
                    fragment.setTint(settings.COLOR);
                }

                // Calculate velocity based on angle
                const velocityX = Math.cos(angle) * settings.FRAGMENT_SPEED;
                const velocityY = Math.sin(angle) * settings.FRAGMENT_SPEED;

                // Set up physics body
                fragment.setVelocity(velocityX, velocityY);
                fragment.setActive(true);
                fragment.setVisible(true);
                fragment.damage = settings.FRAGMENT_DAMAGE * this.damageMultiplier;

                // Auto-destroy fragments after their lifespan
                this.scene.time.delayedCall(settings.FRAGMENT_LIFESPAN, () => {
                    if (fragment.active) {
                        fragment.destroy();
                    }
                });
            }

            // Destroy the original bomb
            bomb.destroy();
        };

        // Set up auto-explosion after lifespan
        this.scene.time.delayedCall(settings.LIFESPAN, () => {
            if (bomb.active) {
                bomb.explode();
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

        // Show hit effect
        if (this.hitEffect) {
            // Flash the hit effect
            this.hitEffect.setAlpha(0.7);
            this.scene.tweens.add({
                targets: this.hitEffect,
                alpha: 0,
                duration: 300,
                ease: 'Cubic.easeOut'
            });
        }

        // Create damage particles
        try {
            const particles = this.scene.add.particles('star-particle');
            const emitter = particles.createEmitter({
                x: this.x,
                y: this.y,
                speed: { min: 50, max: 150 },
                scale: { start: 0.4, end: 0 },
                lifespan: { min: 300, max: 500 },
                blendMode: 'ADD',
                tint: 0xff3333,
                quantity: 10
            });

            // Auto-destroy after particles are done
            this.scene.time.delayedCall(500, () => {
                particles.destroy();
            });
        } catch (error) {
            console.warn('Could not create damage particles:', error);
        }
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
            // Hide all engine effects
            if (this.engineContainer) {
                this.engineContainer.setVisible(false);
            }

            if (this.engines) {
                this.engines.setVisible(false);
            }

            // Stop all particle emitters
            if (this.engineEmitter) this.engineEmitter.on = false;
            if (this.leftThruster) this.leftThruster.on = false;
            if (this.rightThruster) this.rightThruster.on = false;
            if (this.boostEmitter) this.boostEmitter.on = false;

            // Create main explosion
            const explosion = this.scene.add.sprite(this.x, this.y, 'explosion');

            // Check if the animation exists before playing it
            if (this.scene.anims.exists('explosion-anim')) {
                explosion.play('explosion-anim');
            } else {
                // Create an enhanced explosion effect as fallback
                // First, create a flash
                const flash = this.scene.add.circle(this.x, this.y, 50, 0xffffff, 1);
                this.scene.tweens.add({
                    targets: flash,
                    alpha: 0,
                    scale: 2,
                    duration: 300,
                    onComplete: () => {
                        flash.destroy();
                    }
                });

                // Then create the explosion
                explosion.setTint(0xff5500);
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

            // Create multiple particle explosions
            if (this.scene.add.particles) {
                // Create debris particles
                const debrisParticles = this.scene.add.particles('star-particle');
                debrisParticles.createEmitter({
                    x: this.x,
                    y: this.y,
                    speed: { min: 100, max: 300 },
                    scale: { start: 0.6, end: 0 },
                    lifespan: { min: 800, max: 1500 },
                    blendMode: 'ADD',
                    tint: [ 0xff5500, 0xff9900, 0xffdd00 ],
                    quantity: 40,
                    angle: { min: 0, max: 360 }
                });

                // Create shock wave
                const shockWave = this.scene.add.circle(this.x, this.y, 10, 0xffffff, 0.7);
                this.scene.tweens.add({
                    targets: shockWave,
                    radius: 100,
                    alpha: 0,
                    duration: 500,
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                        shockWave.destroy();
                    }
                });

                // Create secondary explosions with delay
                for (let i = 0; i < 3; i++) {
                    this.scene.time.delayedCall(Phaser.Math.Between(100, 500), () => {
                        // Random position near the ship
                        const offsetX = Phaser.Math.Between(-30, 30);
                        const offsetY = Phaser.Math.Between(-30, 30);

                        // Create small explosion
                        const secondaryExplosion = this.scene.add.circle(
                            this.x + offsetX,
                            this.y + offsetY,
                            Phaser.Math.Between(10, 20),
                            0xff3300,
                            0.8
                        );

                        this.scene.tweens.add({
                            targets: secondaryExplosion,
                            alpha: 0,
                            scale: 2,
                            duration: 300,
                            onComplete: () => {
                                secondaryExplosion.destroy();
                            }
                        });
                    });
                }

                // Auto-destroy particles after they're done
                this.scene.time.delayedCall(1500, () => {
                    debrisParticles.destroy();
                });
            }

            // Sound is disabled
            // No explosion sound will be played
        } catch (error) {
            console.warn('Error creating explosion effect:', error);

            // Very simple fallback
            const simpleExplosion = this.scene.add.circle(this.x, this.y, 30, 0xff0000, 0.8);
            this.scene.tweens.add({
                targets: simpleExplosion,
                alpha: 0,
                scale: 2,
                duration: 500,
                onComplete: () => {
                    simpleExplosion.destroy();
                }
            });
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
                // Add to unlocked weapons if not already unlocked
                if (!this.unlockedWeapons.includes(upgrade.value)) {
                    this.unlockedWeapons.push(upgrade.value);
                }
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
            case 'ammo':
                // Add ammo for a specific weapon type or all weapons
                if (upgrade.weaponType) {
                    this.addAmmo(upgrade.weaponType, upgrade.value);
                } else {
                    // Add to all weapons
                    Object.keys(this.ammo).forEach(weaponType => {
                        this.addAmmo(weaponType, upgrade.value);
                    });
                }
                break;
            case 'maxAmmo':
                // Increase max ammo capacity
                if (upgrade.weaponType) {
                    this.maxAmmo[upgrade.weaponType] += upgrade.value;
                    // Fill up to new max
                    this.ammo[upgrade.weaponType] = this.maxAmmo[upgrade.weaponType];
                } else {
                    // Increase for all weapons
                    Object.keys(this.maxAmmo).forEach(weaponType => {
                        this.maxAmmo[weaponType] += upgrade.value;
                        this.ammo[weaponType] = this.maxAmmo[weaponType];
                    });
                }
                break;
            // Add more upgrade types as needed
        }

        // Sound is disabled
        // No powerup sound will be played
    }

    addAmmo(weaponType, amount) {
        // Add ammo to a specific weapon type
        if (this.ammo[weaponType] !== undefined) {
            this.ammo[weaponType] = Math.min(
                this.ammo[weaponType] + amount,
                this.maxAmmo[weaponType]
            );

            // Update UI if available
            if (this.scene.updateAmmoUI) {
                this.scene.updateAmmoUI();
            }

            return true;
        }
        return false;
    }

    switchWeapon(weaponType) {
        // Switch to a different weapon if it's unlocked
        if (this.unlockedWeapons.includes(weaponType)) {
            this.weaponType = weaponType;

            // Update UI if available
            if (this.scene.updateAmmoUI) {
                this.scene.updateAmmoUI();
            }

            return true;
        }
        return false;
    }

    getCurrentAmmo() {
        // Get current ammo for the active weapon
        // Special case for BASIC_LASER which has infinite ammo
        if (this.weaponType === 'BASIC_LASER') {
            return {
                current: '∞', // Infinity symbol
                max: '∞',
                percentage: 1.0 // Always full
            };
        }

        return {
            current: Math.floor(this.ammo[this.weaponType] || 0),
            max: this.maxAmmo[this.weaponType] || 0,
            percentage: this.maxAmmo[this.weaponType] ?
                this.ammo[this.weaponType] / this.maxAmmo[this.weaponType] : 0
        };
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

    // Enhance the visual appearance of the ship
    enhanceVisuals() {
        try {
            // Check if we're using the space.jfif sprite
            const isUsingSpaceJfif = this.texture.key === 'player-ship-sprite';

            if (isUsingSpaceJfif) {
                // For our basic spaceship sprite
                this.setScale(1.0); // Adjust scale for the new sprite

                // Set the hitbox size to match the visible part of the ship
                this.body.setSize(80, 120);
                this.body.setOffset(20, 20);
            } else {
                // For the default sprite
                this.setTint(0x3399ff);
                this.setScale(1.5); // Make the ship a bit larger
            }

            // Create a container for additional visual elements
            this.visualsContainer = this.scene.add.container(this.x, this.y);

            // Add a glow effect around the ship
            const glow = this.scene.add.graphics();
            glow.fillStyle(0x3399ff, 0.2);
            glow.fillCircle(0, 0, isUsingSpaceJfif ? 50 : 30);
            this.visualsContainer.add(glow);

            // Add subtle pulsing animation to the glow
            this.scene.tweens.add({
                targets: glow,
                alpha: { from: 0.2, to: 0.4 },
                scale: { from: 1, to: 1.1 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Create engine container
            this.engineContainer = this.scene.add.container(this.x, this.y);
            this.engineContainer.setDepth(9); // Behind the ship

            // Add engine trails
            if (this.scene.textures.exists('player-ship-engines')) {
                // Create engine sprite
                this.engineSprite = this.scene.add.sprite(0, isUsingSpaceJfif ? 70 : 15, 'player-ship-engines');
                this.engineSprite.setOrigin(0.5, 0);
                this.engineSprite.setScale(isUsingSpaceJfif ? 0.8 : 1.2);
                this.engineContainer.add(this.engineSprite);

                // Create engine animation if it doesn't exist
                if (!this.scene.anims.exists('engine-thrust')) {
                    this.scene.anims.create({
                        key: 'engine-thrust',
                        frames: [
                            { key: 'player-ship-engines', frame: 'engine-thrust-0' },
                            { key: 'player-ship-engines', frame: 'engine-thrust-1' },
                            { key: 'player-ship-engines', frame: 'engine-thrust-2' },
                            { key: 'player-ship-engines', frame: 'engine-thrust-3' },
                            { key: 'player-ship-engines', frame: 'engine-thrust-4' },
                            { key: 'player-ship-engines', frame: 'engine-thrust-5' }
                        ],
                        frameRate: 12,
                        repeat: -1
                    });
                }

                // Play the engine animation
                this.engineSprite.play('engine-thrust');
            }

            // Add engine particles
            if (this.scene.add.particles) {
                this.engineParticles = this.scene.add.particles('star-particle');

                // Adjust particle positions based on the sprite
                const engineY = isUsingSpaceJfif ? 75 : 20;
                const thrusterOffset = isUsingSpaceJfif ? 15 : 10;

                // Main engine exhaust
                this.engineEmitter = this.engineParticles.createEmitter({
                    x: 0,
                    y: engineY,
                    speed: { min: 50, max: 100 },
                    angle: { min: 80, max: 100 },
                    scale: { start: 0.5, end: 0 },
                    lifespan: { min: 200, max: 400 },
                    blendMode: 'ADD',
                    tint: [ 0x66ccff, 0x3399ff ],
                    frequency: 30
                });

                // Left thruster
                this.leftThruster = this.engineParticles.createEmitter({
                    x: -thrusterOffset,
                    y: engineY - 5,
                    speed: { min: 30, max: 60 },
                    angle: { min: 80, max: 100 },
                    scale: { start: 0.3, end: 0 },
                    lifespan: { min: 100, max: 200 },
                    blendMode: 'ADD',
                    tint: [ 0x66ccff, 0x3399ff ],
                    frequency: 50,
                    on: false  // Start disabled
                });

                // Right thruster
                this.rightThruster = this.engineParticles.createEmitter({
                    x: thrusterOffset,
                    y: engineY - 5,
                    speed: { min: 30, max: 60 },
                    angle: { min: 80, max: 100 },
                    scale: { start: 0.3, end: 0 },
                    lifespan: { min: 100, max: 200 },
                    blendMode: 'ADD',
                    tint: [ 0x66ccff, 0x3399ff ],
                    frequency: 50,
                    on: false  // Start disabled
                });

                // Boost particles (for dash effect)
                this.boostEmitter = this.engineParticles.createEmitter({
                    x: 0,
                    y: engineY,
                    speed: { min: 100, max: 200 },
                    angle: { min: 80, max: 100 },
                    scale: { start: 0.8, end: 0 },
                    lifespan: { min: 300, max: 500 },
                    blendMode: 'ADD',
                    frequency: 10,
                    tint: [ 0x33aaff, 0x3366ff ],
                    on: false  // Start disabled
                });
            }

            // Create a shield effect
            const shieldRadius = isUsingSpaceJfif ? 50 : 30;
            this.shieldEffect = this.scene.add.circle(0, isUsingSpaceJfif ? 20 : 0, shieldRadius, 0x3399ff, 0.2)
                .setOrigin(0.5);
            this.shieldEffect.setAlpha(0); // Start invisible
            this.visualsContainer.add(this.shieldEffect);

            // Create a hit effect (initially invisible)
            const hitRadius = isUsingSpaceJfif ? 40 : 25;
            this.hitEffect = this.scene.add.circle(0, isUsingSpaceJfif ? 20 : 0, hitRadius, 0xff3333, 0)
                .setOrigin(0.5);
            this.visualsContainer.add(this.hitEffect);

        } catch (error) {
            console.warn('Could not enhance ship visuals:', error);
        }
    }
}