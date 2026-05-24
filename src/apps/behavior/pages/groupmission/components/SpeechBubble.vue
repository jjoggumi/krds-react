<template>
  <div class="speech-bubble" :style="bubbleStyle">
    <div class="bubble-content">
      <span class="bubble-text">{{ bubbleText }}</span>
    </div>
    <div class="bubble-tail">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="11" viewBox="0 0 32 11" fill="none">
        <path
          d="M14.0078 9.91525C10.7597 5.27524 7.37203 0.0643969 0.266056 0.000592232L0 0.000603676C0.089262 -0.000198364 0.177944 -0.000199318 0.266056 0.000592232L10.1165 0.000165939L18.3754 0.000605583L32 0.000603676C23.233 0.342365 20.5425 5.06128 17.0542 9.9405C16.2955 11.0017 14.7559 10.9839 14.0078 9.91525Z"
          fill="#313141"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="js">
export default {
  name: 'SpeechBubble',
  props: {
    bubbleStyle: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    bubbleText: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.speech-bubble {
  position: absolute;
  z-index: 10;
  // max-width: 480px;
  user-select: none;
  pointer-events: none;
  &.text-wrap {
    .bubble-content {
      max-width: 480px;
      .bubble-text {
        width: 100%;
        white-space: pre-line;
        word-break: keep-all;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }
    }
  }
  .bubble-content {
    display: inline-block;
    border-radius: 42px;
    background: #313141;
    // max-width: 90vw;
    white-space: nowrap;
    text-align: center;
    .bubble-text {
      display: block;
      color: #fff;
      font-weight: 500;
      text-align: center;
    }
  }
  .bubble-tail {
    position: absolute;
    top: 98%;
    left: 50%;
    transform: translateX(-50%);
    svg {
      display: block;
    }
  }
  @media (max-width: 2560px) {
    .bubble-content {
      padding: 16px 30px;
      .bubble-text {
        font-size: 28px;
        line-height: 38px;
      }
    }
  }
  @media (max-width: 1920px) {
    .bubble-content {
      padding: 16px 28px;
      .bubble-text {
        font-size: 20px;
        line-height: 28px;
      }
    }
  }
  @media (max-width: 1360px) {
    .bubble-content {
      padding: 12px 20px;
      .bubble-text {
        font-size: 12px;
        line-height: 18px;
      }
    }
  }
}
</style>
