/**
 * Tank Ship Class
 * Heavy ship with high health and shields but low speed
 * Enhanced with fire element abilities
 */
class TankShip extends ShipBase {
    constructor() {
        super({
            id: 'tank',
            name: 'Juggernaut',
            description: 'A heavily armored battleship with exceptional durability. Slow but can withstand massive damage. Specializes in fire element attacks.',
            sprite: 'ship-tank',
            unlockCriteria: 'Complete Sector 3',
            unlockMessage: 'Juggernaut unlocked! Become an unstoppable force.',
            difficulty: 'easy'
        });

        // Override base stats with tank-specific modifiers
        this.statModifiers = {
            health: 2.0,        // Double health
            shield: 1.8,        // Much higher shields
            speed: 0.7,         // Much lower speed
            fireRate: 0.8,      // Slower fire rate
            damage: 1.2,        // Higher damage
            shieldRegenRate: 1.5, // Much faster shield regen
            ammoRegenRate: 0.9,   // Slightly slower ammo regen
            maxAmmo: 1.2,         // Higher max ammo
            specialCooldown: 1.2,  // Slower special cooldown
            dashCooldown: 1.5,     // Much slower dash cooldown
            dashDistance: 0.8,     // Shorter dash distance
            dashDuration: 1.2      // Slower dash (lower speed)
        };

        // Starting weapons for tank
        this.startingWeapons = ['BASIC_LASER', 'PLASMA_BOLT'];

        // Element specialization
        this.elementSpecialization = {
            element: 'fire',
            bonusDamage: 0.3, // 30% bonus damage with fire weapons
            resistances: {
                fire: 0.5,     // 50% resistance to fire damage
                ice: -0.2      // 20% weakness to ice damage
            }
        };

        // Special ability: Inferno Shield
        this.specialAbility = {
            name: 'Inferno Shield',
            description: 'Deploy a fiery energy shield that blocks all damage and burns nearby enemies.',
            cooldown: 25000, // 25 seconds
            duration: 6000,  // 6 seconds
            isActive: false,
            lastUsed: 0,
            icon: '🔥',
            execute: (ship) => {
                // Deploy inferno shield
                this.activateEnergyShield(ship);
                return true;
            }
        };

        // Visual effects
        this.visualEffects = {
            engineColor: 0xff3300, // Changed to fire red
            trailColor: 0xff6600,  // Changed to fire orange
            shieldColor: 0xff9900, // Changed to fire yellow
            dashColor: 0xff3300,   // Fire red
            specialColor: 0xff6600, // Fire orange
            elementColor: 0xff3300  // Fire element color
        };

        // Tank-specific synergies
        this.synergies = [
            {
                name: 'Reinforced Hull',
                description: 'Gain 25% damage reduction from all sources.',
                isActive: true
            },
            {
                name: 'Shield Capacitors',
                description: 'Shields automatically recharge even when taking damage.',
                isActive: true
            },
            {
                name: 'Fire Affinity',
                description: 'Fire weapons deal 30% more damage and apply burning damage over time.',
                isActive: true
            },
            {
                name: 'Heat Absorption',
                description: '50% resistance to fire damage, but 20% weakness to ice damage.',
                isActive: true
            }
        ];
    }

    /**
     * Apply tank-specific synergies
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applySynergies(playerShip) {
        // Add damage reduction
        playerShip.damageReduction = 0.25; // 25% damage reduction

        // Enable shield recharge during damage
        playerShip.shieldsRechargeWhileDamaged = true;

        // Override shield recharge method to allow recharge during damage
        const originalRechargeMethod = playerShip.rechargeShields;
        playerShip.rechargeShields = function(amount) {
            // Always allow recharge
            if (this.shields < this.maxShields) {
                this.shields = Math.min(this.shields + amount, this.maxShields);
                return true;
            }
            return false;
        };

        // Apply fire element specialization
        this.applyElementSpecialization(playerShip);
    }

    /**
     * Apply element specialization to the player ship
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applyElementSpecialization(playerShip) {
        // Add element properties to the ship
        playerShip.elementSpecialization = this.elementSpecialization.element;

        // Add element damage bonus
        playerShip.elementDamageBonus = {};
        playerShip.elementDamageBonus[this.elementSpecialization.element] = this.elementSpecialization.bonusDamage;

        // Add element resistances
        playerShip.elementResistances = this.elementSpecialization.resistances;

        // Apply fire element to weapons
        this.applyElementToWeapons(playerShip);

        // Add burning effect to projectiles
        this.addBurningEffect(playerShip);
    }

    /**
     * Apply fire element to player weapons
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applyElementToWeapons(playerShip) {
        // Override the original fire weapon method to add fire element
        if (!playerShip._originalFireWeapon) {
            playerShip._originalFireWeapon = playerShip.fireWeapon;

            playerShip.fireWeapon = function() {
                // Call original method
                this._originalFireWeapon.call(this);

                // Apply fire element to the last fired projectile
                if (this.lastFiredProjectile && this.lastFiredProjectile.active) {
                    // Add fire element property
                    this.lastFiredProjectile.element = 'fire';

                    // Apply damage bonus if applicable
                    if (this.elementDamageBonus && this.elementDamageBonus.fire) {
                        this.lastFiredProjectile.damage *= (1 + this.elementDamageBonus.fire);
                    }

                    // Add visual effect
                    if (this.scene.visualEffects) {
                        this.scene.visualEffects.createElementalTrail(
                            this.lastFiredProjectile,
                            'fire',
                            0xff3300
                        );
                    }
                }
            };
        }
    }

    /**
     * Add burning effect to projectiles
     * @param {PlayerShip} playerShip - The player ship instance
     */
    addBurningEffect(playerShip) {
        // Override the projectile hit method to add burning damage over time
        playerShip.scene.events.on('projectile-hit', (projectile, target) => {
            // Only apply to player projectiles with fire element
            if (projectile.isPlayerProjectile && projectile.element === 'fire') {
                // Apply burning effect to the target
                this.applyBurningEffect(playerShip.scene, target, projectile.damage);
            }
        });
    }

    /**
     * Apply burning effect to an enemy
     * @param {Phaser.Scene} scene - The game scene
     * @param {Enemy} target - The enemy to apply burning to
     * @param {number} baseDamage - The base damage that caused the burning
     */
    applyBurningEffect(scene, target, baseDamage) {
        // Burning parameters
        const burnDuration = 3000; // 3 seconds
        const burnTickRate = 500;  // Damage every 0.5 seconds
        const burnDamagePerTick = baseDamage * 0.1; // 10% of base damage per tick

        // Add burning visual effect to the target
        if (scene.visualEffects) {
            // Create fire particles around the target
            scene.visualEffects.emitters.fireElement.explode(10, target.x, target.y);

            // Add a burning sprite to the target if it doesn't already have one
            if (!target.burningEffect) {
                target.burningEffect = scene.add.sprite(0, 0, 'fire-effect');

                // If texture doesn't exist, create a circle graphic instead
                if (!scene.textures.exists('fire-effect')) {
                    target.burningEffect.destroy();

                    // Create graphics object instead
                    target.burningEffect = scene.add.graphics();
                    target.burningEffect.fillStyle(this.visualEffects.elementColor, 0.5);
                    target.burningEffect.fillCircle(0, 0, 20);
                }

                // Add to target's container if it exists
                if (target.container) {
                    target.container.add(target.burningEffect);
                } else {
                    // Otherwise, make it follow the target
                    target.burningEffect.setPosition(target.x, target.y);
                    scene.tweens.add({
                        targets: target.burningEffect,
                        x: target.x,
                        y: target.y,
                        duration: 0,
                        repeat: -1
                    });
                }

                // Animate burning effect
                scene.tweens.add({
                    targets: target.burningEffect,
                    alpha: { from: 0.7, to: 0.3 },
                    scale: { from: 0.8, to: 1.2 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            }

            // Reset burning effect timer if it exists
            if (target.burningTimer) {
                target.burningTimer.remove();
            }

            // Set up burning damage over time
            let ticksRemaining = Math.floor(burnDuration / burnTickRate);

            target.burningTimer = scene.time.addEvent({
                delay: burnTickRate,
                callback: () => {
                    // Apply damage if target is still active
                    if (target.active && ticksRemaining > 0) {
                        target.takeDamage(burnDamagePerTick);
                        ticksRemaining--;

                        // Create small fire effect on damage tick
                        if (scene.visualEffects) {
                            scene.visualEffects.emitters.fireElement.explode(3, target.x, target.y);
                        }
                    } else {
                        // Clean up when done
                        if (target.burningTimer) {
                            target.burningTimer.remove();
                            target.burningTimer = null;
                        }

                        if (target.burningEffect && target.burningEffect.destroy) {
                            target.burningEffect.destroy();
                            target.burningEffect = null;
                        }
                    }
                },
                repeat: ticksRemaining - 1
            });

            // Clean up when target is destroyed
            const originalDestroy = target.destroy;
            target.destroy = function() {
                if (this.burningTimer) {
                    this.burningTimer.remove();
                    this.burningTimer = null;
                }

                if (this.burningEffect && this.burningEffect.destroy) {
                    this.burningEffect.destroy();
                    this.burningEffect = null;
                }

                originalDestroy.call(this);
            };
        }
    }

    /**
     * Activate inferno shield special ability
     * @param {PlayerShip} playerShip - The player ship instance
     */
    activateEnergyShield(playerShip) {
        // Make player invincible
        playerShip.invincible = true;

        // Create shield effect with fire theme
        if (!playerShip.energyShieldSprite) {
            playerShip.energyShieldSprite = playerShip.scene.add.sprite(
                playerShip.x,
                playerShip.y,
                'shield-bubble'
            );

            // If texture doesn't exist, create a circle graphic instead
            if (!playerShip.scene.textures.exists('shield-bubble')) {
                playerShip.energyShieldSprite.destroy();

                // Create graphics object instead
                playerShip.energyShieldSprite = playerShip.scene.add.graphics();
                playerShip.energyShieldSprite.fillStyle(this.visualEffects.elementColor, 0.3);
                playerShip.energyShieldSprite.lineStyle(3, this.visualEffects.elementColor, 0.8);
                playerShip.energyShieldSprite.strokeCircle(0, 0, 50);
                playerShip.energyShieldSprite.fillCircle(0, 0, 50);
            } else {
                playerShip.energyShieldSprite.setScale(1.5);
                playerShip.energyShieldSprite.setAlpha(0.7);
                playerShip.energyShieldSprite.setTint(this.visualEffects.elementColor);
            }

            playerShip.energyShieldSprite.setDepth(playerShip.depth - 1);
        }

        // Pulse animation
        playerShip.scene.tweens.add({
            targets: playerShip.energyShieldSprite,
            scale: { from: 1.2, to: 1.5 },
            alpha: { from: 0.9, to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: 2
        });

        // Add fire particles around the shield
        if (playerShip.scene.visualEffects) {
            // Create fire emitter that follows the player
            playerShip.infernoEmitter = playerShip.scene.visualEffects.emitters.fireElement;
            playerShip.infernoEmitter.startFollow(playerShip);

            // Set up periodic damage to nearby enemies
            this.setupInfernoDamage(playerShip);
        }

        console.log('Inferno shield activated');
    }

    /**
     * Set up periodic damage to enemies near the inferno shield
     * @param {PlayerShip} playerShip - The player ship instance
     */
    setupInfernoDamage(playerShip) {
        // Inferno parameters
        const damageRadius = 120;  // Damage radius
        const damagePerTick = 10;  // Damage per tick
        const tickRate = 500;      // Damage every 0.5 seconds

        // Create timer for periodic damage
        playerShip.infernoTimer = playerShip.scene.time.addEvent({
            delay: tickRate,
            callback: () => {
                // Find enemies in range
                const enemies = playerShip.scene.enemies ? playerShip.scene.enemies.getChildren() : [];

                // Filter enemies within range
                const nearbyEnemies = enemies.filter(enemy => {
                    const distance = Phaser.Math.Distance.Between(
                        playerShip.x, playerShip.y,
                        enemy.x, enemy.y
                    );

                    return distance <= damageRadius && enemy.active;
                });

                // Apply damage to nearby enemies
                nearbyEnemies.forEach(enemy => {
                    // Apply damage
                    enemy.takeDamage(damagePerTick);

                    // Apply burning effect
                    this.applyBurningEffect(playerShip.scene, enemy, damagePerTick * 2);

                    // Create fire effect between shield and enemy
                    if (playerShip.scene.visualEffects) {
                        // Create small fire explosion at enemy position
                        playerShip.scene.visualEffects.createFireElementalEffect(
                            enemy.x,
                            enemy.y,
                            30 // Small radius
                        );
                    }
                });

                // Create visual pulse effect
                if (nearbyEnemies.length > 0 && playerShip.scene.visualEffects) {
                    playerShip.scene.visualEffects.createFireElementalEffect(
                        playerShip.x,
                        playerShip.y,
                        damageRadius
                    );
                }
            },
            repeat: -1
        });
    }

    /**
     * Deactivate inferno shield
     * @param {PlayerShip} playerShip - The player ship instance
     */
    deactivateSpecialAbility(playerShip) {
        // Remove invincibility
        playerShip.invincible = false;

        // Remove shield effect with fade out
        if (playerShip.energyShieldSprite) {
            playerShip.scene.tweens.add({
                targets: playerShip.energyShieldSprite,
                alpha: 0,
                scale: 2,
                duration: 500,
                onComplete: () => {
                    playerShip.energyShieldSprite.destroy();
                    playerShip.energyShieldSprite = null;
                }
            });
        }

        // Stop fire emitter
        if (playerShip.infernoEmitter) {
            playerShip.infernoEmitter.stopFollow();
            playerShip.infernoEmitter = null;
        }

        // Stop inferno damage timer
        if (playerShip.infernoTimer) {
            playerShip.infernoTimer.remove();
            playerShip.infernoTimer = null;
        }

        // Create final explosion effect
        if (playerShip.scene.visualEffects) {
            playerShip.scene.visualEffects.createFireElementalEffect(
                playerShip.x,
                playerShip.y,
                150 // Large radius for final explosion
            );
        }

        console.log('Inferno shield deactivated');
    }

    /**
     * Apply visual effects to the player ship
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applyVisualEffects(playerShip) {
        // Call parent method
        super.applyVisualEffects(playerShip);

        // Add additional armor plating visual effect
        if (!playerShip.armorPlates) {
            // Create armor plate graphics
            const armorGraphics = playerShip.scene.add.graphics();

            // Draw armor plates
            armorGraphics.lineStyle(3, this.visualEffects.specialColor, 0.8);

            // Top plate
            armorGraphics.strokeRect(-20, -30, 40, 10);

            // Side plates
            armorGraphics.strokeRect(-25, -20, 10, 40);
            armorGraphics.strokeRect(15, -20, 10, 40);

            // Bottom plate
            armorGraphics.strokeRect(-20, 20, 40, 10);

            // Create a texture from the graphics
            armorGraphics.generateTexture('tank-armor-plates', 60, 60);
            armorGraphics.destroy();

            // Create sprite using the texture
            playerShip.armorPlates = playerShip.scene.add.sprite(0, 0, 'tank-armor-plates');
            playerShip.armorPlates.setTint(this.visualEffects.specialColor);

            // Add to visuals container if it exists
            if (playerShip.visualsContainer) {
                playerShip.visualsContainer.add(playerShip.armorPlates);
            } else {
                // Otherwise, make it follow the player
                playerShip.scene.tweens.add({
                    targets: playerShip.armorPlates,
                    x: playerShip.x,
                    y: playerShip.y,
                    duration: 0,
                    repeat: -1
                });
            }
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.TankShip = TankShip;
}
