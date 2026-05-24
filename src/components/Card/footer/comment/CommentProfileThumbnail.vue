<template>
  <span class="image">
    <img v-if="imgUrl" :src="imgUrl" @error="imgUrlReplace" alt="">
  </span> <!-- profile-thumbnail -->
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "comment-profile-thumbnail",
  props: {
    isNotHiNotice: {
      type: Boolean
    },
    isMyProfileThumbnail: {
      type: Boolean,
    },
    writeUserPhoto: {
      type: String
    },
    itemUserPhoto: {
      type: String
    },
    postClassId: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      userProfileDefault: 'userProfileDefault',
      clazzSubscribeViews: 'clazzSubscribeViews'
    }),
    ...mapState('storeClazzes', {
      classUser: 'classUser'
    }),
    commentPhoto() {
      return this.writeUserPhoto || this.itemUserPhoto
    },
    userPhoto() {
      // return this.user.userPhoto
      if (this.isNotHiNotice) {
        if (this.$route.path.includes('/main/myboard/news') ||
          this.$route.path.includes('/main/mypage/scrap')) {
          return this.clazzSubscribeViews.find(clazzSubscribeView => clazzSubscribeView.classId === this.postClassId).userPhoto || this.$store.state.userProfileDefault
        }
        return this.classUser.userPhoto
      } else {
        return this.user.userPhoto
      }
    },
    imgUrl() {
      return this.isMyProfileThumbnail ? this.userPhoto : this.commentPhoto
    }
  },
  methods: {
    imgUrlReplace(e) {
      e.target.src = this.$store.state.userProfileDefault
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>