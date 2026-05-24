import axios from "@/plugins/axios";
import moment from "moment";

const storeClazzTag = {
  namespaced: true,
  state: {
    clazzTags: [],
    localUpdateTimestamp: null
  },
  mutations: {
    setLocalUpdateTimestamp(state, timestamp) {
      state.localUpdateTimestamp = timestamp
    },
    setClazzTags(state, clazzTags) {
      state.clazzTags = clazzTags
      state.localUpdateTimestamp = moment().valueOf()
    },
    setTagNameByIdx(state, {idx, tagName}) {
      state.clazzTags[idx].tagName = tagName
      state.localUpdateTimestamp = moment().valueOf()
    },
    addClazzTags(state, tag) {
      if (state.clazzTags.findIndex(t => t.tagId === tag.tagId) > -1) return
      state.clazzTags.push(tag)
      state.localUpdateTimestamp = moment().valueOf()
    },
    removeTagByIdx(state, idx) {
      state.clazzTags.splice(idx, 1)
      state.localUpdateTimestamp = moment().valueOf()
    }
  },
  actions: {
    fetchTags: async ({state, dispatch}, classId) => {
      if (!classId) return null

      const lastUpdatedTime = await dispatch('loadTagLastUpdatedTime', classId)
      if (state.localUpdateTimestamp === null || state.localUpdateTimestamp < lastUpdatedTime) {
        dispatch('loadTags', classId)
      }
    },
    loadTagLastUpdatedTime: async ({state, dispatch}, classId) => {
      if (!classId) return 0

      try {
        const res = await axios.get(`/clazzes/${classId}/tags/lastupdatedtime`)
        return res.data.timestamp
      } catch(err) {
        return 0
      }
    },
    loadTags: async ({commit}, classId) => {
      if (!classId) commit('setClazzTags', [])

      try {
        const res = await axios.get(`/clazzes/${classId}/tags`)
        commit('setLocalUpdateTimestamp', moment().valueOf())
        commit('setClazzTags', res.data._embedded.clazzTags)
      } catch(err) {
        commit('setClazzTags', [])
      }
    },
    resetClazzTagState: ({commit}) => {
      commit('setClazzTags', [])
      commit('setLocalUpdateTimestamp', null)
    }
  }
}

export default storeClazzTag