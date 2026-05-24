<template>
  <div>
    <!-- 초대코드로 가입하기 -->
    <div class="modal join-code-modal common-modal join-info join-call" 
      style="display:block"
      v-if="!stepProfile"
    >
      <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
        <div class="modal-cont">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title">클래스 가입 요청</div>
              <p class="desc">{{ `자녀의 이름(본명)을 ${ hasInviteCard ? '확인' : '입력' }하세요.` }}</p>
            </div>
            <div class="join-class-info-wrap">
              <div class="input-user-info-wrap">
                <p class="title-info">자녀이름</p>
                <div
                  class="input-box-wrap"
                  :class="{
                    focus: isFoucs.childName
                  }"
                >
                  <input
                    type="text"
                    ref="childName"
                    placeholder="자녀 이름 (한글, 영문 가능)"
                    maxlength="20"
                    :value="childName"
                    @input="[inputName($event), checkInputNameError($event)]"
                    @focus="isFoucs.childName = true"
                    @blur="isFoucs.childName = false"
                    @keydown.enter.prevent.stop="!(childName.length < 2 || isInputError) ? complete(clazzesKey) : null"
                  />
                </div>
                <span class="input-error-msg" v-if="isInputError">이름은 완성형 한글, 영문, 숫자로 2자 이상 입력해주세요.</span>
                <p class="w-info" v-if="!hasInviteCard">
                  * 같은 클래스에 자녀가 여러 명인 경우, 자녀명을 모두 입력해 주세요.
                </p>
              </div>

              <div class="confirm-btn-wrap">
                <button
                  class="btn-bg-c esc"
                  @click="close"
                >취소</button>
                <button
                  class="btn-bg-c"
                  @click="complete(clazzesKey)"
                  :class="{
                      dis: childName.length < 2 || isInputError
                    }"
                  :disabled="childName.length < 2 || isInputError" 
                >
                  완료
                </button>
              </div>
            </div>
            <!-- <div class="btn-wrap">
              <button
                class="btn-bg-w"
                @click="close"
              >취소</button>
              <button
                class="btn-bg-c"
                @click="complete(clazzesKey)"
                :class="{
                    dis: childName.length === 0
                  }"
                :disabled="childName.length === 0"
              >
                완료
              </button>
            </div> -->
          </div>
          <div
            class="modal-close-btn modal-close-icon"
            @click="close()"
          ></div>
        </div>
      </div>
    </div>

    <ProfileSettingModal v-if="isProfileSetting" :mode="'init'" :userInfoName="childName" :path="'search'" :classId="classId" @submit="submitProfileSettingModal" @closeProfileSettingModal="onCloseProfileSettingModal"/>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import axios from "@/plugins/axios";
import ProfileSettingModal from '@/components/Profile/ProfileSettingModal.vue';
import {mapState} from "vuex";

export default {
  name: 'MainSearchJoinInputFormByParent',
  data: () => ({
    isFoucs: {
      childName: false
    },
    isBusy: false,
    childName: '',
    result: '',
    m_height: 0,
    m_width: 0,
    stepProfile: false,
    isProfileSetting: false,
    classId: null,
    api: process.env.VUE_APP_BASE_API_URI,
    isInputError: false,
    joinMode: "new",
    reJoinClazzSubscribes: {},
    hasInviteCard: false
  }),
  components: {
    ProfileSettingModal
  },
  props: ['schoolKey', 'clazzesKey'],
  computed: {
    ...mapState([
      'user'
    ]),
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    },
    // isInputError() {
    //   const regexp = new RegExp(/[^A-Za-z0-9가-힣\s]/gi)
    //   return regexp.test(this.childName)
    // }
  },
  watch: {
    childName(val, oldVal) {
      if (!this.$validation.isRegNamePattern6(val)) {
        if (oldVal === undefined) oldVal = ''
        this.childName = oldVal
        this.$refs.childName.value = oldVal
      }
    }
  },
  methods: {
    close: function() {
      this.$emit('close-event', false)
    },
    complete: async function(clazzesKey) {
      if (!await this.showConfirmForStudentName()) return;
      this.getDenialSubscribeClassByUserAndClass(clazzesKey).then(
        clazzSubscribes => {
          if (clazzSubscribes.length === 1) {
            this.joinMode = "rejoin"
            this.reJoinClazzSubscribes = clazzSubscribes[0]
            // this.doUpdateJoinClazzReq('APPLY', clazzSubscribes[0])
          } else {
            this.joinMode = "new"
            // this.postSubscribeProc()
          }
          this.postSubscribeProc()
        }
      )
    },
    async postSubscribeProc() {
      this.stepProfile = true
      this.isProfileSetting = true
    },
    async submitProfileSettingModal(profileId) {
      if(this.joinMode === "new") {
        if (!this.isBusy) {
          this.isBusy = true
          let params = {
            memberChildName: this.childName,
            memberStatus: 'APPLY',
            clazz: this.clazzesKey,
            user: this.$parent.user.userUri,
            memberRole: 'MEMBER',
            profileId: profileId
          }

          try {
            const res = await axios({
              method: 'POST',
              url: `${this.api}/clazzSubscribes`,
              data: params
            })

            this.result = res.data
            this.$log.debug('create clazzSub res :  ', this.result)

            this.classUserProfileUpdate(profileId)
          } catch (error) {
            this.$log.debug("class join error => ", error)
            this.result = error

            if ([409, 412].includes(this.result.response.status)) {
              const msg = this.result.response.status === 409 ? '운영 중인 클래스가 아닙니다.' : '신청 승인 대기 중입니다.'
              this.$hiClass.alert(msg)

              this.isProfileSetting = false
              this.result.response.status === 409 ?
                  this.$emit('comp-evnt', true, { classId: this.classId }) :
                  this.$hiClass.setClazzSubscribeViews(this)
              this.$emit('close-event', false)
            }
          } finally {
            this.isBusy = false
          }
        }
      } else {
        this.doUpdateJoinClazzReq(profileId, this.reJoinClazzSubscribes)
      }
    },
    async classUserProfileUpdate(profileId) {
      try {
        await this.$axios({
          method: 'PUT',
          url: `/users/profiles/class/${this.classId}`,
          data: {
            profileId: profileId
          }
        })

        this.isProfileSetting = false
        this.$emit('close-event', false)
        this.$emit('comp-evnt', true)
      } catch (err) {
        this.$log.debug('profileSetting submit PUT() error => ', err)
      }
    },
    getDenialSubscribeClassByUserAndClass(clazzesKey) {
      const params = {
        userId: this.$parent.user.currentId,
        classId: this.$comn.split(clazzesKey, '/'),
        memberStatus: 'DENIAL'
      }
      return this.$hiClass.clazzSubscribeViews.search(params).then(result => {
        this.$log.debug(
          this.$options.name +
            ' getDenialSubscribeClassByUserAndClass() result: ',
          result
        )
        return result.data._embedded.clazzSubscribeViews
      })
    },
    doUpdateJoinClazzReq(profileId, item) {
      const clazzSubscribeUuid = item.currentId
      item.memberStatus = 'APPLY'
      item.memberChildName = this.childName
      item.profileId = profileId

      const url = `/clazzSubscribes/${clazzSubscribeUuid}`

      this.$hiClass.clazzSubscribes
        .update(item, url)
        .then((res) => {
          // this.$emit('close-event', false)
          // this.$emit('comp-evnt', true)

          if(res.data.clazz.classStatus === "CLOSING") {
            const msg = '운영 중인 클래스가 아닙니다.'
            this.$hiClass.alert(msg)

            this.isProfileSetting = false
            this.$emit('close-event', false)
            this.$emit('comp-evnt', true, {
              classId: res.data.clazz.currentId
            })
          } else {
            this.classUserProfileUpdate(profileId)
          }
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name,
            ' doUpdateJoinClazzReq() error => ',
            error
          )
        })
    },
    inputName(e) {
      e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
      this.childName = e.target.value

      if(this.childName.length < 2) {
        this.isInputError = true
        return
      }
    },
    checkInputNameError: debounce(function(e) {
      const childName = this.childName

      if(childName.length < 2) {
        this.isInputError = true
        return
      }

      const regexp = new RegExp(/[^A-Za-z0-9가-힣\s]/gi)
      if(regexp.test(childName)) {
        this.isInputError = true
      } else {
        this.isInputError = false
      }
    }, 200),
    async getInviteCards() {
      try {
        const res = await this.$axios.get(`/clazzInviteCards/${this.user.currentId}/invite-user/${this.classId}`)
        this.childName = res.data.studentName.substring(0, 20)
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
      this.$emit('close-event', false)
      this.isProfileSetting = false
      this.stepProfile = false
    }
  },
  mounted() {
    this.classId = this.$comn.split(this.clazzesKey, '/')

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
.common-modal .modal-title-wrap { padding-bottom: 25px; }
.join-code-modal .join-class-info-wrap .input-user-info-wrap input {
  height: 44px;
}
.join-code-modal.common-modal .modal-cont-wrap .boundary-box { 
  width:400px; 
  min-height: 350px;
  height: 350px;
}
.join-code-modal.common-modal .join-class-info-wrap {
  margin: 0 20px 0;
}
.common-modal .btn-wrap { position: relative; }
.common-modal .btn-wrap button { width: 140px; height: 44px; border-radius: 24px; font-size: 15px; font-weight: 700; }
.common-modal .btn-wrap button:first-child { 
    margin: 30px 10px 30px 20px;
    color: var(--primary);
}
.common-modal .btn-wrap button:last-child { 
    margin: 30px 20px 30px 10px;
}
.input-box-wrap {
  width: 340px;
  margin: 0 auto;
}
.join-code-modal .join-class-info-wrap .input-user-info-wrap p.title-info { 
    color: #222222; 
    font-size: 13px; 
    width: 340px;
    margin: 0 auto;
    margin-bottom: 4px; 
} 
.join-code-modal .join-class-info-wrap .input-user-info-wrap p.w-info { 
    font-size: 14px;
    font-weight: 400;
    line-height: 21px;
    text-align: left;
    color: var(--primary);
    word-break: break-all;
    margin: 10px 0 0 0;
    padding: 0;
    width: 340px;
    margin: 0 auto;
}
</style>
