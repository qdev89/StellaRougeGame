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
        console.log('LoadingScene: All assets loaded successfully or with fallbacks');

        // Create placeholder textures for any missing assets
        this.createPlaceholderTextures();

        // Initialize animations
        this.createAnimations();

        // Add a slight delay before transitioning to the main menu
        this.time.delayedCall(1000, () => {
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });
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
        // Set baseURL for all assets
        this.load.setPath('src/assets/');

        // Load our placeholder image first
        this.load.image('placeholder', 'images/placeholder.png');

        // Try to load placeholder images for essential UI elements
        this.load.setPath('src/assets/images');

        // Try to load images, but don't worry if they fail - we'll create placeholders
        try {
            this.load.image('button', 'button.png');
            this.load.image('button-hover', 'button-hover.png');
            this.load.image('bg-stars', 'bg-stars.png');
            this.load.image('bg-nebula', 'bg-nebula.png');
            this.load.image('bg-planets', 'bg-planets.png');
            this.load.image('player-ship', 'player-ship.png');
            this.load.image('enemy-drone', 'enemy-drone.png');
            this.load.image('enemy-gunship', 'enemy-gunship.png');
            this.load.image('enemy-destroyer', 'enemy-destroyer.png');
            this.load.image('asteroid', 'asteroid.png');
            // New enemy types will use existing assets with different tints and behaviors
            this.load.image('laser-blue', 'laser-blue.png');
            this.load.image('laser-red', 'laser-red.png');
            this.load.image('plasma-bolt', 'plasma-bolt.png');
            this.load.image('missile', 'missile.png');
            this.load.image('explosion', 'explosion.png');
            this.load.image('powerup-health', 'powerup-health.png');
            this.load.image('powerup-shield', 'powerup-shield.png');
            this.load.image('powerup-weapon', 'powerup-weapon.png');
            this.load.image('powerup-score', 'powerup-score.png');
            this.load.image('powerup-flash', 'powerup-flash.png');
            this.load.image('particle-blue', 'particle-blue.png');
            this.load.image('star-particle', 'star-particle.png');
            this.load.image('bg-dust', 'bg-dust.png');
            this.load.image('player-ship-engines', 'player-ship-engines.png');
        } catch (e) {
            console.warn('Error loading images:', e);
        }

        // Audio loading is disabled for this phase
        console.log('Audio loading skipped - sound disabled for this phase');
    }

    createPlaceholderTextures() {
        // Check each required texture and create a placeholder if missing
        const requiredTextures = [
            'button', 'button-hover', 'bg-stars', 'bg-nebula', 'bg-planets', 'player-ship',
            'enemy-drone', 'enemy-gunship', 'enemy-destroyer', 'laser-blue', 'laser-red',
            'plasma-bolt', 'missile', 'powerup-health', 'powerup-shield',
            'powerup-weapon', 'powerup-score', 'powerup-flash', 'particle-blue',
            'star-particle', 'bg-dust', 'asteroid'
            // New enemy types will use existing assets with different tints
        ];

        requiredTextures.forEach(key => {
            if (!this.textures.exists(key)) {
                this.createPlaceholderTexture(key);
            }
        });

        // Create spritesheets for animations if missing
        if (!this.textures.exists('explosion')) {
            this.createExplosionSpritesheet();
        }

        if (!this.textures.exists('player-ship-engines')) {
            this.createEnginesSpritesheet();
        }

        console.log('Created placeholder textures for missing assets');
    }

    createPlaceholderTexture(key) {
        // If we have the placeholder texture, use it
        if (this.textures.exists('placeholder')) {
            // Clone the placeholder texture with the new key
            this.textures.addImage(key, this.textures.get('placeholder').getSourceImage());
            console.log(`Created placeholder for: ${key}`);
            return;
        }

        // Fallback to creating a graphic if placeholder doesn't exist
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
            // Star background
            graphics.fillStyle(0x000022);
            graphics.fillRect(0, 0, width, height);

            // Add stars
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 2 + 1;

                graphics.fillStyle(0xffffff);
                graphics.fillCircle(x, y, size);
            }
        } else if (key === 'bg-nebula') {
            // Nebula background
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, width, height);

            // Add nebula clouds
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 100 + 50;

                graphics.fillStyle(0x3333ff, 0.1);
                graphics.fillCircle(x, y, size);
            }
        } else if (key === 'bg-dust' || key === 'bg-planets') {
            // Dust particles or planets
            graphics.fillStyle(0x000000, 0);
            graphics.fillRect(0, 0, width, height);

            // Add dust/planets
            const count = key === 'bg-dust' ? 30 : 3;
            const maxSize = key === 'bg-dust' ? 5 : 40;

            for (let i = 0; i < count; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * maxSize + 2;

                graphics.fillStyle(key === 'bg-dust' ? 0xffffff : 0xffaa33, 0.5);
                graphics.fillCircle(x, y, size);
            }
        } else {
            // Default background
            graphics.fillStyle(0x000011);
            graphics.fillRect(0, 0, width, height);
        }

        // Generate texture
        graphics.generateTexture(key, width, height);
        graphics.clear();

        console.log(`Created background placeholder for: ${key}`);
    }

    createExplosionSpritesheet() {
        // Create a simple explosion animation spritesheet
        const frames = 10;
        const size = 64;

        // Create a canvas for the spritesheet
        const texture = this.textures.createCanvas('explosion', size * frames, size);
        const context = texture.getContext();

        // Draw frames
        for (let i = 0; i < frames; i++) {
            const x = i * size;
            const radius = (size / 2) * (1 - i / frames);

            // Draw explosion circle that gets smaller with each frame
            context.fillStyle = `rgb(255, ${255 - (255 * i / frames)}, 0)`;
            context.beginPath();
            context.arc(x + size/2, size/2, radius, 0, Math.PI * 2);
            context.fill();

            // Add some particles
            for (let j = 0; j < 5; j++) {
                const particleSize = Math.random() * 5 + 2;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * radius;

                const particleX = x + size/2 + Math.cos(angle) * distance;
                const particleY = size/2 + Math.sin(angle) * distance;

                context.fillStyle = 'rgb(255, 255, 100)';
                context.beginPath();
                context.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                context.fill();
            }
        }

        // Update the texture
        texture.refresh();

        // Add frame data for the animation
        for (let i = 0; i < frames; i++) {
            // Register each frame with the texture manager
            this.textures.get('explosion').add(i, 0, i * size, 0, size, size);
        }

        console.log('Created explosion spritesheet with frame data');
    }

    createEnginesSpritesheet() {
        // Create a simple engine animation spritesheet
        const frames = 4;
        const size = 32;

        // Create a canvas for the spritesheet
        const texture = this.textures.createCanvas('player-ship-engines', size * frames, size);
        const context = texture.getContext();

        // Draw frames
        for (let i = 0; i < frames; i++) {
            const x = i * size;
            const frameIntensity = 0.5 + Math.sin((i / frames) * Math.PI) * 0.5; // Pulsing effect

            // Engine color
            const r = Math.floor(255 * frameIntensity);
            const g = Math.floor(100 + 100 * frameIntensity);
            const b = 0;

            // Main engine flame
            context.fillStyle = `rgb(${r}, ${g}, ${b})`;

            // Different flame shapes for each frame
            const flameHeight = 15 + 10 * frameIntensity;

            // Base rectangle
            context.fillRect(x + 8, 0, 16, 20);

            // Flame shape - triangle
            context.beginPath();
            context.moveTo(x + 8, 20);
            context.lineTo(x + 16, 20 + flameHeight);
            context.lineTo(x + 24, 20);
            context.fill();

            // Inner flame - brighter
            context.fillStyle = 'rgb(255, 255, 200)';
            context.beginPath();
            context.moveTo(x + 12, 10);
            context.lineTo(x + 16, 10 + flameHeight * 0.7);
            context.lineTo(x + 20, 10);
            context.fill();
        }

        // Update the texture
        texture.refresh();

        // Add animation frames info
        this.textures.get('player-ship-engines').add('engine-thrust-0', 0, 0, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-1', 0, 32, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-2', 0, 64, 0, 32, 32);
        this.textures.get('player-ship-engines').add('engine-thrust-3', 0, 96, 0, 32, 32);

        console.log('Created engine thrust spritesheet');
    }

    createAnimations() {
        // Create explosion animation
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
                        { key: 'explosion', frame: 9 }
                    ],
                    frameRate: 15,
                    repeat: 0
                });
                console.log('Created explosion animation');
            }
        }

        // Create engine thrust animation
        if (this.textures.exists('player-ship-engines')) {
            if (!this.anims.exists('engine-thrust')) {
                this.anims.create({
                    key: 'engine-thrust',
                    frames: [
                        { key: 'player-ship-engines', frame: 'engine-thrust-0' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-1' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-2' },
                        { key: 'player-ship-engines', frame: 'engine-thrust-3' }
                    ],
                    frameRate: 12,
                    repeat: -1
                });
                console.log('Created engine thrust animation');
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
        try {
            this.cache.audio.exists(key) || this.load.audio(key, file);
        } catch (e) {
            console.warn(`Failed to load audio: ${key}. Will be silent.`);
        }
    }
}