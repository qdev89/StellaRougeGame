/**
 * Nemesis Attack Patterns
 * Manages specialized attack patterns for the Nemesis boss
 */
class NemesisAttackPatterns {
    constructor(scene, boss) {
        this.scene = scene;
        this.boss = boss;

        // Attack cooldowns
        this.cooldowns = {
            adaptive: 0,
            phaseShift: 0,
            beam: 0,
            shield: 0,
            drones: 0,
            mines: 0,
            artillery: 0,
            spread: 0,
            cloak: 0,
            bombs: 0
        };

        // Attack timers
        this.timers = {};

        // Active effects
        this.activeEffects = {};

        // Initialize projectile groups
        this.initializeProjectileGroups();
    }

    /**
     * Initialize projectile groups for different attack types
     */
    initializeProjectileGroups() {
        // Create projectile groups if they don't exist
        if (!this.scene.nemesisProjectiles) {
            this.scene.nemesisProjectiles = this.scene.physics.add.group();
        }

        // Special projectile groups
        this.beams = this.scene.physics.add.group();
        this.drones = this.scene.physics.add.group();
        this.mines = this.scene.physics.add.group();
        this.bombs = this.scene.physics.add.group();

        // Set up collisions with player
        if (this.scene.player) {
            this.scene.physics.add.overlap(
                this.scene.player,
                this.scene.nemesisProjectiles,
                this.scene.playerHitByEnemyProjectile,
                null,
                this.scene
            );

            this.scene.physics.add.overlap(
                this.scene.player,
                this.beams,
                this.scene.playerHitByEnemyProjectile,
                null,
                this.scene
            );

            this.scene.physics.add.overlap(
                this.scene.player,
                this.drones,
                this.scene.playerHitByEnemyProjectile,
                null,
                this.scene
            );

            this.scene.physics.add.overlap(
                this.scene.player,
                this.mines,
                this.scene.playerHitByEnemyProjectile,
                null,
                this.scene
            );

            this.scene.physics.add.overlap(
                this.scene.player,
                this.bombs,
                this.scene.playerHitByEnemyProjectile,
                null,
                this.scene
            );
        }
    }

    /**
     * Update method called every frame
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Update cooldowns
        Object.keys(this.cooldowns).forEach(key => {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] -= delta;
            }
        });

        // Update active effects
        this.updateActiveEffects(time, delta);
    }

    /**
     * Update active effects
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateActiveEffects(time, delta) {
        // Update beam effects
        if (this.activeEffects.beam) {
            this.updateBeamEffect(time, delta);
        }

        // Update shield effects
        if (this.activeEffects.shield) {
            this.updateShieldEffect(time, delta);
        }

        // Update cloak effects
        if (this.activeEffects.cloak) {
            this.updateCloakEffect(time, delta);
        }
    }

    /**
     * Execute an attack pattern
     * @param {string} pattern - The attack pattern to execute
     */
    executePattern(pattern) {
        // Check if pattern exists
        if (!this[pattern + 'Pattern']) {
            console.warn(`Attack pattern '${pattern}' not found`);
            return;
        }

        // Check cooldown
        if (this.cooldowns[pattern] > 0) {
            return;
        }

        // Execute the pattern
        this[pattern + 'Pattern']();

        // Set cooldown
        this.cooldowns[pattern] = this.getPatternCooldown(pattern);

        console.log(`Nemesis executing pattern: ${pattern}`);
    }

    /**
     * Get cooldown time for a pattern
     * @param {string} pattern - The attack pattern
     * @returns {number} Cooldown time in milliseconds
     */
    getPatternCooldown(pattern) {
        // Base cooldowns for each pattern
        const cooldowns = {
            adaptive: 3000,
            phaseShift: 8000,
            beam: 5000,
            shield: 10000,
            drones: 7000,
            mines: 6000,
            artillery: 4000,
            spread: 2000,
            cloak: 12000,
            bombs: 8000
        };

        return cooldowns[pattern] || 3000;
    }

    /**
     * Adaptive attack pattern - changes based on player's current state
     */
    adaptivePattern() {
        // Get player reference
        const player = this.scene.player;
        if (!player) return;

        // Analyze player state
        const playerHealth = player.health / player.maxHealth;
        const playerShield = player.shield / player.maxShield;
        const playerPosition = { x: player.x, y: player.y };

        // Choose attack based on player state
        if (playerHealth < 0.3) {
            // Player low on health - aggressive attack
            this.executePattern('spread');
        } else if (playerShield > 0.7) {
            // Player has strong shields - use beam to penetrate
            this.executePattern('beam');
        } else {
            // Default attack - mix of projectiles
            this.fireAdaptiveProjectiles(playerPosition);
        }

        // Visual effect for adaptation
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAttackEffect({
                color: 0x33ccff,
                duration: 800
            });
        }
    }

    /**
     * Fire adaptive projectiles
     * @param {object} targetPosition - Position to target
     */
    fireAdaptiveProjectiles(targetPosition) {
        // Create projectile group if it doesn't exist
        if (!this.scene.nemesisProjectiles) {
            this.scene.nemesisProjectiles = this.scene.physics.add.group();
        }

        // Fire 5 projectiles in a spread pattern
        for (let i = -2; i <= 2; i++) {
            // Calculate angle offset
            const angleOffset = i * 10;

            // Calculate direction to player
            const angle = Phaser.Math.Angle.Between(
                this.boss.x, this.boss.y,
                targetPosition.x, targetPosition.y
            );

            // Create projectile
            const projectile = this.scene.physics.add.sprite(
                this.boss.x, this.boss.y,
                'enemy-projectile'
            );

            // Set projectile properties
            projectile.setScale(1.5);
            projectile.setTint(0x33ccff);
            projectile.damage = 15;
            projectile.lifespan = 2000;
            projectile.born = this.scene.time.now;

            // Add to group
            this.scene.nemesisProjectiles.add(projectile);

            // Set velocity based on angle
            const speed = 300;
            const adjustedAngle = angle + Phaser.Math.DegToRad(angleOffset);
            projectile.setVelocity(
                Math.cos(adjustedAngle) * speed,
                Math.sin(adjustedAngle) * speed
            );

            // Add rotation
            projectile.setAngularVelocity(300);

            // Add particle trail
            this.addProjectileTrail(projectile, 0x33ccff);
        }

        // Play sound effect
        // Sound is disabled
    }

    /**
     * Phase shift attack pattern - teleports and attacks
     */
    phaseShiftPattern() {
        // Get player reference
        const player = this.scene.player;
        if (!player) return;

        // Visual effect before phase shift
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showMorphingEffect({
                color: 0x9933cc,
                duration: 1000
            });
        }

        // Flash effect
        this.scene.cameras.main.flash(300, 100, 50, 150, 0.5);

        // Teleport after a delay
        this.scene.time.delayedCall(500, () => {
            // Calculate new position
            const angle = Phaser.Math.Between(0, 360);
            const distance = Phaser.Math.Between(150, 250);
            const newX = player.x + Math.cos(Phaser.Math.DegToRad(angle)) * distance;
            const newY = player.y + Math.sin(Phaser.Math.DegToRad(angle)) * distance;

            // Keep within bounds
            const boundsPadding = 50;
            const newPos = {
                x: Phaser.Math.Clamp(
                    newX,
                    boundsPadding,
                    this.scene.cameras.main.width - boundsPadding
                ),
                y: Phaser.Math.Clamp(
                    newY,
                    this.scene.cameras.main.scrollY + boundsPadding,
                    this.scene.cameras.main.scrollY + this.scene.cameras.main.height - boundsPadding
                )
            };

            // Set new position
            this.boss.x = newPos.x;
            this.boss.y = newPos.y;

            // Visual effect after teleport
            if (this.boss.effectsManager) {
                this.boss.effectsManager.showMorphingEffect({
                    color: 0x9933cc,
                    duration: 500
                });
            }

            // Attack after teleport
            this.scene.time.delayedCall(200, () => {
                this.executePattern('spread');
            });
        });
    }

    /**
     * Beam attack pattern - fires a continuous beam
     */
    beamPattern() {
        // Get player reference
        const player = this.scene.player;
        if (!player) return;

        // Visual effect before beam
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAttackEffect({
                color: 0xff3333,
                duration: 1000
            });
        }

        // Create beam effect
        this.createBeamEffect();

        // Set active effect
        this.activeEffects.beam = {
            startTime: this.scene.time.now,
            duration: 3000,
            target: player,
            damage: 5, // Damage per frame
            width: 20,
            color: 0xff3333
        };

        // Clear beam after duration
        this.scene.time.delayedCall(3000, () => {
            this.clearBeamEffect();
        });
    }

    /**
     * Create beam effect
     */
    createBeamEffect() {
        // Create beam graphics if it doesn't exist
        if (!this.beamGraphics) {
            this.beamGraphics = this.scene.add.graphics();
        }

        // Create beam sound
        // Sound is disabled
    }

    /**
     * Update beam effect
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateBeamEffect(time, delta) {
        // Check if beam effect is active
        if (!this.activeEffects.beam) return;

        // Get beam data
        const beam = this.activeEffects.beam;
        const target = beam.target;

        // Check if target is valid
        if (!target || !target.active) {
            this.clearBeamEffect();
            return;
        }

        // Calculate beam path
        const startX = this.boss.x;
        const startY = this.boss.y;
        const endX = target.x;
        const endY = target.y;

        // Draw beam
        this.beamGraphics.clear();
        this.beamGraphics.lineStyle(beam.width, beam.color, 0.8);
        this.beamGraphics.beginPath();
        this.beamGraphics.moveTo(startX, startY);
        this.beamGraphics.lineTo(endX, endY);
        this.beamGraphics.strokePath();

        // Add glow effect
        this.beamGraphics.lineStyle(beam.width * 2, beam.color, 0.3);
        this.beamGraphics.beginPath();
        this.beamGraphics.moveTo(startX, startY);
        this.beamGraphics.lineTo(endX, endY);
        this.beamGraphics.strokePath();

        // Add particles along beam
        if (this.scene.time.now % 100 < 20) { // Only add particles occasionally
            const particleCount = 5;
            for (let i = 0; i < particleCount; i++) {
                const t = i / particleCount;
                const x = startX + (endX - startX) * t;
                const y = startY + (endY - startY) * t;

                // Create particle
                const particle = this.scene.add.particles('particle-blue').createEmitter({
                    x: x,
                    y: y,
                    speed: { min: 20, max: 50 },
                    scale: { start: 0.5, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 300,
                    quantity: 1
                });

                // Set particle color
                particle.setTint(beam.color);

                // Auto-destroy particle
                this.scene.time.delayedCall(300, () => {
                    particle.remove();
                });
            }
        }

        // Apply damage to target
        if (this.scene.time.now % 100 < 20) { // Apply damage every 100ms
            target.takeDamage(beam.damage);

            // Show hit effect on target
            if (target.setTint) {
                target.setTint(beam.color);
                this.scene.time.delayedCall(100, () => {
                    target.clearTint();
                });
            }
        }

        // Check if beam duration has expired
        if (this.scene.time.now - beam.startTime >= beam.duration) {
            this.clearBeamEffect();
        }
    }

    /**
     * Clear beam effect
     */
    clearBeamEffect() {
        // Clear beam graphics
        if (this.beamGraphics) {
            this.beamGraphics.clear();
        }

        // Clear active effect
        delete this.activeEffects.beam;

        // Stop beam sound
        // Sound is disabled
    }

    /**
     * Shield attack pattern - creates a protective shield
     */
    shieldPattern() {
        // Visual effect before shield
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAdaptationEffect({
                color: 0x33ff33,
                duration: 1000
            });
        }

        // Create shield effect
        this.createShieldEffect();

        // Set active effect
        this.activeEffects.shield = {
            startTime: this.scene.time.now,
            duration: 5000,
            radius: this.boss.width,
            strength: 0.7, // Damage reduction
            color: 0x33ff33
        };

        // Clear shield after duration
        this.scene.time.delayedCall(5000, () => {
            this.clearShieldEffect();
        });
    }

    /**
     * Create shield effect
     */
    createShieldEffect() {
        // Create shield graphics if it doesn't exist
        if (!this.shieldGraphics) {
            this.shieldGraphics = this.scene.add.graphics();
        }

        // Create shield sound
        // Sound is disabled
    }

    /**
     * Update shield effect
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateShieldEffect(time, delta) {
        // Check if shield effect is active
        if (!this.activeEffects.shield) return;

        // Get shield data
        const shield = this.activeEffects.shield;

        // Calculate shield properties
        const radius = shield.radius + Math.sin(time * 0.005) * 5;
        const alpha = 0.5 + Math.sin(time * 0.003) * 0.1;

        // Draw shield
        this.shieldGraphics.clear();
        this.shieldGraphics.fillStyle(shield.color, alpha * 0.3);
        this.shieldGraphics.fillCircle(this.boss.x, this.boss.y, radius);
        this.shieldGraphics.lineStyle(3, shield.color, alpha);
        this.shieldGraphics.strokeCircle(this.boss.x, this.boss.y, radius);

        // Add shield pattern
        this.shieldGraphics.lineStyle(1, shield.color, alpha * 0.7);
        for (let i = 0; i < 360; i += 45) {
            const angle = Phaser.Math.DegToRad(i + (time * 0.05));
            const x1 = this.boss.x + Math.cos(angle) * (radius * 0.7);
            const y1 = this.boss.y + Math.sin(angle) * (radius * 0.7);
            const x2 = this.boss.x + Math.cos(angle) * radius;
            const y2 = this.boss.y + Math.sin(angle) * radius;

            this.shieldGraphics.beginPath();
            this.shieldGraphics.moveTo(x1, y1);
            this.shieldGraphics.lineTo(x2, y2);
            this.shieldGraphics.strokePath();
        }

        // Check if shield duration has expired
        if (time - shield.startTime >= shield.duration) {
            this.clearShieldEffect();
        }
    }

    /**
     * Clear shield effect
     */
    clearShieldEffect() {
        // Clear shield graphics
        if (this.shieldGraphics) {
            this.shieldGraphics.clear();
        }

        // Clear active effect
        delete this.activeEffects.shield;

        // Stop shield sound
        // Sound is disabled
    }

    /**
     * Artillery attack pattern - fires high-damage projectiles
     */
    artilleryPattern() {
        // Get player reference
        const player = this.scene.player;
        if (!player) return;

        // Visual effect before firing
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAttackEffect({
                color: 0xff3333,
                duration: 1000
            });
        }

        // Fire artillery shots
        const shotCount = 3;
        for (let i = 0; i < shotCount; i++) {
            // Fire with delay
            this.scene.time.delayedCall(i * 500, () => {
                this.fireArtilleryShot();
            });
        }
    }

    /**
     * Fire an artillery shot
     */
    fireArtilleryShot() {
        // Get player reference
        const player = this.scene.player;
        if (!player || !player.active) return;

        // Calculate target position (lead the player)
        const playerVelocity = player.body.velocity;
        const leadFactor = 0.5; // How much to lead the player
        const targetX = player.x + playerVelocity.x * leadFactor;
        const targetY = player.y + playerVelocity.y * leadFactor;

        // Calculate direction to target
        const angle = Phaser.Math.Angle.Between(
            this.boss.x, this.boss.y,
            targetX, targetY
        );

        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.boss.x, this.boss.y,
            'enemy-projectile'
        );

        // Set projectile properties
        projectile.setScale(2);
        projectile.setTint(0xff3333);
        projectile.damage = 30;
        projectile.lifespan = 3000;
        projectile.born = this.scene.time.now;
        projectile.explosionRadius = 60;

        // Add to group
        this.scene.nemesisProjectiles.add(projectile);

        // Set velocity based on angle
        const speed = 200;
        projectile.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Add particle trail
        this.addProjectileTrail(projectile, 0xff3333);

        // Add explosion on impact
        this.addArtilleryImpactEffect(projectile);

        // Add warning indicator at target location
        this.addArtilleryWarningIndicator(targetX, targetY);
    }

    /**
     * Add explosion effect to artillery projectile
     * @param {Phaser.GameObjects.Sprite} projectile - The projectile to add effect to
     */
    addArtilleryImpactEffect(projectile) {
        // Add collision detection with world bounds
        projectile.body.onWorldBounds = true;
        projectile.body.world.on('worldbounds', (body) => {
            if (body.gameObject === projectile) {
                this.createArtilleryExplosion(projectile.x, projectile.y, projectile.explosionRadius);
                projectile.destroy();
            }
        });

        // Add update function to check for impact
        const originalUpdate = projectile.update || (() => {});
        projectile.update = (time, delta) => {
            // Call original update if it exists
            originalUpdate.call(projectile, time, delta);

            // Check if lifespan expired
            if (time - projectile.born >= projectile.lifespan) {
                this.createArtilleryExplosion(projectile.x, projectile.y, projectile.explosionRadius);
                projectile.destroy();
            }
        };

        // Add to scene's update list
        this.scene.updateList.add(projectile);
    }

    /**
     * Create artillery explosion effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Explosion radius
     */
    createArtilleryExplosion(x, y, radius) {
        // Create explosion effect
        const explosion = this.scene.add.particles('particle-blue').createEmitter({
            x: x,
            y: y,
            speed: { min: 100, max: 300 },
            scale: { start: 2, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 40
        });

        // Set explosion color
        explosion.setTint(0xff3333);

        // Create flash
        const flash = this.scene.add.circle(x, y, radius, 0xff3333, 0.7);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });

        // Damage player if in range
        const player = this.scene.player;
        if (player && player.active) {
            const distance = Phaser.Math.Distance.Between(x, y, player.x, player.y);

            if (distance < radius) {
                // Calculate damage based on distance
                const damageMultiplier = 1 - (distance / radius);
                const damage = Math.floor(30 * damageMultiplier);

                // Apply damage
                player.takeDamage(damage);

                // Apply knockback
                const angle = Phaser.Math.Angle.Between(x, y, player.x, player.y);
                const knockbackForce = 300 * damageMultiplier;
                player.setVelocity(
                    Math.cos(angle) * knockbackForce,
                    Math.sin(angle) * knockbackForce
                );
            }
        }

        // Auto-destroy explosion
        this.scene.time.delayedCall(800, () => {
            explosion.remove();
        });

        // Camera shake
        this.scene.cameras.main.shake(300, 0.02);
    }

    /**
     * Add warning indicator for artillery impact
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    addArtilleryWarningIndicator(x, y) {
        // Create warning indicator
        const warning = this.scene.add.circle(x, y, 30, 0xff3333, 0.3);

        // Add pulsing effect
        this.scene.tweens.add({
            targets: warning,
            alpha: { from: 0.3, to: 0.6 },
            scale: { from: 1, to: 1.5 },
            duration: 500,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                warning.destroy();
            }
        });
    }

    /**
     * Spread attack pattern - fires multiple projectiles in a spread
     */
    spreadPattern() {
        // Visual effect before firing
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAttackEffect({
                color: 0x33ccff,
                duration: 500
            });
        }

        // Fire spread shots
        const angleSpread = 120; // Total angle spread in degrees
        const shotCount = 7;

        for (let i = 0; i < shotCount; i++) {
            // Calculate angle offset
            const angleOffset = -angleSpread/2 + (angleSpread / (shotCount - 1)) * i;

            // Fire with slight delay
            this.scene.time.delayedCall(i * 50, () => {
                this.fireSpreadShot(angleOffset);
            });
        }
    }

    /**
     * Fire a spread shot
     * @param {number} angleOffset - Angle offset in degrees
     */
    fireSpreadShot(angleOffset) {
        // Get player reference
        const player = this.scene.player;
        if (!player || !player.active) return;

        // Calculate base angle to player
        const baseAngle = Phaser.Math.Angle.Between(
            this.boss.x, this.boss.y,
            player.x, player.y
        );

        // Apply offset
        const angle = baseAngle + Phaser.Math.DegToRad(angleOffset);

        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.boss.x, this.boss.y,
            'enemy-projectile'
        );

        // Set projectile properties
        projectile.setScale(1.2);
        projectile.setTint(0x33ccff);
        projectile.damage = 10;
        projectile.lifespan = 2000;
        projectile.born = this.scene.time.now;

        // Add to group
        this.scene.nemesisProjectiles.add(projectile);

        // Set velocity based on angle
        const speed = 300;
        projectile.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Add particle trail
        this.addProjectileTrail(projectile, 0x33ccff);

        // Add update function to check lifespan
        projectile.update = (time, delta) => {
            if (time - projectile.born >= projectile.lifespan) {
                projectile.destroy();
            }
        };

        // Add to scene's update list
        this.scene.updateList.add(projectile);
    }

    /**
     * Cloak attack pattern - becomes invisible and attacks
     */
    cloakPattern() {
        // Visual effect before cloaking
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showMorphingEffect({
                color: 0x9933cc,
                duration: 1000
            });
        }

        // Set active effect
        this.activeEffects.cloak = {
            startTime: this.scene.time.now,
            duration: 5000,
            attackInterval: 1000,
            lastAttackTime: 0
        };

        // Make boss semi-transparent
        this.boss.alpha = 0.3;

        // Clear cloak after duration
        this.scene.time.delayedCall(5000, () => {
            this.clearCloakEffect();
        });
    }

    /**
     * Update cloak effect
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateCloakEffect(time, delta) {
        // Check if cloak effect is active
        if (!this.activeEffects.cloak) return;

        // Get cloak data
        const cloak = this.activeEffects.cloak;

        // Attack periodically while cloaked
        if (time - cloak.lastAttackTime >= cloak.attackInterval) {
            // Execute a surprise attack
            this.executePattern('phaseShift');

            // Update last attack time
            cloak.lastAttackTime = time;
        }

        // Check if cloak duration has expired
        if (time - cloak.startTime >= cloak.duration) {
            this.clearCloakEffect();
        }
    }

    /**
     * Clear cloak effect
     */
    clearCloakEffect() {
        // Restore boss visibility
        this.boss.alpha = 1;

        // Clear active effect
        delete this.activeEffects.cloak;

        // Visual effect after uncloaking
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showMorphingEffect({
                color: 0x9933cc,
                duration: 500
            });
        }
    }

    /**
     * Bombs attack pattern - drops explosive bombs
     */
    bombsPattern() {
        // Visual effect before dropping bombs
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAttackEffect({
                color: 0xff6633,
                duration: 1000
            });
        }

        // Drop bombs
        const bombCount = 3;
        for (let i = 0; i < bombCount; i++) {
            // Drop with delay
            this.scene.time.delayedCall(i * 500, () => {
                this.dropBomb();
            });
        }
    }

    /**
     * Drop a bomb
     */
    dropBomb() {
        // Create bomb
        const bomb = this.scene.physics.add.sprite(
            this.boss.x, this.boss.y,
            'enemy-projectile'
        );

        // Set bomb properties
        bomb.setScale(2);
        bomb.setTint(0xff6633);
        bomb.damage = 40;
        bomb.lifespan = 2000;
        bomb.born = this.scene.time.now;
        bomb.explosionRadius = 100;
        bomb.explosionDelay = 1000;

        // Add to group
        this.bombs.add(bomb);

        // Set velocity (falling down)
        bomb.setVelocity(0, 150);

        // Add particle trail
        this.addProjectileTrail(bomb, 0xff6633);

        // Add bomb behavior
        this.addBombBehavior(bomb);

        // Explode after delay
        this.scene.time.delayedCall(bomb.explosionDelay, () => {
            if (bomb.active) {
                this.explodeBomb(bomb);
            }
        });
    }

    /**
     * Add behavior to a bomb
     * @param {Phaser.GameObjects.Sprite} bomb - The bomb to add behavior to
     */
    addBombBehavior(bomb) {
        // Add update function
        bomb.update = (time, delta) => {
            // Rotate bomb
            bomb.angle += 2;

            // Flash bomb as it's about to explode
            if (time - bomb.born > bomb.explosionDelay * 0.7) {
                if (Math.floor(time / 100) % 2 === 0) {
                    bomb.setTint(0xffffff);
                } else {
                    bomb.setTint(0xff6633);
                }
            }

            // Check if lifespan expired
            if (time - bomb.born >= bomb.lifespan) {
                this.explodeBomb(bomb);
            }
        };

        // Add to scene's update list
        this.scene.updateList.add(bomb);
    }

    /**
     * Explode a bomb with effects
     * @param {Phaser.GameObjects.Sprite} bomb - The bomb to explode
     */
    explodeBomb(bomb) {
        // Create explosion effect
        const explosion = this.scene.add.particles('particle-blue').createEmitter({
            x: bomb.x,
            y: bomb.y,
            speed: { min: 100, max: 300 },
            scale: { start: 2.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 50
        });

        // Set explosion color
        explosion.setTint(0xff6633);

        // Create flash
        const flash = this.scene.add.circle(bomb.x, bomb.y, bomb.explosionRadius, 0xff6633, 0.7);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.5,
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });

        // Create secondary explosions
        for (let i = 0; i < 5; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                // Calculate random position within explosion radius
                const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
                const distance = Phaser.Math.Between(20, bomb.explosionRadius * 0.7);
                const x = bomb.x + Math.cos(angle) * distance;
                const y = bomb.y + Math.sin(angle) * distance;

                // Create secondary explosion
                const secondaryExplosion = this.scene.add.particles('particle-blue').createEmitter({
                    x: x,
                    y: y,
                    speed: { min: 50, max: 150 },
                    scale: { start: 1, end: 0 },
                    blendMode: 'ADD',
                    lifespan: 500,
                    quantity: 10
                });

                // Set explosion color
                secondaryExplosion.setTint(0xff6633);

                // Auto-destroy explosion
                this.scene.time.delayedCall(500, () => {
                    secondaryExplosion.remove();
                });
            });
        }

        // Damage player if in range
        const player = this.scene.player;
        if (player && player.active) {
            const distance = Phaser.Math.Distance.Between(bomb.x, bomb.y, player.x, player.y);

            if (distance < bomb.explosionRadius) {
                // Calculate damage based on distance
                const damageMultiplier = 1 - (distance / bomb.explosionRadius);
                const damage = Math.floor(bomb.damage * damageMultiplier);

                // Apply damage
                player.takeDamage(damage);

                // Apply knockback
                const angle = Phaser.Math.Angle.Between(bomb.x, bomb.y, player.x, player.y);
                const knockbackForce = 400 * damageMultiplier;
                player.setVelocity(
                    Math.cos(angle) * knockbackForce,
                    Math.sin(angle) * knockbackForce
                );
            }
        }

        // Auto-destroy explosion
        this.scene.time.delayedCall(1000, () => {
            explosion.remove();
        });

        // Remove from update list
        this.scene.updateList.remove(bomb);

        // Destroy bomb
        bomb.destroy();

        // Camera shake
        this.scene.cameras.main.shake(500, 0.03);
    }

    /**
     * Add a particle trail to a projectile
     * @param {Phaser.GameObjects.Sprite} projectile - The projectile to add a trail to
     * @param {number} color - Color of the trail
     */
    addProjectileTrail(projectile, color) {
        // Create particle emitter
        const particles = this.scene.add.particles('particle-blue');
        const emitter = particles.createEmitter({
            speed: 0,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 300
        });

        // Set particle color
        emitter.setTint(color);

        // Follow projectile
        emitter.startFollow(projectile);

        // Store reference to emitter
        projectile.trailEmitter = emitter;

        // Clean up when projectile is destroyed
        projectile.on('destroy', () => {
            if (emitter) {
                emitter.stop();
                this.scene.time.delayedCall(300, () => {
                    particles.destroy();
                });
            }
        });
    }

    /**
     * Drones attack pattern - spawns attack drones
     */
    dronesPattern() {
        // Get player reference
        const player = this.scene.player;
        if (!player) return;

        // Visual effect before spawning drones
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAttackEffect({
                color: 0xff9933,
                duration: 1000
            });
        }

        // Spawn drones
        const droneCount = 3;
        for (let i = 0; i < droneCount; i++) {
            this.spawnDrone(i * 120);
        }
    }

    /**
     * Spawn a drone
     * @param {number} angleOffset - Angle offset for spawn position
     */
    spawnDrone(angleOffset) {
        // Calculate spawn position
        const angle = Phaser.Math.DegToRad(angleOffset);
        const distance = 50;
        const x = this.boss.x + Math.cos(angle) * distance;
        const y = this.boss.y + Math.sin(angle) * distance;

        // Create drone
        const drone = this.scene.physics.add.sprite(x, y, 'enemy');

        // Set drone properties
        drone.setScale(0.5);
        drone.setTint(0xff9933);
        drone.damage = 10;
        drone.health = 30;
        drone.maxHealth = 30;
        drone.lifespan = 8000;
        drone.born = this.scene.time.now;

        // Add to group
        this.drones.add(drone);

        // Add drone behavior
        this.addDroneBehavior(drone);

        // Add particle effect
        this.addDroneParticles(drone);

        // Destroy drone after lifespan
        this.scene.time.delayedCall(drone.lifespan, () => {
            if (drone.active) {
                this.destroyDrone(drone);
            }
        });
    }

    /**
     * Add behavior to a drone
     * @param {Phaser.GameObjects.Sprite} drone - The drone to add behavior to
     */
    addDroneBehavior(drone) {
        // Add update function
        drone.update = (time, delta) => {
            // Get player reference
            const player = this.scene.player;
            if (!player || !player.active) return;

            // Calculate direction to player
            const angle = Phaser.Math.Angle.Between(
                drone.x, drone.y,
                player.x, player.y
            );

            // Move towards player
            const speed = 150;
            drone.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            // Rotate towards player
            drone.rotation = angle + Math.PI/2;

            // Fire at player occasionally
            if (time % 2000 < 20) {
                this.droneFire(drone);
            }

            // Check if lifespan expired
            if (time - drone.born >= drone.lifespan) {
                this.destroyDrone(drone);
            }
        };

        // Add to scene's update list
        this.scene.updateList.add(drone);
    }

    /**
     * Add particle effects to a drone
     * @param {Phaser.GameObjects.Sprite} drone - The drone to add particles to
     */
    addDroneParticles(drone) {
        // Create particle emitter
        const particles = this.scene.add.particles('particle-blue');
        const emitter = particles.createEmitter({
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            frequency: 50
        });

        // Set particle color
        emitter.setTint(0xff9933);

        // Follow drone
        emitter.startFollow(drone);

        // Store reference to emitter
        drone.particleEmitter = particles;
    }

    /**
     * Make a drone fire at the player
     * @param {Phaser.GameObjects.Sprite} drone - The drone that's firing
     */
    droneFire(drone) {
        // Get player reference
        const player = this.scene.player;
        if (!player || !player.active) return;

        // Calculate direction to player
        const angle = Phaser.Math.Angle.Between(
            drone.x, drone.y,
            player.x, player.y
        );

        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            drone.x, drone.y,
            'enemy-projectile'
        );

        // Set projectile properties
        projectile.setScale(0.8);
        projectile.setTint(0xff9933);
        projectile.damage = 8;
        projectile.lifespan = 1500;
        projectile.born = this.scene.time.now;

        // Add to group
        this.scene.nemesisProjectiles.add(projectile);

        // Set velocity based on angle
        const speed = 250;
        projectile.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Add particle trail
        this.addProjectileTrail(projectile, 0xff9933);
    }

    /**
     * Destroy a drone with effects
     * @param {Phaser.GameObjects.Sprite} drone - The drone to destroy
     */
    destroyDrone(drone) {
        // Create explosion effect
        const explosion = this.scene.add.particles('particle-blue').createEmitter({
            x: drone.x,
            y: drone.y,
            speed: { min: 50, max: 150 },
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            quantity: 15
        });

        // Set explosion color
        explosion.setTint(0xff9933);

        // Auto-destroy explosion
        this.scene.time.delayedCall(500, () => {
            explosion.remove();
        });

        // Stop particle emitter
        if (drone.particleEmitter) {
            drone.particleEmitter.destroy();
        }

        // Remove from update list
        this.scene.updateList.remove(drone);

        // Destroy drone
        drone.destroy();
    }

    /**
     * Mines attack pattern - places explosive mines
     */
    minesPattern() {
        // Visual effect before placing mines
        if (this.boss.effectsManager) {
            this.boss.effectsManager.showAttackEffect({
                color: 0xffcc33,
                duration: 1000
            });
        }

        // Place mines
        const mineCount = 5;
        for (let i = 0; i < mineCount; i++) {
            // Calculate mine position
            const angle = Phaser.Math.DegToRad(i * (360 / mineCount));
            const distance = Phaser.Math.Between(100, 200);
            const x = this.boss.x + Math.cos(angle) * distance;
            const y = this.boss.y + Math.sin(angle) * distance;

            // Place mine with delay
            this.scene.time.delayedCall(i * 200, () => {
                this.placeMine(x, y);
            });
        }
    }

    /**
     * Place a mine at the specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    placeMine(x, y) {
        // Create mine
        const mine = this.scene.physics.add.sprite(x, y, 'enemy-projectile');

        // Set mine properties
        mine.setScale(1.5);
        mine.setTint(0xffcc33);
        mine.damage = 25;
        mine.lifespan = 5000;
        mine.born = this.scene.time.now;
        mine.explosionRadius = 80;

        // Add to group
        this.mines.add(mine);

        // Add pulse effect
        this.addMinePulseEffect(mine);

        // Add proximity detection
        this.addMineProximityDetection(mine);

        // Explode after lifespan
        this.scene.time.delayedCall(mine.lifespan, () => {
            if (mine.active) {
                this.explodeMine(mine);
            }
        });
    }

    /**
     * Add pulse effect to a mine
     * @param {Phaser.GameObjects.Sprite} mine - The mine to add effect to
     */
    addMinePulseEffect(mine) {
        // Create pulse graphics
        const pulseGraphics = this.scene.add.graphics();
        mine.pulseGraphics = pulseGraphics;

        // Add update function
        mine.update = (time, delta) => {
            // Calculate pulse size
            const pulseSize = 1 + Math.sin(time * 0.01) * 0.2;

            // Calculate pulse alpha
            const pulseAlpha = 0.5 + Math.sin(time * 0.01) * 0.3;

            // Draw pulse
            pulseGraphics.clear();
            pulseGraphics.fillStyle(0xffcc33, pulseAlpha * 0.3);
            pulseGraphics.fillCircle(mine.x, mine.y, mine.width * pulseSize);
            pulseGraphics.lineStyle(2, 0xffcc33, pulseAlpha);
            pulseGraphics.strokeCircle(mine.x, mine.y, mine.width * pulseSize);

            // Pulse faster as lifespan nears end
            if (time - mine.born > mine.lifespan * 0.7) {
                mine.setScale(1.5 + Math.sin(time * 0.02) * 0.2);
            }
        };

        // Add to scene's update list
        this.scene.updateList.add(mine);
    }

    /**
     * Add proximity detection to a mine
     * @param {Phaser.GameObjects.Sprite} mine - The mine to add detection to
     */
    addMineProximityDetection(mine) {
        // Add proximity check to update function
        const originalUpdate = mine.update;
        mine.update = (time, delta) => {
            // Call original update
            originalUpdate.call(mine, time, delta);

            // Get player reference
            const player = this.scene.player;
            if (!player || !player.active) return;

            // Calculate distance to player
            const distance = Phaser.Math.Distance.Between(
                mine.x, mine.y,
                player.x, player.y
            );

            // Explode if player is close
            if (distance < mine.explosionRadius) {
                this.explodeMine(mine);
            }
        };
    }

    /**
     * Explode a mine with effects
     * @param {Phaser.GameObjects.Sprite} mine - The mine to explode
     */
    explodeMine(mine) {
        // Create explosion effect
        const explosion = this.scene.add.particles('particle-blue').createEmitter({
            x: mine.x,
            y: mine.y,
            speed: { min: 100, max: 300 },
            scale: { start: 1.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            quantity: 30
        });

        // Set explosion color
        explosion.setTint(0xffcc33);

        // Create flash
        const flash = this.scene.add.circle(mine.x, mine.y, mine.explosionRadius, 0xffcc33, 0.7);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => {
                flash.destroy();
            }
        });

        // Damage player if in range
        const player = this.scene.player;
        if (player && player.active) {
            const distance = Phaser.Math.Distance.Between(
                mine.x, mine.y,
                player.x, player.y
            );

            if (distance < mine.explosionRadius) {
                // Calculate damage based on distance
                const damageMultiplier = 1 - (distance / mine.explosionRadius);
                const damage = Math.floor(mine.damage * damageMultiplier);

                // Apply damage
                player.takeDamage(damage);

                // Apply knockback
                const angle = Phaser.Math.Angle.Between(
                    mine.x, mine.y,
                    player.x, player.y
                );

                const knockbackForce = 300 * damageMultiplier;
                player.setVelocity(
                    Math.cos(angle) * knockbackForce,
                    Math.sin(angle) * knockbackForce
                );
            }
        }

        // Auto-destroy explosion
        this.scene.time.delayedCall(800, () => {
            explosion.remove();
        });

        // Remove from update list
        this.scene.updateList.remove(mine);

        // Destroy pulse graphics
        if (mine.pulseGraphics) {
            mine.pulseGraphics.destroy();
        }

        // Destroy mine
        mine.destroy();

        // Camera shake
        this.scene.cameras.main.shake(200, 0.01);
    }

    /**
     * Clean up all effects and projectiles
     */
    destroy() {
        // Clear all active effects
        this.clearBeamEffect();
        this.clearShieldEffect();

        // Destroy graphics
        if (this.beamGraphics) {
            this.beamGraphics.destroy();
        }

        if (this.shieldGraphics) {
            this.shieldGraphics.destroy();
        }

        // Clear timers
        Object.values(this.timers).forEach(timer => {
            if (timer) {
                timer.remove();
            }
        });

        // Destroy all projectiles
        if (this.scene.nemesisProjectiles) {
            this.scene.nemesisProjectiles.clear(true, true);
        }

        // Destroy all drones
        if (this.drones) {
            this.drones.getChildren().forEach(drone => {
                this.destroyDrone(drone);
            });
            this.drones.clear(true, true);
        }

        // Destroy all mines
        if (this.mines) {
            this.mines.getChildren().forEach(mine => {
                this.explodeMine(mine);
            });
            this.mines.clear(true, true);
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisAttackPatterns = NemesisAttackPatterns;
}
