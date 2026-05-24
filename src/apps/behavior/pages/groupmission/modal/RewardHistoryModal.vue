<template>
  <Modal v-show="isShow" title="아이템 지급 내역" @close="$emit('closeRewardHistoryModal')" :hideCancel="true" :hideConfirm="true">
    <template #content>
      <div class="item-history-content">
        <!-- 상단 요약 -->
        <div class="history-summary">
          <div class="summary-item water">
            <div class="summary-icon">
              <img src="@/assets/img/svg/ico-mission-water.svg" alt="이슬" />
            </div>
            <div class="summary-content">
              <div class="summary-label">총 지급 수</div>
              <div class="summary-text">{{ increaseCount }} 회</div>
            </div>
          </div>
          <div class="summary-item lightning">
            <div class="summary-icon">
              <img src="@/assets/img/svg/ico-mission-lightning.svg" alt="번개" />
            </div>
            <div class="summary-content">
              <div class="summary-label">총 차감 수</div>
              <div class="summary-text">{{ decreaseCount }} 회</div>
            </div>
          </div>
        </div>

        <!-- 지급내역 리스트 -->
        <div class="history-list">
          <div v-if="rewards.length === 0" class="empty-history">
            <div class="empty-icon">
              <img src="@/assets/img/icon/ic-smile.svg" alt="smile icon" width="32" height="32" />
            </div>
            <div class="empty-text">아이템 지급 내역이 없습니다.</div>
          </div>
          <div v-else class="history-items">
            <div v-for="reward in rewards" :key="reward.rewardTimestamp" class="history-item">
              <div class="item-info">
                <div class="item-icon" :class="reward.isNegative ? 'lightning' : 'water'">
                  <img v-if="reward.isNegative" src="@/assets/img/svg/ico-mission-lightning.png" alt="번개" />
                  <img v-else src="@/assets/img/svg/ico-mission-water.svg" alt="이슬" />
                </div>
                <div class="item-details">
                  <div class="item-name">{{ reward.isNegative ? '번개 치기' : '이슬 주기' }}</div>
                  <div class="item-date">
                    {{ $moment(reward.rewardTimestamp).format('yyyy.MM.DD HH:mm:ss') }}
                  </div>
                </div>
              </div>
              <div class="item-action">
                <span class="action-text" :class="reward.isNegative ? 'lightning' : 'water'"
                  >{{ `${reward.isNegative ? '-' : '+'}${reward.point}` }}회</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="js">
import Modal from '@/apps/behavior/components/common/Modal.vue';
import { mapState } from 'vuex';
import { getGroupMissionRewards } from '@hiclass/core';

export default {
  name: 'RewardHistoryModal',
  components: { Modal },
  data() {
    return {
      isShow: false,
      rewards: [],
      increaseCount: null,
      decreaseCount: null,
    };
  },
  props: {
    missionId: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
  },
  async mounted() {
    try {
      const { rewards, increaseCount, decreaseCount } = await getGroupMissionRewards(this.curClassroom.classroomId, this.missionId);
      this.rewards = rewards;
      this.increaseCount = increaseCount;
      this.decreaseCount = decreaseCount;
    } catch (e) {
      console.error('아이템 지급 내역 불러오기 실패', e);
      this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
    } finally {
      this.isShow = true;
    }
  },
};
</script>

<style lang="scss" scoped>
.item-history-content {
  .history-summary {
    display: flex;
    gap: 8px;
    padding: 8px 0 10px 0;
    .summary-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 68px;
      gap: 8px;
      padding: 12px 22px;
      border-radius: 8px;
      flex: 1 0 0;
      .summary-icon {
        width: 34px;
        height: 34px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .summary-content {
        .summary-label {
          color: #616161;
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
        }
        .summary-text {
          font-size: 18px;
          font-weight: 700;
          line-height: 26px;
        }
      }
      &.water {
        border: 1px solid rgba(57, 135, 248, 0.4);
        background: rgba(57, 135, 248, 0.12);
        .summary-text {
          color: #1890ff;
        }
      }
      &.lightning {
        border: 1px solid rgba(188, 110, 224, 0.4);
        background: rgba(188, 110, 224, 0.12);
        .summary-text {
          color: #f04f59;
        }
      }
    }
  }
  .history-list {
    max-height: 420px;
    overflow-y: auto;
    padding-left: 4px;
    &::-webkit-scrollbar {
      width: 16px; /* 전체 스크롤바 넓이 (8px thumb + 좌우 4px씩 여백) */
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
    /* 상하 화살표 버튼 숨기기 */
    &::-webkit-scrollbar-button {
      display: none;
      height: 0;
      width: 0;
    }
    .empty-history {
      display: flex;
      height: 130px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      border-radius: 8px;
      background: #eef0f4;
      .empty-icon {
        margin-bottom: 4px;
        opacity: 0.4;
      }
      .empty-text {
        font-size: 14px;
        color: #616161;
        font-weight: 500;
        line-height: 22px;
      }
    }
    .history-items {
      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        &:last-child {
          border-bottom: none;
        }
        .item-info {
          display: flex;
          align-items: center;
          gap: 12px;
          .item-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1/1;
            &.water {
              background: rgba(57, 135, 248, 0.12);
            }
            &.lightning {
              background: rgba(188, 110, 224, 0.12);
            }
            img {
              width: 22px;
              height: 22px;
            }
          }
          .item-details {
            .item-name {
              overflow: hidden;
              color: #212b36;
              text-overflow: ellipsis;
              font-size: 14px;
              font-weight: 500;
              line-height: 22px;
            }
            .item-date {
              font-size: 12px;
              color: #9e9e9e;
              font-weight: 400;
              line-height: 18px;
            }
          }
        }
        .item-action {
          margin-left: 12px;
          .action-text {
            font-size: 15px;
            font-weight: 500;
            line-height: 24px;
            &.water {
              color: #3987f8;
            }
            &.lightning {
              color: #f04f59;
            }
          }
        }
      }
    }
  }
}
</style>
