<template>
  <!-- Head of your HTML file -->
  <form
    id="drop-file-upload"
    :action="$api_file_url"
    method="post"
    enctype="multipart/form-data"
  >
    <div class="worksheet-form-file-wrap dropzone">
      <div class="file-drag-area-wrap">
        <p class="file-drag-area">드래그 앤 드롭 또는 클릭하여 파일을 추가하세요.<br>(jpg, png,hwp,doc,docx,ppt,pptx,pdf 사용가능) 최대 200MB 등록 가능</p>
        <input type="file" name="file">
      </div>
    </div>
  </form>
<!--  <form
    id="my-form"
    class="dropzone"
    action="/file-upload"
  ></form>-->
</template>

<script>
import Dropzone from 'dropzone'
import "dropzone/dist/dropzone.css";

export default {
  name: "hc-drop-file-upload",
  methods: {
    init() {
      // Make sure Dropzone doesn't try to attach itself to the
      // element automatically.
      // This behaviour will change in future versions.
      Dropzone.autoDiscover = false;

      let myDropzone = new Dropzone("#drop-file-upload", {
        url: this.$api_file_url,
        paramName: 'file',
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      myDropzone.on("addedfile", file => {
        this.$log.info(`File added: ${file.name}`)
      })
    }
  },
  created() {
    // this.init()
  },
  mounted() {
    this.init()
  }
}
</script>

<style scoped>

</style>