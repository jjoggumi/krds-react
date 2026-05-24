<template>
<!--
section: =>

{
  "sectionId": 65,
  "type": "BANNER_TOP",
  "displayType": "PIN",
  "displayRule": "ORDERLY",
  "displayCount": 1,
  "contents": [
    {
    "contentsType": "LINK",
    "contents": "https://www.naver.com",
    "postId": "5450de09-2943-4071-8f80-3181059f5a2c",
    "linkType": "EXTERNAL",
    "postType": "BANNER",
    "file": {
      "fileOriginalPath": "https://download.hiclass.net/7e60/8060/9260/c160/66e7dbdc-db1e-4531-927c-814b1e26497a.png",
      "fileThumbnailPath": null
    },
    "adWebId": 1084,    // TODO: 광고 ID
    "adAosId": null,
    "adIosId": null,
    "version": null
    }
  ]
}
-->
  <div
    v-if="isShow && banners.length > 0"
    class="l-top-banner"
    :style="bannerStyle"
  >
    <template v-for="content of banners">
      <div
        class="top-banner__inner"
        :key="content.postId"
      >
        <a
          href="javascript:void(0)"
          @click.stop="onClickContent(content)"
        >
          <img
            v-if="content.file"
            :src="content.file.fileOriginalPath"
            alt=""
            @load="initTopBanner"
          >
        </a>
        <button
          class="btn-close"
          @click="onClickCloseButton(true)"
        >
          <span class="banner-hide-txt">오늘 다시 보지 않기</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "banner-top",
  props: {
    section: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      isShow: true,
      currentId: 'banner-top',
      replayType: 'NOTTODAY',
      banners: []
    }
  },
  computed: {
    ...mapGetters('storeHome', {
    }),
    contents() {
      return this.section.contents || []
    },
    replayData() {
      return {
        NOTTODAY:
          (JSON.parse(localStorage.NOTTODAY || null) || {})[
            this.$moment().format('YYYYMMDD')
            ] || null,
        ANYMORE: JSON.parse(localStorage.ANYMORE || null)
      }
    },
    postOptionsBackground() {
      const DEFAULT_COLOR = ''
      const foundObj = this.banners.find(b => b.postOptions && b.postOptions.length > 0)
      return foundObj
        ? foundObj.postOptions.find(o => o.name === 'backGround').value || DEFAULT_COLOR
        : DEFAULT_COLOR
    },
    bannerStyle() {
      return this.postOptionsBackground
        ? { 'background-color': this.postOptionsBackground }
        : {}
    }
  },
  watch: {
    $route(to) {
      if (to.path === '/main/home') {
        this.isShow = true
        this.$emit('toggle-banner', true)

      } else {
        this.isShow = false
        this.$emit('toggle-banner', false)
      }
    },
    contents(val) {
      this.initNotToDay()

      if (val && val[0] && val[0].file && val[0].file.fileOriginalPath) {
        this.banners = this.contents.filter(item => {
          const replayItem = (this.replayData[this.replayType] || []).filter(rep => rep.currentId === this.currentId, {})
          if (replayItem.length === 0)
            return item
        }) || []
      }
    },
  },
  created() {
    this.initNotToDay()
  },
  mounted() {
    this.initNotToDay()
  },
  beforeDestroy() {
    let content = document.querySelector('#cont-box-wrap')
    if (content) {
      content.style.margin = ''
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    initTopBanner() {
      if( $('.l-top-banner').length >= 1 ) {
        let content = document.querySelector('#cont-box-wrap');
        let topBanner = document.querySelector('.l-top-banner');
        let closeBtn = topBanner.querySelector('.btn-close');
        closeBtn.addEventListener('click', function() {
          content.style.margin = '';
          topBanner.remove();
          this.$emit('toggle-banner', false);
        });
      }
    },
    initNotToDay() {
      let toDay = this.$moment().format('YYYYMMDD')
      let storage = JSON.parse(localStorage.NOTTODAY || null) || {},
        replay = storage[toDay] || null

      let toDayStorage = {}
      toDayStorage[toDay] = replay
      localStorage.NOTTODAY = JSON.stringify(toDayStorage)
    },
    onClickContent(content) {
      this.triggerAnalyticsLogEvent({ code: 'analytics.header.topBanner.click' })

      const postId = content.postId
      const postUrl = `${this.$apiUrl}/posts/${postId}`
      const contents = content.contents && content.contents.trim().length > 0 ? content.contents : null
      const contentsType = content.contentsType
      const linkType = content.linkType
      const linkTarget = content.linkTarget

      // 배너 클릭 시 읽음 카운트 증가 (게시물 상세보기)
      this.$hiClass.posts.read(`/posts/${postId}`)

      if (contents) {
        switch (linkType) {
          case 'INTERNAL': {
            if (linkTarget === 'NOTICE') {
              this.$router.push('/help/notice')

            } else if (contentsType === 'POST') {
              this.$hiClass.posts
                .read(postUrl)
                .then(res => {
                  this.$log.debug(this.$options.name, ' onClickContent() res => ', res)
                  this.setItemDetailObj(res.data)
                })
                .catch(err => {
                  this.$log.debug(this.$options.name, ' onClickContent() error => ', err)
                })

            } else {
              const validate = require('uuid-validate')
              const parameter = validate(contents) ? `?postId=${contents}` : ''
              window.open(`/main/home${parameter}`, postId)

            }
           break
          }
          default: {
            window.open(contents, postId)
          }
        }
      }
    },
    onClickCloseButton(type) {
      this.beforeClose(type)
    },
    beforeClose(type) {
      if (type) {
        const pop = { currentId: this.currentId }
        this.setPopItemNotToday(pop)
      }
      this.close()
    },
    close() {
      this.$emit('toggle-banner', false)
    },
    setPopItemNotToday(pop) {
      let toDay = this.$moment().format('YYYYMMDD')
      let storage = JSON.parse(localStorage.NOTTODAY || null) || {},
        replay = storage[toDay] || null

      if (replay) {
        if (!replay.find(item => item.currentId === pop.currentId)) {
          replay.push({ currentId: pop.currentId })
          localStorage.NOTTODAY = JSON.stringify(storage)
        }
      } else {
        replay = {}
        replay[toDay] = [{ currentId: pop.currentId }]

        localStorage.NOTTODAY = JSON.stringify(
          Object.assign(storage, replay)
        )
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

  }
}
</script>

<style lang="scss" scoped>
.l-top-banner {
  z-index: 13;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #181241;
  transition: all 0.3s;
}
.l-top-banner .top-banner__inner {  
  min-width: 768px;
  max-width: 1240px;
  width: auto;
  padding: 0 20px;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
  text-align: center;
}
.l-top-banner .top-banner__inner a {
  overflow: hidden;
  display: inline-block;
  max-width: 1200px;
  width: 100%;
  vertical-align: top;
}
.l-top-banner .top-banner__inner img {
  width: auto;
  height: 100%;
}
.l-top-banner .top-banner__inner .btn-close {
  position: absolute;
  top: 50%;
  right: 20px;
  display: inline-block;
  width: auto;
  height: 20px;
  margin-top: -10px;
  color: #fff;
  font-size: 12px;
  line-height: 1;
  font-weight: 400;
  vertical-align: middle;
}
.l-top-banner .top-banner__inner .btn-close::after {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url('~@/assets/img/icon/icon_close_white.svg') no-repeat;
  background-position: center;
  background-size: cover;
  vertical-align: middle;
  margin-left: 5px;
}

.l-top-banner {
  .top-banner {
    &__inner {
      padding: 0;
      img {
        height: 50px;
      }
      .banner-hide-txt {
        margin-left: 8px;
        display: inline;
      }
      @media (max-width: 978px) {
        .banner-hide-txt {
          display: none !important;
        }
      }
    }
  }
}
@media (max-width: 768px) {
  .l-top-banner {
    display: none;
  }
}
</style>