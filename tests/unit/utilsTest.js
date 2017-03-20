import utils from 'src/helpers/utils';

describe('Utils helper tests', () => {
  describe('trimTemplateStringResult()', () => {
    it('should return null for undefined param', () => {
      let templateStringTrimmed = utils.trimTemplateStringResult(undefined);
      expect(templateStringTrimmed).to.equal(null);
    });

    it('should return null for null param', () => {
      let templateStringTrimmed = utils.trimTemplateStringResult(null);
      expect(templateStringTrimmed).to.equal(null);
    });

    it('should remove spaces from multiline template string result', () => {
      let firstPart = 'part-1';
      let secondPart = 'part-2';

      let multiLineTemplateString = `${firstPart}/
                                  ${secondPart}`;

      let templateStringTrimmed = utils.trimTemplateStringResult(multiLineTemplateString);
      expect(templateStringTrimmed).to.equal(firstPart + '/' + secondPart);
    });
  });
});
