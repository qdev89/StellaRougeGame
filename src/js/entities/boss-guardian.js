/**
 * Guardian Boss
 * First sector boss - a heavily armored defensive ship with shield generators
 * Extends the BossEnemy class
 */
class BossGuardian extends BossEnemy {
    constructor(scene, x, y) {
        // Configuration for the Guardian boss
        const guardianConfig = {
            health: CONSTANTS.ENEMIES.BOSSES.SCOUT_COMMANDER.HEALTH,
            score: CONSTANTS.ENEMIES.BOSSES.SCOUT_COMMANDER.SCORE,
            phaseThresholds: [0.75, 0.5, 0.25], // Phase transition points (% of health)
            phases: ['defensive', 'vulnerable', 'aggressive', 'desperate'],
            attackPatterns: ['spread', 'drones', 'beam', 'ramming'],
            rewards: [
                {
                    type: 'upgrade',
                    id: 'shield_amplifier',
                    name: 'Shield Amplifier',
                    description: 'Increases shield capacity by 25%',
                    rarity: 'rare'
                },
                {
                    type: 'credits',
                    value: 500
                },
                {
                    type: 'unlock',
                    id: 'scout_ship',
                    name: 'Scout Ship',
                    description: 'A fast, agile ship with lower health but higher speed'
                }
            ]
        };
        
        // Call parent constructor with guardian config
        super(scene, x, y, 'enemy-destroyer', guardianConfig);
        
        // Set up Guardian-specific properties
        this.name = 'The Guardian';
        this.description = 'A heavily armored defensive ship that protects the gateway to the next sector';
        
        // Set larger scale for the boss
        this.setScale(2.5);
        
        // Create shield generators
        this.shieldGenerators = [];
        this.createShieldGenerators();
        
        // Create weapon ports
        this.weaponPorts = [];
        this.createWeaponPorts();
    }
    
    /**
     * Create shield generators that orbit the boss
     */
    createShieldGenerators() {
        // Create 3 shield generators
        for (let i = 0; i < 3; i++) {
            // Create shield generator sprite
            const generator = this.scene.add.sprite(this.x, this.y, 'powerup-shield');
            generator.setScale(1.2);
            generator.setTint(0x33ccff);
            
            // Add to physics
            this.scene.physics.add.existing(generator);
            
            // Set properties
            generator.health = 50;
            generator.maxHealth = 50;
            generator.active = true;
            generator.angle = i * 120; // Distribute evenly around the boss
            generator.distance = 80; // Distance from boss center
            generator.rotationSpeed = 0.02; // Speed of orbit
            
            // Add to shield generators array
            this.shieldGenerators.push(generator);
            
            // Add to scene's updateList to ensure update is called
            this.scene.updateList.add(generator);
            
            // Add custom update method
            generator.update = () => {
                if (generator.active && this.active) {
                    // Orbit around the boss
                    generator.angle += generator.rotationSpeed;
                    generator.x = this.x + Math.cos(generator.angle) * generator.distance;
                    generator.y = this.y + Math.sin(generator.angle) * generator.distance;
                    
                    // Rotate the generator
                    generator.rotation += 0.01;
                }
            };
            
            // Method to damage the generator
            generator.takeDamage = (amount) => {
                generator.health -= amount;
                
                // Flash effect
                generator.setTint(0xff0000);
                this.scene.time.delayedCall(100, () => {
                    generator.clearTint();
                    generator.setTint(0x33ccff);
                });
                
                // Check if destroyed
                if (generator.health <= 0) {
                    this.destroyShieldGenerator(generator);
                }
            };
        }
    }
    
    /**
     * Create weapon ports on the boss
     */
    createWeaponPorts() {
        // Create 3 weapon ports (left, center, right)
        const portPositions = [
            { x: -40, y: 0 },  // Left
            { x: 0, y: -20 },   // Center
            { x: 40, y: 0 }    // Right
        ];
        
        for (let i = 0; i < portPositions.length; i++) {
            const port = {
                x: portPositions[i].x,
                y: portPositions[i].y,
                active: true,
                cooldown: 0,
                fireRate: 2000, // ms between shots
                lastFired: 0
            };
            
            this.weaponPorts.push(port);
        }
    }
    
    /**
     * Destroy a shield generator
     */
    destroyShieldGenerator(generator) {
        // Create explosion effect
        this.scene.add.sprite(generator.x, generator.y, 'explosion')
            .play('explosion-anim');
        
        // Disable the generator
        generator.active = false;
        generator.visible = false;
        generator.body.enable = false;
        
        // Check if all generators are destroyed
        const allDestroyed = this.shieldGenerators.every(gen => !gen.active);
        if (allDestroyed && this.currentPhase < 2) {
            // Force transition to phase 2 if all generators are destroyed
            this.transitionToPhase(2);
        }
    }
    
    /**
     * Fire a spread shot from the specified weapon port
     */
    fireSpreadShot(portIndex, count = 3, spreadAngle = 30) {
        const port = this.weaponPorts[portIndex];
        if (!port || !port.active) return;
        
        // Calculate port position in world space
        const portX = this.x + port.x;
        const portY = this.y + port.y;
        
        // Calculate base angle (down)
        const baseAngle = Math.PI / 2;
        
        // Convert spread angle to radians
        const spreadRad = Phaser.Math.DegToRad(spreadAngle);
        
        // Create projectiles
        for (let i = 0; i < count; i++) {
            // Calculate angle for this projectile
            const angle = baseAngle + spreadRad * (i / (count - 1) - 0.5);
            
            // Calculate velocity
            const vx = Math.cos(angle) * 300;
            const vy = Math.sin(angle) * 300;
            
            // Create projectile
            const projectile = this.scene.physics.add.sprite(portX, portY, 'laser-red');
            projectile.setVelocity(vx, vy);
            
            // Set properties
            projectile.damage = 10;
            projectile.lifespan = 2000;
            projectile.setScale(1.5);
            projectile.setDepth(CONSTANTS.GAME.PROJECTILE_Z_INDEX);
            
            // Add to scene's updateList
            this.scene.updateList.add(projectile);
            
            // Add custom update method for lifespan
            projectile.update = (time, delta) => {
                projectile.lifespan -= delta;
                if (projectile.lifespan <= 0) {
                    projectile.destroy();
                }
            };
            
            // Add to enemy projectiles group if it exists
            if (this.scene.enemyProjectiles) {
                this.scene.enemyProjectiles.add(projectile);
            }
        }
    }
    
    /**
     * Fire a concentrated beam attack
     */
    fireBeamAttack() {
        // Create beam effect
        const beam = this.scene.add.rectangle(
            this.x,
            this.y + 400,
            30,
            800,
            0xff3333
        );
        
        // Add glow effect
        beam.setAlpha(0.8);
        
        // Warning effect before beam fires
        this.scene.tweens.add({
            targets: beam,
            alpha: 0.2,
            yoyo: true,
            repeat: 3,
            duration: 200,
            onComplete: () => {
                // Full beam effect
                beam.setAlpha(1);
                
                // Add to physics
                this.scene.physics.add.existing(beam);
                
                // Set properties
                beam.damage = 30;
                beam.lifespan = 1000;
                
                // Add to enemy projectiles group if it exists
                if (this.scene.enemyProjectiles) {
                    this.scene.enemyProjectiles.add(beam);
                }
                
                // Add custom update method for lifespan
                beam.update = (time, delta) => {
                    beam.lifespan -= delta;
                    if (beam.lifespan <= 0) {
                        beam.destroy();
                    }
                };
                
                // Add to scene's updateList
                this.scene.updateList.add(beam);
            }
        });
    }
    
    /**
     * Update method called by the scene
     */
    update(time, delta) {
        // Call parent update method
        super.update(time, delta);
        
        // Update shield generators
        this.shieldGenerators.forEach(generator => {
            if (generator.active) {
                generator.update();
            }
        });
        
        // Check for phase transitions based on health
        this.checkPhaseTransition();
    }
    
    /**
     * Phase 1: Defensive stance with shield generators active
     */
    onPhase1Enter() {
        console.log('Guardian Phase 1: Defensive stance');
        
        // Activate shield generators
        this.shieldGenerators.forEach(generator => {
            generator.active = true;
            generator.visible = true;
            if (generator.body) generator.body.enable = true;
        });
        
        // Set movement pattern
        this.movementPattern = 'slow_horizontal';
    }
    
    onPhase1Update(delta) {
        // Move side to side slowly
        if (this.movementPattern === 'slow_horizontal') {
            this.x += Math.sin(this.scene.time.now * 0.001) * 1;
        }
        
        // Fire spread shots periodically
        if (this.scene.time.now % 2000 < 50) { // Every 2 seconds
            this.fireSpreadShot(1, 3, 30); // Center port, 3 projectiles, 30 degree spread
        }
    }
    
    /**
     * Phase 2: Shield generators vulnerable, deploys defensive drones
     */
    onPhase2Enter() {
        console.log('Guardian Phase 2: Vulnerable, deploying drones');
        
        // Make shield generators vulnerable
        this.shieldGenerators.forEach(generator => {
            if (generator.active) {
                generator.setTint(0xff6666); // Red tint to indicate vulnerability
            }
        });
        
        // Deploy defensive drones
        this.deployDrones(2);
        
        // Set movement pattern
        this.movementPattern = 'figure_eight';
    }
    
    onPhase2Update(delta) {
        // Move in a figure-8 pattern
        if (this.movementPattern === 'figure_eight') {
            const t = this.scene.time.now * 0.001;
            const centerX = this.scene.cameras.main.width / 2;
            const amplitude = 150;
            
            this.x = centerX + Math.sin(t) * amplitude;
            this.y = 150 + Math.sin(t * 2) * 50;
        }
        
        // Fire weapons periodically
        if (this.scene.time.now % 1500 < 50) { // Every 1.5 seconds
            this.fireSpreadShot(0, 2, 15); // Left port
            this.fireSpreadShot(2, 2, 15); // Right port
        }
    }
    
    /**
     * Phase 3: Rapid-fire mode with concentrated beam attacks
     */
    onPhase3Enter() {
        console.log('Guardian Phase 3: Rapid-fire mode');
        
        // Disable any remaining shield generators
        this.shieldGenerators.forEach(generator => {
            this.destroyShieldGenerator(generator);
        });
        
        // Set movement pattern
        this.movementPattern = 'aggressive';
        
        // Increase fire rate
        this.weaponPorts.forEach(port => {
            port.fireRate = 1000; // Faster firing
        });
    }
    
    onPhase3Update(delta) {
        // More aggressive movement
        if (this.movementPattern === 'aggressive') {
            const t = this.scene.time.now * 0.001;
            const centerX = this.scene.cameras.main.width / 2;
            const amplitude = 200;
            
            this.x = centerX + Math.sin(t * 2) * amplitude;
            this.y = 150 + Math.sin(t) * 70;
        }
        
        // Fire weapons more frequently
        if (this.scene.time.now % 1000 < 50) { // Every 1 second
            this.fireSpreadShot(0, 2, 20); // Left port
            this.fireSpreadShot(2, 2, 20); // Right port
        }
        
        // Fire beam attack periodically
        if (this.scene.time.now % 5000 < 50) { // Every 5 seconds
            this.fireBeamAttack();
        }
    }
    
    /**
     * Phase 4: Desperate assault with all weapons firing and ramming attempts
     */
    onPhase4Enter() {
        console.log('Guardian Phase 4: Desperate assault');
        
        // Set movement pattern
        this.movementPattern = 'ramming';
        
        // Increase fire rate even more
        this.weaponPorts.forEach(port => {
            port.fireRate = 500; // Even faster firing
        });
        
        // Visual effect - red glow
        this.setTint(0xff3333);
    }
    
    onPhase4Update(delta) {
        // Ramming movement - try to collide with player
        if (this.movementPattern === 'ramming') {
            // Find player
            const player = this.scene.player;
            if (player && player.active) {
                // Calculate direction to player
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Move towards player
                if (distance > 50) {
                    this.x += dx * 0.01;
                    this.y += dy * 0.01;
                }
            }
        }
        
        // Fire all weapons constantly
        if (this.scene.time.now % 500 < 50) { // Every 0.5 seconds
            this.fireSpreadShot(0, 3, 30); // Left port
            this.fireSpreadShot(1, 5, 60); // Center port
            this.fireSpreadShot(2, 3, 30); // Right port
        }
        
        // Fire beam attack more frequently
        if (this.scene.time.now % 3000 < 50) { // Every 3 seconds
            this.fireBeamAttack();
        }
    }
    
    /**
     * Boss defeated state
     */
    onDefeatedEnter() {
        console.log('Guardian defeated');
        
        // Stop all movement
        this.body.setVelocity(0, 0);
        
        // Disable collisions
        this.body.enable = false;
        
        // Start defeat sequence
        this.scene.events.emit('boss-defeated', this);
        
        // Create explosion effect
        this.createExplosionEffect();
    }
    
    /**
     * Create a large explosion effect for boss defeat
     */
    createExplosionEffect() {
        // Create multiple explosions
        for (let i = 0; i < 10; i++) {
            // Random position within boss body
            const offsetX = Phaser.Math.Between(-this.width/2, this.width/2);
            const offsetY = Phaser.Math.Between(-this.height/2, this.height/2);
            
            // Create explosion with delay
            this.scene.time.delayedCall(i * 200, () => {
                const explosion = this.scene.add.sprite(
                    this.x + offsetX,
                    this.y + offsetY,
                    'explosion'
                );
                
                // Play explosion animation
                if (this.scene.anims.exists('explosion-anim')) {
                    explosion.play('explosion-anim');
                } else {
                    // Fallback explosion effect
                    this.scene.tweens.add({
                        targets: explosion,
                        alpha: 0,
                        scale: 3,
                        duration: 800,
                        onComplete: () => {
                            explosion.destroy();
                        }
                    });
                }
            });
        }
        
        // Final large explosion
        this.scene.time.delayedCall(2000, () => {
            const finalExplosion = this.scene.add.sprite(this.x, this.y, 'explosion');
            finalExplosion.setScale(3);
            
            // Play explosion animation
            if (this.scene.anims.exists('explosion-anim')) {
                finalExplosion.play('explosion-anim');
            } else {
                // Fallback explosion effect
                this.scene.tweens.add({
                    targets: finalExplosion,
                    alpha: 0,
                    scale: 5,
                    duration: 1000,
                    onComplete: () => {
                        finalExplosion.destroy();
                        this.destroy();
                    }
                });
            }
            
            // Screen shake
            this.scene.cameras.main.shake(500, 0.03);
        });
    }
}
