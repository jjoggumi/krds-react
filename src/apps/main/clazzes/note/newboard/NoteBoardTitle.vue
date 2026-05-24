<template>
  <fragment>
    <note-board-title-top
      :option="option"
      :items="items"
      :board="board"
      :model="model"
      :subComponent="subComponent"
      :isSendComplete="isSendComplete"
      :isReserve="isReserve"
      :isNoteOptionReadOnly="isNoteOptionReadOnly"
      :isSelectedReserve="isSelectedReserve"
      :clazzSettingPushTarget="clazzSettingPushTarget"
    />

    <note-board-title-bottom
      :option="option"
      :items="items"
      :boardId="boardId"
      :isUsedFolder="isUsedFolder"
      :model="model"
      :subComponent="subComponent"
      :addedFiles="addedFiles"
    />
  </fragment>
</template>

<script>
import NoteBoardTitleTop from './NoteBoardTitleTop'
import NoteBoardTitleBottom from './NoteBoardTitleBottom'

export default {
  name: 'note-board-title',
  components: {
    NoteBoardTitleTop,
    NoteBoardTitleBottom
  },
  props: {
    board: {
      type: Object,
      required: true
    },
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
    isSendComplete: {
      type: Boolean,
      required: true
    },
    isReserve: {
      type: Boolean,
      required: true
    },
    isNoteOptionReadOnly: {
      type: Boolean,
      required: true
    },
    isSelectedReserve: {
      type: Boolean,
      default: false
    },
    isUsedFolder: {
      type: Boolean,
      default: false
    },
    clazzSettingPushTarget: {
      type: String
    },
    boardId: {
      type: String
    },
    addedFiles: {
      type: Array
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped></style>
