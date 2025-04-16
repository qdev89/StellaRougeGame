/**
 * Drone Commander Mini-Boss
 * A mini-boss that spawns drones and provides support
 * Extends the MiniBoss class
 */
class DroneCommander extends MiniBoss {
    constructor(scene, x, y) {
        // Call parent constructor with the drone commander type
        super(scene, x, y, 'enemy-carrier', 'DRONE_COMMANDER');
        
        // Set up drone commander specific properties
        this.maxDrones = 3; // Maximum number of active drones
        this.droneSpawnRate = 5000; // ms between spawns
        this.lastSpawnTime = 0;
        this.activeDrones = [];
        
        // Support beam properties
        this.supportBeamActive = false;
        this.supportBeamTarget = null;
        this.supportBeamCooldown = 8000; // ms between support beams
        this.lastSupportBeamTime = 0;
        
        // Create drone commander specific visual effects
        this.createDroneCommanderEffects();
    }
    
    /**
     * Create visual effects specific to the drone commander
     */
    createDroneCommanderEffects() {
        // Create hangar bay effect
        this.hangarBay = this.scene.add.rectangle(this.x, this.y + 20, 30, 10, 0x333333);
        this.hangarBay.setDepth(this.depth - 1);
        
        // Create support beam effect (initially invisible)
        this.supportBeam = this.scene.add.rectangle(this.x, this.y, 10, 100, 0x33ff33, 0);
        this.supportBeam.setDepth(this.depth - 1);
        
        // Add command antenna
        this.antenna = this.scene.add.rectangle(this.x, this.y - 25, 5, 15, 0x33cc33);
        this.antenna.setDepth(this.depth + 1);
        
        // Add antenna glow
        this.antennaGlow = this.scene.add.sprite(this.x, this.y - 35, 'particle-blue')
            .setScale(0.4)
            .setAlpha(0.7)
            .setTint(0x33cc33)
            .setDepth(this.depth + 1);
        
        // Pulse effect for antenna glow
        this.scene.tweens.add({
            targets: this.antennaGlow,
            scale: 0.6,
            alpha: 0.9,
            duration: 1000,
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
        
        // Spawn drones if needed
        if (time - this.lastSpawnTime > this.droneSpawnRate && this.activeDrones.length < this.maxDrones) {
            this.spawnDrone();
            this.lastSpawnTime = time;
        }
        
        // Clean up destroyed drones from tracking array
        this.activeDrones = this.activeDrones.filter(drone => drone.active);
        
        // Check if we should activate support beam
        if (time - this.lastSupportBeamTime > this.supportBeamCooldown && this.activeDrones.length > 0) {
            this.activateSupportBeam();
            this.lastSupportBeamTime = time;
        }
        
        // Update support beam if active
        if (this.supportBeamActive) {
            this.updateSupportBeam();
        }
        
        // In phase 1, use regular shots
        if (this.canFire) {
            // Fire regular shots
            this.fireRegularShot(playerShip);
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate, () => {
                this.canFire = true;
            });
        }
        
        // Move in a slow pattern
        this.x += Math.sin(time * 0.001) * 1;
        this.y += Math.cos(time * 0.0005) * 0.5;
    }
    
    /**
     * Update method for phase 2
     */
    updatePhase2(time, delta, playerShip) {
        if (!playerShip || !playerShip.active) return;
        
        // Update visual effects positions
        this.updateEffectsPositions();
        
        // Spawn drones more frequently in phase 2
        if (time - this.lastSpawnTime > this.droneSpawnRate * 0.6 && this.activeDrones.length < this.maxDrones) {
            this.spawnDrone();
            this.lastSpawnTime = time;
        }
        
        // Clean up destroyed drones from tracking array
        this.activeDrones = this.activeDrones.filter(drone => drone.active);
        
        // Check if we should activate support beam (more frequent in phase 2)
        if (time - this.lastSupportBeamTime > this.supportBeamCooldown * 0.7 && this.activeDrones.length > 0) {
            this.activateSupportBeam();
            this.lastSupportBeamTime = time;
        }
        
        // Update support beam if active
        if (this.supportBeamActive) {
            this.updateSupportBeam();
        }
        
        // In phase 2, use spread shots
        if (this.canFire) {
            // Fire spread shots
            this.fireSpreadShot(0, 3, 30);
            this.fireSpreadShot(1, 3, 30);
            this.fireSpreadShot(2, 3, 30);
            
            // Set cooldown
            this.canFire = false;
            this.scene.time.delayedCall(this.fireRate, () => {
                this.canFire = true;
            });
        }
        
        // Move more aggressively in phase 2
        this.x += Math.sin(time * 0.002) * 1.5;
        this.y += Math.cos(time * 0.001) * 1;
        
        // Make antenna glow more intense in phase 2
        if (this.antennaGlow) {
            this.antennaGlow.setTint(0x00ff00);
            this.antennaGlow.setScale(0.6 + Math.sin(time * 0.005) * 0.2);
        }
    }
    
    /**
     * Update positions of visual effects
     */
    updateEffectsPositions() {
        // Update hangar bay position
        if (this.hangarBay) {
            this.hangarBay.x = this.x;
            this.hangarBay.y = this.y + 20;
        }
        
        // Update antenna position
        if (this.antenna) {
            this.antenna.x = this.x;
            this.antenna.y = this.y - 25;
        }
        
        // Update antenna glow position
        if (this.antennaGlow) {
            this.antennaGlow.x = this.x;
            this.antennaGlow.y = this.y - 35;
        }
    }
    
    /**
     * Spawn a drone
     */
    spawnDrone() {
        // Create drone at hangar position
        const drone = new EnemyDrone(
            this.scene,
            this.x,
            this.y + 30
        );
        
        // Add to scene's enemies group
        this.scene.enemies.add(drone);
        
        // Track this drone
        this.activeDrones.push(drone);
        
        // Visual effect for spawning
        this.scene.tweens.add({
            targets: drone,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 0.8 },
            duration: 500
        });
        
        // Flash hangar bay
        this.hangarBay.setFillStyle(0x33cc33);
        this.scene.time.delayedCall(200, () => {
            if (this.hangarBay && this.hangarBay.active) {
                this.hangarBay.setFillStyle(0x333333);
            }
        });
        
        // Set drone to orbit the commander
        drone.setData('behavior', 'orbit');
        drone.setData('orbitTarget', this);
        drone.setData('orbitDistance', 100);
        drone.setData('orbitSpeed', 0.02);
        drone.setData('orbitOffset', Math.random() * Math.PI * 2);
    }
    
    /**
     * Activate support beam to buff a drone
     */
    activateSupportBeam() {
        // Only activate if we have drones
        if (this.activeDrones.length === 0) return;
        
        // Select a random drone to support
        const targetIndex = Math.floor(Math.random() * this.activeDrones.length);
        this.supportBeamTarget = this.activeDrones[targetIndex];
        
        // Activate beam
        this.supportBeamActive = true;
        
        // Visual effect
        this.supportBeam.setAlpha(0.7);
        
        // Deactivate after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            this.deactivateSupportBeam();
        });
    }
    
    /**
     * Update support beam position and effect
     */
    updateSupportBeam() {
        if (!this.supportBeamTarget || !this.supportBeamTarget.active) {
            this.deactivateSupportBeam();
            return;
        }
        
        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.supportBeamTarget.x, this.supportBeamTarget.y
        );
        
        // Calculate distance to target
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.supportBeamTarget.x, this.supportBeamTarget.y
        );
        
        // Position beam
        this.supportBeam.x = this.x;
        this.supportBeam.y = this.y;
        this.supportBeam.rotation = angle;
        this.supportBeam.width = distance;
        
        // Apply support effect to target
        this.supportBeamTarget.health = Math.min(
            this.supportBeamTarget.health + 0.1,
            this.supportBeamTarget.maxHealth
        );
        
        // Buff target
        if (!this.supportBeamTarget.isBuffed) {
            this.supportBeamTarget.isBuffed = true;
            this.supportBeamTarget.speed *= 1.3;
            this.supportBeamTarget.fireRate *= 0.7;
            this.supportBeamTarget.setTint(0x33ff33);
        }
    }
    
    /**
     * Deactivate support beam
     */
    deactivateSupportBeam() {
        this.supportBeamActive = false;
        this.supportBeam.setAlpha(0);
        
        // Remove buff from target
        if (this.supportBeamTarget && this.supportBeamTarget.active) {
            this.supportBeamTarget.isBuffed = false;
            this.supportBeamTarget.speed = this.supportBeamTarget.settings.SPEED;
            this.supportBeamTarget.fireRate = this.supportBeamTarget.settings.FIRE_RATE;
            
            // Reset tint (accounting for elite status)
            if (this.supportBeamTarget.isElite) {
                this.supportBeamTarget.setTint(0xff5500);
            } else {
                this.supportBeamTarget.clearTint();
            }
        }
        
        this.supportBeamTarget = null;
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
        laser.setTint(0x33cc33);
        
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
     * Override fireAtPlayer to use the drone commander's attack pattern
     */
    fireAtPlayer(playerShip) {
        // Don't use default firing behavior, we handle it in phase updates
    }
    
    /**
     * Override destroy to clean up effects and drones
     */
    destroy() {
        // Clean up hangar bay
        if (this.hangarBay) {
            this.hangarBay.destroy();
        }
        
        // Clean up support beam
        if (this.supportBeam) {
            this.supportBeam.destroy();
        }
        
        // Clean up antenna
        if (this.antenna) {
            this.antenna.destroy();
        }
        
        // Clean up antenna glow
        if (this.antennaGlow) {
            this.antennaGlow.destroy();
        }
        
        // Call parent destroy
        super.destroy();
    }
}
