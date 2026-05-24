import {fabric} from "fabric"
import Crop from "@/plugins/imageEditor/crop"
import Rotate from "@/plugins/imageEditor/rotate"
import Flip from "@/plugins/imageEditor/flip"
import Sticker from "@/plugins/imageEditor/sticker"
import TextBox from "@/plugins/imageEditor/textBox"
import FreeDrawing from "@/plugins/imageEditor/freeDrawing"
import CropTarget from "@/plugins/imageEditor/cropTarget"

class ImageEditor {
  constructor() {
    this.canvas = this.setCanvasElement()
    this.canvasSize = {
      width: 0,
      height: 0
    }
    this.backgroundImage = null
    this.isZoom = false
    this.isOriginalSize = true
    this.selectionStyle = {
      transparentCorners : false,
      borderColor : '#FFFFFF',
      borderScaleFactor: 1,
      cornerColor : '#000000',
      cornerSize: 15,
      cornerStrokeColor : '#FFFFFF',
      lockScalingFlip : true,
      padding : 5
    }
    this.visibleOption = {
      mtr: false,
      tr: false
    }
    this.baseSize = 500 // 이미지 해상도별 요소 사이즈 조절을 위한 기준 width
    this.originalControls = null
    this.deleteIcon = null

    this._listeners = {
      selection: this.objectSelect.bind(this),
      selectionCleared: this.objectSelectCleared.bind(this),
      objectAdded: this.objectAdded.bind(this),
      objectRemoved: this.objectRemoved.bind(this),
      pathCreated: this.pathCreated.bind(this),
      mouseMove: this.mouseMove.bind(this)
    }

    this._tools = {
      crop: new Crop(this),
      cropTarget: new CropTarget(this),
      rotate: new Rotate(this),
      flip: new Flip(this),
      sticker: new Sticker(this),
      textbox: new TextBox(this),
      freeDrawing: new FreeDrawing(this)
    }

    this._toolOption = {
      colorList: [
        {
          name: 'white',
          code: '#FFFFFF'
        },
        {
          name: 'black',
          code: '#000000'
        },
        {
          name: 'red',
          code: '#FF0000'
        },
        {
          name: 'orange',
          code: '#FE6B02'
        },
        {
          name: 'yellow',
          code: '#FEB800'
        },
        {
          name: 'green',
          code: '#10C623'
        },
        {
          name: 'blue',
          code: '#066AFE'
        },
        {
          name: 'purple',
          code: '#BE00FF'
        },
      ],
      backgroundColorList: [
        {
          name: 'transparent',
          code: 'transparent'
        },
        {
          name: 'bluesky',
          code: '#68CCFE'
        },
        {
          name: 'orange2',
          code: '#FE7C3E'
        },
        {
          name: 'yellow',
          code: '#FEB800'
        },
        {
          name: 'yellowgreen',
          code: '#77E050'
        },
        {
          name: 'pink',
          code: '#FF6D82'
        },
        {
          name: 'gray',
          code: '#8D8D8D'
        }
      ]
    }

    this.setDeleteIcon()
    this.customizeControls()
  }

  /**
   * control custom =======================================
   */
  customizeControls() {
    const imageEditor = this
    const deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      sizeX: imageEditor.selectionStyle.cornerSize * 3,
      sizeY: imageEditor.selectionStyle.cornerSize * 3,
      cursorStyle: 'pointer',
      render: imageEditor.renderDeleteIcon.bind(this),
      mouseUpHandler: imageEditor.deleteObject.bind(this),
      actionName: 'delete',
      visible: true
    })

    fabric.Image.prototype.controls.deleteControl = deleteControl
    fabric.Textbox.prototype.controls.deleteControl = deleteControl

    const rotateControl = new fabric.Control({
      x: 0.55,
      y: 0.55,
      offsetX: 15,
      offsetY: 15,
      sizeX: 40,
      sizeY: 40,
      cursorStyleHandler: imageEditor.rotateCursor.bind(this),
      render: imageEditor.renderTransparentIcon.bind(this),
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      actionName: 'rotate',
      visible: true
    })

    fabric.Image.prototype.controls.rotateControl = rotateControl
    fabric.Textbox.prototype.controls.rotateControl = rotateControl
    fabric.Path.prototype.controls.rotateControl = rotateControl

    this.originalControls = Object.assign({}, fabric.Object.prototype.controls)
  }

  setDeleteIcon() {
    const svgIcon = encodeURIComponent(`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="14" cy="14" r="14" fill="#111111"/>
                                                        <path d="M15.1498 13.9125L18.2429 10.8185C18.3265 10.7378 18.3931 10.6412 18.439 10.5345C18.4848 10.4277 18.509 10.3129 18.51 10.1967C18.511 10.0805 18.4889 9.96532 18.4449 9.85778C18.4009 9.75025 18.3359 9.65256 18.2537 9.5704C18.1716 9.48824 18.0739 9.42327 17.9664 9.37928C17.8588 9.33528 17.7436 9.31314 17.6274 9.31415C17.5112 9.31516 17.3964 9.3393 17.2897 9.38516C17.1829 9.43101 17.0864 9.49767 17.0057 9.58124L13.9117 12.6744L10.8185 9.58124C10.7378 9.49767 10.6413 9.43101 10.5345 9.38516C10.4278 9.3393 10.3129 9.31516 10.1968 9.31415C10.0806 9.31314 9.96535 9.33528 9.85782 9.37928C9.75028 9.42327 9.65259 9.48824 9.57043 9.5704C9.48827 9.65256 9.4233 9.75025 9.37931 9.85778C9.33531 9.96532 9.31317 10.0805 9.31418 10.1967C9.31519 10.3129 9.33933 10.4277 9.38519 10.5345C9.43104 10.6412 9.4977 10.7378 9.58128 10.8185L12.6744 13.9116L9.58128 17.0056C9.4977 17.0863 9.43104 17.1829 9.38519 17.2896C9.33933 17.3964 9.31519 17.5112 9.31418 17.6274C9.31317 17.7436 9.33531 17.8588 9.37931 17.9663C9.4233 18.0739 9.48827 18.1716 9.57043 18.2537C9.65259 18.3359 9.75028 18.4008 9.85782 18.4448C9.96535 18.4888 10.0806 18.511 10.1968 18.51C10.3129 18.509 10.4278 18.4848 10.5345 18.439C10.6413 18.3931 10.7378 18.3264 10.8185 18.2429L13.9117 15.1497L17.0057 18.2429C17.0864 18.3264 17.1829 18.3931 17.2897 18.439C17.3964 18.4848 17.5112 18.509 17.6274 18.51C17.7436 18.511 17.8588 18.4888 17.9664 18.4448C18.0739 18.4008 18.1716 18.3359 18.2537 18.2537C18.3359 18.1716 18.4009 18.0739 18.4449 17.9663C18.4889 17.8588 18.511 17.7436 18.51 17.6274C18.509 17.5112 18.4848 17.3964 18.439 17.2896C18.3931 17.1829 18.3265 17.0863 18.2429 17.0056L15.1498 13.9125Z" fill="#FBFBFB"/>
                                                    </svg>`)
    const rotateIcon = `data:image/svg+xml;utf8,${svgIcon}`
    this.deleteIcon = document.createElement('img');
    this.deleteIcon.src = rotateIcon
  }

  renderDeleteIcon(ctx, left, top, styleOverride, fabricObject) {
    const size = this.selectionStyle.cornerSize * 4
    ctx.save()
    ctx.translate(left, top)
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
    ctx.drawImage(this.deleteIcon, -size / 2, -size / 2, size, size)
    ctx.restore()
  }

  renderTransparentIcon(ctx, left, top, styleOverride, fabricObject) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillRect(left, top, 200, 200)
  }

  rotateCursor(eventData, control, fabricObject) {
    const imgCursor = encodeURIComponent(`
                        <svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='24' height='24'>
                          <defs>
                            <filter id='a' width='266.7%' height='156.2%' x='-75%' y='-21.9%' filterUnits='objectBoundingBox'>
                              <feOffset dy='1' in='SourceAlpha' result='shadowOffsetOuter1'/>
                              <feGaussianBlur in='shadowOffsetOuter1' result='shadowBlurOuter1' stdDeviation='1'/>
                              <feColorMatrix in='shadowBlurOuter1' result='shadowMatrixOuter1' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0'/>
                              <feMerge>
                                <feMergeNode in='shadowMatrixOuter1'/>
                                <feMergeNode in='SourceGraphic'/>
                              </feMerge>
                            </filter>
                            <path id='b' d='M1.67 12.67a7.7 7.7 0 0 0 0-9.34L0 5V0h5L3.24 1.76a9.9 9.9 0 0 1 0 12.48L5 16H0v-5l1.67 1.67z'/>
                          </defs>
                          <g fill='none' fill-rule='evenodd'><path d='M0 24V0h24v24z'/>
                            <g fill-rule='nonzero' filter='url(#a)' transform='rotate(40 0 20.25)'>
                              <use fill='#000' fill-rule='evenodd' xlink:href='#b'/>
                              <path stroke='#FFF' d='M1.6 11.9a7.21 7.21 0 0 0 0-7.8L-.5 6.2V-.5h6.7L3.9 1.8a10.4 10.4 0 0 1 0 12.4l2.3 2.3H-.5V9.8l2.1 2.1z'/>
                            </g>
                          </g>
                        </svg>`)

    return `url("data:image/svg+xml;charset=utf-8,${imgCursor}") 12 12, crosshair`
  }

  /**
   * canvas =======================================
   */
  setCanvasElement() {
    const container = document.querySelector('.image-editor-container__canvas')
    this.setCanvasSize(container.clientWidth, container.clientHeight - 120)

    return new fabric.Canvas('editCanvas', {
      width: this.getCanvasSize().width,
      height: this.getCanvasSize().height,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      uniformScaling: true,
      selection: false
    })
  }

  setBackgroundImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const imageEditor = this
      const img = new Image()
      img.src = dataUrl
      img.onload = async () => {
        const fabricImg = new fabric.Image(img)
        if (fabricImg.width && fabricImg.height) {
          this.setIsZoom(false)
          this.canvasResize(fabricImg.width, fabricImg.height, this.isZoom)
        }

        fabric.Image.fromURL(dataUrl, function(img) {
          img.scaleToWidth(imageEditor.getCanvasSize().width)
          img.scaleToHeight(imageEditor.getCanvasSize().height)
          img.set({ angle: 0, originX: 'left', originY: 'top' })

          if (imageEditor.backgroundImage) {
            imageEditor.canvas.remove(imageEditor.backgroundImage)
          }
          imageEditor.backgroundImage = img

          imageEditor.canvas.add(img)
          imageEditor.canvas.sendToBack(img)
          imageEditor.canvas.renderAll()

          resolve(true)
        }, {crossOrigin: 'anonymous', selectable: false, type: 'backgroundImage'})
      }
      img.onerror = error => {
        reject(false)
      }
    })
  }

  canvasResize (w, h, isZoom) {
    let wrapHeight = document.querySelector('.image-select').clientHeight - 60
    let width, height

    if (isZoom) {
      width = w
      height = h
    } else {
      if (h > wrapHeight) {
        width = wrapHeight / h * w
        height = wrapHeight
      } else {
        width = w
        height = h
      }
    }

    const size = w > h ? w : h
    const desiredCornerSize = 5
    const scaleFactor = size / this.baseSize
    this.selectionStyle.cornerSize = desiredCornerSize * scaleFactor
    this.selectionStyle.borderScaleFactor = Math.floor(scaleFactor)

    this.setCanvasSize(w, h)
    this.setIsOriginalSize(w === width && h === height && !isZoom)

    this.canvas.setWidth(w)
    this.canvas.setHeight(h)
    this.canvasMaxWidth(width, height)
  }

  canvasMaxWidth (width, height) {
    document.querySelector(`.lower-canvas`).style.maxWidth = width + 'px'
    document.querySelector(`.lower-canvas`).style.maxHeight = height + 'px'
    document.querySelector(`.upper-canvas`).style.maxWidth = width + 'px'
    document.querySelector(`.upper-canvas`).style.maxHeight = height + 'px'
    document.querySelector(`.canvas-container`).style.maxWidth = width + 'px'
    document.querySelector(`.canvas-container`).style.maxHeight = height + 'px'
    document.querySelector(`.image-wrap`).style.maxWidth = width + 'px'
    document.querySelector(`.image-wrap`).style.maxHeight = '100%'
  }

  zoom(dataUrl, isZoom) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = dataUrl
      img.onload = async () => {
        const fabricImg = new fabric.Image(img)
        if (fabricImg.width && fabricImg.height) {
          this.canvasResize(fabricImg.width, fabricImg.height, isZoom)
        }
        resolve(true)
      }
      img.onerror = error => {
        reject(false)
      }
    })
  }

  resetCanvas(dataUrl) {
    return new Promise(async (resolve, reject) => {
      this.canvas.clear()
      const res = await this.setBackgroundImage(dataUrl)
      if (res) {
        resolve(true)
      } else {
        reject(false)
      }
    })
  }

  getDataUrl() {
    return this.canvas.toDataURL()
  }

  getObjects() {
    return this.canvas.getObjects()
  }

  addObject(obj) {
    this.canvas.add(obj)
  }

  deleteObject(eventData, transformData) {
    this.canvas.remove(transformData.target)
  }

  setSelectMode() {
    this.canvas.isDrawingMode = false
  }

  mosaicObjectsBringToFront() {
    const mosaicObjs = this.canvas.getObjects().filter(obj => obj.type === 'mosaic' || obj.type === 'aiBlurSticker')
    if (mosaicObjs.length > 0) {
      mosaicObjs.forEach(obj => {
        this.canvas.bringToFront(obj)
      })
    }
  }

  /**
   * getter, setter =======================================
   */
  getCanvasSize() {
    return this.canvasSize
  }
  setCanvasSize(width, height) {
    this.canvasSize = {
      width,
      height
    }
  }

  getIsZoom() {
    return this.isZoom
  }
  setIsZoom(isZoom) {
    this.isZoom = isZoom
  }

  getIsOriginalSize() {
    return this.isOriginalSize
  }
  setIsOriginalSize(isOriginalSize) {
    this.isOriginalSize = isOriginalSize
  }

  /**
   * event =======================================
   */
  bindEvent() {
    const canvas = this.canvas

    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 46) { // delete key
        this.canvas.getActiveObjects().forEach(obj => {
          if (obj.type !== 'cropTarget') {
            this.canvas.remove(obj)
          }
        })
      }
    })

    canvas.on({
      'selection:created': this._listeners.selection,
      'selection:cleared': this._listeners.selectionCleared,
      'selection:updated': this._listeners.selection,
      'path:created': this._listeners.pathCreated,
      'object:added': this._listeners.objectAdded,
      'object:removed': this._listeners.objectRemoved,
      'mouse:move': this._listeners.mouseMove
    })
  }

  objectSelect({selected}) {
    if (selected[0].type === 'textbox') {
      this._tools.textbox.setColor(selected[0].fill)
      this._tools.textbox.setBackgroundColor(selected[0].backgroundColor)
    }
    if (selected[0].type === 'draw' && this._tools.freeDrawing.getIsEraserMode()) {
      this._tools.freeDrawing.removeDraw(selected[0])
      this._tools.freeDrawing.appendDrawHistory(selected[0])
    } else {
      selected.forEach(obj => {
        this.canvas.bringToFront(obj)
      })
    }
  }

  objectSelectCleared({deselected}) {
    this.mosaicObjectsBringToFront()
  }

  objectAdded({target}) {
    if (target.type === 'backgroundImage') return
    switch (target.type) {
      case 'aiSticker':
      case 'aiBlurSticker':
      case 'sticker':
      case 'mosaic':
        this._tools.sticker.setStickerCount()
        break
      case 'mosaicSticker':
        this.mosaicObjectsBringToFront()
        break
      case 'textbox': {
        this._tools.textbox.setTextBoxCount()
        break
      }
    }
  }

  objectRemoved({target}) {
    if (target.type === 'backgroundImage') return
    switch (target.type) {
      case 'aiSticker':
      case 'sticker':
        this._tools.sticker.setStickerCount()
        break
      case 'mosaic':
      case 'aiBlurSticker': {
        this._tools.sticker.setStickerCount()
        const deleteTarget = this.canvas.getObjects().find(obj => target.mosaicFrameKey === obj.mosaicStickerKey)
        if (deleteTarget) {
          this.canvas.remove(deleteTarget)
        }
        break
      }
      case 'textbox': {
        this._tools.textbox.setTextBoxCount()
        break
      }
    }
  }

  pathCreated({path}) {
    path.setControlsVisibility(this.visibleOption)
    path.set(this.selectionStyle)
    path.set({type: 'draw'})
    path.controls.deleteControl.visible = true
    path.controls.rotateControl.visible = true
    this.canvas.renderAll()

    const pathLength = this.canvas.getObjects().filter(obj => obj.path).length
    if (pathLength === 1) {
      this._tools.freeDrawing.resetDrawHistory()
    }
  }

  mouseMove(e) {
    if (!e.target) return
    switch (e.target.type) {
      case 'backgroundImage':
        this.canvas.hoverCursor = 'default'
        break
      case 'aiSticker':
      case 'aiBlurSticker':
      case 'sticker':
      case 'mosaic':
      case 'mosaicSticker':
      case 'textbox':
      case 'draw': {
        this.canvas.hoverCursor = 'move'
        break
      }
    }
  }
}

export default ImageEditor