/**
 * Enemy Stealth Class
 * Fast enemy that can cloak and ambush the player
 * Extends the base Enemy class
 */
class EnemyStealth extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the stealth type
        super(scene, x, y, 'enemy-drone', 'STEALTH');
        
        // Override default movement pattern
        this.movementPattern = 'ambush';
        
        // Set up stealth-specific properties
        this.setScale(1.0); // Standard size
        this.body.setSize(24, 24); // Standard hitbox
        
        // Add stealth-specific visual effects
        this.addStealthEffects();
        
        // Stealth properties
        this.isCloaked = false;
        this.cloakDuration = 3000; // ms
        this.cloakCooldown = 5000; // ms
        this.lastCloakTime = 0;
        this.cloakAlpha = 0.3; // Visibility when cloaked
        this.ambushDistance = 150; // Distance to trigger ambush
        
        // Set a purple tint to distinguish from regular drones
        this.setTint(0x9933cc);
    }
    
    /**
     * Add visual effects specific to stealth ships
     */
    addStealthEffects() {
        // Add subtle particle effect
        if (this.scene.particles) {
            this.stealthEmitter = this.scene.particles.createEmitter({
                frame: 'blue',
                speed: { min: 10, max: 30 },
                scale: { start: 0.1, end: 0 },
                blendMode: 'ADD',
                lifespan: 200,
                frequency: 50 // Less frequent particles
            });
            
            this.stealthEmitter.startFollow(this);
        }
    }
    
    /**
     * Stealth-specific update logic
     */
    update(time, delta, playerShip) {
        if (!this.active) return;
        
        // Call parent update
        super.update(time, delta, playerShip);
        
        // Handle cloaking
        this.updateCloaking(time, playerShip);
    }
    
    /**
     * Update cloaking state
     */
    updateCloaking(time, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // If not cloaked and cooldown has expired, consider cloaking
        if (!this.isCloaked && time - this.lastCloakTime > this.cloakCooldown) {
            // Cloak if far enough from player
            if (distance > 300) {
                this.cloak();
                this.lastCloakTime = time;
            }
        }
        
        // If cloaked and close to player, uncloak and ambush
        if (this.isCloaked && distance < this.ambushDistance) {
            this.uncloak();
            this.ambush(playerShip);
        }
    }
    
    /**
     * Activate cloaking
     */
    cloak() {
        this.isCloaked = true;
        
        // Visual effect - fade out
        this.scene.tweens.add({
            targets: this,
            alpha: this.cloakAlpha,
            duration: 500,
            ease: 'Power2'
        });
        
        // Increase speed while cloaked
        this.speed *= 1.3;
        
        // Set timer to automatically uncloak
        this.scene.time.delayedCall(this.cloakDuration, () => {
            if (this.active && this.isCloaked) {
                this.uncloak();
            }
        });
    }
    
    /**
     * Deactivate cloaking
     */
    uncloak() {
        this.isCloaked = false;
        
        // Visual effect - fade in
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // Reset speed
        this.speed = this.settings.SPEED;
    }
    
    /**
     * Perform ambush attack
     */
    ambush(playerShip) {
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Burst of speed toward player
        this.body.velocity.x = Math.cos(angle) * (this.speed * 2);
        this.body.velocity.y = Math.sin(angle) * (this.speed * 2);
        
        // Fire immediately
        this.fireAtPlayer(playerShip);
        
        // Visual effect - flash
        this.setTint(0xff00ff);
        this.scene.time.delayedCall(300, () => {
            if (this.active) {
                this.setTint(0x9933cc);
            }
        });
    }
    
    /**
     * Stealth movement pattern - circles around until ready to ambush
     */
    moveAmbush(playerShip) {
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
        
        if (this.isCloaked) {
            // When cloaked, circle around to get behind player
            const circleAngle = angle + Math.PI / 2; // 90 degrees to side
            
            // Move in circle pattern
            this.body.velocity.x = Math.cos(circleAngle) * this.speed;
            this.body.velocity.y = Math.sin(circleAngle) * this.speed;
            
            // Add slight movement toward player
            this.body.velocity.x += Math.cos(angle) * (this.speed * 0.2);
            this.body.velocity.y += Math.sin(angle) * (this.speed * 0.2);
        } else {
            // When uncloaked, move directly toward player if close, otherwise strafe
            if (distance < 150) {
                // Direct approach
                this.body.velocity.x = Math.cos(angle) * this.speed;
                this.body.velocity.y = Math.sin(angle) * this.speed;
            } else {
                // Strafe side to side
                const strafeAngle = angle + Math.sin(this.scene.time.now * 0.002) * Math.PI / 2;
                this.body.velocity.x = Math.cos(strafeAngle) * this.speed;
                this.body.velocity.y = Math.sin(strafeAngle) * this.speed;
            }
        }
    }
    
    /**
     * Override updateMovement to add the ambush pattern
     */
    updateMovement(playerShip) {
        if (!playerShip || !playerShip.active) {
            // Default downward movement if no player target
            this.body.velocity.y = this.speed;
            return;
        }
        
        // Execute movement pattern
        if (this.movementPattern === 'ambush') {
            this.moveAmbush(playerShip);
        } else {
            // Fall back to parent implementation for other patterns
            super.updateMovement(playerShip);
        }
    }
    
    /**
     * Override fireAtPlayer to use special attack when uncloaking
     */
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // If just uncloaked, fire a spread of shots
        if (!this.isCloaked && this.alpha < 1) {
            // Fire multiple shots in a spread
            const spreadCount = 3;
            const spreadAngle = Math.PI / 8; // 22.5 degrees
            
            for (let i = 0; i < spreadCount; i++) {
                // Calculate spread angle
                const shotAngle = angle + (i - (spreadCount - 1) / 2) * spreadAngle;
                
                // Create projectile
                const laser = this.scene.enemyProjectiles.create(this.x, this.y, 'laser-red');
                
                // Calculate velocity based on angle
                const speed = 320;
                laser.setVelocity(
                    Math.cos(shotAngle) * speed,
                    Math.sin(shotAngle) * speed
                );
                
                // Rotate laser to face direction
                laser.rotation = shotAngle + Math.PI / 2;
                
                // Set damage
                laser.damage = 7;
                laser.setTint(0xff00ff);
                
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
        } else {
            // Regular single shot
            const laser = this.scene.enemyProjectiles.create(this.x, this.y, 'laser-red');
            
            // Calculate velocity based on angle
            const speed = 300;
            laser.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            // Rotate laser to face direction
            laser.rotation = angle + Math.PI / 2;
            
            // Set damage
            laser.damage = 10;
            laser.setTint(0x9933cc);
            
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
     * Override takeDamage to uncloak when hit
     */
    takeDamage(amount) {
        // Uncloak if hit while cloaked
        if (this.isCloaked) {
            this.uncloak();
        }
        
        // Call parent method
        super.takeDamage(amount);
    }
}
