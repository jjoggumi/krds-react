<!--
@File(Method): Toolkit.vue
@Description: #74664 학급기록 > 수업 도구
-->
<template>
  <div class="toolkit-wrapper">
    <div class="toolkit-gnb">
      <div class="title">수업 도구</div>
      <div class="tab">
        <div
            :ref="item.type"
            v-for="item of toolkits"
            :key="`toolkit-btn-${item.type}`"
            class="tab-item"
            @click="onClickToolkit(item)"
            @mouseenter="onTabHover(item)"
            @mouseleave="onTabLeave(item)"
        >
          <span class="tab-icon" v-if="item.icon">
            <img :src="getIconSrc(item)" alt="" />
          </span>
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { TOOLKITS, activeToolkits, openToolkit, closeToolkit } from '@/apps/behavior/pages/toolkit/toolkits.js';
import {mapActions} from "vuex";
export default {
  name: 'toolkit',
  data() {
    return {
      toolkits: [...TOOLKITS],
      url: process.env.VUE_APP_BASE_TOOLKIT_URL,
      params: process.env.VUE_APP_BASE_TOOLKIT_PARAMS,
      popupCheckTimer: null,
      hoveredType: null,
      activeTypes: []
    }
  },
  mounted() {
    this.updateActiveClass()
    this.checkPopupStatus()
  },
  beforeDestroy() {
    clearInterval(this.popupCheckTimer)
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    onTabHover(item) {
      if (item.type === 'qrcode') this.hoveredType = 'qrcode';
    },
    onTabLeave(item) {
      if (item.type === 'qrcode') this.hoveredType = null;
    },
    getIconSrc(item) {
      // QR코드 탭만 hover 또는 active일 때 white 아이콘
      if (item.type === 'qrcode') {
        const isHovered = this.hoveredType === 'qrcode';
        const isActive = this.activeTypes.includes('qrcode');
        if (item.iconActive && (isHovered || isActive)) {
          return item.iconActive;
        }
        return item.icon;
      }
      return item.icon;
    },
    checkPopupStatus() {
      this.popupCheckTimer = setInterval(() => {
        this.updateActiveClass()
      }, 1000)
    },
    updateActiveClass() {
      const newActiveTypes = [];
      for (let type of Object.keys(activeToolkits)) {
        if (activeToolkits[type].closed) {
          this.$refs[type][0].classList.remove('active');
          closeToolkit(type); // activeToolkits에서 삭제
        } else {
          this.$refs[type][0].classList.add('active');
          newActiveTypes.push(type);
        }
      }
      this.activeTypes = newActiveTypes;
      // this.$forceUpdate();
    },
    onClickToolkit(toolkit) {
      // GA 클릭 이벤트 전송
      this.triggerAnalyticsLogEvent({code: `analytics.behavior.toolkit.${toolkit.type || ""}`})
      // localhost 에서만 창이 열려있어도 새 창으로 뜨는 현상이 있음
      openToolkit(
          toolkit.type,
          window.open(`${this.url}${toolkit.path}/?${this.params}`, toolkit.type, `width=${toolkit.w},height=${toolkit.h},left=500,top=150`)
      )
      this.$refs[toolkit.type][0].classList.add('active')
      if (!this.activeTypes.includes(toolkit.type)) {
        this.activeTypes.push(toolkit.type);
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.toolkit-wrapper {
  height: 100%;
  width: 100%;
  background-color: rgb(245, 246, 247);
  .toolkit-gnb {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    min-height: 78px;
    width: 100%;
    background-color: #fff;
    .title {
      font-size: 20px;
      font-weight: 700;
      padding: 0px 15px;
      min-width: 150px;
      text-align: center;
    }
    .tab {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      .tab-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 20px 0 13px;
        line-height: 44px;
        height: 44px;
        border-radius: 23px;
        border: 1px solid #e0e0e0;
        background-color: #fff;
        color: #1d1d1d;
        font-size: 17px;
        line-height: 24px;
        font-weight: 400;
        text-align: center;
        cursor: pointer;
        &:hover {
          color: #fff;
          font-weight: 500;
          border-color: #1d1d1d;
          background-color: #1d1d1d;
        }
        &.active {
          color: #fff;
          font-weight: 500;
          border-color: #1d1d1d;
          background-color: #1d1d1d;          
        }
        .tab-icon {
          display: flex;
          align-items: center;
          width: 32px;
          height: 32px;
          img {
            aspect-ratio: 1/1;
          }
        }
      }
    }
  }
}
</style>
