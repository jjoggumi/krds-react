import Vue from 'vue'
import {Classrooms} from '@/apis/Classrooms'
import {Classroom} from '@/apis/Classroom'
import {
  putClassRoomExcludeStudents
} from "@hiclass/core"

const api = {
  classrooms: new Classrooms(),
  classroom: new Classroom()
}

export class Controller {
  constructor() {
    this.classroomId = null
    this.model = Vue.observable({
      classroomStudents: [],
      pickedStudentIds: []
    })
  }

  async setClassroomId(classroomId) {
    this.classroomId = classroomId
    await this.reloadReference()
  }

  reloadReference() {
    return Promise.all([
      this.reloadStudents(),
      this.syncAccumWinners()
    ])
  }

  async reloadStudents() {
    if (!this.classroomId) return;
    const {data} = await api.classroom.searchStudents(
      this.classroomId, { userId: localStorage.uuid })
    this.model.classroomStudents = ((data._embedded || {}).classroomStudents || []).filter(s => !s.isHidden);
    return this.model.classroomStudents
  }

  spinRandomDrawRandom({
    gender = 'ALL',
    drawType = 'RANDOM',
    targetNum = 1,
    classroomId = this.classroomId,
    deviceType = 'WEB'
  }) {
    return api.classrooms.spinRandomDrawRandom({
      gender, drawType, targetNum, classroomId, deviceType
    })
  }

  async syncAccumWinners() {
    const { data: { drawResult: { studentIds } } } 
      = await api.classrooms.accumulatedWinnersAccumClassroomId(this.classroomId)
    this.model.pickedStudentIds = studentIds;
    return this.model.pickedStudentIds;
  }

  async syncLatestWinners({
    drawType = 'RANDOM',
    classroomId = this.classroomId
  }) {
    const {data: {drawResult}} = await api.classrooms.latestWinnersLatestClassroomId(
      drawType, classroomId
    );
    return drawResult;
  }

  async resetRandomDrawRandomClassRoomId({classroomId = this.classroomId}) {
    await api.classrooms.resetRandomDrawRandomClassRoomId(classroomId)
    await this.syncAccumWinners()
  }

  async updateClassroomExcludeStudents(excludeStudentIds) {
    return putClassRoomExcludeStudents(this.classroomId, {
      userId: localStorage.uuid,
      isExcluded: true,
      studentIds: excludeStudentIds,
    });
  }
}
