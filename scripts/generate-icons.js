const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp kütüphanesi gerekli. Lütfen kurun: npm install sharp');
  process.exit(1);
}

// Logo dosyasının yolu
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo.png');

// Icon boyutları
const ICON_SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png', type: 'favicon' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png', type: 'apple' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Shortcut icon'ları
const SHORTCUT_ICONS = [
  { name: 'jobs-shortcut.png', color: '#3b82f6', letter: 'J' },
  { name: 'marketplace-shortcut.png', color: '#10b981', letter: 'M' },
  { name: 'messages-shortcut.png', color: '#f59e0b', letter: '💬' },
  { name: 'dashboard-shortcut.png', color: '#8b5cf6', letter: 'D' },
];

// Diğer icon'lar
const OTHER_ICONS = [
  { name: 'notification-icon.png', size: 192, type: 'notification' },
  { name: 'badge-icon.png', size: 72, type: 'badge' },
  { name: 'view-icon.png', size: 32, type: 'action' },
  { name: 'close-icon.png', size: 32, type: 'action' },
];

// SVG icon oluşturma fonksiyonu
function createSVGIcon(
  size,
  text = 'M',
  bgColor = '#2563eb',
  textColor = '#ffffff'
) {
  const fontSize = size > 100 ? Math.floor(size * 0.5) : Math.floor(size * 0.6);
  const strokeWidth = size > 100 ? 2 : 1;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -20)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.15)}" fill="url(#grad1)" stroke="${adjustBrightness(bgColor, -30)}" stroke-width="${strokeWidth}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${text}</text>
</svg>`;
}

// Renk parlaklığını ayarlama
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

// PNG'ye dönüştürme için Sharp kullanımı
async function generateIcon(size, filename, text = 'M', bgColor = '#2563eb') {
  const svg = createSVGIcon(size, text, bgColor);
  const outputPath = path.join(__dirname, '..', 'public', 'icons', filename);

  if (sharp) {
    try {
      // SVG'yi PNG'ye dönüştür
      await sharp(Buffer.from(svg)).png().toFile(outputPath);
      console.log(`Generated PNG: ${filename} (${size}x${size})`);
    } catch (error) {
      console.log(`Failed to generate PNG for ${filename}, saving as SVG`);
      // SVG fallback
      const svgFilename = filename.replace('.png', '.svg');
      const svgPath = path.join(
        __dirname,
        '..',
        'public',
        'icons',
        svgFilename
      );
      fs.writeFileSync(svgPath, svg, 'utf8');
    }
  } else {
    // SVG fallback
    const svgFilename = filename.replace('.png', '.svg');
    const svgPath = path.join(__dirname, '..', 'public', 'icons', svgFilename);
    fs.writeFileSync(svgPath, svg, 'utf8');
    console.log(`Generated SVG: ${svgFilename} (${size}x${size})`);
  }
}

// Favicon.ico oluşturma
async function generateFavicon() {
  const faviconSVG = createSVGIcon(32, 'M', '#2563eb');
  const faviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');
  fs.writeFileSync(faviconPath, faviconSVG, 'utf8');

  if (sharp) {
    try {
      // ICO dosyası oluştur
      const icoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
      await sharp(Buffer.from(faviconSVG)).resize(32, 32).png().toFile(icoPath);
      console.log('Generated: favicon.ico and favicon.svg');
    } catch (error) {
      console.log('Failed to generate favicon.ico, using SVG only');
    }
  } else {
    console.log('Generated: favicon.svg (ICO requires Sharp)');
  }
}

// Ana icon oluşturma
async function generateMainIcons() {
  console.log('Generating main app icons...');

  for (const { size, name, type } of ICON_SIZES) {
    let text = 'M';
    let bgColor = '#2563eb';

    if (type === 'apple') {
      bgColor = '#000000'; // Apple icons için siyah arkaplan
    }

    await generateIcon(size, name, text, bgColor);
  }
}

// Shortcut icon'ları oluşturma
async function generateShortcutIcons() {
  console.log('Generating shortcut icons...');

  for (const { name, color, letter } of SHORTCUT_ICONS) {
    await generateIcon(96, name, letter, color);
  }
}

// Diğer icon'ları oluşturma
async function generateOtherIcons() {
  console.log('Generating other icons...');

  for (const { name, size, type } of OTHER_ICONS) {
    let text = 'M';
    let bgColor = '#2563eb';

    switch (type) {
      case 'notification':
        text = '🔔';
        bgColor = '#f59e0b';
        break;
      case 'badge':
        text = 'M';
        bgColor = '#dc2626';
        break;
      case 'action':
        if (name.includes('view')) {
          text = '👁';
          bgColor = '#10b981';
        } else if (name.includes('close')) {
          text = '✕';
          bgColor = '#ef4444';
        }
        break;
    }

    await generateIcon(size, name, text, bgColor);
  }
}

// Ana çalıştırma fonksiyonu
async function main() {
  console.log('🎨 Marifeto Icon Generator');
  console.log('==========================');

  // Icons klasörünü oluştur
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  try {
    await generateFavicon();
    await generateMainIcons();
    await generateShortcutIcons();
    await generateOtherIcons();

    console.log("\n✅ Tüm icon'lar başarıyla oluşturuldu!");

    if (sharp) {
      console.log("\n🎉 PNG formatında production-ready icon'lar hazır!");
    } else {
      console.log(
        "\n📝 SVG formatında icon'lar oluşturuldu. PNG için Sharp kurulum gerekiyor."
      );
    }
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateIcon,
  generateFavicon,
  createSVGIcon,
};
