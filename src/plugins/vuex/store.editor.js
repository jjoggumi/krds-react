import { getField, updateField } from 'vuex-map-fields'

const requestURL = process.env.VUE_APP_BASE_API_URI
const fileURL = process.env.VUE_APP_BASE_FILE_URI
const multipartURL = fileURL + '/multipart'

const REQUEST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

const storeEditor = {
  namespaced: true,
  state: {
    requestURL,
    fileURL,
    multipartURL,

    edit: {
      fontName: 'Gulim',
      fontSize: '100px',
      fontSizeV2: '17px',
      maxByte: 63000,
      maxLength: 1500,
      initZoomValueV1: 1,
      initZoomValueV2: 4,
      ieVerticalWidth: `${(100 / 4).toFixed(2)}vw`,
      ieVerticalHeight: `${(100 / 4).toFixed(2)}vh`,
    },

    editorComponentKey: 0,

    config: {
      key: process.env.VUE_APP_BASE_EDITOR_ACTIVATION_KEY, // set license key
      language: 'ko', // set languages

      /**
       * option test
       */
      // iframe: true,
      // documentReady : true,
      // heightMax: 377,

      imageDefaultWidth: 0,

      // TODO: video option test
      // videoMove: true,
      // videoResize: true,
      videoDefaultWidth: 300,
      // videoDefaultDisplay: 'inline',

      /**
       * image upload option
       */
      imageUploadParam: 'file', // Set the image upload parameter.
      imageUploadURL: null, // Set the image upload URL.
      imageUploadRemoteUrls: false,
      // imageUploadParams: { id: 'froala' }, // Additional upload params.
      imageUploadMethod: 'POST', // Set request type.

      // store.upload.class.image.size 참조
      imageMaxSize: 300 * 1024 * 1024, // Set max image size to 300MB.
      imageAllowedTypes: ['gif', 'png', 'jpg', 'jpeg'], // Allow to upload Image Files
      // imageAllowedTypes: [
      //   'apng',
      //   'bmp',
      //   'gif',
      //   'ico',
      //   'cur',
      //   'jpg',
      //   'jpeg',
      //   'jfif',
      //   'pjpef',
      //   'pjp',
      //   'png',
      //   'svg',
      //   'tif',
      //   'tiff',
      //   'webp'
      // ],
      /**
       * end image upload option
       */

      /**
       * file upload option (non image)
       */
      /**
       * end file upload option (non image)
       */

      /**
       * video upload option
       */
      videoUploadParam: 'file', // Set the video upload parameter.
      videoUploadURL: `${multipartURL}?fromFroalaVideo&encode=false`, // Set the video upload URL.
      // videoUploadParams: { id: 'froala' }, // Additional upload params.
      videoUploadMethod: 'POST', // Set request type.
      // videoResponsive: true,
      // videoResize: false,

      // store.upload.class.video.size 참조
      videoMaxSize : 500 * 1024 * 1024, // Set max image size to 500MB.
      AllowedTypes: ["mp4", "ts", "mov", "3gp", "3g2", "mxf", "webm", "mkv", "flv", "avi", "wmv", "wma", "asf", "mp3", "aac", "ac3"], // Allow to upload Image Files
      videoAllowedTypes: ["mp4", "ts", "mov", "3gp", "3g2", "mxf", "webm", "mkv", "flv", "avi", "wmv", "wma", "asf", "mp3", "aac", "ac3", 'quicktime'], 
      /**
       * end video upload option
       */

      autofocus: false,
      charCounterCount: false,
      tabSpaces: 4,
      // 탭 키 사용
      quickInsertEnabled: false,
      // htmlUntouched: false,
      keepFormatOnDelete: true, // enter style 유지를 위해
      fontFamilySelection: true, // 에디터 폰트 추적용
      fontSizeSelection: true, // 에디터 폰트 추적용

      // toolbarBottom: true, // 툴바 에디터 하단에 위치 (모바일 적용 안됨)

      /**
       * toolbar buttons
       */
      // toolbarButtons: [],
      imageInsertButtons: ['imageBack', 'imageUpload'],
      imageEditButtons: ['imageReplace', 'imageRemove', 'imageSize', 'imageEdit'],
      videoInsertButtons: ['imageBack', 'videoUpload'],
      videoEditButtons: [],

      // Colors list.
      colorsText: [
        'REMOVE', '#000000', '#FF0707', '#FF6B00',
        '#FFB800', '#10C622', '#066AFF', '#BD00FF'
      ],
      colorsBackground: [
        'REMOVE', '#69CCFF', '#FE7D3E', '#FFB800',
        '#76E051', '#FF6D82', '#8D8D8D'
      ],
      colorsStep: 4,
      colorsHEXInput: false,

      // inlineStyles: {
      //   'Normal Red': 'font-size: 15px; color: #FF0000;',
      //   'more Blue': 'font-size: 18px; color: #0000FF;',
      //   'do more Green': 'font-size: 18px; color: #00FF00;'
      // },

      /**
       * paste
       */
      pastePlain: true, // 붙여넣기 서식 제거 유무

      /**
       * wordPaste option
       */
      wordPasteModal: false,
      // wordDeniedAttrs: ['style'],
      // wordPasteKeepFormatting: true,

      /**
       * link Options
       */
      linkAlwaysBlank: true,
      linkNoOpener: true,
      linkNoReferrer: true,

      /**
       * General
       */
      shortcutsEnabled: ['show', 'bold', 'italic', 'underline', 'strikeThrough', 'indent', 'outdent', 'undo', 'redo', /*'insertImage',*/ 'createLink'],
      spellcheck: false,
      dragInline: false,

      /**
       * 버전 체크 후 초기화할 props
       */
      events: {},
      fontNames: [],
      fontSizes: [],
      fontFamily: {},
      fontSize: []
    },



    /**
     * load diff props. by post version
     */
    V1: {
      fontNames: [
        { key: 'Gulim', value: '굴림' },
        { key: 'GulimChe', value: '굴림체' },
        { key: 'Dotum', value: '돋움' },
        { key: 'DotumChe', value: '돋움체' },
        { key: 'Gungsuh', value: '궁서' },
        { key: 'GungsuhChe', value: '궁서체' },
        { key: 'Batang', value: '바탕' },
        { key: 'BatangChe', value: '바탕체' },
        { key: 'Arial', value: 'Arial' },
        { key: 'Comic Sans MS', value: 'Comic Sans MS' },
        { key: 'Courier New', value: 'Courier New' },
        { key: 'Georgia', value: 'Georgia' },
        { key: 'Lucida Sans', value: 'Lucida Sans' },
        { key: 'Tahoma', value: 'Tahoma' },
        { key: 'Times New Roman', value: 'Times New Roman' },
        { key: 'Trebuchet Ms', value: 'Trebuchet Ms' },
        { key: 'Verdana', value: 'Verdana' }
      ],
      fontSizes: [
        { key: '30px', value: '30' },
        { key: '40px', value: '40' },
        { key: '50px', value: '50' },
        { key: '60px', value: '60' },
        { key: '70px', value: '70' },
        { key: '80px', value: '80' },
        { key: '90px', value: '90' },
        { key: '100px', value: '100' },
        { key: '110px', value: '110' },
        { key: '120px', value: '120' }
      ],
      /**
       * set default fontFamily
       */
      fontFamily: {
        Gulim: '굴림',
        GulimChe: '굴림체',
        Dotum: '돋움',
        DotumChe: '돋움체',
        Gungsuh: '궁서',
        GungsuhChe: '궁서체',
        Batang: '바탕',
        BatangChe: '바탕체',
        Arial: 'Arial',
        'Comic Sans MS': 'Comic Sans MS',
        'Courier New': 'Courier New',
        Georgia: 'Georgia',
        'Lucida Sans': 'Lucida Sans',
        Tahoma: 'Tahoma',
        'Times New Roman': 'Times New Roman',
        'Trebuchet Ms': 'Trebuchet Ms',
        Verdana: 'Verdana'
      },
      /**
       * set default fontSize
       */
      fontSize: [30, 40, 50, 60, 70, 80, 100, 110, 120],
      placeholderText: '',
      toolbarButtons: [
        'fontSize', '|', 'bold', 'underline', 'textColor', 'backgroundColor', 'clearFormatting', 'insertImage', 'insertVideo'
      ],
      /**
       * [ disabled plugin ]
       * file: file drag upload
       * video: video file drag upload
       * print: Adds print option to the toolbar.
       *
       * [ disabled third party plugins ]
       * embedly: Embeds any content from the web in the editor
       * fontAwesome: Insert Font Awesome icons in the editor text.
       * imageTUI: Make photos beautiful in seconds with stunning filters, frames, stickers, touch-up tools and more.       *
       */
      pluginsEnabled: [
        'align',
        'charCounter',
        'codeBeautifier',
        'codeView',
        'colors',
        'draggable',
        // 'embedly',
        'emoticons',
        'entities',
        // 'file',
        // 'fontAwesome',
        'fontFamily',
        'fontSize',
        'fullscreen',
        'image',
        // 'imageTUI',
        'imageManager',
        'inlineStyle',
        'inlineClass',
        'lineBreaker',
        'lineHeight',
        'link',
        'lists',
        'paragraphFormat',
        'paragraphStyle',
        // 'print',
        'quickInsert',
        'quote',
        'save',
        'table',
        'url',
        // 'video',
        'wordPaste'
      ],
      wordPasteKeepFormatting: false,
    },
    V2: {
      /**
       * set default fontSize
       */
      fontSize: [17, 20, 24],
      fontSizeUnit: 'px',
      placeholderText: '본문에 이미지를 넣거나 글자색을 변경하실 수 있습니다. 선택한 수신대상만 게시글을 열람하실 수 있습니다.',
      toolbarButtons: [
        'fontSizeV2', 'bold', 'underline', 'textColor', 'backgroundColor', 'clearFormatting', 'insertImage', 'insertVideo',
        'fontSize'
      ],
      /**
       * [ disabled plugin ]
       * file: file drag upload
       * print: Adds print option to the toolbar.
       *
       * [ disabled third party plugins ]
       * embedly: Embeds any content from the web in the editor
       * fontAwesome: Insert Font Awesome icons in the editor text.
       * imageTUI: Make photos beautiful in seconds with stunning filters, frames, stickers, touch-up tools and more.
       */
      pluginsEnabled: [
        'align',
        'charCounter',
        'codeBeautifier',
        'codeView',
        'colors',
        'draggable',
        // 'embedly',
        'emoticons',
        'entities',
        // 'file',
        // 'fontAwesome',
        // 'fontFamily',
        'fontSize',
        'fullscreen',
        'image',
        // 'imageTUI',
        'imageManager',
        'inlineStyle',
        'inlineClass',
        'lineBreaker',
        'lineHeight',
        'link',
        'lists',
        'paragraphFormat',
        'paragraphStyle',
        // 'print',
        'quickInsert',
        'quote',
        'save',
        'table',
        'url',
        'video',
        'wordPaste'
      ],
      wordPasteKeepFormatting: true,
    }

  },
  getters: {
    getField,
    getFontNamesByPostVersion: (state) => (postVersion) => {
      return state[postVersion].fontNames
    },
    getFontSizesByPostVersion: (state) => (postVersion) => {
      return state[postVersion].fontSizes
    },
    getFontFamilyByPostVersion: (state) => (postVersion) => {
      return state[postVersion].fontFamily
    },
    getFontSizeByPostVersion: (state) => (postVersion) => {
      return state[postVersion].fontSize
    },
    getPlaceholderTextByPostVersion: (state) => (postVersion) => {
      return state[postVersion].placeholderText
    },
    getPluginsEnabledByPostVersion: (state) => (postVersion) => {
      return state[postVersion].pluginsEnabled
    },
    getToolbarButtonsByPostVersion: (state) => (postVersion) => {
      return state[postVersion].toolbarButtons
    },
  },
  mutations: {
    updateField
  },
  actions: {
    /**
     *  특정타입의 게시판 list 가져오기
     *  게시판 타입(NOTE:알림장, ALBUM:앨범, BOARD:자유게시판, HOMEWORK:과제, CP_BOARD:CP)
     */
    ///clazzes/{classId}/board?postType=NOTE&includeDefaultFolder=true
    getBoardList: ({state, rootState}, payload) => {
      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `/clazzes/${payload.classId}/board`,
        // url: `/boards/clazzSubscribes/postType/${postType}/!q`,
        params: payload
      })
        .then(res => {
          return res.data._embedded.boardList
        })
        .catch(err => {
          rootState.log.warn(err)
          rootState.hiClass.alert(err, 'error')
        })
    },
  }
}

export default storeEditor