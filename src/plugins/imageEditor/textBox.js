import {fabric} from "fabric";

class TextBox {
  constructor(imageEditor) {
    this.imageEditor = imageEditor
    this.canvas = imageEditor.canvas
    this.textBoxCount = 0
    this.color = '#FFFFFF'
    this.backgroundColor = 'transparent'
    this.autoCursor = true
  }

  addText() {
    const imageEditor = this.imageEditor
    let shadow = new fabric.Shadow({
      color: 'rgba(0, 0, 0, 0.12)',
      blur: 10
    })

    const textbox = new fabric.IText('텍스트를 입력하세요', {
      width: imageEditor.getCanvasSize().width / imageEditor.baseSize * 300,
      textAlign: 'center',
      fontSize: imageEditor.getCanvasSize().width / imageEditor.baseSize * 30,
      fontFamily: 'Pretendard Variable',
      fontWeight: 'bold',
      backgroundColor: this.backgroundColor,
      fill: this.color,
      shadow: shadow,
      type: 'textbox',
      ...imageEditor.selectionStyle,
      padding: 0
    })

    textbox.setControlsVisibility(imageEditor.visibleOption)
    textbox.controls.deleteControl.visible = true
    textbox.controls.rotateControl.visible = true
    textbox.set({
      width: textbox.measureLine(0).width + 2
    })
    this.bindTextboxEvent(textbox)
    this.canvas.add(textbox).centerObject(textbox).setActiveObject(textbox)
  }

  bindTextboxEvent(textbox) {
    const textboxClass = this

    textbox.on('object:selected', () => {
      textboxClass.autoCursor = true
      textboxClass.setTextboxCursor(textbox, textbox.text.length)
    })
    textbox.on('selection:changed', () => {
      const cursorIndex = textbox.selectionStart
      textboxClass.autoCursor = cursorIndex === textbox.text.length
    })
    textbox.on('changed', function() {
      textboxClass.changeText(textbox)
    })
  }

  changeText(textbox) {
    if (textbox.text.length > 60) {
      let text = textbox.text.substring(0, 60)
      textbox.set({
        text: text
      })

      textbox.hiddenTextarea.value = text;

      if (this.autoCursor) {
        this.setTextboxCursor(textbox, text.length)
      }
      this.canvas.renderAll()
    }

    // width 자동 늘리기
    let lines = _.chunk(textbox.text.split('\n')).map(arr => arr.join(''))
    let textWidthArr = []
    lines.forEach((line, idx) => {
      let count = line.split(' ').length - 1
      let width = textbox.measureLine(idx).width
      textWidthArr.push(width)
    })

    if (textWidthArr.length > 0) {
      textbox.set({
        width: Math.max(...textWidthArr)
      })
    }

    this.canvas.renderAll()
  }

  setTextboxCursor(textbox, length) {
    textbox.setSelectionStart(length)
    textbox.setSelectionEnd(length)
  }

  initColor() {
    this.setColor('#FFFFFF')
    this.setBackgroundColor('transparent')
  }

  changeColor() {
    if (!this.imageEditor.canvas.getActiveObject()) return

    const textbox = this.imageEditor.canvas.getActiveObject()
    if (textbox.type === 'textbox') {
      textbox.set('fill', this.color)
      textbox.set('backgroundColor', this.backgroundColor)
      this.canvas.renderAll()
    }
  }

  /**
   * getter, setter =======================================
   */
  getTextBoxCount() {
    return this.textBoxCount
  }
  setTextBoxCount() {
    this.textBoxCount = this.canvas.getObjects().filter(obj => obj.type === 'textbox').length
  }

  getColor() {
    return this.color
  }
  setColor(color) {
    this.color = color
  }

  getBackgroundColor() {
    return this.backgroundColor
  }
  setBackgroundColor(backgroundColor) {
    this.backgroundColor = backgroundColor
  }
}

export default TextBox