/**
 * Bomber Chief Mini-Boss
 * A mini-boss that specializes in area damage with bombs and mines
 * Extends the MiniBoss class
 */
class BomberChief extends MiniBoss {
    constructor(scene, x, y) {
        // Call parent constructor with the bomber chief type
        super(scene, x, y, 'enemy-bomber', 'BOMBER_CHIEF');
        
        // Set up bomber chief specific properties
        this.bombDamage = 30;
        this.bombRadius = 120;
        this.bombSpeed = 180;
        
        // Mine properties
        this.mineDeployRate = 4000; // ms between mine deployments
        this.lastMineTime = 0;
        this.activeMines = [];
        this.maxMines = 4;
        
        // Create bomber chief specific visual effects
        this.createBomberChiefEffects();
    }
    
    /**
     * Create visual effects specific to the bomber chief
     */
    createBomberChiefEffects() {
        // Add bomb bay
        this.bombBay = this.scene.add.rectangle(this.x, this.y + 20, 20, 10, 0x333333);
        this.bombBay.setDepth(this.depth - 1);
        
        // Add engine particles
        if (this.scene.particles) {
            this.engineEmitter = this.scene.particles.createEmitter({
                frame: 'red',
                speed: { min: 30, max: 60 },
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD',
                lifespan: 300,
                tint: 0xff9900
            });
            
            this.engineEmitter.startFollow(this, 0, 15);
        }
        
        // Add bomb glow
        this.bombGlow = this.scene.add.sprite(this.x, this.y + 20, 'particle-blue')
            .setScale(0.5)
            .setAlpha(0.7)
            .setTint(0xff9900)
            .setDepth(this.depth - 1);
        
        // Pulse effect for bomb glow
        this.scene.tweens.add({
            targets: this.bombGlow,
            scale: 0.7,
            alpha: 0.9,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Update method for phase 1
     */
    updatePhase1(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update visual effects positions
        this.updateEffectsPositions();
        
        // Deploy mines if needed
        if (time - this.lastMineTime > this.mineDeployRate && this.activeMines.length < this.maxMines) {
            this.deployMine();
            this.lastMineTime = time;
        }
        
        // Clean up destroyed mines from tracking array
        this.activeMines = this.activeMines.filter(mine => mine.active);
        
        // In phase 1, drop bombs
        if (this.canFire) {
            // Drop bombs
            this.dropBomb(playerShip);
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate, () => {
                this.canFire = true;
            });
        }
        
        // Move in a hovering pattern
        this.moveHover(playerShip, time);
    }
    
    /**
     * Update method for phase 2
     */
    updatePhase2(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update visual effects positions
        this.updateEffectsPositions();
        
        // Deploy mines more frequently in phase 2
        if (time - this.lastMineTime > this.mineDeployRate * 0.7 && this.activeMines.length < this.maxMines) {
            this.deployMine();
            this.lastMineTime = time;
        }
        
        // Clean up destroyed mines from tracking array
        this.activeMines = this.activeMines.filter(mine => mine.active);
        
        // In phase 2, drop cluster bombs
        if (this.canFire) {
            // Drop cluster bombs
            this.dropClusterBomb(playerShip);
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate * 0.8, () => {
                this.canFire = true;
            });
        }
        
        // Move more aggressively in phase 2
        this.moveHover(playerShip, time, true);
        
        // Make bomb glow more intense in phase 2
        if (this.bombGlow) {
            this.bombGlow.setTint(0xff5500);
            this.bombGlow.setScale(0.7 + Math.sin(time * 0.005) * 0.2);
        }
    }
    
    /**
     * Update positions of visual effects
     */
    updateEffectsPositions() {
        // Update bomb bay position
        if (this.bombBay) {
            this.bombBay.x = this.x;
            this.bombBay.y = this.y + 20;
        }
        
        // Update bomb glow position
        if (this.bombGlow) {
            this.bombGlow.x = this.x;
            this.bombGlow.y = this.y + 20;
        }
    }
    
    /**
     * Move in a hovering pattern above the player
     */
    moveHover(playerShip, time, isAggressive = false) {
        // Calculate target position above the player
        const targetX = playerShip.x;
        const targetY = playerShip.y - 200; // Stay above the player
        
        // Calculate angle to target position
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            targetX, targetY
        );
        
        // Calculate distance to target position
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            targetX, targetY
        );
        
        // Set velocity based on distance and phase
        const moveSpeed = isAggressive ? this.speed * 1.3 : this.speed;
        const speedMultiplier = distance > 100 ? 1 : distance / 100;
        
        this.body.velocity.x = Math.cos(angle) * moveSpeed * speedMultiplier;
        this.body.velocity.y = Math.sin(angle) * moveSpeed * speedMultiplier;
        
        // Add some side-to-side movement
        this.body.velocity.x += Math.sin(time * 0.002) * (isAggressive ? 2 : 1);
    }
    
    /**
     * Drop a bomb
     */
    dropBomb(playerShip) {
        // Flash bomb bay
        this.bombBay.setFillStyle(0xff9900);
        this.scene.time.delayedCall(200, () => {
            if (this.bombBay && this.bombBay.active) {
                this.bombBay.setFillStyle(0x333333);
            }
        });
        
        // Create bomb projectile
        const bomb = this.scene.enemyProjectiles.create(this.x, this.y + 20, 'powerup-weapon');
        
        // Set bomb properties
        bomb.setTint(0xff9900);
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
    }
    
    /**
     * Drop a cluster bomb that splits into multiple bombs
     */
    dropClusterBomb(playerShip) {
        // Flash bomb bay
        this.bombBay.setFillStyle(0xff5500);
        this.scene.time.delayedCall(200, () => {
            if (this.bombBay && this.bombBay.active) {
                this.bombBay.setFillStyle(0x333333);
            }
        });
        
        // Create cluster bomb projectile
        const clusterBomb = this.scene.enemyProjectiles.create(this.x, this.y + 20, 'powerup-weapon');
        
        // Set cluster bomb properties
        clusterBomb.setTint(0xff5500);
        clusterBomb.setScale(1.5);
        clusterBomb.setCircle(12);
        clusterBomb.damage = this.bombDamage * 0.5;
        clusterBomb.isBomb = true;
        clusterBomb.isCluster = true;
        clusterBomb.bombRadius = this.bombRadius * 0.7;
        
        // Set velocity (bombs fall straight down with slight tracking)
        const targetX = playerShip.x;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, this.y + 400);
        
        clusterBomb.setVelocity(
            Math.cos(angle) * this.bombSpeed,
            this.bombSpeed
        );
        
        // Add cluster bomb-specific properties
        clusterBomb.lifespan = 2000; // Shorter lifespan - splits earlier
        clusterBomb.splitOnExpire = true;
        
        // Add to scene's updateList to handle lifespan
        this.scene.updateList.add(clusterBomb);
        
        // Add custom update method for lifespan and splitting
        clusterBomb.update = (time, delta) => {
            clusterBomb.lifespan -= delta;
            
            // Split if lifespan expires
            if (clusterBomb.lifespan <= 0) {
                this.splitClusterBomb(clusterBomb);
            }
            
            // Make bomb rotate for visual effect
            clusterBomb.rotation += 0.05;
        };
    }
    
    /**
     * Split a cluster bomb into multiple smaller bombs
     */
    splitClusterBomb(clusterBomb) {
        if (!clusterBomb || !clusterBomb.active) return;
        
        // Create small explosion effect
        const explosion = this.scene.add.sprite(clusterBomb.x, clusterBomb.y, 'explosion');
        explosion.setScale(0.5);
        
        // Play explosion animation if it exists
        if (this.scene.anims.exists('explosion-anim')) {
            explosion.play('explosion-anim');
        } else {
            // Fallback explosion effect
            this.scene.tweens.add({
                targets: explosion,
                alpha: 0,
                scale: 1,
                duration: 300,
                onComplete: () => {
                    explosion.destroy();
                }
            });
        }
        
        // Create multiple smaller bombs
        const bombCount = 4;
        
        for (let i = 0; i < bombCount; i++) {
            // Calculate angle for this bomb (evenly spaced)
            const angle = (i / bombCount) * Math.PI * 2;
            
            // Create small bomb
            const smallBomb = this.scene.enemyProjectiles.create(clusterBomb.x, clusterBomb.y, 'powerup-weapon');
            
            // Set small bomb properties
            smallBomb.setTint(0xff3300);
            smallBomb.setScale(0.8);
            smallBomb.setCircle(8);
            smallBomb.damage = clusterBomb.damage * 0.7;
            smallBomb.isBomb = true;
            smallBomb.bombRadius = clusterBomb.bombRadius * 0.7;
            
            // Set velocity (spread out in different directions)
            const spreadSpeed = this.bombSpeed * 0.8;
            smallBomb.setVelocity(
                Math.cos(angle) * spreadSpeed * 0.5 + clusterBomb.body.velocity.x * 0.5,
                Math.sin(angle) * spreadSpeed * 0.5 + this.bombSpeed
            );
            
            // Add small bomb-specific properties
            smallBomb.lifespan = 3000;
            smallBomb.detonateOnImpact = true;
            
            // Add to scene's updateList to handle lifespan
            this.scene.updateList.add(smallBomb);
            
            // Add custom update method for lifespan and detonation
            smallBomb.update = (time, delta) => {
                smallBomb.lifespan -= delta;
                
                // Detonate if lifespan expires
                if (smallBomb.lifespan <= 0) {
                    this.detonateBomb(smallBomb);
                }
                
                // Make bomb rotate for visual effect
                smallBomb.rotation += 0.08;
            };
        }
        
        // Destroy the cluster bomb
        clusterBomb.destroy();
    }
    
    /**
     * Detonate a bomb with area damage
     */
    detonateBomb(bomb) {
        if (!bomb || !bomb.active) return;
        
        // Create explosion effect
        const explosion = this.scene.add.sprite(bomb.x, bomb.y, 'explosion');
        explosion.setScale(bomb.isCluster ? 1 : 2);
        
        // Play explosion animation if it exists
        if (this.scene.anims.exists('explosion-anim')) {
            explosion.play('explosion-anim');
        } else {
            // Fallback explosion effect
            this.scene.tweens.add({
                targets: explosion,
                alpha: 0,
                scale: explosion.scale * 1.5,
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
     * Deploy a mine
     */
    deployMine() {
        // Create mine at current position with slight offset
        const offsetX = Phaser.Math.Between(-30, 30);
        const mine = this.scene.enemyProjectiles.create(this.x + offsetX, this.y + 30, 'powerup-weapon');
        
        // Set mine properties
        mine.setTint(0xff3300);
        mine.setScale(1.0);
        mine.setCircle(10);
        mine.damage = this.bombDamage * 0.8;
        mine.isMine = true;
        mine.bombRadius = this.bombRadius * 0.8;
        
        // Mines don't move much
        mine.setVelocity(0, 20);
        
        // Add mine-specific properties
        mine.lifespan = 10000; // Long lifespan
        mine.armTime = 1000; // Time before mine is armed
        mine.isArmed = false;
        
        // Track this mine
        this.activeMines.push(mine);
        
        // Add to scene's updateList to handle lifespan
        this.scene.updateList.add(mine);
        
        // Add custom update method for lifespan and detonation
        mine.update = (time, delta) => {
            mine.lifespan -= delta;
            
            // Arm the mine after delay
            if (!mine.isArmed && mine.armTime > 0) {
                mine.armTime -= delta;
                if (mine.armTime <= 0) {
                    mine.isArmed = true;
                    
                    // Visual indicator for armed mine
                    this.scene.tweens.add({
                        targets: mine,
                        alpha: 0.5,
                        duration: 200,
                        yoyo: true,
                        repeat: 2
                    });
                }
            }
            
            // Check for proximity to player if armed
            if (mine.isArmed && this.scene.player && this.scene.player.active) {
                const distance = Phaser.Math.Distance.Between(
                    mine.x, mine.y,
                    this.scene.player.x, this.scene.player.y
                );
                
                // Detonate if player is close
                if (distance < mine.bombRadius * 0.7) {
                    this.detonateBomb(mine);
                    return;
                }
            }
            
            // Detonate if lifespan expires
            if (mine.lifespan <= 0) {
                this.detonateBomb(mine);
                return;
            }
            
            // Make mine pulse for visual effect
            mine.rotation += 0.02;
            
            // Pulse effect when armed
            if (mine.isArmed && Math.random() < 0.05) {
                mine.setTint(0xff9900);
                this.scene.time.delayedCall(100, () => {
                    if (mine.active) {
                        mine.setTint(0xff3300);
                    }
                });
            }
        };
    }
    
    /**
     * Override fireAtPlayer to use the bomber chief's attack pattern
     */
    fireAtPlayer(playerShip) {
        // Don't use default firing behavior, we handle it in phase updates
    }
    
    /**
     * Override destroy to clean up effects
     */
    destroy() {
        // Clean up bomb bay
        if (this.bombBay) {
            this.bombBay.destroy();
        }
        
        // Clean up bomb glow
        if (this.bombGlow) {
            this.bombGlow.destroy();
        }
        
        // Clean up engine emitter
        if (this.engineEmitter) {
            this.engineEmitter.stop();
        }
        
        // Detonate all active mines
        this.activeMines.forEach(mine => {
            if (mine && mine.active) {
                this.detonateBomb(mine);
            }
        });
        
        // Call parent destroy
        super.destroy();
    }
}
