import BidRequestManager from 'bidRequestsManager';
import RenderAdManager from 'renderAdManager';

let globalContext = window.aolhb = {};

globalContext.init = (bidRequestConfig, placementsConfigs) => {
  var manager = new BidRequestManager(bidRequestConfig, placementsConfigs);
  manager.sendBidRequests();

  globalContext.renderAd = (alias) => {
    var bidResponseConfig = manager.getBidResponseByAlias(alias);

    if (bidResponseConfig) {
      var renderAdManager = new RenderAdManager(bidResponseConfig, document);

      renderAdManager.render();
    }
  };
};
