<template>
  <div class="student-wrap">
    <div class="filter" :class="{ 'j-between w100': !withPoint }">
      <HiSelectBox
          v-if="withPoint"
          :value="searchParams.sort"
          :items="sortItem"
          @update:value="setSortSelected($event)"
          :empty-title="sortSelected || '번호순'"
          class="sort-box-wrap"
      />
      <div class="btns">
        <button v-if="!withPoint && searchStudentId === ''" :class="['select-all-btn', { active: isAllSelected }]" @click="toggleAll">
          <i class="bh-icon-check-24-gray02"></i>
          {{ isAllSelected ? '전체 선택 해제' : '전체 선택' }}
        </button>
      </div>
      <div class="input-search-wrap">
        <div class="input-box-wrap round-search-box">
          <span v-if="searchStudentId" class="target-chip-wrap">
            <span class="chip-keyword">{{ getSearchedStudent }}</span>
            <span class="chip-close cursor-pointer" @click="searchStudentId = ''"></span>
          </span>
          <input type="text" :value="searchKeyword" placeholder="@학생명 검색" @input="onInput($event)" :disabled="searchStudentId !== ''"/>
          <HiButton v-if="searchKeyword" color="link" size="md" class="btn-delete" @click="searchKeyword = ''; isOpenSearchDropBox = false">
            <HiIcon name="ico-close3" size="14"  color="white" bgColor="gray" rounded="rounded"/>
          </HiButton>
          <HiButton color="link" size="md" class="btn-search">
            <HiIcon name="ico-search-thin" size="24" color="default"/>
          </HiButton>
        </div>
        <div v-if="isOpenSearchDropBox" class="search-drop-wrap custom-scr">
          <ul>
            <template v-if="filteredByKeywordStudents.length > 0">
              <li v-for="student of filteredByKeywordStudents" :key="`search-${student.studentId}`" @click="search(student.studentId)">
                <span class="num">{{ student.studentNo }}</span>
                <span class="name">{{ student.studentName }}</span>
              </li>
            </template>
            <template v-else>
              <li>일치하는 학생이 없습니다.</li>
            </template>
          </ul>
        </div>
      </div>
    </div>

    <div
        ref="studentListDiv"
        class="student-list custom-scr"
    >
      <div
          v-for="student in filteredByIdStudents"
          :key="student.studentId"
          class="student-item"
          :class="{ selected: student.checked }"
          @click="selectStudent(student)"
      >
        <HiAvatar
            v-if="withPoint && detailClass.studentViewType !== 'NONE'"
            :img="student.studentPhoto ? student.studentPhoto : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`" 
        />
        <span class="number">{{ student.studentNo }}</span>
        <span class="name" :title="student.studentName">{{ student.studentName }}</span>

        <template v-if="withPoint">
          <div class="points">
            <span class="good">{{ student.positivePoint }}</span>
            <span class="effort">{{ student.negativePoint }}</span>
            <span class="sum">{{ student.totalPoint }}</span>
          </div>
        </template>
      </div>
      <div v-if="filteredByIdStudents.length === 0" class="no-data">
        <i class="bh-icon-warning-circle-fill-52"></i>
        검색결과가 없습니다.
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {eventBus} from "@/main";
import { useStudentController } from '@/apps/behavior/modules/student';
const studentController = useStudentController();

export default {
  name: 'RewardStudentList',
  data() {
    return {
      searchParams: {},
      sortSelected: 'studentNo',
      sortItem: [
        { value: 'studentNo', title: '번호순' },
        { value: 'positive', title: '좋음 높은 순' },
        { value: 'negative', title: '노력 높은 순' },
        { value: 'total', title: '총점 높은 순' },
      ],
      searchKeyword: '',
      searchStudentId: '',
      isOpenSearchDropBox: false
    }
  },
  props: {
    withPoint: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom', 'detailClass']),
    students() {
      return this.withPoint ?
          studentController.model.studentsWithPoints.filter(s => !s.isHidden) :
          studentController.model.students
    },
    filteredByKeywordStudents() {
      if (!this.searchKeyword) return this.students
      return this.students.filter(s => s.studentName.toLowerCase().includes(this.searchKeyword.replaceAll('@', '').toLowerCase()))
    },
    filteredByIdStudents() {
      if (!this.searchStudentId) return this.students
      return this.students.filter(s => s.studentId.includes(this.searchStudentId))
    },
    isAllSelected: {
      get() {
        return this.students.every(s => s.checked)
      },
      set(value) {
        this.students.forEach(s => s.checked = value)
      }
    },
    getSearchedStudent() {
      const student = this.students.find(s => s.studentId === this.searchStudentId)
      return student ? `${student.studentNo}. ${student.studentName}` : ''
    }
  },
  methods: {
    initParams() {
      this.searchParams = {
        userId: this.$store.state.user.currentId,
      }
      if (this.withPoint) {
        this.searchParams.isAllStudents = true
        this.searchParams.sort = 'studentNo'
        this.searchParams.page = 0
        this.searchParams.size = 50
      } else {
        this.searchParams.isHidden = false
        this.searchParams.isAllStudents = true
      }
    },
    setSort(sort) {
      this.searchParams.sort = sort
    },
    async loadStudents() {
      this.withPoint ?
          await studentController.reloadStudentsWithPoints(this.searchParams) :
          await studentController.reloadStudents(this.searchParams)
    },
    onInput(e) {
      this.searchKeyword = e.target.value
      if (e.target.value.startsWith('@')) {
        this.isOpenSearchDropBox = true
      } else {
        this.searchKeyword = ''
        e.target.value = ''
        this.isOpenSearchDropBox = false
      }
    },
    search(studentId) {
      this.searchKeyword = ''
      this.searchStudentId = studentId
      this.isOpenSearchDropBox = false
    },
    scrollToTop() {
      this.$nextTick(() => {
        this.$refs.studentListDiv.scrollTop = 0
      })
    },
    toggleAll() {
      this.isAllSelected = !this.isAllSelected
    },
    async setSortSelected(sort) {
      this.scrollToTop()
      this.initParams()
      this.searchParams.sort = sort
      await this.loadStudents()
    },
    selectStudent(student) {
      student.checked = !student.checked
      this.searchStudentId = ''
    }
  },
  async mounted() {
    eventBus.$on('classroom-point-reward-search-students', async () => {
      this.initParams()
      await this.loadStudents()
    })
    eventBus.$emit('classroom-point-reward-search-students')
  },
  beforeDestroy() {
    eventBus.$off('classroom-point-reward-search-students')
    if (this.withPoint) studentController.resetStudentsWithPoints()
  },
  watch: {
    async curClassroom() {
      this.initParams()
      await this.loadStudents()
      this.scrollToTop()
    }
  }
}
</script>

<style scoped lang="scss">
.student-wrap{
  width: 50%;
  position: relative;
  
  .filter{
    left:auto;
    right:0;
    .input-search-wrap{position: relative;}
    .target-chip-wrap{max-width:165px;}
    
  }

  .student-list {
    display: flex;
    gap:15px;
    flex-wrap: wrap;
    height: calc(100dvh - 403px);
    overflow: scroll;
    padding: 0 25px;
    align-content: flex-start;
    .no-data{
      font-size: 16px;
      font-weight: 400;
      color: #9e9e9e;
      margin-top: 12px;
      display: flex;
      flex-flow: column;
      gap: 20px;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  }
  .student-item {
    width: calc(20% - 12px);
    padding: 15px;
    height: 74px;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    position:relative;
    @media screen and (max-width: 1660px) {
      width: calc(25% - 12px);
    }
    @media screen and (max-width: 1425px) {
      width: calc(33.3% - 12px);
    }
    @media screen and (max-width: 1280px) {
      width: calc(50% - 12px);
    }
    &:hover{
      border-color: #3AAFFF;
    }
    &.selected {
      background-color: #D8EFFF;
      border-color: #3AAFFF;
    }
    .avatar-img{
      margin-right: 5px;
    }
    .avatar-img ::v-deep .img-area {
      background-color:#f5f6f7;
    }
    .number {
      display: inline-block;
      margin-right: 5px;
      width:28px;
      min-width: 28px;
      height: 18px;
      border-radius: 20px;
      border:1px solid #9e9e9e;
      color:#616161;
      font-size:12px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    .name {
      font-size: 15px;
      color: #222;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-wrap: break-word;
      flex-grow: 1;
    }
    .check input[type='checkbox'] + label::before{
      content: '';
      display: inline-block;
      width: 30px;
      height: 30px;
      vertical-align: middle;
      background: url(/img/ic_check_circle_blue_42.f8dd071d.svg) 0 / 42px no-repeat;
      background-size: 100%;
  
    }
  }
  &.on{
    min-width: 520px;
    .student-item{
      width:100%;
      .points{
        min-width:210px;
        > span{
          display: inline-block;
          width: 70px;
          text-align: center;
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-body);
        }
        .good{color:#3987F8;}
        .effort{color:#F95F6E;}
        .sum{color:#222;}
      }
    }
  }
}
.target-chip-wrap {
  max-width: none;
  height: 28px;
  left: 4px;
  top: 3px;
}

.search-drop-wrap {
  width: 214px;
  max-height: 318px;
  border-radius: 10px;
  position: absolute;
  border: 1px solid #D6D6D6;
  -webkit-box-shadow: 0px 5px 10px 0px #0000001F;
  box-shadow: 0px 5px 10px 0px #0000001F;
  background-color: #fff;
  top: 40px;
  right: -6px;
  padding: 9px 0px 9px 0px;
  overflow-y: auto;
  z-index: 1;
}
.search-drop-wrap ul {
    width: 100%;
}
.search-drop-wrap ul li{
    width: 100%;
    height: 50px;
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;
    display: flex;
    align-items: center;
    padding: 16px 0px 16px 15px;
}
.search-drop-wrap ul li:hover {
    background: #F6F6F6;
}
.search-drop-wrap ul li span.num {
    display: inline-block;
    width: auto;
    min-width: 28px;
    max-width: 58px;
    height: 18px;
    border-radius: 20px;
    border: 1px solid #9E9E9E;
    font-size: 12px;
    font-weight: 500;
    color: #616161;
    text-align: center;
    line-height: 16px;
    margin-right: 6px;
    padding-left: 2px;
    padding-right: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.search-drop-wrap ul li .name {
    flex-grow: 1;
    width: calc(100% - 62px);
    color: #222222;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>