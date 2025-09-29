const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp kütüphanesi gerekli. Lütfen kurun: npm install sharp');
  process.exit(1);
}

// Orjinal icon dosyasının yolu
const ORIGINAL_ICON_PATH = path.join(__dirname, '..', 'public', 'mf-icon.png');

// Icon boyutları ve hedef dosyalar
const ICON_CONFIGS = [
  // Favicon boyutları
  { size: 16, name: 'favicon-16x16.png', type: 'favicon' },
  { size: 32, name: 'favicon-32x32.png', type: 'favicon' },

  // PWA ve manifest icon'ları
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

  // Diğer boyutlar
  { size: 64, name: 'favicon.png', type: 'favicon' },
];

// Shortcut icon'ları için özel renkler
const SHORTCUT_CONFIGS = [
  {
    name: 'jobs-shortcut.png',
    size: 96,
    overlay: {
      text: 'İş',
      bg: 'rgba(59, 130, 246, 0.8)', // blue
      position: 'bottom',
    },
  },
  {
    name: 'marketplace-shortcut.png',
    size: 96,
    overlay: {
      text: 'MP',
      bg: 'rgba(16, 185, 129, 0.8)', // green
      position: 'bottom',
    },
  },
  {
    name: 'messages-shortcut.png',
    size: 96,
    overlay: {
      text: '💬',
      bg: 'rgba(245, 158, 11, 0.8)', // yellow
      position: 'bottom',
    },
  },
  {
    name: 'dashboard-shortcut.png',
    size: 96,
    overlay: {
      text: 'Panel',
      bg: 'rgba(139, 92, 246, 0.8)', // purple
      position: 'bottom',
    },
  },
];

// Diğer özel icon'lar
const SPECIAL_ICONS = [
  { name: 'notification-icon.png', size: 192 },
  { name: 'badge-icon.png', size: 72 },
  { name: 'view-icon.png', size: 32 },
  { name: 'close-icon.png', size: 32 },
];

// Ana icon'u belirtilen boyuta resize etme
async function resizeOriginalIcon(size, outputPath, options = {}) {
  if (!fs.existsSync(ORIGINAL_ICON_PATH)) {
    throw new Error(`Orjinal icon dosyası bulunamadı: ${ORIGINAL_ICON_PATH}`);
  }

  let pipeline = sharp(ORIGINAL_ICON_PATH).resize(size, size, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }, // Şeffaf arkaplan
  });

  // Apple icon'ları için özel işlemler
  if (options.type === 'apple') {
    // Apple touch icon'ları için köşeleri yuvarlaklaştır
    pipeline = pipeline.composite([
      {
        input: await createRoundedCornersMask(size, size * 0.2),
        blend: 'dest-in',
      },
    ]);
  }

  // Favicon için özel işlemler
  if (options.type === 'favicon') {
    pipeline = pipeline.png({
      quality: 100,
      compressionLevel: 9,
      palette: true,
    });
  } else {
    pipeline = pipeline.png({ quality: 95 });
  }

  await pipeline.toFile(outputPath);
}

// Shortcut icon'ları için overlay ekleme
async function createShortcutIcon(config) {
  const outputPath = path.join(__dirname, '..', 'public', 'icons', config.name);

  // Ana icon'u resize et
  const baseIcon = await sharp(ORIGINAL_ICON_PATH)
    .resize(config.size, config.size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Overlay için SVG oluştur
  const overlayHeight = Math.floor(config.size * 0.3);
  const fontSize = Math.floor(overlayHeight * 0.5);

  const svgOverlay = `
    <svg width="${config.size}" height="${config.size}">
      <rect 
        x="0" 
        y="${config.size - overlayHeight}" 
        width="${config.size}" 
        height="${overlayHeight}" 
        fill="${config.overlay.bg}" 
        rx="4"
      />
      <text 
        x="${config.size / 2}" 
        y="${config.size - overlayHeight / 2}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central"
      >${config.overlay.text}</text>
    </svg>
  `;

  // Base icon ile overlay'i birleştir
  await sharp(baseIcon)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        blend: 'over',
      },
    ])
    .png()
    .toFile(outputPath);
}

// Yuvarlatılmış köşeler için mask oluşturma
async function createRoundedCornersMask(width, radius) {
  const svg = `
    <svg width="${width}" height="${width}">
      <rect x="0" y="0" width="${width}" height="${width}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>
  `;
  return Buffer.from(svg);
}

// Favicon.ico oluşturma
async function generateFavicon() {
  const faviconIcoPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  const faviconSvgPath = path.join(__dirname, '..', 'public', 'favicon.svg');

  try {
    // ICO formatında favicon oluştur (16x16 ve 32x32 boyutları içeren)
    const icon16 = await sharp(ORIGINAL_ICON_PATH)
      .resize(16, 16)
      .png()
      .toBuffer();

    const icon32 = await sharp(ORIGINAL_ICON_PATH)
      .resize(32, 32)
      .png()
      .toBuffer();

    // Sharp ile ICO oluşturamadığımız için PNG formatında 32x32 olarak kaydet
    await sharp(icon32).toFile(faviconIcoPath.replace('.ico', '.png'));

    // SVG formatında da kaydet
    const svgContent = await convertToSVG(32);
    fs.writeFileSync(faviconSvgPath, svgContent, 'utf8');

    console.log('Generated: favicon.ico (as PNG) and favicon.svg');
  } catch (error) {
    console.error('Favicon oluşturulurken hata:', error.message);
  }
}

// PNG'yi SVG'ye dönüştürme (base64 olarak embed etme)
async function convertToSVG(size) {
  const pngBuffer = await sharp(ORIGINAL_ICON_PATH)
    .resize(size, size)
    .png()
    .toBuffer();

  const base64 = pngBuffer.toString('base64');

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <image href="data:image/png;base64,${base64}" width="${size}" height="${size}"/>
  </svg>`;
}

// Ana icon'ları oluşturma
async function generateMainIcons() {
  console.log("Orjinal icon dosyasından ana icon'lar oluşturuluyor...");

  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const config of ICON_CONFIGS) {
    const outputPath = path.join(iconsDir, config.name);

    try {
      await resizeOriginalIcon(config.size, outputPath, config);
      console.log(
        `✅ Generated: ${config.name} (${config.size}x${config.size})`
      );
    } catch (error) {
      console.error(`❌ ${config.name} oluşturulamadı:`, error.message);
    }
  }
}

// Shortcut icon'larını oluşturma
async function generateShortcutIcons() {
  console.log("Shortcut icon'ları oluşturuluyor...");

  for (const config of SHORTCUT_CONFIGS) {
    try {
      await createShortcutIcon(config);
      console.log(
        `✅ Generated: ${config.name} (${config.size}x${config.size} with overlay)`
      );
    } catch (error) {
      console.error(`❌ ${config.name} oluşturulamadı:`, error.message);
    }
  }
}

// Özel icon'ları oluşturma
async function generateSpecialIcons() {
  console.log("Özel icon'lar oluşturuluyor...");

  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  for (const config of SPECIAL_ICONS) {
    const outputPath = path.join(iconsDir, config.name);

    try {
      await resizeOriginalIcon(config.size, outputPath);
      console.log(
        `✅ Generated: ${config.name} (${config.size}x${config.size})`
      );
    } catch (error) {
      console.error(`❌ ${config.name} oluşturulamadı:`, error.message);
    }
  }
}

// Ana çalıştırma fonksiyonu
async function main() {
  console.log("🎨 MarifetBul - Orjinal Icon'dan Icon Generator");
  console.log('===============================================');
  console.log(`📁 Kaynak dosya: ${ORIGINAL_ICON_PATH}`);

  // Orjinal dosyanın var olup olmadığını kontrol et
  if (!fs.existsSync(ORIGINAL_ICON_PATH)) {
    console.error(`❌ Orjinal icon dosyası bulunamadı: ${ORIGINAL_ICON_PATH}`);
    console.log(
      'Lütfen public/mf-icon.png dosyasının var olduğundan emin olun.'
    );
    process.exit(1);
  }

  // Dosya boyutunu kontrol et
  const stats = fs.statSync(ORIGINAL_ICON_PATH);
  console.log(`📊 Orjinal dosya boyutu: ${(stats.size / 1024).toFixed(2)} KB`);

  try {
    await generateFavicon();
    await generateMainIcons();
    await generateShortcutIcons();
    await generateSpecialIcons();

    console.log("\n🎉 Tüm icon'lar orjinal dosyadan başarıyla oluşturuldu!");
    console.log("📱 PWA manifest icon'ları hazır");
    console.log('🌐 Favicon dosyaları güncellendi');
    console.log("⚡ Shortcut icon'ları overlay ile oluşturuldu");
  } catch (error) {
    console.error('❌ Ana hata:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  resizeOriginalIcon,
  createShortcutIcon,
  generateMainIcons,
  generateShortcutIcons,
  generateSpecialIcons,
};
