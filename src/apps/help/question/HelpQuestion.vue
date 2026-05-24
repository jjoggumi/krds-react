<template>
  <div class="right-cont-wrap">
    <div class="contetns-title-wrap">
      <div class="title">{{ $t('help.question.title') }}</div>
    </div>

    <component
      v-bind:is="editMode"
      :items="items.questions"
      :queryCategoryName="queryCategoryName"
      @is-Write="toggleWriteMode"
      @is-result="childEvent"
      @setQueryCategoryName="setQueryCategoryName"
    />
  </div>
</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";
import {mapActions} from "vuex";

const helpQuestionNotFound = () => ({
  component: import('./HelpQuestionNotFound'),
  error: ErrorLoadFailAsyncComponent,
})
const helpQuestionWrite = () => ({
  component: import('./HelpQuestionWrite'),
  error: ErrorLoadFailAsyncComponent,
})
const helpQuestionList = () => ({
  component: import('./HelpQuestionList'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'helpQuestion',
  components: {
    helpQuestionNotFound,
    helpQuestionWrite,
    helpQuestionList,
  },
  props: {
    isLogin: Boolean
  },
  data: () => ({
    option: {
      isWrite: false,
      isLoad: false
    },
    searchForm: {
      sort: 'insertedTimestamp,desc',
      page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
      size: 200
    },
    items: {
      questions: [],
      limit: 0
    },
    isShowWriteForm: false,
    helpQuestions: [],
    count: 0,
    queryCategoryName: ''
  }),
  // created() {
  //   if (!this.isLogin) {
  //     alert('권한이 없습니다.')
  //     this.$router.push('/', () => {})
  //   }
  // },
  mounted() {
    this.loginCheck()
    this.getQuestions()

    if (this.$route.query.isWrite && this.$route.query.isWrite === 'true') {
      this.toggleWriteMode(true)
    }
    if (this.$route.query.category) {
      this.setQueryCategoryName(this.$route.query.category)
    }
    this.$router.replace({ query: {} })
  },
  computed: {
    editMode() {
      if (!this.option.isLoad) {
        return null
      }

      if (this.option.isWrite) {
        return 'helpQuestionWrite'
      } else {
        if (this.items.limit > 0) {
          return 'helpQuestionList'
        } else {
          return 'helpQuestionNotFound'
        }
      }
    }
  },
  methods: {
    ...mapActions({
      initBeforeLoginPath: 'initBeforeLoginPath'
    }),
    loginCheck(){
      // 로그인 체크 추가
      if (!this.isLogin || !this.$authentication.isAuthenticated()) {
        alert('권한이 없습니다.')
        // this.initBeforeLoginPath("/help/question")

        sessionStorage.setItem('initBeforeLoginPath', '/help/question')
        this.$router.push('/', () => {})
        return false
      }
    }, 
    getQuestions() {
      this.$hiClass.helpChats
        .search(this.searchForm)
        .then(res => {
          this.items.questions = res.data._embedded.helpChats || []
          this.items.limit = res.data.page.totalElements || 0
        })
        .catch(err => {
          this.$log.debug(this.$options.name, ' getQuestions() error => ', err)
        })
        .finally(() => (this.option.isLoad = true))
    },
    toggleWriteMode(toggle) {
      this.option.isWrite = toggle
    },
    childEvent(type) {
      this.option.isWrite = type
      this.getQuestions()
    },
    setQueryCategoryName(categoryName) {
      this.queryCategoryName = categoryName
    }
  }
}
</script>
