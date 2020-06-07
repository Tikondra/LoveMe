'use strict';

var gulp         = require('gulp'),
    plumber      = require('gulp-plumber'),
    sourcemap    = require('gulp-sourcemaps'),
    rename       = require('gulp-rename'),
    server       = require('browser-sync').create(),
    del          = require('del'),

    sass         = require('gulp-sass'),
    postcss      = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    csso         = require('gulp-csso'),

    imagemin     = require('gulp-imagemin'),
    webp         = require('gulp-webp'),
    svgstore     = require('gulp-svgstore'),
    posthtml     = require('gulp-posthtml'),
    include      = require('posthtml-include'),

    htmlmin      = require("gulp-htmlmin"),
    uglify       = require("gulp-uglify");


gulp.task('css', function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.scss', gulp.series('css'));
  gulp.watch('source/img/icon-*.svg', gulp.series('sprite', 'html', 'refresh'));
  gulp.watch('source/js/*.js', gulp.series('copy', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'refresh'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('images', function () {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('source/img'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('source/img'));
});

gulp.task('sprite', function () {
  return gulp.src('source/img/icon-*.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/img/**',
    'source/js/**',
    'source/*.ico'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
  return del('build');
});

gulp.task("js", function () {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += ".min"
    }))
    .pipe(gulp.dest("build/js"))
});

gulp.task('build', gulp.series('clean', 'copy', 'css', 'js', 'sprite', 'html'));
gulp.task('start', gulp.series('build', 'server'));
