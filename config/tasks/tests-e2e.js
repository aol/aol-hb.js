const gulp = require('gulp');
const nightwatch = require('gulp-nightwatch');

gulp.task('tests-e2e', ['build', 'tests-e2e-server'], () => {
  var stream = gulp.src('')
    .pipe(nightwatch({
      configFile: 'config/e2e/nightwatch.json'
    }));

  var terminateE2eServer = () => {
    process.exit();
  };

  stream.on('end', terminateE2eServer);

  stream.on('error', terminateE2eServer);

  return stream;
});
