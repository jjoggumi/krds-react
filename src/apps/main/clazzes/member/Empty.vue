<!--
@File(Method): Empty.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 구성원 목록 없음
@Modify: #69560 클래스 구성원 관리 태그 추가 , 구성원관리에 선생님 목록 이동
-->
<template>
  <fragment>
    <div class="cont-empty-wrap-n">
      <span class="icon"></span>
      <p>
        {{ curTab === 'PARENTS' ? '클래스에 가입한 학부모가 아직 없습니다.' : '클래스에 가입한 학생이 아직 없습니다.'}}
        <template v-if="isClassActivated">
          <template v-if="curTab === 'PARENTS'">
            <br/>초대하기 기능으로 학부모들을 초대해 보세요.
          </template>
          <template v-else>
            <br/>초대하기 기능으로 학생들을 초대해 보세요.
            <br/>클래스 가입 여건이 되지 않는 학생은 선생님이 직접 계정을 만들어 줄 수 있습니다.
          </template>
        </template>
      </p>

      <button v-if="isClassActivated" class="btn-bg-w2" @click="openInviteModal">
        <span>초대하기</span>
      </button>
    </div>

    <MainBodyClazzesBodyInviteFreeSms
        v-if="isOpenSmsModal"
        :clazzes="clazzes"
        @is-close="closeInviteModal"
    ></MainBodyClazzesBodyInviteFreeSms>
  </fragment>
</template>

<script>
import MainBodyClazzesBodyInviteFreeSms from "@/apps/main/clazzes/invite/MainBodyClazzesBodyInviteFreeSms";
export default {
  name: 'member-empty',
  components: {MainBodyClazzesBodyInviteFreeSms},
  data() {
    return {
      isOpenSmsModal: false
    }
  },
  props: {
    clazzes: Object,
    curTab: String
  },
  computed: {
    isClassActivated() {
      return this.$hiClass.isClassActivated(this.clazzes)
    }
  },
  methods: {
    openInviteModal() {
      if (!this.clazzes.classInviteCode) {
        this.$hiClass.alert('초대코드가 만료되었습니다.<br>다시 재발급해주세요.')
            .then(() => { this.$router.push(`/main/clazzes/${this.$route.params.id}/invite`) })
        return
      }
      this.isOpenSmsModal = true
    },
    closeInviteModal() {
      this.isOpenSmsModal = false
    }
  },
}
</script>
<style scoped lang="scss">
.cont-empty-wrap-n {
  margin-top: 16px;
}
</style>
