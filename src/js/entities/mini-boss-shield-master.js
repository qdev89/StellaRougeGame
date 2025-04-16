/**
 * Shield Master Mini-Boss
 * A defensive mini-boss with powerful shields and burst attacks
 * Extends the MiniBoss class
 */
class ShieldMaster extends MiniBoss {
    constructor(scene, x, y) {
        // Call parent constructor with the shield master type
        super(scene, x, y, 'enemy-destroyer', 'SHIELD_MASTER');
        
        // Set up shield master specific properties
        this.hasShield = true;
        this.shieldHealth = 100;
        this.maxShieldHealth = 100;
        this.shieldRegenRate = 0.2; // Shield points per second
        this.shieldRegenDelay = 5000; // ms before shield starts regenerating
        this.lastDamageTime = 0;
        
        // Burst attack properties
        this.burstCooldown = 4000;
        this.lastBurstTime = 0;
        this.burstCount = 12; // Number of projectiles in burst
        this.burstDelay = 100; // ms between burst projectiles
        
        // Create shield master specific visual effects
        this.createShieldMasterEffects();
    }
    
    /**
     * Create visual effects specific to the shield master
     */
    createShieldMasterEffects() {
        // Create shield effect
        this.shieldEffect = this.scene.add.ellipse(this.x, this.y, 80, 80, 0x3399ff, 0.4);
        this.shieldEffect.setDepth(this.depth - 1);
        
        // Add shield generator visual
        this.shieldGenerator = this.scene.add.sprite(this.x, this.y - 20, 'powerup-shield')
            .setScale(0.8)
            .setTint(0x3399ff)
            .setDepth(this.depth + 1);
        
        // Pulse effect for shield generator
        this.scene.tweens.add({
            targets: this.shieldGenerator,
            scale: 1,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Update method for phase 1
     */
    updatePhase1(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update shield effect position
        if (this.shieldEffect) {
            this.shieldEffect.x = this.x;
            this.shieldEffect.y = this.y;
            
            // Update shield opacity based on health
            const opacity = (this.shieldHealth / this.maxShieldHealth) * 0.4;
            this.shieldEffect.setAlpha(opacity);
        }
        
        // Update shield generator position
        if (this.shieldGenerator) {
            this.shieldGenerator.x = this.x;
            this.shieldGenerator.y = this.y - 20;
        }
        
        // Regenerate shield if not recently damaged
        if (this.hasShield && this.shieldHealth < this.maxShieldHealth && 
            time - this.lastDamageTime > this.shieldRegenDelay) {
            
            this.shieldHealth += this.shieldRegenRate * (delta / 1000);
            if (this.shieldHealth > this.maxShieldHealth) {
                this.shieldHealth = this.maxShieldHealth;
            }
        }
        
        // In phase 1, use regular shots and occasional bursts
        if (this.canFire) {
            // Fire regular shots
            this.fireRegularShot(playerShip);
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate, () => {
                this.canFire = true;
            });
        }
        
        // Check if we should use burst attack
        if (time - this.lastBurstTime > this.burstCooldown) {
            this.fireBurstAttack(playerShip);
            this.lastBurstTime = time;
        }
        
        // Move in a defensive pattern
        this.x += Math.sin(time * 0.001) * 1;
        this.y += Math.cos(time * 0.0005) * 0.5;
    }
    
    /**
     * Update method for phase 2
     */
    updatePhase2(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update shield effect position
        if (this.shieldEffect) {
            this.shieldEffect.x = this.x;
            this.shieldEffect.y = this.y;
            
            // Update shield opacity based on health
            const opacity = (this.shieldHealth / this.maxShieldHealth) * 0.4;
            this.shieldEffect.setAlpha(opacity);
            
            // Make shield pulse in phase 2
            const pulseScale = 1 + Math.sin(time * 0.005) * 0.1;
            this.shieldEffect.setScale(pulseScale);
        }
        
        // Update shield generator position
        if (this.shieldGenerator) {
            this.shieldGenerator.x = this.x;
            this.shieldGenerator.y = this.y - 20;
            
            // Make generator more intense in phase 2
            this.shieldGenerator.setTint(0x00ffff);
        }
        
        // Regenerate shield faster in phase 2
        if (this.hasShield && this.shieldHealth < this.maxShieldHealth && 
            time - this.lastDamageTime > this.shieldRegenDelay * 0.7) {
            
            this.shieldHealth += (this.shieldRegenRate * 1.5) * (delta / 1000);
            if (this.shieldHealth > this.maxShieldHealth) {
                this.shieldHealth = this.maxShieldHealth;
            }
        }
        
        // In phase 2, use more aggressive shots and more frequent bursts
        if (this.canFire) {
            // Fire spread shots
            this.fireSpreadShot(0, 3, 30);
            this.fireSpreadShot(2, 3, 30);
            
            // Set cooldown (faster in phase 2)
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate * 0.8, () => {
                this.canFire = true;
            });
        }
        
        // Check if we should use burst attack (more frequent in phase 2)
        if (time - this.lastBurstTime > this.burstCooldown * 0.7) {
            this.fireBurstAttack(playerShip);
            this.lastBurstTime = time;
        }
        
        // Move more aggressively in phase 2
        this.x += Math.sin(time * 0.002) * 1.5;
        this.y += Math.cos(time * 0.001) * 1;
    }
    
    /**
     * Fire regular shots at the player
     */
    fireRegularShot(playerShip) {
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Create projectile
        const laser = this.scene.enemyProjectiles.create(this.x, this.y, 'laser-red');
        
        // Set velocity based on angle
        const speed = 300;
        laser.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Rotate to face direction
        laser.rotation = angle + Math.PI / 2;
        
        // Set damage
        laser.damage = 10;
        
        // Set tint
        laser.setTint(0x3399ff);
        
        // Set lifespan
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
    
    /**
     * Fire a burst of projectiles in all directions
     */
    fireBurstAttack(playerShip) {
        // Visual indicator for burst
        this.scene.tweens.add({
            targets: this.shieldEffect,
            alpha: 0.8,
            scale: 1.5,
            duration: 500,
            yoyo: true
        });
        
        // Fire projectiles in a burst pattern
        for (let i = 0; i < this.burstCount; i++) {
            // Add delay between each projectile
            this.scene.time.delayedCall(i * this.burstDelay, () => {
                if (!this.active) return;
                
                // Calculate angle for this projectile (evenly spaced around 360 degrees)
                const angle = (i / this.burstCount) * Math.PI * 2;
                
                // Create projectile
                const laser = this.scene.enemyProjectiles.create(this.x, this.y, 'laser-red');
                
                // Set velocity based on angle
                const speed = 250;
                laser.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                
                // Rotate to face direction
                laser.rotation = angle + Math.PI / 2;
                
                // Set damage
                laser.damage = 8;
                
                // Set tint
                laser.setTint(0x3399ff);
                
                // Set lifespan
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
            });
        }
    }
    
    /**
     * Override takeDamage to handle shield
     */
    takeDamage(amount) {
        this.lastDamageTime = this.scene.time.now;
        
        // If we have shield, damage that first
        if (this.hasShield && this.shieldHealth > 0) {
            this.shieldHealth -= amount;
            
            // Visual feedback
            if (this.shieldEffect) {
                this.shieldEffect.setFillStyle(0x3399ff, 0.8);
                this.scene.time.delayedCall(100, () => {
                    if (this.shieldEffect && this.shieldEffect.active) {
                        this.shieldEffect.setFillStyle(0x3399ff, this.shieldHealth / this.maxShieldHealth * 0.4);
                    }
                });
            }
            
            // If shield is depleted, disable it
            if (this.shieldHealth <= 0) {
                this.shieldHealth = 0;
                if (this.shieldEffect) {
                    this.shieldEffect.setAlpha(0);
                }
            } else {
                // Shield absorbed all damage
                return false;
            }
        }
        
        // Call parent method for health damage
        return super.takeDamage(amount);
    }
    
    /**
     * Override fireAtPlayer to use the shield master's attack pattern
     */
    fireAtPlayer(playerShip) {
        // Don't use default firing behavior, we handle it in phase updates
    }
    
    /**
     * Override destroy to clean up effects
     */
    destroy() {
        // Clean up shield effect
        if (this.shieldEffect) {
            this.shieldEffect.destroy();
        }
        
        // Clean up shield generator
        if (this.shieldGenerator) {
            this.shieldGenerator.destroy();
        }
        
        // Call parent destroy
        super.destroy();
    }
}
