<template>
  <div class="cont-empty-wrap">
    <div class="img-wrap">
      <img src="@/assets/img/icon_cont_empty_face2_108.png" alt="" />
    </div>
    <div class="text-wrap">
      <p>{{ $t('main.mypage.clazzes.notFound.title') }}</p>
    </div>
    <div class="btn-wrap">
      <button
        class="btn-bg-w2"
        @click="goPage('/main/create')"
        v-if="$store.state.user.userType === 'TEACHER'"
      >
        {{ $t('main.mypage.clazzes.notFound.button.createClass' ) }}
      </button>
      <button class="btn-bg-w2" @click="toggleJoinWithInviteCode({isOpen: true})">
        {{ $t('main.mypage.clazzes.notFound.button.joinInviteCode' ) }}
      </button>
      <button class="btn-bg-w2" @click="goPage('/main/search?searchType=class_school')">
        {{ $t('main.mypage.clazzes.notFound.button.searchClass' ) }}
      </button>
    </div>

  </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
  name: 'MainBodyMypageClazzesNotFound',
  components: {
  },
  data() {
    return {
      isJoinWithInviteCode: false,
      sendData: '',
      curPopForm: '',
      invitedClassObj: {},
      schoolUri: ''
    }
  },
  methods: {
    ...mapActions('storeHome', {
      toggleJoinWithInviteCode: 'toggleJoinWithInviteCode'
    }),
    goPage(path) {
      this.$router.push(path)
    },
    doInvitePopToggle: function(val) {
      this.isJoinWithInviteCode = val
    },
    doInputPopToggle(component, param) {
      this.sendData = param
      this.curPopForm = component
    }
  }
}
</script>
