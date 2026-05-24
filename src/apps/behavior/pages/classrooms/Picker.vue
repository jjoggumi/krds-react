<template>
  <div class="random-draw-wrap behavior-container">
    <div class="container">
      <!-- 사이드 -->
      <div class="sidebar">
        <div class="side-box-wrap">
          <div class="side-box">
            <h2>
              학생 랜덤 뽑기
              <p class="smr">학생을 랜덤으로 추첨해보세요.</p>
            </h2>
            <h3>
              <span
                >뽑기 대상
                <HiTooltip
                  ico="info"
                  position="top"
                  class="hi-tooltip-wrap"
                  :title-html="`아직 뽑히지 않은 학생 수 / 전체 학생 수`"
                />
              </span>
              <HiButton size="xs" class="btn-excep" @click="isOpenExcepList = true">
                <HiIcon name="ico-user3" size="14" />
                뽑기 제외<span class="count">{{ absenteeStudentCount }}</span>
              </HiButton>
            </h3>
            <div class="info">
              <strong class="txt-orange">{{ targetStdCount }}명</strong> /{{ filteredTotalStudentCount }}명
            </div>
            <h3>
              대상 선택
              <HiButton size="xs" @click="!disabledAllClick && onClickGoToStudentList()">
                <HiIcon name="ico-setting" size="14" />
                성별 등록
              </HiButton>
            </h3>
            <div class="radio-group">
              <input type="radio" value="dummy" />
              <!-- 테블릿 대응 : 아이패드에서 라디오 흔들리는 문제 임의 대응 -->
              <input
                type="radio"
                v-model="gender"
                :disabled="disabledAllClick"
                @change="mode = 'filterAll'"
                value="ALL"
                id="ALL"
              />
              <label for="ALL"><span>전체</span></label>

              <input
                type="radio"
                v-model="gender"
                :disabled="disabledAllClick"
                @change="() => onClickGenderFilter('filterFemale')"
                value="FEMALE"
                id="FEMALE"
              />
              <label for="FEMALE"><span>여자</span></label>

              <input
                type="radio"
                v-model="gender"
                :disabled="disabledAllClick"
                @change="() => onClickGenderFilter('filterMale')"
                value="MALE"
                id="MALE"
              />
              <label for="MALE"><span>남자</span></label>
            </div>
            <h3>뽑기 인원</h3>
            <div class="draw-count-wrap">
              <div class="draw-count">
                <HiButton
                  :color="targetNum === n ? 'orange' : 'gray'"
                  v-for="n in 9"
                  :key="n"
                  @click="!disabledAllClick && (targetNum = n)"
                  :class="{ active: targetNum === n }"
                  :disabled="n > filteredStd.length"
                >
                  {{ n }}명
                </HiButton>
              </div>
              <HiButton
                size="lg"
                color="orange"
                block
                bitrounded
                :disabled="isDisbalePick"
                @click="!disabledAllClick && onClickDrawRandom()"
                class="btn-draw"
                >뽑기 시작</HiButton
              >
              <HiButton
                size="lg"
                color="line-orange"
                block
                bitrounded
                @click="!disabledAllClick && resetDraw()"
                class="btn-refresh"
              >
                뽑기 초기화
              </HiButton>
            </div>
          </div>
          <div class="side-box">
            <h2>
              학생 섞기
              <p class="smr">학생을 한명씩 뒤집어 확인하세요.</p>
            </h2>
            <HiButton
              size="lg"
              color="yellow"
              block
              bitrounded
              :disabled="isDisbalePick"
              @click="!disabledAllClick && onClickShuffleStd()"
              class="btn-shuffle"
              >섞기 시작</HiButton
            >
          </div>
        </div>
      </div>
      <!-- 컨텐츠 -->
      <div class="content-wrap">
        <div class="content" ref="content">
          <lottie
            :options="confetti"
            class="confetti1"
            v-if="mode === 'draw-pick'"
            @animCreated="confetti1Created"
          />
          <lottie
            :options="confetti"
            class="confetti2"
            v-if="mode === 'draw-pick'"
            @animCreated="confetti1Created"
          />
          <lottie
            :options="confetti"
            class="confetti3"
            v-if="mode === 'draw-pick'"
            @animCreated="confetti1Created"
          />
          <transition-group
            tag="div"
            name="trans"
            class="student-list"
            :class="[
              mode,
              mode === 'draw-pick' ? 'selected-' + selectedIds.length : '',
              headCount,
            ]"
            :style="{ zoom: zoom }"
            :key="mode"
          >
            <template v-for="(student, index) in filteredStd">
              <div
                :key="student.studentId"
                class="student"
                v-if="mode !== 'draw-pick' || selectedIds.includes(index)"
                :class="{
                  selected:
                    (mode === 'draw' || mode === 'shuffle-pick') &&
                    selectedIds.includes(index),
                  focused: mode === 'draw' && index === focusedId,
                }"
                :style="[
                  mode === 'set' ? { 'transition-delay': index * 0.1 + 's' } : null,
                ]"
                @click="!disabledAllClick && toggleFlip(index)"
              >
                <div
                  class="img-area"
                  :style="[
                    mode === 'draw' && selectedIds.includes(index)
                      ? {
                          'box-shadow':
                            '0 0 0 5px ' +
                            (detailClass.studentViewType === 'CHARACTER'
                              ? student.backgroundColor
                              : darkenColor(student.backgroundColor, 0.2)),
                        }
                      : null,
                  ]"
                >
                  <student-photo
                    v-if="detailClass.studentViewType === 'CHARACTER'"
                    :student="student"
                    :cursorPointer="false"
                  />
                  <div
                    v-else
                    class="txt-area"
                    :style="{ 'background-color': student.backgroundColor }"
                  >
                    <span class="num">{{ student.studentNo }}</span>
                    <span class="name">{{ student.studentName }}</span>
                  </div>
                </div>
                <p class="txt-area" v-if="detailClass.studentViewType === 'CHARACTER'">
                  <span class="num">{{ student.studentNo }}</span>
                  <span class="name">{{ student.studentName }}</span>
                </p>
              </div>
            </template>
          </transition-group>
        </div>
      </div>
    </div>
    <!-- 하단 -->
    <div class="footer">
      <div class="sound-toggle">
        <label :class="{ on: soundEffect }">
          <input type="checkbox" v-model="soundEffect" />
          <HiIcon
            :name="soundEffect ? 'ico-sound' : 'ico-sound-off'"
            color="gray"
            size="32"
          />
          효과음 {{ soundEffect ? "ON" : "OFF" }}
        </label>
      </div>
      <div class="btns">
        <div>
          <HiButton
            size="xl"
            color="gray"
            class="mr-10"
            @click="closeAllCards"
            v-if="mode === 'shuffle-pick'"
          >
            모두 닫기
          </HiButton>
          <HiButton
            size="xl"
            color="yellow"
            @click="openAllCards"
            v-if="mode === 'shuffle-pick'"
          >
            모두 열기
          </HiButton>
        </div>
        <div>
          <HiButton
            size="xl"
            color="gray"
            class="mr-10"
            @click="setMode('in')"
            v-if="
              mode === 'draw-pick' || (mode === 'shuffle-pick' && selectedIds.length > 0)
            "
          >
            처음으로 가기
          </HiButton>
          <HiButton
            size="xl"
            color="primary"
            @click="openGiveTotalPointModal()"
            v-if="
              mode === 'draw-pick' || (mode === 'shuffle-pick' && selectedIds.length > 0)
            "
          >
            포인트 지급
          </HiButton>
        </div>
      </div>
    </div>
    <HiButton class="btn-close" color="link" @click="onClickClose">
      <HiIcon name="ico-close" color="white" size="36" />닫기
    </HiButton>
    <give-total-point-modal
      v-if="isGiveTotalPointModal === true"
      :mode="'good'"
      :studentList="[pickedStudents]"
      @close="isGiveTotalPointModal = false"
      @closeSubmit="isGiveTotalPointModal = false"
    />
    <audio id="audioContainer" ref="givePointSound">
      <source id="audioSource" ref="givePointSoundSource" src="" />
    </audio>
    <!-- 뽑기 제외 명단 팝업 -->
    <HiModal
      v-if="isOpenExcepList"
      type="type01"
      :modalLayerStyle="{ 'max-width': '840px', width: '100%' }"
      @close="isOpenExcepList = false"
      class="student-excep-list"
    >
      <template v-slot:heading>
        뽑기 제외 명단
        <p class="desc">뽑기에서 제외할 학생을 선택하세요.</p>
      </template>
      <template v-slot:content>
        <div class="student-wrap">
          <div class="btns">
            <button class="btn-select-all" @click="unselectAll">
              <HiIcon
                name="ico-check"
                size="24"
                :color="hasAbsenteeStudents ? 'noti' : 'disabled'"
              />
              <span :class="{ active: hasAbsenteeStudents }">모두 해제</span>
            </button>
            <div class="input-search-wrap">
              <div class="input-box-wrap round-search-box">
                <span v-if="searchStudentId" class="target-chip-wrap">
                  <span class="chip-keyword">{{ getSearchedStudent }}</span>
                  <span
                    class="chip-close cursor-pointer"
                    @click="searchStudentId = ''"
                  ></span>
                </span>
                <input
                  type="text"
                  :value="searchKeyword"
                  placeholder="@학생명 검색"
                  @input="onInput($event)"
                  :disabled="searchStudentId !== ''"
                  @focus="isOpenSearchDropBox = true"
                />
                <HiButton
                  v-if="searchKeyword"
                  color="link"
                  size="md"
                  class="btn-delete"
                  @click="
                    searchKeyword = '';
                    isOpenSearchDropBox = false;
                  "
                >
                  <HiIcon
                    name="ico-close3"
                    size="14"
                    color="white"
                    bgColor="gray"
                    rounded="rounded"
                  />
                </HiButton>
                <HiButton color="link" size="md" class="btn-search">
                  <HiIcon name="ico-search" size="24" color="default" />
                </HiButton>
              </div>
              <div v-if="isOpenSearchDropBox" class="search-drop-wrap custom-scr">
                <ul>
                  <template v-if="filteredByKeywordStudents.length > 0">
                    <li
                      v-for="student in filteredByKeywordStudents"
                      :key="`search-${student.studentId}`"
                      @click="search(student.studentId)"
                    >
                      <span class="num">{{ student.studentNo }}</span>
                      <span class="name">{{ student.studentName }}</span>
                    </li>
                  </template>
                  <template v-else>
                    <li>일치하는 학생이 없습니다.</li>
                  </template>
                </ul>
              </div>
            </div>
          </div>
          <div class="student-wrap-list">
            <div
              v-for="student in filteredStudents"
              :key="student.studentId"
              class="student-item"
              @click="toggleExclude(student.studentId)"
              :class="{ excluded: excludedIds.includes(student.studentId) }"
            >
              <div class="student-info">
                <span class="number"
                  ><span>{{ student.studentNo }}</span></span
                >
                <span class="name"
                  ><span>{{ student.studentName }}</span></span
                >
              </div>
              <div class="student-check" @click.stop="toggleExclude(student.studentId)">
                <input
                  type="checkbox"
                  :checked="excludedIds.includes(student.studentId)"
                  :id="'chk-' + student.studentId"
                  @click.stop
                />
                <label :for="'chk-' + student.studentId"></label>
                <span
                  class="excluded-label"
                  v-if="excludedIds.includes(student.studentId)"
                  >제외</span
                >
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="line-default" size="lg" @click="closeExcepPicker()">취소</HiButton>
        <HiButton color="orange" size="lg" @click="onClickAbsenteeSave()">저장</HiButton>
      </template>
    </HiModal>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import Lottie from "@/components/Lottie/Lottie";
import confetti from "@/assets/img/lottie/confetti.json";
import { useController } from "@/apps/behavior/modules/picker";
import StudentPhoto from "@/apps/behavior/components/common/StudentPhoto.vue";
import GiveTotalPointModal from "@/apps/behavior/components/popup/GiveTotalPointModal.vue";

import "@/assets/css/behavior-record.css";
import uuid from "uuid";

const controller = useController();

export default {
  name: "Picker",
  props: {
    classroomId: {
      type: String,
      required: true,
    },
  },
  components: {
    Lottie,
    StudentPhoto,
    GiveTotalPointModal,
  },
  data() {
    return {
      randomColors: [
        "#FCCB32",
        "#4ECB71",
        "#4ECBB4",
        "#66A3FF",
        "#FF766D",
        "#FF8737",
        "#B75BEF",
        "#6369F1",
      ], // 랜덤 색상 배열
      shuffledColors: [],
      students: [], // 현재 학생 리스트 (결석자 제외)
      includeAbsenteeStudents: [], //결석자 포함한 학생 리스트
      excludedIds: [], // 제외된 학생 목록
      filteredStd: [], // 필터링된 학생 리스트
      mode: "set", // 모드
      gender: "ALL", // 대상선택
      targetNum: 1, // 뽑기 인원수
      shuffling: false, // 섞기 중인지 여부를 나타내는 플래그
      focusedId: null, // 포커싱된 ID
      selectedIds: [], // 선택된 ID 배열
      soundEffect: true,
      confetti: {
        animationData: confetti,
        loop: false,
        autoplay: true,
      },
      isDisbalePick: false,
      confetti1Instance: null,
      zoom: 1,
      isGiveTotalPointModal: false,
      givePointSoundGood:
        "https://download.hiclass.net/static/assets/audio/givepoint_sound_good.mp3",
      givePointSoundBad:
        "https://download.hiclass.net/static/assets/audio/givepoint_sound_bad.mp3",
      randomAllPick:
        "https://download.hiclass.net/static/assets/audio/random-all-pick.mp3",
      randomDraw: "https://download.hiclass.net/static/assets/audio/random-draw-0.wav",
      randomConfetti:
        "https://download.hiclass.net/static/assets/audio/random-confetti.wav",
      randomFlip: "https://download.hiclass.net/static/assets/audio/random-flip.mp3",
      randomShuffle:
        "https://download.hiclass.net/static/assets/audio/random-shuffle.mp3",
      audioMap: {}, // 효과음을 제어하기 위한 Audio 맵,
      closed: false,
      isOpenExcepList: false,
      searchKeyword: "",
      searchStudentId: "",
      isOpenSearchDropBox: false,
      isSendingDrawRandom: false,
    };
  },

  computed: {
    ...mapState("storeBehavior", [
      "pointFinishClearTimeOutWatch",
      "pointGiveFinishModal",
      "detailClass",
      "lastStudentsParams",
      "lastSenderUUID",
    ]),
    isAnySelected() {
      return this.excludedIds.length > 0;
    },

    absenteeStudentCount() {
      return this.includeAbsenteeStudents.filter(
        (s) => s.isExcluded
      ).length;
    },

    filteredStudents() {
      if (!this.searchStudentId && !this.searchKeyword)
        return this.includeAbsenteeStudents;
      if (this.searchStudentId) {
        return this.includeAbsenteeStudents.filter(
          (s) => s.studentId == this.searchStudentId
        );
      } else {
        return this.includeAbsenteeStudents.filter((s) =>
          s.studentName.includes(this.searchKeyword)
        );
      }
    },

    targetStdCount() {
      const filteredGender = this.getStudentsByGender(this.includeAbsenteeStudents);
      const result = filteredGender.filter(
        (s) => controller.model.pickedStudentIds.includes(s.studentId) || s.isExcluded
      ).length;
      const totalCount = filteredGender.length;
      return totalCount - result;
    },

    filteredTotalStudentCount() {
      const filteredGender = this.getStudentsByGender(this.includeAbsenteeStudents);
      const absenteeCount = filteredGender.filter((s) => s.isExcluded).length;
      return filteredGender.length - absenteeCount;
    },

    //학생 총 인원수별 최대 가로 너비 조정
    headCount() {
      const count = this.filteredStd.length;
      if (count <= 18) return "std6";
      if (count <= 21) return "std7";
      if (count <= 32) return "std8";
      if (count <= 36) return "std9";
      if (count <= 50) return "std10";
      if (count <= 72) return "std12";
      return "std15";
    },
    hasAbsenteeStudents() {
      return (
        this.includeAbsenteeStudents.filter((student) =>
          this.excludedIds.includes(student.studentId)
        ).length > 0
      );
    },
    classroomStudents() {
      return controller.model.classroomStudents;
    },
    pickedStudents() {
      return this.selectedIds.map((index) => this.filteredStd[index]);
    },
    isStudentType() {
      return this.detailClass.studentViewType === "NONE" ? false : true;
    },
    hasGenderedStudents() {
      return this.classroomStudents.some((student) => student.studentGender !== null);
    },
    disabledAllClick() {
      return ["draw", "shuffle"].includes(this.mode);
    },
    filteredByKeywordStudents() {
      if (!this.searchKeyword)
        return this.includeAbsenteeStudents;
      return this.includeAbsenteeStudents.filter((s) =>
        s.studentName
          .toLowerCase()
          .includes(this.searchKeyword.replaceAll("@", "").toLowerCase())
      );
    },
    getSearchedStudent() {
      const student = this.includeAbsenteeStudents.find(
        (s) => s.studentId === this.searchStudentId
      );
      return student ? `${student.studentNo}. ${student.studentName}` : "";
    },
  },
  watch: {
    //maxItemsPerRow 값이 변경될 때 바로 반영
    students: {
      immediate: true,
      handler() {
        this.$forceUpdate();
      },
    },

    gender() {
      this.refreshFilteredStd();
    },
    filteredStd() {
      if (this.targetNum > this.filteredStd.length) {
        this.targetNum = 1;
      }
    },
    soundEffect(newValue) {
      if (!newValue) {
        Object.values(this.audioMap).forEach((audio) => {
          audio.muted = true;
        });
      } else {
        Object.values(this.audioMap).forEach((audio) => {
          audio.muted = false;
        });
      }
    },

    isOpenExcepList: function (newValue) {
      if(newValue) {
        this.excludedIds = this.includeAbsenteeStudents.filter(s => s.isExcluded).map(s => s.studentId);
      } else {
        this.excludedIds = [];
      }
    }
  },
  methods: {
    ...mapMutations("storeBehavior", [
      "setPointGiveFinishModal",
      "setNewStudentPoints",
      "setLastSenderUUID",
    ]),
    ...mapActions("storeBehavior", [
      "patchPointGiveFinishModal",
      "getDetailClass",
      "getClassroomStudents",
      "sendStompClient",
    ]),
    onInput(e) {
      this.searchKeyword = e.target.value;
      if (e.target.value.startsWith("@")) {
        this.isOpenSearchDropBox = true;
      } else {
        this.searchKeyword = "";
        e.target.value = "";
        this.isOpenSearchDropBox = false;
      }
    },
    search(studentId) {
      this.searchKeyword = "";
      this.searchStudentId = studentId;
      this.isOpenSearchDropBox = false;
    },
    closeScreen() {
      this.closed = true;
      this.$toasted.clear();
      this.$emit("close");
    },

    closeExcepPicker() {
      this.isOpenExcepList = false
    },

    hasPickedStudents() {
      return controller.model.pickedStudentIds.length > 0;
    },

    onClickAbsenteeSave() {
      if (this.excludedIds.length === this.includeAbsenteeStudents.length) {
        this.showToast("뽑기 대상은 최소 1명 이상 있어야 합니다.");
      } else {
        if (this.hasPickedStudents()) {
          this.showConfirmResetDrawPick();
        } else {
          this.saveAbsenteeStudents();
        }
      }
    },

    async showConfirmResetDrawPick() {
      const confirm = await this.$hiClass
        .confirm(
          "뽑기 제외 명단이 변경되어 뽑기를 초기화해야 합니다. 계속하시겠습니까?",
          null,
          {
            customClass: "records-confirm only-text btn-orange",
            confirmButtonText: "확인",
            cancelButtonText: "취소",
          }
        )
        .catch(() => {});
      if(confirm.isConfirmed) {
        await controller.resetRandomDrawRandomClassRoomId(this);
      
        this.saveAbsenteeStudents();
      }
    },

    async saveAbsenteeStudents() {
      try {
        await controller.updateClassroomExcludeStudents(this.excludedIds); 

        this.classroomStudents.forEach(s => {
          s.isExcluded = this.excludedIds.includes(s.studentId);
        });
        this.updateStudents();
        this.refreshFilteredStd();

        if (this.mode == "set" && this.gender == "ALL") {
          this.mode = "filterAll";
        }
        
        this.closeExcepPicker();
        this.showToast("명단이 저장되었습니다.");
      
      } catch(e) {
        console.error(e);
        this.$hiClass.alert('요청이 정상적으로 처리되지 않았습니다.\n잠시 후 다시 시도해 주세요.');
      }
    },

    onClickClose() {
      this.closeScreen();
    },

    async onClickDrawRandom() {
      if(this.isSendingDrawRandom) return;
      this.isSendingDrawRandom = true;
      await controller.reloadStudents();
      if (this.classroomStudents.length === 0) {
        this.$hiClass.alert("학생을 등록해주세요.");
        this.closeScreen();
        return;
      }
      if (this.students.length === 0) {
        this.$hiClass.alert("뽑기 대상이 없습니다.");
        return;
      }
      try {
        await controller.spinRandomDrawRandom(this);
         // 내가보낸 웹소켓 이벤트인지 인지하기 위한 uuid 입력

        const senderUUID = uuid.v4();
        this.setLastSenderUUID(senderUUID); // store에 LastSenderUUID set

        this.sendStompClient({
          contentType: "drawRandom",
          classroomId: this.classroomId,
          gender: this.gender,
          targetNum: this.targetNum,
          senderUUID,
        }).then();
        // 내가 클릭해서 생성된 웹소켓은 무시하므로 callDrawRandom 직접  (직접 실행 하면 아이패드에서 사운드 재생됨)
        await this.callDrawRandom(this.gender, this.targetNum);
      } catch (e) {
        await this.$hiClass.alert("삭제된 교실입니다.");
          this.closeScreen(); 
      } finally {
        this.isSendingDrawRandom = false;
      }
    },
    // 효과음 재생 함수  // 아이패드에서 클릭 함수가 아닌 곳에서 효과음 발생하지 않는 문제대응 :  효과음 재생 함수에서 재생과 정지를 모두 처리
    playSoundEffect(soundUrl, action = "play") {
      // 오디오 객체가 없으면 생성해서 저장
      if (!this.audioMap[soundUrl]) {
        this.audioMap[soundUrl] = new Audio(soundUrl);
        this.audioMap[soundUrl].muted = this.soundEffect ? false : true; // 초기 볼륨 설정
      }

      const audio = this.audioMap[soundUrl];

      if (action === "play") {
        audio.play();
        audio.currentTime = 0;
      } else if (action === "pause") {
        audio.pause();
        audio.currentTime = 0;
      }
    },

    // 모드 변경
    setMode(mode) {
      this.mode = mode; // 모드 변경
      if (mode === "in") {
        // 초기화
        this.resetStd();
      } else if (mode === "draw") {
        // 뽑기 시작
        this.resetStudentList();
        this.drawStd();
      } else if (mode === "flip") {
        // 카드 뒤집기
        this.flipShuffleStd();
      } else if (mode === "shuffle") {
        // 카드 섞기
        this.shuffleStd();
      }
    },

    // 초기화
    resetStd() {
      this.students = []; // 학생 리스트를 비웁니다.
      this.includeAbsenteeStudents = [];
      this.resetStudentList();
      //this.mode = "set"; // 모드를 초기화
      this.gender = "ALL"; // 필터 초기화
      this.targetNum = 1; // 뽑기 인원 초기화
      this.shuffling = false; // 섞기 상태 초기화
      this.selectedIds = []; // 선택된 인덱스 초기화
      this.audioMap = {}; // 오디오 맵 초기화
      this.excludedIds = this.includeAbsenteeStudents.filter(s => s.isExcluded).map(s => s.studentId);
    },

    resetStudentList() {
      this.includeAbsenteeStudents = this.classroomStudents.map((student, index) => {
        return {
          ...student,
          backgroundColor: this.shuffledColors[index % this.shuffledColors.length],
        };
      });
      this.students = this.includeAbsenteeStudents.filter((s) => !s.isExcluded);
      this.refreshFilteredStd();
    },
    // 뽑기 초기화
    resetDraw() {
      controller.resetRandomDrawRandomClassRoomId(this);
      this.mode = "in";
      this.showToast("뽑기 대상이 초기화되었습니다.");
      this.setMode(this.mode);
      this.audioMap = {}; // 오디오 맵 초기화
    },
    // 뽑기 시작
    drawStd() {
      this.audioMap = {}; // 오디오 맵 초기화
      this.showToastForBeingDraw();
      this.playSoundEffect(this.randomDraw);
      this.playSoundEffect(this.randomConfetti, "pause"); // 팡파래 효과음 잠시 멈춤 (아이패드 대응)
      this.selectedIds = []; // 선택된 인덱스 초기화
      let count = 0; // 포커싱 횟수
      const interval = setInterval(() => {
        if (this.closed) return clearInterval(interval);

        // 랜덤 포커스 지정
        this.focusedId = Math.floor(Math.random() * this.filteredStd.length);

        count++;

        if (count === 7) {
          clearInterval(interval);
          this.focusedId = null;
          this.finalizeSelect();
        }
      }, 300);
    },

    // 뽑기 선택
    async finalizeSelect() {
      const drawResult = await controller.syncLatestWinners(this);
      const wait = () => new Promise((r) => setTimeout(r, 300));

      for (const studentId of drawResult.studentIds) {
        await wait();
        const index = this.filteredStd.findIndex((s) => s.studentId === studentId);
        this.focusedId = index;
        this.selectedIds.push(index);
      }
      await wait();
      this.focusedId = null;
      this.fireworks();
      controller.syncAccumWinners();
    },

    fireworks() {
      this.playSoundEffect(this.randomDraw, "pause");
      this.playSoundEffect(this.randomConfetti, "play");
      this.mode = "draw-pick";
    },

    // 섞기 시작 (카드 뒤집고 섞기)
    flipShuffleStd() {
      this.selectedIds = [];
      this.shuffling = true;
      this.playSoundEffect(this.randomFlip); // flip 모드 효과음
      this.playSoundEffect(this.randomShuffle, "pause"); // shuffle 모드 효과음 잠시 멈춤 (아이패드 대응)
      setTimeout(() => {
        this.shuffleStd();
      }, 400);
    },

    async validateClassroom() {
      const result = await this.getDetailClass({ classroomId: this.classroomId });
      if (result.status !== 200) {
        await this.$hiClass.alert("삭제된 교실입니다.");
        this.closeScreen();
        return false;
      }
      return true;
    },

    // 섞기 시작(카드 섞기)
    shuffleStd() {
      this.selectedIds = [];
      this.mode = "shuffle";
      setTimeout(() => {
        this.playSoundEffect(this.randomShuffle); // shuffle 모드 효과음
        this.playSoundEffect(this.randomFlip, "pause"); // flip 모드 효과음 잠시 멈춤 (아이패드 대응)
      }, 800);
      const shuffleTimes = 4;
      let count = 0;
      const shuffleInterval = setInterval(() => {
        if (this.closed) return clearInterval(shuffleInterval);

        for (let i = this.filteredStd.length - 1; i > 0; i--) {
          let randomIndex = Math.floor(Math.random() * (i + 1));
          let temp = this.filteredStd[i];
          this.$set(this.filteredStd, i, this.filteredStd[randomIndex]);
          this.$set(this.filteredStd, randomIndex, temp);
        }
        count++;
        if (count === shuffleTimes) {
          clearInterval(shuffleInterval);
          this.showToastForAfterShuffle();
          this.mode = "shuffle-pick";
        }
      }, 900);
    },
    toggleFlip(index) {
      this.audioMap = {}; // 오디오 맵 초기화
      if (this.mode === "shuffle-pick") {
        this.playSoundEffect(this.randomFlip); // flip 모드 효과음
        const selectedIndex = this.selectedIds.indexOf(index);

        if (selectedIndex === -1) {
          this.selectedIds.push(index);
        } else {
          this.selectedIds.splice(selectedIndex, 1);
        }
      }
    },
    closeAllCards() {
      if (this.mode === "shuffle-pick") {
        this.selectedIds = [];
      }
    },

    // 모든 카드를 열기
    openAllCards() {
      if (this.mode === "shuffle-pick") {
        this.playSoundEffect(this.randomAllPick); // 모두 열기
        this.selectedIds = this.filteredStd.map((_, index) => index);
      }
    },
    contentCardSizing() {
      const content = this.$refs.content;
      const width = content.clientWidth;
      const height = content.clientHeight;

      let zoom;
      if (width / 1600 >= height / 840) {
        zoom = height / 840;
      } else {
        zoom = width / 1600;
      }

      this.zoom = Math.min(zoom, 1);
    },
    getGivePointFinish: async function (item, isCharacterType) {
      let mode = "good";
      let soundSrc = this.givePointSoundGood;
      if (item.content.classroomPoints.findIndex((v) => v.isNegative === true) > -1) {
        mode = "effort";
        soundSrc = this.givePointSoundBad;
      }

      const checkSound = !localStorage.getItem("behavior-givepoint-sound")
        ? "ON"
        : localStorage.getItem("behavior-givepoint-sound");
      if (checkSound === "ON") {
        const audioContainer = this.$refs.givePointSound;
        const source = this.$refs.givePointSoundSource;
        source.src = soundSrc;
        audioContainer.load();
        audioContainer.volume = 1;
        audioContainer.play();
      }

      this.pointGiveFinishContent = item;
      if (isCharacterType) {
        await this.patchPointGiveFinishModal({
          open: true,
          mode: mode,
        });
      }

      this.pointFinishClearTimeOut = setTimeout(async () => {
        const list = JSON.parse(JSON.stringify(this.students))
          .filter((o) => o.checked)
          .map((v) => v.studentId);

        await this.getClassroomStudents(this.lastStudentsParams);
        this.students.forEach((v) => {
          if (list.includes(v.studentId)) {
            v.checked = true;
          }
        });

        const studentPoints = JSON.parse(JSON.stringify(item.content.studentPoints)).map(
          (item) => {
            return {
              ...item,
              mode: mode,
            };
          }
        );

        this.setNewStudentPoints(studentPoints);
      }, 2800);
    },
    openGiveTotalPointModal() {
      this.patchPointGiveFinishModal({
        open: false,
        mode: "null",
      });
      this.isGiveTotalPointModal = true;
    },
    finishToastClose() {
      this.pointGiveFinishModal.open = false;
      this.pointGiveFinishModal.mode = null;
      this.pointGiveFinishContent = {};
    },
    async onClickGoToStudentList() {
      const confirm = await this.$hiClass
        .confirm("학생명단관리로 이동하시겠습니까?", null, {
          customClass: "records-confirm only-text btn-orange",
        })
        .catch(() => {});
      confirm.isConfirmed && this.gotoStudentList();
    },
    async onClickGenderFilter(mode) {
      this.mode = mode;
      if (!this.hasGenderedStudents) {
        const confirm = await this.$hiClass
          .confirm("학생 성별 정보를 등록해주세요.", null, {
            customClass: "records-confirm only-text btn-orange btn-w-auto",
            confirmButtonText: "학생명단관리 가기",
            cancelButtonText: "확인",
          })
          .catch(() => {});
        confirm && confirm.isConfirmed && this.gotoStudentList();
        await this.$nextTick();
        this.gender = "ALL";
        this.mode = "filterAll";
      }
    },
    gotoStudentList() {
      this.closeScreen();
      this.$router.push({
        name: "manageStudents",
        params: { classroomId: this.classroomId },
      });
    },
    async callDrawRandom(gender, targetNum) {
      await controller.reloadReference();
      this.gender = gender;
      this.targetNum = targetNum;
      this.setMode("draw");
    },
    showToast(message, duration = 2000) {
      this.$toasted.clear();
      this.$toasted.show(message, {
        duration: duration,
        className: "type01 random-draw-toast",
        position: "top-center",
      });
    },
    showToastForBeingDraw() {
      this.showToast("누가 뽑힐까요?");
    },
    showToastForAfterShuffle() {
      this.showToast("학생을 클릭해서 열어보세요!");
    },
    async onClickShuffleStd() {
      if (!(await this.validateClassroom())) {
        return;
      }
      await controller.reloadReference();
      if (this.classroomStudents.length === 0) {
        this.$hiClass.alert("학생을 등록해주세요.");
        this.closeScreen();
        return;
      }
      this.setMode(this.shuffling ? "shuffle" : "flip");
    },
    refreshFilteredStd() {
      const filtered = this.getStudentsByGender(this.includeAbsenteeStudents).filter(
        (s) => !s.isExcluded
      );
      this.isDisbalePick = filtered.length === 0
      this.filteredStd = filtered;
    },
    isiPad() {
      return navigator.userAgent.match(/iPad/i) !== null;
    },
    darkenColor(color, percent) {
      const num = parseInt(color.replace("#", ""), 16);
      const r = Math.floor((num >> 16) * (1 - percent));
      const g = Math.floor(((num >> 8) & 0x00ff) * (1 - percent));
      const b = Math.floor((num & 0x0000ff) * (1 - percent));
      return `rgb(${r}, ${g}, ${b})`;
    },
    confetti1Created(anim) {
      this.confetti1Instance = anim;
      this.confetti1Instance.setSpeed(1.5);
    },
    toggleExclude(studentId) {
      const idx = this.excludedIds.indexOf(studentId);
      if (idx > -1) {
        this.excludedIds.splice(idx, 1);
      } else {
        this.excludedIds.push(studentId);
      }
    },

    getStudentsByGender(targetStudents) {
      return targetStudents.filter(
        (s) => this.gender === "ALL" || s.studentGender === this.gender
      );
    },

    updateStudents() {
      const updateAbsenteeStatus = (students) => {
        students.forEach((student) => {
          student.isExcluded = this.excludedIds.includes(student.studentId);
        });
      };

      updateAbsenteeStatus(this.students);
      updateAbsenteeStatus(this.includeAbsenteeStudents);
    },

    unselectAll() {
      this.excludedIds = [];
    },
  },
  async mounted() {
    this.shuffledColors = [...this.randomColors].sort(() => Math.random() - 0.5);
    await controller.setClassroomId(this.classroomId);
    this.getDetailClass({ classroomId: this.classroomId });
    this.getClassroomStudents({
      classroomId: this.classroomId,
      isHidden: false,
      isIncludePoint: true,
    });
    this.resetStd();
    this.contentCardSizing();
    window.addEventListener("resize", this.contentCardSizing);
    if (this.isiPad()) {
      document.body.classList.add("ios");
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.contentCardSizing);
  },
};
</script>
<style>
body {
  overflow: hidden;
}
</style>
<style scoped lang="scss">
@use "sass:color";
$point-color: #FF8737;
$secondary-color: #FCD049;

.random-draw-wrap {
  display: flex;
  width: 100%;
  height: 100dvh;
  margin: auto;
  background-color: #222;

  //  -------- 레이아웃 -----------//
  .container {
    width: 100%;
    height: calc(100% - 78px);
    display: flex;
    position: relative;
    padding: 24px 0 24px 24px;
  }

  /* side */
  .sidebar {
    height: 100%;
    min-width: 280px;
    overflow: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar {
      background-color: transparent;
      width: 10px;
      height: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #666;
      background-clip: padding-box;
      min-height: 40px;
      border: 2px solid transparent;

      border-radius: 10px;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
    .side-box {
      .btn-excep {
        width: auto;
        white-space: nowrap;
        .count {
          color: #ff8737;
          font-size: 12px;
          font-weight: 700;
          line-height: 18px;
          letter-spacing: -0.2px;
          margin-left: 4px;
        }
      }
    }
  }

  /* content */
  .content-wrap {
    width: 100%;
    height: 100%;
    flex-grow: 1;
  }
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 1600px;
    max-height: 840px;
    display: flex;
    justify-content: center;
    margin: 0 auto;

    .confetti1,
    .confetti2,
    .confetti3 {
      position: absolute;
      z-index: 999;
      width: 33% !important;
    }
    .confetti1 {
      left: 0;
    }
    .confetti2 {
      left: 33%;
    }
    .confetti3 {
      right: 0;
    }
  }

  /* footer */
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 78px;
    padding: 0 30px;
    margin: 0;
    background-color: #222;
    border-top: 1px solid #616161;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .sound-toggle {
      width: 274px;

      label {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #bdbdbd;
        font-size: 18px;
        width: 135px;
        cursor: pointer;
        transition: 0.2;
        &:hover {
          color: #fff;
          i::after {
            background-color: #fff !important;
          }
        }
      }
    }
    .btns {
      flex-grow: 1;
      display: flex;
      justify-content: space-between;
      button {
        width: 140px;
        transition: 0.3s;
      }
      .btn-gray {
        color: #bdbdbd;
        background-color: transparent;
        border: 1px solid #616161;
        &:hover {
          background-color: #616161;
          color: #fff;
        }
      }
      .btn-yellow {
        color: $secondary-color;
        background-color: transparent;
        border: 1px solid $secondary-color;
        &:hover {
          background-color: $secondary-color;
          color: #222;
        }
      }
      .btn-primary {
        width: 200px;
      }
    }
  }

  .btn-close {
    z-index: 999;
    position: absolute;
    right: 20px;
    top: 20px;
    width: 42px;
    height: 42px;
    font-size: 0;
    i {
      padding: 0;
    }
  }

  //  -------- 레이아웃 -----------//

  /* 사이드박스 */
  .side-box {
    padding: 30px;
    border: 1px solid #616161;
    border-radius: 16px;
    width: 270px;

    & + .side-box {
      margin-top: 20px;
    }

    h2 {
      color: #fff;
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: 1.4;
      font-family: var(--font-tit);
      margin-bottom:30px;
      p.smr{
        font-size: 15px;
        color: #9e9e9e;
        margin-top: 7px;
        font-weight: 400;
      }
    }
    h3 {
      margin: 36px 0 8px;
      padding: 4px 0;
      color: #fff;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 1.4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &:nth-of-type(1) {
        margin-top: 0px;
      }
      button {
        background-color: transparent;
        border: 1px solid #535353;
        color: #bdbdbd;
        width: 80px;
        letter-spacing: -0.8px;
        transition: all 0.2s ease-in-out;
        i {
          border: 0;
          &::after {
            background: #bdbdbd;
          }
        }
        &:hover {
          border: 1px solid #fff;
          color: #fff;
          i::after {
            background: #fff;
          }
        }
      }
    }

    .info {
      font-size: 16px;
      color: #fff;
    }

    // 대상 선택
    .radio-group {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;

      label {
        cursor: pointer;
        margin-left: 16px;
        &:nth-of-type(1) {
          margin-left: 0px;
        }
        span {
          color: #fff;
        }
      }
      input[type="radio"] + label::before,
      input[type="checkbox"] + label::before {
        background: url(~@/assets/img/icon/icon_radio_gray.svg) no-repeat;
      }
      input[type="radio"]:checked:disabled + label::before,
      input[type="checkbox"]:checked:disabled + label::before {
        background: url(~@/assets/img/icon/icon_radio_selected_gray.svg) no-repeat;
      }
      input[type="radio"]:checked + label::before,
      input[type="checkbox"]:checked + label::before {
        background: url(~@/assets/img/icon/icon_radio_selected_orange.svg) no-repeat;
      }
    }

    // 뽑기 인원
    .draw-count-wrap {
      .draw-count {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px 5px;
        margin-bottom: 20px;
        > button {
          padding: 16px;
          border: none;
          border-radius: 8px;
          border-width: 1px;
          &.btn-gray {
            background-color: #363636;
            border: 1px solid #363636;
          }
          &.active {
            background-color: #222;
            color: $point-color;
            border: 1px solid $point-color;
          }
          &:hover{
            background-color: color.mix(#000, $point-color, 52%);
            border:1px solid color.mix(#000, $point-color, 52%);
            color:#fff;
          }
          &:disabled {
            background-color: #363636 !important;
            border: 1px solid #363636 !important;
            color: #616161 !important;
          }
        }
      }
      > button.btn-draw {
        background-color: $point-color;
        height: 52px;
        font-size: 18px;
        &:hover{
          background-color:color.mix(#000, $point-color, 8%);;
        }
      }
      .btn-refresh {
        margin-top: 8px;
        background-color: transparent;
        height: 52px;
        font-size: 18px;
      }
    }

    // 학생 섞기
    .btn-shuffle {
      background-color: $secondary-color;
      color: #222;
      height: 52px;
      font-size: 18px;
      &:hover{
        background-color:color.mix(#000, $secondary-color, 8%);;
      }
    }
    .hi-tooltip-wrap::v-deep {
      margin-top: -1px;
      &::before {
        background-color: #fff;
      }
      &:hover::before {
        mask-image: url(~@/assets/img/svg/ico-warning-circle.svg);
        background-color: #fff;
      }
      .hi-tooltip {
        left: 67px;
        &::before {
          left: 45px;
        }
      }
    }
  }

  .hi-modal-common::v-deep {
    .modal__footer .hi-btn {
      min-width: 114px;
    }
  }

  /* 학생 리스트 */
  .student-list {
    width: 95%;
    display: grid;
    grid-template-columns: repeat(8, minmax(auto, 198px));
    grid-auto-flow: dense;
    justify-content: space-between;
    padding-top: 3px;
    align-content: center;

    .student {
      text-align: center;
      overflow: hidden;
      padding: 5px;
      .img-area {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        height: 0;
        padding-top: 100%;
        text-align: center;
        background-color: #666;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
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

        > img {
          width: 80%;
          height: auto;
          user-select: none;
          pointer-events: none;
        }
        .txt-area {
          border-radius: 50%;
          margin-top: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-flow: column;
          align-items: center;
          position: absolute;
          .num {
            color: #fff;
          }
          .name {
            margin: 0;
          }
        }
        .is-photo {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          user-drag: none; /* Safari 전용 */
          -webkit-user-drag: none; /* Chrome, Safari */
          -khtml-user-drag: none; /* 오래된 Konqueror */
          -moz-user-drag: none; /* Firefox */
          -o-user-drag: none; /* Opera */
          user-select: none; /* 텍스트 선택도 막기 (선택사항) */
          overflow: hidden;
          ::v-deep img {
            width: 100%;
            height: auto;
            user-select: none;
            pointer-events: none;
            &.is-height {
              width: auto;
              height: 100%;
            }
          }
        }
      }
      .txt-area {
        margin-top: 5%;
        display: flex;
        align-items: baseline;
        justify-content: center;
        .num {
          font-weight: 600;
          font-family: var(--font-body);
          color: #888;
          line-height: 1.2;
        }
        .name {
          font-weight: 500;
          color: #fff;
          margin-left: 4%;
          overflow: hidden;
          word-break: break-all;
          display: block;
          line-height: 1.2;
          text-align: center;
        }
      }
    }
    &.std6 {
      grid-template-columns: repeat(6, minmax(auto, 224px));
      gap: 10px 0;
      .student {
        width: 224px;
        height: 272px; // 스크롤 생겨서 디자인 사이즈와 조금 상이
        .txt-area {
          .name {
            font-size: 40px;
            height: 46px;
          }
          .num {
            font-size: 32px;
          }
        }
      }
    }
    &.std7 {
      grid-template-columns: repeat(7, minmax(auto, 192px));
      gap: 15px 0;
      .student {
        width: 192px;
        height: 236px;
        .txt-area {
          .name {
            font-size: 32px;
            height: 37px;
          }
          .num {
            font-size: 28px;
          }
        }
      }
    }
    &.std8 {
      grid-template-columns: repeat(8, minmax(auto, 172px));
      gap: 0px 0;
      .student {
        width: 172px;
        height: 208px;
        .txt-area {
          .name {
            font-size: 28px;
            height: 33px;
          }
          .num {
            font-size: 23px;
          }
        }
      }
    }
    &.std9 {
      grid-template-columns: repeat(9, minmax(auto, 154px));
      gap: 15px 0;
      .student {
        width: 154px;
        height: 188px;
        .txt-area {
          .name {
            font-size: 28px;
            height: 33px;
          }
          .num {
            font-size: 22px;
          }
        }
      }
    }
    &.std10 {
      grid-template-columns: repeat(10, minmax(auto, 134px));
      gap: 6px 0;
      .student {
        width: 134px;
        height: 162px;
        .txt-area {
          .name {
            font-size: 24px;
            height: 29px;
          }
          .num {
            font-size: 19px;
          }
        }
      }
    }
    &.std12 {
      grid-template-columns: repeat(12, minmax(auto, 112px));
      gap: 3px 0;
      .student {
        width: 112px;
        height: 136px;
        .txt-area {
          .name {
            font-size: 20px;
            height: 25px;
          }
          .num {
            font-size: 16px;
          }
        }
      }
    }
    &.std15 {
      grid-template-columns: repeat(15, minmax(auto, 84px));
      gap: 12px 0;
      overflow-y: auto;
      overflow-x: hidden;
      align-content: normal;
      .student {
        width: 84px;
        height: 100px;
        .txt-area {
          .name {
            font-size: 16px;
            height: 22px;
          }
          .num {
            font-size: 13px;
          }
        }
      }

      &::-webkit-scrollbar {
        background-color: transparent;
        width: 15px;
        height: 15px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #666;
        background-clip: padding-box;
        min-height: 40px;
        border: 2px solid transparent;
        border-radius: 15px;
      }
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
    }
  }

  /* 초기화 (Set mode) 애니메이션 */
  .set .student {
    &.trans-enter {
      opacity: 0;
      transform: translateY(8%);
    }
    &.trans-enter-active {
      transition: 0.5s;
    }
    &.trans-enter-to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  // 초기화 (in mode) 애니메이션
  .in .student {
    animation: fadeIn 0.3s ease-in-out forwards;
  }
  /* 필터링 (Filter mode) 애니메이션 */
  .student-list[class*="filter"] .student {
    animation: filterIn 0.5s ease-in-out forwards;
  }
  /* 뽑기 시작 (Draw mode) 애니메이션 */
  .draw {
    .student {
      animation: drawIn 0.1s ease-in-out forwards;
      transition: all 0.1s ease-in-out;
    }
    .focused {
      animation: drawFocus 0.3s ease-in-out forwards;
      transform: scale(1.1);
      .img-area {
        z-index: 10;
      }
    }
    .selected {
      animation: fadeIn 0.25s ease-in-out forwards;
      transform: scale(1);
      .img-area {
        z-index: 10;
      }
    }
  }
  /* 뽑기 완료 (Draw-pick mode) 애니메이션 */
  .student-list.draw-pick {
    align-items: center;
    justify-content: center;
    align-content: center;
    flex-flow: wrap-reverse;
    gap: 40px;
    .student {
      width: 224px;
      height: 276px;
      animation: fadeIn 0.5s ease forwards;
      .txt-area {
        .num {
          font-size: 32px;
        }
        .name {
          font-size: 40px;
          min-height: 46px;
          max-height: 94px;
          height: auto;
        }
      }
    }
    &.selected-1,
    &.selected-2,
    &.selected-3 {
      gap: 0 30px;
      .student {
        width: 480px;
        height: 600px;
        .txt-area {
          .name {
            font-size: 80px;
          }
          .num {
            font-size: 64px;
          }
        }
      }
    }

    &.selected-1 {
      grid-template-columns: repeat(1, minmax(auto, 480px));
    }
    &.selected-2 {
      grid-template-columns: repeat(2, minmax(auto, 480px));
    }
    &.selected-3 {
      grid-template-columns: repeat(3, minmax(auto, 480px));
    }
    &.selected-4 {
      grid-template-columns: repeat(4, minmax(auto, 224px));
      gap: 0 30px;
    }
    &.selected-5 {
      grid-template-columns: repeat(5, minmax(auto, 224px));
      gap: 0 30px;
    }
    &.selected-6 {
      grid-template-columns: repeat(3, minmax(auto, 224px));
      gap: 30px;
    }
    &.selected-7 {
      display: flex;
      width: 998px;
      gap: 30px;
    }
    &.selected-8 {
      grid-template-columns: repeat(4, minmax(auto, 224px));
      gap: 30px;
    }
    &.selected-9 {
      display: flex;
      width: 1260px;
      gap: 30px;
    }
  }
  /* 카드 뒤집기 (Flip mode) 애니메이션 */
  .flip .student {
    animation: flipIn 0.5s ease-in-out forwards;
    transition: transform 1s ease-in-out;
    .txt-area,
    .img-area > .is-photo,
    .img-area > img {
      animation: fadeIn 0.1s ease-in-out reverse forwards;
      animation-delay: 0.2s;
    }
  }
  /* 섞기 시작 (Shuffle mode) 애니메이션 */
  .shuffle .student {
    transition: transform 0.9s;
    .img-area > img,
    .img-area > .is-photo,
    //.img-area > .student-name,
    .txt-area {
      opacity: 0;
    }
  }
  .shuffle-pick {
    overflow: auto;
    .student {
      transform: rotateY(180deg);
      transition: transform 0.4s ease-in-out;
      .img-area {
        cursor: pointer;
        transition: transform 0.2s ease-in-out;

        &:hover {
          background-color: #888;
          transform: translate(0, -4px);
          box-shadow: 0 8px 0px rgba(0, 0, 0, 0.3);
        }
      }
      .img-area > img,
      .img-area > .is-photo,
      //.img-area > .student-name,
      .txt-area {
        transition: opacity 0s ease-in-out;
        transition-delay: 0.2s;
        opacity: 0;
      }
    }
    .student.selected {
      transform: rotateY(0deg);
      transition: transform 0.4s ease-in-out;
      .img-area > img,
      .img-area > .is-photo,
      //.img-area > .student-name,
      .txt-area {
        transition: opacity 0s ease-in-out;
        transition-delay: 0.2s;
        opacity: 1;
      }
    }
  }
  .student-excep-list {
    .modal {
      &__header {
        .heading {
          color: #000;
          font-size: 18px;
          font-weight: 700;
          line-height: 18px;
          .desc {
            color: #616161;
            font-size: 16px;
            font-weight: 400;
            line-height: 24px;
            margin-top: 15px;
          }
        }
      }
    }
  }

  @keyframes filterIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes drawIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.5;
    }
  }
  @keyframes drawFocus {
    from {
      opacity: 0.5;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes flipIn {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(180deg);
    }
  }
  .student-wrap {
    .btns {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 5px 0 15px 0;
      .btn-select-all {
        height: 32px;
        display: flex;
        align-items: center;
        .ico-check {
          padding: 0;
        }
        span {
          display: inline-block;
          color: #c0c0c0;
          font-size: 13px;
          font-weight: 500;
          line-height: 20px;
          &.active {
            color: #f95f6e;
          }
        }
      }
      .input-box-wrap {
        width: 220px;
        &.round-search-box {
          padding: 0;
          .btn-search {
            i {
              &::after {
                background-color: #9e9e9e !important;
              }
            }
          }
        }
        input {
          padding: 0 40px 0 16px;
        }
        button {
          .hi-ico {
          }
        }
      }
      .input-search-wrap {
        position: relative;
        .target-chip-wrap {
          max-width: none;
          height: 28px;
          left: 4px;
          top: 3px;
          right: 40px;
          .chip-keyword {
            text-align: left;
          }
        }
        .search-drop-wrap {
          width: 220px;
          max-height: 318px;
          border-radius: 10px;
          position: absolute;
          border: 1px solid #d6d6d6;
          -webkit-box-shadow: 0px 5px 10px 0px #0000001f;
          box-shadow: 0px 5px 10px 0px #0000001f;
          background-color: #fff;
          top: 40px;
          right: -6px;
          padding: 9px 0px 9px 0px;
          overflow-y: auto;
          z-index: 1;
          ul {
            width: 100%;
            li {
              width: 100%;
              height: 50px;
              font-size: 14px;
              font-weight: 400;
              line-height: 14px;
              display: flex;
              align-items: center;
              padding: 16px 0px 16px 15px;
              &:hover {
                background: #f6f6f6;
              }
              span {
                &.num {
                  display: inline-block;
                  width: auto;
                  min-width: 28px;
                  max-width: 58px;
                  height: 18px;
                  border-radius: 20px;
                  border: 1px solid #9e9e9e;
                  font-size: 12px;
                  font-weight: 500;
                  color: #616161;
                  text-align: center;
                  line-height: 16px;
                  margin-right: 6px;
                  padding-left: 2px;
                  padding-right: 2px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
              }
              .name {
                flex-grow: 1;
                width: calc(100% - 62px);
                color: #222222;
                text-align: left;
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
        }
      }
    }
    .student-wrap-list {
      display: grid;
      max-height: calc((63px * 7) + (5px * 6));
      min-height: calc((63px * 7) + (5px * 6));
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(7, 1fr);
      gap: 5px;
      width: 100%;
      overflow-y: auto;
      .student-item {
        position: relative;
        min-height: 63px;
        padding: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: #fff;
        min-width: 0;
        cursor: pointer;
        .student-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-start;
          .number {
            display: flex;
            height: 18px;
            min-width: 28px;
            padding: 0px 4px;
            justify-content: center;
            align-items: center;
            gap: 10px;
            border: 1px solid #9e9e9e;
            border-radius: 20px;
            span {
              color: #616161;
              font-size: 12px;
              font-weight: 500;
              line-height: 12px;
            }
          }
          .name {
            display: block;
            white-space: nowrap;
            max-width: 100%;
            text-overflow: ellipsis;
            overflow: hidden;
            span {
              display: inline-block;
              color: #222;
              font-size: 15px;
              font-weight: 400;
              line-height: 21px;
              letter-spacing: -0.2px;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
        &.excluded {
          border-color: #f95f6e;
          background: rgba(249, 95, 110, 0.2);
          .student-check {
            width: 53px;
            height: 22px;
            padding: 0 6px 0 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 30px;
            background: #f95f6e;
            cursor: pointer;
            .excluded-label {
              color: #fff;
              font-size: 11px;
              font-weight: 500;
              line-height: 24px;
            }
            input[type="checkbox"] {
              display: none;
              + label {
                &::before {
                  height: 20px;
                  width: 20px;
                  background: url(~@/assets/img/icon/ic_check_circle_red_28.svg) 0/20px
                    no-repeat;
                }
              }
            }
          }
        }
        .student-check {
          position: absolute;
          right: 8px;
          top: 8px;
          input[type="checkbox"] {
            + label {
              &::before {
                content: "";
                display: inline-block;
                width: 20px;
                height: 20px;
                background: url(~@/assets/img/icon/ic_check_circle_gray_28.svg) 0/20px
                  no-repeat;
                vertical-align: middle;
              }
            }
          }
        }
      }
    }
  }
}

.ios {
  .random-draw-wrap .sidebar .side-box-wrap {
    overflow-y: auto;
    height: 100%;
  }
  .student-list {
    &.std6 {
      gap: 40px 0;
      .student {
        .txt-area {
          .name {
            font-size: 20px;
          }
          .num {
            font-size: 15px;
          }
        }
      }
    }
    &.std7 {
      gap: 40px 0;
      .student {
        .txt-area {
          .name {
            font-size: 16px;
          }
          .num {
            font-size: 13px;
          }
        }
      }
    }
    &.std8 {
      gap: 40px 0;
      .student {
        .txt-area {
          .name {
            font-size: 14px;
          }
          .num {
            font-size: 12px;
          }
        }
      }
    }
    &.std9 {
      gap: 40px 0;
      .student {
        .txt-area {
          .name {
            font-size: 14px;
          }
          .num {
            font-size: 12px;
          }
        }
      }
    }
    &.std10 {
      gap: 40px 0;
      .student {
        .txt-area {
          .name {
            font-size: 12px;
          }
          .num {
            font-size: 10px;
          }
        }
      }
    }
    &.std12 {
      gap: 40px 0;
      .student {
        .txt-area {
          .name {
            font-size: 11px;
          }
          .num {
            font-size: 9px;
          }
        }
      }
    }
    &.std15 {
      gap: 20px 0;
      .student {
        .txt-area {
          .name {
            font-size: 10px;
          }
          .num {
            font-size: 8px;
          }
        }
      }
    }
  }
  .student-list.draw-pick {
    .student {
      .txt-area {
        .name {
          font-size: 23px;
        }
        .num {
          font-size: 18px;
        }
      }
    }
    &.selected-1,
    &.selected-2,
    &.selected-3 {
      .student .txt-area {
        .name {
          font-size: 45px;
        }
        .num {
          font-size: 40px;
        }
      }
    }
  }
}
</style>
<style lang="css">
.toasted-container.top-center .random-draw-toast {
  left: 140px;
}
</style>
