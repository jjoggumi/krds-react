<template>
  <div class="login-warnning">
    <p>
      인증번호를 받지 못하셨나요?
      <button class="kko-btn" @click="$emit('openKakaotalkSendModal')">
        카카오톡 알림 받기
      </button>
      <span
          :class="{'arr-down': !isShow, 'arr-up': isShow}"
          @click="isShow = !isShow"
      >
          내용보기
        </span>
    </p>
    <div :style="{'display': isShow ? 'block' : 'none'}">
      1. 입력하신 휴대폰 번호가 맞는지 확인해주세요.<br/><br/>
      2. 1811-0910 번호가 스팸 차단되어 있는 경우 확인 후 해제해주세요.<br/><br/>
      <span>
          - Android : 메시지>설정>스팸 및 차단번호 관리>수신 차단/차단 문구/차단 메시지에서 차단여부 확인<br/>
          - iOS : 설정>메시지>SMS·MMS>차단된 연락처>차단 여부 확인<br/><br/>
          ※ 스팸차단 앱을 사용하는 경우 해당 앱에서의 차단 여부도 함께 확인해주세요.
        </span>
      <br/><br/>
      3. 차단 해제 후 인증번호 요청을 다시 시도해주세요.
    </div>
  </div>
</template>

<script>
export default {
  name: "cert-number-guide",
  data() {
    return {
      isShow: false
    }
  }
}
</script>

<style scoped>

</style>