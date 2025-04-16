/**
 * Enemy Carrier Class
 * Large enemy that spawns drones and provides support
 * Extends the base Enemy class
 */
class EnemyCarrier extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the carrier type
        super(scene, x, y, 'enemy-destroyer', 'CARRIER');
        
        // Override default movement pattern
        this.movementPattern = 'retreat';
        
        // Set up carrier-specific properties
        this.setScale(2.0); // Much larger size
        this.body.setSize(60, 60); // Larger hitbox
        
        // Add carrier-specific visual effects
        this.addCarrierEffects();
        
        // Carrier has strong shields
        this.hasShield = true;
        this.shieldHealth = 80;
        this.maxShieldHealth = 80;
        
        // Drone spawning properties
        this.maxDrones = 4; // Maximum number of active drones
        this.droneSpawnRate = 6000; // ms between spawns
        this.lastSpawnTime = 0;
        this.activeDrones = [];
        
        // Support beam properties
        this.supportBeamActive = false;
        this.supportBeamTarget = null;
        this.supportBeamCooldown = 10000; // ms between support beams
        this.lastSupportBeamTime = 0;
        
        // Set a blue/gray tint
        this.setTint(0x3366cc);
    }
    
    /**
     * Add visual effects specific to carriers
     */
    addCarrierEffects() {
        // Create shield effect
        this.shieldEffect = this.scene.add.ellipse(this.x, this.y, 80, 80, 0x3399ff, 0.3);
        this.shieldEffect.setDepth(this.depth - 1);
        
        // Create hangar bay effect
        this.hangarBay = this.scene.add.rectangle(this.x, this.y + 20, 30, 10, 0x333333);
        this.hangarBay.setDepth(this.depth - 1);
        
        // Create support beam effect (initially invisible)
        this.supportBeam = this.scene.add.rectangle(this.x, this.y, 10, 100, 0x33ff33, 0);
        this.supportBeam.setDepth(this.depth - 1);
        
        // Add engine particles
        if (this.scene.particles) {
            this.engineEmitter = this.scene.particles.createEmitter({
                frame: 'blue',
                speed: { min: 30, max: 60 },
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD',
                lifespan: 300
            });
            
            this.engineEmitter.startFollow(this, 0, 25);
        }
    }
    
    /**
     * Carrier-specific update logic
     */
    update(time, delta, playerShip) {
        if (!this.active) return;
        
        // Call parent update
        super.update(time, delta, playerShip);
        
        // Update visual effects
        this.updateEffects();
        
        // Spawn drones if needed
        if (time - this.lastSpawnTime > this.droneSpawnRate) {
            this.spawnDrone();
            this.lastSpawnTime = time;
        }
        
        // Clean up destroyed drones from tracking array
        this.activeDrones = this.activeDrones.filter(drone => drone.active);
        
        // Check if we should activate support beam
        if (time - this.lastSupportBeamTime > this.supportBeamCooldown && this.activeDrones.length > 0) {
            this.activateSupportBeam();
            this.lastSupportBeamTime = time;
        }
        
        // Update support beam if active
        if (this.supportBeamActive) {
            this.updateSupportBeam();
        }
    }
    
    /**
     * Update visual effects
     */
    updateEffects() {
        // Update shield position
        if (this.shieldEffect) {
            this.shieldEffect.x = this.x;
            this.shieldEffect.y = this.y;
            
            // Update shield opacity based on health
            const opacity = (this.shieldHealth / this.maxShieldHealth) * 0.3;
            this.shieldEffect.setAlpha(opacity);
        }
        
        // Update hangar bay position
        if (this.hangarBay) {
            this.hangarBay.x = this.x;
            this.hangarBay.y = this.y + 20;
        }
    }
    
    /**
     * Spawn a drone from the carrier
     */
    spawnDrone() {
        // Only spawn if we haven't reached the maximum
        if (this.activeDrones.length >= this.maxDrones) return;
        
        // Create drone at hangar position
        const drone = new EnemyDrone(
            this.scene,
            this.x,
            this.y + 30
        );
        
        // Add to scene's enemies group
        this.scene.enemies.add(drone);
        
        // Track this drone
        this.activeDrones.push(drone);
        
        // Visual effect for spawning
        this.scene.tweens.add({
            targets: drone,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 0.8 },
            duration: 500
        });
        
        // Flash hangar bay
        this.hangarBay.setFillStyle(0x3399ff);
        this.scene.time.delayedCall(200, () => {
            if (this.hangarBay && this.hangarBay.active) {
                this.hangarBay.setFillStyle(0x333333);
            }
        });
    }
    
    /**
     * Activate support beam to heal/buff a drone
     */
    activateSupportBeam() {
        // Only activate if we have drones
        if (this.activeDrones.length === 0) return;
        
        // Select a random drone to support
        const targetIndex = Math.floor(Math.random() * this.activeDrones.length);
        this.supportBeamTarget = this.activeDrones[targetIndex];
        
        // Activate beam
        this.supportBeamActive = true;
        
        // Visual effect
        this.supportBeam.setAlpha(0.7);
        
        // Deactivate after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            this.deactivateSupportBeam();
        });
    }
    
    /**
     * Update support beam position and effect
     */
    updateSupportBeam() {
        if (!this.supportBeamTarget || !this.supportBeamTarget.active) {
            this.deactivateSupportBeam();
            return;
        }
        
        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.supportBeamTarget.x, this.supportBeamTarget.y
        );
        
        // Calculate distance to target
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.supportBeamTarget.x, this.supportBeamTarget.y
        );
        
        // Position beam
        this.supportBeam.x = this.x;
        this.supportBeam.y = this.y;
        this.supportBeam.rotation = angle;
        this.supportBeam.width = distance;
        
        // Apply support effect to target
        this.supportBeamTarget.health = Math.min(
            this.supportBeamTarget.health + 0.1,
            this.supportBeamTarget.maxHealth
        );
        
        // Buff target
        if (!this.supportBeamTarget.isBuffed) {
            this.supportBeamTarget.isBuffed = true;
            this.supportBeamTarget.speed *= 1.3;
            this.supportBeamTarget.fireRate *= 0.7;
            this.supportBeamTarget.setTint(0x33ff33);
        }
    }
    
    /**
     * Deactivate support beam
     */
    deactivateSupportBeam() {
        this.supportBeamActive = false;
        this.supportBeam.setAlpha(0);
        
        // Remove buff from target
        if (this.supportBeamTarget && this.supportBeamTarget.active) {
            this.supportBeamTarget.isBuffed = false;
            this.supportBeamTarget.speed = this.supportBeamTarget.settings.SPEED;
            this.supportBeamTarget.fireRate = this.supportBeamTarget.settings.FIRE_RATE;
            
            // Reset tint (accounting for elite status)
            if (this.supportBeamTarget.isElite) {
                this.supportBeamTarget.setTint(0xff5500);
            } else {
                this.supportBeamTarget.clearTint();
            }
        }
        
        this.supportBeamTarget = null;
    }
    
    /**
     * Carrier movement pattern - stays at top of screen and retreats when damaged
     */
    moveRetreat(playerShip) {
        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Target position at top of screen
        const targetY = this.scene.cameras.main.scrollY + 150;
        
        // Move horizontally based on player position
        if (playerShip.x < this.x - 100) {
            // Player is to the left, move right
            this.body.velocity.x = this.speed * 0.5;
        } else if (playerShip.x > this.x + 100) {
            // Player is to the right, move left
            this.body.velocity.x = -this.speed * 0.5;
        } else {
            // Player is roughly centered, slow down
            this.body.velocity.x *= 0.9;
        }
        
        // Move vertically to maintain position at top of screen
        if (this.y < targetY - 20) {
            this.body.velocity.y = this.speed * 0.3;
        } else if (this.y > targetY + 20) {
            this.body.velocity.y = -this.speed * 0.3;
        } else {
            this.body.velocity.y *= 0.9;
        }
        
        // If health is low, retreat upward
        if (this.health < this.maxHealth * 0.3) {
            this.body.velocity.y = -this.speed;
        }
        
        // If player gets too close, move away
        if (distance < 200) {
            const angle = Phaser.Math.Angle.Between(
                playerShip.x, playerShip.y,
                this.x, this.y
            );
            
            this.body.velocity.x = Math.cos(angle) * this.speed;
            this.body.velocity.y = Math.sin(angle) * this.speed;
        }
    }
    
    /**
     * Override updateMovement to add the retreat pattern
     */
    updateMovement(playerShip) {
        if (!playerShip || !playerShip.active) {
            // Default downward movement if no player target
            this.body.velocity.y = this.speed * 0.5;
            return;
        }
        
        // Execute movement pattern
        if (this.movementPattern === 'retreat') {
            this.moveRetreat(playerShip);
        } else {
            // Fall back to parent implementation for other patterns
            super.updateMovement(playerShip);
        }
    }
    
    /**
     * Override takeDamage to handle shield and visual effects
     */
    takeDamage(amount) {
        // If we have shield, damage that first
        if (this.hasShield && this.shieldHealth > 0) {
            this.shieldHealth -= amount;
            
            // Visual feedback
            this.shieldEffect.setFillStyle(0x3399ff, 0.6);
            this.scene.time.delayedCall(100, () => {
                if (this.shieldEffect && this.shieldEffect.active) {
                    this.shieldEffect.setFillStyle(0x3399ff, this.shieldHealth / this.maxShieldHealth * 0.3);
                }
            });
            
            // If shield is depleted, disable it
            if (this.shieldHealth <= 0) {
                this.shieldHealth = 0;
                this.shieldEffect.setAlpha(0);
            } else {
                // Shield absorbed all damage
                return;
            }
        }
        
        // Call parent method for health damage
        super.takeDamage(amount);
        
        // If health is low, try to spawn drones more frequently
        if (this.health < this.maxHealth * 0.5) {
            this.droneSpawnRate = 3000; // Faster spawning when damaged
        }
    }
    
    /**
     * Override destroy to clean up visual effects and drones
     */
    destroy() {
        // Clean up visual effects
        if (this.shieldEffect) {
            this.shieldEffect.destroy();
        }
        
        if (this.hangarBay) {
            this.hangarBay.destroy();
        }
        
        if (this.supportBeam) {
            this.supportBeam.destroy();
        }
        
        // Call parent destroy
        super.destroy();
    }
    
    /**
     * Override fireAtPlayer to use a spread attack
     */
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Fire a spread of 3 projectiles
        const spreadCount = 3;
        const spreadAngle = Math.PI / 12; // 15 degrees
        
        for (let i = 0; i < spreadCount; i++) {
            // Calculate spread angle
            const shotAngle = angle + (i - (spreadCount - 1) / 2) * spreadAngle;
            
            // Create projectile
            const laser = this.scene.enemyProjectiles.create(this.x, this.y, 'laser-red');
            
            // Calculate velocity based on angle
            const speed = 250;
            laser.setVelocity(
                Math.cos(shotAngle) * speed,
                Math.sin(shotAngle) * speed
            );
            
            // Rotate laser to face direction
            laser.rotation = shotAngle + Math.PI / 2;
            
            // Set damage
            laser.damage = 12;
            laser.setTint(0x3366cc);
            
            // Set projectile lifespan
            laser.lifespan = 2000;
            
            // Add to scene's updateList to handle lifespan
            this.scene.updateList.add(laser);
            
            // Add custom update method for lifespan
            laser.update = (time, delta) => {
                laser.lifespan -= delta;
                if (laser.lifespan <= 0) {
                    laser.destroy();
                }
            };
        }
        
        // Set cooldown
        this.canFire = false;
        this.scene.time.delayedCall(this.fireRate, () => {
            this.canFire = true;
        });
    }
}
