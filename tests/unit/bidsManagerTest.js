import BidsManager from 'src/bidsManager';
import utils from 'src/helpers/utils';
import * as ajax from 'src/helpers/ajax';

describe('BidsManager', () => {
  let getBidsManager = (bidRequestConfig) => {
    return new BidsManager(bidRequestConfig || {}, []);
  };

  describe('constructor()', () => {
    it('should set default values for bidderKey and aliasKey', () => {
      let manager = getBidsManager();

      expect(manager.bidderKey).to.equal('aolbid');
      expect(manager.aliasKey).to.equal('mpalias');
    });

    it('should override bidderKey and aliasKey by values from placementConfig', () => {
      let manager = getBidsManager({
        bidderKey: 'overridden-bidder-key',
        aliasKey: 'overridden-alias-key'
      });

      expect(manager.bidderKey).to.equal('overridden-bidder-key');
      expect(manager.aliasKey).to.equal('overridden-alias-key');
    });
  });

  describe('resolveHostName()', () => {
    it('should return default host name for undefined param', () => {
      let manager = getBidsManager();

      expect(manager.resolveHostName()).to.equal('adserver.adtechus.com');
    });

    it('should return host name for EU region', () => {
      let manager = getBidsManager();

      manager.bidRequestConfig.region = 'EU';
      expect(manager.resolveHostName()).to.equal('adserver.adtech.de');
    });

    it('should return host name for Asia region', () => {
      let manager = getBidsManager();

      manager.bidRequestConfig.region = 'Asia';
      expect(manager.resolveHostName()).to.equal('adserver.adtechjp.com');
    });

    it('should return host name for US region', () => {
      let manager = getBidsManager();

      manager.bidRequestConfig.region = 'US';
      expect(manager.resolveHostName()).to.equal('adserver.adtechus.com');
    });
  });

  describe('formatBidRequestUrl()', () => {
    let resolveHttpProtocolStub;

    before(() => {
      resolveHttpProtocolStub = sinon.stub(utils, 'resolveHttpProtocol').returns('https');
    });

    after(() => {
      resolveHttpProtocolStub.restore();
    });

    it('should resolve bid request url without bid floor price', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'resolveHostName').returns('test.com');
      manager.bidRequestConfig.network = '5404.10';
      let bidRequestUrl = manager.formatBidRequestUrl({
        protocol: 'https',
        placement: '15',
        alias: '54'
      });

      let expectedUrl = 'https://test.com/pubapi/3.0/5404.10/15/0/-1/ADTECH;' +
        'cmd=bid;cors=yes;v=2;alias=54;';
      expect(bidRequestUrl).to.equal(expectedUrl);
    });

    it('should resolve bid request url with specified bidFloorPrice', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'resolveHostName').returns('test2.com');
      sinon.stub(manager, 'resolveBidFloorPrice').returns('bid-floor-price');
      manager.bidRequestConfig.network = '5404.10';
      let bidRequestUrl = manager.formatBidRequestUrl({
        placement: '15',
        alias: '54',
        bidFloorPrice: 'bid-floor-price'
      });

      let expectedUrl = 'https://test2.com/pubapi/3.0/5404.10/15/0/-1/ADTECH;' +
        'cmd=bid;cors=yes;v=2;alias=54;bid-floor-price';
      expect(bidRequestUrl).to.equal(expectedUrl);
    });
  });

  describe('resolveBidFloorPrice()', () => {
    it('should be empty string when floor price is not defined', () => {
      let manager = getBidsManager();

      expect(manager.resolveBidFloorPrice()).to.equal('');
    });

    it('should be empty string when floor price equals to 0', () => {
      let manager = getBidsManager();

      expect(manager.resolveBidFloorPrice(0)).to.equal('');
    });

    it('should be formatted when floor price is defied', () => {
      let manager = getBidsManager();

      expect(manager.resolveBidFloorPrice(29)).to.equal('bidfloor=29;');
    });
  });

  describe('sendBidRequests()', () => {
    let sendGetRequestStub;

    beforeEach(() => {
      sendGetRequestStub = sinon.stub(ajax, 'sendGetRequest');
    });

    afterEach(() => {
      sendGetRequestStub.reset();
    });

    it('should call sendBidRequest and formatUrl for each placement config', () => {
      let manager = getBidsManager();

      let formatUrlStub = sinon.stub(manager, 'formatBidRequestUrl');

      manager.placementsConfigs = [{}, {}, {}];
      manager.sendBidRequests();
      expect(sendGetRequestStub.callCount).to.equal(3, 'Three bid requests sent');
      expect(formatUrlStub.callCount).to.equal(3, 'Bid request urls formatted three times bid');
    });
  });

  describe('getBidData()', () => {
    it('should return undefined when bid response is undefined', () => {
      let manager = getBidsManager();

      expect(manager.getBidData(undefined)).to.be.undefined;
    });

    it('should return undefined when bid data is empty array', () => {
      let manager = getBidsManager();
      let bidResponse = {
        seatbid: [
          {
            bid: []
          }
        ]
      };

      expect(manager.getBidData(bidResponse)).to.be.undefined;
    });

    it('should return bid data when it is present', () => {
      let manager = getBidsManager();
      let bidResponse = {
        seatbid: [
          {
            bid: ['test-object']
          }
        ]
      };

      expect(manager.getBidData(bidResponse)).to.equal('test-object');
    });
  });

  describe('getPixels()', () => {
    it('should return undefined when pixels are undefined', () => {
      let manager = getBidsManager();
      let bidResponse = {
        ext: {}
      };

      expect(manager.getPixels(bidResponse)).to.be.undefined;
    });

    it('should return pixels value when it is present', () => {
      let manager = getBidsManager();
      let bidResponse = {
        ext: {
          pixels: 'pixels-content'
        }
      };

      expect(manager.getPixels(bidResponse)).to.equal(bidResponse.ext.pixels);
    });
  });

  describe('getCPM()', () => {
    it('should return price when encp is undefined', () => {
      let manager = getBidsManager();
      let bidData = {
        price: 5,
        ext: {}
      };

      expect(manager.getCPM(bidData)).to.equal(bidData.price);
    });

    it('should return encp when it is present', () => {
      let manager = getBidsManager();
      let bidData = {
        ext: {
          encp: 10
        }
      };

      expect(manager.getCPM(bidData)).to.equal(bidData.ext.encp);
    });
  });

  describe('handleBidRequestResponse()', () => {
    let jsonParseStub = null;
    before(()=> {
      jsonParseStub = sinon.stub(window.JSON, 'parse');
    });

    after(() => {
      jsonParseStub.reset();
    });

    it('should not call externalBidRequestHandler when cannot create bid response', () => {
      let manager = getBidsManager();
      let bidResponseHandlerSpy = sinon.spy();
      let createBidResponseStub = sinon.stub(manager, 'createBidResponse').returns(false);
      manager.bidRequestConfig.onBidResponse = bidResponseHandlerSpy;

      manager.handleBidRequestResponse();
      expect(createBidResponseStub.calledOnce).to.be.true;
      expect(bidResponseHandlerSpy.calledOnce).to.be.false;
    });

    it('should call externalBidRequestHandler when it is specified', () => {
      let manager = getBidsManager();
      let bidResponseHandlerSpy = sinon.spy();
      let createBidResponseStub = sinon.stub(manager, 'createBidResponse').returns(true);
      manager.bidRequestConfig.onBidResponse = bidResponseHandlerSpy;

      manager.handleBidRequestResponse();
      expect(createBidResponseStub.calledOnce).to.be.true;
      expect(bidResponseHandlerSpy.calledOnce).to.be.true;
    });
  });

  describe('createBidResponse()', () => {
    it('should be undefined when cannot format bid response', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'formatBidResponse').returns(false);
      expect(manager.createBidResponse()).to.be.undefined;
    });

    it('should add new bid response and return added item', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'formatBidResponse').returns({
        bidResponseProperty: 'some-value'
      });
      sinon.stub(manager, 'addNewBidResponse');

      expect(manager.createBidResponse()).to.deep.equal({
        bidResponseProperty: 'some-value'
      });
    });
  });

  describe('formatBidResponse()', () => {
    it('should be undefined when no bid data is returned', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidData');
      sinon.stub(manager, 'getPixels');

      expect(manager.formatBidResponse()).to.equal(undefined);
    });

    it('should return formatted bid response object', () => {
      let manager = getBidsManager();
      let bidResponse = {
        w: 'ad-width',
        h: 'ad-height',
        crid: 'creative-id',
        adm: 'bid-response-ad'
      };
      let placementConfig = {
        adContainerId: 'ad-container-id',
        alias: 'placement-alias'
      };
      sinon.stub(manager, 'getPixels').returns('get-pixels-result');
      sinon.stub(manager, 'getCPM').returns('cpm-stubbed');
      sinon.stub(manager, 'getBidData').withArgs(bidResponse).returns(bidResponse);

      let formattedBidResponse = manager.formatBidResponse(bidResponse, placementConfig);
      expect(formattedBidResponse).to.deep.equal({
        cpm: 'cpm-stubbed',
        ad: 'bid-response-ad',
        pixels: 'get-pixels-result',
        adContainerId: 'ad-container-id',
        width: 'ad-width',
        height: 'ad-height',
        creativeId: 'creative-id',
        bidderCode: manager.bidderKey,
        aliasKey: manager.aliasKey,
        alias: 'placement-alias'
      });
    });
  });

  describe('getBidResponseByAlias()', () => {
    let manager = null;

    beforeEach(() => {
      manager = getBidsManager();
      manager.bidResponses = [
        {alias: 'alias1', name: 'name1'},
        {alias: 'alias2', name: 'name2'},
        {alias: 'alias3', name: 'name3'}
      ];
    });

    it('should return undefined for undefined parameter', () => {
      expect(manager.getBidResponseByAlias(undefined)).to.equal.undefined;
    });

    it('should return undefined for empty string parameter', () => {
      expect(manager.getBidResponseByAlias('')).to.equal.true;
    });

    it('should return undefined for non-existing alias', () => {
      expect(manager.getBidResponseByAlias('alias')).to.equal.undefined;
    });

    it('should return placement config for existing alias', () => {
      expect(manager.getBidResponseByAlias('alias2')).
        to.deep.equal(manager.bidResponses[1]);
    });
  });

  describe('addNewBidResponse()', () => {
    it('should add new bid response in the array ', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns(false);

      manager.addNewBidResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });

    it('should replace existing bid response object in the array ', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns('existingBidResponse');
      manager.bidResponses = ['existingBidResponse'];

      manager.addNewBidResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });
  });

  describe('getPlacementConfigByAlias()', () => {
    let manager = null;

    beforeEach(() => {
      manager = getBidsManager();
      manager.placementsConfigs = [
        {alias: 'alias1', name: 'name1'},
        {alias: 'alias2', name: 'name2'},
        {alias: 'alias3', name: 'name3'}
      ];
    });

    it('should return undefined for undefined parameter', () => {
      expect(manager.getPlacementConfigByAlias(undefined)).to.equal.undefined;
    });

    it('should return undefined for empty string parameter', () => {
      expect(manager.getPlacementConfigByAlias('')).to.equal.undefined;
    });

    it('should return undefined for non-existing alias', () => {
      expect(manager.getPlacementConfigByAlias('alias')).to.equal.undefined;
    });

    it('should return placement config for existing alias', () => {
      expect(manager.getPlacementConfigByAlias('alias2')).
        to.deep.equal(manager.placementsConfigs[1]);
    });
  });

  describe('checkBidResponsesState()', () => {
    it('should not call onAllBidResponse handler when no responses are returned', () => {
      let manager = getBidsManager();
      manager.placementsConfigs = [1, 2, 3];
      manager.bidResponses = [1, 2, 3, 4];
      let onAllBidResponsesSpy = sinon.spy();
      manager.bidRequestConfig.onAllBidResponses = onAllBidResponsesSpy;

      manager.checkBidResponsesState();

      expect(onAllBidResponsesSpy.called).to.be.false;
    });

    it('should call onAllBidResponse handler when all responses are returned', () => {
      let manager = getBidsManager();
      manager.placementsConfigs = [1, 2, 3];
      manager.bidResponses = [1, 2, 3];
      let onAllBidResponsesSpy = sinon.spy();
      manager.bidRequestConfig.onAllBidResponses = onAllBidResponsesSpy;

      manager.checkBidResponsesState();

      expect(onAllBidResponsesSpy.calledOnce).to.be.true;
    });
  });

  describe('isUserSyncOnBidResponseMode()', () => {
    it('should be true when userSyncOn is undefined', () => {
      let manager = getBidsManager({
        userSyncOn: undefined
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.true;
    });

    it('should be true when userSyncOn is null', () => {
      let manager = getBidsManager({
        userSyncOn: undefined
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.true;
    });

    it('should be true when userSyncOn is bidResponse', () => {
      let manager = getBidsManager({
        userSyncOn: BidsManager.HEADER_BIDDING_EVENTS.bidResponse
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.true;
    });

    it('should be false when userSyncOn is adRender', () => {
      let manager = getBidsManager({
        userSyncOn: BidsManager.HEADER_BIDDING_EVENTS.adRender
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.false;
    });
  });
});
