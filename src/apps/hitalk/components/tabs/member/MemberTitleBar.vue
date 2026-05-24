<template>
  <div class="list-title-wrap">
    <div class="title">{{title}}</div>
    <button class="btn-guide" v-if="isTeacher && isNoticeBar" @click="showGuidePopup">사용안내</button>
    <!-- todo 클릭 이벤트 : 리스트 토글 처리-->
    <button type="button" class="btn-toggle" :class="{'on' : toggleFlag}" @click="submitEvent"></button>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: "MemberTitleBar",
  props:{
    title :{
      type: String,
      default: "",
      required: true
    }
  },
  data:()=>({
    toggleFlag : true
  }),
  computed: {
    ...mapState('storeHitalk', ['loginUser']),
    isTeacher(){
      if (!this.loginUser) return false
      return this.loginUser.userType === 'TEACHER'
    },
    isNoticeBar() {
      return _.isEqual(this.title, '공지하기')
    }
  },
  methods:{
    ...mapMutations('storeHitalk', {
      showGuidePopup: 'showGuidePopup'
    }),
    submitEvent:function (){
      this.toggleFlag = !this.toggleFlag;
      this.$emit('toggle');
    }
  }
}
</script>

<style scoped>

</style>