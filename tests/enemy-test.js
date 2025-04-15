/**
 * Enemy Test Script
 * Tests the functionality of the different enemy types
 */

// Create a test scene
class EnemyTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EnemyTestScene' });
    }

    preload() {
        // Load test assets
        this.load.image('player-ship', '../src/assets/images/player-ship.png');
        this.load.image('enemy-drone', '../src/assets/images/enemy-drone.png');
        this.load.image('enemy-gunship', '../src/assets/images/enemy-gunship.png');
        this.load.image('enemy-destroyer', '../src/assets/images/enemy-destroyer.png');
        this.load.image('laser-red', '../src/assets/images/laser-red.png');
        this.load.image('plasma-bolt', '../src/assets/images/plasma-bolt.png');
        this.load.image('star-particle', '../src/assets/images/star-particle.png');
    }

    create() {
        console.log('EnemyTestScene: Starting enemy tests...');
        
        // Create a simple background
        this.add.rectangle(0, 0, 800, 600, 0x000022).setOrigin(0);
        
        // Create a dummy player for targeting
        this.player = this.physics.add.sprite(400, 500, 'player-ship');
        this.player.setCollideWorldBounds(true);
        
        // Create test enemies
        this.createTestEnemies();
        
        // Add UI for test controls
        this.createTestUI();
        
        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Test results container
        this.testResults = {
            droneMovement: false,
            droneAttack: false,
            gunshipMovement: false,
            gunshipAttack: false,
            destroyerMovement: false,
            destroyerAttack: false,
            destroyerShield: false
        };
    }
    
    createTestEnemies() {
        // Create one of each enemy type for testing
        try {
            // Create a drone
            this.drone = new EnemyDrone(this, 200, 100);
            this.enemies = [this.drone];
            
            // Create a gunship
            this.gunship = new EnemyGunship(this, 400, 100);
            this.enemies.push(this.gunship);
            
            // Create a destroyer
            this.destroyer = new EnemyDestroyer(this, 600, 100);
            this.enemies.push(this.destroyer);
            
            console.log('Test enemies created successfully');
        } catch (error) {
            console.error('Error creating test enemies:', error);
            this.add.text(400, 300, 'ERROR: Could not create enemies', {
                color: '#ff0000',
                fontSize: '24px'
            }).setOrigin(0.5);
        }
    }
    
    createTestUI() {
        // Add test instructions
        this.add.text(400, 30, 'ENEMY TEST SCENE', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(400, 60, 'Use arrow keys to move player ship', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#cccccc'
        }).setOrigin(0.5);
        
        // Add test result display
        this.resultText = this.add.text(20, 100, 'Running tests...', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#33ff33'
        });
        
        // Add test control buttons
        const testButton = this.add.rectangle(700, 550, 160, 40, 0x333333)
            .setInteractive()
            .setOrigin(0.5);
            
        this.add.text(700, 550, 'RUN ALL TESTS', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        testButton.on('pointerdown', () => {
            this.runAllTests();
        });
    }
    
    update() {
        // Update player movement
        this.handlePlayerMovement();
        
        // Update enemies
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.update(this.time.now, this.time.delta, this.player);
                
                // Check for drone movement
                if (enemy instanceof EnemyDrone && 
                    (enemy.body.velocity.x !== 0 || enemy.body.velocity.y !== 0)) {
                    this.testResults.droneMovement = true;
                }
                
                // Check for gunship movement
                if (enemy instanceof EnemyGunship && 
                    (enemy.body.velocity.x !== 0 || enemy.body.velocity.y !== 0)) {
                    this.testResults.gunshipMovement = true;
                }
                
                // Check for destroyer movement
                if (enemy instanceof EnemyDestroyer && 
                    (enemy.body.velocity.x !== 0 || enemy.body.velocity.y !== 0)) {
                    this.testResults.destroyerMovement = true;
                }
                
                // Check for destroyer shield
                if (enemy instanceof EnemyDestroyer && enemy.hasShield) {
                    this.testResults.destroyerShield = true;
                }
            }
        });
        
        // Check for projectiles (indicates attack)
        if (this.drone && this.drone.projectiles && this.drone.projectiles.getLength() > 0) {
            this.testResults.droneAttack = true;
        }
        
        if (this.gunship && this.gunship.projectiles && this.gunship.projectiles.getLength() > 0) {
            this.testResults.gunshipAttack = true;
        }
        
        if (this.destroyer && this.destroyer.projectiles && this.destroyer.projectiles.getLength() > 0) {
            this.testResults.destroyerAttack = true;
        }
        
        // Update test results display
        this.updateResultsDisplay();
    }
    
    handlePlayerMovement() {
        // Reset velocity
        this.player.setVelocity(0);
        
        // Process keyboard input
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        }
        
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(200);
        }
    }
    
    updateResultsDisplay() {
        let resultText = 'TEST RESULTS:\n\n';
        
        // Format test results
        resultText += `Drone Movement: ${this.formatTestResult(this.testResults.droneMovement)}\n`;
        resultText += `Drone Attack: ${this.formatTestResult(this.testResults.droneAttack)}\n\n`;
        
        resultText += `Gunship Movement: ${this.formatTestResult(this.testResults.gunshipMovement)}\n`;
        resultText += `Gunship Attack: ${this.formatTestResult(this.testResults.gunshipAttack)}\n\n`;
        
        resultText += `Destroyer Movement: ${this.formatTestResult(this.testResults.destroyerMovement)}\n`;
        resultText += `Destroyer Attack: ${this.formatTestResult(this.testResults.destroyerAttack)}\n`;
        resultText += `Destroyer Shield: ${this.formatTestResult(this.testResults.destroyerShield)}\n`;
        
        this.resultText.setText(resultText);
    }
    
    formatTestResult(result) {
        return result ? '✓ PASS' : '✗ FAIL';
    }
    
    runAllTests() {
        console.log('Running all enemy tests...');
        
        // Force enemies to fire
        this.enemies.forEach(enemy => {
            enemy.canFire = true;
            enemy.fireAtPlayer(this.player);
        });
        
        // Test destroyer shield
        if (this.destroyer && this.destroyer.hasShield) {
            this.destroyer.takeDamage(10);
            this.testResults.destroyerShield = true;
        }
        
        // Log test results
        setTimeout(() => {
            console.log('Test results:', this.testResults);
            
            // Count passed tests
            const passedTests = Object.values(this.testResults).filter(result => result).length;
            const totalTests = Object.keys(this.testResults).length;
            
            console.log(`Passed ${passedTests} out of ${totalTests} tests`);
            
            // Add summary to UI
            this.add.text(400, 550, `Passed ${passedTests} out of ${totalTests} tests`, {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: passedTests === totalTests ? '#33ff33' : '#ffff33'
            }).setOrigin(0.5);
        }, 1000);
    }
}

// Create test config
const testConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [EnemyTestScene]
};

// Create test game instance when this script is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Phaser.Game(testConfig);
    console.log('Enemy test initialized');
});
