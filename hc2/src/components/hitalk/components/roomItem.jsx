import Style from './roomItem.module.css'
import { defaultProfileImage } from '@/components/hiclass/components/profile'
import { Icon } from '@/components/uiux/hitalk'

const isGroupRoom = roomItem => roomItem?.roomType === "GROUP"

const personalChatUserOf = roomItem => {
  if (isGroupRoom(roomItem)) return ""
  if(!roomItem?.settings || !roomItem?.settings.members) return ""
  let mem = roomItem.settings.members
  for (const memTemp of mem) {
    if (memTemp.user.currentId !== localStorage.uuid) {
      memTemp.clazz = roomItem.settings?.clazz
      return memTemp
    }
  }
  return ""
}

const imagePathOf = roomItem => (isGroupRoom(roomItem)
  ? roomItem.classImagePath || (roomItem.settings?.clazz || {}).classImagePath
  : personalChatUserOf(roomItem).user?.userPhoto) || defaultProfileImage

const recentContentOf = roomItem => {
  const lastChatMessage = roomItem.settings?.user?.lastChatMessage || {}
  const message = lastChatMessage.content
  const handlers = {
    CHAT: msg => msg.replaceAll('>', '&gt;').replaceAll('<', '&lt;'),
    FILE: msg => {
      try {
        return JSON.parse(msg).fileName
      } catch {
        return '파일을 보냈습니다.'
      }
    },
    PHOTO: () => "사진을 보냈습니다.",
    PHOTOMULTI: msg => {
      let files = []
      try {
        files = JSON.parse(msg)
      } catch(e) { console.error(e) }
      const fileCount = files.length || 0
      return `사진 ${fileCount}장을 보냈습니다.`
    },
    DELETE: () => "메시지가 삭제되었습니다.",
    VIDEO: () => "영상을 보냈습니다.",
    STICKER: () => "스티커를 보냈습니다.",
    SHARE: msg => {
      let shareContent = {}
      let shareTypeStr = ''
      try {
        shareContent = JSON.parse(msg)
      } catch(e) { console.error(e) }
      const shareTypeCode = {
        NOTE: '알림장을',
        ALBUM: '앨범을',
        BOARD: '자유게시글을',
        HOMEWORK: '과제를',
        ALARM: '가정통신문을',
        MEAL: '급식을',
        NOTICE: '학교 공지를',
        CP_BOARD: '게시글을',
        CLASS_APPLY: '학교 신청서를',
        SHEET: '학교 신청서를',
        SURVEY: '설문을',
        CLASSROOM: '학생 리포트를',
      }

      const ordinaryTypeKeys = [
        'ALBUM', 'BOARD', 'HOMEWORK', 'ALARM', 'MEAL', 'NOTICE', 'CP_BOARD', 'CLASS_APPLY', 'SHEET', 'SURVEY', 'CLASSROOM'
      ]

      const shareTypeMap = {
        NOTE: () => {
          let str = shareTypeCode[shareContent.shareType]
          if (shareContent.schoolType && !['KINDERGARTEN', 'ELEMENTARY'].includes(shareContent.schoolType)) {
            str = '공지를'
          }
          return str
        }
      }

      ordinaryTypeKeys.forEach(key => {
        shareTypeMap[key] = () => shareTypeCode[shareContent.shareType]
      })

      if (shareTypeMap[shareContent.shareType]) {
        shareTypeStr = shareTypeMap[shareContent.shareType]()
      }
      return `${shareTypeStr} 공유하였습니다.`
    }
  }

  if (handlers[lastChatMessage.contentType]) {
    return handlers[lastChatMessage.contentType](message)
  } else {
    try {
      return typeof JSON.parse(message) === 'object' ? '지원되지 않는 메시지 입니다.' : message
    } catch {
      return message
    }
  }
}

const amIMaster = room => room?.isMaster || [room?.settings?.master?.currentId, room?.master].includes(localStorage.uuid)

const groupTypeMap = {
  NOTICE: 'chat-type-noti',
  GENERAL: 'chat-type-normal',
  LIMIT: 'chat-type-period',
};

export const RoomItem = ({room, showRecent = true, roomName = null}) => {
  return (
    <div key={room?.room} className={`${Style['room-item']} room-item`}>
      <div className={Style['profile']}>
        <img
          src={imagePathOf(room)}
          alt={room?.title}
        />
        {amIMaster(room) && <Icon icon="crown" />}
      </div>
      <div className={Style['info']}>
        <div className={Style['title-wrap']}>
          {room?.groupType && (
            <i className={groupTypeMap[room.groupType] || ''} />
          )}
          <span className={`${Style['title']} title`}>{roomName !== null ? roomName : room?.roomName}</span>
          {showRecent && isGroupRoom(room) && <span className={Style['count']}>{room?.settings?.memberCount}</span>}
        </div>
        {showRecent && <div className={Style['recent']}>{recentContentOf(room)}</div>}
      </div>
    </div>
  )
}