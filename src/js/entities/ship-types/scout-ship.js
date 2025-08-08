/**
 * Scout Ship Class
 * Fast ship with high speed and evasion but lower health
 * Enhanced with electric element abilities
 */
class ScoutShip extends ShipBase {
    constructor() {
        super({
            id: 'scout',
            name: 'Scout Ship',
            description: 'A lightweight reconnaissance vessel with superior speed and evasion capabilities. Low health but can outmaneuver most threats. Specializes in electric element attacks.',
            sprite: 'ship-scout',
            unlockCriteria: 'Complete Sector 2',
            unlockMessage: 'Scout Ship unlocked! Speed is your ally.',
            difficulty: 'medium'
        });

        // Override base stats with scout-specific modifiers
        this.statModifiers = {
            health: 0.7,        // Lower health
            shield: 0.8,        // Slightly lower shields
            speed: 1.5,         // Much higher speed
            fireRate: 1.2,      // Slightly faster fire rate
            damage: 0.9,        // Slightly lower damage
            shieldRegenRate: 1.3, // Faster shield regen
            ammoRegenRate: 1.1,   // Slightly faster ammo regen
            maxAmmo: 0.9,         // Slightly lower max ammo
            specialCooldown: 0.8,  // Faster special cooldown
            dashCooldown: 0.6,     // Much faster dash cooldown
            dashDistance: 1.3,     // Longer dash distance
            dashDuration: 0.8      // Faster dash (higher speed)
        };

        // Starting weapons for scout
        this.startingWeapons = ['BASIC_LASER', 'DUAL_CANNON'];

        // Element specialization
        this.elementSpecialization = {
            element: 'electric',
            bonusDamage: 0.25, // 25% bonus damage with electric weapons
            resistances: {
                electric: 0.3, // 30% resistance to electric damage
                fire: -0.1     // 10% weakness to fire damage
            }
        };

        // Special ability: Stealth Mode with Electric Discharge
        this.specialAbility = {
            name: 'Electric Stealth',
            description: 'Temporarily become partially invisible, gain 50% evasion chance, and discharge electric shocks to nearby enemies when hit.',
            cooldown: 15000, // 15 seconds
            duration: 5000,  // 5 seconds
            isActive: false,
            lastUsed: 0,
            icon: '⚡',
            execute: (ship) => {
                // Apply stealth effect with electric discharge
                this.activateStealthMode(ship);
                return true;
            }
        };

        // Visual effects
        this.visualEffects = {
            engineColor: 0x33ccff, // Changed to electric blue
            trailColor: 0x66ccff,  // Changed to electric blue
            shieldColor: 0x99ccff, // Changed to electric blue
            dashColor: 0xccffff,   // Changed to light blue
            specialColor: 0x3399ff, // Changed to electric blue
            elementColor: 0x66ccff  // Electric element color
        };

        // Scout-specific synergies
        this.synergies = [
            {
                name: 'Reconnaissance',
                description: 'Reveals all enemies on the map when entering a new sector.',
                isActive: true
            },
            {
                name: 'Evasive Maneuvers',
                description: 'Gain 20% chance to automatically evade enemy projectiles.',
                isActive: true
            },
            {
                name: 'Electric Affinity',
                description: 'Electric weapons deal 25% more damage and chain to nearby enemies.',
                isActive: true
            },
            {
                name: 'Shock Absorption',
                description: '30% resistance to electric damage, but 10% weakness to fire damage.',
                isActive: true
            }
        ];
    }

    /**
     * Apply scout-specific synergies
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applySynergies(playerShip) {
        // Add evasion chance
        playerShip.evasionChance = 0.2; // 20% chance to evade

        // Add event listener for sector start to reveal enemies
        playerShip.scene.events.once('sector-start', () => {
            this.revealAllEnemies(playerShip.scene);
        });

        // Apply electric element specialization
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

        // Apply electric element to weapons
        this.applyElementToWeapons(playerShip);

        // Add electric chain effect to projectiles
        this.addElectricChainEffect(playerShip);
    }

    /**
     * Apply electric element to player weapons
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applyElementToWeapons(playerShip) {
        // Override the original fire weapon method to add electric element
        if (!playerShip._originalFireWeapon) {
            playerShip._originalFireWeapon = playerShip.fireWeapon;

            playerShip.fireWeapon = function() {
                // Call original method
                this._originalFireWeapon.call(this);

                // Apply electric element to the last fired projectile
                if (this.lastFiredProjectile && this.lastFiredProjectile.active) {
                    // Add electric element property
                    this.lastFiredProjectile.element = 'electric';

                    // Apply damage bonus if applicable
                    if (this.elementDamageBonus && this.elementDamageBonus.electric) {
                        this.lastFiredProjectile.damage *= (1 + this.elementDamageBonus.electric);
                    }

                    // Add visual effect
                    if (this.scene.visualEffects) {
                        this.scene.visualEffects.createElementalTrail(
                            this.lastFiredProjectile,
                            'electric',
                            0x66ccff
                        );
                    }
                }
            };
        }
    }

    /**
     * Add electric chain effect to projectiles
     * @param {PlayerShip} playerShip - The player ship instance
     */
    addElectricChainEffect(playerShip) {
        // Override the projectile hit method to add chain lightning
        playerShip.scene.events.on('projectile-hit', (projectile, target) => {
            // Only apply to player projectiles with electric element
            if (projectile.isPlayerProjectile && projectile.element === 'electric') {
                // Find nearby enemies to chain to
                this.createChainLightning(playerShip.scene, projectile, target);
            }
        });
    }

    /**
     * Create chain lightning effect between enemies
     * @param {Phaser.Scene} scene - The game scene
     * @param {Projectile} projectile - The projectile that hit
     * @param {Enemy} hitTarget - The enemy that was hit
     */
    createChainLightning(scene, projectile, hitTarget) {
        // Chain parameters
        const chainCount = 2; // Number of additional targets to chain to
        const chainRange = 150; // Maximum distance to chain
        const chainDamageReduction = 0.5; // Damage reduction per chain jump

        // Find all enemies in the scene
        const enemies = scene.enemies ? scene.enemies.getChildren() : [];

        // Filter out the hit target and find nearby enemies
        const nearbyEnemies = enemies.filter(enemy => {
            // Skip the already hit target
            if (enemy === hitTarget) return false;

            // Check if enemy is within range
            const distance = Phaser.Math.Distance.Between(
                hitTarget.x, hitTarget.y,
                enemy.x, enemy.y
            );

            return distance <= chainRange && enemy.active;
        });

        // Sort by distance
        nearbyEnemies.sort((a, b) => {
            const distA = Phaser.Math.Distance.Between(hitTarget.x, hitTarget.y, a.x, a.y);
            const distB = Phaser.Math.Distance.Between(hitTarget.x, hitTarget.y, b.x, b.y);
            return distA - distB;
        });

        // Chain to the closest enemies (up to chainCount)
        let currentSource = hitTarget;
        let currentDamage = projectile.damage * chainDamageReduction;

        for (let i = 0; i < Math.min(chainCount, nearbyEnemies.length); i++) {
            const targetEnemy = nearbyEnemies[i];

            // Create lightning effect between source and target
            if (scene.visualEffects) {
                scene.visualEffects.createLightningBolt(
                    currentSource.x, currentSource.y,
                    targetEnemy.x, targetEnemy.y,
                    this.visualEffects.elementColor
                );
            }

            // Apply damage to the chained target
            targetEnemy.takeDamage(currentDamage);

            // Reduce damage for next chain
            currentDamage *= chainDamageReduction;

            // Set this enemy as the source for the next chain
            currentSource = targetEnemy;
        }
    }

    /**
     * Activate stealth mode special ability with electric discharge
     * @param {PlayerShip} playerShip - The player ship instance
     */
    activateStealthMode(playerShip) {
        // Visual effect - semi-transparency
        playerShip.setAlpha(0.5);

        // Increase evasion chance during stealth
        playerShip.evasionChance = 0.5; // 50% chance to evade

        // Create stealth effect particles with electric theme
        if (playerShip.scene.visualEffects) {
            playerShip.stealthEffect = playerShip.scene.visualEffects.createStealthField(
                playerShip.x,
                playerShip.y,
                this.visualEffects.elementColor
            );

            // Add electric particles around the ship
            playerShip.scene.visualEffects.emitters.electricElement.startFollow(playerShip);

            // Make stealth field follow the player
            playerShip.updateCallbacks = playerShip.updateCallbacks || [];
            playerShip.updateCallbacks.push(() => {
                if (playerShip.stealthEffect && playerShip.stealthEffect.active) {
                    playerShip.stealthEffect.setPosition(playerShip.x, playerShip.y);
                }
            });

            // Add update listener to the scene
            playerShip.stealthUpdateListener = () => {
                if (playerShip.updateCallbacks) {
                    playerShip.updateCallbacks.forEach(callback => callback());
                }
            };

            playerShip.scene.events.on('update', playerShip.stealthUpdateListener);
        }

        // Add electric discharge on hit
        playerShip.electricDischargeEnabled = true;

        // Add event listener for when player is hit
        playerShip.events.on('hit', this.triggerElectricDischarge, this);

        // Store reference to player ship for event handling
        this.activePlayerShip = playerShip;

        console.log('Electric stealth mode activated');
    }

    /**
     * Deactivate stealth mode and electric discharge
     * @param {PlayerShip} playerShip - The player ship instance
     */
    deactivateSpecialAbility(playerShip) {
        // Reset transparency
        playerShip.setAlpha(1.0);

        // Reset evasion chance to base value
        playerShip.evasionChance = 0.2;

        // Remove stealth effect particles
        if (playerShip.stealthEffect) {
            playerShip.stealthEffect.destroy();
            playerShip.stealthEffect = null;
        }

        // Stop electric particles
        if (playerShip.scene.visualEffects && playerShip.scene.visualEffects.emitters.electricElement) {
            playerShip.scene.visualEffects.emitters.electricElement.stopFollow();
        }

        // Remove update listener
        if (playerShip.stealthUpdateListener) {
            playerShip.scene.events.off('update', playerShip.stealthUpdateListener);
            playerShip.stealthUpdateListener = null;
        }

        // Clear update callbacks
        if (playerShip.updateCallbacks) {
            playerShip.updateCallbacks = playerShip.updateCallbacks.filter(
                callback => callback.name !== 'stealthFieldUpdate'
            );
        }

        // Disable electric discharge
        playerShip.electricDischargeEnabled = false;

        // Remove hit event listener
        playerShip.events.off('hit', this.triggerElectricDischarge, this);

        // Clear reference
        this.activePlayerShip = null;

        // Create final electric discharge effect
        if (playerShip.scene.visualEffects) {
            playerShip.scene.visualEffects.createElectricElementalEffect(
                playerShip.x,
                playerShip.y,
                120 // Large radius for final effect
            );
        }

        console.log('Electric stealth mode deactivated');
    }

    /**
     * Trigger electric discharge when hit during stealth mode
     * @param {PlayerShip} playerShip - The player ship that was hit
     * @param {Object} source - The source of the damage
     */
    triggerElectricDischarge(playerShip, source) {
        // Only trigger if stealth mode is active
        if (!playerShip.electricDischargeEnabled) return;

        // Create electric discharge effect
        if (playerShip.scene.visualEffects) {
            playerShip.scene.visualEffects.createElectricElementalEffect(
                playerShip.x,
                playerShip.y,
                100 // Discharge radius
            );
        }

        // Find enemies in discharge range
        const dischargeRange = 150;
        const enemies = playerShip.scene.enemies ? playerShip.scene.enemies.getChildren() : [];

        // Filter enemies within range
        const nearbyEnemies = enemies.filter(enemy => {
            const distance = Phaser.Math.Distance.Between(
                playerShip.x, playerShip.y,
                enemy.x, enemy.y
            );

            return distance <= dischargeRange && enemy.active;
        });

        // Apply discharge damage to nearby enemies
        const dischargeDamage = 20; // Base discharge damage

        nearbyEnemies.forEach(enemy => {
            // Create lightning effect to each enemy
            if (playerShip.scene.visualEffects) {
                playerShip.scene.visualEffects.createLightningBolt(
                    playerShip.x, playerShip.y,
                    enemy.x, enemy.y,
                    this.visualEffects.elementColor
                );
            }

            // Apply damage
            enemy.takeDamage(dischargeDamage);
        });

        console.log(`Electric discharge hit ${nearbyEnemies.length} enemies`);
    }

    /**
     * Reveal all enemies on the map
     * @param {Phaser.Scene} scene - The game scene
     */
    revealAllEnemies(scene) {
        // Find all enemies in the current sector
        const enemies = scene.enemies ? scene.enemies.getChildren() : [];

        // Add reveal effect to each enemy
        enemies.forEach(enemy => {
            // Add visual indicator
            const highlight = scene.add.circle(
                enemy.x,
                enemy.y,
                30,
                this.visualEffects.specialColor,
                0.3
            );

            // Pulse animation
            scene.tweens.add({
                targets: highlight,
                alpha: 0,
                scale: 2,
                duration: 1500,
                onComplete: () => highlight.destroy()
            });

            // Add minimap marker if minimap exists
            if (scene.minimap && scene.minimap.addEnemyMarker) {
                scene.minimap.addEnemyMarker(enemy);
            }
        });

        console.log(`Revealed ${enemies.length} enemies on the map`);
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ScoutShip = ScoutShip;
}
