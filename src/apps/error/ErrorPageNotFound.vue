<template>
  <div
    v-if="isShowTemplate"
    id="wrap"
    class="page-error"
  >
    <div id="cont-wrap">
      <div class="all-empty-cont-wrap">
        <div class="error-cont-wrap">

          <div class="logo-wrap">
            <img src="@/assets/img/logo_login.png" alt />
          </div>

          <template v-if="$route.query.err === '451'">
            <div class="popup-cont">
              <p>적절하지 못한 단어가 포함되어 있습니다.</p>
              <p>확인 후 다시 시도해주세요.</p>
            </div>
          </template>

          <template v-else>
            <div class="popup-cont">
              <p>죄송합니다.</p>
              <p>요청하신 페이지를 찾을 수 없습니다.</p>
              <p>잠시 후 다시 시도해주세요.</p>
              <br />
              <p>Error Code: {{ $route.query.err || '404' }}</p>
            </div>
          </template>

          <div
            v-if="!isMobile"
            class="btn-wrap"
          >
            <button
              class="btn-bg-w2"
              @click="goBack"
            >
              이전 페이지로 이동
            </button>
            <button
              class="btn-bg-c"
              @click="goHome"
            >
              홈으로 이동
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import MainSlb from '../main/MainSlb.vue'
import MobileDetect from 'mobile-detect'
import {mapMutations, mapState} from "vuex";

export default {
  name: 'error-page-not-found',
  components: {
    // MainSlb
  },
  data() {
    return {
      isMobile: true,
      isShowTemplate: true,
    }
  },
  computed: {
    ...mapState({
      isLoading: 'isLoading',
      isDimLoading: 'isDimLoading',
      isFileLoading: 'isFileLoading',
    })
  },
  beforeRouteEnter(to, from, next) {
    // 이 컴포넌트를 렌더링하는 라우트 앞에 호출됩니다.
    // 이 가드가 호출 될 때 아직 생성되지 않았기 때문에
    // `this` 컴포넌트 인스턴스에 접근 할 수 없습니다!
    next(vm => {
      // `vm`을 통한 컴포넌트 인스턴스 접근
      vm.$log.debug(
        vm.$options.name + ' beforeRouteEnter from path => ',
        from.path
      )

      if (from.path.includes('/login/auth/phone')) {
        vm.isShowTemplate = false
        const queryParam = vm.$authentication.load()
        if (queryParam.clientRegistrationId.toUpperCase() === 'ISCREAM') {
          vm.logoutTeacher()
        } else {
          vm.$authentication.clear()
          vm.$router.push('/', () => {})
        }
        return false
      }

      // 오류가 발생한 컴포넌트명이 share-post 인 경우 index 로 이동
      if (from.name === 'share-post') {
        vm.isShowTemplate = false
        vm.$authentication.clear()
        vm.$router.replace('/', () => {})
        return false
      }

      vm.isShowTemplate = true
    })
  },
  created() {
    const userAgent = navigator.userAgent
    const md = new MobileDetect(userAgent)
    this.isMobile = !!md.mobile();
  },
  mounted() {
    this.clearLoadings()
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading',
      setIsDimLoading: 'setIsDimLoading',
      setIsFileLoading: 'setIsFileLoading',
    }),
    goBack() {
      this.$router.go(-1)
    },
    goPage(path) {
      this.$router.push(path)
    },
    goHome() {
      this.$router.push('/logout', () => {})
    },
    logoutTeacher() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port
      let callbackUrl =
        domainUrl + process.env.VUE_APP_BASE_LOGOUT_CALLBACK_PARAMETER_SUFFIX

      window.location.href = process.env.VUE_APP_BASE_ISCREAM_OAUTH2_URI +
          process.env.VUE_APP_BASE_LOGIN_ISCREAM_SSO_LOGOUT_PATH +
          process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
          encodeURIComponent(callbackUrl)
    },
    clearLoadings() {
      if (this.isLoading) {
        this.setIsLoading(false)
      }
      if (this.isDimLoading) {
        this.setIsDimLoading(false)
      }
      if (this.isFileLoading) {
        this.setIsFileLoading(false)
      }
    }
  },
}
</script>

<style scoped></style>
