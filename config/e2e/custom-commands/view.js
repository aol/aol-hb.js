const serverConfig = require('../server.config');

exports.command = function(viewPath) {
  if (viewPath) {
    let url = 'http://' + serverConfig.hostName + ':' + serverConfig.port + '/' + viewPath;

    this.url(url);
  }

  return this;
};
