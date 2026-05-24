<template>
<HiModal type="type01" size="sm" @close="close">
  <template v-slot:heading v-if="success">
    <h2 class="heading">로그아웃 안내</h2>
  </template>
  <template v-slot:content>
    <p class="content" v-if="success">
      SNS 계정으로 변경이 완료되었습니다.<br>
      안전한 사용을 위해 모든 기기에서 로그아웃 되오니,<br>
      SNS 계정으로 <span class="highlight">다시 로그인해주세요.</span>
    </p>
    <p class="content" v-else>
      <pre>{{ errMessage }}</pre>
    </p>
  </template>
  <template v-slot:footer>
    <HiButton color="primary" size="md" @click="close"> 확인 </HiButton>
  </template>
</HiModal>
</template>

<script>
export default {
  name: 'ConfirmPopup',
  props: {
    message: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    status: {
      type: Number,
      default: 0
    }
  },
  computed: {
    success () {
      return [200, 204].includes(this.status);
    },
    errMessage () {
      return ({
        404: 'SNS 전환 시도에 실패하였습니다.',
        407: '인증된 사용자 정보가 일치하지 않습니다.',
        428: '해당 SNS계정으로 가입된 정보가 있습니다.\n다른 SNS 계정을 선택해주세요.',
        500: '서버 오류가 발생했습니다.',
      })[this.status] || `알 수 없는 오류가 발생했습니다. (${this.status})`;
    }
  },
  methods: {
    close () {
      if (this.success) {
        localStorage.clear();
      }
      window.location.href='/'
    },
  }
}
</script>

<style scoped>
.content {
  color: #888888;
  line-height: 1.5em;
}
.content pre {
  line-height: 1.5em;
}
.content .highlight {
  color: var(--primary);
}
</style>
