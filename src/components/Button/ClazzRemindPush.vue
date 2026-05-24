<template>
  <button
    class="btn-read"
    @click="doClickPostReadUserButton"
  >
    <span>{{ postReadUserCount }}명</span> 읽음
  </button>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: "clazz-remind-push",
  props: {
    /**
     * props: post item object
     * ( post | clazzesPost | schoolsPost )
     */
    postItem: {
      type: Object,
      required: true
    },
    /**
     * props: post item type
     * ( POST | CLAZZES_POST | SCHOOLS_POST )
     */
    postItemType: {
      type: String,
      required: true
    },
    schoolType: {
      type: String,
      required: true
    },
    classSubscribeCount: {
      type: Number,
      default() {
        return 0
      }
    },
  },
  computed: {
    ...mapState({
      clazzRemindPushModal: 'clazzRemindPushModal',
    }),
    postReadUserCount() {
      return this.postItem.postReadUserCount || 0
    },
    existsPostRemindUser() {
      // 클래스 구독자가 본인을 제외하고 있는 경우
      return this.classSubscribeCount > 1
    }
  },
  beforeDestroy() {
    this.closeModal()
  },
  methods: {
    ...mapMutations({
      setClazzRemindPushModal: 'setClazzRemindPushModal',
    }),
    doClickPostReadUserButton() {
      // if (!this.existsPostRemindUser && this.postReadUserCount === 0)
      //   this.$hiClass.alert('게시글을 받을 구성원이 없습니다.', 'info')
      // else
      //   this.openModal()
      this.openModal()
    },
    openModal() {
      this.setClazzRemindPushModal({
        isOpen: true,
        postItem: this.postItem,
        postItemType: this.postItemType,
        schoolType: this.schoolType,
      })
    },
    closeModal() {
      if (this.clazzRemindPushModal.isOpen) {
        this.setClazzRemindPushModal({
          isOpen: false
        })
      }
    },
  }
}
</script>

<style scoped>

</style>