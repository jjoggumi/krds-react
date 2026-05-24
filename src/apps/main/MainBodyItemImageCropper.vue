<template>
  <!-- <canvas ref="canvas" :width="width" :height="height"></canvas> -->
  <img
    :src="lazyImg.src"
    :style="imageStyle"
    @error="errorHandler"
    class="target"
    alt=""
    :title="fileName || ''"
  />
</template>

<script>
export default {
  name: "main-body-image-image-cropper",
  props: {
    src: {
      type: String,
    },
    width: {
      type: String,
    },
    height: {
      type: String,
    },
    i: {
      type: Number,
    },
    item: {
      type: Object,
    },
    fileName: {
      type: String,
    },
  },
  data() {
    return {
      lazyImg: {
        src: ""
      },
      imageStyle: {},
    }
  },
  computed: {},
  created() {
  },
  mounted() {
    // 이미지 확장자가 gif 인 경우 깨짐등의 문제로 resize 하지 않음
    if (this.src && this.src.includes('.gif')) {
      this.lazyImg.src = this.src
    } else {
      this.setLazyImgSrc(this.src);
    }
  },
  methods: {
    errorHandler() {
      this.$log.warn("-- start -- errorHandler!");
      this.$log.warn("this.lazyImg.src => ", this.lazyImg.src);
      this.$log.warn("this.src => ", this.src);
      this.$log.warn("-- end -- errorHandler!");
      this.lazyImg.src = this.src;
      this.imageStyle = { "object-fit": "none" };
    },
    setLazyImgSrc(src) {
      let lazyImgSrc = src;
      try {
        if (lazyImgSrc && lazyImgSrc.includes("//download")) {
          const oldStr = "//download";
          const newStr = "//image";
          lazyImgSrc = lazyImgSrc.replace(oldStr, newStr);
        }
        if (!lazyImgSrc && lazyImgSrc.includes("?")) {
          let resizeQuery = "";
          let width = this.width.replace("px", "");
          let height = this.height.replace("px", "");
          width = parseInt(width) * 2;
          height = parseInt(height) * 2;
          resizeQuery = `?width=${width}&height=${height}`;
          lazyImgSrc = lazyImgSrc + resizeQuery;
        }
        this.lazyImg.src = lazyImgSrc;
      } catch (error) {
        this.$log.debug(
          this.$options.name + " setLazyImgSrc() error : ",
          error
        );
        // lazyImgSrc is null --> default Image
        this.lazyImg.src = this.$store.state.emptyImageDefault;
        this.imageStyle = { "object-fit": "none" };
      }
    }
  },
};
</script>

<style lang="scss">
.cropBox {
  overflow: hidden;
  margin: 0 auto;
}

.cropBox .target {
  object-fit: cover;
  object-position: 50% 50%;
  width: 100%;
  height: 100%;
  font-family: "object-fit: cover; object-position: 50% 50%;";
}
</style>