<template>
  <div v-if="option.isVisible">
    <div class="worksheet-wrap">
      <worksheet-create-header
        :mode="'create'"
        :sheetStatus="model.sheetStatus"
        :isReadyCreate="isReadyCreate"
        @is-click-next="clickNext"
      />

      <div class="worksheet-container">
        <div class="content">
          <div class="worksheet-form-title">
            <strong>신청서 정보</strong>
          </div>
          <div class="worksheet-form-list">
            <div class="item">
              <strong class="title required">학교</strong>
              <div class="text">
                <span>{{ school.schoolName }}</span>
              </div>
            </div>
            <div class="item">
              <strong class="title required">신청서 유형</strong>
              <div class="text">
                <!-- <span v-if="isUpdate || isCopiedSheet">{{ getApplyTypeNameByCode({code: model.applyType}) }}</span> -->
                <span v-if="isUpdate || isCopiedSheet">{{ getDisplayApplyTypeName(model) }}</span>
                <hc-select
                  v-else
                  :model.sync="model.applyType"
                  selectLabel="name"
                  selectValue="code"
                  defaultLabel="유형 선택"
                  :isFocusMode="false"
                  :item="applyTypes"
                  :scrollbarType="1"
                  @is-click="checkShareForms(model.applyType)"
                />

                <button
                  v-if="!isUpdate && !isCopiedSheet"
                  class="btn-bg-w2"
                  @click="openShareForms"
                >
                  양식 불러오기
                </button>
              </div>
            </div>
            <div class="item">
              <strong class="title required">제목</strong>
              <div class="text">
                <input type="text" maxlength="100" v-model="model.title">
              </div>
            </div>
  <!--          <div class="item">
              <strong class="title required">양식 공유</strong>
              <div class="text">
                <div class="checkbox-wrap">
                  <input type="checkbox" id="ck0-1" v-model="model.formShare"><label for="ck0-1"><span>우리학교 선생님과 공유</span></label>
                </div>
              </div>
            </div>-->
            <div class="item">
              <strong class="title">설명</strong>
              <div class="text">
                <textarea
                  placeholder="신청서 작성 시 유의사항을 간략히 입력해주세요."
                  maxlength="250"
                  v-model="model.description"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="worksheet-form-title">
            <strong class="required">신청서 파일 업로드</strong>
          </div>

          <sheet-upload
            :key="option.componentKey.sheetUpload"
            :sheetMedias.sync="model.sheetMedias"
            :isUploading.sync="option.loading.upload"
            :isDisabledUpload="isDisabledUpload"
          />

          <div class="worksheet-bottom-wrap">
            <button
              type="button"
              class="btn-bg-c"
              :class="{
              dis: !isReadyCreate
            }"
              :disabled="!isReadyCreate"
              @click="isUpdate ? updateSheet(CONSTANTS.BUTTON.COMPLETE) : createSheet(CONSTANTS.BUTTON.COMPLETE)"
            >
              {{ submitTitle }}
            </button>
          </div>

        </div>
        <br>
      </div>

    </div>

    <worksheet-share-list
      v-if="worksheetShareList.isOpen"
      @is-select="selectSheet"
    />
  </div>
  <div v-else>
    <main-loading-new-tab />
  </div>
</template>

<script>
import '@/assets/css/worksheets.scss';

import {mapFields} from "vuex-map-fields";
import WorksheetCreateHeader from "@/apps/worksheetCreate/WorksheetCreateHeader";
import HcSelect from "@/components/Form/HcSelect";
import SheetUpload from "@/components/Upload/Sheet/SheetUpload";
import {mapGetters} from "vuex";
import WorksheetShareList from "@/components/Popup/WorksheetShareList";
import MainLoadingNewTab from "@/apps/main/MainLoadingNewTab";

export default {
  name: "worksheet-create",
  components: {MainLoadingNewTab, WorksheetShareList, SheetUpload, HcSelect, WorksheetCreateHeader},
  data() {
    return {
      option: {
        loading: {
          upload: false
        },
        required: [
          {
            key: 'parentId',
            type: String,
          },
          {
            key: 'applyType',
            type: String,
          },
          {
            key: 'title',
            type: String,
          },
          {
            key: 'sheetMedias',
            type: Array,
          },
        ],
        isVisible: false,
        isOpened: {
          shareForms: false,
        },
        componentKey: {
          sheetUpload: 0
        }
      },
      sheetId: null,
      classId: null,
      clazz: {
        currentId: null,
        className: null
      },
      schoolId: null,
      school: {
        currentId: '',
        schoolName: ''
      },
      model: {
        // sortNum: null,
        sheetTools: [],
        sheetMedias: [],
        applyType: null,   // required:true | 신청서 유형(ABSENT:결석사유서,FIELD_STUDY:체험학습,ETC:기타)
        sheetType: 'W',   // required:true | 시트 유형(H:하이클래스,W:워크시트)
        title: null,    // required:true | 제목
        description: null,   // required:true | 설명
        parentId: '',   // required:true | 학교|클래스 아이디
        sheetStatus: 'TEMP',   // required:true | 시트 상태(USED:사용,NOT_USED:미사용,TEMP:임시)
      },
      selectModel: {},
      resource: null,
      applyTypes: []
    }
  },
  computed: {
    ...mapGetters([
      'CONSTANTS',
      'getApplyTypeNameByCode'
    ]),
    ...mapFields([
      'isDimLoading',
      'notSupportedBrowser'
    ]),
    ...mapFields('storeWorksheet', [
      'worksheetShareList',
      'curWorksheetCreate'
    ]),
    parentId() {
      return this.$route.params.parentId || 0
    },
    isCheckedSheetMedias() {
      return this.model.sheetMedias.length > 0
        && this.model.sheetMedias.some(item => item.mediaCd === this.CONSTANTS.WORKSHEET_MEDIA.MEDIA_CD.ISIMG && item.useYn === 'Y')
    },
    isReadyCreate() {
      let result = true

      if (!this.isCheckedSheetMedias)
        return false

      this.option.required.forEach(item => {
        switch (item.type) {
          case String:
            if (!this.model[item.key]) result = false
            else if (this.model[item.key].trim().length === 0) result = false
            break

          case Array:
            if (this.model[item.key].length === 0) result = false
            break
        }
      })

      return result && this.isCheckedSheetMedias
    },
    isUpdate() {
      return this.sheetId
    },
    submitTitle() {
      if (!this.isEditableWorksheet) {
        return '저장하기'
      }
      return this.isUpdate ? '신청서 수정하기' : '신청서 만들기'
    },
    isDisabledUpload() {
      // if (this.CONSTANTS.BUTTON.TEMPORARY && this.model.sheetTools.length === 0)
      //   return false

      return !!this.isUpdate
    },
    isCopiedSheet() {
      return this.curWorksheetCreate.copiedSheetModel && this.curWorksheetCreate.copiedSheetModel.title
    },
    isEditableWorksheet() {
      return this.model.sheetStatus === 'TEMP'
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$log.debug(to, from)

      // 워크시트 에디터 양식 수정 후 다시 정보입력화면으로 진입하면 신청서 목록으로 이동
      if (from.path.includes('/worksheets')) {
        const parentId = vm.$route.params.parentId
        vm.$router.push(`/main/clazzes/${parentId}/form`, () => {})
      } else {
        vm.option.isVisible = true
      }
    })
  },

  async created() {
    if (this.$comn.isIE()) {
      this.notSupportedBrowser.isOpen = true
      this.notSupportedBrowser.pageName = 'worksheetCreate'

    } else {
      this.initCreate()

      if (this.isCopiedSheet)
        this.initCopiedSheet()

      this.sheetId = this.$route.params.sheetId

      if (this.sheetId) {
        this.model.sheetStatus = ''

        await this.getSheet(this.sheetId)
      }

    }

  },
  mounted() {
    // if (this.sheetId)
    //   this.getTempWorksheet(this.sheetId)
    this.$scrollTo("body");

    this.$hiClass.toggleBodyClass('add', 'worksheet')

    this.getApplyTypes()
  },

  beforeDestroy() {
    this.curWorksheetCreate.copiedSheetModel = {}
    this.closeShareForms()

    this.$hiClass.toggleBodyClass('remove', 'worksheet')
  },

  methods: {
    // 임시 처리: 제목에 "동의서" 포함된 기타 항목을 "동의서"로 표시 (백엔드 개발 전까지)
    getDisplayApplyTypeName(resource) {
      if (resource.applyType === 'ETC' && (resource.title || '').includes('동의서')) {
        return '동의서'
      }
      return this.getApplyTypeNameByCode({code: resource.applyType})
    },
    initCreate() {
      this.getClass(this.parentId)
    },
    initCopiedSheet() {
      this.selectSheet(this.curWorksheetCreate.copiedSheetModel)
    },
    initShareForms() {
      if (this.$route.query.isOpenShareForms && !this.option.isOpened.shareForms) {
        // 최초 로딩 1번만 불러오기 처리
        this.option.isOpened.shareForms = true
        this.openShareForms()
        // 파라미터 삭제
        this.$router.replace(this.$route.path, () => {})
      }
    },
    getClass(classId) {
      return this.$hiClass.clazzes.read(`/clazzes/${classId}`)
        .then(res => {
          this.clazz = res.data
          this.classId = this.clazz.currentId

          this.school = this.clazz.school
          this.schoolId = this.school.currentId

          this.setParentId(this.classId)
        })
        .catch(err => {
          this.$log.warn(err)
        })
        .finally(() => {
          this.initShareForms()
        })
    },
    getTempWorksheet(sheetId) {
      this.$hiClass.sheets.read(`/sheets/${sheetId}`)
        .then(res => this.model = res.data)
        .catch(err => {
          this.$log.warn(`getTempWorksheet => `, err)
        })
    },
    setParentId(parentId) {
      this.model.parentId = parentId
    },

    clickNext() {
      const type = this.CONSTANTS.BUTTON.COMPLETE
      if (this.isUpdate) {
        this.updateSheet(type)
      } else {
        this.createSheet(type)
      }
    },

    // 신청서 만들기
    createSheet(type) {
      switch (type) {
        case this.CONSTANTS.BUTTON.TEMPORARY: {
          this.createSheetProc()
            .then(data => {
              this.$hiClass.alert('임시저장 되었습니다.', 'success')
              this.sheetId = data.sheetId
              this.getSheet(data.sheetId)
            })
            .catch(err => {
              this.$log.warn(`createSheet err => `, err)
              this.$hiClass.alert('신청서 양식 생성에 오류가 발생했습니다.<br>다시 한번 확인해주세요.', 'warning')
            })
          break
        }
        case this.CONSTANTS.BUTTON.COMPLETE: {
          this.createSheetProc()
            .then(data => {
              this.editWorksheetProc(data.sheetId)
            })
            .catch(err => {
              this.$log.warn(`createSheet err => `, err)
              this.$hiClass.alert('신청서 양식 생성에 오류가 발생했습니다.<br>다시 한번 확인해주세요.', 'warning')
            })
          break
        }

        default:
      }
    },

    createSheetProc() {
      this.isDimLoading = true

      // console.log("this.model", this.model)

      const params = Object.assign({}, this.model)
      // params.sheetMedias = params.sheetMedias.filter(item => item.mediaCd === 'UPFILE' || item.useYn === 'Y')
      
      // 동의서 유형은 백엔드에서 미지원하므로 '기타'로 저장 (화면에서만 동의서로 표시)
      if (params.applyType && params.applyType.indexOf('TEMP_ACCOUNT_CONSENT') === 0) {
        params.applyType = 'ETC'
      }
      
      // [기존 코드] params.sheetMedias = params.sheetMedias.filter(item => item.mediaCd === 'UPFILE' || item.useYn === 'Y')
      // [기존 코드] params.sheetTools = params.sheetTools.filter(tool => params.sheetMedias.some(sheetMedia => sheetMedia.sortNum === tool.sheetPage))
      // sheetMedias/sheetTools가 undefined인 경우 방어
      params.sheetMedias = (params.sheetMedias || []).filter(item => item.mediaCd === 'UPFILE' || item.useYn === 'Y')
      // 업로드된 페이지중 사용안하는 페이지가 있으면 사용안하는 페이지에 있는 응답칸 제거
      // params.sheetTools = params.sheetTools.filter(tool => params.sheetMedias.some(sheetMedia => sheetMedia.sortNum === tool.sheetPage))
      params.sheetTools = (params.sheetTools || []).filter(tool => params.sheetMedias.some(sheetMedia => sheetMedia.sortNum === tool.sheetPage))

      // 시트, 응답칸 페이지정보 변경
      params.sheetMedias.forEach((sheetMedia, idx) => {
        params.sheetTools
          .filter(sheetTool => sheetTool.sheetPage === sheetMedia.sortNum)
          .forEach(sheetTool => sheetTool.sheetPage = idx)
        sheetMedia.sortNum = idx
      })
      return this.$hiClass.sheets.create(params)
        .then(res => res.data)
        .catch(err => {
          this.$log.warn(`createSheet err => `, err)
          this.$hiClass.alert('신청서 양식 생성에 오류가 발생했습니다.<br>다시 한번 확인해주세요.', 'warning')
        })
        .finally(() => {
          this.isDimLoading = false
        })
    },

    updateSheet(type) {
      switch (type) {
        case this.CONSTANTS.BUTTON.TEMPORARY: {
          this.updateSheetProc()
            .then(data => {
              this.$hiClass.alert('임시저장 되었습니다.', 'success')
              this.getSheet(data.sheetId)
            })
            .catch(err => {
              this.$log.warn(`updateSheet err => `, err)
              this.$hiClass.alert('신청서 양식 수정에 오류가 발생했습니다.<br>다시 한번 확인해주세요.', 'warning')
            })
          break
        }

        case this.CONSTANTS.BUTTON.COMPLETE: {
          this.updateSheetProc()
            .then(data => {
              this.editWorksheetProc(data.sheetId)
            })
            .catch(err => {
              this.$log.warn(`updateSheet err => `, err)
              this.$hiClass.alert('신청서 양식 수정에 오류가 발생했습니다.<br>다시 한번 확인해주세요.', 'warning')
            })
          break
        }

        default:
      }
    },

    updateSheetProc() {
      this.isDimLoading = true

      const params = Object.assign({}, this.model)
      
      // 동의서 유형은 백엔드에서 미지원하므로 '기타'로 저장 (화면에서만 동의서로 표시)
      if (params.applyType && params.applyType.indexOf('TEMP_ACCOUNT_CONSENT') === 0) {
        params.applyType = 'ETC'
      }

      // if (!this.isDisabledUpload)
      //   params.sheetMedias = params.sheetMedias.filter(item => item.mediaCd === 'UPFILE' || item.useYn === 'Y')

      return this.$hiClass.sheets.update(params)
        .then(res => res.data)
        .catch(err => {
          this.$log.warn(`updateSheet err => `, err)
          this.$hiClass.alert('신청서 양식 수정에 오류가 발생했습니다.<br>다시 한번 확인해주세요.', 'warning')
        })
        .finally(() => {
          this.isDimLoading = false
        })
    },

    editWorksheetProc(sheetId) {
      if (this.isEditableWorksheet) {
        this.$router.push(`/worksheets/${this.parentId}/${sheetId}/edit`, () => {})
      } else {
        this.$hiClass.alert('저장되었습니다.')
          .then(() => this.$router.back())
      }
    },

    getSheet(sheetId) {
      const url = `/sheets/${sheetId}`
      return this.$hiClass.sheets.read(url)
        .then(res => {
          this.$set(this, 'model', res.data)

          this.model.parentId = this.parentId

          // this.model.sheetId = res.data.sheetId
          // this.model.sheetMedias = res.data.sheetMedias
          // this.model.sheetTools = res.data.sheetTools
          // this.model.sortNum = res.data.sortNum
          this.model._links =  res.data._links
        })
        .catch(err => {
          this.$hiClass.alert(err)
        })
    },

    checkShareForms(applyType) {
      // 동의서 유형일 경우 서버에서 공유양식 검색하지 않음 (백엔드에 해당 코드 미지원으로 에러 발생 가능)
      if (!applyType || (typeof applyType === 'string' && applyType.indexOf('TEMP_ACCOUNT_CONSENT') === 0)) {
        return
      }
      const query = {
        size: 20,
        page: 0,
        sort: "insertedTimestamp,desc",
        schoolId: this.schoolId,
        applyTypes: [applyType],
        sheetStatus: null,
        title: null
      }

      this.$hiClass.sheetInfos
        .search(query)
        .then(res => {
          if (res.data.page.totalElements > 0) {
            const message = `우리 학교에 등록된 신청서 양식이 있습니다.<br>확인하시겠습니까?`
            this.$hiClass.confirm(message)
              .then(() => {
                this.worksheetShareList.applyType = applyType
                this.openShareForms()
              })
              .catch(() => {
                this.worksheetShareList.applyType = null
              })
          }
        })
        .catch(err => {
          this.$hiClass.alertError(err);
        })

    },

    // 양식 불러오기 팝업 호출
    openShareForms() {
      this.selectModel = {}
      this.worksheetShareList.schoolId = this.schoolId
      this.worksheetShareList.isOpen = true
    },

    // 양식 불러오기 팝업 닫기
    closeShareForms() {
      this.selectModel = {}
      this.worksheetShareList.schoolId = null
      this.worksheetShareList.isOpen = false
    },

    async selectSheet(model) {
      try {
        // 선택한 양식 불러오기
        const url = `/sheets/${model.sheetId}`
        this.$hiClass.sheets.read(url)
          .then(res => {
            this.$set(this, 'selectModel', res.data)

            if (this.isCopiedSheet)
              this.selectModel.title = this.CONSTANTS.WORKSHEET_CREATE.COPY.TITLE.PREFIX + this.selectModel.title

            const deleteSheetIdKeys = ['sheetMedias', 'sheetTools']
            const setKeys = [
              'applyType',
              'sheetTools',
              'sheetMedias',
              'title',
              'description'
            ]

            // this.selectModel.sheetTools = this.selectModel.sheetTools.sort((a, b) => {
            //   return a.toolSeq - b.toolSeq
            // })

            this.deleteItemKey(this.selectModel)
            for (const [key, value] of Object.entries(this.selectModel)) {
              if (deleteSheetIdKeys.includes(key)) {
                switch (key) {
                  case 'sheetMedias': {
                    value.forEach(sheetMedia => this.deleteItemKey(sheetMedia))
                    break
                  }
                  case 'sheetTools': {
                    value.forEach(sheetTool => {
                      this.deleteItemKey(sheetTool)
                      sheetTool.exampleList.forEach(exampleItem => this.deleteItemKey(exampleItem))
                      sheetTool.exampleList.forEach(answerItem => this.deleteItemKey(answerItem))
                    })
                    break
                  }
                }
              }

              if (setKeys.includes(key))
                this.model[key] = value

            }
            this.model.parentId = this.parentId
          })
          .then(() => {
            this.option.componentKey.sheetUpload++
          })
          .catch(err => {
            this.$hiClass.alert(err)
          })
      } catch (e) {
        this.$log.warn(e)
      }
    },

    deleteItemKey(item) {
      if (item.mediaSeq) delete item.mediaSeq
      if (item.toolSeq) delete item.toolSeq
      if (item.sheetId) delete item.sheetId
      if (item.insertedTimestamp) delete item.insertedTimestamp
      if (item.updatedTimestamp) delete item.updatedTimestamp
      if (item._links) delete item._links

      /**
       * [20211025] wsQuesExamSeq / answerSeq 는 unique key 가 아님 !!
       */
      // if (item.wsQuesExamSeq) delete item.wsQuesExamSeq
      // if (item.answerSeq) delete item.answerSeq

      return item
    },

    async getApplyTypes() {
      try {
        const res = await this.$hiClass.sheetInfos.readApplyTypes()
        this.applyTypes = Object.entries(res.data.applyTypes)
            .map(([key, value]) => ({'code': key, 'name': value,}))
      } catch (e) {
        this.applyTypes = this.$constants.WORKSHEET_APPLY.applyType
        this.$log.warn(e)
      }
    }

  },
}
</script>

<style lang="scss" scoped>
.worksheet-form-title .required::after {
  content: "*";
  color: #ff6a6a;
}
</style>