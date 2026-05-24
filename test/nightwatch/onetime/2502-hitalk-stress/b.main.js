const requestedUsers = (process.argv.slice(2).find(a => a.includes('--users=')) || '').split('=')[1] || '1-3';

const { HiClassOnNewBrowser } = require("../../includes");
const config = require("./config");

const z00 = (n) => n < 10 ? `0${n}` : n;

const students = ((r) => {
  if (r.includes('-')) {
    const [start, end] = r.split('-').map(Number)
    return Array.from({length: end - start + 1}, (_, i) => start + i)
  }
  return r.split(',').map(Number)
})(requestedUsers).map(n => ({username: `${config.student.prefix}${z00(n)}`, password: config.student.password}));

const rooms = Array.from({length: config.numberOfRooms}, (_, i) => `${config.groupRoomPrefix}${i+1}`)

module.exports = {
  '주어진 계정별로 창 열고 로그인 하여 정해진 단체방에 지속적으로 메시지 전송': async (browser) => {
    browser.end()
    const hitalks = []
    const openHitalk = async idx => {
      const fullWidth = 1920
      const unitWidth = fullWidth / students.length
      const x = unitWidth * idx
      const student = students[idx]
      const session = await HiClassOnNewBrowser()
      await session.loginStudent({...student, host: config.host})
      return session.getHitalk()
    }

    const sessions = []
    for (let i = 0; i < students.length; i++) {
      sessions.push({browser: await HiClassOnNewBrowser(), student: students[i]})
    }

    for (const session of sessions) {
      await session.browser.loginStudent({...session.student, host: config.host})
      hitalks.push(session.browser.getHitalk())
    }

    const openHitalkAndRecentChat = async hitalk => {
      await hitalk.go(config.host)
      await hitalk.openRecentChat()
    }

    await Promise.all(hitalks.map(openHitalkAndRecentChat))

    let running = true
    setTimeout(() => { running = false }, config.stressDuration)
    while (running) {
      for (const room of rooms) {
        for (const hitalk of hitalks) {
          await hitalk.openChatWithName(room)
          await hitalk.sendTimestamp()
        }
      }
    }
  }
}