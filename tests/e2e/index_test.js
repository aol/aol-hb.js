module.exports = {
  'Demo test': (browser) => {

    browser.view('views/default.html')
      .waitForElementVisible('body', 5000)
      .waitForElementVisible('#test', 5000);

    browser.end();
  }
};
