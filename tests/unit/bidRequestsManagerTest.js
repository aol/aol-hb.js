import BidRequestManager from 'src/bidRequestsManager';
import * as ajax from 'src/helpers/ajax';

describe('Bid request module tests', () => {
  it('Resolve http protocol method test', () => {
    let bidRequestManager = new BidRequestManager({}, []);

    bidRequestManager.bidRequestConfig.region = null;
    expect(bidRequestManager.resolveHostName()).to.equal('adserver.adtechus.com');

    bidRequestManager.bidRequestConfig.region = 'EU';
    expect(bidRequestManager.resolveHostName()).to.equal('adserver.adtech.de');

    bidRequestManager.bidRequestConfig.region = 'Asia';
    expect(bidRequestManager.resolveHostName()).to.equal('adserver.adtechjp.com');

    bidRequestManager.bidRequestConfig.region = 'US';
    expect(bidRequestManager.resolveHostName()).to.equal('adserver.adtechus.com');
  });

  it('Format bid request url method test', () => {
    let manager = new BidRequestManager({}, []);

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
    let manager = new BidRequestManager({}, []);

    expect(manager.resolveBidFloorPrice()).to.equal('');
    expect(manager.resolveBidFloorPrice(0)).to.equal('');
    expect(manager.resolveBidFloorPrice(29)).to.equal('bidfloor=29;');
  });

  it('Send bid requests method test', () => {
    let manager = new BidRequestManager({}, []);
    let sendGetRequestStub = sinon.stub(ajax, 'sendGetRequest');
    let formatUrlStub = sinon.stub(manager, 'formatBidRequestUrl');

    manager.placementsConfigs = [{}, {}, {}];
    manager.sendBidRequests();
    expect(sendGetRequestStub.callCount).to.equal(3, 'Three bid requests sent');
    expect(formatUrlStub.callCount).to.equal(3, 'Bid request urls formatted three times bid');

    sendGetRequestStub.reset();
  });

  it('Get bid data method test', () => {
    let manager = new BidRequestManager({}, []);

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
    let manager = new BidRequestManager({}, []);

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
    let manager = new BidRequestManager({}, []);
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
    let manager = new BidRequestManager({}, []);

    expect(manager.formatAd('ad-content', null)).to.equal('ad-content');
    expect(manager.formatAd('ad-content', '/pixes-content')).to.equal('ad-content/pixes-content');
  });
});
