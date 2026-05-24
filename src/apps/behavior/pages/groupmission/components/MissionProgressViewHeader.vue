<template>
  <div class="content-header">
    <div class="mission-left-area">
      <div class="mission-info-box">
        <span class="mission-badge">
          <span class="mission-badge-text" v-html="isProgress ? '미션' : '미션<br />달성'" />
        </span>
        <div class="mission-info-text">{{ missionName }}</div>
        <div v-if="isDone" class="mission-completed-content">
          <div class="mission-divider"></div>
          <div class="mission-completed-details">
            <img src="@/assets/img/icon/ic_partying_face.gif" alt="축하" class="party-icon" />
            <div class="mission-completed-text">
              미션 목표를 달성했습니다.<br />
              이어서 진행할 미션을 선택해주세요.
            </div>
          </div>
          <button class="next-mission-btn" @click="$emit('openMissionChangeModal')">
            <img src="@/assets/img/svg/ico-mission-bookmark.svg" alt="북마크" />
            <span class="next-mission-text">다음 미션 선택</span>
          </button>
        </div>
      </div>
    </div>
    <div class="progressbar-header">
      <button class="progressbar-btn" @click="$emit('openMissionManageModal')">
        <img src="@/assets/img/svg/ico-mission-setting.svg" alt="미션 관리" class="emoji" /><span class="mission-text">미션 관리</span>
      </button>
      <button class="progressbar-btn" :class="{'disabled': isChangeBtnDisabled}" @click="$emit('openMissionChangeModal')">
        <img src="@/assets/img/svg/ico-mission-bookmark.svg" alt="미션 변경하기" class="emoji" /><span class="mission-text">미션 변경하기</span>
      </button>
      <button class="progressbar-btn" @click="$emit('openRewardHistoryModal')">
        <img src="@/assets/img/svg/ico-mission-star.svg" alt="아이템 지급내역" class="emoji" /><span class="mission-text">아이템 지급내역</span>
      </button>
    </div>
  </div>
</template>

<script lang="js">
export default {
  name: 'MissionProgressViewHeader',
  props: {
    isProgress: {
      type: Boolean,
    },
    isDone: {
      type: Boolean,
    },
    isChangeBtnDisabled: {
      type: Boolean,
    },
    missionName: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>
.content-header {
  display: flex;
  justify-content: space-between;
  .mission-left-area {
    display: flex;
    flex-direction: column;
    gap: 30px;
    .mission-info-box {
      display: flex;
      position: relative;
      min-width: 250px;
      max-width: 500px;
      min-height: 150px;
      padding: 32px 60px 30px 100px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 10px;
      border-radius: 40px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: linear-gradient(153deg, rgba(255, 255, 255, 0.56) 0.24%, rgba(255, 255, 255, 0.4) 83.31%);
      .mission-badge {
        position: absolute;
        background: url('~@/assets/img/mission-bg.svg') no-repeat center/contain;
        width: 74px;
        height: 78px;
        flex-shrink: 0;
        top: -10px;
        left: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        .mission-badge-text {
          position: relative;
          left: -4px;
          top: -8px;
          display: block;
          color: #fff;
          font-size: 16px;
          font-family: 'Pretendard Variable', sans-serif;
          font-weight: 700;
          text-align: center;
          line-height: 17px;
          position: relative;
          z-index: 1;
        }
      }
      .mission-info-text {
        font-size: 32px;
        font-family: 'Pretendard Variable', sans-serif;
        font-weight: 700;
        color: #222;
        line-height: 44px;
        word-break: break-word;
        word-wrap: break-word;
        white-space: normal;
        max-width: 100%;
        overflow-wrap: break-word;
        letter-spacing: -1.5px;
      }
      .mission-completed-content {
        width: 100%;
        .mission-info-text {
          min-width: 250px;
          max-width: 500px;
        }
        .mission-divider {
          width: 100%;
          height: 1px;
          background: #fff;
          margin: 10px 0 12px 0;
        }
        .mission-completed-details {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          gap: 12px;
          .party-icon {
            width: 48px;
            height: 48px;
            aspect-ratio: 1/1;
            flex-shrink: 0;
          }
          .mission-completed-text {
            font-size: 18px;
            font-family: 'Pretendard Variable', sans-serif;
            font-weight: 500;
            color: #0a0a0a;
            line-height: 26px;
          }
        }
        .next-mission-btn {
          display: inline-flex;
          width: 175px;
          padding: 14px 28px 14px 20px;
          justify-content: center;
          align-items: center;
          gap: 6px;
          color: #000;
          font-size: 16px;
          font-family: 'Pretendard Variable', sans-serif;
          font-weight: 500;
          line-height: 24px;
          cursor: pointer;
          border-radius: 12px;
          border: 2px solid rgba(226, 118, 132, 0.4);
          background: linear-gradient(0deg, rgba(245, 144, 146, 0.3) 0%, rgba(245, 144, 146, 0.3) 100%), rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          margin-top: 20px;
          img {
            width: 28px;
            height: 28px;
            flex-shrink: 0;
          }
          &:hover {
            border: 2px solid #e27684;
            background: linear-gradient(0deg, rgba(245, 144, 146, 0.5) 0%, rgba(245, 144, 146, 0.5) 100%), rgba(255, 255, 255, 0.2);
          }
          .next-mission-text {
            display: inline-block;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
.progressbar-header {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  height: fit-content;
}
.progressbar-btn {
  display: flex;
  align-items: center;
  font-family: 'Pretendard Variable', sans-serif;
  height: 48px;
  font-size: 18px;
  font-weight: 500;
  color: #040404;
  min-width: 64px;
  gap: 8px;
  padding: 0 16px;
  line-height: 26px;
  cursor: pointer;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.5);
  &:hover {
    border: 1px solid #fff;
    outline: 1px solid #fff;
    background: rgba(255, 255, 255, 0.8);
  }
  &.disabled {
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(0, 0, 0, 0.1);
    pointer-events: none;
    cursor: default;
    .emoji {
      opacity: 0.6;
    }
    .mission-text {
      color: rgba(4, 4, 4, 0.4);
    }
  }
  img {
    width: 28px;
    height: 28px;
    display: block;
  }
  &:hover {
    background: #e6f0fa;
  }
}

@media (max-width: 1360px) {
  .content-header {
    .mission-left-area {
      .mission-info-box {
        max-width: 300px;
        min-height: 80px;
        padding: 20px 40px 20px 80px;
        border-radius: 20px;
        gap: 0;
        .mission-badge {
          .mission-badge-text {
            font-size: 14px;
            line-height: 15px;
            left: -3px;
            top: -4px;
          }
        }
        .mission-info-text {
          font-size: 18px;
          line-height: 25px;
        }
        .mission-completed-content {
          .next-mission-btn {
            margin-top: 12px;
          }
        }
      }
    }
    .progressbar-btn {
      font-size: 13px;
      height: 40px;
      padding: 0 12px;
      border-radius: 8px;
      img {
        width: 20px;
        height: 20px;
      }
    }
  }
}
@media (max-width: 1024px) {
  .content-header {
    .mission-left-area {
      .mission-info-box {
        .mission-completed-content {
          .mission-completed-details {
            .party-icon {
              display: none;
            }
            .mission-completed-text {
              font-size: 14px;
              line-height: 23px;
            }
          }
        }
        .mission-badge {
          width: 58px;
          height: 60px;
          top: -8px;
        }
      }
    }
  }
}
@media (max-width: 850px) {
  .progressbar-header {
    .progressbar-btn {
      gap: 4px;
      padding: 0 8px;
      font-size: 12px;
      min-width: max-content;
    }
  }
  .content-header {
    .mission-left-area {
      .mission-info-box {
        .mission-info-text {
          font-size: 14px;
          line-height: 24px;
        }
      }
    }
  }
}
@media (max-width: 780px) {
  .content-header {
    .mission-left-area {
      .mission-info-box {
        max-width: 280px;
      }
    }
  }
}
@media (min-width: 2560px) {
  .content-header {
    .progressbar-btn {
      font-size: 18px;
      height: 52px;
      padding: 0 20px;
      border-radius: 14px;
      img {
        width: 28px;
        height: 28px;
      }
    }
  }
}
</style>
