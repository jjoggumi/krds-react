<template>
  <div
    class="hi-selectbox"
    :class="{
      'is-opened': isOpen.linkPageId
    }"
    v-click-outside="closeLinkPageId"
  >
    <button
      class="selected"
      @click="toggleLinkPageId"
    >
      {{ getLinkPageTitle(item.linkPageId) }}
    </button>
    <div class="option__layer">
      <button
        class="option"
        :class="{
          'is-selected': item.linkPageId === null
        }"
        :value="null"
        @click="selectLinkPage(null)"
      >
        다음 페이지로 이동
      </button>

      <button
        v-for="page of surveyEditPagesSimple"
        :key="page.pageId"
        class="option"
        :class="{
          'is-selected': item.linkPageId === page.pageId
        }"
        :value="page.pageId"
        @click="selectLinkPage(page.pageId)"
      >
        {{ `${page.sortNo}P ${(page.pageName || '')} 이동` }}
      </button>

      <button
        v-if="isVisibleSubmitOption"
        class="option"
        :class="{
          'is-selected': item.linkPageId === '00000000-0000-0000-0000-000000000000'
        }"
        :value="'00000000-0000-0000-0000-000000000000'"
        @click="selectLinkPage('00000000-0000-0000-0000-000000000000')"
      >
        설문지 제출
      </button>
    </div>

  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "survey-create-page-select-box",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isOpen: {
        linkPageId: false
      },
      LinkPageTitle: null,
      linkPageTitleChangeCount: 0
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditPagesSimple: 'surveyEditPagesSimple',
      curSurveyEdit: 'curSurveyEdit'
    }),
    isVisibleSubmitOption : function() {
      return !['AFTER_SCHOOL', 'CONSULTATION'].includes(this.curSurveyEdit.surveyType)
    }
  },
  watch: {
    linkPageTitleChangeCount() {
      setTimeout(() => {
        this.checkLinkPageId()
      }, 500)
    },
  },
  methods: {
    closeLinkPageId() {
      this.isOpen.linkPageId = false
    },
    toggleLinkPageId() {
      this.isOpen.linkPageId = !this.isOpen.linkPageId
    },
    setLinkPageId(pageId) {
      this.item.linkPageId = pageId
    },
    selectLinkPage(pageId) {
      this.item.linkPageId = pageId
      this.closeLinkPageId()
    },
    getLinkPageTitle(linkPageId) {
      let title = ''
      switch (linkPageId) {
        case null: {
          title = '다음 페이지로 이동'
          break
        }
        case '00000000-0000-0000-0000-000000000000': {
          title = '설문지 제출'
          break
        }
        default: {
          const foundPage = this.surveyEditPagesSimple.find(page => page.pageId === linkPageId)
          if (foundPage) {
            title = `${foundPage.sortNo}P ${(foundPage.pageName || '')} 이동`
          } else {
            title = '다음 페이지로 이동'
          }
        }
        this.$nextTick(() => {
          this.linkPageTitleChangeCount++
          this.LinkPageTitle = title
        })
      }
      return title
    },
    checkLinkPageId() {
      if (this.LinkPageTitle === '다음 페이지로 이동') {
        this.item.linkPageId = null
      }
    },
  },
  created(){}
}
</script>

<style scoped>

</style>