import autoprefixer from 'autoprefixer';
import flexBugFixes from 'postcss-flexbugs-fixes';

export const gulpConfig = {
  dir: {
    src: 'src',
    dist: 'dist',
    assets: '/assets',
  },
  server: {
    // https://browsersync.io/docs/options#option-server
    server: {
      baseDir: 'dist',
      index: 'index.html',
      directory: false,
    },
    // https://browsersync.io/docs/options#option-port
    // port: '3000',
    // https://browsersync.io/docs/options#option-ghostMode
    // ghostMode: false,
    // https://browsersync.io/docs/options#option-open
    // open: 'internal,
    // https://browsersync.io/docs/options#option-proxy
    // proxy: 'localhost:8080',
  },
  html: {
    engine: 'ejs',
    options: {
      ejs: {
        extension: 'html',
      },
    },
    revision: true,
  },
  scss: {
    style: {
      dev: { outputStyle: 'expanded' },
      prod: { outputStyle: 'compressed' },
    },
    plugins: [autoprefixer({ grid: true }), flexBugFixes()],
  },
};
