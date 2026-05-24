<!--
@File(Method): HcEditorFroalaV2.vue
@Author: -
@Date Created: -
@Description: 게시글 에디터
@Modified: 2025-06-16 - #74648 URL 인식 정책 변경 및 실시간 TLD 목록 적용
-->

<template>
  <froala
    ref="editor"
    :tag="'textarea'"
    :config="froala.config"
    :onManualControllerReady="initialized"
    v-model="model.postContent"
  ></froala>
</template>

<script>
import { eventBus } from '@/main'

import Vue from 'vue'
import { debounce } from "lodash";

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

// (required) register custom button
import FroalaEditor from 'froala-editor'

Vue.use(VueFroala)

import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import { mapFields } from "vuex-map-fields"
import {checkAndConvertHEIC} from "@/plugins/utils";

export default {
  name: 'hc-editor-froala-V2',
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
    addedFiles: {
      type: Array
    },
    tlds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      option: {
        loading: false
      },
      EDITOR_HEIGHT: {
        // TITLE_TOP: 58,
        // TITLE_BOTTOM: 50,
        CONTENT_ATTACH: 60,
        // FOOTER: 60,
        TOOLBAR: 50,
        IE_TOP_MARGIN: 220, // zoom: 1 기준, 80%
        IE_CONTENT_ATTACH: 60 // zoom: 1 기준, 20%
          // 280 * 79.166 / 100 = 221 --> IE_TOP_MARGIN
          // 280 - 221 = 59 --> IE_CONTENT_ATTACH
      },
      froala: {
        instance: null,
        config: {}
      }, // end froala
      zoomComponentKey: 0,
      myEditor: {
        fontSize: "17px",
        bold: "",
      },
      myEditorSetCommand: {
        bold: "N",
      },
      myEditorBackground: {
        fontSize: "17px",
        bold: "",
      },
      myEditorSetCommandBackground: {
        bold: "N",
      },
      eType: "myEditor",
      esType: "myEditorSetCommand",
      elType: "myEditor",
      initHtmlSet: false
    }
  },
  computed: {
    ...mapFields({
      isDimLoading: 'isDimLoading'
    }),
    ...mapFields('storeEditor', {
      edit: 'edit',
      storeEditorConfig: 'config',
      V2: 'V2'
    }),
    ...mapGetters('storeEditor', {
      getFontSizesByPostVersion: 'getFontSizesByPostVersion',
      getFontSizeByPostVersion: 'getFontSizeByPostVersion',
      getPlaceholderTextByPostVersion: 'getPlaceholderTextByPostVersion',
      getPluginsEnabledByPostVersion: 'getPluginsEnabledByPostVersion',
      getToolbarButtonsByPostVersion: 'getToolbarButtonsByPostVersion',
    }),
    ...mapState('storeImageEditor', {
      storeEditImages: 'editImages'
    }),
    imageFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType.startsWith('image') && f.fileFlag === 'FILE'
      }) || []
    },
    videoFiles() {
      return this.model.files.filter(f => f.fileContentType.startsWith('video')) || []
    },
    docFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType && (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video'))
      }) || []
    },
    loadingBars() {
      return this.model.files.filter(f => f.isLoadingBar) || []
    },
    docFilesAndLoadingBars() {
      return this.docFiles.concat(this.loadingBars)
    },
    isExistFiles() {
      return this.docFilesAndLoadingBars.length > 0
    },
    isBlackboard() {
      return this.type === 'BLACKBOARD'
    },
    contentHeightStyle() {
      let contentHeightStyle = '100%'
      let appendHeight = 0

      if (this.isBlackboard) {
        if (this.$comn.isIE()) {
          // const currentZoom = parseInt($('.fr-element.fr-view').css('zoom'), 10)
          // const vhValue = currentZoom / 3 / 3
          // contentHeightStyle = `${vhValue.toFixed(2)}vh`

          contentHeightStyle = this.edit.ieVerticalHeight
          appendHeight += this.EDITOR_HEIGHT.IE_TOP_MARGIN

          if (this.isExistFiles) appendHeight += this.EDITOR_HEIGHT.IE_CONTENT_ATTACH

          appendHeight = appendHeight / this.edit.initZoomValueV2
        } else {
          appendHeight += this.EDITOR_HEIGHT.TOOLBAR
          if (this.isExistFiles) appendHeight += this.EDITOR_HEIGHT.CONTENT_ATTACH
        }
      }

      if (appendHeight !== 0)
        contentHeightStyle = `calc(${contentHeightStyle} - ${appendHeight}px)`

      return contentHeightStyle
    },
    postVersion() {
      return this.model.version
    }
  },
  watch: {
    contentHeightStyle(val) {
      if (val && this.isBlackboard) this.setEditorHeight(val)
    },
    'option.loading'(val) {
      this.$log.debug(`option.loading => `, val)
      this.isDimLoading = val
    },
  },
  created() {
    const VueInstance = this
    /**
     * custom button fontSizeV2
     */

    if(VueInstance.type === "BLACKBOARD") {
      VueInstance.eType = "myEditorBackground"
      VueInstance.esType = "myEditorSetCommandBackground"
      VueInstance.elType = "myEditorBackground"
    }

    FroalaEditor.DefineIcon('fontSizeV2', { NAME: '보통' });
    
    FroalaEditor.RegisterCommand('fontSizeV2', {
      type: "dropdown",
      title: "Font Size",
      focus: true,
      undo: true,
      refreshAfterCallback: false,
      options: {
        17: '보통',
        20: '크게',
        24: '더크게'
      },
      /**
       * 'this' is editor instance
       */
      callback: function (cmd, val) {
        // VueInstance.$log.debug(`fontSizeV2 callback cmd, val =>`, cmd, val);
        try {
          this.fontSize.apply(val + VueInstance.V2.fontSizeUnit)
        } catch (e) {
          VueInstance.$log.error(e)
        }
      },
      // Callback on refresh.
      refresh: function (/* $btn */) {
        // VueInstance.$log.debug(`fontSizeV2 do refresh $btn =>`, $btn);
      },
      // Callback on dropdown show.
      refreshOnShow: function ($btn, $dropdown) {
        // VueInstance.$log.debug(`fontSizeV2 do refresh when show $btn, $dropdown =>`, $btn, $dropdown);
        try {
          const ACTIVE_CLASS = 'fr-active'
          const currrentTitle = $btn[0].textContent

          const items = document.querySelectorAll(`.${$dropdown[0].className} ul.fr-dropdown-list li a.fr-command`)
          for (const item of items) {
            const itemTitle = item.getAttribute('title')
            if (itemTitle === currrentTitle) {
              item.classList.add(ACTIVE_CLASS)
            } else {
              item.classList.remove(ACTIVE_CLASS)
            }
          }
        } catch (e) {
          VueInstance.$log.error(e)
        }
      }
    });

    FroalaEditor.DefineIcon('imageEdit', {
      NAME: '편집',
      SRC: 'https://download.hiclass.net/static/assets/img/icon/icon_img_edit.svg',
      template: 'image'
    })

    FroalaEditor.RegisterCommand('imageEdit', {
      title: '편집',
      icon: 'imageEdit',
      focus: false,
      undo: false,
      refreshAfterCallback: false,
      callback: function () {
        let imageEls =  VueInstance.froala.instance.getEditor().$el.find('img')
        let srcArr = []
        for (let i = 0; i < imageEls.length; i++) {
          srcArr.push(imageEls[i].src)
        }
        let sortedImageFiles = _.sortBy(VueInstance.imageFiles, imageFile => _.indexOf(srcArr, imageFile.fileOriginalPath))

        let selectedImage = this.image.get()
        const targetIdx = sortedImageFiles.findIndex(imageFile => imageFile.fileOriginalPath === selectedImage[0].src)
        VueInstance.setIsPostEditorMode(true)
        VueInstance.editImages(sortedImageFiles, null, targetIdx)

        document.querySelector('.fr-popup.fr-desktop.fr-ltr').classList.remove('fr-active')
      }
    })

    this.froala.config = this.storeEditorConfig
    this.froala.config.imageAllowedTypes = ['jpeg' , 'jpg' , 'png', 'heic']
    this.froala.config.fontSize = this.getFontSizeByPostVersion(this.postVersion)
    this.froala.config.fontSizeUnit = this.V2.fontSizeUnit
    this.froala.config.fontSizeDefaultSelection = this.V2.fontSizeDefaultSelection
    this.froala.config.toolbarButtons = this.getToolbarButtonsByPostVersion(this.postVersion)
    this.froala.config.placeholderText = !this.isBlackboard
        ? this.getPlaceholderTextByPostVersion(this.postVersion)
        : ''
    this.froala.config.pasteDeniedTags = ['video']
    // this.froala.config.videoResponsive = true

    if (this.isBlackboard) {
      this.froala.config.videoDefaultWidth = 200
    }

    this.$log.debug(`this.froala.config =>`, this.froala.config)

    this.initFroalaConfig('events')
  },
  mounted() {
    // if(this.videoFiles.length > 0) {
    //   for(const file of this.videoFiles) {
    //     if ((this.model.postContent.includes(file.fileOriginalPath) || this.model.postContent.includes(file.fileThumbnailPath)) === false) {
    //       this.removeModelFile(file)
    //     }
    //   }
    // }
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
  },
  beforeDestroy() {
    eventBus.$off('editor-set-font-name')
    eventBus.$off('editor-set-font-size')
    eventBus.$off('editor-set-code')
    // eventBus.$off('editor-set-style')
    eventBus.$off('editor-selection-restore')
    eventBus.$off('editor-selection-save')
    eventBus.$off('editor-insert-content')

    if (this.isBlackboard) {
      eventBus.$off('editor-set-content-zoom')
      eventBus.$off('editor-toggle-toolbar')
    }

    eventBus.$off('editor-insert-model-file')
    eventBus.$off('editor-remove-model-file')
    eventBus.$off('editor-remove-only-model-file')
    eventBus.$off('editor-content-check-file')
    eventBus.$off('editor-destroy')

    eventBus.$off(`imageEditor-${this.$vnode.key}`)

    this.froala.instance.destroy()
  },
  methods: {
    ...mapActions('storeImageEditor', {
      openImageEditor: 'openImageEditor'
    }),
    ...mapMutations('storeImageEditor', {
      setIsPostEditorMode: 'setIsPostEditorMode'
    }),
    // manual froala initialize
    initialized(initControls) {
      this.froala.instance = initControls
      this.froala.instance.initialize()
    },
    initEventBus() {
      eventBus.$on('editor-set-font-size', fontSize => this.setEditorFontSize(fontSize))
      eventBus.$on('editor-set-code', html => this.setContent(html))

      eventBus.$on('editor-selection-restore', () => this.editorSelectionRestore())
      eventBus.$on('editor-selection-save', () => this.editorSelectionSave())
      eventBus.$on('editor-insert-content', content => this.setEditorInsertContent(content))
      eventBus.$on('editor-sync-content', () => this.syncEditorContent())

      if (this.isBlackboard) {
        eventBus.$on('editor-set-content-zoom', obj => {
          if (obj.zoom) {
            const rate = obj.zoom
            this.setEditorContentZoom(rate)
            this.zoomComponentKey++
          }
        })
        eventBus.$on('editor-toggle-toolbar', toggleFlag => {
          toggleFlag
            ? this.froala.instance.getEditor().toolbar.show()
            : this.froala.instance.getEditor().toolbar.hide()
        })
      }

      eventBus.$on('editor-insert-model-file', file => this.insertModelFile(file))
      eventBus.$on('editor-remove-model-file', file => this.removeModelFile(file))
      eventBus.$on('editor-remove-only-model-file', file => this.removeOnlyModelFile(file)) // 파일 서버 delete 호출 안함
      eventBus.$on('editor-content-check-file', file => this.videoContentCheck())

      eventBus.$on('editor-destroy', () => this.froala.instance.destroy())

      eventBus.$on(`imageEditor-${this.$vnode.key}`,async uploadFileList => {
        this.option.loading = true

        // 순서변경
        const froala = this.froala.instance.getEditor()
        let imageEls = froala.$el.find('img')
        for (let i = 0; i < imageEls.length; i++) {
          imageEls[i].src = this.storeEditImages[i].fileOriginalPath
        }

        // 편집된 이미지 업로드
        let multipartPostApi = []
        for (let i = 0; i < uploadFileList.length; i++) {
          if (!uploadFileList[i].file.name) {
            uploadFileList[i].file.name = this.$hiClass.getUniqueFileNameFromType(uploadFileList[i].file.type)
          }
          multipartPostApi.push(this.$hiClass.multipart.upload(uploadFileList[i].file))
        }

        Promise.all(multipartPostApi)
            .then(res => {
              res.forEach((r, idx) => {
                const fileObj = r.data
                const imagePath = fileObj._links.original.href
                const froala = this.froala.instance.getEditor()

                const updateFileIdx = this.imageFiles.findIndex(modelFile => modelFile.fileOriginalPath === uploadFileList[idx].fileOriginalPath)
                if (updateFileIdx > -1) {
                  let $img = froala.$el.find('img[src="' + this.imageFiles[updateFileIdx].fileOriginalPath + '"]')
                  $img[0].src = imagePath
                  if (document.querySelector('.fr-image-resizer.fr-active')) {
                    document.querySelector('.fr-image-resizer.fr-active').classList.remove('fr-active')
                  }
                  if (document.querySelector('.fr-popup.fr-desktop.fr-ltr.fr-active')) {
                    document.querySelector('.fr-popup.fr-desktop.fr-ltr.fr-active').classList.remove('fr-active')
                  }

                  const updateAllFileIdx = this.model.files.findIndex(modelFile => modelFile.fileOriginalPath === uploadFileList[idx].fileOriginalPath)
                  if (updateAllFileIdx > -1) {
                    this.replaceFile(updateAllFileIdx, this.makeFileInfo(fileObj))
                  }
                }
              })
              eventBus.$emit('editor-sync-content')

              this.option.loading = false
            })
            .catch(() => {
              this.option.loading = false
            })
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
    setEditorDefaultFontSize(fontSize) {
      $('.fr-box .fr-wrapper .fr-view').css('fontSize', fontSize)
    },
    setEditorFontSize(fontSize) {
      try {
        const froala = this.froala.instance.getEditor()
        froala.fontSize.apply(fontSize)
      } catch (err) {
        this.$log.debug(err)
      }
    },
    setEditorFontBold(bold) {
      try {
        if(bold === "bold") {
          const froala = this.froala.instance.getEditor()
          froala.commands.bold("bold")
        }
      } catch (err) {
        this.$log.debug(err)
      }
    },
    setEditorHeight(height) {
      // froala
      if (height === '100%')
        $('.fr-box, .fr-wrapper, .fr-element').css('height', height)
      else {

        if (this.isBlackboard) {
          if (this.$comn.isIE()) {
            // const currentZoom = parseInt($('.fr-element.fr-view').css('zoom'), 10)
            // const vwValue = currentZoom / 3 / 3

            const frWrapper = $('.fr-wrapper')
            const frView = $('.fr-element.fr-view')

            frWrapper.css('height', '100%')
            frView.css('height', height)
            // frView.css('width', `${vwValue.toFixed(2)}vw`)
            frView.css('width', this.edit.ieVerticalWidth)
          } else {
            $('.fr-box').css('height', height)
            $('.fr-wrapper').css('height', '100%')
            $('.fr-element.fr-view').css('min-height', '100%')
          }
        } else {
          $('.fr-box, .fr-wrapper').css('height', height)
          $('.fr-element.fr-view').css('height','100%')
        }

      }
    },
    setEditorContentZoom(rate) {
      $('.fr-view').css({
        zoom: rate,
        padding: '5px'
      })
    },

    /**
     * froala methods
     */
    fontSizeTracking() {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.target.innerText !== '') {
            try {
              let editSizeTitle = '보통'
              let editSize = parseInt(mutation.target.innerText, 10)

              const dropDown = $(".fr-toolbar a[data-cmd='fontSizeV2'].fr-command")
              if (dropDown.length > 0) {
                dropDown.each(function (index, item) {
                  const dropDownSize = parseInt(item.dataset.param1, 10)
                  const dropDownTitle = item.title

                  if (dropDownSize === editSize)
                    editSizeTitle = dropDownTitle
                })

                const editSizeTitleHtml = `<span class="custom-button-title font-size-v2">${editSizeTitle}</span>`
                $(".fr-toolbar button[data-cmd='fontSizeV2']").html(editSizeTitleHtml)
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e)
            }
          }
        }
      })

      const element = document.querySelector(`.fr-toolbar button[data-cmd='fontSize'] span`)
      observer.observe(element, { childList: true })
      element.append(document.createElement('span'))
    },
    makeFileInfo(response) {
      const item = response._links ? response : null

      let fileConvertPath = null

      try {
        if (item._links.convert && item._links.convert.href)
          fileConvertPath = item._links.convert.href
      } catch (error) {
        this.$log.debug(error)
        this.option.loading = false
      }

      let fileInfo = {
        fileName: item.filename.replace(/^.*[\\/]/, ''),
        fileSize: item.size,
        fileOriginalPath: item._links.original.href,
        fileContentType: item.contentType,
        fileFlag: 'FILE'
      }

      if (fileConvertPath !== null)
        fileInfo.fileConvertPath = fileConvertPath

      return fileInfo
    },

    /**
     * 에디터 본문에 이미지 첨부 + 리사이징
     * @param file
     * @param curSelectedImage
     * @returns {Promise<void>}
     */
    async imageUpload(file, curSelectedImage) {
      this.$log.debug(this.$options.name, 'image.beforeUpload: file', file)
      this.option.loading = true

      try {
        if (!file.name)
          file.name = this.$hiClass.getUniqueFileNameFromType(file.type)

        const convertedFile = await this.$hiClass.getConvertedFile(await checkAndConvertHEIC(file))

        this.$log.debug(this.$options.name, 'image.beforeUpload: convertedFile', convertedFile)

        await this.$hiClass.multipart.upload(convertedFile)
            .then(res => {
              this.$log.warn(this.$options.name, `res => `, res)
              const data = res.data
              const imagePath = data._links.original.href
              const froala = this.froala.instance.getEditor()

              froala.image.insert(
                  imagePath,
                  false,
                  null,
                  curSelectedImage,
                  data
              )
            })
            .catch(() => {
              this.option.loading = false
            })

        // eslint-disable-next-line
      } catch (e) {
        this.option.loading = false
      }
    },
    imageInsert(link) {
      const froala = this.froala.instance.getEditor()
      froala.image.insert(link)
    },

    insertModelFile(file) {
      this.$log.debug(`insertModelFile(file) => `, file)
      if (file.fileOriginalPath) {
        this.model.files.push(file)
        this.addedFiles.push(file)
      }
    },
    replaceFile(oldFileIdx, newFile) {
      this.model.files.splice(oldFileIdx, 1, newFile)
      this.addedFiles.splice(oldFileIdx, 1, newFile)
    },
    removeModelFile(file) {
      this.$log.debug(`removeModelFile(file) => `, file)
      // if (file.fileOriginalPath && this.model.files.length > 0) {
      //   const fileIndex = this.model.files.findIndex(f => f.fileOriginalPath === file.fileOriginalPath)
      //   if (fileIndex > -1) {
      //     this.addFilesRemoveQueue(this.model.files[fileIndex])
      //     this.model.files.splice(fileIndex, 1)
      //   }

      // }
      // this.addFilesRemoveQueue(file)

      const fileObj = this.model.files.find(v => v.fileOriginalPath === file.fileOriginalPath || v.fileTranscodePath === file.fileOriginalPath)
      
      this.addFilesRemoveQueue(fileObj)
      this.model.files = [...this.model.files.filter(v => v !== fileObj)]
    },
    removeOnlyModelFile(file) {
      this.$log.debug(`removeOnlyModelFile(file) => `, file)
      const fileObj = this.model.files.find(v => v.fileOriginalPath === file.fileOriginalPath)
      this.addFilesRemoveQueue(fileObj)
      this.model.files = [...this.model.files.filter(v => v.fileOriginalPath !== file.fileOriginalPath)]
    },
    addFilesRemoveQueue(file) {
      this.model.filesRemoveQueue.push(file)
    },
    restoreFilesRemoveQueue() {
      const restoreFilesIndexes = []

      for (const [index, file] of this.model.filesRemoveQueue.entries()) {
        const postContentExists = this.model.postContent.includes(file.fileOriginalPath)
        const fileExists = this.model.files.find(d => d.fileOriginalPath === file.fileOriginalPath)

        if (postContentExists && !fileExists) {
          this.model.files.push(file)
          restoreFilesIndexes.push(index)
        }
      }

      for (const index of restoreFilesIndexes) {
        this.model.filesRemoveQueue.splice(index, 1)
      }
    },
    setLocalStorageItem(itemKey, fontSize) {
      if (this.isBlackboard) itemKey += 'B'

      localStorage.setItem(itemKey, fontSize)
    },

    /**
     * 이미지 태그 src 치환, files 정보에 추가
     * @param imgElements
     * @returns {Promise<void>}
     */
    async externalImageReplace(imgElements) {
      this.option.loading = true

      for (let imgElement of imgElements) {
        const imgSrc = imgElement.getAttribute('src')

        const editorImgArr = imgElements.filter(el => el.getAttribute('src') === imgSrc)
        const targetImgArr = this.model.files.filter(modelFile => modelFile.fileOriginalPath === imgSrc)

        // 외부 이미지 주소이거나 하이클래스 다른 게시물에 업로드된 이미지가 아닐 경우
        if (!imgSrc.includes('download.hiclass.net') ||
            (imgSrc.includes('download.hiclass.net') && editorImgArr.length > targetImgArr.length)
        ) {
          try {
            this._removeImgTagAttrs(imgElement) // 불필요한 태그 속성 제거
            const uploadFile = await this._externalImageUpload(imgSrc) // 이미지 업로드
            eventBus.$emit('editor-insert-model-file', uploadFile) // files 추가
            imgElement.src = uploadFile.fileOriginalPath // img src 교체

          } catch (e) {
            this.$hiClass.alert('이미지를 불러오지 못했습니다.', 'warning')
            this.option.loading = false
            imgElement.remove() // img 태그 삭제
          }
        }
      }

      this.option.loading = false
    },

    /**
     * 외부 이미지 업로드
     * @param imgSrc
     * @returns {Promise<{fileName, fileSize, fileOriginalPath, fileContentType: *}>}
     * @private
     */
    async _externalImageUpload(imgSrc) {
      try {
        const res = await this.$axios({
          method: 'POST',
          url: `${process.env.VUE_APP_BASE_FILE_URI}/multipart/external/image`,
          data: {file: imgSrc},
          headers: {'Content-Type': 'application/json'}
        })

        const ext = res.data.filename.split('.')[1]
        let fileContentType = ''
        switch (ext.toLowerCase()) {
          case 'jpeg':
          case 'jpg':
            fileContentType = 'image/jpeg'
            break
          case 'png':
          case 'gif':
            fileContentType = `image/${ext.toLowerCase()}`
            break
          default:
            fileContentType = res.data.fileContentType
        }

        return {
          'fileName': res.data.filename,
          'fileSize': res.data.size,
          'fileOriginalPath': res.data._links.original.href,
          'fileContentType': fileContentType,
          'fileFlag': 'FILE'
        }

      } catch (e) {
        this.$log.warn(e)
        throw new Error(e)
      }
    },

    /**
     * 불필요한 element 속성값 삭제
     * @param imgElement
     * @returns {*}
     */
    _removeImgTagAttrs(imgElement) {
      imgElement.getAttributeNames().forEach(attr => {
        if (attr !== 'src' && attr !== 'class') {
          imgElement.removeAttribute(attr)
        }
      })
    },

    videoContentCheck() {
      const videoEls = document.querySelectorAll('.fr-element video')
      const checkVideos = []
      const sourceSrcEls = []
      for(const videoEl of videoEls) {
          const sourceEl = videoEl.querySelector('source')
          const src = sourceEl.getAttribute('src')
          sourceSrcEls.push(src)

          const index = this.videoFiles.findIndex(f => f.fileOriginalPath === src || f.fileTranscodePath === src)
          if(!(index > -1)) {
            checkVideos.push(videoEl)
          }
      }

      for(const checkVideo of checkVideos) {
        checkVideo.remove()
      }

      for(const file of this.videoFiles) {
        const index = sourceSrcEls.findIndex(v => v === file.fileOriginalPath || v === file.fileTranscodePath)

        if(!(index > -1)) {
          this.removeModelFile(file)
        }
      }
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
            initialized: async (editor) => {
              // 에디터 리사이즈, 기본 폰트 사이즈 지정
              if (this.isBlackboard) {
                this.setEditorHeight(this.contentHeightStyle)
                this.setEditorContentZoom(this.edit.initZoomValueV2)
              }

              // froala editor init complete!
              eventBus.$emit('froala-editor-init-complete')

              // 화면 갱신
              await this.$nextTick()

              // 에디터 본문 작성 폼에 포커싱
              document.querySelector('.fr-view').focus()
              
              // 폰트기본, 글자색 - 적용
              const setEditor = JSON.parse(localStorage.getItem(`${VueInstance.elType}`)) || null
              let setFontSizeV2 = this.edit.fontSizeV2
              let setBold = VueInstance[VueInstance.eType].bold
              if(!setEditor === false) {
                setFontSizeV2 = setEditor.fontSize
                setBold = setEditor.bold
              }

              this.setEditorFontSize(setFontSizeV2)
              // 에디터 placeholder 폰트 스타일 지정 (포커싱 후 실행)
              document.querySelector('.fr-placeholder').style.fontSize = this.edit.fontSizeV2
              
              // 볼드적용 
              if(setBold === "bold"){
                // VueInstance[VueInstance.esType].bold = "Y"
                this.setEditorFontBold(setBold)
              }

              VueInstance[VueInstance.eType] = {
                ...VueInstance[VueInstance.eType], 
                ...{ fontSize: setFontSizeV2, bold: setBold }
              }


              // toolbar hidden fontSize button tracking
              this.fontSizeTracking()
              VueInstance.initHtmlSet = true

              VueInstance.applyAToEditorContent(VueInstance.model.postContent)
            },

            'html.set': function () {
              const vEls = document.querySelectorAll("video")
              if (VueInstance.isBlackboard) {
                if(vEls.length > 0 && VueInstance.initHtmlSet === true) {
                  for(const vEl of vEls) {
                    vEl.style.width = "200px"
                    vEl.style.height = "auto"
                    vEl.style.removeProperty('z-index')
                    vEl.style.removeProperty('position')
                    vEl.setAttribute("controls", true)
                  }
                }
              } else {
                for(const vEl of vEls) {
                  vEl.style.height = "auto"
                  vEl.style.removeProperty('z-index')
                  vEl.style.removeProperty('position')
                  vEl.style.width = "300px"
                }
              }
            },

            'html.get': function () {
              if (VueInstance.isBlackboard) {
                if(VueInstance.initHtmlSet === true) VueInstance.initHtmlSet = false
              }
            },

            keydown: (keydownEvent) => {
              VueInstance.$log.debug(`keydownEvent.originalEvent.isComposing =>`, keydownEvent.originalEvent.isComposing);
              if (keydownEvent.originalEvent.isComposing) {
                return;
              }
              const el = document.querySelector('button[data-cmd="bold"]');
              
              let bold = ""
              if(el.classList.contains("fr-active") === true) bold = "bold"
              localStorage.setItem(`${VueInstance.elType}`, JSON.stringify({...VueInstance[VueInstance.eType], ...{bold : `${bold}`}}))
              VueInstance[VueInstance.eType] = {
                ...VueInstance[VueInstance.eType], ...{ bold: `${bold}` }
              }

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

            click: (e) => {
              //if(this.isBlackboard === true) {
                const videoEl = e.currentTarget.querySelector("video")
                if(!videoEl === false) {
                  videoEl.style.zIndex = "9999"
                  videoEl.style.position = "relative"
                  videoEl.setAttribute("controls", true)
                } else if(e.target.nodeName === "VIDEO") {
                  e.target.setAttribute("controls", true)
                } else {
                  const videoEls = document.querySelectorAll("video")
                  for(const videoEl2 of videoEls) {
                    videoEl2.style.removeProperty('z-index')
                    videoEl2.style.removeProperty('position')
                    videoEl2.setAttribute("controls", true)
                  }
                }
             // }

              if(this.model.postContent === "") {
                VueInstance[VueInstance.esType].bold = "Y"
                if(VueInstance[VueInstance.eType].bold === "bold") this.setEditorFontBold("bold")
              }
            },

            // font sync
            contentChanged: () => {
              VueInstance.removeNonUrlATags()
            },

            'paste.after': () => {
              eventBus.$log.debug("paste.after", this.type)

              let imgElements = []
              
              if (this.type !== 'BLACKBOARD') {
                imgElements = Array.from(document.querySelector('.modal-board-editor .fr-element').querySelectorAll('img'))
              } else {
                imgElements = Array.from(document.querySelector('.note-edit-inner .fr-element').querySelectorAll('img'))
              }

              const externalImages = imgElements.filter(el => !el.getAttribute('src').includes('base64'))
              if (externalImages.length > 0) {
                this.externalImageReplace(externalImages)
              }

              this.editorSelectionSave()
              const editorContent = VueInstance.froala.instance.getEditor().html.get(true)
              const parser = new DOMParser()
              const innerText = parser.parseFromString(editorContent, 'text/html').body.innerText
              if (VueInstance.getUrlRegex().test(innerText)) {
                VueInstance.applyAToEditorContent(editorContent)
              }
              this.editorSelectionRestore()
            },

            blur: () => {
              eventBus.$emit('editor-selection-save')
            },

            focus: () => {
              try {
                const froala = this.froala.instance.getEditor()
                froala.markers.remove()
              } catch (err) {
                this.$log.debug(err)
              }
            },
            'commands.before': function (cmd, param1, param2) {
              // Do something here.
              // this is the editor instance.
              eventBus.$log.debug('commands.before this | cmd | param1 | param2 => ', this, cmd, param1, param2);
              eventBus.$log.debug(cmd, param1, param2)

              if(cmd === "clearFormatting") {
                localStorage.setItem(`${VueInstance.elType}`, JSON.stringify({
                  ...VueInstance[VueInstance.eType], 
                  ...{
                    fontSize: "17px",
                    bold: "",
                  }
                }))

                VueInstance[VueInstance.eType] = {
                  ...VueInstance[VueInstance.eType], 
                  ...{ 
                    fontSize: "17px",
                    bold: "",
                  }
                }
              }
            },

            /**
             * commands.after
             * docs) https://froala.com/wysiwyg-editor/docs/events/#commands.after
             */
            'commands.after': function (cmd, param1, param2) {
              eventBus.$log.debug('commands.after this | cmd | param1 | param2 => ', this, cmd, param1, param2);
              eventBus.$log.debug(cmd, param1, param2)
              
              if(cmd === 'fontSizeV2') {
                localStorage.setItem(`${VueInstance.elType}`, JSON.stringify({...VueInstance[VueInstance.eType], ...{fontSize : `${param1}px`}}))
                VueInstance[VueInstance.eType] = {
                  ...VueInstance[VueInstance.eType], ...{ fontSize : `${param1}px` }
                }
              }

              if(cmd === 'bold') {
                if(VueInstance[VueInstance.esType].bold !== "Y"){
                  let bold = ""
                  if(VueInstance[VueInstance.eType].bold === "bold") bold = ""
                  else bold = "bold"

                  localStorage.setItem(`${VueInstance.elType}`, JSON.stringify({...VueInstance[VueInstance.eType], ...{bold : `${bold}`}}))
                  VueInstance[VueInstance.eType] = {
                    ...VueInstance[VueInstance.eType], ...{ bold: `${bold}` }
                  }
                }

                if(VueInstance[VueInstance.esType].bold === "Y") VueInstance[VueInstance.esType].bold = "N"
              }

              if(cmd === "clearFormatting") {
                // 영상의 서식이 지워지는 경우 서식 복원
                document.querySelectorAll('video').forEach(video => {
                  if (video.parentNode.tagName.toLowerCase() === 'p') {
                    const span = document.createElement('span')
                    span.className = 'fr-video fr-dvb fr-draggable'
                    span.contentEditable = 'false'
                    span.draggable = 'true'

                    video.style = 'width: 300px'
                    video.controls = 'true'
                    video.replaceWith(span)
                    span.appendChild(video)
                  }
                })
              }

            },
            'commands.redo': () => {
              this.$log.debug('commands.redo this => ', this);
              this.restoreFilesRemoveQueue()
            },
            'commands.undo': () => {
              this.$log.debug('commands.undo this => ', this);
              this.restoreFilesRemoveQueue()
            },

            /**
             * image upload events
             */
            'image.beforeUpload': images => {
              const froala = this.froala.instance.getEditor()
              const curSelectedImage = froala.image.get()
              // Return false if you want to stop the image upload.
              this.imageFiles.length > 99 // 100개 제한. 현재 업로드이미지는 제외
                ? this.$hiClass.alert('추가할 수 있는 개수가 초과되었습니다.')
                : this.imageUpload(images[0], curSelectedImage)

              // disabled: froala server image upload function
              return false
            },
            'image.uploaded': (/*response*/) => {
              // Return false if you want to stop the image upload.
              return false
            },
            /**
             * image inserted events
             * @param $img | A jQuery object containing the inserted image.
             * @param response | The original server response. (object)
             */
            'image.inserted': function($img, response) {
              // Image was inserted in the editor.
              VueInstance.$log.debug(
                  'image.inserted $img, response => ',
                  $img,
                  response
              )
              if (!response) return false

              let fileInfo = VueInstance.makeFileInfo(response)

              VueInstance.$log.debug(`fileInfo => `, fileInfo)

              // files 객체에 삽입된 이미지 파일을 추가 요청
              eventBus.$emit('editor-insert-model-file', fileInfo)
              VueInstance.option.loading = false
            },
            /**
             * image replaced events
             * @param $img | A jQuery object containing the new image.
             * @param response | The original response from the server.
             */
            'image.replaced': function($img, response) {
              // Image was replaced in the editor.
              VueInstance.$log.debug(
                  'image.replaced $img, response => ',
                  $img,
                  response
              )

              const item = response ? JSON.parse(response) : null

              let fileConvertPath = null

              try {
                if (item._links.convert && item._links.convert.href)
                  fileConvertPath = item._links.convert.href
              } catch (error) {
                VueInstance.$log.debug(error)
                VueInstance.option.loading = false
              }

              let fileInfo = {
                fileName: item.filename.replace(/^.*[\\/]/, ''),
                fileSize: item.size,
                fileOriginalPath: item._links.original.href,
                fileContentType: item.contentType
              }

              if (fileConvertPath !== null)
                fileInfo.fileConvertPath = fileConvertPath

              VueInstance.$log.debug(`fileInfo => `, fileInfo)

              // files 객체에 삽입된 이미지 파일을 추가 요청
              eventBus.$emit('editor-insert-model-file', fileInfo)
              VueInstance.option.loading = false
            },
            'image.error': function(error, response) {
              VueInstance.option.loading = false

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
                const message = VueInstance.$t(
                  'file.upload.error.size.over.image',
                  {
                    sizeStr: VueInstance.$store.state.upload.class.image.sizeStr
                  }
                )

                const $popup = this.popups.get('image.insert')
                const $layer = $popup.find('.fr-image-progress-bar-layer')
                $layer.find('h3').text(message)
                return false
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
            'image.removed': function($img) {
              // Triggered after image is removed from the Froala Rich Text Editor.
              //   Note: The image is removed only from the editable box and no delete request is being made the server.

              VueInstance.$log.debug('image.removed $img => ', $img)
              VueInstance.$log.debug(`$img.attr('src'):`, $img.attr('src'))

              const file = { fileOriginalPath : $img.attr('src') }
              VueInstance.$log.debug(`file => `, file)

              if (file.fileOriginalPath) {
                // files 객체에서 삽입된 이미지 파일을 삭제 요청
                eventBus.$emit('editor-remove-only-model-file', file)

              } else {
                VueInstance.$hiClass.alert('이미지 삭제가 정상적으로 처리되지 않았습니다.<br>복원(Ctrl + Z) 후 다시 시도해 주세요.', 'warning')
              }
            },

            /**
             * file upload events (prevent)
             */
            'file.beforeUpload': function (files) {
              // Return false if you want to stop the video upload.
              eventBus.$log.debug('file.beforeUpload: files => ', files)

              /**
               * HEIC 파일은 floala에서 이미지로 지원하지 않아 file 이벤트로
               * 호출 되기 떄문에 HEIC 파일만 필터링해 image 이벤트를 호출
               * */

              const heicImages = [...files].filter(
                  file =>
                      file &&
                      (file.type === 'image/heic' ||
                          file.name.toLowerCase().endsWith('.heic'))
              )

              if (heicImages.length !== 0) {
                this.events.trigger('image.beforeUpload', [heicImages])
              }

              // heic 이외에 파일이 있다면 원래처럼 alert 뛰우기
              if (heicImages.length !==  files.length) {
                eventBus.$hiClass.alert(`본문에 문서 파일을 삽입할 수 없습니다.<br>문서 첨부 기능을 이용해주세요.`)
              }

              return false
            },


            /**
             * video upload events
             */
            'video.beforeUpload': (/* videos */) => {
              // Return false if you want to stop the video upload.
              const positionElement = document.querySelector('.fr-drag-helper.fr-visible')
              if(positionElement) {
                positionElement.classList.remove('fr-visible')
              }
              const froala = this.froala.instance.getEditor()
              if(froala.video.get()) {
                froala.popups.hide('video.insert')
                this.$hiClass.alert('편집기에 선택되어 있는 비디오를 선택 해지 하고 업로드 해주세요.')
                this.option.loading = false
                return false
              }
              // let existsVideoFileCount = 0
              // const checkVideos = []
              // const videoEls = document.querySelectorAll('.fr-element video')
              // for(const videoEl of videoEls) {
              //   const sourceEl = videoEl.querySelector('source')
              //   const src = sourceEl.getAttribute('src')
              //   console.log("sourceEl", sourceEl)

              //   const index = this.model.files.findIndex(f => f.fileOriginalPath === src)
              //   if(!(index > -1)) {
              //     existsVideoFileCount++
              //     checkVideos.push(videoEl)
              //   }
              // }

              // for(const checkVideo of checkVideos) {
              //   checkVideo.remove()
              // }

              eventBus.$log.debug("this.videoFiles => ", this.videoFiles)
              // for(const videoFile of this.videoFiles) {
              //   if (this.model.postContent.includes(videoFile.fileOriginalPath)) {
              //     existsVideoFileCount++
              //   } else {
              //     this.removeModelFile(videoFile)
              //   }
              // }
              // eventBus.$log.debug('this.model.files => ', this.model.files)

              if (this.videoFiles.length > 9) {
                froala.popups.hide('video.insert')
                this.$hiClass.alert('동영상은 최대 10개까지 가능합니다.')
                this.option.loading = false
                return false
              }

              this.option.loading = true
            },
            'video.beforeRemove': function ($video) {
              // Do something here.
              // this is the editor instance.
              eventBus.$log.debug('video.beforeRemove: $video => ', $video)

              eventBus.$log.debug("currentSrc", $video[0].children[0].currentSrc)
              const file = {
                fileOriginalPath : $video[0].children[0].currentSrc
              }
              eventBus.$log.debug('file => ', file)

              // files 객체에서 삽입된 파일을 삭제 요청
              eventBus.$emit('editor-remove-model-file', file)
            },
            'video.uploaded': async function (response) {
              // Video was uploaded to the server.
              eventBus.$log.debug('video.uploaded: response => ', response)

              // if (eventBus.$comn.isIE()) {
              //   try {
              //     const item = response ? JSON.parse(response) : null

              //     // Parse response to get video url.
              //     let fileConvertPath = null
              //     // let fileTranscodePath = null

              //     try {
              //       if (item._links.convert && item._links.convert.href)
              //         fileConvertPath = item._links.convert.href
              //     } catch (error) {
              //       this.$log.debug(error)
              //     }

              //     let fileInfo = {
              //       fileName: item.filename.replace(/^.*[\\/]/, ''),
              //       fileSize: item.size,
              //       fileOriginalPath: item._links.original.href,
              //       fileContentType: item.contentType
              //     }

              //     if (fileConvertPath !== null)
              //       fileInfo.fileConvertPath = fileConvertPath

              //     // if (fileInfo.fileOriginalPath && fileInfo.fileOriginalPath.includes('.')) {
              //     //   const fileNameNoExtension = fileInfo.fileOriginalPath.replace(/\.[^/\\.]+$/, "")
              //     //   const fileExtension = eventBus.$comn.getFileExtensionName(fileInfo.fileOriginalPath)
              //     //   fileTranscodePath = `${fileNameNoExtension}_1024k.${fileExtension}`
              //     // }

              //     let embeddedVideoHtml = `<video class="fr-draggable" controls style="width: 300px;">`
              //     embeddedVideoHtml += `<source src="${fileInfo.fileOriginalPath}" type="${fileInfo.fileContentType}">`
              //     // if (fileTranscodePath)
              //     //   embeddedVideoHtml += `<source src="${fileTranscodePath}" type="${fileInfo.fileContentType}">`
              //     embeddedVideoHtml += `</video>`

              //     /**
              //      * Insert video (embedded html)
              //      * this ===> froala editor instance
              //      */
              //     await this.video.insert(embeddedVideoHtml)
              //     VueInstance.model.postContent = this.html.get(true)

              //     // files 객체에 삽입된 파일을 추가 요청
              //     eventBus.$emit('editor-insert-model-file', fileInfo)

              //     VueInstance.option.loading = false
              //     return false // close method chaining
              //   } catch (error) {
              //     eventBus.$log.warn(error)
              //     VueInstance.option.loading = false
              //   }
              // }
            },
            /**
             * video inserted events
             * @param $video
             * @param response
             */
            'video.inserted': function ($video, response) {
              // Video was inserted in the editor.
              eventBus.$log.debug('video.inserted: $video, response => ', $video, response)

              try {
                // html5 video 미지원 문구 삭제
                $video[0].children[0].textContent = ''
              } catch (e) {
                VueInstance.$log.error(e)
                VueInstance.option.loading = false
              }

              const item = response ? JSON.parse(response) : null

              let fileConvertPath = null

              try {
                if (item._links.convert && item._links.convert.href)
                  fileConvertPath = item._links.convert.href
              } catch (e) {
                VueInstance.$log.error(e)
                VueInstance.option.loading = false
              }

              let fileInfo = {
                fileName: item.filename.replace(/^.*[\\/]/, ''),
                fileSize: item.size,
                fileOriginalPath: item._links.original.href,
                fileContentType: item.contentType
              }

              if (fileConvertPath !== null)
                fileInfo.fileConvertPath = fileConvertPath

              if (item.requestId)
                fileInfo.requestId = item.requestId

              /**
               * video - source 태그 구조로 변경 (app 호환)
               */
              let parentBasicEl
              const videoTag = $video[0].children[0] // span.fr-video > video 태그
              videoTag.removeAttribute('src')
              const source = document.createElement('source') // span.fr-video > video > source 태그
              source.src = item._links.original.href
              source.type = item.contentType
              videoTag.appendChild(source)

              const cloneVideo = videoTag.parentNode.cloneNode(true)

              parentBasicEl = videoTag.parentNode.parentNode.parentNode
              if(videoTag.parentNode.parentNode.nodeName === 'P') {
                parentBasicEl = videoTag.parentNode.parentNode
              }
              // videoTag.parentNode.remove()

              // const pEl2 = document.createElement('p')
              // const brEl2 = document.createElement('br')
              // pEl2.appendChild(brEl2)
              // pEl.setAttribute('contenteditable', 'false')

              const pElA1 = document.createElement('p')
              const brEl = document.createElement('br')
              pElA1.appendChild(brEl)

              const pElA2 = document.createElement('p')
              pElA2.appendChild(cloneVideo)

              // parentBasicEl.before(pEl2)
              parentBasicEl.after(pElA1)
              parentBasicEl.after(pElA2)

              videoTag.parentNode.remove()

              // files 객체에 삽입된 파일을 추가 요청
              eventBus.$emit('editor-insert-model-file', fileInfo)
              eventBus.$emit('editor-content-check-file')

              const videoProgressEl = document.querySelector('.fr-video-progress-bar-layer')
              videoProgressEl.classList.remove('fr-active')

              const insertVideoEl = document.querySelector('[data-cmd="insertVideo"]')
              insertVideoEl.classList.remove('fr-btn-active-popup')

              VueInstance.option.loading = false
            },
            'video.replaced': function ($img, response) {
              // Video was replaced in the editor.
              eventBus.$log.debug('video.replaced: $img, response => ', $img, response)
            },
            'video.loaded': function ($video) {
              // Do something here.
              // this is the editor instance.
              eventBus.$log.debug('video.loaded: $video => ', $video)
              //$video[0].children[0].textContent = ''
              
              // html5 video 미지원 문구 삭제 다시한번체그하고 삭제 
              for(const el of $video[0].children[0].childNodes) {
                if(el.nodeName === '#text') {
                  el.remove()
                }
              }
              // alert('파일 업로드 완료')
              VueInstance.option.loading = false
            },
            'video.removed': async function($videos) {
              // Image was replaced in the editor.

              eventBus.$log.debug('video.removed $videos => ', $videos)
              const file = {
                fileOriginalPath : $videos[0].currentSrc
              }
              eventBus.$log.debug('file => ', file)

              // files 객체에서 삽입된 파일을 삭제 요청
              eventBus.$emit('editor-remove-model-file', file)
            },
            'video.error': function (error,/* response */) {
              eventBus.$log.debug('video.error: error => ', error)
              VueInstance.option.loading = false

              let message = error.message

              /**
               * video error code
               * 1: Bad link.
               * 2: No link in upload response.
               * 3: Error during video upload.
               * 4: Parsing response failed.
               * 5: Video too text-large.
               * 6: Invalid video type.
               * 7: Video can be uploaded only to same domain in IE 8 and IE 9.
               */

              switch (error.code) {
                case 1:
                  message = VueInstance.$t('file.upload.error.bad.link')
                  break
                case 2:
                  message = VueInstance.$t('file.upload.error.noLink.upload.response')
                  break
                case 3:
                  message = VueInstance.$t('file.upload.error.during.video.upload')
                  break
                case 4:
                  message = VueInstance.$t('file.upload.error.parsing.response.failed')
                  break
                case 5: {
                  message = VueInstance.$t(
                    'file.upload.error.size.over.video',
                    {
                      sizeStr: VueInstance.$store.state.upload.class.video.sizeStr
                    }
                  )
                  break
                }
                case 6:
                  message = VueInstance.$t('file.upload.error.video.file.type')
                  break
                case 7:
                  message = message || 'Video can be uploaded only to same domain in IE 8 and IE 9.'
                  break
              }

              switch (error.code) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7: {
                  const $popup = this.popups.get('video.insert')
                  const $layer = $popup.find('.fr-video-progress-bar-layer')
                  $layer.find('h3').text(message)
                  return false
                }
              }
              // Response contains the original server response to the request if available.
            },
            'url.linked': function (link) {
              if (VueInstance.type === 'BLACKBOARD') {
                const text = document.createTextNode(link.textContent)
                link.before(text)
                link.remove("a")
              } else {
                link.href = ''
              }
            }
          }
          break   // end init events
        }
      }
    },
    async editImages(uploadedFiles, inputFiles, targetIdx) {
      await this.openImageEditor({
        uploadedFiles,
        inputFiles,
        imageLimitCount: 100,
        componentKey: this.$vnode.key,
        targetIdx,
        parentComponent: 'hcEditor'
      })
    },
    getUrlRegex() {
      const tldStr = this.tlds.join('|')
      return new RegExp(`((?:https?:\\/\\/|www\\.)[a-zA-Z0-9가-힣.-]+\\.[a-zA-Z]{2,}|\\b[a-zA-Z0-9가-힣.-]+\\.(?:${tldStr}))(?=[/?]|\\b)[^\\s\u00A0"'<>()\\[\\]]*`, "gi")
    },
    async removeNonUrlATags() {
      if (this.type === 'BLACKBOARD') return

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      let currentNode = range.startContainer.parentNode

      if (!currentNode.closest('.fr-element.fr-view')) return

      if (currentNode.querySelectorAll('a').length > 0) {
        for (let a of currentNode.querySelectorAll('a')) {
          if (a.href) a.href = ''
        }
      }

      // 엔터키 입력된 경우 현재 노드 이전 노드까지 체크
      const previousSibling = currentNode.parentNode.previousSibling
      if (previousSibling && previousSibling.querySelectorAll('a').length > 0) {
        for (let a of previousSibling.querySelectorAll('a')) {
          if (!this.getUrlRegex().test(a.innerText)) {
            a.outerHTML = a.innerHTML
          }
        }
      }

      if (currentNode.nodeName !== 'A') return

      // 공백이 있는 경우 공백으로 잘라서 체크
      if (/\s/g.test(currentNode.innerText)) {
        currentNode.innerText.split(/\s/g).forEach(text => {
          if (!this.getUrlRegex().test(text)) {
            const matches = currentNode.innerText.match(new RegExp(`${text}\\s+`, "g"))
            if (matches && matches.length > 0) {
              currentNode.parentNode.insertBefore(document.createTextNode(matches[0]), currentNode)
              currentNode.innerText = currentNode.innerText.replace(matches[0], '')
            }
          }
        })
      }

      if (this.getUrlRegex().test(currentNode.innerText)) return

      this.editorSelectionSave()
      currentNode.outerHTML = currentNode.innerHTML
      this.editorSelectionRestore()
    },
    applyAToEditorContent(content) {
      if (this.type === 'BLACKBOARD') return
      if (content.includes('base64')) return

      const parser = new DOMParser()
      const contentHTML = parser.parseFromString(content, 'text/html').body

      const pTags = contentHTML.querySelectorAll('p')
      for (let p of pTags) {
        p.innerHTML = p.innerHTML.replace(this.getUrlRegex(), (match, url, offset, string) => {
          const before = string.slice(offset - 10, offset)
          if (/src=["']$/i.test(before) || /poster=["']?$/i.test(before) || /href=["']?$/i.test(before) || /cite=["']?$/i.test(before) || /srcset=["']?$/i.test(before)) {
            return match
          }
          return `<a target="_blank" href="">${match}</a>`
        })
      }

      if (contentHTML !== '') {
        this.setContent(contentHTML.innerHTML)
      }
    }
  } // end methods
} // end script
</script>

<style lang="scss">
// 알림장 판서, 모달에디터 기본값 정의
.fr-box .fr-wrapper .fr-view{
  font-size: 17px;
}

// 알림장 판서
.note-cont-wrap {
  * {
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    color: inherit;
    line-height:140%;
  }
}

// 학급공지, 앨범, 자유게시판, 과제
.contents-wrap {
  .fr-toolbar.fr-top {
    border: 0;
    background-color: #fff !important;
    margin: 0 1px;
  }

  * {
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    color: inherit;
    line-height:140%;
  }
}

.fr-toolbar {
  border-radius: 0 !important;
}

// froala toolbar default font-size button hidden
.fr-toolbar {
  button[data-cmd='fontSize'] {
    display: none;
  }
  span.custom-button-title.font-size-v2 {
    font-size: 16px;
    width: 70px;
    padding: 0 0 0 15px;
    transform: skew(0.2deg);
  }
}

// froala color popup custom
.fr-popup .fr-color-set.fr-selected-set {
  padding-bottom: 20px;
}

// modal in froala toolbar sticky
.modal-cont-inner .contents-wrap {
  position: sticky;
}
.fr-toolbar {
  position: sticky;
  z-index: 2;
}
.modal-board-editor .contents-wrap .input-box-wrap.input-cont input {
  height:auto!important;
  width:100%!important;
}
.fr-sticky-on+.fr-sticky-dummy, .fr-sticky-dummy {
  display: none;
}

.fr-view img.fr-dii {
  margin: 5px auto;
  display: block;
  float: none;
}

.fr-popup .fr-buttons [id^="imageEdit"] {
  float: left;
}
</style>