import utils from 'src/helpers/utils';
import MarketplaceBidRequest from 'src/bidRequests/marketplace';

describe('MarketplaceBidRequest', () => {
  let getBidRequest = (bidRequestConfig, placementConfig) => {
    return new MarketplaceBidRequest(bidRequestConfig || {}, placementConfig);
  };

  describe('formatUrl()', () => {
    let resolveHttpProtocolStub;

    before(() => {
      resolveHttpProtocolStub = sinon.stub(utils, 'resolveHttpProtocol').returns('https');
    });

    after(() => {
      resolveHttpProtocolStub.restore();
    });

    it('should resolve marketplace url without bid floor price', () => {
      let placementConfig = {
        protocol: 'https',
        placement: '15',
        alias: '54'
      };
      let bidRequestConfig = {
        network: '5404.10'
      };
      let bidRequest = getBidRequest(bidRequestConfig, placementConfig);
      sinon.stub(bidRequest, 'resolveHostName').returns('test.com');

      let expectedUrl = 'https://test.com/pubapi/3.0/5404.10/15/0/-1/ADTECH;' +
        'cmd=bid;cors=yes;v=2;alias=54;';
      expect(bidRequest.formatUrl()).to.equal(expectedUrl);
    });

    it('should resolve marketplace url with specified bidFloorPrice', () => {
      let bidRequestConfig = {
        network: '5404.10'
      };
      let placementConfig = {
        placement: '15',
        alias: '54',
        bidFloorPrice: 'bid-floor-price'
      };
      let bidRequest = getBidRequest(bidRequestConfig, placementConfig);
      sinon.stub(bidRequest, 'resolveHostName').returns('test2.com');
      sinon.stub(bidRequest, 'resolveBidFloorPrice').returns('bid-floor-price');

      let expectedUrl = 'https://test2.com/pubapi/3.0/5404.10/15/0/-1/ADTECH;' +
        'cmd=bid;cors=yes;v=2;alias=54;bid-floor-price';
      expect(bidRequest.formatUrl()).to.equal(expectedUrl);
    });
  });

  describe('resolveBidFloorPrice()', () => {
    it('should be empty string when floor price is not defined', () => {
      let bidRequest = getBidRequest();

      expect(bidRequest.resolveBidFloorPrice()).to.equal('');
    });

    it('should be empty string when floor price equals to 0', () => {
      let bidRequest = getBidRequest();

      expect(bidRequest.resolveBidFloorPrice(0)).to.equal('');
    });

    it('should be formatted when floor price is defined', () => {
      let bidRequest = getBidRequest();

      expect(bidRequest.resolveBidFloorPrice(29)).to.equal('bidfloor=29;');
    });
  });

  describe('resolveHostName()', () => {
    it('should return default host name for undefined param', () => {
      let bidRequest = getBidRequest();

      expect(bidRequest.resolveHostName()).to.equal('adserver.adtechus.com');
    });

    it('should return host name for EU region', () => {
      let bidRequest = getBidRequest({region: 'EU'});

      expect(bidRequest.resolveHostName()).to.equal('adserver.adtech.de');
    });

    it('should return host name for Asia region', () => {
      let bidRequest = getBidRequest({region: 'Asia'});

      expect(bidRequest.resolveHostName()).to.equal('adserver.adtechjp.com');
    });

    it('should return host name for US region', () => {
      let bidRequest = getBidRequest({region: 'US'});

      expect(bidRequest.resolveHostName()).to.equal('adserver.adtechus.com');
    });
  });
});
