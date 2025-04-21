/**
 * Navigation Decision UI
 * A modern, visually appealing UI for displaying navigation choices
 */
class NavigationDecisionUI {
    /**
     * Create a new navigation decision UI
     * @param {Phaser.Scene} scene - The scene to add the UI to
     * @param {Object} choice - The choice data
     * @param {Function} onSelect - Callback when an option is selected
     */
    constructor(scene, choice, onSelect) {
        this.scene = scene;
        this.choice = choice;
        this.onSelect = onSelect;
        this.elements = [];
        
        // Create the UI
        this.create();
    }
    
    /**
     * Create the UI elements
     */
    create() {
        // Create a semi-transparent background with blur effect
        const overlay = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000022, 0.85
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(100);
        this.elements.push(overlay);
        
        // Add starfield effect to the background
        this.createStarfieldEffect();
        
        // Create header
        this.createHeader();
        
        // Create options
        this.createOptions();
    }
    
    /**
     * Create a starfield effect in the background
     */
    createStarfieldEffect() {
        // Add some stars to the background
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.scene.cameras.main.width);
            const y = Phaser.Math.Between(0, this.scene.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8);
            
            const star = this.scene.add.circle(x, y, size, 0xffffff, alpha)
                .setScrollFactor(0)
                .setDepth(101);
                
            // Add twinkling animation
            this.scene.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.elements.push(star);
        }
    }
    
    /**
     * Create the header section
     */
    createHeader() {
        // Title text with glow effect
        const titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            80,
            this.choice.title,
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#33ff33',
                align: 'center',
                stroke: '#003300',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        
        // Add glow effect
        titleText.setTint(0x66ff66);
        this.scene.tweens.add({
            targets: titleText,
            alpha: 0.8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.elements.push(titleText);
        
        // Description text
        const descText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            130,
            this.choice.description,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: 600 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        
        this.elements.push(descText);
        
        // Add sector info
        const sectorInfo = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            40,
            `ENTERING SECTOR ${this.scene.currentSector + 1}`,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        
        this.elements.push(sectorInfo);
        
        // Add score display
        const scoreText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            180,
            `SCORE: ${this.scene.score}`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffff33',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        
        this.elements.push(scoreText);
        
        // Add ship status
        const shipStatus = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            210,
            `SHIP STATUS: ${this.scene.game.global.currentRun.shipType.toUpperCase()}`,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#33ccff',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        
        this.elements.push(shipStatus);
    }
    
    /**
     * Create the options section
     */
    createOptions() {
        const options = this.choice.options;
        const startY = 260;
        const spacing = 120;
        
        // Path type icons
        const icons = {
            'Asteroid Field': 'asteroid',
            'Enemy Territory': 'enemy',
            'Radiation Zone': 'radiation',
            'Nebula Cloud': 'nebula',
            'Unstable Wormhole': 'wormhole',
            'Debris Field': 'debris'
        };
        
        // Create each option
        options.forEach((option, index) => {
            const y = startY + (index * spacing);
            
            // Create option container
            const container = this.scene.add.container(this.scene.cameras.main.width / 2, y)
                .setScrollFactor(0)
                .setDepth(102);
            
            // Create option panel with gradient
            const panel = this.scene.add.graphics();
            panel.fillStyle(0x003300, 0.6);
            panel.fillRoundedRect(-300, -40, 600, 100, 10);
            panel.lineStyle(2, 0x33ff33, 0.8);
            panel.strokeRoundedRect(-300, -40, 600, 100, 10);
            
            container.add(panel);
            
            // Create option title
            const title = this.scene.add.text(
                -280,
                -30,
                option.text.toUpperCase(),
                {
                    fontFamily: 'monospace',
                    fontSize: '20px',
                    color: '#ffffff',
                    align: 'left',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0, 0);
            
            container.add(title);
            
            // Create option description
            const description = this.scene.add.text(
                -280,
                0,
                option.description,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#cccccc',
                    align: 'left',
                    wordWrap: { width: 550 }
                }
            ).setOrigin(0, 0);
            
            container.add(description);
            
            // Create rewards/penalties text
            let rewardsText = '';
            if (option.rewards && option.rewards.length > 0) {
                rewardsText += 'Rewards: ';
                option.rewards.forEach((reward, i) => {
                    const rewardName = this.getRewardName(reward);
                    rewardsText += rewardName;
                    if (i < option.rewards.length - 1) rewardsText += ', ';
                });
            }
            
            const rewards = this.scene.add.text(
                -280,
                35,
                rewardsText,
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#33ff33',
                    align: 'left'
                }
            ).setOrigin(0, 0);
            
            container.add(rewards);
            
            // Create penalties text
            let penaltiesText = '';
            if (option.penalties && option.penalties.length > 0) {
                penaltiesText += 'Penalties: ';
                option.penalties.forEach((penalty, i) => {
                    const penaltyName = this.getPenaltyName(penalty);
                    penaltiesText += penaltyName;
                    if (i < option.penalties.length - 1) penaltiesText += ', ';
                });
            }
            
            const penalties = this.scene.add.text(
                -280 + (rewardsText ? rewardsText.length * 6 : 0) + 20,
                35,
                penaltiesText,
                {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#ff3333',
                    align: 'left'
                }
            ).setOrigin(0, 0);
            
            container.add(penalties);
            
            // Create icon for path type
            const iconKey = icons[option.text] || 'default';
            this.createPathIcon(container, iconKey);
            
            // Make the panel interactive
            panel.setInteractive(new Phaser.Geom.Rectangle(-300, -40, 600, 100), Phaser.Geom.Rectangle.Contains)
                .on('pointerover', () => {
                    panel.clear();
                    panel.fillStyle(0x006600, 0.8);
                    panel.fillRoundedRect(-300, -40, 600, 100, 10);
                    panel.lineStyle(3, 0x66ff66, 1);
                    panel.strokeRoundedRect(-300, -40, 600, 100, 10);
                    
                    // Scale up slightly
                    container.setScale(1.02);
                })
                .on('pointerout', () => {
                    panel.clear();
                    panel.fillStyle(0x003300, 0.6);
                    panel.fillRoundedRect(-300, -40, 600, 100, 10);
                    panel.lineStyle(2, 0x33ff33, 0.8);
                    panel.strokeRoundedRect(-300, -40, 600, 100, 10);
                    
                    // Reset scale
                    container.setScale(1);
                })
                .on('pointerdown', () => {
                    // Visual feedback
                    this.scene.tweens.add({
                        targets: container,
                        scaleX: 0.95,
                        scaleY: 0.95,
                        duration: 100,
                        yoyo: true,
                        onComplete: () => {
                            // Call the selection callback
                            if (this.onSelect) {
                                this.onSelect(index);
                            }
                        }
                    });
                });
            
            this.elements.push(container);
        });
    }
    
    /**
     * Create an icon for the path type
     * @param {Phaser.GameObjects.Container} container - The container to add the icon to
     * @param {string} type - The type of icon to create
     */
    createPathIcon(container, type) {
        // Create a circle for the icon background
        const circle = this.scene.add.circle(250, 0, 30, 0x000000, 0.6)
            .setStrokeStyle(2, 0x33ff33);
        
        container.add(circle);
        
        // Create the icon based on type
        let icon;
        
        // Check if the texture exists
        if (this.scene.textures.exists(`icon-${type}`)) {
            // Use the texture
            icon = this.scene.add.image(250, 0, `icon-${type}`)
                .setDisplaySize(40, 40);
        } else {
            // Create a fallback icon
            switch (type) {
                case 'asteroid':
                    icon = this.createAsteroidIcon(250, 0);
                    break;
                case 'enemy':
                    icon = this.createEnemyIcon(250, 0);
                    break;
                case 'radiation':
                    icon = this.createRadiationIcon(250, 0);
                    break;
                case 'nebula':
                    icon = this.createNebulaIcon(250, 0);
                    break;
                case 'wormhole':
                    icon = this.createWormholeIcon(250, 0);
                    break;
                case 'debris':
                    icon = this.createDebrisIcon(250, 0);
                    break;
                default:
                    icon = this.createDefaultIcon(250, 0);
                    break;
            }
        }
        
        container.add(icon);
    }
    
    /**
     * Create an asteroid icon
     */
    createAsteroidIcon(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xaaaaaa);
        graphics.fillCircle(x - 5, y, 12);
        graphics.fillCircle(x + 8, y - 5, 8);
        graphics.fillCircle(x + 3, y + 7, 6);
        return graphics;
    }
    
    /**
     * Create an enemy icon
     */
    createEnemyIcon(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xff3333);
        
        // Draw enemy ship
        graphics.fillTriangle(
            x - 10, y + 10,
            x + 10, y + 10,
            x, y - 10
        );
        
        // Draw wings
        graphics.fillRect(x - 15, y + 5, 30, 5);
        
        return graphics;
    }
    
    /**
     * Create a radiation icon
     */
    createRadiationIcon(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x33ff33);
        
        // Draw radiation symbol
        const radius = 15;
        
        // Center circle
        graphics.fillCircle(x, y, 5);
        
        // Three "blades"
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2 / 3) - Math.PI / 2;
            const startX = x + Math.cos(angle) * 8;
            const startY = y + Math.sin(angle) * 8;
            const endX = x + Math.cos(angle) * radius;
            const endY = y + Math.sin(angle) * radius;
            
            graphics.fillTriangle(
                startX - 5 * Math.sin(angle), startY + 5 * Math.cos(angle),
                startX + 5 * Math.sin(angle), startY - 5 * Math.cos(angle),
                endX, endY
            );
        }
        
        return graphics;
    }
    
    /**
     * Create a nebula icon
     */
    createNebulaIcon(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x9966ff);
        
        // Draw cloud-like shape
        graphics.fillCircle(x - 8, y, 10);
        graphics.fillCircle(x + 8, y, 10);
        graphics.fillCircle(x, y - 8, 10);
        graphics.fillCircle(x, y + 8, 10);
        
        return graphics;
    }
    
    /**
     * Create a wormhole icon
     */
    createWormholeIcon(x, y) {
        const graphics = this.scene.add.graphics();
        
        // Draw spiral
        const radius = 15;
        const turns = 2;
        const points = 20;
        
        for (let i = 0; i < points; i++) {
            const t = i / points;
            const angle = turns * Math.PI * 2 * t;
            const r = radius * t;
            const pointX = x + r * Math.cos(angle);
            const pointY = y + r * Math.sin(angle);
            
            graphics.fillStyle(0x33ccff, 1 - t);
            graphics.fillCircle(pointX, pointY, 3 * (1 - t) + 1);
        }
        
        return graphics;
    }
    
    /**
     * Create a debris icon
     */
    createDebrisIcon(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xcccccc);
        
        // Draw random debris pieces
        for (let i = 0; i < 8; i++) {
            const pieceX = x + Phaser.Math.Between(-15, 15);
            const pieceY = y + Phaser.Math.Between(-15, 15);
            const size = Phaser.Math.Between(2, 5);
            
            graphics.fillRect(pieceX, pieceY, size, size);
        }
        
        return graphics;
    }
    
    /**
     * Create a default icon
     */
    createDefaultIcon(x, y) {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(x, y, 15);
        return graphics;
    }
    
    /**
     * Get a human-readable name for a reward
     * @param {Object} reward - The reward object
     * @returns {string} The reward name
     */
    getRewardName(reward) {
        if (!reward) return '';
        
        if (reward.name) return reward.name;
        
        switch (reward.type) {
            case 'statBoost':
                return 'Stat Boost';
            case 'weapon':
                return 'Weapon Upgrade';
            case 'shield':
                return `Shield +${reward.value || ''}`;
            case 'health':
                return `Health +${reward.value || ''}`;
            case 'speed':
                return `Speed +${reward.value || ''}`;
            case 'fireRate':
                return `Fire Rate +${reward.value || ''}`;
            case 'special':
                return 'Special Ability';
            default:
                return reward.type || 'Unknown';
        }
    }
    
    /**
     * Get a human-readable name for a penalty
     * @param {Object} penalty - The penalty object
     * @returns {string} The penalty name
     */
    getPenaltyName(penalty) {
        if (!penalty) return '';
        
        if (penalty.name) return penalty.name;
        
        switch (penalty.type) {
            case 'weakness':
                if (penalty.value === 'asteroidVulnerability') return 'Asteroid Vulnerability';
                if (penalty.value === 'radiationVulnerability') return 'Radiation Vulnerability';
                if (penalty.value === 'systemInstability') return 'System Instability';
                return 'Weakness';
            case 'statReduction':
                return 'Stat Reduction';
            case 'shield':
                return `Shield -${penalty.value || ''}`;
            case 'health':
                return `Health -${penalty.value || ''}`;
            case 'speed':
                return `Speed -${penalty.value || ''}`;
            default:
                return penalty.type || 'Unknown';
        }
    }
    
    /**
     * Destroy all UI elements
     */
    destroy() {
        this.elements.forEach(element => {
            if (element && !element.destroyed) {
                element.destroy();
            }
        });
        
        this.elements = [];
    }
}
