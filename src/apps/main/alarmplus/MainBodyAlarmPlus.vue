<template>
  <div class="content-area">
    <!-- 신규 LNB -->
    <MainSidebar v-if="showLeftMenu" :selectedSchoolId="selectedSchoolId" :is-collapsed.sync="isSidebarCollapsed" :activeSubmenu="activeSubmenu" />
    <div v-show="visibleComponent === 'iframe'" class="zoom-target" :style="zoomStyle">
      <iframe ref="iframeContent" id="iframeContent" :src="iframe.src" @load="iframeLoaded" :style="iframe.style" allow="clipboard-write"></iframe>
    </div>

    <timetable-daily-home v-if="visibleComponent === 'timetable'" :school="JSON.stringify(currentSchool)" class="daily-home" :style="iframe.style" />

    <timetable-my-home v-if="visibleComponent === 'my-timetable'" :school="JSON.stringify(currentSchool)" class="my-home" :style="iframe.style" />

    <global-events @scroll="handleIframeScroll" />
  </div>
</template>

<script>
import MainSidebar from '@/apps/main/MainNavigationMenu.vue';
import { mapActions, mapMutations, mapState } from 'vuex';
import { mapFields } from 'vuex-map-fields';
import { eventBus } from '@/main';
import { handleShare } from '@/plugins/utils';
import { Timetables } from '@/apis/Timetables';
import AlarmplusMixin from '@/apps/alarmplus/mixins/AlarmplusMixin.vue';
import ReactStyle from '@/apps/hc2/mixins/reactStyle';
import { init } from '@sentry/vue';

export default {
  name: 'mainBodyAlarmPlus',
  data() {
    return {
      iframe: {
        src: null,
        top: 0,
        style: {
          // maxWidth: '1600',
          width: '100%',
          maxWidth: '1600px',
          height: '0',
          bottom: '0',
          position: 'relative',
          top: '0px',
          border: 0,
        },
      },
      schools: [],
      // isSideModalOpen: false
      visibleComponent: 'iframe',
      isIOS: false,
      isSidebarCollapsed: false,
      iframeSrc: '',
      currentSchool: null,
      selectedSchoolId: null,
      activeSubmenu: 'school-post',
      isMaster: false,
      isTeacher: false,
    };
  },
  components: {
    MainSidebar,
    // SideModal
  },
  mixins: [ AlarmplusMixin, ReactStyle ],
  computed: {
    ...mapFields({
      isNewTabLoading: 'isNewTabLoading',
    }),
    ...mapState('storeSchool', ['alarmPlusSchools']),
    zoomScale() {
      if (this.isChrome) return 1;
      return this.isIOS ? 0.8 : 1;
    },
    zoomStyle() {
      return {
        '--scale': this.zoomScale,
        transform: `scale(${this.zoomScale})`,
        transformOrigin: 'top left',
        width: `${100 / this.zoomScale}%`,
        height: `${100 / this.zoomScale}%`,
      };
    },
    showLeftMenu() {
      if (this.$route.query.tab && this.$route.query.tab === 'text') {
        return false;
      }
      const blackList = ['searchSchool', 'applicationForManager', 'createSchool'];
      return this.alarmPlusSchools.length > 0 && !blackList.some((word) => this.iframeSrc.includes(word));
    },
    isTimetableViewerOnly() {
      return !this.isMaster && this.isTeacher;
    }
  },
  watch: {
    $route(to, from) {
      if (!to.params.view && !to.schoolId && !to.params.menu) {
        this.reloadAlarmplus();
        return;
      }

      if (to.params.schoolId && to.params.schoolId !== from.params.schoolId) {
        this.selectedSchoolId = to.params.schoolId;
        this.checkSchool();
        this.checkTimetableRole();
      }

      if(to.params.menu === 'my-timetable') {
        this.visibleComponent = 'my-timetable';
      }

      if(to.params.menu === 'school-timetable' && this.isTimetableViewerOnly) {
        // 권한 없는 사용자가 school-timetable 접근 시 my-timetable로 리다이렉트
        this.$router.replace({ ...to, params: { ...to.params, menu: 'my-timetable' } });
        return;
      }

      if (to.params.menu === 'school-timetable' && !this.isMaster) {
        this.deniedTimetable();
        return;
      }

      const param = this.getRouteParam(to);
      this.onChangeSidebar(param);
    },
    isSidebarCollapsed() {
      this.recalcIframeStyle();
    },
    showLeftMenu() {
      this.recalcIframeStyle();
    },
    // iframe 화면일 때 body에 iframeShow class 부여 (iframe 관련 전용 스타일링 목적)
    visibleComponent(val) {
      this.$hiClass?.toggleBodyClass(val === 'iframe' ? 'add' : 'remove', 'iframeShow');
    },
  },
  async mounted() {
    this.applyStyle();

    if (this.$store.state.user.userType !== 'TEACHER') {
      await this.$router.push('/main');
      this.isNewTabLoading = false;
      return;
    }

    // 최초 진입 시에도 visibleComponent 초기값(기본: iframe)에 맞춰 body class 적용
    this.$hiClass?.toggleBodyClass(this.visibleComponent === 'iframe' ? 'add' : 'remove', 'iframeShow');

    this.iframe.src = process.env.VUE_APP_BASE_ALARM_PLUS_URI;

    try {
      await this.loadSchools();
    } catch (e) {
      this.$log.error(this.$options.name, 'loadSchools error', e);
    }

    if (!this.$route.params.view && !this.$route.params.schoolId && !this.$route.params.menu) {
      await this.reloadAlarmplus();
    }

    this.selectedSchoolId = this.$route.params.schoolId || this.alarmPlusSchools[0]?.schoolId || null;

    this.checkSchool();
    await this.checkTimetableRole();

    if(this.$route.path.includes('school-timetable') && this.isTimetableViewerOnly) {
      // 권한 없는 사용자가 school-timetable 접근 시 my-timetable로 리다이렉트
      this.$router.replace({ ...this.$route, params: { ...this.$route.params, menu: 'my-timetable' } });
      return;
    }

    if (this.$route.path.includes('school-timetable') && !this.isMaster) {            
      this.deniedTimetable();
      return;
    }

    this.routePath = this.$route.query.routePath;

    const param = this.getRouteParam(this.$route);
    await this.onChangeSidebar(param);

    await this.$nextTick();

    this.detectIOS();
    this.handleResize();

    eventBus.$on('send-message-to-alarm-plus', (message) => {
      this.sendMessageToAlarmPlus(message);
    });

    this.triggerAnalyticsLogEvent({ code: 'analytics.alarmplus.loadPage' });

    if (this.isiPad()) {
      document.body.classList.add('ios');
    }

    this.recalcIframeStyle();
  },
  created() {
    this._orientationHandler = () => {
      setTimeout(() => {
        this.handleResize();
        if (!this.isIOS) {
          const iframe = this.$refs.iframeContent;
          if (iframe) {
            const currentWidth = iframe.style.width;
            iframe.style.width = '99%';
            setTimeout(() => {
              iframe.style.width = currentWidth;
            }, 50);
          }
        }
      }, 300);
    };
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this._orientationHandler);
    window.addEventListener('message', this.handleIframeTask);
    window.addEventListener('message', this.handleReload);
    // 페이지 body 에 hidden, paddingRight 스타일 지양
    // this.$hiClass.toggleBodyClass('add', 'hidden');
    // document.body.style.paddingRight = 0;

    this.isInit = true;
  },
  beforeDestroy() {
    eventBus.$off('send-message-to-alarm-plus');
    // window.removeEventListener('orientationchange', () => {
    //   location.reload();
    // });
    window.removeEventListener('orientationchange', this._orientationHandler);
    window.removeEventListener('resize', this.handleResize);

    // timetable.css 제거
    // const timetableCssLink = document.getElementById('hcTimetableCss');
    // if (timetableCssLink) {
    //   document.body.removeChild(timetableCssLink);
    // }
    this.removeStyle();
  },
  destroyed() {
    // 페이지 종료 시 body iframeShow class 정리
    this.$hiClass?.toggleBodyClass('remove', 'iframeShow');
    // 페이지 body 에 hidden, paddingRight 스타일 지양
    // this.$hiClass.toggleBodyClass('remove', 'hidden');

    // 25.12.30 paddingRight -> 17px을 0으로 변경
    // document.body.style.paddingRight = '0';

    window.removeEventListener('message', this.handleIframeTask);
    window.removeEventListener('message', this.handleReload);
  },
  methods: {
    ...mapActions({
      openTermsView: 'openTermsView',
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapMutations('storeSchool', ['setAlarmPlusSchools']),
    isChrome() {
      const ua = navigator.userAgent;
      return /Chrome/.test(ua) && !/Edge|OPR/.test(ua);
    },
    /**
     * iframeLoaded
     * iframe 내에서 load 이벤트 발생시마다 호출됨 (page load 등)
     */
    iframeLoaded() {
      this.$log.warn(this.$options.name, 'iframeLoaded');
      const queryParam = this.$authentication.load();
      const routePath = this.routePath;
      const loginInfoJson = {
        uuid: queryParam.uuid,
        idToken: queryParam.idToken,
        refreshToken: queryParam.refreshToken,
      };
      if (routePath) loginInfoJson.routePath = routePath;

      this.$refs.iframeContent.contentWindow.postMessage(loginInfoJson, '*');

      // routePath 1회 전달 후 삭제
      this.routePath = null;
      this.isNewTabLoading = false;
    },
    sendMessageToAlarmPlus(message) {
      this.$log.debug(this.$options.name, 'sendMessageToAlarmPlus', message);
      const childFrame = this.$refs.iframeContent;
      try {
        childFrame.contentWindow.postMessage(message, '*');
      } catch (e) {
        this.$log.warn(e);
      }
    },
    goto(name) {
      if (name === 'home') {
        this.$router.push('/', () => {});
        this.isNewTabLoading = false;
      }
    },
    open(name) {
      if (name === 'userSign') this.$hiClass.changeUserSign();
    },
    async handleIframeTask(e) {
      if (e.data === null || e.data === undefined || e.data === '') return;
      const iframeData = e.data;

      try {
        if (iframeData.url) {
          this.iframeSrc = e.data.url;
          await this.$nextTick();
          this.recalcIframeStyle();
        }

        // iframe 내 첨부파일 뷰어
        if (iframeData.command === 'open-attach-file' && iframeData.file && iframeData.file.fileOriginalPath) {
          this.$hiClass.openAttachFile(iframeData.file);
          return;
        }

        if (iframeData.command === 'clickBtnAlarmplusIndexShare') {
          const { selectedTab } = iframeData.payload;
          this.shareAlarmplusIndexPage(selectedTab);
          return;
        } else if (iframeData.command === 'clickBtnTextPolicy') {
          this.openTermsView({ layerType: 'textPolicy' })
        } else if (iframeData.command === 'clickBtnPrivacyPolicy') {
          this.openTermsView({ layerType: 'privacyPolicy' })
        }

        if (
          iframeData === 'goto|home' ||
          iframeData === 'open|userSign'
        ) {
          const taskName = this.$comn.split(iframeData, '|');
          const functionName = this.$comn.split(iframeData, '|', 0);
          this[functionName](taskName);
        } else if (iframeData === 'applicationComplete') {
          await this.$router.push(`/main/alarmplus`);
        } else if (iframeData === 'deleteManagerComplete') {
          try {
            await this.loadSchools();
            await this.reloadAlarmplus();
          } catch (e) {
            this.$log.error(this.$options.name, 'loadSchools error', e);
          }
        }
      } catch (e) {
        this.$log.debug(e);
      }
    },
    handleResize() {
      const isiPad = this.isiPad();
      const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;

      // iPad나 모바일이면 강제로 사이드바 접힘 처리
      if (viewportWidth <= 768 || isiPad) {
        this.isSidebarCollapsed = true;
      } else {
        this.isSidebarCollapsed = viewportWidth <= 1340;
      }

      // 사이드바 상태와 isiPad 정보를 함께 전달해서 일관성 있는 계산 보장
      this.recalcIframeStyle(this.isSidebarCollapsed, isiPad, viewportWidth, window.innerHeight);
    },
    handleReload(e) {
      if (e.data === 'requestForReload') {
        this.$router.push(`/main/alarmplus`);
      }
    },
    detectIOS() {
      const ua = navigator.userAgent;
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      this.isIOS = isIOSDevice;
    },
    isiPad() {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
    },
    handleIframeScroll() {
      this.$log.debug('handleIframeScroll() window.scrollY:', window.scrollY);
      if (typeof window.scrollY === 'number') {
        this.iframe.top = window.scrollY;
      }
    },
    async onChangeSidebar(value) {
      this.activeSubmenu = value;

      const moveOnIframe = async (address) => {
        this.visibleComponent = 'iframe';
        await this.$nextTick();

        let iframeSrc = this.iframe.src;
        // if (this.iframe.src === `${process.env.VUE_APP_BASE_ALARM_PLUS_URI}/main/apply`) {
        //   iframeSrc = process.env.VUE_APP_BASE_ALARM_PLUS_URI
        // }

        this.$refs.iframeContent.src = `${iframeSrc}${address}`;
      };

      const showTimetable = () => {
        this.visibleComponent = 'timetable';
      };

      const showMyTimetable = () => {
        this.visibleComponent = 'my-timetable';
      };

      if (this.selectedSchoolId) {
        this.currentSchool = this.alarmPlusSchools.find((school) => school.schoolId === this.selectedSchoolId);
      }

      (
        ({
          'teacher-list': () => moveOnIframe(`/teacher/list?schoolId=${this.selectedSchoolId}`),
          'student-list': () => moveOnIframe(`/student/list?schoolId=${this.selectedSchoolId}`),
          'school-post': () => moveOnIframe(`/educationLetter/list?approvalStatus=CONSENT&schoolId=${this.selectedSchoolId}`),
          'school-timetable': showTimetable,
          'my-timetable': showMyTimetable,
          'post-link': () => moveOnIframe('/user/setting'),
          'append-school': () => moveOnIframe('/main/school/searchSchool'),
          'application-for-manager': () => moveOnIframe('/main/apply'),
          index: () => moveOnIframe(`/main/index?tab=${this.$route.query.tab}`),
        })[value] || (() => {})
      )();
    },
    async loadSchools() {
      const { data } = await this.$axios.get('/educationLetters/schools');
      const schools = data._embedded?.elSchools || [];
      await this.setAlarmPlusSchools(schools);
      this.recalcIframeStyle();
    },
    recalcIframeStyle() {
      const isiPad = this.isiPad();
      const hasSidebar = this.showLeftMenu;

      // 사이드바 넓이 계산 (아이패드거나 접힌 상태면 80, 아니면 240)
      const sidebarWidth = hasSidebar ? (this.isSidebarCollapsed || isiPad ? 80 : 240) : 0;

      // 뷰포트 크기에서 사이드바 너비 빼기 (px 단위)
      // const width = window.innerWidth - sidebarWidth;
      const height = window.innerHeight - 65; // 상단 바 높이 등 필요에 따라 조절

      this.iframe.style = {
        // width: `${width}px`,
        width: `calc(100vw - ${sidebarWidth}px)`,
        maxWidth: '100%',
        height: `${height}px`,
        position: 'relative',
        top: `${this.iframe.top}px`,
        border: 0,
      };
    },
    getRouteParam(route) {
      let param = route.params.menu || 'school-post';
      if (route.params.view === 'apply') {
        param = 'application-for-manager';
      }
      if (route.params.view === 'index') {
        param = 'index';
      }
      if (route.params.view === 'append-school') {
        param = 'append-school';
      }
      return param;
    },
    async checkTimetableRole() {
      if (!this.selectedSchoolId) {
        this.isMaster = false;
        this.isTeacher = false;
        return;
      }

      const api = new Timetables();
      const result = await api.getTimetableSchoolRoleRole(this.selectedSchoolId);
      const { isEditor, isTeacher } = result.data || {};
      this.isMaster = isEditor;
      this.isTeacher = isTeacher;
    },
    checkSchool() {
      if (!this.selectedSchoolId) return;

      if (this.alarmPlusSchools.length > 0) {
        const school = this.alarmPlusSchools.find((s) => s.schoolId === this.selectedSchoolId);
        if (!school) this.$router.push('/main');
      } else {
        this.$router.push('/main/alarmplus');
      }
    },
    deniedTimetable() {
      this.$hiClass
        .alert(`시간표 생성은 중등 학교의 '관리자' 권한으로 이용 가능합니다.<br>교직원 관리 메뉴에서 권한을 확인해주세요.`)
        .then(() => this.$router.push(`/main/alarmplus/schools/${this.selectedSchoolId}/teacher-list`));
    },
    async reloadAlarmplus() {
      this.alarmPlusSchools.length > 0
        ? await this.$router.push(`/main/alarmplus/schools/${this.alarmPlusSchools[0].schoolId}/school-post`)
        : await this.$router.push(`/main/alarmplus/index`);
    },
  },
};
</script>

<style lang="scss" scoped>
.content-area {
  display: flex;
  width: 100%;
}
.ios {
  .zoom-target {
    // transform: scale(0.8);
    transform-origin: top left;
    width: 100%;
    height: 100%;
  }
}
.daily-home,
.my-home {
  // flex: 1;
  // min-width: 1px;
  background-color: #fff;
  overflow: auto;
}
</style>
