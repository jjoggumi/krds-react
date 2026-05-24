<template>
  <froala
    :tag="'textarea'"
    :config="froala.config"
    v-model="model.postContent"
    :onManualControllerReady="initialized"
  ></froala>
</template>

<script>
import { eventBus } from '@/main'

import Vue from 'vue'

// import 'froala-editor/js/plugins.pkgd.min.js' // all plugin ?

import 'froala-editor/js/plugins/align.min.js'
import 'froala-editor/js/plugins/char_counter.min.js'
import 'froala-editor/js/plugins/code_beautifier.min.js'
import 'froala-editor/js/plugins/code_view.min.js'
import 'froala-editor/js/plugins/colors.min.js'
import 'froala-editor/js/plugins/cryptojs.min.js'
import 'froala-editor/js/plugins/draggable.min.js'
import 'froala-editor/js/plugins/edit_in_popup.min.js'
import 'froala-editor/js/plugins/entities.min.js'
import 'froala-editor/js/plugins/file.min.js'
import 'froala-editor/js/plugins/files_manager.min.js'
import 'froala-editor/js/plugins/font_family.min.js'
import 'froala-editor/js/plugins/font_size.min.js'
import 'froala-editor/js/plugins/forms.min.js'
import 'froala-editor/js/plugins/fullscreen.min.js'
import 'froala-editor/js/plugins/help.min.js'
import 'froala-editor/js/plugins/image.min.js'
import 'froala-editor/js/plugins/image_manager.min.js'
import 'froala-editor/js/plugins/inline_class.min.js'
import 'froala-editor/js/plugins/inline_style.min.js'
import 'froala-editor/js/plugins/line_breaker.min.js'
import 'froala-editor/js/plugins/line_height.min.js'
import 'froala-editor/js/plugins/lists.min.js'
import 'froala-editor/js/plugins/paragraph_format.min.js'
import 'froala-editor/js/plugins/paragraph_style.min.js'
import 'froala-editor/js/plugins/print.min.js'
import 'froala-editor/js/plugins/quick_insert.min.js'
import 'froala-editor/js/plugins/quote.min.js'
import 'froala-editor/js/plugins/save.min.js'
import 'froala-editor/js/plugins/special_characters.min.js'
import 'froala-editor/js/plugins/table.min.js'
import 'froala-editor/js/plugins/trim_video.min.js'
import 'froala-editor/js/plugins/url.min.js'
import 'froala-editor/js/plugins/video.min.js'
import 'froala-editor/js/plugins/word_paste.min.js'

//Import third party plugins
import 'froala-editor/js/third_party/embedly.min'
import 'froala-editor/js/third_party/font_awesome.min'
// import 'froala-editor/js/third_party/spell_checker.min'
import 'froala-editor/js/third_party/image_tui.min'

// Import languages
import 'froala-editor/js/languages/ko.js'

// Import Froala Editor css files.
import 'froala-editor/css/froala_editor.pkgd.min.css'

// Import and use Vue Froala lib.
import VueFroala from 'vue-froala-wysiwyg'

Vue.use(VueFroala)

import { mapGetters } from 'vuex'
import { mapFields } from "vuex-map-fields"

export default {
  name: 'hc-editor-froala-V1',
  components: {},
  props: {
    model: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default() {
        return ''
      }
    },
  },
  data() {
    return {
      EDITOR_HEIGHT: {
        TITLE_TOP: 68,
        TITLE_BOTTOM: 60,
        CONTENT_ATTACH: 60,
        FOOTER: 68,
        TOOLBAR: 50
      },
      froala: {
        instance: null,
        config: {}
      }, // end froala
      editorFontChangedCount: 0
    }
  },
  computed: {
    ...mapFields('storeEditor', {
      edit: 'edit',
      storeEditorConfig: 'config'
    }),
    ...mapGetters('storeEditor', {
      getFontNamesByPostVersion: 'getFontNamesByPostVersion',
      getFontSizesByPostVersion: 'getFontSizesByPostVersion',
      getFontFamilyByPostVersion: 'getFontFamilyByPostVersion',
      getFontSizeByPostVersion: 'getFontSizeByPostVersion',
      getPlaceholderTextByPostVersion: 'getPlaceholderTextByPostVersion',
      getPluginsEnabledByPostVersion: 'getPluginsEnabledByPostVersion',
      getToolbarButtonsByPostVersion: 'getToolbarButtonsByPostVersion',
    }),
    isExistFiles() {
      return this.model.files.length > 0
    },
    isBlackboard() {
      return this.type === 'BLACKBOARD'
    },
    contentHeightStyle() {
      let contentHeightStyle = '100%'
      let appendHeight = 0

      if (this.isBlackboard) {
        if (this.isExistFiles) appendHeight += this.EDITOR_HEIGHT.CONTENT_ATTACH

        if (appendHeight !== 0)
          contentHeightStyle = `calc(${contentHeightStyle} - ${appendHeight}px)`
      }

      return contentHeightStyle
    },
    postVersion() {
      return this.model.version === null ? 'V1' : this.model.version
    },
  },
  watch: {
    contentHeightStyle(val) {
      if (val && this.isBlackboard) this.setEditorHeight(val)
    },
    editorFontChangedCount(val) {
      if (val && val > 0) {
        this.setEditorDefaultFontName()
        this.setEditorDefaultFontSize()
      }
    }
  },
  created() {
    this.froala.config = this.storeEditorConfig

    // post version V1 config
    this.froala.config.fontNames = this.getFontNamesByPostVersion(this.postVersion)
    this.froala.config.fontSizes = this.getFontSizesByPostVersion(this.postVersion)
    this.froala.config.fontFamily = this.getFontFamilyByPostVersion(this.postVersion)
    this.froala.config.fontSize = this.getFontSizeByPostVersion(this.postVersion)
    this.froala.config.placeholderText = ''
    this.froala.config.toolbarButtons = this.getToolbarButtonsByPostVersion(this.postVersion)

    this.$log.debug(`this.froala.config =>`, this.froala.config)

    this.initFroalaConfig('events')
  },
  mounted() {
    this.initEventBus()

    /**
     * responseURL supported browser (not IE)
     */
    if (!this.$comn.isIE()) {
      const accessor = Object.getOwnPropertyDescriptor(
        XMLHttpRequest.prototype,
        'responseText'
      )

      Object.defineProperty(XMLHttpRequest.prototype, 'responseText', {
        get() {
          const responseText = accessor.get.call(this)
          // here we can check if response url includes our previously set query param
          if (this.responseURL.includes('?fromFroalaVideo')) {
            try {
              // r is our response object
              const r = JSON.parse(responseText)

              // console.info(`JSON.parse(responseText) => `, r)
              // return "[r._links.original.href]"
              return JSON.stringify({ link: r._links.original.href })

            } catch (e) {
              return responseText
            }
          }
          return responseText
        },
        configurable: true
      })
    }

    /**
     * on change storage event
     */
    window.onstorage = () => {
      // When local storage changes, dump the list to the console.

      this.$log.warn(
        `localStorage.getItem('fontFamily') => `,
        localStorage.getItem('fontFamily')
      )
      this.$log.warn(
        `localStorage.getItem('fontSize') => `,
        localStorage.getItem('fontSize')
      )

      const fontFamily = localStorage.getItem('fontFamily')
      const fontSize = localStorage.getItem('fontSize')

      this.setEditorFontName(fontFamily)
      this.setEditorFontSize(fontSize)
    }
  },
  beforeDestroy() {
    eventBus.$off('editor-set-font-name')
    eventBus.$off('editor-set-font-size')
    eventBus.$off('editor-set-code')
    // eventBus.$off('editor-set-style')
    eventBus.$off('editor-selection-restore')
    eventBus.$off('editor-selection-save')
    eventBus.$off('editor-insert-content')
    eventBus.$off('editor-set-content-zoom')
    eventBus.$off('editor-destroy')

    this.froala.instance.destroy()
  },
  methods: {
    // manual froala initialize
    initialized(initControls) {
      this.froala.instance = initControls
      this.froala.instance.initialize()
    },
    initEventBus() {
      eventBus.$on('editor-set-font-name', fontName => {
        this.editorFontChangedCount++
        this.setEditorFontName(fontName)
      })

      eventBus.$on('editor-set-font-size', fontSize => {
        this.editorFontChangedCount++
        this.setEditorFontSize(fontSize)
      })

      eventBus.$on('editor-set-code', html => {
        this.setContent(html)
      })

      // eventBus.$on('editor-set-style', obj => {
      //   try {
      //     const prop = Object.keys(obj)[0]
      //     const attr = Object.values(obj)[0]

      //     this.setEditorStyle(prop, attr)
      //   } catch (error) {
      //     this.$log.debug(error)
      //   }
      // })

      eventBus.$on('editor-selection-restore', () => {
        this.editorSelectionRestore()
      })

      eventBus.$on('editor-selection-save', () => {
        this.editorSelectionSave()
      })

      eventBus.$on('editor-insert-content', content => {
        this.setEditorInsertContent(content)
      })

      eventBus.$on('editor-sync-content', () => {
        this.syncEditorContent()
      })

      eventBus.$on('editor-set-content-zoom', obj => {
        if (obj.zoom) {
          const rate = obj.zoom
          this.setEditorContentZoom(rate)
        }
      })

      eventBus.$on('editor-destroy', () => {
        this.froala.instance.destroy()
      })
    },
    setContent(content) {
      try {
        const froala = this.froala.instance.getEditor()
        froala.html.set(content)
      } catch (error) {
        this.$log.debug(this.$options.name + ' setContent() error => ', error)
      }
    },
    // setEditorStyle(prop, attr) {
    //   try {
    //     const froala = this.froala.instance.getEditor()
    //     froala.format.applyStyle(prop, attr)
    //   } catch (error) {
    //     this.$log.debug(
    //       this.$options.name + ' setEditorStyle() error => ',
    //       error
    //     )
    //   }
    // },
    editorSelectionRestore() {
      const froala = this.froala.instance.getEditor()
      froala.selection.restore()
    },
    editorSelectionSave() {
      const froala = this.froala.instance.getEditor()
      froala.selection.save()
    },

    /**
     * html.insert (html, [clean])
     */
    setEditorInsertContent(content) {
      try {
        const froala = this.froala.instance.getEditor()
        froala.selection.restore()
        froala.html.insert(content)
        froala.selection.save()
        this.model.postContent = froala.html.get(true)  // model.postContent 반영
      } catch (error) {
        this.$log.debug(
          this.$options.name + ' setEditorInsertContent() error => ',
          error
        )
      }
    },
    syncEditorContent() {
      try {
        const froala = this.froala.instance.getEditor()
        this.model.postContent = froala.html.get(false)
      } catch (error) {
        this.$log.debug(
          this.$options.name + ' setEditorInsertContent() error => ',
          error
        )
      }
    },
    setEditorDefaultFontName() {
      $('.fr-box .fr-wrapper .fr-view').css('fontFamily', this.edit.fontName)
    },
    setEditorDefaultFontSize() {
      $('.fr-box .fr-wrapper .fr-view').css('fontSize', this.edit.fontSize)
    },
    setEditorFontName(fontName) {
      try {
        let froala = this.froala.instance.getEditor()
        froala.fontFamily.apply(fontName)
      } catch (err) {
        this.$log.debug(err)
      }
    },
    setEditorFontSize(fontSize) {
      try {
        let froala = this.froala.instance.getEditor()
        froala.fontSize.apply(fontSize)
      } catch (err) {
        this.$log.debug(err)
      }
    },
    setEditorHeight(height) {
      // froala
      if (height === '100%')
        $('.fr-box, .fr-wrapper, .fr-element').css('height', height)
      else {
        $('.fr-box').css('height', height)
        $('.fr-wrapper, .fr-element.fr-view').css('height', '100%').css('min-height', '100%')
      }
    },
    setEditorContentZoom(rate) {
      $('.fr-view').css({
        zoom: rate,
        padding: '20px'
      })
    },

    /**
     * froala methods
     */
    fontTracking() {
      let cur = this
      // TODO: DOMSubtreeModified infinity loof 문제로 MutationObserver 교체 검토
      $(".fr-toolbar button[data-cmd='fontFamily'] span").on(
        'DOMSubtreeModified',
        function(e) {
          if (
            e.target.innerText !== '' &&
            e.target.innerText !== 'Font Family'
          ) {
            let editFont = e.target.innerText.trim()
            if (cur.froala.config.fontNames.some(item => item.key === editFont)) {
              cur.edit.fontName = editFont
            }
          }
        }
      )
      // TODO: DOMSubtreeModified infinity loof 문제로 MutationObserver 교체 검토
      $(".fr-toolbar button[data-cmd='fontSize'] span").on(
        'DOMSubtreeModified',
        function(e) {
          if (e.target.innerText !== '') {
            let editSize = `${e.target.innerText}px`
            if (cur.froala.config.fontSizes.some(item => item.key === editSize)) {
              cur.edit.fontSize = editSize
            }
          }
        }
      )
    },
    imageInsert(link) {
      const froala = this.froala.instance.getEditor()
      froala.image.insert(link)
    },

    /**
     * froala init config
     */
    initFroalaConfig(propName) {
      const VueInstance = this
      switch (propName) {
        /**
         * events
         */
        case 'events' : {
          this.froala.config.events = {
            /**
             * function() {
                ...
              }.bind(this) 와 () => {} arrow function bind는 같은 current vue instance를 참조함
             */
            initialized: () => {
              // 툴바 숨기기
              this.froala.instance.getEditor().toolbar.hide()

              // 에디터 리사이즈
              this.setEditorHeight(this.contentHeightStyle)

              // 기본 폰트 스타일 지정
              this.setEditorDefaultFontName()
              this.setEditorDefaultFontSize()

              // 에디터 폰트 추적
              this.fontTracking()

              // 에디터 본문 작성 폼에 포커싱
              document.getElementsByClassName('fr-view')[0].focus()

              // 에디터 기본 폰트 지정 (포커싱 후 실행되어야 함!)
              let fontFamily = this.edit.fontName
              let fontSize = this.edit.fontSize

              if (localStorage.getItem('fontFamily')
                && localStorage.getItem('fontFamily') !== 'undefined')
                fontFamily = localStorage.getItem('fontFamily')

              if (localStorage.getItem('fontSize')
                && localStorage.getItem('fontSize') !== 'undefined')
                fontSize = localStorage.getItem('fontSize')

              this.setEditorFontName(fontFamily)
              this.setEditorFontSize(fontSize)

              // froala editor init complete!
              eventBus.$emit('froala-editor-init-complete')

              this.setEditorContentZoom(1)
            },

            keydown: () => {
              // let froala = this.froala.instance.getEditor()
              // if (!froala.format.is('span')) {
              //   if (!froala.format.is('td') && !froala.format.is('li')) {
              //     this.setEditFont()
              //   }
              // } else {
              //   // if (e.keyCode === 46) {
              //   //   if ($(froala.selection.element()).text().indexOf('\u200B') === -1) {
              //   //     froala.html.insert(`\u200B${froala.selection.text()}`, true)
              //   //   }
              //   // }
              // }
            },

            // font sync
            contentChanged: () => {
              // let froala = this.froala.instance.getEditor()
              // console.info(froala.html.get(true))
            },

            'paste.after': () => {
              // let froala = this.froala.instance.getEditor()
              // froala.cursor.backspace()
            },

            blur: () => {
              eventBus.$emit('editor-selection-save')
            },

            focus: () => {
              const froala = this.froala.instance.getEditor()
              froala.markers.remove()
            },

            'commands.before': function (cmd, param1, param2) {
              // Do something here.
              // this is the editor instance.
              eventBus.$log.debug('commands.before this | cmd | param1 | param2 => ', this, cmd, param1, param2);

              eventBus.$log.debug(cmd, param1, param2)
              if (cmd === 'fontFamily') {
                localStorage.setItem('fontFamily', param1)
              } else if (cmd === 'fontSize') {
                localStorage.setItem('fontSize', param1)
              }

            },

            /**
             * commands.after
             * docs) https://froala.com/wysiwyg-editor/docs/events/#commands.after
             */
            'commands.after': function (cmd, param1, param2) {
              // Do something here.
              // this is the editor instance.
              eventBus.$log.debug('commands.after this | cmd | param1 | param2 => ', this, cmd, param1, param2);

              eventBus.$log.debug(cmd, param1, param2)
              if (cmd === 'fontFamily') {
                localStorage.setItem('fontFamily', param1)
              } else if (cmd === 'fontSize') {
                localStorage.setItem('fontSize', param1)
              }

            },

            /**
             * image upload events
             */
            'image.beforeUpload': function(images) {
              // Return false if you want to stop the image upload.
              eventBus.$log.debug('image.beforeUpload images => ', images)
            },
            'image.uploaded': (/*response*/) => {
              return false
            },
            /**
             * image inserted events
             * @param $img | A jQuery object containing the inserted image.
             * @param response | The original server response.
             */
            'image.inserted': function($img, response) {
              // Image was inserted in the editor.
              eventBus.$log.debug(
                  'image.inserted $img, response => ',
                  $img,
                  response
              )
              const froala = VueInstance.froala.instance.getEditor()
              froala.image.remove($img)
            },
            /**
             * image replaced events
             * @param $img | A jQuery object containing the new image.
             * @param response | The original response from the server.
             */
            'image.replaced': function($img, response) {
              // Image was replaced in the editor.
              eventBus.$log.debug(
                  'image.replaced $img, response => ',
                  $img,
                  response
              )
              const froala = VueInstance.froala.instance.getEditor()
              froala.image.remove($img)
            },
            'image.error': function(error, response) {
              // Bad link.
              if (error.code === 1) {
                eventBus.$log.debug(
                    'image.error error, response => ',
                    error,
                    response
                )
              }

              // No link in upload response.
              else if (error.code === 2) {
                eventBus.$log.debug(
                    'image.error error, response => ',
                    error,
                    response
                )
              }

              // Error during image upload.
              else if (error.code === 3) {
                eventBus.$log.debug(
                    'image.error error, response => ',
                    error,
                    response
                )
              }

              // Parsing response failed.
              else if (error.code === 4) {
                eventBus.$log.debug(
                    'image.error error, response => ',
                    error,
                    response
                )
              }

              // Image too text-large.
              else if (error.code === 5) {
                eventBus.$log.debug(
                    'image.error error, response => ',
                    error,
                    response
                )
              }

              // Invalid image type.
              else if (error.code === 6) {
                eventBus.$log.debug(
                    'image.error error, response => ',
                    error,
                    response
                )
              }

              // Image can be uploaded only to same domain in IE 8 and IE 9.
              else if (error.code === 7) {
                eventBus.$log.debug(
                    'image.error error, response => ',
                    error,
                    response
                )
              }

              // Response contains the original server response to the request if available.

              eventBus.$log.debug(`error this => `, this)
            },

            /**
             * image removed events
             * @param $img | A jQuery object with the image to be removed. It can be used to delete the image from the server.
             */

            /**
             * file upload events
             */
            /**
             * end file upload events
             */

            /**
             * video upload events
             */
            /**
             * end video upload events
             */
          }
          break
        }


      }
    }

  } // end methods
} // end script
</script>

<style lang="scss" scoped>
.note-cont-wrap {
  .fr-box .fr-wrapper .fr-view {
    zoom: 1;
    padding: 20px;
  }
}
</style>
