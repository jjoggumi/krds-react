<template>
  <div
    v-if="isUnPlayable"
    class="img-vedio-view-wrap"
    :style="{
      width: width + 'px',
      height: height + 'px'
    }"
    @click="onClickEmptyVideo"
  > 
    <div class="img-vedio-view-inner">
      <div class="img-view-wrap">
        <div class="center-wrap">
          <div class="img">
            <div class="cover-empty">
              <div class="empty-icon01"><span></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "mainBodyItemEmptyVideo",
  props: ["width", "height", "movie"],
  data () {
    return {
    }
  },
  computed: {
    transcodeComplete() {
      return this.movie.fileTranscodePath !== null ? true : false
    },
    isUnPlayable() {
      return !this.transcodeComplete && !this.movie.fileContentType.includes('video/mp4') ? true : false
    }
  },
  methods: {
    onClickEmptyVideo() {
      alert('동영상 인코딩 중입니다.\n완료된 후 확인하실 수 있습니다.')
    }
  },
  mounted() {
  }
};
</script>

<style scoped></style>