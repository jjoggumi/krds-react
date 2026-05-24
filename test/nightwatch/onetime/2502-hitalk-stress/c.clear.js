const { HiClass, HiClassOnNewBrowser } = require("../../includes");
const config = require("./config")

module.exports = {
  '정해진 이름의 단체방 순차적으로 제거': async (browser) => {
    browser.end()
    const teacher = await HiClassOnNewBrowser()
    teacher.loginTeacher({...config.teacher, host: config.host})
    const hitalk = teacher.getHitalk()
    await hitalk.go(config.host)
    for (let i = 0; i < config.numberOfRooms; i++) {
      await hitalk.closeRoom(`${config.groupRoomPrefix}${i+1}`)
    }
  }
}