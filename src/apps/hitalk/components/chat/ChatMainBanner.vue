<template>
  <chat-empty v-if="isEmptyBanner"></chat-empty>

  <div
    v-else
    class="hitalk-main-banner"
  >
    <div class="banner__list">
      <div class="banner__item heading">
        <img
          v-for="item of getBannerHitalkMainTitle.slice(0, 1)"
          :key="item.postId"
          :src="item.files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath || ''"
          alt=""
          @click="link(item)"
        >
      </div>
      <a
        v-for="item of getBannerHitalkMainCard.slice(0, 6)"
        :key="item.postId"
        href="javascript:"
        class="banner__item"
        @click="link(item)"
      >
        <img :src="item.files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath || ''" alt="">
      </a>

      <a
        v-for="item of getBannerHitalkMainBannerA.slice(0, 1)"
        :key="item.postId"
        href="javascript:"
        class="banner__item full"
        @click="link(item)"
      >
        <img :src="item.files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath || ''" alt="">
      </a>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
import ChatEmpty from "@/apps/hitalk/components/chat/ChatEmpty";

export default {
  name: "chat-main-banner",
  components: {ChatEmpty},
  computed: {
    ...mapState(['banner']),
    ...mapGetters(['getBannerHitalkMainTitle', 'getBannerHitalkMainCard', 'getBannerHitalkMainBannerA', 'getBannerHitalkRoomList']),
    isEmptyBanner() {
      try {
        const mainTitleCount = this.getBannerHitalkMainTitle.length || 0
        const mainCardCount = this.getBannerHitalkMainCard.length || 0
        const mainBannerACount = this.getBannerHitalkMainBannerA.length || 0
        const roomListCount = this.getBannerHitalkRoomList.length || 0
        const totalCount = (mainTitleCount + mainCardCount + mainBannerACount + roomListCount)
        return totalCount === 0

      } catch (e) {
        return true
      }
    }
  },
  methods: {
    link(item) {
      // 배너 클릭 시 읽음 카운트 증가 (게시물 상세보기)
      this.$hiClass.posts.read(`/posts/${item.postId}`)

      if (item.link.trim() !== '') {
        let routeLink

        if (item.linkType === 'INTERNAL') {
          const validate = require('uuid-validate')
          const parameter = validate(item.link) ? `?postId=${item.link}` : ''
          routeLink = `/main/home${parameter}`
        } else {
          routeLink = item.link
        }
        window.open(routeLink, item.postId)
      }
    },
  }
}
</script>

<style scoped>

</style>