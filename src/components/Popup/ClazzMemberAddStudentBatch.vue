<!--
@File(Method): ClazzMemberAddStudentBatch.vue
@Description: 클래스 임시 학생 일괄 생성 모달
@Modified: 2025-02-27 - #72655 임시학생 일괄 생성 시 기본 이미지로 프로필 설정
-->
<template>
  <fragment>
    <modal-layout
        ref="modalLayout"
        :modal-name="'clazz-member-add-student-batch'"
        :key="componentKey"
        :class-list="{
          modal: ['common-modal', 'register-temp-student-modal'],
          modalContWrap: [],
          modalCont: ['boundary-box'],
        }"
        @modal-close="close"
    >
      <template v-slot:modalContInner>
        <div class="modal-cont-inner">
          <div class="modal-title-wrap">
            <div class="title">임시 학생 계정 일괄 생성하기</div>
          </div>
          <div :class="['content-wrap', { compact: availableResources.length === 0 }]">
            <!-- <p class="text">· 임시 학생 계정을 일괄 생성하시면 <span>기존 학생 구성원 명단에 추가로 등록</span>됩니다.</p>
            <p class="text ft-blue">※ 다른 사람이 유추할 수 없는 아이디와 비밀번호를 사용해 주세요. <br>(반 번호/휴대폰번호/생일 등을 조합한 비밀번호(O), 동일하거나 규칙적인 비밀번호(X))</p> -->
            <div class="gray-box">
              <div class="box-header">
                <strong class="heading-step">임시 학생 계정 일괄 생성 안내</strong>
                <HiButton color="link" class="btn-guide" @click="isOpenGuide = true">
                  <HiIcon name="ico-warning-circle" color="primary" size="16"/>임시 학생 계정 일괄 등록 가이드
                </HiButton>
              </div>
              <ul class="consent-note-list">
                <li>학생 등록은 직접 입력 또는 엑셀 양식 업로드 방식으로 진행할 수 있습니다.</li>
                <li>엑셀 양식을 다운로드한 후 작성 규칙에 맞게 입력하여 업로드하면, 유효성 검증 결과에 따라 학생 명단이 등록됩니다.</li>
                <li>양식 업로드 후에도 목록에서 학생 정보 직접 수정 및 개별 학생 추가 등록이 가능합니다.</li>
                <li>단, 파일 업로드 시 기존 입력 데이터는 모두 초기화되며, 학생이 등록된 상태에서는 추가 파일 업로드가 불가합니다.</li>
                <li>한 번에 등록 가능한 학생 수는 최대 99명입니다. 명단의 학생 수가 99명 이하인지 확인 후 등록해 주세요.</li>
                <li>파일 업로드 후, 임시 계정 생성에 대한 보호자(법정대리인) 동의 여부를 체크해야 명단 저장이 가능합니다.</li>
              </ul>
              <div class="group-btn">
                <HiButton @click="downloadSample" size="md" color="default" outline>
                  <i class="icon-excel"></i>EXCEL 양식 다운로드
                </HiButton>
                <HiButton @click="fileUpload" size="md" color="default" outline>
                  <HiIcon name="ico-file-upload" color="primary" size="20"/>파일 업로드
                </HiButton>
                <input hidden type="file" ref="attach" accept=".xls,.xlsx" @change="upload" />
                
              </div>
              <!-- <div class="box-step-sub">
                <p class="text">· 리스트에서 직접 등록합니다.</p>
                <div class="group-btn">
                  <button class="btn-bg-c" @click="doEditMode">직접 입력하기</button>
                </div>
              </div>
              </div> -->
            </div>
            <div class="box-step">
              <div class="student-list-header-wrap">
                <div class="student-list-header">
                  <span class="student-list-title">학생 명단</span>
                  <div class="count">(총 <span>{{ availableResources.length }}</span>건)</div>
                </div>
                <div class="student-list-actions">
                  <HiButton color="primary" size="sm" outline @click="addRow">
                    행추가
                  </HiButton>
                  <HiButton color="warning" size="sm" outline @click="doReset">
                    초기화
                  </HiButton>
                  <!-- <HiButton color="warning" size="sm" outline v-if="availableResources.length > 0" @click="doReset">
                    초기화
                  </HiButton> -->
                </div>
              </div>
              <table class="tbl-excel">
                <caption>임시 학생 일괄 등록</caption>
                <colgroup>
                  <col style="width:50px;">
                  <col style="width:150px;">
                  <col style="width:100px;">
                  <col style="width:200px;">
                  <col style="width:144px;">
                  <col style="width:144px;">
                </colgroup>
                <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col"><span class="required">학반(태그)</span></th>
                  <th scope="col"><span class="required">반 번호</span></th>
                  <th scope="col"><span class="required">학생 이름</span></th>
                  <th scope="col"><span class="required">아이디</span></th>
                  <th scope="col"><span class="required">비밀번호</span>
                    <button
                        class="btn-toggle"
                        :class="{
                        'is-revealed': !flag.showPassword,
                        'is-hidden' : flag.showPassword
                      }"
                        @click="flag.showPassword = !flag.showPassword"
                    ></button> <!-- is-revealed / is-hidden -->
                  </th>
                </tr>
                </thead>

                <tbody v-if="availableResources.length > 0">
                <template v-for="(resource, index) of availableResources">
                  <tr :key="index">
                    <td>
                      <button
                          class="btn-delete"
                          @click="deleteResource(index)"
                      >
                        삭제
                      </button>
                    </td>
                    <td v-for="(field, idx) in ['tagName', 'number', 'name', 'loginId', 'loginPassword']" :key="`student-${idx}`">
                      <input
                          type="text"
                          :name="`${field}-${index}`"
                          :class="{error: isError(resource, field)}"
                          :maxlength="inputMaxLength(field)"
                          autocomplete="off"
                          @input="onInput(resource, field)"
                          @change="changeResource(index)"
                          @keydown.space.prevent
                          @keydown.up="selectPrevItem(index - 1, field)"
                          @keydown.down="selectNextItem(index + 1, field)"
                          @keyup.enter="selectNextItem(index + 1, field)"
                          v-model="resource[field]"
                          :style="inputPasswordStyle(field)"
                      >
                      <div v-if="isError(resource, field)" class="tooltip">
                        <span v-html="getErrorMessages(resource, field)"></span>
                      </div>
                    </td>
                  </tr>
                </template>
                </tbody>
              </table>

              <div
                  v-if="availableResources.length === 0"
                  class="hi-nodata"
              >
                <p>리스트가 없습니다.</p>
              </div>                          
            </div>
          </div>
          <div class="consent-box">
            <input type="checkbox" id="checked-sq" class="sq-type" v-model="isConsentChecked">
            <label for="checked-sq">
              <span class="consent-text">
                <strong>[필수]</strong> 임시 학생 계정 생성을 위해 학생(본인) 또는 학부모(법정대리인)의 개인정보 처리 동의를 받았음을 확인합니다.
              </span>
            </label>
          </div>  
          <div class="footer-btns">
            <HiButton size="lg" color="primary" outline @click="close">
              취소
            </HiButton>
            <HiButton size="lg" color="primary" :disabled="!isReadySubmit" @click="submit">
              저장하기
            </HiButton>
          </div>
        </div>
        <!--
        <div class="sr-only">
          <div class="avatar-img capture batch mt-10">
            <div class="img-area" :style="`border-radius: 0; background-color:${imageBgColor};`">
              <div class="txt">
                {{ imageTitle }}
              </div>
            </div>
          </div>
        </div>
        -->
      </template>
    </modal-layout>

    <clazz-member-add-student-batch-guide v-if="isOpenGuide" @closeGuide="isOpenGuide = false"/>
  </fragment>
</template>

<script>
import ModalLayout from "@/components/Modal/ModalLayout";
import {mapFields} from "vuex-map-fields";
import {mapActions, mapGetters, mapState} from "vuex";
import ClazzMemberAddStudentBatchGuide from "@/components/Popup/ClazzMemberAddStudentBatchGuide";

export default {
  name: "clazz-member-add-student-batch",
  components: {ClazzMemberAddStudentBatchGuide, ModalLayout},
  data() {
    return {
      componentKey: 0,
      flag: {
        showPassword: false,
      },
      resources: [],
      submitType: null,
      isOpenGuide: false,
      imageTitle: '',
      imageBgColor: '',
      isConsentChecked: false,
    }
  },
  props: {
    classId: {
      type: String
    }
  },
  computed: {
    ...mapFields([
      'isDimLoading',
    ]),
    ...mapGetters([
      'CONSTANTS'
    ]),
    ...mapState([
      'profileImageBgColor'
    ]),
    inputPasswordStyle() {
      return (field) => {
        return this.flag.showPassword || field !== 'loginPassword' ?
            '' :
            '-webkit-text-security: disc !important; text-align: center;'
      }
    },
    inputMaxLength() {
      return (field) => {
        if (field === 'tagName') return 10
        else if (field === 'number') return 2
        else if (field === 'name') return 20
        else if (field === 'loginId') return 12
        else if (field === 'loginPassword') return 16
      }
    },
    isReadySubmit() {
      const findEmptyRow = this.availableResources.find(r => !(r.tagName && r.number && r.name && r.loginId && r.loginPassword))
      if (findEmptyRow)
        return false

      return this.isConsentChecked && this.availableResources.length > 0 && this.availableResources.every(r =>
          r.errorObj.tag === '' && r.errorObj.number === '' && r.errorObj.name === '' && r.errorObj.id === '' && r.errorObj.password === '' && !r.errorObj.isDuplicate
      )
    },
    isError() {
      return (resource, field) => {
        return this.getErrorCode(resource, field) ||
            (['tagName', 'number', 'name'].includes(field) && resource.errorObj && resource.errorObj.isDuplicate)
      }
    },
    availableResources() {
      return this.resources.length > 0
        ? this.resources.filter((r, idx) => idx < this.resources.length - 1)
        : []
    }
  },
  methods: {
    ...mapActions(['triggerAnalyticsLogEvent',]),
    ...mapActions('storeClazzTag', ['fetchTags']),
    close() {
      this.$emit('closeAddStudentBatch')
    },
    downloadSample() {
      const samplePath = 'https://download.hiclass.net/static/document/hiclass_temp_student_batch_sample_v2.xlsx'
      this.$comn.download(samplePath,'양식 등록 샘플.xlsx')
    },
    async doEditMode() {
      // 직접 입력하기 버튼 클릭 시 에디트 모드 진입
      if (this.availableResources.length === 0) {
        this.initEditModeTable()
      } else {
        try {
          const result = await this.getConfirmMessage(this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.MESSAGE.NEW_EDIT_MODE)
          if (result)
            this.initEditModeTable()
        } catch (e) {
          this.$log.error(e)
        }
      }
    },
    async doReset() {
      try {
        const result = await this.getConfirmMessage(this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.MESSAGE.TABLE_RESET)
        if (result)
          this.submitType = this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.SUBMIT_TYPE.EDIT_MODE
          this.resources.splice(0)
          this.addResource('EDIT_MODE')
      } catch (e) {
        this.$log.error(e)
      }
    },
    getConfirmMessage(reason) {
      let message = '초기화 하시겠습니까?'

      switch (reason) {
        case this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.MESSAGE.NEW_EDIT_MODE:
          message = '기존 생성한 데이터는<br>모두 초기화 되며 복구 불가합니다.<br><br>새로 생성하시겠습니까?'
          break
        case this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.MESSAGE.NEW_EXCEL_UPLOAD:
          message = '엑셀 파일을 새로 업로드 하시면<br>기존 생성한 데이터는 삭제됩니다.<br><br>파일 업로드를 진행하시겠습니까?'
          break
        case this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.MESSAGE.TABLE_RESET:
          message = '기존 생성한 데이터는<br>모두 초기화 되며 복구 불가합니다.<br><br>초기화 하시겠습니까?'
          break
      }

      return new Promise((resolve, reject) => {
        const confirmObj = {
          message: message,
          icon: this.CONSTANTS.SWEET_ALERT.ICON.WARNING,
          opts: {
            reverseButtons: true
          }
        }
        return this.$hiClass.confirm(confirmObj.message, confirmObj.icon, confirmObj.opts)
          .then(() => resolve(true))
          .catch(() => reject('confirm dismiss'))
      })
    },
    initExcelUploadTable() {
      this.submitType = this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.SUBMIT_TYPE.EXCEL_UPLOAD
      this.resources.splice(0)
    },
    initEditModeTable() {
      this.submitType = this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.SUBMIT_TYPE.EDIT_MODE
      this.resources.splice(0)
      this.addResource('EDIT_MODE')
      this.addResource()
    },
    async fileUpload() {
      if (this.availableResources.length === 0) {
        this.$refs.attach.click()
      } else {
        try {
          const result = await this.getConfirmMessage(this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.MESSAGE.NEW_EXCEL_UPLOAD)
          if (result) {
            this.$refs.attach.click()
          }
        } catch (e) {
          this.$log.error(e)
        }
      }
    },
    async upload(e) {
      this.initExcelUploadTable()

      if (e === null) {
        this.$refs.attach.click()

      } else {
        let isChk = true
        const postApi = []

        try {
          const files = e.target.files || e.dataTransfer.files

          let compatibleExtensions = [ 'xls', 'xlsx' ]
          let compatibleExtensionCount = 0

          for (let i = 0; i < files.length; i++) {

            if (files[i].size > 1024 * 1024 * 10) {
              this.$hiClass.alert('양식 파일은 최대 10MB 까지 첨부 가능합니다.', 'error')
              isChk = false
              i = files.length // 반복 중단
            }

            if (compatibleExtensions.includes(this.$comn.split(files[i].name, '.')))
              compatibleExtensionCount++

            if (compatibleExtensionCount === 0) {
              this.$hiClass.alert('해당 파일 확장자는 업로드 불가능합니다.<br>지원하는 파일 형식: xls, xlsx', 'error')
              isChk = false
              i = files.length
            }

            if (isChk) {
              // IE 브라우저 파일경로 포함 제거
              if (files[i].name.includes('\\'))
                files[i].name = this.$comn.split(files[i].name, '\\')

              postApi.push(this.$hiClass.excels.uploadStudents(files[i]))
            }

          }

        } catch (e) {
          this.$log.warn(e)
        } finally {
          // 첨부파일 분석 완료되었으므로 input value 삭제
          this.$refs.attach.value = null
        }

        if (isChk) {
          this.isDimLoading = true

          Promise.all(postApi)
            .then(res => {
              res.map(item => {
                item.data.map(i => {
                  i.errorObj = {
                    tag: '',
                    number: '',
                    name: '',
                    id: '',
                    password: '',
                    isDuplicate: false
                  }
                  i.resultTarget.forEach((field, idx) => {
                    i.errorObj[field] = i.resultCode[idx]
                  })
                })

                this.resources = item.data.map(i => {
                  i.loginId = i.loginId.replace(/\s+/g, '')
                  return i
                })

                this.checkDuplicateStudent()
                this.checkDuplicateLoginId()

                if (this.resources.length > 0) {
                  this.addResource()
                } else {
                  this.$hiClass.alert('입력된 정보가 없습니다.<br>첨부파일의 내용을 확인해주세요.', 'error')
                }
              })
            })
            .catch(err => {
              this.$log.debug(this.$options.name, ' upload() error => ', err)
              switch (err.response.status) {
                case 428: {
                  if (err.response.data.error === 'InvalidExcelFormat' || err.response.data.error === 'DeprecatedExcelVersion') {
                    this.$hiClass.alert('지원하지 않는 파일 양식입니다.<br>등록 양식을 다운로드 받아 다시 업로드해주세요.', 'error')
                  } else {
                    this.$hiClass.alert('한번에 등록 가능한 계정은 99개까지입니다.', 'error')
                  }
                }
                  break
                case 500:
                  this.$hiClass.alert('업로드를 실패하였습니다.<br>파일을 다시 확인해주세요.', 'error')
                  break
                default:
                  this.$hiClass.alert('파일을 등록할 수 없습니다.<br>제공된 양식이 맞는지 확인해주세요.', 'error')
                  break
              }
            })
            .finally(() => {
              this.isDimLoading = false
            })
        } else {
          this.isDimLoading = false
        }
      }
    },
    getErrorCode(resource, field) {
      if (!resource.errorObj) return

      if (field === 'loginId') field = 'id'
      if (field === 'loginPassword') field = 'password'
      if (field === 'tagName') field = 'tag'

      return resource.errorObj[field]
    },
    getErrorMessages(resource, field) {
      if (field === 'loginId') field = 'id'
      if (field === 'loginPassword') field = 'password'
      if (field === 'tagName') field = 'tag'

      if (['tag', 'number', 'name'].includes(field) && resource.errorObj.isDuplicate) {
        return '중복된 학생이 있습니다. 학반을 변경하거나 반번호를 변경해주세요.'
      }

      const code = parseInt(this.getErrorCode(resource, field))
      const errMsg = {
        'tag': {
          452: '한글, 영문, 숫자, 특수문자 - _ / & , .() 만 가능합니다.',
          459: '학반(태그)을 입력해주세요.'
        },
        'number': {
          411: '항목이 없거나 잘못 입력되었습니다.<br>반 번호는 1~99까지의 숫자로 입력해주세요.',
          422: '숫자만 입력 가능합니다.'
        },
        'name': {
          411: '항목이 없거나 잘못 입력되었습니다.',
          422: '이름은 한글, 영문 대/소문자 2~20 이내로 입력해주세요.'
        },
        'id': {
          411: '항목이 없거나 잘못 입력되었습니다.',
          412: '이미 있는 아이디입니다.',
          413: '중복된 아이디가 있습니다.', // 로컬에서 체크
          422: '아이디는 영문 소문자/숫자 4~12자 이내로 입력해주세요.'
        },
        'password': {
          411: '항목이 없거나 잘못 입력되었습니다.',
          422: '비밀번호는 8자 이상의 숫자만 입력해주세요.'
        }
      }
      return errMsg[field][code] || ''
    },
    selectPrevItem(prevIndex, field) {
      const name = field + '-' + prevIndex
      const prevItem = document.querySelector('[name=' + name + ']')
      if (prevItem)
        setTimeout(() => {
          prevItem.focus()
        }, 10)
    },
    selectNextItem(nextIndex, field) {
      const name = field + '-' + nextIndex
      const nextItem = document.querySelector('[name=' + name + ']')
      if (nextItem) {
        setTimeout(() => {
          nextItem.focus()
        }, 10)
      }
    },
    onInput(resource, field) {
      if (field === 'number' && resource.number.startsWith('0')) {
        resource.number = resource.number.replace(/^0+/, '')
      }
    },
    addResource(mode) {
      // add new row
      const model =  {
        "tagName" : "",
        "number" : "",
        "name" : "",
        "loginId" : "",
        "loginPassword" : "",
        "profileImageInfo": null,
        "errorObj" : {
          "tag" : "",
          "number" : "",
          "name" : "",
          "id" : "",
          "password" : "",
          "isDuplicate" : false
        }
      }
      this.resources.push(model)
    },
    addRow() {
      // Add a single editable row. If table not initialized, start edit mode.
      if (this.resources.length === 0) {
        this.initEditModeTable()
        return
      }

      // Insert a new row before the last sentinel row
      const model =  {
        "tagName" : "",
        "number" : "",
        "name" : "",
        "loginId" : "",
        "loginPassword" : "",
        "profileImageInfo": null,
        "errorObj" : {
          "tag" : "",
          "number" : "",
          "name" : "",
          "id" : "",
          "password" : "",
          "isDuplicate" : false
        }
      }

      const insertIndex = Math.max(this.resources.length - 1, 0)
      this.resources.splice(insertIndex, 0, model)
      this.checkDuplicateStudent()
      this.checkDuplicateLoginId()
    },
    deleteResource(index) {
      this.resources.splice(index, 1)
      this.checkDuplicateStudent()
      this.checkDuplicateLoginId()
    },
    async changeResource(index) {
      const resource = this.resources[index]
      if (index === this.resources.length - 1) {
        this.addResource()
      }
      await this.validateResource(resource, index)

      this.checkDuplicateStudent()
      this.checkDuplicateLoginId()
      this.validateEmptyNumber(index)
    },
    checkDuplicateStudent() {
      const isDuplicateStudent = (target, r) => r.tagName && r.tagName === target.tagName &&
          r.number && r.number === target.number &&
          r.name && r.name === target.name

      this.resources.forEach(target => {
        target.errorObj.isDuplicate = this.resources.filter(r => isDuplicateStudent(target, r)).length > 1
      })
    },
    checkDuplicateLoginId() {
      const checkDuplicateLoginId = (target, r) => r.loginId && r.loginId === target.loginId

      this.resources.forEach(target => {
        if (!['411', '412'].includes(target.errorObj.id)) { // 빈값/이미 있는 아이디 우선 체크
          target.errorObj.id = this.resources.filter(r => checkDuplicateLoginId(target, r)).length > 1 ?
              '413' : ''
        }
      })
    },
    validateEmptyNumber(index) {
      if (this.resources[index].number.trim().length === 0) {
        this.resources[index].errorObj.number = '411'
      }
    },
    async validateResource(resource, index) {
      const response = await this.$hiClass.excels.validateStudent(resource)
      resource.errorObj = {
        tag: '',
        number: '',
        name: '',
        id: '',
        password: '',
        isDuplicate: false
      }
      response.data.resultTarget.forEach((field, idx) => {
        resource.errorObj[field] = response.data.resultCode[idx]
      })
    },
    async submit() {
      this.isDimLoading = true

      // await this.createProfileImage()

      let errMessage = '임시 학생 명단 등록이 실패하였습니다.'
      const requestModel = {
        students: this.availableResources,
        classId: this.classId
      }

      if (!requestModel.classId) {
        errMessage += '<br>(클래스 아이디를 찾을 수 없습니다. 페이지 새로고침 후 다시 시도해주세요.)'
        this.$hiClass.alert(errMessage, 'error')
        this.isDimLoading = false
        return false
      }

      this.$hiClass.tempStudents.create(requestModel)
        .then(() => {
          this.submitAfterAnalytics()

          const message = '임시 학생 명단 등록이 완료되었습니다.'
          this.$hiClass.alert(message, 'success')
            .then(() => {
              this.$emit('reloadMembers')
              this.fetchTags(this.classId)
              this.close()
            })
        })
        .catch(err => {
          this.$log.error(err)
          switch (err.response.status) {
            case 409:
              break
            case 412:
              errMessage += '<br>(중복된 아이디 발견)'
              this.availableResources.forEach(r => this.validateResource(r))
              break
          }
          this.$hiClass.alert(errMessage, 'error')
        })
        .finally(() => {
          this.isDimLoading = false
        })
    },
    submitAfterAnalytics() {
      let eventName = ''
      switch (this.submitType) {
        case this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.SUBMIT_TYPE.EDIT_MODE:
          eventName += 'analytics.class.member.addStudentBatch.submit.editMode'
          break
        case this.CONSTANTS.CLAZZ_MEMBER_ADD_STUDENT_BATCH.SUBMIT_TYPE.EXCEL_UPLOAD:
          eventName += 'analytics.class.member.addStudentBatch.submit.excelUpload'
          break
      }
      if (eventName)
        this.triggerAnalyticsLogEvent({ code: eventName })

    }
  }

}
</script>

<style lang="scss" scoped>
.register-temp-student-modal {
  &.common-modal {
    .modal-title-wrap {
      padding: 40px 30px 30px;
      border-bottom: 0;
      margin-bottom: 0;
    }
  }
  .content-wrap {
    max-height: 440px;
    min-height: 440px;
    overflow: auto;
    padding: 0 30px;
  }
  ::v-deep .modal-cont-wrap {
    .content-wrap.compact {
      min-height: auto;
      max-height: none;
    }
    .boundary-box {
      position: relative;
      width: 900px;
      padding-bottom: 0;
    }
  }
  .gray-box {
    padding: 24px;
    border-radius: 8px;
    background: #F8F9FC;
    margin-top: 0;
    .box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .heading-step {
        display: block;
        color: #000;
        font-size: 16px;
        font-weight: 500;
        text-align: left;
        margin-bottom: 8px;
      }
      .btn-guide {
        color: var(--primary);
        text-decoration: underline;
      }
    }    
    .consent-note-list {
      padding-left: 18px;
      li {
        text-align: left;
        font-size: 14px;
        font-weight: 400;
        line-height: 160%;
        color: var(--gray-09);
        list-style: disc;
      }
    }
    .group-btn {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
  }
  .box-step {
    position: relative;
    padding-top: 20px;
    .student-list-header-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      .student-list-header {
        display: flex;
        align-items: center;
        gap: 4px;
        .student-list-title {
          color: #000;
          font-size: 18px;
          font-weight: 700;
          line-height: 150%;
        }
        .count {
          font-size: 15px;
          font-weight: 400;
          line-height: 160%;
          text-align: left;
        }  
      }
      .student-list-actions {
        display: flex;
        gap: 6px;
      }      
    }
    .tbl-excel {
      width: 100%;
      border-top: 2px solid #4267b2;
    }
    .btn-delete {
      width: 24px;
      height: 24px;
      background: url("~@/assets/img/icon/icon_close_black.svg") no-repeat;
      background-size: cover;
      text-indent: -999em;
    }     
  }
  .box-step-sub {
    clear: both;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    margin-left: 15px;
    &:not(:first-of-type) {
      margin-top: 10px;
      border-top: 1px solid #e1e2e5;
      padding-top: 10px;
    }
  }
  .school-form-list-wrap {
    &.school-form-list-wrap::after {
      content: "";
      display: block;
      clear: both;
    }
  }
  .cont-empty-wrap {
    padding: 50px 0 0;
  }
  .text-empty {
    color: #b4b4b4;
    font-size: 16px;
    line-height: 1.6;
  }
  .hi-nodata {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px 0;
    min-height: 80px;
    color: var(--gray-06);
    border-bottom: 1px solid #E1E3E6;
  }
  .consent-box {
    text-align: left;
    padding: 20px 30px 0 30px;
    .consent-text {
      color: var(--gray-10);
      font-size: 14px;
      font-weight: 400;
      line-height: 120%;
      strong {
        font-weight: 600;
      }
    }
  }
  .footer-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 30px 30px 35px 30px;
    .hi-btn {
      width: 180px;
    }
  }
}
</style>