<template>
  <MainBodyMypageInfoBody
    :user="user"
    :isTempStudent="isTempStudent"
    @closeAccount="callCloseAccount"
  ></MainBodyMypageInfoBody>
</template>

<script>
import MainBodyMypageInfoBody from "./MainBodyMypageInfoBody.vue";

export default {
  name: "mainBodyMypageInfo",
  props: {
    user: Object,
    isTempStudent: Boolean,
  },
  components: {
    MainBodyMypageInfoBody
  },
  data() {
    return {}
  },
  methods: {
    /**
     * 통합 회원 탈퇴 팝업 호출
     */
    callCloseAccount() {
      /**
       * hiStore parameter test
       * @type {string}
       */
      // const hiclassToken = localStorage.idToken
      // const socialType = this.user.userSns.toLowerCase()
      // const url = `/account/deactivate/${socialType}?hiclassToken=${hiclassToken}`

      const url = '/account/deactivate'
      const target = 'accountDeactivate'
      const features = 'top=20, left=20, width=1200, height=720, status=no, menubar=no, toolbar=no, resizable=no, scroll=no'

      window.open(url,target, features)
    }
  }
};
</script>
