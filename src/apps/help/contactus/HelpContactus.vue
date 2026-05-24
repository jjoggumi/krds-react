<template>
  <div class="right-cont-wrap">
    <div class="contetns-title-wrap">
      <div class="title">{{ $t('help.contactus.title') }}</div>
      <HiButton v-if="isCurUserTypeParents" size="md" @click="handleAdGuideClick">
        하이클래스 광고상품소개서
        <HiIcon name="ico-external-link" size="16" color="white" style="margin-left: 4px;"/>
      </HiButton>
    </div>
    <div class="customer-question-cont-wrap">
      <div class="customer-input-feild-wrap boundary-box">
        <div class="required-input-text">* 필수 입력 사항</div>
        <div class="input-feild-wrap">
          <div class="input-cont input-title">
            <div class="input-title">
              이름(업체명)
              <span>*</span>
            </div>
            <div class="input-box-wrap">
              <input
                type="text"
                v-model="model.name"
                maxlength="100"
                @keydown.enter.prevent.stop
              />
            </div>
          </div>

          <div class="input-cont input-title">
            <div class="input-title">
              회사메일주소
              <span>*</span>
            </div>
            <div class="input-box-wrap">
              <input
                type="text"
                v-model="model.email"
                maxlength="50"
                @keydown.enter.prevent.stop
              />
            </div>
          </div>

          <div class="input-cont input-title">
            <div class="input-title">
              제목
              <span>*</span>
            </div>
            <div class="input-box-wrap">
              <input
                type="text"
                v-model="model.title"
                maxlength="50"
                @keydown.enter.prevent.stop
              />
            </div>
          </div>
          <div class="input-cont input-contents type2">
            <div class="input-title">
              내용
              <span>*</span>
            </div>
            <div class="input-box-wrap">
              <textarea v-model="model.content" maxlength="1500"></textarea>
            </div>
          </div>
          <div class="input-cont input-phone">
            <div class="input-title">
              회사연락처
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
            title="제안서 첨부"
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
              <a href="javascript:void(0)" @click="openTermsView({ layerType: 'collectionPersonalInfo' })">개인정보 수집 및 이용 동의</a>
              <span class="must-check">*</span>
            </strong>
            <p>
              수집 및 이용 목적 : 광고 문의 접수 및 응대
            </p>
            <p>
              수집 및 이용 항목 : 이름, 이메일 주소, 휴대폰 번호, 로그인 계정, 제안 내용
            </p>
            <p>
              보유 기간 : 작성일로부터 3년까지 
            </p>
            <p>
              동의 거부시 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </div>
          <div class="check-wrap">
            <input type="checkbox" id="agree-check1" v-model="option.agrees.type1" />
            <label for="agree-check1"><span>상기 내용을 확인하였으며, 이에 동의합니다.</span><span class="must-check">*</span></label>
          </div>
        </div>
        <div class="btn-wrap">
          <button class="btn-bg-w2" @click="cancel">취소</button>
          <button
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

  </div>
</template>

<script>
import HcInputPhone from '@/components/Form/HcInputPhone.vue'
import HcHelpUpload from '@/components/Upload/Help/HelpUpload.vue'
import HcHelpUploadLoading from '@/components/Upload/Help/HelpUploadLoading.vue'

import {mapActions, mapGetters} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'HelpContactus',
  components: {
    HcInputPhone,
    HcHelpUpload,
    HcHelpUploadLoading
  },
  data: () => ({
    option: {
      agrees: {
        type1: false
      },
      notRequired: ['files']
    },
    model: {
      name: '',
      email: '',
      title: '',
      content: '',
      phone: '',
      proceedStatus: 'UNTREATED',
      files: []
    },
    visible: {
      fileUploadLoading: false
    },
    userMobileResource: {
      userMobile: ''
    }
  }),
  created() {
    if (this.isLogin) {
      this.$hiClass.userMobile.readFromToken()
        .then(res => {
          this.userMobileResource = res.data
          this.model.phone = this.userMobileResource.userMobile
        })
    }
  },
  mounted() {},
  computed: {
    ...mapFields({
      isDimLoading: 'isDimLoading',
    }),
    ...mapGetters(['isCurUserTypeParents']),
    isSubmit() {
      let result = false
      result = Object.keys(this.model)
        .filter(item => {
          return !this.option.notRequired.includes(item)
        })
        .every(search => {
          return (this.model[search] || '').toString().trim() !== ''
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
    },
    isLogin() {
      return this.$store.state.user.currentId !== undefined
    }
  },
  methods: {
    ...mapActions({
      openTermsView: "openTermsView"
    }),
    doSubmit() {
      if (!this.$validation.isRegMobilePhoneNumberWithoutHyphen(this.model.phone)) {
        this.$hiClass.alert('유효하지 않은 휴대폰번호 형식입니다.\n다시 한번 확인해주세요.')
        return false
      }

      if (!this.isDimLoading) {
        this.isDimLoading = true
        this.$hiClass.helpAdContacts
          .create(this.model)
          .then(res => {
            if (res) {
              this.$hiClass.alert('광고 및 제휴 문의 등록이 완료되었습니다.<br><br>확인 후 회신 드릴 예정이오니<br>기다려주시면 감사하겠습니다.', 'success')
                .then(() => {
                  this.model = {
                    name: '',
                    email: '',
                    title: '',
                    content: '',
                    phone: this.userMobileResource.userMobile,
                    proceedStatus: 'UNTREATED',
                    files: []
                  }
                  this.option.agrees.type1 = false
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
      if (this.model.name !== '') {
        isEdit = true
      } else if (this.model.email !== '') {
        isEdit = true
      } else if (this.model.title !== '') {
        isEdit = true
      } else if (this.model.content !== '') {
        isEdit = true
      } else if (this.model.phone !== this.userMobileResource.userMobile) {
        isEdit = true
      } else if (this.model.files.length > 0) {
        isEdit = true
      }

      if (isEdit) {
        this.$hiClass.confirm('입력한 내용이 모두 삭제됩니다. 취소하시겠습니까?', 'warning')
          .then(() => {
            this.model = {
              name: '',
              email: '',
              title: '',
              content: '',
              phone: this.userMobileResource.userMobile,
              proceedStatus: 'UNTREATED',
              files: []
            }
          })
      }
    },
    setLoading(val) {
      this.visible.fileUploadLoading = val
    },
    handleAdGuideClick() {
      window.open('https://drive.google.com/file/d/1IHEQd5S_7QjSWC1b60fFT6tsfTnjTGPf/view', '_blank')
    }
  }
}
</script>
