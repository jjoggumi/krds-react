<template>
  <div style="height: 100%">
    <transition name="bg-fade">
      <div
        class="progress-content"
        :class="[
          `stage-${highestStageReached}`,
          { 'lightning-bg': showLightningBg },
          { 'butterfly-wait-bg': isDone && highestStageReached === 3 && !showMissionCompleteModal },
          { 'mission-start-bg': isLoadDone && !missionInProgress },
        ]"
        key="stage-bg"
      >
        <!-- 진행중 미션 없음 -->
        <MissionStartView v-if="isLoadDone && !missionInProgress" @openMissionFormModal="openMissionFormModal" />

        <!-- 진행중 미션 있을 때 -->
        <div class="groupmission-progress-main" v-else-if="isLoadDone && missionInProgress">
          <MissionProgressViewHeader
            :is-progress="isProgress"
            :is-done="isDone && highestStageReached === 3"
            :is-change-btn-disabled="isDewAnimationRunning || lightningActionRunning || isGivingPoints"
            :mission-name="missionInProgress.name"
            @openMissionChangeModal="openMissionChangeModal"
            @openMissionManageModal="openMissionManageModal"
            @openRewardHistoryModal="openRewardHistoryModal"
          />
          <div class="content-wrap">
            <!-- 기본 진행중 화면 -->
            <template>
              <!-- 미션 버튼들 -->
              <div v-if="missionInProgress && !showMissionCompleteModal && !isDone" class="mission-btns">
                <div class="btn-row">
                  <div
                    :class="[
                      'mission-btn',
                      {
                        disabled: (isDewAnimationRunning && lastDewAnimationType === 5) || lightningActionRunning || isGivingPoints,
                        active: activeBtn === 'dew1',
                      },
                    ]"
                    @mousedown.prevent="activeBtn = 'dew1'"
                    @mouseup="activeBtn = null"
                    @mouseleave="activeBtn = null"
                    @click="onDewClick(1)"
                  >
                    <span class="emoji"><img src="@/assets/img/svg/ico-mission-water.svg" alt="이슬 1방울" draggable="false" /></span>
                    <span class="mission-text">이슬 1방울</span>
                  </div>
                  <div class="point-notify-wrap">
                    <div v-for="(note, idx) in pointNotifiesPlus1" :key="note.id" class="point-notify-item" :style="{ bottom: `${idx * 9}px` }">
                      <lottie :key="note.id" class="point-notify-lottie" :options="lotties.pointPlus1" />
                    </div>
                  </div>
                </div>

                <div class="btn-row">
                  <div
                    :class="[
                      'mission-btn',
                      {
                        disabled: (isDewAnimationRunning && lastDewAnimationType === 1) || lightningActionRunning || isGivingPoints,
                        active: activeBtn === 'dew5',
                      },
                    ]"
                    @mousedown.prevent="activeBtn = 'dew5'"
                    @mouseup="activeBtn = null"
                    @mouseleave="activeBtn = null"
                    @click="onDewClick(5)"
                  >
                    <span class="emoji"><img src="@/assets/img/svg/ico-mission-morewater.svg" alt="이슬 5방울" draggable="false" /></span>
                    <span class="mission-text">이슬 5방울</span>
                  </div>
                  <div class="point-notify-wrap">
                    <div v-for="(note, idx) in pointNotifiesPlus5" :key="note.id" class="point-notify-item" :style="{ bottom: `${idx * 18}px` }">
                      <lottie :key="note.id" class="point-notify-lottie" :options="lotties.pointPlus5" />
                    </div>
                  </div>
                </div>

                <div class="btn-row">
                  <div
                    :class="['mission-btn', { disabled: isDewAnimationRunning || isGivingPoints, active: activeBtn === 'lightning' }]"
                    @mousedown.prevent="activeBtn = 'lightning'"
                    @mouseup="activeBtn = null"
                    @mouseleave="activeBtn = null"
                    @click="onLightningClick"
                  >
                    <span class="emoji"><img src="@/assets/img/svg/ico-mission-lightning.svg" alt="번개" draggable="false" /></span>
                    <span class="mission-text">번개</span>
                  </div>
                  <div class="point-notify-wrap">
                    <div v-for="(note, idx) in pointNotifiesMinus1" :key="note.id" class="point-notify-item" :style="{ bottom: `${idx * 18}px` }">
                      <lottie :key="note.id" class="point-notify-lottie" :options="lotties.pointMinus1" />
                    </div>
                  </div>
                </div>
              </div>
              <!-- 미션 달성 로티 애니메이션 -->
              <MissionCompleteView
                v-if="isDone && highestStageReached === 3 && !showMissionCompleteModal"
                :character="findCharacter(missionInProgress.characterCode)"
              />
              <div
                v-else
                v-show="showStemAnimation || (showCaterpillar && caterpillarPop)"
                :class="[
                  'mission-progress-animation',
                  {
                    'stem-fade-in': showStemAnimation,
                    'stem-hide-down': isStemHideDown,
                    'pupa-stage': highestStageReached === 2,
                  },
                ]"
              >
                <!-- 단계 전환 애니메이션: 애벌레 pop / 번데기 pop -->
                <!-- <div v-if="showCaterpillar && caterpillarPop" class="caterpillar-pop-animation">
                <lottie class="lottie-caterpillar" :options="lotties.caterpillarIdle" />
              </div>
              <div v-else-if="showPupa && pupaPop" class="pupa-pop-animation">
                <lottie class="lottie-pupa" :options="lotties.motionPupaIdle" />
              </div> -->
                <!-- 기존 성장/진행 애니메이션 -->
                <div
                  v-show="showStemAnimation"
                  class="stem-wrapper"
                  :class="{
                    'stem-hide-down': isStemHideDown,
                  }"
                >
                  <!-- 번데기 단계일 때: 번데기 줄기만 -->
                  <template v-if="highestStageReached === 2">
                    <!-- 등장 모션이 활성화된 경우 번데기 줄기 pop-in -->
                    <lottie
                      v-if="stemPopActive"
                      class="mission-progress-lottie stem-pop-lottie stem-pupa-pop-lottie"
                      :options="lotties.stemPupaPopIn"
                    />
                    <!-- 대기 번데기 줄기 -->
                    <lottie v-else class="stem-lottie stem-lottie-pupa" :options="lotties.stemPupa" :key="highestStageReached" />
                  </template>

                  <!-- 알/애벌레 단계: 기본 잎만 -->
                  <template v-else>
                    <!-- 등장 모션이 활성화된 경우 기본 잎 pop-in -->
                    <lottie v-if="stemPopActive" class="mission-progress-lottie stem-pop-lottie" :options="lotties.stemPopIn" />
                    <!-- 대기 기본 잎 -->
                    <lottie v-else class="mission-progress-lottie" :options="lotties.stemDefault" :key="highestStageReached" />
                  </template>
                </div>
                <!-- 나비알 대기모션 말풍선 -->
                <transition name="bubble-rise-fade">
                  <SpeechBubble
                    v-if="highestStageReached === 0 && showGreetingBubble"
                    :bubbleText="`안녕하세요. 저는 나비알이예요!\n이슬을 듬뿍 먹고 예쁜 나비로 쑥쑥 자라고 싶어요!`"
                    :bubble-style="speechBubbleStyle"
                    class="text-wrap"
                  />
                </transition>
                <!-- 말풍선 -->
                <transition name="bubble-rise-fade">
                  <SpeechBubble v-if="showActionMessage" :bubble-style="speechBubbleStyle" :bubble-text="actionMessage" />
                </transition>
                <!-- 캐릭터 로티 애니메이션 (진행도에 따라 변화) + 번개 이펙트 같이 배치 -->
                <div
                  v-show="showCharacterAnimation && !showMissionCompleteModal"
                  class="mission-character-animation"
                  :class="{
                    'character-bounce': isCharacterBouncing,
                    'character-hide-down': isCharacterHideDown,
                    'mission-animation-pupa': highestStageReached === 2,
                  }"
                  @click="onCharacterClick"
                  @animationend="onCharacterAnimationEnd"
                  :style="{
                    top: characterPosition.top,
                    left: characterPosition.left,
                  }"
                >
                  <!-- 등장 알 로티 -->
                  <lottie v-if="highestStageReached === 0 && eggPop" class="mission-character-lottie" :options="lotties.eggPopIn" />
                  <!-- 등장 애벌레 로티 -->
                  <lottie
                    v-else-if="highestStageReached === 1 && caterpillarPop"
                    class="mission-character-lottie lottie-caterpillar"
                    :options="lotties.caterpillarPopIn"
                  />
                  <!-- 등장 번데기 로티 -->
                  <lottie
                    v-else-if="highestStageReached === 2 && pupaPop"
                    class="mission-character-lottie lottie-pupa"
                    :options="lotties.pupaPopIn"
                  />
                  <!-- 대기 로티 (등장 후) -->
                  <lottie
                    v-else-if="!eggPop && !caterpillarPop && !pupaPop"
                    class="mission-character-lottie"
                    :class="{
                      'lottie-caterpillar': highestStageReached === 1,
                      'lottie-pupa': highestStageReached === 2,
                    }"
                    :options="currentCharacterLottie"
                    :key="characterAnimationKey"
                  />
                </div>
                <!-- 번개 애니메이션 -->
                <lottie v-if="showLightningLeft" class="lightning-lottie lightning-left" :options="lotties.lightningStrikeLeft" />
                <lottie v-if="showLightningRight" class="lightning-lottie lightning-right" :options="lotties.lightningStrikeRight" />
                <!-- 이슬방울 애니메이션 -->
                <div v-if="showDewDropAnimation" class="dew-drop-animation">
                  <lottie
                    class="dew-drop-lottie"
                    :options="{
                      ...(lastDewAnimationType === 1 ? this.lotties.dewDropSingle : this.lotties.dewDropFive),
                      loop: false,
                    }"
                  />
                </div>
              </div>
            </template>
            <MissionProgressBar
              ref="progressBar"
              :isEggEntered="isEggEntered"
              :is-done="isDone"
              :highest-stage-reached="highestStageReached"
              :show-mission-complete-modal="showMissionCompleteModal"
              :mission-in-progress="missionInProgress"
            />
          </div>
        </div>
      </div>
    </transition>
    <!-- 아이템 지급내역 모달 -->
    <RewardHistoryModal v-if="showRewardHistoryModal" :mission-id="missionInProgress.id" @closeRewardHistoryModal="closeRewardHistoryModal" />

    <!-- 미션 변경하기 모달 -->
    <MissionChangeModal
      v-if="showMissionChangeModal"
      :missions="missions"
      :mission-in-progress-template-id="(missionInProgress || {}).templateId"
      :is-progress="isProgress"
      :is-done="isDone"
      @openMissionFormModal="openMissionFormModal"
      @closeMissionChangeModal="closeMissionChangeModal"
      @loadNewMission="loadNewMission"
    />

    <!-- 미션 관리 모달 -->
    <MissionManageModal
      v-if="showMissionManageModal"
      :missions="missions"
      :mission-in-progress-template-id="(missionInProgress || {}).templateId"
      :is-progress="isProgress"
      @closeMissionManageModal="closeMissionManageModal"
      @openMissionFormModal="openMissionFormModal"
      @openDeleteConfirm="openDeleteConfirm"
      @updateMissionsSort="updateMissionsSort"
    />

    <!-- 미션 등록 모달 -->
    <MissionFormModal
      v-if="missionFormModal.open"
      :modal-option="missionFormModal.option"
      :mission-in-progress-template-id="(missionInProgress || {}).templateId"
      @closeMissionFormModal="closeMissionFormModal"
      @openMissionManageModal="openMissionManageModal"
      @openDeleteConfirm="openDeleteConfirm"
      @startMission="startMission"
      @appendMission="appendMission"
      @updateMission="updateMission"
    />

    <!-- 미션 삭제 확인 모달 -->
    <MissionDeleteConfirmModal
      v-show="deleteConfirm.isShow"
      :template-id="deleteConfirm.templateId"
      @deleteMission="deleteMission"
      @closeDeleteConfirm="closeDeleteConfirm"
    />

    <!-- 미션 완료 딤 오버레이 + 모달 -->
    <MissionCompleteModal
      v-if="showMissionCompleteModal"
      :complete-character="findCharacter(missionInProgress.characterCode)"
      :mission-name="missionInProgress.name"
      @openMissionChangeModal="openMissionChangeModal"
      @closeMissionCompleteModal="closeMissionCompleteModal"
    />
  </div>
</template>

<script>
import {
  lightningMessages,
  speechMessages,
  waterDropFiveMessages,
  waterDropMessages,
  lotties,
  soundEffects,
} from '@/apps/behavior/pages/groupmission/groupMission';
import { getGroupMissionInfo, getGroupMissions, rewardGroupMission, updateGroupMissionsSorting } from '@hiclass/core';
import Lottie from '@/components/Lottie/Lottie';
import MissionFormModal from '@/apps/behavior/pages/groupmission/modal/MissionFormModal.vue';
import { mapMutations, mapState } from 'vuex';
import MissionManageModal from '@/apps/behavior/pages/groupmission/modal/MissionManageModal.vue';
import RewardHistoryModal from '@/apps/behavior/pages/groupmission/modal/RewardHistoryModal.vue';
import MissionChangeModal from '@/apps/behavior/pages/groupmission/modal/MissionChangeModal.vue';
import MissionDeleteConfirmModal from '@/apps/behavior/pages/groupmission/modal/MissionDeleteConfirmModal.vue';
import MissionCompleteModal from '@/apps/behavior/pages/groupmission/modal/MissionCompleteModal.vue';
import MissionStartView from '@/apps/behavior/pages/groupmission/components/MissionStartView.vue';
import MissionProgressViewHeader from '@/apps/behavior/pages/groupmission/components/MissionProgressViewHeader.vue';
import MissionProgressBar from '@/apps/behavior/pages/groupmission/components/MissionProgressBar.vue';
import MissionCompleteView from '@/apps/behavior/pages/groupmission/components/MissionCompleteView.vue';
import SpeechBubble from '@/apps/behavior/pages/groupmission/components/SpeechBubble.vue';

export default {
  name: 'MissionInProgress',
  components: {
    SpeechBubble,
    MissionCompleteView,
    MissionProgressBar,
    MissionProgressViewHeader,
    MissionStartView,
    MissionDeleteConfirmModal,
    MissionCompleteModal,
    MissionChangeModal,
    RewardHistoryModal,
    MissionManageModal,
    MissionFormModal,
    Lottie,
  },
  data() {
    return {
      greetingBubbleTimeout: null,
      hasActionOccurred: false,
      // 미션 관련 데이터
      missionInProgress: null,
      missions: [],

      // 화면 크기 반응형을 위한 변수
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,

      // 로티 애니메이션 옵션
      lotties,

      // 플래그 값
      activeBtn: null,
      isLoadDone: false,
      isGivingPoints: false,

      // 이슬
      isDewAnimationRunning: false,
      showDewDropAnimation: false,
      pendingDewClicks: 0,
      lastDewAnimationType: 1,

      // 번개
      lightningActionRunning: false,
      showLightningBg: false,
      showLightningLeft: false,
      showLightningRight: false,
      pendingLightningClicks: 0,

      // 줄기
      showStemAnimation: false,
      stemPopActive: false,
      useStemBounce: true, // true이면 부드러운 바운스 사용
      useStemBounceEnergetic: false, // 강한 바운스(튕기는 느낌)를 사용하려면 true
      isStemHideDown: false,

      // 캐릭터
      isEggEntered: false,
      showCaterpillar: false,
      showPupa: false,
      eggPop: false,
      caterpillarPop: false,
      pupaPop: false,
      showCharacterAnimation: false,
      isCharacterBouncing: false,
      isCharacterHideDown: false,
      forceCharacterLottie: null,
      highestStageReached: 0, // 최고 성장 단계 (0:알, 1:애벌레, 2:번데기, 3:나비)
      characterAnimationKey: 0,

      // 점수, 메시지 관련
      pointNotifies: [],
      actionMessage: '',
      showActionMessage: false,
      // 인사 말풍선 표시 플래그 (대기 화면 첫 진입 시 상시 노출)
      showGreetingBubble: false,
      // 어떤 미션에 대해 이미 인사 말풍선을 표시했는지 추적
      greetingShownForMissionId: null,

      // 모달
      showRewardHistoryModal: false,
      showMissionChangeModal: false,
      showMissionManageModal: false,
      showMissionCompleteModal: false,
      missionFormModal: {
        open: false,
        option: {
          title: '미션 등록',
          cancelText: '취소',
          confirmText: '확인',
          cancel: null,
          confirm: null,
          mode: null,
          mission: {},
        },
      },
      deleteConfirm: {
        isShow: false,
        templateId: '',
      },

      // 사운드
      waterAudio: null,
      lightningAudio: null,
    };
  },
  props: {
    characters: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    // 말풍선 스케일 (화면 크기에 반응형)
    speechBubbleStyle() {
      let scale = 1;
      let top = '-4%';
      let left = '45%';

      // 모바일 (480px 이하)
      if (this.windowWidth <= 480) {
        scale = 0.9;
      }
      // 태블릿 (768px 이하)
      else if (this.windowWidth <= 768) {
        scale = 1;
      } else if (this.windowWidth <= 1024) {
        scale = 1.3;
      } else if (this.windowWidth <= 1180) {
        scale = 1.3;
      } else if (this.windowWidth <= 1360) {
        scale = 1.1;
      } else if (this.windowWidth <= 1440) {
        scale = 0.8;
      } else if (this.windowWidth <= 1640) {
        scale = 0.9;
      } else if (this.windowWidth <= 1920) {
        scale = 1;
      }
      // 초대형 모니터 (2560px 이상)
      else {
        scale = 1.2;
      }

      // 단계별 위치 조정 (알=0, 애벌레=1, 번데기=2, 나비=3)
      if (this.highestStageReached === 0) {
        // 알 단계
        if (this.windowWidth <= 480 || this.windowHeight <= 480) {
          top = '-4%';
          left = '45%';
        } else if (this.windowWidth <= 768) {
          top = '-4%';
          left = '45%';
        } else if (this.windowWidth <= 1024) {
          top = '-4%';
          left = '55%';
        } else if (this.windowWidth <= 1180) {
          top = '-4%';
          left = '53%';
        } else if (this.windowWidth <= 1360) {
          top = '-4%';
          left = '50%';
        } else if (this.windowWidth <= 1440) {
          top = '-4%';
          left = '45%';
        } else if (this.windowWidth <= 1920) {
          top = '-4%';
          left = '45%';
        } else {
          top = '-1%';
          left = '47%';
        }
      }
      if (this.highestStageReached === 1) {
        // 애벌레 단계
        if (this.windowWidth <= 480 || this.windowHeight <= 480) {
          top = '-14%';
          left = '50%';
        } else if (this.windowWidth <= 768) {
          top = '-15%';
          left = '50%';
        } else if (this.windowWidth <= 1024) {
          top = '-14%';
          left = '56%';
        } else if (this.windowWidth <= 1180) {
          top = '-14%';
          left = '54%';
        } else if (this.windowWidth <= 1360) {
          top = '-16%';
          left = '51%';
        } else if (this.windowWidth <= 1440) {
          top = '-17%';
          left = '47%';
        } else if (this.windowWidth <= 1640) {
          top = '-16%';
          left = '48%';
        } else if (this.windowWidth <= 1920) {
          top = '-14%';
          left = '50%';
        } else {
          top = '-14%';
          left = '50%';
        }
      } else if (this.highestStageReached === 2) {
        // 번데기 단계
        if (this.windowWidth <= 480 || this.windowHeight <= 480) {
          top = '-1%';
          left = '48%';
        } else if (this.windowWidth <= 768) {
          top = '-1%';
          left = '50%';
        } else if (this.windowWidth <= 1024) {
          top = '-1%';
          left = '53%';
        } else if (this.windowWidth <= 1180) {
          top = '0%';
          left = '53%';
        } else if (this.windowWidth <= 1360) {
          top = '-1%';
          left = '50%';
        } else if (this.windowWidth <= 1410) {
          top = '-1%';
          left = '46%';
        } else if (this.windowWidth <= 1440) {
          top = '-2%';
          left = '47%';
        } else if (this.windowWidth <= 1920) {
          top = '0%';
          left = '50%';
        } else {
          top = '1%';
          left = '53%';
        }
      }

      return {
        position: 'absolute',
        top: top,
        left: left,
        scale: scale,
        pointerEvents: 'none',
        transform: 'translate(-50%, -100%)',
      };
    },
    currentCharacterLottie() {
      // 애니메이션 중에는 강제 표시
      if (this.forceCharacterLottie) {
        return this.forceCharacterLottie;
      }
      // 최고 성장 단계 기준으로 캐릭터 표시
      return {
        0: this.lotties.stemEggWait,
        1: this.lotties.caterpillarIdle,
        2: this.lotties.motionPupaIdle,
        3: this.lotties.stemEggWait,
      }[this.highestStageReached];
    },
    // 즉시 생성된 포인트 알림을 타입별로 분류하여 템플릿에서 사용
    pointNotifiesPlus1() {
      return this.pointNotifies.filter((n) => n.type === 1);
    },
    pointNotifiesPlus5() {
      return this.pointNotifies.filter((n) => n.type === 5);
    },
    pointNotifiesMinus1() {
      return this.pointNotifies.filter((n) => n.type === -1);
    },
    characterPosition() {
      // 최고 성장 단계 기준으로 위치 고정
      return {
        0: { top: '25%', left: '30%' },
        1: { top: '11%', left: '34%' },
        2: { top: '28%', left: '32%' },
        3: { top: '20%', left: '30%' },
      }[this.highestStageReached];
    },
    isProgress() {
      if (!this.missionInProgress) return false;
      return this.missionInProgress && this.missionInProgress.point < this.missionInProgress.goal;
    },
    isDone() {
      if (!this.missionInProgress) return false;
      return this.missionInProgress && this.missionInProgress.point === this.missionInProgress.goal;
    },
  },
  mounted() {
    // 윈도우 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', this.updateWindowSize);
    this.init();
  },
  watch: {
    'missionInProgress.point'(newVal, oldVal) {
      // 진행도가 변할 때마다 캐릭터 애니메이션 강제 리렌더링
      if (newVal !== oldVal) {
        this.characterAnimationKey++;
      }
    },
    // showCharacterAnimation이 true로 바뀔 때(등장 시) 알 단계면 eggPop을 잠깐 활성화하여
    // `.egg-bounce` 애니메이션이 재생되도록 함
    showCharacterAnimation(newVal) {
      if (newVal && this.highestStageReached === 0) {
        // 중복 설정 방지
        if (!this.eggPop) {
          this.eggPop = true;
          // 애니메이션은 1초(30프레임 기준)로 동기화
          setTimeout(() => {
            this.eggPop = false;
          }, 1000);
        }
      }
    },
    'curClassroom.classroomId'() {
      this.isLoadDone = false;
      this.highestStageReached = 0;
      this.missionInProgress = null;
      this.init();
    },
  },
  beforeDestroy() {
    // 리사이즈 이벤트 리스너 제거
    window.removeEventListener('resize', this.updateWindowSize);
  },
  methods: {
    ...mapMutations('storeBehavior', ['setCurClassroom']),
    async init() {
      this.showGreetingBubble = false;
      this.isEggEntered = false;
      this.eggPop = false;
      this.showCharacterAnimation = false;
      this.greetingShownForMissionId = null;
      this.showStemAnimation = true;
      try {
        await this.getMissions();
      } catch (e) {
        console.error('미션 목록을 불러오는데 실패했습니다.', e);
      }

      try {
        const res = await getGroupMissionInfo(this.curClassroom.classroomId);
        if (res.id) {
          this.missionInProgress = res;
          this.highestStageReached = this.missionInProgress.stage;
          this.isLoadDone = true;

          // 미션 로드(첫 진입) 시 해당 미션에 대해 인사 말풍선을 한 번 노출
          if (!this.greetingShownForMissionId || this.greetingShownForMissionId !== this.missionInProgress.id) {
            if (this.highestStageReached === 0) {
              // 알 단계면 알 등장 후에만 말풍선 노출
              await this.doStemPop(310);
              await this.wait(50);
              await this.doCharacterPop('eggPop', 310);
              this.isEggEntered = true;
              this.showCharacterAnimation = true;
              setTimeout(() => {
                this.showGreetingBubble = true;
              }, 310);
            } else if (this.highestStageReached === 1) {
              // 애벌레 단계
              await this.doStemPop(310);
              await this.wait(50);
              await this.doCharacterPop('caterpillarPop', 310);
              this.showCharacterAnimation = true;
            } else if (this.highestStageReached === 2) {
              // 번데기 단계
              await this.doStemPop(310);
              await this.wait(50);
              await this.doCharacterPop('pupaPop', 310);
              this.showCharacterAnimation = true;
            } else if (this.highestStageReached === 3) {
              // 나비 단계
              await this.doStemPop(310);
              await this.wait(50);
              this.showCharacterAnimation = true;
            }
            this.greetingShownForMissionId = this.missionInProgress.id;
          } else {
            // [추가] 새로고침 시 현재 단계에 맞는 등장 애니메이션 실행
            if (this.isProgress) {
              const characterPops = {
                0: 'eggPop',
                1: 'caterpillarPop',
                2: 'pupaPop',
              };
              await this.doStemPop(310);
              await this.wait(50);
              if (this.highestStageReached < 3) {
                await this.doCharacterPop(characterPops[this.highestStageReached], 310);
              }
              this.showCharacterAnimation = true;
              if (this.highestStageReached === 0) {
                this.isEggEntered = true;
              }
            }
          }
        } else {
          this.isLoadDone = true;
        }
      } catch (e) {
        console.error('진행중인 미션을 불러오는데 실패했습니다.', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
      this.hasActionOccurred = false;
    },
    // 윈도우 크기 업데이트
    updateWindowSize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },
    setActionMessage(messages, duration = 3000) {
      if (this.showActionMessage) return -1; // 이미 말풍선이 떠 있으면 추가로 띄우지 않음
      const randomIndex = Math.floor(Math.random() * messages.length);
      this.actionMessage = messages[randomIndex];
      this.showActionMessage = true;
      setTimeout(() => {
        this.showActionMessage = false;
      }, duration);
      return randomIndex;
    },
    getNextStage(point) {
      const progressPercent = (point / this.missionInProgress.goal) * 100;
      if (progressPercent >= 100) {
        return 3;
      } else if (progressPercent >= 70) {
        return 2;
      } else if (progressPercent >= 30) {
        return 1;
      } else {
        return 0;
      }
    },
    async addWaterWithQueue() {
      try {
        // 1. pop(등장) 애니메이션과 eating(먹는) 애니메이션
        await new Promise((resolve) => {
          this.playDewDropAnimation(resolve);
        });
        await this.wait(400);

        this.isGivingPoints = true;

        let nextStage = this.getNextStage(this.missionInProgress.point + this.pendingDewClicks);
        const stageChanged = nextStage > this.highestStageReached;

        const mission = await rewardGroupMission(this.curClassroom.classroomId, this.missionInProgress.id, {
          point: this.pendingDewClicks,
          isNegative: false,
          stage: nextStage,
        });

        // 2. 게이지 증가 및 포인트 알림 재생 (이슬 먹은 후 바로)
        this.setClassroomMissionPoint(mission);
        this.characterAnimationKey++;

        // 3-1. 단계 변화 없음
        if (!stageChanged) {
          // 포인트 지급 (프로그래스바)
          await this.wait(700);
          this.missionInProgress.point = mission.point;
          this.isDewAnimationRunning = false;
          this.isGivingPoints = false;
          this.pendingDewClicks = 0;
          // 깜빡임 종료
          this.$refs.progressBar.isProgressing = false;
          return;
        }

        // 3-2. 단계 변화 있음
        // 숨김
        // 게이지 애니메이션이 끝날 때까지 대기
        await this.wait(300);
        this.isStemHideDown = true;
        this.isCharacterHideDown = true;
        await this.wait(1200);

        // 포인트 지급 (프로그래스바), 성장단계 변경
        await this.wait(700);
        this.missionInProgress.point = mission.point;
        if (nextStage !== 3) {
          this.highestStageReached = nextStage;
        }

        // 미션 달성
        if (nextStage === 3) {
          this.pendingDewClicks = 0;
          this.isDewAnimationRunning = false;
          this.missionInProgress.characterCode = mission.characterCode;
          await this.wait(2100);
          this.showMissionCompleteModal = true;
          this.isGivingPoints = false;
          return;
        }

        // 단계 전환
        if (nextStage === 1) {
          await this.showCharacterChangeAnimation('showCaterpillar', 'caterpillarPop');
        } else if (nextStage === 2) {
          await this.showCharacterChangeAnimation('showPupa', 'pupaPop');
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.isDewAnimationRunning = false;
        this.pendingDewClicks = 0;
        this.isGivingPoints = false;
        // 깜빡임 종료
        this.$refs.progressBar.isProgressing = false;
      }
    },
    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    // 즉시 포인트 알림 생성: 겹쳐서 여러 인스턴스가 보이도록 배열에 추가 후 일정 시간 뒤 제거
    spawnPointNotify(type) {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      this.pointNotifies.push({ id, type });
      // 300ms(0:00:00:30) 이후에 해당 알림 제거
      setTimeout(() => {
        const idx = this.pointNotifies.findIndex((n) => n.id === id);
        if (idx !== -1) this.pointNotifies.splice(idx, 1);
      }, 1000);
    },
    async showCharacterChangeAnimation(showCharacter, characterPop) {
      this[showCharacter] = true;
      await this.wait(450);
      this[showCharacter] = false;
      this.showCharacterAnimation = false;
      this.showStemAnimation = true;

      const finishDewAction = (async () => {
        this.isStemHideDown = false;
        this.isCharacterHideDown = false;
        await this.wait(450);
        this.isDewAnimationRunning = false;
      })();

      await this.doStemPop(500);
      await Promise.all([this.doCharacterPop(characterPop, 1000), finishDewAction]);

      await this.$nextTick();
      try {
        const els = Array.from(document.querySelectorAll('.stem-lottie, .stem-lottie-pupa, .mission-progress-lottie, .stem-wrapper'));
        els.forEach((el) => el && el.offsetWidth);
      } catch (e) {
        console.warn('[GM] stemPop nextTick error', e);
      }
    },
    async onDewClick(amount) {
      this.hasActionOccurred = true;
      // 대기 말풍선 예약 취소
      if (this.greetingBubbleTimeout) {
        clearTimeout(this.greetingBubbleTimeout);
        this.greetingBubbleTimeout = null;
      }
      // 말풍선은 사라지게 처리
      if (this.showGreetingBubble) {
        this.showGreetingBubble = false;
        await this.wait(500);
      }      

      // 게이지 깜빡임 시작 (여기 추가)
      this.$refs.progressBar.isProgressing = true;

      if (this.lightningActionRunning) return;
      if (amount === 1 && this.isDewAnimationRunning && this.lastDewAnimationType === 5) return;
      if (amount === 5 && this.isDewAnimationRunning && this.lastDewAnimationType === 1) return;

      this.spawnPointNotify(amount);

      // 효과음 재생
      this.playEffectSound(amount === 1 ? 'singleWater' : 'fiveWater');

      // 대기 큐에 클릭 추가
      this.pendingDewClicks += amount;

      // 애니메이션이 진행 중이 아닐 때만 새로운 애니메이션 시작
      if (this.isDewAnimationRunning) return;
      this.isDewAnimationRunning = true;
      this.lastDewAnimationType = amount; // 클릭한 버튼 타입 기억

      this.addWaterWithQueue();
    },
    async onLightningClick() {
      this.hasActionOccurred = true;
      // 대기 말풍선 예약 취소
      if (this.greetingBubbleTimeout) {
        clearTimeout(this.greetingBubbleTimeout);
        this.greetingBubbleTimeout = null;
      }
      // 말풍선은 사라지게 처리
      if (this.showGreetingBubble) {
        this.showGreetingBubble = false;
        await this.wait(500);
      }

      // 깜빡임 시작
      this.$refs.progressBar.isMinusProgressing = true;
      
      this.pendingLightningClicks += 1;
      this.setActionMessage(lightningMessages, 3600);
      this.spawnPointNotify(-1);

      // 효과음 재생
      this.playEffectSound('lightning');

      if (this.lightningActionRunning) return;
      this.lightningActionRunning = true;
      const stopLightningAction = async () => {
        await this.wait(5300);
        this.lightningActionRunning = false;
      };

      // 캐릭터 번개 애니메이션 실행 (루프 없음, 5300ms 지속)
      const lightningLottieMap = {
        0: Object.assign({}, this.lotties.motionEggLightning, { loop: false }),
        1: Object.assign({}, this.lotties.motionCaterpillarLightning, { loop: false }),
        2: Object.assign({}, this.lotties.motionPupaLightning, { loop: false }),
      };
      this.forceCharacterLottie = lightningLottieMap[this.highestStageReached];
      this.showCharacterAnimation = true;
      this.characterAnimationKey++;
      await Promise.all([this.applyLightning(), this.setMissionPoint(5300, true), this.setDefaultCharacter(5300), stopLightningAction()]);
      // 깜빡임 종료
      this.$refs.progressBar.isMinusProgressing = false;
      await this.wait(700);
      this.isGivingPoints = false;      
    },
    // 이슬방울 애니메이션 실행
    async playDewDropAnimation(onComplete) {
      this.forceCharacterLottie = {
        0: this.lastDewAnimationType === 1 ? this.lotties.motionEggDewSingle : this.lotties.motionEggDewFive,
        1: this.lastDewAnimationType === 1 ? this.lotties.motionCaterpillarDewSingle : this.lotties.motionCaterpillarDewFive,
        2: this.lastDewAnimationType === 1 ? this.lotties.motionPupaDewSingle : this.lotties.motionPupaDewFive,
      }[this.highestStageReached];

      this.showDewDropAnimation = true;
      this.showCharacterAnimation = true;
      this.characterAnimationKey++;

      // 애니메이션과 동시에 말풍선 표시
      this.setActionMessage(
        this.lastDewAnimationType === 1 ? waterDropMessages : waterDropFiveMessages,
        this.lastDewAnimationType === 1 ? 3000 : 4000
      );

      await this.wait(this.lastDewAnimationType === 1 ? 3200 : 5300);

      this.showDewDropAnimation = false;
      this.forceCharacterLottie = null;
      this.characterAnimationKey++;
      if (typeof onComplete === 'function') onComplete();

      // 미션 완료가 아니면 캐릭터 idle 애니메이션 복원
      if (!this.showMissionCompleteModal && this.missionInProgress && this.missionInProgress.point < this.missionInProgress.goal) {
        this.showCharacterAnimation = true;
        this.characterAnimationKey++;
      }
    },
    setClassroomMissionPoint(mission) {
      this.setCurClassroom({
        ...this.curClassroom,
        groupMission: { goal: mission.goal, point: mission.point },
      });
    },
    playSpeechBubbleSound(soundUrl) {
      if (typeof window.hiclassSoundEnabled !== 'undefined' && !window.hiclassSoundEnabled) return;
      if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.play();
      }
    },
    // 캐릭터 클릭 시 말풍선 메시지 변경
    async onCharacterClick() {
      this.hasActionOccurred = true;
      // 대기 말풍선 예약 취소
      if (this.greetingBubbleTimeout) {
        clearTimeout(this.greetingBubbleTimeout);
        this.greetingBubbleTimeout = null;
      }
      // 캐릭터 클릭 인사 말풍선 숨김
      if (this.showGreetingBubble) {
        this.showGreetingBubble = false;
        await this.wait(500);
      }

      const message = speechMessages.map((msg) => (msg.text ? msg.text : msg));
      const msgIdx = this.setActionMessage(message, 2000);
      if (msgIdx === -1) return;

      this.playSpeechBubbleSound(speechMessages[msgIdx].sound);

      this.isCharacterBouncing = true;
      await this.wait(600);
      this.isCharacterBouncing = false;
    },
    onCharacterAnimationEnd(e) {
      if (e.animationName === this.caterpillarPop) {
        this.caterpillarPop = false;
      }
      if (e.animationName === this.pupaPop) {
        this.pupaPop = false;
      }
      if (e.animationName === this.eggPop) {
        this.eggPop = false;
      }
    },
    startMission(mission) {
      this.setClassroomMissionPoint(mission);
      this.showStemAnimation = true;
      this.missionInProgress = mission;
      this.startMissionAnimation();
    },
    async startMissionAnimation() {
      this.showStemAnimation = true;
      this.stemPopActive = false;
      this.isEggEntered = false;
      this.eggPop = false;
      this.showCharacterAnimation = false;

      await this.$nextTick();

      // 줄기 등장 로티 0.31초 실행
      await this.doStemPop(310);

      // 알 단계일 때만 0.05초 후 알 등장 로티 0.31초 실행
      if (this.highestStageReached === 0) {
        await this.wait(50); // 0.05초 대기
        await this.doCharacterPop('eggPop', 310); // 알 등장 로티 0.31초
        this.isEggEntered = true;
        this.showCharacterAnimation = true;
        // 예약된 타이머가 있으면 취소
        if (this.greetingBubbleTimeout) clearTimeout(this.greetingBubbleTimeout);
        // 액션이 이미 발생하지 않은 경우에만 예약
        if (!this.hasActionOccurred) {
          this.greetingBubbleTimeout = setTimeout(() => {
            this.showGreetingBubble = true;
            this.greetingBubbleTimeout = null;
          }, 310);
        }
      }
    },
    openRewardHistoryModal() {
      this.showRewardHistoryModal = true;
    },
    closeRewardHistoryModal() {
      this.showRewardHistoryModal = false;
    },
    openMissionChangeModal() {
      this.showMissionChangeModal = true;
    },
    closeMissionChangeModal() {
      this.showMissionChangeModal = false;
    },
    openMissionFormModal(modalOption) {
      this.missionFormModal.option = modalOption;
      this.missionFormModal.open = true;
    },
    closeMissionFormModal() {
      this.missionFormModal.open = false;
    },
    async getMissions() {
      try {
        const {
          data: {
            _embedded: { missions },
          },
        } = await getGroupMissions(this.curClassroom.classroomId);
        this.missions = missions.map((mission, index) => ({
          ...mission,
          originalIndex: index,
        }));
      } catch (e) {
        throw `미션 목록을 불러오는데 실패했습니다.: ${e}`;
      }
    },
    async openMissionManageModal() {
      try {
        await this.getMissions();
        this.showMissionManageModal = true;
      } catch (e) {
        console.error(e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
    closeMissionManageModal() {
      this.showMissionManageModal = false;
    },
    async loadNewMission(mission) {
      // 사용자가 '미션 변경' 팝업에서 새 미션을 시작할 때
      this.setClassroomMissionPoint(mission);
      this.highestStageReached = 0;

      // 닫기부터 실행하여 modal 관련 DOM/오버레이가 제거되도록 함
      this.showMissionChangeModal = false;

      // 안전하게 애니메이션 상태 초기화
      this.showStemAnimation = false;
      this.stemPopActive = false;
      this.eggPop = false;
      this.caterpillarPop = false;
      this.pupaPop = false;
      this.showCharacterAnimation = false;
      this.isEggEntered = false;
      this.isCharacterBouncing = false;
      this.isStemHideDown = false;
      this.isCharacterHideDown = false;
      this.forceCharacterLottie = null;
      this.characterAnimationKey = 0;

      this.greetingShownForMissionId = mission.id;
      this.showGreetingBubble = false;

      await this.$nextTick();
      await this.wait(120);

      this.startMission(mission);
      this.hasActionOccurred = false;
    },
    closeMissionCompleteModal() {
      this.showMissionCompleteModal = false;
      // 팝업 닫을 때만 나비로 전환
      this.highestStageReached = 3;
    },
    appendMission(mission) {
      this.missions.push(mission);
    },
    deleteMission(templateId) {
      if (this.missionFormModal.open) {
        this.closeMissionFormModal();
      }
      this.missions.splice(
        this.missions.findIndex((m) => m.templateId === templateId),
        1
      );
    },
    updateMission(mission) {
      const index = this.missions.findIndex((m) => m.templateId === mission.templateId);
      if (index !== -1) {
        this.missions[index].name = mission.name;
        this.missions[index].goal = mission.goal;
      }
      if (this.missionInProgress.templateId === mission.templateId) {
        this.missionInProgress.name = mission.name;
      }
    },
    openDeleteConfirm(templateId) {
      this.deleteConfirm.isShow = true;
      this.deleteConfirm.templateId = templateId;
    },
    closeDeleteConfirm() {
      this.deleteConfirm.isShow = false;
      this.deleteConfirm.templateId = '';
    },
    updateMissionsSort(missions) {
      this.missions = missions;
      this.saveMissionSort();
    },
    async saveMissionSort() {
      const groupMissions = this.missions.map((mission, idx) => ({
        id: mission.templateId,
        sortNo: idx + 1,
      }));
      try {
        await updateGroupMissionsSorting(this.curClassroom.classroomId, {
          groupMissions,
        });
      } catch (e) {
        console.error('미션 순서 변경 실패했습니다.', e);
        this.$hiClass.alert('데이터 요청중 에러가 발생했습니다.<br>잠시 후 다시 시도해 주세요.');
      }
    },
    findCharacter(characterCode) {
      if (!characterCode) return {};
      return this.characters.find((c) => c.characterCode === characterCode);
    },
    async doStemPop(wait = 310) {
      this.stemPopActive = true;
      await this.$nextTick();
      await this.wait(wait);
      this.stemPopActive = false;
    },
    async doCharacterPop(characterPop, startWait) {
      this[characterPop] = true;
      await this.$nextTick();
      this.showCharacterAnimation = true;
      await this.wait(startWait);
      this[characterPop] = false;
    },
    async applyLightning() {
      const bg = async () => {
        this.showLightningBg = true;
        await this.wait(4000);
        this.showLightningBg = false;
      };

      const right = async () => {
        this.showLightningRight = true;
        await this.wait(4000);
        this.showLightningRight = false;
      };

      const left = async () => {
        await this.wait(200);
        this.showLightningLeft = true;
        await this.wait(4000);
        this.showLightningLeft = false;
      };

      await Promise.all([bg(), right(), left()]);
    },
    async setMissionPoint(ms = 0, isNegative) {
      await this.wait(ms);
      this.isGivingPoints = true;
      try {
        const mission = await rewardGroupMission(this.curClassroom.classroomId, this.missionInProgress.id, {
          point: isNegative ? this.pendingLightningClicks : this.pendingDewClicks,
          isNegative,
        });
        this.missionInProgress.point = Math.max(0, mission.point);
        this.setClassroomMissionPoint(mission);
      } catch (e) {
        console.error(e);
      } finally {
        this.pendingLightningClicks = 0;
      }
    },
    async setDefaultCharacter(ms = 0) {
      await this.wait(ms);
      this.forceCharacterLottie = null;
      this.showCharacterAnimation = true;
      this.characterAnimationKey++;
    },
    playEffectSound(type) {
      if (typeof window.hiclassSoundEnabled !== 'undefined' && !window.hiclassSoundEnabled) return;
      // type: 'singleWater', 'fiveWater', 'lightning'
      let audioSrc = soundEffects[type];
      let audioKey = type === 'lightning' ? 'lightningAudio' : 'waterAudio';

      // 기존 효과음이 있으면 끊고 새로 재생
      if (this[audioKey]) {
        this[audioKey].pause();
        this[audioKey].currentTime = 0;
      }
      this[audioKey] = new Audio(audioSrc);
      this[audioKey].play();
    },
  },
};
</script>

<style lang="scss" scoped>
// 말풍선 아래에서 위로 올라가며 페이드 인/아웃 애니메이션
.bubble-rise-fade-enter-active,
.bubble-rise-fade-leave-active {
  transition:
    opacity 0.5s cubic-bezier(0.22, 0.9, 0.36, 1),
    transform 0.5s cubic-bezier(0.22, 0.9, 0.36, 1);
}
.bubble-rise-fade-enter {
  opacity: 0;
  transform: translate(-50%, -100%) translateY(20px) !important;
}
.bubble-rise-fade-enter-to {
  opacity: 1;
  transform: translate(-50%, -100%) translateY(0) !important;
}
.bubble-rise-fade-leave {
  opacity: 1;
  transform: translate(-50%, -100%) translateY(0) !important;
}
.bubble-rise-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%) translateY(-40px) !important;
}
// 말풍선 페이드 인/아웃 애니메이션
.bubble-fade-enter-active,
.bubble-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.22, 0.9, 0.36, 1);
}
.bubble-fade-enter {
  opacity: 0;
  transform: translateY(0);
}
.bubble-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.bubble-fade-leave {
  opacity: 1;
  transform: translateY(0);
}
.bubble-fade-leave-to {
  opacity: 0;
  transform: translateY(0);
}
// 배경
.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.bg-fade-enter {
  opacity: 0;
}
.bg-fade-enter-to {
  opacity: 1;
}
.bg-fade-leave {
  opacity: 1;
}
.bg-fade-leave-to {
  opacity: 0;
}
.group-mission {
  .progress-content {
    flex: 1 1 0;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    z-index: 2;
  }
  .progress-content {
    padding: 50px 60px 0 60px;
    transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    // 번개배경 오버레이
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(180deg, rgba(16, 15, 31, 0.9) 0%, rgba(16, 15, 31, 0.2) 100%);
      opacity: 0;
      transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    &.stage-0 {
      // 알
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #e0c9ce 100%);
    }
    &.stage-1 {
      // 애벌레
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #afd7ba 100%);
    }
    &.stage-2 {
      // 번데기
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #d0c69e 100%);
    }
    // 번데기 완료 후 나비 배경
    &.lightning-bg::before {
      opacity: 1;
    }
    &.butterfly-wait-bg {
      // 대기 모드
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #cac8da 100%) !important;
    }
    .groupmission-progress-main {
      position: relative;
    }
    .stem-animation {
      &.stem-lottie {
        transform-origin: center bottom !important;
        display: block;
      }
    }
    .content-wrap {
      display: flex;
      align-items: flex-start;
      position: relative;
      width: 100%;
    }

    .mission-progress-animation {
      position: fixed;
      bottom: -90px;
      left: 55%;
      transform: translateX(-50%);
      display: flex;
      justify-content: center;
      align-items: flex-end;
      z-index: 1;
      .mission-progress-lottie {
        width: 922px !important;
        transform-origin: center bottom !important;
      }
      .character-bounce {
        animation: character-bounce 0.6s;
        will-change: transform;
      }
      @keyframes character-bounce {
        0% {
          transform: translate(-50%, -50%) translateY(0);
        }
        30% {
          transform: translate(-50%, -50%) translateY(-18px);
        }
        60% {
          transform: translate(-50%, -50%) translateY(8px);
        }
        100% {
          transform: translate(-50%, -50%) translateY(0);
        }
      }

      .mission-character-animation {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
        cursor: pointer;
        transition: transform 0.1s ease-out;
        .mission-character-lottie {
          width: 460px !important;
          &.lottie-caterpillar {
            width: 524px !important;
          }
        }
        &.character-hide-down {
          animation: eggHideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes eggHideDown {
          0% {
            transform: translate(-50%, -50%);
          }
          100% {
            transform: translate(-50%, 600px);
          }
        }
      }
      .pupa-pop-animation {
        position: relative;
        z-index: 30;
        display: flex;
        justify-content: center;
        align-items: center;
        .lottie-pupa {
          width: 480px !important;
        }
      }
      &.pupa-stage {
        .dew-drop-animation {
          top: -28%;
          left: -58%;
        }
        .lightning-lottie {
          &.lightning-left {
            position: absolute;
            top: -18%;
            left: -35%;
            z-index: 19;
            transform: scale(0.7);
          }
          &.lightning-right {
            position: absolute;
            top: -25%;
            left: 25%;
            z-index: 19;
            transform: scale(0.9);
          }
        }
      }
      .lightning-lottie {
        &.lightning-left {
          position: absolute;
          top: -30%;
          left: -40%;
          z-index: 19;
          transform: scale(0.7);
        }
        &.lightning-right {
          position: absolute;
          top: -35%;
          left: 27%;
          z-index: 19;
          transform: scale(1);
        }
      }
      .mission-animation-pupa {
        top: 43% !important;
        left: 46% !important;
        transform: translate(-50%, -50%);
        .lottie-pupa {
          width: 450px !important;
        }
      }
      .stem-lottie-pupa {
        width: 980px !important;
      }
      .dew-drop-animation {
        position: absolute;
        top: -43%;
        left: -77%;
        right: -50%;
        bottom: -30%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        z-index: 15;
        pointer-events: none;
        overflow: visible;
        .dew-drop-lottie {
          width: max(300px, 20vw) !important;
          height: max(300px, 20vw) !important;
          transform: scale(1);
          transform-origin: center top;
        }
      }
      &.stem-hide-down {
        animation:
          stemHideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards,
          stemFadeOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      @keyframes stemFadeOut {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      @keyframes stemHideDown {
        0% {
          transform: translateX(-50%) translateY(0);
        }
        100% {
          transform: translateX(-50%) translateY(600px);
        }
      }
    }
    &.mission-start-bg {
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #fee2e8 100%);
    }
    &.step-1 {
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #e0c9ce 100%);
    }
    &.step-2 {
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #afd7ba 100%);
    }
    &.step-3 {
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #d0c69e 100%);
    }
    &.step-4 {
      background: linear-gradient(180deg, #c8e3f9 0%, #d9f8de 50%, #cac8da 100%);
    }
    &::-webkit-scrollbar {
      height: 8px;
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
  }
  .mission-btns {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    margin-top: 30px;
    z-index: 10;
    width: auto;
    .btn-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      .point-notify-wrap {
        width: 90px;
        height: 130px;
        position: relative;
        overflow: visible;
        .point-notify-item {
          position: absolute;
          right: 0;
          animation: riseFade 900ms cubic-bezier(0.22, 0.9, 0.36, 1) forwards;
          pointer-events: none;
        }
        .point-notify-lottie {
          width: 90px;
          height: 130px;
        }
      }
    }
  }
  .mission-btn {
    width: 150px;
    height: 152px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 40px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: linear-gradient(153deg, rgba(255, 255, 255, 0.56) 0.24%, rgba(255, 255, 255, 0.4) 83.31%);
    transition:
      border 0.18s,
      background 0.18s,
      transform 0.18s;
    transform-origin: center center;
    transform: perspective(1200px) scale(1);
    will-change: transform;
    &:hover {
      border: 3px solid #fff;
      background: linear-gradient(153deg, rgba(255, 255, 255, 0.7) 0.24%, rgba(255, 255, 255, 0.5) 83.31%);
      cursor: pointer;
      transform: scale(1.07);
      animation: btnScaleBounce 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      .emoji {
        img {
          transform: scale(1);
        }
      }
    }
    @keyframes btnScaleBounce {
      0% {
        transform: perspective(1200px) scale(1.09);
      }
      30% {
        transform: perspective(1200px) scale(1.1);
      }
      55% {
        transform: perspective(1200px) scale(1.07);
      }
      80% {
        transform: perspective(1200px) scale(1.1);
      }
      100% {
        transform: perspective(1200px) scale(1.07);
      }
    }
    &:active {
      border: 3px solid #fff;
      background: linear-gradient(153deg, rgba(255, 255, 255, 0.7) 0.24%, rgba(255, 255, 255, 0.5) 83.31%);
      cursor: pointer;
      animation: btnScaleShrink 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: scale(0.8);
    }
    @keyframes btnScaleShrink {
      0% {
        transform: scale(1);
      }
      60% {
        transform: scale(0.85);
      }
      80% {
        transform: scale(0.78);
      }
      100% {
        transform: scale(0.8);
      }
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
        color: rgba(0, 0, 0, 0.4);
      }
    }
    .emoji {
      img {
        transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        transform: scale(0.9);
        transform-origin: center center;
        user-select: none;
      }
    }
    .mission-text {
      transition:
        font-size 0.18s,
        line-height 0.18s;
      font-size: 20px;
      line-height: 28px;
      font-weight: 700;
      color: #000;
      user-select: none;
    }
    &:hover .mission-text {
      font-size: 22px;
      line-height: 30px;
    }
  }
  .btn-pressed {
    background: linear-gradient(151deg, #ffe0b2 12%, #ffd180 100%);
    box-shadow: 0 2px 8px rgba(255, 138, 54, 0.15);
    transform: scale(0.95);
    transition:
      background 0.2s,
      box-shadow 0.2s,
      transform 0.1s;
  }
  .progress-content {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition:
      background 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
  }
  @media (max-width: 1920px) {
    .progress-content {
      .content-wrap {
        .mission-progress-animation {
          bottom: -85px;
          left: 57%;
          .mission-progress-lottie {
            width: 922px !important;
          }
        }
        .pupa-stage {
          bottom: -56px;
        }
        .stem-lottie-pupa {
          width: 980px !important;
        }
      }
    }
  }
  @media (max-width: 1640px) {
    .progress-content {
      .content-wrap {
        .mission-progress-animation {
          bottom: -70px;
          left: 61%;
          .mission-progress-lottie {
            width: 800px !important;
          }
          .mission-character-lottie {
            width: 430px !important;
            &.lottie-caterpillar {
              width: 475px !important;
            }
          }
          .mission-animation-pupa {
            .lottie-pupa {
              width: 420px !important;
            }
          }
        }
        .stem-lottie-pupa {
          width: 920px !important;
        }
      }
    }
  }
  @media (max-width: 1440px) {
    .progress-content {
      .content-wrap {
        .mission-progress-animation {
          bottom: -55px;
          left: 62%;
          .mission-progress-lottie {
            width: 700px !important;
          }
          .mission-character-animation {
            .mission-character-lottie {
              width: 360px !important;
              &.lottie-caterpillar {
                width: 420px !important;
              }
            }
            &.mission-animation-pupa {
              top: 41.5% !important;
            }
          }
        }
        .stem-lottie-pupa {
          width: 820px !important;
        }
      }
    }
  }
  @media (max-width: 1410px) {
    .progress-content {
      padding: 30px 30px 0 30px;
      .content-wrap {
        .mission-progress-animation {
          bottom: -55px;
          left: 60%;
          .mission-progress-lottie {
            width: 700px !important;
          }
          .mission-character-animation {
            .mission-character-lottie {
              width: 400px !important;
              &.lottie-pupa {
                width: 364px !important;
              }
            }
            &.mission-animation-pupa {
              top: 47.5% !important;
              left: 44% !important;
            }
          }
        }
        .dew-drop-animation {
          .dew-drop-lottie {
            transform: scale(1.2);
          }
        }
        .stem-lottie-pupa {
          width: 700px !important;
        }
        .lightning-lottie {
          &.lightning-left {
            position: absolute;
            top: -30%;
            left: -40%;
            z-index: 19;
            transform: scale(0.9);
          }
          &.lightning-right {
            position: absolute;
            top: -35%;
            left: 27%;
            z-index: 19;
            transform: scale(1.2);
          }
        }
      }
    }
  }
  @media (max-width: 1360px) {
    .progress-content {
      .content-wrap {
        .mission-btns {
          margin-top: 20px;
          gap: 12px;
          .mission-btn {
            width: 100px;
            height: 100px;
            border-radius: 25px;
            gap: 8px;
            .mission-text {
              font-size: 15px;
              line-height: 24px;
            }
            .emoji {
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              img {
                transform: scale(0.6);
              }
            }
            &:hover {
              .emoji {
                img {
                  transform: scale(0.7);
                }
              }
            }
          }
          .btn-row {
            .point-notify-wrap {
              height: 80px;
            }
          }
        }
        .dew-drop-animation {
          .dew-drop-lottie {
            transform: scale(1.05);
          }
        }
      }
    }
  }
  @media (max-width: 1280px) {
    .progress-content {
      padding: 30px 30px 0 30px;
      .content-wrap {
        .mission-progress-animation {
          bottom: -55px;
          left: 60%;
          .mission-progress-lottie {
            width: 700px !important;
          }
          .mission-character-animation {
            .mission-character-lottie {
              width: 400px !important;
              &.lottie-pupa {
                width: 364px !important;
              }
            }
            &.mission-animation-pupa {
              top: 47.5% !important;
              left: 44% !important;
            }
          }
        }
        .mission-btns {
          .btn-row {
            .point-notify-wrap {
              height: 70px;
              .point-notify-item {
                bottom: -40px !important;
              }
              .point-notify-lottie {
                transform: scale(0.7);
              }
            }
          }
        }
        .dew-drop-animation {
          top: -32%;
          left: -73%;
          .dew-drop-lottie {
            transform: scale(1.05);
          }
        }
        .lightning-lottie {
          &.lightning-left {
            position: absolute;
            top: -20%;
            left: -40%;
            z-index: 19;
            transform: scale(0.7);
          }
          &.lightning-right {
            position: absolute;
            top: -25%;
            left: 20%;
            z-index: 19;
            transform: scale(1);
          }
        }
      }
    }
  }
  @media (max-width: 1180px) {
    .progress-content {
      .content-wrap {
        .mission-progress-animation {
          bottom: -60px;
          left: 54%;
          .mission-progress-lottie {
            width: 740px !important;
          }
          .mission-character-animation {
            .mission-character-lottie {
              width: 420px !important;
              &.lottie-caterpillar {
                width: 430px !important;
              }
            }
            &.mission-animation-pupa {
              top: 47.5% !important;
              left: 44% !important;
            }
          }
        }
      }
    }
  }
  @media (max-width: 1024px) {
    .progress-content {
      .content-wrap {
        .mission-progress-animation {
          bottom: -55px;
          left: 55%;
          .mission-progress-lottie {
            width: 650px !important;
          }
          .mission-character-animation {
            left: 28%;
            .mission-character-lottie {
              width: 360px !important;
              &.lottie-pupa {
                width: 320px !important;
              }
              &.lottie-caterpillar {
                width: 380px !important;
              }
            }
            &.mission-animation-pupa {
              top: 46.5% !important;
            }
          }
          .dew-drop-animation {
            top: -30%;
            .dew-drop-lottie {
              transform: scale(1);
            }
          }
          &.pupa-stage {
            bottom: -58px;
          }
        }
        .stem-lottie-pupa {
          width: 640px !important;
        }
        .lightning-lottie {
          &.lightning-left {
            top: -30%;
            left: -40%;
          }
          &.lightning-right {
            top: -35%;
            left: 20%;
          }
        }
      }
    }
  }
  // @media (max-height: 768px) {
  //   .progress-content {
  //     .content-wrap {
  //       .mission-progress-animation {
  //         .mission-character-animation {
  //           .mission-character-lottie {
  //             width: 364px !important;
  //           }
  //         }
  //         .stem-lottie-pupa {
  //           width: 800px !important;
  //         }
  //       }
  //     }
  //   }
  // }
  // @media (max-height: 650px) {
  //   .progress-content {
  //     .content-wrap {
  //       .mission-progress-animation {
  //         .mission-character-animation {
  //           .mission-character-lottie {
  //             width: 320px !important;
  //           }
  //         }
  //         .stem-lottie-pupa {
  //           width: 700px !important;
  //         }
  //       }
  //     }
  //   }
  // }
  @media (max-width: 768px) {
    .progress-content {
      .content-wrap {
        .mission-progress-animation {
          bottom: -45px;
          left: 55%;
          .mission-progress-lottie {
            width: 500px !important;
          }
          .mission-character-animation {
            left: 28%;
            .mission-character-lottie {
              width: 260px !important;
              &.lottie-caterpillar {
                width: 300px !important;
              }
              &.lottie-pupa {
                width: 260px !important;
              }
            }
            &.mission-animation-pupa {
              top: 47.5% !important;
            }
          }
          .dew-drop-animation {
            .dew-drop-lottie {
              transform: scale(0.8);
            }
          }
          &.pupa-stage {
            bottom: -27px;
          }
        }
        .stem-lottie-pupa {
          width: 500px !important;
        }
      }
    }
  }
  @media (min-width: 2560px) {
    .progress-content {
      padding: 120px 120px 0 120px;
      .content-wrap {
        .mission-progress-animation {
          .mission-progress-lottie {
            width: 1200px !important;
          }
          .mission-character-animation {
            .mission-character-lottie {
              width: 690px !important;
              &.lottie-caterpillar {
                width: 740px !important;
              }
              &.lottie-pupa {
                width: 625px !important;
              }
            }
            &.mission-animation-pupa {
              top: 43% !important;
            }
          }
          .stem-lottie-pupa {
            width: 1362px !important;
          }
        }
        .lightning-lottie {
          &.lightning-left {
            top: -25%;
            left: -45%;
            transform: scale(1);
          }
          &.lightning-right {
            top: -35%;
            left: 35%;
            transform: scale(1.2);
          }
        }
      }
    }
  }
}
</style>
