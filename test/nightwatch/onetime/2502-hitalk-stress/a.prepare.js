const { HiClass, HiClassOnNewBrowser } = require("../../includes");
const config = require("./config")

module.exports = {
  '정해진 이름의 단체방 생성': async (browser) => {
    browser.end()
    const teacher = await HiClassOnNewBrowser()
    teacher.loginTeacher({...config.teacher, host: config.host})
    const hitalk = teacher.getHitalk()
    await hitalk.go(config.host)
    for (let i = 0; i < config.numberOfRooms; i++) {
      await hitalk.createGroupRoom({...config.targetClassNameAndSchool, title: `${config.groupRoomPrefix}${i+1}`})
      await hitalk.sendTimestamp()
    }
    await teacher.end()
  }
}