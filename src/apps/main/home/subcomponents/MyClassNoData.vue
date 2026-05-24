<template>
  <div class="main-myclass__nodata">
    <strong class="heading">{{ heading }}</strong>
    <p class="desc">{{ description }}</p>
    <div class="group-btn">
      <template v-if="isShowCreateNewClassButton">
        <button
          class="btn w160"
          @click="executeCommand('openSearchLayer')"
        >
          클래스, 학교 찾기
        </button>
        <button
          v-if="isShowJoinInviteCodeButton"
          class="btn no-bg w160"
          @click="executeCommand('openJoinInviteCode')"
        >
          초대코드 가입하기
        </button>
        <button
          v-if="isShowCreateNewClassButton"
          class="btn bg w180"
          @click="executeCommand('createClass')"
        >
          새 클래스 만들기
        </button>
      </template>

      <template v-else>
        <button
          v-if="isShowJoinInviteCodeButton"
          class="btn"
          @click="executeCommand('openJoinInviteCode')"
        >
          초대코드 가입하기
        </button>
        <!-- <button
          v-if="isShowCreateNewClassButton"
          class="btn"
          @click="executeCommand('createClass')"
        >
          새 클래스 만들기
        </button> -->
        <button
          v-if="isShowSearchLayerButton"
          class="btn"
          @click="executeCommand('openSearchLayer')"
        >
          클래스, 학교 찾기
        </button>
      </template>
    </div>
  </div>

</template>

<script>
import {mapActions, mapGetters} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "my-class-no-data",
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
      isCurUserTypeTeacher: 'isCurUserTypeTeacher',
      isCurUserTypeParents: 'isCurUserTypeParents',
      isCurUserTypeStudent: 'isCurUserTypeStudent',
      isCurUserTempStudent: 'isCurUserTempStudent',
    }),
    heading() {
      const userName = this.$store.state.user ? this.$store.state.user.userName : ''
      let suffix = ''
      if (this.isCurUserTypeTeacher)
        suffix = '선생님'
      else if (this.isCurUserTypeParents)
        suffix = '학부모님'
      else if (this.isCurUserTypeStudent)
        suffix = '학생'

      const welcomeMessage = '환영합니다!'

      return `${userName} ${suffix} ${welcomeMessage}`
    },
    description() {
      if (this.isCurUserTempStudent)
        return '가입되어 있는 클래스가 없습니다.'

      return this.isCurUserTypeTeacher
        ? '클래스를 만들어 구성원을 초대하세요. 구성원과 하이톡으로 소통하실 수 있어요.'
        : '선생님께 받은 초대코드로 가입하거나 직접 검색하여 가입 신청 하실 수 있어요.'
    },
    isShowJoinInviteCodeButton() {
      return !this.isCurUserTempStudent
    },
    isShowCreateNewClassButton() {
      return this.isCurUserTypeTeacher
    },
    isShowSearchLayerButton() {
      return this.isCurUserTypeParents
        || (this.isCurUserTypeStudent && !this.isCurUserTempStudent)
    },
  },
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions('storeHome', {
      toggleJoinWithInviteCode: 'toggleJoinWithInviteCode'
    }),
    openSearchLayer() {
      const searchType = 'class_school'
      const path = '/main/search'
      const query = { searchType }
      this.$router.push({ path, query }, () => {})
    },
    goRoute(path) {
      this.$router.push(path, () => {})
    },
    executeCommand(command) {
      switch (command) {
        case 'openJoinInviteCode':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.myClass.invitecode.click' })
          this.toggleJoinWithInviteCode({ isOpen: true })
          break
        case 'openSearchLayer':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.myClass.search.click' })
          this.openSearchLayer()
          break
        case 'createClass':
          this.triggerAnalyticsLogEvent({ code: 'analytics.home.myClass.create.click' })
          this.goRoute('/main/create')
      }
    },
  }

}
</script>

<style scoped>
.main-myclass__nodata .btn.no-bg {
  color: var(--primary);
  background-color: transparent;
}
.main-myclass__nodata .btn.bg { 
  background-color: var(--primary);
  color: #fff;
}
.main-myclass__nodata .btn.w160 {
  min-width: 160px;
}
.main-myclass__nodata .btn.w180 {
  min-width: 180px;
}
</style>