import Vue from "vue";
import jwt_decode from "jwt-decode";
import moment from '@/plugins/moment.js'

const authentication = {
  clear() {
    const removeItem = {
      userLoginKeys: [ 'clientRegistrationId', 'ocrId', 'principalName', 'userType', 'uuid', 'name', 'idToken', 'idTokenExpiresTimestamp', 'refreshToken' ],
      userDeactivateKeys: [ 'isLoginUserForceLogout' ],
      flagKeys: [
        'remindClassMemberEmpty', // clazzes > note > remindClassMemberEmpty
        'ignoreAlarmPlusInviteCard', // 가정통신문 플러스 초대장 보류 건 삭제
        'stickerPacksByLoginUserType', // 사용자 스티커 팩 삭제
        'stickerItemsByPackSeq', // 스티커 팩 캐시 삭제
        'isChangedClassSettings', // 클래스 설정 변경을 다른 페이지(알림장 등)에서 감지하기 위한 flag
      ],
      ssoLoginKeys: [
        'ssoLoginCheckUid', // SSO login check uid. 로그인한 하이클래스와 아이스크림 계정의 동일 여부 검증
        'isLoadingSsoLoginCheck', // SSO login check loading. component timeout 후 자동 삭제되도록 처리
      ],
      etcKeys: [
        'schoolUri',
        'scrapSearchKeyword', // mypage > scrap > recentSearchKeyword
        'chatUncheckedMessage', // GNB 하이톡 읽지 않은 메시지 처리 개인화
        'postsCheckedTimestampByClassId', // 클래스 게시글 업데이트 표시
        'lastSendPostRemind', // 클래스 게시글 리마인드 알림 최종전송시간
        'CONSENT_AGREEMENT_CACHE', // 약관 동의 일일 1회 호출 캐시
      ]
    }
    const removeSessionItems = [
      'userCertificationId'
    ]
    
    for(const items of Object.values(removeItem)) {
      items.forEach(item => localStorage.removeItem(item))
    }
    
    removeSessionItems.forEach(item => sessionStorage.removeItem(item))
  },

  load() {
    return {
      "clientRegistrationId": localStorage.clientRegistrationId,
      "ocrId": localStorage.ocrId,
      "principalName": localStorage.principalName,
      "userType": localStorage.userType,
      "uuid": localStorage.uuid,
      "name": localStorage.name,
      // token을 상위로 가져오면 다른 파라미터를 못 가져오는 현상 있음 (IE)
      "idToken": localStorage.idToken,
      "idTokenExpiresTimestamp": localStorage.idTokenExpiresTimestamp,
      "refreshToken": localStorage.refreshToken
    }
  },
  save(auth) {
    localStorage.setItem("clientRegistrationId", auth.clientRegistrationId);
    localStorage.setItem("ocrId", auth.ocrId);
    localStorage.setItem("principalName", auth.principalName);
    localStorage.setItem("userType", auth.userType);
    localStorage.setItem("uuid", auth.uuid);
    localStorage.setItem("name", auth.name);

    if (auth.idToken && auth.idToken !== 'undefined' && auth.idToken !== 'null') {
      const idToken = auth.idToken
      localStorage.setItem("idToken", idToken);

      try {
        const decoded = jwt_decode(idToken)
        // decoded.exp is unix timestamp (not milliseconds!)
        localStorage.setItem("idTokenExpiresTimestamp", moment(decoded.exp * 1000).valueOf().toString());
      } catch (e) {
        Vue.$log.error(e)
      }
    }

    if (auth.refreshToken && auth.refreshToken !== 'undefined' && auth.refreshToken !== 'null')
      localStorage.setItem("refreshToken", auth.refreshToken);
  },
  isAuthenticated() {
    if (!localStorage.uuid || !localStorage.idToken) return false

    let decoded = {}

    try {
      decoded = jwt_decode(localStorage.idToken)
      if (decoded.uuid !== localStorage.uuid)
        Vue.$log.error('localStorage.uuid 와 localStorage.idToken.uuid 의 값이 다릅니다.\n로그아웃됩니다.')

    } catch (e) {
      Vue.$log.error('jwt_decode error', e)
      return !!(localStorage.uuid && localStorage.idToken)
    }

    return localStorage.uuid === decoded.uuid
  }
};

Vue.prototype.$authentication = authentication;

export default authentication;
