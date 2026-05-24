<!--
@File(Method): ReservationItem.vue
@Author: -
@Date Created: -
@Description: 하이톡 > 예약 메시지 목록 > 리스트 항목(아이템)
@Modified: 2024-11-12 - #69464 캐밥 메뉴 디자인 시스템 적용
-->
<template>
  <li
      class="reservation__item"
      :class="{'is-sending': reservationItem.status === 'ING'}"
      role="button"
      @click="updateReservationMessage($event)"
  >
    <div v-if="!reservation.isSearchMode" class="checkbox">
      <input
          class="is-not-click-area"
          type="checkbox"
          :id="reservationItem.scheduleId"
          :value="reservationItem.scheduleId"
          v-model="reservation.deleteList"
      >
      <label :for="reservationItem.scheduleId" class="is-not-click-area"></label>
    </div>

    <div class="image-wrap"> 
      <span v-if="isManage" class="class-administrator crown">administrator</span>
      <div class="image">
        <!-- <img v-if="reservationItem.thumbnailPath" :src="reservationItem.thumbnailPath" alt=""> -->
        <img :src="profileImage" @error="profileImageReplace" alt="">
      </div>
    </div>
    <div class="info">
      <div class="name">
        <GroupRoomIcon :roomItem="reservationItem" />
        <span class="mr-05">{{ reservationItem.roomType === 'GROUP' ? reservationItem.roomName : reservationItem.targetName }}</span>
        <span v-if="reservationItem.roomType !== 'PERSON'" class="num">{{ reservationItem.targetCount }}</span>
        <span class="class">{{ reservationItem.className }}</span>
      </div>
      <p class="message" :class="{'file': reservationItem.isFile}" v-html="makeContentText()"></p>
      <div class="reservation">
        <span class="date" :class="{'is-error': isError}">
          {{ reservationMessage }}
        </span>
        <div class="icon-error" v-if="isError">
          <div 
            class="hi-tooltip" 
            v-if="this.reservationItem.status === 'CANCEL' || ['E10', 'E50', 'E60', 'E99'].includes(this.reservationItem.errorCode)"
          >
            <span>{{ failTooltip }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- #69464 캐밥 메뉴 디자인 시스템 적용 -->
    <HiKebab 
      :id="`kebabmenu-${reservationItem.scheduleId}`"
      v-if="reservationItem.status !== 'ING'">
      <template v-if="reservationItem.status === 'RESERVATION'">
        <button class="btn-hitalk-send" @click="sendNow">지금 보내기</button>
        <button class="btn-hitalk-delete" @click="deleteReservation">예약 삭제</button>
      </template>
      <template v-if="reservationItem.status === 'FAILURE'">
        <button class="btn-hitalk-reserve" @click="resendMessage">실패메시지 재전송</button>
        <button class="btn-hitalk-delete" @click="deleteReservation">전송내역 삭제</button>
      </template>
      <template v-if="reservationItem.status === 'CANCEL'">
        <button class="btn-hitalk-delete" @click="deleteReservation">전송내역 삭제</button>
      </template>
    </HiKebab>    
  </li>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import moment from 'moment-timezone'
import {URLProps} from "@/enums";
import HiKebab from "@/components/Kebab/HiKebab.vue";
import GroupRoomIcon from '@/apps/hitalk/components/common/GroupRoomIcon.vue'
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: "ReservationItem",
  data() {
    return {
      currentTimer: null,
      callApiTimer: null,
      currentTimestamp: 0,
      isShowMenu: false
    }
  },
  components:{HiKebab,GroupRoomIcon},
  props: {
    reservationItem: {
      type: Object
    },
    cloneKeyword: {
      type: String
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', ['reservation', 'reservationMessagesResult', 'classJSONList', 'roomArrayList']),
    isManage() {
      const {memberRole} = this.classJSONList[this.reservationItem.classId] || {}
      return ['GROUP', 'BATCH'].includes(this.reservationItem.roomType) && (memberRole === 'OWNER' || memberRole === 'MANAGER')
    },
    isError() {
      return this.reservationItem.status === 'FAILURE' || 
        this.reservationItem.status === 'CANCEL' || 
        ['E10', 'E50', 'E60', 'E99'].includes(this.reservationItem.errorCode)
    },
    reservationMessage() {
      const isNotKst = new Date().getTimezoneOffset() !== -540
        
      let reservationDate = moment(this.reservationItem.reservationTime).tz('Asia/Seoul').format('M월 DD일 HH:mm')
      switch (this.reservationItem.status) {
        case 'RESERVATION':
          return `${reservationDate} ${isNotKst ? '(KST)' : ''} 예약`
        case 'COMPLETE':
          return ''
        case 'DELETE':
          return ''
        case 'FAILURE': {
          if (this.reservationItem.roomType === 'BATCH') {
            return `${reservationDate} ${isNotKst ? '(KST)' : ''} 전송실패 ${this.reservationItem.failCount}건`
          } else {
            return `${reservationDate} ${isNotKst ? '(KST)' : ''} 전송실패`
          }
        }
        case 'CANCEL':
          return `${reservationDate} ${isNotKst ? '(KST)' : ''} 전송취소`
        case 'ING': // API에는 없는 화면 컨트롤용 상태값
          return `${reservationDate} ${isNotKst ? '(KST)' : ''} 전송 중입니다.`
        default:
          return reservationDate
      }
    },
    failTooltip() {
      switch (this.reservationItem.errorCode) {
        case 'E10': // 수신 대상 서비스 or 클래스 탈퇴 (전송취소)
          return  '대화상대가 클래스를 탈퇴하거나 서비스를 탈퇴하여 하이톡을 전송할 수 없습니다.'
        case 'E20': // 단체방 폭파 (전송취소)
          return '단체방이 나가기 되어 하이톡을 전송할 수 없습니다.'
        case 'E30': // 발신자 클래스 탈퇴 or 권한 해제 (전송취소)
            // 예약 취소 및 목록에서 삭제
          return ''
        case 'E40': // 클래스 비공개 (전송취소)
            // 예약 취소 및 목록에서 삭제
          return ''
        case 'E50': // 클래스 비공개 (전송취소)
          // 하이톡 사용안하거나 상담외 시간일경우
          return '선생님이 하이톡을 사용하지 않거나 상담 가능 시간이 아닌 경우 전송할 수 없습니다.'
        case 'E60': // 발신자 권한 해제 (전송취소)
          return '기간 채팅방이 종료되어 예약 메시지 전송이 취소되었습니다.'
        case 'E99': // 서버, 네트워크 오류 (전송실패)
          return '예약 메시지 전송 중에 일시적인 문제가 발생하였습니다. 메시지를 다시 예약해주세요.'
        default:
          return ''
      }
    },
    profileImage() {
      const defaultImage = this.reservationItem.roomType === 'GROUP' || this.reservationItem.roomType === 'BATCH' ?
        EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS : URLProps.DEFAULT_PROFILE_IMAGE_URL;
      return this.reservationItem.thumbnailPath || defaultImage;
    },
    roomItem() {
      return this.roomArrayList.find(r => r.room === this.reservationItem.roomId) || {}
    }
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'setPersonGroupPopupIsOpen',
      'setSendMessageItem',
      'setBatchPopupIsOpen',
      'deleteReservationDeleteList',
      'deleteReservationSearchList',
      'setReservationPaging',
      'setReservationCount'
    ]),
    ...mapActions('storeHitalk', [
      'getReservationStatus'
    ]),

    /**
     * 예약 상세 조회
     */
    _getReservationByScheduleId() {
      this.$axios({
        method: 'GET',
        url: `/hitalks/reservation/${this.reservationItem.scheduleId}`
      }).then(res => {
        this.setPersonGroupPopupData(res.data)
      })
    },

    /**
     * 수정 팝업 열때 데이터 설정
     * @param reservationItem, mode
     */
    setPersonGroupPopupData(reservationItem) {
      let sendMessageItem = {}
      sendMessageItem.mode = 'UPDATE'
      sendMessageItem.classId = reservationItem.classId
      sendMessageItem.roomType = reservationItem.roomType
      sendMessageItem.thumbnailPath = reservationItem.thumbnailPath
      sendMessageItem.messages = reservationItem.messages
      sendMessageItem.roomName = this._makeRoomName(reservationItem) || this.reservationItem.roomName
      sendMessageItem.roomClassName = reservationItem.className
      sendMessageItem.sendType = 'RESERVATION'
      sendMessageItem.reservationTime = reservationItem.reservationTime
      sendMessageItem.targets = reservationItem.targets.map(target => target.targetId)
      sendMessageItem.scheduleId = reservationItem.scheduleId
      sendMessageItem.status = reservationItem.status

      // roomId가 있으면
      if(reservationItem.roomId) {
        sendMessageItem.roomId = reservationItem.roomId
      }

      // CHAT 타입 메시지가 있으면
      const messageItem = reservationItem.messages.find(message => message.contentType === 'CHAT')
      if (messageItem) {
        sendMessageItem.textContent = messageItem.content
      }

      // FILE, PHOTO, PHOTOMULTI, VIDEO 타입 메시지가 있으면
      const fileItem = reservationItem.messages.find(message => message.contentType !== 'CHAT')
      if (fileItem) {
        sendMessageItem.fileContent = fileItem.contentType === 'PHOTOMULTI' ?
            JSON.parse(fileItem.content) :
            [JSON.parse(fileItem.content)]
        sendMessageItem.fileContentType = fileItem.contentType
      }

      if (reservationItem.roomType !== 'BATCH') {
        sendMessageItem.targets = reservationItem.targets.map(target => target.targetId)
      }

      this.setSendMessageItem(sendMessageItem)

      if (reservationItem.roomType === 'BATCH') { // 일괄메시지
        this.setBatchPopupIsOpen(true)
      } else { // 1:1 or 단체방
        this.setPersonGroupPopupIsOpen({isOpen: true, from: 'RESERVED'})
      }
    },

    /**
     * 채팅방 이름 생성
     * @param reservationItem
     * @returns {string|*}
     * @private
     */
    _makeRoomName(reservationItem) {
      return reservationItem.roomType === 'GROUP' ?
          reservationItem.roomName :
          reservationItem.targetName
    },

    /**
     * 예약 메시지 수정
     * @param e
     * @returns {boolean}
     */
    updateReservationMessage(e) {
      // 체크박스, 케밥메뉴 클릭시 동작 막기
      if (
          e.target.className.includes('is-not-click-area') ||
          e.target.className.includes('btn-hitalk')
      ) {
        return false
      }

      // 실패, 취소는 수정화면 제공 안함
      if (this.isError) {
        return false
      }

      if (this.reservationItem.status === 'ING') {
        this.$hiClass.alert('메시지가 전송 중입니다. </br>잠시만 기다려주세요.')
        return false
      }

      this._getReservationByScheduleId()
    },

    /**
     * 예약 메시지
     * @returns {*}
     */
    makeContentText() {
      const content = this.reservationItem.content.replaceAll('>', '&gt;').replaceAll('<', '&lt;')
      if (this.reservation.isSearchMode) { // 검색단어에 하이라이트
        return content.replaceAll(this.cloneKeyword, `<span class="highlight">${this.cloneKeyword}</span>`)
      } else {
        return content
      }
    },

    /**
     * 지금 보내기
     */
    async sendNow() {
      const now = this.$moment().valueOf()
      const statusItem = await this._getStatusItem()

      if (statusItem.status === 'DELETE') {
        this._actionStatus(statusItem)

      } else {
        this.$axios({
          method: 'PATCH',
          url: `/hitalks/reservation/${this.reservationItem.scheduleId}/time`,
          data: {reservationTime: now}
        }).then(() => {
          this.reservationItem.status = 'ING'
          this.reservationItem.reservationTime = now
          this._sendMessage()
        }).catch(() => this.$hiClass.alert('선생님의 상담 가능 시간에만 메시지를 보낼 수 있습니다.<br>상담 시간을 확인해주세요.'))
      }
    },

    /**
     * 예약시간 도래시 상태체크
     */
    async _sendMessage() {
      if (this.reservationItem.status !== 'ING') {
        const statusItem = await this._getStatusItem()

        if (statusItem.status === 'DELETE') {
          this._actionStatus(statusItem)
          return false
        } else {
          this.reservationItem.status = 'ING'
        }
      }
    },

    /**
     * 예약상태 조회 {scheduleId, status, errorCode, failCount}
     * @returns {Promise<*>}
     * @private
     */
    async _getStatusItem() {
      const requestBody = {
        userId: this.user.currentId,
        scheduleIds: [this.reservationItem.scheduleId]
      }

      const [statusItem] = await this.getReservationStatus(requestBody)
      return statusItem
    },

    /**
     * 메시지 코드별 처리
     * @param msgCodeOrStatus
     * @private
     */
    _actionMessageCode(pushItem) {
      switch (pushItem.messageCode) {
        case 'hiTalkReservationComplete':
          this._spliceReservationList() // 예약목록에서 삭제
          break
        case 'hiTalkReservationFailure':
          this.reservationItem.status = 'FAILURE'
          this.reservationItem.failCount = pushItem.failCount
          this.isShowMenu = false
          break
        case 'hiTalkReservationCancel':
          this.reservationItem.status = 'CANCEL'
          this.reservationItem.errorCode = pushItem.errorCode
          this.isShowMenu = false
          break
      }
    },

    /**
     * 예약 상태별 처리
     * @param msgCodeOrStatus
     * @private
     */
    _actionStatus(statusItem) {
      switch (statusItem.status) {
        case 'COMPLETE':
        case 'DELETE':
          this._spliceReservationList() // 예약목록에서 삭제
          break
        case 'FAILURE':
          this.reservationItem.status = 'FAILURE'
          this.reservationItem.failCount = statusItem.failCount
          this.isShowMenu = false
          break
        case 'CANCEL':
          this.reservationItem.status = 'CANCEL'
          this.reservationItem.errorCode = statusItem.errorCode
          this.isShowMenu = false
          break
      }
    },

    /**
     * 예약내역 삭제
     */
    deleteReservation() {
      this.$axios({
        method: 'DELETE',
        url: `/hitalks/reservation/${this.reservationItem.scheduleId}`,
        data: {userId: this.user.currentId}
      }).then(() => {
        this._spliceReservationList()
      })
    },

    /**
     * 예약내역 배열에서 삭제
     * @private
     */
    _spliceReservationList() {
      this.deleteReservationDeleteList(this.reservationItem.scheduleId)
      this.deleteReservationSearchList(this.reservationItem.scheduleId)
      this.setReservationPaging({size: this.reservation.searchList.length})
      this.setReservationCount(this.reservation.count - 1 )
    },

    /**
     * 실패 메시지 재전송
     */
    resendMessage() {
      this._confirmResend()
          .then(() => {
            this.$axios({
              method: 'PATCH',
              url: `/hitalks/reservation/${this.reservationItem.scheduleId}/status`,
              data: {userId: this.user.currentId, sendType: 'RESEND'}
            }).then(res => {
              this.reservationItem.status = 'ING'
              this._sendMessage()
            })
          })
          .catch(() => {})
    },

    /**
     * 재전송 전 컨펌메시지
     * @returns {*}
     * @private
     */
    _confirmResend() {
      let confirmMsg = ''
      if (this.reservationItem.roomType === 'BATCH') {
        confirmMsg = `실패한 ${this.reservationItem.failCount}건의 메시지를 <br>지금 재전송하시겠습니까?`
      } else {
        confirmMsg = '실패한 메시지를 지금 재전송하시겠습니까?'
      }

      return this.$hiClass.confirm(confirmMsg)
    },

    profileImageReplace(e) {
      e.target.src = URLProps.DEFAULT_PROFILE_IMAGE_URL
    }
  },
  created() {
    // 1시간 안에 발송되는 예약건만 체크, 상태가 '예약'인 경우
    const isLeftOneHour = this.$moment().valueOf() >= this.reservationItem.reservationTime - 3600000
    if (isLeftOneHour && this.reservationItem.status === 'RESERVATION') {
      this.currentTimer = setInterval(() => {
        this.currentTimestamp = this.$moment().valueOf()
      })
    }
  },
  beforeDestroy() {
    if (this.callApiTimer) {
      clearInterval(this.callApiTimer)
    }

    if (this.currentTimer) {
      clearInterval(this.currentTimer)
    }
  },
  watch: {
    currentTimestamp(newVal) {
      // 예약시간 도래
      if (newVal > this.reservationItem.reservationTime) {
        this._sendMessage()
        clearInterval(this.currentTimer)
      }
    },
    'reservationItem.status'(newVal) {
      if (newVal === 'ING') {
        // 10초에 한번 상태조회 api 호출
        this.callApiTimer = setInterval(async () => {
          const pushItem = this.reservationMessagesResult.find(result => {
            return result.scheduleId === this.reservationItem.scheduleId
          })

          if (pushItem) { // api 호출전 발송완료됐을때
            clearInterval(this.callApiTimer)
            this._actionMessageCode(pushItem)

          } else {
            const statusItem = await this._getStatusItem()

            if (statusItem.status !== 'RESERVATION') {
              clearInterval(this.callApiTimer)
              this._actionStatus(statusItem)
            }
          }
        }, 10000)
      }
    }
  }
}
</script>

<style scoped>
.crown {
  left: -8px;
  top: -5px;
  width: 20px;
  height: 20px;
}
.image-wrap {
  display: inline-block;
  position: relative;
}
.name {
  display: flex;
  height: 24px;
}

.name span {
  line-height: 1.4;
}

.name .num {
  margin-top: 2px;
  font-size: 12px;
}

.name span.class {
  line-height: 1.4;
}

</style>