const baseConfig = require('./index');

module.exports = {
  ...baseConfig,
  extends: [
    ...baseConfig.extends,
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [...baseConfig.plugins, 'react', 'react-hooks'],
  parserOptions: {
    ...baseConfig.parserOptions,
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    ...baseConfig.env,
    browser: true
  },
  settings: {
    ...baseConfig.settings,
    react: {
      version: 'detect'
    }
  },
  rules: {
    ...baseConfig.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error'
  }
};