<template>
  <div class="window-popup advertising-modal type2">
    <div class="modal-cont-wrap" ref="pop">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="advertising-modal-cont-wrap">
            <video
              id="tguideVideo"
              ref="guideVideo"
              width="1290"
              controls
              controlsList="nodownload"
              disablePictureInPicture
              type="video/mp4"
              :src="video[idx]">
            </video>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'GuidePopupVideo',
  components: { 
    
  },
  data() {
    return {
      idx: this.$route.query.idx,
      video: {
        '01_1': 'https://download.hiclass.net/static/videos/tutorial/guide-popup-video-01_1.mp4',
        '02_1': 'https://download.hiclass.net/static/videos/tutorial/guide-popup-video-02_1.mp4',
        '02_3': 'https://download.hiclass.net/static/videos/tutorial/guide-popup-video-02_3.mp4',
        '03_1': 'https://download.hiclass.net/static/videos/tutorial/guide-popup-video-03_1.mp4',
        '03_2': 'https://download.hiclass.net/static/videos/tutorial/guide-popup-video-03_2.mp4',
        '04_1': 'https://download.hiclass.net/static/videos/tutorial/guide-popup-video-04_1.mp4',
        '05_1': 'https://download.hiclass.net/static/videos/tutorial/guide-popup-video-05_1.mp4',
      }
    }
  },
  computed: {
  },
  mounted() {
    window.addEventListener("resize", (e) => {
      this.videoResize(e)
    })
  },
  methods: {
    videoResize(e) {
      $("#tguideVideo").css({
        "width": e.target.innerWidth - 17,
        "height": e.target.innerHeight - 3
      })
    }
  }
}
</script>