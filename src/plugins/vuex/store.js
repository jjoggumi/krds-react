// src/vuex/store.js
import Vue from "vue";
import Vuex from "vuex";

import storeHitalk from "./store.hitalk";
import storeEditor from "./store.editor";
import storeWorksheet from "./store.worksheet";
import storeHome from "./store.home";
import storeSchool from "./store.school";
import storeMyBoard from "./store.myboard";
import storeSurvey from "./store.survey";
import storeBoard from "./store.board";
import storeClazzes from "./store.clazzes";
import storeBehavior from "./store.behavior.js";
import storeImageEditor from "./store.imageEditor";
import storeClazzTag   from "./store.clazzTag";

import constants from '../constants.js'
import $constants from '@/constants/index'
import moment from '@/plugins/moment.js'
import router from "@/plugins/router"
import authentication from '@/plugins/authentication'
import stringUtil from '@/assets/js/stringUtil.js'

import { getField, updateField } from 'vuex-map-fields';
import axios from "axios";
import downloadjs from "downloadjs";
import isMobileJs from "ismobilejs";

import { get as lodashGet } from "lodash";

import {firebaseAnalytics} from '@/plugins/firebase'
import i18n from "@/plugins/i18n";
import {eventBus} from "@/main";
import { getDailyUserConsentsAgreement } from '@hiclass/core';

Vue.use(Vuex);

const URL_PROTOCOL = process.env.VUE_APP_URL_PROTOCOL;
const CDN_URI = process.env.VUE_APP_BASE_CDN_URI;

const webURL = process.env.VUE_APP_BASE_UI_URI
const adURL = process.env.VUE_APP_BASE_AD_URI
const apiURL = process.env.VUE_APP_BASE_API_URI

const REQUEST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

let isProductionReal = false
if (webURL === 'https://www.hiclass.net' || webURL === 'https://stage.hiclass.net') {
  isProductionReal = true
}

const state = {
  /**
   * 전역 상수
   */
  isLogout: false,
  constants: constants,
  $constants: $constants,
  permissionDeniedToasted: true,
  startTimestamp: moment().valueOf(),   // 앱 시작 시간
  currentTimestamp: moment().valueOf(), // 현재 시간. 10초 단위로 갱신

  isLoadingIdTokenExpireCheck: false,   // idToken 만료시간 체크 로딩
  isLoadFailAsyncComponent: false,      // 비동기 컴포넌트 로딩 에러 체크
  isMobileObj: isMobileJs(navigator),   // 모바일 기기 확인
  
  isProductionUI: webURL === 'https://www.hiclass.net',
  isStageUI: webURL === 'https://stage.hiclass.net',
  isDevelopmentUI: webURL === 'https://devui.hiclass.net' || webURL === 'https://devboard.hiclass.net',
  
  isLoadedIndex: false,

  isOnCapsLock: false,
  isUseKeyCapture: false,
  isVisibleWindow: true,

  reactionIds: [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
  ],

  /**
   * 로그인 사용자 정보
   */
  user: {},
  userUri: "",
  userType: "",

  classUser: {},

  schoolUri: "",

  /**
   * 내 클래스 구독 정보 저장
   */
  clazzSubscribeViews: [],

  /**
   * 내 학교 구독 정보 저장
   */
  schoolSubscribeViews: [],

  /**
   * 1회성 알림 플래그 정보
   */
  onceChecks: {
    userSecretCommentUsed: false, // 비밀 댓글 사용 확인 alert 메시지 출력 flag
  },
  
  /**
   * 진입한 클래스의 정보
   */
  curClassItem: {},

  /**
   * 진입한 클래스의 탭 메뉴 선택 (LIST | FILE)
   */
  curClassTabCode: 'LIST',

  /**
   * 진입한 클래스의 파일 모아보기 탭 메뉴 선택 (image | video | file)
   */
  curClassPostFileTabCode: 'image',
  
  /**
   * 진입한 클래스의 관리자 여부
   */
  isCurClassManager: false,

  /**
   * 진입한 클래스의 과제 > 각 과제현황 풀스크린 페이지
   */
  curClazzHomework: {
    status: {
      isOpen: null,
      postItem: {},
      postItemType: null
    }
  },

  /**
   * 진입한 클래스의 schoolType에 따른 알림장/공지 문구 표시
   */
  curClazzNote: {
    classId: '',
    schoolType: '',
    name: '알림장',
    suffix1: '을',
    suffix2: '은',
    suffix3: '이',
    suffix4: '과',
  },

  curClassSearchQuery: {
    // 게시물 상태 (ALL: 전체(COMPLETE,TEMPORARY,RESERVE), COMPLETE: 완료, TEMPORARY: 임시저장, RESERVE: 예약)
    postStatus: 'ALL',
    // 과제제출여부 (ALL: 전체, SUBMIT: 제출함, NOT_SUBMIT: 제출안함)
    homeworkType: null,
    // 게시글 조회 시 comment 노출 여부 default:false
    commentUsed: false,
    // 검색엔진 키워드 검색 (제목,내용,파일명)
    keyword: null,
    // 검색엔진 키워드 검색 댓글 포함 여부 default:true (댓글내용,파일명)
    keywordCommentUsed: false,
    // 검색엔진 작성자 아이디로 조회
    insertedUser: null,
    // 검색엔진 게시일로 조회
    dayOfPosted: null,
    // 정렬순 
    sort: 'posted,desc',
    // (게시판 고도화)게시판 관리 ID
    boardId: null,
    // (게시판 고도화)게시판 폴더 관리 ID
    folderId: null,
  },

  curClassPostFileSearchQuery: {
    // 게시물 유형 (ALL 전체, NOTE 알림장, ALBUM 앨범, BOARD 자유게시판, HOMEWORK 과제)
    // postType: 'ALL',
    // 검색엔진 파일모아보기 유형 지정(image:이미지, video:동영상, file:파일)
    // mode: 'image',
    // collection of sort directives in the format ($propertyname,)+[asc|desc]?
    sort: 'posted,desc',
    // 파일명 검색
    keyword: null,

    // (게시판 고도화)게시판 관리 ID
    boardId: null,
    // (게시판 고도화)게시판 폴더 관리 ID
    folderId: null,
  },

  /**
   * 진입한 학교의 정보
   */
  curSchoolItem: {},

  curSchoolSearchQuery: {
    keyword: null
  },

  /**
   * 무한 스크롤 플래그
   */
  infiniteScroll: {
    isBusy: false,
    isListEnd: false,
    distance: process.env.VUE_APP_BASE_INFINITE_SCROLL_DISTANCE,
    page: 0,
    size: 20,
  },

  /**
   * 좋아요 리스트 팝업
   */
  curPostLike: {
    isOpen: false,
    isClassPost: false,
    postId: null,
  },
  
  /**
   * 약관 동의한 게시글 ID 임시저장
   */
  acceptedTermsPostIdList: [],
  
  curPostTerms: {
    isOpen: false,
    isOpenDetail: false,
    postId: null,
    postOptions: []
  },

  /**
   * 게시글 작성, 수정 레이어 팝업
   */
  curPostEdit: {
    isOpen: false,
    componentKey: 0,
    post: {},

    postItem: {}, // 목록 갱신용으로 전달
    // posts: [],
    paramOption: {
      isManager: false,
      editMode: 'create',
      clazz: {},
    },

    // paramModel: {
    //   parentUri: null,
    //   postType: null,
    // },

    parentId: null,
    schoolType: null,
    postVersion: 'V2'
  },

  versionData: { web: {},  hitalk: {} },

  curClazzesPosts: undefined,

  curClazzesPostFiles: undefined,

  curSchoolsPosts: undefined,

  /**
   * draggable option
   * group 은 각 인스턴스의 필수 속성
   *
   * group: 'elementsName'
   */
  draggableDefaultOption: Object.freeze({
    // delay: 5, // time in milliseconds to define when the sorting should start

    animation: 200,
    disabled: false,
    ghostClass: 'hidden-ghost',
    scrollSensitivity: 200,
    forceFallback: true,
    forceAutoScrollFallback: true,
    bubbleScroll: false,
    scrollSpeed: 25,
  }),
  
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  

  /**
   * 코드 기본값
   */
  postVersionDefault: 'V2',
  postVersions: ['V1', 'V2'],
  classSchoolGradeType: {
    ELEMENTARY: [
      { gradeName: '1학년', classGrade: '1', classGradeCode: 'E1'},
      { gradeName: '2학년', classGrade: '2', classGradeCode: 'E2'},
      { gradeName: '3학년', classGrade: '3', classGradeCode: 'E3'},
      { gradeName: '4학년', classGrade: '4', classGradeCode: 'E4'},
      { gradeName: '5학년', classGrade: '5', classGradeCode: 'E5'},
      { gradeName: '6학년', classGrade: '6', classGradeCode: 'E6'},
      { gradeName: '학년 무관', classGrade: 'ANY', classGradeCode: 'NONE'}
    ],
    SPECIAL: [
      { gradeName: '1학년', classGrade: '1', classGradeCode: 'E1'},
      { gradeName: '2학년', classGrade: '2', classGradeCode: 'E2'},
      { gradeName: '3학년', classGrade: '3', classGradeCode: 'E3'},
      { gradeName: '4학년', classGrade: '4', classGradeCode: 'E4'},
      { gradeName: '5학년', classGrade: '5', classGradeCode: 'E5'},
      { gradeName: '6학년', classGrade: '6', classGradeCode: 'E6'},
      { gradeName: '학년 무관', classGrade: 'ANY', classGradeCode: 'NONE'}
    ],
    MIDDLE: [
      { gradeName: '1학년', classGrade: '1', classGradeCode: 'M1'},
      { gradeName: '2학년', classGrade: '2', classGradeCode: 'M2'},
      { gradeName: '3학년', classGrade: '3', classGradeCode: 'M3'},
      { gradeName: '학년 무관', classGrade: 'ANY', classGradeCode: 'NONE'}
    ],
    HIGH: [
      { gradeName: '1학년', classGrade: '1', classGradeCode: 'H1'},
      { gradeName: '2학년', classGrade: '2', classGradeCode: 'H2'},
      { gradeName: '3학년', classGrade: '3', classGradeCode: 'H3'},
      { gradeName: '학년 무관', classGrade: 'ANY', classGradeCode: 'NONE'}
    ],
    UNIVERSITY: [
      { gradeName: '1학년', classGrade: '1', classGradeCode: 'U1'},
      { gradeName: '2학년', classGrade: '2', classGradeCode: 'U2'},
      { gradeName: '3학년', classGrade: '3', classGradeCode: 'U3'},
      { gradeName: '4학년', classGrade: '4', classGradeCode: 'U4'},
      { gradeName: '5학년', classGrade: '5', classGradeCode: 'U5'},
      { gradeName: '6학년', classGrade: '6', classGradeCode: 'U6'},
      { gradeName: '학년 무관', classGrade: 'ANY', classGradeCode: 'NONE'}
    ],
    KINDERGARTEN: [
      { gradeName: '학년 무관', classGrade: 'ANY', classGradeCode: 'NONE'}
    ],
    GROUP: [
      { gradeName: '학년 무관', classGrade: 'ANY', classGradeCode: 'NONE'}
    ]
  },

  /**
   * 시도교육청명, 코드, url
   * source: https://www.data.go.kr/data/15021151/standard.do
   */
  sidoOfficeOfEducations: [
    {
      code: '7010000',
      title: '서울특별시교육청',
      url: 'https://eduro.sen.go.kr',
      sidoCode: '11',
      sidoTitle: '서울'
    },
    {
      code: '7530000',
      title: '경기도교육청',
      url: 'https://eduro.goe.go.kr',
      sidoCode: '41',
      sidoTitle: '경기도'
    },
    {
      code: '7430000',
      title: '대전광역시교육청',
      url: 'https://eduro.dje.go.kr',
      sidoCode: '30',
      sidoTitle: '대전'
    },
    {
      code: '7240000',
      title: '대구광역시교육청',
      url: 'https://eduro.dge.go.kr',
      sidoCode: '27',
      sidoTitle: '대구'
    },
    {
      code: '7150000',
      title: '부산광역시교육청',
      url: 'https://eduro.pen.go.kr',
      sidoCode: '26',
      sidoTitle: '부산'
    },
    {
      code: '7310000',
      title: '인천광역시교육청',
      url: 'https://eduro.ice.go.kr',
      sidoCode: '28',
      sidoTitle: '인천'
    },
    {
      code: '7380000',
      title: '광주광역시교육청',
      url: 'https://eduro.gen.go.kr',
      sidoCode: '29',
      sidoTitle: '광주'
    },
    {
      code: '7480000',
      title: '울산광역시교육청',
      url: 'https://eduro.use.go.kr',
      sidoCode: '31',
      sidoTitle: '울산'
    },
    {
      code: '9300000',
      sidoCode: '36',
      title: '세종특별자치시교육청',
      url: 'https://eduro.sje.go.kr',
      sidoTitle: '세종'
    },
    {
      code: '8000000',
      title: '충청북도교육청',
      url: 'https://eduro.cbe.go.kr',
      sidoCode: '43',
      sidoTitle: '충북'
    },
    {
      code: '8140000',
      title: '충청남도교육청',
      url: 'https://eduro.cne.go.kr',
      sidoCode: '44',
      sidoTitle: '충남'
    },
    {
      code: '8750000',
      title: '경상북도교육청',
      url: 'https://eduro.gbe.kr',
      sidoCode: '47',
      sidoTitle: '경북'
    },
    {
      code: '9010000',
      title: '경상남도교육청',
      url: 'https://eduro.gne.go.kr',
      sidoCode: '48',
      sidoTitle: '경남'
    },
    {
      code: '7800000',
      title: '강원도교육청',
      url: 'https://eduro.kwe.go.kr',
      sidoCode: '42',
      sidoTitle: '강원도'
    },
    {
      code: '8320000',
      title: '전라북도교육청',
      url: 'https://eduro.jbe.go.kr',
      sidoCode: '45',
      sidoTitle: '전북'
    },
    {
      code: '8490000',
      title: '전라남도교육청',
      url: 'https://eduro.jne.go.kr',
      sidoCode: '46',
      sidoTitle: '전남'
    },
    {
      code: '9290000',
      title: '제주특별자치도교육청',
      url: 'https://eduro.jje.go.kr',
      sidoCode: '50',
      sidoTitle: '제주'
    }
  ],

  // 외부 팝업
  openPopup: {},

  // 건강상태 자가진단 무료 문자 팝업
  healthCheckFreeSms: {
    isOpen: false
  },

  // 학생 건강상태 자가진단 팝업
  studentHealthCheck: {
    isOpen: false
  },
  
  // 건강상태 자가진단 사이트
  HealthConditionSelfCheck: {
    url: 'https://hcs.eduro.go.kr/'
  },

  // 클래스 신청서 등록/수정 팝업
  clazzApplicationForm: {
    isOpen: false,
    isManager: false,
    clazz: {},
    formName: '',
    mode: '',
    clazzApply: {},
    userId: null  // 학부모 userId
  },

  // 클래스 신청서 학생 선택 팝업
  clazzApplicationUser: {
    isOpen: false,
    formName: '',
    acceptParentList: []
  },
  
  // 클래스 신청서 > 학생별 현황 > 제출내역 팝업
  clazzApplyList: {
    isOpen: false,
    classId: null,
    userId: null,
    applyType: null,
    totalElements: 0
  },
  
  // 클래스 신청서 > 담임 확인 목록 팝업
  clazzApplyRejectList: {
    isOpen: false,
    isManager: false,
    mode: null,
    clazzApplyId: null
  },
  
  // 클래스 구성원 관리 > 임시 학생 일괄 등록
  clazzMemberAddStudentBatch: {
    isOpen: false,
    isManager: false,
    classId: null,
  },
  
  // 클래스 구성원 관리 > 임시 학생 일괄 등록 가이드
  clazzMemberAddStudentBatchGuide: {
    isOpen: false,
  },

  // 클래스 RNB 우리반 일정 팝업
  clazzCalendarSchedule: {
    isOpen: false,
    clazzes: {},
    curItem: {},
    clickedDate: null
  },

  // V2 게시글 리마인드 푸시 모달
  clazzRemindPushModal: {
    isOpen: false,
    postItem: {},
    postItemType: null,
    schoolType: null,
    isGeneralType: false
  },

  // 파일 업로드 로딩 (투명)
  isFileLoading: false,

  isMultiFileLoading: false,

  // 로딩 (투명)
  isLoading: false,

  isConsultationLoading: false,

  // 에디터 copy & paste 로딩
  isEditorLoading: false,

  // 에디터 init 로딩
  isEditorInitLoading: false,
  
  // 라디오 버튼 토글 로딩
  isRadioToggleLoading: false,
  
  // 접속 로그 등록 로딩
  isUserLogLoading: false,

  /**
   * 배너
   */
  banner: {},
  bannerTimestamp: null,

  userProfileDefault:
    URL_PROTOCOL + CDN_URI + "/static/images/user_profile_default.png",
  schoolImageDefault:
    URL_PROTOCOL + CDN_URI + "/static/images/school_image_default.png",
  videoThumbnailDefault: "/files/img/icon_img_empty_thum.png",
  emptyImageDefault: "/files/img/ico_fail_img.png",
  classTermsPrivacyDoc: URL_PROTOCOL + CDN_URI + "/static/document/hiclass_terms_privacy_doc_year.hwp",
  classTermsPrivacyDocV2: URL_PROTOCOL + CDN_URI + "/static/document/hiclass_terms_privacy_doc_year_v2.hwp",
  classTermsPrivacyDocIntl: URL_PROTOCOL + CDN_URI + "/static/document/hiclass_terms_privacy_doc_year_intl.zip",
  childPrivacyDoc: URL_PROTOCOL + CDN_URI + "/static/document/hiclass_child_privacy_agreed.hwp",
  InternetExplorerExpireGuide: URL_PROTOCOL + CDN_URI + "/static/images/banners/internet_explorer_expire_guide_220727.png",
  InternetExplorerExpireGuideLink: 'microsoft-edge:https://www.hiclass.net',
  cloneLocalData: {},
  cloneLocalFiles: [],
  classImgCrop1: {
    width: "618px",
    height: "309px"
  },
  classImgCrop2: {
    width: "309px",
    height: "309px"
  },
  classImgCrop3: {
    width: "720px",
    height: "480px"
  },
  classImgCropAlbumThumbnail: {
    width: "141px",
    height: "141px"
  },
  imgCropCardForm: {
    width: "248px",
    height: "248px"
  },
  notiMessageCode: {
    openDetailPostLayers: [
        "postComment"
      , "postInformation"
      , "postNotice"
      , "postMeal", "postMealPhoto"
      , "postAlarm"
      , "postNote", "postNoteModified", "postNoteRead", "postNoteRead24"
      , "postAlbum", "postAlbumModified"
      , "postBoard", "postBoardModified"
      , "postHomework", "postHomeworkModified", "postHomeworkUserComment"
      , "postRemindNote", "postRemindAlbum", "postRemindBoard", "postRemindHomework"
    ],
    openAlarmPlusDetailPopups: [
      "postAlarmPlus", "postAlarmPlusModified", "postAlarmPlusRead", "postAlarmPlusConsult", "postAlarmPlusAfterSchoolClosed"
    ],
    openAlarmPlusInviteCardPopups: [
      "inviteCardLetter"
    ],
    routeMains: [],
    routeClassMains: ["classClose", "classActivate", "classDeactivate", "classAccept", "classManager"],
    routeClassMembers: ["classSelfSecession", "classJoin"],
    routeClassMemberTabs: ["classApply", "classCancel"],
    routeClassHomeworks: [],
    routeClassCalendars: ["postCalendarClass", "postCalendarClassModified"],
    routeClassApplies: [],
    routeClassFormApplyListTab: [
      "classApplyAbsent",
      "classApplyFieldstudy",
      "classApplyWorksheet",
      'classApplyMedicationOrder',
      "classApplyConfirmAbsent",
      "classApplyConfirmFieldstudy",
      "classApplyConfirmWorksheet",
      'classApplyConfirmMedicationOrder'
    ],
    routeInviteClassMains: ["inviteCard"],
    routeInviteSchoolMains: ["alarmPlusDenial"],
    routeInviteSchoolAlarms: ["alarmPlusAccept"],
    routeSchoolMains: [],
    routeChatMains: ["chat"],
    routeHelpChatMains: ["helpChat"],
    routeAlarmPlusTeacherTab: ["alarmPlusManagerWaitingApproval"],
    silentReads: ["classDenial", "classTeacherSecession", "alarmPlusDenial"],
    routeSurveyTab: ["survey", "surveyModified", "surveyRemind", "surveyAfterSchoolDeleted", "surveyAfterSchoolClosed", "surveyConsultationDeleted", "surveyAfterSchoolToApplicant", "surveyAfterSchoolCanceled"],
    routeAttendance: ["attendanceSubmitParent", "attendanceSubmitTeacher", "attendanceCompleted", "attendanceFile"],
    routeAttendanceUnChecked: ["attendanceUnchecked"],
    routerTimetableLessonChange: ["timetableLessonChangeFinalStatus", "timetableLessonChangeIgnored"],
  },
  mobileAppDownloadUri: {
    android: "https://play.google.com/store/apps/details?id=com.iscreammedia.app.hiclass.android&hl=ko",
    ios: "https://apps.apple.com/kr/app/%ED%95%98%EC%9D%B4%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%98%91%EB%98%91%ED%95%9C-%ED%95%99%EA%B8%89%EC%86%8C%ED%86%B5%EC%95%B1/id1472488819"
  },
  mobileIntentUri: {
    android:
      "Intent://www.hiclass.net#Intent;scheme=app;package=com.iscreammedia.app.hiclass.android;code=CODE;end",
    ios: "hiclassapp://hiclass.net"
  },
  browserDownloadInfos: [
    {
      title: '구글 크롬',
      className: 'chrome',
      downloadUrl: 'https://www.google.com/intl/ko/chrome/',
    },
    {
      title: '네이버 웨일',
      className: 'whale',
      downloadUrl: 'https://whale.naver.com/ko/download/win/',
    },
    {
      title: 'MS 엣지',
      className: 'edge',
      downloadUrl: 'https://www.microsoft.com/ko-kr/edge',
    },
  ],
  surveyWriteGuideUrl: 'https://hiclass.notion.site/9a57170f004f4c4ea31a72fb9e7b452e',
  notiSounds: [
    {
      name: "호루라기",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-whistle.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-whistle.png"
    },
    {
      name: "종",
      mp3:
        URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-school-bell.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-school-bell.png"
    },
    {
      name: "게임",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-pacman.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-pacman.png"
    },
    {
      name: "드럼 1",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-drum1.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-drum1.png"
    },
    {
      name: "드럼 2",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-drum2.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-drum2.png"
    },
    {
      name: "딩동",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-dingdong.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-dingdong.png"
    },
    {
      name: "실로폰",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-bell.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-bell.png"
    },
    {
      name: "마림바",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/sfx-5678bell.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/sfx-5678bell.png"
    },
    {
      name: "코믹 (Long)",
      mp3:
        URL_PROTOCOL + CDN_URI + "/static/sounds/note/music-spongebob.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/music-spongebob.png"
    },
    {
      name: "음악상자 연주(Long)",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/music-orgel.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/music-orgel.png"
    },
    {
      name: "오르간 연주(Long)",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/music-nba.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/music-nba.png"
    },
    {
      name: "드럼 연주(Long)",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/music-drum.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/music-drum.png"
    },
    {
      name: "서커스(Long)",
      mp3: URL_PROTOCOL + CDN_URI + "/static/sounds/note/music-circus.mp3",
      thumb:
        URL_PROTOCOL + CDN_URI + "/static/images/note/music-circus.png"
    }
  ],
  isShowDetailPostLayer: false,
  itemDetailObj: {},
  tmpClassName: "",
  isShowToast: false,
  toastMsg: "",
  isDimLoading: false,
  isNewTabLoading: false,
  maxLength: {
    classList : {
      postContent : 75
    },
    card: {
      postContent : 174
    }
  },
  /**
   * 파일 다운로드 상태
   */
  downloadStatus: {},
  hitalkDownloadStatus: {},
  /**
   * 파일 업로드 제한
   */
  upload: {
    class: {
      // 이미지
      image: {
        size: 300,
        sizeStr: '300MB',
        limit: 50,
      },
      // 동영상
      video: {
        size: 500,
        sizeStr: '500MB',
        limit: 1,
      },
      // 일반 파일
      etc: {
        size: 300,
        sizeStr: '300MB',
        limit: 50,
      },
    },
    chat: {
      // 이미지
      image: {
        size: 300,
        sizeStr: '300MB',
        limit: 50,
      },
      // 동영상
      video: {
        size: 500,
        sizeStr: '500MB',
        limit: 1,
      },
      // 일반 파일
      etc: {
        size: 300,
        sizeStr: '300MB',
        limit: 50,
      },
    },
    help: {
      // 통합
      size: 50,
      sizeStr: '50MB',
      limit: 5
    }
  },
  TASKBAR_HEIGHT: 70,
  NOTEBOARD_MARGIN_WIDTH: 15,

  isVisibleAlarmPlus: true,
  alarmPlusDetail: {
    eLetterId: null,
    studentId: null,
    userId: null,
    post: null
  },
  alarmPlusInviteSchool: {},
  /**
   * 학교알리미 교직원 등록 여부
   */
  alarmPlusUsed: {
    isTeacherSubscribe: false,
  },

  /**
   * GNB 헤더 하이톡 > 상담시간외 읽지 않은 메시지 여부 확인
   */
  chatUncheckedMessage: {
    count: 0,
    receiver: null,
    timestamp: null
  },

  /**
   * 이미지 상세보기, 문서 미리보기
   * 활성 레이어 팝업 저장소 관리
   */
  imageView: {
    isOpen: false,
    post: {},
    items: [],
    index: 0
  },
  docView: {
    isOpen: false,
    item: {}
  },
  termsView: {
    isOpen: false,
    layerType: '',
    userType: ''
  },
  printView: {
    isOpen: false,
    content: null,
    className: null,
    posted: null,
    postTypeName: null
  },
  
  notSupportedBrowser: {
    isOpen: false,
    title: '',
    pageName: ''
  },
  
  noteBoardImagePack: {
    isOpen: false,
  },
  
  signaturePopupImageUpload: {
    file: null,
    dataUrl: null
  },

  customerService: {
    tel: '1811-0910'
  },
  
  userGuideLink: {
    TEACHER: 'https://hiclass.notion.site/hiclass/d7d429af394b4d8b82cdd52acfb549dc', // 선생님 노션 가이드
    PARENTS: 'https://hiclass.notion.site/hiclass/d839de9d8dd84ee581adfe573546493c', // 학부모, 학생 노션 가이드
    STUDENT: 'https://hiclass.notion.site/hiclass/d839de9d8dd84ee581adfe573546493c', // 학부모, 학생 노션 가이드
  },

  popupMessage: {
    isOpen: false,
    message: null,
    type: null,
    action: null,
    title: null
  },

  /**
   * 이미지 리사이즈 정책
   */
  imageResizeConfig: {
    allowExtensions: ['jpg', 'jpeg', 'png'],

    // 브라우저 이미지 리사이즈 라이브러리 (1)
    // browser-image-resizer config
    quality: 0.8, // 80%의 비율로 압축. 원본과 비슷하면서 압축율이 높음
    maxWidth: 1123,
    maxHeight: 1123,
    autoRotate: false,  // EXIF rotate 참조하지 않음 (IE일 경우 true 로 변경해 주어야 함)
    debug: !isProductionReal,

    // 브라우저 이미지 리사이즈 라이브러리 (2)
    // browser-image-compression config
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1200,
    useWebWorker: false,
    fileType: 'image/jpeg',
    initialQuality: 0,
    alwaysKeepResolution: true,
  },

  /**
   * 묶음사진 리사이즈 정책
   */
  imagePackResize: {
    THUMBNAIL_MAX_WIDTH: '400',
    THUMBNAIL_MAX_HEIGHT: '400',
  },

  /**
   * 업로드 미지원 파일확장자
   */
  inCompatibleExtensions: [
    'swf'
  ],

  videoExtensions: [
    'webm', 'mkv', 'flv', 'vob', 'ogv', 'drc', 'avi', 'mts', 'm2ts', 'ts',
    'mov', 'qt', 'wmv', 'yuv',  'rm', 'rmvb', 'viv', 'asf', 'amv', 'mp4', 'm4p', 'mpv',
    'mpg', 'mpeg', 'mpe', 'm4v', '3gp', '3g2'
  ],
  isNotAllowExtensions: [
    "bat","bin","cmd","com","cpl","dll","exe","gadget","inf1","ins","inx","isu","job",
    "jse","lnk","msc","msi","msp","mst","paf","php","pif","ps1","reg","rgs",
    "scr","sct","sh","shb","shs","svg","u3p","vb","vbe","vbs","vbscript","ws","wsf","wsh","js","wsf","hta","cpl","ocx","jsp"
  ],
  /**
   * html-pdf 다운로드 컴포넌트 제어
   */
  htmlPdfDownload: {
    isOpen: false,
    pdfContent: null,
    pdfContentHeight: 0,
    fileName: null
  },

  htmlPrint: {
    isOpen: false,
    content: null
  },

  /**
   * current window props
   */
  curWindow: {
    scrollTop: 0,
    scrollLeft: 0
  },

  /**
   * 채팅 모달 팝업
   */
  chatModal: {
    isOpen: false,
    mode: 'alert',
    message: '',
    action: ''
  },
  
  hitalkInitData: {
    id: 'hitalk',
    class: 'lnb-attendance',
    text: '하이톡',
    path: `/hitalk`,
    type: 'window',
    size: {
      height: 640,
      width: 1050
    },
    params: {}
  },
  // 학생 행동기록 윈도우 정보
  studentActionRecordWindowInfomation: {
    id: 'behavior',
    class: 'lnb-attendance',
    text: '학생 행동기록',
    path: `/behavior-records`,
    type: 'window',
    size: {
      height: 1080,
      width: 1920
    },
    params: {}
  },

  readMessagesFlag: false,

  // 전체화면 전환 전 현재 스크롤 위치 저장
  scrollPosition: null,

  /**
   * 하이톡 공유하기
   */
  hitalkShare: {
    selectedUserList: [],
    message: '',
    content: {},
    sendStatus: false,
    currentTab: 'userList',
    contents: [],
  },

  termsRecord: {
    privacyRecord: [],
    serviceRecord: [],
    privacyPreviewRecord: [],
    privacyPreviewRecordByUserType: {
      'TEACHER': [],
      'PARENTS': [],
      'STUDENT': []
    },
    privacyUseDetailRecord: [],
    textRecord: [],
    currentPrivacyIndex: 0
  },

  /**
   * 출석부 서비스 종료 일시
   */
  attendanceExpiredTime: '2022-12-31 23:59:59',

  /**
   * 하이클래스 이벤트 로고 노출 종료 일시
   */
  eventLogoExpiredTime: '2025-12-31 23:59:59',

  // 배포 환경
  mode: process.env.NODE_ENV,

  // 상용 배포 여부
  isProduction: process.env.NODE_ENV === 'production',

  axios: {},
  
  hiClass: {},
  
  log: {},

  classSort: {
    open: false
  },

  isClassCreatedNew: false,

  // 마케팅 동의 팝업
  isShowMarketingConsentPopup: false,
  // 홈 팝업 유무 체크
  hasWebHomePopup: true,

  profileImageBgColor: [
    '#70CAFF', '#32368D', '#00B3C6', '#3DB15C', '#9BCB16',
    '#4ECB71', '#4ECBB4', '#FFBF5C', '#F2CB3F','#F88789',
    '#E952BC', '#DD742D', '#754FD5', '#64493D', '#3A3A3A'
  ]
};

firebaseAnalytics.setInHouse(!!(state.isDevelopmentUI || state.isStageUI));

export default new Vuex.Store({
  state: state,
  modules: {
    storeHitalk: storeHitalk,
    storeEditor: storeEditor,
    storeWorksheet: storeWorksheet,
    storeHome: storeHome,
    storeSchool: storeSchool,
    storeMyBoard: storeMyBoard,
    storeSurvey: storeSurvey,
    storeBoard: storeBoard,
    storeClazzes: storeClazzes,
    storeBehavior: storeBehavior,
    storeImageEditor: storeImageEditor,
    storeClazzTag: storeClazzTag
  },
  getters: {
    CONSTANTS: state => state.constants,
    getField,
    
    isMobile: state => {
      return state.isMobileObj ? state.isMobileObj.any : false
    },
    
    isCurUserTypeTeacher: (state) => {
      return state.user && state.user.userType === state.constants.USER_TYPE.TEACHER
    },
    isCurUserTypeParents: (state) => {
      return state.user && state.user.userType === state.constants.USER_TYPE.PARENTS
    },
    isCurUserTypeStudent: (state) => {
      return state.user && state.user.userType === state.constants.USER_TYPE.STUDENT
    },
    isCurUserTempStudent: (state) => {
      return state.user
        && state.user.userType === state.constants.USER_TYPE.STUDENT
        && state.user.userSns === state.constants.USER_SNS.HICLASS
    },
  
    isAvailableClazzHomeworkSubmit: (state, getters) => payload => {
      const isCurUserStudent = state.user.userType === getters.CONSTANTS.USER_TYPE.STUDENT
      const board = payload.board

      if (isCurUserStudent) {
        return board.isWriteStudent
      } else {
        return board.isWriteParents
      }
    },

    isExpired: state => payload => {
      const expiredTime = moment(payload.expiredTime)
      const overSeconds = moment().diff(expiredTime, 'seconds')
      const isExpired = overSeconds >= 0
      state.log.debug('overSeconds', overSeconds, 'isExpired', isExpired)
      return isExpired
    },

    isShowFullScreenContent: state => {
      return state.curClazzHomework.status.isOpen
    },

    getUserTypeNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.USER_TYPE.find(item => item.code === params.code)

        return findObj.name || '?'
      } catch (e) {
        return '?'
      }
    },
    getPostTypeNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.POST_TYPE.find(item => item.code === params.code)
        const findObj2 = findObj.arr.find(item2 => item2.type === params.type)

        return findObj2.name || '?'
      } catch (e) {
        return '?'
      }
    },
    getApplyTypeNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.CLASS_APPLY.applyType.find(item => item.code === params.code)
        return findObj.name || '?'
      } catch (e) {
        return '?'
      }
    },
    getApplyStatusNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.CLASS_APPLY.applyStatus.find(item => item.code === params.code)
        return findObj.name || '?'
      } catch (e) {
        return '?'
      }
    },
    getParentTypeNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.CLASS_APPLY.parentType.find(item => item.code === params.code)
        return findObj.name || '?'
      } catch (e) {
        return '?'
      }
    },
    getLeaderTypeNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.CLASS_APPLY.leaderType.find(item => item.code === params.code)
        return findObj.name || '?'
      } catch (e) {
        return '?'
      }
    },
  
    getSheetApplyTypeNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.WORKSHEET_APPLY.applyType.find(item => item.code === params.code)
        return findObj.name || '?'
      } catch (e) {
        return '?'
      }
    },
    
    getSheetApplyTypeObjByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.WORKSHEET_APPLY.applyType.find(item => item.code === params.code)
        return findObj || '?'
      } catch (e) {
        return '?'
      }
    },
  
    getSheetStatusNameByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.WORKSHEET_APPLY.sheetStatus.find(item => item.code === params.code)
        return findObj.name || '?'
      } catch (e) {
        return '?'
      }
    },
  
    getSheetStatusClassByCode: (state) => (params) => {
      try {
        const findObj = state.$constants.WORKSHEET_APPLY.sheetStatus.find(item => item.code === params.code)
        return findObj.class || '?'
      } catch (e) {
        return '?'
      }
    },

    getIsFixed: (state) => (/* params */) => {
      const CLASS_TITLE_H = 166
      const st = state.curWindow.scrollTop
      const sl = state.curWindow.scrollLeft
  
      if (st === 0)
        return false

      const isFixed = st > CLASS_TITLE_H || false
      const nodes = document.querySelectorAll('.total-lnb-wrap, .school-class-cont-right-inner')

      for (const node of nodes) {
        const parent = node.parentNode

        // 부모요소 절대좌표 Y값 구하기
        const absoluteLeft = window.pageXOffset + parent.getBoundingClientRect().left
        node.style.left = isFixed ? absoluteLeft - sl + 'px' : ''
      }

      return isFixed
    },
  
    // 현재 클래스의 내 구독정보 찾기
    getCurClassMySubscribeView: (state) => (params) => {
      return state.clazzSubscribeViews.find(item => item.classId === params.classId) || {}
    },
  
    // 접근 가능한 클래스 구독정보 (홈)
    getHomeClazzMySubscribeView: (state) => {
      return state.clazzSubscribeViews.filter(item => item.classStatus === 'ACTIVATE' && item.memberStatus === 'ACCEPT') || []
    },
    // 접근 가능한 클래스 구독정보. 비활성화된 클래스 포함 (홈)
    getHomeClazzMySubscribeViewAll: (state) => {
      return state.clazzSubscribeViews.filter(item => item.memberStatus === 'ACCEPT') || []
    },
    // 접근 가능한 학교 구독정보 (홈)
    getHomeSchoolMySubscribeView: (state) => {
      return state.schoolSubscribeViews.filter(item => item.schoolStatus === 'ACTIVATE') || []
    },
    // 클래스 또는 학교 구독정보가 있음
    isSubscriptionExists: (state) => {
      const subscribeClazzes = state.clazzSubscribeViews.filter(item => item.classStatus === 'ACTIVATE' && item.memberStatus === 'ACCEPT') || []
      const subscribeSchools = state.schoolSubscribeViews.filter(item => item.schoolStatus === 'ACTIVATE') || []
      return subscribeClazzes.length > 0 || subscribeSchools.length > 0
    },
    // 클래스 구독정보가 없는 임시 학생 (학교 검색 권한 없음)
    isEmptyClassSubscriptionAndTempStudent: (state, getters) => {
      const subscribeClazzes = state.clazzSubscribeViews.filter(item => item.classStatus === 'ACTIVATE' && item.memberStatus === 'ACCEPT') || []
      return subscribeClazzes.length === 0 && getters.isCurUserTempStudent
    },
  
    /**
     * [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
     * @returns {function(*): *[]}
     */
    shuffle: (/*state*/) => payload => {
      const candidate = payload.array
      const shuffle = [];
      for (let i = candidate.length; i > 0; i--){
        const random = Math.floor(Math.random() * i);
        const spliceArray = candidate.splice(random, 1);
        const value = spliceArray[0];
        shuffle.push(value);
      }
      return shuffle
    },
  
    curUserType: (state) => {
      return state.user.userType
    },
  
    getUserNameByWriteUser: () => params => {
      try {
        const writeUser = params.writeUser
        const isClassPost = params.isClassPost
        
        const memberRole = writeUser.memberRole
        const memberChildName = writeUser.memberChildName
        const userType = writeUser.userType
        
        const isStudent = userType === 'STUDENT'
        const isUnSubscribeUser = !memberRole
        const isDeactivateUser = isUnSubscribeUser
            && (writeUser.userName || writeUser.user.userName) === 'unknown'
        
        const deactivateUserStr = i18n.t('main.unknown.user.name')
        let userName = isDeactivateUser ? deactivateUserStr : writeUser.userName
  
        if (isClassPost) {
          switch (memberRole) {
            // 클래스 관리자 (선생님)
            case 'OWNER':
            case 'MANAGER': {
              userName += ' 선생님'
              break
            }
            // 클래스 구독자 (학부모, 학생)
            case 'MEMBER': {
              userName += ' ('
              userName += isUnSubscribeUser ? deactivateUserStr : `${memberChildName} `
              userName += isStudent ? '학생' : '학부모'
              userName += ')'
              break
            }
            default: {
              // 클래스 탈퇴회원
              if (!isDeactivateUser && isUnSubscribeUser)
                userName = deactivateUserStr
            }
          }
        }
  
        return userName
        
      } catch (e) {
        return ''
      }
    },
    getUserNameByWriteUserHomeWork: () => params => {
      try {
        const writeUser = params.writeUser
        const isClassPost = params.isClassPost
        
        const memberRole = writeUser.memberRole
        const memberChildName = writeUser.memberChildName
        const userType = writeUser.userType
        
        const isStudent = userType === 'STUDENT'
        const isUnSubscribeUser = !memberRole
        const isDeactivateUser = isUnSubscribeUser
            && (writeUser.userName) === 'unknown'
        
        const deactivateUserStr = i18n.t('main.unknown.user.name')
        let userName = ""
        
        if (isClassPost) {
          switch (memberRole) {
            // 클래스 관리자 (선생님)
            case 'OWNER':
            case 'MANAGER': {
              userName += ' 선생님'
              break
            }
            // 클래스 구독자 (학부모, 학생)
            case 'MEMBER': { 
              userName += isUnSubscribeUser ? deactivateUserStr : `${memberChildName} `
              userName += isStudent ? '학생' : '학부모' 
              break
            }
            default: {
              // 클래스 탈퇴회원
              // if (!isDeactivateUser && isUnSubscribeUser)
              if (isUnSubscribeUser)
                userName = deactivateUserStr
            }
          }
        }

        if(!isUnSubscribeUser) {
          userName += " ("
          userName += isDeactivateUser ? deactivateUserStr : writeUser.userName
          userName += ")"
        }
        
        return userName
        
      } catch (e) {
        return ''
      }
    },

    getUserNameByClazzSubscribeView: () => params => {
      try {
        const clazzSubscribeView = params.clazzSubscribeView

        const memberRole = clazzSubscribeView.memberRole
        const memberChildName = clazzSubscribeView.memberChildName
        const userType = clazzSubscribeView.userType
        const userName = clazzSubscribeView.userName || clazzSubscribeView.user.userName

        const isStudent = userType === 'STUDENT'
        const isUnSubscribeUser = !memberRole
        const isDeactivateUser = isUnSubscribeUser && userName === 'unknown'

        const deactivateUserStr = i18n.t('main.unknown.user.name')
        let rtnUserName = isUnSubscribeUser || isDeactivateUser
            ? deactivateUserStr
            : memberChildName || userName

        switch (memberRole) {
            // 클래스 관리자 (선생님)
          case 'OWNER':
          case 'MANAGER': {
            rtnUserName += ' 선생님'
            break
          }
            // 클래스 구독자 (학부모, 학생)
          case 'MEMBER': {
            rtnUserName += ' '
            rtnUserName += isStudent ? '학생' : '학부모'
            rtnUserName += ` (${userName})`
            break
          }
        }

        return rtnUserName

      } catch (e) {
        return ''
      }
    },

    getSubscribeClassNameByClassId: (state) => classId => {
      try {
        const foundItem = state.clazzSubscribeViews.find(clazzSubscribeView => {
          return clazzSubscribeView.classId === classId
        })
        return foundItem ? foundItem.className : ''

      } catch (e) {
        return ''
      }
    },

    getBannerHitalkMainTitle: (state) => {
      return state.banner.HITALK_MAIN_TITLE || []
    },

    getBannerHitalkMainCard: (state) => {
      return state.banner.HITALK_MAIN_CARD || []
    },

    getBannerHitalkMainBannerA: (state) => {
      return state.banner.HITALK_MAIN_BANNER_A || []
    },

    getBannerHitalkRoomList: (state) => {
      return state.banner.HITALK_ROOM_LIST || []
    },

    /**
     * curClass getters
     */
    curClassId: state => state.curClassItem.currentId || null,
    curSchoolId: state => state.curClassItem.school ? state.curClassItem.school.currentId : null,
    curClassName: state => state.curClassItem.className || null,
    curClassOwnerName: state => state.curClassItem.classOwner ? state.curClassItem.classOwner.userName : null,
    curClassImagePath: state => state.curClassItem.classImagePath || null,
    curClassSchoolType: state => state.curClassItem.school.schoolType || null,
    curClassClassName: state => state.curClassItem.className || null,
    isCurClassActivated: state => state.curClassItem.classStatus === 'ACTIVATE',
    isCurClassOwnerOrManager: state => {
      try {
        const classId = state.curClassItem.currentId
        const curClassSubscribeView = state.clazzSubscribeViews.find(clazzSubscribeView => clazzSubscribeView.classId === classId)
        if (curClassSubscribeView) {
          const memberRole = curClassSubscribeView.memberRole
          return !!(memberRole === 'OWNER' || memberRole === 'MANAGER')
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    },

    /**
     * isManager getters
     */

    existsClassManagerByClassId: state => ({ classId }) => {
      try {
        const curClassSubscribeView = state.clazzSubscribeViews.find(clazzSubscribeView => {
         return clazzSubscribeView.classId === classId
        })
        if (curClassSubscribeView) {
          const memberRole = curClassSubscribeView.memberRole
          return !!(memberRole === 'OWNER' || memberRole === 'MANAGER')
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    },

    getRecentPrivacyRecord: (state) => {
      return state.termsRecord.privacyRecord[state.termsRecord.privacyRecord.length-1]
    },
    getRecentServiceRecord: (state) => {
      return state.termsRecord.serviceRecord[state.termsRecord.serviceRecord.length-1]
    },
    getRecentPrivacyPreviewRecord: (state) => {
      return state.termsRecord.privacyPreviewRecord[state.termsRecord.privacyPreviewRecord.length-1]
    },
    getRecentPrivacyPreviewRecordByUserType: state => (userType) => {
      return state.termsRecord.privacyPreviewRecordByUserType[userType][state.termsRecord.privacyPreviewRecordByUserType[userType].length-1]
    },
    getRecentPrivacyUseDetailRecord: (state) => {
      return state.termsRecord.privacyUseDetailRecord[state.termsRecord.privacyUseDetailRecord.length-1]
    },
    getRecentTextRecord: (state) => {
      return state.termsRecord.textRecord[state.termsRecord.textRecord.length - 1]
    }

  },
  actions: {
    logout: () => {
      router.push('/logout', () => {})
    },
    allDeviceLogout: async ({state}) => {
      const uuid = localStorage.getItem('uuid')
      try {
        await state.axios({
          method: 'POST',
          url: `users/${uuid}/logout/all`
        })
      } catch(error) {
        state.log.debug('indexLoginCheck() error', error)
      }
    },
    isBlockUserCheck: async ({state}, isAlert = true) => {
      const uuid = localStorage.getItem('uuid')
      if(!uuid) return false
      
      try {
        const res = await state.axios({
          method: 'GET',
          url: `users/${uuid}/logout`
        })
        if(isAlert) {
          state.isLogout = res.data.isLogout
        }
        const current = moment()
        const logoutTime = moment(res.data.logoutAt)
        
        return res.data.isLogout && current.diff(logoutTime, 'seconds') < 0
      } catch(error) {
        state.log.debug('indexLoginCheck() error', error)
        return false
      }
    },
    isAllDeviceLogout: async ({state}, isAlert = true) => {
      const uuid = localStorage.getItem('uuid')
      if(!uuid) return false
      
      try {
        const res = await state.axios({
          method: 'GET',
          url: `users/${uuid}/logout`
        })
        if(isAlert) {
          state.isLogout = res.data.isLogout
        }
        return res.data.isLogout
      } catch(error) {
        state.log.debug('indexLoginCheck() error', error)
        return false
      }
    },
    indexLoginCheck: async ({commit, state, dispatch}) => {
      const uuid = localStorage.getItem('uuid')
  
      if (uuid === null || uuid === undefined || uuid === 'undefined' || !uuid) {
        authentication.clear()
        state.isNewTabLoading = false
        state.isLoadedIndex = true
        return false
      }
  
      try {
        const res = await state.axios({
          method: 'get',
          url: '/users/' + uuid
        })
        state.log.debug('indexLoginCheck() res', res)
        const userInfo = res.data
    
        if (userInfo.userStatus === 'ACTIVATE') {
          commit('setUserUri', userInfo._links.self.href)
          commit('setUserType', userInfo.userType)
          commit('setUser', userInfo)

          try {
            const isAgreed = await getDailyUserConsentsAgreement();
            if (isAgreed === false) {
              router.push('/login/agreement', () => {})
            } else {
              router.push('/main', () => {})
            }
          } catch (e) {
            router.push('/main', () => {})
          }
        } else if (userInfo.userStatus === 'DEACTIVATE') {
          state.isNewTabLoading = false
          state.isLoadedIndex = true
          await state.hiClass.alert('탈퇴된 계정입니다.')
          await dispatch('logout')
        }
      } catch (error) {
        state.log.debug('indexLoginCheck() error', error)
        authentication.clear()
        state.isLoadedIndex = true
      } finally {
        state.isNewTabLoading = false
      }
    },
    
    /**
     * 해당 게시물 클래스의 관리자 여부 확인
     */
    isManagedPost: ({/*commit,*/state, rootState}, { clazz, classId } ) => {
      let flag = false
  
      try {
        const classId = clazz.currentId || classId || null
        const managedClasses = state.clazzSubscribeViews.filter(d => {
          return (
            d.classId === classId &&
            (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER')
          )
        })
        if (managedClasses.length > 0) flag = true
      } catch (err) {
        rootState.log.warn(`isManagedPost() err => `, err)
      }
      return flag
    },
    reloadUser: ({commit, state}, /*payload*/) => {
      state.axios({
        method: 'get',
        url: `/users/${localStorage.uuid}`
      }).then(res => {
        commit('setUser', res.data)
      }).catch(error => {
        state.log.error("reloadUser error => ", error)
      })
    },
    openAttachFilesViewer: ({commit, /*state*/}, payload) => {
      if (payload.contentType
          && (payload.contentType.startsWith('image') || payload.contentType.startsWith('video'))
      ) {
        commit('setImageView', {
          isOpen: true,
          post: payload.post,
          items: payload.items,
          index: payload.index || 0
        })
      } else {
        commit('setDocView', {
          isOpen: true,
          item: payload.item
        })
      }
    },
    openPostDetailByPostId: ({state, dispatch}, payload) => {
      const postId = payload.postId
      if (postId) {
        state.axios({
          method: 'GET',
          url: `/posts/${postId}`
        })
          .then(res => {
            const post = res.data
            switch (post.postType) {
              case 'ALARM_PLUS':
                dispatch('openAlarmPlusDetailPop', { post })
                break
              default:
                dispatch('openCommonPostDetailPop', { post })
            }
          })
          .catch(err => {
            ({
              428: () => state.hiClass.alert('접근권한이 없는 게시글입니다.'),
            }[err.response.status] || (() => state.hiClass.alert(err, 'error')))()
          })
      } else {
        state.hiClass.alert('연결된 링크가 잘못되었습니다.', 'warning')
      }
    },
    openInternalWebLink: ({/*commit,*/ state}, payload) => {
      try {
        const linkType = payload.linkType
        const url = new URL(payload.contents)
  
        state.log.debug(`url.host => ${url.host}, url.hostname => ${url.hostname}`)
        const isInternalLink = url.hostname.includes('hiclass.net') || url.hostname.includes('localhost')
  
        if (linkType === 'INTERNAL') {
          isInternalLink
            ? router.push(url.pathname, () => {})
            : location.href = url.href
        } else {
          state.hiClass.alert('연결된 링크가 잘못되었습니다.', 'warning')
        }
        
      } catch (e) {
        location.href = payload.contents
      }
    },
    openExternalWebLink: ({/*commit,*/ state}, payload) => {
      try {
        const linkType = payload.linkType
        const url = new URL(payload.contents)
  
        if (linkType === 'EXTERNAL') {
          window.open(url.href)
        } else {
          state.hiClass.alert('연결된 링크가 잘못되었습니다.', 'warning')
        }
        
      } catch (e) {
        window.open(payload.contents)
      }
    },
    openCommonPostDetailPop: ({ commit }, payload) => {
      const post = payload.post
      const obj = {
        item: post,
        list: [post],
        totalElements: 1,
        pagePerSize: 1
      }

      commit('setItemDetailObj', obj)
      commit('setIsShowDetailPostLayer', true)
    },
    openAlarmPlusDetailPop: ({ state, commit }, payload) => {
      const post = payload.post

      if (post.postType !== 'ALARM_PLUS')
        return false

      const eLetterId = post.alarmPlusId
      const userId = state.user.currentId
      const detailObj = { eLetterId, userId, post }

      commit('setAlarmPlusDetail', detailObj)
    },
    openHitalkPopup: ({state, commit, dispatch}, payload) => {
      // 하이톡 선택 시 읽지 않음 표시 즉시 초기화
      dispatch('initChatUncheckedMessage')
      
      state.hitalkInitData.params = payload && payload.params ? payload.params : {}
      commit('setOpenPopup', state.hitalkInitData)
    },
    openBehaviorRecordPopup: ({state, commit}, params) => {
      state.studentActionRecordWindowInfomation.params = params ? params : {}
      commit('setOpenPopup', state.studentActionRecordWindowInfomation)
    },
    openClazzApplyRejectList: ({/*commit,*/ state}, payload) => {
      state.clazzApplyRejectList.clazzApplyId = payload.model.currentId
      state.clazzApplyRejectList.mode = payload.mode
      state.clazzApplyRejectList.isManager = payload.isManager
      state.clazzApplyRejectList.isOpen = true
    },
    initClazzApplyRejectList: ({/*commit,*/ state}, /*payload*/) => {
      state.clazzApplyRejectList.clazzApplyId = null
      state.clazzApplyRejectList.mode = null
      state.clazzApplyRejectList.isManager = false
      state.clazzApplyRejectList.isOpen = false
    },
    alarmPlusTeacherSubscribeCheck: ({commit, state}, /*payload*/) => {
      const userId = state.user.currentId
      return state.axios({
        method: 'get',
        url: `/educationLetters/teacherSubscribeCheck/${userId}`
      }).then(res => {
        commit('setAlarmPlusUsedIsTeacherSubscribe', res.data)
      }).catch(error => {
        commit('setAlarmPlusUsedIsTeacherSubscribe', false)
        state.log.error("alarmPlusTeacherSubscribeCheck error => ", error)
      })
    },
    initChatUncheckedMessage: ({commit, /*state*/}, /*payload*/) => {
      const chatUncheckedMessage = {
        receiver: null,
        timestamp: null,
        count: 0
      }
      commit('setChatUncheckedMessage', chatUncheckedMessage)
    },
    openTermsView: ({commit, /*state*/}, payload) => {
      const termsView = {
        isOpen: true,
        layerType: payload.layerType
      }
      termsView.userType = payload.userType ? payload.userType : ''
      // optional modal class options
      termsView.modalClass = payload.modalClass ? payload.modalClass : ''
      commit('setTermsView', termsView)
    },
    closeTermsView: ({commit, /*state*/}, /*payload*/) => {
      const termsView = {
        isOpen: false,
        layerType: '',
        userType: ''
      }
      commit('setTermsView', termsView)
    },
    initCurrentTimestamp: ({commit, /*state*/}, /*payload*/) => {
      const INTERVAL_TIME = 1000 * 10

      commit('setStartTimestamp', moment().valueOf())

      setInterval(() => {
        commit('setCurrentTimestamp', moment().valueOf())
      }, INTERVAL_TIME)

    },
  
    initInfiniteScroll: ({commit, /*state*/}, /*payload*/) => {
      const infiniteScrollObject = {
        isBusy: false,
        isListEnd: false,
        page: 0,
        size: 20
      }
      commit('setInfiniteScroll', infiniteScrollObject)
    },
  
    initCalenderHolidays: ({dispatch}, payload) => {
      const calenderHolidays = localStorage.getItem('calenderHolidays')
      
      if (!calenderHolidays) {
        dispatch('getCalenderHolidays', { year: payload.year })
        
      } else {
        
        try {
          const list = JSON.parse(calenderHolidays)
          
          // prevYear 공휴일 정보가 없는 경우
          if (list[0].year !== payload.year - 1)
            dispatch('getCalenderHolidays', { year: payload.year })
          
        } catch (error) {
          dispatch('getCalenderHolidays', { year: payload.year })
        }
        
      }
    },
  
    getCalenderHolidays: ({rootState}, payload) => {
      const year = payload.year
  
      if (year !== undefined && year !== null && year !== '') {
        const prevYear = year - 1
        const nextYear = year + 1
    
        const params = {
          _year: [prevYear, nextYear],
          size: 1000,
          sort: 'year,month,day,asc'
        }
  
        rootState.hiClass.calenderHolidays
          .search(params)
          .then(res => {
            rootState.hiClass.calenderHolidays.setLocalStorageItem(res)
          })
          .catch(() => {
            localStorage.removeItem('calenderHolidays')
          })
      }
      
    },
  
    toggleSheetStatus: ({commit, state}, payload) => {
      if (!state.isRadioToggleLoading) {
        commit('setIsRadioToggleLoading', true)
        const prevData = payload.sheetStatus
    
        switch (payload.sheetStatus) {
          case 'USED':
            payload.sheetStatus = 'NOT_USED'
            break
          case 'NOT_USED':
            payload.sheetStatus = 'USED'
            break
        }
    
        const data = {sheetStatus: payload.sheetStatus}
        const url = `/sheetInfos/${payload.parentId}/${payload.sheetId}`
        
        state.hiClass.sheetInfos.updateSheetStatus(data, url)
          .then(() => {
            switch (payload.sheetStatus) {
              case 'NOT_USED':
                state.hiClass.alert('미사용시 학생 또는 학부모가 해당 신청서를<br/>작성할 수 없습니다.<br/>미사용으로 변경하시겠습니까?', 'info')
                break
              case 'USED':
                state.hiClass.alert('신청서 제출 대상을 확인해 주세요.<br/><span style="color: #EC1F2D;">주의! 학부모 작성 필요시<br/>제출대상에 \'학부모\'를 선택해주세요.</span>', 'info')
                break
            }
          })
          .catch(err => {
            state.hiClass.alert(err)
              .then(() => {
                payload.sheetStatus = prevData
              })
          })
          .finally(() => {
            commit('setIsRadioToggleLoading', false)
          })
      }
    },
  
    toggleSheetUsedByType: ({commit, state}, payload) => {
      if (!state.isRadioToggleLoading) {
        commit('setIsRadioToggleLoading', true)
  
        const resource = payload.resource
        const type = payload.type
        const value = payload.value
      
        const data = {[type]: value}
        const url = `/sheetInfos/${resource.parentId}/${resource.sheetId}`
      
        state.hiClass.sheetInfos.updateUsed(data, url)
          .catch(err => {
            state.hiClass.alert(err)
          })
          .finally(() => {
            commit('setIsRadioToggleLoading', false)
          })
      }
    },
  
    download: ({/*commit,*/ state}, payload) => {
      const src = payload.src
      const name = payload.name
  
      // NOTE: use pure axios library, not used interceptor and idToken
      state.downloadStatus = {...state.downloadStatus, [src]: {isDownloading: true, percentCompleted: 0}}
      return axios({
        method: 'GET',
        url: src,
        responseType: 'blob',
        headers: '',
        onDownloadProgress: (progressEvent) => {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted < 100 ) {
            state.downloadStatus = {...state.downloadStatus, [src]: {...state.downloadStatus[src], percentCompleted} }
          } else {
            const newObj = {...state.downloadStatus}
            delete newObj[src]
            state.downloadStatus = {...newObj}
          }
        }
      })
        .then(res => {
          const blob = new Blob([res.data], { type: 'application/octet-stream' })
          downloadjs(blob, name, "text/plain")
          state.log.debug(res)
        })
    },
    largeFileDownload: async ({state}, payload) => {
      state.hitalkDownloadStatus = {...state.hitalkDownloadStatus, [payload.src]: true}
      return fetch(payload.src, {
        method: 'GET',
        responseType: 'blob',
        cache: 'no-cache'
      })
      .then(async res => {
        if(res.ok) {
          const blob = await res.blob()
          const href = window.URL.createObjectURL(blob)
          const download = payload.name
          const link = Object.assign(document.createElement('a'), {
            href,
            style: 'display:none',
            download
          })
          document.body.appendChild(link)
          link.click()
          URL.revokeObjectURL(link)
          link.remove()
          const newObj = {...state.hitalkDownloadStatus}
          delete newObj[payload.src]
          state.hitalkDownloadStatus = {...newObj}
          return res
        } else {
          return res
        }
      })  
    },
    triggerAnalyticsLogEvent: ({state}, payload) => {
      if (payload && payload.code) {
        try {
          const code = payload.code
          const values = {
            userTypeStr: state.user && state.user.userType ? i18n.t(state.user.userType.toLowerCase()) : '',
          }
          for (const [key, value] of Object.entries(payload)) {
            if (key !== 'code')
              values[key] = value
          }

          const eventName = i18n.t(code, values).replace(/' '/gi, '').replace(/'__'/gi, '_')

          // 개발, 스테이지 서버에서 GA code 확인용
          state.log.info('triggerAnalyticsLogEvent code:', code, '/', 'eventName:', eventName, 'params', payload.params)

          // 상용 서버에 배포된 경우에만 GA logEvent 처리
          if (state.isProduction && state.isProductionUI)
            firebaseAnalytics.logEvent(eventName, payload.params)
          
        } catch (e) {
          state.log.error(e)
        }

      }
    },
    
    downloadVideoFile: async ({commit, state, dispatch}, payload) => {
      const file = payload.file
      const fileSrcArr = [
        file.fileOriginalPath,
        file.fileTranscodePath
      ]
      let fileSrcIndex = 0
      const params = {
        src: fileSrcArr[fileSrcIndex],
        name: file.fileName
      }
      let retryCount = 1
      
      dispatch('download', params)
        .catch(err => {
          const newObj = {...state.downloadStatus}
          delete newObj[params.src]
          state.downloadStatus = {...newObj}
          state.log.warn(err.response.status)
          let retryFlag = err.response.status === 404
          if (!retryFlag)
            state.hiClass.alert('파일 다운로드를 실패했습니다.<br>잠시 후 다시 시도해주세요.', 'error')
          
          return retryFlag
        })
        .then(retryFlag => {
          state.log.debug('retryFlag:', retryFlag)
          if (retryFlag && retryCount > 0) {
            retryCount--
            fileSrcIndex++
            params.src = fileSrcArr[fileSrcIndex]
    
            dispatch('download', params)
              .catch(() => {
                const newObj = {...state.downloadStatus}
                delete newObj[params.src]
                state.downloadStatus = {...newObj}
                state.hiClass.alert('해당 파일이 삭제되어 파일 다운로드를 실패했습니다.', 'error')
              })
          }
        })
    },
    downloadHitalkVideoFile: ({/*commit,*/ state, dispatch}, payload) => {
      const file = payload.file
      const fileSrcArr = file.fileTranscodePath ? [
        file.fileTranscodePath,
        file.fileOriginalPath
      ] : [
        file.fileOriginalPath,
        file.fileTranscodePath
      ]
      let fileSrcIndex = 0
      const params = {
        src: fileSrcArr[fileSrcIndex],
        name: file.fileName
      }
      let retryCount = 1
      dispatch('largeFileDownload', params)
        .then(err => {
          const newObj = {...state.hitalkDownloadStatus}
          delete newObj[params.src]
          state.hitalkDownloadStatus = {...newObj}
      
          let retryFlag = !err.ok
          if (!retryFlag && retryCount === 0)
            state.hiClass.alert('파일 다운로드를 실패했습니다.<br>잠시 후 다시 시도해주세요.', 'error')
          
          return retryFlag
        })
        .then(retryFlag => {
          if (retryFlag && retryCount > 0) {
            retryCount--
            fileSrcIndex++
            params.src = fileSrcArr[fileSrcIndex]
    
            dispatch('largeFileDownload', params)
              .then((error) => {
                //const newObj = {...state.downloadStatus}
                //delete newObj[params.src]
                //state.downloadStatus = {...newObj}
                const newObj = {...state.hitalkDownloadStatus}
                delete newObj[params.src]
                state.hitalkDownloadStatus = {...newObj}
                if(!error.ok) {
                  state.hiClass.alert('해당 파일이 삭제되어 파일 다운로드를 실패했습니다.', 'error')
                }
              })
          }
        })
    },
    toastIsMobile: ({ state, getters }) => {
      setTimeout(() => {
        state.hiClass.alert('<div style="text-align: left;">'
          + ' <span style="color: orangered">- getters.isMobile: ' + getters.isMobile + '</span><br><br>'
          + ' - state.isMobileObj.apple.phone: ' + state.isMobileObj.apple.phone + '<br>'
          + ' - state.isMobileObj.apple.tablet: ' + state.isMobileObj.apple.tablet + '<br>'
          + ' - state.isMobileObj.apple.universal: ' + state.isMobileObj.apple.universal + '<br>'
          + ' - state.isMobileObj.apple.device: ' + state.isMobileObj.apple.device + '<br><br>'
          + ' - navigator.userAgent.toString(): ' + navigator.userAgent.toString() + '<br><br>'
          + ' - navigator.maxTouchPoints: ' + navigator.maxTouchPoints + '<br>'
          + ' - navigator.platform: ' + navigator.platform
          + ' </div>'
        )
      }, 1000)
      
    },
    
    // eslint-disable-next-line no-empty-pattern
    arrayInObjectSort: ({}, payload) => {
      const array = payload.array
      const sortingTargets = payload.sortingTargets
      
      array.sort((a, b) => {
        for (const sortingTarget of sortingTargets) {
          /**
           * Safely accessing deeply nested values
           * https://www.realpythonproject.com/how-to-safely-work-with-nested-objects-in-javascript/
           * @type {Exclude<object[any|string|string], undefined> | string}
           */
          const sortingTargetA = lodashGet(a, sortingTarget, 'undefined')
          const sortingTargetB = lodashGet(b, sortingTarget, 'undefined')

          // 내림차순
          const desc = sortingTarget.includes(',desc')

          if (sortingTargetA < sortingTargetB) return desc ? 1 : -1
          if (sortingTargetA > sortingTargetB) return desc ? -1 : 1
        }
        return 0
      })
    },
  
    /**
     * 사용자 접속 이력 등록 (로그인 or 비활성화 -> 활성화)
     * @param state
     * @param payload { Object } { userUri: ... }
     */
    createUserLogs: ({ state }, payload) =>  {
      const paramUserUri = payload && payload.userUri ? payload.userUri : null
      const stateUserUri = state.user && state.user._links && state.user._links.self.href
        ? state.user._links.self.href
        : null
      const userUri = paramUserUri || stateUserUri
      
      if (userUri && !state.isUserLogLoading) {
        state.isUserLogLoading = true
        state.axios({
          method: 'POST',
          url: '/userLogs',
          data: {
            deviceInfo: 'PC',
            logType: 'LOGIN',
            user: userUri
          }
        })
          // .then(res => state.log.debug("createUserLogs res => ", res))
          // .catch(err => state.log.warn("createUserLogs error => ", err))
          .finally(() => state.isUserLogLoading = false)
      }
    },
  
    /**
     * 웹브라우저 활성화 체크 이벤트 등록
     * @param state
     * @param dispatch
     */
    initVisibilityChange: ({ state, dispatch, commit, rootState }) => {
      // Set the name of the hidden property and the change event for visibility
      let hidden, visibilityChange
      if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden"
        visibilityChange = "visibilitychange"
        
      } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden"
        visibilityChange = "msvisibilitychange"
        
      } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden"
        visibilityChange = "webkitvisibilitychange"
      }
  
      // 웹브라우저 활성화 체크 handler
      const handleVisibilityChange = async () => {
        state.isVisibleWindow = !document[hidden]

        // state.log.debug('state.isVisibleWindow: ', state.isVisibleWindow)
        if (state.isVisibleWindow) {
          dispatch('createUserLogs')
          const res = await dispatch('isAllDeviceLogout')
          commit('storeHitalk/setIsLogout', res)
        }
        
        if (!state.isVisibleWindow && router.currentRoute.path.includes('/hitalk')) {
            dispatch('storeHitalk/pausePushEventListenerAccordingToUserTime')
        }

        if (state.isVisibleWindow && router.currentRoute.path.includes('/hitalk')) {
          // 하이톡 창 복원 시 웹소켓 재연결
          dispatch('storeHitalk/validateStompConnection')
          dispatch('storeHitalk/callChatRooms')
          dispatch('storeHitalk/callChatUserMessageCount')
          
          if(rootState.storeHitalk.connectRoomItem && rootState.storeHitalk.unReadChatMessages) {
            const memberRole = (rootState.storeHitalk.connectRoomMembers.find(o => o.userId === localStorage.uuid) || {role: 'MEMBER'}).role
            const userTime = await dispatch('storeHitalk/callUserTime', {userId: localStorage.uuid, userType: rootState.storeHitalk.loginUser.userType, memberRole, isSetUserTime: false})
            const isReadMulti = rootState.storeHitalk.connectRoomItem.roomType === 'GROUP'
              ? true 
              : userTime.isUseChat && userTime.isChatTime && !userTime.isHoliday
            
            if(isReadMulti && rootState.storeHitalk.unReadChatMessages.length > 0) {
              dispatch('storeHitalk/sendStompReadMultiMessage', { message: rootState.storeHitalk.unReadChatMessages.pop() })
            }
          }
          dispatch('storeHitalk/restorePushEventListener')
        }
      }

      // Warn if the browser doesn't support addEventListener or the Page Visibility API
      if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
        state.log.info("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.")
      } else {
        // Handle page visibility change
        document.addEventListener(visibilityChange, handleVisibilityChange, false)
      }
    },
    
    callClazzApplyConfirmPush: ({ state }, payload) => {
      const applyId = payload.applyId
      
      if (applyId) {
        state.axios({
          method: 'POST',
          url: `/clazzApplies/${applyId}/confirmPush`
        })
          .catch(err => state.log.warn('callClazzApplyConfirmPush err:', err))
      }
    },

    /**
     * postRemind
     * 클래스 게시물을 읽지 않은 특정 구성원에게 리마인드 알림을 보낸다.
     * @param state
     * @param payload postType, model
     * @returns {*}
     */
    callPostRemind: ({ state }, payload) => {
      const postType = payload.postType
          ? stringUtil.capitalizeFirstLetter(payload.postType.toLowerCase())
          : ''
      const model = payload.model

      return state.axios({
        method: 'POST',
        url: `/sendMessages/postRemind${postType}`,
        data: model
      })
        .catch(err => state.log.warn('callPostRemind err:', err))
    },

    /**
     * 학교양식 신청서 상세 진입 시 클래스 구독여부 확인
     * @param state
     * @param payload
     * @returns {boolean|Promise<T | void>}
     */
    callCheckCurUserClassSubscribe: ({ state }, payload) => {
      const classId = payload.classId
      const userId = payload.userId
      const goRouteMain = () => router.push('/main', () => {})

      if (!classId || !userId)
        return false

      return state.hiClass
        .getAcceptSubscribeClassByClassIdAndUserId({}, classId, userId)
        .then(clazzSubscribeViews => {
          if (clazzSubscribeViews.length === 0) {
            // 미구독 클래스인 경우
            state.hiClass.alert('미구독 클래스입니다.')
              .then(goRouteMain)
          }
        })
        .catch(goRouteMain)
    },

    callCheckCurUserWriteClassApply: ({ state, dispatch }, payload) => {
      const isParentApply =  payload.isParentApply
      const isStudentApply = payload.isStudentApply
      const memberRole = payload.memberRole
      const userType = payload.userType

      const goRouteApplyList = () => router.push(`/main/clazzes/${curClassId}/form/applyList`, () => {})

      if (!isParentApply) {
        if (userType === 'PARENTS' || userType === 'TEACHER' && memberRole === 'MEMBER') {
          dispatch('storeWorksheet/clearCurClazzApply')
          state.hiClass.alert('접근 권한이 없습니다.').then(goRouteApplyList)
        }
      }

      if (!isStudentApply) {
        if (userType === 'STUDENT') {
          dispatch('storeWorksheet/clearCurClazzApply')
          state.hiClass.alert('접근 권한이 없습니다.').then(goRouteApplyList)
        }
      }
    },

    callCheckCurUserReadClassApply: ({ state, dispatch }, payload) => {
      const applyUserId = payload.applyUserId
      const loginUserId = payload.loginUserId
      const memberRole = payload.memberRole
      const curClassId = payload.curClassId
      const goRouteApplyList = () => router.push(`/main/clazzes/${curClassId}/form/applyList`, () => {})

      if (loginUserId !== applyUserId && memberRole === 'MEMBER') {
        dispatch('storeWorksheet/clearCurClazzApply')
        state.hiClass.alert('접근 권한이 없습니다.').then(goRouteApplyList)
      }
    },

    /**
     * 단일 광고 수 증가
     * @param state
     * @param payload adId, type
     * @deprecated 다중 광고 수 증가 API 추가로 미사용. API 요청은 정상이지만 데이터가 쌓이지 않음
     */
    increaseAdCount: ({ state }, payload) => {
      const dateObj = moment()
      const adId = payload.adId
      const date = dateObj.format('YYYYMMDD')
      const hour = dateObj.hour()
      const type = payload.type
      const requestUrl = adURL + `/ad/${adId}/${date}/${hour}/${type}`

      if (adId && type) {
        state.axios({
          method: 'PATCH',
          url: requestUrl
        })
            .then(() => state.log.debug(adId, 'increaseAdCount success'))
            .catch(err => state.log.warn(adId, 'increaseAdCount error', err))
      }

    },

    /**
     * 다중 광고 수 증가
     * @param state
     * @param payload adIds, type
     */
    increaseAdsCount: ({ state }, payload) => {
      const dateObj = moment()
      const adId = payload.adIds[0]
      const adIds = payload.adIds
      const date = dateObj.format('YYYYMMDD')
      const hour = dateObj.hour()
      const type = payload.type
      const requestUrl = adURL + `/ads/${adId}/${date}/${hour}/${type}`

      if (adId && adIds && type) {
        state.axios({
          method: 'PATCH',
          url: requestUrl,
          data: { adIds }
        })
            .then(() => state.log.debug(adIds, 'increaseAdsCount success'))
            .catch(err => state.log.warn(adIds, 'increaseAdsCount error', err))
      }
    },

    increaseHelpFaqsReadCount: ({ state }, { faqId }) => {
      const requestUrl = `/helpFaqs/${faqId}/readCount`

      if (faqId) {
        state.axios({
          method: 'PATCH',
          url: requestUrl
        })
          .then(() => state.log.debug(faqId, 'increaseHelpFaqsReadCount success'))
          .catch(err => state.log.warn(faqId, 'increaseHelpFaqsReadCount error', err))
      }
    },

    increaseFileUploadCount: ({ state, dispatch }, { uploadLocation }) => {
      if (uploadLocation) {
        switch (uploadLocation) {
          case state.constants.UPLOAD_LOCATION.CLASS:
          case state.constants.UPLOAD_LOCATION.CLASS_COMMENT:
          case state.constants.UPLOAD_LOCATION.HITALK:
          case state.constants.UPLOAD_LOCATION.SURVEY: {
            const code = `analytics.upload.location.${uploadLocation.toLowerCase()}`
            dispatch('triggerAnalyticsLogEvent', { code })
            break
          }
        }
      }
    },

    /**
     * 애플리케이션의 global keyup 이벤트
     * @param state
     * @param event
     */
    initAppsKeyup: ({ state }, event) => {
      // 브라우저 input 자동완성 무시
      if (!event.keyCode) return false

      console.warn('initAppsKeyup', event)

      // CapsLock key 현재 상태 저장
      state.isOnCapsLock = event.getModifierState( "CapsLock" ) || false
    },

    /**
    callGetBannerList: ({state, commit}, appendParams) => {
      const curDate = moment().valueOf()
      const posted = [
        moment(curDate)
          .subtract(5, 'years')
          .valueOf(),
        curDate
      ]

      let params = {
        // postMains 추가 파라미터
        mode: 'BANNER',
        posted: posted,
        postType: 'BANNER',
        postStatus: 'COMPLETE',
        // -- postMains 추가 파라미터
        deviceType: 'WEB',
        // bannerType: 'BANNER',
        // positionType: [
        //   'WEB_BANNER_HOME_FEED',
        //   'WEB_BANNER_QUICK'
        //   'WEB_BANNER_LNB',
        //   'WEB_BANNER_RNB',
        // ],
        displayStatus: 'PROGRESSING',
        sort: 'positionOrderType,asc',
        size: 100
      }

      for (const [key, value] of Object.entries(appendParams))
        params[key] = value

      state.hiClass.postMains
        .search(params)
        .then(res => {
          let bannerByPositionType = {}

          res.data._embedded.postViews.map(item => {
            const positionType = item.positionType

            positionType in bannerByPositionType
              ? bannerByPositionType[positionType].push(item)
              : (bannerByPositionType[positionType] = [item])
          })

          for (const [key, value] of Object.entries(bannerByPositionType)) {
            const bannerObj = {
              positionType: key,
              list: value
            }
            commit('setBanner', bannerObj)
            commit('setBannerTimestamp', curDate)

            state.log.debug('SET BANNER KEY:', key)
          }
        })
        .finally(() => {
          commit('setBannerTimestamp', curDate)
        })
    },
     **/

    /**
     * 전체화면 전환 전 현재 스크롤 위치 저장
     * @param state
     */
    handleScrollPosition: ({ state, commit }) => {
      const scrollPosition = state.scrollPosition
      if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        commit('setScrollPosition', null)
      }
    },

    initCurPostEdit: ({ /*state,*/ commit }) => {
      commit('setCurPostEdit', {
        isOpen: false,
        componentKey: 0,
        post: {},
        posts: [],
        paramOption: {
          isManager: false,
          editMode: 'create',
          clazz: {},
        },
        paramModel: {
          parentUri: null,
          postType: null,
        },
        postVersion: state.postVersionDefault,
      })
    },

    openCurPostEditByCreate: ({ /*state,*/ commit }, {
      isManager, classId, postType, schoolType, create
    }) => {
      commit('setCurPostEdit', {
        isOpen: true,
        componentKey: 0,
        post: {},
        // posts: [],

        paramOption: {
          isManager: isManager,
          editMode: 'create',
          clazz: {},
        },

        paramModel: {
          parentUri: `${apiURL}/clazzes/${classId}`,
          postType: postType,
        },

        parentId: classId,
        schoolType: schoolType,
        postVersion: state.postVersionDefault,
        create: create ? create : false
      })
    },

    closeCurPostEdit: ({ /*state,*/ commit }) => {
      commit('setCurPostEdit', {
        isOpen: false,
        componentKey: 0,
        post: {},
        posts: [],
        paramOption: {
          isManager: false,
          editMode: 'create',
          clazz: {},
        },
        paramModel: {
          parentUri: null,
          postType: null,
        },
        postVersion: state.postVersionDefault,
      })
    },

    /**
     * 클래스 게시글 목록 검색조건 초기화
     */
    initCurClassSearchQuery: ({ /*state,*/ commit }) => {
      commit('setCurClassSearchQueryAttr', {
        postStatus: 'ALL',
        homeworkType: null,
        commentUsed: false,
        keyword: null,
        keywordCommentUsed: false,
        insertedUser: null,
        dayOfPosted: null,

        boardId: null,
        folderId: null,
      })
    },

    /**
     * 클래스 파일 모아보기 검색조건 초기화
     */
    initCurClassPostFileSearchQuery: ({ /*state,*/ commit }) => {
      commit('setCurClassPostFileSearchQueryAttr', {
        // postType: 'ALL',
        // mode: 'image',
        sort: 'posted,desc',
        keyword: null,
      })
    },

    /**
     * 학교 게시글 목록 검색조건 초기화
     */
    initCurSchoolSearchQuery: ({ /*state,*/ commit }) => {
      commit('setCurSchoolSearchQueryAttr', {
        keyword: null,
      })
    },

    /**
     * 로그인 사용자 정보 초기 세팅
     * @param state
     * @param commit
     * @returns {Promise<unknown>|*}
     */
    initUser:({state, commit}) => {
      const userId = localStorage.uuid
      const url = `/users/${userId}`
      const promiseResolve = (value) => new Promise(resolve => resolve(value))
      const promiseReject = () => new Promise(reject => reject(false))

      if (userId === 'undefined' || !userId)
        return promiseReject()

      return state.axios({
        method: REQUEST_METHOD.GET,
        url: url
      })
        .then(res => {
          const user = res.data
          const userUri = user._links.self.href
          const userType = user.userType

          commit('setUserUri', userUri)
          commit('setUserType', userType)
          commit('setUser', user)

          return promiseResolve(user)
        })
        .catch(() => {
          return promiseReject()
        })
    },

    /**
     * isManager action
     */
    existsClassManagerByClassId: ({state}, classId) => {
      const userId = state.user && state.user.currentId
        ? state.user.currentId
        : localStorage.uuid
      const url = `/clazzSubscribeViews/!q`
      const params = {
        userId: userId,
        classId: classId,
        memberStatus: 'ACCEPT',
        // 클래스 구독 유형 (선생님 === 관리자)
        userType: 'TEACHER'
      }
      const promiseResolve = (value) => new Promise(resolve => resolve(value))
      const promiseReject = () => new Promise(reject => reject(false))

      if (!userId || !classId)
        return promiseReject()

      return state.axios({
        method: REQUEST_METHOD.POST,
        url: url,
        params: params
      })
        .then(res => {
          const resources = res.data._embedded.clazzSubscribeViews || []
          return resources.length > 0
            ? promiseResolve(true)
            : promiseReject()
        })
        .catch(() => {
          return promiseReject()
        })
    },

    onClosePostEdit: ({ state, dispatch }, payload) => {
      const post = payload.post
      const boardId = post.boardId
      const folderId = post.categoryId
      const isClassOwnerOrManager = payload.isClassOwnerOrManager
      const isClassBoardList = router.currentRoute.path.includes(boardId)
      if (isClassBoardList) {
        dispatch('storeBoard/existsClassBoardOrFolder', {
          boardId,
          folderId,
          isClassOwnerOrManager,
        })
      }
    },

    openClassSort: ({ state, dispatch, commit }, payload) => {
      commit('setClassSort', {
        open: payload.open
      })
    },

    getBanners: async ({ state, commit }, requestParams) => {
      try {
        const res = await state.axios({
          method: REQUEST_METHOD.GET,
          url: `/banners`,
          params: requestParams
        })

        let bannerByPositionType = {}

        if (res.data._embedded && res.data._embedded.banners.length > 0) {
          res.data._embedded.banners.map(banner => {
            const positionType = banner.positionType

            positionType in bannerByPositionType
              ? bannerByPositionType[positionType].push(banner)
              : (bannerByPositionType[positionType] = [banner])
          })
          commit('setBanners', bannerByPositionType)
        }
      } catch (e) {
        state.log.warn('getBanners error', e)
      } finally {
        const curDate = moment().valueOf()
        commit('setBannerTimestamp', curDate)
      }
    }
  },
  mutations: {
    updateField,
    setUser(state, user) {
      state.user = user;
      firebaseAnalytics.setUserProperties(user)
    },
    setUserUri(state, userUri) {
      state.userUri = userUri;
    },
    setUserType(state, userType) {
      state.userType = userType;
    },
    setSchoolUri(state, schoolUri) {
      state.schoolUri = schoolUri;
    },
    setClazzSubscribeViews(state, clazzSubscribeViews) {
      state.clazzSubscribeViews = clazzSubscribeViews;
      firebaseAnalytics.setIsManagerAndGradeCodes(clazzSubscribeViews)
    },
    setSchoolSubscribeViews(state, schoolSubscribeViews) {
      state.schoolSubscribeViews = schoolSubscribeViews;
    },
    setOnceChecksUserSecretCommentUsed(state, userSecretCommentUsed) {
      state.onceChecks.userSecretCommentUsed = userSecretCommentUsed;
    },
    setCloneLocalData(state, cloneLocalData) {
      state.cloneLocalData = cloneLocalData;
    },
    setCloneLocalFiles(state, cloneLocalFiles) {
      state.cloneLocalFiles = cloneLocalFiles;
    },
    setIsShowDetailPostLayer(state, isShowDetailPostLayer) {
      state.isShowDetailPostLayer = isShowDetailPostLayer;
    },
    setItemDetailObj(state, itemDetailObj) {
      state.itemDetailObj = itemDetailObj;
    },
    setTmpClassName(state, tmpClassName) {
      state.tmpClassName = tmpClassName;
    },
    setIsShowToast(state, isShowToast) {
      state.isShowToast = isShowToast;
    },
    setToastMsg(state, toastMsg) {
      state.toastMsg = toastMsg;
    },
    setIsDimLoading(state, isDimLoading) {
      state.isDimLoading = isDimLoading;
    },
    setAlarmPlusDetail(state, alarmPlusDetail) {
      state.alarmPlusDetail = alarmPlusDetail;
    },
    setAlarmPlusInviteSchool(state, alarmPlusInviteSchool) {
      state.alarmPlusInviteSchool = alarmPlusInviteSchool;
    },
    setAlarmPlusUsedIsTeacherSubscribe(state, payload) {
      state.alarmPlusUsed.isTeacherSubscribe = payload;
    },
    setChatUncheckedMessage(state, payload) {
      for (const [key, value] of Object.entries(payload))
        state.chatUncheckedMessage[key] = value || null
    },
    setImageView(state, imageView) {
      state.imageView = imageView;
    },
    setDocView(state, docView) {
      state.docView = docView;
    },
    setTermsView(state, payLoad) {
      state.termsView = payLoad;
    },
    setPrintView(state, printView) {
      state.printView = printView;
    },

    setPopupMessage: (state, payLoad) => {
      state.popupMessage = payLoad
      state.popupMessage.type = payLoad.type || null
      state.popupMessage.action = payLoad.action || null
      state.popupMessage.title = payLoad.title || null
    },

    setImageResizeConfig: (state, payload) => state.imageResizeConfig = payload,


    setReadMessagesFlag(state){
      state.readMessagesFlag = !state.readMessagesFlag;
    },

    /**
     * 채팅 모달 팝업
     * @param {*} state
     * @param {*} chatModal
     */
    setChatModal(state, chatModal) {
      state.chatModal.isOpen = chatModal.isOpen;
      state.chatModal.mode = chatModal.mode === undefined ? 'alert' : chatModal.mode;
      state.chatModal.message = chatModal.message;
      state.chatModal.action = chatModal.action;
    },

    /**
     * 진입한 클래스의 각 과제현황 팝업
     * @param {*} state
     * @param status
     */
    setCurClazzHomeworkStatus(state, status) {
      state.curClazzHomework.status.isOpen = status.isOpen;
      state.curClazzHomework.status.postItem = status.postItem;
      state.curClazzHomework.status.postItemType = status.postItemType;
    },

    /**
     * 진입한 클래스의 schoolType에 따른 알림장/공지 문구 표시
     * @param state
     * @param clazzNote
     */
    setCurClazzNote(state, clazzNote) {
      state.curClazzNote.classId = clazzNote.classId;
      state.curClazzNote.schoolType = clazzNote.schoolType;
      state.curClazzNote.name = clazzNote.name;
      state.curClazzNote.suffix1 = clazzNote.suffix1;
      state.curClazzNote.suffix2 = clazzNote.suffix2;
      state.curClazzNote.suffix3 = clazzNote.suffix3;
      state.curClazzNote.suffix4 = clazzNote.suffix4;
    },

    setCurClassItem(state, curClassItem) {
      state.curClassItem = curClassItem || {}
    },

    setCurSchoolItem(state, curSchoolItem) {
      state.curSchoolItem = curSchoolItem || {}
    },

    setInfiniteScrollIsBusy(state, isBusy) {
      state.infiniteScroll.isBusy = isBusy
    },
  
    setInfiniteScroll(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.infiniteScroll[key] = value
      }
    },

    /**
     * 게시물 좋아요 리스트 팝업
     * @param {*} state
     * @param obj
     */
    setCurPostLike(state, obj) {
      state.curPostLike.isOpen = obj.isOpen || false
      state.curPostLike.isClassPost = obj.isClassPost || false
      state.curPostLike.postId = obj.postId || null
    },
  
    /**
     * 약관 동의한 게시글 ID 임시저장
     * @param state
     * @param payload
     */
    setAcceptedTermsPostIdList(state, payload) {
      state.acceptedTermsPostIdList = payload
    },
  
    setCurPostTerms(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.curPostTerms[key] = value
      }
    },

    setCurPostEdit(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.curPostEdit[key] = value
      }
    },

    setCurPostEditPostItemAttr(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.curPostEdit.postItem[key] = value
      }
    },

    setCurClazzesPosts(state, posts) {
      if (posts && Array.isArray(posts)) {
        if (!Array.isArray(state.curClazzesPosts))
          state.curClazzesPosts = []

        state.curClazzesPosts.push(...posts)
      } else {
        state.curClazzesPosts = undefined
      }
    },

    setCurClazzesPostsAfterDelete(state, posts){
      state.curClazzesPosts = [...posts]
    },

    /**
     * 클래스 게시글 목록 수정사항 갱신
     * @param state
     * @param post
     */
    updateCurClazzesPosts(state, post) {
      if (state.curClazzesPosts && Array.isArray(state.curClazzesPosts)) {
        const postId = post.currentId
        const foundItemIndex = state.curClazzesPosts.findIndex(p => p.postId === postId)
        if (foundItemIndex > -1) {
          setTimeout(() => {
            for (const key of Object.keys(state.curClazzesPosts[foundItemIndex])) {
              if (post[key] !== undefined)
                state.curClazzesPosts[foundItemIndex][key] = post[key]
            }
            eventBus.$emit(`refresh-post-edit-post-item-attr|${postId}`)
          }, 200)
        }
      }
    },

    /**
     * 게시글 상세 modal 수정사항 갱신
     * @param state
     * @param post
     */
    updateItemDetailObj(state, post) {
      const postId = post.currentId
      try {
        if (state.itemDetailObj.item.currentId && postId) {
          setTimeout(() => {
            state.itemDetailObj.item = post
            eventBus.$emit(`refresh-detail-post-item-attr|${postId}`)
          }, 200)
        }
        // eslint-disable-next-line
      } catch (e) {}
    },

    setCurClazzesPostFiles(state, files) {
      if (files && Array.isArray(files)) {
        if (!Array.isArray(state.curClazzesPostFiles)) {
          state.curClazzesPostFiles = []
        }
        // files 랑 state.curClazzesPostFiles 랑 같은 객체가 있으면 추가하지 않는다.
        for (const file of files) {
          const foundIndex = state.curClazzesPostFiles.findIndex(f => f.seq === file.seq)
          if (foundIndex === -1) {
            state.curClazzesPostFiles.push(file)
          }
        }
        // state.curClazzesPostFiles.push(...files)
      } else {
        state.curClazzesPostFiles = undefined
      }
    },

    SetCurClazzesPostAllFiles(state, files) {
      if (files && Array.isArray(files)) {
        state.curClazzesPostFiles = []
        state.curClazzesPostFiles = files
      } else {
        state.curClazzesPostFiles = undefined
      }
    },

    setCurSchoolsPosts(state, posts) {
      if (posts && Array.isArray(posts)) {
        if (!Array.isArray(state.curSchoolsPosts))
          state.curSchoolsPosts = []

        state.curSchoolsPosts.push(...posts)
      } else {
        state.curSchoolsPosts = undefined
      }
    },

    /**
     * 외부 팝업
     * @param {*} state
     * @param {*} openPopup
     */
    setOpenPopup(state, openPopup) {
      state.openPopup = openPopup
    },

    /**
     * 건강상태 자가진단 무료 문자 팝업
     * @param {*} state
     * @param {*} healthCheckFreeSms
     */
    setHealthCheckFreeSms(state, healthCheckFreeSms) {
      state.healthCheckFreeSms = healthCheckFreeSms
    },

    /**
     * 학생 건강상태 자가진단 팝업
     * @param {*} state
     * @param {*} studentHealthCheck
     */
    setStudentHealthCheck(state, studentHealthCheck) {
      state.studentHealthCheck = studentHealthCheck
    },

    setPostEdit(state, postEdit) {
      state.postEdit = postEdit
    },

    setClazzApplicationForm(state, clazzApplicationForm) {
      state.clazzApplicationForm = clazzApplicationForm
    },
    
    setClazzCalendarSchedule(state, payload) {
      if (payload.isOpen) {
        state.clazzCalendarSchedule = payload
      } else {
        state.clazzCalendarSchedule = {
          isOpen: false,
          clazzes: {},
          curItem: {},
          clickedDate: null
        }
      }
    },

    setClazzRemindPushModal(state, payload) {
      if (payload.isOpen) {
        state.clazzRemindPushModal = payload
      } else {
        state.clazzRemindPushModal = {
          isOpen: false,
          postItem: {},
          postItemType: null,
          schoolType: null,
          isGeneralType: false
        }
      }
    },

    /**
     * 파일 업로드 / 다운로드 로딩
     * @param {*} state
     * @param {*} isFileLoading
     */
    setIsFileLoading(state, isFileLoading) {
      state.isFileLoading = isFileLoading
    },

    setIsMultiFileLoading(state, isMultiFileLoading) {
      state.isMultiFileLoading = isMultiFileLoading
    },

    /**
     * 로딩
     * @param {*} state
     * @param {*} isLoading
     */
    setIsLoading(state, isLoading) {
      state.isLoading = isLoading
    },

    // 학부모상당 저장완료시까지 
    setIsConsultationLoading(state, isLoading) {
      state.isConsultationLoading = isLoading
    },

    /**
     * 에디터 copy & paste 로딩
     * @param {*} state
     * @param {*} isEditorLoading
     */
    setIsEditorLoading(state, isEditorLoading) {
      state.isEditorLoading = isEditorLoading
    },
    /**
     * 에디터 init 로딩
     * @param {*} state
     * @param {*} isEditorInitLoading
     */
    setIsEditorInitLoading(state, isEditorInitLoading) {
      state.isEditorInitLoading = isEditorInitLoading
    },
  
    setIsRadioToggleLoading(state, payload) {
      state.isRadioToggleLoading = payload
    },

    setIsUseKeyCapture(state, isUseKeyCapture) {
      state.isUseKeyCapture = isUseKeyCapture
    },

    /**
     * 배너
     * @param {*} state
     * @param {*} bannerObj
     */
    /**
    setBanner(state, bannerObj) {
      const positionType = bannerObj.positionType
      state.banner[positionType] = bannerObj.list
    },
     */

    /**
     * 배너
     * @param {*} state
     * @param {*} banners
     */
    setBanners(state, banners) {
      state.banner = banners
    },

    /**
     * 배너 로딩 시간
     * @param {*} state
     * @param {*} bannerTimestamp
     */
    setBannerTimestamp(state, bannerTimestamp) {
      state.bannerTimestamp = bannerTimestamp
    },

    /**
     * 앱 시작 시간
     * @param state
     * @param payload
     */
    setStartTimestamp(state, payload) {
      state.startTimestamp = payload
    },

    /**
     * 현재 시간
     * @param state
     * @param payload
     */
    setCurrentTimestamp(state, payload) {
      state.currentTimestamp = payload
      state.storeSurvey.currentTimestamp = payload
    },

    setIsLoadingIdTokenExpireCheck(state, payload) {
      state.isLoadingIdTokenExpireCheck = payload
    },

    setScrollPosition(state, scrollPosition) {
      state.scrollPosition = scrollPosition
    },

    setCurClassSearchQueryAttr(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.curClassSearchQuery[key] = value
      }
    },

    setCurClassPostFileSearchQueryAttr(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.curClassPostFileSearchQuery[key] = value
      }
    },

    setCurSchoolSearchQueryAttr(state, payload) {
      for (const [key, value] of Object.entries(payload)) {
        state.curSchoolSearchQuery[key] = value
      }
    },

    setCurClassTabCode(state, tabCode) {
      state.curClassTabCode = tabCode
    },

    setCurClassPostFileTabCode(state, tabCode) {
      state.curClassPostFileTabCode = tabCode
    },

    setHtmlPrint(state, payload) {
      state.htmlPrint = payload
    },

    setAxios: (state, payload) => {
      state.axios = payload.axios;
    },
    
    setHiClass: (state, payload) => {
      state.hiClass = payload.hiClass;
    },
  
    setLog: (state, payload) => {
      state.log = payload.log;
    },

    /**
     * 하이톡 공유하기 (선택한 대화상대 목록 업데이트)
     * @param state
     * @param selectedUserList
     */
    setHitalkShareSelectedUserList: (state, selectedUserList) => {
      state.hitalkShare.selectedUserList = selectedUserList
    },

    /**
     * 하이톡 공유하기 (선택한 대화상대 추가)
     * @param state
     * @param selectedUser
     */
    appendHitalkShareSelectedUserList: (state, selectedUser) => {
      state.hitalkShare.selectedUserList.push(selectedUser)
    },

    /**
     * 하이톡 공유하기 (선택한 대화상대 삭제)
     * @param state
     * @param idx
     */
    spliceHitalkShareSelectedUserList: (state, idx) => {
      state.hitalkShare.selectedUserList.splice(idx, 1)
    },

    /**
     * 하이톡 공유하기 (선택한 대화상대 초기화)
     * @param state
     */
    clearHitalkShareSelectedUserList(state) {
      state.hitalkShare.selectedUserList = []
    },

    /**
     * 하이톡 공유하기 (공유할 게시물)
     * @param state
     * @param content
     */
    setHitalkShareContent(state, content) {
      state.hitalkShare.content = content
    },

     /**
     * 하이톡 공유하기 (공유할 게시물 여러개)
     * @param state
     * @param contents
     */
     setHitalkShareContents(state, contents) {
      state.hitalkShare.contents = contents
    },

    /**
     * 하이톡 공유하기 (모달 선택한 탭)
     * @param state
     * @param currentTab
     */
    setHitalkShareCurrentTab(state, currentTab) {
      state.hitalkShare.currentTab = currentTab
    },

    /**
     * 하이톡 공유하기 (초기화)
     * @param state
     */
    clearHitalkShare(state) {
      state.hitalkShare.content = {}
      state.hitalkShare.contents = []
      state.hitalkShare.message = ''
      state.hitalkShare.selectedUserList = []
      state.hitalkShare.sendStatus = false
      state.hitalkShare.currentTab = 'userList'
    },

    /**
     * 하이톡 공유하기 (입력한 메시지 초기화)
     * @param state
     */
    clearHitalkShareMessage(state) {
      state.hitalkShare.message = ''
    },

    setTermsRecord(state, termsRecord) {
      state.termsRecord.serviceRecord = termsRecord.serviceRecord
      state.termsRecord.privacyRecord = termsRecord.privacyRecord
      state.termsRecord.privacyPreviewRecord = termsRecord.privacyPreviewRecord
      state.termsRecord.privacyPreviewRecordByUserType = termsRecord.privacyPreviewRecordByUserType
      state.termsRecord.privacyUseDetailRecord = termsRecord.privacyUseDetailRecord
      state.termsRecord.textRecord = termsRecord.textRecord
    },

    setInitCurrentPrivacyIndex(state) {
      state.termsRecord.currentPrivacyIndex = state.termsRecord.privacyRecord.length - 1
    },

    setTermsCurrentPrivacyIndex(state, idx) {
      state.termsRecord.currentPrivacyIndex = idx
    },

    setTermsPrevPrivacyIndex(state) {
      --state.termsRecord.currentPrivacyIndex
    },

    
    setClassSort(state, classSort) {
      state.classSort = classSort;
    },

    setIsClassCreatedNew(state, data) {
      state.isClassCreatedNew = data
    },

    setIsShowMarketingConsentPopup(state, isShowMarketingConsentPopup) {
      state.isShowMarketingConsentPopup = isShowMarketingConsentPopup
    },

    setHasWebHomePopup(state, hasWebHomePopup) {
      state.hasWebHomePopup = hasWebHomePopup
    },

    setVersionData(state, versionData) {
      state.versionData = JSON.parse(JSON.stringify(versionData))
    }

  }
});
