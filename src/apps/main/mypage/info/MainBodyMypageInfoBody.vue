<template>
  <div class="privacy-info-cont-wrap">
    <MainBodyMypageInfoBodyProfile
      :user="user"
      :isTempStudent="isTempStudent"
      key="my-page-info-body-profile"
      @setUserDataByParams="setUserDataByParams"
      @openAuthMobilePhone="openAuthMobilePhone"
    ></MainBodyMypageInfoBodyProfile>

    <MainBodyMypageInfoBodyProfileMulti></MainBodyMypageInfoBodyProfileMulti>

    <MainBodyMypageInfoBodySign
      :user="user"
    ></MainBodyMypageInfoBodySign>

    <MainBodyMypageInfoBodyAccount :user="user"></MainBodyMypageInfoBodyAccount>

    <MainBodyMypageInfoBodyTerms :user="user" @setUserDataByParams="setUserDataByParams"></MainBodyMypageInfoBodyTerms>

    <!-- 민감정보 수집 및 이용동의-->
    <MainBodyMypageInfoBodySensitiveAgree />

    <div class="leave-wrap">
      <span>하이클래스를 더 이상 이용하지 않는다면</span>
      <a href="javascript:void(0)" @click="callCloseAccount">
        <span>서비스 탈퇴 바로가기</span>
      </a>
    </div>

    <MainBodyMypageInfoBodyAuthMobilePhone
      v-if="isShowAuthMobilePhone"
      :user="user"
      :isShowAuthMobilePhone="isShowAuthMobilePhone"
      @closeAuthMobilePhone="closeAuthMobilePhone"
      @setUserDataByParams="setUserDataByParams"
    ></MainBodyMypageInfoBodyAuthMobilePhone>
  </div>
</template>

<script>
import {mapActions} from "vuex";
import MainBodyMypageInfoBodyProfile from "./MainBodyMypageInfoBodyProfile.vue";
import MainBodyMypageInfoBodyProfileMulti from "./MainBodyMypageInfoBodyProfileMulti.vue";
import MainBodyMypageInfoBodySign from "./MainBodyMypageInfoBodySign.vue";
import MainBodyMypageInfoBodyAccount from "./MainBodyMypageInfoBodyAccount.vue";
import MainBodyMypageInfoBodyTerms from "./MainBodyMypageInfoBodyTerms.vue";
import MainBodyMypageInfoBodySensitiveAgree from "./MainBodyMypageInfoBodySensitiveAgree.vue";

import MainBodyMypageInfoBodyAuthMobilePhone from "./MainBodyMypageInfoBodyAuthMobilePhone.vue";
import {eventBus} from "@/main";

export default {
  name: "MainBodyMypageInfoBody",
  props: {
    user: Object,
    isTempStudent: Boolean,
  },
  data: () => ({
    userData: {},
    isShowAuthMobilePhone: false
  }),
  components: {
    MainBodyMypageInfoBodyProfile,
    MainBodyMypageInfoBodyProfileMulti,
    MainBodyMypageInfoBodySign,
    MainBodyMypageInfoBodyAccount,
    MainBodyMypageInfoBodyTerms,
    MainBodyMypageInfoBodyAuthMobilePhone,
    MainBodyMypageInfoBodySensitiveAgree
  },
  methods: {
    ...mapActions({
      isAllDeviceLogout: "isAllDeviceLogout"
    }),
    callCloseAccount() {
      this.$emit("closeAccount");
    },
    openAuthMobilePhone() {
      this.isShowAuthMobilePhone = true;
    },
    closeAuthMobilePhone() {
      this.isShowAuthMobilePhone = false;
    },
    setUserDataByParams(params) {
      const changedKeys = []

      for (const param of params) {
        const key = Object.getOwnPropertyNames(param);
        this.userData[key] = param[key];
        changedKeys.push(key)
      }

      this.updateUser(changedKeys);
    },
    async updateUser(changedKeys) {
      const userUri = this.user._links.self.href;
      const userUuid = this.$comn.split(userUri, "/");

      const requestData = { _links: this.userData._links }
      changedKeys.forEach(key => {
        requestData[key] = typeof this.userData[key] === 'undefined'
          ? null
          : this.userData[key]
      })
      this.$log.debug('requestData:', requestData)

      if (requestData.hasOwnProperty('userMarketingUsed') || requestData.hasOwnProperty('userPushUsed')) {
        if (requestData.hasOwnProperty('userMarketingUsed')) {
          try {
            await this.$axios({
              method: 'PATCH',
              url: `${this.$apiUrl}/users/${userUuid}/marketing`,
              data: {userMarketingUsed: requestData.userMarketingUsed}
            })

            if (!requestData.userMarketingUsed) {
              let marketingPopup = {
                lastDisagreeTimestamp: this.$moment().valueOf().toString()
              }

              if (localStorage.getItem('marketingPopup')) {
                marketingPopup = JSON.parse(localStorage.getItem('marketingPopup'))
                marketingPopup.lastDisagreeTimestamp = this.$moment().valueOf().toString()
              }
              localStorage.setItem('marketingPopup', JSON.stringify(marketingPopup))
            }
            delete requestData['userMarketingUsed']
          } catch(error) {
            this.$log.debug(this.$options.name, " updateUser() error => ", error);
          }
        }
        if (requestData.hasOwnProperty('userPushUsed')) {
          try {
            await this.$axios({
              method: 'PATCH',
              url: `${this.$apiUrl}/users/${userUuid}/marketingPush`,
              data: {userPushUsed: requestData.userPushUsed}
            })
            delete requestData['userPushUsed']
          } catch(error) {
            this.$log.debug(this.$options.name, " updateUser() error => ", error);
          }
        }
      } else {
        this.$hiClass.users.update(requestData, `/users/${userUuid}`)
          .then(result => {
            this.$log.debug(this.$options.name, " updateUser() result => ", result);
            // 회원정보 store 저장 전 휴대폰 번호 마스킹
            if (this.userData.userMobile && !this.userData.userMobile.includes('*'))
              this.userData.userMobile = this.$stringUtil.phoneFormatter(this.userData.userMobile, 1)

            // 회원정보 store 저장
            this.$store.commit('setUser', Object.assign({}, this.userData))

            this.closeAuthMobilePhone()
      
            this.$toasted.clear()
            this.$toasted.show(`${changedKeys.flatMap(key => key).includes('userName') ? '이름이' : '번호가'} 변경되었습니다.`)
          })
          .catch(error => {
            this.$log.debug(this.$options.name, " updateUser() error => ", error);
            eventBus.$emit('mypage-info-update-user-error')
            this.rollbackUser()
          })
          .finally(() => {
            this.$store.commit('setIsDimLoading', false)
          })
      }
    },
    rollbackUser() {
      const userUri = this.user._links.self.href;
      const userUuid = this.$comn.split(userUri, "/");

      this.$store.commit('setIsDimLoading', true)

      this.$hiClass.users.read(`/users/${userUuid}`)
        .then(res => {
          ['userData'].forEach(key => {
            for (const [k, v] of Object.entries(res.data)) {
              this[key][k] = v
            }
          })

          // 회원정보 store 저장
          this.$store.commit('setUser', Object.assign({}, this.userData))
        })
        .finally(() => {
          this.$store.commit('setIsDimLoading', false)
        })
    },
  },
  async created() {
    await this.isAllDeviceLogout()
    this.userData = this.user;
  }
};
</script>
