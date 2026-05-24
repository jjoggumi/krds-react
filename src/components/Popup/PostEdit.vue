<!--
@File(Method): PostEdit.vue
@Description: 게시글 쓰기 (게시글 에디터)
@Modified: 2025-06-16 - #74648 URL 인식 정책 변경 및 실시간 TLD 목록 적용
-->
<template>
  <div
    v-if="isShowTemplate"
    class="modal-board-editor"
  >
    <div class="modal__header">
      <div class="modal__inner">
        <h2 class="heading">
          <HiIcon name="ico-group-fill" color="gray" size="24" class="board-type-group" v-if="isSecretBoard" />
          {{ boardName }}
        </h2>
        <!-- 
        <h2 class="heading" :class="{'secret': isSecretBoard}">{{ boardName }}</h2>
        -->
        <button
          class="btn-close"
          @click="cancel"
        ></button>
      </div>

    </div>

    <div class="modal__content">
      <div class="column-left">
        <div class="modal-cont-inner">

          <div class="middle-checkbox-wrap">
            <hi-select-box
              v-if="boardDetail.isUsedFolder && boardFolderListItems.length > 0"
              :value.sync="model.categoryId"
              :default-value="null"
              :empty-title="'폴더를 선택해주세요.'"
              :items="boardFolderListItems"
              :disabled="false"
            >
              <template #selected="selectedProps">
                <span
                  class="icon-color"
                  :style="`background-color: ${
                    getFolderItemColorByCategoryId(boardFolderListItems, selectedProps.value)
                  }`"
                ></span>
              </template>
              <template #list="listProps">
                <span
                  class="icon-color"
                  :style="`background-color: ${getFolderItemColor(listProps.item)}`"
                ></span>
              </template>
            </hi-select-box>

            <div
              v-if="option.isManager"
              class="checkbox-wrap"
            >
              <input
                type="checkbox"
                id="necessary-read-check"
                v-model="model.postMustRead"
              >
              <label for="necessary-read-check">
                <span>필독</span>
              </label>

              <input
                type="checkbox"
                id="post-pin"
                v-model="model.postPin"
              >
              <label for="post-pin">
                <span>상단공지</span>
              </label>
            </div>

          </div>

          <div class="contents-wrap">
            <div
              class="input-box-wrap input-title"
              :class="{ focus: option.focus.postTitle }"
            >
              <textarea
                ref="postTitle"
                class="input-textarea"
                placeholder="제목을 입력하세요."
                v-model="model.postTitle"
                @focus="option.focus.postTitle = true"
                @blur="option.focus.postTitle = false"
              ></textarea>

              <div class="info-video-message" v-if="isLoginTeacher">동영상 1개씩 삽입(최대 10개)</div>
            </div>

            <div
              class="input-box-wrap input-cont"
              :class="{ focus: option.focus.postContent }"
            >
              <hc-editor
                v-if="option.isShowEdit"
                :key="`post-edit-${editorComponentKey}`"
                :model="model"
                :addedFiles="addedFiles"
                :tlds="tlds"
              />

              <clazzes-images-upload
                :files.sync="model.files"
                :isUploading.sync="option.loading.imagePacks"
                :addedFiles="addedFiles"
                :parentComponent="'postEdit'"
              />

              <clazzes-doc-upload
                :files.sync="model.files"
                :isUploading.sync="option.loading.docs"
                :addedFiles="addedFiles"
              />

            </div>

          </div>

          <div class="info-safe-wrap" v-if="isPostTypeNote === true && isLoginTeacher">
            <div>
              <span class="title">오늘의 안전수칙</span>
              <div class="hi-switch">
                <input type="checkbox" id="safe-use-on" v-model="safeUseOn">
                <label for="safe-use-on">
                    <span class="track"></span>
                </label>
              </div>
            </div>
            <div class="message-wrap">
              <span class="message">안전 수칙 문구가 자동으로 랜덤하게 표기됩니다. 문구는 추가하거나 수정 하실 수 있습니다.</span>
            </div>
            <div class="input-wrap" v-if="safeUseOn === true">
              <div class="input">
                <textarea v-model="safeMessage" maxlength="500" placeholder="등록된 문구가 없습니다."></textarea>
              </div>
              <div class="select">
                <div class="hi-selectbox"
                  :class="{
                    ' is-opened' : openSelectSafeCategory
                  }"
                  v-click-outside="closeSelectBox"
                >
                  <button class="selected" @click="[openSelectSafeCategory = !openSelectSafeCategory]">{{ safeCategorySelect.categoryName }}</button>
                  <div class="option__layer">
                    <button class="option"
                      v-for="(safeCategory, idx) in safeCategoryList" :key="`safeCategory-${idx}`"
                      @click="selectSafeCategory(safeCategory)"
                    >
                      {{ safeCategory.categoryName }}
                    </button>
                  </div>
                </div>
                <button class="refresh-btn" @click="getSafeRandom">
                  다른문구
                  <i class="refresh"></i>
                </button>
              </div>
            </div>
            <div class="words-setting" @click="openSafe">
              <i class="setting-blue"></i>
              문구관리
            </div>
            <div class="words-info-show" v-if="isWordsInfoShow === true">
              <div class="message-box">
                <span class="message">
                "오늘의 안전 수칙" 기능이 추가되었어요.<br/>
                버튼을 누르면 안전 수칙 문구가 랜덤으로 자동 표기 됩니다.
                </span>
                <i class="close" @click="wordsInfoShow"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column-right">
        <div class="option__list">

          <!-- 수신대상 (클래스 관리자 only) -->
          <template v-if="option.isManager">
            <div class="option__item">
              <div class="option__heading j-between">
                <strong class="heading">수신대상</strong>
                <HiButton v-if="isSecretBoard" :color="isRecMember?'primary':'default'" size="sm" outline @click="toggleRecMember">
                  <HiIcon name="ico-user" size="18" />{{ selectedBoardUsers.length }}
                </HiButton>
                <div v-if="isRecMember" class="profile-list">
                  <profile-item
                    v-for="boardUser in selectedBoardUsers"
                    :showImage="false"
                    :key="boardUser.userId"
                    :user="boardUser"></profile-item>
                </div>
              </div>
              <div class="option">
                <template v-for="userType of filteredCodeUserTypes">
                  <input
                    :key="`input-${userType.code}`"
                    type="checkbox"
                    :id="`target-${userType.code.toLowerCase()}-check`"
                    :class="{ dis: option.disable.pushTarget[userType.code] }"
                    :disabled="option.disable.pushTarget[userType.code]"
                    v-model="option.checkbox.pushTarget[userType.code]"
                  >
                  <label
                    :key="`label-${userType.code}`"
                    :for="`target-${userType.code.toLowerCase()}-check`"
                  >
                    <span>{{ userType.name }}</span>
                  </label>
                </template>
              </div>
            </div>
          </template>
          <!-- // 수신대상 (클래스 관리자 only) -->

          <!-- 마감일시 (클래스 관리자 only) -->
          <template v-if="option.isManager">
            <div
              v-if="isPostTypeHomework && !isExportedPostByTkBell"
              class="option__item"
            >
              <div class="option__heading">
                <strong class="heading">마감일시</strong>
                <hi-switch
                  :model.sync="option.checkbox.timestampEnd"
                  :disabled="false"
                />
              </div>

              <div
                v-if="option.checkbox.timestampEnd"
                class="option"
              >
                <div class="set-date-wrap">
                  <div class="date-cont-wrap">
                    <button
                      class="calendar-icon-btn"
                      @click="openCalendarTimestampEnd"
                    />
                    <div class="date-wrap">
                      <div
                        class="date"
                        :class="{ 'hide-calendar': isPostStatusComplete }"
                        @click="openCalendarTimestampEnd"
                      >
                        {{ timestampEndToStr }}
                      </div>
                    </div>
                  </div>

                  <!-- 클래스 timestampEnd 달력 -->
                  <note-board-calendar
                    v-if="option.calendar.timestampEnd.isOpen"
                    :key="calendarComponentKey"
                    :toDay="model.timestampEnd"
                    :is-timestamp-end="true"
                    @setModel="setModel"
                    @openCalendarComponent="openCalendarTimestampEnd"
                    @closeCalendarComponent="closeCalendarTimestampEnd"
                    @openCalendarByReserveMode="openCalendarTimestampEnd"
                  />

                </div>
              </div>

              <div
                v-if="option.checkbox.timestampEnd"
                class="option"
              >
                <p class="txt-date-fin">
                  * 마감일 이후에도 제출할 수 있습니다.
                </p>
              </div>
            </div>
          </template>
          <!-- // 마감일시 (클래스 관리자 only) -->

          <template v-if="isPostStatusComplete">
            <!-- 발송시간 -->
            <div class="option__item">
              <div class="option__heading">
                <strong class="heading">발송시간</strong>
              </div>
              <div class="option">
                <div class="set-date-wrap">
                  <div class="date-cont-wrap">
                    <!-- 아이콘이 없으면 높이가 낮아짐 -->
                    <button class="calendar-icon-btn"/>
                    <div class="date-wrap">
                      <div class="date">{{ postedStr }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- // 발송시간 -->
          </template>

          <template v-else>

            <!-- 예약 -->
            <div class="option__item">
              <div class="option__heading">
                <strong class="heading">예약</strong>
                <hi-switch
                  :model.sync="model.disclosureType"
                  :invert="true"
                  :disabled="false"
                />
              </div>

              <div
                v-if="!model.disclosureType || model.postStatus === 'RESERVE'"
                class="option"
              >
                <div class="set-date-wrap">
                  <div class="date-cont-wrap">
                    <button
                      class="calendar-icon-btn"
                      @click="openCalendarByReserveMode"
                    />
                    <div class="date-wrap">
                      <div
                        class="date"
                        :class="{ 'hide-calendar': isPostStatusComplete }"
                        @click="openCalendarByReserveMode"
                      >
                        {{ postedStr }}
                      </div>
                    </div>
                  </div>

                  <!-- 클래스 posted 달력 -->
                  <note-board-calendar
                    v-if="option.calendar.posted.isOpen"
                    :key="calendarComponentKey"
                    :classId="parentId"
                    :toDay="model.posted"
                    :mode.sync="option.mode"
                    :isSendComplete="true"
                    :isReserve="isReserve"
                    @setModel="setModel"
                    @openCalendarComponent="openCalendarComponent"
                    @closeCalendarComponent="closeCalendarComponent"
                    @openCalendarByReserveMode="openCalendarByReserveMode"
                  />
                  <!-- // 클래스 posted 달력 -->

                </div>

              </div>

            </div>
            <!-- // 예약 -->
          </template>
        </div>


        <div class="group-btn">
          <button
            class="hi-btn btn-lg btn-line"
            @click="cancel"
          >
            취소
          </button>
          <button
            class="hi-btn btn-lg btn-line"
            :disabled="isDisabledTemporaryButton"
            @click="write('TEMPORARY')"
          >
            임시저장
          </button>
          <button
            class="hi-btn btn-lg"
            :disabled="isDisabledWriteButton"
            @click="write"
          >
            {{ writeBtnStr }}
          </button>

          <!-- 개인정보 보호 안내 -->
          <div class="info-box-privacy">
            <p class="title">
              🔐 잠깐! 개인정보 보호 안내
            </p>
            <p class="message">
              개인정보 보호를 위해 게시글 작성 시 개인정보가<br /> 포함된 내용이나 파일이 첨부되지 않도록 주의해 주세요.
            </p>
          </div>

        </div>
      </div>
    </div>
    <confirm-dialog
      v-if="isLogout"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      :isOtherUse="true"
      :isAlert="true"
      @closeConfirmDialog="allLogout"
    />

    <safe 
      v-if="isSafeOpen"
      @refreshCategory="refreshCategory"
      @close="openSafe"
    />
  </div>

</template>

<script>
import HcEditor from '@/components/Editor/HcEditor'
import {mapActions, mapGetters, mapMutations, mapState} from "vuex";
import NoteBoardCalendar from "@/apps/main/clazzes/note/newboard/subcomponents/NoteBoardCalendar";
import ClazzesDocUpload from "@/components/Upload/Clazzes/ClazzesDocUpload";
import ClazzesImagesUpload from "@/components/Upload/Clazzes/ClazzesImagesUpload";
import {eventBus} from "@/main";
import {mapFields} from "vuex-map-fields";
import HiSelectBox from "@/components/Form/HiSelectBox.vue";
import HiSwitch from "@/components/Form/HiSwitch.vue";
import axios from "@/plugins/axios";
import axiosModules from "axios";
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog'
import Safe from "@/components/Safe/Safe"
import ProfileItem from "@/components/Profile/List/Item";

export default {
  name: "post-edit",
  components: {
    HiSwitch,
    HiSelectBox,
    ClazzesImagesUpload,
    ClazzesDocUpload,
    NoteBoardCalendar,
    HcEditor,
    ConfirmDialog,
    Safe,
    ProfileItem
  },
  props: {
    mode: {
      type: String,
      default() {
        return null
      }
    },
    post: {
      type: Object,
      default() {
        return {}
      }
    },
    posts: {
      type: Array,
      default() {
        return []
      }
    },
    paramOption: {
      type: Object
    },
    paramModel: {
      type: Object
    },
    parentId: {
      type: String,
      required: true
    },
    postType: {
      type: String,
    },
    schoolType: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      confirmDialog : {
        title: '로그아웃 안내',
        description: '비밀번호 변경 또는 로그인 만료 등으로 인해\n로그아웃되었습니다.\n보안을 위해 <span style="color: #4778DE;">다시 로그인 해주세요.</span>'
      },

      option: Object.assign({
        loading: {
          contents: false,
          imagePacks: false,
          docs: false,
        },
        uploadLoading: false,
        isManager: false,
        isOpenedDetailPopup: false,
        isChangedPosted: false,
        isShowEdit: false,

        editMode: null,
        clazz: null,

        calendar: {
          // 게시일 캘린더
          posted: {isOpen: false},
          // 마감일 캘린더
          timestampEnd: {isOpen: false},
        },
        select: {
          timestampEnd: null
        },
        checkbox: {
          timestampEnd: false,
          pushTarget: {
            TEACHER: true,
            PARENTS: true,
            STUDENT: true,
          },
        },
        disable: {
          pushTarget: {
            TEACHER: false,
            PARENTS: false,
            STUDENT: false,
          }
        },
        mode: 'RESERVE',
        focus: {
          postTitle: false,
          postContent: false,
        }
      }, this.paramOption),
      code: {
        userTypes: [
          {
            code: 'TEACHER',
            name: '선생님'
          },
          {
            code: 'PARENTS',
            name: '학부모'
          },
          {
            code: 'STUDENT',
            name: '학생'
          }
        ],
      },
      model: Object.assign(
        {
          files: [],
          filesRemoveQueue: [],
          parentUri: null,
          postTitle: null,
          postContent: '',
          pushUsed: false,  // 알림장 수정 후 알림전송 여부
          posted: null,
          postType: '',
          postStatus: '',
          postMustRead: false,
          postPin: false,
          timestampStart: null,
          timestampEnd: null,
          pushTarget: null,
          userType: [],
          postOptions: [],
          editorContent: null,
          version: this.$store.state.postVersionDefault,

          // 즉시 발송 여부 (true: 즉시, false: 예약)
          disclosureType: true,

          // 폴더 선택 셀렉트 박스
          categoryId: null, // 폴더(카테고리) ID
          boardId: null,  // 게시판 ID

        }, this.paramModel
      ),
      tempPost: {},
      writeMsg: {
        TEMPORARY: '임시 저장한 게시물은 클래스 구성원에게 공개되지 않습니다.<br>임시 저장하시겠습니까?',
        RESERVE: '작성한 내용을 예약 하시겠습니까?',
        COMPLETE: '작성한 내용을 지금 클래스 구성원들에게 보내시겠습니까?',
        FOLDEROFF: '폴더 사용이 OFF 되어 게시글 등록 시<br>기본 폴더에 저장됩니다.'
      },

      // 금칙어가 포함되었을 경우 이전 상태로 되돌림
      oldResource: {},

      // 예약 후 예약버튼 상태 유지하기 위한 데이터
      isSelectedReserve: false,

      calendarComponentKey: 0,

      // 등록/수정 중인 게시글의 게시판 상세 정보
      boardDetail: {},
      routeBoardId: null,
      routeFolderId: null,
      writeFolderOff: false,
      changeFolderOff: false,
      currentPushTarget: null,
      originPushTarget: {
        checkbox: {
          TEACHER: true,
          PARENTS: true,
          STUDENT: true,
        },
        target: "TEACHER"
      },
      // 신규로 추가된 파일. 저장안하고 창닫았을때 업로드된 파일 cdn에서 삭제하기 위함.
      addedFiles: [],
      // 게시글 수정시 이미 게시글내에 저장된 파일중 게시글내에서 삭제한 파일도 cdn에서 삭제하기 위함.
      savedFiles: [],
      safeUseOn: false,
      safeUpdateLoading: false,
      openSelectSafeCategory: false,
      safeCategorySelect: {
        categoryId: "",
        categoryType: "default",
        categoryName: "전체 카테고리"
      },
      safeCategoryList: [],
      safeMessage: "",
      isWordsInfoShow: true,
      isSafeOpen: false,
      isRecMember: false,
      boardUsers: [],
      tlds: []
    }
  },
  computed: {
    ...mapFields(['isDimLoading', 'currentTimestamp', 'curPostEdit']),
    ...mapFields('storeEditor', ['editorComponentKey']),
    ...mapState(['isLogout', 'imagePackResize', 'user']),
    ...mapState('storeBoard', ['curBoardList']),
    ...mapGetters(['getPostTypeNameByCode']),
    ...mapState('storeBoard', ['curBoardList']),
    isCreate() {
      return !this.option.editMode || this.option.editMode === 'create'
    },
    isUpdate() {
      return this.option.editMode === 'update'
    },
    isCopy() {
      return this.option.editMode === 'copy'
    },
    isReserve() {
      const TEN_SECONDS = 10 * 1000  // this.currentTimestamp 10초 단위 갱신이므로
      return this.isSelectedReserve || !this.isPostStatusComplete && (this.currentTimestamp + TEN_SECONDS < this.model.posted)
    },
    isPostStatusComplete() {
      return this.model && this.model.postStatus === 'COMPLETE'
    },
    isPostTypeNote() {
      return this.model.postType === 'NOTE'
    },
    isPostTypeAlbum() {
      return this.model.postType === 'ALBUM'
    },
    isPostTypeHomework() {
      return this.model.postType === 'HOMEWORK'
    },
    isShowTemplate() {
      return this.isCreate
        || (this.isUpdate && this.option.isShowEdit)
        || this.isCopy
    },
    /**
     * 올리기 버튼 비활성화
     */
    isDisabledWriteButton() {
      return Object.values(this.option.loading).includes(true)
    },
    /**
     * 임시저장 버튼 비활성화
     */
    isDisabledTemporaryButton() {
      return this.isPostStatusComplete || this.isDisabledWriteButton
    },
    isExportedPostByTkBell() {
      return this.model.letterType === 'TKBELL'
    },
    postTypeName() {
      const params = this.model.postType === 'NOTE'
        ? {code: this.model.postType, type: this.schoolType}
        : {code: this.model.postType}

      if(this.boardDetail.boardName !== this.getPostTypeNameByCode(params) && this.model.postType === 'BOARD') {
        return "게시판"
      } else {
        return this.getPostTypeNameByCode(params)
      }
    },
    postedStr() {
      return this.model.posted
        ? this.$moment(this.model.posted).format('M월 D일 (ddd) H시 m분')
        : ''
    },
    timestampEndToStr() {
      return this.model.timestampEnd
        ? this.$moment(this.model.timestampEnd).format('M월 D일 (ddd) H시 m분') + ' 까지'
        : ''
    },
    writeBtnStr() {
      return '등록'
    },
    imageFiles() {
      return this.model.files.filter(f => f.fileContentType.startsWith('image')) || []
    },
    videoFiles() {
      return this.model.files.filter(f => f.fileContentType.startsWith('video')) || []
    },
    docFiles() {
      return this.model.files.filter(f => 
        f.fileContentType && 
        (!f.fileContentType.startsWith('image') && !f.fileContentType.startsWith('video')) && 
        !f.fileOriginalPath === false  
      )
    },
    imagePackFiles() {
      return this.model.files.filter(f => 
        f.fileContentType.startsWith('image') && 
        f.fileFlag === 'IMAGE_PACK' && 
        !f.fileOriginalPath === false  
      )
    },
    filteredCodeUserTypes() {
      return this.code.userTypes.filter(d => d.code !== 'TEACHER')
    },
    boardName() {
      // 신규 게시글 작성인 경우의 게시판명
      if (this.isCreate) {
        return this.boardDetail && this.boardDetail.boardName
          ? this.boardDetail.boardName
          : ''
      } else {
        return this.post.board && this.post.board.boardName
          ? this.post.board.boardName
          : this.postTypeName
      }
    },
    boardFolderListItems() {
      if (this.boardDetail.folders && this.boardDetail.folders.length > 0) {
        return this.boardDetail.folders.map(folder => {
          folder.title = folder.folderName
          folder.value = folder.folderId
          return folder
        })
      } else {
        return []
      }
    },
    titleData(){
      return this.model.postTitle
    },
    showEdit(){
      return this.option.isShowEdit
    },
    isLoginTeacher() {
      return this.$store.state.user.userType === 'TEACHER'
    },
    isCopyMode() {
      return (this.paramOption || {}).editMode === 'copy'
    },
    isSecretBoard() {
      return (this.post.board || this.boardDetail || {}).boardType === 'SECRET'
    },
    selectedBoardUsers() {
      return this.boardUsers.filter(u => this.option.checkbox.pushTarget[u.userType])
    },
  },
  watch: {
    $route() {
      this.closeCurPostEdit()
    },
    'option.checkbox.timestampEnd'(val) {
      if (this.isShowTemplate && val === true) {
        this.setTimestampEndDefaultTime()
        this.openCalendarTimestampEnd()
      } else {
        this.option.select.timestampEnd = null
      }
      this.calendarComponentKey++
    },
    'option.select.timestampEnd'(val) {
      if (val) {
        this.model.timestampEnd = val
      }
    },
    'model.posted'(val, oldVal) {
      if (oldVal !== null) {
        this.option.isChangedPosted = true
      }
    },
    isDimLoading(val) {
      this.option.loading.contents = val
    },
    'option.uploadLoading'(val) {
      this.$log.debug(`option.uploadLoading => `, val)
      this.isDimLoading = val
    },
    isReserve(val) {
      if (val === true)
        this.isSelectedReserve = true
    },
    // 즉시 발송 여부 (true: 즉시, false: 예약)
    'model.disclosureType'(val) {
      if (this.isShowTemplate && val === false) {
        this.setReserveDefaultTime()
        this.openCalendarByReserveMode()
      }
      if (this.isShowTemplate && this.isReserve && val === true) {
        this.cancelReserve()
      }
      this.calendarComponentKey++
    },
    titleData(v, n){
      if([...v].length > 255){
        this.model.postTitle = n
        this.$hiClass.alert('제목은 255자를 넘을 수 없습니다.', 'warning')
        this.$refs.postTitle.blur()
      }
      this.initStyleTextarea()
    },
    safeUseOn(v) {
      if(this.safeUpdateLoading === false) {
        localStorage.setItem("safeUseOn", JSON.stringify(v))
      }

      if(v === true && this.safeUpdateLoading === false) {
        this.getSafeRandom()
      }

      if(this.isUpdate && this.safeUpdateLoading === true) {
        this.safeUpdateLoading = false
      }

      if(v === true) {
        this.isWordsInfoShow = false
      }
    }
  },
  created() {
    this.getTLDs()

    this.currentTimestamp = this.$moment().valueOf()

    eventBus.$on('froala-editor-init-complete', () => {
      this.$log.debug(`froala-editor-init-complete !!`)
    })

    if (this.isCreate || this.isCopy) {
      // 게시일 초기값 설정
      this.model.posted = this.$moment().valueOf()
    }
  },
  async mounted() {
    this.routeBoardId = this.$route.params.boardId || null
    this.routeFolderId = this.$route.params.folderId || null

    const HIDDEN_DELAY = this.isUpdate || this.isCopy ? 50 : 0
    setTimeout(() => {
      this.$hiClass.toggleBodyClass('add', 'hidden')
    }, HIDDEN_DELAY)

    if (this.isUpdate) {
      const isOutOfDated = await this.isOutOfDatePost()

      if (!this.tempPost.currentId) {
        this.$hiClass.alert('게시글을 가져오지 못했습니다.')
          .then(this.cancel)
        return false
      }

      if (isOutOfDated)
        this.replaceTempPostToPost()

      const modelKeys = Object.keys(this.post)

      for (const key of modelKeys) {
        if (key === 'files') {
          Object.assign(this.model[key], this.post[key])
          Object.assign(this.savedFiles, this.post[key])
        } else if (key === 'postContent') {
          // 수정 시 postContent 에디터 영역만 추려내어 대입
          if (this.post[key] !== undefined && this.post[key] !== null && this.post[key] !== '') {
            this.model[key] = this.getPostContentEditor(this.post[key])
          } else {
            this.model[key] = this.post[key]
          }
        } else if (key === 'postTitle') {
          if (this.post[key] !== undefined && this.post[key] !== null && this.post[key] !== '') {
            this.post[key] = this.post[key].replaceAll('>', '&gt;').replaceAll('<', '&lt;')
            this.model[key] = this.$hiClass.getHtmlParsedContent(this.post[key])
          } else {
            this.model[key] = this.post[key]
          }
        } else this.model[key] = this.post[key]
      }

      // init timestampEnd checkbox
      this.option.checkbox.timestampEnd = !!this.model.timestampEnd

      if (this.model.postStatus === 'COMPLETE') {
        this.getPushTarget()
      } else {
        // 게시글의 수신대상 세팅
        if (this.model.pushTarget !== null) {
          this.getPushTarget()

          const changedPushTargets = await this.checkPushTarget()
          if (changedPushTargets.length > 0) {
            this.$hiClass.alert('기존에 설정하신 수신대상이 변경되었습니다')
              .then(() => {
                changedPushTargets.forEach(item => {
                  this.option.checkbox.pushTarget[item] = false
                })
              })
          } // end if
        }

      }
    }

    if (this.isCopy) {
      const modelKeys = Object.keys(this.post)

      for (const key of modelKeys) {
        if (key === 'postContent') {
          if (this.post[key] !== undefined && this.post[key] !== null && this.post[key] !== '') {
            this.model[key] = this.getCopyPostContentEditor(this.post[key])
          } else {
            this.model[key] = this.post[key]
          }
        } else if (key === 'postTitle') {
          if (this.post[key] !== undefined && this.post[key] !== null && this.post[key] !== '') {
            this.post[key] = this.post[key].replaceAll('>', '&gt;').replaceAll('<', '&lt;')
            this.model[key] = this.$hiClass.getHtmlParsedContent(this.post[key])
          } else {
            this.model[key] = this.post[key]
          }
        } else this.model[key] = this.post[key]
      }

      this.post.files = this.post.files.map(file => {
        if (file.originalFile) {
          delete file.originalFile
        }
        if (file.fileOriginalPath) {
          return file
        }
      })

      this.model.files = [...this.post.files]
      this.addedFiles = [...this.post.files]
    }

    /**
     * 현재 게시판 / 폴더 정보 조회
     */
    // 수정 모드
    if (this.isUpdate || this.isCopy) {
      this.model.boardId = this.post.boardId
      this.model.categoryId = this.post.categoryId

      // this.model.disclosureType = false

      if(this.model.postStatus === 'TEMPORARY') {
        if(this.model.posted > new Date().getTime()) {
          this.model.disclosureType = false
        }
      }
      
      if(this.isPostTypeNote === true && !this.model.postTitle === true) {
        let title = ''
        if (this.$moment(this.model.posted).isValid())
          title = this.$moment(this.model.posted).format(`M월 D일 (ddd) ${this.model.board.boardName}`)

        this.model.postTitle = title
      }

    // 등록 모드
    } else {
      this.model.boardId = this.routeBoardId
      this.model.categoryId = this.routeFolderId
    }
    await this.setBoardDetail()

    /**
     * 폴더 미사용 게시판 폴더 정보 세팅
     */
    if (this.isCreate && !this.boardDetail.isUsedFolder) {
      await this.setDefaultCategoryId()
    }

    // 게시글이 발송되지 않은 경우 수신대상을 게시판 설정과 동기화
    if (this.isCreate || this.isCopy || this.isUpdate && this.model.postStatus !== 'COMPLETE') {
      this.initDefaultPushTarget()
    }
    // 선택할 수 없는 수신대상 disabled 처리
    this.initDisabledPushTarget()

    // 안전수칙 
    if(this.isPostTypeNote === true && this.isLoginTeacher === true) this.initSafe()

    this.$nextTick(async () => {
      // 에디터 초기화 준비가 완료됨
      this.option.isShowEdit = true
    })
  },
  updated() {
    this.initStyleTextarea()
  },
  beforeDestroy() {
    eventBus.$off('froala-editor-init-complete')
    this.$emit('close-post-edit', {
      post: this.model,
      isClassOwnerOrManager: this.option.isManager
    })
  },
  destroyed() {
    setTimeout(() => {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
    }, 50)
  },
  methods: {
    ...mapMutations(['updateItemDetailObj']),
    ...mapActions([
      'triggerAnalyticsLogEvent',
      'closeCurPostEdit',
      'isAllDeviceLogout'
    ]),
    ...mapActions('storeBoard', [
      'readBoard',
      'initCurBoardList',
      'getSecretBoardUsers'
    ]),

    // 에디터 제어 ==========================================================================
    closePopup() {
      this.closeCurPostEdit()
      this.closeGoPage()
    },

    cancel() {
      if (this.model.files.length > 0 || this.model.postContent) {
        this.$hiClass.confirm('작성 중인 내용이 있습니다.<br>작성을 중단하시겠습니까?')
          .then(() => {
            let deleteApi = []
            this.addedFiles.forEach(file => {
              deleteApi.push(this.$hiClass.multipart.delete(file))
            })
            Promise.allSettled(deleteApi)

            this.closePopup()
          })

      } else {
        this.closePopup()
      }
    },


    // 게시글 저장 프로세스 ==========================================================================
    writeBeforeCheck() {
      let postTitleExists = false
      let postContentExists = false

      // 알림장일 경우 postTitle을 체크하지 않음
      if (this.isPostTypeNote || this.model.postTitle && this.model.postTitle.trim().length > 0)
        postTitleExists = true

      // 본문 대신에 묶음 사진이나 문서 파일만으로 업로드 가능
      if (this.model.postContent || this.model.files.length > 0)
        postContentExists = true

      if (!postTitleExists && !postContentExists)
        this.$hiClass.alert('제목과 본문 내용을 입력해주세요.')
      else if (!postContentExists)
        this.$hiClass.alert('본문 내용을 입력해주세요.')
      else if (!postTitleExists)
        this.$hiClass.alert('제목을 입력해주세요.')

      return postTitleExists && postContentExists
    },

    async writeBeforeReserveCheck() {
      const returnObj = {
        isPassed: true
      }
      const NINE_MINUTES = 60 * 1000 * 9
      const TEN_SECONDS = 10 * 1000  // this.currentTimestamp 10초 단위 갱신이므로
      const messageObj = {
        isExpireSoonReserve: '<span class="bolder-text">예약 시간이 10분 미만으로 발송할 수 없습니다.</span><br>예약 시간을 다시 설정 하시겠습니까?',
        isExpiredReserve: '<span class="bolder-text">예약 시간이 지났으므로 발송할 수 없습니다.</span><br>예약 시간을 다시 설정 하시겠습니까?'
      }
      const confirmIcon = 'warning'
      const confirmOptions = {
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: '다시 설정',
        denyButtonText: '즉시 발송',
        reverseButtons: true
      }
      const isExpireSoonReserve = !this.isPostStatusComplete
        && (this.currentTimestamp + TEN_SECONDS < this.model.posted)
        && (this.currentTimestamp + NINE_MINUTES >= this.model.posted)
      const isExpiredReserve = !this.isPostStatusComplete
        && (this.currentTimestamp + TEN_SECONDS > this.model.posted)

      if (this.isReserve && isExpireSoonReserve) {
        try {
          const result = await this.$hiClass.confirm(messageObj.isExpireSoonReserve, confirmIcon, confirmOptions)
          if (result.isConfirmed) {
            returnObj.isPassed = false
            setTimeout(() => this.openCalendarByReserveMode(), 200)
          } else if (result.isDenied) {
            this.cancelReserve()
          }
        } catch (e) {
          this.$log.error(e)
          returnObj.isPassed = false
        }

      } else if (this.isSelectedReserve && isExpiredReserve) {
        try {
          const result = await this.$hiClass.confirm(messageObj.isExpiredReserve, confirmIcon, confirmOptions)
          if (result.isConfirmed) {
            returnObj.isPassed = false
            setTimeout(() => this.openCalendarByReserveMode(), 200)
          } else if (result.isDenied) {
            this.cancelReserve()
          }
        } catch (e) {
          this.$log.error(e)
          returnObj.isPassed = false
        }
      }

      return returnObj
    },

    async write(postStatus) {
      const res = await this.isAllDeviceLogout(true)

      if(res) return false;

      if(this.safeUseOn === true && this.isPostTypeNote === true) {
        if(this.safeMessage.trim() === "") {
          this.$hiClass.alert("안전 수칙 문구를 입력해주세요.", 'error')
          return;
        }

        const arr = [{
          name : "safetyRoles",
          value : this.safeMessage
        },{
          name : "categoryId",
          value : this.safeCategorySelect.categoryId
        }]

        this.model.postOptions = [...this.model.postOptions.filter(v => v.name !== "safetyRoles" && v.name !== "categoryId"), ...arr]
      } else if (this.safeUseOn === false && this.isPostTypeNote === true) {
        const index = this.model.postOptions.findIndex(v => v.name === "safetyRoles")
        if(index > -1) {
          this.model.postOptions = this.model.postOptions.map(item => {
            if(item.name === "categoryId" || item.name === "safetyRoles") {
              return {
                ...item,
                value: ""
              }
            } else {
              return item
            }
          })
        }
      }

      this.$log.debug("write", this.model)
      const checkRes = await this.getBoardDetail()

      // 게시판 미사용 
      if(checkRes.boardStatus === "DEACTIVATE"){
        this.$hiClass.alert("게시판 사용이 OFF 되었습니다.<br>다른 게시판으로 이동 후 작성해주세요.", 'error')
        return;
      }
      
      if(checkRes.isUsedFolder === false && this.boardDetail.isUsedFolder === true){
        this.writeFolderOff = true
      }

      if (!this.writeBeforeCheck())
        return false

      if (this.isUpdate) {

        const isOutOfDated = await this.isOutOfDatePost()
        const isSendComplete = this.tempPost.postStatus === 'COMPLETE' && this.tempPost.postStatus !== this.post.postStatus
        if (isOutOfDated && isSendComplete) {

          // 발송완료 된 게시글 수정 시 푸시 여부 선택
          const message = this.getOutOfDatePostConfirmMessage()

          await this.$hiClass.confirm(message)
            .then(() => {
              postStatus = this.tempPost.postStatus

              // 편집 중인 주요 local 데이터
              const modifiedModel = Object.assign({
                postTitle: this.model.postTitle,
                postContent: this.model.postContent,
                postMustRead: this.model.postMustRead,
                postPin: this.model.postPin,
                pushUsed: this.model.pushUsed,
                files: this.model.files,
                timestampEnd: this.model.timestampEnd,
              }, {})

              // 서버 데이터 -> model 에 복사
              for (const [key, value] of Object.entries(this.tempPost)) {
                this.model[key] = value
              }

              // 편집 중인 주요 local 데이터 -> model 에 복사
              for (const [key, value] of Object.entries(modifiedModel)) {
                this.model[key] = value
              }

              this.writeProc(postStatus, this.model.pushUsed)
            })
            .catch(() => {
              this.$emit('do-remount')
            })

          return false
        }
      }

      const reserveCheckObj = await this.writeBeforeReserveCheck()
      if (!reserveCheckObj.isPassed)
        return false

      if (postStatus !== 'TEMPORARY') {
        postStatus = this.isReserve ? 'RESERVE' : 'COMPLETE'
      }

      let message = this.writeMsg[postStatus]

      if (postStatus === 'COMPLETE' && !this.option.checkbox.pushTarget.PARENTS && !this.option.checkbox.pushTarget.STUDENT) {
        message = '수신대상이 없는 게시글은 <br>클래스 선생님만 확인이 가능합니다.<br>게시글을 등록하시겠습니까?'
      }

      if (this.option.isManager && this.isDisabledTemporaryButton) {
        const checkTarget = this.alertCheckPushTarget()

        // 변동사항없을경우 
        if(checkTarget === "TEACHER"){
          message = '수신대상이 없는 게시글은 <br>클래스 선생님만 확인이 가능합니다.<br>게시글을 등록하시겠습니까?'
          this.model.pushUsed = true
        } else if(this.originPushTarget.target === checkTarget || this.originPushTarget.target === "ALL") {
          message = this.replaceConfirmMessageNoAdd(this.writeFolderOff)
        } else {
          message = this.replaceConfirmMessage(message, this.writeFolderOff)
        }
      }

      if ((this.isCreate || this.isCopy) && this.writeFolderOff === true) {
        message = `${this.writeMsg.FOLDEROFF}<br><br>${message}`
      }
 
      this.$hiClass.confirm(message)
        .then(async() => {
          if(this.writeFolderOff === true){
            const bFolderobj = checkRes.folders.find(v => v.isDefault === true)
            this.model.categoryId = bFolderobj.folderId
            this.changeFolderOff = true
          }

          if(this.boardDetail.isUsedFolder === true){
            const checkReRes = await this.getBoardDetail()

            if(checkReRes.isUsedFolder === false){
              const bFolderobj = checkReRes.folders.find(v => v.isDefault === true)
              this.model.categoryId = bFolderobj.folderId
              this.changeFolderOff = true
            }
          }

          this.writeProc(postStatus)
        })
        .catch(() => {
          this.setLibList()
        })
    },

    async writeProc(postStatus, forcePushUsed) {
      // V2 analytics 추가
      const clickButton = postStatus === 'TEMPORARY' ? postStatus : 'COMPLETE'
      this.triggerAnalyticsLogEvent({code: `analytics.class.click.button.note.post.modalEditor.write.${clickButton.toLocaleLowerCase()}`})

      const changeBoardObj = this.getIsChangeBoard()

      this.backupResource('model', this.model)

      if (!this.option.checkbox.timestampEnd) this.model.timestampEnd = null

      // 발송 대상 지정
      this.setPushTarget()
      this.setUserType()

      // files 안에 있는 video 중 에디터 내에 없는 video 는 files 에서 삭제 처리
      if (this.videoFiles.length > 0) {
        await this.deleteUnUsedVideoFiles()
      }

      // 에디터내에서는 지워졌지만 파일서버에 업로드된 파일 삭제
      this.deleteUnusedFiles()

      try {
        await this.externalImageReplace()
      } catch (e) {
        this.option.uploadLoading = false
        return false
      }

      try {
        this.option.uploadLoading = true
        await this.encodingFiles()
      } catch (e) {
        this.$log.error(e)
      } finally {
        this.option.uploadLoading = false
        this.backupResource('model', this.model)
      }

      await this.orderFiles()

      /**
       * =============
       *  create step
       * =============
       */
      if (this.isCreate || this.isCopy) {
        await this.writeProcCreate(postStatus, changeBoardObj)

        /**
         * =============
         *  update step
         * =============
         */
      } else if (this.isUpdate) {
        this.backupResource('post', this.post)
        await this.writeProcUpdate(postStatus, forcePushUsed, changeBoardObj)

      } else {
        return false
      }
    },

    async writeProcCreate(postStatus, changeBoardObj) {
      this.model.postStatus = postStatus

      let params = {}

      params.posted = this.model.posted

      let createModelKeys = [
        'parentUri', 'postType', 'postTitle', 'postContent'
        , 'postStatus', 'postMustRead', 'postPin', 'pushTarget', 'pushUsed'
        , 'version'
        , 'categoryId', 'boardId', 'postOptions'
      ]

      for (const key of createModelKeys) {
        params[key] = this.model[key]
      }

      // 과제일 경우 마감일 추가
      if (this.isPostTypeHomework) {
        params.timestampStart = !this.option.checkbox.timestampEnd
          ? null
          : new Date().getTime()
        params.timestampEnd = !this.option.checkbox.timestampEnd
          ? null
          : this.model.timestampEnd
      }

      if (!params.postTitle || params.postTitle.trim().length === 0) {
        params.postTitle = null
      }

      params.postContent = this.$replaceStrongToBTag(params.postContent)

      params.pushTarget = this.model.pushTarget
      params.userType = this.model.userType

      if (this.model.files.length > 0) {
        params['files'] = this.model.files
      }

      // 즉시 발송 여부 (true: 즉시, false: 예약)
      params.disclosureType = this.model.disclosureType

      /**
       * set editor content
       */
      params.postContent = this.replacePostContentEditor(params.postContent)

      /**
       * set editor imagePack files
       */
      params.postContent = this.getPostContentImagePackFiles(params.postContent, this.imagePackFiles)

      /**
       * set editor doc files
       */
      params.postContent = this.getPostContentDocFiles(params.postContent, this.docFiles)

      /**
       * replaceAll color RGB to Hex (app editor compatible)
       */
      params.postContent = this.$stringUtil.replaceRgbToHex(params.postContent)

      let regex = new RegExp('귀하의 브라우저는 html5 video를 지원하지 않습니다.', "gi") 
      params.postContent = params.postContent.replace(regex, "")

      try {
        await this.checkContentMaxByte(params.postContent)
      } catch (e) {
        this.$log.debug(e)
        this.restoreResource('model')
        return false
      }

      try {
        const res = await axios({
          method: 'POST',
          url: `${process.env.VUE_APP_BASE_API_URI}/posts`,
          data: params
        })

        this.$log.debug(this.$options.name + ` write ${postStatus} res => `, res)

        this.$toasted.clear()
        this.$toasted.show('게시글이 등록되었습니다.', { duration: 2000 })

        // 다른 클래스로 복사한 경우 에디터 닫기 (클래스 갱신, 이동X)
        if (params.parentUri !== `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.parentId}`) {
          this.closeCurPostEdit()
          return
        }

        this.setLibList()

        // 게시판 변경
        if (changeBoardObj.isChangeBoard || changeBoardObj.isChangeFolder) {
          const payload = {
            postType: this.model.postType,
            boardId: this.model.boardId,
            folderList: this.boardDetail.folders,
            existsFolder: this.boardDetail.folders.length > 0 && this.boardDetail.isUsedFolder,
            isAlwaysBoardOpen: changeBoardObj.isAlwaysBoardOpen
          }

          await eventBus.$emit('call-lnb-list-tab-on-clazzes', payload)
        }

        // 폴더 변경
        if (changeBoardObj.isChangeFolder) {
          const payload = {
            postType: this.model.postType,
            boardId: this.model.boardId,
            folderId: this.model.categoryId,
            changeFolderOff: this.changeFolderOff,
          }

          await eventBus.$emit('call-lnb-list-tab-on-clazzes-folder', payload)
        } else {
          // 게시글 신규 등록 시 현재 게시글 폴더 목록 갱신
          await eventBus.$emit('init-cur-posts')
        }

        await eventBus.$emit('get-clazz-post-top')

        // 수정 팝업은 즉시 닫힘
        this.closePopup()
      } catch (err) {
        this.$log.debug(
          this.$options.name + ` write ${postStatus} err => `,
          err
        )
        this.restoreResource('model')

        // 에러 메시지
        this.$hiClass.alert(this.getSubmitErrorMessage(err), 'error')
      }
    },

    async writeProcUpdate(postStatus, forcePushUsed, changeBoardObj) {
      // 예약 후 즉시 올리기로 변경했을 때 푸시 발송 처리
      if (this.post.postStatus === 'RESERVE' && postStatus === 'COMPLETE') {
        this.model.pushUsed = true
      }

      // 이미 발송완료 된 게시글의 푸시 여부를 강제로 적용
      if (typeof forcePushUsed !== 'undefined')
        this.model.pushUsed = forcePushUsed

      // 임시 저장 후 즉시 올리기로 변경했을 때 게시일을 현재 시간으로 변경
      this.post.posted = this.post.postStatus === 'TEMPORARY' && postStatus === 'COMPLETE'
        ? this.$moment().valueOf()
        : this.model.posted

      this.post.postStatus = postStatus
      this.post.postTitle = this.model.postTitle
      this.post.postContent = this.model.postContent
      this.post.timestampEnd = !this.option.checkbox.timestampEnd
        ? null
        : this.model.timestampEnd

      if (!this.post.postTitle || this.post.postTitle.trim().length === 0) {
        this.post.postTitle = null
      }

      this.post.postContent = this.$replaceStrongToBTag(this.post.postContent)

      this.post.postMustRead = this.model.postMustRead
      this.post.postPin = this.model.postPin
      this.post.pushTarget = this.model.pushTarget
      this.post.pushUsed = this.model.pushUsed

      if(this.currentPushTarget === "add" && this.model.pushTarget !== "TEACHER") {
        if(this.originPushTarget.target === "TEACHER") {
          if(this.model.pushTarget === "STUDENT") {
            this.post.currentPushTarget = "STUDENT"
          } else if(this.model.pushTarget === "PARENTS") {
            this.post.currentPushTarget = "PARENTS"
          }
        }

        if(this.originPushTarget.target === "PARENTS") {
          if(this.model.pushTarget === "ALL") {
            this.post.currentPushTarget = "STUDENT"
          } else if(this.model.pushTarget === "STUDENT") {
            this.post.currentPushTarget = "STUDENT"
          }
        }

        if(this.originPushTarget.target === "STUDENT") {
          if(this.model.pushTarget === "ALL") {
            this.post.currentPushTarget = "PARENTS"
          } else if(this.model.pushTarget === "PARENTS") {
            this.post.currentPushTarget = "PARENTS"
          }
        }
      }

      this.post.userType = this.model.userType
      this.post.version = this.model.version
      this.post.files = this.model.files

      this.post.files = this.post.files.map(item => {
        if(!item.fileTranscodePath === false) {
          item.fileConvertPath = item.fileTranscodePath
        }
        
        return item
      })

      // 즉시 발송 여부 (true: 즉시, false: 예약)
      this.post.disclosureType = this.model.disclosureType

      this.post.categoryId = this.model.categoryId
      this.post.boardId = this.model.boardId

      this.post.postOptions = this.model.postOptions
      
      /**
       * set editor content
       */
      this.post.postContent = this.replacePostContentEditor(this.post.postContent)

      this.post.postContent = this.replacePostVideoEditor(this.post.postContent)

      /**
       * set editor imagePack files
       */
      this.post.postContent = this.getPostContentImagePackFiles(this.post.postContent, this.imagePackFiles)

      /**
       * set editor doc files
       */
      this.post.postContent = this.getPostContentDocFiles(this.post.postContent, this.docFiles)

      /**
       * replaceAll color RGB to Hex (app editor compatible)
       */
      this.post.postContent = this.$stringUtil.replaceRgbToHex(this.post.postContent)

      let regex = new RegExp('귀하의 브라우저는 html5 video를 지원하지 않습니다.', "gi") 
      this.post.postContent = this.post.postContent.replace(regex, "")

      try {
        await this.checkContentMaxByte(this.post.postContent)
      } catch (e) {
        this.$log.debug(e)
        this.restoreResource('model', 'post')
        return false
      }

      this.$log.debug("this.post => ", this.post)

      try {
        const fixedRequestBody = Object.assign({}, this.post)

        if (fixedRequestBody.userMobile && fixedRequestBody.userMobile.includes('***') || !fixedRequestBody.userMobile)
          delete fixedRequestBody.userMobile

        const res = await axios({
          method: 'PATCH',
          data: fixedRequestBody,
          url: fixedRequestBody._links.self.href
        })
        await this.setLibList()

        // 게시물 OFF 여부 확인 
        const chkOff = await this.editingOff()
        if(chkOff === true) return

        // 폴더 변경 여부
        if (changeBoardObj.isChangeFolder) {
          // 변경된 폴더로 이동
          const payload = {
            postType: this.model.postType,
            boardId: this.model.boardId,
            folderId: this.model.categoryId,
            changeFolderOff: this.changeFolderOff,
          }
          await eventBus.$emit('call-lnb-list-tab-on-clazzes-folder', payload)
        } else {
          // 기존 폴더 목록 갱신
          await eventBus.$emit('init-cur-posts')
        }

        await eventBus.$emit('get-clazz-post-top')

        // 상세 갱신
        this.updateItemDetailObj(this.post)
        this.closePopup()
      } catch(err) {
        this.$log.debug(
          this.$options.name + ` write ${postStatus} err => `,
          err
        )
        this.restoreResource('model', 'post')

        // 에러 토스트 메시지
        this.$toasted.clear()
        this.$toasted.show(this.getSubmitErrorMessage(err))
      }
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

    cancelReserve() {
      this.model.posted = this.$moment().valueOf()
      this.model.postStatus = ''
      this.isSelectedReserve = false
    },


    // 컨펌 메시지 ==========================================================================
    getOutOfDatePostConfirmMessage() {
      const postTypeNameSuffix1 = this.postTypeName === '공지' || this.postTypeName === '과제' ? '를' : '을'
      const postTypeNameSuffix2 = this.postTypeName === '공지' || this.postTypeName === '과제' ? '가' : '이'
      const title = `이미 발송 완료된 게시글입니다.<br>변경된 내용으로 ${this.postTypeName + postTypeNameSuffix1} <span>수정</span> 하시겠습니까?`

      let message = ``
      message += `<div class="modal-cont-inner">`
      message += `<div class="modal-title-wrap">`
      message += `<div class="title">${title}</div>`

      if (this.option.isManager)
        message += `<p>* ${this.postTypeName + postTypeNameSuffix2} 수정되었다는 푸시 알림 메시지를<br>보내지 않을 수 있습니다.</p>`

      message += `</div>`

      if (this.option.isManager) {
        message += `<div class="input-radio-wrap">`
        message += `<input type="radio" name="select-send" id="send-push" value="true" /><label for="send-push"><span>푸시 알림 보내기</span></label>`
        message += `<input type="radio" name="select-send" id="send-not" value="false" checked /><label for="send-not"><span>보내지 않기</span></label>`
        message += `</div>`
      }

      message += `</div>`

      if (this.option.isManager) {
        // 라디오 버튼 생성 후 이벤트 추가
        this.$nextTick(() => {
          const elements = document.querySelectorAll('.swal2-html-container .modal-cont-inner input[type="radio"]')
          elements.forEach(element => {
            element.addEventListener('change', event => {
              this.model.pushUsed = JSON.parse(event.target.value)
            })
          })
        })
      }

      return message
    },

    getSubmitErrorMessage(rejectErrorObj) {
      let errorMessage = this.$t('common.error.save')

      if (rejectErrorObj && (rejectErrorObj.response || {}).status === 451)
        return "작성하신 문장 내에 사용 금지 단어가 포함되어 있습니다."

      if (rejectErrorObj
          && rejectErrorObj.response
          && rejectErrorObj.response.status === 428
          && rejectErrorObj.response.data
      ) {
        const errorResponseData = rejectErrorObj.response.data
        const errorCode = errorResponseData.error
        this.$log.warn('getSubmitErrorMessage() errorResponseData => ', errorResponseData)
        errorMessage = `errorCode: ${errorCode}`

        /**
         * notFoundBoardFolder: (게시판) 존재하지 않는 게시판이나 폴더 (boardId 나 categoryId 가 null 일 경우에도 해당)
         * deletedBoard: (게시판) 삭제된 게시판
         * deletedFolder: (게시판) 삭제된 폴더
         * notMatchBoard: (게시판) 게시글의 boardId 와 폴더의 boardId 불일치
         * notMatchClass: (게시판) 게시글의 classId 와 게시판의 classId 불일치
         * notMatchPostType: (게시판) 게시글의 postType 과 게시판의 postType 불일치
         * deactivatedBoard: (게시판) 미사용 게시판
         * deactivatedClass: (클래스) 비공개/삭제 클래스
         * invalidBanner: (배너) 배너 게시물로서 유효하지 않음 (deviceType/positionType/bannerType 셋 중 하나라도 null)
         * invalidEvent: (이벤트) 이벤트 게시물로서 유효하지 않음 (timestampStart 나 timestampEnd 가 null)
         *
         */
        switch (errorCode) {
          case 'notFoundBoardFolder': {
            errorMessage = `게시판 또는 폴더를 찾을수 없습니다.<br>다시 확인해주세요.`
            this.setBoardDetail()
            this.clearSelectedFolder()
            break
          }
          case 'deletedBoard': {
            errorMessage = `게시판이 삭제되었습니다.<br>다른 게시판으로 이동 후 작성해주세요.`
            // TODO: 메세지 닫기 및 현재 화면 유지
            this.setBoardDetail()
            this.clearSelectedFolder()
            break
          }
          case 'deletedFolder': {
            errorMessage = `폴더가 삭제되었습니다.<br>다시 확인해주세요.`
            this.setBoardDetail()
            this.setDefaultCategoryId()
            break
          }
          case 'notMatchBoard':
          case 'notMatchClass':
          case 'notMatchPostType': {
            errorMessage = `정상적으로 요청이 처리되지 않았습니다.`
            // TODO: 메세지 닫기 및 불일치 정보값 재조회?
            // TODO: https://www.figma.com/file/eS1appyXQtKjFGWdqZiPGf?node-id=7609:26543#340110493
            this.setBoardDetail()
            this.clearSelectedFolder()
            break
          }
          case 'invalidBanner':
          case 'invalidEvent': {
            errorMessage = `정상적으로 요청이 처리되지 않았습니다.`
            break
          }
          case 'deactivatedBoard': {
            errorMessage = '게시판 사용이 OFF 되었습니다.<br>다른 게시판으로 이동 후 작성해주세요.'
            break
          }
          case 'deactivatedClass': {
            errorMessage = '등록할 수 없는 클래스입니다.<br>다시 확인해주세요.'
            break
          }
        }
      }
      return errorMessage
    },

    replaceConfirmMessageNoAdd(folderOff) {
      this.model.pushUsed = false

      const titleDate = this.$moment(this.model.posted).format('YYYY년 M월 D일 (ddd)')
      const postTypeNameSuffix1 = this.postTypeName === '공지' || this.postTypeName === '과제' ? '를' : '을'
      const postTypeNameSuffix2 = this.postTypeName === '공지' || this.postTypeName === '과제' ? '가' : '이'
      let confirmMsg = `<p>* ${this.postTypeName + postTypeNameSuffix2} 수정되었다는 푸시 알림 메시지를<br>보내지 않을 수 있습니다.</p>`

      if (!this.option.checkbox.pushTarget.PARENTS && !this.option.checkbox.pushTarget.STUDENT) {
        confirmMsg = `<p>* 수신대상이 없는 게시글은 클래스 선생님만 확인이 가능합니다.</p>`
      }

      let message = ``
      message += `<div class="modal-cont-inner">`
      message += `<div class="modal-title-wrap">`
      message += `<div class="title ori">${folderOff === true ? `${this.writeMsg.FOLDEROFF}<br><br>` : ""} ${titleDate}<br>${this.postTypeName + postTypeNameSuffix1} <span>수정</span> 하시겠습니까?</div>`
      message += confirmMsg
      message += `</div>`
      message += `<div class="input-radio-wrap">`
      message += `<input type="radio" name="select-send" id="send-push" value="true" /><label for="send-push"><span>푸시 알림 보내기</span></label>`
      message += `<input type="radio" name="select-send" id="send-not" value="false" checked /><label for="send-not"><span>보내지 않기</span></label>`
      message += `</div>`
      message += `</div>`

      // 라디오 버튼 생성 후 이벤트 추가
      this.$nextTick(() => {
        const elements = document.querySelectorAll('.swal2-html-container .modal-cont-inner input[type="radio"]')
        elements.forEach(element => {
          element.addEventListener('change', event => {
            this.model.pushUsed = JSON.parse(event.target.value)
          })
        })
      })

      return message
    },

    replaceConfirmMessage(message, folderOff) {
      this.model.pushUsed = false

      const postTypeNameSuffix1 = this.postTypeName === '공지' || this.postTypeName === '과제' ? '를' : '이'
      const postTypeNameSuffix2 = this.postTypeName === '공지' || this.postTypeName === '과제' ? '가' : '이'

      message = ``
      message += `<div class="modal-cont-inner">`
      message += `<div class="modal-title-wrap">`
      message += `<div class="title">${folderOff === true ? `${this.writeMsg.FOLDEROFF}<br><br>` : ""}<br>${this.postTypeName + postTypeNameSuffix2} 수정되었습니다.<br/>수정된 내용을 푸시 알림을 보낼까요?</div>`
      // message += confirmMsg
      message += `</div>`
      message += `<div class="input-radio-wrap n">` //// 게시글 수정 시 수신대상 추가된 경우 표시되는 팝업 모양 상이하여 inline-style로 들어간 부분 삭제함
      message += `<ul class="input-list">`  //// 게시글 수정 시 수신대상 추가된 경우 표시되는 팝업 모양 상이하여 inline-style로 들어간 부분 삭제함
      message += `<li><input type="radio" name="select-send" id="send-not" value="not" checked /><label for="send-not"><span>보내지 않기</span></label></li>`
      message += `<li><input type="radio" name="select-send" id="send-push-add" value="add" /><label for="send-push-add"><span>추가된 구성원에게만 푸시 보내기</span></label></li>`
      message += `<li><input type="radio" name="select-send" id="send-push" value="all" /><label for="send-push"><span>전체에게 푸시 보내기</span></label></li>`
      message += `</ul>`
      message += `</div>`
      message += `</div>`

      // 라디오 버튼 생성 후 이벤트 추가
      this.$nextTick(() => {
        const elements = document.querySelectorAll('.swal2-html-container .modal-cont-inner input[type="radio"]')
        elements.forEach(element => {
          element.addEventListener('change', event => {
            if(event.target.value === "not") {
              this.model.pushUsed = false
              this.currentPushTarget = null
            } else {
              this.model.pushUsed = true

              if(event.target.value === "add") {
                this.currentPushTarget = "add"
              } else {
                this.currentPushTarget = null
              }
            }
          })
        })
      })

      return message
    },


    // 수신 대상 ==========================================================================
    getPushTarget() {
      const pushTarget = this.model.pushTarget

      switch (pushTarget) {
        case 'ALL':
          this.option.checkbox.pushTarget.PARENTS = true
          this.option.checkbox.pushTarget.STUDENT = true
          break
        case 'TEACHER':
          this.option.checkbox.pushTarget.PARENTS = false
          this.option.checkbox.pushTarget.STUDENT = false
          break
        case 'PARENTS':
          this.option.checkbox.pushTarget.PARENTS = true
          this.option.checkbox.pushTarget.STUDENT = false
          break
        case 'STUDENT':
          this.option.checkbox.pushTarget.PARENTS = false
          this.option.checkbox.pushTarget.STUDENT = true
          break
      }

      this.getOriPushTarget()
    },

    getOriPushTarget() {
      this.originPushTarget.checkbox = {
        ...this.option.checkbox.pushTarget
      }
      let pushTarget = 'TEACHER'

      if (
        this.originPushTarget.checkbox.TEACHER &&
        this.originPushTarget.checkbox.PARENTS &&
        this.originPushTarget.checkbox.STUDENT
      ) {
        pushTarget = 'ALL'
      } else if (this.originPushTarget.checkbox.PARENTS) {
        pushTarget = 'PARENTS'
      } else if (this.originPushTarget.checkbox.STUDENT) {
        pushTarget = 'STUDENT'
      }

      this.originPushTarget.target = pushTarget
    },

    getReadableFromBoardDetail(type) {
      if (this.boardDetail === null) return false
      const readablePermission = (this.boardDetail.boardPermission || {readUserTypes: []}).readUserTypes.includes(type)
      const readableMap = {
        PARENTS: this.boardDetail.isReadParents,
        STUDENT: this.boardDetail.isReadStudent
      };
      return readableMap[type] || readablePermission;
    },

    initDefaultPushTarget() {
      this.option.checkbox.pushTarget.TEACHER = true
      if (this.boardDetail !== null && this.curPostEdit.create) {
        this.option.checkbox.pushTarget.PARENTS = this.getReadableFromBoardDetail('PARENTS')
        this.option.checkbox.pushTarget.STUDENT = this.getReadableFromBoardDetail('STUDENT')
      }
    },

    initDisabledPushTarget() {
      if (this.boardDetail !== null) {
        this.option.disable.pushTarget.PARENTS = !this.getReadableFromBoardDetail('PARENTS')
        this.option.disable.pushTarget.STUDENT = !this.getReadableFromBoardDetail('STUDENT')
      }
    },

    checkPushTarget() {
      return new Promise(resolve => {
        resolve(
          ['PARENTS', 'STUDENT'].filter(item =>
            // 수신 대상이 지정되었지만, 클래스 설정에서 읽기 권한이 없는 경우
            this.option.checkbox.pushTarget[item] && this.option.disable.pushTarget[item]
          )
        )
      })
    },

    setPushTarget() {
      let pushTarget = 'TEACHER'

      if (
        this.option.checkbox.pushTarget.TEACHER &&
        this.option.checkbox.pushTarget.PARENTS &&
        this.option.checkbox.pushTarget.STUDENT
      ) {
        pushTarget = 'ALL'
      } else if (this.option.checkbox.pushTarget.PARENTS) {
        pushTarget = 'PARENTS'
      } else if (this.option.checkbox.pushTarget.STUDENT) {
        pushTarget = 'STUDENT'
      }

      this.model.pushTarget = pushTarget
    },

    alertCheckPushTarget() {
      let pushTarget = 'TEACHER'

      if (
        this.option.checkbox.pushTarget.TEACHER &&
        this.option.checkbox.pushTarget.PARENTS &&
        this.option.checkbox.pushTarget.STUDENT
      ) {
        pushTarget = 'ALL'
      } else if (this.option.checkbox.pushTarget.PARENTS) {
        pushTarget = 'PARENTS'
      } else if (this.option.checkbox.pushTarget.STUDENT) {
        pushTarget = 'STUDENT'
      }

      return pushTarget
    },

    setUserType() {
      this.model.userType = []
      for (const [key, value] of Object.entries(this.option.checkbox.pushTarget)) {
        if (value) {
          this.model.userType.push(key)
        }
      }
    },


    // 캘린더 ==========================================================================
    handleCalendar(calendarType, flag) {
      this.option.calendar[calendarType].isOpen = flag || false
    },

    openCalendarTimestampEnd() {
      this.option.mode = 'RESERVE'
      this.handleCalendar('timestampEnd', true)
    },

    closeCalendarTimestampEnd() {
      this.handleCalendar('timestampEnd', false)
    },

    openCalendarComponent() {
      if (!this.isPostStatusComplete) {
        this.option.calendar.posted.isOpen = true
      }
    },

    closeCalendarComponent() {
      this.option.calendar.posted.isOpen = false
      if(!this.model.postStatus){
        this.model.disclosureType = true
      }
    },

    openCalendarByReserveMode() {
      if (!this.isPostStatusComplete) {
        this.option.mode = 'RESERVE'
        this.openCalendarComponent()
      }
    },


    // 본문 (postContent) ==========================================================================
    getPostContentEditor(postContent) {
      try {
        let domParser = new DOMParser()
        let postContentDocument = domParser.parseFromString(postContent, 'text/html')
        let editorElement = null
        const documentBody = postContentDocument.body

        if (documentBody)
          editorElement = documentBody.querySelector('.class-fr-editor')

        // fixed no controls video
        if (editorElement) {
          const videos = editorElement.querySelectorAll('video')
          for (const video of videos) {
            video.controls = true

            const videoSrc = video.firstElementChild && video.firstElementChild.src
            const videoFile = this.post.files.find(d => d.fileOriginalPath === videoSrc)

            if(videoSrc && videoFile) {
              video.firstElementChild.src = videoFile.fileTranscodePath || videoFile.fileOriginalPath
              if (videoFile.fileTranscodePath && videoFile.fileTranscodePath.includes('mp4')) {
                video.firstElementChild.type = 'video/mp4'
              }
            }

            if (videoSrc && videoFile && videoFile.fileThumbnailPath && videoFile.fileThumbnailPath !== '') {
              video.poster = videoFile.fileThumbnailPath
            }
          }

          const frVideoEls = editorElement.querySelectorAll('.fr-video')
          for (const frVideoEl of frVideoEls) {
            frVideoEl.setAttribute('contenteditable', 'false')
          }
          return editorElement.innerHTML
        } else {
          return postContent
        }

      } catch (e) {
        this.$log.error(`getPostContentEditor error => `, e)
        return postContent
      }

    },

    getCopyPostContentEditor(postContent) {
      try {
        let domParser = new DOMParser()
        let postContentDocument = domParser.parseFromString(postContent, 'text/html')
        let editorElement = null
        const documentBody = postContentDocument.body

        if (documentBody)
          editorElement = documentBody.querySelector('.class-fr-editor')

        if (editorElement) {
          const videos = editorElement.querySelectorAll('video')
          for (const video of videos) {
            video.controls = true

            const videoSrc = video.firstElementChild && video.firstElementChild.src
            const videoFile = this.post.files.find(d => d.originalFile.fileOriginalPath === videoSrc || d.originalFile.fileTranscodePath === videoSrc)

            if (videoSrc && videoFile) {
              if (videoFile.fileTranscodePath || videoFile.fileOriginalPath) {
                video.firstElementChild.src = videoFile.fileTranscodePath || videoFile.fileOriginalPath
                if (videoFile.fileTranscodePath && videoFile.fileTranscodePath.includes('mp4')) {
                  video.firstElementChild.type = 'video/mp4'
                }
              } else { // 복사 실패한 동영상 처리 (본문에서 삭제, 파일 배열에서 삭제)
                video.remove()
                this.post.files = this.post.files.filter(f => f !== videoFile)
              }
            }

            if (videoSrc && videoFile && videoFile.fileThumbnailPath && videoFile.fileThumbnailPath !== '') {
              video.poster = videoFile.fileThumbnailPath
            }
          }

          const images = editorElement.querySelectorAll('img')
          for (const img of images) {
            const imgSrc = img.src
            const imgFile = this.post.files.find(d => d.originalFile.fileOriginalPath === imgSrc)

            if (imgSrc && imgFile) {
              if (imgFile.fileOriginalPath) {
                img.src = imgFile.fileOriginalPath
              } else { // 복사 실패한 이미지 처리 (본문에서 삭제, 파일 배열에서 삭제)
                img.remove()
                this.post.files = this.post.files.filter(f => f !== imgFile)
              }
            }
          }

          const frVideoEls = editorElement.querySelectorAll('.fr-video')
          for (const frVideoEl of frVideoEls) {
            frVideoEl.setAttribute('contenteditable', 'false')
          }
          return editorElement.innerHTML
        } else {
          return postContent
        }

      } catch (e) {
        this.$log.error(`getCopyPostContentEditor error => `, e)
        return postContent
      }
    },

    replaceVideoTag(documentBody) {
      const videos = documentBody.querySelectorAll('video')
      for (const video of videos) {
        if (video.parentNode.nodeName !== 'SPAN') {
          const p = document.createElement('p')
          const span = document.createElement('span')
          span.className = 'fr-video fr-dvb fr-draggable'
          span.contentEditable = 'false'
          span.draggable = 'true'

          video.style = 'width: 300px'
          video.controls = 'true'

          span.innerHTML = video.outerHTML
          p.innerHTML = span.outerHTML
          video.replaceWith(p)
        }
      }
    },

    removeLinkStyle(documentBody) {
      const linkStyleTags = documentBody.querySelectorAll('a[href=""]')
      linkStyleTags.forEach(a => {
        while (a.firstChild) {
          a.parentNode.insertBefore(a.firstChild, a)
        }
        a.remove()
      })
    },

    replacePostContentEditor(postContent) {
      let domParser = new DOMParser()
      let postContentDocument = domParser.parseFromString(postContent, 'text/html')
      let editorContentElement = null
      const documentBody = postContentDocument.body

      if (documentBody) {
        this.replaceVideoTag(documentBody)
        this.removeLinkStyle(documentBody)
        editorContentElement = documentBody.querySelector('.class-fr-editor')
      }

      if (editorContentElement === null) {
        let editorElement = postContentDocument.createElement('div')
        editorElement.className = 'class-fr-editor'
        editorElement.innerHTML = documentBody ? documentBody.innerHTML : ''
        return editorElement.outerHTML

      } else {
        return editorContentElement.innerHTML
      }
    },

    replacePostVideoEditor(postContent) {
      try {
        let domParser = new DOMParser()
        let postContentDocument = domParser.parseFromString(postContent, 'text/html')
        let editorElement = null
        const documentBody = postContentDocument.body

        if (documentBody)
          editorElement = documentBody.querySelector('.class-fr-editor')

        // fixed no controls video
        if (editorElement) {
          const videos = editorElement.querySelectorAll('video')
          for (const video of videos) {
            const videoSrc = video.firstElementChild && video.firstElementChild.src
            const videoFile = this.post.files.find(d => d.fileTranscodePath === videoSrc)
            if(videoSrc && videoFile) {
              video.firstElementChild.src = videoFile.fileOriginalPath
              video.firstElementChild.type = videoFile.fileContentType
            }
          }

          return documentBody.innerHTML
        } else {
          return postContent
        }

      } catch (e) {
        this.$log.error(`getPostContentEditor error => `, e)
        return postContent
      }
    },

    getPostContentDocFiles(postContent, docFiles) {
      let domParser = new DOMParser()

      let postContentDocument2 = domParser.parseFromString(postContent, 'text/html')
      if (docFiles.length > 0) {
        let filesDivElement = postContentDocument2.createElement('div')
        filesDivElement.className = 'file-list'

        for (const docFile of docFiles) {
          let filesAnchorElement = postContentDocument2.createElement('a')
          filesAnchorElement.href = 'javascript:void(0);'

          let filesSpanFileNameElement = postContentDocument2.createElement('span')
          filesSpanFileNameElement.className = 'attached-file-name'
          filesSpanFileNameElement.innerText = docFile.fileName

          let filesSpanPreViewElement = postContentDocument2.createElement('span')
          filesSpanPreViewElement.className = 'attached-preview'

          let filesImgPreViewElement = postContentDocument2.createElement('img')
          filesImgPreViewElement.src = docFile.fileThumbnailPath
          filesImgPreViewElement.alt = ""

          // span | img
          filesSpanPreViewElement.appendChild(filesImgPreViewElement)

          // a | span
          //   | span | img
          filesAnchorElement.appendChild(filesSpanFileNameElement)
          filesAnchorElement.appendChild(filesSpanPreViewElement)

          // div | a | span
          //         | span | img
          filesDivElement.appendChild(filesAnchorElement)

          // doc 썸네일이 없을 경우 썸네일 영역 삭제
          if (!docFile.fileThumbnailPath)
            filesSpanPreViewElement.remove()
        }

        postContentDocument2.body.appendChild(filesDivElement)

        this.$log.debug(`postContentDocument2.body.innerHTML : `, postContentDocument2.body.innerHTML)

        postContent = postContentDocument2.body.innerHTML
      }

      return postContent
    },

    getPostContentImagePackFiles(postContent, imagePackFiles) {
      const domParser = new DOMParser()

      const postContentDocument3 = domParser.parseFromString(postContent, 'text/html')

      if (imagePackFiles.length > 0) {
        const filesDivElement = postContentDocument3.createElement('div')
        filesDivElement.className = 'img-list'

        const filesDivElement2 = postContentDocument3.createElement('div')
        filesDivElement2.className = 'img-list-inner'

        for (const imagePackFile of imagePackFiles) {
          const filesAnchorElement = postContentDocument3.createElement('a')
          filesAnchorElement.href = 'javascript:void(0);'

          const filesImgThumbnailElement = postContentDocument3.createElement('img')
          filesImgThumbnailElement.src = imagePackFile.fileThumbnailPath
          filesImgThumbnailElement.alt = ""

          if (!imagePackFile.fileThumbnailPath) {
            // 묶음 사진 이미지일 경우 썸네일 주소 생성
            filesImgThumbnailElement.src = imagePackFile.fileOriginalPath.replace('//download', '//image')
              .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
              .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`)
          }

          // a | img
          filesAnchorElement.appendChild(filesImgThumbnailElement)

          // div | a | img
          filesDivElement2.appendChild(filesAnchorElement)
        }
        // div | div | a | img
        filesDivElement.appendChild(filesDivElement2)

        postContentDocument3.body.appendChild(filesDivElement)

        this.$log.debug(`postContentDocument3.body.innerHTML : `, postContentDocument3.body.innerHTML)

        postContent = postContentDocument3.body.innerHTML
      }

      return postContent

    },


    // Post ==========================================================================
    // 게시글 fresh 데이터를 임시저장
    async setTempPost() {
      const res = await this.$hiClass.posts.read(`/posts/${this.post.currentId}`)
      if (res.data && res.data.currentId) {
        if (res.data.postStatus === 'COMPLETE' && this.post.postStatus === 'RESERVE') {
          // TODO: 예약된 게시글이 스케줄러로 발송된 경우 목록 갱신을 위해 게시글 수정 타임스탬프 값 updatedTimestamp 변경한다.
          res.data.updatedTimestamp += 1000
        }

        this.tempPost = res.data
      }
    },

    // 게시글 fresh 데이터 갱신 여부 확인
    async isOutOfDatePost() {
      return new Promise(async resolve => {
        await this.setTempPost()

        if (this.tempPost.updatedTimestamp !== this.post.updatedTimestamp
          || this.tempPost.postStatus !== this.post.postStatus
        ) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    },

    // 게시글 fresh 데이터 갱신된 경우 로컬 데이터 최신화
    replaceTempPostToPost() {
      for (const [key, value] of Object.entries(this.tempPost)) {
        if (key !== 'updatedTimestamp')
          this.post[key] = value
      }
      // 다른 속성 복사가 완료된 후 updatedTimestamp 를 복사
      this.post.updatedTimestamp = this.tempPost.updatedTimestamp

      const options = {duration: 3000}
      this.$toasted.clear()
      this.$toasted.show('변경사항이 적용되었습니다.', options);
    },


    // defaultTime set ==========================================================================
    setReserveDefaultTime() {
      const curTime = this.$moment()
      const reserveDateTime = curTime.add(10, 'minutes')
      this.model.posted = this.model.posted ? this.model.posted : reserveDateTime.valueOf()
    },

    setTimestampEndDefaultTime() {
      const curDateFormat = this.$moment().format('YYYYMMDD')
      this.model.timestampEnd = this.$moment(curDateFormat)
        .add(1, 'days')
        .valueOf() - 1
    },


    // 게시판, 폴더 관련 ==========================================================================
    // 폴더 색상
    getFolderItemColor(folderItem) {
      return folderItem ? folderItem.color : ''
    },

    // 폴더 색상 (categoryId로 찾기)
    getFolderItemColorByCategoryId(folderItems, categoryId) {
      if (Array.isArray(folderItems)) {
        const foundFolderItem = folderItems.find(folderItem => folderItem.folderId === categoryId)
        return foundFolderItem ? foundFolderItem.color : ''
      } else {
        return ''
      }
    },

    // 복사, 수정 완료시 게시판/폴더 이동
    getIsChangeBoard() {
      const modelBoardId = this.model.boardId
      const routeBoardId = this.$route.params.boardId
      const modelFolderId = this.model.categoryId
      const routeFolderId = this.$route.params.folderId

      let changeBoardObj = {
        isChangeBoard: false,
        isChangeFolder: false,
        isAlwaysBoardOpen: false
      }

      if (modelBoardId !== routeBoardId) { // 현재 위치한 게시판 !== 작성하려는 게시판
        changeBoardObj.isChangeBoard = true

        if (modelFolderId) { // 다른 게시판의 폴더로 이동
          changeBoardObj.isChangeFolder = true
          changeBoardObj.isAlwaysBoardOpen = true
        }

      } else { // 현재 위치한 게시판 === 작성하려는 게시판
        if (routeFolderId) { // 현재 위치가 폴더일때 (폴더가 있는 게시판의 경우)
          changeBoardObj.isAlwaysBoardOpen = true
          if (routeFolderId !== modelFolderId) { // 현재 위치한 폴더 !== 작성하려는 폴더
            changeBoardObj.isChangeFolder = true
          }
        }
      }

      return changeBoardObj
    },

    // 게시판 정보 read api 요청 + set
    async setBoardDetail() {
      this.boardDetail = await this.readBoard({
        boardId: this.model.boardId
      }) || {}
      if (this.isSecretBoard) {
        this.boardUsers = await this.getSecretBoardUsers(this.model.boardId)
      }
    },

    // 게시판 정보 read api 요청
    async getBoardDetail(){
      const res = await this.readBoard({
        boardId: this.model.boardId
      })
      return res;
    },

    // 기본 폴더 설정
    async setDefaultCategoryId() {
      try {
        this.model.categoryId = this.boardDetail.folders[0].folderId
      } catch (e) {
        this.$log.warn(e)
      }
    },

    // 선택한 폴더정보 삭제
    clearSelectedFolder() {
      this.model.categoryId = null
    },

    // 게시판 미사용 체크
    editingOff() {
      const chkIndex = this.curBoardList.findIndex(v => v.boardId === this.model.boardId)
      if(chkIndex === -1) {
        if(this.writeFolderOff === true) return

        this.$hiClass.alert("게시판 사용이 OFF 되었습니다.<br>다른 게시판으로 이동 후 작성해주세요.", 'error')
        return true
      }
      return false
    },

    // 클래스 게시판 set
    async setLibList(){
      const list = await this.initCurBoardList({ classId: this.parentId })
      eventBus.$emit('init-lnb-red-dot', {lnbList: list})
    },

    // 클래스 게시판 갱신 + 클래스로 이동
    async closeGoPage() {
      await this.setLibList()
      const chkIndex = this.curBoardList.findIndex(v => v.boardId === this.model.boardId)
      if(chkIndex === -1 && !this.isCopyMode) {
        if(this.writeFolderOff === true) return
        this.$router.push(`/main/clazzes/${this.parentId}`)
      }
    },


    // 안전수칙 ==========================================================================
    // 안전수칙 초기화
    initSafe() {
      if(this.isUpdate) {
        const obj = this.model.postOptions.find(v => v.name === "safetyRoles")
        if(!obj === false && obj.value !== "") {
          this.safeUpdateLoading = true
          const safetyRolesObj = this.model.postOptions.find(v => v.name === "safetyRoles")
          const categoryIdObj = this.model.postOptions.find(v => v.name === "categoryId")
          this.safeUseOn = true
          this.safeMessage = safetyRolesObj.value
          this.getSafeCategoryList(categoryIdObj.value)
        } else {
          this.safeUseOn = false
          this.getSafeCategoryList()
        }
      } else {
        this.initRegSafe()
      }
    },

    // 안전수칙 초기화 (최초 등록시)
    initRegSafe() {
      const check = JSON.parse(localStorage.getItem("safeUseOn"))

      if(check === true) {
        this.safeUseOn = true
        // this.getSafeRandom()
      } else {
        this.safeUseOn = false
      }
      this.getSafeCategoryList()
    },

    // 안전수칙 다른 문구 불러오기
    async getSafeRandom() {
      try {
        if(this.safeCategorySelect.categoryId === "") {
          const res = await axios({
            method: 'GET',
            url: `/safetyRoles/random?userId=${this.user.currentId}`
          })

          this.safeMessage = res.data.message
        } else {
          const res = await axios({
            method: 'GET',
            url: `/safetyRoles/categories/${this.safeCategorySelect.categoryId}?userId=${this.user.currentId}`
          })

          if(res.data._embedded) {
            const length = res.data._embedded.safeRoles.length
            const index = Math.floor(Math.random() * length)
            this.safeMessage = res.data._embedded.safeRoles[index].message
          } else {
            this.safeMessage = ""
            // this.$hiClass.alert('등록된 문구가 없습니다.', 'info')
          }
        }
      } catch(err) {
        this.$log.debug('safetyRoles random GET() error => ', err)
      }
    },

    // 안전수칙 카테고리 정보
    async getSafeCategoryList(categoryId = null) {
      try {
        const res = await axios({
          method: 'GET',
          url: `/safetyRoles/categories?userId=${this.user.currentId}`
        })
       
        this.safeCategoryList = [
          {
            categoryId: "",
            categoryType: "default",
            categoryName: "전체 카테고리"
          },
          ...res.data._embedded.categories
        ]

        if(categoryId !== null) {
          const obj = this.safeCategoryList.find(v => v.categoryId === categoryId)
          if(!obj === false) {
            this.safeCategorySelect = obj 
          } else {
            this.safeCategorySelect = {
              categoryId: "",
              categoryType: "default",
              categoryName: "전체 카테고리"
            }
          }
        }
      } catch(err) {
        this.$log.debug('safetyRoles categories GET() error => ', err)
      }
    },

    // 안전수칙 카테고리 선택
    selectSafeCategory(item) {
      this.safeCategorySelect = item
      this.openSelectSafeCategory = false
      this.getSafeRandom()
    },

    // 안전수칙 툴팁 제어
    wordsInfoShow() {
      this.isWordsInfoShow = !this.isWordsInfoShow
    },

    // 안전수칙 문구관리 팝업 카테고리 수정 후 반영
    refreshCategory(data, item) {
      if(data === 'del') {
        this.getSafeCategoryList()
        if(this.safeCategorySelect.categoryId === item.categoryId) {
          this.safeCategorySelect = {
            categoryId: "",
            categoryType: "default",
            categoryName: "전체 카테고리"
          }
        }
      } else if(data === 'add') {
        const obj = {
          categoryId: item.categoryId,
          categoryType: item.categoryType,
          categoryName: item.categoryName
        }
        this.safeCategoryList.push(obj)
      } else {
        this.getSafeCategoryList(this.safeCategorySelect.categoryId)
      }
    },

    // 안전수칙 문구관리 팝업 제어
    openSafe() {
      this.isSafeOpen = !this.isSafeOpen
    },

    // 안전수칙 카테고리 셀렉박스 제어
    closeSelectBox() {
      this.openSelectSafeCategory = false
    },


    // 파일 처리 ==========================================================================
    // 이미지 태그 src 치환, files 정보에 추가
    async externalImageReplace() {
      this.option.uploadLoading = true

      const parser = new DOMParser()
      const content = parser.parseFromString(this.model.postContent, 'text/html')
      const imgElements = content.getElementsByTagName('img')

      for (let imgElement of imgElements) {
        this._removeImgTagAttrs(imgElement) // 불필요한 태그 속성 제거
        const imgSrc = imgElement.getAttribute('src')

        if (!imgSrc.includes('download.hiclass.net') && !imgSrc.includes('base64')) { // 외부 이미지 주소이면 & base64 아니면
          try {
            const uploadFile = await this._externalImageUpload(imgSrc) // 이미지 업로드
            this.model.files.push(uploadFile) // files 추가
            imgElement.src = uploadFile.fileOriginalPath // img src 교체

          } catch (e) {
            this.$hiClass.alert('이미지 파일 중 업로드가 불가능한 파일이<br>포함되어 있어 자동 삭제됩니다.', 'warning')
            imgElement.remove() // postContent 내 el 삭제
            throw new Error(e)

          } finally {
            this.model.postContent = content.body.innerHTML
          }
        }
      }
      this.model.postContent = content.body.innerHTML
      this.option.uploadLoading = false
    },

    // 불필요한 element 속성값 삭제
    _removeImgTagAttrs(imgElement) {
      imgElement.getAttributeNames().forEach(attr => {
        if (attr !== 'src' && attr !== 'class' && attr !== 'style') {
          imgElement.removeAttribute(attr)
        }
      })
    },

    // 외부 이미지 업로드
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
          'fileName' : res.data.filename,
          'fileSize' : res.data.size,
          'fileOriginalPath' : res.data._links.original.href,
          'fileContentType' : fileContentType
        }

      } catch (e) {
        this.$log.warn(e)
        throw new Error(e)
      }
    },

    // 미사용 영상 파일 삭제
    deleteUnUsedVideoFiles() {
      let modelFiles = _.cloneDeep(this.model.files)
      let filteredFiles = _.cloneDeep(this.model.files)

      try {
        const parser = new DOMParser()
        const content = parser.parseFromString(this.model.postContent, 'text/html')
        const videoEls = content.getElementsByTagName('video')

        const videoSrcArr = []
        for (let videoEl of videoEls) {
          const src = videoEl.firstElementChild && videoEl.firstElementChild.src
          if (src) {
            videoSrcArr.push(src)
          }
        }
        filteredFiles = modelFiles.filter(file => {
          if (file.fileContentType.startsWith('video')) {
            // 본문 내에 포함되어 있는 video 인지 체크
            return videoSrcArr.includes(file.fileOriginalPath) || videoSrcArr.includes(file.fileTranscodePath)
          } else {
            return true
          }
        })
      } finally {
        this.model.files = filteredFiles
      }
    },

    // 미사용 파일 삭제
    deleteUnusedFiles() {
      const filePathArr = this.model.files.map(file => file.fileOriginalPath)
      let deleteFiles = []
      deleteFiles.push(...this.addedFiles.filter(addedFile => {
        if (!filePathArr.includes(addedFile.fileOriginalPath)) {
          return addedFile
        }
      }))
      if (this.isUpdate) {
        deleteFiles.push(...this.savedFiles.filter(addedFile => {
          if (!filePathArr.includes(addedFile.fileOriginalPath)) {
            return addedFile
          }
        }))
      }

      let deleteApi = []
      deleteFiles.forEach(file => {
        deleteApi.push(this.$hiClass.multipart.delete(file))
      })
      Promise.allSettled(deleteApi)
    },

    // 파일 인코딩 시도
    async encodingFiles() {
      // 동영상 인코딩: 수정 시 기존에 등록되었던 동영상은 인코딩 요청 안함 (seq, fileTranscodePath 로 판단)
      // seq, fileTranscodePath and 조건 이유: 게시글 복사시에는 인코딩 된 동영상을 복사한 경우 seq는 없지만 fileTranscodePath는 있기때문에 (이미 인코딩된 상태이므로 요청 보낼 필요 없음)
      const newVideoFiles = this.model.files.filter(file => file.fileContentType.startsWith('video') && !file.seq && !file.fileTranscodePath && !file.requestId)

      if (newVideoFiles.length > 0) {
        const failFiles = []
        const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

        for (let i = 0; i < newVideoFiles.length; i++) {
          try {
            await this.callMultipartEncode(newVideoFiles[i])
          } catch (e) {
            failFiles.push(newVideoFiles[i])
          }
        }

        // 인코딩 실패한 동영상 재시도
        if (failFiles.length > 0) {
          await wait(1000)

          for (let i = 0; i < failFiles.length; i++) {
            try {
              await this.callMultipartEncode(failFiles[i])
            } catch (e) {
              this.$log.debug(`video encode error => `, e)
            }
          }
        }
      }
    },

    // 파일 인코딩 api 호출
    async callMultipartEncode(file) {
      const encodeRes = await this.$hiClass.multipart.encode({
        fileOriginalPath: file.fileOriginalPath
      })

      const requestId = encodeRes.data.requestId
      if (requestId) {
        file.requestId = requestId
      }
    },

    // 파일 순서 정렬
    async orderFiles() {
      let domParser = new DOMParser()
      let postContentDocument = domParser.parseFromString(this.model.postContent, 'text/html').body
      const elements = postContentDocument.querySelectorAll('img, source')
      let editorFiles = []
      const modelFiles = _.cloneDeep(this.model.files)

      for (let i = 0; i < elements.length; i++) {
        const src = elements[i].src
        let targetIdx = -1
        if (elements[i].tagName === 'SOURCE') { // 영상
          targetIdx = modelFiles.findIndex(file => file.fileOriginalPath === src || file.fileTranscodePath === src)
        } else { // 이미지
          targetIdx = modelFiles.findIndex(file => file.fileOriginalPath === src)
        }

        if (targetIdx > -1) {
          editorFiles.push(...modelFiles.splice(targetIdx, 1))
        }
      }

      let imagePackFiles = []
      for (let i = modelFiles.length - 1; i >= 0; i--) {
        if (modelFiles[i].fileFlag === 'IMAGE_PACK') {
          imagePackFiles.unshift(...modelFiles.splice(i, 1))
        }
      }

      this.model.files = [...editorFiles, ...imagePackFiles, ...modelFiles]
    },

    // event emit ==========================================================================
    setModel(params) {
      for (const [key, value] of Object.entries(params)) {
        this.model[key] = value
      }
    },


    //  =======================================================================================
    // 게시글 제목 스타일 초기화
    initStyleTextarea() {
      if(this.$refs.postTitle){
        this.$refs.postTitle.style.height = '52px'
        this.$refs.postTitle.style.height = `${this.$refs.postTitle.scrollHeight}px`
      }
    },

    // 본문 길이 계산 63000 byte 초과 확인
    checkContentMaxByte(content) {
      return new Promise((resolve, reject) => {
        const curByte = (new TextEncoder()).encode(content).length
        const maxByte = 63000

        if (curByte > maxByte) {
          const editMaxByteWithCommas = this.$stringUtil.addCommas(maxByte)
          this.$hiClass.alert(
              `본문은 최대 ${editMaxByteWithCommas} byte 까지 입력 가능 합니다.<br>(한글 파일에서 복사-붙여넣기 할 경우, 실제 입력된 글자수보다 더 많이 입력된 것처럼 계산될 수 있습니다.)`
          )
          return reject(`content length exceeded => ${curByte} bytes`)
        } else {
          return resolve(true)
        }
      })
    },

    // 모든 기기 로그아웃
    allLogout: function () {
      window.close()
      this.$router.push('/logout', () => {})
    },
    // #69568 수신대상자 토글
    toggleRecMember() {
      this.isRecMember = !this.isRecMember;
    },
    // url 로 인식되는 tld 목록 json 조회
    async getTLDs() {
      const profile = process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net' ? 'production'
          : ['https://devui.hiclass.net', 'https://devboard.hiclass.net'].includes(process.env.VUE_APP_BASE_UI_URI) ? 'dev' : 'stage'
      const config = { cache: false, headers: { 'Content-Type': 'application/json' } }
      try {
        const response = await axiosModules.get(`${process.env.VUE_APP_URL_PROTOCOL}${process.env.VUE_APP_BASE_CDN_URI}/static/tld/${profile}/tld.json`, config)
        this.tlds = response.data
      } catch (err) {
        this.tlds = ['com', 'net', 'org', 'kr', 'me', 'gle', 'be', 'io', 'site', 'so']
      }
    }


  }
}
</script>

<style scoped>
.hide-calendar {
  cursor: default !important;
  text-decoration: none !important;
}
.input-textarea {
  width: 100%;
  height: 52px;
  border: 0;
  padding: 13px 16px;
  color: #2e2e2e;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: -.2px;
  vertical-align: top;
  transform: skew(0);
  -webkit-transform: skew(0);
  border-bottom: 1px solid #e0e0e0;
  overflow: hidden;
  background-color: transparent;
}
</style>

<style lang="scss">
.swal2-html-container {
  .modal-cont-inner {
    .modal-title-wrap {
      .title {
        margin: -30px -1.2em 15px -1.2em;
        padding-bottom: 15px;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.4;
        transform: skew(0.2deg);

        span {
          color: #3867c6;
          font-weight: bold;
        }
      }

      .ori {
        margin: 0 0 15px 0;
        padding-bottom: none;
        font-weight: 700;
        border-bottom: none;
      }

      p {
        font-size: 15px;
        line-height: 150%;
        transform: skew(0.2deg);
        color: #2e2e2e;
        margin-bottom: 8px;
      }

      input[type=radio] + label {
        position: relative;
        display: inline-block;
        cursor: pointer;
        font-size: 0;
        line-height: 24px;
        vertical-align: middle;
      }

      input[type=radio] + label span {
        display: inline-block;
        position: relative;
        line-height: 24px;
        margin: 0 0 0 6px;
        vertical-align: middle;
        font-size: 14px;
        color: #000;
        transform: skew(0.2deg);
      }
    }

    .input-radio-wrap.n {
      padding: 0 2%;
    }
    .input-radio-wrap.n ul.input-list {
      width: 100%;
      padding: 5%;
      background: #f6f6f6;
      border-radius: 8px;
    }
    .input-radio-wrap.n ul.input-list li {
      width: 100%;
      text-align: left;
      line-height: 40px;
    }
    .input-radio-wrap label {
      margin: 0 15px;
    }
  }
}
</style>
<style lang="scss" scoped>
.swal2-html-container .bolder-text {
  font-size: inherit;
  font-weight: bolder;
}
.modal-board-editor .contents-wrap .input-box-wrap.input-title {
  position: relative;
}
.modal-board-editor .contents-wrap .input-box-wrap.input-title .info-video-message {
	position: absolute;
  bottom: -30px;
  right: 75px;
  width: auto;
  height: auto;
  background: #959595;
  border-radius: 8px;
  text-align: center;
  color: #fff;
  font-size: 11px;
  font-weight: 400;
  padding: 5px;
  z-index: 9999;
  animation: showout 1s ease-in-out 5s 1;
  animation-fill-mode: forwards;
}

.modal-board-editor .contents-wrap .input-box-wrap.input-title .info-video-message:after {
  content: '';
	position: absolute;
	left: 0;
	top: 50%;
	width: 0;
	height: 0;
	border: 10px solid transparent;
	border-right-color: #959595;
	border-left: 0;
	border-bottom: 0;
	margin-top: -4px;
	margin-left: -10px;
}
.heading{
  .secret{
    padding-left:25px;
    &::before{
      width: 24px;
      height: 24px;
      top: 5px;
    }
  }
}
.profile-list{
  position: absolute;
  top: 62px;
  right: 20px;
  width: 300px;
  background: var(--primary-01);
  border: 1px solid var(--gray-06);
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  z-index: 1;
  font-size:14px;
  padding: 12px 0;
  max-height:460px;
  .profile-list-item{
    padding: 12px 15px;
  }
  .profile-list-item + .profile-list-item{
    border: 0;
    .txt-area{
      align-items: center;
    }
  }
}

.info-box-privacy{
  display: flex;
  padding: 20px;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  background: #FFF2E1;
  margin-top: 20px;
  .title{
    color:#1D1D1D;
    font-size: 16px;
    font-weight: 700;
    line-height: 150%; 
  }
  .message{
    color: #1D1D1D;
    font-size: 14px;
    font-weight: 400;
    line-height: 160%;
    align-self: stretch;
  }
}

@keyframes showout {
  0% {
        opacity: 1;
    }
    25% {
        opacity: 0.75;
    }
    50% {
        opacity: 0.5;
    }
    75% {
        opacity: 0.25;
    }
    100% {
        opacity: 0;
    }
}
</style>