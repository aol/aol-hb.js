const gulp = require('gulp');
const nightwatch = require('gulp-nightwatch');

gulp.task('tests-e2e', ['build', 'tests-e2e-server'], () => {
  return gulp.src('')
    .pipe(nightwatch({
      configFile: 'config/e2e/nightwatch.json'
    }));
});
