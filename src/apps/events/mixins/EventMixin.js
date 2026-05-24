import axiosModules from "axios";
import axios from "axios";

export default {
  data() {
    return {
      fullScreenEvents: {
        idNameMap: {},
        eventPosts: {}
      },
      urlMap: {}
    }
  },
  computed: {
    profile() {
      return process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net' ?
        'production'
        : ['https://devui.hiclass.net', 'https://devboard.hiclass.net'].includes(process.env.VUE_APP_BASE_UI_URI) ?
          'dev' :
          'stage';
    }
  },
  methods: {
    async getUrlMap() {
      try {
        const url = `${process.env.VUE_APP_URL_PROTOCOL}${process.env.VUE_APP_BASE_CDN_URI}/static/event/${this.profile}/urlMap.json`;
        const config = { cache: false, headers: { 'Content-Type': 'application/json' } };
        const res = await axios.get(url, config);
        this.urlMap = res.data;
      } catch {
        this.urlMap = {};
      }
    },
    async getFullScreenEvents() {
      try {
        const url = `${process.env.VUE_APP_URL_PROTOCOL}${process.env.VUE_APP_BASE_CDN_URI}/static/event/${this.profile}/fullScreenEvents.json`;
        const config = { cache: false, headers: { 'Content-Type': 'application/json' } };
        const res = await axiosModules.get(url, config);
        this.fullScreenEvents = res.data;
      } catch {
        this.fullScreenEvents = {};
      }
    },
    getEventName(postId) {
      if (!this.fullScreenEvents.idNameMap[postId]) return '';
      return this.fullScreenEvents.idNameMap[postId];
    },
    getEventByPostId(postId) {
      const eventName = this.getEventName(postId);
      return this.getEventByEventName(eventName);
    },
    getEventByEventName(eventName) {
      if (eventName === '') return null;
      if (!this.fullScreenEvents.eventPosts[eventName]) return null;
      return this.fullScreenEvents.eventPosts[eventName];
    }
  }
}