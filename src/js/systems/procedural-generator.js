/**
 * Procedural Generator
 * Handles the generation of procedural sectors, enemy waves, and encounters
 */
class ProceduralGenerator {
    constructor(scene) {
        this.scene = scene;

        // Sector properties
        this.currentSector = 1;
        this.sectorLength = CONSTANTS.SECTOR.LENGTH;
        this.difficultyMultiplier = 1.0;

        // Wave generation parameters
        this.enemyPool = ['DRONE', 'GUNSHIP', 'DESTROYER'];
        this.enemyWeights = {
            DRONE: 70,
            GUNSHIP: 25,
            DESTROYER: 5
        };

        // Pattern library
        this.wavePatterns = this.initializeWavePatterns();
        this.hazardPatterns = this.initializeHazardPatterns();

        // Keep track of distance through the sector
        this.sectorProgress = 0;
    }

    /**
     * Generate a new sector with procedural content
     * @param {number} sectorNumber - The sector number
     * @param {string} nodeType - The type of node (COMBAT, ELITE, HAZARD, etc.)
     */
    generateSector(sectorNumber, nodeType = 'COMBAT') {
        this.currentSector = sectorNumber;
        this.sectorProgress = 0;

        // Adjust difficulty for sector number
        this.difficultyMultiplier = 1 + ((sectorNumber - 1) * CONSTANTS.SECTOR.DIFFICULTY_SCALING);

        // Further adjust difficulty based on node type
        if (nodeType === 'ELITE') {
            this.difficultyMultiplier *= 1.5; // Elite nodes are 50% harder
        } else if (nodeType === 'BOSS') {
            this.difficultyMultiplier *= 2.0; // Boss nodes are twice as hard
        } else if (nodeType === 'HAZARD') {
            // Hazard nodes have fewer enemies but more environmental hazards
        }

        // Generate sector structure
        const sector = {
            number: sectorNumber,
            nodeType: nodeType,
            waves: [],
            hazards: [],
            specialEncounters: [],
            bossEncounter: nodeType === 'BOSS' ? this.generateBossEncounter(sectorNumber) : null
        };

        // Determine number of enemies based on sector difficulty and node type
        let minEnemies = Math.floor(CONSTANTS.SECTOR.MIN_ENEMIES * this.difficultyMultiplier);
        let maxEnemies = Math.floor(CONSTANTS.SECTOR.MAX_ENEMIES * this.difficultyMultiplier);

        // Adjust enemy counts based on node type
        if (nodeType === 'HAZARD') {
            // Fewer enemies in hazard nodes
            minEnemies = Math.floor(minEnemies * 0.6);
            maxEnemies = Math.floor(maxEnemies * 0.6);
        } else if (nodeType === 'ELITE') {
            // More elite enemies in elite nodes
            minEnemies = Math.floor(minEnemies * 0.8);
            maxEnemies = Math.floor(maxEnemies * 0.8);
        } else if (nodeType === 'MERCHANT' || nodeType === 'EVENT') {
            // Very few enemies in merchant or event nodes
            minEnemies = Math.floor(minEnemies * 0.3);
            maxEnemies = Math.floor(maxEnemies * 0.3);
        }

        const totalEnemies = Phaser.Math.Between(minEnemies, maxEnemies);

        // Generate waves to distribute throughout the sector
        let remainingEnemies = totalEnemies;
        let sectorPosition = 0;

        // Keep adding waves until we've allocated all enemies and filled the sector
        while (remainingEnemies > 0 && sectorPosition < this.sectorLength) {
            // Generate a wave
            const wave = this.generateWave(remainingEnemies, sectorPosition);

            // Add wave to sector
            sector.waves.push(wave);

            // Update remaining enemies
            remainingEnemies -= wave.enemies.length;

            // Move to next position in sector (with spacing between waves)
            sectorPosition += wave.length + Phaser.Math.Between(300, 800);
        }

        // Add hazards throughout the sector
        this.addHazardsToSector(sector);

        // Add special encounters (upgrade nodes, etc.)
        this.addSpecialEncounters(sector);

        return sector;
    }

    /**
     * Generate a wave of enemies
     */
    generateWave(maxEnemies, position) {
        // Select a pattern
        const pattern = this.selectRandomPattern(this.wavePatterns);

        // Determine wave size (respect maxEnemies constraint)
        const waveSize = Math.min(
            pattern.enemyCount,
            Math.max(1, maxEnemies)
        );

        // Create the wave
        const wave = {
            position: position,
            length: pattern.length,
            enemies: []
        };

        // Generate enemies based on pattern
        for (let i = 0; i < waveSize; i++) {
            // Get enemy position from pattern (or random if beyond pattern size)
            const enemyPosition = i < pattern.positions.length
                ? {
                    x: pattern.positions[i].x,
                    y: position - pattern.positions[i].y // Convert to world position
                }
                : {
                    x: Phaser.Math.Between(50, this.scene.cameras.main.width - 50),
                    y: position - Phaser.Math.Between(0, pattern.length)
                };

            // Select enemy type based on weights and sector difficulty
            const enemyType = this.selectWeightedEnemyType(this.currentSector);

            // Determine if this enemy should be elite
            const isElite = Math.random() < this.getEliteChance();

            // Add enemy to wave
            wave.enemies.push({
                type: enemyType,
                position: enemyPosition,
                isElite: isElite
            });
        }

        return wave;
    }

    /**
     * Select a random pattern from the available patterns
     */
    selectRandomPattern(patterns) {
        return patterns[Phaser.Math.Between(0, patterns.length - 1)];
    }

    /**
     * Select enemy type based on sector difficulty and weighted probabilities
     */
    selectWeightedEnemyType(sector) {
        // Adjust weights based on sector number
        let adjustedWeights = {...this.enemyWeights};

        if (sector >= 3) {
            // Increase chance of tougher enemies in higher sectors
            adjustedWeights.DRONE -= 10 * (sector - 2);
            adjustedWeights.GUNSHIP += 5 * (sector - 2);
            adjustedWeights.DESTROYER += 5 * (sector - 2);

            // Ensure weights don't go below zero
            adjustedWeights.DRONE = Math.max(adjustedWeights.DRONE, 30);
        }

        // Calculate total weight
        const totalWeight = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);

        // Generate random value based on total weight
        let random = Math.random() * totalWeight;

        // Select enemy type based on weights
        for (const [type, weight] of Object.entries(adjustedWeights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }

        // Fallback to DRONE if something goes wrong
        return 'DRONE';
    }

    /**
     * Get the chance of spawning an elite enemy based on sector
     */
    getEliteChance() {
        // Start with base chance, increase with sector
        return 0.05 + (0.02 * (this.currentSector - 1));
    }

    /**
     * Add hazards throughout the sector
     */
    addHazardsToSector(sector) {
        // Determine number of hazard patterns based on sector length, frequency, and node type
        let hazardFrequency = CONSTANTS.SECTOR.HAZARD_FREQUENCY;

        // Adjust hazard frequency based on node type
        if (sector.nodeType === 'HAZARD') {
            hazardFrequency *= 2.0; // Double hazards in hazard nodes
        } else if (sector.nodeType === 'ELITE' || sector.nodeType === 'BOSS') {
            hazardFrequency *= 1.5; // More hazards in elite and boss nodes
        } else if (sector.nodeType === 'MERCHANT' || sector.nodeType === 'EVENT') {
            hazardFrequency *= 0.5; // Fewer hazards in merchant and event nodes
        }

        const hazardCount = Math.floor(
            (this.sectorLength / 1000) * hazardFrequency * this.difficultyMultiplier
        );

        // Generate and place hazards
        for (let i = 0; i < hazardCount; i++) {
            // Select a random hazard pattern
            const pattern = this.selectRandomPattern(this.hazardPatterns);

            // Determine position (avoid direct overlaps with waves)
            let position = Phaser.Math.Between(500, this.sectorLength - 500);

            // Ensure it doesn't directly overlap with waves
            let attempts = 0;
            while (this.checkPositionOverlap(position, 300, sector.waves) && attempts < 5) {
                position = Phaser.Math.Between(500, this.sectorLength - 500);
                attempts++;
            }

            // Add hazard to sector
            sector.hazards.push({
                type: pattern.type,
                position: position,
                width: pattern.width,
                pattern: pattern.pattern
            });
        }
    }

    /**
     * Add special encounters to the sector (upgrade nodes, etc.)
     */
    addSpecialEncounters(sector) {
        // Add upgrade nodes based on sector constant
        for (let i = 0; i < CONSTANTS.SECTOR.UPGRADE_NODES; i++) {
            // Position the upgrade node at approx. 1/3 and 2/3 of the way through sector
            const position = Math.floor((this.sectorLength * (i + 1)) / (CONSTANTS.SECTOR.UPGRADE_NODES + 1));

            // Ensure it doesn't overlap with existing encounters
            const finalPosition = this.findClearPosition(position, 500, sector);

            // Add upgrade node
            sector.specialEncounters.push({
                type: 'upgrade',
                position: finalPosition
            });
        }

        // Add other special encounters based on sector
        // Examples: resource caches, repair stations, lore events
        const extraEncounters = Math.floor(Math.random() * 2) + 1; // 1-2 extra encounters

        for (let i = 0; i < extraEncounters; i++) {
            // Random position
            let position = Phaser.Math.Between(300, this.sectorLength - 300);

            // Ensure it doesn't overlap with existing encounters
            position = this.findClearPosition(position, 400, sector);

            // Select encounter type
            const encounterTypes = ['resource', 'repair', 'event'];
            const type = encounterTypes[Math.floor(Math.random() * encounterTypes.length)];

            // Add encounter
            sector.specialEncounters.push({
                type: type,
                position: position
            });
        }
    }

    /**
     * Check if a position would overlap with existing elements
     */
    checkPositionOverlap(position, margin, elements) {
        for (const element of elements) {
            if (Math.abs(element.position - position) < margin) {
                return true;
            }
        }
        return false;
    }

    /**
     * Find a clear position that doesn't overlap with other elements
     */
    findClearPosition(idealPosition, margin, sector) {
        let position = idealPosition;
        let offset = 100;
        let attempts = 0;

        // Check for overlaps with waves
        while (
            (this.checkPositionOverlap(position, margin, sector.waves) ||
            this.checkPositionOverlap(position, margin, sector.hazards) ||
            this.checkPositionOverlap(position, margin, sector.specialEncounters)) &&
            attempts < 10
        ) {
            // Alternate between moving forward and backward from ideal position
            position = idealPosition + (offset * (attempts % 2 === 0 ? 1 : -1));
            offset += 100;
            attempts++;
        }

        return position;
    }

    /**
     * Generate a boss encounter for the sector
     */
    generateBossEncounter(sectorNumber) {
        // Different boss types for different sectors
        let bossType;

        switch (sectorNumber % 5) {
            case 1:
                bossType = 'SCOUT_COMMANDER';
                break;
            case 2:
                bossType = 'BATTLE_CARRIER';
                break;
            case 3:
                bossType = 'DESTROYER_PRIME';
                break;
            case 4:
                bossType = 'DREADNOUGHT';
                break;
            case 0: // Every 5th sector has the nemesis
                bossType = 'NEMESIS';
                break;
            default:
                bossType = 'SCOUT_COMMANDER';
        }

        // Each boss has a different arena
        const arenaType = `arena_${sectorNumber % 5 || 5}`;

        return {
            type: bossType,
            position: this.sectorLength,
            arena: arenaType,
            healthMultiplier: 1 + (0.1 * (sectorNumber - 1)) // Bosses get 10% more health per sector
        };
    }

    /**
     * Initialize the library of wave patterns
     */
    initializeWavePatterns() {
        return [
            {
                // V formation
                name: 'v-formation',
                enemyCount: 5,
                length: 300,
                positions: [
                    { x: 320, y: 0 },   // center lead
                    { x: 220, y: 100 }, // left wing
                    { x: 420, y: 100 }, // right wing
                    { x: 120, y: 200 }, // far left
                    { x: 520, y: 200 }  // far right
                ]
            },
            {
                // Line formation
                name: 'line',
                enemyCount: 6,
                length: 100,
                positions: [
                    { x: 160, y: 0 },
                    { x: 240, y: 0 },
                    { x: 320, y: 0 },
                    { x: 400, y: 0 },
                    { x: 480, y: 0 },
                    { x: 560, y: 0 }
                ]
            },
            {
                // X formation
                name: 'x-formation',
                enemyCount: 5,
                length: 400,
                positions: [
                    { x: 320, y: 200 }, // center
                    { x: 220, y: 100 }, // upper left
                    { x: 420, y: 100 }, // upper right
                    { x: 220, y: 300 }, // lower left
                    { x: 420, y: 300 }  // lower right
                ]
            },
            {
                // Circle formation
                name: 'circle',
                enemyCount: 8,
                length: 200,
                positions: [
                    { x: 320, y: 100 }, // top
                    { x: 420, y: 140 }, // top right
                    { x: 460, y: 200 }, // right
                    { x: 420, y: 260 }, // bottom right
                    { x: 320, y: 300 }, // bottom
                    { x: 220, y: 260 }, // bottom left
                    { x: 180, y: 200 }, // left
                    { x: 220, y: 140 }  // top left
                ]
            },
            {
                // Diamond formation
                name: 'diamond',
                enemyCount: 4,
                length: 400,
                positions: [
                    { x: 320, y: 0 },   // top
                    { x: 420, y: 200 }, // right
                    { x: 320, y: 400 }, // bottom
                    { x: 220, y: 200 }  // left
                ]
            },
            {
                // Square formation
                name: 'square',
                enemyCount: 4,
                length: 300,
                positions: [
                    { x: 220, y: 100 }, // top left
                    { x: 420, y: 100 }, // top right
                    { x: 420, y: 300 }, // bottom right
                    { x: 220, y: 300 }  // bottom left
                ]
            },
            {
                // Random cluster
                name: 'cluster',
                enemyCount: 10,
                length: 500,
                positions: [] // Positions generated randomly at runtime
            }
        ];
    }

    /**
     * Initialize the library of hazard patterns
     */
    initializeHazardPatterns() {
        return [
            {
                // Asteroid field
                type: 'asteroid',
                width: 300,
                pattern: 'dense'
            },
            {
                // Radiation zone
                type: 'radiation',
                width: 400,
                pattern: 'pulse'
            },
            {
                // Mine field
                type: 'mines',
                width: 200,
                pattern: 'grid'
            },
            {
                // Laser grid
                type: 'lasers',
                width: 150,
                pattern: 'sweeping'
            }
        ];
    }

    /**
     * Update the sector progress based on player movement
     */
    updateProgress(distance) {
        this.sectorProgress += distance;
        return this.sectorProgress / this.sectorLength; // Return progress percentage (0-1)
    }

    /**
     * Check if the player has reached the boss encounter
     */
    reachedBoss() {
        return this.sectorProgress >= this.sectorLength;
    }
}