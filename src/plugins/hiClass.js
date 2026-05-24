"use strict";

import Vue from "vue";
import axios from "@/plugins/axios";
import moment from '@/plugins/moment.js'
import constants from "@/plugins/constants";
import swal from 'sweetalert2'
// import axiosRetry from 'axios-retry';
import store from "./vuex/store";
import common from '../assets/js/common'
import {replaceStrongToBTag} from './utils'
import { readAndCompressImage } from "browser-image-resizer";
import imageCompression from 'browser-image-compression';
import qs from 'qs'
// IE 11 호환성 이슈로 3.4.0 버전을 사용함
import { v4 as uuidv4 } from 'uuid'
import {eventBus} from "@/main";
  
const ad = process.env.VUE_APP_BASE_AD_URI;
const api = process.env.VUE_APP_BASE_API_URI;
const apiFile = process.env.VUE_APP_BASE_FILE_URI + '/multipart';
const apiFiles = process.env.VUE_APP_BASE_FILE_URI + '/multiparts';
const apiFileSheet = apiFile + '/sheet';
const hiStoreUrl = process.env.VUE_APP_BASE_HI_STORE_URI;
const webUrl = process.env.VUE_APP_BASE_UI_URI;

const REQUEST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

import '@/assets/css/sweetalert2.css'
import { PROTECTED_URL_SET } from '@/constants/externalAssets';

/**
 * C,R,U,D,Search 가 모두 포함된 api
 * @type {string[]}
 */
const standardApis = [
    'users',
    'userLogs',
    'userDeactivates',
    'schoolSubscribes',
    'postHomeworkUsers',
    'postHomeworkUserComments',
    'clazzSubscribes',
    'clazzPhraseCategories',
    'clazzPhrases',
    'schools',
    'clazzImages',
    'clazzApplyStudents',
    'posts',
    'postComments',
    'postReadUsers',
    'informations',
    'helpNotices',
    'helpFaqs',
    'helpFaqCategories',
    'helpChats',
    'helpSuggests',
    'helpAdContacts',
    'onceChecks',
    'clazzInviteCards',
]

const _rest = {
  search: (params, url) => axios.post(url, null, { params }),
  create: (data, url) => axios.post(url, data),
  read: (requestUriOrBody) => axios.get(
    typeof requestUriOrBody === 'string' ? requestUriOrBody : requestUriOrBody._links.self.href
  ),
  readParams: (requestUriOrBody, params, cancelToken) => axios.get(
    typeof requestUriOrBody === 'string' ? requestUriOrBody : requestUriOrBody._links.self.href,
    { params, cancelToken }
  ),
  update(requestBody, url) {
    const fixedRequestBody = Object.assign({}, requestBody)

    if (fixedRequestBody.userMobile && fixedRequestBody.userMobile.includes('***') || !fixedRequestBody.userMobile)
      delete fixedRequestBody.userMobile

    let updateUrl = url || (fixedRequestBody._links && fixedRequestBody._links.self && fixedRequestBody._links.self.href);
    if (updateUrl) {
      updateUrl = updateUrl.replace('/v2/', '/')
    }

    return axios.patch(updateUrl, fixedRequestBody);
  },
  delete: (requestUriOrBody) => axios.delete(
    typeof requestUriOrBody === 'string' ? requestUriOrBody : requestUriOrBody._links.self.href
  )
};

const _hiClass = {
  userChatTime: {
    /**
     * 상담요일-시간 업데이트 전용 API
     * @param requestBody {
     *   {
     *     "userChatEndTime" : "1800",
     *     "userChatDay" : "1,2,3,4,5",
     *     "userChatStartTime" : "0900"
     *   }
     * }
     * @param url {'/users/{userId}/chatTime '}
     * @return {AxiosPromise<any>}
     */
    async update(requestBody, url) {
      url = api + url
      const request = {
        method: REQUEST_METHOD.PATCH,
        url: url,
        data: requestBody
      }
      const res = await axios(request);

      return res
    },
  },
  userPhoto: {
    /**
     * 프로필 이미지 업데이트 전용 API
     * @param requestBody {{ userPhoto: imgSrc }}
     * @param url {'/users/{userId}/photo'}
     * @return {AxiosPromise<any>}
     */
    async update(requestBody, url) {
      url = api + url
      const request = {
        method: REQUEST_METHOD.PATCH,
        url: url,
        data: requestBody
      }
      const res = await axios(request);

      return res
    },
  },
  userMobile: {
    read(requestParams) {
      const userMobile = requestParams.userMobile
      return axios({
        method: REQUEST_METHOD.GET,
        url: api + `/userMobile/${userMobile}`,
      });
    },
    readUserStatus(requestParams) {
      const userMobile = requestParams.userMobile
      const userStatus = requestParams.userStatus
      return axios({
        method: REQUEST_METHOD.GET,
        url: api + `/userMobile/${userMobile}/${userStatus}`,
      })
    },
    readFromToken() {
      return axios({
        method: REQUEST_METHOD.GET,
        url: api + '/userMobile'
      });
    },
  },
  
  userCertifications: {
    read() {
      const url = api + `/user/certifications`
      return _rest.read(url);
    },
    update(requestBody) {
      const url = api + `/user/certifications`
      return _rest.update(requestBody, url);
    },
  },
  
  tempStudents: {
    create(requestBody) {
      const url =  api + '/students/batch'
      return _rest.create(requestBody, url)
    },
  },

  userLikes: {
    search(requestParams) {
      const url =  api + '/userLikes/!q'
      return _rest.search(requestParams, url)
    },
    create(requestBody) {
      const url =  api + '/userLikes'
      return _rest.create(requestBody, url)
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  },

  userScraps: {
    search(requestParams) {
      const url =  api + '/userScraps/!q'
      return _rest.search(requestParams, url)
    },
    create(requestBody) {
      const url =  api + '/userScraps'
      return _rest.create(requestBody, url)
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  },

  userSign: {
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    },
  },

  schoolSubscribeViews: {
    search(requestParams) {
      const url =  api + '/schoolSubscribeViews/!q'
      return _rest.search(requestParams, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  },

  clazzes: {
    search(requestParams) {  
      const url =  api + '/clazzes/!q'
      return _rest.search(requestParams, url)
    },
    create(requestBody) {
      const url =  api + '/clazzes'
      return _rest.create(requestBody, url)
    },
    read(requestUriOrBody) {  
      return _rest.read(requestUriOrBody);
    },
    update(requestBody, url) {
      const version = '/v2'
      const startIndex = url.indexOf('/clazzes/') || 0
      const newUrl = api + version + url.slice(startIndex, url.length)
      return _rest.update(requestBody, newUrl);
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    },
    async reports(requestParams) {
      const res = await axios({
        method: 'get',
        url: api + '/clazzes/reports',
        params: requestParams
      });

      return res; 
    }
  },
  
  clazzApplies: {
    search(requestParams) {
      const url = `${api}/v2/clazzApplies/!q`
      return _rest.search(requestParams, url)
    },
    create(requestBody) {
      const url = `${api}/clazzApplies`
      return _rest.create(requestBody, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    readParams(requestUriOrBody, requestParams) {
      return _rest.readParams(requestUriOrBody, requestParams);
    },
    readList(requestBody) {
      const url = `${api}/clazzApplies/list`
      const request = {
        method: REQUEST_METHOD.POST,
        url: url,
        data: requestBody
      }
      return axios(request)
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  },

  clazzSubscribeViews: {
    search(requestParams) {
      // 클래스 가입 요청 목록은 masking 처리 하지 않음
      requestParams.masking = 'status'

      const url =  api + '/clazzSubscribeViews/!q'
      return _rest.search(requestParams, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  },

  clazzesPosts: {
    async search(requestParams, classId) {
      const url =  `${api}/v2/clazzes/${classId}/post`
      const list = await _rest.readParams(url, requestParams)
      return list
    }
  },
  //API - 37. clazzPostFile
  clazzesPostFiles: {
    search(requestParams, classId, mode, token) {
      const url =  `${api}/v2/clazzes/${classId}/${mode}`
      return _rest.readParams(url, requestParams, token)
    }
  },

  clazzesPostTop: {
    read(requestParams, classId, postType) {
      const url =  `${api}/v2/clazzes/${classId}/post/${postType}/top`
      return _rest.readParams(url, requestParams)
    }
  },

  schoolsPosts: {
    search(requestParams, schoolId) {
      const url =  `${api}/schools/${schoolId}/post`
      return _rest.readParams(url, requestParams)
    }
  },

  postMains: {
    search(requestParams) {
      const url =  api + '/postMains/!q'
      return _rest.search(requestParams, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    }
  },

  postCommentReports: {
    search(requestParams) {
      const url =  api + '/postCommentReports/!q'
      return _rest.search(requestParams, url)
    },
    create(requestBody) {
      const url =  api + '/postCommentReports'
      return _rest.create(requestBody, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    }
  },

  postBanners: {
    search(requestParams) {
      const url =  api + '/postBanners/!q'
      return _rest.search(requestParams, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    }
  },

  postExists: {
    search(requestParams) {
      return axios({
        method: "POST",
        url: api + `/posts/exists/!q`,
        params: requestParams,
        paramsSerializer: (params) => {
            return qs.stringify(params, {arrayFormat: 'repeat'});
        }
      })
    }
  },

  // 통합검색
  postsSearch: {
    async search(requestParams) {
      try {
        return await axios({
          method: "GET",
          url: `${api}/posts/search`,
          params: requestParams,
        })
      } catch (e) {
        this.$log.debug(e)
      }
    }
  },

  stickerPacks: {
    search(requestParams) {
      const url =  api + '/stickerPacks/!q'
      return _rest.search(requestParams, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    }
  },

  stickerItems: {
    search(requestParams) {
      const url =  api + '/stickerItems/!q'
      return _rest.search(requestParams, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    }
  },

  helpChatCategories: {
    search(requestParams) {
      const url =  api + '/helpChatCategories/!q'
      return _rest.search(requestParams, url)
    },
  },

  notificationBadges: {
    search(requestParams) {
      const url = api + `/notificationBadges/user/${localStorage.getItem("uuid")}`
      return _rest.read(url, requestParams)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    update(requestBody) {
      const url = api + `/notificationBadges/user/${localStorage.getItem("uuid")}`
      return _rest.update(requestBody, url);
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  },

  calenderHolidays: {
    search(requestParams) {
      const url =  api + '/calenderHolidays/!q'
      return _rest.search(requestParams, url)
    },
    setLocalStorageItem(res) {
      if (res.data._embedded && res.data._embedded.calenderHolidays.length > 0) {
        const calenderHolidays = JSON.stringify(res.data._embedded.calenderHolidays)
        localStorage.setItem('calenderHolidays', calenderHolidays)
      } else {
        localStorage.removeItem('calenderHolidays')
      }
    }
  },

  events: {
    read(postId) {
      return axios({
        method: "GET",
        url: api + "/events/" + postId + "/post"
      })
    },
    checkJoin(eventId) {
      return axios({
        method: "GET",
        url: api + "/events/" + eventId + "/check"
      })
    },
    play(eventId, data) {
      return axios({
        method: "POST",
        url: api + "/events/" + eventId + "/play",
        data: data
      });
    }
  },

  eventReplies: {
    read(eventUserId) {
      return axios({
        method: "GET",
        url: api + "/eventReplies/" + eventUserId
      })
    }
  },

  excels: {
    uploadHealthCheck(file, config) {
      let fileData = new FormData();
      fileData.append('file', file);
      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: api + '/excels/healthCheck',
        data: fileData,
        onUploadProgress: (config || {}).onUploadProgress
      });
    },
    uploadStudents(file, config) {
      const fileData = new FormData()
      fileData.append('file', file)
      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: api + '/excels/students',
        data: fileData,
        onUploadProgress: (config || {}).onUploadProgress
      })
    },
    validateStudent(requestBody, config) {
      return axios({
        method: REQUEST_METHOD.POST,
        url: api + '/excels/students/validate',
        data: requestBody,
        onUploadProgress: (config || {}).onUploadProgress
      })
    },
    safeCategoryAndWords(file, config) {
      let fileData = new FormData();
      fileData.append('file', file);
      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: api + '/safetyRoles/excel',
        data: fileData,
        onUploadProgress: (config || {}).onUploadProgress
      });
    }
  },

  sendMessages: {
    healthCheck(requestBody) {
      return axios({
        method: REQUEST_METHOD.POST,
        url: api + '/sendMessages/healthCheck',
        data: requestBody
      });
    }
  },

  educationLetters: {
    teacherSubscribeCheck(userId) {
      return axios({
        method: 'get',
        url: `${api}/educationLetters/teacherSubscribeCheck/${userId}`
      });
    }
  },
  
  sheets: {
    create(requestBody) {
      const url = api + '/sheets'
      return _rest.create(requestBody, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    readList(requestBody) {
      const url = `${api}/sheets/list`
      const request = {
        method: REQUEST_METHOD.POST,
        url: url,
        data: requestBody
      }
      return axios(request)
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    },
  },
  sheetsSubmit: {
    create(requestBody) {
      const url = api + '/sheets/submit'
      return _rest.create(requestBody, url)
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    },
  },
  
  sheetInfos: {
    search(requestParams) {
      const url =  api + '/v2/sheetInfos/!q'
      return _rest.search(requestParams, url)
    },
    /**
     * 워크시트 양식 목록
     * @param requestUriOrBody { '/sheetInfos/${parentId}/${sheetId}' }
     * @return {*}
     */
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody);
    },
    /**
     * 양식 설명 수정
     * @param requestBody { '{ description: true }' }
     * @param url { '/sheetInfos/{parentId}/{sheetId}' }
     * @return {AxiosPromise<any>}
     */
    updateDescription(requestBody, url) {
      return _rest.update(requestBody, url + '/desc');
    },
    /**
     * 양식 공유하기 (공유 후 수정 X) (parentId: classId)
     * @param requestBody
     * @param url { '/sheetInfos/{parentId}/{sheetId}' }
     * @return {AxiosPromise<any>}
     */
    updateShare(requestBody, url) {
      url = api + url + '/share'
      const request = {
        method: REQUEST_METHOD.PATCH,
        url: url
      }
      if (requestBody && requestBody.schoolId) {
        request.params = requestBody
      }
      return axios(request)
    },
    /**
     * 시트 상태 수정
     * @param requestBody | { sheetStatus: 'USED' } | USED:사용,NOT_USED:미사용,TEMP:임시저장
     * @param url { '/sheetInfos/{parentId}/{sheetId}' }
     * @return {AxiosPromise<any>}
     */
    updateSheetStatus(requestBody, url) {
      // return _rest.update(requestBody, url + '/sheetStatus');
      // TODO: 20211018 https://devapi.hiclass.net/docs/index.html#worksheetinfo-updateSheetStatus url 파라미터로 받음 ...
      return _rest.update(requestBody, url + '/sheetStatus' + '?' + qs.stringify(requestBody));
    },
    /**
     * 시트 학생, 학부모 사용 여부 수정
     * @param requestBody | { studentUsed: true } | { parentUsed: false }
     * @param url { '/sheetInfos/{parentId}/{sheetId}' }
     * @returns {AxiosPromise<any>}
     */
    updateUsed(requestBody, url) {
      // return _rest.update(requestBody, url + '/used');
      // 20220106 https://devapi.hiclass.net/docs/index.html#worksheetinfo-updateUsed url 파라미터로 받음
      return _rest.update(requestBody, url + '/used' + '?' + qs.stringify(requestBody));
    },
    /**
     * 시트 사용 횟수 증가
     * @param url { '/sheetInfos/{parentId}/{sheetId}' }
     * @return {AxiosPromise}
     */
    updateUsedCount(url) {
      url = api + url + '/count'
      return axios({
        method: REQUEST_METHOD.PATCH,
        url: url
      })
    },
    /**
     * 워크시트 양식 삭제
     * @param url { '/sheetInfos/{parentId}/{sheetId}' }
     * @return {AxiosPromise}
     */
    delete(url) {
      url = api + url
      return axios({
        method: REQUEST_METHOD.DELETE,
        url: url
      })
    },
    /**
     * 양식 유형 전체 조회
     * @return {AxiosPromise}
     */
    readApplyTypes() {
      const url = api + `/v2/sheetInfos/applyTypes`
      return axios({
        method: REQUEST_METHOD.GET,
        url: url
      });
    }
  },
  
  sheetRejects: {
    create(requestBody) {
      const url = api + '/sheetRejects'
      return _rest.create(requestBody, url)
    },
    read(requestUriOrBody) {
      return _rest.read(requestUriOrBody)
    },
    readList(requestBody) {
      const url = `${api}/sheetRejects/${requestBody.applyId}/list`
      return _rest.read(url)
    },
    update(requestBody) {
      const url = `${api}/sheetRejects/${requestBody.rejectSeq}`
      return axios({
        method: REQUEST_METHOD.PATCH,
        url: url,
        data: requestBody
      })
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  },

  surveyRespondent: {
    read(requestUriOrBody) {
      return [
        {
          "userId": "d8455b21-23a6-4f7e-ba92-6fa242716ef6",
          "userName": "허선생06",
          "userType": "TEACHER",
          "readTimestamp": 1662783700000,
          "answerTimestamp": 1662783706000,
          "memberClassNumber": null,
          "memberChildName": null,
          "answerStatus": "COMPLETE",
          "read": true,
          "answered": true
        },
        {
          "userId": "fa6b0584-5aaf-4b56-914d-ac2c0132bcb6",
          "userName": "민수아빠P",
          "userType": "PARENTS",
          "readTimestamp": 1662783700000,
          "answerTimestamp": null,
          "memberClassNumber": null,
          "memberChildName": "김민수",
          "answerStatus": "TEMPORARY",
          "read": true,
          "answered": false
        },
        {
          "userId": "a1c73fa6-1cb2-4d7a-bbda-505c29556f83",
          "userName": "S전원우S",
          "userType": "STUDENT",
          "readTimestamp": 1662783700000,
          "answerTimestamp": 1662783708000,
          "memberClassNumber": 2,
          "memberChildName": "전원우",
          "answerStatus": "REJECT",
          "read": true,
          "answered": true
        },
        {
          "userId": "224deb0c-e0d1-491e-965d-c3346b997db9",
          "userName": "부학생",
          "userType": "STUDENT",
          "readTimestamp": 1662783700000,
          "answerTimestamp": 1662783808000,
          "memberClassNumber": 3,
          "memberChildName": "부승관",
          "answerStatus": "COMPLETE",
          "read": true,
          "answered": true
        },
        {
          "userId": "b6e63892-bea9-48a5-bcec-1840e002e9fd",
          "userName": "서미응답",
          "userType": "STUDENT",
          "readTimestamp": null,
          "answerTimestamp": null,
          "memberClassNumber": 9,
          "memberChildName": "서미응답",
          "answerStatus": "UNCONFIRMED",
          "read": false,
          "answered": false
        },
        {
          "userId": null,
          "userName": "박비회원",
          "userType": "NONMEMBER",
          "readTimestamp": 1666682483000,
          "answerTimestamp": null,
          "memberClassNumber": 10,
          "memberChildName": "박응답중",
          "answerStatus": "TEMPORARY",
          "read": true,
          "answered": false
        },
        {
          "userId": null,
          "userName": "권비회원",
          "userType": "NONMEMBER",
          "readTimestamp": 1666682485000,
          "answerTimestamp": 1662783709999,
          "memberClassNumber": 8,
          "memberChildName": "권완료",
          "answerStatus": "COMPLETE",
          "read": true,
          "answered": true
        }
      ]
    }
  },

  surveyReportRespondentList: {
    read(requestUriOrBody) {
      return axios({
        method: "GET",
        url: api + requestUriOrBody
      })
    }
  },

  surveyReportRespondentAnswer: {
    read(requestUri) {
      return axios({
        method: "GET",
        url: api + `/surveys/report/respondent/${requestUri.surveyId}/${requestUri.respondentId}/answers`
      })
    }
  },
  
  /******************
   *   file upload
   ******************/

  multipart: {

    url(file) {
      let fileData = new FormData();
      fileData.append('file', file);
      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: apiFile,
        data: fileData,
        transformResponse: [(data) => {
          Vue.$log.info('transformResponse data:', data)
          try {
            let resp = JSON.parse(data);
            return resp._links.original.href;
          } catch (error) {
            throw Error(`[requestClient] Request failed with reason -  ${data}`)
          }
        }]
      });
    },

    upload(file, config = {}, isServerEncoding = true) {
      const fileData = new FormData();
      fileData.append('file', file, file.name);
      fileData.append('encode', isServerEncoding);

      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: apiFile,
        data: fileData,
        ...config
      });
    },

    delete(params) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => !PROTECTED_URL_SET.has(value))
      );

      if (Object.keys(filteredParams).length === 0) {
        return Promise.resolve(true);
      }

      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: `${process.env.VUE_APP_BASE_FILE_URI}/multipart/delete`,
        params: filteredParams
      })
    },

    update(payload) {
      const fileData = new FormData();
      fileData.append('file', payload.file, payload.file.name);
      fileData.append('originalFilePath', payload.originalFilePath);

      return axios({
        method: REQUEST_METHOD.PATCH,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: apiFile,
        data: fileData
      });
    },

    copy(requestBody, params) {
      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'application/json' },
        url: `${process.env.VUE_APP_BASE_FILE_URI}/multipart/copy`,
        data: requestBody,
        params: params
      })
    },

    encode(requestBody) {
      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'application/json' },
        url: `${process.env.VUE_APP_BASE_FILE_URI}/multipart/encode`,
        data: requestBody
      })
    }
  },
  
  multiparts: {

    url(files) {
      let fileDatas = new FormData()

      for (const file of files)
        fileDatas.append('file', file)

      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: apiFiles,
        data: fileDatas,

        transformResponse: [(data) => {
          Vue.$log.info('transformResponse data:', data)
          try {
            let resp = JSON.parse(data);
            // return resp._links.original.href;
            return resp._embedded.multiparts

          } catch (error) {
            throw Error(`[requestClient] Request failed with reason -  ${data}`)
          }
        }]
      });
    },

    upload(files, config) {
      const fileDatas = new FormData();

      for (const file of files)
        fileDatas.append('file', file, file.name);

      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: apiFiles,
        data: fileDatas,
        onUploadProgress: (config || {}).onUploadProgress
      });
    },

  },
  
  multipartSheet: {
    
    upload(file, config) {
      const fileData = new FormData();
      fileData.append('file', file, file.name);
      
      return axios({
        method: REQUEST_METHOD.POST,
        headers: { 'Content-Type': 'multipart/form-data' },
        url: apiFileSheet,
        data: fileData,
        onUploadProgress: (config || {}).onUploadProgress
      });
    },
    
  },
  
  v2: {
    postHomeworkUsers: {
      search(requestParams) {
        const url = `${api}/v2/postHomeworkUsers/!q`
        return _rest.search(requestParams, url)
      },
    }
  },

  ///////////////////////////////////////////////////////////////
  // Alert
  ///////////////////////////////////////////////////////////////
  swalOptions(text, icon) {
    const customClass = 'swal2-custom-class'

    return {
      html: text,
      icon: icon,
      buttonsStyling: true,
      /**
       * https://sweetalert2.github.io/#configuration
       *
       * customClass: {
          container: '...',
          popup: '...',
          header: '...',
          title: '...',
          closeButton: '...',
          icon: '...',
          image: '...',
          content: '...',
          htmlContainer: '...',
          input: '...',
          inputLabel: '...',
          validationMessage: '...',
          actions: '...',
          confirmButton: '...',
          denyButton: '...',
          cancelButton: '...',
          loader: '...',
          footer: '....'
        }
       */
      customClass: {
        popup: customClass,
        container: customClass,
        actions: customClass,
        confirmButton: customClass,
        cancelButton: customClass,
        denyButton: customClass,
      }
    };
  },

  confirm(text, icon, opts) {
    return new Promise((resolve, reject) => {
      let options = this.swalOptions(text, icon);
      options.showCancelButton = true
      options.showDenyButton = false
      options.showConfirmButton = true
      options.confirmButtonText = "확인"
      options.denyButtonText = "거절"
      options.cancelButtonText = "취소"
      options.reverseButtons = true
      // options.customClass = {
      //   popup: 'hc-confirm'
      // }

      if (opts && Object.keys(opts).length > 0) {
        for (const [key, value] of Object.entries(opts))
          options[key] = value
      }

      swal.fire(options)
        .then(result => result.isDismissed ? reject(result) : resolve(result))
    })
  },

  confirmCustom(text, confirmButtonText, cancelButtonText, icon, opts) {
    return new Promise((resolve, reject) => {
      let options = this.swalOptions(text, icon);
      options.showCancelButton = true
      options.showDenyButton = false
      options.showConfirmButton = true
      options.confirmButtonText = confirmButtonText ? confirmButtonText : "확인"
      options.denyButtonText = "거절"
      options.cancelButtonText = cancelButtonText ? cancelButtonText : "취소"
      options.reverseButtons = true

      if (opts && Object.keys(opts).length > 0) {
        for (const [key, value] of Object.entries(opts))
          options[key] = value
      }

      swal.fire(options)
        .then(result => resolve(result))
    })
  },
  
  /**
   * sweet alert 2
   * @param text
   * @param icon
   * @param autoClose
   * @return {Promise<unknown>}
   */
  alert(text, icon, autoClose) {
    // return new Promise((resolve, reject) => {
    return new Promise((resolve) => {
      let options = this.swalOptions(text, icon);
      if (autoClose === true) {
        options.showCancelButton = false;
        options.showConfirmButton = false;
        options.timer = 1200;
      } else {
        options.showCancelButton = false;
        options.showConfirmButton = true;
        options.confirmButtonText = "확인";
      }

      swal.fire(options).then(result => {
        // if (result.value == true) {
        //   resolve(result);
        // } else {
        //   reject(result);
        // }
        resolve(result);
      });
    });
  },

  confirmDelete() {
    return this.confirm("삭제 하시겠습니까?", "warning");
  },
  confirmUpdate() {
    return this.confirm("적용 하시겠습니까?", "warning");
  },
  alertCreate() {
    return this.alert("저장 되었습니다.", "success", true);
  },
  alertUpdate() {
    return this.alert("수정 되었습니다.", "success", true);
  },
  alertDelete() {
    return this.alert("삭제 되었습니다.", "success", true);
  },
  alertError() {
    return this.alert(
        "서버와의 통신이 지연되고 있습니다.<br/>잠시후 다시 시도 하여 주십시오.",
        "error"
    );
  },
  alertSearch() {
    return this.alert("검색어를 입력해주세요", "error", false);
  },

  ///////////////////////////////////////////////////////////////
  // validate
  ///////////////////////////////////////////////////////////////
  validate(vue) {
    return new Promise((resolve, reject) => {
      vue.$validator.validateAll().then(r => {
        if (r === true) {
          resolve(vue.errors.items);
        } else {
          let msg = "다음 항목의 입력값이 없거나 잘못 되었습니다.<br/>";
          vue.errors.items.forEach(i => {
            msg = msg + ("<br/> - " + i.field);
          });
          reject(msg);
        }
      });
    });
  },

  // 오퍼월
  offerwall: {
    readIpList(idToken) {
        return axios({
            method: "GET",
            url: `${api}/advertiser/ip`,
            headers: {
                Authorization: "Bearer " + idToken,
            }
        })
    },
    readBrandList(companyId) {
      return axios({
        method: REQUEST_METHOD.GET,
        url: api + `/advertiser/adstats/companies/${companyId}/brands`
      })
    },
    readSettlement(requestParams) {
      return axios({
        method: REQUEST_METHOD.GET,
        url: api + '/advertiser/settlements',
        params: requestParams
      });
    }
  },



  // 예약된 게시물인지 확인
  isReserved(timestamp) {
    if (timestamp !== undefined && timestamp !== null) {
      const compare = moment(timestamp);
      const today = moment();
      // Vue.$log.info('compare.diff(today) => ', compare.diff(today))
      return compare.diff(today) > 0;
    } else
      return false;
  },

  /**
   * 클래스 활성화 여부 확인
   * @param {Object} clazz 클래스 객제
   */
  isClassActivated(clazz) {
    const classStatus = clazz.classStatus

    if (classStatus === undefined)
      return false

    return classStatus === 'ACTIVATE';
  },

  /**
   * 클래스 관리자 여부 확인
   * @param {Object} clazz 클래스 객체
   */
  isManager(clazz) {
    const memberRole = clazz.memberRole

    if (memberRole === undefined)
      return false

    return memberRole === 'OWNER' || memberRole === 'MANAGER';
  },

  getAuthorizationToken() {
    const idToken = localStorage.getItem("idToken");
    if (idToken !== undefined && idToken !== null && idToken !== "") {
      return {
        Authorization: "Bearer " + idToken
      }
    } else {
      return ""
    }
  },

  setTmpClassName(VueInstance) {
    if (document.body.className.indexOf("hidden") > -1)
      VueInstance.$store.commit('setTmpClassName', document.body.className);
    else {
      document.body.className = "hidden";
    }
  },

  getTmpClassName(VueInstance) {
    document.body.className = VueInstance.$store.state.tmpClassName;
  },

  initTmpClassName(VueInstance) {
    VueInstance.$store.commit('setTmpClassName', "");
    document.body.className = "";
  },

  /**
   * 클래스 관리자 여부 확인
   * @param {Object} VueInstance
   * @param {String} classId
   */
  isManagerByClassId(VueInstance, classId) {
    if (VueInstance === undefined || classId === undefined) return false

    let managedClasses = VueInstance.$store.state.clazzSubscribeViews.filter(
      d => {
        return d.classId === classId && (d.memberRole === 'OWNER' || d.memberRole === 'MANAGER')
      }
    )
    return managedClasses.length > 0
  },

   /**
    * 클래스 구독 승인 여부 확인 및 구독 객체 반환
    * @param {Object} VueInstance
    * @param {String} classId
    * @param {String} userId
    */
   async getAcceptSubscribeClassByClassIdAndUserId(VueInstance, classId, userId) {
    userId = userId || VueInstance.$store.state.user.currentId

    if (!userId || !classId) {
      return await new Promise(resolve => resolve(false))
    }

    const params = {
      userId,
      classId,
      memberStatus: 'ACCEPT'
    }

    return await this.clazzSubscribeViews.search(params).then(res => {
      return res.data._embedded.clazzSubscribeViews
    })
  },

  /**
    * 클래스 구독 신청 여부 확인 및 구독 객체 반환
    * @param {Object} VueInstance
    * @param {String} classId
    * @param {String} userId
    */
   getApplySubscribeClassByClassIdAndUserId(VueInstance, classId, userId) {
    userId = userId || VueInstance.$store.state.user.currentId

    if (userId === undefined || classId === undefined) return false

    const params = {
      userId,
      classId,
      memberStatus: 'APPLY'
    }

    return this.clazzSubscribeViews.search(params).then(res => {
      return res.data._embedded.clazzSubscribeViews
    })
  },

  /**
   * 학교 구독여부 체크 후 미구독 시 학교 구독
   * @param {Object} VueInstance
   * @param {String} schoolId
   * @param {String} userId
   * @param {String} joinType
   */
  isDuplSubscribeSchoolAndSchoolSubscribe(VueInstance, schoolId, userId, joinType) {
    userId = userId || VueInstance.$store.state.user.currentId
    joinType = joinType || 'SCHOOL'

    if (userId === undefined || schoolId === undefined) return false

    this.schoolSubscribeViews
      .search({
        schoolId,
        userId
      })
      .then(res => {
        const totalElements = res.data.page.totalElements

        if (totalElements === 0) {
          const school = `${api}/schools/${schoolId}`
          const user = `${api}/users/${userId}`

          // 학교 구독
          this.schoolSubscribes.create({
            joinType,
            school,
            user
          })
        } else if (totalElements === 1) {
          const schoolSubscribeView = res.data._embedded.schoolSubscribeViews[0]
          const schoolSubscribeId = schoolSubscribeView.currentId
          const item = { joinType }

          // 학교 joinType 수정
          const schoolSubscribeUri = `${api}/schoolSubscribes/${schoolSubscribeId}`
          this.schoolSubscribes.update(item, schoolSubscribeUri)
        }
      })
  },

  /**
   * store clazzSubscribeViews 갱신
   * @param {Object} VueInstance
   */
  setClazzSubscribeViews(VueInstance) {
    return this.clazzSubscribeViews
      .search({
        userId: VueInstance.$store.state.user.currentId,
        size: 1000,
        sort: ['classYear,asc', 'insertedTimestamp,desc']
      })
      .then(res => {
        VueInstance.$store.commit(
          'setClazzSubscribeViews',
          res.data._embedded.clazzSubscribeViews
        )
        return res.data._embedded.clazzSubscribeViews
      })
  },

  /**
   * store clazzSubscribeViews 갱신 및 목록 가져오기
   * memberStatus : ['APPLY', 'ACCEPT', 'DENIAL']
   * @param {Object} VueInstance
   */
  getClazzSubscribeViews(VueInstance) {
    return this.setClazzSubscribeViews(VueInstance)
      .then(clazzSubscribeViews => {
        return clazzSubscribeViews
      })
  },

  /**
   * store schoolSubscribeViews 갱신
   * @param {Object} VueInstance
   */
  async setSchoolSubscribeViews(VueInstance) {
    // return this.schoolSubscribeViews
    //   .search({
    //     userId: VueInstance.$store.state.user.currentId,
    //     size: 1000,
    //     sort: 'insertedTimestamp,desc'
    //   })
    //   .then(res => {
    //     VueInstance.$store.commit(
    //       'setSchoolSubscribeViews',
    //       res.data._embedded.schoolSubscribeViews
    //     )
    //     return res.data._embedded.schoolSubscribeViews
    //   })

    const res = await this.schoolSubscribeViews
    .search({
      userId: VueInstance.$store.state.user.currentId,
      size: 1000,
      sort: 'insertedTimestamp,desc'
    })

    VueInstance.$store.commit(
      'setSchoolSubscribeViews',
      res.data._embedded.schoolSubscribeViews
    )

    return res.data._embedded.schoolSubscribeViews
  },

  /**
   * store schoolSubscribeViews 갱신 및 목록 가져오기
   * @param {Object} VueInstance
   */
  getSchoolSubscribeViews(VueInstance) {
    return this.setSchoolSubscribeViews(VueInstance)
      .then(schoolSubscribeViews => {
        return schoolSubscribeViews
      })
  },

  /**
   * body tag class set (modal 팝업 스크롤 hidden 처리 등)
   * @param {*} addRemoveClass
   * @param {*} className
   */
  toggleBodyClass(addRemoveClass, className) {
    const el = document.body

    if (addRemoveClass === 'add') {
      el.classList.add(className)

    } else if (addRemoveClass === 'remove' && className === 'hidden') {
      setTimeout(() => {
        const modals = document.getElementsByClassName('modal')
        const isCurrentPathMainAlarmPlus = location.href.includes('/main/alarmplus')
        if (modals.length === 0 && !isCurrentPathMainAlarmPlus) {
          el.classList.remove(className)
        }
      }, 0)

    } else {
      el.classList.remove(className)
    }
  },

  setVideoOptions(file, cropPreset) {
    const src = file.fileTranscodePath || file.fileOriginalPath
    const posterDefault = '/files/img/bg_video_poster_default.png'
    const poster = file.fileThumbnailPath === '/files/img/icon_img_empty_thum.png'
      ? posterDefault
      : (file.fileThumbnailPath || posterDefault)
    const width = store.state[cropPreset].width || ''
    const height = store.state[cropPreset].height || ''

    return {
      autoplay: true,
      controls: true,
      sources: [
        {
          src
        }
      ],
      width,
      height,
      poster
    }
  },
  async uploadVideoFile(file, uploadProgress) {
    let videolInfo;

    if(file) {
      videolInfo = await this.multipart.upload(file, uploadProgress, true)
    } else {
      return false;
    }

    return {
      fileName: videolInfo.data.filename.replace(/^.*[\\/]/, ''),
      fileSize: videolInfo.data.size,
      fileOriginalPath: videolInfo.data._links.original.href,
      fileContentType: videolInfo.data.contentType,
      fileConvertPath: videolInfo.data._links.convert ? videolInfo.data._links.convert.href : '',
      //fileThumbnailPath: videolInfo.data._links.original.href.substr(0, videolInfo.data._links.original.href.lastIndexOf('.') + 1) + 'jpg'
    }
  },
  async getConvertedFile(file) {
    try {
      if (file.type.startsWith('image/')) { // 이미지일 경우 리사이즈 처리
        const extension = file.type.split('/')[1]
        let isRotatedImage = false

        await imageCompression.getExifOrientation(file)
          .then(number => {
            // 회전정보가 있음!
            if (number > 1) {
              Vue.$log.info(`exif orientation number => `, number)
              isRotatedImage = true
            }
          })
          .catch(e => {
            Vue.$log.error(e)
          })

        // jpg, jpeg, png 일 경우에만 리사이즈처리
        if (store.state.imageResizeConfig.allowExtensions.includes(extension))
          if (store.getters.isMobile) {
            return await this.mobileResizeImageFile(file)
          } else {
            return await this.resizeImageFile(file, file.type, isRotatedImage)
          }
        else
          return file

      } else if (file.type.startsWith('video/')) {  // 동영상일 경우

        return file

      } else {
        return file
      }

    } catch (error) {
      Vue.$log.error(error)
      return file
    }
  },

  async resizeImageFile(file, mimeType, isRotatedImage) {
    const imageResizeConfig = store.state.imageResizeConfig

    // browser-image-resizer 로 리사이징
    try {
      const options = {
        quality: imageResizeConfig.quality,
        maxWidth: imageResizeConfig.maxWidth,
        maxHeight: imageResizeConfig.maxHeight,
        autoRotate: isRotatedImage && common.isIE() ? true : imageResizeConfig.autoRotate,
        debug: imageResizeConfig.debug,
        mimeType: mimeType
      }
      
      const compressedBlob = await readAndCompressImage(file, options)
      
      // Vue.$log.debug('compressedBlob instanceof Blob', compressedBlob instanceof Blob); // true
      // Vue.$log.debug(`compressedBlob size ${compressedBlob.size / 1024 / 1024} MB`); // smaller than maxSizeMB


      /**
       * 10kb 이하로 압축된 파일은 압축이 안된 것으로 간주하고 원본 파일을 리턴한다.
       */
      if(compressedBlob.size < 10000) {
        const originalFile = new Blob([file], { type: file.type });
        return await this.blobToFile(originalFile, file.name)
      }else {
        return await this.blobToFile(compressedBlob, file.name)
      }
      

    } catch (error) {
      Vue.$log.error(error)
      return file
    }
  },

  async mobileResizeImageFile(file) {
    const imageResizeConfig = store.state.imageResizeConfig

    // browser-image-compression 로 리사이징
    try {
      const options = {
        maxSizeMB: imageResizeConfig.maxSizeMB,
        maxWidthOrHeight: imageResizeConfig.maxWidthOrHeight,
        useWebWorker: imageResizeConfig.useWebWorker,
      }
      const compressedBlob = await imageCompression(file, options);
      Vue.$log.debug('compressedBlob instanceof Blob', compressedBlob instanceof Blob); // true
      Vue.$log.debug(`compressedBlob size ${compressedBlob.size / 1024 / 1024} MB`); // smaller than maxSizeMB

      return await this.blobToFile(compressedBlob, file.name)

    } catch (error) {
      Vue.$log.error(error)
      return file
    }
  },

  blobToFile(theBlob, fileName){
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  },

  replacePostVersion(item) {
    if (item.version === 'V2') {
      return item

    } else {
      item.version = item.postContent.includes('class-fr-editor')
          ? 'V2'
          : 'V1'
      return item
    }
  },

  /**
   * 클래스 게시글 작성 권한
   * (과제 제출 권한은 isAvailableClazzHomeworkSubmit 참조)
   * @param postType
   * @param board
   * @param isManager
   * @return true | false
   */
  itemWriteUsed(postType, board, isManager) {
    try {
      const user = store.state.user
      const isMemberParents = !isManager && (user.userType === 'TEACHER' || user.userType === 'PARENTS')
      const isMemberStudent = !isManager && user.userType === 'STUDENT'

      // 클래스 알림장, 과제 게시글 쓰기 권한은 클래스 관리자만 가짐
      if (postType === constants.POST_TYPE.NOTE || postType === constants.POST_TYPE.HOMEWORK) {
        return isManager
      }

      return (isManager && !(board.boardPermission || false))
          || (isMemberParents && board.isWriteParents)
          || (isMemberStudent && board.isWriteStudent)
          || ((board.boardPermission || {}).isWritable || false)

    } catch (e) {
      return false
    }
  },

  itemReadUsed(board, isClassOwnerOrManager) {
    try {
      const user = store.state.user
      const isMemberParents = !isClassOwnerOrManager && (user.userType === 'TEACHER' || user.userType === 'PARENTS')
      const isMemberStudent = !isClassOwnerOrManager && user.userType === 'STUDENT'

      return isClassOwnerOrManager
        || (isMemberParents && board.isReadParents)
        || (isMemberStudent && board.isReadStudent)
        || ((board.boardPermission || {}).isWritable || false)

    } catch (e) {
      return false
    }
  },

  /**
   * 로그인한 사용자의 전자서명 변경
   */
  changeUserSign(signType) {
    const pageUrl = '/popup/SignaturePopup' + (signType ? `/${signType}` : '')
    const pageTitle = 'my-signature-popup'
    const option = {
      height: 528,
      width: 454
    }

    const features =
        `height=${option.height}, width=${option.width}, ` +
        `screenX=${window.leftWindowBoundry() + option.width}, ` +
        `screenY=${option.width / 2}, ` +
        `left=${window.leftWindowBoundry() + option.width}`

    window.open(pageUrl, pageTitle, features)
  },

  /**
   * 오늘 하루만 보지 않음, 더 이상 보지 않음
   */
  replayData : {
    /**
     * localStorage 에 저장된 item 정보
     * @return {{ANYMORE: any, NOTTODAY: (*|null)}}
     */
    getReplayData() {
      return {
        NOTTODAY:
           (JSON.parse(localStorage.NOTTODAY || null) || {})[
              moment().format('YYYYMMDD')
              ] || null,
        ANYMORE: JSON.parse(localStorage.ANYMORE || null)
      }
    },
  
    /**
     * isReplayDataANYMORE 더 이상 보지 않음 유무 체크
     * @param data
     * @return {boolean}
     */
    isReplayDataANYMORE(data) {
      const storage = JSON.parse(localStorage.ANYMORE || null) || []
      
      if (!storage)
        return false
  
      return !!(storage.find(item => item.currentId === data.currentId))
    },
  
    /**
     * setReplayDataANYMORE 더 이상 보지 않음 저장
     * @param data
     */
    setReplayDataANYMORE(data) {
      const storage = JSON.parse(localStorage.ANYMORE || null) || []
      const newStorage = storage.filter(item => item.currentId !== data.currentId)
      newStorage.push({
        currentId: data.currentId
      })
      localStorage.ANYMORE = JSON.stringify(newStorage)
    },
    
    /**
     * handleItem 오늘 하루만 보지 않음 ('ANYMORE' use setReplayDataANYMORE(data), isReplayDataANYMORE(data) )
     * @param replayType
     * @param itemId
     * @return {boolean}
     */
    handleItem(replayType, itemId) {
      // TODO: replayType => 'ANYMORE' not tested!
      let flag = false

      try {
        const replayData = this.getReplayData()

        let replayItem = (replayData[replayType] || []).filter(rep => {
          return rep.currentId === itemId
        }, {})

        // 0인 경우 노출 처리
        if (replayItem.length === 0) {
          flag = true

          // 노출처리하면서 오늘 다시 노출되지 않도록 처리
          this.setItem(replayType, itemId)
        }

      } catch (e) {
        return flag
      }

      return flag
    },

    /**
     * setItem 오늘 하루만 보지 않음
     * @param replayType
     * @param itemId
     */
    setItem(replayType, itemId) {
      // TODO: replayType => 'ANYMORE' not tested!
      let toDay = moment().format('YYYYMMDD')
      let storage = JSON.parse(localStorage.getItem(replayType) || null) || {},
          replay = storage[toDay] || null

      if (replay) {
        if (!replay.find(item => item.currentId === itemId)) {
          replay.push({ currentId: itemId })

          localStorage.setItem(replayType, JSON.stringify(storage))
        }
      } else {
        replay = {}
        replay[toDay] = [{ currentId: itemId }]

        localStorage.setItem(replayType, JSON.stringify(Object.assign(storage, replay)))
      }
    },

  },

  getHtmlParsedContent(content) {
    try {
      const domParser = new DOMParser()
      const postContentDocument = domParser.parseFromString(content, 'text/html')

      return postContentDocument.body.textContent
    } catch (e) {
      return content
    }
  },

  getFileByImageSrcFromFiles(imageSrc, files, type) {
    let file

    try {
      file = files && files.find(d => {
        if (type && type.startsWith('video'))
          return d.fileThumbnailPath === imageSrc
        else
          return d.fileOriginalPath === imageSrc
      })

      if (!file) {
        // files 객체 내에서 원본 file 을 찾을 수 없을 경우에는 img 정보로만 미리보기 처리함
        const fileOriginalPath = imageSrc
        const fileName = common.split(imageSrc, '/')

        file = {
          fileContentType: "image/jpeg",
          fileFlag: "FILE",
          fileName,
          fileOriginalPath
        }
      }

    } catch (e) {
      return file
    }

    return file
  },

  getImgFilesFromHtml(html) {
    const domParser = new DOMParser()
    const parsedDocument = domParser.parseFromString(html, 'text/html')
    const imgNodeList = parsedDocument.body.querySelectorAll('img')
    const imgArray = Array.from(imgNodeList)
  
    const getFileFromImg = (img) => {
      const fileOriginalPath = img.src
      const fileName = fileOriginalPath ? common.split(fileOriginalPath, '/') : null
      return {
        fileContentType: "image/jpeg",
        fileFlag: "FILE",
        fileName,
        fileOriginalPath
      }
    }
    return imgArray.map(img => getFileFromImg(img)).filter(f => f.fileName)
  },

  openAttachFile(file, post) {
    const image = common.isImage([file], true)
    const video = common.isImage([file], 'v')

    if (image.length > 0 || video.length > 0) {
      store.commit('setImageView', {
        isOpen: true,
        post: post || {},
        items: [file],
        index: 0
      })
    } else {
      store.commit('setDocView', {
        isOpen: true,
        item: file
      })
    }
  },

  openImageVideoFiles(files, post, index) {
    store.commit('setImageView', {
      isOpen: true,
      post: post || {},
      items: files,
      index: index || 0
    })
  },

  async handleImageClick(e, postOrFiles, postOrTotalFiles = [], v1 = false) {
    const handleImages = [ '.class-fr-editor img', 'p img', 'div img' ]
    const selector = handleImages.join(',')
    const post = postOrFiles.currentId ? postOrFiles : {}
    const postContent = post.postContent || ''
    const files = postOrFiles.files || postOrFiles

    if (e.target.matches(selector)) {
      try {
        const imgSrc = e.target.src
        const imgFiles = this.getImgFilesFromHtml(postContent)
        
        if (imgFiles.length > 0) {
          // const newImgFiles = imgFiles.filter(v => {
          //   const path = v.fileOriginalPath.split("?")[0]
          //   const index = files.findIndex(f => path === f.fileOriginalPath || path === f.fileConvertPath)
          //   return index > - 1
          // })

          if(v1 === true) {
            const index = imgFiles.findIndex(f => f.fileOriginalPath === imgSrc)
            this.openImageVideoFiles(imgFiles, post, index)
          } else {
            const newImgFiles = []
            imgFiles.map(v => {
              const path = v.fileOriginalPath.split("?")[0]
              const item = files.find(f => path === f.fileOriginalPath || path === f.fileConvertPath)
              if(item) newImgFiles.push(item)
            })

            const index = newImgFiles.findIndex(f => f.fileOriginalPath === imgSrc)
            this.openImageVideoFiles(newImgFiles, post, index)
          }
        } else {
          const file = this.getFileByImageSrcFromFiles(imgSrc, files)
          if (file)
            this.openAttachFile(file, post)
        }
      } catch (e) {
        alert('이미지 미리보기 요청 실패')
      }
    }

    const handleDefaultImages = [ '.class-fr-editor span.fr-video span.thumb-default']
    const selectorDefaultImages = handleDefaultImages.join(',')

    if (e.target.matches(selectorDefaultImages)) {
      const fileTotals = postOrTotalFiles.files || postOrTotalFiles
      const src = e.target.dataset.src

      // const playableFile = files.find(d => d.fileContentType && d.fileContentType.includes('video/mp4'))
      const playableFile = fileTotals.find(d => d.fileOriginalPath === src)
      if (!playableFile === false) {
        this.openAttachFile(playableFile, post)
      } else {
        this.alert('동영상 인코딩 중입니다.<br/>재생까지 수 분 이상이 소요될 수 있습니다.', 'warning').then(() => {
          eventBus.$emit('refresh-class-board-posts')
        })
        // alert('인코딩 중인 동영상입니다.\n잠시 후 확인해주세요.')
      }
    }
  },

  handleVideoClick(e, postOrFiles) {
    const handleVideos = [ '.class-fr-editor span.fr-video span.thumb' ]
    const handleDefaultVideos = [ '.class-fr-editor span.fr-video span.thumb-default' ]
    const selector = handleVideos.join(',')
    const selectorDefault = handleDefaultVideos.join(',')
    const post = postOrFiles.currentId ? postOrFiles : {}
    const files = postOrFiles.files || postOrFiles

    if (e.target.matches(selector)) {
      try {
        const img = e.target.querySelector('img')
        if (img) {
          const imgSrc =  img.src
          const file = this.getFileByImageSrcFromFiles(imgSrc, files, 'video')
          if (file) {
            this.openAttachFile(file, post)
          } else {
            this.alert('동영상 인코딩 중입니다.<br/>재생까지 수 분 이상이 소요될 수 있습니다.', 'warning').then(() => {
              eventBus.$emit('refresh-class-board-posts')
            })
          }
        } 
      } catch (e) {
        alert('이미지 미리보기 요청 실패')
      }

      if (e.target.matches(selectorDefault)) {
        const playableFile = files.find(d => d.fileContentType && d.fileContentType.includes('video/mp4'))
        if (playableFile) {
          this.openAttachFile(playableFile, post)
        } else {
          alert('인코딩 중인 동영상입니다.\n잠시 후 확인해주세요.')
        }
      }

    }
  },

  // setPostsCheckedTimestampByClassId(VueEventBus, postType) {
  //   VueEventBus.$emit('set-posts-checked-timestamp-by-class-id', postType)
  // },

  setLastEntryBoardAndFolderTimestamp(VueEventBus, boardId, folderId) {
    VueEventBus.$emit('set-last-entry-board-and-folder-timestamp', {boardId: boardId, folderId: folderId})
  },

  getUnMaskingUser(userId) {
    const requestUrl = `/users/${userId}`
    const requestParams = { masking: false }
    return this.users.readParams(requestUrl, requestParams)
      .then(res => res.data)
      .catch(() => null)
  },
  
  getUserName(item) {
    const isSchoolPost = ['ALARM', 'MEAL', 'NOTICE'].includes(item.postType)
    const userName = item.user ? item.user.userName : item.userName
    const userStatus = item.user ? item.user.userStatus : item.userStatus
  
    let str = userName
  
    if (item.writeUser)
      str = this.getWriteUserName(item)
    
    try {
      if (userStatus === 'DEACTIVATE' || (!userName && item.writeUser.userName === 'unknown'))
        str = '탈퇴회원'

      else if (isSchoolPost && (str === null || str === 'null'))
        str = '하이클래스'

    } catch (e) {
      this.$log.debug(e)
    }
    
    return str
  },
  
  getWriteUserName(item) {
    let str = item.writeUser.userName
    const isClassPost = ['NOTE', 'ALBUM', 'BOARD', 'HOMEWORK'].includes(item.postType)
    const memberRole = item.writeUser.memberRole
    const userTypeName = store.getters.getUserTypeNameByCode({code: item.writeUser.userType})
    const memberChildName = item.writeUser.memberChildName || '탈퇴회원'

    if (isClassPost) {
      switch (memberRole) {
        case 'MANAGER':
        case 'OWNER':
          str += userTypeName
          break

        // 클래스 탈퇴 등으로 구독 정보가 삭제된 경우
        case null:
          str += ` (탈퇴회원)`
          break

        default:
          str += ` (${memberChildName} ${userTypeName})`
      }
    }
    return str
  },

  /**
   * type 에 따른 unique 이미지 파일명 지정
   * @param type
   * @returns {string}
   */
  getUniqueFileNameFromType(type) {
    let uniqueFileName = uuidv4()
    let extension = ''
    switch (type) {
      case 'image/gif': {
        extension = 'gif'
        break
      }
      case 'image/jpeg': {
        extension = 'jpg'
        break
      }
      case 'image/png': {
        extension = 'png'
        break
      }
      case 'image/svg+xml': {
        extension = 'svg'
        break
      }
      default: {
        // 이미지 파일이 blob 이며, 알 수 없는 type 인 경우 확장자를 임의로 지정
        extension = 'jpg'
      }
    }
    return uniqueFileName + '.' + extension
  },

  documentBodyScrollToTop(VueInstance) {
    VueInstance.$scrollTo("body", { duration: 0 })
  },

  copyToClipboard(value, message) {
    const dummy = document.createElement('textarea')
    document.body.appendChild(dummy)
    dummy.value = value
    dummy.select()
    document.execCommand('copy')
    document.body.removeChild(dummy);
    return this.alert(message || '링크가 복사되었습니다.', null, false)
  },

  tbdAlert(message) {
    return this.alert(message || '준비중입니다', null, false)
  },

  textareaAutoResize(element, heightDefault) {
    if (Array.isArray(element))
      element = element[0]

    if (element && element.style) {
      element.style.height = `${heightDefault || 24}px`
      element.style.height = `${element.scrollHeight}px`
    }
  },

  indexedDB: {
    async getIndexedDatabase() {
      return new Promise((resolve, reject) => {
        let request = window.indexedDB.open('hitalk', 1);

        request.onerror = e => {
          console.log('Error opening db', e);
          reject('Error');
        };

        request.onsuccess = e => {
          resolve(e.target.result);
        };

        request.onupgradeneeded = e => {
          console.log('onupgradeneeded');
          const database = e.target.result;
          database.createObjectStore('records', { autoIncrement: true, keyPath:'sequence' });
        };
      });
    },
    async addRecordsToDatabase(database, requestInput) {
      return new Promise((resolve, reject) => {
        const trans = database.transaction(['records'],'readwrite');
        trans.oncomplete = e => {
          resolve();
        };

        const store = trans.objectStore('records');
        requestInput.sequence = `${requestInput.room}_${new Date().getTime()}`;
        store.add(requestInput);
      });
    }
  }

}; // end _hiClass custom APIs


/**
 * set _hiClass[standardApis]
 */
for (const standardApi of standardApis) {

  _hiClass[standardApi] = {
    search(requestParams) {
      const url = `${api}/${standardApi}/!q`
      return _rest.search(requestParams, url)
    },
    create(requestBody) {
      const url = `${api}/${standardApi}`
      return _rest.create(requestBody, url)
    },
    read(requestUriOrBody) { 
      if (!requestUriOrBody.startsWith('http') && !requestUriOrBody.startsWith(`/${standardApi}`))
        requestUriOrBody = `/${standardApi}/${requestUriOrBody}`
      return _rest.read(requestUriOrBody);
    },
    readParams(requestUriOrBody, requestParams) {
      return _rest.readParams(requestUriOrBody, requestParams);
    },
    update(requestBody, url) {
      return _rest.update(requestBody, url);
    },
    delete(requestUriOrBody) {
      return _rest.delete(requestUriOrBody);
    }
  }
  
}

Vue.prototype.$adUrl = ad;
Vue.prototype.$apiUrl = api;
Vue.prototype.$apiFileUrl = apiFile;
Vue.prototype.$apiFilesUrl = apiFiles;
Vue.prototype.$apiFileSheetUrl = apiFileSheet;
Vue.prototype.$hiStoreUrl = hiStoreUrl;
Vue.prototype.$webUrl = webUrl;
Vue.prototype.$replaceStrongToBTag = replaceStrongToBTag;

const HiClass = {};
HiClass.install = function (Vue) {
  Vue.hiClass = _hiClass;
  window.hiClass = _hiClass;
  Object.defineProperties(Vue.prototype, {
    hiClass: {
      get() {
        return _hiClass;
      }
    },
    $hiClass: {
      get() {
        return _hiClass;
      }
    },
  });
};

Vue.use(HiClass)

/**
 * vue global config
 */
const isProduction = process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net'
Vue.config.devtools = !isProduction   // dev, stage server devtools test
Vue.config.performance = true
Vue.config.productionTip = false
Vue.config.ignoredElements = [
  /^hitalk-vote-/,
  /^timetable-/,
  /^text-main/,
  /^uiux-page/,
  /^weblink-detail/
];

export default HiClass;
