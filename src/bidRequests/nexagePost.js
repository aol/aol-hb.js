import utils from 'helpers/utils';
import {sendPostRequest} from 'helpers/ajax';
import BaseBidRequest from './baseBidRequest';

class NexagePostBidRequest extends BaseBidRequest {
  formatUrl() {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/bidRequest?`;
    let options = {
      protocol: utils.resolveHttpProtocol(),
      hostName: this.bidRequestConfig.host || 'hb.nexage.com'
    };

    return url(options);
  }

  send(bidRequestHandler) {
    let bidRequestUrl = this.formatUrl(this.placementConfig);
    let options = {
      contentType: 'application/json',
      data: this.placementConfig.openRtbParams,
      customHeaders: {
        'x-openrtb-version': '2.2'
      }
    };

    sendPostRequest(bidRequestUrl, bidRequestHandler, options);
  }

  buildOpenRtbRequestData() {
    let {id, imp} = this.placementConfig.openRtbParams;
    let openRtbObject = {id, imp};

    if (this.isConsentRequired()) {
      openRtbObject.user = {
        ext: {
          consent: this.consentData.consentString
        }
      };
      openRtbObject.regs = {
        ext: {
          gdpr: 1
        }
      };
    }

    return openRtbObject;
  }
}

export default NexagePostBidRequest;
