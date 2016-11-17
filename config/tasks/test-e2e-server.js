const gulp = require('gulp');
const express = require('express');
const path = require('path');
const openPage = require('opn');
const mustacheExpress = require('mustache-express');
const serverConfig = require('../e2e/server.config');
const config = require('../config');

let createServer = () => {
  let app = express();
  let defaultViewHandler = (req, res) => {
    let view = req.params.view;

    res.render(config.e2eTestViewsDirectory + '/' + view);
  };

  app.engine('html', mustacheExpress());
  app.set('view engine', 'html');

  app.get('/views/:view', defaultViewHandler);
  app.use('/project', (req, res) => {
    res.sendFile(path.resolve(config.buildDirectory + '/' + config.outputFileName));
  });
  app.listen(serverConfig.port);
};

gulp.task('test-e2e-server', ['build', 'test-e2e-config'], () => {
  createServer();
});

gulp.task('test-e2e-manual', ['build'], () => {
  createServer();

  openPage(serverConfig.defaultPage);
});
