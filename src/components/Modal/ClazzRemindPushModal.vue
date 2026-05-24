<!--
@File(Method): ClazzRemindPushModal.vue
@Description: 게시판 > 리마인트 푸시 모달( 좋아요 댓글 스크랩 영역 좌측에 읽음 표시 클릭)
@Modified: 2025-05-19 - #74428 클래스 > 푸시 발송 기능 추가
-->
<template>
  <!-- new modal : 리마인드 푸시 -->
  <HiModal type="type01" size="lg" @close="closeModal" class="modal-remind-push">
    <template v-slot:heading>푸시 보내기
      <p class="smr">선택한 구성원에게 푸시 알림을 보내실 수 있습니다.</p>
    </template>
    <template v-slot:content >
        <div class="ft-blue-warning">
          <span v-if="!isGeneralType">푸시는 5분 간격으로 전송가능하며, </span>수신자의 알림 설정에 따라 푸시 수신이 어려울 수 있습니다.
        </div>
        <div class="area-remind-push n">
          <div v-if='!isGeneralType' class="remind-push__left select-target-wrap">
            <MemberSearch :clazzTags="clazzTags" @search="search"/>
            <div v-show="memberSearchItem.searchType === 'NONE'" class="group-checkbox">
              <input
                v-if="!isGeneralType"
                type="checkbox"
                id="c1"
                :class="{ dis: isDisabledUnReadUserIds }"
                :checked="isCheckedUnReadUserIds"
                :disabled="isDisabledUnReadUserIds"
                @change="e => onClickCheckbox(e.target, m => !m.readTimestamp)"
              >
              <label v-if="!isGeneralType" for="c1"><span>읽지 않은 구성원</span></label>
              <input
                type="checkbox"
                id="c2"
                :class="{ dis: isDisabledAllUserIds }"
                :checked="isCheckedAllUserIds"
                :disabled="isDisabledAllUserIds"
                @change="e => onClickCheckbox(e.target, () => true)"
              >
              <label for="c2"><span>전체</span></label>
              <input
                type="checkbox"
                id="c3"
                :class="{ dis: isDisabledParentsUserIds }"
                :checked="isCheckedParentsUserIds"
                :disabled="isDisabledParentsUserIds"
                @change="e => onClickCheckbox(e.target, m => m.userType === 'PARENTS')"
              >
              <label for="c3"><span>학부모</span></label>
              <input
                type="checkbox"
                id="c4"
                :class="{ dis: isDisabledStudentUserIds }"
                :checked="isCheckedStudentUserIds"
                :disabled="isDisabledStudentUserIds"
                @change="e => onClickCheckbox(e.target, m => m.userType === 'STUDENT')"
              >
              <label for="c4" class="mr-00"><span>학생</span></label>
            </div>
            <div class="remind-push__list">
              <div
                v-for="pushUser of pushUserList"
                :key="pushUser.userId"
                class="remind-push__item"
              >
                <div class="profile-list">
                  <selectable-item :class="{ read: pushUser._readTimestamp }" :user="pushUser" :showImage="false" v-model="pushUser.selected" :disabled="pushUser.disabled"/>
                    <p
                      class="status"
                      :class="{ read: pushUser._readTimestamp }"
                    >
                      {{ pushUser._readTimestamp ? $moment(pushUser._readTimestamp).format('MM-DD HH:mm') : '읽지않음' }}
                    </p>
                </div>
              </div>              
              <div class="hi-nodata" v-if="pushUserList.length === 0">
                <p>
                검색결과가 없습니다.
                </p>
              </div>
            </div>
          </div>
          <div v-else class="remind-push__left select-target-wrap">
            <MemberPicker
              ref="memberPicker"
              :customMemberClass="(user) => ({'is-attendance': attendanceSubmitMembers.some(m => m.userId === user.userId)})"
              :showSelected="false"
              v-model="postReadUsers"
              :selectAllFlags="{TEACHER: false, PARENTS: true, STUDENT: true}"
              @input="onInputMemberPicker"
              :fixCheckerArea="true"
              typeOrder="PARENTS,STUDENT,TEACHER"
              sortBy="studentName"
              :showStudentNo="false"
              :showStudentProfileName="false"
              >
              <template v-slot:group-checkbox-prefix="scope">
                <input
                  type="checkbox"
                  id="c1"
                  :disabled="(scope.members || []).length === 0"
                  v-model="checkersForGeneralType.attendance"
                  @change="checkersForGeneralType.leave = false"
                  @click="onClickSelectAllForAttendance"
                >
                <label for="c1" style="user-select: none;"><span>출석 안내</span></label>
                <input
                  type="checkbox"
                  id="c2"
                  :disabled="(scope.members || []).length === 0"
                  v-model="checkersForGeneralType.leave"
                  @change="checkersForGeneralType.attendance = false"
                  @click="onClickSelectAllForLeave"
                >
                <label for="c2" style="user-select: none;"><span>귀가 안내</span></label>
              </template>
                <template v-slot:postItem="scope">
                  <div v-if="attendanceSubmitMembers.some(m => m.userId === scope.user.userId)" class="attendance-wrap">
                    <div v-for="attendance in (attendances = attendanceSubmitMembers.find(m => m.userId === scope.user.userId).attendances)" :key="attendance.attendanceId" class="attendance-item">
                      {{ formatAttendance(attendance, attendances.length > 1) }}
                    </div>
                  </div>
                </template>
            </MemberPicker>
          </div>

          <div class="remind-push__right">
            <div class="remind-push__textarea">
              <strong class="heading n" style="font-size: 16px;">푸시 내용 입력</strong>
              <div v-if='isGeneralType' class="tit-input">
                <label for="a" style="font-size: 16px; padding-top: 2px; margin-right: 5px; white-space: nowrap;">제목 :</label>
                <input type="text" id="a" placeholder="" v-model="model.title" maxlength="20"
                  @keydown="e => (forceBlockInputOver(20))(e)"
                  @keyup="e => (forceBlockInputOver(20))(e)"
                >
              </div>
              <div class="count-textarea-wrap">
                <div v-if="isGeneralType" style="position: relative; width: 100%; padding: 16px 15px 0;">
                  <pretty-textarea
                    ref="prettyTextarea"
                    class="count-textarea"
                    highlight='[{"pattern": "#학생이름", "style": "color: blue;"}]'
                    style="font-family: var(--font-body); width: 100%; height: 100%; position: relative;"
                    v-model="model.message"
                    placeholder="# 메일 머지 검색"
                    @input="onInput"
                    @keyup="checkHashtag"
                    @click="showMerge = false"
                    maxlength="80"
                  
                  ></pretty-textarea>
                </div>
                <textarea
                  v-else
                  class="count-textarea"
                  :class="{ dis: !isClassActivated }"
                  placeholder="내용을 입력해주세요."
                  maxlength="100"
                  :disabled="!isClassActivated || (!isGeneralType && isDisabledAllUserIds)"
                  v-model="model.message"
                  ref="textarea"
                ></textarea>
                <div v-if="showMerge" class="item-list" :style="mergeStyle">
                  <ul style="background-color: white;">
                    <li v-for="t in mailMergeWords" :key='t' @click="addTextAndCloseMailMergePicker(t)">
                      {{ t }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="count-word">
                <span class="count">{{ model.message.length || 0 }}</span><span>/{{ isGeneralType ? 80 : 100}}자</span>
              </div>
            </div>
            <p class="num">총 <strong>{{ pushTargetUserIds.length || 0 }}</strong>명</p>
            <button
              class="hi-btn btn-lg"
              :class="{ dis: !isReadySubmit }"
              :title="!isClassActivated ? '클래스가 비활성화되었습니다.' : ''"
              :disabled="!isReadySubmit"
              @click="submit"
            >
              보내기
            </button>
          </div>
        </div>
    </template>
  </HiModal>
</template>

<script>
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import SelectableItem from '@/components/Profile/List/SelectableItem';
import MemberSearch from "@/components/Search/MemberSearch";
import MemberPicker from "@/apps/main/clazzes/components/MemberPicker.vue";
import { SendMessages } from '@/apis/SendMessages';
import { Attendances } from "@/apis/Attendances";
import { V2 } from "@/apis/V2";
import { NotificationUserSettings } from "@/apis/NotificationUserSettings";
import { PrettyTextarea } from '@winm2m/pretty-textarea';

const apis = {
  sendMessages: new SendMessages(),
  attendances: new Attendances(),
  v2: new V2(),
  notificationUserSettings: new NotificationUserSettings()
}

export default {
  name: "clazz-remind-push-modal",
  components: {SelectableItem, MemberSearch, MemberPicker },
  data() {
    return {
      mailMergeWords: ['학생이름'],
      postReadUsers: [],
      model: {
        postId: null,
        userId: null,
        userIds: [],
        message: '',
        title: '',
      },
      lastSendPostRemind: {},
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      },
      // #74428 클래스 > 푸시 발송 기능 추가 : 임의 데이터
      showMerge: false,
      mergeLeft: 0,
      mergeTop: 0,
      mergeRight: 0,
      attendanceSubmitMembers: [],
      checkersForGeneralType: {
        attendance: false,
        leave: false
      }
    }
  },
  computed: {
    ...mapState(['isLoading', 'clazzRemindPushModal', 'user', 'curClassItem']),
    ...mapGetters(['getPostTypeNameByCode', 'getUserNameByClazzSubscribeView', 'CONSTANTS']),
    ...mapState('storeClazzTag', ['clazzTags']),
    isGeneralType() {
      return this.clazzRemindPushModal.isGeneralType || false
    },
    postItem() {
      return this.clazzRemindPushModal.postItem || {}
    },
    postItemType() {
      return this.clazzRemindPushModal.postItemType
    },
    schoolType() {
      return this.clazzRemindPushModal.schoolType
    },
    classStatus() {
      if (this.postItemType === 'CLAZZES_POST' || this.isGeneralType)
        return this.curClassItem.classStatus

      return this.postItem && this.postItem.parent
        ? this.postItem.parent.classStatus
        : null
    },
    classId() {
      if (this.isGeneralType)
        return this.curClassItem.currentId

      if (this.postItemType === 'CLAZZES_POST')
        return this.postItem.parentId

      return this.postItem && this.postItem.parent
          ? this.postItem.parent.currentId
          : null
    },
    postId() {
      return this.postItem
          ? this.postItem.currentId
          : null
    },
    postTypeName() {
      const code = this.postItem.postType
      if (code === 'BOARD') return this.postItem.board.boardName || '자유게시판'

      const type = this.schoolType
      const params = { code }

      if (code === 'NOTE')
        params.type = type

      return this.getPostTypeNameByCode(params)
    },
    pushUserList() {
      if (this.memberSearchItem.searchType === 'KEYWORD') {
        return this.postReadUsers.filter(u =>
            (u.userName || '').includes(this.memberSearchItem.searchValue) ||
            (u.memberChildName || '').includes(this.memberSearchItem.searchValue)
        )

      } else if (this.memberSearchItem.searchType === 'TAG') {
        return this.postReadUsers.filter(u => (u.tags || []).map(t => t.tagId).includes(this.memberSearchItem.searchValue))

      } else if (this.memberSearchItem.searchType === 'TAG_MULTI') {
        return this.memberSearchItem.searchValue.length > 0 ?
            this.postReadUsers.filter(u => this.memberSearchItem.searchValue
                .some(tagId => (u.tags || []).map(t => t.tagId).includes(tagId))
            ) :
            this.postReadUsers

      } else {
        return this.postReadUsers
      }
    },
    userTypesByPushTarget() {
      const pushTarget = this.postItem.pushTarget
      const userTypes = ['TEACHER']
      switch (pushTarget) {
        case 'ALL':
          userTypes.push('PARENTS')
          userTypes.push('STUDENT')
          break
        case 'PARENTS':
          userTypes.push('PARENTS')
          break
        case 'STUDENT':
          userTypes.push('STUDENT')
          break
      }
      return userTypes;
    },
    isClassActivated() {
      return this.classStatus
        ? this.classStatus === this.CONSTANTS.CLASS_STATUS.ACTIVATE
        : false
    },
    isReadySubmit() {
      return this.isClassActivated
          && this.pushTargetUserIds.length > 0
    },
    isCheckedUnReadUserIds() {
      return this.postReadUsers.filter(d => !d.readTimestamp && !d.selected && !d.disabled).length === 0
    },
    isCheckedAllUserIds() {
      return this.postReadUsers.filter(d => !d.disabled && d.selected).length === this.postReadUsers.filter(d => !d.disabled).length
    },
    isCheckedParentsUserIds() {
      return this.isDisabledParentsUserIds ? false : this.postReadUsers.filter(d => !d.disabled && d.userType === 'PARENTS' && !d.selected).length === 0
    },
    isCheckedStudentUserIds() {
      return this.isDisabledStudentUserIds ? false : this.postReadUsers.filter(d => !d.disabled && d.userType === 'STUDENT' && !d.selected).length === 0
    },
    isDisabledUnReadUserIds() {
      return !this.isClassActivated
          || this.postReadUsers.length === 0
    },
    isDisabledAllUserIds() {
      const filteredUsers = this.postReadUsers.filter(user => user.memberRole)
      return !this.isClassActivated || filteredUsers.length === 0
    },
    isDisabledParentsUserIds() {
      return !this.isClassActivated
          || !this.userTypesByPushTarget.includes('PARENTS')
          || this.postReadUsers.filter(d => !d.disabled && d.userType === 'PARENTS').length === 0
    },
    isDisabledStudentUserIds() {
      return !this.isClassActivated
          || !this.userTypesByPushTarget.includes('STUDENT')
          || this.postReadUsers.filter(d => !d.disabled && d.userType === 'STUDENT').length === 0
    },
    computedUnReadUserIds() {
      return this.pushUserList
          .filter(d => d.memberRole && !d._readTimestamp)
          .filter(d => d.userId !== this.user.currentId)
          .map(d => d.userId)
    },
    computedAllUserIds() {
      return this.pushUserList
          .filter(d => d.memberRole)
          .filter(d => d.userId !== this.user.currentId)
          .map(d => d.userId)
    },
    computedParentsUserIds() {
      return this.pushUserList
          .filter(d => d.memberRole && d.memberRole === 'MEMBER' && d.userType !== 'STUDENT')
          .filter(d => d.userId !== this.user.currentId)
          .map(d => d.userId)
    },
    computedStudentUserIds() {
      return this.pushUserList
          .filter(d => d.memberRole && d.memberRole === 'MEMBER' && d.userType === 'STUDENT')
          .filter(d => d.userId !== this.user.currentId)
          .map(d => d.userId)
    },
    computedWriteUserIds() {
      return this.pushUserList
          .filter(d => d.userId === this.user.currentId)
          .map(d => d.userId)
    },
    pushTargetUserIds() {
      return this.pushUserList
          .filter(d => (this.isGeneralType || d.userId !== this.user.currentId) && d.selected).map(d => d.userId)
    },
    isSecretBoard() {
      return (this.postItem.board || {}).boardType === 'SECRET'
    },
    // #74428 클래스 > 푸시 발송 기능 추가 : 머지 리스트 위치
    mergeStyle() {
      if (this.mergeLeft >= 146) {
        return {
          top: `${this.mergeTop}px`,
          right: `${Math.abs(this.mergeRight)}px`,
          position: 'absolute',
          zIndex: 1000,
        }
      } else {
        return {
          top: `${this.mergeTop}px`,
          left: `${this.mergeLeft}px`,
          position: 'absolute',
          zIndex: 1000,
        }
      }
    },
    formatAttendance() {
      const typeMap = {
        'ABSENCE': '결석',
        'LATENESS': '지각',
        'EARLY_LEAVE': '조퇴',
        'OUT': '외출',
        'FIELD_STUDY': '가정체험학습'
      }
      const confirmTypeMap = {
        ILLNESS: "질병",
        NOT_ACCEPT: "미인정",
        ETC: "기타",
        ATTENDANCE: "출석인정"
      }
      return (attendance, multi = false) => {
        if (!attendance) return ''
        return `${typeMap[attendance.attendanceType] || attendance.attendanceType}`
         + (attendance.attendanceConfirmType === null ? ' (미인정)' : ` (${confirmTypeMap[attendance.attendanceConfirmType] || attendance.attendanceConfirmType})`)
         + (multi ? ` - ${attendance.studentName}` : '')
      }
    },
    prettifiedMessage() {
      return this.mailMergeWords.reduce((msg, word) => {
        return msg.replace(`#${word}`, `<span class="mail-merge-word">#${word}</span>`)
      }, this.model.message)
    }
  },
  localStorage: {
    lastSendPostRemind: {
      type: Object,
      default: {},
    }
  },
  async created() {
    this.clazzRemindPushModalLogEvent('click')

    this.setIsLoading(true)
    await this.loadPostReadUsers()
    await this.fetchTags(this.classId)
    this.setIsLoading(false)

    await this.initModel()

    this.lastSendPostRemind = this.$localStorage.get('lastSendPostRemind')
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations([
      'setIsLoading',
      'setClazzRemindPushModal',
    ]),
    ...mapActions([
      'callPostRemind',
      'triggerAnalyticsLogEvent',
    ]),
    ...mapActions('storeBoard', [
      'getPostReadUsers',
      'getSecretBoardUsers'
    ]),
    ...mapActions('storeClazzTag', [
      'fetchTags'
    ]),
    closeModal() {
      if (this.clazzRemindPushModal.isOpen) {
        this.setClazzRemindPushModal({
          isOpen: false
        })
      }
    },
    async initModel() {
      this.model.userId = this.user.currentId

      if (this.isGeneralType) {
        this.model.userIds = this.computedWriteUserIds
        this.clearContentForGeneralType()
        const { data } = await apis.attendances.getSubmitMembersSubmitMembersClassId(this.classId)
        this.attendanceSubmitMembers = (data._embedded || {}).attendanceSubmitMembers || []
      } else {
        this.model.postId = this.postItem.currentId
        this.model.message = `${this.postTypeName}에 중요한 내용이 있습니다.\n꼭 확인해 주세요.\n`
        this.model.message += `'${this.getInitPostTitle()}'`
        this.model.message = this.$hiClass.getHtmlParsedContent(this.model.message)
      }
    },
    clazzRemindPushModalLogEvent(status) {
      switch (status) {
        case 'click':
        case 'complete': {
          const logPayload = {
            code: `analytics.class.post.remind.${status}`,
            value1: this.postTypeName === '공지' ? '알림장' : this.postTypeName
          }
          this.triggerAnalyticsLogEvent(logPayload)
         break
        }
      }
    },
    getInitPostTitle() {
      const postType = this.postItem.postType
      let postTitle = this.postItem.postTitle
      if (!postTitle && postType === 'NOTE') {
        const posted = this.postItem.posted
        postTitle = this.$moment(posted).format(`M월 D일 (ddd) ${this.postTypeName}`)
      }
      return postTitle
    },
    async loadPostReadUsers() {
      if (this.isGeneralType) {
        this.postReadUsers = []
        return
      }
      const pushUserTypes = this.userTypesByPushTarget
      const readableUsers = this.isSecretBoard
        ? await this.getSecretBoardUsers(this.postItem.board.boardId)
        : []
      const readableUserIds = readableUsers.map(d => d.userId)
      const readable = u => !this.isSecretBoard || readableUserIds.includes(u.userId)
      this.postReadUsers = (await this.getPostReadUsers(this)).filter(d => d.userType === 'TEACHER' || d.readTimestamp || readable(d))
        .map(d => ({...d, user: d, selected: !d.readTimestamp,
        disabled: d.userId === this.user.currentId || !readable(d) || !d.memberRole
        , _readTimestamp: d.readTimestamp}))
      const additionalUsers = readableUsers.filter(d => !this.postReadUsers.find(u => u.userId === d.userId)).map(d => ({...d, user: d, selected: true, disabled: false, _readTimestamp: undefined}))
      this.postReadUsers = this.postReadUsers.concat(additionalUsers)
      this.postReadUsers = this.postReadUsers.map(d => (d.userId === this.user.currentId) ? {...d, selected: true, disabled: true} : d)
      this.postReadUsers.filter(d => !pushUserTypes.includes(d.userType)).forEach(d => d.disabled = true)
      this.postReadUsers = this.postReadUsers.filter(d => d._readTimestamp || pushUserTypes.includes(d.userType))
      this.postReadUsers = [
        ...this.postReadUsers.filter(d => d.memberRole === 'OWNER'),
        ...this.postReadUsers.filter(d => d.memberRole === 'MANAGER'),
        ...this.postReadUsers.filter(d => d.userType === 'STUDENT'),
        ...this.postReadUsers.filter(d => d.userType === 'PARENTS'),
        ...this.postReadUsers.filter(d => !d.userType)
      ]
    },
    onClickCheckbox(el, filter) {
      this.postReadUsers.filter(d => !d.disabled).filter(filter).forEach(d => d.selected = el.checked)
    },
    checkValidationOfGeneralType() {
      if (!this.isGeneralType) return true
      if (this.model.title.length === 0 || this.model.message.length === 0) {
        this.$hiClass.alert('제목과 내용을 입력해주세요.')
        return false
      }
      return true
    },
    submit() {
      if (!this.checkValidationOfGeneralType()) {
        return
      }

      const lastSendTimestamp = this.lastSendPostRemind[this.postId]
      if (!this.isGeneralType && lastSendTimestamp && this.$moment().diff(lastSendTimestamp, 'seconds') <= 5 * 60) {
        this.$hiClass.alert('마지막 알림 전송 시점으로부터<br>5분 후 전송하실 수 있습니다.<br>잠시 후 시도해 주세요.', 'warning')
        return false
      }

      const colorWord = `<span style="color: #4778DE">푸시</span>`
      const confirmMessage = `수신대상(${this.pushTargetUserIds.length}명)에게<br>${colorWord}를 보내시겠습니까?`

      this.$hiClass.confirm(confirmMessage)
          .then(async () => {
            const payload = {
              postType: this.postItem.postType,
              model: { ...this.model, userIds: this.pushTargetUserIds }
            }
            try {
              if (!this.isGeneralType) {
                await this.callPostRemind(payload)
                this.clazzRemindPushModalLogEvent('complete')
              }
              else {
                await apis.sendMessages.teacherAlarmTeacherAlarm({
                  classId: this.classId,
                  userIds: this.pushTargetUserIds,
                  message: this.model.message,
                  title: this.model.title || '확인해주세요',
                })
              }

              // 마지막 알림 전송시간 저장
              this.lastSendPostRemind[this.postId] = this.$moment().valueOf()

              // 마지막 알림 전송 후 5분이 지난 key 삭제
              for (const [key, value] of Object.entries(this.lastSendPostRemind)) {
                const overTime = this.$moment().diff(value, 'seconds')
                this.$log.debug(this.$options.name, 'overTime:', overTime)
                if (overTime >= 5 * 60)
                  delete this.lastSendPostRemind[key]
              }

              // storage 에 최종 저장
              this.$localStorage.set('lastSendPostRemind', this.lastSendPostRemind)

              this.$hiClass.alert('푸시가 전송되었습니다.', 'success')
                  .then(() => this.closeModal())

            } catch (e) {
              this.$hiClass.alert('전송 중 오류가 발생하였습니다.', 'error')
            }
          })
    },
    sortedKind(number, type) {
      if(number === 999 && type === "PARENTS") {
        return "num-pno"
      }

      if(number === 999 || type === "TEACHER") {
        return "num-no"
      }

      if(type === "PARENTS") {
        return "num"
      }
      
      return "num-std"
    },
    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
    },    
    // #74428 클래스 > 푸시 발송 기능 추가 :
    // #머지 아닐때 머지리스트 hidden, 
    onInput(e) {
      this.model.message = e.target.value.slice(0, 80)
    },
    //#머지 체크해서 머지리스트 show, 
    checkHashtag(e) {
      const textarea = this.$refs.prettyTextarea.shadowRoot.querySelector('textarea')
      if (!textarea || textarea.selectionStart === 0) {
        this.showMerge = false
        return
      }
      if (textarea.value.charAt(textarea.selectionStart - 1) === '#') {
        this.$nextTick(() => {
          const { left, top, right } = this.getCaretCoordinates()
          this.mergeLeft = left
          this.mergeRight = right
          this.mergeTop = top + 10
          this.showMerge = true
        })
      } else {
        this.showMerge = false
      }
    },
    //#머지 체크시 커서위치 구하는 함수  
    getCaretCoordinates() {
      const textarea = this.$refs.prettyTextarea.shadowRoot.querySelector('textarea')

      if (!textarea) return { left: 0, top: 0 }

      const { selectionStart } = textarea
      const style = getComputedStyle(textarea)

      // 가상 div 생성
      const div = document.createElement('div')
      for (const prop of style) {
        div.style[prop] = style[prop]
      }

      div.style.position = 'absolute'
      div.style.visibility = 'hidden'
      div.style.whiteSpace = 'pre-wrap'
      div.style.overflow = 'auto'
      div.style.width = textarea.offsetWidth + 'px'

      // 커서 앞 텍스트 + 커서 위치 span
      const before = textarea.value.substring(0, selectionStart)
      const span = document.createElement('span')
      span.textContent = '\u200b' // zero-width space

      div.textContent = before
      div.appendChild(span)

      textarea.parentNode.appendChild(div)

      // 커서 위치 계산
      const spanRect = span.getBoundingClientRect()
      const textareaRect = textarea.getBoundingClientRect()

      // textarea 기준 커서 상대 좌표
      const left = spanRect.left - textareaRect.left
      const right = spanRect.right - textareaRect.right
      // style.lineHeight이 'normal'일 경우 실제 line-height를 계산
      let lineHeight = style.lineHeight;
      if (lineHeight === 'normal') {
        // 임시 span을 만들어 실제 line-height를 측정
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.fontFamily = style.fontFamily;
        tempSpan.style.fontSize = style.fontSize;
        tempSpan.textContent = 'M';
        document.body.appendChild(tempSpan);
        lineHeight = tempSpan.offsetHeight;
        document.body.removeChild(tempSpan);
      } else {
        lineHeight = parseFloat(lineHeight);
      }
      const top = spanRect.top - textareaRect.top + lineHeight - textarea.scrollTop;

      // 안 쓰는 div 제거
      textarea.parentNode.removeChild(div)

      return { left, top, right }
    },
    onClickSelectAllForAttendance(e) {
      if (e.target.checked) return this.prepareAttendanceNoticeWithMessage( '오늘 출석 안내', '#학생이름 학생이 출석했습니다.')
      else this.onUnselectCheckboxForGeneralType()
    },
    onClickSelectAllForLeave(e) {
      if (e.target.checked) return this.prepareAttendanceNoticeWithMessage( '오늘 귀가 안내', '#학생이름 학생이 귀가했습니다.')
      else this.onUnselectCheckboxForGeneralType()
    },
    onUnselectCheckboxForGeneralType() {
      this.unSelectAllParents()
      this.clearContentForGeneralType()
    },
    clearContentForGeneralType() {
      this.model.message = '';
      (this.$refs.prettyTextarea || {}).value = '';
      this.model.title = '확인해주세요';
    },
    unSelectAllParents() {
      this.$refs.memberPicker.removeAllTypedMembersByFilter('PARENTS', () => true)
    },
    async prepareAttendanceNoticeWithMessage(title, message) {
      await this.$comn.asyncWaitFor(() => this.$refs.memberPicker && this.$refs.memberPicker.ready)
      this.$refs.memberPicker.addAllTypedMembersByFilter('PARENTS', user => !this.attendanceSubmitMembers.some(m => m.userId === user.userId))
      this.$refs.prettyTextarea.value = message
      this.model.message = message
      this.model.title = title
    },
    addTextAndCloseMailMergePicker(text) {
      const textarea = this.$refs.prettyTextarea.shadowRoot.querySelector('textarea')
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      const currentText = this.model.message
      this.$refs.prettyTextarea.value = currentText.substring(0, start) + text + currentText.substring(end)
      this.model.message = this.$refs.prettyTextarea.value

      textarea.selectionStart = start + text.length
      textarea.selectionEnd = start + text.length

      this.showMerge = false
    },
    onInputMemberPicker() {
      this.postReadUsers.forEach(user => {user.selected = true})
    },
    forceBlockInputOver(maxLength) {
      return e => {
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'];
        if (
          e.target.value.length >= maxLength &&
          !allowedKeys.includes(e.key)
        ) {
          e.target.value = e.target.value.substring(0, maxLength)
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        return true
      }
    },
    readyToSendAttendanceNotice() {
      this.prepareAttendanceNoticeWithMessage( '오늘 출석 안내', '#학생이름 학생이 출석했습니다.')
      this.checkersForGeneralType.attendance = true
    }
  }
}
</script>

<style lang="scss" scoped>
.hi-modal-common.modal-remind-push {
  display: block;

  ::v-deep{
    .modal__layer {
      z-index: 99999999;
      width: 800px;
      .modal__content {
        padding-top: 0;
      }  
      .modal__header { padding: 20px 24px; margin-top: 25px; }
      .modal__header span { display: inline-block; height: 23px; font-size: 15px; font-weight: 400; color: #616161; line-height: 23px; margin-top: 10px; }
    }  
  }   
// .text {
  //     color: #616161;
  //     font-size: 16px;
  //     font-weight: 400;
  //     line-height: 1.7;
  //     text-align: left;
  // }
  .ft-blue-warning:before {
    content: "";
    width: 14px;
    height: 14px;
    margin-top: 0;
    background: url(~@/assets/img/icon_warning.svg) no-repeat 12px center;
    padding-left: 18px;
  }
  .ft-blue-warning { 
    display: flex;
    align-items: center;
    width: 100%;
    height: 45px;
    border-radius: 8px;
    border: 1px solid var(--primary);
    background: #F6F8FD;
    font-size: 14px;
    font-weight: 400;
    line-height: 21px;
    color: var(--primary);
    margin-bottom: 20px;
    text-align: left;
    padding: 0 10px;
    gap:0;
  }
}

.profile-list{
  display: flex;
  align-items: center;
  justify-content: space-between;
  .profile-list-item {
    padding: 16px 4px;
    width:calc(100% - 100px);
  }
  .status{
    min-width: 100px;
    text-align: right;
  }
}
.hi-nodata{padding:150px 0;}

.member-picker::v-deep {
  margin-top: 0px !important;
  height:386px !important;
  .left-section {
    .select-target-wrap.box-border {
      border: none;
    }

    .infinite-scroll-container.profile-list {
      height: 200px;
    }    
  }
  .profile-list-item.is-attendance{      
    label{
      width: calc(100% - 140px);
    }
    .attendance-wrap {
      width: 300px;
      text-align: right;
      .attendance-item {
        text-align: right;
        display: inline-block;
        color: #777;
        font-size: 12px;
      }
    }
  }
}

.mail-merge-word {
  color: var(--primary);
  font-weight: bold;
}
</style>