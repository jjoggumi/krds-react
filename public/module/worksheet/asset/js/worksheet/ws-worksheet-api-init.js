'use strict'
/* eslint-disable */

let apiUrl = ''       // 공통으로 사용하는 api 주소
let $axios = null     // api http request obj

// 동작 환경에 따라 api 주소 초기화
setApiUrl()

// api 인스턴스 초기화
setAxiosInstance()

/**
 * 동작 환경에 따라 api 주소 초기화
 */
function setApiUrl() {
  const hostName = window.location.hostname
  const webEnvs = [
    {
      name: 'dev',
      hostname: 'devui.hiclass.net',
      path: 'https://devui.hiclass.net',
      apiUrl: 'https://devapi.hiclass.net'
    },
    {
      name: 'stage',
      hostname: 'stage.hiclass.net',
      path: 'https://stage.hiclass.net',
      apiUrl: 'https://stageapi.hiclass.net'
    },
    {
      name: 'production',
      hostname: 'www.hiclass.net',
      path: 'https://www.hiclass.net',
      apiUrl: 'https://api.hiclass.net'
    },
    {
      name: 'board',
      hostname: 'devboard.hiclass.net',
      path: 'https://devboard.hiclass.net',
      apiUrl: 'https://devapiboard.hiclass.net'
    },
  ]
  const curEnv = webEnvs.find(item => item.hostname === hostName)
  
  apiUrl = curEnv ? curEnv.apiUrl : webEnvs[0].apiUrl
}

/**
 * api 인스턴스 초기화
 */
function setAxiosInstance() {
  $axios = axios
  
  $axios.interceptors.response.use(
    function (response) { return response },
    function (error) {
      // Do something with response error
      // catch network error
      if (error.response === undefined) {
        console.log(error)
        //#81786 이슈 에러페이지로 이동하여 이동하여 메세지 안가는 것 수정
        //window.parent.location.href = `/errorPage?err=${String(error)}`
        return Promise.reject(error)
      } else {
        
        const resObj = error.response; // 에러 응답 객체
        const rejectOnlyStatusCodes = [ 503, 428, 409, 406 ]
        
        const responsePath = error.request.responseURL
        
        if (rejectOnlyStatusCodes.includes(resObj.status)) {
          return Promise.reject(error)
          
        } else if (resObj.status === 451) {
          // _hiClass.alert('적절하지 못한 단어가 포함되어 있습니다.', 'warning')
          return Promise.reject(error)
          
        } else if (resObj.status === 412) {
          // const errMessage = '정상적으로 처리되지 않았습니다.<br>잠시후 다시 시도해주세요.'
          // _hiClass.alert(errMessage, 'warning')
          return Promise.reject(error)
          
        } else if (resObj.status === 401) {
          delete $axios.defaults.headers.common["Authorization"]
          // window.parent.location.href = `/`
          // window.parent.postMessage('goto|home', '*')
          const message = {
            command: 'alert',
            msgData: {
              message: '로그인 정보가 변경되었습니다.<br>인덱스 페이지로 이동합니다.',
              icon: 'warning'
            },
            additionalProcess: 'goto|home'
          }
          window.parent.postMessage(message, '*')
          
        } else if (resObj.status === 404) {
          return Promise.reject(error)
          
        } else {
          // const message = {
          //   command: 'alert',
          //   msgData: {
          //     message: `errorCode: ${resObj.status}`
          //   }
          // }
          // window.parent.postMessage(message, '*')
          //#81786 이슈 에러페이지로 이동하여 이동하여 메세지 안가는 것 수정
          //window.parent.location.href = `/errorPage?err=${String(error)}`
          
          return Promise.reject(error)
        }
        
        return Promise.reject(error)
      }
      
    }
  )
  
}