module.exports = {
  extends: [
    "stylelint-config-recommended-scss",
    "stylelint-prettier/recommended",
    "stylelint-config-recess-order"
  ],
  plugin: [
    "stylelint-scss",
  ],
  ignore: [],
  ignoreFiles: [
    'src/scss/vendor/*.scss',
    'src/scss/**/*.css',
    'src/ejs/**/*.ejs',
    'dist/**/*.css'
  ],
  rules:{}
};