<template>
  <div
    v-if="isCreate || isUpdate"
    class="modal create-contents-modal"
    :class="{ on: true }"
    @click.self="cancel2()"
    @dragover.prevent
    @dragenter.prevent
    @drop.prevent
    style="display: block"
  >
    <div
      ref="modal"
      class="modal-cont-wrap"
      :class="{ 'dim-indim': dimInDim }"
      :style="modalPosition"
    >
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="title-wrap">
            <div
              class="title"
              :class="[ titleIcon ]"
            >
              <span>게시글 수정하기</span>
            </div>
            <div class="btn-wrap">
              <button
                class="btn-bg-w modal-close-btn"
                :class="{ dis: isUploading }"
                :disabled="isUploading"
                @click="cancel()"
              >
                취소
              </button>
              <button
                class="btn-bg-w2"
                :class="{
                  dis: saveCondition || isUploading || isPostStatusComplete
                }"
                :disabled="saveCondition || isUploading || isPostStatusComplete"
                @click="write(CONSTANTS.POST_STATUS.TEMPORARY)"
              >
                임시저장
              </button>
              <button
                class="btn-bg-c"
                :class="{ dis: saveCondition || isUploading }"
                :disabled="saveCondition || isUploading"
                @click="write(CONSTANTS.POST_STATUS.COMPLETE)"
              >
                올리기
              </button>
            </div>
          </div>

          <div
            class="contents-wrap"
            :class="[ contentsWrapClass ]"
          >
            <!-- 마감일 추가 -->
            <div
              v-if="isPostTypeHomework"
              class="input-box-date"
            >
              <!-- 마감일 설정 체크박스 -->
              <div class="input-sel-date">
                <div class="checkbox-wrap">
                  <input
                    type="checkbox"
                    id="timestampEnd"
                    v-model="checkbox.timestampEnd"
                  />
                  <label for="timestampEnd">
                    <span>마감일 설정</span>
                  </label>
                </div>

                <div
                  v-show="checkbox.timestampEnd"
                  class="date-btn"
                  :class="{
                    dis: !checkbox.timestampEnd
                  }"
                  @click="openCalendar"
                >
                  <span
                    :class="{
                      dis: !checkbox.timestampEnd
                    }"
                  >{{ timestampEndToStr }}</span
                  >
                </div>

                <p v-show="checkbox.timestampEnd" class="txt-date-fin">
                  * 마감일 이후에도 제출할 수 있습니다.
                </p>
              </div>

              <!-- 캘린더 -->
              <main-body-clazzes-rnb-calendar-core
                v-show="option.isOpenCalendar"
                v-click-outside="closeCalendar"
                :isPopupCalendar="true"
                :isShowCalendar="option.isOpenCalendar"
                :prevSelectedDate="selectedDate"
                @selectedDate="setSelectedDate"
              ></main-body-clazzes-rnb-calendar-core>
              <!-- // 캘린더 -->
            </div>
            <!-- // 마감일 추가 -->

            <div class="input-box-wrap input-title">
              <input
                ref="postTitle"
                type="text"
                placeholder="제목을 입력해주세요"
                maxlength="50"
                v-model="model.postTitle"
                @keydown.enter.prevent.stop
              />
            </div>
            <div class="input-box-wrap input-cont">
              <!-- textarea 하단에 파일 추가 리스트 있으면 type2 추가 -->
              <div
                class="textarea-wrap"
                :class="{
                  type2: noMediaFiles.length > 0
                }"
              >
                <textarea
                  ref="postContent"
                  placeholder="내용을 입력해주세요"
                  maxlength="1500"
                  v-model="model.postContent"
                ></textarea>
                <!-- 양쪽에 화살표가 필요하면 type-long 추가 -->
                <div
                  class="attaching-file-list-wrap type-long"
                  :style="{
                    'display: block': noMediaFiles.length > 0
                  }"
                >
                  <div class="attaching-file-list">
                    <Slick :options="slickOptions" ref="slide">
                      <template
                        v-for="file of $comn.isImage(model.files, false)"
                      >
                        <div :key="file.currentId" class="attaching-file">
                          <span>{{ file.fileName }}</span>
                          <button
                            ref="delSlick"
                            class="delete-btn"
                            @click="fileDelete(file)"
                          ></button>
                        </div>
                      </template>
                    </Slick>
                  </div>
                </div>
              </div>

              <hc-clazzes-upload
                :files.sync="model.files"
                :isUploading.sync="isUploading"
                uploadType="board"
              ></hc-clazzes-upload>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import Slick from 'vue-slick'
import HcClazzesUpload from "@/components/Upload/Clazzes/ClazzesUpload";
import MainBodyClazzesRnbCalendarCore from "@/apps/main/clazzes/MainBodyClazzesRnbCalendarCore";

import { eventBus } from "@/main";
import {mapActions, mapGetters, mapMutations} from "vuex";

export default {
  name: 'post-edit-v1',
  components: {MainBodyClazzesRnbCalendarCore, HcClazzesUpload, Slick },
  props: {
    posts: Array,
    clazzUri: String,

    mode: {
      type: String,
      default() {
        return 'update'
      }
    },
    post: {
     type: Object,
     required: true
    },
    isOpenedDetailPopup: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      writeMsg: {
        TEMPORARY:
          '임시 저장한 게시물은 클래스 구성원에게 공개되지 않습니다.\n임시 저장하시겠습니까?',
        COMPLETE: '작성한 내용을 지금 클래스 구성원들에게 보내시겠습니까?'
      },
      slickOptions: {
        speed: 300,
        variableWidth: true,
        cssEase: 'linear',
        infinite: false
      },
      modalPosition: {},
      isUploading: false,
      dimInDim: false,
      // upload
      model: {
        postTitle: '',
        postContent: '',
        files: [],
        posted: null,
        timestampStart: null,
        timestampEnd: null
      },
      select: {
        timestampEnd: null
      },
      checkbox: {
        timestampEnd: false
      },
      option: {
        isOpenCalendar: false
      },
      // 20200404 캘린더 리팩토링 필요
      selectedDate: '',

      // 금칙어가 포함되었을 경우 이전 상태로 되돌림
      oldResource: {},

      curForm: null
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isCreate() {
      return this.mode === undefined || this.mode === 'create'
    },
    isUpdate() {
      return this.mode === 'update'
    },
    isPostStatusComplete() {
      return this.post && this.post.postStatus === this.CONSTANTS.POST_STATUS.COMPLETE
    },
    isPostStatusTemporary() {
      return this.post && this.post.postStatus === this.CONSTANTS.POST_STATUS.TEMPORARY
    },
    isPostTypeHomework() {
      return this.post.postType === this.CONSTANTS.POST_TYPE.HOMEWORK
        || this.isCurFormHomework
    },
    isCurFormHomework() {
      return this.curForm === this.CONSTANTS.POST_TYPE.HOMEWORK
    },
    noMediaFiles() {
      return this.model.files.filter(d => {
        return (
          !d.fileContentType.includes('image/') &&
          !d.fileContentType.includes('video/')
        )
      })
    },
    modeTitle() {
      return this.mode === 'update' ? '수정' : '등록'
    },
    saveCondition() {
      let bool = true

      if (this.isUploading) bool = true

      if (this.model.postTitle !== '') {
        if (this.model.files.length > 0 || this.model.postContent !== '')
          bool = false
      }

      return bool
    },
    timestampEndToStr() {
      return this.model.timestampEnd
        ? this.$moment(this.model.timestampEnd).format('M[월] D[일]') || ''
        : ''
    },
    titleIcon() {
      let titleIcon
      switch (this.post.postType) {
        case this.CONSTANTS.POST_TYPE.NOTE:
        case this.CONSTANTS.POST_TYPE.ALBUM:
        case this.CONSTANTS.POST_TYPE.BOARD:
        case this.CONSTANTS.POST_TYPE.HOMEWORK:
          titleIcon = `type-homework`
          break
      }
      return titleIcon
    },
    contentsWrapClass() {
      return this.isPostTypeHomework ? 'homework-wrap' : ''
    }
  },
  watch: {
    'checkbox.timestampEnd'(val) {
      if (val) this.model.timestampEnd = this.select.timestampEnd
    },
    selectedDate(val) {
      if (val) {
        let curTimestamp = this.$moment().valueOf()

        let newValue =
          this.$moment(this.selectedDate)
            .add(1, 'days')
            .valueOf() - 1
        if (newValue < curTimestamp) {
          // alert(
          //   '지난 날짜를 마감일로 설정할 수 없습니다.\n마감일을 다시 선택해 주세요.'
          // )
          this.initSelectedDate()
        } else {
          this.select.timestampEnd = newValue
        }
      }
    },
    'select.timestampEnd'(val) {
      if (val) this.model.timestampEnd = val
    }
  },

  // lifeCycle
  created() {
    if (this.isCreate) {
      // 달력 초기값 설정
      this.initSelectedDate()

      // postType 초기값 설정
      this.curForm = this.$route.params.board.toUpperCase()

    } else if (this.isUpdate) {
      const modelKeys = Object.keys(this.model)

      for (const key of modelKeys) {
        if (key === 'files') Object.assign(this.model[key], this.post[key])
        else this.model[key] = this.post[key]
      }

      this.model.postContent = this.$hiClass.getHtmlParsedContent(this.model.postContent)

      if (this.isPostTypeHomework) {
        this.model.timestampEnd
          ? this.initSelectedDate(this.model.timestampEnd)
          : this.initSelectedDate()

        // 마감일 설정 체크박스 초기화
        this.checkbox.timestampEnd = !!this.model.timestampEnd;
      }
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.initModalPosition()

    if (this.isUpdate) this.initCloneLocal()
  },
  beforeUpdate() {
    if (this.$refs.slide)
      this.$refs.slide.destroy()
  },
  updated() {
    this.$nextTick(() => {
      if (this.$refs.slide) this.$refs.slide.create(this.slickOptions)
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations({
      setCurPostEditPostItemAttr: 'setCurPostEditPostItemAttr',
    }),
    ...mapActions({
      initCurPostEdit: 'initCurPostEdit',
    }),
    cancel() {
      if (!this.saveCondition) {
        if (confirm('작성 중인 내용이 있습니다.\n취소하시겠습니까?')) this.emitHandlePostEdit(false)

      } else {
        this.emitHandlePostEdit(false)
      }
    },
    cancel2() {
      if (this.isUpdate) {
        let totalChkFlag = true
        let contentTitleChkFlag = false
        let fileChkFlag = false

        const oldObj = this.$store.state.cloneLocalData
        const oldFiles = this.$store.state.cloneLocalFiles
        const newObj = this.model.postTitle + this.model.postContent
        const newFiles = this.model.files.map(d => d.fileOriginalPath)

        contentTitleChkFlag = oldObj !== newObj;

        fileChkFlag = !this.$comn.arrCompare(oldFiles, newFiles);

        if (!contentTitleChkFlag && !fileChkFlag) totalChkFlag = false

        if (!totalChkFlag) this.emitHandlePostEdit(totalChkFlag)
      } else {

        try {
          if (
            this.model.files.length === 0 &&
            this.model.postContent.trim() === '' &&
            this.model.postTitle.trim() === ''
          ) {
            this.emitHandlePostEdit(false)
          }
        } catch (error) {
          this.$log.debug(error)
        }

      }
    },
    write(postStatus) {
      this.backupResource('model', this.model)

      if (this.model.postTitle === '') {
        alert('제목을 입력해주세요.')
        this.$refs.postTitle.focus()
        return false
      }
      if (this.model.postContent === '') {
        alert('본문을 입력해주세요.')
        this.$refs.postContent.focus()
        return false
      }
      if (!confirm(this.writeMsg[postStatus])) return false

      if (!this.checkbox.timestampEnd) this.model.timestampEnd = null

      if (this.isCreate) {
        this.writeProcCreate(postStatus)
      } else if (this.isUpdate) {
        this.writeProcUpdate(postStatus)
      }
    },
    writeProcCreate(postStatus) {
      // 게시물 등록
      const params = {
        parentUri: this.clazzUri,
        postType: this.curForm,
        postStatus: postStatus,
        posted: new Date().getTime(),
        postTitle: this.model.postTitle,
        postContent: this.model.postContent,
      }
      if (this.model.files.length > 0) params.files = this.model.files

      if (this.isPostTypeHomework) {
        params.timestampStart = new Date().getTime()
        params.timestampEnd = !this.checkbox.timestampEnd
          ? null
          : this.model.timestampEnd
      }

      this.$hiClass.posts
        .create(params)
        .then(() => {
          this.emitHandlePostEdit(false)
        })
        .catch(err => {
          this.$log.debug(this.$options.name + ` write ${postStatus} err => `, err)
          this.restoreResource('model')
        })
    },
    writeProcUpdate(postStatus) {
      this.backupResource('post', this.post)

      // 임시저장시 게시일 현재 시간으로 변경
      if (this.isPostStatusTemporary)
        this.post.posted = new Date().getTime()

      this.post.postStatus = postStatus
      this.post.postTitle = this.model.postTitle
      this.post.postContent = this.model.postContent
      this.post.files = this.model.files

      // 과제게시글의 경우 추가
      if (this.isPostTypeHomework) {
        this.post.timestampEnd = !this.checkbox.timestampEnd
          ? null
          : this.model.timestampEnd
      }

      this.$hiClass.posts
        .update(this.post)
        .then(() => {
          // TODO: 2022-09-15 수정한 직후 목록의 데이터가 바뀌지 않음
          const renewItem = this.post
          this.replaceRenewItem(renewItem)
          this.emitHandlePostEdit(false)
        })
        .catch(err => {
          this.$log.debug(this.$options.name + ` write ${postStatus} err => `, err)
          this.restoreResource('model', 'post')
        })
    },
    fileDelete(file) {
      this.model.files = this.model.files.filter(item => {
        return item.fileOriginalPath !== file.fileOriginalPath
      })
    },
    // 20200404 캘린더 리팩토링 필요
    initSelectedDate(timestamp) {
      this.selectedDate =
        timestamp !== undefined
          ? this.$moment(timestamp).format('YYYYMMDD')
          : this.$moment().format('YYYYMMDD')
    },
    setSelectedDate(dateJson) {
      if (dateJson)
        this.selectedDate = `${dateJson.year}/${dateJson.month + 1}/${
          dateJson.date
        }`
      this.closeCalendar()
    },
    openCalendar() {
      if (this.checkbox.timestampEnd) this.option.isOpenCalendar = true
    },
    closeCalendar() {
      this.option.isOpenCalendar = false
    },
    backupResource(key, resource) {
      this.oldResource[key] = Object.assign({}, resource)
    },
    restoreResource(...keys) {
      keys.forEach(key => {
        for (const [k, v] of Object.entries(this.oldResource[key])) {
          this[key][k] = v
        }
      })
    },
    emitHandlePostEdit(flag) {
      // TODO: 2022-09-15 상위 컴포넌트에 불필요한 전달
      this.$emit('handle-post-edit', flag)
      this.initCurPostEdit()
    },
    // TODO: 2022-09-15 수정한 직후 목록의 데이터가 바뀌지 않음 (V1, V2 동일)
    replaceRenewItem(renewItem) {
      const postId = this.post.postId
      const payload = {
        posted: renewItem.posted,
        postStatus: renewItem.postStatus,
        postTitle: renewItem.postTitle,
        postContent: renewItem.postContent,
        files: renewItem.files,
      }
      this.setCurPostEditPostItemAttr(payload)
      this.$nextTick(() => {
        eventBus.$emit(`refresh-post-edit-post-item-attr|${postId}`)
      })
    },

    initModalPosition() {
      let modal = this.$refs.modal
      let getModalSize = this.$comn.getModalPosition(modal)
      let integerX = -1
      let integerY = -1

      if (this.isOpenedDetailPopup === true) {
        integerX = -0.27
        integerY = -0.65
        this.dimInDim = true
      } else if (
        this.$route.path.includes('/clazzes') ||
        this.$route.path.includes('/mypage/scrap')
      ) {
        integerX = 1
        integerY = 1
      } else {
        integerX = -0.4
        integerY = -0.7
        this.dimInDim = true
      }
      this.modalPosition = {
        'margin-top': -getModalSize.m_height * integerX + 'px',
        'margin-left': -getModalSize.m_width * integerY + 'px'
      }
    },

    initCloneLocal() {
      this.$store.commit(
        'setCloneLocalData',
        JSON.parse(
          JSON.stringify(
            this.post.postTitle + this.post.postContent
          )
        )
      )
      this.$store.commit(
        'setCloneLocalFiles',
        this.model.files.map(d => d.fileOriginalPath)
      )
    },

  },
}
</script>

<style lang="scss" scoped>
.input-sel-date{
  float: left;
  > span{
    float: left;
    line-height: 41px;
    margin: 0 12px 0 0;
    transform: skew(0.2deg);
  }
  .txt-date-fin{
    display: inline-block;
    padding: 10px 0 0 0;
    transform: skew(0.2deg);
    color: #888;
  }
}
.input-box-date{
  .btn-wrap{
    float:left;
    button {
      width: 116px;
      height: 36px;
      margin: 0 0 0 8px;
      border-radius: 18px;
      display: inline-block;
    }
  }
}
</style>
