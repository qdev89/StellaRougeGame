/**
 * State Machine
 * A simple state machine for managing entity states and behaviors
 */
class StateMachine {
    constructor(context) {
        this.context = context;
        this.states = {};
        this.currentState = null;
        this.previousState = null;
        this.stateTime = 0;
    }
    
    addState(name, state) {
        this.states[name] = state;
    }
    
    setState(name) {
        if (!this.states[name]) {
            console.warn(`State ${name} does not exist!`);
            return;
        }
        
        // Exit current state
        if (this.currentState && this.states[this.currentState].onExit) {
            this.states[this.currentState].onExit();
        }
        
        // Store previous state
        this.previousState = this.currentState;
        
        // Set new state
        this.currentState = name;
        this.stateTime = 0;
        
        // Enter new state
        if (this.states[this.currentState].onEnter) {
            this.states[this.currentState].onEnter();
        }
    }
    
    update(delta) {
        if (!this.currentState) return;
        
        // Update state time
        this.stateTime += delta;
        
        // Update current state
        if (this.states[this.currentState].onUpdate) {
            this.states[this.currentState].onUpdate(delta);
        }
    }
    
    getState() {
        return this.currentState;
    }
    
    getStateTime() {
        return this.stateTime;
    }
}

// For non-ES6 module compatibility
if (typeof window !== 'undefined') {
    window.StateMachine = StateMachine;
}
