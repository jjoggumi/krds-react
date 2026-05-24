<template>
  <div class="searchbox__layer">
    <Pager :search="loadPage" :searchParams="searchParams">
      <template v-slot:item="{ item }">
        <button @click="selectUser(item)">
          <div class="image">
            <img :src="getUserPhoto(item.userPhoto)" alt="" />
          </div>
          <div class="text"><strong class="highlight">{{ item.userName }}</strong> {{ getUserType(item.userType, item.memberChildName) }}</div>
        </button>
      </template>
      <template v-slot:nodata>
        <div class="nodata">
          <p>검색 결과가 없습니다.</p>
        </div>
      </template>
    </Pager>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import { Pager } from "@/components/InfiniteScroll";

export default {
  name: "member-list",
  components: { Pager},
  props: {
    userName: String
  },
  computed: {
    ...mapGetters({
      curClassId: 'curClassId'
    }),
  }, 
  watch: {
    userName(v) {
      this.searchParams.userName = v
    }
  }, 
  data() {
    return {
      api: process.env.VUE_APP_BASE_API_URI,
      searchParams: {
        userName: "",
      }
    }
  },
  mounted() {
    this.searchParams.userName = this.userName
  },
  methods: {
    async loadPage({ page, userName }) {
      try {
        const params = { 
          classId: this.curClassId,
          userTypes: 'STUDENT, TEACHER, PARENTS', 
          memberStatus: "ACCEPT",
          masking: true, 
          page,
          sort: ['userName,asc','memberChildName,asc']
        }

        if(userName && userName !== "") params.userName = userName

        const res = await this.$axios({
            method: 'POST',
            url: `${this.api}/clazzSubscribeViews/!q`,
            params: params
        })

        return res.data._embedded.clazzSubscribeViews
      } catch (err) {}
    },
    getUserPhoto(data) {
      if(data) {
        return data
      } else {
        return "/files/img/profile_default.png"
      }
    },
    getUserType(userType, memberChildName){
      switch(userType) {
        case "TEACHER":
          return "선생님"

        case "PARENTS":
          return `(${memberChildName} 학부모)`

        default: 
          return `(${memberChildName} 학생)`
      }
    },
    selectUser(item) {
      this.$emit('searchUser', item)
    }
  }
}
</script>

<style scoped>
.searchbox__layer {
  display: block;
  overflow: hidden;
}

.searchbox__layer .text .highlight {
  word-break: break-all;
}
</style>