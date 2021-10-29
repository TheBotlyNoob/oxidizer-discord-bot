module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {},
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended'
  ]
};
