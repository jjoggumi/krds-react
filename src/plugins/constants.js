export default Object.freeze({
  ID_TOKEN_RENEWAL_TIME: 24,
  ID_TOKEN_RENEWAL_UNIT_OF_TIME: 'hours',
  BUTTON: {
    TEMPORARY: 'TEMPORARY',
    COMPLETE: 'COMPLETE',
    CLOSE: 'CLOSE',
    SAVE: 'SAVE',
    UPDATE: 'UPDATE',
    PRINT: 'PRINT',
    DOWNLOAD: 'DOWNLOAD',
    PDF_DOWNLOAD: 'PDF_DOWNLOAD',
    REJECT_REASON: 'REJECT_REASON',
  },
  SWEET_ALERT: {
    ICON: {
      WARNING: 'warning',
      ERROR: 'error',
      SUCCESS: 'success',
      INFO: 'info',
      QUESTION: 'question',
    }
  },
  CLAZZ_SUBSCRIBE: {
    MEMBER_ROLE: {
      OWNER: 'OWNER',
      MANAGER: 'MANAGER',
      MEMBER: 'MEMBER'
    }
  },
  CLAZZ_APPLY: {
    APPLY_STATUS: {
      TEMP: 'TEMP',
      UNIDENTIFIED: 'UNIDENTIFIED',
      REJECT: 'REJECT',
      COMPLETE: 'COMPLETE'
    }
  },
  CLAZZ_APPLY_REJECT_LIST: {
    CREATE: 'CREATE',
    LIST: 'LIST',
    UPDATE: 'UPDATE'
  },
  CLAZZ_MEMBER_ADD_STUDENT_BATCH: {
    MESSAGE: {
      NEW_EDIT_MODE: 'NEW_EDIT_MODE',
      NEW_EXCEL_UPLOAD: 'NEW_EXCEL_UPLOAD',
      TABLE_RESET: 'TABLE_RESET',
    },
    SUBMIT_TYPE: {
      EDIT_MODE: 'EDIT_MODE',
      EXCEL_UPLOAD: 'EXCEL_UPLOAD'
    }
  },
  SCHOOL_SUBSCRIBE_BUTTON_TYPE: {
    SCHOOLS: 'SCHOOLS',
    MYPAGE: 'MYPAGE',
    SEARCH: 'MYPAGE'
  },
  SCHOOL_TYPE: {
    KINDERGARTEN: 'KINDERGARTEN',
    ELEMENTARY: 'ELEMENTARY',
    MIDDLE: 'MIDDLE',
    HIGH: 'HIGH',
    SPECIAL: 'SPECIAL',
    UNIVERSITY: 'UNIVERSITY',
    NONE: 'NONE'
  },
  SCHOOL_TYPE_NAME: {
    KINDERGARTEN: '유치원',
    ELEMENTARY: '초등학교',
    MIDDLE: '중학교',
    HIGH: '고등학교',
    SPECIAL: '특수학교',
    UNIVERSITY: '대학교',
    NONE: '기타'
  },
  // 학년 코드
  CLASS_GRADE: {
    // 초등학교, 특수학교
    E1: 'E1',
    E2: 'E2',
    E3: 'E3',
    E4: 'E4',
    E5: 'E5',
    E6: 'E6',
    // 중학교
    M1: 'M1',
    M2: 'M2',
    M3: 'M3',
    // 고등학교
    H1: 'H1',
    H2: 'H2',
    H3: 'H3',
    // 대학교
    U1: 'U1',
    U2: 'U2',
    U3: 'U3',
    U4: 'U4',
    // 유치원, 기타(미지정)
    NONE: 'NONE'
  },

  /**
   * users
   */
  USER_TYPE: {
    TEACHER: 'TEACHER',
    PARENTS: 'PARENTS',
    STUDENT: 'STUDENT'
  },
  USER_SNS: {
    KAKAO: 'kakao',
    NAVER: 'naver',
    GOOGLE: 'google',
    APPLE: 'apple',
    GNE: 'gne',
    ISCREAM: 'iScream',
    HICLASS: 'hiClass'
  },
  USER_SIGN: {
    SIGN: 'SIGN',
    APPROVAL_SIGN: 'APPROVAL_SIGN'
  },
  USER_STATUS: {
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE'
  },

  WORKSHEET_MEDIA: {
    MEDIA_CD: {
      ISIMG: 'ISIMG',
      ISMOV: 'ISMOV',
      YOUTB: 'YOUTB',
      UPIMG: 'UPIMG',
      UPFILE: 'UPFILE'
    }
  },
  WORKSHEET_INFO: {
    SHEET_STATUS: {
      USED: 'USED',
      NOT_USED: 'NOT_USED',
      TEMP: 'TEMP'
    }
  },
  WORKSHEET_APPLY: {
    CREATE: 'CREATE',
    DETAIL: 'DETAIL',
    MODIFY: 'MODIFY',
  },
  WORKSHEET_CREATE: {
    COPY: {
      TITLE: {
        PREFIX: '[복사본] '
      }
    }
  },

  LOG_LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
  },

  UPLOAD_LOCATION: {
    CLASS: 'CLASS',
    CLASS_COMMENT: 'CLASS_COMMENT',
    HITALK: 'HITALK',
    SURVEY: 'SURVEY',
  },

  /**
   * post
   */
  POST_ITEM_TYPE: {
    POST: 'POST',
    CLAZZES_POST: 'CLAZZES_POST',
    SCHOOLS_POST: 'SCHOOLS_POST',
  },
  POST_HOMEWORK_TYPE: {
    ALL: 'ALL',
    SUBMIT: 'SUBMIT',
    NOT_SUBMIT: 'NOT_SUBMIT',
  },
  POST_STATUS: {
    ALL: 'ALL',
    COMPLETE: 'COMPLETE',
    TEMPORARY: 'TEMPORARY',
    RESERVE: 'RESERVE',
  },
  POST_TYPE: {
    /**
     * clazzes
     */
    NOTE: 'NOTE',
    ALBUM: 'ALBUM',
    BOARD: 'BOARD',
    HOMEWORK: 'HOMEWORK',

    /**
     * schools
     */
    NOTICE: 'NOTICE',
    ALARM: 'ALARM',
    ALARM_PLUS: 'ALARM_PLUS',
    MEAL: 'MEAL',
    ALARM_EDU_OFFICE: 'ALARM_EDU_OFFICE',

    /**
     * info
     */
    EDUCATION: 'EDUCATION',
    HINOTICE: 'HINOTICE',
    EVENT: 'EVENT',
    CP_BOARD: 'CP_BOARD',

    /**
     * calendar
     */
    CALENDAR_SCHOOL: 'CALENDAR_SCHOOL',
    CALENDAR_CLASS: 'CALENDAR_CLASS',

    /**
     * banner
     */
    BANNER: 'BANNER',
  },
  POST_VERSION: {
    V1: 'V1',
    V2: 'V2',
  },

  /**
   * clazzes
   */
  CLASS_STATUS: {
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
    CLOSING: 'CLOSING',
    CLOSED: 'CLOSED',
  },
  /**
   * clazzes > board
   */
  BOARD_STATUS: {
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
  },

  /**
   * schools
   */
  SCHOOL_STATUS: {
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
    CLOSING: 'CLOSING',
  },

  /**
   * survey
   */
  SURVEY_STATUS: {
    // DB에 저장됨
    TEMPORARY: 'TEMPORARY',
    COMPLETE: 'COMPLETE',
    // surveyPosted, timestampStart, timestampEnd 값에 의해 변경됨
    RESERVATION: 'RESERVATION',
    WAITING: 'WAITING',
    DOING: 'DOING',
    END: 'END',
  },
  SURVEY_STATUS_NAME: {
    // DB에 저장됨
    TEMPORARY: '대기',
    COMPLETE: '완료',
    // surveyPosted, timestampStart, timestampEnd 값에 의해 변경됨
    RESERVATION: '예약',
    WAITING: '대기',
    DOING: '진행중',
    END: '종료',
  },
  ANSWER_STATUS: {
    NONE: 'NONE',
    WAIT: 'WAIT',
    TEMPORARY: 'TEMPORARY',
    REJECT: 'REJECT',
    COMPLETE: 'COMPLETE'
  },
  ANSWER_STATUS_NAME: {
    NONE: '응답없음',
    WAIT: '응답대기',
    TEMPORARY: '응답중',
    REJECT: '응답거절',
    COMPLETE: '응답완료'
  },
  SURVEY_TYPE: {
    FCFS: 'FCFS',
    DRAW: 'DRAW',
    SURVEY: 'SURVEY',
    VOTE: 'VOTE',
    AFTER_SCHOOL: 'AFTER_SCHOOL',
    CONSULTATION: 'CONSULTATION',
  },
  SURVEY_TYPE_NAME: {
    FCFS: '선착순',
    DRAW: '추첨',
    SURVEY: '설문',
    VOTE: '투표',
    AFTER_SCHOOL: '방과후 신청',
    CONSULTATION: '학부모 상담',
  },
  QUESTION_TYPE: {
    CHOICE: 'CHOICE',
    SUBJECTIVE: 'SUBJECTIVE',
    SIGN: 'SIGN',
    DROPDOWN: 'DROPDOWN',
    STAR: 'STAR',
    ATTACHMENTS: 'ATTACHMENTS',
    DESCRIPTION: 'DESCRIPTION',
    CONSULTATION: 'CONSULTATION',
    AFTER_SCHOOL: 'AFTER_SCHOOL',
    VOTE: 'VOTE'
  },
  QUESTION_TYPE_NAME: {
    CHOICE: '객관식',
    SUBJECTIVE: '주관식',
    SIGN: '서명',
    DROPDOWN: '드롭다운',
    STAR: '별점',
    ATTACHMENTS: '첨부파일',
    DESCRIPTION: '설명',
    CONSULTATION: '학부모 상담',
    AFTER_SCHOOL: '방과후 신청',
    VOTE: '투표'
  },

  /**
   * attendance 출결알리기
   */
  ATTENDANCE_TYPE: {
    ABSENCE: '결석',
    EARLY_LEAVE: '조퇴',
    LATENESS: '지각',
    OUT: '외출',
    FIELD_STUDY: '가정 체험학습',
  },
  ATTENDANCE_RESULT: {
    ILLNESS: '질병',
    NOT_ACCEPT: '미인정',
    ETC: '기타',
    ATTENDANCE: '출석인정'
  },

  /**
   * hitalk
   */
  ROOM_TYPE: {
    PERSON: 'PERSON',
    GROUP: 'GROUP',
  },

  /**
   * openPopup
   */

  POPUP: {
    HI_TALK: {
      path:'/hitalk',
      target: 'hitalk',
      features: {
        width: 1050,
        height: 640,
        toolbar: 'no',
        menubar: 'no',
        location: 'no',
        status: 'no'
      }
    },
    BEHAVIOR_RECORD: {
      path:'/behavior-records',
      target: 'behaviorRecords',
      features: {
        width: 1920,
        height: 1080,
        toolbar: 'no',
        menubar: 'no',
        location: 'no',
        status: 'no'
      }
    }
  }

})