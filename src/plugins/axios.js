"use strict";

import common from "@/assets/js/common";
import moment from '@/plugins/moment.js';
import { alert } from "@/plugins/sweetAlert.js";
import store from "@/plugins/vuex/store";
import axios from "axios";
import { loadProgressBar } from 'axios-progress-bar';
import jwt_decode from "jwt-decode";
import qs from "qs";
import router from "../plugins/router";

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const api_file = process.env.VUE_APP_BASE_FILE_URI + '/multipart';
const loginURL = process.env.VUE_APP_BASE_LOGIN_URI

let config = {
  baseURL: process.env.VUE_APP_BASE_API_URI || process.env.baseURL || "",
  /**
   * src : https://github.com/ljharb/qs
   * Stringifying
   *
   * qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' })
    // 'a[0]=b&a[1]=c'
    qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' })
    // 'a[]=b&a[]=c'
    qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' })
    // 'a=b&a=c'
    qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'comma' })
     // 'a=b,c'
   *
   * @param {*} params
   */
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: "repeat" });
  }
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true // Check cross-site Access-Control
};


const _axios = axios.create(config);

_axios.interceptors.request.use(async config => {
    /**
     * idToken uuid(userId), store state userId 유효성 체크
     */
    if (localStorage.idToken
      && store.state.user
      && (store.state.user.currentId || store.state.user.userId)
    ) {
      try {
        const decoded = jwt_decode(localStorage.idToken)
        const storeUserId = store.state.user.currentId || store.state.user.userId
        if (!decoded.uuid) {
          router.push('/logout', () => {})
          return false
        } else if (decoded.uuid !== storeUserId) {
          // uuid 가 다를 경우 요청 중단 (강제 에러 발생)
          return false
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a request interceptor (get new token)
_axios.interceptors.request.use(async config => {
    const idTokenExpiresTimestamp = localStorage.getItem('idTokenExpiresTimestamp')
        ? parseInt(localStorage.getItem('idTokenExpiresTimestamp'), 10)
        : null
    const refreshToken = localStorage.getItem('refreshToken')

    if (!store.state.isLoadingIdTokenExpireCheck) {
      store.commit('setIsLoadingIdTokenExpireCheck', true)

      if (idTokenExpiresTimestamp) {
        const idTokenExpiresTime = moment(idTokenExpiresTimestamp)

        // token 만료 전 갱신 정책에 따라 새로운 token 발급
        if (refreshToken && refreshToken !== 'undefined'
          && idTokenExpiresTime.diff(moment(), store.getters.CONSTANTS.ID_TOKEN_RENEWAL_UNIT_OF_TIME) <= store.getters.CONSTANTS.ID_TOKEN_RENEWAL_TIME) {
          try {
            const tokenObj = await getToken()
            localStorage.setItem("idToken", tokenObj.idToken);
            localStorage.setItem("idTokenExpiresTimestamp", moment(tokenObj.expiresAt).valueOf().toString());
            localStorage.setItem("refreshToken", tokenObj.refreshToken);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
          }
        }
      } else if (localStorage.idToken) {
        // 토큰 만료시간이 없을 경우 재설정
        try {
          const decoded = jwt_decode(localStorage.idToken)
          // decoded.exp is unix timestamp (not milliseconds!)
          localStorage.setItem("idTokenExpiresTimestamp", moment(decoded.exp * 1000).valueOf().toString());
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
        }
      }
      setTimeout(() => {
        store.commit('setIsLoadingIdTokenExpireCheck', false)
      }, 1000)
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a request interceptor (set token)
_axios.interceptors.request.use(config => {
    if (
      localStorage.getItem("idToken") !== null &&
      localStorage.getItem("idToken") !== undefined &&
      !config.url.includes(api_file)
    ) {
      const idToken = window.location.href.includes('/sru') ? '' : `Bearer ${localStorage.getItem("idToken")}`
      config.headers.Authorization = idToken;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a request interceptor (loadProgressBar)
_axios.interceptors.request.use(config => {
    loadProgressBar({ showSpinner: false }, _axios)
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor (token refresh)
_axios.interceptors.response.use(response => response, async error => {
  const resObj = error.response; // 에러 응답 객체
  const originalRequest = error.config

  if (resObj && resObj.status === 401 && !originalRequest._retry) {
    // eslint-disable-next-line no-console
    console.info('_axios API idToken expired !!')
    originalRequest._retry = true

    const refreshToken = localStorage.getItem('refreshToken')

    if (refreshToken && refreshToken !== 'undefined') {
      const tokenObj = await getToken().catch(error => Promise.reject(error))
      if (tokenObj) {
        originalRequest.headers['Authorization'] = `Bearer ${tokenObj.idToken}`

        localStorage.setItem("idToken", tokenObj.idToken);
        localStorage.setItem("refreshToken", tokenObj.refreshToken);
      } else {
        return Promise.reject(error)
      }
      // 토큰 갱신 후 재요청
      return _axios(originalRequest)

    } else {
      return Promise.reject(error)
    }

  } else {
    return Promise.reject(error)
  }
})

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) { return response },
  function (error) {
    const requestUrl = error.config.url
    const requestMethod = error.config.method
    const CDN_UPLOAD = checkCdnUpload(requestUrl)
    const FILE_UPLOAD = checkFileUpload(requestUrl)
    const AD_COUNT = checkAdCount(requestUrl)
    const CLASS_MANAGER_DELETE = checkClassManagerDelete(requestUrl, requestMethod)

    // 특정 URL 요청의 오류 무시
    if (CDN_UPLOAD || FILE_UPLOAD || AD_COUNT || CLASS_MANAGER_DELETE) {
      return Promise.reject(error)
    }

    // Do something with response error
    // catch network error
    if (error.response === undefined) {
      router.push({
        path: "/errorPage",
        query: { err: String(error) }
      });
      // localStorage.clear();
      return Promise.reject(error);
      
    } else {
      const resObj = error.response; // 에러 응답 객체
      const rejectOnlyStatusCodes = [ 204, 406, 409, 412, 413, 417, 418, 428, 503 ]
      
      if (rejectOnlyStatusCodes.includes(resObj.status)) {
        return Promise.reject(error)
      }
      
      const responsePath = getResponsePath(error)
      // const CDN_URI = process.env.VUE_APP_BASE_CDN_URI

      switch (resObj.status) {
        case 401: {
          delete axios.defaults.headers.common["Authorization"];
          window.location.href = "/";
          break
        }
        case 404: {
          if (responsePath.indexOf('/users/') > -1)
            router.push({ path: '/' }, () => {})
          // else if (responsePath.indexOf(CDN_URI) > -1)
          //   return Promise.reject(error)
          break
        }
        case 411: {
          if (responsePath.indexOf('/surveys/info') > -1) {
            const errMessage = resObj.data.message
            alert(errMessage, 'warning', false).then(() => {})
            return Promise.reject(error)
          }
          break
        }
        case 412: {
          this.$log.debug('responsePath', responsePath.includes('/boards/name-check'))
          if (!responsePath.includes('/boards/name-check')) {
            const errMessage = '정상적으로 처리되지 않았습니다.<br>잠시후 다시 시도해주세요.'
            alert(errMessage, 'warning', false).then(() => {
            })
            return Promise.reject(error)
          }
          break
        }
        case 451: {
          alert('작성하신 문장 내에 사용 금지 단어가 포함되어 있습니다.', 'warning', false).then(() => {})
          return Promise.reject(error)
        }
        default: {
          if (!responsePath.includes('/survey-response/') && (resObj.status === 405 || resObj.status === 400 || resObj.status === 404)) {
            return Promise.reject(error);
          }

          if (resObj.request.responseURL !== undefined && (resObj.status > 401 && resObj.request.responseURL.indexOf('/educationLetters/') > -1)) {
            // eslint-disable-next-line no-console
            console.info('가정통신문 플러스 요청 오류 error code : ', resObj.status)

          } else if (resObj.request.responseURL !== undefined && (resObj.status === 404 && resObj.request.responseURL.indexOf('/users/') > -1)) {
            router.push( { path: "/" }, () => {});

          } else if (responsePath.includes('/safetyRoles/excel') && resObj.status === 500) {
            return Promise.reject(error)

          } else {
            router.push({
              path: "/errorPage",
              query: {
                err: resObj.status,
                responsePath: responsePath
              }
            }, () => {});
          }
        }
      }

      return Promise.reject(error);
    }
  }
);

const getToken = () => {
  return axios({
    method: 'POST',
    url: `${loginURL}/oauth/token`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("refreshToken")}`
    },
  })
  .then(res => res.data)
}

const getResponsePath = error => {
  return common.isIE()
    ? JSON.parse(error.request.response).path
    : error.request.responseURL
}

const checkCdnUpload = responsePath => {
  const CDN_URI = process.env.VUE_APP_BASE_CDN_URI
  
  if (responsePath) {
    return responsePath.indexOf(CDN_URI) > -1
    
  } else {
    return false
  }
}

const checkFileUpload = responsePath => {
  if (responsePath) {
    return responsePath.indexOf('/multipart') > -1
      || responsePath.indexOf('/excels/tempStudents') > -1

  } else {
    return false
  }
}

const checkAdCount = responsePath => {
  const AD_URI = process.env.VUE_APP_BASE_AD_URI

  if (responsePath) {
    return responsePath.indexOf(AD_URI) > -1

  } else {
    return false
  }
}

const checkClassManagerDelete = (responsePath, requestMethod) => {
  if (responsePath && requestMethod) {
    const methodUpperCase = requestMethod.toUpperCase()
    const isChangeClazzRequest = responsePath.indexOf('/clazzes') > -1
      && methodUpperCase === 'PATCH'
    const isDeleteClazzSubscribeRequest = responsePath.indexOf('/clazzSubscribes') > -1
      && methodUpperCase === 'DELETE'

    return isChangeClazzRequest || isDeleteClazzSubscribeRequest

  } else {
    return false
  }
}

/**
 * request progress bar
 * @see : porgress 0 ~ 100
 * @see : timerId, setTimeout() 함수의 id
 * @see : setProgress(), request의 작동 시간을 실시간으로 가져오기 위한 함수
 * @see : timer(), request의 작동 시간을 실시간으로 가져오기 위한 함수
 * @param : storeBoard.isProgress, boolean,  request의 setProgress() 함수 작동 여부
 * @return : storeBoard.progress, 0 ~ 100, request의 작동 시간
 */
let progress = 0;
let timerId = null;

const setProgress = (value) => {
  progress = value;
  store.commit('storeBoard/setProgress', progress);
};
const timer = () => {
  if (progress < 100) {
      const diff = 100 - progress;
      const increment = diff / (10 + progress * (1 + progress / 100));
      setProgress(progress + increment);
  }
  timerId = setTimeout(timer, 50);
  store.commit('storeBoard/setProgressTimerId', timerId);
};


// request 작동시간 실시간으로 가져오기
_axios.interceptors.request.use(async config => {
    if(store.state.storeBoard.isProgress){
      setProgress(0);
      timer();
    } 
    return config;
  },
  error => Promise.reject(error)
);

// response porgress 완료시 카운트 종료
_axios.interceptors.response.use(async response => {
    if(store.state.storeBoard.isProgress){
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      setProgress(100);
    }
    return response;
  },
  error => Promise.reject(error)
);
/* request progress bar END */

export default _axios;
