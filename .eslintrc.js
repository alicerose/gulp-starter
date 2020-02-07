module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    browser: true,
    es6: true,
    es2020: true,
    jquery: true,
    node: true,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-extra-semi': 'warn',
    'no-unused-vars': 'warn',
    'no-multiple-empty-lines': ['error', {max: 1}],
    'prettier/prettier': 'error',
  },
  parserOptions: {
    sourceType: 'module',
  }
}