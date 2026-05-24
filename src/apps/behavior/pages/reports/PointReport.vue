<template>
  <div class="point-tab-content-wrap" ref="scrollContArea">
    <div ref="scrollTop" class="scroll-top" @click="moveScrollTop">
      <i class="bh-icon-arrowup-32"></i>
    </div>
    <div class="point-tab-content">
      <div :style="{ display: request.keyword === null ? 'flex' : 'none' }" class="left">
        <div class="card-wrap">
          <p class="card-title">포인트 누적 점수</p>
          <div class="card-content-wrap">
            <div class="card-content">
              <div class="cumulative">
                <div class="point-card">
                  <i class="good"></i>
                  <div class="point good">
                    <span class="type">좋음</span>
                    <span class="score">{{ total.positivePoint }}</span>
                  </div>
                </div>
                <i class="minus"></i>
                <div class="point-card">
                  <i class="bad"></i>
                  <div class="point bad">
                    <span class="type">노력</span>
                    <span class="score">{{ total.negativePoint }}</span>
                  </div>
                </div>
                <i class="equal"></i>
                <div class="point-card">
                  <i class="total"></i>
                  <div class="point total">
                    <span class="type icon">
                      총점 <i></i>
                      <div class="total-tooltip">조회한 기간의 좋음 점수에서<br />노력 점수를 뺀 점수를 표시합니다.</div>
                    </span>
                    <span class="score">{{ total.totalPoint }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-wrap">
          <p class="card-title">포인트별 점수 통계</p>
          <div class="card-content-wrap">
            <div class="card-content">
              <div class="point-chart-wrap">
                <template v-if="(total.positivePoint || 0) !== 0 || (total.negativePoint || 0) !== 0">
                  <div class="doughnut-wrap">
                    <Doughnut class="point-chart" :chart-data="chartData" :chart-options="chartOptions" />
                    <div class="center-text">
                      <span>좋음</span>
                      {{ percent }}%
                    </div>
                    <div class="custom-legend">
                      <span class="legend-item good"> <span class="circle"></span> 좋음 </span>
                      <span class="legend-item bad"> <span class="circle"></span> 노력 </span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="no-data-bg" style="height: 240px; display: flex; align-items: center; justify-content: center">
                    <div class="nodata">지급한 포인트가 없습니다.</div>
                  </div>
                </template>
              </div>
              <transition name="fade-expand">
                <template v-if="isExtend">
                  <div v-if="isGoodCategory" class="point-category-wrap">
                    <div class="category-title-warp">
                      <i class="good"></i>
                      <p>좋음</p>
                    </div>
                    <div class="grid-wrap">
                      <div v-if="goodPoints.length === 0" class="nodata">지급한 포인트가 없습니다.</div>
                      <point-total-card
                        v-for="goodPoint of goodPoints"
                        :key="goodPoint.pointId"
                        :classroomId="classroomId"
                        :point="goodPoint"
                        :params="request"
                      />
                    </div>
                  </div>
                </template>
              </transition>
              <transition name="fade-expand">
                <template v-if="isExtend">
                  <div v-if="isBadCategory" class="point-category-wrap">
                    <div class="category-title-warp">
                      <i class="bad"></i>
                      <p>노력</p>
                    </div>
                    <div class="grid-wrap">
                      <div v-if="badPoints.length === 0" class="nodata">지급한 포인트가 없습니다.</div>
                      <point-total-card
                        v-for="badPoint of badPoints"
                        :key="badPoint.pointId"
                        :classroomId="classroomId"
                        :point="badPoint"
                        :params="request"
                      />
                    </div>
                  </div>
                </template>
              </transition>
              <div ref="scrollPointAccess"></div>
            </div>
            <div v-if="isAllSearch" class="card-footer cursor-pointer" @click="toggleExtend">
              <p>{{ isExtendString }}</p>
              <span :class="{ on: isExtend }"></span>
            </div>
          </div>
        </div>
        <div class="card-wrap" :style="{ display: isAllSearch ? 'flex' : 'none' }">
          <div class="card-title-wrap">
            <p class="card-title">학생별 현황</p>
            <span class="sort-warp cursor-pointer" @click="openStuentSort">
              <i class="bh-icon-drawnup-20"></i>
              {{ studentSortString }}
              <ul v-if="isOpenStuentSort" class="student cursor-pointer" v-click-outside="closeStudentSort">
                <li @click="changeStudentSort('studentNo')">번호순</li>
                <li @click="changeStudentSort('positive')">좋음 높은 순</li>
                <li @click="changeStudentSort('negative')">노력 높은 순</li>
                <li @click="changeStudentSort('total')">총점 높은 순</li>
              </ul>
            </span>
          </div>
          <div class="card-content-wrap">
            <div class="card-content">
              <table>
                <colgroup>
                  <col />
                  <col style="width: 110px" />
                  <col style="width: 110px" />
                  <col style="width: 110px" />
                </colgroup>
                <thead>
                  <tr>
                    <th>학생명</th>
                    <th class="good">좋음</th>
                    <th class="bad">노력</th>
                    <th class="total">총점</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="students.length !== 0">
                    <tr v-for="item of students" :key="item.studentId" @click="goStudentReport(item.studentId)" class="cursor-pointer">
                      <td class="name">
                        <span class="num">{{ item.studentNo }}</span>
                        <p class="std-name" :style="{ color: item.isHidden ? '#9e9e9e' : '' }">{{ getName(item) }}</p>
                      </td>
                      <td class="good">{{ item.positivePoint }}</td>
                      <td class="bad">{{ item.negativePoint }}</td>
                      <td class="total">{{ item.totalPoint }}</td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td colspan="4" style="border: 0px">
                        <div class="no-data-bg">
                          <div class="nodata">
                            <i class="bh-icon-warning-circle-fill-52"></i>
                            <p class="mt-10">등록된 학생이 없습니다.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
              <div ref="scrollStudentAccess"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="card-wrap">
          <div class="card-title-wrap">
            <p v-if="request.keyword === null" class="card-title">포인트 지급 내역</p>
            <!-- <div v-else class="keyword-search-wrap">
              <span class="keyword">
                {{ `‘${keywordString}’` }}
              </span>
              <span>{{ `검색 결과 ${reward.page.totalElements}건` }}</span>
            </div> -->
            <span v-if="request.keyword === null" class="excel cursor-pointer" @click="onClickExceldownload"><i></i>엑셀 다운로드 </span>
          </div>
          <div class="card-content-wrap" :class="{ 'mt-00': request.keyword !== null }">
            <div class="card-content">
              <div class="card-content-top mb-00">
                <div>
                  <div class="category-wrap" v-if="request.keyword === null">
                    <span @click="changeRewardIsNegative(null)" class="cursor-pointer" :class="{ on: rewardIsNegative === null }"> 전체 </span>
                    <span @click="changeRewardIsNegative(false)" class="cursor-pointer" :class="{ on: rewardIsNegative === false }"> 좋음 </span>
                    <span @click="changeRewardIsNegative(true)" class="cursor-pointer" :class="{ on: rewardIsNegative }"> 노력 </span>
                  </div>
                </div>
                <p class="right-btn">
                  <span class="sort-warp cursor-pointer" @click="openRewardSort">
                    <i class="bh-icon-drawnup-20"></i>
                    {{ rewardSortString }}
                    <ul class="cursor-pointer" v-if="isOpenRewardSort" v-click-outside="closeRewardSort">
                      <li @click="changeRewardSort('latest')">최근순</li>
                      <li @click="changeRewardSort('registration')">지급순</li>
                    </ul>
                  </span>
                  <span
                    v-if="request.keyword === null"
                    class="del-warp cursor-pointer"
                    :class="{ deldis: rewards.length === 0 }"
                    @click="openDeleteAllRewardsConfirmPopup"
                  >
                    <i></i>
                    전체 삭제
                  </span>
                </p>
              </div>
              <template v-if="rewards.length === 0">
                <div class="no-data-bg">
                  <div class="nodata">
                    <i class="bh-icon-warning-circle-fill-52"></i>
                    <p class="mt-10">{{ nodataText }}</p>
                  </div>
                </div>
              </template>

              <template v-else>
                <div
                  class="date-group-wrap"
                  v-for="(key, idx) of Object.keys(rewardGroupData)"
                  :key="key"
                  :class="{ 'mt-00': request.keyword !== null && idx === 0 }"
                >
                  <span class="date">{{ key }}</span>
                  <ul>
                    <point-paid-table-row
                      v-for="item of rewardGroupData[key]"
                      :key="`${request.studentId || item.studentId}-${item.rewardId}-${item.pointId}-${item.sortNo}`"
                      :point="item"
                      :isAll="isAllSearch"
                      :isSearch="request.keyword !== null"
                      :classroomId="classroomId"
                      :studentId="request.studentId || item.studentId"
                      @delete="openConfirmPopup"
                    />
                  </ul>
                </div>
              </template>
              <div ref="scrollRewardAccess"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <toast-type01 v-if="toastMessageModal.open === true" :item="toastMessageModal" />
    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { Doughnut } from 'vue-chartjs/legacy';
import PointTotalCard from '@/apps/behavior/components/list/PointTotalCard.vue';
import PointPaidTableRow from '@/apps/behavior/components/list/PointPaidTableRow.vue';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import XLSX from 'xlsx';
import { ExcelSettings, ExcelSettingsBuilder } from '@/apps/excel/exceljs-utils';
import { postClassroomReportPointRewardsExcel } from '@hiclass/core';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels);

export default {
  name: 'point-report',
  components: { PointPaidTableRow, PointTotalCard, ConfirmModal, ToastType01, Doughnut },
  props: {
    request: Object,
    classroomId: String,
    targetStudentName: String,
  },
  data() {
    return {
      isExtend: false,
      rewardIsNegative: null,
      isOpenStuentSort: false,
      isOpenRewardSort: false,
      studentSort: 'studentNo',
      rewardSort: 'latest',
      total: {},
      point: {
        list: [],
        page: {},
      },
      student: {
        list: [],
        page: {},
      },
      reward: {
        list: [],
        page: {},
      },
      pointObsRef: null,
      pointObserver: null,
      studentObsRef: null,
      studentObserver: null,
      rewardObsRef: null,
      rewardObserver: null,
      confirmModal: {
        isOpen: false,
        title: '포인트 지급내역을 삭제하시겠습니까?',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '#F04F59',
        params: null,
        action: '',
      },
      toastMessageModal: {
        open: false,
        message: null,
        // top, bottom 둘다 null일 경우 세로한가운데 정렬 숫자만
        top: null,
        bottom: null,
        // left, right 둘다 null일 경우 가로한가운데 정렬 숫자만
        left: null,
        right: null,
        width: null, // null = 420px 숫자만
        height: null, // null = 66px 숫자만
        align: 'center', // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right
      },
      blockingRequest: true,
    };
  },
  computed: {
    nodataText: function () {
      return this.request.keyword === null ? '내역이 없습니다.' : '검색결과가 없습니다.';
    },
    keywordString: function () {
      return this.request.keyword.display ? this.request.keyword.display : this.request.keyword.content;
    },
    studentSortString: function () {
      const type = {
        studentNo: '번호순',
        positive: '좋음 높은 순',
        negative: '노력 높은 순',
        total: '총점 높은 순',
      };
      return type[this.studentSort];
    },
    rewardSortString: function () {
      return this.rewardSort === 'latest' ? '최근순' : '지급순';
    },
    isAllSearch: function () {
      return this.request.studentId === null && this.request.keyword === null;
    },
    isExtendString: function () {
      return this.isExtend ? '접기' : '펼치기';
    },
    points: function () {
      return this.isExtend ? this.point.list : this.point.list.slice(0, 4);
    },
    goodPoints: function () {
      return this.points.filter((p) => !p.isNegative);
    },
    badPoints: function () {
      return this.points.filter((p) => p.isNegative);
    },
    isGoodCategory: function () {
      return this.points.length === 0 || this.goodPoints.length > 0;
    },
    isBadCategory: function () {
      return this.points.length === 0 || this.badPoints.length > 0;
    },
    students: function () {
      return this.student.list;
    },
    rewards: function () {
      return this.reward.list;
    },
    rewardGroupData: function () {
      const dates = this.rewards.map((r) => this.$moment(r.rewardTimestamp).format('YYYY. M. D'));
      const set = new Set(dates);

      const groupKeys = [...set];
      let groupData = {};
      groupKeys.forEach((key) => {
        groupData = { ...groupData, [key]: this.rewards.filter((r) => this.$moment(r.rewardTimestamp).format('YYYY. M. D') === key) };
      });

      return groupData;
    },
    // 좋음 포인트 비율
    percent() {
      return this.positiviePercent();
    },
    // 차트 데이터
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
        labels: ['좋음', '노력'],
        datasets: [
          {
            backgroundColor: ['#3987F8', '#F95F6E'],
            data: [pos || 0, neg || 0],
            borderWidth: borderWidth,
          },
        ],
      };
    },

    // 차트 옵션
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false, // 기본 툴팁 비활성화
            external: function (context) {
              // 커스텀 툴팁 DOM 생성/업데이트
              let tooltipEl = document.getElementById('chartjs-tooltip');
              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.className = 'my-tooltip';
                document.body.appendChild(tooltipEl);
              }
              // Hide if no tooltip
              const tooltipModel = context.tooltip;
              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }
              // Set text/html
              if (tooltipModel.body) {
                const dataPoint = tooltipModel.dataPoints[0];
                const label = dataPoint.label;
                const value = dataPoint.raw;
                const dataset = dataPoint.dataset.data;
                const total = dataset.reduce((a, b) => a + b, 0);
                const percent = total ? Math.round((value / total) * 100) : 0;
                tooltipEl.innerHTML = `
                <div class="my-tooltip-label">${label}</div>
                <div class="my-tooltip-value">${percent} %</div>
                `;
              }
              // Position
              const canvas = context.chart.canvas;
              const rect = canvas.getBoundingClientRect();
              tooltipEl.style.opacity = 1;
              tooltipEl.style.position = 'fixed';
              tooltipEl.style.left = rect.left + window.scrollX + tooltipModel.caretX + 'px';
              tooltipEl.style.top = rect.top + window.scrollY + tooltipModel.caretY + -10 + 'px';
              tooltipEl.style.pointerEvents = 'none';
            },
          },
          datalabels: {
            display: false,
          },
        },
      };
    },
  },
  watch: {
    request: {
      handler: async function (newVal, oldVal) {
        if (!this.blockingRequest) {
          if (newVal && newVal !== oldVal) {
            const params = {
              classroomId: this.classroomId,
              ...newVal,
            };
            if (newVal.studentId !== null) {
              this.isExtend = true;
            } else {
              this.isExtend = false;
            }

            this.moveScrollTop();

            await this.search(params);
          }
        }
      },
    },
    /*classroomId: {
            handler: async function (newVal, oldVal) {
                if(newVal && newVal !== oldVal){
                    await this.search({...this.request, classroomId: newVal})
                }
            }
        }*/
    'toastMessageModal.open'(v) {
      if (v === true) {
        setTimeout(async () => {
          this.toastMessageModal.open = false;
          this.toastMessageModal.message = null;
          this.toastMessageModal.btnName = null;
          this.toastMessageModal.bottom = null;
        }, 2300);
      }
    },
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomPointTotal: 'getClassroomPointTotal',
      getClassroomPointNameByTotal: 'getClassroomPointNameByTotal',
      getClassroomStudentByTotal: 'getClassroomStudentByTotal',
      getClassroomPointIssuedList: 'getClassroomPointIssuedList',
      getClassroomPointIssuedListSearch: 'getClassroomPointIssuedListSearch',
      deletePaidPoint: 'deletePaidPoint',
      deletePaidAllPoint: 'deletePaidAllPoint',
      deleteTargetPaidAllPoint: 'deleteTargetPaidAllPoint',
    }),
    moveScrollTop: function () {
      this.$refs.scrollContArea.scrollTo({ top: 0 });
    },
    getName: function (student) {
      const name = student.studentName.substring(0, 10);
      const hidden = student.isHidden ? '(숨김) ' : '';
      const ext = student.studentName.length > 10 ? '...' : '';
      return `${name}${hidden}${ext}`;
    },
    goStudentReport: function (id) {
      this.$emit('moveStudent', id);
      this.$nextTick(() => this.moveScrollTop());
    },
    openStuentSort: function () {
      this.isOpenStuentSort = !this.isOpenStuentSort;
    },
    closeStudentSort: function () {
      if (this.isOpenStuentSort) {
        this.isOpenStuentSort = false;
      }
    },
    changeStudentSort: async function (sort) {
      this.studentSort = sort;
      const params = { ...this.request, classroomId: this.classroomId };
      this.setStudent(await this.getClassroomStudentByTotal({ ...this.removeEmptyValue(params), sort: this.studentSort }));
      this.closeStudentSort();
    },
    openRewardSort: function () {
      this.isOpenRewardSort = !this.isOpenRewardSort;
    },
    closeRewardSort: function () {
      if (this.isOpenRewardSort) {
        this.isOpenRewardSort = false;
      }
    },
    changeRewardIsNegative: async function (isNegative) {
      this.rewardIsNegative = isNegative;
      const params = { ...this.request, classroomId: this.classroomId };
      this.setReward(
        await this.getClassroomPointIssuedList({ ...this.removeEmptyValue(params), sort: this.rewardSort, isNegative: this.rewardIsNegative })
      );
    },
    changeRewardSort: async function (sort) {
      this.rewardSort = sort;
      if (this.request.keyword === null) {
        const params = { ...this.request, classroomId: this.classroomId };
        this.setReward(
          await this.getClassroomPointIssuedList({ ...this.removeEmptyValue(params), sort: this.rewardSort, isNegative: this.rewardIsNegative })
        );
      } else {
        const { display, content } = this.request.keyword;
        let requestParams = {
          classroomId: this.classroomId,
          sort: this.rewardSort,
          size: 20,
        };
        if (display === null) {
          requestParams.keyword = content;
        } else {
          if (display.indexOf('#') !== 0) {
            requestParams.studentIds = [content];
          }
        }
        this.setClassroomReward(await this.getClassroomPointIssuedListSearch(this.removeEmptyValue(requestParams)));
      }
      this.closeRewardSort();
    },
    openConfirmPopup: function (params) {
      this.confirmModal = {
        ...this.confirmModal,
        isOpen: true,
        title: '포인트 지급내역을 삭제하시겠습니까?',
        description: '삭제된 내역은 복원이 불가합니다.',
        confirmButtonText: '삭제',
        params,
        action: 'select',
      };
    },
    openDeleteAllRewardsConfirmPopup: function () {
      if (this.rewards.length > 0) {
        this.confirmModal = {
          ...this.confirmModal,
          isOpen: true,
          title: `${this.request.studentId ? `‘${this.targetStudentName}’ 학생의 ` : ''}전체 지급내역을 삭제하시겠습니까?`,
          description: '<span style="color: #F04F59">지금까지 지급된 모든 포인트</span>를 삭제합니다.<br/>삭제된 포인트는 복원이 불가합니다.',
          confirmButtonText: '전체 삭제',
          params: null,
          action: 'all',
        };
      }
    },
    closeConfirmModal: async function (isConfirm) {
      if (isConfirm) {
        if (this.confirmModal.action === 'select') {
          await this.reomvePaidPoint(this.confirmModal.params);
        } else {
          await this.removeAllPaidPoints();
        }
        this.toastMessageModal.open = true;
        this.toastMessageModal.message = '삭제하였습니다.';
        this.toastMessageModal.bottom = 50;
      }
      this.confirmModal = {
        ...this.confirmModal,
        isOpen: false,
      };
    },
    removeAllPaidPoints: async function () {
      const res = this.request.studentId
        ? await this.deleteTargetPaidAllPoint({ classroomId: this.classroomId, studentId: this.request.studentId })
        : await this.deletePaidAllPoint({ classroomId: this.classroomId });

      if (res.status === 200) {
        this.reward = {
          list: [],
          page: {},
        };
      }

      if (this.request.keyword === null) {
        this.moveScrollTop();
        await this.search({ ...this.request, classroomId: this.classroomId });
      }
    },
    reomvePaidPoint: async function (params) {
      const res = await this.deletePaidPoint(this.removeEmptyValue(params));
      if (res.status === 200) {
        const list =
          this.request.keyword === null
            ? this.reward.list.filter((r) => `${r.pointId}-${r.rewardId}` !== `${params.pointId}-${params.rewardId}`)
            : this.reward.list.filter(
                (r) => `${r.studentId}-${r.pointId}-${r.rewardId}` !== `${params.studentId}-${params.pointId}-${params.rewardId}`
              );
        this.reward = {
          ...this.reward,
          list,
        };
      }

      if (this.request.keyword === null) {
        this.moveScrollTop();
        await this.search({ ...this.request, classroomId: this.classroomId });
      }
    },
    toggleExtend: function () {
      this.isExtend = !this.isExtend;
    },
    removeEmptyValue: function (params) {
      if (!params) return {};

      const returnParams = {};

      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null) {
          returnParams[key] = params[key];
        }
      });

      return returnParams;
    },
    search: async function (params) {
      if (params.keyword === null) {
        this.total = await this.getClassroomPointTotal(this.removeEmptyValue(params));
        this.setPoint(await this.getClassroomPointNameByTotal(this.removeEmptyValue(params)));

        if (params.studentId === null) {
          this.setStudent(
            await this.getClassroomStudentByTotal({ ...this.removeEmptyValue(params), sort: this.studentSort, isNegative: this.rewardIsNegative })
          );
        }
        this.setReward(
          await this.getClassroomPointIssuedList({ ...this.removeEmptyValue(params), sort: this.rewardSort, isNegative: this.rewardIsNegative })
        );
      } else {
        const { display, content } = params.keyword;
        let requestParams = {
          classroomId: params.classroomId,
          sort: this.rewardSort,
          size: 20,
        };
        if (!display) {
          requestParams.keyword = content;
        } else {
          if (display.indexOf('#') !== 0) {
            requestParams.studentIds = [content];
          }
        }
        this.setClassroomReward(await this.getClassroomPointIssuedListSearch({ ...this.removeEmptyValue(requestParams), sort: this.rewardSort }));
      }
    },
    setPoint: function (response) {
      const { _embedded, page } = response;
      if (page.number === 0) {
        this.point.page = page;
      } else {
        if (page.totalElements > 1) {
          this.point.page = page;
        }
      }
      const orgIds = this.point.list.map((p) => p.pointId);
      const list = _embedded ? _embedded.points : [];
      this.point.list = page.number === 0 ? list : [...this.point.list, ...list.filter((o) => !orgIds.includes(o.pointId))];
    },
    setStudent: function (response) {
      const { _embedded, page } = response;
      if (page.number === 0) {
        this.student.page = page;
      } else {
        if (page.totalElements > 1) {
          this.student.page = page;
        }
      }
      const orgIds = this.student.list.map((p) => p.studentId);
      const list = _embedded ? _embedded.studentPoints : [];
      this.student.list = page.number === 0 ? list : [...this.student.list, ...list.filter((o) => !orgIds.includes(o.studentId))];
    },
    setReward: function (response) {
      const { _embedded, page } = response;
      const list = _embedded ? _embedded.rewards : [];
      if (page.number === 0) {
        this.reward.page = page;
      } else {
        if (list.length > 0) {
          this.reward.page = page;
        }
      }
      this.reward.list = page.number === 0 ? list : [...this.reward.list, ...list];

      // 키워드로 검색할 때, 키워드 요약 정보를 부모 컴포넌트에 전달
      if (this.request && this.request.keyword !== null && page && page.number === 0) {
        this.$emit('updateSearchSummary', {
          tab: 'point-report',
          keywordString: this.keywordString,
          totalCount: page.totalElements || 0,
        });
      }

      /*const orgIds = this.request.keyword !== null 
                ? this.reward.list.map(p => `${p.studentId}-${p.rewardId}-${p.pointId}`)
                : this.reward.list.map(p => `${p.rewardId}-${p.pointId}`)
            const list = _embedded 
                ? this.request.keyword !== null 
                    ? _embedded.rewards.filter(o => !orgIds.includes(`${o.studentId}-${o.rewardId}-${o.pointId}`)) 
                    : _embedded.rewards.filter(o => !orgIds.includes(`${o.rewardId}-${o.pointId}`)) 
                : []
            this.reward.list = page.number === 0
                ? _embedded ? _embedded.rewards : []
                : [...this.reward.list, ...list]  */
    },
    setClassroomReward: function (response) {
      const { _embedded, page } = response;
      const list = _embedded ? _embedded.classroomRewards : [];
      if (page.number === 0) {
        this.reward.page = page;
      } else {
        if (list.length > 0) {
          this.reward.page = page;
        }
      }
      this.reward.list = page.number === 0 ? list : [...this.reward.list, ...list];

      // 키워드로 검색할 때, 키워드 요약 정보를 부모 컴포넌트에 전달
      if (this.request && this.request.keyword !== null && page && page.number === 0) {
        this.$emit('updateSearchSummary', {
          tab: 'point-report',
          keywordString: this.keywordString,
          totalCount: page.totalElements || 0,
        });
      }
      /*const orgIds = this.reward.list.map(p => `${p.rewardId}-${p.pointId}`)
            const list = _embedded ? _embedded.classroomRewards : []
            this.reward.list = page.number === 0
                ? [...list]
                : [...this.reward.list, ...list.filter(o => !orgIds.includes(`${o.rewardId}-${o.pointId}`))]  */
    },
    visibleScrollTopButton: function () {
      const recordListEl = this.$refs.scrollContArea;
      const recordListScrollTopEl = this.$refs.scrollTop;
      recordListEl.addEventListener('scroll', (e) => {
        if (e.target.scrollTop > 30) {
          recordListScrollTopEl.style.display = 'flex';
        } else {
          recordListScrollTopEl.style.display = 'none';
        }
      });
    },
    scrollObserver: function () {
      this.$nextTick(function () {
        const option = {
          root: null,
          rootMargin: '0px',
          threshold: 1,
        };

        const optionStudentArea = {
          root: this.$refs.scrollContArea,
          rootMargin: '52px',
          threshold: 1,
        };

        const optionRewardArea = {
          root: this.$refs.scrollContArea,
          rootMargin: '100px',
          threshold: 1,
        };

        const pointCallback = async ([entry]) => {
          if (entry.isIntersecting && this.isExtend && this.request.keyword === null) {
            const params = {
              ...this.request,
              classroomId: this.classroomId,
              page: this.point.page.number + 1,
            };
            this.setPoint(await this.getClassroomPointNameByTotal(this.removeEmptyValue(params)));
          }
        };
        const studentCallback = async ([entry]) => {
          if (entry.isIntersecting && this.isAllSearch) {
            const params = {
              ...this.request,
              classroomId: this.classroomId,
              page: this.student.page.number + 1,
              sort: this.studentSort,
            };
            this.setStudent(await this.getClassroomStudentByTotal(this.removeEmptyValue(params)));
          }
        };
        const rewardCallback = async ([entry]) => {
          if (entry.isIntersecting) {
            if (this.request.keyword === null) {
              const params = {
                ...this.request,
                classroomId: this.classroomId,
                page: this.reward.page.number + 1,
                sort: this.rewardSort,
                isNegative: this.rewardIsNegative,
              };
              this.setReward(await this.getClassroomPointIssuedList(this.removeEmptyValue(params)));
            } else {
              const { display, content } = this.request.keyword;
              let requestParams = {
                classroomId: this.classroomId,
                size: 20,
                page: this.reward.page.number + 1,
              };
              if (display == null) {
                requestParams.keyword = content;
              } else {
                if (display.indexOf('#') !== 0) {
                  requestParams.studentIds = [content];
                }
              }
              this.setClassroomReward(await this.getClassroomPointIssuedListSearch(this.removeEmptyValue(requestParams)));
            }
          }
        };

        this.pointObserver = new IntersectionObserver(pointCallback, option);
        this.pointObserver.observe(this.pointObsRef);

        this.studentObserver = new IntersectionObserver(studentCallback, optionStudentArea);
        this.studentObserver.observe(this.studentObsRef);

        this.rewardObserver = new IntersectionObserver(rewardCallback, optionRewardArea);
        this.rewardObserver.observe(this.rewardObsRef);
      });
    },

    async onClickExceldownload() {
      const params = {
        userId: localStorage.uuid,
        sort: this.rewardSort,
        month: this.request.month,
        dateStart: this.request.dateStart,
        dateEnd: this.request.dateEnd,
      };
      if (this.request.studentId !== null) {
        params.studentIds = [this.request.studentId];
      }
      const res = await postClassroomReportPointRewardsExcel(this.classroomId, params);
      this.downloadExcel(res._embedded.points);
    },

    async downloadExcel(data) {
      let headerNameList = ['지급일시', '이름', '포인트 종류', '포인트 점수', '포인트 명', '메모'];

      const sbSettings = ExcelSettingsBuilder.with();
      sbSettings.addSheet('포인트 지급내역');
      sbSettings.setHeaders(headerNameList);

      let excelData = [];
      // 내용 배열
      data.map((item, index) => {
        let row = Array.from({
          length: 6,
          0: this.$moment(item.rewardTimestamp).format('YYYY-MM-DD hh:mm'),
          1: item.studentName,
          2: item.isNegative ? '노력' : '좋음',
          3: item.point,
          4: item.pointName,
          5: item.memo,
        });
        excelData.push(row);
      });

      sbSettings.addRows(excelData);
      sbSettings.applyAutoFitWithMax({
        1: { fixed: 16 },
        2: { max: 18 },
        3: { fixed: 12 },
        4: { fixed: 12 },
        5: { max: 18 },
        6: { max: 18 },
      });
      sbSettings.withClassroomReport();
      await sbSettings.export(this.$moment().format('포인트지급내역_YYYYMMDD_HHmmss'));
    },

    positiviePercent() {
      const pos = this.total.positivePoint || 0;
      const neg = this.total.negativePoint || 0;
      const sum = pos + neg;
      if (!sum) return 0;
      return Math.ceil((pos / sum) * 100);
    },
    applyRouteQuery() {
      this.blockingRequest = true;
      const query = this.$route.query;
      const target = this.request;
      Object.keys(query).forEach((key) => {
        if (key in target) {
          target[key] = query[key];
        }
      });
      if (this.request.studentId !== null) {
        this.isExtend = true;
      } else {
        this.isExtend = false;
      }
      this.blockingRequest = false;
    },
  },
  async created() {
    this.applyRouteQuery();
    await this.search({ ...this.request, classroomId: this.classroomId });
    this.$nextTick(() => {
      this.scrollObserver();
      this.visibleScrollTopButton();
    });
  },
  mounted() {
    this.pointObsRef = this.$refs.scrollPointAccess;
    this.studentObsRef = this.$refs.scrollStudentAccess;
    this.rewardObsRef = this.$refs.scrollRewardAccess;
  },
};
</script>

<style scoped lang="scss">
.n-text {
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: calc(100% - 10px);
}
.point.total .type.icon {
  display: flex;
  gap: 2px;
  position: relative;
}
.point.total .type.icon i {
  width: 14px !important;
  height: 14px !important;
  background: url('../../../../assets/img/icon/ic_question_circle_fill_14.svg');
}
.point.total .type.icon i:hover {
  background: url('../../../../assets/img/icon/ic_question_circle_fill_14_hover.svg');
}
.point.total .type.icon i:hover ~ .total-tooltip {
  display: flex;
}
.total-tooltip {
  display: none;
  color: #fff;
  width: 189px;
  height: 60px;
  top: -70px;
  left: -70px;
  padding: 12px;
  border-radius: 4px;
  gap: 10px;
  background: #030303;
  position: absolute;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.point-chart-wrap {
  width: 100%;
  padding-bottom: 25px;
  .doughnut-wrap {
    display: flex;
    justify-content: center;
    position: relative;
    gap: 52px;
    align-items: center;
    .point-chart {
      width: 240px;
      height: 240px;
      margin-left: 30px;
    }
    .center-text {
      position: absolute;
      top: 50%;
      left: calc(50% - 30px);
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
      display: flex;
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
.fade-expand-enter-active,
.fade-expand-leave-active {
  transition: opacity 0.3s, max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.fade-expand-enter,
.fade-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.fade-expand-enter-to,
.fade-expand-leave {
  opacity: 1;
  max-height: 1000px;
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
  content: '';
  position: absolute;
  bottom: 30%;
  left: -12px;
  transform: translateY(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: transparent rgba(0, 0, 0, 0.72) transparent transparent;
}
</style>