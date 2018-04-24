
const DEFAULT_TIMEOUT = 4000;

export default {
  consentData: null,
  consentTimeout: DEFAULT_TIMEOUT,
  gdprApplies: true,
  init(gdprApplies, consentTimeout, callback) {
    let cmpApi = this.getCmpApi();
    let handler = (function() {
      let executed = false;

      return function(data) {
        if (!executed) {
          executed = true;
          callback(data);
        }
      };
    })();

    if (consentTimeout) {
      this.consentTimeout = consentTimeout;
    }

    if (gdprApplies === false) {
      this.gdprApplies = false;
    }

    if (cmpApi && !this.consentData) {
      setTimeout(handler, this.consentTimeout);

      cmpApi('getConsentData', null, response => {
        this.consentData = this.formatCmpApiResponse(response);

        handler(this.consentData);
      });
    } else {
      callback(this.consentData);
    }
  },

  getCmpApi() {
    let w = window;

    for (let i = 0; i < 10; i++) {
      try {
        w = w.parent;

        if (w.__cmp) {
          return w.__cmp;
        }
      } catch (error) {
        return;
      }

    }

    return window.__cmp;
  },

  formatCmpApiResponse(response) {
    if (typeof response === 'object') {
      return {
        consentString: response.consentData,
        gdprApplies: this.gdprApplies && response.gdprApplies
      };
    }
  }
};
