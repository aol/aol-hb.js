import 'helpers/polyfills';
import BidManager from 'bidManager';
import RenderingManager from 'renderingManager';
import consentManagement from 'helpers/consentManagement';

let globalContext = window.$$AOLHB_GLOBAL$$ = window.$$AOLHB_GLOBAL$$ || {};

globalContext.queue = globalContext.queue || [];

globalContext.pixelsDropped = false;

globalContext.init = (bidRequestConfig, placementsConfigs) => {
  let consentRequired = bidRequestConfig.consentRequired;
  let consentTimeout = bidRequestConfig.consentTimeout;

  consentManagement.init(consentRequired, consentTimeout, consentData => {
    let manager = new BidManager(bidRequestConfig, placementsConfigs, consentData);
    manager.sendBidRequests();

    globalContext.renderAd = (alias) => {
      let bidResponseConfig = manager.getBidResponseByAlias(alias);

      if (bidResponseConfig) {
        let renderingManager = new RenderingManager(bidResponseConfig, document);

        renderingManager.renderAd();
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
  });
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
