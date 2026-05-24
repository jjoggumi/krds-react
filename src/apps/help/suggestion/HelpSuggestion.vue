<template>
  <div class="right-cont-wrap">
    <div class="contetns-title-wrap">
      <div class="title">{{ $t('help.suggestion.title') }}</div>
    </div>
    <div class="customer-question-cont-wrap">
      <div class="customer-input-feild-wrap boundary-box">
        <div class="required-input-text">* 필수 입력 사항</div>
        <div class="input-feild-wrap">
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
              <textarea
                v-model="model.content"
                maxlength="1500"
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
              <a href="javascript:void(0)" @click="openTermsView({ layerType:'collectionPersonalInfo' })">개인정보 수집 및 이용 동의</a>
              <span class="must-check">*</span>
            </strong>
            <p>              
              수집 및 이용 목적 : 서비스 제안 접수 및 응대
            </p>
            <p>              
              수집 및 이용 항목 : 휴대폰 번호, 로그인 계정, 제안 내용
            </p>
            <p>              
              보유 기간 : 회원 탈퇴시까지
            </p>
            <p>              
              동의 거부시 서비스 이용에 제한이 있을 수 있습니다
            </p>
            <strong  class="mt-20">
              유의사항
              <span class="must-check">*</span>
            </strong>
            <p>하이클래스는 제안 사항에 관한 검토 진행 상황이나 결과에 대해 별도의 회신을 드리지 않습니다. 제안자가 자신이 제안한 사항의 폐기를 원하는 경우, 제안자는 이를 하이클래스에 요청 할 수 있으며 하이클래스는 요청 접수 후 즉시 폐기합니다.</p>
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

import {mapActions} from "vuex";
import {mapFields} from "vuex-map-fields";

export default {
  name: 'helpSuggestion',
  components: {
    HcInputPhone,
    HcHelpUpload,
    HcHelpUploadLoading
  },
  props: {
    isLogin: Boolean
  },
  data: () => ({
    option: {
      agrees: {
        type1: false
      },
      notRequired: ['files']
    },
    model: {
      title: '',
      content: '',
      phone: '',
      proceedStatus: 'UNTREATED',
      files: []
    },
    visible: {
      fileUploadLoading: false
    },
    userMobileResource: {}
  }),
  created() {
    if (!this.isLogin) {
      this.$hiClass.alert('권한이 없습니다.')
        .then(() => this.$router.push('/', () => {}))
    }
    this.$hiClass.userMobile.readFromToken()
      .then(res => {
        this.userMobileResource = res.data
        this.model.phone = this.userMobileResource.userMobile
      })
  },
  mounted() {},
  computed: {
    ...mapFields({
      isDimLoading: 'isDimLoading',
    }),
    isSubmit() {
      let result = false
      result = Object.keys(this.model)
        .filter(item => {
          return !this.option.notRequired.includes(item)
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
  methods: {
    ...mapActions({
      openTermsView: "openTermsView"
    }),
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
        this.$hiClass.helpSuggests
          .create(this.model)
          .then(res => {
            if (res) {
              this.$hiClass.alert('서비스 제안 등록이 완료되었습니다.')
                .then(() => {
                  this.model = {
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
      if (this.model.title !== '') {
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
    }
  }
}
</script>
