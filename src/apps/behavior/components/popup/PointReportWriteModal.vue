<!--
@File(Method): PointReportWriteModal.vue
@Date Created: 2025-12-09
@Description: 학급기록 > 학생 리포트 > 리포트 내역 > 리포트 생성 모달
-->
<template>
  <div>
    <HiModal type="type01" size="lg" @close="close" class="point-report-write-modal">
      <template v-slot:heading>포인트 리포트 생성 </template>
      <template v-slot:content>
        <div>
          <div class="content-wrap" ref="contentWrap">
            <div class="form-group">
              <p class="label">제목</p>
              <input v-model="title" type="text" placeholder="제목을 입력하세요." maxlength="100" />
              <!-- input 에 class="error" 추가 시 에러 메시지 노출
              <span class="err-message">에러 메시지 노출 영역</span> -->
            </div>
            <div class="form-group mt-30">
              <p class="label">기간 선택</p>
              <div class="date-select-wrap mt-05">
                <div class="date-type month">
                  <p class="check">
                    <input type="radio" name="date-type" v-model="dateType" value="month" id="date-type-month" />
                    <label for="date-type-month"><span>월간</span></label>
                  </p>
                  <report-calendar-month v-if="dateType === 'month'" :selectedDate="searchRequest.month" @change="changeMonth" />
                </div>
                <div class="date-type period">
                  <p class="check">
                    <input type="radio" name="date-type" v-model="dateType" value="period" id="date-type-period" />
                    <label for="date-type-period"><span>직접 선택</span></label>
                  </p>
                  <div v-if="dateType === 'period'">
                    <report-calendar :isAfter="false" :choice="calendarChoice" @change="changeDateStart" />
                    <report-calendar :isAfter="true" :choice="calendarChoice" @change="changeDate" />
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group mt-30">
              <p class="label">학생 선택</p>
              <div class="student-select-wrap">
                <input type="text" v-model="searchStudentText" placeholder="학생입력" @click="openUserList" @keydown="inputSearchUser($event)" />
                <div
                  v-if="students.length > 0"
                  class="users cursor-pointer"
                  :class="{
                    search: isUserList === true,
                  }"
                >
                  <p class="user" v-for="student of students" :key="`user-item-${student.studentId}`">
                    {{ student.studentNo }}. {{ student.studentName }}
                    <button @click="deleteStudent(student)">
                      <i class="bh-icon-close-8"></i>
                    </button>
                  </p>
                </div>
                <div class="user-list" v-if="isUserList === true" v-click-outside="closeUserList">
                  <template v-if="searchStudents.length > 0">
                    <ul>
                      <li class="all-select" @click="toggleAllSelect">
                        <input type="checkbox" id="chk-all" :checked="isAllSelected" @change.stop="toggleAllSelect" />
                        <label for="chk-all">
                          <span class="name">전체 선택</span>
                        </label>
                      </li>
                      <li
                        v-for="item in searchStudents"
                        :key="`search-student-list-${item.studentId}`"
                        :class="{ selected: item.selected === true }"
                        @click="toggleUser(item)"
                      >
                        <input
                          type="checkbox"
                          :checked="item.selected"
                          :id="`search-student-list-${item.studentId}`"
                          @change.stop="toggleUser(item)"
                        />
                        <label :for="`search-student-list-${item.studentId}`">
                          <span class="num">{{ item.studentNo }}</span>
                          <span class="name" :class="{ hidden: item.isHidden === true }">
                            {{ item.studentName }}
                            <template v-if="item.isHidden === true"> (숨김) </template>
                          </span>
                        </label>
                      </li>
                    </ul>
                    <div class="btns">
                      <HiButton color="line-default" size="sm" @click="closeUserList">취소</HiButton>
                      <HiButton color="orange" size="sm" @click="confirmUserList"> 확인 </HiButton>
                    </div>
                  </template>
                  <template v-else>
                    <p class="nodata">일치하는 학생이 없습니다.</p>
                  </template>
                </div>
              </div>
            </div>
            <div class="info-noti-box">
              <i class="hi-ico ico-warning-circle ico-noti ico-size-20 p-00"></i>
              <p>
                리포트는 생성 시점의 포인트 내역을 기준으로 작성됩니다. <br />
                생성 이후 포인트가 수정되거나 삭제되어도 기존 리포트에는 반영되지 않습니다.<br />
                또한 선택한 기간에 포인트 기록이 없는 학생은 리포트 생성 대상에서 제외됩니다.
              </p>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="line-default" size="lg" @click="close">취소</HiButton>
        <HiButton color="orange" size="lg" @click="onClickSubmit" :disabled="!title || !dateType || students.length === 0"> 생성 </HiButton>
      </template>
    </HiModal>
    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :isAlert="confirmModal.isAlert"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { debounce } from 'lodash';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import ReportCalendar from '@/apps/behavior/components/common/ReportCalendar.vue';
import ReportCalendarMonth from '@/apps/behavior/components/common/ReportCalendarMonth.vue';
import { postClassroomReportStudents } from '@hiclass/core';

export default {
  name: 'point-report-write-modal',
  components: {
    ReportCalendarMonth,
    ReportCalendar,
    ConfirmModal,
  },
  props: {
    item: Object,
    classroomId: String,
    studentList: Array,
  },
  data() {
    return {
      title: '',
      students: [],
      isUserList: false,
      searchStudents: [],
      searchStudentsCopy: [],
      selectStudent: {},
      searchStudentText: '',
      dateType: 'month',
      searchRequest: {
        month: this.$moment().format('YYYY-MM'),
      },
      calendarChoice: {
        dateStart: this.$moment().startOf('month').format('YYYY-MM-DD'),
        dateEnd: this.$moment().endOf('month').format('YYYY-MM-DD'),
        date: this.$moment().format('YYYY-MM-DD'),
      },
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '#FF8737',
        params: null,
        isAlert: true,
        action: '',
      },
    };
  },
  computed: {
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
      classroomStudents: 'students',
    }),
    isAllSelected() {
      return this.searchStudents.length > 0 && this.searchStudents.every((s) => s.selected === true);
    },
  },
  watch: {},
  methods: {
    closeConfirmModal: async function (isConfirm) {
      this.confirmModal = {
        ...this.confirmModal,
        isOpen: false,
      };
    },
    // 모달 닫기
    close: function () {
      this.$emit('close');
    },
    createComplete: function (reload) {
      this.$emit('createComplete', reload);
    },
    startCreateReport: function () {
      this.$emit('startCreateReport');
    },
    // 월간
    changeMonth(newMonth) {
      this.searchRequest.month = newMonth;
    },
    // 직접선택
    changeDate(isAfter, date) {
      this.calendarChoice.dateEnd = date;
    },
    changeDateStart(isAfter, date) {
      this.calendarChoice.dateStart = date;
    },

    getUsers: async function () {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/classroom/${this.curClassroom.classroomId}/students`,
          params: {
            userId: this.userId(),
            isHidden: null,
          },
        });

        if (res.data._embedded) {
          this.searchStudents = res.data._embedded.classroomStudents;
          this.searchStudents = this.searchStudents.map((item) => {
            return {
              ...item,
              selected: this.students.findIndex((v) => v.studentId === item.studentId) > -1 ? true : false,
            };
          });

          this.searchStudentsCopy = JSON.parse(JSON.stringify(this.searchStudents));
        }
      } catch (err) {
        this.$log.debug('classroom students GET() error => ', err);
      }
    },

    inputSearchUser: debounce(function (e) {
      this.searchStudentText = e.target.value;
      this.getSearchUser();
    }, 200),

    getSearchUser: function () {
      if (this.searchStudentText.trim() !== '') {
        this.searchStudents = this.searchStudentsCopy.filter((item) => {
          return item.studentName.search(this.searchStudentText) > -1;
        });
      } else {
        this.getUsers();
      }
    },

    openUserList: function () {
      this.isUserList = true;
      if (this.searchStudentText.trim() === '') {
        this.getUsers();
      } else {
        this.getSearchUser();
      }
    },

    closeUserList: function () {
      if (this.selectStudent.selected !== true) {
        this.isUserList = false;
      } else {
        this.selectStudent = {};
      }
    },

    // 전체 선택/해제
    toggleAllSelect() {
      console.log('toggleAllSelect called');
      const newVal = !this.isAllSelected;
      console.log('toggleAllSelect called', newVal);

      // searchStudents의 모든 item.selected 변경
      this.searchStudents.forEach((s) => {
        s.selected = newVal;
      });
    },

    // 개별 학생 선택/해제
    toggleUser(item) {
      item.selected = !item.selected;
    },

    // 확인 버튼으로 선택 반영
    confirmUserList() {
      const selected = this.searchStudents.filter((s) => s.selected === true);
      this.students = selected.map((s) => ({
        isHidden: s.isHidden,
        selected: true,
        studentCharacter: s.studentCharacter,
        studentId: s.studentId,
        studentName: s.studentName,
        studentNo: s.studentNo,
      }));
      this.isUserList = false;
    },

    // 학생 삭제
    deleteStudent: function (student) {
      this.students = JSON.parse(JSON.stringify(this.students)).filter((v) => v.studentId !== student.studentId);
    },
    userId() {
      return localStorage.uuid;
    },

    async onClickSubmit() {
      const params = {};
      this.startCreateReport();
      if (this.dateType == 'month') {
        params.month = this.searchRequest.month;
      } else {
        params.dateStart = this.calendarChoice.dateStart;
        params.dateEnd = this.calendarChoice.dateEnd;
      }
      params.reportName = this.title;
      params.userId = localStorage.uuid;
      params.studentIds = this.students.map((d) => d.studentId);
      try {
        await postClassroomReportStudents(this.classroomId, params);
        this.close();
        this.createComplete(true);
      } catch (error) {
        const status = error?.response.status;
        const errorCode = error?.response?.data?.error;
        this.createComplete(false);
        if ((status == 428) & (errorCode === 'emptyPoint')) {
          this.confirmModal.title = '기간을 다시 확인해주세요.';
          this.confirmModal.description = '선택하신 기간 내 포인트 지급 이력이<br>존재하지 않습니다.';
          this.confirmModal.isOpen = true;
        } else {
          this.confirmModal.title = '요청 처리 중 오류가 발생했습니다.';
          this.confirmModal.description = '';
          this.confirmModal.isOpen = true;
        }
      }
    },
  },
  mounted() {
    // this.students = JSON.parse(JSON.stringify(this.studentList));
  },
};
</script>

<style scoped lang="scss">
.point-report-write-modal {
  ::v-deep {
    .modal__content {
      height: 622px;
    }
  }

  .content-wrap {
    &::-webkit-scrollbar {
      width: 14px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: #d3d1cb;
      background-clip: padding-box;
      border: 2px solid transparent;
      border-radius: 50px;
      border-top: 0;
      border-bottom: 0;
    }

    .form-group {
      height: calc(100% - 127px);
      text-align: left;
    }
    .form-group p.label {
      color: #000;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      margin-bottom: 13px;
      display: block;
    }
    .form-group input {
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      background: #fff;
      width: 100%;
      height: 44px;
      font-size: 15px;
      padding: 14px 16px;
    }
    .form-group input:focus {
      border: 1px solid #ffb17c;
    }
    .form-group input:disabled {
      color: #9e9e9e;
      background: #eee;
    }
    .form-group input.error {
      border: 1px solid #f68f95;
    }
    .form-group span.err-message {
      display: inline-block;
      margin-top: 4px;
      font-size: 12px;
      font-weight: 400;
      color: #f04f59;
      height: 18px;
      line-height: 18px;
      display: none;
    }
    .form-group input.error + span.err-message {
      display: inline-block;
    }

    // 기간 선택
    .date-select-wrap {
      display: flex;
      gap: 40px;
      height: 46px;
      .date-type {
        display: flex;
        gap: 40px;
        align-items: center;
        > p {
          margin-bottom: 0px;
        }
        > div {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .date-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;

          ::v-deep {
            i.cal {
              position: absolute;
              right: 8px;
              width: 16px;
              height: 16px;
              margin-right: 6px;
              background: url('~@/assets/img/icon/ic_calendar_16.png');
            }
            .date-str {
              width: 176px;
              height: 44px;
              display: block;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
              background: #fff;
              font-size: 15px;
              font-style: normal;
              font-weight: 400;
              line-height: 15px;
              padding: 14px;
            }
            .date-str.active {
              border: 1px solid #ffb17c;
            }
          }
        }
        input[type='radio']:checked + label::before,
        input[type='checkbox']:checked + label::before {
          background: url(~@/assets/img/icon/icon_radio_selected_orange.svg) no-repeat;
        }
      }
    }

    // 학생 선택
    .student-select-wrap {
      min-height: 48px;
      height: auto;
      align-items: flex-start;
      margin-bottom: 15px;
      display: flex;
      gap: 16px;
      flex-flow: column;
      position: relative;

      input {
        width: 280px;
        height: 44px;
      }

      // 드롭다운 학생 리스트
      .user-list {
        position: absolute;
        top: 48px;
        width: 280px;
        left: 0;
        background: #fff;
        border-radius: 10px;
        border: 1px solid #d6d6d6;
        box-shadow: 0px 5px 10px #0000001f;
        z-index: 1;
        ul {
          max-height: 240px;
          overflow: auto;
          &::-webkit-scrollbar {
            width: 14px;
          }
          &::-webkit-scrollbar-thumb {
            background: #d3d1cb;
            border-radius: 50px;
            background-clip: padding-box;
            border-top: 0;
            border-bottom: 0;
          }
        }
        .btns {
          padding: 12px;
          display: flex;
          justify-content: center;
          gap: 8px;
          border-top: 1px solid var(--gray-04);
          button {
            width: 80px;
          }
        }

        ul,
        p.nodata {
          padding: 9px 0;
        }

        ul li,
        p.nodata {
          height: 50px;
          display: flex;
          align-items: center;
          padding: 0 15px;
          cursor: pointer;
        }

        p.nodata {
          font-size: 14px;
          color: #9e9e9e;
        }

        ul li:hover {
          background: #f6f6f6;
        }

        /** 리스트 아이템 내부 요소 */
        ul li {
          label {
            display: flex;
            min-width: 0;
            align-items: center;
          }

          span.num {
            min-width: 28px;
            height: 18px;
            max-width: 58px;
            padding: 0 2px;
            border-radius: 20px;
            border: 1px solid #9e9e9e;
            font-size: 12px;
            color: #616161;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            line-height: 18px;
          }

          span.name {
            font-size: 15px;
            flex-grow: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            &.hidden {
              color: #9e9e9e;
            }
          }
        }
      }

      // 선택된 학생
      .users {
        min-height: 48px;
        max-height: 158px;
        overflow: hidden;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        position: relative;
        gap: 6px;

        &::-webkit-scrollbar {
          width: 14px;
        }
        &::-webkit-scrollbar-thumb {
          background: #d3d1cb;
          border-radius: 50px;
          background-clip: padding-box;
          border-top: 0;
          border-bottom: 0;
        }
        .user {
          height: 32px;
          padding: 0 8px 0 12px;
          border-radius: 27px;
          display: inline-flex;
          align-items: center;
          font-size: 15px;
          font-weight: 400;
          color: #222;
          background: #f6f6f6;

          button {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #bdbdbd;
            margin-left: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>