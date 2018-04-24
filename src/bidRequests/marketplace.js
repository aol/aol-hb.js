import utils from 'helpers/utils';
import BaseBidRequest from './baseBidRequest';

/***
 * The class contains logic sending bid request to Adtech server
 */
class MarketplaceBidRequest extends BaseBidRequest {
  formatUrl() {
    let url = utils.formatTemplateString`${'protocol'}://${'hostName'}/pubapi/3.0/${'network'}/
      ${'placement'}/0/-1/ADTECH;cmd=bid;cors=yes;
      v=2;alias=${'alias'};${'bidFloorPrice'}${'consentData'}`;

    let options = {
      protocol: utils.resolveHttpProtocol(),
      hostName: this.resolveHostName(),
      network: this.bidRequestConfig.network,
      placement: parseInt(this.placementConfig.placement),
      alias: this.placementConfig.alias,
      bidFloorPrice: this.resolveBidFloorPrice(this.placementConfig.bidFloorPrice),
      consentData: this.formatConsentData()
    };

    return url(options);
  }

  resolveHostName() {
    let serverMap = MarketplaceBidRequest.SERVER_MAP;

    return serverMap[this.bidRequestConfig.region] || serverMap.US;
  }

  resolveBidFloorPrice(floorPrice) {
    return floorPrice ? `bidfloor=${floorPrice.toString()};` : '';
  }

  formatConsentData() {
    return this.isConsentRequired() ? `;euconsent=${this.consentData.consentString};gdpr=1` : '';
  }
}

MarketplaceBidRequest.SERVER_MAP = {
  EU: 'adserver.adtech.de',
  US: 'adserver.adtechus.com',
  Asia: 'adserver.adtechjp.com'
};

export default MarketplaceBidRequest;
