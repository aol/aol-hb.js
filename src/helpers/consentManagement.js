
let consentData;

module.exports = {
  getCmpApi() {
    let w = window;

    for (let i = 0; i < 10; i++) {
      w = w.parent;

      if (w.__cmp) {
        return w.__cmp;
      }
    }

    return window.__cmp;
  },

  getConsentData(callback) {
    let cmpApi = this.getCmpApi();
    let handler = (function() {
      let executed = false;

      return function() {
        if (!executed) {
          executed = true;
          callback(consentData);
        }
      };
    })();

    if (cmpApi && !consentData) {
      setTimeout(handler, 4000);

      cmpApi('getConsentData', null, (data) => {
        consentData = data;
        handler(data);
      });

      return;
    }

    callback(consentData);
  }
};
