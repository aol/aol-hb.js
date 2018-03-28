
module.exports = {
  getCmpApi() {
    let w = window;

    for (let i = 0; i < 10; i++) {
      w = w.parent;

      if (w.__cmp) {
        return w.__cmp;
      }
    };

    return window.__cmp;
  },

  getConsentString() {
    let cmpApi = this.getCmpApi();

    if (cmpApi) {
      return cmpApi('getConsentData');
    }
  }
};
