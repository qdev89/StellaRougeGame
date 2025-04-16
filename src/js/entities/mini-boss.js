/**
 * Mini-Boss Enemy
 * Base class for mini-boss enemies with phases and special attack patterns
 * Extends the base Enemy class but has some boss-like features
 */
class MiniBoss extends Enemy {
    constructor(scene, x, y, texture, miniBossType) {
        // Call parent constructor with appropriate enemy type
        super(scene, x, y, texture, 'DESTROYER'); // Use destroyer as base type
        
        // Override with mini-boss specific properties
        this.miniBossType = miniBossType;
        this.settings = CONSTANTS.ENEMIES.MINI_BOSSES[miniBossType];
        
        // Set up properties based on mini-boss type
        this.health = this.settings.HEALTH;
        this.maxHealth = this.settings.HEALTH;
        this.speed = this.settings.SPEED;
        this.score = this.settings.SCORE;
        this.fireRate = this.settings.FIRE_RATE;
        
        // Mini-boss specific properties
        this.phases = this.settings.PHASES || 2;
        this.currentPhase = 1;
        this.phaseThresholds = [0.5]; // Default phase transition at 50% health
        this.attackPatterns = this.settings.ATTACK_PATTERNS || [];
        this.currentPattern = this.attackPatterns[0];
        
        // Visual elements
        this.shieldEffect = null;
        this.weaponPorts = [];
        
        // Set larger scale for mini-bosses
        this.setScale(1.8);
        
        // Set up mini-boss specific behaviors
        this.setupMiniBoss();
        
        // Create health bar
        this.createHealthBar();
    }
    
    /**
     * Set up mini-boss specific behaviors and visuals
     */
    setupMiniBoss() {
        // Set depth for rendering order
        this.setDepth(10);
        
        // Set larger hitbox
        this.body.setSize(50, 50);
        
        // Set a special tint based on mini-boss type
        switch (this.miniBossType) {
            case 'ASSAULT_CAPTAIN':
                this.setTint(0xff3333); // Red
                break;
            case 'SHIELD_MASTER':
                this.setTint(0x3399ff); // Blue
                break;
            case 'DRONE_COMMANDER':
                this.setTint(0x33cc33); // Green
                break;
            case 'STEALTH_HUNTER':
                this.setTint(0x9933cc); // Purple
                break;
            case 'BOMBER_CHIEF':
                this.setTint(0xff9900); // Orange
                break;
        }
        
        // Create weapon ports
        this.createWeaponPorts();
    }
    
    /**
     * Create weapon ports for the mini-boss
     */
    createWeaponPorts() {
        // Default is 3 weapon ports (left, center, right)
        const portPositions = [
            { x: -20, y: 0 },  // Left
            { x: 0, y: -10 },  // Center
            { x: 20, y: 0 }    // Right
        ];
        
        // Create each port
        portPositions.forEach((pos, index) => {
            this.weaponPorts[index] = {
                x: pos.x,
                y: pos.y,
                cooldown: 0,
                active: true
            };
        });
    }
    
    /**
     * Create a health bar for the mini-boss
     */
    createHealthBar() {
        // Create health bar background
        this.healthBarBg = this.scene.add.rectangle(
            this.x,
            this.y - 40,
            60, 8,
            0x000000, 0.8
        );
        this.healthBarBg.setDepth(this.depth + 1);
        
        // Create health bar fill
        this.healthBar = this.scene.add.rectangle(
            this.x - 30,
            this.y - 40,
            60, 8,
            0xff3333, 1
        );
        this.healthBar.setOrigin(0, 0.5);
        this.healthBar.setDepth(this.depth + 1);
    }
    
    /**
     * Update method called by the scene
     */
    update(time, delta, playerShip) {
        if (!this.active) return;
        
        // Update health bar position
        if (this.healthBarBg && this.healthBar) {
            this.healthBarBg.x = this.x;
            this.healthBarBg.y = this.y - 40;
            this.healthBar.x = this.x - 30;
            this.healthBar.y = this.y - 40;
            
            // Update health bar width based on health percentage
            this.healthBar.width = 60 * (this.health / this.maxHealth);
        }
        
        // Check for phase transitions
        this.checkPhaseTransition();
        
        // Update based on current phase
        switch (this.currentPhase) {
            case 1:
                this.updatePhase1(time, delta, playerShip);
                break;
            case 2:
                this.updatePhase2(time, delta, playerShip);
                break;
        }
        
        // Call parent update for basic movement and firing
        super.update(time, delta, playerShip);
    }
    
    /**
     * Check if we should transition to the next phase
     */
    checkPhaseTransition() {
        // Calculate health percentage
        const healthPercent = this.health / this.maxHealth;
        
        // Check if we should transition to phase 2
        if (this.currentPhase === 1 && healthPercent <= this.phaseThresholds[0]) {
            this.transitionToPhase(2);
        }
    }
    
    /**
     * Transition to a new phase
     */
    transitionToPhase(phase) {
        // Only transition if it's a new phase
        if (phase === this.currentPhase) return;
        
        console.log(`Mini-boss ${this.miniBossType} transitioning to phase ${phase}`);
        
        // Update current phase
        this.currentPhase = phase;
        
        // Update current attack pattern
        this.currentPattern = this.attackPatterns[phase - 1] || this.attackPatterns[0];
        
        // Visual effect for phase transition
        this.scene.cameras.main.shake(200, 0.005);
        
        // Flash effect
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.alpha = 1;
            }
        });
    }
    
    /**
     * Phase 1 update logic - override in subclasses
     */
    updatePhase1(time, delta, playerShip) {
        // Default implementation - move side to side
        this.x += Math.sin(time * 0.001) * 1;
    }
    
    /**
     * Phase 2 update logic - override in subclasses
     */
    updatePhase2(time, delta, playerShip) {
        // Default implementation - more aggressive movement
        const angle = Math.sin(time * 0.002) * Math.PI * 0.25;
        this.x += Math.cos(angle) * 2;
        this.y += Math.sin(angle) * 1;
    }
    
    /**
     * Fire a spread of projectiles
     */
    fireSpreadShot(portIndex, count, spreadAngle) {
        // Get the weapon port
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
            
            // Create projectile
            const laser = this.scene.enemyProjectiles.create(portX, portY, 'laser-red');
            
            // Set velocity based on angle
            const speed = 300;
            laser.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            // Rotate to face direction
            laser.rotation = angle + Math.PI / 2;
            
            // Set damage
            laser.damage = 15;
            
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
    }
    
    /**
     * Override takeDamage to handle phase transitions and visual effects
     */
    takeDamage(amount) {
        // Apply damage
        this.health -= amount;
        
        // Update health bar
        if (this.healthBar) {
            this.healthBar.width = 60 * Math.max(0, this.health / this.maxHealth);
        }
        
        // Flash effect
        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            // Reset to mini-boss specific tint
            switch (this.miniBossType) {
                case 'ASSAULT_CAPTAIN':
                    this.setTint(0xff3333); // Red
                    break;
                case 'SHIELD_MASTER':
                    this.setTint(0x3399ff); // Blue
                    break;
                case 'DRONE_COMMANDER':
                    this.setTint(0x33cc33); // Green
                    break;
                case 'STEALTH_HUNTER':
                    this.setTint(0x9933cc); // Purple
                    break;
                case 'BOMBER_CHIEF':
                    this.setTint(0xff9900); // Orange
                    break;
            }
        });
        
        // Check if mini-boss is defeated
        if (this.health <= 0) {
            this.onDefeated();
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle mini-boss defeat
     */
    onDefeated() {
        // Stop all movement
        this.body.setVelocity(0, 0);
        
        // Create explosion effect
        this.createExplosionEffect();
        
        // Drop special rewards
        this.dropSpecialRewards();
        
        // Clean up health bar
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        
        // Destroy after a delay for explosion effect
        this.scene.time.delayedCall(500, () => {
            this.destroy();
        });
    }
    
    /**
     * Create explosion effect when defeated
     */
    createExplosionEffect() {
        // Create multiple explosions
        for (let i = 0; i < 5; i++) {
            // Random position within mini-boss
            const offsetX = Phaser.Math.Between(-20, 20);
            const offsetY = Phaser.Math.Between(-20, 20);
            
            // Create explosion sprite
            const explosion = this.scene.add.sprite(
                this.x + offsetX,
                this.y + offsetY,
                'explosion'
            );
            
            // Set scale based on position (center = larger)
            const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
            const scale = 1.5 - (distance / 30);
            explosion.setScale(scale);
            
            // Play explosion animation if it exists
            if (this.scene.anims.exists('explosion-anim')) {
                explosion.play('explosion-anim');
                explosion.once('animationcomplete', () => {
                    explosion.destroy();
                });
            } else {
                // Fallback if animation doesn't exist
                this.scene.tweens.add({
                    targets: explosion,
                    alpha: 0,
                    scale: explosion.scale * 2,
                    duration: 500,
                    onComplete: () => {
                        explosion.destroy();
                    }
                });
            }
            
            // Add slight delay between explosions
            this.scene.time.delayedCall(i * 100, () => {
                explosion.setAlpha(1);
            });
        }
        
        // Screen shake
        this.scene.cameras.main.shake(500, 0.01);
    }
    
    /**
     * Drop special rewards when defeated
     */
    dropSpecialRewards() {
        // Always drop a powerup
        if (this.scene.createPowerup) {
            // Create 2-3 powerups
            const powerupCount = Phaser.Math.Between(2, 3);
            
            for (let i = 0; i < powerupCount; i++) {
                // Random offset
                const offsetX = Phaser.Math.Between(-30, 30);
                const offsetY = Phaser.Math.Between(-30, 30);
                
                // Create powerup with random type
                this.scene.createPowerup(this.x + offsetX, this.y + offsetY);
            }
        }
    }
    
    /**
     * Override destroy to clean up resources
     */
    destroy() {
        // Clean up health bar
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBar) this.healthBar.destroy();
        
        // Call parent destroy
        super.destroy();
    }
}
