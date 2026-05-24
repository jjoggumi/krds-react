<template>
  <button
    v-if="schoolSubscribeButtonType === CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.SCHOOLS"
    class="btn-subscribe"
    :class="{
      'is-active': isSubscribe
    }"
    @click="onClickSubscribeButton"
  >
    {{ subscribeButtonText }}
  </button>

  <button
    v-else-if="isSubscribe
      && schoolSubscribeButtonType === CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.MYPAGE
    "
    class="btn-bg-w2"
    @click="onClickSubscribeButton"
  >
    {{ subscribeButtonText }}
  </button>

  <button
    v-else-if="schoolSubscribeButtonType === CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.SEARCH"
    class="subscribe-btn"
    :class="{
      'btn-bg-w2': isSubscribe,
      'btn-bg-c': !isSubscribe
    }"
    @click="onClickSubscribeButton"
  >
    {{ subscribeButtonText }}
  </button>

  <div v-else></div>
</template>

<script>
import {mapGetters, mapState} from "vuex";
// import MainBodySchoolsSubscribeBtnMessage from './MainBodySchoolsSubscribeBtnMessage.vue'

export default {
  name: 'main-body-schools-subscribe-btn',
  props: {
    isDisabledSubscribeButton: {
      type: Boolean
    },
    isSubscribe: {
      type: Boolean
    },
    schoolUri: {
      type: String
    },
    subscribeUuid: {
      type: String
    },
    schoolSubscribeButtonType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      counter: 0,
      subscribeClassIdList: [],
      subscribeClassIdListCnt: 0,
      userSubscribeClassCntByCurrenSchool: 0
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      userUri: 'userUri',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    subscribeButtonText() {
      let btnText = ''

      switch (this.schoolSubscribeButtonType) {
        case this.CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.SCHOOLS:
          btnText = this.isSubscribe
            ? this.$t('schools.header.button.subscribed')
            : this.$t('schools.header.button.subscribe2')
          break
        case this.CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.MYPAGE:
          btnText = this.isSubscribe
            ? this.$t('schools.header.button.subscribed')
            : this.$t('schools.header.button.subscribe')
          break
        case this.CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.SEARCH:
          btnText = this.isSubscribe
            ? this.$t('schools.header.button.subscribed')
            : this.$t('schools.header.button.subscribe')
          break
        default:
          btnText = this.isSubscribe
            ? this.$t('schools.header.button.subscribed')
            : this.$t('schools.header.button.subscribe')
      }

      return btnText
    },
    isBusy() {
      return this.$store.state.isLoading || false
    },
    existsSubscribedClass() {
      return !!(this.userSubscribeClassCntByCurrenSchool !== null &&
        this.userSubscribeClassCntByCurrenSchool > 0)
    },
  },
  created() {
  },
  methods: {
    onClickSubscribeButton() {
      if (!this.isDisabledSubscribeButton) {
        this.isSubscribe
          ? this.onUnsubscribe()
          : this.subscribe()
      }
    },
    initCnt() {
      this.subscribeClassIdList = []
      this.subscribeClassIdListCnt = 0
    },
    async subscribe() {
      const userId = this.$store.state.user.currentId

      const chkres = await this.$hiClass.schoolSubscribeViews.search({
        userId,
        size: 200,
        sort: 'insertedTimestamp,desc'
      })

      if(chkres.data.page.totalElements >= 20){
        try {
          const checkMsg = await this.$hiClass.confirmCustom("학교 구독은 최대20개까지만 가능합니다", "확인", "나의 학교 보기")
          if(checkMsg.isConfirmed === false){
            this.$router.push('/main/mypage/schools', () => {})
          }
        } catch (err) {
          console.log("err", err)
        }
        return
      }

      if (!this.isBusy && this.schoolUri && this.userUri) {
        this.setIsBusy(true)
        
        const data = {
          school: this.schoolUri,
          user: this.userUri
        }

        // this.$hiClass.schoolSubscribes
        //   .create(data)
        //   .then(result => {
        //     this.$log.debug(result.data)
        //     this.setIsBusy(false)
        //     const subscribeUri = result.data._links.self.href
        //     this.$emit('subscribeComplete', subscribeUri)
        //   })
        //   .catch(error => {
        //     this.$log.debug(error)
        //     this.setIsBusy(false)
        //   })

        try {
          let res = await this.$hiClass.schoolSubscribes.create(data)
          this.$log.debug(res.data)
          this.setIsBusy(false)
          let subscribeUri = res.data._links.self.href
          this.$emit('subscribeComplete', subscribeUri)
        } catch (err) {
          this.setIsBusy(false)
          this.$log.debug(err)
        }
      }
    },
    async unsubscribeProc() {
      this.setIsBusy(true)
      this.initCnt()

      let msg = ''
      if (this.existsSubscribedClass) {
        msg = '가입된 클래스가 포함된 학교입니다.<br>학교 구독을 해제할 경우, 더 이상 학교 소식은 받아볼 수 없습니다.<br>해제하시겠습니까?'
      } else {
        msg = '더 이상 학교 소식을 받아볼 수 없습니다.<br>학교 구독을 해제하시겠습니까?'
      }

      if (msg) {
        await this.$hiClass.confirm(msg, 'warning')
          .then(() => this.unsubscribeProc2())
          .catch(() => this.setIsBusy(false))
      } else {
        this.unsubscribeProc2()
      }
    },
    unsubscribeProc2() {
      const url = `/schoolSubscribes/${this.subscribeUuid}`

      this.$hiClass.schoolSubscribes
        .delete(url)
        .then(() => {
          this.setIsBusy(false)
          this.$emit('unSubscribeComplete')
        })
        .catch(error => {
          this.$log.debug(error)
          this.setIsBusy(false)
        })
    },
    async onUnsubscribe() {
      await this.onUnsubscribe2()
    },
    onUnsubscribe2() {
      if (!this.isBusy && this.user.currentId !== '') {
        this.setIsBusy(true)
        const params = {
          userId: this.user.currentId,
          memberStatus: 'ACCEPT'
        }

        // 클래스 구독여부 체크
        this.$hiClass.clazzSubscribeViews
          .search(params)
          .then(result => {
            if (result.data.page.totalElements > 0) {
              const clazzSubscribeViews =
                result.data._embedded.clazzSubscribeViews
              this.subscribeClassIdList.splice(0)
              // 구독중인 클래스가 속한 학교 구독해지 불가 처리
              for (const clazzSubscribeView of clazzSubscribeViews) {
                this.subscribeClassIdList.push(clazzSubscribeView.classId)
              }
              if (this.subscribeClassIdList.length === 0)
                this.subscribeClassIdList = ''

            } else {
              this.subscribeClassIdList = ''
            }

            return this.subscribeClassIdList
          })
          .then(subscribeClassIdList => {
            // 구독중인 클래스가 속한 학교 구독해지 불가 처리
            if (subscribeClassIdList !== '') {
              for (const classId of subscribeClassIdList) {
                this.$axios({
                  method: 'get',
                  url: `/clazzes/${classId}`
                }).then(results => {
                  if (results.data.school !== null) {
                    this.subscribeClassIdListCnt++

                    // 클래스가 활성화인 경우에만 카운팅
                    if (results.data.classStatus === 'ACTIVATE') {
                      let schoolUri = `${this.$apiUrl}/schools/${results.data.school.currentId}`
                      if (schoolUri === this.schoolUri)
                        this.userSubscribeClassCntByCurrenSchool++
                    }

                    if (this.subscribeClassIdList.length === this.subscribeClassIdListCnt)
                      this.unsubscribeProc()
                  }
                })
              }
            } else {
              this.unsubscribeProc()
            }
            this.setIsBusy(false)
          })
          .catch(error => {
            this.$comn.log(this, 'getSubscribeClassList() => error', error)
            this.setIsBusy(false)
          })
      }
    },
    setIsBusy(flag) {
      flag === true
        ? this.$store.commit('setIsLoading', true)
        : this.$store.commit('setIsLoading', false)
    }
  },
}
</script>
