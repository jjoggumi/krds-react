<!--
@File(Method): WorksheetShareListItemMore.vue
@Author: -
@Date Created: -
@Description: 학교양식신청서 > 신청서 불러오기 > 공유양식 리스트 내 캐밥 메뉴
@Modified: #70204 캐밥 메뉴 디자인 시스템 적용
-->
<template>
  <HiKebab>
    <button
      v-for="button of this.buttons"
      :key="button.btnType"
      :class="button.btnClass"
      @click="onClickButtons(button.btnType)"
      @click.stop
    >
        {{ button.btnTitle }}
    </button>
  </HiKebab>
</template>

<script>
export default {
  name: "worksheet-share-list-item-more",
  components: {},
  props: {
    resource: {
      type: Object
    }
  },
  data() {
    return {
     //isMore : false,
      option: {
        loading: false,
      },
      disabled: {}
    }
  },
  computed: {
    buttons() {
      let buttons = []

      buttons.push({
        btnTitle: '삭제',
        btnType: 'delete-resource',
        btnClass: 'btn-delete txt-warning', // #70204 캐밥 메뉴 디자인 시스템 적용
      })
      return buttons
    },
  },
  methods: {
    onClickButtons(btnType) {
      switch (btnType) {
        case 'delete-resource':
          try {
            this.$emit(btnType, this.resource)
          } catch (e) {
            this.$log.warn(e)
          }
          break
      }
    },

  },

}
</script>

<style lang="scss" scoped>
// #70204 캐밥 메뉴 디자인 시스템 적용
.hi-kebabmenu{
  top:10px;
  right:10px;
  }
</style>
