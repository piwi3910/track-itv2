module.exports = {
  extends: ['@track-it/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json'
  },
  env: {
    jest: true
  }
};