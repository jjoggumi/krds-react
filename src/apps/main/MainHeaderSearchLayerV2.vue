<template>
  <div
    class="header-search-layer show"
    :style="layerStyle"
    :class="{ 'calendar-open': isCalendarOpen }"
    v-click-outside="hideSearchLayer"
  >
    <div class="search-title">게시글 검색</div>
    <hc-input-search-box
        :searchKeyword.sync="model.searchKeyword"
        :isNavSearchBar="true"
        @close-layer="closeLayer"
        @calendar-toggle="onCalendarToggle"
    />
    <!-- <div class="dim" @click="closeLayer"></div> -->
  </div>
</template>

<script>
import HcInputSearchBox from "@/components/Form/HcInputSearchBoxV2";
export default {
  name: "main-header-search-layer_v2",
  components: {HcInputSearchBox},
  data() {
    return {
      model: {
        searchKeyword: ''
      },
      isCalendarOpen: false,
      dynamicHeight: 400
    }
  },
  watch: {
    isCalendarOpen(newVal) {
      if (newVal) {
        // 달력이 열리면 즉시 측정하고 MutationObserver로 DOM 변화를 감지해 바로 업데이트
        this.measureCalendarHeight()
        // observe calendar DOM mutations to react immediately to month/day changes
        this._observer = new MutationObserver(() => {
          // measure on next paint
          requestAnimationFrame(() => this.measureCalendarHeight())
        })
        // attach to document root (calendar may be portalled)
        this._observer.observe(document.body, { childList: true, subtree: true })
      } else {
        // 달력 닫히면 인터벌 제거
        if (this._observer) {
          this._observer.disconnect()
          this._observer = null
        }
        // 높이 초기화
        this.dynamicHeight = 400
      }
    }
  },
  computed: {
    layerStyle() {
      const baseStyle = { display: 'block' }
      if (this.isCalendarOpen && this.dynamicHeight > 0) {
        baseStyle.minHeight = `${this.dynamicHeight}px`
      }
      return baseStyle
    }
  },
  mounted() {
    // this.$hiClass.toggleBodyClass('add', 'hidden')
    this._resizeHandler = () => {
      if (this.isCalendarOpen) {
        this.measureCalendarHeight()
      }
    }
    window.addEventListener('resize', this._resizeHandler)
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler)
    }
    if (this._observer) {
      this._observer.disconnect()
      this._observer = null
    }
  },
  methods: {
    closeLayer() {
      this.$emit('hide-search-layer')
    },
    onCalendarToggle(isOpen) {
      this.isCalendarOpen = isOpen
      if (isOpen) {
        // 달력이 완전히 렌더링될 때까지 대기
        this.$nextTick(() => {
          setTimeout(() => {
            this.measureCalendarHeight()
          }, 150)
        })
      }
    },
    measureCalendarHeight() {
      try {
        // 달력 컴포넌트 찾기
        const calendar = this.$el.querySelector('.popup-calendar-wrap, .calendar-wrap, [class*="calendar"]')
        if (calendar) {
          const rect = calendar.getBoundingClientRect()
          const titleHeight = 80 // 제목 + 검색박스 영역
          const padding = 60 // 여유 공간
          const calculatedHeight = Math.ceil(rect.height + titleHeight + padding)
          // 최소 280px, 최대 550px
          this.dynamicHeight = Math.max(280, Math.min(calculatedHeight, 550))
        } else {
          this.dynamicHeight = 400
        }
      } catch (e) {
        this.dynamicHeight = 400
      }
    },
    hideSearchLayer() {
      this.isCalendarOpen = false
      this.closeLayer()
    }
  }
}
</script>

<style lang="scss" scoped>
  .header-search-layer {
    display: flex;
    padding: 25px;
    width: fit-content;
    align-items: center;
    right: 60px;
    top: 64px;
    border-radius: 12px;
    border: 1px solid #CCD0D7;
    background: #FFF;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.08), 0px 0px 30px 0px rgba(0, 0, 0, 0.08);
    &.show {
      .search-title {
        color: #1D1D1D;
        font-family: var(--font-body);
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
      }
    }
    &.calendar-open {
      // min-height는 JS에서 동적으로 계산됩니다
    }
  }
</style>