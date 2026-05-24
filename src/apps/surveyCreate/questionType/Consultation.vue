<template>
  <div class="survey-create__box">
    <survey-create-body-question-tag />
    <survey-create-body-question-title />
    <survey-create-body-question-description />
    <survey-create-body-question-upload />

    <survey-create-question-type-consultation-edit v-if="!isCurSurveyPublished" ref="consultationEdit" />

    <button v-if="!isCurSurveyPublished" class="hi-btn btn-xl" @click="onClickCreateCalendar">
      {{ isCurSurveyPublished ? '수정하기' : '상담 달력 만들기' }}
    </button>

    <template v-if="isOpenCalendar">
      <ul class="text-notice">
        <li>- 정해진 상담 시간 외에 상담 시간을 추가하거나 변경 하실 수 있습니다.</li>
        <li>- 신청내역이 있는 시간은 수정이 불가합니다.</li>
      </ul>
      <consultation-calendar
        :surveys-consultation-calendar="surveysConsultationCalendar"
        :consultation-setting="consultationSetting"
        :isCreate="true"
      />
    </template>
  </div>
</template>

<script>
import SurveyCreateBodyQuestionTitle from '@/apps/surveyCreate/SurveyCreateBodyQuestionTitle.vue';
import SurveyCreateBodyQuestionUpload from '@/apps/surveyCreate/SurveyCreateBodyQuestionUpload.vue';
import SurveyCreateQuestionTypeConsultationEdit from '@/apps/surveyCreate/questionType/ConsultationEdit.vue';
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import ConsultationCalendar from '@/components/Calendar/ConsultationCalendar.vue';
import SurveyCreateBodyQuestionDescription from '@/apps/surveyCreate/SurveyCreateBodyQuestionDescription.vue';
import SurveyCreateBodyQuestionTag from '@/apps/surveyCreate/SurveyCreateBodyQuestionTag.vue';

export default {
  name: 'survey-create-question-type-consultation',
  components: {
    SurveyCreateBodyQuestionTag,
    SurveyCreateBodyQuestionDescription,
    ConsultationCalendar,
    SurveyCreateQuestionTypeConsultationEdit,
    SurveyCreateBodyQuestionUpload,
    SurveyCreateBodyQuestionTitle,
  },
  data() {
    return {
      // isDrag: false,
      isOpenCalendar: false,
      pageModel: {
        linkPage: {
          pageId: undefined,
          pageName: undefined,
          sortNo: undefined,
        },
      },
      questionModel: {
        isValidated: undefined,
        isLinkedPage: undefined,
        questionType: undefined,
        questionTitle: undefined,
      },
    };
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditQuestions: 'surveyEditQuestions',
      surveyEditPages: 'surveyEditPages',
      surveysConsultationCalendar: 'surveysConsultationCalendar',
      isChangedSurveyEditQuestions: 'isChangedSurveyEditQuestions',
    }),
    ...mapGetters('storeSurvey', {
      isCurSurveyPublished: 'isCurSurveyPublished',
    }),
    consultationSetting: {
      get() {
        return this.surveyEditQuestions.consultationSetting;
      },
      set(val) {
        return (this.surveyEditQuestions.consultationSetting = val);
      },
    },
  },
  watch: {
    surveyEditQuestions: {
      async handler() {
        this.setIsChangedSurveyEditQuestions(true);

        const surveyEditQuestions = this.surveyEditQuestions;
        this.questionModel.isValidated = await this.getIsValidatedByStateSurveyEditQuestions();
        this.questionModel.isLinkedPage = surveyEditQuestions.isLinkedPage;
        this.questionModel.questionType = surveyEditQuestions.questionType;
        this.questionModel.questionTitle = surveyEditQuestions.questionTitle;

        this.pageModel.linkPage.pageId = surveyEditQuestions.linkPageId;
      },
      deep: true,
    },
    questionModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId;
        const questionId = this.surveyEditQuestions.questionId;
        // lnbPages.question 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId);
        if (curPage) {
          const curQuestion = curPage.questions.find(question => question.questionId === questionId);
          if (curQuestion) {
            curQuestion.isValidated = this.questionModel.isValidated;
            curQuestion.isLinkedPage = this.questionModel.isLinkedPage;
            curQuestion.questionType = this.questionModel.questionType;
            curQuestion.questionTitle = this.questionModel.questionTitle;
          }
        }
      },
      deep: true,
    },
    pageModel: {
      handler() {
        const pageId = this.surveyEditQuestions.pageId;
        // lnbPages 매핑 후 수정
        const curPage = this.surveyEditPages.find(page => page.pageId === pageId);
        if (curPage) {
          if (curPage.linkPage) {
            curPage.linkPage.pageId = this.pageModel.linkPage.pageId;
          } else {
            this.$set(curPage, 'linkPage', this.pageModel.linkPage);
          }
        }
      },
      deep: true,
    },
    /*consultationSetting: {
      async handler() {
        if (!this.isOpenCalendar && this.consultationSetting && this.consultationSetting.settingId) {
          await this.getCalendar(this.consultationSetting)
          this.isOpenCalendar = true
        }
      },
      deep: true
    }*/
  },
  async mounted() {
    if (!this.isOpenCalendar && this.consultationSetting && this.consultationSetting.settingId) {
      
      if(!this.isCurSurveyPublished) {
        this.consultationEditDate()
      }

      await this.getCalendar(this.consultationSetting);
      this.isOpenCalendar = true;

      //  1.5.61 버전에서 제외
      const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay));
      await wait(300);
      this.setIsChangedSurveyEditQuestions(false);
    }
  },
  methods: {
    ...mapMutations({
      setIsLoading: 'setIsLoading',
    }),
    ...mapMutations('storeSurvey', {
      setIsChangedSurveyEditQuestions: 'setIsChangedSurveyEditQuestions',
    }),
    ...mapActions('storeSurvey', {
      temporarilySaveSurvey: 'temporarilySaveSurvey',
      getSurveyEditQuestions: 'getSurveyEditQuestions',
      getIsValidatedByStateSurveyEditQuestions: 'getIsValidatedByStateSurveyEditQuestions',
      getSurveysConsultationCalendar: 'getSurveysConsultationCalendar',
    }),
    async onClickCreateCalendar() {
      // try {
      //   await this.$refs.consultationEdit.$refs.timeSelectBoxes.validateTimeSelectBoxes()
      // } catch (e) {
      //   this.$log.warn(e)
      //   return false
      // }

      if (this.isCurSurveyPublished) {
        await this.createCalendarProc();
        this.$toasted.clear();
        this.$toasted.show('수정되었습니다.');
      } else {
        this.createCalendar();
      }
    },
    createCalendar() {
      this.$log.warn(this.$options.name, 'createCalendar() this.surveyEditQuestions', this.surveyEditQuestions);

      // 상담 기간이 현재일보다 이전 날짜인 경우
      const todayFormat = this.$moment().format('YYYY-MM-DD');
      const isBeforeToday = this.$moment(this.$refs.consultationEdit.dateStart).isBefore(todayFormat);
      if (isBeforeToday) {
        this.$toasted.clear();
        this.$toasted.show('상담 기간을 다시 확인해주세요.');
        return false;
      }

      // 상담 시작일이 종료일보다 이후 날짜인 경우
      const isBeforeDateEnd = this.$moment(this.$refs.consultationEdit.dateEnd).isBefore(this.$refs.consultationEdit.dateStart);
      if (isBeforeDateEnd) {
        this.$toasted.clear();
        this.$toasted.show('상담 종료기간이 시작기간보다 앞설 수 없습니다.');
        return false;
      }

      // 달력 생성 후 달력 재생성
      if (!this.consultationSetting.isTempSetting) {
        const opts = {
          reverseButtons: true,
        };
        this.$hiClass.confirm('기존에 생성된 내용이 모두 초기화 됩니다.<br>새로 만드시겠습니까?', 'warning', opts).then(() => {
          this.isOpenCalendar = false;
          this.surveyEditQuestions.items.splice(0);
          this.createCalendarProc();
        });
      } else {
        this.isOpenCalendar = false;
        this.createCalendarProc();
      }
    },
    async createCalendarProc() {
      const checkedValues = {
        dateStart: '상담 시작 기간',
        dateEnd: '상담 종료 기간',
        timeStart: '상담 시작 시간',
        timeEnd: '상담 종료 시간',
        timeConsultation: '상담 소요 시간',
        timeRecess: '선생님 휴식시간',
      };

      for (const key of Object.keys(checkedValues)) {
        if (!`${this.consultationSetting[key]}`) {
          this.$toasted.show(`${checkedValues[key]}을 확인해주세요.`);
          return false;
        }
      }
      this.setIsChangedSurveyEditQuestions(true);
      // this.setIsLoading(true);
      // 상담 정보 저장
      delete this.consultationSetting.isTempSetting;
      this.consultationEditDate()
      await this.temporarilySaveSurvey({});
      // 상담 시간 settingId 가져오기 (박종철: 응답값에서 state로 바로 바인딩 처리 하면서 주석 처리 함)
      /*if (!this.consultationSetting.settingId) {
        await this.getSurveyEditQuestions()
      }*/
      // this.setIsLoading(false);

      await this.getCalendar(this.consultationSetting);

      this.setIsChangedSurveyEditQuestions(false);
      this.isOpenCalendar = true;
    },
    async getCalendar(consultationSetting) {
      this.setIsLoading(true);

      const calendarRequest = {
        isHoliday: false,
        startDate: consultationSetting['dateStart'],
        endDate: consultationSetting['dateEnd'],
        startTime: consultationSetting['timeStart'],
        endTime: consultationSetting['timeEnd'],
        consultTime: consultationSetting['timeConsultation'],
        recessTime: consultationSetting['timeRecess'],
      };
      await this.getSurveysConsultationCalendar(calendarRequest);
      this.setIsLoading(false);
    },
    consultationEditDate: function() {
      if(!this.consultationSetting.dateStart || this.consultationSetting.dateStart !== this.$refs.consultationEdit.dateStart) {
        this.consultationSetting.dateStart = this.$refs.consultationEdit.dateStart
      }

      if(!this.consultationSetting.dateEnd || this.consultationSetting.dateEnd !== this.$refs.consultationEdit.dateEnd) {
        this.consultationSetting.dateEnd = this.$refs.consultationEdit.dateEnd
      }

      if(!this.consultationSetting.timeStart || this.consultationSetting.timeStart !== this.$refs.consultationEdit.model.timeStartEnd[0]) {
        this.consultationSetting.timeStart = this.$refs.consultationEdit.model.timeStartEnd[0]
      }

      if(!this.consultationSetting.timeEnd || this.consultationSetting.timeEnd !== this.$refs.consultationEdit.model.timeStartEnd[1]) {
        this.consultationSetting.timeEnd = this.$refs.consultationEdit.model.timeStartEnd[1]
      }

      if(!this.consultationSetting.timeConsultation || this.consultationSetting.timeConsultation !== this.$refs.consultationEdit.model.timeConsultation) {
        this.consultationSetting.timeConsultation = this.$refs.consultationEdit.model.timeConsultation
      }

      if(!this.consultationSetting.timeRecess || this.consultationSetting.timeRecess !== this.$refs.consultationEdit.model.timeRecess) {
        this.consultationSetting.timeRecess = this.$refs.consultationEdit.model.timeRecess
      }
    }
  },
};
</script>

<style scoped></style>

<style lang="scss"></style>
