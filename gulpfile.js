const gulp = require('gulp');
const clean = require('gulp-clean');
const copy = require('gulp-copy');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();

const buildViews = require('./build/build-views');
const config = require('./config');

gulp.task('clean', function() {
  return gulp.src('dist', {
    read: false,
    allowEmpty: true
  })
  .pipe(clean());
});

gulp.task('pages', function() {
  return gulp.src('lib/**/page-*.pug')
    .pipe(pug({
      basedir: './lib/',
      locals: {
        cssPath: config.cssPath
      }
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('views', function(cb) {
  return buildViews(cb);
});

gulp.task('static', function() {
  return gulp.src('static/**/*')
    .pipe(copy('dist/', { prefix: 1 }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series(
  'clean',
  'pages',
  'views',
  'static'
));

gulp.task('dev', function() {
  browserSync.init({
    server: './dist'
  });

  gulp.watch(['lib/**/*', 'static/**/*', 'build/**/*.html'], gulp.series('build'))
    .on('change', browserSync.reload);
});


