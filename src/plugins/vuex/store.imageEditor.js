import {eventBus} from "@/main";
import { set } from "lodash";

const storeImageEditor = {
  namespaced: true,
  state: {
    isShow: false,
    /* 편집 파일 */
    editImages: [],
    deleteImages: [],
    openComponentKey: '',
    imageLimitCount: null,
    isHitalkMode: false,
    isPostEditorMode: false,
    isSingleMode: false,
    targetIdx: 0,
    parentComponent: '',
    customSendButtonLabel: ''
  },
  mutations: {
    setIsShow(state, isShow) {
      state.isShow = isShow
    },
    appendEditImages(state, {result, fileName}) {
      state.editImages.push({
        fileName: fileName,
        fileOriginalPath: result,
        editDataUrl: result,
        thumbnailDataUrl: result,
        objects: [],
        isUploaded: !result.includes('base64')
      })
    },
    clearEditImages(state) {
      state.editImages = []
    },
    setEditImages(state, editImages) {
      state.editImages = editImages
    },
    appendDeleteImages(state, file) {
      state.deleteImages.push(file)
    },
    clearDeleteImages(state) {
      state.deleteImages = []
    },
    setOpenComponentKey(state, openComponentKey) {
      state.openComponentKey = openComponentKey
    },
    setTargetIdx(state, targetIdx) {
      state.targetIdx = targetIdx
    },
    setImageLimitCount(state, imageLimitCount) {
      state.imageLimitCount = imageLimitCount
    },
    setIsHitalkMode(state, isHitalkMode) {
      state.isHitalkMode = isHitalkMode
    },
    setIsSingleMode(state, isSingleMode) {
      state.isSingleMode = isSingleMode
    },
    setIsPostEditorMode(state, isPostEditorMode) {
      state.isPostEditorMode = isPostEditorMode
    },
    setParentComponent(state, parentComponent) {
      state.parentComponent = parentComponent
    },
    setCustomSendButtonLabel(state, customSendButtonLabel) {
      state.customSendButtonLabel = customSendButtonLabel
    }
  },
  actions: {
    openImageEditorAndWait: ({state, dispatch}, payload) => new Promise((resolve) => {
      dispatch('openImageEditor', payload).then(() => {
        eventBus.$on(`imageEditor-${state.openComponentKey}`, (uploadFileList) => {
          eventBus.$off(`imageEditor-${state.openComponentKey}`)
          resolve(uploadFileList)
        })
        eventBus.$on(`imageEditor-${state.openComponentKey}-canceled`, (canceled) => {
          eventBus.$off(`imageEditor-${state.openComponentKey}-canceled`)
          resolve(canceled ? [] : state.editImages)
        })
      })
    }),
    openImageEditor: async ({commit, dispatch}, payload) => {
      commit('clearEditImages')

      const { uploadedFiles, inputFiles, imageLimitCount, componentKey, targetIdx, parentComponent } = payload
      let openFiles = []

      if (uploadedFiles && uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          openFiles.push({
            fileOriginalPath: uploadedFiles[i].fileOriginalPath,
            fileName: uploadedFiles[i].fileName
          })
        }
      }

      if (inputFiles && inputFiles.length > 0) {
        for (let i = 0; i < inputFiles.length; i++) {
          const { result } = await dispatch('readFile', inputFiles[i])
          openFiles.push({
            fileOriginalPath: result,
            fileName: inputFiles[i].name
          })
        }
      }

      for (let { fileOriginalPath: result, fileName } of openFiles) {
        commit('appendEditImages', { result, fileName })
      }
      commit('setImageLimitCount', imageLimitCount)
      commit('setOpenComponentKey', componentKey)
      commit('setTargetIdx', targetIdx)
      commit('setParentComponent', parentComponent)
      commit('setIsShow', true)
    },
    closeImageEditor: ({state, commit}, canceled) => {
      if (canceled) {
        eventBus.$emit(`imageEditor-${state.openComponentKey}-canceled`, true)
      }
      commit('setIsShow', false)
    },
    readFile: async ({state}, file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (event) => {
          resolve(event.target)
        }
        reader.onerror = (event) => reject(event)
        reader.readAsDataURL(file)
      })
    },
    deleteEditImages: async ({state, commit}, idx) => {
      return new Promise(resolve => {
        state.editImages.splice(idx, 1)
        if (state.editImages.length <= 1) {
          commit('setTargetIdx', 0)
        } else {
          commit('setTargetIdx', state.editImages.length === idx ? idx - 1 : idx)
        }
        resolve(true)
      })
    },
    resetEditImages: async ({state}) => {
      state.editImages = state.editImages.map(image => {
        return {
          ...image,
          thumbnailDataUrl: image.fileOriginalPath
        }
      })
    },
    editDone: async ({state, dispatch}, canceled) => {
      let uploadFiles = []

      for (const img of state.editImages) {
        const file = await dispatch('base64ToFile', img)
        if (file) {
          uploadFiles.push({
            file,
            fileName: img.fileName,
            fileOriginalPath: img.fileOriginalPath,
            isUploaded: img.isUploaded
          })
        }
      }

      dispatch('closeImageEditor', canceled)
      dispatch('uploadFile', uploadFiles)
    },
    base64ToFile: async ({state}, {fileName, thumbnailDataUrl}) => {
      if (!thumbnailDataUrl.includes('base64')) {
        return null
      }

      let arr = thumbnailDataUrl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[arr.length - 1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--){
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], fileName, {type:mime})
    },

    uploadFile: async ({state, rootState, dispatch, commit}, uploadFiles) => {
      let uploadFileList = []

      for (let i = 0; i < uploadFiles.length; i++) {
        const uploadFile = uploadFiles[i]
        // 기존 업로드된 파일을 수정했거나 신규 파일인 경우에만 파일서버 업로드
        if (uploadFile.fileOriginalPath !== uploadFile.thumbnailDataUrl || !uploadFile.isUploaded) {
          uploadFileList.push({
            file: await rootState.hiClass.getConvertedFile(uploadFile.file),
            fileOriginalPath: uploadFile.fileOriginalPath
          })
        }
      }

      eventBus.$emit(`imageEditor-${state.openComponentKey}`, uploadFileList)
    },

    changeFilesSort: async ({state}, files) => {
      if (state.editImages.length > 0) {
        let editImageIndexMap = {};

        // 파일명을 키로 인덱스를 저장
        state.editImages.forEach((img, idx) => {
          if (!editImageIndexMap[img.fileName]) {
            editImageIndexMap[img.fileName] = []
          }
          editImageIndexMap[img.fileName].push(idx)
        })

        // 인덱스 배열에서 shift하여 가져옴
        return _.sortBy(files, function(item) {
          if (editImageIndexMap[item.fileName]) {
            return editImageIndexMap[item.fileName].shift() // editImages에 있는 파일은 순서대로 정렬
          } else {
            return Infinity // editImages에 없는 파일은 맨 뒤로 정렬
          }
        })
      } else {
        return []
      }
    }
  }
}

export default storeImageEditor