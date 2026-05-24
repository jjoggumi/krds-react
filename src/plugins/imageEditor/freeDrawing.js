import {fabric} from "fabric";

class FreeDrawing {
  constructor(imageEditor) {
    this.imageEditor = imageEditor
    this.canvas = imageEditor.canvas
    this.drawHistory = []
    this.isEraserMode = false
  }

  setDrawingMode(drawOption) {
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas)
    this.canvas.freeDrawingBrush.width = drawOption.brushSize
    this.canvas.freeDrawingBrush.color = drawOption.brushColor
    this.canvas.freeDrawingBrush.type = 'draw'
    this.canvas.isDrawingMode = true
  }

  setBrushColor(color) {
    this.canvas.freeDrawingBrush.color = color
  }

  setBrushSize(size) {
    size = this.imageEditor.getCanvasSize().width / this.imageEditor.baseSize * size
    this.canvas.freeDrawingBrush.width = parseInt(size, 10)
  }

  hasPath() {
    return this.canvas.getObjects().filter(obj => obj.path).length > 0
  }

  undoDraw() {
    const drawObjects = this.canvas.getObjects().filter(obj => obj.stroke)
    if (drawObjects.length > 0) {
      const lastObj = drawObjects.pop()
      this.canvas.remove(lastObj)
      this.canvas.renderAll()
      return lastObj
    } else {
      return {}
    }
  }

  redoDraw(lastObj) {
    this.canvas.add(lastObj)
    this.canvas.renderAll()
  }

  removeDraw(drawObj) {
    this.canvas.remove(drawObj)
    this.canvas.renderAll()
  }

  /**
   * getter, setter =======================================
   */
  getDrawHistory() {
    return this.drawHistory
  }
  appendDrawHistory(path) {
    this.drawHistory.push(path)
  }
  resetDrawHistory() {
    this.drawHistory = []
  }

  getIsEraserMode() {
    return this.isEraserMode
  }
  setIsEraserMode(flag) {
    this.isEraserMode = flag
  }
}

export default FreeDrawing