/**
 * Simple Build Script for STELLAR ROGUE
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Read version from index.html
let version = 'v0.5.0 Beta';
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    const versionMatch = indexHtml.match(/<div id="version">(.*?)<\/div>/);
    if (versionMatch && versionMatch[1]) {
        version = versionMatch[1].trim();
    }
} catch (error) {
    console.warn('Could not read version from index.html:', error);
}

// Create build directory if it doesn't exist
const buildDir = './build';
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Create web directory
const webDir = path.join(buildDir, `stellar-rogue-${version}-web`);
if (fs.existsSync(webDir)) {
    fs.rmSync(webDir, { recursive: true });
}
fs.mkdirSync(webDir, { recursive: true });

// Copy files
console.log('Copying files to web directory...');

// Copy index.html
fs.copyFileSync('index.html', path.join(webDir, 'index.html'));

// Copy documentation files
const docFiles = ['README.md', 'player-guide.md', 'release-notes.md', 'roadmap.md', 'testing-plan.md'];
docFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(webDir, file));
    }
});

// Copy src directory
console.log('Copying src directory...');
copyDirectory('src', path.join(webDir, 'src'));

// Copy assets directory if it exists
if (fs.existsSync('assets')) {
    console.log('Copying assets directory...');
    copyDirectory('assets', path.join(webDir, 'assets'));
}

// Create ZIP archive
console.log('Creating ZIP archive...');
const zipPath = path.join(buildDir, `stellar-rogue-${version}.zip`);
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
    console.log(`ZIP archive created: ${zipPath}`);
    console.log(`Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\nBuild completed successfully!');
    console.log(`Web directory: ${webDir}`);
    console.log(`ZIP archive: ${zipPath}`);
});

archive.on('error', (err) => {
    console.error('Error creating ZIP archive:', err);
});

archive.pipe(output);
archive.directory(webDir, false);
archive.finalize();

/**
 * Copy a directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDirectory(src, dest) {
    // Create destination directory
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    // Get all files and directories in the source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    // Copy each entry
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            // Recursively copy directory
            copyDirectory(srcPath, destPath);
        } else {
            // Copy file
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
