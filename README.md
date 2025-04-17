# STELLAR ROGUE

A vertical scrolling retro roguelike flying shooter built with HTML5/JavaScript using the Phaser.js framework.

![Stellar Rogue Game](https://via.placeholder.com/800x400?text=Stellar+Rogue+Game)

## Game Overview

**STELLAR ROGUE** is a roguelike vertical scrolling shooter where players pilot a fighter craft through procedurally generated sectors filled with enemies, hazards, and encounters. Navigate through dangerous space sectors, defeat unique mini-bosses, and face off against powerful sector bosses in specially designed arena battles.

Make meaningful choices that affect your ship's capabilities and the challenges ahead. Collect upgrades from defeated bosses, manage your ship's systems, and prepare for the ultimate confrontation with the adaptive Nemesis boss that evolves based on your playstyle.

## Features

- **Retro Visual Style**: 16-bit pixel art aesthetic reminiscent of SNES-era shooters
- **Roguelike Elements**: Procedural generation, permadeath, and meta-progression
- **Choice & Consequence System**: Meaningful decisions that shape each run
- **Boss Arenas**: Unique battle environments with hazards and special mechanics for each boss
- **Boss Rewards**: Defeat bosses to earn powerful upgrades, credits, and ship unlocks
- **Subsystem Synergy Grid**: A 3×3 grid of ship subsystems that create powerful effects when compatible upgrades are adjacent (coming soon)
- **Nemesis System**: The final boss evolves based on how you defeated previous sector bosses (coming soon)

## How to Play

1. Clone or download this repository
2. Simply open `index.html` directly in any modern web browser - no server required!
3. Use arrow keys to move your ship
4. Press Space to fire weapons
5. Press Shift to activate dash (when available)
6. Collect powerups and defeat enemies to progress
7. Make strategic choices at upgrade stations to enhance your ship

## Development Status

This game is currently in development (v0.2.0 Alpha). The following features are implemented:

- [x] Basic game structure and scene management
- [x] Player ship movement and controls
- [x] Enemy base class and multiple enemy types (15 varieties)
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
- [ ] Subsystem Synergy Grid (in development)
- [ ] Nemesis System for final boss
- [ ] Sound implementation (temporarily disabled)

## Development Roadmap

### Completed
- **Phase 1**: Core shooter gameplay mechanics
- **Phase 2**: Roguelike systems (procedural generation, boss encounters, meta-progression)

### In Progress
- **Phase 3**: Content expansion and unique systems
  - Currently implementing: Subsystem Synergy Grid
  - Next: Nemesis System for final boss
  - Planned: Additional upgrades, penalties, and dynamic difficulty scaling

### Upcoming
- **Phase 4**: Polish and release preparation
  - Sound design and music implementation
  - Tutorial elements and help system
  - Performance optimization
  - Final balancing

See the [detailed project plan](project-plan.md) for more information.

## Technology Stack

- **Game Engine**: Phaser 3
- **Language**: JavaScript (ES6+)
- **Rendering**: HTML5 Canvas
- **Implementation**: Pure HTML5/JS that runs by simply opening index.html
- **Version Control**: Git
- **Asset Creation**: Piskel (sprites), BFXR (sound effects)

## Project Structure

```
stellar-rogue/
├── index.html          # Main entry point
├── README.md           # This file
├── project-plan.md     # Detailed development plan
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
```

## Contributing

This is a personal project in development. Contributions, suggestions, and feedback are welcome.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Game concept and development: quocdev
- Phaser.js game framework: [Phaser](https://phaser.io/)
- Placeholder assets used during development
