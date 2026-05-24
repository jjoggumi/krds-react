<template>
  <div class="all-empty-cont-wrap">
    <div class="leave-comp-cont-wrap">
      <div class="popup-cont">
        <img src="@/assets/img/icon_whistle.png" alt />
        <p>{{ $t("noti.closeAccount.comp.message.text1") }}</p>
        <br />
        <p>{{ $t("noti.closeAccount.comp.message.text2") }}</p>
        <button class="btn-bg-w2" @click="logout">{{ $t("noti.closeAccount.comp.button.ok") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotiCloseAccountComp",
  data() {
    return {      
    }
  },
  methods: {
    logout() {
      this.$router.push('/logout', () => {})
    },
  },
  mounted() {
    setTimeout(() => {
      this.$router.push('/logout', () => {})
    }, 7000);
  }
};
</script>
