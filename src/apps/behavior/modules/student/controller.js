import Vue from 'vue'
import $axios from '@/plugins/axios'

export class Controller {
  constructor() {
    this.classroomId = null
    this.model = Vue.observable({
      students: [],
      studentsWithPoints: []
    })
  }

  setClassroomId(classroomId) {
    this.classroomId = classroomId
  }

  setStudents(students) {
    this.model.students = students.map(student => ( { ...student, checked: false } ))
  }

  setStudentsWithPoints(students, curPage) {
    const studentsWithState = students.map(student => ( { ...student, checked: false } ))
    curPage === 0 ?
      this.model.studentsWithPoints = studentsWithState :
      this.model.studentsWithPoints.push(...studentsWithState)
  }

  resetStudentsWithPoints() {
    this.model.studentsWithPoints.splice(0)
  }

  resetStudentsChecked() {
    this.model.students.forEach(student => {
      student.checked = false
    })
  }

  resetStudentsWithPointsChecked(students) {
    this.model.studentsWithPoints.forEach(student => {
      student.checked = false
    })
  }

  async reloadStudents(params) {
    if (!this.classroomId) return

    const { data: { _embedded } } = await $axios.get(`/classroom/${this.classroomId}/students`, { params })
    if (_embedded && _embedded.classroomStudents && _embedded.classroomStudents.length > 0) {
      this.setStudents(_embedded.classroomStudents)
    }
  }
  
  async reloadStudentsWithPoints(params) {
    if (!this.classroomId) return

    const { data: { page, _embedded } } = await $axios.get(`/classroom/${this.classroomId}/report/point/total/students`, { params })
    if (_embedded && _embedded.studentPoints && _embedded.studentPoints.length > 0) {
      this.setStudentsWithPoints(_embedded.studentPoints, page.number)
      params.page++
      if ((page.totalPages || 0) > params.page) {
        await this.reloadStudentsWithPoints(params)
      }
    }
  }

  async reloadStudentTotalPoint(params) {
    if (!this.classroomId) return

    const res = await $axios.get(`/classroom/${this.classroomId}/report/point/total`, { params })
    const targetIdx = this.model.studentsWithPoints.findIndex(s => s.studentId === params.studentId)
    if (targetIdx > -1) {
      this.model.studentsWithPoints[targetIdx].negativePoint = res.data.negativePoint
      this.model.studentsWithPoints[targetIdx].positivePoint = res.data.positivePoint
      this.model.studentsWithPoints[targetIdx].totalPoint = res.data.totalPoint
    }
  }
}