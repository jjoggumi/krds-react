/**
 * createReactPage(config)
 *
 * hc2 React 커스텀 엘리먼트를 감싸는 Vue 컴포넌트를 생성하는 팩토리.
 *
 * 기존 패턴:
 *   - Vue 파일 + ReactStyle mixin + HTML class 관리 + Vuex 매핑 → 매번 수동으로 작성
 *
 * 개선 후:
 *   - routes.js 에서 createReactPage({ tag, ... }) 한 줄로 컴포넌트 인라인 생성
 *
 * @param {Object} config
 * @param {string}   config.tag           Custom element 태그명 (hc2.js에 registerCustomElement된 것)
 * @param {string}   [config.name]        Vue 컴포넌트 name (디버깅용)
 * @param {string[]} [config.rootClasses] <html>에 추가할 클래스 목록 (기본: ['hc2'])
 *
 * @param {Object}   [config.vuexState]
 *   Vuex state를 컴포넌트 computed로 가져올 매핑.
 *   형식: { propName: 'stateName' }               ← 루트 state
 *         { propName: ['moduleName', 'stateName'] } ← 모듈 state
 *
 * @param {Object}   [config.vuexGetters]
 *   Vuex getters 매핑. vuexState와 동일한 형식.
 *
 * @param {Array}    [config.vuexActions]
 *   created()에서 dispatch할 액션 목록.
 *   형식: ['actionName'] | [['moduleName', 'actionName']]
 *   ※ 단순 데이터 로딩 액션만 넣을 것. 복잡한 로직은 guard 또는 reactEvents 사용.
 *
 * @param {Function} [config.guard]
 *   async (vm) => true | '/redirect-path'
 *   true를 반환하면 진입 허용. 문자열 반환 시 해당 경로로 redirect.
 *
 *   ⚠️  개발 환경(NODE_ENV=development)에서는 guard가 자동으로 스킵됩니다.
 *   서버 없이 로컬에서 테스트할 때 로그인/권한 체크 없이 페이지에 바로 접근할 수 있습니다.
 *   프로덕션 배포 시에는 반드시 guard 로직이 정상 동작하는지 확인하세요.
 *
 * @param {Function} [config.getProps]
 *   (vm) => Object
 *   커스텀 엘리먼트에 전달할 props를 반환. Object 값은 JSON.stringify 자동 처리.
 *
 * @param {Object}   [config.reactEvents]
 *   React → Vue 이벤트 핸들러 맵.
 *   형식: { 'event-name': (vm, event) => void }
 *   window에 addEventListener로 등록되며, beforeDestroy에서 자동 해제.
 */

import { mapState, mapGetters, mapActions } from 'vuex';
import ReactStyle from '@/apps/hc2/mixins/reactStyle';

export function createReactPage({
  tag,
  name,
  rootClasses = ['hc2'],
  vuexState = {},
  vuexGetters = {},
  vuexActions = [],
  guard = null,
  getProps = () => ({}),
  reactEvents = {},
} = {}) {
  if (!tag) throw new Error('[createReactPage] tag는 필수입니다.');

  // ── Vuex state 매핑 ────────────────────────────────────────────
  const computedFromVuex = {};

  const rootStateMap = {};
  const moduleStateMaps = {};
  for (const [propName, path] of Object.entries(vuexState)) {
    if (Array.isArray(path)) {
      const [module, stateName] = path;
      if (!moduleStateMaps[module]) moduleStateMaps[module] = {};
      moduleStateMaps[module][propName] = stateName;
    } else {
      rootStateMap[propName] = path;
    }
  }
  if (Object.keys(rootStateMap).length) {
    Object.assign(computedFromVuex, mapState(rootStateMap));
  }
  for (const [module, map] of Object.entries(moduleStateMaps)) {
    Object.assign(computedFromVuex, mapState(module, map));
  }

  // ── Vuex getters 매핑 ──────────────────────────────────────────
  const rootGetterMap = {};
  const moduleGetterMaps = {};
  for (const [propName, path] of Object.entries(vuexGetters)) {
    if (Array.isArray(path)) {
      const [module, getterName] = path;
      if (!moduleGetterMaps[module]) moduleGetterMaps[module] = {};
      moduleGetterMaps[module][propName] = getterName;
    } else {
      rootGetterMap[propName] = path;
    }
  }
  if (Object.keys(rootGetterMap).length) {
    Object.assign(computedFromVuex, mapGetters(rootGetterMap));
  }
  for (const [module, map] of Object.entries(moduleGetterMaps)) {
    Object.assign(computedFromVuex, mapGetters(module, map));
  }

  // ── Vuex actions 매핑 ──────────────────────────────────────────
  const actionsFromVuex = {};
  for (const action of vuexActions) {
    if (Array.isArray(action)) {
      const [module, actionName] = action;
      Object.assign(actionsFromVuex, mapActions(module, [actionName]));
    } else {
      Object.assign(actionsFromVuex, mapActions([action]));
    }
  }

  // ── 컴포넌트 정의 반환 ─────────────────────────────────────────
  return {
    name: name || `react-page-${tag}`,
    mixins: [ReactStyle],

    computed: {
      ...computedFromVuex,

      /** 커스텀 엘리먼트에 내려줄 props (computed → 자동 반응) */
      _reactProps() {
        return getProps(this);
      },
    },

    methods: {
      ...actionsFromVuex,
    },

    async created() {
      // 1) 진입 guard 체크
      //    - 개발 환경(NODE_ENV=development)에서는 스킵하여 서버 없이도 페이지 접근 가능.
      //    - 스테이지/프로덕션 환경에서는 반드시 실행되어 권한/로그인 상태를 검증.
      const isDev = process.env.NODE_ENV === 'development';
      if (guard && !isDev) {
        const result = await guard(this);
        if (result !== true) {
          const redirectPath = typeof result === 'string' ? result : '/main';
          this.$router.push(redirectPath);
          return;
        }
      }

      // 2) 초기 데이터 로딩 액션 dispatch
      for (const action of vuexActions) {
        const actionName = Array.isArray(action) ? action[1] : action;
        if (typeof this[actionName] === 'function') {
          await this[actionName]();
        }
      }

      // 3) React CSS 주입 (hcCommonCss + tailwindCss)
      this.applyStyle();
    },

    mounted() {
      // <html> 클래스 추가
      rootClasses.forEach((cls) => document.documentElement.classList.add(cls));

      // React → Vue 이벤트 리스너 등록
      this._boundEvents = {};
      for (const [eventName, handler] of Object.entries(reactEvents)) {
        const bound = (e) => handler(this, e);
        this._boundEvents[eventName] = bound;
        window.addEventListener(eventName, bound);
      }

      // vh 변수 설정 + resize 대응
      this.setVh();
      this._resizeHandler = () => this.setVh();
      window.addEventListener('resize', this._resizeHandler);
    },

    beforeDestroy() {
      // React CSS 제거
      this.removeStyle();

      // <html> 클래스 제거
      rootClasses.forEach((cls) => document.documentElement.classList.remove(cls));

      // 이벤트 리스너 해제
      if (this._boundEvents) {
        for (const [eventName, bound] of Object.entries(this._boundEvents)) {
          window.removeEventListener(eventName, bound);
        }
      }
      if (this._resizeHandler) {
        window.removeEventListener('resize', this._resizeHandler);
      }
    },

    /**
     * render 함수로 커스텀 엘리먼트를 동적 생성.
     * _reactProps가 변경될 때마다 attrs가 업데이트 → MutationObserver → React re-render.
     */
    render(h) {
      const props = this._reactProps || {};
      const attrs = {};
      for (const [key, val] of Object.entries(props)) {
        if (val == null) continue;
        attrs[key] = typeof val === 'object' ? JSON.stringify(val) : String(val);
      }

      return h(
        'div',
        { class: 'react-page-host', style: { width: '100%', height: '100%' } },
        [h(tag, { attrs })]
      );
    },
  };
}
