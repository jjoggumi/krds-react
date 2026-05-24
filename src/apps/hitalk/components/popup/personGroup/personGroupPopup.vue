<template>
  <div>
    <div class="hi-modal-common modal-flex person-group" style="display: block;">
      <div class="modal__dim"></div>
      <div class="modal__layer">
        <div class="modal__header">
          <h2 class="heading">
            예약 메시지 {{ this.sendMessageItem.mode === 'CREATE' ? '작성' : '수정' }}
          </h2>
          <button
              class="btn-close"
              @click="closePersonGroupPopupIsOpen"
          />
        </div>
        <div class="modal__content">
          <div class="column-flex">
            <div class="hitalk-messageinfo">
              <ul>
                <li>
                  <div class="messageinfo__heading">발송 대상</div>
                  <div class="messageinfo__item">
                    <div class="image-wrap">
                      <span v-if="isGroup" class="class-administrator crown">administrator</span>
                      <div class="image">
                        <img v-if="makeRoomImage()" :src="makeRoomImage()" @error="makeRoomImageReplace" alt="">
                      </div>
                    </div>
                    <p class="name">
                      <group-room-icon :roomItem="currentRoom"/>
                      <span>{{ makeSendTargetName() }}</span>
                    </p>
                  </div>
                </li>
                <li>
                  <div class="messageinfo__heading">발송 시간</div>

                  <div class="messageinfo__item">
                    <template v-if="sendMessageItem.mode === 'UPDATE'">
                      <input
                          type="radio"
                          id="rr1"
                          name="rr"
                          :checked="sendMessageItem.sendType === 'NOW'"
                          @click="setSendMessageItem({sendType: 'NOW'})"
                      >
                      <label for="rr1"><span>즉시</span></label>
                      <input
                          type="radio"
                          id="rr2"
                          name="rr"
                          :checked="sendMessageItem.sendType === 'RESERVATION'"
                          @click="selectedReservation"
                      >
                      <label for="rr2"><span>예약</span></label>
                    </template>

                    <calendar-input 
                      v-if="sendMessageItem.sendType === 'RESERVATION'" 
                      :targetUserTime="targetUserTime"
                      @alertDialog="openDialog"
                      @targetUserTimeReload="targetUserTimeReload"
                    />
                  </div>
                </li>
              </ul>
              <div class="messageinfo__heading">메시지 입력</div>
            </div>
            <person-group-popup-content :option="option" :unusedFiles="unusedFiles"/>
          </div>
        </div>
        <div class="modal__footer">
          <button
              class="hi-btn btn-lg"
              :disabled="!isSend"
              @click="sendMessageItem.mode === 'UPDATE' ? sendUpdateMessage() : sendCreateMessage()"
          >
            {{ sendMessageItem.mode === 'UPDATE' ? '저장' : '예약하기' }}
          </button>
        </div>
      </div>
    </div>
    <div class="window-popup-atten type2">
    </div>
    <hitalk-notice-alert v-if="modal.isShow" :title="modal.title" :description="modal.description" @closeDialog="closeDialog">
      <div class="available-time info">
        <img :src="iconClock" /> 하이톡 가능시간 : {{ modal.highlight }}
      </div>
    </hitalk-notice-alert>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState, mapGetters} from "vuex";
import {URLProps} from "@/enums";
import CalendarInput from "@/apps/hitalk/components/popup/components/common/select/CalendarInput";
import PersonGroupPopupContent from "@/apps/hitalk/components/popup/personGroup/PersonGroupPopupContent";
import HitalkNoticeAlert from "@/apps/hitalk/components/popup/HitalkNoticeAlert";
import moment from 'moment-timezone'
import {checkTeacherChatTime, formatChatTime} from "@/apps/hitalk/utils";
import GroupRoomIcon from "@/apps/hitalk/components/common/GroupRoomIcon";
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: "person-group-popup",
  components: {PersonGroupPopupContent, CalendarInput, HitalkNoticeAlert, GroupRoomIcon},
  data() {
    return {
      option: {
        loading: {
          imagePacks: false,
          docs: false,
          video: false,
        },
      },
      cloneSendMessageItem: {},
      modal: {
        isShow: false,
        title: '하이톡 가능 시간을 확인해주세요.',
        description: '선생님의 상담 가능 시간에만 메시지를<br>보낼 수 있습니다. 시간을 다시 확인해주세요.',
        highlight: ''
      },
      targetUserTime: {},
      isTenUnder: false,
      unusedFiles: [],
      isUpdatePending: false
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', [
      'connectRoomItem', 'connectRoomMembers', 'sendMessageItem', 'reservation', 
      'roomArrayList', 'classJSONList', 'selectedTab', 'personGroupPopup'
    ]),
    ...mapGetters('storeHitalk',[
      'getDayName'
    ]),
    iconClock() {
      return require("../../../../../assets/img/icon/ic_clock.svg")
    },
    /**
     * 메시지 보내기버튼 활성화
     * @returns {boolean}
     */
    isSend() {
      const isSetSendTargets = this.sendMessageItem.targets.length > 0
      const isSetSendContents = this.sendMessageItem.fileContent.length > 0 || this.sendMessageItem.textContent.trim().length > 0
      const isSetReservationTime = this.sendMessageItem.reservationTime > 0
      const isDoneUpload = !this.option.loading.docs && !this.option.loading.imagePacks && !this.option.loading.video

      if (this.isDisabled) {
        return this.isDisabled
      }
      if (this.sendMessageItem.sendType === 'NOW') {
        return isSetSendTargets && isSetSendContents && isDoneUpload
      } else {
        return isSetSendTargets && isSetSendContents && isSetReservationTime && isDoneUpload
      }
    },
    isGroup() {
      return this.sendMessageItem.roomType === 'GROUP'
    },
    currentRoom() {
      return this.roomArrayList.find(roomItem => roomItem.room === this.sendMessageItem.roomId) || this.connectRoomItem
    },
    isOverGroupLimitTime() {
      return this.isGroup && this.currentRoom.groupType === 'LIMIT'
        && this.sendMessageItem.reservationTime > this.currentRoom.limitTimestamp
    }
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'setPersonGroupPopupIsOpen',
      'setSendMessageItem',
      'setReservationCount',
      'setCurrentRoomReservationCount',
      'clearSendMessageItem',
      'setReservationItemStatus',
      'setTabReservation',
      'clearChatMessageList',
      'hideChatLayout'
    ]),
    ...mapActions('storeHitalk', [
      'sendStompChatMessage',
      'sendStompFilesMessage',
      'getReservationCount',
      'saveReservationMessage',
      'patchReservationTime',
      'patchReservation',
      'callUserTime',
      'disconnectChatRoom'
    ]),
    selectedReservation: async function() {
      this.targetUserTime = await this.checkUserTime()
      this.setSendMessageItem({sendType: 'RESERVATION'})
    },
    targetUserTimeReload: async function() {
      this.targetUserTime = await this.checkUserTime()
    },
    closeDialog() {
      this.modal = {...this.modal, isShow: false}
    },
    openDialog(userTime) {
      this.modal = {...this.modal, isShow: true, highlight: formatChatTime(userTime)}
    },
    closePersonGroupPopupIsOpen() {
      this.setPersonGroupPopupIsOpen({isOpen: false});
    },
    /**
     * 발송대상명
     * @returns {string}
     */
    makeSendTargetName() {
      const roomNameArr = this.sendMessageItem.roomClassName.split(' ').filter(str => str.trim().length > 0)
      const className = roomNameArr.length > 2 ? `${roomNameArr[1]} ${roomNameArr[2]}` : roomNameArr[1]
      if (this.sendMessageItem.roomType === 'GROUP') {
        return `${(this.currentRoom || {}).roomName || this.sendMessageItem.roomName} ${this.sendMessageItem.targets.length}명 (${className})`
      } else {
        return this.sendMessageItem.roomName
      }
    },
    async checkUserTime() {
      if(this.sendMessageItem.roomType === 'PERSON') {
        const res = await this.$hiClass.users.read(`/users/${this.sendMessageItem.targets[0]}`)
        const memberRole = this.classJSONList[this.sendMessageItem.classId].users.find(o => o.userId === res.data.currentId).memberRole
        const userTime = await this.callUserTime({userId: res.data.currentId, userType: res.data.userType, memberRole, isSetUserTime: false})
        const isUseChat = userTime.isUseChat
        const isOverChat = userTime.isOverChat
        if(isUseChat) {
          if(res.data.userType === 'TEACHER' && !isOverChat) {
            return {isUseChat, isOver: isOverChat, isOverChat : this.checkTeacherChatTime(userTime), userTime, userType: res.data.userType}
          } else {
            return {isUseChat, isOver: isOverChat, isOverChat, userTime, userType: res.data.userType}
          }
        } else {
          return {isUseChat, isOver: isOverChat, isOverChat, userTime, userType: res.data.userType}
        }
      } else {
        return {isUseChat: true, isOver: true, isOverChat: true, userTime: null, userType: ''}
      }
    },
    checkTeacherChatTime(userTime) {
      return checkTeacherChatTime(false, userTime,
        this.sendMessageItem.reservationTime === 0 || this.isTenUnder
          ? new Date() : new Date(this.sendMessageItem.reservationTime))
    },

    checkOverGroupLimitTime() {
      if(this.isOverGroupLimitTime) {
        this.$hiClass.alert('메시지 발송일이 채팅방 종료일 이후 입니다.<br>확인 해 주세요.', 'info')
        return false
      }
      return true
    },
    /**
     * 메시지 보내기 (신규)
     */
    async sendCreateMessage() {
      const {isUseChat, isOverChat, userTime, userType} = await this.checkUserTime()

      if(!isUseChat) {
        this.$hiClass.alert('예약 가능한 시간이 없습니다.', 'info')
        return false
      }
      
      if(!isOverChat) {
        this.modal = {...this.modal, isShow: true, highlight: formatChatTime(userTime)}
        return false
      }

      if(!this.checkOverGroupLimitTime()) return false

      switch (this.sendMessageItem.sendType) {
        case 'NOW': {
          await this._sendNowMessage()
          break
        }
        case 'RESERVATION': {
          const nowTimestamp = new Date(moment().tz('Asia/Seoul')).getTime()
    
          if (this.sendMessageItem.reservationTime - nowTimestamp < 540000) { // 예약발송 10분전
            this._confirmReservationTime()

          } else {
            this._saveReservationMessage()
          }
          break
        }
      }
    },

    /**
     * 메시지 보내기 (수정)
     * @returns {Promise<void>}
     */
    async sendUpdateMessage() {
      const {isUseChat, isOverChat, userTime} = await this.checkUserTime()
      if(!isUseChat) {
        this.$hiClass.alert('예약 가능한 시간이 없습니다.', 'info')
        return false
      }
      
      if(!isOverChat) {
        this.modal = {...this.modal, isShow: true, highlight: formatChatTime(userTime)}
        return false
      }

      if(!this.checkOverGroupLimitTime()) return false

      const nowTimestamp = new Date(moment().tz('Asia/Seoul"')).getTime()
      const isSending = this.cloneSendMessageItem.reservationTime <= nowTimestamp

      switch (this.sendMessageItem.sendType) {
        case 'NOW': {
          await this._updateReservationMessage()
          break
        }
        case 'RESERVATION': {
          if (isSending) {
            this.$hiClass.alert('이미 발송된 메시지입니다.')
                .then(() => {
                  this.deleteUnusedFiles()
                  this.setPersonGroupPopupIsOpen({isOpen: false})
                })
          } else {
            if (this.sendMessageItem.reservationTime - nowTimestamp < 540000) { // 예약발송 10분전
              this._confirmReservationTime()
            } else { // 예약가능
              this._updateReservationMessage()
            }
          }
          break
        }
      }
    },

    /**
     * 예약발송 10분전 체크
     * @private
     */
    _confirmReservationTime() {
      const option = {
        confirmButtonText: '다시설정',
        cancelButtonText: '즉시발송',
        reverseButtons: true,
        allowOutsideClick: false
      }
      const confirmMsg = `예약 시간 10분 미만으로 발송할 수 없습니다.<br>예약 시간을 다시 설정 하시겠습니까?`

      this.$hiClass.confirm(confirmMsg, 'warning', option)
          .then(() => { // 다시설정
            this.setSendMessageItem({isOpenPopupCalendar: true})
          })
          .catch(() => { // 즉시발송
            if (this.sendMessageItem.mode === 'CREATE') {
              this.isTenUnder = true
              this._sendNowMessage()
            } else {
              this.setSendMessageItem({sendType: 'NOW'})
              this._updateReservationMessage()
            }
          })
    },

    /**
     * 상태별 알럿 메시지 return
     * @param status
     * @returns {{msg: string, status}}
     * @private
     */
    _returnStatusMsg(status) {
      let msgObj = {
        msg: '',
        status: status
      }
      switch (status) {
        case 'CANCEL':
          msgObj.msg = `대화방이 유효하지 않아 메시지를 전송할 수 없습니다.<br>다시 확인해주세요.`
          break
        case 'FAILURE':
          msgObj.msg = `예약 메시지 전송 중에 일시적인 문제가 발생하였습니다.<br>메시지를 다시 예약해주세요.`
          break
        case 'COMPLETE':
          msgObj.msg = `이미 발송 완료된 메시지입니다.`
          break
        default:
          msgObj.msg = ''
      }

      return msgObj
    },

    /**
     * 예약메시지 수정
     */
    _updateReservationMessage() {
      if (this.sendMessageItem.sendType === 'NOW') { // 즉시인경우 현재시간으로 변경
        this.setSendMessageItem({reservationTime: new Date(moment().tz('Asia/Seoul"')).getTime()})
      }

      if (this._getUpdateType() === 'UPDATE_TIME') {
        this._patchReservationTime() // 시간만 수정
      } else {
        this._patchReservationItem() // 전체 수정
      }
    },

    /**
     * 시간만 변경된 경우와 아닌 경우를 비교
     * @returns {string}
     * @private
     */
    _getUpdateType() {
      const isEqualReservationTime = _.isEqual(this.sendMessageItem.reservationTime, this.cloneSendMessageItem.reservationTime)
      const isEqualFileContentType = _.isEqual(this.sendMessageItem.fileContentType, this.cloneSendMessageItem.fileContentType)
      const isEqualSendType = _.isEqual(this.sendMessageItem.sendType, this.cloneSendMessageItem.sendType)
      const isEqualTextContent = _.isEqual(this.sendMessageItem.textContent, this.cloneSendMessageItem.textContent)
      const isEqualTargets = _.isEqual(this.sendMessageItem.targets, this.cloneSendMessageItem.targets)
      const isEqualFileContent = _.isEqual(this.sendMessageItem.fileContent, this.cloneSendMessageItem.fileContent)

      if ((!isEqualReservationTime || !isEqualSendType) &&
          isEqualFileContentType &&
          isEqualTextContent &&
          isEqualTargets &&
          isEqualFileContent
      ) {
        return 'UPDATE_TIME' // 시간만 변경된 경우 or 예약 -> 즉시로 변경된경우
      } else {
        return 'UPDATE'
      }
    },

    /**
     * 시간만 수정
     * @private
     */
    _patchReservationTime() {
      if (this.isUpdatePending) return

      this.isUpdatePending = true

      this.patchReservationTime({
        reservationTime: this.sendMessageItem.reservationTime
      })
          .then(() => {
            if (this.sendMessageItem.sendType === 'NOW') {
              this.$hiClass.alert("메시지를 보냈습니다.")
                  .then(async () => {
                    this.deleteUnusedFiles()
                    this.setPersonGroupPopupIsOpen({isOpen: false})
                    this.setReservationItemStatus({
                      scheduleId: this.sendMessageItem.scheduleId,
                      status:'ING'
                    })
                  })
            } else {
              this.deleteUnusedFiles()
              this.setPersonGroupPopupIsOpen({isOpen: false})
            }
          })
          .catch(() => {
            this.isUpdatePending = false
          })
    },

    /**
     * 변경된 사항을 모두 수정
     * @private
     */
    async _patchReservationItem() {
      if (this.isUpdatePending) return

      this.isUpdatePending = true

      const messages = this._makeMessages()
      const targets = this._makeTargets()

      let requestBody = {
        scheduleId: this.sendMessageItem.scheduleId,
        reservationTime: this.sendMessageItem.reservationTime,
        roomType: this.sendMessageItem.roomType,
        userId: this.user.currentId,
        classId: this.sendMessageItem.classId,
        status: this.sendMessageItem.status,
        messages: messages,
        targets: targets,
        roomId: this.sendMessageItem.roomId
      }

      const isSuccess = await this.patchReservation(requestBody)
      if (!isSuccess) {
        this.isUpdatePending = false
        return
      }

      if (this.sendMessageItem.sendType === 'NOW') {
        this.$hiClass.alert("메시지를 보냈습니다.")
            .then(async () => {
              this.deleteUnusedFiles()
              this.setPersonGroupPopupIsOpen({isOpen: false})
              this.setReservationItemStatus({
                scheduleId: this.sendMessageItem.scheduleId,
                status:'ING'
              })
            })
      } else {
        this.deleteUnusedFiles()
        this.setPersonGroupPopupIsOpen({isOpen: false})
      }
    },

    /**
     * 즉시 발송
     * @returns {Promise<void>}
     */
    async _sendNowMessage() {
      const {isUseChat, isOverChat, userTime} = await this.checkUserTime()
      this.isTenUnder = false
      if(!isUseChat) {
        this.$hiClass.alert('예약 가능한 시간이 없습니다.')
        return false
      }
      
      if(!isOverChat) {
        this.modal = {...this.modal, isShow: true, highlight: formatChatTime(userTime)}
        return false
      }
      if (this.sendMessageItem.textContent.trim().length > 0) {
        let sendChatItem = {}
        sendChatItem.message = this.sendMessageItem.textContent
        sendChatItem.roomItem = {
          room: this.sendMessageItem.roomId,
          roomType: this.sendMessageItem.roomType
        }
        await this.sendStompChatMessage(sendChatItem)
      }

      // 메시지가 있을 경우 메시지만 먼저 전송하기 위해 파일 전송 딜레이 추가
      const FILE_SEND_TIMEOUT = this.sendMessageItem.textContent.trim().length > 0 ? 500 : 0

      if (this.sendMessageItem.fileContent.length > 0) {
        let sendFilesItem = {}
        sendFilesItem.roomItem = {
          room: this.sendMessageItem.roomId,
          roomType: this.sendMessageItem.roomType
        }
        sendFilesItem.files = this.sendMessageItem.fileContent
        sendFilesItem.contentType = this.sendMessageItem.fileContentType

        if (this.sendMessageItem.fileContentType === 'PHOTO' && this.sendMessageItem.fileContent.length > 1) {
          sendFilesItem.contentType = 'PHOTOMULTI'
        }

        setTimeout(async () => {
          await this.sendStompFilesMessage(sendFilesItem)
        }, FILE_SEND_TIMEOUT)
      }

      this.deleteUnusedFiles()
      this.setPersonGroupPopupIsOpen({isOpen: false})
    },

    /**
     * 예약발송 메시지 등록
     * @private
     */
    async _saveReservationMessage() {
      const messages = this._makeMessages()
      const targets = this._makeTargets()

      let requestBody = {
        reservationTime: this.sendMessageItem.reservationTime,
        roomType: this.sendMessageItem.roomType,
        userId: this.user.currentId,
        classId: this.sendMessageItem.classId,
        roomId: this.sendMessageItem.roomId,
        messages: messages,
        targets: targets
      }

      this.saveReservationMessage(requestBody)
          .then(() => {
            this.$hiClass.alert('메시지를 예약했습니다.')
                .then(() => {
                  let params = {userId: this.user.currentId}
                  this.getReservationCount(params) // 전체 건수
                      .then(res => {
                        this.setReservationCount(res.data.count)
                      })

                  params.roomId = this.sendMessageItem.roomId
                  this.getReservationCount(params)  // 채팅방 건수
                      .then(res => {
                        this.setCurrentRoomReservationCount(res.data.count)
                      })

                  this.deleteUnusedFiles()
                  this.setPersonGroupPopupIsOpen({isOpen: false})

                  if(this.connectRoomItem) {
                    this.disconnectChatRoom()
                    this.clearChatMessageList()
                    this.hideChatLayout()
                  }
                  this.setTabReservation()
                })
          })
    },

    /**
     * 보낼 messges 만들기
     * @returns {*[]}
     * @private
     */
    _makeMessages() {
      let messages = []
      if (this.sendMessageItem.textContent.trim().length > 0) {
        messages.push({
          contentType: 'CHAT',
          content: this.sendMessageItem.textContent
        })
      }

      if (this.sendMessageItem.fileContent.length > 0) {
        if (this.sendMessageItem.fileContent.length > 1) {
          let fileArr = []
          this.sendMessageItem.fileContent.forEach(file => {
            fileArr.push(file)
          })
          messages.push({
            contentType: 'PHOTOMULTI',
            content: JSON.stringify(fileArr)
          })
        } else {
          if (this.sendMessageItem.fileContentType === 'PHOTOMULTI') {
            this.sendMessageItem.fileContentType = 'PHOTO'
          }
          messages.push({
            contentType: this.sendMessageItem.fileContentType,
            content: JSON.stringify(this.sendMessageItem.fileContent[0])
          })
        }
      }

      if (this.sendMessageItem.messages.length > 0 && this.sendMessageItem.mode === 'UPDATE') {
        this._compareMessages(messages)
      }

      return messages
    },

    /**
     * 예약된 메시지 정보와 비교 sortNo 설정
     * @param messages
     * @private
     */
    _compareMessages(messages) {
      messages.forEach(message => {
        const equalTypeFile = _.find(this.sendMessageItem.messages, {'contentType': message.contentType})
        if (equalTypeFile) {
          message.messageId = equalTypeFile.messageId
        }
      })

      // 'CHAT' 첫번째로 정렬
      _.sortBy(messages, 'contentType').forEach((message, index) => message.sortNo = index + 1)
    },

    /**
     * 메시지 발송 대상 만들기
     * @returns {*[]}
     * @private
     */
    _makeTargets() {
      let targetArr = []
      this.sendMessageItem.targets.forEach(target => {
        targetArr.push({
          targetId: target
        })
      })
      return targetArr
    },

    makeRoomImage() {
      const room = (this.currentRoom.room || this.currentRoom.roomId)

      if (this.personGroupPopup.from === 'CHAT') { // 대화방에서 예약시
        if (this.currentRoom.roomType === 'PERSON') {
          const targetUser = this.connectRoomMembers.find(member => {
            return member.userId !== this.user.currentId
          })
          return (targetUser && (targetUser.photo)) || URLProps.DEFAULT_PROFILE_IMAGE_URL;
        } else {
          const clazz = this.classJSONList[this.connectRoomItem.classId]
          return clazz.class.classImagePath || EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS;
        }
      } else { // 예약목록에서 수정시
        return this.sendMessageItem.thumbnailPath ? this.sendMessageItem.thumbnailPath : URLProps.DEFAULT_PROFILE_IMAGE_URL
      }
    },
    makeRoomImageReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
    deleteUnusedFiles() {
      let deleteApi = []
      this.unusedFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.allSettled(deleteApi)
          .then(() => {
            this.unusedFiles = []
          })
    }
  },
  async created() {
    this.makeRoomImage()
    this.targetUserTime = await this.checkUserTime()
    if (this.sendMessageItem.mode === 'UPDATE') {
      // 수정시 변경된 데이터에따라 호출하는 api 다르게 하기 위해 원본은 복제해놓는다
      this.cloneSendMessageItem = _.cloneDeep(this.sendMessageItem)
    }
  },
  beforeDestroy() {
    this.clearSendMessageItem()
  }
}
</script>

<style lang="scss" scoped>
  .hitalk-messageinfo {
    width: 470px;
    text-align: left;
    .image-wrap {
      display: inline-block;
      position: relative;
      .crown {
        left: -8px;
        top: -5px;
        width: 15px;
        height: 15px;
      }
      .name {
        display: flex;
        height: 24px;
        span {
          line-height: 1.4;
        }
      }
    }
    > ul {
      > li {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        .messageinfo__heading { 
          min-width: 100px;
        }
      }
    }
    .messageinfo__heading {
      color: #000;
      font-size: 15px;
      font-weight: 500;
      line-height: 36px;
    }
    .messageinfo__item {
      p {
        display: inline;
        color: #000;
        font-size: 15px;
        line-height: 1.5;
        word-break: break-all;
        vertical-align: middle;
      }
      .image {
        overflow: hidden;
        position: relative;
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        margin-right: 8px;
        vertical-align: middle;
        background: url("~@/assets/img/icon/profile_default_hiclass.svg") no-repeat;
        background-size: cover;
        margin-right: 10px;
        img {
          position: absolute;
          top: 50%;
          left: 50%;
          width: auto;
          min-width: 100%;
          height: 100%;
          background-color: #fff;
          transform: translate(-50%,-50%);
          -webkit-transform: translate(-50%,-50%);
          object-fit: cover;
          image-rendering: auto;
        }
      }
      input[type=radio] {
        + label {
          margin-right: 16px;
        }
      }
    }
    ~ .hitalk-messagebox {
      height: 320px;
    }
  }
  .available-time {
    width: 100%;
    margin-top: 15px;
    padding: 10px 30px 10px;
    background: var(--web-background-blue-01, #F8F9FC);
    border-radius: 8px;
    text-align: center;
    &.info {
      display: flex;
      align-items: flex-start;
      color: var(--primary);
      font-feature-settings: 'clig' off, 'liga' off;
      font-family: var(--font-body);
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 21px; /* 150% */
      letter-spacing: -0.2px;
    }
  }
</style>