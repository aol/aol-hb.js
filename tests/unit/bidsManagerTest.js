import BidsManager from 'src/bidsManager';
import utils from 'src/helpers/utils';
import * as ajax from 'src/helpers/ajax';

describe('BidsManager', () => {
  let getBidsManager = () => {
    return new BidsManager({}, []);
  };

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

    it('Should resolve bid request url', () => {
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

  it('Resolve bid floor price method test', () => {
    let manager = getBidsManager();

    expect(manager.resolveBidFloorPrice()).to.equal('');
    expect(manager.resolveBidFloorPrice(0)).to.equal('');
    expect(manager.resolveBidFloorPrice(29)).to.equal('bidfloor=29;');
  });

  it('Send bid requests method test', () => {
    let manager = getBidsManager();
    let sendGetRequestStub = sinon.stub(ajax, 'sendGetRequest');
    let formatUrlStub = sinon.stub(manager, 'formatBidRequestUrl');

    manager.placementsConfigs = [{}, {}, {}];
    manager.sendBidRequests();
    expect(sendGetRequestStub.callCount).to.equal(3, 'Three bid requests sent');
    expect(formatUrlStub.callCount).to.equal(3, 'Bid request urls formatted three times bid');

    sendGetRequestStub.reset();
  });

  it('Get bid data method test', () => {
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

    bidResponse = {
      seatbid: [
        {
          bid: ['test-object']
        }
      ]
    };
    expect(manager.getBidData(bidResponse)).to.equal('test-object');
  });

  it('Get Pixels method test', () => {
    let manager = getBidsManager();
    let bidResponse = {};
    expect(manager.getPixels(bidResponse)).to.be.undefined;

    bidResponse = {
      ext: {}
    };
    expect(manager.getPixels(bidResponse)).to.be.undefined;

    bidResponse = {
      ext: {
        pixels: 'pixels-content'
      }
    };
    expect(manager.getPixels(bidResponse)).to.equal(bidResponse.ext.pixels);
  });

  it('Get CPM method test', () => {
    let manager = getBidsManager();
    let bidData = {
      price: 5
    };

    expect(manager.getCPM(bidData)).to.equal(bidData.price);

    bidData.ext = {};
    expect(manager.getCPM(bidData)).to.equal(bidData.price);

    // If encp is defined it is used instead price field
    bidData.ext = {
      encp: 10
    };
    expect(manager.getCPM(bidData)).to.equal(bidData.ext.encp);
  });

  it('Format Ad method test', () => {
    let manager = getBidsManager();

    expect(manager.formatAd('ad-content', null)).to.equal('ad-content');
    expect(manager.formatAd('ad-content', '/pixes-content')).to.equal('ad-content/pixes-content');
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
      sinon.stub(manager, 'addBidNewResponse');

      expect(manager.createBidResponse()).to.deep.equal({
        bidResponseProperty: 'some-value'
      });
    });
  });

  it('Format bid response method test', () => {
    let manager = getBidsManager();
    let getBidDataStub = sinon.stub(manager, 'getBidData');
    sinon.stub(manager, 'getPixels');
    sinon.stub(manager, 'getCPM').returns('cpm-stubbed');
    sinon.stub(manager, 'formatAd').returns('ad-formatted');

    expect(manager.formatBidResponse()).to.equal(undefined);

    let bidResponse = {
      w: 'ad-width',
      h: 'ad-height',
      crid: 'creative-id'
    };
    let placementConfig = {
      adContainerId: 'ad-container-id',
      alias: 'placement-alias'
    };
    getBidDataStub.withArgs(bidResponse).returns(bidResponse);
    let formattedBidResponse = manager.formatBidResponse(bidResponse, placementConfig);
    expect(formattedBidResponse).to.deep.equal({
      cpm: 'cpm-stubbed',
      ad: 'ad-formatted',
      adContainerId: 'ad-container-id',
      width: 'ad-width',
      height: 'ad-height',
      creativeId: 'creative-id',
      bidderCode: BidsManager.BIDDER_CODE,
      aliasKey: BidsManager.ALIAS_KEY,
      alias: 'placement-alias'
    });
  });

  it('Get bid response by alias method test', () => {
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

  describe('addBidNewResponse()', () => {
    it('Should add new bid response in the array ', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns(false);

      manager.addBidNewResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });

    it('Should replace existing bid response object in the array ', () => {
      let manager = getBidsManager();
      sinon.stub(manager, 'getBidResponseByAlias').returns('existingBidResponse');
      manager.bidResponses = ['existingBidResponse'];

      manager.addBidNewResponse('bidResponseObject');

      expect(manager.bidResponses).to.deep.equal(['bidResponseObject']);
    });
  });
});
