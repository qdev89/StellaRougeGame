/**
 * Experimental Ship Class
 * Unique ship with experimental technology and high-risk, high-reward mechanics
 */
class ExperimentalShip extends ShipBase {
    constructor() {
        super({
            id: 'experimental',
            name: 'Prototype X',
            description: 'An unstable experimental vessel with revolutionary technology. Extremely powerful but unpredictable and dangerous to operate.',
            sprite: 'ship-experimental',
            unlockCriteria: 'Defeat the final boss',
            unlockMessage: 'Prototype X unlocked! Handle with extreme caution.',
            difficulty: 'expert'
        });
        
        // Override base stats with experimental-specific modifiers
        this.statModifiers = {
            health: 0.6,        // Very low health
            shield: 0.7,        // Low shields
            speed: 1.3,         // High speed
            fireRate: 1.5,      // Much faster fire rate
            damage: 1.8,        // Much higher damage
            shieldRegenRate: 0.5, // Very slow shield regen
            ammoRegenRate: 1.2,   // Slightly faster ammo regen
            maxAmmo: 0.8,         // Lower max ammo
            specialCooldown: 0.5,  // Much faster special cooldown
            dashCooldown: 0.7,     // Faster dash cooldown
            dashDistance: 1.5,     // Much longer dash distance
            dashDuration: 0.6      // Faster dash (higher speed)
        };
        
        // Starting weapons for experimental
        this.startingWeapons = ['BASIC_LASER', 'PLASMA_BOLT', 'HOMING_MISSILE'];
        
        // Special ability: Quantum Shift
        this.specialAbility = {
            name: 'Quantum Shift',
            description: 'Temporarily phase out of normal space, becoming invulnerable and gaining massive damage boost, but constantly losing health.',
            cooldown: 12000, // 12 seconds
            duration: 5000,  // 5 seconds
            isActive: false,
            lastUsed: 0,
            icon: '⚡',
            execute: (ship) => {
                // Activate quantum shift
                this.activateQuantumShift(ship);
                return true;
            }
        };
        
        // Visual effects
        this.visualEffects = {
            engineColor: 0xaa33ff,
            trailColor: 0xcc66ff,
            shieldColor: 0xff33ff,
            dashColor: 0xff00ff,
            specialColor: 0xaa00ff
        };
        
        // Experimental-specific synergies
        this.synergies = [
            {
                name: 'Unstable Core',
                description: 'Weapons deal 50% more damage but have a 10% chance to overheat and damage the ship.',
                isActive: true
            },
            {
                name: 'Quantum Entanglement',
                description: 'Defeating enemies has a 15% chance to trigger a quantum explosion, damaging nearby enemies.',
                isActive: true
            },
            {
                name: 'Temporal Anomaly',
                description: 'Time occasionally fluctuates, randomly speeding up or slowing down gameplay.',
                isActive: true,
                lastTriggered: 0
            }
        ];
        
        // Instability counter - increases risk over time
        this.instabilityCounter = 0;
    }
    
    /**
     * Apply experimental-specific synergies
     * @param {PlayerShip} playerShip - The player ship instance
     */
    applySynergies(playerShip) {
        // Increase damage but add overheat chance
        playerShip.damageMultiplier = 1.5; // 50% more damage
        
        // Override fire weapon method to add overheat chance
        const originalFireMethod = playerShip.fireWeapon;
        playerShip.fireWeapon = function() {
            // Call original method
            originalFireMethod.call(this);
            
            // 10% chance to overheat
            if (Math.random() < 0.1) {
                // Damage ship
                this.takeDamage(5);
                
                // Create overheat effect
                this.scene.visualEffects?.createOverheatEffect(this);
                
                console.log('Weapon overheated, taking 5 damage');
            }
        };
        
        // Add quantum explosion on enemy defeat
        playerShip.scene.events.on('enemy-defeated', (enemy) => {
            if (Math.random() < 0.15) { // 15% chance
                this.createQuantumExplosion(enemy);
            }
        });
        
        // Set up temporal anomaly
        this.setupTemporalAnomaly(playerShip);
        
        // Set up instability system
        this.setupInstabilitySystem(playerShip);
    }
    
    /**
     * Set up temporal anomaly system
     * @param {PlayerShip} playerShip - The player ship instance
     */
    setupTemporalAnomaly(playerShip) {
        // Create timer for random temporal shifts
        playerShip.scene.time.addEvent({
            delay: 20000, // Check every 20 seconds
            callback: () => {
                // 30% chance to trigger
                if (Math.random() < 0.3) {
                    this.triggerTemporalAnomaly(playerShip);
                }
            },
            loop: true
        });
    }
    
    /**
     * Trigger a temporal anomaly
     * @param {PlayerShip} playerShip - The player ship instance
     */
    triggerTemporalAnomaly(playerShip) {
        // Determine if time speeds up or slows down
        const speedUp = Math.random() < 0.5;
        
        // Set time scale
        const timeScale = speedUp ? 1.5 : 0.7;
        
        // Apply time scale
        playerShip.scene.time.timeScale = timeScale;
        
        // Create visual effect
        this.createTemporalAnomalyEffect(playerShip, speedUp);
        
        // Reset after a few seconds
        playerShip.scene.time.delayedCall(5000, () => {
            playerShip.scene.time.timeScale = 1.0;
        }, null, this);
        
        console.log(`Temporal anomaly triggered: time ${speedUp ? 'accelerated' : 'slowed'}`);
    }
    
    /**
     * Create temporal anomaly visual effect
     * @param {PlayerShip} playerShip - The player ship instance
     * @param {boolean} speedUp - Whether time is speeding up
     */
    createTemporalAnomalyEffect(playerShip, speedUp) {
        // Create text effect
        const text = playerShip.scene.add.text(
            playerShip.x,
            playerShip.y - 50,
            speedUp ? 'TIME ACCELERATING' : 'TIME SLOWING',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: speedUp ? '#ffaa33' : '#33aaff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(1000);
        
        // Animate text
        playerShip.scene.tweens.add({
            targets: text,
            alpha: { from: 1, to: 0 },
            y: text.y - 30,
            duration: 2000,
            onComplete: () => text.destroy()
        });
        
        // Create screen effect
        const effect = playerShip.scene.add.rectangle(
            0, 0,
            playerShip.scene.cameras.main.width,
            playerShip.scene.cameras.main.height,
            speedUp ? 0xff6600 : 0x0066ff,
            0.2
        ).setOrigin(0).setScrollFactor(0).setDepth(999);
        
        // Animate effect
        playerShip.scene.tweens.add({
            targets: effect,
            alpha: 0,
            duration: 2000,
            onComplete: () => effect.destroy()
        });
    }
    
    /**
     * Set up instability system
     * @param {PlayerShip} playerShip - The player ship instance
     */
    setupInstabilitySystem(playerShip) {
        // Increase instability over time
        playerShip.scene.time.addEvent({
            delay: 10000, // Every 10 seconds
            callback: () => {
                this.instabilityCounter += 1;
                
                // Check for random instability events
                if (Math.random() < this.instabilityCounter * 0.05) {
                    this.triggerInstabilityEvent(playerShip);
                }
            },
            loop: true
        });
        
        // Reset instability on sector change
        playerShip.scene.events.on('sector-start', () => {
            this.instabilityCounter = 0;
        });
    }
    
    /**
     * Trigger a random instability event
     * @param {PlayerShip} playerShip - The player ship instance
     */
    triggerInstabilityEvent(playerShip) {
        // List of possible events
        const events = [
            {
                name: 'Power Surge',
                effect: () => {
                    // Temporarily boost damage
                    const originalDamageMultiplier = playerShip.damageMultiplier;
                    playerShip.damageMultiplier = 2.0;
                    
                    // Reset after 5 seconds
                    playerShip.scene.time.delayedCall(5000, () => {
                        playerShip.damageMultiplier = originalDamageMultiplier;
                    });
                    
                    return 'Power surge detected! Damage boosted for 5 seconds.';
                }
            },
            {
                name: 'Shield Fluctuation',
                effect: () => {
                    // Random shield change
                    if (Math.random() < 0.5) {
                        // Shield boost
                        playerShip.shields = playerShip.maxShields;
                        return 'Shield fluctuation! Shields fully recharged.';
                    } else {
                        // Shield drain
                        playerShip.shields = 0;
                        return 'Shield fluctuation! Shields depleted.';
                    }
                }
            },
            {
                name: 'Weapon Malfunction',
                effect: () => {
                    // Switch to random weapon
                    const availableWeapons = playerShip.unlockedWeapons;
                    const randomWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
                    playerShip.switchWeapon(randomWeapon);
                    
                    return `Weapon malfunction! Switched to ${randomWeapon}.`;
                }
            },
            {
                name: 'Core Instability',
                effect: () => {
                    // Damage player but boost special ability cooldown
                    playerShip.takeDamage(10);
                    this.specialAbility.lastUsed = 0; // Reset cooldown
                    
                    return 'Core instability! Took damage but special ability ready.';
                }
            }
        ];
        
        // Select random event
        const event = events[Math.floor(Math.random() * events.length)];
        
        // Execute event
        const message = event.effect();
        
        // Create notification
        this.showInstabilityNotification(playerShip, event.name, message);
        
        console.log(`Instability event triggered: ${event.name}`);
    }
    
    /**
     * Show instability notification
     * @param {PlayerShip} playerShip - The player ship instance
     * @param {string} title - Event title
     * @param {string} message - Event message
     */
    showInstabilityNotification(playerShip, title, message) {
        // Create container
        const container = playerShip.scene.add.container(
            playerShip.scene.cameras.main.width / 2,
            100
        ).setDepth(1000).setScrollFactor(0);
        
        // Create background
        const bg = playerShip.scene.add.rectangle(
            0, 0, 400, 80,
            0x330033, 0.8
        ).setStrokeStyle(2, this.visualEffects.specialColor);
        
        container.add(bg);
        
        // Create title
        const titleText = playerShip.scene.add.text(
            0, -20,
            `INSTABILITY: ${title}`,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ff33ff',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        container.add(titleText);
        
        // Create message
        const messageText = playerShip.scene.add.text(
            0, 10,
            message,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        container.add(messageText);
        
        // Animate in
        container.setAlpha(0);
        container.y = 50;
        
        playerShip.scene.tweens.add({
            targets: container,
            alpha: 1,
            y: 100,
            duration: 500,
            ease: 'Back.out'
        });
        
        // Animate out after delay
        playerShip.scene.time.delayedCall(3000, () => {
            playerShip.scene.tweens.add({
                targets: container,
                alpha: 0,
                y: 50,
                duration: 500,
                onComplete: () => container.destroy()
            });
        });
    }
    
    /**
     * Create quantum explosion
     * @param {Enemy} enemy - The defeated enemy
     */
    createQuantumExplosion(enemy) {
        // Create explosion effect
        if (enemy.scene.visualEffects) {
            enemy.scene.visualEffects.createExplosion(
                enemy.x,
                enemy.y,
                this.visualEffects.specialColor,
                2.0 // Larger explosion
            );
        }
        
        // Find nearby enemies
        const nearbyEnemies = enemy.scene.enemies.getChildren().filter(otherEnemy => {
            if (otherEnemy === enemy || !otherEnemy.active) return false;
            
            // Check distance
            const distance = Phaser.Math.Distance.Between(
                enemy.x, enemy.y,
                otherEnemy.x, otherEnemy.y
            );
            
            return distance < 150; // Affect enemies within 150 pixels
        });
        
        // Damage nearby enemies
        nearbyEnemies.forEach(nearbyEnemy => {
            // Calculate damage based on distance
            const distance = Phaser.Math.Distance.Between(
                enemy.x, enemy.y,
                nearbyEnemy.x, nearbyEnemy.y
            );
            
            const damage = Math.floor(50 * (1 - distance / 150)); // 50 damage at center, scaling down with distance
            
            // Apply damage
            nearbyEnemy.takeDamage(damage);
            
            // Create damage text
            const damageText = enemy.scene.add.text(
                nearbyEnemy.x,
                nearbyEnemy.y - 20,
                `${damage}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#ff33ff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            
            // Animate text
            enemy.scene.tweens.add({
                targets: damageText,
                y: damageText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => damageText.destroy()
            });
        });
        
        // Create quantum explosion text
        const explosionText = enemy.scene.add.text(
            enemy.x,
            enemy.y,
            'QUANTUM EXPLOSION',
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ff33ff',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Animate text
        enemy.scene.tweens.add({
            targets: explosionText,
            y: explosionText.y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => explosionText.destroy()
        });
        
        console.log(`Quantum explosion triggered, affecting ${nearbyEnemies.length} enemies`);
    }
    
    /**
     * Activate quantum shift special ability
     * @param {PlayerShip} playerShip - The player ship instance
     */
    activateQuantumShift(playerShip) {
        // Make player invincible
        playerShip.invincible = true;
        
        // Store original damage multiplier
        this.originalDamageMultiplier = playerShip.damageMultiplier || 1.0;
        
        // Boost damage
        playerShip.damageMultiplier = this.originalDamageMultiplier * 3.0; // Triple damage
        
        // Visual effects
        playerShip.setAlpha(0.7);
        playerShip.setTint(this.visualEffects.specialColor);
        
        // Create quantum field effect
        this.createQuantumFieldEffect(playerShip);
        
        // Set up health drain
        this.quantumHealthDrain = playerShip.scene.time.addEvent({
            delay: 500, // Every half second
            callback: () => {
                // Drain health
                playerShip.health -= playerShip.maxHealth * 0.05; // 5% health drain per half second
                
                // Check if health is critically low
                if (playerShip.health < 10) {
                    // Force deactivation to prevent death
                    this.deactivateSpecialAbility(playerShip);
                    this.specialAbility.isActive = false;
                    
                    // Set health to minimum
                    playerShip.health = 10;
                }
            },
            repeat: 9 // 10 times (5 seconds total)
        });
        
        console.log('Quantum shift activated');
    }
    
    /**
     * Create quantum field effect
     * @param {PlayerShip} playerShip - The player ship instance
     */
    createQuantumFieldEffect(playerShip) {
        // Create quantum field container
        playerShip.quantumField = playerShip.scene.add.container(
            playerShip.x,
            playerShip.y
        );
        
        // Create field graphics
        const fieldGraphics = playerShip.scene.add.graphics();
        fieldGraphics.fillStyle(this.visualEffects.specialColor, 0.3);
        fieldGraphics.fillCircle(0, 0, 50);
        
        fieldGraphics.lineStyle(3, this.visualEffects.specialColor, 0.8);
        fieldGraphics.strokeCircle(0, 0, 50);
        
        playerShip.quantumField.add(fieldGraphics);
        
        // Create quantum particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50;
            
            const particle = playerShip.scene.add.circle(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                5,
                this.visualEffects.specialColor,
                0.8
            );
            
            playerShip.quantumField.add(particle);
            
            // Animate particle
            playerShip.scene.tweens.add({
                targets: particle,
                x: Math.cos(angle + Math.PI) * distance,
                y: Math.sin(angle + Math.PI) * distance,
                duration: 1500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Make field follow player
        playerShip.scene.events.on('update', () => {
            if (playerShip.quantumField && playerShip.active) {
                playerShip.quantumField.setPosition(playerShip.x, playerShip.y);
            }
        });
    }
    
    /**
     * Deactivate quantum shift
     * @param {PlayerShip} playerShip - The player ship instance
     */
    deactivateSpecialAbility(playerShip) {
        // Remove invincibility
        playerShip.invincible = false;
        
        // Restore original damage multiplier
        if (this.originalDamageMultiplier) {
            playerShip.damageMultiplier = this.originalDamageMultiplier;
        }
        
        // Stop health drain
        if (this.quantumHealthDrain) {
            this.quantumHealthDrain.remove();
            this.quantumHealthDrain = null;
        }
        
        // Remove visual effects
        playerShip.setAlpha(1.0);
        playerShip.clearTint();
        
        // Remove quantum field with animation
        if (playerShip.quantumField) {
            playerShip.scene.tweens.add({
                targets: playerShip.quantumField,
                alpha: 0,
                scale: 2,
                duration: 500,
                onComplete: () => {
                    playerShip.quantumField.destroy();
                    playerShip.quantumField = null;
                }
            });
        }
        
        // Create deactivation effect
        const pulse = playerShip.scene.add.circle(
            playerShip.x,
            playerShip.y,
            60,
            this.visualEffects.specialColor,
            0.5
        );
        
        playerShip.scene.tweens.add({
            targets: pulse,
            alpha: 0,
            scale: 3,
            duration: 800,
            onComplete: () => pulse.destroy()
        });
        
        console.log('Quantum shift deactivated');
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ExperimentalShip = ExperimentalShip;
}
