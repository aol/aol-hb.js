const gulp = require('gulp');
const fs = require('fs');
const mkdirp = require('mkdirp');
const config = require('../config');
const environmentResolver = require('../helpers/environmentConfigResolver');

gulp.task('test-e2e-config', () => {
  let nightWatchConfigPath = '../e2e/' + environmentResolver.resolveNightWatchConfig();
  let nightWatchConfig = require(nightWatchConfigPath);

  mkdirp(config.tempFilesDir, () => {
    fs.writeFile(config.nightWatchConfigPath, JSON.stringify(nightWatchConfig));
  });
});
