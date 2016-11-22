import BidsManager from 'src/bidsManager';
import utils from 'src/helpers/utils';
import * as ajax from 'src/helpers/ajax';

describe('BidsManager', () => {
  let getBidsManager = (bidRequestConfig) => {
    return new BidsManager(bidRequestConfig || {}, []);
  };

  describe('constructor()', () => {
    it('Should set default values for bidderKey and aliasKey', () => {
      let manager = getBidsManager();

      expect(manager.bidderKey).to.equal('aolbid');
      expect(manager.aliasKey).to.equal('mpalias');
    });

    it('Should override bidderKey and aliasKey by values from placementConfig', () => {
      let manager = getBidsManager({
        bidderKey: 'overridden-bidder-key',
        aliasKey: 'overridden-alias-key'
      });

      expect(manager.bidderKey).to.equal('overridden-bidder-key');
      expect(manager.aliasKey).to.equal('overridden-alias-key');
    });
  });

  describe('resolveHostName()', () => {
    it('Should resolve host based on region param', () => {
      let manager = getBidsManager();
      manager.bidRequestConfig.region = null;
      expect(manager.resolveHostName()).to.equal('adserver.adtechus.com');

      manager.bidRequestConfig.region = 'EU';
      expect(manager.resolveHostName()).to.equal('adserver.adtech.de');

      manager.bidRequestConfig.region = 'Asia';
      expect(manager.resolveHostName()).to.equal('adserver.adtechjp.com');

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

    it('Should resolve bid request url without bid floor price', () => {
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

    it('Should resolve bid request url with specified bidFloorPrice', () => {
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
    it('Should be empty string when floor price is not defined', () => {
      let manager = getBidsManager();

      expect(manager.resolveBidFloorPrice()).to.equal('');
    });

    it('Should be empty string when floor price equals to 0', () => {
      let manager = getBidsManager();

      expect(manager.resolveBidFloorPrice(0)).to.equal('');
    });

    it('Should be formatted when floor price is defied', () => {
      let manager = getBidsManager();

      expect(manager.resolveBidFloorPrice(29)).to.equal('bidfloor=29;');
    });
  });

  describe('sendBidRequests()', () => {
    it('Should call sendBidRequest and formatUrl for each placement config', () => {
      let manager = getBidsManager();
      let sendGetRequestStub = sinon.stub(ajax, 'sendGetRequest');
      let formatUrlStub = sinon.stub(manager, 'formatBidRequestUrl');

      manager.placementsConfigs = [{}, {}, {}];
      manager.sendBidRequests();
      expect(sendGetRequestStub.callCount).to.equal(3, 'Three bid requests sent');
      expect(formatUrlStub.callCount).to.equal(3, 'Bid request urls formatted three times bid');

      sendGetRequestStub.reset();
    });
  });

  describe('getBidData()', () => {
    it('Should return undefined when bid data is not presented', () => {
      let manager = getBidsManager();
      let bidResponse = {};
      expect(manager.getBidData(bidResponse)).to.be.undefined;

      bidResponse = {
        seatbid: []
      };
      expect(manager.getBidData(bidResponse)).to.be.undefined;

      bidResponse = {
        seatbid: [
          {}
        ]
      };
      expect(manager.getBidData(bidResponse)).to.be.undefined;

      bidResponse = {
        seatbid: [
          {
            bid: []
          }
        ]
      };
      expect(manager.getBidData(bidResponse)).to.be.undefined;
    });

    it('Should return bid data when it is presented', () => {
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
    it('Should return empty when pixels are not presented', () => {
      let manager = getBidsManager();
      let bidResponse = {};
      expect(manager.getPixels(bidResponse)).to.be.undefined;

      bidResponse = {
        ext: {}
      };
      expect(manager.getPixels(bidResponse)).to.be.undefined;
    });

    it('Should return pixels value when it is presented', () => {
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
    it('Should use price field as cpm when encp is not defined', () => {
      let manager = getBidsManager();
      let bidData = {
        price: 5
      };

      expect(manager.getCPM(bidData)).to.equal(bidData.price);

      bidData.ext = {};
      expect(manager.getCPM(bidData)).to.equal(bidData.price);
    });

    it('Should use encp field as cpm', () => {
      let manager = getBidsManager();
      let bidData = {
        ext: {
          encp: 10
        }
      };

      expect(manager.getCPM(bidData)).to.equal(bidData.ext.encp);
    });
  });

  describe('formatAd()', () => {
    it('Should format ad without pixels', () => {
      let manager = getBidsManager();

      expect(manager.formatAd('ad-content', null)).to.equal('ad-content');
    });

    it('Should format ad with pixels', () => {
      let manager = getBidsManager();

      expect(manager.formatAd('ad-content', '/pixes-content')).to.equal('ad-content/pixes-content');
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

    it('Should not call externalBidRequestHandler when cannot create bid response', () => {
      let manager = getBidsManager();
      let bidResponseHandlerSpy = sinon.spy();
      let createBidResponseStub = sinon.stub(manager, 'createBidResponse').returns(false);
      manager.bidRequestConfig.onBidResponse = bidResponseHandlerSpy;

      manager.handleBidRequestResponse();
      expect(createBidResponseStub.calledOnce).to.be.true;
      expect(bidResponseHandlerSpy.calledOnce).to.be.false;
    });

    it('Should call externalBidRequestHandler when it is specified', () => {
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
    it('Should be undefined when cannot format bid response', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'formatBidResponse').returns(false);
      expect(manager.createBidResponse()).to.be.undefined;
    });

    it('Should add new bid response and return added item', () => {
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
    it('Should be undefined when no bid data is returned', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidData');
      sinon.stub(manager, 'getPixels');

      expect(manager.formatBidResponse()).to.equal(undefined);
    });

    it('Should return formatted bid response object', () => {
      let manager = getBidsManager();
      let bidResponse = {
        w: 'ad-width',
        h: 'ad-height',
        crid: 'creative-id'
      };
      let placementConfig = {
        adContainerId: 'ad-container-id',
        alias: 'placement-alias'
      };
      sinon.stub(manager, 'getPixels');
      sinon.stub(manager, 'getCPM').returns('cpm-stubbed');
      sinon.stub(manager, 'formatAd').returns('ad-formatted');
      sinon.stub(manager, 'getBidData').withArgs(bidResponse).returns(bidResponse);

      let formattedBidResponse = manager.formatBidResponse(bidResponse, placementConfig);
      expect(formattedBidResponse).to.deep.equal({
        cpm: 'cpm-stubbed',
        ad: 'ad-formatted',
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
    it('Should return bid response object based on alias', () => {
      let manager = getBidsManager();
      manager.bidResponses = [
        {alias: 'alias1', name: 'name1'},
        {alias: 'alias2', name: 'name2'},
        {alias: 'alias3', name: 'name3'}
      ];

      expect(manager.getBidResponseByAlias('')).to.equal.undefined;
      expect(manager.getBidResponseByAlias('alias')).to.equal.undefined;
      expect(manager.getBidResponseByAlias('alias1')).to.deep.equal(manager.bidResponses[0]);
      expect(manager.getBidResponseByAlias('alias3')).to.deep.equal(manager.bidResponses[2]);
      expect(manager.getBidResponseByAlias('alias2')).to.deep.equal(manager.bidResponses[1]);
      expect(manager.getBidResponseByAlias(143)).to.equal.undefined;
    });
  });

  describe('addNewBidResponse()', () => {
    it('Should add new bid response in the array ', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns(false);

      manager.addNewBidResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });

    it('Should replace existing bid response object in the array ', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns('existingBidResponse');
      manager.bidResponses = ['existingBidResponse'];

      manager.addNewBidResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });
  });

  describe('getPlacementConfigByAlias()', () => {
    it('Should return placement config based on alias', () => {
      let manager = getBidsManager();
      manager.placementsConfigs = [
        {alias: 'alias1', name: 'name1'},
        {alias: 'alias2', name: 'name2'},
        {alias: 'alias3', name: 'name3'}
      ];

      expect(manager.getPlacementConfigByAlias(undefined)).to.equal.undefined;
      expect(manager.getPlacementConfigByAlias('')).to.equal.undefined;
      expect(manager.getPlacementConfigByAlias('alias')).to.equal.undefined;
      expect(manager.getPlacementConfigByAlias(143)).to.equal.undefined;

      expect(manager.getPlacementConfigByAlias('alias1')).
        to.deep.equal(manager.placementsConfigs[0]);
      expect(manager.getPlacementConfigByAlias('alias3')).
        to.deep.equal(manager.placementsConfigs[2]);
      expect(manager.getPlacementConfigByAlias('alias2')).
        to.deep.equal(manager.placementsConfigs[1]);

    });
  });

  describe('checkBidResponsesState()', () => {
    it('Should not call onAllBidResponse handler when no responses are returned', () => {
      let manager = getBidsManager();
      manager.placementsConfigs = [1, 2, 3];
      manager.bidResponses = [1, 2, 3, 4];
      let onAllBidResponsesSpy = sinon.spy();
      manager.bidRequestConfig.onAllBidResponses = onAllBidResponsesSpy;

      manager.checkBidResponsesState();

      expect(onAllBidResponsesSpy.called).to.be.false;
    });

    it('Should call onAllBidResponse handler when all responses are returned', () => {
      let manager = getBidsManager();
      manager.placementsConfigs = [1, 2, 3];
      manager.bidResponses = [1, 2, 3];
      let onAllBidResponsesSpy = sinon.spy();
      manager.bidRequestConfig.onAllBidResponses = onAllBidResponsesSpy;

      manager.checkBidResponsesState();

      expect(onAllBidResponsesSpy.calledOnce).to.be.true;
    });
  });
});
