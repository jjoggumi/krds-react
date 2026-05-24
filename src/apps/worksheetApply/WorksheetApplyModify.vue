<template>
  <div
    class="worksheet-container"
    :class="{
      'add-top-attachment': curClazzApply.model.files.length > 0
    }"
  >
    <worksheet-submit-body
      v-if="curClazzApply.model.sheetId"
      :worksheetApplyViewType="CONSTANTS.WORKSHEET_APPLY.MODIFY"
      :isPC="true"
    />
  </div>
</template>

<script>
import '@/assets/css/worksheets.scss';

import {mapFields} from "vuex-map-fields";
import {mapGetters} from "vuex";

import WorksheetSubmitBody from '@/apps/worksheetSubmit/WorksheetSubmitBody'

export default {
  name: "worksheet-apply-modify",
  props: {
  },
  components: {WorksheetSubmitBody},
  data() {
    return {
      option: {
        validate: {
          isSuccessSheet: false,
          isSuccessApply: false,
        }
      },

      WORKSHEET_MESSAGE_TYPE: {
        SHEET: 'SHEET',
        APPLY: 'APPLY'
      },

      WORKSHEET_MESSAGE: {
        SHEET: {
          '00': 'validate success',
          '01': '입력하지 않은 항목이 있습니다.<br>다시 확인 해주세요.',
          '02': '신청서 제출을 위해 전자서명이 필요합니다.<br>전자서명을 등록해주세요.',
          '03': '잘못된 파라미터입니다.',
          '04': '해당 워크시트를 찾을 수 없습니다.',
          '05': '워크시트 로딩 중입니다.<br>잠시 후 다시 시도해주세요.',
          '97': '결재가 완료되어 수정이 제한됩니다.<br>현재 상태를 확인해 주세요.',
          '98': 'fail update applyStatus',
          '99': '서버 오류가 발생하였습니다.<br>잠시 후 다시 시도해주세요.',
          '100': 'worksheet create/update success',
          '101': '전자서명 갱신 완료',
          '102': '결재서명 갱신 완료'
        },
        APPLY: {
          '00': 'validate success',
          '01': '미정',
          '02': '신청서를 결재하시려면 결재서명이 필요합니다.<br>결재서명을 등록해주세요',
          '03': '잘못된 파라미터입니다.',
          '04': '해당 워크시트를 찾을 수 없습니다.',
          '05': '워크시트 로딩 중입니다.<br>잠시 후 다시 시도해주세요.',
          '99': '서버 오류가 발생하였습니다.<br>잠시 후 다시 시도해주세요.'
        }
      },

      WORKSHEET_MESSAGE_RESPONSE : {
        SHEET: {
          resultCode: '00',
          message: 'validate success'
        },
        APPLY: {
          resultCode: '00',
          message: 'validate success'
        }
      },

    }
  },
  computed: {
    ...mapGetters(['CONSTANTS', 'getApplyTypeNameByCode']),
    ...mapGetters('storeWorksheet', ['clazzApplyComponentsByCode']),
    ...mapFields(['isDimLoading']),
    ...mapFields('storeWorksheet', ['curClazzApply']),
    isUpdate() {
      return this.$route.params.applyId
    }
  },

  watch: {
    'option.validate.isSuccessSheet'(val, oldVal) {
      // isSuccessSheet 성공한 직후에만 처리
      if (oldVal === false && val === true) {
        if (!this.curClazzApply.isMemberRoleManager) {
          this.saveProc()
          return false
        }

        // 클래스 관리자인 경우 결재 서명도 체크
        if (this.curClazzApply.isMemberRoleManager) {
          if (this.option.validate.isSuccessApply) {
            this.saveProc()
          } else {
            // validate 초기화
            this.option.validate.isSuccessSheet = false
            this.validateApply()
          }

        }

      }
    },
    'option.validate.isSuccessApply'(val, oldVal) {
      // isSuccessApply 성공한 직후에만 처리
      if (oldVal === false && val === true) {
        if (this.curClazzApply.isMemberRoleManager) {
          this.validateSheet()
        }
      }
      // todo: 20211116 확인필요!
      // else {
      //   this.option.validate.isSuccessApply = false
      // }
    },

  },

  created() {
    if (!this.curClazzApply.model.sheetId) {
      this.$hiClass.alert('잘못된 요청입니다.')
        .then(() => {
          this.$router.back()
        })
    }
  },
  mounted() {
    window.addEventListener('message', this.handleWorksheetApplyDetailTask)
  },
  destroyed() {
    window.removeEventListener('message', this.handleWorksheetApplyDetailTask)
  },
  methods: {
    // 부모 컴포넌트(WorksheetApply) 에서 refs 로 호출
    save() {
      this.validateSheet()
    },
    saveProc() {
      this.isDimLoading = true

      if (this.isUpdate)
        this.updateModel(this.CONSTANTS.BUTTON.COMPLETE)
      else
        this.createModel(this.CONSTANTS.BUTTON.COMPLETE)
    },
    // 신청서 등록
    async createModel(type) {
      // TODO: 버튼 로딩 필요!

      switch (type) {
        // case this.CONSTANTS.BUTTON.TEMPORARY:
        //   alert(this.CONSTANTS.BUTTON.TEMPORARY)
        //   break

        case this.CONSTANTS.BUTTON.COMPLETE: {
          const params = Object.assign({}, this.curClazzApply.model)

          this.$hiClass.clazzApplies.create(params)
            .then(res => {
              this.$log.debug(`createModel res => `, res)

              try {
                const applyId = res.data.currentId
                // eslint-disable-next-line
                createSheetSubmit(applyId)

              } catch (e) {
                // createSheetSubmit 에서 에러가 발생하였거나 실패하였으면 모바일웹뷰에서는 알지 못하므로 해당 함수 호출
                sandValidateServerError()
              }
            })
            .catch(err => {
              // createSheetSubmit 까지도 가지도 못했으면  모바일웹뷰에서는 알지 못하므로 해당 함수 호출
              this.$log.warn(`createModel err => `, err)
              sandValidateServerError()
            })

          break
        }

        default:
      }
    },
    // 신청서 수정
    async updateModel(type) {
      // TODO: 버튼 로딩 필요!

      switch (type) {
        // case this.CONSTANTS.BUTTON.TEMPORARY:
        //   alert(this.CONSTANTS.BUTTON.TEMPORARY)
        //   break

        case this.CONSTANTS.BUTTON.COMPLETE: {
          const params = Object.assign({}, this.curClazzApply.model)
          // params.sheetMedias = params.sheetMedias.filter(item => item.mediaCd === 'UPFILE' || item.useYn === 'Y')

          // member 의 신청서가 '확인요청' 상태일 때 applyStatus 를 '미확인' 으로 변경하고 저장
          if (!this.curClazzApply.isMemberRoleManager
            && params.applyStatus === this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.REJECT) {
            params.applyStatus = this.CONSTANTS.CLAZZ_APPLY.APPLY_STATUS.UNIDENTIFIED
          }

          this.$hiClass.clazzApplies.update(params)
            .then(res => {
              this.$log.debug(`updateSheet res => `, res)

              try {
                const applyId = this.curClazzApply.model.currentId
                // eslint-disable-next-line
                updateSheetSubmit(applyId)

              } catch (e) {
                this.option.isSuccessValidate = false
                // updateSheetSubmit이 실패 했을때 모바일 웹뷰에서는 알지 못하기 때문에 해당 함수 호출
                sandValidateServerError('97')
              }
            })
            .catch(err => {
              this.$log.warn(`updateSheet err => `, err)
              let errorCode = '99'
              if (err?.response?.status === 409) {
                errorCode = '97'
              }
              this.option.isSuccessValidate = false
              // updateSheetSubmit 까지 가지못했을때 모바일 웹뷰에서는 알지 못하기 때문에 해당 함수 호출
              sandValidateServerError(errorCode)
            })

          break
        }

        default:
      }
    },


    /**
     * 워크시트 요청 함수
     */
    initResponse(messageType) {
      this.setResponse(messageType, '00')
    },
    getResponse(messageType) {
      const response = this.WORKSHEET_MESSAGE_RESPONSE[messageType]
      if(response.resultCode === "01" && response.noCount > 0) {
        response.message = `입력하지 않은 필수 답변이 ${response.noCount}개 있습니다.<br>붉은색 영역을 다시 확인해주세요. `
        return response
      } else {
        return response
      }
    },
    setResponse(messageType, code, noCount) {
      this.WORKSHEET_MESSAGE_RESPONSE[messageType].resultCode = code
      this.WORKSHEET_MESSAGE_RESPONSE[messageType].message = this.WORKSHEET_MESSAGE[messageType][code]
      this.WORKSHEET_MESSAGE_RESPONSE[messageType].noCount = noCount
    },
    validateSheet() {
      const messageType = this.WORKSHEET_MESSAGE_TYPE.SHEET
      this.initResponse(messageType)
      const worksheetSubmitFrame = document.querySelector('#worksheetSubmitPage')

      if (!worksheetSubmitFrame) {
        this.setResponse(messageType, '04')
        this.$hiClass.alert(this.getResponse(messageType).message)
        return
      }

      // iframe 내의 요소 유효성 체크 요청
      const payload = {
        name: 'getSubmitData',
        dispatchEvent: 'call'
      }
      this.sendPayloadToIframe(worksheetSubmitFrame, payload)
    },
    validateApply() {
      const messageType = this.WORKSHEET_MESSAGE_TYPE.APPLY
      this.initResponse(messageType)
      const worksheetSubmitFrame = document.querySelector('#worksheetSubmitPage')

      if (!worksheetSubmitFrame) {
        this.setResponse(messageType, '04')
        this.$hiClass.alert(this.getResponse(messageType).message)
        return
      }

      const params = Object.assign({}, this.curClazzApply.model)
      const payload = {
        name: 'validateApply',
        dispatchEvent: 'call',
        applyStatus: params.applyStatus
      }
      this.sendPayloadToIframe(worksheetSubmitFrame, payload)
    },
    sendPayloadToIframe(iFrame, payload) {
      try {
        iFrame.contentWindow.postMessage(payload, '*')
      } catch (e) {
        this.$log.error(e)
      }
    },

    validateSheetResponse(response) {
      const messageType = this.WORKSHEET_MESSAGE_TYPE.SHEET
      this.initResponse(messageType)

      this.isDimLoading = false

      this.setResponse(messageType, response.resultCode, response.noCount)

      // 정상 응답이 아닐경우 메시지 처리
      const successResultCodes = ['00', '100', '101', '102']
      const curResponse = this.getResponse(messageType)
      if (!successResultCodes.includes(curResponse.resultCode)) {
        this.$hiClass.alert(curResponse.message)
          .then(() => {
            switch (curResponse.resultCode) {
              // 전자서명이 필요한 경우. 입력 팝업 호출
              case '02': {
                this.$hiClass.changeUserSign()
                break
              }
              case '99': {
                const classId = this.curClazzApply.model.classId
                this.$router.push(`/main/clazzes/${classId}/form/applyList`)
              }
            }
          })
        return false
      }

      // validate success 시 isSuccessValidate 플래그 값 변경
      if (curResponse.resultCode === '00') {
        this.option.validate.isSuccessSheet = true
        return false

        // 신청서 등록 / 수정 완료
      } else if (curResponse.resultCode === '100') {
        if (this.isUpdate) {
          this.$toasted.show('저장되었습니다.')
          this.curClazzApply.componentName = this.clazzApplyComponentsByCode({code: this.CONSTANTS.WORKSHEET_APPLY.DETAIL}).name
        } else {
          this.$hiClass.alert('신청서 제출을 완료하였습니다.')
              .then(() => {
                const classId = this.curClazzApply.model.classId
                this.$router.push(`/main/clazzes/${classId}/form/applyList`)
              })
        }
      }
    },

    validateApplyResponse(response) {
      const messageType = this.WORKSHEET_MESSAGE_TYPE.APPLY
      this.initResponse(messageType)

      this.isDimLoading = false

      this.setResponse(messageType, response.resultCode)

      // 정상 응답이 아닐경우 메시지 처리
      const successResultCodes = ['00']
      const curResponse = this.getResponse(messageType)
      if (!successResultCodes.includes(curResponse.resultCode)) {
        this.$hiClass.alert(curResponse.message)
          .then(() => {
            switch (curResponse.resultCode) {
              // 결재서명이 필요한 경우. 입력 팝업 호출
              case '02': {
                this.$hiClass.changeUserSign(this.CONSTANTS.USER_SIGN.APPROVAL_SIGN)
                break
              }
              case '99': {
                const classId = this.curClazzApply.model.classId
                this.$router.push(`/main/clazzes/${classId}/form/applyList`)
              }
            }
          })
        return false
      }

      // validate success 시 isSuccessValidate 플래그 값 변경
      if (curResponse.resultCode === '00') {
        this.option.validate.isSuccessApply = true
        return false
      }

    },

    handleWorksheetApplyDetailTask(e) {
      try {
        if (e.data !== null && e.data !== undefined && e.data !== '') {
          switch (e.data.command) {
            case 'validateSheetResponse': {
              this.$log.warn(`handleWorksheetApplyDetailTask validateSheetResponse => `, e.data)
              this.validateSheetResponse(e.data.response)
              break
            }
            case 'validateApplyResponse': {
              this.$log.warn(`handleWorksheetApplyDetailTask validateApplyResponse => `, e.data)
              this.validateApplyResponse(e.data.response)
              break
            }
          }

          // iframe 에서 alert 메시지 전달
          if (
            e.data.command === 'alert' &&
            e.data.msgData &&
            e.data.msgData.message
          ) {
            this.$hiClass.alert(e.data.msgData.message, e.data.msgData.icon)
              .then(() => {
                switch (e.data.additionalProcess) {
                  case 'goto|back': {
                    this.goto('back')
                    break
                  }
                  case 'goto|home': {
                    this.goto('home')
                    break
                  }
                  default:
                }
              })

          }

        }
      } catch (e) {
        this.$log.debug(e)
      }

    },

    goto(name) {
      if (name === 'home')
        this.$router.push('/')
      else if (name === 'back')
        this.$router.go(-1)
    },

  },

}
</script>

<style scoped>
.worksheet-form-title .required::after {
  content: "*";
  color: #ff6a6a;
}
</style>