<template>
  <section class="timetable-basicinfo">
    <div class="h3-tit mt-00">
      <h3>수업 요일 </h3>
      <p class="smr">수업 요일을 선택해 주세요.</p>
    </div>
    <div class="con">
      <div class="days">
        <input type="checkbox" id="check-btn1" name="radio1" class="btn-type" checked>
        <label for="check-btn1"><span>월</span></label>
        <input type="checkbox" id="check-btn2" name="radio1" class="btn-type">
        <label for="check-btn2"><span>화</span></label>
        <input type="checkbox" id="check-btn3" name="radio1" class="btn-type">
        <label for="check-btn3"><span>수</span></label>
        <input type="checkbox" id="check-btn4" name="radio1" class="btn-type">
        <label for="check-btn4"><span>목</span></label>
        <input type="checkbox" id="check-btn5" name="radio1" class="btn-type">
        <label for="check-btn5"><span>금</span></label>
        <input type="checkbox" id="check-btn6" name="radio1" class="btn-type">
        <label for="check-btn6"><span>토</span></label>
        <input type="checkbox" id="check-btn7" name="radio1" class="btn-type">
        <label for="check-btn7"><span>일</span></label>
      </div>      
    </div>
    <div class="h3-tit">
      <h3>최대 교시 </h3>
      <p class="smr">주간 수업 중 최대 교시를 선택해 주세요.</p>
    </div>
    <div class="con">
      <HiSelectBox 
        class="lg" 
        :value="maxPeriodSelected"
        :items="maxPeriodItems"
        @update:value="maxPeriodSelected = $event"
        :empty-title="maxPeriodSelected"        
      />  
    </div>
    <div class="h3-tit">
      <h3>시작 교시 설정 </h3>
      <p class="smr">우리 학교의 시작 교시를 설정해 주세요.</p>
    </div>
    <div class="con">
      <HiSelectBox  
        class="lg" 
        :value="startPeriodSelected"
        :items="startPeriodItems"
        @update:value="startPeriodSelected = $event"
        :empty-title="startPeriodSelected"        
      />  
    </div>
    <div class="h3-tit">
      <h3>학년/반 설정 </h3>
      <p class="smr">우리 학교의 학년/반을 설정해 주세요.</p>
    </div>
    <div class="con">
      <HiSelectBox  
        class="lg" 
        :value="gradeSelected"
        :items="gradeItems"
        @update:value="gradeSelected = $event"
        :empty-title="gradeSelected"        
      />  
      <button class="btn btn-tertiary-blue btn-xl ml-10" @click="GradeClassEditor = true">학년/반 이름 변경</button>
    </div>
    <div class="grade-count">
      <div
        class="hi-row"
        v-for="(grade, idx) in classInfo"
        :key="'grade-' + idx"
      >
        <div class="col-sm-4 form-group">
          <label>{{ grade.grade }}</label>
          <div class="form-ctr">
            <input
              class="lg"
              type="number"
              v-model.number="grade.classes"
              placeholder="학급수 등록 (숫자만 입력)"
              :class="{ 'error': true }"
            />
          </div>
          <small class="txt-warning" v-if="true">학급 수를 입력하세요.</small>
        </div>
        <div class="col-sm-4 form-group" >
          <label>가상학급</label>
          <div class="form-ctr">
            <input
              class="lg"
              type="number"
              v-model.number="grade.virtualClasses"
              placeholder="선택사항(숫자만 입력)"
              :class="{ 'error': false }"
            />
          </div>
          <small class="txt-warning" v-if="false">학급 수를 입력하세요.</small>
        </div>
      </div>
    </div>
    <TimeTableModal size="lg" @close="GradeClassEditor = false" v-if="GradeClassEditor">
      <template v-slot:heading>
        학년/반 이름 변경
        <p class="smr">시간표에 표기되는 학년/반 명 수정을 할 수 있습니다.최대 5자까지 입력 가능합니다.<br>
        학년/반은 자동으로 표기되므로 실제 사용할 명칭만 입력하세요. (예: [입력]예비 → [표기]예비학년 / [입력]관광경영 → [표기]관광경영반)</p>
      </template>
      <template v-slot:content>
        <div class="table-content table-form sticky-wrap">
          <table>
            <caption>학년 반 리스트</caption>
            <colgroup>
              <col style="width:102px">
              <col v-for="n in maxClasses" :key="'col-class-' + n" style="width:104px">
              <col v-for="n in maxVirtualClasses" :key="'col-virtual-' + n" style="width:104px">
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="sticky-top sticky-left">학년</th>
                <th v-for="n in maxClasses" :key="'class-header-' + n" class="sticky-top">학급명({{ n }})</th>
                <th v-for="n in maxVirtualClasses" :key="'virtual-header-' + n" class="sticky-top">가상학급({{ n }})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(grade, gIdx) in classInfo" :key="'row-' + gIdx">
                <td class="sticky-left">
                  <div class="input-wrap">
                    <input type="text" v-model="grade.grade" />
                  </div>
                </td>

                <!-- 실제 학급 -->
                <td v-for="n in maxClasses" :key="'class-' + gIdx + '-' + n">
                  <div class="input-wrap">
                    <input
                      type="text"
                      :value="grade.classNames && grade.classNames[n - 1]"
                      @input="updateClassName($event.target.value, gIdx, n - 1)"
                      :placeholder="n <= grade.classes ? (n + '반') : ''"
                      :disabled="n > grade.classes"
                    />
                  </div>
                </td>

                <!-- 가상 학급 -->
                <td v-for="n in maxVirtualClasses" :key="'virtual-' + gIdx + '-' + n">
                  <div class="input-wrap">
                    <input
                      type="text"
                      :value="grade.virtualClassNames && grade.virtualClassNames[n - 1]"
                      @input="updateVirtualClassName($event.target.value, gIdx, n - 1)"
                      :placeholder="n <= grade.virtualClasses ? ('가상 ' + n + '반') : ''"
                      :disabled="n > grade.virtualClasses"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>  
      </template>
    </TimeTableModal>
  </section>
</template>
<script>
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
export default {
  data() {
    return {
      maxPeriodSelected: "7교시",
      startPeriodSelected: "1교시",
      gradeSelected: "3학년",
      maxPeriodItems: [
        { value: '1교시', title: '1교시' },
        { value: '2교시', title: '2교시' },
        { value: '3교시', title: '3교시' },
        { value: '4교시', title: '4교시' },
        { value: '5교시', title: '5교시' },
        { value: '6교시', title: '6교시' },
        { value: '7교시', title: '7교시' },
        { value: '8교시', title: '8교시' },
        { value: '9교시', title: '9교시' },
        { value: '10교시', title: '10교시' },
      ],
      startPeriodItems: [
        { value: '0교시', title: '0교시' },
        { value: '1교시', title: '1교시' },
      ],
      gradeItems: [
        { value: '1학년', title: '1학년' },
        { value: '2학년', title: '2학년' },
        { value: '3학년', title: '3학년' },
        { value: '4학년', title: '4학년' },
        { value: '5학년', title: '5학년' },
        { value: '6학년', title: '6학년' },
        { value: '7학년', title: '7학년' },
        { value: '8학년', title: '8학년' },
        { value: '9학년', title: '9학년' },
        { value: '10학년', title: '10학년' },
        { value: '11학년', title: '11학년' },
        { value: '12학년', title: '12학년' },
      ],
      GradeClassEditor: false,
      classInfo: [
        {
          grade: '1학년',
          classes: '',
          virtualClasses: 10,
        },
        {
          grade: '2학년',
          classes: 12,
          virtualClasses: 12,
        },
        {
          grade: '3학년',
          classes: 13,
          virtualClasses: 13,
        }
      ],
    };
  },
  components: {
    TimeTableModal
  },
  computed: {
    maxClasses() {
      return Math.max(...this.classInfo.map(g => g.classes || 0));
    },
    maxVirtualClasses() {
      return Math.max(...this.classInfo.map(g => g.virtualClasses || 0));
    }
  },
  methods: {
    updateClassName(value, gradeIndex, index) {
      const grade = this.classInfo[gradeIndex];
      if (!grade.classNames) {
        this.$set(grade, 'classNames', []);
      }
      this.$set(grade.classNames, index, value);
    },
    updateVirtualClassName(value, gradeIndex, index) {
      const grade = this.classInfo[gradeIndex];
      if (!grade.virtualClassNames) {
        this.$set(grade, 'virtualClassNames', []);
      }
      this.$set(grade.virtualClassNames, index, value);
    }
  }
}
</script>

<style lang="scss" scoped>
.timetable-basicinfo{  
  border: 1px solid var(--Line-Gray-07);
  border-radius: 16px;
  padding: 40px;
  .days{
    display: flex;
    gap: 20px;    
  }
  .hi-selectbox{
    width:360px;
  }
  .grade-count{
    margin-top: 20px;
    border-radius: 8px;
    background: var(--gray-01);
    padding:40px;
    .hi-row{
      align-items: flex-start;
      & + .hi-row{
        margin-top: 16px;
      }
    }
    .form-group{
      margin-bottom: 20px;
      position: relative;
      small{
        position: absolute;
        top: calc(100% + 5px);
      }
      &.form-group + .form-group {
        margin-top: 0px;
      }
    }    
  }
}
</style>