<template>
  <div></div>
</template>

<script>
import {mapFields} from "vuex-map-fields";

export default {
  name: 'error-load-fail-async-component',
  computed: {
  ...mapFields({
      isLoadFailAsyncComponent: 'isLoadFailAsyncComponent'
    })
  },
  created() {
    if (!this.isLoadFailAsyncComponent) {
      this.$hiClass.alert('서비스가 업데이트 되었습니다.<br>현재 페이지를 새로고침 합니다.', 'warning')
        .then(() => this.$router.go(0))
        .finally(() => this.$router.go(0))
    }
  },
  mounted() {
    this.isLoadFailAsyncComponent = true
  }
}
</script>
