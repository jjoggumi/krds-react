<template>
  <div class="window-popup withdrawal-popup">

    <div class="window-popup-header">
      <div class="window-popup-header-inner">
        <strong class="logo">HiClass</strong>
      </div>
    </div>
    <div class="window-popup-container">
      <div class="window-popup-container-inner">
        <div class="title-wrap">
          <h1 class="title">하이클래스 통합회원 탈퇴</h1>
          <p class="text">회원 탈퇴 시, <span class="ft-blue">하이클래스와 하이스토어 서비스 이용이 불가</span>하며<br>기존 하이클래스 활동 이력과 하이스토어 구매 이력은 모두 삭제됩니다.</p>
        </div>
        <div class="content-wrap">
          <strong class="title">아래 모든 유의사항을 확인해 주세요.</strong>

          <div class="content-box">
            <p class="text"><span class="ft-coral">탈퇴한 회원정보는 탈퇴 즉시 삭제되어 재사용 및 복구가 불가</span>하오니 신중하게 선택하시기 바랍니다.<br>가입한 클래스, 학교 정보도 모두 삭제되며, 단, 선생님의 경우 하이클래스에서 탈퇴해도 아이스크림 회원 계정은 유지됩니다.</p>
            <div class="checkbox-wrap">
              <input type="checkbox" id="agree01" v-model="checkbox.agree01">
              <label for="agree01"><span>해당 내용을 확인하였으며 이에 동의합니다.</span></label>
            </div>
          </div>

          <div class="content-box">
            <p class="text">하이스토어 거래 정보가 있는 경우, 전자상거래 등에서의 소비자 보호에 관한 법률에 따라 <span class="ft-coral">계약 또는 청약철회에 관한 기록, 대금 결제 및 재화 등의 공급에 관한 기록은 5년 동안 보존</span>됩니다.</p>
            <div class="checkbox-wrap">
              <input type="checkbox" id="agree02" v-model="checkbox.agree02">
              <label for="agree02"><span>해당 내용을 확인하였으며 이에 동의합니다.</span></label>
            </div>
          </div>

          <div class="content-box">
            <p class="text"><span class="ft-coral">회원 탈퇴 시 고객님께서 보유하셨던 개인 정보, 주문내역, 포인트 등의 모든 정보는 삭제</span>되며 재가입 시 복원되지 않습니다. <br>단, 하이스토어에 입력하신 상품문의 및 후기, 댓글은 회원 탈퇴 이후에도 삭제되지 않으니 삭제를 원하시는 경우 탈퇴 전 게시물을 삭제하신 후 탈퇴 신청하시기 바랍니다.</p>
            <div class="checkbox-wrap">
              <input type="checkbox" id="agree03" v-model="checkbox.agree03">
              <label for="agree03"><span>해당 내용을 확인하였으며 이에 동의합니다.</span></label>
            </div>
          </div>

          <strong class="title">탈퇴 사유</strong>

          <div
            class="border-selectbox-wrap custom-select-box-wrap"
            :class="{
              selected: show.reasonSelect
            }"
            @click="show.reasonSelect = !show.reasonSelect"
            v-click-outside="hideReasonSelect"
          >
            <div class="selected-option">
              <div
                class="option-val"
                :class="{
                  placeholder: !selected.title
                }"
              >
                {{ selected.title ? selected.title : '탈퇴 사유를 선택하세요.' }}
              </div>
            </div>
            <div class="option-list-wrap">
              <ul>
                <li
                  v-for="item of reasons"
                  :key="item.code"
                  :class="{
                    selected: item.title === selected.title
                  }"
                  @click="selectItem(item)"
                >
                  <div class="option-item">{{ item.title }}</div>
                </li>
              </ul>
            </div>
          </div>

          <div
            v-if="isShowReasonSelf"
            class="textarea-wrap"
            :class="{
              focus: focus.reasonSelf
            }"
          >
            <textarea
              placeholder="탈퇴사유를 직접 입력해주세요."
              ref="reasonSelf"
              @focus="focus.reasonSelf = true"
              @blur="focus.reasonSelf = false"
              :value="reasonSelf"
              @input="inputReasonSelf($event)"
            ></textarea>
          </div>

          <div class="btn-wrap">               
            <HiButton
              color="line-light-primary"
              @click="closePopup"
            >
              {{ $t('main.text.cancel') }}</HiButton>
            <HiButton
              color="primary"
              :disabled="!isReadySubmit"
              @click="doSubmit"
            >서비스 탈퇴</HiButton>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import {mapFields} from "vuex-map-fields";
import jwt_decode from "jwt-decode";
import HiButton from "@/components/Button/HiButton.vue";

export default {
  name: "account-deactivate",
  data() {
    return {
      /**
       * ui controls
       */
      checkbox: {
        agree01: false,
        agree02: false,
        agree03: false,
      },
      show: {
        reasonSelect: false,
      },
      focus: {
        reasonSelf: false
      },
      /**
       * -- ui controls
       */

      reasons: [
        {
          code: '01',
          title: '학교에서 이용 안함',
          value: '학교에서 이용 안함',
        },
        {
          code: '02',
          title: '졸업, 전학',
          value: '졸업, 전학',
        },
        {
          code: '03',
          title: '알림장 정보 없음',
          value: '알림장 정보 없음',
        },
        {
          code: '04',
          title: '가정통신문, 급식 정보 없음',
          value: '가정통신문, 급식 정보 없음',
        },
        {
          code: '05',
          title: '재가입',
          value: '재가입',
        },
        {
          code: '06',
          title: '배송 주문 불만족',
          value: '배송 주문 불만족',
        },
        {
          code: '07',
          title: '상품 품질 불만족',
          value: '상품 품질 불만족',
        },
        {
          code: '08',
          title: '하이스토어 이용 불만족',
          value: '하이스토어 이용 불만족',
        },
        {
          code: '09',
          title: '서비스 불만족',
          value: '서비스 불만족',
        },
        {
          code: '99',
          title: '기타 (상세하게 작성해주시면 큰 도움이 됩니다.)',
          value: '',
        },

      ],

      selected: {
        code: '',
        title: '',
        value: '',
      },

      reasonSelf: '',

      model: {
        reason: null,
      },

      isOtherService: {
        hiStore: false
      },

      prevReasonSelf: ''
    }
  },
  computed: {
    ...mapFields([
      'user',
      'isDimLoading'
    ]),
    isShowReasonSelf() {
      return this.selected.code === '99'
    },
    isReasonSelf() {
      return this.isShowReasonSelf && this.reasonSelf.length > 0
    },
    isReadySubmit() {
      const isAllChecked = Object.values(this.checkbox).every(d => d === true)
      return isAllChecked && this.model.reason && this.model.reason.trim().length > 0
    }
  },
  watch: {
    'selected.code'(val) {
      if (val === '99') {
        this.reasonSelf = ''
        this.$nextTick(() => this.$refs.reasonSelf.focus())
      }
    },
    reasonSelf(val) {
      this.setModelReason(val)
    }
  },
  created() {
    this.loginUserHiStore()
  },
  mounted() {},
  methods: {
    closePopup() {
      window.close()
    },
    hideReasonSelect() {
      this.show.reasonSelect = false
    },

    selectItem(item) {
      this.selected.code = item.code
      this.selected.title = item.title
      this.selected.value = item.value

      this.setModelReason(item.value)
    },

    setModelReason(value) {
      this.model.reason = value
    },

    submitValidate() {
      return new Promise(async resolve => {
        if (!this.isReadySubmit) {
          this.$hiClass.alert('탈퇴사유와 유의사항을 모두 확인해주세요.')
          resolve(false)
        }
        if (this.isShowReasonSelf && this.reasonSelf.trim().length > 500) {
          this.$hiClass.alert(this.$t('main.mypage.info.closeAccount.message.lengthOver'))
            .then(() => {
              this.$nextTick(() => this.$refs.reasonSelf.focus())
            })
          resolve(false)
        }

        resolve(true)
      })
    },

    async doSubmit() {
      let isPassed = await this.submitValidate()
      this.$log.debug(`submitValidate isPassed => `, isPassed)

      if (isPassed) {
        this.isDimLoading = true

        // 회원정보 확인
        try {
          await this.loginCheck()
        } catch (err) {
          alert('회원정보 조회 실패\n로그인 정보를 다시 한번 확인해주세요.')
          this.isDimLoading = false
          this.closePopup()
        }

        if (this.user.userType === 'TEACHER') {

          try {
            // 선생님일 경우 활성화된 클래스 체크
            const curUserClassSubscribeByOwner = await this.getCurUserClassSubscribeByOwner()
            const existsActivateClazz = curUserClassSubscribeByOwner.find(d =>d.classStatus !== 'CLOSING' && d.classStatus !== 'CLOSED')
            // 활성 클래스 있음
            if (existsActivateClazz) {
              this.$hiClass.alert(this.$t('main.mypage.info.closeAccount.message.classOwner'))
              isPassed = false
              this.isDimLoading = false
              return false
            }

            // 선생님일 경우 학교알리미 마스터 관리자 체크
            const checkAlarmPlusMasterManager = await this.checkAlarmPlusMasterManager()
            const userYn = checkAlarmPlusMasterManager.useYn
            const status = checkAlarmPlusMasterManager.status

            if (status.result === 'success' && userYn === 'Y') {
              this.$hiClass.alert(this.$t('main.mypage.info.closeAccount.message.alarmPlusMasterManager'))
              isPassed = false

            } else if (status.result !== 'success') {
              this.$hiClass.alert('정보 조회 실패<br>잠시 후 다시 시도해주세요.')
              isPassed = false
            }

          } catch (err) {
            this.$hiClass.alert('정보 조회 실패<br>잠시 후 다시 시도해주세요.')
            isPassed = false
          }

        }

        if (isPassed) {
          // last Check confirm popup
          const lastCheckMsg = `하이클래스 활동 및 하이스토어 구매 이력이 모두 삭제되어 복구할 수 없습니다.<br>그대로 탈퇴하시겠습니까?`
          try {
            const opts = {
              confirmButtonText: '네, 탈퇴할게요',
              reverseButtons: true
            }
            await this.$hiClass.confirm(lastCheckMsg, null, opts)
          } catch (e) {
            this.$log.error(e)
            isPassed = false
          }
        }
      }

      if (isPassed) {
        try {
          const res = await this.createUserDeactivates()

          if (res) {
            // 탈퇴 완료 처리
            localStorage.setItem('isLoginUserForceLogout', 'true')
            let CASE = '99'

            /**
             * CASE 01: exists window.opener
             * CASE 02: exists window.opener & opener is hiClass
             * CASE 03: exists window.opener & opener is hiStore
             * CASE 99: no exists window.opener -> popup route logout page
             */
            if (window.opener)
              CASE = '01'

            if (window.opener && this.isOtherService.hiStore)
              CASE = '02'
            else if (window.opener && window.opener.app)
              CASE = '03'

            this.$log.debug(`CASE => `, CASE)

            // 탈퇴 처리 후 alert 을 띄우기 전 실행 되어야 하는 처리
            switch (CASE) {
              case "02":
                this.sendHiclassAccountDeactivateResult('complete')
                break
            }

            alert('서비스 탈퇴 완료되었습니다.')

            // 탈퇴 처리 후 팝업 닫기 및 로그아웃
            switch (CASE) {
              case "01":
                this.$router.push('/logout', () => {})
                this.closePopup()
                break

              case "02":
                this.closePopup()
                break

              case "03":
                window.opener.location.href = '/logout'
                this.closePopup()
                break

              case "99":
                this.$router.push('/logout', () => {})
                sessionStorage.setItem('isReadyClosePopup', 'true')
                break
            }
            this.isDimLoading = false

          } else {
            this.sendHiclassAccountDeactivateResult('fail')
            this.$hiClass.alert('fail user deactivate!', 'error')
            this.isDimLoading = false
            return false
          }

        } catch (err) {
          if (err.response.status === 409) {
            this.$hiClass.alert(this.$t('main.mypage.info.closeAccount.message.classOwner'))
          }
          this.$log.error(err)
          this.isDimLoading = false
          return false
        }

      } else {
        this.isDimLoading = false
        return false
      }

    },

    async loginCheck() {
      try {
        const user = await this.getUser()

        if (user.userStatus === 'ACTIVATE') {
          this.user = user
          this.model.user = this.user._links.self.href
          localStorage.setItem("userType", this.user.userType);
        } else {
          this.$hiClass.alert('이미 탈퇴된 회원입니다.<br>로그인 정보를 다시 한번 확인해주세요.')
          this.isDimLoading = false
        }

      } catch (err) {
        alert('회원정보 조회 실패\n로그인 정보를 다시 한번 확인해주세요.')
        this.isDimLoading = false
        this.closePopup()
      }
    },

    /**
     * 하이스토어로 로그인한 사용자가 통합회원 탈퇴 팝업에 접근할 경우
     */
    async loginUserHiStore() {
      const socialType = this.$route.params.socialType
      const hiclassToken = this.$route.query.hiclassToken || null

      if (socialType && hiclassToken) {
        this.isOtherService.hiStore = true
        localStorage.setItem("idToken", hiclassToken.toString());

        try {
          const decoded = jwt_decode(hiclassToken)
          // decoded.exp is unix timestamp (not milliseconds!)
          localStorage.setItem("idTokenExpiresTimestamp", this.$moment(decoded.exp * 1000).valueOf().toString());
          localStorage.setItem("clientRegistrationId", decoded.clientRegistrationId);
          localStorage.setItem("principalName", decoded.principalName);
          localStorage.setItem("uuid", decoded.uuid);
          localStorage.setItem("name", decoded.name);
        } catch (e) {
          this.$log.error(e)
        }

        this.isDimLoading = true

        // 회원정보 확인
        try {
          await this.loginCheck()

        } catch (err) {
          alert('회원정보 조회 실패\n로그인 정보를 다시 한번 확인해주세요.')
          this.isDimLoading = false
          this.closePopup()
        }
        this.isDimLoading = false
      }
    },

    getUser() {
      const params = this.$authentication.load()
      const userId = params.uuid

      return new Promise((resolve, reject) => {
        this.$hiClass.users.read(`/users/${userId}`)
          .then(res => resolve(res.data))
          .catch(err => reject(err))
      })
    },
    getCurUserClassSubscribeByOwner() {
      const userId = this.$authentication.load().uuid
      const params = {
        userId,
        memberRole: 'OWNER',
        memberStatus: 'ACCEPT',
        size: 500
      }

      return new Promise((resolve, reject) => {
        this.$hiClass.clazzSubscribeViews.search(params)
          .then(res => resolve(res.data._embedded.clazzSubscribeViews))
          .catch(err => reject(err))
      })
    },
    checkAlarmPlusMasterManager() {
      return new Promise((resolve, reject) => {
        const request = {
          method: 'GET',
          url: '/educationLetters/masterManagerCheck',
          params: { userId: this.$authentication.load().uuid }
        }
        this.$axios(request)
          .then(res => resolve(res.data))
          .catch(err => reject(err))
      })
    },

    createUserDeactivates() {
      return new Promise((resolve, reject) => {
        this.$hiClass.userDeactivates.create(this.model)
          .then(() => resolve(true))
          .catch(err => reject(err))
      })
    },

    /**
     * 하이클래스 통합 회원 탈퇴 결과를 부모창에 전달
     * @param result 'complete' | 'fail'
     */
    sendHiclassAccountDeactivateResult(result) {
      /**
       * targetWindow.postMessage(message, targetOrigin)
       */
      try {
        window.opener.postMessage(
          { type: 'hiclassAccountDeactivate', result: result },
          this.$hiStoreUrl
        )
      } catch (e) {
        this.$log.error(e)
      }

      // 상용일 경우 하이스토어 www 서브 도메인 제외 추가 호출
      if (this.$hiStoreUrl === 'https://www.hi-store.co.kr') {
        try {
          window.opener.postMessage(
            { type: 'hiclassAccountDeactivate', result: result },
            'https://hi-store.co.kr'
          )
        } catch (e) {
          this.$log.error(e)
        }
      }
    },
    inputReasonSelf(e) {
      let value = e.target.value
      value = value.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')

      if ([...e.target.value].length > 500) {
        value = this.prevReasonSelf
      }

      e.target.value = value
      this.reasonSelf = value
      this.prevReasonSelf = value
    }
  }
}
</script>

<style scoped>
</style>