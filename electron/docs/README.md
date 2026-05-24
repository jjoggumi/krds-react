# 하이톡 PC 버전 주요 기술 이슈 구성

## PC 어플이 동작 중일 때 WEB 쪽 푸쉬 알림 차단 구조

### 개요
- 하이톡 PC 버전(이하 어플)과과 웹 간의 푸쉬 알림 충돌을 방지하기 위한 구조
- 어플과 웹이 동일한 FCM 토큰을 공유하는 환경에서, 두 시스템이 동시에 동작할 경우 어플 쪽으로만 푸쉬 알림이 수신되며, WEB 쪽의 읽지 않음 숫자 표시 등의 동작이 정상 동작하도록 보장
- 이를 위해 Stomp 쪽의 사용자 ID 별 채널과 로컬 PC 의 웹소켓 서버를 활용

### 상세 설명
- 어플과 WEB 은 서버 측에서 FCM 토큰을 동일한 카테고리로 관리하므로, /chatWebToken 을 나중에 호출한 시스템이 FCM 을 받게 됨
- 어플과 WEB 의 구동 순서에 상관 없이, 두 시스템이 동시에 동작 중일 때 어플 쪽으로만 푸쉬 알림이 전달되도록 하기 위해 아래와 같이 구성
  - WEB 쪽으로 실시간 알림을 처리하기 위해 Stomp 쪽에 /topic/{{userId}} 이름의 채널을 신설, 이하 "사용자 알림"
  - 어플 쪽에서 로컬 호스트 쪽에 웹소켓 서버를 열고, WEB 쪽에서 해당 서버와 데이터 통신, 이하 "로컬 서버"
  - 어플 구동 시, 사용자 알림을 통해 어플이 실행 되었음을 WEB 에 알림
- WEB 은 하이톡 화면 최초 구동 시점 및 어플 실행에 대한 사용자 알림 수신 시 다음과 같이 동작하여 어플 쪽 푸쉬수신 보장
  - WEB 구동 시 사용자 알림 채널을 통해 로컬 서버 포트 정보를 어플에 요청하고, 어플은 이에 응답
  - WEB 이 로컬 서버에 접속을 시도하고, 접속 성공 후, 만일 이미 FCM 토큰을 받아 둔게 있는 경우, 로컬 서버 쪽으로 FCM 을 갱신해야 함을 알림
  - 어플은 FCM 토큰을 갱신하고, 이후 수신하는 FCM 메시지들을 접속되어 있는 로컬 서버에 릴레이
  - WEB 이 자체적으로 FCM 을 받을 때와 어플로부터 FCM 를 릴레이 받을 때의 콜백 메소드는 onReceivedFcmMessage 로 동일하며, 동작 중인 런타임이 일렉트론일때와 WEB 일때로 구분하여 알림 팝업 표시 여부를 결정
- 어플은 로컬 서버를 통해 WEB 쪽으로 heartbeat 를 1초 간격으로 전달하고, WEB 은 heartbeat 일정 시간 이상 미수신 시 어플이 종료된 것으로 판단하여 FCM 을 다시 수신하도록 설정
- 코드 분석 시, 어플과 WEB 쪽 런타임 코드가 혼재되어 있으므로, electronController.isUnderElectron 조건 처리에 유의하어야 함

### 런타임 관련 주요 구성
  - Hitalk.vue, mounted:
    - 일렉트론이 아닌 경우, tryConnectingToDesktopApplication 호출하여 어플 존재 여부 탐색 시작
    - electornController.setReady() 를 호출하여 일렉트론인 경우 로컬 서버 시작처리
  - electron/src/setupIpcMessageHandlers.js:
    - 어플 구동 시 로컬 서버 시작, FCM 토큰 갱신 요청, 사용자 알림 채널에 어플 구동 알림
  - store.hitalk.js:
    - stomp 클라이언트 연결 시, 사용자 알림 채널을 구독하고, onReceivedUserNotification 콜백 연결
    - onReceivedUserNotification 콜백에서 로컬 서버 포트 정보 요청 및 응답 처리
    - onReceivedUserNotification 콜백에서 로컬 서버 포트 수신 시, connectToDesktopApplication 호출
    - connectToDesktopApplication 에서 로컬 서버 접속 성공 후, 이미 존재하던 fcmToken 이 있을 시, 어플에 fcmToken 갱신 요청
  - ElectronController.js:
    - 로컬 서버와의 연결 및 heartbeat 처리
    - FCM 토큰 갱신 요청 및 응답 처리
    - FCM 메시지 수신 시, onReceivedFcmMessage 콜백 호출

### 관련 코드
  - electron/src/setupIpcMessageHandlers.js
  - electron/src/setupLocalServer.js
  - src/apps/hitalk/Hitalk.vue
  - src/apps/hitalk/utils/ElectronController.js
  - src/plugins/vuex/store.hitalk.js
