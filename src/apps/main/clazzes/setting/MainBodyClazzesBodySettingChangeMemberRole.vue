<!--
@File(Method): MainBodyClazzesBodySettingChangeMemberRole.vue
@Description: 클래스 탈퇴 위임하기
@ETC : 미사용 페이지로 예상됨
-->

<template>
  <!-- 클래스 OWNER 권한 위임 -->
  <div
    class="modal normal-modal note-notice-modal note-notice-edit-modal"
    style="display: block;"
  >
    <div
      class="modal-cont-wrap" 
      v-click-outside="popupClose"
    >
      <div class="modal-cont boundary-box-386">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">
              권한을 위임받을 관리자를
              <br />선택해 주세요.
            </div>
          </div>
          <div class="input-radio-list">
            <div
              class="input-radio-wrap"
              v-for="item of managerList"
              :key="item.currentId"
            >
              <input
                type="radio"
                name="select-send"
                :id="item.currentId"
                :value="item"
                v-model="selectItem"
              />
              <label :for="item.currentId">
                <span>{{ item.userName }} 선생님</span>
              </label>
            </div>
          </div>
          <div class="btn-wrap">
            <div class="btn-group">
              <button class="btn-bg-w2 modal-close-btn" @click="popupClose">
                취소
              </button>
              <button
                class="btn-bg-c"
                :class="{ dis: selectItem == null }"
                :disabled="selectItem == null"
                @click="doChangeMemberRoleProc"
              >
                위임 후 탈퇴하기
              </button>
            </div>
          </div>
        </div>
        <div class="modal-close-btn modal-close-icon" @click="popupClose"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: 'MainBodyClazzesBodySettingChangeMemberRole',
  components: {},
  props: {
    clazzes: {
      type: Object
    },
    managerList: {
      type: Array
    },
  },
  data() {
    return {
      selectItem: null,
      currentClassOwnerId: null
    }
  },
  computed: {
    ...mapState({
      isDimLoading: 'isDimLoading',
    })
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations({
      setIsDimLoading: 'setIsDimLoading'
    }),
    popupClose() {
      this.$emit('closeChangeMemberRole')
    },
    doChangeMemberRoleFail(pageRefresh) {
      const errorMessage = '위임 가능한 클래스 관리자가 없습니다.<br>다시 확인해주세요.'
      this.$hiClass.alert(errorMessage, 'warning')
        .then(() => {
          if (pageRefresh) this.$router.go(0)
        })
    },
    async doChangeMemberRoleProc() {
      if (!this.isDimLoading) {
        try {
          await this.setIsDimLoading(true)

          // 1. 현재 클래스 개설자 찾기
          this.currentClassOwnerId = await this.getCurrentClassOwnerId()

          if (this.currentClassOwnerId) {
            // 2. 클래스 개설자를 선택한 관리자로 변경
            await this.doChangeClassOwnerBySelectedUser()

            // 3. 이전 클래스 개설자 구독정보 삭제
            const deleteSuccess = await this.doDeletePrevClassOwnerSubscribe()
            await this.setIsDimLoading(false)

            if (deleteSuccess)
              this.$router.push('/main', () => {})

          } else {
            await this.doChangeMemberRoleFail(true)
            await this.setIsDimLoading(false)
          }
        } catch (e) {
          this.currentClassOwnerId = null
          await this.doChangeMemberRoleFail(true)
          await this.setIsDimLoading(false)
        }
      }
    },
    getCurrentClassOwnerId() {
      const requestParams = {
        classId: this.clazzes.currentId,
        userId: this.$store.state.user.currentId,
        memberRole: 'OWNER',
        memberStatus: 'ACCEPT'
      }
      return new Promise((resolve, reject) => {
        this.$hiClass.clazzSubscribeViews
          .search(requestParams)
          .then(res => {
            const resources = res.data._embedded.clazzSubscribeViews
            const currentClassOwnerId = resources.length > 0
              ? resources[0].currentId
              : null
            resolve(currentClassOwnerId)
          })
          .catch(() => reject())
      })
    },
    doChangeClassOwnerBySelectedUser() {
      const selectedUserId = this.selectItem.userId
      const classId = this.clazzes.currentId
      const clazzUrl = `${this.$apiUrl}/clazzes/${classId}`
      const newClassOwner = `${this.$apiUrl}/users/${selectedUserId}`
      const requestBody = { classOwner: newClassOwner }

      return new Promise((resolve, reject) => {
        this.$hiClass.clazzes.update(requestBody, clazzUrl)
          .then(() => {
            this.clazzes.classOwner = newClassOwner
            resolve(true)
          })
          .catch(() => reject())
      })
    },
    doDeletePrevClassOwnerSubscribe() {
      const deleteUrl = `${this.$apiUrl}/clazzSubscribes/${this.currentClassOwnerId}`

      return new Promise((resolve, reject) => {
        this.$hiClass.clazzSubscribes
          .delete(deleteUrl)
          .then(() => resolve(true))
          .catch(() => reject())
      })
    }
  }
}
</script>

<style scoped>
.modal .modal-cont-wrap {
  transform: translate(-50%, -50%);
}
.modal.normal-modal .modal-cont-wrap{
  height: auto;
  max-height: 80%;
  overflow-y: hidden;
}
.modal-cont-inner {
  height: 100%;
}
.input-radio-list {
  width: 99%;
  height: auto;
  max-height: 350px;
  overflow-x: hidden;
  overflow-y: scroll;
  border-top: 1px solid #dfdfdf
}
.input-radio-list::-webkit-scrollbar {
    width: 10px;
}
.input-radio-list::-webkit-scrollbar-thumb {
    background-color: #2f3542;
    border-radius: 10px;
}
.input-radio-list::-webkit-scrollbar-track {
    background-color: transparent;
}
.note-notice-modal .boundary-box-386 .input-radio-wrap {
  border-bottom: 1px solid #dfdfdf;
  border-top: none;
}
.note-notice-modal .boundary-box-386 .input-radio-wrap:last-child {
  border-bottom: none;
}
</style>
