/**
 * Nemesis Performance Summary
 * Shows a summary of player performance after defeating the Nemesis boss
 */
class NemesisPerformanceSummary {
    constructor(scene) {
        this.scene = scene;
        
        // Performance metrics
        this.metrics = {
            timeInFight: 0,
            damageDealt: 0,
            damageTaken: 0,
            hitsLanded: 0,
            hitsTaken: 0,
            attacksAvoided: 0,
            weaponsUsed: {},
            phasesDuration: [],
            combosAvoided: 0,
            combosTaken: 0,
            difficultyLevel: 0.5,
            grade: 'B'
        };
        
        // UI elements
        this.container = null;
        this.background = null;
        this.titleText = null;
        this.metricsTexts = {};
        this.gradeDisplay = null;
        this.continueButton = null;
        
        // Grades and thresholds
        this.grades = {
            'S': { color: '#ffcc00', description: 'PERFECT' },
            'A': { color: '#33ff33', description: 'EXCELLENT' },
            'B': { color: '#33ccff', description: 'GOOD' },
            'C': { color: '#ffcc33', description: 'AVERAGE' },
            'D': { color: '#ff9933', description: 'POOR' },
            'F': { color: '#ff3333', description: 'FAILED' }
        };
    }
    
    /**
     * Set performance metrics
     * @param {object} metrics - Performance metrics
     */
    setMetrics(metrics) {
        this.metrics = {
            ...this.metrics,
            ...metrics
        };
        
        // Calculate grade based on metrics
        this.calculateGrade();
    }
    
    /**
     * Calculate performance grade
     */
    calculateGrade() {
        // Calculate score based on various factors
        let score = 0;
        
        // Damage efficiency (damage dealt vs taken)
        const damageRatio = this.metrics.damageTaken > 0 ? 
            this.metrics.damageDealt / this.metrics.damageTaken : 
            this.metrics.damageDealt;
        
        if (damageRatio > 5) score += 30;
        else if (damageRatio > 3) score += 25;
        else if (damageRatio > 2) score += 20;
        else if (damageRatio > 1) score += 15;
        else score += 5;
        
        // Hit efficiency (hits landed vs taken)
        const hitRatio = this.metrics.hitsTaken > 0 ? 
            this.metrics.hitsLanded / this.metrics.hitsTaken : 
            this.metrics.hitsLanded;
        
        if (hitRatio > 3) score += 30;
        else if (hitRatio > 2) score += 25;
        else if (hitRatio > 1.5) score += 20;
        else if (hitRatio > 1) score += 15;
        else score += 5;
        
        // Attacks avoided
        const avoidanceRatio = this.metrics.attacksAvoided / 
            (this.metrics.attacksAvoided + this.metrics.hitsTaken);
        
        if (avoidanceRatio > 0.8) score += 20;
        else if (avoidanceRatio > 0.6) score += 15;
        else if (avoidanceRatio > 0.4) score += 10;
        else if (avoidanceRatio > 0.2) score += 5;
        
        // Weapon variety (number of different weapons used)
        const weaponCount = Object.keys(this.metrics.weaponsUsed).length;
        
        if (weaponCount >= 5) score += 10;
        else if (weaponCount >= 4) score += 8;
        else if (weaponCount >= 3) score += 6;
        else if (weaponCount >= 2) score += 4;
        else score += 2;
        
        // Combo avoidance
        const comboAvoidanceRatio = this.metrics.combosAvoided / 
            (this.metrics.combosAvoided + this.metrics.combosTaken);
        
        if (comboAvoidanceRatio > 0.8) score += 10;
        else if (comboAvoidanceRatio > 0.6) score += 8;
        else if (comboAvoidanceRatio > 0.4) score += 6;
        else if (comboAvoidanceRatio > 0.2) score += 4;
        else score += 2;
        
        // Determine grade based on score
        if (score >= 90) this.metrics.grade = 'S';
        else if (score >= 80) this.metrics.grade = 'A';
        else if (score >= 70) this.metrics.grade = 'B';
        else if (score >= 60) this.metrics.grade = 'C';
        else if (score >= 50) this.metrics.grade = 'D';
        else this.metrics.grade = 'F';
    }
    
    /**
     * Show the performance summary
     */
    show() {
        // Create UI
        this.createUI();
        
        // Populate metrics
        this.populateMetrics();
        
        // Animate in
        this.animateIn();
        
        // Save metrics to local storage
        this.saveMetrics();
    }
    
    /**
     * Create the UI elements
     */
    createUI() {
        // Create container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(2000);
        
        // Create semi-transparent background
        this.background = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.8
        );
        
        // Create title
        this.titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            50,
            "NEMESIS DEFEATED",
            {
                fontFamily: 'monospace',
                fontSize: '32px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Create subtitle
        this.subtitleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            90,
            "PERFORMANCE SUMMARY",
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#cccccc',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Create metrics panel
        this.metricsPanel = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            500,
            400,
            0x333333,
            0.7
        );
        this.metricsPanel.setStrokeStyle(2, 0x666666, 1);
        
        // Create grade display
        this.gradeDisplay = this.scene.add.container(
            this.scene.cameras.main.width - 150,
            150
        );
        
        // Create continue button
        this.continueButton = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 50,
            "CONTINUE",
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setInteractive();
        
        // Add hover effect to continue button
        this.continueButton.on('pointerover', () => {
            this.continueButton.setScale(1.1);
        });
        
        this.continueButton.on('pointerout', () => {
            this.continueButton.setScale(1);
        });
        
        // Add click handler to continue button
        this.continueButton.on('pointerdown', () => {
            this.hide();
        });
        
        // Add elements to container
        this.container.add([
            this.background,
            this.titleText,
            this.subtitleText,
            this.metricsPanel,
            this.continueButton
        ]);
        
        // Set initial alpha to 0
        this.container.alpha = 0;
    }
    
    /**
     * Populate metrics display
     */
    populateMetrics() {
        // Create metrics texts
        const metrics = [
            { key: 'time', label: 'Time in Fight', value: this.formatTime(this.metrics.timeInFight) },
            { key: 'damageDealt', label: 'Damage Dealt', value: Math.floor(this.metrics.damageDealt) },
            { key: 'damageTaken', label: 'Damage Taken', value: Math.floor(this.metrics.damageTaken) },
            { key: 'hitsLanded', label: 'Hits Landed', value: this.metrics.hitsLanded },
            { key: 'hitsTaken', label: 'Hits Taken', value: this.metrics.hitsTaken },
            { key: 'attacksAvoided', label: 'Attacks Avoided', value: this.metrics.attacksAvoided },
            { key: 'weaponsUsed', label: 'Weapons Used', value: Object.keys(this.metrics.weaponsUsed).length },
            { key: 'combosAvoided', label: 'Combos Avoided', value: this.metrics.combosAvoided },
            { key: 'combosTaken', label: 'Combos Taken', value: this.metrics.combosTaken },
            { key: 'difficultyLevel', label: 'Difficulty Level', value: this.formatDifficulty(this.metrics.difficultyLevel) }
        ];
        
        // Position variables
        const startX = this.scene.cameras.main.width / 2 - 200;
        const startY = this.scene.cameras.main.height / 2 - 150;
        const lineHeight = 35;
        
        // Create text for each metric
        metrics.forEach((metric, index) => {
            // Create label
            const label = this.scene.add.text(
                startX,
                startY + (index * lineHeight),
                metric.label + ':',
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#cccccc',
                    align: 'left'
                }
            ).setOrigin(0, 0.5);
            
            // Create value
            const value = this.scene.add.text(
                startX + 300,
                startY + (index * lineHeight),
                metric.value.toString(),
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'right'
                }
            ).setOrigin(1, 0.5);
            
            // Store references
            this.metricsTexts[metric.key] = { label, value };
            
            // Add to container
            this.container.add([label, value]);
        });
        
        // Create grade display
        const gradeCircle = this.scene.add.circle(0, 0, 50, this.getGradeColor(), 0.8);
        gradeCircle.setStrokeStyle(3, 0xffffff, 1);
        
        const gradeText = this.scene.add.text(
            0, 0,
            this.metrics.grade,
            {
                fontFamily: 'monospace',
                fontSize: '48px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        const gradeLabel = this.scene.add.text(
            0, 70,
            this.getGradeDescription(),
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Add to grade display container
        this.gradeDisplay.add([gradeCircle, gradeText, gradeLabel]);
        
        // Add grade display to main container
        this.container.add(this.gradeDisplay);
    }
    
    /**
     * Format time in milliseconds to MM:SS format
     * @param {number} ms - Time in milliseconds
     * @returns {string} Formatted time
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Format difficulty level
     * @param {number} level - Difficulty level (0-1)
     * @returns {string} Formatted difficulty
     */
    formatDifficulty(level) {
        if (level < 0.2) return 'Very Easy';
        if (level < 0.4) return 'Easy';
        if (level < 0.6) return 'Normal';
        if (level < 0.8) return 'Hard';
        return 'Very Hard';
    }
    
    /**
     * Get color for grade
     * @returns {number} Color in hex format
     */
    getGradeColor() {
        const gradeInfo = this.grades[this.metrics.grade];
        if (!gradeInfo) return 0x33ccff;
        
        // Convert hex color string to number
        return parseInt(gradeInfo.color.replace('#', '0x'));
    }
    
    /**
     * Get description for grade
     * @returns {string} Grade description
     */
    getGradeDescription() {
        const gradeInfo = this.grades[this.metrics.grade];
        if (!gradeInfo) return 'UNKNOWN';
        
        return gradeInfo.description;
    }
    
    /**
     * Animate the UI in
     */
    animateIn() {
        // Fade in container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
        
        // Scale up grade display
        this.gradeDisplay.scale = 0;
        this.scene.tweens.add({
            targets: this.gradeDisplay,
            scale: 1,
            duration: 800,
            delay: 500,
            ease: 'Back.out'
        });
        
        // Animate metrics in one by one
        Object.values(this.metricsTexts).forEach((texts, index) => {
            texts.label.alpha = 0;
            texts.value.alpha = 0;
            
            this.scene.tweens.add({
                targets: [texts.label, texts.value],
                alpha: 1,
                duration: 300,
                delay: 200 + (index * 100),
                ease: 'Power2'
            });
        });
    }
    
    /**
     * Hide the performance summary
     */
    hide() {
        // Fade out container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Destroy container
                this.container.destroy();
                
                // Resume game
                this.scene.scene.resume();
                
                // Emit event
                this.scene.events.emit('summary-closed');
            }
        });
    }
    
    /**
     * Save metrics to local storage
     */
    saveMetrics() {
        try {
            // Get existing metrics
            const existingData = localStorage.getItem('nemesis_performance_history');
            let history = existingData ? JSON.parse(existingData) : [];
            
            // Add current metrics
            history.push({
                date: new Date().toISOString(),
                metrics: this.metrics
            });
            
            // Keep only the last 10 entries
            if (history.length > 10) {
                history = history.slice(history.length - 10);
            }
            
            // Save back to local storage
            localStorage.setItem('nemesis_performance_history', JSON.stringify(history));
        } catch (error) {
            console.warn('Failed to save Nemesis performance metrics', error);
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.NemesisPerformanceSummary = NemesisPerformanceSummary;
}
