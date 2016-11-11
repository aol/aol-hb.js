import utils from 'src/helpers/utils';

describe('Utils tests', () => {
  it('Get app name method test', () => {
    expect(utils.getAppName()).to.equal('pub-api');
  });
});
