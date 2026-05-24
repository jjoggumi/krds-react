<!--
@File(Method): MainBodyClazzesBodyAttendance.vue
@Description: 출결 알리기 메인 화면
@Modified: 2025-10-24 주석 추가  
-->
<template>
  <div>
    <div class="page-sub-heading attendance-heading">
      <div class="top">
          <h3 class="heading">출결 알리기</h3>
          <span class="more" v-if="isTeacher"><a href="https://hiclass.notion.site/9f0da92275f14bd98f2737d99dbd490b" target="_blank">출결 알리기 가이드</a></span>
      </div>
      <div class="info" v-if="isTeacher">
          결석, 조퇴 등 출결을 간단히 알리고 확인합니다. 사용하지 않으려면 <span class="underline" @click="onClickClassManagement">수업관리설정</span>에서 OFF하세요.
      </div>
    </div>

<!--    <attendance-guide-box-->
<!--        v-if="guide.INFO.trim() !== ''"-->
<!--        :clazzMemberRole="clazzMemberRole"-->
<!--        :guide="guide"-->
<!--    />-->

    <div class="attendance-btn-group">
      <button
          v-if="clazzMemberRole !== 'MEMBER'"
          class="hi-btn btn-lg btn-line"
          @click="openNeisModal"
      >
        나이스 출석부 보기
      </button>
      <button
          class="hi-btn btn-lg"
          @click="openAttendanceRegisterModal"
      >
        {{ clazzMemberRole === 'MEMBER' ? '출결 알리기' : '출결 등록하기' }}
      </button>
    </div>

    <div
        v-if="clazzMemberRole !== 'MEMBER'"
        class="attendance__filter"
    >
      <div class="hi-tab tab-xl">
        <button
            @click="setCurTab('attendanceList')"
            :class="{'is-active': curTab === 'attendanceList'}"
            title="작성한 학부모 본인과 선생님만 보실 수 있습니다."
        >
          제출내역
        </button>
        <button
            @click="setCurTab('stats')"
            :class="{'is-active': curTab === 'stats'}"
        >
          학생별 통계
        </button>
        <button
            @click="setCurTab('studentList')"
            :class="{'is-active': curTab === 'studentList'}"
        >
          학생명단
          <hi-tooltip v-if="curTab === 'studentList'" ico="none" isActive position="top" ani="fade" class="hi-tooltip-wrap" :title-html="`학생 추가 후에 이용할 수 있어요.`" />
        </button>
        <button
            @click="setCurTab('guide')"
            :class="{'is-active': curTab === 'guide'}"
        >
          제출양식 설정
        </button>
        <button
            @click="showAttendanceModal"
        >
          출석 완료 알리기
        </button>
      </div>
    </div>

    <attendance-list
        v-if="curTab === 'attendanceList'"
        ref="attendanceList"
        :clazzMemberRole="clazzMemberRole"
        @fileAddRegister="fileAddRegister"
        @openDetailModal="openAttendanceDetalModal"
        @openConfirmAllModal="openConfirmAllModal"
    />
    <stats v-else-if="curTab === 'stats'" :clazzMemberRole="clazzMemberRole"/>
    <student-list v-else-if="curTab === 'studentList'"/>
    <guide v-else />

    <attendance-register-modal 
      v-if="modal.isShowRegisterModal"
      :ids="modal.ids"
      :id="modal.id"
      :clazzMemberRole="clazzMemberRole"
      :isConfirmMode="modal.isConfirmdMode"
      @close="(optionalAttendances) => closeAttendanceRegisterModal(null, optionalAttendances)" 
    />
    <attendance-detail-modal
      v-if="modal.isShowDetailModal"
      :id="modal.id"
      :clazzMemberRole="clazzMemberRole"
      @close="closeAttendanceDetailModal"
    />
    <attendance-neis-modal 
      v-if="isNeisModal"
      :clazzMemberRole="clazzMemberRole"
      @close="openNeisModal"
      @openDetailModal="openAttendanceDetalModal"
    />
  </div>
</template>

<script>
import AttendanceList from "@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendanceList";
import Stats from "@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendanceStats";
import StudentList from "@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendanceStudentList";
import Guide from "@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendanceGuide";
import AttendanceRegisterModal from "./modal/AttendanceRegisterModal";
import AttendanceDetailModal from "./modal/AttendanceDetailModal";
import AttendanceNeisModal from "./modal/AttendanceNeisModal"
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";

export default {
  name: "main-body-clazzes-body-attendance",
  components: {
    AttendanceList,
    Stats,
    StudentList,
    Guide,
    AttendanceRegisterModal,
    AttendanceDetailModal,
    AttendanceNeisModal
  },
  data() {
    return {
      curTab: 'attendanceList',// 현재 탭
      modal: {
        ids: [],
        id: null,
        isShowRegisterModal: false,
        isShowDetailModal: false,
        isConfirmdMode: false,
      },
      isNeisModal: false
    }
  },
  props: {
    isManager: Boolean,
    clazzMemberRole: String,
  },
  computed: {
    ...mapState('storeClazzes', {
      attendance: 'attendance'
    }),
    ...mapGetters({
      curClassId: 'curClassId'
    }),
    isTeacher: function() {
      return ['OWNER', 'MANAGER'].includes(this.clazzMemberRole)
    },
  },
  watch: {
    $route(to, from) {
      if (to.query && to.query != from.query) {
        const {attendanceId, messageCode} = to.query
        this.notificationClick(attendanceId, messageCode)
      }
    }
  },
  methods: {
    ...mapMutations(['setCurClazzesPosts', 'setClazzRemindPushModal']),
    ...mapMutations('storeClazzes', [
      'setIsShowAttendanceStudentRegisterCompleteModal',
      'setAttendanceIsUnconfirmedAttendanceExist',
      'setAttendanceApplyListSearchParams',
      'setAttendanceApplyList'
    ]),
    ...mapActions('storeClazzes',{
      callAttendancesByClassId: 'callAttendancesByClassId'
    }),
    async notificationClick(attendanceId, messageCode) {
      if(!attendanceId) return;

      this.openAttendanceDetalModal(attendanceId)
      this.$router.replace({query: null})
    },
    setCurTab(tab) {
      this.curTab = tab
    },
    openConfirmAllModal(ids) {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.modal = {ids, id: null, isShowRegisterModal: true, isShowDetailModal: false, isConfirmdMode: true}
    },
    openAttendanceRegisterModal: function() {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.modal = {ids: [], id: null, isShowRegisterModal: true, isShowDetailModal: false, isConfirmdMode: false}
    },
    closeAttendanceRegisterModal: async function(id, optionalAttendances = []) {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      if (this.modal.ids && this.modal.ids.length > 0) {
        this.$refs.attendanceList.clearCheckedItems()
      }
      this.modal = {ids: [], id: null, isShowRegisterModal: false, isShowDetailModal: false, isConfirmdMode: false}
      if(this.curTab !== 'attendanceList' && !id) {
        if(this.isTeacher) {
          this.setAttendanceIsUnconfirmedAttendanceExist(false)
        }
        this.setCurTab('attendanceList')
      } else {
        if(this.isTeacher) {
          optionalAttendances.length > 0
            ? this.setAttendanceApplyList(optionalAttendances)
            : this.callAttendancesByClassId({init: true, isDeleted: false})
        } else {
          this.callAttendancesByClassId({init: true, isDeleted: false})
        }
      }
    },
    openAttendanceDetalModal: function(id) {
      this.$log.debug("bodyAttendance", id)
      this.$hiClass.toggleBodyClass('add', 'hidden')
      this.modal = {ids: [], id, isShowRegisterModal: false, isShowDetailModal: true, isConfirmdMode: false}
    },
    closeAttendanceDetailModal: async function(value) {
      // this.$hiClass.toggleBodyClass('remove', 'hidden')   >>  $hiClass.toggleBodyClass에 설정된 setTimeout 때문에 아래와 같이 수정      
      document.body.classList.remove('hidden')
      this.modal = {ids: [], id: value.id, isShowRegisterModal: value.id ? true: false, isShowDetailModal: false, isConfirmdMode: value.isConfirm}
      if(value.isInit) {
        await this.callAttendancesByClassId({init: true, isDeleted: false})
      }
      if(value.isDeleted) {
        await this.callAttendancesByClassId({init: false, isDeleted: true})
      }
    },
    openNeisModal() {
      if(this.isNeisModal === false) this.$hiClass.toggleBodyClass('add', 'hidden')
      else this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isNeisModal = !this.isNeisModal
    },
    fileAddRegister(id) {
      this.closeAttendanceRegisterModal(id)
    },
    onClickClassManagement() {
      const nextPath = `/main/clazzes/${this.$route.params.id}/class`
      this.$router.push(nextPath, () => {
      })
    },
    async showAttendanceModal() {
      this.setClazzRemindPushModal({ isOpen: true, isGeneralType: true });
      (await this.$comn.asyncWaitFor(() => 
        this.$comn.findComponentByPath(window.app.$children[0], 'main/main-header/clazz-remind-push-modal')))
          .readyToSendAttendanceNotice()
    }
  },
  created() {
    const {tab, attendanceId, messageCode} = this.$route.query
    if (tab) {
      this.setCurTab(tab)
    }

    if (JSON.parse(localStorage.getItem('isStartAttendance'))) {
      this.setIsShowAttendanceStudentRegisterCompleteModal(true)
      localStorage.removeItem('isStartAttendance')
    }
    setTimeout(() => {
      this.notificationClick(attendanceId, messageCode)
    }) 
  }
}
</script>

<style scoped lang="scss">
.hi-tooltip-wrap{
  position: absolute;
  left: 50%;
  top: 3px;
}
.attendance-heading {
  min-height: 0px !important;
  .top {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    span {
      &.more {
        a {
          font-size: 16px;
          color: #616161;
          &::after {
            content: "";
            display: inline-block;
            width: 9px;
            height: 9px;
            border-top: 1px solid #616161;
            border-right: 1px solid #616161;
            -webkit-transform: rotate(45deg);
            transform: rotate(45deg);
            margin: 0 6px;
          }
        }
      }
    }
  }
  .info {
    margin-top: 10px;
    margin-bottom: 30px;
    font-size: 16px;
    font-weight: 400;
    color: #888;
    line-height: 1.4;
    span {
      &.underline {
        color: #4777DE;
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
.attendance-btn-group {
  text-align: right;
  margin-bottom: 15px;
  button{
    font-size: 15px !important;
    font-weight: 500;
    width: 176px;
    margin-left: 8px;
  }
}
.attendance__filter {
  margin-bottom: 26px;
  .hi-tab {
    button {
      padding: 0 16px 0 15px;
    }
  }
}
</style>
