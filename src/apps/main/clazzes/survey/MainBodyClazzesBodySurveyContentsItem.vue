<!--
@File(Method): MainBodyClazzesBodySurveyContentsItem.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 설문·투표 > 설문목록
@Modified: 2024-11-07 - #69524 설문 선착순/추첨 추가   /  button UI 디자인 시스템 적용
-->
<template>
  <div class="surveyvote__item" :class="{ 'is-new': !survey.isRead && activeTabCode === 'DOING' }">
    <div class="top">
      <div class="column">
        <div class="checkbox" v-if="activeTabCode === 'TEMPORARY'">
          <input type="checkbox" :id="survey.surveyId" @click="clickTemporarySurvey(survey.surveyId)" :disabled="!isActivateClass" />
          <label :for="survey.surveyId"></label>
        </div>
        <span class="category">
          {{ surveyType }} 
        </span>
      </div>
      <div class="column">
        <strong class="heading">
          {{ survey.surveyTitle }}
        </strong>

        <div v-if="isCurClassManager" class="group-btn">
          <button class="btn-edit" title="수정" @click="isActivateClass ? routeSurveyCreate(survey) : false"></button>
          <button class="btn-copy" title="복사" @click="isActivateClass ? copySurvey(survey) : false"></button>
          <button
            v-if="isShowSurveyDeleteBtn"
            class="btn-delete"
            title="삭제"
            @click="isActivateClass ? deleteSelectedSurvey(survey) : false"
          ></button>
        </div>

        <div class="date">
          <span v-if="surveyTimestampStr">
            {{ surveyTimestampStr }}
          </span>
          <span v-if="isReservationSurvey" :class="{ booking: isReservationSurvey }">
            {{ surveyPostedStr }}
            {{ isReservationSurvey ? '예약' : '' }}
          </span>
          <span v-if="survey.surveyStatus === 'END'" :class="{ complete: isAnswerComplete, end: !isAnswerComplete }">
            {{ answerStatusName }}
          </span>
          <span class="btn-participant" v-if="isMember"
            ><span>{{ survey.respondentCount || 0 }}명 응답</span></span
          >
        </div>
      </div>
      <!-- <div class="column" v-if="survey.surveyStatus === 'END' &&
       (survey.surveyType == 'CONSULTATION' || survey.surveyType == 'AFTER_SCHOOL')">
        <button
          class="hi-btn btn-md btn-line-lgray"
          @click="onClickComplete"
        >
          신청내역
        </button>
      </div> -->
      <div class="column">
        <!--
          isSurvey : 설문인가?
          isAfterSchool : 방과후활동인가?
          isCounseling : 학부모상담인가?
          isSurveyResponse : 설문응답 시도를 한것이 1개라도 있는가?
          isSurveyResponseTarget : 설문응답대상인가?
          isTeacher : 해당 클래스의 교사인가?
        -->
        <HiButton
          color="light-primary" size="md" outline class="btn-line-lgray"
          v-if="isSurvey && isSurveyResponseTarget && isSurveyResponse && activeTabCode === 'DOING'"
          @click="openMySurveyHistory(survey)"
        >
          나의 설문내역 확인
        </HiButton>
        <!-- 설문중 과 설문종료 시 버튼노출의 조건이 다름.-->
        <HiButton
          color="light-primary" size="md" outline class="btn-line-lgray"
          v-if="isSurvey && isSurveyResponseTarget && activeTabCode === 'END'"
          @click="openMySurveyHistory(survey)"
        >
          나의 설문내역 확인
        </HiButton>
        <HiButton
          class="hi-btn btn-md"
          v-else-if="!isSurveyResponse && isSurveyResponseTarget && activeTabCode === 'DOING'"
          @click="routeSurveyRespondent(survey)"
        >
          {{ submitButtonTitle }}
        </HiButton>
        <HiButton color="light-primary" size="md" outline class="btn-line-lgray"
        v-else-if="isTeacher && !isSurveyResponseTarget && activeTabCode !== 'TEMPORARY'" @click="routeSurveyPreview(survey)">
          미리보기
        </HiButton>
        <HiButton color="primary" size="md" outline
          class="hi-btn btn-md btn-line"
          v-else-if="(isAfterSchool || isCounseling) && isSurveyResponse && activeTabCode === 'DOING'"
          @click="openMyApplyHistory(survey)"
        >
          나의 신청내역 확인 및 변경
        </HiButton>
        <HiButton color="primary" size="md" outline
          v-else-if="(isAfterSchool || isCounseling) && activeTabCode === 'END'"
          @click="openMyApplyHistory(survey)"
        >
          나의 신청내역 확인 및 변경
        </HiButton>
        <!-- #69524 설문 선착순/추첨 추가 : 버튼 추가 -->
        <HiButton color="light-primary" size="md" outline class="btn-line-lgray"
          v-else-if="isFcfsOrDraw && isSurveyResponseTarget && isSurveyResponse && activeTabCode === 'DOING'"
          @click="openMySurveyHistory(survey)"
        >
          나의 신청내역 확인
        </HiButton>
        <HiButton color="light-primary" size="md" outline class="btn-line-lgray"
          v-else-if="isFcfsOrDraw && isSurveyResponseTarget && activeTabCode === 'END'"
          @click="openMySurveyHistory(survey)"
        >
          나의 신청내역 확인
        </HiButton>
      </div>
      <div class="column" v-if="isPublishedSurvey && survey.isTarget">
        <!-- <button
          v-if=" survey.surveyType !== 'CONSULTATION' && survey.surveyType !== 'AFTER_SCHOOL'"
          class="hi-btn btn-md"
          :class="{
            'btn-line': isAnswerComplete
          }"
          @click=
            "isActivateClass ?
             routeSurveyRespondent(survey) :
             false"
        >
          {{ submitButtonTitle }}
        </button>
        <button
          v-if="survey.surveyType == 'CONSULTATION' || survey.surveyType == 'AFTER_SCHOOL'"
          class="hi-btn btn-md"
          :class="{
            'btn-line': isAnswerComplete
          }"
          @click=
            "isActivateClass ?
             routeSurveyRespondent(survey) :
             false"
        >
          {{ submitButtonTitle }}
        </button> -->
        <!-- <button
          v-if="survey.surveyType == 'CONSULTATION' || survey.surveyType == 'AFTER_SCHOOL'"
          class="hi-btn btn-md btn-line-lgray"
          @click="onClickComplete"
        >
          신청내역
        </button> -->
      </div>
    </div>

    <div class="bottom" v-if="activeTabCode !== 'TEMPORARY' && !isMember">
      <HiButton color="link" class="btn-participant" @click="isActivateClass ? openSurveyRespondentsModal(survey) : false">
        <i v-if="survey.isUsedUrl" class="icon-link"></i>
        <span>{{ survey.respondentCount || 0 }}명 응답</span>
      </HiButton>
      <div class="group-btn">
        <button class="btn-stats" @click="isActivateClass ? routeSurveyStatistics(survey) : false">
          통계 및 개별조회
          <div class="hi-tooltip" v-if="survey.surveyStatus === 'DOING' && survey.surveyType === 'CONSULTATION'">
            <span>응답 초기화(신청취소)도 가능합니다.</span>
          </div>
        </button>
        <button class="btn-participant" @click="isActivateClass ? openSurveyRespondentsModal(survey) : false">
          응답자 조회
        </button>
        <button class="btn-preview" @click="isActivateClass ? routeSurveyPreview(survey) : false">
          미리보기
        </button>
        <button
            v-if="survey.surveyStatus === 'DOING'"
            class="btn-hitalkshare"
            @click="shareHitalk(survey)"
        >
          하이톡 공유
        </button>
        <!--        <button-->
        <!--          v-if="survey.isUsedUrl"-->
        <!--          class="btn-link"-->
        <!--          @click=-->
        <!--            "isActivateClass ?-->
        <!--             copySurveyUrl(survey) :-->
        <!--             false"-->
        <!--        >-->
        <!--          설문주소복사-->
        <!--        </button>-->
        <!--        TODO 3차-->
        <!--        <button class="btn-hitalkshare">하이톡 공유</button>-->
        <button v-if="survey.surveyType" class="btn-share" @click="shareSurvey(survey)">
          설문양식공유
        </button>
        <!--        TODO 3차-->
        <!--        3차 <button class="btn-folder">자료실</button>-->
        <button v-if="survey.surveyStatus === 'DOING'" class="btn-end" @click="isActivateClass ? closeSurvey(survey) : false">
          설문종료
        </button>
      </div>
    </div>
    <!-- 버튼 디자인 시스템 적용 <div class="bottom" v-if="activeTabCode !== 'TEMPORARY' && !isMember">
      <HiButton color="link" class="btn-participant" @click="isActivateClass ? openSurveyRespondentsModal(survey) : false">
        <i v-if="survey.isUsedUrl" class="icon-link"></i>
        <span>{{ survey.respondentCount || 0 }}명 응답</span>
      </HiButton>
      <div class="group-btn1">
        <HiButton color="primary" size="xs" outline bitrounded @click="isActivateClass ? routeSurveyStatistics(survey) : false">
          통계 및 개별조회
          <div class="hi-tooltip" v-if="survey.surveyStatus === 'DOING' && survey.surveyType === 'CONSULTATION'">
            <span>응답 초기화(신청취소)도 가능합니다.</span>
          </div>
        </HiButton>   
        <HiButton color="default" size="xs" outline bitrounded class="btn-participant" @click="isActivateClass ? openSurveyRespondentsModal(survey) : false">
          응답자 조회
        </HiButton>
        <HiButton color="default" size="xs" outline bitrounded class="btn-preview" @click="isActivateClass ? routeSurveyPreview(survey) : false">
          미리보기
        </HiButton>
        <HiButton color="default" size="xs" outline bitrounded
            v-if="survey.surveyStatus === 'DOING'"
            class="btn-hitalkshare"
            @click="shareHitalk(survey)"
        >
          하이톡 공유
        </HiButton>
        <HiButton color="default" size="xs" outline bitrounded v-if="survey.surveyType" class="btn-share" @click="shareSurvey(survey)">
          설문양식공유
        </HiButton>
        <HiButton color="default" size="xs" outline bitrounded v-if="survey.surveyStatus === 'DOING'" class="btn-end" @click="isActivateClass ? closeSurvey(survey) : false">
          설문종료
        </HiButton>     
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
import { eventBus } from '@/main';
import HiButton from '@/components/Button/HiButton.vue';

export default {
  name: 'main-body-clazzes-body-survey-contents-item',
  components: {HiButton},
  props: {
    survey: {
      type: Object,
    },
  },
  data() {
    return {
      completeModalFlag: false,
      surveyId: '',
      respondentList: [],
      isSurvey: false, // 설문 유형인 경우
      isSurveyResponse: false, // 해당 설문을 1건이라도 완료 했는지 유무
      isSurveyResponseTarget: false, // 설문 대상 유무
      isTeacher: false, // 클래스 선생님 유무
      isAfterSchool: false, // 방과후 신청 유무
      isCounseling: false, // 학부모 상담 유무
    };
  },
  created() {
    // 컴포넌트 로드 시 설문 상태 체크
    this.checkSurveyStatus();
  },
  update() {},
  mounted() {},
  computed: {
    ...mapState({
      isCurClassManager: 'isCurClassManager',
      curClassItem: 'curClassItem',
      user: 'user',
    }),
    ...mapState('storeSurvey', {
      surveySearchQuery: 'surveySearchQuery',
      mySurveyHistory: 'mySurveyHistory', // [modal] 내 설문 내역
      myApplyHistory: 'myApplyHistory', // [modal] 내 신청 내역
    }),
    ...mapState('storeClazzes', {
      clazzMemberRole: 'clazzMemberRole',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    surveyTimestampStr() {
      const strFormat = 'MM월 DD일 HH:mm';
      const timestampStart = this.survey.timestampStart ? this.$moment(this.survey.timestampStart).format(strFormat) : '';
      const timestampEnd = this.survey.timestampEnd ? this.$moment(this.survey.timestampEnd).format(strFormat) : '';
      return timestampStart && timestampEnd ? `${timestampStart} ~ ${timestampEnd}` : '';
    },
    surveyPostedStr() {
      return this.survey.surveyPosted ? this.$moment(this.survey.surveyPosted).format('MM월 DD일 HH:mm') : '';
    },
    isReservationSurvey() {
      return this.survey.surveyStatus === this.CONSTANTS.SURVEY_STATUS.RESERVATION;
    },
    isPublishedSurvey() {
      switch (this.survey.surveyStatus) {
        case this.CONSTANTS.SURVEY_STATUS.RESERVATION:
        case this.CONSTANTS.SURVEY_STATUS.WAITING:
        case this.CONSTANTS.SURVEY_STATUS.DOING:
          return true;
        default:
          return false;
      }
    },
    isAnswerComplete() {
      return this.survey.answerStatus === this.CONSTANTS.ANSWER_STATUS.COMPLETE;
    },
    answerStatusName() {
      switch (this.survey.surveyType) {
        case 'SURVEY':
          return this.isAnswerComplete ? '설문완료' : '기간종료';
        case 'CONSULTATION':
        case 'AFTER_SCHOOL':
          return this.isAnswerComplete ? '신청완료' : '기간종료';
        case 'FCFS':
        case 'DRAW':
          return this.isAnswerComplete ? '설문완료' : '기간종료';
        default:
          return this.isAnswerComplete ? '설문완료' : '설문하기';
      }
    },
    submitButtonTitle() {
      return {
        'SURVEY': '설문하기',
        'CONSULTATION': '신청하기',
        'AFTER_SCHOOL': '신청하기',
        'FCFS': '신청하기',
        'DRAW': '신청하기',
      }[this.survey.surveyType] || '설문하기';
    },
    activeTabCode() {
      return this.surveySearchQuery.surveyStatus;
    },
    isShowSurveyDeleteBtn() {
      //return this.survey.surveyStatus !== 'WAITING' && this.survey.surveyStatus !== 'RESERVATION';
      return true
    },
    isMember() {
      return this.survey.clazz.memberRole === 'MEMBER';
    },
    isAnonymous() {
      return this.survey.isAnonymous;
    },
    isActivateClass() {
      return this.curClassItem.classStatus === 'ACTIVATE';
    },
    isShared() {
      return this.survey.isShared;
    },
    surveyType() {
      return {
        SURVEY:'설문ㆍ투표',
        CONSULTATION:'학부모 상담',
        AFTER_SCHOOL:'방과후 신청',
        FCFS:'선착순',
        DRAW:'추첨'
      }[this.survey.surveyType] || '설문ㆍ투표';
    },
    isFcfsOrDraw () {
      return [
        this.CONSTANTS.SURVEY_TYPE.FCFS,
        this.CONSTANTS.SURVEY_TYPE.DRAW
      ].includes(this.survey.surveyType)
    }
  },
  methods: {
    ...mapActions('storeSurvey', {
      openSurveyRespondentModalFlag: 'openSurveyRespondentModalFlag',
      copySurveyCreate: 'copySurveyCreate',
      copySurveyCreateEdit: 'copySurveyCreateEdit',
      copySurveyCreateEdit2: 'copySurveyCreateEdit2',
      setSurveyCancel: 'setSurveyCancel',
      setReadUser: 'setReadUser',
      setReadCount: 'setReadCount',
      deleteSurvey: 'deleteSurvey',
      clickTemporarySurvey: 'clickTemporarySurvey',
      clearSelectedTemporarySurveys: 'clearSelectedTemporarySurveys',
      getSurveys: 'getSurveys',
      checkSurveyIsDel: 'checkSurveyIsDel',
    }),
    ...mapMutations('storeSurvey', {
      setCompletePopup: 'setCompletePopup',
      setSurveyCopyResource: 'setSurveyCopyResource'
    }),
    onClickComplete() {
      const param = {
        surveyId: this.survey.surveyId,
        surveyType: this.survey.surveyType,
      };
      this.$emit('onClickComplete', param);
    },
    routeSurveyCreate(survey) {
      const surveyId = survey.surveyId;
      const classId = survey.clazz.classId;
      const routeObj = {
        path: `/survey-create/${surveyId}`,
        query: {
          tabCode: this.activeTabCode,
          classId: classId
        },
      };
      this.$router.push(routeObj, () => {});
    },
    routeSurveyRespondent(survey) {
      const surveyId = survey.surveyId;
      const routeObj = {
        path: `/survey-response/${surveyId}`,
      };
      if (survey.respondentId) {
        routeObj.query = { respondentId: survey.respondentId };
      }
      this.$router.push(routeObj, () => {});
    },
    openSurveyRespondentsModal(survey) {
      this.openSurveyRespondentModalFlag({ survey: survey });
    },
    routeSurveyPreview(survey) {
      const surveyId = survey.surveyId;
      const routeObj = {
        path: `/survey-response/${surveyId}?preview=true`,
      };
      this.$router.push(routeObj, () => {});
    },
    routeSurveyStatistics(survey) {
      const surveyId = survey.surveyId;
      this.checkSurveyIsDel(surveyId)
        .then(res => {
          this.$emit('clickStatistics', surveyId);
        })
        .catch(err => {
          if (err.response.status === 404) {
            this.$hiClass.alert('삭제된 설문입니다.').then(res => {
              eventBus.$emit('do-search-resource', true);
            });
          }
        });
    },
    copySurveyUrl(survey) {
      const urlCode = `${this.$webUrl}/sru/${survey.surveyId}`;
      this.$hiClass.copyToClipboard(urlCode, '주소가 복사되었습니다.');
    },
    closeSurvey(survey) {
      const surveyId = survey.surveyId;
      this.$hiClass.confirm('설문을 종료하시겠습니까?', 'info').then(() => {
        this.setSurveyCancel(surveyId);
      }).catch(() => {});
    },
    deleteSelectedSurvey(survey) {
      // if (this.activeTabCode === 'DOING') {
      //   this.closeSurvey(survey);
      // } else {
        const surveyId = survey.surveyId;
        const msg = `'${survey.surveyTitle}' 삭제하시겠습니까?<br>설문을 삭제하면 설문에 포함된<br> 응답 결과도 모두 함께 삭제되며, <br>삭제된 이후에는 복구할 수 없습니다.`;
        const opts = {
          confirmButtonText: '설문삭제',
          confirmButtonColor: '#ff6a6a',
        }
        this.$hiClass
          .confirm(msg, 'info', opts)
          .then(() => {
            this.deleteSurvey(surveyId);
          })
          .catch(() => {});
      //}
    },
    copySurvey(survey) {
      const requestBody = {};
      requestBody.surveyId = survey.surveyId;
      requestBody.userId = this.user.currentId;
      requestBody.schoolId = survey.school.schoolId;
      requestBody.classId = survey.clazz.classId;
      requestBody.originSurveyStatus = survey.surveyStatus === 'TEMPORARY' ? 'TEMPORARY' : 'COMPLETE';

      this.copySurveyCreateEdit2(requestBody)
        .then(res => {
          this.setSurveyCopyResource({
            isCopy: true,
            data: res.data
          })
          const newSurveyId = res.data.surveyId;

          const routeObj = {
            path: `/survey-create/${newSurveyId}`,
            query: {
              tabCode: this.surveySearchQuery.surveyStatus || null,
              classId: res.data.classId
            },
          };
          this.$router.push(routeObj, () => {});
        }).catch(err => {
          // 삭제된 설문입니다 
          let errMessage = '설문 정보를 가져올 수 없습니다.';
          if (err.response.status === 404) {
            errMessage = '삭제된 설문입니다.';
          }

          this.$hiClass.alert(errMessage, 'error').then(() => {
            eventBus.$emit('do-search-resource', true);
          });
        })
    },
    shareHitalk(survey) {
      this.$emit('shareHitalk', survey)
    },
    shareSurvey(survey) {
      if (this.isShared) {
        this.$hiClass.alert('이미 공유한 양식입니다.');
      } else {
        this.$hiClass
          .confirm(`설문 양식을 공유 하시겠습니까?</br>양식을 공유하면 전체 학교에 양식이 공유 됩니다`)
          .then(res => {
            const requestBody = {};
            requestBody.surveyId = survey.surveyId;
            requestBody.purpose = 'SHARE_TO_LIST';
            requestBody.userId = this.user.currentId;
            requestBody.schoolId = survey.school.schoolId;
            requestBody.classId = survey.clazz.classId;
            requestBody.originSurveyStatus = survey.surveyStatus === 'TEMPORARY' ? 'TEMPORARY' : 'COMPLETE';

            this.copySurveyCreate(requestBody).then(res => {
              switch (res) {
                case 200:
                  this.survey.isShared = true;
                  break;
                case 404:
                  this.$hiClass.alert(`이미 삭제된 설문입니다.`).then(res => {
                    eventBus.$emit('do-search-resource', true);
                  });
              }
            });
          })
          .catch(err => {});
      }
    },
    // [created] item별 설문상태 체크
    checkSurveyStatus() {
      // 설문 유형인 경우
      if (this.survey.surveyType === 'SURVEY') {
        this.isSurvey = true;
      }
      // 응답을 완료한 내역이 1건 이상 있는 경우
      if (this.survey.answerStatus === 'COMPLETE' || this.survey.answerStatus === 'TEMPORARY') {
        this.isSurveyResponse = true;
      }

      // 설문 대상 유무
      if (this.survey.isTarget) {
        this.isSurveyResponseTarget = true;
      }

      // 해당 클래스 선생님인 경우
      if (this.clazzMemberRole === 'TEACHER' || this.clazzMemberRole === 'OWNER') {
        this.isTeacher = true;
      }

      // 방과후 신청 유무
      if (this.survey.surveyType === 'AFTER_SCHOOL') {
        this.isAfterSchool = true;
      }

      // 학부모 상담 유무
      if (this.survey.surveyType === 'CONSULTATION') {
        this.isCounseling = true;
      }
    },
    // [@click] 나의설문내역 모달
    openMySurveyHistory(surveyInfo) {
      this.mySurveyHistory.isModalOpen = true;
      this.mySurveyHistory.mySurveyId = surveyInfo.surveyId;
    },
    // [@click] 나의 신청내역 확인 및 변경
    openMyApplyHistory(surveyInfo) {
      this.$log.debug('===================== 나의 신청내역 확인 및 변경 ======================');
      this.myApplyHistory.isModalOpen = true;
      this.myApplyHistory.mySurveyId = surveyInfo.surveyId;
    },
  },
  beforeDestroy() {
    this.clearSelectedTemporarySurveys();
  },
};
</script>
