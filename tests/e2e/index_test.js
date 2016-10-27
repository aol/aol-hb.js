module.exports = {
  'Demo test': function(browser) {

    browser.url('http://localhost:9542/index.html')
      .waitForElementVisible('body', 5000)
      .waitForElementVisible('#test', 5000);
  }
};
