<!--
@File(Method): AttendanceDetailModal.vue
@Author: -
@Date Created: -
@Description: 클래스 > 수업관리 > 출결 알리기 > 제출내역 > 상세
@Modified: 2025-03-17 - #72058 출결알리기 개선 (편리한 기능, 체험학습 개수 제한) - 신청정보 UI 변경 / himodal 적용
-->
<template>
  <div>
    <HiModal
      v-if="isLoaded"
      type="type01"
      size="sm"
      dimClose
      @close="closeAttendanceDetailModal(false)"
      id="registerStudent"
    >
      <template v-slot:heading>출결 알리기</template>
      <template v-slot:content>
        <confirm-dialog
          v-if="confirmDialog.isShow"
          :isOtherUse="true"
          :isNeis="true"
          :isAlert="confirmDialog.isAlert"
          :title="confirmDialog.title"
          :description="confirmDialog.description"
          @closeConfirmDialog="closeConfirmDialog"
        />
        <div class="attendance-popup-wrap">
          <div
            v-if="!isTeacher && !attendance.attendanceConfirmType"
            class="highlight-box"
          >
            <div class="text">
              <div class="warning-icon"></div>
              선생님 확인 전에만 수정/삭제가 가능합니다.<br />일정이 바뀌었을 경우, 삭제
              후 다시 제출해주세요.
            </div>
          </div>
          <div class="profile-detail">
            <ul>
              <li>
                <div class="tit">신청 정보</div>
                <div class="info-box mt-10">
                  <div class="info-item">
                    <div class="info-lable">
                      제출자
                      <span><br />(제출일자)</span>
                    </div>
                    <div class="info-content">
                      <div>{{ submitUser }}</div>
                      <span class="desc">{{ submitDate }}</span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-lable">자녀 이름</div>
                    <div class="info-content">
                      {{
                        attendance.student.tagId
                          ? `${attendance.student.studentName} (${attendance.student.tagName})`
                          : attendance.student.studentName
                      }}
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-lable">출결일</div>
                    <div class="info-content">{{ attendanceDate }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-lable">출결 구분</div>
                    <div class="info-content highlight">
                      {{
                        `
                                                    ${getAttendanceTypeName(
                                                      attendance.attendanceType
                                                    )}
                                                    ${
                                                      attendance.attendanceConfirmType
                                                        ? ` (${getAttendanceConfirmTypeName(
                                                            attendance.attendanceConfirmType
                                                          )})`
                                                        : ""
                                                    }
                                                `
                      }}
                      <span v-if="isFieldStudyType && isTeacher" class="desc"
                        >출석인정
                        <span :class="{ 'txt-warning': isOverFieldStudyDays }">{{
                          submitCountsForStudent.FIELD_STUDY.ATTENDANCE
                        }}</span>
                        일 / {{ setting.classFieldStudyMaxDays }} 일
                        <span v-if="isOverFieldStudyDays" class="txt-warning">
                          (초과)</span
                        >
                      </span>
                      <span v-if="isFieldStudyType && !isTeacher" class="desc"
                        >누적 사용
                        {{
                          submitCountsForStudent.FIELD_STUDY.ATTENDANCE +
                          submitCountsForStudent.FIELD_STUDY.UNCONFIRMED
                        }}
                        일 / {{ setting.classFieldStudyMaxDays }} 일
                      </span>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-lable">사유</div>
                    <div class="info-content">{{ attendance.reason }}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-lable">첨부 파일</div>
                    <div class="info-content">
                      <div class="attaching-file-list">
                        <div
                          class="attaching-file"
                          v-for="(file, index) of attendance.files"
                          :class="{ 'mt-10': index > 0 }"
                          :key="file.seq"
                          @click="openAttachFile(file)"
                        >
                          <span class="file-text"
                            ><span class="file-icon" />{{ file.fileName }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <template
            v-if="
              isTeacher &&
              attendance.attendanceConfirmType &&
              attendance.memo &&
              attendance.memo.trim()
            "
          >
            <div class="label mt-30">비고</div>
            <div class="memo">{{ attendance.memo }}</div>
          </template>
        </div>
      </template>
      <template v-slot:footer>
        <div class="btns">
          <HiButton
            class="mb-10"
            color="noti"
            size="lg"
            block
            v-if="isTeacher && !attendance.attendanceConfirmType"
            @click="confrimAttendance"
            >출결 확인하기</HiButton
          >
          <HiButton
            color="line-light-primary"
            size="lg"
            v-if="!attendance.attendanceConfirmType || isTeacher"
            @click="openConfirmDialolg('delete')"
            >내역 삭제</HiButton
          >
          <HiButton
            color="primary"
            size="lg"
            v-if="!attendance.attendanceConfirmType || isTeacher"
            @click="updateAttendance"
            >수정</HiButton
          >
          <HiButton
            color="primary"
            size="lg"
            v-if="attendance.attendanceConfirmType && !isTeacher"
            @click="closeAttendanceDetailModal(false)"
            >확인</HiButton
          >
        </div>
      </template>
    </HiModal>
    <!-- <div class="modal normal-modal note-notice-modal" 
            style="overflow-y: auto;" 
            :style="{display: isLoaded ? 'block' : 'none'}" 
            id="registerStudent"
        >
            <confirm-dialog 
                v-if="confirmDialog.isShow"
                :isOtherUse="true"
                :isNeis="true" 
                :isAlert="confirmDialog.isAlert" 
                :title="confirmDialog.title" 
                :description="confirmDialog.description"
                @closeConfirmDialog="closeConfirmDialog"
            />
            <div class="modal-cont-wrap modal-position" 
                :class="{neis: isNeis}"
                v-click-outside="vcoConfig"
                @mouseover="offVco"
                @mouseleave="onVco">
                <div class="modal-cont report-box">
                    <div class="modal-cont-inner">
                        <div class="modal-title-wrap title-position">
                            <div class="title">출결 알리기</div>
                        </div>
                        <div class="attendance-popup-wrap">
                            <div v-if="!isTeacher && !this.attendance.attendanceConfirmType" class="highlight-box">
                                <div class="text">
                                    <div class="warning-icon" >
                                    </div>
                                    선생님 확인 전에만 수정/삭제가 가능합니다.<br>일정이 바뀌었을 경우, 삭제 후 다시 제출해주세요.
                                </div>
                            </div>
                            <div class="profile-detail">
                                <ul>
                                    <li>
                                        <div class="label">신청 정보</div>
                                        <div class="info-box mt-10">
                                            <div class="info-item">
                                                <div class="info-lable">
                                                    <div>제출자</div>
                                                    <div><span>(제출일자)</span></div>
                                                </div>
                                                <div class="info-content">
                                                    <div>{{ submitUser }}</div>
                                                    <div><span>{{ submitDate }}</span></div>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <div class="info-lable">자녀 이름</div>
                                                <div class="info-content">
                                                {{ attendance.student.tagId ? `${attendance.student.studentName} (${attendance.student.tagName})` : attendance.student.studentName }}
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <div class="info-lable">출결일</div>
                                                <div class="info-content">{{ attendanceDate }}</div>
                                            </div>
                                            <div class="info-item">
                                                <div class="info-lable">출결 구분</div>
                                                <div class="info-content highlight">
                                                    {{ 
                                                        `
                                                            ${getAttendanceTypeName(this.attendance.attendanceType)}
                                                            ${this.attendance.attendanceConfirmType ? ` (${getAttendanceConfirmTypeName(this.attendance.attendanceConfirmType)})` : ''}
                                                        ` 
                                                    }}
                                                    <span><br> 누적 사용 5일 / 20일 </span>
                                                </div>
                                            </div>
                                            <div class="info-item">
                                                <div class="info-lable">사유</div>
                                                <div class="info-content">{{ this.attendance.reason }}</div>
                                            </div>
                                            <div class="info-item">
                                                <div class="info-lable">첨부 파일</div>
                                                <div class="info-content">
                                                    <div class="attaching-file-list  mb-10">
                                                        <div class="attaching-file" 
                                                            style="height: 35px; padding-right:14px;cursor: pointer;"
                                                            v-for="(file, index) of this.attendance.files"
                                                            :class="{'mt-10': index > 0}"
                                                            :key="file.seq"
                                                            @click="openAttachFile(file)"
                                                        >
                                                            <span class="file-text"><span class="file-icon" />{{ file.fileName }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <template v-if="isTeacher && attendance.attendanceConfirmType && attendance.memo && attendance.memo.trim()">
                                <div class="label mt-30">비고</div>
                                <div class="memo">{{ this.attendance.memo }}</div>
                            </template>
                        </div>
                        <div class="btn-wrap">
                            <div v-if="isTeacher && !this.attendance.attendanceConfirmType">
                                <button v-if="!this.attendance.attendanceConfirmType" class="btn-attendance-confirm" @click="confrimAttendance">출결 확인하기</button>
                            </div>
                            <div class="btn-group">
                                <button v-if="!this.attendance.attendanceConfirmType || isTeacher" class="btn-attendance-cancel" @click="openConfirmDialolg('delete')">내역 삭제</button>
                                <button v-if="!this.attendance.attendanceConfirmType || isTeacher" class="btn-attendance-submit" @click="updateAttendance">수정</button>
                                <button v-if="this.attendance.attendanceConfirmType && !isTeacher" class="btn-attendance-submit" @click="closeAttendanceDetailModal(false)">확인</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-close-btn modal-close-icon" @click="closeAttendanceDetailModal(false)"></div>
                </div>
            </div>
        </div> -->
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations, mapGetters } from "vuex";
import ConfirmDialog from "@/apps/hitalk/components/popup/ConfirmDialog";
export default {
  name: "attendance-detail-modal",
  components: { ConfirmDialog },
  props: {
    id: String,
    clazzMemberRole: String,
    isNeis: {
      type: Boolean,
      default: false,
    },
    classId: String,
  },
  data() {
    return {
      isLoaded: false,
      attendance: {
        attendanceId: null,
        classId: null,
        student: {},
        attendanceDate: null,
        attendanceType: null,
        attendanceConfirmType: null,
        confirmTimestamp: null,
        memo: null,
        reason: null,
        insertedTimestamp: null,
        insertedUser: {},
        files: [],
      },
      confirmDialog: {
        isShow: false,
        isAlert: false,
        title: "",
        description: "",
        changeValiable: "",
      },
      alertConfirmDialog: false,
      vcoConfig: {
        handler: this.handler,
        events: ["click"],
        // Note: The default value is true, but in case you want to activate / deactivate
        //       this directive dynamically use this attribute.
        isActive: true,
      },
      setting: { classFieldStudyMaxDays: 0 },
      submitCountsForStudent: { FIELD_STUDY: { ATTENDANCE: 0 } },
    };
  },
  computed: {
    ...mapState("storeClazzes", {
      attendanceList: "attendance",
    }),
    ...mapGetters({
      curClassId: "curClassId",
    }),
    submitUser: function () {
      if (!this.attendance.attendanceId) {
        return "";
      }
      const { student, insertedUser } = this.attendance;
      return `${
        insertedUser
          ? insertedUser.userType !== "TEACHER"
            ? `${student.studentName} 학부모(${insertedUser.userName})`
            : `${insertedUser.userName} 선생님`
          : "(알수없음)"
      }
            `;
    },
    submitDate: function () {
      if (!this.attendance.attendanceId) {
        return "";
      }
      const isUpdate =
        this.attendance.insertedTimestamp !== this.attendance.updatedTimestamp &&
        !this.attendance.attendanceConfirmType;
      // return `${this.$moment(this.attendance.insertedTimestamp).format('YYYY.MM.DD HH:mm:ss')}${isUpdate ?' (수정됨)' : ''}`
      return `${this.$moment(this.attendance.insertedTimestamp).format(
        "YYYY.MM.DD HH:mm:ss"
      )}`;
    },
    attendanceDate: function () {
      if (!this.attendance.attendanceId) {
        return "";
      }
      const date = this.$moment(new Date(this.attendance.attendanceDate));

      return `${date.format("M월 D일")} ${this.getDayName(date.day())}요일`;
    },
    isTeacher: function () {
      return ["OWNER", "MANAGER"].includes(this.clazzMemberRole);
    },
    isFieldStudyType: function () {
      return this.attendance.attendanceType === "FIELD_STUDY";
    },
    isOverFieldStudyDays() {
      return (
        this.submitCountsForStudent.FIELD_STUDY.ATTENDANCE >
        this.setting.classFieldStudyMaxDays
      );
    },
  },
  methods: {
    ...mapActions("storeClazzes", ["callAttendanceById", "callAttendanceDeleteById"]),
    ...mapMutations("storeClazzes", {
      setAttendanceApplyList: "setAttendanceApplyList",
    }),
    onVco() {
      // Modal in new Modal 대응
      const hiModalCommons = document.getElementsByClassName("hi-modal-common");
      if (hgetDayNameiModalCommons && hiModalCommons.length > 0) return false;

      const modals = document.getElementsByClassName("modal");
      const sweetAlerts = document.querySelectorAll(".swal2-container");
      if (modals.length < 2 && sweetAlerts.length < 1) this.vcoConfig.isActive = true;
    },
    offVco() {
      this.vcoConfig.isActive = false;
    },
    getDayName(day) {
      console.log("day : " + day);
      switch (day) {
        case 1:
          return this.$t("chat.settings.monday");
        case 2:
          return this.$t("chat.settings.tuesday");
        case 3:
          return this.$t("chat.settings.wednesday");
        case 4:
          return this.$t("chat.settings.thursday");
        case 5:
          return this.$t("chat.settings.friday");
        case 6:
          return this.$t("chat.settings.saturday");
        case 0:
          return this.$t("chat.settings.sunday");
      }
    },
    getAttendanceTypeName: (attendanceType) =>
      ({
        ABSENCE: "결석",
        EARLY_LEAVE: "조퇴",
        LATENESS: "지각",
        OUT: "외출",
        FIELD_STUDY: "가정 체험학습",
      }[attendanceType] || ""),
    getAttendanceConfirmTypeName: (attendanceConfirmType) =>
      ({
        ILLNESS: "질병",
        NOT_ACCEPT: "미인정",
        ETC: "기타",
        ATTENDANCE: "출석인정",
      }[attendanceConfirmType] || ""),
    async deleteAttendance() {
      const res = await this.callAttendanceById(this.id);
      if (res.status === 428) {
        this.openConfirmDialolg("deleted");
        return;
      } else if (res.status === 417) {
        this.openConfirmDialolg("attendanceOff");
        return;
      }
      if (res.data.attendanceConfirmType && !this.isTeacher) {
        this.openConfirmDialolg("completeDeleted");
        return;
      }
      const error = await this.callAttendanceDeleteById(this.id);
      if (error === 417) {
        this.openConfirmDialolg("attendanceOff");
      } else {
        this.setAttendanceApplyList(
          this.attendanceList.applyList.filter((o) => o.attendanceId != this.id)
        );
        this.$toasted.clear();
        const options = { duration: 5000 };
        this.$toasted.show("제출한 내역이 삭제되었습니다.", options);
        this.$emit("close", {
          id: null,
          isConfirm: false,
          isDeleted: true,
          isInit: false,
        });
      }
    },
    closeAttendanceDetailModal: function (isInit = false) {
      this.$emit("close", { id: null, isConfirm: false, isDeleted: false, isInit });
    },
    async updateAttendance() {
      const res = await this.callAttendanceById(this.id);
      if (res.status === 428) {
        this.openConfirmDialolg("deleted");
        return;
      } else if (res.status === 417) {
        this.openConfirmDialolg("attendanceOff");
        return;
      }

      if (res.data.attendanceConfirmType && !this.isTeacher) {
        this.openConfirmDialolg("completeUpdated");
        return;
      }
      this.$emit("close", {
        id: this.id,
        isConfirm: false,
        isDeleted: false,
        isInit: false,
      });
    },
    async confrimAttendance() {
      const res = await this.callAttendanceById(this.id);
      if (res.status === 428) {
        this.openConfirmDialolg("deleted");
        return;
      } else if (res.status === 417) {
        this.openConfirmDialolg("attendanceOff");
        return;
      }
      this.$emit("close", {
        id: this.id,
        isConfirm: true,
        isDeleted: false,
        isInit: false,
      });
    },
    openAttachFile(file, i) {
      if (file.fileContentType.startsWith("image")) {
        this.$store.commit("setImageView", {
          isOpen: true,
          items: [file],
          index: i || 0,
        });
      } else {
        this.$store.commit("setDocView", {
          isOpen: true,
          item: file,
        });
      }
    },
    openConfirmDialolg: function (changeValiable) {
      let title = "";
      let description = "";
      let isAlert = false;
      switch (changeValiable) {
        case "delete": {
          if (this.isTeacher) {
            title = "제출 내역을 삭제하시겠습니까?";
            description =
              "제출 내역을 삭제하시면<br>신청서를 제출한 사람에게도 내역이 삭제되며<br>신청서는 복구되지 않습니다.";
          } else {
            title = "선생님께 제출한 신청서를<br>삭제하시겠습니까?";
            description = "한번 삭제한 신청서는 복구되지 않습니다.";
          }
          break;
        }
        case "deleted": {
          title = "삭제된 내역입니다.";
          isAlert = true;
          break;
        }
        case "completeDeleted": {
          title = "선생님께서 신청서 내용을<br>확인하셨습니다.";
          description = "확인완료된 내역은 삭제가 불가합니다.";
          isAlert = true;
          break;
        }
        case "completeUpdated": {
          title = "선생님께서 신청서 내용을<br>확인하셨습니다.";
          description = "확인완료된 내역은 수정이 불가합니다.";
          isAlert = true;
          break;
        }
        case "attendanceOff": {
          title = "출결알리기 사용이 OFF 되었습니다.";
          isAlert = true;
          break;
        }
      }
      const modal = {
        changeValiable,
        title,
        description,
        isShow: true,
        isAlert,
      };
      this.confirmDialog = { ...modal };
    },
    closeConfirmDialog: async function (isConfirm) {
      if (isConfirm) {
        switch (this.confirmDialog.changeValiable) {
          case "delete": {
            this.deleteAttendance();
            break;
          }
          case "deleted": {
            this.closeAttendanceDetailModal(true);
            break;
          }
          case "complete": {
            const res = await this.callAttendanceById(this.id);
            this.attendance = res.data;
            break;
          }
          case "attendanceOff": {
            this.closeAttendanceDetailModal(false);
            break;
          }
        }
      }

      this.confirmDialog = {
        isShow: false,
        isAlert: false,
        title: "",
        description: "",
        changeValiable: "",
      };
      this.alertConfirmDialog = true;
    },
    handler(e) {
      // this.$log.debug(
      //   'Clicked outside (Using config), middleware returned true :)'
      // )
      // this.$log.debug('handler event: ', event)
      this.$log.debug(
        `handler this.vcoConfig.isActive attendance => `,
        this.vcoConfig.isActive
      );

      if (this.vcoConfig.isActive && this.alertConfirmDialog === false)
        this.closeAttendanceDetailModal();

      if (this.alertConfirmDialog === true) this.alertConfirmDialog = false;
    },
    async loadReference() {
      this.setting = (
        await this.$axios.get(`/attendances/setting/${this.curClassId || this.classId}`)
      ).data;
      this.submitCountsForStudent = (
        await this.$axios.get(
          `/attendances/submit-count/${this.attendance.student.studentId}/details`
        )
      ).data;
    },
  },
  async created() {
    this.isLoaded = false;
    const res = await this.callAttendanceById(this.id);
    if (res.status === 428) {
      this.openConfirmDialolg("deleted");
    } else if (res.status === 417) {
      this.openConfirmDialolg("attendanceOff");
    } else {
      this.attendance = res.data;
    }
    await this.loadReference();
    this.isLoaded = true;
  },
};
</script>

<style scoped lang="scss">
.hi-modal-common::v-deep {
  .modal__layer {
    max-width: 460px;
    top: 30px;
    vertical-align: top;
  }
  .modal__footer .btns {
    width: 306px;
    margin: 0 auto;
    button.btn-noti {
      width: calc(100% - 8px);
    }
  }
}
.attendance-popup-wrap {
  text-align: left;
  font-family: var(--font-body);
  font-style: normal;
  font-feature-settings: "clig" off, "liga" off;
  margin: 0px !important;
  width: 100%;
}
.attendance-popup-wrap .highlight-box {
  display: flex;
  padding: 12px 19px 12px 33px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--primary);
  background: rgba(71, 120, 222, 0.05);
  margin-bottom: 25px;
  .text {
    position: relative;
    color: var(--primary);
    font-size: 14px;
    font-weight: 400;
    line-height: 21px; /* 150% */
    letter-spacing: -0.2px;
    .warning-icon {
      position: absolute;
      top: 1px;
      left: -20px;
      display: inline-block;
      width: 16px;
      height: 16px;
      background: url("~@/assets/img/icon/warning_circle.svg") no-repeat;
    }
  }
}
.attendance-popup-wrap .tit {
  color: var(--web-text-txt-02, #222);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px; /* 153.846% */
  letter-spacing: -0.2px;
  margin: 0;
}
.attendance-popup-wrap .info-box {
  width: 100%;
  border-top: 2px solid var(--secondary);
  border-bottom: 1px solid var(--gray-04);
  background: #fff;
  .info-item {
    display: flex;
    width: 100%;
    background: #fff;
    border-bottom: 1px solid var(--gray-04);
  }
  .info-lable {
    min-width: 96px;
    color: var(--gray-10);
    font-size: 15px;
    font-weight: 500;
    line-height: 21px;
    background: #f9fafc;
    padding: 16px 12px;
  }
  .info-lable span {
    color: var(--gray-09, #616161);
    font-size: 12px;
    font-weight: 300;
    line-height: 20px;
  }
  .info-content {
    color: var(--web-text-gray-10, #222);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.4;
    word-break: break-all;
    width: calc(100% - 96px);
    padding: 16px 12px;
    &.highlight {
      font-weight: 500;
      color: var(--primary);
    }
    > div {
      line-height: 1.4;
    }
  }
  .info-content .desc {
    color: var(--web-text-gray-08, #9e9e9e);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    display: block;
  }
}
.attendance-popup-wrap .attaching-file-list {
  margin-top: -10px;

  .attaching-file {
    padding: 0 14px;
    cursor: pointer;

    .file-text {
      vertical-align: middle;
      font-size: 14px !important;
      font-weight: 400 !important;
      line-height: 150% !important; /* 21px */
      letter-spacing: -0.2px;
      width: 100% !important;

      .file-icon {
        display: inline-block;
        width: 16px;
        height: 16px;
        background: url("~@/assets/img/icon/ic_hitalk_file_blue.png");
        margin-right: 2px;
        vertical-align: middle;
      }
    }
  }
}
.attendance-popup-wrap .memo {
  margin-top: 5px;
  border-radius: 6px;
  border: 1px solid var(--web-border-br-01, #e0e0e0);
  background: #fff;
  padding: 15px 15px;
  width: 100%;
  height: 74px;
  font-size: 15px;
  font-weight: 400;
  line-height: 23px;
  letter-spacing: -0.2px;
  word-break: break-all;
}
</style>
