# STELLAR ROGUE - Project Plan

## Game Overview

**STELLAR ROGUE** is a vertical scrolling retro roguelike flying shooter built with HTML5/JavaScript using the Phaser.js framework. Players pilot a fighter craft through procedurally generated sectors filled with enemies, hazards, and encounters, making meaningful choices that affect their ship's capabilities and the challenges ahead.

## Core Game Elements

### 1. Retro Visual Style
- 16-bit pixel art aesthetic reminiscent of SNES-era shooters
- Vibrant colors with detailed sprite work
- Smooth animations and particle effects

### 2. Roguelike Elements
- **Run-based Progression**: Each mission is a separate attempt with permadeath
- **Procedural Generation**: Dynamically generated sectors, enemy formations, and hazards
- **Meta-progression**: Persistent unlocks between runs
- **Player Choice**: Meaningful decisions that shape each run

### 3. Core Choice & Consequence System
- **Decision Points**: Choices after clearing sectors, at upgrade stations, and during emergencies
- **Rewards**: Weapon modifications, ship systems, specialized equipment, passive abilities
- **Penalties/Tradeoffs**: Subsystem damage, vulnerabilities, enemy adaptations, resource drains
- **Synergies**: Compatible upgrades create powerful combinations when installed in adjacent subsystem slots

### 4. Unique Features
- **Subsystem Synergy Grid**: A 3×3 grid of ship subsystems that create powerful effects when compatible upgrades are adjacent
- **Nemesis System**: The final boss evolves based on how you defeated previous sector bosses

## Development Plan

### Phase 1: Core Shooter & Run Loop Prototype (4 weeks)
- [x] Set up project structure
- [x] Implement player ship movement and shooting
- [x] Create enemy base class and basic enemy types
- [x] Implement combat (collisions, damage, health)
- [x] Set up scrolling background system
- [x] Create basic UI elements (health, shields, score)
- [x] Implement death/restart loop

**Deliverables:** Playable prototype with basic shooting mechanics, one player ship, 3 enemy types

### Phase 2: Roguelike Systems MVP (6 weeks)
- [x] Implement procedural sector generation
- [x] Create choice/upgrade/penalty system
- [x] Develop basic inventory and ship status screens
- [x] Implement save/load system for meta-progression
- [x] Create sector transition and path selection
- [ ] Build first boss encounter
  - [ ] Design boss entity with multiple attack patterns
  - [ ] Create boss arena with environmental hazards
  - [ ] Implement phase transitions based on health
  - [ ] Add special rewards for boss defeat
- [ ] Implement time-pressure choice mechanics

**Deliverables:** Functional roguelike loop with choices affecting gameplay, 3 sectors, first boss

### Phase 3: Content Expansion & Balancing (8 weeks)
- [ ] Expand enemy types to 15 varieties
- [ ] Add 5 mini-bosses and 3 sector bosses
- [ ] Implement Subsystem Synergy Grid
- [ ] Develop Nemesis System for final boss
- [ ] Create 30+ unique upgrades and 20+ penalty variations
- [x] Build out meta-progression system
- [ ] Implement dynamic difficulty scaling
- [ ] Balance risk/reward across different path choices

**Deliverables:** Content-complete game with full progression, multiple bosses, unique systems

### Phase 4: Polish & Release Prep (4 weeks)
- [ ] Refine visual effects (explosions, particles, screen shake)
- [ ] Implement sound design and music (moved from earlier phases)
- [ ] Add tutorial elements and help system
- [ ] Optimize performance across devices
- [ ] Add analytics for balance data
- [ ] Final balancing based on playtesting
- [ ] Prepare marketing materials

**Deliverables:** Release-ready game with complete audiovisual experience and refined gameplay

## Technology Stack

- **Game Engine**: Phaser 3
- **Language**: JavaScript (ES6+)
- **Rendering**: HTML5 Canvas with WebGL
- **Build Process**: Basic file structure with CDN-loaded dependencies
- **Version Control**: Git
- **Asset Creation**: Piskel (sprites), BFXR (sound effects)

## Project Structure

```
stellar-rogue/
├── index.html          # Main entry point
├── src/                # Source code
│   ├── assets/         # Game assets
│   │   ├── images/     # Sprite sheets, backgrounds, UI
│   │   └── sounds/     # Music and sound effects
│   └── js/             # JavaScript code
│       ├── config.js   # Game configuration
│       ├── main.js     # Game initialization
│       ├── entities/   # Game objects (player, enemies)
│       ├── scenes/     # Phaser scenes
│       ├── systems/    # Game systems (procedural, choice)
│       └── utils/      # Helper functions and constants
└── project-plan.md    # This document
```

## Current Status

Phase 1 is complete with a functional prototype of the core shooter gameplay. The game features player ship movement, shooting, enemy types with different behaviors, combat mechanics, scrolling backgrounds, and basic UI elements.

Phase 2 is nearly complete with the following features implemented:
- Procedural sector generation with a visual sector map
- Enhanced choice/upgrade/penalty system with tiered progression
- Basic inventory and ship status screens
- Sector transition and path selection
- Save/load system for meta-progression with profile management

We've also made progress on Phase 3 by implementing a comprehensive meta-progression system that includes:
- Persistent player statistics tracking
- Credits system for unlocking content
- Profile management with save/load functionality
- Achievement framework for future expansion

Sound implementation has been temporarily disabled and moved to Phase 4 to focus on gameplay mechanics first.

## Next Steps

### Immediate Focus: First Boss Encounter (Phase 2)

1. **Boss Entity Implementation**
   - Create base boss class extending Enemy
   - Implement health phases and state transitions
   - Design special attack patterns and behaviors
   - Add visual effects for boss attacks

2. **Boss Arena Design**
   - Create special environment for boss battles
   - Add visual indicators for boss phases
   - Implement arena boundaries and hazards
   - Design background elements specific to boss fights

3. **Sector Map Integration**
   - Add boss node at the end of each sector
   - Create visual distinction for boss nodes
   - Implement progression to next sector after boss defeat
   - Add narrative elements for boss encounters

4. **Boss Rewards System**
   - Create special rewards for defeating bosses
   - Implement sector completion bonuses
   - Add meta-progression unlocks tied to boss defeats
   - Design unique upgrade drops from bosses

### Subsequent Tasks

1. Implement time-pressure choice mechanics (Phase 2)
2. Begin expanding enemy types (Phase 3)
3. Add mini-bosses and sector bosses (Phase 3)
4. Implement Subsystem Synergy Grid (Phase 3)
5. Create additional unlockable content for meta-progression (Phase 3)

## Boss Encounter Design

### Sector 1 Boss: The Guardian
- **Description**: A heavily armored defensive ship that protects the gateway to the next sector
- **Visual Design**: Large, bulky ship with rotating shield generators and multiple weapon ports
- **Attack Patterns**:
  - Phase 1: Defensive stance with shield generators active, fires spread shots
  - Phase 2 (75% health): Shield generators vulnerable, deploys defensive drones
  - Phase 3 (50% health): Rapid-fire mode with concentrated beam attacks
  - Phase 4 (25% health): Desperate assault with all weapons firing and ramming attempts
- **Arena Features**:
  - Asteroid field that provides cover but also poses collision hazards
  - Shield generators that can be destroyed to weaken the boss
  - Energy barriers that periodically activate, restricting movement
- **Rewards**:
  - Guaranteed shield upgrade
  - Chance for rare weapon drop
  - Significant credit bonus
  - Unlock for new ship type upon first defeat

### Implementation Strategy
- Create a base `BossEnemy` class that extends the existing `Enemy` class
- Implement a state machine for managing different attack phases
- Design a special arena scene that loads when entering a boss node
- Create a reward selection system based on player's current build
- Add visual and audio cues for phase transitions

## Future Considerations

- Sound design and music implementation (moved to Phase 4)
  - Background music for menu and gameplay
  - Sound effects for weapons, explosions, powerups
  - Dynamic audio mixing based on gameplay intensity
- Mobile support with touch controls
- Gamepad support for browser play
- Potential for electron wrapper for desktop distribution
- Possible advanced features after release:
  - Daily challenge runs
  - Ship customization unlocks
  - Additional game modes (endless, boss rush)