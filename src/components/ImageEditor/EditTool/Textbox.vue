<template>
  <div class="section-wrap text" :class="{'on': editMode.text}">
    <div class="area">
      <p class="title">텍스트</p>
      <div class="action-wrap text">
        <div class="action">
          <div class="action__btn-wrap">
            <button class="type01" @click="addText"><i class="edit-plus16"></i>텍스트 추가</button>
          </div>
        </div>
      </div>
    </div>

    <div class="area">
      <p class="title">글자색</p>
      <div class="action-wrap color">
        <div
            class="action"
            :class="{'on': color === code}"
            @click="setTextOption({key: 'setColor', value: code})"
            v-for="{ name, code } of colorList"
            :key="`text-color-${code}`"
        >
          <span class="icon" :class="name"></span>
        </div>
      </div>
    </div>

    <div class="area">
      <p class="title">배경색</p>
      <div class="action-wrap color bg">
        <div
            class="action"
            :class="{'on': backgroundColor === code}"
            @click="setTextOption({key: 'setBackgroundColor', value: code})"
            v-for="{ name, code } of backgroundColorList"
            :key="`text-background-color-${code}`"
        >
          <span class="icon" :class="name"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "image-editor-textbox",
  props: {
    imageEditor: {
      type: Object
    },
    editMode: {
      type: Object
    },
    editOption: {
      type: Object
    },
    isShowToastMsg: {
      type: Boolean
    }
  },
  computed: {
    colorList() {
      return this.imageEditor ? this.imageEditor._toolOption.colorList : []
    },
    backgroundColorList() {
      return this.imageEditor ? this.imageEditor._toolOption.backgroundColorList : []
    },
    textBoxCount() {
      return this.imageEditor ? this.imageEditor._tools.textbox.getTextBoxCount() : 0
    },
    color() {
      return this.imageEditor ? this.imageEditor._tools.textbox.getColor() : '#FFFFFF'
    },
    backgroundColor() {
      return this.imageEditor ? this.imageEditor._tools.textbox.getBackgroundColor() : 'transparent'
    }
  },
  methods: {
    addText() {
      if (this.textBoxCount < 50) {
        this.imageEditor._tools.textbox.addText()
      } else {
        if (!this.isShowToastMsg) {
          this.$emit('setCurToastMsgType', 'limitTextbox')
          setTimeout(() => {
            this.$emit('setCurToastMsgType', '')
          }, 1200)
        }
      }
    },
    setTextOption(option) {
      this.imageEditor._tools.textbox[option.key](option.value)
      this.imageEditor._tools.textbox.changeColor()
    },
  },
  watch: {
    'textBoxCount'() {
      if (!this.editOption.textbox.isChange) {
        this.$emit('setTextboxIsChange', true)
      }
    }
  }
}
</script>

<style scoped>

</style>