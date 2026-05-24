<template>
  <div class="offerwall-wrap bg-light">
    <LoginOfferwallHeader
        :companyName="companyInfo.companyName"
        :isShow="isShow"
    />
    <router-view
        :companyInfo="companyInfo"
        :isShow="isShow"
    />
  </div>
</template>

<script>
import LoginOfferwallHeader from "@/apps/login/LoginOfferwallHeader.vue";
import '@/assets/css/offerwall.scss';
import { mapActions } from 'vuex'
import axios from "axios";

export default {
  name: 'OfferwallMain',
  components: {LoginOfferwallHeader},
  computed: {
    loggedIn () {
      return localStorage.getItem('idToken') !== null;
    }
  },
  data() {
    return {
      companyInfo: {
        companyId: localStorage.getItem('companyId'),
        companyName: localStorage.getItem('companyName')
      },
      inactiveTime: 600000, // 600000 10분
      inactiveTimer: null,
      isShow: false,
    }
  },
  mounted () {
    // 페이지 변경시 로그아웃 체크
    this.checkLogout();
    const loggedIn = this.loggedIn;
    (loggedIn) ? this.init() : this.redirectToLogin();
  },
  unmounted() {
    this.removeInactivityTracking();
    clearTimeout(this.inactiveTimer);
    this.isShow = false;
  },
  methods: {
    ...mapActions(['triggerAnalyticsLogEvent']),
    ...mapActions({
      isAllDeviceLogout: 'isAllDeviceLogout'
    }),
    init() {
      this.isShow = true;
      this.setupInactivityTracking();
      this.inactiveTimer = setTimeout(this.logout, this.inactiveTime);
      this.setupCheckLogoutTracking();
      // check 2fa only once
      this.check2fa();
    },
    redirectToLogin () {
      const hiClass = process.env.VUE_APP_BASE_LOGIN_URI +
          process.env.VUE_APP_BASE_LOGIN_ADVERTISER_PATH
      window.location.href = hiClass + '?userType=ADVERTISER'
    },
    resetTimer() {
      clearTimeout(this.inactiveTimer)
      this.inactiveTimer = setTimeout(this.logout, this.inactiveTime)
    },
    setupInactivityTracking() {
      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
      events.forEach(event => {
        window.addEventListener(event, this.resetTimer)
      })
    },    
    setupCheckLogoutTracking() { // 클릭시 마다
      const events = ['click']
      events.forEach(event => {
        window.addEventListener(event, this.checkLogout)
      })
    },
    removeInactivityTracking() {
      const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
      events.forEach(event => {
        window.removeEventListener(event, this.resetTimer)
      })
    },
    logout() {
      this.$hiClass.alert('10분간 활동이 없어 자동 로그아웃 되었습니다.')
          .then(() => {
            this.$router.push('/logout/offerwall');
          });
    },
    async checkLogout() {
      const uuid = localStorage.getItem('uuid');
      if(!this.loggedIn || !uuid || uuid === 'undefined') return; // 로그인 되어 있을 때만 확인
      const deviceRes = await this.isAllDeviceLogout(false);
      if(deviceRes) {
        this.$hiClass.alert('접속 정보 변경으로 로그아웃 되었습니다.')
          .then(() => {
            this.$router.push('/logout/offerwall', () => {});
          });
      }
    },
    async check2fa() {
      const idToken = localStorage.getItem('idToken');
      if(!idToken || idToken === 'undefined') {
        // 로그인 되어 있을 때만 확인. 없으므로 로그아웃 처리
        this.$router.push('/logout/offerwall', () => {});
      }
      // 2차 인증 했는 지 확인
      try {
        await axios({
          method: 'get',
          url: `${this.$apiUrl}/advertiser/2fa/valid`,
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }).then(res => {
          if(!res.data || res.data.is2fa === false) {
            const authentication =  this.$authentication.load()
            const userTypeLowerCase = authentication.userType.toLowerCase()
            this.$router.push({
              path: '/offerwall/auth/sms2fa',
              query: {
                userType: userTypeLowerCase
              }
            })
          }
        })
      } catch (error) {
        console.error('2FA 확인 중 오류:', error); // 오류 발생 2차 인증
        this.$router.push('/logout/offerwall');
      }
    },
  }
}
</script>

<style lang="scss">

</style>