import { getField, updateField } from 'vuex-map-fields';
import Vue from 'vue';
import router from '@/plugins/router';
import moment from '@/plugins/moment.js';
import { eventBus } from '@/main';
import stringUtil from '@/assets/js/stringUtil';

const webUrl = process.env.VUE_APP_BASE_UI_URI;
const apiUrl = process.env.VUE_APP_BASE_API_URI;
const fileURL = process.env.VUE_APP_BASE_FILE_URI;
const adUrl = process.env.VUE_APP_BASE_AD_URI;
const multipartURL = fileURL + '/multipart';

const REQUEST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

const storeSurvey = {
  namespaced: true,
  state: {
    apiUrl,
    fileURL,
    adUrl,
    multipartURL,
    apiRequestUrl: {
      /**
       * <h1>설문 목록 관련</h1>
       *
       * <p>설문 목록 조회</p>
       * <p>[GET] /surveys</p>
       * *******
       * <p>설문 상세 조회</p>
       * <p>[GET] /surveys/${surveyId}</p>
       * *******
       * <p>신규 설문 여부 조회</p>
       * <p>[GET] /surveys/news</p>
       * *******
       * <p>설문 취소하기</p>
       * <p>[PATCH] /surveys/${surveyId}/cancel</p>
       * *******
       * <p>설문 복사하기</p>
       * <p>[POST] /surveys/${surveyId}/copy</p>
       * *******
       * <p>작성중인 설문에 기존 양식 복사 후 이어서 사용</p>
       * <p>[PATCH] /surveys/${surveyId}/append</p>
       * *******
       * <p>설문 읽음 처리</p>
       * <p>[PUT] /surveys/${surveyId}/read/user</p>
       */
      surveys: '/surveys',

      /**
       * <h1>설문 편집 정보</h1>
       *
       * <p>설문 편집 정보 등록</p>
       * <p>[POST] /surveys/edit</p>
       * *******
       * <p>설문 편집 정보 조회</p>
       * <p>[GET] /surveys/edit/${surveyId}</p>
       * *******
       * <p>설문 편집 정보 수정</p>
       * <p>[PATCH] /surveys/edit/${surveyId}</p>
       * *******
       * <p>설문 편집 정보 삭제</p>
       * <p>[DELETE] /surveys/edit/${surveyId}</p>
       * *******
       * <p>설문 편집 정보가 존재하는가</p>
       * <p>[GET] /surveys/edit/${surveyId}/exists</p>
       * *******
       * <p>설문 편집 정보 초기화 (서비스 데이터를 편집 데이터에 덮어쓰기)</p>
       * <p>[PUT] /surveys/edit/${surveyId}/init</p>
       */
      surveysEdit: '/surveys/edit',

      /**
       * <h1>설문 편집 대상자 정보</h1>
       *
       * <p>(설문 편집 데이터 기준) 대상자 정보 조회 (클래스 구독자 + 기존 대상자)</p>
       * <p>[GET] `/surveys/edit/targets`</p>
       */
      surveysEditTargets: '/surveys/edit/targets',

      /**
       * <h1>(설문 편집 데이터 기준) 페이지 정보</h1>
       *
       * <p>(설문 편집 데이터 기준) 페이지 삭제</p>
       * <p>[DELETE] /surveys/edit/pages/${pageId}</p>
       * *******
       * <p>(설문 편집 데이터 기준) 페이지 목록 조회</p>
       * <p>[GET] /surveys/edit/pages?surveyId=${surveyId}</p>
       * *******
       * <p>(설문 편집 데이터 기준) 페이지명 수정</p>
       * <p>[PATCH] /surveys/edit/pages/${pageId}/rename</p>
       * *******
       * <p>(설문 편집 데이터 기준) 페이지 해제</p>
       * <p>[PUT] /surveys/edit/pages/${pageId}/separate</p>
       */
      surveysEditPages: '/surveys/edit/pages',
      /**
       * <p>(설문 편집 데이터 기준) 간단한 정보만을 담은 페이지 목록 조회</p>
       * <p>[GET] /surveys/edit/pages/simple?surveyId=${surveyId}</p>
       */
      surveysEditPagesSimple: '/surveys/edit/pages/simple',
      /**
       * <p>(설문 편집 데이터 기준) 페이지 순서 변경</p>
       * <p>[PUT] /surveys/edit/pages/sorting?pageId=${pageId}&beforePageId=${beforePageId}</p>
       */
      surveysEditPagesSorting: '/surveys/edit/pages/sorting',
      /**
       * <p>(설문 편집 데이터 기준) 한페이지에 질문 구성하기</p>
       * <p>[PUT] /surveys/edit/pages/merge</p>
       */
      surveysEditPagesMerge: '/surveys/edit/pages/merge',

      /**
       * <h1>(설문 편집 데이터 기준) 질문 정보</h1>
       *
       * <p>(설문 편집 데이터 기준) 질문 생성</p>
       * <p>[POST] /surveys/edit/questions</p>
       * *******
       * <p>(설문 편집 데이터 기준) 질문 조회</p>
       * <p>[GET] /surveys/edit/questions/${questionId}</p>
       * *******
       * <p>(설문 편집 데이터 기준) 질문 수정</p>
       * <p>[PUT] /surveys/edit/questions/${questionId}</p>
       * *******
       * <p>(설문 편집 데이터 기준) 질문 삭제</p>
       * <p>[DELETE] /surveys/edit/questions/${questionId}</p>
       */
      surveysEditQuestions: `/surveys/edit/questions`,
      /**
       * <p>(설문 편집 데이터 기준) 간단한 정보만을 담은 질문 목록 조회</p>
       * <p>[GET] /surveys/edit/questions/simple?surveyId=${surveyId}& ...</p>
       */
      surveysEditQuestionsSimple: '/surveys/edit/questions/simple',
      /**
       * <p>(설문 편집 데이터 기준) 질문 순서 변경. pageId 가 다를 경우 해당 페이지로 이동.</p>
       * <p>[PUT] /surveys/edit/questions/sorting?questionId=${questionId}&pageId=${pageId}&beforeQuestionId=${beforeQuestionId}</p>
       */
      surveysEditQuestionsSorting: '/surveys/edit/questions/sorting',

      /**
       * [GET] 설문 응답자 `/surveys/respondents/${surveyId}/list`
       */
      surveysRespondents: `/surveys/respondents`,

      surveysSendRemindMessage: `/sendMessages/surveyRemind`,

      /**
       * [GET] 설문 전체 내용 조회 `/surveys/contents?surveyId=${surveyId}`
       */
      surveyContents: `/surveys/contents`,

      /**
       * [GET] 설문 응답 조회 `/surveys/answer/${surveyId}?respondentId=${respondentId}`
       * [PATCH] 설문 응답 페이지 단위 저장 `/surveys/answer/${surveyId}/page`
       */
      surveyAnswer: `/surveys/answer`,

      /**
       * [GET] 통계_설문정보 `/surveys/report/${surveyId}/info`
       * [POST] 통계_설문결과 그래프 `/surveys/report/${surveyId}/stat`
       * [GET] 통계_응답자 상세팝업 질문(객관식, 별점) `/surveys/report/question/${questionId}/popup`
       * [GET] 통계_응답자 상세팝업 질문(드롭다운) `/surveys/report/question-dropdown/${itemGroupId}/popup`
       * [GET] 통계_응답자 상세팝업 응답 `/surveys/report/${surveyId}/answers/${itemId}/popup`
       */
      surveyReport: `/surveys/report`,

      /**
       * [GET] 응답자 개별조회_응답자 리스트 `/surveys/report/respondent/${surveyId}/respondent-list`
       */
      surveyReportRespondent: `/surveys/report/respondent`,

      /**
       * <h1>(학부모 상담) 달력 정보</h1>
       *
       * <p>시작일자 기준 월 시작일 부터 종료일자 기준 월 마지막 일자까지의 달력 정보를 구한다.</p>
       * <p>상담 달력 만들기에 이용함</p>
       * <p>[GET] `/surveys/consultation/calendar`</p>
       */
      surveysConsultationCalendar: '/surveys/consultation/calendar',
    },
    isAnotherSurvey: false, // 다자녀 설문 여부

    /**
     * rootState 상태 참조
     */
    currentTimestamp: moment().valueOf(), // 현재 시간. 10초 단위로 갱신. rootState.currentTimestamp 의 값 복제됨.

    /****************************
     *
     * 설문 타입 정의
     *
     ****************************/
    selectionType: [
      {
        title: '선착순',
        value: 'FCFS',
      },
      {
        title: '추첨',
        value: 'DRAW',
      },
    ],

    /****************************
     *
     * 설문 만들기
     *
     ****************************/
    placeholderDefault: {
      surveyInfoTitle: '제목을 입력하세요.',
      surveyInfoDesc: '설명을 입력하세요.',
    },
    useSurvey: false, //추천 설문 템플릿 사용여부
    curClassId: null,
    curSchoolId: null,
    // 설문 설정: 'SETTING', 설문 질문: 'QUESTION'
    surveyCreateBodyComponentName: null,
    surveyCreateConfirmModal: {
      isOpen: false,
      isSendPush: false,
      titleHtml: null,
      reserveTimeHtml: null,
      descriptionHtml: null,
    },
    surveyCreateComplete: {
      isVisible: false,
      mode: 'CREATE',
    },
    // 발행 완료된 설문의 질문 IDs
    publishedQuestionIds: [],
    // 발행 완료된 방과후 신청의 수업 IDs (세팅 후 수정 불가)
    publishedQuestionItemIds: [],

    /****************************
     *
     * 설문 만들기 > 설문 설정
     *
     ****************************/
    curSurveyEdit: {},
    curSurveyEditDescription: null,
    beforeCurSurveyEdit: {},
    surveyCreateTargetModal: {
      isOpen: false,
      // required: true | 클래스 id
      classId: null,
      // 설문 id
      surveyId: null,
      // 사용자유형 eq
      userType: null,
      // 이름 like
      name: null,
    },
    surveyEditTargetList: [],

    /****************************
     *
     * 설문 만들기 > 설문 질문
     *
     ****************************/
    /**
     * 현재 표시된 질문 수정 여부 (유형 변경 포함)
     */
    isChangedSurveyEditQuestions: false,
    /**
     * 현재 편집 중인 질문
     */
    surveyEditQuestions: {},
    surveyEditQuestionsEditDescription: null,

    surveyAttachmentMoreButtons: [
      {
        btnType: 'ALIGN_LEFT',
        btnClass: 'btn-align-left',
        btnTitle: '왼쪽 맞춤',
        value: 'LEFT',
      },
      {
        btnType: 'ALIGN_CENTER',
        btnClass: 'btn-align-center',
        btnTitle: '가운데 맞춤',
        value: 'CENTER',
      },
      {
        btnType: 'ALIGN_RIGHT',
        btnClass: 'btn-align-right',
        btnTitle: '오른쪽 맞춤',
        value: 'RIGHT',
      },
      {
        btnType: 'EDIT_IMAGE',
        btnClass: 'btn-image',
        btnTitle: '사진편집',
        value: null,
      },
      {
        btnType: 'UPDATE',
        btnClass: 'btn-align-change',
        btnTitle: '변경',
        value: null,
      },
      {
        btnType: 'DELETE',
        btnClass: 'btn-delete',
        btnTitle: '삭제',
        value: null,
      },
    ],
    surveyEditPagesSimple: [],
    surveyEditQuestionsSimple: [],
    surveysConsultationCalendar: [],

    /****************************
     *
     * 설문 만들기 > LNB 질문 목록
     *
     ****************************/
    surveyEditPages: [],
    surveyEditPagesChangeTimestamps: [],
    surveyEditPagesMoreButtons: [
      {
        btnType: 'RENAME_PAGE',
        btnClass: '',
        btnTitle: '페이지명 변경',
        value: null,
      },
      {
        btnType: 'SEPARATE_PAGE',
        btnClass: '',
        btnTitle: '페이지 해제',
        value: null,
      },
      // {
      //   btnType: 'DELETE_PAGE',
      //   btnClass: '',
      //   btnTitle: '페이지 삭제',
      //   value: null
      // },
      // {
      //   btnType: 'ENLARGE_PAGE',
      //   btnClass: '',
      //   btnTitle: '전체 페이지 확대',
      //   value: null
      // },
      // {
      //   btnType: 'COLLAPSE_PAGE',
      //   btnClass: '',
      //   btnTitle: '전체 페이지 축소',
      //   value: null
      // },
    ],
    surveyCreateLnbPageRenameModal: {
      isOpen: false,
      pageId: null,
      pageName: null,
      submitCallback: null,
    },

    /****************************
     *
     * 설문 진행중탭 > 응답자 명단 조회 팝업
     *
     ****************************/
    curSurveyRespondent: {},
    isCurSurveyRespondentModalOpen: false,
    // 설문목록에서 응답자 조회팝업을 열때 설문정보 저장 (응답자 팝업에서 설문정보 필요함)
    selectedSurvey: {},

    /****************************
     *
     * 설문 탭
     *
     ****************************/
    // 임시저장탭 선택된 설문 리스트
    selectedTemporarySurveys: [],

    /****************************
     *
     * 설문 응답 > App화면 미리보기
     *
     ****************************/
    // App 화면 미리보기 flag
    appView: false,
    /****************************
     *
     * 설문 응답 > 상세정보조회
     *
     ****************************/
    // 설문 상세 정보 (단건)
    surveys: {},
    surveyCopyResource: {
      isCopy: false,
      data: {}
    },
    isReject: false,
    surveysRespondentInfo: {},
    respondentId: '',
    // 시뮬레이션 상태인지
    isSimulation: false,
    // 시뮬레이션 응답값
    simulationSurveyAnswer: {
      answerStatus: 'TEMPORARY',
      answeredTimestamp: null,
      respondentId: null,
      surveyId: null,
    },
    /**
     * 인트로: INTRO | 응답자 정보 입력: FORM | 질문 응답: ANSWER | 응답 완료: COMPLETE
     */
    surveyResponseBodyName: 'INTRO',

    /****************************
     *
     * 설문 전체 내용 조회
     *
     ****************************/
    surveyContents: {},

    /****************************
     *
     * 설문 응답 > 응답 중
     *
     ****************************/
    //서명 여러개일때 마지막 서명 save 카운트
    signCount: 0,
    //설문 응답 링크페이지
    linkPageId: '',
    // 응답 선택항목중 설문종료인 항목 선택시 버튼 제출하기로 변경값
    surveyAnswerFinish: false,
    // 응답 중인 페이지의 ID
    surveyAnswerPageId: null,
    // 응답 중 설문 목록 팝업
    surveyAnswerQuestionsPopup: {
      isOpen: false,
    },
    // 응답 정보 (전체)
    curSurveyAnswer: {},
    // 응답 정보 (페이지별, key 는 questionId)
    curSurveyAnswerPage: {},

    // 응답 중 선택한 아이템 IDs
    selectedItemIds: [],
    // 응답 중 선택한 아이템 answerText { itemId: answerText }
    selectedItemAnswerTextObj: {},
    /****************************
     *
     * 설문 응답 > 빙과후 학습
     *
     ****************************/
    afterSchoolStatus: '',
    /****************************
     *
     * 설문 응답 > 학부모 상담
     *
     ****************************/
    consultationStatus: '',
    completePopup: {
      flag: false,
      respondentId: null,
      alertDisabled: false,
      item: {},
      questionType: '',
    },

    /****************************
     *
     * 설문 통계
     *
     ****************************/
    surveyReport: {
      // 현재 설문 정보
      curSurveyReportInfo: {},
      // 현재 설문 id
      curSurveyId: '',
      // 현재 탭
      currentTab: 'STATISTICS',

      // 탭 > 통계
      statistics: {
        // 통계탭 응답자 모달
        isReplyPopupOpen: false,
        // 현재 통계 그래프 리스트
        curStatisticsItems: [],
        // 응답 모달 정보
        replyPopup: {
          // 현재 질문 정보
          curQuestion: {},
          // 현재 질문 id
          curQuestionId: '',
          // 현재 질문의 선택지 리스트
          curQuestionItemList: [],
          // 응답을 보려고 선택한 선택지 정보
          selectedItem: {},
          // 선택한 선택지 id
          selectedItemId: '',
          // 선택지 타입 (CHOICE: 객관식, SUBJECTIVE: 주관식, SIGN: 서명,
          // DROPDOWN: 드롭다운, STAR: 별점, ATTACHMENTS: 첨부파일,
          // DESCRIPTION: 설명, CONSULTATION: 학부모 상담, AFTER_SCHOOL: 방과후)
          selectedItemType: '',
          // 응답리스트
          answerList: [],
          // 검색조건 해당되는 총 응답수
          answerCount: 0,
        },
        // 방과후신청 일별 신청내역
        consultationAnswers: [],
        // 선택된 방과후학교 신청된 일자 리스트
        consultationDateList: [],
        // 선택된 방과후학교 questionId
        consultationQuestionId: '',
        // 학반 태그 필터
        activeTagIds: []
      },
      // 탭 > 응답 데이터
      answerData: {},
      // 탭 > 응답자 개별 조회
      respondent: {
        // 현재 설문의 응답자 리스트
        curSurveyRespondentList: [],
        // 필터가 적용된 응답자 리스트 (필터: 응답완료, 응답중)
        filteredSurveyRespondentList: [],
        // 전체 설문 페이지별 정보
        curSurveyContentsPages: [],
        // 개별 응답을 보기위헤 선택된 응답자 정보
        curSurveySelectedRespondent: {},
        // 선택된 응답자의 응답데이터
        curSurveySelectedRespondentAnswer: {},
        historyCount: -1,
        initAnswerModalIsOpen: false,
        initAnswerRespondent: '',
        isInitAnswerDone: false,
      },
    },

    // 통계탭 방과후 신청 푸시 알림 보내기 모달
    isSurveyReportAfterSchoolPopupOpen: false,

    // 방과후신청 일별 신청내역 모달
    isConsultationAnswerPopupOpen: false,

    /****************************
     *
     * 설문 목록
     *
     ****************************/
    surveySearchQuery: {
      // 설문 보기 유형 (ALL: 전체, MANAGER:클래스 관리자로 구독중인 클래스에서 발행한 설문, TARGET:설문 대상자로서 내가 받은 설문)
      viewType: 'ALL',
      // 설문 상태(TEMPORARY:임시저장, DOING:진행중, END:종료)
      surveyStatus: 'DOING',
      // sort: 'timestampStart,desc'
      sort: 'surveyPosted,desc',
      // 설문 타입(SURVEY: 설문, VOTE: 투표, CONSULTATION: 학부모 상담, AFTER_SCHOOL: 방과후 신청)
      surveyType: '',
      surveyTitle: null,
      classStatus: '',
    },

    /****************************
     *
     * 추천템플릿
     *
     ****************************/
    isRecommendTemplateOpen: false,
    recommendTemplateActiveTab: 'RECOMMEND_SHARE',
    recommendTemplateSearchQuery: {
      recommend: false,
      sharedByMe: false,
      myFavorite: true,
      userId: '',
      sort: 'INSERTED_DESC',
      _surveyTitle: '',
      surveyType: null,
    },
    recommendTemplates: [],
    isUsedTemplate: false,
    // 나의 설문 내역 모달
    mySurveyHistory: {
      isModalOpen: false,
      mySurveyId: null,
    },
    // 나의 신청내역 모달
    myApplyHistory: {
      isModalOpen: false,
      mySurveyId: null,
      myRespondentId: null,
      mySubjectName: '',
      isAfterSchool: false,
      isConsultation: false,
      isListRespondent: false,
      isDetail: false,
    },
    isLimitedWait: false,
  },
  getters: {
    // eslint-disable-next-line
    getField,
    /****************************
     *
     * 설문 응답
     *
     ****************************/
    getSurveyResponseBodyName: state => {
      return state.surveyResponseBodyName;
    },
    curSurveyAnswer: state => {
      return state.curSurveyAnswer;
    },
    getSurvey: state => {
      return state.surveys;
    },
    /****************************
     *
     * 설문 만들기
     *
     ****************************/
    curSurveyId: state => {
      return state.curSurveyEdit.surveyId;
    },
    curSurveyCreateMode: state => {
      const curSurveyId = state.curSurveyEdit.surveyId;
      return curSurveyId ? 'UPDATE' : 'CREATE';
    },
    // TODO: curSurveyKey 갱신 시 하위 컴포넌트 불필요한 remount 버그 수정
    curSurveyKey: (state, getters, rootState) => {
      let curSurveyId = getters.curSurveyId;
      let curSurveyKey;
      if (curSurveyId) {
        curSurveyKey = `MODIFY-${curSurveyId}`;
      } else {
        if (router.currentRoute.params.surveyId) curSurveyId = router.currentRoute.params.surveyId;

        curSurveyKey = curSurveyId ? `MODIFY-${curSurveyId}` : 'CREATE';
      }
      rootState.log.debug(`curSurveyKey => `, curSurveyKey);
      return curSurveyKey;
    },
    // getters 에서 rootState 를 사용하기 위해 파라미터 순번을 맞추어야 함
    curSurveyStatusForTimestamp: (state, getters, rootState) => {
      const surveyStatus = state.curSurveyEdit.surveyStatus;
      const surveyPosted = state.curSurveyEdit.surveyPosted;
      const timestampStart = state.curSurveyEdit.timestampStart || 0;
      const timestampEnd = state.curSurveyEdit.timestampEnd || 0;
      const currentTimestamp = state.currentTimestamp || moment().valueOf();
      const isComplete = surveyStatus === rootState.constants.SURVEY_STATUS.COMPLETE;

      try {
        const statusConditionArr = [
          // 임시저장
          {
            code: rootState.constants.SURVEY_STATUS.TEMPORARY,
            condition: () => surveyStatus === rootState.constants.SURVEY_STATUS.TEMPORARY,
          },
          // 예약: 게시일 이전
          {
            code: rootState.constants.SURVEY_STATUS.RESERVATION,
            condition: () => isComplete && currentTimestamp < surveyPosted,
          },
          // 대기: 게시일 지남 ~ 설문시작일 이전
          {
            code: rootState.constants.SURVEY_STATUS.WAITING,
            condition: () => isComplete && currentTimestamp > surveyPosted && currentTimestamp < timestampStart,
          },
          // 진행중: 설문시작일 지남 ~ 설문종료일 이전
          {
            code: rootState.constants.SURVEY_STATUS.DOING,
            condition: () =>
              isComplete &&
              currentTimestamp > surveyPosted &&
              currentTimestamp > timestampStart &&
              currentTimestamp < timestampEnd,
          },
          // 종료: 설문종료일 이후
          {
            code: rootState.constants.SURVEY_STATUS.END,
            condition: () => isComplete && currentTimestamp > surveyPosted && currentTimestamp > timestampEnd,
          },
        ];
        const foundStatusCondition = statusConditionArr.find(d => d.condition());
        if (foundStatusCondition) {
          return foundStatusCondition.code;
        } else {
          return '';
        }
      } catch (e) {
        return '';
      }
    },
    isCurSurveyEditValidated: (state, getters) => {
      const targetUserIdsLength = state.curSurveyEdit.targetUserIds ? state.curSurveyEdit.targetUserIds.length : 0;
      const validateModel = _.cloneDeep(state.curSurveyEdit);
      validateModel.targetCount = state.curSurveyEdit.targetCount || targetUserIdsLength;

      const array = ['timestampStart', 'timestampEnd'];
      const exists = array.every(key => validateModel[key]);
      if (!exists) return false;

      const isReservation = validateModel.isReservation;
      const surveyPosted = validateModel.surveyPosted || moment().valueOf();
      const timestampStart = validateModel.timestampStart;
      const timestampEnd = validateModel.timestampEnd;
      const targetCount = validateModel.targetCount;
      const isEmptySurveyTitle = !validateModel.surveyTitle || (validateModel.surveyTitle && validateModel.surveyTitle.trim().length === 0);

      // 설문 설정 제목이 없거나 공백만 있는 경우
      if (isEmptySurveyTitle) {
        return false;
      }

      // `게시 완료` 상태가 아니며 설문 예약시간이 현재시간보다 빠른 경우
      if (!getters.isCurSurveyPosted && isReservation && surveyPosted < state.currentTimestamp) {
        return false;
      }
      // 설문 종료일시가 설문 시작일시보다 빠르거나 같은 경우
      // 설문 종료일시가 설문 게시일시보다 빠른거나 같은 경우
      if (timestampEnd <= timestampStart || timestampEnd <= surveyPosted) {
        return false;
      }
      // URL 설문 미사용 시 구성원이 선택되어 있지 않은 경우
      if (!validateModel.isUsedUrl && targetCount === 0) {
        return false;
      }

      if (getters.hasInvalidTotalMax || getters.hasInvalidWaitMax)
        return false;
      
      return true;
    },
    hasSmallerTotalMax: (state, getters, rootState) => {
      return state.curSurveyEdit.surveyStatus === rootState.constants.SURVEY_STATUS.COMPLETE && 
        (state.curSurveyEdit.totalMax || 0) < (state.beforeCurSurveyEdit.totalMax || 0);
    },
    hasSmallerWaitMax: (state, getters, rootState) => {
      return state.curSurveyEdit.surveyStatus === rootState.constants.SURVEY_STATUS.COMPLETE && 
        (state.curSurveyEdit.waitMax || 0) < (state.beforeCurSurveyEdit.waitMax || 0);
    },
    hasZeroWaitMax: (state, getters, rootState) => {
      return state.isLimitedWait === false && (state.curSurveyEdit.waitMax || 0) === 0;
    },
    hasInvalidTotalMax: (state, getters, rootState) => {
      return state.curSurveyEdit.surveyType === rootState.constants.SURVEY_TYPE.FCFS &&
            ((state.curSurveyEdit.totalMax || 0) < 1 || getters.hasSmallerTotalMax)
    },
    hasInvalidWaitMax: (state, getters, rootState) => {
      return state.curSurveyEdit.surveyType === rootState.constants.SURVEY_TYPE.FCFS &&
        (getters.hasSmallerWaitMax || getters.hasZeroWaitMax);
    },
    isCurSurveyEditPagesQuestionValidated: state => {
      if (state.surveyEditPages.length === 0) {
        return false;
      }
      let isNotValidated = false;
      for (const page of state.surveyEditPages) {
        if (page.questions.find(page => !page.isValidated)) {
          isNotValidated = true;
          break;
        }
      }
      return !isNotValidated;
    },
    // 발행 완료 (RESERVATION 은 사용자에게 노출되지 않음)
    isCurSurveyPublished: (state, getters, rootState) => {
      switch (getters.curSurveyStatusForTimestamp) {
        case rootState.constants.SURVEY_STATUS.RESERVATION:
        case rootState.constants.SURVEY_STATUS.WAITING:
        case rootState.constants.SURVEY_STATUS.DOING:
        case rootState.constants.SURVEY_STATUS.END:
          return true;
        default:
          return false;
      }
    },
    // 게시 완료 (사용자에게 노출됨)
    isCurSurveyPosted: (state, getters, rootState) => {
      switch (getters.curSurveyStatusForTimestamp) {
        case rootState.constants.SURVEY_STATUS.WAITING:
        case rootState.constants.SURVEY_STATUS.DOING:
        case rootState.constants.SURVEY_STATUS.END:
          return true;
        default:
          return false;
      }
    },
    // 설문 게시 후 설문 시작
    isCurSurveyStatusDoing: (state, getters, rootState) => {
      switch (getters.curSurveyStatusForTimestamp) {
        case rootState.constants.SURVEY_STATUS.DOING:
          return true;
        default:
          return false;
      }
    },
    // 설문 게시 후 설문 완료
    isCurSurveyStatusEnd: (state, getters, rootState) => {
      switch (getters.curSurveyStatusForTimestamp) {
        case rootState.constants.SURVEY_STATUS.END:
          return true;
        default:
          return false;
      }
    },
    // 설문 게시 후 설문 시작 또는 완료 (사용자가 설문한 상태)
    isCurSurveyStarted: (state, getters) => {
      return getters.isCurSurveyStatusDoing || getters.isCurSurveyStatusEnd;
    },
    surveyEditTargetCount: state => {
      let surveyEditTargetCount = state.curSurveyEdit.targetCount || 0;

      if (state.curSurveyEdit.targetUserIds && state.curSurveyEdit.targetUserIds.length > 0)
        surveyEditTargetCount = state.curSurveyEdit.targetUserIds.length;

      return surveyEditTargetCount;
    },
    surveyEditTargetReadQuery: (state, getters) => {
      const surveyId = getters.curSurveyId;
      if (surveyId) state.surveyCreateTargetModal.surveyId = surveyId;

      const query = state.surveyCreateTargetModal;
      delete query['isOpen'];
      return query;
    },

    /****************************
     *
     * 설문 만들기 > 설문 질문
     *
     ****************************/
    isSelectedSurveySetting: state => {
      return state.surveyCreateBodyComponentName === 'SETTING';
    },
    isSelectedSurveyEditQuestions: state => {
      return state.surveyCreateBodyComponentName === 'QUESTION';
    },
    isCreateSurveyEditQuestions: state => {
      return state.surveyCreateBodyComponentName === 'QUESTION' && !state.surveyEditQuestions.questionId;
    },
    isUpdateSurveyEditQuestions: state => {
      return !!(state.surveyCreateBodyComponentName === 'QUESTION' && state.surveyEditQuestions.questionId);
    },
    existsIsEtcAnswerQuestionItems: state => {
      return state.surveyEditQuestions.items ? state.surveyEditQuestions.items.filter(item => item.isEtcAnswer) : [];
    },

    /****************************
     *
     * 설문 만들기 > 설문 질문 RNB
     *
     ****************************/
    existsSortNoQuestionItems: state => {
      return state.surveyEditQuestions.items ? state.surveyEditQuestions.items.filter(item => item.sortNo) : [];
    },
    // 현재 페이지 번호와 현재 질문 번호 문자열
    curSurveyPageQuestionNumber: state => {
      if (Array.isArray(state.surveyEditPages)) {
        let pageNumber = 0;
        let questionNumber = 0;

        const foundPageIndex = state.surveyEditPages.findIndex(page => {
          let flag = false;
          if (page.questions && page.questions.length > 0) {
            const foundQuestionIndex = page.questions.findIndex(question => {
              return question.questionId === state.surveyEditQuestions.questionId;
            });
            if (foundQuestionIndex > -1) {
              questionNumber = foundQuestionIndex + 1;
              flag = true;
            }
          }
          return flag;
        });
        if (foundPageIndex > -1) {
          pageNumber = foundPageIndex + 1;
        }
        return `${pageNumber}-${questionNumber}`;
      } else {
        return '0';
      }
    },
    // 현재 페이지 번호
    curSurveyPage: (state, getters) => {
      return getters.curSurveyPageIndex + 1;
    },
    curSurveyPageIndex: state => {
      if (Array.isArray(state.surveyEditPages)) {
        return state.surveyEditPages.findIndex(page => {
          let flag = false;
          const foundQuestion = page.questions.find(question => {
            return question.questionId === state.surveyEditQuestions.questionId;
          });
          if (foundQuestion) {
            flag = true;
          }
          return flag;
        });
      } else {
        return 0;
      }
    },
    curSurveyQuestionIndex: (state, getters) => {
      if (Array.isArray(state.surveyEditPages)) {
        let questionIndex = -1;
        const foundQuestionIndex = getters.surveyEditPagesQuestions.findIndex(question => {
          return question.questionId === state.surveyEditQuestions.questionId;
        });
        if (foundQuestionIndex > -1) {
          questionIndex = foundQuestionIndex;
        }
        return questionIndex;
      } else {
        return -1;
      }
    },
    isFirstSurveyQuestion: (state, getters) => {
      return getters.curSurveyQuestionIndex === 0;
    },
    isLastSurveyQuestion: (state, getters) => {
      return getters.curSurveyQuestionIndex + 1 === getters.surveyEditPagesQuestionsTotalCount;
    },

    /****************************
     *
     * 설문 만들기 > LNB 질문 목록
     *
     ****************************/
    surveyEditPagesTotalCount: state => {
      return Array.isArray(state.surveyEditPages) ? state.surveyEditPages.length : 0;
    },
    surveyEditPagesQuestions: state => {
      if (Array.isArray(state.surveyEditPages)) {
        const questionArr = [];
        state.surveyEditPages.map(page => {
          page.questions.map(question => {
            questionArr.push(question);
          });
        });
        return questionArr;
      } else {
        return [];
      }
    },
    surveyEditPagesQuestionsTotalCount: (state, getters) => {
      return getters.surveyEditPagesQuestions.length;
    },
    // 현재 페이지 번호와 현재 질문 번호 문자열
    getSurveyPageQuestionNumberByQuestionId: state => questionId => {
      if (Array.isArray(state.surveyEditPages)) {
        let pageNumber = 0;
        let questionNumber = 0;

        const foundPageIndex = state.surveyEditPages.findIndex(page => {
          let flag = false;
          if (page.questions && page.questions.length > 0) {
            const foundQuestionIndex = page.questions.findIndex(question => {
              return question.questionId === questionId;
            });
            if (foundQuestionIndex > -1) {
              questionNumber = foundQuestionIndex + 1;
              flag = true;
            }
          }
          return flag;
        });
        if (foundPageIndex > -1) {
          pageNumber = foundPageIndex + 1;
        }
        return `${pageNumber}-${questionNumber}. `;
      } else {
        return '0. ';
      }
    },

    /****************************
     *
     * 설문 응답 > 상세정보조회
     *
     ****************************/

    /****************************
     *
     * 설문 응답 > 응답 중
     *
     ****************************/
    // 설문응답 헤더의 설문목록
    curQuestionsList: (state, getter) => {
      let list = [];
      let pageId = [];
      try {
        for (let i = 0; i < getter.curAllQuestions.length; i++) {
          if (getter.curSurveyAnswer.answers) {
            for (let v = 0; v < getter.curSurveyAnswer.answers.length; v++) {
              if (getter.curAllQuestions[i].questionId === getter.curSurveyAnswer.answers[v].questionId) {
                getter.curAllQuestions[i].answerType = getter.curSurveyAnswer.answers[v].answerType;
                list.push(getter.curAllQuestions[i]);
                pageId.push(getter.curAllQuestions[i].pageId);
              }
            }
          }

          if (getter.curAllQuestions[i].pageId === getter.curAnswerPage.pageId) {
            list.push(getter.curAllQuestions[i]);
            pageId.push(getter.curAllQuestions[i].pageId);
          }
        }
        list = [...new Set(list)];
        pageId = [...new Set(pageId)];
        const obj = { list, pageId };
        return obj;
      } catch (e) {
        return [];
      }
    },
    // 응답, 상세 전체 질문 목록
    curAllQuestions: state => {
      try {
        const questionList = [];
        state.surveyContents['pages'].forEach(page => {
          const pageId = page.pageId;
          const questions = page.questions.map(question => {
            // 질문 클릭 시 페이지 이동을 위해 추가
            question.pageId = pageId;
            return question;
          });
          questionList.push(...questions);
        });
        return questionList;
      } catch (e) {
        return [];
      }
    },
    // 응답, 상세 전체 질문 개수
    curAllQuestionsTotalCount: (state, getters) => {
      try {
        return getters.curAllQuestions.length;
      } catch (e) {
        return 0;
      }
    },
    // 응답, 상세 현재 페이지
    curAnswerPage: state => {
      try {
        return state.surveyContents['pages'].find(page => {
          return page.pageId === state.surveyAnswerPageId;
        });
      } catch (e) {
        return {};
      }
    },
    // 전체 컨텐츠에서 응답 중인 페이지의 questions 구하기
    curQuestionsByPageId: state => {
      if (!state.surveyContents['pages']) {
        return [];
      }
      const curPage = state.surveyContents['pages'].find(page => {
        return page.pageId === state.surveyAnswerPageId;
      });
      if (curPage && curPage.questions) {
        // 선택한 페이지의 질문 set
        return curPage.questions;
      } else {
        // 첫번재 페이지의 질문 set
        return state.surveyContents['pages'][0].questions;
      }
    },
    // 응답 중인 페이지의 questionIds
    curQuestionIds: (state, getters) => {
      const questionIds = getters.curQuestionsByPageId.map(question => {
        return question.questionId;
      });
      return [...new Set(questionIds)];
    },

    // 현재 응답 중인 페이지 인덱스
    curAnswerPageIndex: state => {
      try {
        return state.surveyContents['pages'].findIndex(page => {
          return page.pageId === state.surveyAnswerPageId;
        });
      } catch (e) {
        return -1;
      }
    },
    // 현재 응답 중인 페이지의 첫 질문 번호
    curAnswerPageQuestionNumber: (state, getters) => {
      try {
        const firstQuestionId = getters.curAnswerPage.questions[0].questionId;
        const foundIndex = getters.curAllQuestions.findIndex(question => {
          return question.questionId === firstQuestionId;
        });
        return foundIndex + 1;
      } catch (e) {
        return 0;
      }
    },
    curPageRequiredQuestionIds: (state, getters) => {
      const questionIds = getters.curQuestionsByPageId.filter(question => question.isRequired).map(question => question.questionId);

      return questionIds || [];
    },
    prevAnswerPageId: (state, getters) => {
      try {
        if (getters.curAnswerPageIndex > -1) {
          const prevPageIndex = getters.curAnswerPageIndex - 1;
          return state.surveyContents['pages'][prevPageIndex].pageId;
        } else {
          return '';
        }
      } catch (e) {
        return '';
      }
    },
    nextAnswerPageId: (state, getters) => {
      try {
        if (getters.curAnswerPageIndex > -1) {
          const nextPageIndex = getters.curAnswerPageIndex + 1;
          return state.surveyContents['pages'][nextPageIndex].pageId;
        } else {
          return '';
        }
      } catch (e) {
        return '';
      }
    },
    isLimitedWait: state => state.isLimitedWait,
  },
  mutations: {
    //박종철 추가 (학부모 상담 달력 만들시 settingId 때문에 재조회 안태우려고)
    setConsultationSetting(state, payload) {
      state.surveyEditQuestions.consultationSetting = payload;
    },
    setMyApplyHistoryIsDetail(state, payload) {
      state.myApplyHistory.isDetail = payload;
    },
    setMyApplyHistoryIsListRespondent(state, payload) {
      state.myApplyHistory.isListRespondent = payload;
    },
    setMyApplyHistoryMySubjectName(state, payload) {
      state.myApplyHistory.mySubjectName = payload;
    },
    setIsAnotherSurvey: (state, payload) => {
      state.isAnotherSurvey = payload;
    },
    // eslint-disable-next-line
    updateField,

    /****************************
     *
     * 설문 만들기
     *
     ****************************/
    setCurClassId: (state, payload) => {
      state.curClassId = payload;
    },
    setCurSchoolId: (state, payload) => {
      state.curSchoolId = payload;
    },
    setCurSurveyEdit: (state, payload) => {
      // payload 직접 대입 시 curSurveyEdit.surveyId 가 순간 교체되어 새로고침 발생함
      state.curSurveyEdit = payload || {};

      // for (const [key, value] of Object.entries(payload)) {
      //   state.curSurveyEdit[key] = value
      // }
    },
    setBeforeCurSurveyEdit: (state, payload) => {
      state.beforeCurSurveyEdit = payload || {};
    },
    setCurSurveyEditAttr: (state, payload) => {
      for (const [key, value] of Object.entries(payload)) {
        // if (Array.isArray(value)) {
        //   state.curSurveyEdit[key].splice(0)
        //   state.curSurveyEdit[key].push(...value)
        // } else {
        //   state.curSurveyEdit[key] = value
        // }
        state.curSurveyEdit[key] = value;
      }
    },
    setSurveyCreateConfirmModal: (state, surveyCreateConfirmModal) => {
      state.surveyCreateConfirmModal = surveyCreateConfirmModal;
    },
    setSurveyCreateConfirmModalAttr: (state, payload) => {
      for (const [key, value] of Object.entries(payload)) {
        state.surveyCreateConfirmModal[key] = value;
      }
    },
    setSurveyCreateTargetModal: (state, surveyCreateTargetModal) => {
      state.surveyCreateTargetModal = surveyCreateTargetModal;
    },
    setSurveyCreateTargetModalAttr: (state, payload) => {
      for (const [key, value] of Object.entries(payload)) {
        // if (Array.isArray(value)) {
        //   state.surveyCreateTargetModal[key].splice(0)
        //   state.surveyCreateTargetModal[key].push(...value)
        // } else {
        //   state.surveyCreateTargetModal[key] = value
        // }
        state.surveyCreateTargetModal[key] = value;
      }
    },
    setSurveyEditTargetList: (state, payload) => {
      state.surveyEditTargetList = payload;
    },
    setSurveyCreateComplete: (state, payload) => {
      state.useSurvey = false;
      state.surveyCreateComplete = payload;
    },
    setPublishedQuestionIds: (state, payload) => {
      state.publishedQuestionIds = payload;
    },
    setPublishedQuestionItemIds: (state, payload) => {
      state.publishedQuestionItemIds = payload;
    },
    setSurveysConsultationCalendar: (state, payload) => {
      state.surveysConsultationCalendar = payload;
    },

    /****************************
     *
     * 설문 만들기 > 설문 질문
     *
     ****************************/
    setSurveyCreateBodyComponentName: (state, componentName) => {
      state.surveyCreateBodyComponentName = componentName;
    },
    setSurveyEditQuestions: (state, payload) => {
      const isUsedTemplate = state.isUsedTemplate;

      if (payload.questionType === 'CONSULTATION') {
        if (!payload.consultationSetting) {
          payload.consultationSetting = {
            // 상담 시작일 : yyyy-MM-dd
            dateStart: null,
            // 상담 종료일 : yyyy-MM-dd
            dateEnd: null,
            // 상담 시작시각 : HH:mm
            timeStart: null,
            // 상담 종료시각 : HH:mm
            timeEnd: null,
            // 상담 시간 간격 (분단위) : 0~99
            timeConsultation: null,
            // 휴식 시간 (분단위) : 0~99
            timeRecess: null,
            // 상담유형(전화)
            isPhone: true,
            // 상담유형(방문)
            isVisit: true,
            // 상담유형(원격)
            isRemote: false,

            /**
             * 학부모 상담 달력 자동 저장 처리하지 않음 (submit 할 경우에만 저장)
             */
            isTempSetting: true,
          };
        } else {
          if (isUsedTemplate && !(payload.skipInitializeItems || false)
            && new Date(payload.consultationSetting.dateEnd).getTime() < new Date().getTime()) {
            payload.consultationSetting.dateStart = null;
            payload.consultationSetting.dateEnd = null;
            payload.items = [];
          }
        }
      }
      state.surveyEditQuestions = payload;
    },
    setSurveyQuestionAttr: (state, payload) => {
      Object.entries(payload).forEach(([key, value]) => {
        state.surveyEditQuestions[key] = value;
      });
    },
    setIsChangedSurveyEditQuestions: (state, payload) => {
      state.isChangedSurveyEditQuestions = payload;
    },

    /****************************
     *
     * 설문 만들기 > 설문 질문
     *
     ****************************/
    setSurveyEditPages: (state, payload) => {
      state.surveyEditPages = payload;

      // TODO: 설문 LNB 갱신 시간 추가
      const currentTimestamp = moment().valueOf();
      state.surveyEditPagesChangeTimestamps.push(currentTimestamp);
    },
    setSurveyEditPagesChangeTimestamps: (state, payload) => {
      state.surveyEditPagesChangeTimestamps = payload;
    },

    /****************************
     *
     * 설문 만들기 > LNB 질문 목록
     *
     ****************************/
    setSurveyCreateLnbPageRenameModal: (state, surveyCreateLnbPageRenameModal) => {
      state.surveyCreateLnbPageRenameModal = surveyCreateLnbPageRenameModal;
    },

    /****************************
     *
     * 설문 진행중탭 > 응답자 명단 조회 팝업
     *
     ****************************/
    setCurSurveyRespondent(state, surveyRespondent) {
      state.curSurveyRespondent = surveyRespondent;
    },
    setSelectedSurvey(state, survey) {
      state.selectedSurvey = survey;
    },
    setIsCurSurveyRespondentModalOpen(state, flag) {
      state.isCurSurveyRespondentModalOpen = flag;
    },

    /****************************
     *
     * 설문 탭
     *
     ****************************/
    // 임시저장탭 선택된 설문
    setSelectedTemporarySurveys(state, selectedTemporarySurveys) {
      state.selectedTemporarySurveys = selectedTemporarySurveys;
    },

    /****************************
     *
     * 설문 응답 > 상세정보조회
     *
     ****************************/
    setSurveyAnswerFinish(state, flag) {
      state.surveyAnswerFinish = flag;
    },
    setRespondentId(state, respondentId) {
      state.respondentId = respondentId;
    },
    setSurveys(state, surveys) {
      state.surveys = surveys;
    },
    setIsReject(state, flag) {
      state.isReject = flag;
    },
    setSurveysRespondentInfo(state, respondnetInfo) {
      state.surveysRespondentInfo = respondnetInfo;
    },
    setSurveysRespondentInfoRespondentPhone(state, number) {
      state.surveysRespondentInfo.respondentPhone = number;
    },
    setSurveysRespondentInfoSchoolTypeAndClassGrade(state, payload) {
      state.surveysRespondentInfo.schoolType = payload.schoolType;
      state.surveysRespondentInfo.classGrade = payload.classGrade;
    },
    setIsSimulation(state, flag) {
      state.isSimulation = flag;
    },
    setAppView(state) {
      state.appView = !state.appView;
    },
    setSimulationSurveyAnswer(state, answer) {
      state.simulationSurveyAnswer = answer;
    },
    setSurveyResponseBodyName(state, bodyName) {
      state.surveyResponseBodyName = bodyName;
    },

    /****************************
     *
     * 설문 전체 내용 조회
     *
     ****************************/
    setSurveyContents(state, surveyContents) {
      state.surveyContents = surveyContents;
    },

    /****************************
     *
     * 설문 응답 > 응답 중
     *
     ****************************/
    setLinkPageId(state, pageId) {
      state.linkPageId = pageId;
    },
    setSignCount(state, count) {
      state.signCount = count;
    },
    //f11034f3-3dee-4cc3-927f-9603e503b03b
    setSurveyAnswerPageId(state, pageId) {
      state.surveyAnswerPageId = pageId;
    },
    setSurveyAnswerQuestionsPopup(state, payload) {
      state.surveyAnswerQuestionsPopup = payload;
    },
    setCurSurveyAnswer(state, surveyAnswer) {
      state.curSurveyAnswer = surveyAnswer;
    },
    setCurSurveyAnswerPage(state, surveyAnswerPage) {
      state.curSurveyAnswerPage = surveyAnswerPage;
    },
    setSelectedItemIds(state, selectedItemIds) {
      state.selectedItemIds = selectedItemIds;
    },
    setSurveyContentsSelected(state, payload) {
      const curPage = state.surveyContents['pages'].find(page => {
        return page.pageId === state.surveyAnswerPageId;
      });
      if (curPage && curPage.questions) {
        for (let item in payload) {
          curPage.questions.forEach(question => {
            if (payload[item].questionId === question.questionId) {
              question.selected = payload[item].selected;
            }
          });
        }
      }
    },

    /****************************
     *
     * 설문 응답 > 방과후 학습
     *
     ****************************/
    setAfterSchoolStatus(state, flag) {
      state.afterSchoolStatus = flag;
    },

    /****************************
     *
     * 설문 응답 > 학부모 상담
     *
     ****************************/
    setConsultationStatus(state, flag) {
      state.consultationStatus = flag;
    },

    setCompletePopup(state, flag) {
      state.completePopup = flag;
    },

    /****************************
     *
     * 설문 통계 > 공통
     *
     ****************************/
    setCurSurveyReportInfo(state, surveyReportInfo) {
      state.surveyReport.curSurveyReportInfo = surveyReportInfo;
    },
    setCurSurveyId(state, surveyId) {
      state.surveyReport.curSurveyId = surveyId;
    },
    setCurrentTab(state, currentTab) {
      state.surveyReport.currentTab = currentTab;
    },
    setSurveyReport(state, surveyReport) {
      state.surveyReport = surveyReport;
    },

    /****************************
     *
     * 설문 통계 > 통계탭
     *
     ****************************/
    setStatistics(state, statisticsitem) {
      state.surveyReport.statistics = statisticsitem;
    },
    setSurveyReportStatisticsItems(state, statisticsItems) {
      state.surveyReport.statistics.curStatisticsItems = statisticsItems;
    },
    setAnswersPopupFlag(state, isReplyPopupOpen) {
      state.surveyReport.statistics.isReplyPopupOpen = isReplyPopupOpen;
    },
    setReplyPopupCurQuestion(state, curQuestion) {
      state.surveyReport.statistics.replyPopup.curQuestion = curQuestion;
    },
    setReplyPopupCurQuestionId(state, curQuestionId) {
      state.surveyReport.statistics.replyPopup.curQuestionId = curQuestionId;
    },
    setReplyPopupCurQuestionItemList(state, curQuestionItemList) {
      state.surveyReport.statistics.replyPopup.curQuestionItemList = curQuestionItemList;
    },
    setReplyPopupSelectedItem(state, selectedItem) {
      state.surveyReport.statistics.replyPopup.selectedItem = selectedItem;
    },
    setReplyPopupSelectedItemId(state, selectedItemId) {
      state.surveyReport.statistics.replyPopup.selectedItemId = selectedItemId;
    },
    setReplyPopupSelectedItemType(state, selectedItemType) {
      state.surveyReport.statistics.replyPopup.selectedItemType = selectedItemType;
    },
    setSurveyReportReplyPopupAnswerList(state, replyPopupAnswerList) {
      state.surveyReport.statistics.replyPopup.answerList = replyPopupAnswerList;
    },
    setReplyPopup(state, replyPopupItem) {
      state.surveyReport.statistics.replyPopup = replyPopupItem;
    },
    setAfterSchoolPopupFlag(state, isSurveyReportAfterSchoolPopupOpen) {
      state.isSurveyReportAfterSchoolPopupOpen = isSurveyReportAfterSchoolPopupOpen;
    },
    setIsConsultationAnswerPopupOpen(state, isConsultationAnswerPopupOpen) {
      state.isConsultationAnswerPopupOpen = isConsultationAnswerPopupOpen;
    },
    setConsultationAnswers(state, consultationAnswers) {
      state.surveyReport.statistics.consultationAnswers = consultationAnswers;
    },
    setConsultationDateList(state, consultationDateList) {
      state.surveyReport.statistics.consultationDateList = consultationDateList;
    },
    setConsultationQuestionId(state, consultationQuestionId) {
      state.surveyReport.statistics.consultationQuestionId = consultationQuestionId;
    },
    setSurveyReportActiveTagIds(state, activeTagIds) {
      state.surveyReport.statistics.activeTagIds = activeTagIds;
    },

    /****************************
     *
     * 설문 통계 > 응답자 개별조회탭
     *
     ****************************/
    setSurveyReportRespondentList(state, surveyRespondentList) {
      state.surveyReport.respondent.curSurveyRespondentList = surveyRespondentList;
    },
    setSurveyReportFilteredRespondentList(state, filteredSurveyRespondentList) {
      state.surveyReport.respondent.filteredSurveyRespondentList = filteredSurveyRespondentList;
    },
    setCurSurveySelectedRespondent(state, surveyRespondent) {
      state.surveyReport.respondent.curSurveySelectedRespondent = surveyRespondent;
    },
    setCurSurveyContentsPages(state, curSurveyContentsPages) {
      state.surveyReport.respondent.curSurveyContentsPages = curSurveyContentsPages;
    },
    setCurSurveySelectedRespondentAnswer(state, surveyRespondentAnswer) {
      state.surveyReport.respondent.curSurveySelectedRespondentAnswer = surveyRespondentAnswer;
    },
    setSurveyReportRespondent(state, respondent) {
      state.surveyReport.respondent = respondent;
    },
    setInitAnswerModalIsOpen(state, initAnswerModalIsOpen) {
      state.surveyReport.respondent.initAnswerModalIsOpen = initAnswerModalIsOpen;
    },
    setInitAnswerRespondent(state, initAnswerRespondent) {
      state.surveyReport.respondent.initAnswerRespondent = initAnswerRespondent;
    },
    setIsInitAnswerDone(state, isInitAnswerDone) {
      state.surveyReport.respondent.isInitAnswerDone = isInitAnswerDone;
    },

    /****************************
     *
     * 추천템플릿
     *
     ****************************/
    setIsRecommendTemplateOpen(state, flag) {
      state.isRecommendTemplateOpen = flag;
    },
    setRecommendTemplateActiveTab(state, activeTab) {
      state.recommendTemplateActiveTab = activeTab;
    },
    setRecommendTemplateSearchQuery(state, searchQuery) {
      state.recommendTemplateSearchQuery = searchQuery;
    },
    setRecommendTemplate(state, templates) {
      state.recommendTemplates = templates;
    },
    setIsUsedTemplate(state, flag) {
      state.isUsedTemplate = flag;
    },
    setSurveyCopyResource(state, data) {
      state.surveyCopyResource = data
    },
    setCurSurveyEditDescription(state, data) {
      state.curSurveyEditDescription = data
    },
    setSurveyEditQuestionsEditDescription(state, data) {
      state.surveyEditQuestionsEditDescription = data
    },
    setIsLimitedWait(state, value) {
      state.isLimitedWait = value;
    },
    restoreCurSurveyEdit(state, key) {
      state.curSurveyEdit[key] = state.beforeCurSurveyEdit[key];
    },
  },
  actions: {
    /****************************
     *
     * 설문 만들기
     *
     ****************************/
    initCurRouteParams: ({ commit }) => {
      const classId = router.currentRoute.query.classId || null;
      const schoolId = router.currentRoute.query.schoolId || null;
      const curSurveyEditAttr = {};
      const surveyType = router.currentRoute.query.surveyType || null;
      if (surveyType) {
        curSurveyEditAttr.surveyType = surveyType;
      }
      commit('setCurClassId', classId);
      commit('setCurSchoolId', schoolId);
      commit('setCurSurveyEditAttr', curSurveyEditAttr);

      return new Promise(resolve => resolve(true));
    },
    clearCurRouteParams: ({ commit, rootState }) => {
      commit('setCurClassId', null);
      commit('setCurSchoolId', null);
      commit('setCurSurveyEditAttr', {
        surveyType: rootState.constants.SURVEY_TYPE.SURVEY,
      });
    },
    getSurveyStatusNameBySurveyStatus: ({ rootState }, payload) => {
      let status;
      switch (payload.surveyStatus) {
        case rootState.constants.SURVEY_STATUS[payload.surveyStatus]: {
          status = rootState.constants.SURVEY_STATUS_NAME[payload.surveyStatus];
          break;
        }
        default: {
          status = '?';
        }
      }
      return status;
    },
    showSurveyCreateComplete: ({ commit }, payload) => {
      commit('setSurveyCreateComplete', {
        isVisible: true,
        mode: payload.mode || 'CREATE',
      });
    },
    hideSurveyCreateComplete: ({ commit }) => {
      commit('setSurveyCreateComplete', {
        isVisible: false,
        mode: 'CREATE',
      });
    },
    /**
     * 발행 완료된 방과후 신청의 수업 IDs 저장
     * @param state
     * @param getters
     * @param commit
     * @param rootState
     * @param payload
     */
    savePublishedQuestionItemIds: ({ state, getters, commit, rootState }, payload) => {
      const isSurveyTypeAfterSchool = state.curSurveyEdit.surveyType === rootState.constants.SURVEY_TYPE.AFTER_SCHOOL;
      const isCurSurveyPublished = getters.isCurSurveyPublished;
      const isEmptyPublishedQuestionItemIds = state.publishedQuestionItemIds.length === 0;

      if (isSurveyTypeAfterSchool && isCurSurveyPublished && isEmptyPublishedQuestionItemIds) {
        if (payload && Array.isArray(payload.items) && payload.items.length > 0) {
          const itemIds = payload.items.filter(item => item.itemId).map(item => item.itemId);
          commit('setPublishedQuestionItemIds', itemIds);
        }
      }
    },

    /****************************
     *
     * 설문 만들기 > 설문 설정
     *
     ****************************/
    clearSurveyCreate: ({ commit }) => {
      commit('setPublishedQuestionIds', []);
      commit('setPublishedQuestionItemIds', []);
      commit('setSurveysConsultationCalendar', []);
    },
    setupCurSurveyEdit: async ({ state, commit, dispatch, rootState }) => {
      const surveyId = router.currentRoute.params.surveyId || null;
      const stateInfoClassId = state.curSurveyEdit.classId;
      const stateInfoSchoolId = state.curSurveyEdit.schoolId;

      // 설문 수정 화면
      if (surveyId) {
        if (!stateInfoClassId && !stateInfoSchoolId) {
          // 편집 정보 존재 유무 확인
          // const exists = await dispatch('existsSurveyEdit', surveyId)

          // async/await 적용 가능한 setTimeout 처리
          const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay));

          try {
            // 실데이터가 반영되지 않았다면 404 오류 발생. 무시.
            const beginTime = new Date().getTime()
            let resource = {}

            if(state.surveyCopyResource.isCopy === true) {
              resource = _.cloneDeep(state.surveyCopyResource.data)
              
              commit("setSurveyCopyResource", {
                isCopy: false,
                data: {}
              })
            } else {
              //localStorage.setItem("isSurveyCopyResource", JSON.stringify(false))
              const initRes = await dispatch('initSurveyEdit', surveyId);
              resource = initRes.data
            }

            const endTime = new Date().getTime()
            const diff = endTime - beginTime

            if(diff < 1000) {
              await wait(1000 - diff);
            }

            // 실데이터를 편집데이터로 전체 복사한 뒤 요청
            // const resource = await dispatch('getSurveyEdit', surveyId);
            // await wait(1000);

            if (resource) {
              // targetUserIds 반응형 modal 추가
              resource.targetUserIds = [];
              commit('setCurSurveyEdit', resource);
              commit('setBeforeCurSurveyEdit', _.cloneDeep(resource));

              if(resource.editPages) {
                state.surveyEditPages = resource.editPages
              }
            }

            // eslint-disable-next-line
          } catch (err) {
            // 삭제된 설문입니다 
            let errMessage = '설문 정보를 가져올 수 없습니다.';
            if (err.response.status === 404) {
              errMessage = '삭제된 설문입니다.';
            }

            rootState.hiClass.alert(errMessage, 'error').then(() => {
              const routeObj = {
                path: `/main/clazzes/${router.currentRoute.query.classId}/survey`,
                query: { tabCode: router.currentRoute.query.tabCode }
              }
              router.push(routeObj, () => {});
            });
          }

          // // 실데이터를 편집데이터로 전체 복사 요청 후 1초간 텀을 줌 (DB 밀림 임시 대책)
          // await wait(1000);

          // // 실데이터를 편집데이터로 전체 복사한 뒤 요청
          // const resource = await dispatch('getSurveyEdit', surveyId);
          // if (resource) {
          //   // targetUserIds 반응형 modal 추가
          //   resource.targetUserIds = [];
          //   commit('setCurSurveyEdit', resource);
          //   commit('setBeforeCurSurveyEdit', _.cloneDeep(resource));
          // }
          // // 설문 수정 최초 진입 시 페이지 정보 가져오기
          // dispatch('getSurveyEditPages', surveyId);
        }
        // 설문 신규 등록 화면
      } else {
        const classId = state.curClassId;
        const schoolId = state.curSchoolId;
        const surveyType = rootState.constants.SURVEY_TYPE[router.currentRoute.query.surveyType]
          ? rootState.constants.SURVEY_TYPE[router.currentRoute.query.surveyType]
          : rootState.constants.SURVEY_TYPE.SURVEY;

        if (!stateInfoClassId && !stateInfoSchoolId) {
          await dispatch('initCurSurveyEdit', { surveyType });
        }
        commit('setCurSurveyEditAttr', {
          classId,
          schoolId,
          surveyType,
        });
      }
      return surveyId || null;
    },
    initCurSurveyEdit: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      await dispatch('clearCurSurveyEdit');

      const surveyType = payload && payload.surveyType ? payload.surveyType : rootState.constants.SURVEY_TYPE.SURVEY;
      const curSurveyEdit = {
        /**
         * create, update 모두 사용
         */
        // 설문 유형 (SURVEY:설문, VOTE:투표, AFTER_SCHOOL:방과후 신청, CONSULTATION:학부모 상담)
        surveyType: surveyType,
        // 설문 제목
        surveyTitle: '',
        // 설문 설명
        surveyDescription: '',
        // 설문 게시일시
        surveyPosted: null,

        // 익명 설문인가
        isAnonymous: false,
        // 응답 거절 가능한가
        isRejectable: false,
        // 설문 URL 사용하는가
        isUsedUrl: false,
        // (투표용) 사용자가 결과를 볼 수 있는가
        isVisibleResult: false,
        // 미응답자 자동독촉 푸시를 사용하는가
        isAutoRemind: false,
        // 예약 설문인가
        isReservation: false,
        // 편집데이터를 서비스에 적용할 것인가
        isApply: false,

        // 설문 시작일시
        timestampStart: null,
        // 설문 종료일시
        timestampEnd: null,
        // 추천양식 선정 점수(0: 추천안함, 255: 최고추천)
        rankScore: 0,
        // 작성 학교 id
        schoolId: null,
        // 작성 클래스 id
        classId: null,
        // 선택한 구성원 수 (readonly)
        targetCount: 0,

        // 구성원 ID 목록
        targetUserIds: [],
        // 파일 목록
        files: [],

        /**
         * update 시 사용
         */
        // 설문 상태(TEMPORARY:임시저장, COMPLETE:작성완료)
        surveyStatus: 'TEMPORARY',
        // (isApply 가 true 일 경우) 푸시를 보낼 것인가
        isPush: false,
      };

      if (payload) {
        Object.entries(payload).forEach(([key, value]) => {
          curSurveyEdit[key] = value;
        });
      }
      commit('setCurSurveyEdit', curSurveyEdit);
    },
    clearCurSurveyEdit: ({ commit }) => {
      commit('setCurSurveyEdit', {});
      commit('setBeforeCurSurveyEdit', {});
    },
    createSurveyEdit: ({ state, commit, rootState }, payload) => {
      const isApply = payload && payload.isApply ? payload.isApply : false;
      const data = _.cloneDeep(state.curSurveyEdit);
      data.isApply = isApply;

      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.POST,
            url: state.apiRequestUrl.surveysEdit,
            data: data,
          })
          .then(res => {
            const resource = res.data;
            rootState.log.debug(`createSurveyEdit() resource`, resource);

            const surveyId = resource.surveyId;
            if (surveyId) {
              const routeObj = {
                path: `${router.currentRoute.path}/${surveyId}`,
                query: router.currentRoute.query,
              };
              router.replace(routeObj, () => {});

              // targetUserIds 반응형 modal 추가
              resource.targetUserIds = [];

              if (!resource.files) {
                resource.files = [];
              }
              commit('setCurSurveyEdit', resource);
              commit('setBeforeCurSurveyEdit', _.cloneDeep(resource));
            }
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    getSurveyEdit: ({ state, rootState }, surveyId) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveysEdit}/${surveyId}`,
        })
        .then(res => res.data)
        .catch(err => {
          let errMessage = '설문 정보를 가져올 수 없습니다.';
          if (err.response.status === 404) {
            errMessage = '삭제된 설문입니다.';
          }
          rootState.hiClass.alert(errMessage, 'error').then(() => {
            router.push('/main', () => {});
          });
        });
    },
    preProcessingSurveyEdit: ({ state, commit, rootState }, payload) => {
      payload.waitMax = payload.waitMax === 0 ? null : payload.waitMax;
    },
    updateSurveyEdit: ({ state, getters, commit, dispatch, rootState }, payload) => {
      const isApply = payload && payload.isApply ? payload.isApply : false;
      const beforeSurveyStatus = state.beforeCurSurveyEdit.surveyStatus;
      const beforeSurvey = _.cloneDeep(state.beforeCurSurveyEdit)
      const curSurveyType = state.curSurveyEdit.surveyType.toLowerCase();
      const data = _.cloneDeep(state.curSurveyEdit);

      data.isApply = isApply;

      // 게시 일시가 없는 경우에만 현재 시간을 저장
      if (!data.surveyPosted) {
        data.surveyPosted = moment().valueOf();
      }

      state.beforeCurSurveyEdit.targetCount = data.targetCount
      state.beforeCurSurveyEdit.targetUserIds = _.cloneDeep(data.targetUserIds)

      // 불필요한 수정 방지
      // if (data.targetUserIds && data.targetUserIds.length === 0) delete data.targetUserIds;
      if(data.targetUserIds.length === 0) {
        if(beforeSurvey.targetCount === data.targetCount) {
          delete data.targetUserIds;
        }
      } else if (beforeSurvey.targetUserIds.length === data.targetUserIds.length) {
        if(!(beforeSurvey.targetUserIds.filter(v => !data.targetUserIds.includes(v)).length > 0)) {
          delete data.targetUserIds;
        }
      }

      if (data.targetCount !== undefined) delete data.targetCount;
      // -- 불필요한 수정 방지

      rootState.log.debug(`updateSurveyEdit() before PATCH data => `, data);

      dispatch('preProcessingSurveyEdit', data);
      return new Promise((resolve, reject) => {
        const surveyId = state.curSurveyEdit.surveyId;
        rootState
          .axios({
            method: REQUEST_METHOD.PATCH,
            url: `${state.apiRequestUrl.surveysEdit}/${surveyId}`,
            data: data,
          })
          .then(res => {
            // 설문 GA 적용
            if (beforeSurveyStatus === rootState.constants.SURVEY_STATUS.TEMPORARY) {
              // 신규등록
              dispatch('triggerAnalyticsLogEvent', { code: `analytics.survey.${curSurveyType}.create` }, { root: true });
            } else {
              // 수정
              dispatch('triggerAnalyticsLogEvent', { code: `analytics.survey.${curSurveyType}.update` }, { root: true });
            }
            // 업데이트 시 response 없음
            if (res && res.data) {
              commit('setCurSurveyEdit', res.data);
            }
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);

            rootState.log.warn(err.response);
            if (err.response.status === 411) {
              const errData = err.response.data;
              let errMessage = '설문 유효성 체크를 통과하지 못했습니다.<br>다시 한번 확인해주세요.';

              switch (errData.message) {
                // 설문 편집정보
                case 'survey': {
                  switch (errData.cause) {
                    case 'surveyPosted_less_than_now': {
                      errMessage = '게시 일시를 현재 시간 이후로 선택해주세요.';
                      break;
                    }
                    case 'timestamp_empty': {
                      errMessage = '설문 시작 일시 또는 종료 일시를 선택해주세요.';
                      break;
                    }
                    case 'timestampEnd_less_than_surveyPosted': {
                      errMessage = '게시 일시를 설문 종료 일시 이전으로 선택해주세요.';
                      break;
                    }
                    case 'timestampEnd_less_than_timestampStart': {
                      errMessage = '설문 시작 일시를 설문 종료 일시 이전으로 선택해주세요.';
                      break;
                    }
                    case 'surveyStatus': {
                      errMessage = '이미 설문이 시작되어 임시저장으로 변경할 수 없습니다.';
                      break;
                    }
                    case 'already_posted': {
                      errMessage = '이미 설문이 게시되어 게시 일시를 변경할 수 없습니다.';
                      break;
                    }
                    case 'already_started': {
                      errMessage = '이미 설문이 게시되어 설문 시작 일시를 변경할 수 없습니다.';
                      break;
                    }
                    default:
                  }

                  break;
                }
                // 페이지
                case 'page': {
                  errMessage = `${errData.cause} 페이지에 질문이 없습니다.<br>질문을 추가해주세요.`;
                  break;
                }
                // 페이지 연결
                case 'linkPage': {
                  errMessage = `${errData.cause} 페이지 연결이 잘못되었습니다.<br>다시 한번 확인해주세요.`;
                  break;
                }
                // 질문
                case 'question': {
                  errMessage = `유효하지 않은 질문이 있습니다.<br>다시 한번 확인해주세요.`;
                  break;
                }
                default:
              }
              rootState.hiClass.alert(errMessage, 'info').then(() => {
                dispatch('closeSurveyCreateConfirmModal');
              });
            } else {
              const errMessage = '설문이 정상적으로 저장되지 않았습니다.<br>다시 한번 시도해주세요.';
              rootState.hiClass.alert(errMessage, 'info').then(() => {
                dispatch('closeSurveyCreateConfirmModal');
              });
            }
          });
      });
    },

    updateSurveyEditTarget: ({ state, commit, rootState }) => {
      const data = _.cloneDeep(state.curSurveyEdit);

      // 게시 일시가 없는 경우에만 현재 시간을 저장
      if (!data.surveyPosted) {
        data.surveyPosted = moment().valueOf();
      }
      // 설문 기본 제목이 없는 경우 기본값 지정
      const isEmptySurveyTitle = !data.surveyTitle || (data.surveyTitle && data.surveyTitle.trim().length === 0);
      if (isEmptySurveyTitle) {
        data.surveyTitle = '제목 없음';
        state.curSurveyEdit.surveyTitle = '제목 없음';
      }
      rootState.log.debug(`updateSurveyEditTarget() before PATCH data => `, data);

      dispatch('preProcessingSurveyEdit', data);
      return new Promise((resolve, reject) => {
        const surveyId = data.surveyId;
        rootState
          .axios({
            method: REQUEST_METHOD.PATCH,
            url: `${state.apiRequestUrl.surveysEdit}/${surveyId}`,
            data: data,
          })
          .then(res => {
            if (state.curSurveyEdit.surveyTitle === '제목 없음') state.curSurveyEdit.surveyTitle = '';
            // 업데이트 시 response 없음
            if (res && res.data) {
              commit('setCurSurveyEdit', res.data);
            }
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);

            const errMessage = '설문이 정상적으로 저장되지 않았습니다.<br>다시 한번 시도해주세요.';
            rootState.hiClass.alert(errMessage, 'info');
          });
      });
    },

    /**
     * 설문 편집 정보 삭제
     * - 페이지 진입 후 저장되지 않은 편집 정보를 삭제한다
     * @param state
     * @param rootState
     * @param surveyId
     * @returns {Promise<unknown>}
     */
    deleteSurveyEdit: ({ state, rootState }, surveyId) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.DELETE,
            url: `${state.apiRequestUrl.surveysEdit}/${surveyId}`,
          })
          .then(() => resolve(true))
          .catch(err => {
            // rootState.hiClass.alert(err)
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    /**
     * 설문 편집 정보가 존재하는가
     * @param state
     * @param rootState
     * @param surveyId
     * @returns {Promise<unknown>}
     */
    existsSurveyEdit: ({ state, rootState }, surveyId) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.GET,
            url: `${state.apiRequestUrl.surveysEdit}/${surveyId}/exists`,
          })
          .then(res => {
            resolve(res.data);
          })
          .catch(err => {
            rootState.hiClass.alert('existsSurveyEdit() ' + err);
            reject(false);
          });
      });
    },
    /**
     * 설문 편집 정보 초기화 (서비스 데이터를 편집 데이터에 덮어쓰기)
     * @param state
     * @param rootState
     * @param surveyId
     * @returns {Promise<unknown>}
     */
    initSurveyEdit: ({ state, rootState }, surveyId) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PUT,
            url: `${state.apiRequestUrl.surveysEdit}/${surveyId}/init`,
          })
          .then((res) => {
            resolve(res);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    /**
     * 편집 데이터 임시저장 or 편집 데이터를 실데이터로 임시저장
     * @param state
     * @param getters
     * @param commit
     * @param dispatch
     * @param rootState
     * @param payload
     * @returns {Promise<unknown>}
     */
    temporarilySaveSurvey: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      // 편집 데이터를 실데이터로 임시저장
      const isApply = payload && payload.isApply ? payload.isApply : false;
      let toastMessage = '임시저장 되었습니다.';
      let alertMessage = '';

      // 토스트 메시지 중복방지
      Vue.toasted.clear();

      // 설문 기본 제목이 없는 경우 기본값 지정
      const isEmptySurveyTitle =
        !state.curSurveyEdit.surveyTitle || (state.curSurveyEdit.surveyTitle && state.curSurveyEdit.surveyTitle.trim().length === 0);
      if (isEmptySurveyTitle) {
        commit('setCurSurveyEditAttr', { surveyTitle: '제목 없음' });
      }

      if (!getters.isCurSurveyPosted) {
        // 게시 일시: 예약을 선택했으나 일시가 초기화 됨
        if (state.curSurveyEdit.isReservation && !state.curSurveyEdit.surveyPosted) {
          state.curSurveyEdit.isReservation = false;
        }
      }
      // 현재 시간을 저장
      // 1. 게시 일시가 없는 경우
      // 2. 게시 전 예약 상태에서 즉시 상태로 변경할 경우
      if (
        !state.curSurveyEdit.surveyPosted ||
        (!getters.isCurSurveyPosted && state.beforeCurSurveyEdit.isReservation && !state.curSurveyEdit.isReservation)
      ) {
        state.curSurveyEdit.surveyPosted = moment().valueOf();
      }

      try {
        if (isApply && getters.isCurSurveyPublished && !getters.isCurSurveyPosted) {
          const opts = { reverseButtons: true };
          await rootState.hiClass.confirm('예약 발행한 설문을 임시저장 상태로 변경하시겠습니까?', 'info', opts).then(res => {
            if (res.dismiss === 'cancel' || res.isDismissed || res.isDenied) {
              return new Promise(reject => reject(false));
            } else {
              toastMessage = '';
              alertMessage = '임시저장 상태로 변경 하였습니다.';
              state.curSurveyEdit.surveyStatus = rootState.constants.SURVEY_STATUS.TEMPORARY;
            }
          });
        }
      } catch (e) {
        return new Promise(reject => reject(false));
      }

      try {
        switch (getters.curSurveyCreateMode) {
          case 'CREATE': {
            await dispatch('createSurveyEdit', payload);
            if (state.curSurveyEdit.surveyTitle === '제목 없음') commit('setCurSurveyEditAttr', { surveyTitle: '' });

            break;
          }
          case 'UPDATE': {
            // if (getters.isSelectedSurveySetting) {
            //   await dispatch('updateSurveyEdit', payload);
            // }

            if (getters.isSelectedSurveyEditQuestions) {
              if (getters.isCreateSurveyEditQuestions) {
                await dispatch('createSurveyEditQuestions', payload);
              } else if (state.isChangedSurveyEditQuestions) {
                // 박종철 getter.isUpdateSurveyEditQuestions 로 되있던거 state.isChangedSurveyEditQuestions 변경
                await dispatch('updateSurveyEditQuestions', payload);
              }

              // 질문을 서비스에 반영하는 경우에는 설정 정보도 같이 반영
              if (isApply) {
                await dispatch('updateSurveyEdit', payload);
              }

              // 질문 임시저장 완료 후 상세 정보 갱신 (박종철 갱신한 이유 갱신 전과 갱신후의 질문의 데이터 차이점 확인 필요)
              // 1.5.61 버전에서 제외 하지 말고 그대로 재조회 로직 남기기
              // if (getters.isUpdateSurveyEditQuestions && isApply) {
              //   await dispatch('getSurveyEditQuestions');
              // }
            } else if(getters.isSelectedSurveySetting && isApply) {
              await dispatch('updateSurveyEdit', payload);
            }

            if (state.curSurveyEdit.surveyTitle === '제목 없음') commit('setCurSurveyEditAttr', { surveyTitle: '' });
            break;
          }
        }
      } catch (e) {
        return new Promise(reject => reject(false));
      }
      if (!getters.isCurSurveyPosted && isApply) {
        if (toastMessage && !payload.quiet) {
          await Vue.toasted.show(toastMessage, { duration: 1300 });
        } else if (alertMessage) {
          await rootState.hiClass.alert(alertMessage, 'success');
        }
      }

      return await new Promise(resolve => resolve(true));
    },
    previewSurvey: async ({ state, getters, dispatch, rootState, commit }) => {
      const surveyId = state.curSurveyEdit.surveyId;
      if (!surveyId || !getters.isCurSurveyEditPagesQuestionValidated) {
        rootState.hiClass.alert('미리보기를 진행할 수 없습니다.<br>질문을 완성해주세요.', 'info');
        return false;
      }
      const isEmptySurveyTitle =
        !state.curSurveyEdit.surveyTitle || (state.curSurveyEdit.surveyTitle && state.curSurveyEdit.surveyTitle.trim().length === 0);
      if (isEmptySurveyTitle) {
        commit('setCurSurveyEditAttr', { surveyTitle: '제목 없음' });
      }

      await dispatch('updateSurveyEdit', { isApply: false });

      if (getters.isSelectedSurveyEditQuestions) {
        if (state.surveyEditQuestions.questionId) {
          await dispatch('updateSurveyEditQuestions', {});
        } else {
          await dispatch('createSurveyEditQuestions', {});
          if (state.curSurveyEdit.surveyTitle === '제목 없음') {
            commit('setCurSurveyEditAttr', { surveyTitle: '' });
          }
        }
      }
      const height = screen.availHeight;
      const width = screen.availWidth;
      const url = `/survey-response/${surveyId}` + `?preview=${true}` + `&isEditData=${true}` + `&newWindow=${true}`;
      const target = 'survey-create-preview';
      const features = `height=${height},width=${width},top=0,left=0,resizable,scrollbars=1`;
      window.open(url, target, features);
    },
    validateTempItems: async ({ state, getters, rootState }) => {
      return new Promise((resolve, reject) => {
        const existsTempTime = !!(
          getters.isSelectedSurveyEditQuestions &&
          Array.isArray(state.surveyEditQuestions.items) &&
          state.surveyEditQuestions.items.length > 0 &&
          state.surveyEditQuestions.items.find(item => item.isTempItem)
        );
        if (existsTempTime) {
          rootState.hiClass.alert(
            '필수 항목이 입력되지 않았습니다.<br><span class="icon-error-inline"></span> 표시된 질문을 다시 확인해주세요.',
            'info'
          );
          reject(false);
        } else {
          resolve(true);
        }
      });
    },
    validateItems: async ({ state, rootState }, payload) => {
      let message = '필수 항목이 입력되지 않았습니다.<br><span class="icon-error-inline"></span> 표시된 질문을 다시 확인해주세요.';

      return new Promise((resolve, reject) => {
        const emptyCalendar = !!(
          Array.isArray(state.surveyEditQuestions.items) && state.surveyEditQuestions.items.filter(item => !item.isDel).length === 0
        );
        const isConsultation = state.surveyEditQuestions.questionType === rootState.constants.QUESTION_TYPE.CONSULTATION;

        if (isConsultation && emptyCalendar) {
          // 삭제 예정인 item 이 없는 경우
          if (state.surveyEditQuestions.items.length === 0 && payload && payload.message) {
            message = payload.message;
          }
          rootState.hiClass.alert(message, 'info');
          reject(false);
        } else {
          resolve(true);
        }
      });
    },
    validateSaveSurvey: async ({ state, getters, commit, rootState, dispatch }) => {
      if (getters.isSelectedSurveyEditQuestions) {
        state.surveyEditQuestions.questionId ? await dispatch('updateSurveyEditQuestions', {}) : await dispatch('createSurveyEditQuestions', {});
      }

      // 설정 validate
      rootState.log.debug('getters.isCurSurveyEditValidated', getters.isCurSurveyEditValidated);

      // 질문 슬라이드 전체 validate
      rootState.log.debug('getters.isCurSurveyEditPagesQuestionValidated', getters.isCurSurveyEditPagesQuestionValidated);

      const clonedModel = _.cloneDeep(state.curSurveyEdit);
      const clonedPages = _.cloneDeep(state.surveyEditPages);

      if (!getters.isCurSurveyEditValidated) {
        const errMessageList = [
          ['최소 1개 이상 질문을 생성해주세요.', () => !clonedPages || (clonedPages && clonedPages.length === 0) ],
          ['설문 제목을 입력해주세요.', () => (clonedModel.surveyTitle || '').trim().length === 0],
          ['예약 시간을 선택해주세요.', () => {
            const isReservation = clonedModel.isReservation;
            const surveyPosted = clonedModel.surveyPosted;
            if (!getters.isCurSurveyPosted && !isReservation) {
              clonedModel.surveyPosted = moment().valueOf();
              state.curSurveyEdit.surveyPosted = clonedModel.surveyPosted;
            }
            return isReservation && !surveyPosted;
          }],
          ['설문 시작일시를 확인해주세요.', () => !clonedModel.timestampStart],
          ['설문 종료일시를 확인해주세요.', () => !clonedModel.timestampEnd],
          ['설문 종료일시를 시작일시 이후로 설정해주세요.', () => clonedModel.timestampStart >= clonedModel.timestampEnd],
          ['설문 대상을 선택해주세요.', () => {
            const isUsedUrl = clonedModel.isUsedUrl;
            const targetUserIdsLength = clonedModel.targetUserIds ? clonedModel.targetUserIds.length : 0;
            const targetCount = clonedModel.targetCount || targetUserIdsLength;
            return targetCount === 0 && !isUsedUrl;
          }],
          ['설문 종료일시는 게시일시보다 빠를 수 없습니다.', () => clonedModel.timestampEnd < clonedModel.surveyPosted],
          ['설문 종료일시는 게시일시와 같을 수 없습니다.', () => clonedModel.timestampEnd === clonedModel.surveyPosted],
          ['정원수를 기존에 등록한 숫자보다<br>작게 입력할 수 없습니다.', () => getters.hasSmallerTotalMax],
          ['대기수를 기존에 등록한 숫자보다<br>작게 입력할 수 없습니다.', () => getters.hasSmallerWaitMax],
          ['정원을 입력해 주세요.', () => getters.hasInvalidTotalMax],
          ['대기자 인원을 입력해주세요.', () => getters.hasInvalidWaitMax],
          ['예약 시간을 다시 확인해주세요.', () => clonedModel.isReservation && clonedModel.surveyPosted < state.currentTimestamp],
        ];
        const foundItem = errMessageList.find(item => item[1]());
        let errMessage = '설문 설정을 다시 확인해주세요.';
        rootState.log.debug(`foundItem => `, foundItem);
        if (foundItem) {
          errMessage = foundItem[0];
        }
        rootState.hiClass.alert(errMessage, 'info').then(() => {
          commit('setSurveyCreateBodyComponentName', 'SETTING');
          if (getters.hasSmallerTotalMax) 
            commit('restoreCurSurveyEdit', 'totalMax');
          if (getters.hasSmallerWaitMax)
            commit('restoreCurSurveyEdit', 'waitMax');
        });
        return false;
      }

      if (!getters.isCurSurveyEditPagesQuestionValidated) {
        rootState.hiClass
          .alert('필수 항목이 입력되지 않았습니다.<br><span class="icon-error-inline"></span> 표시된 질문을 다시 확인해주세요.', 'info')
          .then(() => {
            const validateFailPage = clonedPages.find(page => {
              return page.questions.find(question => !question.isValidated);
            });
            rootState.log.debug(`validateFailPage => `, validateFailPage);
          });
        return false;
      }
      commit("setSurveyCopyResource", {
        isCopy: false,
        data: {}
      })
      localStorage.setItem("isSurveyCopyResource", JSON.stringify(false))
      dispatch('openConfirmModalSaveSurvey');
    },
    openConfirmModalSaveSurvey: ({ state, getters, commit, rootState }) => {
      const surveyType = state.curSurveyEdit.surveyType;
      const constants = rootState.constants;
      const suffix = surveyType === constants.SURVEY_TYPE.VOTE ? '를' : '을';
      const surveyTypeName =
        surveyType === constants.SURVEY_TYPE.SURVEY
          ? constants.SURVEY_TYPE_NAME.SURVEY
          : constants.SURVEY_TYPE_NAME[surveyType] + ' ' + constants.SURVEY_TYPE_NAME.SURVEY;

      const confirmModal = {
        isOpen: true,
        isSendPush: false,
        titleHtml: null,
        reserveTimeHtml: null,
        descriptionHtml: null,
      };

      // 발송 완료 된 설문 수정 후 저장 시
      if (getters.isCurSurveyPublished) {
        confirmModal.titleHtml = '변경된 내용으로 저장하시겠습니까?'; //#71252 설문 > 발행 완료 시 안내 팝업 내 <br>로 생긴 간격 조정

        // 예약 발송
      } else if (state.curSurveyEdit.isReservation) {
        const surveyPosted = state.curSurveyEdit.surveyPosted;
        confirmModal.titleHtml = `${surveyTypeName}${suffix} 예약 하시겠습니까?`;
        confirmModal.reserveTimeHtml = moment(surveyPosted).format('YYYY년 M월 D일 H시 m분') + '<br><br>';
        confirmModal.isSendPush = true;

        // 즉시 발송
      } else {
        confirmModal.titleHtml = `${surveyTypeName}${suffix} 지금 발행하시겠습니까?`; //#71252 설문 > 발행 완료 시 안내 팝업 내 <br>로 생긴 간격 조정
        confirmModal.isSendPush = true;
      }

      commit('setSurveyCreateConfirmModal', confirmModal);
    },
    doSaveSurvey: async ({ state, getters, dispatch, rootState }) => {
      const payload = { isApply: true };
      const prevSurveyStatus = state.curSurveyEdit.surveyStatus;
      const mode = prevSurveyStatus === rootState.constants.SURVEY_STATUS.TEMPORARY ? 'CREATE' : 'UPDATE';

      // 상태 변경
      state.curSurveyEdit.surveyStatus = rootState.constants.SURVEY_STATUS.COMPLETE;
      state.curSurveyEdit.isPush = state.surveyCreateConfirmModal.isSendPush || false;

      // 현재 시간을 저장
      // 1. 게시 일시가 없는 경우
      // 2. 게시 전 예약 상태에서 즉시 상태로 변경할 경우
      if (
        !state.curSurveyEdit.surveyPosted ||
        (!getters.isCurSurveyPosted && state.beforeCurSurveyEdit.isReservation && !state.curSurveyEdit.isReservation)
      ) {
        state.curSurveyEdit.surveyPosted = moment().valueOf();
      }

      // 설문 질문 편집 중이라면 질문도 저장
      if (getters.isSelectedSurveyEditQuestions) {
        await dispatch('updateSurveyEditQuestions', {});
      }
      // 편집한 설문 설정 서비스에 반영
      await dispatch('updateSurveyEdit', payload);
      await dispatch('closeSurveyCreateConfirmModal');

      dispatch('showSurveyCreateComplete', { mode });
    },
    importSurvey: ({ commit, rootState }) => {
      rootState.hiClass.alert('TBD: importSurvey');
    },
    getSurveyEditTargetList: ({ state, getters, commit, rootState }) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: state.apiRequestUrl.surveysEditTargets,
          params: getters.surveyEditTargetReadQuery,
        })
        .then(res => {
          const editTargets = res.data._embedded && res.data._embedded.editTargets ? res.data._embedded.editTargets : [];
          commit('setSurveyEditTargetList', editTargets);
        })
        .catch(err => {
          rootState.hiClass.alert(err.message, 'warning');
          commit('setSurveyEditTargetList', []);
        });
    },
    openSurveyCreateTargetModal: ({ state, getters, commit }) => {
      const payload = {
        isOpen: true,
        classId: state.curSurveyEdit.classId,
        surveyId: getters.curSurveyId || null,
      };
      commit('setSurveyCreateTargetModal', payload);
    },
    closeSurveyCreateTargetModal: ({ commit }) => {
      commit('setSurveyCreateTargetModal', {
        isOpen: false,
        classId: null,
        surveyId: null,
        userType: null,
        name: null,
      });
      commit('setSurveyEditTargetList', []);
    },
    closeSurveyCreateConfirmModal: ({ commit }) => {
      commit('setSurveyCreateConfirmModal', {
        isOpen: false,
        isSendPush: false,
        titleHtml: null,
        reserveTimeHtml: null,
        descriptionHtml: null,
      });
      commit('setSurveyEditTargetList', []);
    },

    /**
     * 설문 복사
     */
    copySurveyCreate: ({ state, rootState, dispatch }, payload) => {
      const surveyId = payload.surveyId;

      return rootState
        .axios({
          method: REQUEST_METHOD.POST,
          url: `${state.apiRequestUrl.surveys}/${surveyId}/copy`,
          data: payload,
        })
        .then(res => {
          const newSurveyId = res.data.newSurveyId;

          switch (payload.purpose) {
            case 'SHARE_TO_LIST': {
              const msg = '설문 양식을 공유하였습니다.';
              const option = {
                cancelButtonText: '닫기',
                confirmButtonText: '목록보기',
                reverseButtons: true,
              };
              rootState.hiClass
                .confirm(msg, 'success', option)
                .then(res => {
                  dispatch('getSurveyContents', { surveyId: newSurveyId, surveyStatus: 'SHARE' });
                  dispatch('openRecommendTemplateModal');
                })
                .catch(err => {});
              break;
            }

            case 'KEEP_MY_STORAGE': {
              rootState.hiClass.alert('내 저장소에 저장하기');
              break;
            }
          }

          return res.status;
        })
        .catch(err => {
          return err.response.status;
        });
    },

    /**
     * 설문 복사 (편집모드로)
     */
    copySurveyCreateEdit: ({ state, commit, rootState, dispatch }, payload) => {
      const surveyId = payload.surveyId;

      rootState
        .axios({
          method: REQUEST_METHOD.POST,
          url: `${state.apiRequestUrl.surveys}/${surveyId}/copy/edit`,
          data: payload,
        })
        .then(res => {
          commit("setSurveyCopyResource", {
            isCopy: true,
            data: {
              ...res.data,
              totalMax: state.curSurveyEdit.totalMax,
              waitMax: state.curSurveyEdit.waitMax
            }
          })
          const newSurveyId = res.data.surveyId;
          const routeObj = {
            path: `/survey-create/${newSurveyId}`,
            query: {
              tabCode: state.surveySearchQuery.surveyStatus || null,
              classId: payload.classId
            },
          };
          router.push(routeObj, () => {});
        })
    },
    copySurveyCreateEdit2: ({ state, commit, rootState, dispatch }, payload) => {
      const surveyId = payload.surveyId;

      return rootState.axios({
        method: REQUEST_METHOD.POST,
        url: `${state.apiRequestUrl.surveys}/${surveyId}/copy/edit`,
        data: payload,
      })
    },

    /**
     * 편집 중인 설문에 붙여넣기
     */
    appendSurveyCreate: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      let surveyEditId = getters.curSurveyId;
      const surveyEditType = payload.surveyEditType;
      const readyMadeSurveyId = payload.readyMadeSurveyId;
      const readyMadeSurveyStatus = payload.readyMadeSurveyStatus || 'SHARE';
      const readyMadeSurveyType = payload.readyMadeSurveyType;

      if (!surveyEditId) {
        await dispatch('temporarilySaveSurvey', {});
        surveyEditId = getters.curSurveyId;
      }

      return rootState
        .axios({
          method: REQUEST_METHOD.PATCH,
          url: `${state.apiRequestUrl.surveys}/${surveyEditId}/append`,
          data: {
            surveyEditType,
            readyMadeSurveyId,
            readyMadeSurveyStatus,
            readyMadeSurveyType,
          },
        })
        .then(res => {
          /**
           * 편집 중인 설문에 붙여넣기 후 페이지 목록 갱신
           */
          const resource = res.data;
          rootState.log.warn(`appendSurveyCreate() resource`, resource);
          if (resource._embedded && resource._embedded.editPages) {
            commit('setSurveyEditPages', _.cloneDeep(resource._embedded.editPages));
          }
        })
        .catch(err => {
          rootState.log.error('store.survey appendSurveyCreate error => ', err);
        });
    },

    /****************************
     *
     * 설문 탭
     *
     ****************************/
    // 응답자 명단 조회 팝업
    openSurveyRespondentModalFlag: ({ commit }, payload) => {
      commit('setSelectedSurvey', payload.survey);
      commit('setIsCurSurveyRespondentModalOpen', true);
    },
    closeSurveyRespondentModalFlag: ({ commit }) => {
      commit('setIsCurSurveyRespondentModalOpen', false);
    },
    getCurSurveyRespondent: ({ commit, state, rootState }, payload) => {
      rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveysRespondents}/${payload}/list`,
        })
        .then(res => {
          commit('setCurSurveyRespondent', res.data);
        })
        .catch(err => {
          console.error('store.survey getCurSurveyRespondent error => ', err);
        });
    },
    clearCurSurveyRespondent: ({ commit }) => {
      commit('setCurSurveyRespondent', []);
    },
    sendSurveyRespondentPushMessage: ({ state, rootState }, payload) => {
      return rootState.axios({
        method: REQUEST_METHOD.POST,
        url: state.apiRequestUrl.surveysSendRemindMessage,
        data: payload,
      });
    },
    // 설문하기 클릭 > 조회수증가, 읽음처리
    setReadUser: ({ state, rootState, rootGetters }, surveyId) => {
      const deviceType = rootGetters.isMobile ? 'MOBILE' : 'PC';
      rootState
        .axios({
          method: REQUEST_METHOD.PUT,
          url: `${state.apiRequestUrl.surveys}/${surveyId}/read/user`,
          data: { deviceType: deviceType },
        })
        .catch(err => {
          console.error('store.survey setReadUser error => ', err);
        });
    },
    setReadCount: ({ state, rootState }, surveyId) => {
      rootState
        .axios({
          method: REQUEST_METHOD.PATCH,
          url: `${state.adUrl}${state.apiRequestUrl.surveys}/${surveyId}/read`,
        })
        .catch(err => {
          console.error('store.survey setReadCount error => ', err);
        });
    },
    // 설문종료
    setSurveyCancel: ({ state, rootState, dispatch }, surveyId) => {
      rootState
        .axios({
          method: REQUEST_METHOD.PATCH,
          url: `${state.apiRequestUrl.surveys}/${surveyId}/cancel`,
        })
        .then(res => {
          state.surveySearchQuery.surveyStatus = 'END';
          eventBus.$emit('do-search-resource', true);
        })
        .catch(err => {
          console.error('store.survey setSurveyCancel error => ', err);
        });
    },
    // 신규설문 확인
    getHasNewSurveys: ({ state, rootState, rootGetters }, timestamp) => {
      const requestParams = {};
      requestParams.timestamp = timestamp;
      requestParams.classId = rootGetters.curClassId;
      // TODO
      // requestParams.schoolId = rootGetters.schoolId

      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `${state.apiRequestUrl.surveys}/news`,
        params: requestParams,
      });
    },
    // 설문삭제
    deleteSurvey: ({ state, rootState }, surveyId) => {
      rootState
        .axios({
          method: REQUEST_METHOD.DELETE,
          url: `${state.apiRequestUrl.surveys}/${surveyId}`,
        })
        .then(res => {
          eventBus.$emit('do-search-resource', true);
        })
        .catch(err => {
          console.error('store.survey deleteSurvey error => ', err);
        });
    },
    deleteSurveys: ({ state, rootState }) => {
      if (state.selectedTemporarySurveys.length < 1) {
        return false;
      }

      const deleteSurveys = {
        surveyIds: state.selectedTemporarySurveys,
      };
      rootState
        .axios({
          method: REQUEST_METHOD.DELETE,
          url: `${state.apiRequestUrl.surveys}`,
          data: deleteSurveys,
        })
        .then(res => {
          eventBus.$emit('do-search-resource', true);
        })
        .catch(err => {
          console.error('store.survey deleteSurveys error => ', err);
        });
    },
    // 임시저장탭 설문 선택
    clickTemporarySurvey: ({ state }, surveyId) => {
      // 선택한 설문과 동일한 surveyId가 포함되어있으면 인덱스를 구해서 삭제
      if (state.selectedTemporarySurveys.includes(surveyId)) {
        const index = state.selectedTemporarySurveys.findIndex(findSurveyId => findSurveyId === surveyId);
        state.selectedTemporarySurveys.splice(index, 1);
      } else {
        state.selectedTemporarySurveys.push(surveyId);
      }
    },
    clearSelectedTemporarySurveys: ({ commit }) => {
      commit('setSelectedTemporarySurveys', []);
    },

    /****************************
     *
     * 설문 만들기 > 설문 질문
     *
     ****************************/
    createSlide: async ({ state, getters, commit, dispatch, rootState }) => {
      const immutableQuestionTypes = [rootState.constants.QUESTION_TYPE.AFTER_SCHOOL, rootState.constants.QUESTION_TYPE.CONSULTATION];

      if (!rootState.isLoading) {
        commit('setIsLoading', true, { root: true });

        // 현재 편집 중인 데이터(설정, 질문) 저장
        const result = await dispatch('temporarilySaveSurvey', {});
        if (result) {
          // 신규 페이지 생성 전 페이지 총 개수
          const pageTotalCount = state.surveyEditPages.length;
          let beforePageId = null;
          let beforeIndex = -1;

          try {
            while (state.surveyEditPages[pageTotalCount + beforeIndex]) {
              if (
                state.surveyEditPages[pageTotalCount + beforeIndex] &&
                state.surveyEditPages[pageTotalCount + beforeIndex].questions.find(q => immutableQuestionTypes.includes(q.questionType))
              ) {
                --beforeIndex;
              } else {
                beforePageId = state.surveyEditPages[pageTotalCount + beforeIndex]
                  ? state.surveyEditPages[pageTotalCount + beforeIndex].pageId
                  : null;
                break;
              }
            }
          } catch (e) {
            rootState.log.error(e);
          }

          const payload = {
            beforePageId: beforePageId,
            questionType: rootState.constants.QUESTION_TYPE.CHOICE,
          };
          await dispatch('initSurveyEditQuestions', payload);

          // 질문 컴포넌트가 활성화되어 있지 않은 경우 질문 컴포넌트로 변경
          if (!getters.isSelectedSurveyEditQuestions) {
            commit('setSurveyCreateBodyComponentName', 'QUESTION');
          }

          // 신규 질문 저장
          await dispatch('temporarilySaveSurvey', {});

          commit('setIsLoading', false, { root: true });
        } else {
          commit('setIsLoading', false, { root: true });
        }
      }
    },
    createQuestion: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      const isAlreadySaved = payload.isAlreadySaved;
      const result = isAlreadySaved ? true : await dispatch('temporarilySaveSurvey', {});

      if (result) {
        /**
         * payload = { pageId, beforePageId, beforeQuestionId }
         */
        payload.questionType = rootState.constants.QUESTION_TYPE.CHOICE;
        await dispatch('initSurveyEditQuestions', payload);
        // 질문 컴포넌트가 활성화되어 있지 않은 경우 질문 컴포넌트로 변경
        if (!getters.isSelectedSurveyEditQuestions) {
          commit('setSurveyCreateBodyComponentName', 'QUESTION');
        }
        await dispatch('temporarilySaveSurvey', {});
      }
    },
    createDefaultQuestion: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      if (state.surveyEditPages.length === 0) {
        const isAlreadySaved = payload.isAlreadySaved;
        const result = isAlreadySaved ? true : await dispatch('temporarilySaveSurvey', {});

        if (result) {
          /**
           * payload = { pageId, beforePageId, beforeQuestionId }
           */
          await dispatch('initSurveyEditQuestions', payload);

          switch (state.curSurveyEdit.surveyType) {
            case rootState.constants.SURVEY_TYPE.AFTER_SCHOOL:
            case rootState.constants.SURVEY_TYPE.CONSULTATION: {
              await dispatch('forceDeleteSurveyEditQuestionsItem');
              break;
            }
            default:
          }
          await dispatch('forceDeleteSurveyEditQuestionsConsultationSetting');
          await dispatch('createSurveyEditQuestions', payload);
        }
      }
    },
    copySlide: async ({ state, getters, commit, dispatch, rootState }, question) => {
      try {
        commit('setIsLoading', true, { root: true });

        let questionId = question.questionId;

        // 질문 편집 중이라면 현재 질문 저장
        if (getters.isSelectedSurveyEditQuestions && questionId) {
          await dispatch('updateSurveyEditQuestions', {});
        }
        // 복사할 질문의 questionId 가 없는 경우 질문 신규 저장 후 questionId 가져오기
        if (!questionId) {
          await dispatch('createSurveyEditQuestions', {});
          questionId = state.surveyEditQuestions.questionId;
        }
        // 복사할 질문이 현재 편집 중인 질문이 아니라면 선택한 질문 정보를 store 에 세팅
        if (questionId !== state.surveyEditQuestions.questionId) {
          await dispatch('getSurveyEditQuestions', questionId);
        }

        const cloneSurveyQuestion = _.cloneDeep(state.surveyEditQuestions);
        const surveyQuestion = {};

        // 1. question
        for (const [key, value] of Object.entries(cloneSurveyQuestion)) {
          switch (key) {
            case 'questionId':
            case 'pageId':
              break;
            case 'items':
            case 'itemGroups':
            case 'files':
              surveyQuestion[key] = [];
              break;
            default:
              surveyQuestion[key] = value;
              break;
          }
        }

        // 복사하기 누른 질문 아래로 생성하기 위함
        surveyQuestion.beforePageId = cloneSurveyQuestion.pageId;

        // 2. items
        if (cloneSurveyQuestion.items && cloneSurveyQuestion.items.length > 0) {
          cloneSurveyQuestion.items.forEach(item => {
            item.itemId = null;
            item.files.length > 0 ? item.files.forEach(file => (file.fileId = null)) : (item.files = []);
            surveyQuestion.items.push(item);
          });
        }

        // 3. TODO itemGroups-드롭다운

        // 4. files
        if (cloneSurveyQuestion.files && cloneSurveyQuestion.files.length > 0) {
          cloneSurveyQuestion.files.forEach(file => {
            file.fileId = null;
            surveyQuestion.files.push(file);
          });
        }

        // question 저장
        dispatch('copySurveyEditQuestions', surveyQuestion);

        commit('setIsLoading', false, { root: true });
      } catch (e) {
        commit('setIsLoading', false, { root: true });
        rootState.log.error(e);
      }
    },
    copyQuestion: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      try {
        commit('setIsLoading', true, { root: true });

        const question = payload.question;
        const pageId = payload.pageId;
        const beforePageId = payload.beforePageId;
        const beforeQuestionId = payload.beforeQuestionId;

        let questionId = question.questionId;

        // 질문 편집 중이라면 현재 질문 저장
        if (getters.isSelectedSurveyEditQuestions && questionId) {
          await dispatch('updateSurveyEditQuestions', payload);
        }
        // 복사할 질문의 questionId 가 없는 경우 질문 신규 저장 후 questionId 가져오기
        if (!questionId) {
          await dispatch('createSurveyEditQuestions', payload);
          questionId = state.surveyEditQuestions.questionId;
        }
        // 복사할 질문이 현재 편집 중인 질문이 아니라면 선택한 질문 정보를 store 에 세팅
        if (questionId !== state.surveyEditQuestions.questionId) {
          await dispatch('getSurveyEditQuestions', questionId);
        }

        const cloneSurveyQuestion = _.cloneDeep(state.surveyEditQuestions);
        const surveyQuestion = {};

        // 1. question
        for (const [key, value] of Object.entries(cloneSurveyQuestion)) {
          switch (key) {
            case 'questionId':
            case 'pageId':
              break;
            case 'items':
            case 'itemGroups':
            case 'files':
              surveyQuestion[key] = [];
              break;
            default:
              surveyQuestion[key] = value;
              break;
          }
        }

        surveyQuestion.pageId = pageId;
        surveyQuestion.beforePageId = beforePageId;
        surveyQuestion.beforeQuestionId = beforeQuestionId;

        // 2. items
        if (cloneSurveyQuestion.items && cloneSurveyQuestion.items.length > 0) {
          cloneSurveyQuestion.items.forEach(item => {
            item.itemId = null;
            item.files.length > 0 ? item.files.forEach(file => (file.fileId = null)) : (item.files = []);
            surveyQuestion.items.push(item);
          });
        }

        // 3. TODO: itemGroups-드롭다운

        // 4. files
        if (cloneSurveyQuestion.files && cloneSurveyQuestion.files.length > 0) {
          cloneSurveyQuestion.files.forEach(file => {
            file.fileId = null;
            surveyQuestion.files.push(file);
          });
        }

        // question 저장
        dispatch('copySurveyEditQuestions', surveyQuestion);

        commit('setIsLoading', false, { root: true });
      } catch (e) {
        commit('setIsLoading', false, { root: true });
        rootState.log.error(e);
      }
    },
    copyQuestionItem: async ({ commit, dispatch, rootState }, payload) => {
      try {
        commit('setIsLoading', true, { root: true });

        const payloadItem = payload.item;
        const payloadLastSortNo = payload.lastSortNo;
        const payloadDestinationItems = payload.destinationItems;

        const copyItemSortNo = payloadLastSortNo + 1;
        const cloneQuestionItem = _.cloneDeep(payloadItem);
        const copyQuestionItem = {};

        for (const [key, value] of Object.entries(cloneQuestionItem)) {
          switch (key) {
            case 'itemId':
            case 'respondentId':
            case 'linkPageId': {
              copyQuestionItem[key] = null;
              break;
            }
            case 'itemTitle': {
              copyQuestionItem[key] = '[복사본] ' + value;
              break;
            }
            case 'sortNo': {
              copyQuestionItem[key] = copyItemSortNo;
              break;
            }
            case 'files': {
              const files = _.cloneDeep(value) || [];
              copyQuestionItem[key] = files.map(file => {
                delete file.fileId;
                return file;
              });
              break;
            }
            case 'afterSchoolTargets': {
              const afterSchoolTargets = _.cloneDeep(value) || [];
              copyQuestionItem[key] = afterSchoolTargets.map(target => {
                delete target.targetId;
                return target;
              });
              break;
            }
            case 'afterSchoolTimetables': {
              const afterSchoolTimetables = _.cloneDeep(value) || [];
              copyQuestionItem[key] = afterSchoolTimetables.map(timetable => {
                delete timetable.timetableId;
                return timetable;
              });
              break;
            }
            case 'limit': {
              const limitObj = _.cloneDeep(value);
              delete limitObj.limitId;
              copyQuestionItem[key] = limitObj;
              break;
            }
            case 'isCanceled': {
              copyQuestionItem[key] = false;
              break;
            }
            default: {
              copyQuestionItem[key] = value;
            }
          }
        }
        copyQuestionItem.isCopiedItem = true;
        payloadDestinationItems.push(copyQuestionItem);

        await dispatch('updateSurveyEditQuestions', {});

        commit('setIsLoading', false, { root: true });
      } catch (e) {
        commit('setIsLoading', false, { root: true });
        rootState.log.error(e);
      }
    },
    initSurveyEditQuestions: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      await dispatch('clearSurveyEditQuestions');

      const surveyEditQuestions = {
        // 질문 id
        questionId: null,
        // 설문 id
        surveyId: null,
        // 페이지 id
        pageId: null,

        // 질문 유형 (CHOICE : 객관식, SUBJECTIVE : 주관식, SIGN : 서명, DROPDOWN : 드롭다운, STAR : 별점, ATTACHMENTS : 첨부파일, DESCRIPTION : 설명, CONSULTATION : 학부모 상담, AFTER_SCHOOL : 방과후, VOTE : 투표)
        questionType: null,
        // 질문 제목
        questionTitle: null,
        // 질문 설명
        questionDescription: null,

        // 이 질문이 유효한가
        isValidated: false,
        // 필수 응답인가
        isRequired: false,
        // 응답자가 항목 추가 가능한가
        isAddedAnswer: false,
        // 이 질문의 답변에 다른 페이지를 연결 할 것인가
        isLinkedPage: false,
        // 1/2 별점 허용하는가
        isUsedHalfStar: false,
        // (방과후학습) 시간 중복 신청을 허용할 것인가
        isAllowedOverlapTime: true,
        // (객관식) 복수 응답 허용 여부 (방과후학습) 신청 과목 개수 제한 여부
        isMultipleAnswer: false,
        // 편집데이터를 서비스에 적용할 것인가
        isApply: false,
        // (isApply 가 true 일 경우) 푸시를 보낼 것인가
        isPush: false,

        // 질문 순서
        sortNo: null,
        // (isMultipleAnswer 가 true 일때) (객관식) 복수 응답 가능 개수 - null 이면 제한없음 (방과후학습) 신청과목개수 - null 이면 제한없음 (별점) 최대 별점개수
        answerLimit: null,

        // 연결된 페이지 id
        linkPageId: null,
        // 이전 페이지 id (null 이면 첫 페이지로)
        beforePageId: null,
        // 이전 질문 id (null 일 경우 페이지의 첫 질문이 됨)
        beforeQuestionId: null,

        // 질문 파일 목록
        files: [],

        // 선택지 목록
        items: [],
      };
      if (getters.curSurveyId) {
        surveyEditQuestions.surveyId = getters.curSurveyId;
      }

      // surveyType 별로 초기화되는 질문 set 이 다름
      switch (state.curSurveyEdit.surveyType) {
        case rootState.constants.SURVEY_TYPE.SURVEY: {
          surveyEditQuestions.questionType = payload.questionType || rootState.constants.QUESTION_TYPE.CHOICE;
          surveyEditQuestions.answerLimit = null;
          break;
        }
        case rootState.constants.SURVEY_TYPE.AFTER_SCHOOL: {
          surveyEditQuestions.questionType = payload.questionType || rootState.constants.QUESTION_TYPE.AFTER_SCHOOL;
          break;
        }
        case rootState.constants.SURVEY_TYPE.CONSULTATION: {
          surveyEditQuestions.questionType = payload.questionType || rootState.constants.QUESTION_TYPE.CONSULTATION;
          break;
        }
        default: {
          surveyEditQuestions.questionType = payload.questionType || rootState.constants.QUESTION_TYPE.CHOICE;
        }
      }

      switch (surveyEditQuestions.questionType) {
        case rootState.constants.QUESTION_TYPE.AFTER_SCHOOL: {
          // 방과후 신청 > 신청 가능한 수업 개수 제한 checked
          surveyEditQuestions.isMultipleAnswer = true;
          // 방과후 신청 > 신청 가능한 수업 개수
          surveyEditQuestions.answerLimit = 1;
          break;
        }
        case rootState.constants.QUESTION_TYPE.CONSULTATION: {
          // 학부모상담 저작 정보
          surveyEditQuestions.consultationSetting = {
            // 학부모상담 저작 정보 id
            settingId: null,
            // 상담 시작일 : yyyy-MM-dd
            dateStart: null,
            // 상담 종료일 : yyyy-MM-dd
            dateEnd: null,
            // 상담 시작시각 : HH:mm
            timeStart: null,
            // 상담 종료시각 : HH:mm
            timeEnd: null,
            // 상담 시간 간격 (분단위) : 0~99
            timeConsultation: null,
            // 휴식 시간 (분단위) : 0~99
            timeRecess: null,
            // 상담유형(전화)
            isPhone: true,
            // 상담유형(방문)
            isVisit: true,
            // 상담유형(원격)
            isRemote: false,

            /**
             * 학부모 상담 달력 자동 저장 처리하지 않음 (submit 할 경우에만 저장)
             */
            isTempSetting: true,
          };
          // 학부모 상담 유형인 경우 상시 필수 응답
          surveyEditQuestions.isRequired = true;
          break;
        }
        default:
      }

      // 아이템 초기화
      switch (surveyEditQuestions.questionType) {
        case rootState.constants.QUESTION_TYPE.CHOICE: {
          // 객관식 아이템 개수 초기값 4개
          for (let i = 0; i < 4; i++) {
            const itemSet = await dispatch('initSurveyEditQuestionsItem', surveyEditQuestions.questionType);
            if (itemSet) {
              surveyEditQuestions.items.push(itemSet);
            }
          }
          break;
        }
        default: {
          const itemSet = await dispatch('initSurveyEditQuestionsItem', surveyEditQuestions.questionType);
          if (itemSet) {
            surveyEditQuestions.items.push(itemSet);
          }
        }
      }

      Object.entries(payload).forEach(([key, value]) => {
        surveyEditQuestions[key] = value;
      });
      commit('setSurveyEditQuestions', surveyEditQuestions);
    },
    initSurveyEditQuestionsItem: async ({ state, getters, commit, dispatch, rootState }, questionType) => {
      let itemSet = null;

      // 기본 item set
      switch (questionType) {
        case rootState.constants.QUESTION_TYPE.CHOICE:
        case rootState.constants.QUESTION_TYPE.AFTER_SCHOOL:
        case rootState.constants.QUESTION_TYPE.CONSULTATION: {
          itemSet = {
            // 선택지 내용 (방과후학습) 수업명
            itemTitle: null,
            // 선택지 가중치 (별점 등)
            itemWeight: null,
            // 선택지 설명 (방과후학습) 수업설명
            itemDescription: null,
            // 선택지 순서
            sortNo: 1,
            // 연결된 페이지 id
            linkPageId: null,
            // 이 선택지를 추가한 응답자의 id
            respondentId: null,

            // 기타 항목을 입력할수있는 선택지인가
            isEtcAnswer: false,
            // 응답자가 추가한 선택지인가
            isAddedAnswer: false,
            // 응답에 사용된 선택지인가
            isUsedResponse: false,
            // (선착순) 정원수를 제한했는가
            isLimitedTotal: false,
            // (선착순) 대기수를 제한했는가
            isLimitedWait: false,
            // (방과후학습) 요일별 시간 선택
            isWeekTime: false,
            // (방과후학습) 폐강했는가
            isCanceled: false,

            /**
             * 선택지의 파일 목록
             */
            files: [],
          };
          break;
        }
      }

      switch (questionType) {
        case rootState.constants.QUESTION_TYPE.AFTER_SCHOOL: {
          // (선착순) 응답자 선정 방식 (FCFS:선착순, DRAW:추첨)
          itemSet.selectionType = 'FCFS';
          // (방과후학습) 수강료
          itemSet.itemField1 = null;
          // (방과후학습) 강사명
          itemSet.itemField2 = null;

          /**
           * 방과후 수업시간 목록
           * items[].afterSchoolTimetables[].dayOfWeek: 요일 (1:월, 2:화, 3:수, 4:목, 5:금, 6:토, 7:일)
           * items[].afterSchoolTimetables[].timeStart: 방과후 시작시각 : HH:mm
           * items[].afterSchoolTimetables[].timeEnd: 방과후 종료시각 : HH:mm
           */
          itemSet.afterSchoolTimetables = [];

          /**
           * 방과후 수업대상 목록
           * items[].afterSchoolTargets[].schoolType: 학교 구분 코드 (KINDERGARTEN: 유치원, ELEMENTARY: 초등학교, MIDDLE: 중학교, HIGH: 고등학교, SPECIAL: 특수학교, UNIVERSITY: 대학교, NONE: 기타)
           * items[].afterSchoolTargets[].classGrade: 학년 코드 (
           *   E1:초1, E2:초2, E3:초3, E4:초4, E5:초5, E6:초6,
           *   M1:중1, M2:중2, M3:중3,
           *   H1:고1, H2:고2, H3:고3,
           *   E1:특1, E2:특2, E3:특3, E4:특4, E5:특5, E6:특6,
           *   U1:대1, U2:대2, U3:대3, U4:대4,
           *   NONE:기타, 유치원
           * )
           */
          itemSet.afterSchoolTargets = [];

          /**
           * 선착순 정원 정보
           */
          itemSet.limit = {
            // 선착순 정원 관리 id
            limitId: null,
            // 최대 정원
            totalMax: null,
            // 최대 대기인원 (설정안할경우 0)
            waitMax: 0,
          };

          /**
           * 자동 저장 처리하지 않음 (submit 할 경우에만 저장)
           */
          itemSet.isTempItem = true;
          break;
        }
        case rootState.constants.QUESTION_TYPE.CONSULTATION: {
          // (학부모상담) 상담일 : yyyy-MM-dd
          itemSet.itemDate = null;
          // (학부모상담) 시작시간 : HH:mm
          itemSet.itemTimeStart = null;
          // (학부모상담) 종료시간 : HH:mm
          itemSet.itemTimeEnd = null;
          break;
        }
      }
      return itemSet;
    },
    createSurveyEditQuestions: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      if (getters.curSurveyId) {
        state.surveyEditQuestions.surveyId = getters.curSurveyId;
      }
      Object.entries(payload).forEach(([key, value]) => {
        state.surveyEditQuestions[key] = value;
      });
      if (typeof state.surveyEditQuestions.isApply === 'undefined') {
        state.surveyEditQuestions.isApply = false;
      }
      if (state.surveyEditQuestions.consultationSetting && state.surveyEditQuestions.consultationSetting.isTempSetting) {
        state.surveyEditQuestions.consultationSetting = null;
      }

      /**
       * 질문 설명 RGB to Hex
       */
      if (state.surveyEditQuestions.questionDescription) {
        state.surveyEditQuestions.questionDescription = stringUtil.replaceRgbToHex(state.surveyEditQuestions.questionDescription);
      }

      const surveyEditQuestions = state.surveyEditQuestions;
      surveyEditQuestions.items = surveyEditQuestions.items.filter(item => item.sortNo && !item.isTempItem);
      surveyEditQuestions.isValidated = await dispatch('getIsValidatedByStateSurveyEditQuestions');

      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.POST,
            url: state.apiRequestUrl.surveysEditQuestions,
            data: surveyEditQuestions,
          })
          .then(async res => {
            const resource = res.data;
            rootState.log.warn(`createSurveyEditQuestions() resource`, resource);
            /**
             * 질문 등록 후 페이지 목록 갱신
             */
            if (resource.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource.editPages));
              delete resource.editPages;
            }
            commit('setSurveyEditQuestions', resource);
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    getSurveyEditQuestions: async ({ state, getters, commit, dispatch, rootState }, questionId) => {
      questionId = questionId || state.surveyEditQuestions.questionId;

      if (!questionId) return true;

      try {
        const res = await rootState.axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveysEditQuestions}/${questionId}`,
        });

        if (res) {
          const resource = res.data;
          rootState.log.debug(`getSurveyEditQuestions() resource`, resource);
          commit('setSurveyEditQuestions', resource);
        }
      } catch (err) {
        rootState.log.warn(err);
        return false;
      }
    },
    updateSurveyEditQuestions: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      const surveyEditQuestions = state.surveyEditQuestions;
      surveyEditQuestions.items = surveyEditQuestions.items.filter(item => item.sortNo && !item.isTempItem);

      Object.entries(payload).forEach(([key, value]) => {
        surveyEditQuestions[key] = value;
      });

      /**
       * 질문 설명 RGB to Hex
       */

      state.surveyEditQuestions.questionDescription = state.surveyEditQuestionsEditDescription
      if (state.surveyEditQuestions.questionDescription) {
        state.surveyEditQuestions.questionDescription = stringUtil.replaceRgbToHex(state.surveyEditQuestions.questionDescription);
      }

      /**
       * 방과후 신청 question 수정
       */
      if (state.surveyEditQuestions.questionType === rootState.constants.QUESTION_TYPE.AFTER_SCHOOL && !surveyEditQuestions.isMultipleAnswer) {
        // 방과후 신청 유형인 경우 상시 신청 가능한 수업 개수 제한
        surveyEditQuestions.isMultipleAnswer = true;
      }

      // 학부모 상담 달력 설정 미확인 저장 방지
      if (state.surveyEditQuestions.consultationSetting && state.surveyEditQuestions.consultationSetting.isTempSetting) {
        state.surveyEditQuestions.consultationSetting = null;
      }

      /**
       * 학부모 상담 items 수정
       */
      if (state.surveyEditQuestions.questionType === rootState.constants.QUESTION_TYPE.CONSULTATION && surveyEditQuestions.items.length > 0) {
        // 학부모 상담 items 비활성화된 item 삭제 처리
        surveyEditQuestions.items = surveyEditQuestions.items.filter(item => !item.isDel);

        await dispatch('sortingSurveyEditQuestionConsultationItems', {
          items: state.surveyEditQuestions.items,
        });
      }

      /**
       * 학부모 상담 isRequired 수정
       */
      if (state.surveyEditQuestions.questionType === rootState.constants.QUESTION_TYPE.CONSULTATION && !surveyEditQuestions.isRequired) {
        // 학부모 상담 유형인 경우 상시 필수 응답
        surveyEditQuestions.isRequired = true;
      }

      if (typeof surveyEditQuestions.isApply === 'undefined') {
        surveyEditQuestions.isApply = false;
      }
      // '질문 수정사항'이 없고 '서비스 반영'이 아닌 경우 저장 요청하지 않음
      if (!state.isChangedSurveyEditQuestions && !surveyEditQuestions.isApply) {
        return new Promise(resolve => resolve(true));
      }
      surveyEditQuestions.isValidated = await dispatch('getIsValidatedByStateSurveyEditQuestions');

      if(!rootState.isLoading) {
        commit('setIsConsultationLoading', true, { root: true })
      }

      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PUT,
            url: `${state.apiRequestUrl.surveysEditQuestions}/${state.surveyEditQuestions.questionId}`,
            data: surveyEditQuestions,
          })
          .then(async res => {
            /**
             * 질문 수정 후 페이지 목록 갱신
             */
            const resource = res.data;
            rootState.log.debug(`updateSurveyEditQuestions()`);
            
            commit('setIsConsultationLoading', false, { root: true })
            
            if (resource && resource.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource.editPages));
              delete resource.editPages;
            }
            if (resource && resource.consultationSetting) {
              commit('setConsultationSetting', _.cloneDeep(resource.consultationSetting));
            }

            // 1.5.61 버전에서 재조회를 태우기 때문에 롤백 처리.
            if(surveyEditQuestions.isApply) {
              commit('setSurveyEditQuestions', {...resource, skipInitializeItems: payload.skipInitializeItems || false})
            }
            // 1.5.61 버전에서 재조회를 태우기 때문에 롤백 처리.
            resolve(true);
          })
          .catch(err => {
            commit('setIsConsultationLoading', false, { root: true })
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    deleteSurveyEditQuestions: async ({ state, getters, commit, rootState, dispatch }, payload) => {
      const question = payload.question;
      const questionId = question.questionId;

      if (!questionId) {
        return dispatch('removeBlankSurveyPageQuestion');
      }
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.DELETE,
            url: `${state.apiRequestUrl.surveysEditQuestions}/${questionId}`,
          })
          .then(res => {
            /**
             * 질문 삭제 후 페이지 목록 갱신
             */
            const resource = res.data;
            rootState.log.warn(`deleteSurveyEditQuestions() resource`, resource);
            if (resource._embedded && resource._embedded.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource._embedded.editPages));
            }
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    copySurveyEditQuestions: ({ state, getters, commit, dispatch, rootState }, copySurveyQuestion) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.POST,
            url: state.apiRequestUrl.surveysEditQuestions,
            data: copySurveyQuestion,
          })
          .then(res => {
            const resource = res.data;
            rootState.log.warn(`createSurveyEditQuestions() resource`, resource);
            /**
             * 질문 복사 후 페이지 목록 갱신
             */
            if (resource && resource.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource.editPages));
              delete resource.editPages;
            }
            commit('setSurveyEditQuestions', resource);
            Vue.toasted.clear();
            Vue.toasted.show('복사되었습니다.', { duration: 1300 });
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    addSurveyEditQuestionsItem: async ({ state, dispatch }, payload) => {
      const isEtcAnswer = payload.isEtcAnswer || false;
      const itemTitle = isEtcAnswer ? '기타' : null;
      const sortNoList = state.surveyEditQuestions.items
        .filter(item => item.sortNo && !item.isEtcAnswer)
        .map(item => item.sortNo)
        .sort((a, b) => a - b);

      const addIndex = sortNoList[sortNoList.length - 1];
      const lastSortNo = ++sortNoList[sortNoList.length - 1];
      const questionType = state.surveyEditQuestions.questionType;
      const itemSet = (await dispatch('initSurveyEditQuestionsItem', questionType)) || {};
      itemSet.itemTitle = itemTitle;
      itemSet.sortNo = Number.isNaN(lastSortNo) ? 1 : lastSortNo;
      itemSet.isEtcAnswer = isEtcAnswer;

      state.surveyEditQuestions.items.splice(addIndex, 0, itemSet);

      await dispatch('changeSurveyQuestionItemSort');
    },
    deleteSurveyEditQuestionsItem: async ({ state, dispatch }, selectItem) => {
      const isEtcAnswer = selectItem.isEtcAnswer;
      const isEtcAnswerCase = item => item.isEtcAnswer && item.sortNo === selectItem.sortNo;
      const isNormalAnswerCase = item => !item.isEtcAnswer && item.sortNo === selectItem.sortNo;
      const foundIndex = isEtcAnswer
        ? state.surveyEditQuestions.items.findIndex(isEtcAnswerCase)
        : state.surveyEditQuestions.items.findIndex(isNormalAnswerCase);

      state.surveyEditQuestions.items.splice(foundIndex, 1);
      await dispatch('changeSurveyQuestionItemSort');
    },
    forceDeleteSurveyEditQuestionsItem: ({ state }) => {
      state.surveyEditQuestions.items.splice(0);
    },
    forceDeleteSurveyEditQuestionsConsultationSetting: ({ state }) => {
      state.surveyEditQuestions.consultationSetting = null;
    },
    changeSurveyQuestionItemSort: ({ state }) => {
      const totalElements = state.surveyEditQuestions.items.length;
      let index = 0;

      state.surveyEditQuestions.items.forEach(item => {
        item.sortNo = item.isEtcAnswer ? totalElements : ++index;
      });
      return new Promise(resolve => resolve(true));
    },
    checkSurveyEditQuestionsAnswerLimit: ({ state, rootState }) => {
      const isMultipleAnswer = state.surveyEditQuestions.isMultipleAnswer;
      const answerLimit = state.surveyEditQuestions.answerLimit;
      const itemTotalCount = state.surveyEditQuestions.items.length;

      if (answerLimit !== null) {
        let message;

        switch (state.surveyEditQuestions.questionType) {
          case rootState.constants.QUESTION_TYPE.CHOICE: {
            if (isMultipleAnswer && itemTotalCount < answerLimit) {
              // 응답 개수 초기화
              state.surveyEditQuestions.answerLimit = null;
              // toast 메시지
              message = '복수 응답 개수를 다시 확인해주세요.';
              // 객관식 유형인 경우에만 복수 응답 unChecked
              state.surveyEditQuestions.isMultipleAnswer = false;
            }
            break;
          }
          case rootState.constants.QUESTION_TYPE.AFTER_SCHOOL: {
            if (itemTotalCount <= answerLimit) {
              // 응답 개수 초기화
              state.surveyEditQuestions.answerLimit = null;
              // toast 메시지
              message = '신청 가능한 수업 개수를 다시 확인해주세요.';
            }
            break;
          }
          default:
        }

        if (message) {
          Vue.toasted.clear();
          Vue.toasted.show(message);
        }
      }
    },
    clearSurveyEditQuestions: ({ commit }) => {
      commit('setSurveyEditQuestions', {});
    },
    getSurveyEditPagesSimple: ({ state, rootState }, payload) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveysEditPagesSimple}`,
          params: payload,
        })
        .then(res => {
          state.surveyEditPagesSimple = res.data._embedded && res.data._embedded.editPageSimples ? res.data._embedded.editPageSimples : [];
        })
        .catch(err => {
          rootState.hiClass.alert('getSurveyEditPagesSimple() ' + err);
        });
    },
    getSurveyEditQuestionsSimple: ({ state, rootState }, payload) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveysEditQuestionsSimple}`,
          params: payload,
        })
        .then(res => {
          state.surveyEditQuestionsSimple = res.data._embedded && res.data._embedded.editQuestions ? res.data._embedded.editQuestions : [];
          return state.surveyEditQuestionsSimple;
        })
        .catch(err => {
          rootState.hiClass.alert('getSurveyEditQuestionsSimple() ' + err);
        });
    },
    /**
     * 현재 편집 중인 질문의 실시간 유효성 체크
     * @returns {boolean}
     */
    getIsValidatedByStateSurveyEditQuestions: ({ state, rootState }) => {
      let isValidated = false;
      const surveyEditQuestions = state.surveyEditQuestions;
      const questionType = surveyEditQuestions.questionType;
      switch (questionType) {
        case rootState.constants.QUESTION_TYPE.CHOICE: {
          const existsItemsCount = surveyEditQuestions.items.filter(item => item.itemTitle).length;
          const emptyItemsCount = surveyEditQuestions.items.filter(item => !item.itemTitle).length;
          isValidated = !!(surveyEditQuestions.questionTitle && existsItemsCount > 0 && emptyItemsCount === 0);
          break;
        }
        case rootState.constants.QUESTION_TYPE.SUBJECTIVE:
        case rootState.constants.QUESTION_TYPE.SIGN: {
          isValidated = !!surveyEditQuestions.questionTitle;
          break;
        }
        case rootState.constants.QUESTION_TYPE.AFTER_SCHOOL: {
          const existsItemsCount = surveyEditQuestions.items.filter(item => {
            return (
              item.itemTitle &&
              item.afterSchoolTimetables.length > 0 &&
              item.afterSchoolTargets.length > 0 &&
              item.selectionType &&
              item.limit.totalMax > 0
            );
          }).length;
          const emptyItemsCount = surveyEditQuestions.items.filter(item => {
            return (
              !item.itemTitle ||
              item.afterSchoolTimetables.length === 0 ||
              item.afterSchoolTargets.length === 0 ||
              !item.selectionType ||
              item.limit.totalMax < 1
            );
          }).length;
          isValidated = !!(surveyEditQuestions.questionTitle && existsItemsCount > 0 && emptyItemsCount === 0);
          break;
        }
        case rootState.constants.QUESTION_TYPE.CONSULTATION: {
          const existsItemsCount = surveyEditQuestions.items.filter(item => !item.isDel).length;
          const consultationSetting = surveyEditQuestions.consultationSetting || {};
          const existsConsultationSetting = !!(
            consultationSetting.dateStart &&
            consultationSetting.dateEnd &&
            consultationSetting.timeStart &&
            consultationSetting.timeEnd &&
            consultationSetting.timeConsultation &&
            consultationSetting.timeRecess !== null &&
            (consultationSetting.isPhone || consultationSetting.isVisit || consultationSetting.isRemote)
          );
          isValidated = !!(surveyEditQuestions.questionTitle && existsConsultationSetting && existsItemsCount > 0);
          break;
        }
      }
      surveyEditQuestions.isValidated = isValidated;
      return isValidated;
    },

    saveChangedSurveyEditQuestions: async ({ state, commit, dispatch }) => {
      return new Promise(async (resolve, reject) => {
        try {
          // 질문 변경사항 저장
          if (state.isChangedSurveyEditQuestions) {
            await dispatch('temporarilySaveSurvey', {});
            commit('setIsChangedSurveyEditQuestions', false);
            resolve(true);
          } else {
            resolve(true);
          }
        } catch (e) {
          reject(e);
        }
      });
    },

    getSurveysConsultationCalendar: async ({ state, rootState }, payload) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveysConsultationCalendar}`,
          params: payload,
        })
        .then(res => {
          if (res.data._embedded && res.data._embedded.calendars) {
            const calendars = res.data._embedded.calendars;
            calendars.sort((a, b) => a.month - b.month);
            state.surveysConsultationCalendar = calendars;
          } else {
            state.surveysConsultationCalendar.splice(0);
          }

          return state.surveysConsultationCalendar;
        })
        .catch(err => {
          rootState.hiClass.alert('getSurveysConsultationCalendar() ' + err);
        });
    },
    sortingSurveyEditQuestionConsultationItems: async ({ dispatch }, payload) => {
      // 학부모 상담 items sortNo 정렬
      const sortObject = {
        array: payload.items,
        sortingTargets: ['itemDate', 'itemTimeStart'],
      };
      await dispatch('arrayInObjectSort', sortObject, { root: true });

      let sortNo = 0;
      payload.items = payload.items.map(item => {
        item.sortNo = ++sortNo;
        return item;
      });
    },

    /****************************
     *
     * 설문 만들기 > LNB 질문 목록
     *
     ****************************/
    getSurveyEditPages: ({ state, commit, rootState }, surveyId) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveysEditPages}`,
          params: { surveyId },
        })
        .then(res => {
          state.surveyEditPages = res.data._embedded && res.data._embedded.editPages ? res.data._embedded.editPages : [];
          // commit('setSurveyEditQuestions', state.surveyEditPages)
        })
        .catch(err => {
          rootState.hiClass.alert('getSurveyEditPages() ' + err);
        });
    },
    addBlankSurveyPages: ({ state, getters, rootState }, payload) => {
      const surveyId = payload.surveyId || null;
      const blankPage = {
        pageId: null,
        surveyId: surveyId,
        pageName: null,
        isCustom: false,
        sortNo: getters.surveyEditPagesTotalCount + 1,
        questions: [
          {
            questionId: null,
            questionType: 'CHOICE',
            questionTitle: null,
            sortNo: 1,
            isValidated: false,
            isMultipleAnswer: false,
          },
        ],
      };
      state.surveyEditPages.push(blankPage);
    },
    addBlankSurveyPagesQuestion: ({ state, getters, rootState }, payload) => {
      const pageId = payload.pageId;
      const blankQuestion = {
        questionId: null,
        questionType: 'CHOICE',
        questionTitle: null,
        sortNo: 1,
        linkPage: null,
        isValidated: false,
        isMultipleAnswer: false,
        isLinkedPage: false,
      };
      const curPage = state.surveyEditPages.find(page => page.pageId === pageId);
      if (curPage) {
        blankQuestion.sortNo = curPage.questions.length + 1;
        curPage.questions.push(blankQuestion);
      } else {
        rootState.hiClass.alert('질문을 추가할 수 없습니다.<br>다시 확인해 주세요.', 'info');
      }
    },
    removeBlankSurveyPage: ({ state, commit }) => {
      const newSurveyPages = state.surveyEditPages.filter(d => d.questions[0].questionId);
      commit('setSurveyEditPages', newSurveyPages);
      return new Promise(resolve => resolve(true));
    },
    removeBlankSurveyPageQuestion: ({ state, commit }) => {
      const newSurveyPages = state.surveyEditPages.map(page => {
        page.questions = page.questions.filter(question => question.questionId);
        return page;
      });
      commit('setSurveyEditPages', newSurveyPages);
      return new Promise(resolve => resolve(true));
    },
    clearSurveyEditPages: ({ commit }) => {
      commit('setSurveyEditPages', []);
    },
    deleteSurveyEditPage: ({ state, commit, rootState }, pageId) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.DELETE,
            url: `${state.apiRequestUrl.surveysEditPages}/${pageId}`,
          })
          .then(res => {
            /**
             * 페이지 삭제 후 페이지 목록 갱신
             */
            const resource = res.data;
            rootState.log.warn(`deleteSurveyEditPage() resource`, resource);
            if (resource._embedded && resource._embedded.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource._embedded.editPages));
            } else {
              commit('setSurveyEditPages', []);
            }
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    deleteSurveyEditPageByPageIds: ({ state, rootState }, pageIds) => {
      return new Promise((resolve, reject) => {
        const requests = [];
        pageIds.forEach(pageId => {
          const request = rootState.axios({
            method: REQUEST_METHOD.DELETE,
            url: `${state.apiRequestUrl.surveysEditPages}/${pageId}`,
          });
          requests.push(request);
        });

        Promise.all(requests)
          .then(() => {
            rootState.log.debug(`deleteSurveyEditPageByPageIds()`);
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    renameSurveyEditPage: ({ state, rootState }, payload) => {
      const pageId = payload.pageId;
      const pageName = payload.pageName || null;

      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PATCH,
            url: `${state.apiRequestUrl.surveysEditPages}/${pageId}/rename`,
            data: {
              pageName: pageName,
            },
          })
          .then(() => {
            rootState.log.debug(`renameSurveyEditPage()`);
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    sortingSurveyEditPage: ({ state, commit, rootState }, payload) => {
      state.surveyEditPages.forEach((item, index) => {
        item.sortNo = ++index;
      });
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PUT,
            url: `${state.apiRequestUrl.surveysEditPagesSorting}`,
            params: payload,
          })
          .then(res => {
            /**
             * 페이지 정렬 후 페이지 목록 갱신
             */
            const resource = res.data;
            rootState.log.warn(`sortingSurveyEditPage() resource`, resource);
            if (resource._embedded && resource._embedded.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource._embedded.editPages));
            }
            resolve(true);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    mergeSurveyEditPage: ({ state, commit, rootState }, pageIds) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PUT,
            url: `${state.apiRequestUrl.surveysEditPagesMerge}`,
            data: {
              pageIds: pageIds,
            },
          })
          .then(res => {
            /**
             * 페이지 merge 후 페이지 목록 갱신
             */
            const resource = res.data;
            rootState.log.warn(`mergeSurveyEditPage() resource`, resource);
            if (resource._embedded && resource._embedded.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource._embedded.editPages));
            }
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    separateSurveyEditPage: ({ state, commit, rootState }, pageId) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PUT,
            url: `${state.apiRequestUrl.surveysEditPages}/${pageId}/separate`,
          })
          .then(res => {
            /**
             * 페이지 해제 후 페이지 목록 갱신
             */
            const resource = res.data;
            rootState.log.warn(`separateSurveyEditPage() resource`, resource);
            if (resource._embedded && resource._embedded.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource._embedded.editPages));
            }
            resolve(true);
          })
          .catch(err => {
            rootState.log.warn(err);
            reject(false);
          });
      });
    },
    sortingSurveyEditQuestion: ({ state, commit, rootState }, payload) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PUT,
            url: `${state.apiRequestUrl.surveysEditQuestionsSorting}`,
            params: payload,
          })
          .then(res => {
            /**
             * 페이지 정렬 후 페이지 목록 갱신
             */
            const resource = res.data;
            rootState.log.warn(`sortingSurveyEditQuestion() resource`, resource);
            if (resource._embedded && resource._embedded.editPages) {
              commit('setSurveyEditPages', _.cloneDeep(resource._embedded.editPages));
            }
            resolve(true);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    openSurveyCreateLnbPageRenameModal: ({ commit }, payload) => {
      payload.isOpen = true;
      commit('setSurveyCreateLnbPageRenameModal', payload);
    },
    closeSurveyCreateLnbPageRenameModal: ({ commit }) => {
      commit('setSurveyCreateLnbPageRenameModal', {
        isOpen: false,
        pageId: null,
        pageName: null,
        submitCallback: null,
      });
    },

    /****************************
     *
     * 설문 만들기 > 설문 질문 RNB
     *
     ****************************/
    goPrevSurveyQuestion: async ({ getters, dispatch }) => {
      try {
        const questionId = getters.surveyEditPagesQuestions[getters.curSurveyQuestionIndex - 1].questionId;
        const result = await dispatch('temporarilySaveSurvey', {});
        if (result) dispatch('getSurveyEditQuestions', questionId);
        // eslint-disable-next-line
      } catch (e) {}
    },
    goNextSurveyQuestion: async ({ getters, dispatch }) => {
      try {
        const questionId = getters.surveyEditPagesQuestions[getters.curSurveyQuestionIndex + 1].questionId;
        const result = await dispatch('temporarilySaveSurvey', {});
        if (result) dispatch('getSurveyEditQuestions', questionId);
        // eslint-disable-next-line
      } catch (e) {}
    },
    changeSurveyCreateQuestionType: async ({ state, commit, dispatch, rootState }, payload) => {
      const questionType = payload.questionType;

      // 일부 데이터만 초기화
      const resetData = {
        questionType: questionType,

        isValidated: false,
        isRequired: false,
        isAddedAnswer: false,
        isLinkedPage: false,
        isUsedHalfStar: false,
        isAllowedOverlapTime: true,
        isMultipleAnswer: false,
        isApply: false,

        answerLimit: null,
        linkPageId: null,
        beforePageId: null,
        beforeQuestionId: null,

        consultationSetting: null,

        items: [],
      };

      switch (questionType) {
        case rootState.constants.QUESTION_TYPE.CHOICE: {
          resetData.answerLimit = null;

          // 객관식 아이템 개수 초기값 4개
          for (let i = 0; i < 4; i++) {
            const itemSet = await dispatch('initSurveyEditQuestionsItem', questionType);
            if (itemSet) {
              resetData.items.push(itemSet);
            }
          }
          break;
        }
        default: {
          const itemSet = await dispatch('initSurveyEditQuestionsItem', questionType);
          if (itemSet) {
            resetData.items.push(itemSet);
          }
        }
      }

      if (resetData.questionType) {
        commit('setSurveyQuestionAttr', resetData);

        // lnbPage questionType 변경
        const pageId = state.surveyEditQuestions.pageId;
        const questionId = state.surveyEditQuestions.questionId;
        const curPage = state.surveyEditPages.find(page => page.pageId === pageId);
        if (curPage) {
          if (curPage.linkPage) {
            curPage.linkPage.pageId = null;
          }
          const curQuestion = curPage.questions.find(question => question.questionId === questionId);
          if (curQuestion) {
            curQuestion.isValidated = await dispatch('getIsValidatedByStateSurveyEditQuestions');
            curQuestion.questionType = resetData.questionType;
          }
        }
      }
    },

    /****************************
     *
     * 설문 응답 > 상세정보조회
     *
     ****************************/
    initSurveyResponse: ({ commit }) => {
      commit('setSurveyResponseBodyName', 'INTRO');
    },
    clearSurveys: ({ commit }) => {
      commit('setSurveys', {});
    },
    clearCurSurveyAnswer: ({ commit }) => {
      commit('setCurSurveyAnswer', {});
      commit('setSimulationSurveyAnswer', {
        answerStatus: 'TEMPORARY',
        answeredTimestamp: null,
        respondentId: null,
        surveyId: null,
      });
    },
    clearSurveysRespondentInfo: ({ commit }) => {
      commit('setSurveysRespondentInfo', {});
    },
    clearIsReject: ({ commit }) => {
      commit('setIsReject', false);
    },
    getSurveys: ({ state, rootState, commit, dispatch }, payload) => {
      return new Promise((resolve, reject) => {
        const params = {};
        // 편집 데이터 요청
        const isEditData = router.currentRoute.query.isEditData === 'true';
        if (isEditData) {
          params.isEditData = isEditData;
        }
        rootState
          .axios({
            method: REQUEST_METHOD.GET,
            url: `${state.apiRequestUrl.surveys}/${payload.surveyId}`,
            params: params,
          })
          .then(res => {
            commit('setSurveys', res.data);
            resolve(res.data);
          })
          .catch(err => {
            rootState.hiClass.alert('설문대상자가 아닙니다.').then(() => {
              dispatch('goRouteSurveyList');
            });
            console.error('store.survey getSurveys error => ', err);
          });
      });
    },
    checkIsSimulation: ({ state, commit }, isPreview) => {
      const isTarget = state.surveys.isTarget;
      const classMemberRole = state.surveys.clazz.memberRole;
      const isClassManager = classMemberRole === 'MANAGER' || classMemberRole === 'OWNER';
      // 설문 대상이 아닌 클래스 관리자 or 미리보기로 진입시 시뮬레이션
      if ((!isTarget && isClassManager) || isPreview) {
        commit('setIsSimulation', true);
      }
    },
    initIsSimulation: ({ commit }) => {
      commit('setIsSimulation', false);
    },
    clickSurveyStartBtn: async ({ state, rootState, commit, dispatch }, isUrl = false) => {
      if (isUrl) commit('setIsSimulation', false);
      const answerStatus = isUrl ? 'NONE' : state.surveys.answerStatus;
      const isSimulation = state.isSimulation;

      if (isSimulation) {
        commit('setSurveyResponseBodyName', 'FORM');
        return false;
      }

      switch (answerStatus) {
        case 'NONE':
        case 'WAIT':
          commit('setSurveyResponseBodyName', 'FORM');
          break;
        case 'TEMPORARY': {
          try {
            // 응답자 기본 정보 세팅
            await dispatch('getSurveysRespondentInfo');

            // 설문 응답 결과 조회 후 세팅
            await dispatch('getSurveyAnswer').then(res => {
              if (!res) {
                rootState.hiClass
                  .alert('설문을 진행할 수 없습니다. <br>다시 시작해주세요.')
                  .then(() => (state.surveys.isUsedUrl ? router.push('/', () => {}) : dispatch('goRouteSurveyList')));
              } else {
                // 응답 페이지로 이동
                commit('setSurveyResponseBodyName', 'ANSWER');
              }
            });
          } catch (e) {
            const msgMap = {
              411: '설문을 진행할 수 없습니다. <br>다시 시작해주세요.',
              418: '선착순 마감되었습니다. <br>다시 확인해주세요.'
            };
            const msg = msgMap[e];
            if (msg) {
              rootState.hiClass
                .alert(msg)
                .then(() => (state.surveys.isUsedUrl ? router.push('/', () => {}) : dispatch('goRouteSurveyList')));
            } else {
              rootState.hiClass.alert(e);
            }
          }
          break;
        }
        default:
          commit('setSurveyResponseBodyName', 'FORM');
      }
    },
    clickSurveyRejectBtn: ({ commit }) => {
      // reject 여부 store 에 저장
      commit('setIsReject', true);
      // 응답자 정보 화면 노출
      commit('setSurveyResponseBodyName', 'FORM');
    },
    initUrlSurveysRespondentInfo: ({ state, commit }) => {
      let respondentInfo = {
        classGrade: 'E1',
        answerStatus: state.surveys.answerStatus,
        responseType: state.surveys.isAnonymous ? 'ANONYMOUS' : 'EXTERNAL',
        classBan: '',
        respondentPhone: null,
        schoolType: 'ELEMENTARY',
        respondentName: '',
        respondentPassword: null,
        userType: 'NONMEMBER',
        classNumber: null,
        subjectName: '',
      };

      commit('setSurveysRespondentInfo', respondentInfo);
    },
    getSurveysRespondentInfo: ({ state, rootState, commit, dispatch }, payload = false) => {
      const surveyId = state.surveys.surveyId;
      let params = {};
      if (payload) {
        //url 설문
        params.respondentId = state.respondentId;
      } else {
        params.userId = rootState.user.currentId;
        if (state.respondentId) {
          params.respondentId = state.respondentId;
        }
      }
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.GET,
            url: `${state.apiRequestUrl.surveyAnswer}/${surveyId}/info`,
            params: params,
          })
          .then(res => {
            if (!window.location.href.includes('sru')) {
              res.data.answerStatus = state.surveys.answerStatus;
            }
            res.data.responseType = state.surveys.isAnonymous ? 'ANONYMOUS' : '';
            if (!res.data.responseType) res.data.responseType = state.surveys.userType !== 'NONMEMBER' ? 'MEMBER' : 'EXTERNAL';

            commit('setSurveysRespondentInfo', res.data);
            resolve(res.data);
          })
          .catch(err => {
            const memberRole = state.surveys.clazz ? state.surveys.clazz.memberRole : '';
            const isManager = memberRole === 'MANAGER' || memberRole === 'OWNER';
            // 편집 데이터 요청
            const isEditData = router.currentRoute.query.isEditData === 'true';

            // 관리자 시뮬레이션 위한 정보입력
            const respondentInfo = {
              schoolName: state.surveys.school ? state.surveys.school.schoolName : '',
              classGrade: state.surveys.clazz ? state.surveys.clazz.classGrade : '',
              classBan: state.surveys.clazz ? state.surveys.clazz.classBan : '',
              respondentName: rootState.user.userName,
              subjectName: '',
              memberRole,
            };

            if (isManager || isEditData) {
              commit('setSurveysRespondentInfo', respondentInfo);
            }
            if (isEditData) {
              resolve(respondentInfo);
              return false;
            }

            const errorMessage = {
              404: '유효하지 않는 설문입니다.',
              406: '설문 대상자가 아닙니다.',
              428: '종료된 설문입니다.',
            };
            switch (err.response.status) {
              case 404:
                rootState.hiClass.alert(errorMessage[err.response.status]).then(() => dispatch('goRouteSurveyList'));
                reject(err.response.status);
                break;
              case 406:
                if (!isManager) {
                  if (router.currentRoute.path.includes('/survey-response') || router.currentRoute.path.includes('/sru') || state.isReject) {
                    resolve(err.response.status);
                    return;
                  } else {
                    rootState.hiClass.alert('설문 대상자가 아닙니다.');
                    reject(err.response.status);
                  }
                } else {
                  if (state.isSimulation) {
                    resolve(respondentInfo);
                  } else if (state.isReject) {
                    resolve(err.response.status);
                  }
                }
                break;
              case 428:
                if (!isManager) {
                  rootState.hiClass.alert('종료된 설문입니다.').then(() => {
                    if (router.currentRoute.path.includes('/sru')) {
                      //비회원 설문시
                      location.href = 'https://www.hiclass.net/';
                    }
                  });
                  reject(err.response.status);
                }
                resolve(err.response.status);
                break;
              case 411:
                reject(err.response.status);
                break;
              case 418:
                rootState.hiClass.alert('선착순 마감되었습니다.\n다시 확인해 주세요.').then(() => document.location.reload());
                reject(err.response.status);
                break;
              default:
                reject(err);
                break;
            }
          });
      });
    },
    updateSchoolTypeAndClassGrade: ({ state, commit }, payload) => {
      commit('setSurveysRespondentInfoSchoolTypeAndClassGrade', payload);
    },
    updateSurveyRespondentInfo: ({ state, rootState, commit }) => {
      // 설문유형에 따라 request field 다름
      const responseType = state.surveysRespondentInfo.responseType;
      const surveyRespondentInfo = {
        respondentId: '',
        answerStatus: '',
        userType: '',
        responseType: '',
      };
      switch (responseType) {
        case 'MEMBER':
          {
            surveyRespondentInfo.respondentName = '';
            surveyRespondentInfo.subjectName = '';
            surveyRespondentInfo.userId = rootState.user.currentId;
          }
          break;
        case 'EXTERNAL':
          {
            surveyRespondentInfo.respondentName = '';
            surveyRespondentInfo.respondentPhone = null;
            surveyRespondentInfo.respondentPassword = null;
            surveyRespondentInfo.subjectName = '';
            surveyRespondentInfo.schoolType = '';
            surveyRespondentInfo.classGrade = '';
            surveyRespondentInfo.classBan = '';
            surveyRespondentInfo.classNumber = '';
          }
          break;
      }

      // state의 설문응답자 정보를 surveyRespondentInfo 객체에  set
      Object.entries(state.surveysRespondentInfo).forEach(([key, value]) => {
        if (Object.keys(surveyRespondentInfo).includes(key)) {
          surveyRespondentInfo[key] = value;
        }
      });

      // 거절여부, 임시저장 값 set
      if (state.isReject) {
        surveyRespondentInfo.answerStatus = 'REJECT';
      } else {
        if (state.surveys.answerStatus === 'NONE' || state.surveys.answerStatus === 'WAIT') {
          surveyRespondentInfo.answerStatus = 'TEMPORARY';
        }

        // 다른 자녀 설문 응답시 isAnotherSurvey 값 true로 변경
        if (state.isAnotherSurvey) {
          surveyRespondentInfo.answerStatus = 'TEMPORARY';
          // 변경된 값 초기화
          commit('setIsAnotherSurvey', false);
        }
      }

      if (state.surveys.isAnonymous) {
        surveyRespondentInfo.userId = state.surveys.isTarget ? rootState.user.currentId : null;
        surveyRespondentInfo.respondentId = state.surveysRespondentInfo.respondentId
          ? state.surveysRespondentInfo.respondentId
          : router.currentRoute.query.respondentId
          ? router.currentRoute.query.respondentId
          : state.respondentId;
        surveyRespondentInfo.userType = rootState.user.userType ? rootState.user.userType : 'NONMEMBER';
        surveyRespondentInfo.responseType = 'ANONYMOUS';
      }
      if (
        (state.surveysRespondentInfo.classGrade === 'NONE' || state.surveysRespondentInfo.classGrade === 'ANY') &&
        state.surveysRespondentInfo.schoolType !== 'KINDERGARTEN'
      ) {
        surveyRespondentInfo.classGrade = state.surveysRespondentInfo.classGradeCode;
      }
      return rootState
        .axios({
          method: REQUEST_METHOD.PATCH,
          url: `${state.apiRequestUrl.surveyAnswer}/${state.surveys.surveyId}/info`,
          data: surveyRespondentInfo,
        })
        .then(res => {
          // url 설문일경우 입력한 정보가 같으면 저장되어있는 respondentId를 내려줍니다.
          // rootState.hiClass.alert(`응답자 정보 update response: respondentId => ${res.data.respondentId}`)
          commit('setRespondentId', res.data.respondentId);
          return res.status;
        })
        .catch(err => {
          return err.response.status;
        });
    },
    changeSurveyResponseBody: ({ commit }, bodyName) => {
      commit('setSurveyResponseBodyName', bodyName);
    },
    goRouteSurveyList: ({ state }) => {
      if (router.currentRoute.query.newWindow) {
        window.close();
        return false;
      }
      const classId = state.surveys.clazz && state.surveys.clazz.classId ? state.surveys.clazz.classId : null;
      const location = classId ? `/main/clazzes/${classId}/survey` : '/main';
      router.push(location, () => {});
    },
    /**
     * 설문 응답 결과 조회
     * answers: [{ answerId: ${uuid} ... }]
     *
     * @param state
     * @param rootState
     * @param commit
     * @param payload
     * @returns {Promise<unknown>}
     */
    getSurveyAnswer: ({ state, rootState, commit, dispatch }) => {
      const surveyId = state.surveys.surveyId;
      const params = {
        respondentId: state.respondentId
          ? state.respondentId
          : router.currentRoute.query.respondentId
          ? router.currentRoute.query.respondentId
          : state.surveysRespondentInfo.respondentId,
      };
      commit('setRespondentId', '');
      if (state.isSimulation) return;
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.GET,
            url: `${state.apiRequestUrl.surveyAnswer}/${surveyId}`,
            params: params,
          })
          .then(res => {
            if (res.data.answerStatus === 'WAIT') {
              resolve(false);
            } else {
              commit('setCurSurveyAnswer', res.data);
              state.respondentId = res.data.respondentId;
              state.surveysRespondentInfo.respondentId = res.data.respondentId;
              resolve(true);
            }
          })
          .catch(e => {
            if (e.response.status === 400) {
              rootState.hiClass.alert('설문 대상자가 아닙니다.', 'warning').then(() => dispatch('goRouteSurveyList'));
            } else if (e.response.status === 428 || e.response.status === 404) {
              rootState.hiClass.alert('유효하지 않은 설문입니다.', 'warning').then(() => dispatch('goRouteSurveyList'));
            } else {
              reject(e);
            }
          });
      });
    },

    /****************************
     *
     * 설문 전체 내용 조회
     *
     ****************************/
    getSurveyContents: ({ state, commit, rootState, dispatch }, payload) => {
      const params = {};
      if (payload) {
        Object.entries(payload).forEach(([key, value]) => {
          params[key] = value;
        });
      }
      if (!params.surveyId) {
        params.surveyId = state.surveys.surveyId;
      }
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.GET,
            url: `${state.apiRequestUrl.surveyContents}`,
            params: params,
          })
          .then(res => {
            if ((res.data.surveyStatus === 'END' && !state.isSimulation) && res.data.surveyType !== 'AFTER_SCHOOL' && res.data.surveyType !== 'CONSULTATION') {
              rootState.hiClass.alert('유효하지 않은 설문입니다.', 'warning').then(() => dispatch('goRouteSurveyList'));
            } else {
              commit('setSurveyContents', res.data);
              resolve(res.data);
            }
          })
          .catch(err => {
            if (err.response.status === 404) {
              rootState.hiClass.alert('유효하지 않은 설문입니다.', 'warning').then(() => dispatch('goRouteSurveyList'));
            } else {
              rootState.hiClass.alert(err);
              reject(false);
            }
          });
      });
    },
    initSurveyContents: ({ commit }) => {
      commit('setSurveyContents', {});
    },

    /****************************
     *
     * 설문 응답 > 응답 중
     *
     ****************************/
    clearSurveyAnswer: ({ commit }) => {
      commit('setSurveyAnswerPageId', null);
      commit('setCurSurveyAnswer', {});
      commit('setCurSurveyAnswerPage', {});
      commit('setSurveyContents', {});
    },
    goPrevAnswerPage: ({ getters, commit }) => {
      commit('setSurveyAnswerPageId', getters.prevAnswerPageId);
    },
    checkValidation: async ({ getters, dispatch, rootState, commit, state }, payload) => {
      const curQuestions = getters.curQuestionsByPageId;
      //서명이 있을 경우 서명이 전부 save되고 유효성체크
      const signLength = curQuestions.filter(curQuestion => {
        return curQuestion.questionType === 'SIGN';
      }).length;

      const validation = () => {
        let goNext = true;
        // 검증 무시하고 강제 저장
        if (payload.isValidateIgnore) {
          if (payload.resetPageId) {
            dispatch('deleteSurveyAnswerPage', payload);
          } else if (payload.linkPageId && payload.type !== 'submit') {
            dispatch('goNextAnswerPage', { type: 'pageId', pageId: payload.linkPageId });
          } else {
            dispatch('goNextAnswerPage', payload);
          }
          return false;
        }
        for (let i = 0; i < curQuestions.length; i++) {
          if (curQuestions[i].questionType === 'SUBJECTIVE' && curQuestions[i].isRequired && !curQuestions[i].answerText) {
            rootState.hiClass.alert('필수 응답 질문을 확인해주세요.');
            goNext = false;
            return;
          } else if (curQuestions[i].questionType === 'SIGN' && curQuestions[i].isRequired) {
            const answerFiles = Array.isArray(curQuestions[i].answerFiles) ? curQuestions[i].answerFiles.filter(file => !file.isDel) : [];
            const emptyAnswerFiles = answerFiles.length === 0;
            if (emptyAnswerFiles && curQuestions[i].isRequired) {
              rootState.hiClass.alert('필수 응답 질문을 확인해주세요.');
              goNext = false;
              return;
            }
          } else if (curQuestions[i].questionType === 'CHOICE') {
            if (curQuestions[i].isRequired && _.isEmpty(curQuestions[i].selected)) {
              rootState.hiClass.alert('필수 응답 질문을 확인해주세요.');
              goNext = false;
              return;
            }
            if (!_.isEmpty(curQuestions[i].selected)) {
              curQuestions[i].selected.forEach(select => {
                if (select.isEtcAnswer && !select.answerText) {
                  rootState.hiClass.alert('기타 내용을 입력해주세요.');
                  goNext = false;
                  return;
                }
              });
            }
          }
        }
        if (goNext) {
          if (payload.resetPageId) {
            dispatch('deleteSurveyAnswerPage', payload);
          } else if (payload.linkPageId && payload.type !== 'submit') {
            dispatch('goNextAnswerPage', { type: 'pageId', pageId: payload.linkPageId });
          } else {
            dispatch('goNextAnswerPage', payload);
          }
        }
      };

      const validationProcess = () => {
        if (signLength > 0) {
          if (signLength === state.signCount) {
            commit('setSignCount', 0);
            validation();
          }
        } else {
          validation();
        }
      };
      // 서명 유형 파일이 문항중있을때 업로드 처리
      if (signLength > 0) {
        curQuestions.forEach((curQuestion, idx) => {
          if (curQuestion.questionType === 'SIGN' && signLength > 0) {
            eventBus.$emit(`survey-response-save-sign-by-question-id|${curQuestion.questionId}`, validationProcess);
          }
        });
      } else {
        validationProcess();
      }
    },
    goNextAnswerPage: async ({ state, getters, commit, dispatch, rootState }, payload) => {
      // TODO: 현재 페이지에서 임시저장된 이전 답변 목록
      // const copiedCurSurveyAnswer = _.cloneDeep(state.curSurveyAnswer)
      // const prevAnswers = copiedCurSurveyAnswer.answers.filter(answer => {
      //   return getters.curQuestionIds.includes(answer.questionId)
      // })
      // 답변된 아이템 리스트
      const answeredItems = [];
      //question.questionType === 'SUBJECTIVE'일때 answerText가 널이면 answerType을 'SKIP'으로 변경
      getters.curQuestionsByPageId.forEach(question => {
        switch (question.questionType) {
          // 주관식 유형
          case 'SUBJECTIVE': {
            const answeredItem = {
              questionType: question.questionType,
              answerId: null,
              questionId: question.questionId,
              answerText: question.answerText,
              itemId: null,
              files: [],
            };
            //answerId item에 추가 answerId는 state.curSurveyAnswer여기서 추출 itemId 동일한것중 제일 마지막걸로 answeredItems에 push
            if (!_.isEmpty(state.curSurveyAnswer.answers)) {
              for (let v = 0; state.curSurveyAnswer.answers.length > v; v++) {
                if (question.questionId === state.curSurveyAnswer.answers[v].questionId) {
                  answeredItem.answerId = state.curSurveyAnswer.answers[v].answerId;
                  answeredItem.linkPageId = state.curSurveyAnswer.answers[v].linkPageId;
                }
              }
            }
            answeredItems.push(answeredItem);
            break;
          }
          // 서명 유형
          case 'SIGN': {
            const answeredItem = {
              questionType: question.questionType,
              answerId: null,
              answerText: null,
              itemId: null,
              questionId: question.questionId,
              files: [],
            };
            if (!_.isEmpty(state.curSurveyAnswer.answers)) {
              const foundAnswer = state.curSurveyAnswer.answers.find(answer => {
                return question.questionId === answer.questionId;
              });
              if (foundAnswer) {
                answeredItem.answerId = foundAnswer.answerId;
              }
            }
            answeredItem.files = question.answerFiles || [];
            answeredItems.push(answeredItem);
            break;
          }
          // 객관식 유형 등
          default: {
            if (question.questionType === 'CHOICE') {
              let answer = {
                answerType: 'SKIP',
                questionType: question.questionType,
                // 응답 ID가 null 인 경우 응답 최초 생성
                answerId: null,
                // TODO: 답변한 질문 ID (2차 개발사항: 한 페이지에서 여러 개의 질문이 노출되며 일괄 응답할 수 있음)
                questionId: question.questionId,
                itemId: null,
                answerText: null, // 객관식 기타 item 또는 주관식 item 인 경우
                linkPageId: null,
              };
              let multiAnswer = [];
              if (!_.isEmpty(question.selected)) {
                question.items.forEach(item => {
                  question.selected.forEach(select => {
                    if (item.itemId === select.itemId) {
                      multiAnswer.push({
                        answerType: 'ANSWER',
                        questionType: question.questionType,
                        answerId: item.answerId ? item.answerId : null,
                        questionId: question.questionId,
                        itemId: select.itemId,
                        answerText: select.answerText,
                        linkPageId: select.linkPageId,
                      });
                    }
                  });
                });
              } else {
                multiAnswer.push(answer);
              }
              if (!_.isEmpty(state.curSurveyAnswer.answers)) {
                for (let v = 0; state.curSurveyAnswer.answers.length > v; v++) {
                  if (question.questionId === state.curSurveyAnswer.answers[v].questionId) {
                    if (!_.isEmpty(multiAnswer)) {
                      multiAnswer.forEach(multi => {
                        if (multi.itemId === state.curSurveyAnswer.answers[v].itemId) {
                          multi.answerId = state.curSurveyAnswer.answers[v].answerId;
                        }
                      });
                    } else {
                      if (answer.itemId === state.curSurveyAnswer.answers[v].itemId) {
                        answer.answerId = state.curSurveyAnswer.answers[v].answerId;
                      }
                    }
                  }
                }
              }
              if (!_.isEmpty(multiAnswer)) {
                multiAnswer.forEach(answer => {
                  answeredItems.push(answer);
                });
              } else {
                answeredItems.push(multiAnswer);
              }
            }
          }
        }
      });
      // TODO: 선택 질문이고 답변이 없는 경우 SKIP 처리
      // TODO: 기존 응답 기본 정보 복사
      let surveyAnswer;
      if (state.isSimulation) {
        surveyAnswer = _.cloneDeep(state.simulationSurveyAnswer);
        //answers가 없을시 생성 시물레이션은 state.simulationSurveyAnswer.answers에 값을 저장함
        if (_.isEmpty(surveyAnswer.answers)) surveyAnswer.answers = [];
      } else {
        surveyAnswer = _.cloneDeep(state.curSurveyAnswer);
        surveyAnswer.answers = [];
      }

      // 현재 응답중인 페이지 ID
      surveyAnswer.pageId = state.surveyAnswerPageId;
      if (payload.type === 'submit') {
        //제출하기 할 때는 추가
        surveyAnswer.answerStatus = 'COMPLETE';
      }
      // TODO: 신규 응답 세트 생성
      if (_.isEmpty(surveyAnswer.answers)) surveyAnswer.answers = [];

      let answer = {
        // 응답 ID가 null 인 경우 응답 최초 생성
        answerId: null,
        surveyId: surveyAnswer.surveyId,
        // TODO: 답변한 질문 ID (2차 개발사항: 한 페이지에서 여러 개의 질문이 노출되며 일괄 응답할 수 있음)
        respondentId: surveyAnswer.respondentId,
        answerType: 'SKIP',
        itemId: null,
        answerText: null,
        waitStatus: null,
        questionId: null,
        editedTimestamp: state.surveyContents.editedTimestamp,
        answeredTimestamp: null, // 응답 상태(answer_status)를 REJECT 이나 COMPLETE 으로 변경한 일시
        files: [], // 응답에 첨부된 파일 (SIGN 이미지 등)
      };

      if (answeredItems.length) {
        answeredItems.forEach(answeredItem => {
          answer = {
            // 응답 ID가 null 인 경우 응답 최초 생성
            answerId: answeredItem.answerId ? answeredItem.answerId : null,
            surveyId: surveyAnswer.surveyId,
            // TODO: 답변한 질문 ID (2차 개발사항: 한 페이지에서 여러 개의 질문이 노출되며 일괄 응답할 수 있음)
            questionId: answeredItem.questionId,
            respondentId: surveyAnswer.respondentId,
            itemId: answeredItem.itemId ? answeredItem.itemId : null,
            answerText: answeredItem.answerText ? answeredItem.answerText : null, // 객관식 기타 item 또는 주관식 item 인 경우
            waitStatus: null, // 2차 개발사항: (선착순일 경우) 선착순 상태 (COMPLETE:신청완료, WAIT:대기, OVER:초과)
            editedTimestamp: state.surveyContents.editedTimestamp,
            answeredTimestamp: null, // 응답 상태(answer_status)를 REJECT 이나 COMPLETE 으로 변경한 일시

            files: answeredItem.files, // 응답에 첨부된 파일 (SIGN 이미지 등)
          };

          // 객관식인 경우 응답데이터에 files 를 포함시키면 안 됨
          if (answeredItem.questionType === 'CHOICE') {
            answer.files = [];
          }

          // 응답 유형 (ANSWER:응답함, SKIP:응답안함), SKIP 으로 응답한 경우 기존 questionId 의 응답은 삭제됨
          // set answer.answerType
          switch (answeredItem.questionType) {
            // 주관식 유형
            case 'SUBJECTIVE': {
              answer.answerType = !answeredItem.answerText ? 'SKIP' : 'ANSWER';
              break;
            }
            // 서명 유형
            case 'SIGN': {
              const existsAnswerFiles = Array.isArray(answeredItem.files) && answeredItem.files.filter(file => !file.isDel).length > 0;
              if (existsAnswerFiles) {
                answer.answerType = 'ANSWER';
              } else {
                answer.answerType = 'SKIP';
              }
              break;
            }
            // 객관식 유형 등
            default: {
              answer.answerType = answeredItem.answerType ? answeredItem.answerType : 'SKIP';
            }
          }
          surveyAnswer['answers'].push(answer);
        });
      } else {
        //응답값이 없는 경우 SKIP처리 필수값인 경우는 버튼에서 유효성체크
        surveyAnswer['answers'].push(answer);
      }
      if (payload.type === 'submit') {
        //제출하기 할 때는 추가
        // doSubmitAnswer
        surveyAnswer.answerStatus = 'COMPLETE';
      }
      try {
        // commit('setCurSurveyAnswer', surveyAnswer)
        if (!state.isSimulation) {
          if (getters.curQuestionsByPageId[0].questionType === 'CONSULTATION') {
            await dispatch('updateServed', surveyAnswer);
          } else if (getters.curQuestionsByPageId[0].questionType !== 'AFTER_SCHOOL') {
            await dispatch('updateSurveyAnswerPage', surveyAnswer);
          }
        } else {
          commit('setSimulationSurveyAnswer', surveyAnswer);
          commit('setCurSurveyAnswer', state.simulationSurveyAnswer);
          commit('setSelectedItemIds', []);
          commit('setRespondentId', '');
        }

        if (payload.type === 'close') {
          dispatch('goRouteSurveyList');
        } else if (payload.type === 'submit') {
          if (state.isSimulation) {
            commit('setIsSimulation', false);
            commit('setSurveyAnswerPageId', null);
            commit('setSurveyResponseBodyName', 'INTRO');
            if (state.appView) commit('setAppView');
          } else {
            dispatch('doSubmitAnswer');
          }
        } else if (payload.type === 'prev') {
          commit('setSurveyAnswerPageId', getters.prevAnswerPageId);
        } else if (payload.type === 'pageId') {
          if (!state.isSimulation) {
            dispatch('getSurveyAnswer');
          }
          commit('setSurveyAnswerPageId', payload.pageId);
        } else {
          commit('setSurveyAnswerPageId', state.linkPageId ? state.linkPageId : getters.nextAnswerPageId);
          commit('setLinkPageId', '');
        }
      } catch (e) {
        const errorFuncs = {
          405: () => {
            rootState.hiClass.alert('삭제되거나 유효하지 않은 설문입니다.', 'warning').then(() => dispatch('goRouteSurveyList'));
          },
          411: () => {
            rootState.hiClass
              .alert('선생님이 응답을 삭제하여 더 이상 진행할 수 없습니다.<br> 새로 설문을 진행해주세요.')
              .then(() => (state.surveys.isUsedUrl ? router.push('/', () => {}) : dispatch('goRouteSurveyList')));
          },
          418: () => {
            rootState.hiClass.alert('선착순 마감되어 신청되지 않았습니다.<br>다시 확인해 주세요.').then(() => document.location.reload());
          },
          default: () => {
            rootState.hiClass.alert(e.message || '응답 임시저장 오류');
          },
        };
        (errorFuncs[e.response.status] || errorFuncs.default)();
      }
    },
    closeAnswerPage: ({ dispatch, state }, payload) => {
      // dispatch('goNextAnswerPage', payload)
      payload.isValidateIgnore = true;
      if (state.afterSchoolStatus || state.consultationStatus) {
        dispatch('goRouteSurveyList');
      } else {
        dispatch('checkValidation', payload);
      }
    },
    goAnswerPageByPageId: ({ getters, commit, dispatch, state }, payload) => {
      // commit('setSurveyAnswerPageId', payload.pageId)
      if (state.afterSchoolStatus || state.consultationStatus) {
        commit('setSurveyAnswerPageId', payload.pageId);
      } else {
        dispatch('goNextAnswerPage', { type: 'pageId', pageId: payload.pageId });
      }
    },
    updateSurveyAnswerPage: ({ state, rootState, commit, dispatch }, payload) => {
      const surveyId = state.surveyContents.surveyId;
      const data = _.cloneDeep(payload);
      // `/surveys/contents` API 에서 제공된 editedTimestamp 를 제출 시 그대로 전달
      data.editedTimestamp = state.surveyContents.editedTimestamp;

      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PATCH,
            url: `${state.apiRequestUrl.surveyAnswer}/${surveyId}/page`,
            data: data,
          })
          .then(() => {
            // 응답 전체 목록 갱신
            dispatch('getSurveyAnswer');
            // 이전 페이지에서 선택한 선택지 삭제
            commit('setSelectedItemIds', []);
            resolve(true);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    doSubmitAnswer: ({ commit }) => {
      commit('setSurveyAnswerPageId', null);
      commit('setSurveyResponseBodyName', 'COMPLETE');
    },
    //설문 응답 완료후 응답자 목록
    getRespondentList: ({ state, rootState }, payload) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.GET,
            url: `${state.apiRequestUrl.surveyAnswer}/${payload.surveyId}/respondent`,
            params: payload.isEnteringBySurveyUrl ? { respondentId: payload.respondentId } : { userId: rootState.user.currentId },
          })
          .then(res => {
            if (res.data._embedded) {
              resolve(res.data._embedded.respondents);
            } else {
              resolve([]);
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //설문 응답 삭제
    deleteSurveyAnswer: ({ state, rootState, commit, dispatch }) => {
      const surveyId = state.surveyContents.surveyId;
      const respondentId = state.surveysRespondentInfo.respondentId
        ? state.surveysRespondentInfo.respondentId
        : state.respondentId
        ? state.respondentId
        : router.currentRoute.query.respondentId;
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.DELETE,
            url: `${state.apiRequestUrl.surveyAnswer}/${surveyId}`,
            params: { respondentId: respondentId },
          })
          .then(res => {
            // 응답 전체 목록 갱신
            dispatch('getSurveyAnswer');
            // 이전 페이지에서 선택한 선택지 삭제
            commit('setSelectedItemIds', []);
            resolve('delete');
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //설문 응답 페이지삭제
    deleteSurveyAnswerPage: ({ state, rootState, dispatch }, payload) => {
      const surveyId = state.surveyContents.surveyId;
      const respondentId = state.surveysRespondentInfo.respondentId
        ? state.surveysRespondentInfo.respondentId
        : state.respondentId
        ? state.respondentId
        : router.currentRoute.query.respondentId;
      if (!state.isSimulation) {
        return new Promise((resolve, reject) => {
          rootState
            .axios({
              method: REQUEST_METHOD.DELETE,
              url: `${state.apiRequestUrl.surveyAnswer}/${surveyId}/page`,
              params: {
                pageId: payload.resetPageId,
                respondentId,
              },
            })
            .then(res => {
              // 응답 전체 목록 갱신
              dispatch('goNextAnswerPage', { type: 'pageId', pageId: payload.linkPageId });
              resolve('delete');
            })
            .catch(err => {
              reject(err);
            });
        });
      } else {
        return new Promise((resolve, reject) => {
          //박종철
          state.simulationSurveyAnswer = {};
          dispatch('goNextAnswerPage', { type: 'pageId', pageId: payload.linkPageId });
          resolve('delete');
        });
      }
    },

    /****************************
     *
     * 학부모상담신청, 방과후 학습
     *
     ****************************/
    //등록
    updateServed: ({ state, getters, rootState, commit, dispatch }, payload) => {
      const questionType = getters.curQuestionsByPageId[0].questionType;
      // 학부모 상담 신청은 제일 마지막페이지에 단독으로만 들어감
      let data = {
        surveyId: payload.surveyId
          ? payload.surveyId
          : state.surveyContents.surveyId
          ? state.surveyContents.surveyId
          : state.curSurveyAnswer.surveyId,
        respondentId: state.surveysRespondentInfo.respondentId
          ? state.surveysRespondentInfo.respondentId
          : state.respondentId
          ? state.respondentId
          : router.currentRoute.query.respondentId,
        editedTimestamp: state.surveyContents.editedTimestamp,
      };
      if (questionType === 'CONSULTATION') {
        const consultationData = state.surveyContents.pages[state.surveyContents.pages.length - 1].questions[0];
        data.questionId = consultationData.questionId;
        data.servedType = 'CONSULTATION';
        if (_.isEmpty(consultationData.consultation.select) && !_.isEmpty(state.curSurveyAnswer.answers)) {
          state.curSurveyAnswer.answers.forEach(answer => {
            if (answer.questionId === consultationData.questionId) {
              data.itemId = answer.itemId;
              data.consultType = answer.consultType;
            }
          });
        } else {
          data.itemId = consultationData.consultation.select.itemId;
          data.consultType = consultationData.consultation.select.type;
        }
        if (!data.itemId) {
          rootState.hiClass.alert('상담 날짜 및 시간을 확인해주세요.');
          return;
        }
        if (!data.consultType) {
          rootState.hiClass.alert('상담유형을 선택해주세요.');
          return;
        }
      }
      if (payload.type === 'AFTER_SCHOOL') {
        data.itemId = payload.itemId;
        data.questionId = payload.questionId;
        data.servedType = payload.type;
        data.waitStatus = payload.submitType;
      }
      // `/surveys/contents` API 에서 제공된 editedTimestamp 를 제출 시 그대로 전달
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.PATCH,
            url: `${state.apiRequestUrl.surveyAnswer}/${data.surveyId}/served`,
            data: data,
          })
          .then(res => {
            if (questionType === 'CONSULTATION') {
              // 응답 전체 목록 갱신
              dispatch('getSurveyAnswer');
              commit('setSelectedItemIds', []);
            } else {
              dispatch('getSurveyContents', { surveyId: data.surveyId });
            }
            // 이전 페이지에서 선택한 선택지 삭제
            resolve(res);
          })
          .catch(err => {
            if (err.response.status === 411 || err.response.status === 404) {
              rootState.hiClass
                .alert('선생님이 응답을 삭제하여 더 이상 진행할 수 없습니다.<br> 새로 설문을 진행해주세요.')
                .then(() => (state.surveys.isUsedUrl ? router.push('/', () => {}) : dispatch('goRouteSurveyList')));
            }
            reject(err);
          });
      });
    },
    //설문 응답 삭제
    deleteSurveyAnswerServed: ({ state, rootState, commit, dispatch, getters }, payload) => {
      const surveyId = state.surveyContents.surveyId;
      const questionType = getters.curQuestionsByPageId[0].questionType;
      // 학부모 상담 신청은 제일 마지막페이지에 단독으로만 들어감
      const consultationData = state.surveyContents.pages[state.surveyContents.pages.length - 1].questions[0];
      let data = {
        surveyId: payload.surveyId ? payload.surveyId : surveyId,
        respondentId: state.surveysRespondentInfo.respondentId
          ? state.surveysRespondentInfo.respondentId
          : state.respondentId
          ? state.respondentId
          : router.currentRoute.query.respondentId,
        editedTimestamp: state.surveyContents.editedTimestamp,
      };

      if (questionType === 'CONSULTATION') {
        data.itemId = consultationData.consultation.select.date.itemId;
        data.questionId = consultationData.questionId;
        data.servedType = 'CONSULTATION';
        data.consultType = consultationData.consultation.select.type;
      }

      if (payload.type === 'AFTER_SCHOOL') {
        data.itemId = payload.itemId;
        data.questionId = payload.questionId;
        data.servedType = payload.type;
        data.waitStatus = payload.submitType;
      }
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.DELETE,
            url: `${state.apiRequestUrl.surveyAnswer}/${surveyId}/served`,
            params: data,
          })
          .then(res => {
            if (questionType === 'CONSULTATION') {
              // 응답 전체 목록 갱신
              dispatch('getSurveyAnswer');
              // 이전 페이지에서 선택한 선택지 삭제
              commit('setSelectedItemIds', []);
            }
            resolve(res);
          })
          .catch(err => {
            if (err.response.status === 411) {
              rootState.hiClass
                .alert('선생님이 응답을 삭제하여 더 이상 진행할 수 없습니다.<br> 새로 설문을 진행해주세요.')
                .then(() => dispatch('goRouteSurveyList'));
            }
            reject(err);
          });
      });
    },
    /****************************
     *
     * 설문 응답 > 학부모 상담, 방과후학습
     *
     ****************************/

    //학부모 상담 신청내역, 방과후학습신청
    getCompleteAnswersList: ({ state, rootState, dispatch }, param) => {
      return new Promise((resolve, reject) => {
        rootState
          .axios({
            method: REQUEST_METHOD.POST,
            url: `${state.apiRequestUrl.surveys}/respondents/${param.respondentId}/${param.questionType}`,
            params: { respondentId: param.respondentId },
          })
          .then(res => {
            resolve(res.data);
          })
          .catch(err => {
            if (err.response.status === 411) {
              rootState.hiClass
                .alert('선생님이 응답을 삭제하여 더 이상 진행할 수 없습니다.<br> 새로 설문을 진행해주세요.')
                .then(() => (state.surveys.isUsedUrl ? router.push('/', () => {}) : dispatch('goRouteSurveyList')));
            }
            reject(err);
          });
      });
    },

    /****************************
     *
     * 설문 통계 > 공통
     *
     ****************************/
    clearSurveyReport: ({ commit }) => {
      commit('setSurveyReport', {
        curSurveyReportInfo: {},
        curSurveyId: '',
        currentTab: 'STATISTICS',
        statistics: {
          isReplyPopupOpen: false,
          curStatisticsItems: [],
          replyPopup: {
            curQuestion: {},
            curQuestionId: '',
            curQuestionItemList: [],
            selectedItem: {},
            selectedItemId: '',
            selectedItemType: '',
            answerList: [],
          },
          consultationAnswers: [],
          consultationDateList: [],
          consultationQuestionId: '',
          activeTagIds: []
        },
        answerData: {},
        respondent: {
          curSurveyRespondentList: [],
          filteredSurveyRespondentList: [],
          curSurveyContentsPages: [],
          curSurveySelectedRespondent: {},
          curSurveySelectedRespondentAnswer: {},
          initAnswerModalIsOpen: false, // 응답초기화 모달
          initAnswerRespondent: '', // 응답초기화할 응답자 id
          isInitAnswerDone: false, // 응답초기화 끝났는지
          historyCount: -1,
        },
      });
    },
    updateSurveyReport: ({ state, rootState }, payload) => {
      return rootState.axios({
        method: REQUEST_METHOD.PATCH,
        url: `${state.apiRequestUrl.surveyReport}/${payload.surveyId}`,
      });
    },
    getCurSurveyReportInfo: ({ commit, state, rootState }, payload) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveyReport}/${payload.surveyId}/info`,
        })
        .then(res => {
          commit('setCurSurveyId', payload.surveyId);
          commit('setCurSurveyReportInfo', res.data);
          return res;
        })
        .catch(err => {
          if (err.response.status === 404) {
            rootState.hiClass.alert('삭제된 설문입니다.').then(res => {
              router.go(-1);
            });
          }
        });
    },
    checkSurveyIsDel: ({ state, rootState }, surveyId) => {
      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `${state.apiRequestUrl.surveys}/${surveyId}`,
      });
    },

    /****************************
     *
     * 설문 통계 > 통계탭
     *
     ****************************/
    getSurveyReportStatisticsItems: ({ commit, state, rootState }, payload) => {
      rootState
        .axios({
          method: REQUEST_METHOD.POST,
          url: `${state.apiRequestUrl.surveyReport}/${payload.surveyId}/stat`,
          data: {
            tagIds: state.surveyReport.statistics.activeTagIds
          }
        })
        .then(res => {
          commit('setSurveyReportStatisticsItems', res.data);
        })
        .catch(err => {
          if (err.response.status === 404) {
            rootState.hiClass.alert('삭제된 설문입니다.').then(res => {
              router.go(-1);
            });
          }
        });
    },
    clearStatistics: ({ commit }) => {
      commit('setStatistics', {
        isReplyPopupOpen: false,
        curStatisticsItems: [],
        replyPopup: {
          curQuestion: {},
          curQuestionId: '',
          curQuestionItemList: [],
          selectedItem: {},
          selectedItemId: '',
          selectedItemType: '',
          answerList: [],
        },
        consultationAnswers: [],
        consultationDateList: [],
        consultationQuestionId: '',
        activeTagIds: []
      });
    },
    clearReplyPopup: ({ commit }) => {
      commit('setReplyPopup', {
        curQuestion: {},
        curQuestionId: '',
        curQuestionItemList: [],
        selectedItem: {},
        selectedItemId: '',
        selectedItemType: '',
        answerList: [],
      });
    },
    initAnswersPopupInfo: ({ commit }, question) => {
      commit('setReplyPopupCurQuestion', question);
      commit('setReplyPopupCurQuestionId', question.questionId);
      commit('setReplyPopupSelectedItemType', question.questionType);
      commit('setReplyPopupCurQuestionItemList', question.itemList);
    },
    setAnswersPopupSelectedItem: ({ commit }, questionItem) => {
      commit('setReplyPopupSelectedItem', questionItem);
      commit('setReplyPopupSelectedItemId', questionItem.itemId);
    },
    getAnswersPopupSelectedItem: ({ rootState, state, dispatch }, payload) => {
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveyReport}/question/${payload.questionId}/popup`,
        })
        .then(res => {
          const question = res.data;
          const questionItem = res.data.itemList.find(item => item.itemId === payload.itemId);

          dispatch('initAnswersPopupInfo', question);
          dispatch('setAnswersPopupSelectedItem', questionItem);
          return questionItem;
        })
        .catch(err => {
          rootState.log.warn(err);
        });
    },
    getRespondentAnswers: ({ state, rootState }, payload) => {
      if (rootState.infiniteScroll.isBusy) {
        return false;
      }

      if (!rootState.infiniteScroll.isBusy && !rootState.infiniteScroll.isListEnd) {
        rootState.infiniteScroll.isBusy = true;

        const surveyId = state.surveyReport.curSurveyId;
        const selectedItemId = state.surveyReport.statistics.replyPopup.selectedItem.itemId || payload.itemId;

        const requestBody = {
          page: rootState.infiniteScroll.page,
          size: rootState.infiniteScroll.size,
          waitStatus: null,
        };

        if (payload !== undefined && payload.hasOwnProperty('waitStatus')) {
          requestBody.waitStatus = payload.waitStatus;
        }

        return rootState
          .axios({
            method: REQUEST_METHOD.POST,
            url: `${state.apiRequestUrl.surveyReport}/${surveyId}/answers/${selectedItemId}/popup`,
            data: requestBody,
          })
          .then(res => {
            if (res.data._embedded) {
              const answers = res.data._embedded.surveyReportPopUpAnswerDtoes;
              const answerCount = res.data.page.totalElements;

              if (rootState.infiniteScroll.page === 0) {
                state.surveyReport.statistics.replyPopup.answerList = answers;
                state.surveyReport.statistics.replyPopup.answerCount = answerCount;
              } else {
                state.surveyReport.statistics.replyPopup.answerList.push(...answers);
              }

              const totalPages = res.data.page.totalPages;
              const pageNumber = res.data.page.number;

              if (totalPages > pageNumber + 1) {
                rootState.infiniteScroll.page++;
                rootState.infiniteScroll.isListEnd = false;
              } else {
                rootState.infiniteScroll.page = 0;
                rootState.infiniteScroll.isListEnd = true;
              }

              return res.status;
            } else {
              state.surveyReport.statistics.replyPopup.answerList = [];
              return 204;
            }
          })
          .catch(err => {
            rootState.log.warn(err);
          })
          .finally(() => {
            rootState.infiniteScroll.isBusy = false;
          });
      }
    },
    getRespondentAnswersExcel: ({ state, rootState }, payload) => {
      const surveyId = state.surveyReport.curSurveyId;
      const selectedItemId = state.surveyReport.statistics.replyPopup.selectedItem.itemId || payload.itemId;

      return rootState.axios({
        method: REQUEST_METHOD.POST,
        url: `${state.apiRequestUrl.surveyReport}/${surveyId}/answers/${selectedItemId}/popup/excel`,
      });
    },
    changeAnswersPopupFlag: ({ commit }, flag) => {
      commit('setAnswersPopupFlag', flag);
    },
    getSurveyReportRespondentExcelList: ({ state, rootState }) => {
      const surveyId = state.surveyReport.curSurveyId;

      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `${state.apiRequestUrl.surveyReport}/respondent/${surveyId}/excel`,
      });
    },
    openAfterSchoolPopup: ({ commit }) => {
      commit('setAfterSchoolPopupFlag', true);
    },
    closeAfterSchoolPopup: ({ commit }) => {
      commit('setAfterSchoolPopupFlag', false);
    },
    cancelAfterSchool: ({ state, rootState }, itemId) => {
      return rootState.axios({
        method: REQUEST_METHOD.PATCH,
        url: `${state.apiRequestUrl.surveys}/items/${itemId}/cancel`,
      });
    },
    sendPushMessageToAfterSchoolApplicant: ({ state, rootState }, payload) => {
      const requestBody = {};
      requestBody.surveyId = state.surveyReport.curSurveyId;
      requestBody.userId = rootState.user.currentId || localStorage.uuid;
      requestBody.userIds = payload.userIds;
      requestBody.message = payload.message;

      return rootState.axios({
        method: REQUEST_METHOD.POST,
        url: `/sendMessages/surveyAfterSchoolToApplicant`,
        data: requestBody,
      });
    },
    getSurveyReportConsultationList: ({ state, rootState }, payload) => {
      const surveyId = state.surveyReport.curSurveyId;
      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `${state.apiRequestUrl.surveyReport}/${surveyId}/consultation/${payload.questionId}?yyyyMm=${payload.curMonth}`,
      });
    },
    getSurveyReportConsultationAnswers: ({ state, rootState, commit, dispatch }, payload) => {
      const surveyId = state.surveyReport.curSurveyId;
      return rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveyReport}/${surveyId}/consultation/${payload.questionId}/${payload.selectedDate}`,
        })
        .then(res => {
          commit('setConsultationAnswers', res.data);
          return res;
        });
    },
    getSurveyReportConsultationExcelData: ({ state, rootState }, payload) => {
      const surveyId = state.surveyReport.curSurveyId;
      return rootState.axios({
        method: REQUEST_METHOD.POST,
        url: `${state.apiRequestUrl.surveyReport}/${surveyId}/consultation/${payload.questionId}/excel`,
      });
    },
    openConsultationModal: ({ commit }, payload) => {
      commit('setConsultationDateList', payload.consultationDateList);
      commit('setConsultationQuestionId', payload.questionId);
      commit('setIsConsultationAnswerPopupOpen', true);
    },
    closeConsultationModal: ({ commit }) => {
      commit('setIsConsultationAnswerPopupOpen', false);
    },
    getConsultationSettingInfo: ({ state, rootState }, payload) => {
      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `${state.apiRequestUrl.surveys}/consultation/${payload.questionId}/setting`,
        data: { isHoliday: false },
      });
    },
    getAfterSchoolLimitCount: async ({ state, rootState }, itemId) => {
      return await rootState.axios({
        method: REQUEST_METHOD.POST,
        url: `${state.apiRequestUrl.surveys}/items/${itemId}/limit`,
        data: {
          tagIds: state.surveyReport.statistics.activeTagIds
        }
      });
    },
    setHistoryCount: ({ state }) => {
      state.surveyReport.respondent.historyCount--;
    },
    initHistoryCount: ({ state }) => {
      state.surveyReport.respondent.historyCount = -1;
    },
    deleteConsultation: ({ state }) => {
      let deleteItem = state.surveyReport.statistics.consultationAnswers.find(
        answer => answer.respondentId === state.surveyReport.respondent.initAnswerRespondent
      );

      // 상담신청내역 모달에서 삭제된 신청내역 값 지우기. api 호출없이 화면갱신위함
      deleteItem.answerId = null;
      deleteItem.answeredTimestamp = null;
      deleteItem.classBan = null;
      deleteItem.classGrade = null;
      deleteItem.classNumber = null;
      deleteItem.consultType = null;
      deleteItem.respondentId = null;
      deleteItem.respondentName = null;
      deleteItem.respondentPhone = null;
      deleteItem.subjectName = null;
      deleteItem.userType = null;

      // surveyReport\components\statistics\chart의 Consultation의 캘린더의 상담 신청내역 삭제.
      eventBus.$emit('delete-statistics-consultation-item', deleteItem);
    },

    /****************************
     *
     * 설문 통계 > 응답자 개별조회탭
     *
     ****************************/
    getSurveyReportRespondentList: ({ commit, state, rootState }, payload) => {
      rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveyReportRespondent}/${payload}/respondent-list`,
        })
        .then(res => {
          commit('setSurveyReportRespondentList', res.data);
        })
        .catch(err => {
          console.error('store.survey getSurveyReportRespondentList error => ', err);
        });
    },
    changeFilteredSurveyRespondentList: ({ commit }, payload) => {
      commit('setSurveyReportFilteredRespondentList', payload);
    },
    clearCurSurveyReportSelectedRespondent: ({ commit }, payload) => {
      commit('setCurSurveySelectedRespondent', payload);
    },
    clearSurveyReportRespondent: ({ commit }) => {
      commit('setSurveyReportRespondent', {
        curSurveyRespondentList: [],
        filteredSurveyRespondentList: [],
        curSurveyContentsPages: [],
        curSurveySelectedRespondent: {},
        curSurveySelectedRespondentAnswer: {},
        initAnswerModalIsOpen: false,
        initAnswerRespondent: '',
        isInitAnswerDone: false,
        historyCount: -1,
      });
    },
    getCurSurveyContentsPages: ({ commit, state, rootState }, payload) => {
      rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveyContents}?surveyId=${payload}&containsDel=true`,
        })
        .then(res => {
          commit('setCurSurveyContentsPages', res.data.pages);
        })
        .catch(err => {
          console.error('store.survey getCurSurveyContentsPages error => ', err);
        });
    },
    getCurSurveySelectedRespondentAnswer: ({ commit, state, rootState }, payload) => {
      commit('setInitAnswerRespondent', '');
      commit('setCurSurveySelectedRespondent', payload.respondent);
      rootState
        .axios({
          method: REQUEST_METHOD.GET,
          url: `${state.apiRequestUrl.surveyAnswer}/${payload.surveyId}?respondentId=${payload.respondentId}`,
        })
        .then(res => {
          commit('setCurSurveySelectedRespondentAnswer', res.data.answers);
        })
        .catch(err => {
          console.error('store.survey setCurSurveySelectedRespondentAnswer error => ', err);
        });
    },
    openInitAnswerConfirmModal: ({ commit }, payload) => {
      commit('setInitAnswerRespondent', payload.respondentId);
      commit('setInitAnswerModalIsOpen', true);
    },
    closeInitAnswerConfirmModal: ({ commit }) => {
      commit('setInitAnswerModalIsOpen', false);
    },
    deleteRespondent: ({ commit, rootState, state, dispatch }, payload) => {
      rootState
        .axios({
          method: REQUEST_METHOD.DELETE,
          url: `${state.apiRequestUrl.surveysRespondents}/${payload.respondentId}`,
        })
        .then(() => {
          commit('setIsInitAnswerDone', true);
          dispatch('closeInitAnswerConfirmModal');
        });
    },

    /****************************
     *
     * 추천템플릿
     *
     ****************************/
    openRecommendTemplateModal: ({ commit }) => {
      commit('setIsRecommendTemplateOpen', true);
    },
    closeRecommendTemplateModal: ({ commit }) => {
      commit('setIsRecommendTemplateOpen', false);
    },
    changeRecommendTemplateTab: ({ commit }, payload) => {
      commit('setRecommendTemplateActiveTab', payload);
    },
    searchRecommendShareTemplate: ({ state, rootState }) => {
      if (rootState.infiniteScroll.isBusy) {
        return false;
      }

      if (!rootState.infiniteScroll.isBusy && !rootState.infiniteScroll.isListEnd) {
        rootState.infiniteScroll.isBusy = true;

        const params = {};
        params.page = rootState.infiniteScroll.page;
        params.size = 20;
        state.recommendTemplateSearchQuery.userId = rootState.user.currentId;

        rootState
          .axios({
            method: REQUEST_METHOD.POST,
            url: `${state.apiRequestUrl.surveys}/forms/v2/!q`,
            params: params,
            data: state.recommendTemplateSearchQuery,
          })
          .then(res => {
            if (res.data._embedded) {
              const surveys = res.data._embedded.surveyFormResponses;

              if (rootState.infiniteScroll.page === 0) {
                state.recommendTemplates = surveys;
              } else {
                state.recommendTemplates.push(...surveys);
              }

              const totalPages = res.data.page.totalPages;
              const pageNumber = res.data.page.number;

              if (totalPages > pageNumber + 1) {
                rootState.infiniteScroll.page++;
                rootState.infiniteScroll.isListEnd = false;
              } else {
                rootState.infiniteScroll.page = 0;
                rootState.infiniteScroll.isListEnd = true;
              }
            } else {
              state.recommendTemplates = [];
            }
          })
          .finally(() => {
            rootState.infiniteScroll.isBusy = false;
          });
      }
    },
    searchRecommendShareTemplateOnlyRecommend: ({ state, rootState, dispatch }) => {
      if (rootState.infiniteScroll.isBusy) {
        return false;
      }

      if (!rootState.infiniteScroll.isBusy && !rootState.infiniteScroll.isListEnd) {
        rootState.infiniteScroll.isBusy = true;

        const params = {};
        params.page = rootState.infiniteScroll.page;
        params.size = 20;

        if (!state.recommendTemplateSearchQuery.recommend) {
          state.recommendTemplateSearchQuery.recommendLabelScore = 3;
        } else {
          state.recommendTemplateSearchQuery.recommendLabelScore = 0;
        }
        state.recommendTemplateSearchQuery.userId = rootState.user.currentId;

        rootState
          .axios({
            method: REQUEST_METHOD.POST,
            url: `${state.apiRequestUrl.surveys}/forms/!q`,
            params: params,
            data: state.recommendTemplateSearchQuery,
          })
          .then(res => {
            if (res.data._embedded) {
              const surveys = res.data._embedded.surveyFormResponses;

              if (rootState.infiniteScroll.page === 0) {
                state.recommendTemplates = surveys;
              } else {
                state.recommendTemplates.push(...surveys);
              }

              const totalPages = res.data.page.totalPages;
              const pageNumber = res.data.page.number;

              if (totalPages > pageNumber + 1) {
                rootState.infiniteScroll.page++;
                rootState.infiniteScroll.isListEnd = false;
              } else {
                rootState.infiniteScroll.page = 0;
                rootState.infiniteScroll.isListEnd = true;
              }
            } else {
              state.recommendTemplates = [];
            }
          })
          .finally(() => {
            rootState.infiniteScroll.isBusy = false;
          });
      }
    },
    createSurveyFavorite: ({ state, rootState, dispatch }, surveyId) => {
      const requestBody = {};
      requestBody.userId = rootState.user.currentId;
      requestBody.surveyId = surveyId;

      rootState
        .axios({
          method: REQUEST_METHOD.POST,
          url: `${state.apiRequestUrl.surveys}/favorite`,
          data: requestBody,
        })
        .then(res => {
          // 화면상에서 찜하기표시, 찜하기 개수 표시 변경
          const targetTemplate = state.recommendTemplates.find(template => template.surveyId === surveyId);
          targetTemplate.isMyFavorite = !targetTemplate.isMyFavorite;
          targetTemplate.favoriteCount = targetTemplate.favoriteCount + 1;
        });
    },
    deleteSurveyFavorite: ({ state, rootState, dispatch }, surveyId) => {
      const requestBody = {};
      requestBody.userId = rootState.user.currentId;
      requestBody.surveyId = surveyId;

      rootState
        .axios({
          method: REQUEST_METHOD.DELETE,
          url: `${state.apiRequestUrl.surveys}/favorite`,
          data: requestBody,
        })
        .then(res => {
          // 화면상에서 찜하기표시, 찜하기 개수 표시 변경
          const targetTemplate = state.recommendTemplates.find(template => template.surveyId === surveyId);
          targetTemplate.isMyFavorite = !targetTemplate.isMyFavorite;
          targetTemplate.favoriteCount === 0 ? (targetTemplate.favoriteCount = 0) : targetTemplate.favoriteCount--;
        });
    },
    initRecommendTemplateSearchQuery: ({ commit }) => {
      commit('setRecommendTemplateSearchQuery', {
        recommend: false,
        sharedByMe: false,
        myFavorite: true,
        userId: '',
        sort: 'INSERTED_DESC',
        _surveyTitle: '',
        surveyType: null,
      });
    },
    initRecommendTemplates: ({ commit }) => {
      commit('setRecommendTemplate', []);
    },
    cancelSurveyShare: ({ state, rootState, dispatch }, surveyId) => {
      rootState
        .axios({
          method: REQUEST_METHOD.DELETE,
          url: `${state.apiRequestUrl.surveys}/${surveyId}`,
        })
        .then(res => {
          // 화면 리스트에서 제거
          const targetIndex = state.recommendTemplates.findIndex(targetTemplate => targetTemplate.surveyId === surveyId);
          state.recommendTemplates.splice(targetIndex, 1);

          // 리스트에서 삭제된 양식이 미리보기 되고있다면 삭제
          if (state.surveyContents.surveyId === surveyId) {
            dispatch('initSurveyContents');
          }
        })
        .catch(err => {
          console.error('store.survey cancelSurveyShare error => ', err);
        });
    },
  },
};

export default storeSurvey;
