const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error(
    '❌ Sharp kütüphanesi gerekli. Lütfen kurun: npm install sharp'
  );
  process.exit(1);
}

// Logo dosyasının yolu
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo.png');

// Logo dosyasının varlığını kontrol et
if (!fs.existsSync(LOGO_PATH)) {
  console.error('❌ Logo dosyası bulunamadı:', LOGO_PATH);
  process.exit(1);
}

// Icon boyutları ve konfigürasyonları
const ICON_CONFIGS = [
  // Favicon'lar
  { size: 16, name: 'favicon-16x16.png', padding: 0.1 },
  { size: 32, name: 'favicon-32x32.png', padding: 0.1 },

  // PWA Ana icon'ları
  { size: 48, name: 'icon-48x48.png', padding: 0.05 },
  { size: 72, name: 'icon-72x72.png', padding: 0.05 },
  { size: 96, name: 'icon-96x96.png', padding: 0.05 },
  { size: 128, name: 'icon-128x128.png', padding: 0.05 },
  { size: 144, name: 'icon-144x144.png', padding: 0.05 },
  { size: 152, name: 'icon-152x152.png', padding: 0.05 },
  { size: 192, name: 'icon-192x192.png', padding: 0.05 },
  { size: 384, name: 'icon-384x384.png', padding: 0.05 },
  { size: 512, name: 'icon-512x512.png', padding: 0.05 },

  // Apple Touch Icon
  {
    size: 180,
    name: 'apple-touch-icon.png',
    padding: 0.1,
    background: '#ffffff',
  },

  // PWA Shortcut Icons (logo üzerinde badge ile)
  {
    size: 96,
    name: 'jobs-shortcut.png',
    overlay: 'J',
    overlayColor: '#3b82f6',
  },
  {
    size: 96,
    name: 'marketplace-shortcut.png',
    overlay: 'M',
    overlayColor: '#10b981',
  },
  {
    size: 96,
    name: 'messages-shortcut.png',
    overlay: '💬',
    overlayColor: '#f59e0b',
  },
  {
    size: 96,
    name: 'dashboard-shortcut.png',
    overlay: 'D',
    overlayColor: '#8b5cf6',
  },

  // Service Worker Icons
  { size: 192, name: 'notification-icon.png', padding: 0.1 },
  { size: 72, name: 'badge-icon.png', padding: 0.15, background: '#dc2626' },
  { size: 32, name: 'view-icon.png', padding: 0.1 },
  { size: 32, name: 'close-icon.png', padding: 0.1 },
];

// Logo'dan icon oluşturma fonksiyonu
async function generateIconFromLogo(config) {
  try {
    const {
      size,
      name,
      padding = 0,
      background,
      overlay,
      overlayColor,
    } = config;
    const outputPath = path.join(__dirname, '..', 'public', 'icons', name);

    console.log(`🔄 Generating ${name} (${size}x${size})...`);

    // Ana logo'yu yükle ve boyutlandır
    let logoSize = size;
    if (padding > 0) {
      logoSize = Math.floor(size * (1 - padding * 2));
    }

    let pipeline = sharp(LOGO_PATH).resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    // Eğer padding varsa, logo'yu merkeze yerleştir
    if (padding > 0) {
      const paddingPx = Math.floor(size * padding);
      pipeline = pipeline.extend({
        top: paddingPx,
        bottom: paddingPx,
        left: paddingPx,
        right: paddingPx,
        background: background
          ? parseColor(background)
          : { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    // Eğer overlay (badge) varsa ekle
    if (overlay && overlayColor) {
      const badgeSize = Math.floor(size * 0.4);
      const badgeSVG = createBadgeSVG(badgeSize, overlay, overlayColor);

      pipeline = pipeline.composite([
        {
          input: Buffer.from(badgeSVG),
          gravity: 'southeast',
        },
      ]);
    }

    // Background color uygula
    if (background && !padding) {
      pipeline = pipeline.flatten({ background: parseColor(background) });
    }

    await pipeline.png().toFile(outputPath);
    console.log(`✅ Generated: ${name}`);
  } catch (error) {
    console.error(`❌ Error generating ${config.name}:`, error.message);
  }
}

// Badge SVG oluşturma
function createBadgeSVG(size, text, bgColor) {
  const fontSize = Math.floor(size * 0.5);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${bgColor}" stroke="#ffffff" stroke-width="2"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
          fill="#ffffff" text-anchor="middle" dominant-baseline="central">${text}</text>
  </svg>`;
}

// Renk parsing fonksiyonu
function parseColor(color) {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b, alpha: 1 };
  }

  // Öntanımlı renkler
  const colors = {
    white: { r: 255, g: 255, b: 255, alpha: 1 },
    black: { r: 0, g: 0, b: 0, alpha: 1 },
    transparent: { r: 0, g: 0, b: 0, alpha: 0 },
  };

  return colors[color] || { r: 0, g: 0, b: 0, alpha: 0 };
}

// Favicon.ico oluşturma
async function generateFavicon() {
  try {
    console.log('🔄 Generating favicon.ico...');

    const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');

    // 32x32 favicon oluştur
    await sharp(LOGO_PATH)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(faviconPath);

    console.log('✅ Generated: favicon.ico');

    // SVG favicon de oluştur
    const faviconSVGPath = path.join(__dirname, '..', 'public', 'favicon.svg');
    await sharp(LOGO_PATH)
      .resize(32, 32, { fit: 'contain' })
      .svg()
      .toFile(faviconSVGPath);

    console.log('✅ Generated: favicon.svg');
  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
  }
}

// Ana çalıştırma fonksiyonu
async function main() {
  console.log('🎨 Marifeto Icon Generator (Logo-based)');
  console.log('=====================================');
  console.log(`📁 Using logo: ${LOGO_PATH}`);

  // Icons klasörünü oluştur
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('📁 Created icons directory');
  }

  try {
    // Logo dosyasının bilgilerini al
    const logoInfo = await sharp(LOGO_PATH).metadata();
    console.log(
      `📊 Logo info: ${logoInfo.width}x${logoInfo.height}, ${logoInfo.format}`
    );

    // Favicon oluştur
    await generateFavicon();

    // Tüm icon'ları oluştur
    console.log('\n📱 Generating PWA icons...');
    for (const config of ICON_CONFIGS) {
      await generateIconFromLogo(config);
    }

    console.log("\n✅ Tüm icon'lar başarıyla oluşturuldu!");
    console.log("🎉 Logo.png'den production-ready icon'lar hazır!");

    // Icon listesini göster
    console.log("\n📋 Oluşturulan icon'lar:");
    const iconFiles = fs.readdirSync(iconsDir);
    iconFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateIconFromLogo,
  generateFavicon,
  main,
};
