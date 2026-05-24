import Vue from 'vue';
import $axios from '@/plugins/axios';

export class Controller {
  constructor() {
    this.classroomId = null;
    this.model = Vue.observable({
      points: [],
    });
  }

  setClassroomId(classroomId) {
    this.classroomId = classroomId;
  }

  setPoints(points, isOverwrite) {
    const pointsWithState = points.map((point) => ({ ...point, checked: false, issueCount: 1 }));
    isOverwrite ? (this.model.points = pointsWithState) : this.model.points.push(...pointsWithState);
  }

  initPoints() {
    this.model.points = [];
  }

  resetPointChecked() {
    this.model.points.forEach((point) => {
      point.checked = false;
      point.issueCount = 1;
    });
  }

  appendPoints(point) {
    this.model.points.push(point);
  }

  async reloadPoints(params) {
    if (!this.classroomId) return;

    try {
      const {
        data: { page, _embedded },
      } = await $axios.get(`/classroom/${this.classroomId}/points`, { params });
      if (_embedded && _embedded.classroomPoints && _embedded.classroomPoints.length > 0) {
        this.setPoints(_embedded.classroomPoints, page.number === 0);
      } else {
        this.initPoints();
      }
      return page.totalPages <= params.page + 1;
    } catch (err) {
      return true;
    }
  }

  deletePoint(pointId, params) {
    $axios.delete(`/classroom/${this.classroomId}/point/${pointId}`, { params });
    const targetIdx = this.model.points.findIndex((p) => p.pointId === pointId);
    if (targetIdx > -1) this.model.points.splice(targetIdx, 1);
  }

  async rewardPoints({ userId, students, memo, isNegative, issueDt, isVisiblePoint }, sendFields = {}) {
    try {
      const checkedPoints = this.model.points.filter((p) => p.checked);
      const pointIssues = checkedPoints.map(({ pointId, issueCount }) => ({ pointId, issueCount }));
      const studentGroups = students.map((sGroup, idx) => ({ orderNo: idx + 1, studentIds: sGroup.map((s) => s.studentId) }));

      const res = await $axios.post(`/v2/classroom/${this.classroomId}/rewards`, {
        userId,
        pointIssues,
        studentGroups,
        memo,
        issueDt,
        isVisiblePoint,
      });

      if (isNegative !== null) {
        const localStorageKey = `behaviorGive${!isNegative ? 'Good' : 'Bad'}PointIds`;
        localStorage.setItem(localStorageKey, JSON.stringify(checkedPoints.map((p) => p.pointId)));
      }

      const classroomPoints = checkedPoints.map(({ pointId, pointName, pointImage, pointColor, isNegative }) => ({
        pointId,
        pointName,
        pointImage,
        pointColor,
        isNegative,
      }));

      const studentPoints = [...new Set(studentGroups.map((group) => group.studentIds).flat())].map((studentId) => {
        const { studentName, studentCharacter, studentPhoto } = students.flat().find((s) => s.studentId === studentId);
        return { studentId, studentName, studentCharacter, studentPhoto, point: res.data.studentPoints[studentId] };
      });

      return {
        contentType: 'pointComplete',
        content: JSON.stringify({
          rewardId: res.data.rewardId,
          classroomId: this.classroomId,
          classroomPoints: classroomPoints,
          studentPoints: studentPoints,
          ...sendFields,
        }),
        sender: userId,
      };
    } catch (err) {
      return null;
    }
  }

  async deleteReward(deleteItem) {
    const res = await $axios.delete(`/v2/classroom/${this.classroomId}/rewards`, { data: deleteItem });
    return Object.keys(res.data.studentPoints);
  }
}
