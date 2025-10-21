/**
 * Simple analytics system for STELLAR ROGUE
 * Tracks player behavior and game events
 */
class GameAnalytics {
    constructor() {
        this.enabled = false;
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
        this.events = [];
        this.maxEvents = 100; // Maximum events to store before sending
        this.endpoint = null; // Set this to your analytics endpoint
        
        // Initialize if analytics are enabled in settings
        this.initialize();
    }
    
    /**
     * Initialize analytics
     */
    initialize() {
        // Check if analytics are enabled via URL parameter or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const analyticsParam = urlParams.get('analytics');
        
        if (analyticsParam === 'true') {
            localStorage.setItem('stellarRogueAnalytics', 'true');
            this.enabled = true;
        } else if (analyticsParam === 'false') {
            localStorage.setItem('stellarRogueAnalytics', 'false');
            this.enabled = false;
        } else {
            // Check localStorage
            this.enabled = localStorage.getItem('stellarRogueAnalytics') === 'true';
        }
        
        // Set up session end tracking
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end', {
                duration: Math.floor((Date.now() - this.sessionStartTime) / 1000)
            });
            this.sendEvents(true); // Force send on session end
        });
        
        // Track session start
        if (this.enabled) {
            this.trackEvent('session_start', {
                userAgent: navigator.userAgent,
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                referrer: document.referrer || 'direct'
            });
            
            console.log('Game analytics initialized. Session ID:', this.sessionId);
        }
    }
    
    /**
     * Generate a unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Track a game event
     * @param {string} eventName - Name of the event
     * @param {object} eventData - Additional data for the event
     */
    trackEvent(eventName, eventData = {}) {
        if (!this.enabled) return;
        
        // Create event object
        const event = {
            eventName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            ...eventData
        };
        
        // Add to events array
        this.events.push(event);
        
        // Send events if we've reached the maximum
        if (this.events.length >= this.maxEvents) {
            this.sendEvents();
        }
        
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Analytics event:', eventName, eventData);
        }
    }
    
    /**
     * Send events to the analytics endpoint
     * @param {boolean} force - Whether to force send even if below max events
     */
    sendEvents(force = false) {
        if (!this.enabled || (!force && this.events.length === 0)) return;
        if (!this.endpoint) {
            // If no endpoint is set, just clear the events
            this.events = [];
            return;
        }
        
        // Clone events and clear the array
        const eventsToSend = [...this.events];
        this.events = [];
        
        // Send events to the endpoint
        fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                events: eventsToSend,
                gameVersion: this.getGameVersion(),
                timestamp: Date.now()
            }),
            // Don't wait for response
            keepalive: true
        }).catch(error => {
            console.error('Error sending analytics:', error);
            // Add events back to the queue if sending failed
            this.events = [...eventsToSend, ...this.events];
        });
    }
    
    /**
     * Get the current game version
     * @returns {string} Game version
     */
    getGameVersion() {
        // Try to get version from the version element
        const versionElement = document.getElementById('version');
        if (versionElement) {
            return versionElement.textContent.trim();
        }
        
        return 'unknown';
    }
    
    /**
     * Enable or disable analytics
     * @param {boolean} enabled - Whether analytics should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('stellarRogueAnalytics', enabled ? 'true' : 'false');
        
        if (enabled) {
            console.log('Game analytics enabled');
            // Track re-enable event
            this.trackEvent('analytics_enabled');
        } else {
            console.log('Game analytics disabled');
            // Track disable event and send immediately
            this.trackEvent('analytics_disabled');
            this.sendEvents(true);
        }
    }
    
    /**
     * Track a gameplay event
     * @param {string} category - Category of the event (e.g., 'combat', 'progression')
     * @param {string} action - Action that occurred (e.g., 'enemy_defeated', 'level_completed')
     * @param {object} data - Additional data for the event
     */
    trackGameplay(category, action, data = {}) {
        this.trackEvent('gameplay', {
            category,
            action,
            ...data
        });
    }
    
    /**
     * Track a UI interaction
     * @param {string} element - UI element that was interacted with
     * @param {string} action - Action that occurred (e.g., 'click', 'hover')
     * @param {object} data - Additional data for the event
     */
    trackUI(element, action, data = {}) {
        this.trackEvent('ui_interaction', {
            element,
            action,
            ...data
        });
    }
    
    /**
     * Track an error
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     * @param {object} data - Additional data for the event
     */
    trackError(errorType, errorMessage, data = {}) {
        this.trackEvent('error', {
            errorType,
            errorMessage,
            ...data
        });
    }
    
    /**
     * Track player progression
     * @param {number} sector - Current sector
     * @param {number} score - Current score
     * @param {object} data - Additional data for the event
     */
    trackProgression(sector, score, data = {}) {
        this.trackEvent('progression', {
            sector,
            score,
            ...data
        });
    }

    /**
     * Track balance data - for game balancing analysis
     * @param {string} category - Balance category (e.g., 'weapon_usage', 'enemy_difficulty')
     * @param {object} data - Balance-related data
     */
    trackBalance(category, data = {}) {
        this.trackEvent('balance_data', {
            category,
            timestamp: Date.now(),
            ...data
        });
    }

    /**
     * Track weapon usage statistics
     * @param {string} weaponType - Type of weapon used
     * @param {object} data - Additional weapon data
     */
    trackWeaponUsage(weaponType, data = {}) {
        this.trackBalance('weapon_usage', {
            weaponType,
            ...data
        });
    }

    /**
     * Track enemy encounter data
     * @param {string} enemyType - Type of enemy
     * @param {object} data - Encounter data (health, damage dealt, etc.)
     */
    trackEnemyEncounter(enemyType, data = {}) {
        this.trackBalance('enemy_encounter', {
            enemyType,
            ...data
        });
    }

    /**
     * Track boss encounter data
     * @param {string} bossName - Name of the boss
     * @param {object} data - Boss encounter data
     */
    trackBossEncounter(bossName, data = {}) {
        this.trackBalance('boss_encounter', {
            bossName,
            ...data
        });
    }

    /**
     * Track upgrade selections
     * @param {string} upgradeType - Type of upgrade selected
     * @param {object} data - Additional upgrade data
     */
    trackUpgradeSelection(upgradeType, data = {}) {
        this.trackBalance('upgrade_selection', {
            upgradeType,
            ...data
        });
    }

    /**
     * Track player death data
     * @param {object} data - Death data (sector, cause, time survived, etc.)
     */
    trackPlayerDeath(data = {}) {
        this.trackBalance('player_death', {
            ...data
        });
    }

    /**
     * Track difficulty adjustments
     * @param {string} adjustmentType - Type of difficulty adjustment
     * @param {object} data - Adjustment data
     */
    trackDifficultyAdjustment(adjustmentType, data = {}) {
        this.trackBalance('difficulty_adjustment', {
            adjustmentType,
            ...data
        });
    }

    /**
     * Track session summary for balance analysis
     * @param {object} summary - Complete session summary data
     */
    trackSessionSummary(summary = {}) {
        this.trackBalance('session_summary', {
            sessionDuration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
            ...summary
        });
    }

    /**
     * Get analytics data for local analysis
     * @returns {object} Current analytics data
     */
    getAnalyticsData() {
        return {
            sessionId: this.sessionId,
            events: [...this.events],
            sessionDuration: Math.floor((Date.now() - this.sessionStartTime) / 1000)
        };
    }

    /**
     * Export analytics data to JSON file
     * @param {string} filename - Name of the file to export
     */
    exportData(filename = 'stellar-rogue-analytics.json') {
        const data = this.getAnalyticsData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = filename;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.GameAnalytics = GameAnalytics;
}
