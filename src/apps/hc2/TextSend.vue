<template>
  <div class="content-area">
    <text-main
      v-if="!isShowIndex"
      class="text-send"
      :route="JSON.stringify(curRoute)"
      :authorities="JSON.stringify(textAuthorities)"
      :style="iframe.style"
    />

    <div v-else-if="isShowIndex" class="zoom-target p-0 border-0 m-0" :style="zoomStyle">
      <iframe ref="iframeContent" id="iframeContent" :src="iframe.src" @load="iframeLoaded" :style="iframe.style"></iframe>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import AlarmplusMixin from '@/apps/alarmplus/mixins/AlarmplusMixin.vue';
import ReactStyle from '@/apps/hc2/mixins/reactStyle';
export default {
  name: 'TextSend',
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
      isShowIndex: false,
      curRoute: {
        menu: 'send',
        schoolId: '',
        query: {}
      },
    };
  },
  mixins: [ AlarmplusMixin, ReactStyle ],
  watch: {
    $route: {
      async handler(to, from) {
        const { menu, schoolId } = to.params;

        const isValid = await this.validateRoute({ menu, schoolId });
        if (!isValid) {
          this.showNoPermissionAlert();
          return;
        }

        const query = to.query;
        this.curRoute.menu = menu;
        this.curRoute.schoolId = schoolId;
        this.curRoute.query = query;
      }
    },
    // index(iframe) 화면 여부가 바뀌는 경우 body 클래스도 동기화
    isShowIndex(val) {
      this.$hiClass?.toggleBodyClass(val ? 'add' : 'remove', 'iframeShow');
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeSchool', ['textAuthorities']),
    ...mapGetters('storeSchool', ['getFirstPermissibleSchool', 'hasTextAuthorityPermission']),
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
  },
  async created() {
    if (this.user.userType !== 'TEACHER') {
      await this.$router.push('/main');
      return;
    }

    window.addEventListener('message', this.handleIframeTask);
    this.iframe.src = `${process.env.VUE_APP_BASE_ALARM_PLUS_URI}/main/index?tab=text`;

    const { view, menu, schoolId } = this.$route.params;

    if (view === 'index' && this.textAuthorities.length === 0) {
      this.isShowIndex = true;
      return;
    }

    if (view === 'school' && !schoolId) {
      await this.$router.push('/main');
      return;
    }
    this.applyStyle()

    if (view === 'index' && this.textAuthorities.length > 0) {
      const authority = this.getFirstPermissibleSchool('send');
      if (authority) {
        await this.$router.push({
          path: `/main/text/schools/${authority.schoolId}/send`
        });
      } else {
        this.showNoPermissionAlert();
      }
      return;
    }

    const isValid = await this.validateRoute({ menu, schoolId });
    if (!isValid) {
      this.showNoPermissionAlert();
      return;
    }

    this.curRoute.menu = menu;
    this.curRoute.schoolId = schoolId;
    this.curRoute.query = this.$route.query;
  },
  mounted() {
    this.setVheight(); // 초기 높이 설정
    this.boundSetVh = this.setVheight.bind(this); // this 바인딩

    window.addEventListener('resize', this.boundSetVh);
    window.addEventListener('react-route-change', this.handleReactNavigate);
    window.addEventListener('handle-hc2-text-event', this.handleReactEvent);

    // isShowIndex(iframe 화면)일 때 body에 iframe class 부여
    // - 기존 hidden/paddingRight는 지양하여 주석 처리된 상태 유지
    if (this.isShowIndex) {
      this.$hiClass?.toggleBodyClass('add', 'iframeShow');
    } else {
      this.$hiClass?.toggleBodyClass('remove', 'iframeShow');
    }

    // 페이지 body 에 hidden, paddingRight 스타일 지양
    // if (this.isShowIndex) {
    //   this.$hiClass.toggleBodyClass('add', 'hidden');
    //   document.body.style.paddingRight = '0';
    //   return;
    // }

    setTimeout(() => {
      document.documentElement.classList.add('hc2', 'text-root');
    }, 0);
  },
  beforeDestroy() {
    this.removeStyle();

    document.documentElement.classList.remove('hc2', 'text-root');
    // 페이지 종료 시 body iframe class 정리
    this.$hiClass?.toggleBodyClass('remove', 'iframe');
    // 페이지 body 에 hidden, paddingRight 스타일 지양
    // this.$hiClass.toggleBodyClass('remove', 'hidden');

    window.removeEventListener('resize', this.boundSetVh); // 바인딩된 함수 제거
    window.removeEventListener('react-route-change', this.handleReactNavigate);
    window.removeEventListener('handle-hc2-text-event', this.handleReactEvent);
    window.removeEventListener('message', this.handleIframeTask);
  },
  methods: {
    ...mapActions(['openTermsView', 'triggerAnalyticsLogEvent']),
    ...mapActions('storeSchool', ['loadTextAuthorities']),
    isChrome() {
      const ua = navigator.userAgent;
      return /Chrome/.test(ua) && !/Edge|OPR/.test(ua);
    },
    setVheight() {
      this.recalcIframeStyle();
      this.setVh()
    },

    async handleRoute(path, query = {}) {
      await this.$router.push({
        path: path,
        query: query
      });
    },
    
    async handleReactNavigate(event) {
      const { menu, schoolId, query, routePath, reloadAuthorities } = event.detail;

      if (menu === null && routePath) {
        await this.handleRoute(routePath, query);
        return;
      }

      const isValid = await this.validateRoute({ menu, schoolId: schoolId || this.curRoute.schoolId });
      if (!isValid) {
        this.showNoPermissionAlert();
        return;
      }

      if (reloadAuthorities) {
        await this.loadTextAuthorities();
      }

      let routeMenu = this.curRoute.menu;
      let routeSchoolId = this.curRoute.schoolId;
      let routeQuery = query ? query : {};

      if (menu) routeMenu = menu;
      if (schoolId) routeSchoolId = schoolId;

      const from = { path: this.$route.path, query: this.$route.query };
      const to = {
        path: `/main/text/schools/${routeSchoolId}/${routeMenu}`,
        query: routeQuery,
      };

      if (from.path === to.path && _.isEqual(from.query, to.query)) {
        return;
      }

      await this.$router.push(to);
    },
    handleReactEvent(event) {
      const { command, eventData } = event.detail;

      const commandFn = {
        'showTerms': () => this.openTermsView({ layerType: eventData.layerType }),
        'triggerAnalytics': () => this.triggerAnalyticsLogEvent({
          code: eventData.GACode,
          params: eventData.params,
        })
      }[command];

      if (commandFn) commandFn();
    },
    iframeLoaded() {
      const queryParam = this.$authentication.load();
      const loginInfoJson = {
        uuid: queryParam.uuid,
        idToken: queryParam.idToken,
        refreshToken: queryParam.refreshToken,
      };

      this.$refs.iframeContent.contentWindow.postMessage(loginInfoJson, '*');

      this.recalcIframeStyle();
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

        if (iframeData.command === 'clickBtnAlarmplusIndexShare') {
          const { selectedTab } = iframeData.payload;
          this.shareAlarmplusIndexPage(selectedTab);
        } else if (iframeData.command === 'clickBtnTextPolicy') {
          this.openTermsView({ layerType: 'textPolicy' })
        } else if (iframeData.command === 'clickBtnPrivacyPolicy') {
          this.openTermsView({ layerType: 'privacyPolicy' })
        }
      } catch (e) {
        this.$log.debug(e);
      }
    },
    recalcIframeStyle() {
      const height = window.innerHeight - 67;

      this.iframe.style = {
        width: `100vw`,
        maxWidth: '100%',
        height: `${height}px`,
        position: 'relative',
        top: `${this.iframe.top}px`,
        border: 0,
      };
    },
    validateRoute({ menu, schoolId }) {
      return Promise.resolve(this.hasTextAuthorityPermission(schoolId, menu));
    },
    showNoPermissionAlert() {
      this.$hiClass.alert('문자 서비스 사용 권한이 없습니다.<br>학교 소유자에게 문의해주세요.').then(() => {
        this.$router.push('/main');
      })
    }
  },
};
</script>
<style scoped>
.text-send {
  width: 100%;
  display: block;
}
</style>
