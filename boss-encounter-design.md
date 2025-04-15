# Boss Encounter Technical Design

## Overview

This document outlines the technical design for implementing boss encounters in Stellar Rogue. Boss encounters will serve as climactic challenges at the end of each sector, providing players with a significant test of skill and rewarding them with special upgrades and progression to the next sector.

## Core Components

### 1. Boss Entity Class

```javascript
class BossEnemy extends Enemy {
    constructor(scene, x, y, texture, config) {
        super(scene, x, y, texture);
        
        // Boss-specific properties
        this.phases = config.phases || [];
        this.currentPhase = 0;
        this.phaseThresholds = config.phaseThresholds || [0.75, 0.5, 0.25];
        this.maxHealth = config.health || 1000;
        this.health = this.maxHealth;
        this.attackPatterns = config.attackPatterns || [];
        this.currentPattern = null;
        this.rewards = config.rewards || [];
        
        // Visual elements
        this.shieldEffect = null;
        this.weaponPorts = [];
        this.engineEffect = null;
        
        // State management
        this.stateMachine = new StateMachine(this);
        this.setupStateMachine();
        
        // Initialize boss
        this.setupPhysics();
        this.setupWeapons();
        this.setupVisuals();
    }
    
    setupStateMachine() {
        // Define states for different phases and behaviors
        this.stateMachine.addState('spawn', {
            onEnter: this.onSpawnEnter.bind(this),
            onUpdate: this.onSpawnUpdate.bind(this),
            onExit: this.onSpawnExit.bind(this)
        });
        
        this.stateMachine.addState('phase1', {
            onEnter: this.onPhase1Enter.bind(this),
            onUpdate: this.onPhase1Update.bind(this),
            onExit: this.onPhase1Exit.bind(this)
        });
        
        // Add more phases as needed
        
        this.stateMachine.addState('defeated', {
            onEnter: this.onDefeatedEnter.bind(this),
            onUpdate: this.onDefeatedUpdate.bind(this)
        });
        
        // Start with spawn state
        this.stateMachine.setState('spawn');
    }
    
    update(time, delta) {
        super.update(time, delta);
        
        // Update state machine
        this.stateMachine.update(delta);
        
        // Check for phase transitions
        this.checkPhaseTransition();
        
        // Update visual effects
        this.updateVisuals(delta);
    }
    
    checkPhaseTransition() {
        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth;
        
        // Check if we should transition to a new phase
        for (let i = this.currentPhase; i < this.phaseThresholds.length; i++) {
            if (healthPercentage <= this.phaseThresholds[i]) {
                this.transitionToPhase(i + 1);
                break;
            }
        }
    }
    
    transitionToPhase(phaseIndex) {
        if (phaseIndex === this.currentPhase) return;
        
        this.currentPhase = phaseIndex;
        this.stateMachine.setState(`phase${phaseIndex}`);
        
        // Trigger phase transition effects
        this.scene.cameras.main.shake(500, 0.01);
        this.scene.events.emit('boss-phase-change', this.currentPhase);
    }
    
    takeDamage(amount) {
        super.takeDamage(amount);
        
        // Check if boss is defeated
        if (this.health <= 0) {
            this.stateMachine.setState('defeated');
        }
    }
    
    // State handlers for different phases
    onSpawnEnter() {
        // Animation and effects for boss entrance
    }
    
    onSpawnUpdate(delta) {
        // Move to initial position
    }
    
    onSpawnExit() {
        // Transition to first attack phase
    }
    
    onPhase1Enter() {
        // Setup for first phase
        this.currentPattern = this.attackPatterns[0];
    }
    
    onPhase1Update(delta) {
        // Execute current attack pattern
        this.executeAttackPattern(this.currentPattern, delta);
    }
    
    onPhase1Exit() {
        // Clean up phase 1 specific elements
    }
    
    onDefeatedEnter() {
        // Start defeat sequence
        this.scene.events.emit('boss-defeated', this);
    }
    
    onDefeatedUpdate(delta) {
        // Play defeat animation
    }
    
    executeAttackPattern(pattern, delta) {
        // Execute the current attack pattern
        if (pattern && typeof pattern.execute === 'function') {
            pattern.execute(delta);
        }
    }
    
    grantRewards() {
        // Grant rewards to the player
        return this.rewards;
    }
}
```

### 2. Boss Arena Scene

```javascript
class BossArenaScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.BOSS_ARENA });
    }
    
    init(data) {
        // Get data from previous scene
        this.sectorLevel = data.sector || 1;
        this.score = data.score || 0;
        this.nodeType = data.nodeType || 'BOSS';
        this.previousScene = data.previousScene || CONSTANTS.SCENES.SECTOR_MAP;
        
        // Boss configuration
        this.bossConfig = this.getBossConfig(this.sectorLevel);
    }
    
    create() {
        console.log('BossArenaScene: Creating boss arena for sector', this.sectorLevel);
        
        // Create arena environment
        this.createArenaBackground();
        this.createArenaHazards();
        
        // Create player
        this.createPlayer();
        
        // Create boss
        this.createBoss();
        
        // Setup UI
        this.createUI();
        
        // Setup collisions
        this.setupCollisions();
        
        // Setup events
        this.setupEvents();
        
        // Start boss intro sequence
        this.startBossIntro();
    }
    
    getBossConfig(sectorLevel) {
        // Return boss configuration based on sector level
        switch (sectorLevel) {
            case 1:
                return {
                    type: 'guardian',
                    texture: 'boss-guardian',
                    health: 1000,
                    phases: ['defensive', 'vulnerable', 'aggressive', 'desperate'],
                    phaseThresholds: [0.75, 0.5, 0.25],
                    attackPatterns: [
                        new SpreadShotPattern(this),
                        new DroneDeployPattern(this),
                        new BeamAttackPattern(this),
                        new RammingPattern(this)
                    ],
                    rewards: [
                        { type: 'upgrade', id: 'shield_booster', guaranteed: true },
                        { type: 'weapon', id: 'plasma_cannon', chance: 0.5 },
                        { type: 'credits', amount: 500 },
                        { type: 'unlock', id: 'interceptor', firstTimeOnly: true }
                    ]
                };
            // Add more boss configs for other sectors
            default:
                return {
                    type: 'guardian',
                    texture: 'boss-guardian',
                    health: 1000,
                    // Default configuration
                };
        }
    }
    
    createArenaBackground() {
        // Create parallax background for arena
        this.createBackground();
        
        // Add arena-specific elements
        this.arenaElements = this.add.group();
        
        // Add decorative elements based on boss type
        if (this.bossConfig.type === 'guardian') {
            // Add shield generator structures
            this.createShieldGenerators();
        }
    }
    
    createArenaHazards() {
        // Create hazards group
        this.hazards = this.add.group();
        
        // Add hazards based on boss type
        if (this.bossConfig.type === 'guardian') {
            // Add asteroid field
            this.createAsteroidField();
            
            // Add energy barriers
            this.createEnergyBarriers();
        }
    }
    
    createBoss() {
        // Create boss entity
        this.boss = new BossEnemy(
            this,
            this.cameras.main.width / 2,
            100,
            this.bossConfig.texture,
            this.bossConfig
        );
        
        // Add boss to physics system
        this.physics.add.existing(this.boss);
        
        // Setup boss health bar
        this.createBossHealthBar();
    }
    
    setupEvents() {
        // Listen for boss phase changes
        this.events.on('boss-phase-change', this.onBossPhaseChange, this);
        
        // Listen for boss defeat
        this.events.on('boss-defeated', this.onBossDefeated, this);
    }
    
    onBossPhaseChange(phase) {
        // Update arena based on boss phase
        console.log('Boss entering phase', phase);
        
        // Visual feedback
        this.cameras.main.flash(500, 255, 0, 0, 0.5);
        
        // Update hazards
        this.updateHazardsForPhase(phase);
        
        // Update UI
        this.updatePhaseUI(phase);
    }
    
    onBossDefeated(boss) {
        console.log('Boss defeated!');
        
        // Stop all hazards
        this.deactivateHazards();
        
        // Play victory sequence
        this.playVictorySequence();
        
        // Grant rewards
        const rewards = boss.grantRewards();
        this.showRewards(rewards);
        
        // Update meta-progression
        this.updateMetaProgression();
    }
    
    showRewards(rewards) {
        // Create rewards UI
        const rewardsPanel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            400,
            300,
            0x000000,
            0.8
        ).setDepth(100);
        
        // Add title
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 120,
            'SECTOR CLEARED!',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(101);
        
        // Display rewards
        let yPos = this.cameras.main.height / 2 - 60;
        rewards.forEach(reward => {
            const rewardText = this.add.text(
                this.cameras.main.width / 2,
                yPos,
                this.getRewardText(reward),
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: this.getRewardColor(reward),
                    align: 'center'
                }
            ).setOrigin(0.5).setDepth(101);
            
            yPos += 40;
        });
        
        // Add continue button
        const continueButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'CONTINUE TO NEXT SECTOR',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                backgroundColor: '#446688',
                padding: {
                    x: 20,
                    y: 10
                }
            }
        ).setOrigin(0.5).setDepth(101)
        .setInteractive({ useHandCursor: true });
        
        continueButton.on('pointerdown', () => {
            this.proceedToNextSector();
        });
    }
    
    getRewardText(reward) {
        switch (reward.type) {
            case 'upgrade':
                return `Upgrade: ${this.getUpgradeName(reward.id)}`;
            case 'weapon':
                return `Weapon: ${this.getWeaponName(reward.id)}`;
            case 'credits':
                return `Credits: ${reward.amount}`;
            case 'unlock':
                return `Unlocked: ${this.getUnlockName(reward.id)}`;
            default:
                return `Reward: ${reward.id}`;
        }
    }
    
    getRewardColor(reward) {
        switch (reward.type) {
            case 'upgrade':
                return '#66ff66';
            case 'weapon':
                return '#ff6666';
            case 'credits':
                return '#ffff66';
            case 'unlock':
                return '#66ffff';
            default:
                return '#ffffff';
        }
    }
    
    proceedToNextSector() {
        // Increment sector and proceed to upgrade scene
        const nextSector = this.sectorLevel + 1;
        
        this.scene.start(CONSTANTS.SCENES.UPGRADE, {
            previousScene: CONSTANTS.SCENES.BOSS_ARENA,
            nextSector: nextSector,
            score: this.score
        });
    }
    
    updateMetaProgression() {
        // Update meta-progression
        if (!this.game.global.metaProgress) {
            this.game.global.metaProgress = {};
        }
        
        // Update highest sector reached
        if (this.sectorLevel >= (this.game.global.metaProgress.highestSector || 0)) {
            this.game.global.metaProgress.highestSector = this.sectorLevel + 1;
        }
        
        // Update bosses defeated stat
        if (this.game.global.saveManager) {
            this.game.global.saveManager.updateStat('bossesDefeated', 1);
        }
        
        // Process unlocks
        this.processUnlocks();
        
        // Save progress
        if (this.game.global.saveManager) {
            this.game.global.saveManager.saveGame(false);
        }
    }
    
    processUnlocks() {
        // Process any unlocks from boss rewards
        const rewards = this.boss.rewards;
        
        rewards.forEach(reward => {
            if (reward.type === 'unlock' && reward.firstTimeOnly) {
                // Check if this is first time defeating this boss
                const isFirstTime = !this.game.global.statistics.bossesDefeated || 
                                   this.game.global.statistics.bossesDefeated <= 1;
                
                if (isFirstTime) {
                    // Add unlock to meta-progression
                    if (reward.id.startsWith('ship_')) {
                        // Unlock ship
                        const shipId = reward.id.replace('ship_', '');
                        if (!this.game.global.metaProgress.unlockedShips.includes(shipId)) {
                            this.game.global.metaProgress.unlockedShips.push(shipId);
                        }
                    } else {
                        // Unlock upgrade
                        if (!this.game.global.metaProgress.unlockedUpgrades.includes(reward.id)) {
                            this.game.global.metaProgress.unlockedUpgrades.push(reward.id);
                        }
                    }
                }
            }
        });
    }
}
```

### 3. Attack Pattern System

```javascript
class AttackPattern {
    constructor(scene, boss) {
        this.scene = scene;
        this.boss = boss;
        this.cooldown = 0;
        this.active = false;
    }
    
    execute(delta) {
        if (this.cooldown > 0) {
            this.cooldown -= delta;
            return;
        }
        
        this.performAttack();
        this.resetCooldown();
    }
    
    performAttack() {
        // Override in subclasses
    }
    
    resetCooldown() {
        this.cooldown = this.getBaseCooldown();
    }
    
    getBaseCooldown() {
        return 1000; // Default 1 second cooldown
    }
}

class SpreadShotPattern extends AttackPattern {
    constructor(scene, boss) {
        super(scene, boss);
        this.projectiles = 5;
        this.spreadAngle = 60; // degrees
    }
    
    performAttack() {
        // Fire projectiles in a spread pattern
        const centerAngle = 90; // Downward
        const angleStep = this.spreadAngle / (this.projectiles - 1);
        
        for (let i = 0; i < this.projectiles; i++) {
            const angle = centerAngle - (this.spreadAngle / 2) + (angleStep * i);
            this.fireProjectile(angle);
        }
    }
    
    fireProjectile(angle) {
        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.boss.x,
            this.boss.y + 50,
            'boss-projectile'
        );
        
        // Set projectile properties
        projectile.setScale(2);
        projectile.setTint(0xff0000);
        
        // Add to projectiles group
        this.scene.enemyProjectiles.add(projectile);
        
        // Set velocity based on angle
        const speed = 300;
        const radians = Phaser.Math.DegToRad(angle);
        const velocityX = Math.cos(radians) * speed;
        const velocityY = Math.sin(radians) * speed;
        
        projectile.setVelocity(velocityX, velocityY);
        
        // Set damage
        projectile.damage = 10;
        
        // Auto-destroy when off screen
        projectile.checkWorldBounds = true;
        projectile.outOfBoundsKill = true;
    }
    
    getBaseCooldown() {
        return 2000; // 2 seconds between spread shots
    }
}

// Additional attack patterns would be implemented similarly
```

### 4. Sector Map Integration

```javascript
// In SectorMapGenerator.js

generateSectorMap(sectorLevel) {
    // ... existing code ...
    
    // Add boss node at the end of the sector
    this.addBossNode(nodes, sectorLevel);
    
    return nodes;
}

addBossNode(nodes, sectorLevel) {
    // Create boss node
    const bossNode = {
        id: `boss_${sectorLevel}`,
        type: 'BOSS',
        x: this.mapWidth - 100,
        y: this.mapHeight / 2,
        connections: [],
        visited: false,
        available: false,
        rewards: this.getBossRewards(sectorLevel)
    };
    
    // Connect to appropriate nodes
    const endNodes = nodes.filter(node => 
        node.x > this.mapWidth * 0.7 && 
        node.type !== 'BOSS' &&
        node.connections.length < 3
    );
    
    // Connect at least 2 nodes to the boss
    const connectCount = Math.min(2, endNodes.length);
    
    for (let i = 0; i < connectCount; i++) {
        const node = endNodes[i];
        node.connections.push(bossNode.id);
        bossNode.connections.push(node.id);
    }
    
    // Add boss node to nodes array
    nodes.push(bossNode);
}

getBossRewards(sectorLevel) {
    // Define rewards based on sector level
    switch (sectorLevel) {
        case 1:
            return [
                { type: 'upgrade', id: 'shield_booster', guaranteed: true },
                { type: 'weapon', id: 'plasma_cannon', chance: 0.5 },
                { type: 'credits', amount: 500 },
                { type: 'unlock', id: 'interceptor', firstTimeOnly: true }
            ];
        // Add more rewards for other sectors
        default:
            return [
                { type: 'upgrade', id: 'generic_upgrade', guaranteed: true },
                { type: 'credits', amount: 300 }
            ];
    }
}
```

### 5. State Machine for Boss Behavior

```javascript
class StateMachine {
    constructor(context) {
        this.context = context;
        this.states = {};
        this.currentState = null;
        this.previousState = null;
        this.stateTime = 0;
    }
    
    addState(name, state) {
        this.states[name] = state;
    }
    
    setState(name) {
        if (!this.states[name]) {
            console.warn(`State ${name} does not exist!`);
            return;
        }
        
        // Exit current state
        if (this.currentState && this.states[this.currentState].onExit) {
            this.states[this.currentState].onExit();
        }
        
        // Store previous state
        this.previousState = this.currentState;
        
        // Set new state
        this.currentState = name;
        this.stateTime = 0;
        
        // Enter new state
        if (this.states[this.currentState].onEnter) {
            this.states[this.currentState].onEnter();
        }
    }
    
    update(delta) {
        if (!this.currentState) return;
        
        // Update state time
        this.stateTime += delta;
        
        // Update current state
        if (this.states[this.currentState].onUpdate) {
            this.states[this.currentState].onUpdate(delta);
        }
    }
    
    getState() {
        return this.currentState;
    }
    
    getStateTime() {
        return this.stateTime;
    }
}
```

## Implementation Plan

1. **Phase 1: Core Boss Entity**
   - Implement BossEnemy class with basic functionality
   - Create state machine for boss behavior
   - Implement health phases and transitions
   - Add basic attack patterns

2. **Phase 2: Boss Arena Scene**
   - Create BossArenaScene
   - Implement arena hazards and environment
   - Add boss intro and defeat sequences
   - Implement rewards system

3. **Phase 3: Sector Map Integration**
   - Update SectorMapGenerator to include boss nodes
   - Add visual distinction for boss nodes
   - Implement progression to next sector after boss defeat

4. **Phase 4: Testing and Balancing**
   - Test boss difficulty across different player builds
   - Balance attack patterns and health values
   - Ensure rewards are appropriate for the challenge
   - Optimize performance for boss battles

## Technical Considerations

1. **Performance**
   - Boss battles will have more entities on screen than regular gameplay
   - Need to optimize particle effects and projectiles
   - Consider using object pooling for frequently created objects

2. **Difficulty Scaling**
   - Boss difficulty should scale with sector level
   - Consider player upgrades when balancing boss health and damage
   - Provide appropriate challenge without being unfair

3. **Visual Feedback**
   - Clear visual indicators for boss phases
   - Distinct attack patterns that telegraph their effects
   - Screen effects for significant events (phase changes, defeat)

4. **Save/Load Integration**
   - Boss state needs to be properly saved and restored
   - Ensure unlocks from boss defeats persist in meta-progression
   - Track boss-related statistics (defeats, time-to-kill)
