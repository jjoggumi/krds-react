<template>
  <div class="customer-question-cont-wrap">
    <div class="customer-input-feild-wrap boundary-box">
      <div class="required-input-text">* 필수 입력 사항</div>
      <div class="input-feild-wrap">
        <div class="input-cont input-category">
          <div class="input-title">
            문의 유형
            <span>*</span>
          </div>
          <hc-select
            :model.sync="model.helpChatCategory"
            selectLabel="categoryTitle"
            selectValue="helpChatCategory"
            defaultLabel="선택"
            :isFocusMode="false"
            :item="codes.chatCategorys"
          />
        </div>
        <div class="input-cont input-contents">
          <div class="input-title">
            문의 내용
            <span>*</span>
          </div>
          <div class="input-box-wrap">
            <textarea
              placeholder="- 문의 내용과 함께 캡처 화면이나 녹화 파일을 첨부해주시면 보다 빠르게 도움을 드릴 수 있습니다."
              maxlength="1500"
              v-model="model.contentQuestion"
            ></textarea>
          </div>
        </div>
        <div class="input-cont input-phone">
          <div class="input-title">
            휴대폰 번호
            <span>*</span>
          </div>
          <div class="input-box-wrap">
            <hc-input-phone
              v-model="model.phone"
              placeholder="숫자만 입력해 주세요."
            />
          </div>
        </div>
        <hc-help-upload
          ref="helpUpload"
          :files.sync="model.files"
          :param="{
            size: $store.state.upload.help.size,
            limit: $store.state.upload.help.limit
          }"
          @setLoading="setLoading"
        />
        <hc-help-upload-loading :visible="visible" />
      </div>
      <div class="check-list-wrap">
        <div class="gray-box">
          <strong>
            <a href="javascript:void(0)" @click="openTermsView({ layerType:'collectionPersonalInfo' })"
              >개인정보 수집 및 이용 동의</a>
            <span class="must-check">*</span>
          </strong>
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
        <div class="check-wrap">
          <input
            type="checkbox"
            id="agree-check1"
            v-model="option.agrees.type1"
          />
          <label for="agree-check1"
            ><span>상기 내용을 확인하였으며, 이에 동의합니다.</span
            ><span class="must-check">*</span></label
          >
        </div>
      </div>
      <div class="btn-wrap">
        <button class="btn-bg-w2" @click="cancel">취소</button>
        <button
          type="button"
          class="btn-bg-c"
          :class="{ dis: !isSubmit }"
          :disabled="!isSubmit"
          @click="doSubmit"
        >
          등록하기
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import MobileDetect from 'mobile-detect'

import HcSelect from '@/components/Form/HcSelect.vue'
import HcInputPhone from '@/components/Form/HcInputPhone.vue'
import HcHelpUpload from '@/components/Upload/Help/HelpUpload.vue'
import HcHelpUploadLoading from '@/components/Upload/Help/HelpUploadLoading.vue'

import {mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'HelpQuestionWrite',
  components: {
    HcSelect,
    HcInputPhone,
    HcHelpUpload,
    HcHelpUploadLoading
  },
  data: () => ({
    option: {
      agrees: {
        type1: false
      },
      notRequired: [
        'files',
        'modelName',
        'softVersion',
        'modelNo',
        'appVersion'
      ],
      notRequiredMobile: ['files', 'pcSpec', 'modelNo', 'appVersion']
    },
    codes: {
      chatCategorys: []
    },
    model: {
      helpChatCategory: '',
      contentQuestion: '',
      phone: '',
      proceedStatus: '',
      files: [],

      deviceInfo: [],
      pcSpec: null,
      browser: null,
      modelName: null,
      softVersion: null,
      modelNo: null,
      appVersion: null
    },
    visible: {
      fileUploadLoading: false
    },
    userMobileResource: {}
  }),
  props: {
    queryCategoryName: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapFields({
      isDimLoading: 'isDimLoading',
    }),
    isSubmit() {
      let result = false
      result = Object.keys(this.model)
        .filter(item => {
          if (this.model.pcSpec !== null)
            return !this.option.notRequired.includes(item)
          else return !this.option.notRequiredMobile.includes(item)
        })
        .every(search => {
          return (this.model[search] || '').toString().trim() != ''
        })

      if (result) {
        result = Object.keys(this.option.agrees).every(search => {
          return this.option.agrees[search] === true
        })
      }

      // 등록하기 버튼 비활성화: 파일 업로드 로딩 중
      if (this.visible.fileUploadLoading)
        result = false

      // 등록하기 버튼 비활성화: 첨부파일 용량이 제한을 초과하였을 때
      if (this.$refs.helpUpload && this.$refs.helpUpload.isOverLimitFileSize)
        result = false

      return result
    }
  },
  created() {
    this.model.proceedStatus = this.$constants.CS_PROCCED_STATUS[0].code || null
    this.$hiClass.userMobile.readFromToken()
      .then(res => {
        this.userMobileResource = res.data
        this.model.phone = this.userMobileResource.userMobile
      })
  },
  async mounted() {
    this.getUserAgentInfo()
    await this.getChatCategorys()
    if (this.queryCategoryName.trim() !== '') {
      this.model.helpChatCategory = (this.codes.chatCategorys.find(c => c.categoryTitle === this.queryCategoryName) || {}).helpChatCategory || ''
      this.$emit('setQueryCategoryName', '')
    }
  },
  methods: {
    ...mapActions({
      openTermsView: "openTermsView"
    }),
    async getChatCategorys() {
      try {
        const res = await this.$hiClass.helpChatCategories.search({
          _used: true,
          size: 100
        });

        (res.data._embedded.helpChatCategories || []).map(item => {
          item.helpChatCategory = item._links.self.href
          this.codes.chatCategorys.push(item)
        })
      } catch (err) {
        this.$log.debug(this.$options.name, ' getChatCategorys() error => ', err)
      }
    },
    doSubmit() {
      // 로그인 체크 추가
      if (!this.$authentication.isAuthenticated()) {
        this.$hiClass.alert('권한이 없습니다.')
          .then(() => this.$router.push('/', () => {}))
        return false
      }

      if (!this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.phone)) {
        this.$hiClass.alert('유효하지 않은 휴대폰번호 형식입니다.\n다시 한번 확인해주세요.')
        return false
      }

      if (!this.isDimLoading) {
        this.isDimLoading = true
        this.$hiClass.helpChats
          .create(this.model)
          .then(res => {
            if (res) {
              this.$hiClass.alert('작성하신 내용이 정상적으로 접수되었습니다.', 'success')
                .then(() => {
                  this.$emit('is-result', false)
                })
            }
          })
          .catch(err => {
            this.$log.debug(this.$options.name, ' doSubmit() error => ', err)
          })
          .finally(() => {
            this.isDimLoading = false
          })
      }
    },
    cancel() {
      let isEdit = false
      if (this.model.helpChatCategory !== '') {
        isEdit = true
      } else if (this.model.contentQuestion !== '') {
        isEdit = true
      } else if (this.model.phone !== this.userMobileResource.userMobile) {
        isEdit = true
      } else if (this.model.files.length > 0) {
        isEdit = true
      }

      if (isEdit) {
        this.$hiClass.confirm('입력한 내용이 모두 삭제됩니다. 취소하시겠습니까?', 'warning')
          .then(() => this.$emit('is-Write', false))

      } else {
        this.$emit('is-Write', false)
      }
    },
    setLoading(val) {
      this.visible.fileUploadLoading = val
    },
    getUserAgentInfo() {
      let agent = navigator.userAgent.toLowerCase()
      let ai = {
        deviceInfo: [],
        pcSpec: null,
        browser: null,
        modelName: null,
        softVersion: null,
        modelNo: null,
        appVersion: null
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
      this.model.modelName = ai.modelName
      this.model.softVersion = ai.softVersion
      this.model.modelNo = ai.modelNo
      this.model.appVersion = ai.appVersion
    }
  }
}
</script>

<style scoped>
  textarea::placeholder {
    color: #888888 !important;
    font-size: 14px !important;
  }
</style>