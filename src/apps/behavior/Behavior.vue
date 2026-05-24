<template>
  <div class="behavior-container">
    <div class="behavior-wrapper">
      <div class="behavior-wrapper__submenu">
        <div class="behavior-wrapper__submenu__close">
          <div class="top-open-btn">
            <i class="open-menu cursor-pointer" @click="toggleLnb"></i>
          </div>

          <div class="top-class cursor-pointer" @click="openClassMobileList" v-click-outside="hideMobileClassListLayer">
            <i ref="openLnbClassListMobileBtnEl" class="class-btn bh-class-select"></i>
            <span>{{ selectedClassroomName }}</span>
            <!-- 모바일 일때 교실 목록 레이어 -->
            <BehaviorClassListLayerPopup
              ref="openLnbClassListMobileEl"
              :selected="selectedClassroomId"
              :items="classrooms"
              :curPage="page.number"
              @clickClassroom="toggleClassroomItem"
              @openAddModal="openAddClassroomModal"
              @openManageModal="openManageClassroomModal"
              @classroomsPageSearch="classroomsPageSearch"
            />
          </div>
          <!-- LNB 접혀진 상태 -->
          <lnb-menu :isOpen="false" />

          <div class="bottom">
            <p class="my">
              <span class="image">
                <img :src="userPhoto" />
              </span>
            </p>
          </div>
        </div>
        <div ref="openLnbMenuOpenEl" class="behavior-wrapper__submenu__open">
          <div class="close">
            <i class="close-btn01 cursor-pointer" @click="toggleLnb"></i>
          </div>
          <div class="top" v-click-outside="hideClassListLayer">
            <span class="class cursor-pointer" @click="openClassList">{{ selectedClassroomName }}</span>
            <span class="cicle01 cursor-pointer" @click="openClassList">
              <i ref="openLnbClassListBtnEl" class="class-btn bh-arrow-down01"></i>
            </span>
            <!-- 모바일이 아닐때 교실 목록 레이어 -->
            <BehaviorClassListLayerPopup
              ref="openLnbClassListEl"
              :selected="selectedClassroomId"
              :items="classrooms"
              :curPage="page.number"
              @clickClassroom="toggleClassroomItem"
              @openAddModal="openAddClassroomModal"
              @openManageModal="openManageClassroomModal"
              @classroomsPageSearch="classroomsPageSearch"
            />
          </div>
          <!-- LNB 펼처진 상태 -->
          <lnb-menu :isOpen="true" />

          <div class="bottom">
            <p class="my">
              <span class="image">
                <img :src="userPhoto" />
              </span>
              <span class="name">{{ dispalyUserName }}</span>
            </p>
          </div>
        </div>
      </div>

      <div v-if="isLoadContent" class="behavior-wrapper__body">
        <!-- 내용이 들어가는 영역 -->
        <router-view />
        <!-- 내용이 들어가는 영역 -->
      </div>
    </div>
    <add-classroom v-if="modalOpen.isAddClassroom" @close="closeAddClassroomModal" />
    <manage-classroom-modal v-if="modalOpen.isManageClassroom" :selected="selectedClassroomId" @close="closeManageClassroomModal" />
    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :isAlert="confirmModal.isAlert"
      :cancelButtonText="confirmModal.cancelButtonText"
      :confirmButtonText="confirmModal.confirmButtonText"
      @closeConfirmDialog="closeConfirmModal"
    />

    <div class="picker-wrapper" v-if="showPicker">
      <picker ref="picker" v-if="classroomId && showPicker" :classroomId="classroomId" @close="onClosePicker" />
    </div>
    <div class="group-wrapper" v-if="showGroupDraw">
      <GroupDraw ref="group-draw" v-if="showGroupDraw" @close="onCloseGroupDraw" />
    </div>
    <give-point-finish-toast
      v-if="pointGiveFinishModal.open === true"
      :item="pointGiveFinishModal"
      :content="pointGiveFinishContent"
      @close="finishToastClose"
    />

    <give-point-finish-toast-02 v-if="toastMessageModal02.open === true" :item="toastMessageModal02" :content="pointGiveFinishContent" />

    <toast-type01 v-if="toastMessageModal.open === true" :item="toastMessageModal" />

    <audio id="audioContainer" ref="givePointSound">
      <source id="audioSource" ref="givePointSoundSource" src="" />
    </audio>
  </div>
</template>

<script>
import '@/assets/css/behavior-record.css';
import '@/assets/css/behavior-reports.scss';
//import '@/assets/css/behavior-reports.css';
import '@/assets/css/behavior-viewer.css';
import '@/assets/css/behavior-print.css';

import { mapActions, mapGetters, mapState, mapMutations } from 'vuex';
import BehaviorClassListLayerPopup from '@/apps/behavior/components/popup/BehaviorClassListLayerPopup.vue';
import LnbMenu from '@/apps/behavior/components/layout/LNBMenu.vue';
import AddClassroom from '@/apps/behavior/components/popup/AddClassroom.vue';
import ManageClassroomModal from '@/apps/behavior/components/popup/ManageClassroomModal.vue';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import GivePointFinishToast from '@/apps/behavior/components/toast/GivePointFinishToast.vue';
import GivePointFinishToast02 from '@/apps/behavior/components/toast/GivePointFinishToast02.vue';
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue';
import Picker from './pages/classrooms/Picker.vue';
import GroupDraw from './pages/classrooms/GroupDraw.vue';
import { eventBus } from '@/main';

export default {
  name: 'behavior',
  components: {
    LnbMenu,
    BehaviorClassListLayerPopup,
    AddClassroom,
    ManageClassroomModal,
    ConfirmModal,
    GivePointFinishToast,
    GivePointFinishToast02,
    ToastType01,
    Picker,
    GroupDraw,
  },
  props: {
    connectedClassId: String,
  },
  data() {
    return {
      modalOpen: {
        isAddClassroom: false,
        isManageClassroom: false,
      },
      isMobile: false,
      selectedMenu: 'classrooms',
      selectedClassroom: null,
      classrooms: [],
      page: {},
      confirmModal: {
        isOpen: false,
        title: '사용 권한이 없습니다.',
        action: 'alert',
        isAlert: true,
      },
      pointGiveFinishContent: {},
      toastMessageModal: {
        open: false,
        message: null,
        // top, bottom 둘다 null일 경우 세로한가운데 정렬 숫자만
        top: null,
        bottom: null,
        // left, right 둘다 null일 경우 가로한가운데 정렬 숫자만
        left: null,
        right: null,
        width: null, // null = 420px 숫자만
        height: null, // null = 66px 숫자만
        align: 'center', // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right
      },
      toastMessageModal02: {
        open: false,
        message: null,
        // top, bottom 둘다 null일 경우 세로한가운데 정렬 숫자만
        top: null,
        bottom: null,
        // left, right 둘다 null일 경우 가로한가운데 정렬 숫자만
        left: null,
        right: null,
        width: null, // null = 420px 숫자만
        height: null, // null = 66px 숫자만
        align: 'center', // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right
        btnName: null,
      },
      pointFinishClearTimeOut: null,
      pointFinishClearTimeOutWatch: null,
      givePointSoundGood: 'https://download.hiclass.net/static/assets/audio/givepoint_sound_good.mp3',
      givePointSoundBad: 'https://download.hiclass.net/static/assets/audio/givepoint_sound_bad.mp3',
      showPicker: false,
      showGroupDraw: false,
    };
  },
  computed: {
    ...mapGetters('storeBehavior', {
      loginUser: 'loginUser',
      userType: 'userType',
      isUsageConsentExisted: 'isUsageConsentExisted',
    }),
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
      pointGiveFinishModal: 'pointGiveFinishModal',
      updateSubscribeList: 'updateSubscribeList',
      students: 'students',
      detailClass: 'detailClass',
      newStudentPoints: 'newStudentPoints',
      lastStudentsParams: 'lastStudentsParams',
    }),
    classroomId: function () {
      return this.curClassroom.classroomId;
    },
    userPhoto: function () {
      return this.loginUser.userPhoto || this.$store.state.userProfileDefault;
    },
    dispalyUserName: function () {
      let loginUserStr = this.loginUser.userName;
      switch (this.userType) {
        case 'TEACHER':
          loginUserStr += ' 선생님';
          break;
        case 'PARENTS':
          loginUserStr += ' 학부모';
          break;
        case 'STUDENT':
          loginUserStr += ' 학생';
          break;
      }
      return loginUserStr;
    },
    selectedClassroomName: function () {
      return this.selectedClassroom ? this.selectedClassroom.classroomName : '';
    },
    selectedClassroomId: function () {
      return this.selectedClassroom ? this.selectedClassroom.classroomId : '';
    },
    isLoadContent: function () {
      return this.selectedClassroom !== null;
    },
    isStudentType() {
      return this.detailClass.studentViewType === 'NONE' ? false : true;
    },
  },
  watch: {
    async updateSubscribeList(v) {
      if (v.contentType === 'checklist') return;

      if (v.contentType === 'pointComplete') {
        if (this.isStudentType === true) {
          clearTimeout(this.pointFinishClearTimeOutWatch);
          if (this.pointGiveFinishModal.open === true) {
            await this.setPointGiveFinishModal({
              open: false,
              mode: null,
            });
          }
          await this.getGivePointFinish(v, true);
        } else {
          if (this.toastMessageModal02.open === true) {
            this.toastMessageModal02.open = false;
            this.toastMessageModal02.message = null;
            this.toastMessageModal02.btnName = null;
            this.toastMessageModal02.bottom = null;
          }
          await this.getGivePointFinish(v, false);
        }
      } else if (v.contentType === 'pointReset') {
        if (v.content.isToAll) {
          this.setNewStudentPoints([]);
          this.setResetStudentsIds(this.students.map((o) => o.studentId));
          this.setStudents(
            this.students.map((o) => {
              return { ...o, point: 0 };
            })
          );
          this.toastMessageModal.open = true;
          this.toastMessageModal.message = '전체 학생의 포인트가 초기화 되었습니다.';
          this.toastMessageModal.bottom = 124;
        } else {
          this.setNewStudentPoints([]);
          const resetStudents = v.content.studentPoints.map((o) => o.studentId);
          this.setResetStudentsIds(resetStudents);
          this.setStudents(
            this.students.map((o) => {
              return resetStudents.includes(o.studentId) ? { ...o, point: 0 } : o;
            })
          );
          this.toastMessageModal.open = true;
          this.toastMessageModal.message = '선택 학생의 포인트가 초기화 되었습니다.';
          this.toastMessageModal.bottom = 124;
        }
        setTimeout(() => {
          this.toastMessageModal.open = false;
          this.toastMessageModal.message = null;
          this.toastMessageModal.bottom = null;
          this.setResetStudentsIds([]);
        }, 1300);
      } else {
        if (this.toastMessageModal.open === true) {
          this.toastMessageModal.open = false;
          this.toastMessageModal.message = null;
        }
        if (this.toastMessageModal02.open === true) {
          this.toastMessageModal02.open = false;
          this.toastMessageModal02.message = null;
          this.toastMessageModal02.btnName = null;
          this.toastMessageModal02.bottom = null;
        }
        if (this.pointGiveFinishModal.open === true) {
          await this.setPointGiveFinishModal({
            open: false,
            mode: null,
          });
        }
        this.getGivePointEsc(v);
      }
    },
    'pointGiveFinishModal.open'(v) {
      if (v === true) {
        this.pointFinishClearTimeOutWatch = setTimeout(async () => {
          await this.setPointGiveFinishModal({
            open: false,
            mode: null,
          });
        }, 2800);
      }
    },
    'toastMessageModal02.open'(v) {
      if (v === true) {
        setTimeout(async () => {
          this.toastMessageModal02.open = false;
          this.toastMessageModal02.message = null;
          this.toastMessageModal02.btnName = null;
          this.toastMessageModal02.bottom = null;
        }, 2800);
      }
    },
    classroomId(n, o) {
      this.connectStompClient();
      this.setDetailClass({
        studentViewType: this.curClassroom.studentViewType,
        pointViewType: this.curClassroom.pointViewType,
      });
    },
    newStudentPoints(v) {
      if (v.length > 0) {
        setTimeout(async () => {
          this.setNewStudentPoints([]);
        }, 1600);
      }
    },
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudents: 'getClassroomStudents',
      getLoginUserInfomation: 'getLoginUserInfomation',
      getClassrooms: 'getClassrooms',
      getClassroomDetail: 'getClassroomDetail',
      connectStompClient: 'connectStompClient',
      patchPointGiveFinishModal: 'patchPointGiveFinishModal',
      getIscreamConsent: 'getIscreamConsent',
    }),
    ...mapMutations('storeBehavior', {
      setPointGiveFinishModal: 'setPointGiveFinishModal',
      setStudents: 'setStudents',
      setNewStudentPoints: 'setNewStudentPoints',
      setResetStudentsIds: 'setResetStudentsIds',
      setMySend: 'setMySend',
      setDetailClass: 'setDetailClass',
    }),
    closeConfirmModal: function (isConfirm) {
      this.confirmModal.isOpen = false;
      if (this.confirmModal.action === 'alert' || (this.confirmModal.action === 'confirm' && !isConfirm)) {
        if (window.opener) {
          window.close();
        } else {
          this.$router.push('/', () => {});
        }
      } else {
        this.openAddClassroomModal();
      }
    },
    toggleClassroomItem: async function (classroom, isAdd = false) {
      const res = await this.getClassroomDetail(classroom.classroomId);
      if (res.status === 404) {
        this.$hiClass.alert('삭제된 교실입니다.', 'error');
        this.setClassrooms(await this.getClassrooms({ isUsed: true }));
        return;
      } else {
        this.selectedClassroom = res;
        if (isAdd) {
          const consent = await this.getIscreamConsent({ classroomId: classroom.classroomId, userId: localStorage.getItem('uuid') });
          if (consent.enableStudentListLoad) {
            if (consent.isConsentExisted) {
              document.location.href = `/behavior-records/${classroom.classroomId}/classrooms/manageStudents?openIscreamClassConfirmModal=open`;
            } else {
              document.location.href = `/behavior-records/${classroom.classroomId}/classrooms/manageStudents?openConsentConfirmModal=open`;
            }

            return;
          }
          const classroomsNames = ['behavior', 'classrooms', 'students', 'seat', 'points', 'manageStudents'];
          const reportsNames = ['reports', 'point-report', 'record-report', 'report-history'];
          const groupMissionNames = ['groupmission'];
          if (classroomsNames.includes(this.$route.name)) {
            this.$router.push(
              `/behavior-records/${classroom.classroomId}/classrooms/${this.$route.name === 'behavior' ? 'students' : this.$route.name}`
            );
          } else if (reportsNames.includes(this.$route.name)) {
            this.$router.push(
              `/behavior-records/${classroom.classroomId}/reports/${this.$route.name === 'reports' ? 'point-report' : this.$route.name}`
            );
          } else if (groupMissionNames.includes(this.$route.name)) {
            this.$router.push(`/behavior-records/${classroom.classroomId}/${this.$route.name}/progress`);
          } else {
            this.$router.push(`/behavior-records/${classroom.classroomId}/${this.$route.name}`);
          }
        }

        if (this.isMobile) {
          this.hideMobileClassListLayer();
        } else {
          this.hideClassListLayer();
        }
      }
    },
    openAddClassroomModal: function () {
      this.modalOpen.isAddClassroom = true;

      if (this.isMobile) {
        this.hideMobileClassListLayer();
      } else {
        this.hideClassListLayer();
      }
    },
    closeAddClassroomModal: async function (classroom) {
      this.modalOpen.isAddClassroom = false;

      if (classroom) {
        this.setClassrooms(await this.getClassrooms({ isUsed: true }));
        await this.toggleClassroomItem(classroom, true);
      }
    },
    openManageClassroomModal: function () {
      this.$hiClass.toggleBodyClass('add', 'hidden');
      this.modalOpen.isManageClassroom = true;

      if (this.isMobile) {
        this.hideMobileClassListLayer();
      } else {
        this.hideClassListLayer();
      }
    },
    closeManageClassroomModal: async function (deleted) {
      this.$hiClass.toggleBodyClass('remove', 'hidden');
      this.modalOpen.isManageClassroom = false;
      this.setClassrooms(await this.getClassrooms({ isUsed: true }));

      if (this.page.totalElements === 0 && deleted) {
        this.selectedClassroom = null;
        this.confirmModal = {
          isOpen: true,
          title: '생성된 교실이 없습니다.<br/>교실을 생성하시겠습니까?',
          action: 'confirm',
          cancelButtonText: '나가기',
          confirmButtonText: '교실 만들기',
          isAlert: false,
        };
        return;
      }

      if (deleted) {
        this.toggleClassroomItem(this.classrooms[0]);
      } else {
        this.toggleClassroomItem(this.selectedClassroom);
      }
    },
    openClassList: function () {
      const openLnbClassListBtnEl = this.$refs.openLnbClassListBtnEl;
      const openLnbClassListEl = this.$refs.openLnbClassListEl.$el;
      const chk = openLnbClassListBtnEl.classList.contains('bh-arrow-down01');

      if (chk) {
        openLnbClassListBtnEl.classList.replace('bh-arrow-down01', 'bh-arrow-up01');
        openLnbClassListEl.style.display = 'block';
      } else {
        openLnbClassListBtnEl.classList.replace('bh-arrow-up01', 'bh-arrow-down01');
        openLnbClassListEl.style.display = 'none';
      }
    },
    openClassMobileList: function () {
      const openLnbClassListMobileBtnEl = this.$refs.openLnbClassListMobileBtnEl;
      const openLnbClassListMobileEl = this.$refs.openLnbClassListMobileEl.$el;
      const chk = openLnbClassListMobileBtnEl.classList.contains('bh-class-select');

      if (chk) {
        openLnbClassListMobileBtnEl.classList.replace('bh-class-select', 'bh-class-select-on');
        openLnbClassListMobileEl.style.display = 'block';
      } else {
        openLnbClassListMobileBtnEl.classList.replace('bh-class-select-on', 'bh-class-select');
        openLnbClassListMobileEl.style.display = 'none';
      }
    },
    hideMobileClassListLayer: function () {
      const openLnbClassListMobileBtnEl = this.$refs.openLnbClassListMobileBtnEl;
      const openLnbClassListMobileEl = this.$refs.openLnbClassListMobileEl.$el;

      if (openLnbClassListMobileEl.style.display === 'block') {
        openLnbClassListMobileBtnEl.classList.replace('bh-class-select-on', 'bh-class-select');
        openLnbClassListMobileEl.style.display = 'none';
      }
    },
    hideClassListLayer: function () {
      const openLnbClassListBtnEl = this.$refs.openLnbClassListBtnEl;
      const openLnbClassListEl = this.$refs.openLnbClassListEl.$el;

      if (openLnbClassListEl.style.display == 'block') {
        openLnbClassListBtnEl.classList.replace('bh-arrow-up01', 'bh-arrow-down01');
        openLnbClassListEl.style.display = 'none';
      }
    },
    toggleLnb: function () {
      const openLnbMenuOpenEl = this.$refs.openLnbMenuOpenEl;
      const chk = openLnbMenuOpenEl.classList.contains('open');

      if (chk) {
        openLnbMenuOpenEl.classList.remove('open');
      } else {
        openLnbMenuOpenEl.classList.add('open');
      }
    },
    classroomsPageSearch: async function (page) {
      if (this.page.totalPages > page) {
        this.setClassrooms(await this.getClassrooms({ isUsed: true, page }));
      }
    },
    setClassrooms: function (response) {
      const { _embedded, page } = response;
      this.page = page;

      if (page.totalElements < 1) {
        this.classrooms = [];
      } else {
        this.classrooms = page.number === 0 ? _embedded.classrooms : [...this.classrooms, ..._embedded.classrooms];
      }
    },
    getGivePointFinish: async function (item, isCharacterType) {
      let mode = 'good';
      let soundSrc = this.givePointSoundGood;
      if (item.content.classroomPoints.findIndex((v) => v.isNegative === true) > -1) {
        mode = 'effort';
        soundSrc = this.givePointSoundBad;
      }

      const checkSound = !localStorage.getItem('behavior-givepoint-sound') ? 'ON' : localStorage.getItem('behavior-givepoint-sound');
      if (checkSound === 'ON') {
        const audioContainer = this.$refs.givePointSound;
        const source = this.$refs.givePointSoundSource;
        source.src = soundSrc;
        audioContainer.load();
        audioContainer.volume = 1;
        audioContainer.play();
      }

      this.pointGiveFinishContent = item;
      if (isCharacterType) {
        await this.patchPointGiveFinishModal({
          open: true,
          mode: mode,
        });
      } else {
        this.toastMessageModal02.open = true;
        this.toastMessageModal02.message = '포인트 지급 완료';
        this.toastMessageModal02.btnName = '취소';
        this.toastMessageModal02.bottom = 124;
      }

      this.pointFinishClearTimeOut = setTimeout(async () => {
        const list = JSON.parse(JSON.stringify(this.students))
          .filter((o) => o.checked)
          .map((v) => v.studentId);

        if (!this.lastStudentsParams.classroomId) return;
        await this.refreshClassroomStudents();
        this.students.forEach((v) => {
          if (list.includes(v.studentId)) {
            v.checked = true;
          }
        });

        const studentPoints = JSON.parse(JSON.stringify(item.content.studentPoints)).map((item) => {
          return {
            ...item,
            mode: mode,
          };
        });

        this.setNewStudentPoints(studentPoints);
      }, 2800);
    },
    getGivePointEsc: async function (item) {
      clearTimeout(this.pointFinishClearTimeOut);
      const list = JSON.parse(JSON.stringify(this.students)).map((v) => {
        const obj = item.content.studentPoints.find((v2) => v.studentId === v2.studentId);
        if (obj) {
          return {
            ...v,
            point: obj.point,
          };
        } else {
          return v;
        }
      });

      try {
        await this.setStudents(list);
      } catch (err) {
        this.$log.debug('getGivePointEsc error => ', err);
      } finally {
        this.toastMessageModal.open = true;
        this.toastMessageModal.message = '포인트 지급을 취소하였습니다.';
        this.toastMessageModal.bottom = 124;
        setTimeout(() => {
          this.toastMessageModal.open = false;
          this.toastMessageModal.message = null;
          this.toastMessageModal.bottom = null;
        }, 1300);
      }
    },
    finishToastClose: async function () {
      clearTimeout(this.pointFinishClearTimeOut);
      this.pointGiveFinishModal.open = false;

      let mode = 'good';
      if (this.pointGiveFinishContent.content.classroomPoints.findIndex((v) => v.isNegative === true) > -1) {
        mode = 'effort';
      }

      const list = JSON.parse(JSON.stringify(this.students))
        .filter((o) => o.checked)
        .map((v) => v.studentId);
      await this.refreshClassroomStudents();
      this.students.forEach((v) => {
        if (list.includes(v.studentId)) {
          v.checked = true;
        }
      });

      const studentPoints = JSON.parse(JSON.stringify(this.pointGiveFinishContent.content.studentPoints)).map((item) => {
        return {
          ...item,
          mode: mode,
        };
      });

      this.setNewStudentPoints(studentPoints);
    },
    async onClosePicker() {
      this.showPicker = false;
      this.setClassrooms(await this.getClassrooms({ isUsed: true }));
      if (this.classrooms.length === 0) {
        window.close();
        return;
      }
      const response = await this.getClassroomDetail(this.classroomId);
      if (response.status === 404) {
        document.location.href = '/behavior-records';
        return;
      }
      this.refreshClassroomStudents();
    },
    async onCloseGroupDraw() {
      this.showGroupDraw = false;
    },
    refreshClassroomStudents() {
      return this.getClassroomStudents(this.lastStudentsParams);
    },
  },
  async created() {
    await this.getLoginUserInfomation();
    if (this.userType !== 'TEACHER') {
      this.confirmModal = {
        isOpen: true,
        title: '사용 권한이 없습니다.',
        action: 'alert',
        isAlert: true,
      };
      return;
    }
    this.setClassrooms(await this.getClassrooms({ isUsed: true }));
    if (this.classrooms.length === 0) {
      this.openAddClassroomModal();
      return;
    }
    const classroomId = this.$route.params && this.$route.params.classroomId ? this.$route.params.classroomId : this.classrooms[0].classroomId;

    this.selectedClassroom = await this.getClassroomDetail(classroomId);

    if (this.$route.path === '/behavior-records') {
      this.$router.push(`/behavior-records/${classroomId}/classrooms/students?mode=check`);
    }
  },
  mounted() {
    const openLnbMenuOpenEl = this.$refs.openLnbMenuOpenEl;
    const openLnbClassListMobileBtnEl = this.$refs.openLnbClassListMobileBtnEl;
    const openLnbClassListMobileEl = this.$refs.openLnbClassListMobileEl.$el;
    const openLnbClassListBtnEl = this.$refs.openLnbClassListBtnEl;
    const openLnbClassListEl = this.$refs.openLnbClassListEl.$el;

    window.addEventListener(`resize`, function () {
      const width = window.innerWidth;
      const chk = openLnbMenuOpenEl.classList.contains('open');

      if (width > 1024) {
        this.isMobile = false;
        openLnbClassListMobileBtnEl.classList.replace('bh-class-select-on', 'bh-class-select');
        openLnbClassListMobileEl.style.display = 'none';

        if (chk === true) {
          openLnbMenuOpenEl.classList.toggle('open');
          openLnbClassListBtnEl.classList.replace('bh-arrow-up01', 'bh-arrow-down01');
          openLnbClassListEl.style.display = 'none';
        }
      } else {
        this.isMobile = true;

        if (chk === false) {
          openLnbClassListBtnEl.classList.replace('bh-arrow-up01', 'bh-arrow-down01');
          openLnbClassListEl.style.display = 'none';
        }
      }
    });

    eventBus.$on('behavior-records/openPicker', async () => {
      await this.refreshClassroomStudents();
      if (this.students.length === 0) return this.$hiClass.alert('학생을 등록해주세요.');
      this.showPicker = true;
    });

    eventBus.$on('behavior-records/drawRandom', async ({ gender = 'ALL', targetNum = 1, classroomId }) => {
      if (this.classroomId !== classroomId) return;
      const delay = this.showPicker ? 0 : this.students.length * 110;
      this.showPicker = true;
      await this.$comn.asyncWaitFor(() => this.$refs.picker);
      await new Promise((resolve) => setTimeout(resolve, delay));
      this.$refs.picker.callDrawRandom(gender, targetNum).then();
    });

    eventBus.$on('behavior-records/openGroupDraw', async ({ classroomId, seatPlanId, version, seatSectionId, studentId }) => {
      if (this.classroomId !== classroomId) return;

      if (!this.showGroupDraw) {
        // 닫혀있다면 열고 seatPlanId 초기화
        this.showGroupDraw = true;
        await this.$comn.asyncWaitFor(() => this.$refs['group-draw']);
        await this.$refs['group-draw'].init(classroomId, seatPlanId, version);
      }

      if (seatSectionId && studentId) {
        this.$refs['group-draw'].startMemberDrawAnimation(seatPlanId, seatSectionId, studentId).then();
      } else if (seatSectionId) {
        this.$refs['group-draw'].startGroupDrawAnimation(seatPlanId, seatSectionId).then();
      }
    });
  },
  beforeUnmount() {
    eventBus.$off('behavior-records/openPicker');
    eventBus.$off('behavior-records/drawRandom');
    eventBus.$off('behavior-records/openGroupDraw');
  },
};
</script>

<style scoped>
.picker-wrapper,
.group-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
