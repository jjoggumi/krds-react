<template>
  <div>
    <!-- logon -->
    <MainLoadingNewTab v-if="isMainLoadingNewTab"></MainLoadingNewTab>
  </div>
</template>

<script>
import MainLoadingNewTab from '../main/MainLoadingNewTab.vue'
import axios from 'axios'
import {mapActions, mapGetters} from "vuex";
import { useElectronController } from '@/apps/hitalk/utils'
const electronController = useElectronController();

export default {
  name: 'login-callback',
  components: {
    MainLoadingNewTab
  },
  data: () => ({
    userSns: {
      KAKAO: '카카오톡',
      NAVER: '네이버',
      GOOGLE: '구글',
      APPLE: '애플',
      GNE: '경남교육청',
      ISCREAM: '아이스크림',
      HICLASS: '하이클래스'
    },
    userType: {TEACHER: '선생님', PARENTS: '학부모', STUDENT: '학생', ADMIN: '관리자'},
    loginChoiceSnsTypes: ['KAKAO', 'NAVER', 'GOOGLE', 'APPLE'],
    isMainLoadingNewTab: true,
    callbackUrl: '',
    queryParam: null,
    userInfo: null
  }),
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    kakao() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_KAKAO_PATH +
        this.callbackUrl
      )
    },
    naver() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_NAVER_PATH +
        this.callbackUrl
      )
    },
    google() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_GOOGLE_PATH +
        this.callbackUrl
      )
    },
    gne() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_GNE_PATH +
        this.callbackUrl
      )
    },
    iscream() {
      return (
        process.env.VUE_APP_BASE_LOGIN_URI +
        process.env.VUE_APP_BASE_LOGIN_ISCREAMMEDIA_PATH +
        this.callbackUrl
      )
    },
    isAdmin() {
      return this.userInfo && this.userInfo.userType === 'ADMIN'
    },
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

      if (from.path.includes('/login/choice')) {
        vm.$router.push('/logout', () => {})
      }
    })
  },
  async created() {
    if (this.processForExceptionalLoginCallback()) return
    sessionStorage.removeItem('userCertificationId')

    await this.validateQuery()
      .then(this.existsUserCheck)
      .catch(this.logout)
  },
  methods: {
    ...mapActions({
      createUserLogs: 'createUserLogs',
    }),
    isEmpty(value) {
      return value === null || value === undefined || value === 'undefined' || value === ''
    },
    isExists(value) {
      return !this.isEmpty(value)
    },
    validateQuery() {
      const queryParam = this.$route.query
      const validateKeys = ['uuid', 'idToken', 'clientRegistrationId', 'userType']
      const existsValue = (key) => this.isExists(queryParam[key])

      return new Promise((resolve, reject) => {
        this.$log.warn(this.$options.name, 'validateKeys.every(existsValue)', validateKeys.every(existsValue))

        validateKeys.every(existsValue)
          ? resolve(true)
          : reject(false)
      })
    },
    existsUserCheck() {
      this.queryParam = this.$route.query
      /**
       * userType request parameter key 가 2개 이상으로 배열처리된 경우
       */
      this.$log.warn(this.$options.name, `this.queryParam.userType:`, this.queryParam.userType)
      if (Array.isArray(this.queryParam.userType)) {
        const filteredUserTypes = this.queryParam.userType.filter(u => u !== null)
        this.queryParam.userType = filteredUserTypes[0]
      }

      const isUserId = new Promise((resolve, reject) => {
        this.isExists(this.queryParam.uuid) ? resolve(true) : reject(false)
      })

      isUserId
          .then(this.loginProc)
          .catch(() => {
            this.$hiClass.alert('로그인에 실패했습니다.<br>다시 한번 확인해주세요.')
                .then(this.logout)
            return false
          });
    },
    getUser() {
      // 공통 axios 의 401 error 토큰 갱신 처리하지 않음
      return axios({
        methods: 'get',
        url: `${this.$apiUrl}/users/${this.queryParam.uuid}`,
        headers: {
          Authorization: `Bearer ${this.queryParam.idToken}`
        }
      })
    },
    setLoginCallbackUrl() {
      this.callbackUrl =
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
        window.location.origin +
        process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_SUFFIX
    },
    socialButtonClick() {
      const userSns = this.userInfo.userSns.toLowerCase()
      const param = '?userType=' + this.userInfo.userType
      location.href = this[userSns] + param
    },

    logout() {
      // 로그아웃 페이지 이동 전 발급받은 토큰 저장
      if (this.queryParam && this.queryParam.idToken) this.$authentication.save(this.queryParam)
      this.$router.push('/logout', () => {})
    },

    async loginProc() {

      await this.getUser()
        .then(async res => {
          this.userInfo = res.data

          if (await this.validate()) {
            this.setUserInfo();

            // 사용자 접속 이력 등록
            this.createUserLogs({
              userUri: this.userInfo._links.self.href
            });

            this.setDtrumIdentifyUser();

            if (!sessionStorage.getItem('redirectUrl')) {
              this.goRouteMain();
              return;
            }
            const { url, expiresAt } = JSON.parse(sessionStorage.getItem('redirectUrl'));
            sessionStorage.removeItem('redirectUrl');
            Date.now() < expiresAt ? this.$router.push(url).then() : this.goRouteMain();
          }
          })
          .catch(error => {
            this.$log.error(error)

          // 임시 학생 계정 인증에 실패한 경우 로그아웃
          if (this.isTempStudent()) {
            this.$hiClass.alert('회원을 찾을 수 없습니다.<br>아이디, 패스워드를 확인해 주세요.')
              .then(this.logout)
            return false
          }

          // 사용자 계정 브릿지 페이지로 이동 처리
          try {

            if (this.isResponseNotFound(error)) {
              // 페이지 이동 전 토큰 저장
              this.$authentication.save(this.queryParam)

              this.$log.debug('회원을 찾을 수 없습니다')
              const snsType = this.queryParam.clientRegistrationId ? this.queryParam.clientRegistrationId.toUpperCase() : null

              /**
               * 소셜 로그인 : 브릿지 or 재인증 페이지로 이동
               * 기타 로그인 : 회원가입 페이지로 이동
               */

              if (this.loginChoiceSnsTypes.includes(snsType)) {

                this.hiClass.userCertifications.read()
                  .then(res => {
                    this.userCertifications = res.data

                    switch (this.userCertifications.resultCode) {
                      case 'EXIST':
                        sessionStorage.setItem('userCertificationId', this.userCertifications.userId)
                        this.goRouteRecertification()
                        break
                      case 'NOT_EXIST':
                        sessionStorage.removeItem('userCertificationId')
                        this.goRouteChoice()
                        break
                    }
                  })
                  .catch(err => {
                    this.$hiClass.alert(err)
                    sessionStorage.removeItem('userCertificationId')
                    this.goRouteChoice()
                  })

              } else {
                this.goRouteSignUp()
              }

            } else if (this.isResponseUnauthorized(error)) {
              this.$hiClass.alert('토큰이 만료되었습니다.', 'error')
                .then(this.logout)

            } else {
              throw new Error(error)
            }

          } catch (err) {
            this.$log.warn(`회원 확인 에러 => `, err)
            const routeObj = {
              path: '/errorPage',
              query: {
                err: String(error)
              }
            }
            this.$router.push(routeObj, () => {})
          }
        })
    },

    async validate() {
      if (this.isDeactivatedUser()) {
        this.$hiClass.alert('탈퇴된 계정입니다.')
            .then(this.logout)
        return false

      } else if (this.isFindOtherAccount()) {
        try {
          return await this.findOtherAccountProc()
        } catch (e) {
          // 오류 발생 시 index 페이지로 이동
          this.$log.error(e)
          this.logout()
        }
        return false
      } else {
        return true
      }
    },

    isDeactivatedUser() {
      return this.userInfo.userStatus === this.CONSTANTS.USER_STATUS.DEACTIVATE
    },

    isTempStudent() {
      return this.queryParam.clientRegistrationId.toUpperCase() === 'HICLASS' &&
        this.queryParam.userType === 'STUDENT'
    },

    isResponseNotFound(error) {
      return error.response.status === 404 || error.message.includes('404')
    },

    isResponseUnauthorized(error) {
      return error.response.status === 401 || error.message.includes('401')
    },

    isFindOtherAccount() {
      return this.userInfo.userStatus === 'ACTIVATE' && this.userInfo.userType !== this.queryParam.userType
    },

    findOtherAccountProc() {
      const msg = `해당 소셜 계정은 '${this.userType[this.userInfo.userType]}'으로(로) 가입된 이력이 있습니다.<br>'${this.userType[this.userInfo.userType]}'으로(로) 로그인 하시겠습니까?'`
      const adminMsg = '관리자 계정은 하이클래스 서비스를 이용할 수 없습니다. 사용자 계정으로 로그인 해주세요.'

      if (this.isAdmin) {
        return new Promise((resolve, reject) => {
          this.$hiClass.alert(adminMsg, 'warning')
            .then(() => reject('login cancel'))
        })
      }

      return new Promise((resolve, reject) => {
        this.$hiClass.confirm(msg, 'info')
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject('confirm cancel')
          })
      })
    },

    setUserInfo() {
      this.$store.commit('setUserUri', this.userInfo._links.self.href)
      this.$store.commit('setUserType', this.userInfo.userType)
      this.$store.commit('setUser', this.userInfo)

      // localStorage add userType
      this.queryParam.userType = this.userInfo.userType
      this.$authentication.save(this.queryParam)
    },

    setDtrumIdentifyUser() {
      /**
       * ========================================================
       * dynatrace monitoring
       *  at user login
       */
      try {
        const identifyUserId =
          this.userInfo.userSns.toLowerCase() === 'hiclass' ||
          this.userInfo.userSns.toLowerCase() === 'iscream'
            ? this.userInfo.loginId || this.queryParam.uuid
            : this.queryParam.uuid

        dtrum.identifyUser(identifyUserId)

      } catch (error) {
        this.$log.debug('dtrum.identifyUser error => ' + error)
      }
      // ========================================================
    },

    goRouteSignUp() {
      this.$router.push('/login/auth/phone', () => {})
    },

    goRouteChoice() {
      sessionStorage.setItem('selectedUserType', this.queryParam.userType);
      this.$router.push('/login/choice', () => {})
    },

    goRouteRecertification() {
      this.$router.push('/login/recertification', () => {})
    },

    goRouteMain() {
      const main = electronController.isUnderElectron() ? '/hitalk' : '/main'
      this.$router.push(main, () => {
      })
    },

    processForExceptionalLoginCallback() {
      if (!sessionStorage.getItem('exceptionalLoginCallback')) return false
      const exceptionalLoginCallback = JSON.parse(sessionStorage.getItem('exceptionalLoginCallback'))
      if (exceptionalLoginCallback) {
        sessionStorage.removeItem('exceptionalLoginCallback')
        const query = document.location.search.substring(1);
        const redirectURI = exceptionalLoginCallback.redirectURI;
        const join = redirectURI.includes('?') ? '&' : '?'
        window.location.href = `${redirectURI}${join}${query}`
        return true
      }
      return false
    }
  },
}
</script>

<style scoped></style>
