import BidRequestManager from 'bidRequestsManager';

let globalContext = window.aolhb = {};

globalContext.init = (bidRequestConfig, placementsConfigs) => {
  var manager = new BidRequestManager(bidRequestConfig, placementsConfigs);

  manager.sendBidRequests();
};
