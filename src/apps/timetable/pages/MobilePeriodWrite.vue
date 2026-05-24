<!--
@File(Method): MobilePeriodWrite.vue
@Description: 미가입 교사 시수표 등록 (모바일 반응형)
@Modified: 2025-06-18 
-->
<template>
  <div class="time-table-wrap webview">
    <header class="logo">
      <img src="@/assets/img/logo_login.png" alt="hiclass" />
    </header>
    <main class="period-write">
      <section class="tit">
        <h2>교사별 시수표</h2>
        <p class="desc">과목과 시수를 확인해 주세요. <br />수업 들어가시는 학반을 선택 후 [보내기]을 눌러주세요.</p>
      </section>
      <section class="con">
        <div class="period-head">
          <HiSelectBox
            class="md"
            :value="selectedName"
            :items="[
              { value: '홍길동', title: '홍길동' },
              { value: '김길동', title: '김길동' },
              { value: '이길동', title: '이길동' },
              { value: '박길동', title: '박길동' },
            ]"
            @update:value="selectedName = $event"
            :empty-title="selectedName || '이름선택'"
          />
          <div class="period-total-count">
            <i class="ico ico-clock ico-size-20"></i> 시수 누계 :
            <em class="txt-primary">{{ totalPeriodSum }}</em>
          </div>
        </div>
        <div class="period-list">
          <div class="period-item gray-box" v-for="(item, index) in periodList" :key="index">
            <div class="tit">
              <div class="name">
                과목명 : <em>{{ item.courses }}</em> ({{ item.period }})
              </div>
              <div class="count">
                합계 : <em class="txt-primary">{{ item.periodTotal }}</em>
              </div>
            </div>
            <div class="period-add">
              <button
                v-for="(additem, i) in periodList[index].class"
                :key="i"
                type="button"
                class="btn btn-xs btn-primary"
                @click="removeClass(index, i)"
              >
                {{ additem }}
              </button>
              <button type="button" class="btn btn-link btn-add txt-primary" @click="openAddClassModal(index)">
                <i class="ico ico-plus ico-size-14 ico-primary"></i>
                등록
              </button>
            </div>
          </div>
        </div>
      </section>
      <button type="button" class="btn btn-primary btn-lg btn-send w100">보내기</button>
    </main>
    <transition name="fade">
      <TimeTableModal v-if="addClassModal === true" size="xs" @close="addClassModal = false" class="add-class-modal">
        <template v-slot:content>
          <div class="tit" v-if="selectedPeriodItem">
            <div class="name">
              <em>{{ selectedPeriodItem.courses }}</em> ({{ selectedPeriodItem.period }})
            </div>
            <div class="count">
              합계 : <em class="txt-primary">{{ selectedPeriodItem.period * selectedPeriodItem.class.length }}</em>
            </div>
          </div>

          <div class="grades-period" v-for="(grade, index) in classlist" :key="index">
            <div class="tit">{{ grade.name }}</div>
            <div class="class">
              <div v-for="(classItem, classIndex) in grade.classes" :key="classIndex">
                <input type="checkbox" :id="`check-${grade.name}-${classItem}`" class="btn-type rounded" :value="classItem" v-model="selectedClasses" />
                <label :for="`check-${grade.name}-${classItem}`">
                  <span>{{ classItem }}</span>
                </label>
              </div>
            </div>
          </div>
        </template>
        <template v-slot:footer>
          <button type="button" class="btn btn-tertiary-blue ml-10" @click="addClassModal = false">취소</button>
          <button type="button" class="btn btn-primary" @click="confirmAddClasses">선택완료</button>
        </template>
      </TimeTableModal>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import HiSelectBox from '@/components/Form/HiSelectBox.vue';
import TimeTableModal from '@/apps/timetable/components/TimeTableModal.vue';
import '@/assets/css/timetable/common.scss';

const selectedName = ref(''); // 선택된 교사 이름
const rawPeriodList = ref([
  { courses: '경A', period: 2, periodTotal: '', class: ['1-1', '1-2', '1-3'] },
  { courses: '경B', period: 2, periodTotal: '', class: ['1-1', '1-2'] },
]); // 초기 시수표 데이터
const addClassModal = ref(false); // 모달 표시 여부
const selectedPeriodItem = ref(null); // 현재 선택된 시수표 항목
const selectedClasses = ref([]); // 선택된 학반 목록
const classlist = ref([
  { name: '1학년', classes: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8'] },
  { name: '2학년', classes: ['2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7'] },
  { name: '3학년', classes: ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6'] },
]); // 학년별 학반 목록

// 시수표 목록 계산
const periodList = computed(() =>
  rawPeriodList.value.map((item) => ({
    ...item,
    periodTotal: item.period * item.class.length,
  }))
);

// 시수표 항목 제거 함수
const removeClass = (periodIndex, classIndex) => {
  rawPeriodList.value[periodIndex].class.splice(classIndex, 1);
};

// 전체 시수 누계 계산
const totalPeriodSum = computed(() => {
  return rawPeriodList.value.reduce((sum, item) => {
    const classCount = item.class.length;
    return sum + item.period * classCount;
  }, 0);
});

// 선택된 시수표 항목에 학반 추가 모달 열기
const openAddClassModal = (index) => {
  selectedPeriodItem.value = rawPeriodList.value[index];
  addClassModal.value = true;
};

// 선택된 학반을 시수표 항목에 추가하는 함수
const confirmAddClasses = () => {
  if (!selectedPeriodItem.value) return;
  const currentClassList = selectedPeriodItem.value.class;

  // 중복 제거 후 추가
  selectedClasses.value.forEach((cls) => {
    if (!currentClassList.includes(cls)) {
      currentClassList.push(cls);
    }
  });

  // 모달 닫고 선택값 초기화
  addClassModal.value = false;
  selectedClasses.value = [];
  selectedPeriodItem.value = null;
};
</script>
<style lang="scss" scoped>
.time-table-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  header {
    background: #fff;
    height: 80px;
    padding: 10px 20px;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    img {
      width: 120px;
    }
  }
  .period-write {
    max-width: 520px;
    width: 100%;
    margin: 0 auto;
    padding: 40px;
    border-radius: 10px;
    background: #fff;
    .tit {
      h2 {
        font-size: 24px;
        font-weight: 500;
        line-height: 150%;
        margin-bottom: 8px;
      }
      p {
        font-size: 14px;
        line-height: 150%;
      }
    }
    .con {
      padding: 40px 0;
      .period-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .hi-selectbox{width:130px;}
      }
      .period-total-count {
        font-size: 16px;
        color: var(--font-color);
        font-weight: 600;
        line-height: 160%;
        em {
          font-weight: 600;
        }
      }
      .period-item {
        .tit {
          display: flex;
          align-items: center;
          gap: 30px;
          .name,
          .count {
            font-size: 16px;
            color: var(--font-color);
            line-height: 160%;
            white-space: nowrap;
            em {
              font-weight: 600;
            }
          }
        }
        .period-add {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          button:not(.btn-add) {
            border-radius: 50px;
            padding-right: 12px;
            &::after {
              display: inline-block;
              content: '';
              width: 14px;
              height: 14px;
              background-position: center;
              background-repeat: no-repeat;
              background-size: 100%;
              background-color: #fff;
              mask-image: url(~@/assets/img/timetable/ico-close.svg);
              mask-repeat: no-repeat;
              mask-position: center;
              mask-size: contain;
              margin-left: 6px;
            }
          }
          .btn-add {
            margin-left: 4px;
            i {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }

  // modal
  .add-class-modal {
    .tit {
      display: flex;
      align-items: center;
      gap: 30px;
      .name,
      .count {
        font-size: 16px;
        color: var(--font-color);
        line-height: 160%;
        white-space: nowrap;
        em {
          font-weight: 600;
        }
      }
    }
    ::v-deep .modal__content {
      margin-top: 0;
    }
    .grades-period {
      margin-top: 40px;
      .tit {
        font-size: 15px;
      }
      .class {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        input[type='checkbox'].btn-type + label {
          width: auto;
          height: auto;
          border-radius: 50px;
          padding: 4px 12px;
        }
      }
    }
  }
  @media (max-width: 768px) {
    header,
    .period-write .tit p {
      display: none;
    }
    .period-write {
      padding: 20px;
      height: 100%;
      > .tit {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        margin: 0 auto;
        border-bottom: 1px solid #ececec;
        h2 {
          font-size: 18px;
          padding: 12px 16px;
          margin: 0;
        }
      }
      .con {
        margin-top: 52px;
        padding: 0;
      }
      .btn-send {
        position: absolute;
        top: 2px;
        right: 0;
        width: auto !important;
        background: #fff;
        color: var(--primary);
        border: 0;
        transition: none;
        &:focus,
        &:hover {
          background-color: #fff;
        }
      }
    }
    .add-class-modal {
      place-items: end center;
      ::v-deep .modal__layer {
        border-radius: 16px 16px 0 0;
        padding: 20px 28px 48px 28px;
        border: 0;
        .modal__footer {
          .btn-tertiary-blue {
            display: none;
          }
          .btn-primary {
            border-radius: 0;
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            margin: 0;
          }
        }
      }
    }
    // 모달 팝업 애니메이션
    .add-class-modal {
      transition: 0.5s ease;
      ::v-deep .modal__layer {
        transition: 0.5s ease;
      }
      overflow: hidden;
    }
    .add-class-modal.fade-leave-active,
    .add-class-modal.fade-enter-active {
      opacity: 0;
      ::v-deep .modal__layer {
        transform: translateY(40px);
      }
    }
    .add-class-modal.fade-enter-to {
      opacity: 1;
      ::v-deep .modal__layer {
        transform: translateY(0px);
      }
    }
    .add-class-modal.fade-leave-to {
      opacity: 0;
      ::v-deep .modal__layer {
        transform: translateY(40px);
      }
    }
  }
}
</style>
