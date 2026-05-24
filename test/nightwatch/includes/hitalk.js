const { waitForText, waitForElementVisible } = require('./common');

class ChatBubble {
  constructor(browser, element) {
    this.browser = browser;
    this.element = element;
  }

  getUnreadCount() {
    return this.browser.element(this.element).find('.reading-check-wrap').getText();
  }

  getText() {
    return this.browser.element(this.element).find('p').getText();
  }
}

class Hitalk {
  constructor(browser) {
    this.browser = browser;
  }

  async go(host) {
    if (host) {
      this.host = host;
    }
    this.browser.url((this.host || this.browser.globals.host) + '/hitalk');
    await waitForElementVisible(this.browser, 'button.icon.c-list');
  }

  openTimeSetting() {
    this.browser.click('button.icon.time-setting');
    this.browser.waitForElementVisible('.modal__layer');
  }

  closeTimeSetting() {
    return new Promise(r => {
      this.browser.execute("document.querySelector('.modal__footer .hi-btn:nth-child(2)').click()");
      this.browser.useCss().waitForElementNotPresent('.modal__layer', r);
    })
  }

  async setTalkables(talkable, isOver) {
    this.openTimeSetting();
    this.browser.execute("s = document.getElementById('weekday-0'); s.checked ? '' : s.click()");
    this.browser.execute(`[1,2,3,4,5].map(i => document.getElementById('weekday-' + i)).forEach(e => e.checked != ${talkable} ? e.click() : '')`);
    this.browser.execute(`s = document.getElementById('isOver'); s.checked != ${isOver || false}? (s || {click: () => {}}).click() : ''`);
    await this.closeTimeSetting();
  }

  waitForChatLayout() {
    return new Promise(r => 
      this.browser.waitForElementVisible('.chatting-box-wrap', r)
    )
  }

  async openChatWithName(name) {
    await waitForText(this.browser, name, 'span');
    this.browser.execute(`new Array(...document.querySelectorAll('li.position-room')).find(e => (e || {innerText: ''}).innerText.indexOf('${name}') >= 0).click()`);
    await this.waitForChatLayout
  }

  async sendTimestamp() {
    const timestamp = new Date().getTime() + ''
    this.sendMessage(timestamp)
    await waitForText(this.browser, timestamp, 'p')
    return timestamp
  }

  async waitForMessage(message) {
    await waitForText(this.browser, message, 'p')
  }

  sendMessage(message) {
    this.browser.waitForElementVisible('.text-input-area')
    this.browser.execute(`document.querySelector('.text-input-area').innerHTML = "${message}"`)
    this.browser.click('.send-btn-wrap button')
  }

  async openRecentChat() {
    await this.go()
    this.browser.execute("document.querySelector('button.icon.c-list').click()")
    await waitForElementVisible(this.browser, 'li.position-room')
    this.browser.execute("document.querySelector('li.position-room').click()")
    await this.waitForChatLayout()
  }

  async getChatBubbles() {
    const elements = await this.browser.element.findAll(by.css('.chatting-bubble-wrap'))
    return elements.map(e => new ChatBubble(this.browser, e))
  }

  async getLastUnreadCount() {
    const bubbles = await this.getChatBubbles()
    return bubbles[bubbles.length - 1].getUnreadCount()
  }

  async getChatBubbleHasText(text) {
    const bubbles = await this.getChatBubbles()
    return bubbles.find(b => b.getText() === text)
  }

  async openMemberList() {
    await this.go()
    this.browser.execute("document.querySelector('button.icon.c-opponent').click()")
    await waitForElementVisible(this.browser, '.opponent-list-wrap')
  }

  clickRadioHasValue(value) {
    this.browser.execute(`document.querySelector('input[type=radio][value=${value}]').click()`)
  }

  clickAllCheckboxUnder(selector) {
    this.browser.execute(`document.querySelectorAll('${selector} input[type=checkbox]').forEach(e => e.checked ? '' : e.click())`) 
  }

  clickButtonHasText(text, parentSelector) {
    this.browser.execute(
      `([...document.querySelectorAll('${parentSelector || "body"} button')].find(
      e => e.innerText.indexOf('${text}') >= 0) || {click: () => {}}).click()`)
  }

  async createGroupRoom({school, className, type, title}) {
    await this.openMemberList()
    await waitForElementVisible(this.browser, '.notice-list-wrap li')
    this.browser.execute(`
      e = [...document.querySelectorAll('.notice-list-wrap li')].find(e => 
        e.innerText.indexOf('${school}') > 0 && e.innerText.indexOf('${className}') > 0);
      e.querySelector('.btn-notice').click();
    `)
    await waitForElementVisible(this.browser, '.select-target__item')
    this.clickRadioHasValue(type || 'NOTICE')
    this.clickAllCheckboxUnder('.select-target__item')
    this.browser.execute(`document.querySelector('.modal__content .input-box-wrap input[type=text]').value = '${title || '테스트용 자동 생성방'}'`)
    this.browser.execute(`document.querySelector('.modal__content .input-box-wrap input[type=text]').dispatchEvent(new Event('input'))`)
    this.clickButtonHasText('만들기', '.modal__footer')
    await this.waitForChatLayout()
  }

  async closeRoom(title) {
    await this.openRecentChat()
    await this.openChatWithName(title)
    this.browser.execute(`document.querySelector('.more-btn').click()`)
    await waitForText(this.browser, '설정', 'p')
    this.browser.execute(`document.querySelector('p.ico-out').click()`)
    await waitForText(this.browser, '취소', 'button')
    this.browser.execute(`document.querySelectorAll('.modal__footer button')[1].click()`)
  }
}

module.exports = Hitalk;