/**
 * Enemy Turret Class
 * Stationary enemy that fires in multiple directions
 * Extends the base Enemy class
 */
class EnemyTurret extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the turret type
        super(scene, x, y, 'enemy-destroyer', 'TURRET');
        
        // Override default movement pattern
        this.movementPattern = 'stationary';
        
        // Set up turret-specific properties
        this.setScale(1.2); // Slightly smaller than destroyer
        this.body.setSize(40, 40); // Larger hitbox
        
        // Add turret-specific visual effects
        this.addTurretEffects();
        
        // Turret has a shield that regenerates
        this.hasShield = true;
        this.shieldHealth = 40;
        this.maxShieldHealth = 40;
        this.shieldRegenRate = 0.5; // Shield points per second
        this.shieldRegenDelay = 3000; // ms before shield starts regenerating
        this.lastDamageTime = 0;
        
        // Turret can fire in multiple directions
        this.fireDirections = 4; // Number of directions to fire
        this.rotationSpeed = 0.01; // Rotation speed in radians per frame
        this.currentRotation = 0;
        
        // Set a gray/metallic tint
        this.setTint(0x999999);
    }
    
    /**
     * Add visual effects specific to turrets
     */
    addTurretEffects() {
        // Create shield effect
        this.shieldEffect = this.scene.add.ellipse(this.x, this.y, 60, 60, 0x3399ff, 0.3);
        this.shieldEffect.setDepth(this.depth - 1);
        
        // Create turret base (separate sprite)
        this.base = this.scene.add.ellipse(this.x, this.y, 40, 40, 0x666666);
        this.base.setDepth(this.depth - 1);
        
        // Create gun barrels
        this.barrels = [];
        for (let i = 0; i < this.fireDirections; i++) {
            const angle = (i / this.fireDirections) * Math.PI * 2;
            const barrel = this.scene.add.rectangle(
                this.x + Math.cos(angle) * 25,
                this.y + Math.sin(angle) * 25,
                20, 8, 0x333333
            );
            barrel.rotation = angle;
            barrel.setDepth(this.depth);
            this.barrels.push(barrel);
        }
    }
    
    /**
     * Turret-specific update logic
     */
    update(time, delta, playerShip) {
        if (!this.active) return;
        
        // Update shield regeneration
        this.updateShield(time, delta);
        
        // Update visual effects
        this.updateEffects();
        
        // Rotate the turret
        this.currentRotation += this.rotationSpeed;
        this.setRotation(this.currentRotation);
        
        // Update barrel positions
        this.updateBarrels();
        
        // Attack if player is in range
        if (playerShip && playerShip.active && this.canFire) {
            this.fireAtPlayer(playerShip);
        }
    }
    
    /**
     * Update shield regeneration
     */
    updateShield(time, delta) {
        // Only regenerate if shield isn't full and enough time has passed since last damage
        if (this.hasShield && this.shieldHealth < this.maxShieldHealth && 
            time - this.lastDamageTime > this.shieldRegenDelay) {
            
            // Regenerate shield based on delta time
            this.shieldHealth += this.shieldRegenRate * (delta / 1000);
            
            // Cap at max shield
            if (this.shieldHealth > this.maxShieldHealth) {
                this.shieldHealth = this.maxShieldHealth;
            }
            
            // Update shield effect
            this.updateShieldEffect();
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
        }
        
        // Update base position
        if (this.base) {
            this.base.x = this.x;
            this.base.y = this.y;
        }
    }
    
    /**
     * Update barrel positions
     */
    updateBarrels() {
        for (let i = 0; i < this.barrels.length; i++) {
            const angle = this.currentRotation + (i / this.fireDirections) * Math.PI * 2;
            this.barrels[i].x = this.x + Math.cos(angle) * 25;
            this.barrels[i].y = this.y + Math.sin(angle) * 25;
            this.barrels[i].rotation = angle;
        }
    }
    
    /**
     * Update shield visual effect
     */
    updateShieldEffect() {
        if (!this.shieldEffect) return;
        
        // Update shield opacity based on health
        const opacity = (this.shieldHealth / this.maxShieldHealth) * 0.3;
        this.shieldEffect.setAlpha(opacity);
    }
    
    /**
     * Override takeDamage to handle shield and reset regen timer
     */
    takeDamage(amount) {
        this.lastDamageTime = this.scene.time.now;
        
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
    }
    
    /**
     * Override fireAtPlayer to fire in multiple directions
     */
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Fire in multiple directions
        for (let i = 0; i < this.fireDirections; i++) {
            // Calculate firing angle
            const angle = this.currentRotation + (i / this.fireDirections) * Math.PI * 2;
            
            // Get barrel position
            const barrelX = this.x + Math.cos(angle) * 25;
            const barrelY = this.y + Math.sin(angle) * 25;
            
            // Create projectile
            const laser = this.scene.enemyProjectiles.create(barrelX, barrelY, 'laser-red');
            
            // Calculate velocity based on angle
            const speed = 250;
            laser.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            // Rotate laser to face direction
            laser.rotation = angle + Math.PI / 2;
            
            // Set damage
            laser.damage = 15;
            
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
    
    /**
     * Override destroy to clean up visual effects
     */
    destroy() {
        // Clean up visual effects
        if (this.shieldEffect) {
            this.shieldEffect.destroy();
        }
        
        if (this.base) {
            this.base.destroy();
        }
        
        this.barrels.forEach(barrel => {
            barrel.destroy();
        });
        
        // Call parent destroy
        super.destroy();
    }
    
    /**
     * Turrets don't move, so override updateMovement to do nothing
     */
    updateMovement(playerShip) {
        // Turrets are stationary
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
    }
}
