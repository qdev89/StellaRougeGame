/**
 * Loading Scene
 * Handles loading all game assets and shows a loading progress bar
 */
class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.LOADING });
    }

    preload() {
        console.log('LoadingScene: Loading game assets...');

        // Setup loading bar with text only (no images required)
        this.createSimpleLoadingBar();

        // Register loading event handlers
        this.registerLoadingEvents();

        // Load game assets with error handling or create placeholders
        this.loadGameAssets();
    }

    create() {
        console.log('LoadingScene: Creating all assets programmatically');

        // Create placeholder textures for all assets
        this.createPlaceholderTextures();

        // Initialize animations
        this.createAnimations();

        // Add a slight delay before transitioning to the main menu
        this.time.delayedCall(1000, () => {
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });
    }

    loadComplete() {
        console.log('LoadingScene: Asset loading complete');
    }

    createSimpleLoadingBar() {
        // Position variables
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title text
        this.add.text(width / 2, height / 4, 'STELLAR ROGUE', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#33ff33',
            align: 'center'
        }).setOrigin(0.5);

        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#33ff33'
        }).setOrigin(0.5);

        // Progress percentage text
        this.percentText = this.add.text(width / 2, height / 2 - 5, '0%', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#33ff33'
        }).setOrigin(0.5);

        // Simple rectangle for loading bar background
        const barBgWidth = 400;
        const barHeight = 30;
        const barBg = this.add.rectangle(
            width / 2,
            height / 2 + 30,
            barBgWidth,
            barHeight,
            0x333333
        ).setOrigin(0.5);

        // Simple rectangle for loading bar fill
        this.loadingBar = this.add.rectangle(
            barBg.x - (barBgWidth / 2),
            barBg.y,
            0,
            barHeight,
            0x33ff33
        ).setOrigin(0, 0.5);
    }

    registerLoadingEvents() {
        // Update loading bar as assets are loaded
        this.load.on('progress', (value) => {
            // Update loading bar width based on progress value (0 to 1)
            this.loadingBar.width = 400 * value;

            // Update percentage text
            this.percentText.setText(`${Math.floor(value * 100)}%`);
        });

        // Log when files complete loading
        this.load.on('fileprogress', (file) => {
            console.log('Loading: ' + file.key);
        });

        // Handle load errors for individual files
        this.load.on('loaderror', (file) => {
            console.warn(`Error loading asset: ${file.key}`);
        });
    }

    loadGameAssets() {
        // Load the space.jfif file for the player ship
        try {
            this.load.image('player-ship-sprite', 'src/assets/sprites/space.jfif');
            console.log('Loading player ship sprite from space.jfif');
        } catch (error) {
            console.warn('Failed to load space.jfif:', error);
        }

        // We'll create all other textures programmatically
        console.log('Creating other assets programmatically');

        // We'll create all textures in the create() method
        this.load.on('complete', () => {
            // Force the loader to complete immediately
            this.loadComplete();
        });

        // Start the loader to trigger the complete event
        this.load.start();

        // Audio loading is completely disabled
        console.log('Audio loading completely disabled - all sound functionality has been removed');
    }

    createPlaceholderTextures() {
        // Create all required textures programmatically
        const requiredTextures = [
            'button', 'button-hover', 'bg-stars', 'bg-nebula', 'bg-planets', 'player-ship',
            'enemy-drone', 'enemy-gunship', 'enemy-destroyer', 'laser-blue', 'laser-red',
            'plasma-bolt', 'missile', 'powerup-health', 'powerup-shield',
            'powerup-weapon', 'powerup-score', 'powerup-flash', 'particle-blue',
            'star-particle', 'bg-dust', 'asteroid', 'enemy-interceptor', 'enemy-bomber',
            'enemy-stealth', 'enemy-turret', 'enemy-carrier'
            // New enemy types will use existing assets with different tints
        ];

        // Create all textures regardless of whether they exist
        requiredTextures.forEach(key => {
            // If texture already exists, destroy it first to avoid conflicts
            if (this.textures.exists(key)) {
                this.textures.remove(key);
            }
            this.createPlaceholderTexture(key);
        });

        // Create spritesheets for animations
        // If texture already exists, destroy it first
        if (this.textures.exists('explosion')) {
            this.textures.remove('explosion');
        }
        this.createExplosionSpritesheet();

        if (this.textures.exists('player-ship-engines')) {
            this.textures.remove('player-ship-engines');
        }
        this.createEnginesSpritesheet();

        console.log('Created all game textures programmatically');
    }

    createPlaceholderTexture(key) {
        // Always create a new texture programmatically
        // We don't rely on any external placeholder images
        const graphics = this.make.graphics();

        // Default size for textures
        const width = 64;
        const height = 64;

        // Colors based on texture type
        let color = 0xffffff;
        let bgColor = 0x000000;

        if (key.includes('player')) {
            color = 0x33ff33; // Green for player
        } else if (key.includes('enemy')) {
            color = 0xff3333; // Red for enemies
        } else if (key.includes('laser-blue')) {
            color = 0x3333ff; // Blue for player lasers
        } else if (key.includes('laser-red')) {
            color = 0xff3333; // Red for enemy lasers
        } else if (key.includes('plasma')) {
            color = 0xff33ff; // Purple for plasma
        } else if (key.includes('missile')) {
            color = 0xffff33; // Yellow for missiles
        } else if (key.includes('powerup')) {
            color = 0x33ffff; // Cyan for powerups
        } else if (key.includes('button')) {
            color = 0x333333; // Dark gray for buttons
            bgColor = 0x666666;
        } else if (key.includes('bg-') || key.includes('background')) {
            // Background patterns
            this.createBackgroundTexture(key);
            return;
        }

        // Different shapes based on entity type
        if (key.includes('ship') || key.includes('enemy')) {
            // Ship/enemy shape (triangle)
            graphics.fillStyle(color);
            graphics.fillTriangle(width/2, 0, width, height, 0, height);

            // Add some detail
            graphics.fillStyle(0xffffff);
            graphics.fillRect(width/2 - 5, height - 15, 10, 10);
        } else if (key.includes('laser')) {
            // Laser shape (thin rectangle)
            graphics.fillStyle(color);
            graphics.fillRect(width/2 - 2, 0, 4, height);
        } else if (key.includes('powerup')) {
            // Powerup shape (circle)
            graphics.fillStyle(bgColor);
            graphics.fillCircle(width/2, height/2, width/2);
            graphics.fillStyle(color);
            graphics.fillCircle(width/2, height/2, width/2 - 4);

            // Add a glow
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(width/2 - 8, height/2 - 8, 5);
        } else if (key.includes('button')) {
            // Button shape (rounded rectangle)
            graphics.fillStyle(color);
            graphics.fillRoundedRect(0, 0, width*4, height, 10);
            graphics.lineStyle(2, 0x33ff33);
            graphics.strokeRoundedRect(0, 0, width*4, height, 10);
        } else if (key.includes('particle')) {
            // Particle (small circle)
            graphics.fillStyle(color);
            graphics.fillCircle(4, 4, 4);

            // Generate with smaller size
            graphics.generateTexture(key, 8, 8);
            graphics.clear();
            return;
        } else {
            // Default shape (square)
            graphics.fillStyle(color);
            graphics.fillRect(0, 0, width, height);
        }

        // Generate texture
        graphics.generateTexture(key, width, height);
        graphics.clear();

        console.log(`Created placeholder for: ${key}`);
    }

    createBackgroundTexture(key) {
        const graphics = this.make.graphics();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        if (key === 'bg-stars') {
            // Enhanced star background with deep space color
            // Note: Using solid color instead of gradient for compatibility
            graphics.fillStyle(0x0A0A1F); // Deep space blue from style guide
            graphics.fillRect(0, 0, width, height);

            // Add stars with varying sizes and brightness
            const starCount = 200; // More stars
            for (let i = 0; i < starCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;

                // Vary star sizes more dramatically
                const sizeCategory = Math.random();
                let size;
                let alpha;

                if (sizeCategory > 0.97) { // Very large, bright stars (rare)
                    size = Math.random() * 3 + 2;
                    alpha = 1.0;
                    // Add glow effect to large stars
                    graphics.fillStyle(0x8888ff, 0.3);
                    graphics.fillCircle(x, y, size * 2);
                } else if (sizeCategory > 0.85) { // Medium stars
                    size = Math.random() * 2 + 1;
                    alpha = 0.9;
                } else { // Small stars (most common)
                    size = Math.random() * 1 + 0.5;
                    alpha = Math.random() * 0.5 + 0.3;
                }

                // Random star colors (mostly white, but some colored stars)
                const colorRoll = Math.random();
                if (colorRoll > 0.9) {
                    // Blue stars
                    graphics.fillStyle(0x8888ff, alpha);
                } else if (colorRoll > 0.8) {
                    // Red stars
                    graphics.fillStyle(0xff8888, alpha);
                } else if (colorRoll > 0.7) {
                    // Yellow stars
                    graphics.fillStyle(0xffff88, alpha);
                } else {
                    // White stars (most common)
                    graphics.fillStyle(0xffffff, alpha);
                }

                graphics.fillCircle(x, y, size);
            }

            // Add a few distant galaxies/star clusters
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 40 + 20;

                // Create galaxy with subtle color
                const galaxyColor = Math.random() > 0.5 ? 0x8866aa : 0x6688aa;
                graphics.fillStyle(galaxyColor, 0.1);
                graphics.fillCircle(x, y, size);

                // Add some structure to the galaxy
                graphics.fillStyle(galaxyColor, 0.05);
                graphics.fillCircle(x, y, size * 1.5);
            }
        } else if (key === 'bg-nebula') {
            // Enhanced nebula background with more complex shapes and colors
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, width, height);

            // Create multiple overlapping nebula clouds with different colors
            const nebulaColors = [
                0x3333ff, // Blue
                0xff33cc, // Pink (from style guide)
                0x9933ff, // Purple (from style guide)
                0x3366aa  // Deep blue
            ];

            // Create larger, more complex nebula formations
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 150 + 100;
                const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];

                // Main nebula cloud
                graphics.fillStyle(color, 0.1);
                graphics.fillCircle(x, y, size);

                // Add some internal structure
                graphics.fillStyle(color, 0.05);
                graphics.fillCircle(x + size * 0.2, y - size * 0.2, size * 0.7);

                // Add some bright spots within the nebula
                const brightSpots = Math.floor(Math.random() * 5) + 3;
                for (let j = 0; j < brightSpots; j++) {
                    const spotX = x + (Math.random() * size * 0.8) - (size * 0.4);
                    const spotY = y + (Math.random() * size * 0.8) - (size * 0.4);
                    const spotSize = Math.random() * 15 + 5;

                    graphics.fillStyle(0xffffff, 0.1);
                    graphics.fillCircle(spotX, spotY, spotSize);
                }
            }
        } else if (key === 'bg-dust') {
            // Enhanced space dust with more particles and better distribution
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, width, height);

            // Add dust particles with varying sizes and opacity
            const dustCount = 80; // More dust particles
            for (let i = 0; i < dustCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 4 + 1;
                const alpha = Math.random() * 0.3 + 0.1; // Subtle dust

                // Vary dust colors slightly
                const colorRoll = Math.random();
                if (colorRoll > 0.7) {
                    // Bluish dust
                    graphics.fillStyle(0xaaaadd, alpha);
                } else {
                    // White/gray dust (most common)
                    graphics.fillStyle(0xccccdd, alpha);
                }

                graphics.fillCircle(x, y, size);
            }

            // Add a few larger dust clouds
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 30 + 20;

                graphics.fillStyle(0xaaaacc, 0.05);
                graphics.fillCircle(x, y, size);
            }
        } else if (key === 'bg-planets') {
            // Enhanced planets with more detail
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, width, height);

            // Add distant planets with more detail
            const planetCount = 3;
            for (let i = 0; i < planetCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 60 + 40;

                // Planet base
                const planetColors = [
                    0xffaa33, // Orange gas giant
                    0x66aaff, // Blue ice planet
                    0xaa6644, // Red rocky planet
                    0x44aa66  // Green planet with atmosphere
                ];
                const planetColor = planetColors[Math.floor(Math.random() * planetColors.length)];

                // Planet body
                graphics.fillStyle(planetColor, 0.7);
                graphics.fillCircle(x, y, size);

                // Add atmosphere glow to some planets
                if (Math.random() > 0.5) {
                    graphics.fillStyle(0xffffff, 0.1);
                    graphics.fillCircle(x, y, size * 1.2);
                }

                // Add surface details to some planets
                if (Math.random() > 0.3) {
                    const detailCount = Math.floor(Math.random() * 5) + 3;
                    for (let j = 0; j < detailCount; j++) {
                        // Surface features (darker or lighter than base)
                        const detailX = x + (Math.random() * size * 0.8) - (size * 0.4);
                        const detailY = y + (Math.random() * size * 0.8) - (size * 0.4);
                        const detailSize = Math.random() * (size * 0.4) + (size * 0.1);

                        // Darker or lighter than the planet base color
                        graphics.fillStyle(Math.random() > 0.5 ? 0x000000 : 0xffffff, 0.1);
                        graphics.fillCircle(detailX, detailY, detailSize);
                    }
                }

                // Add rings to some planets
                if (Math.random() > 0.6) {
                    graphics.lineStyle(size * 0.1, planetColor, 0.3);
                    graphics.strokeEllipse(x, y, size * 1.8, size * 0.5);
                }
            }
        } else {
            // Default background with deep space color
            // Note: Using solid color instead of gradient for compatibility
            graphics.fillStyle(0x0A0A1F); // Deep space blue
            graphics.fillRect(0, 0, width, height);
        }

        // Generate texture
        graphics.generateTexture(key, width, height);
        graphics.clear();

        console.log(`Created background placeholder for: ${key}`);
    }

    createExplosionSpritesheet() {
        // Create an enhanced explosion animation spritesheet
        const frames = 12; // More frames for smoother animation
        const size = 64;

        // Create a canvas for the spritesheet
        const texture = this.textures.createCanvas('explosion', size * frames, size);
        const context = texture.getContext();

        // Draw frames
        for (let i = 0; i < frames; i++) {
            const x = i * size;
            const progress = i / frames;

            // More complex explosion animation with multiple phases
            // Phase 1: Initial flash (frames 0-1)
            // Phase 2: Expanding fireball (frames 2-5)
            // Phase 3: Dissipating smoke and debris (frames 6-11)

            if (progress < 0.15) { // Initial flash phase
                // Bright white/yellow flash
                const flashRadius = (size / 2) * (0.5 + progress * 3);

                // Outer glow
                const glowGradient = context.createRadialGradient(
                    x + size/2, size/2, 0,
                    x + size/2, size/2, flashRadius * 1.5
                );
                glowGradient.addColorStop(0, 'rgba(255, 255, 220, 0.8)');
                glowGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

                context.fillStyle = glowGradient;
                context.fillRect(x, 0, size, size);

                // Bright core
                context.fillStyle = 'rgb(255, 255, 255)';
                context.beginPath();
                context.arc(x + size/2, size/2, flashRadius * 0.7, 0, Math.PI * 2);
                context.fill();
            }
            else if (progress < 0.5) { // Expanding fireball phase
                // Calculate phase progress (0-1 within this phase)
                const phaseProgress = (progress - 0.15) / 0.35;
                const fireballRadius = (size / 2) * (0.8 + phaseProgress * 0.4);

                // Create a more realistic fireball with gradient
                const fireGradient = context.createRadialGradient(
                    x + size/2, size/2, 0,
                    x + size/2, size/2, fireballRadius
                );

                // Inner bright yellow/white
                fireGradient.addColorStop(0, 'rgb(255, 255, 220)');
                // Middle orange
                fireGradient.addColorStop(0.4, `rgb(255, ${Math.floor(200 - 150 * phaseProgress)}, 0)`);
                // Outer red
                fireGradient.addColorStop(0.8, `rgb(${Math.floor(200 - 100 * phaseProgress)}, 0, 0)`);
                // Edge fade
                fireGradient.addColorStop(1, 'rgba(100, 0, 0, 0.5)');

                context.fillStyle = fireGradient;
                context.beginPath();
                context.arc(x + size/2, size/2, fireballRadius, 0, Math.PI * 2);
                context.fill();

                // Add shockwave ring in early frames of this phase
                if (phaseProgress < 0.6) {
                    const ringRadius = fireballRadius * (1 + phaseProgress * 0.5);
                    const ringWidth = 2 + 3 * (1 - phaseProgress);

                    context.strokeStyle = `rgba(255, 255, 255, ${0.7 * (1 - phaseProgress)})`;
                    context.lineWidth = ringWidth;
                    context.beginPath();
                    context.arc(x + size/2, size/2, ringRadius, 0, Math.PI * 2);
                    context.stroke();
                }
            }
            else { // Dissipating smoke and debris phase
                // Calculate phase progress (0-1 within this phase)
                const phaseProgress = (progress - 0.5) / 0.5;

                // Smoke cloud
                const smokeRadius = (size / 2) * (1.2 - phaseProgress * 0.3);

                // Create smoke with gradient
                const smokeGradient = context.createRadialGradient(
                    x + size/2, size/2, 0,
                    x + size/2, size/2, smokeRadius
                );

                // Calculate phase progress for smoke phase
                const smokePhaseProgress = (progress - 0.5) / 0.5;

                // Dark center
                smokeGradient.addColorStop(0, `rgba(60, 60, 60, ${0.8 * (1 - smokePhaseProgress)})`);
                // Lighter edges
                smokeGradient.addColorStop(0.7, `rgba(100, 100, 100, ${0.5 * (1 - smokePhaseProgress)})`);
                // Fade out
                smokeGradient.addColorStop(1, 'rgba(120, 120, 120, 0)');

                context.fillStyle = smokeGradient;

                // Make smoke cloud more irregular with multiple overlapping circles
                for (let j = 0; j < 3; j++) {
                    const offsetX = (Math.random() - 0.5) * smokeRadius * 0.4;
                    const offsetY = (Math.random() - 0.5) * smokeRadius * 0.4;
                    const sizeVariation = 0.7 + Math.random() * 0.6;

                    context.beginPath();
                    context.arc(
                        x + size/2 + offsetX,
                        size/2 + offsetY,
                        smokeRadius * sizeVariation,
                        0, Math.PI * 2
                    );
                    context.fill();
                }
            }

            // Add debris particles in all phases
            const particleCount = progress < 0.15 ? 3 : progress < 0.5 ? 8 : 5;
            for (let j = 0; j < particleCount; j++) {
                // Particle properties based on explosion phase
                let particleSize, particleColor, distance;

                if (progress < 0.15) { // Flash phase - small bright particles
                    particleSize = Math.random() * 3 + 1;
                    particleColor = 'rgb(255, 255, 220)';
                    distance = Math.random() * size * 0.3;
                }
                else if (progress < 0.5) { // Fireball phase - larger, colored particles
                    particleSize = Math.random() * 4 + 2;

                    // Random particle colors - yellow, orange, red
                    const colorRoll = Math.random();
                    if (colorRoll > 0.7) {
                        particleColor = 'rgb(255, 255, 100)'; // Yellow
                    } else if (colorRoll > 0.3) {
                        particleColor = 'rgb(255, 150, 50)'; // Orange
                    } else {
                        particleColor = 'rgb(255, 50, 50)'; // Red
                    }

                    distance = Math.random() * size * 0.4;
                }
                else { // Smoke phase - darker, smaller particles
                    particleSize = Math.random() * 3 + 1;

                    // Calculate phase progress for smoke phase
                    const smokePhaseProgress = (progress - 0.5) / 0.5;

                    // Random particle colors - gray, dark orange, dark red
                    const colorRoll = Math.random();
                    if (colorRoll > 0.7) {
                        particleColor = `rgba(150, 150, 150, ${1 - smokePhaseProgress})`; // Gray
                    } else if (colorRoll > 0.3) {
                        particleColor = `rgba(150, 100, 50, ${1 - smokePhaseProgress})`; // Dark orange
                    } else {
                        particleColor = `rgba(100, 50, 50, ${1 - smokePhaseProgress})`; // Dark red
                    }

                    distance = Math.random() * size * 0.5;
                }

                // Position particles with more variation as explosion progresses
                const angle = Math.random() * Math.PI * 2;
                const particleX = x + size/2 + Math.cos(angle) * distance;
                const particleY = size/2 + Math.sin(angle) * distance;

                context.fillStyle = particleColor;
                context.beginPath();
                context.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                context.fill();
            }
        }

        // Update the texture
        texture.refresh();

        // Add frame data for the enhanced explosion animation
        for (let i = 0; i < frames; i++) {
            // Register each frame with the texture manager
            this.textures.get('explosion').add(i, 0, i * size, 0, size, size);
        }

        console.log('Created explosion spritesheet with frame data');
    }

    createEnginesSpritesheet() {
        // Create an enhanced engine animation spritesheet
        const frames = 6; // More frames for smoother animation
        const size = 32;

        // Create a canvas for the spritesheet
        const texture = this.textures.createCanvas('player-ship-engines', size * frames, size);
        const context = texture.getContext();

        // Draw frames
        for (let i = 0; i < frames; i++) {
            const x = i * size;
            // More complex pulsing pattern for natural flame effect
            const frameIntensity = 0.6 + Math.sin((i / frames) * Math.PI * 2) * 0.4;

            // Create a more dynamic flame effect with randomization
            const randomFactor = Math.random() * 0.2;
            const finalIntensity = frameIntensity + randomFactor;

            // Enhanced engine color with blue core
            const r = Math.floor(255 * finalIntensity);
            const g = Math.floor(150 + 100 * finalIntensity);
            const b = Math.floor(50 + 150 * (1 - finalIntensity)); // More blue when less intense

            // Different flame shapes for each frame with more variation
            const flameHeight = 15 + 12 * finalIntensity;
            const flameWidth = 16 + 4 * (1 - finalIntensity); // Wider when less intense

            // Outer glow effect - simplified for compatibility
            context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
            context.beginPath();
            context.arc(x + 16, 20, 12, 0, Math.PI * 2);
            context.fill();

            // Main engine flame - simplified for compatibility
            context.fillStyle = `rgb(${r}, ${g}, ${b/2})`;


            // Base flame shape - more organic with curves
            context.beginPath();
            context.moveTo(x + 8, 10);

            // Create a more natural flame shape with bezier curves
            context.bezierCurveTo(
                x + 8 - 2 * randomFactor, 15, // Control point 1
                x + 12, 20 + flameHeight * 0.5, // Control point 2
                x + 16, 20 + flameHeight // End point
            );

            context.bezierCurveTo(
                x + 20, 20 + flameHeight * 0.5, // Control point 1
                x + 24 + 2 * randomFactor, 15, // Control point 2
                x + 24, 10 // End point
            );

            context.closePath();
            context.fill();

            // Inner flame - brighter core - simplified for compatibility
            context.fillStyle = 'rgb(255, 255, 200)';


            // Inner flame shape
            context.beginPath();
            context.moveTo(x + 12, 5);

            // Create a more natural inner flame shape
            context.bezierCurveTo(
                x + 12, 8, // Control point 1
                x + 14, 10 + flameHeight * 0.3, // Control point 2
                x + 16, 10 + flameHeight * 0.7 // End point
            );

            context.bezierCurveTo(
                x + 18, 10 + flameHeight * 0.3, // Control point 1
                x + 20, 8, // Control point 2
                x + 20, 5 // End point
            );

            context.closePath();
            context.fill();

            // Add some spark particles
            for (let j = 0; j < 3; j++) {
                const sparkX = x + 16 + (Math.random() * 10 - 5);
                const sparkY = 15 + Math.random() * flameHeight * 0.8;
                const sparkSize = Math.random() * 2 + 1;

                context.fillStyle = 'rgb(255, 255, 200)';
                context.beginPath();
                context.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                context.fill();
            }
        }

        // Update the texture
        texture.refresh();

        // Add animation frames info for 6 frames
        this.textures.get('player-ship-engines').add('engine-thrust-0', 0, 0, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-1', 0, 32, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-2', 0, 64, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-3', 0, 96, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-4', 0, 128, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-5', 0, 160, 0, 32, 32);

        console.log('Created engine thrust spritesheet');
    }

    createAnimations() {
        // Create enhanced explosion animation
        if (this.textures.exists('explosion')) {
            if (!this.anims.exists('explosion-anim')) {
                this.anims.create({
                    key: 'explosion-anim',
                    frames: [
                        { key: 'explosion', frame: 0 },
                        { key: 'explosion', frame: 1 },
                        { key: 'explosion', frame: 2 },
                        { key: 'explosion', frame: 3 },
                        { key: 'explosion', frame: 4 },
                        { key: 'explosion', frame: 5 },
                        { key: 'explosion', frame: 6 },
                        { key: 'explosion', frame: 7 },
                        { key: 'explosion', frame: 8 },
                        { key: 'explosion', frame: 9 },
                        { key: 'explosion', frame: 10 },
                        { key: 'explosion', frame: 11 }
                    ],
                    frameRate: 20, // Faster for more dynamic effect
                    repeat: 0
                });
                console.log('Created enhanced explosion animation');
            }
        }

        // Create enhanced engine thrust animation
        if (this.textures.exists('player-ship-engines')) {
            if (!this.anims.exists('engine-thrust')) {
                this.anims.create({
                    key: 'engine-thrust',
                    frames: [
                        { key: 'player-ship-engines', frame: 'engine-thrust-0' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-1' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-2' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-3' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-4' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-5' }
                    ],
                    frameRate: 15, // Slightly faster for smoother animation
                    repeat: -1
                });
                console.log('Created enhanced engine thrust animation');
            }
        }
    }

    // Helper method to try loading images with fallback - not used anymore
    tryLoadImage(key, file) {
        try {
            this.textures.exists(key) || this.load.image(key, file);
        } catch (e) {
            console.warn(`Failed to load image: ${key}. Creating placeholder.`);
        }
    }

    // Helper method to try loading audio with fallback
    tryLoadAudio(key, file) {
        // Sound is disabled, so don't try to load audio files
        console.log(`Sound is disabled - skipping audio load: ${key}`);
        return;
    }
}