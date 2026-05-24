<template>
  <!-- 학생 가입요청 -->
  <div class="modal join-code-modal common-modal" style="display:block">
    <div class="modal-cont-wrap" ref="modal" :style="modalStyleObj">
      <div class="modal-cont boundary-box">
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">클래스 가입 요청</div>
            <p class="desc"></p>
          </div>
          <div class="join-class-info-wrap">
            <div class="input-user-info-wrap">
              <p>나의 이름을 입력하세요.</p>
              <div
                class="input-box-wrap"
                :class="{
                  focus: isFoucs.childName
                }"
              >
                <input
                  type="text"
                  ref="childName"
                  placeholder="학생 이름"
                  maxlength="20"
                  :value="childName"
                  @input="childName = $event.target.value"
                  @focus="isFoucs.childName = true"
                  @blur="isFoucs.childName = false"
                  @keydown.enter.prevent.stop="complete(clazzesKey)"
                />
              </div>
            </div>
            <div class="input-user-info-wrap">
              교실에서 나는
              <div
                class="input-box-wrap class-number"
                :class="{
                  focus: isFoucs.classNum
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
                  @keydown.enter.prevent.stop="complete(clazzesKey)"
                />
              </div>
              번 입니다.
            </div>
          </div>
          <div class="btn-wrap">
            <button
              class="btn-bg-w"
              @click="close"
            >취소</button>
            <button
              class="btn-bg-c"
              @click="complete(clazzesKey)"
              :class="{
                  dis: childName.length === 0 || classNum.length === 0
                }"
              :disabled="childName.length === 0 || classNum.length === 0"
            >
              완료
            </button>
          </div>
        </div>
        <div
          class="modal-close-btn modal-close-icon"
          @click="close()"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";

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
    m_width: 0
  }),
  props: ['schoolKey', 'clazzesKey'],
  computed: {
    modalStyleObj() {
      return {
        'margin-top': -this.m_height + 'px',
        'margin-left': -this.m_width + 'px'
      }
    }
  },
  watch: {
    childName(val, oldVal) {
      if (!this.$validation.isRegNamePattern4(val)) {
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
    complete: function(clazzesKey) {
      this.getDenialSubscribeClassByUserAndClass(clazzesKey).then(
        clazzSubscribes => {
          if (clazzSubscribes.length === 1) {
            this.doUpdateJoinClazzReq('APPLY', clazzSubscribes[0])
          } else {
            this.postSubscribeProc(clazzesKey)
          }
        }
      )
    },
    postSubscribeProc(clazzesKey) {
      if (this.childName.length === 0 || this.classNum.length === 0)
        return false

      if (isNaN(this.classNum)) {
        alert('잘못된 입력값입니다.')
        this.classNum = ''
        this.$refs.classNum.value = ''
        this.$refs.classNum.focus()
        return false
      }

      if (!this.isBusy) {
        this.isBusy = true
        let params = {
          memberChildName: this.childName,
          memberClassNumber: this.classNum,
          memberStatus: 'APPLY',
          clazz: clazzesKey,
          user: this.$parent.user.userUri,
          memberRole: 'MEMBER'
        }

        if (params.user === '') {
          params.user = this.$store.state.userUri
        }

        // this.$hiClass.clazzSubscribes
        //   .create(params)
        //   .then(result => {
        //     this.result = result.data

        //     this.$log.debug('create clazzSub res :  ', this.result)

        //     this.$emit('close-event', false)
        //     this.$emit('comp-evnt', true)
        //   })
        //   .catch(error => {
        //     this.$log.debug(error)
        //     this.result = error
        //   })
        //   .finally(() => {
        //     this.isBusy = false
        //   })

          try {
            const res = await axios({
              method: 'POST',
              url: `${this.api}/clazzSubscribes`,
              data: params
            })

            this.result = res.data
            this.$log.debug('create clazzSub res :  ', this.result)

            this.$emit('close-event', false)
            this.$emit('comp-evnt', true)
          } catch (error) {
            this.$log.debug("class join error => ", error)
            this.result = error

            if(this.result.response.status === 409) {
              const msg = '운영 중인 클래스가 아닙니다.'
              this.$hiClass.alert(msg)
            }
          } finally {
            this.isBusy = false
          }
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
    doUpdateJoinClazzReq(action, item) {
      const clazzSubscribeUuid = item.currentId
      item.memberStatus = action
      item.memberChildName = this.childName
      item.memberClassNumber = this.classNum

      const url = `/clazzSubscribes/${clazzSubscribeUuid}`

      this.$hiClass.clazzSubscribes
        .update(item, url)
        .then(() => {
          this.$emit('close-event', false)
          this.$emit('comp-evnt', true)
        })
        .catch(error => {
          this.$log.debug(
            this.$options.name,
            ' doUpdateJoinClazzReq() error => ',
            error
          )
        })
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')

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
