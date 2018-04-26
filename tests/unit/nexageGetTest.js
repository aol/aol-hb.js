import utils from 'src/helpers/utils';
import NexageGetBidRequest from 'src/bidRequests/nexageGet.js';

describe('NexageGetBidRequest', () => {
  let getBidRequest = (bidRequestConfig, placementConfig) => {
    return new NexageGetBidRequest(bidRequestConfig || {}, placementConfig || {});
  };

  describe('formatUrl()', () => {
    let resolveHttpProtocolStub;

    before(() => {
      resolveHttpProtocolStub = sinon.stub(utils, 'resolveHttpProtocol').returns('https');
    });

    after(() => {
      resolveHttpProtocolStub.restore();
    });

    it('should resolve url with default host name', () => {
      let bidRequestConfig = {
        dcn: 'dcn-value1'
      };
      let placementConfig = {
        pos: 'placement-position'
      };

      let bidRequest = getBidRequest(bidRequestConfig, placementConfig);

      let expectedUrl = 'https://hb.nexage.com/bidRequest?dcn=dcn-value1' +
        '&pos=placement-position&cmd=bid';
      expect(bidRequest.formatUrl()).to.equal(expectedUrl);
    });

    it('should resolve url with specified hostName', () => {
      let bidRequestConfig = {
        dcn: 'dcn-value1',
        host: 'test-host'
      };
      let placementConfig = {
        pos: 'placement-position'
      };

      let bidRequest = getBidRequest(bidRequestConfig, placementConfig);

      let expectedUrl = 'https://test-host/bidRequest?dcn=dcn-value1' +
        '&pos=placement-position&cmd=bid';
      expect(bidRequest.formatUrl()).to.equal(expectedUrl);
    });

    it('should resolve url with dynamic params', () => {
      let bidRequestConfig = {
        dcn: 'dcn-value2'
      };
      let placementConfig = {
        pos: 'header'
      };

      let bidRequest = getBidRequest(bidRequestConfig, placementConfig);

      sinon.stub(bidRequest, 'formatDynamicParams').returns('&ext-params');
      let expectedUrl = 'https://hb.nexage.com/bidRequest?dcn=dcn-value2' +
        '&pos=header&cmd=bid&ext-params';

      expect(bidRequest.formatUrl()).to.equal(expectedUrl);
    });
  });

  describe('formatDynamicParams()', () => {
    it('should return empty string when ext is not present', () => {
      let bidRequest = getBidRequest();

      expect(bidRequest.formatDynamicParams()).to.equal('');
    });

    it('should return formatted string when ext is present', () => {
      let bidRequest = getBidRequest();

      bidRequest.placementConfig.ext = {
        reserve: '0.1',
        mraid: '2',
        sdk: 'ANDROID'
      };

      expect(bidRequest.formatDynamicParams()).to.equal('&reserve=0.1&mraid=2&sdk=ANDROID');
    });

    it('should encode param when it contains special characters', () => {
      let bidRequest = getBidRequest();

      bidRequest.placementConfig.ext = {
        sdk: 'A@#ND~RO+ID'
      };
      let expectedResult = '&sdk=' + encodeURIComponent(bidRequest.placementConfig.ext.sdk);

      expect(bidRequest.formatDynamicParams()).to.equal(expectedResult);
    });

    it('should return formatted gdpr params when isConsentRequired returns true', () => {
      let bidRequest = getBidRequest();
      sinon.stub(bidRequest, 'isConsentRequired').returns(true);

      bidRequest.consentData = {
        consentString: 'test-consent'
      };

      expect(bidRequest.formatDynamicParams()).to.equal('&euconsent=test-consent&gdpr=1');
    });
  });
});
