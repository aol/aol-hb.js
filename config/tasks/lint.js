const gulp = require('gulp');
const jscs = require('gulp-jscs');
const jscsReporter = require('gulp-jscs-stylish');
const jshint = require('gulp-jshint');

const scriptPaths = [
  'src/**/*.js',
  'tests/**/*.js',
  'config/**/*.js',
  '*.js'
];

gulp.task('jshint', () => {
  return gulp.src(scriptPaths)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', () => {
  return gulp.src(scriptPaths)
    .pipe(jscs())
    .pipe(jscsReporter())
    .pipe(jscs.reporter('fail'));
});

gulp.task('lint', ['jshint', 'jscs']);
