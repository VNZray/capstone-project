module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser for TypeScript
  extends: [
    'eslint:recommended',
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:react-hooks/recommended', // Uses the recommended rules from @eslint-plugin-react-hooks
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'plugin:react-native/all', // Enables all React Native specific linting rules
    'prettier', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'react-native',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  env: {
    'react-native/react-native': true, // Enables React Native global variables
    es6: true,
    node: true,
    jest: true, // If you use Jest for testing
  },
  rules: {
    // Common rules
    'prettier/prettier': 'error', // Prettier errors will be shown as ESLint errors
    'react/prop-types': 'off', // We use TypeScript for type checking, so prop-types are not necessary
    'react/react-in-jsx-scope': 'off', // Not needed with newer React versions/Expo
    '@typescript-eslint/explicit-function-return-type': 'off', // Optional: can be 'warn' or 'error' if you want to enforce return types
    '@typescript-eslint/no-explicit-any': 'warn', // Warns on `any` type

    // React Native specific rules (many are enabled by 'plugin:react-native/all')
    // This is the crucial one for the errors we were fixing:
    'react-native/no-raw-text': [
        'error',
        {
          skip: ['Text', 'StyledTextComponentFromLibrary'], // Add any custom Text components here if needed
        }
    ],
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn', // Can be 'off' if you prefer inline styles sometimes

    // You can add or override more rules here
  },
  ignorePatterns: [
    'node_modules/',
    'babel.config.js', // Or metro.config.js, etc.
    '*.config.js', // General config files
    '*.config.ts',
    'build/',
    'dist/',
    '.expo/',
    '.expo-shared/',
    'coverage/',
    // Add any other files/directories you want to ignore
  ],
};