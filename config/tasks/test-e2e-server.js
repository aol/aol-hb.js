const gulp = require('gulp');
const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const serverConfig = require('../e2e/server.config');
const config = require('../config');

gulp.task('test-e2e-server', ['build', 'test-e2e-config'], () => {
  var app = express();
  var defaultViewHandler = (req, res) => {
    var view = req.params.view;

    res.render(config.e2eTestViewsDirectory + '/' + view);
  };

  app.engine('html', mustacheExpress());
  app.set('view engine', 'html');

  app.get('/views/:view', defaultViewHandler);
  app.use('/project', (req, res) => {
    res.sendFile(path.resolve(config.buildDirectory + '/' + config.outputFileName));
  });

  app.listen(serverConfig.port);
});
