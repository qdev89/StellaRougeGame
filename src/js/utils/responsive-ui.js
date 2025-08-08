/**
 * Responsive UI
 * Handles UI scaling and positioning for different screen sizes
 */
class ResponsiveUI {
    /**
     * Initialize the responsive UI system
     * @param {Phaser.Scene} scene - The scene to attach to
     */
    constructor(scene) {
        this.scene = scene;
        this.deviceDetector = scene.game.deviceDetector || new DeviceDetector();
        this.baseWidth = 640;
        this.baseHeight = 800;
        this.minScale = 0.5;
        this.maxScale = 1.5;
        
        // Initialize UI scale
        this.updateUIScale();
        
        // Listen for resize events
        window.addEventListener('game-resize', () => this.updateUIScale());
    }
    
    /**
     * Update the UI scale based on current screen size
     */
    updateUIScale() {
        // Calculate scale based on screen dimensions
        const widthScale = this.deviceDetector.screenWidth / this.baseWidth;
        const heightScale = this.deviceDetector.screenHeight / this.baseHeight;
        
        // Use the smaller scale to ensure everything fits
        this.scale = Math.min(widthScale, heightScale);
        
        // Clamp scale between min and max
        this.scale = Math.max(this.minScale, Math.min(this.scale, this.maxScale));
        
        // Calculate margins for centering
        this.marginX = (this.deviceDetector.screenWidth - (this.baseWidth * this.scale)) / 2;
        this.marginY = (this.deviceDetector.screenHeight - (this.baseHeight * this.scale)) / 2;
        
        console.log(`UI Scale updated: ${this.scale.toFixed(2)}, Margins: ${this.marginX.toFixed(0)}x${this.marginY.toFixed(0)}`);
        
        // Dispatch event for UI components to update
        this.scene.events.emit('ui-scale-changed', {
            scale: this.scale,
            marginX: this.marginX,
            marginY: this.marginY
        });
    }
    
    /**
     * Scale a value based on the current UI scale
     * @param {number} value - The value to scale
     * @returns {number} The scaled value
     */
    scaleValue(value) {
        return value * this.scale;
    }
    
    /**
     * Get the scaled position for an element
     * @param {number} x - The base x position (0-640)
     * @param {number} y - The base y position (0-800)
     * @returns {Object} The scaled position {x, y}
     */
    getScaledPosition(x, y) {
        return {
            x: this.marginX + (x * this.scale),
            y: this.marginY + (y * this.scale)
        };
    }
    
    /**
     * Scale a UI element to match the current UI scale
     * @param {Phaser.GameObjects.GameObject} element - The element to scale
     * @param {number} baseScale - The base scale of the element (default: 1)
     */
    scaleElement(element, baseScale = 1) {
        element.setScale(baseScale * this.scale);
    }
    
    /**
     * Position a UI element using the base coordinate system
     * @param {Phaser.GameObjects.GameObject} element - The element to position
     * @param {number} x - The base x position (0-640)
     * @param {number} y - The base y position (0-800)
     */
    positionElement(element, x, y) {
        const pos = this.getScaledPosition(x, y);
        element.setPosition(pos.x, pos.y);
    }
    
    /**
     * Create a responsive container that automatically scales its children
     * @param {number} x - The base x position
     * @param {number} y - The base y position
     * @returns {Phaser.GameObjects.Container} The responsive container
     */
    createResponsiveContainer(x, y) {
        const container = this.scene.add.container(0, 0);
        
        // Position the container
        this.positionElement(container, x, y);
        
        // Scale the container
        this.scaleElement(container);
        
        // Update container on scale changes
        this.scene.events.on('ui-scale-changed', (data) => {
            const pos = this.getScaledPosition(x, y);
            container.setPosition(pos.x, pos.y);
            container.setScale(data.scale);
        });
        
        return container;
    }
    
    /**
     * Get the appropriate font size for the current scale
     * @param {number} baseSize - The base font size
     * @returns {string} The scaled font size as a string (e.g., '16px')
     */
    getFontSize(baseSize) {
        const scaledSize = Math.round(baseSize * this.scale);
        return `${scaledSize}px`;
    }
    
    /**
     * Create a responsive text element
     * @param {number} x - The base x position
     * @param {number} y - The base y position
     * @param {string} text - The text content
     * @param {Object} style - The text style object
     * @returns {Phaser.GameObjects.Text} The text element
     */
    createText(x, y, text, style) {
        // Create a copy of the style object
        const scaledStyle = { ...style };
        
        // Scale the font size if specified
        if (style.fontSize) {
            // Extract the numeric part of the font size
            const baseFontSize = parseInt(style.fontSize);
            scaledStyle.fontSize = this.getFontSize(baseFontSize);
        }
        
        // Create the text element
        const textElement = this.scene.add.text(0, 0, text, scaledStyle);
        
        // Position the text
        this.positionElement(textElement, x, y);
        
        // Update text on scale changes
        this.scene.events.on('ui-scale-changed', () => {
            // Update font size
            if (style.fontSize) {
                const baseFontSize = parseInt(style.fontSize);
                textElement.setFontSize(this.getFontSize(baseFontSize));
            }
            
            // Update position
            const pos = this.getScaledPosition(x, y);
            textElement.setPosition(pos.x, pos.y);
        });
        
        return textElement;
    }
    
    /**
     * Adjust the game's camera and bounds for the current screen size
     */
    adjustCameraBounds() {
        // Calculate the game area dimensions
        const gameWidth = this.baseWidth * this.scale;
        const gameHeight = this.baseHeight * this.scale;
        
        // Set the camera bounds
        this.scene.cameras.main.setViewport(
            this.marginX,
            this.marginY,
            gameWidth,
            gameHeight
        );
        
        // Update the physics world bounds if physics is active
        if (this.scene.physics && this.scene.physics.world) {
            this.scene.physics.world.setBounds(0, 0, this.baseWidth, this.baseHeight);
        }
    }
    
    /**
     * Get the touch-friendly button size based on device
     * @returns {number} Recommended button size in pixels
     */
    getTouchButtonSize() {
        // Minimum recommended touch target size is 44px (Apple's guideline)
        const minSize = 44;
        
        // Scale based on device
        if (this.deviceDetector.isMobile) {
            // For mobile, use larger buttons
            return Math.max(minSize, 60 * this.scale);
        }
        
        // For desktop with touch, use medium buttons
        if (this.deviceDetector.hasTouch) {
            return Math.max(minSize, 50 * this.scale);
        }
        
        // For desktop without touch, use standard buttons
        return Math.max(minSize, 40 * this.scale);
    }
    
    /**
     * Create a responsive button with appropriate sizing for touch
     * @param {number} x - The base x position
     * @param {number} y - The base y position
     * @param {string} text - The button text
     * @param {Function} callback - The click/tap callback
     * @param {Object} style - Additional style options
     * @returns {Object} The button object with background and text
     */
    createButton(x, y, text, callback, style = {}) {
        // Determine button size
        const buttonWidth = style.width || 200;
        const buttonHeight = style.height || 50;
        const scaledWidth = this.scaleValue(buttonWidth);
        const scaledHeight = this.scaleValue(buttonHeight);
        
        // Create container
        const container = this.scene.add.container(0, 0);
        
        // Create button background
        const bg = this.scene.add.rectangle(0, 0, scaledWidth, scaledHeight, 
            style.backgroundColor || 0x3366cc, 
            style.backgroundAlpha || 0.8
        );
        
        // Add border
        bg.setStrokeStyle(
            this.scaleValue(style.borderWidth || 2), 
            style.borderColor || 0x66aaff
        );
        
        // Add to container
        container.add(bg);
        
        // Create text with scaled font size
        const fontSize = style.fontSize || 18;
        const buttonText = this.scene.add.text(0, 0, text, {
            fontFamily: style.fontFamily || 'monospace',
            fontSize: this.getFontSize(fontSize),
            color: style.textColor || '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add to container
        container.add(buttonText);
        
        // Position the container
        this.positionElement(container, x, y);
        
        // Make interactive with larger hit area for touch
        bg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                if (!this.deviceDetector.isMobile) {
                    bg.setFillStyle(style.hoverColor || 0x4477dd);
                }
            })
            .on('pointerout', () => {
                bg.setFillStyle(style.backgroundColor || 0x3366cc);
            })
            .on('pointerdown', () => {
                bg.setFillStyle(style.pressColor || 0x2255aa);
                container.y += this.scaleValue(2); // Press effect
            })
            .on('pointerup', () => {
                bg.setFillStyle(style.backgroundColor || 0x3366cc);
                container.y -= this.scaleValue(2); // Release effect
                callback();
            });
        
        // Update on scale changes
        this.scene.events.on('ui-scale-changed', () => {
            // Update position
            const pos = this.getScaledPosition(x, y);
            container.setPosition(pos.x, pos.y);
            
            // Update sizes
            const newWidth = this.scaleValue(buttonWidth);
            const newHeight = this.scaleValue(buttonHeight);
            bg.width = newWidth;
            bg.height = newHeight;
            bg.setStrokeStyle(this.scaleValue(style.borderWidth || 2), style.borderColor || 0x66aaff);
            
            // Update text
            buttonText.setFontSize(this.getFontSize(fontSize));
        });
        
        return {
            container,
            background: bg,
            text: buttonText,
            setVisible: (visible) => container.setVisible(visible),
            destroy: () => container.destroy()
        };
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.ResponsiveUI = ResponsiveUI;
}
