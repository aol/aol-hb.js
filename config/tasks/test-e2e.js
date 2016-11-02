const gulp = require('gulp');
const nightwatch = require('gulp-nightwatch');
const config = require('../config');

var runTests = () => {
  var stream = gulp.src('')
    .pipe(nightwatch({
      configFile: config.nightWatchConfigPath
    }));

  var terminateE2eServer = () => {
    process.exit();
  };

  stream.on('end', terminateE2eServer);

  stream.on('error', terminateE2eServer);

  return stream;
};

gulp.task('test-e2e', ['build', 'test-e2e-config', 'test-e2e-server'], runTests);

// Run e2e tests when unit tests are done. Required for CI mode.
gulp.task('test-e2e-ci', ['build', 'test-unit', 'test-e2e-config', 'test-e2e-server'], runTests);
