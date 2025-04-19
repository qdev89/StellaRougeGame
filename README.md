# STELLAR ROGUE

A vertical scrolling retro roguelike flying shooter built with HTML5/JavaScript using the Phaser.js framework.

![Stellar Rogue Game](https://via.placeholder.com/800x400?text=Stellar+Rogue+Game)

## Game Overview

**STELLAR ROGUE** is a roguelike vertical scrolling shooter where players pilot a fighter craft through procedurally generated sectors filled with enemies, hazards, and encounters. Navigate through dangerous space sectors, defeat unique mini-bosses, and face off against powerful sector bosses in specially designed arena battles.

The game features a balanced difficulty level with 50% fewer enemies and a strategic ammo management system with reduced ammo frequency. This makes the game more accessible while still providing a challenge. Players must collect ammo drops from defeated enemies and manage their weapon resources while battling through each sector.

Make meaningful choices that affect your ship's capabilities and the challenges ahead. Collect upgrades from defeated bosses, manage your ship's systems, and prepare for the ultimate confrontation with the adaptive Nemesis boss that evolves based on your playstyle.

## Features

- **Enhanced Spaceship Graphics**: Detailed spaceship sprite with realistic thruster effects and lighting
- **Improved UI Visibility**: Enhanced health and shield bars with better visibility and visual feedback
- **Balanced Difficulty**: 50% fewer enemies and reduced ammo frequency for a more accessible experience
- **Dynamic Difficulty System**: Adaptive difficulty that adjusts to player skill with multiple preset difficulty levels
- **Advanced Visual Effects**: Particle-based explosions, impacts, and environmental effects
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

1. Use WASD or arrow keys to move your ship
2. Mouse to aim
3. Left mouse button to fire weapons
4. Right mouse button to switch weapons
5. Space for special ability (when available)

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

### Gameplay Tips

- Collect powerups and defeat enemies to progress
- Make strategic choices at upgrade stations to enhance your ship
- Arrange upgrades in the Synergy Grid for powerful combinations
- Adapt your strategy based on the enemies you encounter

## Development Status

This game is currently in development (v0.5.0 Beta). The following features are implemented:

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
  - Final documentation with player guide and release notes
  - Release preparation with build scripts and package management
- **Phase 3.2**: Content expansion and unique systems
  - Subsystem Synergy Grid
  - Nemesis System for final boss
  - Additional upgrades and penalties (30+ new upgrades, 20+ new penalties)
  - Dynamic difficulty scaling with adaptive mode and multiple difficulty levels

### Future Considerations
- Sound design and music implementation (planned for post-release)
- Mobile support with touch controls
- Gamepad support for browser play
- Additional game modes (endless, boss rush)

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
stellar-rogue/
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
│       ├── scenes/     # Phaser scenes (menu, game, etc.)
│       ├── systems/    # Game systems (procedural, difficulty, effects)
│       ├── ui/         # User interface components
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
