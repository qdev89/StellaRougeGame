/**
 * Debug utilities for testing the Nemesis System
 * This file contains functions to simulate boss defeats and test the Nemesis boss
 */

// Debug function to simulate boss defeats
function simulateBossDefeats() {
    // Create game instance if it doesn't exist
    if (!window.game || !window.game.global) {
        console.error('Game instance not found. Make sure the game is initialized.');
        return;
    }
    
    // Initialize Nemesis System if it doesn't exist
    if (!window.game.global.nemesisSystem) {
        window.game.global.nemesisSystem = new NemesisSystem(window.game);
    }
    
    // Simulate defeating various bosses with different weapons and build styles
    const nemesisSystem = window.game.global.nemesisSystem;
    
    // Simulate defeating the Scout Commander with laser weapons and offensive build
    nemesisSystem.recordBossDefeat('SCOUT_COMMANDER', {
        dominantWeapon: 'laser',
        buildType: 'offensive',
        timeToDefeat: 120000,
        weaponUsage: {
            laser: 50,
            triBeam: 10,
            plasmaBolt: 5,
            homingMissile: 0,
            dualCannon: 0,
            beamLaser: 0,
            scatterBomb: 0
        },
        buildStyle: {
            offensive: 3,
            defensive: 1,
            utility: 0,
            balanced: 1
        }
    });
    
    // Simulate defeating the Battle Carrier with homing missiles and balanced build
    nemesisSystem.recordBossDefeat('BATTLE_CARRIER', {
        dominantWeapon: 'homingMissile',
        buildType: 'balanced',
        timeToDefeat: 180000,
        weaponUsage: {
            laser: 10,
            triBeam: 5,
            plasmaBolt: 0,
            homingMissile: 40,
            dualCannon: 0,
            beamLaser: 0,
            scatterBomb: 5
        },
        buildStyle: {
            offensive: 1,
            defensive: 1,
            utility: 1,
            balanced: 2
        }
    });
    
    // Simulate defeating the Destroyer Prime with beam laser and defensive build
    nemesisSystem.recordBossDefeat('DESTROYER_PRIME', {
        dominantWeapon: 'beamLaser',
        buildType: 'defensive',
        timeToDefeat: 240000,
        weaponUsage: {
            laser: 5,
            triBeam: 0,
            plasmaBolt: 0,
            homingMissile: 10,
            dualCannon: 0,
            beamLaser: 60,
            scatterBomb: 0
        },
        buildStyle: {
            offensive: 0,
            defensive: 4,
            utility: 1,
            balanced: 0
        }
    });
    
    // Simulate defeating the Stealth Overlord with scatter bombs and utility build
    nemesisSystem.recordBossDefeat('STEALTH_OVERLORD', {
        dominantWeapon: 'scatterBomb',
        buildType: 'utility',
        timeToDefeat: 210000,
        weaponUsage: {
            laser: 5,
            triBeam: 0,
            plasmaBolt: 0,
            homingMissile: 0,
            dualCannon: 10,
            beamLaser: 0,
            scatterBomb: 45
        },
        buildStyle: {
            offensive: 1,
            defensive: 0,
            utility: 3,
            balanced: 1
        }
    });
    
    // Simulate defeating the Dreadnought with plasma bolts and offensive build
    nemesisSystem.recordBossDefeat('DREADNOUGHT', {
        dominantWeapon: 'plasmaBolt',
        buildType: 'offensive',
        timeToDefeat: 300000,
        weaponUsage: {
            laser: 0,
            triBeam: 10,
            plasmaBolt: 70,
            homingMissile: 0,
            dualCannon: 0,
            beamLaser: 0,
            scatterBomb: 0
        },
        buildStyle: {
            offensive: 5,
            defensive: 0,
            utility: 0,
            balanced: 0
        }
    });
    
    // Log the updated nemesis data
    console.log('Simulated boss defeats recorded:');
    console.log(window.game.global.nemesisSystem.game.global.nemesisData);
    
    return 'Boss defeats simulated successfully!';
}

// Debug function to jump directly to the Nemesis boss fight
function jumpToNemesisBoss() {
    // Make sure the game is initialized
    if (!window.game) {
        console.error('Game instance not found. Make sure the game is initialized.');
        return;
    }
    
    // First simulate boss defeats to have data for the Nemesis
    simulateBossDefeats();
    
    // Start the game scene with sector 10 (final boss)
    window.game.scene.start('GameScene', {
        sector: 10,
        score: 50000,
        nodeType: 'BOSS'
    });
    
    return 'Jumped to Nemesis boss fight!';
}

// Debug function to generate and display Nemesis configuration
function showNemesisConfig() {
    // Make sure the game and nemesis system are initialized
    if (!window.game || !window.game.global || !window.game.global.nemesisSystem) {
        console.error('Game or Nemesis System not found. Run simulateBossDefeats() first.');
        return;
    }
    
    // Generate Nemesis configuration
    const nemesisConfig = window.game.global.nemesisSystem.generateNemesisConfig();
    
    // Log the configuration
    console.log('Nemesis Configuration:');
    console.log(nemesisConfig);
    
    // Display a more readable summary
    console.log('\nNemesis Summary:');
    console.log(`Health: ${nemesisConfig.health}`);
    console.log(`Phases: ${nemesisConfig.phases}`);
    console.log(`Phase Thresholds: ${nemesisConfig.phaseThresholds.join(', ')}`);
    console.log('Resistances:');
    Object.entries(nemesisConfig.resistances).forEach(([weapon, value]) => {
        if (value > 0) {
            console.log(`  ${weapon}: ${value * 100}%`);
        }
    });
    console.log('Attack Patterns:');
    nemesisConfig.attackPatterns.forEach(pattern => {
        console.log(`  ${pattern}`);
    });
    console.log('Appearance:');
    console.log(`  Base Color: ${nemesisConfig.appearance.baseColor}`);
    console.log(`  Highlights: ${nemesisConfig.appearance.highlights.join(', ')}`);
    console.log(`  Parts: ${nemesisConfig.appearance.parts.join(', ')}`);
    
    return 'Nemesis configuration displayed in console.';
}

// Debug function to reset the Nemesis System
function resetNemesisSystem() {
    // Make sure the game and nemesis system are initialized
    if (!window.game || !window.game.global) {
        console.error('Game instance not found. Make sure the game is initialized.');
        return;
    }
    
    // Initialize Nemesis System if it doesn't exist
    if (!window.game.global.nemesisSystem) {
        window.game.global.nemesisSystem = new NemesisSystem(window.game);
    }
    
    // Reset the nemesis data
    window.game.global.nemesisSystem.resetNemesisData();
    
    console.log('Nemesis System reset successfully!');
    console.log(window.game.global.nemesisSystem.game.global.nemesisData);
    
    return 'Nemesis System reset complete.';
}

// Add debug functions to window for console access
if (typeof window !== 'undefined') {
    window.simulateBossDefeats = simulateBossDefeats;
    window.jumpToNemesisBoss = jumpToNemesisBoss;
    window.showNemesisConfig = showNemesisConfig;
    window.resetNemesisSystem = resetNemesisSystem;
    
    console.log('Nemesis debug functions loaded. Available commands:');
    console.log('- simulateBossDefeats(): Simulate defeating all bosses');
    console.log('- jumpToNemesisBoss(): Jump directly to the Nemesis boss fight');
    console.log('- showNemesisConfig(): Show the current Nemesis configuration');
    console.log('- resetNemesisSystem(): Reset the Nemesis System data');
}
