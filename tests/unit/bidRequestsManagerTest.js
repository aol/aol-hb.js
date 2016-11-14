import BidRequestManager from 'src/bidRequestsManager';

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
});
