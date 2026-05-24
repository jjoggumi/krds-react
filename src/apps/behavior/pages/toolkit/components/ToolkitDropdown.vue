<!--
@File(Method): ToolkitDropdown.vue
@Description: #74664 학급기록 > 수업 도구 > (mouseover) 메뉴
-->
<template>
  <div v-if="visible" 
    class="toolkit-dropdown" 
    :style="{ top: `${position.top}`, left: `${position.left}` }"
    @mouseenter="$emit('hoverin')"
    @mouseleave="$emit('hoverout')"
  >
    <a 
      class="toolkit-item" 
      v-for="item of toolkits" :key="item.type"
      href="javascript:void(0)"
      @click="openToolkit(item)"
    >
      {{ item.label }}
    </a>
  </div>
</template>
<script>
import { TOOLKITS, openToolkit } from '@/apps/behavior/pages/toolkit/toolkits.js';
import {mapActions} from "vuex";

export default {
  name: 'ToolkitDropdown',
  props: {
    targetRef: {required: true, default: null },
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      toolkits: {...TOOLKITS},
      url: process.env.VUE_APP_BASE_TOOLKIT_URL,
      params: process.env.VUE_APP_BASE_TOOLKIT_PARAMS,
      position: {top: 0, left: 0 }
    }
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    updatePosition() {
      const rect = this.targetRef?.getBoundingClientRect?.()
      if (!rect) return
      this.position = {
        top: `${rect.top + window.scrollY - 30}px`, // 원래 위치보다 살짝 위로 올라가게 처리
        left: `${rect.right + window.scrollX}px`,
      }
    },
    openToolkit(toolkit) {
      // GA 클릭 이벤트 전송
      this.triggerAnalyticsLogEvent({code: `analytics.behavior.toolkit.${toolkit.type || ""}`})
      // localhost 에서만 창이 열려있어도 새 창으로 뜨는 현상이 있음
      openToolkit(
          toolkit.type,
          window.open(`${this.url}${toolkit.path}/?${this.params}`, toolkit.type, `width=${toolkit.w},height=${toolkit.h},left=500,top=150`)
      )
    }
  },
  watch: {
    visible(val) {
      if (val) this.updatePosition()
    }
  }
}
</script>
<style scoped>
.toolkit-dropdown {
  display: flex;
  flex-direction: column;
  position: fixed;
  background-color: rgba(0, 0, 0, .8);
  width: 184px;
  height: 443px;
  border-radius: 16px;
  padding: 28px 16px;
  z-index: 999;
}
a.toolkit-item {
  font-size: 18px;
  padding: 13px;
  white-space: nowrap;
  color: #fff;
}
a.toolkit-item:hover {
  color: #FF8737;
}
</style>