<template>
<HiModal type="type01" size="sm" @close="onClickCancel">
  <template v-slot:heading>
    <h2 class="heading">
      안내
    </h2>
  </template>
  <template v-slot:content>
    <h1>
      <span class="strong">{{ user.userName }} {{ userType }}</span>이 맞으시다면<br>
      <span class="strong">확인</span> 버튼을 눌러주세요. <br><br>
    </h1>
    <pre class="info">
      마이페이지 이름 : {{ user.userName }}
      웨일 계정 : {{ markedEmail }}
    </pre>
    <span class="small">
      (위 계정을 이용하지 않는다면, 웨일스페이스 로그아웃 후에 재시도해주세요.)
    </span>
  </template>
  <template v-slot:footer>
    <HiButton color="light-primary" outline  size="md" @click="onClickCancel"> 아니요 </HiButton>
    <HiButton color="primary" size="md" @click="onClickConfirm"> 확인 </HiButton>
  </template>
</HiModal>
</template>

<script>
export default {
  name: 'ConfirmPopup',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    username() {
      return localStorage.name
    },
    markedEmail() {
      return '**' + this.user.userEmail.substring(2)
    },
    userType() {
      return this.user.userType === 'TEACHER' ? '선생님' : '학생';
    }
  },
  methods: {
    onClickCancel() {
      localStorage.clear();
      window.location.href='/'
    },
    onClickConfirm() {
      window.location.href='/tep?step=2'
    }
  }
}
</script>

<style scoped>
.strong {
  color: var(--primary);
}

.info {
  color: #888888;
  font-size: 0.9em;
}

.small {
  color: #888888;
  font-size: 0.69em;
}
</style>
