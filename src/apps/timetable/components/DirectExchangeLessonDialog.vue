<template>
  <TimeTableModal size="lg" @close="" class="exchange-direct-modal">
    <template v-slot:heading>
      수업 변경(1:1교환)
      <p class="smr">
        1:1 교환에 대한 설명 어쩌고 저쩌고 서브 카피 작성 필요.
      </p>
    </template>
    <template v-slot:content>
      <div class="tb-row teacher-view"><!-- teacher-view : 수정 없는 테이블 뷰-->              
        <div class="tb-col">
          <div class="table-content time-table">
            <div class="h4-tit">
              <h4>박하린 선생님</h4>
              <p class="period"><i class="ico ico-list ico-primary" /> 통과</p>
            </div>
            <table>
              <caption>시간표</caption>
              <colgroup>
                <col style="width: 10%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th>월</th>
                  <th>화</th>
                  <th>수</th>
                  <th>목</th>
                  <th>금</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="th">1</td>
                  <td>
                    <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                      <div class="class-name">2-3</div>
                      <div class="course-name">통과</div>
                    </button>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell">
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">A고전읽기1</div>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="th">2</td>                    
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell consecutive-course fst"><!-- 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">A음3</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
                      <div class="class-name">2-3</div>
                      <div class="course-name">통과</div>
                    </button>
                  </td>
                  <td>                      
                    <button type="button" class="btn-table-cell">
                      <div class="class-name">2-5</div>
                      <div class="course-name">통과</div>
                    </button>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td class="th">3</td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell consecutive-course"><!-- 연속수업 class -->
                      <div class="class-name">1-1</div>
                      <div class="course-name">B영어</div>
                    </button>
                  </td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell">
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">B영어</div>
                    </button>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="tb-col">
          <div class="table-content time-table">
            <div class="h4-tit">
              <h4>백민서 선생님</h4>
              <p class="period"><i class="ico ico-list ico-primary" /> 통과</p>
            </div>
            <table>
              <caption>시간표</caption>
              <colgroup>
                <col style="width: 10%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
                <col style="width: 18%;" />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th>월</th>
                  <th>화</th>
                  <th>수</th>
                  <th>목</th>
                  <th>금</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="th">1</td>
                  <td></td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell">
                      <div class="class-name">2-3</div>
                      <div class="course-name">문매</div>
                    </button>
                  </td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell">
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">A고전읽기1</div>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="th">2</td>                    
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell consecutive-course fst"><!-- 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">A음3</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                      <div class="class-name">2-3</div>
                      <div class="course-name">영어</div>
                    </button>
                  </td>
                  <td>                      
                    <button type="button" class="btn-table-cell">
                      <div class="class-name">2-5</div>
                      <div class="course-name">통과</div>
                    </button>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td class="th">3</td>
                  <td>                      
                    <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
                      <div class="class-name">2-3</div>
                      <div class="course-name">영어</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell consecutive-course"><!-- 연속수업 class -->
                      <div class="class-name">1-1</div>
                      <div class="course-name">B영어</div>
                    </button>
                  </td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell">
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">B영어</div>
                    </button>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="">취소</button>
      <button type="button" class="btn btn-primary btn-lg" @click="">시간표 변경</button>
    </template>
  </TimeTableModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, getCurrentInstance } from 'vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';

</script>

<style scoped lang="scss">
// 수업 변경 (1:1교환) 모달
.exchange-direct-modal{
  .tb-row{
    display: flex;
    gap: 12px;
    .tb-col{
      width: calc(50% - 6px);
    }
  }
}

</style>