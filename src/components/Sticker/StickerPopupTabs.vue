<!--
@File(Method): StickerPopupTabs.vue
@Author: -
@Date Created: -
@Description: 스티커 선택 탭 (하이톡, 댓글 등에서 사용)
@Modified: 2024-12-11 - #70428 스티커팩 RemoteConfig 적용
-->
<template>
  <div class="select-tab-wrap">
    <button
      class="prev-btn"
      :class="{
        dis: isFirstPage
      }"
      :disabled="isFirstPage"
      @click="getPrevPageItem"
    ></button>

    <ul>
      <li
        v-for="stickerPack of activeStickerPacks"
        :key="`stickerPack-${stickerPack.packSeq}`"
        :class="{
          on: isSelected(stickerPack),
          new: isNewPack(stickerPack)
        }"
        @click="onClickStickerPack(stickerPack)"
      >
        <img :src="stickerPack.packThumbnail" alt="" />
      </li>
    </ul>

    <button
      class="next-btn"
      :class="{
        dis: isLastpage
      }"
      :disabled="isLastpage"
      @click="getNextPageItem"
    ></button>
  </div>
</template>

<script>
import {remoteConfig, FirebaseRemoteConfigKey} from "@/plugins/firebase";

export default {
  name: 'sticker-popup-tabs',
  props: {
    select: {
      type: Object,
      required: true
    },
    loginUserType: {
      type: String,
      required: true
    },
    stickerItemsByPackSeq: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      // isFirstPack: false,
      // isLastPack: false,
      /**
       * 스티커 팩 ( Array )
       */
      stickerPacks: [],
      StickerPacksPagingSize: 8,
      stickerPacksByLoginUserType: {}
    }
  },
  localStorage: {
    stickerPacksByLoginUserType: {
      type: Object,
      default: {}
    }
  },
  computed: {
    currentStickerPackIndex() {
      const selectStickerPackSeq = this.select.stickerPack.packSeq || 0
      const currentStickerPackIndex =
        this.stickerPacks.findIndex(d => {
          return d.packSeq === selectStickerPackSeq
        }) || 0

      this.$log.debug(
        this.$options.name +
          ` computed currentStickerPackIndex => ${currentStickerPackIndex}`
      )

      return currentStickerPackIndex
    },
    currentStickerPackpage() {
      let page = 0

      if (this.currentStickerPackIndex >= this.StickerPacksPagingSize)
        page = Math.floor(
          this.currentStickerPackIndex / this.StickerPacksPagingSize
        )

      this.$log.debug(
        this.$options.name + ` computed currentStickerPackpage => ${page}`
      )

      return page
    },
    activeStickerPacks() {
      let pageNumber = this.currentStickerPackpage + 1
      const pageSize = this.StickerPacksPagingSize

      return this.stickerPacks.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
      )
    },
    isFirstPage() {
      return this.currentStickerPackpage + 1 === 1 ? true : false
    },
    isLastpage() {
      if (this.stickerPacks.length / this.StickerPacksPagingSize === 1)
        return true
      else {
        return this.currentStickerPackpage + 1 ===
          Math.floor(this.stickerPacks.length / this.StickerPacksPagingSize) + 1
          ? true
          : false
      }
    }
  },
  watch: {
    'select.stickerPack.packSeq'(val) {
      if (val !== undefined) {
        // if (val === this.stickerPacks[0].packSeq) this.isFirstPack = true
        // else this.isFirstPack = false

        // if (val === this.stickerPacks[this.stickerPacks.length - 1].packSeq)
        //   this.isLastPack = true
        // else this.isLastPack = false

        this.setStickerPacksByLoginUserType()
      }
    }
  },
  created() {
    this.stickerPacksByLoginUserType = this.$localStorage.get(
      'stickerPacksByLoginUserType'
    )

    this.getStickerPacks()
  },
  methods: {
    onClickStickerPack(stickerPack) {
      this.select.stickerPack = stickerPack

      this.$emit('getStickerItems')
    },
    isSelected(stickerPack) {
      return (
        this.select.stickerPack.packSeq &&
        this.select.stickerPack.packSeq === stickerPack.packSeq
      )
    },
    isNewPack(stickerPack) {
      return (
        this.stickerItemsByPackSeq[stickerPack.packSeq] &&
        stickerPack.packVersion !==
          this.stickerItemsByPackSeq[stickerPack.packSeq].packVersion
      )
    },
    getStickerPacks() {
      const data = remoteConfig.getValue(FirebaseRemoteConfigKey.STICKER_PACKS)
      this.stickerPacks = JSON.parse(data.asString()).stickerPacks
          .filter(sticker => sticker.userType.includes(this.loginUserType)) || []

      if (this.stickerPacks.length > 0) {
        _.orderBy(this.stickerPacks, ["packOrder"], ["asc"])

        // 최종 선택한 스티커 팩을 세팅
        if (this.isLastSelectedSticker())
          try {
            this.getStickerPacksByLoginUserType()
          } catch (error) {
            // 첫번째 스티커 팩을 세팅
            this.select.stickerPack = this.stickerPacks[0]
          }
        else {
          // 첫번째 스티커 팩을 세팅
          this.select.stickerPack = this.stickerPacks[0]
        }

        this.$emit('getStickerItems')

        this.setStickerPacksByLoginUserType()
      }
    },
    isLastSelectedSticker() {
      // 마지막 확인한 스티커 팩 확인
      if (this.stickerPacksByLoginUserType.lastSelectedPackSeq) return true
      else return false
    },
    getStickerPacksByLoginUserType() {
      // 마지막 확인한 스티커 팩을 세팅
      const lastSelectedPackSeq = this.stickerPacksByLoginUserType
        .lastSelectedPackSeq

      this.select.stickerPack =
        this.stickerPacks.filter(d => {
          return d.packSeq === lastSelectedPackSeq
        })[0] || {}

      if (this.select.stickerPack.packSeq === undefined)
        throw new Error('not found last selected sticker pack!')
    },
    setStickerPacksByLoginUserType() {
      this.stickerPacksByLoginUserType = {
        loginUserType: this.loginUserType,
        lastSelectedPackSeq: this.select.stickerPack.packSeq,
        stickerPacks: this.stickerPacks // array
      }

      // set localStorage
      this.$localStorage.set(
        'stickerPacksByLoginUserType',
        this.stickerPacksByLoginUserType,
        Object
      )
    },
    // getPrevItem() {
    //   const currentStickerPackIndex = this.currentStickerPackIndex
    //   let prevItemIndex = currentStickerPackIndex - 1

    //   this.select.stickerPack = this.stickerPacks[prevItemIndex]
    //   this.$emit('getStickerItems')
    // },
    // getNextItem() {
    //   const currentStickerPackIndex = this.currentStickerPackIndex
    //   let nextItemIndex = currentStickerPackIndex + 1

    //   this.$nextTick(() => {
    //     this.select.stickerPack = this.stickerPacks[nextItemIndex]
    //     this.$emit('getStickerItems')
    //   })
    // },
    getPrevPageItem() {
      const prevIndex =
        this.currentStickerPackIndex - this.StickerPacksPagingSize
      const firstIndex = 0
      this.select.stickerPack =
        this.stickerPacks[prevIndex] || this.stickerPacks[firstIndex]
      this.$emit('getStickerItems')
    },
    getNextPageItem() {
      const nextIndex =
        this.currentStickerPackIndex + this.StickerPacksPagingSize
      const lastIndex = this.stickerPacks.length - 1
      this.select.stickerPack =
        this.stickerPacks[nextIndex] || this.stickerPacks[lastIndex]
      this.$emit('getStickerItems')
    }
  }
}
</script>
<style lang="scss" scoped>
.select-tab-wrap {
  position: absolute;
  top: 0;
  width: 100%;
  background-color: #f8f8f8;
  border-radius: 10px 10px 0 0;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #eaeaea;
  }

  ul {
    float: left;
    width: calc(100% - 60px);
    height: 39px;
    overflow: hidden;

    li {
      position: relative;
      float: left;
      width: 51px;
      padding: 3px 0;
      text-align: center;
      background-color: #f8f8f8;
      border-right: 1px solid #eaeaea;

      &:first-child {
        border-left: 1px solid #eaeaea;
      }

      &.on {
        position: relative;
        z-index: 2;
        background-color: #fff;
        border-bottom: 1px solid #fff;
      }

      &:hover {
        background: #fff;
        cursor: pointer;
      }

      &.new::after {
        content: "";
        position: absolute;
        top: 4px;
        right: 4px;
        display: block;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #ff6a6a;
      }

      img {
        width: 32px;
        height: 32px;
        margin: 0 auto;
      }
    }
  }

  button {
    display: inline-block;
    width: 30px;
    height: 30px;
    vertical-align: middle;

    &.prev-btn,
    &.next-btn {
      transform: translate(10%, 25%);

      &.dis {
        background-position: -48px 0;
      }

      &:hover {
        background-position: -24px 0;
      }
    }

    &.prev-btn {
      float: left;
      left: 6px;
      background-image: url("~@/assets/img/icon_calendar_prev_arr_24.png");
    }

    &.next-btn {
      float: right;
      right: 6px;
      background-image: url("~@/assets/img/icon_calendar_next_arr_24.png");
    }
  }
}

</style>