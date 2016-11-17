const gulp = require('gulp');
const nightwatch = require('gulp-nightwatch');
const config = require('../config');

let runTests = () => {
  let stream = gulp.src('')
    .pipe(nightwatch({
      configFile: config.nightWatchConfigPath
    }));

  let terminateE2eServer = () => {
    process.exit();
  };

  let e2eTestsErrorHandler = () => {
    process.exit(1);
  };

  stream.on('end', terminateE2eServer);

  stream.on('error', e2eTestsErrorHandler);

  return stream;
};

gulp.task('test-e2e', ['build', 'test-e2e-config', 'test-e2e-server'], runTests);

// Run e2e tests when unit tests are done. Required for CI mode.
gulp.task('test-e2e-ci', ['build', 'test-unit', 'test-e2e-config', 'test-e2e-server'], runTests);
