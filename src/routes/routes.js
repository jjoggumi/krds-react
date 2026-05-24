import HelpNotice from '../apps/help/notice/HelpNotice.vue';
import { createReactPage } from '@/apps/hc2/createReactPage';

// 필수 컴포넌트는 LazyLoad 하지 않도록 처리
import Login from '@/apps/login/Login.vue';
import LoginCallback from '@/apps/login/LoginCallback.vue';
import LoginIscreamCallback1 from '@/apps/login/LoginIscreamCallback1.vue';
import LoginIscreamCallback2 from '@/apps/login/LoginIscreamCallback2.vue';
import Logout from '@/apps/login/Logout.vue';
import LogoutCallback from '@/apps/login/LogoutCallback.vue';
import DevEnvironmentRoutes from './devEnvironmentRoutes.js';
import Logic from './logic';

const logic = Logic();

const surveys = [
  {
    path: '/survey-create',
    name: 'survey-create',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "survey-create" */ '@/apps/surveyCreate/SurveyCreate.vue'),
    children: [
      {
        path: ':surveyId',
        name: 'survey-create-survey-id',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "survey-create-survey-id" */ '@/apps/surveyCreate/SurveyCreate.vue'),
      },
    ],
  },
  // survey report
  {
    path: '/survey-report/:surveyId',
    name: 'survey-report',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "survey-report" */ '../apps/surveyReport/SurveyReport.vue'),
  },
  {
    path: '/mobile/survey-report/:surveyId',
    name: 'mobile-survey-report',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "mobile-survey-report-statistics" */ '../apps/mobile/surveyReport/MobileSurveyReport.vue'),
    children: [
      {
        path: ':questionId',
        name: 'mobile-statistics-respondent',
        meta: {
          title: 'HiClass',
          // class: "page-school-class"
        },
        component: () =>
          import(/* webpackChunkName: "mobile-survey-report-statistics-respondent" */ '../apps/mobile/surveyReport/MobileSurveyReport.vue'),
      },
    ],
  },
  {
    path: '/survey-response/:surveyId',
    name: 'survey-response-survey-id',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "survey-response-survey-id" */ '@/apps/surveyResponse/SurveyResponse.vue'),
  },
  {
    path: '/sru/:surveyId',
    name: 'sru-survey-id',
    meta: {
      title: 'HiClass',
      class: 'response-type-external',
    },
    component: () => import(/* webpackChunkName: "sru-survey-id" */ '@/apps/surveyResponse/SurveyResponse.vue'),
  },
];

export default [
  {
    path: '/',
    name: 'index',
    meta: {
      title: 'HiClass',
      // bodyClass: '!bodyClass'
    },
    // redirect: "/errorPageServiceCheck",
    component: () => import(/* webpackChunkName: "index" */ '@/apps/index/Index'),
    alias: '/index',
  },
  {
    path: '/intro/gne',
    name: 'intro/gne',
    redirect: '/login/educationOffice',
  },
  {
    path: '/index/gne',
    name: 'index/gne',
    redirect: '/login/educationOffice',
  },
  {
    path: '/signature',
    name: 'signature',
    meta: {
      title: 'HiClass',
      // bodyClass: '!bodyClass'
    },
    component: () => import(/* webpackChunkName: "signature" */ '../components/Signature/Signature'),
  },
  {
    path: '/login/callback',
    name: 'loginCallback',
    meta: {
      title: 'HiClass',
    },
    component: LoginCallback,
  },
  {
    path: '/login/callback/iscream1',
    name: 'loginCallback1',
    meta: {
      title: 'HiClass',
    },
    component: LoginIscreamCallback1,
  },
  {
    path: '/login/callback/iscream2',
    name: 'loginCallback2',
    meta: {
      title: 'HiClass',
    },
    component: LoginIscreamCallback2,
  },
  {
    path: '/logout',
    name: 'logout',
    meta: {
      title: 'HiClass',
    },
    component: Logout,
  },
  {
    path: '/logout/callback',
    name: 'logoutCallback',
    meta: {
      title: 'HiClass',
    },
    component: LogoutCallback,
  },
  {
    path: '/tep',
    name: 'temporary-login',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "temporary-login" */ '../apps/login/temporary/EntryPoint.vue'),
  },
  {
    path: '/p2t/sample',
    name: 'parents-to-teacher-sample',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "temporary-login" */ '../apps/login/parentsToTeacher/Sample.vue'),
  },
  {
    path: '/p2t/:applyEntryPath',
    name: 'parents-to-teacher',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "temporary-login" */ '../apps/login/parentsToTeacher/EntryPoint.vue'),
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      title: 'HiClass',
    },
    component: Login,
    children: [
      {
        path: '/login/:userType',
        name: 'login-userType',
        meta: {
          title: 'HiClass',
        },
        component: Login,
      },
      {
        path: '/login/:userType/:id',
        name: 'login-userType-id',
        meta: {
          title: 'HiClass',
        },
        component: Login,
      },
    ],
  },
  {
    path: '/share',
    name: 'share',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunName: "share-sharePost" */ '../apps/share/Share.vue'),
    children: [
      {
        path: '/share/:id',
        name: 'share-post',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunName: "share-sharePost" */ '../apps/share/ShareBody.vue'),
      },
    ],
  },
  {
    path: '/help',
    name: 'help',
    redirect: '/help/notice',
    meta: {
      title: 'HiClass',
      class: 'page-customer customer-notice layout2',
    },
    component: () => import(/* webpackChunkName: "help" */ '../apps/help/Help.vue'),
    children: [
      {
        path: '/help/notice',
        name: 'notice',
        meta: {
          title: 'HiClass',
          class: 'page-customer customer-notice layout2',
        },
        component: HelpNotice,
      },
      {
        path: '/help/faq',
        name: 'faq',
        meta: {
          title: 'HiClass',
          class: 'page-customer customer-faq layout2',
        },
        component: () => import(/* webpackChunkName: "help-faq" */ '../apps/help/faq/HelpFaq.vue'),
      },
      {
        path: '/help/question',
        name: 'question',
        meta: {
          title: 'HiClass',
          class: 'page-customer customer-question layout2',
        },
        component: () => import(/* webpackChunkName: "help-question" */ '../apps/help/question/HelpQuestion.vue'),
      },
      {
        path: '/help/suggestion',
        name: 'suggestion',
        meta: {
          title: 'HiClass',
          class: 'page-customer customer-suggestion layout2',
        },
        component: () => import(/* webpackChunkName: "help-suggestion" */ '../apps/help/suggestion/HelpSuggestion.vue'),
      },
      {
        path: '/help/contactus',
        name: 'contactus',
        meta: {
          title: 'HiClass',
          class: 'page-customer customer-advertising layout2',
        },
        component: () => import(/* webpackChunkName: "help-contactus" */ '../apps/help/contactus/HelpContactus.vue'),
      },
      {
        path: '/help/terms',
        name: 'terms',
        meta: {
          title: 'HiClass',
          class: 'page-customer customer-terms layout2',
        },
        component: () => import(/* webpackChunkName: "help-terms" */ '../apps/help/terms/HelpTerms.vue'),
      },
    ],
  },
  {
    path: '/main/clazzes/note/newboard',
    name: 'NoteBoard',
    meta: {
      title: 'HiClass',
      class: 'page-school-class',
    },
    component: () => import(/* webpackChunkName: "clazzesNoteNewboardNoteBoard" */ '../apps/main/clazzes/note/newboard/NoteBoard.vue'),
  },
  {
    path: '/hiclassnote',
    name: 'loginNoteBoard',
    component: () => import(/* webpackChunkName: "hiclassnote" */ '../apps/login/note/LoginNote.vue'),
  },
  {
    path: '/hiclassFreesms',
    name: 'loginFreeSms',
    component: () => import(/* webpackChunkName: "loginFreeSms" */ '../apps/login/freesms/LoginFreesms.vue'),
  },
  {
    path: '/hiclassbehavior',
    name: 'loginBehavior',
    component: () => import(/* webpackChunkName: "hiclassbehavior" */ '../apps/login/behavior/Main.vue'),
  },
  {
    path: '/popup/PopupItem',
    name: 'popup',
    meta: {
      title: 'HiClass',
      class: 'page-school-class',
    },
    component: () => import(/* webpackChunkName: "commonPopup" */ '../apps/popup/PopupItem.vue'),
  },
  {
    path: '/popup/GuidePopup',
    name: 'guide-popup',
    meta: {
      title: 'HiClass',
      class: 'page-school-class',
    },
    component: () => import(/* webpackChunkName: "commonGuidePopup" */ '../apps/popup/GuidePopup.vue'),
  },
  {
    path: '/popup/GuidePopupVideo',
    name: 'guide-popup-video',
    meta: {
      title: 'HiClass',
      class: 'page-school-class',
    },
    component: () => import(/* webpackChunkName: "commonGuidePopupVideo" */ '../apps/popup/GuidePopupVideo.vue'),
  },
  {
    path: '/popup/SignaturePopup',
    name: 'signature-popup',
    meta: {
      title: 'HiClass',
      class: 'page-school-class',
    },
    component: () => import(/* webpackChunkName: "commonSignaturePopup" */ '../apps/popup/SignaturePopup.vue'),
  },
  {
    path: '/popup/SignaturePopup/:signType',
    name: 'signature-popup-signType',
    meta: {
      title: 'HiClass',
      class: 'page-school-class',
    },
    component: () => import(/* webpackChunkName: "commonSignaturePopup" */ '../apps/popup/SignaturePopup.vue'),
  },
  {
    path: '/popup/identity-verification',
    name: 'popup-identity-verification',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "commonPopup" */ '../apps/popup/IdentityVerification.vue'),
  },
  {
    path: '/popup/mobile/identity-verification',
    name: 'popup-mobile-identity-verification',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "commonPopup" */ '../apps/popup/MobileIdentityVerification.vue'),
  },
  {
    path: '/main',
    name: 'main',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "main" */ '../apps/main/Main.vue'),
    children: [
      {
        path: '/main',
        name: 'mainBody',
        redirect: '/main/home',
      },
      /* 구 intro url 호환 */
      {
        path: '/main/intro',
        name: 'mainIntro',
        redirect: '/main/home',
      },
      {
        path: '/main/home',
        name: 'mainHome',
        meta: {
          title: 'HiClass',
          class: 'l-page-main',
        },
        component: () => import(/* webpackChunkName: "mainHome" */ '../apps/main/home/MainBodyHome.vue'),
      },
      {
        path: '/main/alarmplus/:view?/:schoolId?/:menu?',
        name: 'alarmplusApply',
        meta: {
          title: 'HiClass',
          class: 'is-alarm-plus-page',
        },
        component: () => import(/* webpackChunkName: "mainAlarmplus" */ '../apps/main/alarmplus/MainBodyAlarmPlus.vue'),
      },
      {
        path: '/main/create',
        name: 'create',
        meta: {
          title: 'HiClass',
          class: 'page-create-class',
        },
        component: () => import(/* webpackChunkName: "create" */ '../apps/main/create/MainBodyCreate.vue'),
      },
      {
        path: '/main/create/schoolapplies',
        name: 'addSchoolapplies',
        meta: {
          title: 'HiClass',
          class: 'page-create-class',
        },
        component: () => import(/* webpackChunkName: "create-schoolapplies" */ '../apps/main/create/schoolapplies/MainBodyCreateSchoolapplies.vue'),
      },

      {
        path: '/main/clazzes/:id/:board?/:boardId?/:folderId?',
        name: 'clazzes',
        meta: {
          title: 'HiClass',
          class: 'l-page-sub',
        },
        component: () => import(/* webpackChunkName: "clazzes" */ '../apps/main/clazzes/MainBodyClazzes.vue'),
      },
      {
        path: '/main/schools',
        name: 'schools',
        meta: {
          title: 'HiClass',
          class: 'l-page-sub',
        },
        component: () => import(/* webpackChunkName: "schools" */ '../apps/main/schools/MainBodySchools.vue'),
        children: [
          {
            path: ':id',
            name: 'schools uuid',
            meta: {
              title: 'HiClass',
              class: 'l-page-sub',
            },
            component: () => import(/* webpackChunkName: "schools-all" */ '../apps/main/schools/MainBodySchoolsBody.vue'),
          },
          {
            path: ':id/notice',
            name: 'schools-notice',
            meta: {
              title: 'HiClass',
              class: 'l-page-sub',
            },
            component: () => import(/* webpackChunkName: "schools-notice" */ '../apps/main/schools/MainBodySchoolsBody.vue'),
          },
          {
            path: ':id/meal',
            name: 'schools-meal',
            meta: {
              title: 'HiClass',
              class: 'l-page-sub',
            },
            component: () => import(/* webpackChunkName: "schools-meal" */ '../apps/main/schools/MainBodySchoolsBody.vue'),
          },
          {
            path: ':id/alarm',
            name: 'schools-alarm',
            meta: {
              title: 'HiClass',
              class: 'l-page-sub',
            },
            component: () => import(/* webpackChunkName: "schools-alarm" */ '../apps/main/schools/MainBodySchoolsBody.vue'),
          },
          {
            path: ':id/alarm_edu_office',
            name: 'schools-alarm-edu-office',
            meta: {
              title: 'HiClass',
              class: 'l-page-sub',
            },
            component: () => import(/* webpackChunkName: "schools-alarm-edu-office" */ '../apps/main/schools/MainBodySchoolsBody.vue'),
          },
        ],
      },
      {
        path: '/main/search',
        name: 'search',
        meta: {
          title: 'HiClass',
          class: 'page-join-class',
        },
        component: () => import(/* webpackChunkName: "search" */ '../apps/main/search/MainSearch.vue'),
      },
      {
        path: '/main/education',
        name: 'education',
        redirect: '/main/education/event',
        meta: {
          title: 'HiClass',
          class: 'l-page-sub',
        },
        component: () => import(/* webpackChunkName: "education" */ '../apps/main/education/MainBodyEducation.vue'),
        children: [
          {
            // OLD 추천정보 페이지 미운영
            path: '/main/education/info',
            name: 'education-info',
            redirect: '/main/education',
          },
          {
            path: '/main/education/event',
            name: 'education-event',
            meta: {
              title: 'HiClass',
              class: 'l-page-sub',
            },
            component: () => import(/* webpackChunkName: "education-event" */ '../apps/main/education/event/MainBodyEducationEvent.vue'),
          },
        ],
      },
      {
        path: '/main/mypage',
        name: 'mypage',
        meta: {
          title: 'HiClass',
          class: 'page-mypage mypage-privacy-info layout2',
        },
        component: () => import(/* webpackChunkName: "mypage" */ '../apps/main/mypage/MainBodyMypage.vue'),
        children: [
          {
            path: '/main/mypage/clazzes',
            name: 'mypage-clazzes',
            meta: {
              title: 'HiClass',
              class: 'page-mypage mypage-class layout2',
            },
            component: () => import(/* webpackChunkName: "mypage-clazzes" */ '../apps/main/mypage/clazzes/MainBodyMypageClazzes.vue'),
          },
          {
            path: '/main/mypage/info',
            name: 'mypage-info',
            meta: {
              title: 'HiClass',
              class: 'page-mypage mypage-privacy-info layout2',
            },
            component: () => import(/* webpackChunkName: "mypage-info" */ '../apps/main/mypage/info/MainBodyMypageInfo.vue'),
          },
          {
            path: '/main/mypage/schools',
            name: 'mypage-schools',
            meta: {
              class: 'page-mypage mypage-school layout2',
            },
            component: () => import(/* webpackChunkName: "mypage-schools" */ '../apps/main/mypage/schools/MainBodyMypageSchools.vue'),
          },
          {
            path: '/main/mypage/scrap',
            name: 'mypage-scrap',
            meta: {
              title: 'HiClass',
              class: 'page-mypage mypage-scrap layout2',
            },
            component: () => import(/* webpackChunkName: "mypage-scrap" */ '../apps/main/mypage/scrap/MainBodyMypageScrap.vue'),
          },
        ],
      },
      {
        path: '/main/myboard',
        name: 'myboard',
        meta: {
          title: 'HiClass',
          class: 'page-mypage mypage-privacy-info layout2',
        },
        component: () => import(/* webpackChunkName: "myboard" */ '@/apps/main/myboard/MainBodyMyBoard'),
        children: [
          {
            path: '/main/myboard/news',
            name: 'myboard-news',
            meta: {
              title: 'HiClass',
              class: 'page-mypage mypage-scrap layout2',
            },
            component: () => import(/* webpackChunkName: "myboard-news" */ '@/apps/main/myboard/news/MainBodyMyBoardNews'),
          },
          {
            path: '/main/myboard/alarmplus',
            name: 'myboard-alarmplus',
            meta: {
              title: 'HiClass',
              class: 'page-mypage mypage-scrap layout2',
            },
            component: () => import(/* webpackChunkName: "myboard-alarmplus" */ '@/apps/main/myboard/alarmplus/MainBodyMyBoardAlarmPlus'),
          },
        ],
      },
    ],
  },

  // ── 문자서비스 (전체 React 풀페이지, Vue GNB 없음) ────────────────
  {
    path: '/main/text/:view?/:schoolId?/:menu?',
    name: 'text-send',
    meta: { title: 'HiClass' },
    component: createReactPage({
      tag: 'text-full-page',
      name: 'TextSendPage',
      rootClasses: ['hc2', 'text-root'],
      vuexState: {
        user: 'user',
        textAuthorities: ['storeSchool', 'textAuthorities'],
      },
      vuexActions: [['storeSchool', 'loadTextAuthorities']],
      guard: async (vm) => {
        const userType = vm.$store.state.user?.userType;
        if (!userType || userType !== 'TEACHER') return '/main';
        return true;
      },
      getProps: (vm) => ({
        user: vm.user,
        authorities: vm.textAuthorities,
        route: {
          menu: vm.$route.params.menu || 'send',
          schoolId: vm.$route.params.schoolId || '',
          query: vm.$route.query || {},
        },
      }),
      reactEvents: {
        // React 내부 라우팅 변경 → Vue 라우터 동기화
        'react-route-change': async (vm, event) => {
          const { menu, schoolId, query, routePath, reloadAuthorities } = event.detail;

          if (reloadAuthorities) {
            await vm.$store.dispatch('storeSchool/loadTextAuthorities');
          }

          // 외부 경로 이동 (예: 메인으로 이동)
          if (!menu && routePath) {
            await vm.$router.push({ path: routePath, query: query || {} });
            return;
          }

          const resolvedSchoolId = schoolId || vm.$route.params.schoolId;
          const path = `/main/text/schools/${resolvedSchoolId}/${menu}`;
          const from = { path: vm.$route.path, query: vm.$route.query };
          const to = { path, query: query || {} };

          const isSame =
            from.path === to.path &&
            JSON.stringify(from.query) === JSON.stringify(to.query);
          if (!isSame) await vm.$router.push(to);
        },

        // React → Vue 이벤트 (약관, 애널리틱스 등)
        'handle-hc2-text-event': (vm, event) => {
          const { command, eventData } = event.detail || {};
          if (command === 'showTerms') {
            vm.$store.dispatch('openTermsView', { layerType: eventData?.layerType });
          }
          if (command === 'triggerAnalytics') {
            vm.$store.dispatch('triggerAnalyticsLogEvent', {
              code: eventData?.GACode,
              params: eventData?.params,
            });
          }
        },
      },
    }),
  },

  {
    path: '/hitalk',
    name: 'hitalk',
    meta: {
      title: 'HiClass',
      class: 'page-ooo-conversation',
    },
    props: (route) => ({
      chatUserId: route.query.chatUserId,
      chatUserClassId: route.query.chatUserClassId,
      chatUserType: route.query.chatUserType,
      chatUserMemberRole: route.query.chatUserMemberRole,
    }),
    component: () => import(/* webpackChunkName: "hitalk" */ '../apps/hitalk/Hitalk.vue'),
  },
  {
    path: '/behavior-records',
    name: 'behavior',
    meta: {
      title: '학급기록',
      class: 'behavior-container',
    },
    props: (route) => ({
      connectedClassId: route.query.connectedClassId,
    }),
    component: () => import(/* webpackChunkName: "behavior" */ '../apps/behavior/Behavior.vue'),
    children: [
      {
        path: '/behavior-records/:classroomId/classrooms',
        name: 'classrooms',
        meta: {
          title: '학급기록',
          class: 'behavior-container',
        },
        component: () => import(/* webpackChunkName: "behavior-classrooms" */ '@/apps/behavior/pages/classrooms/Classrooms.vue'),
        redirect: '/behavior-records/:classroomId/classrooms/students',
        children: [
          {
            path: '/behavior-records/:classroomId/classrooms/students',
            name: 'students',
            meta: {
              title: '학급기록',
              class: 'behavior-container',
            },
            component: () => import(/* webpackChunkName: "behavior-students" */ '@/apps/behavior/pages/classrooms/Students.vue'),
          },
          {
            path: '/behavior-records/:classroomId/classrooms/seat',
            name: 'seat',
            meta: {
              title: '자리배치도',
              class: 'behavior-container',
            },
            component: () => import(/* webpackChunkName: "behavior-points" */ '@/apps/behavior/pages/classrooms/Seat.vue'),
          },
          {
            path: '/behavior-records/:classroomId/classrooms/points',
            name: 'points',
            meta: {
              title: '포인트관리',
              class: 'behavior-container',
            },
            component: () => import(/* webpackChunkName: "behavior-points" */ '@/apps/behavior/pages/classrooms/point/Points.vue'),
          },
          {
            path: '/behavior-records/:classroomId/classrooms/manageStudents',
            name: 'manageStudents',
            meta: {
              title: '학생명단관리',
              class: 'behavior-container',
            },
            component: () => import(/* webpackChunkName: "behavior-points" */ '@/apps/behavior/pages/classrooms/ManageStudents.vue'),
          },
        ],
      },
      {
        path: '/behavior-records/:classroomId/records',
        name: 'records',
        meta: {
          title: '학급기록',
          class: 'behavior-container',
        },
        component: () => import(/* webpackChunkName: "behavior-records" */ '@/apps/behavior/pages/records/Records.vue'),
      },
      {
        path: '/behavior-records/:classroomId/personnel',
        name: 'personnel',
        meta: {
          title: '학급기록',
          class: 'behavior-container',
        },
        component: () => import(/* webpackChunkName: "behavior-personnels" */ '@/apps/behavior/pages/personnel/Personnels.vue'),
      },
      {
        path: '/behavior-records/:classroomId/reports',
        name: 'reports',
        meta: {
          title: '학급기록',
          class: 'behavior-container',
        },
        component: () => import(/* webpackChunkName: "behavior-reports" */ '@/apps/behavior/pages/reports/Reports.vue'),
        redirect: '/behavior-records/:classroomId/reports/point-report',
        children: [
          {
            path: '/behavior-records/:classroomId/reports/point-report',
            name: 'point-report',
            meta: {
              title: '학급기록',
              class: 'behavior-container',
            },
            component: () => import(/* webpackChunkName: "point-report" */ '@/apps/behavior/pages/reports/PointReport.vue'),
          },
          {
            path: '/behavior-records/:classroomId/reports/record-report',
            name: 'record-report',
            meta: {
              title: '학급기록',
              class: 'behavior-container',
            },
            component: () => import(/* webpackChunkName: "record-report" */ '@/apps/behavior/pages/reports/RecordReport.vue'),
          },
          {
            path: '/behavior-records/:classroomId/reports/report-history',
            name: 'report-history',
            meta: {
              title: '학급기록',
              class: 'behavior-container',
            },
            component: () => import(/* webpackChunkName: "record-history" */ '@/apps/behavior/pages/reports/ReportHistory.vue'),
          },
        ],
      },
      {
        path: '/behavior-records/:classroomId/toolkit',
        name: 'toolkit',
        meta: {
          title: '학급기록',
          class: 'behavior-container',
        },
        component: () => import(/* webpackChunkName: "behavior-toolkit" */ '@/apps/behavior/pages/toolkit/Toolkit.vue'),
      },
      {
        path: '/behavior-records/:classroomId/groupmission/:tab',
        name: 'groupmission',
        meta: {
          title: '단체미션',
          class: 'behavior-container',
        },
        component: () => import(/* webpackChunkName: "behavior-groupmission" */ '@/apps/behavior/pages/groupmission/GroupMission.vue'),
      },
    ],
  },
  {
    path: '/checklist/:tokenId',
    name: 'checklist',
    meta: {
      title: '학급기록',
      class: 'behavior-container',
    },
    component: () => import(/* webpackChunkName: "behavior-checklist" */ '../apps/behavior/pages/personnel/ExternalChecklist.vue'),
  },
  {
    path: '/noti',
    name: 'noti',
    meta: {
      title: 'HiClass',
      class: 'page-mypage mypage-privacy-info layout2',
    },
    component: () => import(/* webpackChunkName: "noti" */ '../apps/noti/Noti.vue'),
    children: [
      {
        path: '/noti/closeAccount',
        name: 'closeAccount',
        meta: {
          title: 'HiClass',
          class: 'page-mypage mypage-privacy-info layout2',
        },
        component: () => import(/* webpackChunkName: "noti-closeAccount" */ '../apps/noti/closeAccount/NotiCloseAccountComp.vue'),
      },
    ],
  },
  // mobile timetable: 컴포넌트가 중첩되지 않도록 라우터를 children으로 두지 않고 동일 레벨로 분리. -->
  {
    path: "/mobile/timetable",
    name: "TimetableMobile",
    component: () => import("@/apps/hc2/TimetableMobile.vue"),
    redirect: '/mobile/timetable',
    meta: {
      title: 'HiClass',
    },
  }, 
  {
    path: '/mobile/timetable/change-history',
    name: 'mobile-timetable-change-history',
    meta: {
      title: 'HiClass',
    },
    component: () => import("@/apps/hc2/TimetableMobile.vue"),
  },
  {
    path: '/mobile/timetable/change-history/:lessonChangeId',
    name: 'mobile-timetable-change-history-detail',
    meta: {
      title: 'HiClass',
    },
    component: () => import("@/apps/hc2/TimetableMobile.vue"),
  },
  {
    path: '/mobile/timetable/change-lesson/:lessonChangeType',
    name: 'mobile-timetable-change-lesson-:lessonChangeType',
    meta: {
      title: 'HiClass',
    },
    component: () => import("@/apps/hc2/TimetableMobile.vue"),
  },
  // <-- mobile timetable
  // mobile webview route
  {
    path: '/mobile',
    name: 'mobile',
    redirect: '/mobile/help',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "mobile" */ '../apps/mobile/Mobile.vue'),
    children: [
      {
        path: '/mobile/agreement',
        name: 'mobile-agreement',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-agreement" */ '../apps/mobile/MobileAgreement.vue'),
      },
      {
        path: '/mobile/guardian-verification',
        name: 'mobile-guardian-verification',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-guardian-verification" */ '../apps/mobile/MobileGuardianVerification.vue'),
      },
      {
        path: '/mobile/help',
        name: 'mobile-help',
        redirect: '/mobile/help/notice',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-help" */ `../apps${logic.pathOfMobileHelp}/MobileHelp.vue`),
        children: [
          {
            path: '/mobile/help/:id',
            name: 'mobile-help-:id',
            meta: {
              title: 'HiClass',
            },
            component: () => import(/* webpackChunkName: "mobile-help-" */ `../apps${logic.pathOfMobileHelp}/MobileHelp.vue`),
          },
        ],
      },
      {
        path: '/mobile/help2',
        name: 'mobile-help2',
        redirect: '/mobile/help2/faq',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-help2" */ '../apps/mobile/help2/MobileHelp.vue'),
        children: [
          {
            path: '/mobile/help2/:id',
            name: 'mobile-help2-:id',
            meta: {
              title: 'HiClass',
            },
            component: () => import(/* webpackChunkName: "mobile-help2-" */ '../apps/mobile/help2/MobileHelp.vue'),
          },
        ],
      },
      {
        path: '/mobile/terms',
        name: 'mobile-terms',
        redirect: '/mobile/terms/service',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-terms" */ '../apps/mobile/terms/MobileTerms.vue'),
        children: [
          {
            path: '/mobile/terms/sensitive',
            name: 'mobile-terms-sensitive',
            redirect: '/mobile/terms/sensitive/allergy',
            meta: {
              title: 'HiClass',
            },
            component: () => import(/* webpackChunkName: "mobile-terms-sensitive" */ '../apps/mobile/terms/MobileTerms.vue'),
          },
          {
            path: '/mobile/terms/sensitive/:param',
            name: 'mobile-terms-sensitive-param',
            meta: {
              title: 'HiClass',
            },
            component: () => import(/* webpackChunkName: "mobile-terms-sensitive" */ '../apps/mobile/terms/MobileTerms.vue'),
          },
          {
            path: '/mobile/terms/:id',
            name: 'mobile-terms-:id',
            meta: {
              title: 'HiClass',
            },
            component: () => import(/* webpackChunkName: "mobile-terms-" */ '../apps/mobile/terms/MobileTerms.vue'),
            children: [
              {
                path: '/mobile/terms/:id/:param',
                name: 'mobile-terms-:id',
                meta: {
                  title: 'HiClass',
                },
                component: () => import(/* webpackChunkName: "mobile-terms-" */ '../apps/mobile/terms/MobileTerms.vue'),
              },
            ],
          },
        ],
      },
      {
        path: '/mobile/invite',
        name: 'mobile-invite',
        redirect: '/mobile/invite/clazzInviteCard',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-invite" */ '../apps/mobile/invite/MobileInvite.vue'),
        children: [
          {
            path: '/mobile/invite/:id',
            name: 'mobile-invite-id',
            meta: {
              title: 'HiClass',
            },
            component: () => import(/* webpackChunkName: "mobile-invite-id" */ '../apps/mobile/invite/MobileInvite.vue'),
          },
        ],
      },
      {
        path: '/mobile/post',
        name: 'mobile-post',
        redirect: '/mobile/post/create',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-post" */ '../apps/mobile/post/MobilePost.vue'),
        children: [
          {
            path: '/mobile/post/:id',
            name: 'mobile-post-id',
            meta: {
              title: 'HiClass',
            },
            component: () => import(/* webpackChunkName: "mobile-post-id" */ '../apps/mobile/post/MobilePost.vue'),
          },
        ],
      },
      {
        path: '/mobile/alarmplus',
        name: 'mobile-alarmplus',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-alarmplus" */ '../apps/mobile/alarmplus/MobileAlarmPlus.vue'),
      },
      {
        path: '/mobile/event',
        name: 'mobile-event',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "mobile-event" */ '../apps/mobile/event/MobileEvent.vue'),
        children: [
          {
            path: ':id',
            name: 'event uuid',
            meta: {
              title: 'HiClass',
              // class: "page-school-class"
            },
            component: () => import(/* webpackChunkName: "mobile-event-id" */ '../apps/mobile/event/MobileEvent.vue'),
          },
        ],
      },
    ],
  },
  // -- mobile webview route
  // worksheet
  {
    path: '/worksheetCreate/:parentId',
    name: 'worksheet-create',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "worksheet-create" */ '../apps/worksheetCreate/WorksheetCreate.vue'),
    children: [
      {
        path: ':sheetId',
        name: 'worksheet-create-sheets',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "worksheet-create-sheets" */ '../apps/worksheetCreate/WorksheetCreate.vue'),
      },
    ],
  },
  {
    path: '/worksheetApply/:parentId/:sheetId',
    name: 'worksheet-apply',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "worksheet-apply" */ '../apps/worksheetApply/WorksheetApply.vue'),
    children: [
      {
        path: ':applyId',
        name: 'worksheets-apply-applyId',
        meta: {
          title: `HiClass`,
        },
        component: () => import(/* webpackChunkName: "worksheets-apply-applyId" */ '../apps/worksheetApply/WorksheetApply'),
      },
    ],
  },
  /**
   * 워크시트 신청서 제출 iframe
   */
  {
    path: '/worksheetSubmit/:sheetId',
    name: 'worksheet-submit',
    meta: {
      title: 'HiClass',
    },
    component: () => import('../apps/worksheetSubmit/WorksheetSubmit.vue'),
    children: [
      {
        path: ':applyId',
        name: 'worksheets-submit-detail',
        meta: {
          title: 'HiClass',
        },
        component: () => import('../apps/worksheetSubmit/WorksheetSubmit.vue'),
      },
      {
        path: ':applyId/:viewType',
        name: 'worksheets-submit-modify',
        meta: {
          title: `HiClass`,
        },
        component: () => import('../apps/worksheetSubmit/WorksheetSubmit.vue'),
      },
    ],
  },
  {
    path: '/worksheets/:parentId/:sheetId',
    name: 'worksheets',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "worksheets" */ '../apps/worksheets/Worksheet.vue'),
    children: [
      {
        path: ':viewType',
        name: 'worksheets-viewType',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "worksheets-viewType" */ '../apps/worksheets/Worksheet.vue'),
        children: [
          {
            path: ':hideMakeHeader',
            name: 'worksheets-viewType-hideMakeHeader',
            meta: {
              title: `HiClass`,
            },
            component: () => import(/* webpackChunkName: "worksheets-viewType-hideMakeHeader" */ '../apps/worksheets/Worksheet.vue'),
          },
        ],
      },
    ],
  },
  // -- worksheet
  {
    path: '/account',
    name: 'account',
    redirect: '/account/deactivate',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "account" */ '../apps/account/Account.vue'),
    children: [
      {
        path: '/account/deactivate',
        name: 'account-deactivate',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "account-deactivate" */ '../apps/account/deactivate/AccountDeactivate.vue'),
      },
      {
        path: '/account/deactivate/:socialType',
        name: 'account-deactivate-socialType',
        meta: {
          title: 'HiClass',
        },
        component: () => import(/* webpackChunkName: "account-deactivate-socialType" */ '../apps/account/deactivate/AccountDeactivate.vue'),
      },
    ],
  },
  {
    path: '/event/:eventId/:eventName/:postId/:pageType',
    name: 'event-main',
    component: () => import(/* webpackChunkName: "event-main" */ '../apps/events/EventMain.vue'),
  },
  {
    path: '/event-timetable',
    redirect: '/event/timetable'
  },
  {
    path: '/event/:eventName',
    name: 'event-fullScreen',
    component: () => import(/* webpackChunkName: "eventFullScreen" */ '../apps/events/fullScreen/Main.vue'),
  },
  {
    path: '/appLoading',
    name: 'app-loading',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "app-loading" */ '../apps/appLoading/AppLoading.vue'),
  },
  {
    path: '/alarmplus/index',
    name: 'alarmplusIndex',
    meta: {
      title: '하이클래스 학교알리미',
      class: 'iframeShow'
    },
    component: () => import(/* webpackChunkName: "mainAlarmplusIndex" */ '../apps/alarmplus/AlarmPlusIndex.vue'),
  },
  ...surveys,
  /* 2025.04.07, timetable. prototype */  
  {
    path: "/timetable",
    meta: {
      title: "HiClass",
    },
    component: () =>      import("@/apps/timetable/pages/TimetableIndex.vue"),
    redirect: "/timetable/basic-info",
    children: [
      {
        path: "create",
        name: "TimetableCreate",
        meta: {
          title: "HiClass",
        },
        component: () =>
          import("@/apps/timetable/pages/TimetableBasicInfo.vue"),
      },
      {
        path: ":timetableId/:templateId?/basic-info",
        name: "TimetableBasicInfo",
        meta: {
          title: "HiClass",
        },
        component: () =>
          import("@/apps/timetable/pages/TimetableBasicInfo.vue"),
      },
      {
        //
        path: ':timetableId/:templateId?/weekly-period',
        name: 'TimetableWeeklyPeriod',
        component: () => import('@/apps/timetable/pages/TimetableWeeklyPeriod.vue'),
      },
      {
        path: ":timetableId/:templateId?/courses",
        name: "TimetableCourses",
        meta: {
          title: "HiClass",
        },
        component: () =>
          import("@/apps/timetable/pages/TimetableCourses.vue"),
      },      
      {
        // 교사별 등록
        path: ':timetableId/:templateId?/teachers',
        name: 'TimetableTeachers',
        component: () => import('@/apps/timetable/pages/TimetableTeachers.vue'),
      },
      {
        // 교사별 과목 등록
        // 2025.10.15. Deprecated
        path: ':timetableId/:templateId/teacher-courses',
        name: 'TimetableTeacherCourses',
        component: () => import('@/apps/timetable/pages/TimetableTeacherCourses.vue'),
      },
      {
        // 시수표 등록
        path: ':timetableId/:templateId/lesson-config',
        name: 'TimetableLessonConfig',
        component: () => import('@/apps/timetable/pages/TimetableLessonConfig.vue'),
      },
      {
        // 부가 작업 등록
        path: ':timetableId/:templateId/additional-work',
        name: 'TimetableAdditionalWork',
        component: () => import('@/apps/timetable/pages/TimetableAdditionalWork.vue'),
      },
      {
        // 시간표 생성 및 수정
        path: ':timetableId/:templateId/generate',
        name: 'TimetableGenerate',
        component: () => import('@/apps/timetable/pages/TimetableGenerate.vue'),
      },
      /*
      {
        path: ":timetableId/basic-info",
        name: "TimetableBasicInfo",
        meta: {
          title: "HiClass",
        },
        component: () =>
          import("@/apps/timetable/pages/TimetableBasicInfo.vue"),
      },
      {
        path: ":timetableId/courses",
        name: "TimetableCourses",
        meta: {
          title: "HiClass",
        },
        component: () =>
          import("@/apps/timetable/pages/TimetableCourses.vue"),
      },      
      {
        // 교사별 등록
        path: ':timetableId/teachers',
        name: 'TimetableTeachers',
        component: () => import('@/apps/timetable/pages/TimetableTeachers.vue'),
      },
      {
        // 교사별 과목 등록
        // 2025.10.15. Deprecated
        path: ':timetableId/teacher-courses',
        name: 'TimetableTeacherCourses',
        component: () => import('@/apps/timetable/pages/TimetableTeacherCourses.vue'),
      },
      {
        //
        path: ':timetableId/weekly-period',
        name: 'TimetableWeeklyPeriod',
        component: () => import('@/apps/timetable/pages/TimetableWeeklyPeriod.vue'),
      },
      {
        // 시수표 등록
        path: ':timetableId/lesson-config',
        name: 'TimetableLessonConfig',
        component: () => import('@/apps/timetable/pages/TimetableLessonConfig.vue'),
      },
      {
        // 부가 작업 등록
        path: ':timetableId/additional-work',
        name: 'TimetableAdditionalWork',
        component: () => import('@/apps/timetable/pages/TimetableAdditionalWork.vue'),
      },
      {
        // 시간표 생성 및 수정
        path: ':timetableId/generate',
        name: 'TimetableGenerate',
        component: () => import('@/apps/timetable/pages/TimetableGenerate.vue'),
      },
      {
        // 시간표 생성 및 수정
        path: ':timetableId/generate-bridge',
        name: 'TimetableGenerate',
        component: () => import('@/apps/timetable/pages/TimetableGenerate_prototype.vue'),
      },
      {
        // 최종 시간표 확인 및 인쇄
        path: ':timetableId/final-check',
        name: 'TimetableFinalCheck',
        component: () => import('@/apps/timetable/pages/TimetableFinalCheck.vue'),
      },
      */
    ],

  },

  // sample page
  {
    path: '/sample/i18n',
    name: 'sample-i18n',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "sample-i18n" */ '@/apps/sample/i18n'),
  },

  // designsys test page
  {
    path: '/sample/designsys',
    name: 'sample-designsys',
    meta: {
      title: 'HiClass',
    },
    component: () => import('@/apps/sample/Designsys'),
  },
  {
    path: '/hc2/designsys',
    name: 'DesignSys',
    meta: {
      title: 'HiClass',
    },
    component: () => import('@/apps/hc2/DesignSys'),
  },

  {
    path: '*',
    name: 'error-pageNotFound',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "error-pageNotFound" */ '../apps/error/ErrorPageNotFound.vue'),
  },
  {
    path: '/errorPageServiceCheck',
    name: 'error-pageServiceCheck',
    meta: {
      title: 'HiClass',
    },
    component: () => import(/* webpackChunkName: "error-pageServiceCheck" */ '../apps/error/ErrorPageServiceCheck.vue'),
  },
  {
    path: '/price',
    component: () => import('../apps/help/price/Price.vue'),
  },
  {
    path: '/m/:code?/:targetCode?',
    name: 'weblink-detail',
    component: () => import(/* webpackChunkName: "text-send" */ '@/apps/hc2/WebLinkDetail'),
  },
  ...DevEnvironmentRoutes,
];
