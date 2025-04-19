/**
 * Debug Tools
 * Utility functions for debugging and fixing common issues in the game
 */
class DebugTools {
    constructor(game) {
        this.game = game;
        this.isEnabled = false;
        this.debugContainer = null;
        this.debugText = null;
        this.fpsCounter = null;
        this.memoryUsage = null;
        this.entityCounter = null;
        this.logs = [];
        this.maxLogs = 10;
        
        // Performance metrics
        this.metrics = {
            fps: 0,
            memory: 0,
            entityCount: 0,
            drawCalls: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        // Initialize if enabled
        this.initialize();
    }
    
    /**
     * Initialize debug tools
     */
    initialize() {
        // Check if debug mode is enabled via URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.isEnabled = urlParams.has('debug');
        
        if (this.isEnabled) {
            console.log('Debug mode enabled');
            this.setupKeyboardShortcuts();
        }
    }
    
    /**
     * Set up keyboard shortcuts for debug functions
     */
    setupKeyboardShortcuts() {
        // Add event listeners for keyboard shortcuts
        window.addEventListener('keydown', (event) => {
            // Only process if debug mode is enabled
            if (!this.isEnabled) return;
            
            // Ctrl+Shift+D: Toggle debug overlay
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                this.toggleDebugOverlay();
            }
            
            // Ctrl+Shift+F: Fix common issues
            if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                this.fixCommonIssues();
            }
            
            // Ctrl+Shift+C: Clear all entities
            if (event.ctrlKey && event.shiftKey && event.key === 'C') {
                this.clearAllEntities();
            }
            
            // Ctrl+Shift+R: Reload current scene
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                this.reloadCurrentScene();
            }
            
            // Ctrl+Shift+G: God mode toggle
            if (event.ctrlKey && event.shiftKey && event.key === 'G') {
                this.toggleGodMode();
            }
            
            // Ctrl+Shift+S: Save game state
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                this.saveGameState();
            }
            
            // Ctrl+Shift+L: Load game state
            if (event.ctrlKey && event.shiftKey && event.key === 'L') {
                this.loadGameState();
            }
        });
    }
    
    /**
     * Toggle debug overlay
     */
    toggleDebugOverlay() {
        const activeScene = this.getActiveScene();
        if (!activeScene) return;
        
        if (this.debugContainer) {
            // Destroy existing debug overlay
            this.debugContainer.destroy();
            this.debugContainer = null;
            this.debugText = null;
            this.fpsCounter = null;
            this.memoryUsage = null;
            this.entityCounter = null;
            
            // Remove update event
            activeScene.events.off('update', this.updateDebugInfo, this);
            
            console.log('Debug overlay disabled');
        } else {
            // Create debug overlay
            this.createDebugOverlay(activeScene);
            
            // Add update event
            activeScene.events.on('update', this.updateDebugInfo, this);
            
            console.log('Debug overlay enabled');
        }
    }
    
    /**
     * Create debug overlay
     * @param {object} scene - The scene to add the overlay to
     */
    createDebugOverlay(scene) {
        // Create container
        this.debugContainer = scene.add.container(10, 10);
        this.debugContainer.setDepth(1000);
        
        // Create background
        const bg = scene.add.rectangle(0, 0, 300, 200, 0x000000, 0.7);
        bg.setOrigin(0, 0);
        this.debugContainer.add(bg);
        
        // Create FPS counter
        this.fpsCounter = scene.add.text(10, 10, 'FPS: 0', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff'
        });
        this.debugContainer.add(this.fpsCounter);
        
        // Create memory usage display
        this.memoryUsage = scene.add.text(10, 30, 'Memory: 0 MB', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff'
        });
        this.debugContainer.add(this.memoryUsage);
        
        // Create entity counter
        this.entityCounter = scene.add.text(10, 50, 'Entities: 0', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff'
        });
        this.debugContainer.add(this.entityCounter);
        
        // Create debug text
        this.debugText = scene.add.text(10, 70, 'Debug Log:', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ffffff',
            wordWrap: { width: 280 }
        });
        this.debugContainer.add(this.debugText);
        
        // Add initial log
        this.log('Debug overlay initialized');
    }
    
    /**
     * Update debug information
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    updateDebugInfo(time, delta) {
        if (!this.debugContainer) return;
        
        // Update FPS
        this.metrics.fps = Math.round(1000 / delta);
        this.fpsCounter.setText(`FPS: ${this.metrics.fps}`);
        
        // Update memory usage (if available)
        if (window.performance && window.performance.memory) {
            this.metrics.memory = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
            this.memoryUsage.setText(`Memory: ${this.metrics.memory} MB`);
        }
        
        // Update entity count
        const scene = this.getActiveScene();
        if (scene) {
            let entityCount = 0;
            
            // Count entities in common groups
            if (scene.enemies) entityCount += scene.enemies.getChildren().length;
            if (scene.playerProjectiles) entityCount += scene.playerProjectiles.getChildren().length;
            if (scene.enemyProjectiles) entityCount += scene.enemyProjectiles.getChildren().length;
            if (scene.powerups) entityCount += scene.powerups.getChildren().length;
            if (scene.hazards) entityCount += scene.hazards.getChildren().length;
            
            this.metrics.entityCount = entityCount;
            this.entityCounter.setText(`Entities: ${entityCount}`);
        }
        
        // Update debug text with logs
        this.debugText.setText(['Debug Log:'].concat(this.logs).join('\\n'));
    }
    
    /**
     * Add a log message to the debug overlay
     * @param {string} message - The message to log
     */
    log(message) {
        // Add timestamp
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        // Add to logs array
        this.logs.unshift(logMessage);
        
        // Limit log size
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }
        
        // Update debug text if it exists
        if (this.debugText) {
            this.debugText.setText(['Debug Log:'].concat(this.logs).join('\\n'));
        }
        
        // Also log to console
        console.log(logMessage);
    }
    
    /**
     * Fix common issues in the game
     */
    fixCommonIssues() {
        this.log('Fixing common issues...');
        
        const scene = this.getActiveScene();
        if (!scene) {
            this.log('No active scene found');
            return;
        }
        
        // Fix 1: Clear any orphaned projectiles
        this.clearOrphanedProjectiles(scene);
        
        // Fix 2: Reset player position if out of bounds
        this.resetPlayerPosition(scene);
        
        // Fix 3: Fix any stuck enemies
        this.fixStuckEnemies(scene);
        
        // Fix 4: Clear any excessive entities
        this.limitEntityCount(scene);
        
        // Fix 5: Reset any invalid game state
        this.resetInvalidGameState(scene);
        
        this.log('Common issues fixed');
    }
    
    /**
     * Clear orphaned projectiles
     * @param {object} scene - The current scene
     */
    clearOrphanedProjectiles(scene) {
        let count = 0;
        
        // Check player projectiles
        if (scene.playerProjectiles) {
            scene.playerProjectiles.getChildren().forEach(projectile => {
                // Check if projectile is out of bounds
                if (projectile.x < -100 || projectile.x > scene.cameras.main.width + 100 ||
                    projectile.y < -100 || projectile.y > scene.cameras.main.height + 100) {
                    projectile.destroy();
                    count++;
                }
            });
        }
        
        // Check enemy projectiles
        if (scene.enemyProjectiles) {
            scene.enemyProjectiles.getChildren().forEach(projectile => {
                // Check if projectile is out of bounds
                if (projectile.x < -100 || projectile.x > scene.cameras.main.width + 100 ||
                    projectile.y < -100 || projectile.y > scene.cameras.main.height + 100) {
                    projectile.destroy();
                    count++;
                }
            });
        }
        
        if (count > 0) {
            this.log(`Cleared ${count} orphaned projectiles`);
        }
    }
    
    /**
     * Reset player position if out of bounds
     * @param {object} scene - The current scene
     */
    resetPlayerPosition(scene) {
        if (scene.player) {
            const player = scene.player;
            const bounds = {
                left: 50,
                right: scene.cameras.main.width - 50,
                top: 50,
                bottom: scene.cameras.main.height - 50
            };
            
            let wasReset = false;
            
            // Check if player is out of bounds
            if (player.x < bounds.left) {
                player.x = bounds.left;
                wasReset = true;
            } else if (player.x > bounds.right) {
                player.x = bounds.right;
                wasReset = true;
            }
            
            if (player.y < bounds.top) {
                player.y = bounds.top;
                wasReset = true;
            } else if (player.y > bounds.bottom) {
                player.y = bounds.bottom;
                wasReset = true;
            }
            
            if (wasReset) {
                this.log('Reset player position');
            }
        }
    }
    
    /**
     * Fix stuck enemies
     * @param {object} scene - The current scene
     */
    fixStuckEnemies(scene) {
        let count = 0;
        
        if (scene.enemies) {
            scene.enemies.getChildren().forEach(enemy => {
                // Check if enemy is stuck (not moving for a long time)
                if (enemy.body && (enemy.body.velocity.x === 0 && enemy.body.velocity.y === 0)) {
                    // Reset enemy velocity
                    if (enemy.speed) {
                        const angle = Phaser.Math.Between(0, 360);
                        enemy.body.velocity.x = enemy.speed * Math.cos(angle);
                        enemy.body.velocity.y = enemy.speed * Math.sin(angle);
                        count++;
                    }
                }
                
                // Check if enemy is out of bounds
                if (enemy.x < -200 || enemy.x > scene.cameras.main.width + 200 ||
                    enemy.y < -200 || enemy.y > scene.cameras.main.height + 200) {
                    enemy.destroy();
                    count++;
                }
            });
        }
        
        if (count > 0) {
            this.log(`Fixed ${count} stuck or out-of-bounds enemies`);
        }
    }
    
    /**
     * Limit entity count to prevent performance issues
     * @param {object} scene - The current scene
     */
    limitEntityCount(scene) {
        const maxEntities = 200;
        let totalEntities = 0;
        let removed = 0;
        
        // Count total entities
        if (scene.enemies) totalEntities += scene.enemies.getChildren().length;
        if (scene.playerProjectiles) totalEntities += scene.playerProjectiles.getChildren().length;
        if (scene.enemyProjectiles) totalEntities += scene.enemyProjectiles.getChildren().length;
        if (scene.powerups) totalEntities += scene.powerups.getChildren().length;
        if (scene.hazards) totalEntities += scene.hazards.getChildren().length;
        
        // If too many entities, start removing the oldest ones
        if (totalEntities > maxEntities) {
            const toRemove = totalEntities - maxEntities;
            
            // Remove enemy projectiles first
            if (scene.enemyProjectiles) {
                const projectiles = scene.enemyProjectiles.getChildren();
                for (let i = 0; i < Math.min(toRemove - removed, projectiles.length); i++) {
                    projectiles[i].destroy();
                    removed++;
                }
            }
            
            // Then remove player projectiles
            if (removed < toRemove && scene.playerProjectiles) {
                const projectiles = scene.playerProjectiles.getChildren();
                for (let i = 0; i < Math.min(toRemove - removed, projectiles.length); i++) {
                    projectiles[i].destroy();
                    removed++;
                }
            }
            
            // Then remove powerups
            if (removed < toRemove && scene.powerups) {
                const powerups = scene.powerups.getChildren();
                for (let i = 0; i < Math.min(toRemove - removed, powerups.length); i++) {
                    powerups[i].destroy();
                    removed++;
                }
            }
            
            // Finally remove enemies (but keep at least a few)
            if (removed < toRemove && scene.enemies) {
                const enemies = scene.enemies.getChildren();
                const keepCount = Math.min(5, enemies.length);
                for (let i = 0; i < Math.min(toRemove - removed, enemies.length - keepCount); i++) {
                    enemies[i].destroy();
                    removed++;
                }
            }
            
            this.log(`Removed ${removed} entities to prevent performance issues`);
        }
    }
    
    /**
     * Reset invalid game state
     * @param {object} scene - The current scene
     */
    resetInvalidGameState(scene) {
        // Check if player exists but has invalid health
        if (scene.player) {
            if (isNaN(scene.player.health) || scene.player.health < 0) {
                scene.player.health = 1;
                this.log('Fixed invalid player health');
            }
            
            if (isNaN(scene.player.shield) || scene.player.shield < 0) {
                scene.player.shield = 0;
                this.log('Fixed invalid player shield');
            }
        }
        
        // Check if score is invalid
        if (scene.score !== undefined && (isNaN(scene.score) || scene.score < 0)) {
            scene.score = 0;
            this.log('Fixed invalid score');
        }
        
        // Check if game is in an invalid state (paused but not showing pause menu)
        if (scene.isPaused && !scene.pauseMenu) {
            scene.isPaused = false;
            scene.physics.resume();
            this.log('Fixed invalid pause state');
        }
    }
    
    /**
     * Clear all entities in the current scene
     */
    clearAllEntities() {
        const scene = this.getActiveScene();
        if (!scene) {
            this.log('No active scene found');
            return;
        }
        
        let count = 0;
        
        // Clear enemies
        if (scene.enemies) {
            count += scene.enemies.getChildren().length;
            scene.enemies.clear(true, true);
        }
        
        // Clear projectiles
        if (scene.playerProjectiles) {
            count += scene.playerProjectiles.getChildren().length;
            scene.playerProjectiles.clear(true, true);
        }
        
        if (scene.enemyProjectiles) {
            count += scene.enemyProjectiles.getChildren().length;
            scene.enemyProjectiles.clear(true, true);
        }
        
        // Clear powerups
        if (scene.powerups) {
            count += scene.powerups.getChildren().length;
            scene.powerups.clear(true, true);
        }
        
        // Clear hazards
        if (scene.hazards) {
            count += scene.hazards.getChildren().length;
            scene.hazards.clear(true, true);
        }
        
        this.log(`Cleared ${count} entities`);
    }
    
    /**
     * Reload the current scene
     */
    reloadCurrentScene() {
        const scene = this.getActiveScene();
        if (!scene) {
            this.log('No active scene found');
            return;
        }
        
        const key = scene.scene.key;
        scene.scene.restart();
        this.log(`Reloaded scene: ${key}`);
    }
    
    /**
     * Toggle god mode for the player
     */
    toggleGodMode() {
        const scene = this.getActiveScene();
        if (!scene || !scene.player) {
            this.log('No player found');
            return;
        }
        
        // Toggle invincibility
        scene.player.isGodMode = !scene.player.isGodMode;
        
        if (scene.player.isGodMode) {
            // Make player invincible
            scene.player.invincible = true;
            
            // Store original take damage function
            if (!scene.player._originalTakeDamage) {
                scene.player._originalTakeDamage = scene.player.takeDamage;
                
                // Replace with no-op function
                scene.player.takeDamage = function() {
                    return false;
                };
            }
            
            // Give infinite ammo
            scene.player.ammo = 999;
            scene.player.maxAmmo = 999;
            
            this.log('God mode enabled');
        } else {
            // Restore original invincibility state
            scene.player.invincible = false;
            
            // Restore original take damage function
            if (scene.player._originalTakeDamage) {
                scene.player.takeDamage = scene.player._originalTakeDamage;
                scene.player._originalTakeDamage = null;
            }
            
            // Restore normal ammo
            scene.player.maxAmmo = 100;
            scene.player.ammo = Math.min(scene.player.ammo, scene.player.maxAmmo);
            
            this.log('God mode disabled');
        }
    }
    
    /**
     * Save the current game state
     */
    saveGameState() {
        const scene = this.getActiveScene();
        if (!scene) {
            this.log('No active scene found');
            return;
        }
        
        try {
            // Create a snapshot of the current game state
            const gameState = {
                scene: scene.scene.key,
                timestamp: Date.now(),
                player: scene.player ? {
                    x: scene.player.x,
                    y: scene.player.y,
                    health: scene.player.health,
                    shield: scene.player.shield,
                    ammo: scene.player.ammo,
                    weaponType: scene.player.weaponType
                } : null,
                score: scene.score,
                sector: scene.currentSector,
                upgrades: scene.game.global.currentRun.upgrades,
                penalties: scene.game.global.currentRun.penalties
            };
            
            // Save to local storage
            localStorage.setItem('stellarRogueDebugSave', JSON.stringify(gameState));
            
            this.log('Game state saved');
        } catch (error) {
            this.log(`Error saving game state: ${error.message}`);
        }
    }
    
    /**
     * Load a saved game state
     */
    loadGameState() {
        try {
            // Load from local storage
            const savedState = localStorage.getItem('stellarRogueDebugSave');
            if (!savedState) {
                this.log('No saved game state found');
                return;
            }
            
            const gameState = JSON.parse(savedState);
            
            // Check if saved state is valid
            if (!gameState || !gameState.scene) {
                this.log('Invalid saved game state');
                return;
            }
            
            // Start the saved scene
            this.game.scene.start(gameState.scene, {
                loadedState: gameState
            });
            
            this.log(`Loaded game state from ${new Date(gameState.timestamp).toLocaleString()}`);
        } catch (error) {
            this.log(`Error loading game state: ${error.message}`);
        }
    }
    
    /**
     * Get the currently active scene
     * @returns {object} The active scene
     */
    getActiveScene() {
        if (!this.game || !this.game.scene) return null;
        
        // Find the active scene
        for (const scene of this.game.scene.scenes) {
            if (this.game.scene.isActive(scene)) {
                return this.game.scene.getScene(scene);
            }
        }
        
        return null;
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.DebugTools = DebugTools;
}
