<template>
  <div class="progressbar-wrap" :class="{ 'success-wait': isDone && highestStageReached === 3 && !showMissionCompleteModal }">
    <div class="progressbar-area" :class="{ 'popup-open': showMissionCompleteModal }">
      <div class="progress-bar">
        <img class="mission-line mission-line-100" src="@/assets/img/svg/ico-mission-line.svg" alt="라인" />
        <div
          class="progress-bar-container"
          :class="{
            'progress-active': missionInProgress.point > 0,
            'gauge-shadow-pulse': isProgressing && !isMinusProgressing,
            'gauge-shadow-minus': isMinusProgressing,
          }"
        >
          <div class="progress-bg"></div>
          <div class="progress-fill" :style="{ height: `${Math.max(0, (missionInProgress.point / missionInProgress.goal) * 100)}%` }"></div>
        </div>
        <img class="mission-line mission-line-75" src="@/assets/img/svg/ico-mission-line.svg" alt="라인" />
        <img class="mission-line mission-line-35" src="@/assets/img/svg/ico-mission-line.svg" alt="라인" />
        <img class="mission-line mission-line-0" src="@/assets/img/svg/ico-mission-line.svg" alt="라인" />
        <div class="milestone milestone1">
          <div class="milestone-circle" :class="{ active: (missionInProgress.point / missionInProgress.goal) * 100 >= 100 }">
            <img src="@/assets/img/svg/ico-mission-butterfly.svg" alt="나비" />
          </div>
        </div>
        <div class="milestone milestone2">
          <div class="milestone-circle" :class="{ active: (missionInProgress.point / missionInProgress.goal) * 100 >= 70 }">
            <img src="@/assets/img/svg/ico-mission-pupa.svg" alt="번데기" />
          </div>
        </div>
        <div class="milestone milestone3">
          <div class="milestone-circle" :class="{ active: (missionInProgress.point / missionInProgress.goal) * 100 >= 30 }">
            <img src="@/assets/img/svg/ico-mission-caterpillars.svg" alt="애벌레" />
          </div>
        </div>
        <div class="milestone milestone4">
          <div class="milestone-circle" :class="{ active: (missionInProgress.point / missionInProgress.goal) * 100 >= 0 || isEggEntered }">
            <img src="@/assets/img/svg/ico-mission-egg.svg" alt="알" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
export default {
  name: 'MissionProgressBar',
  data() {
    return {
      isProgressing: false,
      isMinusProgressing: false, // 게이지 차감 애니메이션
      progressingTimeout: null,
      minusTimeout: null, // 게이지 차감 타이머
    };
  },
  props: {
    isDone: {
      type: Boolean,
      required: true,
    },
    highestStageReached: {
      type: Number,
      required: true,
    },
    showMissionCompleteModal: {
      type: Boolean,
      required: true,
    },
    missionInProgress: {
      type: Object,
      required: true,
    },
    isEggEntered: {
      type: Boolean,
      required: true,
    },
  },
  // watch: {
  //   'missionInProgress.point'(newVal, oldVal) {
  //     // 새 미션 시작(초기화) 시에는 깜빡임 애니메이션 실행하지 않음
  //     // if (oldVal === 0 && newVal === 1) return;
  //     if (newVal < oldVal) {
  //       this.isMinusProgressing = true;
  //       if (this.minusTimeout) {
  //         clearTimeout(this.minusTimeout);
  //       }
  //       this.minusTimeout = setTimeout(() => {
  //         this.isMinusProgressing = false;
  //       }, 700);
  //     } 
  //     // else if (newVal > oldVal && newVal > 0) {
  //     //   this.isProgressing = true;
  //     //   if (this.progressingTimeout) {
  //     //     clearTimeout(this.progressingTimeout);
  //     //   }
  //     //   this.progressingTimeout = setTimeout(() => {
  //     //     this.isProgressing = false;
  //     //   }, 700);
  //     // }
  //   },
  // },
  beforeDestroy() {
    if (this.progressingTimeout) {
      clearTimeout(this.progressingTimeout);
    }
    if (this.minusTimeout) {
      clearTimeout(this.minusTimeout);
    }
  },
  mounted() {
    if (this.isiPad()) {
      document.body.classList.add('ios');
    }
  },
  methods: {
    // iPad를 감지
    isiPad() {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
    },
  },
};
</script>

<style lang="scss" scoped>
.progressbar-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 80px;
  width: auto;
  right: 0;
  user-select: none;
  &.success-wait {
    transform: translateY(-40%);
  }
  .progressbar-area {
    display: inline-flex;
    height: 500px;
    margin-right: 60px;
    align-items: flex-start;
    gap: 16px;
    flex-shrink: 0;
    &.popup-open {
      position: absolute;
      top: 5px;
    }
  }
}
.progressbar-wrap {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: absolute;
  user-select: none;
  .progress-bar {
    width: 30px;
    height: 500px;
    display: flex;
    align-items: flex-start;
    position: relative;
    user-select: none;
    .progress-bar-container {
      position: relative;
      width: 30px;
      height: 500px;
      border-radius: 20px;
      position: relative;
      background: rgba(49, 49, 65, 0.7);
      overflow: hidden;
      // transition: box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
      &.gauge-shadow-pulse {
        animation: gaugeShadowPulse 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }

      @keyframes gaugeShadowPulse {
        0% {
          box-shadow:
            0 0 4px 2px #fff,
            0 0 16px 0 #0059ff;
          opacity: 1;
        }
        20% {
          box-shadow:
            0 0 12px 6px #fff,
            0 0 32px 0 #0059ff;
          opacity: 0.7;
        }
        50% {
          box-shadow:
            0 0 8px 5px #fff,
            0 0 24px 0 #0059ff;
          opacity: 1;
        }
        80% {
          box-shadow:
            0 0 12px 6px #fff,
            0 0 32px 0 #0059ff;
          opacity: 0.7;
        }
        100% {
          box-shadow:
            0 0 4px 2px #fff,
            0 0 16px 0 #0059ff;
          opacity: 1;
        }
      }
      &.gauge-shadow-minus {
        animation: gaugeShadowMinus 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }

      @keyframes gaugeShadowMinus {
        0% {
          box-shadow:
            0 0 4px 2px #fff,
            0 0 16px 0 #ff0048;
          opacity: 1;
        }
        20% {
          box-shadow:
            0 0 12px 6px #fff,
            0 0 32px 0 #ff0048;
          opacity: 0.7;
        }
        50% {
          box-shadow:
            0 0 8px 5px #fff,
            0 0 24px 0 #ff0048;
          opacity: 1;
        }
        80% {
          box-shadow:
            0 0 12px 6px #fff,
            0 0 32px 0 #ff0048;
          opacity: 0.7;
        }
        100% {
          box-shadow:
            0 0 4px 2px #fff,
            0 0 16px 0 #ff0048;
          opacity: 1;
        }
      }
      &.progress-active {
        border-radius: 20px;
        background: rgba(49, 49, 65, 0.7);
      }
      .progress-bg {
        width: 26px;
        height: 496px;
        border-radius: 13px;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) -38.42%, rgba(255, 255, 255, 0) 55.52%);
        position: absolute;
        right: 2px;
        top: 2px;
        z-index: 3;
        pointer-events: none;
      }
      .progress-fill {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        background: linear-gradient(180deg, #22c7ed 0%, #e63d86 100%);
        border-radius: 0 0 12px 12px;
        z-index: 2;
        transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: bottom;
      }
    }
  }
}
.mission-line {
  position: absolute;
  left: 0;
  width: 42px;
  z-index: 2;
  pointer-events: none;
  &.mission-line-0 {
    bottom: -4px;
    width: 54px;
  }
  &.mission-line-35 {
    bottom: calc(30% - 2px);
  }
  &.mission-line-75 {
    bottom: calc(70% - 2px);
  }
  &.mission-line-100 {
    top: -4px;
    width: 54px;
  }
}
.milestone {
  position: absolute;
  left: 46px;
  z-index: 10;
  display: flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
  &.milestone1 {
    top: 0;
  }
  &.milestone2 {
    top: 30%;
    transform: translateY(-50%);
  }
  &.milestone3 {
    top: 70%;
    transform: translateY(-50%);
  }
  &.milestone4 {
    bottom: 0;
  }
  .milestone-circle {
    display: flex;
    width: 50px;
    height: 50px;
    padding: 0 16px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    border-radius: 20px;
    outline: 1px solid rgba(18, 52, 75, 0.05);
    background: rgba(18, 52, 75, 0.25);
    transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    &.active {
      background: linear-gradient(180deg, #60bef9 0%, #e9569d 100%);
    }
    img {
      width: 40px;
      height: 40px;
    }
  }
}
@media (max-width: 1360px) {
  .progressbar-wrap {
    .progressbar-area {
      height: 360px;
      .progress-bar {
        height: 360px;
        .progress-bar-container {
          width: 20px;
          height: 360px;

          &.progress-active {
            border-radius: 20px;
            background: rgba(49, 49, 65, 0.7);
            box-shadow:
              0 0 4px 3px #fff,
              0 0 18px 0 #0059ff;
          }

          .progress-bg {
            width: 16px;
            height: 357px;
          }
        }
        .milestone-circle {
          width: 34px;
          height: 34px;
          border-radius: 12px;

          &.active {
            background: linear-gradient(180deg, #60bef9 0%, #e9569d 100%);
          }

          img {
            width: 28px;
            height: 28px;
          }
        }
      }
    }
  }
}
.ios {
  .progressbar-wrap {
    &.success-wait {
      transform: translateY(-55%);
    }
  }
  .mission-line {
    width: 46px;
    z-index: 2;
    left: -3px;
    pointer-events: none;
  }
}
@media screen and (orientation: landscape) and (max-width: 1360px) {
  .progressbar-wrap {
    &.success-wait {
      transform: translateY(-55%);
    }
  }
}
</style>
