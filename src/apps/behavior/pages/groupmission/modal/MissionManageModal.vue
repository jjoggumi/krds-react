<template>
  <Modal v-show="true" title="미션 관리" :hide-cancel="true" :hide-confirm="true" @close="$emit('closeMissionManageModal')" width="750px">
    <template #content>
      <div class="mission-manage-content">
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

        <draggable
          tag="div"
          class="mission-list"
          v-model="displayMissionList"
          v-bind="dragOptions"
          handle=".mission-drag-handle"
          @start="startDrag"
          @end="isDrag = false"
        >
          <div v-for="mission in displayMissionList" :key="mission.templateId" class="mission-item">
            <div class="mission-drag-handle">
              <img src="@/assets/img/icon/ic_board_move.svg" alt="드래그" />
            </div>
            <div class="mission-info">
              <div class="mission-icon-wrapper">
                <div class="mission-icon">
                  <img src="@/assets/img/svg/ico-mission-water.svg" alt="이슬" />
                </div>
                <div class="mission-number">{{ mission.goal }}</div>
              </div>
              <div class="mission-name">{{ mission.name }}</div>
              <div class="mission-right">
                <div v-if="isProgress && missionInProgressTemplateId === mission.templateId" class="mission-status">진행중</div>
                <div class="mission-actions">
                  <div class="mission-dropdown">
                    <button
                      class="dropdown-btn"
                      :class="{ active: showMissionActionDropdown[mission.templateId] }"
                      @click.stop="toggleMissionDropdown(mission.templateId, $event)"
                    >
                      <img src="@/assets/img/icon/ico_more.svg" alt="더보기" />
                    </button>
                    <div
                      v-if="showMissionActionDropdown[mission.templateId]"
                      class="dropdown-menu"
                      :class="{
                        'dropdown-up': dropdownPosition[mission.templateId] === 'up',
                        'dropdown-down': dropdownPosition[mission.templateId] === 'down',
                      }"
                    >
                      <button
                        @click.stop="
                          $emit('openMissionFormModal', {
                            title: '미션 수정',
                            cancelText: '취소',
                            confirmText: '확인',
                            confirm: 'updateMission',
                            mode: 'update',
                            mission: mission,
                          })
                        "
                        class="dropdown-item"
                      >
                        수정하기
                      </button>
                      <button
                        v-if="missionInProgressTemplateId !== mission.templateId"
                        @click.stop="$emit('openDeleteConfirm', mission.templateId)"
                        class="dropdown-item delete"
                      >
                        삭제하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </draggable>
      </div>
    </template>
  </Modal>
</template>

<script lang="js">
import Modal from '@/apps/behavior/components/common/Modal.vue';
import { mapState } from 'vuex';
import draggable from 'vuedraggable';

export default {
  name: 'MissionManageModal',
  components: { draggable, Modal },
  data() {
    return {
      showMissionActionDropdown: {},
      dropdownPosition: {}, // 각 드롭다운의 위치 (up/down)
      isDrag: false,
      dragOptions: {
        forceFallback: true,
        fallbackClass: 'transparent',
        chosenClass: 'dragging',
        scrollSensitivity: 100,
        scrollSpeed: 10,
      },
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
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    // 드래그 중 실시간 미리보기를 위한 computed
    displayMissionList: {
      get() {
        return this.missions;
      },
      set(list) {
        this.$emit('updateMissionsSort', list);
      },
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    startDrag(event) {
      this.isDrag = true;
    },
    handleClickOutside(event) {
      if (!event.target.closest('.mission-dropdown')) {
        this.closeAllDropdowns();
      }
    },
    closeAllDropdowns() {
      this.showMissionActionDropdown = {};
      this.dropdownPosition = {};
    },
    toggleMissionDropdown(missionId, event) {
      // 다른 드롭다운들은 모두 닫고 현재 것만 토글
      const newState = {};
      const isCurrentlyOpen = this.showMissionActionDropdown[missionId];

      if (!isCurrentlyOpen) {
        // 드롭다운을 여는 경우, 위치 계산
        this.$nextTick(() => {
          const dropdownButton = event.target.closest('.dropdown-btn');
          if (dropdownButton) {
            const rect = dropdownButton.getBoundingClientRect();

            // 임시로 드롭다운을 아래로 설정해서 실제 높이 측정
            this.$set(this.dropdownPosition, missionId, 'down');

            // 드롭다운 높이 측정 및 위치 설정
            this.$nextTick(() => {
              const dropdownMenu = dropdownButton.parentElement.querySelector('.dropdown-menu');
              if (dropdownMenu) {
                dropdownMenu.style.top = rect.bottom + 4 + 'px';
                this.$set(this.dropdownPosition, missionId, 'down');
                dropdownMenu.style.left = rect.right - 105 + 'px';
              }
            });
          }
        });
        newState[missionId] = true;
      }

      this.showMissionActionDropdown = newState;
    },
  },
};
</script>

<style lang="scss" scoped>
// 미션 관리 모달 스타일
.mission-manage-content {
  .mission-header {
    display: flex;
    justify-content: flex-end;
    padding: 0 8px 8px 0;
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
    gap: 4px;
    max-height: 420px;
    min-height: 130px;
    // padding-bottom: 90px;
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
      background: #fff;
      border-radius: 40px;
      margin: 2px;
    }
    &::-webkit-scrollbar-button {
      display: none;
      height: 0;
      width: 0;
    }
    .mission-item {
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
      border-radius: 8px;
      padding: 0 8px;
      &.dragging {
        border-radius: 8px;
        border: 1px solid #9e9e9e;
        background: #fff;
        box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.12);
        padding: 0;
        .mission-info {
          border: none;
        }
      }
      &.transparent {
        opacity: 0 !important;
      }
      .mission-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        &:active {
          cursor: grabbing;
        }
        img {
          width: 24px;
          height: 24px;
        }
      }
      .mission-info {
        position: relative;
        display: flex;
        align-items: center;
        height: 56px;
        padding: 12px 12px 12px 16px;
        gap: 8px;
        flex: 1;
        min-width: 0;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: #fff;
        .mission-icon-wrapper {
          display: flex;
          width: 76px;
          padding: 4px 12px 4px 6px;
          align-items: center;
          gap: 2px;
          border-radius: 30px;
          background: rgba(57, 135, 248, 0.1);
        }
        .mission-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 16px;
            height: 16px;
          }
        }
        .mission-number {
          font-size: 14px;
          font-weight: 700;
          line-height: 18px;
          color: #3987f8;
          text-align: right;
          line-height: 22px;
        }
        .mission-name {
          color: #222;
          font-size: 15px;
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
        gap: 4px;
        .mission-status {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          height: 32px;
          padding: 0 4px;
          border-radius: 30px;
          background: #f6f6f6;
          color: #ff8737;
          font-size: 12px;
          font-weight: 500;
          line-height: 15px;
        }
        .mission-actions {
          .mission-dropdown {
            .dropdown-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              background: none;
              border: none;
              cursor: pointer;
              padding: 4px;
              &:hover {
                border-radius: 40px;
                background: #f6f6f6;
              }
              &.active {
                border-radius: 40px;
                background: #f6f6f6;
              }
              img {
                width: 14px;
                height: 14px;
              }
            }
            .dropdown-menu {
              position: fixed;
              border-radius: 6px;
              border: 1px solid #d6d6d6;
              background: #fff;
              box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.12);
              z-index: 10000;
              padding: 1px;
              min-width: 120px;

              .dropdown-item {
                display: block;
                width: 100%;
                padding: 12px 20px 12px 16px;
                font-size: 14px;
                font-weight: 500;
                color: #222;
                background: none;
                border: none;
                text-align: center;
                cursor: pointer;
                &:hover {
                  background: #f6f6f6;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
