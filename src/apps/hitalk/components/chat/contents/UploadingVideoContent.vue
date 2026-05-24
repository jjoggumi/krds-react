<template>
  <div class="chatting-bubble-wrap my-chatting video">
    <div class="chatting-bubble">
      <div class="img-video-view-wrap">
        <div ref="thumbnail" class="cover-video">
          <div class="video-box">
            <div class="circle-box">
              <vue-ellipse-progress :progress="progress" :loading="progress === 100" :size="48" />
            </div>
          </div>
        </div>
        <div class="img">
          <img :src="imageSrc" alt=""/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VueEllipseProgress } from "vue-ellipse-progress";

export default {
  name: "UploadingContent",
  props: {
    thumbnail: Object,
    progress: Number,
  },
  components: { VueEllipseProgress },
  computed : {
    imageSrc: function () {
      return URL.createObjectURL(this.thumbnail)
    }
  }
}
</script>

<style>
.video-box {
  position:absolute;
  top:48px;
  left:0;
  width:100%;
  font-size:0;
  text-align:center;
}
.circle-box {
  display: inline-block;
  width:48px;
  height:48px;
}
/* 전체화면 버튼 */ 
video::-webkit-media-controls-fullscreen-button {display: none !important;} 

/* 일시정지, 재생 버튼 */ 
video::-webkit-media-controls-play-button {display: none !important;} 

/* 재생 슬라이드..? */ 
video::-webkit-media-controls-timeline {display: none !important;} 

/* 현재 진행 시간 */ 
video::-webkit-media-controls-current-time-display{display: none !important;} 

/* 전체 시간 */ 
video::-webkit-media-controls-time-remaining-display {display: none !important;} 

/* 음소거 버튼 */ 
video::-webkit-media-controls-mute-button {display: none !important;} 

/* 볼륨 조절 슬라이드 */ 
video::-webkit-media-controls-volume-slider {display: none !important;} 
</style>