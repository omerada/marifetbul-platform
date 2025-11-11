#!/usr/bin/env node

/**
 * Script to replace console.log/error/warn with proper logger usage
 * Finds and reports files that need manual review
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DIRECTORIES = ['app', 'components', 'lib'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Files to skip
const SKIP_FILES = [
  'logger.ts',
  'error-tracking.ts',
  'error-reporting.tsx',
  'documentation/index.ts',
  'monitoring',
  'clean-console.js',
  'test',
  '__tests__',
  '.next',
  'node_modules',
];

function shouldSkipFile(filePath) {
  return SKIP_FILES.some((skip) => filePath.includes(skip));
}

function findConsoleUsage() {
  const results = [];

  DIRECTORIES.forEach((dir) => {
    const pattern = path.join(process.cwd(), dir, '**/*{.ts,.tsx,.js,.jsx}');
    const files = glob.sync(pattern);

    files.forEach((file) => {
      if (shouldSkipFile(file)) return;

      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return;
        }

        // Find console usage
        const consoleRegex =
          /console\.(log|error|warn|info|debug|table|group)\(/g;
        if (consoleRegex.test(line)) {
          results.push({
            file: path.relative(process.cwd(), file),
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    });
  });

  return results;
}

function main() {
  console.log('🔍 Scanning for console.* usage...\n');

  const results = findConsoleUsage();

  if (results.length === 0) {
    console.log('✅ No console usage found!\n');
    return;
  }

  console.log(`Found ${results.length} console usage(s):\n`);

  // Group by file
  const byFile = {};
  results.forEach((result) => {
    if (!byFile[result.file]) {
      byFile[result.file] = [];
    }
    byFile[result.file].push(result);
  });

  Object.keys(byFile).forEach((file) => {
    console.log(`\n📄 ${file}`);
    byFile[file].forEach((result) => {
      console.log(`   Line ${result.line}: ${result.content}`);
    });
  });

  console.log('\n\n📋 Summary:');
  console.log(`   Total files: ${Object.keys(byFile).length}`);
  console.log(`   Total occurrences: ${results.length}`);
  console.log(
    '\n💡 Consider replacing with logger from @/lib/shared/utils/logger'
  );
  console.log('   - console.log() -> logger.info() or logger.debug()');
  console.log('   - console.error() -> logger.error()');
  console.log('   - console.warn() -> logger.warn()');
  console.log('\n');
}

main();
