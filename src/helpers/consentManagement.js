
const DEFAULT_TIMEOUT = 4000;

let consentData;

export default {
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
      setTimeout(handler, DEFAULT_TIMEOUT);

      cmpApi('getConsentData', null, (data) => {
        saveConsentData(data);
        handler(consentData);
      });

      return;
    }

    callback(consentData);
  },
  saveConsentData(data) {
    // TODO: Move to utils.
    if (typeof data === 'object') {
      consentData = {
        consentString: data.consentData,
        consentRequired: data.gdprApplies
      }
    } else if (typeof data === 'string') {
      consentData = {
        consentString: data,
        consentRequired: true
      }
    }
  }
};
