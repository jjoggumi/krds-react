<template>
  <Modal
    v-show="true"
    :title="modalOption.title"
    :cancelText="modalOption.cancelText"
    :confirmText="modalOption.confirmText"
    @confirm="isCreateMode ? createMission() : updateMission()"
    @close="close(null)"
  >
    <template #content>
      <div :class="isCreateMode ? 'mission-register-content' : 'mission-edit-content'">
        <!-- 미션 삭제 버튼 -->
        <div v-if="isUpdateMode && mission.templateId !== missionInProgressTemplateId" class="mission-edit-header">
          <button class="mission-delete-btn" @click="deleteMission">
            <i class="ico-trash"></i>
            미션 삭제
          </button>
        </div>

        <div class="mission-input">
          <div class="plan-name">
            <div class="label-group">
              <span class="icon-mission-title">
                <img src="@/assets/img/svg/ico-mission-bookmark.svg" alt="미션 이름 아이콘" />
              </span>
              <p class="tit">미션 이름</p>
            </div>
            <BaseInput
              v-model="mission.name"
              placeholder="텍스트 입력"
              maxlength="30"
              width="100%"
              height="44px"
              :error="error.name"
              @input="onInputName"
            />
            <div v-if="error.name" class="input-error">미션 이름을 입력해주세요.</div>
          </div>

          <div class="plan-name">
            <div class="label-group">
              <span class="icon-mission-title">
                <img src="@/assets/img/svg/ic-mission-dew.svg" alt="미션 목표 아이콘" />
              </span>
              <p class="tit">미션 목표 (이슬 주기 횟수)</p>
            </div>
            <BaseInput
              ref="goalInput"
              :value="mission.goal"
              type="text"
              placeholder="숫자 입력"
              width="100%"
              height="44px"
              :error="error.goal"
              :deleteRight="'12px'"
              @input="onInputGoal"
            />
            <div class="input-guide" :class="{ 'error-text': error.goal }">10~9999 까지의 숫자를 입력하세요.</div>
          </div>
        </div>

        <!-- 경고 메시지 -->
        <div v-if="isUpdateMode" class="warning-message">
          <div class="warning-icon">
            <i class="ico-warning"></i>
          </div>
          <div class="warning-text">미션 목표(이슬 주기 횟수)를 수정해도 현재 진행 중인 미션에는 적용되지 않습니다. 수정된 목표는 다음 미션으로 다시 선택할 때부터 반영됩니다.</div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="js">
import BaseInput from '@/apps/behavior/components/common/BaseInput.vue';
import Modal from '@/apps/behavior/components/common/Modal.vue';
import { createGroupMission, updateGroupMission } from '@hiclass/core';
import { mapState } from 'vuex';

export default {
  name: 'MissionFormModal',
  components: { Modal, BaseInput },
  data() {
    return {
      mission: {
        name: '',
        goal: null,
      },
      error: {
        name: false,
        goal: false,
      },
    };
  },
  props: {
    modalOption: {
      title: String,
      cancelText: String,
      confirmText: String,
      confirm: String,
      mode: String,
      mission: {
        templateId: String,
        goal: Number,
        name: String,
      },
    },
    missionInProgressTemplateId: {
      type: String,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    isCreateMode() {
      return this.modalOption.mode === 'create';
    },
    isUpdateMode() {
      return this.modalOption.mode === 'update';
    },
  },
  mounted() {
    if (this.isUpdateMode) {
      this.mission = {
        templateId: this.modalOption.mission.templateId,
        name: this.modalOption.mission.name,
        goal: this.modalOption.mission.goal,
      };
    }
  },
  methods: {
    onInputName() {
      this.error.name = false;
    },
    onInputGoal(value) {
      this.error.goal = false;

      let inputValue = value.replace(/[^0-9]/g, '');
      if (parseInt(inputValue) > 9999) {
        inputValue = 9999;
      }
      this.$refs.goalInput.setInputValue();
      this.mission.goal = isNaN(parseInt(inputValue)) ? '' : parseInt(inputValue);
    },
    validate() {
      if (this.mission.name.trim() === '') {
        this.error.name = true;
      }

      if (!this.mission.goal || this.mission.goal < 10 || this.mission.goal > 9999) {
        this.error.goal = true;
      }
    },
    async createMission() {
      this.validate();
      if (this.error.name || this.error.goal) return;

      try {
        const res = await createGroupMission(this.curClassroom.classroomId, this.mission);
        this.close(res);
      } catch (e) {
        console.error('미션 생성 실패했습니다.', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
    async updateMission() {
      this.validate();
      if (this.error.name || this.error.goal) return;

      try {
        await updateGroupMission(this.curClassroom.classroomId, this.mission.templateId, this.mission);
        this.close(this.mission);
      } catch (e) {
        console.error('미션 수정 실패했습니다.', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
    deleteMission() {
      this.$emit('openDeleteConfirm', this.mission.templateId);
    },
    close(mission) {
      if (mission) {
        const actionMap = {
          createMission: () => this.$emit('appendMission', mission),
          startMission: () => this.$emit('startMission', { ...mission, point: 0 }),
          updateMission: () => this.$emit('updateMission', mission),
        };
        actionMap[this.modalOption.confirm]();
      }

      this.$emit('closeMissionFormModal');
    },
  },
};
</script>

<style lang="scss" scoped>
.mission-input {
  display: flex;
  padding: 24px 28px 28px 28px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 4px;
  gap: 30px;
  background: #eef0f4;
  .plan-name {
    width: 100%;
    .input-counter {
      margin-top: 8px;
      font-size: 12px;
      color: #9e9e9e;
      font-weight: 400;
      text-align: right;
    }
    .input-guide {
      margin-top: 8px;
      font-size: 14px;
      color: #616161;
      font-weight: 400;
      line-height: 1.5;
      &.error-text {
        color: #ec1f2d;
      }
    }
    .input-error {
      margin-top: 8px;
      font-size: 14px;
      color: #ec1f2d;
      font-weight: 400;
    }
    .label-group {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
      .icon-mission-title {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        vertical-align: middle;
        img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
      .tit {
        font-size: 16px;
        font-weight: 500;
      }
    }
    input {
      margin-bottom: 0;
    }
  }
}
.mission-edit-content {
  .mission-edit-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
    .mission-delete-btn {
      display: flex;
      height: 36px;
      padding: 0 12px;
      justify-content: center;
      align-items: center;
      gap: 4px;
      border-radius: 6px 8px 8px 8px;
      border: 1px solid #f95f6e;
      background: rgba(240, 79, 89, 0.07);
      font-size: 14px;
      font-weight: 500;
      line-height: 22px;
      color: #f04959;
      cursor: pointer;
      &:hover {
        color: #fff;
        border: 1px solid #f95f6e;
        background: #f95f6e;
        .ico-trash {
          filter: brightness(0) invert(1);
        }
      }
      .ico-trash {
        width: 20px;
        height: 20px;
        background: url('~@/assets/img/icon/ic_bd_delete.svg') no-repeat;
      }
    }
  }
  .mission-input {
    display: flex;
    padding: 24px 28px 28px 28px;
    flex-direction: column;
    align-items: flex-start;
    border-radius: 4px;
    gap: 30px;
    background: #eef0f4;
    .plan-name {
      width: 100%;
      .input-counter {
        margin-top: 8px;
        font-size: 12px;
        color: #9e9e9e;
        font-weight: 400;
        text-align: right;
      }
      .input-guide {
        margin-top: 8px;
        font-size: 14px;
        color: #616161;
        font-weight: 400;
        line-height: 1.5;
        &.error-text {
          color: #ec1f2d;
        }
      }
      .input-error {
        margin-top: 8px;
        font-size: 14px;
        color: #ec1f2d;
        font-weight: 400;
      }
      .label-group {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 12px;
        .icon-mission-title {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          vertical-align: middle;
          img {
            width: 100%;
            height: 100%;
            display: block;
          }
        }
        .tit {
          font-size: 16px;
          font-weight: 500;
        }
      }
      input {
        margin-bottom: 0;
      }
    }
  }
  .warning-message {
    display: flex;
    height: 76px;
    padding: 16px 20px;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
    border-radius: 8px;
    background: rgba(240, 79, 89, 0.1);
    margin-top: 12px;
    .warning-icon {
      display: flex;
      width: 16px;
      height: 16px;
      justify-content: center;
      align-items: center;
      .ico-warning {
        margin-top: 6px;
        width: 16px;
        height: 16px;
        background: url('~@/assets/img/icon/ico-warring.svg') no-repeat center / contain;
        display: block;
      }
    }
    .warning-text {
      font-size: 14px;
      color: #f04f59;
      font-weight: 500;
      line-height: 22px;
      flex: 1;
    }
  }
}
</style>
