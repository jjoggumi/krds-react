<!--
@File(Method): HitalkShareModal.vue
@Author: -
@Date Created: -
@Description: 게시판 > 하이톡 공유 모달
@Modified: 2025-02-11 - #71877  [구성원태그] 하이톡 공유하기 > 검색 후 상단 체크박스 작동 오류
-->
<template>
  <div>
    <HiModal type="type01" size="lg" @close="closeModal" id="hitalkShare" class="modal-hitalk-share">
      <template v-slot:heading>하이톡으로 공유하기
        <div class="modal__tab n">
          <button
              type="button"
              @click="clickTab('userList')"
              :class="hitalkShare.currentTab === 'userList' ? 'is-active' : ''"
          >
            대화상대
          </button>
          <button
              type="button"
              @click="clickTab('chatList')"
              :class="hitalkShare.currentTab === 'chatList' ? 'is-active' : ''"
          >
            최근 대화목록
          </button>
        </div>
      </template>
      <template v-slot:content> 
        <div v-if="isShow">
          <div class="area-hitalk-share n">
            <hitalk-share-user-list
                ref="hitalkShareUserList"
                v-if="hitalkShare.currentTab === 'userList' && isShow"
                :classList="classList"
                class="select-target-wrap"
            >
              <MemberSearch
                  :clazzTags="clazzTags"
                  :useTag="isOwnerOrManager"
                  :inputPlaceholder="isOwnerOrManager ? '이름, #태그 검색' : '이름 검색'"
                  @search="search"
              />
              <div
                  v-if="hitalkShare.currentTab === 'userList' && isShow && isCurUserTypeTeacher && isOwnerOrManager"
                  v-show="memberSearchItem.searchType === 'NONE'"
                  class="group-checkbox bg-white"
              >
                <input type="checkbox" id="allChecked" :checked="getIsCheckedAll('ALL')" @change="changeCheckbox($event, 'ALL')"/>
                <label for="allChecked"><span>전체</span></label>
                <input type="checkbox" id="teacherChecked" :disabled="!hasTeacherUser" :checked="getIsCheckedAll('TEACHER')" @change="changeCheckbox($event, 'TEACHER')"/>
                <label for="teacherChecked"><span>선생님</span></label>
                <input type="checkbox" id="parentsChecked" :disabled="!hasParentsUser" :checked="getIsCheckedAll('PARENTS')" @change="changeCheckbox($event, 'PARENTS')"/>
                <label for="parentsChecked"><span>학부모</span></label>
                <input type="checkbox" id="studentChecked" :disabled="!hasStudentUser" :checked="getIsCheckedAll('STUDENT')" @change="changeCheckbox($event, 'STUDENT')"/>
                <label for="studentChecked"><span>학생</span></label>
              </div>
            </hitalk-share-user-list>
            <hitalk-share-chat-list
                ref="hitalkShareChatList"
                v-if="hitalkShare.currentTab === 'chatList' && isShow"
                :shareBtnType="shareBtnType"
                :roomList="roomList"
            >
            </hitalk-share-chat-list>
            <hitalk-share-message
                v-if="isShow"
                :post="post"
                :postType="postType"
                :schoolType="schoolType"
            >
            </hitalk-share-message>
          </div>
          <button :disabled="hitalkShare.selectedUserList.length === 0" class="hi-btn btn-lg" @click="checkTypeBeforeSendPersonalMessage">
            <strong>{{ hitalkShare.selectedUserList.length }}명 </strong>공유하기
          </button>
        </div>
        <div v-else >
          <div class="nodata">
            <p v-if="hitalkShare.currentTab === 'userList'">대화상대가 없습니다.</p>
            <p v-if="hitalkShare.currentTab === 'chatList'">최근 대화목록이 없습니다.<br>대화상대 목록에서 선택해주세요.</p>
          </div>
          <button class="hi-btn btn-lg" disabled>공유하기</button>
        </div>
      </template>
    </HiModal>
    <hitalk-share-select-popup
        :hitalkShareSelectIsOpen="hitalkShareSelectIsOpen"
        :post="post"
        @sendPersonalRoom="sendPersonalRoom"
        @sendGroupRoom="sendGroupRoom"
        @closeSelectModal="closeSelectModal"
    >
    </hitalk-share-select-popup>
  </div>
</template>

<script>
import HitalkShareUserList from "@/components/HitalkShare/HitalkShareUserList";
import HitalkShareChatList from "@/components/HitalkShare/HitalkShareChatList";
import HitalkShareMessage from "@/components/HitalkShare/HitalkShareMessage";
import HitalkShareSelectPopup from "@/components/HitalkShare/HitalkShareSelectPopup";
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {UserLevel} from "@/enums";
import {groupBy} from "lodash";
import { checkTeacherChatTime, formatChatTime, isExpiredRoom, getDefaultGroupRoomName } from "@/apps/hitalk/utils";
import MemberSearch from "@/components/Search/MemberSearch";
import {openPopup} from "@/plugins/utils";
import CONSTANTS from "@/plugins/constants";

const MSG_ALERT_SENDING_GROUP = '선택한 대화상대가 여러명입니다. <br>개별로 전송하시겠습니까?'

export default {
  name: "hitalk-share-modal",
  data() {
    return {
      currentTab: 'userList',
      hitalkShareSelectIsOpen: false,
      receiverList: [],
      roomId: '',
      isShareClick: false,
      clazzTags: [],
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      }
    }
  },
  props: {
    post: Object,
    postType: String,
    shareBtnType: String,
    schoolType: {
      type: String,
      default: ''
    }
  },
  components: {
    HitalkShareSelectPopup,
    HitalkShareMessage,
    HitalkShareChatList,
    HitalkShareUserList,
    MemberSearch
  },

  computed: {
    ...mapState([
      'user',
      'hitalkShare',
      'curClassItem'
    ]),
    ...mapState('storeHitalk', [
      'classJSONList',
      'roomArrayList'
    ]),
    ...mapGetters([
      'CONSTANTS',
      'isCurUserTypeTeacher'
    ]),

    curClassId() {
      if(!this.post) {
        return null
      }
      switch (this.shareBtnType) {
        case 'classApply':
        case 'table':
          return this.post.classId
        case 'sheet':
          return this.post.parent ? this.post.parent.classId : this.post.parentId
        case 'classPost':
          return this.post.parentId || this.post.parent.currentId
        case 'survey':
          return this.post.clazz.classId
        default:
          return null
      }
    },
    isEqualsClassSubscribe() {
      let classId
      let isEquals = true
      for (let i = 0; i < this.hitalkShare.selectedUserList.length; i++) {
        if (i === 0) {
          classId = this.hitalkShare.selectedUserList[i].classId
        } else {
          isEquals = classId === this.hitalkShare.selectedUserList[i].classId;
        }
      }
      return isEquals
    },
    groupByClassId() {
      return groupBy(this.hitalkShare.selectedUserList, 'classId')
    },
    classIdGroup() {
      let classIdReceiverGroupArr = []
      let classIdReceiverGroup
      let receiverArr

      for (let classId in this.groupByClassId) {
        classIdReceiverGroup = {}
        receiverArr = []

        for (let i = 0; i <  this.groupByClassId[classId].length; i++) {
          receiverArr.push(this.groupByClassId[classId][i].content)
        }
        classIdReceiverGroup = {
          classId: classId,
          receiverArr: receiverArr
        }

        classIdReceiverGroupArr.push(classIdReceiverGroup)
      }
      return classIdReceiverGroupArr
    },
    classList: function () {
      const list = this.classJSONList ?
          _.cloneDeep(Object.values(this.classJSONList)).filter(classItem => {
            if (classItem.users.length > 0) {
              if (this.user.userType === 'TEACHER') {
                switch (this.shareBtnType) {
                  case 'classPost':
                  case 'sheet':
                  case 'table':
                  case 'classApply':
                  case 'survey':
                    return classItem.classId === this.curClassId
                  default:
                    return classItem.memberRole !== 'MEMBER'
                }
              } else {
                switch (this.shareBtnType) {
                  case 'classPost':
                  case 'sheet':
                  case 'table':
                  case 'classApply':
                    return classItem.classId === this.curClassId
                  default:
                    return classItem
                }
              }
            } else {
              return false
            }
          }) : []

      list.map(classItem => {
        let users = [
          ...classItem.users.filter(v => v.userType === "TEACHER"),
          ...classItem.users.filter(v => v.userType === "STUDENT"),
          ...classItem.users.filter(v => v.userType === "PARENTS").map(userItem => {
            if(!userItem.memberClassNumber === true) userItem.memberClassNumber = 999
            return userItem
          }).sort((a, b) => a.memberClassNumber - b.memberClassNumber)
        ]

        if (this.memberSearchItem.searchType === 'KEYWORD') {
          users = users.filter(u =>
              u.user.userName.includes(this.memberSearchItem.searchValue) ||
              (u.memberChildName || '').includes(this.memberSearchItem.searchValue)
          )

        } else if (this.memberSearchItem.searchType === 'TAG') {
          users = users.filter(u => (u.tags || []).map(t => t.tagId).some(tagId => this.memberSearchItem.searchValue.includes(tagId)))

        } else if (this.memberSearchItem.searchType === 'TAG_MULTI') {
          users = this.memberSearchItem.searchValue.length > 0 ?
              users.filter(u => this.memberSearchItem.searchValue.some(tagId => (u.tags || []).map(t => t.tagId).includes(tagId))) :
              users
        }

        classItem.users = users
        return classItem
      })

      return list
    },
    roomList() {
      const filtered = ['classPost', 'sheet', 'table', 'classApply', 'survey'].includes(this.shareBtnType)
        ? this.roomArrayList.filter(room => room.classId === this.curClassId)
        : this.roomArrayList
      const isUnknownRoomName = room => (room.keyword || []).includes('(알수없음)')
      const isInvalidPersonalRoom = room => room.roomType === 'PERSON' && room.settings.members.length < 2
      return filtered.filter(room => !isUnknownRoomName(room) && !isInvalidPersonalRoom(room))
    },
    isShow() {
      if (this.hitalkShare.currentTab === 'userList') {
        return this.classList.length > 0
      } else {
        return this.roomList.length > 0
      }
    },
    replaceContent() {
      return this.isSecretBoardPost ? '' : document.querySelector('#content-text').innerText
    },
    isOwnerOrManager() {
      if (this.shareBtnType !== 'schoolPost') {
        return this.classList[0]?.memberRole === 'OWNER' || this.classList[0]?.memberRole === 'MANAGER'
      } else {
        return true
      }
    },
    hasTeacherUser() {
      return this.checkableUsers.filter(u => u.userType === 'TEACHER').length > 0
    },
    hasParentsUser() {
      return this.checkableUsers.filter(u => u.userType === 'PARENTS').length > 0
    },
    hasStudentUser() {
      return this.checkableUsers.filter(u => u.userType === 'STUDENT').length > 0
    },
    posted() {
      return this.post.posted
    },
    isTeacher () {
      return this.user.userType === UserLevel.TEACHER
    },
    isSingleSelected() {
      return this.hitalkShare.selectedUserList.length === 1
    },
    isMultiSelected() {
      return this.hitalkShare.selectedUserList.length > 1
    },
    isSendingByUserList() {
      return this.hitalkShare.currentTab === 'userList'
    },
    isSendingByChatList() {
      return this.hitalkShare.currentTab === 'chatList'
    },
    isSecretBoardPost() {
      return this.postType === 'BOARD' && this.post.board.boardType === 'SECRET'
    },
    checkableUsers() {
      return this.classList.flatMap(c =>
          c.users.filter(u => {
            if (!(u.userType === 'TEACHER' && ['OWNER', 'MANAGER'].includes(u.memberRole))) return true
            return u.user.isUseChat && checkTeacherChatTime(u.user.isOverChat, u.user)
          })
      )
    }
  },

  methods: {
    ...mapMutations([
      'setHitalkShareContent',
      'setHitalkShareContents',
      'setHitalkShareCurrentTab',
      'setHitalkShareSelectedUserList',
      'clearHitalkShareSelectedUserList',
      'clearHitalkShareMessage',
      'clearHitalkShare',
      'appendHitalkShareSelectedUserList',
      'spliceHitalkShareSelectedUserList'
    ]),
    ...mapActions({
      openHitalkPopup: 'openHitalkPopup',
      initChatUncheckedMessage: 'initChatUncheckedMessage'
    }),
    ...mapActions('storeHitalk', [
      'callRoom',
      'sendStompShareMessage',
      'createRoom',
      'callChatUserList',
      'callChatRooms'
    ]),
    clickTab(tab) {
      if (tab === 'userList') {
        this.search({ searchType: 'NONE', searchValue: '' })
      }
      this.clearHitalkShareSelectedUserList()
      this.setHitalkShareCurrentTab(tab)
    },
    closeModal() {
      this.setHitalkShareCurrentTab('userList')
      this.$emit('controlHitalkShareModal', false)
    },
    async checkTypeBeforeSendPersonalMessage() {
      if(this.isShareClick === true) {
        return
      }
      this.isShareClick = true

      // 대화목록에서 선생님이 여럿 선택했는데 클래스가 같은 경우는 관련 팝업 표시
      if (this.isSendingByUserList && this.isTeacher && 
        this.isMultiSelected && this.isEqualsClassSubscribe
      ) {
        this.hitalkShareSelectIsOpen = true
      }
      else if (this.isSendingByChatList) {
        this.sendToChatList()
      } else if (this.isTeacher || this.isSingleSelected) {
        this.sendPersonalRoom()
      } else {
        try {
          await this.$hiClass.confirm(MSG_ALERT_SENDING_GROUP, 'warning')
          this.sendPersonalRoom()
        } catch(e) {
          console.log(e)
        }
      }
    },
    getExtension(fileName) {
      return fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase();
    },
    makeMessage() {
      let content
      const thumbnailExtension = ['jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp']
      const isFirstOrginalFileImage = Array.isArray(this.post.files) && this.post.files.length > 0 ? thumbnailExtension.includes(this.getExtension(this.post.files[0].fileOriginalPath)) : false
      const imageFileList = Array.isArray(this.post.files) && this.post.files.length > 0 ? this.post.files.filter(f => f.fileThumbnailPath || f.fileContentType.startsWith('image')) || [] : []
      const thumbnail = !this.isSecretBoardPost && Array.isArray(this.post.files) && this.post.files.length > 0
        ? (
            this.post.files[0].fileThumbnailPath || 
            (isFirstOrginalFileImage ? this.post.files[0].fileOriginalPath : (imageFileList.length > 0 ? imageFileList[0].fileThumbnailPath || imageFileList[0].fileOriginalPath : ''))
          )
        : ''

      let computedTitle = null
      switch (this.post.postType) {
        case this.CONSTANTS.POST_TYPE.NOTE: {
          const noteTitle = (this.schoolType && !['KINDERGARTEN', 'ELEMENTARY'].includes(this.schoolType)) ||
              this.curClassItem?.classSchoolType === 'GROUP' || this.post.parent?.classSchoolType === 'GROUP' ? '공지' : '알림장'
          const posted = this.posted
          computedTitle = this.post.postTitle
            ? this.post.postTitle || ''
            : this.$moment(posted).format(`M월 D일 (ddd) ${noteTitle}`)
          break
        }
        case this.CONSTANTS.POST_TYPE.MEAL: {
          const posted = this.post.postTitle
          computedTitle = this.$moment(posted).isValid()
            ? this.$moment(posted).format(`M월 D일 (ddd) 급식`)
            : this.post.postTitle || ''
          break
        }
        default: {
          computedTitle = this.post.postTitle || this.post.title || ''
        }
      }

      let contents = [];
      switch (this.postType) {
        // 클래스 게시물
        case this.CONSTANTS.POST_TYPE.BOARD:
        case this.CONSTANTS.POST_TYPE.NOTE:
        case this.CONSTANTS.POST_TYPE.ALBUM:
        case this.CONSTANTS.POST_TYPE.HOMEWORK:
          content = {
            shareType: this.postType,
            postId: this.post.currentId,
            classId: this.post.parentId || this.post.parent.currentId,
            title: computedTitle,
            content: this.replaceContent,
            thumbnail: thumbnail
          }
          if (this.postType === this.CONSTANTS.POST_TYPE.NOTE) {
            content.schoolType = this.post.parent?.classSchoolType || this.curClassItem?.classSchoolType || this.schoolType
          }
          break
        // 학교 게시물
        case this.CONSTANTS.POST_TYPE.NOTICE:
        case this.CONSTANTS.POST_TYPE.ALARM:
        case this.CONSTANTS.POST_TYPE.MEAL:
        case this.CONSTANTS.POST_TYPE.ALARM_EDU_OFFICE:
          content = {
            shareType: this.postType,
            postId: this.post.currentId,
            schoolId: this.post.parentId || this.post.parent.currentId,
            title: computedTitle,
            content: this.replaceContent,
            thumbnail: thumbnail
          }
          break
        // CP 게시물
        case this.CONSTANTS.POST_TYPE.CP_BOARD:
          content = {
            shareType: this.postType,
            postId: this.post.currentId,
            cpId: this.post.parent.currentId,
            title: computedTitle,
            content: this.replaceContent,
            thumbnail: thumbnail
          }
          break
        // 학교양식 - 제출한 신청서
        case 'CLASS_APPLY':
          content = {
            shareType: this.postType,
            sheetId: this.post.sheetId,
            classApplyId: this.post.currentId,
            classId: this.post.classId,
            sheetType: this.post.sheetType,
            applyType: this.post.applyType,
            title: computedTitle,
            content: '신청서를 확인해주세요!',
          }
          break
        // 학교양식 - 신청서
        case 'SHEET':
          content = {
            shareType: this.postType,
            sheetId: this.post.sheetId,
            classId: this.post.parentId,
            sheetType: this.post.sheetType,
            applyType: this.post.applyType,
            title: computedTitle,
            content: '신청서를 확인해주세요!',
          }
          break
          // 설문
        case 'SURVEY':
          content = {
            shareType: this.postType,
            surveyId: this.post.surveyId,
            classId: this.post.clazz.classId,
            surveyType: this.post.surveyType,
            title: this.post.surveyTitle,
            content: this.replaceContent
          }
          break
          //학급기록 -리포트 
        case 'CLASSROOM_REPORT':
          if(this.post.reports) {
            for(const r of this.post.reports) {
              const result = {
                shareType: 'CLASSROOM',
                classroomType: 'REPORT',
                reportId: r.reportId,
                classroomId: this.post.classroomId,
                title: r.reportName,
                content: r.studentName + ' 학생의 리포트를 확인해주세요!',
              };
              contents.push(result);
            }
          } else {
            content = {
              shareType: 'CLASSROOM',
              classroomType: 'REPORT',
              reportId: this.post.reportId,
              classroomId: this.post.classroomId,
              title: this.post.title,
              content: this.post.content, 
            }
          }
          break
      }
      if(contents.length > 0) {
        this.setHitalkShareContents(contents)
      } else {
        this.setHitalkShareContent(content)
      }
    },
    async sendPersonalRoom() {
      if(!(await this.validateConstraintsOfSendingTargets())) return;
      this.makeMessage()

      let error = false
      let success = true
      await Promise.all(this.classIdGroup.map(async sendGroup => {
        try {
          const res = await this.callRoom({
            sender: localStorage.uuid,
            classId: sendGroup.classId,
            receiver: sendGroup.receiverArr
          })

          this.receiverList = res.data.receivers || res.data._embedded.targets
          success = await this.send('personal')
        } catch (e) {
          this.$log.debug("callRoom error => ", e);
          error = true
        }
      }))

      this.sendComplete(error || !success)
    },
    async sendToChatList() {
      if(!(await this.validateConstraintsOfSendingTargets())) return;
      if(!this.validateLimitedGroupRoom()) return;
      this.makeMessage()
      await this.send('room')
      this.sendComplete()
    },
    async sendGroupRoom() {
      if(!(await this.validateConstraintsOfSendingTargets())) return;
      this.makeMessage()

      const classId = this.classIdGroup[this.classIdGroup.length - 1].classId
      const content = this.classIdGroup.map(g => g.receiverArr.join(',')).join(',')

      try {
        const res = await this.createRoom({
          roomType: "GROUP",
          memberType: "CUSTOM",
          classId,
          content,
          roomName: getDefaultGroupRoomName(this.classJSONList[classId].class, 'NOTICE')
        })

        this.roomId = res.data.room
        await this.send('group')

        this.sendComplete()

      } catch (e) {
        this.$log.debug("callRoom error => ", err)
      }
    },

    async send(sendType) {
      let payload = {}
      let success = true
      
      const contents = this.hitalkShare.contents;
      const hasContents = Array.isArray(contents) && contents.length > 0;

      if(hasContents) {
        //empty
      } else {
        payload.content = this.hitalkShare.content
        if (this.isSecretBoardPost) {
          payload.content.content = ''
        }
      }
      const message = this.hitalkShare.message.trim()
      if (message) {
        payload.message = message
      }

      const sendTo = async (roomId, includePayload, item = null) => {
        try {
          let newPayload = {};

          if(includePayload === true) {
            newPayload = {
              ...payload,
              content: item ? item : payload.content
            };
          } else {
            newPayload = {
              content: item ? item : payload.content
            };
          }
       
          newPayload.roomId = roomId
          await this.sendStompShareMessage(newPayload)
        } catch (e) {
          success = false
          console.error(e);
        }
      }

      if (sendType === 'personal') {
        for await (let receiver of this.receiverList) {
          if (hasContents) {
            if(message) {
              await this.sendStompShareMessage({
                roomId: receiver.roomId,
                message: message
              });
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            for (const c of contents) {
              await sendTo(receiver.roomId, false, c);   // 🔥 콘텐츠별로 여러번 전송
            }
          } else {
            await sendTo(receiver.roomId, true);
          }
        }
      } else if (sendType === 'room') {
        for await (let room of this.hitalkShare.selectedUserList) {
          if (hasContents) {
            if(message) {
              await this.sendStompShareMessage({
                roomId: room,
                message: message
              });
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            for (const c of contents) {
              await sendTo(room, false, c);   // 🔥 콘텐츠별로 여러번 전송
            }
          } else {
            await sendTo(room, true);
          }
        }
      } else {
        if (hasContents) {
            if(message) {
              await this.sendStompShareMessage({
                roomId: this.roomId,
                message: message
              });
              await new Promise(resolve => setTimeout(resolve, 300));
            }
            for (const c of contents) {
              await sendTo(this.roomId, false, c);   // 🔥 콘텐츠별로 여러번 전송
            }
          } else {
            await sendTo(this.roomId, true);
          }
      }

      return success
    },

    sendComplete(error) {
      const msg = error ? '일부 메시지 전송이 실패하였습니다.<br>대화목록에서 확인해주세요.'
        : "전송이 완료되었습니다. <br>전송한 메시지는 대화목록에서 확인 가능합니다."
      this.$hiClass.alert(msg)
        .then(() => {
          this.clearHitalkShareSelectedUserList()
          this.clearHitalkShareMessage()
          this.closeModal()

          if(this.isShareClick === true) {
            this.isShareClick = false
          }
          
          localStorage.setItem('hitalkShareSend', true)
          if (!this.hitalkShareSelectIsOpen) {
            // this.openHitalkPopup(null) //openPopup으로 전환
            // this.initChatUncheckedMessage()
            openPopup(CONSTANTS.POPUP.HI_TALK)
          }
        })
    },

    closeSelectModal(flag) {
      this.hitalkShareSelectIsOpen = flag
      this.isShareClick = false
    },
    isDisabled(user) {
      if(user.userType === 'TEACHER' && ['OWNER', 'MANAGER'].includes(user.memberRole)) {
        return !user.user.isUseChat || !checkTeacherChatTime(user.user.isOverChat, user.user)
      } else {
        return false
      }
    },
    async validateConstraintsOfSendingTargets () {
      await this.callChatUserList()
      await this.callChatRooms()
      const findClassUserBy = (item, index) => {
        const {classId, content} = typeof item === 'string'
          ? (this.roomList.filter(r => ['PERSON', 'GROUP'].includes(r.roomType) && r.room === item)
                      .map(r => (r.roomType === 'GROUP' ? []
                            : {classId: r.classId, content: (r.settings.members || []).map(m => m.user.currentId).filter(m => m !== localStorage.uuid)[0]}))[0] || {})
          : item
        return {index, ...(this.classJSONList[classId] || {users: []}).users.find(u => u.userId === content)}
      };

      const unmatchedTargets = this.hitalkShare.selectedUserList.map(findClassUserBy)
        .filter(u => u.userType === 'TEACHER' &&
        (!u.user.isUseChat || !checkTeacherChatTime(u.user.isOverChat, u.user)))
      if (unmatchedTargets.length === 0) return true;
      const targetIdxes = this.hitalkShare.selectedUserList.map(findClassUserBy)
        .filter(t => 0 === unmatchedTargets.filter(u => u.userId === t.userId && u.clazz.classId === t.clazz.classId).length)
        .map(t => t.index);
      this.setHitalkShareSelectedUserList(this.hitalkShare.selectedUserList.filter((_, i) => targetIdxes.includes(i)));
      if (targetIdxes.length > 0) return true
      const firstUnmatched = unmatchedTargets[0].user
      const errorMessage = !firstUnmatched.isUseChat
        ? '선생님이 하이톡을 사용하지 않습니다.'
        : `선생님의 상담 가능 시간에만 메시지를 보낼 수 있습니다.<br>시간을 다시 확인해주세요.<br>
              <div style="width: 100%;margin-top: 15px;padding: 10px 30px 10px;background: var(--web-background-blue-01, #F8F9FC);border-radius: 8px;color: #4778DE;">
                <img src="${require('@/assets/img/icon/ic_clock.svg')}"> 하이톡 가능시간 : ${formatChatTime(firstUnmatched)}
              <div>`
      this.$hiClass.alert(errorMessage);
      (this.$refs.hitalkShareUserList || {syncDisabled: () => {}}).syncDisabled();
      (this.$refs.hitalkShareChatList || {syncDisabled: () => {}}).syncDisabled();
      this.isShareClick = false
      return false
    },
    validateLimitedGroupRoom() {
      this.filterLimitedGroupRoomFromSelected()
      if (this.hitalkShare.selectedUserList.length === 0) {
        this.$hiClass.alert("채팅방 기간이 종료되었습니다.", 'warning');
        return false
      }
      return true;
    },
    async getTags() {
      if (this.curClassId) {
        const res = await this.$axios.get(`/clazzes/${this.curClassId}/tags`)
        if (res.data._embedded && res.data._embedded.clazzTags.length > 0) {
          this.clazzTags = res.data._embedded.clazzTags
        }
      } else {
        const allMemberTags = []
        for (let classItem of Object.values(this.classJSONList)) {
          allMemberTags.push(...classItem.users.flatMap(u => (u.tags || [])))
        }

        allMemberTags.forEach(newTag => {
          if (this.clazzTags.map(tag => tag.tagName).includes(newTag.tagName)) {
            const duplicateTag = this.clazzTags.find(tag => tag.tagName === newTag.tagName)
            if (duplicateTag && !duplicateTag.tagIds.includes(newTag.tagId)) {
              duplicateTag.tagIds.push(newTag.tagId)
            }
          } else {
            this.clazzTags.push({...newTag, tagIds: [newTag.tagId]})
          }
        })
      }
    },
    search({ searchType, searchValue }) {
      if (!this.curClassId) {
        if (searchType === 'TAG') {
          searchValue = this.clazzTags.find(tag => tag.tagId === searchValue).tagIds || []
        }
        if (searchType === 'TAG_MULTI') {
          searchValue = this.clazzTags.filter(tag => searchValue.includes(tag.tagId)).flatMap(tag => tag.tagIds) || []
        }
      }
      this.memberSearchItem = { searchType, searchValue }
    },
    filterLimitedGroupRoomFromSelected() {
      if (this.hitalkShare.selectedUserList.length === 0) return;
      const selectedExpiredRooms = this.roomList.filter(r =>
        this.hitalkShare.selectedUserList.includes(r.room) && isExpiredRoom(r)).map(r => r.room);
      if (selectedExpiredRooms.length === 0) return;
      this.setHitalkShareSelectedUserList(this.hitalkShare.selectedUserList.filter(u => !selectedExpiredRooms.includes(u)));
      (this.$refs.hitalkShareUserList || {syncDisabled: () => {}}).syncDisabled();
      (this.$refs.hitalkShareChatList || {syncDisabled: () => {}}).syncDisabled();
    },
    getUsersByType(type) {
      return this.checkableUsers.filter(u => {
        if (type === 'ALL') return true
        if (['PARENTS', 'STUDENT'].includes(type)) return u.userType === type
        return ['OWNER', 'MANAGER'].includes(u.memberRole)
      })
    },
    getIsCheckedAll(type) {
      return this.getUsersByType(type).length > 0 &&
          this.getUsersByType(type)
              .map(u => ({ content: u.userId, classId: u.clazz.classId }))
              .every(u => this.hitalkShare.selectedUserList.some(s => s.content === u.content && s.classId === u.classId))
    },
    changeCheckbox(event, type) {
      const usersByType = this.getUsersByType(type).map(u => ({ roomType: 'PERSON', classId: u.clazz.classId, content: u.userId }))

      usersByType.forEach(u => {
        const idx = this.hitalkShare.selectedUserList.findIndex(s => s.content === u.content && s.classId === u.classId)
        if (event.target.checked) {
          if (idx === -1) this.appendHitalkShareSelectedUserList(u)
        } else {
          if (idx > -1) this.spliceHitalkShareSelectedUserList(idx)
        }
      })
    }
  },
  beforeUpdate() {
    this.filterLimitedGroupRoomFromSelected()
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
    if (this.isOwnerOrManager) {
      this.getTags()
    }
  },
  destroyed() {
    this.clearHitalkShare()
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style lang="scss" scoped>
.member-search{
  border:0;
  border-bottom:1px solid #e0e0e0;  
}
</style>