/**
 * worksheet ws-worksheet-print-init.js
 * ver 0.1
 * 2021. 12. 01
 */
$(document).ready(function () {
  
  // 최초 초기화 데이터 요청
  sendPageLoadComplete()
});

/**
 * 워크시트 저작도구 불러오기 and 신청서 정보 가져오기
 */
async function getWorksheetToolList() {
    const answerOption = 's' // 읽기 전용
    const signToolCds = ['esign', 'approvalsign']
  
    try {
      // 신청서 정보 가져오기
      for (const data of selectedItems) {
        const applyId = data.currentId
        const applyUser = data.applyUser
        const approvalUser = data.approvalUser
        const sheetResponses = data.sheetResponses
  
        // eslint-disable-next-line no-undef
        const objArr = objectArrWithApplyId[applyId]
        const duplicateSignPages = objArr.map(o => {
          if (signToolCds.includes(o.toolCd))
            return o.sheetPage
          else
            return -1
        })
        const duplicateSheetPages = objArr.map(o => {
          if (!signToolCds.includes(o.toolCd))
            return o.sheetPage
          else
            return -1
        })
  
        const signPages = Array.from(new Set(duplicateSignPages)).filter(sheetPage => sheetPage !== -1)
        const sheetPages = Array.from(new Set(duplicateSheetPages)).filter(sheetPage => sheetPage !== -1)
  
        console.log('sheetResponses type', sheetResponses, Array.isArray(sheetResponses));
        console.log('objArr isArray', Array.isArray(objArr), objArr?.length);
        console.log('sheetPages', sheetPages);


        // 전체 요소 렌더링
        // eslint-disable-next-line no-undef
        await renderingAll(objArr, answerOption)
        
        // 전체 요소의 응답 렌더링
        // eslint-disable-next-line no-undef
        await renderingAnswerHiClassWithSheetPages(sheetResponses, objArr, sheetPages)
        
        // 요소 중 서명 유무 체크
        await initExistsSignObj(objArr)
        
        // 전자서명 렌더링
        await initApplyUserSign(objArr, applyUser, signPages)
        
        // 결재서명 렌더링
        switch (data.applyStatus) {
          case 'COMPLETE': {
            if (approvalUser)
              await initApprovalUserSign(objArr, approvalUser, signPages)
            else
              await hideApprovalUserSigns(objArr, signPages)
            break
          }
          default: {
            await hideApprovalUserSigns(objArr, signPages)
          }
        }
      }
  
      return true
      
    } catch (e) {
      console.warn('getWorksheetToolList() e => ', e)
      throw e
    }
}

// 특정 요소 포함여부 확인
function existsToolCdFromObjectArr(objectArr, toolCd) {
  return !!(objectArr.find(object => object.toolCd === toolCd))
}

// 양식에 서명 포함여부 확인
function initExistsSignObj(objectArr) {
  // eslint-disable-next-line no-undef
  existsSignObj.esign = existsToolCdFromObjectArr(objectArr, 'esign')
  
  // eslint-disable-next-line no-undef
  existsSignObj.approvalsign = existsToolCdFromObjectArr(objectArr, 'approvalsign')
}

// 신청서 제출자 전자서명 초기화
async function initApplyUserSign(objArr, applyUser, signPages) {
  if (applyUser.userSignImagePath) {
    // eslint-disable-next-line no-undef
    applyUserSignObject = applyUser
  }
  
  // eslint-disable-next-line no-undef
  await renderingAllUserSignWithSignPages(objArr, applyUserSignObject, signPages)
}

// 신청서 승인자 결재서명 초기화
async function initApprovalUserSign(objArr, approvalUser, signPages) {
  if (approvalUser.userApprovalSignImagePath) {
    // eslint-disable-next-line no-undef
    approvalUserSignObject = approvalUser
  }
  // eslint-disable-next-line no-undef
  await renderingAllApprovalSignWithSignPages(objArr, approvalUserSignObject, signPages)
}

// 결재서명 영역 숨김
async function hideApprovalUserSigns(objArr, signPages) {
  $(objArr).each(function(idx, data){
    if (data.toolCd === 'approvalsign' && signPages.includes(data.sheetPage)) {
      // eslint-disable-next-line no-undef
      hideApprovalUserSign(this, data.sheetPage);
    }
  });
}

// 최초 초기화 데이터 요청
function sendPageLoadComplete() {
  const message = {
    command: 'page-load-complete'
  }
  if (window.parent)
    window.parent.postMessage(message, '*');
}

// 부모창 dimLoading control
function toggleParentDimLoading(value) {
  const message = {
    command: 'toggle-dim-loading',
    value: value
  }
  if (window.parent)
    window.parent.postMessage(message, '*');
}

// eslint-disable-next-line no-unused-vars
function doSendDataToNative(command, messageType, resultCode) {
  const message = {
    name: 'sendDataToNative',
    payload: {
      command: command,
      messageType: messageType,
      resultCode: resultCode
    }
  }
  
  if (window.parent)
    window.parent.postMessage(message, '*');
  else
    alert(JSON.stringify(message.payload))
}

// eslint-disable-next-line no-unused-vars
function initSheet() {
  let sheetMedias = []
  // eslint-disable-next-line no-undef
  objectArrWithApplyId = {}   // 초기화
  
  // eslint-disable-next-line no-undef
  for (const clazzApply of selectedItems) {
    const sheetId = clazzApply.sheetId
    const applyId = clazzApply.currentId
    const sheetPageIndex = sheetMedias.length
  
    // eslint-disable-next-line no-undef
    const tmpSelectedSheet = _.cloneDeep(selectedSheetObj[applyId])
    let changedSheetTools = []
    
    if (tmpSelectedSheet.sheetTools) {
      changedSheetTools = tmpSelectedSheet.sheetTools.map(sheetTool => {
        sheetTool.sheetPage = sheetTool.sheetPage + sheetPageIndex
    
        if (sheetTool.exampleList.length > 0) {
          sheetTool.exampleList = sheetTool.exampleList.map(example => {
            example.sheetPage = example.sheetPage + sheetPageIndex
            return example
          })
        }
    
        return sheetTool
      })
    }
  
    // eslint-disable-next-line no-undef
    objectArrWithApplyId[applyId] = changedSheetTools

    // 워크시트
    if (tmpSelectedSheet.sheetMedias) {
      sheetMedias.push(
        ...tmpSelectedSheet.sheetMedias
          .filter(data => data.mediaCd === 'ISIMG')
          .map(data => ({...data, title: tmpSelectedSheet.title, studentName: tmpSelectedSheet.studentName, applyId: tmpSelectedSheet.applyId}))
      )
    }

    // 하이클래스 양식
    if (tmpSelectedSheet.imageDataUrl) {
      sheetMedias.push({
        filePath: tmpSelectedSheet.imageDataUrl,
        title: tmpSelectedSheet.title,
        studentName: tmpSelectedSheet.studentName,
        applyId: tmpSelectedSheet.applyId,
        applyType: tmpSelectedSheet.applyType
      })
    }
  }
  
  /**
   * create component
   */
  // eslint-disable-next-line no-undef
  Vue.component('quiz-worksheet-vo', {
    template: `
        <div>
          <template
            v-for="(item, index) of sheetMedias"
          >
            <div
              :key="index"
              :data-page-index="index + 1"
              :data-title="item.title"
              :data-student-name="item.studentName"
              :data-apply-id="item.applyId"
              :data-is-absent="item.applyType && item.applyType === 'ABSENT'"
              :data-is-hiclass-sheet="item.filePath.includes('base64')"
              class="editor-layer"
              :class="{
                  ['editor-seq-' + (index + 1)]: true,
                  'hi-class-sheet': item.filePath.includes('base64'),
                  'absent': item.applyType && item.applyType === 'ABSENT'
                }"
              style="width:990px;height:1152px;background-size: contain; background-position:center center; background-repeat: no-repeat"
              :style="getBgImageStyle(item)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1152 990" height="1152" width="990"></svg>
              <div class="content-layer"></div>

              <!-- bg image onload count 를 위한 마크업 -->
              <img
                :src="item.filePath"
                alt=""
                style="display: none;"
                @load="onLoadBgImage(item.filePath)"
                @error="onErrorBgImage(item.filePath)"
              >
            </div>

            <br>

          </template>
        </div>
      `,
    data() {
      return {
        count: {
          totalSignImage: 0,
          loadedSignImage: 0,
          loadSignRetry: 0,
        },
        sheetMedias: [],
        loadedBgImageFilePaths: [],
        errorBgImageFilePaths: [],
        isImageErrorAlertOpen: false
      }
    },
    computed: {
      totalBgImageCount() {
        return this.sheetMedias.length
      },
      loadedBgImageCount() {
        return this.loadedBgImageFilePaths.length
      },
      errorBgImageCount() {
        return this.errorBgImageFilePaths.length
      },
    },
    watch: {
      loadedBgImageCount(val) {
        if (val === this.totalBgImageCount) {
          this.initTotalSignImageLength()
  
          this.timer = setInterval(() => {
            this.initLoadedSignImageLength()
            console.log(`timer setInterval ...`, this.timer)
          }, 300)
        }
      },
      errorBgImageCount(val) {
        if (val > 0 && !this.isImageErrorAlertOpen) {
          this.isImageErrorAlertOpen = true
          const initErrMsg = '인쇄(다운로드)가 작동하지 않으시나요?\n\n사용 중인 브라우저 환경이나 확장 프로그램에 따라 기능이 제한될 수 있습니다.\n다시 시도해 보시거나, 확장 프로그램을 꺼두신 뒤 이용해 주세요.'
          alert(initErrMsg)
      
          this.closePrint()
        }
      },
      'count.loadSignRetry'(val) {
        if (val > 10) {
          const initErrMsg = '신청서 일괄 인쇄를 실패하였습니다.\n잠시 후 다시 시도해 주세요.'
          alert(initErrMsg)
          
          this.closePrint()
        }
      },
    },
    created() {
      this.sheetMedias = sheetMedias
    },
    mounted() {},
    methods: {
      getBgImageStyle(item) {
        return `background-image: url('${item.filePath}')`
      },
      onLoadBgImage(filePath) {
        this.loadedBgImageFilePaths.push(filePath)
      },
      onErrorBgImage(filePath) {
        this.errorBgImageFilePaths.push(filePath)
      },
      initTotalSignImageLength() {
        const totalSignImages = document.querySelectorAll(`div.esign-layer.layer > div > img`)
        this.count.totalSignImage = totalSignImages.length
        console.log(`this.count.totalSignImage => `, this.count.totalSignImage)
      },
      initLoadedSignImageLength() {
        const loadedSignImages = document.querySelectorAll(`div.esign-layer.layer > div > img.loaded`)
        this.count.loadedSignImage = loadedSignImages.length
        console.log(`this.count.loadedSignImage => `, this.count.loadedSignImage)
        
        this.checkLoadedSignImageLength()
      },
      checkLoadedSignImageLength() {
        if (this.count.totalSignImage === this.count.loadedSignImage) {
          clearInterval(this.timer)

          if (mode === 'print') {
            const textAreaArr = window.document.body.querySelectorAll('textarea')
            for (let i = 0; i < textAreaArr.length; i++) {
              textAreaArr[i].style.height = textAreaArr[i].scrollHeight + 'px'
              const div = document.createElement('div')
              div.innerHTML = textAreaArr[i].value.replace(/\n/g, '<br>')
              div.style.cssText = textAreaArr[i].style.cssText
              div.style.backgroundColor = 'rgba(255, 255, 255, 0)'
              div.style.lineHeight = '1.15'
              div.style.letterSpacing = '-1px'
              div.style.whiteSpace = 'pre-wrap'
              textAreaArr[i].replaceWith(div)
            }

            window.print()
          } else {
            const message = {
              command: 'download-pdf'
            }
            if (window.parent)
              window.parent.postMessage(message, '*')
          }

        } else {
          this.count.loadSignRetry++
        }
      },
      closePrint() {
        toggleParentDimLoading(false)
  
        const message = {
          command: 'close-print-page'
        }
        if (window.parent)
          window.parent.postMessage(message, '*');
      },
      
    }
  })
  
  /**
   * init Vue
   */
  // eslint-disable-next-line no-undef
  new Vue({
    el: '#quizWorksheetVO',
    data() {
      return {
        mQuery: null
      }
    },
    mounted() {
      const initErrMsg = '신청서 일괄 인쇄를 실패하였습니다.\n잠시 후 다시 시도해 주세요.'

      // on afterprint cross browsing
      if (window.matchMedia) {
        this.mQuery = window.matchMedia('print')
        this.mQuery.addListener(mql => {
          if (!mql.matches) {
            const message = {
              command: 'close-print-page'
            }
            if (window.parent)
              window.parent.postMessage(message, '*');
          }
        })
      }
      
      this.$nextTick(async () => {
        await getWorksheetToolList()
          .then(() => {
            // bgImage & signImage load 후 프린트 처리
          })
          .catch(err => {
            console.warn(`initSheet() err => `, err)
            alert(initErrMsg)
            toggleParentDimLoading(false)
          })
          .finally(() => {})
      })
    },
    render(createElement, /*context*/) {
      return createElement('quiz-worksheet-vo')
    }
  })
  
  
}