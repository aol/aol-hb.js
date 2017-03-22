import BidManager from 'src/bidManager';
import MarketplaceBidRequest from 'bidRequests/marketplace';
import NexageGetBidRequest from 'bidRequests/nexageGet';
import NexagePostBidRequest from 'bidRequests/nexagePost';

describe('BidManager', () => {
  let getBidManager = (bidRequestConfig) => {
    return new BidManager(bidRequestConfig || {}, []);
  };

  describe('constructor()', () => {
    it('should set default values for bidderKey and aliasKey', () => {
      let manager = getBidManager();

      expect(manager.bidderKey).to.equal('aolbid');
      expect(manager.aliasKey).to.equal('mpalias');
    });

    it('should override bidderKey and aliasKey by values from placementConfig', () => {
      let manager = getBidManager({
        bidderKey: 'overridden-bidder-key',
        aliasKey: 'overridden-alias-key'
      });

      expect(manager.bidderKey).to.equal('overridden-bidder-key');
      expect(manager.aliasKey).to.equal('overridden-alias-key');
    });
  });

  describe('sendBidRequests()', () => {
    it('should call sendBidRequest for each placement config', () => {
      let manager = getBidManager();
      let sendBidRequestStub = sinon.stub(manager, 'sendBidRequest');

      manager.placementsConfigs = [{}, {}, {}];
      manager.sendBidRequests();
      expect(sendBidRequestStub.callCount).to.equal(3, 'sendBidRequest called three times');
    });
  });

  describe('getBidData()', () => {
    it('should return undefined when bid response is undefined', () => {
      let manager = getBidManager();

      expect(manager.getBidData(undefined)).to.be.undefined;
    });

    it('should return undefined when bid data is empty array', () => {
      let manager = getBidManager();
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
      let manager = getBidManager();
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
      let manager = getBidManager();
      let bidResponse = {
        ext: {}
      };

      expect(manager.getPixels(bidResponse)).to.be.undefined;
    });

    it('should return pixels value when it is present', () => {
      let manager = getBidManager();
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
      let manager = getBidManager();
      let bidData = {
        price: 5,
        ext: {}
      };

      expect(manager.getCPM(bidData)).to.equal(bidData.price);
    });

    it('should return encp when it is present', () => {
      let manager = getBidManager();
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
      let manager = getBidManager();
      let bidResponseHandlerSpy = sinon.spy();
      let createBidResponseStub = sinon.stub(manager, 'createBidResponse').returns(false);
      manager.bidRequestConfig.onBidResponse = bidResponseHandlerSpy;

      manager.handleBidRequestResponse();
      expect(createBidResponseStub.calledOnce).to.be.true;
      expect(bidResponseHandlerSpy.calledOnce).to.be.false;
    });

    it('should call externalBidRequestHandler when it is specified', () => {
      let manager = getBidManager();
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
      let manager = getBidManager();
      sinon.stub(manager, 'formatBidResponse').returns(false);
      expect(manager.createBidResponse()).to.be.undefined;
    });

    it('should add new bid response and return added item', () => {
      let manager = getBidManager();
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
      let manager = getBidManager();
      sinon.stub(manager, 'getBidData');
      sinon.stub(manager, 'getPixels');

      expect(manager.formatBidResponse()).to.equal(undefined);
    });

    it('should return formatted bid response object', () => {
      let manager = getBidManager();
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
      manager = getBidManager();
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
      let manager = getBidManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns(false);

      manager.addNewBidResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });

    it('should replace existing bid response object in the array ', () => {
      let manager = getBidManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns('existingBidResponse');
      manager.bidResponses = ['existingBidResponse'];

      manager.addNewBidResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });
  });

  describe('getPlacementConfigByAlias()', () => {
    let manager = null;

    beforeEach(() => {
      manager = getBidManager();
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
      let manager = getBidManager();
      manager.placementsConfigs = [1, 2, 3];
      manager.bidResponses = [1, 2, 3, 4];
      let onAllBidResponsesSpy = sinon.spy();
      manager.bidRequestConfig.onAllBidResponses = onAllBidResponsesSpy;

      manager.checkBidResponsesState();

      expect(onAllBidResponsesSpy.called).to.be.false;
    });

    it('should call onAllBidResponse handler when all responses are returned', () => {
      let manager = getBidManager();
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
      let manager = getBidManager({
        userSyncOn: undefined
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.true;
    });

    it('should be true when userSyncOn is null', () => {
      let manager = getBidManager({
        userSyncOn: undefined
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.true;
    });

    it('should be true when userSyncOn is bidResponse', () => {
      let manager = getBidManager({
        userSyncOn: BidManager.HEADER_BIDDING_EVENTS.bidResponse
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.true;
    });

    it('should be false when userSyncOn is adRender', () => {
      let manager = getBidManager({
        userSyncOn: BidManager.HEADER_BIDDING_EVENTS.adRender
      });

      expect(manager.isUserSyncOnBidResponseMode()).to.be.false;
    });
  });

  describe('addNewAd()', () => {
    let manager;
    let addNewPlacementConfigStub;
    let sendBidRequestStub;

    beforeEach(() => {
      manager = getBidManager();
      addNewPlacementConfigStub = sinon.stub(manager, 'addNewPlacementConfig');
      sendBidRequestStub = sinon.stub(manager, 'sendBidRequest');
    });

    afterEach(() => {
      addNewPlacementConfigStub.reset();
      sendBidRequestStub.reset();
    });

    it('should not call addNewPlacementConfig and sendBidRequest for undefined parameter', () => {
      manager.addNewAd(undefined);

      expect(addNewPlacementConfigStub.calledOnce).to.be.false;
      expect(sendBidRequestStub.calledOnce).to.be.false;
    });

    it('should not call addNewPlacementConfig and sendBidRequest for null parameter', () => {
      manager.addNewAd(null);

      expect(addNewPlacementConfigStub.calledOnce).to.be.false;
      expect(sendBidRequestStub.calledOnce).to.be.false;
    });

    it('should call addNewPlacementConfig and sendBidRequest once for specified parameter', () => {
      let placementConfig = {
        alias: 'placement-alias'
      };

      manager.addNewAd(placementConfig);

      expect(addNewPlacementConfigStub.withArgs(placementConfig).calledOnce).to.be.true;
      expect(sendBidRequestStub.withArgs(placementConfig).calledOnce).to.be.true;
    });
  });

  describe('refreshAd()', () => {
    let manager;
    let getPlacementConfigStub;
    let sendBidRequestStub;

    beforeEach(() => {
      manager = getBidManager();
      getPlacementConfigStub = sinon.stub(manager, 'getPlacementConfigByAlias');
      sendBidRequestStub = sinon.stub(manager, 'sendBidRequest');
    });

    afterEach(() => {
      getPlacementConfigStub.reset();
      sendBidRequestStub.reset();
    });

    it('should not call sendBidRequest when placement config not found', () => {
      getPlacementConfigStub.returns(undefined);
      manager.refreshAd();

      expect(getPlacementConfigStub.calledOnce).to.be.true;
      expect(sendBidRequestStub.calledOnce).to.be.false;
    });

    it('should call sendBidRequest when placement config found', () => {
      let placementConfig = {
        alias: 'placement-alias'
      };
      getPlacementConfigStub.returns(placementConfig);
      manager.refreshAd();

      expect(getPlacementConfigStub.calledOnce).to.be.true;
      expect(sendBidRequestStub.withArgs(placementConfig).calledOnce).to.be.true;
    });
  });

  describe('addNewPlacementConfig()', () => {
    it('should add new placement config object in placement configs array', () => {
      let manager = getBidManager();
      let placementConfig = {
        alias: 'placement-alias'
      };

      manager.addNewPlacementConfig(placementConfig);

      expect(manager.placementsConfigs).to.deep.equal([placementConfig]);
    });
  });

  describe('isVideoPresent', () => {
    it('should not be ok if impression contains empty banner object', () => {
      let manager = getBidManager();
      let impression = {
        banner: {}
      };

      expect(manager.isBannerPresent(impression)).to.not.be.ok;
    });

    it('should not be ok if only witdh is specified for banner object', () => {
      let manager = getBidManager();
      let impression = {
        banner: {
          w: 10
        }
      };

      expect(manager.isBannerPresent(impression)).to.not.be.ok;
    });

    it('should not be ok if only height is specified for banner object', () => {
      let manager = getBidManager();
      let impression = {
        banner: {
          h: 15
        }
      };

      expect(manager.isBannerPresent(impression)).to.not.be.ok;
    });

    it('should be ok if width and height are specified for banner object', () => {
      let manager = getBidManager();
      let impression = {
        banner: {
          w: 10,
          h: 15
        }
      };

      expect(manager.isBannerPresent(impression)).to.be.ok;
    });
  });

  describe('isVideoPresent()', () => {
    it('should not be ok if impression contains empty video object', () => {
      let manager = getBidManager();
      let impression = {
        video: {}
      };

      expect(manager.isVideoPresent(impression)).to.not.be.ok;
    });

    it('should not be ok if only mimes is specified for video object', () => {
      let manager = getBidManager();
      let impression = {
        video: {
          mimes: '1'
        }
      };

      expect(manager.isVideoPresent(impression)).to.not.be.ok;
    });

    it('should not be ok if only minduration is specified for video object', () => {
      let manager = getBidManager();
      let impression = {
        video: {
          minduration: 10
        }
      };

      expect(manager.isVideoPresent(impression)).to.not.be.ok;
    });

    it('should not be ok if only maxduration is specified for video object', () => {
      let manager = getBidManager();
      let impression = {
        video: {
          maxduration: 10
        }
      };

      expect(manager.isVideoPresent(impression)).to.not.be.ok;
    });

    it('should not be ok if maxduration and minduration are specified for video object', () => {
      let manager = getBidManager();
      let impression = {
        video: {
          minduration: 10,
          maxduration: 10
        }
      };

      expect(manager.isVideoPresent(impression)).to.not.be.ok;
    });

    it('should not be ok if mimes and maxduration are specified for video object', () => {
      let manager = getBidManager();
      let impression = {
        video: {
          mimes: '1',
          maxduration: 10
        }
      };

      expect(manager.isVideoPresent(impression)).to.not.be.ok;
    });

    it('should be ok if mimes, minduration and maxduration are specified for video object', () => {
      let manager = getBidManager();
      let impression = {
        video: {
          mimes: '1',
          minduration: 10,
          maxduration: 10
        }
      };

      expect(manager.isVideoPresent(impression)).to.be.ok;
    });
  });

  describe('isImpressionValid()', () => {
    let manager;
    let isBannerPresentStub;
    let isVideoPresentStub;

    beforeEach(() => {
      manager = getBidManager();
      isBannerPresentStub = sinon.stub(manager, 'isBannerPresent').returns(false);
      isVideoPresentStub = sinon.stub(manager, 'isVideoPresent').returns(false);
    });

    afterEach(() => {
      isBannerPresentStub.reset();
      isVideoPresentStub.reset();
    });

    it('should not be ok if imp id param is undefined', () => {
      let impression = {
        id: undefined,
        tagid: 1234
      };
      isBannerPresentStub.returns(true);
      isVideoPresentStub.returns(true);

      expect(manager.isImpressionValid(impression)).to.not.be.ok;
    });

    it('should not be ok if imp tagid param is undefined', () => {
      let impression = {
        id: 1234,
        tagid: undefined
      };
      isBannerPresentStub.returns(true);
      isVideoPresentStub.returns(true);

      expect(manager.isImpressionValid(impression)).to.not.be.ok;
    });

    it('should not be ok if imp does not support banner and video types', () => {
      let impression = {
        id: 1234,
        tagid: 5678
      };
      isBannerPresentStub.returns(false);
      isVideoPresentStub.returns(false);

      expect(manager.isImpressionValid(impression)).to.not.be.ok;
    });

    it('should be ok if imp supports banner type', () => {
      let impression = {
        id: 1234,
        tagid: 5678
      };
      isBannerPresentStub.returns(true);
      isVideoPresentStub.returns(false);

      expect(manager.isImpressionValid(impression)).to.be.ok;
    });

    it('should be ok if imp supports video type', () => {
      let impression = {
        id: 1234,
        tagid: 5678
      };
      isBannerPresentStub.returns(false);
      isVideoPresentStub.returns(true);

      expect(manager.isImpressionValid(impression)).to.be.ok;
    });

    it('should be ok if imp supports banner and video types', () => {
      let impression = {
        id: 1234,
        tagid: 5678
      };
      isBannerPresentStub.returns(true);
      isVideoPresentStub.returns(true);

      expect(manager.isImpressionValid(impression)).to.be.ok;
    });
  });

  describe('isNexagePostRequest()', () => {
    let manager;
    let isImpressionValidStub;

    beforeEach(() => {
      manager = getBidManager();
      isImpressionValidStub = sinon.stub(manager, 'isImpressionValid').returns(true);
    });

    afterEach(() => {
      isImpressionValidStub.reset();
    });

    it('should not be ok when openRtbParams are undefined', () => {
      expect(manager.isNexagePostRequest(undefined)).to.not.be.ok;
    });

    it('should not be ok when id is not specified in openRtbParams', () => {
      let openRtbParams = {
        id: undefined,
        imp: [{}]
      };

      expect(manager.isNexagePostRequest(openRtbParams)).to.not.be.ok;
    });

    it('should not be ok when impressions array is empty', () => {
      let openRtbParams = {
        id: 1,
        imp: []
      };

      expect(manager.isNexagePostRequest(openRtbParams)).to.not.be.ok;
    });

    it('should not be ok when impression is invalid', () => {
      let openRtbParams = {
        id: 1,
        imp: [{
          banner: {}
        }]
      };
      isImpressionValidStub.returns(false);

      expect(manager.isNexagePostRequest(openRtbParams)).to.not.be.ok;
    });

    it('should be ok when valid impression is present', () => {
      let openRtbParams = {
        id: 1,
        imp: [{
          banner: {}
        }]
      };
      isImpressionValidStub.returns(true);

      expect(manager.isNexagePostRequest(openRtbParams)).to.be.ok;
    });
  });

  describe('resolveBidRequest()', () => {
    let manager;
    let isNexagePostRequestStub;

    beforeEach(() => {
      manager = getBidManager();
      isNexagePostRequestStub = sinon.stub(manager, 'isNexagePostRequest').returns(false);
    });

    afterEach(() => {
      isNexagePostRequestStub.reset();
    });

    it('should return NexageGetBidRequest object if dcn and pos are specified', () => {
      let bidRequest = {
        dcn: '1234'
      };
      let positionConfig = {
        pos: '1234'
      };
      let bidRequestObject = manager.resolveBidRequest(bidRequest, positionConfig);

      expect(bidRequestObject instanceof NexageGetBidRequest).to.be.true;
    });

    it('should return MarketplaceBidRequest object if network and placement are specified', () => {
      let bidRequest = {
        network: '9343.1'
      };
      let positionConfig = {
        placement: '1234'
      };
      let bidRequestObject = manager.resolveBidRequest(bidRequest, positionConfig);

      expect(bidRequestObject instanceof MarketplaceBidRequest).to.be.true;
    });

    it('should return NexagePostBidRequest object if isNexagePostRequestStub returns true', () => {
      isNexagePostRequestStub.returns(true);
      let bidRequestObject = manager.resolveBidRequest({}, {});

      expect(bidRequestObject instanceof NexagePostBidRequest).to.be.true;
    });
  });
});
