<template>
  <div class="info-category">
    <div class="category-title">결재서명<span>* 우리 학교 신청서 승인 시 사용할 결재서명을 등록하실 수 있습니다.</span></div>
    <!-- <div class="category-desc">우리 학교 신청서 승인 시 사용할 결재서명을 등록하실 수 있습니다.</div> -->
    <div class="info-cont">
      <div class="esign-box-wrap">
        <img
          :src="userApprovalSignImagePath"
          alt=""
          @dragstart="preventDrag"
        />
      </div>
      <div class="btn-wrap">
        <button
          class="btn-bg-c"
          @click="$hiClass.changeUserSign(CONSTANTS.USER_SIGN.APPROVAL_SIGN)"
        >
          {{ buttonTitle }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: "main-body-mypage-info-body-profile-esign",
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    userApprovalSignImagePath() {
      return this.$store.state.user.userApprovalSignImagePath
    },
    buttonTitle() {
      // return this.userApprovalSignImagePath ? '변경' : '등록'
      return "변경"
    }
  },
  methods: {
    preventDrag(e) {
      e.preventDefault()
      return false
    },
  }
}
</script>

<style scoped>

</style>