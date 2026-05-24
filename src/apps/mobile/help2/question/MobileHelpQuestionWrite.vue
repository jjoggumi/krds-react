<!--
@File(Method): MobileHelpQuestionWrite.vue
@Date Created: -
@Description: 1:1문의하기 > 쓰기
@Modified: 2024-12-17 - #70648 1:1문의하기 웹뷰
-->
<template>
  <div class="m-wrap">
    <!-- #70648 header 추가 -->
    <header class="m-header">
      <HiButton class="m-btn-left" color="link" @click="$emit('close')">
        <HiIcon name="ico-close" size="20" class="p-05"/>
      </HiButton>
      <h1>1:1 문의하기</h1>
      <HiButton class="m-btn-right" color="link" :disabled="!isSubmit" @click="doSubmit">보내기</HiButton>
    </header>
    <div class="m-container">
      <div class="m-box-question">
        <div class="m-box-item">
          <div class="input-title">휴대폰 번호<span class="txt-warning">*</span></div>
          <div class="input-box-wrap">
            <hc-input-phone
              v-model="model.phone"
              placeholder="휴대폰 번호 (숫자만)"
            />
          </div>
        </div>
        <div class="m-box-item">
          <div class="input-title">문의 유형<span class="txt-warning">*</span></div>
          <!-- <hc-m-select
            style="width:100%;!important"
            :model.sync="model.helpChatCategory"
            selectLabel="categoryTitle"
            selectValue="helpChatCategory"
            defaultLabel="선택"
            :item="codes.chatCategorys"
          /> -->          
          <HiSelectBox  class="opt-default w100"
            :value="model.helpChatCategory"
            @update:value="model.helpChatCategory = $event"
            :items="codes.chatCategorys.map(cate => ({
              title: cate.categoryTitle,
              value: cate.helpChatCategory
            }))"
            :empty-title="model.helpChatCategory || '선택'"
          />
        </div>
        <div class="m-box-item">
          <div class="input-title">내용<span class="txt-warning">*</span></div>
          <div class="m-box-item">
            <div class="input-box-wrap">
              <textarea
                class="noresize"
                maxlength="1500"
                placeholder="- 문의 내용과 함께 캡처 화면이나 녹화 파일을 첨부해주시면 보다 빠르게 도움을 드릴 수 있습니다."
                v-model="model.contentQuestion"
                v-on:input="model.contentQuestion = $event.target.value"
              ></textarea>
            </div>
            <mobile-upload
              ref="mobileUpload"
              :files.sync="model.files"
              :param="{
                size: $store.state.upload.help.size,
                limit: $store.state.upload.help.limit
              }"
              :file-upload-loading="visible.fileUploadLoading"
              @setLoading="setLoading"
            />
            <help-upload-loading :visible="visible" />            
          </div>
        </div>
      </div>
      <div class="m-agree-box">
        <div class="input-title">
          <input
            type="checkbox"
            id="agree-check1"
            class="checkbox"
            v-model="option.agrees.type1"
          />
          <label for="agree-check1"><span>[필수] 개인정보 수집 및 이용 동의</span></label>
        </div>
        <div class="info">          
          <p>
          수집 및 이용 목적 : 문의 접수 및 문제 해결
          </p>
          <p>
          수집 및 이용 항목 : 휴대폰 번호, 로그인 계정, 문의 내용
          </p>
          <p>
          보유 기간 : 회원 탈퇴시까지
          </p>
          <p>동의 거부시 서비스 이용에 제한이 있을 수 있습니다.
          </p>
        </div>
      </div>
    </div>   
    <!--  #70648 header로 이동 <button
      class="m-btn-send"
      :class="{ dis: !isSubmit }"
      :disabled="!isSubmit"
      @click="doSubmit"
    >
      보내기
    </button>  -->

    <loading-overlay
      key="loading-overlay2"
      :active.sync="$store.state.isLoading"
      :can-cancel="false"
      :is-full-page="true"
      :color="'#4275df'"
      :backgroundColor="'rgba(90,90,90,0)'"
      :blur="'0px'"
      :opacity="0"
      :loader="'bars'"
    />
    <hi-modal :closeSkip='true' v-if='showInvlaidePhoneModal'>
      <template v-slot:content>
        <h1 style='font-size: 1.4em;'>유효하지 않은 휴대폰번호 형식입니다.<br>다시 한번 확인해주세요.</h1>
      </template>
      <template v-slot:footer>
        <p style='height: 80px;'>
          <hi-button @click="showInvlaidePhoneModal = false" size="md" style='width: 200px;'>확인</hi-button>
        </p>
      </template>
    </hi-modal>
    <hi-modal :closeSkip='true' v-if='showSuccessModal' size="xs">
      <template v-slot:content>
        <h1 style='font-size: 1.4em;'>작성하신 내용이 정상적으로<br>접수되었습니다.</h1>
      </template>
      <template v-slot:footer>
        <p style='height: 80px;'>
          <hi-button @click="onClickCloseSuccessModal" size="md" style='width: 200px;'>확인</hi-button>
        </p>
      </template>
    </hi-modal>
  </div>
</template>

<script>
// import HcMSelect from '../../../../components/Form/HcMSelect'
import HcInputPhone from '../../../../components/Form/HcInputPhone'
import MobileDetect from 'mobile-detect'
import {mapFields} from "vuex-map-fields";
import MobileUpload from "@/components/Upload/Mobile/MobileUpload";
import HelpUploadLoading from "@/components/Upload/Help/HelpUploadLoading";

export default {
  name: 'MobileHelpQuestionWrite',
  components: {
    HelpUploadLoading,
    MobileUpload,
    // HcMSelect,
    HcInputPhone,
    LoadingOverlay: () => import('vue-loading-overlay')
  },
  data() {
    return {
      visible: {
        fileUploadLoading: false
      },
      option: {
        agrees: {
          type1: false
        },
        notRequired: [
          'pcSpec',
          'browser',
          'deviceInfo',
          'modelName',
          'softwareVersion',
          'appVersion',
          'files'
        ]
      },
      codes: {
        chatCategorys: []
      },
      model: {
        user: `${process.env.VUE_APP_BASE_API_URI}/users/${this.$route.query.uuid}`,
        helpChatCategory: '',
        contentQuestion: '',
        phone: '',
        proceedStatus: '',
        files: [],

        deviceInfo: [
          this.$route.query.osName ? this.$route.query.osName.toUpperCase() : ''
        ],
        pcSpec: null,
        browser: null,
        modelName: this.$route.query.modelName,
        softwareVersion: this.$route.query.softwareVersion,
        appVersion: this.$route.query.appVersion
      },
      requestHeaders: null,
      showInvlaidePhoneModal: false,
      showSuccessModal: false
    }
  },
  computed: {
    ...mapFields({
      isLoading: 'isLoading'
    }),
    isSubmit() {
      let result = false
      result = Object.keys(this.model).every(search => {
        let returnBoolean = (this.model[search] || '').toString().trim() !== ''
        if (this.option.notRequired.includes(search)) {
          returnBoolean = true
        }
        return returnBoolean
      })

      if (result) {
        result = Object.keys(this.option.agrees).every(search => {
          return this.option.agrees[search] === true
        })
      }

      if (this.model.files.length > this.$store.state.upload.help.limit)
        result = false

      if (this.visible.fileUploadLoading)
        result = false

      if (this.$refs.mobileUpload && this.$refs.mobileUpload.isOverLimitFileSize)
        result = false

      return result
    }
  },
  mounted() {
    this.clearModel()
    this.getChatCategorys()
  },
  methods: {
    clearModel() {
      this.model.proceedStatus = this.$constants.CS_PROCCED_STATUS[0].code || null
      this.$hiClass.userMobile.readFromToken()
      .then(res => {
        this.model.phone = res.data.userMobile
      })
      this.model.helpChatCategory = ''
      this.model.contentQuestion = ''
      this.model.files = []
    },
    getChatCategorys() {
      this.$hiClass.helpChatCategories
        .search({
          _used: true,
          size: 100
        })
        .then(res => {
          (res.data._embedded.helpChatCategories || []).map(item => {
            item.helpChatCategory = item._links.self.href
            this.codes.chatCategorys.push(item)
          })
        })
        .catch(err => {
          this.$log.debug(
            this.$options.name,
            ' getChatCategorys() error => ',
            err
          )
        })
    },
    doSubmit() {
      if (!this.isLoading) {
        if (!this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.phone)) {
          alert(`유효하지 않은 휴대폰번호 형식입니다.\n다시 한번 확인해주세요.`)
          // this.showInvlaidePhoneModal = true
          return false
        }

        if (this.model.files.length > this.$store.state.upload.help.limit) {
          this.$hiClass.alert(`${this.$store.state.upload.help.limit}개 까지 첨부 가능합니다.`)
          return false
        }

        this.isLoading = true

        this.$hiClass.helpChats
          .create(this.model)
          .then(res => {
            if (res) {
              alert('작성하신 내용이 정상적으로\n접수되었습니다.')
              this.onClickCloseSuccessModal()
              // this.showSuccessModal = true
            }
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' doSubmit() error => ', err)
          })
          .finally(() => {
            this.isLoading = false
          })
      }
    },
    onClickCloseSuccessModal() {
      this.showSuccessModal = false
      this.$emit('is-result', false)
    },
    getUserAgentInfo() {
      let agent = navigator.userAgent.toLowerCase()
      let ai = {
        deviceInfo: [],
        pcSpec: null,
        browser: null
      }

      const md = new MobileDetect(agent)
      if (md.mobile()) {
        if (md.os() === 'AndroidOS') {
          ai.deviceInfo.push('ANDROID')
        } else if (md.os() === 'iOS') {
          ai.deviceInfo.push('IOS')
        }

        ai.browser = md.userAgent()
        ai.modelName = md.phone() || agent
        ai.softVersion = md.version('Webkit')
        ai.modelNo = null
        ai.appVersion = null
      } else {
        ai.deviceInfo.push('PC')

        if (/win/.test(agent)) {
          if (agent.indexOf('windows nt 6.1') >= 0) {
            ai.pcSpec = 'Windows 7'
          } else if (agent.indexOf('windows nt 6.2') >= 0) {
            ai.pcSpec = 'Windows 8'
          } else if (agent.indexOf('windows nt 6.3') >= 0) {
            ai.pcSpec = 'Windows 8.1'
          } else if (agent.indexOf('windows nt 10.0') >= 0) {
            ai.pcSpec = 'Windows 10'
          }
        } else if (/linux/.test(agent)) {
          ai.pcSpec = 'Linux'
        } else if (/unix/.test(agent)) {
          ai.pcSpec = 'Unix'
        } else if (/mac/.test(agent)) {
          ai.pcSpec = 'Mac'
        }

        if (agent.indexOf('opr') !== -1) {
          ai.browser = `Opera ${/opr\/(\S+)/.exec(agent)[1]}`
        } else if (agent.indexOf('edge') !== -1) {
          ai.browser = `Edge ${/edge\/(\S+)/.exec(agent)[1]}`
        } else if (agent.indexOf('chrome') !== -1) {
          ai.browser = `Chrome ${/chrome\/(\S+)/.exec(agent)[1]}`
        } else if (agent.indexOf('safari') !== -1) {
          ai.browser = `Safari ${/safari\/(\S+)/.exec(agent)[1]}`
        } else if (agent.indexOf('firefox') !== -1) {
          ai.browser = `Firefox ${/firefox\/(\S+)/.exec(agent)[1]}`
        } else if (agent.indexOf('trident') !== -1) {
          if (agent.indexOf('msie') !== -1) {
            ai.browser = `IE ${/msie (\S+)/.exec(agent)[1].replace(';', '')}`
          } else {
            ai.browser = `IE ${/rv:(\S+)/.exec(agent)[1].replace(')', '')}`
          }
        }

        if (!ai.pcSpec) {
          ai.pcSpec = agent
        }

        if (!ai.browser) {
          ai.browser = agent
        }
      }

      this.model.deviceInfo = ai.deviceInfo
      this.model.pcSpec = ai.pcSpec
      this.model.browser = ai.browser
    },
    setLoading(val) {
      this.visible.fileUploadLoading = val
    },

  }
}
</script>
<style lang="scss" scoped>
.question-wrap .question-inner .m-header {
  border-bottom: 1px solid #ececec;
}
.m-box-question{
  padding:24px 20px;
  .m-box-item{
    & + .m-box-item{margin-top: 32px;}
    .input-title{
      font-weight:700;
      font-size:14px;
      margin-bottom: 16px;
    }
    .hi-selectbox{
      ::v-deep {
        button.selected{min-height: 48px;}
        .option__layer{top:51px;}
      }
    }
    .input-box-wrap{
      ::v-deep input{min-height: 48px;}
      textarea{
        border: 0;
        width: 100%;
        height: 200px;
        color: #2e2e2e;
        font-size: 14px;
        line-height: 1.4;
        padding: 16px;
        ::placeholder {
          color: #BDBDBD;
        }
      }
    }
  }
}
textarea::placeholder {
  color: #888888 !important;
}
.loading-attach{
  padding: 20px 0 0 0px;
}
</style>
