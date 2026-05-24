<!--
@File(Method): MainBodyClazzesBodyInviteFreeSms.vue
@Author: -
@Date Created: -
@Description: 클래스 > 상단 영역 초대하기버튼  > 무료 문자로 초대장 보내기 모달
@Modified: 2024-12-26 - #69560 구성원 관리 태그 추가 - HiModal, Toast, HiButton, HiIcon, grid 디자인 시스템 적용, grid 반영하여 구조 변경, 등록 타입 선택 추가
-->
<template>
  <div>    
    <HiModal type="type01" size="lg" @close="closeLayer" class="free-send-sms-modal">
      <template v-slot:heading>무료 문자로 초대장 보내기</template>
      <template v-slot:content> 
        <div class="free-sns-wrap">
          <div class="reg-type hi-row sm-gutters">
            <div
                class="col-sm-6"
                v-for="button of [
                    { name: '일괄 등록', value: 'BATCH' },
                    { name: '개별 등록', value: 'SINGLE' }
                ]"
                :key="`button-${button.value}`"
            >
              <HiButton :color="regType === button.value ?'primary':'default'"
              outline class="w100" size="lg" bitrounded @click="changeRegType(button.value)">
                {{ button.name }}
              </HiButton>
            </div>
          </div>

          <!-- 일괄 등록 -->
          <template v-if="regType === 'BATCH'">
            <div class="reg-input reg-all">
              <div class="smr">양식을 다운로드하여 명단을 등록 후 파일을 업로드 해주세요.<br>
                학반(태그) 로 <span class="txt-primary">구성원을 그룹으로 묶거나 필터로 목록을 조회</span> 할 수 있습니다.<br>
                엑셀 정보 업로드 후 최종 ‘전송’ 버튼을 누르시면, 문자 발송과 동시에 <span class="txt-primary">구성원 정보가 업데이트</span>됩니다.
              </div>
              <div class="btns">
                <HiButton color="default" size="md" outline class="mr-10" @click="downloadSample">
                  <i class="icon-excel"></i>
                  EXCEL 양식 다운로드
                </HiButton>
                <input type="file" ref="attach" accept=".xls,.xlsx" @change="upload" style="display:none"/>
                <HiButton color="default" size="md" outline :disabled="isUploading" @click="upload(null)">
                  <HiIcon color="secondary" name="ico-file-upload" size="20" />
                  파일 업로드
                </HiButton>
              </div>
            </div>
            <div class="hp-list-wrap">
              <div class="tit">등록 확인 결과 ({{ sendTargets.length }})</div>
              <div class="table-wrap">
                <table class="hi-tbl type02">
                  <caption>등록 결과 확인</caption>
                  <colgroup>
                    <col style="width: 50px"/>
                    <col style="width: 107px"/>
                    <col style="width: 75px"/>
                    <col style="width: auto; min-width:80px;"/>
                    <col style="width: 140px"/>
                    <col style="width: 140px"/>
                    <col style="width: 140px"/>
                  </colgroup>
                  <thead>
                  <tr>
                    <th></th>
                    <th>학반(태그)
                      <HiTooltip
                          class="hi-tooltip-wrap info bottom txt-left"
                          :title-html="`학반(태그)로 구성원을 그룹으로 묶거나 필터로 목록을 조회할 수 있습니다.<br>(입력 예시: 1-1, 1-2... 햇님반 등)`"
                      />
                    </th>
                    <th>반번호 <span class="txt-warning">*</span></th>
                    <th>학생명 <span class="txt-warning">*</span></th>
                    <th>학부모 연락처1 <span class="txt-warning">*</span></th>
                    <th>학부모 연락처2</th>
                    <th>학생 연락처</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(target, idx) of sendTargets" :key="`target-${idx}`">
                    <td>
                      <HiButton color="link" @click="sendTargets.splice(idx, 1)" ><HiIcon name="ico-close2" size="18"/></HiButton>
                    </td>
                    <td
                        v-for="key of ['tagName', 'studentNo', 'studentName', 'mobile1', 'mobile2', 'mobile3']"
                        :key="`input-${key}-${idx}`"
                    >
                      <input
                          type="text"
                          v-model="target[key]"
                          :class="{'warning': target.errMsg[key]}"
                          @input="setErrorMsg(key, target[key], idx)"
                          @focus="inputEvent(key, idx, 'focus')"
                          @blur="inputEvent(key, idx, 'blur')"
                          :maxlength="getMaxLength(key)"
                      />
                      <div v-if="target.errMsg[key]" class="tooltip"><span v-html="target.errMsg[key]"></span></div>
                    </td>
                  </tr>
                  <tr v-if="sendTargets.length === 0">
                    <td colspan="7">
                      <div class="hi-nodata"><p>등록된 학생 명단이 없습니다. 명단을 추가해주세요.</p></div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <!-- 개별 등록 -->
          <template v-else>
            <div class="reg-input reg-single">
              <div class="smr">초대 문자를 보낼 휴대폰 번호를 입력 후 추가해주세요.</div>
              <div class="hi-row sm-gutters">
                <div class="input-box-wrap col-sm-4">
                  <input
                      type="text"
                      v-model="inputMobileVal"
                      maxlength="11"
                      placeholder="휴대폰 번호 (번호만)"
                      @keydown.enter.prevent.stop="addMobile"/>
                </div>
                <HiButton class="col-sm-1 ml-10" size="md" :disabled="!inputMobileVal" @click="addMobile">추가</HiButton>
              </div>
            </div>
            <div class="hp-list-wrap">
              <div class="tit">등록 확인 결과 ({{ sendTargets.length }})</div>
              <div class="table-wrap">
                <table class="hi-tbl type02">
                  <caption>등록 결과 확인</caption>
                  <colgroup>
                    <col style="width: 50px"/>
                    <col style="width: auto"/>
                  </colgroup>
                  <thead>
                  <tr>
                    <th></th>
                    <th>연락처<span class="txt-warning">*</span></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(target, idx) of sendTargets" :key="`input-mobile-${idx}`">
                    <td>
                      <HiButton color="link" @click="deleteMobile(idx)"><HiIcon name="ico-close2" size="18"/></HiButton>
                    </td>
                    <td v-for="key of ['mobile1']" :key="`input-${key}-${idx}`">
                      <input
                          type="text"
                          v-model="target[key]"
                          :class="{'warning': target.errMsg[key]}"
                          @input="setErrorMsg(key, target[key], idx)"
                          @focus="inputEvent(key, idx, 'focus')"
                          @blur="inputEvent(key, idx, 'blur')"
                          :maxlength="getMaxLength(key)"
                      />
                      <div v-if="target.errMsg[key]" class="tooltip"><span>{{ target.errMsg[key] }}</span></div>
                    </td>
                  </tr>
                  <tr v-if="sendTargets.length === 0">
                    <td colspan="2">
                      <div class="hi-nodata"><p>휴대폰번호를 입력해 주세요.</p></div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>

          <div class="loading-infinite-scroll-wrap pt-00" v-if="isUploading">
            <div class="icon"></div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <HiButton color="light-primary" outline size="lg" @click="closeLayer">
          취소
        </HiButton>
        <HiButton color="primary" size="lg" :class="{dis: !isSave}" :disabled="!isSave" @click="confirmModal = true">
          전송
        </HiButton>
      </template>
    </HiModal>

    <!-- 최종 확인 모달 -->
    <confirm-sms-invite
        v-if="confirmModal"
        :regType="regType"
        :sendTargets="sendTargets"
        :clazzes="clazzes"
        @close="closeConfirmModal"
    />
  </div>
</template>

<script>
import {mapState} from "vuex";
import XLSX from "xlsx";
import ConfirmSmsInvite from "@/apps/main/clazzes/invite/ConfirmSmsInvite";

export default {
  name: "mainBodyClazzesBodyInviteFreeSms",
  components: {
    ConfirmSmsInvite
  },
  props: {
    clazzes: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      sendTargets: [],
      maxLength: {
        'tagName': 10,
        'studentNo': 2,
        'studentName': 20,
        'mobile': 13
      },
      inputMobileVal: '',
      isUploading: false,
      regType: 'BATCH',
      confirmModal: false,
      isFocusMobile: false
    }
  },
  computed: {
    ...mapState({
      currentTimestamp: 'currentTimestamp'
    }),
    isSave() {
      let isAllPass = true
      if (this.sendTargets.length > 0) {
        isAllPass = this.sendTargets
            .flatMap(target => Object.values(target.errMsg))
            .every(errMsg => errMsg === null)
      }

      return !this.isUploading && isAllPass && this.sendTargets.length > 0
    }
  },
  mounted() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  destroyed() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  },
  methods: {
    changeRegType(regType) {
      if (this.sendTargets.length > 0) {
        this.$hiClass.confirm('등록 방식 변경 시, 등록한 연락처는 삭제됩니다.<br>변경하시겠습니까?')
            .then(() => {
              this.sendTargets = []
              this.regType = regType
            })
            .catch(() => {})
      } else {
        this.regType = regType
      }
    },
    downloadSample() {
      const samplePath = `https://download.hiclass.net/static/document/class-invite-card_sample.xlsx?ver=${this.currentTimestamp}`
      this.$comn.download(samplePath, '무료 문자 연락처 일괄 등록 양식.xlsx')
    },
    async upload(e) {
      if (e === null) {
        this.$refs.attach.click()
        return
      }

      const file = (e.target.files || e.dataTransfer.files)[0]
      if (file) {
        this.$refs.attach.value = ''

        let fileExt = file.name.split('.').pop()
        if (!['xls', 'xlsx'].includes(fileExt)) {
          this.$hiClass.alert('해당 파일 확장자는 업로드 불가능합니다.<br>지원하는 파일 형식: xls, xlsx', 'error')
          return
        }

        try {
          this.isUploading = true
          await this.readExcel(file)
        } finally {
          this.isUploading = false
        }
      }
    },
    async readExcel(file) {
      let reader = new FileReader()
      let vueInstance = this

      reader.onload = function () {
        let data = reader.result
        let workBook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workBook.SheetNames[0]
        const sheet = workBook.Sheets[firstSheetName]
        const rows = XLSX.utils.sheet_to_json(sheet)

        vueInstance.sendTargets = rows.map(item => {
          const obj = {
            tagName: null,
            studentNo: null,
            studentName: null,
            mobile1: null,
            mobile2: null,
            mobile3: null,
            errMsg: {
              tagName: '학반(태그)을 입력해주세요.',
              studentNo: '번호를 입력해주세요.',
              studentName: '학생명을 입력해주세요.',
              mobile1: '숫자 10~11자리를 입력해주세요.',
              mobile2: null,
              mobile3: null
            }
          }
          for (const [key, value] of Object.entries(item)) {
            let trimmedValue = value.toString().replaceAll(' ', '').trim()
            if (key === '학반(태그)*') {
              obj.tagName = trimmedValue.substring(0,10)
            } else if(key === '번호*') {
              obj.studentNo = trimmedValue.replace(/^0+/, '').substring(0,2)
            } else if(key === '학생명*') {
              obj.studentName = trimmedValue.substring(0,20)
            } else if (key === '학부모 연락처1*') {
              obj.mobile1 = vueInstance.formatMobile(trimmedValue.replaceAll('-', '').substring(0,11))
            } else if (key === '학부모 연락처2') {
              obj.mobile2 = vueInstance.formatMobile(trimmedValue.replaceAll('-', '').substring(0,11))
            } else if (key === '학생 연락처') {
              obj.mobile3 = vueInstance.formatMobile(trimmedValue.replaceAll('-', '').substring(0,11))
            }
          }

          return obj
        })

        vueInstance.sendTargets.forEach((target, idx) => {
          for (const [key, value] of Object.entries(target)) {
            if (key === 'errMsg') continue
            vueInstance.setErrorMsg(key, value, idx)
          }
        })
      }
      reader.readAsBinaryString(file)
    },
    inputEvent(key, idx, event) {
      if (key.toLowerCase().includes('mobile')) {
        this.maxLength.mobile = event === 'focus' ? 11 : 13
        this.isFocusMobile = event === 'focus'

        if (this.sendTargets[idx][key]) {
          this.sendTargets[idx][key] = event === 'focus' ?
              this.sendTargets[idx][key].replaceAll('-', '') :
              this.formatMobile(this.sendTargets[idx][key])

          this.setErrorMsg(key, this.sendTargets[idx][key], idx)
        }
      } else if (key === 'studentNo' && event === 'blur') {
        this.sendTargets[idx][key] = this.sendTargets[idx][key].replace(/^0+/, '')
        this.setErrorMsg(key, this.sendTargets[idx][key], idx)
      }
    },
    addMobile() {
      const mobile1 = this.formatMobile(this.inputMobileVal)
      this.sendTargets.push({
        mobile1,
        errMsg: { mobile1: this.getMobileErrorMsg(mobile1, true) }
      })
      this.inputMobileVal = ''
    },
    deleteMobile(idx) {
      this.sendTargets.splice(idx, 1)
    },
    formatMobile(mobile) {
      mobile = mobile.replace(/[^0-9]/g, '')
      const length = mobile.length
      const regEx = length === 11 ? /^(\d{0,3})(\d{0,4})(\d{0,4})$/g : /^(\d{0,3})(\d{0,3})(\d{0,4})$/g

      return mobile.replace(regEx, (_, m1, m2, m3) => {
        return !m2 ? m1 : (!m3 ? `${m1}-${m2}` : `${m1}-${m2}-${m3}`)
      })
    },
    getMaxLength(key) {
      if (key.toLowerCase().includes('mobile')) key = 'mobile'
      return this.maxLength[key]
    },
    setErrorMsg(key, value, idx) {
      this.sendTargets[idx].errMsg[key] = {
        'tagName': () => this.getTagNameErrorMsg(value),
        'studentNo': () => this.getStudentNoErrorMsg(value),
        'studentName': () => this.getStudentNameErrorMsg(value),
        'mobile1': () => this.getMobileErrorMsg(value, true),
        'mobile2': () => this.getMobileErrorMsg(value, false),
        'mobile3': () => this.getMobileErrorMsg(value, false)
      }[key]()
    },
    getTagNameErrorMsg(tagName) {
      let errorMsg = null
      const regEx = /^[0-9a-zA-Z가-힣\-_/&,.()]+$/

      if (!tagName) {
        errorMsg = '학반(태그)을 입력해주세요.'
      } else if (!regEx.test(tagName)) {
        errorMsg = '한글, 영문, 숫자,<br>특수문자 - _ / & , .() 만 가능합니다.'
      }

      return errorMsg
    },
    getStudentNoErrorMsg(studentNo) {
      let errorMsg = null
      const regEx = /^[0-9]+$/

      if (!studentNo) {
        errorMsg = '번호를 입력해주세요.'
      } else if (!regEx.test(studentNo)) {
        errorMsg = '숫자만 입력 가능합니다.'
      }

      return errorMsg
    },
    getStudentNameErrorMsg(studentName) {
      let errorMsg = null
      const validRegEx = /^[0-9a-zA-Z가-힣]+$/

      if (!studentName) {
        errorMsg = '학생명을 입력해주세요.'
      } else if (!validRegEx.test(studentName)) {
        errorMsg = '이름은 완성형 한글, 영문 대/소문자 20자 이내로 입력해주세요.'
      }

      return errorMsg
    },
    getMobileErrorMsg(mobile, isRequired) {
      let errorMsg = null

      if (mobile && !this.isFocusMobile) {
        mobile = mobile.replaceAll('-', '')
      }

      const lengthRegEx = /\d{3}\d{3,4}\d{4}/
      const numberRegEx = /^\d+$/

      if (mobile && !numberRegEx.test(mobile)) {
        errorMsg = '숫자만 입력 가능합니다.'
      } else if ((!mobile && isRequired) || (mobile && !lengthRegEx.test(mobile))) {
        errorMsg = '숫자 10~11자리를 입력해주세요.'
      } else if (mobile) {
        const validRegEx = /^01[0|1|6-9]/
        if (!validRegEx.test(mobile)) {
          errorMsg = '잘못된 연락처 형식입니다.'
        }
      }

      return errorMsg
    },
    closeLayer() {
      this.$emit('is-close', 'freeSendSms')
    },
    closeConfirmModal(isDone) {
      this.confirmModal = false
      if (isDone) this.closeLayer()
    }
  }
};
</script>

<style scoped lang="scss">
.free-send-sms-modal{
  ::v-deep .modal__layer{
    max-width:850px;
  }
}
.free-sns-wrap {
  text-align: left;
  height: 641px;
  overflow-y: auto;
  overflow-x: hidden;
  .reg-type{
    margin-top:10px;
    .btn-line-primary{
      background: rgba(71, 120, 222, 0.08);


    } 
  }  


  .reg-input{
    margin-top:16px;
    padding:25px;
    background: rgba(217, 217, 217, 0.122);

    .smr{    
      font-size: 15px;
      color: #222;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .btns button{width:190px;}
  }   
  
  .hp-list-wrap {
    margin: 36px 0 0 0;
    .tit{
      font-size:18px;
      margin-bottom: 12px;
    }
    .table-wrap{
      height: 312px;
      overflow: auto;
      table{
        border-collapse: separate;
        border-spacing: 0;
        thead{
          position: sticky;
          top: 0px;
          overflow: auto;
          z-index: 1;
        }
        tbody tr td{
          padding: 0;
          position: relative;          
          border-left: 1px solid #ececec;
          &:first-child{
            border-left: 0;
          }
          input{
            width: 100%;
            height: 53px;
            padding: 0 10px;
            border: 1px solid transparent;
            font-size: 15px;
            line-height: 38px;
            color: #222;
            background-color: #fff;             
            text-align: center;   
          }   
          input:hover{
            border: 1px solid var(--primary);
          }
          input:focus{
            border: 1px solid var(--primary);
            background: rgba(71, 120, 222, 0.16);
          }
          input.warning{
            border: 1px solid #EC1F2D;
            background: rgba(236, 31, 45, 0.10);
          }           
          .tooltip{
            padding: 8px 10px;
            border-radius: 5px;
            z-index: 2;
            left: 50%;
            -webkit-transform: translateX(-50%);
            transform: translateX(-50%);
            bottom: 100%;
            margin-bottom: 2px;
            span{font-size:12px;}
            &::before{
              left: 50%;
              margin-left: -6px;
            }
          }
          input.warning:hover + .tooltip{
            display: block;
          }  
        }  
      }
    }
    .hi-nodata{
      padding:118px 0;
      p{font-size:15px;}
    }
    .hi-tooltip-wrap{
      ::v-deep .hi-tooltip span{
        font-size:13px;
      }
      &::before{  
        background:#868E96;
        mask-image: url(~@/assets/img/svg/ico-warning-circle-fill.svg);
      }
    }
  }   
}
</style>