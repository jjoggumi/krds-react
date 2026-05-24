import Vue from 'vue'
import $axios from '@/plugins/axios'
import axios from 'axios'

export class Controller {
  constructor() {
    this.classroomId = null
    this.axios = $axios
    this.model = Vue.observable({
      checklistId: null
    })
  }

  setClassroomId(classroomId) {
    this.classroomId = classroomId
  }
  setChecklistId(checklistId) {
    this.model.checklistId = checklistId
  }

  init(token = null) {
    if (token) {
      // 인원체크 새 창 열기의 axios 인스턴스 생성
      let config = {
        baseURL: process.env.VUE_APP_BASE_API_URI,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      const tempAxios = axios.create(config)
      tempAxios.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${token}`
          return config
        },
        (error) =>  Promise.reject(error)
      )

      this.axios = tempAxios
    }
  }

  /**
   * 체크판 (모든 유형) 조회
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-read
   */
  async reloadChecklist(params) {
    if (!this.classroomId || !this.model.checklistId) return
    return await this.axios.get(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}`, { params })
  }

  /**
   * 체크판 (모든 유형) 조회 (새 창 열기)
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-read
   */
  async reloadChecklistTemporary() {
    return await this.axios.get(`/classroom/checklist/temporary`, { params: { isIncludeStudents: true } })
  }

  /**
   * 체크판 (모든 유형) 상태 변경
   * https://api.hiclass.net/docs/classroom.html#classroomStudent-complete
   * 새 창 열기: https://devapiboard.hiclass.net/docs/classroom.html#classroomChecklist-blank-inProgress
   * isExternal: true 면 인원체크 새창 열기
   */
  async updateChecklistStatus(isExternal = false, status, params) {
    return isExternal ?
      await this.axios.patch(`/classroom/checklist/${status}`, null, { params }) :
      await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/${status}`, null, { params })
  }

  /**
   * 체크판 (모든 유형) 초기화
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-reset
   */
  async resetChecklist(params) {
    return await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/reset/all`, null, { params })
  }

  /**
   * 체크판 (모든 유형) 삭제
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-delete
   */
  async deleteChecklist(params) {
    return await this.axios.delete(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}`, { params })
  }

  /**
   * 체크판 (모든 유형) 복사
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-copy
   */
  async copyChecklist({checklistId, userId}) {
    return await this.axios.put(`/classroom/${this.classroomId}/checklist/${checklistId}/copy`, null, { params: { userId } })
  }

  /**
   * 체크판 (모든 유형) 날짜 변경
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-update-date
   */
  async updateChecklistDate(data) {
    return await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/date`, data)
  }

  /**
   * 체크판 (모든 유형) 제목 변경
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-update-title
   */
  async updateChecklistTitle(data) {
    return await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/title`, data)
  }

  /**
   * 체크판 (모든 유형) 학생 제거
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-delete-student
   */
  async deleteChecklistStudent(data) {
    return await this.axios.delete(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/students`, { data })
  }

  /**
   * 평가판 항목별 초기화
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-reset-levelComment
   * 새 창 열기: https://devapiboard.hiclass.net/docs/classroom.html#classroomChecklist-blank-reset-levelComment
   * isExternal: true 면 인원체크 새창 열기
   */
  async resetChecklistLevelItem(isExternal, params) {
    return isExternal ?
      await this.axios.patch(`/classroom/checklist/reset/level-comment`, null, { params }) :
      await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/reset/level-comment`, null, { params })
  }

  /**
   * 체크판 학생별 메모 변경
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-update-memo
   * 새 창 열기: https://devapiboard.hiclass.net/docs/classroom.html#classroomChecklist-blank-update-memo
   * isExternal: true 면 인원체크 새창 열기
   */
  async updateChecklistMemo(isExternal = false, { studentId, data }) {
    return isExternal ?
      await this.axios.patch(`/classroom/checklist/memo/${studentId}`, data) :
      await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/memo/${studentId}`, data)
  }

  /**
   * 체크판 메모 초기화
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-reset
   */
  async resetChecklistMemo(params) {
    return await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/reset/memo`, null, { params })
  }

  /**
   * 전체 체크/체크해제
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-update-check
   * mode: 'check' or 'uncheck'
   */
  async updateChecklistCheckStatus(isExternal, { mode, data }) {
    return isExternal ?
      await this.axios.patch(`/classroom/checklist/${mode}`, data) :
      await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/${mode}`, data)
  }

  /**
   * 학생별 체크/체크해제
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-update-check
   * 인원체크 새 창 열기: https://devapiboard.hiclass.net/docs/classroom.html#classroomChecklist-blank-update-check
   * mode: 'check' or 'uncheck'
   * isExternal: true 면 인원체크 새창 열기
   */
  async updateChecklistStudentCheckStatus(isExternal = false, { mode, studentId, data }) {
    return isExternal?
      await this.axios.patch(`/classroom/checklist/${mode}/${studentId}`, data) :
      await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/${mode}/${studentId}`, data)
  }

  /**
   * 평가판 평가 변경
   * https://api.hiclass.net/docs/classroom.html#classroomChecklist-update-levelComment
   * 인원체크 새 창 열기: https://devapiboard.hiclass.net/docs/classroom.html#classroomChecklist-blank-levelComment
   * isExternal: true 면 인원체크 새창 열기
   */
  async updateChecklistLevelComment(isExternal = false, data) {
    return isExternal ?
      await this.axios.patch(`/classroom/checklist/level-comment`, data) :
      await this.axios.patch(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/level-comment`, data)
  }

  /**
   * 인원체크 새 창 열기: token 생성
   * https://devapiboard.hiclass.net/docs/classroom.html#classroomChecklist-blank-token
   */
  async createChecklistToken(data) {
    return await this.axios.post(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/token`, data)
  }

  /**
   * 인원체크 새 창 열기: token 삭제
   * https://devapi.hiclass.net/docs/classroom.html#classroomChecklist-blank-token-delete
   */
  async deleteChecklistToken() {
    return await this.axios.delete(`/classroom/${this.classroomId}/checklist/${this.model.checklistId}/token`)
  }
}