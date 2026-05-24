<template>
  <div class="tt-generate">
    <!-- 상단 버튼 영역 -->
    <div class="table-head type01">
      <div class="btn-area">
        <div class="form-check-inline">
          <input type="radio" name="showType" id="teacher" value="teacher" v-model="showType" />
          <label for="teacher"><span>교사별 시간표</span></label>
        </div>
        <div class="form-check-inline">
          <input type="radio" name="showType" id="class" value="class" v-model="showType" />
          <label for="class"><span>학급별 시간표</span></label>
        </div>
      </div>
      <div class="btn-area">
        <button type="button" @click="isTimetableResetModal=true" class="btn btn-line-warning btn-lg">시간표 초기화</button>
        <button type="button" @click="isHistoryModal=true" class="btn btn-tertiary-blue btn-lg ml-10">작업 내역 확인</button>
        <button type="button" @click="isSaveDraftModal=true" class="btn btn-tertiary-blue btn-lg ml-10">임시저장</button>
        <button type="button" @click="isGeneratingTimetableModal=true" class="btn btn-primary btn-lg ml-10">시간표 자동 배정</button>
      </div>
    </div>

    <!-- 교사별 시간표-->
    <div class="type-teacher" v-if="showType === 'teacher'">
      <!-- 교사별 시간표 좌측 탭 -->
      <div class="teacher-lnb">
        <div class="tab-nav">
          <button :class="{'active' : lnbTab==='teacher-list'}" @click="lnbTab='teacher-list'">교사목록</button>
          <button :class="{'active' : lnbTab==='generate'}" @click="lnbTab='generate'">자동생성 결과</button>
        </div> 
        <!-- 교사목록 -->
        <template v-if="lnbTab==='teacher-list'">
          <!-- 검색 -->
          <div class="filter-section">
            <button type="button" class="btn btn-tertiary btn-lg" @click="timeTableMode='list'">전체</button>
            <input type="text" placeholder="이름, 과목명">
            <button type="button" class="btn btn-link">
              <i class="ico ico-search ico-size-24" size="24" color="default"/>
            </button>
          </div>
          <!-- 교사목록 테이블 -->
          <div class="table-content basic-table">
            <table class="table">
              <caption>교사목록</caption>
              <colgroup>
                <col style="width: 50%;" />
                <col style="width: 50%;" />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    교사명(시수)
                    <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                  </th>
                  <th>
                    과목명
                    <button type="button" class="btn btn-link btn-sort"><span class="sr-only">정렬</span></button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr @click="timeTableMode = 'assign'"> <!-- flow 확인을 위한 클릭 이벤트  : 교사 선택 수동 배정 -->
                  <td>김서연(17)</td>
                  <td>국어</td>
                </tr>
                <tr :class="{'active' : false}"> <!-- 선택된 교사 목록 acclass -->
                  <td>백민서(14)</td>
                  <td>영어</td>
                </tr>
                <tr>
                  <td>이준서(11)</td>
                  <td>통과</td>
                </tr>
              </tbody>
            </table>
            <div class="btns">
              <button type="button" @click="isCourseEditModal=true" class="btn btn-primary btn-lg w100">수업 수정</button> 
              <button type="button" class="btn btn-link btn-help" :class="{'help-on' : true}" @click=""><span class="sr-only">도움말</span></button>
            </div>            
          </div>
        </template>    
        <!-- 자동생성 결과 -->   
        <template v-if="lnbTab==='generate'">       
          <ul class="generate-list" >   
            <li class="tit">
              배정 : 48 <i class="divider" /> 미배정 : <span class="txt-warning">3</span>
            </li>
            <li @click="timeTableMode = 'generate'">
              같은교사 같은 과목 중복 <span class="count">6</span>
            </li>
            <li>
              같은과목 다른교사 중복 <span class="count">3</span>
            </li>
            <li class="disabled"><!-- 비활성화 class -->
              같은과목 다른교사 중복 <span class="count">3</span>
            </li>
          </ul>  
          <div class="btns">
            <button type="button" @click="isTotalPeriodModal=true" class="btn btn-primary btn-lg w100">전체 시수표 보기</button>   
          </div>
        </template>       
      </div>
      <!-- 교사별 시간표 컨텐츠 -->
      <div class="teacher-content">

        <!-- 교사별 시간표 리스트 -->
        <div class="tb-row teacher-view" v-if="timeTableMode === 'list'"> <!-- teacher-view : 수정 없는 테이블 뷰-->              
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>교사별 (담임 1-1)</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 음악 음3 진로</p>
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
                    <td></td>
                    <td></td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course"><!-- 고정수업 class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                          <span class="badge joint">합반</span>
                        </div>
                        <div class="class-name">합반</div>
                        <div class="course-name">A고전읽기1</div>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">2</td>                    
                    <td></td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course  consecutive-course fst"><!-- 고정수업, 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="th">3</td>
                    <td></td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course consecutive-course"><!-- 고정, 연속수업 class -->
                        <div class="class-name">1-1</div>
                        <div class="course-name">B영어</div>
                      </button>
                    </td>
                    <td></td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course"><!-- 고정수업 class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
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

        <!-- 교사 선택 수동 배정 -->
        <div class="teacher-assign-wrap" v-if="timeTableMode === 'assign'"> 
          <!-- 교사 선택 수동 배정 테이블 -->
          <div class="table-content time-table teacher-assign"><!-- 교사 선택 수동 배정 class (teacher-assign) -->          
            <div class="h4-tit">
              <h4>수동배정 (담임 1-1)</h4>
              <p class="period"><i class="ico ico-list ico-primary" /> 음악 음3 진로</p>
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
                    <button type="button" class="btn-table-cell remove-course"><!-- 수업빼기 class -->
                      <div class="course-name">수업빼기</div>                      
                      <i class="ico ico-close ico-size-16" @click.stop="" />
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell"></button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell assign-resolved"><!-- 이미 배정된 교시 class -->
                      <div class="class-name">2-3</div>
                      <div class="course-name">수학</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell"></button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell fixed-course"><!-- 고정수업 class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                        <span class="badge joint">합반</span>
                      </div>
                      <div class="class-name">합반</div>
                      <div class="course-name">A고전읽기1</div>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="th">2</td>
                  <td>
                    <button type="button" class="btn-table-cell assign-complete"><!-- 배정 완료 교시 class -->
                      <div class="class-name">2-3</div>
                      <div class="course-name">국어</div>                         
                      <i class="ico ico-close ico-size-16" @click.stop="" />
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell fixed-course consecutive-course fst"><!-- 고정수업, 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">A음3</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell"></button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell assign-unavailable"><!-- 배정 불가 교시 class -->
                      <div class="course-name">배정불가</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" 
                      data-consecutive-id="group1"
                      @mouseenter="hoveredId = 'group1'"
                      @mouseleave="hoveredId = null"
                      :class="{ hovered: hoveredId === 'group1'}"
                      class="btn-table-cell consecutive-course fst assign-complete">
                      <!-- 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) & 배정 완료 일때 class & 연속 수업에 hover 필요시 date속성으로 그룹화 하여 hovered class 지정 -->
                      <div class="class-name">1-1</div>
                      <div class="course-name">A음4</div>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="th">3</td>
                  <td>
                    <button type="button" class="btn-table-cell">
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell fixed-course consecutive-course"><!-- 고정수업, 연속수업 class -->
                      <div class="class-name">1-1</div>
                      <div class="course-name">A음3</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell assign-complete"><!--  배정 완료 일때 class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge joint">합반</span>
                      </div>
                      <div class="class-name">합반</div>
                      <div class="course-name">A고전읽기1</div>
                    </button>
                  </td>
                  <td>
                    <button type="button" class="btn-table-cell fixed-course"><!-- 고정 수업 class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="class-name">1-1</div>
                      <div class="course-name">B영어</div>
                    </button>
                  </td>
                  <td>
                    <button type="button"                     
                      data-consecutive-id="group1"
                      @mouseenter="hoveredId = 'group1'"
                      @mouseleave="hoveredId = null"
                      :class="{ hovered: hoveredId === 'group1'}"
                      class="btn-table-cell consecutive-course assign-complete"><!-- 연속수업 & 배정 완료 일때 class & 연속 수업에 hover 필요시 date속성으로 그룹화 하여 hovered class 지정 -->
                      <div class="class-name">1-1</div>
                      <div class="course-name">A음4</div>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!--  교사 선택 수동 배정 리스트-->
          <div class="assign-list">
            <div class="tit">시수 - 16 (배정 5 / 미배정 <span class="txt-primary">11</span>)</div>            
            <div class="tab-nav">
              <button :class="{'active' : assignTab==='auto-assign'}" @click="assignTab='auto-assign'">자동 배정 결과</button>
              <button :class="{'active' : assignTab==='lesson-config'}" @click="assignTab='lesson-config'">시수표</button>
            </div>
            <!-- 자동 배정 결과 -->
            <div class="auto-assign" v-if="assignTab === 'auto-assign'">
              <div class="table-content basic-table sticky-wrap custom-scr">
                <table>
                  <caption>자동 배정 결과</caption>
                  <colgroup>
                    <col style="width: 80%;" />
                    <col style="width: 20%;" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th class="sticky-top">항목명</th>
                      <th class="sticky-top">개수</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>같은 교사 같은 과목 중복</td>
                      <td class="txt-primary">6</td>
                    </tr>                    
                    <tr>
                      <td>같은 교사 같은 과목 중복</td>
                      <td class="txt-primary">6</td>
                    </tr>
                    <tr>
                      <td>같은 교사 같은 과목 중복</td>
                      <td class="txt-primary">6</td>
                    </tr>
                    <tr>
                      <td>같은 교사 같은 과목 중복</td>
                      <td class="txt-primary">6</td>
                    </tr>
                    <tr>
                      <td>같은 교사 같은 과목 중복</td>
                      <td class="txt-primary">6</td>
                    </tr>
                  </tbody>
                </table>                
              </div>
            </div>
            <!-- 시수표 -->
            <div class="lesson-config" v-if="assignTab === 'lesson-config'">
              <div class="table-content basic-table sticky-wrap custom-scr">
                <table>
                  <caption>시수표</caption>
                  <colgroup>
                    <col style="width: 10%;" />
                    <col style="width: 25%;" />
                    <col style="width: 25%;" />
                    <col style="width: 25%;" />
                    <col style="width: 15%;" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th class="sticky-top"></th>
                      <th class="sticky-top">학급</th>
                      <th class="sticky-top">과목명</th>
                      <th class="sticky-top">미배정/시수</th>
                      <th class="sticky-top">배정</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="badge concurrent">동시</div>
                      </td>
                      <td>1-1</td>
                      <td>국어</td>
                      <td>4-4</td>
                      <td>
                        <button type="button" class="btn btn-primary btn-sm" disabled>배정</button><!-- 배정 비활성화 -->
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div class="badge consecutive">연속</div>
                      </td>
                      <td>1-1</td>
                      <td>국어</td>
                      <td>4-4</td>
                      <td>
                        <button type="button" class="btn btn-primary btn-sm">배정</button><!-- 배정 활성화 -->
                      </td>
                    </tr>
                    <tr>
                      <td class="txt-center">
                        <div class="badge concurrent">동시</div>
                        <div class="badge consecutive">연속</div>
                        <div class="badge joint">합반</div>
                      </td>
                      <td>1-1</td>
                      <td>국어</td>
                      <td>4-4</td>
                      <td>
                        <button type="button" class="btn btn-success btn-sm">배정</button><!-- 배정중 -->
                      </td>
                    </tr>
                  </tbody>
                </table>                
              </div>
            </div>
          </div>
        </div>

        <!-- 자동 생성 결과 리스트 -->
        <div class="tb-row teacher-generate-wrap" v-if="timeTableMode === 'generate'">          
          <!--  자동 생성 결과 -->
          <div class="tb-col">
            <div class="table-content time-table">   
              <div class="h4-tit">
                <h4>자동생성결과 (담임 1-1)</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 음악 음3 진로</p>
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
                      <button type="button" class="btn-table-cell generate-target">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course"><!-- 고정수업, 동시수업 class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A고전읽기1</div>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">2</td>
                    <td>
                      <button type="button" class="btn-table-cell generate-target">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course consecutive-course fst"><!-- 고정수업, 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">3</td>                    
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course consecutive-course"><!-- 고정수업, 연속 수업 class -->
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>                    
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!--  연쇄교환, 1:1교환 수업선택 -->
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>연쇄교환, 1:1교환 수업선택 (담임 1-1)</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 음악 음3 진로</p>
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
                      <button type="button" class="btn-table-cell disabled"><!-- 자동생성 비활성화 class -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>                                
                      <button type="button" class="exchange-chain"> <!-- 연쇄 교환 -->
                        <span>연쇄 교환</span>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell disabled"><!-- 동시수업 class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A고전읽기1</div>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">2</td>
                    <td>
                      <button type="button" class="btn-table-cell selected"><!-- 수업 선택 class -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell consecutive-course fst disabled"><!-- 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell  disabled">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell  disabled">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">3</td>
                    <td>
                      <button type="button" class="exchange-direct"> <!-- 1:1교환 -->
                        <span>1:1 교환</span>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell consecutive-course  disabled"><!-- 연속 수업 class -->
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!--  동시수업 수업선택 -->
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>동시수업 교환 수업선택 (담임 1-1)</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 음악 음3 진로</p>
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
                      <button type="button" class="btn-table-cell disabled"><!-- 자동생성 비활성화 class -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>                      
                      <button type="button" class="exchangeable"> <!-- 변경가능 -->
                        <span>변경가능</span>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course selected"><!-- 선택 class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A고전읽기1</div>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">2</td>
                    <td>
                      <button type="button" class="btn-table-cell disabled">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course consecutive-course fst disabled"><!-- 고정수업, 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell  disabled">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell  disabled">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">3</td>
                    <td>          
                      <button type="button" class="exchangeable"> <!-- 변경가능 -->
                        <span>변경가능</span>
                      </button>
                    </td>                    
                    <td>
                      <button type="button" class="btn-table-cell consecutive-course  disabled"><!-- 동시수업, 연속 수업 class -->
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!--  연속수업 수업선택 -->
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>연속수업 교환 수업선택 (담임 1-1)</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 음악 음3 진로</p>
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
                      <button type="button" class="btn-table-cell disabled"><!-- 자동생성 비활성화 class -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell disabled"><!-- 선택 class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A고전읽기1</div>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">2</td>
                    <td>
                      <button type="button" class="btn-table-cell disabled">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell fixed-course consecutive-course fst disabled"><!-- 고정수업, 연속 수업(연속 수업 첫번째 수업에만 fst class 붙임) class -->
                        <div class="badges">
                          <span class="badge concurrent">동시</span>
                          <span class="badge fixed">고정</span>
                        </div>
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell  disabled">
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>   
                    <td>
                      <button type="button" class="btn-table-cell selected"><!-- 수업 선택 class -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>  
                    <td>                      
                      <button type="button" class="exchangeable consecutive-course"> <!-- 변경가능, 연속 수업-->
                        <span>변경가능</span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td class="th">3</td>
                    <td>          
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell consecutive-course disabled"><!-- 연속 수업 class -->
                        <div class="class-name">1-1</div>
                        <div class="course-name">A음3</div>
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell generate-unavailable"><!-- 자동생성 배정불가 class -->
                      </button>
                    </td>
                    <td>
                      <button type="button" class="btn-table-cell selected"><!-- 수업 선택 class -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>  
                    <td>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- 학급별 -->
    <div class="type-class" v-if="showType === 'class'">
      <div class="tb-row">      
        <!-- 학급 기본타입 -->
        <div class="tb-col">
          <div class="table-content time-table"><!-- 학급타입 class -->
            <div class="h4-tit">
              <h4>학급별 타입 1-1</h4>
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
                  <td></td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell">
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="course-name">A고전읽기1</div>
                      <div class="teacher-name">김서연</div>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="th">2</td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell consecutive-course fst"><!-- 연속 수업 class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge joint">합반</span>
                      </div>
                      <div class="course-name">A음3</div>
                      <div class="teacher-name">김서연</div>
                    </button>
                  </td>
                  <td></td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell no-course">                    
                      <div class="teacher-name">수업없음</div>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="th">3</td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell consecutive-course"><!-- 연속수업 class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="course-name">A음3</div>
                      <div class="teacher-name">김서연</div>
                    </button>
                  </td>
                  <td></td>
                  <td>
                    <button type="button" class="btn-table-cell"><!-- 동시수업 class -->
                      <div class="badges">
                        <span class="badge concurrent">동시</span>
                        <span class="badge fixed">고정</span>
                      </div>
                      <div class="course-name">B영어</div>
                      <div class="teacher-name">김서연</div>
                    </button>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 수동배정 - 연속수업 등록 모달 -->
    <TimeTableModal size="xxs" v-if="false" @close="" class="consecutive-course-modal">      
      <template v-slot:heading>
        연속수업 등록
        <p class="smr">고정으로 등록할 수업 시수를 선택하세요.</p>
      </template>
      <template v-slot:content>        
        <HiSelectBox  
          class="w100"
          :value="consecutiveCourseSelected"
          :items="consecutiveCourseItems"
          @update:value="consecutiveCourseSelected = $event"
          :empty-title="consecutiveCourseSelected === '' ? '선택하세요' : ''"
        />  
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">확인</button>
      </template>
    </TimeTableModal>

    <!-- 수동배정 - 동시수업 배정 모달 -->
    <TimeTableModal size="xl" v-if="false" @close="" class="concurrent-course-modal">      
      <template v-slot:heading>        
        동시수업 배정(그룹명: A)
        <p class="smr">동시수업 배정에 관련된 서브카피가 노출됨 서브카피서브카피</p>
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
                    <td></td>
                    <td></td>
                    <td>
                      <button type="button" class="btn-table-cell assign-complete">
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
                      <button type="button" class="btn-table-cell">
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
                      <button type="button" class="btn-table-cell assign-complete">
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
                      <button type="button" class="btn-table-cell">
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
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">시간표 배정</button>
      </template>
    </TimeTableModal>

    <!-- 시간표 생성중 모달 -->
    <TimeTableModal size="xs" closeSkip v-if="isGeneratingTimetableModal" @close="isGeneratingTimetableModal=false" class="generating-timetable-modal">
      <template v-slot:content>        
        <p class="loading-ani">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </p>
        <div class="tit">
          시간표 생성중 (1차)
        </div>
        <div class="desc">
          잠시만 기다려 주세요. 최적의 조건을 찾기 위해<br>수 분의 시간이 걸릴 수 있습니다.
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isGeneratingTimetableModal=false">취소</button>
      </template>
    </TimeTableModal>

    <!-- 전체 시수표 보기 모달 -->
    <TimeTableModal size="md" v-if="isTotalPeriodModal" @close="isTotalPeriodModal=false" class="total-period-modal">
      <template v-slot:heading>
        전체 시수표 보기
        <p class="smr">각 요일별 전체 배정된 시수를 한눈에 확인합니다.</p>
      </template>
      <template v-slot:content>         
        <div class="tab-nav type01">
          <button :class="{'active' : totalPeriodTab==='teacher-period'}" @click="totalPeriodTab='teacher-period'">교사별 배정 시수표</button>
          <button :class="{'active' : totalPeriodTab==='total-period'}" @click="totalPeriodTab='total-period'">전체 시수표 요약</button>
        </div>  
        <!-- 교사별 배정 시수표 -->
        <div class="table-content sticky-wrap" v-if="totalPeriodTab==='teacher-period'">
          <table>
            <caption>교사별 배정 시수표</caption>
            <colgroup>
              <col style="width:10%">
              <col style="width:20%">
              <col style="width:20%">
              <col style="width:10%">
              <col style="width:10%">
              <col style="width:10%">
              <col style="width:10%">
              <col style="width:10%">
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="sticky-top"></th>
                <th scope="col" class="sticky-top">이름</th>
                <th scope="col" class="sticky-top">배정/전체</th>
                <th scope="col" class="sticky-top">월</th>
                <th scope="col" class="sticky-top">화</th>
                <th scope="col" class="sticky-top">수</th>
                <th scope="col" class="sticky-top">목</th>
                <th scope="col" class="sticky-top">금</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>김하이</td>
                <td>20/20</td>
                <td>4</td>
                <td>4</td>
                <td>4</td>
                <td>4</td>
                <td>4</td>
              </tr>
              <tr>
                <td>2</td>
                <td>김서연</td>
                <td>20/20</td>
                <td>4</td>
                <td>4</td>
                <td>4</td>
                <td>4</td>
                <td>4</td>
              </tr>
            </tbody>
          </table>
        </div>        
        <!-- 전체 시수표 요약 -->
        <div class="table-content sticky-wrap" v-if="totalPeriodTab==='total-period'">
          <table>
            <caption>전체 시수표 요약</caption>
            <colgroup>
              <col style="width:35%">
              <col style="width:13%">
              <col style="width:13%">
              <col style="width:13%">
              <col style="width:13%">
              <col style="width:13%">
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="sticky-top"></th>
                <th scope="col" class="sticky-top">월</th>
                <th scope="col" class="sticky-top">화</th>
                <th scope="col" class="sticky-top">수</th>
                <th scope="col" class="sticky-top">목</th>
                <th scope="col" class="sticky-top">금</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>요일별 최대 배정 시수</td>
                <td>202</td>
                <td>245</td>
                <td>202</td>
                <td>245</td>
                <td>202</td>
              </tr>
              <tr>
                <td>요일별 배정 시수</td>
                <td>202</td>
                <td>245</td>
                <td>202</td>
                <td>245</td>
                <td>202</td>
              </tr>
              <tr>
                <td>교사별 일 평균 시수</td>
                <td>3.8</td>
                <td>4.0</td>
                <td>3.8</td>
                <td>4.0</td>
                <td>3.8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </TimeTableModal> 

    <!-- 시간표 초기화 모달 --> 
    <TimeTableModal size="xs" v-if="isTimetableResetModal" @close="isTimetableResetModal=false" class="timetable-reset-modal">
      <template v-slot:heading>
        시간표 초기화
        <p class="smr">초기화 할 항목을 선택 한 후 버튼을 눌러주세요.</p>
      </template>
      <template v-slot:content>        
       <div class="gray-box">
          <div class="form-check">
            <input type="checkbox" id="1" />
            <label for="1">
              <span>자동 배정</span>
            </label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="2" />
            <label for="2">
              <span>동시수업 고정</span>
            </label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="3" />
            <label for="3">
              <span>개별 교사 수동 배정</span>
            </label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="4" />
            <label for="4">
              <span>개별 교사 수업 빼기</span>
            </label>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click=" isTimetableResetModal=false">취소</button>
        <button type="button" class="btn btn-warning btn-lg" @click="">선택사항으로 초기화</button>
      </template>
    </TimeTableModal>

    <!-- 작업 내역 확인 모달 -->
    <TimeTableModal size="md" v-if="isHistoryModal" @close="isHistoryModal=false" class="history-modal">
      <template v-slot:heading>
        작업 내역 확인
        <p class="smr">작업에 대한 내용 확인 및 백업 리스트 입니다. 선택 하신 버전으로 이동 가능합니다.</p>
      </template>
      <template v-slot:content>     
        <div class="table-content sticky-wrap" >
          <table>
            <caption>작업 내역</caption>
            <colgroup>
              <col style="width:68px">
              <col style="width:auto">
              <col style="width:198px">
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="sticky-top">NO</th>
                <th scope="col" class="sticky-top">작업내용</th>
                <th scope="col" class="sticky-top">작업일시</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>(자동) [김하이] 시간표 수정(수3→화2)</td>
                <td>2025-05-13 14:43:08</td>
              </tr>              
              <tr class="selected"> <!-- 1회 클릭 선택 클래스 -->
                <td>2</td>
                <td>이건 수동 임시 저장임</td>
                <td>2025-05-13 14:43:08</td>
              </tr>              
              <tr class="edited"> <!-- 2회 클릭 수정 클래스 -->
                <td>3</td> 
                <td>
                  <input type="text" value="시간표 생성하기 (3차)">
                  <span>25/100</span>
                </td>
                <td>2025-05-13 14:43:08</td>
              </tr>              
            </tbody>
          </table>
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isHistoryModal=false">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">이동하기</button>
      </template>
    </TimeTableModal>

    <!-- 임시 저장하기 모달 -->
    <TimeTableModal size="xs" v-if="isSaveDraftModal" @close="isSaveDraftModal=false" class="save-draft-modal">
      <template v-slot:heading>
        임시 저장하기
        <p class="smr">
          현재 작성된 시간표 내역을 임시로 저장합니다.
        </p>
      </template>
      <template v-slot:content>
        <div class="gray-box">
          <div class="form-group-inline mb-10">
            <label class="sm">제목</label>
            <input type="text" class="form-control ml-15" :class="{'error' : false}" placeholder="제목 입력" />
          </div>
          <small v-if="false" class="txt-warning ml-40 pl-10">제목을 입력해주세요.</small>
        </div>
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isSaveDraftModal=false">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">확인</button>
      </template>
    </TimeTableModal>

    <!-- 수업 변경(1:1교환) 모달 -->
    <TimeTableModal size="lg" v-if="false" @close="" class="exchange-direct-modal">
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

    <!-- 수업 변경(연쇄교환) 모달 -->
    <TimeTableModal size="xl" v-if="false" @close="" class="exchange-chain-modal">
      <template v-slot:heading>
        수업 변경(연쇄교환)
        <p class="smr">
          연쇄교환에 대한 설명 어쩌고 저쩌고 서브 카피 작성 필요.
        </p>
      </template>
      <template v-slot:content>
        <div  class="form-ctr">
          <input type="radio" id="1" name="1">
          <label for="1">
            <span>연쇄 교환 1</span>
          </label>
        </div>
        <div class="tb-row teacher-view gray-box"><!-- teacher-view : 수정 없는 테이블 뷰-->              
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
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>이준서 선생님</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 영어</p>
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
                      <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
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
                      <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
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
        <div  class="form-ctr mt-30">
          <input type="radio" id="11" name="1">
          <label for="11">
            <span>연쇄 교환 2</span>
          </label>
        </div>
        <div class="tb-row teacher-view gray-box"><!-- teacher-view : 수정 없는 테이블 뷰-->              
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
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>이준서 선생님</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 영어</p>
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
                      <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
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
                      <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
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

    <!-- 동시수업 (1:1교환 / 연쇄교환) 모달 -->
    <TimeTableModal size="xl" v-if="true" @close="" class="exchange-concurrent-direct-modal">
      <template v-slot:heading>
        동시수업 배정(그룹명: A)
        <p class="smr">
          동시수업 배정에 관련된 서브카피가 노출됨 서브카피서브카피.
        </p>
      </template>
      <template v-slot:content>
        <div class="gray-box selected-teacher">
          <button type="button" class="btn btn-tertiary-blue btn-lg" @click="">김서연</button>
          <button type="button" class="btn btn-tertiary btn-lg" @click="">백민서</button>
          <button type="button" class="btn btn-tertiary btn-lg" @click="">이준석</button>
        </div>
        <!-- 1:1교환 일때 -->
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

        <!-- 연쇄교환 일때 -->
        <div  class="form-ctr mt-30">
          <input type="radio" id="11" name="1">
          <label for="11">
            <span>연쇄 교환 1</span>
          </label>
        </div>
        <div class="tb-row teacher-view gray-box"><!-- teacher-view : 수정 없는 테이블 뷰-->              
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
          <div class="tb-col">
            <div class="table-content time-table">
              <div class="h4-tit">
                <h4>이준서 선생님</h4>
                <p class="period"><i class="ico ico-list ico-primary" /> 영어</p>
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
                      <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
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
                      <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
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

    <!-- 연속수업 수업 변경 모달 -->
    <TimeTableModal size="xl" v-if="false" @close="" class="exchange-consecutive-modal">
      <template v-slot:heading>
        수업 변경 (연속수업)
        <p class="smr">
          연속수업 변경에 관련된 서브카피가 노출됨 서브카피서브카피 
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
                    <td>
                      <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
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
                    <td>
                      <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">통과</div>
                      </button>
                    </td>
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
                    <td>              
                      <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">영어</div>
                      </button>
                    </td>
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
                    <td>
                      <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">영어</div>
                      </button>
                    </td>
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
                <h4>이수지 선생님</h4>
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
                      <button type="button" class="btn-table-cell assign-before"><!-- 배정 전 -->
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
                    <td>                                  
                      <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
                        <div class="class-name">2-3</div>
                        <div class="course-name">영어</div>
                      </button>
                    </td>
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
                        <div class="course-name">문매</div>
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
                      <button type="button" class="btn-table-cell assign-after"><!-- 배정 후 -->
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
                    <td>         
                    </td>
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

    <!-- 수업 수정 모달 -->
    <TimeTableModal size="md" v-if="isCourseEditModal" @close="isCourseEditModal=false" class="course-edit-modal">
      <template v-slot:heading>
        수업 수정
        <p class="smr">
          교사의 수업을 변경합니다. 변경된 교사의 전체 시수 및 시수표가 변경됩니다. 
        </p>
      </template>
      <template v-slot:content>       
        <div class="gray-box">
          <div class="form-check-inline">
            <input type="radio" name="exchange" id="exchange-direct" value="exchange-direct" v-model="courseEditType"/>
            <label for="exchange-direct"><span>맞교환</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" name="exchange" id="exchange-chain" value="exchange-chain" v-model="courseEditType" />
            <label for="exchange-chain"><span>넘기기</span></label>
          </div>
        </div>
        <div class="course-edit direct" v-if="courseEditType === 'exchange-direct'">
          <div class="left-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr">            
                <AutocompleteInput
                  v-model="teacherNameBefore"
                  :options="teacherList.map(t => t.name)"
                  placeholder="선택"
                  nodata="일치하는 교사가 없습니다."                  
                />
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>
              <AutocompleteInput
                v-model="courseNameBefore"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"
                disabled
                >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>              
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameBefore"
                :items="classList"
                @update:value="classNameBefore = $event"
                :empty-title="classNameBefore || '선택'"
                disabled
              /> 
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              18
            </div>
          </div>
          <i class="change"></i>
          <div class="right-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr">              
                <AutocompleteInput
                  v-model="teacherNameAfter"
                  :options="teacherList.map(t => t.name)"
                  placeholder="선택"
                  nodata="일치하는 교사가 없습니다."                  
                />
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>
                <AutocompleteInput
                v-model="courseNameAfter"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"                
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>    
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameAfter"
                :items="classList"
                @update:value="classNameAfter = $event"
                :empty-title="classNameAfter || '선택'"
              /> 
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              -
            </div>
          </div>
        </div>     
        <div class="course-edit chain" v-else>
          <div class="left-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr">          
                <AutocompleteInput
                  v-model="teacherNameBefore"
                  :options="teacherList.map(t => t.name)"
                  placeholder="선택"
                  nodata="일치하는 교사가 없습니다."                  
                />
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>
                <AutocompleteInput
                v-model="courseNameBefore"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>              
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameBefore"
                :items="classList"
                @update:value="classNameBefore = $event"
                :empty-title="classNameBefore || '선택'"
              />
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              18
            </div>
          </div>
          <i class="change"></i>
          <div class="right-area">
            <div class="form-group-inline">
              <label>담당교사</label>
              <div class="form-ctr"> 
                <AutocompleteInput
                  class="custom-option"
                  v-model="teacherNameAfter"
                  :options="teacherList.map(t => t.name)"
                  placeholder="선택"
                  :isError="false"
                >
                  <template #custom-option="{ items, value, selectItem }">
                    <div class="autocomplete-list-inner"
                    :class="{'is-add-footer' : value && !items.includes(value)}">
                      <div class="item" 
                        :class="{'input-wrap' : isNewTeacher(item)}"
                        v-for="(item, index) in items" 
                        :key="index"
                        @mousedown.prevent="!isNewTeacher(item) && selectItem(item)">
                        <template v-if="isNewTeacher(item)">
                          <input class="sm" type="text"
                            :value="getTeacherObject(item).name"
                            @input="e => getTeacherObject(item).name = e.target.value"
                          />    
                        </template>
                        <template v-else>
                          {{ item }}
                        </template>
                      </div>
                      <div v-if="items.length === 0" class="hi-nodata sm p-00">
                        <p>일치하는 교사가 없습니다.</p>
                      </div>
                    </div>
                    <div class="add-footer" v-if="value && !items.includes(value)">
                      <button @mousedown.prevent="addTeacher(value)">
                        <i class="ico ico-plus ico-primary ico-size-20"></i>
                        교사추가
                      </button>
                    </div>
                  </template>               
                </AutocompleteInput>
              </div>
            </div>
            <div class="form-group-inline">    
              <label for="course-name">과목명</label>   
              <AutocompleteInput
                v-model="courseNameAfter"
                :options="courseList.map(item => item.officialCourse)"
                placeholder="선택"             
              >
                <template #custom-option="{ items, selectItem }">
                  <div class="item"
                    v-for="(item, idx) in displayList(items)"
                    :key="idx"
                    @mousedown.prevent="selectItem(item.officialCourse)"
                  >
                    {{ item.officialCourse }} ({{ item.displayCourse }}) 
                    <span class="txt-primary">({{ item.periodCount }})</span>
                  </div>
                  <div v-if="items.length === 0" class="hi-nodata sm p-00">
                    <p>일치하는 과목이 없습니다.</p>
                  </div>
                </template>
              </AutocompleteInput>
            </div>
            <div class="form-group-inline">
              <label for="class-group">학반</label>             
              <HiSelectBox           
                class="sm opt-top"
                :value="classNameAfter"
                :items="classList"
                @update:value="classNameAfter = $event"
                :empty-title="classNameAfter || '선택'"
              />  
            </div>
            <div class="form-group-inline">
              <label>시수</label>
              -
            </div>
          </div>
        </div>     
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isCourseEditModal=false">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">변경</button>
      </template>
    </TimeTableModal>

    <!-- 기초 시간표 수정완료 -->
    <TimeTableModal size="sm" v-if="false" class="timeTable-complete-modal">
      <template v-slot:heading>
        기초 시간표 수정 완료
        <p class="smr">
          기초시간표 수정 완료하여 전체시간표에 적용합니다.
        </p>
      </template>
      <template v-slot:content>   
        <div class="gray-box">
          <div class="form-group-inline">
            <label>1. 시간표 명</label>
            <div class="form-ctr">            
              <HiSelectBox           
                class="sm"
                :value="timetableName"
                :items="[
                  { value: '1교시', title: '1교시' },
                  { value: '2교시', title: '2교시' },
                  { value: '3교시', title: '3교시' },
                  { value: '4교시', title: '4교시' }
                ]"
                @update:value="timetableName = $event"
                :empty-title="timetableName || '선택'"
              /> 
            </div>
          </div>
        </div>
        <div class="gray-box">
          <div class="form-group">
            <label>2. 시간표 운영 기간을 등록해 주세요.</label>
            <div class="desc">시간표가 운영될 한 학기 동안의 시작일과 종료일을 설정하세요.</div>
            <div class="form-ctr mt-20">
              <!-- 시작일 -->
              <div class="input-wrap">
                <input
                  type="text"
                  :value="startDate"
                  placeholder="시작일"
                  @click="isStartCalendarOpen = true"
                />
                <i class="ico ico-calendar" @click="isStartCalendarOpen = true"></i>
                <CalendarMonthly
                  v-if="isStartCalendarOpen"
                  v-click-outside="closeStartCalendar"
                />
              </div>
              <span class="m-05"> ~ </span>
              <!-- 종료일 -->
              <div class="input-wrap">
                <input
                  type="text"
                  :value="endDate"
                  placeholder="종료일"
                  @click="isEndCalendarOpen = true"
                />
                <i class="ico ico-calendar" @click="isStartCalendarOpen = true"></i>
                <CalendarMonthly
                  v-if="isEndCalendarOpen"
                  v-click-outside="closeEndCalendar"
                />
              </div>
            </div>
          </div>
        </div>     
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary btn-lg ml-10" @click="isCourseEditModal=false">취소</button>
        <button type="button" class="btn btn-primary btn-lg" @click="">반영하기</button>
      </template>
    </TimeTableModal>
  </div>
</template>

<script>
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import AutocompleteInput from '@/apps/timetable/components/AutocompleteInput.vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import CalendarMonthly from '@/components/Calendar/CalendarMonthly.vue';
export default {
  name: 'TimetableGenerate',
  data() {
    return {
      showType: 'teacher',   // teacher 교사별, class 학급별   
      lnbTab: 'teacher-list',
      timeTableMode: 'list', // list(교사별 시간표 리스트), assign(교사선택 후 수동 배정), generate(자동 생성 결과)
      assignTab: 'lesson-config', // auto-assign, lesson-config
      totalPeriodTab: 'teacher-period', // teacher-period, total-period
      consecutiveCourseSelected: '2시간', // 연속 수업 시수
      consecutiveCourseItems: [
        { value: '1시간', title: '1시간' },
        { value: '2시간', title: '2시간' },
      ],
      isTimetableResetModal: false, // 시간표 초기화 모달
      isHistoryModal: false, // 시간표 히스토리 모달
      isSaveDraftModal: false, // 임시저장 모달
      isGeneratingTimetableModal: false, // 시간표 생성 모달      
      isTotalPeriodModal: false, // 전체 시수표 모달
      hoveredId: null, // 연속 수업 hover된 그룹 

      //수업수정 모달
      isCourseEditModal: false, // 수업 수정 모달
      courseEditType: 'exchange-direct', // 맞교환, 넘기기
      courseList: [
        { officialCourse: '과학', displayCourse: '과학2', periodCount: 3},
        { officialCourse: '영어', displayCourse: '영어1', periodCount: 3 },
        { officialCourse: '수학', displayCourse: '수학2', periodCount: 3},
        { officialCourse: '체육', displayCourse: '체육2', periodCount: 3 }
      ],
      teacherList: [
        { name: '홍길동', isNew: false },
        { name: '김영희', isNew: false },
        { name: '이선생', isNew: false },
        { name: '최선생', isNew: false },
      ], // 교사 이름 목록 
      classList: [
        { value: '1-1', title: '1-1' },
        { value: '2-1', title: '2-1' },
        { value: '3-1', title: '3-1' },
        { value: '4-1', title: '4-1' },
        { value: '5-1', title: '5-1' },
        { value: '6-1', title: '6-1' }
      ],
      //변경 전
      teacherNameBefore: null, // 변경 전 담당교사
      courseNameBefore: null, // 변경 전 과목명
      classNameBefore: null, // 변경 전 학반
      //변경 후
      teacherNameAfter: null, // 변경 후 담당교사
      courseNameAfter: null, // 변경 후 과목명
      classNameAfter: null, // 변경 후 학반
      
      // 기초시간표 수정 완료 모달
      isPopupCalendar: false, // 캘린더 팝업 여부      
      timetableName: '1교시', // 시간표 이름
      startDate: '2025.5.20',
      endDate: '2025.5.20',
      isStartCalendarOpen: false,
      isEndCalendarOpen: false,      
    };
  },  
  components: {
    TimeTableModal, AutocompleteInput, HiSelectBox, CalendarMonthly
  },
  methods: {
    // 교사 추가
    addTeacher(name) {
      if (!name.trim()) return;
      this.teacherList.push({
        name: name,
        isNew: true
      });
      this.teacherNameAfter = ''; // 입력창 초기화
    },
    // 추가된 교사인지 확인
    isNewTeacher(name) {
      const found = this.teacherList.find(t => t.name === name);
      return found?.isNew === true;
    },
    getTeacherObject(name) {
      return this.teacherList.find(t => t.name === name) || {};
    },

    // 달력 팝업 닫기
    closeStartCalendar() {
      this.isStartCalendarOpen = false;
    },
    closeEndCalendar() {
      this.isEndCalendarOpen = false;
    },
    
    // autocomplete 리스트에 있는 과목명으로 필터링
    displayList(filteredStrings) {
      return this.courseList.filter(item =>
        filteredStrings.includes(item.officialCourse)
      );
    },
    // autocomplete 과목명으로 과목 찾기
    findSubject(courseName) {
      return this.courseList.find(item => item.officialCourse === courseName);
    },

    // 개별 수업 > 연속 수업이고 고정인  수업 > 배정 삭제 시
    noti1(){
      this.$hiClass.confirm('선택한 과목을 삭제하시겠습니까?', null, {
        customClass: {
          popup:  'timetable-confirm',
          confirmButton: 'btn-line-warning',  // 버튼 색상 변경
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 동시 수업 배정 시
    noti2(){
      this.$hiClass.confirm('선택하신 수업은 동시수업 입니다. <br>동시에 배정된 시간표를 모두 고정하시겠습니까?', null, {
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 복수교사 2명 과목 배정한 경우 - 다른 복수교사 미배정
    noti3(){
      this.$hiClass.confirm(`
      선택하신 수업은 <strong>[김하이]</strong> 선생님과 복수 수업 과목입니다. <strong>[홍길동]</strong> 선생님도 선택하신 시간에 수업이 배정됩니다.     
      `, null, {
        showCancelButton: false,  // 취소버튼 숨기기
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },
    noti4(){
      this.$hiClass.confirm(`
      선택하신 수업은 <strong>[김하이]</strong> 선생님, <strong>[박하린]</strong> 선생님, <strong>[이준서]</strong> 선생님과 복수 수업 과목입니다. 해당 선생님들도 선택하신 시간에 수업이 배정됩니다.     
      `, null, {
        showCancelButton: false,  // 취소버튼 숨기기
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    
    // 다른 교사 수업 배정된 시간에 수업 고정 시도 시
    noti5(){
      this.$hiClass.confirm(`
      1-1 (수) 1교시 수업에 <strong>[영어 백민서]</strong> 수업이 고정 되어 있습니다. 등록된 수업을 삭제하고 고정하시겠습니까?   
      `, null, {
        customClass: 'timetable-confirm',
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },
    
    // 해당 학년의 수업 없는 교시에 수업 배정 클릭
    noti6(){
      this.$hiClass.confirm('1학년 (수) 7교시 수업이 없습니다.', null, {
        showCancelButton: false,  // 취소버튼 숨기기
        customClass: {
          popup:  'timetable-confirm',
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },

    // 공통과목이 배정되어 있는 시간에 배정 클릭
    noti7(){
      this.$hiClass.confirm('공통과목 시간에는 배정하실 수 없습니다.', null, {
        showCancelButton: false,  // 취소버튼 숨기기
        customClass: {
          popup:  'timetable-confirm',
        },
        showCloseButton: true
      })
      .then(() => { })
      .catch(() => { });
    },
  }
};
</script>

<style scoped lang="scss">
// 교사별
.type-teacher{
  display: flex;
  gap: 40px;
  align-items: flex-start;

  .teacher-lnb{
    width: 280px;
    min-width: 280px;
    border: 1px solid #BDBDBD;
    border-radius: 16px;
    position: relative;    
    .tab-nav{
      padding: 12px;
      border-bottom: 1px solid #BDBDBD;
      button{     
        &.active{
          background-color: #1E3668;
          border: 1px solid #1E3668;
          color: #fff;
        }
      }
    }
    .filter-section{    
      padding: 12px;
      position: relative;
      display: flex;
      gap: 6px;
      .btn-tertiary{
        padding: 0 20px;
      }
      .btn-link{
        position: absolute;
        right: 22px;
        top: 50%;
        transform: translateY(-50%);
        i::after{
          background-color: #000;
        }
      }
    }
    .table-content{
      th, td{height:32px;}
      tr.active td,
      tr:hover td{
        background: #F1F4FC;
        cursor: pointer;
      }
    }
    .generate-list{
      li{
        border-top: 1px solid #EEEEEE;
        padding: 13px 16px;
        font-size: 14px;
        line-height: 160%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .count{
          color:#4778DE;
        }
        &.disabled{
          color: #9E9E9E;
          .count{
            color:#9E9E9E;
          }
        }
        &.tit{
          border-top: 0;
          font-weight:700;
          justify-content: flex-start;
          gap: 5px;
        }
        &:not(.tit):not(.disabled):hover{background: #F1F4FC;}
        &:not(.tit):not(.disabled){
          cursor: pointer;
        }
      }
    }  
    .btns{
      position: absolute;
      top: 100%;
      margin-top: 10px;
      width: 100%;
      .btn-help{
        position: absolute;
        right: 80px;
        bottom: 14px;     
        border: 0px solid rgba(#fff, 0.5);
        &::after{
          background-color: #fff;
        } 
        &::before {
          background: var(--primary);
        }
        &.help-on{
            animation: helpOn-ani-w 1s ease-in-out infinite reverse;
          &::after{
            background-color: #fff;
          }
        }
      }
    }
  }
  .teacher-content{
    width:100%;
    .teacher-assign-wrap{
      display: flex;
      gap: 24px;
      .teacher-assign{
        width: 55%;
      } 
      .assign-list{
        border: 1px solid #BDBDBD;
        border-radius: 16px;
        padding: 32px;
        width: 45%;
        .tit{
          font-weight: 600;
          font-size: 18px;
          line-height: 144%;
          margin-bottom: 16px;
        }
        .tab-nav{
          margin-bottom: 24px;
        }
        .table-content{
          height:263px;
          td{
            border-right:0;
            .btn-sm{
              padding: 0 8px;  
            }
          }     
        }
      }  
    }
  }  
}

// 연속수업 등록 모달 
.consecutive-course-modal{
  .hi-selectbox{
    margin-bottom: 100px;
  }
}

// 시간표 생성 중 모달
.generating-timetable-modal{
  .loading-ani{
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    span{ 
      display: inline-block;
      width: 12px;
      height: 12px;     
      border-radius: 50px;
      margin: 0 4px;
      animation: loading-ani 1s ease-in-out infinite;
      &:nth-child(1){background:#10069F; animation-delay: 0.2s;}
      &:nth-child(2){background:#00B388; animation-delay: 0.4s;}
      &:nth-child(3){background:#5BC2E7; animation-delay: 0.6s;}
      &:nth-child(4){background:#FFBF3F; animation-delay: 0.8s;}
    }    
  }
  .tit{
    font-size: 20px;
    font-weight: 700;
    line-height: 140%;
    text-align: center;
    margin-bottom: 8px;
  }
  .desc{
    text-align: center;
    font-size: 15px;
    font-weight: 400;
    line-height: 160%;
    color: var(--Text-Gray-09);
  }
}

// 전체 시수표 보기 모달
.total-period-modal{
  ::v-deep{
    .modal__layer{
      height: calc(100% - 48px);
    }
    .modal__content{
      height: calc(100% - 100px);
    }
  }
  .tab-nav{ 
    margin-bottom:24px;
  }
  .table-content{
    height: calc(100% - 80px);
  }
}

//시간표 초기화 모달
.timetable-reset-modal{
  .form-check{
    & + .form-check{margin-top:20px;}
    label span{
      font-weight: 400;
    }
  } 
}

// 작업 내역 확인 모달
.history-modal{
  .table-content{
    height: 608px;
    tr:hover td,
    tr.edited td{
      background: #F8FAFF;
      input{
        padding-right: 60px;
      }
      input + span{
        position: absolute;
        right: 30px;
        top: 26px;
        font-size: 12px;
        color: var(--gray-07);
        font-weight: 400;
        line-height: 150%;
      }
    }
    tr.selected td{
      background: #F8FAFF;
      &::before{
        display: block;
        content: '';
        border: 1px solid #8EA4D1;
        border-left: 0;
        border-right: 0;
        margin: -1px;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 0;        
      }      
      &:first-child::before{ border-left: 1px solid #8EA4D1;}
      &:last-child::before{border-right: 1px solid #8EA4D1; }
    }
  }
}

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

// 동시수업(1:1교환) 모달
.exchange-concurrent-direct-modal{  
  ::v-deep{
    .modal__layer{
      height: calc(100% - 48px);
    }
    .modal__content{
      height: calc(100% - 165px);
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  .selected-teacher{
    padding: 20px 24px 10px 24px;
    button{
      margin-left: 8px;
      margin-bottom: 10px;
      .btn-tertiary{ color:#616161;}
    }
  }
}

// 수업 수정 모달
.course-edit-modal{
  ::v-deep {
    .modal__layer,
    .modal__content{
      overflow: visible;
    }
  }
  .course-edit{
    display: flex;
    margin-top: 16px;
    align-items: center;
    > div{
      border-radius: 16px;
      border: 1px solid #BDBDBD;
      padding: 32px;
      width: calc(50% - 44px);
      label{
        min-width: 80px;
        margin-right: 16px;
      }
    }
    .change{    
      display: inline-block;  
      width:56px;
      height:56px;
      mask-image: url(~@/assets/img/timetable/ico-exchange-direct.svg);
      background: var(--primary);
      mask-size: 100%;
      margin: 16px;
    }
    &.chain{
      .change{
        mask-image: url(~@/assets/img/timetable/ico-exchange-chain.svg);
      }
    }
  }
  // 교사 추가 autocomplete
  .autocomplete-wrap{
    ::v-deep{
      .autocomplete-list-inner{
        max-height: 195px;
      }
    }
  }  
  .hi-selectbox{
    width: 100%!important;
    ::v-deep{
      .option__layer{
        max-height: 140px;
      }
    }
  }
}

// 기초 시간표 수정완료 모달
.timeTable-complete-modal{
  ::v-deep .modal__layer{
    overflow: visible;
    .modal__content{
      overflow: visible;
    }
  }
  .hi-selectbox{
    width: 200px !important;
  }
  .input-wrap {
    width: 200px;
    position: relative;
    display: inline-block;
    
    input:focus + i.ico-calendar {
      &::after {
        background-color: var(--primary) !important;
      }
    }
    i.ico-calendar {
      position: absolute;
      right: 12px;
      top: 12px;
      &::after {
        background-color: var(--gray-10) !important;
      }
    }
    .hi-selectbox{
      width: 100%;
      height: 44px;
      ::v-deep button.selected{height:100%;}
      &.err {
        ::v-deep button.selected{
            border-color: #EC1F2D;
        }
      }
    }
}
  .desc{
    color: #616161;
  }


}
</style>
