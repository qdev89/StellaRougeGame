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
- [ ] Implement procedural sector generation
- [ ] Create choice/upgrade/penalty system
- [ ] Develop basic inventory and ship status screens
- [ ] Implement save/load system for meta-progression
- [ ] Create sector transition and path selection
- [ ] Build first boss encounter
- [ ] Implement time-pressure choice mechanics

**Deliverables:** Functional roguelike loop with choices affecting gameplay, 3 sectors, first boss

### Phase 3: Content Expansion & Balancing (8 weeks)
- [ ] Expand enemy types to 15 varieties
- [ ] Add 5 mini-bosses and 3 sector bosses
- [ ] Implement Subsystem Synergy Grid
- [ ] Develop Nemesis System for final boss
- [ ] Create 30+ unique upgrades and 20+ penalty variations
- [ ] Build out meta-progression system
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

Phase 1 is complete with a functional prototype of the core shooter gameplay. The game features player ship movement, shooting, enemy types with different behaviors, combat mechanics, scrolling backgrounds, and basic UI elements. Sound implementation has been temporarily disabled and moved to Phase 4 to focus on gameplay mechanics first.

## Next Steps

1. Begin implementing procedural sector generation (Phase 2)
2. Create choice/upgrade/penalty system (Phase 2)
3. Develop basic inventory and ship status screens (Phase 2)
4. Implement save/load system for meta-progression (Phase 2)
5. Create sector transition and path selection (Phase 2)
6. Build first boss encounter (Phase 2)

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