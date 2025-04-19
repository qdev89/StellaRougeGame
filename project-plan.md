# STELLAR ROGUE - Project Plan

## Game Overview

**STELLAR ROGUE** is a vertical scrolling retro roguelike flying shooter built with HTML5/JavaScript using the Phaser.js framework. Players pilot a fighter craft through procedurally generated sectors filled with enemies, hazards, and encounters, making meaningful choices that affect their ship's capabilities and the challenges ahead.

The game features a balanced difficulty level with 50% fewer enemies and reduced ammo frequency, making it accessible while still providing a challenge.

## Core Game Elements

### 1. Retro Visual Style
- 16-bit pixel art aesthetic reminiscent of SNES-era shooters
- Vibrant colors with detailed sprite work
- Enhanced spaceship sprite with realistic thruster effects and lighting
- Improved UI with better visibility for health and shield bars
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
- [x] Enhance spaceship sprite with detailed graphics
- [x] Improve UI with better visibility for health and shield bars
- [x] Balance difficulty with 50% fewer enemies and reduced ammo frequency
- [x] Develop Nemesis System for final boss
- [x] Create 30+ unique upgrades and 20+ penalty variations
- [x] Build out meta-progression system
- [x] Implement dynamic difficulty scaling
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
- Enhanced spaceship sprite with detailed graphics and realistic thruster effects
- Improved UI with better visibility for health and shield bars
  - Added 3D effects and tick marks to UI elements
  - Enhanced visual feedback for low health and active shields
  - Added electric shimmer effect for shield bars
- Comprehensive meta-progression system that includes:
  - Persistent player statistics tracking
  - Credits system for unlocking content
  - Profile management with save/load functionality
  - Achievement framework for future expansion
- Balanced difficulty with 50% fewer enemies
- Strategic ammo management system:
  - Different ammo types for each weapon
  - Ammo drops from defeated enemies
  - Ammo regeneration over time
  - Visual UI for ammo status

Sound implementation has been completely disabled and moved to Phase 4 to focus on gameplay mechanics first.

## Recent Updates

### Enhanced Graphics and UI
- Implemented detailed spaceship sprite with realistic thruster effects and lighting
- Improved health and shield bars with better visibility and visual feedback
- Added 3D effects and tick marks to UI elements for better readability
- Enhanced visual feedback for low health and active shields
- Added electric shimmer effect for shield bars

### Enhanced Weapon System
- Added 3 new weapon types:
  - Dual Cannon: Fires two parallel projectiles
  - Laser Beam: Continuous damage beam
  - Scatter Bomb: Explodes into multiple fragments
- Implemented weapon switching with number keys 1-7
- Added visual feedback for weapon switching
- Enhanced projectile visuals with colors and particle effects
- Added weapon selector UI with unlocked/locked status indicators

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

### Completed: Nemesis System for Final Boss (Phase 3)
   - ✅ Created tracking system for boss defeat methods
   - ✅ Designed adaptive final boss behaviors
   - ✅ Implemented visual changes based on previous encounters
   - ✅ Added narrative elements explaining the nemesis concept

### Completed: Additional Upgrades and Penalties (Phase 3)
   - ✅ Designed and implemented 30+ unique upgrades
   - ✅ Created 20+ penalty variations
   - ✅ Balanced upgrade/penalty distribution
   - ✅ Added visual effects for upgrades and penalties

### Completed: Dynamic Difficulty Scaling (Phase 3)
   - ✅ Created comprehensive difficulty adjustment based on player performance metrics
   - ✅ Implemented scaling for enemy health, damage, speed, and spawn rates
   - ✅ Added adaptive rewards based on player performance
   - ✅ Created difficulty settings UI with multiple preset difficulty levels
   - ✅ Implemented adaptive mode that automatically adjusts to player skill level

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

## Phase 4: Polish and Release Preparation

### Game Balance and Tuning
- ✅ Created comprehensive balance configuration system
- ✅ Fine-tuned dynamic difficulty system
- ✅ Balanced weapon damage, enemy health, and spawn rates
- ✅ Adjusted upgrade and penalty effects for better gameplay flow
- ✅ Improved risk/reward balance across different path choices

### Bug Fixing and Optimization
- ✅ Created comprehensive debug tools for identifying and fixing issues
- ✅ Implemented performance monitoring and optimization
- ✅ Added automatic fixes for common gameplay issues
- ✅ Created save/load functionality for testing and debugging

### Visual Polish
- ✅ Created comprehensive visual effects system
- ✅ Added enhanced explosion and impact effects
- ✅ Implemented screen shake and particle effects for impactful moments
- ✅ Added environmental effects like space dust and nebula

### Final Documentation
- ✅ Updated all documentation to reflect the final state of the game
- ✅ Created comprehensive player guide with controls, mechanics, and tips
- ✅ Documented known issues and future enhancement plans
- ✅ Prepared release notes for the initial release

### Release Preparation
- ✅ Created build process for packaging the game
- ✅ Added package.json for dependency management
- ✅ Prepared marketing materials (screenshots, descriptions)
- ✅ Set up feedback mechanism through GitHub repository

## Future Considerations

- Sound design and music implementation (completely disabled for now, moved to post-release)
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