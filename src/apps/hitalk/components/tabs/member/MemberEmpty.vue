<template>
  <div class="empty-wrap">
    <JoinWithInviteCodeProcess />
    <div class="img-wrap">
      <img src="@/assets/img/icon/icon_nolist_member.png" alt="">
    </div>
    <div v-if="isTeacher" class="text-wrap">
      <p>클래스 구성원이 없습니다.<br>먼저 클래스 생성 후 구성원을 초대해주세요.</p>
    </div>
    <div v-else class="text-wrap">
      <p>가입하신 클래스 목록이 없습니다.<br>먼저 클래스 가입 후 이용해주세요.</p>
    </div>
    <div v-if='isUnderElectron' class="mt-20 mb-30">
      <hi-button v-if="isTeacher" color="line-primary" size="md" @click="onClickJoin">초대코드 가입하기</hi-button>
      <hi-button v-else color="primary" block size="md" @click="onClickJoin">초대코드 가입하기</hi-button>
      &nbsp;
      <hi-button size="md" @click="onClickCreate" v-if="isTeacher">새 클래스 만들기</hi-button>
    </div>
  </div>
</template>

<script>
import HiButton from '@/components/Button/HiButton.vue'
import JoinWithInviteCodeProcess from '@/components/Popup/JoinWithInviteCode/index.vue'
import {mapState, mapActions, mapMutations} from "vuex"
import { useElectronController } from '@/apps/hitalk/utils'
import { loginKeys } from '@/mixins/externalEnterable'

const electronController = useElectronController()
const loginParams = () => loginKeys.map(k => `${k}=${localStorage.getItem(k) || true}`).join('&')

export default {
  components: { HiButton, JoinWithInviteCodeProcess },
  name: "MemberEmpty",
  computed:{
    ...mapState(['user']),
    ...mapState('storeHitalk',['loginUser']),
    isTeacher(){
      if(!this.loginUser) return false
      return this.loginUser.userType === 'TEACHER'
    },
    isUnderElectron(){
      return electronController.isUnderElectron()
    }
  },
  methods: {
    ...mapMutations(['setUser']),
    ...mapActions('storeHome', ['toggleJoinWithInviteCode']),
    openExternal(uri){
      electronController.openExternal(`${document.location.origin}${uri}?${loginParams()}`)
    },
    onClickJoin() {
      this.setUser({...this.user, userUri: `${this.$axios.getUri()}/users/${localStorage.uuid}`})
      this.toggleJoinWithInviteCode({isOpen: true})
    },
    onClickCreate() {
      this.openExternal('/main/create')
    }
  }
}
</script>

<style scoped>

</style>
