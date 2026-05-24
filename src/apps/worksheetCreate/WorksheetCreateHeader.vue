<template>
  <div class="worksheet-header">
    <h1 class="title">우리학교 양식 등록하기</h1>
    <div class="left">
    </div>
    <div class="right">
      <template v-if="isShowTemporaryButton">
        <button
          class="btn-bg-w2"
          :class="{
            dis: !isReadyCreate
          }"
          :disabled="!isReadyCreate"
          @click="onClickNext"
        >
          다음
        </button>
      </template>
      <button
        class="btn-close"
        @click="onClickClose"
      ></button>
    </div>
  </div>
</template>

<script>
export default {
  name: "worksheet-create-header",
  props: {
    mode: {
      type: String
    },
    sheetStatus: {
      type: String
    },
    isReadyCreate: {
      type: Boolean
    }
  },
  computed: {
    isCreateMode() {
      return this.mode === 'create'
    },
    isEditMode() {
      return this.mode === 'edit'
    },
    isPreviewMode() {
      return this.mode === 'preview'
    },
    isShowTemporaryButton() {
      return this.sheetStatus === 'TEMP'
    },
  },
  methods: {
    onClickNext() {
      this.$emit('is-click-next')
    },
    onClickClose() {
      this.$hiClass.confirm('작성 중인 내용이 있습니다.<br>저장하지 않고 돌아가시겠습니까?')
        .then(() => {
          this.$router.push(`/main/clazzes/${this.$route.params.parentId}/form`)
        })
    }
  }
}
</script>

<style></style>