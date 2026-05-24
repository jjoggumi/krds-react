<template>
  <div>
    <!-- 2024.07.29 WEB_BANNER_HOME_FEED: 미사용하는걸로 보임 -->
    <div
      v-if="positionType === 'WEB_BANNER_HOME_FEED'"
      class="grid-box-wrap banner-wrap"
    >
      <div
        v-if="banner.thumbnailPath"
        class="grid-box-inner"
      >
        <div
          class="banner-slide-wrap"
          :key="banner.currentId"
          @click="link(banner)"
        >
          <a href="javascript:">
            <img :src="banner.thumbnailPath"  alt=""/>
          </a>
        </div>
      </div>
    </div>
    <!-- 2024.07.29 WEB_BANNER_HOME_FEED: 미사용하는걸로 보임 -->

    <template v-else-if="isWebBannerQuick(positionType)">
      <web-banner-quick
        v-if="!isMobile"
        :positionType="positionType"
        :isQuickClass="isQuickClass"
        :banners="banners"
      />
    </template>

    <div v-else>
      <div
        class="banner-wrap"
        v-for="banner in banners"
        :key="banner.postId"
        @click="link(banner)"
      >
        <a
          v-if="banner.files.find(file => file.fileFlag === 'THUMBNAIL')"
          href="javascript:"
        >
          <img :src="banner.files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath"  alt=""/>
        </a>
      </div>
    </div>

  </div>
</template>

<script>
import {mapGetters} from "vuex";
import WebBannerQuick from "@/components/Banner/WebBannerQuick";

export default {
  name: 'banner-item',
  components: {
    WebBannerQuick
  },
  props: {
    positionType: {
      type: String,
      required: true
    },
    refDate: {
      type: Number
    },
    isQuickClass: {
      type: String
    },
    banner: {
      type: Object,
      default() {
        return {}
      }
    },
    banners: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters({
      isMobile: 'isMobile',
    }),
    editMode() {
      return this.modalOption.subComponent
    },
  },
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {

    link(item) {
      // 배너 클릭 시 읽음 카운트 증가 (게시물 상세보기)
      this.$hiClass.posts.read(`/posts/${item.postId}`)

      if (item.link.trim() !== '') {
        if (item.linkType === 'INTERNAL') {
          if (item.linkTarget === 'NOTICE') {
            this.$router.push('/help/notice')
          } else {
            this.$hiClass.posts
              .read(`${process.env.VUE_APP_BASE_API_URI}/posts/${item.link}`)
              .then(res => {
                this.setItemDetailObj(res.data)
              })
              .catch(err => {
                this.$log.debug(this.$options.name, ' link() error => ', err)
              })
          }
        } else {
          window.open(item.link, item.postId)
        }
      }
    },
    // 게시물 상세 팝업
    setItemDetailObj(item) {
      if (item) {
        let paramObj = {
          item: item,
          list: [item],
          totalElements: 1,
          pagePerSize: 1
        }
        this.$store.commit('setItemDetailObj', paramObj)
        this.$store.commit('setIsShowDetailPostLayer', true)
      } else {
        this.$store.commit('setItemDetailObj', {})
        this.$store.commit('setIsShowDetailPostLayer', false)
      }
    },

    isWebBannerQuick(positionType) {
      const webBannerQuickCodes = [
        'WEB_BANNER_QUICK',
        'WEB_BANNER_QUICK_CLASS'
      ]
      return webBannerQuickCodes.includes(positionType)
    },

  }
}
</script>

<style lang="scss" scoped>
  .min-h-32 {
    min-height: 32px;
  }
</style>