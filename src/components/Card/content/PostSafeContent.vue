<template>
  <div class="safe-content" v-if="!item === false && isSearch === true">
    <span class="title">오늘의 안전 수칙</span>
    <p v-html="searchedWord"></p>
  </div>
</template>

<script>
import { mapState } from "vuex"

export default {
  name: 'post-safe-content',
  props: {
    postOptions: Array,
    searchKeyword: String
  },
  data() {
    return {
      item: null,
      isSearch: true
    }
  },
  computed: {
    ...mapState({
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    searchedWord() {
      let title = this.item.value
      let search = this.curClassSearchQuery.keyword || this.searchKeyword || null
      title = title ? title.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : title
      if (search) {
        const regex = new RegExp(`(${search})(?![^<]*>)(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;]*;)`, "gi")
        title = title.replace(regex, "<span class='highlight'>" + search + "</span>")
      }
      
      return title
    }
  },
  mounted() {
    const obj = this.postOptions.find(v => v.name === 'safetyRoles')
    if(!obj === false && obj.value !== "") {
      this.item = obj
      let search = this.curClassSearchQuery.keyword || this.searchKeyword || null
      if (search) {
        if(this.item.value.includes(search) === false) {
          this.isSearch = false
        }
      }
    }
  }
}
</script>