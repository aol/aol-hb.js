module.exports = {
  'Demo test': (browser) => {

    browser.view('views/page.html')
      .waitForElementVisible('body', 5000)
      .waitForElementVisible('#test', 5000)
      .expect.element('#test').text.to.equal('pub-api');

    browser.end();
  }
};
