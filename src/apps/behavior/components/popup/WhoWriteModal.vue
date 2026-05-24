<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal"
      id="whoWriteModal"
      style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <!-- <div class="modal-cont-inner"
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco"> -->
        <div class="modal-cont-inner">
          <div class="behavior-modal-student-who-write">
            <div class="title-wrap">
              <h2>
                누가기록 
                <template v-if="mode === 'write'">
                  작성
                </template>

                <template v-else>
                  수정
                </template>
              </h2>
            </div>

            <div class="content-wrap" ref="contentWrap">
              <div class="content-wrap__input-calendar">
                <i class="bh-icon-calendar-fill-24 cursor-pointer" @click="openPopupCalendar"></i>
                <span class="calendar-text cursor-pointer" @click="openPopupCalendar">{{ selectedDateString }}<em v-if="mode !== 'write'">{{ insertedDate }}</em></span>
                <calendar-monthly
                  v-if="isPopupCalendar"
                  :timestamp="calendarDateTimestamp"
                  :value-goe="null"
                  :isBoardUse="true"
                  :calendarType="calendarType"
                  v-click-outside="closePopupCalendar"
                  @selectedDate="setCalendarDateTimestamp"
                  @close="closePopupCalendar"
                />
              </div>

              <div class="content-wrap__input-user">
                <i class="user-icon bh-icon-user-fill-24-02 cursor-pointer"></i>
                <div class="users cursor-pointer"
                  :class="{
                    search: isUserList === true
                  }"
                >
                  <p class="user" v-for="student of students" :key="`user-item-${student.studentId}`">
                    {{ student.studentNo }}. {{ student.studentName }}
                    <button  @click="deleteStudent(student)">
                      <i class="bh-icon-close-8"></i>
                    </button>
                  </p>
                  <input type="text" v-model="searchStudentText" :placeholder="isAddStudent" @click="openUserList" @keydown="inputSearchUser($event)" />
                  <div class="user-list" v-if="isUserList === true"  v-click-outside="closeUserList">
                    <template v-if="searchStudents.length > 0">
                      <ul>
                        <li v-for="(item) of searchStudents" :key="`search-student-list-${item.studentId}`" 
                          :class="{
                            selected: item.selected === true
                          }"
                          @click="selectUser(item)">
                          <span class="image">
                            <img :class="{'is-photo': isPhoto(item)}" :src="selectedImageSrc(item)" />
                          </span>
                          <span class="num">{{ item.studentNo }}</span>
                          <span class="name" :class="{
                            hidden: item.isHidden === true
                          }">
                            {{ item.studentName }}
                            <template v-if="item.isHidden === true">
                              (숨김)
                            </template>
                          </span>
                          <span class="checked" v-if="item.selected === true">
                            <i class="bh-icon-check-24-gray"></i>
                          </span>
                        </li>
                      </ul>
                    </template>

                    <template v-else>
                      <p class="nodata">
                        일치하는 학생이 없습니다.
                      </p>
                    </template>
                  </div>
                </div>

                <!-- Add target layer button (plus) -->
                <span :class="{ empty: !(students.length > 0) }" class="btn-r" @click="toggleAddTargetButton">
                  <span v-click-outside="closeTargetLayer" class="bh-icon-plus-20-gray cursor-pointer add">
                    <!-- 학생 추가 레이어 팝업 -->
                    <add-target-layer-popup
                      v-if="isOpenTargetLayer"
                      :selected="selectedIds"
                      :students="filterStudents"
                      @close="closeAddTargetLayer"
                    />
                  </span>
                </span>
              </div>

              <div class="content-wrap__input-tag">
                <i class="tag-icon bh-icon-tag-fill-24 cursor-pointer"></i>
                <div class="tags cursor-pointer"
                  :class="{
                    search: isTagList === true
                  }"
                  >
                  <p class="tag"
                    v-for="tag of tags"
                    :key="`tag-list-select-${tag.tagId}`"
                  >
                    {{ tag.tagName }}
                    <button @click="deleteTag(tag)">
                      <i class="bh-icon-close-8"></i>
                    </button>
                  </p>
                  <input type="text" maxlength="6" v-model="searchTagText" :placeholder="isAddTag" @click="openTagList" @keydown="[inputValidateCheck($event), inputSearchTag($event)]" @input="inputValidateCheck($event)" @keyup="inputValidateCheck($event)" />
                  <p class="tag-adm">
                    <button @click="openTagListModal"><i class="bh-icon-setting-fill-18-orange"></i>태그관리</button>
                  </p>
                  <div class="tag-list" v-if="isTagList === true"  v-click-outside="closeTagList">
                    <template v-if="searchTags.length > 0">
                      <p class="tag" 
                        :class="{
                          selected: tag.selected
                        }"
                        v-for="tag of searchTags"
                        :key="`tag-list-${tag.tagId}`"
                        @click="selectTag(tag)"
                      >
                        {{ tag.tagName }}
                      </p>
                    </template>

                    <template v-else>
                      <p class="nodata">
                        <template v-if="isValidateTagName === false">
                          <template v-if="searchTagsCopy.length > 0 || searchTagText !== ''">
                            일치하는 태그가 없습니다.
                          <button @click="addTag"><i class="bh-plus-orange-24"></i>태그로 만들기</button>
                          </template>

                          <template v-else>
                            등록된 태그가 없습니다.
                          <button class="reg" @click="openTagListModal"><i class="bh-icon-setting-fill-18-orange"></i>태그관리</button>
                          </template>
                        </template>

                        <template v-else>
                          등록 불가한 태그입니다.
                        </template>
                      </p>
                    </template>
                  </div>
                </div>
              </div>

              <div class="content-wrap__input-text">
                <textarea 
                  ref="textarea" 
                  maxlength="5000"
                  placeholder="누가기록을 입력하세요." 
                  @input="inputComment($event)"
                  @keyup="inputComment($event)"
                  @keydown="inputComment($event)"
                  v-model="content"
                  ></textarea>
              </div>
            </div>

            <div class="btn-wrap">
              <button class="esc" @click="close">취소</button>
              <button class="reg" 
                :disabled="isSubmit === false"
                :class="{
                  dis: isSubmit === false
                }"
                @click="submit">
                <template v-if="mode === 'write'">
                  등록
                </template>

                <template v-else>
                  저장
                </template>
              </button>
            </div>
            <div class="modal-close-btn" @click="close"></div>
            <div class="finish-toast" v-if="tagLengthToastMessage !== null">
              <p class="msg">
                {{ tagLengthToastMessage }}
              </p>
            </div>

            <toast-type01 
                v-if="toastMessageModal.open === true"
                :item="toastMessageModal"
            />
          </div> 
        </div>
      </div>
    </div>

    <tag-list-modal 
      v-if="isTagListModal === true"
      @close="closeTagListModal"
    />
    
    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      :isAlert="confirmModal.isAlert"
      @closeConfirmDialog="closeConfirmModal"
    />
  </div>
</template>

<script>
import {mapState} from 'vuex'
import AddTargetLayerPopup from '@/apps/behavior/components/popup/AddTargetLayerPopup.vue'
import { debounce, template } from "lodash";
import TagListModal from '@/apps/behavior/components/popup/TagListModal.vue'
import CalendarMonthly from "@/components/Calendar/CalendarMonthly"
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'

export default {
  name: 'who-write-modal',
  components: {
    TagListModal,
    CalendarMonthly,
    ToastType01,
    ConfirmModal,
    AddTargetLayerPopup
  },
  props: {
    item: Object,
    mode: String,
    studentList: Array
  },
  data() {
    return {
      isPopupCalendar: false,
      calendarType: 'type03',
      calendarDateTimestamp: null,
      students: [],
      isUserList: false,
      searchStudents: [],
      searchStudentsCopy: [],
      selectStudent: {},
      searchStudentText: "",
      tags: [],
      searchTags: [],
      searchTagsCopy: [],
      selectedTag: {},
      isTagList: false,
      searchTagText: "",
      isTagListModal: false,
      tagLengthToastMessage: null,
      content: "",
      toastMessageModal: {
        open: false,
        message: null,
        // top, bottom 둘다 null일 경우 세로한가운데 정렬 숫자만
        top: null,
        bottom: 30,
        // left, right 둘다 null일 경우 가로한가운데 정렬 숫자만
        left: null,
        right: null,
        width: null, // null = 420px 숫자만
        height: null, // null = 66px 숫자만
        align: "center" // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right 
      },
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
      isClickSubmit: false,
      // for AddTargetLayerPopup
      isOpenTargetLayer: false,
      filterStudents: []
    }
  },
  computed: {
    ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
        classroomStudents: 'students'
    }),
    isAddStudent() {
      return this.students.length > 0 ? "" : "기록 대상을 선택해주세요."
    },
    isAddTag() {
      return this.tags.length > 0 ? "" : "태그는 최대 5개까지 선택 가능합니다."
    },
    isSubmit() {
      return this.content.trim() !== ""
    },
    isValidateTagName() {
      const pattern = /([^A-Za-z0-9가-힣\s])/i
      return pattern.test(this.searchTagText)
    },
    selectedDateString: function() {
      const curDate = this.$moment().format('YYYY년 M월 D일')
      const date = this.$moment(new Date(this.calendarDateTimestamp)) 
      return `${date.format('YY년 M월 D일')} ${this.getDayName(date.day())+'요일'}${date.format('YYYY년 M월 D일') === curDate ? ' (오늘)' : ''}`
    },
    insertedDate: function() {
      return this.$moment(this.item.insertedTimestamp).format('(작성일시 YY.MM.DD HH:mm)')
    },
    selectedIds: function() {
      return this.students.map(t => t.studentId)
    }
  },
  watch: {
    content(newVal) {
      if (newVal.trim().length === 0) {
        this.content = ''
        this.$refs.textarea.value = ''
        return true
      }

      this.initStyleTextarea('input')
    },
    'toastMessageModal.open'(v) {
      if(v === true) {
        setTimeout(() => {
          this.toastMessageModal.open = false
        }, 1300)
      }
    }
  },
  methods:{
    toggleAddTargetButton: async function (e) {
      if (e) e.preventDefault()
      // Ensure the same list used in the inline user list is populated
      if (this.searchStudentText.trim() === "") {
        await this.getUsers()
      } else {
        this.getSearchUser()
      }

      const baseList = (this.searchStudents && this.searchStudents.length > 0)
        ? this.searchStudents
        : (this.searchStudentsCopy || [])

      // Use the same list but exclude already selected ids
      this.filterStudents = baseList.filter(s => !this.selectedIds.includes(s.studentId))

      if (this.filterStudents.length === 0) {
        this.confirmModal = {
          isOpen: true,
          action: 'alert',
          title: '추가할 학생이 없습니다.',
          description: '',
          confirmButtonText: '',
          confirmButtonColor: '#ff8737',
          isAlert: true,
          target: null
        }
        return
      }
      this.isOpenTargetLayer = !this.isOpenTargetLayer
    },
    closeTargetLayer: function () {
      this.isOpenTargetLayer = false
    },
    closeAddTargetLayer: async function (data) {
      if (data && data.length) {
        const addItems = data.map(s => ({
          isHidden: false,
          selected: true,
          studentCharacter: s.studentCharacter,
          studentId: s.studentId,
          studentName: s.studentName,
          studentNo: s.studentNo,
        }))
        this.students = [...this.students, ...addItems]

        // Reflect selection state in the shared search lists immediately
        const markSelected = (arr) => (arr || []).map(item => ({
          ...item,
          selected: this.students.findIndex(v => v.studentId === item.studentId) > -1
        }))
        this.searchStudents = markSelected(this.searchStudents)
        this.searchStudentsCopy = markSelected(this.searchStudentsCopy)
      }
      this.isOpenTargetLayer = false
    },
    isPhoto: function(student) {
      return student.studentPhoto !== null
    },
    selectedImageSrc: function(student) {
      return this.isPhoto(student) 
        ? student.studentPhoto
        : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`
    },
    getUsers: async function() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/classroom/${this.curClassroom.classroomId}/students`,
          params: {
            userId : this.userId(),
            isHidden : null
          }
        })

        if(res.data._embedded) {
          this.searchStudents = res.data._embedded.classroomStudents
          this.searchStudents = this.searchStudents.map(item => {
            return {
              ...item,
              selected: this.students.findIndex(v => v.studentId === item.studentId) > -1 ? true : false
            }
          })

          this.searchStudentsCopy = JSON.parse(JSON.stringify(this.searchStudents))
        }
      } catch (err) {
        this.$log.debug('classroom students GET() error => ', err)
      }
    },
    inputSearchUser: debounce(function(e) {
      this.searchStudentText = e.target.value
      this.getSearchUser()
    }, 200),
    getSearchUser: function() {
      if(this.searchStudentText.trim() !== "") {
        this.searchStudents = this.searchStudentsCopy.filter(item => {
          return item.studentName.search(this.searchStudentText) > -1
        })
      } else {
        this.getUsers()
      }
    },
    selectUser: function(item) {
      if(item.selected === false) {
        const obj = {
          isHidden: false,
          selected: true,
          studentCharacter: item.studentCharacter,
          studentId: item.studentId,
          studentName: item.studentName,
          studentNo: item.studentNo,
        }
        this.students.push(obj)

        this.searchStudentText = ""
      } else {
        this.selectStudent = item
      }
      this.closeUserList()
    },
    openUserList: function() {
      this.isUserList = true
      if(this.searchStudentText.trim() === "") {
        this.getUsers()
      } else {
        this.getSearchUser()
      }
    },
    closeUserList: function() {
      if(this.selectStudent.selected !== true) {
        this.isUserList = false
      } else {
        this.selectStudent = {}
      }
    },
    deleteStudent: function(student) {
      this.students = JSON.parse(JSON.stringify(this.students)).filter(v => v.studentId !== student.studentId)
    },
    getTags: async function() {
      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/classroom/${this.curClassroom.classroomId}/tags`,
          params: {
            userId : this.userId()
          }
        })
     
        if(res.data._embedded) {

          this.searchTags = res.data._embedded.classroomTags
          this.searchTags = this.searchTags.map(item => {
            return {
              ...item,
              selected: this.tags.findIndex(v => v.tagId === item.tagId) > -1 ? true : false
            }
          })
          this.searchTagsCopy = JSON.parse(JSON.stringify(this.searchTags))
          // this.getSearchTag()
          // console.log("this.searchStudents", this.searchStudents)
        }
      } catch (err) {
        this.$log.debug('classroom tags GET() error => ', err)
      }
    },
    inputValidateCheck: function(e) {
      e.target.value = e.target.value.substr(0, 6)
      e.target.value = e.target.value.replace(/\s| /gi,'');
      e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '')
    },
    inputSearchTag: debounce(function(e) {
      this.searchTagText = e.target.value
      this.getSearchTag()
    }, 200),
    getSearchTag: function() {
      if(this.searchTagText.trim() !== "") {
        this.searchTags = this.searchTagsCopy.filter(item => {
          return item.tagName.search(this.searchTagText) > -1
        })
      } else {
        this.getTags()
      }
    },
    selectTag: function(item) {
      if(item.selected === false) {
        const obj = {
          selected: true,
          tagId: item.tagId,
          tagName: item.tagName
        }
        this.tags.push(obj)
        this.searchTagText = ""
      } else {
        this.selectedTag = item
      }

      this.closeTagList()
    },
    openTagList: function() {
      // if(this.tagLengthToastMessage) {
      //   this.tagLengthToastMessage = null
      // }

      if(this.toastMessageModal.open === true) {
        this.toastMessageModal.open = false
      }
      
      if(this.tags.length >= 5) {
        this.toastMessageModal.open = true
        this.toastMessageModal.message = "태그는 최대 5개까지 선택 가능합니다."
        // this.tagLengthToastMessage = "태그는 최대 5개까지 선택 가능합니다."
        return
      }

      this.isTagList = true
      if(this.searchTagText.trim() === "") {
        this.getTags()
      }
    },
    closeTagList: function() {
      if(this.selectedTag.selected !== true) {
        this.isTagList = false
      } else {
        this.selectedTag = {}
      }
    },
    deleteTag: function(tag) {
      this.tags = this.tags.filter(v => v !== tag)
    },
    openTagListModal: function() {
      this.isTagListModal = true
    },
    closeTagListModal: function() {
      this.isTagListModal = false
    },
    addTag: async function() {
      try {
        const res = await this.$axios({
          method: 'POST',
          url: `/classroom/${this.curClassroom.classroomId}/tags`,
          data: {
            userId : this.userId(),
            tagName : this.searchTagText
          }
        })

        if(res) {
          const data = res.data
          this.tags.push({
            selected: false,
            tagId: data.tagId,
            tagName: data.tagName
          })
          this.searchTagText = ""
        }
      } catch (err) {
        this.$log.debug('classroom tags POST() error => ', err)
      }
    },
    submit: async function() {
      if(!this.isClickSubmit) {
        this.isClickSubmit = true
      } else {
        return
      }
      const tagIds = this.tags.map(item => item.tagId)
      const studentIds = JSON.parse(JSON.stringify(this.students)).map(item => item.studentId).filter(Boolean)

      const obj = {
        recordType: "NUGA",
        recordTimestamp: this.calendarDateTimestamp, 
        recordContent: this.content,
        tags: tagIds,
        targets: {
          studentIds: studentIds.length > 0 ? studentIds : null
        }
      }

      if(this.mode === 'write') {
        try {
          const res = await this.$axios({
            method: 'POST',
            url: `/classroom/${this.curClassroom.classroomId}/record`,
            data: obj
          })

          if(res) {
            this.$emit('closeSubmit', {...res.data, action: 'add'})
          }
        } catch (err) {
          this.$log.debug('classroom record POST() error => ', err)
        } finally {
          this.isClickSubmit = false
        }
      } else { // 수정모드일때 여기 작성 
        try {
          const res = await this.$axios({
            method: 'PATCH',
            url: `/classroom/${this.curClassroom.classroomId}/record/${this.item.recordId}`,
            data: obj
          })

          if(res) {
            this.$emit('closeSubmit', {...res.data, action: 'update'})
          }
        } catch (err) {
          this.$log.debug('classroom record POST() error => ', err)
        } finally {
          this.isClickSubmit = false
        }
      }
    },
    openPopupCalendar: function() {
      this.isPopupCalendar = true
    },
    closePopupCalendar: function() {
      this.isPopupCalendar = false
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
    setCalendarDateTimestamp: function(dateTimeJson) {
      let date = this.$moment(new Date(this.$moment().valueOf())) 
      if(this.mode !== 'write') {
        date = this.$moment(new Date(this.$moment(this.item.recordTimestamp).valueOf())) 
      }
      
      if((dateTimeJson.year > Number(date.format("Y")) + 1) || (dateTimeJson.year < Number(date.format("Y")))) {
        this.confirmModal.isOpen = true
        this.confirmModal.title = "선택할 수 없는 일자입니다.<br/>다시 선택해주세요."
        this.confirmModal.description = ""
        this.confirmModal.action = ""
        this.confirmModal.confirmButtonText = ''
        this.confirmModal.confirmButtonColor = '#F04F59'
        this.confirmModal.isAlert = true
        this.confirmModal.target = null
        return
      }

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
      this.calendarDateTimestamp = this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf()
      // if(!(dateTimeJson.year > Number(date.format("Y")) + 1)) {
      //   const tmpYear = dateTimeJson.year
      //   let tmpMonth = dateTimeJson.month + 1
      //   if (tmpMonth.toString().length === 1) {
      //       tmpMonth = '0' + tmpMonth
      //   }
      //   let tmpDate = dateTimeJson.date
      //   if (tmpDate.toString().length === 1) {
      //       tmpDate = '0' + tmpDate
      //   }
      //   const dateTime = `${tmpYear}/${tmpMonth}/${tmpDate}`
      //   this.calendarDateTimestamp = this.$moment(dateTime, 'YYYY/MM/DD', true).valueOf()
      // } else {
      //   alert("ggg")
      // }
    },
    initStyleTextarea(mode = null) {
      if (this.$refs.textarea) {
        this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`

        if(mode === "input" && this.$refs.textarea.scrollHeight > 236) {
          this.$refs.contentWrap.scrollTo(0, this.$refs.contentWrap.scrollHeight)
        }
      }
    },
    inputComment(e) {
      e.target.value = e.target.value.substr(0, 5000)
      let value = e.target.value
      this.content = value
    },
    closeConfirmModal() {
      this.confirmModal.isOpen = false
    },
    close: function() {
      this.$emit('close')
    },
    userId() {
      return localStorage.uuid
    },
  },
  created() {
  },
  mounted() {
    this.students = JSON.parse(JSON.stringify(this.studentList))

    if(this.mode === 'write') {
      this.calendarDateTimestamp = this.$moment().valueOf()
    } else {  // 수정일때 변경
      this.calendarDateTimestamp = this.$moment(this.item.recordTimestamp).valueOf()
      this.content = this.item.recordContent
      const tagList = this.item.tags || []
      tagList.forEach(element => {
        this.selectTag({...element, selected: false})
      })
    }
    this.$nextTick(() => this.initStyleTextarea())
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 16px;
}
</style>