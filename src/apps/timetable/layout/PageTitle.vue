<template>
  <div class="page-tit">
    <div class="tits">
      <h2>{{ currentTitle.label }}</h2>     
      <HelpButton 
        :id="currentTitle.label"
        :active="helpOn === currentTitle.label"
      />
      <div class="desc">
        <span v-html="currentTitle.desc"></span>
        <HelpButton v-if="currentStepIndex === 0" :id="'고교학점제'" :active="helpOn === '고교학점제'">
          <span class="txt-primary btn-link btn">고교학점제를 운영 중이신가요?</span>
        </HelpButton>
      </div>
    </div>
    <div class="btns" v-if="!isLastStep">
      <button
        v-if="!isHiddenPrev"
        type="button" class="btn btn-lg btn-secondary btn-ico-left" 
        @click="handleClickPrev">
        <i class="ico ico-arrow-left ico-size-20" />이전
      </button>
      <button v-if="!isDisableButton" type="button" class="btn btn-lg btn-primary btn-ico-right" @click="handleClickNext">
        다음<i class="ico ico-arrow-right ico-size-20" />
      </button>
    </div>
    <div class="btns" v-else>
      <button
        :disabled="isDisableButton"
        type="button" class="btn btn-lg btn-secondary btn-ico-left" 
        @click="handleClickPrev">
        <i class="ico ico-arrow-left ico-size-20" />이전
      </button>

      <div class="complete-btn">
        <button type="button" class="btn btn-lg btn-primary btn-ico-right pr-40" @click="handleClickApplyDailyTimetable" :disabled="!isCompletable">
          전체시간표에 반영하기 
        </button>
        <HelpButton 
          :id="'시간표 생성 완료'"
          :active="helpOn === '시간표 생성 완료'"
          class="btn-help-w"
        />
      </div>
      <HiSelectBox
        ref="downloadSelectBox"
        class="dropdown lg"
        :empty-title="'Default Type'"
        v-if="isCompletable"
      >
        <template #btnType>
          <i class="ico ico-download ico-size-20" /> 인쇄
        </template>
        <template #custom-option>          
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.All, DownloadType.Hwp)">전체 주간 시간표 (*.hwp)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.All, DownloadType.Excel)">전체 주간 시간표 (*.xlsx)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.Class, DownloadType.Hwp)">학급별 주간 시간표 (*.hwp)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.Class, DownloadType.Excel)">학급별 주간 시간표 (*.xlsx)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.Teacher, DownloadType.Hwp)">교사별 주간 시간표 (*.hwp)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.Teacher, DownloadType.Excel)">교사별 주간 시간표 (*.xlsx)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.SpecialtyRoom, DownloadType.Hwp)">특별실 시간표 (*.hwp)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.SpecialtyRoom, DownloadType.Excel)">특별실 시간표 (*.xlsx)</button>
          <button class="option" type="button" @click="() => handleClickDownload(TimetableViewType.Neis, DownloadType.Excel)">NEIS용 일괄 파일 (*.csv)</button>
        </template>
      </HiSelectBox> 
    </div>
    <!--
    <TimeTableModal v-if="isTimeTable" size="sm" @close="isTimeTable = false" class="time-table-modal">
      <template v-slot:heading>
        기초 시간표 생성 완료 
        <p class="smr">
          기초시간표 생성 완료하여 전체시간표에 적용합니다. 
        </p>
      </template>
      <template v-slot:content>
        <div class="gray-box">                    
          <div class="h5-tit">
            <h5>1. 시간표 명 : <span class="pl-05">화랑중학교 2025년도 2학기 시간표</span></h5>
          </div>
        </div>
        <div class="gray-box">
          <div class="h5-tit">
            <h5>2. 시간표 반영 기간을 등록해 주세요.</h5>
            <div class="smr">
              시간표가 운영될 한 학기 동안의 시작일과 종료일을 설정하세요.
            </div>
          </div>
          <div class="datepick">
            <HiDatePicker
              placeholder="선택하세요"
              :format="'YYYY년 M월 D일'"
              :valueType="'YYYY-MM-DD'"
              v-model="dateStart"
              @change="onChangeDateStart"
            />
            <span class="wave">~</span>
            <HiDatePicker
              placeholder="선택하세요"
              :format="'YYYY년 M월 D일'"
              :valueType="'YYYY-MM-DD'"
              v-model="dateEnd"
              @change="onChangeDateEnd"
            />
          </div>
        </div>        
      </template>
      <template v-slot:footer>
        <button type="button" class="btn btn-tertiary ml-10" @click="isTimeTable = false">취소</button>
        <button type="button" class="btn btn-primary" @click="" disabled="false">반영하기</button>
      </template>
    </TimeTableModal>
    -->
    <apply-to-daily-timetable-dialog
      v-if="isShowApplyDailyTimetable"
      :on-cancel="handleCloseApplyDailyTimetable"
      :on-submit="handleSubmitApplyDailyTimetable"
    />

    <timetable-print-option-dialog
      v-if="isShowPrintOptionDialog"
      @confirm="handleConfirmPrintOptionDialog"
      @close="handleClosePrintOptionDialog"
    />
  </div>  
</template> 

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useMenuManager } from '../composables/menuManager';
import ApplyToDailyTimetableDialog from '@/apps/timetable/components/ApplyToDailyTimetableDialog.vue';
import HelpButton from '@/apps/timetable/components/HelpButton.vue';
import { DownloadType, TimetableViewType } from '../common/types';
import { ContextKeys, TimetableProgressContext } from '../contexts';
import { useDialog } from '../composables/dialog';
import TimetablePrintOptionDialog from '@/apps/timetable/components/TimetablePrintOptionDialog.vue';
import { ExcelExportSortType } from '@/apps/timetable/core/types';

const isShowPrintOptionDialog = ref(false);
const downloadSelectBox = ref();
let resolvePrintDialog: ((value: any) => void) | null = null;

const progressContext = inject(ContextKeys.TimetableProgress) as TimetableProgressContext;
const openHelp = inject<(id: string) => void>('openHelp');

const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
  pageRef: {
    required: false,
  },
  stepProgressRef: {
    required: false,
  },  
  helpOn: {
    type: String,
    default: 0,
  },
});

const menuManager = useMenuManager();
const dialog = useDialog();
const isShowApplyDailyTimetable = ref(false);
const dateStart = ref(null);
const dateEnd = ref(null);

const isCompletable = computed(() => progressContext.isCompletable);

/*
const onChangeDateStart = (value) => {
  dateStart.value = value;
};

const onChangeDateEnd = (value) => {
  dateEnd.value = value;
};
*/

const isHiddenPrev = computed(() => {
  const currentStepIndex = menuManager.getCurrentMenuIndex();
  const prevStepIndex = currentStepIndex - 1;
  return prevStepIndex < 0;
});

const templateId = computed(() => { return progressContext.templateId || undefined; });
// 2026.1.19 > 스텝 이동 제한 해제
// const isDisableButton = computed(() => progressContext.status === TimetableStatus.Finish);
const isDisableButton = computed(() => false);

const isLastStep = computed(() => {
  const currentStepIndex = menuManager.getCurrentMenuIndex();
  return currentStepIndex === 6;
})

const currentStepIndex = computed(() => {
  return menuManager.getCurrentMenuIndex();
});

// 현재 스텝에 맞는 데이터 가져오기
const currentTitle = computed(() => {
  const steps = menuManager.getMenuSteps?.() || [];
  const step = steps[currentStepIndex.value] || { label: '', desc: '' };
  return {
    label: step.label,
    desc: step.desc 
  };
});

const handleClickApplyDailyTimetable = () => {
  isShowApplyDailyTimetable.value = true;
};

const handleCloseApplyDailyTimetable = () => {
  isShowApplyDailyTimetable.value = false;
};

const handleSubmitApplyDailyTimetable = () => {
  isShowApplyDailyTimetable.value = false;

  dialog.toast("시간표 반영이 완료되었습니다.");
};

const handleClickDownload = async (viewType: TimetableViewType, downloadType: DownloadType) => {
  downloadSelectBox.value && downloadSelectBox.value.close();

  // pageRef 타입이 지정되지 않아 any 취급: 안전하게 선택적 체이닝 사용
  const pageRef: any = props.pageRef;
  if (downloadType === DownloadType.Hwp) {
    await dialog.alertSimple('추후 업데이트 예정입니다.');
    return;
  }

  let sortType = null;

  if (viewType === TimetableViewType.All || viewType === TimetableViewType.Teacher) {
    sortType = await new Promise((resolve) => {
      resolvePrintDialog = resolve;
      isShowPrintOptionDialog.value = true;
    });

    if (!sortType) return;
  }

  if (pageRef?.handleClickDownload) {
    await pageRef.handleClickDownload(viewType, downloadType, sortType);
  }
};

const handleConfirmPrintOptionDialog = ({ sortType }: { sortType: ExcelExportSortType}) => {
  isShowPrintOptionDialog.value = false;
  resolvePrintDialog && resolvePrintDialog(sortType);
};

const handleClosePrintOptionDialog = () => {
  isShowPrintOptionDialog.value = false;
  if (resolvePrintDialog) {
    resolvePrintDialog(null);
  }
}

const handleClickNext = async () => {
  const pageRef: any = props.pageRef;
  const checkBeforeMove = pageRef?.checkBeforeMove;
  if (checkBeforeMove && !(await checkBeforeMove())) {
    return;
  }

  console.log('templateId', templateId.value);

  menuManager.goNextStep(templateId.value);
};

const handleClickPrev = async () => {
  const pageRef: any = props.pageRef;
  const checkBeforePrevMove = pageRef?.checkBeforePrevMove;
  if (checkBeforePrevMove) {
    checkBeforePrevMove()
  }
  menuManager.goPrevStep(templateId.value);
};

// const emit = defineEmits(['openHelp', 'close-help']);

// function openHelp(id: string) {
//   if (!id) {
//     emit('close-help');
//     emit('openHelp', '');
//     return;
//   }
//   emit('openHelp', id);
// }
</script>

<style lang="scss">
.time-table-wrap .page-tit .txt-primary.btn-link.btn{
  text-decoration: underline ;
  font-size: 13px;
  margin-left: 4px ;
}
</style>
<style scoped lang="scss">
.page-tit {
  background-color: #F8F9FC;
  padding: 18px 30px;
  display: flex ;
  justify-content: space-between;
  position: sticky;
  top: 72px;
  background: #F8F9FC;
  z-index: 12;
  .tits{
    display: flex ;
    // gap: 24px;
    align-items: center;
    h2{  
      font-size: 20px;
      font-weight: bold;
      line-height: 136%;
      letter-spacing: -0.5px;
      color:#000;              
    }
    .desc{
      font-size: 13px;
      line-height: 160%;
      color: var(--gray-10);
      margin-left: 24px;
    }
    .btn {
      &[class*=btn-help] {
        margin-left: 8px;
      }
    }
  }
  .btns{
    display: flex;
    align-items: center;
    gap: 8px;
    transition: 0.3s ease-in-out;
    position: relative;
    .pr-40{
      padding-right: 50px !important ;
    }
    .btn-help-w{
      position: absolute;
      right: 25px;
      top: 13px;
    }
    .complete-btn{
      position: relative;
    }
  }
  .hi-selectbox{
    ::v-deep {
      .option__layer{
        width: 236px;
        left: auto;
        right: 0;
      }
      .selected:hover:not(:disabled):not(.readonly), 
      .selected:focus:not(:disabled):not(.readonly){
        background-color: rgba(0, 0, 0, 0.04);
        border: 1px solid #D6D6D6;
        color: #1d1d1d;
      }
    }
  }
}
.time-table-modal{
  ::v-deep .modal__layer{
    height: 680px;
  }
  .hi-datepicker{
    margin-top: 20px;      
  }
}
</style>