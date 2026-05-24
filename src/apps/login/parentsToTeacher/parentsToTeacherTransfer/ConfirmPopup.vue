<template>
<HiModal type="type01" size="sm" @close="onClickCancel" :modalContentStyle="{'line-height': '100%'}" :modalLayerStyle="{width: '370px'}">
  <template v-slot:heading>
    <h2 class="heading">
      안내
    </h2>
  </template>
  <template v-slot:content>
    <div style="line-height: 100%;">
      <h1>
        <span class="strong">{{ user.userName }} {{ userType }}</span>이 맞으시다면<br>
        <span class="strong">확인</span> 버튼을 눌러주세요. <br><br>
      </h1>
      <pre class="info">
        마이페이지 이름 : {{ user.userName }}
        <span v-if='hasValidEmail'>SNS 계정 : {{ markedEmail }}</span>
      </pre>
      <span class="small">
        (위 계정을 이용하지 않는다면,
        <br>SNS 로그아웃 후에 재시도해주세요.)
      </span>
    </div>
  </template>
  <template v-slot:footer>
    <HiButton color="light-primary" outline  size="md" @click="onClickCancel" class='btn'> 아니요 </HiButton>
    <HiButton color="primary" size="md" @click="onClickConfirm" class='btn'> 확인 </HiButton>
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
    },
    applyEntryPath: {
      type: String,
      required: true
    }
  },
  computed: {
    username() {
      return localStorage.name
    },
    markedEmail() {
      return this.hasValidEmail ? '**' + (this.user || {userEmail: ''}).userEmail.substring(2) : ''
    },
    userType() {
      return '학부모님';
    },
    hasValidEmail() {
      return this.user.userEmail && this.user.userEmail.length > 0
    }
  },
  methods: {
    onClickCancel() {
      localStorage.clear();
      window.location.href=`/p2t/${this.applyEntryPath}?step=1`
    },
    onClickConfirm() {
      window.location.href=`/p2t/${this.applyEntryPath}?step=3`
    }
  }
}
</script>

<style scoped>
.strong {
  color: var(--primary);
}

h1 {
  line-height: 130%;
}

.info {
  color: #888888;
  font-size: 0.9em;
  line-height: 130%;
}

.small {
  color: #888888;
  font-size: 0.69em;
}

.btn {
  min-width: 120px !important;
}
</style>
