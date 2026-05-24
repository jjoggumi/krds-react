/**
 * worksheet ws-worksheet-submit-init.js
 * ver 0.1
 * 2021. 10. 19
 */
$(document).ready(function () {
  
  // 모바일 스크롤 대응
  // $('body').css('overflow', 'scroll');
  
  // TODO: 워크시트 초기화
  if (!$("#quizIdx").val()) {
    // let testQuizIdx = '1013262'
    let errMsg = 'quizIdx is null !'  // + `\ninit ${testQuizIdx} worksheet`
    
    try {
      const quizIdx = getParam('quizIdx')
      
      if (quizIdx)
        $("#quizIdx").val(quizIdx)
      else
        throw new Error(errMsg)
      
      $("#idToken").val(getParam('idToken'))
      $("#applyId").val(getParam('applyId'))
      $("#viewType").val(getParam('viewType'))
      
      // idToken 에 포함된 userId 추출
      const userId = extractUserIdFromToken($("#idToken").val())
      $("#userId").val(userId)
      
    } catch (e) {
      alert(e.message || errMsg)
      // $("#quizIdx").val(testQuizIdx)
    }
  }
  
  if ($("#quizIdx").val()) {
  
    try {
      $axios({
        url: apiUrl + "/sheets/" + $("#quizIdx").val(),
        method: 'GET',
        headers: { Authorization: 'Bearer ' + $("#idToken").val() },
      })
        .then(res => {
          const resData = res.data
          const sheetMedias = resData.sheetMedias.filter(data => data.mediaCd === 'ISIMG')
          const sheetTools = resData.sheetTools
          
          $("#classId").val(resData.parentId)
          $("#totalPages").val(sheetMedias.length)
          
          // create component
          Vue.component('quiz-worksheet-vo', {
            template: `
              <div>
                <template
                  v-for="(item, index) of sheetMedias"
                >
                  <div
                    :key="index"
                    :data-page-index="index + 1"
                    class="editor-layer"
                    :class="{
                        ['editor-seq-' + (index + 1)]: true
                      }"
                    style="width:990px;height:1152px;background-size: contain; background-position:center center; background-repeat: no-repeat"
                    :style="getBgImageStyle(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1152 990" height="1152" width="990"></svg>
                    <div class="content-layer"></div>
                  </div>

                  <br>
                  
                </template>
              </div>
            `,
            data() {
              return {
                sheetMedias: sheetMedias
              }
            },
            methods: {
              getBgImageStyle(item) {
                return `background-image: url('${item.filePath}')`
              }
            }
          })
          
          // init Vue
          new Vue({
            el: '#quizWorksheetVO',
            async mounted() {
              await initCurUserClazzSubscribeView($("#classId").val(), $("#userId").val())
              getWorksheetToolList(sheetTools, $("#applyId").val())
            },
            render(createElement, /*context*/) {
              return createElement('quiz-worksheet-vo')
            }
          })
          
        })
    } catch (e) {
      console.warn(e)
    }
    
  }
  // -- 초기화
});

/**
 * 워크시트 저작도구 불러오기
 */
async function getWorksheetToolList(sheetTools, applyId) {
  console.log('61405 work-sheet-loading-error start ================')
  console.log('61405 work-sheet-loading-error applyId: ', applyId)
  objectArr = sheetTools
  
  const viewType = $("#viewType").val()
  let answerOption = 'a' // 수정 가능
  
  try {
    // 초기화시 신청서 정보가 있을 경우, 신청서 정보 가져오기
    if (applyId) {
      isReadonly = viewType !== 'modify'
      answerOption = isReadonly ? 's' : 'a'
      
      getClassApply(applyId)
        .then(async data => {
          applyUserId = data.userId
          renderingAll(objectArr, answerOption)
          // 라디오 시트 넘버 추가 (박종철)
          renderingAnswerHiClass(data.sheetResponses, sheetTools)
          renderingAnswerValidateHiClass(objectArr, data.sheetResponses)
          initExistsSignObj(objectArr)
          await initApplyUserSign(data.applyUser)

          console.log('61405 work-sheet-loading-error applyStatus: ', data.applyStatus)
          switch (data.applyStatus) {
            case 'COMPLETE': {
              await initApprovalUserSign(data.approvalUser)
              break
            }
            case 'REJECT': {
              await initRejectApprovalSign()
              break
            }
          }
  
          await checkExistsSignObj('esign')
            .then(() => {
              isReadyApproval = true
              // console.log('신청서 전자서명 완료되어 승인 가능한 상태', 'isReadyApproval', isReadyApproval)
              console.log('61405 work-sheet-loading-error 신청서 전자서명 완료되어 승인 가능한 상태')
            })
            .catch((e) => {
              // console.warn('신청서 전자서명이 없어 승인 불가능한 상태', 'isReadyApproval', isReadyApproval)
              console.log('61405 work-sheet-loading-error 신청서 전자서명이 없어 승인 불가능한 상태')
            })
        })
        .catch(err => {
          console.log('61405 work-sheet-loading-error getClassApply() name: ', err.name)
          console.log('61405 work-sheet-loading-error getClassApply() message: ', err.message)
          console.log('61405 work-sheet-loading-error getClassApply() stack: ', err.stack)
        })
        .finally(() => {
          // 로딩 제거
          setIsPageLoadComplete(true)
          console.log('61405 work-sheet-loading-error end ================')
        })
      
    } else {
      // 초기화시 신청서 정보가 없을 경우, 양식만 가져오기
      renderingAll(objectArr, answerOption)
      renderingAnswerValidateHiClass(objectArr, null)
      initExistsSignObj(objectArr)

      const applyUser = {
        userId: $("#userId").val()
      }
      await initApplyUserSign(applyUser)

      setIsPageLoadComplete(true)
      console.log('61405 work-sheet-loading-error end ================')
    }
  } catch (err) {
    console.log('61405 work-sheet-loading-error getWorksheetToolList() name: ', err.name)
    console.log('61405 work-sheet-loading-error getWorksheetToolList() message: ', err.message)
    console.log('61405 work-sheet-loading-error getWorksheetToolList() stack: ', err.stack)
  }
}

function getClassApply(applyId) {
  const url = apiUrl + `/v2/clazzApplies/${applyId}`
  return $axios({
    method: 'GET',
    url: url,
    headers: {
      Authorization: 'Bearer ' + $("#idToken").val()
    }
  })
    .then(res => res.data)
    .catch(err => {
      throw new Error(err)
    })
}

function getUserSign(userId) {
  const requestObject = {
    method: 'GET',
    url: `${apiUrl}/userSign/${userId}`,
    headers: {
      Authorization: `Bearer ${$("#idToken").val()}`
    }
  }
  
  return $axios(requestObject)
    .then(res => res.data)
    .catch(err => {
      throw new Error(err)
    })
}

// 특정 요소 포함여부 확인
function existsToolCdFromObjectArr(objectArr, toolCd) {
  return !!(objectArr.find(object => object.toolCd === toolCd))
}

// ie 호환성을위해 변경
function getParam(name) {
  var curr_url = location.search.substr(location.search.indexOf("?") + 1);
  var svalue = "";
  var temp = "";
  curr_url = curr_url.split("&");
  for (var i = 0; i < curr_url.length; i++) {
    temp = curr_url[i].split("=");
    if ([temp[0]] == name) {
      svalue = temp[1];
    }
  }
  return svalue;
}

// idToken 에 포함된 userId 추출
function extractUserIdFromToken(idToken) {
  let userId = ''
  
  try {
    const decoded = window.jwt_decode(idToken)
    userId = decoded.uuid
  
    console.log('extractUserIdFromToken()', decoded, userId)
  } catch (e) {
    console.warn(e)
  }
  
  return userId
}

// 양식에 서명 포함여부 확인
function initExistsSignObj(objectArr) {
  existsSignObj.esign = existsToolCdFromObjectArr(objectArr, 'esign')
  existsSignObj.approvalsign = existsToolCdFromObjectArr(objectArr, 'approvalsign')
}

// 신청서 제출자 전자서명 초기화
async function initApplyUserSign(applyUser, reloadSign) {
  const initApplyUserSignProc = async (applyUser) => {
    console.log('61405 work-sheet-loading-error initApplyUserSign() userSignImagePath: ', applyUser.userSignImagePath, ', initApplyUserSignType: ', initApplyUserSignType)
    if (applyUser.userSignImagePath) {
      // eslint-disable-next-line no-undef
      applyUserSignObject = applyUser
    } else if (applyUser.userId) {
      // eslint-disable-next-line no-undef
      applyUserSignObject = await getUserSign(applyUser.userId)
    }
  }
  const initUserId = applyUserId || null
  let initApplyUserSignType = ''

  if (!initUserId) {
    initApplyUserSignType = 'CREATE'
  } else if (initUserId && reloadSign) {
    initApplyUserSignType = 'RELOAD'
  } else {
    initApplyUserSignType = 'UPDATE'
  }

  switch (initApplyUserSignType) {
    case 'CREATE':
    case 'UPDATE': {
      await initApplyUserSignProc(applyUser)
      break
    }
    case 'RELOAD': {
      const changedUserId = applyUser.userId

      // 제출자 본인인 경우에만 변경
      if (initUserId === changedUserId)
        await initApplyUserSignProc(applyUser)
      break
    }
  }

  await renderingAllUserSign(objectArr, applyUserSignObject)
}

// 신청서 승인자 결재서명 초기화
async function initApprovalUserSign(approvalUser) {
  if (approvalUser.userApprovalSignImagePath)
    approvalUserSignObject = approvalUser
  else if (approvalUser.userId)
    approvalUserSignObject = await getUserSign(approvalUser.userId)
  
  await renderingAllApprovalSign(objectArr, approvalUserSignObject)
}

async function setApprovalUserSign(approvalUser) {
  if (approvalUser.userId)
    approvalUserSignObject = await getUserSign(approvalUser.userId)
}

// 미확인 서명 초기화
async function initUnidentifiedApprovalSign() {
  $(objectArr).each(function(idx, data){
    if (data.toolCd === 'approvalsign')
      renderingUnidentifiedSign(this, data);
  });
}

// 확인요청 도장 초기화
async function initRejectApprovalSign() {
  $(objectArr).each(function(idx, data){
    if (data.toolCd === 'approvalsign')
      renderingRejectSign(this);
  });
}

function setIsPageLoadComplete(value) {
  isPageLoadComplete = value
  
  const isDimLoading = !value
  toggleParentDimLoading(isDimLoading)
}

// 부모창 dimLoading control
function toggleParentDimLoading(value) {
  const message = {
    command: 'toggle-dim-loading',
    value: value
  }
  console.log('61405 work-sheet-loading-error toggleParentDimLoading() message: ', JSON.stringify(message))
  if (window.parent)
    window.parent.postMessage(message, '*');
}

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