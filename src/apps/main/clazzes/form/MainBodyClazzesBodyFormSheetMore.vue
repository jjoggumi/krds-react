<!--
@File(Method): MainBodyClazzesBodyFormSheetMore.vue
@Author: -
@Date Created: -
@Description: 학교양식신청서 > 제출내역 > 캐밥 메뉴
@Modified: #70204 캐밥 메뉴 디자인 시스템 적용
-->

<template>
  <div class="kebob-wrap">
    <HiKebab>
      <button
        v-for="button of this.buttons"
        :key="button.btnType"
        :class="button.btnClass"
        @click="onClickButtons(button.btnType)"
      >
          {{ button.btnTitle }}
      </button>
    </HiKebab>
  </div>
</template>

<script>
export default {
  name: "main-body-clazzes-body-form-sheet-more",
  components: {},
  props: {
    isManager: {
      type: Boolean,
      default() {
        return false
      }
    },
    isApplyMore: {
      type: Boolean,
      default() {
        return false
      }
    },
    resource: {
      type: Object
    }
  },
  data: () => ({
    // isMore: false,
    option: {
      loading: false,
    },
    disabled: {
      // postPinBtn: true
    }
  }),
  computed: {
    buttons() {
      let buttons = []

      if (this.isApplyMore) {
        if (this.isManager || this.resource.applyStatus !== 'COMPLETE') {
          buttons.push({
            btnTitle: '수정',
            btnType: 'edit-resource',
            btnClass: 'btn-edit', // #70204 캐밥 메뉴 디자인 시스템 적용
          })
        }
        if (this.isManager || this.resource.applyStatus === 'UNIDENTIFIED') {
          buttons.push({
            btnTitle: '삭제',
            btnType: 'delete-resource',
            btnClass: 'btn-delete', // #70204 캐밥 메뉴 디자인 시스템 적용
          })
        }
        buttons.push({
          btnTitle: '하이톡 공유',
          btnType: 'hitalk-share',
          btnClass: 'btn-hitalkshare' // #70204 캐밥 메뉴 디자인 시스템 적용
        })
        return buttons
      }

      if (this.isWorkSheet) {
        buttons.push({
          btnTitle: '수정',
          btnType: 'editSheet',
          btnClass: 'btn-edit', // #70204 캐밥 메뉴 디자인 시스템 적용
        })
        buttons.push({
          btnTitle: '복사',
          btnType: 'copySheet',
          btnClass: 'btn-copy', // #70204 캐밥 메뉴 디자인 시스템 적용
        })
        buttons.push({
          btnTitle: '삭제',
          btnType: 'deleteSheet',
          btnClass: 'btn-delete txt-warning', // #70204 캐밥 메뉴 디자인 시스템 적용
        })
        buttons.push({
          btnTitle: '신청서 원본 다운로드',
          btnType: 'downloadSheet',
          btnClass: 'btn-download', // #70204 캐밥 메뉴 디자인 시스템 적용
        })

        if (!this.resource.isDefault) {
          buttons.push({
            btnTitle: '우리학교 양식 공유',
            btnType: 'shareSheet',
            btnClass: 'btn-share', // #70204 캐밥 메뉴 디자인 시스템 적용
          })
        }
      }


      return buttons
    },
    isUseSheetStatus() {
      return this.resource.sheetStatus === 'USED' ||
        this.resource.sheetStatus === 'NOT_USED'
    },
    isWorkSheet() {
      return this.sheetType === 'W'
    },
    isHiClassSheet() {
      return this.sheetType === 'H'
    },
    sheetType() {
      return this.resource.sheetType || 'H'
    },
  },
  created() {
  },
  beforeDestroy() {
  },
  methods: {
    // closeMore() {
    //   this.isMore = false
    // },
    onClickButtons(btnType) {
      switch (btnType) {
        case 'editSheet':
        case 'copySheet':
        case 'deleteSheet':
        case 'downloadSheet':
        case 'shareSheet':
        case 'shareSheetOtherSchool':
          try {
            this[btnType]()
            // this.$nextTick(() => {
            //   this.closeMore()
            // })
          } catch (e) {
            this.$log.warn(e)
          }
          break

        case 'create-resource':
        case 'edit-resource':
        case 'delete-resource':
          try {
            this.$emit(btnType, this.resource)
            // this.$nextTick(() => {
            //   this.closeMore()
            // })
          } catch (e) {
            this.$log.warn(e)
          }
          break
        case 'hitalk-share':
          try {
            this.$emit(btnType, true, this.resource)
            // this.$nextTick(() => {
            //   this.closeMore()
            // })
          } catch (e) {
            this.$log.warn(e)
          }
          break
      }
    },
    editSheet() {
      this.$emit('edit-sheet', this.resource)
      // this.closeMore()
    },
    copySheet() {
      this.$emit('copy-sheet', this.resource)
      // this.closeMore()
    },
    deleteSheet() {
      this.$emit('delete-sheet', this.resource)
      // this.closeMore()
    },
    downloadSheet() {
      this.$emit('download-sheet', this.resource)
    },
    createSheet() {
      this.$emit('create-sheet', this.resource)
    },
    shareSheet() {
      this.$emit('share-sheet', this.resource)
    },
    shareSheetOtherSchool() {
      this.$emit('share-sheet-other-school', this.resource)
    },
  }
}
</script>

<style lang="scss" scoped>
// #70204 캐밥 메뉴 디자인 시스템 적용
.kebob-wrap{
  position:relative;
}
.hi-kebabmenu{
  position: absolute;
  top: -13px;
  left: 8px;
}
</style>