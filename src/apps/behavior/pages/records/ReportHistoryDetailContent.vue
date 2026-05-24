<!--
@File(Method): ReportHistoryDetailContent.vue
@Date Created: 2025-12-08
@Description: 학급기록 > 학생 리포트 > 리포트 내역 > 상세 모달 > 상세 컨텐츠
-->

<template>
  <div
    class="report-history-detail"
    :class="viewType === 'pdf' ? 'pdf' : viewType === 'hitalk' ? 'hitalk' : ''"
  >
    <div class="detail-inner">
      <div class="detail-head">
        <div class="title-area">
          <h2 v-if="mode === 'view'">{{ reportHistory.reportName }}</h2>
          <h2 v-else>리포트 수정하기</h2>
          <div class="date" v-if="mode === 'view'">
            <img v-if="isPdfType" src="@/assets/img/ic_calendar_24.png" />
            <i v-else class="hi-ico ico-calendar ico-size-24" />
            {{ formattedDateStart }} ~ {{ formattedDateEnd }}
          </div>
        </div>
        <div class="btns" v-if="mode === 'view'">
          <HiButton color="line-default" bitrounded size="sm" @click="startEdit">
            <i class="hi-ico ico-pen3 ico-size-18" />수정하기
          </HiButton>
        </div>
      </div>
      <div class="title-edit-area"></div>
      <div class="detail-body">
        <div class="report-info" v-if="mode !== 'view'">
          <h3>제목</h3>
          <input v-model="reportHistory.reportName" maxlength="100" />
          <h3 class="mt-30">날짜</h3>
          <div class="date">
            <div class="input-wrap">
              <input v-model="reportHistory.dateStart" disabled />
              <i class="hi-ico ico-calendar ico-size-24" />
            </div>
            ~
            <div class="input-wrap">
              <input v-model="reportHistory.dateEnd" disabled />
              <i class="hi-ico ico-calendar ico-size-24" />
            </div>
          </div>
        </div>
        <div class="point-info">
          <h3>포인트 내역</h3>
          <div class="con">
            <div class="student-info">
              <span v-if="isPhoto(displayedStudent)" class="image">
                <img
                  :class="{ 'is-photo': isPhoto(displayedStudent) }"
                  :src="selectedImageSrc(displayedStudent)"
                  alt="학생 프로필 이미지"
                />
              </span>
              <span class="num">{{
                displayedStudent && displayedStudent.no ? displayedStudent.no : ""
              }}</span>
              <span class="name">{{
                displayedStudent && displayedStudent.name ? displayedStudent.name : ""
              }}</span>
            </div>

            <div class="cumulative">
              <div class="point-card">
                <i class="good"></i>
                <div class="point good">
                  <span class="type">좋음</span>
                  <span class="score">{{ total?.positivePoint }}</span>
                </div>
              </div>
              <i class="minus"></i>
              <div class="point-card">
                <i class="bad"></i>
                <div class="point bad">
                  <span class="type">노력</span>
                  <span class="score">{{ total?.negativePoint }}</span>
                </div>
              </div>
              <i class="equal"></i>
              <div class="point-card">
                <i class="total"></i>
                <div class="point total">
                  <span class="type icon">
                    총점
                    <img
                      v-if="isPdfType"
                      src="@/assets/img/ic_question_circle_fill_14.png"
                    />
                    <HiTooltip
                      v-else
                      ico="help-fill"
                      position="top"
                      class="hi-tooltip-wrap"
                      :title-html="`조회한 기간의 좋음 점수에서<br />노력 점수를 뺀 점수를 표시합니다.`"
                    />
                  </span>
                  <span class="score">{{ total?.totalPoint }}</span>
                </div>
              </div>
            </div>

            <div class="card-content-wrap">
              <div v-if="!hasPointData" class="hi-nodata">
                <p>지급한 포인트가 없습니다.</p>
              </div>
              <div class="point-chart-wrap">
                <div v-if="hasPointData" class="doughnut-wrap">
                  <Doughnut
                    class="point-chart"
                    :chart-data="chartData"
                    :chart-options="isPdfType ? chartPdfOptions : chartOptions"
                  />
                  <div class="center-text"><span>좋음</span>{{ percent }}%</div>
                  <div class="custom-legend">
                    <span class="legend-item good">
                      <span class="circle"></span> 좋음
                    </span>
                    <span class="legend-item bad">
                      <span class="circle"></span> 노력
                    </span>
                  </div>
                </div>
              </div>

              <div class="card-content">
                <div class="point-category-wrap" v-if="goodPoints.length">
                  <div class="category-title-warp">
                    <i class="good"></i>
                    <p>좋음</p>
                  </div>
                  <div class="grid-wrap">
                    <point-total-card
                      v-for="p in goodPoints"
                      :key="p.pointId"
                      :classroomId="classroomId"
                      :point="p"
                      :params="{ studentId: displayedStudent.studentId }"
                      :bestPoint="p.totalPoint === maxPoint"
                    />
                  </div>
                </div>
                <div class="point-category-wrap" v-if="badPoints.length">
                  <div class="category-title-warp">
                    <i class="bad"></i>
                    <p>노력</p>
                  </div>
                  <div class="grid-wrap">
                    <point-total-card
                      v-for="p in badPoints"
                      :key="p.pointId"
                      :classroomId="classroomId"
                      :params="{ studentId: displayedStudent.studentId }"
                      :point="p"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref="feedback" class="teacher-feedback" v-if="visibleFeedback">
          <h3>선생님 피드백</h3>
          <div class="con">
            <pre v-if="isPdfType" v-html="formattedFeedback"></pre>
            <pre v-else-if="mode === 'view'">{{ reportHistory.feedback }}</pre>
            <textarea
              v-else
              v-model="reportHistory.feedback"
              placeholder="내용을 입력해주세요."
              maxlength="20000"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="detail-footer" v-if="mode !== 'view'">
      <HiButton color="line-default" bitrounded size="md" @click="cancelEdit"
        >취소</HiButton
      >
      <HiButton
        color="orange"
        bitrounded
        size="md"
        @click="saveReportHistory"
        :disabled="!reportHistory.reportName"
        >저장</HiButton
      >
    </div>
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
import { Doughnut } from "vue-chartjs/legacy";
import ConfirmModal from "@/apps/behavior/components/popup/ConfirmModal.vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import PointTotalCard from "@/apps/behavior/components/list/PointTotalCard.vue";
import { mapActions } from "vuex";
import { getClassroomReportStudents, patchClassroomReportStudents } from "@hiclass/core";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels);

export default {
  name: "ReportHistoryDetailContent",
  components: { Doughnut, PointTotalCard, ConfirmModal },
  props: {
    classroomId: String,
    reportId: String,
    viewType: String, //pdf, hitalk, normal
  },
  data() {
    return {
      total: {},
      point: { list: [] },
      studentDetail: null,
      mode: "view",
      reportHistory: {},
      enableAnimation: true,
      isOpenMoreLayer: false,
      confirmModal: {
        isOpen: false,
        title: "",
        description: "",
        confirmButtonText: "",
        confirmButtonColor: "#FF8737",
        params: null,
        isAlert: true,
        action: "",
      },
    };
  },
  computed: {
    formattedFeedback() {
      if (!this.reportHistory.feedback) return '';
      return this.reportHistory.feedback.replace(/\n/g, '<br>');
    },
    formattedDateStart() {
      return this.formatDate(this.reportHistory && this.reportHistory.dateStart);
    },
    formattedDateEnd() {
      return this.formatDate(this.reportHistory && this.reportHistory.dateEnd);
    },
    displayedStudent() {
      return this.studentDetail || null;
    },
    goodPoints() {
      return (this.point.list || []).filter((p) => !p.isNegative);
    },
    badPoints() {
      return (this.point.list || []).filter((p) => p.isNegative);
    },
    hasPointData() {
      return (this.total.positivePoint || 0) + (this.total.negativePoint || 0) > 0;
    },
    percent() {
      return this.positiviePercent();
    },
    visibleFeedback() {
      if (this.mode === "view") {
        return this.reportHistory.feedback !== null && this.reportHistory.feedback !== "";
      } else {
        return true;
      }
    },
    isPdfType() {
      return this.viewType === "pdf";
    },
    maxPoint() {
      return Math.max(...this.goodPoints.map((p) => p.totalPoint));
    },
    chartData() {
      let borderWidth = 0;
      let pos = this.positiviePercent();

      if ((pos === 0) | (pos === 100)) {
        borderWidth = 0;
      } else {
        borderWidth = 2;
      }
      const neg = 100 - pos;
      return {
        labels: ["좋음", "노력"],
        datasets: [
          {
            backgroundColor: ["#3987F8", "#F95F6E"],
            data: [pos || 0, neg || 0],
            borderWidth: borderWidth,
          },
        ],
      };
    },
    chartPdfOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
          },
          datalabels: { display: false },
        },
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: function (context) {
              let tooltipEl = document.getElementById("chartjs-tooltip");
              if (!tooltipEl) {
                tooltipEl = document.createElement("div");
                tooltipEl.id = "chartjs-tooltip";
                tooltipEl.className = "my-tooltip";
                document.body.appendChild(tooltipEl);
              }
              const tooltipModel = context.tooltip;
              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }
              if (tooltipModel.body) {
                const dataPoint = tooltipModel.dataPoints[0];
                const label = dataPoint.label;
                const value = dataPoint.raw;
                const dataset = dataPoint.dataset.data;
                const total = dataset.reduce((a, b) => a + b, 0);
                const percent = total ? Math.round((value / total) * 100) : 0;
                tooltipEl.innerHTML = `<div class="my-tooltip-label">${label}</div><div class="my-tooltip-value">${percent} %</div>`;
              }
              const canvas = context.chart.canvas;
              const rect = canvas.getBoundingClientRect();
              tooltipEl.style.opacity = 1;
              tooltipEl.style.position = "fixed";
              tooltipEl.style.left =
                rect.left + window.scrollX + tooltipModel.caretX + "px";
              tooltipEl.style.top =
                rect.top + window.scrollY + tooltipModel.caretY + -10 + "px";
              tooltipEl.style.pointerEvents = "none";
            },
          },
          datalabels: { display: false },
        },
      };
    },
  },
  watch: {
    reportId: {
      handler(newVal) {
        if (newVal) {
          this.initData();
        }
      },
    },
    classroomId: {
      handler(newVal) {
        if (newVal) {
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "";
      const m = this.$moment(
        dateStr,
        ["YYYY-MM-DD", "YYYY.MM.DD", this.$moment.ISO_8601],
        true
      );
      return (m.isValid() ? m : this.$moment(dateStr)).format("YYYY.MM.DD");
    },
    ...mapActions("storeBehavior", {
      getClassroomPointTotal: "getClassroomPointTotal",
      getClassroomPointNameByTotal: "getClassroomPointNameByTotal",
      getClassroomPointIssuedList: "getClassroomPointIssuedList",
      getClassroomStudents: "getClassroomStudents",
    }),

    positiviePercent() {
      const pos = this.total.positivePoint || 0;
      const neg = this.total.negativePoint || 0;
      const sum = pos + neg;
      if (!sum) return 0;
      return Math.ceil((pos / sum) * 100);
    },

    isPhoto(student) {
      return student && student.photo !== null;
    },
    selectedImageSrc(student) {
      return student.photo;
    },
    async saveReportHistory() {
      if (this.mode === "update") {
        let params = {
          userId: localStorage.uuid,
          reportName: this.reportHistory.reportName,
        };
        const inputFeedback = this.reportHistory.feedback;
        if (inputFeedback) {
          params = {
            ...params,
            reportMemo: inputFeedback,
          };
        } else {
          params = {
            ...params,
            reportMemo: "",
          };
        }

        try {
          await patchClassroomReportStudents(this.classroomId, this.reportId, params);
          this.reportHistoryBackup = null;
          this.mode = "view";
          this.$emit("save", { reportHistory: this.reportHistory });
        } catch (error) {
          const status = error?.response.status;
          const errorCode = error?.response?.data?.error;
          if ((status == 428) & (errorCode === "deleteReport")) {
            this.confirmModal.title = "삭제된 리포트 입니다.";
            this.confirmModal.isOpen = true;
            this.$emit("close");
          } else {
            this.confirmModal.title = "요청 처리 중 오류가 발생했습니다.";
            this.confirmModal.isOpen = true;
          }
        }
      }
    },

    closeConfirmModal: async function (isConfirm) {
      this.confirmModal = {
        ...this.confirmModal,
        isOpen: false,
      };
    },

    startEdit() {
      this.reportHistoryBackup = JSON.parse(JSON.stringify(this.reportHistory));
      this.mode = "update";
      this.$emit("start-edit");
    },
    cancelEdit() {
      if (this.reportHistoryBackup) {
        this.reportHistory = JSON.parse(JSON.stringify(this.reportHistoryBackup));
        this.reportHistoryBackup = null;
      }
      this.mode = "view";
      this.$emit("cancel-edit");
    },
    removeEmpty(params) {
      return Object.keys(params).reduce((acc, key) => {
        if (params[key] !== "" && params[key] !== null) acc[key] = params[key];
        return acc;
      }, {});
    },
    async initData() {
      try {
        const res = await getClassroomReportStudents(
          this.classroomId,
          this.reportId,
          localStorage.uuid
        );

        this.reportHistory = {
          reportId: res.reportId,
          reportName: res.reportName,
          dateStart: this.$moment(res.dateStartTimestamp).format("yyyy-MM-DD"),
          dateEnd: this.$moment(res.dateEndTimestamp).format("yyyy-MM-DD"),
          feedback: res.reportMemo,
        };

        this.studentDetail = {
          id: res.reportData.studentId,
          no: res.reportData.studentNo,
          name: res.reportData.studentName,
          photo: res.reportData.studentPhoto,
        };

        const negativePoint = res.reportData.points
          .filter((p) => p.isNegative)
          .reduce((sum, p) => sum + p.totalPoint, 0);
        const positivePoint = res.reportData.points
          .filter((p) => p.isNegative == false)
          .reduce((sum, p) => sum + p.totalPoint, 0);

        this.total = {
          negativePoint: negativePoint,
          positivePoint: positivePoint,
          totalPoint: positivePoint - negativePoint,
        };
        this.setPoint(res.reportData.points);
        this.$emit("tempReportHistory", {
          ...this.reportHistory,
          studentName: this.studentDetail.name,
        });
        await this.$nextTick();
      } catch (error) {
        const status = error?.response.status;
        const errorCode = error?.response?.data?.error;
        if ((status == 428) & (errorCode === "deleteReport")) {
          this.confirmModal.title = "삭제된 리포트 입니다.";
          this.confirmModal.isOpen = true;
          this.$emit("close");
        } else {
          this.confirmModal.title = "요청 처리 중 오류가 발생했습니다.";
          this.confirmModal.isOpen = true;
        }
      } finally {
        this.$emit("reportHistoryDetailReady");
      }
    },
    setPoint(points) {
      // const ids = this.point.list.map((p) => p.pointId);
      this.point.list = points;
    },
  },
  async created() {},

  async mounted() {
    await this.initData();
  },
};
</script>

<style scoped lang="scss">
.report-history-detail {
  display: flex;
  flex-flow: column;
  height: calc(100vh - 72px);
  .detail-inner {
    overflow: auto;
    padding: 10px 40px 20px;
    position: relative;
    flex-grow: 1;
  }
  .detail-head {
    display: flex;
    padding-bottom: 20px;
    margin-bottom: 30px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-04);

    h2 {
      font-size: 22px;
      font-weight: 700;
      line-height: 137%;
      padding-bottom: 6px;
      word-break: break-all;
    }
    .date {
      font-size: 14px;
      font-weight: 400;
      line-height: 160%;
      color: var(--gray-08);
      display: flex;
      align-items: center;
      gap: 2px;
      .hi-ico {
        padding: 0;
        margin: 0;
        border: 0;
        &::after {
          background-color: var(--gray-08);
        }
      }
    }
    .btns {
      gap: 8px;
      display: flex;

      button {
        min-width: 94px;
        .hi-ico::after {
          background-color: var(--gray-07);
        }
      }
    }
  }

  .detail-body {
    h3 {
      font-size: 16px;
      font-weight: 700;
      line-height: 150%;
      margin-bottom: 12px;
    }
    .con {
      border-radius: 16px;
      border: 1px solid var(--gray-05);
      background: #fff;
      padding: 25px;
    }
  }

  .detail-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 52px;
    height: 80px;
    button {
      width: 110px;
    }
  }

  .report-info {
    margin-bottom: 40px;
    input {
      width: 100%;
      height: 44px;
      border: 1px solid var(--gray-07);
      border-radius: 4px;
      padding: 0 12px;
      font-size: 15px;
      font-weight: 400;
      line-height: 160%;
      &:focus {
        outline: none;
        border-color: var(--orange);
      }
    }
    .date {
      font-size: 14px;
      font-weight: 400;
      line-height: 160%;
      .input-wrap {
        position: relative;
        display: inline-flex;
        input {
          width: 190px;
          &:disabled {
            color: var(--gray-08);
            background: var(--gray-04);
            border: 1px solid var(--gray-05);
          }
        }
        .hi-ico {
          position: absolute;
          right: 10px;
          top: 10px;
          padding: 0;
          margin: 0;
          border: 0;
          &::after {
            background-color: var(--gray-08);
          }
        }
      }
    }
  }
  .point-info {
    container-type: inline-size;
    container-name: chart-area;

    //  학생정보
    .student-info {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .image {
        display: inline-flex;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #f5f6f7;
        overflow: hidden;
        margin-right: 10px;
        justify-content: center;
        align-items: flex-end;
      }
      .image img {
        width: 32px;
        height: 32px;
        -o-object-fit: cover;
        object-fit: cover;
        image-rendering: auto;
      }
      .image img.is-photo {
        width: 100%;
        height: 100%;
      }
      .num {
        display: inline-block;
        width: auto;
        font-size: 23px;
        font-weight: 800;
        color: #616161;
        text-align: center;
        line-height: 24px;
        margin-right: 6px;
        color: var(--gray-07);
      }
      .name {
        display: inline-block;
        font-size: 18px;
        font-weight: 700;
        color: #222;
        text-align: left;
        width: auto;
        line-height: 144%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex-grow: 1;
      }

      .info {
        .name {
          font-size: 18px;
          font-weight: 600;
          line-height: 150%;
          margin-bottom: 4px;
        }
        .classroom {
          font-size: 14px;
          font-weight: 400;
          line-height: 160%;
          color: var(--gray-08);
        }
      }
    }
    // 누적 포인트
    .cumulative {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      border-radius: 8px;
      background: #f6f6f6;
      padding: 26px 0;

      .point-card {
        display: flex;
        min-width: 93px;
        height: 50px;
      }
      .point-card i {
        width: 50px;
        height: 50px;
      }
      .point-card i.good {
        background: url("~@/assets/img/icon/ic_reward_fill_good_50.svg");
      }
      .point-card i.bad {
        background: url("~@/assets/img/icon/ic_reward_fill_bad_50.svg");
      }
      .point-card i.total {
        background: url("~@/assets/img/icon/ic_reward_fill_52.svg");
      }
      .point-card .point {
        min-width: 35px;
        height: 50px;
        margin-left: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .point-card .point .type {
        font-weight: 500;
        font-size: 14px;
        line-height: 14px;
      }
      .point-card .point .score {
        margin-top: 8px;
        font-weight: 700;
        font-size: 28px;
        line-height: 28px;
      }
      .point-card .point.good {
        color: #3987f8;
      }
      .point-card .point.bad {
        color: #f95f6e;
      }
      .point-card .point.total {
        color: #222222;
      }
      .minus,
      .equal {
        width: 24px;
        height: 24px;
      }
      .minus {
        background: url("~@/assets/img/icon/ic_minus_24.svg");
      }
      .equal {
        background: url("~@/assets/img/icon/ic_equalsign_24.svg");
      }
    }

    // 포인트 카드
    .card-content-wrap {
      width: 100%;
      margin-top: 25px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      .card-content {
        width: calc(100% - 290px);
      }
      .point-category-wrap {
        width: 100%;
        margin-bottom: 25px;
        .category-title-warp {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .category-title-warp i.good {
          width: 15px;
          height: 15px;
          background: url("~@/assets/img/icon/ic_reward_fill_good_15.svg");
        }
        .category-title-warp i.bad {
          width: 15px;
          height: 15px;
          background: url("~@/assets/img/icon/ic_reward_fill_bad_15.svg");
        }
        .category-title-warp p {
          color: #222;
          font-size: 15px;
          line-height: 15px;
          font-weight: 700;
          margin-left: 4px;
        }
        .grid-wrap {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 10px;
          row-gap: 10px;
          min-height: 50px;
        }
        ::v-deep {
          .grid-wrap .point-card-warp p.point-name {
            max-width: none;
          }
        }
      }
    }

    // 포인트 차트
    .point-chart-wrap {
      min-width: 278px;
      padding-bottom: 25px;
      .doughnut-wrap {
        display: flex;
        justify-content: center;
        position: relative;
        align-items: center;
        gap: 50px;
        .point-chart {
          width: 240px;
          height: 240px;
        }
        .center-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 28px;
          font-weight: var(--font-strong);
          line-height: 135%;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
          margin-top: 4px;
          span {
            font-size: 15px;
            font-weight: var(--font-normal);
            color: var(--gray-09);
          }
        }
        .custom-legend {
          display: none;
          flex-direction: column;
          gap: 16px;
          .legend-item {
            display: flex;
            align-items: center;
            font-size: 15px;
            .circle {
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-right: 8px;
            }
            &.good .circle {
              background: #3987f8;
            }
            &.bad .circle {
              background: #f95f6e;
            }
          }
        }
      }
    }
  }

  .teacher-feedback {
    margin-top: 30px;
    .con {
      background: var(--primary-03);
      border: 0;
      pre {
        white-space: pre-wrap;
        overflow: auto;
        font-size: 15px;
        font-weight: 400;
        line-height: 160%;
        word-break: break-all;
      }
      p {
        font-size: 15px;
        font-weight: 400;
        line-height: 160%;
        word-break: break-all;
      }
      textarea {
        width: 100%;
        height: 120px;
        border: 1px solid var(--gray-05);
        border-radius: 4px;
        padding: 16px;
        font-size: 15px;
        font-weight: 400;
        line-height: 160%;
      }
    }
  }

  &.pdf {
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
    .detail-inner {
      padding: 30px 30px;
    }
    .detail-head {
      .btns {
        display: none;
      }
    }
    .detail-body {
      .con {
        padding: 20px 20px 0 20px;
      }
    }
    .card-content-wrap {
      flex-flow: column;
      .card-content {
        width: 100%;
      }
    }

    .point-info{
      .student-info{
        margin-bottom:15px;
      }
      .cumulative{
        padding:20px 0;
        .point-card .point .score{
          font-size: 24px;
          line-height: 24px;
          margin-top: 4px;
        }
        .point-card .point .type{
          display: none;
        }
      }
      .point-chart-wrap{
        padding-bottom: 0px;
        .doughnut-wrap {
          .point-chart{width:180px; height:180px;}
          .center-text {
            left: calc(50% - 46px);            
            font-size: 22px;
          }
          .custom-legend {
            display: flex;
          }
        }
      }
    }
    .point-category-wrap ::v-deep {
      .grid-wrap .point-card-warp p.point-name {
        word-break: break-all;
        white-space: break-spaces;
        font-size: 14px;
      }
    }
    .teacher-feedback{
      margin-top:20px;
      .con{
        padding-bottom:0;
        pre{
          font-family: "Pretendard Variable";
          font-size: 13px; 
          padding-bottom:25px;
        }
      } 
    }
  }
  &.hitalk {
    .detail-inner {
      padding: 20px 30px;
    }
    .detail-head {
      padding-bottom: 15px;
      margin-bottom: 20px;
      .title-area input,
      h2 {
        font-size: 18px;
        line-height: 144%;
      }
      .date {
        i {
          display: none;
        }
        &::before {
          content: "기간 : ";
          margin-right: 4px;
        }
      }

      .btns {
        display: none;
      }
    }
    .card-content-wrap {
      flex-flow: column;
      .card-content {
        width: 100%;
      }
    }

    .point-info .point-chart-wrap .doughnut-wrap {
      .center-text {
        left: calc(50% - 46px);
      }
      .custom-legend {
        display: flex;
      }
    }
    // .point-category-wrap ::v-deep {
    //   .grid-wrap .point-card-warp p.point-name {
    //     //max-width: 288px;
    //   }
    // }
  }

  @container chart-area (max-width: 700px) {
    .point-info .card-content-wrap {
      flex-flow: column;
      .card-content {
        width: 100%;
      }
    }
  }
}
</style>
<style>
.my-tooltip {
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  pointer-events: none;
  z-index: 9999;
  transition: opacity 0.3s;
  line-height: 120%;
  text-align: center;
}
.my-tooltip::after {
  content: "";
  position: absolute;
  bottom: 30%;
  left: -12px;
  transform: translateY(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: transparent rgba(0, 0, 0, 0.72) transparent transparent;
}
</style>
