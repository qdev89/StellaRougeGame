/**
 * Virtual Joystick
 * Touch-based joystick control for mobile devices
 */
class VirtualJoystick {
    /**
     * Create a new virtual joystick
     * @param {Phaser.Scene} scene - The scene to add the joystick to
     * @param {Object} options - Configuration options
     */
    constructor(scene, options = {}) {
        this.scene = scene;

        // Default options
        this.options = Object.assign({
            x: 100,                    // Base x position
            y: 700,                    // Base y position
            size: 80,                  // Base joystick size
            threshold: 10,             // Minimum distance to register movement
            maxDistance: 40,           // Maximum stick distance from center
            alpha: 0.7,                // Opacity of joystick
            color: 0x3366cc,           // Color of joystick
            fixed: true,               // Whether joystick position is fixed or dynamic
            follow: false,             // Whether joystick follows the pointer when dragging
            followFactor: 0.5,         // How quickly the joystick follows the pointer
            hideOnRelease: false,      // Whether to hide joystick when released
            snapToCenter: true,        // Whether stick snaps back to center on release
            snapSpeed: 300,            // Speed of snap animation in ms
            zone: null                 // Specific zone where joystick can be created
        }, options);

        // Get device and responsive UI if available
        this.deviceDetector = scene.game.deviceDetector || (typeof DeviceDetector !== 'undefined' ? new DeviceDetector() : null);
        this.responsiveUI = scene.responsiveUI || (typeof ResponsiveUI !== 'undefined' ? new ResponsiveUI(scene) : null);

        // Scale joystick size based on device if responsive UI is available
        if (this.responsiveUI) {
            this.options.size = this.responsiveUI.scaleValue(this.options.size);
            this.options.maxDistance = this.responsiveUI.scaleValue(this.options.maxDistance);
            this.options.threshold = this.responsiveUI.scaleValue(this.options.threshold);

            // Position joystick
            const pos = this.responsiveUI.getScaledPosition(this.options.x, this.options.y);
            this.options.x = pos.x;
            this.options.y = pos.y;
        } else if (this.deviceDetector && this.deviceDetector.isMobile) {
            // Simple scaling for mobile if no responsive UI
            const scale = Math.min(window.innerWidth / 640, window.innerHeight / 800);
            this.options.size *= scale;
            this.options.maxDistance *= scale;
            this.options.threshold *= scale;
        }

        // State
        this.active = false;
        this.pointer = null;
        this.position = { x: 0, y: 0 };  // Normalized position (-1 to 1)
        this.force = 0;                   // Force of joystick (0 to 1)
        this.angle = 0;                   // Angle in radians

        // Create joystick elements
        this.createJoystick();

        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Create the joystick visual elements
     */
    createJoystick() {
        // Create container for joystick
        this.container = this.scene.add.container(this.options.x, this.options.y);
        this.container.setDepth(1000); // Ensure joystick is above game elements

        // Create base (outer circle)
        this.base = this.scene.add.circle(0, 0, this.options.size / 2, this.options.color, 0.3);
        this.base.setStrokeStyle(2, this.options.color, 0.8);
        this.container.add(this.base);

        // Create stick (inner circle)
        this.stick = this.scene.add.circle(0, 0, this.options.size / 4, this.options.color, 0.8);
        this.container.add(this.stick);

        // Set initial alpha
        this.container.setAlpha(this.options.alpha);

        // Hide joystick initially if option is set
        if (this.options.hideOnRelease) {
            this.container.setAlpha(0);
        }
    }

    /**
     * Set up event listeners for touch/mouse input
     */
    setupEventListeners() {
        // Determine if we should use touch or mouse events
        const useTouch = this.deviceDetector ? this.deviceDetector.hasTouch : 'ontouchstart' in window;

        if (useTouch) {
            // For touch devices
            this.scene.input.on('pointerdown', this.handlePointerDown, this);
            this.scene.input.on('pointermove', this.handlePointerMove, this);
            this.scene.input.on('pointerup', this.handlePointerUp, this);
            this.scene.input.on('pointerupoutside', this.handlePointerUp, this);
        } else {
            // For non-touch devices, only make joystick visible when debugging
            this.container.setAlpha(0.3);

            // Add mouse events for testing
            this.base.setInteractive({ useHandCursor: true });
            this.base.on('pointerdown', this.handlePointerDown, this);
            this.scene.input.on('pointermove', this.handlePointerMove, this);
            this.scene.input.on('pointerup', this.handlePointerUp, this);
        }

        // Listen for resize events if responsive UI is available
        if (this.responsiveUI) {
            this.scene.events.on('ui-scale-changed', this.handleResize, this);
        } else if (typeof window !== 'undefined') {
            window.addEventListener('resize', () => this.handleResize());
        }
    }

    /**
     * Handle pointer down event
     * @param {Phaser.Input.Pointer} pointer - The pointer that triggered the event
     */
    handlePointerDown(pointer) {
        // If joystick is not fixed, move it to the pointer position
        if (!this.options.fixed) {
            // Check if pointer is in allowed zone if specified
            if (this.options.zone) {
                const zone = this.options.zone;
                if (pointer.x < zone.x || pointer.x > zone.x + zone.width ||
                    pointer.y < zone.y || pointer.y > zone.y + zone.height) {
                    return;
                }
            }

            // Move joystick to pointer position
            this.container.setPosition(pointer.x, pointer.y);
        } else if (this.options.zone) {
            // If joystick is fixed but has a zone, check if pointer is in the joystick area
            const distance = Phaser.Math.Distance.Between(
                pointer.x, pointer.y,
                this.container.x, this.container.y
            );

            if (distance > this.options.size) {
                return;
            }
        }

        // Activate joystick
        this.active = true;
        this.pointer = pointer;

        // Show joystick if it was hidden
        if (this.options.hideOnRelease) {
            this.container.setAlpha(this.options.alpha);
        }

        // Update joystick position immediately
        this.updateJoystickPosition(pointer);
    }

    /**
     * Handle pointer move event
     * @param {Phaser.Input.Pointer} pointer - The pointer that triggered the event
     */
    handlePointerMove(pointer) {
        if (!this.active || this.pointer.id !== pointer.id) return;

        this.updateJoystickPosition(pointer);

        // If follow option is enabled, move the entire joystick
        if (this.options.follow && this.force > 0.8) {
            const moveX = pointer.x - this.container.x;
            const moveY = pointer.y - this.container.y;

            this.container.x += moveX * this.options.followFactor;
            this.container.y += moveY * this.options.followFactor;
        }
    }

    /**
     * Handle pointer up event
     * @param {Phaser.Input.Pointer} pointer - The pointer that triggered the event
     */
    handlePointerUp(pointer) {
        if (!this.active || this.pointer.id !== pointer.id) return;

        // Deactivate joystick
        this.active = false;
        this.pointer = null;

        // Reset stick position
        if (this.options.snapToCenter) {
            // Animate stick back to center
            this.scene.tweens.add({
                targets: this.stick,
                x: 0,
                y: 0,
                duration: this.options.snapSpeed,
                ease: 'Cubic.out'
            });
        } else {
            // Instantly center the stick
            this.stick.setPosition(0, 0);
        }

        // Reset values
        this.position = { x: 0, y: 0 };
        this.force = 0;
        this.angle = 0;

        // Hide joystick if option is set
        if (this.options.hideOnRelease) {
            this.scene.tweens.add({
                targets: this.container,
                alpha: 0,
                duration: 200
            });
        }
    }

    /**
     * Update joystick position based on pointer
     * @param {Phaser.Input.Pointer} pointer - The current pointer
     */
    updateJoystickPosition(pointer) {
        // Calculate distance from center
        const dx = pointer.x - this.container.x;
        const dy = pointer.y - this.container.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle
        this.angle = Math.atan2(dy, dx);

        // Calculate force (0 to 1)
        this.force = Phaser.Math.Clamp(distance / this.options.maxDistance, 0, 1);

        // Only update if force is above threshold
        if (distance > this.options.threshold) {
            // Calculate stick position
            const limitedDistance = Math.min(distance, this.options.maxDistance);
            const stickX = Math.cos(this.angle) * limitedDistance;
            const stickY = Math.sin(this.angle) * limitedDistance;

            // Update stick position
            this.stick.setPosition(stickX, stickY);

            // Update normalized position (-1 to 1)
            this.position = {
                x: Math.cos(this.angle) * this.force,
                y: Math.sin(this.angle) * this.force
            };
        } else {
            // Reset if below threshold
            this.stick.setPosition(0, 0);
            this.position = { x: 0, y: 0 };
            this.force = 0;
        }
    }

    /**
     * Handle resize events
     */
    handleResize() {
        if (this.responsiveUI) {
            // Update joystick size
            const newSize = this.responsiveUI.scaleValue(this.options.size / this.responsiveUI.scale);
            const newMaxDistance = this.responsiveUI.scaleValue(this.options.maxDistance / this.responsiveUI.scale);

            // Update base and stick sizes - add null checks
            if (this.base && typeof this.base.setRadius === 'function') {
                this.base.setRadius(newSize / 2);
            }

            if (this.stick && typeof this.stick.setRadius === 'function') {
                this.stick.setRadius(newSize / 4);
            }

            // Update options
            this.options.size = newSize;
            this.options.maxDistance = newMaxDistance;

            // Update position if fixed
            if (this.options.fixed && this.container) {
                const pos = this.responsiveUI.getScaledPosition(
                    this.options.x / this.responsiveUI.scale,
                    this.options.y / this.responsiveUI.scale
                );
                this.container.setPosition(pos.x, pos.y);
            }
        }
    }

    /**
     * Get the current joystick values
     * @returns {Object} Joystick state
     */
    getValue() {
        return {
            x: this.position.x,
            y: this.position.y,
            force: this.force,
            angle: this.angle,
            active: this.active
        };
    }

    /**
     * Set the joystick position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        if (this.responsiveUI) {
            const pos = this.responsiveUI.getScaledPosition(x, y);
            this.container.setPosition(pos.x, pos.y);
        } else {
            this.container.setPosition(x, y);
        }
    }

    /**
     * Show the joystick
     */
    show() {
        this.scene.tweens.add({
            targets: this.container,
            alpha: this.options.alpha,
            duration: 200
        });
    }

    /**
     * Hide the joystick
     */
    hide() {
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 200
        });
    }

    /**
     * Destroy the joystick
     */
    destroy() {
        // Remove event listeners
        this.scene.input.off('pointerdown', this.handlePointerDown, this);
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
        this.scene.input.off('pointerupoutside', this.handlePointerUp, this);

        if (this.responsiveUI) {
            this.scene.events.off('ui-scale-changed', this.handleResize, this);
        }

        // Destroy container and all children
        this.container.destroy();
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.VirtualJoystick = VirtualJoystick;
}
