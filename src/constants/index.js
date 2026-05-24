import Vue from 'vue'

const CONSTANTS = Object.freeze({
  USER_TYPE: [
    { code: 'TEACHER', name: '선생님' },
    { code: 'PARENTS', name: '학부모' },
    { code: 'STUDENT', name: '학생' },
    { code: 'ADMIN', name: '관리자' }
  ],
  SCHOOL_TYPE: {
    all: [
      { schoolType: "KINDERGARTEN", typeName: "유치원" },
      { schoolType: "ELEMENTARY", typeName: "초등학교" },
      { schoolType: "MIDDLE", typeName: "중학교" },
      { schoolType: "HIGH", typeName: "고등학교" },
      { schoolType: "SPECIAL", typeName: "특수학교" },
      { schoolType: "UNIVERSITY", typeName: "대학교" }
    ],
    allWithGrade: {
      KINDERGARTEN: [
        { grade: "", gradeCode: "K" }
      ],
      ELEMENTARY: [
        { grade: "1", gradeCode: "E1" },
        { grade: "2", gradeCode: "E2" },
        { grade: "3", gradeCode: "E3" },
        { grade: "4", gradeCode: "E4" },
        { grade: "5", gradeCode: "E5" },
        { grade: "6", gradeCode: "E6" }
      ],
      MIDDLE: [
        { grade: "1", gradeCode: "M1" },
        { grade: "2", gradeCode: "M2" },
        { grade: "3", gradeCode: "M3" }
      ],
      HIGH: [
        { grade: "1", gradeCode: "H1"},
        { grade: "2", gradeCode: "H2" },
        { grade: "3", gradeCode: "H3" }
      ],
      SPECIAL: [
        { grade: "1", gradeCode: "E1" },
        { grade: "2", gradeCode: "E2" },
        { grade: "3", gradeCode: "E3" },
        { grade: "4", gradeCode: "E4" },
        { grade: "5", gradeCode: "E5" },
        { grade: "6", gradeCode: "E6" }
      ],
      UNIVERSITY: [
        { grade: "1", gradeCode: "U1" },
        { grade: "2", gradeCode: "U2" },
        { grade: "3", gradeCode: "U3" },
        { grade: "4", gradeCode: "U4" }
      ]
    },
    blackBoard: ["NONE", "KINDERGARTEN", "ELEMENTARY"],
    notBlackBoard: ["MIDDLE", "HIGH", "SPECIAL", "UNIVERSITY"],
    class: [
      { value: 'KINDERGARTEN', title: '유치원 / 어린이집', description: '<span class="txt-primary">(병설/단설/국공립/사립 등)</span> <span  class="txt-warning"> *투약의뢰서 제공</span>' },
      { value: 'ELEMENTARY', title: '초등학교' },
      { value: 'MIDDLE', title: '중학교' },
      { value: 'HIGH', title: '고등학교' },
      { value: 'UNIVERSITY', title: '대학교' },
      { value: 'GROUP', title: '학원, 일반단체, 기타' }
    ]
  },
  POST_TYPE: [
    {
      code: 'NOTE',
      arr : [
        { type: 'NONE', name: '알림장' },
        { type: 'KINDERGARTEN', name: '알림장' },
        { type: 'ELEMENTARY', name: '알림장' },
        { type: 'MIDDLE', name: '공지' },
        { type: 'HIGH', name: '공지' },
        { type: 'SPECIAL', name: '공지' },
        { type: 'UNIVERSITY', name: '공지' },
        { type: 'GROUP', name: '공지' }
      ]
    },
    { code: 'ALBUM', arr: [{ type: undefined, name: '앨범' }] },
    { code: 'BOARD', arr: [{ type: undefined, name: '자유게시판' }] },
    { code: 'NOTICE', arr : [{ type: undefined, name: '학교공지' }] },
    { code: 'ALARM', arr : [{ type: undefined, name: '가정통신문' }] },
    { code: 'MEAL', arr : [{ type: undefined, name: '급식' }] },
    { code: 'EDUCATION', arr : [{ type: undefined, name: '추천정보' }] },
    { code: 'EVENT', arr : [{ type: undefined, name: '이벤트' }] },
    { code: 'CALENDAR_SCHOOL', arr : [{ type: undefined, name: '학사일정' }] },
    { code: 'CALENDAR_CLASS', arr : [{ type: undefined, name: '우리반일정' }] },
    {
      code: 'ALARM_PLUS',
      arr : [
        { type: undefined, name: '가정통신문' },
        { type: null, name: '가정통신문' },
        { type: 'GENERAL', name: '가정통신문' },
        { type: 'CONSULTATION', name: '가정통신문' },
        { type: 'QUESTIONNAIRE', name: '가정통신문' },
        { type: 'AFTER_SCHOOL', name: '가정통신문' }
      ]
    },
    { code: 'ALARM_EDU_OFFICE', arr : [{ type: undefined, name: '가정통신문(교육청)' }] },
    { code: 'BANNER', arr : [{ type: undefined, name: '배너' }] },
    { code: 'HOMEWORK', arr : [{ type: undefined, name: '과제' }] },
    { code: 'HINOTICE', arr : [{ type: undefined, name: '공지사항' }] },
    { code: 'CP_BOARD', arr : [{ type: undefined, name: 'CP게시글' }] }
  ],
  CLASS_APPLY: {
    applyType: [
      { code: 'ABSENT', name: '결석사유서' },
      { code: 'FIELD_STUDY', name: '체험학습' },
      { code: 'MEDICATION_ORDER', name: '투약의뢰서' },
      { code: 'CONSENT', name: '동의서' },
      { code: 'ETC', name: '기타' }
    ],
    applyStatus: [
      { code: 'UNIDENTIFIED', name: '미확인' },
      { code: 'REJECT', name: '확인요청' },
      { code: 'COMPLETE', name: '결재완료' }
    ],
    parentType: [
      { code: 'MOTHER', name: '어머니' },
      { code: 'FATHER', name: '아버지' },
      { code: 'GRANDPARENTS', name: '조부모' },
      { code: 'COUSIN', name: '친인척' },
      { code: 'ETC', name: '직접입력' }
    ],
    leaderType: [
      { code: 'MOTHER', name: '어머니' },
      { code: 'FATHER', name: '아버지' },
      { code: 'GRANDPARENTS', name: '조부모' },
      { code: 'COUSIN', name: '친인척' },
      { code: 'ETC', name: '직접입력'}
    ]
  },
  WORKSHEET_APPLY: {
    applyType: [
      { code: 'ABSENT', name: '결석사유서', class: 'absence' },
      { code: 'FIELD_STUDY', name: '체험학습', class: 'fieldtrip' },
      { code: 'MEDICATION_ORDER', name: '투약의뢰서', class: 'medication' },
      { code: 'CONSENT', name: '동의서', class: 'consent' },
      { code: 'ETC', name: '기타', class: '' },
    ],
    sheetStatus: [
      { code: 'USED', name: '사용', class: 'txt-primary' },
      { code: 'NOT_USED', name: '미사용', class: 'txt-gray' },
      { code: 'TEMP', name: '임시저장', class: 'txt-error' }
    ],
  },
  CS_PROCCED_STATUS: [
    { code: "INPROGRESS", name: "상담 처리중" },
    { code: "COMPLETE", name: "상담 처리 완료" },
    { code: "TRANSREQUEST", name: "이관 요청" },
    { code: "TRANSCOMPLETE", name: "이관 처리 완료" },
    { code: "CSREQUEST", name: "상담 재요청" },
    { code: "CSRECOMPLETE", name: "상담 재확인 완료" },
    { code: "ALLCOMPLETE", name: "최종 처리 완료" }
  ]
})

Vue.prototype.$constants = CONSTANTS

export default CONSTANTS