/**
 * Logger Migration Script
 * Migrates from @/lib/shared/utils/logger to @/lib/infrastructure/monitoring/logger
 *
 * Changes:
 * 1. Update import statements
 * 2. Fix 3+ parameter logger calls to 2-parameter format
 * 3. Fix logger.error with non-Error second parameter
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'];
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/scripts/**',
  '**/lib/shared/utils/logger.ts',
  '**/lib/infrastructure/monitoring/logger.ts',
];

// Statistics
let stats = {
  filesScanned: 0,
  filesModified: 0,
  importsFixed: 0,
  callsFixed: 0,
  errors: [],
};

/**
 * Get all TypeScript/JavaScript files
 */
function getFiles() {
  const patterns = EXTENSIONS.map((ext) => `**/*.${ext}`);
  let files = [];

  patterns.forEach((pattern) => {
    const matched = glob.sync(pattern, {
      cwd: ROOT_DIR,
      ignore: EXCLUDE_PATTERNS,
      absolute: true,
    });
    files = [...files, ...matched];
  });

  return [...new Set(files)]; // Remove duplicates
}

/**
 * Fix import statement
 */
function fixImport(content) {
  let fixed = content;
  let changed = false;

  // Pattern 1: import { logger } from '@/lib/shared/utils/logger'
  const pattern1 =
    /import\s*{\s*logger\s*}\s*from\s*['"]@\/lib\/shared\/utils\/logger['"]/g;
  if (pattern1.test(content)) {
    fixed = fixed.replace(
      pattern1,
      "import logger from '@/lib/infrastructure/monitoring/logger'"
    );
    changed = true;
  }

  // Pattern 2: import { logger, ... } from '@/lib/shared/utils/logger'
  const pattern2 =
    /import\s*{\s*(logger\s*,\s*[^}]+|[^}]+,\s*logger)\s*}\s*from\s*['"]@\/lib\/shared\/utils\/logger['"]/g;
  const matches = content.match(pattern2);
  if (matches) {
    matches.forEach((match) => {
      // Extract all imports
      const importsMatch = match.match(/{\s*([^}]+)\s*}/);
      if (importsMatch) {
        const imports = importsMatch[1].split(',').map((i) => i.trim());
        const otherImports = imports.filter((i) => i !== 'logger');

        if (otherImports.length > 0) {
          // Keep other imports from old logger, add new logger import
          const newImport = `import logger from '@/lib/infrastructure/monitoring/logger';\nimport { ${otherImports.join(', ')} } from '@/lib/shared/utils/logger'`;
          fixed = fixed.replace(match, newImport);
        } else {
          // Only logger import
          fixed = fixed.replace(
            match,
            "import logger from '@/lib/infrastructure/monitoring/logger'"
          );
        }
        changed = true;
      }
    });
  }

  // Pattern 3: import logger from '@/lib/shared/utils/logger'
  const pattern3 =
    /import\s+logger\s+from\s+['"]@\/lib\/shared\/utils\/logger['"]/g;
  if (pattern3.test(fixed)) {
    fixed = fixed.replace(
      pattern3,
      "import logger from '@/lib/infrastructure/monitoring/logger'"
    );
    changed = true;
  }

  return { content: fixed, changed };
}

/**
 * Fix logger calls with incorrect parameters
 */
function fixLoggerCalls(content) {
  let fixed = content;
  let changeCount = 0;

  // Fix: logger.error('Prefix', 'Message', { data }) -> logger.error('Prefix: Message', undefined, { data })
  // Match: logger.error('str', 'str', { obj })
  const errorPattern1 =
    /logger\.error\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*(\{[^}]*\})\s*\)/g;
  if (errorPattern1.test(fixed)) {
    fixed = fixed.replace(errorPattern1, (match, prefix, message, context) => {
      changeCount++;
      return `logger.error('${prefix}: ${message}', undefined, ${context})`;
    });
  }

  // Fix: logger.info('Prefix', var1, 'Label', var2) -> logger.info('Prefix', { var1, label_var2: var2 })
  // This is complex, we'll convert to single message with context
  const multiParamPattern = /logger\.(info|warn|debug)\(([^)]+)\)/g;
  const multiMatches = [...fixed.matchAll(multiParamPattern)];

  multiMatches.forEach((match) => {
    const [fullMatch, level, params] = match;
    const paramList = params.split(',').map((p) => p.trim());

    // If more than 2 parameters, needs fixing
    if (paramList.length > 2) {
      // Try to create a meaningful message
      const firstParam = paramList[0];
      const restParams = paramList.slice(1);

      // Check if it's a simple case like: logger.info('Message', var1, 'label', var2)
      // Convert to: logger.info('Message var1=? label=?', { var1, var2 })
      const message = firstParam;
      const contextParts = restParams
        .filter(
          (p) => !p.startsWith("'") && !p.startsWith('"') && !p.startsWith('`')
        )
        .map((p) => p.replace(/[^\w]/g, ''));

      if (contextParts.length > 0) {
        const context = `{ ${contextParts.join(', ')} }`;
        const replacement = `logger.${level}(${message}, ${context})`;
        fixed = fixed.replace(fullMatch, replacement);
        changeCount++;
      }
    }
  });

  return { content: fixed, changeCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesScanned++;

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Check if file uses logger from old path
    if (
      !content.includes('@/lib/shared/utils/logger') &&
      !content.includes('logger.')
    ) {
      return; // Skip files that don't use logger
    }

    let modified = false;

    // Fix imports
    const importResult = fixImport(content);
    if (importResult.changed) {
      content = importResult.content;
      stats.importsFixed++;
      modified = true;
    }

    // Fix logger calls
    const callsResult = fixLoggerCalls(content);
    if (callsResult.changeCount > 0) {
      content = callsResult.content;
      stats.callsFixed += callsResult.changeCount;
      modified = true;
    }

    // Write back if modified
    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;

      const relativePath = path.relative(ROOT_DIR, filePath);
      console.log(`✓ Fixed: ${relativePath}`);
    }
  } catch (error) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    stats.errors.push({ file: relativePath, error: error.message });
    console.error(`✗ Error processing ${relativePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Logger Migration Script\n');
  console.log('Searching for files...\n');

  const files = getFiles();
  console.log(`Found ${files.length} files to scan\n`);

  // Process each file
  files.forEach(processFile);

  // Print statistics
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Statistics');
  console.log('='.repeat(60));
  console.log(`Files scanned:    ${stats.filesScanned}`);
  console.log(`Files modified:   ${stats.filesModified}`);
  console.log(`Imports fixed:    ${stats.importsFixed}`);
  console.log(`Calls fixed:      ${stats.callsFixed}`);
  console.log(`Errors:           ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  if (stats.filesModified > 0) {
    console.log(
      '\n✅ Migration complete! Please review changes and run type-check.'
    );
    console.log('   Next steps:');
    console.log('   1. Review git diff');
    console.log('   2. Run: npm run type-check');
    console.log('   3. Fix remaining type errors manually');
    console.log('   4. Test the application');
  } else {
    console.log('\n✓ No files needed modification.');
  }

  process.exit(stats.errors.length > 0 ? 1 : 0);
}

// Run
main();
