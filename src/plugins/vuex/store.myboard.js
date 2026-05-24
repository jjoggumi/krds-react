import {getField, updateField} from 'vuex-map-fields'

const requestURL = process.env.VUE_APP_BASE_API_URI
const fileURL = process.env.VUE_APP_BASE_FILE_URI
const multipartURL = fileURL + '/multipart'

const storeMyBoard = {
  namespaced: true,
  state: {
    requestURL,
    fileURL,
    multipartURL,
    
    lnb: {
      currentTabIndex: 0,
      tabTitles: [
        '최근 3개월간 소식',
        ''
      ]
    },
    
    postNotReplies: null,
    
    searchPostNotRepliesQuery: {
      replay: 'NONE'
    },

    visibleMyBoard: true
    
  },
  getters: {
    // eslint-disable-next-line
    getField,
    
  },
  mutations: {
    // eslint-disable-next-line
    updateField,
  
    setPostNotReplies: (state, payload) => {
      state.postNotReplies = payload.postNotReplies;
    },
    addPostNotReplies: (state, payload) => {
      payload.postNotReplies.posts = payload.postNotReplies.posts.map(post => {
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
    
      state.postNotReplies === null
        ? state.postNotReplies = payload.postNotReplies
        : state.postNotReplies.posts.push(...payload.postNotReplies.posts)
    },
    
  },
  actions: {
    removePostNotReplies: ({commit/*, state, rootState*/}/*, payload*/) => {
      commit('setPostNotReplies', { postNotReplies: null })
    },
    searchPostNotReplies: ({commit, state, rootState}/*, payload*/) => {
      if (rootState.infiniteScroll.isBusy) // || !state.sectionMainMoreSectionId)
        return false
    
      if (!rootState.infiniteScroll.isBusy && !rootState.infiniteScroll.isListEnd) {
        rootState.infiniteScroll.isBusy = true
        
        const params = {
          reply: state.searchPostNotRepliesQuery.reply
        }
        params.page = rootState.infiniteScroll.page
        params.size = 7 // rootState.infiniteScroll.size
        params.sort = 'posted,desc'
      
        rootState.axios({
          method: 'POST',
          url: `/postNotReplies/!q`,
          params
        })
          .then(res => {
            commit('addPostNotReplies', { postNotReplies: res.data._embedded })
          
            res.data._embedded.posts.length === params.size
              ? rootState.infiniteScroll.page++
              : rootState.infiniteScroll.isListEnd = true
          
            /**
             * TODO: test case -> empty
             */
          })
          .catch(err => {
            rootState.log.error('getSectionMains() err:', err)
            commit('setPostNotReplies', { postNotReplies: null })
          })
          .finally(() => {
            rootState.infiniteScroll.isBusy = false
          })
      }
    },

    reloadMyBoard: ({ state }) => {
      state.visibleMyBoard = false
      setTimeout(() => {
        state.visibleMyBoard = true
      }, 200)
    },
    
  }
}

export default storeMyBoard