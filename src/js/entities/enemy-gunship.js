/**
 * Enemy Gunship Class
 * Medium enemy that strafes and fires more powerful shots
 * Extends the base Enemy class
 */
class EnemyGunship extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the gunship type
        super(scene, x, y, 'enemy-gunship', 'GUNSHIP');
        
        // Override default movement pattern
        this.movementPattern = 'strafe';
        
        // Set up gunship-specific properties
        this.setScale(1.2); // Larger size
        this.body.setSize(32, 32); // Larger hitbox
        
        // Add gunship-specific visual effects
        this.addGunshipEffects();
    }
    
    addGunshipEffects() {
        try {
            // Add engine glow
            this.engineGlow = this.scene.add.circle(this.x, this.y + 15, 8, 0xff3300, 0.7);
            this.engineGlow.setDepth(this.depth - 1);
            
            // Pulse effect for engine glow
            this.scene.tweens.add({
                targets: this.engineGlow,
                alpha: 0.5,
                scale: 0.9,
                duration: 600,
                yoyo: true,
                repeat: -1
            });
            
            // Add weapon charge indicators
            this.leftWeapon = this.scene.add.circle(this.x - 15, this.y, 3, 0xff0000, 0.8);
            this.rightWeapon = this.scene.add.circle(this.x + 15, this.y, 3, 0xff0000, 0.8);
            
            this.leftWeapon.setDepth(this.depth + 1);
            this.rightWeapon.setDepth(this.depth + 1);
        } catch (error) {
            console.warn('Could not create gunship effects:', error);
        }
    }
    
    update(time, delta, playerShip) {
        // Call parent update method
        super.update(time, delta, playerShip);
        
        // Update effect positions
        if (this.engineGlow && this.engineGlow.active) {
            this.engineGlow.setPosition(this.x, this.y + 15);
        }
        
        if (this.leftWeapon && this.leftWeapon.active) {
            this.leftWeapon.setPosition(this.x - 15, this.y);
        }
        
        if (this.rightWeapon && this.rightWeapon.active) {
            this.rightWeapon.setPosition(this.x + 15, this.y);
        }
    }
    
    // Override the fireAtPlayer method to use gunship-specific attack pattern
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Gunships fire from both weapon mounts
        const fireWeapon = (offsetX) => {
            // Calculate angle to player
            const angle = Phaser.Math.Angle.Between(
                this.x + offsetX, this.y,
                playerShip.x, playerShip.y
            );
            
            // Create projectile
            const laser = this.projectiles.create(this.x + offsetX, this.y, 'laser-red');
            
            // Make gunship shots larger
            laser.setScale(1.3);
            
            // Calculate velocity based on angle
            const speed = 300;
            laser.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            // Rotate laser to face direction
            laser.rotation = angle + Math.PI / 2;
            
            // Set damage (higher than default)
            laser.damage = 15;
            
            // Auto-destroy after lifespan
            this.scene.time.delayedCall(2000, () => {
                if (laser.active) {
                    laser.destroy();
                }
            });
            
            // Flash weapon indicator
            const indicator = offsetX < 0 ? this.leftWeapon : this.rightWeapon;
            if (indicator && indicator.active) {
                this.scene.tweens.add({
                    targets: indicator,
                    alpha: 1,
                    scale: 2,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        indicator.alpha = 0.8;
                        indicator.scale = 1;
                    }
                });
            }
        };
        
        // Fire from left weapon
        fireWeapon(-15);
        
        // Fire from right weapon after a short delay
        this.scene.time.delayedCall(200, () => {
            if (this.active) {
                fireWeapon(15);
            }
        });
        
        // Set fire rate cooldown
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
        
        if (this.leftWeapon && this.leftWeapon.active) {
            this.leftWeapon.destroy();
        }
        
        if (this.rightWeapon && this.rightWeapon.active) {
            this.rightWeapon.destroy();
        }
        
        // Call parent die method
        super.die();
    }
}
