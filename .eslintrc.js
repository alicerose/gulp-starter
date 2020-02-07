module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    'browser': true,
    'es6': true,
    'jquery': true,
    'node': true,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-extra-semi': 'warn',
    'no-unused-vars': 'warn',
    'prettier/prettier': 'error',
  },
  parserOptions: {
    'ecmaVersion': 6,
    'sourceType': 'module',
  }
}