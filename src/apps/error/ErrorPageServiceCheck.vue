<template>
  <!-- prettier-ignore -->
  <div id="wrap" class="page-error">
    <div id="cont-wrap">
      <div class="all-empty-cont-wrap">
        <div class="error-cont-wrap">
          <div class="logo-wrap">
            <img src="@/assets/img/logo_login.png" alt="" />
          </div>

          <img
            :src="checkServiceUrl"
            alt=""
            @error="errorHandler"
          />
          

          <!-- capture -->
          <!-- <div class="popup-cont">
            <p class="ft-caution mb-30">
              하이클래스 서비스 점검 안내
            </p>
            <p class="ft-basic">- 일시 : {{ checkServiceDate }} 00시 ~ 06시</p>
            <p class="ft-basic mb-10">- 내용 : 하이클래스 정기점검</p>
            <br />
            <p class="ft-basic">점검 시간 동안 하이클래스 이용이 제한됩니다.</p>
            <p class="ft-basic">보다 안정적인 서비스를 제공해드리기 위해 꼭 필요한 작업이오니</p>
            <p class="ft-basic">조금 불편하시더라도 너그러운 양해를 부탁드립니다.</p>
            <p>* 점검시간은 작업 진행에 따라 단축 또는 연장될 수 있습니다.</p>
          </div> -->
          <!-- // capture -->


          <!-- sample -->
          <!-- <div class="popup-cont">
            <p class="ft-caution mb-30">
              하이클래스 서비스 점검 안내
            </p>
            
            <img
              src="@/assets/img/img_servicecheck.png?ver=20200418"
              alt=""
            />
            
            <p class="ft-basic">- 일시 : 2020년 6월 26일 (금) 00시 ~ 06시</p>
            <p class="ft-basic mb-10">- 내용 : 하이클래스 전체 DB 업데이트</p>
            <br />
            <p class="ft-basic">점검 시간 동안 하이클래스 이용이 제한됩니다.</p>
            <p class="ft-basic">보다 안정적인 서비스를 제공해드리기 위해 꼭 필요한 작업이오니</p>
            <p class="ft-basic">조금 불편하시더라도 너그러운 양해를 부탁드립니다.</p>
            <p>* 점검시간은 작업 진행에 따라 단축 또는 연장될 수 있습니다.</p>            
            
            <p class="ft-basic ft-blod mt-30">
              서비스 점검 중에도 출석체크는 가능합니다.
            </p>
            
            <div class="btn-wrap">
              <button
                class="btn-bg-c"
                @click="
                  goNewPage('https://check.hiclass.net/attendance/tempAttendance')
                "
              >
                출석하러가기
              </button>
            </div>
          </div> -->
          <!-- // sample -->

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MobileDetect from 'mobile-detect'

export default {
  name: 'ErrorPageServerCheck',
  components: {
    // MainSlb
  },
  props: {
    url: String
  },
  data() {
    return {
      isMobile: true,
      isError: false
    }
  },
  computed: {
    checkServiceDate() {
      return this.$moment('20200626').format('YYYY[년] M[월] D[일] (ddd)')
    },
    checkServiceUrl() {
      // let url = `https://download.hiclass.net/static/notices/pop_service_check_web.png?ver=${this.$moment().format(
      //   'YYYYMMDDHHmm'
      // )}`

      // if (this.isError) {
      //   url = `https://download.hiclass.net/static/notices/pop_service_check_web_test.png?ver=${this.$moment().format(
      //     'YYYYMMDDHHmm'
      //   )}`
      // }

      return this.url
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    goPage(path) {
      this.$router.push(path)
    },
    goHome() {
      this.$router.push('/logout', () => {})
    },
    goNewPage(path) {
      window.open(path, '_blank')
    },
    logoutTeacher() {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = this.$comn.getLocationPort()
      const domainUrl = protocol + '//' + hostname + port
      let callbackUrl =
        domainUrl + process.env.VUE_APP_BASE_LOGOUT_CALLBACK_PARAMETER_SUFFIX

      let routePath =
        process.env.VUE_APP_BASE_ISCREAM_OAUTH2_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAM_SSO_LOGOUT_PATH +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        encodeURIComponent(callbackUrl)

      window.location.href = routePath
    },
    errorHandler() {
      this.isError = true
    }
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
        const queryParam = vm.$authentication.load()
        alert(queryParam.clientRegistrationId)
        if (queryParam.clientRegistrationId.toUpperCase() === 'ISCREAM') {
          vm.logoutTeacher()
        } else {
          vm.$authentication.clear()
          vm.$router.push('/', () => {})
        }
      }
    })
  },
  created() {
    const userAgent = navigator.userAgent
    const md = new MobileDetect(userAgent)
    if (md.mobile()) this.isMobile = true
    else this.isMobile = false

    this.$authentication.clear()
  },
  mounted() {
    this.$authentication.clear()
  }
}
</script>

<style scoped></style>
