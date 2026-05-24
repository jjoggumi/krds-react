<!--
@File(Method): Personnels.vue
@Description: 학급기록 > 인원체크
@Modified: #74594 인원체크 상세 새창 분리
-->
<template>
  <div class="behavior-wrapper__body__content">
    <div class="record inwon">

      <div class="record-list">
        <div class="record-list__top-menu" 
          :class="{
            search: isSearch === true
          }"
        >
          <div class="title">
            <h2>인원체크</h2>
          </div>
          <div class="search">
            <label>
              <template v-if="isSearch === true && searchKind === 'user'">
                <p class="search-user">
                  {{ searchUser.studentNo }}. {{ searchUser.studentName }}
                  <button><i class="bh-icon-close-8" @click="searchStudentReset"></i></button>
                </p>
              </template>
              <template v-if="isSearch === true && searchKind === 'date'">
                <p class="search-user">
                  {{ searchText }}
                  <button ><i class="bh-icon-close-8" @click="keyWordSearchReset"></i></button>
                </p>
              </template>
              <input type="text" 
                class="searchInwonInput"
                :class="{
                  on : searchInputText
                }"
                maxlength="20"
                v-model="searchInputText" 
                :readonly="searchKind === 'date'"
                :placeholder="searchKind === 'date' ? '' : '제목을 검색하거나 @학생명으로 검색하세요.'" 
                @keyup.enter="keyWordSearch" 
                @input="[searchInputLength($event), checkSearchStudent($event)]"
                @keydown="searchInputLength($event)"
                @keyup="searchInputLength($event)"
                @click="clickSearchStudent($event)" 
                />
              <template v-if="(searchKind === 'keyword' || searchInputText.length > 0) && searchKind !== 'user'">
                <i class="input-btn-delete bh-icon-close-circle-fill-24 cursor-pointer" @click="keyWordSearchReset"></i>
                <span class="line"></span>
              </template>
              <i class="input-btn-calendar bh-icon-calendar-24 cursor-pointer" @click="openPopupCalendarSearch"></i>
              <button class="btn-search" :disabled="isOnSearch === false" @click="keyWordSearch">
                <i class="input-btn-search bh-icon-search-24 cursor-pointer"></i>
              </button>
              <div class="search-student-list" ref="onSearchStudentsList" v-if="isSearchStudent === true" v-click-outside="closeSearchStudent">
                <drop-down-wrapper
                  :totalElements="searchStudents.length" 
                  itemTag="li.drop-item"
                  @enter="dropdownEnter"
                >
                  <template slot-scope="scopeProps">
                    <ul>
                    <template v-if="searchStudents.length > 0">
                      <li class="drop-item" :class="{selected: scopeProps.selected === index}" v-for="(item, index) of searchStudents" ref="onSearchStudents" :key="`search-student-list-${item.studentId}`" @click="searchStudentSelect($event, item)">
                        <span class="image">
                          <img :class="{'is-photo': isPhoto(item)}" :src="selectedImageSrc(item)" />
                        </span>
                        <span class="num">{{ item.studentNo }}</span>
                        <span class="name" :class="{
                          hidden: item.isHidden === true
                        }">{{ item.studentName }}</span>
                      </li>
                    </template>

                    <template v-else>
                      <li>
                        <span class="nodata">일치하는 학생이 없습니다</span>
                      </li>
                    </template>
                  </ul>
                  </template>
                  
                </drop-down-wrapper>
              </div>
              <template v-if="isPopupCalendarSearch === true">
                <calendar-monthly
                    v-if="calType === 'day'"
                    :timestamp="calendarDateTimestampSearch"
                    :value-goe="null"
                    :isBoardUse="true"
                    :isNoPreSelect="true"
                    :calendarType="'type03'"
                    v-click-outside="closePopupCalendarSearch"
                    @selectedDate="setCalendarDateTimestampSearch"
                    @close="closePopupCalendarSelectSearch"
                    @changeCalendar="changeCalendar"
                  />
                  <main-body-calendar-picker-month
                    v-if="calType === 'month'"
                    style="display:block;"
                    :year="parseInt(selected.year)"
                    :month="parseInt(selected.month)"
                    :total="false"
                    :change="true"
                    :isRecord="true"
                    v-click-outside="closePopupCalendarSearch"
                    @changeCalendar="changeCalendar"
                    @choiceMonth="setMonthFilter"
                  />
              </template>
            </label>
          </div>
          <div class="choice" v-if="isSearch === false">
            <button :class="{on : searchParams.isCompleted === false}" @click="choiceChange('')">진행</button>
            <button :class="{on : searchParams.isCompleted === true}" @click="choiceChange('completed')">완료</button>
          </div>
        </div>
        
        <div
            ref="recordingListArea"
            class="record-list__list"
            :class="{search: isSearch, nodata: !(list.length > 0)}"
            v-infinite-scroll="getList"
            :infinite-scroll-disabled="loadFinish"
            :infinite-scroll-distance="400"
        >
        
          <FinishToast
            className="finish-toast"
            :message="toastMessage"
            @undo="checkFinishEsc"
            @finish-toast-ready="el => leftFinishToastDom = el "
          />

          <div class="info" v-if="isSearch === true">
            <p class="count">
              <span class="search"><strong>'{{ searchText }}'</strong>&nbsp;검색 결과 {{ searchTotalElements }}건</span>
            </p>
            <div class="menu">
              <span class="cursor-pointer" @click="openListSearchSort(searchedParams.sort)">
                <i class="bh-icon-drawnup-20"></i>
                <template v-if="searchedParams.sort === 'latest'">
                  최신순
                </template>

                <template v-else-if="searchedParams.sort === 'registration'">
                  등록순
                </template>
              </span>
              <ul v-if="isSearchSort === true">
                <li @click="getListSearchSort('latest')">최신순</li>
                <li @click="getListSearchSort('registration')">등록순</li>
              </ul>
            </div>
          </div>
          
          <template v-if="list.length > 0">
            <div class="card cursor-pointer" 
              v-for="item of list" :key="`memo-list-${item.checklistId}-${getInwonCheckComplete(item.checklistId)}-${getInwonCheckProgress(item.checklistId)}`"
              :class="{
                memo : item.checklistType === 'MEMO',
                point : item.checklistType === 'SCORE',
                check : item.checklistType === 'CHECK',
                level : item.checklistType === 'LEVEL_COMMENT',
                finish: item.isCompleted === true,
                on: item.checklistId === selectItem.checklistId,
                new: item.checklistId === newAddId,
                searchInwon: searchKind === 'user'
              }" 
            >
              <div class="check">
                <template v-if="getInwonCheckComplete(item.checklistId) === false && getInwonCheckProgress(item.checklistId) === false">
                  <input type="checkbox" :ref="`chk-personnel-${item.checklistId}`" :id="`chk-personnel-${item.checklistId}`" @click.stop="checkFinish(item)" 
                    :checked="item.isCompleted === true"
                  />
                  <label :for="`chk-personnel-${item.checklistId}`"></label>
                </template>

                <template v-else-if="getInwonCheckComplete(item.checklistId) === true">
                  <lottie :options="inwonCheckComplete" />
                </template>

                <template v-else-if="getInwonCheckProgress(item.checklistId) === true">
                  <lottie :options="inwonCheckProgress" />
                </template>
                <em>
                  <template v-if="item.isCompleted === true">
                    진행으로 변경
                  </template>

                  <template v-else>
                    체크 완료
                  </template>
                </em>
              </div>

              <div class="content" @click="openContentLayer(item)">
                <p class="title">
                  <template v-if="searchKind === 'keyword'">
                    <strong :inner-html.prop="searchedTitleHighlight(item.checklistTitle)"></strong>
                  </template>
                  
                  <template v-else>
                    {{ item.checklistTitle }}
                  </template>
                </p>
                <p class="etc">
                  <span class="date"><template v-if="searchKind === 'user'">{{ searchUser.studentNo }}. {{ searchUser.studentName }} | </template>{{ selectedDateString(dateConvertTimeStamp(item.checklistDate)) }}</span>
                </p>
              </div>

              <div class="btn-wrap">
                <button class="pinup" 
                  :class="{
                    on: item.isPin
                  }" 
                  @click="pinUp(item)"
                  v-if="item.isCompleted === false"
                  >
                  <i class="bh-icon-pinup-24"></i>
                  <em>
                    <template v-if="item.isPin === true">
                      고정 해제
                    </template>

                    <template v-else>
                      상단 고정
                    </template>
                  </em>
                </button>
                <button class="copy" @click="copyItem(item)">
                  <i class="bh-icon-copy-gray-24"></i>
                  <em>복사</em>
                </button>
                <button class="delete" @click="deleteList(item)">
                  <i class="bh-icon-delete-gray-24"></i>
                  <em>삭제</em>
                </button>
              </div>

              <div class="searchInfo" v-if="searchKind === 'user'" @click="openContentLayer(item)">

                <div v-for="checklistStudent in item.checklistStudents" :key="`searchInfo-searchInfo-${checklistStudent.studentId}`">

                  <template v-if="item.checklistType === 'CHECK' || item.checklistType === 'SCORE'">
                    <div v-html="formatSearchHtml(checklistStudent, item.checklistItems, item.checklistType)"></div>
                    <p class="checked">체크되었습니다.</p>
                  </template>

                  <template v-else-if="item.checklistType === 'MEMO'">
                    <p>{{ checklistStudent.checkMemo }} 입력되었습니다.</p>
                  </template>
                  
                  <template v-else-if="item.checklistType === 'LEVEL_COMMENT'">
                    <p>{{ formatLevelText(checklistStudent, item.checklistItems) }} 입력되었습니다.</p>
                  </template>
                </div>

              </div>
            </div>
          </template>

          <template v-else>
            <div class="nodata-bg">
              <div class="nodata">
                <i class="bh-icon-warning-circle-fill-52"></i>
                <span>
                  <template v-if="isSearch === true">
                    검색 결과가 없습니다.
                  </template>

                  <template v-else>
                    내역이 없습니다.
                  </template>
                </span>  
              </div>
            </div>
          </template>

          <div class="list-float-wrap-bottom-right">
            <div ref="scrollTop" class="scroll-top" @click="moveScrollTop">
              <i class="bh-icon-arrowup-32"></i>
            </div>

            <div class="card-add cursor-pointer" 
              :class="{add : !isFloatingMenuView, del: isFloatingMenuView}"
              @click="viewCardAddList"
              v-click-outside="closeFloating">
              <i :class="{
                'bh-icon-plus-transparent-24' : !isFloatingMenuView, 
                'bh-icon-close-32': isFloatingMenuView}"></i>
              <div v-if="isFloatingMenuView" class="card-add-list">
                <ul>
                  <li
                    v-for="item in writeCards"
                    :key="item.type"
                    @click="openWritePage(item.type)"
                  >
                    <i :class="item.icon"></i>
                    <span>{{ CARD_LABEL[item.type] }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- record-write -->
      <RecordWrite :fnOpenWritePage="openWritePage"/>
      <!-- /record-write -->

      <RecordEdit
          v-if="isContentLayerOpen"
          ref="recordEdit"
          :is-search="isSearch"
          :search-kind="searchKind"
          :inwon-check-complete-list="inwonCheckCompleteList"
          :inwon-check-progress-list="inwonCheckProgressList"
          @checkFinish="checkFinish"
          @closeContentLayer="closeContentLayer"
          @updateList="updateList"
          @updateChecklistTitle="updateChecklistTitle"
          @filterCompleteList="filterCompleteList"
          @filterProgressList="filterProgressList"
          @appendCompleteList="appendCompleteList"
          @appendProgressList="appendProgressList"
          @setIsComplete="setIsComplete"
      />
    </div>

    <personnel-write
      v-if="isPersonnelWrite" 
      :mode="writeMode"
      @close="closeWritePage" 
      @update="updateList"
    />
    <!-- <point-write />
    <memo-write /> -->
    
    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      :isAlert="confirmModal.isAlert"
      @closeConfirmDialog="closeConfirmModal"
    />

    <!-- 최초로 인쇄하기 시 시점 문제로 인해 css svg 가 로드되지 않는 문제가 있어 아래 element로 미리 불러온다. -->
    <div class="personnel-pdf-container" style="visibility: hidden">
      <p v-for="t of ['a', 'b', 'c', 'd', 'e', 'point']" :key="t" :class="`check-list check-${t} checked`">
        <i></i>
      </p>
    </div>
  </div>
</template>

<script>
import DropDownWrapper from '@/apps/behavior/components/common/DropDownWrapper.vue';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue';
import PersonnelWrite from '@/apps/behavior/pages/personnel/modal/PersonnelWrite.vue';
import MainBodyCalendarPickerMonth from "@/apps/main/clazzes/MainBodyCalendarPickerMonth";
import CalendarMonthly from "@/components/Calendar/CalendarMonthly";
import Lottie from "@/components/Lottie/Lottie";
import FinishToast from '@/apps/behavior/pages/personnel/components/FinishToast.vue';
import RecordWrite from '@/apps/behavior/pages/personnel/components/RecordWrite.vue';
import RecordEdit from "@/apps/behavior/pages/personnel/components/RecordEdit.vue";

import { mapActions, mapState } from 'vuex';
import * as inwonCheckComplete from '@/assets/img/icon/bh_inwon_check_complete.json';
import * as inwonCheckProgress from '@/assets/img/icon/bh_inwon_check_progress.json';

import { CARD_LABEL, CARD_META } from '@/apps/behavior/pages/personnel/personnel.js';

import {useChecklistController} from "@/apps/behavior/modules/personnel";
const checklistController = useChecklistController();

export default {
  name: 'personnels',
  components: {
    RecordEdit,
    PersonnelWrite,
    ConfirmModal,
    CalendarMonthly,
    MainBodyCalendarPickerMonth,
    DropDownWrapper,
    Lottie,
    FinishToast,
    RecordWrite
  },
  data() {
    return {
      isContentLayerOpen: false,
      isFloatingMenuView: false,
      writeMode: "",
      isPersonnelWrite: false,
      list: [],
      updateListCopy: [],
      searchParams: {
        userId: this.userId(),
        isCompleted: false,
        isPin: null,
        page: 0,
        size: 20,
      },
      paging: {
        number: 0,
        totalPages: 0
      },
      isPopupCalendarSearch: false,
      calendarDateTimestampSearch: null,
      isSearch: false,
      searchTotalElements: 0,
      searchedParams : {
        keyword: '',
        sort: 'latest',
        recordTypes: ['CHECKLIST'],
        page: 0,
        size: 20,
      },
      searchKind: "",
      searchInputText: "",
      searchText: "",
      searchUser: {},
      isSearchSort: false,
      isSearchStudent: false,
      searchStudents: [],
      searchStudentsCopy: [],
      loadFinish: false,
      isSearching: false,
      obsRef: null,
      observer: null,
      escItem: {},
      selectItem: {},
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmButtonText: '',
        confirmButtonColor: '',
        action: '',
        target: null,
        isAlert: false
      },
      isPopupCalendar: false,
      calType: 'day',
      selected: {
        year: this.$moment().format('YYYY'),
        month: this.$moment().format('M')
      },
      toastMessage : {
        text: "",
        kind: ""
      },
      newAddId: "",
      inwonCheckComplete: {animationData: inwonCheckComplete},
      inwonCheckProgress: {animationData: inwonCheckProgress},
      inwonCheckCompleteList: [],
      inwonCheckProgressList: [],
      nextPageList: [],
      pinUpId: "",
      
      leftFinishToastDom: null,
      writeCards: CARD_META,
      CARD_LABEL,
      debouncedUserItemMemo: null
    }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
    }),
    classroomId: function() {
      return this.curClassroom.classroomId
    },
    isOnSearch: function() {
      return this.searchInputText.trim() !== "" || this.isSearch === true
    }
  },
  watch: {
    classroomId(n, o) {
      if (this.$refs.recordEdit) {
        this.$refs.recordEdit.close()
      }
      this.initSearch()
      this.initList()
      this.loadFinish = false
      this.searchParams.page = 0
      this.searchParams.size = 20
      this.selectItem = {}
      this.newAddId = ""
      this.getList()
      checklistController.setClassroomId(this.classroomId)
    }
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudentDetail: 'getClassroomStudentDetail'
    }),
    isPhoto: function(student) {
      return student.studentPhoto !== null
    },
    selectedImageSrc: function(student) {
      return this.isPhoto(student) 
        ? student.studentPhoto
        : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`
    },
    dropdownEnter: function(idx) {
      if(idx !== null) {
        this.searchStudentSelect(null, this.searchStudents[idx])
      }
    },
    choiceChange: function(data) {
      this.newAddId = ""
      if(data === 'completed') {
        this.searchParams.isCompleted = true
      } else {
        this.searchParams.isCompleted = false
      }

      this.initList()
      this.loadFinish = false
      this.searchParams.page = 0
      this.searchParams.size = 20
      this.getList()
    },
    getList: async function() {
      if (this.loadFinish) return
      if (this.isSearching) return

      if (this.isSearch === true) {
        this.isSearching = true
        try {
          const obj = {
            ...this.searchedParams
          }
          const listRes = await this.$axios({
            method: 'POST',
            url: `/classroom/${this.curClassroom.classroomId}/checklists/search`,
            data: this.searchedParams,
            params: {page: obj.page, size: obj.size}
          })

          this.paging.number = listRes.data.page.number
          this.searchedParams.page++
          this.paging.totalPages = listRes.data.page.totalPages
          this.loadFinish = listRes.data.page.totalPages <= this.searchedParams.page
          this.searchTotalElements = listRes.data.page.totalElements

          if (listRes.data.page.totalElements > 0) {
            const data = listRes.data._embedded.classroomContents
            if (data.length > 0) {
              this.list.push(...data)
            }
          }
        } catch(err) {
          this.$log.debug('checklists search POST() error => ', err)
        } finally {
          this.isSearching = false
        }
      } else {
        try {
          const listRes = await this.$axios({
            method: 'GET',
            url: `/classroom/${this.curClassroom.classroomId}/checklists`,
            params: this.searchParams
          })

          this.searchParams.page++
          this.paging.totalPages = listRes.data.page.totalPages
          this.loadFinish = listRes.data.page.totalPages <= this.searchParams.page

          if (listRes.data.page.totalElements > 0) {
            const data = listRes.data._embedded.classroomChecklists
            if (data.length > 0) {
              this.list.push(...data)
            }
          }
        } catch(err) {
          this.$log.debug('checklists GET() error => ', err)
        }
      }
    },
    getListSearchSort: function(sort) {
      this.isSearchSort = false
      this.searchedParams.sort = sort

      this.initList()
      this.loadFinish = false
      this.searchedParams.page = 0
      this.getList()
    },
    checkSearchStudent: function(e) {
      this.searchInputText = e.target.value
      if(e.target.value.substr(0, 1) === "@") {
        this.isSearchStudent = true
        this.getSearchStudentsKeydown()
      } else {
        this.isSearchStudent = false
      }
    },
    clickSearchStudent: function(e) {
      this.searchInputText = e.target.value
      if(e.target.value.substr(0, 1) === "@") {
        this.isSearchStudent = true
      } else {
        this.isSearchStudent = false
      }
    },
    closeSearchStudent: function(e) {
      if(e.target.classList.contains("searchInwonInput") === false) {
        this.isSearchStudent = false
      }
    },
    getSearchStudentsKeydown: function() {
      if(this.searchInputText.substr(0, 1) === "@") {
        if(this.searchInputText.substr(1) !== "") {
          const keyword = this.searchInputText.substr(1)
          this.searchStudents = this.searchStudentsCopy.filter(item => {
            return item.studentName.search(keyword) > -1
          })
        } else {
          this.getSearchStudents()
        }
      }
    },
    getSearchStudents: async function() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/classroom/${this.curClassroom.classroomId}/students`,
          params: {
            userId : this.userId()
          }
        })
      
        if(res.data._embedded) {
          this.searchStudents = res.data._embedded.classroomStudents
          this.searchStudentsCopy = JSON.parse(JSON.stringify(this.searchStudents))
        }
      } catch (err) {
        this.$log.debug('classroom checklist students GET() error => ', err)
      }
    },
    searchStudentSelect: async function(e, item) {
      if(e !== null) {
        e.preventDefault()
      }

      this.$refs.recordEdit?.close()
      const res = await this.getClassroomStudentDetail({
        classroomId: this.classroomId,
        studentId: item.studentId
      })
            
      if(res.status !== 200) {
        this.$hiClass.alert('삭제된 학생입니다.')
        return false
      }

      this.selectItem = {}

      this.initList()
      this.isSearchStudent = false
      this.isSearch = true
      this.searchKind = "user"
      this.searchUser = {
        studentNo : item.studentNo,
        studentName : item.studentName
      }
      this.searchText = `${item.studentNo}. ${item.studentName}`
      this.searchedParams.studentIds = [item.studentId]
      this.initListSearch('user')
      this.getList()
    },
    searchStudentReset: function(e) {
      e.stopPropagation()
      this.initList()
      this.isSearch = false
      this.searchKind = ""
      this.searchText = ""
      this.searchInputText = ""
      this.initListSearch('all')
      this.getList()
    },
    keyWordSearch: function(e) {
      e.preventDefault()
      this.$refs.recordEdit?.close()
      this.selectItem = {}

      if(this.searchInputText !== "@" && this.searchInputText.trim() !== "") {
        this.initList()
        this.isSearch = true
        this.searchKind = "keyword"
        this.searchText = this.searchInputText
        this.searchedParams.keyword = this.searchInputText
        this.initListSearch('keyword')
        this.getList()
      } else if(this.searchInputText.trim() === "") {
        this.initList()
        this.isSearch = false
        this.searchKind = ""
        this.searchText = ""
        this.initListSearch('all')
        this.getList()
      }
    },
    keyWordSearchReset: function() {
      this.searchInputText = ""

      if(this.searchKind === "keyword" || this.searchKind === "date") {
        this.initList()
        this.isSearch = false
        this.searchKind = ""
        this.searchText = ""
        this.initListSearch('all')
        this.getList()
      }
    },
    searchedTitleHighlight: function(title) {
      title = title ? title.replaceAll('>', '&gt;').replaceAll('<', '&lt;') : title
      if(this.searchText) {
        const regex = new RegExp(`(${this.searchText})(?![^<]*>)(?![^&amp;|&nbsp;|&lt;|&gt;|&quot;|&ndash;|&mdash;|&copy;|&reg;|&trade;|&asymp;|&ne;|&pound;|&euro;|&deg;]*;)`, "gi")
        return title.replace(regex, "<span class='highlight01'>" + this.searchText + "</span>")
      } else {
        return title
      }
    },
    initListSearch: function(data) {
      if(data === "user") {
        this.searchedParams.month = null
        this.searchedParams.dateStart = null
        this.searchedParams.dateEnd = null
        this.searchedParams.keyword = null
      } else if(data === 'date') {
        this.searchedParams.month = null
        this.searchedParams.studentIds = null
        this.searchedParams.keyword = null
        this.searchUser = {}
      } else if(data === 'date-m') {
        this.searchedParams.dateStart = null
        this.searchedParams.dateEnd = null
        this.searchedParams.studentIds = null
        this.searchedParams.keyword = null
        this.searchUser = {}
      } else if(data === 'keyword') {
        this.searchedParams.month = null
        this.searchedParams.dateStart = null
        this.searchedParams.dateEnd = null
        this.searchedParams.studentIds = null
        this.searchUser = {}
      } else if(data === 'all') {
        this.searchedParams.month = null
        this.searchedParams.dateStart = null
        this.searchedParams.dateEnd = null
        this.searchedParams.studentIds = null
        this.searchedParams.keyword = null
        this.searchUser = {}
      }
      this.loadFinish = false
      this.searchedParams.page = 0
      this.searchParams.page = 0
      this.searchParams.size = 20
    },
    // #77458 (리팩) 체크판,점수판 검색 결과 설명 html 변환으로 변경 (formatSearchHtml)
    // userCheckedInfo: function(checklistItems, key) {
    //   const obj = checklistItems.find(v => v.itemKey === key)
    //   return obj.itemLabel
    // },
    formatSearchHtml: function(student, labels, type) {
      // #77458 (리팩) 체크판,점수판 검색 결과 설명 html 변환
      let tag = '';
      labels.forEach(({itemKey, itemLabel}, idx) => {
        if ( student[`checkItem${itemKey}`] ) {
          tag += `
            <p>
              <span
                class="checkLabel ${type.toLowerCase()}${idx}"
                style="'margin-right': ${itemLabel ? '6px':'0px'}"
              ><i></i></span>&nbsp;${itemLabel || ''}
              </span>
            </p>
          `
        }
      })
      return tag;
    },
    formatLevelText: function(student, labels) {
      // #77458 평가판 검색 결과 설명란 text 변환
      let str = ''
      labels.forEach(({itemKey, itemLabel}) => {
        if ( student[`levelComment${itemKey}`] ) {
          str += `${itemLabel || ''} ${student[`levelComment${itemKey}`]}, `
        }
      })
      if (student.checkMemo) {
        str += `${student.checkMemo} `
      }
      return str.replace(/[\s,]+$/, '');
    },
    initList: function() {
      this.list = []
    },
    initSearch: function() {
      this.isSearch = false
      this.searchKind = ""
      this.searchInputText = ""
      this.searchText = ""
      this.searchUser = {}
      this.isSearchSort = false
      this.isSearchStudent = false
      this.searchStudents = []
    },
    updateList: async function(page, mode = null, item = null) {
      this.newAddId = ""
      if (mode === 'writeFinish') {
        this.initSearch()
      }

      if (this.isSearch === true) {
        if(page <= this.searchedParams.page) {
          try {
            const listRes = await this.$axios({
              method: 'POST',
              url: `/classroom/${this.curClassroom.classroomId}/checklists/search`,
              data: this.searchedParams,
              params: { page }
            })

            if (listRes.data._embedded) {
              const data = listRes.data._embedded.classroomContents.filter(v => v.checklistId)
              this.updateListCopy = [...this.updateListCopy, ...data]
            }
          } catch(err) {
            this.$log.debug('updatelist checklists search POST() error => ', err)
          }

          await this.updateList(page + 1, mode)
        }

        if (page === this.searchedParams.page) {
          this.list = JSON.parse(JSON.stringify(this.updateListCopy))

          // 검색에서 추가했을때 
          if (mode === 'copy') this.list.unshift(this.selectItem)
          this.updateListCopy = []

          if (mode === 'pinout' || mode === 'pinup') {
            this.pinUpNewListSearch(mode)
          }
        }
      } else {
        if (mode === 'writeFinish') {
          const listItem = {
            checklistId: item.checklistId,
            checklistDate: item.checklistDate,
            checklistTitle: item.checklistTitle,
            checklistType: item.checklistType,
            isCompleted: item.isCompleted,
            isPin: item.isPin
          }
          if (this.list.length > 0) {
            const index = this.list.findIndex(v => !v.isPin)
            if (index > -1) {
              this.list.splice(index, 0, listItem)
            } else {
              this.list.push(listItem)
            }
            this.newAddId = item.checklistId

          } else {
            this.list.push(listItem)
          }

          this.writeFinish(item)
        } else {
          if (page <= this.searchParams.page) {
            try {
              const listRes = await this.$axios({
                method: 'GET',
                url: `/classroom/${this.curClassroom.classroomId}/checklists`,
                params: { ...this.searchParams, page }
              })

              if (listRes.data._embedded) {
                const data = listRes.data._embedded.classroomChecklists
                this.updateListCopy = [...this.updateListCopy, ...data]
              }
            } catch(err) {
              this.$log.debug('updatelist checklists GET() error => ', err)
            }

            await this.updateList(page + 1, mode, item)
          }

          if (page === this.searchParams.page) {
            this.list = JSON.parse(JSON.stringify(this.updateListCopy))
            this.updateListCopy = []

            if(mode === 'pinout' || mode === 'pinup') {
              if(mode === 'pinout' && this.paging.totalPages > this.searchParams.page + 1) {
                
                try {
                  const listRes = await this.$axios({
                    method: 'GET',
                    url: `/classroom/${this.curClassroom.classroomId}/checklists`,
                    params: {
                      ...this.searchParams,
                      page: page + 1
                    }
                  })

                  this.nextPageList = listRes.data._embedded.classroomChecklists
                } catch(err) {
                  this.$log.debug('updatelist checklists next GET() error => ', err)
                }

              }

              this.pinUpNewList(mode, item)
            }
          }
        }
      }
    },
    updateList2: async function(mode, item = null, kind = null) {
      if(mode === 'checkFinish') {
        if(kind === 'esc') {
          await this.$axios({
            method: 'PATCH',
            url: `/classroom/${this.curClassroom.classroomId}/checklist/${item.checklistId}/in-progress`,
            params: {
              userId : this.userId()
            }
          })
        } else {
          await this.$axios({
            method: 'PATCH',
            url: `/classroom/${this.curClassroom.classroomId}/checklist/${item.checklistId}/complete`,
            params: {
              userId : this.userId()
            }
          })
        }
      } else if(mode === 'deleteList') {
        const res = await this.$axios({
          method: 'DELETE',
          url: `/classroom/${this.curClassroom.classroomId}/checklist/${item.checklistId}`,
          params: {
            userId : this.userId()
          }
        })
        
        if (res) {
          if (this.selectItem.checklistId && this.selectItem.checklistId === item.checklistId) {
            this.$refs.recordEdit?.close()
          }
        }
      }
      this.updateList(0)
    },
    deleteList: async function(item, confirm = null) {
      if(confirm === null) {
        this.confirmModal.isOpen = true
        this.confirmModal.title = `삭제하시겠습니까?`
        this.confirmModal.description = ""
        this.confirmModal.confirmButtonText = '확인'
        this.confirmModal.confirmButtonColor = ''
        this.confirmModal.action = "deleteList"
        this.confirmModal.isAlert = false
        this.confirmModal.target = item
      } else if (confirm === "ok") {
        this.updateList2('deleteList', item)
      }
    },
    toggleFinishToast: function(text, kind, dom, fn) {
      // FinishToast 공통 toggle 함수
      this.toastMessage.text = text
      this.toastMessage.kind = kind
      dom.style.display = 'none'
      dom.style.display = 'flex'

      if ( fn && typeof fn === 'function' ) {
        // 우선 함수 있을 경우만 호출
        setTimeout(async() => {
          fn()
          dom.style.display = 'none'
        }, 1300)
      }
    },
    setIsComplete(item) {
      const obj = this.list.find(v => v.checklistId === item.checklistId)
      obj.isCompleted = item.isCompleted
    },
    checkFinish: async function(item, mode = null) {
      if(item.isCompleted === true) {
        if(mode === 'detail') {
          this.inwonCheckCompleteList = this.inwonCheckCompleteList.filter(v => v !== item.checklistId)
          this.updateList2('checkFinish', item, 'add')
        } else {
          item.isCompleted = false
          this.inwonCheckProgressList.push(item.checklistId)
          this.escItem = item
          
          if (this.selectItem.checklistId && this.selectItem.checklistId === item.checklistId) {
            this.$refs.recordEdit?.setIsCompleted(false)
          }

          this.toggleFinishToast('진행으로 변경했습니다.', 'checkFinish', this.leftFinishToastDom)

          setTimeout(async() => {
            if(this.escItem.isCompleted === false) {
              this.inwonCheckProgressList = this.inwonCheckProgressList.filter(v => v !== item.checklistId)
              this.updateList2('checkFinish', item, 'esc')
              this.leftFinishToastDom.style.display = 'none'
            }
          }, 1300);
        }
      } else {
        if(mode === 'detail') {
          this.inwonCheckProgressList = this.inwonCheckProgressList.filter(v => v !== item.checklistId)
          this.updateList2('checkFinish', item, 'esc')
        } else {
          item.isCompleted = true
          this.inwonCheckCompleteList.push(item.checklistId)
          this.escItem = item

          if (this.selectItem.checklistId && this.selectItem.checklistId === item.checklistId) {
            this.$refs.recordEdit?.setIsCompleted(true)
          }

          this.toggleFinishToast('할 일을 완료했습니다.', 'checkFinish', this.leftFinishToastDom)
  
          setTimeout(async() => {
            if(this.escItem.isCompleted === true) {
              this.inwonCheckCompleteList = this.inwonCheckCompleteList.filter(v => v !== item.checklistId)
              this.updateList2('checkFinish', item, 'add')
              this.leftFinishToastDom.style.display = 'none'
            }
          }, 1300);
        }
      }
    },
    checkFinishEsc: async function() {
      if(this.escItem.isCompleted === true) {
        this.escItem.isCompleted = false

        if (this.selectItem.checklistId && this.selectItem.checklistId === this.escItem.checklistId) {
          this.$refs.recordEdit?.setIsCompleted(false)
        }

        this.inwonCheckCompleteList = this.inwonCheckCompleteList.filter(v => v !== this.escItem.checklistId)
        this.inwonCheckProgressList.push(this.escItem.checklistId)

        this.toggleFinishToast('진행중으로 변경했습니다.', '', this.leftFinishToastDom, () => { 
          this.inwonCheckProgressList = this.inwonCheckProgressList.filter(v => v !== this.escItem.checklistId) 
        })

      } else {
        this.escItem.isCompleted = true

        if (this.selectItem.checklistId && this.selectItem.checklistId === this.escItem.checklistId) {
          this.$refs.recordEdit?.setIsCompleted(true)
        }

        this.inwonCheckProgressList = this.inwonCheckProgressList.filter(v => v !== this.escItem.checklistId)
        this.inwonCheckCompleteList.push(this.escItem.checklistId)

        this.toggleFinishToast('할 일을 완료했습니다.', '', this.leftFinishToastDom, () => {
          this.inwonCheckCompleteList = this.inwonCheckCompleteList.filter(v => v !== this.escItem.checklistId)
        })
      }
    },
    getInwonCheckComplete: function(id) {
      return this.inwonCheckCompleteList.findIndex(v => v === id) > -1 ? true : false
    },
    getInwonCheckProgress: function(id) {
      return this.inwonCheckProgressList.findIndex(v => v === id) > -1 ? true : false
    },
    appendProgressList(checklistId) {
      this.inwonCheckProgressList.push(checklistId)
    },
    appendCompleteList(checklistId) {
      this.inwonCheckCompleteList.push(checklistId)
    },
    filterProgressList(checklistId) {
      this.inwonCheckProgressList = this.inwonCheckProgressList.filter(v => v !== checklistId)
    },
    filterCompleteList(checklistId) {
      this.inwonCheckCompleteList = this.inwonCheckCompleteList.filter(v => v !== checklistId)
    },
    pinUp: async function(item) {
      const id = item.checklistId
      let mode = item.isPin ? 'pinout' : 'pinup'

      try {
        await this.$axios({
          method: 'PATCH',
          url: `/classroom/${this.curClassroom.classroomId}/checklist/${id}/${mode === 'pinup' ? 'pin' : 'unpin'}`,
          params: {
            userId : this.userId()
          }
        })

        const toastMsg = mode === 'pinup' ? '상단 고정 되었습니다.' : '상단 고정이 해제되었습니다.'
        this.toggleFinishToast(toastMsg, 'pinUp', this.leftFinishToastDom, () => {})

      } catch (err) {
        this.$log.debug('classroom checklist pin PATCH() error => ', err)
      }

      this.nextPageList = []
      this.pinUpId = id
      await this.updateList(0, mode, item)
    },
    pinUpNewList: function(mode, item) {
      const obj = this.list.find(v => v.checklistId === this.pinUpId)
      if(mode === "pinup") {
        if(obj && obj.isPin === false) {
          this.list = this.list.filter(v => v.checklistId !== this.pinUpId)
          this.list.unshift({
            ...obj,
            isPin: true
          })
        } else if(!obj) {
          this.list.unshift({
            ...item,
            isPin: true
          })
        }
      } else {
        if(obj && obj.isPin === true) {
          const idx = this.list.findIndex(v => obj.insertedTimestamp > v.insertedTimestamp && v.isPin === false)
          this.list = this.list.filter(v => v.checklistId !== this.pinUpId)
          if(idx > -1) {
            this.list.splice(idx-1, 0, {
              ...obj,
              isPin: false
            })
          } else {
            if(this.nextPageList.length > 0) {
              this.list.push(this.nextPageList[0])
            } else {
              this.list.push({
                ...obj,
                isPin: false
              })
            }
          }
        }
      }

      this.pinUpId = ""
    },
    pinUpNewListSearch: function(mode) {
      const obj = this.list.find(v => v.checklistId === this.pinUpId)
      if(mode === "pinup") {
        if(obj && obj.isPin === false) {
          this.list = this.list.map(item => {
            if(item.checklistId === this.pinUpId) {
              return {
                ...item,
                isPin : true
              }
            } else {
              return item
            }
          })
        }
      } else {
        if(obj && obj.isPin === true) {
          this.list = this.list.map(item => {
            if(item.checklistId === this.pinUpId) {
              return {
                ...item,
                isPin : false
              }
            } else {
              return item
            }
          })
        }
      }
      
      this.pinUpId = ""
    },
    setCalendarDateTimestampSearch: function(dateTimeJson) {
      const tmpYear = dateTimeJson.year
      let tmpMonth = dateTimeJson.month + 1
      if (tmpMonth.toString().length === 1) {
          tmpMonth = '0' + tmpMonth
      }
      let tmpDate = dateTimeJson.date
      if (tmpDate.toString().length === 1) {
          tmpDate = '0' + tmpDate
      }
      const dateTime = `${tmpYear}/${tmpMonth}/${tmpDate}`

      this.calendarDateTimestampSearch = this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf()
    },
    setMonthFilter: function(dateTimeJson) {
      this.$refs.recordEdit?.close()
      this.selected = dateTimeJson

      this.searchedParams.month = `${this.selected.year}-${String(this.selected.month).padStart(2, '0')}`
      this.searchText = `${this.selected.year}년 ${String(this.selected.month).padStart(2, '0')}월`
      this.searchInputText = ""

      this.isSearch = true
      this.searchKind = "date"
      this.initList()
      this.initListSearch('date-m')
      this.getList()
    },
    openPopupCalendarSearch: function(e) {
      e.preventDefault()
      this.isPopupCalendarSearch = true
    },
    closePopupCalendarSearch: function() {
      this.isPopupCalendarSearch = false
    },
    closePopupCalendarSelectSearch: function() {
      this.$refs.recordEdit?.close()
      this.selectItem = {}

      const date = this.$moment(new Date(this.calendarDateTimestampSearch)) 
      this.searchedParams.dateStart = date.format('YYYY-MM-DD')
      this.searchedParams.dateEnd = date.format('YYYY-MM-DD')
      this.searchText = date.format('YYYY년 MM월 DD일')
      this.searchInputText = ""

      this.isSearch = true
      this.searchKind = "date"
      this.initList()
      this.initListSearch('date')
      this.getList()
    },
    changeCalendar: function(type) {
      this.calType = type
    },
    copyItem: async function(item) {
      try {
        const res = await checklistController.copyChecklist({checklistId: item.checklistId, userId : this.userId()})
        if (res) {
          this.openContentLayer(res.data)

          if (this.isSearch) {
            this.initList()
            this.isSearch = false
            this.searchKind = ""
            this.searchText = ""
            this.searchInputText = ""
            this.initListSearch('all')
            this.getList()
          } else {
            if (this.searchParams.isCompleted) return

            if (this.loadFinish) {
              this.list.unshift(res.data)
            } else {
              this.list.unshift(res.data)
              this.searchParams.size = this.searchParams.size + 1
            }
          }
        }
      } catch (err) {
        this.$log.debug(' classroom checklist copy PUT() error => ', err)
      }
    },
    searchInputLength: function(e) {
      e.target.value = e.target.value.substr(0, 20)
    },
    updateChecklistTitle(checklist) {
      const obj = this.list.find(v => v.checklistId === checklist.checklistId)
      obj.checklistTitle = checklist.checklistTitle
    },
    viewCardAddList: function() {
      this.isFloatingMenuView = !this.isFloatingMenuView
    },
    openWritePage: function(mode) {
      this.$hiClass.toggleBodyClass('add', 'hidden')
      
      if ( ['CHECK','SCORE','MEMO','LEVEL_COMMENT'].includes(mode) ) {
        this.writeMode = mode
      }

      this.isPersonnelWrite = true
    },
    closeWritePage: function() {
      this.$hiClass.toggleBodyClass('remove', 'hidden')
      this.isPersonnelWrite = false
    },
    writeFinish: function(item) {
      if (item) {
        this.openContentLayer(item)
      }
    },
    openContentLayer(item) {
      checklistController.setChecklistId(item.checklistId)
      this.selectItem = item
      this.isContentLayerOpen = true
    },
    closeContentLayer: function() {
      this.selectItem = {}
      setTimeout(() => {
        this.isContentLayerOpen = false
      }, 600)
    },
    selectedDateString: function(timestamp) {
      const date = this.$moment(new Date(timestamp)) 
      return `${date.format('YY.MM.DD')} ${'('+this.getDayName(date.day())+')'}`
    },
    dateConvertTimeStamp: function(date) {
      const convertDate = new Date(date).getTime()
      return convertDate
    },
    getDayName(day) {
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
    moveScrollTop: function() {
      this.$refs.recordingListArea.scrollTo({top: 0, behavior: 'smooth'})
    },
    closeFloating: function() {
      if(this.isFloatingMenuView) {
          this.isFloatingMenuView = false
      }
    },
    visibleScrollTopButton: function() {
      const recordListEl = this.$refs.recordingListArea
      const recordListScrollTopEl = this.$refs.scrollTop
      recordListEl.addEventListener('scroll', (e) => {
          if(e.target.scrollTop > 30) {
              recordListScrollTopEl.style.display = 'flex'
          } else {
              recordListScrollTopEl.style.display = 'none'
          }
      })
    },
    userId() {
      return localStorage.uuid
    },
    closeConfirmModal(isConfirm) {
      if (isConfirm) {
        switch (this.confirmModal.action) {
          case 'deleteList' :
            this.deleteList(this.confirmModal.target, 'ok')
            break;
        }
      }
      this.confirmModal.isOpen = false
    }
  },
  async created() {
    checklistController.setClassroomId(this.classroomId)
  },
  mounted() {
    this.visibleScrollTopButton()
    this.calendarDateTimestampSearch = this.$moment().valueOf()
    checklistController.init(null)
  }
}
</script>

<style scoped lang="scss">
.hi-ico::v-deep {
  border: 0;
  padding: 0;

  &::after {
    background-color: #BDBDBD !important;
  }
}
</style>