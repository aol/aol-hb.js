const gulp = require('gulp');
const nightwatch = require('gulp-nightwatch');
const config = require('../config');

gulp.task('test-e2e', ['build', 'test-e2e-config', 'test-e2e-server'], () => {
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
});
