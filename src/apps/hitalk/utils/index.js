import MessageStatusManager from "./MessageStatusManager"
import ElectronController from './ElectronController'
import TemporaryVideoThumbnailManager from "./TemporaryVideoThumbnailManager"
import "../../../../public/hitalk/publicUtils.js"

export function checkTeacherChatTime(isOverChat,
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

export function z00(n) {
  return n < 10 ? '0' + n : n
}

export function ymdhm(d) {
  return `${d.getFullYear()}${z00(d.getMonth() + 1)}${z00(d.getDate())}${z00(d.getHours())}${z00(d.getMinutes())}`
}

export function formatChatTime(userTime, skipSpace, type='Chat') {
  let dayArr = userTime[`user${type}Day`].split(",")
  let dayString = '';

  if (dayArr.length === 7) { // 모든요일
    dayString = '매일'
  } else {
    if (_.isEqual(dayArr, ['1','2','3','4','5'])) {
      dayString = '월~금'
    } else {
      for (let dayStringTemp of dayArr.sort()) {
        dayString += "일월화수목금토".charAt(parseInt(dayStringTemp, 10))
      }
    }
  }

  const fmt = (s, e) => [`${s.slice(0, 2)}:${s.slice(-2)}`, `${e.slice(0, 2)}:${e.slice(-2)}`].join(skipSpace ? '~' : ' ~ ')
  return dayString + ' ' 
    + ['', '2', '3'].map(k => [userTime[`user${type}StartTime${k}`], userTime[`user${type}EndTime${k}`]])
      .filter(([s, e]) => s && e).map(([s, e]) => fmt(s, e)).join(', ');
}

export class UnintendedScrollObserver {
  constructor(el, callback, t) {
    this.el = el
    this.callback = callback
    this.threshold = t || 10
    this.scrollCounts = 0
    this.lastScrollHeight = 0

    this.initObserver()
  }

  initObserver() {
    this.el.addEventListener('scroll', () => {
      this.scrollCounts++
    })
    this.observer = new MutationObserver(() => {
      if (!this.humanScrolled() && this.el.scrollHeight > this.lastScrollHeight) {
        this.callback()
        this.scrollCounts = 0
      }
      this.lastScrollHeight = this.el.scrollHeight;
    });
  
    this.observer.observe(this.el, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }

  resetScrollCount() {
    this.scrollCounts = 0
  }
  
  disconnect() {
    this.observer.disconnect()
  }

  humanScrolled() {
    return this.scrollCounts > this.threshold
  }
}

export function unreadCountOf(message, members) {
  return Math.max(0,
    members.length - members.filter(
      m => m.userId != message.sender
      && Math.max(m.readTimestamp, m.joinTimestamp) >= message.insertedTimestamp).length - 1)
}

export function isRead(message, member) {
  return message && member && (member.userId === message.sender || member.readTimestamp >= message.insertedTimestamp)
}

const messageStatusManager = new MessageStatusManager();

export function useMessageStatusManager() {
  return messageStatusManager;
}

const roomChaingingContext = { busy: false }

export function useRoomChaingingContext() {
  return roomChaingingContext;
}

const electronController = new ElectronController();

export function useElectronController() {
  return electronController;
}

export function formatChatLimitTimestamp(d) {
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${z00(d.getDate())}일 (${weekday}) ${d.getHours()}:${z00(d.getMinutes())}`
}

export function buildLimitTimestampFromDateJson(d) {
  return new Date(d.year, d.month, d.day, d.hour, d.minute, 59).getTime() + 999
}

export function isExpiredRoom(r) {
  return r && (r.isEnding
    || (r.groupType === 'LIMIT' && new Date(r.limitTimestamp) < new Date()))
}

export function getDefaultGroupRoomName(clazz, groupType) {
  return `${clazz.classBan} 단체 ${groupType === 'NOTICE' ? '공지방' : '채팅방'}`
}

const temporaryVideoThumbnailManager = new TemporaryVideoThumbnailManager()

export const useTmpVideoThumbnailManager = () => {
  return temporaryVideoThumbnailManager;
}