/**
 * Stealth Hunter Mini-Boss
 * A fast, stealthy mini-boss that can cloak and ambush
 * Extends the MiniBoss class
 */
class StealthHunter extends MiniBoss {
    constructor(scene, x, y) {
        // Call parent constructor with the stealth hunter type
        super(scene, x, y, 'enemy-stealth', 'STEALTH_HUNTER');
        
        // Set up stealth hunter specific properties
        this.isCloaked = false;
        this.cloakDuration = 4000; // ms
        this.cloakCooldown = 6000; // ms
        this.lastCloakTime = 0;
        this.cloakAlpha = 0.2; // Visibility when cloaked
        
        // Ambush properties
        this.ambushSpeed = 350;
        this.ambushCooldown = 5000; // ms
        this.lastAmbushTime = 0;
        this.isAmbushing = false;
        
        // Create stealth hunter specific visual effects
        this.createStealthHunterEffects();
    }
    
    /**
     * Create visual effects specific to the stealth hunter
     */
    createStealthHunterEffects() {
        // Add stealth field effect
        this.stealthField = this.scene.add.ellipse(this.x, this.y, 70, 70, 0x9933cc, 0.2);
        this.stealthField.setDepth(this.depth - 1);
        
        // Add particle effect
        if (this.scene.particles) {
            this.stealthEmitter = this.scene.particles.createEmitter({
                frame: 'blue',
                speed: { min: 10, max: 30 },
                scale: { start: 0.1, end: 0 },
                blendMode: 'ADD',
                lifespan: 200,
                frequency: 50, // Less frequent particles
                tint: 0x9933cc
            });
            
            this.stealthEmitter.startFollow(this);
        }
    }
    
    /**
     * Update method for phase 1
     */
    updatePhase1(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update stealth field position
        if (this.stealthField) {
            this.stealthField.x = this.x;
            this.stealthField.y = this.y;
            
            // Update stealth field opacity based on cloaked state
            this.stealthField.setAlpha(this.isCloaked ? 0.4 : 0.2);
        }
        
        // Handle cloaking
        this.updateCloaking(time, playerShip);
        
        // In phase 1, use regular shots when not cloaked
        if (this.canFire && !this.isCloaked && !this.isAmbushing) {
            // Fire regular shots
            this.fireRegularShot(playerShip);
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate, () => {
                this.canFire = true;
            });
        }
        
        // If not ambushing or cloaked, move in a strafing pattern
        if (!this.isAmbushing && !this.isCloaked) {
            const angle = Math.sin(time * 0.002) * Math.PI * 0.25;
            this.x += Math.cos(angle) * 2;
            this.y += Math.sin(angle) * 1;
        }
    }
    
    /**
     * Update method for phase 2
     */
    updatePhase2(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update stealth field position
        if (this.stealthField) {
            this.stealthField.x = this.x;
            this.stealthField.y = this.y;
            
            // Update stealth field opacity based on cloaked state
            this.stealthField.setAlpha(this.isCloaked ? 0.5 : 0.3);
            
            // Make field pulse in phase 2
            const pulseScale = 1 + Math.sin(time * 0.005) * 0.1;
            this.stealthField.setScale(pulseScale);
        }
        
        // Handle cloaking (more frequent in phase 2)
        this.updateCloaking(time, playerShip, true);
        
        // In phase 2, use spread shots when not cloaked
        if (this.canFire && !this.isCloaked && !this.isAmbushing) {
            // Fire spread shots
            this.fireSpreadShot(0, 3, 30);
            this.fireSpreadShot(1, 3, 30);
            this.fireSpreadShot(2, 3, 30);
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate * 0.8, () => {
                this.canFire = true;
            });
        }
        
        // If not ambushing or cloaked, move more aggressively
        if (!this.isAmbushing && !this.isCloaked) {
            const angle = Math.sin(time * 0.003) * Math.PI * 0.3;
            this.x += Math.cos(angle) * 3;
            this.y += Math.sin(angle) * 2;
        }
    }
    
    /**
     * Update cloaking state
     */
    updateCloaking(time, playerShip, isPhase2 = false) {
        // Calculate distance to player
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // If not cloaked and cooldown has expired, consider cloaking
        if (!this.isCloaked && time - this.lastCloakTime > (isPhase2 ? this.cloakCooldown * 0.7 : this.cloakCooldown)) {
            // Cloak if far enough from player
            if (distance > 200) {
                this.cloak();
                this.lastCloakTime = time;
            }
        }
        
        // If cloaked and close to player, consider ambushing
        if (this.isCloaked && distance < 150 && time - this.lastAmbushTime > this.ambushCooldown) {
            this.uncloak();
            this.ambush(playerShip);
            this.lastAmbushTime = time;
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
        // Set ambushing state
        this.isAmbushing = true;
        
        // Visual indicator for ambush
        this.setTint(0xff00ff);
        
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Burst of speed toward player
        this.body.velocity.x = Math.cos(angle) * this.ambushSpeed;
        this.body.velocity.y = Math.sin(angle) * this.ambushSpeed;
        
        // Fire immediately
        this.fireAmbushAttack(playerShip);
        
        // Create trail effect
        if (this.scene.particles) {
            const trailEmitter = this.scene.particles.createEmitter({
                frame: 'blue',
                speed: { min: 10, max: 30 },
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD',
                lifespan: 500,
                quantity: 2,
                tint: 0xff00ff
            });
            
            trailEmitter.startFollow(this);
            
            // Stop trail after ambush
            this.scene.time.delayedCall(1000, () => {
                trailEmitter.stop();
            });
        }
        
        // End ambush after a delay
        this.scene.time.delayedCall(1000, () => {
            this.endAmbush();
        });
    }
    
    /**
     * End ambush attack
     */
    endAmbush() {
        // Reset ambushing state
        this.isAmbushing = false;
        
        // Reset tint
        this.setTint(0x9933cc);
        
        // Slow down
        this.body.velocity.x *= 0.2;
        this.body.velocity.y *= 0.2;
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
        laser.setTint(0x9933cc);
        
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
     * Fire ambush attack (spread of shots)
     */
    fireAmbushAttack(playerShip) {
        // Calculate angle to player
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            playerShip.x, playerShip.y
        );
        
        // Fire multiple shots in a spread
        const spreadCount = 5;
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
            laser.damage = 8;
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
        return super.takeDamage(amount);
    }
    
    /**
     * Override fireAtPlayer to use the stealth hunter's attack pattern
     */
    fireAtPlayer(playerShip) {
        // Don't use default firing behavior, we handle it in phase updates
    }
    
    /**
     * Override destroy to clean up effects
     */
    destroy() {
        // Clean up stealth field
        if (this.stealthField) {
            this.stealthField.destroy();
        }
        
        // Clean up stealth emitter
        if (this.stealthEmitter) {
            this.stealthEmitter.stop();
        }
        
        // Call parent destroy
        super.destroy();
    }
}
