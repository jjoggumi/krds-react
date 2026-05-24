<!--
@File(Method): SurveyCreateLnbPageMore.vue
@Author: -
@Date Created: -
@Description: 설문 투표 > 설문 투표 > 좌측 페이지 > 캐밥 메뉴
@Modified: 2024-11-12 - #69464 캐밥 메뉴 디자인 시스템 적용
-->
<template>
<!-- #69464 캐밥 메뉴 디자인 시스템 적용 -->
 <HiKebab>
  <button
    v-for="button of surveyEditPagesMoreButtons"
    :key="button.btnType"
    class="btn-delete"
    @click="onClickButtons(button)"
  >
    {{ button.btnTitle }}
  </button>
</HiKebab> 
</template>

<script>
import {mapGetters, mapState} from "vuex";
import HiKebab from "@/components/Kebab/HiKebab.vue";

export default {
  name: "survey-create-lnb-page-more",
  props: {
    page: {
      type: Object
    }
  },
  components:{HiKebab},
  data() {
    return {
      // isMore: false,  #69464 캐밥 메뉴 디자인 시스템 적용
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyEditPagesMoreButtons: 'surveyEditPagesMoreButtons'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    existsImmutableQuestionType() {
      return this.page.questions.find(q => {
        return !!(q.questionType === this.CONSTANTS.QUESTION_TYPE.AFTER_SCHOOL
          || q.questionType === this.CONSTANTS.QUESTION_TYPE.CONSULTATION)
      })
    },
  },
  // #69464 캐밥 메뉴 디자인 시스템 적용
  // watch: {
  //   isMore(val) {
  //     this.$set(this.page, 'isOpenedMore', val)
  //   }
  // },
  methods: {
    // #69464 캐밥 메뉴 디자인 시스템 적용
    // closeMore() {
    //   this.isMore = false
    // },
    onClickButtons(button) {
      this.$toasted.clear()

      switch (button.btnType) {
        case 'RENAME_PAGE': {
          this.$emit('rename-page', this.page)
          break
        }
        case 'SEPARATE_PAGE': {
          if (this.existsImmutableQuestionType) {
            const questionType = this.page.questions[0].questionType
            const questionTypeName = this.CONSTANTS.QUESTION_TYPE_NAME[questionType] || '?'
            this.$toasted.show(`${questionTypeName} 질문이 포함된 페이지는 해제 불가합니다.`)
            //this.closeMore()
            return false
          }
          this.$emit('separate-page', this.page)
          break
        }
        case 'DELETE_PAGE': {
          if (this.existsImmutableQuestionType) {
            const questionType = this.page.questions[0].questionType
            const questionTypeName = this.CONSTANTS.QUESTION_TYPE_NAME[questionType] || '?'
            this.$toasted.show(`${questionTypeName} 질문이 포함된 페이지는 삭제 불가합니다.`)
            //this.closeMore()
            return false
          }
          this.$emit('delete-page', this.page)
          break
        }
        case 'ENLARGE_PAGE': {
          this.$emit('enlarge-page')
          break
        }
        case 'COLLAPSE_PAGE': {
          this.$emit('collapse-page')
          break
        }
        default:
      }
      //this.closeMore()
    },
    // #69464 캐밥 메뉴 디자인 시스템 적용
    // hideButtons(btnType) {
    //   const style = {}
    //   if (this.existsImmutableQuestionType) {
    //     switch (btnType) {
    //       case 'SEPARATE_PAGE': {
    //         style['display'] = 'none'
    //         break
    //       }
    //       default:
    //     }
    //   }
    //   return style
    // }
  }
}
</script>

<style scoped>

</style>