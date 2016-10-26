const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const webpack = require('webpack-stream');
const webpackConfig = require('../webpack.config');
const config = require('../config');

gulp.task('build', ['clean', 'validate-scripts'], () => {
  return gulp.src(config.appEntryPoint)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(config.buildDirectory))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(config.buildDirectory));
});
