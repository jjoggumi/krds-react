'use strict';

const asyncWaitFor = async (condition) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
      }
    }, 10);
  });
}

const promiseWithTimeout = (promise, timeout) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('timeout'));
    }, timeout);

    promise.then((value) => {
      clearTimeout(timer);
      resolve(value);
    }).catch((reason) => {
      clearTimeout(timer);
      reject(reason);
    });
  })
}

const tryToGetSheetFrame = async () => {
  try {
    await promiseWithTimeout(asyncWaitFor(() => document.querySelector('#worksheetSubmitPage')), 30 * 1000);
    return document.querySelector('#worksheetSubmitPage');
  } catch (e) {
    return null;
  }
}

window.addEventListener('message', handleSubmitIframeTask)

var WORKSHEET_MESSAGE_TYPE = {
  SHEET: 'SHEET',
  APPLY: 'APPLY'
}

var WORKSHEET_MESSAGE = {
  SHEET: {
    '00': 'validate success',
    '01': '입력하지 않은 항목이 있습니다.\n다시 확인 해주세요.',
    '02': '신청서 제출을 위해 전자서명이 필요합니다.\n전자서명을 등록해주세요.',
    '03': '잘못된 파라미터입니다.',
    '04': '해당 워크시트를 찾을 수 없습니다.',
    '05': '워크시트 로딩 중입니다.\n잠시 후 다시 시도해주세요.',
    '97': "결재가 완료되어 수정이 제한됩니다.\n현재 상태를 확인해 주세요.",
    '98': 'fail update applyStatus',
    '99': '서버 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.',
    '100': 'worksheet create/update success',
    '101': '전자서명 갱신 완료',
    '102': '결재서명 갱신 완료'
  },
  APPLY: {
    '00': 'validate success',
    '01': '미정',
    '02': '신청서를 결재하시려면 결재서명이 필요합니다.\n결재서명을 등록해주세요',
    '03': '잘못된 파라미터입니다.',
    '04': '해당 워크시트를 찾을 수 없습니다.',
    '05': '워크시트 로딩 중입니다.\n잠시 후 다시 시도해주세요.',
    '99': '서버 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.'
  }
}

var WORKSHEET_MESSAGE_RESPONSE = {
  SHEET: {
    resultCode: '00',
    message: WORKSHEET_MESSAGE.SHEET['00']
  },
  APPLY: {
    resultCode: '00',
    message: WORKSHEET_MESSAGE.APPLY['00']
  }
}



/*********************************************
 *
 * 1. APP 에서 javascript 호출
 *
 **********************************************/


// 저장 버튼 누르기 전
// - 필수 입력 값 체크
/**
 * 필수 입력 값 체크 call validateSheet()
 * 후 응답 전달 interface validateSheetResponse
 */
async function validateSheet() {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  
  var validateSheetFrame = await tryToGetSheetFrame()
  console.log(validateSheetFrame)
  if (!validateSheetFrame) {
    setResponse(messageType, '04')
    sendDataToNative('validateApplyResponse', getResponse(messageType))
    return
  }

  // iframe 내의 요소 유효성 체크 요청
  var payload = {
    name: 'getSubmitData',
    dispatchEvent: 'call'
  }
  sendPayloadToIframe(validateSheetFrame, payload)
}

/**
 * 결재서명 유효성 체크 call validateSheet()
 * @param applyStatus 변경할 신청서 상태값
 *
 * 체크 후 응답 전달 interface validateApplyResponse
 */
async function validateApply(applyStatus) {
  var messageType = WORKSHEET_MESSAGE_TYPE.APPLY
  initResponse(messageType)
  
  var validateSheetFrame = await tryToGetSheetFrame()
  var payload = {
    name: 'validateApply',
    dispatchEvent: 'call',
    applyStatus: applyStatus
  }
  sendPayloadToIframe(validateSheetFrame, payload)
}

function createSheetSubmit(applyId) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  setSheetProperty('applyId', applyId, 'create')
}

function updateSheetSubmit(applyId) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  setSheetProperty('applyId', applyId, 'update')
}

function sandValidateServerError(errorCode = '99') {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  setResponse(messageType, errorCode)
  sendDataToNative('validateSheetResponse', getResponse(messageType))
}

async function blurSheetItem(command, type, itemId, value) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  
  if (!command || !type || !itemId) {
    setResponse(messageType, '03')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  var blurSheetItemFrame = await tryToGetSheetFrame()
  
  if (!blurSheetItemFrame) {
    setResponse(messageType, '04')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  try {
    var payload = {
      name: 'setTextarea',
      dispatchEvent: 'call',
      command: command,
      type: type,
      itemId: itemId,
      value: value
    }
    sendPayloadToIframe(blurSheetItemFrame, payload)
  } catch (e) {
    setResponse(messageType, '99')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
  }
}

async function doFocusItem(command, type, itemId, action) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  
  if (!command || !type) {
    setResponse(messageType, '03')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  var doFocusItemFrame = await tryToGetSheetFrame()
  
  if (!doFocusItemFrame) {
    setResponse(messageType, '04')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  try {
    var payload = {
      name: 'doFocusItem',
      dispatchEvent: 'call',
      command: command,
      type: type,
      itemId: itemId,
      action: action
    }
    sendPayloadToIframe(doFocusItemFrame, payload)
  } catch (e) {
    setResponse(messageType, '99')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
  }
}

async function doFocusOutItem(command, type) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  
  if (!command || !type) {
    setResponse(messageType, '03')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  var doFocusOutItemFrame = await tryToGetSheetFrame()
  
  if (!doFocusOutItemFrame) {
    setResponse(messageType, '04')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  try {
    var payload = {
      name: 'doFocusOutItem',
      dispatchEvent: 'call',
      command: command,
      type: type
    }
    sendPayloadToIframe(doFocusOutItemFrame, payload)
  } catch (e) {
    setResponse(messageType, '99')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
  }
}

/**
 * 저장된 서명 새로 가져오기
 * @param command
 * @param signType esign | approvalsign
 */
async function doReloadSign(command, signType) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  
  if (!command || !signType) {
    setResponse(messageType, '03')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  var doReloadSignFrame = await tryToGetSheetFrame()
  
  if (!doReloadSignFrame) {
    setResponse(messageType, '04')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  try {
    var payload = {
      name: 'doReloadSign',
      dispatchEvent: 'call',
      command: command,
      signType: signType
    }
    sendPayloadToIframe(doReloadSignFrame, payload)
  } catch (e) {
    setResponse(messageType, '99')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
  }
}

async function doRemoveSign(command, signType) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  initResponse(messageType)
  
  if (!command || !signType) {
    setResponse(messageType, '03')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  var doRemoveSignFrame = await tryToGetSheetFrame()
  
  if (!doRemoveSignFrame) {
    setResponse(messageType, '04')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  try {
    var payload = {
      name: 'doRemoveSign',
      dispatchEvent: 'call',
      command: command,
      signType: signType
    }
    sendPayloadToIframe(doRemoveSignFrame, payload)
  } catch (e) {
    setResponse(messageType, '99')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
  }
}


/*********************************************
 *
 * 2. Webview 내에서 APP 에 정의된 인터페이스 호출
 *
 **********************************************/

function validateSheetResponse(payload) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  
  // 응답 취합
  if (typeof payload.responseFlag !== 'undefined') {
    payload.responseFlag ? setResponse(messageType, '00') : setResponse(messageType, '01', payload.responseFlagCount)
  
    // 응답값이 없으면 이후 처리 중단
    if (!payload.responseFlag) {
      sendDataToNative('validateSheetResponse', WORKSHEET_MESSAGE_RESPONSE[messageType])
      return false
    }
  }
  
  if (payload.resultCode)
    setResponse(messageType, payload.resultCode)
  
  sendDataToNative('validateSheetResponse', WORKSHEET_MESSAGE_RESPONSE[messageType])
}

function validateApplyResponse(payload) {
  var messageType = WORKSHEET_MESSAGE_TYPE.APPLY
  initResponse(messageType)
  
  if (payload.resultCode)
    setResponse(messageType, payload.resultCode)
  
  sendDataToNative('validateApplyResponse', WORKSHEET_MESSAGE_RESPONSE[messageType])
}

function sendDataToNative(command, data) {
  if(data.resultCode === "01" && data.noCount > 0) {
    data.message = `입력하지 않은 필수 답변이 ${data.noCount}개 있습니다.\n붉은색 영역을 다시 확인해주세요. `
  }
  
  try {
    if (typeof AOSHandler !== 'undefined' && AOSHandler[command]) {
      // Call Android interface
      switch (command) {
        case 'validateSheetResponse':
          AOSHandler[command](data.resultCode, data.message)
          break
        case 'validateApplyResponse':
          AOSHandler[command](data.resultCode, data.message)
          break
        case 'focusSheetItem':
          AOSHandler[command](data.type, data.itemId, data.placeholder, data.value, data.status, data.prevId, data.nextId)
          break
        case 'changedValueSheetItem':
          AOSHandler[command](data.type, data.itemId, data.placeholder, data.value)
          break
      }
    } else if (window.webkit
      && window.webkit.messageHandlers
      && window.webkit.messageHandlers.iOSHandler
    ) {
      var postMessage = null
  
      switch (command) {
        case 'validateSheetResponse': {
          postMessage = {
            command: command,
            resultCode: data.resultCode || null,
            message: data.message || null
          }
          break
        }
        case 'validateApplyResponse': {
          postMessage = {
            command: command,
            resultCode: data.resultCode || null,
            message: data.message || null
          }
          break
        }
        case 'focusSheetItem': {
          postMessage = {
            command: command,
            type: data.type || null,
            itemId: data.itemId || null,
            placeholder: data.placeholder || null,
            value: data.value || null,
            status: data.status || null,
            prevId: data.prevId || null,
            nextId: data.nextId || null
          }
          break
        }
        case 'changedValueSheetItem': {
          postMessage = {
            command: command,
            type: data.type || null,
            itemId: data.itemId || null,
            placeholder: data.placeholder || null,
            value: data.value || null
          }
          break
        }
      }
      // Call iOS interface
      if (postMessage)
        window.webkit.messageHandlers.iOSHandler.postMessage(postMessage)
      
    } else {
      // No Android or iOS interface found
      // console.log("No native APIs found.")
  
      // Web 의 iframe 이 있을경우 응답 처리
      switch (command) {
        case 'validateSheetResponse': {
          var validateSheetResponseMessage = {
            command: command,
            response: getResponse(WORKSHEET_MESSAGE_TYPE.SHEET)
          }
          if (window.parent)
            window.parent.postMessage(validateSheetResponseMessage, '*')
          break
        }
        case 'validateApplyResponse': {
          var validateApplyResponseMessage = {
            command: command,
            response: getResponse(WORKSHEET_MESSAGE_TYPE.APPLY)
          }
          if (window.parent)
            window.parent.postMessage(validateApplyResponseMessage, '*')
          break
        }
        case 'changedValueSheetItem': {
          console.log(command, data)
          break
        }
      }
      
    }
    
  } catch (e) {
    console.warn(e)
  }
  
}



/*********************************************
 *
 * 3. 내부 사용 함수 (전달 없음)
 *
 **********************************************/

/**
 * 저장 버튼 누른 후 applyId 를 웹뷰로 전달하는 함수
 * @param name
 * @param value
 * @param type
 */
async function setSheetProperty(name, value, type) {
  var messageType = WORKSHEET_MESSAGE_TYPE.SHEET
  
  if (!name) {
    setResponse(messageType, '03')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  var sheetPropertyFrame = await tryToGetSheetFrame()
  
  if (!sheetPropertyFrame) {
    setResponse(messageType, '04')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
    return
  }
  
  try {
    switch (name) {
      case 'applyId': {
        var payload = {
          name: name,
          dispatchEvent: type,
          value: value
        }
        sendPayloadToIframe(sheetPropertyFrame, payload)
        break
      }
    }
  } catch (e) {
    setResponse(messageType, '99')
    sendDataToNative('validateSheetResponse', getResponse(messageType))
  }
  
}

function handleSubmitIframeTask(e) {
  try {
    if (e.data !== undefined && e.data !== null && e.data !== '') {
      switch (e.data.name) {
        case 'getSubmitData':
        case 'requestSuccess':
        case 'requestFail':
        case 'changedUserSign':
        case 'changedApprovalUserSign':
          validateSheetResponse(e.data.payload)
          break
        case 'validateApplyResponse':
          validateApplyResponse(e.data.payload)
          break
        case 'sendDataToNative': {
          var messageType = e.data.payload.messageType
          var resultCode = e.data.payload.resultCode
          var command = e.data.payload.command
          setResponse(messageType, resultCode)
          sendDataToNative(command, getResponse(messageType))
          break
        }
        
      }
    }
  } catch (e) {
    console.log(e)
  }
}

function sendPayloadToIframe(iframe, payload) {
  try {
    iframe.contentWindow.postMessage(payload, '*')
  } catch (e) {
    console.warn(e)
  }
}

function getResponse(messageType) {
  return WORKSHEET_MESSAGE_RESPONSE[messageType]
}

function setResponse(messageType, code, noCount = 0) {
  WORKSHEET_MESSAGE_RESPONSE[messageType].resultCode = code
  WORKSHEET_MESSAGE_RESPONSE[messageType].message = WORKSHEET_MESSAGE[messageType][code]
  WORKSHEET_MESSAGE_RESPONSE[messageType].noCount = noCount
}

function initResponse(messageType) {
  setResponse(messageType, '00')
}