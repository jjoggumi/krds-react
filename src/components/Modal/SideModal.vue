<template>
  <transition name="slide-modal">
  <div
    class="side-modal"
    v-if="isOpen"
    ref="sideModal"
    :style="{ width: modalWidth + 'px', transition: isResizing ? 'none' : '0.3s ease' }"
  >
    <!-- 상단 헤더 -->
    <div class="side-modal-header">
      <h2 class="heading" v-if="$scopedSlots['heading']">
        <slot name="heading"></slot>
      </h2>
      <div class="desc" v-if="$scopedSlots['desc']">
        <slot name="desc"></slot>
      </div>
      <HiButton class="btn-close" color="link" @click="closeModal">
        <HiIcon color="black" name="ico-close" size="16" />
      </HiButton>
    </div>
    <!-- 본문 -->
    <div class="side-modal-cont-wrap" :class="{ 'has-footer': $scopedSlots['footer']}">
      <div class="side-modal-cont custom-scr">
        <slot name="content"></slot>
      </div>
    </div>
    <!-- 리사이즈 핸들 -->
    <div
      class="resize-handle"
      @mouseenter="showCustomCursor"
      @mouseleave="hideCustomCursor"
      @mousedown="startResizing"
    >
    </div>
    <div
      v-show="showCursor"
      :style="{ top: cursorY + 'px', left: cursorX + 'px' }"
      class="custom-cursor-follow"
      ref="customCursor"
    >
      <img src="@/assets/img/icon/icon_resize_arrow.svg" class="resize-arrow" />
    </div>
    <!-- 하단 버튼 -->
    <div class="side-modal-footer" v-if="$scopedSlots['footer']">
      <slot name="footer"></slot>
    </div>
  </div>
  </transition>
</template>

<script>
export default {
  name: "SideModal",
  props: {
    size: {
      type: String,
      default: 'md',
      validator: val=> [
        'sm',
        'md',
        'lg',
        'xl'
      ].includes(val)
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: null
    },
    showFooter: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      modalWidth: 800,
      isResizing: false,
      startX: 0,
      startWidth: 0,
      showCursor: false,
      cursorX: 0,
      cursorY: 0,
    };
  },
  mounted() {
    this.updateModalWidth();
    window.addEventListener('resize', this.updateModalWidth);
    window.addEventListener('mousemove', this.trackMouse);
    window.addEventListener('mouseup', this.stopResizing);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateModalWidth);
    window.removeEventListener('mousemove', this.trackMouse);
    window.removeEventListener('mouseup', this.stopResizing);
  },
  methods: {
    updateModalWidth() {
      const winW = window.innerWidth;
      const sidebarWidth = this.isSidebarCollapsed ? 80 : 240;
      const marginRight = 30;
      const maxAvailableWidth = winW - sidebarWidth - marginRight;
      let width;
      switch (this.size) {
        case 'sm':
          width = 400;
          break;
        case 'md':   
          width = 800;
          break;
        case 'lg':
          width = 1200;
          break;
        case 'xl':
          width = Math.min(maxAvailableWidth, 1613); // maxAvailableWidth를 고려
          break;
      }
      this.modalWidth = width;
    },
    showCustomCursor() {
      this.showCursor = true;
    },
    hideCustomCursor() {
      this.showCursor = false;
    },
    trackMouse(e) {
      if (this.showCursor) {
        this.cursorX = e.clientX - 20;
        this.cursorY = e.clientY - 20;
      }
      if (this.isResizing) {
        const diff = this.startX - e.clientX;
        this.modalWidth = Math.min(Math.max(400, this.startWidth + diff), window.innerWidth * 0.8);
      }
    },
    startResizing(e) {
      this.isResizing = true;
      this.startX = e.clientX;
      this.startWidth = this.modalWidth;
      e.preventDefault();
    },
    stopResizing() {
      this.isResizing = false;
    },
    closeModal() {
      this.$emit('close');
    }
  },
  watch: {
    size() {
      this.updateModalWidth();
    },
    isOpen(val) {
      if (val) {
        this.updateModalWidth();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.side-modal {
  position: fixed;
  top: 70px;
  right: 0;
  height: calc(100% - 70px);
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: width 0.2s ease;
  width: 480px;
  min-width: 320px;
  max-width: 80vw;
  z-index: 10;
  overflow: hidden;
  border-left: 1px solid var(--gray-05);  
  transition: 0.3s ease;
  .side-modal-header {
    flex: 0 0 auto;  
    margin: 0 40px; 
    padding: 38px 0px 10px 0px; 
    border-bottom: 1px solid var(--gray-05);
    h2 {
      margin: 0;
      color: #1D1D1D;
      font-family: var(--font-body);
      font-size: 22px;
      font-weight: 700;
      line-height: 30px;
      letter-spacing: -0.5px;
    }
    .desc {
      font-family: var(--font-body);
      font-size: 14px;
      color: #9E9E9E;
      font-weight: 500;
      line-height: 22px;
    }
    .btn-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;      
      width: 36px;
      height: 36px;
    }
  }
  .side-modal-cont-wrap {
    flex: 1 1 auto;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    .side-modal-cont {
      padding: 0px 40px 60px 40px;
      flex: 1;
      overflow-y: auto;
    }
    &.has-footer {
      .side-modal-cont{
        padding-bottom: 30px;
      }
    }
  }
  .resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 12px;
    cursor: none;
    z-index: 200;
    &:hover .custom-cursor {
      opacity: 1;
    }
  }
  .custom-cursor-follow {
    position: fixed;
    pointer-events: none;
    width: 40px;
    height: 40px;
    z-index: 9999;
    user-select: none;
    .resize-arrow {
      position: absolute;
      width: 40px;
      height: 40px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }  
  .side-modal-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex: 0 0 auto;
    padding: 0 40px 30px 40px;
    ::v-deep button{
      width: 150px;
    }
    button {
      width: 150px;
    }
  }
}
</style>
<style lang="scss">
.slide-modal-enter-active,
.slide-modal-leave-active {
  transition: 0.3s ease;
}
.slide-modal-enter,
.slide-modal-leave-to {
  transform: translateX(100%) !important;
  opacity: 0;
}
.slide-modal-enter-to,
.slide-modal-leave {
  transform: translateX(0%) !important;
  opacity: 1;
}
</style>