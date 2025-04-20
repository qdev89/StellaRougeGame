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
        // Create a spaceship sprite using base64 data to avoid CORS issues
        this.createSpaceshipSprite();

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

    createSpaceshipSprite() {
        try {
            // Create an improved spaceship texture based on space.jfif design
            const width = 120;
            const height = 160;

            // Create a canvas for the spaceship
            const texture = this.textures.createCanvas('player-ship-sprite', width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;

            // Create a metallic gradient for the ship body - enhanced with more vibrant colors
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#2255bb');   // Darker blue on left
            bodyGradient.addColorStop(0.5, '#5599ff'); // Lighter blue in center
            bodyGradient.addColorStop(1, '#2255bb');   // Darker blue on right

            // Draw the main body of the ship - more streamlined and aerodynamic design
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX, 10);              // Nose of the ship (sharper)
            context.quadraticCurveTo(                 // Right curved side
                centerX + 55, height/2 - 20,
                centerX + 35, height - 45
            );
            context.lineTo(centerX + 20, height - 25); // Right corner
            context.lineTo(centerX - 20, height - 25); // Left corner
            context.lineTo(centerX - 35, height - 45); // Left side
            context.quadraticCurveTo(                 // Left curved side
                centerX - 55, height/2 - 20,
                centerX, 10
            );
            context.closePath();
            context.fill();

            // Add a metallic stroke to the body with enhanced glow
            context.strokeStyle = '#99ccff';
            context.lineWidth = 1.5;
            context.stroke();

            // Add a cockpit with enhanced gradient for more depth
            const cockpitGradient = context.createLinearGradient(
                centerX - 20, 40,
                centerX + 20, 40
            );
            cockpitGradient.addColorStop(0, '#99ccff');   // Light blue
            cockpitGradient.addColorStop(0.5, '#ddeeff'); // Almost white
            cockpitGradient.addColorStop(1, '#99ccff');   // Light blue

            context.fillStyle = cockpitGradient;
            context.beginPath();
            context.moveTo(centerX, 30);           // Top of cockpit
            context.quadraticCurveTo(              // Right curved side
                centerX + 25, 45,
                centerX + 15, 75
            );
            context.lineTo(centerX, 85);           // Bottom
            context.lineTo(centerX - 15, 75);      // Left side
            context.quadraticCurveTo(              // Left curved side
                centerX - 25, 45,
                centerX, 30
            );
            context.closePath();
            context.fill();
            context.strokeStyle = '#ffffff';
            context.lineWidth = 0.8;
            context.stroke();

            // Add engine section with enhanced gradient for more depth
            const engineGradient = context.createLinearGradient(
                0, height - 40,
                0, height - 20
            );
            engineGradient.addColorStop(0, '#1133aa'); // Darker blue
            engineGradient.addColorStop(1, '#2244cc'); // Medium blue

            context.fillStyle = engineGradient;
            context.beginPath();
            context.moveTo(centerX - 30, height - 40); // Left top
            context.lineTo(centerX + 30, height - 40); // Right top
            context.quadraticCurveTo(                 // Right curved bottom
                centerX + 25, height - 20,
                centerX + 20, height - 20
            );
            context.lineTo(centerX - 20, height - 20); // Left bottom
            context.quadraticCurveTo(                 // Left curved bottom
                centerX - 25, height - 20,
                centerX - 30, height - 40
            );
            context.closePath();
            context.fill();
            context.strokeStyle = '#4477dd';
            context.lineWidth = 1;
            context.stroke();

            // Add engine glow with enhanced gradient for more realistic thruster effect
            const engineGlowGradient = context.createLinearGradient(
                centerX, height - 20,
                centerX, height
            );
            engineGlowGradient.addColorStop(0, '#ffdd44');          // Bright yellow
            engineGlowGradient.addColorStop(0.5, '#ff7733');        // Orange
            engineGlowGradient.addColorStop(1, 'rgba(255, 102, 51, 0)');

            context.fillStyle = engineGlowGradient;
            context.beginPath();
            context.moveTo(centerX - 20, height - 20); // Left top
            context.lineTo(centerX + 20, height - 20); // Right top
            context.lineTo(centerX + 12, height);      // Right bottom
            context.lineTo(centerX - 12, height);      // Left bottom
            context.closePath();
            context.fill();

            // Add secondary engine exhausts
            const smallEngineGlow = context.createLinearGradient(
                centerX - 25, height - 30,
                centerX - 25, height - 10
            );
            smallEngineGlow.addColorStop(0, '#ffcc33');
            smallEngineGlow.addColorStop(1, 'rgba(255, 102, 51, 0)');

            // Left small engine
            context.fillStyle = smallEngineGlow;
            context.beginPath();
            context.moveTo(centerX - 25, height - 30);
            context.lineTo(centerX - 20, height - 30);
            context.lineTo(centerX - 18, height - 10);
            context.lineTo(centerX - 27, height - 10);
            context.closePath();
            context.fill();

            // Right small engine
            const smallEngineGlow2 = context.createLinearGradient(
                centerX + 25, height - 30,
                centerX + 25, height - 10
            );
            smallEngineGlow2.addColorStop(0, '#ffcc33');
            smallEngineGlow2.addColorStop(1, 'rgba(255, 102, 51, 0)');

            context.fillStyle = smallEngineGlow2;
            context.beginPath();
            context.moveTo(centerX + 25, height - 30);
            context.lineTo(centerX + 20, height - 30);
            context.lineTo(centerX + 18, height - 10);
            context.lineTo(centerX + 27, height - 10);
            context.closePath();
            context.fill();

            // Add wing details with enhanced gradient for more depth
            const wingGradient = context.createLinearGradient(
                0, height - 80,
                0, height - 40
            );
            wingGradient.addColorStop(0, '#2255bb'); // Medium blue
            wingGradient.addColorStop(1, '#3366dd'); // Lighter blue

            // Left wing - more aerodynamic and detailed
            context.fillStyle = wingGradient;
            context.beginPath();
            context.moveTo(centerX - 35, height - 60); // Inner top
            context.lineTo(centerX - 70, height - 95); // Outer top (extended)
            context.lineTo(centerX - 75, height - 75); // Outer tip
            context.lineTo(centerX - 65, height - 55); // Outer bottom
            context.lineTo(centerX - 30, height - 40); // Inner bottom
            context.closePath();
            context.fill();

            // Add metallic edge to left wing
            context.strokeStyle = '#99ccff';
            context.lineWidth = 1.2;
            context.stroke();

            // Right wing - more aerodynamic and detailed
            context.fillStyle = wingGradient;
            context.beginPath();
            context.moveTo(centerX + 35, height - 60); // Inner top
            context.lineTo(centerX + 70, height - 95); // Outer top (extended)
            context.lineTo(centerX + 75, height - 75); // Outer tip
            context.lineTo(centerX + 65, height - 55); // Outer bottom
            context.lineTo(centerX + 30, height - 40); // Inner bottom
            context.closePath();
            context.fill();

            // Add metallic edge to right wing
            context.strokeStyle = '#99ccff';
            context.lineWidth = 1.2;
            context.stroke();

            // Add wing details - small fins
            context.fillStyle = '#1144aa';

            // Left fin
            context.beginPath();
            context.moveTo(centerX - 60, height - 85); // Base
            context.lineTo(centerX - 80, height - 100); // Tip
            context.lineTo(centerX - 70, height - 75); // Back
            context.closePath();
            context.fill();
            context.strokeStyle = '#5588dd';
            context.lineWidth = 0.8;
            context.stroke();

            // Right fin
            context.beginPath();
            context.moveTo(centerX + 60, height - 85); // Base
            context.lineTo(centerX + 80, height - 100); // Tip
            context.lineTo(centerX + 70, height - 75); // Back
            context.closePath();
            context.fill();
            context.strokeStyle = '#5588dd';
            context.lineWidth = 0.8;
            context.stroke();

            // Add some highlights and panel details for more realism
            context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            context.lineWidth = 0.7;

            // Highlight on the body - curved
            context.beginPath();
            context.moveTo(centerX - 10, 40);
            context.quadraticCurveTo(
                centerX - 20, height/2,
                centerX - 25, height - 70
            );
            context.stroke();

            // Add panel lines to body
            context.beginPath();
            context.moveTo(centerX, 10);  // From nose
            context.lineTo(centerX, 30);  // To cockpit
            context.stroke();

            // Panel lines on wings
            context.beginPath();
            context.moveTo(centerX - 35, height - 60);
            context.lineTo(centerX - 65, height - 75);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 35, height - 60);
            context.lineTo(centerX + 65, height - 75);
            context.stroke();

            // Add some details (lights) with enhanced glow
            context.fillStyle = '#ffffff';

            // Front light
            context.beginPath();
            context.arc(centerX, 15, 2, 0, Math.PI * 2);
            context.fill();

            // Front light glow
            const frontLightGlow = context.createRadialGradient(
                centerX, 15, 0,
                centerX, 15, 8
            );
            frontLightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            frontLightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

            context.fillStyle = frontLightGlow;
            context.beginPath();
            context.arc(centerX, 15, 8, 0, Math.PI * 2);
            context.fill();

            // Wing lights - with enhanced glow
            for (const x of [centerX - 70, centerX + 70]) {
                // Light
                context.fillStyle = '#ffffff';
                context.beginPath();
                context.arc(x, height - 85, 2, 0, Math.PI * 2);
                context.fill();

                // Glow
                const lightGlow = context.createRadialGradient(
                    x, height - 85, 0,
                    x, height - 85, 8
                );
                lightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                lightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

                context.fillStyle = lightGlow;
                context.beginPath();
                context.arc(x, height - 85, 8, 0, Math.PI * 2);
                context.fill();
            }

            // Add engine lights with enhanced glow
            for (const x of [centerX - 12, centerX, centerX + 12]) {
                // Engine light
                context.fillStyle = '#ffee66';
                context.beginPath();
                context.arc(x, height - 20, 2.5, 0, Math.PI * 2);
                context.fill();

                // Engine light glow
                const engineLightGlow = context.createRadialGradient(
                    x, height - 20, 0,
                    x, height - 20, 6
                );
                engineLightGlow.addColorStop(0, 'rgba(255, 238, 102, 0.8)');
                engineLightGlow.addColorStop(1, 'rgba(255, 238, 102, 0)');

                context.fillStyle = engineLightGlow;
                context.beginPath();
                context.arc(x, height - 20, 6, 0, Math.PI * 2);
                context.fill();
            }

            // Add small engine lights
            context.fillStyle = '#ffcc33';
            context.beginPath();
            context.arc(centerX - 25, height - 25, 1.5, 0, Math.PI * 2);
            context.fill();

            context.beginPath();
            context.arc(centerX + 25, height - 25, 1.5, 0, Math.PI * 2);
            context.fill();

            // Add a subtle glow around the ship for enhanced visual effect
            const shipGlow = context.createRadialGradient(
                centerX, height/2, 20,
                centerX, height/2, 100
            );
            shipGlow.addColorStop(0, 'rgba(102, 170, 255, 0.3)');
            shipGlow.addColorStop(1, 'rgba(102, 170, 255, 0)');

            context.fillStyle = shipGlow;
            context.beginPath();
            context.arc(centerX, height/2, 100, 0, Math.PI * 2);
            context.fill();

            // Update the texture
            texture.refresh();

            console.log('Created enhanced spaceship sprite with improved details');
        } catch (error) {
            console.warn('Failed to create spaceship sprite:', error);
        }
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
        if (key.includes('enemy-drone')) {
            // Create a detailed enemy drone sprite
            this.createEnemyDroneSprite(key);
            return;
        } else if (key.includes('enemy-gunship')) {
            // Create a detailed enemy gunship sprite
            this.createEnemyGunshipSprite(key);
            return;
        } else if (key.includes('enemy-destroyer')) {
            // Create a detailed enemy destroyer sprite
            this.createEnemyDestroyerSprite(key);
            return;
        } else if (key.includes('enemy-interceptor')) {
            // Create a detailed enemy interceptor sprite
            this.createEnemyInterceptorSprite(key);
            return;
        } else if (key.includes('enemy-bomber')) {
            // Create a detailed enemy bomber sprite
            this.createEnemyBomberSprite(key);
            return;
        } else if (key.includes('enemy-stealth')) {
            // Create a detailed enemy stealth ship sprite
            this.createEnemyStealthSprite(key);
            return;
        } else if (key.includes('enemy-turret')) {
            // Create a detailed enemy turret sprite
            this.createEnemyTurretSprite(key);
            return;
        } else if (key.includes('enemy-carrier')) {
            // Create a detailed enemy carrier sprite
            this.createEnemyCarrierSprite(key);
            return;
        } else if (key.includes('ship') || key.includes('enemy')) {
            // Generic ship/enemy shape (triangle) as fallback
            graphics.fillStyle(color);
            graphics.fillTriangle(width/2, 0, width, height, 0, height);

            // Add some detail
            graphics.fillStyle(0xffffff);
            graphics.fillRect(width/2 - 5, height - 15, 10, 10);
        } else if (key.includes('laser')) {
            // Create enhanced laser beam
            this.createEnhancedLaserSprite(key, color);
            return;
        } else if (key.includes('powerup')) {
            // Create enhanced powerup sprite
            this.createEnhancedPowerupSprite(key, color, bgColor);
            return;
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

    // Create enhanced enemy ship sprites
    createEnemyDroneSprite(key) {
        try {
            // Create a small, fast drone ship
            const width = 48;
            const height = 48;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a metallic red gradient for the ship body
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#aa3333');   // Darker red on left
            bodyGradient.addColorStop(0.5, '#ff5555'); // Lighter red in center
            bodyGradient.addColorStop(1, '#aa3333');   // Darker red on right

            // Draw the main body of the drone - small triangular shape
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX, 10);              // Nose of the ship
            context.lineTo(centerX + 15, height - 15); // Right corner
            context.lineTo(centerX - 15, height - 15); // Left corner
            context.closePath();
            context.fill();

            // Add a metallic stroke to the body
            context.strokeStyle = '#ff9999';
            context.lineWidth = 1;
            context.stroke();

            // Add wing details
            context.fillStyle = '#992222';

            // Left wing
            context.beginPath();
            context.moveTo(centerX - 15, height - 15); // Inner corner
            context.lineTo(centerX - 25, height - 20); // Outer point
            context.lineTo(centerX - 10, height - 10); // Back point
            context.closePath();
            context.fill();

            // Right wing
            context.beginPath();
            context.moveTo(centerX + 15, height - 15); // Inner corner
            context.lineTo(centerX + 25, height - 20); // Outer point
            context.lineTo(centerX + 10, height - 10); // Back point
            context.closePath();
            context.fill();

            // Add engine glow
            const engineGlow = context.createRadialGradient(
                centerX, height - 12, 0,
                centerX, height - 12, 10
            );
            engineGlow.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
            engineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = engineGlow;
            context.beginPath();
            context.arc(centerX, height - 12, 10, 0, Math.PI * 2);
            context.fill();

            // Add cockpit/sensor array
            context.fillStyle = '#ffcccc';
            context.beginPath();
            context.arc(centerX, centerY - 5, 4, 0, Math.PI * 2);
            context.fill();

            // Add panel lines
            context.strokeStyle = '#ff6666';
            context.lineWidth = 0.5;

            // Center line
            context.beginPath();
            context.moveTo(centerX, 10);
            context.lineTo(centerX, centerY + 5);
            context.stroke();

            // Wing lines
            context.beginPath();
            context.moveTo(centerX - 5, centerY);
            context.lineTo(centerX - 15, height - 15);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 5, centerY);
            context.lineTo(centerX + 15, height - 15);
            context.stroke();

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff3333);
            graphics.fillTriangle(24, 0, 48, 48, 0, 48);
            graphics.generateTexture(key, 48, 48);
            graphics.clear();
        }
    }

    createEnemyGunshipSprite(key) {
        try {
            // Create a medium-sized gunship with weapon pods
            const width = 64;
            const height = 64;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a metallic red gradient for the ship body
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#992222');   // Darker red on left
            bodyGradient.addColorStop(0.5, '#dd4444'); // Lighter red in center
            bodyGradient.addColorStop(1, '#992222');   // Darker red on right

            // Draw the main body of the gunship - wider triangular shape
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX, 8);               // Nose of the ship
            context.lineTo(centerX + 25, height - 18); // Right corner
            context.lineTo(centerX - 25, height - 18); // Left corner
            context.closePath();
            context.fill();

            // Add a metallic stroke to the body
            context.strokeStyle = '#ff6666';
            context.lineWidth = 1;
            context.stroke();

            // Add weapon pods
            context.fillStyle = '#661111';

            // Left weapon pod
            context.beginPath();
            context.moveTo(centerX - 20, height - 25); // Top
            context.lineTo(centerX - 30, height - 20); // Outer
            context.lineTo(centerX - 28, height - 10); // Bottom
            context.lineTo(centerX - 15, height - 15); // Inner
            context.closePath();
            context.fill();

            // Right weapon pod
            context.beginPath();
            context.moveTo(centerX + 20, height - 25); // Top
            context.lineTo(centerX + 30, height - 20); // Outer
            context.lineTo(centerX + 28, height - 10); // Bottom
            context.lineTo(centerX + 15, height - 15); // Inner
            context.closePath();
            context.fill();

            // Add engine glow
            const engineGlow = context.createRadialGradient(
                centerX, height - 15, 0,
                centerX, height - 15, 12
            );
            engineGlow.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
            engineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = engineGlow;
            context.beginPath();
            context.arc(centerX, height - 15, 12, 0, Math.PI * 2);
            context.fill();

            // Add weapon glow
            const weaponGlow = context.createRadialGradient(
                centerX - 25, height - 15, 0,
                centerX - 25, height - 15, 5
            );
            weaponGlow.addColorStop(0, 'rgba(255, 50, 50, 0.8)');
            weaponGlow.addColorStop(1, 'rgba(255, 50, 50, 0)');

            // Left weapon glow
            context.fillStyle = weaponGlow;
            context.beginPath();
            context.arc(centerX - 25, height - 15, 5, 0, Math.PI * 2);
            context.fill();

            // Right weapon glow
            const weaponGlow2 = context.createRadialGradient(
                centerX + 25, height - 15, 0,
                centerX + 25, height - 15, 5
            );
            weaponGlow2.addColorStop(0, 'rgba(255, 50, 50, 0.8)');
            weaponGlow2.addColorStop(1, 'rgba(255, 50, 50, 0)');

            context.fillStyle = weaponGlow2;
            context.beginPath();
            context.arc(centerX + 25, height - 15, 5, 0, Math.PI * 2);
            context.fill();

            // Add cockpit
            context.fillStyle = '#ffaaaa';
            context.beginPath();
            context.arc(centerX, centerY - 10, 6, 0, Math.PI * 2);
            context.fill();

            // Add panel lines
            context.strokeStyle = '#ff6666';
            context.lineWidth = 0.5;

            // Center line
            context.beginPath();
            context.moveTo(centerX, 8);
            context.lineTo(centerX, centerY + 10);
            context.stroke();

            // Wing lines
            context.beginPath();
            context.moveTo(centerX - 10, centerY - 5);
            context.lineTo(centerX - 25, height - 18);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 10, centerY - 5);
            context.lineTo(centerX + 25, height - 18);
            context.stroke();

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff3333);
            graphics.fillTriangle(32, 0, 64, 64, 0, 64);
            graphics.generateTexture(key, 64, 64);
            graphics.clear();
        }
    }

    createEnemyDestroyerSprite(key) {
        try {
            // Create a large, heavily armored destroyer
            const width = 80;
            const height = 80;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a metallic dark red gradient for the ship body
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#771111');   // Darker red on left
            bodyGradient.addColorStop(0.5, '#aa2222'); // Lighter red in center
            bodyGradient.addColorStop(1, '#771111');   // Darker red on right

            // Draw the main body of the destroyer - bulky shape
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX, 10);               // Nose of the ship
            context.lineTo(centerX + 15, 25);          // Right shoulder
            context.lineTo(centerX + 35, height - 20); // Right corner
            context.lineTo(centerX - 35, height - 20); // Left corner
            context.lineTo(centerX - 15, 25);          // Left shoulder
            context.closePath();
            context.fill();

            // Add a metallic stroke to the body
            context.strokeStyle = '#cc3333';
            context.lineWidth = 1.5;
            context.stroke();

            // Add armor plating
            context.fillStyle = '#550000';

            // Left armor plate
            context.beginPath();
            context.moveTo(centerX - 15, 25);          // Top
            context.lineTo(centerX - 25, 35);          // Outer top
            context.lineTo(centerX - 30, height - 25); // Outer bottom
            context.lineTo(centerX - 20, height - 20); // Inner bottom
            context.closePath();
            context.fill();

            // Right armor plate
            context.beginPath();
            context.moveTo(centerX + 15, 25);          // Top
            context.lineTo(centerX + 25, 35);          // Outer top
            context.lineTo(centerX + 30, height - 25); // Outer bottom
            context.lineTo(centerX + 20, height - 20); // Inner bottom
            context.closePath();
            context.fill();

            // Add engine glow
            const engineGlow = context.createRadialGradient(
                centerX, height - 20, 0,
                centerX, height - 20, 15
            );
            engineGlow.addColorStop(0, 'rgba(255, 150, 50, 0.8)');
            engineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = engineGlow;
            context.beginPath();
            context.arc(centerX, height - 20, 15, 0, Math.PI * 2);
            context.fill();

            // Add weapon turrets
            context.fillStyle = '#aa0000';

            // Main turret
            context.beginPath();
            context.arc(centerX, centerY - 5, 8, 0, Math.PI * 2);
            context.fill();

            // Side turrets
            context.beginPath();
            context.arc(centerX - 20, centerY + 10, 5, 0, Math.PI * 2);
            context.fill();

            context.beginPath();
            context.arc(centerX + 20, centerY + 10, 5, 0, Math.PI * 2);
            context.fill();

            // Add turret details
            context.strokeStyle = '#ff4444';
            context.lineWidth = 1;

            // Main gun barrel
            context.beginPath();
            context.moveTo(centerX, centerY - 10);
            context.lineTo(centerX, centerY - 20);
            context.stroke();

            // Side gun barrels
            context.beginPath();
            context.moveTo(centerX - 20, centerY + 7);
            context.lineTo(centerX - 25, centerY);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 20, centerY + 7);
            context.lineTo(centerX + 25, centerY);
            context.stroke();

            // Add shield generator dome
            context.fillStyle = '#cc6666';
            context.beginPath();
            context.arc(centerX, centerY + 15, 6, 0, Math.PI, true);
            context.closePath();
            context.fill();

            // Add panel lines and details
            context.strokeStyle = '#cc3333';
            context.lineWidth = 0.5;

            // Center line
            context.beginPath();
            context.moveTo(centerX, 10);
            context.lineTo(centerX, centerY + 25);
            context.stroke();

            // Armor plate details
            context.beginPath();
            context.moveTo(centerX - 20, 30);
            context.lineTo(centerX - 25, height - 30);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 20, 30);
            context.lineTo(centerX + 25, height - 30);
            context.stroke();

            // Add a subtle glow around the ship
            const shipGlow = context.createRadialGradient(
                centerX, centerY, 20,
                centerX, centerY, 50
            );
            shipGlow.addColorStop(0, 'rgba(255, 50, 50, 0.1)');
            shipGlow.addColorStop(1, 'rgba(255, 50, 50, 0)');

            context.fillStyle = shipGlow;
            context.beginPath();
            context.arc(centerX, centerY, 50, 0, Math.PI * 2);
            context.fill();

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff3333);
            graphics.fillTriangle(40, 0, 80, 80, 0, 80);
            graphics.generateTexture(key, 80, 80);
            graphics.clear();
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

    createEnhancedLaserSprite(key, color) {
        // Create a more visually appealing laser beam
        const width = 8;
        const height = 32;

        // Create a graphics object for the laser
        const graphics = this.make.graphics();

        // Determine laser color based on key or use provided color
        let laserColor = color || 0x33ff33; // Default green

        if (key.includes('blue')) {
            laserColor = 0x33ccff; // Blue laser
        } else if (key.includes('red')) {
            laserColor = 0xff3333; // Red laser
        } else if (key.includes('purple')) {
            laserColor = 0xcc33ff; // Purple laser
        } else if (key.includes('yellow')) {
            laserColor = 0xffcc33; // Yellow laser
        }

        // Create a gradient effect for the laser
        graphics.fillStyle(laserColor, 0.7);
        graphics.fillRect(0, 0, width, height);

        // Add a brighter core to the laser
        graphics.fillStyle(0xffffff, 0.5);
        graphics.fillRect(width/4, 0, width/2, height);

        // Add a glow effect at the front of the laser
        graphics.fillStyle(laserColor, 0.3);
        graphics.fillCircle(width/2, 4, width);

        // Generate the texture
        graphics.generateTexture(key, width, height);
        graphics.clear();

        console.log(`Created enhanced laser sprite: ${key}`);
    }

    createEnhancedPowerupSprite(key, color, bgColor) {
        // Create a more visually appealing powerup
        const width = 32;
        const height = 32;

        // Create a graphics object for the powerup
        const graphics = this.make.graphics();

        // Determine powerup color based on key or use provided color
        let powerupColor = color || 0x33ff33; // Default green
        let powerupBgColor = bgColor || 0x222222; // Default dark background

        if (key.includes('health')) {
            powerupColor = 0x33ff33; // Green for health
        } else if (key.includes('shield')) {
            powerupColor = 0x33ccff; // Blue for shield
        } else if (key.includes('ammo')) {
            powerupColor = 0xffcc33; // Yellow for ammo
        } else if (key.includes('weapon')) {
            powerupColor = 0xff3333; // Red for weapon
        } else if (key.includes('score')) {
            powerupColor = 0xcc33ff; // Purple for score
        }

        // Create a glowing orb effect
        // Outer glow
        graphics.fillStyle(powerupColor, 0.3);
        graphics.fillCircle(width/2, height/2, width/2);

        // Middle glow
        graphics.fillStyle(powerupColor, 0.5);
        graphics.fillCircle(width/2, height/2, width/2.5);

        // Inner circle
        graphics.fillStyle(powerupColor, 0.8);
        graphics.fillCircle(width/2, height/2, width/3);

        // Core
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillCircle(width/2, height/2, width/6);

        // Add appropriate symbol based on powerup type
        graphics.lineStyle(2, 0xffffff, 0.9);

        if (key.includes('health')) {
            // Plus symbol for health
            graphics.beginPath();
            graphics.moveTo(width/2, height/3);
            graphics.lineTo(width/2, height*2/3);
            graphics.moveTo(width/3, height/2);
            graphics.lineTo(width*2/3, height/2);
            graphics.strokePath();
        } else if (key.includes('shield')) {
            // Shield symbol
            graphics.beginPath();
            graphics.arc(width/2, height/2, width/4, Math.PI, 0, false);
            graphics.strokePath();
        } else if (key.includes('ammo')) {
            // Bullet symbol
            graphics.fillStyle(0xffffff, 0.9);
            graphics.fillRect(width/2 - 2, height/3, 4, height/3);
        } else if (key.includes('weapon')) {
            // Crosshair symbol
            graphics.beginPath();
            graphics.arc(width/2, height/2, width/5, 0, Math.PI * 2);
            graphics.moveTo(width/3, height/2);
            graphics.lineTo(width*2/3, height/2);
            graphics.moveTo(width/2, height/3);
            graphics.lineTo(width/2, height*2/3);
            graphics.strokePath();
        } else if (key.includes('score')) {
            // Star symbol for score
            graphics.fillStyle(0xffffff, 0.9);
            const points = 5;
            const innerRadius = width/8;
            const outerRadius = width/4;

            let angle = -Math.PI / 2; // Start at top
            const angleIncrement = Math.PI * 2 / (points * 2);

            graphics.beginPath();
            graphics.moveTo(width/2 + Math.cos(angle) * outerRadius, height/2 + Math.sin(angle) * outerRadius);

            for (let i = 0; i < points * 2; i++) {
                angle += angleIncrement;
                const radius = i % 2 === 0 ? innerRadius : outerRadius;
                graphics.lineTo(width/2 + Math.cos(angle) * radius, height/2 + Math.sin(angle) * radius);
            }

            graphics.closePath();
            graphics.fillPath();
        } else {
            // Default star symbol
            graphics.fillCircle(width/2, height/2, width/6);
        }

        // Generate the texture
        graphics.generateTexture(key, width, height);
        graphics.clear();

        console.log(`Created enhanced powerup sprite: ${key}`);
    }

    createEnemyInterceptorSprite(key) {
        try {
            // Create a fast, agile interceptor ship
            const width = 56;
            const height = 56;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a metallic red gradient for the ship body
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#cc3333');   // Darker red on left
            bodyGradient.addColorStop(0.5, '#ff5555'); // Lighter red in center
            bodyGradient.addColorStop(1, '#cc3333');   // Darker red on right

            // Draw the main body of the interceptor - sleek, arrow-like shape
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX, 5);               // Nose of the ship (sharper)
            context.quadraticCurveTo(                 // Right curved side
                centerX + 20, centerY - 10,
                centerX + 15, height - 15
            );
            context.lineTo(centerX, height - 10);     // Bottom point
            context.lineTo(centerX - 15, height - 15); // Left side
            context.quadraticCurveTo(                 // Left curved side
                centerX - 20, centerY - 10,
                centerX, 5
            );
            context.closePath();
            context.fill();

            // Add a metallic stroke to the body
            context.strokeStyle = '#ff7777';
            context.lineWidth = 1;
            context.stroke();

            // Add wing details
            context.fillStyle = '#aa2222';

            // Left wing - swept back for speed
            context.beginPath();
            context.moveTo(centerX - 10, centerY);     // Inner point
            context.lineTo(centerX - 30, centerY + 5); // Outer forward
            context.lineTo(centerX - 25, centerY + 20); // Outer back
            context.lineTo(centerX - 5, centerY + 10); // Inner back
            context.closePath();
            context.fill();

            // Right wing - swept back for speed
            context.beginPath();
            context.moveTo(centerX + 10, centerY);     // Inner point
            context.lineTo(centerX + 30, centerY + 5); // Outer forward
            context.lineTo(centerX + 25, centerY + 20); // Outer back
            context.lineTo(centerX + 5, centerY + 10); // Inner back
            context.closePath();
            context.fill();

            // Add engine glow - brighter for speed
            const engineGlow = context.createRadialGradient(
                centerX, height - 10, 0,
                centerX, height - 10, 12
            );
            engineGlow.addColorStop(0, 'rgba(255, 220, 50, 0.9)');
            engineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = engineGlow;
            context.beginPath();
            context.arc(centerX, height - 10, 12, 0, Math.PI * 2);
            context.fill();

            // Add cockpit - sleek and streamlined
            context.fillStyle = '#ffcccc';
            context.beginPath();
            context.ellipse(centerX, centerY - 10, 5, 8, 0, 0, Math.PI * 2);
            context.fill();

            // Add panel lines for detail
            context.strokeStyle = '#ff6666';
            context.lineWidth = 0.5;

            // Center line
            context.beginPath();
            context.moveTo(centerX, 5);
            context.lineTo(centerX, centerY + 10);
            context.stroke();

            // Wing lines
            context.beginPath();
            context.moveTo(centerX - 5, centerY);
            context.lineTo(centerX - 20, centerY + 10);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 5, centerY);
            context.lineTo(centerX + 20, centerY + 10);
            context.stroke();

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff3333);
            graphics.fillTriangle(28, 0, 56, 56, 0, 56);
            graphics.generateTexture(key, 56, 56);
            graphics.clear();
        }
    }

    createEnemyBomberSprite(key) {
        try {
            // Create a heavy bomber with bomb bays
            const width = 72;
            const height = 72;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a metallic dark red gradient for the ship body
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#882222');   // Darker red on left
            bodyGradient.addColorStop(0.5, '#cc3333'); // Lighter red in center
            bodyGradient.addColorStop(1, '#882222');   // Darker red on right

            // Draw the main body of the bomber - bulky, wide shape
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX, 10);               // Nose of the ship
            context.lineTo(centerX + 25, centerY - 10); // Right shoulder
            context.lineTo(centerX + 20, height - 20); // Right corner
            context.lineTo(centerX - 20, height - 20); // Left corner
            context.lineTo(centerX - 25, centerY - 10); // Left shoulder
            context.closePath();
            context.fill();

            // Add a metallic stroke to the body
            context.strokeStyle = '#dd4444';
            context.lineWidth = 1.5;
            context.stroke();

            // Add bomb bay doors
            context.fillStyle = '#661111';

            // Left bomb bay
            context.beginPath();
            context.rect(centerX - 15, centerY, 10, 20);
            context.fill();
            context.strokeStyle = '#aa2222';
            context.lineWidth = 0.5;
            context.stroke();

            // Right bomb bay
            context.beginPath();
            context.rect(centerX + 5, centerY, 10, 20);
            context.fill();
            context.strokeStyle = '#aa2222';
            context.lineWidth = 0.5;
            context.stroke();

            // Add engine glow
            const engineGlow = context.createRadialGradient(
                centerX, height - 20, 0,
                centerX, height - 20, 15
            );
            engineGlow.addColorStop(0, 'rgba(255, 150, 50, 0.8)');
            engineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = engineGlow;
            context.beginPath();
            context.arc(centerX, height - 20, 15, 0, Math.PI * 2);
            context.fill();

            // Add cockpit
            context.fillStyle = '#ffaaaa';
            context.beginPath();
            context.arc(centerX, centerY - 15, 7, 0, Math.PI * 2);
            context.fill();

            // Add wing details
            context.fillStyle = '#771111';

            // Left wing
            context.beginPath();
            context.moveTo(centerX - 25, centerY - 5);  // Inner top
            context.lineTo(centerX - 40, centerY);     // Outer top
            context.lineTo(centerX - 35, centerY + 20); // Outer bottom
            context.lineTo(centerX - 15, centerY + 10); // Inner bottom
            context.closePath();
            context.fill();

            // Right wing
            context.beginPath();
            context.moveTo(centerX + 25, centerY - 5);  // Inner top
            context.lineTo(centerX + 40, centerY);     // Outer top
            context.lineTo(centerX + 35, centerY + 20); // Outer bottom
            context.lineTo(centerX + 15, centerY + 10); // Inner bottom
            context.closePath();
            context.fill();

            // Add panel lines and details
            context.strokeStyle = '#cc3333';
            context.lineWidth = 0.5;

            // Center line
            context.beginPath();
            context.moveTo(centerX, 10);
            context.lineTo(centerX, centerY + 25);
            context.stroke();

            // Wing lines
            context.beginPath();
            context.moveTo(centerX - 15, centerY - 5);
            context.lineTo(centerX - 30, centerY + 10);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 15, centerY - 5);
            context.lineTo(centerX + 30, centerY + 10);
            context.stroke();

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff3333);
            graphics.fillTriangle(36, 0, 72, 72, 0, 72);
            graphics.generateTexture(key, 72, 72);
            graphics.clear();
        }
    }

    createEnemyStealthSprite(key) {
        try {
            // Create a stealthy, angular ship with low visibility
            const width = 60;
            const height = 60;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a dark, subtle gradient for the stealth ship
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#551111');   // Very dark red on left
            bodyGradient.addColorStop(0.5, '#772222'); // Dark red in center
            bodyGradient.addColorStop(1, '#551111');   // Very dark red on right

            // Draw the main body - angular, faceted shape for stealth
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX, 8);                // Nose of the ship
            context.lineTo(centerX + 15, centerY - 5); // Right shoulder
            context.lineTo(centerX + 10, centerY + 10); // Right mid
            context.lineTo(centerX + 20, height - 15); // Right wing
            context.lineTo(centerX, height - 10);      // Bottom point
            context.lineTo(centerX - 20, height - 15); // Left wing
            context.lineTo(centerX - 10, centerY + 10); // Left mid
            context.lineTo(centerX - 15, centerY - 5); // Left shoulder
            context.closePath();
            context.fill();

            // Add a subtle edge highlight
            context.strokeStyle = 'rgba(255, 100, 100, 0.3)';
            context.lineWidth = 0.8;
            context.stroke();

            // Add very subtle engine glow (stealth engines)
            const engineGlow = context.createRadialGradient(
                centerX, height - 12, 0,
                centerX, height - 12, 10
            );
            engineGlow.addColorStop(0, 'rgba(200, 50, 50, 0.4)');
            engineGlow.addColorStop(1, 'rgba(100, 20, 20, 0)');

            context.fillStyle = engineGlow;
            context.beginPath();
            context.arc(centerX, height - 12, 10, 0, Math.PI * 2);
            context.fill();

            // Add cockpit - small and angular
            context.fillStyle = 'rgba(150, 50, 50, 0.7)';
            context.beginPath();
            context.moveTo(centerX, centerY - 15);
            context.lineTo(centerX + 5, centerY - 10);
            context.lineTo(centerX, centerY - 5);
            context.lineTo(centerX - 5, centerY - 10);
            context.closePath();
            context.fill();

            // Add subtle panel lines
            context.strokeStyle = 'rgba(200, 50, 50, 0.3)';
            context.lineWidth = 0.5;

            // Center line
            context.beginPath();
            context.moveTo(centerX, 8);
            context.lineTo(centerX, centerY + 15);
            context.stroke();

            // Wing lines - angular for stealth design
            context.beginPath();
            context.moveTo(centerX - 10, centerY);
            context.lineTo(centerX - 15, height - 20);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 10, centerY);
            context.lineTo(centerX + 15, height - 20);
            context.stroke();

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0x772222);
            graphics.fillTriangle(30, 0, 60, 60, 0, 60);
            graphics.generateTexture(key, 60, 60);
            graphics.clear();
        }
    }

    createEnemyTurretSprite(key) {
        try {
            // Create a stationary defense turret
            const width = 50;
            const height = 50;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a metallic gradient for the turret base
            const baseGradient = context.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, 20
            );
            baseGradient.addColorStop(0, '#aa3333');
            baseGradient.addColorStop(1, '#771111');

            // Draw the turret base - circular
            context.fillStyle = baseGradient;
            context.beginPath();
            context.arc(centerX, centerY, 20, 0, Math.PI * 2);
            context.fill();

            // Add a metallic stroke to the base
            context.strokeStyle = '#cc4444';
            context.lineWidth = 1.5;
            context.stroke();

            // Add turret gun housing - dome on top
            context.fillStyle = '#991111';
            context.beginPath();
            context.arc(centerX, centerY, 12, Math.PI, 0, false);
            context.fill();

            // Add gun barrels
            context.fillStyle = '#550000';

            // Left barrel
            context.fillRect(centerX - 10, centerY - 15, 4, 15);

            // Right barrel
            context.fillRect(centerX + 6, centerY - 15, 4, 15);

            // Add barrel highlights
            context.strokeStyle = '#cc4444';
            context.lineWidth = 0.5;
            context.strokeRect(centerX - 10, centerY - 15, 4, 15);
            context.strokeRect(centerX + 6, centerY - 15, 4, 15);

            // Add sensor/targeting system
            context.fillStyle = '#ffaaaa';
            context.beginPath();
            context.arc(centerX, centerY - 5, 3, 0, Math.PI * 2);
            context.fill();

            // Add sensor glow
            const sensorGlow = context.createRadialGradient(
                centerX, centerY - 5, 0,
                centerX, centerY - 5, 6
            );
            sensorGlow.addColorStop(0, 'rgba(255, 100, 100, 0.7)');
            sensorGlow.addColorStop(1, 'rgba(255, 50, 50, 0)');

            context.fillStyle = sensorGlow;
            context.beginPath();
            context.arc(centerX, centerY - 5, 6, 0, Math.PI * 2);
            context.fill();

            // Add panel details to base
            context.strokeStyle = '#ff6666';
            context.lineWidth = 0.5;

            // Circular panel lines
            context.beginPath();
            context.arc(centerX, centerY, 15, 0, Math.PI * 2);
            context.stroke();

            context.beginPath();
            context.arc(centerX, centerY, 10, 0, Math.PI * 2);
            context.stroke();

            // Add some small lights around the base
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * 18;
                const y = centerY + Math.sin(angle) * 18;

                context.fillStyle = i % 2 === 0 ? '#ff6666' : '#ffaaaa';
                context.beginPath();
                context.arc(x, y, 1, 0, Math.PI * 2);
                context.fill();
            }

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff3333);
            graphics.fillCircle(25, 25, 20);
            graphics.generateTexture(key, 50, 50);
            graphics.clear();
        }
    }

    createEnemyCarrierSprite(key) {
        try {
            // Create a large carrier ship that spawns drones
            const width = 96;
            const height = 96;

            // Create a canvas for the sprite
            const texture = this.textures.createCanvas(key, width, height);
            const context = texture.getContext();

            // Clear the canvas
            context.clearRect(0, 0, width, height);

            // Center coordinates
            const centerX = width / 2;
            const centerY = height / 2;

            // Create a metallic dark red gradient for the ship body
            const bodyGradient = context.createLinearGradient(0, 0, width, 0);
            bodyGradient.addColorStop(0, '#661111');   // Very dark red on left
            bodyGradient.addColorStop(0.5, '#992222'); // Dark red in center
            bodyGradient.addColorStop(1, '#661111');   // Very dark red on right

            // Draw the main body of the carrier - large, rectangular shape
            context.fillStyle = bodyGradient;
            context.beginPath();
            context.moveTo(centerX - 35, 15);          // Top left
            context.lineTo(centerX + 35, 15);          // Top right
            context.lineTo(centerX + 40, height - 25); // Bottom right
            context.lineTo(centerX - 40, height - 25); // Bottom left
            context.closePath();
            context.fill();

            // Add a metallic stroke to the body
            context.strokeStyle = '#bb3333';
            context.lineWidth = 2;
            context.stroke();

            // Add flight deck (center strip)
            context.fillStyle = '#440000';
            context.beginPath();
            context.rect(centerX - 15, 20, 30, height - 45);
            context.fill();
            context.strokeStyle = '#aa2222';
            context.lineWidth = 1;
            context.stroke();

            // Add launch bays (slots in the flight deck)
            context.fillStyle = '#220000';

            // Top launch bay
            context.beginPath();
            context.rect(centerX - 10, 30, 20, 15);
            context.fill();

            // Middle launch bay
            context.beginPath();
            context.rect(centerX - 10, centerY - 7, 20, 15);
            context.fill();

            // Bottom launch bay
            context.beginPath();
            context.rect(centerX - 10, height - 45, 20, 15);
            context.fill();

            // Add side structures (hangar bays)
            context.fillStyle = '#550000';

            // Left hangar structure
            context.beginPath();
            context.rect(centerX - 35, 25, 15, height - 60);
            context.fill();
            context.strokeStyle = '#882222';
            context.lineWidth = 0.5;
            context.stroke();

            // Right hangar structure
            context.beginPath();
            context.rect(centerX + 20, 25, 15, height - 60);
            context.fill();
            context.strokeStyle = '#882222';
            context.lineWidth = 0.5;
            context.stroke();

            // Add engine glow
            const engineGlow = context.createRadialGradient(
                centerX, height - 25, 0,
                centerX, height - 25, 20
            );
            engineGlow.addColorStop(0, 'rgba(255, 150, 50, 0.8)');
            engineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = engineGlow;
            context.beginPath();
            context.arc(centerX, height - 25, 20, 0, Math.PI * 2);
            context.fill();

            // Add smaller engine glows on sides
            const leftEngineGlow = context.createRadialGradient(
                centerX - 25, height - 25, 0,
                centerX - 25, height - 25, 10
            );
            leftEngineGlow.addColorStop(0, 'rgba(255, 150, 50, 0.6)');
            leftEngineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = leftEngineGlow;
            context.beginPath();
            context.arc(centerX - 25, height - 25, 10, 0, Math.PI * 2);
            context.fill();

            const rightEngineGlow = context.createRadialGradient(
                centerX + 25, height - 25, 0,
                centerX + 25, height - 25, 10
            );
            rightEngineGlow.addColorStop(0, 'rgba(255, 150, 50, 0.6)');
            rightEngineGlow.addColorStop(1, 'rgba(255, 100, 50, 0)');

            context.fillStyle = rightEngineGlow;
            context.beginPath();
            context.arc(centerX + 25, height - 25, 10, 0, Math.PI * 2);
            context.fill();

            // Add command bridge
            context.fillStyle = '#aa3333';
            context.beginPath();
            context.rect(centerX - 20, 5, 40, 15);
            context.fill();
            context.strokeStyle = '#cc4444';
            context.lineWidth = 1;
            context.stroke();

            // Add bridge windows
            context.fillStyle = '#ffcccc';
            for (let i = 0; i < 5; i++) {
                context.beginPath();
                context.rect(centerX - 15 + i * 7, 8, 5, 3);
                context.fill();
            }

            // Add antenna/communications array
            context.strokeStyle = '#dd5555';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(centerX, 5);
            context.lineTo(centerX, -5);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX - 10, 0);
            context.lineTo(centerX, -5);
            context.lineTo(centerX + 10, 0);
            context.stroke();

            // Add panel lines and details
            context.strokeStyle = '#aa3333';
            context.lineWidth = 0.5;

            // Horizontal deck lines
            for (let i = 1; i < 5; i++) {
                const y = 15 + i * (height - 40) / 5;
                context.beginPath();
                context.moveTo(centerX - 35, y);
                context.lineTo(centerX + 35, y);
                context.stroke();
            }

            // Vertical structure lines
            context.beginPath();
            context.moveTo(centerX - 15, 15);
            context.lineTo(centerX - 15, height - 25);
            context.stroke();

            context.beginPath();
            context.moveTo(centerX + 15, 15);
            context.lineTo(centerX + 15, height - 25);
            context.stroke();

            // Add some small lights/details
            context.fillStyle = '#ff6666';
            for (let i = 0; i < 6; i++) {
                const x = centerX - 30 + i * 12;
                context.beginPath();
                context.arc(x, height - 30, 1, 0, Math.PI * 2);
                context.fill();
            }

            // Add a subtle glow around the ship
            const shipGlow = context.createRadialGradient(
                centerX, centerY, 40,
                centerX, centerY, 60
            );
            shipGlow.addColorStop(0, 'rgba(255, 50, 50, 0.1)');
            shipGlow.addColorStop(1, 'rgba(255, 50, 50, 0)');

            context.fillStyle = shipGlow;
            context.beginPath();
            context.arc(centerX, centerY, 60, 0, Math.PI * 2);
            context.fill();

            // Update the texture
            texture.refresh();

            console.log(`Created enhanced ${key} sprite`);
        } catch (error) {
            console.warn(`Failed to create ${key} sprite:`, error);

            // Fallback to simple shape
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff3333);
            graphics.fillRect(24, 24, 48, 48);
            graphics.generateTexture(key, 96, 96);
            graphics.clear();
        }
    }
}