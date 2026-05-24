<!--
@File(Method): ReportHistory.vue
@Date Created: 2025-11-28
@Description: 학급기록 > 학생 리포트 > 리포트 내역
-->
<template>
  <div class="report-history-tab-content">
    <div class="tab-content-header j-right">
      <!-- <div class="record-search-result-wrap">
        <div v-if="!isOterFilterAble">
          <span class="search-keyword">{{ `‘${keywordString}’` }}</span>
          <span>{{ `검색 결과 ${totalCount}건` }}</span>
        </div>
      </div> -->
      <div class="action-wrap">
        <span v-if="isOterFilterAble" class="pdf" :class="{ 'on cursor-pointer': deletedIds.length !== 0 }" @click="downloadZipReports">
          <i></i>pdf 다운로드
        </span>
        <span
          v-if="isOterFilterAble"
          class="hitalk"
          :class="{ 'on cursor-pointer': deletedIds.length !== 0 }"
          @click="openHitalkShareModalForSelectedReports"
        >
          <i></i>하이톡 공유</span
        >
        <span @click="onClickSelectDelete" class="delete" :class="{ 'on cursor-pointer': deletedIds.length !== 0 }"> <i></i>선택 삭제 </span>
        <span v-if="isOterFilterAble" @click="isOpenReportWriteModal = true" class="add cursor-pointer"> <i></i>리포트 생성 </span>
      </div>
    </div>
    <div class="tab-table-wrap" ref="scrollContArea">
      <div ref="scrollTop" class="scroll-top" @click="moveScrollTop">
        <i class="bh-icon-arrowup-32"></i>
      </div>
      <table>
        <colgroup>
          <col style="width: 40px" />
          <col style="width: 240px" />
          <col style="width: 530px" />
          <col style="width: 240px" />
          <col style="width: 240px" />
          <col style="width: 110px" />
        </colgroup>
        <thead>
          <tr>
            <th>
              <input type="checkbox" id="allCheck" :checked="isAllChecked" @change="toggleAllCheck" />
              <label for="allCheck"></label>
            </th>
            <th class="cursor-pointer">
              <div @click="onClickSortStudentName">
                학생명
                <i
                  class="sort down ml-05"
                  :class="{
                    on: params.sort === 'number',
                    down: params.sort === 'number' && params.direction === 'DESC',
                    up: params.sort !== 'number' || (params.sort === 'number' && params.direction === 'ASC'),
                  }"
                >
                </i>
              </div>
            </th>
            <th class="cursor-pointer">
              <div @click="onClickSortTitle">
                제목
                <i
                  class="sort down ml-05"
                  :class="{
                    on: params.sort === 'title',
                    down: params.sort === 'title' && params.direction === 'DESC',
                    up: params.sort !== 'title' || (params.sort === 'title' && params.direction === 'ASC'),
                  }"
                >
                </i>
              </div>
            </th>
            <th class="cursor-pointer">
              <div @click="onClickSortPeriod">
                리포트 기간
                <i
                  class="sort down ml-05"
                  :class="{
                    on: params.sort === 'period',
                    down: params.sort === 'period' && params.direction === 'DESC',
                    up: params.sort !== 'period' || (params.sort === 'period' && params.direction === 'ASC'),
                  }"
                >
                </i>
              </div>
            </th>
            <th class="cursor-pointer">
              <div @click="onClickSortLatest(false)">
                생성일시
                <i
                  class="sort down ml-05"
                  :class="{
                    on: params.sort === 'latest',
                    down: params.sort === 'latest' && params.direction === 'DESC',
                    up: params.sort !== 'latest' || (params.sort === 'latest' && params.direction === 'ASC'),
                  }"
                >
                </i>
              </div>
            </th>
            <th>
              <div>공유하기</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="records.length === 0">
            <tr>
              <td colspan="6">
                <div class="no-data-bg">
                  <span class="no-data">
                    <i class="bh-icon-warning-circle-fill-52"></i>
                    <span>내역이 없습니다.</span>
                  </span>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="record in records" :key="record.reportId">
              <td class="txt-center">
                <input
                  type="checkbox"
                  :id="record.reportId"
                  :checked="deletedIds.includes(record.reportId)"
                  @change="toggleRowCheck(record.reportId)"
                />
                <label :for="record.reportId"></label>
              </td>
              <td>
                <div class="student-info" @click="openAddRecored('REPORT_HISTORY', record.reportId)">
                  <span class="num">{{ record.studentNo }}</span>
                  <span class="name"> {{ record.studentName }} </span>
                </div>
              </td>
              <td>
                <div @click="openAddRecored('REPORT_HISTORY', record.reportId)" class="subject">{{ record.reportName }}</div>
              </td>
              <td>
                <div class="center" @click="openAddRecored('REPORT_HISTORY', record.reportId)">
                  {{ $moment(record.dateStartTimestamp).format('YYYY.MM.DD') }} ~ {{ $moment(record.dateEndTimestamp).format('YYYY.MM.DD') }}
                </div>
              </td>
              <td>
                <div class="center" @click="openAddRecored('REPORT_HISTORY', record.reportId)">
                  {{ $moment(record.insertedTimestamp).format('YYYY.MM.DD HH:mm') }}
                </div>
              </td>
              <td>
                <div class="center">
                  <button class="btn-pdf" @click="downloadPdfReport(record)">
                    <i class="pdf"></i>
                  </button>
                  <button class="btn-pdf" @click="openHitalkShareModal(record)">
                    <i class="hitalk"></i>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div ref="scrollListAccess"></div>
    </div>
    <!-- 리포트 작성 모달 -->
    <point-report-write-modal
      v-if="isOpenReportWriteModal === true"
      @close="isOpenReportWriteModal = false"
      @createComplete="onCreateComplete"
      @startCreateReport="onStartCreateReport"
      :classroomId="classroomId"
    />

    <!-- 하이톡 공유하기 모달 -->
    <hitalk-share-modal
      v-if="hitalkShareIsOpen"
      :postType="'CLASSROOM_REPORT'"
      :post="hitalkShareModel"
      @controlHitalkShareModal="controlHitalkShareModal"
    >
    </hitalk-share-modal>

    <div ref="renderPdf" style="position: absolute; left: -9999px; top: -9999px; width: 700px">
      <ReportHistoryDetailPdfTemplate
        v-if="renderPdf.reportId"
        :key="renderPdf.reportId"
        :reportId="renderPdf.reportId"
        :classroomId="renderPdf.classroomId"
        @reportHistoryDetailReady="$emit('reportHistoryDetailReady')"
      />
    </div>

    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :isAlert="confirmModal.isAlert"
      :description="confirmModal.description"
      :cancelButtonText="confirmModal.cancelButtonText"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>

<script>
import PointReportWriteModal from '@/apps/behavior/components/popup/PointReportWriteModal.vue';
import ReportHistoryDetailPdfTemplate from '@/apps/behavior/pages/reports/ReportHistoryDetailPdfTemplate.vue';
import { postClassroomReportsStudents, putClassroomReportStudents } from '@hiclass/core';
import { mapActions, mapState, mapMutations } from 'vuex';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import HitalkShareModal from '@/components/HitalkShare/HitalkShareModal';
import jszip from 'jszip';
import { PdfManager } from '@/apps/pdf/pdfjs-utils';
import { eventBus } from '@/main';

export default {
  name: 'report-history',
  components: { PointReportWriteModal, HitalkShareModal, ConfirmModal, ReportHistoryDetailPdfTemplate },
  props: {
    request: Object,
    classroomId: String,
  },
  data() {
    return {
      hitalkShareIsOpen: false,
      isOpenReportWriteModal: false,
      hitalkShareModel: {
        reportId: '',
        classRoomId: '',
        title: '학생 리포트',
        content: '활동 내역을 확인해주세요!',
      },
      params: {
        sort: 'latest',
        direction: 'DESC',
        userId: localStorage.uuid,
      },
      observer: null,
      totalCount: 0,
      pageNumber: 0,
      records: [],
      deletedIds: [],
      confirmModal: {
        isOpen: false,
        title: '',
        isAlert: false,
        description: '',
        cancelButtonText: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        action: null,
      },
      renderPdf: {
        reportId: null,
        classroomId: null,
      },
      blockingRequest: true,
    };
  },
  watch: {
    request: {
      handler: async function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          const params = {
            ...newVal,
            ...this.params,
          };
          if (this.request.studentId != null) {
            params.studentIds = [this.request.studentId];
          } else {
            params.studentIds = null;
          }

          if (this.request.keyword != null) {
            if (this.request.keyword.display === null) {
              params.keyword = this.request.keyword.content;
            } else {
              if (this.request.keyword.display.indexOf('#') !== 0) {
                params.studentIds = [this.request.keyword.content];
                params.keyword = null;
              } else {
                params.keyword = null;
              }
            }
          } else {
            params.keyword = null;
          }

          if (this.blockingRequest) return;
          this.pageNumber = 0;
          const res = await postClassroomReportsStudents(this.classroomId, this.pageNumber, params);
          this.totalCount = res.page.totalElements;
          this.records = res._embedded.reports;
          // 키워드로 검색할 때, 키워드 요약 정보를 부모 컴포넌트에 전달
          if (this.request.keyword) {
            this.$emit('updateSearchSummary', {
              keywordString: this.keywordString,
              totalCount: this.totalCount,
            });
          }
        }
      },
    },
    classroomId: {
      handler: async function (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.pageNumber = 0;
          // this.request.studentId = null;
          await this.search();
        }
      },
    },
  },
  computed: {
    isAllChecked() {
      return this.records.length > 0 && this.deletedIds.length === this.records.length;
    },
    keywordString: function () {
      return this.request.keyword.display ? this.request.keyword.display : this.request.keyword.content;
    },
    isOterFilterAble: function () {
      return this.request.keyword === null;
    },
  },
  methods: {
    ...mapActions('storeHitalk', {
      connectStompClient: 'connectStompClient',
      disconnectStompClient: 'disconnectStompClient',
      callChatUserList: 'callChatUserList',
      callChatRooms: 'callChatRooms',
    }),

    ...mapMutations({
      setIsFileLoading: 'setIsFileLoading',
    }),

    closeConfirmModal: async function (isConfirm) {
      this.confirmModal.isOpen = false;
      if (isConfirm) {
        if (this.confirmModal.action === 'delete') {
          try {
            const params = {
              userId: localStorage.uuid,
              reportIds: this.deletedIds,
            };
            await putClassroomReportStudents(this.classroomId, params);
            this.records = this.records.filter((r) => !this.deletedIds.includes(r.reportId));
            this.totalCount = this.totalCount - this.deletedIds.length;
            this.deletedIds = [];
          } catch (error) {
            this.confirmModal.description = null;
            this.confirmModal.isAlert = true;
            this.confirmModal.title = '요청 처리 중 오류가 발생했습니다.';
            this.confirmModal.confirmButtonText = '확인';
            this.confirmModal.confirmButtonColor = '#f04f59';
            this.confirmModal.action = null;
            this.confirmModal.isOpen = true;
          }
        }
      }
    },

    onStartCreateReport() {
      this.$store.commit('setIsDimLoading', true);
    },

    onCreateComplete(reload) {
      this.$store.commit('setIsDimLoading', false);
      if (reload) {
        this.onClickSortLatest(true);
      }
    },
    //전체 체크
    toggleAllCheck() {
      if (this.isAllChecked) {
        this.deletedIds = [];
      } else {
        this.deletedIds = this.records.map((r) => r.reportId);
      }
    },
    //개별 체크
    toggleRowCheck(id) {
      const idx = this.deletedIds.indexOf(id);
      if (idx > -1) {
        this.deletedIds.splice(idx, 1);
      } else {
        this.deletedIds.push(id);
      }
    },

    //리포트 내역 상세 모달
    openAddRecored: function (page, reportId) {
      this.$emit('selectedReportId', reportId);
      this.$emit('openAdd', page);
    },

    toggleDirection() {
      const prevDirection = this.params.direction;
      if (prevDirection === 'DESC') {
        this.params.direction = 'ASC';
      } else {
        this.params.direction = 'DESC';
      }
    },

    setDefaultDirection() {
      this.params.direction = 'DESC';
    },

    changeSort(newSort, forceDirection) {
      const prevSort = this.params.sort;
      if (prevSort === newSort && forceDirection === false) {
        this.toggleDirection();
      } else {
        this.params.sort = newSort;
        this.setDefaultDirection();
      }
      this.pageNumber = 0;
      this.deletedIds = [];
      this.search();
    },

    onClickSortStudentName() {
      this.changeSort('number', false);
    },

    onClickSortTitle() {
      this.changeSort('title', false);
    },

    onClickSortPeriod() {
      this.changeSort('period', false);
    },

    onClickSortLatest(forceDirection) {
      this.changeSort('latest', forceDirection);
    },

    async onClickSelectDelete() {
      if (this.deletedIds.length == 0) return;
      this.confirmModal.isAlert = false;
      this.confirmModal.title = '선택한 리포트를 삭제하시겠습니까?';
      this.confirmModal.description = '삭제된 내역은 복원이 불가합니다.';
      this.confirmModal.confirmButtonText = '예';
      this.confirmModal.cancelButtonText = '아니오';
      this.confirmModal.confirmButtonColor = '#f04f59';
      this.confirmModal.action = 'delete';
      this.confirmModal.isOpen = true;
    },

    async downloadZipReports() {
      if (this.deletedIds.length === 0) return;
      this.setIsFileLoading(true);
      const reports = this.records.filter((r) => this.deletedIds.includes(r.reportId));

      const zip = new jszip();

      var index = 1;
      for (const r of reports) {
        this.renderPdf.reportId = r.reportId;
        this.renderPdf.classroomId = this.classroomId;

        await this.$nextTick();
        await new Promise((resolve) => this.$once('reportHistoryDetailReady', resolve));

        this.pointNameTruncateText();

        const pdfBlob = await PdfManager.blob(this.$refs.renderPdf);
        this.renderPdf.reportId = null;
        this.renderPdf.classroomId = null;
        zip.file(`${r.studentName}_${index}.pdf`, pdfBlob);
        index++;
      }
      zip.generateAsync({ type: 'blob' }).then((zipFile) => {
        saveAs(zipFile, '리포트_묶음.zip');
      });
      this.setIsFileLoading(false);
    },

    async downloadPdfReport(selectReport) {
      this.renderPdf.reportId = selectReport.reportId;
      this.renderPdf.classroomId = this.classroomId;

      await this.$nextTick();
      await new Promise((resolve) => this.$once('reportHistoryDetailReady', resolve));

      this.pointNameTruncateText();

      PdfManager.save(this.$refs.renderPdf, `${selectReport.studentName}`);

      this.renderPdf.reportId = null;
      this.renderPdf.classroomId = null;
    },

    pointNameTruncateText() {
      this.$refs.renderPdf.querySelectorAll('p.point-name').forEach((el) => {
        this.truncateText(el);
      });
    },

    truncateText(el) {
      const original = el.innerText;
      let text = original;

      while (el.scrollWidth > el.clientWidth) {
        text = text.slice(0, -1);
        el.innerText = text + '…';
      }
    },

    async openHitalkShareModalForSelectedReports() {
      if (this.deletedIds.length === 0) return;

      const reports = this.records.filter((r) => this.deletedIds.includes(r.reportId));
      this.hitalkShareModel = {
        classroomId: this.classroomId,
        reports: reports,
      };

      await this.startHitalkShare();
    },

    async openHitalkShareModal(selectReport) {
      this.hitalkShareModel = {
        reportId: selectReport.reportId,
        classroomId: this.classroomId,
        title: selectReport.reportName,
        content: selectReport.studentName + ' 학생의 리포트를 확인해주세요!',
      };

      await this.startHitalkShare();
    },

    async startHitalkShare() {
      await this.connectStompClient();
      await this.callChatUserList();
      await this.callChatRooms({ force: true });
      this.hitalkShareIsOpen = true;
    },

    async controlHitalkShareModal() {
      await this.disconnectStompClient();
      this.hitalkShareIsOpen = false;
    },

    //스크롤탑 관련
    moveScrollTop: function () {
      this.$refs.scrollContArea.scrollTo({ top: 0 });
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
    async search() {
      if (this.request.studentId != null) {
        this.params.studentIds = [this.request.studentId];
      } else {
        this.params.studentIds = null;
      }

      if (this.request.keyword != null) {
        if (this.request.keyword.display === null) {
          this.params.keyword = this.request.keyword.content;
        } else {
          if (this.request.keyword.display.indexOf('#') !== 0) {
            this.params.keyword = null;
            this.params.studentIds = [this.request.keyword.content];
          } else {
            this.params.keyword = null;
          }
        }
      } else {
        this.params.keyword = null;
      }

      const res = await postClassroomReportsStudents(this.classroomId, this.pageNumber, this.params);
      if (this.pageNumber == 0) {
        this.moveScrollTop();
        this.totalCount = res.page.totalElements;
        this.records = res._embedded.reports;
        // 키워드로 검색할 때, 키워드 요약 정보를 부모 컴포넌트에 전달
        if (this.request.keyword) {
          this.$emit('updateSearchSummary', {
            keywordString: this.keywordString,
            totalCount: this.totalCount,
          });
        }
      } else {
        this.records = [...this.records, ...res._embedded.reports];
      }
    },

    scrollObserver: function () {
      this.$nextTick(function () {
        const option = {
          root: this.$refs.scrollContArea,
          rootMargin: '200px',
          threshold: 0.1,
        };

        const callback = async ([entry]) => {
          if (entry.isIntersecting) {
            this.pageNumber += 1;
            await this.search();
          }
        };

        this.observer = new IntersectionObserver(callback, option);
        this.observer.observe(this.obsRef);
      });
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
      this.blockingRequest = false;
    },
  },

  async created() {
    this.applyRouteQuery();
    await this.search();

    this.scrollObserver();
    this.visibleScrollTopButton();
  },
  mounted() {
    this.obsRef = this.$refs.scrollListAccess;
    eventBus.$on('pdfdownload-reportHistoryDetail', async (payload) => {
      this.downloadPdfReport(payload);
    });
    eventBus.$on('share-reportHistoryDetail', async (palyoad) => {
      this.openHitalkShareModal(palyoad);
    });
    eventBus.$on('delete-reportHistoryDetail', async (palyoad) => {
      this.totalCount = this.totalCount - 1;
      this.records = this.records.filter((r) => r.reportId !== palyoad.reportId);
    });
  },

  beforeDestroy() {
    eventBus.$off('pdfdownload-reportHistoryDetail');
    eventBus.$off('share-reportHistoryDetail');
    eventBus.$off('delete-reportHistoryDetail');
  },
};
</script>

<style scoped lang="scss">
.report-history-tab-content {
  width: 100%;
  height: calc(100% - 58px);
  .tab-table-wrap {
    tbody td {
      div {
        cursor: pointer;
      }
      .subject:hover {
        text-decoration: underline;
      }
      .student-info span.name:hover {
        text-decoration: none;
      }
    }
  }
}
.no-data-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 350px) !important;
  span.no-data {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 5px;
    span {
      font-size: 15px;
      color: var(--gray-08);
    }
  }
}
.record-tab-content table.stats td.txt-center {
  padding: 0;
}
.progress-modal {
  ::v-deep {
    .progressbar .bar {
      background-color: var(--orange);
    }
  }
}

.pdf-mode * {
  overflow: visible !important;
}

.pdf-mode {
  height: auto !important;
  max-height: none !important;
}
</style>