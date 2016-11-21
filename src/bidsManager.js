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
    this.bidderKey = bidRequestConfig.bidderKey || 'aolbid';
    this.aliasKey = bidRequestConfig.aliasKey || 'mpalias';
    this.bidResponses = [];
  }

  /**
   *  Send bid request for each placement from placementsConfigs.
   */
  sendBidRequests() {
    this.placementsConfigs.forEach((config) => {
      sendGetRequest(this.formatBidRequestUrl(config), (bidResponse) => {
        this.handleBidRequestResponse(config, bidResponse);
        this.checkBidResponsesState();
      });
    });
  }

  /***
   * Refresh specific ad by its alias.
   */
  refreshAd(alias) {
    let placementConfig = this.getPlacementConfigByAlias(alias);

    if (placementConfig) {
      sendGetRequest(this.formatBidRequestUrl(placementConfig), (bidResponse) => {
        this.handleBidRequestResponse(placementConfig, bidResponse);
      });
    }
  }

  formatBidRequestUrl(placementConfig) {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/pubapi/3.0/${'network'}/
      ${'placement'}/0/-1/ADTECH;cmd=bid;cors=yes;
      v=2;alias=${'alias'};${'bidFloorPrice'}`;

    let options = {
      protocol: utils.resolveHttpProtocol(document.location.protocol),
      hostName: this.resolveHostName(),
      network: this.bidRequestConfig.network,
      placement: parseInt(placementConfig.placement),
      alias: placementConfig.alias,
      bidFloorPrice: this.resolveBidFloorPrice(placementConfig.bidFloorPrice)
    };

    return url(options);
  }

  handleBidRequestResponse(placementConfig, response) {
    let externalBidRequestHandler = this.bidRequestConfig.onBidResponse;

    let responseJson = JSON.parse(response);
    let bidResponse = this.createBidResponse(responseJson, placementConfig);

    if (bidResponse && externalBidRequestHandler) {
      externalBidRequestHandler(bidResponse);
    }
  }

  checkBidResponsesState() {
    let allBidResponsesReturned = this.placementsConfigs.length === this.bidResponses.length;
    let allBidResponsesHandler = this.bidRequestConfig.onAllBidResponses;

    if (allBidResponsesReturned && allBidResponsesHandler) {
      allBidResponsesHandler();
    }
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

  getBidResponseByAlias(alias) {
    return this.bidResponses.find((item) => {
      return item.alias === alias;
    });
  }

  addNewBidResponse(bidResponse) {
    if (bidResponse) {
      let existingBidResponse = this.getBidResponseByAlias(bidResponse.alias);

      if (existingBidResponse) {
        let bidResponseIndex = this.bidResponses.indexOf(existingBidResponse);

        this.bidResponses[bidResponseIndex] = bidResponse;
      } else {
        this.bidResponses.push(bidResponse);
      }
    }
  }

  createBidResponse(bidResponseJson, placementConfig) {
    let bidResponse = this.formatBidResponse(bidResponseJson, placementConfig);

    if (bidResponse) {
      this.addNewBidResponse(bidResponse);

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
        bidderCode: this.bidderKey,
        aliasKey: this.aliasKey,
        alias: placementConfig.alias
      };
    }
  }

  getPlacementConfigByAlias(alias) {
    return this.placementsConfigs.find((item) => {
      return item.alias === alias;
    });
  }
}

BidsManager.SERVER_MAP = {
  EU: 'adserver.adtech.de',
  US: 'adserver.adtechus.com',
  Asia: 'adserver.adtechjp.com'
};

export default BidsManager;
