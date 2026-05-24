<!--
@File(Method): ChangeTeacherRole.vue
@Date Created: 2025-01-09
@Description: 클래스 구성원 관리 > 선생님 > 선생님 권한 위임 모달
@Modified: 2025-03-07 - #72798 목록 내 스크롤바 영역 개선 요청 - 스크롤바 공통화
-->
<template>
  <div
      class="modal normal-modal note-notice-modal note-notice-edit-modal"
      style="display: block;"
  >
    <div class="modal-cont-wrap" v-click-outside="closeModal">
      <div class="modal-cont boundary-box-386">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">
              권한을 위임받을 관리자를<br/>선택해 주세요.
            </div>
          </div>
          <div class="input-radio-list custom-scr">
            <div
                class="input-radio-wrap"
                v-for="item of teacherList"
                :key="item.userId"
            >
              <input
                  type="radio"
                  name="select-send"
                  :id="item.userId"
                  :value="item"
                  v-model="selectItem"
              />
              <label :for="item.userId">
                <span>{{ item.profileName }} 선생님</span>
              </label>
            </div>
          </div>
          <div class="btn-wrap">
            <div class="btn-group">
              <button class="btn-bg-w2 modal-close-btn" @click="closeModal">
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
        <div class="modal-close-btn modal-close-icon" @click="closeModal"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: 'change-teacher-role',
  data() {
    return {
      selectItem: null
    }
  },
  props: {
    clazzes: {
      type: Object
    },
    teacherList: {
      type: Array
    },
    ownerMemberId: {
      type: String
    }
  },
  computed: {
    ...mapState([
      'isDimLoading'
    ])
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    ...mapMutations([
      'setIsDimLoading'
    ]),
    closeModal() {
      this.$emit('closeChangeMemberRole')
    },
    async changeMemberRoleFail(pageRefresh) {
      const errorMessage = '위임 가능한 클래스 관리자가 없습니다.<br>다시 확인해주세요.'
      await this.$hiClass.alert(errorMessage, 'warning')
      if (pageRefresh) this.$router.go(0)
    },
    async doChangeMemberRoleProc() {
      if (!this.ownerMemberId) {
        await this.changeMemberRoleFail(true)
        return
      }
      if (!this.isDimLoading) {
        try {
          await this.setIsDimLoading(true)

          // 선택된 관리자를 클래스 개설자로 변경
          await this.changeClassOwnerBySelectedUser()

          // 기존 클래스 개설자 구독정보 삭제
          const deleteSuccess = await this.deleteClassOwnerSubscribe()
          await this.setIsDimLoading(false)

          if (deleteSuccess)
            this.$router.push('/main', () => {})

        } catch (e) {
          await this.changeMemberRoleFail(true)
          await this.setIsDimLoading(false)
        }
      }
    },
    async changeClassOwnerBySelectedUser() {
      const selectedUserId = this.selectItem.userId
      const classId = this.clazzes.currentId
      const clazzUrl = `${this.$apiUrl}/clazzes/${classId}`
      const newClassOwner = `${this.$apiUrl}/users/${selectedUserId}`
      const requestBody = { classOwner: newClassOwner }

      await this.$hiClass.clazzes.update(requestBody, clazzUrl)
      this.clazzes.classOwner = newClassOwner
    },
    async deleteClassOwnerSubscribe() {
      const deleteUrl = `${this.$apiUrl}/clazzSubscribes/${this.ownerMemberId}`
      try {
        await this.$hiClass.clazzSubscribes.delete(deleteUrl)
        return true
      } catch (err) {
        return false
      }
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
/* .input-radio-list::-webkit-scrollbar {
  width: 10px;
}
.input-radio-list::-webkit-scrollbar-thumb {
  background-color: #2f3542;
  border-radius: 10px;
}
.input-radio-list::-webkit-scrollbar-track {
  background-color: transparent;
} */
.note-notice-modal .boundary-box-386 .input-radio-wrap {
  border-bottom: 1px solid #dfdfdf;
  border-top: none;
}
.note-notice-modal .boundary-box-386 .input-radio-wrap:last-child {
  border-bottom: none;
}
</style>
