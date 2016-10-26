describe('Utils tests', function() {
  var utils = require('src/utils');

  it('Get app name method test', function() {
    expect(utils.getAppName()).to.equal('pub-api');
  });
});
