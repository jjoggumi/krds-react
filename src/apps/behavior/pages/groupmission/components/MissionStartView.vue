<template>
  <div class="no-mission">
    <div class="no-mission-text">
      <div class="text-bold">아래 버튼을 눌러 나비 키우기 미션을 시작해 보세요!</div>
      <div class="text-small">
        나비알에게 이슬을 주면 애벌레, 번데기 단계를 거쳐 예쁜 나비로 자라납니다.<br />
        미션을 달성할 때마다 새로운 나비를 획득하며, 획득한 나비는 보관함에서 확인하실 수 있습니다.
      </div>
    </div>

    <button
      class="start-mission-btn"
      @click="
        $emit('openMissionFormModal', {
          title: '미션 시작하기',
          cancelText: '닫기',
          confirmText: '시작',
          confirm: 'startMission',
          mode: 'create',
        })
      "
    >
      미션 시작하기
      <span class="arrow">
        <img src="@/assets/img/icon/ico-mission-start-arrow.svg" alt="화살표" />
      </span>
    </button>

    <div class="stem-animation">
      <lottie class="stem-lottie" :options="stemDefaultLottie" />
    </div>
  </div>
</template>

<script lang="js">
import Lottie from '@/components/Lottie/Lottie';
import stemDefaultLottie from '@/assets/img/lottie/stem_default.json';

export default {
  name: 'MissionStartView',
  components: {
    Lottie,
  },
  data() {
    return {
      stemDefaultLottie: { animationData: stemDefaultLottie, loop: true, autoplay: true },
    };
  },
};
</script>

<style lang="scss" scoped>
.no-mission {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 70px;
  .no-mission-text {
    margin-bottom: 24px;
    color: #1d1d1d;
    letter-spacing: -0.5px;
    .text-bold {
      font-size: 28px;
      line-height: 44px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .text-small {
      font-size: 18px;
      font-weight: 500;
      line-height: 28px;
    }
  }
  .start-mission-btn {
    font-family: 'Pretendard Variable', sans-serif;
    display: flex;
    padding: 16px 40px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    border-radius: 34px;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    font-size: 22px;
    font-weight: 500;
    line-height: 30px;
    cursor: pointer;
    position: relative;
    z-index: 10;
    &:hover {
      background: #000;
      // transform: translateY(-2px);
    }
  }
  .stem-animation {
    position: fixed;
    bottom: -50px;
    left: 54%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 1;
    &.stem-lottie {
      transform-origin: center bottom !important;
      display: block;
    }
  }
}
@media (max-width: 1920px) {
  .no-mission {
    .stem-animation {
      bottom: -55px;
      .stem-lottie {
        width: 922px !important;
        height: 582px !important;
      }
    }
  }
}
@media (max-width: 1440px) {
  .no-mission {
    .stem-animation {
      bottom: -70px;
      .stem-lottie {
        width: 840px !important;
      }
    }
  }
}
@media (max-width: 1360px), (max-height: 650px) {
  .no-mission {
    .stem-animation {
      bottom: -60px;
      left: 58%;
      .stem-lottie {
        width: 800px !important;
      }
    }
  }
}
@media (max-width: 1180px) {
  .no-mission {
    .stem-animation {
      bottom: -80px;
      left: 48%;
      .stem-lottie {
        width: 800px !important;
      }
    }
  }
}
@media (max-width: 1024px), (max-height: 768px) {
  .no-mission {
    .stem-animation {
      bottom: -155px;
      left: 50%;
      .stem-lottie {
        width: 600px !important;
      }
    }
    .no-mission-text {
      .text-bold {
        font-size: 26px;
        line-height: 42px;
      }
      .text-small {
        font-size: 16px;
        line-height: 26px;
      }
    }
  }
}
@media (max-width: 768px) {
  .no-mission {
    .stem-animation {
      bottom: -145px;
      left: 50%;
      .stem-lottie {
        width: 550px !important;
      }
    }
  }
}
@media (max-width: 480px) {
  .no-mission {
    .stem-animation {
      bottom: -185px;
      left: 50%;
      .stem-lottie {
        width: 350px !important;
      }
    }
  }
}
@media (min-width: 2560px) {
  .no-mission {
    .stem-animation {
      bottom: -120px;
      left: 52%;
      .stem-lottie {
        width: 1340px !important;
        height: 860px !important;
      }
    }
    .no-mission-text {
      .start-mission-btn {
        font-size: 24px;
        line-height: 32px;
      }
      .text-bold {
        font-size: 34px;
        line-height: 54px;
      }
      .text-small {
        font-size: 26px;
        line-height: 42px;
      }
    }
  }
}
</style>
