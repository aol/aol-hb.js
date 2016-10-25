const gulp = require('gulp');
const jscs = require('gulp-jscs');
const jscsReporter = require('gulp-jscs-stylish');
const jshint = require('gulp-jshint');

gulp.task('jshint', () => {
  return gulp.src('*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', () => {
  return gulp.src('*.js')
    .pipe(jscs())
    .pipe(jscsReporter())
    .pipe(jscs.reporter('fail'));
});

gulp.task('validate-scripts', ['jshint', 'jscs']);
