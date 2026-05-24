import {fabric} from "fabric";

class CropTarget {
  constructor(imageEditor) {
    this.imageEditor = imageEditor
    this.canvas = imageEditor.canvas
    this.cropTarget = null
    this.cornerIcon = null
    this.cropMode = 'O'
    this.limitScale = {
      x: 1,
      y: 1,
      left: null,
      top: null
    }
    this.isFreeScale = false

    this.setCornerIcon()
  }

  /**
   * control custom =======================================
   */
  customizeCropTargetControls() {
    fabric.Rect.prototype.controls.tl = this.createCornerIcon(0, -0.5, -0.5, 'tl', 'nw-resize')
    fabric.Rect.prototype.controls.tr = this.createCornerIcon(90, 0.5, -0.5, 'tr', 'sw-resize')
    fabric.Rect.prototype.controls.br = this.createCornerIcon(180, 0.5, 0.5, 'br', 'se-resize')
    fabric.Rect.prototype.controls.bl = this.createCornerIcon(270, -0.5, 0.5, 'bl', 'ne-resize')
  }

  createCornerIcon(angle, x, y, control, cursorStyle) {
    const cropTarget = this
    return new fabric.Control({
      x,
      y,
      cursorStyle: cursorStyle,
      render: cropTarget.renderCornerIcon.bind(this, angle),
      actionHandler: fabric.Rect.prototype.controls[control].actionHandler,
      visible: true,
    })
  }

  setCornerIcon() {
    const svgIcon = encodeURIComponent(`<svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4 0H0V4V35H4V4H35V0H4Z" fill="#4778DE"/>
                                                    </svg>`)
    const rotateIcon = `data:image/svg+xml;utf8,${svgIcon}`
    this.cornerIcon = document.createElement('img')
    this.cornerIcon.src = rotateIcon
  }
  renderCornerIcon(angle, ctx, left, top, styleOverride, fabricObject) {
    const baseWidth = 500
    const cornerSize = 20 / baseWidth * Math.max(this.imageEditor.getCanvasSize().width, this.imageEditor.getCanvasSize().height)
    const size = Math.max(30, cornerSize)
    ctx.save()
    ctx.translate(left, top)
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle + angle))
    ctx.drawImage(this.cornerIcon, 0, 0, size, size)
    ctx.restore()
  }

  /**
   * cropTarget =======================================
   */
  makeCropTarget() {
    const {width: canvasWidth, height: canvasHeight} = this.imageEditor.getCanvasSize()
    let option = {
      width: canvasWidth - 2,
      height: canvasHeight - 2
    }

    const baseWidth = 500
    const cornerSize = 40 / baseWidth * Math.max(this.imageEditor.getCanvasSize().width, this.imageEditor.getCanvasSize().height)

    const cropTarget = new fabric.Rect({
      type: 'cropTarget',
      fill: 'transparent',
      transparentCorners: false,
      hoverCursor: 'move',
      stroke: '#FFFFFF',
      strokeWidth: 2,
      lockScalingFlip: true,
      scaleX: 1,
      scaleY: 1,
      cornerSize: cornerSize,
      ...option
    })

    const visibleOption = {
      ml: false,
      mt: false,
      mr: false,
      mb: false,
      mtr: false
    }
    cropTarget.setControlsVisibility(visibleOption)
    cropTarget.controls.deleteControl.visible = false
    cropTarget.controls.rotateControl.visible = false
    this.canvas.add(cropTarget).setActiveObject(cropTarget)
    this.cropTarget = cropTarget
    this.bindCropTargetEvent()
    this.drawOuterRect()
    this.drawInnerGrid()
    this.customizeCropTargetControls()
  }
  
  changeCropTarget(type) {
    if (!this.imageEditor._tools.crop.getIsChange()) {
      this.imageEditor._tools.crop.setIsChange(true)
    }

    this.cropMode = type

    const {width: canvasWidth, height: canvasHeight} = this.imageEditor.getCanvasSize()
    const angle = this.imageEditor.backgroundImage.angle
    const strokeWidth = this.cropTarget.strokeWidth
    let option = {
      endScaleX: 1,
      endScaleY: 1
    }

    switch(type) {
      case 'O': {
        this.canvas.uniformScaling = true
        option.endWidth = angle === 0 || angle === 180 ? canvasWidth - strokeWidth : canvasHeight - strokeWidth
        option.endHeight = angle === 0 || angle === 180 ? canvasHeight - strokeWidth : canvasWidth - strokeWidth
        option.endLeft = this.imageEditor.backgroundImage.aCoords.tl.x
        option.endTop = this.imageEditor.backgroundImage.aCoords.tl.y
        this.animateCropTarget(this.cropTarget, option, 300)
        this.isFreeScale = false
        break
      }
      case 'F': {
        this.canvas.uniformScaling = false
        option.endWidth = angle === 0 || angle === 180 ? canvasWidth - strokeWidth : canvasHeight - strokeWidth
        option.endHeight = angle === 0 || angle === 180 ? canvasHeight - strokeWidth : canvasWidth - strokeWidth
        option.endScaleX = (this.cropTarget.width * this.cropTarget.scaleX) / option.endWidth
        option.endScaleY = (this.cropTarget.height * this.cropTarget.scaleY) / option.endHeight
        this.animateCropTarget(this.cropTarget, option, 1)
        this.isFreeScale = true
        break
      }
      case '1': {
        this.canvas.uniformScaling = true
        const side = canvasHeight > canvasWidth ? canvasWidth - strokeWidth : canvasHeight - strokeWidth
        const remain = canvasHeight > canvasWidth ? canvasHeight - side : canvasWidth - side
        option.endWidth = side - 1
        option.endHeight = side - 1
        if (this.imageEditor.backgroundImage.width > this.imageEditor.backgroundImage.height) {
          if (canvasWidth > canvasHeight) {
            option.endLeft = angle === 0 ? remain / 2 : this.imageEditor.backgroundImage.aCoords.tl.x - (remain / 2)
            option.endTop = this.imageEditor.backgroundImage.aCoords.tl.y
          } else {
            option.endLeft = this.imageEditor.backgroundImage.aCoords.tl.x
            option.endTop = angle === 90 ? remain / 2 : this.imageEditor.backgroundImage.aCoords.tl.y - (remain / 2)
          }

        } else {
          if (canvasWidth > canvasHeight) {
            option.endLeft = angle === 90 ? this.imageEditor.backgroundImage.aCoords.tl.x - (remain / 2) : remain / 2
            option.endTop = this.imageEditor.backgroundImage.aCoords.tl.y
          } else {
            option.endLeft = this.imageEditor.backgroundImage.aCoords.tl.x
            option.endTop = angle === 0 ? remain / 2 : this.imageEditor.backgroundImage.aCoords.tl.y - (remain / 2)
          }
        }
        this.animateCropTarget(this.cropTarget, option, 300)
        this.isFreeScale = false
        break
      }
    }
    this.canvas.renderAll()
  }

  animateCropTarget(target, option, duration) {
    if (option.endWidth) {
      target.animate('width', option.endWidth, {
        duration: duration,
        onChange: this.canvas.renderAll.bind(this.canvas),
        easing: fabric.util.ease.easeInOutQuad
      })
    }

    if (option.endHeight) {
      target.animate('height', option.endHeight, {
        duration: duration,
        onChange: this.canvas.renderAll.bind(this.canvas),
        easing: fabric.util.ease.easeInOutQuad
      })
    }

    if (option.endLeft || option.endLeft === 0) {
      target.animate('left', option.endLeft, {
        duration: duration,
        onChange: this.canvas.renderAll.bind(this.canvas),
        easing: fabric.util.ease.easeInOutQuad
      })
    }

    if (option.endTop || option.endTop === 0) {
      target.animate('top', option.endTop, {
        duration: duration,
        onChange: this.canvas.renderAll.bind(this.canvas),
        easing: fabric.util.ease.easeInOutQuad
      })
    }

    if (option.endScaleX) {
      target.animate('scaleX', option.endScaleX, {
        duration: duration,
        onChange: this.canvas.renderAll.bind(this.canvas),
        easing: fabric.util.ease.easeInOutQuad
      })
    }

    if (option.endScaleY) {
      target.animate('scaleY', option.endScaleY, {
        duration: duration,
        onChange: this.canvas.renderAll.bind(this.canvas),
        easing: fabric.util.ease.easeInOutQuad
      })
    }
  }

  resetChange() {
    this.imageEditor._tools.crop.resetCrop()
    this.imageEditor._tools.rotate.resetRotate()
    this.imageEditor._tools.flip.resetFlip()
  }

  // TODO: 크롭 영역 이벤트에서 더 좋은 방법이 있다면 수정해주세요. 능력 부족으로 각도별로 한땀한땀 만들었어요...
  bindCropTargetEvent() {
    this.cropTarget.on('moving', ({ e, pointer, transform }) => {
      let obj = transform.target
      this.keepObjectInCanvas(obj)
    })
    this.cropTarget.on('scaling', ({ e, pointer, transform }) => {
      if (!this.imageEditor._tools.crop.getIsChange()) {
        this.imageEditor._tools.crop.setIsChange(true)
      }

      // 크롭 영역
      const obj = transform.target
      const { scaleX, scaleY, aCoords } = obj
      const { tl: atl, tr: atr, bl: abl, br: abr } = aCoords
      const curAngle = this.imageEditor.backgroundImage.angle

      // 최소 사이즈까지만 축소
      if (scaleX <= 0.15) {
        obj.set({
          scaleX: 0.15,
          left: atl.x
        })
      }
      if (scaleY <= 0.15) {
        obj.set({
          scaleY: 0.15,
          top: atl.y
        })
      }

      let limitScaleX = this.limitScale.x
      let limitScaleY = this.limitScale.y

      // 최대 사이즈까지만 확대
      if (scaleX > limitScaleX) {
        obj.set({
          scaleX: limitScaleX
        })

        if (!this.isFreeScale || (this.isFreeScale && (curAngle === 90 || curAngle === 270))) {
          if (this.limitScale.top !== null) {
            obj.set({
              top: this.limitScale.top
            })
          }
        }

        if (!this.isFreeScale || (this.isFreeScale && (curAngle === 0 || curAngle === 180))) {
          if (this.limitScale.left !== null) {
            obj.set({
              left: this.limitScale.left
            })
          }
        }
      }

      if (scaleY > limitScaleY) {
        obj.set({
          scaleY: limitScaleY
        })

        if (!this.isFreeScale || (this.isFreeScale && (curAngle === 0 || curAngle === 180))) {
          if (this.limitScale.top !== null) {
            obj.set({
              top: this.limitScale.top
            })
          }
        }

        if (!this.isFreeScale || (this.isFreeScale && (curAngle === 90 || curAngle === 270))) {
          if (this.limitScale.left !== null) {
            obj.set({
              left: this.limitScale.left
            })
          }
        }
      }

      this.canvas.renderAll()
    })

    this.cropTarget.on('mousedown', ({ target }) => {
      // 선택한 코너를 기준으로 최대 스케일 구하기
      if (target.__corner) {
        let limitScale = this.getLimitScale(target)

        if (!this.isFreeScale) {
          let tlScale
          let trScale
          let blScale
          let brScale

          if (this.cropMode === 'O' || this.cropMode === '1') {
            tlScale = Math.min(limitScale.tl.x, limitScale.tl.y)
            trScale = Math.min(limitScale.tr.x, limitScale.tr.y)
            blScale = Math.min(limitScale.bl.x, limitScale.bl.y)
            brScale = Math.min(limitScale.br.x, limitScale.br.y)
          }

          limitScale.tl = { x: tlScale, y: tlScale }
          limitScale.tr = { x: trScale, y: trScale }
          limitScale.bl = { x: blScale, y: blScale }
          limitScale.br = { x: brScale, y: brScale }
        }

        this.limitScale.x = limitScale[target.__corner].x
        this.limitScale.y = limitScale[target.__corner].y

        this.getLimitPosition(target)
      }
    })
  }

  getLimitScale(target) {
    const curAngle = this.imageEditor.backgroundImage.angle
    const { tl: atl, tr: atr, bl: abl, br: abr } = target.aCoords
    let { width: canvasWidth, height: canvasHeight } = this.imageEditor.getCanvasSize()
    let limitScale = {}

    let cropTargetWidth = canvasWidth
    let cropTargetHeight = canvasHeight

    if (this.cropMode === '1') {
      cropTargetWidth = Math.min(canvasWidth, canvasHeight)
      cropTargetHeight = Math.min(canvasWidth, canvasHeight)
    }

    if (curAngle === 0) {
      limitScale = {
        'tl': {
          'x': abr.x / cropTargetWidth,
          'y': abr.y / cropTargetHeight
        },
        'tr': {
          'x': (canvasWidth - abl.x) / cropTargetWidth,
          'y': abl.y / cropTargetHeight
        },
        'bl': {
          'x': atr.x / cropTargetWidth,
          'y': (canvasHeight - atr.y) / cropTargetHeight
        },
        'br': {
          'x': (canvasWidth - atl.x) / cropTargetWidth,
          'y': (canvasHeight - atl.y) / cropTargetHeight
        }
      }
    }

    if (curAngle === 90) {
      limitScale = {
        'tl': {
          'x': abr.y / cropTargetHeight,
          'y': (canvasWidth - abr.x) / cropTargetWidth
        },
        'tr': {
          'x': (canvasHeight - abl.y) / cropTargetHeight,
          'y': (canvasWidth - abl.x) / cropTargetWidth
        },
        'bl': {
          'x': atr.y / cropTargetHeight,
          'y': atr.x / cropTargetWidth
        },
        'br': {
          'x': (canvasHeight - atl.y) / cropTargetHeight,
          'y': atl.x / cropTargetWidth
        }
      }
    }

    if (curAngle === 180) {
      limitScale = {
        'tl': {
          'x': (canvasWidth - abr.x) / cropTargetWidth,
          'y': (canvasHeight - abr.y) / cropTargetHeight
        },
        'tr': {
          'x': abl.x / cropTargetWidth,
          'y': (canvasHeight - abl.y) / cropTargetHeight
        },
        'bl': {
          'x': (canvasWidth - atr.x) / cropTargetWidth,
          'y': atr.y / cropTargetHeight
        },
        'br': {
          'x': atl.x / cropTargetWidth,
          'y': atl.y / cropTargetHeight
        }
      }
    }

    if (curAngle === 270) {
      limitScale = {
        'tl': {
          'x': (canvasHeight - abr.y) / cropTargetHeight,
          'y': abr.x / cropTargetWidth
        },
        'tr': {
          'x': abl.y / cropTargetHeight,
          'y': abl.x / cropTargetWidth
        },
        'bl': {
          'x': (canvasHeight - atr.y) / cropTargetHeight,
          'y': (canvasWidth - atr.x) / cropTargetWidth
        },
        'br': {
          'x': atl.y / cropTargetHeight,
          'y': (canvasWidth - atl.x) / cropTargetWidth
        }
      }
    }

    return limitScale
  }

  getLimitPosition(target) {
    const curAngle = this.imageEditor.backgroundImage.angle
    const { tl: atl, tr: atr, bl: abl, br: abr } = target.aCoords
    const { width: originWidth, height: originHeight } = target
    const strokeWidth = target.strokeWidth

    if (curAngle === 0) {
      switch (target.__corner) {
        case 'tl': {
          this.limitScale.top = abr.y - strokeWidth - (originHeight * this.limitScale.y)
          this.limitScale.left = abr.x - strokeWidth - (originWidth * this.limitScale.x)
          break
        }
        case 'tr': {
          this.limitScale.top = abl.y - strokeWidth - (originHeight * this.limitScale.y)
          this.limitScale.left = null
          break
        }
        case 'bl': {
          this.limitScale.top = null
          this.limitScale.left = abr.x - strokeWidth - (originWidth * this.limitScale.x)
          break
        }
        case 'br': {
          this.limitScale.left = null
          this.limitScale.top = null
        }
      }

    } else if (curAngle === 90) {
      switch (target.__corner) {
        case 'tl': {
          this.limitScale.top = abr.y - strokeWidth - (originWidth * this.limitScale.x)
          this.limitScale.left = abr.x + strokeWidth + (originHeight * this.limitScale.y)
          break
        }
        case 'tr': {
          this.limitScale.top = null
          this.limitScale.left = abl.x + strokeWidth + (originHeight * this.limitScale.y)
          break
        }
        case 'bl': {
          this.limitScale.top = atr.y - strokeWidth - (originWidth * this.limitScale.x)
          this.limitScale.left = null
          break
        }
        case 'br': {
          this.limitScale.left = null
          this.limitScale.top = null
        }
      }

    } else if (curAngle === 180) {
      switch (target.__corner) {
        case 'tl': {
          this.limitScale.top = abr.y + strokeWidth + (originHeight * this.limitScale.y)
          this.limitScale.left = abr.x + strokeWidth + (originWidth * this.limitScale.x)
          break
        }
        case 'tr': {
          this.limitScale.top = abl.y + strokeWidth + (originHeight * this.limitScale.y)
          this.limitScale.left = null
          break
        }
        case 'bl': {
          this.limitScale.top = null
          this.limitScale.left = atr.x + strokeWidth + (originWidth * this.limitScale.x)
          break
        }
        case 'br': {
          this.limitScale.left = null
          this.limitScale.top = null
        }
      }

    } else if (curAngle === 270) {
      switch (target.__corner) {
        case 'tl': {
          this.limitScale.top = abr.y + strokeWidth + (originWidth * this.limitScale.x)
          this.limitScale.left = abr.x - strokeWidth - (originHeight * this.limitScale.y)
          break
        }
        case 'tr': {
          this.limitScale.top = null
          this.limitScale.left = abl.x - strokeWidth - (originHeight * this.limitScale.y)
          break
        }
        case 'bl': {
          this.limitScale.top = atr.y + strokeWidth + (originWidth * this.limitScale.x)
          this.limitScale.left = null
          break
        }
        case 'br': {
          this.limitScale.left = null
          this.limitScale.top = null
        }
      }
    }
  }

  keepObjectInCanvas(obj) {
    let canvasWidth = this.canvas.getWidth()
    let canvasHeight = this.canvas.getHeight()
    let objWidth = obj.width * obj.scaleX
    let objHeight = obj.height * obj.scaleY
    const { tl: atl, tr: atr, bl: abl, br: abr } = obj.aCoords

    if (this.imageEditor.backgroundImage.angle === 0) {
      if (obj.left < 0) {
        obj.left = 0
      }
      if (obj.left + objWidth > canvasWidth - 1) {
        obj.left = canvasWidth - 1 - objWidth
      }
      if (obj.top < 0) {
        obj.top = 0
      }
      if (obj.top + objHeight > canvasHeight) {
        obj.top = canvasHeight - 1 - objHeight
      }
    }

    if (this.imageEditor.backgroundImage.angle === 90) {
      if (obj.left < atl.x - abl.x) {
        obj.left = atl.x - abl.x
      }
      if (obj.left > canvasWidth - 1) {
        obj.left = canvasWidth - 1
      }
      if (obj.top < 0) {
        obj.top = 0
      }
      if (obj.top + objWidth > canvasHeight - 1) {
        obj.top = canvasHeight - 1 - objWidth
      }
    }

    if (this.imageEditor.backgroundImage.angle === 180) {
      if (obj.left < abl.x - abr.x) {
        obj.left = abl.x - abr.x
      }
      if (obj.left > canvasWidth - 1) {
        obj.left = canvasWidth - 1
      }
      if (obj.top < atr.y - abr.y) {
        obj.top = atr.y - abr.y
      }
      if (obj.top > canvasHeight - 1) {
        obj.top = canvasHeight - 1
      }
    }

    if (this.imageEditor.backgroundImage.angle === 270) {
      if (obj.left < 0) {
        obj.left = 0
      }
      if (obj.left + objHeight > canvasWidth - 1) {
        obj.left = canvasWidth - 1 - objHeight
      }
      if (obj.top < atl.y - atr.y) {
        obj.top = atl.y - atr.y
      }
      if (obj.top > canvasHeight - 1) {
        obj.top = canvasHeight - 1
      }
    }
    this.canvas.requestRenderAll()
  }

  drawOuterRect() {
    this.canvas.on('after:render', ({ctx}) => {
      if (ctx) {
        const cropTarget = this.canvas.getObjects().find(obj => obj.type === 'cropTarget')
        if (!cropTarget) return

        const { tl: vtl, tr: vtr, bl: vbl, br: vbr } = this.imageEditor.backgroundImage.aCoords
        const { tl: atl, tr: atr, bl: abl, br: abr } = cropTarget.aCoords
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.beginPath()

        if (this.imageEditor.backgroundImage.angle === 0) {
          ctx.rect(0, 0, atl.x, vbl.y)
          ctx.rect(atr.x, 0, vtr.x - atr.x, vbr.y)
          ctx.rect(atl.x, 0, atr.x - atl.x, atr.y)
          ctx.rect(abl.x, abl.y, abr.x - abl.x, vbr.y - abr.y)
        }

        if (this.imageEditor.backgroundImage.angle === 90) {
          ctx.rect(vbl.x, vbl.y, abl.x, vbr.y)
          ctx.rect(atl.x, 0, vtl.x - atl.x, vtr.y)
          ctx.rect(abl.x, 0, atl.x - abl.x, atl.y)
          ctx.rect(abr.x, abr.y, atr.x - abr.x, vtr.y - atr.y)
        }

        if (this.imageEditor.backgroundImage.angle === 180) {
          ctx.rect(vbr.x, vbr.y, abr.x, vtr.y)
          ctx.rect(abl.x, 0, vbl.x - abl.x, vtl.y)
          ctx.rect(abr.x, 0, abl.x - abr.x, abl.y)
          ctx.rect(atr.x, atr.y, atl.x - atr.x, vtl.y - atl.y)
        }

        if (this.imageEditor.backgroundImage.angle === 270) {
          ctx.rect(vtr.x, vtr.y, atr.x, vtl.y)
          ctx.rect(abr.x, 0, vbr.x - abr.x, vbl.y)
          ctx.rect(atr.x, 0, abr.x - atr.x, abr.y)
          ctx.rect(atl.x, atl.y, abl.x - atl.x, vbl.y - abl.y)
        }

        ctx.fill()
      }
    })
  }
  
  drawInnerGrid() {
    this.canvas.on('after:render', ({ctx}) => {
      if (ctx) {
        const cropTarget = this.canvas.getObjects().find(obj => obj.type === 'cropTarget')
        if (!cropTarget) return

        const { tl: atl, tr: atr, bl: abl, br: abr } = cropTarget.aCoords

        const baseWidth = 1000
        const lineWidth = 1 / baseWidth * Math.max(this.imageEditor.getCanvasSize().width, this.imageEditor.getCanvasSize().height)

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = Math.max(1, lineWidth)
        ctx.beginPath()

        if (this.imageEditor.backgroundImage.angle === 0 || this.imageEditor.backgroundImage.angle === 180) {
          const cropRectHeight = abl.y - atl.y
          const cropRectWidth = atr.x - atl.x

          ctx.moveTo(atl.x, atl.y + (cropRectHeight / 3))
          ctx.lineTo(atr.x, atl.y + (cropRectHeight / 3))
          ctx.moveTo(atl.x, atl.y + (cropRectHeight / 3 * 2))
          ctx.lineTo(atr.x, atl.y + (cropRectHeight / 3 * 2))

          ctx.moveTo(atl.x + (cropRectWidth / 3), atl.y)
          ctx.lineTo(atl.x + (cropRectWidth / 3), abl.y)
          ctx.moveTo(atl.x + (cropRectWidth / 3 * 2), atl.y)
          ctx.lineTo(atl.x + (cropRectWidth / 3 * 2), abl.y)
        } else {
          const cropRectHeight = abr.y - abl.y
          const cropRectWidth = atl.x - abl.x

          ctx.moveTo(abl.x, abl.y + (cropRectHeight / 3))
          ctx.lineTo(atl.x, abl.y + (cropRectHeight / 3))
          ctx.moveTo(abl.x, abl.y + (cropRectHeight / 3 * 2))
          ctx.lineTo(atl.x, abl.y + (cropRectHeight / 3 * 2))

          ctx.moveTo(abl.x + (cropRectWidth / 3), abl.y)
          ctx.lineTo(abl.x + (cropRectWidth / 3), abr.y)
          ctx.moveTo(abl.x + (cropRectWidth / 3 * 2), abl.y)
          ctx.lineTo(abl.x + (cropRectWidth / 3 * 2), abr.y)
        }

        ctx.stroke()
        ctx.closePath()
      }
    })
  }
  
  deleteCropTarget() {
    fabric.Object.prototype.controls = Object.assign({}, this.imageEditor.originalControls)
    const cropTarget = this.canvas.getObjects().find(obj => obj.type === 'cropTarget')
    this.canvas.remove(cropTarget)
    this.cropTarget = null
    this.offCropEvent()
    this.canvas.uniformScaling = true
    this.imageEditor._tools.crop.setIsChange(false)
    this.imageEditor._tools.rotate.setIsChange(false)
    this.imageEditor._tools.flip.setIsChange(false)
  }

  offCropEvent() {
    this.canvas.off('after:render')
  }
}

export default CropTarget