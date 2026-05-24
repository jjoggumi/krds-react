<template>
  <div class="modal" v-show="visible">
    <div class="modal-cont" :class="size" :style="modalStyle">
      <div class="modal-cont-inner">
        <!-- 제목 -->
        <div class="title-wrap" v-if="title || description">
          <h2 v-if="title">{{ title }}</h2>
          <p v-if="description" class="description">{{ description }}</p>
        </div>

        <!-- 본문 (스몰 모드에서는 없음) -->
        <div v-if="size !== 'small'" :class="['content-wrap', { 'no-buttons': hasNoButtons }]">
          <slot name="content"></slot>
        </div>

        <!-- 버튼 -->
        <div
          v-if="!hideCancel || !hideConfirm"
          :class="['btn-wrap', !hideCancel && !hideConfirm ? '' : 'single-btn', size === 'small' ? 'small-btn' : '']"
        >
          <slot name="footer">
            <button v-if="!hideCancel" class="button outline" @click="cancelModal">
              {{ cancelText }}
            </button>
            <button v-if="!hideConfirm" class="button primary" :disabled="confirmDisabled" @click="confirmModal">
              {{ confirmText }}
            </button>
          </slot>
        </div>

        <!-- 닫기 버튼 (스몰 사이즈에서는 숨김) -->
        <div v-if="size !== 'small'" class="modal-close-btn" @click="closeModal"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    value: { type: Boolean, default: false },
    title: String,
    description: String,
    cancelText: { type: String, default: '취소' },
    confirmText: { type: String, default: '확인' },
    hideCancel: { type: Boolean, default: false },
    hideConfirm: { type: Boolean, default: false },
    confirmDisabled: { type: Boolean, default: false },
    width: { type: String, default: '640px' },
    height: { type: String, default: 'auto' },
    size: { type: String, default: 'default' },
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
    modalStyle() {
      if (this.size === 'small') {
        return {
          width: '360px',
          maxHeight: '500px',
        };
      }
      return {
        width: this.width,
        height: this.height,
        maxHeight: '80vh',
      };
    },
    hasNoButtons() {
      return this.hideCancel && this.hideConfirm;
    },
  },
  watch: {
    visible(newVal) {
      document.body.style.overflow = newVal ? 'hidden' : '';
    },
  },
  methods: {
    closeModal() {
      this.visible = false;
      this.$emit('close');
    },
    cancelModal() {
      this.closeModal(); // 기본 동작: 닫기
      this.$emit('cancel'); // 추가 이벤트
    },
    confirmModal() {
      this.$emit('confirm');
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;

  .modal-cont {
    background: #fff;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.small {
      border-radius: 16px;
      .modal-cont-inner {
        padding: 36px 28px 24px 28px;
        .title-wrap {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 0;
          align-items: center;
          h2 {
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            line-height: 26px;
          }
          .description {
            font-size: 15px;
            color: #616161;
            text-align: center;
            line-height: 24px;
          }
        }
        .btn-wrap {
          padding: 32px 0 0 0;
          height: 75px;
        }
      }
    }

    .modal-cont-inner {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;

      /* 닫기 버튼 */
      .modal-close-btn {
        position: absolute;
        width: 20px;
        height: 20px;
        top: 18px;
        right: 18px;
        background-color: #616161;
        cursor: pointer;
        mask: url('~@/assets/img/icon/icon_close_20.svg') no-repeat center / cover;
        -webkit-mask: url('~@/assets/img/icon/icon_close_20.svg') no-repeat center / cover;
      }

      .title-wrap {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 40px 30px 25px 30px;
        justify-content: center;
        align-items: center;
        gap: 15px;
        h2 {
          font-family: 'Pretendard Variable', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #000;
        }
        .description {
          font-size: 16px;
          font-weight: 400;
          color: #616161;
          text-align: center;
          line-height: 24px;
        }
      }

      .content-wrap {
        padding: 0 40px;
        text-align: left;
        overflow-y: auto;
        flex: 1 1 auto;

        &.no-buttons {
          padding-bottom: 40px;
        }

        &::-webkit-scrollbar {
          width: 16px;
        }
        &::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 40px;
          border: 4px solid transparent;
          background-clip: content-box;
        }
        &::-webkit-scrollbar-track {
          background: #fff;
          border-radius: 40px;
          margin: 2px;
        }
        &::-webkit-scrollbar-button {
          display: none;
          height: 0;
          width: 0;
        }
      }

      .btn-wrap {
        display: flex;
        height: 109px;
        padding: 30px 40px 0 40px;
        align-items: flex-start;
        justify-content: center;
        gap: 8px;

        &.single-btn {
          .button {
            width: 100%;
          }
        }

        button {
          display: flex;
          font-size: 16px;
          font-weight: 700;
          height: 44px;
          padding: 0 16px;
          justify-content: center;
          align-items: center;
          gap: 10px;
          width: 140px;
          border-radius: 40px;
          &.primary {
            color: #fff;
            background: #ff8737;
            &:disabled {
              background: #d6d6d6;
              color: #9e9e9e;
              cursor: not-allowed;
            }
          }
          &.outline {
            color: #616161;
            background: #fff;
            border: 1px solid #d6d6d6;
          }
        }
      }
    }
  }
}
</style>
