import {getField, updateField} from 'vuex-map-fields'
import router from "@/plugins/router"

const requestURL = process.env.VUE_APP_BASE_API_URI
const fileURL = process.env.VUE_APP_BASE_FILE_URI
const multipartURL = fileURL + '/multipart'

const storeWorksheet = {
  namespaced: true,
  state: {
    requestURL,
    fileURL,
    multipartURL,

    authentication: {},
  
    isInvisibleLoading: false,
  
    currentIframe: null,
    
    iframe: {
      worksheetEditPage: null,
      worksheetPreviewPage: null,
      worksheetSubmitPage: null,
      worksheetPrintPage: null
    },
    
    worksheetPrint: {
      isOpen: false,
      selectedItemApplyIds: [],
      mode: ''
    },
    
    worksheetShareList: {
      isOpen: false,
      isViewOnly: false,
      schoolId: null,
      schoolResource: null,
      applyType: null
    },
  
    worksheetApplyInfo: {
      isOpen: false
    },
    
    clazzApplyComponents: [
      {
        code: 'CREATE',
        name: 'worksheet-apply-create'
      },
      {
        code: 'DETAIL',
        name: 'worksheet-apply-detail'
      },
      {
        code: 'MODIFY',
        name: 'worksheet-apply-modify'
      },
    ],
  
    curClazzApply: {
      isMemberRoleManager: false,
      componentName: '',
      classInfo: {},
      clazzSubscribeView: {},
      sheetInfo: {},
      model: {
        sheetId: null,   // required:true | 시트(양식) ID
        sheetType: 'W',   // required:true | 시트 유형(H:하이클래스,W:워크시트)
        studentName: null,
        parentName: null,
        userId: null,   // 제출자 id (보호자 userId)
        classId: null,
        applyStatus: 'TEMP',
        applyTimestamp: null,
        applyType: null,
        files: []
      },
    },
  
    curWorksheetCreate: {
      copiedSheetModel: {}
    },
    
  },
  getters: {
    getField,
  
    clazzApplyComponentsByCode: (state) => (params) => {
      try {
        const findObj = state.clazzApplyComponents.find(item => item.code === params.code)
        return findObj || '?'
      } catch (e) {
        return '?'
      }
    },
  
    // 파라미터를 요청하지 않으므로 SFC 내에서 함수 대신 변수 취급
    curClazzApplyCode: (state) => {
      try {
        const findObj = state.clazzApplyComponents.find(item => item.name === state.curClazzApply.componentName)
        return findObj.code || '?'
      } catch (e) {
        return '?'
      }
    },
    
  },
  mutations: {
    updateField,
  
    // try {
    //   for (const key of Object.keys(payload)) {
    //     state.authentication[key] = payload[key]
    //   }
    //
    //   // 각 iframe 에 token 전달
    // } catch (e) {
    //   // eslint-disable-next-line no-console
    //   console.warn(e)
    // }
    
    setAuthentication: (state, payload) => {
      state.authentication = payload.authentication
    },
    
    setCurrentIframe: (state, payload) => {
      state.currentIframe = payload.currentIframe
    },
  
    /*setCurClazzApplyClazzSubscribeView: (state, payload) => {
      for(const [key, value] of Object.entries(payload)) {
        state.curClazzApply[key] = value
      }
    },
  
    setCurClazzApplyModel: (state, payload) => {
      for(const [key, value] of Object.entries(payload)) {
        state.curClazzApply.model[key] = value
      }
    },*/
    
  },
  actions: {
    loadedWorksheetIframe: ({commit, state}, payload) => {
      const name = payload.name
      state.iframe[name] = payload.data
      
      commit('setAuthentication', { authentication: payload.authentication })
      commit('setCurrentIframe', { currentIframe: name })
    },
    initIframes: ({/*commit,*/ state}, /*payload*/) => {
      for (const key of Object.keys(state.iframe)) {
        state.iframe[key] = null
      }
      state.currentIframe = null
    },
    sendMessageToFrame: ({/*commit,*/ state}, payload) => {
      const childFrame = state.iframe[payload.to]  // ex) worksheetEditPage
      const message = payload.message
      try {
        childFrame.contentWindow.postMessage(message, '*')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
      }
    },
    /**
     * TODO: parent domain === child domain 이므로 미사용
     * @param commit
     * @param state
     */
    transferTokenToFrames: ({commit, state}, /*payload*/) => {
      const filterdEntries = Object.entries(state.iframe)
        .filter(item => item.value !== null)
  
      filterdEntries.forEach(item => {
        const to = item.key
        const payload = {
          to,
          message: {
            name: 'saveToken',
            dispatchEvent: 'call',
            data: state.authentication
          }
        }
        
        commit.sendMessageToFrame(payload)
      })
    },
    
    initCurClazzApplyClassSubscribe: ({/*commit,*/ state, rootState, dispatch}, payload) => {
      if (state.curClazzApply.clazzSubscribeView.currentId) {
        dispatch('initCurClazzApplyClassSubscribeProc')
        
      } else {
        const userId = payload.userId
        const classId = payload.classId
  
        rootState.hiClass.clazzSubscribeViews.search({
          userId,
          classId,
          size: 1
        })
          .then(res => {
            if (res.data._embedded.clazzSubscribeViews.length > 0) {
              state.curClazzApply.clazzSubscribeView = res.data._embedded.clazzSubscribeViews[0]
              dispatch('initCurClazzApplyClassSubscribeProc')
            }
          })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.error("initCurClazzApplyClassSubscribes err => ", err);
          })
        
      }
      
    },
  
    initCurClazzApplyClassSubscribeProc: ({/*commit,*/ state /*, rootState*/}/*, payload*/) => {
      const clazzSubscribeView = state.curClazzApply.clazzSubscribeView
      const managerRoles = ['OWNER', 'MANAGER']
      
      state.curClazzApply.clazzSubscribeView = clazzSubscribeView
      if (!state.curClazzApply.model.studentName)
        state.curClazzApply.model.studentName = clazzSubscribeView.memberChildName
      if (!state.curClazzApply.model.parentName)
        state.curClazzApply.model.parentName = clazzSubscribeView.userName
  
      if (managerRoles.includes(clazzSubscribeView.memberRole))
        state.curClazzApply.isMemberRoleManager = true
    },
    
    setCurClazzModel: async ({/*commit,*/ state, rootState}, payload) => {
      return await rootState.hiClass.clazzApplies.read(`/v2/clazzApplies/${payload.applyId}`)
        .then(res => {
          state.curClazzApply.model = res.data

          if (state.curClazzApply.model.classGrade !== state.curClazzApply.classInfo.classGradeCode) {
            state.curClazzApply.model.classGrade = state.curClazzApply.classInfo.classGradeCode === 'NONE' ?
              state.curClazzApply.model.classGrade :
              state.curClazzApply.classInfo.classGradeCode
          }
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error("setCurClazzModel err => ", err);
        })
    },
    
    setCurClazzSheetInfo: async ({/*commit,*/ state, rootState}, payload) => {
      return await rootState.hiClass.sheets.read(`/sheets/${payload.sheetId}`)
        .then(res => {
          state.curClazzApply.sheetInfo = res.data
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error("setCurClazzSheetInfo err => ", err);
        })
    },
    
    clearCurClazzApply: ({/*commit,*/ state}, /*payload*/) => {
      state.curClazzApply.isMemberRoleManager = false
      state.curClazzApply.componentName = ''
      state.curClazzApply.classInfo = {}
      state.curClazzApply.clazzSubscribeView = {}
      state.curClazzApply.sheetInfo = {}
      
      state.curClazzApply.model =  {
        sheetId: null,   // required:true | 시트(양식) ID
        sheetType: 'W',   // required:true | 시트 유형(H:하이클래스,W:워크시트)
        studentName: null,
        parentName: null,
        userId: null,   // 제출자 id (보호자 userId)
        classId: null,
        applyStatus: 'TEMP',
        applyTimestamp: null,
        applyType: null,
        files: []
      }
      
    },
    
    checkCurClazzApply: ({/*commit,*/ state, rootState}, /*payload*/) => {
      rootState.log.debug('------------------------------------------')
      rootState.log.debug('state.curClazzApply.classInfo.currentId:', state.curClazzApply.classInfo.currentId)
      rootState.log.debug('state.curClazzApply.componentName:', state.curClazzApply.componentName)
      rootState.log.debug('state.curClazzApply.sheetInfo.sheetId:', state.curClazzApply.sheetInfo.sheetId)
      rootState.log.debug('state.curClazzApply.model.sheetId:', state.curClazzApply.model.sheetId)
      rootState.log.debug('state.curClazzApply.model:', state.curClazzApply.model)
      rootState.log.debug('==========================================')
      
      return new Promise((resolve, reject) => {
        if (state.curClazzApply.model.del) {
          return reject(false)
        }

        if (state.curClazzApply.classInfo.currentId) {
          return resolve(true)
        } else {
          return reject(false)
        }
      })
    },
    
    initCurClazzApply: async ({state, rootState, dispatch}, payload) => {
      const classId = payload.classId
      const sheetId = payload.sheetId
      const applyId = payload.applyId
  
      const requestUrlObj = {
        clazzes: `/clazzes/${classId}`,
        sheetInfos: `/sheetInfos/${classId}/${sheetId}`
      }
      const requestKeys = ['clazzes', 'sheetInfos']
      const resultKeys = ['classInfo', 'sheetInfo']
      const requestArr = []
      
      requestKeys.forEach(key => {
        requestArr.push(rootState.hiClass[key].read(requestUrlObj[key]))
      })
  
      if (applyId) {
        const key = 'clazzApplies'
        requestUrlObj[key] = `/${key}/${applyId}`
        requestKeys.push(key)
        resultKeys.push('model')
        requestArr.push(rootState.hiClass[key].read(requestUrlObj[key]))
      }

      try {
        const responseArr = await Promise.all(requestArr)
        let isDel = false
        for (const [index, response] of responseArr.entries()) {
          state.curClazzApply[resultKeys[index]] = response.data

          if (response.data.del) {
            isDel = true
          }
        }

        // 워크시트 신청서가 삭제된 경우
        if (isDel) {
          dispatch('clearCurClazzApply')
          const routePath = `/main/clazzes/${classId}/form/applyList?applyId=${applyId}`;
          router.replace(routePath, () => {})
          return false
        }
      } finally {
        const userId = rootState.user.currentId || localStorage.uuid
        // 학교양식 신청서 상세 진입 시 클래스 구독여부 확인
        dispatch('callCheckCurUserClassSubscribe', { classId, userId }, { root: true })

        const memberRole = state.curClazzApply.clazzSubscribeView.memberRole
        const curClassId = state.curClazzApply.classInfo.currentId

        // 작성권한이 있는지 확인
        const isParentApply = state.curClazzApply.sheetInfo.parentUsed
        const isStudentApply = state.curClazzApply.sheetInfo.studentUsed
        const userType = state.curClazzApply.clazzSubscribeView.userType
        dispatch('callCheckCurUserWriteClassApply', { isParentApply, isStudentApply, memberRole, userType, curClassId }, { root: true })

        // 신청서 상세를 조회할 수 있는지 확인 (신청자 본인, 클래스 선생님만 가능)
        const applyUserId = state.curClazzApply.model.userId
        const loginUserId = state.curClazzApply.clazzSubscribeView.userId
        dispatch('callCheckCurUserReadClassApply', { applyUserId, loginUserId, memberRole, curClassId }, { root: true })

        // 신청서 신규 작성 페이지에서 새로 고침할 경우 model 초기화 및 구독정보 재로딩
        if (!applyId) {
          const applyType = state.curClazzApply.sheetInfo.applyType
          const payload = { classId, sheetId, applyType, userId }
          dispatch('initCurClazzApplyModel', payload)
          dispatch('initCurClazzApplyClassSubscribe', payload)
        }

        dispatch('checkCurClazzApply')
      }
    },
  
    initCurClazzApplyModel: ({/*commit,*/ state, rootState, /*dispatch*/}, payload) => {
      const model = {
        sheetId: null,   // required:true | 시트(양식) ID
        sheetType: 'W',   // required:true | 시트 유형(H:하이클래스,W:워크시트)
        studentName: null,
        parentName: null,
        userId: null,   // 제출자 id (보호자 userId)
        classId: null,
        applyStatus: 'TEMP',
        applyTimestamp: null,
        applyType: null,
        files: []
      }
      
      model.userId = rootState.user.currentId || localStorage.uuid
      model.classId = payload.classId
      model.sheetId = payload.sheetId
      model.applyType = payload.applyType
      
      state.curClazzApply.model = model
      
      rootState.log.debug('initCurClazzApplyModel:',state.curClazzApply.model)
      
    }
  
  }
}

export default storeWorksheet