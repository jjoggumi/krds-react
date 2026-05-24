<!--
@File(Method): RecordReport.vue
@Author: -
@Date Created: -
@Description: 학급기록 > 학생 리포트 > 기록 탭
@Modified: 2024-10-18 #69171 진행중 [WEB] 학급기록 > 행동기록 기록 유형 중 녹음 버튼 히든
-->

<template>
  <div class="record-tab-content">
    <div class="tab-content-header">
      <div>
        <div v-if="isOterFilterAble" class="record-type-wrap">
          <span v-if="isTargetFilterAble" @click="toggleContentType('status')" class="cursor-pointer stats" :class="{ on: table === 'status' }"
            >현황</span
          >
          <span @click="toggleContentType('nuga')" class="cursor-pointer" :class="{ on: table === 'nuga' }">누가기록</span>
          <span @click="toggleContentType('record')" class="cursor-pointer" :class="{ on: table === 'record' }">행동기록</span>
        </div>
      </div>
      <!-- <div class="record-search-result-wrap" v-else>
        <span class="search-keyword">{{ `‘${keywordString}’` }}</span>
        <span>{{ `검색 결과 ${page.totalElements}건` }}</span>
      </div> -->
      <div class="action-wrap">
        <span v-if="table === 'nuga' && isOterFilterAble" class="excel cursor-pointer" @click="openExcelDropBox"> <i></i>엑셀 다운로드 </span>
        <ul v-if="table === 'nuga' && isOpenExcelDropBox" class="add-dropbox-wrap download cursor-pointer" v-click-outside="closeExcelDropBox">
          <li @click="excelDownload(false)">조회 결과 다운로드</li>
          <li @click="excelDownload(true)">전체 다운로드</li>
        </ul>
        <span v-if="table === 'record' && isOterFilterAble" class="file cursor-pointer" @click="openExcelDropBox"> <i></i>파일 다운로드 </span>
        <ul v-if="table === 'record' && isOpenExcelDropBox" class="add-dropbox-wrap download" v-click-outside="closeExcelDropBox">
          <li @click="fileDownload(false)" :class="{ dis: deletedIds.length === 0, 'cursor-pointer': deletedIds.length !== 0 }">
            선택 파일 다운로드
          </li>
          <li @click="fileDownload(true)" class="cursor-pointer">전체 다운로드</li>
        </ul>
        <span
          v-if="['nuga', 'record'].includes(table)"
          @click="openConfirmModal"
          class="delete"
          :class="{ on: deletedIds.length !== 0, 'cursor-pointer': deletedIds.length !== 0 }"
        >
          <i></i>선택 삭제
        </span>
        <p v-if="table === 'status' && isTargetFilterAble" class="action-wrap__chk-hidden" @click="setStatusIsHidden">
          <input type="checkbox" id="chk-hidden-student" :checked="statusParams.isHidden" />
          <label for="chk-hidden-student">
            <span class="radio-hidden">숨김 학생 포함</span>
          </label>
        </p>
        <span v-if="isOterFilterAble" @click="toggleAddButton" class="add cursor-pointer"> <i></i>등록 </span>
        <ul v-if="isOpenRecordAddDropBox" class="add-dropbox-wrap cursor-pointer" v-click-outside="closeRecordAddDropBox">
          <li @click="openAddRecored('ADD_PHOTO')"><i class="picture"></i>사진</li>
          <li @click="openAddRecored('ADD_VIDEO')"><i class="video"></i>동영상</li>
          <!--  #69171 <li @click="openAddRecored('ADD_AUDIO')"><i class="audio"></i>녹음</li> -->
          <li v-if="table === 'status' && isTargetFilterAble" @click="openWhoWriteModal"><i class="bh-icon-mn-whorecord-52"></i>누가기록</li>
        </ul>
      </div>
    </div>
    <div class="tab-table-wrap" ref="scrollContArea">
      <div ref="scrollTop" class="scroll-top" @click="moveScrollTop">
        <i class="bh-icon-arrowup-32"></i>
      </div>
      <table v-if="table === 'nuga' && isOterFilterAble">
        <colgroup>
          <col style="width: 40px" />
          <col style="width: 130px" />
          <col style="width: 232px" />
          <col style="width: 232px" />
          <col />
          <col style="width: 130px" />
        </colgroup>
        <thead>
          <tr>
            <th class="cursor-pointer">
              <div @click="toggleAllRows">
                <i class="checkbox" :class="{ on: isAllRows }"></i>
              </div>
            </th>
            <th class="cursor-pointer">
              <div @click="changeSort">일자<i class="sort" :class="{ up: isLatestSort, down: !isLatestSort }"></i></div>
            </th>
            <th class="cursor-pointer" :class="{ filter: isTagFilterOn }">
              <div @click="openTagFilter">태그<i v-if="isOterFilterAble" class="filter" :class="{ on: isTagFilterOn }"></i></div>
              <div v-if="isOpenTagFilter" class="filter-warp" v-click-outside="outSideTagFilter">
                <div class="filter-list-wrap">
                  <ul>
                    <li class="title">
                      태그 선택
                      <i class="setting" @click="openTagListModal"></i>
                    </li>
                    <li @click="toggleAllTagSelect"><i class="checkbox" :class="{ on: isAllTagSelected }"></i>전체선택</li>
                    <li v-for="tag of tags" :key="tag.tagId" @click="toggleTagFilterItem(tag.tagId)">
                      <i class="checkbox" :class="{ on: isSelectedTag(tag.tagId) }"></i>{{ tag.tagName }}
                    </li>
                    <li @click="toggleTagFilterItem(null)"><i class="checkbox" :class="{ on: isSelectedTag(null) }"></i>태그없음</li>
                  </ul>
                </div>
                <div class="filter-btn-wrap">
                  <button @click="closeTagFilter(false)">취소</button>
                  <button :disabled="!isTagSubmit" class="confirm" :class="{ dis: !isTagSubmit }" @click="closeTagFilter(true)">확인</button>
                </div>
              </div>
            </th>
            <th class="cursor-pointer" :class="{ filter: isTargetFilterOn }">
              <div @click="openTargetFilter">대상<i v-if="isTargetFilterAble" class="filter" :class="{ on: isTargetFilterOn }"></i></div>
              <div v-if="isOpenTargetFilter" class="filter-warp" v-click-outside="outSideTargetFilter">
                <div class="filter-list-wrap">
                  <ul>
                    <li class="title">대상 선택</li>
                    <li @click="toggleAllTargetSelect"><i class="checkbox" :class="{ on: isAllTargetSelected }"></i>전체선택</li>
                    <li v-for="target of targets" :key="target.studentId" @click="toggleTargetFilterItem(target.studentId)">
                      <i class="checkbox" :class="{ on: isSelectedTarget(target.studentId) }"></i>
                      <span class="num">{{ target.studentNo }}</span>
                      <span class="name" :class="{ hidden: target.isHidden }">
                        {{ `${target.isHidden ? '(숨김) ' : ''}${target.studentName}` }}
                      </span>
                    </li>
                    <li @click="toggleTargetFilterItem(null)"><i class="checkbox" :class="{ on: isSelectedTarget(null) }"></i>대상없음</li>
                  </ul>
                </div>
                <div class="filter-btn-wrap">
                  <button @click="closeTargetFilter(false)">취소</button>
                  <button :disabled="!isTargetSubmit" class="confirm" :class="{ dis: !isTargetSubmit }" @click="closeTargetFilter(true)">확인</button>
                </div>
              </div>
            </th>
            <th><div>기록내용</div></th>
            <th><div>작성일시</div></th>
          </tr>
        </thead>
        <tbody>
          <template v-if="records.length === 0">
            <tr>
              <td colspan="6">
                <div class="no-data-bg">
                  <span class="no-data">
                    <i class="bh-icon-warning-circle-fill-52"></i>
                    <span>{{ nodataText }}</span>
                  </span>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <nuga-record-table-row
              v-for="record of records"
              :key="record.recordId"
              :record="record"
              :selected="deletedIds"
              :highlightTargets="highlightTargets"
              :highlightTags="highlightTags"
              @toggle="toggleRows"
              @openNugaDetail="openNugaDetail"
              @deleteRow="deleteRow"
            />
          </template>
        </tbody>
      </table>
      <table v-else-if="table === 'record' && isOterFilterAble">
        <colgroup>
          <col style="width: 40px" />
          <col style="width: 168px" />
          <col style="width: 232px" />
          <col style="width: 97px" />
          <col style="width: 98px" />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>
              <div class="cursor-pointer" @click="toggleAllRows">
                <i class="checkbox" :class="{ on: isAllRows }"></i>
              </div>
            </th>
            <th class="cursor-pointer">
              <div @click="changeSort">일자<i class="sort" :class="{ up: isLatestSort, down: !isLatestSort }"></i></div>
            </th>
            <th class="cursor-pointer" :class="{ filter: isTargetFilterOn }">
              <div @click="openTargetFilter">대상<i v-if="isTargetFilterAble" class="filter" :class="{ on: isTargetFilterOn }"></i></div>
              <div v-if="isOpenTargetFilter" class="filter-warp" v-click-outside="outSideTargetFilter">
                <div class="filter-list-wrap">
                  <ul>
                    <li class="title">대상 선택</li>
                    <li @click="toggleAllTargetSelect"><i class="checkbox" :class="{ on: isAllTargetSelected }"></i>전체선택</li>
                    <li v-for="target of targets" :key="target.studentId" @click="toggleTargetFilterItem(target.studentId)">
                      <i class="checkbox" :class="{ on: isSelectedTarget(target.studentId) }"></i>
                      <span class="num">{{ target.studentNo }}</span>
                      <span class="name" :class="{ hidden: target.isHidden }">
                        {{ `${target.isHidden ? '(숨김) ' : ''}${target.studentName}` }}
                      </span>
                    </li>
                    <li @click="toggleTargetFilterItem(null)"><i class="checkbox" :class="{ on: isSelectedTarget(null) }"></i>대상없음</li>
                  </ul>
                </div>
                <div class="filter-btn-wrap">
                  <button @click="closeTargetFilter(false)">취소</button>
                  <button :disabled="!isTargetSubmit" class="confirm" :class="{ dis: !isTargetSubmit }" @click="closeTargetFilter(true)">확인</button>
                </div>
              </div>
            </th>
            <th class="cursor-pointer" :class="{ filter: isTypeFilterOn }">
              <div @click="openTypeFilter">유형<i v-if="isOterFilterAble" class="filter" :class="{ on: isTypeFilterOn }"></i></div>
              <div v-if="isOpenTypeFilter" class="filter-warp type" v-click-outside="outSideTyepFilter">
                <div class="filter-list-wrap">
                  <ul>
                    <li class="title">유형 선택</li>
                    <li @click="toggleAllTypeSelect"><i class="checkbox" :class="{ on: isAllTypeSelected }"></i>전체선택</li>
                    <li @click="toggleTypeFilterItem('PHOTO')"><i class="checkbox" :class="{ on: isSelectedType('PHOTO') }"></i>사진</li>
                    <li @click="toggleTypeFilterItem('VIDEO')"><i class="checkbox" :class="{ on: isSelectedType('VIDEO') }"></i>동영상</li>
                    <li @click="toggleTypeFilterItem('AUDIO')"><i class="checkbox" :class="{ on: isSelectedType('AUDIO') }"></i>오디오</li>
                  </ul>
                </div>
                <div class="filter-btn-wrap">
                  <button @click="closeTypeFilter(false)">취소</button>
                  <button :disabled="!isTypeSubmit" @click="closeTypeFilter(true)" class="confirm" :class="{ dis: !isTypeSubmit }">확인</button>
                </div>
              </div>
            </th>
            <th><div>썸네일</div></th>
            <th><div>기록내용</div></th>
          </tr>
        </thead>
        <tbody>
          <template v-if="records.length === 0">
            <tr>
              <td colspan="6">
                <div class="no-data-bg">
                  <span class="no-data">
                    <i class="bh-icon-warning-circle-fill-52"></i>
                    <span>{{ nodataText }}</span>
                  </span>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <behavior-record-table-row
              v-for="record of records"
              :key="record.recordId"
              :record="record"
              :selected="deletedIds"
              :classroomId="classroomId"
              :highlightTargets="highlightTargets"
              :isTypeFilterOn="isTypeFilterOn"
              @toggle="toggleRows"
              @detail="openRecordDetail"
              @deleteRow="deleteRow"
            />
          </template>
        </tbody>
      </table>
      <table v-else-if="table === 'status' && isTargetFilterAble" class="stats">
        <colgroup>
          <col width="48%" />
          <col width="13%" />
          <col width="13%" />
          <col width="13%" />
          <col width="13%" />
        </colgroup>
        <thead>
          <tr>
            <th @click="setStatusSort('studentNo')">
              <p>
                학생명
                <i
                  class="cursor-pointer sort"
                  :class="{
                    on: statusSortField === 'studentNo',
                    down: statusSortField === 'studentNo' && statusSortFlag === 'desc',
                    up: statusSortField !== 'studentNo' || (statusSortField === 'studentNo' && statusSortFlag === 'asc'),
                  }"
                ></i>
              </p>
            </th>
            <th @click="setStatusSort('nuga')">
              <p>
                누가기록
                <i
                  class="cursor-pointer sort down"
                  :class="{
                    on: statusSortField === 'nuga',
                    down: statusSortField === 'nuga' && statusSortFlag === 'desc',
                    up: statusSortField !== 'nuga' || (statusSortField === 'nuga' && statusSortFlag === 'asc'),
                  }"
                ></i>
              </p>
            </th>
            <th @click="setStatusSort('photo')">
              <p>
                사진
                <i
                  class="cursor-pointer sort down"
                  :class="{
                    on: statusSortField === 'photo',
                    down: statusSortField === 'photo' && statusSortFlag === 'desc',
                    up: statusSortField !== 'photo' || (statusSortField === 'photo' && statusSortFlag === 'asc'),
                  }"
                ></i>
              </p>
            </th>
            <th @click="setStatusSort('video')">
              <p>
                동영상
                <i
                  class="cursor-pointer sort down"
                  :class="{
                    on: statusSortField === 'video',
                    down: statusSortField === 'video' && statusSortFlag === 'desc',
                    up: statusSortField !== 'video' || (statusSortField === 'video' && statusSortFlag === 'asc'),
                  }"
                ></i>
              </p>
            </th>
            <th @click="setStatusSort('audio')">
              <p>
                오디오
                <i
                  class="cursor-pointer sort down"
                  :class="{
                    on: statusSortField === 'audio',
                    down: statusSortField === 'audio' && statusSortFlag === 'desc',
                    up: statusSortField !== 'audio' || (statusSortField === 'audio' && statusSortFlag === 'asc'),
                  }"
                ></i>
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="status.length === 0">
            <tr>
              <td colspan="5">
                <div class="no-data-bg">
                  <span class="no-data">
                    <i class="bh-icon-warning-circle-fill-52"></i>
                    <span>{{ nodataText }}</span>
                  </span>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="item of statusList" :key="item.studentId">
              <td>
                <div class="student-info" @click="clickStatusItem('nuga', item.studentId)">
                  <span class="num">{{ item.studentNo }}</span>
                  <span class="name" :class="{ hidden: item.isHidden }">
                    {{ `${item.studentName}${item.isHidden ? ' (숨김)' : ''}` }}
                  </span>
                </div>
              </td>
              <td>
                <div class="stat-info">
                  <span @click="clickStatusItem('nuga', item.studentId)" class="count">{{ `${item.countNuga}건` }}</span>
                </div>
              </td>
              <td>
                <div class="stat-info">
                  <span @click="clickStatusItem('photo', item.studentId)" class="count">{{ `${item.countPhoto}건` }}</span>
                </div>
              </td>
              <td>
                <div class="stat-info">
                  <span @click="clickStatusItem('video', item.studentId)" class="count">{{ `${item.countVideo}건` }}</span>
                </div>
              </td>
              <td>
                <div class="stat-info">
                  <span @click="clickStatusItem('audio', item.studentId)" class="count">{{ `${item.countAudio}건` }}</span>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <table v-else>
        <colgroup>
          <col style="width: 40px" />
          <col style="width: 168px" />
          <col style="width: 232px" />
          <col style="width: 62px" />
          <col style="width: 97px" />
          <col style="width: 98px" />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>
              <div class="cursor-pointer" @click="toggleAllRows">
                <i class="checkbox" :class="{ on: isAllRows }"></i>
              </div>
            </th>
            <th class="cursor-pointer">
              <div @click="changeSort">일자<i class="sort" :class="{ up: isLatestSort, down: !isLatestSort }"></i></div>
            </th>
            <th>
              <div>대상</div>
            </th>
            <th>
              <div>태그</div>
            </th>
            <th>
              <div>유형</div>
            </th>
            <th><div>썸네일</div></th>
            <th><div>기록내용</div></th>
          </tr>
        </thead>
        <tbody>
          <template v-if="records.length === 0">
            <tr>
              <td colspan="7">
                <div class="no-data-bg">
                  <span class="no-data">
                    <i class="bh-icon-warning-circle-fill-52"></i>
                    <span>{{ nodataText }}</span>
                  </span>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <behavior-search-table-row
              v-for="record of records"
              :key="record.recordId"
              :record="record"
              :selected="deletedIds"
              :classroomId="classroomId"
              :highlightTargets="highlightTargets"
              :isTypeFilterOn="isTypeFilterOn"
              @toggle="toggleRows"
              @detail="openRecordDetail"
              @deleteRow="deleteRow"
            />
          </template>
        </tbody>
      </table>
      <div ref="scrollListAccess"></div>
    </div>
    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      @closeConfirmDialog="closeConfirmModal"
    />
    <who-write-modal
      v-if="isOpenWhoWriteModal === true"
      :mode="mode"
      :item="nuga"
      :studentList="studentList"
      @close="closeWhoWriteModal"
      @closeSubmit="whoWriteFinish"
    />
    <tag-list-modal v-if="isTagListModal === true" @close="closeTagListModal" />
    <behavior-file-modal v-if="isFileAllSelectedModal" :progress="page" @close="closeFileSelectModal" />
    <record-excel-table v-if="isExcelDownload" :data="excelData" @complete="excelDownloadComplete" />
  </div>
</template>

<script>
import { eventBus } from '@/main';
import axios from 'axios';
import jszip from 'jszip';
import { mapActions, mapState, mapMutations } from 'vuex';
import NugaRecordTableRow from '@/apps/behavior/components/list/NugaRecordTableRow.vue';
import BehaviorRecordTableRow from '@/apps/behavior/components/list/BehaviorRecordTableRow.vue';
import BehaviorSearchTableRow from '@/apps/behavior/components/list/BehaviorSearchTableRow.vue';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import WhoWriteModal from '@/apps/behavior/components/popup/WhoWriteModal.vue';
import TagListModal from '@/apps/behavior/components/popup/TagListModal.vue';
import RecordExcelTable from '@/apps/behavior/components/common/RecordExcelTable.vue';
import BehaviorFileModal from '@/apps/behavior/components/popup/BehaviorFileModal.vue';
import _ from 'lodash';

export default {
  name: 'record-report',
  components: {
    NugaRecordTableRow,
    BehaviorRecordTableRow,
    ConfirmModal,
    WhoWriteModal,
    BehaviorSearchTableRow,
    TagListModal,
    RecordExcelTable,
    BehaviorFileModal,
  },
  props: {
    request: Object,
    classroomId: String,
  },
  data() {
    return {
      axiosCancel: null,
      isFileAllSelectedModal: false,
      isOpenExcelDropBox: false,
      isExcelDownload: false,
      excelData: {
        params: {
          date: '',
          targetName: '',
          isAll: false,
        },
        list: [],
      },
      isTagListModal: false,
      isOpenWhoWriteModal: false,
      studentList: [],
      isOpenTagFilter: false,
      isOpenTargetFilter: false,
      isOpenTypeFilter: false,
      isOpenRecordAddDropBox: false,
      table: 'status',
      params: {
        tags: [],
        targets: [],
        sort: 'latest',
        recordTypes: ['NUGA'],
      },
      statusParams: {
        isHidden: false,
        sort: 'studentNo,asc',
      },
      status: [],
      filterTags: [],
      filterTargets: [],
      filterRecordTypes: [],
      targets: [],
      tags: [],
      records: [],
      page: {},
      deletedIds: [],
      nuga: null,
      obsRef: null,
      observer: null,
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        deleteId: null,
      },
      nugaDeletedIds: [],
      recordDeletedIds: [],
      blockingRequest: true,
    };
  },
  computed: {
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
    }),
    statusList: function () {
      return this.statusParams.isHidden ? this.status : this.status.filter((s) => !s.isHidden);
    },
    nodataText: function () {
      return this.request.keyword === null ? '내역이 없습니다.' : '검색결과가 없습니다.';
    },
    keywordString: function () {
      return this.request.keyword.display ? this.request.keyword.display : this.request.keyword.content;
    },
    isTargetFilterAble: function () {
      return this.request.studentId === null && this.request.keyword === null;
    },
    isOterFilterAble: function () {
      return this.request.keyword === null;
    },
    mode: function () {
      return this.nuga === null ? 'write' : 'update';
    },
    isAllTypeSelected: function () {
      return this.filterRecordTypes.length === 3;
    },
    isAllTargetSelected: function () {
      return this.filterTargets.length === this.targets.length + 1;
    },
    isAllTagSelected: function () {
      return this.filterTags.length === this.tags.length + 1;
    },
    isLatestSort: function () {
      return this.params.sort === 'latest';
    },
    isAllRows: function () {
      return this.page.totalElements > 0 && this.records.length === this.page.totalElements && this.deletedIds.length === this.page.totalElements;
    },
    isTargetFilterOn: function () {
      return this.params.targets.length !== this.targets.length + 1;
    },
    highlightTargets: function () {
      return this.isTargetFilterOn ? this.targets.filter((o) => this.params.targets.includes(o.studentId)).map((r) => r.studentName) : [];
    },
    isTagFilterOn: function () {
      return this.params.tags.length !== this.tags.length + 1;
    },
    highlightTags: function () {
      return this.isTagFilterOn ? this.params.tags : [];
    },
    isTypeFilterOn: function () {
      return this.params.recordTypes.length !== 3;
    },
    isTargetSubmit: function () {
      return this.filterTargets.length > 0;
    },
    isTagSubmit: function () {
      return this.filterTags.length > 0;
    },
    isTypeSubmit: function () {
      return this.filterRecordTypes.length > 0;
    },
    statusSortField: function () {
      const sort = this.statusParams.sort.split(',');
      return sort[0];
    },
    statusSortFlag: function () {
      const sort = this.statusParams.sort.split(',');
      return sort[1];
    },
  },
  watch: {
    request: {
      handler: async function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          if (this.table !== 'status') {
            if (newVal.keyword !== null) {
              this.initFilterData('search');
            } else {
              this.initFilterData(this.table);
            }
            const params = {
              classroomId: this.classroomId,
              ...newVal,
              ...this.params,
            };
            if (this.blockingRequest) return;
            console.log(newVal);
            await this.search(params);
          } else {
            if (newVal.studentId === null && newVal.keyword === null) {
              const params = {
                classroomId: this.classroomId,
                ...newVal,
                ...this.statusParams,
              };
              if (this.blockingRequest) return;

              await this.searchStatus(params);
            } else {
              this.table = 'nuga';
              if (newVal.keyword !== null) {
                this.initFilterData('search');
              } else {
                this.initFilterData(this.table);
              }
              const params = {
                classroomId: this.classroomId,
                ...newVal,
                ...this.params,
              };
              if (this.blockingRequest) return;
              console.log('nuga');
              await this.search(params);
            }
          }
        }
      },
    },
    classroomId: {
      handler: async function (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.targets = await this.getClassroomStudents({ classroomId: newVal });
          this.tags = await this.getClassroomTags({ classroomId: newVal });
          // this.request.studentId = null;
          this.initFilterData(this.table);
          if (this.table !== 'status') {
            const params = {
              classroomId: newVal,
              ...this.request,
              ...this.params,
            };
            console.log('test111');
            await this.search(params);
          } else {
            const params = {
              classroomId: newVal,
              ...this.request,
              ...this.statusParams,
            };

            await this.searchStatus(params);
          }
        }
      },
    },
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomRecordReports: 'getClassroomRecordReports',
      getClassroomRecordReportsSearch: 'getClassroomRecordReportsSearch',
      getClassroomStudents: 'getClassroomStudents',
      getClassroomTags: 'getClassroomTags',
      deleteMultiRecordings: 'deleteMultiRecordings',
      getClassroomRecordingDetail: 'getClassroomRecordingDetail',
      getRecordExcelData: 'getRecordExcelData',
      getClassroomRecordCounts: 'getClassroomRecordCounts',
    }),
    ...mapActions({
      download: 'download',
    }),
    ...mapMutations({
      setIsFileLoading: 'setIsFileLoading',
    }),
    closeFileSelectModal: function () {
      this.axiosCancel.cancel();
      this.isFileAllSelectedModal = false;
      this.axiosCancel = null;
    },
    excelDownload: async function (isAll) {
      this.params.recordTypes = [...this.filterRecordTypes];
      const params = {
        classroomId: this.classroomId,
        ...this.params,
        ...this.request,
      };
      const data = !isAll
        ? {
            ...params,
            tagIds: this.params.tags,
            studentIds: params.studentId !== null ? [params.studentId] : params.targets,
          }
        : { classroomId: this.classroomId, recordTypes: this.params.recordTypes };

      if (!isAll) {
        const targetString =
          params.studentId === null ? this.curClassroom.classroomName : this.targets.find((o) => o.studentId === params.studentId).studentName;
        const dateString =
          !params.dateEnd && !params.dateStart && !params.month
            ? '전체'
            : params.month
            ? this.$moment(params.month, 'YYYY-MM', true).format('YYYY년 M월')
            : `${this.$moment(params.dateStart, 'YYYY-MM-DD', true).format('YYYY년 M월 D일')} ~ ${this.$moment(
                params.dateEnd,
                'YYYY-MM-DD',
                true
              ).format('YYYY년 M월 D일')}`;
        this.excelData.params = {
          date: `조회 기간: ${dateString}`,
          targetName: `${targetString} 누가기록`,
          isAll: false,
        };
      } else {
        this.excelData.params = {
          date: '조회 기간: 전체',
          targetName: `${this.curClassroom.classroomName} 누가기록`,
          isAll: true,
        };
      }

      this.excelData.list = await this.getRecordExcelData(data);
      this.closeExcelDropBox();
      this.isExcelDownload = true;
    },
    fileDownload: async function (isAll) {
      if (!isAll && this.deletedIds.length === 0) {
        return false;
      }
      const params = {
        classroomId: this.classroomId,
        recordTypes: ['PHOTO', 'VIDEO', 'AUDIO'],
        recordIds: isAll ? null : this.deletedIds,
      };
      const res = await this.getRecordExcelData(params);

      this.setIsFileLoading(true);
      const arrFiles = res.map((r) => r.files);
      const files = arrFiles.flat();
      try {
        if (files.length === 1) {
          const file = files[0];
          const payload = {
            src: file.fileTranscodePath || file.fileOriginalPath,
            name: file.fileName,
          };
          await this.download(payload)
            .then(() => this.$hiClass.alert('파일 다운로드가 완료되었습니다.', 'success'))
            .catch(() => this.$hiClass.alert('파일 다운로드를 실패하였습니다.', 'error'))
            .finally(() => {
              this.setIsFileLoading(false);
              this.selectedFileIds = [];
            });
        } else {
          const zip = new jszip();
          const archiveFileName = `파일일괄다운로드_${this.$moment().format('YYYYMMDD_HHmmss')}`;
          const requests = [];
          let fileCount = 0;

          for (const file of files) {
            const url = file.fileTranscodePath || file.fileOriginalPath;
            const request = axios({
              method: 'get',
              url: url,
              responseType: 'blob',
              headers: '',
              fileName: file.fileName,
            });
            requests.push(request);
          }

          Promise.all(requests)
            .then((responses) => {
              // zip 파일 압축
              responses.map((res, index) => {
                const fileName = `${index + 1}_${res.config.fileName || files[index].fileName}`;
                const blob = new Blob([res.data], {
                  type: 'application/octet-stream',
                });

                zip.file(fileName, blob);
                fileCount++;

                if (files.length === fileCount) {
                  zip
                    .generateAsync({ type: 'blob' })
                    .then(function (blob) {
                      saveAs(blob, archiveFileName);
                    })
                    .finally(() => {
                      this.setIsFileLoading(false);
                      this.selectedFileIds = [];
                      this.$hiClass.alert('파일 일괄 다운로드가 완료되었습니다.', 'success');
                    });
                }
              });
            })
            .catch(() => {
              this.setIsFileLoading(false);
              this.$hiClass.alert('파일 일괄 다운로드를 실패하였습니다.', 'error');
            });
        }
      } catch (err) {
        this.$log.debug(this.$options.name, `downloadArchiveFile() err => `, err);
        this.setIsFileLoading(false);
      }
    },
    excelDownloadComplete: function () {
      this.isExcelDownload = false;
      this.excelData = {
        params: {
          date: '',
          targetName: '',
          isAll: false,
        },
        list: [],
      };
    },
    openExcelDropBox: function () {
      this.isOpenExcelDropBox = !this.isOpenExcelDropBox;
    },
    closeExcelDropBox: function () {
      this.isOpenExcelDropBox = false;
    },
    moveScrollTop: function () {
      this.$refs.scrollContArea.scrollTo({ top: 0 });
    },
    openTagListModal: function () {
      this.isTagListModal = true;
    },
    closeTagListModal: async function () {
      this.tags = await this.getClassroomTags({ classroomId: this.classroomId });
      this.toggleContentType(this.table);
      this.isTagListModal = false;
    },
    openNugaDetail: async function (id) {
      const res = await this.getClassroomRecordingDetail({
        classroomId: this.classroomId,
        recordId: id,
        isIncludeTargets: true,
      });
      if (res.status === 428) {
        this.$hiClass.alert('삭제된 기록입니다.', 'error');
        return;
      }
      this.studentList = res.targets.map((t) => {
        return {
          checked: true,
          isHidden: false,
          point: 0,
          studentCharacter: t.targetPhoto,
          studentId: t.targetId,
          studentName: t.targetName,
          studentNo: t.studentNo,
        };
      });
      this.nuga = res;
      this.openWhoWriteModal();
    },
    openWhoWriteModal: function () {
      this.isOpenWhoWriteModal = true;
    },
    closeWhoWriteModal: function () {
      this.studentList = [];
      this.nuga = null;
      this.isOpenWhoWriteModal = false;
    },
    whoWriteFinish: function (res) {
      this.changeNugaList(res);
      this.closeWhoWriteModal();
    },
    changeNugaList: function (data) {
      if (data.action === 'add') {
        this.$store.commit('setIsDimLoading', true);
        setTimeout(async () => {
          if (this.table !== 'status') {
            const params = {
              classroomId: this.classroomId,
              ...this.params,
              ...this.request,
            };
            console.log('changeNugaList');
            await this.search(params);
          } else {
            const params = {
              classroomId: this.classroomId,
              ...this.statusParams,
              ...this.request,
            };
            await this.searchStatus(params);
          }
          this.$store.commit('setIsDimLoading', false);
        }, 1000);
      } else {
        const updateData = {
          keyword: [],
          message: data.recordContent,
          recordId: data.recordId,
          recordTimestamp: data.recordTimestamp,
          recordType: data.recordType,
          tags: data.tags,
          insertedTimestamp: data.insertedTimestamp,
          targetNames: data.targets.map((t) => t.targetName),
        };
        const orgRecodings = [...this.records];
        const updateidx = orgRecodings.findIndex((r) => r.recordId === data.recordId);
        orgRecodings[updateidx] = updateData;
        this.records = [...orgRecodings];
      }
    },
    toggleAddButton: function () {
      if (this.table === 'nuga') {
        this.openWhoWriteModal();
      } else {
        this.isOpenRecordAddDropBox = !this.isOpenRecordAddDropBox;
      }
    },
    openAddRecored: function (page) {
      this.$emit('openAdd', page);
    },
    closeRecordAddDropBox: function () {
      if (this.isOpenRecordAddDropBox) {
        this.isOpenRecordAddDropBox = false;
      }
    },
    toggleContentType: async function (type) {
      if (this.table !== type) {
        this.$emit('closeSide');
      }

      if (type === 'nuga') {
        this.nugaDeletedIds = [];
        const deleteList = JSON.parse(localStorage.getItem('nugaDeleteItems'));
        if (deleteList) {
          const diffSec = new Date().getTime() - deleteList.timestamp;
          const diffMin = diffSec / (60 * 1000);
          if (diffMin <= 60) {
            this.nugaDeletedIds = deleteList.deletedIds;
          } else {
            localStorage.removeItem('nugaDeleteItems');
          }
        }
      }

      if (type === 'record') {
        this.recordDeletedIds = [];
        const deleteList = JSON.parse(localStorage.getItem('recordDeleteItems'));
        if (deleteList) {
          const diffSec = new Date().getTime() - deleteList.timestamp;
          const diffMin = diffSec / (60 * 1000);
          if (diffMin <= 60) {
            this.recordDeletedIds = deleteList.deletedIds;
          } else {
            localStorage.removeItem('recordDeleteItems');
          }
        }
      }

      this.isOpenTagFilter = false;
      this.isOpenTargetFilter = false;
      this.isOpenTypeFilter = false;
      this.table = type;
      this.initFilterData(type);
      if (type !== 'status') {
        const params = {
          classroomId: this.classroomId,
          ...this.params,
          ...this.request,
        };
        console.log('test1');
        await this.search(params);
      } else {
        const params = {
          classroomId: this.classroomId,
          ...this.statusParams,
          ...this.request,
        };
        await this.searchStatus(params);
      }
    },
    initFilterData: function (type) {
      if (type === 'search') {
        this.params.recordTypes = ['PHOTO', 'AUDIO', 'VIDEO', 'NUGA'];
        this.params.targets = [...this.targets.map((t) => t.studentId), null];
        this.params.tags = [];
      } else if (type === 'status') {
        this.statusParams = {
          isHidden: false,
          sort: 'studentNo,asc',
        };
      } else {
        this.filterRecordTypes = type === 'nuga' ? ['NUGA'] : ['PHOTO', 'AUDIO', 'VIDEO'];
        this.params.recordTypes = [...this.filterRecordTypes];
        this.filterTargets = [...this.targets.map((t) => t.studentId), null];
        this.params.targets = [...this.filterTargets];
        this.filterTags = type === 'nuga' ? [...this.tags.map((t) => t.tagId), null] : [];
        this.params.tags = [...this.filterTags];
      }
      this.params.sort = 'latest';
    },
    setStatusIsHidden: async function (e) {
      e.preventDefault();
      this.statusParams = {
        ...this.statusParams,
        isHidden: !this.statusParams.isHidden,
      };
    },
    setStatusSort: async function (field) {
      if (field === this.statusSortField) {
        this.statusParams = {
          ...this.statusParams,
          page: 0,
          sort: `${field},${this.statusSortFlag === 'desc' ? 'asc' : 'desc'}`,
        };
      } else {
        this.statusParams = {
          ...this.statusParams,
          page: 0,
          sort: `${field},desc`,
        };
      }
      const params = {
        classroomId: this.classroomId,
        ...this.statusParams,
        ...this.request,
      };
      await this.searchStatus(params);
    },
    clickStatusItem: async function (field, studentId) {
      switch (field) {
        case 'nuga':
          this.filterRecordTypes = ['NUGA'];
          this.params.recordTypes = [...this.filterRecordTypes];
          this.filterTargets = [studentId];
          this.params.targets = [...this.filterTargets];
          this.filterTags = [...this.tags.map((t) => t.tagId), null];
          this.params.tags = [...this.filterTags];
          this.table = 'nuga';
          break;
        default:
          this.filterRecordTypes = [field.toUpperCase()];
          this.params.recordTypes = [...this.filterRecordTypes];
          this.filterTargets = [studentId];
          this.params.targets = [...this.filterTargets];
          this.filterTags = [];
          this.params.tags = [];
          this.table = 'record';
          break;
      }

      this.$emit('closeSide');
      const params = {
        classroomId: this.classroomId,
        ...this.params,
        ...this.request,
      };
      console.log('test2');
      await this.search(params);
    },
    setStatus: function (response) {
      const { _embedded, page } = response;
      const list = _embedded ? _embedded.studentRecords : [];
      if (page.number === 0) {
        this.page = page;
      } else {
        if (list.length > 0) {
          this.page = page;
        }
      }

      this.status = [...list];
      // 키워드로 검색할 때, 키워드 요약 정보를 부모 컴포넌트에 전달
      if (this.request && this.request.keyword) {
        this.$emit('updateSearchSummary', {
          keywordString: this.keywordString,
          totalCount: this.page && this.page.totalElements ? this.page.totalElements : 0,
        });
      }
    },
    setRecords: function (response) {
      console.log('setRecords => ', response, this.table);
      const { _embedded, page } = response;
      let list = _embedded ? _embedded.classroomContents : [];

      if (this.table === 'nuga' && this.nugaDeletedIds.length > 0) {
        list = list.filter((v) => !(this.nugaDeletedIds.findIndex((v2) => v2 === v.recordId) > -1));
      }

      if (this.table === 'record' && this.recordDeletedIds.length > 0) {
        list = list.filter((v) => !(this.recordDeletedIds.findIndex((v2) => v2 === v.recordId) > -1));
      }

      if (page.number === 0) {
        this.page = page;
      } else {
        if (list.length > 0) {
          this.page = page;
        }
      }
      const orgIds = this.records.map((r) => r.recordId);
      this.records = page.number === 0 ? list : [...this.records, ...list.filter((o) => !orgIds.includes(o.recordId))];
      // 키워드로 검색할 때, 키워드 요약 정보를 부모 컴포넌트에 전달
      if (this.request && this.request.keyword && page.number === 0) {
        this.$emit('updateSearchSummary', {
          keywordString: this.keywordString,
          totalCount: this.page && this.page.totalElements ? this.page.totalElements : 0,
        });
      }
    },
    changeSort: function () {
      if (this.params.sort === 'latest') {
        this.params.sort = 'registration';
      } else {
        this.params.sort = 'latest';
      }
      const params = {
        classroomId: this.classroomId,
        ...this.params,
        ...this.request,
      };
      console.log('test3');
      this.search(params);
    },
    openTargetFilter: function () {
      if (this.isTargetFilterAble) {
        this.isOpenTargetFilter = !this.isOpenTargetFilter;
      }
    },
    closeTargetFilter: function (isConfirm) {
      if (isConfirm) {
        this.params.targets = [...this.filterTargets];
        const params = {
          classroomId: this.classroomId,
          ...this.params,
          ...this.request,
        };
        console.log('test4');
        this.search(params);
      } else {
        this.filterTargets = [...this.params.targets];
      }
      this.isOpenTargetFilter = false;
    },
    outSideTargetFilter: function () {
      this.filterTargets = [...this.params.targets];
      this.isOpenTargetFilter = false;
    },
    toggleTargetFilterItem: function (id) {
      if (this.filterTargets.includes(id)) {
        this.filterTargets = this.filterTargets.filter((t) => t !== id);
      } else {
        this.filterTargets.push(id);
      }
    },
    toggleAllTargetSelect: function () {
      if (this.isAllTargetSelected) {
        this.filterTargets = [];
      } else {
        this.filterTargets = [...this.targets.map((t) => t.studentId), null];
      }
    },
    isSelectedTarget: function (id) {
      return this.filterTargets.includes(id);
    },
    openTagFilter: function () {
      if (this.isOterFilterAble) {
        this.isOpenTagFilter = !this.isOpenTagFilter;
      }
    },
    closeTagFilter: function (isConfirm) {
      if (isConfirm) {
        this.params.tags = [...this.filterTags];
        const params = {
          classroomId: this.classroomId,
          ...this.params,
          ...this.request,
        };
        console.log('test5');
        this.search(params);
      } else {
        this.filterTags = [...this.params.tags];
      }
      this.isOpenTagFilter = false;
    },
    outSideTagFilter: function () {
      if (!this.isTagListModal) {
        this.filterTags = [...this.params.tags];
        this.isOpenTagFilter = false;
      }
    },
    toggleTagFilterItem: function (id) {
      if (this.filterTags.includes(id)) {
        this.filterTags = this.filterTags.filter((t) => t !== id);
      } else {
        this.filterTags.push(id);
      }
    },
    toggleAllTagSelect: function () {
      if (this.isAllTagSelected) {
        this.filterTags = [];
      } else {
        this.filterTags = [...this.tags.map((t) => t.tagId), null];
      }
    },
    isSelectedTag: function (id) {
      return this.filterTags.includes(id);
    },
    toggleAllTypeSelect: function () {
      if (this.isAllTypeSelected) {
        this.filterRecordTypes = [];
      } else {
        this.filterRecordTypes = ['PHOTO', 'AUDIO', 'VIDEO'];
      }
    },
    toggleTypeFilterItem: function (type) {
      if (this.filterRecordTypes.includes(type)) {
        this.filterRecordTypes = this.filterRecordTypes.filter((t) => t !== type);
      } else {
        this.filterRecordTypes.push(type);
      }
    },
    isSelectedType: function (type) {
      return this.filterRecordTypes.includes(type);
    },
    openTypeFilter: function () {
      if (this.isOterFilterAble) {
        this.isOpenTypeFilter = !this.isOpenTypeFilter;
      }
    },
    closeTypeFilter: function (isConfirm) {
      if (isConfirm) {
        this.params.recordTypes = [...this.filterRecordTypes];
        const params = {
          classroomId: this.classroomId,
          ...this.params,
          ...this.request,
        };
        console.log('test6');
        this.search(params);
      } else {
        this.filterRecordTypes = [...this.params.recordTypes];
      }
      this.isOpenTypeFilter = false;
    },
    outSideTyepFilter: function () {
      this.filterRecordTypes = [...this.params.recordTypes];
      this.isOpenTypeFilter = false;
    },
    toggleRows: function (id) {
      if (this.deletedIds.includes(id)) {
        this.deletedIds = this.deletedIds.filter((t) => t !== id);
      } else {
        this.deletedIds.push(id);
      }
    },
    toggleAllRows: async function () {
      if (this.isAllRows) {
        this.deletedIds = [];
      } else {
        if (this.page.totalElements === this.records.length) {
          this.deletedIds = this.records.map((o) => o.recordId);
        } else {
          const axiosSource = axios.CancelToken.source();
          this.axiosCancel = { cancel: axiosSource.cancel };
          this.isFileAllSelectedModal = true;
          const pageCount = this.page.totalPages - (this.page.number + 1);
          const pages = [...Array(pageCount).keys()].map((p) => p + (this.page.number + 1));

          if (pages.length > 0) {
            for await (const page of pages) {
              const params = {
                classroomId: this.classroomId,
                ...this.params,
                ...this.request,
                page,
              };
              console.log('test7');
              await this.search(params);
            }
          }

          this.deletedIds = this.records.map((o) => o.recordId);
          this.isFileAllSelectedModal = false;
          this.axiosCancel = null;
        }
      }
    },
    deleteRow: function (id) {
      this.confirmModal = {
        isOpen: true,
        title: '선택한 기록을 삭제하시겠습니까?',
        description: '삭제된 기록은 복원이 불가합니다.',
        confirmButtonText: '삭제',
        confirmButtonColor: '#F04F59',
        deleteId: id,
      };
    },
    openConfirmModal: function () {
      if (this.deletedIds.length > 0) {
        this.confirmModal = {
          isOpen: true,
          title: '선택한 기록을 삭제하시겠습니까?',
          description: '삭제된 기록은 복원이 불가합니다.',
          confirmButtonText: '삭제',
          confirmButtonColor: '#F04F59',
          deleteId: null,
        };
      }
    },
    closeConfirmModal: async function (isConfirm) {
      if (isConfirm) {
        if (this.confirmModal.deleteId !== null) {
          await this.deleteMultiRecordings({ classroomId: this.classroomId, recordIds: [this.confirmModal.deleteId] });
          this.records = this.records.filter((r) => r.recordId !== this.confirmModal.deleteId);
          this.page.totalElements = this.page.totalElements - 1;
          this.page.totalPages = Math.ceil(this.page.totalElements / 20);
        } else {
          if (this.table === 'nuga') {
            let localStorageDeletedIds = [];
            const deleteList = JSON.parse(localStorage.getItem('nugaDeleteItems'));
            if (deleteList) {
              localStorageDeletedIds = deleteList.deletedIds;
            }

            const recordDeleteItems = {
              timestamp: new Date().getTime(),
              deletedIds: [...localStorageDeletedIds, ...this.deletedIds],
            };

            localStorage.setItem('nugaDeleteItems', JSON.stringify(recordDeleteItems));
          } else if (this.table === 'record') {
            let localStorageDeletedIds = [];
            const deleteList = JSON.parse(localStorage.getItem('recordDeleteItems'));
            if (deleteList) {
              localStorageDeletedIds = deleteList.deletedIds;
            }

            const recordDeleteItems = {
              timestamp: new Date().getTime(),
              deletedIds: [...localStorageDeletedIds, ...this.deletedIds],
            };

            localStorage.setItem('recordDeleteItems', JSON.stringify(recordDeleteItems));
          }

          await this.deleteMultiRecordings({ classroomId: this.classroomId, recordIds: this.deletedIds });
          this.records = this.records.filter((r) => !this.deletedIds.includes(r.recordId));
          this.page.totalElements = this.page.totalElements - this.deletedIds.length;
          this.page.totalPages = Math.ceil(this.page.totalElements / 20);

          this.deletedIds = [];
        }
      }
      this.confirmModal = {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        deleteId: null,
      };
    },
    removeEmptyValue: function (params) {
      if (!params) return {};

      const returnParams = {};

      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          returnParams[key] = params[key];
        }
      });

      return returnParams;
    },
    searchStatus: async function (params) {
      const request = {
        classroomId: params.classroomId,
        sort: params.sort,
        month: params.month,
        dateEnd: params.dateEnd,
        dateStart: params.dateStart,
        size: 20,
      };
      if (request.page === 0) {
        this.moveScrollTop();
      }
      const response = await this.getClassroomRecordCounts({
        ...this.removeEmptyValue(request),
      });
      this.setStatus(response);
    },
    search: async function (params) {
      if (!params.page) {
        this.deletedIds = [];
      }

      if (params.keyword !== null) {
        const { display, content } = params.keyword;
        let requestParams = {
          classroomId: params.classroomId,
          recordTypes: [...params.recordTypes],
          sort: params.sort,
          month: params.month,
          dateEnd: params.dateEnd,
          dateStart: params.dateStart,
          page: params.page ? params.page : 0,
          size: 20,
        };
        if (display === null) {
          requestParams.keyword = content;
        } else {
          if (display.indexOf('#') !== 0) {
            requestParams.studentIds = [content];
          } else {
            requestParams.tagIds = [content];
          }
        }
        if (requestParams.page === 0) {
          this.moveScrollTop();
        }
        const response = await this.getClassroomRecordReportsSearch(requestParams);
        console.log('asdlkasjdklasjdl');
        this.setRecords(response);
      } else {
        const requestParams = {
          classroomId: params.classroomId,
          month: params.month,
          dateEnd: params.dateEnd,
          dateStart: params.dateStart,
          recordTypes: params.recordTypes,
          sort: params.sort,
          tagIds: params.tags,
          studentIds: params.studentId !== null ? [params.studentId] : params.targets,
          page: params.page ? params.page : 0,
          size: 20,
        };
        if (requestParams.page === 0) {
          this.moveScrollTop();
        }
        const response = await this.getClassroomRecordReports(requestParams);
        console.log('eorjhweoijfsdvmns');
        this.setRecords(response);
      }
    },
    openRecordDetail: function (params) {
      if (params.type === 'NUGA') {
        this.openNugaDetail(params.id);
      } else {
        this.$emit('openDetail', params.id);
      }
    },
    changeCardList: function (params) {
      switch (params.action) {
        case 'delete':
          this.records = this.records.filter((r) => r.recordId !== params.id);
          this.page.totalElements = this.page.totalElements - 1;
          this.page.totalPages = Math.ceil(this.page.totalElements / 20);
          break;
        case 'message': {
          const orgRecodings = [...this.records];
          const updateidx = orgRecodings.findIndex((r) => r.recordId === params.id);
          orgRecodings[updateidx].message = params.message;
          this.records = [...orgRecodings];
          break;
        }
        case 'target': {
          const orgRecodings = [...this.records];
          const updateidx = orgRecodings.findIndex((r) => r.recordId === params.id);
          orgRecodings[updateidx].targetNames = params.targetNames;
          this.records = [...orgRecodings];
          break;
        }
        case 'style': {
          const orgRecodings = [...this.records];
          const updateidx = orgRecodings.findIndex((r) => r.recordId === params.id);
          orgRecodings[updateidx].recordStyle = params.recordStyle;
          this.records = [...orgRecodings];
          break;
        }
        case 'file': {
          const orgRecodings = [...this.records];
          const updateidx = orgRecodings.findIndex((r) => r.recordId === params.id);
          orgRecodings[updateidx].fileCount = params.fileCount;
          orgRecodings[updateidx].fileThumbnailPath = params.fileThumbnailPath;
          this.records = [...orgRecodings];
          break;
        }
        case 'add': {
          this.$store.commit('setIsDimLoading', true);
          setTimeout(async () => {
            this.$emit('closeSide');
            if (this.table !== 'status') {
              const params = {
                classroomId: this.classroomId,
                ...this.params,
                ...this.request,
              };
              console.log('test8');
              await this.search(params);
            } else {
              const params = {
                classroomId: this.classroomId,
                ...this.statusParams,
                ...this.request,
              };
              await this.searchStatus(params);
            }
            this.$store.commit('setIsDimLoading', false);
          }, 1000);
          break;
        }
      }
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
          root: this.$refs.scrollContArea,
          rootMargin: '200px',
          threshold: 1,
        };

        const callback = async ([entry]) => {
          if (entry.isIntersecting) {
            if (this.table !== 'status') {
              const params = {
                classroomId: this.classroomId,
                ...this.params,
                ...this.request,
                page: this.page.number + 1,
              };
              console.log('test9');
              this.search(params);
            } else {
              const params = {
                classroomId: this.classroomId,
                ...this.statusParams,
                ...this.request,
                page: this.page.number + 1,
              };
              await this.searchStatus(params);
            }
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
    this.targets = await this.getClassroomStudents({ classroomId: this.classroomId });
    this.tags = await this.getClassroomTags({ classroomId: this.classroomId });
    if (this.isTargetFilterAble) {
      this.initFilterData('status');
      const params = {
        classroomId: this.classroomId,
        ...this.statusParams,
        ...this.request,
      };
      await this.searchStatus(params);
    } else {
      this.table = 'nuga';
      if (this.request.keyword === null) {
        this.initFilterData(this.table);
      } else {
        this.initFilterData('search');
      }

      const params = {
        classroomId: this.classroomId,
        ...this.params,
        ...this.request,
      };
      console.log('test1111111');
      await this.search(params);
    }

    this.scrollObserver();
    this.visibleScrollTopButton();
  },
  mounted() {
    eventBus.$on('change-list', (params) => {
      console.log('tes2222');
      if (['record', 'status'].includes(this.table)) {
        this.changeCardList(params);
      }
    });
    this.obsRef = this.$refs.scrollListAccess;
  },
  beforeDestroy() {
    eventBus.$off('change-list');
  },
};
</script>

<style scoped>
.record-tab-content {
  width: 100%;
  height: calc(100% - 58px);
}
.hidden {
  color: #9e9e9e !important;
}
.no-data-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 350px) !important;
}
.no-data-bg span.no-data {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
}
.no-data-bg span.no-data span {
  font-size: 15px;
  color: var(--gray-08);
}
.behavior-wrapper__body
  .behavior-wrapper__body__content
  .report
  .report__content
  .record-tab-content
  .tab-content-header
  .action-wrap
  .add-dropbox-wrap
  li.dis {
  color: #9e9e9e !important;
  background: #fff !important;
}
</style>