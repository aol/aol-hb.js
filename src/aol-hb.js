import BidsManager from 'bidsManager';
import RenderAdManager from 'renderAdManager';

let globalContext = window.aolhb = {};

globalContext.init = (bidRequestConfig, placementsConfigs) => {
  let manager = new BidsManager(bidRequestConfig, placementsConfigs);
  manager.sendBidRequests();

  globalContext.renderAd = (alias) => {
    let bidResponseConfig = manager.getBidResponseByAlias(alias);

    if (bidResponseConfig) {
      let renderAdManager = new RenderAdManager(bidResponseConfig, document);

      renderAdManager.render();
    }
  };
};
