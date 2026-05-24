<template>
  <!-- 2022-08-01 검색결과 -->
  <div class="board__filter">
    <div class="group-filter-sub">
      <p class="text-search-result">
        <span>{{ curClassSearchQuery.keyword || userName || getDateText }}</span>&nbsp;<em v-if="curClassSearchQuery.insertedUser" class="search-date">가 작성한 게시글</em><em v-if="curClassSearchQuery.dayOfPosted" class="search-date">에 작성한 게시글</em>&nbsp;검색결과
      </p>
    </div>

    <div class="group-filter-latest" v-if="isCurClazzesPostsEmpty === false">
      <template v-if="curClassSearchQuery.keyword">
        <input 
          type="radio" name="latest" id="latest-relate" v-model="sort" value="relate"
        >
        <label for="latest-relate"><span>관련도 높은순</span></label>
      </template>
      <input type="radio" name="latest" id="latest-desc" v-model="sort" value="desc">
      <label for="latest-desc"><span>최신순</span></label>
      <input type="radio" name="latest" id="latest-asc" v-model="sort" value="asc">
      <label for="latest-asc"><span>등록순</span></label>
    </div>
  </div>
</template>

<script>
import {eventBus} from "@/main";
import {mapState, mapMutations} from "vuex";

export default {
  name: "main-body-clazzes-body-class-board-header-search-result",
  props: {
    userName: String
  },
  data() {
    return {
      sort: ""
    }
  }, 
  computed: {
    ...mapState({
      curClazzesPosts: 'curClazzesPosts',
      curClassSearchQuery: 'curClassSearchQuery',
    }),
    isCurClazzesPostsEmpty() {
      return Array.isArray(this.curClazzesPosts)
        && this.curClazzesPosts.length === 0
    },
    getDateText () {
      const date = this.curClassSearchQuery.dayOfPosted.split("-")
      return `${date[0]}년 ${date[1]}월 ${date[2]}일`
    }
  },
  watch: {
    sort(v) {
      if(v === "relate") {
        this.setCurClassSearchQueryAttr({
          sort: null
        })
      } else if(v === "desc") {
        this.setCurClassSearchQueryAttr({
          sort: "posted,desc"
        })
      } else if(v === "asc") {
        this.setCurClassSearchQueryAttr({
          sort: "posted,asc"
        })
      }
      eventBus.$emit('refresh-class-board-posts')
    }
  },
  mounted() {
    if(this.curClassSearchQuery.keyword) {
      this.sort = "relate"
    } else {
      this.sort = "desc"
    }
  },
  beforeDestroy() {
    this.setCurClassSearchQueryAttr({
      sort: "posted,desc"
    })
  },
  methods: {
    ...mapMutations({
      setCurClassSearchQueryAttr: 'setCurClassSearchQueryAttr',
    })
  }
}
</script>

<style scoped>
.group-filter-latest label {
  margin-right: 30px;
}

em.search-date {
  color: var(--primary);
}

.board__filter .group-filter-latest {
  padding-top: 16px;
}
</style>