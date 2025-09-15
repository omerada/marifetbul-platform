const fs = require('fs');
const path = require('path');

// Import path düzeltme kuralları
const importMappings = {
  // Store mappings
  '@/lib/store/analyticsStore': '@/lib/core/store/analyticsStore',
  '@/lib/store/search': '@/lib/core/store/search',
  '@/lib/store/seo': '@/lib/core/store/seo',
  '@/lib/store/social': '@/lib/core/store/social',
  '@/lib/store/support': '@/lib/core/store/support',
  '@/lib/store/notification': '@/lib/core/store/notification',
  '@/lib/store/auth': '@/lib/core/store/auth',
  '@/lib/store/messaging': '@/lib/core/store/messaging',
  '@/lib/store/orders': '@/lib/core/store/orders',
  '@/lib/store/admin-settings': '@/lib/core/store/admin-settings',
  '@/lib/store/admin-users': '@/lib/core/store/admin-users',
  '@/lib/store/admin-dashboard': '@/lib/core/store/admin-dashboard',
  '@/lib/store/admin-moderation': '@/lib/core/store/admin-moderation',
  '@/lib/store/profile': '@/lib/core/store/profile',
  '@/lib/store/payment': '@/lib/core/store/payment',
  '@/lib/store/reviewStore': '@/lib/core/store/reviewStore',
  '@/lib/store/reputationStore': '@/lib/core/store/reputationStore',
  '@/lib/store/unified-performance': '@/lib/core/store/unified-performance',
  '@/lib/store/chat': '@/lib/core/store/chat',
  '@/lib/store/help-center': '@/lib/core/store/help-center',
  '@/lib/store/dashboard': '@/lib/core/store/dashboard',
  '@/lib/store/advanced-search': '@/lib/core/store/advanced-search',
  '@/lib/store/optimized': '@/lib/core/store/optimized',
  '@/lib/store/domains/marketplace/marketplaceStore':
    '@/lib/core/store/domains/marketplace/marketplaceStore',
  '@/lib/store': '@/lib/core/store',

  // Types mappings
  '@/types/search': '@/types/shared/search',
  '@/types/seo': '@/types/shared/seo',
  '@/types/social': '@/types/shared/social',
  '@/types/performance': '@/types/shared/performance',
  '@/types/features/analytics': '@/types/business/features/analytics',

  // Utils mappings
  '@/lib/utils/auth': '@/lib/shared/utils/auth',
  '@/lib/utils/image-fallback': '@/lib/shared/utils/image-fallback',
  '@/lib/utils/production-deployment':
    '@/lib/shared/utils/production-deployment',
  '@/lib/utils/payment': '@/lib/shared/utils/payment',
  '@/lib/utils/fileUpload': '@/lib/shared/utils/fileUpload',
  '@/lib/utils/map-utils': '@/lib/shared/utils/map-utils',

  // Services mappings
  '@/lib/services': '@/lib/infrastructure/services',
  '@/lib/services/geocoding': '@/lib/infrastructure/services/geocoding',
  '@/lib/services/api/jobService':
    '@/lib/infrastructure/services/api/jobService',

  // API mappings
  '@/lib/api/UnifiedApiClient': '@/lib/infrastructure/api/UnifiedApiClient',
  '@/lib/api/client': '@/lib/infrastructure/api/client',

  // MSW mappings
  '@/lib/msw/data': '@/lib/infrastructure/msw/data',
  '@/lib/msw/handlers': '@/lib/infrastructure/msw/handlers',
  '../../lib/msw/browser': '../../lib/infrastructure/msw/browser',

  // Validations mappings
  '@/lib/validations/support': '@/lib/core/validations/support',
  '@/lib/validations/details': '@/lib/core/validations/details',
  '@/lib/validations/auth': '@/lib/core/validations/auth',
  '@/lib/validations/reviews': '@/lib/core/validations/reviews',
  '@/lib/validations/payment': '@/lib/core/validations/payment',
  '@/lib/validations/marketplace': '@/lib/core/validations/marketplace',
  '@/lib/validations': '@/lib/core/validations',

  // Components mappings
  '@/components/features': '@/components/shared/features',
  '@/components/seo/SEOHead': '@/components/shared/seo/SEOHead',
  '@/components/social/SocialShare': '@/components/shared/social/SocialShare',
  '@/components/performance/PerformanceMonitor':
    '@/components/shared/performance/PerformanceMonitor',

  // Hooks mappings
  '@/hooks/ui': '@/hooks/shared/ui',
  '../api': '../../infrastructure/api',

  // Animations mappings
  '@/lib/animations': '@/lib/shared/animations',

  // Relative path fixes
  '../../lib/api/UnifiedApiClient':
    '../../../lib/infrastructure/api/UnifiedApiClient',
  '../base': '../../shared/base',
  '../core/useUnifiedAsync': '../../core/useUnifiedAsync',
  '../core/useToast': '../../core/useToast',
  '../../store/auth': '../../core/store/auth',
  '../../store/notification': '../../core/store/notification',
  '../../services/base': '../../infrastructure/services/base',
  '../lib/utils/production-deployment': '../shared/utils/production-deployment',
  '../shared/utils': '../utils',
  '../../../types': '../../../types/business/features',
  '../../../types/business/features': '../../../types/business/features',
  '../core/base': '../../core/base',
  '../utils/api': '../../shared/api',
  '../shared/api': '../../shared/api',
  '../core/jobs': '../../core/jobs',
  '../../hooks/data/useEnhancedPerformanceUnified':
    '../../../hooks/infrastructure/data/useEnhancedPerformanceUnified',
  '../../lib/store/unified-performance':
    '../../../lib/core/store/unified-performance',
  '../../shared/base': '../../../lib/shared/base',
  '../base/patterns': '../../shared/base/patterns',
  '../core/useAsyncOperation': '../../core/useAsyncOperation',
  '../shared/useAuth': '../../shared/useAuth',
};

// TypeScript dosyalarını bul
function findTSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (
      item.isDirectory() &&
      !item.name.startsWith('.') &&
      item.name !== 'node_modules'
    ) {
      files.push(...findTSFiles(fullPath));
    } else if (
      item.isFile() &&
      (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Dosyada import'ları düzelt
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      const oldImportRegex = new RegExp(
        `(['"])${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`,
        'g'
      );
      const newContent = content.replace(oldImportRegex, `$1${newPath}$2`);

      if (newContent !== content) {
        content = newContent;
        changed = true;
        console.log(`✓ Fixed import in ${filePath}: ${oldPath} → ${newPath}`);
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
  return false;
}

// Ana fonksiyon
function main() {
  const projectRoot = process.cwd();
  console.log(`🔧 Fixing imports in ${projectRoot}...`);

  const tsFiles = findTSFiles(projectRoot);
  let fixedCount = 0;

  for (const file of tsFiles) {
    if (fixImportsInFile(file)) {
      fixedCount++;
    }
  }

  console.log(
    `\n✅ Fixed imports in ${fixedCount} files out of ${tsFiles.length} TypeScript files.`
  );
}

main();
