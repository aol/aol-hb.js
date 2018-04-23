
const DEFAULT_TIMEOUT = 4000;

export default {
  consentData: null,
  consentRequired: false,
  consentTimeout: DEFAULT_TIMEOUT,
  init(consentRequired, consentTimeout, callback) {
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
    this.consentRequired = !!consentRequired;
    this.consentTimeout = consentTimeout || DEFAULT_TIMEOUT;

    if (cmpApi && !this.consentData) {
      setTimeout(handler, this.consentTimeout);

      cmpApi('getConsentData', null, response => {
        this.consentData = this.formatCmpApiResponse(response);

        handler(this.consentData);
      });

      return;
    } else {
      callback(this.consentData);
    }
  },

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

  formatCmpApiResponse(response) {
    // TODO: Move to utils.
    if (typeof response === 'object') {
      return {
        consentString: response.consentData,
        consentRequired: response.gdprApplies || this.consentRequired
      };
    } else if (typeof response === 'string') {
      return {
        consentString: response,
        consentRequired: this.consentRequired
      };
    }
  }
};
