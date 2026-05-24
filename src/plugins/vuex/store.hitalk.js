import Vue from 'vue'
import Stomp from "stompjs";
import firebase from "firebase/compat/app";
import axios from "@/plugins/axios";
import moment from '@/plugins/moment.js';
import "firebase/compat/messaging";
import {TabStatus, URLProps, UserLevel} from "@/enums";
import MessageStatus from "../../enums/modules/MessageStatus";
import _ from "lodash";
import comn from "@/assets/js/common.js";
import { isRead, checkTeacherChatTime, formatChatTime,
  useMessageStatusManager, isExpiredRoom, useElectronController } from "@/apps/hitalk/utils";
import { useScreenLockController } from "@/apps/hitalk/utils/screenLock"
import { V2 } from "@/apis/V2";
import { EXTERNAL_LINKS } from '@/constants/externalAssets';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';

const API = new V2();

const VERSION = '/v2';
const PAGE_SIZE_OF_MESSAGES = 20;
const messageStatusManager = useMessageStatusManager();
const electronController = useElectronController();
const screenLockController = useScreenLockController();

const hasTestSituation = k => (document.location.search.substring(1).split('&').filter(k => k.startsWith('test=')).map(k => k.substr(5).split(',')).shift() || []).includes(k);
const messageCallbacks = {}
let firebaseMessaging = null;
let previousNotification = null;

const debouncerForReadMulti = comn.createDebouncer({term: 1000 })
const debouncerForAddingMessage = comn.createDebouncer({term: 200, onFlush: context => {
  if (context.messages.length === 0) return;
  const { messages, state } = context;
  
  messages.forEach(message => {
    const messageCounts = state.messageArrayList.length;
    if (messageCounts === 0 || state.messageArrayList[messageCounts - 1].insertedTimestamp < message.insertedTimestamp) {
      state.messageArrayList.push(message);
      return;
    }
    const index = state.messageArrayList.findIndex(m => m.insertedTimestamp > message.insertedTimestamp);
    state.messageArrayList.splice(index, 0, message);
  });

  context.messages = [];

  const pageThreshold = 2;
  if (state.isScrolledBottom
    && state.messageArrayList.length > PAGE_SIZE_OF_MESSAGES * pageThreshold) {
    state.messageArrayList.splice(0, state.messageArrayList.length - PAGE_SIZE_OF_MESSAGES * pageThreshold);
    state.messageListPageIndex = pageThreshold - 1;
  }
}, context: { messages: [] } })

const throttleOfCallingChatRooms = comn.createThrottle(300)

const storeHitalk = {
  namespaced: true,
  state: {
    connectRoomMembers: [],
    connectRoomItem: {},
    readTargetMessage: {},
    isLogout: false,
    isShowBanner: !localStorage.getItem("hitalkBannerTimeStamp") || (new Date().getTime() - parseInt(localStorage.getItem("hitalkBannerTimeStamp"))) > 24 * 3600 * 1000,
    isShowGuidePopup: false,
    isScrolledBottom: true,
    isNewLastMessageFlag: false,
    isShowVideoViewLayout: false,
    isShowImageViewLayout: false,
    isShowDocumentViewLayout: false,
    isShowNoticePersonalMessageLayout: false,
    isShowNoticeCustomLayout: false,
    isShowNoticeTargetLayout: false,
    isShowEjectionView: false,
    isShowRoomSettingLayout: false,
    isShowCountBadge: false,
    isShowTimeSetting: false,
    isShowChatLayout: false,
    isShowConfirmLayout: false,
    moveBottomScrollFlag: false,
    isLastMessagePageIndex: false,
    isShowStickerMessageBox: false,
    isShowReadMemberLayout: false,
    reconnectRetryCount: 0,
    selectedTab: TabStatus.MEMBER,
    noticeCategory: null,
    confirmCategory: null,
    userNameString: null,
    selectedUserIdString: null,
    loginUser: null,
    userType: null,
    tempChatMessages: {},
    classJSONList: {},
    sortedClassList: [], // #74447 정렬된 클래스 아이디 목록
    messageArrayList: [],
    roomJSONList: {},
    roomArrayList: [],
    selectedStickerItem: {},
    stickerItemArrayList: [],
    noticeTargetUserJSONList: {},
    noticeTargetUserArrayList: [],
    noticePersonalRoomList: [],
    stompClient: null,
    stompClientConnectTimeout: 30000,
    isStompClientConnecting: false,
    roomListPageIndex: 0,
    messageListPageIndex: 0,
    stickerPackPageIndex: 0,
    searchKeyword: '',
    roomSearchKeyword: '',
    isUnReadSort: false,
    totalUnReadMessageCount: 0,
    stickerPackTotalCount: 0,
    stickerPackTotalPageCount: 0,
    timeSetting: 0,
    timer: 0,
    isTimerRunning: false,
    currentClassItem: {},
    fileContent: [],
    currentFileContentIndex: 0,
    videoFileContent: [],
    lazyLoadList:{},
    eventMessage: null,
    isStompConnectError: false,
    disconnectedTimestamp: null,
    chatMoreLayerMessageId: null,
    unReadChatMessages: [],
    unReadChatMessagesCount: 0,
    newLastMessageList: [],
    myNotifications: [],

    isLoadingCallChatUserMessageCount: false,
    /**
     * 하이톡 감정표현 현황 팝업
    */
    hitalkReactionListPopup: {
      isOpen: false,
      messageId: null
    },
    /**
     * 일괄메시지 팝업
     */
    batchPopup: {
      isOpen: false
    },

    /**
     * 1:1 or 단체방 팝업
     */
    personGroupPopup: {
      isOpen: false,
      from: ''
    },

    /**
     * 단체방 대상 선택 팝업
     */
    targetPopup: {
      isOpen: false
    },

    /**
     * 메시지 보내기 팝업 데이터
     */
    sendMessageItem: {
      isOpenPopupCalendar: false, // 메시지 팝업 캘린더 제어
      mode: '', // 등록, 수정
      status: '', // 
      classId: '', // 현재 메시지 보낼 클래스 id
      roomId: '', // 현재 메시지 보낼 대화방 id
      scheduleId: '', // 예약된 메시지의 스케줄 id
      sendType: 'NOW', // 메시지 발송 유형 (즉시: NOW, 예약: RESERVATION)
      roomType: '', // 대화방유형(BATCH:일괄메세지, GROUP:단체방, PERSON:개인방)
      thumbnailPath: '',
      targetPaging: {
        page: 0,
        totalPages: 0
      },
      targets: [], // 대상자
      textContent: '', // 보낼 문자열 메시지 (CHAT)
      fileContent: [], // 보낼 파일 메시지 (FILE, PHOTO, PHOTOMULTI, VIDEO)
      fileContentType: '', // 첨부할(첨부된) 파일 타입 (PHOTO, FILE, VIDEO)
      reservationTime: 0, // 예약발송시 예약시간,
      messages: [], // 예약된 메시지의 전송 메시지
      classSubscribes: [], // 클래스 구독자
      isGetAllClassSubscribes: false // 클래스 구독자 모두 불러와졌는지
    },

    /**
     * 예약 메시지 목록
     */
    reservation: {
      searchList: [], // 검색
      deleteList: [], // 삭제할
      count: 0, // 예약건수
      paging: { // 검색 페이징
        page: 0,
        size: 20,
        isEnd: false,
        scrollLimit: 400
      },
      isSearchMode: false // 키워드 검색했는지
    },

    currentRoomReservationCount: 0, // 현재 대화방의 예약건수
    reservationMessagesResult: [], // 예약 발송 알림푸시 데이터
    isShowHitalkNoticeLayout: false, // 하이톡 정책 변경 알림 모달
    userTime: {},
    userTimeForNotification: {},
    indexedDatabase: null,
    isChatRoomLoad: false,            // 하이톡 채팅방 로드 완료 여부
    roomListPageInfo: {
      number: 0,
      size: 500,
      totalElements: 0,
      totalPages: 0
    },
    blockedUsers: [],
    apiVersionPrefix: VERSION,
    pendingMessages: [],
    serviceWorkerRegistration: null,
    fcmToken: null,
    connectedRoomIdOnOtherSession: null,

    // #84397 하이톡 최초 시작 시 사용여부 설정
    timeSettingInitData: null
  },
  getters: {
    messageArrayList: (state, /*getters*/)=>{
      return _.sortBy(state.messageArrayList, [
        (item) => Object.keys(item).includes('id') ? 0 : 1,
        (item) => item.insertedTimestamp || item.timestamp
      ]);
    },
    noticeClassList: (state, /*getters*/) => {
      const ltrim = (value) => {
          return value.replace(/^\s+/,"");
      }
      const rtrim = (value) => {
          return value.replace(/\s+$/,"");
      } 
      const searchKeywords = rtrim(ltrim(state.searchKeyword)).split(' ')
      return state.classJSONList ? Object.keys(state.classJSONList)
        .map(key => {
          return state.classJSONList[key]
        })
        .filter(classItem => {
          return classItem.memberRole !== UserLevel.MEMBER
            && (state.searchKeyword.trim() !== '' ? searchKeywords.filter(o => o.trim() !== '').some(word => classItem.class.className.match(word.trim())) : true)
        }) : [];
    },
    /**
     * #74447 채팅 클래스 목록을 메인 화면 클래스 목록 기준으로 정렬 (2025.05.14)
     * @param {*} state 
     * @returns 
     */
    noticeSortedClassList: (state) => {
      const ltrim = (value) => {
          return value.replace(/^\s+/,"");
      }
      const rtrim = (value) => {
          return value.replace(/\s+$/,"");
      } 
      const searchKeywords = rtrim(ltrim(state.searchKeyword)).split(' ')
      const filteredClassList = []
      state.sortedClassList
        .filter(clazz => clazz.memberRole !== UserLevel.MEMBER && 
                          (state.searchKeyword.trim() !== '' ? 
                            searchKeywords.filter(o => o.trim() !== '').some(word => classItem.class.className.match(word.trim())) : true))
        .forEach(clazz => {
          if ( state.classJSONList?.hasOwnProperty(clazz.classId) ) {
            filteredClassList.push(state.classJSONList[clazz.classId]);
          }
        });  
      return filteredClassList;
    },
    /**
     * #74447 채팅 클래스 목록을 메인 화면 클래스 목록 기준으로 정렬 (2025.05.14)
     * @param {*} state 
     */
    sortedClassList: (state) => {
      const filteredClassList = []
      state.sortedClassList.forEach(clazz => {
        if ( state.classJSONList?.hasOwnProperty(clazz.classId) ) {
          let classItem = state.classJSONList[clazz.classId];
          if (classItem && classItem.users && classItem.users.length) {
            filteredClassList.push(classItem);
          }
        }
      });  
      return filteredClassList;
    },
    currentRoomMaster: (state,/*getters*/) => {
      if (!state.connectRoomItem) return "";
      return state.connectRoomMembers.find(o => o.isMaster);
    },
    isMasterInCurrentRoom: (_, getters) => {
      return (getters.currentRoomMaster || {}).userId === localStorage.uuid;
    },
    currentRoomTargetMember: (state,/*getters*/) => {
      if (!state.connectRoomItem) return "";
      if (state.connectRoomItem.roomType === "GROUP") return "";
      if (!state.connectRoomMembers.length === 0) return "";
      let mem = state.connectRoomMembers;
      for (const memTemp of mem) {
        if (memTemp.userId !== localStorage.uuid) {
          memTemp.clazz = (state.classJSONList[memTemp.classId] || {}).class
          return memTemp;
        }
      }
      return "";
    },
    currentRoomName: (state, getters) => {
      if(!state.connectRoomItem) return ''

      return state.connectRoomItem.roomType === 'GROUP'
        ? state.connectRoomItem.personRoomName || state.connectRoomItem.roomName || '단체방'
        : state.connectRoomItem.roomName
    },
    getDayName: () => d => '일월화수목금토'[d],
    currentRoomClassName: (state) => {
      if(!state.connectRoomItem) return ''
      const clazz = state.classJSONList[state.connectRoomItem.classId]
      let className = clazz && clazz.class && clazz.class.className ? clazz.class.className : '';
      return className;
    },
    currentRoomMemberCount: (state) => {
      if(!state.connectRoomMembers) return 0
      return state.connectRoomMembers.length
    },
    currentRoomProfileImage: (state, getters) => {
      if(!state.connectRoomItem) {
        return ''
      }

      const defaultUserPhoto = URLProps.DEFAULT_PROFILE_IMAGE_URL
      const bgImageStyle = (url) => `background-image: url(${url || defaultUserPhoto})`
      if (state.connectRoomItem.roomType === "GROUP") {
        const clazz = state.classJSONList[state.connectRoomItem.classId]

        const classPhoto = clazz
          ? clazz.class.classImagePath || EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
          : EXTERNAL_LINKS.IMAGES.DEFAULT_CLASS
        return bgImageStyle(classPhoto)
      }
      const otherUsers = state.connectRoomMembers.filter(m => m.userId !== localStorage.uuid)
      if(otherUsers.length === 0) {
        return bgImageStyle('')
      }
      return bgImageStyle(otherUsers.shift().photo)
    },
    connectCurRoomMembers: (state, /*getters*/) => {
      let connectMemberJsonList = {};
      for (let roomMember of state.connectRoomMembers) {
        Vue.set(connectMemberJsonList, roomMember.userId, roomMember);
      }
      return connectMemberJsonList;
    },
    isNewLastMessageFlag: (state) => {
      return state.isNewLastMessageFlag
    },
    newLastMessageList: (state) => {
      return state.newLastMessageList
    },
    chatRoomList: (state,/*getters*/) => {
      const ltrim = (value) => {
          return value.replace(/^\s+/,"");
      }
      const rtrim = (value) => {
          return value.replace(/\s+$/,"");
      } 
      const searchKeywords = rtrim(ltrim(state.roomSearchKeyword)).split(' ')
      const searchResults = state.roomArrayList.filter(room => searchKeywords.filter(o => o.trim() !== '').some(input => room.keyword.some(k => k.match(input.trim()))))

      const person = searchResults.filter(r => r.roomType === 'PERSON')
        .sort((a, b) => b.settings.user.lastChatMessage.insertedTimestamp - a.settings.user.lastChatMessage.insertedTimestamp)
      const group = searchResults.filter(r => r.roomType === 'GROUP')
        .sort((a, b) => b.settings.user.lastChatMessage.insertedTimestamp - a.settings.user.lastChatMessage.insertedTimestamp)
      return state.roomSearchKeyword.trim() !== '' ? [...person, ...group] : state.roomArrayList
    },
    isInBlockedRoom: (state) => {
      return state.loginUser.userType === 'TEACHER' &&
        state.connectRoomItem.roomType === 'PERSON' &&
        state.connectRoomMembers.map(m => m.userId)
          .some(o => state.blockedUsers.map(b => b.userId).includes(o))
    },
    meInConnectRoom: (state) => {
      return state.connectRoomMembers.find(m => m.userId === localStorage.uuid)
    },
    isConnectRoomExpired: (state) => {
      return isExpiredRoom(state.connectRoomItem)
    },
    isBlockedInChatRoom: (state) => {
      return !(state.connectRoomMembers.find(m => m.userId === localStorage.uuid).chatUsed || false)
    }
  },
  mutations: {
    setConnectRoomItem: (state, room) => {
      debouncerForReadMulti.flush()
      debouncerForAddingMessage.context.messages = []
      state.connectRoomItem = room
      sessionStorage.setItem('connectRoomItem', JSON.stringify(room))
    },
    patchConnectRoomItem: (state, room) => {
      state.connectRoomItem = {...state.connectRoomItem, ...room}
      const idx = state.roomArrayList.findIndex(r => r.room === state.connectRoomItem.roomId)
      if (idx > -1) {
        state.roomArrayList[idx] = {...state.roomArrayList[idx], ...room}
        state.roomArrayList = [...state.roomArrayList]
      }
      sessionStorage.setItem('connectRoomItem', JSON.stringify(state.connectRoomItem))
    },
    patchConnectRoomMembers: (state, member) => {
      const idx = state.connectRoomMembers.findIndex(m => m.userId === member.userId)
      if (idx > -1) {
        state.connectRoomMembers[idx] = {...state.connectRoomMembers[idx], ...member}
        state.connectRoomMembers = [...state.connectRoomMembers]
      }
    },
    setConnectRoomMembers: (state, members) => {
      state.connectRoomMembers = [...members]
    },
    patchRoomMemberReadtime: (state, { roomId, userId, timestamp, updateMessageCount}) => {
      if (state.messageArrayList.length === 0) return
      const foundMember = state.connectRoomMembers.find(m => m.userId === userId)
      if (!foundMember) return
      foundMember.readTimestamp = Math.max(foundMember.readTimestamp, timestamp)
      if (userId !== localStorage.uuid || !updateMessageCount) return
      const roomItem = state.roomArrayList.find(r => r.room === roomId)
      if (!roomItem) return
      roomItem.settings.user.messageCount = state.messageArrayList.filter(m => m.insertedTimestamp > foundMember.readTimestamp).length
      state.totalUnReadMessageCount = state.roomArrayList.filter(r => !isExpiredRoom(r)).reduce((acc, room) => acc + room.settings.user.messageCount, 0)
      state.isShowCountBadge = state.totalUnReadMessageCount > 0
    },
    updateUnreadCountBadge: (state) => {
      const count = state.totalUnReadMessageCount || 0
      electronController.setBadge(`${count === 0 ? '' : count > 9 ? '9+' : count}`)
    },
    updateRecentChat: (state, message) => {
      const roomItem = state.roomArrayList.find(r => r.room === message.room)
      if (roomItem) {
        roomItem.settings.user.lastChatMessage = {...message, insertedTimestamp: new Date().getTime()}
        roomItem.settings.memberCount = state.connectRoomMembers.length
      }
    },
    updateUnreadMessageCountAndRecentChat: (state, message) => {
      const roomItem = state.roomArrayList.find(r => r.room === message.room)
      if (roomItem) {
        roomItem.settings.user.messageCount++
        roomItem.settings.user.lastChatMessage = {...message, insertedTimestamp: new Date().getTime()}
      }
    },
    addConnectRoomMembers: (state, addInfo) => {
      const getUserName = (member) => {
        switch (member.userType) {
          case UserLevel.TEACHER:
            return `${member.user.userName} 선생님`;
          case UserLevel.STUDENT:
            return `${member.memberChildName} 학생`;
          case UserLevel.PARENTS:
            return `${member.memberChildName} 학부모(${member.user.userName})`;
          default:
            return `${member.user.userName}`;
        }
      }
      const classUsers = state.classJSONList[state.connectRoomItem.classId].users
      const members = classUsers.filter(u => addInfo.addMemberIds.includes(u.userId))
      const addMembers = members.map(m => {
        return {
          id: m.memberId,
          isMaster: false,
          joinTimestamp: addInfo.joinTimestamp,
          name: getUserName(m),
          photo: m.user.userPhoto,
          readTimestamp: 0,
          role: m.memberRole,
          userId: m.userId,
          userType: m.userType
        }
      })
      state.connectRoomMembers = [...state.connectRoomMembers, ...addMembers]
    },
    setHitalkReactionListPopup: (state, info) => {
      state.hitalkReactionListPopup = info
    },
    setIsLogout: (state, isLogout) => {
      state.isLogout = isLogout
    },
    setRoomListPageInfo: (state, pageInfo) => {
      state.roomListPageInfo = {...pageInfo}
    },
    setIsChatRoomLoad: (state, isLoad) => {
      state.isChatRoomLoad = isLoad
    },
    setShowBanner: (state, isShowBanner) => {
      state.isShowBanner = isShowBanner;
    },
    setIsScrolledBottom: (state, isScrolledBottom) => {
      state.isScrolledBottom = isScrolledBottom;
    },
    setIsNewLastMessageFlag: (state, isNewLastMessageFlag) => {
      state.isNewLastMessageFlag = isNewLastMessageFlag;
    },
    setEventMessage: (state, eventMessage) => {
      state.eventMessage = eventMessage;
    },
    setVideoFileContent: (state, videoFileContent) => {
      state.videoFileContent = videoFileContent;
    },
    addNoticeTargetUser: (state, noticeTargetUser) => {
      const keyValue = noticeTargetUser.hasOwnProperty('userId') ? 'userId' : 'currentId'
      Vue.set(state.noticeTargetUserJSONList, noticeTargetUser[keyValue], noticeTargetUser);
      state.noticeTargetUserArrayList.splice(0);
      for (let key in state.noticeTargetUserJSONList) {
        state.noticeTargetUserArrayList.push(state.noticeTargetUserJSONList[key]);
      }
    },
    deleteNoticeTargetUser: (state, noticeTargetUser) => {
      const keyValue = noticeTargetUser.hasOwnProperty('userId') ? 'userId' : 'currentId'
      Vue.delete(state.noticeTargetUserJSONList, noticeTargetUser[keyValue]);
      state.noticeTargetUserArrayList.splice(0);
      for (let key in state.noticeTargetUserJSONList) {
        state.noticeTargetUserArrayList.push(state.noticeTargetUserJSONList[key]);
      }
    },
    deleteNoticeTargetUserList: (state, noticeTargetUserList) => {
      noticeTargetUserList.forEach(noticeTargetUser => {
        const keyValue = noticeTargetUser.hasOwnProperty('userId') ? 'userId' : 'currentId'
        Vue.delete(state.noticeTargetUserJSONList, noticeTargetUser[keyValue]);
        state.noticeTargetUserArrayList.splice(0);
        for (let key in state.noticeTargetUserJSONList) {
          state.noticeTargetUserArrayList.push(state.noticeTargetUserJSONList[key]);
        }
      })
    },
    setFileContent: (state, fileContent) => {
      state.fileContent = fileContent;
    },
    setCurrentFileContentIndex: (state, currentFileContentIndex) => {
      state.currentFileContentIndex = currentFileContentIndex;
    },
    setNoticeCategory: (state, noticeCategory) => {
      state.noticeCategory = noticeCategory;
    },
    setTargetReadMessage: (state, message) => {
      state.readTargetMessage = message
    },
    setSelectedUserIdString: (state, selectedUserIdString) => {
      state.selectedUserIdString = selectedUserIdString;
    },
    setUserNameString: (state, userNameString) => {
      state.userNameString = userNameString;
    },
    setShowConfirmLayout: (state, payload) => {
      state.isShowConfirmLayout = payload.isShowConfirmLayout;
      state.confirmCategory = payload.confirmCategory;
    },
    clearNoticeTargetUserList: (state, /*payload*/) => {
      state.noticeTargetUserJSONList = {};
      state.noticeTargetUserArrayList.splice(0);
    },
    clearChatMessageList: (state, /*payload*/) => {
      state.messageArrayList.splice(0);
    },
    setSearchKeyword: (state, keyword) => {
      state.searchKeyword = keyword;
    },
    setRoomSearchKeyword: (state, keyword) => {
      state.roomSearchKeyword = keyword;
    },
    setIsUnReadSort: (state, value) => {
      state.isUnReadSort = value
    },
    setRoomListPageIndex: (state, pageIndex) => {
      state.roomListPageIndex = pageIndex;
    },
    setTempChatMessages: (state, {roomId,message}) => {
      Vue.set(state.tempChatMessages, roomId, message);
    },
    setMessageListPageIndex: (state, pageIndex) => {
      state.messageListPageIndex = pageIndex;
    },
    setStickerPackPageIndex: (state, pageIndex) => {
      state.stickerPackPageIndex = pageIndex;
    },
    setStickerItemArrayList: (state, stickerItemArrayList) => {
      state.stickerItemArrayList = stickerItemArrayList;
    },
    setSelectedStickerItem: (state, stickerItem) => {
      state.selectedStickerItem = stickerItem;
    },
    setCurrentClassItem: (state, classItem) => {
      state.currentClassItem = classItem;
    },
    showGuidePopup: (state) => {
      state.isShowGuidePopup = true;
    },
    hideGuidePopup: (state) => {
      state.isShowGuidePopup = false;
    },
    showVideoViewLayout: (state) => {
      state.isShowVideoViewLayout = true;
    },
    hideVideoViewLayout: (state) => {
      state.isShowVideoViewLayout = false;
    },
    showDocumentViewLayout: (state) => {
      state.isShowDocumentViewLayout = true;
    },
    hideDocumentViewLayout: (state) => {
      state.isShowDocumentViewLayout = false;
    },
    showImageViewLayout: (state) => {
      state.isShowImageViewLayout = true;
    },
    hideImageViewLayout: (state) => {
      state.isShowImageViewLayout = false;
    },
    showConfirmLayout: (state) => {
      state.isShowConfirmLayout = true;
    },
    hideConfirmLayout: (state) => {
      state.isShowConfirmLayout = false;
    },
    showReadMemberLayout: (state) => {
      state.isShowReadMemberLayout = true;
    },
    hideReadMemberLayout: (state) => {
      state.isShowReadMemberLayout = false;
    },
    showEjectionView: (state) => {
      state.isShowEjectionView = true;
    },
    hideEjectionView: (state) => {
      state.isShowEjectionView = false;
    },
    showNoticeCustomLayout: (state) => {
      state.isShowNoticeCustomLayout = true;
    },
    hideNoticeCustomLayout: (state) => {
      state.isShowNoticeCustomLayout = false;
    },
    showNoticeTargetLayout: (state) => {
      state.isShowNoticeTargetLayout = true;
    },
    hideNoticeTargetLayout: (state) => {
      state.isShowNoticeTargetLayout = false;
    },
    showNoticePersonalMessageLayout: (state) => {
      state.isShowNoticePersonalMessageLayout = true;
    },
    hideNoticePersonalMessageLayout: (state) => {
      state.isShowNoticePersonalMessageLayout = false;
    },
    showRoomSettingLayout: (state) => {
      state.isShowRoomSettingLayout = true;
    },
    hideRoomSettingLayout: (state) => {
      state.isShowRoomSettingLayout = false;
    },
    showChatLayout: (state) => {
      state.isShowChatLayout = true;
    },
    hideChatLayout: (state) => {
      state.isShowChatLayout = false;
    },
    showStickerMessageBox: (state) => {
      state.isShowStickerMessageBox = true;
    },
    hideStickerMessageBox: (state) => {
      state.isShowStickerMessageBox = false;
    },
    setTabMember: (state) => {
      state.selectedTab = TabStatus.MEMBER;
    },
    setTabRoom: (state) => {
      state.selectedTab = TabStatus.ROOM;
    },
    setTabReservation: (state) => {
      state.selectedTab = TabStatus.RESERVATION;
    },
    setTabVote: (state) => {
      state.selectedTab = TabStatus.VOTE;
    },
    toggleStickerMessageBox: (state) => {
      state.isShowStickerMessageBox = !state.isShowStickerMessageBox;
    },
    toggleTimeSetting: (state) => {
      state.isShowTimeSetting = !state.isShowTimeSetting;
    },
    setClassJSONList: (state, payload) => {
      state.classJSONList = {};
      for (let userItem of payload.userList) {
        if (!state.classJSONList[userItem.clazz.classId]) {
          Vue.set(
            state.classJSONList,
            userItem.clazz.classId,
            {
              classId: userItem.clazz.classId,
              class: userItem.clazz,
              memberRole: '',
              users: [],
              member: [],
              owner: [],
              manager: []
            }
          );
        }
        if (userItem.user.userId === localStorage.uuid) {
          state.classJSONList[userItem.clazz.classId].memberRole = userItem.memberRole;
          state.classJSONList[userItem.clazz.classId].me = userItem;
          continue;
        }
        switch (userItem.memberRole) {
          case UserLevel.MEMBER:
            if (userItem.userType === UserLevel.TEACHER) {
              userItem.userType = UserLevel.PARENTS;
            }
            state.classJSONList[userItem.clazz.classId].member.push(userItem);
            break;
          case UserLevel.MANAGER:
            state.classJSONList[userItem.clazz.classId].manager.push(userItem);
            break;
          case UserLevel.OWNER:
            state.classJSONList[userItem.clazz.classId].owner.push(userItem);
            break;
        }
      }
      for (let key in state.classJSONList) {
        switch (state.classJSONList[key].memberRole) {
          case UserLevel.MANAGER:
          case UserLevel.OWNER:
            state.classJSONList[key].users
              = state.classJSONList[key].owner.concat(state.classJSONList[key].manager, state.classJSONList[key].member);
            break;
          case UserLevel.MEMBER:
            state.classJSONList[key].users
              = state.classJSONList[key].owner.concat(state.classJSONList[key].manager);
            break;
        }
      }
    },
    /**
     * #74447 채팅 목록 메인 화면 기준으로 정렬 (2025.05.14)
     * @param {*} state 
     * @param {*} payload 
     */
    setsortedClassList: (state, payload) => {
      state.sortedClassList = payload.classList.map(clazz => { return {classId: clazz.classId, className: clazz.className, memberRole: clazz.memberRole} });
    },
    setTimer: (state, payload) => {
      state.timer = payload.timer;
    },
    clearTimer: (state) => {
      clearInterval(state.timer);
      state.timer = null;
      state.isTimerRunning = false;
    },
    timerStart: (state) => {
      clearInterval(state.timer);
      state.timeSetting = 60 * 60 * 5;
      state.timer = null;
      state.isTimerRunning = true;
      state.timer = setInterval(() => {
        if (state.selectedTab === TabStatus.MEMBER) {
          clearInterval(state.timer);
          state.timer = null;
          state.isTimerRunning = false;
        }
        if (state.timeSetting > 0) {
          state.timeSetting--;
        } else {
          clearInterval(state.timer);
          state.timer = null;
          state.isTimerRunning = false;
          state.selectedTab = TabStatus.MEMBER;
          setTimeout(() => {
            alert("일정 시간동안 응답이 없어 채팅 접속이 종료되었습니다.");
          }, 300);
        }
      }, 1000);
    },
    setTimeSetting: (state, time) => {
      state.timeSetting = time;
    },
    setChatRoomList: async (state, roomList) => {
      if (state.roomListPageIndex === 0) {
        state.roomArrayList.splice(0);
      }
      let tempChatRoomList = roomList.filter(chatRoom => {
        return chatRoom.settings && chatRoom.settings.user.lastChatMessage != null && chatRoom.settings.user.lastChatMessage.content != null
      });
      
      for (let chatRoom of tempChatRoomList) {
        const existsRoom = state.roomArrayList.find(roomArray => roomArray.room === chatRoom.room)
        if (!existsRoom) {
          state.roomArrayList.push(chatRoom);
          Vue.set(state.roomJSONList, chatRoom.room, chatRoom);
        }
      }
    },
    addChatRoomList: (state, roomList) => {
      let tempChatRoomList = roomList.filter(chatRoom => {
        return chatRoom.settings && chatRoom.settings.user.lastChatMessage != null && chatRoom.settings.user.lastChatMessage.content != null
      });
      
      for (let chatRoom of tempChatRoomList) {
        const existsRoom = state.roomArrayList.find(roomArray => roomArray.room === chatRoom.room)
        if (!existsRoom) {
          state.roomArrayList.push(chatRoom);
          Vue.set(state.roomJSONList, chatRoom.room, chatRoom);
        }
      }
    },
    addChatMessage: (state, {message}) => {
      debouncerForAddingMessage.context.state = state;
      debouncerForAddingMessage.context.messages.push(message);
    },
    updateChatMessage: (state, {message}) => {
      const returnType = ['INVITE', 'KICK'];
      if(returnType.includes(message.contentType)) return;
      
      const updateIndex = state.messageArrayList.findIndex((o) => o.currentId === message.currentId)
      const changeList = [...state.messageArrayList]
      changeList[updateIndex] = message
      state.messageArrayList = [...changeList]
    },
    setMessageJSONList: (state, {messageList}) => {
      const messages = messageList.reverse();
      
      if (state.messageListPageIndex === 0) {
        messages.push(...state.pendingMessages.filter(m => m.roomId === state.connectRoomItem.roomId)); // 전송 안된 메시지 추가
        state.messageArrayList = [...messages]
      } else {
        const appendMessage = messages.filter(n => state.messageArrayList.findIndex(o => o.id === n.id) === -1).sort((a, b) => a.insertedTimestamp - b.insertedTimestamp);
        state.messageArrayList = [...appendMessage, ...state.messageArrayList];
      }
    },
    setDisconnectedTimestamp: (state, payload) => {
      state.disconnectedTimestamp = payload.disconnectedTimestamp;
    },
    setChatMoreLayerMessageId: (state, messageId) => {
      state.chatMoreLayerMessageId = messageId
    },
    setUnReadChatMessagesCount: (state, count) => {
      state.unReadChatMessagesCount = count
    },
    setNewLastMessageList: (state, newLastMessageList) => {
      state.newLastMessageList.push(newLastMessageList)
    },
    clearNewLastMessageList: (state) => {
      state.newLastMessageList = []
    },


    /**
     * 팝업 제어 ========================
     */
    setBatchPopupIsOpen(state, isOpen) {
      state.batchPopup.isOpen = isOpen
    },
    setPersonGroupPopupIsOpen(state, {isOpen, from}) {
      state.personGroupPopup.isOpen = isOpen
      state.personGroupPopup.from = isOpen ? (from || 'CHAT') : ''
    },
    setTargetPopupIsOpen(state, isOpen) {
      state.targetPopup.isOpen = isOpen
    },
    setHitalkNoticePopup(state, isOpen) {
      state.isShowHitalkNoticeLayout = isOpen
    },

    /**
     * SendMessageItem
     */
    setSendMessageItem(state, sendMessageItem) {
      Object.entries(sendMessageItem).forEach(([key, value]) => {
        state.sendMessageItem[key] = value
      })
    },
    clearSendMessageItem(state) {
      state.sendMessageItem.isOpenPopupCalendar = false
      state.sendMessageItem.mode = ''
      state.sendMessageItem.status = ''
      state.sendMessageItem.classId = ''
      state.sendMessageItem.roomId = ''
      state.sendMessageItem.scheduleId = ''
      state.sendMessageItem.sendType = 'NOW'
      state.sendMessageItem.roomType = ''
      state.sendMessageItem.thumbnailPath = ''
      state.sendMessageItem.targetPaging.page = 0
      state.sendMessageItem.targetPaging.totalPages = 0
      state.sendMessageItem.targets = []
      state.sendMessageItem.textContent = ''
      state.sendMessageItem.fileContent = []
      state.sendMessageItem.fileContentType = ''
      state.sendMessageItem.reservationTime = 0
      state.sendMessageItem.messages = []
      state.sendMessageItem.classSubscribes = []
      state.sendMessageItem.isGetAllClassSubscribes = false
    },

    /**
     * reservation
     */
    setReservationCount(state, count) {
      state.reservation.count = count
    },
    clearReservationSearchList(state) {
      state.reservation.searchList = []
    },
    deleteReservationSearchList(state, scheduleId) {
      const targetIndex = _.findIndex(state.reservation.searchList, {
        'scheduleId': scheduleId
      })
      if (targetIndex >= 0) {
        state.reservation.searchList.splice(targetIndex, 1)
      }
    },
    setReservationDeleteList(state, deleteList) {
      state.reservation.deleteList = deleteList
    },
    deleteReservationDeleteList(state, scheduleId) {
      const targetIndex = state.reservation.deleteList.findIndex(deleteId => {
        return deleteId === scheduleId
      })
      if (targetIndex >= 0) {
        state.reservation.deleteList.splice(targetIndex, 1)
      }
    },
    setReservationPaging(state, paging) {
      for (const [key, value] of Object.entries(paging)) {
        state.reservation.paging[key] = value
      }
    },
    clearReservationPaging(state) {
      state.reservation.paging.page = 0
      state.reservation.paging.size = 20
      state.reservation.paging.isEnd = false
      state.reservation.paging.scrollLimit = 400
    },
    setReservationIsSearchMode(state, isSearchMode) {
      state.reservation.isSearchMode = isSearchMode
    },
    setReservationItemStatus(state, {scheduleId, status}) {
      let searchItem = _.find(state.reservation.searchList, {scheduleId: scheduleId})
      searchItem.status = status
    },

    /**
     * reservationMessagesResult
     */
    setReservationMessagesResult(state, resultObj) {
      state.reservationMessagesResult.push(resultObj)
    },

    /**
     * currentRoomReservationCount
     */
    setCurrentRoomReservationCount(state, currentRoomReservationCount) {
      state.currentRoomReservationCount = currentRoomReservationCount
    },
    setUserTime(state, userTime) {
      state.userTime = {...userTime}
    },
    setUserTimeForNotification(state, userTime) {
      state.userTimeForNotification = {...userTime}
    },
    setIndexedDatabase(state, database) {
      state.indexedDatabase = database
    },
    setBlockedUsers(state, blockedUsers) {
      state.blockedUsers = blockedUsers
    },
    prepareStompClient(state) {
      state.stompClient = Stomp.client(URLProps.HITALK_CONNECT_URL);
      state.stompClient.reconnect_delay = 2000;
      state.stompClient.debug = () => {};
      state.stompClient.heartbeat.incoming = 20000;
      state.stompClient.heartbeat.outgoing = 20000;
    },
    moveRoomToTop: (state, roomId) => {
      const roomIndex = state.roomArrayList.findIndex(room => room.room === roomId);
      if (roomIndex < 0 || state.roomArrayList[roomIndex].isPin)  return;
      const [room] = state.roomArrayList.splice(roomIndex, 1);
      state.roomArrayList = [
        ...state.roomArrayList.filter(r => r.isPin),
        room,
        ...state.roomArrayList.filter(r => !r.isPin)];
    },
    setPendingMessages(state, messages) {
      state.pendingMessages = messages
    },
    setServiceWorkerRegistration(state, registration) {
      state.serviceWorkerRegistration = registration
    },
    setFcmToken(state, token) {
      state.fcmToken = token
    },
    closeAllPopups(state) {
      state.batchPopup.isOpen = false;
      state.personGroupPopup.isOpen = false;
      state.targetPopup.isOpen = false;
      state.isShowHitalkNoticeLayout = false;
      state.isShowNoticeTargetLayout = false;
      state.isLogout = false;
      state.hitalkReactionListPopup.isOpen = false;
      state.isShowNoticePersonalMessageLayout = false;
      state.isShowNoticeCustomLayout = false;
      state.isShowTimeSetting = false;
      state.isShowImageViewLayout = false;
      state.isShowDocumentViewLayout = false;
      state.isShowVideoViewLayout = false;
      state.isShowReadMemberLayout = false;
      state.isShowGuidePopup = false;
      state.isShowRoomSettingLayout = false;
      // #84397 하이톡 최초 시작 시 사용여부 설정
      state.timeSettingInitData = null;
    },
    setConnectedRoomIdOnOtherSession(state, roomId) {
      state.connectedRoomIdOnOtherSession = roomId
    },

    // #84397 하이톡 최초 시작 시 사용여부 설정
    showTimeSetting: (state) => {
      state.isShowTimeSetting = true;
    },
    hideTimeSetting: (state) => {
      state.isShowTimeSetting = false;
    },
    setTimeSettingInitData: (state, payload) => {
      state.timeSettingInitData = payload ? _.cloneDeep(payload) : null;
    },
    clearTimeSettingInitData: (state) => {
      state.timeSettingInitData = null;
    },
  },
  actions: {
    isNotifyUserChat: ({state}) => {
      switch (state.loginUser.userType) {
        case "TEACHER": {
          return !!(state.userTimeForNotification.userChatDay
            && checkTeacherChatTime(false, state.userTimeForNotification));
        }
        default: {
          return true
        }
      }
    },
    onReceivedFcmMessage: async ({commit, state, dispatch, rootState}, { data }) => {
      const exclusiveHandlingMessages = {
        logout: () => {
          const message = data.message.replace(/&#[0-9]+;/g, (v) => (String.fromCodePoint(parseInt(parseInt(v.replace('&', '').replace('#', '').replace(';', ''), 10).toString(16), 16))));
          new Notification(data.title, {body: message, tag: data.messageId});
          window.close()
          window.opener.location = '/logout'
          commit('setIsLogout', true)
        },
        openChat: () => dispatch('callCheckExistRoom', data)
      }

      if (exclusiveHandlingMessages[data.messageCode]) {
        return exclusiveHandlingMessages[data.messageCode]()
      }

      if (['hiTalkReservationComplete', 'hiTalkReservationFailure', 'hiTalkReservationCancel'].includes(data.messageCode)) {
        commit('setReservationMessagesResult', data)
      }

      const isNotifyUserChat = await dispatch('isNotifyUserChat')
      const isNotFocusedChat = (data.roomId !== state.connectRoomItem.roomId
        && data.roomId !== state.connectedRoomIdOnOtherSession
      )
        || !state.stompClient
        || !state.stompClient.connected
        || (!rootState.isVisibleWindow && data.roomId !== state.connectedRoomIdOnOtherSession)

      if (isNotifyUserChat && isNotFocusedChat && !rootState.isVisibleWindow) {
        dispatch("sendNotificationMessage", { data })
      }

      if (state.stompClient && state.stompClient.connected &&
        ((rootState.isVisibleWindow && data.roomId !== (state.connectRoomItem || {}).roomId) ||
          (electronController.isUnderElectron() && !rootState.isVisibleWindow))) {
        dispatch(state.roomArrayList.some(r => r.room === data.roomId) ? "callChatUserMessageCount" : "callChatRooms")
      }

      if (data.messageCode === 'chatTerminate') {
        dispatch('callChatRooms');
      }
      else if (state.selectedTab === 'room' && data.roomId !== state.connectRoomItem.roomId) {
        dispatch('updateUnreadCountOfRoomListItem', data);
        commit('moveRoomToTop', data.roomId);
      }

      if (!state.stompClient || !state.stompClient.connected) {
        dispatch('validateStompConnection')
        setTimeout(() => {
          dispatch("callChatUserMessageCount")
        }, 1000 * 30)
      }
    },
    updateUnreadCountOfRoomListItem: async ({state}, { roomId, message }) => {
      const roomItem = state.roomArrayList.find(r => r.room === roomId)
      if (!roomItem) return
      const {data: { count }} = await API.chatUserMessageCountChatUserMsgCntUserId(localStorage.uuid, {query: {roomId}})
      roomItem.settings.user.messageCount = count
      roomItem.settings.user.lastChatMessage = {
        content: message,
        contentType: 'CHAT',
        insertedTimestamp: new Date().getTime(),
      }
    },
    tryConnectingToDesktopApplication: ({dispatch}) => {
      if (electronController.isUnderElectron()) return;
      dispatch('sendUserNotification', {contentType: 'REQUEST_DESKTOP_PORT'});
    },
    connectToDesktopApplication: ({dispatch, commit, state: { fcmToken }}, port) =>
      electronController.connectToDesktopApplication(port, {
        onConnected: () => {
          if (fcmToken !== null && fcmToken !== '') {
            electronController.sendMessageForResetingFcmToLocalServer();
            commit('setFcmToken', null);
          }
        },
        onMessage: payload => dispatch('onReceivedFcmMessage', payload),
        onDisconnected: () => dispatch('restorePushEventListener'),
      }),
    prepareFcmServiceWorker: async ({commit, dispatch}) => {
      commit('setServiceWorkerRegistration', await navigator.serviceWorker.register('/hiclass-fcm-sw.js', { scope: '/' }))
      navigator.serviceWorker.addEventListener('message', event => dispatch('onReceivedFcmMessage', event.data));
      dispatch("callUserTimeForNotification")
      firebaseMessaging = firebase.messaging();
      firebaseMessaging.onMessage(payload => dispatch('onReceivedFcmMessage', payload));
    },
    pausePushEventListenerAccordingToUserTime: ({dispatch, state, commit}) => {
      if ((state.loginUser || localStorage).userType !== 'TEACHER'
        || checkTeacherChatTime(false, state.userTimeForNotification || {})
        || electronController.shouldNotShowNotification()
        || electronController.isUnderElectron()) return;
      dispatch("callChatWebToken", { token: '', method: "DELETE" });
      commit("setFcmToken", null);
      (firebaseMessaging || {deleteToken: () => {}}).deleteToken()
    },
    restorePushEventListener: ({commit, state: {fcmToken, serviceWorkerRegistration}, dispatch}) => {
      if (fcmToken !== null || fcmToken === ''
        || firebaseMessaging === null
        || electronController.shouldNotShowNotification()) return
      firebaseMessaging.getToken({ serviceWorkerRegistration }).then((token) => {
        commit("setFcmToken", token);
        dispatch("callChatWebToken", { token, method: "POST" });
      }).catch((err) => {
        console.error('An error occurred while retrieving token. ', err);
      });
    },
    sendNotificationMessage: async ({rootState, state, dispatch, commit}, {data}) => {
      if (electronController.shouldNotShowNotification()) return;
      const callback = event => {
        event.preventDefault(); // 브라우저가 알림 탭에 초점을 맞추지 못하도록 방지
        switch (data.messageCode) {
          case 'hiTalkReservationComplete':
            commit('setTabRoom')
            break
          case 'hiTalkReservationFailure':
          case 'hiTalkReservationCancel':
            commit('setTabReservation')
            break
          default: {
            commit('setTabRoom')
            if (data.roomId) {
              dispatch("callCheckExistRoom", {
                roomType: data.roomType,
                classId: data.classId,
                content: data.sender,
                roomId: data.roomId,
                doNotCreateRoom: true
              });
            }
          }
        }

        if (window) {
          window.focus();
        } else {
          new Notification(data.title, {body: '하이톡을 실행시켜 주세요.'});
        }
      }

      const process = () => {
        const title = screenLockController.isScreenLocked() ? '' : data.title
        const message = screenLockController.isScreenLocked()
          ? '새로운 메시지가 왔습니다.'
          : data.message.replace(/&#[0-9]+;/g, (v) => (String.fromCodePoint(parseInt(parseInt(v.replace('&', '').replace('#', '').replace(';', ''), 10).toString(16), 16))));
        
        if(data.messageCode === "chatTerminate"){
          const deleteIndex = state.myNotifications.findIndex(o => o.tag === data.messageId);
          state.myNotifications[deleteIndex].close();
          state.myNotifications = state.myNotifications.filter((_, i) => i !== deleteIndex)
        } else if (!rootState.isVisibleWindow || data.roomId !== state.connectRoomItem.roomId) {
          if (previousNotification !== null) {
            previousNotification.close();
            previousNotification = null;
          }
          const notification = new Notification(data.title, {body: message, tag: data.messageId});
          previousNotification = notification;
          setTimeout(() => {try { notification.close() } catch(e) { e }}, 1000);

          //notification.addEventListener('click', event => callback(event));

          notification.addEventListener('click', event => {

            event.preventDefault();
            //document.querySelector('button[title="대화목록"].icon.c-list.on').click();

            !screenLockController.isScreenLocked() && callback(event);
            electronController.showWindow();
          });

          state.myNotifications.push(notification);
        }
        
      }

      const isNotifyUserChat = await dispatch('isNotifyUserChat')
      if (!("Notification" in window)) {
        // Check if the browser supports notifications

      } else if (Notification.permission === "granted") {
        if (isNotifyUserChat) process()

      } else if (Notification.permission !== "denied") {
        Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted") {
              if (isNotifyUserChat) process()
            }
          });
      }
    },
    connectStompClient: async ({state, rootState, dispatch}) => {
      if (state.stompClient) {
        await dispatch('disconnectStompClient')
        state.stompClient = null;
      } 
      try { await dispatch('validateStompConnection'); } catch (e) { console.log(e); }
    },
    disconnectStompClient: async ({state, dispatch}) => {
      // state.stompClient.deactivate();
      try {
        await dispatch('clearStompClientSubscriptions');
  
        if (state.stompClient && state.stompClient.connect)
          state.stompClient.disconnect();
        
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    },
    clearStompClientSubscriptions: ({state, dispatch, rootState}) => {
      try {
        if (state.stompClient) {
          const stompClientSubscriptionsIds = Object.keys(state.stompClient.subscriptions)
          if(stompClientSubscriptionsIds.length > 0){
            stompClientSubscriptionsIds.filter(s => !['sub-0', 'userNotification'].includes(s)).forEach(subscribeId => {
              dispatch('unsubscribeStompClient', { subscribeId: subscribeId })
            })
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    },
    unsubscribeStompClient: ({state, /*dispatch,*/ rootState}, { subscribeId }) => {
      try {
        if (state.stompClient && state.stompClient.connect)
          state.stompClient.unsubscribe(subscribeId, {});
        
      } catch (e) {
        rootState.log.error(e)
      }
    },
    callRoomDetail: async ({commit}, roomId) => {
      try {
        const { data } = await API.getRoomRoom(roomId);
        commit('setConnectRoomItem', data)
      } catch(error) {
        console.error(error)
      }
    },
    callRoomMembers: async ({commit, state}, roomId) => {
      try {
        const { data } = await axios.get(`${VERSION}/hitalks/${roomId}/members`);
        const members = (data._embedded || {}).members || []
        const changes = members.map(m => ({ ...m, userType: ['OWNER', 'MANAGER'].includes(m.role) ? 'TEACHER' : 'MEMBER' }));
        commit('setConnectRoomMembers', changes);
        return members
      } catch(error) {
        console.error(error)
      }
    },
    handleOverReconnectRetryCount: ({state, dispatch}) => {
      if (document.querySelector('.toasted-container .toasted')) return;
      Vue.toasted.show('잠시 후 다시 시도해주세요. 서버와 통신이 원활하지 않습니다.', { duration: 2000 })
      dispatch('triggerAnalyticsLogEvent',{ code: 'analytics.chat.count.error.toasted' }, { root: true })
    },
    validateStompConnection: async ({state, dispatch, commit}) => {
      if (state.stompClient && state.stompClient.connected) return;
      if (state.reconnectRetryCount > 0) {
        if (state.reconnectRetryCount++ > 1) dispatch('handleOverReconnectRetryCount');
        return comn.asyncWaitFor(() => state.stompClient && state.stompClient.connected);
      }
      state.reconnectRetryCount = 1;
      commit('prepareStompClient');
      try {
        await comn.promiseWithTimeout(
            new Promise((resolve, reject) => state.stompClient.connect({
            Authorization: `Bearer ${localStorage.idToken}`
          },
            async () => {
              state.stompClient.subscribe('/user/queue/notifications',
                (response) => dispatch('onReceivedNotificationStomp', response),
                { id: 'sub-0', durable: false, "auto-delete": true });
              state.stompClient.subscribe(`/topic/${localStorage.uuid}`,
                (response) => dispatch('onReceivedUserNotification', response),
                { id: 'userNotification', durable: false, "auto-delete": true });
              if (electronController.isUnderElectron()) {
                dispatch('sendUserNotification', {contentType: 'DESKTOP_APP_STARTED'});
              }
              if ((state.connectRoomItem || {}).roomId)
                await dispatch('reconnectChatRoom', { skipValidation: true});
              state.reconnectRetryCount = 0;
              state.isStompConnectError = false;
              commit("timerStart");
              resolve();
            },
            error => {
              dispatch("onConnectErrorStomp", error);
              reject(error);
            }
          )), 3000);
      } catch (e) {
        if (e.toString().indexOf('timeout') >= 0) {
          if (state.stompClient && state.stompClient.disconnect)
            state.stompClient.disconnect();
          state.stompClient = null;
          state.reconnectRetryCount = 0;
        }
        dispatch("onConnectErrorStomp", e);
      }
    },
    connectChatRoom: async ({commit, state, dispatch, rootState}, {roomId, userTime}) => {
      commit('setIsChatRoomLoad', false);
      try { await dispatch('validateStompConnection'); } catch (e) { return; }
      await dispatch('callRoomDetail', roomId)
      await dispatch('callRoomMembers', roomId)

      // 대화방 변경 (callRoomDetail) 후 메시지 목록 갱신
      state.messageListPageIndex = 0;
      await dispatch("callMessageList")

      // 구독 연결 전에 JOIN 메시지 호출하도록 변경.
      if (state.connectRoomMembers.find(o => o.userId === localStorage.uuid)) {
        dispatch('sendStompMessage', { roomId, contentType: "JOIN" });
      }
      state.unReadChatMessages = []
      await dispatch("clearStompClientSubscriptions");
      dispatch('subscribeChatRoom', roomId);

      if (!state.indexedDatabase && !rootState.isProductionUI ) {
        const database = await rootState.hiClass.indexedDB.getIndexedDatabase()
        commit('setIndexedDatabase', database)
      }
      
      const isReadMulti = state.connectRoomItem.roomType === 'GROUP'
        ? true 
        : userTime.isUseChat && userTime.isChatTime

      if( isReadMulti && state.indexedDatabase && !rootState.isProductionUI ) {
        const databaseInput = {
          ...userTime,
          ...state.connectRoomItem,
          sequence: `${state.loginUser.loginId}-${moment().format('YYYY-MM-DD HH:mm:ss')}`,
          userId: localStorage.uuid, userType: state.loginUser.userType
        }  
        await rootState.hiClass.indexedDB.addRecordsToDatabase(state.indexedDatabase, {...databaseInput})
      }

      //version 1.5.32 채팅 레이아웃이 닫혔을때만 열리도록 변경.
      if(!state.isShowChatLayout) {
        state.isShowChatLayout = true;
        commit('setMessageListPageIndex', 0)    //version 1.5.32 추가   
        const messageList = await dispatch("callMessageList");

        if(!userTime.isTeacher && state.connectRoomItem.roomType === 'GROUP' && messageList.length === 0) {
          rootState.hiClass.alert("유효하지 않은 방입니다.", 'warning');
          dispatch('callChatRooms')
        }
      }
      commit('setIsChatRoomLoad', true);     //version 1.5.32 추가 \
      electronController.sendMessageOfRoomConnectionToLocalServer(roomId)
    },
    subscribeChatRoom: ({state, dispatch}, roomId) => {
      state.stompClient.subscribe(
        URLProps.HITALK_SUBSCRIBE_URL + roomId,
        response => dispatch("onReceivedMessageStomp", response),
        { id: roomId + "/" + localStorage.uuid, durable: false, "auto-delete": true }
      );
    },
    reconnectChatRoom: async ({state, dispatch}, { skipValidation }) => {
      if (!(skipValidation || false)) await dispatch('validateStompConnection');
      await dispatch("clearStompClientSubscriptions");

      await dispatch("callMessageList");
      dispatch('subscribeChatRoom', state.connectRoomItem.roomId)
      //version 1.5.32 채팅 레이아웃이 닫혔을때만 열리도록 변경.
      if(!state.isShowChatLayout) {
        state.isShowChatLayout = true;
      }
    },
    disconnectChatRoom: ({commit, state, dispatch}) => {
      if(state.connectRoomItem.roomId){
        const subscribeId = state.connectRoomItem.roomId + "/" + localStorage.uuid
        dispatch('unsubscribeStompClient', { subscribeId: subscribeId })
      }
      dispatch("clearStompClientSubscriptions");
      commit('hideStickerMessageBox')         // version 1.3.52
      commit('setSelectedStickerItem', {})    // version 1.3.52
      commit('hideRoomSettingLayout')         // version 1.3.52
      commit('hideConfirmLayout')             // version 1.3.52
      commit('setConnectRoomItem', {})
      commit('setMessageListPageIndex', 0)
      commit('setIsChatRoomLoad', false);     //version 1.5.32 추가   
    },
    leaveChatRoom: async ({commit, state, dispatch}) => {
      await dispatch('validateStompConnection');
      dispatch('sendStompMessage', { roomId: state.connectRoomItem.roomId, contentType: "LEAVE" });
      dispatch("disconnectChatRoom");
      commit('clearChatMessageList')  // version 1.5.32 추가
      commit('hideChatLayout')        // version 1.5.32 추가
      state.roomListPageIndex = 0;
      // WS 통신 후 적용 되도록 타이머 준건데 없애도 되는지 확인 필요.
      setTimeout(() => {
        dispatch('callChatRooms');
      }, 300);

    },
    onConnectErrorStomp: async ({state, commit, dispatch, rootState}, payload) => {
      console.error("error => ", payload);
      commit("clearTimer");

      let isReconnectFlag = true

      try {
        const isClosedConnectionFrame = payload.body === ''
          && payload.command === 'ERROR'
          && payload.payload.message.includes('Connection to broker closed')

        // webSocket 서버에서 연결을 끊은 경우 즉시 재연결 처리하지 않음
        if (isClosedConnectionFrame) isReconnectFlag = false

        // eslint-disable-next-line
      } catch (e) {}

      if (isReconnectFlag) {
        if (state.isStompConnectError) {
          setTimeout(() => dispatch('validateStompConnection'), 300);
        } else {
          state.isStompConnectError = true;
        }
      }
    },
    onReceivedNotificationStomp: async ({state, commit, dispatch, rootState}, payload) => {
      const message = JSON.parse(payload.body);
      const callbacks = [
        [ 'CHAT', 'limitTimestampExceed', () => {
          rootState.hiClass.alert('채팅방 기간이 종료되었습니다.', 'warning');
          dispatch('callChatRooms');
          dispatch('disconnectChatRoom');
          commit('hideChatLayout');
        } ],
        [ 'CHAT', 'bannedWord', () => {
          Vue.toasted.show('작성하신 문장 내에 사용 금지 단어가 포함되어 있습니다.',{ duration: 3000 });
        }],
        [ 'CHAT', 'noUseChat', async () => {
          if(message.api.roomType === 'PERSON' && message.sender === localStorage.uuid) {
            const targetMember = state.connectRoomMembers.find(o => o.userId !== localStorage.uuid)
            const memberRole = targetMember.role
            const userTime = await dispatch('callUserTime', {userId: targetMember.userId, userType: targetMember.userType, memberRole, isSetUserTime: true})
            if(!userTime.isUseChat) {
              rootState.hiClass.alert('해당 학급에서는 하이톡을 사용하지 않습니다.')
            } else {
              rootState.hiClass.alert(
                `선생님의 상담 가능 시간에만 메시지를 보낼 수 있습니다.<br>시간을 다시 확인해주세요.<br>
                <div style="width: 100%;margin-top: 15px;padding: 10px 30px 10px;background: var(--web-background-blue-01, #F8F9FC);border-radius: 8px;color: #4778DE;">
                  <img src="${require('../../assets/img/icon/ic_clock.svg')}"> 하이톡 가능시간 : ${formatChatTime(userTime)}
                <div>`
              )
            }
          }
        }],
        [ 'CHAT', 'groupRoomMessageBlock', async () => {
          await rootState.hiClass.alert("단체 채팅방 기능이 중지되었습니다.")
          document.location.reload()
        }]
      ]

      const found = callbacks.find(([contentType, errorCode]) => message.contentType === contentType && message.api.errorCode === errorCode)
      if (found) {
        await dispatch('deletePendingMessage', { message, isMessageArrayListDelete: true });
        found[2]()
      }
    },
    onReceivedUserNotification: async ({dispatch}, {body}) => {
      const message = JSON.parse(body);
      ({
        DESKTOP_APP_STARTED: () => {
          if (!electronController.isUnderElectron()) {
            dispatch('tryConnectingToDesktopApplication')
          }
        },
        DESKTOP_SERVER_PORT: () => {
          if (!electronController.isUnderElectron()) {
            dispatch('connectToDesktopApplication', message.port);
          }
        },
        REQUEST_DESKTOP_PORT: () => {
          if (electronController.isUnderElectron()) {
            dispatch('sendUserNotification',
              {contentType: 'DESKTOP_SERVER_PORT',
                port: electronController.context.localServerPort});
          }
        },
        USERTIME_UPDATED: () => {
          dispatch('callUserTimeForNotification', false)
        }
      }[message.contentType] || (() => {}))();
    },
    onReceivedMessageStomp: async ({state, commit, dispatch, rootState, getters}, payload) => {
      state.timeSetting = 60 * 60 * 5;
      let message = JSON.parse(payload.body);

      if ((!message.api || !message.api.room || message.api.errorMessage) && message.contentType !== 'DISCONNECT') {
        console.log('invalid message, ', payload.body)
        return;
      }

      await dispatch('deletePendingMessage', {message, isMessageArrayListDelete: false});
      if (message.tempId && messageCallbacks[message.tempId]) {
        messageCallbacks[message.tempId](message)
        delete messageCallbacks[message.tempId]
      }
      
      //하이톡을 사용하지 않거나 상담외 시간에 메시지 수신 하지 안는 경우
      if(message.api.errorCode === 'noUseChat') {
        if(message.api.roomType === 'PERSON' && message.sender === localStorage.uuid) {
          const targetMember = state.connectRoomMembers.find(o => o.userId !== localStorage.uuid)
          const memberRole = targetMember.role
          const userTime = await dispatch('callUserTime', {userId: targetMember.userId, userType: targetMember.userType, memberRole, isSetUserTime: true})
          if(!userTime.isUseChat) {
            rootState.hiClass.alert('해당 학급에서는 하이톡을 사용하지 않습니다.')
          } else {
            rootState.hiClass.alert(
              `선생님의 상담 가능 시간에만 메시지를 보낼 수 있습니다.<br>시간을 다시 확인해주세요.<br>
              <div style="width: 100%;margin-top: 15px;padding: 10px 30px 10px;background: var(--web-background-blue-01, #F8F9FC);border-radius: 8px;color: #4778DE;">
                <img src="${require('../../assets/img/icon/ic_clock.svg')}"> 하이톡 가능시간 : ${formatChatTime(userTime)}
              <div>`
            )
          }
        }
        return false
      }

      // 플로팅메시지 처리 필요한 타입
      const floatingMsgType = ['VIDEO', 'PHOTO', 'PHOTOMULTI', 'FILE', 'STICKER', 'CHAT', 'SHARE']
      let checkType = floatingMsgType.find(type => message.contentType === type)
      if (message.sender !== rootState.user.currentId && checkType && !state.isScrolledBottom) {
        commit('setNewLastMessageList', {message})
      }
      
      if (message.api.errorMessage) {
        console.log('errorMessage', payload)
        rootState.hiClass.alert("메시지 전송에 실패했습니다.<br>다시 시도해주세요.", 'warning');
        return;
      }
      // 예약메시지 발송일땐 읽음처리 안함
      if (!message.isReservation) {
        // 읽음 확인 처리 방식 개선
        const readableTypes = [MessageStatus.CHAT, MessageStatus.FILE, MessageStatus.PHOTO, MessageStatus.PHOTOMULTI, MessageStatus.VIDEO, MessageStatus.STICKER, MessageStatus.SHARE];

        if (readableTypes.includes(message.contentType)) {
          const callSendStompReadMessage = () => {
            if (document.hidden || message.sender === localStorage.uuid) return
            dispatch(message.api.roomType === 'GROUP' ? "sendStompReadMultiMessage" : "sendStompReadMessage", {message})
          }
          if ((message.insertedTimestamp && message.readMembers.includes(localStorage.uuid))
            || (message.api.readMembers && message.api.readMembers.includes(localStorage.uuid))
          ) {
            const readMembers = message.readMembers || message.api.readMembers;
            const updatedTimestamp = message.insertedTimestamp || message.api.insertedTimestamp;
            const members = [...state.connectRoomMembers];
            members.filter(m => readMembers.includes(m.userId)).forEach(m => {m.readTimestamp = updatedTimestamp});
            commit('setConnectRoomMembers', members);
          } else {
            callSendStompReadMessage();
          }
        }
      }

      ([
        [['LEAVE'], () => {
          const isGroup = state.connectRoomItem.roomType === "GROUP"
          const isCurrentRoom = message.room === state.connectRoomItem.roomId;
          const isMaster = state.connectRoomMembers.find(m => m.userId === message.sender).isMaster
          if (isGroup && isCurrentRoom  && isMaster) {
            rootState.hiClass.alert("유효하지 않은 방입니다.", 'warning');
            commit('hideChatLayout')
            dispatch("disconnectChatRoom");
            commit('clearChatMessageList')
          } else {
            state.messageListPageIndex = 0;
            dispatch("callMessageList");
            if(isGroup) {
              commit('setConnectRoomMembers', state.connectRoomMembers.filter(m => m.userId !== message.sender))
            }
          }
        }],
        [['READMULTI'], () => {
          dispatch("callChangeRoomMemberReadtimeByMessage", {...message, updateMessageCount: true, setRecent: true})
        }],
        [['TERMINATE'], () => {
          state.messageListPageIndex = 0;
          dispatch("callMessageList");
          dispatch('callChatRooms');
        }],
        [['JOIN'], () => {
          dispatch('callChatRooms');
        }],
        [['DELETE', 'READ'], () => {
          commit("updateChatMessage", {  message: message.api });
          dispatch("callChangeRoomMemberReadtimeByMessage", {...message, updateMessageCount: true})
        }],
        [['REACTION', 'REACTION_CANCEL'], () => {
          const orginal = state.messageArrayList.find((o) => o.currentId === message.content)
          let reactions = orginal.reactions || []
         
          const updateIndex = reactions.findIndex(r => r.iconId === message.iconId)
          if(message.contentType === 'REACTION') {
            if(updateIndex > -1) {
              reactions[updateIndex] = {
                ...reactions[updateIndex], 
                count: reactions[updateIndex].count + 1, 
                isReaction: message.sender === localStorage.uuid ? true : reactions[updateIndex].isReaction
              }
            } else {
              reactions.push({iconId: message.iconId, count: 1, isReaction: message.sender === localStorage.uuid})
            }
          } else {
            if(reactions[updateIndex].count - 1 === 0) {
              reactions.splice(updateIndex, 1)
            } else {
              reactions[updateIndex] = {
                ...reactions[updateIndex], 
                count: reactions[updateIndex].count - 1, 
                isReaction: message.sender === localStorage.uuid ? false : reactions[updateIndex].isReaction
              }
            }
          }
          commit("updateChatMessage", {
            message: reactions.length > 0 ? {...orginal, reactions} : {...orginal, reactions: undefined}
          });
          dispatch("callChangeRoomMemberReadtimeByMessage", message)
        }],
        [['VIDEO', 'PHOTO', 'PHOTOMULTI', 'FILE'], () => {
          if(state.lazyLoadList[state.connectRoomItem.roomId]){
            if(message.api.room === state.connectRoomItem.roomId){
              state.lazyLoadList[message.api.room].isReceivedMessage = true;
            }
          }
          const updateIndex = state.messageArrayList.findIndex((o) => o.tempId === message.api.tempId)
          updateIndex > -1 ?
            dispatch('spliceMessageArrayList', { index: updateIndex, deleteCount: 1, message: message.api }) :
            commit("addChatMessage", { message: message.api });
          commit("updateRecentChat", message)
          commit("moveRoomToTop", message.room)
          dispatch("callChangeRoomMemberReadtimeByMessage", {...message, updateMessageCount: true, setRecent: true})
        }],
        [['STICKER', 'SHARE', 'CHAT', 'VOTE'], () => {
          const updateIndex = state.messageArrayList.findIndex((o) => o.tempId === message.api.tempId)
          updateIndex > -1 ?
            dispatch('spliceMessageArrayList', { index: updateIndex, deleteCount: 1, message: message.api }) :
            commit("addChatMessage", { message: message.api });
          commit("updateRecentChat", message)
          commit("moveRoomToTop", message.room)
          dispatch("callChangeRoomMemberReadtimeByMessage", {...message, updateMessageCount: true, setRecent: true})
        }],
        [['INVITE'], () => {
          if(message.api.roomType === 'GROUP') {
            const me = state.connectRoomMembers.find(m => m.userId === localStorage.uuid)
            if(me.role === 'OWNER') {
              const addMemberIds = message.content.split(',')
              const joinTimestamp = message.api.insertedTimestamp
              commit('addConnectRoomMembers', {addMemberIds, joinTimestamp})
            } else {
              dispatch('callRoomMembers', state.connectRoomItem.roomId)
            }

            commit("updateRecentChat", {...message, content: message.api.noticeMessage});
            state.messageListPageIndex = 0;
            dispatch("callMessageList");
          }
        }],
        [['KICK'], () => {
          if (message.content === localStorage.uuid) {
            dispatch("disconnectChatRoom")
            rootState.hiClass.alert("유효하지 않은 방입니다.", 'warning');
            commit('clearChatMessageList')
            commit('hideChatLayout')
          } else {
            dispatch('callRoomMembers', state.connectRoomItem.roomId)
            const kickMembers = message.content.split(',')
            commit('setConnectRoomMembers', state.connectRoomMembers.filter(m => !kickMembers.includes(m.userId)))
            commit("updateRecentChat", {...message, content: message.api.noticeMessage});
            state.messageListPageIndex = 0;
            dispatch("callMessageList");
          }
        }],
        [['BLOCK', 'LIFT'], () => {
          commit('patchConnectRoomMembers', {userId: message.content, chatUsed: message.contentType !== 'BLOCK'});
        }],
      ].find(([types]) => types.includes(message.contentType)) || [null, () => {}])[1]()
      
      if(message.contentType !== 'JOIN' && message.contentType !== 'READMULTI') {
        state.roomListPageIndex = 0;
      }
    },
    spliceMessageArrayList: ({state}, {index, deleteCount, message}) => {
      state.messageArrayList.splice(index, deleteCount, message);
    },
    appendMessageArrayList: ({state}, message) => {
      state.messageArrayList.push(message);
    },
    sendStompPersonalMessageChat: async ({dispatch}, { roomId, message }) => {
      await dispatch('validateStompConnection');

      const existsMessage = message && message.length > 0

      // chat message
      if (existsMessage) {
        await dispatch('sendStompMessage', { roomId, content: message });
      }
    },
    sendStompPersonalMessageFiles: async ({dispatch}, { roomId, files }) => {
      await dispatch('validateStompConnection');
      
      const existsFiles = files && files.length > 0

      // file or files message
      if (existsFiles) {
        const arrFiles = [...files]
        const imagePackFiles = arrFiles.filter(f => f.fileContentType.startsWith('image') && f.fileFlag === 'IMAGE_PACK')
        
        const videoFiles = arrFiles.filter(f => f.fileContentType.startsWith('video'))
        
        let contentType = "FILE"
        const content = arrFiles.length === 1 ? JSON.stringify(arrFiles[0]) : JSON.stringify(arrFiles)

        if (imagePackFiles.length === 1) {
          contentType = "PHOTO"
        } else if (imagePackFiles.length > 1) {
          contentType = "PHOTOMULTI"
        } else if (videoFiles.length === 1) {
          contentType = "VIDEO"
        }
        
        await dispatch('sendStompMessage', { roomId, content, contentType });
      }
    },
    async sendUserNotification({state, dispatch}, message) {
      await dispatch('validateStompConnection');
      await state.stompClient.send(`/topic/${localStorage.uuid}`, {}, JSON.stringify(message));
    },
    async sendStompMessage({state, dispatch},
      {roomId, content, contentType = "CHAT", additionalData = {}, isShare = false, callback}) {
      let message = { sender: localStorage.uuid, contentType, content, ...additionalData };

      if (additionalData.tempId) { // 재전송
        const targetPendingIdx = state.messageArrayList.findIndex(m => m.tempId === additionalData.tempId);
        if (targetPendingIdx > -1) {
          state.messageArrayList[targetPendingIdx].timestamp = new Date().getTime();
          message = state.messageArrayList[targetPendingIdx];
        }
      } else if (
        roomId === state.connectRoomItem.roomId &&
        !isShare &&
        ['STICKER', 'CHAT', 'VIDEO', 'PHOTO', 'PHOTOMULTI', 'FILE'].includes(message.contentType)
      ) {
        const pendingMsg = await dispatch('registPendingMessage', { roomId: roomId, message, callback });
        message = {...pendingMsg, timestamp: new Date().getTime()};
        const unsentMsgIdx = state.messageArrayList.findIndex(m => !m.id); // 전송안된 메시지보다 위로 새로운 메시지 추가하기 위함
        unsentMsgIdx > -1 ?
          dispatch('spliceMessageArrayList', { index: unsentMsgIdx, deleteCount: 0, message }) :
          dispatch('appendMessageArrayList', message);
      }

      try {
        const sendMessage = {...message};
        delete sendMessage.timestamp; // 웹소켓으로 전송 시 timestamp 제외하고 전송
        if (hasTestSituation('errorTest') && contentType === 'CHAT') throw new Error(`errorTest, ${JSON.stringify(sendMessage)}`);
        if (hasTestSituation('badNetwork')) state.stompClient.disconnect();
        if (hasTestSituation('blockSending')) return;
        if (!roomId) return;

        if (!state.stompClient || !state.stompClient.connected)
          throw new Error('stompClient is not connected');
        await state.stompClient.send(URLProps.HITALK_PUBLISH_URL + roomId, {}, JSON.stringify(sendMessage));
        (callback || (() => {}))();
      } catch (e) {
        if (roomId !== state.connectRoomItem.roomId) {
          dispatch('registPendingMessage', { roomId: roomId, message, callback });
        }
        throw e;
      }
    },
    sendStompChatMessage: async ({state, commit, dispatch}, {message,roomItem,messageRef}) => {
      await dispatch('validateStompConnection');

      let content;
      let contentType;

      state.selectedUserIdString = "";
      if (roomItem.roomType === "PERSON" && state.selectedUserIdString) {
        dispatch("sendStompInviteMessage");
      }

      if (state.selectedStickerItem.stickerUrl) {
        contentType = "STICKER"
        content = JSON.stringify({
          msg: message,
          stickerPath: state.selectedStickerItem.stickerUrl
        })
      } else {
        contentType = "CHAT"
        content = message
      }

      if(!content.trim()) {
        return false;
      }

      const refinedContent = typeof content === 'string' && content.trim().startsWith('{')
        ? (() => { try { const o = JSON.parse(content); return typeof o.msg === 'string' ? JSON.stringify({ ...o, msg: o.msg.trim() ? o.msg : '' }) : content } catch { return content } })()
        : content;

      dispatch('sendStompMessage', { roomId: roomItem.roomId || roomItem.room, content: refinedContent, contentType });

      // 웹소켓 정상 연결 후 메시지 전송 완료 시 현재 스티커 초기화
      if (state.selectedStickerItem.stickerUrl) {
        commit('setSelectedStickerItem', {})
      }
      // 웹소켓 정상 연결 후 메시지 전송 완료 시 현재 메시지 초기화
      if (messageRef) {
        messageRef.innerText = ''
        commit('setTempChatMessages', {
          roomId: roomItem.roomId || roomItem.room,
          message: ''
        })
      }

      return true
    },
    sendStromReactionReadMessage: async ({state, dispatch, rootState, getters}, {message}) => {
      await dispatch('validateStompConnection');
      const memberRole = state.connectRoomMembers.find(o => o.userId === localStorage.uuid).role
      const userTime = await dispatch('callUserTime', {userId: localStorage.uuid, userType: state.loginUser.userType, memberRole, isSetUserTime: false})
      const isChatTime = userTime.isChatTime
      const isUseChat= userTime.isUseChat
      const isHoliday= userTime.isHoliday

      const isAllReaded = state.messageArrayList.every(o => isRead(o, getters.meInConnectRoom))
      // 선생님이고 메시지 보냈을때 상담시간이 아니면 일괄 읽음 처리
      if (((!isChatTime || !isUseChat || isHoliday) && !isAllReaded) || state.unReadChatMessages.length > 0 || getters.isInBlockedRoom) {
        console.log('sendStromReactionReadMessage', message)
        dispatch('sendStompReadMultiMessage', { message })
        state.unReadChatMessages.splice(0)
      }
    },
    sendStompReadMessage: async ({state, getters, dispatch, rootState, commit}, {message}) => {
      await dispatch('validateStompConnection');

      const memberRole = state.connectRoomMembers.find(o => o.userId === localStorage.uuid).role
      const userTime = await dispatch('callUserTime', {userId: localStorage.uuid, userType: state.loginUser.userType, memberRole, isSetUserTime: false})
      const isChatTime = userTime.isChatTime
      const isUseChat= userTime.isUseChat
      const isHoliday= userTime.isHoliday
      const isGroupRoom = state.connectRoomItem.roomType === 'GROUP'
      const me = state.connectRoomMembers.find(o => o.userId === localStorage.uuid)
      const isAllReaded = state.messageArrayList.every(m => me.readTimestamp >= m.insertedTimestamp)

      if(message.sender === localStorage.uuid) {
        dispatch('sendStompReadMultiMessage', { message })
      } else {
        if (!isGroupRoom && (!rootState.isVisibleWindow || !isChatTime || isHoliday)) {
          // 미확인 메시지가 쌓인 경우 정리
          if (state.unReadChatMessages.length > 20) {
            state.unReadChatMessages.splice(0)
          }
          state.unReadChatMessages.push(message)
          commit('updateUnreadMessageCountAndRecentChat', message)
          dispatch("callChatUserMessageCount")
          return false
        }
        
        const content = message.currentId || message.id
        if (localStorage.uuid && content) {
          try {
            dispatch('sendStompMessage', { roomId: state.connectRoomItem.roomId, content, contentType: "READMULTI" });
          } catch (e) {
            console.error(e)
          }
        }
      }
    },
    sendStompReadMultiMessage: async ({state, dispatch}, {message}) => {
      debouncerForReadMulti.add(async () => {
        await dispatch('validateStompConnection');
        if(!message.currentId && !message.id) {
          return false;
        }
        if(!state.connectRoomItem.roomId) {
          return false;
        }
        dispatch('sendStompMessage', { roomId: state.connectRoomItem.roomId, content: message.currentId || message.id, contentType: "READMULTI" });
        state.unReadChatMessages.splice(0)
      })
    },
    //수동 읽음 처리 
    fetchReadMulti: async({state, dispatch}, { room, currentId, messageId }) => {
      if (!room || !(currentId || messageId)) return
      try {
        await axios({
          method: "PATCH",
          baseURL: URLProps.APP_CHAT_API_SERVER_URI,
          url: `/hiTalks/${room}/read`,
          data: { messageId: messageId || currentId, userId: localStorage.uuid }
        })
        state.unReadChatMessages.splice(0)
        dispatch("callChangeRoomMemberReadtimeByMessage", {
          room, sender: localStorage.uuid, setRecent: true, updateMessageCount: true
        })
      } catch(error) {
        console.error(" fetchReadMulti error => ", error);
      }
    },
    fetchReadMultiConnectRoomAndCurrentUser: ({dispatch, state, getters}) => {
      const lastMessage = state.messageArrayList[state.messageArrayList.length - 1]
      if (lastMessage && !isRead(lastMessage, getters.meInConnectRoom)) {
        dispatch('fetchReadMulti', {
          room: state.connectRoomItem.roomId,
          messageId: lastMessage.id
        })
      }
    },
    sendStompDeleteMessage: async ({state, dispatch}) => {
      await dispatch('validateStompConnection');
      if(!state.eventMessage.currentId) {
        return false
      }
      dispatch('sendStompMessage', { roomId: state.connectRoomItem.roomId, content: state.eventMessage.currentId, contentType: "DELETE" });
      state.isShowConfirmLayout = false;
    },
    sendStompInviteMessage: async ({state, dispatch}) => {
      await dispatch('validateStompConnection');
      if(!state.selectedUserIdString) {
        return false;
      }
      dispatch('sendStompMessage', { roomId: state.connectRoomItem.roomId, content: state.selectedUserIdString, contentType: "INVITE" });
    },
    sendStompKickMessage: async ({state, dispatch}) => {
      await dispatch('validateStompConnection');

      if(!state.selectedUserIdString) {
        return false;
      }
      dispatch('sendStompMessage', { roomId: state.connectRoomItem.roomId, content: state.selectedUserIdString, contentType: "KICK" });
      state.noticeTargetUserJSONList = {};
      state.noticeTargetUserArrayList.splice(0);
      state.isShowConfirmLayout = false;
    },
    sendStompVideoFileMessage : async ({state, dispatch}, {fileData, roomId}) => {
      await dispatch('validateStompConnection');

      const lazyLoad = {
        isReceivedMessage : false,
        lazyCall(){
          setTimeout(()=>{
            if(!this.isReceivedMessage){
              dispatch('callChatRooms')
            }
            Vue.delete(state.lazyLoadList, roomId);
          },1500);
        }
      };

      lazyLoad.lazyCall();
      Vue.set(state.lazyLoadList, roomId, lazyLoad);
      dispatch('sendStompMessage', { roomId, content: JSON.stringify(fileData), contentType: 'VIDEO' });
    },
    sendStompFileMessage: async ({state,dispatch}, {result,roomId}) => {
      await dispatch('validateStompConnection');

      const lazyLoad = {
        isReceivedMessage : false,
        lazyCall(){
          setTimeout(()=>{
            if(!this.isReceivedMessage){
              dispatch('callChatRooms');
            }
            Vue.delete(state.lazyLoadList, roomId);
          },1500);
        }
      };
      const fileData = {
        fileOriginalPath: result.data._links.original.href,
        fileConvertPath: result.data._links.convert ? result.data._links.convert.href : "",
        fileSize: result.data.size,
        fileName: result.data.filename,
        fileContentType: result.data.contentType
      };
      let fileContentType;
      if (result.data.contentType.startsWith('image')) {
        fileContentType = "PHOTO";
      } else if (result.data.contentType.startsWith('video')) {
        fileContentType = "VIDEO";
        fileData.fileThumbnailPath = result.data._links.original.href.substr(0, result.data._links.original.href.lastIndexOf(".") + 1) + "jpg";
      } else {
        fileContentType = "FILE";
      }

      if(!fileData) {
        return false;
      }
      lazyLoad.lazyCall();
      Vue.set(state.lazyLoadList, roomId, lazyLoad);
      dispatch('sendStompMessage', { roomId, content: JSON.stringify(fileData), contentType: fileContentType });
    },

    sendStompFilesMessage: async ({state,dispatch}, payload) => {
      await dispatch('validateStompConnection');

      if(!payload.files) {
        return false;
      }
      const contentType = payload.contentType
      const content = contentType === 'PHOTOMULTI' ? JSON.stringify([...payload.files]) : JSON.stringify(payload.files[0])

      dispatch('sendStompMessage', { roomId: payload.roomItem.room, content, contentType });
    },
    sendStompShareMessage: async ({dispatch}, {roomId, message, content}) => {
      await dispatch('validateStompConnection');

      const existMessage = message && message.length > 0
      const existContent = content

      if (existMessage) {
        await new Promise(async (resolve, reject) => {
          try {
            await dispatch('sendStompMessage', { roomId, content: message, isShare: true, callback: resolve})
          } catch (error) {
            reject(error)
          }
        })
      }

      if (existContent) {
        await new Promise(async (resolve, reject) => {
          try {
            await dispatch('sendStompMessage', { roomId, content: JSON.stringify(content), contentType: "SHARE", isShare: true, callback: resolve })
          } catch (error) {
            reject(error)
          }
        })
      }
    },
    sendStompReactionMessage: async ({state, dispatch}, {iconId, messageId, isCancel}) => {
      await dispatch('validateStompConnection');

      if(!iconId || !messageId) {
        return false;
      }
      dispatch('sendStompMessage', { roomId: state.connectRoomItem.roomId, content: messageId,
            contentType: isCancel ? 'REACTION_CANCEL' : 'REACTION', additionalData: { iconId } });
    },
    // 하이톡 반응 수 조회
    callHitalkReactionCount: async({state}, messageId) => {
      try {
        const result = await axios.get(`/hiTalks/reaction/count/${messageId}`, { params: { userId: localStorage.uuid } });
        return result.data._embedded ? result.data._embedded.hiTalkReactionCounts : []
      } catch(error) {
        console.error(" callHitalkReactionCount error => ", error);
      }
    },
    // 하이톡 반응 목록 조회
    callHitalkReactionList: async (_, params) => {
      try {
        const result = await axios.get(`/hiTalks/reaction/${params.messageId}`, { params });
        return (result.data._embedded || {}).hiTalkReactions || [];
      } catch(error) {
        console.error(" callHitalkReactionList error => ", error);
      }
    },
    // eslint-disable-next-line no-unused-vars
    callChatWebToken: (_, payload) => {
      try {
        axios({
          method: payload.method,
          url: `${VERSION}/chatWebToken/${localStorage.uuid}`,
          params: {
            token: payload.token,
            info: window.navigator.userAgent
          }
        })
      } catch(error) {
        console.error("chatWebToken error => ", error);
      }
    },
    callCheckExistRoom: async ({state,commit, dispatch, rootState}, { roomType, classId, content, roomId, memberType, doNotCreateRoom }) => {
      try {
        const result = await dispatch("doCallChatRooms", {});
        const founds = result.data._embedded.chatMessages.filter(c => roomType === c.roomType 
          && classId === c.classId && (roomId === c.room ||
            (c.settings.members || []).concat(c.invitedMembers).map(m => typeof m === 'string' ? m : (m || {user: {}}).user.currentId).includes(content)));

        if (founds.length === 0) {
          if (doNotCreateRoom) {
            rootState.hiClass.alert("유효하지 않은 방입니다.", 'warning');
            dispatch('callChatRooms')
            return;
          }
          await dispatch("callCreateRoom", { roomType, classId, content, memberType });
          return;
        }

        if (state.connectRoomItem.roomId === founds[0].room && !roomId) return;

        const selectedRoom = founds[0];
        const memberRole = (state.classJSONList[selectedRoom.classId] || {me: {}}).me.memberRole || 'MANAGER';
        const userTime = await dispatch('callUserTime', { userId: localStorage.uuid, userType: state.loginUser.userType, memberRole, isSetUserTime: false });
        const blocked = state.loginUser.userType === 'TEACHER' &&
          selectedRoom.roomType === 'PERSON' &&
          selectedRoom.settings.members.map(m => m.user.currentId)
            .some(o => state.blockedUsers.map(b => b.userId).includes(o));

        const isReadMulti = selectedRoom.roomType === 'GROUP' 
          ? true 
          : userTime.isUseChat && userTime.isChatTime && !userTime.isHoliday && !blocked;

        if (isReadMulti) {
          if (await dispatch('callMessageList', selectedRoom.room)) {
            await dispatch('fetchReadMulti', selectedRoom);
            await dispatch('callChatRooms');
          }
        }
        if (state.connectRoomItem.roomId) {
          dispatch('disconnectChatRoom');
          commit('clearChatMessageList');
        }
        commit('setConnectRoomItem', selectedRoom);

        await dispatch('connectChatRoom', { roomId: selectedRoom.room, userTime });
        if (!state.isShowChatLayout) {
          state.isShowChatLayout = true;
        }
      } catch (error) {
        console.error(" callCheckExistRoom error => ", error);
      }
    },
    callCreateRoom: async ({state, commit, dispatch}, { roomType, classId, content, memberType, groupType, limitTimestamp, pushUsed, roomName }) => {
      let params = {};
      try {
        const result = await dispatch('createRoom', { roomType, memberType, classId, content, groupType, limitTimestamp, pushUsed, roomName });
        const memberRole = ((state.classJSONList || {})[classId] || {}).memberRole || 'MEMBER';
        const userTime = await dispatch('callUserTime', { userId: localStorage.uuid, userType: state.loginUser.userType, memberRole, isSetUserTime: false });

        await Promise.all([
          dispatch('callRoomDetail', result.data.room),
          dispatch('callRoomMembers', result.data.room)
        ]);

        await dispatch('connectChatRoom', { roomId: result.data.room, userTime });
        commit('patchConnectRoomItem', {master: localStorage.uuid})

        commit('clearChatMessageList');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(" callCreateRoom error => ", error);
      }
    },
    createRoom: (_, {roomType, memberType, classId, content, groupType, limitTimestamp, pushUsed, roomName}) => {
      return axios.post(`${VERSION}/chat`, {
        sender: localStorage.uuid, classId, content,
        groupType: groupType || 'NOTICE',
        pushUsed: typeof pushUsed !== 'undefined' ? pushUsed : true,
        limitTimestamp, roomName
      }, {params: { roomType, memberType} })
    },
    callLoginUser: async ({state, rootState, dispatch}) => {
      const loginUserRes = await axios.get(`/users/${localStorage.uuid}`)
      state.loginUser = loginUserRes.data;
      state.userType = loginUserRes.data.userType;
      rootState.user = loginUserRes.data;

      const requestParams = {
        deviceType: 'WEB',
        positionType: [
          'HITALK_MAIN_TITLE',
          'HITALK_MAIN_CARD',
          'HITALK_MAIN_BANNER_A',
          'HITALK_ROOM_LIST'
        ]
      }
      dispatch('getBanners', requestParams, { root: true })
    },
    callUserTimeForNotification: async ({commit, dispatch}, isSetUserTime) => {
      const userTime = await dispatch('callUserTime', {
        userId: localStorage.uuid,
        userType: 'TEACHER',
        memberRole: 'OWNER',
        isSetUserTime: isSetUserTime || false})
      commit('setUserTimeForNotification', userTime)

      return userTime;
    },
    callUserTime: async ({commit}, { userId, userType, memberRole, isSetUserTime }) => {
      if(!userId) return;
      try {
        if(userType === 'TEACHER' && ['OWNER', 'MANAGER'].includes(memberRole)) {
            const response = await axios.get(`/users/${userId}/userTime`)

          if(isSetUserTime) {
            commit('setUserTime', response.data)
          }
          
          return {...response.data, isTeacher: true};
        } else {
          const temp = {
            userChatDay : null,
            userChatStartTime : null,
            userChatEndTime : null,
            userCallDay : null,
            userCallStartTime : null,
            userCallEndTime : null,
            userWorkStartTime : null,
            userWorkEndTime : null,
            isOverChat : true,
            isUseChat : true,
            isUseCall : true,
            isCallTime : true,
            isChatTime : true,
            isHoliday: false,
            isOnlyWorkTime: false,
            isTeacher: false
          }
          if(isSetUserTime) {
            commit('setUserTime', temp)
          }
          return temp;
        }
      } catch (error) {
        console.error("callUserTime error => ", error);
      }
    },
    callUpdateTimeSetting: async ({state, commit, dispatch}, payload) => {
      try {
        await axios.patch(`/users/${localStorage.uuid}/userTime`, payload);
        commit('hideTimeSetting');
        dispatch("sendUserNotification", { contentType: "USERTIME_UPDATED" });
      } catch (error) {
        console.error("callUpdateTimeSetting error => ", error);
      }
    },
    callChatUserList: async ({commit, dispatch}, /*payload*/) => {
      try {
        const result = await axios.get(`${VERSION}/chatUsers`, { params: { userId: localStorage.uuid } });
        commit('setClassJSONList', { userList: result.data._embedded.chatUsers });
        await dispatch('callSortedClassList', { size: result.data._embedded.chatUsers?.length || 20 });
        await dispatch('fetchBlockedUsers', { userId: localStorage.uuid });
      } catch(error) {
        console.error(" callChatUserList error => ", error);
      }
    },
    /**
     * #74447 
     * 클래스가 sorting된 API(/users/{userid}/classes)를 호출 (기존에 사용하던 store 없음)
     * @param {*} param0 
     * @param {*} param1 
     */
    callSortedClassList: async({commit}, {size}) => {
      try {
        // callChatUserList에서 조회하여 만든 classJSONList 수 만큼 조회 (해당 API는 페이징 처리 되어있음)
        const param = { page: 0, size: size };
        const result = await axios.get(`/users/${localStorage.uuid}/classes`, { params: param });
        commit('setsortedClassList', { classList: result.data._embedded.classes });
      } catch ( error ) {
        console.error('callSortedClassList', error);
      }
    },
    callChatUserMessageCount: async ({state, commit}) => {
      if (!state.isLoadingCallChatUserMessageCount) {
        state.isLoadingCallChatUserMessageCount = true
        try {
            const response = await API.chatUserMessageCountChatUserMsgCntUserId(localStorage.uuid);
          state.isShowCountBadge = response.data.isNew;
          if (response.data.count === 0) state.isShowCountBadge = false;
          if (response.data.isNew) {
            state.totalUnReadMessageCount = response.data.count;
            commit('updateUnreadCountBadge')
          }
        } catch (error) {
          console.error("chatWebToken error => ", error);
        } finally {
          state.isLoadingCallChatUserMessageCount = false;
        }
      }
    },
    callPinSave: async ({state}, payload) => {
      try {
        const res = await axios({
          method: payload.isPin  ? 'PATCH' : 'DELETE',
          url: `${VERSION}/hiTalks/${payload.roomId}/pin`
        })
        return 0
      } catch(error)  {
        console.error(" callPinSave error => ", error);
        return error.response.status
      }
    },
    doCallChatRooms: ({ state }, { page, roomId }) => {
      return axios.get(`${VERSION}/chatRooms`, { params: {
          userId: localStorage.uuid,
          sort: state.isUnReadSort ? 'unread' : '', size: 500, page, roomId } })
    },
    callChatRooms: async({state, commit, dispatch, rootState}, payload) => {
      throttleOfCallingChatRooms.execute(async () => {
        const func = async (page) => {
          const result = await dispatch('doCallChatRooms', { page })
          if(page === 0) {
            commit('setRoomListPageInfo', result.data.page)
            commit('setChatRoomList', result.data._embedded.chatMessages);
          } else {
            commit('addChatRoomList', result.data._embedded.chatMessages);
          }
          return result.data.page
        }
        try {
          if(rootState.isVisibleWindow || (payload && payload.force)) {
            const page = await func(state.roomListPageIndex)
            if(payload && payload.isAll && state.roomArrayList.length < page.totalElements) {
              await Promise.all(new Array(page.totalPages - page.number - 1).fill().map((_, i) => func(i + page.number + 1)))
            }
            if(payload && payload.currentPage && state.roomArrayList.length < page.totalElements) {
              await Promise.all(new Array(payload.currentPage - page.number).fill().map((_, i) => func(i + page.number + 1)))
            }
            dispatch("callChatUserMessageCount");
          }
        } catch(error) {
          // eslint-disable-next-line no-console
          console.error(" callChatRooms error => ", error);
        }
      })
    },
    callMessageList: async ({commit, state, rootState, dispatch, getters}, isReadMultiRoom = null) => {
      let contentTypes
        = state.connectRoomItem.roomType === "PERSON" || isReadMultiRoom ?
        ["CHAT", "DELETE", "PHOTO", "PHOTOMULTI", "VIDEO", "FILE", "STICKER", "SHARE"] :
        ["CHAT", "DELETE", "PHOTO", "PHOTOMULTI", "VIDEO", "FILE", "STICKER", "SHARE", "INVITE", "KICK"];

      await comn.asyncWaitFor(() => isReadMultiRoom || state.connectRoomItem.roomId)
      try {
        const result = await axios.get(`${VERSION}/chatMessages/${isReadMultiRoom ? isReadMultiRoom : state.connectRoomItem.roomId}`, {
          params: {
            size: isReadMultiRoom ? 1 : PAGE_SIZE_OF_MESSAGES,
            page: isReadMultiRoom ? 0 : state.messageListPageIndex,
            contentTypes: contentTypes,
            sort: "insertedTimestamp,desc"
          }
        })
        
        const chatMessages = result.data._embedded.chatMessages
        const chatMessagesLength = chatMessages.length
        const existsUnReadChatMessages = state.unReadChatMessagesCount > 0
        const isAllReaded = chatMessages.every(o => isRead(o, getters.meInConnectRoom))
        if (isReadMultiRoom || existsUnReadChatMessages){
          return chatMessagesLength > 0 && !isAllReaded
        }
        if (chatMessagesLength === 0) {
          state.isLastMessagePageIndex = true
        } else {
          state.isLastMessagePageIndex = false
        }
        if (result.data.page.number === 0) {
          await dispatch('reloadPendingMessages');
        }
        
        commit('setMessageJSONList', { messageList: chatMessages })
        return chatMessages
      } catch(error) {
        // eslint-disable-next-line no-console
        console.error(" callMessageList error => ", error);
        if(error.response.status === 428) {
          // 존재하는 방 없음.
          dispatch("disconnectChatRoom")
          rootState.hiClass.alert("유효하지 않은 방입니다.", 'warning');
        }
      }
    },

    //deprecated 이지만,, 일단은...남겨놓음 삭제해도 무방함
    callChatMessageDownload: async ({state}) => {
      try {
        const response = await axios.get(`${VERSION}/hiTalks/${state.connectRoomItem.roomId}/download`, {
          params: { userId: localStorage.uuid },
          responseType: "blob"
        });
        const options = { duration: 3000 }
        Vue.toasted.show('대화 저장하기시 첨부파일은 파일명으로 표기됩니다.', options)
        const replaceAll = (str, searchStr, replaceStr) => {
          return str.split(searchStr).join(replaceStr)
        }
        let url = window.URL.createObjectURL(new Blob([response.data], {type: response.headers['content-type']}));
        let link = document.createElement('a');
        link.href = url;
        const contentDisposition = decodeURI(response.headers['content-disposition'])
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        link.setAttribute('download', replaceAll(filename, "UTF-8''", ''));
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error("callChatMessageDownload error => ", error);
        throw Error(error);
      }
    },
    callChatMessageDownloadSecure: async ({state}, password) => {
      if (!password) return;
      try {
        const response = await axios.get(`${VERSION}/hiTalks/${state.connectRoomItem.roomId}/download`, {
          params: { userId: localStorage.uuid },
          responseType: "blob"
        });
        const options = { duration: 3000 };
        Vue.toasted.show('대화 저장하기시 첨부파일은 파일명으로 표기됩니다.', options);
        
        const arrayBuffer = await response.data.arrayBuffer();
        const pdfBytes = new Uint8Array(arrayBuffer);
        
        const encryptedPdfBytes = await encryptPDF(pdfBytes, password);
        
        const replaceAll = (str, searchStr, replaceStr) => {
          return str.split(searchStr).join(replaceStr)
        }
        let url = window.URL.createObjectURL(new Blob([encryptedPdfBytes], {type: response.headers['content-type'] || 'application/pdf'}));
        let link = document.createElement('a');
        link.href = url;
        const contentDisposition = decodeURI(response.headers['content-disposition'])
        const filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        link.setAttribute('download', replaceAll(filename, "UTF-8''", ''));
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error("callChatMessageDownloadSecure error => ", error);
        throw Error(error);
      }
    },
    callRoomInformation: async ({state}, payload) => {
      try {
        payload.targetIds = payload.targetIds || payload.receivers;
        const result = await axios.post(VERSION.startsWith('/v') ? `${VERSION}/hitalks/batch` : '/chatEach', payload);
        state.noticePersonalRoomList = result.data.receivers;
        state.isShowNoticeTargetLayout = false;
        state.isShowNoticeCustomLayout = false;
        state.isShowNoticePersonalMessageLayout = true;
      } catch (error) {
        console.error("callRoomInformation error => ", error);
      }
    },
    /**
     * 대화창 최하단으로 스크롤 (스크롤바가 있는 경우에)
     * @param state
     * @param commit
     */
    callChatAreaScrollBottom: ({state, commit}, /*payload*/) => {
      const chatListWrap = document.querySelector('.inner .chatting-list-wrap')
      if (chatListWrap) {
        const messageArea = chatListWrap.querySelector('.scroll-scrolly_visible');
        if (messageArea) messageArea.scrollTop = messageArea.scrollHeight;
      }
    },

    callRoom: (_, {sender, classId, receiver}) => axios.post(VERSION.startsWith('/v') ? `${VERSION}/hitalks/batch` : "/chatEach", {sender, classId, receiver, targetIds: receiver}),


    /** =============================================
     * 하이톡 예약하기
     */
    /**
     * 예약내역 조회
     * @param state
     * @param rootState
     * @param commit
     * @param params
     * @param isInit
     * @returns {*}
     */
    searchReservation: async ({state, rootState, commit}, {params, isInit}) => {
      commit('setReservationIsSearchMode', !!params.keyword)

      const res = await axios.get(`/hitalks/reservation/!q`, { params })

      try {
        let searchList = res.data._embedded.reservations
        const now = moment().valueOf()

        searchList = searchList.map(searchItem => { // 예약시간 도래시 전송중 상태로 변경
          if (searchItem.status === 'RESERVATION' && searchItem.reservationTime <= now) {
            searchItem.status = 'ING'
          }
          return searchItem
        })

        if (state.reservation.isSearchMode) { // 검색시 예약시간 필터링
          searchList = _.filter(searchList, (searchItem) => {
            return searchItem.reservationTime > now
          })
        }

        if (isInit) {
          state.reservation.searchList = searchList
        } else {
          state.reservation.searchList.push(...searchList)
        }

        if (state.reservation.paging.page + 1 === res.data.page.totalPages) {
          commit('setReservationPaging', {isEnd: true})
        }

        commit('setReservationPaging', {page: state.reservation.paging.page + 1})
        return state.reservation.searchList

      } catch (err) {
        rootState.log.debug(err)
      }
    },

    // 예약내역 상태 조회
    getReservationStatus: async (_, {userId, scheduleIds}) => {
        const res = await axios.post("/hitalks/reservation/status/!q", {userId, scheduleIds})
        return res.data._embedded.schedules
    },

    // 예약 건수 조회
    getReservationCount: (_, {userId, roomId}) => axios.get(`/hitalks/reservation/count`, { params: { userId, roomId } }),

    // 예약하기
    saveReservationMessage: (_, data) => axios.post(`/hitalks/reservation`, data),

    // 예약 일괄수정
    patchReservationBatch: (_, data) => axios.patch(`/hitalks/reservation/batch`, data),

    // 예약 시간 수정 -> 검색 목록 데이터 변경
    patchReservationTime: async ({state}, data) => {
      const res = await axios.patch(`/hitalks/reservation/${state.sendMessageItem.scheduleId}/time`, data)
      const targetIdx = state.reservation.searchList.findIndex(
        reservationItem => reservationItem.scheduleId === state.sendMessageItem.scheduleId)
      state.reservation.searchList[targetIdx].reservationTime = data.reservationTime
      return res
    },

    // 예약 수정 -> 검색 목록 데이터 변경
    patchReservation: async ({state, dispatch}, data) => {
      try {
        const res = await axios.patch(`/hitalks/reservation/${state.sendMessageItem.scheduleId}`, data);

        const targetIdx = state.reservation.searchList.findIndex(reservationItem => reservationItem.scheduleId === res.data.scheduleId);

        state.reservation.searchList.splice(targetIdx, 1, res.data);

        return true

      } catch(err) {
        dispatch('checkReservationError', {
          'err': err,
          'scheduleId': data.scheduleId
        });

        return false
      }
    },

    /**
     * 예약메시지 수정시 에러코드 처리
     * @param state
     * @param rootState
     * @param errObj
     */
    checkReservationError: ({state, rootState}, errObj) => {
      if (errObj.err.response.status === 428) {
        const errorMessage = errObj.err.response.data.error
        switch (errorMessage) {
          case 'invalidSubscribe':
          case 'invalidRoom': {
            rootState.hiClass.alert('대화방이 유효하지 않아 메시지를 전송할 수 없습니다.</br>다시 확인해주세요.')
              .then(() => {
                let targetReservationItem = _.find(state.reservation.searchList, {
                  'scheduleId': errObj.scheduleId
                })
                targetReservationItem.errorCode = errorMessage === 'invalidSubscribe' ? 'E10' : 'E20'
                targetReservationItem.status = 'CANCEL'
              })
            break
          }
          case 'mismatchStatus':
            rootState.log.debug('수정 시 status 예약(RESERVATION) 인 경우만 수정 가능', errObj.err)
            break
          case 'invalidMessageType':
            rootState.log.debug('메세지 유형 유효성 확인', errObj.err)
            break
          case 'mustEmptyRoomId':
            rootState.log.debug('일괄메세지 유형은 등록/수정 시  roomId 가 null 여부 확인', errObj.err)
            break
          case 'notOnePerson':
            rootState.log.debug('개인 유형 등록/수정 시 대상자가 1명이어야 함', errObj.err)
            break
        }

      } else {
        rootState.log.debug(errObj.err)
      }
    },

    blockCreate: async ({dispatch}, {blockerUserId, classId, blockedUserId}) => {
      await axios.post('/hitalks/block', { blockerUserId, classId, blockedUserId })
      dispatch('callChatUserList')
    },

    blockDelete: async ({dispatch}, {blockerUserId, blockedUserId}) => {
      await axios.delete('/hitalks/block', { data: { blockerUserId, blockedUserId } })
      dispatch('callChatUserList')
    },

    fetchBlockedUsers: async ({commit, state}, {userId}) => {
      let blockedUsers = []
      let page = 0
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data } = await axios.get(`/hitalks/${userId}/blockedUsers`, { params: { page } })
        if (!data || !data.page || !data._embedded
          || (data._embedded || {blockedUsers: []}).blockedUsers.length === 0) break
        blockedUsers = blockedUsers.concat(data._embedded.blockedUsers)
        if (data.page.totalPages === ++page) break
      }

      const findClassUser = (classId, userId) => {
        return (state.classJSONList[classId] || {member: []})
                  .member.find(m => m.userId === userId)
      }

      blockedUsers.forEach(user => {
        user.clazzSubscribes.forEach(clz => {
          const foundUser = findClassUser(clz.classId, user.userId)
          clz.UserPhoto = (foundUser || {user: {}}).user.userPhoto
        })
      })
      commit('setBlockedUsers', blockedUsers)
    },
    registPendingMessage: async ({dispatch}, {roomId, message, callback}) => {
      const registered = await messageStatusManager.registNewMessage(roomId, message);
      if (registered.tempId && callback) {
        messageCallbacks[registered.tempId] = callback;
      }
      return registered;
    },
    reloadPendingMessages: async ({state, commit}) => {
      const messages = await messageStatusManager.fetchPendingMessages()
      commit('setPendingMessages', messages)
    },
    resendPendingMessage: async ({dispatch}, {roomId, content, contentType, tempId}) => {
      dispatch('sendStompMessage', {
        roomId,
        content,
        contentType,
        additionalData: {tempId}
      })
    },
    deletePendingMessage: async ({state, dispatch}, {message, isMessageArrayListDelete = true}) => {
      const tempId = message.tempId;
      if (!tempId) return

      if (isMessageArrayListDelete) {
        const findIndex = state.messageArrayList.findIndex(m => m.tempId === tempId);
        findIndex > -1 && state.messageArrayList.splice(findIndex, 1);
      }

      await messageStatusManager.deletePendingMessage({tempId})
    },
    patchLimitTimestamp: async ({commit}, {roomId, userId, limitTimestamp}) => {
      await axios.patch(`${VERSION}/hitalks/${roomId}/room/groups/limit`, {userId, limitTimestamp})
      commit('patchConnectRoomItem', {limitTimestamp})
    },
    patchRoomName: async ({commit}, {roomId, userId, roomName}) => {
      await axios.patch(`${VERSION}/hitalks/${roomId}/roomName`, {userId, roomName})
      commit('patchConnectRoomItem', {roomName})
    },
    toggleBlockGroupChat: async ({commit}, {roomId, userId, member}) => {
      const func = member.chatUsed ? 'block' : 'lift'
      await axios.patch(`${URLProps.APP_CHAT_API_SERVER_URI}/hitalks/${roomId}/${func}`, {userId, memberUserId: member.userId})
      commit('patchConnectRoomMembers', {userId: member.userId, chatUsed: member.chatUsed === false ? true : false})
    },
    callChangeRoomMemberReadtimeByMessage({dispatch}, { room, sender, updateMessageCount, setRecent, api}) {
      dispatch('callChangeRoomMemberReadtime', {
        roomId: room,
        userId: sender,
        timestamp: (api || {}).insertedTimestamp,
        setRecent,
        updateMessageCount
      })
    },
    callChangeRoomMemberReadtime({commit, state}, {roomId, userId, setRecent, timestamp, updateMessageCount}) {
      if (state.messageArrayList.length === 0) return
      const getRecentMessage = () => {
        const contextMessages = debouncerForAddingMessage.context.messages.filter(m => m.insertedTimestamp)
        const stateMessages = state.messageArrayList.filter(m => m.insertedTimestamp)
        return contextMessages.length > 0
          ? contextMessages[contextMessages.length - 1]
          : stateMessages[stateMessages.length - 1]
      }
      const targetTimestamp = setRecent ? Math.max(getRecentMessage().insertedTimestamp, timestamp || 0) : timestamp
      commit('patchRoomMemberReadtime', {
        roomId,
        userId,
        timestamp: targetTimestamp,
        updateMessageCount
      })
      commit('updateUnreadCountBadge')
    },
    //#84397 하이톡 최초 시작 시 사용여부 설정
    openTimeSettingFromOnboarding: async ({ commit, dispatch }, { talkType, callType }) => {
      const isUseChat = talkType === 'two';
      const isUseCall = callType === 'two';

      commit('setTimeSettingInitData', {
        source: 'onboarding',
        initialTab: isUseChat ? 'chat' : ( isUseCall ? 'call' : 'chat' ),
        context: {
          chat: { isUse: isUseChat },
          call: { isUse: isUseCall },
        },
      });

      const userTime = await dispatch('callUserTime', {userId: localStorage.uuid, userType: 'TEACHER', memberRole: 'OWNER', isSetUserTime: false});
      if (userTime) {
        userTime.isUseChat = isUseChat;
        userTime.isUseCall = isUseCall;
        userTime.isUseSetting = true;
        userTime.isOverChat = true;
      }
      await dispatch('callUpdateTimeSetting', userTime);

      commit('showTimeSetting');
    },
  }
}

export default storeHitalk;
