const { HiClass, HiClassOnNewBrowser } = require("../../includes");

module.exports = {
  async 'basicUseTime' (browser) {
    const { teacher, student } = await prepareSessions(browser)
    await testBasicUseTimeAlert(teacher, student)
    await endSessions(teacher, student);
  },
  async '상담 중 상담가능시간 변경 시 읽음 처리' (browser) {
    let ts = ''
    const { teacher, student } = await prepareSessions(browser)
    const teaTalk = teacher.getHitalk()
    const stuTalk = student.getHitalk()

    await teaTalk.setTalkables(true)
    await stuTalk.openChatWithName(browser.globals.teacher.name)
    await stuTalk.sendTimestamp()
    await teaTalk.openRecentChat()
    await teaTalk.setTalkables(false)
    ts = await stuTalk.sendTimestamp()
    await teaTalk.waitForMessage(ts)
    teacher.browser.assert.equal(await teaTalk.getLastUnreadCount(), '1')
    ts = teaTalk.sendTimestamp()

    await endSessions(teacher, student);
  },
  async '단제방 만든 후 글 쓰고 내보내기 한다음 다시 초대' (browser) {
    let ts = '' 
    let msg = ''
    let count = 0
    const { teacher, student } = await prepareSessions(browser)
    const teaTalk = teacher.getHitalk()
    const stuTalk = student.getHitalk()

    await teaTalk.createGroupRoom(browser.globals.hitalk.groupTalk.target)
    ts = await teaTalk.sendTimestamp()
    msg = await teaTalk.getChatBubbleHasText(ts)
    count = msg.getUnreadCount()

    await stuTalk.openRecentChat()
    await stuTalk.waitForMessage(ts)

    this.browser.assert.equal(count - 1, msg.getUnreadCount())

    await endSessions(teacher, student);
  }
}

const prepareSessions = async browser => {
  browser.end()
  const teacher = await HiClassOnNewBrowser()
  const student = await HiClassOnNewBrowser()
  await teacher.browser.windowRect({ x: 0, y: 0, width: 960, height: 1080 })
  await student.browser.windowRect({ x: 960, y: 0, width: 960, height: 1080 })
  teacher.loginTeacher()
  student.loginStudent()
  await teacher.getHitalk().go()
  await student.getHitalk().go()
  return { teacher, student }
}

const testBasicUseTimeAlert = async (teacher, student) => {
  const teaTalk = teacher.getHitalk()
  const stuTalk = student.getHitalk()

  await teaTalk.setTalkables(false)

  await stuTalk.go()
  await stuTalk.openChatWithName(browser.globals.teacher.name)
  await student.waitForText('지금은 상담 가능 시간이 아니므로')
  student.browser.click('.swal2-actions button.swal2-cancel')

  teacher.browser.pause(1000)
  await teaTalk.setTalkables(true)
  await stuTalk.go()
  await stuTalk.openChatWithName(browser.globals.teacher.name)
  student.assertNotTextExists('지금은 상담 가능 시간이 아니므로')
}

const endSessions = async (teacher, student) => {
  teacher.browser.pause(1000)
  await teacher.end()
  await student.end()
}