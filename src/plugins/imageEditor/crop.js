class Crop {
  constructor(imageEditor) {
    this.imageEditor = imageEditor
    this.canvas = imageEditor.canvas
    this.isChange = false
  }

  async setCrop() {
    return new Promise((resolve, reject) => {
      const angle = this.imageEditor._tools.cropTarget.cropTarget.angle
      const { tl, tr, bl, br } = this.imageEditor._tools.cropTarget.cropTarget.aCoords
      let top, left, width, height = 0

      if (angle === 0) {
        top = tl.y
        left = tl.x
        width = tr.x - tl.x
        height = bl.y - tl.y

      } else if (angle === 90) {
        top = bl.y
        left = bl.x
        width = tl.x - bl.x
        height = br.y - bl.y

      } else if (angle === 180) {
        top = br.y
        left = br.x
        width = bl.x - br.x
        height = tr.y - br.y

      } else if (angle === 270) {
        top = tr.y
        left = tr.x
        width = br.x - tr.x
        height = tl.y - tr.y
      }

      this.imageEditor._tools.cropTarget.deleteCropTarget()

      let croppedSrc = this.canvas.toDataURL({
        format: 'png',
        top,
        left,
        width,
        height
      })

      resolve(croppedSrc)
    })
  }

  resetCrop() {
    this.setIsChange(false)

    this.imageEditor._tools.cropTarget.cropTarget
      .set({angle: 0, top: 0, left: 0})
      .setCoords()

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

export default Crop