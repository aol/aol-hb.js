
module.exports = {
  getCmpApi() {
    return window.__cmp;
  },

  getConsentString() {
    let cmpApi = this.getCmpApi();

    if (cmpApi) {
      return cmpApi('getConsentData');
    }
  }
};
