<template>
  <div class="worksheet-wrap">
    <div
      class="worksheet-container"
      style="padding-top: 0;"
    >
      <worksheet-submit-body
        v-if="sheetId"
      />
    </div>
  </div>
</template>

<script>
import '@/assets/css/worksheets.scss';

import WorksheetSubmitBody from '@/apps/worksheetSubmit/WorksheetSubmitBody'

export default {
  name: "worksheet-submit",
  props: {
  },
  components: { WorksheetSubmitBody },
  data() {
    return {
      sheetId: null
    }
  },
  computed: {
  },

  watch: {
  },

  created() {
    this.sheetId = this.$route.params.sheetId
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'worksheet')
  },
  beforeDestroy() {
    this.sheetId = null

    this.$hiClass.toggleBodyClass('remove', 'worksheet')
  },
  destroyed() {
  },
  methods: {
  },

}
</script>

<style scoped>
</style>