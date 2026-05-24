<template>
  <div class="mission-complete-overlay">
    <div class="modal-content-wrapper">
      <div class="mission-complete-modal">
        <!-- 닫기 버튼 -->
        <button class="modal-close-btn" @click="$emit('closeMissionCompleteModal')">
          <img src="@/assets/img/icon/icon_close_white_24.svg" alt="닫기" />
        </button>

        <!-- Fanfare 애니메이션 (모달 내부) -->
        <div class="mission-complete-content">
          <div class="complete-image" :style="{ height: 'fill', minHeight: '260px' }" @click="replayConfetti">
            <lottie class="butterfly-lottie" :options="{ animationData: completeCharacter.lottie, loop: true, autoplay: true }" />
            <div v-if="showConfetti" class="modal-confetti-overlay">
              <lottie class="modal-confetti-animation" :options="FanfareLottie" :key="confettiCount" />
            </div>
          </div>
          <div class="complete-name">{{ completeCharacter.characterName }}</div>
          <div class="complete-text-section">
            <!-- 미션 배지 -->
            <div class="modal-mission-badge">
              <span class="mission-badge"
                ><span class="mission-badge-text">미션<br />달성</span></span
              >
            </div>
            <div class="complete-message">
              <p>축하합니다! 단체 미션을 달성했어요!</p>
              <h3>{{ missionName }}</h3>
            </div>
          </div>
          <div class="complete-buttons">
            <button @click="goToArchive">
              <div class="img-bg">
                <img src="@/assets/img/svg/ico-mission-gift.svg" alt="보관함" />
              </div>
              보관함으로 이동
            </button>
            <button @click="startNextMission">
              <div class="img-bg">
                <img src="@/assets/img/svg/ico-mission-bookmark.svg" alt="다음 미션" />
              </div>
              다음 미션 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import Lottie from '@/components/Lottie/Lottie';
import { mapState } from 'vuex';
import FanfareMixin from '@/apps/behavior/pages/groupmission/mixins/FanfareMixin';
import { soundEffects } from '@/apps/behavior/pages/groupmission/groupMission';
export default {
  name: 'MissionCompleteModal',
  mixins: [FanfareMixin],
  components: { Lottie },
  props: {
    completeCharacter: {
      required: true,
    },
    missionName: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
  },
  mounted() {
    // 팡파레 두 번 연속 자동 실행
    this.triggerConfetti(2010);
    this.playConfettiSound();
    setTimeout(() => {
      this.triggerConfetti(2010);
      // this.playConfettiSound();
    }, 2200); // 첫 번째 팡파레(2010ms) 끝나고 200ms 후 두 번째
  },
  methods: {
    // 폭죽 사운드 재생
    playConfettiSound() {
      if (typeof window.hiclassSoundEnabled !== 'undefined' && !window.hiclassSoundEnabled) return;
      if (soundEffects && soundEffects.confetti) {
        const audio = new Audio(soundEffects.confetti);
        audio.play();
      }
    },
    // 다음 미션 시작
    startNextMission() {
      this.$emit('openMissionChangeModal');
      this.$emit('closeMissionCompleteModal');
    },
    replayConfetti() {
      this.triggerConfetti(2010);
      this.playConfettiSound();
    },
    // 보관함으로 이동
    goToArchive() {
      this.$emit('closeMissionCompleteModal');
      this.$router.push(`/behavior-records/${this.curClassroom.classroomId}/groupmission/storage`);
    },
  },
};
</script>

<style lang="scss" scoped>
/* 미션 완료 오버레이 스타일 */
.mission-complete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;

  &.archive-popup {
    .mission-complete-modal {
      width: 1000px;
    }
  }

  .modal-content-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .mission-complete-modal {
    position: relative;
    width: 1000px;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    border-radius: 1000px;
    background: radial-gradient(50% 50% at 50% 50%, #3b4863 68.75%, rgba(59, 72, 99, 0) 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .modal-close-btn {
      position: fixed;
      top: 30px;
      right: 30px;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      /* 오버레이(상세 패널)보다 항상 위에 있도록 충분히 큰 z-index 적용 */
      z-index: 4000;
      transition: background-color 0.2s ease;
      &:hover {
        background: #000;
      }
    }
    /* 좌/우 내비게이션 버튼: 모달의 좌우 상단에 위치 (요청: 맨 위로 이동) */
    .butterfly-nav {
      position: fixed;
      top: 50%;
      width: 92px;
      height: 92px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      img {
        width: 56px;
        height: 56px;
      }
      &:disabled,
      &[disabled] {
        opacity: 0.2;
        cursor: default;
        pointer-events: none;
      }
      &.butterfly-nav-left {
        left: 60px;
      }
      &.butterfly-nav-right {
        right: 48px;
      }
      &:hover {
        border-radius: 24px;
        background: rgba(0, 0, 0, 0.6);
      }
    }
    .modal-confetti-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 15;
      pointer-events: none;

      .modal-confetti-animation {
        width: 100% !important;
        height: 100% !important;
      }
    }
    .mission-complete-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      .complete-image {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .complete-name {
        overflow: hidden;
        color: #fff;
        text-align: center;
        text-overflow: ellipsis;
        font-size: 26px;
        font-weight: 700;
        line-height: 35px;
      }
      .complete-text-section {
        position: relative;
        width: 100%;
        .modal-mission-badge {
          position: absolute;
          top: 21px;
          left: -5px;
          z-index: 10;
          .mission-badge {
            background: url('~@/assets/img/mission-bg.svg') no-repeat center/contain;
            width: 70px;
            height: 75px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            .mission-badge-text {
              position: relative;
              left: -5px;
              top: -6px;
              display: block;
              color: #fff;
              font-size: 16px;
              line-height: 19px;
              font-weight: 700;
              text-align: center;
            }
          }
        }
        .complete-message {
          position: relative;
          display: flex;
          padding: 26px 55px 26px 60px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
          border-radius: 16px;
          background: rgba(222, 220, 243, 0.3);
          margin-top: 30px;
          p {
            .butterfly-lottie {
              width: 100% !important;
              height: 100% !important;
              max-width: 500px !important;
              max-height: 500px !important;
            }
            font-size: 14px;
            color: #fff;
            line-height: 22px;
            font-weight: 400;
          }
          h3 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            line-height: 38px;
          }
        }
      }
      .complete-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        width: 100%;
        margin-top: 12px;
        button {
          display: flex;
          height: 68px;
          padding: 0 24px 0 20px;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex: 1;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: linear-gradient(108deg, rgba(255, 255, 255, 0.54) 29.29%, rgba(255, 255, 255, 0.42) 92.72%);
          cursor: pointer;
          color: #000;
          font-size: 17px;
          font-weight: 500;
          line-height: 24px;
          &:hover {
            border: 1px solid rgba(255, 255, 255, 0.8);
            outline: 1px solid rgba(255, 255, 255, 0.8);
            background: linear-gradient(108deg, rgba(255, 255, 255, 0.72) 29.29%, rgba(255, 255, 255, 0.56) 92.72%);
          }
          .img-bg {
            display: flex;
            width: 40px;
            height: 40px;
            justify-content: center;
            align-items: center;
            gap: 10px;
            aspect-ratio: 1/1;
            border-radius: 50px;
            background: rgba(255, 255, 255, 0.4);
            img {
              width: 28px;
              height: 28px;
              flex-shrink: 0;
            }
          }
        }
      }
    }
    .butterfly-detail-content {
      width: 840px;
      height: 840px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      .butterfly-image {
        display: flex;
        height: 530px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .butterfly-name {
        overflow: hidden;
        color: #fff;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
        width: 100%;
        font-size: 32px;
        font-weight: 700;
        line-height: 44px;
      }

      .butterfly-desc {
        font-size: 15px;
        color: #fff;
        font-weight: 400;
        margin-top: 4px;
        line-height: 24px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        width: 100%;
        min-width: 0;
      }
      .butterfly-text-section {
        position: relative;
        width: 100%;
        .detail-toggle {
          position: absolute;
          right: 8px;
          top: 8px;
          z-index: 999;
          .detail-toggle-topright {
            display: flex;
            height: 30px;
            padding: 0 16px;
            align-items: center;
            font-size: 13px;
            color: #000;
            font-weight: 400;
            cursor: pointer;
            border-radius: 32px;
            background: linear-gradient(108deg, rgba(255, 255, 255, 0.9) 29.29%, rgba(255, 255, 255, 0.7) 92.72%);
          }
          .detail-toggle-arrow {
            content: '';
            display: inline-block;
            position: relative;
            width: 7px;
            height: 7px;
            margin-left: 4px;
            margin-top: 2px;
            border-bottom: 1px solid #000;
            border-left: 1px solid #000;
            transform: rotate(135deg);
            vertical-align: middle;
            &.expanded {
              transform: rotate(-45deg);
              margin-top: -5px;
            }
          }
        }
        .butterfly-message {
          position: relative;
          display: flex;
          min-height: 112px;
          max-height: 232px;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: linear-gradient(108deg, rgba(255, 255, 255, 0.9) 29.29%, rgba(255, 255, 255, 0.7) 92.72%);
          margin-top: 30px;
          &.archive-expanded {
            background: transparent;
            border: none;
            box-shadow: none;
            margin-top: 60px;
            .detail-toggle {
              top: -184px;
              right: 0;
            }
          }
          .detail-list-wrap {
            position: relative;
            width: 100%;
            padding: 20px 24px 20px 20px;
            .detail-panel {
              position: relative;
              &.expanded {
                position: absolute;
                left: 0;
                bottom: calc(100% - 48px);
                width: 100%;
                height: 232px;
                z-index: 120;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.4);
                background: #fff;
                overflow: hidden;
                padding: 18px 20px;
                .detail-items {
                  > div {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                  }
                }
                .detail-badge-wrap {
                  align-items: flex-start;
                }
              }
              /* 접힌 상태: 한 줄 말줄임. 펼친 상태(.expanded)에서는 여러 줄 허용 */
              &:not(.expanded) {
                .detail-text {
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  min-width: 0;
                  display: block;
                }
              }
              &.expanded {
                /* 기존 expanded 규칙과 중복을 피하기 위해 .detail-text 줄바꿈 허용 규칙을 추가 */
                .detail-text {
                  white-space: normal;
                  overflow: visible;
                  text-overflow: initial;
                }
              }
              .detail-badge-wrap {
                display: flex;
                align-items: center;
                gap: 30px;
                .detail-badge {
                  display: flex;
                  width: 72px;
                  height: 72px;
                  justify-content: center;
                  align-items: center;
                  flex-shrink: 0;
                  aspect-ratio: 1/1;
                  border-radius: 50%;
                  background: #1d1d1d;
                  color: #fff;
                  font-size: 14px;
                  font-weight: 500;
                  line-height: 16px;
                }
                .detail-items {
                  display: flex;
                  flex-direction: column;
                  min-width: 0;
                  gap: 20px;
                  &.collapsed {
                    .detail-item {
                      &:not(:first-child) {
                        display: none;
                      }
                    }
                  }
                  .rolling-viewport {
                    overflow: hidden;
                    position: relative;
                    .rolling-inner {
                      transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
                      .detail-item {
                        box-sizing: border-box;
                      }
                    }
                  }

                  .detail-item {
                    .detail-row {
                      display: flex;
                      flex-direction: column;
                      min-width: 0;
                      gap: 4px;
                      .detail-date {
                        font-size: 14px;
                        color: #000;
                        text-align: left;
                      }
                      .detail-text {
                        font-size: 15px;
                        color: #000;
                        font-weight: 400;
                        word-break: break-word;
                        text-align: left;
                        line-height: 24px;
                        ::v-deep .mission-blue {
                          color: #1e5bd9;
                          font-weight: 700;
                        }
                        ::v-deep .mission-black {
                          color: #000;
                          font-weight: 400;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    @media (max-width: 2560px) {
      width: 1200px;
      border-radius: 1200px;
      .mission-complete-content {
        width: 1200px;
        height: 1200px;
        .complete-image {
          height: 700px;
          .butterfly-lottie {
            height: 700px;
          }
        }
      }
    }
    @media (max-width: 1920px) {
      width: 840px;
      .mission-complete-content {
        width: 840px;
        height: 840px;
        .complete-image {
          height: 530px;
          .butterfly-lottie {
            height: 530px;
          }
        }
      }
    }
    @media (max-width: 1536px) {
      width: 650px;
      .mission-complete-content {
        width: 650px;
        height: 650px;
        .complete-image {
          height: 460px;
          .butterfly-lottie {
            height: 460px;
          }
        }
      }
    }
    @media (max-width: 1360px) {
      width: 790px;
      .mission-complete-content {
        width: 790px;
        height: 790px;
        .complete-image {
          height: 360px;
          .butterfly-lottie {
            height: 360px;
          }
        }
        .complete-text-section {
          .complete-message {
            margin-top: 20px;
            padding: 12px 55px 12px 60px;
            p {
              font-size: 16px;
              line-height: 20px;
            }

            h3 {
              font-size: 24px;
              line-height: 28px;
            }
          }
          .modal-mission-badge {
            top: 13px;
          }
        }
      }
    }
    @media (max-width: 1280px) {
      width: 680px;
      border-radius: 680px;
      .mission-complete-content {
        width: 680px;
        height: 680px;
        .complete-image {
          height: 370px;
          .butterfly-lottie {
            height: 370px;
          }
        }
        .complete-text-section {
          .complete-message {
            margin-top: 20px;
            padding: 12px 55px 12px 60px;
            p {
              font-size: 16px;
              line-height: 20px;
            }

            h3 {
              font-size: 24px;
              line-height: 28px;
            }
          }
          .modal-mission-badge {
            top: 13px;
          }
        }
      }
    }
    @media (max-width: 1180px) {
      width: 750px;
      border-radius: 750px;
      .mission-complete-content {
        width: 750px;
        height: 750px;
        .complete-image {
          height: 420px;
          .butterfly-lottie {
            height: 420px;
          }
        }
        .complete-name {
          font-size: 22px;
          line-height: 26px;
        }
        .complete-text-section {
          .complete-message {
            margin-top: 20px;
            p {
              font-size: 16px;
              line-height: 20px;
            }

            h3 {
              font-size: 24px;
              line-height: 28px;
            }
          }
          .modal-mission-badge {
            top: 13px;
          }
        }
        .complete-buttons {
          gap: 8px;
          margin-top: 10px;
          button {
            height: 60px;
            padding: 0 24px 0 20px;
            font-size: 16px;
            border-radius: 12px;
            .img-bg {
              width: 40px;
              height: 40px;
              img {
                width: 24px;
                height: 24px;
              }
            }
          }
        }
      }
      .butterfly-detail-content {
        width: 750px;
        .butterfly-image {
          width: 400px;
          height: 400px;
          img {
            width: 400px;
            height: 400px;
          }
        }
        .butterfly-name {
          font-size: 22px;
          line-height: 26px;
          white-space: nowrap; /* 작은 화면에서도 제목 줄바꿈 금지 */
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .butterfly-text-section {
          .butterfly-message {
            margin-top: 20px;
          }
        }
      }
    }
    @media (max-width: 1024px) {
      width: 600px;
      border-radius: 600px;
      .mission-complete-content {
        width: 600px;
        height: 600px;
        .complete-image {
          height: 360px;
          .butterfly-lottie {
            height: 360px;
          }
        }
        .complete-name {
          font-size: 16px;
          line-height: 24px;
        }
        .complete-text-section {
          .complete-message {
            margin-top: 20px;
            padding: 12px 55px 12px 60px;
            gap: 0;
            p {
              font-size: 12px;
              line-height: 18px;
            }

            h3 {
              font-size: 18px;
              line-height: 26px;
            }
          }
          .modal-mission-badge {
            top: 14px;
            .mission-badge {
              width: 57px;
              height: 60px;
              .mission-badge-text {
                left: -3px;
                top: -5px;
                font-size: 14px;
                line-height: 16px;
              }
            }
          }
        }

        .complete-buttons {
          gap: 8px;
          margin-top: 8px;
          button {
            height: 48px;
            padding: 0 24px 0 20px;
            font-size: 14px;
            border-radius: 12px;
            .img-bg {
              width: 32px;
              height: 32px;
              img {
                width: 20px;
                height: 20px;
              }
            }
          }
        }
      }
      .butterfly-detail-content {
        width: 600px;
        .butterfly-image {
          width: 260px;
          height: 260px;
          img {
            width: 260px;
            height: 260px;
          }
        }
        .butterfly-name {
          font-size: 16px;
          line-height: 24px;
          white-space: nowrap; /* 작은 화면에서도 제목 줄바꿈 금지 */
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    @media (max-width: 768px) {
      .butterfly-detail-content {
        width: 450px;
        .butterfly-image {
          width: 200px;
          height: 200px;
          img {
            width: 200px;
            height: 200px;
          }
        }
      }
    }
    @media (max-height: 420px) {
      .mission-complete-content {
        width: 400px;
        height: 380px;
        .complete-image {
          height: 280px !important;
          .butterfly-lottie {
            height: 280px !important;
          }
        }
        .complete-name {
          font-size: 14px;
          line-height: 20px;
        }
        .complete-text-section {
          .complete-message {
            margin-top: 0;
            padding: 12px 55px 12px 60px;
            gap: 0;
            p {
              font-size: 12px;
              line-height: 16px;
            }

            h3 {
              font-size: 16px;
              line-height: 24px;
            }
          }
          .modal-mission-badge {
            top: -6px;
            .mission-badge {
              width: 57px;
              height: 60px;
              .mission-badge-text {
                left: -3px;
                top: -5px;
                font-size: 14px;
                line-height: 16px;
              }
            }
          }
        }

        .complete-buttons {
          gap: 8px;
          margin-top: 8px;
          button {
            height: 46px;
            padding: 0 24px 0 20px;
            font-size: 14px;
            border-radius: 12px;
            .img-bg {
              width: 28px;
              height: 28px;
              img {
                width: 20px;
                height: 20px;
              }
            }
          }
        }
      }
      .butterfly-detail-content {
        width: 600px;
        .butterfly-image {
          width: 260px;
          height: 260px;
          img {
            width: 260px;
            height: 260px;
          }
        }
        .butterfly-name {
          font-size: 16px;
          line-height: 24px;
          white-space: nowrap; /* 작은 화면에서도 제목 줄바꿈 금지 */
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
