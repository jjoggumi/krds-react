<!--
@File(Method): MarketingConsent.vue
@Description: 마케팅 수신동의 모달
@Modified: 2025-03-11 - #72837 HiModal 컴포넌트 적용 
-->
<template>
  <HiModal type="main" closeSkip>
    <template v-slot:content> 
      <div class="img_area">
        <img :src="imagePath" alt="마케팅 정보 수신 동의">
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="gray" square size="md" @click="disagreeMarketing">{{ btnDisagree }}</HiButton>
      <HiButton color="black" square size="md" @click="agreeMarketing">{{ btnAgree }}</HiButton>           
    </template>
  </HiModal> 
  <!-- <div class="hi-modal-common" style="display: block;">
      <div class="main_popup modal__layer">
          <div class="img_area">
            <img :src="imagePath" alt="마케팅 정보 수신 동의">
          </div>              
          <div class="btns">
              <button class="btn btn-not-agree" @click="disagreeMarketing">{{ btnDisagree }}</button>
              <button class="btn btn-agree" @click="agreeMarketing">{{ btnAgree }}</button>
          </div>
      </div>
  </div> -->
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "marketing-consent",
  data() {
    return {
      imagePath: '',
      btnAgree: '',
      btnDisagree: ''
    }
  },
  computed: {
    ...mapState({
      user: 'user'
    })
  },
  mounted() {
    let hasRandomIdx = false
    let randomIdx = 1
    let marketingPopup = {}
    const today = this.$moment().format('YYYYMMDD').toString()

    if (localStorage.getItem('marketingPopup')) {
      marketingPopup = JSON.parse(localStorage.getItem('marketingPopup'))
    }

    if (marketingPopup.randomIdx) {
      if (marketingPopup.randomIdx[today]) {
        hasRandomIdx = true
      }
    } else {
      marketingPopup.randomIdx = {}
    }

    if (hasRandomIdx) {
      randomIdx = marketingPopup.randomIdx[today]
    } else {
      randomIdx = Math.floor(Math.random() * 3) + 1
      marketingPopup.randomIdx[today] = randomIdx
    }

    this.setImage(randomIdx)
    this.setBtnStr(randomIdx)

    localStorage.setItem('marketingPopup', JSON.stringify(marketingPopup))
  },
  methods: {
    ...mapMutations({
      setIsShowMarketingConsentPopup: 'setIsShowMarketingConsentPopup',
      setUser: 'setUser'
    }),

    setImage(randomIdx) {
      try {
        let fileName = ''
        if (this.user.userType === 'TEACHER') {
          fileName = 'pup_teacher'
        } else {
          fileName = 'pup_parent'
        }
        this.imagePath = require(`@/assets/img/popup/${fileName}_0${randomIdx}.png`)
      } catch (e) {
        this.imagePath = require(`@/assets/img/popup/pup_teacher_01.png`)
      }
    },

    setBtnStr(randomIdx) {
      try {
        switch (randomIdx) {
          case 1: {
            this.btnAgree = '동의함'
            this.btnDisagree = '동의 안함'
            break
          }
          case 2: {
            this.btnAgree = '네'
            this.btnDisagree = '아니오'
            break
          }
          case 3: {
            this.btnAgree = '받을게요'
            this.btnDisagree = '나중에'
            break
          }
        }
      } catch (e) {
        this.btnAgree = '동의함'
        this.btnDisagree = '동의 안함'
      }
    },

    async updateMarketing(flag) {
      try {
        await this.$axios({
          method: 'PATCH',
          url: `${this.$apiUrl}/users/${this.user.currentId}/marketing`,
          data: { userMarketingUsed: flag }
        })

        await this.$axios({
          method: 'PATCH',
          url: `${this.$apiUrl}/users/${this.user.currentId}/marketingPush`,
          data: { userPushUsed: flag }
        })

        this.setUser({
          ...this.user,
          userMarketingUsed: flag,
          userMarketingTimestamp: this.$moment().valueOf(),
          userPushUsed: flag,
          userPushTimestamp: this.$moment().valueOf()
        })

        eventBus.$emit('main-set-user')
      } catch (error) {
        this.$log.debug('userMarketing update error: ', error)
      }
    },

    agreeMarketing() {
      this.updateMarketing(true)

      let marketingPopup = {}
      if (localStorage.getItem('marketingPopup')) {
        marketingPopup = JSON.parse(localStorage.getItem('marketingPopup'))
        delete marketingPopup.lastPopupOpenTimestamp
      }
      localStorage.setItem('marketingPopup', JSON.stringify(marketingPopup))

      this.setIsShowMarketingConsentPopup(false)
    },


    disagreeMarketing() {
      this.updateMarketing(false)

      let marketingPopup = {
        lastPopupOpenTimestamp: this.$moment().valueOf().toString()
      }

      if (localStorage.getItem('marketingPopup')) {
        marketingPopup = JSON.parse(localStorage.getItem('marketingPopup'))
        marketingPopup.lastPopupOpenTimestamp = this.$moment().valueOf().toString()
      }
      localStorage.setItem('marketingPopup', JSON.stringify(marketingPopup))

      this.setIsShowMarketingConsentPopup(false)
    }
  }
}
</script>

<style scoped lang='scss'>
.hi-modal-common {
  position: fixed;
  top: 150px;
  left: 100px;
  width: auto;
  height: auto;
  z-index: 9998;
}
.hi-modal-common .modal__layer.main_popup{
  border-radius:0;
  position: fixed;
  top: 150px;
  left: 100px;
  width: auto;
  height: auto;
  .img_area{
    width:100%;
  }
  .btns{
    button{
      width:200px;
      height:51px;
      background-color:#797979;
      color:#fff;
      border-radius:0;
      font-size:14px;
    }
    .btn-agree{
      background-color:#242424;
    }
  }
}

</style>