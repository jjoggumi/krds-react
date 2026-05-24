<template>
  <HiModal type="type01" size="sm" @close="close">
    <template v-slot:heading>
      <h2 class="heading">안내</h2>
    </template>
    <template v-slot:content>
      <p class="content">
        잘못된 접근입니다.<br>
        홈 화면으로 이동합니다.
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
  methods: {
    close () {
      localStorage.clear();
      window.location.href='/'
    }
  }
}
</script>  

<style scoped>
p.content {
  font-size: 1.4em;
}
</style>