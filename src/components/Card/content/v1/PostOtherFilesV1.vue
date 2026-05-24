<template>
  <ul class="group-file">
    <li
      v-for="(otherFile, index) of otherFiles"
      :key="`${otherFile.fileOriginalPath}-${index}`"
    >
      <div
        v-if="otherFile.fileName"
        class="file" role="button"
        @click="openFile(otherFile)"
      >
        <span>{{ otherFile.fileName }}</span>
      </div>
      <div
        v-if="otherFile.fileThumbnailPath"
        class="preview"
        role="button"
        @click="openFile(otherFile)"
      >
        <img :src="otherFile.fileThumbnailPath" alt="">
      </div>
    </li>
  </ul>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "post-other-files-v1",
  props: {
    otherFiles: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: "openAttachFilesViewer",
    }),
    openFile(otherFile) {
      this.openAttachFilesViewer({
        item: otherFile,
        contentType: otherFile.fileContentType
      })
    },
  }
}
</script>

<style scoped>

</style>