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
import jwt_decode from "jwt-decode";

export default {
  name: 'login-offerwall-callback',
  components: {
    MainLoadingNewTab
  },
  data: () => ({
    userType: {ADVERTISER: '광고주'},
    isUsed: '',
    isMainLoadingNewTab: true,
    callbackUrl: '',
    queryParam: null,
    userInfo: null,
    icecreamIpList: [],
    ipList: [],
    companyId: '',
    companyName: ''
  }),
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
  },
  async created() {
    sessionStorage.removeItem('userCertificationId')

    await this.validateQuery()
        .then(this.existsUserCheck)
        .catch(this.logout)
  },
  mounted() {
  },
  methods: {
    ...mapActions({
      createUserLogs: 'createUserLogs',
    }),
    isEmpty(value) {
      return value === null || value === undefined || value === 'undefined' || value === ''
    },
    async isExists(value) {
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
    async existsUserCheck() {
      this.queryParam = this.$route.query
      /**
       * userType request parameter key 가 2개 이상으로 배열처리된 경우
       */
      this.$log.warn(this.$options.name, `this.queryParam.userType:`, this.queryParam.userType)
      if (Array.isArray(this.queryParam.userType)) {
        const filteredUserTypes = this.queryParam.userType.filter(u => u !== null)
        this.queryParam.userType = filteredUserTypes[0]
      }

      const isUserId = await this.isExists(this.queryParam.uuid);
      if (isUserId) {
        try {
          const isPass = await this.loginProc();
          (isPass) ? this.goRouteAdvertiser() : this.logout();
        } catch (e) {
          this.$hiClass.alert('로그인에 실패했습니다.<br>다시 한번 확인해주세요.')
              .then(this.logout)
        }
      }
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
    logout() {
      if (this.queryParam && this.queryParam.idToken) this.$authentication.save(this.queryParam)
      this.$router.push('/logout/offerwall', () => {})
    },
    async loginProc() {
      const decoded = jwt_decode(this.queryParam.idToken);
      this.companyId = decoded.companyId;
      this.companyName = decoded.companyName;

      try {
        const res = await this.getUser();
        this.userInfo = res.data;

        const [isValid, message] = await this.validate();

        if (isValid) {
          await this.setUserInfo();

          // 사용자 접속 이력 등록
          this.createUserLogs({
            userUri: this.userInfo._links.self.href
          });

          return true;
        }

        await this.$hiClass.alert(message);
        return false;
      } catch (error) {
          this.$log.error(error)
          try {
            if (this.isResponseNotFound(error)) {
              // 페이지 이동 전 토큰 저장
              this.$authentication.save(this.queryParam)
              this.$log.debug('회원을 찾을 수 없습니다')
              this.logout();

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
      }
    },
    async getIpFile() {
      return axios({
        method: 'GET',
        url: `${this.$apiUrl}/advertiser/acls/${this.companyId}`,
        headers: {
            Authorization: "Bearer " + this.queryParam.idToken,
        },
      });
    },
    async getIpList(companyId) {
      try {
        const res = await this.getIpFile();
        if (!res.data) {
          return;
        }
        
        for (const data of res.data.companies) {
          if (data.companyId === 'ICECREAM') {
            data.ipList.forEach((ip,idx) => {
              this.icecreamIpList.push(ip);
            });
          }

          if (data.companyId === companyId) {
            this.isUsed = data.isUsed;
            data.ipList.forEach((ip,idx) => {
              this.ipList.push(ip);
            });
          }
        }
      } catch (e) {
        this.$hiClass.alert('ip정보를 가져오지못했습니다.', 'warning', false)
      }
    },

    async validate() {
      if (this.isDeactivatedUser()) {
        return [false, '사용이 중지된 계정입니다.'];
      }

      if (this.userInfo.userType !== 'ADVERTISER') {
        return [false, '광고주 계정이 아닙니다.'];
      }

      const ipRes = await this.$hiClass.offerwall.readIpList(this.queryParam.idToken);
      const clientIp = ipRes.data.ip;
      await this.getIpList(this.companyId);

      if (this.hasAccessPermission(clientIp)) {
        return [true, 'success'];
      }

      if (!this.isUsed) {
        return [false, '광고 운영이 종료되어 사용이 불가합니다. 하이클래스 관리자에게 문의해주세요.']
      }

      if (!this.isValidIP(clientIp)) {
        return [false, '허용되지 않은 IP 입니다.'];
      }

      return [true, 'success'];
    },

    isValidIP(clientIp) {
      return this.ipList.includes(clientIp);
    },

    // 관리자가 임시 접속 시 접근 허용
    hasAccessPermission(clientIp) {    
      return this.icecreamIpList.includes(clientIp);
    },

    isDeactivatedUser() {
      return this.userInfo.userStatus === this.CONSTANTS.USER_STATUS.DEACTIVATE
    },

    isResponseNotFound(error) {
      return error.response.status === 404 || error.message.includes('404')
    },

    isResponseUnauthorized(error) {
      return error.response.status === 401 || error.message.includes('401')
    },

    async setUserInfo() {
      this.$store.commit('setUserUri', this.userInfo._links.self.href)
      this.$store.commit('setUserType', this.userInfo.userType)
      this.$store.commit('setUser', this.userInfo)

      // localStorage add userType
      localStorage.setItem('companyId', this.companyId);
      localStorage.setItem('companyName', this.companyName);
      this.$authentication.save(this.queryParam);
    },
    async check2fa() {
      try {
        const res = await axios({
          method: 'get',
          url: `${this.$apiUrl}/advertiser/2fa/valid`,
          headers: {
            Authorization: `Bearer ${this.queryParam.idToken}`
          }
        });
        return res?.data?.is2fa === true;
      } catch (error) {
        console.error('2FA 확인 중 오류:', error); // 오류 발생 2차 인증
        return false;
      }
    },
    async goRouteAdvertiser() {
      const is2fa = await this.check2fa();
      if(is2fa === true) {
        this.$router.push('/offerwall', () => {})
      } else {

        const authentication =  this.$authentication.load()
        const userTypeLowerCase = authentication.userType.toLowerCase()

        this.$router.push({
          path: '/offerwall/auth/sms2fa',
          query: {
            userType: userTypeLowerCase
          }
        })
      }
    },
  },
}
</script>

<style scoped></style>
