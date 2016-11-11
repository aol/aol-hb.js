var config = {
  port: 9487,
  hostName: 'localhost'
};

config.defaultPage = 'http://' + config.hostName + ':' + config.port + '/views/default.html';

module.exports = config;
