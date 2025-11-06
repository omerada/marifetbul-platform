/**
 * Fix logger.error calls with unknown error parameter
 */

const fs = require('fs');
const glob = require('glob');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
let filesFixed = 0;
let totalFixes = 0;

function fixLoggerErrors(content) {
  let fixed = content;
  let fixes = 0;

  // Pattern 1: logger.error('message', error) -> logger.error('message', error instanceof Error ? error : new Error(String(error)))
  const pattern1 = /logger\.error\((['"`])([^'"`]+)\1,\s*(error|err)\s*\)/g;
  const matches1 = [...content.matchAll(pattern1)];

  matches1.forEach((match) => {
    const [fullMatch, quote, message, errorVar] = match;
    const replacement = `logger.error(${quote}${message}${quote}, ${errorVar} instanceof Error ? ${errorVar} : new Error(String(${errorVar})))`;
    fixed = fixed.replace(fullMatch, replacement);
    fixes++;
  });

  // Pattern 2: logger.error('message', error, { context }) - already correct format
  // No changes needed

  return { content: fixed, fixes };
}

// Get all TS/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  cwd: ROOT_DIR,
  ignore: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/scripts/**',
  ],
  absolute: true,
});

console.log(`🔧 Fixing logger.error calls in ${files.length} files...\n`);

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const { content: fixed, fixes } = fixLoggerErrors(content);

  if (fixes > 0 && fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    filesFixed++;
    totalFixes += fixes;
    const relativePath = path.relative(ROOT_DIR, filePath);
    console.log(`✓ Fixed: ${relativePath} (${fixes} fixes)`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 Fix Summary');
console.log('='.repeat(60));
console.log(`Files fixed:  ${filesFixed}`);
console.log(`Total fixes:  ${totalFixes}`);
console.log('');

if (filesFixed > 0) {
  console.log('✅ Fixes applied successfully!');
  console.log('   Run: npx tsc --noEmit to verify');
} else {
  console.log('✓ No files needed fixing.');
}
