<!--
@File(Method): BatchPopup.vue
@Author: -
@Date Created: -
@Description: 하이톡 > 대화상대 > 일괄 버튼 클릭 > 일괄메시지 작성 팝업
@Modified: 2025-01-09 - #69560 구성원 관리 태그 추가 - 검색영역 태그, 필터 추가 / HiModal 컴포넌트로 변경
-->
<template>
  <div v-show="sendMessageItem.isGetAllClassSubscribes">
    <HiModal type="type01" size="lg" @close="closeBatchPopupIsOpen" class="hitalk">
      <template v-slot:heading>{{ sendMessageItem.mode === 'CREATE' ? '일괄메시지 작성' : '예약 메시지 수정' }}</template>
      <template v-slot:content>
        <div class="hi-row sm-gutters a-stretch">
          <div class="col-sm-6">
            <div class="box-border pb-00">
              <div class="tit-h4 fst">
                발송 대상  
                <span class="num">
                  <span class="ft-blue">
                    {{ sendMessageItem.targets.length }}
                  </span>
                 / {{ sendMessageItem.classSubscribes.length }}명
                </span>
              </div>     
              <div class="select-target-wrap">
                <MemberSearch :clazzTags="clazzTags" @search="search"/>
                <target-top
                  v-if="sendMessageItem.classSubscribes.length > 0"
                  :isUseTime="true"
                  :memberSearchItem="memberSearchItem"
                />
                <target-list :isUseTime="true" :memberSearchItem="memberSearchItem"/>
              </div>       
            </div>
          </div>
          <div class="col-sm-6">
            <batch-popup-content :option="option" :unusedFiles="unusedFiles" class="col-box" />
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="primary" size="lg" 
          :disabled="!isSend" 
          @click="sendCreateMessage" 
          v-if="sendMessageItem.mode === 'CREATE'" 
        > 
        {{ sendBtn }}
        </HiButton>           
        <HiButton color="primary" size="lg"  
          :disabled="!isSend"
          @click="sendUpdateMessage"
          v-if="sendMessageItem.mode === 'UPDATE'"
        >
        확인
        </HiButton>           
      </template>
    </HiModal>
    <div class="window-popup-atten type2">
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";
import TargetTop from "@/apps/hitalk/components/popup/components/common/targetList/TargetTop";
import TargetList from "@/apps/hitalk/components/popup/components/common/targetList/TargetList";
import BatchPopupContent from "@/apps/hitalk/components/popup/batch/BatchPopupContent";
import axios from "@/plugins/axios";
import { checkTeacherChatTime, formatChatTime } from "@/apps/hitalk/utils";
import MemberSearch from "@/components/Search/MemberSearch";

export default {
  name: "batch-popup",
  components: {TargetTop, TargetList, BatchPopupContent,MemberSearch},
  data() {
    return {
      option: {
        loading: {
          imagePacks: false,
          docs: false,
          video: false,
        },
      },
      cloneSendMessageItem: {}, // 원본 예약메시지 복제 데이터 (예약메시지가 있는 경우)
      unusedFiles: [],
      clazzTags: [],
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      },
      isUpdatePending: false
    }
  },
  computed: {
    ...mapFields(['isDimLoading']),
    ...mapState(['user']),
    ...mapState('storeHitalk', [
      'sendMessageItem',
      'stompClient',
      'connectRoomItem',
      'classJSONList',
      'apiVersionPrefix',
    ]),

    /**
     * 메시지 보내기버튼 활성화
     * @returns {boolean}
     */
    isSend() {
      const isSetSendTargets = this.sendMessageItem.targets.length > 0
      const isSetSendContents = this.sendMessageItem.fileContent.length > 0 || this.sendMessageItem.textContent.trim().length > 0
      const isSetReservationTime = this.sendMessageItem.reservationTime > 0
      const isDoneUpload = !this.option.loading.docs && !this.option.loading.imagePacks && !this.option.loading.video

      if (this.sendMessageItem.sendType === 'NOW') {
        return isSetSendTargets && isSetSendContents && isDoneUpload
      } else {
        return isSetSendTargets && isSetSendContents && isSetReservationTime && isDoneUpload
      }
    },
    /**
     * 메시지 보내기버튼 명
     */
    sendBtn() {
      const targetCount = this.sendMessageItem.targets.length
      const btnName = this.sendMessageItem.sendType === 'NOW' ?
          '보내기' :
          '예약하기'
      return `${targetCount}명 ${btnName}`
    }
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'setBatchPopupIsOpen',
      'setTabReservation',
      'setTabRoom',
      'setReservationCount',
      'clearSendMessageItem',
      'setSendMessageItem',
      'setReservationItemStatus',
      'clearChatMessageList',
      'hideChatLayout'
    ]),
    ...mapActions('storeHitalk', [
      'sendStompPersonalMessageChat',
      'sendStompPersonalMessageFiles',
      'patchReservation',
      'patchReservationTime',
      'getReservationCount',
      'saveReservationMessage',
      'connectStompClient',
      'disconnectChatRoom',
      'callChatUserList'
    ]),
    closeBatchPopupIsOpen() {
      this.setBatchPopupIsOpen(false);
    },
    /**
     * 메시지 보내기 (신규)
     */
    async sendCreateMessage() {
      switch (this.sendMessageItem.sendType) {
        case 'NOW': {
          if(!(await this.validateConstraintsOfSendingTargets())) return;
          await this._sendNowBatchMessage()
          break
        }
        case 'RESERVATION': {
          const nowTimestamp = this.$moment().valueOf()

          if (this.sendMessageItem.reservationTime - nowTimestamp < 540000) { // 예약발송 10분전
            await this._confirmReservationTime()

          } else {
            this._saveReservationMessage()
          }
          break
        }
      }
    },

    /**
     * 메시지 보내기 (수정)
     */
    async sendUpdateMessage() {
      const nowTimestamp = this.$moment().valueOf()
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
                  this.setPersonGroupPopupIsOpen({isOpen: false})
                })
          } else {
            const nowTimestamp = this.$moment().valueOf()
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
        this.setSendMessageItem({reservationTime: this.$moment().valueOf()})
      }

      if (this._getUpdateType() === 'UPDATE_TIME') {
        this._patchReservationTime() // 시간만 수정
      } else {
        this._patchReservationItem() // 전체 수정
      }
    },

    /**
     * 예약시간 체크
     * @private
     */
    _confirmReservationTime() {
      const option = {
        confirmButtonText: '다시설정',
        cancelButtonText: '즉시발송',
        reverseButtons: true,
        allowOutsideClick: false
      }
      const confirmMsg = `예약 시간 10분 미만으로 발송할 수 없습니다. <br>예약 시간을 다시 설정 하시겠습니까?`

      this.$hiClass.confirm(confirmMsg, 'warning', option)
          .then(() => { // 다시설정
            this.setSendMessageItem({isOpenPopupCalendar: true})
          })
          .catch(() => { // 즉시발송
            if (this.sendMessageItem.mode === 'CREATE') {
              this._sendNowBatchMessage()
            } else {
              this.setSendMessageItem({sendType: 'NOW'})
              this._updateReservationMessage()
            }
          })
    },

    /**
     * 즉시 발송 일괄메시지
     * @returns {Promise<void>}
     */
    async _sendNowBatchMessage() {
      const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay));

      const sendBatchMessage = async (receiver) => {
        let sendItem = {}

        if(receiver.roomId) {
          sendItem.roomId = receiver.roomId
        } else {
          throw new Error('Room ID is missing')
        }
        
        if (this.sendMessageItem.textContent.trim().length > 0) {
          sendItem.message = this.sendMessageItem.textContent
        }

        if (this.sendMessageItem.fileContent.length > 0) {
          sendItem.files = this.sendMessageItem.fileContent
        }

        if((!sendItem.message || sendItem.message.length === 0) && !sendItem.files.length === 0) {
          throw new Error('Message and files are missing')
        }

        try {
          if(sendItem.message && sendItem.message.length > 0) {
            await this.sendStompPersonalMessageChat(sendItem)
          }

          if(sendItem.files && sendItem.files.length > 0) {
            await wait(500)
            await this.sendStompPersonalMessageFiles(sendItem)
          }
        } catch (e) {
          throw new Error('Failed to send message')
        }

      }

      if(this.sendMessageItem.textContent.trim().length === 0 && this.sendMessageItem.fileContent.length === 0) {
        this.$hiClass.alert('전송할 메시지나 파일이 없습니다.')
        return;
      }

      this.isDimLoading = true
      try {
        const res = await this._getRoomList();
        const set = new Set(this.sendMessageItem.targets);
        const receiver = [...set];
        // 선택한 대상자 수 와 생성 혹은 조회된 방 수 체크
        const respondReceivers = res.data.receivers || res.data._embedded.targets;

        if (receiver.length !== respondReceivers.length) {
          this.$hiClass.alert("일괄메시지 전송이 실패하였습니다. 다시 시도해주세요.");
          return false;
        }

        const sendApis = respondReceivers.map(receiver => sendBatchMessage(receiver));

        try {
          await Promise.all(sendApis);
          this.$hiClass.alert("전송되었습니다.").then(() => {
            this.deleteUnusedFiles();
            this.setBatchPopupIsOpen(false);
            this.setTabRoom();
          });
        } catch (e) {
          this.$hiClass.alert(
            "일부 메시지 전송이 실패하였습니다.<br>대화목록에서 확인해주세요.").then(() => {
            this.deleteUnusedFiles();
            this.setBatchPopupIsOpen(false);
            this.setTabRoom();
          });
          this.isDimLoading = false;
        }
      } catch (error) {
        this.$hiClass.alert("일괄메시지 전송이 실패하였습니다. 다시 시도해주세요.");
        this.isDimLoading = false;
      }
      this.isDimLoading = false
    },

    /**
     * 일괄메시지 대화방 조회
     */
    async _getRoomList() {
      const set = new Set(this.sendMessageItem.targets)
      const receiver = [...set]

      let requestBody = {}
      requestBody.sender = this.user.currentId
      requestBody.classId = this.sendMessageItem.classId
      requestBody.receiver = receiver
      requestBody.targetIds = receiver

      return axios({
        method: "POST",
        url: this.apiVersionPrefix.startsWith('/v') ? `${this.apiVersionPrefix}/hitalks/batch` : "/chatEach",
        data: requestBody
      })
    },

    /**
     * 전송할 messges 만들기
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

      // 수정모드이면 전송된 messages의 정보를 비교해서 전송
      if (this.sendMessageItem.messages.length > 0) {
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

    /**
     * 예약발송 메시지 등록
     * @private
     */
    _saveReservationMessage() {
      let requestBody = {}
      requestBody.reservationTime = this.sendMessageItem.reservationTime
      requestBody.roomType = this.sendMessageItem.roomType
      requestBody.userId = this.user.currentId
      requestBody.classId = this.sendMessageItem.classId
      requestBody.messages = this._makeMessages()
      requestBody.targets = this._makeTargets()

      this.saveReservationMessage(requestBody)
          .then(() => {
            this.$hiClass.alert('메시지를 예약했습니다.').then(() => {
              this.getReservationCount({userId: this.user.currentId})
                  .then(res => {
                    this.setReservationCount(res.data.count)
                  })
              this.deleteUnusedFiles()
              this.setBatchPopupIsOpen(false)
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
                    this.setBatchPopupIsOpen(false)
                    this.setReservationItemStatus({
                      scheduleId: this.sendMessageItem.scheduleId,
                      status:'ING'
                    })
                  })
            } else {
              this.deleteUnusedFiles()
              this.setBatchPopupIsOpen(false)
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
              this.setBatchPopupIsOpen(false)
              this.setReservationItemStatus({
                scheduleId: this.sendMessageItem.scheduleId,
                status:'ING'
              })
            })
      } else {
        this.deleteUnusedFiles()
        this.setBatchPopupIsOpen(false)
      }
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
    },
    async validateConstraintsOfSendingTargets () {
      await this.callChatUserList()
      const clazz = this.classJSONList[this.sendMessageItem.classId]
      const classUsers = clazz.users
      const unmatchedTargets = this.sendMessageItem.targets
                      .map(t => (classUsers.find(u => u.userId === t) || {}))
                      .filter(u => u.userType === 'TEACHER' &&
                         (!u.user.isUseChat || !checkTeacherChatTime(u.user.isOverChat, u.user)))
      console.log('unmatchedTargets', unmatchedTargets)
      if (unmatchedTargets.length === 0) return true
      const targets = this.sendMessageItem.targets.filter(t => !unmatchedTargets.map(u => u.userId).includes(t))
      this.setSendMessageItem({targets})
      if (targets.length > 0) return true
      const firstUnmatched = unmatchedTargets[0].user
      const errorMessage = !firstUnmatched.isUseChat
        ? '선생님이 하이톡을 사용하지 않습니다.'
        : `선생님의 상담 가능 시간에만 메시지를 보낼 수 있습니다.<br>시간을 다시 확인해주세요.<br>
              <div style="width: 100%;margin-top: 15px;padding: 10px 30px 10px;background: var(--web-background-blue-01, #F8F9FC);border-radius: 8px;color: #4778DE;">
                <img src="${require('../../../../../assets/img/icon/ic_clock.svg')}"> 하이톡 가능시간 : ${formatChatTime(firstUnmatched)}
              <div>`
      this.$hiClass.alert(errorMessage)
      return false
    },
    async getTags() {
      const res = await this.$axios.get(`/clazzes/${this.sendMessageItem.classId}/tags`)
      if (res.data._embedded && res.data._embedded.clazzTags.length > 0) {
        this.clazzTags = res.data._embedded.clazzTags
      }
    },
    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
    }
  },
  created() {
    if (this.sendMessageItem.mode === 'UPDATE') {
      // 수정시 변경된 데이터에따라 호출하는 api 다르게 하기 위해 원본은 복제해놓는다
      this.cloneSendMessageItem = _.cloneDeep(this.sendMessageItem)
    }
    this.getTags()
  },
  beforeDestroy() {
    this.clearSendMessageItem()
  }
}
</script>

<style scoped lang="scss">
.box-border{
  padding: 25px 20px;
  text-align: left;
}
.select-target-wrap{
  margin: 0 -20px;
  .select-target__list{
    ::v-deep{
      .hi-nodata{padding:125px 0;}
    }
  }
}
</style>
