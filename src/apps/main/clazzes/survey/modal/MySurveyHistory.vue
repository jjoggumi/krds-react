<!--
@File(Method): MySurveyHistory.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록 > 나의 설문 내역
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가 : label 추가
-->
<template>          
  <div>
    <div class="hi-modal-common modal-survey-fcfs" style="display: block;">
      <div class="modal__dim"></div>
      <div class="modal__layer">
        <div class="modal__header">
          <h2 class="heading">나의 설문 내역</h2>
          <button class="btn-close" @click="closeModal()"></button>
        </div>
        <div v-if="isLoading || mySurveyHistoryListRespondent.length === 0" class="modal__content">
          <div class="hi-nodata"><p>신청 내역이 없습니다.</p></div>
        </div>
        <div v-else class="modal__content">
          <strong class="heading">최종 제출 완료한 설문은 <span class="ft-blue">수정이 불가</span>합니다.</strong>
          <p class="desc">제출된 설문 응답을 수정하시려면, 응답 삭제 후 다시 설문을 진행해주세요.</p>

          <transition-group name="fade">
            <div
              class="survey__details"
              :class="{ ing: item.answerStatus === 'TEMPORARY' && mySurveyHistoryList.surveyStatus === 'DOING' }"
              @click="goDetail(item.respondentId, item.answerStatus)"
              v-for="(item, index) in mySurveyHistoryListRespondent"
              :key="index"
            >
              <!-- 진행중 경우만 ing 클래스 추가-->
              <span v-if="item.answerStatus === 'TEMPORARY' && mySurveyHistoryList.surveyStatus === 'DOING'" class="label ing">진행중</span>
              <span v-if="item.answerStatus === 'TEMPORARY' && mySurveyHistoryList.surveyStatus === 'END'" class="label none">미완료</span>
              <span v-if="item.answerStatus === 'COMPLETE' && item.waitStatus !== 'WAIT'" class="label complete"> {{completePrefix}}완료</span>
              <span v-if="item.answerStatus === 'REJECT'" class="label donot">참여안함</span>
              <span v-if="item.waitStatus === 'WAIT'" class="label none">대기신청</span>
              <span class="name">{{ item.subjectName ? item.subjectName : '익명설문' }}</span>
              <span class="class">{{ item.className }}</span>
              <span v-if="item.answerStatus !== 'TEMPORARY' && item.answeredTimestamp !== null" class="date">
                {{ $moment(item.answeredTimestamp).format('YY.MM.DD HH:mm:ss') }}
              </span>
              <button v-if="mySurveyHistoryList.surveyStatus !== 'END'" class="btn-delete" @click="deleteAnswer(item.respondentId)">응답삭제</button>
              <button
                v-if="item.answerStatus === 'TEMPORARY' && mySurveyHistoryList.surveyStatus === 'DOING'"
                class="hi-btn btn-md"
                @click="goContinue(item.respondentId)"
              >
                이어서 하기
              </button>
            </div>
          </transition-group>
          <button v-if="mySurveyHistoryList.surveyStatus !== 'END'" class="btn-add-children" @click="anoterSurvey()">
            <strong>같은반 다른 자녀로 설문하기</strong><span>한 자녀인데 추가 설문하시면 중복 될 수 있으니 주의하세요.</span>
          </button>
        </div>
      </div>
    </div>
    <div class="survey__header is-fixed"></div>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex';
import _ from 'lodash';
import { eventBus } from '@/main';

export default {
  components: {},
  props: {},
  data() {
    return {
      mySurveyHistoryList: {}, // 설문 정보
      mySurveyHistoryListRespondent: [], // 설문 응답 개수
      isLoading: false, // 데이터 로딩
    };
  },
  computed: {
    ...mapGetters(['CONSTANTS']),
    ...mapState({
      user: 'user', // 현재 사용자 정보
    }),
    ...mapState('storeSurvey', {
      surveys: 'surveys', // 기존에 만들어진 설문 STATE
      mySurveyHistory: 'mySurveyHistory', // 나의설문내역 STATE
      isAnotherSurvey: 'isAnotherSurvey', // 다자녀 설문 여부
    }),
    completePrefix() {
      return [
        this.CONSTANTS.SURVEY_TYPE.FCFS,
        this.CONSTANTS.SURVEY_TYPE.DRAW
      ].includes(this.mySurveyHistoryList.surveyType)
        ? '신청'
        : '설문';
    },
  },
  async created() {
    await this.updateMySurveyHistoryList();
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden');
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden');
  },
  methods: {
    ...mapActions('storeSurvey', {
      getSurveys: 'getSurveys',
      initSurveyResponse: 'initSurveyResponse',
      getSurveyContents: 'getSurveyContents',
      clearSurveys: 'clearSurveys',
      clearSurveysRespondentInfo: 'clearSurveysRespondentInfo',
      clearIsReject: 'clearIsReject',
      initIsSimulation: 'initIsSimulation',
      clearCurSurveyAnswer: 'clearCurSurveyAnswer',
    }),
    ...mapMutations('storeSurvey', {
      setSurveyResponseBodyName: 'setSurveyResponseBodyName',
      setSurveys: 'setSurveys',
    }),
    async updateMySurveyHistoryList() {
      this.isLoading = true;
      // 나의 설문 내역
      await this.$axios
        .get(`/v2/surveys/${this.mySurveyHistory.mySurveyId}`)
        .then(res => {
          this.mySurveyHistoryList = res.data;
        })
        .catch(err => {
          console.log(err);
        });

      await this.$axios
        .get(
          `/surveys/answer/${this.mySurveyHistory.mySurveyId}/respondent?userId=${this.user.currentId}&answerStatuses=COMPLETE&answerStatuses=REJECT&answerStatuses=TEMPORARY`
        )
        .then(res => {
          this.mySurveyHistoryListRespondent = res.data._embedded.respondents;
        })
        .catch(err => {
          console.log(err);
        });

      this.isLoading = false;
    },
    closeModal() {
      this.mySurveyHistory.isModalOpen = false;
      // 설문투표 리스트 버튼 갱신
      /**
       * @description : 설문투표 리스트 버튼 갱신
       * @todo : survey의 정보를 vuex로 가지고 온다면 eventBus를 사용하지 않아도 된다.
       */
      if (this.mySurveyHistoryListRespondent.length === 0) {
        eventBus.$emit('updateSurveyList');
      }
    },
    /**
     * @param : respondentId 설문 응답 ID
     * @return : MySurveyHistoryListRespondent 에서 해당 설문이 제거됨
     */
    deleteAnswer(respondentId) {
      this.$hiClass
        .confirm('응답을 삭제하시겠습니까?<br>삭제된 응답은 복원이 불가능합니다.')
        .then(() => {
          this.$axios
            .delete(`/surveys/respondents/${respondentId}`)
            .then(res => {
              const deleteRespondentId = _.findIndex(this.mySurveyHistoryListRespondent, item => item.respondentId === respondentId);
              this.mySurveyHistoryListRespondent.splice(deleteRespondentId, 1);
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(() => {
          return;
        });
    },
    anoterSurvey() {
      // 현재 진행중인 설문이 있는지 확인
      const isIngSurvey = _.some(this.mySurveyHistoryListRespondent, { answerStatus: 'TEMPORARY' });

      if (isIngSurvey) {
        this.$hiClass
          .confirm('진행중인 설문이 있습니다.<br>이어서 설문하시겠습니까?')
          .then(() => {
            const continueSurveyId = _.find(this.mySurveyHistoryListRespondent, { answerStatus: 'TEMPORARY' }).respondentId;
            this.goContinue(continueSurveyId);
          })
          .catch(() => {
            return;
          });
      } else {
        this.$hiClass
          .confirm('같은 반에 2명 이상의 자녀가 있으신가요?<br>다른 자녀로 추가 설문하시겠습니까?')
          .then(() => {
            this.goAnoterSurvey();
          })
          .catch(() => {
            return;
          });
      }
    },
    // 설문 상세 이동
    goDetail(serveyId, answerStatus) {
      // console.log('serveyId', serveyId)
      // console.log('answerStatus', answerStatus)
    },
    // 설문 이어서 하기
    goContinue(respondentId) {
      this.$log.debug('======== 설문 이어서 하기  ========');
      const surveyId = this.mySurveyHistory.mySurveyId;
      const routeObj = {
        path: `/survey-response/${surveyId}`,
      };
      if (respondentId) {
        routeObj.query = { respondentId: respondentId };
      }
      this.$router.push(routeObj, () => {});
      this.mySurveyHistory.isModalOpen = false;
    },
    // 다른자녀 설문하기
    goAnoterSurvey() {
      // 1. reset
      /**
       * SurveyResponseBodyName
       * Surveys
       * surveysRespondentInfo
       * IsReject
       * IsSimulation
       * CurSurveyAnswer
       * SimulationSurveyAnswer
       ** answerStatus : "TEMPORARY",
       ** answeredTimestamp: null,
       ** respondentId: null,
       ** surveyId: null
       */
      this.initSurveyResponse(); // commit('setSurveyResponseBodyName', 'INTRO')
      this.clearSurveys(); // commit('setSurveys', {})
      this.clearSurveysRespondentInfo(); // commit('setSurveysRespondentInfo', {})
      this.clearIsReject(); // commit('setIsReject', false)
      this.initIsSimulation(); // commit('setIsSimulation', false)
      this.clearCurSurveyAnswer(); // commit('setCurSurveyAnswer', {})
      // commit('setSimulationSurveyAnswer', {
      //   answerStatus : "TEMPORARY",
      //   answeredTimestamp: null,
      //   respondentId: null,
      //   surveyId: null
      // })

      // 2. 설문정보 다시 한번 가져오기
      const surveyId = this.mySurveyHistory.mySurveyId;

      setTimeout(() => {
        this.$axios.get(`/surveys/${surveyId}`).then(res => {
          res.data.answerStatus = 'WAIT';
          res.data.fromComplete = true;

          /**
           * answerStatus : WAIT
           * respondentId : null
           */
          this.setSurveys(res.data);
          this.$log.debug('res.data', res.data);
        });

        // 3. 다자녀 설문 페이지 인지 확인 값 저장 -> 해당값은 [patch] /surveys/info 에서 사용됨.
        this.$store.commit('storeSurvey/setIsAnotherSurvey', true);

        // 4. 모달 종료
        this.mySurveyHistory.isModalOpen = false;

        // 5. 설문응답 페이지로 이동
        this.$router.push(`/survey-response/${surveyId}`);
      });
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0s, height 0.3s, padding 0.3s, margin 0.3s, visibility 0.3s, transform 0.3s;
}
/* fadeIn */
.fade-enter {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  visibility: hidden;
}
.fade-enter-to {
}
/* fadeOut */
.fade-leave {
}
.fade-leave-to {
  opacity: 0;
  height: 0;
  margin: 0;
  padding: 0;
  visibility: hidden;
}
</style>
