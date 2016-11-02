const gulp = require('gulp');
const fs = require('fs');
const mkdirp = require('mkdirp');
const config = require('../config');

console.log(config.tempFilesDir);

gulp.task('test-e2e-config', () => {
  var nightWatchConfig = require('../e2e/nightwatch.config.travis');

  mkdirp(config.tempFilesDir, () => {
    fs.writeFile(config.nightWatchConfigPath, JSON.stringify(nightWatchConfig));
  });
});
