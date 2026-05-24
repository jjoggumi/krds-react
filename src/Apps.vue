<template v-cloak>
  <div id="apps">
    <ErrorPageServiceCheck
      v-if="isServiceCheck"
      :url="serviceCheckImageUrl"
      :key="`error-page-service-check-${key}`"
    />

    <router-view
      v-else-if="!isServiceCheck && isService"
      :key="`service-${key}`"
    />

    <!-- 스테이지 /상용 SSO 검증 이슈로 비활성화 처리 -->
    <!--
    <template v-if="false">
      &lt;!&ndash; 하이클래스 로그인 계정과 아이스크림 SSO 로그인 일치 여부 확인 &ndash;&gt;
      <login-sso-check
        v-if="!isServiceCheck && isService && isUseLoginSsoCheck"
        :key="`login-sso-check-${key}-uid-${ssoLoginCheck.uid}`"
      />
    </template>
    -->

    <!-- 아이스크림 선생님 토큰 정보로 강제 로그아웃 처리 -->
    <login-token-check
      v-if="!isServiceCheck && isService && isUseLoginSsoCheck"
      :key="`login-token-check-${key}`"
    />

    <terms-view
      v-if="$store.state.termsView.isOpen"
      :key="$moment().format('YYYY-MM-DD')"
      :layerType="$store.state.termsView.layerType"
      :userType="$store.state.termsView.userType"
      :modalClass="$store.state.termsView.modalClass"
    />

    <survey-recommend-template-modal
      v-if="isRecommendTemplateOpen"
    />

    <!-- 이미지, 비디오 상세보기 -->
    <image-view
      v-if="imageView.isOpen &&
        $comn.isImage(imageView.items, 'both').length > 0
      "
      @closeAttach="closeAttach"
    />

    <!-- 문서 미리보기 -->
    <pdf-viewer
        v-if="docView.isOpen"
      :isDocView="docView.isOpen"
      :file="docView.item"
      @closeAttach="closeAttach"
    />

    <html-print
      v-if="$store.state.htmlPrint.isOpen"
      :content="$store.state.htmlPrint.content"
    />

    <worksheet-print
      v-if="$store.state.storeWorksheet.worksheetPrint.isOpen"
      :selectedItemApplyIds="$store.state.storeWorksheet.worksheetPrint.selectedItemApplyIds"
    />

    <html-pdf-download
      v-if="htmlPdfDownload.isOpen"
      :pdfContent="htmlPdfDownload.pdfContent"
      :pdfContentHeight="htmlPdfDownload.pdfContentHeight"
      :fileName="htmlPdfDownload.fileName"
    />

    <clazz-apply-reject-list
      v-if="clazzApplyRejectList.isOpen"
    />

    <survey-create-target-modal
      v-if="surveyCreateTargetModal.isOpen"
    />

    <survey-create-confirm-modal
      v-if="surveyCreateConfirmModal.isOpen"
    />

    <survey-create-lnb-page-rename-modal
      v-if="surveyCreateLnbPageRenameModal.isOpen"
    />

    <survey-respondent-modal
      v-if="isCurSurveyRespondentModalOpen"
    />

    <survey-report-statistics-after-school-applicant-modal
      v-if="isSurveyReportAfterSchoolPopupOpen"
    />

    <survey-report-statistics-consultation-answer-modal
      v-if="isConsultationAnswerPopupOpen"
    />

    <post-edit
      v-if="curPostEdit.isOpen && curPostEdit.postVersion === 'V2'"
      :key="curPostEdit.componentKey"
      :post="curPostEdit.post"
      :param-option="curPostEdit.paramOption"
      :param-model="curPostEdit.paramModel"
      :parent-id="curPostEdit.parentId"
      :school-type="curPostEdit.schoolType"
      @do-remount="curPostEdit.componentKey++"
      @close-post-edit="onClosePostEdit"
    />

    <post-edit-v1
      v-if="curPostEdit.isOpen && curPostEdit.postVersion !== 'V2'"
      :key="curPostEdit.componentKey"
      :mode="curPostEdit.mode"
      :post="curPostEdit.post"
      :is-opened-detail-popup="false"
    />

    <image-editor-main v-if="imageEditorIsShow"/>

    <!-- 새 탭 로딩 Dim -->
    <transition name="fade">
      <main-loading-new-tab-dim v-if="$store.state.isDimLoading"/>
    </transition>

    <!-- 새 탭 로딩 -->
    <main-loading-new-tab v-if="$store.state.isNewTabLoading"/>

    <!-- 로딩 백그라운드 투명 처리 -->
    <loading-overlay
      key="loading-overlay1"
      :active.sync="isFileLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
      :z-index="99999"
    />

    <!-- 로딩 백그라운드 투명 처리 2 -->
    <loading-overlay
      key="loading-overlay2"
      :active.sync="isLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
      :blur="'0px'"
      :opacity="0"
      :z-index="99999"
    />
    <!-- loading-overlay : rgba(0,0,0,.4) -->

    <!-- 로딩 백그라운드 시간이 지나면 백그라운드 처리 -->
    <loading-overlay
      key="loading-overlay3"
      :active.sync="isConsultationLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(0,0,0,.3)'"
      :blur="'0px'"
      :opacity="0"
      :z-index="99999"
      class="consultation"
    />

    <!-- 서비스 점검 이미지 체크 -->
    <img
      v-if="serviceCheckImageUrl"
      ref="serviceCheckImage"
      :src="serviceCheckImageUrl !== 'isService' ? serviceCheckImageUrl : ''"
      alt=""
      @load="serviceCheckImageLoad"
      @error="serviceCheckImageError"
      style="visibility: hidden; display: none;"
    />

    <not-supported-browser
      v-if="$store.state.notSupportedBrowser.isOpen"
    />

    <global-events
      v-if="isUseKeyCapture"
      @keyup="initAppsKeyup"
    />

    <class-sort 
      v-if="classSort.open"
    />
    <!-- 마케팅 동의 팝업 -->
    <marketing-consent v-if="isShowMarketingConsentPopup && !hasWebHomePopup"/>
    
  </div>
</template>

<script>
// import LoginSsoCheck from "@/components/Login/LoginSsoCheck";
import LoginTokenCheck from "@/components/Login/LoginTokenCheck";

import {version} from '@/../package.json'

import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";
import {eventBus} from "@/main";
import jwt_decode from "jwt-decode";

import MainLoadingNewTabDim from "@/apps/main/MainLoadingNewTabDim";
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import NotSupportedBrowser from "@/components/Popup/NotSupportedBrowser";
import MainLoadingNewTab from "@/apps/main/MainLoadingNewTab";
import SurveyCreateTargetModal from "@/components/Modal/SurveyCreateTargetModal";
import SurveyCreateConfirmModal from "@/components/Modal/SurveyCreateConfirmModal";
import SurveyCreateLnbPageRenameModal from "@/components/Modal/SurveyCreateLnbPageRenameModal";
import SurveyRespondentModal from "@/components/Modal/SurveyRespondentModal";
import SurveyRecommendTemplateModal from "@/components/Modal/SurveyRecommendTemplate/SurveyRecommendTemplateModal";
import SurveyReportStatisticsAfterSchoolApplicantModal
  from "@/apps/surveyReport/components/statistics/modal/SurveyReportStatisticsAfterSchoolApplicantModal";
import SurveyReportStatisticsConsultationAnswerModal
  from "@/apps/surveyReport/components/statistics/modal/SurveyReportStatisticsConsultationAnswerModal";
import PostEdit from "@/components/Popup/PostEdit";
import PostEditV1 from "@/components/Popup/PostEditV1";
import ClassSort from "@/components/Modal/ClassSort";
import axios from 'axios'
import ImageEditorMain from "@/components/ImageEditor/Main";
import MarketingConsent from "@/components/Popup/MarketingConsent";
import externalEnterable from '@/mixins/externalEnterable'
import Vue from 'vue'
import * as Sentry from "@sentry/vue";

import { useElectronController } from '@/apps/hitalk/utils'
const electronController = useElectronController()

/**
 * // 로드 할 컴포넌트(Promise 여야 합니다.)
 component: import(staticUrl),
 // 비동기 컴포넌트가 로딩중일 때 사용할 컴포넌트
 // loading: MainLoadingNewTabDim,
 // 비동기 컴포넌트 로딩이 실패했을 때 사용할 컴포넌트
 error: ErrorLoadFailAsyncComponent,
 // 로딩 컴포넌트를 보여주기 전의 지연시간. (기본값: 200ms)
 delay: 200,
 // 초과되었을 때 에러 컴포넌트를 표시할 타임아웃. (기본값: 무한대)
 timeout: 3000
 */
const HtmlPrint = () => ({
  component: import("@/components/Print/HtmlPrint"),
  error: ErrorLoadFailAsyncComponent,
})
const TermsView = () => ({
  component: import("@/components/Terms/TermsView"),
  error: ErrorLoadFailAsyncComponent,
})
const ImageView = () => ({
  component: import('@/components/Viewer/ImageViewer.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const PdfViewer = () => ({
  component: import('@/apps/main/MainBodyPDFViewer.vue'),
  error: ErrorLoadFailAsyncComponent,
})
const ErrorPageServiceCheck = () => ({
  component: import('./apps/error/ErrorPageServiceCheck'),
  error: ErrorLoadFailAsyncComponent,
})
const WorksheetPrint = () => ({
  component: import('@/components/Print/WorksheetPrint'),
  error: ErrorLoadFailAsyncComponent,
})
const ClazzApplyRejectList = () => ({
  component: import('@/components/Modal/ClazzApplyRejectList'),
  error: ErrorLoadFailAsyncComponent,
})
const HtmlPdfDownload = () => ({
  component: import('@/components/Download/HtmlPdfDownload.vue'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'apps',
  mixins: [externalEnterable],
  components: {
    MarketingConsent,
    ImageEditorMain,
    PostEditV1,
    PostEdit,
    SurveyReportStatisticsConsultationAnswerModal,
    SurveyReportStatisticsAfterSchoolApplicantModal,
    SurveyRecommendTemplateModal,
    SurveyCreateLnbPageRenameModal,
    SurveyCreateConfirmModal,
    SurveyCreateTargetModal,
    SurveyRespondentModal,
    MainLoadingNewTab,
    NotSupportedBrowser,
    MainLoadingNewTabDim,
    LoginTokenCheck,
    // LoginSsoCheck,

    HtmlPrint,
    WorksheetPrint,
    TermsView,
    ImageView,                          // 이미지 미리보기
    PdfViewer,                            // 첨부문서 미리보기
    ErrorPageServiceCheck,
    ClazzApplyRejectList,       // 클래스 신청서 담임 확인 등록/수정/목록 팝업
    HtmlPdfDownload,
    ClassSort,

    // 파일 업로드 / 다운로드 로딩
    LoadingOverlay: () => import('vue-loading-overlay')
  },
  data() {
    return {
      isService: false,
      isServiceCheck: false,
      serviceCheckImageUrl: null,
      ssoLoginCheck: {
        uid: null
      },
    }
  },
  computed: {
    ...mapState([
      'isMobileObj',
      'isUseKeyCapture',
      'isFileLoading',
      'isLoading',
      'isConsultationLoading',
      'imageView',
      'docView',
      'htmlPdfDownload',
      'curPostEdit',
      'isVisibleWindow',
      'classSort',
      'isShowMarketingConsentPopup',
      'hasWebHomePopup',
      'versionData'
    ]),
    ...mapState('storeSurvey', [
      'surveyCreateTargetModal',
      'surveyCreateConfirmModal',
      'surveyCreateLnbPageRenameModal',
      'isCurSurveyRespondentModalOpen',
      'isRecommendTemplateOpen',
      'isSurveyReportAfterSchoolPopupOpen',
      'isConsultationAnswerPopupOpen'
    ]),
    ...mapState('storeImageEditor', {
      imageEditorIsShow: 'isShow'
    }),
    ...mapGetters({
      isMobile: 'isMobile',
    }),
    ...mapFields({
      clazzApplyRejectList: 'clazzApplyRejectList',
    }),
    userType() {
      return localStorage.getItem('userType')
    },
    loginId() {
      return localStorage.getItem('principalName')
    },
    userSns() {
      return localStorage.getItem('clientRegistrationId')
    },

    isTeacher() {
      return this.userType === 'TEACHER'
    },
    isIScream() {
      return this.userSns === 'iScream'
    },

    isUseLoginSsoCheck() {
      return !!(
        this.isUsePath() &&
        this.isTeacher && this.isIScream && this.loginId
      )
    },

    key() {
      return `apps-${version}`
    },

    isOnPageWhichNeedSmartReloading() {
      return ['/behavior-records'].some((path) => {
        return this.$route.path.startsWith(path)
      })
    },

    profile() {
      return process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net' ? 'production'
        : ['https://devui.hiclass.net', 'https://devboard.hiclass.net'].includes(process.env.VUE_APP_BASE_UI_URI) ? 'dev' : 'stage'
    }
  },
  watch: {
    isUseLoginSsoCheck(val) {
      if (val) {
        if (localStorage.getItem('isLoadingSsoLoginCheck'))
          this.getSsoLoginCheckUid()
      }

    },
    isVisibleWindow(val) {
      if(val) {
        this.callServerVersionCheck()
      }
    },
    $route(to, form) {
      if (to.path !== form.path) {
        this.callServerVersionCheck()
      }
    }
  },
  created() {
    // eslint-disable-next-line no-console
    console.info(`hiclass web package version => `, version)

    this.callServerVersionCheck()

    this.initCurrentTimestamp()

    this.setAxios({
      axios: this.$axios
    })
    this.setHiClass({
      hiClass: this.$hiClass
    })
    this.setLog({
      log: this.$log
    })

    /**
     * isMobile check alert
     */
    // this.toastIsMobile()
    this.initSentry()
  },
  mounted() {
    this.$nextTick(() => {
      this.initVisibilityChange()
    })
    window.addEventListener('contextmenu', this.disabledDevTools)
    window.addEventListener('keydown', this.disabledDevTools)

    /*
     * 다른 문서(화면)에서 storage 를 변경하였을 때 발생하는 이벤트
     * https://developer.mozilla.org/ko/docs/Web/API/WindowEventHandlers/onstorage
     */
    window.onstorage = (event) => {
      // if (event.oldValue !== event.newValue) {}
      if (event.key === 'isChangedClassSettings' && event.newValue === 'true') {
        eventBus.$emit('is-changed-class-settings', event.key)
      }

      /**
       * idToken uuid(userId), store state userId 유효성 체크
       */
      if (localStorage.idToken
        && this.$store.state.user
        && (this.$store.state.user.currentId || this.$store.state.user.userId)
      ) {
        try {
          const decoded = jwt_decode(localStorage.idToken)
          const storeUserId = this.$store.state.user.currentId || this.$store.state.user.userId
          if (!decoded.uuid) {
            this.$hiClass.alert('로그인 정보가 변경되어 로그아웃 처리됩니다.', 'info')
              .then(() => this.$router.push('/logout', () => {
              }))
          } else if (decoded.uuid !== storeUserId) {
            this.$hiClass.alert('로그인 정보가 변경되었습니다.<br>창을 새로고침합니다.', 'info')
              .then(() => {
                if (this.isOnPageWhichNeedSmartReloading) {
                  document.location = `/${this.$route.path.split('/')[1]}`
                }
                else {
                  this.$router.go(0)
                }
              })
          }
        } catch (e) {
          this.$log.error(e)
        }
      }
    }

    window.onpopstate = () => {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
    }
    document.body.style.overflow = ''
  },
  beforeDestroy() {
    window.removeEventListener('contextmenu', this.disabledDevTools)
    window.removeEventListener('keydown', this.disabledDevTools)
  },
  methods: {
    ...mapMutations(["setAxios", "setHiClass", "setLog", "setVersionData"]),
    ...mapActions([
      "openTermsView",
      "initCurrentTimestamp",
      "toastIsMobile",
      "initVisibilityChange",
      "initAppsKeyup",
      "onClosePostEdit"
    ]),
    ...mapActions('storeHitalk', [
      'callChatWebToken'
    ]),
    getSsoLoginCheckUid() {
      this.ssoLoginCheck.uid = this.$comn.split(this.$route.query.uid, ',') || null

      if (this.ssoLoginCheck.uid)
        localStorage.setItem('ssoLoginCheckUid', this.ssoLoginCheck.uid)
    },

    isUsePath() {
      const curPath = this.$route.path
      const usePaths = ['/main', '/help']
      const excludePaths = [
        '/main/alarmplus',
        '/main/clazzes/note/newboard',
        '/main/chat',
      ]
      let isUsePath = false

      if (curPath === '/' || excludePaths.find(path => curPath.startsWith(path)))
        return false

      if (usePaths.find(path => curPath.startsWith(path)))
        isUsePath = true

      return isUsePath
    },

    serviceCheckImageLoad(event) {
      // this.$log.debug(`serviceCheckImageLoad event => `, event)
      this.isServiceCheck = true
      this.$authentication.clear()
      this.$router.replace('/', () => {
      })
    },

    serviceCheckImageError(event) {
      // this.$log.debug(`serviceCheckImageError event => `, event)
      this.isService = true
    },

    closeAttach() {
      setTimeout(() => {
        eventBus.$emit('detail-post-item-body-on-vco')
        eventBus.$emit('alarm-plus-detail-popup-on-vco')
      }, 150)
    },

    disabledDevTools(event) {
      this.$log.debug(`disabledDevTools event => `, event)
      /**
       * 브라우저 개발자 도구 접근 차단
       * - F12 키 입력
       * - ctrl + shift + i 키 입력
       * - ctrl + shift + j 키 입력
       */
      if (this.$store.state.isProductionUI) {
        switch (event.type) {
          case 'keydown': {
            if (event.keyCode === 123
              || (event.ctrlKey && event.shiftKey && event.keyCode === 73)
              || (event.ctrlKey && event.shiftKey && event.keyCode === 74)
            ) {
              const message = '키보드로 개발자도구 열기 차단'
              this.$log.warn(message)
              event.preventDefault()
              event.stopPropagation()
            }
            break
          }
          default:
        }
      }

    },
    getProfiledCDNUrl(uriPattern) {
      return `${process.env.VUE_APP_URL_PROTOCOL}${process.env.VUE_APP_BASE_CDN_URI}${uriPattern.replace('_PROFILE_', this.profile)}`
    },
    loadCdnJson(uriPattern) {
      return axios.get(this.getProfiledCDNUrl(uriPattern) + '?' + Date.now(), {
        cache: false,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    },
    async callServerVersionCheck() {
      try {
        const response = await this.loadCdnJson('/static/version/_PROFILE_/version.json')
        //서비스 장애 여부 확인 
        const CHECK_SERVICE_URL = this.profile === 'production'
          ? 'https://download.hiclass.net/static/notices/pop_service_check_web.png'
          : 'https://download.hiclass.net/static/test/pop_service_check_web.png'
        this.serviceCheckImageUrl = response.data._embedded.web.serviceCheck
          ? `${CHECK_SERVICE_URL}?cache-bust=${Date.now()}`
          : 'isService'

        this.setVersionData({...response.data._embedded, ...JSON.parse((localStorage.getItem('dev') || '{}')).versionData})
        electronController.checkVersion(this.versionData)
      } catch (e) {
        this.$log.error(e)
      }
    },
    async initSentry() {
      if (document.location.hostname.indexOf('hiclass.net') < 0) return;
      if (document.location.hostname.indexOf('cbt2t') > 0) return;
      const res = await this.loadCdnJson('/static/conf/_PROFILE_/policy.web.json')
      if (!res.data) return
      const sentryPolicy = res.data.sentry
      Sentry.init({
        Vue,
        dsn: process.env.VUE_APP_SENTRY_DSN,
        release: version,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          })
        ],
        ...sentryPolicy.default,
        ...(sentryPolicy.userTypes[this.userType] || {}),
        ...((sentryPolicy.uuids || {})[localStorage.uuid] || {}),
      })
      Sentry.setUser({id: localStorage.uuid})
    }
  }
}
</script>

<style lang="scss">
[v-cloak] {
  display: none;
}

// fix sweetalert 2 use in modal
.swal2-container {
  z-index: 999999 !important;
}

.swal2-container .swal2-content {
  text-align: center;
}
// 게시글 수정 시 수신대상 추가된 경우 표시되는 팝업 모양 상이하여 글로벌에 추가된 css 삭제하였습니다. 
// .swal2-container .swal2-content .swal2-html-container {
//   display: inline-block !important;
//   width: fit-content;
// }

#apps {
  height: 100%;
}
</style>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
  opacity: 0;
}
</style>
