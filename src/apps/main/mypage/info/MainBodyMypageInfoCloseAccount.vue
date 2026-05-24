<!--
@File(Method): MainBodyMypageInfoCloseAccount.vue
@Description: 미사용페이지 여부 확인 후 삭제 (미사용시 leave-info 클래스 정의된 내용 삭제하기)
-->
<template>
  <div class="privacy-info-cont-wrap">
    <div class="privacy-info-box boundary-box leave-info">
      <div class="reason-wrap">
        <div class="title">{{ $t('main.mypage.info.closeAccount.title') }}</div>
        <div
          class="border-selectbox-wrap custom-select-box-wrap"
          :class="{
            selected: isShowReasonSelect
          }"
          @click="isShowReasonSelect = !isShowReasonSelect"
          v-click-outside="hideShowReasonSelect"
        >
          <div class="selected-option">
            <div
              class="option-val"
              :class="{
                placeholder: !isReasonSelected
              }"
            >
              {{
                selectedReason !== '' ? selectedReason : $t('main.text.select')
              }}
            </div>
          </div>
          <div class="option-list-wrap">
            <ul>
              <li
                v-for="item in reasonList"
                :key="item.currentId"
                :class="{
                  self: item.class !== undefined && item.class === 'self'
                }"
                @click="selectItem(item)"
              >
                <div class="option-item">{{ item.content }}</div>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="reason-self-input-wrap"
          style="display: block"
          v-if="isShowReasonSelf"
        >
          <div
            class="input-box-wrap"
            :class="{
              focus: isFocusReasonSelf
            }"
          >
            <textarea
              :placeholder="
                $t('main.mypage.info.closeAccount.description.reasonSelf')
              "
              ref="reasonSelf"
              @focus="isFocusReasonSelf = true"
              @blur="isFocusReasonSelf = false"
              maxlength="501"
              v-model.trim="reasonSelf"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="leave-notice-wrap">
        <div class="leave-notice-cont">
          <div class="leave-notice-title">
            {{ $t('main.mypage.info.closeAccount.notice.title.text1') }}
          </div>
          <div class="leave-notice-list">
            <ul>
              <li>
                {{ $t('main.mypage.info.closeAccount.notice.list.text1') }}
              </li>
              <li>
                {{ $t('main.mypage.info.closeAccount.notice.list.text2') }}
              </li>
              <li>
                {{ $t('main.mypage.info.closeAccount.notice.list.text3') }}
              </li>
            </ul>
          </div>
        </div>
        <div class="leave-notice-cont">
          <div class="leave-notice-title">
            {{ $t('main.mypage.info.closeAccount.notice.title.text2') }}
          </div>
          <div class="leave-notice-list">
            <ul>
              <li>
                {{ $t('main.mypage.info.closeAccount.notice.list.text5') }}
              </li>
              <li>
                {{ $t('main.mypage.info.closeAccount.notice.list.text6') }}
              </li>
            </ul>
          </div>
        </div>
        <div class="leave-agree-wrap">
          <input type="checkbox" id="agree-check" v-model="closeAgreeChk" />
          <label for="agree-check">
            <span>{{ $t('main.mypage.info.closeAccount.agree') }}</span>
          </label>
        </div>
      </div>
      <div class="btn-wrap">
        <button class="btn-bg-w2" @click="goMypageInfo">
          {{ $t('main.text.cancel') }}
        </button>
        <button
          class="btn-bg-c"
          :class="{
            dis: !isCloseProcessReady
          }"
          :disabled="!isCloseProcessReady"
          @click="onClickCloseAccount"
        >
          {{ $t('main.mypage.info.closeAccount.button.closeAccount') }}
        </button>
      </div>
    </div>

    <MainLoadingNewTabDim v-if="isShowLoading"></MainLoadingNewTabDim>
  </div>
</template>

<script>
import MainLoadingNewTabDim from '../../MainLoadingNewTabDim.vue'

export default {
  name: 'MainBodyMypageInfoCloseAccount',
  props: {
    user: Object
  },
  components: {
    MainLoadingNewTabDim
  },
  data: () => ({
    isShowReasonSelect: false,
    isShowReasonSelf: false,
    isShowLoading: false,
    isFocusReasonSelf: false,
    isReasonSelected: false,
    isClassOwner: false,
    isAlarmPlusMasterManager: false,
    reasonList: [],
    selectedReason: '',
    selectedClass: '',
    reasonSelf: '',
    closeAgreeChk: false,
    userData: {}
  }),
  computed: {
    isCloseProcessReady() {
      return (!this.isShowReasonSelf &&
          this.isReasonSelected &&
          this.closeAgreeChk) ||
          (this.isShowReasonSelf &&
              this.reasonSelf.trim().length > 0 &&
              this.isReasonSelected &&
              this.closeAgreeChk);
    }
  },
  methods: {
    initMsg() {
      for (let i = 1; i < 7; i++) {
        let obj = {}
        if (i === 6) obj.class = 'self'
        obj.content = this.$t(
          'main.mypage.info.closeAccount.reason.list.content' + i
        )
        this.reasonList.push(obj)
      }
    },
    goMypageInfo() {
      this.$emit('mypageInfo')
    },
    onClickCloseAccount() {
      let reason = ''

      if (this.selectedClass === 'self' && this.reasonSelf.trim() === '') {
        setTimeout(() => {
          this.$refs.reasonSelf.focus()
        }, 300)
        alert(this.$t('main.mypage.info.closeAccount.message.emptyReason'))

        return false
      }

      if (
        this.selectedClass === 'self' &&
        this.reasonSelf.trim().length > 500
      ) {
        setTimeout(() => {
          this.$refs.reasonSelf.focus()
        }, 300)
        alert(this.$t('main.mypage.info.closeAccount.message.lengthOver'))

        return false
      }

      if (this.isClassOwner) {
        alert(this.$t('main.mypage.info.closeAccount.message.classOwner'))
        return false
      }

      if (this.isAlarmPlusMasterManager) {
        this.$hiClass.alert(this.$t('main.mypage.info.closeAccount.message.alarmPlusMasterManager'))
        return false
      }

      if (!confirm(this.$t('main.mypage.info.closeAccount.message.confirm')))
        return false

      this.closeAccountProc(reason)
    },
    hideShowReasonSelect() {
      this.isShowReasonSelect = false
    },
    selectItem(item) {
      this.selectedReason = item.content
      this.selectedClass = item.class !== undefined ? item.class : ''
      this.isReasonSelected = true
      this.isShowReasonSelf = item.class === 'self';
    },
    closeAccountProc(reason) {
      if (this.selectedClass === 'self') reason = this.reasonSelf
      else reason = this.selectedReason

      this.isShowLoading = true

      // 191023 변경된 탈퇴 프로세스
      this.createUserDeactivates(reason)
    },
    updateUser(reason) {
      const userUuid = this.user.currentId
      if (userUuid === undefined) return false

      this.userData.userStatus = 'DEACTIVATE'

      this.$nextTick(() => {
        this.$log.debug(this.userData)

        this.$axios({
          method: 'patch',
          url: `/users/${userUuid}`,
          data: this.userData
        })
          .then(result => {
            this.$log.debug(
              this.$options.name,
              ' updateUser() result => ',
              result
            )

            // 탈퇴 프로세스 2 => 탈퇴 사유 등록
            this.createUserDeactivates(reason)
          })
          .catch(error => {
            this.$log.debug(
              this.$options.name,
              ' updateUser() error => ',
              error
            )
            this.isShowLoading = false
          })
      })
    },
    createUserDeactivates(reason) {
      const userUri = this.user._links.self.href
      const param = {
        reason: reason,
        user: userUri
      }

      this.$axios({
        method: 'post',
        url: `/userDeactivates`,
        data: param
      })
        .then(result => {
          this.$log.debug(
            this.$options.name,
            ' createUserDeactivates() result => ',
            result
          )
          this.isShowLoading = false

          // 탈퇴 프로세스 3 => 탈퇴 완료 화면으로 이동
          this.$router.push('/noti/closeAccount', () => {})
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name,
            ' createUserDeactivates() error => ',
            error
          )
          this.isShowLoading = false
        })
    },
    getCurUserClassSubscribeByOwner() {
      const userId = this.user.currentId
      const params = {
        userId,
        memberRole: 'OWNER',
        memberStatus: 'ACCEPT',
        size: 200
      }

      this.$hiClass.clazzSubscribeViews
        .search(params)
        .then(result => {
          this.$log.debug(
            this.$options.name + ' getCurUserClassSubscribeByOwner() result ',
            result
          )
          const classOwnerTotalCnt = result.data.page.totalElements
          const filteredList = result.data._embedded.clazzSubscribeViews.filter(
            d => {
              return d.classStatus === 'CLOSING' || d.classStatus === 'CLOSED'
            }
          )
          if (
            classOwnerTotalCnt > 0 &&
            classOwnerTotalCnt !== filteredList.length
          )
            this.isClassOwner = true
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name + ' getCurUserClassSubscribeByOwner() error ',
            error
          )
        })
    },
    checkAlarmPlusMasterManager() {
      const param = {
        userId: this.user.currentId
      }

      this.$axios({
        method: 'get',
        url: '/educationLetters/masterManagerCheck',
        params: param
      })
        .then(res => {
          this.$log.debug(
            this.$options.name + ' checkAlarmPlusMasterManager() result ',
            res
          )
          if (res.data.useYn === 'Y') this.isAlarmPlusMasterManager = true
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name + ' checkAlarmPlusMasterManager() error ',
            err
          )
        })
    }
  },
  created() {
    this.userData = this.user
    this.initMsg()
    this.getCurUserClassSubscribeByOwner()
  },
  mounted() {
    this.checkAlarmPlusMasterManager()
  }
}
</script>
