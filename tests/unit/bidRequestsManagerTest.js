import BidRequestManager from 'src/bidRequestsManager';

describe('Bid request module tests', () => {
  it('Resolve http protocol method test', () => {
    let bidRequestManager = new BidRequestManager({}, []);

    bidRequestManager.bidRequestConfig.region = null;
    expect(bidRequestManager.resolveHostHame()).to.equal('adserver.adtechus.com');

    bidRequestManager.bidRequestConfig.region = 'EU';
    expect(bidRequestManager.resolveHostHame()).to.equal('adserver.adtech.de');

    bidRequestManager.bidRequestConfig.region = 'Asia';
    expect(bidRequestManager.resolveHostHame()).to.equal('adserver.adtechjp.com');

    bidRequestManager.bidRequestConfig.region = 'US';
    expect(bidRequestManager.resolveHostHame()).to.equal('adserver.adtechus.com');
  });
});
