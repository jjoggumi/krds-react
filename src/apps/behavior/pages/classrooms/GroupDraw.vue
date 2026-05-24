<template>
  <div class="group-draw">
    <div class="container">
      <!-- 헤더 -->
      <div class="header">
        <div class="title">그룹 뽑기</div>
      </div>
      <!-- 그룹내 뽑기 완료 팝업 -->
      <div v-if="isMemberDrawCompletePopupVisible && selectedStudent" class="overlay-popup">
        <div class="popup-content">
          <div v-if="showConfetti" class="confetti-wrap">
            <lottie :options="confetti" class="confetti1"/>
            <lottie :options="confetti" class="confetti2"/>
            <lottie :options="confetti" class="confetti3"/>
          </div>
          <div
            class="popup-content-wrap"
            :style="{ transform: `scale(${scale})` }"
          >
            <div v-if="showProfileImage" class="btn-with-thumb">
              <div class="img-area" :class="getProfileImageClass(selectedStudent)">
                <img :src="getProfileImage(selectedStudent)"
                    alt="썸네일">
              </div>
              <span class="btn-text">
                <span class="num">{{ selectedStudent.studentNo }}</span>
                <span class="name">{{ selectedStudent.studentName }}</span>
              </span>
            </div>
            <div v-else class="btn-with-thumb">
              <div
                  :style="{ 'background-color': selectedStudent.backgroundColor }"
                  class="img-area"
              >
                <div class="txt-area">
                  <span class="num">{{ selectedStudent.studentNo }}</span>
                  <span class="name">{{ selectedStudent.studentName }}</span>
                </div>
              </div>
            </div>
            <div class="btn-group">
              <HiButton
                  color="primary"
                  size="lg"
                  @click="openGiveGroupPointModal()"
                  class="last-btn"
              >
                그룹 전체 포인트 지급
              </HiButton>
              <HiButton
                  color="primary"
                  size="lg"
                  @click="openGiveStudentPointModal(selectedStudent)"
                  class="last-btn"
              >
                뽑힌 학생 포인트 지급
              </HiButton>
              <HiButton
                  color="line-gray"
                  size="lg"
                  @click="getStudentInGroupDraw()"
                  class="last-btn"
              >
                다시 뽑기
              </HiButton>
            </div>
          </div>
        </div>
      </div>
      <!-- 컨텐츠 -->
      <div class="content-wrap">
        <div ref="content" class="content">
          <div
              ref="planType"
              :class="{ 
                'group-max': isGroupOverflow,
                'full-height': !isScrollNeeded
              }"
              :style="{ zoom: zoom }"
              class="plan-type"
          >
            <div
              ref="planTypeInner"
              class="plan-type-inner"
            >
              <button
                class="blackboard"
                :style="{
                  maxWidth: '426px',
                  fontSize: `${24 * zoom}px`
                }"
              >
                <span>칠판</span>
              </button>
              <!-- 동적 그룹 리스트 -->
              <template v-if="seatPlanSections">
                <ul
                    :class="[
                      layoutTypeClass,
                      { 'has-large-group': hasLargeGroup }
                    ]"
                    :style="getGroupStyle"
                    class="division"
                >
                  <li
                    v-for="(section, sectionIndex) in seatSections"
                    :key="sectionIndex"
                    :class="[
                      effectiveLayoutType,
                      `gCount-${seatSections.length}`,
                      getGroupRangeClass(seatSections.length),
                      {
                        selected: selectedGroupIndex === sectionIndex && !isDrawingGroup,
                        'is-drawing': isDrawingGroup && selectedGroupIndex === sectionIndex,
                        dimmed: selectedGroupIndex !== null && selectedGroupIndex !== sectionIndex && !isDrawingGroup,
                        'has-large-group': hasLargeGroup
                      }
                    ]"
                    class="division-list"
                  >
                    <div
                        :class="{
                        [`highlight-step-${highlightStep % 2}`]: isDrawingGroup && selectedGroupIndex === sectionIndex
                      }"
                        class="list-title"
                    >
                      <span>{{ section.sectionName }}</span>
                    </div>

                    <div
                        :class="[
                        {
                          'draw-type-1': layoutType === 'one-column',
                          'draw-type-2': layoutType === 'two-column',
                          'group3-4': layoutType === 'group3-4',
                          'group5-6': layoutType === 'group5-6',
                          [`highlight-step-${highlightStep % 2}`]: isDrawingGroup && selectedGroupIndex === sectionIndex
                        },
                        {
                          'event-height': layoutType === 'one-column' && (seatSections.length === 7 || seatSections.length === 8),
                        }
                      ]"
                        :style="getDrawWrapStyle(seatSections.length)"
                        class="draw-wrap"
                    >
                      <!-- 1열 타입 -->
                      <template v-if="layoutType === 'one-column'">
                        <div
                          v-for="(seat, seatIndex) in section.seats"
                          :key="seatIndex"
                          :class="[
                            'draw-area',
                            {
                              'has-student': seat.student,
                              flashing: isDrawingMember && selectedGroupIndex === sectionIndex && selectedMemberIndex === seatIndex,
                              dimmed: selectedGroupIndex === sectionIndex && selectedMemberIndex !== null && selectedMemberIndex !== seatIndex
                            }
                          ]"
                          :style="getDrawAreaStyle(sectionIndex, seatIndex)"
                        >
                          <template v-if="seat.student">
                            <div v-if="showProfileImage" class="profile">
                              <div :class="getProfileImageClass(seat.student)">
                                <img
                                  :src="getProfileImage(seat.student)"
                                  alt="썸네일"
                                  @load="onProfileImageLoad(seat.student.studentId, $event)"
                                />
                              </div>
                            </div>
                            <div class="text-area">
                              <span class="num">{{ seat.student.studentNo }}</span>
                              <span class="name">{{ seat.student.studentName }}</span>
                            </div>
                          </template>
                        </div>
                      </template>

                      <!-- 2열 타입 -->
                      <template v-else-if="layoutType === 'two-column'">
                        <div
                          v-for="(seat, seatIndex) in section.seats"
                          :key="seatIndex"
                          :class="[
                            'draw-area',
                            {
                              'has-student': seat.student,
                              flashing: isDrawingMember && selectedGroupIndex === sectionIndex && selectedMemberIndex === seatIndex,
                              dimmed: selectedGroupIndex === sectionIndex && selectedMemberIndex !== null && selectedMemberIndex !== seatIndex
                            }
                          ]"
                          :style="getDrawAreaStyle(sectionIndex, seatIndex)"
                        >
                          <template v-if="seat.student">
                            <div v-if="showProfileImage" class="profile">
                              <div :class="getProfileImageClass(seat.student)">
                                <img
                                  :src="getProfileImage(seat.student)"
                                  alt="썸네일"
                                  @load="onProfileImageLoad(seat.student.studentId, $event)"
                                />
                              </div>
                            </div>
                            <div class="text-area">
                              <span class="num">{{ seat.student.studentNo }}</span>
                              <span class="name">{{ seat.student.studentName }}</span>
                            </div>
                          </template>
                        </div>
                      </template>

                      <!-- 3~4인 모둠 타입 -->
                      <template v-else-if="layoutType === 'group3-4'">
                        <div
                          v-for="(seat, seatIndex) in section.seats"
                          :key="seatIndex"
                          :class="[
                            'draw-area',
                            {
                              'has-student': seat.student,
                              flashing: isDrawingMember && selectedGroupIndex === sectionIndex && selectedMemberIndex === seatIndex,
                              dimmed: selectedGroupIndex === sectionIndex && selectedMemberIndex !== null && selectedMemberIndex !== seatIndex
                            }
                          ]"
                          :style="getDrawAreaStyle(sectionIndex, seatIndex)"
                        >
                          <template v-if="seat.student">
                            <div v-if="showProfileImage" class="profile">
                              <div :class="getProfileImageClass(seat.student)">
                                <img
                                  :src="getProfileImage(seat.student)"
                                  alt="썸네일"
                                  @load="onProfileImageLoad(seat.student.studentId, $event)"
                                />
                              </div>
                            </div>
                            <div class="text-area">
                              <span class="num">{{ seat.student.studentNo }}</span>
                              <span class="name">{{ seat.student.studentName }}</span>
                            </div>
                          </template>
                        </div>
                      </template>

                      <!-- 5~6인 모둠 타입 -->
                      <template v-else-if="layoutType === 'group5-6'">
                        <div
                          v-for="(seat, seatIndex) in section.seats"
                          :key="seatIndex"
                          :class="[
                            'draw-area',
                            {
                              'has-student': seat.student,
                              flashing: isDrawingMember && selectedGroupIndex === sectionIndex && selectedMemberIndex === seatIndex,
                              dimmed: selectedGroupIndex === sectionIndex && selectedMemberIndex !== null && selectedMemberIndex !== seatIndex
                            }
                          ]"
                          :style="getDrawAreaStyle(sectionIndex, seatIndex)"
                        >
                          <template v-if="seat.student">
                            <div v-if="showProfileImage" class="profile">
                              <div :class="getProfileImageClass(seat.student)">
                                <img
                                  :src="getProfileImage(seat.student)"
                                  alt="썸네일"
                                  @load="onProfileImageLoad(seat.student.studentId, $event)"
                                />
                              </div>
                            </div>
                            <div class="text-area">
                              <span class="num">{{ seat.student.studentNo }}</span>
                              <span class="name">{{ seat.student.studentName }}</span>
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
        <div v-if="showConfetti" class="confetti-wrap">
          <lottie :options="confetti" class="confetti1"/>
          <lottie :options="confetti" class="confetti2"/>
          <lottie :options="confetti" class="confetti3"/>
        </div>

        <!-- 푸터: 사운드 토글 및 버튼 -->
        <div class="draw-footer">
          <div class="sound-toggle">
            <label :class="{ on: soundEffect }">
              <input v-model="soundEffect" type="checkbox"/>
              <HiIcon
                  :name="soundEffect ? 'ico-sound' : 'ico-sound-off'"
                  color="gray"
                  size="32"
              />
              효과음 {{ soundEffect ? 'ON' : 'OFF' }}
            </label>
          </div>
          <div class="btns">
            <div>
              <HiButton
                  v-if="selectedGroupIndex !== null && !isDrawingGroup"
                  :disabled="isDrawingGroup || isDrawingMember"
                  class="btn-line-orange"
                  @click="getStudentInGroupDraw()"
              >
                그룹 내 뽑기
              </HiButton>
              <HiButton
                  :disabled="isDrawingGroup || isDrawingMember"
                  class="btn-orange ml8"
                  @click="getGroupDraw()"
              >
                그룹 뽑기
              </HiButton>
              <HiButton
                  :disabled="isDrawingGroup || isDrawingMember"
                  class="btn-info ml8"
                  @click="openGiveGroupPointModal()"
              >
                포인트 지급
              </HiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    <HiButton class="btn-close" color="link" @click="onClickClose">
      <HiIcon color="white" name="ico-close" size="36"/>
      닫기
    </HiButton>
    <give-total-point-modal
        v-if="isGiveTotalPointModal"
        :mode="'good'"
        :student-list="[pickedStudents]"
        @close="isGiveTotalPointModal = false"
        @closeSubmit="isGiveTotalPointModal = false;"
    />
    <audio id="audioContainer" ref="givePointSound">
      <source id="audioSource" ref="givePointSoundSource" src=""/>
    </audio>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {mapActions, mapMutations, mapState} from 'vuex'
import Lottie from "@/components/Lottie/Lottie.vue"
import confetti from '@/assets/img/lottie/confetti.json'
import GiveTotalPointModal from '@/apps/behavior/components/popup/GiveTotalPointModal.vue'
import "@/assets/css/behavior-record.css"
import {
  getDrawInGroup,
  getGroupDraw,
  getSeatPlanSections,
  SeatPlanSections,
  SeatSection, SectionType,
  SeatStudent
} from "@hiclass/core"
import Sound from "@/apps/behavior/mixins/Sound.vue"
import { Scale } from 'chart.js'
import uuid from "uuid";
import SeatPlansMixin from "@/apps/behavior/mixins/SeatPlansMixin.vue";

//코드 이해를 위한 Type 정의
type ColorCode = string;
type StudentId = string;

interface GroupDrawState {
  seatPlanId: string | null;
  classroomId: string | null;
  version: number | null;
  seatPlanSections: SeatPlanSections | null;
  showConfetti: boolean;
  isSeatPlanSectionRotate: boolean;
  zoom: number;
  isDrawingMember: boolean;
  pickedStudents: any[];
  isMemberDrawCompletePopupVisible: boolean;
  isGroupDrawVisible: boolean;
  selectedGroupIndex: number | null;
  studentColors: Record<StudentId, ColorCode>;
  isDrawingGroup: boolean;
  highlightStep: number;
  selectedMemberIndex: number | null;
  drawSelectedMemberIndex: number | null;
  finalBorderColor: string | null;
  isGiveTotalPointModal: boolean;
  givePointSoundGood: string;
  givePointSoundBad: string;
  randomAllPickSoundURL: string;
  randomDrawSoundURL: string;
  randomConfettiSoundURL: string;
  randomFlipSoundURL: string;
  randomShuffleSoundURL: string;
  confetti: {
    animationData: any;
    loop: boolean;
    autoplay: boolean;
  };
  scale: number;
  confettiTimeout: ReturnType<typeof setTimeout> | null;
  isScrollNeeded: boolean;
}

const colorPool = [
  '#4ECB71', '#6369F1', '#B75BEF', '#FCCB32',
  '#FF766D', '#FF8737', '#3AAFFF', '#66A3FF'
]

export default Vue.extend({
  name: 'GroupDraw',
  components: {
    Lottie,
    GiveTotalPointModal
  },
  mixins: [Sound, SeatPlansMixin],
  data(): GroupDrawState {
    return {
      isScrollNeeded: false,
      seatPlanId: null,
      classroomId: null,
      version: null,
      seatPlanSections: null,
      showConfetti: false,
      confettiTimeout: null,
      isSeatPlanSectionRotate: false,
      zoom: 1,
      scale: 1,
      isDrawingMember: false,
      pickedStudents: [],
      isMemberDrawCompletePopupVisible: false,
      isGroupDrawVisible: true,
      selectedGroupIndex: null,
      studentColors: {},
      isDrawingGroup: false,
      highlightStep: 0,
      selectedMemberIndex: null,
      drawSelectedMemberIndex: null,
      finalBorderColor: null,
      isGiveTotalPointModal: false,
      givePointSoundGood: "https://download.hiclass.net/static/assets/audio/givepoint_sound_good.mp3",
      givePointSoundBad: "https://download.hiclass.net/static/assets/audio/givepoint_sound_bad.mp3",
      randomAllPickSoundURL: "https://download.hiclass.net/static/assets/audio/random-all-pick.mp3",
      randomDrawSoundURL: "https://download.hiclass.net/static/assets/audio/random-draw-0.wav",
      randomConfettiSoundURL: "https://download.hiclass.net/static/assets/audio/random-confetti.wav",
      randomFlipSoundURL: "https://download.hiclass.net/static/assets/audio/random-flip.mp3",
      randomShuffleSoundURL: "https://download.hiclass.net/static/assets/audio/random-shuffle.mp3",
      confetti: {
        animationData: confetti,
        loop: false,
        autoplay: true
      },
    };
  },
  mounted() {
    this.checkScroll();
    window.addEventListener('resize', this.checkScroll);

    this.syncDrawWrapHeights()
    window.addEventListener('resize', this.syncDrawWrapHeights)

    if (this.isiPad()) {
      document.body.classList.add('ios');
      window.dispatchEvent(new Event('resize'));
    }

    this.contentCardSizing();
    window.addEventListener('resize', this.contentCardSizing);

    this.updateScale();
    window.addEventListener('resize', this.updateScale);
    
    this.setRotate();
    window.addEventListener('resize', this.applyRotateClass);

    this.$nextTick(() => {
        this.applyRotateClass();
        const planTypeE1 = this.$refs.planType as HTMLElement;
        if (planTypeE1 && this.isSeatPlanSectionRotate) {
          planTypeE1.classList.add('rotate');
        } else if (planTypeE1) {
          planTypeE1.classList.remove('rotate');
        }
      }
    )
  },

  updated() {
    this.syncDrawWrapHeights();
    this.checkScroll();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.contentCardSizing);
    window.removeEventListener('resize', this.updateScale);
    window.removeEventListener('resize', this.checkScroll);
  },

  computed: {
    ...mapState('storeBehavior', [
      'pointGiveFinishModal',
      'detailClass',
      'lastStudentsParams',
      'lastSenderUUID'
    ]),
    effectiveLayoutType(): string {
      if (this.layoutType === 'group3-4' && this.hasLargeGroup) {
        return 'group5-6';
      }
      return this.layoutType;
    },
    hasLargeGroup(): boolean {
      if (this.layoutType !== 'group3-4') return false;

      return this.seatSections.some(section => {
        const memberCount = section.seats.filter(s => s.student).length;
        return memberCount >= 5;
      });
    },
    showProfileImage() {
      // 스토어 타입 지정전 임시
      return (this.detailClass as {studentViewType : string}).studentViewType === "CHARACTER";
    },

    seatSections(): SeatSection[] {
      return this.seatPlanSections?.seatSections ?? [];
    },

    sectionType() {
      return this.seatPlanSections?.sectionType ?? SectionType.SINGLE_COLUMN;
    },

    layoutType() {
      //section 타입 ( SINGLE_COLUMN(1열), DOUBLE_COLUMN(2열), GROUP_THREE_PERSON(3인 모둠), GROUP_FOUR_PERSON, GROUP_FIVE_PERSON, GROUP_SIX_PERSON, FREE_LAYOUT(자유형) )
      switch (this.sectionType) {
        case SectionType.SINGLE_COLUMN:
          return 'one-column';
        case SectionType.DOUBLE_COLUMN:
          return 'two-column';
        case SectionType.GROUP_THREE_PERSON:
          return 'group3-4';
        case SectionType.GROUP_FOUR_PERSON:
          return 'group3-4';
        case SectionType.GROUP_FIVE_PERSON:
          return 'group5-6';
        case SectionType.GROUP_SIX_PERSON:
          return 'group5-6';
        default:
          throw new Error('not grouped seatSectionType');
      }
    },

    layoutTypeClass(): string {
      switch (this.effectiveLayoutType) {
        case 'one-column': return 'layout-one-column';
        case 'two-column': return 'layout-two-column';
        case 'group3-4': return 'layout-group3-4';
        case 'group5-6': return 'layout-group5-6';
        default: return '';
      }
    },

    getGroupStyle() {
      let style = {};
      const groupCount = this.seatSections.length;

      switch (this.layoutType) {
        case 'one-column': {
          let gridColumns = 'repeat(1, minmax(auto, 224px))';

          if (groupCount >= 8) {
            gridColumns = 'repeat(8, minmax(auto, 224px))';
          } else if (groupCount === 7) {
            gridColumns = 'repeat(7, minmax(auto, 224px))';
          } else if (groupCount === 6) {
            gridColumns = 'repeat(6, minmax(auto, 224px))';
          } else if (groupCount === 5) {
            gridColumns = 'repeat(5, minmax(auto, 224px))';
          } else if (groupCount === 4) {
            gridColumns = 'repeat(4, minmax(auto, 224px))';
          } else if (groupCount === 3) {
            gridColumns = 'repeat(3, minmax(auto, 224px))';
          } else if (groupCount === 2) {
            gridColumns = 'repeat(2, minmax(auto, 224px))';
          } else {
            gridColumns = 'repeat(1, minmax(auto, 224px))';
          }

          style = {
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: '80px',
            justifyContent: 'center'
          };
          break;
        }

        case 'two-column': {
          let column = 2;
          let columnGap = '80px';

          if (groupCount === 4) {
            column = 4;
            columnGap = '24px';
          } else if (groupCount === 3) {
            column = 3;
            columnGap = '80px';
          } else if (groupCount === 2) {
            column = 2;
            columnGap = '80px';
          } else if (groupCount === 1) {
            column = 1;
            columnGap = '0';
          }

          style = {
            display: 'grid',
            gridTemplateColumns: `repeat(${column}, minmax(auto, 224px))`,
            columnGap: columnGap,
            column,
            justifyContent: 'center'
          };
          break;
        }
        case 'group3-4': {
          const maxMemberCount = Math.max(
            ...this.seatSections.map(section => section.seats.filter(s => s.student).length)
          );

          // 5명 이상이면 group5-6 스타일 강제 적용
          if (maxMemberCount >= 5) {
            // group5-6 케이스와 동일한 스타일 생성
            let columns = 6;
            let rowGap = '20px';
            let columnGap = '20px';
            const groupCount = this.seatSections.length;

            if (groupCount >= 1 && groupCount <= 6) {
              columns = 3;
              rowGap = '80px';
              columnGap = '80px';
            } else if (groupCount >= 7 && groupCount <= 8) {
              columns = 4;
              rowGap = '80px';
              columnGap = '30px';
            } else if (groupCount >= 9 && groupCount <= 12) {
              columns = 4;
              rowGap = '8px';
              columnGap = '32px';
            } else if (groupCount >= 13 && groupCount <= 15) {
              columns = 5;
              rowGap = '20px';
              columnGap = '20px';
            } else if (groupCount >= 16 && groupCount <= 18) {
              columns = 6;
              rowGap = '20px';
              columnGap = '20px';
            }

            style = {
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(auto, 224px))`,
              rowGap,
              columnGap,
              justifyContent: 'center',
              height: 'auto'
            };
          } else {
            // 기존 group3-4 스타일 유지
            let columns3 = 3;
            let rowGap3 = '80px';
            let columnGap3 = '80px';
            const groupCount = this.seatSections.length;

            if (groupCount >= 1 && groupCount <= 6) {
              columns3 = 3;
              rowGap3 = '80px';
              columnGap3 = '80px';
            } else if (groupCount >= 7 && groupCount <= 9) {
              columns3 = 3;
              rowGap3 = '14px';
              columnGap3 = '80px';
            } else if (groupCount >= 10 && groupCount <= 12) {
              columns3 = 4;
              rowGap3 = '14px';
              columnGap3 = '32px';
            } else if (groupCount >= 13 && groupCount <= 16) {
              columns3 = 4;
              rowGap3 = '8px';
              columnGap3 = '32px';
            } else if (groupCount >= 17 && groupCount <= 20) {
              columns3 = 5;
              rowGap3 = '8px';
              columnGap3 = '20px';
            } else if (groupCount >= 21 && groupCount <= 24) {
              columns3 = 6;
              rowGap3 = '20px';
              columnGap3 = '20px';
            } else if (groupCount >= 25) {
              columns3 = 6;
              rowGap3 = '16px';
              columnGap3 = '16px';
            }

            style = {
              display: 'grid',
              gridTemplateColumns: `repeat(${columns3}, minmax(auto, 224px))`,
              rowGap: rowGap3,
              columnGap: columnGap3,
              justifyContent: 'center',
              height: 'auto'
            };
          }
          break;
        }
        case 'group5-6': {
          let columns = 6;
          let rowGap = '20px';
          let columnGap = '20px';

          if (groupCount >= 1 && groupCount <= 6) {
            columns = 3;
            rowGap = '80px';
            columnGap = '80px';
          } else if (groupCount >= 7 && groupCount <= 8) {
            columns = 4;
            rowGap = '80px';
            columnGap = '30px';
          } else if (groupCount >= 9 && groupCount <= 12) {
            columns = 4;
            rowGap = '8px';
            columnGap = '32px';
          } else if (groupCount >= 13 && groupCount <= 15) {
            columns = 5;
            rowGap = '20px';
            columnGap = '20px';
          } else if (groupCount >= 16 && groupCount <= 18) {
            columns = 6;
            rowGap = '20px';
            columnGap = '20px';
          }
          style = {
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(auto, 224px))`,
            rowGap,
            columnGap,
            justifyContent: 'center',
            height: 'auto'
          };
          break;
        }
      }
      return style;
    },

    isGroupOverflow() {
      // 왜 Ts 컴파일 에러나는지 모르겠음, 버전 문제인듯
      const count = (this.seatSections as SeatSection[]).length || 0
      const type = this.layoutType

      if (type === 'group3-4') return count >= 24
      if (type === 'group5-6') return count >= 19
      return false
    },

    selectedGroupStudents() {
      if (this.selectedGroupIndex === null) return []
      return (this.seatSections[this.selectedGroupIndex] as SeatSection).seats.map(seat => seat.student) || []
    },

    selectedStudent() {
      if (this.drawSelectedMemberIndex === null) return null
      const student = this.selectedGroupStudents[this.drawSelectedMemberIndex] as SeatStudent
      const color =
          // drawAreaColors가 있다면 해당 컬러를 쓴다.
          this.drawAreaColors[this.drawSelectedMemberIndex] ||
          colorPool[this.drawSelectedMemberIndex % colorPool.length] ||
          (this as any).assignColorToStudent(student.studentId, this.drawSelectedMemberIndex);
      return {
        ...student,
        studentCharacter: student?.character,
        backgroundColor: color
      };
    },

    drawAreaColors() {
      const memberCnt = this.selectedGroupStudents.length;
      const baseColors = [...colorPool];

      let drawColors = [];

      if (memberCnt <= baseColors.length) {
        for (let i = baseColors.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [baseColors[i], baseColors[j]] = [baseColors[j], baseColors[i]];
        }
        drawColors = baseColors.slice(0, memberCnt);
      } else {
        for (let i = baseColors.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [baseColors[i], baseColors[j]] = [baseColors[j], baseColors[i]];
        }
        drawColors = [...baseColors];
        const extraCount = memberCnt - baseColors.length;
        for (let i = 0; i < extraCount; i++) {
          const randomColor = baseColors[Math.floor(Math.random() * baseColors.length)];
          drawColors.push(randomColor);
        }
      }

      return drawColors;
    }
  },
  watch: {
    seatPlanSections: {
      handler() {
        this.$nextTick(() => {
          this.contentCardSizing();
        });
      },
      immediate: true,
    },
    isSeatPlanSectionRotate(newVal: boolean) {
      const planTypeE1 = this.$refs.planType as HTMLElement;
      if (planTypeE1) {
        if(newVal) {
          planTypeE1.classList.add('rotate');
        } else {
          planTypeE1.classList.remove('rotate')
        }
      }
    }
  },
  methods: {
    ...mapMutations('storeBehavior', [
      'setPointGiveFinishModal',
      'setNewStudentPoints',
      'setLastSenderUUID'
    ]),

    ...mapActions('storeBehavior', [
      'patchPointGiveFinishModal',
      'getDetailClass',
      'getClassroomStudents',
      'sendStompClient'
    ]),
    checkScroll() {
      this.$nextTick(() => {
        const el = this.$refs.planType as HTMLElement | undefined;
        if (!el) return;

        this.isScrollNeeded = el.scrollHeight > el.clientHeight;
      });
    },
    stopConfetti() {
      if (this.confettiTimeout) {
        clearTimeout(this.confettiTimeout);
        this.confettiTimeout = null;
      }
      this.showConfetti = false;
    },
    syncDrawWrapHeights(): void {
      if (this.zoom < 0.9) return;
      this.$nextTick(() => {
        const drawWraps = this.$el.querySelectorAll('.draw-wrap') as NodeListOf<HTMLElement>
        let maxHeight = 0

        drawWraps.forEach((el: HTMLElement) => {
          el.style.height = 'auto'
          const h = el.offsetHeight
          if (h > maxHeight) maxHeight = h
        })

        drawWraps.forEach((el: HTMLElement) => {
          el.style.height = `${maxHeight}px`
        })
      })
    },

    async init(classroomId: string, seatPlanId: string, version: number) {
      try {
        this.seatPlanSections = await getSeatPlanSections(classroomId, seatPlanId, version);
        this.seatPlanId = seatPlanId;
        this.classroomId = classroomId;
        this.version = version;
        this.setRotate()
      } catch (error) {
        console.error(error);
        (this as any).$hiClass.alert(`오류가 발생했습니다. 다시 시도해주세요.`);
        this.$emit('close');
      }
    },

    setRotate() {
      //로컬 스토리에 교실 돌리는 값이 있음
      //TODO 나중에 오타 찾아서 바꾸기
      try {
        const seatPlanRoates = JSON.parse(localStorage.getItem("seatPlanRoates") || "[]") as {seatPlanId: string}[]
        this.isSeatPlanSectionRotate = Boolean(seatPlanRoates.find(({seatPlanId}) => seatPlanId ==  this.seatPlanId))
      } catch (error) {
        // json parse 에러로 인한 초기화 처리
        localStorage.setItem("seatPlanRoates", "[]")
        console.error(error)
      }
    },
    applyRotateClass() {
      const planTypeE1 = this.$refs.planType as HTMLElement;
      if (!planTypeE1) return;

      if (this.isSeatPlanSectionRotate) {
        planTypeE1.classList.add('rotate');
      } else {
        planTypeE1.classList.remove('rotate');
      }
    },
    onClickClose() {
      if (this.isMemberDrawCompletePopupVisible) {
        this.isMemberDrawCompletePopupVisible = false;
      } else {
        this.$emit('close');
      }
    },

    async getGroupDraw() {
      this.stopConfetti();
      if (this.isDrawingGroup || this.seatPlanSections === null || this.seatPlanId === null || this.version === null) return;

      try {
        const {drawResult: {groupId}} = await getGroupDraw(this.seatPlanId, this.version);

        const senderUUID = uuid.v4();
        this.setLastSenderUUID(senderUUID) // store에 LastSenderUUID set

        this.sendStompClient({
          contentType: 'groupDraw',
          classroomId: this.classroomId,
          seatPlanId: this.seatPlanId,
          version: this.version,
          seatSectionId: groupId,
          senderUUID: senderUUID,
        }).then();

        await this.startGroupDrawAnimation(this.seatPlanSections.seatPlanId, groupId)
      } catch (error) {
        console.error(error);
        (this as any).$hiClass.alert(`오류가 발생했습니다. 다시 시도해주세요.`);
      }
    },

    async startGroupDrawAnimation(seatPlanId: string, selectedGroupId: string) {
      this.showConfetti = false;
      if (seatPlanId && this.seatPlanId !== seatPlanId) return;

      if (this.isMemberDrawCompletePopupVisible) {
        this.isMemberDrawCompletePopupVisible = false;
      }

      this.showToast('어떤 그룹이 뽑힐까요?');
      this.playDrawSound();

      this.isDrawingMember = false;
      this.selectedMemberIndex = null;
      this.finalBorderColor = null;
      this.isDrawingGroup = true;
      this.selectedGroupIndex = null;
      this.highlightStep = 0;

      const drawIndex = this.seatSections.findIndex(seatSection => seatSection.sectionId === selectedGroupId) || 0;
      const maxStep = 16;

      const interval = setInterval(() => {
        this.highlightStep++;

        if (this.highlightStep > maxStep) {
          clearInterval(interval);
          this.isDrawingGroup = false;
          this.clearToast();
          this.playConfettiSound();

          // 폭죽 애니메이션 시작
          this.showConfetti = true;

          if (this.confettiTimeout) clearTimeout(this.confettiTimeout);
          this.confettiTimeout = setTimeout(() => {
            this.showConfetti = false;
            this.confettiTimeout = null;
          }, 5000);

        } else if (this.highlightStep === maxStep) {
          this.selectedGroupIndex = drawIndex;
        } else {
          this.selectedGroupIndex = Math.floor(Math.random() * this.seatSections.length);
        }
      }, 250);
    },

    playDrawSound() {
      //뽑기 사운드 재생
      (this as any).resetAllSounds();
      (this as any).playSoundEffect(this.randomDrawSoundURL);
      (this as any).playSoundEffect(this.randomConfettiSoundURL, 'pause');  // 팡파래 효과음 잠시 멈춤 (아이패드 대응)
    },

    playConfettiSound() {
      //빵빠레 사운드
      (this as any).playSoundEffect(this.randomDrawSoundURL, 'pause');
      (this as any).playSoundEffect(this.randomConfettiSoundURL, 'play');
    },

    async getStudentInGroupDraw() {
      this.stopConfetti();
      if (this.selectedGroupIndex === null || this.isDrawingMember || this.seatPlanSections === null ||  this.seatPlanId === null || this.version === null) return;

      try {
        const {drawResult: {studentId, groupId}} = await getDrawInGroup(this.seatPlanId, this.version);
        const senderUUID = uuid.v4()
        this.setLastSenderUUID(senderUUID) // store에 LastSenderUUID set

        this.sendStompClient({
          contentType: 'groupDraw',
          classroomId: this.classroomId,
          seatPlanId: this.seatPlanId,
          version: this.version,
          seatSectionId: groupId,
          studentId: studentId,
          senderUUID
        }).then();

        await this.startMemberDrawAnimation(this.seatPlanSections.seatPlanId, groupId, studentId)

      } catch (error) {
        console.error(error);
        (this as any).$hiClass.alert(`오류가 발생했습니다. 다시 시도해주세요.`);
      }
    },

    async startMemberDrawAnimation(seatPlanId: string, seatSectionId: string, studentId: string) {
      // seatPlanId 다르면 반응 X
      if (seatPlanId && this.seatPlanId !== seatPlanId) return;

      if (this.selectedGroupIndex === null) {
        this.selectedGroupIndex = this.seatSections.findIndex(seatSection => seatSection.sectionId === seatSectionId) || 0;
      }

      this.showToast('누가 뽑힐까요?');

      this.playDrawSound();

      const maxStep = 10;
      let step = 0;

      this.isDrawingMember = true;
      this.selectedMemberIndex = null;
      this.finalBorderColor = null;
      this.isMemberDrawCompletePopupVisible = false;

      const selectedStudentIndex = this.selectedGroupStudents.findIndex(student => student?.studentId === studentId);

      const interval = setInterval(() => {
        step++;

        if (step > maxStep) {
          clearInterval(interval);
          this.isDrawingMember = false;
          this.selectedMemberIndex = null; // 학생 뽑았다는 팝업 뜰때 학생 하이라이트 해제
          this.isMemberDrawCompletePopupVisible = true;
          this.clearToast();
          this.showConfetti = true;
          this.playConfettiSound();

        } else if (step === maxStep) {
          this.selectedMemberIndex = selectedStudentIndex;
          this.drawSelectedMemberIndex = selectedStudentIndex;
        } else {
          // 인덱스만 뽑아서 배열로 만들고 해당 배열의 인덱스만 돌아가도록 수정
          const validIndices = this.selectedGroupStudents
            .map((student, index) => (student ? index : -1))
            .filter(index => index !== -1);
          if (validIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * validIndices.length);
            this.selectedMemberIndex = validIndices[randomIndex];
          }
        }
      }, 350);
    },

    showToast(message: string, duration = 6000) {
      this.$toasted.clear();

      this.$toasted.show(message, {
        duration: duration,
        className: "type01 random-draw-toast",
        position: "top-center",
      });
    },

    clearToast() {
      this.$toasted.clear();
    },

    getGroupRangeClass(count: number): string {
      const effectiveType = (this.layoutType === 'group3-4' && this.hasLargeGroup) ? 'group5-6' : this.layoutType;

      if (effectiveType === 'group3-4') {
        if (count >= 1 && count <= 6) return 'gRange-1-6';
        if (count >= 7 && count <= 9) return 'gRange-7-9';
        if (count >= 10 && count <= 12) return 'gRange-10-12';
        if (count >= 13 && count <= 16) return 'gRange-13-16';
        if (count >= 17 && count <= 20) return 'gRange-17-20';
        if (count >= 21 && count <= 24) return 'gRange-21-24';
      }

      if (effectiveType === 'group5-6') {
        if (count >= 1 && count <= 6) return 'gRange-1-6';
        if (count >= 7 && count <= 8) return 'gRange-7-8';
        if (count >= 9 && count <= 12) return 'gRange-9-12';
        if (count >= 13 && count <= 15) return 'gRange-13-15';
        if (count >= 16 && count <= 18) return 'gRange-16-18';
      }

      return '';
    },

    getDrawWrapStyle(memberCount: number) {
      const groupCount = this.seatSections.length

      if (this.layoutType === 'one-column' || this.layoutType === 'two-column') {
        // 최대 멤버 수 구하기 (이걸로 높이 등 조절 가능)
        const maxMemberCount = Math.max(
          ...this.seatSections.map(section => section.seats.filter(s => s.student).length)
        );

        return {
          height: 'calc(100% - 80px)'
        }
      }

      // group3-4 (4인 그룹 처리)
      if (this.layoutType === 'group3-4') {
        const maxMemberCount = Math.max(
          ...this.seatSections.map(section => section.seats.filter(s => s.student).length)
        );

        // 인원 수에 따라 줄 수 결정
        let rowCount = 1;
        if (maxMemberCount <= 2) rowCount = 1;
        else if (maxMemberCount <= 4) rowCount = 2;
        else rowCount = 3;

        // 그룹 수에 따라 gap 조절
        let gap = '10px';
        if (groupCount >= 13 && groupCount <= 24) {
          gap = '8px';
        }

        return {
          display: 'grid',
          gridTemplateRows: `repeat(${rowCount}, 1fr)`,
          gap,
          height: '100%',
        };
      }

      // group5-6 (6인 그룹 처리)
      if (this.layoutType === 'group5-6' && memberCount === 6) {
        let gap = '10px';
        if (groupCount >= 9 && groupCount <= 18) {
          gap = '8px';
        }
        return {
          display: 'grid',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap,
          height: '100%',
        };
      }

      return {};
    },

    getDrawAreaStyle(sectionIndex: number, seatIndex: number): {backgroundColor?: string, "--highlight-color"? : string, border?: string} {
      const seat = this.seatSections[sectionIndex]?.seats[seatIndex];

      // 학생이 없으면 배경색, 테두리 모두 없음
      if (!seat || !seat.student) {
        return {
          backgroundColor: 'transparent',
          border: 'none'
        };
      }

      if (!this.isDrawingMember && sectionIndex === this.selectedGroupIndex && this.selectedMemberIndex === seatIndex) {
        const border = this.finalBorderColor || this.drawAreaColors[seatIndex] || colorPool[seatIndex % colorPool.length];
        const background = this.drawAreaColors[seatIndex] || colorPool[seatIndex % colorPool.length];
        return {
          border: `4px solid ${border}`,
          backgroundColor: background
        };
      }

      if (!this.isDrawingGroup && sectionIndex === this.selectedGroupIndex) {
        const backgroundColor = this.drawAreaColors[seatIndex] || colorPool[seatIndex % colorPool.length];
        return {
          backgroundColor: backgroundColor,
          '--highlight-color': backgroundColor
        };
      }
      return {};
    },

    assignColorToStudent(studentId: string, index: number) {
      if (!(studentId in this.studentColors)) {
        const newColor = colorPool[index % colorPool.length];
        this.studentColors[studentId] = newColor;
      }
      return this.studentColors[studentId];
    },

    openGiveGroupPointModal() {
      if (this.selectedGroupIndex === null) {
        (this as any).$hiClass.alert('그룹을 뽑아주세요.');
        return;
      }
      this.patchPointGiveFinishModal({
        open: false,
        mode: 'null'
      });
      this.pickedStudents = this.selectedGroupStudents.filter(s => s).map(student => {
        return {
          ...student,
          studentCharacter: student?.character
        };
      });
      this.isGiveTotalPointModal = true;
    },

    openGiveStudentPointModal(student: SeatStudent) {
      this.patchPointGiveFinishModal({
        open: false,
        mode: 'null'
      });
      this.pickedStudents = [{...student, studentCharacter: student?.character}];
      this.isGiveTotalPointModal = true;
    },

    finishToastClose() {
      (this.pointGiveFinishModal as any).open = false;
      (this.pointGiveFinishModal as any).mode = null;
    },

    contentCardSizing() {
      const content = this.$refs.content as HTMLElement;
      if (!content || !this.seatPlanSections) return;
      const groupCount = this.seatSections.length;

      const width = content.clientWidth;
      const height = content.clientHeight;

      let baseWidth = 1800;
      let baseHeight = 840;

      const layout = this.effectiveLayoutType || this.layoutType;

      // 기본 기준 설정
      if (layout === 'group3-4') {
        if (groupCount <= 6) {
          baseWidth = 1600;
          baseHeight = 840;
        } else if (groupCount <= 9) {
          baseWidth = 1600;
          baseHeight = 840;
        } else if (groupCount <= 12) {
          baseWidth = 1860;
          baseHeight = 840;
        } else if (groupCount <= 16) {
          baseWidth = 1400;
          baseHeight = 840;
        } else if (groupCount <= 20) {
          baseWidth = 1700;
          baseHeight = 840;
        } else if (groupCount <= 24) {
          baseWidth = 1900;
          baseHeight = 840;
        } else {
          baseWidth = 2100;
          baseHeight = 840;
        }
      } else if (layout === 'group5-6') {
        if (groupCount <= 6) {
          baseWidth = 1600;
          baseHeight = 840;
        } else if (groupCount <= 8) {
          baseWidth = 1840;
          baseHeight = 840;
        } else if (groupCount <= 12) {
          baseWidth = 1500;
          baseHeight = 840;
        } else if (groupCount <= 15) {
          baseWidth = 1800;
          baseHeight = 840;
        } else if (groupCount <= 18) {
          baseWidth = 1980;
          baseHeight = 840;
        } else {
          baseWidth = 1980;
          baseHeight = 840;
        }
      } else if (layout === 'one-column') {
        if (groupCount === 1) {
          baseWidth = 300;
          baseHeight = 840;
        } else if (groupCount === 2) {
          baseWidth = 600;
          baseHeight = 840;
        } else if (groupCount === 3) {
          baseWidth = 900;
          baseHeight = 840;
        } else if (groupCount === 4) {
          baseWidth = 1300;
          baseHeight = 840;
        } else if (groupCount === 5) {
          baseWidth = 1500;
          baseHeight = 840;
        } else if (groupCount === 6) {
          baseWidth = 1800;
          baseHeight = 840;
        } else {
          baseWidth = 2000;
          baseHeight = 840;
        }
      }
      else if (layout === 'two-column') {
        if (groupCount === 4) {
          baseWidth = 1800;
          baseHeight = 840;
        } else if (groupCount === 3) {
          baseWidth = 1600;
          baseHeight = 840;
        } else if (groupCount === 2) {
          baseWidth = 1000;
          baseHeight = 840;
        } else {
          baseWidth = 500;
          baseHeight = 840;
        }
      }

      let zoom;
      if ((width / baseWidth) >= (height / baseHeight)) {
        zoom = height / baseHeight;
      } else {
        zoom = width / baseWidth;
      }
      this.zoom = Math.min(zoom, 1);
    },
    updateScale() {
      const width = window.innerWidth;

      // 아이패드일 경우 스케일 적용 안 함
      if (this.isiPad()) {
        this.scale = 0.9;
        return;
      }
      // 원하는 스케일 범위 및 조건 작성
      if (width <= 640) {
        this.scale = 0.4;
      } else if (width <= 1600) {
        this.scale = 0.6;
      } else {
        this.scale = 1;
      }
    },
    isiPad() {
      return (
        /iPad/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      );
    }
  }
});

</script>

<style lang="css">
.toasted-container.top-center .random-draw-toast {
  left: 0;
}
.toasted-container.top-center {
  top: 88px;
}
.toasted-container .toasted.type01 {
  width: 589px;
  min-height: 69px;
}
</style>

<style lang="css" scoped>
.swal2-html-container {  
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  line-height: 27px;
}
.swal2-custom-class.swal2-popup .swal2-actions button {
  width: 140px;
  height: 44px;
  border-radius: 40px;
  margin: 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: #EE813E;
  border-color: #EE813E;
}

.swal2-custom-class.swal2-popup .swal2-actions button:hover,
.swal2-custom-class.swal2-popup .swal2-actions button:active {
    background: #ea6615;
    border-color: #ea6615;
    -webkit-transition: all 0.3s ease;
    transition: all 0.3s ease;
}

</style>

<style lang="scss" scoped>
.button-wrap {
  position: absolute;
  display: flex;
  gap: 10px;
  top: 25px;
  left: 150px;
}

@keyframes border-rainbow {
  0% {
    border-color: #4ECB71;
  }
  14% {
    border-color: #6369F1;
  }
  28% {
    border-color: #B75BEF;
  }
  42% {
    border-color: #FCCB32;
  }
  57% {
    border-color: #FF766D;
  }
  71% {
    border-color: #FF8737;
  }
  85% {
    border-color: #3AAFFF;
  }
  100% {
    border-color: #66A3FF;
  }
}

.draw-area {
  box-sizing: border-box;
  border: 4px solid transparent;
  border-radius: 12px;
  transition: opacity 0.3s ease, border-color 0.3s ease;
}

.draw-area.flashing {
  animation: border-rainbow 0.8s infinite;
}

.draw-area.dimmed {
  opacity: 0.32;
}

@media screen and (max-width: 1340px) {
  ::v-deep .btns .hi-btn {
    min-width: 120px !important;
  }
}

.group-draw {
  position: relative;
  width: 100%;
  height: 100%;
  margin: auto;
  background: var(--gray-10);

  .container {
    height: 100%;
    position: relative;

    .header {
      height: 78px;
      padding: 25px 30px 17px 30px;

      .title {
        font-size: 24px;
        font-family: 'NanumSquareRound';
        font-weight: bold;
        color: var(--white);
      }
    }

    .content-wrap {
      height: calc(100% - 78px);
      .confetti1,
      .confetti2,
      .confetti3 {
        position: absolute;
        z-index: 999;
        width: 33% !important;
        pointer-events: none;
      }

      .confetti1 {
        top: 0;
        left: 0;
      }

      .confetti2 {
        top: 0;
        left: 33%;
      }

      .confetti3 {
        top: 0;
        right: 0;
      }
      ::-webkit-scrollbar {
        background-color: transparent;
        width: 10px;
        height: 10px;
      }

      ::-webkit-scrollbar-thumb {
        background-color: #666;
        background-clip: padding-box;
        min-height: 40px;
        border: 2px solid transparent;
        border-radius: 10px;
        box-sizing: border-box;
      }

      ::-webkit-scrollbar-track {
        background-color: transparent;
      }

      .content {
        height: calc(100% - 78px);
        .plan-type {
          height: calc(100% - 30px);
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
          &.full-height {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          &-inner {
            display: flex;
            flex-direction: column;
            align-items: center;            
            box-sizing: border-box;
            width: 100%;
            // min-height: 800px;
          }

          &.rotate {
            .plan-type-inner {
              transform: rotate(180deg);
              height: fit-content;
            }
            .list-title {
              justify-content: flex-end;
            }
            .blackboard > span,
            .draw-area,
            .list-title > span {
              transform: rotate(180deg);

            }
          }
          &.group-max {
            justify-content: flex-start;
            overflow-y: auto;
          }

          .blackboard {
            width: 426px;
            min-height: 40px;
            background: #0D7631;
            color: var(--white);
            border-radius: 6px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: default;
          }

          .division {
            position: relative;

            .overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 10000;
              transition: background-color 0.3s ease;
            }

            > *:not(.overlay) {
              position: relative;
              z-index: 1;
            }

            &-list {
              position: relative;
              // border: 4px solid var(--gray-09);
              // border-radius: 24px;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-sizing: border-box;

              &.dimmed {
                opacity: 0.32;
              }

              > * {
                position: relative;
                z-index: 2;
              }

              // &.highlight-step-0::after {
              //   background-color: rgba(102, 163, 255, .24);
              //   border-color: #66A3FF;
              // }

              // &.highlight-step-1::after {
              //   background-color: rgba(255, 118, 109, .24);
              //   border-color: #FF766D;
              // }

              .list-title {
                position: relative;
                border: 4px solid var(--gray-09);
                border-bottom: 0;
                background: #373737;
                border-radius: 24px 24px 0 0;
                height: 80px;
                font-size: 24px;
                color: var(--white);
                padding: 22px 24px;
                display: flex;
                align-items: center;
                z-index: auto;
                overflow: hidden;

                &.highlight-step-0 {
                  border-color: #66A3FF;

                  &::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: rgba(102, 163, 255, .24);
                    pointer-events: none;
                    z-index: 1;
                  }
                }

                &.highlight-step-1 {
                  border-color: #FF766D;

                  &::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: rgba(255, 118, 109, .24);
                    pointer-events: none;
                    z-index: 1;
                  }
                }
                span {
                  display: block;
                  overflow: hidden;
                  word-break: break-word;
                  white-space: normal;
                  line-height: 1.2em;
                  max-height: 2.4em;
                }
              }

              .draw-wrap {
                position: relative;
                padding: 20px;
                display: grid;
                height: 100%;
                flex-grow: 1;
                gap: 10px;
                align-content: flex-start;
                border-radius: 0 0 24px 24px;
                border: 4px solid var(--gray-09);
                border-top: 0;

                &.highlight-step-0 {
                  background-color: rgba(102, 163, 255, .24);
                  border-color: #66A3FF;
                }

                &.highlight-step-1 {
                  background-color: rgba(255, 118, 109, .24);
                  border-color: #FF766D;
                }

                &.draw-type-1 {
                  grid-template-columns: 1fr;
                }

                &.draw-type-2 {
                  grid-template-columns: repeat(2, 1fr);
                }

                &.group3-4 {
                  grid-template-columns: repeat(2, 1fr);
                  grid-template-rows: repeat(2, 1fr);
                }

                &.group5-6 {
                  grid-template-columns: repeat(2, 1fr);
                  grid-template-rows: repeat(3, 1fr);
                }

                &.event-height {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  gap: 10px;
                }
              }

              .draw-area {
                position: relative;
                height: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 6px 12px;
                overflow: hidden;
                z-index: auto;
                box-sizing: border-box;
                &.has-student {
                  background-color: var(--gray-09);
                  border-radius: 12px;
                }
                .profile {
                  display: flex;
                  justify-content: center;
                  align-items: flex-end;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  overflow: hidden;
                  margin-right: 6px;
                  flex-shrink: 0;    
                  .profile-img {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    height: 0;
                    padding-top: 100%;
                    text-align: center;
                    background-color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;                    
                    user-drag: none; /* Safari 전용 */
                    -webkit-user-drag: none; /* Chrome, Safari */
                    -khtml-user-drag: none; /* 오래된 Konqueror */
                    -moz-user-drag: none; /* Firefox */
                    -o-user-drag: none; /* Opera */
                    user-select: none; /* 텍스트 선택도 막기 (선택사항) */
                    img {
                      width: 80%;
                      height: auto;
                      user-select: none;
                      pointer-events: none;
                    }
                  }
                  .profile-photo {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    aspect-ratio: 1 / 1;
                    overflow: hidden;
                    display: flex;
                    background-color: #fff;
                    justify-content: center;
                    align-items: flex-end;
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-drag: none;
                    img {
                      width: auto;
                      height: 100%;
                      object-fit: cover;
                      display: block;
                      user-select: none;
                      pointer-events: none;
                      image-rendering: auto;
                    }
                    &.is-height {
                      img {
                        width: 100%;
                        height: 100%;
                      }
                    }
                    &:not(.is-height) {
                      width: auto;
                      height: 100%;
                    }
                  }
                }
              }

              .text-area {
                display: flex;
                flex-direction: column;
                width: 100%;
                .num {
                  font-size: 18px;
                  font-weight: 900;
                  color: var(--gray-07);
                  font-family: 'NanumSquareRound';
                }

                .name {
                  font-size: 28px;
                  font-weight: 400;
                  color: var(--white);
                  overflow: hidden;
                  word-break: break-all;
                  height: 28px;
                  line-height: 28px;
                }
              }

              &.selected {
                .list-title {
                  color: var(--gray-10);
                  background: var(--white);
                  border-color: var(--white);
                }

                .draw-wrap {
                  border-color: var(--white);
                }

                .text-area {
                  .num {
                    color: var(--white);
                  }
                }
              }
            }

            /* === one 타입 === */
            .division-list {
              &.one-column {
                &.gCount-6 {
                  .draw-wrap {
                    .draw-area {
                      height: 64px;
                    }
                  }
                }
              }
            }

            /* === group3-4 타입 === */
            .group3-4 {
              &.gRange-1-6 {
                &.division-list {
                  width: 418px;
                  // min-height: 322px;

                  .list-title {
                    font-size: 24px;
                    height: 80px;
                  }

                  .draw-wrap {
                    padding: 20px 16px;

                    .draw-area {
                      border-radius: 12px;
                      height: 92px;
                    }

                    .text-area {
                      .num {
                        font-size: 20px;
                      }

                      .name {
                        font-size: 30px;
                        line-height: 30px;
                        height: 30px;
                      }
                    }
                  }
                }
              }

              &.gRange-7-9 {
                &.division-list {
                  width: 418px;
                  // min-height: 268px;

                  .list-title {
                    font-size: 22px;
                    height: 60px;
                  }

                  .draw-wrap {
                    padding: 16px 14px;

                    .draw-area {
                      border-radius: 12px;
                      height: 64px;
                    }

                    .text-area {
                      .num {
                        font-size: 19px;
                      }

                      .name {
                        font-size: 24px;
                        line-height: 24px;
                        height: 24px;
                      }
                    }
                  }
                }
              }

              &.gRange-10-12 {
                &.division-list {
                  width: 418px;
                  // min-height: 268px;

                  .list-title {
                    font-size: 22px;
                    height: 60px;
                  }

                  .draw-wrap {
                    padding: 16px 14px;

                    .draw-area {
                      border-radius: 12px;
                      height: 64px;
                    }

                    .text-area {
                      .num {
                        font-size: 20px;
                      }

                      .name {
                        font-size: 24px;
                        line-height: 24px;
                        height: 24px;
                      }
                    }
                  }
                }
              }

              &.gRange-13-16 {
                &.division-list {
                  width: 310px;
                  // min-height: 200px;

                  .list-title {
                    font-size: 18px;
                    height: 46px;
                  }

                  .draw-wrap {
                    padding: 12px 10px;

                    .draw-area {
                      border-radius: 8px;
                      height: 44px;
                      .profile {
                        width: 30px;
                        height: 30px;
                      }
                    }

                    .text-area {
                      .num {
                        font-size: 14px;
                      }

                      .name {
                        height: 16px;
                        line-height: 16px;
                        font-size: 16px;
                      }
                    }
                  }
                }
              }

              &.gRange-17-20 {
                &.division-list {
                  width: 310px;
                  // min-height: 200px;
                  .list-title {
                    font-size: 18px;
                    height: 48px;
                  }

                  .draw-wrap {
                    padding: 12px 10px;
                    height: calc(100% - 52px);

                    .draw-area {
                      border-radius: 8px;
                      height: 44px;

                      .profile {
                        width: 30px;
                        height: 30px;
                      }
                    }

                    .text-area {
                      .num {
                        font-size: 14px;
                      }

                      .name {
                        font-size: 18px;
                        line-height: 18px;
                        height: 18px;
                      }
                    }
                  }
                }
              }

              &.gRange-21-24 {
                &.division-list {
                  width: 290px;
                  // min-height: 170px;

                  .list-title {
                    font-size: 16px;
                    height: 40px;
                  }

                  .draw-wrap {
                    padding: 10px 8px;

                    .draw-area {
                      border-radius: 8px;
                      height: 42px;

                      .profile {
                        width: 28px;
                        height: 28px;
                      }
                    }

                    .text-area {
                      .num {
                        font-size: 13px;
                      }

                      .name {
                        font-size: 18px;
                        line-height: 18px;
                        height: 18px;
                      }
                    }
                  }
                }
              }
              @for $i from 25 through 100 {
                &.gCount-#{$i} {
                  &.division-list {
                    width: 290px;
                    // min-height: 170px;

                    .list-title {
                      font-size: 16px;
                      height: 40px;
                    }

                    .draw-wrap {
                      padding: 11px 8px;

                      .draw-area {
                        border-radius: 8px;
                        height: 42px;

                        .profile {
                          width: 28px;
                          height: 28px;
                        }
                      }

                      .text-area {
                        .num {
                          font-size: 13px;
                        }

                        .name {
                          font-size: 18px;
                          line-height: 18px;
                          height: 18px;
                        }
                      }
                    }
                  }
                }
              }
            }

            /* === group5-6 타입 === */
            .group5-6 {
              &.gRange-1-6 {
                &.division-list {
                  width: 418px;
                  // min-height: 348px;

                  .list-title {
                    font-size: 24px;
                    height: 64px;
                  }

                  .draw-wrap {
                    padding: 16px 14px;

                    .draw-area {
                      border-radius: 12px;
                      height: 66px;
                    }

                    .text-area {
                      .num {
                        font-size: 18px;
                      }

                      .name {
                        font-size: 24px;
                        line-height: 24px;
                        height: 24px;
                      }
                    }
                  }
                }
              }

              &.gRange-7-8 {
                &.division-list {
                  width: 418px;
                  // min-height: 348px;

                  .list-title {
                    font-size: 24px;
                    height: 64px;
                  }

                  .draw-wrap {
                    padding: 16px 14px;

                    .draw-area {
                      border-radius: 12px;
                      height: 66px;
                    }

                    .text-area {
                      .num {
                        font-size: 20px;
                      }

                      .name {
                        font-size: 28px;
                        line-height: 28px;
                        height: 28px;
                      }
                    }
                  }
                }
              }

              &.gRange-9-12 {
                &.division-list {
                  width: 310px;
                  // min-height: 260px;
                  .list-title {
                    font-size: 18px;
                    height: 42px;
                  }

                  .draw-wrap {
                    padding: 12px 10px;

                    .draw-area {
                      border-radius: 8px;
                      height: 46px;

                      .profile {
                        width: 30px;
                        height: 30px;
                      }
                    }

                    .text-area {
                      .num {
                        font-size: 13px;
                      }

                      .name {
                        font-size: 18px;
                        line-height: 18px;
                        height: 18px;
                      }
                    }
                  }
                }
              }

              &.gRange-13-15 {
                &.division-list {
                  width: 310px;
                  // min-height: 260px;

                  .list-title {
                    font-size: 18px;
                    height: 46px;
                  }

                  .draw-wrap {
                    padding: 12px 8px;

                    .draw-area {
                      border-radius: 8px;
                      height: 44px;

                      .profile {
                        width: 30px;
                        height: 30px;
                      }
                    }

                    .text-area {
                      .num {
                        font-size: 14px;
                      }

                      .name {
                        font-size: 20px;
                        line-height: 20px;
                        height: 20px;
                      }
                    }
                  }
                }
              }

              &.gRange-16-18 {
                &.division-list {
                  width: 290px;
                  // min-height: 224px;

                  .list-title {
                    font-size: 16px;
                    height: 46px;
                  }

                  .draw-wrap {
                    padding: 12px 8px;

                    .draw-area {
                      height: 44px;
                      border-radius: 8px;

                      .profile {
                        width: 28px;
                        height: 28px;
                      }
                    }

                    .text-area {
                      .num {
                        font-size: 13px;
                      }

                      .name {
                        font-size: 18px;
                        line-height: 18px;
                        height: 18px;
                      }
                    }
                  }
                }
              }
              @for $i from 19 through 100 {
                &.gCount-#{$i} {
                  &.division-list {
                    width: 290px;
                    // min-height: 224px;

                    .list-title {
                      font-size: 16px;
                      height: 46px;
                    }

                    .draw-wrap {
                      padding: 12px 8px;

                      .draw-area {
                        border-radius: 8px;
                        height: 44px;

                        .profile {
                          width: 28px;
                          height: 28px;
                        }
                      }

                      .text-area {
                        .num {
                          font-size: 13px;
                        }

                        .name {
                          font-size: 18px;
                          height: 18px;
                          line-height: 18px;
                        }
                      }
                    }
                  }
                }
              }
            }

            &.layout-one-column {
              height: auto;

              &.zoom-full {
                // height: calc(100% - 62px);
              }

              .list-title {
                font-size: 24px;
                height: 78px;
              }

              .draw-wrap {
                padding: 16px;

                .draw-area {
                  border-radius: 8px;
                  height: 64px;
                }
              }
              .division-list {
                width: 224px;
              }
            }

            &.layout-two-column {
              height: auto;
              &.zoom-full {
                // height: calc(100% - 80px);
                .draw-area {
                  height: 72px;
                }
              }
              .list-title {
                font-size: 24px;
                height: 78px;
              }
              .division-list {
                width: 418px;

                .draw-area {
                  height: 72px;
                }
              }
            }
            &.layout-group3-4 {
              .division-list {
                width: 418px;
              }
              &.has-large-group {
                .gRange-1-6 {
                  .list-title {
                    height: 70px;
                  }
                  .draw-wrap {
                    padding: 18px 16px;
                    .draw-area {
                      height: 62px;
                    }
                  }
                }

              }
            }

            &.layout-group5-6 {
              .division {
                height: calc(100% - 78px);
              }

              .division-list {
                width: 418px;
              }
            }
          }
        }
      }
    }

    .draw-footer {
      width: 100%;
      min-height: 78px;
      padding: 0 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--gray-09);

      .sound-toggle {
        label {
          display: flex;
          align-items: center;
          font-size: 18px;
          font-weight: 400;
          color: var(--gray-07);

          input[type='checkbox'] {
            margin-right: 8px;
          }
        }
      }

      .btns {
        .hi-btn {
          font-size: 16px;
          min-width: 200px;
          min-height: 50px;

          &.btn-orange {
            &[disabled] {
              background: #EE813E !important;
              border-color: #EE813E !important;
              opacity: 0.4;
              cursor: not-allowed;
            }
          }

          &.btn-info {
            &[disabled] {
              background: var(--primary) !important;
              border-color: var(--primary) !important;
              opacity: 0.4;
              cursor: not-allowed;
            }
          }

          &.btn-line-orange {
            &[disabled] {
              color: #EE813E !important;
              background: var(--gray-10) !important;
              border-color: #EE813E !important;
              opacity: 0.4;
              cursor: not-allowed;
            }
          }
        }

        .btn-line-orange {
          background: var(--gray-10);
        }

        .ml8 {
          margin-left: 8px;
        }
      }
    }

    .overlay-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, .82);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99;
    }
    // @media (max-width: 1600px) {
    //   .popup-content-wrap {
    //     transform: scale(0.6);
    //   }
    // }
    // @media (max-width: 640px) {
    //   .popup-content-wrap {
    //     transform: scale(0.4);
    //   }
    // }
    .popup-content {
      .confetti1,
      .confetti2,
      .confetti3 {
        position: absolute;
        z-index: 999;
        width: 33% !important;
        pointer-events: none;
      }

      .confetti1 {
        top: 0;
        left: 0;
      }

      .confetti2 {
        top: 0;
        left: 33%;
      }

      .confetti3 {
        top: 0;
        right: 0;
      }

      .btn-with-thumb {
        position: relative;
        z-index: 98;
        width: 440px;
        text-align: center;
        .img-area {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          height: 0;
          padding-top: 100%;
          text-align: center;
          background-color: #666;
          border-radius: 50%;
          // box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          user-drag: none; /* Safari 전용 */
          -webkit-user-drag: none; /* Chrome, Safari */
          -khtml-user-drag: none; /* 오래된 Konqueror */
          -moz-user-drag: none; /* Firefox */
          -o-user-drag: none; /* Opera */
          user-select: none; /* 텍스트 선택도 막기 (선택사항) */
          img {
            width: 80%;
            height: auto;
            user-select: none;
            pointer-events: none;
          }

          .txt-area {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            .num {
              font-size: 64px;
              font-weight: 600;
              font-family: 'NanumSquareRound';
              color: #fff;
              line-height: 1.2;
            }

            .name {
              width: 84%;
              font-size: 80px;
              font-weight: 500;
              color: #fff;
              white-space: nowrap;
              overflow: hidden;
              display: block;
              line-height: 1.2;
              text-align: center;
              margin: 0 auto;
            }
          }
          &.profile-photo {
            width: 100%;
            height: 100%;
            padding-top: 0;
            overflow: hidden;
            display: flex;
            justify-content: center;
            img {
              width: 100%; 
              height: 100%;
              max-height: 100%;
              object-fit: cover;
              display: block;
              user-select: none;
              pointer-events: none;
            }
          }
        }

        .btn-text {
          display: flex;
          flex-flow: row;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          gap: 4px;
          margin-top: 32px;
          .num {
            font-size: 64px;
            font-weight: 700;
            line-height: 64px;
            color: var(--gray-07);
            font-family: 'NanumSquareRound';
          }

          .name {
            font-size: 80px;
            font-weight: 500;
            line-height: 80px;
            color: var(--white);
          }
        }
      }

      .last-btn {
        position: relative;
        z-index: 100;
      }
      .hi-btn {
        display: block;
        margin-top: 40px;
        width: 440px;
        min-height: 66px;
        font-size: 20px;

        + .hi-btn {
          margin-top: 12px;
        }

        &.btn-line-gray {
          color: var(--white);
          background: transparent;

          &:hover {
            border-color: var(--gray-09);
            background: var(--gray-09);
          }
        }
      }
    }
  }

  .btn-close {
    position: absolute;
    top: 22px;
    right: 20px;
    width: 42px;
    height: 42px;
    z-index: 999;
  }
}

.ios {
  .group-draw {
    .container {
      .content-wrap {
        .content {
          .plan-type {
            &.group-max {
              .plan-type-inner {
                height: 100vh;
              }
            }
            .division {
              &.layout-one-column {
                .list-title {
                  font-size: 14px;
                }
                .draw-area {
                  .text-area {
                    .num {
                      font-size: 12px;
                    }
                    .name {
                      font-size: 14px;
                    }
                  }
                }
              }

              &.layout-two-column {
                .list-title {
                  font-size: 14px;
                }
                .draw-area {
                  padding: 4px;
                  .profile {
                    width: 38px;
                    height: 38px;
                  }
                  .text-area {
                    .num {
                      font-size: 12px;
                    }
                    .name {
                      font-size: 14px;
                    }
                  }
                }
              }
            }
            .division {
              .group3-4 {
                &.gRange-1-6 {
                  &.division-list {
                    .list-title {
                      font-size: 15px;
                    }

                    .draw-wrap {
                      .draw-area {
                        padding: 8px;
                      }
                      .text-area {
                        .num {
                          font-size: 14px;
                        }

                        .name {
                          font-size: 16px;
                        }
                      }
                    }
                  }
                }

                &.gRange-7-9 {
                  &.division-list {
                    .list-title {
                      font-size: 15px;
                    }

                    .draw-wrap {
                      .draw-area {
                        padding: 4px 8px;
                      }
                      .text-area {
                        .num {
                          font-size: 14px;
                        }

                        .name {
                          font-size: 16px;
                        }
                      }
                    }
                  }
                }

                &.gRange-10-12 {
                  &.division-list {
                    .list-title {
                      font-size: 15px;
                    }
                    .draw-wrap {
                      .draw-area {
                        padding: 4px 8px;
                      }
                      .text-area {
                        .num {
                          font-size: 14px;
                        }

                        .name {
                          font-size: 16px;
                        }
                      }
                    }
                  }
                }

                &.gRange-13-16 {
                  &.division-list {
                    .list-title {
                      font-size: 12px;
                    }

                    .draw-wrap {
                      .text-area {
                        .num {
                          font-size: 10px;
                        }

                        .name {
                          font-size: 12px;
                        }
                      }
                    }
                  }
                }

                &.gRange-17-20 {
                  &.division-list {
                    .list-title {
                      font-size: 12px;
                    }

                    .draw-wrap {
                      .text-area {
                        .num {
                          font-size: 10px;
                        }

                        .name {
                          font-size: 12px;
                        }
                      }
                    }
                  }
                }

                &.gRange-21-24 {
                  &.division-list {
                    .list-title {
                      font-size: 12px;
                    }
                    .draw-wrap {
                      .draw-area {
                        height: 50px;
                      }
                      .text-area {
                        .num {
                          font-size: 9px;
                        }
                        .name {
                          font-size: 12px;
                        }
                      }
                    }
                  }
                }
                @for $i from 25 through 50 {
                  &.gCount-#{$i} {
                    &.division-list {
                      .list-title {
                        font-size: 12px;
                      }
                      .draw-wrap {
                        .draw-area {
                          height: 50px;
                        }
                        .text-area {
                          .num {
                            font-size: 9px;
                          }
                          .name {
                            font-size: 12px;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            .division {
              .group5-6 {
                &.gRange-1-6 {
                  &.division-list {
                    .list-title {
                      font-size: 14px;
                    }

                    .draw-wrap {
                      .text-area {
                        .num {
                          font-size: 13px;
                        }

                        .name {
                          font-size: 16px;
                        }
                      }
                    }
                  }
                }

                &.gRange-7-8 {
                  &.division-list {
                    .list-title {
                      font-size: 14px;
                    }

                    .draw-wrap {
                      .text-area {
                        .num {
                          font-size: 13px;
                        }

                        .name {
                          font-size: 16px;
                        }
                      }
                    }
                  }
                }

                &.gRange-9-12 {
                  &.division-list {
                    .list-title {
                      font-size: 12px;
                    }

                    .draw-wrap {
                      .draw-area {
                        height: 48px;
                      }

                      .text-area {
                        .num {
                          font-size: 10px;
                        }

                        .name {
                          font-size: 12px;
                        }
                      }
                    }
                  }
                }

                &.gRange-13-15 {
                  &.division-list {
                    .list-title {
                      font-size: 14px;
                    }

                    .draw-wrap {
                      .draw-area {
                        height: 56px;
                        padding: 2px 8px;
                      }

                      .text-area {
                        .num {
                          font-size: 9px;
                        }

                        .name {
                          font-size: 11px;
                        }
                      }
                    }
                  }
                }

                &.gRange-16-18 {
                  &.division-list {
                    .list-title {
                      height: 50px;
                      font-size: 12px;
                    }

                    .draw-wrap {
                      .draw-area {
                        height: 56px;
                        padding: 2px 8px;
                      }

                      .text-area {
                        .num {
                          font-size: 9px;
                        }

                        .name {
                          font-size: 11px;
                        }
                      }
                    }
                  }
                }

                @for $i from 19 through 50 {
                  &.gCount-#{$i} {
                    &.division-list {
                      .list-title {
                        height: 48px;
                        font-size: 11px;
                      }
                      .draw-wrap {
                        .draw-area {
                          height: 56px;
                          padding: 4px 8px;
                        }

                        .text-area {
                          .num {
                            font-size: 9px;
                          }
                          .name {
                            font-size: 10px;
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
      .popup-content {
        .btn-with-thumb {
          width: 240px;
          .img-area {
            height: 240px;
            .num {
              font-size: 44px;
            }
            .name {
              font-size: 60px;
            }
          }
          .btn-text {
            margin-top: 20px;
            .num {
              font-size: 44px;
            }

            .name {
              font-size: 60px;
            }
          }
        }

        .hi-btn {
          width: 240px;
          font-size: 18px;
          min-height: 42px;
          margin-top: 10px;

          + .hi-btn {
            margin-top: 14px;
          }
        }
      }
      .content-wrap {
        .content {
          .plan-type {
            .division-list {
              .draw-area {
                .profile {
                  width: 38px;
                  height: 38px;
                  border-radius: 50%;
                  .profile-photo {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    aspect-ratio: 1 / 1;
                    overflow: hidden;
                    display: flex;
                    background-color: #fff;
                    justify-content: center;
                    align-items: flex-end;
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-drag: none;
                    img {
                      width: auto;
                      height: 100%;
                      object-fit: cover;
                      display: block;
                      user-select: none;
                      pointer-events: none;
                      image-rendering: auto;
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
</style>
