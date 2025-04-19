/**
 * STELLAR ROGUE Build Script
 * Simple Node.js script to package the game for release
 *
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Configuration
const config = {
    // Source directory (current directory)
    sourceDir: '.',

    // Output directory for builds
    outputDir: './build',

    // Files and directories to include
    include: [
        'index.html',
        'src/**/*',
        'assets/**/*',
        'README.md',
        'player-guide.md',
        'release-notes.md',
        'roadmap.md',
        'testing-plan.md'
    ],

    // Files and directories to exclude
    exclude: [
        'node_modules/**',
        '.git/**',
        'build/**',
        '**/*.log',
        '**/.DS_Store',
        '**/Thumbs.db'
    ],

    // Version (read from index.html)
    version: 'v0.0.0'
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
}

// Read version from index.html
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    const versionMatch = indexHtml.match(/<div id="version">(.*?)<\/div>/);
    if (versionMatch && versionMatch[1]) {
        config.version = versionMatch[1].trim();
    }
} catch (error) {
    console.warn('Could not read version from index.html:', error);
}

// Function to check if a file should be included
function shouldInclude(filePath) {
    // Always include these critical directories
    if (filePath.startsWith('src/') || filePath === 'src' || filePath === 'index.html') {
        return true;
    }

    // Check if file matches any include pattern
    const isIncluded = config.include.some(pattern => {
        if (pattern.includes('*')) {
            // Handle wildcard patterns
            const regexPattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*');
            return new RegExp(`^${regexPattern}$`).test(filePath);
        } else {
            // Handle exact matches or directory matches
            return filePath === pattern || filePath.startsWith(pattern + '/');
        }
    });

    // Check if file matches any exclude pattern
    const isExcluded = config.exclude.some(pattern => {
        if (pattern.includes('*')) {
            // Handle wildcard patterns
            const regexPattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*');
            return new RegExp(`^${regexPattern}$`).test(filePath);
        } else {
            // Handle exact matches or directory matches
            return filePath === pattern || filePath.startsWith(pattern + '/');
        }
    });

    return isIncluded && !isExcluded;
}

// Function to create a zip archive
function createZipArchive() {
    return new Promise((resolve, reject) => {
        console.log('Creating ZIP archive...');

        const outputPath = path.join(config.outputDir, `stellar-rogue-${config.version}.zip`);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            console.log(`ZIP archive created: ${outputPath}`);
            console.log(`Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
            resolve(outputPath);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // Walk through directory and add files
        function walkDir(dir, baseDir = '') {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(baseDir, entry.name);

                if (entry.isDirectory()) {
                    // Recursively walk subdirectories
                    walkDir(fullPath, relativePath);
                } else if (shouldInclude(relativePath)) {
                    // Add file to archive
                    archive.file(fullPath, { name: relativePath });
                }
            }
        }

        walkDir(config.sourceDir);

        archive.finalize();
    });
}

// Function to create a web-ready directory
function createWebDirectory() {
    return new Promise((resolve, reject) => {
        console.log('Creating web-ready directory...');

        const outputPath = path.join(config.outputDir, `stellar-rogue-${config.version}-web`);

        // Create or clean output directory
        if (fs.existsSync(outputPath)) {
            fs.rmSync(outputPath, { recursive: true, force: true });
        }
        fs.mkdirSync(outputPath, { recursive: true });

        // Walk through directory and copy files
        function walkDir(dir, baseDir = '') {
            // Special handling for src directory
            if (dir === 'src' || dir.startsWith('src/') || dir.startsWith('src\\')) {
                console.log(`Processing source directory: ${dir}`);
                // Always include src directory
                const outputDirPath = path.join(outputPath, baseDir);
                if (!fs.existsSync(outputDirPath)) {
                    fs.mkdirSync(outputDirPath, { recursive: true });
                }
            }

            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.join(baseDir, entry.name);
                    const outputFilePath = path.join(outputPath, relativePath);

                    if (entry.isDirectory()) {
                        // Create directory if it doesn't exist
                        if (shouldInclude(relativePath)) {
                            if (!fs.existsSync(outputFilePath)) {
                                fs.mkdirSync(outputFilePath, { recursive: true });
                            }
                            // Recursively walk subdirectories
                            walkDir(fullPath, relativePath);
                        }
                    } else if (shouldInclude(relativePath)) {
                        // Copy file
                        fs.copyFileSync(fullPath, outputFilePath);
                    }
                }
            } catch (error) {
                console.error(`Error processing directory ${dir}:`, error);
            }
        }

        walkDir(config.sourceDir);

        console.log(`Web-ready directory created: ${outputPath}`);
        resolve(outputPath);
    });
}

// Main build function
async function build() {
    console.log(`Starting build process for STELLAR ROGUE ${config.version}...`);

    try {
        // Create ZIP archive
        const zipPath = await createZipArchive();

        // Create web-ready directory
        const webPath = await createWebDirectory();

        console.log('\nBuild completed successfully!');
        console.log(`ZIP archive: ${zipPath}`);
        console.log(`Web directory: ${webPath}`);

        // Suggest next steps
        console.log('\nNext steps:');
        console.log('1. Test the game in the web directory');
        console.log('2. Upload the ZIP file or web directory to your hosting provider');
        console.log('3. Share the game with players!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Run the build
build();
