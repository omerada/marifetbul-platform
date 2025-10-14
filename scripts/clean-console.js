const fs = require('fs');
const path = require('path');

const LOGGER_IMPORT = "import { logger } from '@/lib/shared/utils/logger';";

// Dosyaları hariç tut
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'logger.ts',
  'documentation',
  '.test.ts',
  '.test.tsx',
  'route.ts', // API routes
  '/api/',
  'zod/', // Zod validation examples
  'example',
];

// Console pattern'leri
const CONSOLE_PATTERNS = [
  {
    regex: /console\.error\(['"`]([^'"`]+)['"`],\s*(\w+)\);/g,
    replacement: (match, msg, err) =>
      `logger.error('${msg}', ${err} instanceof Error ? ${err} : new Error(String(${err})));`,
  },
  {
    regex: /console\.error\(['"`]([^'"`]+)['"`],\s*([^)]+)\);/g,
    replacement: (match, msg, err) =>
      `logger.error('${msg}', ${err} instanceof Error ? ${err} : new Error(String(${err})));`,
  },
  {
    regex: /console\.warn\(['"`]([^'"`]+)['"`],\s*(\w+)\);/g,
    replacement: (match, msg, err) =>
      `logger.warn('${msg}', ${err} instanceof Error ? ${err} : new Error(String(${err})));`,
  },
  {
    regex: /console\.warn\(['"`]([^'"`]+)['"`]\);/g,
    replacement: (match, msg) => `logger.warn('${msg}', new Error('${msg}'));`,
  },
  {
    regex: /console\.log\(['"`]([^'"`]+)['"`],\s*([^)]+)\);/g,
    replacement: (match, msg, data) => `logger.debug('${msg}', ${data});`,
  },
  {
    regex: /console\.log\(['"`]([^'"`]+)['"`]\);/g,
    replacement: (match, msg) => `logger.debug('${msg}');`,
  },
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function hasConsole(content) {
  return /console\.(error|warn|log|info|debug)/.test(content);
}

function hasLoggerImport(content) {
  return content.includes("from '@/lib/shared/utils/logger'");
}

function addLoggerImport(content) {
  // React import sonrasına ekle
  const lines = content.split('\n');
  let importIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('import') && !lines[i].includes('type')) {
      importIndex = i;
    }
    if (lines[i].trim() === '' && importIndex >= 0) {
      break;
    }
  }

  if (importIndex >= 0) {
    lines.splice(importIndex + 1, 0, LOGGER_IMPORT);
    return lines.join('\n');
  }

  return LOGGER_IMPORT + '\n\n' + content;
}

function cleanConsole(content) {
  let cleaned = content;

  // Basit replacement'lar
  cleaned = cleaned.replace(/console\.error\(/g, 'logger.error(');
  cleaned = cleaned.replace(/console\.warn\(/g, 'logger.warn(');
  cleaned = cleaned.replace(/console\.log\(/g, 'logger.debug(');
  cleaned = cleaned.replace(/console\.info\(/g, 'logger.info(');

  return cleaned;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    if (!hasConsole(content)) {
      return { changed: false };
    }

    const originalContent = content;

    // Logger import ekle
    if (!hasLoggerImport(content)) {
      content = addLoggerImport(content);
    }

    // Console'ları temizle
    content = cleanConsole(content);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { changed: true, file: filePath };
    }

    return { changed: false };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { changed: false, error: true };
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldExclude(filePath)) {
        walkDir(filePath, fileList);
      }
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      !shouldExclude(filePath)
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Ana işlem
console.log('🚀 Console.* Temizliği Başlıyor...\n');

const targetDirs = [
  path.join(__dirname, '../components'),
  path.join(__dirname, '../hooks'),
];

let totalProcessed = 0;
let totalChanged = 0;

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) return;

  console.log(`📁 İşleniyor: ${path.basename(dir)}`);
  const files = walkDir(dir);

  files.forEach((file) => {
    const result = processFile(file);
    totalProcessed++;
    if (result.changed) {
      totalChanged++;
      console.log(`  ✅ ${path.relative(path.join(__dirname, '..'), file)}`);
    }
  });
});

console.log(`\n📊 Özet:`);
console.log(`  İşlenen: ${totalProcessed} dosya`);
console.log(`  Değiştirilen: ${totalChanged} dosya`);
console.log(`\n✨ Temizlik tamamlandı!`);
