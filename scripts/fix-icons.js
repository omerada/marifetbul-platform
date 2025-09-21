const fs = require('fs');
const path = require('path');

// Function to create a simple SVG icon
function createSVGIcon(size, text, color = '#2563eb') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}" rx="${size * 0.1}"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">
    ${text}
  </text>
</svg>`;
}

// Function to create PNG data URL from SVG
function svgToPngDataUrl(svgString, size) {
  // This is a simplified version - in a real scenario you'd use a proper SVG to PNG converter
  const base64 = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Create missing icon files
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const shortcutIcons = ['marketplace', 'messages', 'dashboard'];

// Generate main app icons
iconSizes.forEach((size) => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);

  if (!fs.existsSync(iconPath)) {
    console.log(`Creating icon-${size}x${size}.png...`);

    // Create SVG content
    const svg = createSVGIcon(size, 'M', '#2563eb');

    // For this example, we'll create a simple SVG file
    // In production, you'd want to create actual PNG files
    const svgPath = iconPath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg);

    // Create a placeholder PNG (in production, convert SVG to PNG)
    const placeholderPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(iconPath, placeholderPng);
  }
});

// Generate shortcut icons
shortcutIcons.forEach((name) => {
  const iconPath = path.join(iconsDir, `${name}-shortcut.png`);

  if (!fs.existsSync(iconPath)) {
    console.log(`Creating ${name}-shortcut.png...`);

    const iconLetter = name[0].toUpperCase();
    const svg = createSVGIcon(96, iconLetter, '#64748b');

    const svgPath = iconPath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg);

    // Create placeholder PNG
    const placeholderPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(iconPath, placeholderPng);
  }
});

// Generate additional required icons
const additionalIcons = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
];

additionalIcons.forEach(({ name, size }) => {
  const iconPath = path.join(iconsDir, name);

  if (!fs.existsSync(iconPath)) {
    console.log(`Creating ${name}...`);

    const svg = createSVGIcon(size, 'M', '#2563eb');
    const svgPath = iconPath.replace('.png', '.svg');
    fs.writeFileSync(svgPath, svg);

    const placeholderPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(iconPath, placeholderPng);
  }
});

console.log('✅ Icon generation completed!');
console.log(
  'Note: This creates placeholder PNG files. For production, use proper SVG to PNG conversion.'
);
