<template>
  <div>
  <!-- 초대코드로 가입하기 -->
    <div
      id="joinWithInviteCodeStudent"
      class="modal join-code-modal normal-modal join-info join-info-student"
      style="display:block"
      v-if="!stepProfile"
    >
      <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
        <div class="modal-cont">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title">초대코드로 가입하기</div>
              <p>아래의 클래스 정보가 맞는지 확인해주세요.</p>
            </div>
            <div class="join-class-info-wrap">
              <div class="class-info-wrap">
                <div class="class-img-wrap" :style="classImagePathStyleObj"></div>
                <div class="class-name-wrap">
                  <!-- prettier-ignore -->
                  <div class="class-name">{{ classNameFirst }}<br/>{{ classNameSecond }}</div>
                  <div class="class-teacher">{{ classOwnerName }} 선생님</div>
                </div>
              </div>

              <div class="input-user-info-wrap">
                  <p>학생 이름</p>
                  <div class="input-box-wrap" :class="{ focus: isFocus.childName }">
                      <input
                        type="text"
                        placeholder="나의 이름을 입력하세요."
                        maxlength="20"
                        ref="childName"
                        :value="childName"
                        @input="inputName($event)"
                        @focus="isFocus.childName = true"
                        @blur="checkInputNameError($event); isFocus.childName = false"
                        @keydown.enter.prevent.stop="doComplete"
                      />
                  </div>
                  <span class="input-error-msg" v-if="isInputError">이름은 완성형 한글, 영문, 숫자로 2자 이상 입력해주세요.</span>
              </div>
              <div class="input-user-info-wrap">
                  <p>반 번호</p>
                  교실에서 나는
                  <div class="input-box-wrap class-number" :class="{ focus: isFocus.memberClassNumber }">
                      <input
                        type="tel"
                        placeholder="99"
                        maxlength="2"
                        ref="memberClassNumber"
                        :value="memberClassNumber"
                        @input="memberClassNumber = $event.target.value"
                        @focus="isFocus.memberClassNumber = true"
                        @blur="isFocus.memberClassNumber = false"
                        @keydown.enter.prevent.stop="doComplete"
                      />
                  </div>
                  번 입니다.
              </div>
              <div class="confirm-btn-wrap">
                <button
                  class="btn-bg-c"
                  :class="{
                    dis: childName.length < 2 || memberClassNumber.length === 0 || isChildNameError
                  }"
                  :disabled="
                    childName.length < 2 || memberClassNumber.length === 0 || isChildNameError
                  "
                  @click="doComplete"
                >가입하기</button>
              </div>
            </div>
          </div>
          <div class="modal-close-btn modal-close-icon" @click="close()"></div>
        </div>
      </div>
    </div>
    <ProfileSettingModal v-if="isProfileSetting" :mode="'init'" :userInfoName="childName" :path="'invite'" :classId="classId" @submit="submitProfileSettingModal" @closeProfileSettingModal="onCloseProfileSettingModal"/>
  </div>
</template>

<script>
import {mapActions, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";
import ProfileSettingModal from '@/components/Profile/ProfileSettingModal.vue';
import {
  postBannedWordsCheck
} from "@hiclass/core"
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: 'join-with-invite-code-student',
  data() {
    return {
      isFocus: {
        childName: false,
        memberClassNumber: false
      },
      isJoinComplete: false,
      isBusy: false,
      childName: '',
      memberClassNumber: '',
      classImagePath: '',
      m_height: 0,
      m_width: 0,
      stepProfile: false,
      isProfileSetting: false,
      isInputError: false,
    }
  },
  components: {
    ProfileSettingModal
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('storeHome', [
      'joinWithInviteCodeData'
    ]),
    ...mapFields([
      'isDimLoading',
    ]),
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    },
    classImagePathStyleObj() {
      let rtnValue = ''
      let defaultImagePath = EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
      let classImagePath = this.classObj.classImagePath
      const size = '90'

      if (
        classImagePath !== undefined &&
        classImagePath !== null &&
        classImagePath !== ''
      ) {
        classImagePath = classImagePath + `?width=${size}&height=${size}`
      } else classImagePath = defaultImagePath + `?width=${size}&height=${size}`

      rtnValue =
        `background-image: url('${classImagePath}');` +
        `background-size: ${size}px ${size}px;`
      return rtnValue
    },
    classObj() {
      return this.joinWithInviteCodeData.invitedClassObj
    },
    className() {
      return this.classObj.className
    },
    classId() {
      return this.classObj.classId || this.classObj.currentId
    },
    classNameFirst() {
      return `${this.classObj.classYear && this.classObj.classYear !== 'ANY' ? this.classObj.classYear : ''} ${this.classObj.school.schoolName}`
    },
    classNameSecond() {
      return this.classObj.classBan
    },
    classOwnerName() {
      return this.classObj.classOwner
        ? this.classObj.classOwner.userName
        : ''
    },
    schoolUri() {
      return this.joinWithInviteCodeData.invitedSchoolUri
    },
    isChildNameError() {
      const regexp = new RegExp(/[^A-Za-z0-9가-힣,\s]/gi)
      return regexp.test(this.childName)
    }
  },
  watch: {
    isJoinComplete: function(value) {
      if (value) {
        // store clazzSubscribeViews 갱신
        this.$hiClass.setClazzSubscribeViews(this)
        // store schoolSubscribeViews 갱신
        this.$hiClass.setSchoolSubscribeViews(this)

        this.$nextTick(() => {
          this.isDimLoading = true
          setTimeout(() => {
            this.isDimLoading = false
            //this.$router.push(`/main/clazzes/${this.classId}`,() => {})
            this.closeJoinWithInviteCodeNextStep()
            this.$toasted.show('클래스에 가입되었습니다.', { duration: 1500 })
            this.$emit('moveHome')
          }, 2000)
        })
      }
    },
    memberClassNumber(val, oldVal) {
      let revokeFlg = false
      if (
        !this.$validation.isRegNumber(val) ||
        (val.length === 1 && val === '0') ||
        (val.length === 2 && val.startsWith('0', 0))
      ) {
        revokeFlg = true
      }

      if (oldVal === undefined) oldVal = ''

      if (revokeFlg) {
        this.memberClassNumber = oldVal
        this.$refs.memberClassNumber.value = oldVal
      }
    }
  },
  methods: {
    ...mapActions('storeHome', [
      'closeJoinWithInviteCodeNextStep'
    ]),
    doComplete: async function() {
      if(!(this.childName.length < 2 || this.memberClassNumber.length === 0 || this.isChildNameError)) {
        try {
          await postBannedWordsCheck({ keyword: this.childName });
          this.stepProfile = true
          this.isProfileSetting = true
        } catch(error) {
          const errorCode = error?.response.data?.error;
          if(errorCode == 451) {
            this.$hiClass.alert('적절하지 못한 단어가 포함되어 있습니다.');
          } else {
            this.$hiClass.alert('요청 처리 중 오류가 발생했습니다.');
          }
        }
      }
    },
    submitProfileSettingModal(profileId) {
      if (!this.isBusy) {
        this.isBusy = true
        if (this.childName === '') {
          this.$hiClass.alert('나의 이름(본명)을 입력 해주세요.', 'info')
          return false
        }

        if (this.childName.length === 0 || this.memberClassNumber.length === 0)
          return false

        if (isNaN(this.memberClassNumber)) {
          this.$hiClass.alert('잘못된 입력값입니다.', 'warning')
          this.memberClassNumber = ''
          this.$refs.memberClassNumber.value = ''
          this.$refs.memberClassNumber.focus()
          return false
        }

        let param = {
          memberChildName: this.childName,
          memberClassNumber: this.memberClassNumber,
          memberStatus: 'ACCEPT',
          clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`,
          user: this.$store.state.user.userUri,
          memberRole: 'MEMBER',
          isInviteCode: true,
          profileId: profileId
        }
        if (!param.user) {
          this.$hiClass.alert('사용자 정보를 찾을 수 없습니다.', 'warning')
          return false
        }

        this.$axios({
          method: 'post',
          url: '/clazzSubscribes',
          data: param
        })
          .then(result => {
            this.result = result.data
            this.$log.debug('create clazzSub res :  ', this.result)

            try {
              // 학교 구독여부 체크 후 미구독 시 학교 구독
              const schoolId = this.$comn.split(this.schoolUri, '/')
              const userId = this.$store.state.user.currentId
              const joinType = 'CLASS'

              this.$hiClass.isDuplSubscribeSchoolAndSchoolSubscribe(
                this,
                schoolId,
                userId,
                joinType
              )
            } catch (error) {
              this.$log.debug(error)
            }

            // this.isJoinComplete = true
            // 프로필 설정
            this.classUserProfileUpdate(profileId)
          })
          .catch(error => {
            this.$log.debug(error)

            if(error.response.status === 409) {
              const msg = '운영 중인 클래스가 아닙니다. 다시 확인해주세요'
              this.$hiClass.alert(msg)
              this.isProfileSetting = false
            }
          })
          .finally(() => {
            this.isBusy = false
          })
      }
    },
    async classUserProfileUpdate(profileId) {
      try {
        await this.$axios({
          method: 'PUT',
          url: `/users/profiles/class/${this.classId}`,
          data: {
            profileId :profileId
          }
        })

        this.isProfileSetting = false
        this.isJoinComplete = true
      } catch (err) {
        this.$log.debug('profileSetting submit PUT() error => ', err)
      }
    },
    close() {
      this.closeJoinWithInviteCodeNextStep()
    },
    inputName(e) {
      this.checkInputNameError(e)
      e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣,\s]/gi, '').trim()
      this.childName = e.target.value
    },
    checkInputNameError(e) {
      if (e.target.value.length < 2) {
        this.isInputError = true
        return
      }

      const regexp = new RegExp(/[^A-Za-z0-9가-힣,\s]/gi)
      this.isInputError = regexp.test(e.target.value)
    },
    async getInviteCards() {
      try {
        const res = await this.$axios.get(`/clazzInviteCards/${this.user.currentId}/invite-user/${this.classId}`)
        this.childName = res.data.studentName.substring(0, 20)
        this.memberClassNumber = res.data.studentNo
      } catch (e) {
      }
    },
    onCloseProfileSettingModal() {
      this.isProfileSetting = false
      this.close()
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

    this.getInviteCards()

    const modal = this.$refs.modal
    const positionObj = this.$comn.getModalPosition(modal)
    this.m_height = positionObj.m_height
    this.m_width = positionObj.m_width

    this.$nextTick(() => {
      setTimeout(() => {
        this.$refs.childName.focus()
      }, 100)
    })
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style scoped>
</style>
