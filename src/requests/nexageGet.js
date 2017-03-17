import utils from 'helpers/utils';
import {sendGetRequest} from 'helpers/ajax';

class NexaageGetResquest {
  constructor(bidRequestConfig, placementConfig) {
    this.bidRequestConfig = bidRequestConfig;
    this.placementConfig = placementConfig;
  }

  formatUrl() {
    let url = utils.formatTemplateString`${'protocol'}://hb.nexage.com/bidRequest?
      dcn=${'dcn'}&pos=${'pos'}&cmd=bid`;
    let options = {
      protocol: utils.resolveHttpProtocol(),
      dcn: this.bidRequestConfig.dcn,
      pos: this.placementConfig.pos
    };

    return url(options);
  }

  send(bidRequestHandler) {
    let bidRequestUrl = this.formatUrl(this.placementConfig);

    sendGetRequest(bidRequestUrl, bidRequestHandler);
  }
}

export default NexaageGetResquest;
