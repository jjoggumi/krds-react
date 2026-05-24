/**
 * Polyfills
 */
import "babel-polyfill";
import "mutationobserver-shim";
import 'whatwg-fetch'
import 'intersection-observer'
import 'mdn-polyfills/Node.prototype.replaceWith' // Polyfills copy-pasted from MDN
import 'mdn-polyfills/Element.prototype.matches'  // https://github.com/msn0/mdn-polyfills
import 'mdn-polyfills/NodeList.prototype.forEach'

/**
 * vue core libraries
 */
import Vue from "vue";
// @ts-ignore
import store from "@/plugins/vuex/store";
// @ts-ignore
import i18n from "@/plugins/i18n";
// @ts-ignore
import router from "@/plugins/router";
import Apps from "@/Apps.vue";


/**
 * logger
 */
import '@/plugins/logger.js'


/**
 * HTTP client
 */
// @ts-ignore
import axios from "@/plugins/axios";
// @ts-ignore
import jsonp from "jsonp";


/**
 * vue ecosystem
 */
// @ts-ignore
import Fragment from 'vue-fragment'
// @ts-ignore
import infiniteScroll from "vue-infinite-scroll";
import VeeValidate from 'vee-validate'
// @ts-ignore
import vClickOutside from "v-click-outside";
import Toasted from 'vue-toasted';
import Autolinker from 'autolinker' // autolinker original dist
// @ts-ignore
import autolinker, { AUTOLINKER_NAME } from 'vue-autolinker'  // vue autolinker wrapper
// @ts-ignore
import VueLocalStorage from 'vue-localstorage'
import loadingOverlay from 'vue-loading-overlay'  // vue-loading-overlay plugin
import 'vue-loading-overlay/dist/vue-loading.css'  // vue-loading-overlay stylesheet
import '@/plugins/vueLazyload.js'
import '@/plugins/vueScrollTo.js'
import '@/plugins/vueGlobalEvents.js'
import PortalVue from 'portal-vue'


/**
 * js Library
 */
import qs from "qs"
// @ts-ignore
import downloadjs from "downloadjs"
import '@/plugins/moment.js'
import '@/plugins/firebase'  // init firebase
import '@/plugins/jqueryUtil.js'
// @ts-ignore
import iframeResize from 'iframe-resizer/js/iframeResizer';


/**
 * authentication
 */
import "@/plugins/authentication.js";


/* common css */
import "@/assets/css/reset.css"             // reset
import "@/assets/css/slick.css"             // slick plugin
import "@/assets/css/jquery-ui.css"         // jQuery ui
import "@/assets/css/scss/common.scss"      // common scss
import "@/assets/css/common.css"            // common css
import "@/assets/css/hiclass.css"           // old css
import "@/assets/css/layout.css"            // renewal layout css
import "@/assets/css/main.css"              // 메인 화면 css
import "@/assets/css/sub.css"               // 서브페이지 css
import "@/assets/css/login.css"             // 로그인 및 가입 화면 css
import "@/assets/css/class.css"             // 클래스 화면 css
import "@/assets/css/event.css"             // 이벤트 템플릿 화면 
//import "@/assets/css/index.css"           // 인덱스 화면에 import
import "@/assets/css/board.css"             // 게시글 css
import "@/assets/css/survey.css"            // 설문,통계 css
import "@/assets/css/attendance.css"        // 출결 알리기 css
//import "@/assets/css/fix.css"             // 임시저장 css
import "@/assets/css/print.css"             // 학교 양식 신청서 pdf, 프린트 css
// import "@/assets/css/behavior-record.css"   // 행동기록에 import
// import "@/assets/css/behavior-reports.css"  // 행동기록에 import
// import "@/assets/css/behavior-viewer.css"   // 행동기록에 import
// import "@/assets/css/behavior-print.css"    // 행동기록에 import
import "@/assets/css/image-editor.css"      // 이미지 편집기

import "axios-progress-bar/dist/nprogress.css"
import "@/assets/css/nprogress.css"    // axios 프로그레스바 커스텀



/* legacy assets js */
// @ts-ignore
import comn from "@/assets/js/common.js";
// @ts-ignore
import stringUtil from "@/assets/js/stringUtil.js";
// @ts-ignore
import { validation, regex } from "@/assets/js/validation.js";
// @ts-ignore
import imgUtil from "@/assets/js/imgUtil.js";


// hiClass APIs
import "@/plugins/hiClass.js";


// 약관 템플릿
import '@/template/terms.js'

import '@/plugins/hiComponents.js'

import { useElectronController } from '@/apps/hitalk/utils'
const electronController = useElectronController()

if (electronController.isUnderElectron()) {
  import('@/assets/css/scss/electron-exclusive.scss');
}
import '@/constants/index.js'

// filter
// @ts-ignore
import * as filters from '@/plugins/filters' // global filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})


Vue.prototype.$axios = axios;
Vue.prototype.$jsonp = jsonp;
Vue.prototype.$comn = comn;
// Vue.prototype.$veeValidate = veeValidate;
Vue.prototype.$stringUtil = stringUtil;
Vue.prototype.$validation = validation;
Vue.prototype.$regex = regex;
Vue.prototype.$imgUtil = imgUtil;
Vue.prototype.$qs = qs;
Vue.prototype.$downloadjs = downloadjs;
Vue.prototype.$className = {
  className:'autolinker',
  stripPrefix: {
    scheme: false,
    www: false
  }
}
Vue.prototype.$editorName = process.env.VUE_APP_BASE_EDITOR_NAME;
Vue.prototype.$autoLinker = Autolinker
Vue.prototype.$autoLinkerOptions = {
  className:'autolinker',
  stripPrefix: {
    scheme: false,
    www: false
  }
}


/**
 * install Plugin
 */
Vue.use(Fragment.Plugin)
Vue.use(infiniteScroll);
Vue.use(VeeValidate);
Vue.use(vClickOutside);
Vue.use(loadingOverlay)
Vue.use(VueLocalStorage)
Vue.use(Toasted, {
  position: 'bottom-center',
  duration: 3000,
  singleton: true
})
Vue.use(PortalVue)

/**
 * directive setup
 */
Vue.directive(AUTOLINKER_NAME, autolinker)
Vue.directive('iframe-resize', {
  bind: function(el: HTMLElement, { value = {} }) {
    el.addEventListener('load', () => iframeResize(value, el))
  },
  // unbind: function (el) {
  //   el.iFrameResizer.removeListeners();
  // }
})


export const eventBus = new Vue();

const v = new Vue({
  // @ts-ignore
  i18n,
  router,
  store,
  // @ts-ignore
  render: h => h(Apps)
});

if (document.querySelector('#app')) {
  v.$mount("#app");
}

// @ts-ignore
(window).app = v;
