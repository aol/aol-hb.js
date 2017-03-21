import utils from 'helpers/utils';
import {sendPostRequest} from 'helpers/ajax';
import BaseBidRequest from './baseBidRequest';

class NexagePostBidRequest extends BaseBidRequest {
  formatUrl() {
    let url = utils.formatTemplateString`${'protocol'}://hb.nexage.com/bidRequest`;
    let options = {
      protocol: utils.resolveHttpProtocol()
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
}

export default NexagePostBidRequest;
