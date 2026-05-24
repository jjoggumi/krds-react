// 공통 상수
export const CARD_LABEL = Object.freeze({
  CHECK: '체크판',
  SCORE: '점수판',
  MEMO:  '메모판',
  LEVEL_COMMENT: '평가판'
})
export const CARD_META = Object.freeze([
  { type: 'CHECK', class: 'check', icon: 'bh-icon-checklist-fill-52' },
  { type: 'SCORE', class: 'point', icon: 'bh-icon-score-fill-52' },
  { type: 'MEMO', class: 'memo', icon: 'bh-icon-memo1-fill-52' },
  { type: 'LEVEL_COMMENT', class: 'level', icon: 'bh-icon-level-fill-52' }
])
export const CHECK_ITEM_KEY = ['A', 'B', 'C', 'D', 'E']

// 공통 함수
export function isPhoto(student) {
  return student.studentPhoto !== null
}
export function selectedImageSrc(student) {
  return isPhoto(student) 
    ? student.studentPhoto
    : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`
}
export function selectedDateString(timestamp) {
  const date = this.$moment(new Date(timestamp)) 
  return `${date.format('YY.MM.DD')} ${'('+this.getDayName(date.day())+')'}`
}
export function dateConvertTimeStamp(date) {
  const convertDate = new Date(date).getTime()
  return convertDate
}
export function dateToString(str) {
  const convertDate = new Date(str).getTime()
  const date = this.$moment(new Date(convertDate)) 
  return `${date.format('YY.MM.DD')} ${'('+this.getDayName(date.day())+')'}`
}
export function handleTokenExpired() {
  window.hiClass.alert('만료된 페이지입니다.'). then(() => {
    location.href = "/"
  })
}