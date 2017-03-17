import utils from 'helpers/utils';
import {sendGetRequest} from 'helpers/ajax';

class MarketplaceRequest {
  constructor(bidRequestConfig, placementConfig) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementConfig = placementConfig;
  }

  formatUrl() {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/pubapi/3.0/${'network'}/
      ${'placement'}/0/-1/ADTECH;cmd=bid;cors=yes;
      v=2;alias=${'alias'};${'bidFloorPrice'}`;

    let options = {
      protocol: utils.resolveHttpProtocol(),
      hostName: this.resolveHostName(),
      network: this.bidRequestConfig.network,
      placement: parseInt(this.placementConfig.placement),
      alias: this.placementConfig.alias,
      bidFloorPrice: this.resolveBidFloorPrice(this.placementConfig.bidFloorPrice)
    };

    return url(options);
  }

  resolveHostName() {
    let serverMap = MarketplaceRequest.SERVER_MAP;

    return serverMap[this.bidRequestConfig.region] || serverMap.SERVER_MAP.US;
  }

  resolveBidFloorPrice(floorPrice) {
    return floorPrice ? `bidfloor=${floorPrice.toString()};` : '';
  }

  send(bidRequestHandler) {
    let bidRequestUrl = this.formatUrl(this.placementConfig);

    sendGetRequest(bidRequestUrl, bidRequestHandler);
  }
}

MarketplaceRequest.SERVER_MAP = {
  EU: 'adserver.adtech.de',
  US: 'adserver.adtechus.com',
  Asia: 'adserver.adtechjp.com'
};

export default MarketplaceRequest;
