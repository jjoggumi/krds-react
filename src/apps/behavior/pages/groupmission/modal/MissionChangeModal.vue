<template>
  <div>
    <Modal
      v-show="true"
      title="미션 선택"
      description="원하는 미션을 선택하여 단체 미션을 시작하세요."
      cancelText="취소"
      confirmText="시작"
      :confirmDisabled="!selectedTemplateId"
      @confirm="isDone ? changeMission() : openMissionStartConfirmModal()"
      @close="$emit('closeMissionChangeModal')"
      width="700px"
    >
      <template #content>
        <div class="mission-change-content">
          <div class="mission-header">
            <button
              class="mission-register-btn"
              @click="
                $emit('openMissionFormModal', {
                  title: '미션 등록',
                  cancelText: '취소',
                  confirmText: '확인',
                  confirm: 'createMission',
                  mode: 'create',
                })
              "
            >
              <i class="ico-plus"></i>
              미션 등록
            </button>
          </div>
          <div class="mission-list">
            <div
              v-for="mission in missions"
              :key="mission.templateId"
              class="mission-item"
              :class="{
                selected: selectedTemplateId === mission.templateId,
                disabled: isProgressTemplate(mission.templateId),
              }"
              @click="!isProgressTemplate(mission.templateId) && setSelectedTemplateId(mission.templateId)"
            >
              <div class="mission-info">
                <div class="mission-icon-wrapper">
                  <div class="mission-icon">
                    <img src="@/assets/img/svg/ico-mission-water.svg" alt="이슬" />
                  </div>
                  <div class="mission-number">{{ mission.goal }}</div>
                </div>
                <div class="mission-name">{{ mission.name }}</div>
              </div>
              <div class="mission-right">
                <div v-if="isProgressTemplate(mission.templateId)" class="mission-status">진행중</div>
                <div v-else-if="isSelected(mission.templateId) && !isProgressTemplate(mission.templateId)" class="mission-selected">
                  <i class="ico-check"></i>
                  <span class="mission-selected-text">미션선택</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- 완료되지 않은 미션이 있습니다 확인 모달 -->
    <Modal
      v-show="showMissionStartConfirmModal"
      title="완료되지 않은 미션이 있습니다."
      description="미션을 변경하면 현재 미션의 진행 내역이 모두 초기화됩니다. 그래도 새 미션을 시작하시겠습니까?"
      cancelText="취소"
      confirmText="새 미션 시작"
      @confirm="changeMission"
      @close="cancelStartMission"
      size="small"
    >
      <template #content>
        <div class="mission-start-confirm-content"></div>
      </template>
    </Modal>
  </div>
</template>

<script lang="js">
import Modal from '@/apps/behavior/components/common/Modal.vue';
import { startGroupMission } from '@hiclass/core';
import { mapState } from 'vuex';

export default {
  name: 'MissionChangeModal',
  components: { Modal },
  data() {
    return {
      selectedTemplateId: null,
      showMissionStartConfirmModal: false,
    };
  },
  props: {
    missions: {
      type: Array,
      required: true,
    },
    missionInProgressTemplateId: {
      type: String,
    },
    isProgress: {
      type: Boolean,
      required: true,
    },
    isDone: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
  },
  methods: {
    isProgressTemplate(templateId) {
      if (!templateId) return false;
      return this.isProgress && this.missionInProgressTemplateId === templateId;
    },
    isSelected(templateId) {
      return this.selectedTemplateId === templateId;
    },
    setSelectedTemplateId(templateId) {
      this.selectedTemplateId = templateId;
    },
    openMissionStartConfirmModal() {
      this.isShow = false;
      this.showMissionStartConfirmModal = true;
    },
    cancelStartMission() {
      this.setSelectedTemplateId(null);
      this.showMissionStartConfirmModal = false;
      this.isShow = true;
    },
    async changeMission() {
      try {
        const res = await startGroupMission(this.curClassroom.classroomId, this.selectedTemplateId);
        this.$emit('loadNewMission', { ...res, point: 0 });
        this.$emit('closeMissionChangeModal');
      } catch (e) {
        console.error('미션 변경 실패했습니다.', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
    // iPad를 감지
    isiPad() {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
    },
  },
  mounted() {
    if (this.isiPad()) {
      document.body.classList.add('ios');
    }
  },
};
</script>

<style lang="scss" scoped>
.mission-change-content {
  .mission-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
    .mission-register-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 36px;
      padding: 0 12px;
      border-radius: 6px 8px 8px 8px;
      color: #3987f8;
      border: 1px solid #3987f8;
      background: rgba(57, 135, 248, 0.08);
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        color: #fff;
        border: 1px solid #3987f8;
        background: #3987f8;
        .ico-plus {
          filter: brightness(0) invert(1);
        }
      }
      .ico-plus {
        width: 16px;
        height: 16px;
        background: url('~@/assets/img/icon/ico-plus.svg') no-repeat;
      }
    }
  }
  .mission-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-height: 410px;
    overflow: auto;
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
      background: transparent;
      border-radius: 40px;
      margin: 2px;
    }
    /* 상하 화살표 버튼 숨기기 */
    &::-webkit-scrollbar-button {
      display: none;
      height: 0;
      width: 0;
    }
    .mission-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      background: #fff;
      cursor: pointer;
      transition: all 0.3s;
      height: 54px;
      gap: 8px;
      &:hover {
        border: 1px solid #3987f8;
        background: #fff;
      }
      &.selected {
        border: 1px solid #3987f8;
        background: rgba(57, 135, 248, 0.1);
      }
      &.disabled {
        cursor: not-allowed;
        border-color: #eef0f4;
        background: #eef0f4;
      }

      // 드래그 상태별 스타일
      &.dragging {
        opacity: 0.5;
        transform: scale(0.95);
        border: 2px dashed #3987f8;
        background: rgba(57, 135, 248, 0.05);
      }

      &.drag-over {
        border: 2px solid #3987f8;
        background: rgba(57, 135, 248, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(57, 135, 248, 0.2);
      }

      &.drag-placeholder {
        opacity: 0.7;
        border: 2px dashed #ccc;
        background: #f9f9f9;
      }
      .mission-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
        .mission-icon-wrapper {
          display: flex;
          justify-content: flex-start;
          width: 76px;
          padding: 4px 12px 4px 6px;
          align-items: center;
          gap: 2px;
          border-radius: 30px;
          background: rgba(57, 135, 248, 0.1);
          .mission-icon {
            img {
              width: 20px;
              height: 20px;
            }
          }
          .mission-number {
            color: #3987f8;
            font-size: 14px;
            font-weight: 700;
            line-height: 22px;
          }
        }
        .mission-name {
          color: #222;
          font-size: 16px;
          font-weight: 500;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .mission-right {
        display: flex;
        align-items: center;
        .mission-status {
          color: #ff8737;
          display: flex;
          width: 76px;
          height: 30px;
          min-width: 28px;
          padding: 0 10px;
          justify-content: center;
          align-items: center;
          border-radius: 20px;
          background: #fff;
        }
        .mission-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        .mission-selected {
          display: flex;
          width: 76px;
          height: 30px;
          padding: 0 8px 0 2px;
          justify-content: center;
          align-items: center;
          border-radius: 30px;
          background: #ff8737;
          .ico-check {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url('~@/assets/img/icon/ico-check-mission.svg') 0/22px no-repeat;
          }
          .mission-selected-text {
            color: #fff;
            font-size: 11px;
            font-weight: 500;
            line-height: 23px;
            letter-spacing: -0.2px;
          }
        }
      }
    }
  }
}
.ios {
  .mission-change-content {
    .mission-list {
      max-height: 235px;
    }
  }
}
@media screen and (orientation: landscape) and (max-width: 1360px) {
  .mission-change-content {
    .mission-list {
      max-height: 235px;
    }
  }
}
</style>
