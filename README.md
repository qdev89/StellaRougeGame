# STELLA ROUGE

A vertical scrolling retro roguelike flying shooter built with HTML5/JavaScript using the Phaser.js framework.

![Stella Rouge Game](https://via.placeholder.com/800x400?text=Stella+Rouge+Game)

## Game Overview

**STELLA ROUGE** is a roguelike vertical scrolling shooter where players pilot a variety of spacecraft through procedurally generated sectors filled with enemies, hazards, and encounters. Choose from multiple ship types with unique abilities - from the agile Scout to the heavily armored Juggernaut, the resourceful Technician, or the high-risk Prototype X. Navigate through dangerous space sectors, defeat unique mini-bosses, and face off against powerful sector bosses in specially designed arena battles.

The game features a balanced difficulty level with 50% fewer enemies and a strategic ammo management system with reduced ammo frequency. This makes the game more accessible while still providing a challenge. Players must collect ammo drops from defeated enemies and manage their weapon resources while battling through each sector.

Make meaningful choices that affect your ship's capabilities and the challenges ahead. Collect upgrades from defeated bosses, manage your ship's systems, and prepare for the ultimate confrontation with the adaptive Nemesis boss that evolves based on your playstyle. Unlock achievements to earn rewards and customize your ship's appearance with different color schemes, engine effects, decorations, and weapon skins.

## Features

### Ship Types and Abilities
- **Multiple Ship Types**: Choose from different ship classes with unique abilities and playstyles
  - **Scout Ship**: High speed and evasion with stealth abilities
  - **Juggernaut (Tank)**: High health and shields with energy barrier protection
  - **Technician (Support)**: Resource generation and repair capabilities
  - **Prototype X (Experimental)**: High-risk, high-reward mechanics with unstable power
- **Special Abilities**: Each ship has a unique special ability with strategic applications

### Progression and Customization
- **Achievement System**: Complete achievements to earn rewards and unlock new content
- **Ship Customization**: Personalize your ship with visual options
  - **Color Schemes**: Change your ship's color palette
  - **Engine Effects**: Customize your engine's particle effects
  - **Ship Decorations**: Add visual enhancements to your ship
  - **Weapon Skins**: Change the appearance of your weapons

### Mobile Support
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Touch Controls**: Virtual joystick and action buttons for mobile play
- **Performance Optimization**: Adaptive settings for different device capabilities

### Core Gameplay
- **Enhanced Spaceship Graphics**: Detailed spaceship sprites with realistic thruster effects
- **Improved UI Visibility**: Enhanced health and shield bars with better visibility and visual feedback
- **Balanced Difficulty**: 50% fewer enemies and reduced ammo frequency for a more accessible experience
- **Dynamic Difficulty System**: Adaptive difficulty that adjusts to player skill with multiple preset difficulty levels
- **Advanced Visual Effects**: Particle-based explosions, impacts, and environmental effects
- **Comprehensive Tutorial**: In-game tutorial system that guides new players through game mechanics
- **Contextual Tips**: Adaptive tips system that provides gameplay advice based on the current situation
- **Detailed Help System**: Comprehensive help scene with information on all game mechanics
- **Retro Visual Style**: 16-bit pixel art aesthetic reminiscent of SNES-era shooters
- **Roguelike Elements**: Procedural generation, permadeath, and meta-progression
- **Choice & Consequence System**: Meaningful decisions that shape each run
- **Boss Arenas**: Unique battle environments with hazards and special mechanics for each boss
- **Boss Rewards**: Defeat bosses to earn powerful upgrades, credits, and ship unlocks
- **Subsystem Synergy Grid**: A 3×3 grid of ship subsystems that create powerful effects when compatible upgrades are adjacent
- **Nemesis System**: The final boss evolves based on how you defeated previous sector bosses, adapting to counter your playstyle
- **Ammo Management**: Strategic ammo system with different consumption rates for each weapon type
- **Weapon Variety**: Multiple weapon types with unique behaviors and ammo requirements
- **Resource Collection**: Collect ammo drops from defeated enemies to maintain your arsenal

## How to Play

### Quick Start
1. Clone or download this repository
2. Simply open `index.html` directly in any modern web browser - no server required!

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/qdev89/StellaRougeGame.git
   cd StellaRougeGame
   ```

2. Install dependencies (optional, only needed for building):
   ```
   npm install
   ```

3. Run the game:
   - Open `index.html` directly in your browser, or
   - Use a local server: `npm start`

### Controls

#### Keyboard Controls
- **WASD/Arrow Keys**: Move your ship
- **Left Mouse Button**: Fire primary weapon
- **Right Mouse Button**: Switch weapons
- **Space**: Use special ability (when available)
- **Shift**: Dash (quick evasive maneuver)
- **Escape**: Pause game
- **1-7 Keys**: Switch directly to specific weapons

#### Mobile Controls
- **Virtual Joystick**: Move your ship (left side of screen)
- **Fire Button**: Fire primary weapon (right side of screen)
- **Special Button**: Use special ability (right side of screen)
- **Dash Button**: Perform evasive maneuver (right side of screen)
- **Weapon Button**: Cycle through weapons (right side of screen)

### Building for Distribution

To create a distributable package:

```
npm run build
```

This will create:
- A ZIP archive in the `build` directory
- A web-ready directory that can be deployed to any web server

### Debug Mode

To access debug tools, add `?debug=true` to the URL:
```
http://localhost:8080/index.html?debug=true
```

Debug keyboard shortcuts:
- `Ctrl+Shift+D`: Toggle debug overlay
- `Ctrl+Shift+F`: Fix common issues
- `Ctrl+Shift+C`: Clear all entities
- `Ctrl+Shift+R`: Reload current scene
- `Ctrl+Shift+G`: Toggle god mode

### Weapons

Use number keys 1-7 to switch between weapons:
- 1: Basic Laser - Rapid-fire balanced weapon
- 2: Tri-Beam - Fires in a spread pattern
- 3: Plasma Bolt - High damage single shot
- 4: Homing Missile - Tracks nearby enemies
- 5: Dual Cannon - Fires two parallel shots
- 6: Beam Laser - Continuous damage beam
- 7: Scatter Bomb - Explodes into fragments

### Ship Types

#### Scout Ship
- **Strengths**: High speed, fast dash cooldown, evasion chance
- **Weaknesses**: Low health and shields
- **Special Ability**: Stealth Mode - Become partially invisible with 50% evasion chance
- **Playstyle**: Hit-and-run tactics, avoiding direct confrontation

#### Juggernaut (Tank)
- **Strengths**: High health and shields, damage reduction
- **Weaknesses**: Slow movement and dash
- **Special Ability**: Energy Shield - Deploy an impenetrable barrier that blocks all damage
- **Playstyle**: Direct confrontation, absorbing damage while dealing heavy hits

#### Technician (Support)
- **Strengths**: Resource generation, shield regeneration, ammo efficiency
- **Weaknesses**: Low damage output
- **Special Ability**: Repair Drone - Deploy a drone that repairs your ship and generates ammo
- **Playstyle**: Resource management, sustained combat through regeneration

#### Prototype X (Experimental)
- **Strengths**: Very high damage, speed, and special ability cooldown
- **Weaknesses**: Very low health, unstable systems that can backfire
- **Special Ability**: Quantum Shift - Phase out of normal space for invulnerability and massive damage boost at the cost of health
- **Playstyle**: High-risk, high-reward gameplay with constant danger

### Gameplay Tips

- Collect powerups and defeat enemies to progress
- Make strategic choices at upgrade stations to enhance your ship
- Arrange upgrades in the Synergy Grid for powerful combinations
- Adapt your strategy based on the enemies you encounter
- Choose a ship type that complements your playstyle
- Complete achievements to unlock new ships and customization options
- Use your special ability at strategic moments to maximize effectiveness
- Experiment with different ship customizations to find your preferred style

## Development Status

This game is currently in development (v0.8.0 Beta). The following features are implemented:

- [x] Basic game structure and scene management
- [x] Player ship movement and controls
- [x] Enhanced spaceship sprite with detailed graphics
- [x] Improved UI with better visibility for health and shield bars
- [x] Enemy base class and multiple enemy types (15 varieties)
- [x] Reduced enemy count (50% fewer) for better game balance
- [x] Combat system (collisions, damage)
- [x] Scrolling background system
- [x] UI elements (health, shields, score)
- [x] Procedural sector generation
- [x] Choice and upgrade system
- [x] Time-pressure choice mechanics
- [x] Mini-bosses (5 types with unique behaviors)
- [x] Sector bosses with phase transitions
- [x] Boss arenas with environmental hazards
- [x] Boss rewards system
- [x] Meta-progression system
- [x] Subsystem Synergy Grid
- [x] Nemesis System for final boss
- [x] Dynamic difficulty scaling with adaptive mode
- [x] Comprehensive balance configuration system
- [x] Advanced visual effects system with particles
- [x] Debug tools and performance optimization
- [x] Build system for distribution
- [x] Analytics system for tracking player behavior
- [x] GitHub Pages deployment workflow
- [x] Comprehensive testing plan
- [x] Future development roadmap
- [x] Tutorial and help system implementation
  - In-game tutorial for new players
  - Contextual tips system for gameplay advice
  - Comprehensive help scene with game mechanics explanation
- [x] Multiple ship types with unique abilities
  - Base ship class framework for all ship types
  - Scout ship with high speed and evasion abilities
  - Tank ship (Juggernaut) with high health and damage reduction
  - Support ship (Technician) with resource generation and repair abilities
  - Experimental ship (Prototype X) with high-risk, high-reward mechanics
  - Ship registry system to manage all ship types
- [x] Expanded progression systems
  - Achievement system with in-game rewards
  - Ship customization system with visual options
  - Color schemes, engine effects, ship decorations, and weapon skins
  - Purchase and unlock mechanics for customization options
- [x] Mobile support
  - Responsive UI design for different screen sizes
  - Touch controls with virtual joystick
  - Mobile-specific performance optimizations
  - Device detection and adaptive settings
- [ ] Sound implementation (completely disabled for now)

## Development Roadmap

### Completed
- **Phase 1**: Core shooter gameplay mechanics
- **Phase 2**: Roguelike systems (procedural generation, boss encounters, meta-progression)
- **Phase 3.1**: Graphics and UI improvements
  - Enhanced spaceship sprite with detailed graphics
  - Improved UI with better visibility for health and shield bars
  - Balanced difficulty with 50% fewer enemies and reduced ammo frequency

### Completed
- **Phase 4**: Polish and release preparation
  - Game balance and tuning with comprehensive balance configuration system
  - Bug fixing and optimization with debug tools
  - Visual polish with enhanced particle effects and animations
  - Tutorial and help system implementation
    - In-game tutorial for new players
    - Contextual tips system for gameplay advice
    - Comprehensive help scene with game mechanics explanation
  - Final documentation with player guide and release notes
  - Release preparation with build scripts and package management
- **Phase 3.2**: Content expansion and unique systems
  - Subsystem Synergy Grid
  - Nemesis System for final boss
  - Additional upgrades and penalties (30+ new upgrades, 20+ new penalties)
  - Dynamic difficulty scaling with adaptive mode and multiple difficulty levels
- **Phase 5**: Ship types and progression systems
  - Multiple ship types with unique abilities and playstyles
    - Scout ship with high speed and evasion abilities
    - Tank ship (Juggernaut) with high health and damage reduction
    - Support ship (Technician) with resource generation and repair abilities
    - Experimental ship (Prototype X) with high-risk, high-reward mechanics
  - Expanded progression systems
    - Achievement system with in-game rewards
    - Ship customization system with visual options
  - Mobile support
    - Responsive UI design for different screen sizes
    - Touch controls with virtual joystick
    - Mobile-specific performance optimizations

### Future Considerations
- **Sound Implementation (Post-Release)**
  - Background music for menu and gameplay with unique themes for each sector
  - Sound effects for weapons, explosions, UI, and environmental elements
  - Dynamic audio mixing based on gameplay intensity
  - Audio options menu for player customization
- **Advanced Synergy System**
  - Element-based synergies (fire, ice, electric, etc.)
  - Skill tree integration with synergies
  - Visual effects for active synergies
  - Synergy combinations between ship types and upgrades
- **Platform Expansion**
  - Gamepad support for browser play with full controller mapping
  - Electron wrapper for desktop distribution on Windows, macOS, and Linux
- **Content Expansion**
  - Additional game modes (endless, boss rush, challenge mode, daily runs)
  - More weapon types and modification systems
  - Additional ship customization options
- **Community Features**
  - Online leaderboards for comparing scores
  - Run sharing functionality to share builds
  - Community challenges with special rules

See the [detailed project plan](project-plan.md) for more information.

## Technology Stack

- **Game Engine**: Phaser 3
- **Language**: JavaScript (ES6+)
- **Rendering**: HTML5 Canvas
- **Implementation**: Pure HTML5/JS that runs by simply opening index.html
- **Build Tools**: Node.js, npm
- **Package Management**: npm
- **Distribution**: Custom build script with archiver
- **Deployment**: GitHub Actions, GitHub Pages
- **Analytics**: Custom analytics system
- **Testing**: Comprehensive testing plan
- **Version Control**: Git
- **Asset Creation**: Piskel (sprites)
- **Particle Effects**: Custom particle system
- **Debug Tools**: Custom debug overlay and tools

## Project Structure

```
stella-rouge/
├── index.html          # Main entry point
├── README.md           # This file
├── project-plan.md     # Detailed development plan
├── player-guide.md     # Comprehensive player guide
├── release-notes.md    # Version history and changes
├── roadmap.md          # Future development roadmap
├── testing-plan.md     # Comprehensive testing plan
├── package.json        # Project dependencies and scripts
├── build.js            # Build script for distribution
├── .gitignore          # Git ignore file
├── LICENSE             # MIT license file
├── .github/            # GitHub configuration
│   └── workflows/     # GitHub Actions workflows
│       └── deploy.yml  # Deployment workflow
├── src/                # Source code
│   ├── assets/         # Game assets
│   │   ├── images/     # Sprite sheets, backgrounds, UI
│   │   └── particles/  # Particle textures
│   └── js/             # JavaScript code
│       ├── config.js   # Game configuration
│       ├── main.js     # Game initialization
│       ├── entities/   # Game objects (player, enemies, bosses)
│       │   └── ship-types/ # Ship type classes
│       │       ├── ship-base.js      # Base ship class
│       │       ├── scout-ship.js     # Scout ship implementation
│       │       ├── tank-ship.js      # Tank ship implementation
│       │       ├── support-ship.js   # Support ship implementation
│       │       ├── experimental-ship.js # Experimental ship implementation
│       │       └── ship-registry.js  # Ship type management
│       ├── scenes/     # Phaser scenes (menu, game, etc.)
│       ├── systems/    # Game systems (procedural, difficulty, effects)
│       │   ├── achievement-system.js # Achievement system
│       │   └── ship-customization.js # Ship customization system
│       ├── ui/         # User interface components
│       │   └── mobile/ # Mobile-specific UI components
│       ├── audio/      # Audio management (disabled for now)
│       └── utils/      # Helper functions and debug tools
```

## Contributing

This is a personal project in development. Contributions, suggestions, and feedback are welcome.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Game concept and development: quocdev
- Phaser.js game framework: [Phaser](https://phaser.io/)
- Placeholder assets used during development
