import {sendGetRequest} from './helpers/ajax';
import utils from './helpers/utils';

/***
 * The class contains logic for processing bid
 * requests and handling bid responses.
 */
class BidsManager {
  constructor(bidRequestConfig, placementsConfigs) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementsConfigs = placementsConfigs;
    this.bidResponses = [];
  }

  /**
   *  Send bid request for each placement from placementsConfigs.
   */
  sendBidRequests() {
    this.placementsConfigs.forEach((config) => {
      sendGetRequest(this.formatBidRequestUrl({
        protocol: utils.resolveHttpProtocol(document.location.protocol),
        hostName: this.resolveHostName(),
        network: this.bidRequestConfig.network,
        placement: parseInt(config.placement),
        alias: config.alias,
        bidFloorPrice: this.resolveBidFloorPrice(config.bidFloorPrice)
      }), (bidResponse) => {
        this.handleBidRequestResponse(config, bidResponse);
      });
    });
  }

  formatBidRequestUrl(options) {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/pubapi/3.0/${'network'}/
      ${'placement'}/0/-1/ADTECH;cmd=bid;cors=yes;
      v=2;alias=${'alias'};${'bidFloorPrice'}`;

    return url(options);
  }

  handleBidRequestResponse(placementConfig, response) {
    let externalBidRequestHandler = this.bidRequestConfig.onBidResponse;

    let responseJson = this.parseJson(response);
    let bidResponse = this.createBidResponse(responseJson, placementConfig);

    if (bidResponse && externalBidRequestHandler) {
      externalBidRequestHandler(bidResponse);
    }
  }

  parseJson(text) {
    return JSON.parse(text);
  }

  resolveBidFloorPrice(floorPrice) {
    return floorPrice ? `bidfloor=${floorPrice.toString()};` : '';
  }

  resolveHostName() {
    return BidsManager.SERVER_MAP[this.bidRequestConfig.region] || BidsManager.SERVER_MAP.US;
  }

  getBidData(bidResponse) {
    try {
      return bidResponse.seatbid[0].bid[0];
    } catch (error) {
      return;
    }
  }

  getPixels(bidResponse) {
    try {
      return bidResponse.ext.pixels;
    } catch (error) {
      return;
    }
  }

  getCPM(bidData) {
    return bidData.ext && bidData.ext.encp ? bidData.ext.encp : bidData.price;
  }

  formatAd(ad, pixels) {
    if (pixels) {
      ad += pixels;
    }

    return ad;
  }

  createBidResponse(bidResponseJson, placementConfig) {
    let bidResponse = this.formatBidResponse(bidResponseJson, placementConfig);

    if (bidResponse) {
      this.bidResponses.push(bidResponse);

      return bidResponse;
    }
  }

  formatBidResponse(bidResponseJson, placementConfig) {
    let bidData = this.getBidData(bidResponseJson);
    let pixels = this.getPixels(bidResponseJson);

    if (bidData) {
      return {
        cpm: this.getCPM(bidData),
        ad: this.formatAd(bidData.adm, pixels),
        adContainerId: placementConfig.adContainerId,
        width: bidData.w,
        height: bidData.h,
        creativeId: bidData.crid,
        bidderCode: BidsManager.BIDDER_CODE,
        aliasKey: BidsManager.ALIAS_KEY,
        alias: placementConfig.alias
      };
    }
  }

  getBidResponseByAlias(alias) {
    return utils.find(this.bidResponses, (item) => {
      return item.alias === alias;
    });
  }
}

BidsManager.SERVER_MAP = {
  EU: 'adserver.adtech.de',
  US: 'adserver.adtechus.com',
  Asia: 'adserver.adtechjp.com'
};
BidsManager.BIDDER_CODE = 'aolbid';
BidsManager.ALIAS_KEY = 'mpalias';

export default BidsManager;
