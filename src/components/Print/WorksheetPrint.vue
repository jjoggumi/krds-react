<!--
@File(Method): WorksheetPrint.vue
@Description: 학교양식신청서 인쇄/다운로드
              기존에는 워크시트 인쇄만하는 컴포넌트 였으나 하이클래스 양식 인쇄, pdf 다운로드까지 가능하도록 변경되면서 인쇄/다운로드, 워크시트/하이클래스 양식 모두 동작하게 변경
@Modified: #74580 학교양식 신청서 일괄 저장/인쇄/저장후 즉시 출력
-->
<template>
  <fragment>
    <iframe
        v-if="option.isSelectedSheetLoadComplete"
        id="worksheetPrintPage"
        ref="worksheetPrintPage"
        :src="iframeSrc"
        @load="onLoadIframe"
        style="border: 0;"
        :style="iframeStyle"
    ></iframe>

    <div v-if="shouldRenderHiClassSheets">
      <application-export-view
          v-for="hiclassSheet of hiclassSheets"
          :key="hiclassSheet.currentId"
          :clazzApply="hiclassSheet"
          :isManager="true"
          :clazz="clazzes"
          style="visibility: hidden;"
      />
    </div>
  </fragment>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import {mapFields} from 'vuex-map-fields'
import {eventBus} from '@/main'
import ApplicationExportView from "@/components/ClazzApplication/form/ApplicationExportView.vue";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import jszip from "jszip";

export default {
  name: "worksheet-print",
  props: {
    isPC: {
      type: Boolean,
      default: true
    },
    selectedItemApplyIds: {
      type: Array,
      required: true
    }
  },
  components: {
    ApplicationExportView
  },
  data() {
    return {
      option: {
        isSelectedSheetLoadComplete: false
      },
      selectedApplications: [],
      selectedSheetObj: {},
      errorCount: 0,
      hiclassSheets: [],
      shouldRenderHiClassSheets: false
    }
  },
  computed: {
    ...mapFields(['isDimLoading']),
    ...mapFields('storeWorksheet', ['currentIframe', 'worksheetPrint']),
    ...mapState('storeClazzes', ['clazzes']),
    isVisibleHeader() {
      return false
    },
    iframeSrc() {
      const params = {
        ver: '20251103'
      }
      return '/module/worksheet/make/quizWorksheetPrintPage.html' + '?' + this.$qs.stringify(params)
    },
    iframeStyle() {
      const style = {
        visibility: 'hidden'
      }

      if (!this.isVisibleHeader && !this.isPC) {
        style['height'] = 'calc(100vh)'
      }

      return style
    }
  },
  watch: {
    $route(to, from) {
      // 프린트 시작 후 페이지 이동이 발생하면 인쇄 처리 중단
      if (to.path !== from.path) {
        this.$hiClass.alert('인쇄 처리가 중단되었습니다.', 'error')
        this.close()
      }
    },
    selectedItemApplyIds(val) {
      if (val.length !== 0) {
        this.$log.debug('watch trigger | selectedItemApplyIds')
        this.getSelectedItemsDetail()
      }

    }

  },
  created() {
    const keys = ['idToken']
    this.setQuery(keys)
  },
  mounted() {
    this.getSelectedItemsDetail()

    window.addEventListener('message', this.handleWorksheetIframeTask)

    // 인쇄 인터페이스에서 파일명 정의
    document.title = `하이클래스 학교 양식 신청서 - ${this.$moment().format('YYYYMMDD_HHmmss')}`
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleWorksheetIframeTask)
    this.initIframes()
    this.isDimLoading = false

    eventBus.$emit('clazz-apply-close-export-mode')

    // 인쇄 인터페이스에서 파일명 삭제
    document.title = `hiClass`
  },
  methods: {
    ...mapActions('storeWorksheet', ['loadedWorksheetIframe','initIframes','sendMessageToFrame']),
    setQuery(keys) {
      for (const key of keys) {
        if (this.$route.query[key] !== undefined)
          localStorage.setItem(key, this.$route.query[key])
      }
    },
    close() {
      this.worksheetPrint.selectedItemApplyIds = []
      this.worksheetPrint.isOpen = false
      this.worksheetPrint.mode = ''
    },
    goto(name) {
      if (name === 'home')
        this.$router.push('/')
      else if (name === 'back')
        this.$router.back()
    },
    async handleWorksheetIframeTask(e) {
      try {
        if (e.data !== null && e.data !== undefined && e.data !== '') {

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
            return
          }

          // dim loading toggle
          if (e.data.command === 'toggle-dim-loading') {
            this.isDimLoading = e.data.value
            return
          }

          if (e.data.command === 'page-load-complete') {
            this.initSelectedItems()
            return
          }

          if (e.data.command === 'close-print-page') {
            this.close()
            // return
          }

          if (e.data.command === 'download-pdf') {
            await this.downloadPdf()
            this.close()
          }

        }

      } catch (e) {
        this.$log.debug(e)
      }

    },
    onLoadIframe() {
      // print iframe 이 완전히 로드되기 전까지 전체화면 로딩 처리
      this.isDimLoading = true

      const name = 'worksheetPrintPage'
      const payload = {
        name,
        data: this.$refs[name],
        authentication: this.$authentication.load()
      }
      this.loadedWorksheetIframe(payload)
    },

    /**
     * 선택한 신청서 상세정보 요청
     * @return {Promise<void>}
     */
    async getSelectedItemsDetail() {
      this.selectedApplications.splice(0)

      try {
        const res = await this.$hiClass.clazzApplies.readList({ clazzApplyIds: this.selectedItemApplyIds })
        let clazzApplies = res.data._embedded.clazzApplies
        if (clazzApplies.length > 0) {
          clazzApplies.sort(function(a, b) {
            // 제출일 내림차순 정렬
            return b.applyTimestamp - a.applyTimestamp
          })
          this.selectedApplications.push(...clazzApplies)
        }
        await this.getSelectedSheet()
      } catch (e) {}
    },

    /**
     * 선택한 신청서의 양식 요청
     * @return {Promise<void>}
     */
    async getSelectedSheet() {
      this.selectedApplications.forEach(item => {
        // sheetId 는 고유하지 않으므로 applyId 를 key 로 사용
        this.selectedSheetObj[item.currentId] = {}
      })

      const sheetIds = this.selectedApplications
          .filter(item => item.sheetType === 'W')
          .map(item => item.sheetId)
          .filter((item, index, self) => self.indexOf(item) === index)

      try {
        const res = await this.$hiClass.sheets.readList({ sheetIds })
        const sheet = res.data._embedded?.sheet ? res.data._embedded.sheet : []

        for (const item of this.selectedApplications) {
          this.selectedSheetObj[item.currentId] = {
            ...sheet.find(s => s.sheetId === item.sheetId),
            sheetId: item.sheetId,
            applyId: item.currentId,
            applyType: item.applyType,
            title: item.title,
            studentName: item.studentName
          }

          if (item.sheetType === 'H') {
            this.hiclassSheets.push(item)
            this.selectedSheetObj[item.currentId].imageDataUrl = ''
          }
        }

      } finally {
        if (this.hiclassSheets.length > 0) {
          this.shouldRenderHiClassSheets = true

          await this.$nextTick()

          let imageDataUrlArr = []
          // html -> canvas -> image
          for (let printDiv of document.querySelectorAll('.print-div')) {
            const canvas = await html2canvas(printDiv, {
              useCORS: true,
              scale: 2
            })
            const resultImage = canvas.toDataURL("image/png")
            imageDataUrlArr.push({ applyId: printDiv.dataset.applyId, imageDataUrl: resultImage })
          }

          await this.setExportedImage(imageDataUrlArr)
        } else {
          await this.checkPrintPage()
        }
      }
    },

    async setExportedImage(imageDataUrlArr) {
      this.shouldRenderHiClassSheets = false

      for (let imageDataUrlItem of imageDataUrlArr) {
        this.selectedSheetObj[imageDataUrlItem.applyId].imageDataUrl = imageDataUrlItem.imageDataUrl
      }

      await this.checkPrintPage()
    },

    async checkPrintPage() {
      const printCount = await this.getPrintCount()
      if (printCount >= 500) {
        this.$hiClass.alert(`인쇄하려는 페이지 부수는 <span style="color: crimson">${printCount}</span> 페이지입니다.<br>500 페이지 미만으로 조정해주세요.`, 'error')
            .then(() => {
              this.selectedSheetObj = {}
              this.isDimLoading = false
            })
      } else {
        this.option.isSelectedSheetLoadComplete = true
      }
    },

    // 인쇄 페이지 부수 확인
    getPrintCount() {
      let printCount = 0

      return new Promise(resolve => {
        const newSelectedSheetArr = Object.values(this.selectedSheetObj).map(item => {
          return {
            sheetId: item.sheetId,
            // 하이클래스 양식은 sheetMedia 가 없으므로 1페이지로 판단
            sheetMediasCount: item.sheetMedias ? item.sheetMedias.filter(data => data.mediaCd === 'ISIMG').length : 1
          }
        })

        this.selectedApplications.map(applyItem => {
          const findSheet = newSelectedSheetArr.find(sheetItem => sheetItem.sheetId === applyItem.sheetId)
          printCount = printCount + findSheet.sheetMediasCount
        })
        resolve(printCount)
      })
    },

    /**
     * worksheet iframe 으로 selectedApplications 전달, 렌더링, 프린트
     */
    initSelectedItems() {
      if (this.errorCount > 10) {
        this.$hiClass.alert('오류가 발생하였습니다.<br>잠시 후 다시 시도해주세요.', 'warning')
          .then(() => {
            this.isDimLoading = false
            this.close()
          })
        return false
      }

      // iframe 로딩 되지 않을 경우 재시도
      if (!this.currentIframe) {
        this.errorCount++
        setTimeout(() => {
          this.initSelectedItems()
        }, 200)
        return false
      }

      const payload = {
        to: this.currentIframe,
        message: {
          name: 'initPrintItem',
          dispatchEvent: 'call',
          selectedItems: this.selectedApplications,
          selectedSheetObj: this.selectedSheetObj,
          mode: this.worksheetPrint.mode
        },
      }
      this.sendMessageToFrame(payload)
      this.option.isInitSelectedItems = true
    },

    async downloadPdf() {
      const iframe = document.querySelector('#worksheetPrintPage')
      const editorLayers = iframe.contentWindow.document.querySelectorAll('.editor-layer')
      const applyIds = Array.from(editorLayers).map(el => el.dataset.applyId).filter((val, index, self) => self.indexOf(val) === index)

      if (applyIds.length > 1) { // 신청서 여러개 선택
        const zip = new jszip()
        let savedFileNames = []

        for (let i = 0; i < applyIds.length; i++) { // 신청서별 pdf 생성
          const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
          const pages = Array.from(editorLayers).filter(al => al.dataset.applyId === applyIds[i]) // 해당 신청서의 전체 페이지 배열
          let { title, studentName, isHiclassSheet, isAbsent } = pages[0].dataset
          if (!studentName || studentName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '').length === 0) {
            studentName = '학생 이름 없음'
          }

          for (let i = 0; i < pages.length; i++) {
            if (i > 0) { pdf.addPage() }
            const page = pages[i]
            await this.addImageToPdfPage(page, pdf, isHiclassSheet, isAbsent)
          }

          const pdfBlob = pdf.output('blob')

          // 파일명이 중복이면 (2), (3) ... 형태로 변경
          let fileName = `${title}_${studentName}`
          savedFileNames.push(fileName)
          if (savedFileNames.filter(savedFileName => savedFileName === fileName).length > 1) {
            fileName = `${fileName} (${savedFileNames.filter(savedFileName => savedFileName === fileName).length})`
          }

          zip.file(`${fileName}.pdf`, pdfBlob)
        }

        // zip 다운로드
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, `${this.clazzes.className}_학교양식신청서_${this.$moment().format('YYYY-MM-DD HH-mm-ss')}.zip`)

      } else {
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
        let { title, studentName, isHiclassSheet } = editorLayers[0].dataset
        if (!studentName || studentName.replace(/[^A-Za-z0-9\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '').length === 0) {
          studentName = '학생 이름 없음'
        }

        for (let i = 0; i < editorLayers.length; i++) {
          if (i > 0) { pdf.addPage() }
          const page = editorLayers[i]
          await this.addImageToPdfPage(page, pdf, isHiclassSheet)
        }

        pdf.save(`${title}_${studentName}.pdf`)
      }
    },

    async addImageToPdfPage(page, pdf, isHiclassSheet, isAbsent) {
      // textarea 개행문자 치환
      const textAreaArr = page.querySelectorAll('textarea')
      for (let i = 0; i < textAreaArr.length; i++) {
        const div = document.createElement('div')
        div.innerHTML = textAreaArr[i].value.replace(/\n/g, '<br>')
        div.style.cssText = textAreaArr[i].style.cssText
        div.style.backgroundColor = 'rgba(255, 255, 255, 0)'
        div.style.lineHeight = '1.15'
        div.style.letterSpacing = '-1px'
        div.style.whiteSpace = 'pre-wrap'
        textAreaArr[i].replaceWith(div)
      }

      const canvas = await html2canvas(page, { useCORS: true, scale: 1, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pageWidth  = pdf.internal.pageSize.getWidth()
      const pageHeight  = pdf.internal.pageSize.getHeight()

      const imgWidth = canvas.width
      const imgHeight = canvas.height

      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
      const newWidth = imgWidth * ratio
      const newHeight = imgHeight * ratio

      const scaleFactor = isHiclassSheet ? (isAbsent ? 0.95 : 1) : 1.17
      const scaledWidth = newWidth * scaleFactor
      const scaledHeight = newHeight * scaleFactor

      const x = (pageWidth - scaledWidth) / 2
      const y = (pageHeight - scaledHeight) / 2

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)
    }
  }
}
</script>

<style scoped>

</style>