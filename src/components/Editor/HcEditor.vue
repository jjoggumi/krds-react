<!--
@File(Method): HcEditor.vue
@Description: 게시글 에디터
@Modified: 2025-06-16 - #74648 URL 인식 정책 변경 및 실시간 TLD 목록 적용
-->

<template>
  <component
    :is="componentName"
    :key="`${componentName}-${editorComponentKey}`"
    :model="model"
    :type="type"
    :addedFiles="addedFiles"
    :tlds="tlds"
  />
</template>

<script>
import HcEditorFroalaV1 from './HcEditorFroala'
import HcEditorFroalaV2 from './HcEditorFroalaV2'
import {mapFields} from "vuex-map-fields";

export default {
  name: 'hc-editor',
  components: {
    HcEditorFroalaV1,
    HcEditorFroalaV2,
  },
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
      type: Array
    }
  },
  data() {
    return {
      isShowEditor: true,
    }
  },
  computed: {
    ...mapFields('storeEditor', {
      editorComponentKey: 'editorComponentKey',
    }),
    componentName() {
      return `HcEditorFroala${this.model.version}` || 'HcEditorFroalaV1'
    }
  },
  watch: {
    'model.version'() {
      this.setVersion()
    }
  },
  created() {
    this.setVersion()
  },
  mounted() {},
  destroyed() {
    // 에디터 사용 종료 후에도 남아있는 컨테이너 제거
    const tuiContainers = document.querySelectorAll('#tuiContainer')
    if (tuiContainers && tuiContainers.length > 0) {
      tuiContainers.forEach(t => t.remove())
    }
  },
  methods: {
    setVersion() {
      if (this.model.version === null || this.model.version === 'null' || this.model.version === '')
        this.model.version = 'V1'
    }
  }
}
</script>

<style></style>
