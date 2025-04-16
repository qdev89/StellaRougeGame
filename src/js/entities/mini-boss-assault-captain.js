/**
 * Assault Captain Mini-Boss
 * A fast, aggressive mini-boss that specializes in direct attacks
 * Extends the MiniBoss class
 */
class AssaultCaptain extends MiniBoss {
    constructor(scene, x, y) {
        // Call parent constructor with the assault captain type
        super(scene, x, y, 'enemy-gunship', 'ASSAULT_CAPTAIN');
        
        // Set up assault captain specific properties
        this.chargeSpeed = 300;
        this.chargeCooldown = 3000;
        this.lastChargeTime = 0;
        this.isCharging = false;
        
        // Create assault captain specific visual effects
        this.createAssaultCaptainEffects();
    }
    
    /**
     * Create visual effects specific to the assault captain
     */
    createAssaultCaptainEffects() {
        // Add engine particles
        if (this.scene.particles) {
            this.engineEmitter = this.scene.particles.createEmitter({
                frame: 'red',
                speed: { min: 50, max: 100 },
                scale: { start: 0.3, end: 0 },
                blendMode: 'ADD',
                lifespan: 300
            });
            
            this.engineEmitter.startFollow(this, 0, 20);
        }
        
        // Add weapon glow effect
        this.weaponGlow = this.scene.add.sprite(this.x, this.y - 15, 'particle-blue')
            .setScale(0.5)
            .setAlpha(0.7)
            .setTint(0xff3333)
            .setDepth(this.depth - 1);
        
        // Pulse effect for weapon glow
        this.scene.tweens.add({
            targets: this.weaponGlow,
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
        
        // Update weapon glow position
        if (this.weaponGlow) {
            this.weaponGlow.x = this.x;
            this.weaponGlow.y = this.y - 15;
        }
        
        // In phase 1, use spread shots and occasional charges
        if (this.canFire && !this.isCharging) {
            // Fire spread shots from all ports
            this.fireSpreadShot(0, 3, 30); // Left port
            this.fireSpreadShot(1, 3, 30); // Center port
            this.fireSpreadShot(2, 3, 30); // Right port
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate, () => {
                this.canFire = true;
            });
        }
        
        // Check if we should charge
        if (time - this.lastChargeTime > this.chargeCooldown && !this.isCharging) {
            this.startCharge(playerShip);
            this.lastChargeTime = time;
        }
        
        // If not charging, move in a side-to-side pattern
        if (!this.isCharging) {
            this.x += Math.sin(time * 0.002) * 2;
            this.y += Math.cos(time * 0.001) * 1;
        }
    }
    
    /**
     * Update method for phase 2
     */
    updatePhase2(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update weapon glow position
        if (this.weaponGlow) {
            this.weaponGlow.x = this.x;
            this.weaponGlow.y = this.y - 15;
            
            // Make glow more intense in phase 2
            this.weaponGlow.setTint(0xff0000);
        }
        
        // In phase 2, use more aggressive spread shots and faster charges
        if (this.canFire && !this.isCharging) {
            // Fire wider spread shots from all ports
            this.fireSpreadShot(0, 5, 45); // Left port
            this.fireSpreadShot(1, 5, 45); // Center port
            this.fireSpreadShot(2, 5, 45); // Right port
            
            // Set cooldown (faster in phase 2)
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate * 0.7, () => {
                this.canFire = true;
            });
        }
        
        // Check if we should charge (more frequent in phase 2)
        if (time - this.lastChargeTime > this.chargeCooldown * 0.6 && !this.isCharging) {
            this.startCharge(playerShip);
            this.lastChargeTime = time;
        }
        
        // If not charging, move more aggressively
        if (!this.isCharging) {
            this.x += Math.sin(time * 0.003) * 3;
            this.y += Math.cos(time * 0.002) * 2;
        }
    }
    
    /**
     * Start a charge attack toward the player
     */
    startCharge(playerShip) {
        // Set charging state
        this.isCharging = true;
        
        // Visual indicator for charge
        this.setTint(0xff0000);
        
        // Warning effect
        const warningText = this.scene.add.text(
            this.x,
            this.y - 50,
            '!',
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Warning animation
        this.scene.tweens.add({
            targets: warningText,
            y: warningText.y - 20,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                warningText.destroy();
            }
        });
        
        // Prepare for charge (slight delay)
        this.scene.time.delayedCall(500, () => {
            if (!this.active || !playerShip.active) return;
            
            // Calculate angle to player
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                playerShip.x, playerShip.y
            );
            
            // Set velocity for charge
            this.body.velocity.x = Math.cos(angle) * this.chargeSpeed;
            this.body.velocity.y = Math.sin(angle) * this.chargeSpeed;
            
            // Create trail effect
            if (this.scene.particles) {
                const trailEmitter = this.scene.particles.createEmitter({
                    frame: 'red',
                    speed: { min: 10, max: 30 },
                    scale: { start: 0.5, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 500,
                    quantity: 2
                });
                
                trailEmitter.startFollow(this);
                
                // Stop trail after charge
                this.scene.time.delayedCall(1000, () => {
                    trailEmitter.stop();
                });
            }
            
            // End charge after a delay
            this.scene.time.delayedCall(1000, () => {
                this.endCharge();
            });
        });
    }
    
    /**
     * End the charge attack
     */
    endCharge() {
        // Reset charging state
        this.isCharging = false;
        
        // Reset tint
        this.setTint(0xff3333);
        
        // Slow down
        this.body.velocity.x *= 0.2;
        this.body.velocity.y *= 0.2;
    }
    
    /**
     * Override fireAtPlayer to use the assault captain's attack pattern
     */
    fireAtPlayer(playerShip) {
        // Don't use default firing behavior, we handle it in phase updates
    }
    
    /**
     * Override destroy to clean up effects
     */
    destroy() {
        // Clean up weapon glow
        if (this.weaponGlow) {
            this.weaponGlow.destroy();
        }
        
        // Clean up engine emitter
        if (this.engineEmitter) {
            this.engineEmitter.stop();
        }
        
        // Call parent destroy
        super.destroy();
    }
}
