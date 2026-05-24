<template>
  <!-- 백그라운드 이미지 -->
  <div
    v-if="isBackgroundImage && isReadyImage"
    class="profile-thumbnail"
  >
    <img :src="userPhoto(src)" alt="">
  </div>

  <!-- TODO: img 태그 이미지 -->
  <div v-else></div>
</template>

<script>
import {URLProps} from "@/enums";

export default {
  name: 'hc-thumbnail',
  props: {
    isBackgroundImage: {
      type: Boolean,
      required: true,
      default() {
        return true
      }
    },
    src: {
      type: null,
      required: true,
      default() {
        return null
      }
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      width: '',
      height: ''
    }
  },
  computed: {
    isReadyImage() {
      return +this.width > 0 && +this.height > 0
    },
    thumbnailStyleObj() {
      const DEFAULT_IMAGE_PATH = '/files/img/profile_default.png'
      const CDN_URI = process.env.VUE_APP_BASE_CDN_URI
      const CDN_IMAGE_URI = process.env.VUE_APP_BASE_CDN_IMAGE_URI

      let imagePath = this.src || DEFAULT_IMAGE_PATH
      let params = {
        width: this.width,
        height: this.height
      }

      if (this.src !== undefined && this.src !== null && this.src !== '') {
        imagePath = this.src.replace(CDN_URI, CDN_IMAGE_URI)
      }

      if (imagePath.includes(CDN_IMAGE_URI)) {
        imagePath.includes('?') ? (imagePath += '&') : (imagePath += '?')
        imagePath += this.$qs.stringify(params)
      }

      return `background-image:url('${imagePath}'), url('${DEFAULT_IMAGE_PATH}'); background-size: ${this.width}px ${this.height}px`
    },
  },
  methods: {
    userPhoto(photo) {
      return photo ? photo : URLProps.DEFAULT_PROFILE_IMAGE_URL
    },
  },
  created() {
    if (this.type === 'userLike') {
      this.width = '36'
      this.height = '36'
    } else {
      this.width = '36'
      this.height = '36'
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-thumbnail {
  align-self: flex-start;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: url("~@/assets/img/icon/profile_default_hiclass.svg") no-repeat;
  overflow: hidden;
  border: 1px solid #ececec;  
  border-radius: 50%;
  margin: 0 8px 0 0;
  background-size: cover !important;

  &.no-bg {
    background: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    image-rendering: auto;
  }
}
</style>
