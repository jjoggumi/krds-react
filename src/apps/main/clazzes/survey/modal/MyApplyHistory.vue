<!-- [모달] 나의 신청 내역 -->
<template>
  <div>
    <div class="hi-modal-common modal-survey-fcfs" style="display: block;">
      <div class="modal__dim"></div>
      <div class="modal__layer">
        <div class="modal__header">
          <h2 class="heading">나의 신청 내역</h2>
          <button class="btn-close" @click="closeModal()"></button>
        </div>

        <div v-if="!myApplyHistory.isDetail">
          <div v-if="isLoading" class="modal__content">
            <Loading />
          </div>
          <div v-if="!isLoading && myApplyHistoryListRespondent.length === 0" class="modal__content">
            <div class="hi-nodata"><p>신청 내역이 없습니다.</p></div>
          </div>
          <div v-if="!isLoading && myApplyHistoryListRespondent.length > 0" class="modal__content">
            <!-- <strong class="heading">최종 제출 완료한 신청내역은 <span class="ft-blue">확인 및 변경이 가능</span>합니다. </strong> -->
              <template v-if="myApplyHistoryList.surveyStatus === 'END'">
                <p class="desc">
                    설문 종료 이후에는 신청내역 확인만 가능합니다.
                </p>
              </template>

              <template v-else>
                <strong class="heading">설문 기간 내에는 최종 제출 완료한 신청 내역도 <span class="ft-blue">확인 및 변경이 가능</span>합니다.</strong>
                <p class="desc">신청내역 삭제 (취소)를 원하시면 응답 삭제 후 다시 설문을
              진행해주세요.</p>
              </template>
            <!-- 신청 내역 list -->
            <transition-group name="fade">
              <div
                class="survey__details"
                :class="{ ing: item.answerStatus === 'TEMPORARY' && myApplyHistoryList.surveyStatus === 'DOING' }"
                v-for="(item, index) in myApplyHistoryListRespondent"
                :key="'myApplyHistoryList' + index"
              >
                <span v-if="item.answerStatus === 'TEMPORARY' && myApplyHistoryList.surveyStatus === 'DOING'" class="label ing">진행중</span>
                <span v-if="item.answerStatus === 'TEMPORARY' && myApplyHistoryList.surveyStatus === 'END'" class="label none">미완료</span>
                <span v-if="item.answerStatus === 'COMPLETE'" class="label complete">신청완료</span>
                <span v-if="item.answerStatus === 'REJECT'" class="label donot">참여안함</span>

                <span class="name">{{ item.subjectName ? item.subjectName : '익명설문' }}</span>
                <span class="class">{{ item.className }}</span>
                <span v-if="item.answerStatus !== 'TEMPORARY'" class="date">
                  {{ $moment(item.answeredTimestamp).format('YY.MM.DD HH:mm:ss') }}
                </span>

                <button v-if="myApplyHistoryList.surveyStatus !== 'END'" class="btn-delete" @click="deleteAnswer(item.respondentId)">
                  응답삭제
                </button>
                <button
                  v-if="item.answerStatus === 'TEMPORARY' && myApplyHistoryList.surveyStatus === 'DOING'"
                  class="hi-btn btn-md"
                  @click="goContinue(item.respondentId)"
                >
                  이어서 하기
                </button>
                <button
                  v-if="item.answerStatus === 'COMPLETE'"
                  class="hi-btn btn-md btn-line-lgray"
                  @click="goDetail(item.respondentId, item.subjectName)"
                >
                  <template v-if="myApplyHistoryList.surveyStatus === 'END'">
                    상세 확인
                  </template>

                  <template v-else>
                    상세 확인 및 변경
                  </template>
                </button>
              </div>
            </transition-group>

            <button v-if="myApplyHistoryList.surveyStatus !== 'END'" class="btn-add-children" @click="anoterSurvey()">
              <strong>같은반 다른 자녀로 설문하기</strong>
              <span>한 자녀인데 추가 설문하시면 중복 될 수 있으니 주의하세요.</span>
            </button>
          </div>
        </div>

        <!-- Detail-->
        <my-apply-history-detail v-if="myApplyHistory.isDetail" @refreshMyApplyHistoryList="refreshMyApplyHistoryList" />
      </div>
    </div>
    <div class="survey__header is-fixed"></div>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import _ from 'lodash';
import { eventBus } from '@/main';
import MyApplyHistoryDetail from './MyApplyHistoryDetail.vue';
import Loading from '@/components/Loading/Loading.vue';

export default {
  components: {
    MyApplyHistoryDetail,
    Loading,
  },
  props: {},
  data() {
    return {
      myApplyHistoryList: [],
      myApplyHistoryListRespondent: [],
      isLoading: false,
    };
  },
  computed: {
    ...mapState({
      user: 'user', // 현재 사용자 정보
    }),
    ...mapState('storeSurvey', {
      surveys: 'surveys', // 기존에 만들어진 설문 STATE
      myApplyHistory: 'myApplyHistory', // 나의신청내역 STATE
      isAnotherSurvey: 'isAnotherSurvey', // 다자녀 설문 여부
      surveySearchQuery: 'surveySearchQuery', // 설문조사 검색 쿼리 (기존 것 사용)
    }),
  },
  async created() {
    await this.updateMyApplyHistoryList();
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
      setMyApplyHistoryMySubjectName: 'setMyApplyHistoryMySubjectName',
      setMyApplyHistoryIsListRespondent: 'setMyApplyHistoryIsListRespondent',
      setMyApplyHistoryIsDetail: 'setMyApplyHistoryIsDetail',
    }),
    async updateMyApplyHistoryList() {
      this.isLoading = true;
      // 나의 설문 내역
      await this.$axios
        .get(`/v2/surveys/${this.myApplyHistory.mySurveyId}`)
        .then(res => {
          this.myApplyHistoryList = res.data;
        })
        .catch(err => {
          this.$log.debug(err);
        });

      await this.$axios
        .get(
          `/surveys/answer/${this.myApplyHistory.mySurveyId}/respondent?userId=${this.user.currentId}&answerStatuses=COMPLETE&answerStatuses=REJECT&answerStatuses=TEMPORARY`
        )
        .then(res => {
          this.myApplyHistoryListRespondent = res.data._embedded.respondents;
        })
        .catch(err => {
          this.$log.debug(err);
        });

      this.isLoading = false;
    },
    /**
     * @param : respondentId 설문 응답 ID
     * @return : myApplyHistoryListRespondent 에서 해당 설문이 제거됨
     */
    deleteAnswer(respondentId) {
      this.$hiClass
        .confirm('응답을 삭제하시겠습니까?<br>삭제된 응답은 복원이 불가능합니다.')
        .then(() => {
          this.$axios
            .delete(`/surveys/respondents/${respondentId}`)
            .then(res => {
              const deleteRespondentId = _.findIndex(this.myApplyHistoryListRespondent, item => item.respondentId === respondentId);
              this.myApplyHistoryListRespondent.splice(deleteRespondentId, 1);
              if (this.myApplyHistoryListRespondent.length === 0) {
                //this.myApplyHistory.isListRespondent = false;
                this.setMyApplyHistoryIsListRespondent(false);
              }
            })
            .catch(err => {
              this.$log.debug(err);
            });
        })
        .catch(() => {
          return;
        });
    },
    refreshMyApplyHistoryList(respondentId){
      this.$log.debug('==== respondentId',respondentId)
      const deleteRespondentId = _.findIndex(this.myApplyHistoryListRespondent, item => item.respondentId === respondentId);
      this.myApplyHistoryListRespondent.splice(deleteRespondentId, 1);
    },
    closeModal() {
      this.myApplyHistory.isModalOpen = false;
      this.setMyApplyHistoryIsDetail(false);
      // 설문투표 리스트 버튼 갱신
      /**
       * @description : 설문투표 리스트 버튼 갱신
       * @todo : survey의 정보를 vuex로 가지고 온다면 eventBus를 사용하지 않아도 된다.
       */
      if (!this.myApplyHistory.isListRespondent) {
        eventBus.$emit('updateSurveyList');
      }
    },
    // 설문 이어서 하기
    goContinue(respondentId) {
      const surveyId = this.myApplyHistory.mySurveyId;
      const routeObj = {
        path: `/survey-response/${surveyId}`,
      };
      if (respondentId) {
        routeObj.query = { respondentId: respondentId };
      }

      this.$router.push(routeObj, () => {});
      this.myApplyHistory.isModalOpen = false;
    },
    anoterSurvey() {
      // 현재 진행중인 설문이 있는지 확인
      const isIngSurvey = _.some(this.myApplyHistoryListRespondent, {
        answerStatus: 'TEMPORARY',
      });

      if (isIngSurvey) {
        this.$hiClass
          .confirm('진행중인 설문이 있습니다.<br>이어서 설문하시겠습니까?')
          .then(() => {
            const continueSurveyId = _.find(this.myApplyHistoryListRespondent, {
              answerStatus: 'TEMPORARY',
            }).respondentId;
            this.goContinue(continueSurveyId);
          })
          .catch(() => {
            return;
          });
      } else {
        this.$hiClass
          .confirm('같은 반에 2명 이상의 자녀가 있으신가요?<br>다른 자녀로 추가 설문하시겠습니까?')
          .then(() => {
            this._goAnoterSurvey();
          })
          .catch(() => {
            return;
          });
      }
    },
    // 다른자녀 설문하기
    _goAnoterSurvey() {
      this.initSurveyResponse(); // commit('setSurveyResponseBodyName', 'INTRO')
      this.clearSurveys(); // commit('setSurveys', {})
      this.clearSurveysRespondentInfo(); // commit('setSurveysRespondentInfo', {})
      this.clearIsReject(); // commit('setIsReject', false)
      this.initIsSimulation(); // commit('setIsSimulation', false)
      this.clearCurSurveyAnswer(); // commit('setCurSurveyAnswer', {})

      // 2. 설문정보 다시 한번 가져오기
      const surveyId = this.myApplyHistory.mySurveyId;

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
        this.myApplyHistory.isModalOpen = false;

        // 5. 설문응답 페이지로 이동
        this.$router.push(`/survey-response/${surveyId}`);
      });
    },
    goDetail(respondentId, subjectName) {
      // 상세페이지 진입 여부
      this.setMyApplyHistoryIsDetail(true);
      this.myApplyHistory.myRespondentId = respondentId;
      if (subjectName) {
        this.setMyApplyHistoryMySubjectName(subjectName);
      } else {
        this.setMyApplyHistoryMySubjectName('익명');
      }

      // 방과후 활동일 경우
      if (this.myApplyHistoryList.surveyType === 'AFTER_SCHOOL') {
        this.myApplyHistory.isAfterSchool = true;
        this.myApplyHistory.isConsultation = false;
      }

      // 학부모 상담일 경우
      if (this.myApplyHistoryList.surveyType === 'CONSULTATION') {
        this.myApplyHistory.isConsultation = true;
        this.myApplyHistory.isAfterSchool = false;
      }
    },
  },
};
</script>
<style scoped>
.desc {
  font-size: 14px;
  margin: 5px 0 20px;
}
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
