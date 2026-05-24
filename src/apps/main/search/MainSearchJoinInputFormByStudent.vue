<template>
  <div>
  <!-- 학생 가입요청 -->
    <div 
      class="modal join-code-modal common-modal join-info join-call student" 
      style="display:block"
      v-if="!stepProfile"
    >
      <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
        <div class="modal-cont">
          <div class="modal-cont-inner">
            <div class="modal-title-wrap">
              <div class="title">클래스 가입 요청</div>
              <p class="desc">{{ `이름과 반 번호를 ${ hasInviteCard ? '확인' : '입력' }하세요.` }}</p>
            </div>

            <div class="join-class-info-wrap">
              <div class="input-user-info-wrap">
                <p>학생 이름</p>
                <div class="input-box-wrap"
                  :class="{
                    focus: isFoucs.childName,
                  }"
                >
                  <input
                    type="text"
                    ref="childName"
                    placeholder="나의 이름을 입력하세요."
                    maxlength="20"
                    :value="childName"
                    @input="[inputName($event), checkInputNameError($event)]"
                    @focus="isFoucs.childName = true"
                    @blur="isFoucs.childName = false"
                    @keydown.enter.prevent.stop="!(childName.length < 2 || classNum.length === 0 || isInputError) ? complete(clazzesKey) : null"
                  />
                </div>
                <span class="input-error-msg" v-if="isInputError">이름은 완성형 한글, 영문, 숫자로 2자 이상 입력해주세요.</span>
              </div>
              <div class="input-user-info-wrap">
                <p>반 번호</p>
                교실에서 나는
                <div class="input-box-wrap class-number"
                  :class="{
                    focus: isFoucs.classNum,
                  }"
                >
                  <input
                    type="tel"
                    ref="classNum"
                    placeholder="99"
                    maxlength="2"
                    :value="classNum"
                    @input="classNum = $event.target.value"
                    @focus="isFoucs.classNum = true"
                    @blur="isFoucs.classNum = false"
                    @keydown.enter.prevent.stop="!(childName.length < 2 || classNum.length === 0 || isInputError) ? complete(clazzesKey) : null"
                  />
                </div>
                번 입니다.
              </div>

              <div class="confirm-btn-wrap">
                <button class="btn-bg-c esc" @click="close">취소</button>
                <button
                  class="btn-bg-c"
                  @click="complete(clazzesKey)"
                  :class="{
                      dis: childName.length < 2 || classNum.length === 0 || isInputError
                    }"
                  :disabled="childName.length < 2 || classNum.length === 0 || isInputError"
                >완료</button>
              </div>
            </div>
          </div>
          <div
            class="modal-close-btn modal-close-icon"
            @click="close()"
          ></div>
        </div>
      </div>
    </div>

    <ProfileSettingModal v-if="isProfileSetting" :mode="'init'" :userInfoName="childName" :path="'search'" :classId="classId"  @submit="submitProfileSettingModal" @closeProfileSettingModal="onCloseProfileSettingModal"/>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import axios from "@/plugins/axios";
import ProfileSettingModal from '@/components/Profile/ProfileSettingModal.vue';
import {mapState} from "vuex";
import {
  postBannedWordsCheck
} from "@hiclass/core"

export default {
  name: 'MainSearchJoinInputFormByStudent',
  data: () => ({
    isFoucs: {
      childName: false,
      classNum: false
    },
    isBusy: false,
    childName: '',
    classNum: '',
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
    },
    classNum(val, oldVal) {
      let revokeFlg = false
      if (
        !this.$validation.isRegNumber(val) ||
        (val.length === 1 && (val === '0' || val === 0)) ||
        (val.length === 2 && val.startsWith('0', 0))
      ) {
        revokeFlg = true
      }

      if (oldVal === undefined) oldVal = ''

      if (revokeFlg) {
        this.classNum = oldVal
        this.$refs.classNum.value = oldVal
      }
    }
  },
  methods: {
    close: function() {
      this.$emit('close-event', false)
    },
    complete: async function(clazzesKey) {
      try {
        await postBannedWordsCheck({ keyword: this.childName });
        this.getDenialSubscribeClassByUserAndClass(clazzesKey).then(
          clazzSubscribes => {
            if (clazzSubscribes.length === 1) {
              this.joinMode = "rejoin"
              this.reJoinClazzSubscribes = clazzSubscribes[0]
            } else {
              this.joinMode = "new"
            }
            this.postSubscribeProc()
          }
        )
      } catch(error) {
        const errorCode = error?.response.data?.error;
        if(errorCode == 451) {
          this.$hiClass.alert('적절하지 못한 단어가 포함되어 있습니다.');
        } else {
          this.$hiClass.alert('요청 처리 중 오류가 발생했습니다.');
        }
      }
    },
    async postSubscribeProc() {
      if (this.childName.length === 0 || this.classNum.length === 0)
        return false

      if (isNaN(this.classNum)) {
        alert('잘못된 입력값입니다.')
        this.classNum = ''
        this.$refs.classNum.value = ''
        this.$refs.classNum.focus()
        return false
      }

      this.stepProfile = true
      this.isProfileSetting = true
    },
    async submitProfileSettingModal(profileId) {
      if(this.joinMode === "new") {
        if (!this.isBusy) {
          this.isBusy = true
          let params = {
            memberChildName: this.childName,
            memberClassNumber: this.classNum,
            memberStatus: 'APPLY',
            clazz: this.clazzesKey,
            user: this.$parent.user.userUri,
            memberRole: 'MEMBER',
            profileId: profileId
          }

          if (params.user === '') {
            params.user = this.$store.state.userUri
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
            profileId :profileId
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
      item.memberClassNumber = this.classNum
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
        this.classNum = res.data.studentNo
        this.hasInviteCard = true
      } catch (e) {
        this.hasInviteCard = false
      }
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

<style scoped></style>
