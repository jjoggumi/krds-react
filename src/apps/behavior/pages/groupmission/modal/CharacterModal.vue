<template>
  <!-- 전체화면 나비 상세 팝업: 미션 완료 팝업과 유사하되 좌/우 내비게이션과 하단 버튼 없음 -->
  <div class="mission-complete-overlay archive-popup">
    <div class="modal-content-wrapper">
      <div class="mission-complete-modal">
        <!-- 닫기 버튼 -->
        <button class="modal-close-btn" @click="$emit('closeCharacterModal')">
          <img src="@/assets/img/icon/icon_close_white_24.svg" alt="닫기" />
        </button>

        <!-- 좌우 내비게이션 버튼 -->
        <button class="butterfly-nav butterfly-nav-left" @click="prev" :disabled="curIndex <= 0">
          <img src="@/assets/img/icon/icon_arrowleft_white_56.svg" alt="left" />
        </button>
        <button class="butterfly-nav butterfly-nav-right" @click="next" :disabled="curIndex < 0 || curIndex >= rewardCharacters.length - 1">
          <img src="@/assets/img/icon/icon_arrowright_white_56.svg" alt="right" />
        </button>

        <div class="butterfly-detail-content">
          <div class="butterfly-image" :style="{ height: 'fill', minHeight: '260px' }" @click="replayButterflyConfetti" style="cursor: pointer">
            <lottie
              v-if="selectedCharacter.lottie && typeof selectedCharacter.lottie === 'object'"
              class="butterfly-detail-lottie"
              :options="{ animationData: selectedCharacter.lottie, loop: true, autoplay: true }"
              :key="selectedCharacter.characterCode"
            />
            <div v-if="showConfetti" class="modal-confetti-overlay">
              <lottie class="modal-confetti-animation" :options="FanfareLottie" :key="confettiCount" />
            </div>
          </div>

          <div class="butterfly-name">{{ selectedCharacter.characterName }}</div>
          <div class="butterfly-desc">{{ selectedCharacter.characterMessage }}</div>
          <div class="butterfly-text-section">
            <div
              :class="['butterfly-message', { 'archive-expanded': archiveExpanded }]"
              :style="{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: archiveExpanded ? dynamicHeight : '0',
                '--dynamic-height': archiveExpanded ? dynamicHeight : '0',
              }"
            >
              <div class="detail-toggle">
                <button
                  v-if="logs.length > 1"
                  :class="['detail-toggle-topright', { 'close-mode': archiveExpanded }]"
                  @click="toggleArchiveExpand"
                  :aria-expanded="archiveExpanded"
                >
                  <span v-if="!archiveExpanded">펼치기 <span class="detail-toggle-arrow"></span></span>
                  <span v-else>닫기 <span class="detail-toggle-arrow expanded"></span></span>
                </button>
              </div>
              <!-- 리스트가 있을 경우 항목으로 표시 -->
              <div class="detail-list-wrap">
                <template v-if="logs.length > 0">
                  <div :class="['detail-panel', { expanded: archiveExpanded }]">
                    <div class="detail-badge-wrap">
                      <div class="detail-badge">{{ `${selectedCharacter.goalPoint}회` }}<br />만남</div>
                      <div class="detail-items" :class="{ scrollable: logs.length > 3 }">
                        <div
                          v-if="!archiveExpanded && logs.length > 1"
                          ref="detailViewport"
                          class="rolling-viewport"
                          :style="{ height: detailItemHeight ? detailItemHeight + 'px' : 'auto' }"
                        >
                          <div
                            ref="rollingInner"
                            class="rolling-inner"
                            @transitionend="onRollingTransitionEnd"
                            :style="{
                              transform: `translateY(-${rollingIndex * (detailItemHeight || 0)}px)`,
                              transition: rollingTransition ? `transform ${rollingTransitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
                            }"
                          >
                            <div
                              v-for="(log, idx) in rollingRenderList"
                              :key="`${idx}${log.missionGoal}${log.missionName}${log.insertedTimestamp}`"
                              class="detail-item"
                            >
                              <div class="detail-row">
                                <div class="detail-date">
                                  {{ $moment(log.insertedTimestamp).format('YYYY.MM.DD') }}
                                </div>
                                <div class="detail-text">
                                  <span class="mission-blue">{{ `이슬주기 ${log.missionGoal}회 ` }}</span>
                                  <span class="mission-black">달성으로 </span>
                                  <span class="mission-blue">{{ `${log.missionName} ` }} </span>
                                  <span class="mission-black">획득</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div v-else>
                          <div v-for="(log, idx) in logs" :key="idx" class="detail-item">
                            <div class="detail-row">
                              <div class="detail-date">
                                {{ $moment(log.insertedTimestamp).format('YYYY.MM.DD') }}
                              </div>
                              <div class="detail-text">
                                <span class="mission-blue">{{ `이슬주기 ${log.missionGoal}회 ` }}</span>
                                <span class="mission-black">달성으로 </span>
                                <span class="mission-blue">{{ `${log.missionName} ` }} </span>
                                <span class="mission-black">획득</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import Lottie from '@/components/Lottie/Lottie';
import FanfareLottie from '@/assets/img/lottie/Fanfare.json';
import { getGroupMissionStorageCharacter } from '@hiclass/core';
import { mapState } from 'vuex';
import FanfareMixin from '@/apps/behavior/pages/groupmission/mixins/FanfareMixin';
import { soundEffects } from '@/apps/behavior/pages/groupmission/groupMission';

export default {
  name: 'CharacterModal',
  components: { Lottie },
  mixins: [FanfareMixin],
  data() {
    return {
      curCharacterCode: '',
      // 팝업 상세 섹션에서 보관함 목록의 펼침 상태
      archiveExpanded: false,
      logs: [],
      rollingIndex: 0,
      // rollTimer: setInterval로 생성된 타이머 ID (롤링 중지 시 clearInterval 사용...)
      rollTimer: null,
      // detailItemHeight: 각 항목의 높이(px), 뷰포트 높이 계산에 사용...
      detailItemHeight: null,
      // rollingTransition: transform 애니메이션 활성화 여부
      rollingTransition: true,
      // snapPending: 마지막 항목에서 첫번째로 스냅할 때 사용되는 플래그
      snapPending: false,
      // 전환(트랜스폼) 지속 시간 (ms)
      rollingTransitionDuration: 420,
    };
  },
  props: {
    selectedCharacterCode: {
      type: String,
      required: false,
    },
    rewardCharacters: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    selectedCharacter() {
      return this.rewardCharacters.find((character) => character.characterCode === this.curCharacterCode) || {};
    },
    curIndex() {
      return this.rewardCharacters.findIndex((character) => character.characterCode === this.curCharacterCode);
    },
    // rollingRenderList: 롤링에 사용하기 위해 항목을 두 번 이어붙여 무한스럽게 위로 스크롤되도록 함
    rollingRenderList() {
      const base = this.logs || [];
      return base.concat(base);
    },
    // 동적 bottom 계산: 로그 개수에 따라 위치 조정
    dynamicBottom() {
      const logCount = this.logs?.length || 0;
      if (logCount === 2) {
        return 'calc(100% - -20px)'; // 2개일 때
      } else {
        return 'calc(100% - 48px)'; // 3개 이상
      }
    },
    // 동적 높이 계산: 로그 개수에 따라 높이 조정
    dynamicHeight() {
      const logCount = this.logs?.length || 0;
      if (logCount === 2) {
        return '162px'; // 2개일 때 높이
      } else {
        return '232px'; // 3개 이상일 때는 기본 높이
      }
    },
  },
  async mounted() {
    this.curCharacterCode = this.selectedCharacterCode;
    await this.getCharacterLogs(this.selectedCharacter);
    this.showConfettiTwice();
    this.showConfettiOnceWithSound(); // 한번만 실행
    this.initRolling();
  },
  methods: {
    // 팡파레 사운드 재생
    playConfettiSound() {
      if (typeof window.hiclassSoundEnabled !== 'undefined' && !window.hiclassSoundEnabled) return;
      if (soundEffects && soundEffects.confetti) {
        const audio = new Audio(soundEffects.confetti);
        audio.play();
      }
    },
    // 팡파레 사운드 한번
    showConfettiOnceWithSound() {
      this.confettiCount = 0;
      this.triggerConfetti(1200);
      this.playConfettiSound();
    },

    initRolling() {
      this.$nextTick(() => {
        this.measureDetailItemHeight();
        this.startDetailRolling();
      });
    },
    async prev() {
      if (this.curIndex === 0) return;
      // archiveExpanded 상태 리셋
      this.archiveExpanded = false;
      await this.getCharacterLogs(this.rewardCharacters[this.curIndex - 1]);
      this.curCharacterCode = this.rewardCharacters[this.curIndex - 1].characterCode;
      this.showConfettiTwice();
      this.initRolling();
    },
    async next() {
      if (this.curIndex >= this.rewardCharacters.length - 1) return;
      // archiveExpanded 상태 리셋
      this.archiveExpanded = false;
      await this.getCharacterLogs(this.rewardCharacters[this.curIndex + 1]);
      this.curCharacterCode = this.rewardCharacters[this.curIndex + 1].characterCode;
      this.showConfettiTwice();
      this.initRolling();
    },
    async getCharacterLogs(character) {
      if (character.logs.length > 0) {
        this.logs = [...character.logs];
        return;
      }
      try {
        const { logs } = await getGroupMissionStorageCharacter(this.curClassroom.classroomId, character.characterId);
        this.logs = logs || [];
        this.$emit('updateCharacterLogs', {
          characterCode: character.characterCode,
          logs: this.logs,
        });
      } catch (e) {
        console.error('캐릭터 획득 로그 불러오기 실패', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
    replayButterflyConfetti() {
      // 클릭하면 항상 애니메이션을 재시작하도록 강제
      this.showConfetti = false;
      this.$nextTick(() => {
        this.confettiCount++;
        this.showConfetti = true;
        this.playConfettiSound(); // 클릭 시에도 팡파레 사운드 재생
        setTimeout(() => {
          this.showConfetti = false;
        }, 1200);
      });
    },
    toggleArchiveExpand() {
      this.archiveExpanded = !this.archiveExpanded;
    },
    // 보관함 나비 팡파레: 자동 두번 재생 및 클릭 재생 지원
    showConfettiTwice() {
      this.confettiCount = 0;
      this.triggerConfetti(1200);
      setTimeout(() => {
        this.triggerConfetti(1200);
      }, 1500);
    },
    measureDetailItemHeight() {
      this.$nextTick(() => {
        try {
          const viewport = this.$refs.detailViewport;
          const inner = viewport && viewport.querySelector && viewport.querySelector('.rolling-inner');
          const firstItem = inner ? inner.querySelector('.detail-item') : null;
          if (firstItem) {
            const style = window.getComputedStyle(firstItem);
            const marginTop = parseFloat(style.marginTop) || 0;
            const marginBottom = parseFloat(style.marginBottom) || 0;
            this.detailItemHeight = firstItem.offsetHeight + marginTop + marginBottom;
          } else {
            this.detailItemHeight = null;
          }
        } catch (e) {
          this.detailItemHeight = null;
        }
      });
    },
    startDetailRolling() {
      if (this.logs.length <= 1 || this.archiveExpanded) return;

      this.stopDetailRolling();
      if (!this.detailItemHeight) this.measureDetailItemHeight();

      const len = this.logs.length;
      this.rollingIndex = 0;
      this.rollingTransition = true;

      this.rollTimer = setInterval(() => {
        const nextIndex = this.rollingIndex + 1;
        this.rollingTransition = true;
        this.rollingIndex = nextIndex;
        if (nextIndex >= len) {
          this.snapPending = true;
        }
      }, 3000);
    },
    stopDetailRolling() {
      if (this.rollTimer) {
        clearInterval(this.rollTimer);
        this.rollTimer = null;
      }
      this.rollingIndex = 0;
      this.snapPending = false;
    },
    onRollingTransitionEnd(e) {
      if (!this.snapPending) return;
      this.rollingTransition = false;
      this.rollingIndex = 0;
      this.$nextTick(() => {
        const inner = this.$refs.rollingInner;
        if (inner) void inner.offsetHeight;
        setTimeout(() => {
          this.rollingTransition = true;
          this.snapPending = false;
        }, 20);
      });
    },
  },
  beforeDestroy() {
    if (this.rollTimer) {
      clearInterval(this.rollTimer);
      this.rollTimer = null;
    }
  },
  watch: {
    archiveExpanded(val) {
      if (val) {
        this.stopDetailRolling();
      } else {
        this.$nextTick(() => this.startDetailRolling());
      }
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
    &::-webkit-scrollbar {
      height: 8px;
      width: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 6px;
    }
    /* 상하 화살표 버튼 숨기기 */
    &::-webkit-scrollbar-button {
      display: none;
      height: 0;
      width: 0;
    }
  }
  .mission-complete-modal {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    &::before {
      content: '';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(120vh, 120vw);
      height: min(120vh, 120vw);
      flex-shrink: 0;
      aspect-ratio: 1/1;
      border-radius: 50%;
      background: radial-gradient(50% 50% at 50% 50%, #3b4863 68.75%, rgba(59, 72, 99, 0) 100%);
      z-index: -1;
    }
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
      width: 840px;
      height: 840px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      .complete-image {
        display: flex;
        height: 550px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        .butterfly-lottie {
          height: 550px;
        }
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
        min-height: 140px;
        overflow: visible;
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
            &.close-mode {
              position: relative;
              top: -47px;
            }
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
          max-height: 230px;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-start;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: linear-gradient(108deg, rgba(255, 255, 255, 0.9) 29.29%, rgba(255, 255, 255, 0.7) 92.72%);
          margin-top: 30px;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          &.archive-expanded {
            justify-content: flex-end;
            max-height: none;
            background: #fff;
            border: 1px solid rgba(255, 255, 255, 0.4);
            transform-origin: bottom center;
          }
          .detail-list-wrap {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 20px 24px 20px 20px;
            .detail-panel {
              position: relative;
              &.expanded {
                height: 100%;
                .detail-badge-wrap {
                  align-items: flex-start;
                  height: 100%;
                  overflow: auto;
                  /* 세로 스크롤바 스타일 */
                  &::-webkit-scrollbar {
                    width: 8px;
                  }
                  &::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 6px;
                  }
                  &::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 6px;
                  }
                  /* 상하 화살표 버튼 숨기기 */
                  &::-webkit-scrollbar-button {
                    display: none;
                    height: 0;
                    width: 0;
                  }
                  .detail-items {
                    .detail-item {
                      margin-bottom: 0;
                    }
                  }
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
                  > div {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                  }
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
                    margin-bottom: 8px;

                    .detail-row {
                      display: flex;
                      flex-direction: column;
                      min-width: 0;
                      gap: 4px;
                      .detail-date {
                        font-size: 14px;
                        line-height: 22px;
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
      .butterfly-detail-content {
        width: 1038px;
        height: 900px;
        .butterfly-image {
          height: 700px;
        }
      }
    }
    @media (max-width: 1920px) {
      .butterfly-detail-content {
        width: 840px;
        height: 810px;
        .butterfly-image {
          height: 550px;
        }
      }
    }
    @media (max-width: 1536px) {
      .butterfly-detail-content {
        width: 840px;
        height: 810px;
        .butterfly-image {
          height: 460px;
        }
      }
    }
    @media (max-width: 1360px) {
      .butterfly-detail-content {
        width: 700px;
        height: 580px;
        .butterfly-image {
          height: 340px;
        }
      }
    }
    @media (max-width: 1280px) {
      .butterfly-detail-content {
        width: 700px;
        height: 560px;
        .butterfly-image {
          height: 300px;
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
          height: 500px;
          .butterfly-lottie {
            height: 500px;
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
        .butterfly-image {
          width: 500px;
          height: 500px;
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
      .butterfly-nav {
        width: 64px;
        height: 64px;
        img {
          width: 40px;
          height: 40px;
        }
        &:hover {
          border-radius: 16px;
        }
      }
      .mission-complete-content {
        width: 600px;
        height: 600px;
        .complete-image {
          height: 400px;
          .butterfly-lottie {
            height: 400px;
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
          width: 400px;
          height: 400px;
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
      .butterfly-nav {
        width: 50px;
        height: 50px;
        img {
          width: 30px;
          height: 30px;
        }
        &:hover {
          border-radius: 16px;
        }
      }
      .butterfly-detail-content {
        width: 450px;
        height: 450px;
        .butterfly-image {
          width: 300px;
          height: 300px;
        }
      }
    }
  }
}
</style>
