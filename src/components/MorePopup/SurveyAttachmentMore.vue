<!--
@File(Method): SurveyAttachmentMore.vue
@Author: -
@Date Created: -
@Description: 클래스 > 설문 > 설문만들기 > 이미지 첨부시 이미지 컨트롤 하는 캐밥 메뉴
@Modified: 2024-11-12 - #69464 캐밥 메뉴 디자인 시스템 적용
-->
<template>
  <!-- #69464 캐밥 메뉴 디자인 시스템 적용 -->
  <HiKebab>        
    <button
      v-for="button of surveyAttachmentMoreButtons"
      :key="button.btnType"
      :class="button.btnClass"
      @click="onClickButtons(button)"
    >
      {{ button.btnTitle }}
    </button>
  </HiKebab> 
</template>

<script>
import {mapState} from "vuex";
import HiKebab from "@/components/Kebab/HiKebab.vue";

export default {
  name: "survey-attachment-more",
  components: { HiKebab},
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // isMore: false,
    }
  },
  computed: {
    ...mapState('storeSurvey', {
      surveyAttachmentMoreButtons: 'surveyAttachmentMoreButtons'
    })
  },
  methods: {
    // closeMore() {
    //   this.isMore = false
    // },
    onClickButtons(button) {
      switch (button.btnType) {
        case 'ALIGN_LEFT':
        case 'ALIGN_CENTER':
        case 'ALIGN_RIGHT': {
          this.$emit('set-file-align', this.file, button.value)
          break
        }
        case 'UPDATE': {
          this.$emit('replace-file')
          break
        }
        case 'DELETE': {
          this.$emit('delete-file')
          break
        }
        case 'EDIT_IMAGE': {
          this.$emit('edit-image')
          break
        }
      }
    },
  }
}
</script>

<style scoped>

</style>