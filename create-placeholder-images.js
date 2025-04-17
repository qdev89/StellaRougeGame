const fs = require('fs');
const { createCanvas } = require('canvas');

// Create directory if it doesn't exist
const dir = './src/assets/images';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Function to create a simple placeholder image
function createPlaceholderImage(filename, width, height, color) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Add some text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(filename, width / 2, height / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${dir}/${filename}`, buffer);
  console.log(`Created ${filename}`);
}

// Create placeholder images for missing assets
const placeholders = [
  { name: 'powerup-flash.png', width: 32, height: 32, color: '#33FFFF' },
  { name: 'particle-blue.png', width: 8, height: 8, color: '#3333FF' },
  { name: 'star-particle.png', width: 8, height: 8, color: '#FFFFFF' },
  { name: 'bg-dust.png', width: 800, height: 600, color: '#0A0A1F' },
  { name: 'player-ship-engines.png', width: 32, height: 192, color: '#33FF33' },
  { name: 'placeholder.png', width: 64, height: 64, color: '#666666' }
];

// Create each placeholder
placeholders.forEach(p => {
  createPlaceholderImage(p.name, p.width, p.height, p.color);
});

console.log('All placeholder images created successfully!');
