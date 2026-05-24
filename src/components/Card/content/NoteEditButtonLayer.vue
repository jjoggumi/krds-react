<template>
  <div
    v-if="isEdit"
    class="group-btn"
  >
    <button
      class="hi-btn btn-md btn-edit-blackboard"
      @click="$emit('is-post', 'BLACKBOARD_UPDATE')"
    >
      판서로 수정
    </button>
    <button
      v-if="isPostVersionV2"
      class="hi-btn btn-md btn-edit"
      @click="$emit('is-post')"
    >
      게시글로 수정
    </button>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  name: "note-edit-button-layer",
  components: {},
  props: {
    isManager: {
      type: Boolean,
      required: true
    },
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
    }
   },
  data() {
    return {
      isMore: false,
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    isEdit() {
      // 유치원, 초등학교인 경우에만 노출
      if (this.$constants.SCHOOL_TYPE.blackBoard.includes(this.schoolType)
        && this.postItem.postType === this.CONSTANTS.POST_TYPE.NOTE
      ) {
        return (this.isManager || (this.writeUserId === this.user.currentId))
      } else {
        return false
      }
    },
    isPostVersionV2() {
      return this.postItem.version === this.CONSTANTS.POST_VERSION.V2
    },
    writeUserId() {
      return this.postItem.writeUser
        ? this.postItem.writeUser.userId
        : ''
    }
  },
};
</script>

<style scoped></style>
