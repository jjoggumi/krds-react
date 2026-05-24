<!--
@File(Method): ExcludeStudentsEdit.vue
@Date Created: 2025-06-23
@Description: 학급기록 > 인원체크 > 상세 > 학생 추가
@Modified: #74594 인원체크 상세 새창 분리
-->
<template>
  <div v-show="hasExcludeStudents" id="search-student-list-add" class="search-student-list-add">
    <div class="search-student-list-add__wrap">
      <div class="title-wrap">
        <h2>학생 추가하기</h2>
      </div>

      <div class="list">
        <p>
          <input
              type="checkbox"
              id="chk-student-list-add-total"
              v-model="isCheckAll"
              @click="handleCheckAll"
          >
          <label for="chk-student-list-add-total"><span>전체</span></label>
        </p>
        <ul>
          <li v-for="(student) of students" :key="`search-student-list-add-${student.studentId}`">
            <input type="checkbox" :id="`chk-student-list-add-${student.studentId}`" v-model="student.checked" @change="handleCheck">
            <label :for="`chk-student-list-add-${student.studentId}`">
              <span class="image">
                <img :class="{ 'is-photo': student.studentPhoto }" :src="selectedImageSrc(student)" alt=""/>
              </span>
              <span class="num">{{ student.studentNo }}</span>
              <span class="name">{{ student.studentName }}</span>
            </label>
          </li>
        </ul>
      </div>

      <div class="btn-wrap">
        <button @click="addStudent" :class="{ dis: !isSubmit }" :disabled="!isSubmit">
          {{ students.filter(student => student.checked).length }}명 추가
        </button>
      </div>

      <div class="modal-close-btn" @click="$emit('closeStudentEdit')"></div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: 'ExcludeStudentsEdit',
  data() {
    return {
      students: [],
      isCheckAll: false,
      hasExcludeStudents: false
    }
  },
  props: {
    checklistId: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeBehavior', ['curClassroom']),
    isSubmit() {
      return this.students.filter(student => student.checked).length > 0
    }
  },
  created() {
    this.getExcludeStudents()
  },
  methods: {
    async getExcludeStudents() {
      try {
        const res = await this.$axios.get(`/classroom/${this.curClassroom.classroomId}/checklist/${this.checklistId}/exclude-students`, {
          params: { userId : this.user.currentId }
        })

        if (res.data._embedded) {
          this.students = res.data._embedded.classroomStudents.map(item => ({ ...item, checked: false }))
          this.hasExcludeStudents = true
          return
        }

        this.$emit('openConfirmModal', {
          isOpen: true,
          title: '추가할 학생이 없습니다.',
          description: '',
          confirmButtonText: '확인',
          confirmButtonColor: '',
          action: '',
          isAlert: true,
          target: null
        })
      } catch (err) {
        this.$log.debug('classroom checklist exclude-students GET() error => ', err)
      }
    },
    handleCheckAll() {
      this.students.map(student => {
        student.checked = !this.isCheckAll
      })
    },
    handleCheck() {
      this.isCheckAll = this.students.filter(s => s.checked).length === this.students.length
    },
    selectedImageSrc(student) {
      return student.studentPhoto
          ? `${student.studentPhoto.replace('download.hiclass.net', 'image.hiclass.net')}?width=40&height=40`
          : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`
    },
    async addStudent() {
      let studentIds = this.students.filter(s => s.checked).map(s => s.studentId)

      if (studentIds.length > 0) {
        try {
          const res = await this.$axios.put(`/classroom/${this.curClassroom.classroomId}/checklist/${this.checklistId}/students`, {
            userId: this.user.currentId,
            studentIds
          })

          if (res.data && res.data.students) {
            const newStudents = res.data.students.map(s => {
              return { ...s, new: studentIds.findIndex(sId => sId === s.studentId) > -1 }
            })

            this.$emit('setStudents', newStudents)
          }
        } catch (err) {
          this.$log.debug(' classroom checklist items PUT() error => ', err)
        }
      }
    }
  }
}
</script>