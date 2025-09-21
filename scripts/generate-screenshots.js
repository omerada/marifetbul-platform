const fs = require('fs');
const path = require('path');

// Sharp'ı yükle
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp kütüphanesi gerekli. Lütfen kurun: npm install sharp');
  process.exit(1);
}

// Screenshot konfigürasyonları
const SCREENSHOTS = [
  {
    name: 'desktop-1.png',
    width: 1280,
    height: 720,
    title: 'MarifetBul Ana Sayfa',
    subtitle: 'Freelancer ve İşverenler İçin Platform',
    bgColor: '#f8fafc',
    accentColor: '#2563eb',
  },
  {
    name: 'mobile-1.png',
    width: 360,
    height: 640,
    title: 'Mobil Deneyim',
    subtitle: 'Her Yerde Erişilebilir',
    bgColor: '#f1f5f9',
    accentColor: '#10b981',
  },
  {
    name: 'dashboard-1.png',
    width: 1280,
    height: 720,
    title: 'Dashboard Görünümü',
    subtitle: 'İş ve Proje Yönetimi',
    bgColor: '#fefefe',
    accentColor: '#8b5cf6',
  },
];

// SVG screenshot mockup oluşturma
function createScreenshotSVG({
  width,
  height,
  title,
  subtitle,
  bgColor,
  accentColor,
}) {
  const titleFontSize = width > 500 ? 32 : 24;
  const subtitleFontSize = width > 500 ? 18 : 14;
  const padding = width > 500 ? 60 : 30;

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -5)};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${accentColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${adjustBrightness(accentColor, 20)};stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#bgGradient)"/>
    
    <!-- Header bar -->
    <rect x="0" y="0" width="100%" height="${width > 500 ? 80 : 60}" fill="url(#accentGradient)"/>
    
    <!-- Logo area -->
    <circle cx="${padding + 20}" cy="${width > 500 ? 40 : 30}" r="15" fill="white" opacity="0.9"/>
    <text x="${padding + 50}" y="${width > 500 ? 50 : 38}" font-family="system-ui, -apple-system, sans-serif" 
          font-size="18" font-weight="bold" fill="white">MarifetBul</text>
    
    <!-- Content area -->
    <rect x="${padding}" y="${width > 500 ? 120 : 90}" width="${width - padding * 2}" height="${width > 500 ? 120 : 80}" 
          rx="12" fill="white" opacity="0.95" stroke="${accentColor}" stroke-width="1"/>
    
    <!-- Main title -->
    <text x="${width / 2}" y="${width > 500 ? 200 : 150}" font-family="system-ui, -apple-system, sans-serif" 
          font-size="${titleFontSize}" font-weight="bold" fill="#1f2937" text-anchor="middle">${title}</text>
    
    <!-- Subtitle -->
    <text x="${width / 2}" y="${width > 500 ? 240 : 180}" font-family="system-ui, -apple-system, sans-serif" 
          font-size="${subtitleFontSize}" fill="#6b7280" text-anchor="middle">${subtitle}</text>
    
    <!-- Feature cards mockup -->
    ${createFeatureCards(width, height, padding, accentColor)}
    
    <!-- Bottom navigation for mobile -->
    ${width < 500 ? createMobileNavigation(width, height, accentColor) : ''}
  </svg>`;
}

// Feature kartları oluşturma
function createFeatureCards(width, height, padding, accentColor) {
  if (width < 500) {
    // Mobil için tek kolon
    return `
      <rect x="${padding}" y="${height - 300}" width="${width - padding * 2}" height="60" 
            rx="8" fill="white" stroke="${accentColor}" stroke-width="1" opacity="0.9"/>
      <rect x="${padding}" y="${height - 220}" width="${width - padding * 2}" height="60" 
            rx="8" fill="white" stroke="${accentColor}" stroke-width="1" opacity="0.9"/>
      <rect x="${padding}" y="${height - 140}" width="${width - padding * 2}" height="60" 
            rx="8" fill="white" stroke="${accentColor}" stroke-width="1" opacity="0.9"/>
    `;
  } else {
    // Desktop için grid
    const cardWidth = (width - padding * 2 - 40) / 3;
    return `
      <rect x="${padding}" y="${height - 200}" width="${cardWidth}" height="80" 
            rx="8" fill="white" stroke="${accentColor}" stroke-width="1" opacity="0.9"/>
      <rect x="${padding + cardWidth + 20}" y="${height - 200}" width="${cardWidth}" height="80" 
            rx="8" fill="white" stroke="${accentColor}" stroke-width="1" opacity="0.9"/>
      <rect x="${padding + (cardWidth + 20) * 2}" y="${height - 200}" width="${cardWidth}" height="80" 
            rx="8" fill="white" stroke="${accentColor}" stroke-width="1" opacity="0.9"/>
    `;
  }
}

// Mobil navigasyon oluşturma
function createMobileNavigation(width, height, accentColor) {
  return `
    <rect x="0" y="${height - 60}" width="100%" height="60" fill="${accentColor}" opacity="0.95"/>
    <circle cx="${width / 4}" cy="${height - 30}" r="12" fill="white" opacity="0.8"/>
    <circle cx="${width / 2}" cy="${height - 30}" r="12" fill="white" opacity="0.8"/>
    <circle cx="${(width * 3) / 4}" cy="${height - 30}" r="12" fill="white" opacity="0.8"/>
  `;
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

// Screenshot oluşturma
async function generateScreenshot(config) {
  const { name } = config;
  const svg = createScreenshotSVG(config);
  const outputPath = path.join(__dirname, '..', 'public', 'screenshots', name);

  try {
    await sharp(Buffer.from(svg))
      .png({ quality: 85, progressive: true })
      .toFile(outputPath);
    console.log(
      `Generated screenshot: ${name} (${config.width}x${config.height})`
    );
  } catch (error) {
    console.error(`Failed to generate ${name}:`, error.message);
  }
}

// Ana çalıştırma fonksiyonu
async function main() {
  console.log('📱 Generating PWA Screenshots');
  console.log('=============================');

  // Screenshots klasörünü oluştur
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    for (const config of SCREENSHOTS) {
      await generateScreenshot(config);
    }

    console.log("\n✅ Tüm screenshot'lar başarıyla oluşturuldu!");
    console.log('📱 PWA manifest için hazır!');
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateScreenshot, createScreenshotSVG };
