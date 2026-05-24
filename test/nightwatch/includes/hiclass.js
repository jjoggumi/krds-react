const Hitalk = require('./hitalk');
const { login, logout } = require('./login');
const { waitForText, assertNotTextExists } = require('./common');

class HiClass {
  constructor(browser) {
    this.browser = browser;
    this.host = browser.globals.host;
  }

  async end() {
    await new Promise(r => {
      this.browser.session('delete', r);
    })
  }

  home() {
    this.browser.url(this.browser.globals.host + '/main/home');
  }

  loginTeacher(teacher) {
    this.updateHost(teacher.host);
    login(this.browser, '선생님', teacher || this.browser.globals.teacher);
  }

  loginStudent(student) {
    this.updateHost(student.host);
    login(this.browser, '학생', student || this.browser.globals.student);
  }

  logout(host) {
    this.updateHost(host);
    logout(this.browser, this.host);
  }

  getHitalk() {
    return new Hitalk(this.browser);
  }

  waitForText(text, tag) {
    return waitForText(this.browser, text, tag);
  }

  assertNotTextExists(text) {
    assertNotTextExists(this.browser, text);
  }

  updateHost(host) {
    if (host) {
      this.host = host;
    }
  }
}

module.exports = HiClass;