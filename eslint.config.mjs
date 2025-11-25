import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'scripts/**',
      'public/**',
      'tests/**', // E2E and manual tests - console.log allowed for debugging
      '__tests__/**', // Unit tests - console mocking allowed
      'sentry.*.config.ts', // Sentry configs - initialization logs allowed
      'next.config.js', // Next.js config - build-time logs allowed
      'lib/api/__tests__/proposals.test.ts', // Bozuk dosya - clean-console script'i tarafından bozulmuş
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Allow any type warnings
      'jsx-a11y/alt-text': 'warn', // Allow alt text warnings
      '@next/next/no-img-element': 'warn', // Allow img element warnings
      'react-hooks/exhaustive-deps': 'warn', // Allow hook dependency warnings
      'no-console': 'error', // Strict enforcement: Use logger instead
    },
  },
];

export default eslintConfig;
