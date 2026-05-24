<!--
@File(Method): AlarmPlusInviteCardPopup.vue
@Author: -
@Date Created: -
@Description: 가정통신문 초대장
@Modified: 2024-08-29 - #68110 해당 페이지에만 적용된 css라 글로벌 css 에서 scoped css 로 변경처리
@ETC : 4년전 수정된 파일로 현재 사용하는지 여부 알수 없음. 
-->
<template>
  <!-- 클래스 초대장 가입하기 -->
  <!-- && !option.isDelay && cardInfos.length > 0 -->
  <div
    v-if="cardInfos.length > 0"
    class="modal modal-invitation"
    style="display: block;"
  >
    <div
      class="modal-cont boundary-box"
      style="margin-top: -289.5px; margin-left: -280px;"
      v-click-outside="closeAlarmPlusInviteCard"
    >
      <div class="modal-title-wrap">
        <h1 class="title">가정통신문 초대장</h1>
      </div>
      <section class="modal-body-wrap">
        <div class="school-info">
          <i class="school-emblem"><img :src="schoolImage" alt=""/></i>
          <p>
            <em>{{ alarmPlusInviteSchool.schoolName }}</em> 초대장이 도착했습니다.
          </p>
        </div>
        <ul class="ivitate-list">
          <li
            v-for="cardInfo of cardInfos"
            :key="cardInfo.elInviteCardLetterId"
          >
            <span>{{ cardInfo.grade }}학년</span>
            <span>{{ cardInfo.className }}반</span>
            <span>{{ cardInfo.studentNo }}번</span>
            <span>{{ cardInfo.studentName }}</span>
          </li>
        </ul>
        <p class="msg">
          학부모님의 자녀가 가정통신문에 가입되었습니다.<br />수락하시면
          가정통신문 서비스를 받아 보실 수 있습니다.
          <small>*본인 자녀가 아닐 경우 학교에 문의 바랍니다.</small>
        </p>
      </section>
      <div class="confirm-btn-wrap">
        <button class="btn-bg-w" @click="inviteCardAgree('DENIAL')">
          거절
        </button>
        <button class="btn-bg-c" @click="inviteCardAgree('ACCEPT')">
          수락
        </button>
      </div>
      <button
        type="button"
        class="modal-close"
        @click="closeAlarmPlusInviteCard"
      ></button>
      <!-- <div class="effective-loading" style="display:none;">
        <span>유효성 검사중</span>
      </div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlarmPlusInviteCardPopup',
  props: {},
  data() {
    return {
      schools: [],
      cardInfos: [],
      option: {
        isDelay: null
      }
    }
  },
  computed: {
    user() {
      return this.$store.state.user
    },
    alarmPlusInviteSchool() {
      return this.$store.state.alarmPlusInviteSchool
    },
    // isShow() {
    //   if (this.alarmPlusInviteSchool.currentId !== undefined) {
    //     this.$hiClass.toggleBodyClass('add', 'hidden')
    //     return true
    //   } else {
    //     this.$hiClass.toggleBodyClass('remove', 'hidden')
    //     return false
    //   }
    // },
    schoolImage() {
      let rtnValue = ''
      try {
        let imagePath = this.alarmPlusInviteSchool.schoolImagePath
        let defaultImagePath = this.$store.state.schoolImageDefault
        const size = '90'

        if (imagePath !== undefined && imagePath !== null && imagePath !== '') {
          rtnValue = imagePath + `?width=${size}&height=${size}`
        } else rtnValue = defaultImagePath
      } catch (error) {
        this.$log.debug(error)
      }
      return rtnValue
    }
  },
  watch: {
    // isShow(val) {
    //   if (val) {
    //     this.getInviteCardInfo()
    //   } else if (val === false) {
    //     this.$store.commit('setAlarmPlusInviteSchool', {})
    //   }
    // },
    'option.isDelay'(val) {
      if (val) {
        this.$store.commit('setAlarmPlusInviteSchool', {})
        this.option.isDelay = null
      }
    }
  },
  created() {
    this.getInviteCardInfo()
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    close() {
      this.$store.commit('setAlarmPlusInviteSchool', {})
    },
    closeAlarmPlusInviteCard(type) {
      let storage =
        JSON.parse(localStorage.ignoreAlarmPlusInviteCard || null) || []

      if (type !== undefined && type === 'remove') {
        storage = storage.filter(item => {
          return item.schoolId !== this.alarmPlusInviteSchool.currentId
        })

        localStorage.ignoreAlarmPlusInviteCard = JSON.stringify(storage)
      } else {
        storage = storage.filter(item => {
          return item.schoolId === this.alarmPlusInviteSchool.currentId
        })

        if (storage.length === 0) {
          const elInviteCardLetterIds = []
          for (const cardInfo of this.cardInfos)
            elInviteCardLetterIds.push(cardInfo.elInviteCardLetterId)

          if (elInviteCardLetterIds.length > 0) {
            storage.push({
              schoolId: this.alarmPlusInviteSchool.currentId,
              elInviteCardLetterIds: elInviteCardLetterIds
            })

            localStorage.ignoreAlarmPlusInviteCard = JSON.stringify(storage)
          }
        }
      }
      this.$store.commit('setAlarmPlusInviteSchool', {})
    },

    getInviteCardInfo() {
      this.$axios({
        method: 'get',
        url: '/educationLetters/inviteCardInfo',
        params: {
          mobile: this.user.userMobile,
          schoolId: this.alarmPlusInviteSchool.currentId
        }
      })
        .then(res => {
          this.$log.debug(
            this.$options.name + ' getInviteCardInfo() res : ',
            res
          )
          this.cardInfos = res.data.list
          this.option.isDelay = false

          // 가정통신문 플러스 초대장 보류 확인
          // let storage =
          //   JSON.parse(localStorage.ignoreAlarmPlusInviteCard || null) || []
          // storage = storage.filter(item => {
          //   return item.schoolId === this.inviteSchool.currentId
          // })

          // if (storage.length > 0) {
          //   // alert('보류된 초대장입니다.')
          //   this.cardInfos = []
          //   this.option.isDelay = true
          // } else {
          //   this.cardInfos = res.data.list
          //   this.option.isDelay = false
          // }
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name + ' getInviteCardInfo() err :',
            err
          )
          this.close()
        })
        .finally(() => {
          if (this.cardInfos.length === 0)
            this.close()
        })
    },
    inviteCardAgree(act) {
      if (act === 'ACCEPT' || act === 'DENIAL') {
        let elInviteCardLetterIds = []
        let agreementYn = ''

        if (act === 'ACCEPT') agreementYn = 'Y'
        else if (act === 'DENIAL') agreementYn = 'R'

        for (const cardInfo of this.cardInfos)
          elInviteCardLetterIds.push(cardInfo.elInviteCardLetterId)

        this.$axios({
          method: 'post',
          url: '/educationLetters/inviteCardAgree',
          params: {
            userId: this.user.currentId,
            elInviteCardLetterIdList: elInviteCardLetterIds,
            agreementYn: agreementYn
          }
        })
          .then(res => {
            this.$log.debug(
              this.$options.name + ' inviteCardAgree() res :. ',
              res
            )
            if (res.data.status.resultCode === '0') {
              let msg = ''

              if (act === 'ACCEPT') msg = '수락되었습니다.'
              else if (act === 'DENIAL') msg = '수락 거부되었습니다.'

              alert(msg)

              this.closeAlarmPlusInviteCard('remove')

              // 초대장 수락 후 새로고침 처리 추가
              if (act === 'ACCEPT') this.$router.go(0)
            }
          })
          .catch(err => {
            this.$log.debug(
              this.$options.name + ' inviteCardAgree() err : ',
              err
            )
          })
          .finally(() => {})
      }
    }
  }
}
</script>

<style scoped>
.modal-invitation.bg-black {background:#000;}
.modal-invitation .modal-cont {
    position:absolute;
    top:50%;
    left:50%;
    padding:20px 0 0 0;
    text-align:center;
    overflow:auto;
}
.modal-invitation .modal-close {
    position:absolute;
    top:24px;
    right:24px;
    width:24px;
    height:24px;
    margin:0 0 0 32px;
    background-image:url('../../assets/img/icon_modal_close_24.png');
    cursor:pointer;
}
.modal-invitation .modal-close:hover {opacity:0.8;}
.modal-invitation .modal-title-wrap {padding:10px 0 0 0;margin:0 0 11px 0;}
.modal-invitation .modal-title-wrap .title {line-height:1.33;margin:0 0 28px 0;font-size:18px;font-weight:bold;}
.modal-invitation .modal-title-wrap p {font-size:14px;line-height:1.57;}
.modal-invitation .modal-cont {
    width:560px;
}
.modal-invitation .modal-body-wrap {
    padding: 20px 30px 0 30px;
    box-sizing: border-box;
    border-top: 1px solid #e3e3e3;
    text-align: left;
}
.modal-invitation .modal-body-wrap {
    padding:20px 30px 0 30px;
    box-sizing:border-box;
    border-top:1px solid #e3e3e3;
    text-align:left;
}
.modal-invitation .school-info .school-emblem {
    display:block;
    width:90px;
    height:90px;
    border-radius:50%;
    overflow:hidden;
    margin:0 auto;
}
.modal-invitation .modal-body-wrap .school-emblem img {
    width:100%;
    height:100%;
}
.modal-invitation .school-info p {
    font-size: 16px;
    text-align: center;
    margin-top: 10px;
    -webkit-transform: skew(.2deg);
    transform: skew(.2deg);
}
.modal-invitation .school-info p em { color:var(--primary);font-weight:bold; }

.modal-invitation .ivitate-list {
    margin: 20px 30px!important;
}
.modal-invitation .ivitate-list li {
    height:38px;
    line-height:38px;
    background:#eceded;
    text-align:center;
    margin-top:4px;
    border-radius:3px;
}
.modal-invitation .ivitate-list li span {
    display:inline-block;
    margin:0 10px;
    -webkit-transform:skew(.2deg);transform:skew(.2deg);
}
.modal-invitation .msg {
    text-align:center;
    line-height:1.4em;
    -webkit-transform:skew(.2deg);transform:skew(.2deg);
}
.modal-invitation .msg small {
    display:block;
    color:#888;
    margin-top:15px;
    -webkit-transform:skew(.2deg);transform:skew(.2deg);
}
.modal-invitation .confirm-btn-wrap button { width:240px; }
.modal-invitation .confirm-btn-wrap {padding:28px 0 36px 0;}
.modal-invitation .confirm-btn-wrap button {width:180px;height:36px;line-height:36px;margin:0 5px;border-radius:18px;font-size:14px;font-weight:bold;}

</style>
