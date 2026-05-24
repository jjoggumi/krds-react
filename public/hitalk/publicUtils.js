(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    // Node.js or Webpack 환경
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    // AMD 환경
    define([], factory);
  } else {
    // 브라우저 환경 (웹워커 포함)
    root.checkTeacherChatTime = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function checkTeacherChatTime(isOverChat,
      { userChatStartTime, userChatEndTime,
        userChatStartTime2, userChatEndTime2,
        userChatStartTime3, userChatEndTime3,
        userChatDay='', isUseChat },
      date)
  {
    if (isOverChat) return true;
    if (!isUseChat) return false;
    let m = date || new Date();
    if (!m.getHours && m.hasOwnProperty('hour') && m.hour !== undefined && m.hour !== null) {
      m = new Date(m.year, m.month, m.day, m.hour, m.minute);
    }
    const hhmm = parseInt(m.getHours().toString().padStart(2, '0') + m.getMinutes().toString().padStart(2, '0'));
    const between = (s, e) => (s && e && hhmm >= parseInt(s) && hhmm < parseInt(e)) || false;

    return userChatDay.split(',').includes(m.getDay().toString()) &&
      (between(userChatStartTime, userChatEndTime) ||
        between(userChatStartTime2, userChatEndTime2) ||
        between(userChatStartTime3, userChatEndTime3));
  }

  return checkTeacherChatTime;
});