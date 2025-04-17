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
- [x] Implement time-pressure choice mechanics
- [x] Build first boss encounter
  - [x] Design boss entity with multiple attack patterns
  - [x] Create boss arena with environmental hazards
  - [x] Implement phase transitions based on health
  - [x] Add special rewards for boss defeat

**Deliverables:** Functional roguelike loop with choices affecting gameplay, 3 sectors, first boss

### Phase 3: Content Expansion & Balancing (8 weeks)
- [x] Expand enemy types to 15 varieties
  - [x] Added Interceptor, Bomber, Stealth, Turret, and Carrier enemy types
- [x] Add 5 mini-bosses and 3 sector bosses
  - [x] Mini-bosses: Assault Captain, Shield Master, Drone Commander, Stealth Hunter, Bomber Chief
  - [x] Additional sector bosses: Stealth Overlord, Bomber Titan
- [x] Implement Subsystem Synergy Grid
- [ ] Develop Nemesis System for final boss
- [ ] Create 30+ unique upgrades and 20+ penalty variations
- [x] Build out meta-progression system
- [ ] Implement dynamic difficulty scaling
- [ ] Balance risk/reward across different path choices

**Deliverables:** Content-complete game with full progression, multiple bosses, unique systems

### Phase 4: Polish & Release Prep (4 weeks)
- [ ] Refine visual effects (explosions, particles, screen shake)
- [ ] Implement sound design and music (completely disabled for now, moved from earlier phases)
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
- **Asset Creation**: Piskel (sprites)

## Project Structure

```
stellar-rogue/
├── index.html          # Main entry point
├── src/                # Source code
│   ├── assets/         # Game assets
│   │   └── images/     # Sprite sheets, backgrounds, UI
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

Phase 2 is now complete with the following features implemented:
- Procedural sector generation with a visual sector map
- Enhanced choice/upgrade/penalty system with tiered progression
- Basic inventory and ship status screens
- Sector transition and path selection
- Save/load system for meta-progression with profile management
- Time-pressure choice mechanics with emergency events
- Boss entity implementation with phase transitions
- Boss arenas with environmental hazards and special effects
- Boss rewards system with unique upgrades and unlocks

We've made significant progress on Phase 3 by implementing:
- Expanded enemy types (added 5 new enemy types: Interceptor, Bomber, Stealth, Turret, and Carrier)
- 5 mini-bosses with unique behaviors and attack patterns
- 2 additional sector bosses
- Comprehensive meta-progression system that includes:
  - Persistent player statistics tracking
  - Credits system for unlocking content
  - Profile management with save/load functionality
  - Achievement framework for future expansion

Sound implementation has been completely disabled and moved to Phase 4 to focus on gameplay mechanics first.

## Next Steps

### Completed: Subsystem Synergy Grid (Phase 3)

1. **Design and Create Grid Interface**
   - ✅ Created a new scene for the Subsystem Synergy Grid
   - ✅ Designed the 3×3 grid layout with slots for different subsystems
   - ✅ Implemented visual indicators for compatible and incompatible upgrades
   - ✅ Created UI elements for managing the grid

2. **Implement Upgrade Placement Mechanics**
   - ✅ Added drag-and-drop functionality for placing upgrades
   - ✅ Created validation for upgrade placement rules
   - ✅ Implemented upgrade removal and repositioning
   - ✅ Added visual feedback for valid/invalid placements

3. **Create Synergy System**
   - ✅ Implemented synergy effects between adjacent compatible upgrades
   - ✅ Designed synergy bonuses and special abilities
   - ✅ Created visual effects for active synergies
   - ✅ Added tooltips explaining synergy benefits

4. **Integrate with Existing Systems**
   - ✅ Connected the grid to the ship status screen
   - ✅ Updated the upgrade system to work with the grid
   - ✅ Ensured upgrades from boss rewards can be placed in the grid
   - ✅ Added grid status to save/load system

### Immediate Focus: Develop Nemesis System for Final Boss (Phase 3)
   - Create tracking system for boss defeat methods
   - Design adaptive final boss behaviors
   - Implement visual changes based on previous encounters
   - Add narrative elements explaining the nemesis concept

2. **Create Additional Upgrades and Penalties (Phase 3)**
   - Design and implement 30+ unique upgrades
   - Create 20+ penalty variations
   - Balance upgrade/penalty distribution
   - Add visual effects for upgrades and penalties

3. **Implement Dynamic Difficulty Scaling (Phase 3)**
   - Create difficulty adjustment based on player performance
   - Implement scaling enemy health and damage
   - Balance risk/reward across different path choices
   - Add adaptive challenge for experienced players

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

### Sector 2 Boss: Battle Carrier
- **Description**: A massive carrier ship that deploys waves of drones and provides support
- **Visual Design**: Large ship with multiple hangar bays, support beam emitters, and heavy armor
- **Attack Patterns**:
  - Phase 1: Drone deployment and support beam activation
  - Phase 2 (70% health): Missile barrages and increased drone production
  - Phase 3 (40% health): Activates shield and uses concentrated beam attacks
- **Arena Features**:
  - Repair stations that the carrier can use to heal
  - Debris fields that block projectiles
  - Limited movement space due to the carrier's size
- **Rewards**:
  - Drone companion upgrade
  - Shield modulation technology
  - Large credit bonus

### Sector 3 Boss: Destroyer Prime
- **Description**: A heavily armed battleship with devastating artillery
- **Visual Design**: Sleek, angular ship with multiple weapon ports and reinforced hull
- **Attack Patterns**:
  - Phase 1: Artillery bombardment from a distance
  - Phase 2 (65% health): Deploys mines and uses charge attacks
  - Phase 3 (30% health): Rapid-fire burst attacks and continuous artillery
- **Arena Features**:
  - Moving cover elements
  - Artillery impact zones that are telegraphed before strikes
  - Environmental hazards from artillery impacts
- **Rewards**:
  - Artillery weapon unlock
  - Hull reinforcement technology
  - Significant credit bonus

### Sector 4 Boss: Stealth Overlord
- **Description**: A master of stealth technology that phases in and out of visibility
- **Visual Design**: Sleek, dark ship with purple energy signatures and cloaking technology
- **Attack Patterns**:
  - Phase 1: Cloaking and ambush attacks
  - Phase 2 (70% health): Deploys mines while cloaked and uses spread attacks when visible
  - Phase 3 (35% health): Rapid phase shifting and coordinated ambushes
- **Arena Features**:
  - Sensor arrays that can reveal the cloaked boss
  - Stealth disruptors that the player can activate
  - Dark environment with limited visibility
- **Rewards**:
  - Cloaking technology
  - Enhanced sensors
  - Stealth countermeasures

### Sector 5 Boss: Dreadnought
- **Description**: The flagship of the enemy fleet with all weapon systems
- **Visual Design**: Massive ship with multiple weapon systems, shield generators, and drone bays
- **Attack Patterns**:
  - Phase 1: Artillery and drone deployment
  - Phase 2 (80% health): Activates shields and uses beam weapons
  - Phase 3 (60% health): Missile barrages and increased drone production
  - Phase 4 (30% health): All weapons active simultaneously
- **Arena Features**:
  - Multiple destructible parts of the boss
  - Environmental hazards from weapon impacts
  - Limited safe zones
- **Rewards**:
  - Advanced weapon system
  - Shield overcharge technology
  - Massive credit bonus

### Sector 6 Boss: Bomber Titan
- **Description**: A specialized bomber that saturates the arena with explosives
- **Visual Design**: Heavy ship with multiple bomb bays, mine launchers, and reinforced armor
- **Attack Patterns**:
  - Phase 1: Carpet bombing and mine deployment
  - Phase 2 (65% health): Cluster bombs and artillery support
  - Phase 3 (30% health): Rapid bombing runs and drone deployment
- **Arena Features**:
  - Destructible environment that changes as bombs impact
  - Safe zones that shift throughout the battle
  - Bomb shelters that provide temporary protection
- **Rewards**:
  - Explosive weapons technology
  - Blast shield upgrade
  - Area damage resistance

### Final Boss: Nemesis
- **Description**: An adaptive entity that has studied the player's tactics and counters them
- **Visual Design**: Morphing ship that incorporates elements of previously defeated bosses
- **Attack Patterns**:
  - Adapts based on player's most used weapons and tactics
  - Incorporates attack patterns from previously defeated bosses
  - Changes strategies as it loses health
  - Final phase combines all previous boss abilities
- **Arena Features**:
  - Dynamic environment that changes based on the boss's current form
  - Elements from all previous boss arenas
  - Hazards that target the player's weaknesses
- **Rewards**:
  - Game completion achievements
  - Special ship unlock
  - Ultimate weapon technology

### Implementation Strategy
- Create a base `BossEnemy` class that extends the existing `Enemy` class
- Implement a state machine for managing different attack phases
- Design a special arena scene that loads when entering a boss node
- Create a reward selection system based on player's current build
- Add visual cues for phase transitions
- Implement boss-specific mechanics like shield generators and weapon ports

## Future Considerations

- Sound design and music implementation (completely disabled for now, moved to Phase 4)
  - Background music for menu and gameplay (planned for future)
  - Sound effects for weapons, explosions, powerups (planned for future)
  - Dynamic audio mixing based on gameplay intensity (planned for future)
- Mobile support with touch controls
- Gamepad support for browser play
- Potential for electron wrapper for desktop distribution
- Possible advanced features after release:
  - Daily challenge runs
  - Ship customization unlocks
  - Additional game modes (endless, boss rush)