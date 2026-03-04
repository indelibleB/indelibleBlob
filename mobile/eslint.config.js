// ESLint v9 Flat Config for indelible.Blob Mobile
// Documentation: https://eslint.org/docs/latest/use/configure/configuration-files

const security = require('eslint-plugin-security');
const noSecrets = require('eslint-plugin-no-secrets');
const microsoftSdl = require('@microsoft/eslint-plugin-sdl');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // Base configuration for all files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        // React Native globals
        __DEV__: 'readonly',
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        // ES2021 globals
        Promise: 'readonly',
        Symbol: 'readonly',
        WeakMap: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
      },
    },
    plugins: {
      security,
      'no-secrets': noSecrets,
      '@microsoft/sdl': microsoftSdl,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // ========================================================================
      // SECURITY RULES (CRITICAL)
      // ========================================================================

      // Prevent dangerous code execution
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-require': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',

      // Prevent injection attacks
      'security/detect-object-injection': 'warn', // Too strict, but warn
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',

      // Prevent buffer vulnerabilities
      'security/detect-buffer-noassert': 'error',
      'security/detect-new-buffer': 'error',

      // Prevent timing attacks
      'security/detect-possible-timing-attacks': 'warn',

      // Prevent CSRF vulnerabilities
      'security/detect-no-csrf-before-method-override': 'error',

      // Prevent hardcoded secrets
      'no-secrets/no-secrets': ['error', {
        tolerance: 4.5, // Lower = more strict (default 4.2)
        additionalRegexes: {
          'Sui Private Key': 'suiprivkey1[a-zA-Z0-9]{44}',
          'Solana Private Key': '[1-9A-HJ-NP-Za-km-z]{32,44}',
          'Mnemonic Phrase': '\\b([a-z]+\\s){11,23}[a-z]+\\b',
        }
      }],

      // Microsoft SDL (Security Development Lifecycle) rules
      '@microsoft/sdl/no-insecure-url': 'error',
      '@microsoft/sdl/no-insecure-random': 'error',
      '@microsoft/sdl/no-postmessage-star-origin': 'error',

      // ========================================================================
      // TYPESCRIPT RULES
      // ========================================================================

      '@typescript-eslint/no-explicit-any': 'warn', // Prefer specific types
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // ========================================================================
      // GENERAL CODE QUALITY
      // ========================================================================

      'no-console': ['warn', {
        allow: ['warn', 'error', 'info'] // Allow logging, but warn
      }],
      'no-debugger': 'error',
      'no-alert': 'error', // Use proper UI components
      'eqeqeq': ['error', 'always'], // Require === instead of ==
      'curly': ['error', 'all'], // Require braces for all control statements
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },

  // Test files - more lenient rules
  {
    files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    }
  },

  // Config files - can use require()
  {
    files: ['*.config.js', 'eslint.config.js', 'metro.config.js'],
    rules: {
      'security/detect-non-literal-require': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    }
  },
];
