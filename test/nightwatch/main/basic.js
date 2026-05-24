const { teacher, student, logout } = require("../includes/login");

module.exports = {
  '홈화면 접근 및 선생님 로그인' (browser) {
    teacher(browser)
  },
  '선생님 로그아웃' (browser) {
    logout(browser)
  },
  '학생 로그인' (browser) {
    student(browser)
  },
  '학생 로그아웃' (browser) {
    logout(browser)
  }
};
