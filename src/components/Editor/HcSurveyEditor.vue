<template>
  <froala
    ref="editor"
    :tag="'textarea'"
    :config="froala.config"
    :onManualControllerReady="initialized"
    v-model="componentValue"
  ></froala>
</template>

<script>
import Vue from 'vue'

// import 'froala-editor/js/plugins/align.min.js'
// import 'froala-editor/js/plugins/char_counter.min.js'
// import 'froala-editor/js/plugins/code_beautifier.min.js'
// import 'froala-editor/js/plugins/code_view.min.js'
import 'froala-editor/js/plugins/colors.min.js'
// import 'froala-editor/js/plugins/cryptojs.min.js'
// import 'froala-editor/js/plugins/draggable.min.js'
// import 'froala-editor/js/plugins/edit_in_popup.min.js'
// import 'froala-editor/js/plugins/entities.min.js'
// import 'froala-editor/js/plugins/file.min.js'
// import 'froala-editor/js/plugins/files_manager.min.js'
// import 'froala-editor/js/plugins/font_family.min.js'
// import 'froala-editor/js/plugins/font_size.min.js'
// import 'froala-editor/js/plugins/forms.min.js'
// import 'froala-editor/js/plugins/fullscreen.min.js'
// import 'froala-editor/js/plugins/help.min.js'
import 'froala-editor/js/plugins/image.min.js'
// import 'froala-editor/js/plugins/image_manager.min.js'
// import 'froala-editor/js/plugins/inline_class.min.js'
// import 'froala-editor/js/plugins/inline_style.min.js'
// import 'froala-editor/js/plugins/line_breaker.min.js'
// import 'froala-editor/js/plugins/line_height.min.js'
import 'froala-editor/js/plugins/link.min'
// import 'froala-editor/js/plugins/lists.min.js'
// import 'froala-editor/js/plugins/paragraph_format.min.js'
// import 'froala-editor/js/plugins/paragraph_style.min.js'
// import 'froala-editor/js/plugins/print.min.js'
// import 'froala-editor/js/plugins/quick_insert.min.js'
// import 'froala-editor/js/plugins/quote.min.js'
// import 'froala-editor/js/plugins/save.min.js'
// import 'froala-editor/js/plugins/special_characters.min.js'
// import 'froala-editor/js/plugins/table.min.js'
// import 'froala-editor/js/plugins/trim_video.min.js'
// import 'froala-editor/js/plugins/url.min.js'
// import 'froala-editor/js/plugins/video.min.js'
// import 'froala-editor/js/plugins/word_paste.min.js'

//Import third party plugins
// import 'froala-editor/js/third_party/embedly.min'
// import 'froala-editor/js/third_party/font_awesome.min'
// import 'froala-editor/js/third_party/spell_checker.min'
// import 'froala-editor/js/third_party/image_tui.min'

// Import languages
import 'froala-editor/js/languages/ko.js'

// Import Froala Editor css files.
import 'froala-editor/css/froala_editor.pkgd.min.css'

// Import and use Vue Froala lib.
import VueFroala from 'vue-froala-wysiwyg'

import {mapState} from "vuex";

Vue.use(VueFroala)

export default {
  name: "hc-survey-editor",
  components: {},
  props: {
    propValue: {
      type: String
    },
    // type: {
    //   type: String,
    //   default() {
    //     return ''
    //   }
    // },
    placeholder: {
      type: String
    }
  },
  data() {
    return {
      option: {
        loading: false
      },
      froala: {
        instance: null,
        config: {}
      }, // end froala
      listTags: ['ul', 'ol', 'li', 'dl', 'dt', 'dd'],
      tableTags: ['table', 'tbody', 'tr', 'th', 'td'],
      imgTags: ['img'],
      videoTags: ['video'],
    }
  },
  computed: {
    ...mapState('storeEditor', {
      storeEditorConfig: 'config'
    }),
    ...mapState('storeSurvey', {
      curSurveyEdit: 'curSurveyEdit',
    }),
    componentValue: {
      get() {
        return this.propValue || ''
      },
      set(val) {
        this.$emit('update:propValue', val)
        this.$emit("inputDescription", val)
      }
    }
  },
  created() {
  },
  beforeMount() {
    this.froala.config = _.cloneDeep(this.storeEditorConfig)

    /**
     * attribution
     * Remove the Powered By Froala message.
     * @type {boolean}
     */
    this.froala.config.attribution = false

    /**
     * toolbarButtons
     * The list of buttons that appear in the rich text editor's toolbar on large devices (≥ 1200px).
     * @type {string[]}
     */
    this.froala.config.toolbarButtons = [
      'bold', 'underline', 'textColor', 'insertLink', 'clearFormatting'
    ]

    /**
     * toolbarBottom
     * Enable or disable positioning the toolbar at the bottom of the editor. This option is not available on mobile devices.
     * @type {boolean}
     */
    this.froala.config.toolbarBottom = true

    this.froala.config.placeholderText = this.placeholder

    /**
     * pastePlain
     * Removes text formatting when pasting content into the rich text editor, but keeps the content's structure.
     * 콘텐츠를 서식 있는 텍스트 편집기에 붙여넣을 때 텍스트 서식을 제거하지만 콘텐츠의 구조는 유지합니다.
     * @type {boolean}
     */
    this.froala.config.pastePlain = true

    /**
     * 지정 태그는 붙여넣기 시 제외
     * @type {string[]}
     */
    // this.froala.config.pasteDeniedTags = []
    // this.froala.config.pasteDeniedTags.push(...this.listTags)
    // this.froala.config.pasteDeniedTags.push(...this.tableTags)
    // this.froala.config.pasteDeniedTags.push(...this.imgTags)

    /**
     * 이미지 붙여넣기 금지
     * @type {boolean}
     */
    this.froala.config.imagePaste = true

    /**
     * 지정된 html 태그만 허용
     * @type {string[]}
     */
    this.froala.config.htmlAllowedTags = [
      'p',            // 문단
      'br',           // 띄어쓰기
      'b', 'strong',  // 굵게
      'u',            // 밑줄
      'span',         // 스타일 추가 (텍스트 색상)
      'a',            // 링크
    ]

    /**
     * 지정된 플러그인만 허용
     * @type {string[]}
     */
    this.froala.config.pluginsEnabled = ['link', 'colors']

    /**
     * 지정된 단축키만 허용
     * @type {string[]}
     */
    this.froala.config.shortcutsEnabled = [
      'bold', 'underline', 'undo', 'redo',
    ]

    /**
     * 링크 플러그인 설정
     * @type {string}
     */
    this.froala.config.linkAutoPrefix = 'https://'
    this.froala.config.linkEditButtons = ['linkEdit', 'linkRemove']
    this.froala.config.linkInsertButtons = ['linkBack']
    this.froala.config.linkText = false
    this.froala.config.linkAlwaysBlank = true

    this.initFroalaConfig('events')
  },
  beforeDestroy() {
    this.froala.instance.destroy()
  },
  methods: {
    // manual froala initialize
    initialized(initControls) {
      this.froala.instance = initControls
      this.froala.instance.initialize()
    },

    initFroalaConfig(propName) {
      const VueInstance = this
      switch (propName) {
        /**
         * events
         */
        case 'events': {
          this.froala.config.events = {

            'initialized': function () {
              this.toolbar.hide();
              // VueInstance.$hiClass.replaceHiclassAppLink(VueInstance)
            },
            'focus': function () {
              // 툴바 노출 처리
              this.toolbar.show();
            },
            'blur': function () {
              // this === froala editor instance
              VueInstance.$emit(
                'update:propValue',
                VueInstance.$stringUtil.replaceRgbToHex(VueInstance.componentValue)
              )
              // 툴바 숨김 처리
              this.toolbar.hide()
            },

            'keyup' : function (e) {
              VueInstance.$emit("inputDescription", e.target.innerHTML)
            },

            'input' : function (e) {
              VueInstance.$emit("inputDescription", e.target.innerHTML)
            },

            'paste.after': () => {
              VueInstance.$log.debug(`paste.after`)
            },
            'paste.afterCleanup': clipboard_html => {
              VueInstance.$log.debug(`paste.afterCleanup clipboard_html`, clipboard_html)
            },
            'paste.before': original_event => {
              VueInstance.$log.debug(`paste.before original_event`, original_event)
            },
            /**
             * html tag 삭제 전 원본 데이터 확인
             * @param clipboard_html
             */
            'paste.beforeCleanup': clipboard_html => {
              VueInstance.$log.debug(`paste.beforeCleanup clipboard_html`, clipboard_html)
              VueInstance.$toasted.clear()

              const domParser = new DOMParser()
              const doc = domParser.parseFromString(clipboard_html, 'text/html')
              const deniedTags = []
              deniedTags.push(VueInstance.listTags)
              deniedTags.push(VueInstance.tableTags)
              deniedTags.push(VueInstance.imgTags)
              deniedTags.push(VueInstance.videoTags)

              const existsTags = doc.body.querySelector(deniedTags.join(','))
              if (existsTags) {
                VueInstance.$toasted.show('텍스트만 입력 가능합니다.')
              }

            },
            'link.beforeInsert': function (link, text, attrs) {
              VueInstance.$log.debug(
                `link.beforeInsert link`, link,
                `text`, text,
                `attrs`, attrs,
              )
              VueInstance.$nextTick(() => {
                // VueInstance.$hiClass.replaceHiclassAppLink(VueInstance)
                VueInstance.$nextTick(() => {
                  /**
                   * hiclassapp 내 링크로 설정한 경우 'https://' prefix 삭제
                   */
                  if (VueInstance.componentValue.includes(`https://hiclassapp://`)) {
                    // value model 갱신
                    VueInstance.$emit(
                      'update:propValue',
                      VueInstance.componentValue.replace(`https://hiclassapp://`, `hiclassapp://`)
                    )
                  }
                })

              })
            },

          }
          break
        }
        default:
      }
    },
  }
}
</script>

<style lang="scss">
.survey-create__box .survey__froala u {
  color: inherit;
}

.fr-popup .fr-color-set.fr-selected-set {
  padding-bottom: 20px;
}
</style>