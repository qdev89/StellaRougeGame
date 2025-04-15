/**
 * Enemy Destroyer Class
 * Heavy enemy that moves slowly but has powerful weapons
 * Extends the base Enemy class
 */
class EnemyDestroyer extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the destroyer type
        super(scene, x, y, 'enemy-destroyer', 'DESTROYER');
        
        // Override default movement pattern
        this.movementPattern = 'slow_approach';
        
        // Set up destroyer-specific properties
        this.setScale(1.5); // Larger size
        this.body.setSize(48, 48); // Larger hitbox
        
        // Add destroyer-specific visual effects
        this.addDestroyerEffects();
        
        // Destroyer has a shield that absorbs some damage
        this.hasShield = true;
        this.shieldHealth = 30;
        this.maxShieldHealth = 30;
    }
    
    addDestroyerEffects() {
        try {
            // Add engine glow
            this.engineGlow = this.scene.add.circle(this.x, this.y + 20, 12, 0xff6600, 0.7);
            this.engineGlow.setDepth(this.depth - 1);
            
            // Pulse effect for engine glow
            this.scene.tweens.add({
                targets: this.engineGlow,
                alpha: 0.4,
                scale: 0.8,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
            
            // Add shield effect
            this.shieldEffect = this.scene.add.circle(this.x, this.y, 50, 0x3399ff, 0.3);
            this.shieldEffect.setDepth(this.depth - 2);
        } catch (error) {
            console.warn('Could not create destroyer effects:', error);
        }
    }
    
    update(time, delta, playerShip) {
        // Call parent update method
        super.update(time, delta, playerShip);
        
        // Update effect positions
        if (this.engineGlow && this.engineGlow.active) {
            this.engineGlow.setPosition(this.x, this.y + 20);
        }
        
        if (this.shieldEffect && this.shieldEffect.active) {
            this.shieldEffect.setPosition(this.x, this.y);
            
            // Update shield visibility based on shield health
            if (this.hasShield) {
                const shieldAlpha = 0.1 + (this.shieldHealth / this.maxShieldHealth) * 0.3;
                this.shieldEffect.setAlpha(shieldAlpha);
            } else {
                this.shieldEffect.setAlpha(0);
            }
        }
    }
    
    // Override takeDamage to handle shields
    takeDamage(amount) {
        // If shield is active, reduce shield health first
        if (this.hasShield && this.shieldHealth > 0) {
            // Shields reduce damage by 50%
            const shieldDamage = amount * 0.5;
            
            // Apply damage to shield
            this.shieldHealth -= shieldDamage;
            
            // Flash shield effect
            if (this.shieldEffect && this.shieldEffect.active) {
                this.scene.tweens.add({
                    targets: this.shieldEffect,
                    alpha: 0.8,
                    duration: 50,
                    yoyo: true
                });
            }
            
            // Check if shield is depleted
            if (this.shieldHealth <= 0) {
                this.hasShield = false;
                
                // Shield break effect
                if (this.shieldEffect && this.shieldEffect.active) {
                    this.scene.tweens.add({
                        targets: this.shieldEffect,
                        alpha: 0.9,
                        scale: 1.5,
                        duration: 200,
                        onComplete: () => {
                            this.shieldEffect.setAlpha(0);
                        }
                    });
                }
                
                // Apply remaining damage to health
                return super.takeDamage(amount * 0.5);
            }
            
            // If shield absorbed all damage, still show hit effect but don't damage health
            this.scene.tweens.add({
                targets: this,
                alpha: 0.7,
                duration: 50,
                yoyo: true
            });
            
            return false;
        }
        
        // If no shield, take full damage
        return super.takeDamage(amount);
    }
    
    // Override the fireAtPlayer method to use destroyer-specific attack pattern
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Destroyers fire a powerful plasma bolt
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Create projectile
        const plasma = this.projectiles.create(this.x, this.y, 'plasma-bolt');
        
        // Make destroyer shots larger
        plasma.setScale(1.8);
        
        // Calculate velocity based on angle
        const speed = 250; // Slower but more powerful
        plasma.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Rotate plasma to face direction
        plasma.rotation = angle + Math.PI / 2;
        
        // Set damage (much higher than default)
        plasma.damage = 25;
        
        // Add glow effect to plasma bolt
        try {
            const glow = this.scene.add.circle(plasma.x, plasma.y, 15, 0xff9900, 0.5);
            glow.setDepth(plasma.depth - 1);
            
            // Update glow position with plasma bolt
            this.scene.time.addEvent({
                delay: 16,
                loop: true,
                callback: () => {
                    if (plasma.active && glow.active) {
                        glow.setPosition(plasma.x, plasma.y);
                    } else {
                        glow.destroy();
                    }
                }
            });
        } catch (error) {
            console.warn('Could not create plasma glow effect:', error);
        }
        
        // Auto-destroy after lifespan
        this.scene.time.delayedCall(3000, () => {
            if (plasma.active) {
                plasma.destroy();
            }
        });
        
        // Charge-up effect before firing
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            scale: 1.1,
            duration: 200,
            yoyo: true
        });
        
        // Set fire rate cooldown (longer for powerful shots)
        this.canFire = false;
        this.scene.time.delayedCall(this.fireRate, () => {
            this.canFire = true;
        });
    }
    
    die() {
        // Clean up effects
        if (this.engineGlow && this.engineGlow.active) {
            this.engineGlow.destroy();
        }
        
        if (this.shieldEffect && this.shieldEffect.active) {
            this.shieldEffect.destroy();
        }
        
        // Create a larger explosion for destroyers
        try {
            const bigExplosion = this.scene.add.circle(this.x, this.y, 60, 0xff9900, 0.8);
            
            this.scene.tweens.add({
                targets: bigExplosion,
                alpha: 0,
                scale: 3,
                duration: 1000,
                onComplete: () => {
                    bigExplosion.destroy();
                }
            });
        } catch (error) {
            console.warn('Could not create big explosion effect:', error);
        }
        
        // Call parent die method
        super.die();
    }
}
