import {sendGetRequest} from 'helpers/ajax';

/***
 * Base class for all bid request objects
 */
class BaseBidRequest {
  constructor(bidRequestConfig, placementConfig, consentData) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementConfig = placementConfig;
    this.consentData = consentData;
  }

  send(bidRequestHandler) {
    let bidRequestUrl = this.formatUrl(this.placementConfig);

    sendGetRequest(bidRequestUrl, bidRequestHandler);
  }

  isConsentRequired() {
    let consentData = this.consentData;

    return !!(consentData && consentData.consentString && consentData.gdprApplies);
  }
}

export default BaseBidRequest;
