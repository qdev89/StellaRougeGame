/**
 * PowerUp Class
 * Represents collectible items that provide benefits to the player when collected
 */
class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Determine texture based on type
        const texture = `powerup-${type}`;

        super(scene, x, y, texture);

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Power-up properties
        this.type = type;

        // Apply reward multiplier if available in the scene
        const rewardMultiplier = scene.rewardMultiplier || 1.0;
        this.value = this.determineValue(type, rewardMultiplier);

        // Log if reward multiplier is applied
        if (rewardMultiplier !== 1.0) {
            console.log(`PowerUp: Applied reward multiplier ${rewardMultiplier} to ${type} powerup. Value: ${this.value}`);
        }

        // Set up physics properties
        this.setDepth(CONSTANTS.GAME.POWERUP_Z_INDEX);
        this.body.setVelocity(0, 50); // Slow downward drift
        this.body.setCollideWorldBounds(false);

        // Visual and animation effects
        this.setupVisuals();

        // Auto-destroy after a certain time if not collected
        this.lifespan = 10000; // 10 seconds
        this.createdAt = scene.time.now;

        // Add to powerups group if it exists
        if (scene.powerups) {
            scene.powerups.add(this);
        }
    }

    /**
     * Determine the value/amount of the powerup based on type and reward multiplier
     * @param {string} type - The type of powerup
     * @param {number} multiplier - The reward multiplier to apply
     * @returns {number|string} The value of the powerup
     */
    determineValue(type, multiplier = 1.0) {
        // Base values for each powerup type
        let baseValue;

        switch (type) {
            case 'health':
                baseValue = 25; // Health restore amount
                break;
            case 'shield':
                baseValue = 20; // Shield restore amount
                break;
            case 'weapon':
                return 'PLASMA_BOLT'; // Weapon type doesn't scale with multiplier
            case 'score':
                baseValue = 500; // Score bonus
                break;
            case 'life':
                return 1; // Extra life doesn't scale with multiplier
            case 'ammo':
                baseValue = 30; // Ammo restore amount
                break;
            default:
                baseValue = 10; // Default value
        }

        // Apply multiplier to numeric values
        if (typeof baseValue === 'number') {
            // Round to nearest integer for cleaner values
            return Math.round(baseValue * multiplier);
        }

        return baseValue;
    }

    /**
     * Set up visual effects for the powerup
     */
    setupVisuals() {
        // Add pulsing effect
        this.scene.tweens.add({
            targets: this,
            scale: { from: 0.8, to: 1.2 },
            alpha: { from: 0.6, to: 1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Add particle glow effect based on type
        let particleColor;

        switch (this.type) {
            case 'health':
                particleColor = 0xff0000; // Red
                break;
            case 'shield':
                particleColor = 0x0088ff; // Blue
                break;
            case 'weapon':
                particleColor = 0xffff00; // Yellow
                break;
            case 'score':
                particleColor = 0x00ff88; // Green
                break;
            case 'life':
                particleColor = 0xff00ff; // Purple
                break;
            default:
                particleColor = 0xffffff; // White
        }

        // Create particle emitter for glow effect
        const particles = this.scene.add.particles(`particle-${this.type}`);

        this.emitter = particles.createEmitter({
            x: this.x,
            y: this.y,
            lifespan: { min: 200, max: 400 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.5, end: 0 },
            quantity: 1,
            blendMode: 'ADD',
            frequency: 50,
            tint: particleColor
        });
    }

    /**
     * Apply the powerup effect to the player
     */
    applyEffect(player) {
        switch (this.type) {
            case 'health':
                player.heal(this.value);
                // Sound disabled
                break;

            case 'shield':
                player.rechargeShields(this.value);
                // Sound disabled
                break;

            case 'weapon':
                // Temporary weapon boost
                const originalWeapon = player.weaponType;

                // Store the weapon to switch to
                const newWeapon = this.value || 'PLASMA_BOLT';

                // Only switch if the weapon is unlocked or it's a temporary boost
                if (player.unlockedWeapons.includes(newWeapon) || newWeapon === 'PLASMA_BOLT') {
                    player.weaponType = newWeapon;

                    // Revert after 10 seconds
                    this.scene.time.delayedCall(10000, () => {
                        // Check if player and scene are still valid
                        if (player && player.active && this.scene && !this.scene.isDestroyed) {
                            player.weaponType = originalWeapon;

                            // Update UI if available - use player's reference to scene instead
                            if (player.scene && player.scene.updateAmmoUI) {
                                player.scene.updateAmmoUI();
                            }
                        }
                    });
                }

                // Sound disabled
                break;

            case 'score':
                this.scene.updateScore(this.value);
                // Sound disabled
                break;

            case 'life':
                // In a game with lives system, would add a life
                // Sound disabled
                break;

            case 'ammo':
                // Improved ammo distribution system
                this.distributeAmmo(player, this.value);
                // Sound disabled
                break;
        }

        // Create collection effect
        this.createCollectionEffect();
    }

    /**
     * Create a visual effect when the powerup is collected
     */
    createCollectionEffect() {
        // Create flash effect
        const flash = this.scene.add.sprite(this.x, this.y, 'powerup-flash')
            .setScale(1.5)
            .setAlpha(0.7)
            .setDepth(this.depth + 1);

        this.scene.tweens.add({
            targets: flash,
            scale: 2.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });

        // Create text popup
        let text;

        // Check if there's a reward multiplier in effect
        const hasMultiplier = this.scene.rewardMultiplier && this.scene.rewardMultiplier !== 1.0;

        switch (this.type) {
            case 'health':
                text = `+${this.value} HP`;
                if (hasMultiplier && this.scene.rewardMultiplier > 1.0) {
                    text += ' (ENHANCED!)';
                }
                break;
            case 'shield':
                text = `+${this.value} SHIELD`;
                if (hasMultiplier && this.scene.rewardMultiplier > 1.0) {
                    text += ' (ENHANCED!)';
                }
                break;
            case 'weapon':
                text = 'WEAPON BOOST!';
                break;
            case 'score':
                text = `+${this.value} PTS`;
                if (hasMultiplier && this.scene.rewardMultiplier > 1.0) {
                    text += ' (BONUS!)';
                }
                break;
            case 'life':
                text = '+1 LIFE';
                break;
            case 'ammo':
                text = `+${this.value} AMMO DISTRIBUTED`;
                if (hasMultiplier && this.scene.rewardMultiplier > 1.0) {
                    text += ' (ENHANCED!)';
                }
                break;
            default:
                text = `+${this.value}`;
        }

        const popupText = this.scene.add.text(this.x, this.y - 20, text, {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(this.depth + 1);

        this.scene.tweens.add({
            targets: popupText,
            y: popupText.y - 40,
            alpha: 0,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => {
                popupText.destroy();
            }
        });
    }

    update() {
        // Move particle emitter with powerup
        if (this.emitter) {
            this.emitter.setPosition(this.x, this.y);
        }

        // Check if lifespan is exceeded
        if (this.scene.time.now - this.createdAt > this.lifespan) {
            this.fadeOut();
        }
    }

    /**
     * Distribute ammo intelligently among weapons
     * @param {PlayerShip} player - The player ship
     * @param {number} amount - The amount of ammo to distribute
     */
    distributeAmmo(player, amount) {
        // Special weapons that need priority for ammo
        const specialWeapons = ['PLASMA_BOLT', 'HOMING_MISSILE', 'SCATTER_BOMB'];

        // First, add ammo to the current weapon
        player.addAmmo(player.weaponType, Math.floor(amount * 0.6)); // 60% to current weapon

        // Distribute remaining 40% among special weapons if they're unlocked
        const remainingAmmo = Math.floor(amount * 0.4);
        const unlockedSpecialWeapons = specialWeapons.filter(weapon =>
            player.unlockedWeapons.includes(weapon));

        if (unlockedSpecialWeapons.length > 0) {
            // Distribute evenly among unlocked special weapons
            const ammoPerWeapon = Math.floor(remainingAmmo / unlockedSpecialWeapons.length);

            unlockedSpecialWeapons.forEach(weapon => {
                // Skip if it's the current weapon (already got ammo)
                if (weapon !== player.weaponType) {
                    player.addAmmo(weapon, ammoPerWeapon);
                }
            });

            // Log the distribution for debugging
            console.log(`Ammo distributed: ${Math.floor(amount * 0.6)} to ${player.weaponType}, ${ammoPerWeapon} each to ${unlockedSpecialWeapons.filter(w => w !== player.weaponType).join(', ')}`);
        } else {
            // If no special weapons are unlocked, add all remaining ammo to current weapon
            player.addAmmo(player.weaponType, remainingAmmo);
        }
    }

    /**
     * Fade out and destroy when powerup expires
     */
    fadeOut() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y + 20,
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });
    }

    /**
     * Clean up when destroyed
     */
    destroy() {
        // Clean up emitter
        if (this.emitter) {
            this.emitter.stop();
            this.emitter = null;
        }

        super.destroy();
    }
}
