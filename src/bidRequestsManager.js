import {sendGetRequest} from './helpers/ajax';
import utils from './helpers/utils';

export default class BidRequestManager {
  constructor(bidRequestConfig, placementsConfigs) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementsConfigs = placementsConfigs;
  }

  sendBidRequests() {
    let self = this;
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/pubapi/3.0/${'network'}/
      ${'placement'}/0/-1/ADTECH;cmd=bid;cors=yes;
      v=2;alias=${'alias'};${'bidFloorPrice'};`;
    let hostName = self.resolveHostHame();

    this.placementsConfigs.forEach((item) => {
      sendGetRequest(url({
        protocol: utils.resolveHttpProtocol(document.location.protocol),
        hostName: hostName,
        network: this.bidRequestConfig.network,
        placement: parseInt(item.placement),
        alias: item.alias,
        bidFloorPrice: self.resolveBidFloorPrice(item.bidFloorPrice)
      }));
    });
  }

  resolveBidFloorPrice(floorPrice) {
    return floorPrice ? `bidfloor=${floorPrice.toString()}` : '';
  }

  resolveHostHame() {
    const SERVER_MAP = {
      EU: 'adserver.adtech.de',
      US: 'adserver.adtechus.com',
      Asia: 'adserver.adtechjp.com'
    };
    return SERVER_MAP[this.bidRequestConfig.region] || SERVER_MAP.US;
  }
}
