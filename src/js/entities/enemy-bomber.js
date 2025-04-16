/**
 * Enemy Bomber Class
 * Slow enemy that drops explosive bombs that create area damage
 * Extends the base Enemy class
 */
class EnemyBomber extends Enemy {
    constructor(scene, x, y) {
        // Call parent constructor with the bomber type
        super(scene, x, y, 'enemy-gunship', 'BOMBER');
        
        // Override default movement pattern
        this.movementPattern = 'hover';
        
        // Set up bomber-specific properties
        this.setScale(1.3); // Larger size
        this.body.setSize(36, 36); // Larger hitbox
        
        // Add bomber-specific visual effects
        this.addBomberEffects();
        
        // Set a dark red tint to distinguish from regular gunships
        this.setTint(0xcc3333);
        
        // Bomber drops bombs instead of firing lasers
        this.bombDamage = 25;
        this.bombRadius = 100;
        this.bombSpeed = 150;
    }
    
    /**
     * Add visual effects specific to bombers
     */
    addBomberEffects() {
        // Add engine particles
        if (this.scene.particles) {
            this.engineEmitter = this.scene.particles.createEmitter({
                frame: 'red',
                speed: { min: 30, max: 60 },
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD',
                lifespan: 300
            });
            
            this.engineEmitter.startFollow(this, 0, 15);
        }
    }
    
    /**
     * Bomber movement pattern - hovers above the player
     */
    moveHover(playerShip) {
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
        
        // Try to maintain position above the player
        const targetX = playerShip.x;
        const targetY = playerShip.y - 200; // Stay above the player
        
        // Calculate angle to target position
        const targetAngle = Phaser.Math.Angle.Between(
            this.x, this.y,
            targetX, targetY
        );
        
        // Set velocity based on target position
        const moveSpeed = distance > 300 ? this.speed * 1.5 : this.speed;
        this.body.velocity.x = Math.cos(targetAngle) * moveSpeed;
        this.body.velocity.y = Math.sin(targetAngle) * moveSpeed;
        
        // If very close to target position, slow down
        if (distance < 50) {
            this.body.velocity.x *= 0.5;
            this.body.velocity.y *= 0.5;
        }
    }
    
    /**
     * Override updateMovement to add the hover pattern
     */
    updateMovement(playerShip) {
        if (!playerShip || !playerShip.active) {
            // Default downward movement if no player target
            this.body.velocity.y = this.speed;
            return;
        }
        
        // Execute movement pattern
        if (this.movementPattern === 'hover') {
            this.moveHover(playerShip);
        } else {
            // Fall back to parent implementation for other patterns
            super.updateMovement(playerShip);
        }
    }
    
    /**
     * Override fireAtPlayer to drop bombs
     */
    fireAtPlayer(playerShip) {
        if (!this.canFire) return;
        
        // Create bomb projectile
        const bomb = this.scene.enemyProjectiles.create(this.x, this.y + 20, 'powerup-weapon');
        
        // Set bomb properties
        bomb.setTint(0xff0000);
        bomb.setScale(1.2);
        bomb.setCircle(10);
        bomb.damage = this.bombDamage;
        bomb.isBomb = true;
        bomb.bombRadius = this.bombRadius;
        
        // Set velocity (bombs fall straight down with slight tracking)
        const targetX = playerShip.x;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, this.y + 400);
        
        bomb.setVelocity(
            Math.cos(angle) * this.bombSpeed,
            this.bombSpeed
        );
        
        // Add bomb-specific properties
        bomb.lifespan = 5000; // Longer lifespan than regular projectiles
        bomb.detonateOnImpact = true;
        
        // Add to scene's updateList to handle lifespan
        this.scene.updateList.add(bomb);
        
        // Add custom update method for lifespan and detonation
        bomb.update = (time, delta) => {
            bomb.lifespan -= delta;
            
            // Detonate if lifespan expires
            if (bomb.lifespan <= 0) {
                this.detonateBomb(bomb);
            }
            
            // Make bomb rotate for visual effect
            bomb.rotation += 0.05;
        };
        
        // Set cooldown
        this.canFire = false;
        this.scene.time.delayedCall(this.fireRate, () => {
            this.canFire = true;
        });
    }
    
    /**
     * Detonate a bomb with area damage
     */
    detonateBomb(bomb) {
        if (!bomb || !bomb.active) return;
        
        // Create explosion effect
        const explosion = this.scene.add.sprite(bomb.x, bomb.y, 'explosion');
        explosion.setScale(2);
        
        // Play explosion animation if it exists
        if (this.scene.anims.exists('explosion-anim')) {
            explosion.play('explosion-anim');
        } else {
            // Fallback explosion effect
            this.scene.tweens.add({
                targets: explosion,
                alpha: 0,
                scale: 3,
                duration: 500,
                onComplete: () => {
                    explosion.destroy();
                }
            });
        }
        
        // Check for player in blast radius
        if (this.scene.player && this.scene.player.active) {
            const distance = Phaser.Math.Distance.Between(
                bomb.x, bomb.y,
                this.scene.player.x, this.scene.player.y
            );
            
            if (distance <= bomb.bombRadius) {
                // Calculate damage based on distance (more damage closer to center)
                const damageMultiplier = 1 - (distance / bomb.bombRadius);
                const damage = Math.floor(bomb.damage * damageMultiplier);
                
                // Apply damage to player
                this.scene.player.takeDamage(damage);
                
                // Apply knockback effect
                const angle = Phaser.Math.Angle.Between(
                    bomb.x, bomb.y,
                    this.scene.player.x, this.scene.player.y
                );
                
                const knockbackForce = 200 * damageMultiplier;
                this.scene.player.body.velocity.x += Math.cos(angle) * knockbackForce;
                this.scene.player.body.velocity.y += Math.sin(angle) * knockbackForce;
            }
        }
        
        // Destroy the bomb
        bomb.destroy();
    }
    
    /**
     * Override takeDamage to handle bomb detonation on death
     */
    takeDamage(amount) {
        // Call parent method
        super.takeDamage(amount);
        
        // If health is depleted, create a final explosion
        if (this.health <= 0 && this.active) {
            // Create a bomb at the current position
            const finalBomb = {
                x: this.x,
                y: this.y,
                active: true,
                bombRadius: this.bombRadius * 1.5, // Larger radius for death explosion
                damage: this.bombDamage * 1.5 // More damage for death explosion
            };
            
            // Detonate the final bomb
            this.detonateBomb(finalBomb);
        }
    }
}
