/**
 * Enemy Interceptor Class
 * Fast, agile enemy that intercepts the player with quick attacks
 * Extends the base Enemy class
 */
class EnemyInterceptor extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the interceptor type
        super(scene, x, y, 'enemy-drone', 'INTERCEPTOR');
        
        // Override default movement pattern
        this.movementPattern = 'intercept';
        
        // Set up interceptor-specific properties
        this.setScale(0.9); // Slightly smaller than standard
        this.body.setSize(22, 22); // Smaller hitbox
        
        // Add interceptor-specific visual effects
        this.addInterceptorEffects();
        
        // Interceptors have a dash ability
        this.canDash = true;
        this.dashCooldown = 3000; // ms
        this.dashSpeed = 400;
        this.dashDuration = 500; // ms
        this.lastDashTime = 0;
        
        // Set a blue tint to distinguish from regular drones
        this.setTint(0x3399ff);
    }
    
    /**
     * Add visual effects specific to interceptors
     */
    addInterceptorEffects() {
        // Add engine particles
        if (this.scene.particles) {
            this.engineEmitter = this.scene.particles.createEmitter({
                frame: 'blue',
                speed: { min: 50, max: 100 },
                scale: { start: 0.2, end: 0 },
                blendMode: 'ADD',
                lifespan: 200
            });
            
            this.engineEmitter.startFollow(this, 0, 10);
        }
    }
    
    /**
     * Interceptor-specific update logic
     */
    update(time, delta, playerShip) {
        if (!this.active) return;
        
        // Call parent update
        super.update(time, delta, playerShip);
        
        // Check if we should dash
        if (playerShip && playerShip.active && this.canDash && time - this.lastDashTime > this.dashCooldown) {
            // Calculate distance to player
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                playerShip.x, playerShip.y
            );
            
            // Dash if within range but not too close
            if (distance < 300 && distance > 100) {
                this.dash(playerShip);
                this.lastDashTime = time;
            }
        }
    }
    
    /**
     * Dash toward the player
     */
    dash(playerShip) {
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Set velocity for dash
        this.body.velocity.x = Math.cos(angle) * this.dashSpeed;
        this.body.velocity.y = Math.sin(angle) * this.dashSpeed;
        
        // Visual effect for dash
        this.setTint(0x66ffff);
        
        // Reset after dash duration
        this.scene.time.delayedCall(this.dashDuration, () => {
            if (this.active) {
                this.setTint(0x3399ff);
            }
        });
    }
    
    /**
     * Interceptor movement pattern - quickly moves to intercept player
     */
    moveIntercept(playerShip) {
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Predict player's position based on their velocity
        const predictX = playerShip.x + playerShip.body.velocity.x * 0.5;
        const predictY = playerShip.y + playerShip.body.velocity.y * 0.5;
        
        // Calculate angle to predicted position
        const predictAngle = Phaser.Math.Angle.Between(
            this.x, this.y,
            predictX, predictY
        );
        
        // Use prediction angle for movement
        this.body.velocity.x = Math.cos(predictAngle) * this.speed;
        this.body.velocity.y = Math.sin(predictAngle) * this.speed;
        
        // If too close, maintain some distance
        if (distance < 100) {
            this.body.velocity.x = Math.cos(angle + Math.PI) * (this.speed * 0.5);
            this.body.velocity.y = Math.sin(angle + Math.PI) * (this.speed * 0.5);
        }
    }
    
    /**
     * Override updateMovement to add the intercept pattern
     */
    updateMovement(playerShip) {
        if (!playerShip || !playerShip.active) {
            // Default downward movement if no player target
            this.body.velocity.y = this.speed;
            return;
        }
        
        // Execute movement pattern
        if (this.movementPattern === 'intercept') {
            this.moveIntercept(playerShip);
        } else {
            // Fall back to parent implementation for other patterns
            super.updateMovement(playerShip);
        }
    }
    
    /**
     * Override fireAtPlayer to use rapid-fire shots
     */
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Create projectile
        const laser = this.scene.enemyProjectiles.create(this.x, this.y, 'laser-red');
        
        // Calculate velocity based on angle
        const speed = 350; // Faster projectiles
        laser.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Rotate laser to face direction
        laser.rotation = angle + Math.PI / 2;
        
        // Set damage
        laser.damage = 8;
        laser.setScale(0.8); // Smaller projectiles
        
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
        
        // Set cooldown
        this.canFire = false;
        this.scene.time.delayedCall(this.fireRate, () => {
            this.canFire = true;
        });
    }
}
