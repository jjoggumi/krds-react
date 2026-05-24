<!--
@File(Method): MainBodyClazzesBodyAttendanceStudentListEditItem.vue
@Author: -
@Date Created: -
@Description: 출결알리기 > 학생명단 > 학생 추가/수정 > 학생 명단 리스트 아이템(수정 모드)
@Modified: 2025-02-14 - #71970 출결알리기 > 학반(태그) 추가 : 학생명단 수정
-->
<template>
  <tr>
    <td>
      <!-- #71970 출결알리기 > 학반(태그) 추가 - 학반(태그 영역 추가) -->      
      <div class="tag-wrap" :class="{'warning': student.isDuplicate || student.isErrorTag}">
        <span
            v-if="student.isDuplicate || student.isErrorTag"
            class="err"
            v-html="student.isErrorTag ? errMsg.tag : '중복된 학생이 있습니다. 학반을 변경하거나 반번호를 변경해주세요.'"
        >
        </span>
        <input
            ref="inputTag"
            type="text"
            :value="student.tagName"
            @click="showTagList = !showTagList"
            @focusout="inputFocusOut(student.tagName)"
            @input="validateTagName($event.target.value)"
            @blur="selectTag({ tagId: null, tagName: student.tagName })"
            @keyup.enter="$refs.inputTag.blur()"
            :disabled="student.isUsed === false"
            :class="{'warning': student.isDuplicate || student.isErrorTag}"
        />
<!--        <span class="caret" :class="{'selected' : showTagList && filterTags().length > 0}"></span>-->
        <div v-show="showTagList && filterTags().length > 0" class="option-list">
          <ul class="custom-scr">
            <li
              v-for="tag in filterTags()"
              :key="tag.tagName"
              @mousedown="selectTag(tag)"
            >
              {{ tag.tagName }}
            </li>
          </ul>
        </div>
      </div>
    </td>
    <td> <!-- 반 번호 -->
      <span :class="{'warning': student.isDuplicate || student.isErrorStudentNo}">
        <span v-if="student.isDuplicate || student.isErrorStudentNo" class="err">
          {{ student.isErrorStudentNo ? errMsg.studentNo : '중복된 학생이 있습니다. 학반을 변경하거나 반번호를 변경해주세요.' }}
        </span>
        <input
            :ref="`${arrIndex}-no`"
            type="text"
            class="wx71"
            id="inputNo"
            :class="{'warning': student.isDuplicate || student.isErrorStudentNo }"
            :value="student.studentNo"
            @input="validateStudentNo($event.target.value)"
            @focusout="inputFocusOut(student.studentNo)"
            :disabled="student.isUsed === false"
            maxlength="4"
        />
      </span>
    </td>
    <td> <!-- 학생명 -->
      <span :class="{'warning': student.isDuplicate || student.isErrorStudentName}">
        <span v-if="student.isDuplicate || student.isErrorStudentName"  class="err">
          {{ student.isErrorStudentName ? errMsg.studentName : '중복된 학생이 있습니다. 학반을 변경하거나 반번호를 변경해주세요.' }}
        </span>
        <input
            :ref="`${arrIndex}-name`"
            type="text"
            class="wx351 al"
            id="inputName"
            :class="{'warning': student.isDuplicate || student.isErrorStudentName}"
            v-model="student.studentName"
            @input="validateStudentName($event.target.value)"
            @focusout="inputFocusOut(student.studentName)"
            :disabled="student.isUsed === false"
            maxlength="20"
        />
      </span>
    </td>
    <td> <!-- 사용여부 -->
      <span
          class="use-p"
          :class="{'del': !student.isUsed}"
          @click="setModal({student: student, isOpen: true})"
      >
          {{ isUsedText(student.isUsed) }}
      </span>
    </td>

    <confirm-modal
        v-if="confirmModal.isShow"
        :confirmModal="confirmModal"
        @setModal="setModal"
        @setIsUsed="setIsUsed"
        @deleteStudent="deleteStudent"
    />
  </tr>
</template>

<script>
import ConfirmModal from "@/apps/main/clazzes/attendance/modal/AttendanceStudentListConfirmModal";
import {mapState} from "vuex";
import {eventBus} from "@/main";

export default {
  name: "main-body-clazzes-body-attendance-student-list-edit-item",
  components: {
    ConfirmModal
  },
  data() {
    return {
      confirmModal: {
        student: {},
        isShow: false,
        status: ''
      },
      showTagList: false,
      errMsg: {
        tag: '',
        studentNo: '',
        studentName: ''
      }
    }
  },
  props: {
    student: {
      type: Object
    },
    filteredStudents: {
      type: Array
    },
    cloneStudents: {
      type: Array
    },
    arrIndex: {
      type: Number
    }
  },
  computed: {
    ...mapState('storeClazzTag', [
      'clazzTags'
    ]),
    formattedTags() {
    return this.filterTags().map(tag => ({
      value: tag.tagName, // HiSelectBox에서 선택할 값
      title: tag.tagName  // 목록에 표시할 값
    }));
  }
  },
  methods: {
    checkEmptyRow() {
      return (!this.student.tagName || this.student.tagName.trim() === '') &&
          this.student.studentNo.toString().trim() === '' &&
          this.student.studentName.trim() === ''
    },
    validateTagName(tagName) {
      this.student.tagName = tagName ? tagName.substring(0, 10) : null
      this.$refs.inputTag.value = this.student.tagName

      this.errMsg.tag = ''
      if (this.checkEmptyRow() || this.student.isUsed === false) {
        this.student.isErrorTag = false
        return
      }

      if (!this.student.tagName || this.student.tagName.trim().length === 0) {
        this.errMsg.tag = '학반(태그)을 입력해주세요.'
      } else if (!/^[0-9a-zA-Z가-힣\-_/&,.()]+$/.test(this.student.tagName)) {
        this.errMsg.tag = '한글, 영문, 숫자,<br>특수문자 - _ / & , .() 만 가능합니다.'
      }
      this.student.isErrorTag = this.errMsg.tag.length > 0
      this.$emit('checkDuplicate')
    },
    validateStudentNo(studentNo) {
      if (typeof studentNo !== 'string') {
        studentNo = studentNo == null ? '' : String(studentNo)
      }

      let regex = /[^0-9]/gi
      if (regex.test(studentNo)) {
        studentNo = studentNo.replace(regex, "")
      }
      this.student.studentNo = studentNo.replace(/^0*/g, '')
      this.errMsg.studentNo = ''
      if (this.checkEmptyRow()) {
        this.student.isErrorStudentNo = false
        return
      }

      if (this.student.studentNo.length === 0) {
        this.errMsg.studentNo = '번호를 입력해주세요.'
      }
      this.student.isErrorStudentNo = this.errMsg.studentNo.length > 0
      this.$emit('checkDuplicate')
    },
    validateStudentName(studentName) {
      this.student.studentName = studentName
      this.errMsg.studentName = ''
      if (this.checkEmptyRow()) {
        this.student.isErrorStudentName = false
        return
      }

      if (this.student.studentName.length === 0) {
        this.errMsg.studentName = '학생명을 입력해주세요.'
      } else if (!/^[0-9a-zA-Z가-힣]+$/.test(this.student.studentName)) {
        this.errMsg.studentName = '이름은 완성형 한글, 영문 대/소문자 20자 이내로 입력해주세요.'
      }
      this.student.isErrorStudentName = this.errMsg.studentName.length > 0
      this.$emit('checkDuplicate')
    },
    inputFocusOut(inputVal) {
      this.validateTagName(this.student.tagName)
      this.validateStudentNo(this.student.studentNo)
      this.validateStudentName(this.student.studentName)

      if (inputVal && inputVal.toString().trim().length > 0 && this.arrIndex === this.filteredStudents.length - 1) {
        this.filteredStudents.push({
          studentId: null,
          tagId: null,
          tagName: '',
          studentName: '',
          studentNo: '',
          isUsed: null,
          isDuplicate: false,
          isErrorStudentName: false,
          isErrorStudentNo: false,
          isErrorTag: false
        })
      }
    },

    /**
     * 사용여부 텍스트
     * @param isUsed
     * @returns {string|string}
     */
    isUsedText(isUsed) {
      if (isUsed === null) return ''
      return isUsed ? '미 사용' : '삭제'
    },

    /**
     * 미사용, 삭제 변경시 모달 열기
     * @param obj
     */
    setModal(obj) {
      this.confirmModal.student = obj.student
      this.confirmModal.isShow = obj.isOpen
    },

    /**
     * 사용여부 변경
     * @param obj
     */
    setIsUsed({studentId, isUsed}) {
      const notUsedTimestamp = this.$moment().valueOf()

      let student = this.filteredStudents.find(student => student.studentId === studentId)
      student.isUsed = isUsed
      student.notUsedTimestamp = notUsedTimestamp

      let cloneStudent = this.cloneStudents.find(student => student.studentId === studentId)
      cloneStudent.isUsed = isUsed
      cloneStudent.notUsedTimestamp = notUsedTimestamp

      student.tagName = cloneStudent.tagName

      this.filteredStudents.sort((a,b) => b.isUsed - a.isUsed)
      this.cloneStudents.sort((a,b) => b.isUsed - a.isUsed)

      this.student.isErrorTag = false
    },

    /**
     * 학생 삭제
     * @param studentId
     */
    deleteStudent(studentId) {
      let studentIdx = this.filteredStudents.findIndex(student => student.studentId === studentId)
      let cloneStudentIdx = this.cloneStudents.findIndex(student => student.studentId === studentId)

      this.filteredStudents.splice(studentIdx, 1)
      this.cloneStudents.splice(cloneStudentIdx, 1)
    },
    selectTag({tagId, tagName}) {
      if (!tagId) {
        const tag = this.clazzTags.find(t => t.tagName === tagName)
        tagId = tag ? tag.tagId : null
      }
      this.student.tagId = tagId
      this.student.tagName = tagName
      this.showTagList = false
      this.validateTagName(this.student.tagName)
    },
    filterTags() {
      if (!this.student.tagName || this.student.tagName.length === 0) return this.clazzTags
      return this.clazzTags.filter(t => t.tagName.includes(this.student.tagName))
    }
  },
  mounted() {
    if (this.student.studentId) {
      this.validateTagName(this.student.tagName)
    }

    eventBus.$on('valid-attendance-student-list', () => {
      this.validateTagName(this.student.tagName)
      this.validateStudentNo(this.student.studentNo)
      this.validateStudentName(this.student.studentName)
    })
  },
  beforeDestroy() {
    eventBus.$off('valid-attendance-student-list')
  }
}
</script>

<style lang="scss" scoped>
.tag-wrap{
  position: relative;
  display: inline-block;
  //width: 100%;
  width: auto;
  input{ padding-right:30px;}
  .caret::before{
    content: "";
    position: absolute;
    top: calc(50% - 3.5px);
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
    top:calc(50% - 3.5px);
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
input.warning {
  border-color: var(--warning) !important;
  background-color: #fcdbdd !important;
}
</style>