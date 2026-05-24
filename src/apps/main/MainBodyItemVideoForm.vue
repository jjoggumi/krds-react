<template>
  <div
    v-if="isPlayable"
    class="video-view-wrap"
  >
    <video
      @click.stop
      ref="video"
      :width="width+'px'"
      :height="height+'px'"
      controls
      controlsList="nodownload"
      disablePictureInPicture
    >
      <source :src="movieSrc" type="video/mp4" />
    </video>
  </div>
  <!-- video element -->
  <!-- <vue-plyr :key="new Date().getTime()" ref="plyr">
    <video
      crossorigin
      :poster="movie.fileThumbnailPath"
      :src="movieSrc + '_360p.mp4'"
      :width="width+'px'"
      :height="height+'px'"
      size="360"
    >
      <source :src="movieSrc + '_360p.mp4'" type="video/mp4" size="360">
    </video>
  </vue-plyr> -->

  <!-- <video poster="poster.png" src="video.mp4">
      <source src="video-720p.mp4" type="video/mp4" size="720">
      <source src="video-1080p.mp4" type="video/mp4" size="1080">
      <track kind="captions" label="English" srclang="en" src="captions-en.vtt" default>
  </video>-->
</template>

<script>
export default {
  name: "mainBodyItemVideoForm",
  props: ["width", "height", "movie"],
  data () {
    return {
      movieSrc: this.movie.fileTranscodePath || this.movie.fileOriginalPath
    }
  },
  computed: {
    transcodeComplete() {
      return this.movie.fileTranscodePath !== null ? true : false
    },
    isPlayable() {      
      return this.transcodeComplete || this.movie.fileContentType.includes('video/mp4') ? true : false
    },
    isExistThumbnail() {
      return this.movie.fileThumbnailPath !== null ? true : false
    }
  },
  methods: {
  },
  mounted() {
    // $(".plyr__video-wrapper").css("width", this.width);
    // $(".plyr__video-wrapper").css("height", this.height);
  }
};
</script>

<style lang="scss" scoped>
  // .cover-video p {
  //   padding-top: 20%;
  //   font-size: 20px;
  // }
  .preview {
    text-align: center;
  }
</style>