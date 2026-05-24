import {fabric} from "fabric";

class Rotate {
  constructor(imageEditor) {
    this.imageEditor = imageEditor
    this.canvas = imageEditor.canvas
    this.isChange = false
  }

  rotate() {
    if (!this.getIsChange()) {
      this.setIsChange(true)
    }

    let angle = parseInt(this.imageEditor.backgroundImage.angle) + 90
    angle = angle === 360 ? 0 : angle

    const index = angle / 90
    const cursorStyleArr = ['nw-resize', 'sw-resize', 'se-resize', 'ne-resize']
    const coords = ['tl', 'tr', 'br', 'bl']

    for (let i = 0; i < coords.length; i++) {
      fabric.Rect.prototype.controls[coords[i]].cursorStyle = i + index < coords.length ?
        cursorStyleArr[i + index] :
        cursorStyleArr[i + index - coords.length]
    }

    const { width, height } = this.imageEditor.backgroundImage
    const { tl } = this.imageEditor._tools.cropTarget.cropTarget.aCoords

    let left = 0
    let top = 0
    let cropTargetLeft = 0
    let cropTargetTop = 0

    if (angle === 0 || angle === 180) {
      this.imageEditor.canvasResize(width, height)
      cropTargetTop = tl.x
      cropTargetLeft = width - tl.y
    } else {
      this.imageEditor.canvasResize(height, width)
      cropTargetTop = tl.x
      cropTargetLeft = height - tl.y
    }

    if (angle === 90) {
      left = this.imageEditor.backgroundImage.height
    } else if (angle === 180) {
      left = this.imageEditor.backgroundImage.width
      top = this.imageEditor.backgroundImage.height
    } else if (angle === 270) {
      top = this.imageEditor.backgroundImage.width
    }

    this.imageEditor._tools.cropTarget.cropTarget
      .set({angle: angle, top: cropTargetTop, left: cropTargetLeft})
      .setCoords()
    this.imageEditor.backgroundImage
      .set({angle: angle, left, top})
      .setCoords()
    this.canvas.renderAll()
  }

  resetRotate() {
    this.setIsChange(false)

    this.imageEditor.backgroundImage
      .set({angle: 0, left: 0, top: 0})
      .setCoords()

    const { width, height } = this.imageEditor.backgroundImage
    this.imageEditor.canvasResize(width, height)

    this.canvas.renderAll()
  }

  /**
   * getter, setter =======================================
   */
  getIsChange() {
    return this.isChange
  }
  setIsChange(isChange) {
    this.isChange = isChange
  }

}

export default Rotate