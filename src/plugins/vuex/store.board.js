import Vue from "vue";
import router from "@/plugins/router";

const REQUEST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

const storeBoard = {
  namespaced: true,
  state: {
    apiRequestUrl: {
      /**
       * <h1>게시판/폴더 목록</h1>
       *
       * <p>board list</p>
       * <p>[GET] /clazzes/${classId}/board</p>
       */
      clazzes: '/clazzes',
      boards: '/boards'
    },
    boardFiles: [],
    boardAllCheck: false, //파일 전체선택
    boardCheckBoxes: [], //파일
    boardFilePage: 0,
    boardFileTotalPage: 0,
    boardFileTotalCount: 0,
    // 현재 클래스의 게시판/폴더 목록
    curBoardList: [],

    // 현재 클래스의 선택된 게시판 id
    curBoardId: null,
    // 현재 클래스의 선택된 게시판 폴더 id
    curBoardFolderId: null,
    isProgress: false,
    progress: 0,
    progressTimerId: null,
  },
  getters: {
    curBoard: (state, getters, rootState) => {
      if (state.curBoardList.length > 0) {
        const boardId = state.curBoardId
        const foundItem = state.curBoardList.find(board => board.boardId === boardId)
        return foundItem || {}
      } else {
        return {}
      }
    },

  },
  mutations: {
    setCurBoardList(state, payload) {
      state.curBoardList = payload
    },
    setCurBoardId(state, payload) {
      state.curBoardId = payload
    },
    setCurBoardFolderId(state, payload) {
      state.curBoardFolderId = payload
    },
    setIsProgress(state, payload){
      state.isProgress = payload
    },
    setProgress(state, payLoad){
      state.progress = payLoad
    },
    setProgressTimerId(state, payLoad){
      state.progressTimerId = payLoad
    },
    clearProgressTimerId(state) {
      if (state.progressTimerId) {
        clearTimeout(state.progressTimerId);
        state.progressTimerId = null;
      }
    }

  },
  actions: {
    /**
     * 게시판/폴더 목록 board list 가져오기
     */
    getBoardList: ({state, rootState}, payload) => {
      const classId = payload.classId

      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `${state.apiRequestUrl.clazzes}/${classId}/board`,
        params: payload
      })
        .then(res => {
          rootState.log.debug(res)
          return res.data._embedded && res.data._embedded.boardList
            ? res.data._embedded.boardList
            : []
        })
        .catch(err => {
          rootState.log.warn(err)
          rootState.hiClass.alert(err, 'error')
        })
    },
    /**
     * 게시판/폴더 목록 board 상세설정 가져오기
     */
    getBoardInfo: ({state, rootState}, payload) => {
      const boardId = payload
      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `/boards/${boardId}`,
        params: {visibleAllFolders: true, visiblePermissionCount: true}
      })
        .then(res => {
          return res.data
        })
        .catch(err => {
          rootState.log.warn(err)
          rootState.hiClass.alert(err, 'error')
        })
    },
    /**
     * 폴더 list 가져오기
     */
    getFolderList: ({state, rootState}, payload) => {
      const boardId = payload.boardId
      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `/boardFolders/board/${boardId}/!q`,
        params: payload
      })
        .then(res => {
          return res.data._embedded
        })
        .catch(err => {
          rootState.log.warn(err)
          rootState.hiClass.alert(err, 'error')
        })
    },
    initCurBoardList: async ({state, commit, dispatch}, { classId }) => {
      return new Promise(async resolve => {
        const boardList = await dispatch('getBoardList', { classId })
        if (localStorage.userType === 'TEACHER' && boardList.find(b => b.boardType === 'SECRET')) {
          const managedBoardList = await dispatch('getBoardListForManager', { classId })
          boardList.filter(b => b.boardType === 'SECRET').forEach(b => {
            b.boardPermission = {...b.boardPermission, 
              ...(managedBoardList.find(mb => mb.boardId === b.boardId) || {boardPermission: {}}).boardPermission}
          })
        }
        await commit('setCurBoardList', boardList)
        resolve(boardList)
      })
    },
    initCurBoardListUpdate: async ({state, commit, dispatch}, payload) => {
      await commit('setCurBoardList', payload)
    },
    clearCurBoardList: ({commit}) => {
      commit('setCurBoardList', [])
    },
    /**
     * 게시판 글 생성
     */
    createBoard: async({state, rootState}, payload) => {
      try {
        const res = await rootState.axios({
          method: REQUEST_METHOD.POST,
          url: `/boards/add`,
          data: payload
        })
        return res.data
      } catch(err){
        rootState.log.warn(err)
        rootState.hiClass.alert(err, 'error')
        return;
      }
    },
    /**
     * 게시판 상세
     */
    readBoard: ({state, rootState}, payload) => {
      rootState.log.debug('store.board readBoard() payload', payload)
      return rootState.axios({
        method: REQUEST_METHOD.GET,
        url: `/boards/${payload.boardId}`
      })
        .then(res => {
          return res.data
        })
        .catch(err => {
          rootState.log.warn(err)
          rootState.hiClass.alert(err, 'error')
        })
    },
    /**
     * 게시판 글 수정
     */
    updateBoard: async ({state, rootState}, payload) => {
        try {
          const res = await rootState.axios({
            method: REQUEST_METHOD.PATCH,
            url: `/boards/${payload.boardId}`,
            data: payload
          })
          return res;
        } catch (err) {
          if (err.response.status === 428) {
            return 428
          } else if (err.response.status === 418) {
            return 418 
          } else if (err.response.status === 404) {
            return 404
          } else {
            rootState.log.warn(err)
            rootState.hiClass.alert(err, 'error')
          }
        }
    },
    /**
     * 게시판 글삭제
     */
    deleteBoardPost: async ({state, rootState}, payload) => {
      try {
        const res = await rootState.axios({
          method: REQUEST_METHOD.DELETE,
          url: `/boards/${payload.boardId}`,
          params: payload.boardId
        })
        return res
      } catch(err){
        rootState.log.warn(err)
        return err
      }
    },

    /**
     * 클래스 메뉴 진입 권한 체크 (게시글 제외)
     */
    checkClassMenuEntryPermission: ({state, commit,rootState}, payload) => {
      // TODO: 게시판 사용 금지 설정 or 권한이 없는 사용자 main 으로 이동 처리
      const toastMessage = payload.message || '사용 중지된 게시판이거나 읽기 권한이 없습니다.'
      const routePath = payload.routePath || '/main'
      const isManager = payload.isManager || false

      if (!isManager) {
        // 게시글 상세 레이어 닫기
        commit('setIsShowDetailPostLayer', false, { root: true })
        Vue.toasted.show(toastMessage)
        router.push(routePath, () => {})
      }
    },
    /**
     * 게시판 순서 변경
     */
    updateBoardSortNo: ({state, rootState, commit}, payload) => {
      const classId = payload.classId
      return rootState.axios({
        method: REQUEST_METHOD.PATCH,
        url: `${state.apiRequestUrl.boards}/sort-no${state.apiRequestUrl.clazzes}/${classId}`,
        data: {request: payload.request}
      })
    },
    existsClassBoardOrFolder: async ({state, dispatch, rootState}, payload) => {
      const boardId = payload.boardId
      const folderId = payload.folderId
      const isClassOwnerOrManager = payload.isClassOwnerOrManager || false

      const boardDetail = await dispatch('readBoard', { boardId })
      const isDeletedBoard = boardDetail.isDel
      const isDeletedFolder = (boardDetail.isUsedFolder && !folderId)
        || (folderId && !boardDetail.folders.find(folder => folder.folderId === folderId))
      const isAllowBoard = rootState.hiClass.itemReadUsed(boardDetail, isClassOwnerOrManager)

      rootState.log.debug(
        'existsClassBoardOrFolder',
        'isDeletedBoard:', isDeletedBoard,
        'isDeletedFolder:', isDeletedFolder,
        'isAllowBoard:', isAllowBoard,
      )

      let invalidBoardOrFolder = false
      if (isDeletedBoard || isDeletedFolder || !isAllowBoard) {
        invalidBoardOrFolder = true
      }

      if (invalidBoardOrFolder) {
        const classId = boardDetail.parentId
        window.location.replace(`/main/clazzes/${classId}`)

        // TODO: 수정 중인 게시판이나 폴더가 삭제된 경우 현재 클래스 정보를 새로 고침 검토
        // router.replace(routePath, () => {})
        // eventBus.$emit('do-reload-class')
      }
    },
    getSecretBoardUsers: async ({state, rootState}, boardId) => {
      try {
        const res = await rootState.axios.get(`/boards/${boardId}/users`, { params: { isReadable: true } });
        return (res.data._embedded || {}).boardUsers || [];
      } catch (err) {
        rootState.log.warn(err);
        rootState.hiClass.alert(err, 'error');
      }
    },
    getBoardListForManager: async ({state, rootState}, payload) => {
      const classId = payload.classId
      try {
        const res = await rootState.axios.get(`${state.apiRequestUrl.clazzes}/${classId}/board/manage-list`, { params: payload });
        rootState.log.debug(res);
        return res.data._embedded && res.data._embedded.boardList ? res.data._embedded.boardList : [];
      } catch (err) {
        rootState.log.warn(err);
        rootState.hiClass.alert(err, 'error');
      }
    },
    getPostReadUsers: async ({state, rootState}, {classId, postId}) => {
      const res = await rootState.axios.get(`/clazzes/${classId}/post/${postId}/readUsers`);
      return res.data._embedded && res.data._embedded.postReadUsers ? res.data._embedded.postReadUsers : [];
    },
  }
}

export default storeBoard