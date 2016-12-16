import 'helpers/polyfills';
import BidManager from 'bidManager';
import RenderingManager from 'renderingManager';

let globalContext = window.aolhb = {};

globalContext.init = (bidRequestConfig, placementsConfigs) => {
  let manager = new BidManager(bidRequestConfig, placementsConfigs);
  manager.sendBidRequests();

  globalContext.renderAd = (alias) => {
    let bidResponseConfig = manager.getBidResponseByAlias(alias);

    if (bidResponseConfig) {
      let renderingManager = new RenderingManager(bidResponseConfig, document);

      renderingManager.render();
    }
  };

  globalContext.refreshAd = (alias) => {
    manager.refreshAd(alias);
  };
};

export default globalContext;
