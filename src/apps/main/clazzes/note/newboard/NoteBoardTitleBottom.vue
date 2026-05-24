<template>
  <div class="title-btm-wrap clfix">
    <div class="left-wrap">
      <span v-if="folderList.length > 0 && isUsedFolder">폴더</span>
      <hi-select-box
        v-if="folderList.length > 0 && isUsedFolder"
        :value.sync="folderValue"
        :default-value="defaultValue"
        :items="folderList"
      />
      <!-- 필독 checkbox -->
      <div class="checkbox-wrap">
        <!-- 필독 수정 가능하게 수정 20200602
            <input
            type="checkbox"
            id="note-popup-necessary-read-check"
            v-model="model.postMustRead"
            :class="{ dis: isNoteOptionReadOnly }"
            :disabled="isNoteOptionReadOnly"
          /> -->
        <input
          type="checkbox"
          id="note-popup-necessary-read-check"
          v-model="model.postMustRead"
          @change="triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.note.blackboard.mustRead' })"
        />
        <label for="note-popup-necessary-read-check"><span>필독</span></label>
      </div>

      <!-- version 2 : 상단공지 checkbox -->
      <div
        v-if="model.version === 'V2'"
        class="checkbox-wrap"
      >
        <input
          type="checkbox"
          id="note-popup-post-pin-check"
          v-model="model.postPin"
          @change="triggerAnalyticsLogEvent({ code: 'analytics.class.click.button.note.blackboard.pin' })"
        />
        <label for="note-popup-post-pin-check"><span>상단공지</span></label>
      </div>

      <!-- version 1 : font change -->
      <template
        v-if="model.version === null || model.version === 'null' || model.version === 'V1'"
      >
        <!-- fontName selectbox -->
        <hc-select
          :model.sync="edit.fontName"
          selectLabel="value"
          selectValue="key"
          :item="storeEditorV1.fontNames"
          @is-click="changeFontName"
        />

        <!-- fontSize selectbox -->
        <hc-select
          :model.sync="edit.fontSize"
          selectLabel="key"
          selectValue="key"
          :item="storeEditorV1.fontSizes"
          @is-click="changeFontSize"
        />
      </template>
    </div>

    <div class="right-wrap">
      <!-- 묶음 사진 관리 -->
      <button
        v-if="model.version === 'V2'"
        class="group-photo-btn btn-bg-w icon"
        :class="{ dis: option.isUpload }"
        @click="handleNoteboardImagePack"
      >
        <span>묶음 사진 관리 ({{ imagePackFiles.length }}장)</span>
        <span class="guide-text"><span>최대 100장까지 한번에 첨부 가능</span></span>
      </button>

      <!-- 첨부파일 / 주간학습계획 업로드 -->
      <component
        :is="noteUpload"
        :files.sync="model.files"
        :isUpload.sync="option.isUpload"
        :addedFiles="addedFiles"
      />

      <!-- 자주 쓰는 문구 -->
      <button
        @click="openOftenComponent"
        class="often-use-phrases-btn btn-bg-w icon"
      >
        <span>자주 쓰는 문구</span>
      </button>

      <!-- 주의집중 -->
      <hc-noti-sound />

      <!-- 자주 쓰는 문구 레이어 팝업 -->
      <component
        v-bind:is="editMode('oftenComponent')"
        ref="oftenComponent"
        :userId="items.user.userID"
        v-click-outside="closeOftenComponent"
        @close="closeOftenComponent"
        @is-click="setPhrases"
      />
    </div>
  </div>
</template>

<script>
import { eventBus } from '@/main'

import HcSelect from '@/components/Form/HcSelect'
import NoteUploadV1 from '@/components/Upload/Note/NoteUpload'
import NoteUploadV2 from '@/components/Upload/Note/NoteUploadV2'
import HcNotiSound from '@/components/Form/HcSelectNotiSound'
import {mapFields} from "vuex-map-fields";

import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import {mapActions} from "vuex";
import HiSelectBox from "@/components/Form/HiSelectBox";

const NoteBoardOften = () => ({
  component: import('./subcomponents/NoteBoardOften'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'note-board-title-bottom',
  components: {
    HcSelect,
    HiSelectBox,
    NoteUploadV1,
    NoteUploadV2,
    HcNotiSound,
    NoteBoardOften,
  },
  props: {
    option: {
      type: Object,
      required: true
    },
    items: {
      type: Object,
      required: true
    },
    model: {
      type: Object,
      required: true
    },
    subComponent: {
      type: Object,
      required: true
    },
    boardId: {
      type: String
    },
    isUsedFolder: {
      type: Boolean,
      default: false
    },
    addedFiles: {
      type: Array
    }
  },
  data() {
    return {
      defaultValue: '',
      folderValue: '',
      folderList: [],
      folderValueFirst: true
    }
  },
  watch: {
    boardId: {
      deep: true,
      handler(v) {
        if(v) {
          this.setFolders(v)
        } else {
          this.folderList = []
        }
      }
    },
    model: {
      deep: true,
      handler(v) {
        if(v.pushUsed && v.folderId && this.folderValueFirst) {
          this.folderValue = v.folderId
          this.folderValueFirst = false
        }
      }
    },
    folderValue: {
      deep: true,
      handler(v) {
        eventBus.$emit('note-board-change-folderId', v)
      }
    }
  },
  computed: {
    ...mapFields([
      'noteBoardImagePack'
    ]),
    ...mapFields('storeEditor', {
      edit: 'edit',
      storeEditorConfig: 'config',
      storeEditorV1: 'V1',
    }),
    editMode() {
      return mode => {
        return this.subComponent[mode] || ''
      }
    },
    noteUpload() {
      return `noteUpload${this.model.version}`
    },
    imagePackFiles() {
      return this.model.files.filter(f => {
        return f.fileContentType && f.fileContentType.startsWith('image') && f.fileFlag === 'IMAGE_PACK'
      }) || []
    },
  },
  created() {
    this.edit.fontName = localStorage.fontFamily || 'Gulim'
    this.edit.fontSize = parseInt(localStorage.fontSize || 100, 10)
  },
  mounted() {
    eventBus.$on('note-board-change-class', () => {
      this.items.folderId = null
    })
    if(this.items.folderId) this.folderValue = this.items.folderId
    eventBus.$on('note-board-change-posted', item => {
      this.folderValue = item.folder.folderId
    })
  },
  beforeDestroy() {
    eventBus.$off('note-board-change-posted')
    eventBus.$off('note-board-change-class')
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeBoard', {
      getFolderList: 'getFolderList'
    }),
    setFolders(boardId) {
      this.folderValue = ''
      this.folderList = []
      this.defaultValue = ''
      this.getFolderList({boardId}).then(res => {
        let list = []
        res.boardFolders.forEach(folder => {
          folder.value = folder.folderId
          folder.title = folder.folderName
          list.push(folder)
        })
        this.folderList = list
        this.defaultValue = this.items.folderId ? this.items.folderId : list[0].value
      })
    },
    changeFontName() {
      localStorage.setItem('fontFamily', this.edit.fontName)
      eventBus.$emit('editor-set-font-name', this.edit.fontName)
    },
    changeFontSize() {
      localStorage.setItem('fontSize', this.edit.fontSize)
      eventBus.$emit('editor-set-font-size', this.edit.fontSize)
    },
    openOftenComponent() {
      this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.note.blackboard.phrases` })

      this.subComponent.oftenComponent = ''
      this.$nextTick(() => {
        this.subComponent.oftenComponent = 'NoteBoardOften'
      })
    },
    closeOftenComponent() {
      this.subComponent.oftenComponent = ''
    },
    setPhrases(phrases) {
      eventBus.$emit('editor-insert-content', phrases.content)

      // 문구 붙히기 이후 에디터 포커스 없애기 위해 문구팝업에 포커스 세팅
      this.$refs.oftenComponent.focus()
    },
    handleNoteboardImagePack(toggleValue) {
      if (!this.option.isUpload) {
        this.triggerAnalyticsLogEvent({ code: `analytics.class.click.button.note.blackboard.imagePackFile` })
        this.noteBoardImagePack.isOpen = toggleValue || !this.noteBoardImagePack.isOpen
      }
    },
  }
}
</script>

<style scoped></style>
