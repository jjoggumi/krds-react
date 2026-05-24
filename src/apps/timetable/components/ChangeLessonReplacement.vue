<template>
  <div>
    <!-- 교사선택  -->        
    <div class="form-group-inline">
      <label class="sm">교사 선택</label>                       
      <AutocompleteInputWithValue
        v-model="selectedTeacherName"
        :options="teacherList"
        placeholder="선택"
        nodata="일치하는 교사가 없습니다."    
        class="sm"
        :on-remove-value="() => {}"
        :on-update="handleSelectTeacher"
        :is-error="false"
      />
    </div>
    <!-- 교사 미선택 nodata --> 
    <div class="hi-nodata" v-if="false">
      <p>교사를 선택하세요.</p>
    </div>

    <div class="course-change" v-if="showTimetableToSelect">
      <!-- 선택 교사 시간표 -->
       <div class="table-content sm time-table table-form mt-20">
        <table>
          <caption>시간표</caption>
          <colgroup>
            <col style="width: 2.5%;" />
            <col v-for="dIdx in selectedLessonDays.length" :style="`width: ${lessonDaysColWidth}`" :key="`day-index-${dIdx}`" />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th v-for="d in selectedLessonDays" :key="`d-datetitle-${d.lessonDate}`">{{ readableLessonDay(d) }}</th>              
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="th">1</td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="class-name">2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="class-name"><span class="badge change">교체</span>2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                  </div>
                  <div class="class-name">2-1</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td>
                <button type="button"
                  data-consecutive-id="group1"
                  @mouseenter="hoveredId = 'group1'"
                  @mouseleave="hoveredId = null"
                  :class="{ hovered: hoveredId === 'group1'}"
                  class="btn-table-cell consecutive-course fst"
                >
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                    <span class="badge fixed">고정</span>
                  </div>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td>
                <button
                  v-if="selectedCourseTemp.course && !selectedCourseTemp.isOpen"
                  class="btn-table-cell additional"
                >
                  <div class="class-name">{{selectedCourseTemp.gradeClass}}</div>
                  <div class="course-name">{{selectedCourseTemp.course}}</div>
                  <i @click.stop="selectedCourseTemp.course = ''" />
                </button>
                <AutocompleteInput
                  v-else
                  v-model="selectedCourseTemp.course"
                  :options="courseList.map(item => item.course)"
                  placeholder=""
                  @list-open="selectedCourseTemp.isOpen = true"
                  @list-close="selectedCourseTemp.isOpen = false"
                  class="sm"
                >
                  <template #custom-option="{ items, selectItem }">
                    <div class="item"
                      v-for="(item, idx) in displayList(items)"
                      :key="idx"
                      @mousedown.prevent="
                      selectItem(item.course);
                      selectedCourseTemp.gradeClass = item.gradeClass;"
                    >
                      {{ item.gradeClass }} {{ item.course }} 
                    </div>
                    <div v-if="items.length === 0" class="hi-nodata sm p-00">
                      <p>검색 결과가 없습니다.</p>
                    </div>
                  </template>
                </AutocompleteInput>
              </td>                  
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <button type="button" class="btn-table-cell" disabled>
                  <div class="class-name">2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell" disabled>
                  <div class="class-name"><span class="badge change">교체</span>2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell" disabled>
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                  </div>
                  <div class="class-name">2-1</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell consecutive-course fst" disabled>
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                    <span class="badge fixed">고정</span>
                  </div>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
            </tr>
            <tr>
              <td class="th">2</td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <button type="button" 
                  data-consecutive-id="group1"
                  @mouseenter="hoveredId = 'group1'"
                  @mouseleave="hoveredId = null"
                  :class="{ hovered: hoveredId === 'group1'}"
                  class="btn-table-cell consecutive-course"
                >
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td> 
                <button type="button" class="btn-table-cell" disabled>
                </button>
              </td>
              <td> 
                <button type="button" class="btn-table-cell" disabled>
                </button>
              </td>
              <td>          
                <button type="button" class="btn-table-cell" disabled>
                </button>
              </td>
              <td>                    
                <button type="button" class="btn-table-cell consecutive-course" disabled>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
            </tr>                
            <tr>
              <td class="th">3</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>          
      
      <div class="table-content sm time-table table-form mt-20">
        <table>
          <caption>시간표</caption>
          <colgroup>
            <col style="width: 2.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
            <col style="width: 6.5%;" />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>3/4(월)</th>
              <th>3/5(화)</th>
              <th>3/6(수)</th>
              <th>3/7(목)</th>
              <th>3/8(금)</th>
              <th>3/11(월)</th>
              <th>3/12(화)</th>
              <th>3/13(수)</th>
              <th>3/14(목)</th>
              <th>3/15(금)</th>
              <th>3/18(월)</th>
              <th>3/19(화)</th>
              <th>3/20(수)</th>
              <th>3/21(목)</th>
              <th>3/22(금)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="th">1</td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="class-name">2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="class-name"><span class="badge change">교체</span>2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell">
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                  </div>
                  <div class="class-name">2-1</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td>
                <button type="button"
                  data-consecutive-id="group1"
                  @mouseenter="hoveredId = 'group1'"
                  @mouseleave="hoveredId = null"
                  :class="{ hovered: hoveredId === 'group1'}"
                  class="btn-table-cell consecutive-course fst"
                >
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                    <span class="badge fixed">고정</span>
                  </div>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td>
                <button
                  v-if="selectedCourseTemp.course && !selectedCourseTemp.isOpen"
                  class="btn-table-cell additional"
                >
                  <div class="class-name">{{selectedCourseTemp.gradeClass}}</div>
                  <div class="course-name">{{selectedCourseTemp.course}}</div>
                  <i @click.stop="selectedCourseTemp.course = ''" />
                </button>
                <AutocompleteInput
                  v-else
                  v-model="selectedCourseTemp.course"
                  :options="courseList.map(item => item.course)"
                  placeholder=""
                  @list-open="selectedCourseTemp.isOpen = true"
                  @list-close="selectedCourseTemp.isOpen = false"
                  class="sm"
                >
                  <template #custom-option="{ items, selectItem }">
                    <div class="item"
                      v-for="(item, idx) in displayList(items)"
                      :key="idx"
                      @mousedown.prevent="
                      selectItem(item.course);
                      selectedCourseTemp.gradeClass = item.gradeClass;"
                    >
                      {{ item.gradeClass }} {{ item.course }} 
                    </div>
                    <div v-if="items.length === 0" class="hi-nodata sm p-00">
                      <p>검색 결과가 없습니다.</p>
                    </div>
                  </template>
                </AutocompleteInput>
              </td>                  
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <button type="button" class="btn-table-cell" disabled>
                  <div class="class-name">2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell" disabled>
                  <div class="class-name"><span class="badge change">교체</span>2-3</div>
                  <div class="course-name">사문탐</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell" disabled>
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                  </div>
                  <div class="class-name">2-1</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td>
                <button type="button" class="btn-table-cell consecutive-course fst" disabled>
                  <div class="badges">
                    <span class="badge concurrent">동시</span>
                    <span class="badge fixed">고정</span>
                  </div>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
            </tr>
            <tr>
              <td class="th">2</td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <button type="button" 
                  data-consecutive-id="group1"
                  @mouseenter="hoveredId = 'group1'"
                  @mouseleave="hoveredId = null"
                  :class="{ hovered: hoveredId === 'group1'}"
                  class="btn-table-cell consecutive-course"
                >
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td> 
                <button type="button" class="btn-table-cell" disabled>
                </button>
              </td>
              <td> 
                <button type="button" class="btn-table-cell" disabled>
                </button>
              </td>
              <td>          
                <button type="button" class="btn-table-cell" disabled>
                </button>
              </td>
              <td>                    
                <button type="button" class="btn-table-cell consecutive-course" disabled>
                  <div class="class-name">2-4</div>
                  <div class="course-name">공통사회</div>
                </button>
              </td>
              <td></td>
            </tr>                
            <tr>
              <td class="th">3</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>          
      <div class="gray-box mt-20">
        <div class="tb-row">
          <div class="tb-col">
            <div class="table-content sm time-table">
              <div class="h5-tit mb-10">
                <h5>김미선 선생님 <i  class="divider"></i> <p class="txt-primary">통과</p></h5>
              </div>
              <table class="teacher-view">
                <caption>시간표</caption>
                <colgroup>
                <col style="width: 5%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th>3/4(월)</th>
                    <th>3/5(화)</th>
                    <th>3/6(수)</th>
                    <th>3/7(목)</th>
                    <th>3/8(금)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="th">1</td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td></td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                        </div>
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>                        
                      <button type="button" class="btn-table-cell consecutive-course fst">
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                        </div>
                        <div class="class-name">2-4</div>
                        <div class="course-name">공통사회</div>
                      </button>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="th">2</td>
                    <td></td>
                    <td>
                      <button type="button" class="btn-table-cell assign-before">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                    </td>
                    <td>                        
                      <button type="button" class="btn-table-cell consecutive-course">
                        <div class="class-name">2-4</div>
                        <div class="course-name">공통사회</div>
                      </button>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>   
          </div>
          <div class="tb-col">              
            <div class="table-content sm time-table">
              <div class="h5-tit mb-10">
                <h5>김창운 선생님 (담임 2-2)</h5>
              </div>
              <table class="teacher-view">
                <caption>시간표</caption>
                <colgroup>
                <col style="width: 5%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                <col style="width: 19%;" />
                </colgroup>
                <thead>
                  <tr>
                    <th></th>
                    <th>3/4(월)</th>
                    <th>3/5(화)</th>
                    <th>3/6(수)</th>
                    <th>3/7(목)</th>
                    <th>3/8(금)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="th">1</td>
                    <td>             
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">수학</div>
                        <div class="course-name">박재군</div>
                      </button>
                    </td>
                    <td>        
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">수학</div>
                        <div class="course-name">박재군</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">영어</div>
                        <div class="course-name">최무선</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">도덕</div>
                        <div class="course-name">강명현</div>
                      </button>
                    </td>
                    <td>                  
                      <button type="button" class="btn-table-cell consecutive-course fst">
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                        </div>
                        <div class="class-name">A고전문학</div>
                        <div class="course-name">이민정</div>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">2</td>
                    <td>             
                      <button type="button" class="btn-table-cell no-course">
                        <div class="course-name">수업없음</div>
                      </button>
                    </td>
                    <td>        
                      <button type="button" class="btn-table-cell assign-after">
                        <div class="class-name"><span class="badge change">변경</span>사문탐</div>
                        <div class="course-name">무영숙</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">컴퓨터</div>
                        <div class="course-name">한지민</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">영어</div>
                        <div class="course-name">최무선</div>
                      </button>
                    </td>
                    <td>                  
                      <button type="button" class="btn-table-cell consecutive-course">
                        <div class="class-name">A고전문학</div>
                        <div class="course-name">이민정</div>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> 
          </div>
        </div>
      </div>
    </div>

    <!-- 변경 사유 -->
    <div class="form-group-inline mt-20">
      <label  class="sm">변경 사유</label>   
      <input type="text" class="sm w100" disabled placeholder="선택사항 (최대 50자)" spellcheck="false" />           
    </div>   

  </div>
</template>

<script lang="ts" setup>

import { computed, ref, inject, onMounted } from 'vue';
import "@/assets/css/timetable/common.scss"; // 공통 스타일
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
import AutocompleteInputWithValue from '@/apps/timetable/components/AutocompleteInputWithValue.vue';
import { ContextKeys, TeacherCourseContext, TimetableClassContext, TimetableCourseContext, TimetableGradeContext, TimetableTeacherContext } from '../contexts';
import { Class, Course, DailyLesson, TeacherCourse } from '../core/types';
import { TimetableDataUtils } from '../core/mod/utils';
import { ClassDayStatus, DAYS_OF_WEEK } from '../common/constants';
import { ActivateWeekday, EmbeddedListResponse, LessonDay } from '../common/types';
import { TimeUtils } from '../common/utils';
import { Timetables } from '@/apis/Timetables';
import TimetableIndex from '../pages/TimetableIndex.vue';

const props = defineProps<{
  timetableId: string | null;
}>();

const gradeContext = inject(ContextKeys.Grade) as TimetableGradeContext;
const classContext = inject(ContextKeys.Class) as TimetableClassContext;
const courseContext = inject(ContextKeys.Course) as TimetableCourseContext;
const teacherContext = inject(ContextKeys.Teacher) as TimetableTeacherContext;
const teacherCourseContext = inject(ContextKeys.TeacherCourse) as TeacherCourseContext;

const selectedDate = ref<number|null>(null);
const selectedTeacherName = ref<string>('');
const selectedTeacherId = ref<string | null>(null);
const selectedLessonToChange = ref<string | null>(null);

const showTimetableToSelect = computed(() => {
  return selectedTeacherId.value !== null;
});

const showTimetableToPreview = computed(() => {
  return selectedTeacherId.value !== null && selectedLessonToChange.value !== null;
});

const classMap = computed(() => classContext.classMap || ({} as Record<string, Class>));
const courseMap = computed(() => courseContext.courseMap || ({} as Record<string, Course>));
const gradeNameMap = computed(() => gradeContext.gradeNameMap || ({} as Record<number, string>));
const teacherCourseMap = computed(() => {
  return teacherCourseContext.teacherCourseMap || ({} as Record<string, TeacherCourse[]>);
});

const activatedClassDays = computed(() => {  
  return gradeContext.timetableConfig.classDays.map((isActive, index) => {
    return {
      dayOfWeek: index,
      title: DAYS_OF_WEEK.find(day => day.index === index)?.title,
      isActive: isActive === ClassDayStatus.ACTIVATED,
    } as ActivateWeekday;
  }).filter(day => day.isActive);
});

const selectedLessonDays = computed(() => {
  if (!selectedDate.value) {
    return [];
  }
  
  const weeks = 3; // 3주 만큼 기본
  const lessonDays = TimeUtils.generateLessonDays(selectedDate.value, weeks);
  
  return lessonDays.filter(lessonDay => {
    const dayOfWeek = lessonDay.dayOfWeek;
    return activatedClassDays.value.some(activatedDay => activatedDay.dayOfWeek === dayOfWeek);
  });
});

const selectedFirstLessonDay = computed(() => {
  if (selectedLessonDays.value.length > 0) {
    return selectedLessonDays.value[0];
  }
  return null;
}); 

const selectedLastLessonDay = computed(() => {
  if (selectedLessonDays.value.length > 0) {
    return selectedLessonDays.value[selectedLessonDays.value.length - 1];
  }
  return null;
});

const lessonDaysColWidth = computed(() => {
  const headerColumnWitdth = 2.5; // 첫번째 열의 너비
  const colWidth = (100 - headerColumnWitdth) / selectedLessonDays.value.length;
  return `${colWidth}%`;
});

const readableLessonDay = (lessonDay: LessonDay) => {
  //  년도 제거
  const monthAndDay = lessonDay.lessonDate % 10000;
  // 월과 일을 분리
  const month = Math.floor(monthAndDay / 100);
  const day = monthAndDay % 100;

  // 요일 제목 가져오기
  const dayOfWeekTitle = DAYS_OF_WEEK.find(day => day.index === lessonDay.dayOfWeek)?.title || '';
  
  return `${month}/${day}(${dayOfWeekTitle})`;
};

onMounted(() => {
  if(!selectedDate.value) {
    const currentDate = TimeUtils.getTodayAsNumber();
    selectedDate.value = currentDate
  }
  initData();
});

const initData = async () => {
  // await teacherContext.reload();
  // console.log('teacherContext', teacherContext.teachers);
  // console.log('activatedClassDays', activatedClassDays.value);
};

const teacherList = computed(() => {
  const isEmpty =
    Object.keys(teacherCourseMap.value).length === 0 ||
    Object.keys(courseMap.value).length === 0;

  if (isEmpty) {
    return [];
  }

  return teacherContext.teachers.map((teacher) => {

    let className = '';
    if (teacher.classId && classMap.value[teacher.classId]) {
      const cls = classMap.value[teacher.classId];
      className = `${gradeNameMap.value[cls.grade]} ${cls.className}`;
    }

    const courses = (teacherCourseMap.value[teacher.teacherId] || []).map(
      ({ courseId }) => courseMap.value[courseId]
    ) as Course[];

    const courseNames = TimetableDataUtils.courseNames(courses)
      .sort()
      .join(', ');

    const text = `${teacher.teacherName} ${courseNames ? courseNames : ''}`;

    return {
      text,
      value: teacher.teacherId,
      // text: `${teacher.teacherName} (${courseNames})`,
      options: {}
    };
  })
  .sort((a, b) => a.text.localeCompare(b.text));
});

const fetchDailyLessons = async () => {

  if(props.timetableId === null || !selectedFirstLessonDay.value || !selectedLastLessonDay.value) {
    console.warn('fetchDailyLessons: timetableId or lesson days are not set', props.timetableId, selectedFirstLessonDay.value, selectedLastLessonDay.value);
    return;
  }

  const api = new Timetables();

  const { lessonDate: startLessonDate } = selectedFirstLessonDay.value;
  const { lessonDate: endLessonDate } = selectedLastLessonDay.value;

  const query = {
    teacherId: selectedTeacherId.value ? selectedTeacherId.value : undefined,
  }

  const res = await api.getTimetableDailyLessonsBetweenDatesStartDateEndDate(
    props.timetableId,
    startLessonDate,
    endLessonDate,
    query
  );

  const { dailyLessons } = (res.data as EmbeddedListResponse<DailyLesson[]>)._embedded;
  // console.log('fetchDailyLessons', dailyLessons);
};

const handleSelectTeacher = async (teacherId: string) => {
  // selectedTeacherId.value = teacherId;
  // selectedLessonToChange.value = null; // Reset lesson selection when teacher changes
  // console.log('Selected Teacher ID:', teacherId);  
  selectedTeacherId.value = teacherId;

  await fetchDailyLessons();
};

const selectedCourse = ref<Course|null>(null);
const courseList: Course[] = [];

// 퍼블리싱 코드 ----------------------------------->
// @TODO: 임시 타입 - 추후 변경
interface CourseOption {
  value: string;
  title: string;
}

// @TODO: 임시 타입 - 추후 변경
/*
interface Course {
  gradeClass: string;
  course: string;
  isOpen?: boolean;
}
*/

interface CourseTemp {
  gradeClass: string;
  course: string;
  isOpen?: boolean;
}
const selectedCourseTemp = ref<CourseTemp>({ gradeClass: '1-1', course: '사문탐', isOpen: true });
const courseTempList: CourseTemp[] = [
  { gradeClass: '1-1', course: '사문탐' },
  { gradeClass: '2-1', course: '동사' },
  { gradeClass: '2-2', course: '사문탐' },
  { gradeClass: '2-3', course: '사문탐' }
];


const hoveredId = ref<number | string | null>(null);
/*
const teacherList: string[] = [
  '김선생(사문탐, 공통사회)',
  '이선생(수학)',
  '박선생(영어)',
  '최선생(체육)'
];
*/

const selectedCourseChange = ref<string>('');
const selectedGradeCourse = ref<string>('1-2 사문탐');
const gradeCourseList: CourseOption[] = [
  { value: '1', title: '1-2 사문탐' },
  { value: '2', title: '1-3 사문탐' },
  { value: '3', title: '1-4 사문탐' },
  { value: '4', title: '1-3 공통사회' }
];

const selectedChangeTime = ref<string>(
  '이정희 (3/2(수1) 2-1 국어), 박선영 (3/2(수1) 2-1 국어)'
);
const changeTimeList: CourseOption[] = [
  { value: '1', title: '이정희 (3/2(수1) 2-1 국어), 박선영 (3/2(수1) 2-1 국어)' },
  { value: '2', title: '김민수 (3/2(수2) 2-2 수학), 이서영 (3/2(수2) 2-2 수학)' },
  { value: '3', title: '장수민 (3/2(수3) 2-3 영어), 최영호 (3/2(수3) 2-3 영어)' },
  { value: '4', title: '이상현 (3/2(수4) 2-4 과학), 박지은 (3/2(수4) 2-4 과학)' }
];

/*
const selectedCourse = ref<Course>({ gradeClass: '1-1', course: '사문탐', isOpen: true });

const courseList: Course[] = [
  { gradeClass: '1-1', course: '사문탐' },
  { gradeClass: '2-1', course: '동사' },
  { gradeClass: '2-2', course: '사문탐' },
  { gradeClass: '2-3', course: '사문탐' }
];
*/

function displayList(filteredStrings: string[]): CourseTemp[] {
  return courseTempList.filter(item => filteredStrings.includes(item.course));
}

</script>

<style scoped lang="scss">
// 수업 변경
.course-change{
  .additional{
    background: #E9F3FF;
  }
  .autocomplete-wrap ::v-deep{
    .input-wrap{
      input{
        font-size: 14px;
        &:hover:not(:disabled){
          background-color: #FFF8DF;
          box-shadow: none;
        }
        &:focus:not(:disabled){
          background-color: #FFF8DF;
          box-shadow: 0 0 0 1px #FACE34;
        }
      }
    }
    .autocomplete-list{
      width: 200px;
      height: 192px;
    }
  }
  .tb-row{
    flex-wrap: nowrap;
    justify-content: center;
    .tb-col{
      width: 100%;
      padding: 10px 20px;
      max-width: 570px;
    }
  } 
}

.form-group-inline{
  > label.sm{
    min-width: 100px;
  }
  .hi-selectbox,
  .autocomplete-wrap{
    max-width: 320px;
    width: 100%;
  }
}
::v-deep .side-modal-cont{
  > .hi-nodata{
    height: 280px;
    border-radius: 12px;
    border: 1px solid var(--gray-07);
    margin: 30px 0 ;
  }
} 
.h4-tit{
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #D6D6D6;
  padding-bottom: 20px
}
</style>
