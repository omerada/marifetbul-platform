/**
 * Testing Infrastructure Setup
 */

export class TestSetup {
  static configure() {
    // Jest setup configurations
    return {
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/lib/shared/testing/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/types/(.*)$': '<rootDir>/types/$1',
      },
      testMatch: [
        '**/__tests__/**/*.(ts|tsx|js|jsx)',
        '**/*.(test|spec).(ts|tsx|js|jsx)',
      ],
      collectCoverageFrom: [
        'components/**/*.(ts|tsx)',
        'lib/**/*.(ts|tsx)',
        'hooks/**/*.(ts|tsx)',
        '!**/*.d.ts',
        '!**/node_modules/**',
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    };
  }
}

export const jestConfig = TestSetup.configure();
