<template>
  <HiModal type="type01" size="md" id="attendanceStudentRegisterModal" @close="closeModal">
    <template v-slot:heading>학생명단 등록하기</template>
    <template v-slot:content>
      <div class="student-register-modal-wrap" ref="scrollArea">
        <div class="desc txt-left pb-15">
          1. 엑셀 양식을 다운로드하여 업로드 하거나, 아래 리스트에 직접 입력해주세요.
        </div>
        <div class="btns txt-left">
          <HiButton color="default" size="md" outline class="mr-10" @click="downloadSample">
            <i class="icon-excel"></i>
            EXCEL 양식 다운로드
          </HiButton>
          <input type="file" ref="attach" accept=".xls,.xlsx" style="display:none" @change="uploadExcel"/>
          <HiButton color="default" size="md" outline @click="$refs.attach.click()">
            <HiIcon color="secondary" name="ico-file-upload" size="20"/>
            파일 업로드
          </HiButton>
        </div>

        <div class="desc txt-left pb-15 pt-15">
          2. <strong class="txt-primary">학반(태그), 반번호, 학생명을 정확히</strong> 입력해주세요.
          <br>
          명단 등록 후 수정 시 제출 내역 및 통계 데이터가 맞지 않을 수 있습니다.
        </div>
        <div class="desc txt-left pb-15">
          3. 등록된 명단이 있는 경우 기존 명단에 추가됩니다. 
        </div>
        <div class="hp-list-wrap">
          <div class="table-wrap">
            <table class="hi-tbl type02">
              <caption>등록 결과 확인</caption>
              <colgroup>
                <col style="width: 50px;">
                <col style="width: 107px;">
                <col style="width: 75px;">
                <col style="width: auto; min-width: 80px;">
              </colgroup>
              <thead>
              <tr>
                <th></th>
                <th>학반(태그) <span class="txt-warning">*</span></th>
                <th>반번호 <span class="txt-warning">*</span></th>
                <th>학생명 <span class="txt-warning">*</span></th>
              </tr>
              </thead>
              <tbody>
              <template v-for="(student, idx) of students">
                <tr :class="{'warning': student.errMsg.duplicate.length > 0 }" :key="`student-${idx}`">
                  <td>
                    <HiButton v-if="students.length > 1" color="link" @click="deleteInput(idx)"><HiIcon name="ico-close2" size="18"/></HiButton>
                  </td>
                  <td>
                    <div class="tag-wrap">
                      <input
                          :ref="`input-${idx}-0`"
                          type="text"
                          class="tag"
                          :class="{ 'warning': student.errMsg.duplicate.length === 0 && student.errMsg.tagName.length > 0 }"
                          :value="student.tagName"
                          @focus="onfocusInput(idx, 'tagName')"
                          @input="onInput($event, idx, 'tagName')"
                          @blur="onBlurTagName(idx)"
                          @keyup.enter="moveInput(idx, 0)"
                          @keydown="onKeydownTagName($event, idx)"
                      />
                      <div v-if=" student.errMsg.duplicate.length === 0 && student.errMsg.tagName.length > 0" class="tooltip">
                        <span v-html="student.errMsg.tagName"></span>
                      </div>
<!--                      <span class="caret" :class="{'selected' : activatedTagListRowIdx === idx}"></span>-->
                      <div v-if="activatedTagListRowIdx === idx" class="option-list">
                        <ul>
                          <li v-for="(tag, tagIdx) in filterTags(idx)" :key="tag.tagId" :ref="`tag-${tagIdx}`" @mousedown="selectTag(tag, idx)">
                            {{ tag.tagName }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                  <td>
                    <input
                        :ref="`input-${idx}-1`"
                        type="text"
                        :class="{ 'warning': student.errMsg.duplicate.length === 0 && student.errMsg.studentNo.length > 0 }"
                        :value="student.studentNo"
                        @focus="onfocusInput(idx, 'studentNo')"
                        @input="onInput($event, idx, 'studentNo')"
                        @blur="validInput(idx)"
                        @keyup.enter="moveInput(idx, 1)"
                    />
                    <div v-if=" student.errMsg.duplicate.length === 0 && student.errMsg.studentNo.length > 0" class="tooltip">
                      <span v-html="student.errMsg.studentNo" ></span>
                    </div>
                  </td>
                  <td>
                    <input
                        :ref="`input-${idx}-2`"
                        type="text"
                        :class="{ 'warning': student.errMsg.duplicate.length === 0 && student.errMsg.studentName.length > 0 }"
                        :value="student.studentName"
                        @focus="onfocusInput(idx, 'studentName')"
                        @input="onInput($event, idx, 'studentName')"
                        @blur="validInput(idx)"
                        @keyup.enter="students.length === idx + 1 ? addInput() : moveInput(idx, 2)"
                    />
                    <div v-if=" student.errMsg.duplicate.length > 0 || student.errMsg.studentName.length > 0" class="tooltip">
                      <span v-html="student.errMsg.duplicate.length > 0 ? student.errMsg.duplicate : student.errMsg.studentName"></span>
                    </div>
                  </td>
                </tr>
              </template>
              <tr>
                <td></td>
                <td>
                  <div class="tag-wrap">
                    <input type="text" class="tag" @focus="addInput"/>
<!--                    <span class="caret"></span>-->
                  </div>
                </td>
                <td>
                  <input type="text" @focus="addInput"/>
                </td>
                <td>
                  <input type="text" placeholder="ENTER키로 다음 칸으로 이동하세요." @focus="addInput"/>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="light-primary" size="lg" outline @click="initStudents">초기화</HiButton>
      <HiButton color="primary" size="lg" :disabled="!isValid || isSubmit" @click="saveStudents">등록</HiButton>
    </template>
  </HiModal>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import {eventBus} from "@/main";
import XLSX from "xlsx";
import { useClassErrorManager } from "@/apps/main/clazzes/utils";
const errorManager = useClassErrorManager();

export default {
  name: "attendance-student-register-modal",
  data() {
    return {
      students: [],
      focusedRowIdx: 0,
      focusedTagIdx: -1,
      activatedTagListRowIdx: -1,
      isSubmit: false
    }
  },
  computed: {
    ...mapState(['curClassItem']),
    ...mapState('storeClazzTag', ['clazzTags']),
    ...mapGetters(['curClassId']),
    isValid() {
      if (this.students.length === 0) return false
      return this.students.every(s =>
          s.errMsg.duplicate.length === 0 && s.errMsg.tagName.length === 0 &&
          s.errMsg.studentNo.length === 0 && s.errMsg.studentName.length === 0
      ) && this.students.some(s => !this.checkEmptyRow(s))
    }
  },
  methods: {
    ...mapMutations('storeClazzes', ['setIsShowAttendanceStudentRegisterModal']),

    /**
     * 다음 input으로 이동
     * param idx
     */
    moveInput(curRowIdx, curCellIdx) {
      if (curCellIdx === 0 && this.focusedTagIdx > -1) {
        this.selectTag(this.filterTags(curRowIdx)[this.focusedTagIdx], curRowIdx)
      }
      const rowIdx = curCellIdx === 2 ? curRowIdx + 1 : curRowIdx
      const cellIdx = curCellIdx === 2 ? 0 : curCellIdx + 1
      this.$refs[`input-${rowIdx}-${cellIdx}`][0].focus()
    },
    /**
     * input 생성
     */
    async addInput() {
      this.students.push({
        tagId: null,
        tagName: '',
        studentNo: '',
        studentName: '',
        errMsg: {
          tagName: '',
          studentNo: '',
          studentName: '',
          duplicate: ''
        }
      })

      await this.$nextTick()
      this.$refs[`input-${this.students.length - 1}-0`][0].focus()
      this.$refs.scrollArea.scrollTop = this.$refs.scrollArea.scrollHeight
    },
    deleteInput(idx) {
      this.students.splice(idx,1)
      if (this.students.filter(s => s.errMsg.duplicate.length > 0).length > 0) {
        this.validDuplicate()
      }
    },
    /**
     * 학생명단 저장
     * @returns {Promise<void>}
     */
    async saveStudents() {
      const filterStudents = this.students.filter(s => !this.checkEmptyRow(s)).map(s => ({
        tagId: s.tagId,
        tagName: s.tagName,
        studentNo: s.studentNo,
        studentName: s.studentName
      }))

      if (!this.curClassItem.attendanceUsed) {
        if (this.isSubmit) return
        try {
          this.isSubmit = true
          await this.$axios.post(`/clazzStudents/clazz/${this.curClassId}`, filterStudents)
          await this.activeAttendance()
        } catch (err) {
          errorManager.showErrorMsg('CLASS_STUDENT', err)
          this.validDuplicate()
        } finally {
          this.isSubmit = false
        }
      } else {
        eventBus.$emit('set-attendance-student-list', filterStudents)
        this.setIsShowAttendanceStudentRegisterModal(false)
      }
    },
    /**
     * 출결알리기 사용
     */
    async activeAttendance() {
      try {
        await this.$hiClass.clazzes.update({attendanceUsed: true}, `/clazzes/${this.curClassId}`)
        this.setIsShowAttendanceStudentRegisterModal(false)
        this.curClassItem.attendanceUsed = true
        localStorage.setItem('isStartAttendance', 'true')
        this.$router.push(`/main/clazzes/${this.$route.params.id}/attendance?tab=studentList`, () => {})
      } catch (err) {
        this.$log.debug(err)
      }
    },
    closeModal() {
      eventBus.$emit('set-temp-attendance-used', false)
      this.setIsShowAttendanceStudentRegisterModal(false)
    },
    async getClazzInviteStudents(page) {
      try {
        const res = await this.$axios.get(`/clazzes/${this.curClassId}/invite-students`, { params: { page, size: 20 } })
        if (res.data._embedded) {
          this.students.push(
              ...res.data._embedded.clazzInviteStudents.map(s => ({
                ...s,
                tagId: null,
                errMsg: {
                  tagName: '',
                  studentNo: '',
                  studentName: '',
                  duplicate: ''
                }
              }))
          )

          page++
          if (page < res.data.page.totalPages) {
            await this.getClazzInviteStudents(page)
          }
        } else {
          await this.addInput()
        }
      } catch (e) {
        this.$log.error(e)
      }
    },
    checkEmptyRow(student) {
      return (!student.tagName || student.tagName.trim() === '') &&
          student.studentNo.toString().trim() === '' &&
          student.studentName.trim() === ''
    },
    initStudents() {
      const confirmMessage = '학생 명단을 전체 초기화(삭제)하시겠습니까?'
      const option = {reverseButtons: true}
      this.$hiClass.confirm(confirmMessage, null, option)
          .then(() => { // 확인
            this.students = []
            this.addInput()
          })
          .catch(() => {}) // 취소
    },
    onfocusInput(idx, field) {
      // 이전에 focus된 row 유효성 체크
      if (this.focusedRowIdx !== idx) {
        this.validInput(this.focusedRowIdx)
      }

      this.focusedRowIdx = idx
      if (field === 'tagName') {
        this.toggleTag(idx)
      }
    },
    onInput(event, idx, field) {
      const maxLength = {
        tagName: 10,
        studentNo: 4,
        studentName: 20
      }
      if (field === 'studentNo') {
        event.target.value = event.target.value.replace(/^0*/g, '')
      }
      this.students[idx][field] = event.target.value.replaceAll(' ', '').substring(0, maxLength[field])
      event.target.value = this.students[idx][field]
      if (field === 'tagName') {
        this.students[idx].tagId = null
        this.focusedTagIdx = -1
      }
    },
    onBlurTagName(idx) {
      const filteredTags = this.clazzTags.filter(t => t.tagName === this.students[idx].tagName)
      if (this.students[idx].tagId === null && filteredTags.length === 1) {
        this.students[idx].tagId = filteredTags[0].tagId
      }
      this.activatedTagListRowIdx = -1
      this.focusedTagIdx = -1
      this.validInput(idx)
    },
    onKeydownTagName(event, idx) {
      if (['ArrowUp', 'ArrowDown'].includes(event.key) && this.filterTags(idx).length > 0) {
        if (this.focusedTagIdx >= 0) {
          this.$refs[`tag-${this.focusedTagIdx}`][0].style.backgroundColor = ''
        }

        this.focusedTagIdx = event.key === 'ArrowUp' ?
            Math.max(0, this.focusedTagIdx - 1) :
            Math.min(this.filterTags(idx).length - 1, this.focusedTagIdx + 1)

        this.$refs[`tag-${this.focusedTagIdx}`][0].style.backgroundColor = '#F1F5FD'
        this.$refs[`tag-${this.focusedTagIdx}`][0].scrollIntoView({behavior: 'smooth'})
      }
    },
    validInput(idx) {
      const regEx = {
        tagName: /^[0-9a-zA-Z가-힣\-_/&,.()]+$/,
        studentNo: /^[0-9]+$/,
        studentName: /^[0-9a-zA-Z가-힣]+$/
      }
      const emptyErrMsg = {
        tagName: '학반(태그)을 입력해주세요.',
        studentNo: '번호를 입력해주세요.',
        studentName: '학생명을 입력해주세요.'
      }
      const nonAllowedErrMsg = {
        tagName: '한글, 영문, 숫자,<br>특수문자 - _ / & , .() 만 가능합니다.',
        studentNo: '숫자만 입력 가능합니다.',
        studentName: '이름은 완성형 한글, 영문 대/소문자 <br>20자 이내로 입력해주세요.'
      }

      for (let field of ['tagName', 'studentNo', 'studentName']) {
        this.students[idx].errMsg[field] = ''
        if (this.checkEmptyRow(this.students[idx])) { return }

        if (this.students[idx][field].length === 0) {
          this.students[idx].errMsg[field] = emptyErrMsg[field]
        } else if (!regEx[field].test(this.students[idx][field])) {
          this.students[idx].errMsg[field] = nonAllowedErrMsg[field]
        }
      }

      this.validDuplicate()
    },
    validDuplicate() {
      const countMap = new Map()
      for (let s of this.students) {
        const key = `${s.tagName}-${s.studentNo}-${s.studentName}`
        countMap.set(key, (countMap.get(key) || 0) + 1)
      }

      for (let s of this.students) {
        if (this.checkEmptyRow(s)) {
          s.errMsg.duplicate = ''
          continue
        }
        const key = `${s.tagName}-${s.studentNo}-${s.studentName}`
        s.errMsg.duplicate = countMap.get(key) > 1 ? '중복된 학생입니다. 학반을 변경하거나 반번호를 변경해주세요.' : ''
      }
    },
    selectTag(tag, idx) {
      this.students[idx].tagId = tag.tagId
      this.students[idx].tagName = tag.tagName
      this.activatedTagListRowIdx = -1
    },
    filterTags(idx) {
      const tagInput = this.students[idx].tagName
      if (tagInput.trim().length === 0) return this.clazzTags
      return this.clazzTags.filter(t => t.tagName.includes(tagInput))
    },
    downloadSample() {
      const samplePath = `https://download.hiclass.net/static/document/hiclass_attendance_student_batch_sample.xlsx`
      this.$comn.download(samplePath, '출결알리기 명단 양식.xlsx')
    },
    uploadExcel(e) {
      if (!e || !e.target.files[0]) return

      let fileExt = e.target.files[0].name.split('.').pop()
      if (!['xls', 'xlsx'].includes(fileExt)) {
        this.$hiClass.alert('해당 파일 확장자는 업로드 불가능합니다.<br>지원하는 파일 형식: xls, xlsx', 'error')
        return
      }

      this.readExcel(e.target.files[0])
      this.$refs.attach.value = ''
    },
    readExcel(file) {
      let reader = new FileReader()
      let vueInstance = this

      reader.onload = function () {
        let data = reader.result
        let workBook = XLSX.read(data, { type: 'binary' })
        const sheet = workBook.Sheets[workBook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet)

        vueInstance.students = rows.map((item, idx) => {
          const obj = {
            tagId: null,
            tagName: '',
            studentNo: '',
            studentName: '',
            errMsg: {
              tag: '',
              studentNo: '',
              studentName: '',
              duplicate: ''
            }
          }

          for (const [key, value] of Object.entries(item)) {
            if (key === '학반(태그)*') {
              obj.tagName = value.toString().replaceAll(' ', '').substring(0, 10)
            } else if(key === '번호*') {
              obj.studentNo = value.toString().replace(/^0*/g, '').replaceAll(' ', '').substring(0, 4)
            } else if(key === '학생명*') {
              obj.studentName = value.toString().replaceAll(' ', '').substring(0, 20)
            }
          }

          return obj
        })

        vueInstance.students.forEach((target, idx) => {
          vueInstance.validInput(idx)
        })

        vueInstance.validDuplicate()
      }
      reader.readAsBinaryString(file)
    },
    // 태그 리스트 토글
    toggleTag(idx) {
      if (this.activatedTagListRowIdx === -1 || this.activatedTagListRowIdx !== idx) {
        this.activatedTagListRowIdx = idx;
      } else {
        this.activatedTagListRowIdx = -1;  // 이미 열린 상태라면 닫기
      }
    }
  },
  created() {
    this.$hiClass.toggleBodyClass('add', 'hidden')
  },
  async mounted() {
    !this.curClassItem.attendanceUsed ?
        await this.getClazzInviteStudents(0) :
        await this.addInput()
  },
  beforeDestroy() {
    this.$hiClass.toggleBodyClass('remove', 'hidden')
  }
}
</script>

<style lang="scss" scoped>
.hi-modal-common ::v-deep .modal__layer{ max-width: 550px;}
.student-register-modal-wrap {
  height: 617px;
  width: 100%;
  &::-webkit-scrollbar {
    background-color: transparent;
  }
  .desc strong{    
    font-weight: 500;
  }
}
// 테이블
.hp-list-wrap {
  margin:0;
  .table-wrap{
    height: 430px;
    table tbody tr.warning{
      position: relative;
      td{
        position: static;
        input{
          border: 1px solid #EC1F2D;
          background: rgba(236, 31, 45, 0.1);
        }
      }
      &:hover .tooltip {
        display: block;
      }
    }
  }
  .hi-nodata {
    padding: 167px 0;
  }
  .tag-wrap{
    position: relative;
    display: inline-block;
    width: 100%;
    .caret::before{
      content: "";
      position: absolute;
      top: calc(50% - 5px);
      right: 12px;
      display: inline-block;
      width: 7px;
      height: 7px;
      border-bottom: 1px solid #222;
      border-left: 1px solid #222;
      transform: rotate(-45deg);
      -webkit-transform: rotate(-45deg);
      // transition: 0.3s;
    }
    .caret.selected::before{
      top:calc(50% - 2px);
      transform: rotate(135deg);
      -webkit-transform: rotate(135deg);
    }
    .option-list {
      position: absolute;
      background: white;
      overflow-y: auto;
      z-index: 10;
      min-width: 106px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.122);
    }
  }
}
</style>