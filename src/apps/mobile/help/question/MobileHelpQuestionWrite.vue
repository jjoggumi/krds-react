<template>
  <div class="m-wrap version-1">
    <div class="m-container">
      <div class="m-box-propose">
        <div class="m-email-box m-box-01">
          <div class="input-title">휴대폰 번호<span>*</span></div>
          <div class="m-input-email m-wid100">
            <hc-input-phone
              v-model="model.phone"
              placeholder="휴대폰 번호 (숫자만)"
            />
          </div>
        </div>
        <div class="m-email-box">
          <div class="input-title">문의 유형<span>*</span></div>
          <hc-m-select
            style="width:100%;!important"
            :model.sync="model.helpChatCategory"
            selectLabel="categoryTitle"
            selectValue="helpChatCategory"
            defaultLabel="선택"
            :item="codes.chatCategorys"
          />
          <div class="input-title mt-30">내용<span>*</span></div>
          <div class="m-textarea-box">
            <textarea
              class="noresize"
              maxlength="1500"
              placeholder="- 문의 내용과 함께 캡처 화면이나 녹화 파일을 첨부해주시면 보다 빠르게 도움을 드릴 수 있습니다."
              v-model="model.contentQuestion"
              v-on:input="model.contentQuestion = $event.target.value"
            ></textarea>
          </div>
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

        <div class="m-email-box">
          <div class="input-title">개인정보 수집동의<span>*</span></div>
          <div class="m-gray-box bor-all">
            <p>- 수집 항목 : 휴대폰 번호, 로그인 계정, 기기정보</p>
            <p>
              작성해 주시는 개인정보는 문의 접수 및 문제 해결을 위해 일정 기간
              보관됩니다.
            </p>
          </div>
        </div>
      </div>
      <div class="m-agree-box">
        <div class="m-check-wrap">
          <input
            type="checkbox"
            id="agree-check1"
            class="m-checkbox"
            v-model="option.agrees.type1"
          />
          <label for="agree-check1">
            <span>위 내용에 동의합니다.</span>
          </label>
        </div>
      </div>
    </div>
    <button
      class="m-btn-send"
      :class="{ dis: !isSubmit }"
      :disabled="!isSubmit"
      @click="doSubmit"
    >
      보내기
    </button>

    <!-- 모바일 로딩 백그라운드 투명 처리 -->
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
  </div>
</template>

<script>
import HcMSelect from '../../../../components/Form/HcMSelect'
import HcInputPhone from '../../../../components/Form/HcInputPhone'
import MobileDetect from 'mobile-detect'
import {mapFields} from "vuex-map-fields";
import MobileUpload from "@/components/Upload/Mobile/MobileUploadV1";
import HelpUploadLoading from "@/components/Upload/Help/HelpUploadLoading";

export default {
  name: 'MobileHelpQuestionWrite',
  components: {
    HelpUploadLoading,
    MobileUpload,
    HcMSelect,
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
        // modelNo: null,
        modelName: this.$route.query.modelName,
        softwareVersion: this.$route.query.softwareVersion,
        appVersion: this.$route.query.appVersion
      },
      requestHeaders: null
      // uuid: null,
      // idToken: null
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

      // 첨부파일 추가 개수 제한
      if (this.model.files.length > this.$store.state.upload.help.limit)
        result = false

      // 등록하기 버튼 비활성화: 파일 업로드 로딩 중
      if (this.visible.fileUploadLoading)
        result = false

      // 등록하기 버튼 비활성화: 첨부파일 용량이 제한을 초과하였을 때
      if (this.$refs.mobileUpload && this.$refs.mobileUpload.isOverLimitFileSize)
        result = false

      return result
    }
  },
  created() {
    this.model.proceedStatus = this.$constants.CS_PROCCED_STATUS[0].code || null
    this.$hiClass.userMobile.readFromToken()
      .then(res => {
        this.model.phone = res.data.userMobile
      })
  },
  mounted() {
    this.getChatCategorys()

    //var req = new XMLHttpRequest();
    //req.open("HEAD", document.location, false);
    //req.send(null);
    //this.requestHeaders = document.location + "\n" + req.getAllResponseHeaders();
    //this.model.deviceInfo = req.getResponseHeader("osName").toUpperCase();
    //this.model.modelName = req.getResponseHeader("modelName");
    //this.model.appVersion = req.getResponseHeader("appVersion");
    //this.model.softwareVersion = req.getResponseHeader("softwareVersion");
    // this.getUserAgentInfo()
  },
  methods: {
    getChatCategorys() {
      this.$hiClass.helpChatCategories
        .search({
          _used: true,
          size: 100
        })
        .then(res => {
          // eslint-disable-next-line
          ;(res.data._embedded.helpChatCategories || []).map(item => {
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
      // const user = this.$comn.split(this.model.user, '/')
      // if (this.uuid === null || this.idToken === null) {
      //   alert('uuid or idToken is null')
      //   return false
      // }
      // if (this.uuid !== user) {
      //   this.model.user = `${process.env.VUE_APP_BASE_API_URI}/users/${this.uuid}`
      // }
      if (!this.isLoading) {
        if (!this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.phone)) {
          this.$hiClass.alert('유효하지 않은 휴대폰번호 형식입니다.<span>다시 한번 확인해주세요.')
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
              this.$hiClass.alert('작성하신 내용이 정상적으로 접수되었습니다.')
                .then(() => {
                  this.$emit('is-result', false)
                })
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
    getUserAgentInfo() {
      let agent = navigator.userAgent.toLowerCase()
      let ai = {
        deviceInfo: [],
        pcSpec: null,
        browser: null
        // modelName: null,
        // softVersion: null,
        // modelNo: null,
        // appVersion: null,
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
      // this.model.modelName = ai.modelName
      // this.model.softVersion = ai.softVersion
      // this.model.modelNo = ai.modelNo
      // this.model.appVersion = ai.appVersion
    },
    setLoading(val) {
      this.visible.fileUploadLoading = val
    },

  }
}
</script>
<style scoped src="../../../../assets/css/m-customer.css"></style>

<style scoped>
  textarea::placeholder {
    color: #888888 !important;
  }
</style>
