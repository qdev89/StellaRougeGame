/**
 * Support Ship Class
 * Specialized ship with unique support abilities and resource generation
 * Enhanced with ice element abilities
 */
class SupportShip extends ShipBase {
    constructor() {
        super({
            id: 'support',
            name: 'Technician',
            description: 'A specialized support vessel with advanced resource generation and repair systems. Weaker in combat but provides unique advantages. Specializes in ice element abilities.',
            sprite: 'ship-support',
            unlockCriteria: 'Complete Sector 4',
            unlockMessage: 'Technician unlocked! Master the art of resource management.',
            difficulty: 'hard'
        });

        // Override base stats with support-specific modifiers
        this.statModifiers = {
            health: 0.8,        // Lower health
            shield: 1.2,        // Higher shields
            speed: 0.9,         // Slightly lower speed
            fireRate: 0.8,      // Slower fire rate
            damage: 0.7,        // Much lower damage
            shieldRegenRate: 1.8, // Much faster shield regen
            ammoRegenRate: 2.0,   // Double ammo regen
            maxAmmo: 1.5,         // Higher max ammo
            specialCooldown: 0.7,  // Faster special cooldown
            dashCooldown: 1.1,     // Slightly slower dash cooldown
            dashDistance: 0.9,     // Slightly shorter dash distance
            dashDuration: 1.0      // Normal dash speed
        };

        // Starting weapons for support
        this.startingWeapons = ['BASIC_LASER', 'LASER_BEAM'];

        // Element specialization
        this.elementSpecialization = {
            element: 'ice',
            bonusDamage: 0.2, // 20% bonus damage with ice weapons
            resistances: {
                ice: 0.4,      // 40% resistance to ice damage
                electric: -0.1  // 10% weakness to electric damage
            }
        };

        // Special ability: Cryo Drone
        this.specialAbility = {
            name: 'Cryo Drone',
            description: 'Deploy a drone that repairs your ship, generates ammo, and freezes nearby enemies.',
            cooldown: 20000, // 20 seconds
            duration: 10000, // 10 seconds
            isActive: false,
            lastUsed: 0,
            icon: '❄️',
            execute: (ship) => {
                // Deploy cryo drone
                this.deployRepairDrone(ship);
                return true;
            }
        };

        // Visual effects
        this.visualEffects = {
            engineColor: 0x33ccff, // Changed to ice blue
            trailColor: 0x66ccff,  // Changed to ice blue
            shieldColor: 0x99ccff, // Changed to ice blue
            dashColor: 0xccffff,   // Changed to light blue
            specialColor: 0x00ccff, // Changed to ice blue
            elementColor: 0x33ccff  // Ice element color
        };

        // Support-specific synergies
        this.synergies = [
            {
                name: 'Resource Efficiency',
                description: 'Weapons consume 30% less ammo.',
                isActive: true
            },
            {
                name: 'Salvage Expert',
                description: 'Defeated enemies have a 25% chance to drop additional resources.',
                isActive: true
            },
            {
                name: 'Emergency Systems',
                description: 'When health drops below 25%, automatically repair 15% of max health once per sector.',
                isActive: true,
                used: false
            },
            {
                name: 'Ice Affinity',
                description: 'Ice weapons deal 20% more damage and slow enemies.',
                isActive: true
            },
            {
                name: 'Frost Resistance',
                description: '40% resistance to ice damage, but 10% weakness to electric damage.',
                isActive: true
            }
        ];
    }

    /**
     * Apply support-specific synergies
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applySynergies(playerShip) {
        // Reduce ammo consumption
        const originalAmmoConsumption = { ...playerShip.ammoConsumption };
        Object.keys(playerShip.ammoConsumption).forEach(weapon => {
            if (playerShip.ammoConsumption[weapon] > 0) {
                playerShip.ammoConsumption[weapon] = Math.max(
                    1,
                    Math.floor(playerShip.ammoConsumption[weapon] * 0.7)
                );
            }
        });

        // Add salvage chance to enemies
        playerShip.scene.events.on('enemy-defeated', (enemy) => {
            if (Math.random() < 0.25) { // 25% chance
                this.spawnExtraResources(enemy);
            }
        });

        // Add emergency repair system
        playerShip.scene.events.on('player-damaged', () => {
            // Check if health is below 25% and emergency system hasn't been used
            if (playerShip.health < playerShip.maxHealth * 0.25 && !this.synergies[2].used) {
                // Repair 15% of max health
                const repairAmount = playerShip.maxHealth * 0.15;
                playerShip.health += repairAmount;

                // Mark as used
                this.synergies[2].used = true;

                // Create repair effect
                this.createEmergencyRepairEffect(playerShip);

                console.log(`Emergency repair activated: +${repairAmount.toFixed(1)} health`);
            }
        });

        // Reset emergency system on new sector
        playerShip.scene.events.on('sector-start', () => {
            this.synergies[2].used = false;
        });

        // Apply ice element specialization
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

        // Apply ice element to weapons
        this.applyElementToWeapons(playerShip);

        // Add freezing effect to projectiles
        this.addFreezingEffect(playerShip);
    }

    /**
     * Apply ice element to player weapons
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applyElementToWeapons(playerShip) {
        // Override the original fire weapon method to add ice element
        if (!playerShip._originalFireWeapon) {
            playerShip._originalFireWeapon = playerShip.fireWeapon;

            playerShip.fireWeapon = function() {
                // Call original method
                this._originalFireWeapon.call(this);

                // Apply ice element to the last fired projectile
                if (this.lastFiredProjectile && this.lastFiredProjectile.active) {
                    // Add ice element property
                    this.lastFiredProjectile.element = 'ice';

                    // Apply damage bonus if applicable
                    if (this.elementDamageBonus && this.elementDamageBonus.ice) {
                        this.lastFiredProjectile.damage *= (1 + this.elementDamageBonus.ice);
                    }

                    // Add visual effect
                    if (this.scene.visualEffects) {
                        this.scene.visualEffects.createElementalTrail(
                            this.lastFiredProjectile,
                            'ice',
                            0x33ccff
                        );
                    }
                }
            };
        }
    }

    /**
     * Add freezing effect to projectiles
     * @param {PlayerShip} playerShip - The player ship instance
     */
    addFreezingEffect(playerShip) {
        // Override the projectile hit method to add freezing effect
        playerShip.scene.events.on('projectile-hit', (projectile, target) => {
            // Only apply to player projectiles with ice element
            if (projectile.isPlayerProjectile && projectile.element === 'ice') {
                // Apply freezing effect to the target
                this.applyFreezingEffect(playerShip.scene, target);
            }
        });
    }

    /**
     * Apply freezing effect to an enemy
     * @param {Phaser.Scene} scene - The game scene
     * @param {Enemy} target - The enemy to apply freezing to
     */
    applyFreezingEffect(scene, target) {
        // Freezing parameters
        const freezeDuration = 2000; // 2 seconds
        const slowFactor = 0.5;      // 50% speed reduction

        // Add freezing visual effect to the target
        if (scene.visualEffects) {
            // Create ice particles around the target
            if (scene.visualEffects.emitters && scene.visualEffects.emitters.iceElement) {
                scene.visualEffects.emitters.iceElement.explode(10, target.x, target.y);
            }

            // Add a freezing sprite to the target if it doesn't already have one
            if (!target.freezeEffect) {
                target.freezeEffect = scene.add.sprite(0, 0, 'ice-effect');

                // If texture doesn't exist, create a circle graphic instead
                if (!scene.textures.exists('ice-effect')) {
                    target.freezeEffect.destroy();

                    // Create graphics object instead
                    target.freezeEffect = scene.add.graphics();
                    target.freezeEffect.fillStyle(this.visualEffects.elementColor, 0.5);
                    target.freezeEffect.fillCircle(0, 0, 20);
                }

                // Add to target's container if it exists
                if (target.container) {
                    target.container.add(target.freezeEffect);
                } else {
                    // Otherwise, make it follow the target
                    target.freezeEffect.setPosition(target.x, target.y);
                    scene.tweens.add({
                        targets: target.freezeEffect,
                        x: target.x,
                        y: target.y,
                        duration: 0,
                        repeat: -1
                    });
                }

                // Animate freezing effect
                scene.tweens.add({
                    targets: target.freezeEffect,
                    alpha: { from: 0.7, to: 0.3 },
                    scale: { from: 0.8, to: 1.2 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            }

            // Reset freezing effect timer if it exists
            if (target.freezeTimer) {
                target.freezeTimer.remove();
            }

            // Apply slow effect to the target
            if (!target.originalSpeed) {
                target.originalSpeed = target.speed || 100;
            }

            // Slow down the target
            target.speed = target.originalSpeed * slowFactor;

            // Apply a blue tint to indicate freezing
            target.setTint(0x99ccff);

            // Set up timer to restore original speed
            target.freezeTimer = scene.time.delayedCall(freezeDuration, () => {
                // Restore original speed if target is still active
                if (target.active && target.originalSpeed) {
                    target.speed = target.originalSpeed;
                    target.clearTint();
                }

                // Clean up freezing effect
                if (target.freezeEffect && target.freezeEffect.destroy) {
                    target.freezeEffect.destroy();
                    target.freezeEffect = null;
                }

                target.freezeTimer = null;
            });

            // Clean up when target is destroyed
            const originalDestroy = target.destroy;
            target.destroy = function() {
                if (this.freezeTimer) {
                    this.freezeTimer.remove();
                    this.freezeTimer = null;
                }

                if (this.freezeEffect && this.freezeEffect.destroy) {
                    this.freezeEffect.destroy();
                    this.freezeEffect = null;
                }

                originalDestroy.call(this);
            };
        }
    }

    /**
     * Deploy cryo drone special ability
     * @param {PlayerShip} playerShip - The player ship instance
     */
    deployRepairDrone(playerShip) {
        // Create drone sprite
        if (!playerShip.repairDrone) {
            // Try to use existing texture
            if (playerShip.scene.textures.exists('cryo-drone')) {
                playerShip.repairDrone = playerShip.scene.add.sprite(
                    playerShip.x + 30,
                    playerShip.y - 20,
                    'cryo-drone'
                );
            } else {
                // Create a simple drone graphic
                const droneGraphics = playerShip.scene.add.graphics();

                // Draw drone body
                droneGraphics.fillStyle(this.visualEffects.elementColor, 1);
                droneGraphics.fillCircle(0, 0, 8);

                // Draw drone details
                droneGraphics.lineStyle(2, 0xffffff, 0.8);
                droneGraphics.strokeCircle(0, 0, 8);
                droneGraphics.lineBetween(-10, 0, 10, 0);
                droneGraphics.lineBetween(0, -10, 0, 10);

                // Create texture
                droneGraphics.generateTexture('cryo-drone', 20, 20);
                droneGraphics.destroy();

                // Create sprite
                playerShip.repairDrone = playerShip.scene.add.sprite(
                    playerShip.x + 30,
                    playerShip.y - 20,
                    'cryo-drone'
                );
            }

            playerShip.repairDrone.setDepth(playerShip.depth + 1);
            playerShip.repairDrone.setScale(0.8);
            playerShip.repairDrone.setTint(0x33ccff); // Ice blue tint
        }

        // Create drone movement pattern
        this.createDroneMovement(playerShip);

        // Set up repair, ammo generation, and freezing intervals
        this.setupDroneEffects(playerShip);

        console.log('Cryo drone deployed');
    }

    /**
     * Create drone movement pattern
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createDroneMovement(playerShip) {
        // Create a circular path around the player
        const path = new Phaser.Curves.Path(playerShip.x, playerShip.y);
        path.circleTo(40);

        // Create follower for the path
        const follower = { t: 0, vec: new Phaser.Math.Vector2() };

        // Create tween to move along the path
        const tween = playerShip.scene.tweens.add({
            targets: follower,
            t: 1,
            ease: 'Linear',
            duration: 4000,
            repeat: -1,
            onUpdate: () => {
                // Get position from path
                path.getPoint(follower.t, follower.vec);

                // Update path center to player position
                path.x = playerShip.x;
                path.y = playerShip.y;

                // Update drone position
                if (playerShip.repairDrone && playerShip.repairDrone.active) {
                    playerShip.repairDrone.setPosition(follower.vec.x, follower.vec.y);

                    // Add slight rotation
                    playerShip.repairDrone.angle += 2;
                }
            }
        });

        // Store reference to tween
        playerShip.repairDroneTween = tween;
    }

    /**
     * Set up drone repair, ammo generation, and freezing effects
     * @param {PlayerShip} playerShip - The player ship instance
     */
    setupDroneEffects(playerShip) {
        // Create cryo beam effect
        const repairBeam = playerShip.scene.add.graphics();
        repairBeam.lineStyle(2, this.visualEffects.elementColor, 0.8);
        repairBeam.setDepth(playerShip.depth + 0.5);

        // Create update function for cryo beam
        const updateRepairBeam = () => {
            if (playerShip.repairDrone && playerShip.repairDrone.active) {
                repairBeam.clear();
                repairBeam.lineStyle(2, this.visualEffects.elementColor, 0.8);
                repairBeam.lineBetween(
                    playerShip.repairDrone.x,
                    playerShip.repairDrone.y,
                    playerShip.x,
                    playerShip.y
                );
            }
        };

        // Add to scene update
        playerShip.scene.events.on('update', updateRepairBeam);

        // Create ice particles around the drone
        if (playerShip.scene.visualEffects &&
            playerShip.scene.visualEffects.emitters &&
            playerShip.scene.visualEffects.emitters.iceElement) {

            playerShip.cryoEmitter = playerShip.scene.visualEffects.emitters.iceElement.copy();
            playerShip.cryoEmitter.setFrequency(500); // Emit particles every 500ms
            playerShip.cryoEmitter.setScale(0.5);
            playerShip.cryoEmitter.startFollow(playerShip.repairDrone);
        }

        // Set up repair and freezing interval
        const repairInterval = playerShip.scene.time.addEvent({
            delay: 1000, // Every second
            callback: () => {
                // Repair health
                if (playerShip.health < playerShip.maxHealth) {
                    playerShip.health = Math.min(
                        playerShip.health + (playerShip.maxHealth * 0.03), // 3% per second
                        playerShip.maxHealth
                    );
                }

                // Regenerate ammo for current weapon
                if (playerShip.ammo[playerShip.weaponType] < playerShip.maxAmmo[playerShip.weaponType]) {
                    playerShip.addAmmo(playerShip.weaponType, 2);
                }

                // Create repair particle effect
                this.createRepairParticle(playerShip);

                // Find and freeze nearby enemies
                this.freezeNearbyEnemiesFromDrone(playerShip);
            },
            repeat: 9 // 10 seconds total
        });

        // Store references for cleanup
        playerShip.repairDroneEffects = {
            repairBeam,
            repairInterval,
            updateRepairBeam,
            cryoEmitter: playerShip.cryoEmitter
        };
    }

    /**
     * Freeze enemies near the drone
     * @param {PlayerShip} playerShip - The player ship instance
     */
    freezeNearbyEnemiesFromDrone(playerShip) {
        if (!playerShip.repairDrone || !playerShip.repairDrone.active) return;

        // Get all enemies
        const enemies = playerShip.scene.enemies ? playerShip.scene.enemies.getChildren() : [];

        // Find enemies within range
        const range = 80; // Drone freezing range

        enemies.forEach(enemy => {
            if (enemy.active) {
                // Calculate distance to enemy
                const distance = Phaser.Math.Distance.Between(
                    playerShip.repairDrone.x, playerShip.repairDrone.y,
                    enemy.x, enemy.y
                );

                // If enemy is within range, apply freezing effect
                if (distance <= range) {
                    this.applyFreezingEffect(playerShip.scene, enemy);

                    // Create ice effect between drone and enemy
                    if (playerShip.scene.visualEffects) {
                        // Create a small ice effect at the enemy position
                        if (playerShip.scene.visualEffects.createIceElementalEffect) {
                            playerShip.scene.visualEffects.createIceElementalEffect(
                                enemy.x,
                                enemy.y,
                                20 // Small radius
                            );
                        }
                    }
                }
            }
        });
    }

    /**
     * Create cryo repair particle effect
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createRepairParticle(playerShip) {
        if (!playerShip.repairDrone || !playerShip.repairDrone.active) return;

        // Create particle at drone position
        const particle = playerShip.scene.add.circle(
            playerShip.repairDrone.x,
            playerShip.repairDrone.y,
            5,
            this.visualEffects.elementColor,
            0.8
        );

        // Animate particle to player
        playerShip.scene.tweens.add({
            targets: particle,
            x: playerShip.x,
            y: playerShip.y,
            scale: 0.5,
            alpha: 0,
            duration: 500,
            onComplete: () => particle.destroy()
        });

        // Create ice trail effect
        if (playerShip.scene.visualEffects &&
            playerShip.scene.visualEffects.createIceElementalTrail) {

            // Create a small trail from drone to player
            playerShip.scene.visualEffects.createIceElementalTrail({
                x: playerShip.repairDrone.x,
                y: playerShip.repairDrone.y
            }, {
                x: playerShip.x,
                y: playerShip.y
            }, 0.5, 300);
        }
    }

    /**
     * Create emergency repair effect with ice theme
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createEmergencyRepairEffect(playerShip) {
        // Create pulse effect
        const pulse = playerShip.scene.add.circle(
            playerShip.x,
            playerShip.y,
            50,
            this.visualEffects.elementColor,
            0.5
        );

        pulse.setDepth(playerShip.depth + 1);

        // Animate pulse
        playerShip.scene.tweens.add({
            targets: pulse,
            scale: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => pulse.destroy()
        });

        // Create repair text
        const repairText = playerShip.scene.add.text(
            playerShip.x,
            playerShip.y - 40,
            'EMERGENCY REPAIR',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#33ccff', // Changed to ice blue
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Animate text
        playerShip.scene.tweens.add({
            targets: repairText,
            y: playerShip.y - 80,
            alpha: 0,
            duration: 1500,
            onComplete: () => repairText.destroy()
        });

        // Create ice effect if available
        if (playerShip.scene.visualEffects &&
            playerShip.scene.visualEffects.createIceElementalEffect) {

            playerShip.scene.visualEffects.createIceElementalEffect(
                playerShip.x,
                playerShip.y,
                70 // Medium radius
            );
        }
    }

    /**
     * Spawn extra resources from defeated enemy
     * @param {Enemy} enemy - The defeated enemy
     */
    spawnExtraResources(enemy) {
        // Determine resource type
        const resourceTypes = ['health', 'shield', 'ammo'];
        const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

        // Create resource pickup
        if (enemy.scene.createPowerup) {
            enemy.scene.createPowerup(
                enemy.x,
                enemy.y,
                resourceType,
                { amount: resourceType === 'ammo' ? 10 : 20 }
            );

            // Create salvage text
            const salvageText = enemy.scene.add.text(
                enemy.x,
                enemy.y - 20,
                'SALVAGED',
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#33ccff', // Changed to ice blue
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);

            // Animate text
            enemy.scene.tweens.add({
                targets: salvageText,
                y: enemy.y - 50,
                alpha: 0,
                duration: 1000,
                onComplete: () => salvageText.destroy()
            });
        }
    }

    /**
     * Deactivate cryo drone
     * @param {PlayerShip} playerShip - The player ship instance
     */
    deactivateSpecialAbility(playerShip) {
        // Stop drone movement tween
        if (playerShip.repairDroneTween) {
            playerShip.repairDroneTween.stop();
            playerShip.repairDroneTween = null;
        }

        // Clean up repair effects
        if (playerShip.repairDroneEffects) {
            // Stop repair interval
            if (playerShip.repairDroneEffects.repairInterval) {
                playerShip.repairDroneEffects.repairInterval.remove();
            }

            // Remove update listener
            playerShip.scene.events.off('update', playerShip.repairDroneEffects.updateRepairBeam);

            // Destroy repair beam
            if (playerShip.repairDroneEffects.repairBeam) {
                playerShip.repairDroneEffects.repairBeam.destroy();
            }

            // Stop cryo emitter
            if (playerShip.repairDroneEffects.cryoEmitter) {
                playerShip.repairDroneEffects.cryoEmitter.stop();
            }

            playerShip.repairDroneEffects = null;
        }

        // Remove drone with animation
        if (playerShip.repairDrone) {
            // Create final ice explosion effect
            if (playerShip.scene.visualEffects &&
                playerShip.scene.visualEffects.createIceElementalEffect) {

                playerShip.scene.visualEffects.createIceElementalEffect(
                    playerShip.repairDrone.x,
                    playerShip.repairDrone.y,
                    60 // Medium radius for final effect
                );
            }

            playerShip.scene.tweens.add({
                targets: playerShip.repairDrone,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    playerShip.repairDrone.destroy();
                    playerShip.repairDrone = null;
                }
            });
        }

        // Stop cryo emitter if it exists separately
        if (playerShip.cryoEmitter) {
            playerShip.cryoEmitter.stop();
            playerShip.cryoEmitter = null;
        }

        console.log('Cryo drone deactivated');
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.SupportShip = SupportShip;
}
