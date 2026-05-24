<template>
  <component
    v-bind:is="editMode"
    :items="items.questions"
    @is-Write="toggleWriteMode"
    @is-result="childEvent"
  />
</template>

<script>
import ErrorLoadFailAsyncComponent from "@/apps/error/ErrorLoadFailAsyncComponent";

const helpQuestionNotFound = () => ({
  component: import('./MobileHelpQuestionNotFound'),
  error: ErrorLoadFailAsyncComponent,
})
const helpQuestionWrite = () => ({
  component: import('./MobileHelpQuestionWrite'),
  error: ErrorLoadFailAsyncComponent,
})
const helpQuestionList = () => ({
  component: import('./MobileHelpQuestionList'),
  error: ErrorLoadFailAsyncComponent,
})
const helpQuestionAlert = () => ({
  component: import('./MobileHelpQuestionAlert'),
  error: ErrorLoadFailAsyncComponent,
})

export default {
  name: 'MobileHelpQuestion',
  components: {
    helpQuestionNotFound,
    helpQuestionWrite,
    helpQuestionList,
    helpQuestionAlert
  },
  data() {
    return {
      option: {
        isWrite: false,
        isLoad: false
      },
      searchForm: {
        _user: `${process.env.VUE_APP_BASE_API_URI}/users/${this.$route.query.uuid}`,
        sort: 'insertedTimestamp,desc',
        page: parseInt(process.env.VUE_APP_BASE_PAGE_START, 10),
        size: 100
      },
      items: {
        questions: [],
        limit: 0
      },
      // uuid: null,
      // idToken: null
    }
  },
  computed: {
    editMode() {
      if (!this.option.isLoad) {
        return null
      }

      if (!localStorage.uuid || !localStorage.idToken) {
        return 'helpQuestionAlert'
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
  created() {
    // this.uuid = localStorage.getItem('uuid') || null
    // this.idToken = localStorage.getItem('idToken') || null
  },
  mounted() {
    this.getQuestions()
  },
  methods: {
    getQuestions() {
      if (!localStorage.idToken) {
        this.option.isLoad = true
        return;
      }

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
    }
  }
}
</script>

<!--<style scoped src="../../../../assets/css/m-customer.css" />-->
