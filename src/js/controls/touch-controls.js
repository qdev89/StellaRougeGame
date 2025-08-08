/**
 * Touch Controls
 * Provides touch-based controls for mobile devices
 */
class TouchControls {
    /**
     * Create touch controls
     * @param {Phaser.Scene} scene - The scene to add controls to
     * @param {Object} options - Configuration options
     */
    constructor(scene, options = {}) {
        this.scene = scene;

        // Default options
        this.options = Object.assign({
            joystickSide: 'left',          // Which side to place the joystick on
            buttonSide: 'right',           // Which side to place action buttons on
            buttonSize: 60,                // Base size of action buttons
            buttonSpacing: 20,             // Space between buttons
            buttonMargin: 20,              // Margin from screen edge
            buttonColors: {                // Colors for different buttons
                fire: 0xff3333,
                special: 0x33ccff,
                dash: 0x33ff33,
                weapon: 0xffcc33
            },
            showLabels: false,             // Whether to show text labels on buttons
            vibrateOnPress: true,          // Whether to vibrate on button press
            showJoystick: true,            // Whether to show the virtual joystick
            showButtons: true,             // Whether to show the action buttons
            fadeWhenInactive: true,        // Whether controls fade when inactive
            inactiveAlpha: 0.5,            // Alpha value when inactive
            activeAlpha: 0.8,              // Alpha value when active
            joystickOptions: {}            // Additional options for the joystick
        }, options);

        // Get device and responsive UI if available
        this.deviceDetector = scene.game.deviceDetector || (typeof DeviceDetector !== 'undefined' ? new DeviceDetector() : null);
        this.responsiveUI = scene.responsiveUI || (typeof ResponsiveUI !== 'undefined' ? new ResponsiveUI(scene) : null);

        // Only create touch controls if on a touch device or if forced
        this.enabled = (this.deviceDetector && this.deviceDetector.hasTouch) || options.force;

        if (this.enabled) {
            // Create container for all touch controls
            this.container = this.scene.add.container(0, 0);
            this.container.setDepth(1000);

            // Create controls
            this.createControls();

            // Set up event listeners
            this.setupEventListeners();

            console.log('Touch controls initialized');
        } else {
            console.log('Touch controls not created - device does not support touch');
        }
    }

    /**
     * Create all touch controls
     */
    createControls() {
        // Create virtual joystick if enabled
        if (this.options.showJoystick) {
            this.createJoystick();
        }

        // Create action buttons if enabled
        if (this.options.showButtons) {
            this.createActionButtons();
        }
    }

    /**
     * Create the virtual joystick
     */
    createJoystick() {
        // Determine joystick position based on options
        let joystickX, joystickY;

        if (this.responsiveUI) {
            // Use responsive positioning
            const margin = this.responsiveUI.scaleValue(80);
            const bottomMargin = this.responsiveUI.scaleValue(100);

            joystickX = this.options.joystickSide === 'left' ? margin : this.scene.cameras.main.width - margin;
            joystickY = this.scene.cameras.main.height - bottomMargin;
        } else {
            // Fallback positioning
            const margin = 80;
            const bottomMargin = 100;

            joystickX = this.options.joystickSide === 'left' ? margin : this.scene.cameras.main.width - margin;
            joystickY = this.scene.cameras.main.height - bottomMargin;
        }

        // Create joystick with custom options
        const joystickOptions = {
            x: joystickX,
            y: joystickY,
            fixed: true,
            hideOnRelease: this.options.fadeWhenInactive,
            alpha: this.options.activeAlpha,
            ...this.options.joystickOptions
        };

        // Create the joystick
        this.joystick = new VirtualJoystick(this.scene, joystickOptions);
    }

    /**
     * Create action buttons (fire, special, dash, weapon switch)
     */
    createActionButtons() {
        // Button definitions
        this.buttonDefs = [
            {
                id: 'fire',
                icon: '🔥',
                label: 'FIRE',
                color: this.options.buttonColors.fire,
                action: () => this.handleButtonPress('fire')
            },
            {
                id: 'special',
                icon: '⚡',
                label: 'SPECIAL',
                color: this.options.buttonColors.special,
                action: () => this.handleButtonPress('special')
            },
            {
                id: 'dash',
                icon: '💨',
                label: 'DASH',
                color: this.options.buttonColors.dash,
                action: () => this.handleButtonPress('dash')
            },
            {
                id: 'weapon',
                icon: '🔄',
                label: 'WEAPON',
                color: this.options.buttonColors.weapon,
                action: () => this.handleButtonPress('weapon')
            }
        ];

        // Calculate button positions
        this.buttons = {};
        this.buttonContainer = this.scene.add.container(0, 0);
        this.container.add(this.buttonContainer);

        // Determine base position based on options
        let baseX, baseY, buttonSize, spacing;

        if (this.responsiveUI) {
            // Use responsive sizing
            buttonSize = this.responsiveUI.scaleValue(this.options.buttonSize);
            spacing = this.responsiveUI.scaleValue(this.options.buttonSpacing);
            const margin = this.responsiveUI.scaleValue(this.options.buttonMargin);
            const bottomMargin = this.responsiveUI.scaleValue(this.options.buttonMargin + 20);

            baseX = this.options.buttonSide === 'right'
                ? this.scene.cameras.main.width - margin - buttonSize/2
                : margin + buttonSize/2;

            baseY = this.scene.cameras.main.height - bottomMargin - buttonSize/2;
        } else {
            // Fallback sizing
            buttonSize = this.options.buttonSize;
            spacing = this.options.buttonSpacing;
            const margin = this.options.buttonMargin;
            const bottomMargin = this.options.buttonMargin + 20;

            baseX = this.options.buttonSide === 'right'
                ? this.scene.cameras.main.width - margin - buttonSize/2
                : margin + buttonSize/2;

            baseY = this.scene.cameras.main.height - bottomMargin - buttonSize/2;
        }

        // Create buttons in a grid layout
        this.buttonDefs.forEach((def, index) => {
            // Calculate position (2x2 grid)
            const col = index % 2;
            const row = Math.floor(index / 2);

            const x = baseX - (col * (buttonSize + spacing)) * (this.options.buttonSide === 'right' ? 1 : -1);
            const y = baseY - (row * (buttonSize + spacing));

            // Create button
            this.createActionButton(def, x, y, buttonSize);
        });
    }

    /**
     * Create a single action button
     * @param {Object} def - Button definition
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Button size
     */
    createActionButton(def, x, y, size) {
        // Create button circle
        const button = this.scene.add.circle(x, y, size/2, def.color, 0.8);
        button.setStrokeStyle(2, 0xffffff, 0.5);
        this.buttonContainer.add(button);

        // Create icon or label
        let text;
        if (this.options.showLabels) {
            text = this.scene.add.text(x, y, def.label, {
                fontFamily: 'monospace',
                fontSize: size * 0.25,
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        } else {
            text = this.scene.add.text(x, y, def.icon, {
                fontSize: size * 0.5,
                align: 'center'
            }).setOrigin(0.5);
        }
        this.buttonContainer.add(text);

        // Make button interactive
        button.setInteractive({ useHandCursor: true });

        // Add hover/press effects
        button.on('pointerover', () => {
            button.setFillStyle(def.color, 1);
        });

        button.on('pointerout', () => {
            button.setFillStyle(def.color, 0.8);

            // Reset button state
            if (this.buttons[def.id]) {
                this.buttons[def.id].pressed = false;
            }
        });

        button.on('pointerdown', () => {
            // Visual feedback
            button.setFillStyle(Phaser.Display.Color.ValueToColor(def.color).darken(20).color, 1);
            this.scene.tweens.add({
                targets: [button, text],
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 50
            });

            // Set button state
            if (this.buttons[def.id]) {
                this.buttons[def.id].pressed = true;
            }

            // Vibration feedback if enabled
            if (this.options.vibrateOnPress && navigator.vibrate) {
                navigator.vibrate(20);
            }

            // Call action
            def.action();
        });

        button.on('pointerup', () => {
            // Reset visual state
            button.setFillStyle(def.color, 0.8);
            this.scene.tweens.add({
                targets: [button, text],
                scaleX: 1,
                scaleY: 1,
                duration: 50
            });

            // Reset button state
            if (this.buttons[def.id]) {
                this.buttons[def.id].pressed = false;
            }
        });

        // Store button reference
        this.buttons[def.id] = {
            graphic: button,
            text: text,
            pressed: false,
            justPressed: false,
            justReleased: false
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for resize events
        if (this.responsiveUI) {
            this.scene.events.on('ui-scale-changed', this.handleResize, this);
        } else if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.handleResize());
        }

        // Listen for scene events
        this.scene.events.on('update', this.update, this);
        this.scene.events.on('shutdown', this.destroy, this);
    }

    /**
     * Handle resize events
     */
    handleResize() {
        try {
            // Safely destroy existing controls
            this.destroy(false);

            // Create new controls with updated dimensions
            this.createControls();
        } catch (error) {
            console.error('Error during touch controls resize:', error);

            // Attempt recovery by recreating controls on next frame
            this.scene.time.delayedCall(100, () => {
                try {
                    this.destroy(false);
                    this.createControls();
                } catch (retryError) {
                    console.error('Failed to recover touch controls:', retryError);
                }
            });
        }
    }

    /**
     * Handle button press
     * @param {string} buttonId - ID of the button pressed
     */
    handleButtonPress(buttonId) {
        // Set button as just pressed
        if (this.buttons[buttonId]) {
            this.buttons[buttonId].justPressed = true;
        }

        // Emit event
        this.scene.events.emit('touch-button-press', buttonId);
    }

    /**
     * Update method called every frame
     */
    update() {
        // Reset justPressed and justReleased flags
        Object.keys(this.buttons).forEach(id => {
            const button = this.buttons[id];
            button.justPressed = false;
            button.justReleased = false;
        });
    }

    /**
     * Check if a button is currently pressed
     * @param {string} buttonId - ID of the button to check
     * @returns {boolean} True if button is pressed
     */
    isButtonPressed(buttonId) {
        return this.buttons[buttonId] ? this.buttons[buttonId].pressed : false;
    }

    /**
     * Check if a button was just pressed this frame
     * @param {string} buttonId - ID of the button to check
     * @returns {boolean} True if button was just pressed
     */
    isButtonJustPressed(buttonId) {
        return this.buttons[buttonId] ? this.buttons[buttonId].justPressed : false;
    }

    /**
     * Get joystick values
     * @returns {Object|null} Joystick values or null if not enabled
     */
    getJoystickValues() {
        return this.joystick ? this.joystick.getValue() : null;
    }

    /**
     * Show all touch controls
     */
    show() {
        if (this.joystick) {
            this.joystick.show();
        }

        if (this.buttonContainer) {
            this.scene.tweens.add({
                targets: this.buttonContainer,
                alpha: this.options.activeAlpha,
                duration: 200
            });
        }
    }

    /**
     * Hide all touch controls
     */
    hide() {
        if (this.joystick) {
            this.joystick.hide();
        }

        if (this.buttonContainer) {
            this.scene.tweens.add({
                targets: this.buttonContainer,
                alpha: 0,
                duration: 200
            });
        }
    }

    /**
     * Set controls to inactive state (faded)
     */
    setInactive() {
        if (this.options.fadeWhenInactive) {
            if (this.buttonContainer) {
                this.scene.tweens.add({
                    targets: this.buttonContainer,
                    alpha: this.options.inactiveAlpha,
                    duration: 200
                });
            }
        }
    }

    /**
     * Set controls to active state (full opacity)
     */
    setActive() {
        if (this.buttonContainer) {
            this.scene.tweens.add({
                targets: this.buttonContainer,
                alpha: this.options.activeAlpha,
                duration: 200
            });
        }
    }

    /**
     * Destroy touch controls
     * @param {boolean} removeListeners - Whether to remove event listeners
     */
    destroy(removeListeners = true) {
        // Destroy joystick
        if (this.joystick) {
            this.joystick.destroy();
            this.joystick = null;
        }

        // Destroy button container
        if (this.buttonContainer) {
            this.buttonContainer.destroy();
            this.buttonContainer = null;
            this.buttons = {};
        }

        // Remove event listeners
        if (removeListeners) {
            if (this.responsiveUI) {
                this.scene.events.off('ui-scale-changed', this.handleResize, this);
            }

            this.scene.events.off('update', this.update, this);
            this.scene.events.off('shutdown', this.destroy, this);
        }
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.TouchControls = TouchControls;
}
