'use strict';


// Require

const path = require('path');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const normalize = require('node-normalize-scss');

// Export
module.exports = (task, core) => {


  core.used.fonts = [];
  core.used.imgs = [];


  task.preprocessor = true;

  task.require = {};

  task.sourcemap = !!(core.isDevelopment && core.config.options.sourcemap);

  task.src = core.path.temp('*' + core.config.extnames.styles);

  task.dest = core.path.STYLES;

  task.postcss = [];

  task.cssnano = {
    reduceTransforms: false,
    discardUnused: false,
    convertValues: false,
    normalizeUrl: false,
    autoprefixer: false,
    reduceIdents: false,
    mergeIdents: false,
    zindex: false,
    calc: false
  };

  task.rename = {
    suffix: '.min'
  };

  // Sass
  task.require = require('gulp-sass')({
    includePaths: [normalize.includePaths, path.resolve('bootstrap/scss')],
    importer: core.sassResolver
  });

  // PostCSS
  task.postcss.push(
    require('postcss-url')({
      url: core.editUrl
    }),
    require('autoprefixer')({
      remove: false,
      browsers: ['last 5 versions', 'ie 10', 'ie 11']
    })
  );

  // Add PostCSS plugins only for production
  if (!core.isDevelopment) task.postcss.push(
    require('postcss-sprites')({
      retina: true,
      spritePath: core.path.IMG,
      stylesheetPath: core.path.STYLES,
      spritesmith: {
        padding: 1,
        algorithm: 'binary-tree'
      },
      svgsprite: {
        shape: {
          spacing: {
            padding: 1
          }
        }
      },
      filterBy: (img) => img.url.indexOf('img/sprite/') === -1 ? Promise.reject() : Promise.resolve()
    }),

    require('css-mqpacker'),
    require('stylefmt')({
      configFile: core.path.core('stylelintrc.json')
    })
  );

  return (cb) => {
    return gulp.src(task.src)
      .pipe(plumber(core.errorHandler))
      .pipe(gulpif(task.sourcemap, sourcemaps.init()))
      .pipe(gulpif(task.preprocessor, task.require))
      .pipe(postcss(task.postcss))
      .pipe(gulpif(task.sourcemap, sourcemaps.write()))
      .pipe(gulp.dest(task.dest))
      .pipe(gulpif(!core.isDevelopment, require('gulp-cssnano')(task.cssnano)))
      .pipe(gulpif(!core.isDevelopment, require('gulp-rename')(task.rename)))
      .pipe(gulpif(!core.isDevelopment, gulp.dest(task.dest)));
  };
};
