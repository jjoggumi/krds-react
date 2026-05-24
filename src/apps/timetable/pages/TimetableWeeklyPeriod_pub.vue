<template>
  <section class="tt-weekly-period">
    <div class="table-head">
      <div class="btn-area">
        <button type="button" class="btn btn-tertiary-blue btn-lg" @click="isTimeEditor = true">
          일과 시간 변경
        </button>
      </div>
      <div class="btn-area">
        <button type="button"
          class="btn btn-primary btn-lg"
          :disabled="selectedCells.length === 0"
          @click="setNoLesson">수업 없음 설정
        </button>
        <button type="button" 
          class="btn btn-primary btn-lg ml-10" 
          :disabled="selectedCells.length === 0" 
          @click="isCommonSubject = true">공통 과목 배정
        </button>
      </div>
    </div>
    <div class="tb-row">
      <div class="tb-col">
        <div class="table-content time-table">
          <div class="h4-tit">
            <h4>1학년 <i class="divider" /> 8학급 (기상:1)</h4>
            <p class="period"><i class="ico ico-clock ico-primary" />시수 35</p>
          </div>
          <table>
            <caption>시수 조정 시간표</caption>
            <colgroup>
              <col style="width:30%">
              <col style="width:14%">
              <col style="width:14%">
              <col style="width:14%">
              <col style="width:14%">
              <col style="width:14%">
            </colgroup>
            <thead>
              <tr>
                <th scope="col">교시</th>
                <th scope="col">월</th>
                <th scope="col">화</th>
                <th scope="col">수</th>
                <th scope="col">목</th>
                <th scope="col">금</th>
              </tr>
            </thead>
            <tbody is="draggable" v-model="periods" v-bind="dragOptions" :group="periods" handle=".drag-handle" tag="tbody" @start="" @end="">         
              <tr v-for="(period, pIndex) in periods" :key="pIndex">
                <!-- 점심시간이면 colspan 처리 -->
                <template v-if="period.isLunch">
                  <td :colspan="days.length + 1" class="lunch-time drag-handle">
                    {{ period.label }}
                    <button type="button" class="btn btn-link btn-help" :class="{ 'help-on': helpOn === 1 }" @click="openHelp(1)">
                      <span class="sr-only">도움말</span>
                    </button>
                    ({{ period.time }})
                  </td>
                </template>

                <template v-else>
                  <!-- 교시 정보 -->
                  <td class="th" scope="row" >
                    {{ period.label }} ({{ period.time }})
                  </td>
                  <!-- 요일별 버튼 -->
                  <td v-for="(day, dIndex) in days" :key="dIndex">
                    <button
                      type="button"
                      class="btn btn-table-cell"
                      :class="{
                        'no-lesson': timeTable[pIndex]?.[dIndex] === '수업없음',
                        'common-subject': timeTable[pIndex]?.[dIndex] !== '수업없음' &&  timeTable[pIndex]?.[dIndex] !== '',
                        'selected': isSelectedCell(pIndex, dIndex)
                      }"
                      @click="onCellClick(pIndex, dIndex)"
                    >
                      <span v-if="timeTable[pIndex]?.[dIndex] === ''" class="sr-only">시수</span>
                      <span v-else>{{ timeTable[pIndex]?.[dIndex]}}</span>
                    </button>                
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
    <!-- 공통과목 등록 모달 -->
    <TimeTableModal v-if="isCommonSubject" size="xs" @close="isCommonSubject = false" class="common-subject-modal">
      <template v-slot:heading>
        공통과목 등록
        <p class="smr">
          각 학년별 공통과목을 배정합니다. <br>교사에게 시수를 줄 수 없는 경우에만 사용합니다.
        </p>
      </template>
      <template v-slot:content>
        <div class="gray-box">
          <div class="form-group-inline">
            <label class="sm">과목명</label>
            <div class="form-ctr">            
              <AutocompleteInput
                v-model="commonSubject"
                :options="subjectList"
                placeholder="창체, 자율..."
                nodata="일치하는 과목이 없습니다."
                :isError="false"
              />
            </div>
          </div>
          <small class="txt-warning ml-40 pl-10 mt-10" v-if="false">과목명을 입력해주세요.</small>
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isCommonSubject = false">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">확인</button>
      </template>
    </TimeTableModal>
    <!-- 일과 시간 변경 모달 -->
    <TimeTableModal v-if="isTimeEditor" size="sm" @close="isTimeEditor = false" class="time-editor-modal">
      <template v-slot:heading>
        일과 시간 변경
        <p class="smr">
          시간표에 표기되는 일과시간을 수정할 수 있습니다. 
        </p>
      </template>
      <template v-slot:content>
        <div class="gray-box">          
          <div class="form-group-inline">
            <label>
              시작 교시
            </label>
            <div class="form-ctr">
              <HiSelectBox           
                class="sm"
                :value="firstTime"
                :items="firstTimeOptions"
                @update:value="firstTime = $event"
              /> 
            </div> 
          </div>
        </div>
        <div class="gray-box">
          <div class="form-group-inline mb-20">
            <div class="form-ctr">
              <input type="checkbox" id="1" />
              <label for="1">
                <span>
                  일과 설정
                </span>
              </label>
              <p class="desc">시간표에 일과시간을 표기합니다. 표기를 원하지 않으시면 체크를 해제해 주세요.</p>
            </div>
          </div>
          <div class="hi-row ml-05 mb-20 sub">
            <div class="form-group-inline col-sm-12">
              <label class="sm">수업 시작</label>
              <div class="form-ctr">
                <HiSelectBox
                  class="xs"
                  :value="startTime"
                  :items="startTimeOptions"
                  @update:value="startTime = $event"
                /> : 
                <HiSelectBox                
                  class="xs"
                  :value="startMinute"
                  :items="startMinuteOptions"
                  @update:value="startMinute = $event"
                />
              </div> 
            </div>
            <div class="form-group-inline col-sm-6">
              <label class="sm">수업 시간</label>
              <div class="form-ctr">
                <HiSelectBox                
                  class="sm"
                  :value="lessonTime"
                  :items="lessonTimeOptions"
                  @update:value="lessonTime = $event"
                /> 
              </div> 
            </div>
            <div class="form-group-inline col-sm-6">
              <label class="sm">쉬는 시간</label>
              <div class="form-ctr">
                <HiSelectBox           
                  class="sm"
                  :value="breakTime"
                  :items="breakTimeOptions"
                  @update:value="breakTime = $event"
                /> 
              </div> 
            </div>          
          </div>          
        </div>
        <div class="gray-box">
          <div class="form-group-inline">
            <div class="label">
              <input type="checkbox" id="2" />
              <label for="2">
                <span>
                  점심시간
                </span>
              </label>
            </div>
            <div class="form-ctr">
              <HiSelectBox           
                class="sm opt-top"
                :value="lunchTime"
                :items="lunchTimeOptions"
                @update:value="lunchTime = $event"
              /> 
            </div> 
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isTimeEditor = false">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">확인</button>
      </template>
    </TimeTableModal>
  </section>
</template>

<script >
import draggable from 'vuedraggable'
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';

export default {
  data() {
    return {
      days: ['월', '화', '수', '목', '금'],
      periods: [
        { label: '1', time: '09:00~09:45', isLunch: false },
        { label: '2', time: '09:55~10:40', isLunch: false },
        { label: '3', time: '10:50~11:35', isLunch: false },
        { label: '4', time: '11:40~12:25', isLunch: false },
        { label: '점심', time: '12:25~13:25', isLunch: true },
        { label: '5', time: '13:25~14:10', isLunch: false },
        { label: '6', time: '14:20~15:05', isLunch: false },
        { label: '7', time: '15:15~16:50', isLunch: false }
      ],
      // 시수 버튼 상태 저장할 배열 (2차원 배열로 교시-요일별 상태를 저장)
      timeTable: [
        ['수업없음', 'qh', '수업없음', '', ''],
        ['', '', '', '', ''],
        ['', '수업없음', '', '', ''], 
        ['', '', '', '', ''], 
        // 점심시간 (null 처리)
        null,
        ['', '', '', '', ''], 
        ['봉사활동', '', '', '', ''], 
        ['(복)생활중국어', '', '', '', ''], 
      ],
      selectedCells: [],

      // 공통과목 모달
      isCommonSubject: false,
      commonSubject: '',
      subjectList: ['국어', '수학', '영어', '과학', '사회', '음악', '체육', '미술', '기술', '도덕', '과학탐구'],

      // 일과 시간 변경
      isTimeEditor: false,
      firstTime: '1교시',
      startTime: '09',
      startMinute: '00',
      lessonTime: '45',
      breakTime: '10',
      lunchTime: '50',
      //시작 교시
      firstTimeOptions: [
        { value: '0교시', title: '0교시' },
        { value: '1교시', title: '1교시' },
      ],
      //시작 시간 0~23시
      startTimeOptions: [
        { value: '08', title: '08' },
        { value: '09', title: '09' },
        { value: '10', title: '10' },
      ],
      //시작 분 0~59분(1분단위)
      startMinuteOptions: [
        { value: '00', title: '00' },
        { value: '10', title: '10' },
        { value: '20', title: '20' },
        { value: '30', title: '30' },
        { value: '40', title: '40' },
        { value: '50', title: '50' },
      ],
      // 수업시간 10 ~ 120분( 5분단윈)
      lessonTimeOptions: [
        { value: '30', title: '30분' },
        { value: '40', title: '40분' },
        { value: '45', title: '45분' },
        { value: '50', title: '50분' },
        { value: '60', title: '60분' },
      ],
      // 쉬는시간 0~60분(5분단위)
      breakTimeOptions: [
        { value: '5', title: '5분' },
        { value: '10', title: '10분' },
        { value: '15', title: '15분' },
        { value: '20', title: '20분' },
      ],
      // 점심시간 0~60분(5분단위)
      lunchTimeOptions: [
        { value: '30', title: '30분' },
        { value: '40', title: '40분' },
        { value: '50', title: '50분' },
        { value: '60', title: '60분' },
      ],
    };
  },
  components: {
    draggable, TimeTableModal, AutocompleteInput, HiSelectBox
  },
  props: {
    helpOn: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    onCellClick(row, col) {
      this.timeTable[row]?.[col] === ''
        ? this.toggleCellSelection(row, col)
        : this.$set(this.timeTable[row], col, '');
    },
    // 선택 토글
    toggleCellSelection(row, col) {
      const index = this.selectedCells.findIndex(
        (cell) => cell.row === row && cell.col === col
      );
      if (index === -1) {
        this.selectedCells.push({ row, col });
      } else {
        this.selectedCells.splice(index, 1);
      }
    },

    // 셀이 선택되었는지 확인
    isSelectedCell(row, col) {
      return this.selectedCells.some(
        (cell) => cell.row === row && cell.col === col
      );
    },

    // 수업 없음 설정
    setNoLesson() {
      this.selectedCells.forEach(({ row, col }) => {
        if (this.timeTable[row] && this.timeTable[row][col] !== undefined) {
          this.$set(this.timeTable[row], col, '수업없음');
        }
      });
      this.selectedCells = []; // 선택 초기화
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "table",
        disabled: false,
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag"
      };
    }
  },
};
</script>

<style lang="scss" scoped> 
.tt-weekly-period{
  .tb-row{
    container-type: inline-size;
    container-name: tb-container;
    display: flex;
    flex-wrap: wrap;
    margin:0 -1%;
    width: 100%;
    .tb-col{
      width:33.3%;
      padding: 1%;
    }
    @container tb-container (max-width: 1410px) {
      .tb-col{
        width: 50%;
      }
    }
    @container tb-container (max-width: 1060px) {
      .tb-col{
        width: 100%;
      }
    }
  }
  .common-subject-modal{
    ::v-deep .modal__content{
      height: 220px;
      .form-ctr{
        width: 100%;
        .autocomplete-list{
          max-height: 150px;
        }
      }
    }
  }
}
</style>
