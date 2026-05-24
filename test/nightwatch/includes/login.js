function login(browser, type, {username, password, host}) {
  const selectors = {
    '선생님': {
      button: '.login-style.type-iscreammedia button',
      id: '#idValue',
      pw: '#pwValue',
      login: '#loginButton'
    },
    '학생': {
      button: '.login-style.type-site button',
      id: '.input-id input',
      pw: '.input-pw input',
      login: 'form #submitBtn'
    }
  }[type]
  browser.url(host || browser.globals.host)
  browser.useCss()
  browser.waitForElementVisible('.index-login__item', 30 * 1000)
  browser.element.findByText(type).click()
  browser.waitForElementVisible(selectors.button)
  browser.click(selectors.button)
  browser.waitForElementVisible(selectors.id)
  browser.element(selectors.id).sendKeys(username)
  browser.element(selectors.pw).sendKeys(password)
  browser.element(selectors.login).click()
  browser.waitForElementVisible('.mypage-wrap', 30 * 1000)
}

function logout(browser, host) {
  browser.url(host || browser.globals.host + '/main/home')
  browser.waitForElementVisible('.mypage-wrap')
  browser.useXpath()
  browser.click("//a[contains(text(), '로그아웃')]")
  browser.useCss()
}

module.exports = {
  teacher: browser => login(browser, '선생님', browser.globals.teacher),
  student: browser => login(browser, '학생', browser.globals.student),
  login,
  logout
}
