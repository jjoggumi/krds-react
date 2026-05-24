<template>
  <div
    v-if="banners.length > 0"
    class="quick-banner"
   :class="{
      [isQuickClass]: true,
    }"
  >
    <div class="heading">
      {{ headerTitle }}
    </div>

    <template
      v-for="(value, index) of Object.values(quickBannerObj)"
    >
      <div
        v-if="value.length > 1"
        :key="`quickBanner-${index}`"
        class="quick-bnr__slide"
      >
        <Slick
          ref="slide"
          :options="slickOptions"
        >
          <div
            v-for="quickBanner of value"
            :key="quickBanner.postId"
            class="slide"
          >
            <a href="javascript:" @click="link(quickBanner)">
              <img :src="quickBanner.files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath || ''" alt="" />
            </a>
          </div>
        </Slick>
      </div>

      <div
        v-else
        :key="`quickBanner-${index}`"
        class="quick-bnr"
      >
        <ul>
          <li v-if="value[0].files.find(file => file.fileFlag === 'THUMBNAIL')">
            <a href="javascript:" @click="link(value[0])">
              <img :src="value[0].files.find(file => file.fileFlag === 'THUMBNAIL').fileOriginalPath" alt="" />
            </a>
          </li>
        </ul>
      </div>
    </template>

    <GlobalEvents
      @scroll="onScrollEvent"
    />

  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";

import Slick from "vue-slick";
import validate from "uuid-validate";
import {openPopup} from "@/plugins/utils";
import CONSTANTS from "@/plugins/constants";

export default {
  name: "web-banner-quick",
  components: {
    Slick
  },
  props: {
    positionType: {
      type: String,
      required: true
    },
    isQuickClass: {
      type: String,
      default() {
        return ''
      }
    },
    banners: {
      type: Array,
      default() {
        return []
      }
    },
  },
  data() {
    return {
      titles: [
        {
          code: 'TEACHER',
          title: '선생님을 위한'
        },
        {
          code: 'PARENTS',
          title: '학부모를 위한'
        },
        {
          code: 'STUDENT',
          title: '학생을 위한'
        },
      ],
      isBannerFixed: false,
      slickOptions: {
        dots: true,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        speed: 1000,
        autoplaySpeed: 5000,
      },
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    headerTitle() {
      try {
        return this.titles.find(t => t.code === this.user.userType).title
      } catch (e) {
        this.$log.error(e)
        return ''
      }
    },
    quickBannerObj() {
      const quickBannerObj = {}

      this.banners.forEach((banner, index) => {
        const orderNumber = banner.positionOrderType || index
        quickBannerObj[orderNumber] && quickBannerObj[orderNumber].length > 0
          ? quickBannerObj[orderNumber].push(banner)
          : quickBannerObj[orderNumber] = [ banner ]
      })
      return quickBannerObj
    }
  },
  mounted() {
  },
  methods: {
    ...mapActions({
      openHitalkPopup: 'openHitalkPopup',
      initChatUncheckedMessage: 'initChatUncheckedMessage'
    }),
    onScrollEvent() {
      const documentScrollTop = document.documentElement.scrollTop;
      const delta = 1; // 동작의 구현이 시작되는 위치
      const selectedQuickBanner = $('.quick-banner')

      if (this.isQuickClass) {
        let fixedFilter = document.querySelector('.board__filter-fixed');
        if (fixedFilter) {

          let fixedFilterHeight = fixedFilter.clientHeight + 20;
          let fixedFilterTop = window.pageYOffset + fixedFilter.getBoundingClientRect().top - fixedFilterHeight;

          if (documentScrollTop > fixedFilterTop) {
            selectedQuickBanner.animate({ top: documentScrollTop - (90 - 20 + fixedFilterHeight) }, 0);
            selectedQuickBanner.css({ margin: '0' });
          } else {
            selectedQuickBanner.css({ top: '', margin: '' });
          }

        } else {

          const content = document.querySelector('.column-content');
          if (content) {
            const contentTop = window.pageYOffset + content.getBoundingClientRect().top - 56;

            if (documentScrollTop > contentTop) {
              selectedQuickBanner.animate({ top: documentScrollTop - contentTop + 40}, 0);
              selectedQuickBanner.css({ margin: '0' });
            } else {
              selectedQuickBanner.css({ top: '', margin: '' });
            }
          }

        }

      } else {
        documentScrollTop > delta
          ? selectedQuickBanner.animate({ top: `${documentScrollTop}px` }, 0)
          : selectedQuickBanner.css({ top: '' })
      }

    },
    link(item) {
      if (!item.link)
        return false

      // 배너 클릭 시 읽음 카운트 증가 (게시물 상세보기)
      this.$hiClass.posts.read(`/posts/${item.postId}`)

      switch (item.linkType) {
        case 'INTERNAL': {
          this.getInternalLink(item)
          break
        }
        case 'EXTERNAL': {
          this.getExternalLink(item)
          break
        }
        default: {
          this.getExternalLink(item)
        }
      }
    },
    getInternalLink(item) {
      if (validate(item.link)) {
        const postUrl = `${this.$apiUrl}/posts/${item.link}`
        this.$hiClass.posts.read(postUrl)
          .then(res => this.setItemDetailObj(res.data))
          .catch(err => this.$log.debug(this.$options.name, ' link() error => ', err))

      } else if (item.linkTarget === 'MENU') {

        switch (item.link) {
          case 'HITALK': {
            // this.openHitalkPopup(null) openPopup으로 전환
            this.initChatUncheckedMessage()
            openPopup(CONSTANTS.POPUP.HI_TALK, {
              chatUserClassId: this.classId,
              chatUserId: this.member.userId,
              chatUserType: this.member.userType,
              chatUserMemberRole: this.member.role
            })
            break
          }
          default: {
            this.$hiClass.alert(`TBD: ${item.linkTarget} / ${item.link} 미 지원`, 'warning')
          }
        }

      } else {
        this.$hiClass.alert(`TBD: ${item.linkTarget} 미 지원`, 'warning')
      }
    },
    getExternalLink(item) {
      window.open(item.link, item.currentId)
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
  }
}
</script>

<style scoped>

</style>