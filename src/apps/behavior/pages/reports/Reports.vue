<!--
@File(Method): Report.vue
@Date Created: 
@Description: 학급기록 > 학생 리포트
-->
<template>
  <div class="behavior-wrapper__body__content">
    <div class="record report">
      <div class="report">
        <div class="report__top-menu">
          <div class="menu">
            <span @click="toggleTab('point-report')" :class="{ on: tab === 'point-report' }">포인트</span>
            <span @click="toggleTab('record-report')" :class="{ on: tab === 'record-report' }">기록</span>
            <span @click="toggleTab('report-history')" :class="{ on: tab === 'report-history' }">리포트 내역</span>
          </div>
        </div>
        <div class="report__wrap">
          <div class="report__content">
            <div class="top">
              <div class="report-target">
                <div class="target-select cursor-pointer" @click="openTargetLayer" v-if="!curSearchRequest.keyword">
                  <span class="target">
                    {{ targetName }}
                  </span>
                  <span class="arrow" :class="{ down: !isOpenTargetLayer, up: isOpenTargetLayer }"></span>
                </div>
                <div v-if="curSearchRequest.keyword" class="record-search-result-info">
                  <span class="search-keyword">{{ `‘${searchSummaryKeyword}’` }}</span>
                  <span>{{ `검색 결과 ${searchSummaryByTab[tab].totalCount}건` }}</span>
                </div>
              </div>
              <div v-if="isOpenTargetLayer" class="search-student-list" v-click-outside="closeTargetLayer">
                <ul class="cursor-pointer">
                  <li @click="toggleTargetItem(null)">
                    <span class="image all">
                      <img class="all" src="https://download.hiclass.net/7e70/8970/a570/c370/bdd23d26-c249-405b-be91-50c63b0b6026.gif" />
                    </span>
                    <span class="name all">반 전체</span>
                  </li>
                  <li v-for="target of targets" :key="target.studentId" @click="toggleTargetItem(target.studentId)">
                    <span class="image">
                      <img :class="{ 'is-photo': isPhoto(target) }" :src="selectedImageSrc(target)" />
                    </span>
                    <span class="num">{{ target.studentNo }}</span>
                    <span class="name" :class="{ hidden: target.isHidden }">{{ `${target.isHidden ? '(숨김) ' : ''}${target.studentName}` }}</span>
                  </li>
                </ul>
              </div>
              <div class="top-right">
                <div class="date-group" v-if="curSearchRequest.keyword === null && tab !== 'report-history'">
                  <div v-if="curSelectedDateType !== 'all'" class="calendar-group">
                    <report-calendar-month
                      v-if="curSelectedDateType === 'month'"
                      :selectedDate="curSearchRequest.month"
                      @change="changeMonth"
                      dateFormat="dot"
                    />
                    <report-calendar
                      v-else
                      :isAfter="false"
                      :selectedDateType="curSelectedDateType"
                      :choice="curSearchRequest"
                      @change="changeDate"
                      dateFormat="dot"
                    />
                    <report-calendar
                      v-if="isShowAfterDate"
                      :isAfter="true"
                      :selectedDateType="curSelectedDateType"
                      :choice="curSearchRequest"
                      :isCalendar="curSelectedDateType !== 'week'"
                      @change="changeDate"
                      dateFormat="dot"
                    />
                  </div>
                  <span v-if="isShowButtonGroup" class="btn-group cursor-pointer">
                    <button @click="designatedDate('minus')">
                      <i class="left"></i>
                    </button>
                    <button @click="designatedDate('add')">
                      <i class="right"></i>
                    </button>
                    <button @click="designatedDate('current')">
                      {{ currentString }}
                    </button>
                  </span>
                  <span class="select-wrap cursor-pointer" @click="toggleDateType" v-click-outside="closeDateTypeDropdown">
                    <span class="selected">{{ dateTypeString }}</span>
                    <span class="down"></span>
                    <ul v-if="isOpenDateType" class="dropdown">
                      <li @click="toggleDateTypeItem('all')">전체</li>
                      <li @click="toggleDateTypeItem('day')">일간</li>
                      <li @click="toggleDateTypeItem('week')">주간</li>
                      <li @click="toggleDateTypeItem('month')">월간</li>
                      <li @click="toggleDateTypeItem('select')">직접선택</li>
                    </ul>
                  </span>
                  <span class="date-select-btn-group">
                    <button @click="toggleDateTypeItem('all')" :class="{ on: curSelectedDateType === 'all' }">전체</button>
                    <button @click="toggleDateTypeItem('day')" :class="{ on: curSelectedDateType === 'day' }">일간</button>
                    <button @click="toggleDateTypeItem('week')" :class="{ on: curSelectedDateType === 'week' }">주간</button>
                    <button @click="toggleDateTypeItem('month')" :class="{ on: curSelectedDateType === 'month' }">월간</button>
                    <button @click="toggleDateTypeItem('select')" :class="{ on: curSelectedDateType === 'select' }">직접선택</button>
                  </span>
                </div>
                <div class="report-search" v-click-outside="closeDropBox">
                  <span v-if="curSearchRequest.keyword && curSearchRequest.keyword.display" class="target-chip-wrap">
                    <span class="chip-keyword">{{ curSearchRequest.keyword.display }}</span>
                    <span @click="removeKeyward" class="chip-close cursor-pointer"></span>
                  </span>
                  <input
                    :readonly="curSearchRequest.keyword && curSearchRequest.keyword.display"
                    @input="inputChange"
                    @keydown.enter="onEnter"
                    @focus="inputChange"
                    maxlength="20"
                    ref="searchInput"
                    type="text"
                    :placeholder="curSearchRequest.keyword === null ? inputPlaceHolder() : ''"
                  />
                  <i v-if="isKeywordRemoveBtn" @click="removeKeyward" class="input-btn-delete bh-icon-close-circle-report-fill-24 cursor-pointer"></i>
                  <i class="bh-icon-search-20 cursor-pointer" @click="searchBtnClick"></i>
                  <div v-if="isOpenSearchDropBox" class="search-drop-wrap">
                    <ul>
                      <template v-if="dropBoxArr.length !== 0">
                        <li v-for="item of dropBoxArr" :key="item.id" @click="toggleDropItem(item)">
                          <span v-if="item.no !== null" class="num">{{ item.no }}</span>
                          <span class="name">{{ item.name }}</span>
                        </li>
                      </template>
                      <template v-else>
                        <li>
                          {{ `일치하는 ${$refs.searchInput.value.indexOf('@') === 0 ? '학생이' : '태크가'} 없습니다.` }}
                        </li>
                      </template>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <!-- 탭 화면 영역 -->
            <router-view
              :request="curSearchRequest"
              :classroomId="classroomId"
              :targetStudentName="targetName"
              @moveStudent="toggleTargetItem"
              @openDetail="toggleRecordingItem"
              @selectedReportId="onSelectedReportId"
              @closeSide="closeContentLayer"
              @openAdd="addPage"
              @updateSearchSummary="onUpdateSearchSummary"
            />
            <!-- 탭 화면 영역 -->
          </div>
        </div>
      </div>
      <!-- 우측영역 (레어이 팝업: 상세, 등록) -->
      <div v-if="tab !== 'point-report'" class="record-recording" :class="{ open: isContentLayerOpen }">
        <!-- 기록 등록 페이지들 -->
        <add-photo-record v-if="isContentLayerOpen && screen === 'ADD_PHOTO'" @change="changeCardList" @close="closeContentLayer" />
        <add-memo-record v-if="isContentLayerOpen && screen === 'ADD_MEMO'" @change="changeCardList" @close="closeContentLayer" />
        <add-video-record v-if="isContentLayerOpen && screen === 'ADD_VIDEO'" @change="changeCardList" @close="closeContentLayer" />

        <!-- 기록 상세 페이지들 -->
        <photo-record-detail
          v-if="isContentLayerOpen && screen === 'PHOTO'"
          :detail="recording"
          @change="changeCardList"
          @close="closeContentLayer"
        />
        <video-record-detail
          v-if="isContentLayerOpen && screen === 'VIDEO'"
          :detail="recording"
          @change="changeCardList"
          @close="closeContentLayer"
        />
        <audio-record-detail
          v-if="isContentLayerOpen && screen === 'AUDIO'"
          :detail="recording"
          @change="changeCardList"
          @close="closeContentLayer"
        />

        <memo-record-detail v-if="isContentLayerOpen && screen === 'MEMO'" :detail="recording" @change="changeCardList" @close="closeContentLayer" />

        <report-history-detail
          v-if="isContentLayerOpen && screen === 'REPORT_HISTORY'"
          :detail="recording"
          @change="changeCardList"
          @close="closeContentLayer"
          :reportId="selectedReportId"
          :classroomId="classroomId"
          :targetStudent="selectedTarget"
        />
      </div>
    </div>
    <confirm-modal v-if="confirmModal.isOpen" :title="confirmModal.title" :isAlert="true" @closeConfirmDialog="closeConfirmModal" />
    <behavior-viewer v-if="behaviorViewerOptions.isOpen" @delete="deleteRecording" />
  </div>
</template>

<script>
import { eventBus } from '@/main';
import { mapActions, mapState } from 'vuex';
import ReportCalendar from '@/apps/behavior/components/common/ReportCalendar.vue';
import ReportCalendarMonth from '@/apps/behavior/components/common/ReportCalendarMonth.vue';
import AudioRecordDetail from '@/apps/behavior/pages/records/AudioRecordDetail.vue';
import PhotoRecordDetail from '@/apps/behavior/pages/records/PhotoRecordDetail.vue';
import VideoRecordDetail from '@/apps/behavior/pages/records/VideoRecordDetail.vue';
import ReportHistoryDetail from '@/apps/behavior/pages/records/ReportHistoryDetail.vue';
import MemoRecordDetail from '@/apps/behavior/pages/records/MemoRecordDetail.vue';
import AddPhotoRecord from '@/apps/behavior/pages/records/AddPhotoRecord.vue';
import AddVideoRecord from '@/apps/behavior/pages/records/AddVideoRecord.vue';
import AddMemoRecord from '@/apps/behavior/pages/records/AddMemoRecord.vue';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import BehaviorViewer from '@/apps/behavior/components/popup/BehaviorViewer.vue';
import { report } from 'process';
export default {
  name: 'reports',
  components: {
    ReportCalendar,
    ReportCalendarMonth,
    AudioRecordDetail,
    PhotoRecordDetail,
    VideoRecordDetail,
    MemoRecordDetail,
    AddPhotoRecord,
    AddVideoRecord,
    AddMemoRecord,
    ConfirmModal,
    BehaviorViewer,
    ReportHistoryDetail,
  },
  data() {
    return {
      isKeywordRemoveBtn: false,
      isOpenSearchDropBox: false,
      isContentLayerOpen: false,
      isOpenTargetLayer: false,
      isOpenDateType: false,
      selectedDateTypes: {
        'point-report': 'all',
        'record-report': 'all',
      },
      tab: 'point-report',
      screen: null,
      searchRequests: {
        'point-report': {
          studentId: null,
          dateStart: null,
          dateEnd: null,
          month: null,
          keyword: null,
        },
        'record-report': {
          studentId: null,
          dateStart: null,
          dateEnd: null,
          month: null,
          keyword: null,
        },
        'report-history': {
          studentId: null,
          keyword: null,
        },
      },
      recording: {},
      targets: [],
      tags: [],
      dropBoxArr: [],
      confirmModal: {
        isOpen: false,
        title: '준비중 입니다.',
      },
      selectedReportId: null,
      // 검색 결과 키워드와 수를 탭별로 관리
      searchSummaryByTab: {
        'point-report': { keywordString: '', totalCount: 0 },
        'record-report': { keywordString: '', totalCount: 0 },
        'report-history': { keywordString: '', totalCount: 0 },
      },
    };
  },
  computed: {
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
      behaviorViewerOptions: 'behaviorViewerOptions',
    }),
    curSearchRequest: function () {
      return this.searchRequests[this.tab];
    },
    curSelectedDateType: function () {
      if (this.tab === 'report-history') return null;
      else return this.selectedDateTypes[this.tab];
    },
    classroomId: function () {
      return this.curClassroom.classroomId;
    },
    targetName: function () {
      if (this.curSearchRequest.studentId === null) {
        return '반 전체';
      } else {
        const target = this.targets.find((t) => t.studentId === this.curSearchRequest.studentId);
        return `${target.isHidden ? '(숨김) ' : ''}${target.studentName}`;
      }
    },
    selectedTarget: function () {
      if (this.curSearchRequest.studentId === null) return null;
      const target = this.targets.find((t) => t.studentId === this.curSearchRequest.studentId);
      if (!target) return null;
      return {
        id: target.studentId,
        no: target.studentNo,
        name: target.studentName,
        isHidden: !!target.isHidden,
        photo: target.studentPhoto,
        character: target.studentCharacter,
      };
    },
    dateTypeString: function () {
      const selectTypeName = {
        all: '전체',
        day: '일간',
        week: '주간',
        month: '월간',
        select: '직접선택',
      };
      const type = this.curSelectedDateType;
      return selectTypeName[type] || '';
    },
    currentString: function () {
      if (this.curSelectedDateType === 'month') {
        return '이번달';
      }
      if (this.curSelectedDateType === 'week') {
        return '이번주';
      }
      return '오늘';
    },
    isShowButtonGroup: function () {
      return ['day', 'week', 'month'].includes(this.curSelectedDateType);
    },
    isShowAfterDate: function () {
      return ['select'].includes(this.curSelectedDateType);
    },
    // 검색 결과 키워드
    searchSummaryKeyword: function () {
      const current = this.searchSummaryByTab[this.tab] || { keywordString: '' };
      if (current.keywordString) return current.keywordString;
      if (this.curSearchRequest.keyword) {
        return this.curSearchRequest.keyword.display ? this.curSearchRequest.keyword.display : this.curSearchRequest.keyword.content;
      }
      return '';
    },
  },
  watch: {
    classroomId: {
      handler: async function (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.$refs.searchInput.value = '';
          this.isKeywordRemoveBtn = false;
          this.searchRequests['point-report'] = {
            studentId: null,
            dateStart: null,
            dateEnd: null,
            month: null,
            keyword: null,
          };
          this.searchRequests['record-report'] = {
            studentId: null,
            dateStart: null,
            dateEnd: null,
            month: null,
            keyword: null,
          };
          this.searchRequests['report-history'] = {
            studentId: null,
            keyword: null,
          };
          this.selectedDateTypes['point-report'] = 'all';
          this.selectedDateTypes['record-report'] = 'all';

          this.targets = await this.getClassroomStudents({ classroomId: newVal });
          this.tags = await this.getClassroomTags({ classroomId: newVal });

          const nextQuery = Object.fromEntries(Object.entries(this.searchRequests[this.tab]).filter(([_, v]) => v != null));
          this.$router.replace({ query: nextQuery }).catch(() => {});
        }
      },
    },
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudents: 'getClassroomStudents',
      getClassroomTags: 'getClassroomTags',
      getClassroomRecordingDetail: 'getClassroomRecordingDetail',
      deleteClassroomRecording: 'deleteClassroomRecording',
      getClassroomStudentDetail: 'getClassroomStudentDetail',
    }),
    inputPlaceHolder: function () {
      if (this.canTagSearch()) {
        return '내용, #태그, @학생명 검색';
      } else {
        return '내용, @학생명 검색';
      }
    },
    isPhoto: function (student) {
      return student.studentPhoto !== null;
    },
    onSelectedReportId(reportId) {
      this.selectedReportId = reportId;
    },
    // 검색 결과 정보 업데이트
    onUpdateSearchSummary(payload) {
      if (!payload) return;
      const targetTab = payload.tab || this.tab;
      this.searchSummaryByTab[targetTab] = {
        keywordString: payload.keywordString || '',
        totalCount: payload.totalCount || 0,
      };
    },
    selectedImageSrc: function (student) {
      return this.isPhoto(student)
        ? student.studentPhoto
        : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`;
    },
    closeDropBox: function () {
      this.isOpenSearchDropBox = false;
    },
    deleteRecording: async function (recordId) {
      const params = {
        classroomId: this.classroomId,
        recordId,
      };
      await this.deleteClassroomRecording(params);
      this.changeCardList({ action: 'delete', id: recordId });
    },
    removeKeyward: function () {
      this.$refs.searchInput.value = '';
      this.isKeywordRemoveBtn = false;
      this.isOpenSearchDropBox = false;
      this.searchRequests[this.tab] = {
        ...this.searchRequests[this.tab],
        keyword: null,
      };
      // 검색 결과 정보 초기화
      this.searchSummaryByTab[this.tab] = { keywordString: '', totalCount: 0 };
      this.$router.replace({
        name: this.routeName(),
        query: Object.fromEntries(
          Object.entries({
            ...this.curSearchRequest,
            dateType: this.curSelectedDateType,
          }).filter(([_, v]) => v != null)
        ),
      });
    },
    setKeyword: function (keyword) {
      if (keyword.display !== null) {
        this.$refs.searchInput.value = '';
        this.isKeywordRemoveBtn = false;
      }
      const query = {
        ...this.curSearchRequest,
        ...keyword,
        dateType: this.curSelectedDateType,
      };
      if (this.tab !== 'report-history') {
        this.selectedDateTypes[this.tab] = 'all';
      }

      this.searchRequests[this.tab] = {
        ...this.searchRequests[this.tab],
        studentId: null,
        dateStart: null,
        dateEnd: null,
        month: null,
        keyword,
      };

      this.$router.replace({
        name: this.routeName(),
        query: Object.fromEntries(Object.entries(query).filter(([_, v]) => v != null)),
      });
      if (this.isOpenSearchDropBox) {
        this.isOpenSearchDropBox = false;
      }
    },
    toggleDropItem: async function (dropItem) {
      if (dropItem.display.indexOf('#') !== 0) {
        const res = await this.getClassroomStudentDetail({
          classroomId: this.classroomId,
          studentId: dropItem.id,
        });
        if (res.status !== 200) {
          this.$hiClass.alert('삭제된 학생입니다.');
          this.isOpenSearchDropBox = false;
          return false;
        }
      }
      const data = {
        display: dropItem.display,
        content: dropItem.id,
      };
      this.setKeyword(data);
    },
    onEnter: function (e) {
      e.preventDefault();
      if (this.isOpenSearchDropBox) {
        if (this.dropBoxArr.length < 2) {
          if (this.dropBoxArr.length === 1) {
            this.toggleDropItem(this.dropBoxArr[0]);
            this.isKeywordRemoveBtn = false;
            return;
          }
        }
      } else {
        const value = this.$refs.searchInput.value.trim();
        if (value) {
          const data = {
            display: null,
            content: this.$refs.searchInput.value,
          };
          this.setKeyword(data);
          this.isKeywordRemoveBtn = true;
        }
      }
    },
    searchBtnClick: function (e) {
      e.preventDefault();
      if (this.curSearchRequest.keyword && this.curSearchRequest.keyword.display !== null) {
        return;
      }
      const value = this.$refs.searchInput.value.trim();
      if (value) {
        const data = {
          display: null,
          content: this.$refs.searchInput.value,
        };
        this.setKeyword(data);
        this.isKeywordRemoveBtn = true;
      }
    },
    canTagSearch() {
      return this.tab === 'record-report';
    },
    inputChange: async function (e) {
      this.isKeywordRemoveBtn = e.target.value.length !== 0;
      if (e.target.value.indexOf('@') === 0) {
        if (!this.isOpenSearchDropBox) {
          this.targets = await this.getClassroomStudents({
            classroomId: this.classroomId,
          });
          this.isOpenSearchDropBox = true;
        }
        const value = e.target.value.replace('@', '');
        if (value) {
          this.dropBoxArr = this.targets
            .filter((o) => o.studentName.indexOf(value) > -1)
            .map((t) => {
              return {
                id: t.studentId,
                name: t.studentName,
                no: t.studentNo,
                display: `${t.studentNo}. ${t.studentName}`,
              };
            });
        } else {
          this.dropBoxArr = this.targets.map((t) => {
            return {
              id: t.studentId,
              name: t.studentName,
              no: t.studentNo,
              display: `${t.studentNo}. ${t.studentName}`,
            };
          });
        }
      } else if (this.canTagSearch() && e.target.value.indexOf('#') === 0) {
        this.dropBoxArr = this.targets.map((t) => {
          return { id: t.tagId, name: t.tagName, no: null };
        });
        if (!this.isOpenSearchDropBox) {
          this.isOpenSearchDropBox = true;
        }
        const value = e.target.value.replace('#', '');
        if (value) {
          this.dropBoxArr = this.tags
            .filter((o) => o.tagName.indexOf(value) > -1)
            .map((t) => {
              return { id: t.tagId, name: t.tagName, no: null, display: `#${t.tagName}` };
            });
        } else {
          this.dropBoxArr = this.tags.map((t) => {
            return { id: t.tagId, name: t.tagName, no: null, display: `#${t.tagName}` };
          });
        }
      } else {
        if (this.isOpenSearchDropBox) {
          this.isOpenSearchDropBox = false;
        }
      }
    },
    changeCardList: function (params) {
      eventBus.$emit('change-list', params);

      if (params.action === 'delete') {
        this.closeContentLayer();
      }
    },
    closeConfirmModal: function () {
      this.confirmModal.isOpen = false;
    },
    openContentLayer: function () {
      if (!this.isContentLayerOpen) {
        this.isContentLayerOpen = true;
      }
    },
    closeContentLayer: function () {
      this.isContentLayerOpen = false;
      this.recording = null;
      this.screen = null;
    },
    addPage: function (page) {
      if (page === 'ADD_AUDIO') {
        this.confirmModal.isOpen = true;
      } else {
        this.screen = page;
        this.openContentLayer();
      }
    },
    toggleRecordingItem: async function (id) {
      const res = await this.getClassroomRecordingDetail({
        classroomId: this.classroomId,
        recordId: id,
        isIncludeTargets: true,
      });
      if (res.status === 428) {
        this.$hiClass.alert('삭제된 기록입니다.', 'error');
        return;
      }
      this.recording = res;
      this.screen = this.recording.recordType;
      this.openContentLayer();
    },
    changeMonth: function (month) {
      this.searchRequests[this.tab] = {
        ...this.searchRequests[this.tab],
        dateStart: null,
        dateEnd: null,
        month,
      };
      this.$router.replace({
        name: this.routeName(),
        query: Object.fromEntries(
          Object.entries({
            ...this.curSearchRequest,
            dateType: this.curSelectedDateType,
          }).filter(([_, v]) => v != null)
        ),
      });
    },
    designatedDate: function (action) {
      switch (this.curSelectedDateType) {
        case 'day': {
          const day =
            action === 'current'
              ? this.$moment().format('YYYY-MM-DD')
              : action === 'add'
              ? this.$moment(this.curSearchRequest.dateStart, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD')
              : this.$moment(this.curSearchRequest.dateStart, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');
          this.searchRequests[this.tab] = {
            ...this.searchRequests[this.tab],
            dateStart: day,
            dateEnd: day,
            month: null,
          };
          break;
        }
        case 'week': {
          if (action === 'current') {
            this.searchRequests[this.tab] = {
              ...this.searchRequests[this.tab],
              dateStart: this.$moment().day(0).format('YYYY-MM-DD'),
              dateEnd: this.$moment().day(6).format('YYYY-MM-DD'),
              month: null,
            };
          } else if (action === 'add') {
            const day = this.$moment(this.curSearchRequest.dateStart, 'YYYY-MM-DD');
            const start = this.$moment(day, 'YYYY-MM-DD').day(0).format('YYYY-MM-DD');
            const end = this.$moment(day, 'YYYY-MM-DD').day(6).format('YYYY-MM-DD');

            this.searchRequests[this.tab] = {
              ...this.searchRequests[this.tab],
              dateStart: this.$moment(start, 'YYYY-MM-DD').add(1, 'weeks').format('YYYY-MM-DD'),
              dateEnd: this.$moment(end, 'YYYY-MM-DD').add(1, 'weeks').format('YYYY-MM-DD'),
              month: null,
            };
          } else {
            const day = this.$moment(this.curSearchRequest.dateStart, 'YYYY-MM-DD');
            const start = this.$moment(day, 'YYYY-MM-DD').day(0).format('YYYY-MM-DD');
            const end = this.$moment(day, 'YYYY-MM-DD').day(6).format('YYYY-MM-DD');

            this.searchRequests[this.tab] = {
              ...this.searchRequests[this.tab],
              dateStart: this.$moment(start, 'YYYY-MM-DD').subtract(1, 'weeks').format('YYYY-MM-DD'),
              dateEnd: this.$moment(end, 'YYYY-MM-DD').subtract(1, 'weeks').format('YYYY-MM-DD'),
              month: null,
            };
          }
          break;
        }
        case 'month': {
          if (action === 'current') {
            this.searchRequests[this.tab] = {
              ...this.searchRequests[this.tab],
              dateStart: null,
              dateEnd: null,
              month: this.$moment().format('YYYY-MM'),
            };
          } else if (action === 'add') {
            this.searchRequests[this.tab] = {
              ...this.searchRequests[this.tab],
              dateStart: null,
              dateEnd: null,
              month: this.$moment(`${this.curSearchRequest.month}-01`, 'YYYY-MM-DD').add(1, 'months').format('YYYY-MM'),
            };
          } else {
            this.searchRequests[this.tab] = {
              ...this.searchRequests[this.tab],
              dateStart: null,
              dateEnd: null,
              month: this.$moment(`${this.curSearchRequest.month}-01`, 'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM'),
            };
          }
        }
      }
      this.$router.replace({
        name: this.routeName(),
        query: Object.fromEntries(
          Object.entries({
            ...this.curSearchRequest,
            dateType: this.curSelectedDateType,
          }).filter(([_, v]) => v != null)
        ),
      });
    },
    changeDate: function (isAfter, date) {
      if (this.curSelectedDateType === 'week') {
        const day = this.$moment(date, 'YYYY-MM-DD');
        const start = this.$moment(day, 'YYYY-MM-DD').day(0).format('YYYY-MM-DD');
        const end = this.$moment(day, 'YYYY-MM-DD').day(6).format('YYYY-MM-DD');
        this.searchRequests[this.tab] = {
          ...this.searchRequests[this.tab],
          dateStart: start,
          dateEnd: end,
          month: null,
        };
        this.$router.replace({
          name: this.routeName(),
          query: Object.fromEntries(
            Object.entries({
              ...this.curSearchRequest,
              dateType: this.curSelectedDateType,
            }).filter(([_, v]) => v != null)
          ),
        });
        return;
      }
      const type = this.curSelectedDateType === 'day' ? 'both' : isAfter ? 'after' : 'strat';
      if (type === 'both') {
        this.searchRequests[this.tab] = {
          ...this.searchRequests[this.tab],
          dateStart: date,
          dateEnd: date,
          month: null,
        };
      } else if (type === 'after') {
        this.searchRequests[this.tab] = {
          ...this.searchRequests[this.tab],
          dateEnd: date,
          month: null,
        };
      } else {
        this.searchRequests[this.tab] = {
          ...this.searchRequests[this.tab],
          dateStart: date,
          month: null,
        };
      }
      this.$router.replace({
        name: this.routeName(),
        query: Object.fromEntries(
          Object.entries({
            ...this.curSearchRequest,
            dateType: this.curSelectedDateType,
          }).filter(([_, v]) => v != null)
        ),
      });
    },
    toggleTab: async function (page) {
      this.isContentLayerOpen = false;
      if (this.$route.name === page) {
        this.$router.go(this.$router.currentRoute);
      } else {
        this.tab = page;
        const curRequest = this.curSearchRequest;
        console.log(curRequest);
        if (curRequest.keyword && !curRequest.keyword.display) {
          this.$refs.searchInput.value = curRequest.keyword.content;
          this.isKeywordRemoveBtn = true;
        } else {
          this.$refs.searchInput.value = '';
          this.isKeywordRemoveBtn = false;
        }

        const classroomId = this.$route.params.classroomId;

        const query = Object.fromEntries(Object.entries(curRequest).filter(([_, v]) => v != null));

        await this.$router.replace({
          name: page,
          params: { classroomId },
          query: query,
        });
      }
    },
    openTargetLayer: async function () {
      if (!this.isOpenTargetLayer) {
        this.targets = await this.getClassroomStudents({ classroomId: this.classroomId });
      }

      this.isOpenTargetLayer = !this.isOpenTargetLayer;
    },
    closeTargetLayer: function () {
      if (this.isOpenTargetLayer) {
        this.isOpenTargetLayer = false;
      }
    },
    toggleTargetItem: async function (id) {
      if (id !== null) {
        const res = await this.getClassroomStudentDetail({
          classroomId: this.classroomId,
          studentId: id,
        });
        if (res.status !== 200) {
          this.$hiClass.alert('삭제된 학생입니다.');
          this.isOpenSearchDropBox = false;
          return false;
        }
      }
      console.log('id' + id);
      this.$refs.searchInput.value = '';
      this.isKeywordRemoveBtn = false;

      this.searchRequests['point-report'] = {
        ...this.searchRequests['point-report'],
        studentId: id,
        keyword: null,
      };
      this.searchRequests['record-report'] = {
        ...this.searchRequests['record-report'],
        studentId: id,
        keyword: null,
      };
      this.searchRequests['report-history'] = {
        studentId: id,
        keyword: null,
      };

      this.$router.replace({
        name: this.routeName(),
        query: Object.fromEntries(
          Object.entries({
            ...this.curSearchRequest,
            dateType: this.curSelectedDateType,
          }).filter(([_, v]) => v != null)
        ),
      });
      this.closeTargetLayer();
    },
    toggleDateType: function () {
      this.isOpenDateType = !this.isOpenDateType;
    },
    closeDateTypeDropdown: function () {
      this.isOpenDateType = false;
    },
    toggleDateTypeItem: function (type) {
      this.selectedDateTypes[this.tab] = type;
      this.setToday();
    },
    setToday: function () {
      switch (this.curSelectedDateType) {
        case 'all':
          this.searchRequests[this.tab] = {
            ...this.searchRequests[this.tab],
            dateStart: null,
            dateEnd: null,
            month: null,
          };
          break;
        case 'day':
          this.searchRequests[this.tab] = {
            ...this.searchRequests[this.tab],
            dateStart: this.$moment().format('YYYY-MM-DD'),
            dateEnd: this.$moment().format('YYYY-MM-DD'),
            month: null,
          };
          break;
        case 'week':
          this.searchRequests[this.tab] = {
            ...this.searchRequests[this.tab],
            dateStart: this.$moment().day(0).format('YYYY-MM-DD'),
            dateEnd: this.$moment().day(6).format('YYYY-MM-DD'),
            month: null,
          };
          break;
        case 'month':
          this.searchRequests[this.tab] = {
            ...this.searchRequests[this.tab],
            dateStart: null,
            dateEnd: null,
            month: this.$moment().format('YYYY-MM'),
          };
          break;
        case 'select':
          this.searchRequests[this.tab] = {
            ...this.searchRequests[this.tab],
            dateStart: this.$moment().startOf('month').format('YYYY-MM-DD'),
            dateEnd: this.$moment().endOf('month').format('YYYY-MM-DD'),
            month: null,
          };
          break;
      }

      const query = Object.fromEntries(
        Object.entries({
          ...this.curSearchRequest,
          dateType: this.curSelectedDateType,
        }).filter(([_, v]) => v != null)
      );
      if (this.isEqualQuery(this.$route.query, query)) {
        return;
      }
      this.$router.replace({ name: this.routeName(), query });
    },
    isEqualQuery(q1, q2) {
      const keys1 = Object.keys(q1);
      const keys2 = Object.keys(q2);

      if (keys1.length !== keys2.length) return false;

      return keys1.every((key) => q1[key] === q2[key]);
    },
    routeName() {
      return this.tab;
    },
  },
  async created() {
    this.tab = this.$route.name;
    this.targets = await this.getClassroomStudents({ classroomId: this.classroomId });
    this.tags = await this.getClassroomTags({ classroomId: this.classroomId });
    const params = {
      studentId: this.$route.query.studentId,
      dateStart: this.$route.query.dateStart,
      dateEnd: this.$route.query.dateEnd,
      month: this.$route.query.month,
      keyword: this.$route.query.content
        ? {
            display: this.$route.query.display,
            content: this.$route.query.content,
          }
        : null,
    };
    this.selectedDateTypes[this.tab] = this.$route.query.dateType || 'all';

    if (params.keyword && !params.keyword.display) {
      this.$refs.searchInput.value = params.keyword.content;
      this.isKeywordRemoveBtn = true;
    }
    this.searchRequests[this.tab] = {
      ...this.searchRequests[this.tab],
      ...Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null)),
    };
  },
};
</script>

<style scoped lang="scss">
.report.record {
  background: #f5f6f7;
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.report {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  .report__wrap {
    width: 100%;
    height: calc(100% - 78px);
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
  }
  .report__content {
    margin: 18px 35px 0 35px;
    width: calc(100% - 56px);
    max-width: 1400px;
    min-height: 364px;
    flex-grow: 1;
    overflow: hidden;
  }
}

//리포트 상단 탭 메뉴
.report__top-menu {
  width: 100%;
  height: 78px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .menu {
    display: flex;
    span {
      display: inline-flex;
      height: 78px;
      align-items: center;
      margin-right: 42px;
      font-size: 18px;
      font-weight: 500;
      color: #616161;
      cursor: pointer;
      padding: 20px;
      border-bottom: 3px solid transparent;
      &:last-child {
        margin-right: 0;
      }
      &.on {
        border-bottom: 3px solid #fe8813;
        color: #222;
        font-weight: 700;
      }
    }
  }
}

//리포트 컨텐츠 상단 필터 영역
.report__content {
  .top {
    width: 100%;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    // 학생 선택 영역
    .report-target {
      display: flex;
      height: 100%;
      align-items: center;
      .target-select {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 16px;
        padding-right: 16px;
        width: 200px;
        height: 40px;
        border-radius: 4px;
        border: 1px solid #ff8737;
        background-color: #fff;
        .target {
          font-size: 16px;
          font-weight: 700;
          line-height: 18px;
          color: #ff8737;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .arrow {
          width: 20px;
          height: 20px;
        }
        .arrow.down {
          background: url('~@/assets/img/icon/ic_arrowdown_20.svg');
        }
        .arrow.up {
          background: url('~@/assets/img/icon/ic_arrowup_20.svg');
        }
      }
      .title {
        font-size: 20px;
        font-weight: 700;
        line-height: 20px;
        margin-left: 12px;
      }
    }
    // 학생 선택 드롭다운 리스트
    .search-student-list {
      position: absolute;
      top: calc(100% - 10px);
      left: 0px;
      width: 248px;
      height: auto;
      max-height: 318px;
      border: 1px solid #d6d6d6;
      border-radius: 10px;
      box-shadow: 0px 5px 10px 0px #0000001f;
      z-index: 3;
      background: #fff;
      overflow: auto;
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
      ul {
        padding: 9px 0;
        li {
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 15px;
          cursor: pointer;
          &:hover {
            background: #f6f6f6;
          }
          span.image {
            display: inline-flex;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #f5f6f7;
            overflow: hidden;
            margin-right: 0px;
            justify-content: center;
            align-items: flex-end;
            img {
              width: 32px;
              height: 32px;
              -o-object-fit: cover;
              object-fit: cover;
              image-rendering: auto;
            }
            img.is-photo {
              width: 100%;
              height: 100%;
            }
            img.all {
              width: 18px;
              height: 15px;
              -o-object-fit: cover;
              object-fit: cover;
              image-rendering: auto;
              content: url('../../../../assets/img/icon/ic_users_fill_24.png');
            }
          }
          span.image.all {
            background: #fff0e7;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          span.num {
            display: inline-block;
            width: auto;
            min-width: 28px;
            max-width: 58px;
            height: 18px;
            border-radius: 20px;
            border: 1px solid #9e9e9e;
            font-size: 12px;
            font-weight: 500;
            color: #616161;
            text-align: center;
            line-height: 16px;
            margin-right: 3px;
            padding-left: 2px;
            padding-right: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-left: 3px;
          }
          span.name {
            display: inline-block;
            font-size: 15px;
            font-weight: 400;
            color: #222;
            text-align: left;
            width: calc(100% - 79px);
            height: 18px;
            line-height: 18px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            flex-grow: 1;
          }
          span.name.all {
            color: #ff8737;
            margin-left: 5px;
          }
          span.name.hidden {
            color: #9e9e9e;
          }
        }
      }
    }
    // 우측 날짜 선택 및 검색 영역
    .top-right {
      display: flex;
      gap: 16px;
      align-items: center;

      // 날짜 선택 영역
      .date-group {
        display: flex;
        position: relative;
        .calendar-group {
          display: flex;
          align-items: center;
          height: 34px;
          margin-right: 20px;
          .picker-calendar-month {
            z-index: 10;
          }
        }
        .calendar-group .date-wrap {
          display: flex;
          align-items: center;
          position: relative;
          &::v-deep {
            .separator {
              font-size: 16px;
              font-weight: 400;
              line-height: 16px;
              color: #222;
              margin-right: 5px;
              margin-left: 5px;
            }
            i.cal {
              width: 16px;
              height: 16px;
              margin-right: 6px;
              background: url('~@/assets/img/icon/ic_calendar_16.png');
            }
            span.date-str {
              font-size: 14px;
              font-weight: 400;
              line-height: 16px;
              color: #222;
            }
          }
        }
        // 이전 다음 버튼 그룹
        .btn-group {
          display: flex;
          height: 34px;
          margin-right: 8px;
          button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            font-size: 13px;
            font-weight: 400;
            line-height: 13px;
            background: #fff;
            color: #222;
            border: 1px solid #d6d6d6;
            &:first-child {
              border-radius: 4px 0px 0px 4px;
              border-right: 0px;
            }
            &:last-child {
              border-radius: 0px 4px 4px 0px;
              border-left: 0px;
            }
            i {
              width: 14px;
              height: 14px;
              &.right {
                background: url('~@/assets/img/icon/ic_arrowright_14.svg');
              }
              &.left {
                background: url('~@/assets/img/icon/ic_arrowleft_14.svg');
              }
            }
          }
        }
        // 기간선택 드롭다운 (탭)
        .select-wrap {
          position: relative;
          align-items: center;
          justify-content: space-between;
          padding-left: 10px;
          padding-right: 10px;
          width: 110px;
          height: 34px;
          background: #9e9e9e;
          border: 1px solid #9e9e9e;
          display: none;
          .selected {
            font-size: 14px;
            font-weight: 400;
            line-height: 14px;
            color: #fff;
          }
          .down {
            width: 16px;
            height: 16px;
            background: url('~@/assets/img/icon/ic_date_arrowdown_16.svg');
          }
          ul.dropdown {
            background: #fff;
            position: absolute;
            top: 40px;
            right: 0px;
            border: 1px solid #d6d6d6;
            border-radius: 6px;
            padding: 6px 0px 6px 0px;
            box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.12);
            z-index: 10;
            li {
              width: 122px;
              height: 40px;
              padding: 13px 0px 13px 15px;
              font-size: 14px;
              font-weight: 400;
              line-height: 14px;
              color: #222;
              &:hover {
                background: #f6f6f6;
              }
            }
          }
        }
        // 기간 선택 버튼 그룹(데스크탑)
        .date-select-btn-group {
          display: flex;
          button {
            padding: 10px 16px 10px 16px;
            font-size: 14px;
            font-weight: 400;
            line-height: 14px;
            color: #616161;
            border: 1px solid #e0e0e0;
            background: #fff;
            margin-left: -1px;
            &.on {
              background: #616161;
              border: 1px solid #616161;
              color: #fff;
            }
            &:first-child {
              border-radius: 4px 0px 0px 4px;
            }
            &:last-child {
              border-radius: 0px 4px 4px 0px;
            }
          }
        }
      }
      // 리포트 검색창
      .report-search {
        position: relative;
        width: 290px;
        display: flex;
        align-items: center;
        z-index: 2;
        background-color: #fff;
        color: #9e9e9e;
        border-radius: 20px;
        border: 1px solid #fff;
        .search-drop-wrap {
          width: 250px;
          max-height: 318px;
          border-radius: 10px;
          position: absolute;
          border: 1px solid #fff;
          box-shadow: 0px 5px 10px 0px #0000001f;
          background-color: #fff;
          top: 48px;
          left: 0px;
          padding: 9px 0px 9px 0px;
          overflow-y: auto;
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
          ul {
            width: 100%;
            li {
              width: 100%;
              height: 50px;
              font-size: 14px;
              font-weight: 400;
              line-height: 14px;
              display: flex;
              align-items: center;
              padding: 16px 0px 16px 15px;
              &:hover {
                background: #f6f6f6;
              }
              span.num {
                display: inline-block;
                width: auto;
                min-width: 28px;
                max-width: 58px;
                height: 18px;
                border-radius: 20px;
                border: 1px solid #9e9e9e;
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
              .name {
                flex-grow: 1;
                width: calc(100% - 62px);
                color: #222222;
                display: inline-block;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.4;
              }
            }
          }
        }
        input[type='text'] {
          width: 250px;
          height: 38px;
          background-color: #fff;
          color: #222222;
          border-radius: 20px;
          border: 0;
          padding-left: 16px;
          padding-right: 40px;
          font-weight: 400;
          font-size: 15px;
          line-height: 16px;
        }
        i {
          position: absolute;
          right: 10px;
        }
        i.input-btn-delete {
          position: absolute;
          right: 35px !important;
        }
        .target-chip-wrap {
          padding: 7px 7px 7px 12px;
          height: 28px;
          top: 5px;
        }
      }
    }
  }
}

@media screen and (max-width: 1370px) {
  .report .report__content .top .top-right {
    .date-group {
      .select-wrap {
        display: flex;
      }
      .date-select-btn-group {
        display: none;
      }
    }
    .report-search {
      width: 230px;
      input[type='text'] {
        width: 200px;
      }
    }
  }
}
</style>
