import {sendGetRequest} from './helpers/ajax';

export default class BidRequestManager {
  constructor(bidRequestConfig, placementsConfigs) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementsConfigs = placementsConfigs;
  }

  sendBidRequests() {
    let url = 'http://adserver.adtechus.com/pubapi/3.0/9599.1/3675022/0' +
      '/-1/ADTECH;cmd=bid;cors=yes;bidfloor=0.1;' +
      'v=2;alias=728x90atf;grp=615;screenheight=1080;screenwidth=1920;' +
      'screendensity=1;kvscreenheight=1080;kvscreenwidth=1920;kvscreendensity=1;' +
      'kvviewportwidth=1920;kvviewportheight=224;misc=1478849557997';

    sendGetRequest(url);
  }
}
