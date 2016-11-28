const gulp = require('gulp');
const clean = require('gulp-clean');
const config = require('../config');

gulp.task('clean', () => {
  return gulp.src(config.buildDirectory)
    .pipe(clean({force: true}));
});
