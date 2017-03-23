import utils from 'src/helpers/utils';
import * as ajax from 'src/helpers/ajax';
import NexagePostBidRequest from 'src/bidRequests/nexagePost';

describe('NexagePostBidRequest', () => {
  let getBidRequest = (bidRequestConfig, placementConfig) => {
    return new NexagePostBidRequest(bidRequestConfig || {}, placementConfig || {});
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
      let bidRequest = getBidRequest();

      let expectedUrl = 'https://hb.nexage.com/bidRequest?';
      expect(bidRequest.formatUrl()).to.equal(expectedUrl);
    });

    it('should resolve url with specified hostName', () => {
      let bidRequestConfig = {
        host: 'test-host'
      };

      let bidRequest = getBidRequest(bidRequestConfig);

      let expectedUrl = 'https://test-host/bidRequest?';
      expect(bidRequest.formatUrl()).to.equal(expectedUrl);
    });
  });

  describe('send()', () => {
    let bidRequest;
    let formatUrlStub;
    let sendPostStub;

    beforeEach(() => {
      bidRequest = getBidRequest();
      formatUrlStub = sinon.stub(bidRequest, 'formatUrl').returns('bid-request-url');
      sendPostStub = sinon.stub(ajax, 'sendPostRequest');
    });

    afterEach(() => {
      formatUrlStub.reset();
      sendPostStub.reset();
    });

    it('should format url and send bid request', () => {
      let placementConfig = {
        pos: '1234',
        openRtbParams: 'open-rtb-params'
      };
      let bidResponseHandler = function() {};

      bidRequest.placementConfig = placementConfig;
      bidRequest.send(bidResponseHandler);

      let expectedOptions = {
        contentType: 'application/json',
        data: placementConfig.openRtbParams,
        customHeaders: {
          'x-openrtb-version': '2.2'
        }
      };

      expect(formatUrlStub.withArgs(placementConfig).calledOnce).to.be.true;
      let calledOnce = sendPostStub.withArgs('bid-request-url', bidResponseHandler, expectedOptions)
        .calledOnce;
      expect(calledOnce).to.be.true;
    });
  });
});
