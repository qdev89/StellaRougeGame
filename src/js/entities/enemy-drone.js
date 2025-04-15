/**
 * Enemy Drone Class
 * Fast, weak enemy that moves in swarm patterns
 * Extends the base Enemy class
 */
class EnemyDrone extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the drone type
        super(scene, x, y, 'enemy-drone', 'DRONE');
        
        // Override default movement pattern
        this.movementPattern = 'swarm';
        
        // Set up drone-specific properties
        this.setScale(0.8); // Smaller size
        this.body.setSize(20, 20); // Smaller hitbox
        
        // Add drone-specific visual effects
        this.addDroneEffects();
    }
    
    addDroneEffects() {
        try {
            // Add engine glow
            this.engineGlow = this.scene.add.circle(this.x, this.y + 10, 5, 0x33aaff, 0.7);
            this.engineGlow.setDepth(this.depth - 1);
            
            // Pulse effect for engine glow
            this.scene.tweens.add({
                targets: this.engineGlow,
                alpha: 0.3,
                scale: 0.8,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        } catch (error) {
            console.warn('Could not create drone effects:', error);
        }
    }
    
    update(time, delta, playerShip) {
        // Call parent update method
        super.update(time, delta, playerShip);
        
        // Update engine glow position
        if (this.engineGlow && this.engineGlow.active) {
            this.engineGlow.setPosition(this.x, this.y + 10);
        }
    }
    
    // Override the fireAtPlayer method to use drone-specific attack pattern
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Drones fire a burst of 3 small shots
        for (let i = 0; i < 3; i++) {
            // Delay each shot in the burst
            this.scene.time.delayedCall(i * 100, () => {
                if (!this.active) return; // Skip if destroyed
                
                // Calculate angle to player with slight randomness
                const angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    playerShip.x, playerShip.y
                ) + Phaser.Math.FloatBetween(-0.2, 0.2); // Add some spread
                
                // Create projectile
                const laser = this.projectiles.create(this.x, this.y, 'laser-red');
                
                // Make drone shots smaller
                laser.setScale(0.7);
                
                // Calculate velocity based on angle
                const speed = 350; // Faster but weaker shots
                laser.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
                
                // Rotate laser to face direction
                laser.rotation = angle + Math.PI / 2;
                
                // Set damage (lower than default)
                laser.damage = 3;
                
                // Auto-destroy after lifespan
                this.scene.time.delayedCall(1500, () => {
                    if (laser.active) {
                        laser.destroy();
                    }
                });
            });
        }
        
        // Set fire rate cooldown (longer due to burst fire)
        this.canFire = false;
        this.scene.time.delayedCall(this.fireRate, () => {
            this.canFire = true;
        });
    }
    
    die() {
        // Clean up engine glow
        if (this.engineGlow && this.engineGlow.active) {
            this.engineGlow.destroy();
        }
        
        // Call parent die method
        super.die();
    }
}
