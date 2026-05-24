<!--
@File(Method): StickerPopup.vue
@Author: -
@Date Created: -
@Description: 스티커 팝업
@Modified: 2025-06-23 - #72346 하이톡 투표하기 - 스티커 리스트 컴포넌트 css scope
-->

<template>
  <div v-click-outside="closePopup" class="emoticon-select-popup">
    <!-- 스티커 팩 생성 -->
    <!-- <button @click="createSticker" style="width: 100px;">
      스티커 팩 / 스티커 생성
    </button> -->
    <!-- // 스티커 팩 생성 -->

    <!-- 선택한 스티커 팩 스티커 목록 -->
    <div class="scrollbar-outer">
      <div class="emoticon-item-wrap">
        <div
          class="emoticon-item"
          :class="{
            on: stickerItems.length > 0 && isSelectStickerPack
          }"
        >
          <ul>
            <li
              v-for="stickerItem of stickerItems"
              :key="`stickerItem-${stickerItem.stickerSeq}`"
              @click="onClickStickerItem(stickerItem)"
            >
              <img :src="stickerItem.stickerThumbnail" alt="" />
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- // 선택한 스티커 팩 스티커 목록 -->

    <!-- 스티커 팩 목록 -->
    <sticker-popup-tabs
      :select.sync="select"
      :loginUserType="$store.state.user.userType"
      :stickerItemsByPackSeq="stickerItemsByPackSeq"
      @getStickerItems="getStickerItems"
    />
    <!-- // 스티커 팩 목록 -->

    <div class="emoticon-on-icon" @click="closePopup">
      <div class="icon"></div>
    </div>

    <loading-overlay
      :active.sync="isStickerLoading"
      :can-cancel="false"
      :is-full-page="false"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0.3)'"
    />
  </div>
</template>

<script>
import StickerPopupTabs from './StickerPopupTabs'
import LoadingOverlay from 'vue-loading-overlay'
import {cloneDeep} from "lodash";
import {remoteConfig} from "@/plugins/firebase";

export default {
  name: 'sticker-popup',
  components: {
    StickerPopupTabs,
    LoadingOverlay
  },
  props: {
    readOnly: {
      type: Boolean
    }
  },
  data() {
    return {
      isStickerLoading: false,
      select: {
        stickerPack: {},
        stickerItem: {}
      },
      stickerItems: [],
      stickerItemsByPackSeq: {}
    }
  },
  localStorage: {
    stickerItemsByPackSeq: {
      type: Object,
      default: {}
    }
  },
  computed: {
    isSelectStickerPack() {
      return this.select.stickerPack.packSeq !== undefined
    }
  },
  watch: {
    'select.stickerPack.packSeq'(val) {
      if (val !== undefined) {
        this.$nextTick(() => {
          this.$jqueryUtil.scrollbar()
        })
      }
    }
  },
  created() {
    this.stickerItemsByPackSeq = this.$localStorage.get('stickerItemsByPackSeq')
  },
  mounted() {
    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar()
    })
  },
  destroyed() {},
  methods: {
    closePopup() {
      this.$emit('closePopup')
    },

    getStickerItems() {
      const selectPackSeq = this.select.stickerPack.packSeq
      const selectPackVersion = this.select.stickerPack.packVersion

      this.isStickerLoading = true

      const data = remoteConfig.getValue(`stickerItems_packSeq_${selectPackSeq}`)
      this.stickerItemsByPackSeq[selectPackSeq] = {
        packVersion: selectPackVersion,
        stickerItems: JSON.parse(data.asString()).stickerItems || []
      }

      this.$localStorage.set('stickerItemsByPackSeq', this.stickerItemsByPackSeq, Object)
      this.stickerItems = this.stickerItemsByPackSeq[selectPackSeq].stickerItems

      this.isStickerLoading = false
    },

    onClickStickerItem(stickerItem) {
      this.select.stickerItem = stickerItem
      this.$emit('setStickerItemUrl', this.select.stickerItem.stickerUrl)
      this.$emit('setStickerItem', cloneDeep(this.select.stickerItem))
    }
  }
}
</script>

<style lang="scss" scoped>
.emoticon-select-popup {
  display: block;
  position: absolute;
  z-index: 10; 
  bottom:33px;
  right: -18px;
  width: 468px;
  padding-top: 39px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  
  &::after {
    content: "";
    position: absolute;
    top: calc(100% - 1px);
    right: 18px;
    display: inline-block;
    border-top: 10px solid #fff;
    border-right: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
  }

  .emoticon-item-wrap {
    max-height: 250px;
    padding: 20px;
    border-radius: 4px 4px 0 0;
    background-color: transparent;

    .emoticon-item {
      display: none;

      &.on {
        display: block;
      }

      ul {
        overflow: hidden;

        li {
          float: left;
          width: 100px;
          height: 100px;
          margin: 0 8px 8px 0;
          border: 1px solid transparent;

          &:nth-child(4n) {
            margin-right: 0;
          }

          &:hover {
            background: none;
            border-color: #ccc;
            border-radius: 4px;
            cursor: pointer;
          }

          img {
            width: 100px;
            height: 100px;
          }
        }
      }
    }
  }
}

.emoticon-on-icon {
  position: absolute;
  left: 37px;
  bottom: -46px;
  right: inherit;
  width: auto;
  height: auto;
  padding: 5px 7px;
  border-radius: 4px;
  background-color: rgb(231, 232, 234);

  .icon {
    width: 22px;
    height: 22px;
    margin: 0 auto;
    border-radius: 50%;
    background: url("~@/assets/img/icon/icons_hitalk.png") -100px -50px / 200px auto no-repeat;
  }
}

</style>