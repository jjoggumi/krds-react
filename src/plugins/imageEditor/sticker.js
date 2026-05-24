import {fabric} from "fabric";
import * as faceapi from "face-api.js";
import {FirebaseRemoteConfigKey, remoteConfig} from '@/plugins/firebase'
import store from "@/plugins/vuex/store";

const DEFAULT_STICKER_DATA = Object.freeze({
  stickers: [
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_01.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_02.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_03.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_04.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_05.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_06.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_07.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_08.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_09.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_10.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_11.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_12.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_13.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_14.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_15.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_16.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_17.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_18.png',
      useAi: 'true'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_19.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_20.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_21.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_22.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_23.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_24.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_25.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_26.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_27.png',
      useAi: 'false'
    },
    {
      url: 'https://download.hiclass.net/static/images/photo_stickers/sticker_28.png',
      useAi: 'false'
    }
  ]
})

class Sticker {
  constructor(imageEditor) {
    this.imageEditor = imageEditor
    this.canvas = imageEditor.canvas
    this.stickerList = []
    this.stickerCount = 0

    this.loadModel()
  }

  parseStickerData(data) {
    if (!data) {
      return DEFAULT_STICKER_DATA.stickers;
    }

    try {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed.stickers) ? parsed.stickers : DEFAULT_STICKER_DATA.stickers
    } catch (error) {
      console.warn('[ImageEditor] Failed to parse sticker config.', error)
      return DEFAULT_STICKER_DATA.stickers
    }
  }

  async loadModel() {
    await faceapi.loadSsdMobilenetv1Model('/models')
  }

  /**
   * ============= 스티커 =================
   */
  getStickerList() {
    remoteConfig.defaultConfig = ({
      'is_auto_location': 'false',
    })

    remoteConfig.ensureInitialized()

    return remoteConfig.fetchAndActivate()
      .then(() => {
        const data = remoteConfig.getString(FirebaseRemoteConfigKey.IMAGE_EDITOR_STICKER)
        return this.parseStickerData(data)
      })
      .catch(() => {
        const data = remoteConfig.getString('photoStickers')
        return this.parseStickerData(data)
      })
  }

  async setStickerList() {
    this.stickerList = await this.getStickerList()
  }

  addSticker(stickerUrl) {
    const imageEditor = this.imageEditor
    const canvas = this.canvas
    const sticker = this

    fabric.Image.fromURL(stickerUrl, function(img) {
      sticker.settingSticker(img)

      // 스티커 축소
      img.scaleToWidth(imageEditor.getCanvasSize().width / imageEditor.baseSize * 100)
      canvas.add(img).centerObject(img).setActiveObject(img)

      // 최대, 최소 사이즈 지정
      sticker.bindStickerEvent(img)
    },{
      crossOrigin : 'anonymous',
      id: stickerUrl,
      type: 'sticker',
      ...imageEditor.selectionStyle
    })
  }

  bindStickerEvent(img) {
    img.on({
      scaling({ transform }) {
        if (transform.target.scaleX <= 0.05) {
          transform.target.scaleX = transform.target.beforeScale
          transform.target.scaleY = transform.target.beforeScale
        } else {
          transform.target.beforeScale = transform.target.scaleX
        }

        if (transform.target.scaleX > transform.target.originScale) {
          transform.target.scaleX = transform.target.originScale
          transform.target.scaleY = transform.target.originScale
        }
      }
    })
  }

  settingSticker(img) {
    // 최대 스케일 지정
    img.scaleToWidth(Math.min(this.imageEditor.getCanvasSize().width, this.imageEditor.getCanvasSize().height))
    img.originScale = img.scaleX
    img.beforeScale = img.scaleX

    // 코너 컨트롤 설정
    img.setControlsVisibility(this.imageEditor.visibleOption)
    img.controls.deleteControl.visible = true
    img.controls.rotateControl.visible = true
  }

  /**
   * ============= 모자이크 =================
   */
  addMosaic() {
    const sticker = this
    const rx = this.canvas.width / 10
    const ry = this.canvas.width / 10
    const uuid = self.crypto.randomUUID()

    let mosaicObj = new fabric.Ellipse({
      fill: 'transparent',
      rx,
      ry,
      type: 'mosaic',
      mosaicFrameKey: uuid,
      beforeLeft: 0,
      beforeTop: 0,
      ...sticker.imageEditor.selectionStyle
    })

    mosaicObj.setControlsVisibility(sticker.imageEditor.visibleOption)
    mosaicObj.controls.deleteControl.visible = true
    mosaicObj.controls.rotateControl.visible = false
    sticker.bindMosaicEvent(mosaicObj)
    sticker.addBlurImage(mosaicObj)
    sticker.canvas.add(mosaicObj).centerObject(mosaicObj).setActiveObject(mosaicObj)
  }
  
  makeBlurImage(img, rx, ry, offsetX, offsetY, key) {
    const sticker = this

    const compressedImgUrl = img.toDataURL({
      format: 'jpeg',
      quality: 0.1,
      left: offsetX,
      top: offsetY,
      width: rx * 2,
      height: ry * 2
    })

    fabric.Image.fromURL(compressedImgUrl, function(img) {
      sticker.setFilter(img)

      let circleClipPath = new fabric.Ellipse({
        rx,
        ry,
        left: offsetX,
        top: offsetY,
        absolutePositioned: true,
        originX: 'left',
        originY: 'top'
      })

      img.set({
        clipPath: circleClipPath,
        selectable: false
      })

      const addedMosaic = sticker.canvas.getObjects().find(obj => obj.mosaicStickerKey === key)
      if (addedMosaic) {
        sticker.canvas.remove(addedMosaic)
      }
      const mosaicFrame = sticker.canvas.getObjects().find(obj => obj.mosaicFrameKey === key)
      if (mosaicFrame) {
        sticker.canvas.add(img)
      }
    }, {
      left: offsetX,
      top: offsetY,
      mosaicStickerKey: key,
      type: 'mosaicSticker'
    })
  }
  
  setFilter(img) {
    const blur = new fabric.Image.filters.Blur({
      blur: 1.5
    })

    img.filters.push(blur)
    img.applyFilters()

    return img
  }
  
  bindMosaicEvent(mosaicObj) {
    const sticker = this
    mosaicObj.on({
      mouseup(e) {
        sticker.addBlurImage(e.target)
      },
      scaling(e) {
        const maxScaleX = 2000 / e.transform.target.width
        const maxScaleY = 2000 / e.transform.target.height
        if (e.transform.target.getScaledWidth() >= 2000) {
          e.transform.target.scaleX = maxScaleX
          e.transform.target.left = e.transform.target.beforeLeft
        } else {
          e.transform.target.beforeLeft = e.transform.target.left
        }
        if (e.transform.target.getScaledHeight() >= 2000) {
          e.transform.target.scaleY = maxScaleY
          e.transform.target.top = e.transform.target.beforeTop
        } else {
          e.transform.target.beforeTop = e.transform.target.top
        }
      }
    })
  }

  addBlurImage(target) {
    const imageEditor = this.imageEditor
    const sticker = this

    fabric.Image.fromURL(imageEditor.backgroundImage._element.currentSrc, function (img) {
      sticker.makeBlurImage(
        img,
        target.rx * target.scaleX,
        target.ry * target.scaleY,
        target.left,
        target.top,
        target.mosaicFrameKey
      )
    }, {crossOrigin : 'anonymous'})
  }

  /**
   * ============= AI 스티커 =================
   */
  async detectFaces() {
    const img = document.createElement('img')
    img.src = this.imageEditor.backgroundImage._element.currentSrc
    img.crossOrigin = 'anonymous'

    const detections = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.25 }))
    img.remove()
    return detections
  }

  async applyAiSticker(type) {
    const isUsedAiSicker = this.canvas.getObjects().some(obj => obj.type === 'aiSticker')
    const isUsedAiBlurSicker = this.canvas.getObjects().some(obj => obj.type === 'aiBlurSticker')

    if (type === 'aiSticker') {
      if (isUsedAiSicker) {
        this.changeAiSticker()
      }
      if (isUsedAiBlurSicker) {
        this.canvas.getObjects().forEach(obj => {
          if (obj.type === 'aiBlurSticker') {
            this.canvas.remove(obj)
          }
        })
      }
      await this.addAiSticker()

      store.commit('setIsDimLoading', false)
    } else {
      if (isUsedAiSicker) {
        this.canvas.getObjects().forEach(obj => {
          if (obj.type === 'aiSticker') {
            this.canvas.remove(obj)
          }
        })
      }
      await this.addAiBlurSticker()
      store.commit('setIsDimLoading', false)
    }

  }

  async addAiSticker() {
    const imageEditor = this.imageEditor
    const canvas = this.canvas
    const sticker = this

    const detections = await this.detectFaces()

    const newStickerDetections = this.getNewStickerDetections(detections)
    const remainingStickerCount = 50 - this.getStickerCount()
    const stickerCount = remainingStickerCount - newStickerDetections.length > 0 ? newStickerDetections.length : remainingStickerCount

    for (let i = 0; i < stickerCount; i++) {
      if (!newStickerDetections[i]) break

      const detectInfo = newStickerDetections[i]
      const { height, width, x, y } = detectInfo._box
      const centerPosition = {
        x: x - ((height - width) / 2),
        y: y
      }
      const stickerScale = Math.max(height, width)
      const useAiSticker = this.stickerList.filter(stickerObj => stickerObj.useAi === 'true')
      const randomIdx = Math.floor(Math.random() * useAiSticker.length)
      const randomSrc = useAiSticker[randomIdx].url

      fabric.Image.fromURL(randomSrc, function(img) {
        sticker.settingSticker(img)

        // 스티커 축소
        img.scaleToWidth(stickerScale, false)
        canvas.add(img)

        // 최대, 최소 사이즈 지정
        sticker.bindStickerEvent(img)
      }, {
        crossOrigin : 'anonymous',
        left: centerPosition.x,
        top: centerPosition.y,
        type: 'aiSticker',
        ...imageEditor.selectionStyle
      })
    }
  }

  changeAiSticker() {
    const canvas = this.canvas
    const useAiSticker = this.stickerList.filter(stickerObj => stickerObj.useAi === 'true')

    canvas.getObjects().forEach(obj => {
      const randomIdx = Math.floor(Math.random() * useAiSticker.length)
      const randomSrc = useAiSticker[randomIdx].url

      if (obj.type === 'aiSticker') {
        obj.setSrc(randomSrc, function() {
          canvas.renderAll()
        }, {crossOrigin : 'anonymous'})
      }
    })
  }

  getNewStickerDetections(detections) {
    // 얼굴인식된 좌표 범위 목록
    const coordsBoundsList = detections.map(detection => {
      return {
        x1: detection._box.x - ((detection._box.height - detection._box.width) / 2),
        y1: detection._box.y,
      }
    })

    // 해당 좌표에 존재하는 스티커의 idx 목록
    let hasAiStickerIdxList = []

    this.imageEditor.getObjects().filter(obj => obj.type === 'aiSticker' || obj.type === 'aiBlurSticker').forEach(obj => {
      const isCoordMatch = coordsBoundsList.some((position, idx) => {
        if (obj.left === position.x1 && obj.top === position.y1) {
          hasAiStickerIdxList.push(idx)
        }
        return obj.left === position.x1 && obj.top === position.y1
      })

      if (!isCoordMatch) {
        this.canvas.remove(obj)
      }
    })

    // 붙어있는 스티커가 삭제되었을 수도 있으므로
    this.setStickerCount()

    // 스티커가 새롭게 붙어야하는 인식 위치 정보
    let newStickerDetections = []

    detections.forEach((detection, idx) => {
      if (!hasAiStickerIdxList.includes(idx)) {
        newStickerDetections.push(detection)
      }
    })

    return newStickerDetections
  }

  async addAiBlurSticker() {
    const sticker = this

    const detections = await this.detectFaces()

    const newStickerDetections = this.getNewStickerDetections(detections)
    const remainingStickerCount = 50 - this.getStickerCount()
    const stickerCount = remainingStickerCount - newStickerDetections.length > 0 ? newStickerDetections.length : remainingStickerCount

    for (let i = 0; i < stickerCount; i++) {
      if (!newStickerDetections[i]) break

      const detectInfo = newStickerDetections[i]
      const { height, width, x, y } = detectInfo._box
      const centerPosition = {
        x: x - ((height - width) / 2),
        y: y
      }
      const stickerScale = Math.max(height, width)
      const uuid = self.crypto.randomUUID()

      let mosaicObj = new fabric.Ellipse({
        fill: 'transparent',
        rx: stickerScale / 2,
        ry: stickerScale / 2,
        left: centerPosition.x,
        top: centerPosition.y,
        type: 'aiBlurSticker',
        mosaicFrameKey: uuid,
        beforeLeft: 0,
        beforeTop: 0,
        ...sticker.imageEditor.selectionStyle
      })

      mosaicObj.setControlsVisibility(sticker.imageEditor.visibleOption)
      mosaicObj.controls.deleteControl.visible = true
      mosaicObj.controls.rotateControl.visible = false
      sticker.bindMosaicEvent(mosaicObj)
      sticker.addBlurImage(mosaicObj)
      sticker.canvas.add(mosaicObj)
    }
  }

  /**
   * getter, setter =======================================
   */
  getStickerCount() {
    return this.stickerCount
  }
  setStickerCount() {
    this.stickerCount = this.canvas.getObjects()
      .filter(obj => obj.type === 'sticker' || obj.type === 'mosaic' || obj.type === 'aiSticker' || obj.type === 'aiBlurSticker').length
  }
}

export default Sticker
