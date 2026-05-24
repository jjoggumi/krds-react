<!--
@File(Method): MainHeaderNotiboxItem.vue
@Date Created:
@Description: 알림함 > 알림
@Modified: #72513 가입 요청 수락 팝업 > 태그 입력 생성 및 자동 완성 추가
-->
<template>
  <fragment>
    <li
        class="type-etc"
        :class="{
      read: item.isRead
    }"
    >
      <!-- 오른쪽에 버튼이나 이미지가 들어가면 type-etc 추가 -->
      <a href="javascript:void(0)" @click="onClickNotiMessage()">
        <div class="profile-thumb" :style="imagePathStyleObj"></div>
        <div
            :class="{
          'text-cont': isClassApplyNoti,
          'text-cont-full': !isClassApplyNoti
        }"
        >
          <!-- item.title 추가 -->
          <!-- <p class="cate" v-html="$stringUtil.replaceNewLine(item.title)"></p> -->
          <p class="cate" :inner-html.prop="title"></p>
          <!-- 알림장의 푸시 알림일 경우 200byte 제한 -->
          <template v-if="isPostNote">
            <p
                :inner-html.prop="
              $stringUtil.replaceNewLine([...item.content].slice(0,120).join(''))
            "
            ></p>
          </template>
          <template v-else>
            <!-- <p v-html="$stringUtil.replaceNewLine(item.content)"></p> -->
            <p :inner-html.prop="content"></p>
          </template>
          <!-- prettier-ignore -->
          <span class="date">{{ $moment(item.timestamp).format('M월 D일 H시 m분') }}</span>
        </div>
      </a>
      <div class="etc-cont" v-if="isClassApplyNoti">
        <button class="btn-bg-cg" @click="doClassSubscribe('DENIAL')">
          거부
        </button>
        <button class="btn-bg-c" @click="openApprovalModal">
          수락
        </button>
      </div>
    </li>

    <portal to="member-approval">
      <member-approval-modal
        v-if="isOpenMemberApproval"
        :memberId="approvalItem.memberId"
        :classId="approvalItem.classId"
        @updateMemberStatus="updateMemberStatus"
        @closeMemberApprovalModal="closeApprovalModal"
      />
    </portal>
  </fragment>
</template>

<script>
import { eventBus } from '@/main'
import {mapGetters, mapState, mapActions, mapMutations} from "vuex";
import {URLProps} from "@/enums";
import MemberApprovalModal from "@/apps/main/clazzes/member/modal/MemberApproval";

export default {
  name: 'MainHeaderNotiboxItem',
  props: {
    user: Object,
    item: Object
  },
  components: {MemberApprovalModal},
  data() {
    return {
      schoolSubscribesData: {},
      option: {
        loading: {
          applyParent: false,
          acceptParent: false,
          applyStudent: false,
          acceptStudent: false
        }
      },
      isClassTeacher: false,
      isClickDoClassSubscribe: false,
      isOpenMemberApproval: false,
      approvalItem: {
        memberId: '',
        classId: ''
      }
    }
  },
  computed: {
    ...mapState({
      clazzSubscribeViews: 'clazzSubscribeViews'
    }),
    isClassApplyNoti() {
      let isSubscribeCode = false
      if (this.item.messageCode === 'classApply' && this.isClassTeacher) {
        isSubscribeCode = this.item.memberId
      }
      return isSubscribeCode
    },
    isPostNote() {
      return this.item.messageCode === 'postNote' || this.item.messageCode === 'postNoteModified'
    },
    imagePathStyleObj() {
      // return `background-image:url('${this.item.thumbnail}');`
      return `background-image:url('${this.item.thumbnail ? this.item.thumbnail : URLProps.DEFAULT_PROFILE_IMAGE_URL}');`
    },
    title() {
      const title = this.item.title.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      return this.$stringUtil.replaceNewLine(title)
    },
    content() {
      const content = this.item.content.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      return this.$stringUtil.replaceNewLine(content)
    }
  },
  methods: {
    ...mapState({
      permissionDeniedToasted: 'permissionDeniedToasted'
    }),
    ...mapActions('storeClazzes',{
      callAttendanceById: 'callAttendanceById'
    }),
    ...mapActions('storeHome', [
      'openJoinWithInviteCodeParents',
      'openJoinWithInviteCodeStudent'
    ]),
    ...mapMutations('storeClazzes',{
      setAttendanceModal: 'setAttendanceModal'
    }),
    ...mapMutations('storeHome', [
      'setJoinWithInviteCodeData'
    ]),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    openAttendanceDetalModal: function(id, classId) {
      this.setAttendanceModal(
        {
          id,
          classId,
          isShowRegisterModal: false, 
          isShowDetailModal: true, 
          isConfirmdMode: false, clazzMemberRole: this.isClassTeacher ? 'MANAGER' : 'MEMBER'
        }
      )

      const obj = {
        attendance: true
      }
      this.$emit("setIsShow", obj)
    },
    async onClickNotiMessage() {
      let breakFlag = false
      const openDetailPostLayers = this.$store.state.notiMessageCode
        .openDetailPostLayers
      const openAlarmPlusDetailPopups = this.$store.state.notiMessageCode
        .openAlarmPlusDetailPopups
      const openAlarmPlusInviteCardPopups = this.$store.state.notiMessageCode
        .openAlarmPlusInviteCardPopups
      const routeMains = this.$store.state.notiMessageCode.routeMains
      const routeClassMains = this.$store.state.notiMessageCode.routeClassMains
      const routeClassMembers = this.$store.state.notiMessageCode
        .routeClassMembers
      const routeClassMemberTabs = this.$store.state.notiMessageCode
        .routeClassMemberTabs
      const routeClassHomeworks = this.$store.state.notiMessageCode
        .routeClassHomeworks
      const routeClassCalendars = this.$store.state.notiMessageCode
        .routeClassCalendars
      const routeClassApplies = this.$store.state.notiMessageCode
          .routeClassApplies
      const routeClassFormApplyListTab = this.$store.state.notiMessageCode
        .routeClassFormApplyListTab
      const routeInviteClassMains = this.$store.state.notiMessageCode
        .routeInviteClassMains
      const routeInviteSchoolMains = this.$store.state.notiMessageCode
        .routeInviteSchoolMains
      const routeInviteSchoolAlarms = this.$store.state.notiMessageCode
        .routeInviteSchoolAlarms
      const routeChatMains = this.$store.state.notiMessageCode.routeChatMains
      const routeHelpChatMains = this.$store.state.notiMessageCode
        .routeHelpChatMains
      const routeAlarmPlusTeacherTab = this.$store.state.notiMessageCode.routeAlarmPlusTeacherTab
      const routeSurveyTab = this.$store.state.notiMessageCode.routeSurveyTab
      const routeAttendance = this.$store.state.notiMessageCode.routeAttendance
      const routeAttendanceUnChecked = this.$store.state.notiMessageCode.routeAttendanceUnChecked
      const routerTimetableLessonChange = this.$store.state.notiMessageCode.routerTimetableLessonChange

      if(routerTimetableLessonChange.includes(this.item.messageCode)) {
        this.doRead();

        const path = `/main/alarmplus/schools/${this.item.schoolId}/my-timetable`
        this.$router.push({ path: path, query: { initTab: 'ChangeHistoryManagement', timetableId: this.item.postId } }, () => {
          const message = { routePath: path }
          eventBus.$emit('send-message-to-alarm-plus', message)
          this.$emit('hideAlarm')
        });

      }

      // route class attendanceUnChecked
      if(routeAttendanceUnChecked.includes(this.item.messageCode)) {
        this.doRead()
        localStorage.setItem('attendanceUnCheckedAlarmMove', JSON.stringify(true))
        // this.$router.push(`/main/clazzes/${this.item.clazzId}/attendance`)

        window.location.href = `/main/clazzes/${this.item.clazzId}/attendance`
      }

      // route class attendance
      if(routeAttendance.includes(this.item.messageCode)) {
        this.doRead()
        
        this.$hiClass.toggleBodyClass('add', 'hidden')
        const attendance = await this.callAttendanceById(this.item.contentId)
        if(attendance.status === 428) {
          this.$hiClass.alert('삭제된 내역입니다.')
          return;
        } else if(attendance.status === 417) {
          this.$hiClass.alert('출결 알리기 기능을 사용하지 않는 클래스입니다.')
          return;
        }
        this.openAttendanceDetalModal(this.item.contentId, this.item.clazzId)
        // const routeObj = {
        //   path: `/main/clazzes/${this.item.clazzId}/attendance`,
        //   query: {
        //     attendanceId: this.item.contentId,
        //     messageCode: this.item.messageCode
        //   }
        // }
        // this.$router.push(routeObj)
      }
      // route class survey tab

      for (const code of routeSurveyTab) {
        if (breakFlag) break
        if (code === this.item.messageCode) {
          breakFlag = true

          this.doRead()

          const routeObj = {}
          if (code === 'surveyAfterSchoolCanceled') {
            routeObj.path = `/main/clazzes/${this.item.clazzId}/survey`
          } else {
            routeObj.path = `/survey-response/${this.item.surveyId}`
            routeObj.query = {isDel : this.item.survey.isDel, isAlarmPush: true}
          }

          this.$router.push(routeObj, () => {})
        }
      }

      // post detail layer popup
      for (const code of openDetailPostLayers) {
        if (breakFlag) break
        if (code === this.item.messageCode) {
          breakFlag = true
          this.doRead()
          if (this.item.post.del) this.$hiClass.alert('삭제된 게시물입니다.')
          else this.openDetailPostLayer()
        }
      }

      // alarmPlus post detail layer popup
      for (const code of openAlarmPlusDetailPopups) {
        if (breakFlag) break
        if (code === this.item.messageCode) {
          breakFlag = true
          this.doRead()
          if (this.item.post.del) this.$hiClass.alert('삭제된 게시물입니다.')
          else this.openAlarmPlusDetailPopup()
        }
      }

      // alarmPlus invite layer popup
      for (const code of openAlarmPlusInviteCardPopups) {
        if (breakFlag) break
        if (code === this.item.messageCode) {
          breakFlag = true
          this.doRead()
        }
      }

      // routeMains
      if (!breakFlag) {
        for (const code of routeMains) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.goRoute('/main')
          }
        }
      }

      // routeClassMains
      if (!breakFlag) {
        for (const code of routeClassMains) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.goRoute('/main/clazzes/' + this.item.clazzId)
          }
        }
      }
      // routeClassMembers
      if (!breakFlag) {
        for (const code of routeClassMembers) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            await this.goClassMembers()
          }
        }
      }
      // routeClassMemberTabs
      if (!breakFlag) {
        for (const code of routeClassMemberTabs) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            await this.goClassMembers()
          }
        }
      }
      // routeClassHomeworks
      if (!breakFlag) {
        for (const code of routeClassHomeworks) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.goRoute('/main/clazzes/' + this.item.postId + '/homework')
          }
        }
      }
      // routeClassCalendars
      if (!breakFlag) {
        for (const code of routeClassCalendars) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true

            if (this.item.post) {
              this.$hiClass.posts
                .read(`/posts/${this.item.postId}`)
                .then(r => {
                  this.$log.debug(this.$options.name, ' routeClassCalendars result : ', r)
                  const query = {
                    calendarClassPosted: r.data.posted
                  }
                  let path = '/main/clazzes/' + this.item.clazzId
                  this.goRoute(path, query)
                })
                .catch(e => {
                  this.$log.debug(this.$options.name, ' routeClassCalendars error : ', e)
                  this.goRoute('/main/clazzes/' + this.item.clazzId)
                })
            } else {
              this.goRoute('/main/clazzes/' + this.item.clazzId)
            }
          }
        }
      }

      // routeClassApplies
      if (!breakFlag) {
        for (const code of routeClassApplies) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.goRoute('/main/clazzes/' + this.item.clazzId + '/form')
          }
        }
      }

      // routeClassFormApplyListTab
      if (!breakFlag) {
        for (const code of routeClassFormApplyListTab) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.goRoute('/main/clazzes/' + this.item.clazzId + '/form' + '/applyList')
          }
        }
      }

      // routeInviteClassMains
      if (!breakFlag) {
        for (const code of routeInviteClassMains) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.checkInviteCards(this.item.clazzId)
            this.doRead()
          }
        }
      }

      // routeInviteSchoolMains
      if (!breakFlag) {
        for (const code of routeInviteSchoolMains) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.doRead()
            this.goRoute('/main/schools/' + this.item.schoolId)
          }
        }
      }

      // routeInviteSchoolAlarms
      if (!breakFlag) {
        for (const code of routeInviteSchoolAlarms) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.doRead()
            this.goRoute('/main/schools/' + this.item.schoolId + '/alarm')
          }
        }
      }

      // routeChatMains
      if (!breakFlag) {
        for (const code of routeChatMains) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.goRoute('/main/chat')
          }
        }
      }
      // routeHelpChatMains
      if (!breakFlag) {
        for (const code of routeHelpChatMains) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            this.goRoute('/help/question')
          }
        }
      }
      // routeAlarmPlusTeacherTab
      if (!breakFlag) {
        for (const code of routeAlarmPlusTeacherTab) {
          if (breakFlag) break
          if (code === this.item.messageCode) {
            breakFlag = true
            const routePath = '/teacher/list'

            if (this.$route.path.includes('/main/alarmplus')) {
              const message = { routePath }
              eventBus.$emit('send-message-to-alarm-plus', message)
              this.$emit('hideAlarm')
            } else {
              this.goRoute('/main/alarmplus',{ routePath })
            }
          }
        }
      }
    },
    ////////////////////
    // onClick Noti Item
    ////////////////////
    async openDetailPostLayer() {
      console.log("openDetailPostLayer => ")
      if (this.item.post && this.item.postId) {
        // 해당 알림에 연결된 게시물의 읽기 권한 체크
        // 클래스 : 구독 여부, 클래스 활성 여부
        const clazz = this.getClazzByClazzId(this.item.clazzId)
        if (clazz && this.item.clazzId && !this.isJoinedClazzes(this.item)) {
          this.$hiClass.alert('미구독 클래스입니다.')
          return false
        }

        if (this.item.clazzId) { // classId 있을때
          try {
            const count = await this.getClassSubscribeViewsCount(this.item.clazzId)
            if (count < 1) { // 구독안함
              this.$hiClass.alert('미구독 클래스입니다.')
              return false
            } else { // 구독함. 게시글 상세 조회
              const res = await this.$hiClass.posts.read(`/posts/${this.item.postId}`)
              
              if(this.item.messageCode === "postHomeworkUserComment" && res.data.board.postType !== "HOMEWORK") {
                this.$hiClass.alert('접근 권한이 없습니다.')
                return
              }

              this.showDetailPostLayer(res.data)
            }
          } catch (e) {
            this.$hiClass.alert('접근권한이 없는 게시글입니다.')
            this.$log.error(e)
          }

        } else { // classId 없을때
          const postRes = await this.$hiClass.posts.read(`/posts/${this.item.postId}`)
          const classPost = ['NOTE','ALBUM','BOARD','HOMEWORK']

          if (classPost.includes(postRes.data.postType)) { // 클래스 게시글일때
            const count = await this.getClassSubscribeViewsCount(postRes.data.parent.currentId)
            if (count < 1) { // 구독안함
              this.$hiClass.alert('미구독 클래스입니다.')
              return false
            } else {  // 구독함. 게시글 상세 핍업 open
              this.showDetailPostLayer(postRes.data)
            }
          } else { // 클래스 게시글 아닐때
            this.showDetailPostLayer(postRes.data)
          }
       }
      }
    },
    async getClassSubscribeViewsCount(classId) {
      const res = await this.$hiClass.clazzSubscribeViews
          .search({
            userId: this.user.currentId,
            classId: classId,
            memberStatus: 'ACCEPT',
            size: 1
          })
      return res.data._embedded.clazzSubscribeViews.length
    },
    showDetailPostLayer(item) {
      const obj = {
        item: item,
        val: true
      }
      this.$emit('setIsShow', obj)
      this.$store.state.permissionDeniedToasted = false
    },
    openAlarmPlusDetailPopup() {
      if (this.item.post && this.item.postId) {
        this.$hiClass.posts
          .read(`/posts/${this.item.postId}`)
          .then(res => {
            const post = res.data

            if (post.alarmPlusId === undefined || post.alarmPlusId === null) {
              alert('열람 권한이 없거나 유효하지 않은 게시물입니다.')
            } else {
              const alarmPlusDetail = {
                eLetterId: post.alarmPlusId,
                userId: this.$store.state.user.currentId,
                post: post
              }
              this.$store.commit('setAlarmPlusDetail', alarmPlusDetail)
            }
          })
          .catch(err => {
            this.$log.debug(this.$options.name + ' openAlarmPlusDetailPopup() err : ', err)
          })
      }
    },

    goRoute(path, query) {
      let routeObj = { path: path }
      let isSamePath = false
      if (query !== undefined) routeObj.query = query
      if (path === this.$route.path) isSamePath = true

      this.doRead()

      if (isSamePath && query === undefined) {
        // TODO: TEST always replace
        // routeObj.path += '#' + this.$moment().valueOf()
        this.$router.replace(routeObj, () => { this.$emit('hideAlarm') })
      } else if (isSamePath && query !== undefined) {
        this.$router.push(routeObj, () => { this.$emit('hideAlarm') })
      } else {
        this.$router.push(routeObj, () => { this.$emit('hideAlarm') })
      }
    },

    /////////////
    // 구독 / 거절
    /////////////

    async openApprovalModal() {
      this.approvalItem.memberId = this.item.memberId
      this.approvalItem.classId = this.item.clazzId
      this.isOpenMemberApproval = true
      this.$emit('setIsOpenMemberApproval', true)
    },
    closeApprovalModal() {
      this.approvalItem.memberId = ''
      this.approvalItem.classId = ''
      this.isOpenMemberApproval = false
      this.$nextTick(() => {
        this.$emit('setIsOpenMemberApproval', false)
      })
    },

    updateMemberStatus({memberStatus, member}) {
      this.doClassSubscribe(memberStatus, member)
    },
    doClassSubscribe(act, member) {
      if (act === 'ACCEPT' || act === 'DENIAL') {
        if(!this.isClickDoClassSubscribe) {
          this.isClickDoClassSubscribe = true
          this.doUpdateJoinClazzReq(act, member)
        }
      }
    },
    async doUpdateJoinClazzReq(action, member = {}) {
      const data = {
        memberStatus: action,
        isApplyCheck: true,
      }

      data.memberClassNumber = member.studentNo
      data.memberChildName = member.studentName
      if (member.tags) {
        data.tagIds = member.tags.map(tag => tag.tagId)
      }

      try {
        const res = await this.$axios({
          method: 'PATCH',
          url: `/clazzSubscribes/${this.item.memberId}`,
          data: data
        })

        if(res) {
          try {
            const info = res.data
            // 학교 구독여부 체크 후 미구독 시 학교 구독
            const schoolId = info.clazz.school.currentId
            const userId = info.user.currentId
            const joinType = 'CLASS'

            this.$hiClass.isDuplSubscribeSchoolAndSchoolSubscribe(
              this,
              schoolId,
              userId,
              joinType
            )
          } catch (error) {
            this.$log.debug(`isDuplSubscribeSchoolAndSchoolSubscribe => ${error}`)
          }
        }

        this.doRead()
        this.item.memberId = null
        this.item.content = `${this.item.content}\n(${this.$moment().format('YYYY-MM-DD HH: mm')} ${action === 'ACCEPT' ? '수락' : '거부'}함)`
      } catch (e) {
        if (e.response.status === 404 || e.response.status === 412) {
          this.$hiClass.alert('이미 처리된 요청입니다.').then(() => {
            this.readNoti(this.item.notiId)
          })
          return false
        } else if (e.response.status === 418) {
          this.$hiClass.alert('미구독 클래스입니다.')
          return false
        }
        this.$log.debug(this.$options.name, ' doUpdateClazzSubscribe() error => ', e)
      } finally {
        this.isClickDoClassSubscribe = false
      }
    },
    async readNoti(notiId) {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/notificationBoxes/${notiId}`
        })

        for (let [key, value] of Object.entries(res.data)) {
          this.item[key] = value
        }
      } catch (e) {
        this.$log.debug(this.$options.name, ' readNoti() error => ', e)
      }
    },
    // 읽음 처리
    doRead() {
      if (!this.item.notiId) return false

      if (!this.item.isRead) {
        this.$axios({
          method: 'PATCH',
          url: `/notificationBoxes/read/${this.item.notiId}`
        })
          .then(result => {
            this.item.isRead = true
            this.$log.debug(this.$options.name + ' updateNotificationBoxes() result : ', result)
          })
          .catch(error => {
            this.$log.debug(this.$options.name + ' updateNotificationBoxes() result : ', error)
          })
      }
    },
    checkInviteCards(classId) {
      if (classId !== undefined) {
        this.$hiClass.clazzes.read(`/clazzes/${classId}`)
          .then(result => {
            const clazz = result.data
            let isJoined = false

            if (clazz.classStatus === 'ACTIVATE') {
              let acceptClazzSubscribeViews = this.clazzSubscribeViews.filter(
                d => {
                  return d.memberStatus === 'ACCEPT'
                }
              )

              acceptClazzSubscribeViews = acceptClazzSubscribeViews.filter(d => {
                return d.classId === clazz.currentId
              })

              if (acceptClazzSubscribeViews.length > 0) isJoined = true

              if (!isJoined) {
                this.setJoinWithInviteCodeData({
                  invitedClassObj: clazz,
                  invitedSchoolUri: `${process.env.VUE_APP_BASE_API_URI}/schools/${clazz.school.currentId}`
                })
                this.user.userType === 'STUDENT' ?
                    this.openJoinWithInviteCodeStudent() :
                    this.openJoinWithInviteCodeParents()
              } else {
                this.$hiClass.alert('이미 가입된 클래스입니다.')
                return false
              }
            } else {
              this.$hiClass.alert('운영중인 클래스가 아닙니다.')
              return false
            }
          })
          .catch(err => {
            this.$log.warn('checkInviteCards() err: ', err)
          })

      }
    },
    isJoinedClazzes(item) {
      let joinedClass = this.clazzSubscribeViews.filter(
          d => d.classId === item.clazzId
      )
      return joinedClass.length > 0
    },
    getClazzByClazzId(clazzId) {
      return this.clazzSubscribeViews.find(clazz => clazz.classId === clazzId)
    },
    async getUser(writeUserId) {
      if (!this.item.writeUserId) return null
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/users/${writeUserId}`
        })
        return res.data
      } catch (e) {
        this.$log.error(e)
      }
    },
    async goClassMembers() {
      const user = await this.getUser(this.item.writeUserId)
      if (user) {
        let classUserType = user.userType
        if (user.userType === 'TEACHER')
          classUserType = 'PARENTS'

        const query = {
          classUserType: classUserType,
          index: (Math.random() * 10)
        }
        this.goRoute(`/main/clazzes/${this.item.clazzId}/member`, query)
      } else {
        this.goRoute(`/main/clazzes/${this.item.clazzId}/member`)
      }
    }
  },
  async created() {
    if (
      (this.item.messageCode === 'classApply' && this.item.memberId) ||
      this.$store.state.notiMessageCode.routeAttendance.includes(this.item.messageCode)  
    ) {
      const res = await this.$hiClass.clazzSubscribes
          .search({
            _user: `${process.env.VUE_APP_BASE_API_URI}/user/${this.item.userId}`,
            _clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.item.clazzId}`,
            _memberRole: ['OWNER', 'MANAGER']
          })
      this.isClassTeacher = res.data._embedded.clazzSubscribes.length > 0
    }
  },
  mounted() {
    // console.log("mounted => ", this.item)
  },
  destroyed() {}
}
</script>

<style scoped></style>
