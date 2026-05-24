<template>
  <div
    class="alignbox"
    :class="[file.fileAlign.toLowerCase()]"
  >
    <div :class="[file.fileCategory.toLowerCase()]">
      <img :src="file.fileOriginalPath" alt="">
      <button
        @click="openFileViewer(file)"
        class="btn-view"
      ></button>

    </div>
  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "survey-response-file-box",
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: 'openAttachFilesViewer'
    }),
    openFileViewer(file) {
      const contentType = file.fileContentType
      const cloneFile = _.cloneDeep(file)
      const payload = { contentType }
      if (contentType.startsWith('image') || contentType.startsWith('video')) {
        payload.items = [ cloneFile ]
      } else {
        payload.item = cloneFile
      }
      this.openAttachFilesViewer(payload)
    }

  }
}
</script>

<style scoped>

</style>