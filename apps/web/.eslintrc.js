module.exports = {
  extends: ['@track-it/eslint-config/react'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json'
  },
  env: {
    jest: true
  }
};