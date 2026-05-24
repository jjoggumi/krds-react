<!--
@File(Method):AlarmPlusSubscribeItem.vue
@Author: -
@Date Created: -
@Description: 가입 요청하기
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 5년전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->
<template>
  <div
    v-if="
      isUseComponent && alarmPlus.isEnabled && alarmPlus.isSubscribed === false
    "
    class="apply-family-letter-con"
  >
    <div class="apply-family-letter">
      <div class="title-wrap">
        <p>
          설문 회신, 방과후 신청, 학부모 상담 신청 기능을 이용하시려면 <br />
          별도의 가입 요청이 필요합니다.
        </p>
      </div>
      <div class="apply-family-letter-btn-wrap">
        <button class="btn-bg-w2" @click="handleSubscribePop(true)">
          가입 요청하기
        </button>
      </div>
    </div>

    <alarm-plus-subscribe-popup
      v-if="isShowSubscribePop"
      :schoolId="schoolId"
      @handleSubscribePop="handleSubscribePop"
    ></alarm-plus-subscribe-popup>
  </div>
</template>

<script>
import AlarmPlusSubscribePopup from './AlarmPlusSubscribePopup'

export default {
  name: 'AlarmPlusSubscribeItem',
  components: {
    AlarmPlusSubscribePopup
  },
  props: {
    schoolId: String,
    curForm: String
  },
  data() {
    return {
      alarmPlus: {
        isEnabled: false,
        isSubscribed: null
      },
      isShowSubscribePop: false,
      userId: this.$store.state.user.currentId
    }
  },
  watch: {
    schoolId(val, oldVal) {
      if (val !== oldVal && val !== undefined && val !== '')
        this.getElSchoolSubscribeCheck()
    }
  },
  computed: {
    isAlarmForm() {
      return this.curForm === 'ALARM'
    },
    isParents() {
      const userType = this.$store.state.user.userType
      return userType === 'TEACHER' || userType === 'PARENTS' ? true : false
    },
    isUseComponent() {
      return this.$store.state.isVisibleAlarmPlus &&
        this.isAlarmForm &&
        this.isParents
        ? true
        : false
    }
  },
  methods: {
    getElSchoolSubscribeCheck() {
      if (!this.isUseComponent) return false

      if (
        this.schoolId !== undefined &&
        this.schoolId !== null &&
        this.schoolId !== ''
      ) {
        this.$axios({
          method: 'get',
          url: '/educationLetters/schoolSubscribeCheck',
          params: {
            schoolId: this.schoolId
          }
        })
          .then(res => {
            this.$log.debug(
              this.$options.name + ' getElSchoolSubscribeCheck() res => ',
              res
            )
            const data = res.data
            if (data.status.resultCode === '0' && data.useYn === 'Y')
              this.alarmPlus.isEnabled = true
            else this.alarmPlus.isEnabled = false
          })
          .catch(err => {
            this.$log.debug(
              this.$options.name + ' getElSchoolSubscribeCheck() err => ',
              err
            )
            this.alarmPlus.isEnabled = false
          })
          .finally(() => {})
      }
    },
    getElUserSubscribeCheck() {
      if (!this.isUseComponent) return false

      if (
        this.schoolId !== undefined &&
        this.schoolId !== null &&
        this.schoolId !== '' &&
        this.userId !== undefined &&
        this.userId !== null &&
        this.userId !== ''
      ) {
        this.$axios({
          method: 'get',
          url: '/educationLetters/userSubscribeCheck',
          params: {
            schoolId: this.schoolId,
            userId: this.userId
          }
        })
          .then(res => {
            this.$log.debug(
              this.$options.name + ' getElUserSubscribeCheck() res => ',
              res
            )
            const data = res.data

            if (data.status.resultCode === '0' && data.useYn === 'Y') {
              this.$log.debug('가정통신문을 가입중인 회원입니다.')
              this.alarmPlus.isSubscribed = true
            } else if (data.status.resultCode === '0' && data.useYn === 'N') {
              this.$log.debug('가정통신문 미가입 회원입니다.')
              this.alarmPlus.isSubscribed = false
            }
          })
          .catch(err => {
            this.$log.debug(
              this.$options.name + ' getElUserSubscribeCheck() err => ',
              err
            )
            this.alarmPlus.isSubscribed = false
          })
          .finally(() => {})
      }
    },
    handleSubscribePop(flag) {
      this.isShowSubscribePop = flag
    }
  },
  mounted() {
    this.getElSchoolSubscribeCheck()
    this.getElUserSubscribeCheck()
  }
}
</script>
<style scoped>
.apply-family-letter-con {margin:0 0 20px 0;padding:30px 0 32px;text-align:center;
    border-radius: 10px;
    box-shadow: 0px 2px 6px 0 rgba(0, 0, 0, 0.1);
    background: #fff;
}
.apply-family-letter-con .title-wrap {
    margin-top: 10px;
}
.apply-family-letter-con .title-wrap .title {line-height: 26px;font-size: 26px;font-weight:bold;color: #2e2e2e;margin-bottom: 12px;}
.apply-family-letter-con .title-wrap p {line-height:20px;color: #333;font-size: 16px;font-weight: 600;transform: skew(0.2deg);}
.apply-family-letter-con .apply-family-letter-btn-wrap {margin:32px 0 0 0;}
.apply-family-letter-con .apply-family-letter-btn-wrap button {width:248px;height:36px;border-radius:18px;}
</style>