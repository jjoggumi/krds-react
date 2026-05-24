<template>
  <HiModal
      type="type01"
      size="sm"
      @close="$emit('closeKakaoSendConfirm')"
  >
    <template v-slot:heading>
      <p class="highlight">{{ formattedMobile }}</p>
      <strong>전화번호를 확인해 주세요.<br>작성된 번호로 알림톡을 발송합니다.</strong>
    </template>
    <template v-slot:content>
      <img src="@/assets/img/img_alarm_kakao.png" alt="카카오톡 알림톡">
      <div class="desc mt-15">
        1811-0910에서 발송된 문자가 스팸 차단 또는<br>
        통신 연결 상태에 따라 미수신되었을 수 있습니다.<br>
      </div>
      <div class="desc mt-10">
        카카오톡에 가입되어 있지 않는 경우 알림톡 발송을<br>
        받으실 수 없습니다.<br>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="primary" size="lg" block @click="$emit('sendKakaotalk')">카카오톡 알림톡 받기</HiButton>
    </template>
  </HiModal>
</template>

<script>
import {replaceMobile} from "@/plugins/utils"

export default {
  name: "kakao-send-confirm",
  props: {
    mobile: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedMobile() {
      return replaceMobile(this.mobile)
    }
  }
}
</script>

<style lang="scss" scoped>
.highlight{
  line-height: 30px;
}
strong{
  line-height: 30px;
}
</style>