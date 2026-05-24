import Vue from 'vue'
import router from "@/plugins/router";

const Error = {
  MEMBER: [
    { errorCode: 404, errMessage: 'NotFoundClazzSubscribe', message: '미구독 클래스입니다.', notificationType: 'alert_goMain' },
    { errorCode: 406, errMessage: '', message: '접근권한이 없습니다.', notificationType: 'alert_goMain' },
    { errorCode: 406, errMessage: 'NotClassOwner', message: '접근권한이 없습니다.', notificationType: 'alert_goMain' },
    { errorCode: 406, errMessage: 'PermissionDenied', message: '접근권한이 없습니다.', notificationType: 'alert_goMain' },
    { errorCode: 412, errMessage: 'Already processed', message: '이미 처리된 요청입니다.', notificationType: 'alert_refresh' },
    { errorCode: 418, errMessage: 'I’m a teapot', message: '접근권한이 없습니다.', notificationType: 'alert_goMain' },
  ],
  MEMBER_TAG: [
    { errorCode: 404, errMessage: 'NotFoundClazzSubscribe', message: '미구독 클래스입니다.', notificationType: 'alert_goMain' },
    { errorCode: 404, errMessage: 'NotFoundTag', message: '삭제된 태그입니다.', notificationType: 'toast_refresh' },
    { errorCode: 404, errMessage: 'NotFoundClazzMemberTag', message: '삭제된 태그입니다.', notificationType: 'toast_refresh' },
    { errorCode: 406, errMessage: 'PermissionDenied', message: '접근권한이 없습니다.', notificationType: 'alert_goMain' },
    { errorCode: 409, errMessage: 'LimitExceeded', message: '학반(태그)은 최대 10개까지 선택 가능합니다.', notificationType: 'toast' },
  ],
  CLASS_TAG: [
    { errorCode: 404, errMessage: 'NotFoundTag', message: '삭제된 태그입니다.', notificationType: 'toast_refresh' },
    { errorCode: 406, errMessage: '', message: '접근권한이 없습니다.', notificationType: 'alert_goMain'},
    { errorCode: 406, errMessage: 'PermissionDenied', message: '접근권한이 없습니다.', notificationType: 'alert_goMain' },
    { errorCode: 409, errMessage: 'LimitExceeded', message: '학반(태그)은 최대 200개까지 추가 가능합니다.', notificationType: 'toast' },
    { errorCode: 409, errMessage: 'TagNameAlreadyExists', message: '중복된 태그입니다.', notificationType: 'toast' },
    { errorCode: 428, errMessage: 'use in class student list', message: '출결알리기 명단에서 사용중인 학반(태그)는<br>삭제가 불가합니다<br>학생 명단에서 사용중인 태그를 변경해주세요.', notificationType: 'alert' },
  ],
  CLASS_INVITE: [
    { errorCode: 406, errMessage: '', message: '접근권한이 없습니다.', notificationType: 'alert_goMain'},
  ],
  CLASS_STUDENT: [
    { errorCode: 428, errMessage: 'Duplicate student', message: '기존 명단에 중복된 학생이 있습니다.<br>학반을 변경하거나 반번호를 변경해주세요.', notificationType: 'alert'},
  ],
}

export default class ErrorManager {
  getErrorObj(errName = '', err = { response: {} }) {
    const defaultError = { message: '정상적으로 처리되지 않았습니다.<br>잠시후 다시 시도해주세요.', notificationType: 'alert' }
    try {
      const errorCode = err.response.status || null
      const errMessage = (err.response.data || {}).message || ''
      const errCause = (err.response.data || {}).cause || ''
      const errObj = (Error[errName] || {}).find(err => err.errorCode === errorCode && (err.errMessage === errMessage || err.errMessage === errCause))
      return errObj ? errObj : defaultError
    } catch (err) {
      return defaultError
    }
  }

  showErrorMsg(errName, err) {
    let isRefresh = false
    const errObj = this.getErrorObj(errName, err)
    if (errObj.notificationType.includes('alert')) {
      hiClass.alert(errObj.message)
        .then(() => {
          if (errObj.notificationType === 'alert_goMain') {
            router.push('/main', () => {})
          }
        })
    } else if (errObj.notificationType.includes('toast')) {
      Vue.toasted.show(errObj.message)
    }

    if (errObj.notificationType.split('_').pop() === 'refresh') {
      isRefresh = true
    }

    return isRefresh
  }
}