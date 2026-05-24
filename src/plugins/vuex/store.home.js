import {getField, updateField} from 'vuex-map-fields'

const requestURL = process.env.VUE_APP_BASE_API_URI
const fileURL = process.env.VUE_APP_BASE_FILE_URI
const multipartURL = fileURL + '/multipart'

const storeHome = {
  namespaced: true,
  state: {
    requestURL,
    fileURL,
    multipartURL,
  
    sectionMains: null,
    
    sectionMainMore: null,
    sectionMainMoreSectionId: null,

    // 노출된 광고 ID
    sectionMainAdsViewed: [],
    sectionMainAdsViewQueue: [],
  
    // 초대코드로 가입하기 > step 1 초대코드 입력 팝업
    joinWithInviteCode: {
      isOpen: false,
    },
  
    // 초대코드로 가입하기 > step 2 데이터
    joinWithInviteCodeData: {
      invitedClassObj: null,
      invitedSchoolUri: null
    },
    
    // 초대코드로 가입하기 > step 2 학부모로 가입하기 팝업
    joinWithInviteCodeParents: {
      isOpen: false,
    },
    
    // 초대코드로 가입하기 > step 2 학생으로 가입하기 팝업
    joinWithInviteCodeStudent: {
      isOpen: false,
    },

    // 초대코드로 가입하기 > 가입완료후 res 구독정보 데이터
    joinWithInviteCodeSubscribe: [],
    
  },
  getters: {
    // eslint-disable-next-line
    getField,
  
    /**
     * 섹션 타입별로 섹션 정보 배열 가져오기
     *
     * @param state
     * @returns {(function(*): (*|null|undefined))|*}
     */
    getSectionsBySectionType: state => params => {
      try {
        return state.sectionMains.filter(sectionMain => sectionMain.type === params.sectionType) || []
      } catch (e) {
        return []
      }
    },
  
    /**
     * 내 소식 sectionId 가져오기
     * @param state
     * @returns {null|*|null}
     */
    myNewsSectionId: state => {
      try {
        const sections = state.sectionMains.filter(sectionMain => sectionMain.type === 'TAB') || []
        const section = sections.length > 0 ? sections[0] : {}
        const tabs = section.tabs ? section.tabs.filter(tab => tab.isFeedType) : []
        const tab = tabs.length > 0 ? tabs[0] : {}
        return tab.sectionId
        
      } catch (e) {
        return null
      }
    },
  },
  mutations: {
    // eslint-disable-next-line
    updateField,
  
    setSectionMains: (state, payload) => {
      state.sectionMains = payload.sectionMains;
    },
    setSectionMainMore: (state, payload) => {
      state.sectionMainMore = payload.sectionMainMore;
    },
    addSectionMainMore: (state, payload) => {
      payload.sectionMainMore.contents = payload.sectionMainMore.contents.map(post => {
        if (!post._links || !post._links.self || !post._links.self.href) {
          const postUri = `${requestURL}/posts/${post.currentId}`
          const _links = {
            self: {
              href: postUri
            }
          }
          post._links = Object.assign({}, _links)
        }
        return post
      })
  
      state.sectionMainMore === null
        ? state.sectionMainMore = payload.sectionMainMore
        : state.sectionMainMore.contents.push(...payload.sectionMainMore.contents)
    },
    setSectionMainMoreSectionId: (state, payload) => {
      state.sectionMainMoreSectionId = payload.sectionId;
    },
    setJoinWithInviteCode: (state, payload) => {
      if (payload) {
        for (const [key, value] of Object.entries(payload))
          state.joinWithInviteCode[key] = value
      }
    },
    setJoinWithInviteCodeData: (state, payload) => {
      if (payload) {
        for (const [key, value] of Object.entries(payload))
          state.joinWithInviteCodeData[key] = value
      }
    },
    setJoinWithInviteCodeParents: (state, payload) => {
      if (payload) {
        for (const [key, value] of Object.entries(payload))
          state.joinWithInviteCodeParents[key] = value
      }
    },
    setJoinWithInviteCodeStudent: (state, payload) => {
      if (payload) {
        for (const [key, value] of Object.entries(payload))
          state.joinWithInviteCodeStudent[key] = value
      }
    },
    addSectionMainAdsViewQueue: (state, payload) => {
      state.sectionMainAdsViewQueue.push(payload.sectionMainAdsViewQueue)
    },
    clearSectionMainAdsView: state => {
      state.sectionMainAdsViewed = []
      state.sectionMainAdsViewQueue = []
    },
    addJoinWithInviteCodeSubscribe: (state, subscribe) => {
      state.joinWithInviteCodeSubscribe.push(subscribe)
    },
  },
  actions: {
    getSectionMains: ({commit, /*state,*/ rootState}/*, payload*/) => {
      const userType = rootState.user.userType || localStorage.userType
      const deviceType = /*payload.deviceType || */ 'WEB'
      rootState.axios({
        method: 'get',
        url: `v2/sectionMain/${userType}/${deviceType}`
      })
        .then(res => {
          commit('setSectionMains', { sectionMains: res.data._embedded })
        })
        .catch(err => {
          rootState.log.error('getSectionMains() err:', err)
          commit('setSectionMains', { sectionMains: null })
        })
    },
    removeSectionMains: ({commit/*, state, rootState*/}/*, payload*/) => {
      commit('setSectionMains', { sectionMains: null })
    },
    searchSectionMainMore: ({commit, state, rootState}/*, payload*/) => {
      if (rootState.infiniteScroll.isBusy || !state.sectionMainMoreSectionId)
        return false
      
      if (!rootState.infiniteScroll.isBusy && !rootState.infiniteScroll.isListEnd) {
        rootState.infiniteScroll.isBusy = true
  
        const userType = rootState.user.userType || localStorage.userType
        const deviceType = /*payload.deviceType || */ 'WEB'
        const params = {
          userType,
          deviceType,
          sectionId: state.sectionMainMoreSectionId
        }
        params.page = rootState.infiniteScroll.page
        params.size = 7 // rootState.infiniteScroll.size
        params.sort = 'posted,desc'
  
        rootState.axios({
          method: 'post',
          url: `/sectionMain/more`,
          params
        })
          .then(res => {
            commit('addSectionMainMore', { sectionMainMore: res.data })
  
            res.data.contents.length === params.size
              ? rootState.infiniteScroll.page++
              : rootState.infiniteScroll.isListEnd = true
             
            /**
             * test case -> empty
             */
            // rootState.infiniteScroll.isListEnd = true
            // state.sectionMainMore.contents = []
            // commit('setSectionMainMore', { sectionMainMore: state.sectionMainMore })
          })
          .catch(err => {
            rootState.log.error('getSectionMains() err:', err)
            commit('setSectionMainMore', { sectionMainMore: null })
          })
          .finally(() => {
            rootState.infiniteScroll.isBusy = false
          })
      }
    },
    removeSectionMainMore: ({commit/*, state, rootState*/}/*, payload*/) => {
      commit('setSectionMainMoreSectionId', { sectionId: null })
      commit('setSectionMainMore', { sectionMainMore: null })
    },
    removeSectionMainMoreOnly: ({commit/*, state, rootState*/}/*, payload*/) => {
      commit('setSectionMainMore', { sectionMainMore: null })
    },
    toggleJoinWithInviteCode: ({commit/*, state*/}, payload) => {
      commit('setJoinWithInviteCode', payload)
    },
    // 초대코드로 가입하기 nextStep 팝업 요청
    callJoinWithInviteCodeNextStep: ({commit/*, state*/, rootState, dispatch}, payload) => {
      commit('setJoinWithInviteCodeData', payload)
      
      switch (rootState.user.userType) {
        case 'TEACHER':
        case 'PARENTS':
          dispatch('openJoinWithInviteCodeParents')
          break
        case 'STUDENT':
          dispatch('openJoinWithInviteCodeStudent')
          break
        default:
          dispatch('openJoinWithInviteCodeParents')
      }
  
      // 초대코드 입력 팝업 닫기
      const JoinWithInviteCode = { isOpen: false }
      dispatch('toggleJoinWithInviteCode', JoinWithInviteCode)
    },
    openJoinWithInviteCodeParents: ({commit/*, state, rootState*/}) => {
      commit('setJoinWithInviteCodeParents', {
        isOpen: true
      })
      
    },
    openJoinWithInviteCodeStudent: ({commit/*, state, rootState*/}) => {
      commit('setJoinWithInviteCodeStudent', {
        isOpen: true
      })
    },
    // 초대코드로 가입하기 nextStep 팝업 데이터 초기화
    initJoinWithInviteCodeNextStep: ({commit/*, state, rootState*/}) => {
      const joinWithInviteCodeData = {
        invitedClassObj: null,
        invitedSchoolUri: null
      }
      commit('setJoinWithInviteCodeData', joinWithInviteCodeData)
    },
    // 초대코드로 가입하기 nextStep 팝업 닫기
    closeJoinWithInviteCodeNextStep: ({commit/*, state, rootState*/, dispatch}) => {
      commit('setJoinWithInviteCodeParents', { isOpen: false })
      commit('setJoinWithInviteCodeStudent', { isOpen: false })
      dispatch('initJoinWithInviteCodeNextStep')
    },
  
    // 홈 화면의 링크 클릭
    callHomeContentsLink: ({dispatch/*, commit, getters, rootGetters*/, rootState}, payload) => {
      /**
       *
       */
      
      // content
      /**
       * sectionMains > content
       *
       * 게시글 연결
       *
        adAosId:1147
        adIosId:1148
        adWebId:1146
    
        contents:"08f96001-d39d-4d3f-bfa7-8ab2cb97a497"
        contentsType:"POST"
    
        detailId:668
    
        linkId:null
        linkType:"INTERNAL"
    
        postId:"08f96001-d39d-4d3f-bfa7-8ab2cb97a497"
        postType:"CP_BOARD"
    
        title:"숨은 기능"
        titlePoint:"[강조]"
 
        version:"V1"
       */
      
      /**
       * sectionMains > content
       *
       * 링크 URL 연결
       *
        adAosId:null
        adIosId:null
        adWebId:null
       
        contents:"https://hc18110910.notion.site/5e15cc3b21d249ec802a6fff9bef00c2#d746e28e8a2648b0a0f3ab17e138a62a"
        contentsType:"LINK"
       
        detailId:678
       
        file:Object
        fileOriginalPath:"https://download.hiclass.net/7e60/8060/9860/d060/4fd114cb-fa2f-41d2-86ed-b571924061fa.png"
        fileThumbnailPath:null
       
        linkId:"LK000121"
        linkType:"EXTERNAL"
       
        postId:null
        postType:null
        title:"학교 구독/취소"
        titlePoint:"가이드"
        titleSub:""
        version:null
       */
      
      /**
       * sectionMains > content
       *
       * CP HOME ----> 해당 CP 홈 화면으로 이동
       *
  
        adAosId:null
        adIosId:null
        adWebId:null
        contents:"CPID000008"
        contentsType:"CP_HOME"
        detailId:681
        file:null
        linkId:null
        linkType:"INTERNAL"
        postId:null
        postType:null
        title:"하이클래스"
        titlePoint:"CPHOME"
        titleSub:""
        version:null
       
       */
      
      
      /**
       * sectionMains > content
       *
       * MENU ----> 해당 메뉴 화면으로 이동
       *
        adAosId:null
        adIosId:null
        adWebId:null
        contents:"CLAZZ"
        contentsType:"MENU"
        detailId:679
        file:null
        linkId:null
        linkType:"INTERNAL"
        postId:null
        postType:null
        title:"클래스 메뉴"
        titlePoint:"메뉴"
        titleSub:""
        version:null
       */

      // 링크 클릭 시 광고 수 증가 (type: 클릭)
      if (payload.adWebId) {
        const parameter = {
          adIds: [ payload.adWebId ],
          type: 'CLICK'
        }
        dispatch('increaseAdsCount', parameter, { root: true })
      }
      
      switch (payload.contentsType) {
        case 'POST':
          // root 저장소의 action 사용
          if (!payload.postId && payload.contents)
            payload.postId = payload.contents
          
          dispatch('openPostDetailByPostId', payload, { root: true })
          break
        case 'LINK':
          if (payload.linkType === 'INTERNAL')
            dispatch('openInternalWebLink', payload, { root: true })
          else if (payload.linkType === 'EXTERNAL')
            dispatch('openExternalWebLink', payload, { root: true })
          break
        case 'CP_HOME':
          rootState.hiClass.alert('TBD: ' + payload.title + ' CP 홈화면으로 이동', 'info')
          break
        case 'MENU':
          rootState.hiClass.alert('TBD: ' + payload.title + ' 화면으로 이동', 'info')
          break
      }
      
    },
    /**
     * 홈 사용자에게 노출된 배너, 팝업 광고 수 증가
     * @param state
     * @param dispatch
     */
    checkSectionMainAdsView: ({state, dispatch}) => {
      if (state.sectionMainAdsViewQueue.length > 0) {
        const parameter = {
          adIds: state.sectionMainAdsViewQueue,
          type: 'VIEW'
        }
        dispatch('increaseAdsCount', parameter, { root: true })

        state.sectionMainAdsViewed.push(...state.sectionMainAdsViewQueue)
        state.sectionMainAdsViewQueue.splice(0)
      }
    },

    onClickPopup: ({ dispatch }, payload) => {
      // 광고 팝업 클릭 시 광고 수 증가 (type: 클릭)
      if (payload.adWebId) {
        const parameter = {
          adIds: [ payload.adWebId ],
          type: 'CLICK'
        }
        dispatch('increaseAdsCount', parameter, { root: true })
      }
    },

    visibilityChangedByContent: ({state, commit, dispatch}, payload) => {
      const content = payload.content
      const adWebId = content.adWebId

      if (adWebId && !state.sectionMainAdsViewed.includes(adWebId))
        commit('addSectionMainAdsViewQueue', { sectionMainAdsViewQueue: adWebId })

      setTimeout(() => dispatch('checkSectionMainAdsView'), 500)
    },

    spliceJoinWithInviteCodeSubscribe: ({state, commit, dispatch}, payload) => {
      const targetIndex = state.joinWithInviteCodeSubscribe.findIndex(subscribe => {
        return subscribe.currentId === payload.clazzSubscribesId
      })
      if (targetIndex > -1) {
        state.joinWithInviteCodeSubscribe.splice(targetIndex, 1)
      }
    }
    
  }
}

export default storeHome