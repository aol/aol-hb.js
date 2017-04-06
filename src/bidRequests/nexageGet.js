import utils from 'helpers/utils';
import BaseBidRequest from './baseBidRequest';

class NexageGetBidRequest extends BaseBidRequest {
  formatUrl() {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/bidRequest?
      dcn=${'dcn'}&pos=${'pos'}&cmd=bid${'ext'}`;
    let options = {
      protocol: utils.resolveHttpProtocol(),
      hostName: this.bidRequestConfig.host || 'hb.nexage.com',
      dcn: this.bidRequestConfig.dcn,
      pos: this.placementConfig.pos,
      ext: this.formatDynamicParams()
    };

    return url(options);
  }

  formatDynamicParams() {
    let params = '';
    let ext = this.placementConfig.ext;

    utils.each(ext, (value, key) => {
      params += encodeURIComponent(`&${key}=${value}`);
    });

    return params;
  }
}

export default NexageGetBidRequest;
