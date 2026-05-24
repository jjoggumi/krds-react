<template>
  <div
    v-if="docFiles.length > 0"
    class="file-list"
  >
    <a
      v-for="(docFile, index) of docFiles"
      :key="`${docFile.fileOriginalPath}-${index}`"
      href="javascript:"
      @click="openAttachFilesViewer({
        item: docFile,
        contentType: docFile.fileContentType
      })"
    >
      <span class="attached-file-name" :inner-html.prop="getFileName(docFile.fileName)"></span>
      <span
        v-if="docFile.fileThumbnailPath"
        class="attached-preview"
      >
        <img :src="docFile.fileThumbnailPath" :alt="docFile.fileName">
      </span>
    </a>
  </div>

  <div v-else></div>
</template>

<script>
import {mapActions, mapState} from "vuex";

export default {
  name: 'post-doc-files',
  components: {},
  props: {
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    docFiles() {
      return this.postItem.files ? this.postItem.files.filter(file =>
        file.fileContentType.indexOf('image') === -1 && 
        file.fileContentType.indexOf('video') === -1 &&
        !file.fileOriginalPath === false
      ) : []
    },
    
  },
  created() {},
  mounted() {
  },
  methods: {
    ...mapActions({
      openAttachFilesViewer: "openAttachFilesViewer",
    }),
    getFileName(data) {
      let fileName = ""
      if(this.curClassSearchQuery.keyword) {
        const regex = new RegExp(`(${this.curClassSearchQuery.keyword})(?![^<]*>)(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;]*;)`, "gi")
        fileName = data.replace(regex, '<span class="highlight">' + this.curClassSearchQuery.keyword + '</span>')
      } else {
        fileName = data
      }
      return fileName
    }
  },
}
</script>

<style scoped></style>
