<template>
  <div>
    <!-- 초대코드로 가입하기 -->
    <div
      class="modal join-code-modal normal-modal join-info"
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
                  <p>{{ `자녀 이름(본명)을 ${ hasInviteCard ? '확인' : '입력' }하세요.` }}</p>
                  <div class="input-box-wrap" :class="{ focus: isFocus.childName }">
                    <input
                      type="text"
                      placeholder="자녀 이름 (한글, 영문 입력 가능)"
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
                  <span class="info-msg">* 같은 클래스에 자녀가 여러 명인 경우, 자녀명을 모두 입력해 주세요.</span>
              </div>
              <div class="confirm-btn-wrap">
                <button
                  class="btn-bg-c"
                  :class="{
                    dis: childName.length < 2 || isChildNameError
                  }"
                  :disabled="childName.length < 2 || isChildNameError"
                  @click="doComplete"
                >가입하기</button>
              </div>
            </div>
          </div>
          <div
            class="modal-close-btn modal-close-icon"
            v-on:click="close()"
          ></div>
        </div>
      </div>
    </div>    
    <ProfileSettingModal v-if="isProfileSetting" :mode="'init'" :userInfoName="childName" :path="'invite'" :classId="classId"  @submit="submitProfileSettingModal" @closeProfileSettingModal="onCloseProfileSettingModal"/>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import {mapFields} from "vuex-map-fields";
import ProfileSettingModal from '@/components/Profile/ProfileSettingModal.vue';
import { EXTERNAL_LINKS } from '@/constants/externalAssets';

export default {
  name: 'join-with-invite-code-parents',
  data() {
    return {
      isFocus: {
        childName: false
      },
      isJoinComplete: false,
      isBusy: false,
      childName: '',
      schoolSubscribesUri: '',
      schoolSubscribesData: [],
      classImagePath: '',
      m_height: 0,
      m_width: 0,
      stepProfile: false,
      isProfileSetting: false,
      isInputError: false,
      hasInviteCard: false
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
      return `${this.classObj.classGrade !== "ANY" ? `${this.classObj.classGrade}학년 ` : ''}${this.classObj.classBan}`
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
  },
  methods: {
    ...mapActions('storeHome', [
      'closeJoinWithInviteCodeNextStep'
    ]),
    ...mapMutations('storeHome', [
      'addJoinWithInviteCodeSubscribe'
    ]),
    doComplete: async function() {
      if (!await this.showConfirmForStudentName()) return;
      if(!(this.childName.length < 2 || this.isChildNameError)) {
        this.stepProfile = true
        this.isProfileSetting = true
      }
    },
    submitProfileSettingModal(profileId) {
      if (!this.isBusy) {
        this.isBusy = true
        if (
          this.schoolUri === '' ||
          this.schoolUri === undefined ||
          this.$store.state.user.userUri === undefined
        ) {
          this.isBusy = false
          return false
        }

        if (this.childName === '') {
          this.$hiClass.alert('자녀의 이름(본명)을 입력 해주세요.', 'info')
          this.isBusy = false
          return false
        }
        let param = {
          memberChildName: this.childName,
          memberStatus: 'ACCEPT',
          clazz: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${this.classId}`,
          user: this.$store.state.user.userUri,
          memberRole: 'MEMBER',
          isInviteCode: true,
          profileId: profileId
        }
        this.$axios({
          method: 'post',
          url: '/clazzSubscribes',
          data: param
        })
          .then(result => {
            this.addJoinWithInviteCodeSubscribe(result.data)
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
            if(error.response.status === 409) {
              this.$hiClass.alert(this.$t('운영중인 클래스가 아닙니다. 다시 확인해주세요'))
              this.isProfileSetting = false
            }
            this.$log.debug(error)
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
        this.hasInviteCard = true
      } catch (e) {
        this.hasInviteCard = false
      }
    },
    async showConfirmForStudentName() {
      this.stepProfile = true
      const res = await this.$hiClass.confirm(`
        입력하신 자녀 이름이<br>
        ‘${this.childName}’ 맞나요?
      `, null, {
        cancelButtonText: '수정'
      }).catch(() => null);
      this.stepProfile = false
      return (res && res.value) || false;
    },
    onCloseProfileSettingModal() {
      this.close()
    }
  },
  created() {},
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
.join-code-modal .join-class-info-wrap { width: 480px; }
.class-info-wrap {
  border: 0;
  text-align: left;
  font-size: 0;
  height: 138px;
  background: #F6F6F6;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.input-box-wrap {
  border-radius: 6px;
}
.modal .class-info-wrap .class-name-wrap .class-name {
  font-size: 15px;
  font-weight: 700;
  color: #222222;
}
.modal .class-info-wrap .class-name-wrap .class-teacher {
  font-size: 15px;
  font-weight: 400;
  color: #222222;
}

.join-code-modal .join-class-info-wrap .input-user-info-wrap input {
  height: 44px;
}

.join-code-modal .confirm-btn-wrap button {
  height: 44px;
  border-radius: 24px;
  font-weight: 700;
  font-size: 15px;
  color: #FFF;
}

.join-code-modal .confirm-btn-wrap {
  padding: 0 0 30px 0;
}
</style>
