import 'helpers/polyfills';
import BidManager from 'bidManager';
import RenderingManager from 'renderingManager';

let globalContext = window.aolhb = window.aolhb || {};
globalContext.que = globalContext.que || [];

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

  globalContext.getBidResponse = function (alias) {
    return manager.getBidResponseByAlias(alias);
  };

  globalContext.refreshAd = (alias) => {
    manager.refreshAd(alias);
  };

  globalContext.addNewAd = (placementConfig) => {
    manager.addNewAd(placementConfig);
  };
};

globalContext.que.push = function (cmd) {
  if (typeof cmd === 'function') {
    try {
      cmd.call();
    } catch (e) {
      console.error('Error processing command :' + e.message);
    }
  } else {
    console.error('Commands written into aolhb.que.push must wrapped in a function');
  }
};

for (var i = 0; i < globalContext.que.length; i++) {
  if (typeof globalContext.que[i].called === 'undefined') {
    try {
      globalContext.que[i].call();
      globalContext.que[i].called = true;
    } catch (e) {
      console.error('Error processing command :', 'aol-hb.js', e);
    }
  }
}

export default globalContext;
