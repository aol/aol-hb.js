import BidsManager from 'src/bidsManager';
import * as ajax from 'src/helpers/ajax';

describe('Bid request module tests', () => {

  let manager;

  beforeEach(() => {
    manager = new BidsManager({}, []);
  });

  it('Resolve host name method test', () => {
    manager.bidRequestConfig.region = null;
    expect(manager.resolveHostName()).to.equal('adserver.adtechus.com');

    manager.bidRequestConfig.region = 'EU';
    expect(manager.resolveHostName()).to.equal('adserver.adtech.de');

    manager.bidRequestConfig.region = 'Asia';
    expect(manager.resolveHostName()).to.equal('adserver.adtechjp.com');

    manager.bidRequestConfig.region = 'US';
    expect(manager.resolveHostName()).to.equal('adserver.adtechus.com');
  });

  it('Format bid request url method test', () => {
    let bidRequestUrl = manager.formatBidRequestUrl({
      protocol: 'https',
      hostName: 'test.com',
      network: '5404.10',
      placement: 'placement-id',
      alias: '54'
    });
    let expectedUrl = 'https://test.com/pubapi/3.0/5404.10/placement-id/0/-1/ADTECH;' +
      'cmd=bid;cors=yes;v=2;alias=54;';
    expect(bidRequestUrl).to.equal(expectedUrl);

    // Format url with specified bid floor price option
    bidRequestUrl = manager.formatBidRequestUrl({
      protocol: 'https',
      hostName: 'test.com',
      network: '5404.10',
      placement: 'placement-id',
      alias: '54',
      bidFloorPrice: 'bid-floor-price'
    });
    expectedUrl = 'https://test.com/pubapi/3.0/5404.10/placement-id/0/-1/ADTECH;' +
      'cmd=bid;cors=yes;v=2;alias=54;bid-floor-price';
    expect(bidRequestUrl).to.equal(expectedUrl);
  });

  it('Resolve bid floor price method test', () => {
    expect(manager.resolveBidFloorPrice()).to.equal('');
    expect(manager.resolveBidFloorPrice(0)).to.equal('');
    expect(manager.resolveBidFloorPrice(29)).to.equal('bidfloor=29;');
  });

  it('Send bid requests method test', () => {
    let sendGetRequestStub = sinon.stub(ajax, 'sendGetRequest');
    let formatUrlStub = sinon.stub(manager, 'formatBidRequestUrl');

    manager.placementsConfigs = [{}, {}, {}];
    manager.sendBidRequests();
    expect(sendGetRequestStub.callCount).to.equal(3, 'Three bid requests sent');
    expect(formatUrlStub.callCount).to.equal(3, 'Bid request urls formatted three times bid');

    sendGetRequestStub.reset();
  });

  it('Get bid data method test', () => {
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
    expect(manager.formatAd('ad-content', null)).to.equal('ad-content');
    expect(manager.formatAd('ad-content', '/pixes-content')).to.equal('ad-content/pixes-content');
  });

  it('Handle bid request response method test', () => {
    let createBidResponseStub = sinon.stub(manager, 'createBidResponse');
    let parseJsonStub = sinon.stub(manager, 'parseJson');
    let bidResponseHandlerSpy = sinon.spy();

    manager.bidRequestConfig.onBidResponse = null;
    manager.handleBidRequestResponse();
    expect(createBidResponseStub.called).to.be.true;
    expect(parseJsonStub.called).to.be.true;
    expect(bidResponseHandlerSpy.called).to.be.false;

    manager.bidRequestConfig.onBidResponse = bidResponseHandlerSpy;
    manager.handleBidRequestResponse();
    expect(createBidResponseStub.called).to.be.true;
    expect(parseJsonStub.called).to.be.true;
    expect(bidResponseHandlerSpy.called).to.be.false;

    manager.bidRequestConfig.onBidResponse = bidResponseHandlerSpy;
    createBidResponseStub.returns(true);
    manager.handleBidRequestResponse();
    expect(createBidResponseStub.called).to.be.true;
    expect(parseJsonStub.called).to.be.true;
    expect(bidResponseHandlerSpy.called).to.be.true;

    createBidResponseStub.reset();
    parseJsonStub.reset();
  });

  it('Create bid response method test', () => {
    let formatBidResponseStub = sinon.stub(manager, 'formatBidResponse').returns(false);
    expect(manager.bidResponses).to.be.empty;
    manager.createBidResponse();

    formatBidResponseStub.returns({key: 'some-value'});
    manager.createBidResponse();
    // Test that bid response was added in the bid responses array.
    expect(manager.bidResponses[0]).to.deep.equal({key: 'some-value'});
  });
});
