<template>
  <div class="mission-complete-centered">
    <div v-if="character && character.lottie && typeof character.lottie === 'object'" class="center-butterfly-animation">
      <div
        class="center-butterfly-image-wrap"
        role="button"
        tabindex="0"
        @click.stop="
          setBubbleText();
          triggerConfetti(2010);
          playConfettiSound();
        "
        @keydown.enter.prevent="
          triggerConfetti(2010);
          playConfettiSound();
        "
        @keydown.space.prevent="
          triggerConfetti(2010);
          playConfettiSound();
        "
      >
        <div v-if="showConfetti && FanfareLottie" class="modal-confetti-overlay">
          <lottie class="modal-confetti-animation" :options="FanfareLottie" :key="confettiCount" />
        </div>
        <lottie class="center-butterfly-big" :options="{ animationData: character.lottie, loop: true, autoplay: true }" />
      </div>
      <transition name="bubble-rise-fade">
        <SpeechBubble v-if="showBubble" :bubble-style="speechBubbleStyle" :bubble-text="bubbleText" />
      </transition>
    </div>
  </div>
</template>

<script lang="js">
import { successMessages } from '@/apps/behavior/pages/groupmission/groupMission';
import Lottie from '@/components/Lottie/Lottie';
import SpeechBubble from '@/apps/behavior/pages/groupmission/components/SpeechBubble.vue';
import FanfareMixin from '@/apps/behavior/pages/groupmission/mixins/FanfareMixin';
import { soundEffects } from '@/apps/behavior/pages/groupmission/groupMission';

export default {
  name: 'MissionCompleteView',
  mixins: [FanfareMixin],
  components: { SpeechBubble, Lottie },
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      bubbleText: successMessages[0],
      showBubble: true,
    };
  },
  props: {
    character: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // 말풍선 위치 (화면 크기에 반응형)
    speechBubblePosition() {
      if (this.windowWidth <= 700) {
        return { top: '-13%' };
      } else if (this.windowWidth <= 800) {
        return { top: '-10%' };
      } else if (this.windowWidth <= 1024) {
        return { top: '-5%' };
      } else if (this.windowWidth <= 1180) {
        return { top: '2%' };
      } else if (this.windowWidth <= 1280) {
        return { top: '13%' };
      } else if (this.windowWidth <= 1360) {
        return { top: '14%' };
      } else if (this.windowWidth <= 1440) {
        return { top: '2%' };
      } else if (this.windowWidth <= 1536) {
        return { top: '9%' };
      } else if (this.windowWidth <= 1920) {
        return { top: '-2%' };
      }
      return { top: '-25%' }; // 2560px
    },
    speechBubbleStyle() {
      let scale = 1;

      if (this.windowWidth <= 480) {
        scale = 0.9;
      } else if (this.windowWidth <= 768) {
        scale = 1;
      } else if (this.windowWidth <= 1024) {
        scale = 1.3;
      } else if (this.windowWidth <= 1180) {
        scale = 1.3;
      } else if (this.windowWidth <= 1280) {
        scale = 1.2;
      } else if (this.windowWidth <= 1360) {
        scale = 1.1;
      } else if (this.windowWidth <= 1440) {
        scale = 0.8;
      } else if (this.windowWidth <= 1640) {
        scale = 0.9;
      } else if (this.windowWidth <= 1920) {
        scale = 1;
      } else if (this.windowWidth <= 2560) {
        scale = 1.2;
      }
      return {
        position: 'absolute',
        top: this.speechBubblePosition.top,
        left: this.speechBubblePosition.left,
        scale: scale,
        pointerEvents: 'none',
      };
    },
  },
  mounted() {
    this.setBubbleText();
    this.triggerConfetti(2010);
    this.playConfettiSound();
    // 윈도우 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', this.updateWindowSize);
  },
  beforeDestroy() {
    // 리사이즈 이벤트 리스너 제거
    window.removeEventListener('resize', this.updateWindowSize);
  },
  methods: {
    // 윈도우 크기 업데이트
    updateWindowSize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },
    setBubbleText() {
      const randomIndex = Math.floor(Math.random() * successMessages.length);
      this.bubbleText = successMessages[randomIndex];
      // 말풍선 사라졌다가 다시 등장
      this.showBubble = false;
      this.$nextTick(() => {
        setTimeout(() => {
          this.showBubble = true;
        }, 500); // 트랜지션 재실행을 위한 짧은 딜레이
      });
    },
    playConfettiSound() {
      if (typeof window.hiclassSoundEnabled !== 'undefined' && !window.hiclassSoundEnabled) return;
      if (soundEffects && soundEffects.confetti) {
        const audio = new Audio(soundEffects.confetti);
        audio.play();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.mission-complete-centered {
  position: fixed !important;
  top: 60% !important;
  left: 58% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 1000 !important;
  width: 100vw !important;
  height: 100vh !important;
  pointer-events: none !important;
  // 말풍선 아래에서 위로 올라가며 페이드 인/아웃 애니메이션
  .bubble-rise-fade-enter-active,
  .bubble-rise-fade-leave-active {
    transition:
      opacity 0.5s cubic-bezier(0.22, 0.9, 0.36, 1),
      transform 0.5s cubic-bezier(0.22, 0.9, 0.36, 1);
  }
  .bubble-rise-fade-enter {
    opacity: 0;
    transform: translateY(20px);
  }
  .bubble-rise-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
  }
  .bubble-rise-fade-leave {
    opacity: 1;
    transform: translateY(0);
  }
  .bubble-rise-fade-leave-to {
    opacity: 0;
    transform: translateY(-40px);
  }
  // 말풍선 페이드 인/아웃 애니메이션
  .bubble-fade-enter-active,
  .bubble-fade-leave-active {
    transition: opacity 0.5s cubic-bezier(0.22, 0.9, 0.36, 1);
  }
  .bubble-fade-enter {
    opacity: 0;
  }
  .bubble-fade-enter-to {
    opacity: 1;
  }
  .bubble-fade-leave {
    opacity: 1;
  }
  .bubble-fade-leave-to {
    opacity: 0;
  }
  .center-butterfly-animation {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    pointer-events: none !important; 
    .center-butterfly-big {
      width: 320px;
      height: auto;
      display: block;
      margin: 0 auto;
      cursor: pointer;
      transform-origin: center center !important;
      will-change: transform, opacity;
      /* 빠르게 페이드인하며 커지는 노티 효과 */
      animation: notiAppear 0.36s cubic-bezier(0.2, 0.85, 0.2, 1) both;
    }
    @keyframes notiAppear {
      0% {
        opacity: 0;
        transform: scale(0.45);
      }
      60% {
        opacity: 1;
        transform: scale(1.06);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    .center-butterfly-image-wrap {
      pointer-events: auto !important;
      position: relative;
      .modal-confetti-overlay {
        transform: scale(1.5);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;
        z-index: 15;
        pointer-events: none;
      }
      .center-butterfly-big {
        position: relative;
        z-index: 1;
      }
    }
    @media (max-width: 2560px) {
      .center-butterfly-image-wrap {
        transform: scale(1.2);
      }
    }
    @media (max-width: 1920px) {
      .center-butterfly-image-wrap {
        transform: scale(1);
      }
    }
    @media (max-width: 1760px) {
      .center-butterfly-image-wrap {
        transform: scale(0.9);
      }
    }
    @media (max-width: 1600px) {
      .center-butterfly-image-wrap {
        transform: scale(0.7);
      }
    }
    @media (max-width: 1440px) {
      .center-butterfly-image-wrap {
        left: 0%;
        transform: scale(0.7);
      }
    }
    @media (max-width: 1280px) {
      .center-butterfly-image-wrap {
        transform: scale(0.7);
      }
    }
    @media (max-width: 1180px) {
      .center-butterfly-image-wrap {
        transform: scale(0.9);
      }
    }
    @media (max-width: 1024px) {
      .center-butterfly-image-wrap {
        transform: scale(1);
      }
      .center-butterfly-animation {
        .center-butterfly-big {
          transform: scale(0.85) !important;
        }
      }
    }
    @media (max-width: 768px) {
      .center-butterfly-image-wrap {
        transform: scale(0.9);
      }
      .center-butterfly-animation {
        .center-butterfly-big {
          transform: scale(0.7) !important;
        }
      }
    }
  }
}
</style>
