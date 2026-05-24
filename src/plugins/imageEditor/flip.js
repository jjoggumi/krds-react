class Flip {
  constructor(imageEditor) {
    this.imageEditor = imageEditor
    this.canvas = imageEditor.canvas
    this.isChange = false
  }

  flip(type) {
    if (!this.getIsChange()) {
      this.setIsChange(true)
    }

    const flipType = `flip${type}`
    this.imageEditor.backgroundImage
      .set({ [flipType]: !this.imageEditor.backgroundImage[flipType] })
      .setCoords()

    this.canvas.renderAll()
  }

  resetFlip() {
    this.setIsChange(false)

    this.imageEditor.backgroundImage
      .set({flipX: false, flipY: false})
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

export default Flip