<template>
  <div
    v-if="curClazzApply.componentName"
    :key="curClazzApply.componentName"
    class="worksheet-wrap"
  >
    <worksheet-apply-header
      @is-click="isClick"
    />

    <components
      :is="curClazzApply.componentName"
      ref="currentBody"
    />

    <!-- 이미지 상세보기 -->
    <image-view
      v-if="imageView.isOpen"
      :item="$comn.isImage(imageView.items, 'both')"
      :imgIndex="imageView.index"
    />

    <worksheet-apply-info
      v-if="$store.state.storeWorksheet.worksheetApplyInfo.isOpen"
    />

  </div>
</template>

<script>
import '@/assets/css/worksheets.scss'

import {mapFields} from "vuex-map-fields"
import {mapActions, mapGetters, mapState} from "vuex"
import {eventBus} from "@/main"

import WorksheetApplyHeader from "@/apps/worksheetApply/header/WorksheetApplyHeader.vue"
import WorksheetApplyDetail from '@/apps/worksheetApply/WorksheetApplyDetail.vue'
import WorksheetApplyCreate from '@/apps/worksheetApply/WorksheetApplyCreate.vue'
import WorksheetApplyModify from '@/apps/worksheetApply/WorksheetApplyModify.vue'

import HcSelect from "@/components/Form/HcSelect.vue"
import ImageView from '@/components/Viewer/ImageViewer.vue'
import WorksheetApplyInfo from "@/components/Modal/WorksheetApplyInfo.vue"


export default {
  name: "worksheet-apply",
  components: {
    WorksheetApplyInfo,
    ImageView,
    WorksheetApplyModify,
    WorksheetApplyDetail,
    WorksheetApplyCreate,
    WorksheetApplyHeader,
    HcSelect
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState({
      docView: 'docView',
      imageView: 'imageView',
      user: 'user',
    }),
    ...mapGetters({
      CONSTANTS: 'CONSTANTS',
    }),
    ...mapGetters('storeWorksheet', {
      clazzApplyComponentsByCode: 'clazzApplyComponentsByCode'
    }),
    ...mapFields({
      isDimLoading: 'isDimLoading',
      notSupportedBrowser: 'notSupportedBrowser'
    }),
    ...mapFields('storeWorksheet', {
      curClazzApply: 'curClazzApply',
      worksheetApplyInfo: 'worksheetApplyInfo',
    }),
    isCheckRejectReason() {
      return this.curClazzApply.model.applyStatus === 'REJECT'
    },
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$log.debug(to, from)

      // 워크시트 에디터 답변 입력 후 다시 신청서 작성하기 화면으로 진입하면 제출 내역 목록으로 이동
      if (from.path.includes('/worksheetApply')) {
        const parentId = vm.$route.params.parentId
        vm.$router.push(`/main/clazzes/${parentId}/form`, () => {})
      }
    })
  },

  async created() {
    this.isDimLoading = true

    if (this.$comn.isIE()) {
      this.notSupportedBrowser.isOpen = true
      this.notSupportedBrowser.pageName = 'worksheetCreate'

    } else {
      const currentUserId = this.$store.state.user.currentId || localStorage.getItem('uuid')
      if (!this.curClazzApply.model.userId) {
        // this.curClazzApply.model.userId 인 경우는 신청서 작성할 때
        this.curClazzApply.model.userId = currentUserId
      }
      this.curClazzApply.model.classId = this.$route.params.parentId
      this.curClazzApply.model.sheetId = this.$route.params.sheetId

      let isApplyDeleted = false;
      try {
        isApplyDeleted = await this.checkCurClazzApply()
      } catch {
        const payload = {
          classId: this.$route.params.parentId,
          sheetId: this.$route.params.sheetId,
          applyId: this.$route.params.applyId
        }
        isApplyDeleted = await this.initCurClazzApply(payload)
      }

      if (isApplyDeleted === false) {
        return;
      }

      if (!this.curClazzApply.componentName) {
        this.curClazzApply.componentName = this.$route.params.applyId
          ? this.clazzApplyComponentsByCode({code: this.CONSTANTS.WORKSHEET_APPLY.DETAIL}).name
          : this.clazzApplyComponentsByCode({code: this.CONSTANTS.WORKSHEET_APPLY.CREATE}).name
      }

      if (this.$route.query.isEdit) {
        if (this.$route.query.isEdit === 'true') {
          this.curClazzApply.componentName = this.clazzApplyComponentsByCode({code: this.CONSTANTS.WORKSHEET_APPLY.MODIFY}).name
        }
        this.$router.replace({'isEdit': null})
      }

      await this.initCurClazzApplyClassSubscribe({
        userId: currentUserId,
        classId: this.curClazzApply.model.classId,
      })

    }
  },
  mounted() {
    eventBus.$on('worksheet-apply-saveProc', () => {
      this.saveProc()
    })
    this.isDimLoading = false
    this.$hiClass.toggleBodyClass('add', 'worksheet')
  },
  beforeDestroy() {
    eventBus.$off('worksheet-apply-saveProc')

    this.clearCurClazzApply()

    this.$hiClass.toggleBodyClass('remove', 'worksheet')
  },
  methods: {
    ...mapActions({
      openClazzApplyRejectList: 'openClazzApplyRejectList',
      callClazzApplyConfirmPush: 'callClazzApplyConfirmPush',
    }),
    ...mapActions('storeWorksheet', {
      clearCurClazzApply: 'clearCurClazzApply',
      checkCurClazzApply: 'checkCurClazzApply',
      initCurClazzApply: 'initCurClazzApply',
      initCurClazzApplyClassSubscribe: 'initCurClazzApplyClassSubscribe',
    }),
    isClick(buttonType) {
      switch (buttonType) {
        case this.CONSTANTS.BUTTON.SAVE: {
          if (this.curClazzApply.isMemberRoleManager && this.isCheckRejectReason) {
            this.checkRejectReason()
            return false
          }
          this.saveProc()
          break
        }
        case this.CONSTANTS.BUTTON.UPDATE: {
          // 학부모가 확인요청 건 수정 시 담당교사 확인상태 초기화
          !this.curClazzApply.isMemberRoleManager && this.curClazzApply.model.applyStatus === 'REJECT'
            ? this.curClazzApply.model.applyStatus = 'UNIDENTIFIED'
            : false

          this.curClazzApply.componentName = this.clazzApplyComponentsByCode({code: this.CONSTANTS.WORKSHEET_APPLY.MODIFY}).name
          break
        }
        case this.CONSTANTS.BUTTON.REJECT_REASON: {
          this.$hiClass.alert('확인요청 사유 버튼 클릭!')
          break
        }
        case this.CONSTANTS.BUTTON.PRINT: {
          this.callEventToFrame('doPrint')
          break
        }
        case this.CONSTANTS.BUTTON.PDF_DOWNLOAD: {
          this.callEventToFrame('doPdfDownload')
          break
        }

      }
    },

    saveProc() {
      if (this.$refs.currentBody && this.$refs.currentBody.save)
        this.$refs.currentBody.save(this.CONSTANTS.BUTTON.COMPLETE)

      if (this.isCheckRejectReason) {
        this.callClazzApplyConfirmPush({
          applyId: this.$route.params.applyId
        })
      }
    },

    callEventToFrame(eventName) {
      const worksheetSubmitFrame = document.querySelector('#worksheetSubmitPage')
      if (worksheetSubmitFrame) {
        const payload = {
          to: 'worksheetSubmitPage',
          message: {
            name: eventName,
            dispatchEvent: 'call',
            applyInfo: {
              sheetTitle: this.curClazzApply.model.title,
              studentName: this.curClazzApply.model.studentName,
              applyStatus: this.curClazzApply.model.applyStatus
            }
          }
        }
        worksheetSubmitFrame.contentWindow.postMessage(payload.message, '*')
      }
    },

    checkRejectReason() {
      // 담임 의견 추가 등록
      this.$log.debug(`this.isCheckRejectReason => `, this.isCheckRejectReason)

      const opts = {
        cancelButtonText: '그대로 저장',
        reverseButtons: true
      }
      this.$hiClass.confirm('담임 의견을 추가로 등록하시겠습니까?', null, opts)
        .then(() => {
          this.openClazzApplyRejectListPopup(this.CONSTANTS.CLAZZ_APPLY_REJECT_LIST.CREATE)
        })
        .catch(() => {
          this.saveProc()
        })
    },

    openClazzApplyRejectListPopup(mode) {
      const payload = {
        isOpen: true,
        isManager: this.curClazzApply.isMemberRoleManager,
        mode: mode,
        model: this.curClazzApply.model,
      }
      this.openClazzApplyRejectList(payload)
    }

  },

}
</script>

<style scoped>
.worksheet-form-title .required::after {
  content: "*";
  color: #ff6a6a;
}
</style>