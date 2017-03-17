import {sendGetRequest} from './helpers/ajax';
import utils from './helpers/utils';
import RenderingManager from 'renderingManager';

/***
 * The class contains logic for processing bid
 * requests and handling bid responses.
 */
class BidManager {
  constructor(bidRequestConfig, placementsConfigs) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementsConfigs = placementsConfigs || [];
    this.bidderKey = bidRequestConfig.bidderKey || 'aolbid';
    this.aliasKey = bidRequestConfig.aliasKey || 'mpalias';
    this.userSyncOn = bidRequestConfig.userSyncOn || BidManager.HEADER_BIDDING_EVENTS.bidResponse;
    this.bidResponses = [];
  }

  /**
   *  Send bid request for each placement from placementsConfigs.
   */
  sendBidRequests() {
    this.placementsConfigs.forEach((config) => {
      this.sendBidRequest(config, (bidResponse) => {
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
      this.sendBidRequest(placementConfig);
    }
  }

  /**
   * Add new ad in runtime.
   * @param {Object} placementConfig placement configuration.
   */
  addNewAd(placementConfig) {
    if (placementConfig) {
      this.addNewPlacementConfig(placementConfig);
      this.sendBidRequest(placementConfig);
    }
  }

  /**
   * Send bid request for particular placement.
   */
  sendBidRequest(placementConfig, bidResponseHandler) {
    let defaultBidResponseHandler = (bidResponse) => {
      this.handleBidRequestResponse(placementConfig, bidResponse);
    };
    bidResponseHandler = bidResponseHandler || defaultBidResponseHandler;

    if (this.bidRequestConfig.dcn && placementConfig.pos) {
      this.sendNexageRequest(placementConfig, bidResponseHandler);
    } else {
      this.sendMarketplaceRequest(placementConfig, bidResponseHandler);
    }
  }

  sendMarketplaceRequest(placementConfig, bidRequestHandler) {
    let bidRequestUrl = this.formatMarketplaceUrl(placementConfig);

    sendGetRequest(bidRequestUrl, bidRequestHandler);
  }

  formatMarketplaceUrl(placementConfig) {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/pubapi/3.0/${'network'}/
      ${'placement'}/0/-1/ADTECH;cmd=bid;cors=yes;
      v=2;alias=${'alias'};${'bidFloorPrice'}`;

    let options = {
      protocol: utils.resolveHttpProtocol(),
      hostName: this.resolveHostName(),
      network: this.bidRequestConfig.network,
      placement: parseInt(placementConfig.placement),
      alias: placementConfig.alias,
      bidFloorPrice: this.resolveBidFloorPrice(placementConfig.bidFloorPrice)
    };

    return url(options);
  }

  sendNexageRequest(placementConfig, bidRequestHandler) {
    let bidRequestUrl = this.formatNexageUrl(placementConfig);

    sendGetRequest(bidRequestUrl, bidRequestHandler);
  }

  formatNexageUrl(placementConfig) {
    let url = utils.formatTemplateString`${'protocol'}://hb.nexage.com/bidRequest?
      dcn=${'dcn'}&pos=${'pos'}&cmd=bid`;
    let options = {
      protocol: utils.resolveHttpProtocol(),
      dcn: this.bidRequestConfig.dcn,
      pos: placementConfig.pos
    };

    return url(options);
  }

  handleBidRequestResponse(placementConfig, response) {
    let externalBidRequestHandler = this.bidRequestConfig.onBidResponse;

    let responseJson = JSON.parse(response);
    let bidResponse = this.createBidResponse(responseJson, placementConfig);

    if (bidResponse) {
      this.renderPixels(bidResponse);

      if (externalBidRequestHandler) {
        externalBidRequestHandler(bidResponse);
      }
    }
  }

  checkBidResponsesState() {
    let allBidResponsesReturned = this.placementsConfigs.length === this.bidResponses.length;
    let allBidResponsesHandler = this.bidRequestConfig.onAllBidResponses;

    if (allBidResponsesReturned && allBidResponsesHandler) {
      allBidResponsesHandler(this.bidResponses);
    }
  }

  resolveBidFloorPrice(floorPrice) {
    return floorPrice ? `bidfloor=${floorPrice.toString()};` : '';
  }

  resolveHostName() {
    return BidManager.SERVER_MAP[this.bidRequestConfig.region] || BidManager.SERVER_MAP.US;
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

    if (bidData) {
      return {
        cpm: this.getCPM(bidData),
        ad: bidData.adm,
        pixels: this.getPixels(bidResponseJson),
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

  addNewPlacementConfig(placementsConfigs) {
    this.placementsConfigs.push(placementsConfigs);
  }

  isUserSyncOnBidResponseMode() {
    return this.userSyncOn === BidManager.HEADER_BIDDING_EVENTS.bidResponse;
  }

  renderPixels(bidResponse) {
    if (bidResponse.pixels && this.isUserSyncOnBidResponseMode()) {
      let renderingManager = new RenderingManager(bidResponse);

      renderingManager.renderPixels();

      bidResponse.pixelsRendered = true;
    }
  }
}

BidManager.SERVER_MAP = {
  EU: 'adserver.adtech.de',
  US: 'adserver.adtechus.com',
  Asia: 'adserver.adtechjp.com'
};

BidManager.HEADER_BIDDING_EVENTS = {
  bidResponse: 'bidResponse',
  adRender: 'adRender'
};

export default BidManager;
