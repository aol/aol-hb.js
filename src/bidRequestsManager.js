import {sendGetRequest} from './helpers/ajax';
import utils from './helpers/utils';

export default class BidRequestManager {
  constructor(bidRequestConfig, placementsConfigs) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementsConfigs = placementsConfigs;
    this.BIDDER_CODE = 'aolbid';
    this.ALIAS_KEY = 'mpalias';
  }

  sendBidRequests() {
    let self = this;

    this.placementsConfigs.forEach((config) => {
      sendGetRequest(self.formatBidRequestUrl({
        protocol: utils.resolveHttpProtocol(document.location.protocol),
        hostName: self.resolveHostName(),
        network: this.bidRequestConfig.network,
        placement: parseInt(config.placement),
        alias: config.alias,
        bidFloorPrice: self.resolveBidFloorPrice(config.bidFloorPrice)
      }), (bidResponse) => {
        self.handleBidRequestResponse(config, bidResponse);
      });
    });
  }

  formatBidRequestUrl(options) {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/pubapi/3.0/${'network'}/
      ${'placement'}/0/-1/ADTECH;cmd=bid;cors=yes;
      v=2;alias=${'alias'};${'bidFloorPrice'}`;

    return url(options);
  }

  handleBidRequestResponse(placementConfig, bidResponse) {
    let externalBidRequestHandler = this.bidRequestConfig.onBidResponse;

    if (externalBidRequestHandler) {
      let responseJson = JSON.parse(bidResponse);
      let bidData = this.getBidData(responseJson);

      if (bidData) {
        externalBidRequestHandler({
          cpm: this.getCpm(bidData),
          ad: this.getAd(bidData),
          adContainerId: placementConfig.adContainerId,
          width: bidData.w,
          height: bidData.h,
          creativeId: bidData.crid,
          bidderCode: this.BIDDER_CODE,
          aliasKey: this.ALIAS_KEY,
          alias: placementConfig.alias
        });
      }
    }
  }

  resolveBidFloorPrice(floorPrice) {
    return floorPrice ? `bidfloor=${floorPrice.toString()};` : '';
  }

  resolveHostName() {
    const SERVER_MAP = {
      EU: 'adserver.adtech.de',
      US: 'adserver.adtechus.com',
      Asia: 'adserver.adtechjp.com'
    };
    return SERVER_MAP[this.bidRequestConfig.region] || SERVER_MAP.US;
  }

  getBidData(bidResponse) {
    let bidData;

    try {
      bidData = bidResponse.seatbid[0].bid[0];

      return bidData;
    } catch (error) {
      return;
    }
  }

  getCpm(bidData) {
    if (bidData.ext && bidData.ext.encp) {
      return bidData.ext.encp;
    } else {
      return bidData.price;
    }
  }

  getAd(bidData) {
    let ad = bidData.adm;
    if (bidData.ext && bidData.ext.pixels) {
      ad += bidData.ext.pixels;
    }

    return ad;
  }
}
