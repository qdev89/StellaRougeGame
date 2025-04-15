# STELLAR ROGUE

A vertical scrolling retro roguelike flying shooter built with HTML5/JavaScript using the Phaser.js framework.

![Stellar Rogue Game](https://via.placeholder.com/800x400?text=Stellar+Rogue+Game)

## Game Overview

**STELLAR ROGUE** is a roguelike vertical scrolling shooter where players pilot a fighter craft through procedurally generated sectors filled with enemies, hazards, and encounters. Make meaningful choices that affect your ship's capabilities and the challenges ahead.

## Features

- **Retro Visual Style**: 16-bit pixel art aesthetic reminiscent of SNES-era shooters
- **Roguelike Elements**: Procedural generation, permadeath, and meta-progression
- **Choice & Consequence System**: Meaningful decisions that shape each run
- **Subsystem Synergy Grid**: A 3×3 grid of ship subsystems that create powerful effects when compatible upgrades are adjacent
- **Nemesis System**: The final boss evolves based on how you defeated previous sector bosses

## How to Play

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Use arrow keys to move your ship
4. Press Space to fire weapons
5. Press Shift to activate dash (when available)
6. Collect powerups and defeat enemies to progress
7. Make strategic choices at upgrade stations to enhance your ship

## Development Status

This game is currently in early development (v0.1 Alpha). The following features are implemented:

- [x] Basic game structure and scene management
- [x] Player ship movement and controls
- [x] Enemy base class
- [ ] Complete enemy implementations
- [ ] Combat system (collisions, damage)
- [ ] Scrolling background system
- [ ] UI elements (health, shields, score)
- [ ] Procedural sector generation
- [ ] Choice and upgrade system

See the [project plan](project-plan.md) for more details on the development roadmap.

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
