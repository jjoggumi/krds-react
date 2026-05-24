<template>
  <tbody>
  <edit-item
      v-for="(student, idx) of filteredStudents"
      :key="`student-${idx}`"
      :student="student"
      :filteredStudents="filteredStudents"
      :cloneStudents="cloneStudents"
      :arrIndex="idx"
      @checkDuplicate="checkDuplicate"
  />
  </tbody>
</template>

<script>
import EditItem from "@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendanceStudentListEditItem";
import {mapActions, mapGetters} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "main-body-clazzes-body-attendance-student-list-edit",
  components: {EditItem},
  props: {
    filteredStudents: {
      type: Array
    },
    cloneStudents: {
      type: Array
    }
  },
  computed: {
    ...mapGetters(['curClassId'])
  },
  methods: {
    ...mapActions('storeClazzTag', ['fetchTags']),
    /**
     * 중복체크
     */
    checkDuplicate() {
      const filterArr = this.filteredStudents.filter(student => {
        return student.studentName.trim() !== '' &&
            student.studentNo.toString().trim() !== '' &&
            student.tagName && student.tagName.trim() !== ''
      }).map(o => `${o.studentNo}-${o.studentName.replace(/\s/g, "")}-${o.tagName}`)

      const duplicate = Object.entries(filterArr.reduce((accu, curr) => {
        accu[curr] = (accu[curr] || 0) + 1
        return accu
      }, {})).filter(o => o.pop() > 1).map(o => o.shift())


      this.filteredStudents.forEach(o => {
        o.isDuplicate = duplicate.includes(`${o.studentNo}-${o.studentName.replace(/\s/g, "")}-${o.tagName}`)
      })
    }
  },
  mounted() {
    this.fetchTags(this.curClassId)

    eventBus.$on('set-attendance-student-list', async (addedStudents) => {
      let lastIdx = 0
      for (let i = this.filteredStudents.length - 1; i > -1; i--) {
        const s = this.filteredStudents[i]
        if (s.studentName !== '' || s.studentNo.toString() !== '' || s.tagName !== '') {
          lastIdx = i + 1
          break
        }
      }

      this.filteredStudents.splice(lastIdx, this.filteredStudents.length - 1 - lastIdx, ...addedStudents.map(s => ({
        studentId: null,
        tagId: s.tagId,
        tagName: s.tagName,
        studentName: s.studentName,
        studentNo: s.studentNo,
        isUsed: null,
        isDuplicate: false,
        isErrorStudentName: false,
        isErrorStudentNo: false,
        isErrorTag: false
      })))

      await this.$nextTick()

      eventBus.$emit('valid-attendance-student-list')
    })
  },
  beforeDestroy() {
    eventBus.$off('set-attendance-student-list')
  }
}
</script>

<style scoped>

</style>