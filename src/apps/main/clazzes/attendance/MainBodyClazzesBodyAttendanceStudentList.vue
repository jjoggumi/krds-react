<!--
@File(Method): MainBodyClazzesBodyAttendanceStudentList.vue
@Author: -
@Date Created: -
@Description: 출결알리기 > 학생명단
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한) - ui 수정-->
<template>
  <div> <!-- 탭 변경영역 -->

    <div class="attendance-search-group-n2 hi-row sm-gutters">
      <div class="input-check-wrap col-sm-6" v-if="mode === 'view'">
        <p>
          <input
              type="checkbox"
              name="search-filter"
              id="unusedStudent"
              v-model="isShowUnusedStudent"
          >
          <label for="unusedStudent"><span>미 사용 학생 포함</span></label>
        </p>
      </div>
      <div class="col-sm-6" v-else>
        <HiButton color="jungle" outline size="md" @click="setIsShowAttendanceStudentRegisterModal(true)" class="pr-30 pl-30">
          학생명단 일괄 등록
        </HiButton>
      </div>
      <div class="col-sm-6 txt-right" v-if="mode === 'view'">
      <!-- 조회 모드 -->
        <HiButton  color="primary" outline size="md" @click="setMode('edit', false)" class="pr-30 pl-30">
          학생 추가/수정
        </HiButton>
      </div>
      <!-- 편집 모드 -->

      <div class="btns col-sm-6  txt-right" v-else>
        <p>
          <HiButton color="default" outline size="md" @click="setMode('view', false)" class="pr-30 pl-30">
            취소
          </HiButton>
        </p>
        <p>
          <HiTooltip
            class="hi-tooltip-wrap info bottom txt-left"
            color="noti"
           
            isActive position="top" ico="none"
            :title-html="`※ 학반(태그), 반 번호, 학생명을<br>&nbsp; &nbsp; &nbsp;모두 입력하셔야 저장이 가능합니다.`"
          />  
          <HiButton color="primary" outline size="md"
            class="pr-30 pl-30"
            :disabled="isDisabled"
            @click="patchStudent"
          >
            저장
          </HiButton>
        </p>
      </div>      
    </div>   
    <div v-if="mode === 'edit'" class="ft-blue-warning warning">
      반 번호 또는 학생명을 수정하면 기존 제출 내역 및 통계의 학생 정보도 함께 변경되어 데이터가 맞지 않을 수 있습니다.<br>
      이미 제출된 내역이 있는 경우 학생 명단 수정을 권장하지 않습니다.
    </div>
    <div class="attendance-tbl-contatiner">
      <table class="tbl-col n2">
        <colgroup>
          <col width="220" />
          <col width="130" />
          <col width="400" />
          <col width="150" />
        </colgroup>
        <thead>
        <tr>
          <th>학반(태그) <span class="txt-warning">*</span></th>
          <th>반 번호 <span class="txt-warning">*</span></th>
          <th>학생명 <span class="txt-warning">*</span></th>
          <th>사용여부</th>
        </tr>
        </thead>
          <!-- 조회 모드 -->
        <student-list-view v-if="mode === 'view'" :filteredStudents="filteredStudents"/>
          <!-- 편집 모드 -->
        <student-list-edit v-if="mode === 'edit'" :filteredStudents="filteredStudents" :cloneStudents="cloneStudents"/>

      </table>
      <div class="hi-nodata" v-if="isNoData && mode === 'view'">
        <p>내역이 없습니다.</p>
      </div>
    </div>

    <div class="attendance-student-info-contatiner" v-show="showInfo">
      <ul class="text-list">
        <li class="txt-warning">출결을 받고자 하는 모든 학생의 정보를 입력해주세요. 학생 명단에 등록된 학생만 학부모님이 출결알리기를 작성하실 수 있습니다.</li>
        <li>학생을 ‘미 사용’ 상태로 변경하시면, 신규 출결알리기 제출이 불가하며, ‘사용’ 상태로 변경이 불가합니다.</li>
        <li>학생을 ‘미 사용’ 상태로 변경하더라도, 기존 제출 내역 확인 및 수정이 가능합니다.</li>
        <li class="txt-warning">학생을 ‘삭제’ 하시면 모든 제출내역이 삭제되며, 복원이 불가합니다.</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";
import qs from "qs";
import StudentListEdit from "@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendanceStudentListEdit";
import StudentListView from "@/apps/main/clazzes/attendance/MainBodyClazzesBodyAttendanceStudentListview";
import {eventBus} from "@/main";

export default {
  name: "main-body-clazzes-body-attendance-student-list",
  components: {StudentListView, StudentListEdit},
  data() {
    return {
      searchParams: {
        page: 0,
        size: 100
      },
      totalPages: 0,
      mode: 'view',
      isShowUnusedStudent: true,
      students: [],
      cloneStudents: [], // 편집모드 취소시 되돌리기위함
      confirmModal: {
        student: {},
        isShow: false,
        status: ''
      },
      isNoData: false,
      showInfo: false,
      isSubmitClick: false
    }
  },
  computed: {
    ...mapGetters({
      curClassId: 'curClassId'
    }),
    filteredStudents() {
      if (this.isShowUnusedStudent) { // 미사용 학생 포함
        return this.students
      } else { // 미사용 학생 미포함
        return this.students.filter(student => student.isUsed || student.isUsed === null)
      }
    },
    isDisabled() {
      return this.students.some(student => student.isDuplicate || student.isErrorStudentName || student.isErrorStudentNo || student.isErrorTag) ||
          this.isSubmitClick
    }
  },
  methods: {
    ...mapMutations('storeClazzes', ['setIsShowAttendanceStudentRegisterModal']),
    /**
     * 모드 변경
     * @param mode
     * @param isSave
     */
    setMode(mode, isSave) {
      if (mode === 'view') {
        if (!isSave) {
          this.students = _.cloneDeep(this.cloneStudents)
          this.isNoData = !this.students.length > 0
        }
        this.students = this.students.filter(student => student.isUsed !== null)
      }

      if (mode === 'edit') {
        this.isShowUnusedStudent = true
        this.cloneStudents = _.cloneDeep(this.students)
        this.students.push({
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

      this.mode = mode
    },

    /**
     * size 나눠서 명단 한번에 조회
     * @returns {Promise<void>}
     */
    async getStudentsAll() {
      this.students = []
      this.searchParams.page = 0

      await this.getStudents()
      for (let page = this.searchParams.page; page < this.totalPages; page++) {
        await this.getStudents()
      }
    },

    /**
     * 학생명단 조회
     * @returns {Promise<void>}
     */
    async getStudents() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/clazzStudents/clazz/${this.curClassId}`,
          params: this.searchParams,
          paramsSerializer: (params) => {
            return qs.stringify(params, {arrayFormat: 'repeat'});
          }
        })

        if (res.data._embedded) {
          this.students.push(...res.data._embedded.clazzStudents.map(student => {
            return {...student, isDuplicate: false, isErrorStudentName: false, isErrorStudentNo: false, isErrorTag: !student.tagId}
          }))
        } else {
          this.isNoData = true
        }

        if (this.searchParams.page === 0) {
          this.totalPages = res.data.page.totalPages
        }

        this.searchParams.page = ++this.searchParams.page

      } catch (e) {
        this.$log.error(e)
      }
    },

    /**
     * 학생 등록, 수정 (studentId 가 있으면 수정, 아니면 등록)
     * @returns {Promise<void>}
     */
    async patchStudent() {
      const isValid = this.validUsedStudents()
      if (!isValid) {
        this.$hiClass.alert('입력되지 않은 정보가 있습니다.<br>다시 확인해 주세요.')
        eventBus.$emit('valid-attendance-student-list')
        return
      }
      if (this.isSubmitClick) return
      this.isSubmitClick = true

      try {
        const saveStudents = this.students
            .filter(s =>
                s.isUsed !== false &&
                s.tagName && s.tagName.trim() !== '' &&
                s.studentName.trim() !== '' &&
                s.studentNo.toString().trim() !== ''
            )
            .map(s => {
              return {
                tagId: s.tagId,
                tagName: s.tagName,
                studentName: s.studentName.replace(/^\s+|\s+$/g, ""),
                studentNo: s.studentNo,
                studentId: s.studentId ? s.studentId : null
              }
            })

        if (saveStudents.length > 0) {
          await this.$axios.patch(`/clazzStudents/clazz/${this.curClassId}`, saveStudents)
          if (this.isNoData) { this.isNoData = false }
        }

        this.setMode('view', true)
        await this.getStudentsAll()

      } catch (e) {
        this.$log.error(e)
      } finally {
        this.isSubmitClick = false
      }
    },
    validUsedStudents() {
      const isEmptyTag = (s) => s.tagId === null && (s.tagName || '').trim() === ''
      const isEmptyStudentName = (s) => (s.studentName || '').trim() === ''
      const isEmptyStudentNo = (s) => (s.studentNo || '').toString().trim() === ''

      return this.students
          .filter(s => s.isUsed !== false && (!isEmptyTag(s) || !isEmptyStudentName(s) || !isEmptyStudentNo(s)))
          .every(s => !isEmptyTag(s) && !isEmptyStudentName(s) && !isEmptyStudentNo(s))
    }
  },
  async created() {
    try {
      await this.getStudentsAll()
    } catch (e) {
      this.$log.error(e)
    }
    finally {
      this.showInfo = true
    }
  }
}
</script>

<style scoped lang="scss">
.attendance-search-group-n2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;   
  // position: sticky;
  // top: 142px;
  // z-index: 2;
  // background: #fff;
  // padding-bottom: 10px;
  // margin: 0;
  // border-bottom: 2px solid #4267b2;
  .btns {
    display: flex;
    gap: 8px;
    flex-basis: content;
  }
  // & + .attendance-tbl-contatiner > table{
  //   border-top: 0;
  //   > thead{
  //     position: sticky;
  //     top: 194px;
  //     z-index: 1;
  //   }
  // }
}

.txt-warning::before{
  background-color:var(--warning) !important;
}
.hi-tooltip-wrap{
  margin-top: -38px;
  ::v-deep{
    .hi-tooltip{
      animation: tooltipAniY 2s infinite ease-out;
      span{font-size: 13px;}
      &::before{
        right: 65px;
        left: auto;
      }
    }
  }
}
.attendance-student-info-contatiner {
  margin-top: 25px;
  .text-list {
    background-color: #F6F6F6;
    padding: 20px;
    border-radius: 4px;
    li {
      position: relative;
      line-height:1.4;
      color:#616161;
      padding-left: 9px;
      &:not(:first-child) {
        margin: 8px 0 0 0;
      }
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 6px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #888;
      }
    }
  }
}
</style>
