<template>
  <div>
    <div class="privacy-info-box boundary-box login-info">
      <div class="left-wrap">
          <div class="box-title">서명 관리</div>
          <div class="profile-thumbnail">
              <div class="circle"></div>
          </div>
      </div>
      <div class="right-wrap">
          <div class="info-category">
              <div class="category-title">전자서명</div>
              <div class="info-cont">
                  <div class="esign-box-wrap">
                    <img
                      v-if="userSign.userSignImagePath"
                      :src="userSign.userSignImagePath"
                      width="320"
                      alt=""
                      @dragstart="preventDrag"
                    />
                  </div>
                  <div class="btn-wrap">
                      <HiButton color="primary"  bitrounded @click="$hiClass.changeUserSign()">변경</HiButton>
                  </div>
              </div>
          </div>
          <!-- 결재서명 -->
          <main-body-mypage-info-body-profile-esign
            v-if="$store.state.user.userType === CONSTANTS.USER_TYPE.TEACHER"
          />
      </div>
    </div>
  </div>
</template>

<script>
import MainBodyMypageInfoBodyProfileEsign from '@/apps/main/mypage/info/MainBodyMypageInfoBodyProfileEsign'
import {mapGetters} from 'vuex'

export default {
  name: "MainBodyMypageInfoBodySign",
  components: {MainBodyMypageInfoBodyProfileEsign},
  props: {
    user: Object
  },
  data() {
    return {
      userSign: {
        userId: '',
        userSignImagePath: '',
        userSignTimestamp: ''
      },
    }
  },
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
  },
  methods: {
    preventDrag(e) {
      e.preventDefault()
      return false
    },
    initUserSign() {
      try {
        this.$hiClass.userSign.read(`/userSign/${this.user.currentId}`)
          .then(res => {
            for (const [item, value] of Object.entries(res.data)) {
              this.userSign[item] = value
            }
          })
      } catch (e) {
        this.$log.warn(e)
      }
    },
    handlePopupTask(e) {
      if (e.data !== undefined && e.data !== null && e.data !== '' && typeof e.data === 'string') {
        if (e.data.includes('changeUserSign|')) {
          this.userSign.userSignImagePath = this.$comn.split(e.data, '|') || null
        } else if (event.data.includes('changeUserApprovalSign|')) {
          this.userSign.userApprovalSignImagePath = this.$comn.split(e.data, '|') || null
        }

      }
    },
  },
  created() {
    this.userData = this.user
    // this.oldValue.user = this.user.userName
    this.initUserSign()

    // eventBus.$on('mypage-info-update-user-error', this.rollbackUserData)
  },
  mounted() {
    window.addEventListener('message', this.handlePopupTask)
  },
  destroyed() {
    window.removeEventListener('message', this.handlePopupTask)
  },
}
</script>