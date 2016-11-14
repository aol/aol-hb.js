import utils from 'src/helpers/utils';

describe('Utils helper tests', () => {
  it('Resolve http protocol method test', () => {

    expect(utils.resolveHttpProtocol()).to.equal('http');
    expect(utils.resolveHttpProtocol(null)).to.equal('http');
    expect(utils.resolveHttpProtocol('testProtocol')).to.equal('http');
    expect(utils.resolveHttpProtocol('http')).to.equal('http');
    expect(utils.resolveHttpProtocol('https')).to.equal('http');
    expect(utils.resolveHttpProtocol('https:')).to.equal('https');
  });

  it('Trim tempate string result method test', () => {
    let firstPart = 'part-1';
    let secondPart = 'part-2';

    let multiLineTemplateString = `${firstPart}/
                                  ${secondPart}`;

    var templateStringTrimmed = utils.trimTemplateStringResult(multiLineTemplateString);

    expect(templateStringTrimmed).to.equal(firstPart + '/' + secondPart);
  });
});
