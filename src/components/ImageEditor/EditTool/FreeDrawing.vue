<template>
  <div class="section-wrap painting" :class="{'on': editMode.draw}">
    <div class="area range">
      <p class="title">굵기<input class="num" type="number" id="input-range-step" :value="editOption.draw.brushSize ? editOption.draw.brushSize : null" @input="setBrushSize($event)"/></p>
      <div class="action-wrap">
        <input type="range" min="1" max="50" step="1" value="1" :value="editOption.draw.brushSize ? editOption.draw.brushSize : 0" @input="setBrushSize($event)"/>
      </div>
    </div>

    <div class="area">
      <p class="title">색상</p>
      <div class="action-wrap color">
        <div
            class="action"
            :class="{'on': editOption.draw.brushColor === code}"
            @click="selectBrushColor(code)"
            v-for="{ name, code } of colorList"
            :key="`text-color-${code}`"
        >
          <span class="icon" :class="name"></span>
        </div>
      </div>
    </div>

    <div class="area">
      <div class="action-wrap text">
        <div class="action">
          <div class="action__btn-wrap">
            <button class="type01" @click="removeDraw"><i class="edit-eraser16"></i>지우개</button>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-wrap">
      <button
          @click="undoDraw"
          :class="{'color-type01': !hasPath}"
      >
        <i class="edit-arrow-undo16" :class="{'on': hasPath, 'off': !hasPath}"></i>취소
      </button>
      <button
          @click="redoDraw"
          :class="{'color-type01': !hasHistory}"
      >
        <i class="edit-arrow-redo16" :class="{'on': hasHistory, 'off': !hasHistory}"></i>되돌리기
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "image-editor-free-drawing",
  props: {
    imageEditor: {
      type: Object
    },
    editMode: {
      type: Object
    },
    editOption: {
      type: Object
    }
  },
  computed: {
    colorList() {
      return this.imageEditor ? this.imageEditor._toolOption.colorList : []
    },
    hasPath() {
      return this.imageEditor ? this.imageEditor._tools.freeDrawing.hasPath() : false
    },
    hasHistory() {
      return this.imageEditor ? this.imageEditor._tools.freeDrawing.getDrawHistory().length > 0 : false
    },
    isEraserMode() {
      return this.imageEditor ? this.imageEditor._tools.freeDrawing.getIsEraserMode() : false
    }
  },
  methods: {
    selectBrushColor(color) {
      if (this.isEraserMode) {
        this.imageEditor._tools.freeDrawing.setIsEraserMode(false)
        this.imageEditor._tools.freeDrawing.setDrawingMode(this.editOption.draw)
      }
      this.setBrushColor(color)
    },
    setBrushColor(color) {
      this.editOption.draw.brushColor = color
      this.imageEditor._tools.freeDrawing.setBrushColor(color)
    },
    setBrushSize(e) {
      let brushSize = e.target.value
      if (brushSize === '') {
        e.target.value = ''
        brushSize = ''
      } else if (parseInt(e.target.value) === 0 || parseInt(e.target.value) > 50) {
        e.target.value = 10
        brushSize = 10
      }

      this.editOption.draw.brushSize = isNaN(parseInt(brushSize)) ? null : parseInt(brushSize)
      this.imageEditor._tools.freeDrawing.setBrushSize(brushSize)

      const rangeEl = document.querySelector("input[type='range']")
      const rangeValue = brushSize - rangeEl.min
      const progress = (rangeValue / (rangeEl.max - rangeEl.min)) * 100
      rangeEl.style.background = `linear-gradient(to right, #4778DE ${progress}%, #414141 ${progress}%)`
    },
    removeDraw() {
      this.setBrushColor('')
      this.imageEditor.setSelectMode()
      this.imageEditor._tools.freeDrawing.setIsEraserMode(true)
    },
    undoDraw() {
      const lastObj = this.imageEditor._tools.freeDrawing.undoDraw()
      if (Object.keys(lastObj).length > 0) {
        this.imageEditor._tools.freeDrawing.appendDrawHistory(lastObj)
      }
    },
    redoDraw() {
      const drawHistory = this.imageEditor._tools.freeDrawing.getDrawHistory()
      if (drawHistory.length > 0) {
        const lastObj = drawHistory.pop()
        this.imageEditor._tools.freeDrawing.redoDraw(lastObj)
      }
    }
  },
  watch: {
    hasPath(newVal) {
      if (newVal) {
        this.$emit('setDrawIsChange', true)
      }
    }
  }
}
</script>

<style scoped>

</style>