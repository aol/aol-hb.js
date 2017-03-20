import {sendGetRequest} from 'helpers/ajax';

/***
 * Base class for all bid request objects
 */
class BaseBidRequest {
  constructor(bidRequestConfig, placementConfig) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementConfig = placementConfig;
  }

  send(bidRequestHandler) {
    let bidRequestUrl = this.formatUrl(this.placementConfig);

    sendGetRequest(bidRequestUrl, bidRequestHandler);
  }
}

export default BaseBidRequest;
