# Nemesis System Documentation

## Overview
The Nemesis System is a dynamic boss adaptation system for Stellar Rogue. It tracks how the player defeats bosses throughout the game and uses this information to create a final boss (The Nemesis) that adapts to counter the player's preferred strategies and weapons.

## Key Features

### Boss Defeat Tracking
- Records which bosses have been defeated
- Tracks which weapons were used most frequently
- Analyzes player build style (offensive, defensive, utility, balanced)
- Measures time taken to defeat each boss

### Adaptive Final Boss
- Generates resistances to the player's most-used weapons
- Adapts attack patterns to counter the player's build style
- Incorporates visual elements from previously defeated bosses
- Features multiple phases with increasing difficulty
- Can morph between different boss forms during battle

### Persistence
- Boss defeat data is saved between game sessions
- The Nemesis becomes more challenging as more bosses are defeated
- Each playthrough creates a unique final boss experience

## Implementation Details

### Core Components
1. **NemesisSystem**: Tracks and records boss defeats, generates Nemesis configuration
2. **BossNemesis**: The actual boss entity that uses the configuration to adapt during battle

### Data Structure
The Nemesis System stores the following data:
- Defeated bosses (which ones have been defeated)
- Defeat methods (how each boss was defeated)
- Weapon usage statistics
- Build style preferences
- Number of Nemesis encounters and defeats

### Adaptation Mechanisms
- **Weapon Resistance**: Reduces damage from frequently used weapons
- **Attack Pattern Selection**: Chooses patterns that counter the player's build
- **Visual Adaptation**: Incorporates visual elements from defeated bosses
- **Phase Transitions**: Changes behavior at different health thresholds
- **Morphing**: Can temporarily take on characteristics of previous bosses

## Debug Functions
For testing purposes, the following debug functions are available in the browser console:

- `simulateBossDefeats()`: Simulates defeating all bosses with various strategies
- `jumpToNemesisBoss()`: Jumps directly to the Nemesis boss fight
- `showNemesisConfig()`: Displays the current Nemesis configuration
- `resetNemesisSystem()`: Resets all Nemesis data

## Future Enhancements
- More sophisticated adaptation algorithms
- Additional visual effects for adaptation
- Special rewards for defeating the Nemesis
- Multiple difficulty levels for the Nemesis
- Expanded morphing capabilities with more boss types
