const gulp = require('gulp');
const nightwatch = require('gulp-nightwatch');

gulp.task('tests-e2e', function() {
  return gulp.src('')
    .pipe(nightwatch({
      configFile: 'config/nightwatch/nightwatch.json'
    }));
});
