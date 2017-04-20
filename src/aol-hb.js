import 'helpers/polyfills';
import BidManager from 'bidManager';
import RenderingManager from 'renderingManager';

let globalContext = window.$$AOLHB_GLOBAL$$ = window.$$AOLHB_GLOBAL$$ || {};

globalContext.queue = globalContext.queue || [];

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

  globalContext.getBidResponse = (alias) => {
    return manager.getBidResponseByAlias(alias);
  };

  globalContext.refreshAd = (alias) => {
    manager.refreshAd(alias);
  };

  globalContext.addNewAd = (placementConfig) => {
    manager.addNewAd(placementConfig);
  };
};

globalContext.queue.push = (cmd) => {
  if (typeof cmd === 'function') {
    try {
      cmd.call();
    } catch (e) {
      console.warn('Error processing command', 'aol-hb.js', e);
    }
  } else {
    console.warn('Commands written into aolhb.que.push must be wrapped in a function', 'aol-hb.js');
  }
};

for (let i = 0; i < globalContext.queue.length; i++) {
  if (typeof globalContext.queue[i].called === 'undefined') {
    try {
      globalContext.queue[i].call();
      globalContext.queue[i].called = true;
    } catch (e) {
      console.warn('Error processing command', 'aol-hb.js', e);
    }
  }
}

export default globalContext;
