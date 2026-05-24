const { createClient } = require('nightwatch');

module.exports = {
  waitForText (browser, text, tag) {
    return new Promise(r => {
      browser.useXpath();
      browser.waitForElementVisible(`//${tag || 'div'}[contains(text(), "${text}")]`,
        30 * 1000, 
        () => {
          browser.useCss();
          r();
        });
    })
  },
  assertNotTextExists (browser, text) {
    browser.useXpath()
    browser.assert.not.elementPresent(`//div[contains(text(), "${text}")]`)
    browser.useCss()
  },
  async createBrowser () {
    return await createClient().launchBrowser();
  },
  waitForElementVisible (browser, selector) {
    return new Promise(r => browser.waitForElementVisible(selector, 30 * 1000, r));
  }
}
