const { teacher } = require("../../includes/login");

const data = {
  school: '경일초등학교',
  age: '3학년',
  class: '2반'
}

module.exports = {
  '클래스 생성': function(browser) {
    teacher(browser)
    browser.element('.btn-create').click()
    browser.waitForElementVisible('.cont-item.school')
    browser.element('.cont-item.school input').sendKeys(data.school)
    browser.waitForElementVisible('.search-result-wrap')
    browser.element('.search-result-wrap li:nth-child(1)').click()
    browser.element('.cont-item.year .border-selectbox-wrap').click()
    browser.element('.cont-item.year .border-selectbox-wrap .option-list-wrap li:nth-child(1)').click()
    browser.element('.cont-item.grade .border-selectbox-wrap').click()
    browser.element('.cont-item.grade .border-selectbox-wrap .option-list-wrap li:nth-child(3)').click()
    browser.element('.cont-item.class input').sendKeys(data.class)
    browser.element('.create-class-cont-wrap .btm-wrap .btn-bg-c', function(result) {
      browser.assert.attributeEquals(result.value.ELEMENT, 'disabled', null, 'btn-bg-c 요소에 disabled 속성이 없어야 합니다.')
    });
    browser.element('.create-class-cont-wrap .btm-wrap .btn-bg-c').click()

    browser.waitForElementVisible('#profileSettingModal')
    browser.element('#profileSettingModal .btn-p-wrap button').click()

    browser.waitForElementVisible('.class-new-created-container', 5000)
    browser.element('.class-new-created-container .footer-wrap button').click()

    browser.useXpath(); // XPath 사용
    browser.waitForElementVisible("//button[text()='구성원 관리']", 5000);
    browser.click("//button[text()='구성원 관리']");

    browser.waitForElementVisible('done', 100000)
  }
}