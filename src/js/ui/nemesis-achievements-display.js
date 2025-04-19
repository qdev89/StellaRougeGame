/**
 * Nemesis Achievements Display
 * UI component for displaying Nemesis achievements
 */
class NemesisAchievementsDisplay {
    constructor(scene) {
        this.scene = scene;
        
        // UI elements
        this.container = null;
        this.background = null;
        this.titleText = null;
        this.achievementItems = [];
        this.closeButton = null;
        
        // Tab elements
        this.allTab = null;
        this.unlockedTab = null;
        this.lockedTab = null;
        this.currentTab = 'all';
        
        // Pagination
        this.currentPage = 0;
        this.itemsPerPage = 5;
        this.totalPages = 1;
        this.prevButton = null;
        this.nextButton = null;
        this.pageText = null;
        
        // Achievement data
        this.achievements = [];
        this.unlockedAchievements = [];
        this.lockedAchievements = [];
    }
    
    /**
     * Show the achievements display
     * @param {NemesisAchievements} achievementsSystem - The achievements system
     */
    show(achievementsSystem) {
        // Get achievements data
        this.achievements = achievementsSystem.getAllAchievements();
        this.unlockedAchievements = achievementsSystem.getUnlockedAchievements();
        this.lockedAchievements = achievementsSystem.getLockedAchievements();
        
        // Calculate total pages
        this.updateTotalPages();
        
        // Create UI
        this.createUI();
        
        // Show achievements
        this.showAchievements();
        
        // Animate in
        this.animateIn();
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
            30,
            "NEMESIS ACHIEVEMENTS",
            {
                fontFamily: 'monospace',
                fontSize: '28px',
                color: '#ffcc33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Create tabs
        this.createTabs();
        
        // Create pagination
        this.createPagination();
        
        // Create close button
        this.closeButton = this.scene.add.text(
            this.scene.cameras.main.width - 20,
            20,
            "CLOSE",
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: '#ff3333',
                align: 'right',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(1, 0).setInteractive();
        
        // Add hover effect to close button
        this.closeButton.on('pointerover', () => {
            this.closeButton.setScale(1.1);
        });
        
        this.closeButton.on('pointerout', () => {
            this.closeButton.setScale(1);
        });
        
        // Add click handler to close button
        this.closeButton.on('pointerdown', () => {
            this.hide();
        });
        
        // Add elements to container
        this.container.add([
            this.background,
            this.titleText,
            this.closeButton
        ]);
        
        // Set initial alpha to 0
        this.container.alpha = 0;
    }
    
    /**
     * Create tabs for filtering achievements
     */
    createTabs() {
        // Create tabs container
        this.tabsContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            80
        );
        
        // Create all tab
        this.allTab = this.scene.add.rectangle(
            -150, 0,
            100, 40,
            0x333333,
            0.7
        );
        this.allTab.setStrokeStyle(2, 0x666666, 1);
        this.allTab.setInteractive();
        
        this.allTabText = this.scene.add.text(
            -150, 0,
            "ALL",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create unlocked tab
        this.unlockedTab = this.scene.add.rectangle(
            0, 0,
            150, 40,
            0x333333,
            0.7
        );
        this.unlockedTab.setStrokeStyle(2, 0x666666, 1);
        this.unlockedTab.setInteractive();
        
        this.unlockedTabText = this.scene.add.text(
            0, 0,
            "UNLOCKED",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create locked tab
        this.lockedTab = this.scene.add.rectangle(
            150, 0,
            150, 40,
            0x333333,
            0.7
        );
        this.lockedTab.setStrokeStyle(2, 0x666666, 1);
        this.lockedTab.setInteractive();
        
        this.lockedTabText = this.scene.add.text(
            150, 0,
            "LOCKED",
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Add hover effects
        this.allTab.on('pointerover', () => {
            this.allTab.setScale(1.05);
            this.allTabText.setScale(1.05);
        });
        
        this.allTab.on('pointerout', () => {
            this.allTab.setScale(1);
            this.allTabText.setScale(1);
        });
        
        this.unlockedTab.on('pointerover', () => {
            this.unlockedTab.setScale(1.05);
            this.unlockedTabText.setScale(1.05);
        });
        
        this.unlockedTab.on('pointerout', () => {
            this.unlockedTab.setScale(1);
            this.unlockedTabText.setScale(1);
        });
        
        this.lockedTab.on('pointerover', () => {
            this.lockedTab.setScale(1.05);
            this.lockedTabText.setScale(1.05);
        });
        
        this.lockedTab.on('pointerout', () => {
            this.lockedTab.setScale(1);
            this.lockedTabText.setScale(1);
        });
        
        // Add click handlers
        this.allTab.on('pointerdown', () => {
            this.setTab('all');
        });
        
        this.unlockedTab.on('pointerdown', () => {
            this.setTab('unlocked');
        });
        
        this.lockedTab.on('pointerdown', () => {
            this.setTab('locked');
        });
        
        // Add to tabs container
        this.tabsContainer.add([
            this.allTab,
            this.allTabText,
            this.unlockedTab,
            this.unlockedTabText,
            this.lockedTab,
            this.lockedTabText
        ]);
        
        // Add to main container
        this.container.add(this.tabsContainer);
        
        // Highlight active tab
        this.highlightActiveTab();
    }
    
    /**
     * Create pagination controls
     */
    createPagination() {
        // Create pagination container
        this.paginationContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height - 50
        );
        
        // Create previous button
        this.prevButton = this.scene.add.triangle(
            -100, 0,
            0, 0,
            -15, 15,
            -15, -15,
            0xffffff, 0.7
        );
        this.prevButton.setInteractive();
        
        // Create next button
        this.nextButton = this.scene.add.triangle(
            100, 0,
            0, 0,
            15, 15,
            15, -15,
            0xffffff, 0.7
        );
        this.nextButton.setInteractive();
        
        // Create page text
        this.pageText = this.scene.add.text(
            0, 0,
            `Page ${this.currentPage + 1}/${this.totalPages}`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Add hover effects
        this.prevButton.on('pointerover', () => {
            this.prevButton.setScale(1.2);
        });
        
        this.prevButton.on('pointerout', () => {
            this.prevButton.setScale(1);
        });
        
        this.nextButton.on('pointerover', () => {
            this.nextButton.setScale(1.2);
        });
        
        this.nextButton.on('pointerout', () => {
            this.nextButton.setScale(1);
        });
        
        // Add click handlers
        this.prevButton.on('pointerdown', () => {
            this.previousPage();
        });
        
        this.nextButton.on('pointerdown', () => {
            this.nextPage();
        });
        
        // Add to pagination container
        this.paginationContainer.add([
            this.prevButton,
            this.nextButton,
            this.pageText
        ]);
        
        // Add to main container
        this.container.add(this.paginationContainer);
        
        // Update pagination state
        this.updatePaginationState();
    }
    
    /**
     * Show achievements for the current tab and page
     */
    showAchievements() {
        // Clear existing achievement items
        this.clearAchievementItems();
        
        // Get achievements for current tab
        let achievementsToShow = [];
        switch (this.currentTab) {
            case 'all':
                achievementsToShow = this.achievements;
                break;
            case 'unlocked':
                achievementsToShow = this.unlockedAchievements;
                break;
            case 'locked':
                achievementsToShow = this.lockedAchievements;
                break;
        }
        
        // Calculate start and end indices for current page
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, achievementsToShow.length);
        
        // Get achievements for current page
        const pageAchievements = achievementsToShow.slice(startIndex, endIndex);
        
        // Create achievement items
        pageAchievements.forEach((achievement, index) => {
            this.createAchievementItem(achievement, index);
        });
        
        // Update pagination text
        this.pageText.setText(`Page ${this.currentPage + 1}/${this.totalPages}`);
    }
    
    /**
     * Create an achievement item
     * @param {object} achievement - Achievement data
     * @param {number} index - Index of the achievement in the current page
     */
    createAchievementItem(achievement, index) {
        // Calculate position
        const y = 150 + (index * 80);
        
        // Create item container
        const itemContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            y
        );
        
        // Create background
        const bg = this.scene.add.rectangle(
            0, 0,
            600, 70,
            achievement.unlocked ? 0x223344 : 0x222222,
            0.7
        );
        bg.setStrokeStyle(2, achievement.unlocked ? 0x3366cc : 0x444444, 1);
        
        // Create icon background
        const iconBg = this.scene.add.circle(
            -250, 0,
            25,
            achievement.unlocked ? 0x3366cc : 0x444444,
            0.7
        );
        
        // Create icon text (placeholder for actual icons)
        const iconText = this.scene.add.text(
            -250, 0,
            achievement.unlocked ? '★' : '?',
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: achievement.unlocked ? '#ffcc33' : '#666666',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        // Create name text
        const nameText = this.scene.add.text(
            -200, -15,
            achievement.name,
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                color: achievement.unlocked ? '#ffffff' : '#888888',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0, 0.5);
        
        // Create description text
        const descriptionText = this.scene.add.text(
            -200, 15,
            achievement.secret && !achievement.unlocked ? '???' : achievement.description,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: achievement.unlocked ? '#cccccc' : '#666666',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 1
            }
        ).setOrigin(0, 0.5);
        
        // Create reward text if achievement is unlocked
        let rewardText = null;
        if (achievement.unlocked && achievement.reward) {
            rewardText = this.scene.add.text(
                250, 0,
                `Reward: ${achievement.reward.value} ${achievement.reward.type}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#33ff33',
                    align: 'right',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            ).setOrigin(1, 0.5);
        }
        
        // Create progress bar for milestone achievements
        let progressBar = null;
        let progressText = null;
        
        if (!achievement.unlocked && achievement.progress !== undefined) {
            // Create progress bar background
            progressBar = this.scene.add.rectangle(
                150, 15,
                200, 10,
                0x222222,
                1
            );
            progressBar.setStrokeStyle(1, 0x444444, 1);
            
            // Create progress bar fill
            const progress = Math.min(achievement.progress / achievement.maxProgress, 1);
            const progressFill = this.scene.add.rectangle(
                150 - 100 + (progress * 100), 15,
                200 * progress, 10,
                0x3366cc,
                1
            );
            progressFill.setOrigin(0, 0.5);
            
            // Create progress text
            progressText = this.scene.add.text(
                250, 15,
                `${achievement.progress}/${achievement.maxProgress}`,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#cccccc',
                    align: 'right',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            ).setOrigin(1, 0.5);
            
            // Add progress elements to container
            itemContainer.add([progressBar, progressFill, progressText]);
        }
        
        // Add elements to container
        itemContainer.add([bg, iconBg, iconText, nameText, descriptionText]);
        
        if (rewardText) {
            itemContainer.add(rewardText);
        }
        
        // Add to main container
        this.container.add(itemContainer);
        
        // Add to achievement items array
        this.achievementItems.push(itemContainer);
        
        // Set initial alpha to 0 for animation
        itemContainer.alpha = 0;
        
        // Animate in
        this.scene.tweens.add({
            targets: itemContainer,
            alpha: 1,
            y: y,
            duration: 300,
            delay: index * 100,
            ease: 'Power2'
        });
    }
    
    /**
     * Clear all achievement items
     */
    clearAchievementItems() {
        this.achievementItems.forEach(item => {
            item.destroy();
        });
        
        this.achievementItems = [];
    }
    
    /**
     * Set the current tab
     * @param {string} tab - Tab to set ('all', 'unlocked', or 'locked')
     */
    setTab(tab) {
        this.currentTab = tab;
        
        // Reset to first page
        this.currentPage = 0;
        
        // Update total pages
        this.updateTotalPages();
        
        // Highlight active tab
        this.highlightActiveTab();
        
        // Update pagination state
        this.updatePaginationState();
        
        // Show achievements for new tab
        this.showAchievements();
    }
    
    /**
     * Highlight the active tab
     */
    highlightActiveTab() {
        // Reset all tabs
        this.allTab.setFillStyle(0x333333, 0.7);
        this.unlockedTab.setFillStyle(0x333333, 0.7);
        this.lockedTab.setFillStyle(0x333333, 0.7);
        
        // Highlight active tab
        switch (this.currentTab) {
            case 'all':
                this.allTab.setFillStyle(0x3366cc, 0.9);
                break;
            case 'unlocked':
                this.unlockedTab.setFillStyle(0x33cc33, 0.9);
                break;
            case 'locked':
                this.lockedTab.setFillStyle(0xff6633, 0.9);
                break;
        }
    }
    
    /**
     * Go to the previous page
     */
    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.showAchievements();
            this.updatePaginationState();
        }
    }
    
    /**
     * Go to the next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.showAchievements();
            this.updatePaginationState();
        }
    }
    
    /**
     * Update the total number of pages
     */
    updateTotalPages() {
        let totalItems = 0;
        
        switch (this.currentTab) {
            case 'all':
                totalItems = this.achievements.length;
                break;
            case 'unlocked':
                totalItems = this.unlockedAchievements.length;
                break;
            case 'locked':
                totalItems = this.lockedAchievements.length;
                break;
        }
        
        this.totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
    }
    
    /**
     * Update pagination button states
     */
    updatePaginationState() {
        // Disable previous button on first page
        this.prevButton.setAlpha(this.currentPage > 0 ? 1 : 0.5);
        this.prevButton.disableInteractive();
        if (this.currentPage > 0) {
            this.prevButton.setInteractive();
        }
        
        // Disable next button on last page
        this.nextButton.setAlpha(this.currentPage < this.totalPages - 1 ? 1 : 0.5);
        this.nextButton.disableInteractive();
        if (this.currentPage < this.totalPages - 1) {
            this.nextButton.setInteractive();
        }
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
    }
    
    /**
     * Hide the achievements display
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
                
                // Resume game if needed
                if (this.scene.scene.isPaused()) {
                    this.scene.scene.resume();
                }
            }
        });
    }
    
    /**
     * Show newly unlocked achievements
     * @param {array} achievements - Array of newly unlocked achievements
     */
    showUnlockedAchievements(achievements) {
        if (!achievements || achievements.length === 0) return;
        
        // Create container
        const container = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );
        container.setDepth(3000);
        
        // Create background
        const bg = this.scene.add.rectangle(
            0, 0,
            500, 400,
            0x000000,
            0.9
        );
        bg.setStrokeStyle(2, 0xffcc33, 1);
        
        // Create title
        const title = this.scene.add.text(
            0, -150,
            "ACHIEVEMENTS UNLOCKED!",
            {
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#ffcc33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Add elements to container
        container.add([bg, title]);
        
        // Create achievement items
        achievements.forEach((achievement, index) => {
            // Create item background
            const itemBg = this.scene.add.rectangle(
                0, -80 + (index * 80),
                450, 70,
                0x223344,
                0.8
            );
            itemBg.setStrokeStyle(2, 0x3366cc, 1);
            
            // Create icon background
            const iconBg = this.scene.add.circle(
                -180, -80 + (index * 80),
                25,
                0x3366cc,
                0.8
            );
            
            // Create icon text (placeholder for actual icons)
            const iconText = this.scene.add.text(
                -180, -80 + (index * 80),
                '★',
                {
                    fontFamily: 'monospace',
                    fontSize: '24px',
                    color: '#ffcc33',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
            
            // Create name text
            const nameText = this.scene.add.text(
                -140, -95 + (index * 80),
                achievement.name,
                {
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    color: '#ffffff',
                    align: 'left',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0, 0.5);
            
            // Create description text
            const descriptionText = this.scene.add.text(
                -140, -65 + (index * 80),
                achievement.description,
                {
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#cccccc',
                    align: 'left',
                    stroke: '#000000',
                    strokeThickness: 1
                }
            ).setOrigin(0, 0.5);
            
            // Create reward text
            let rewardText = null;
            if (achievement.reward) {
                rewardText = this.scene.add.text(
                    180, -80 + (index * 80),
                    `Reward: ${achievement.reward.value} ${achievement.reward.type}`,
                    {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        color: '#33ff33',
                        align: 'right',
                        stroke: '#000000',
                        strokeThickness: 1
                    }
                ).setOrigin(1, 0.5);
            }
            
            // Add elements to container
            container.add([itemBg, iconBg, iconText, nameText, descriptionText]);
            
            if (rewardText) {
                container.add(rewardText);
            }
            
            // Set initial scale to 0 for animation
            itemBg.setScale(0);
            iconBg.setScale(0);
            iconText.setScale(0);
            nameText.setScale(0);
            descriptionText.setScale(0);
            if (rewardText) rewardText.setScale(0);
            
            // Animate in
            this.scene.tweens.add({
                targets: [itemBg, iconBg, iconText, nameText, descriptionText, rewardText],
                scale: 1,
                duration: 500,
                delay: 500 + (index * 300),
                ease: 'Back.out'
            });
        });
        
        // Create continue button
        const continueButton = this.scene.add.text(
            0, 150,
            "CONTINUE",
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                color: '#33ff33',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setInteractive();
        
        // Add hover effect
        continueButton.on('pointerover', () => {
            continueButton.setScale(1.1);
        });
        
        continueButton.on('pointerout', () => {
            continueButton.setScale(1);
        });
        
        // Add click handler
        continueButton.on('pointerdown', () => {
            // Fade out and destroy
            this.scene.tweens.add({
                targets: container,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    container.destroy();
                }
            });
        });
        
        // Set initial scale to 0 for animation
        continueButton.setScale(0);
        
        // Animate in after all achievements
        this.scene.tweens.add({
            targets: continueButton,
            scale: 1,
            duration: 500,
            delay: 500 + (achievements.length * 300) + 500,
            ease: 'Back.out'
        });
        
        // Add to container
        container.add(continueButton);
        
        // Set initial alpha to 0
        container.alpha = 0;
        
        // Animate in
        this.scene.tweens.add({
            targets: container,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
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
    window.NemesisAchievementsDisplay = NemesisAchievementsDisplay;
}
