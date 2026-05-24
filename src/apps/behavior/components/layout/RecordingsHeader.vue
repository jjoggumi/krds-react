<template>
    <div class="record-list__top-menu">
        <div class="title">
            <h2>행동기록</h2>
        </div>
        <div class="search">
            <label>
                <span v-if="isStudent" class="target-chip-wrap">
                    {{ selectedTargetString }}
                    <i @click="removeTarget" class="chip-close"></i>
                </span>
                <input 
                    :class="{on: inputOn()}"
                    :readonly="isStudent" 
                    ref="keyword" 
                    maxlength="20"
                    @input="inputChange" 
                    @click="inputChange"
                    @keyup.enter="onEnter" 
                    type="text"
                    :placeholder="!isKeywordSearch && !isStudent ? '키워드로 검색하거나 @학생명으로 검색하세요.' : ''" 
                />
                <template v-if="isKeywordSearch">
                    <i class="input-btn-delete bh-icon-close-circle-fill-24 cursor-pointer" @click="removeTarget"></i>
                    <span class="line"></span>
                </template>
                <i @click="openCalendar" class="input-btn-calendar bh-icon-calendar-24 cursor-pointer"></i>
                <i @click="searchBtnClick" class="input-btn-search bh-icon-search-24 cursor-pointer"></i>
                <div v-if="isOpenTargetLayer" ref="studentArea" class="search-student-list" v-click-outside="closeStudentDropBox">
                    <drop-down-wrapper
                        :totalElements="filterStudents.length"
                        itemTag="li.drop-item"
                        @enter="dropdownEnter"
                    >
                        <template slot-scope="scopeProps">
                            <ul>
                                <template v-if="filterStudents.length !== 0">
                                    <li 
                                        v-for="(target, index) of filterStudents"
                                        :key="target.studentId"
                                        class="drop-item"
                                        :class="{'on': scopeProps.selected === index}"
                                        @click="toggleTargetItem(target)"
                                    >
                                        <span class="image">
                                            <img :class="{'is-photo': isPhotoCharacter(target)}" :src="selectedImageSrc(target)" />
                                        </span>
                                        <span class="num">{{ target.studentNo }}</span>
                                        <span class="name" :class="{hidden: target.isHidden}">{{ target.studentName }}</span>
                                    </li>
                                </template>
                                <template v-else>
                                    <li style="color: #9E9E9E;">
                                        일치하는 학생이 없습니다.
                                    </li>
                                </template>
                            </ul>
                        </template>
                    </drop-down-wrapper>
                </div>
                <div style="display: inline-block;" v-if="isOpenCalendar">
                    <calendar-monthly
                        v-if="calType === 'day'"
                        :timestamp="timestamp"
                        :value-goe="null"
                        :isBoardUse="true"
                        :isNoPreSelect="true"
                        calendarType="type03"
                        @selectedDate="setCalendarFilter"
                        @close="close"
                        @changeCalendar="changeCalendar"
                        v-click-outside="close"
                    />
                    <main-body-calendar-picker-month
                        v-if="calType === 'month'"
                        style="display:block;"
                        :year="selected.year"
                        :month="selected.month"
                        :total="false"
                        :change="true"
                        :isRecord="true"
                        @changeCalendar="changeCalendar"
                        @choiceMonth="setMonthFilter"
                        v-click-outside="close"
                    />
                </div>
            </label>
        </div>
        <div class="choice">
            <button @click="seltCategoryFilter(['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'])" :class="{on: isAll}">전체</button>
            <button @click="seltCategoryFilter(['PHOTO'])" :class="{on: isPhoto}">사진</button>
            <button @click="seltCategoryFilter(['VIDEO'])" :class="{on: isVideo}">동영상</button>
            <button @click="seltCategoryFilter(['AUDIO'])" :class="{on: isAudio}">오디오</button>
            <button @click="seltCategoryFilter(['NUGA'])" :class="{on: isNuga}">누가기록</button>
        </div>
    </div>
</template>

<script>
import CalendarMonthly from '@/components/Calendar/CalendarMonthly'
import MainBodyCalendarPickerMonth from "@/apps/main/clazzes/MainBodyCalendarPickerMonth";
import DropDownWrapper from '@/apps/behavior/components/common/DropDownWrapper.vue'
import {mapActions} from 'vuex'
export default {
    name: 'recordings-header',
    components: {CalendarMonthly, MainBodyCalendarPickerMonth, DropDownWrapper},
    props: {
        classroomId: String,
        isGet: Boolean
    },
    data() {
        return {
            calType: 'day',
            selected: {
                year: this.$moment().format('YYYY'),
                month: this.$moment().format('M')
            },
            isOpenCalendar: false,
            isOpenTargetLayer: false,
            students: [],
            filterStudents: [],
            selectedStudent: {},
            timestamp: this.$moment().valueOf(),
            params: {
                action: 'get',
                keyword: '',
                month: '',
                date: '',
                studentId: '',
                recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                keywordString: ''
            }
        }
    },
    computed: {
        isAll: function() {
            return this.params.recordType.length === 4
        },
        isPhoto: function() {
            return this.params.recordType.length === 1 && this.params.recordType[0] === 'PHOTO'
        },
        isVideo: function() {
            return this.params.recordType.length === 1 && this.params.recordType[0] === 'VIDEO'
        },
        isAudio: function() {
            return this.params.recordType.length === 1 && this.params.recordType[0] === 'AUDIO'
        },
        isNuga: function() {
            return this.params.recordType.length === 1 && this.params.recordType[0] === 'NUGA'
        },
        isStudent: function() {
            return this.params.studentId !== '' || this.params.date !== '' || this.params.month !== ''
        },
        selectedTargetString: function() {
            if(this.params.studentId !== '') {
                return `${this.selectedStudent.studentNo}. ${this.selectedStudent.studentName}`
            } else {
                return this.params.keywordString
            }
        },
        isKeywordSearch: function() {
            return this.params.keyword.length > 0
        }
    },
    watch:{
        classroomId: {
            handler: function (newVal, oldVal) {
                if(newVal && newVal !== oldVal){
                    this.$refs.keyword.value = ''
                    this.selectedStudent = null
                    this.params = {
                        action: 'get',
                        keyword: '',
                        month: '',
                        date: '',
                        studentId: '',
                        recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                        keywordString: ''
                    }
                }
            }
        },
        isGet: {
            handler: function (newVal, oldVal) {
                if(newVal){
                    this.$refs.keyword.value = ''
                    this.selectedStudent = null
                    this.params = {
                        action: 'get',
                        keyword: '',
                        month: '',
                        date: '',
                        studentId: '',
                        recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                        keywordString: ''
                    }
                }
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomStudentDetail: 'getClassroomStudentDetail',
            getClassroomStudents: 'getClassroomStudents'
        }),
        isPhotoCharacter: function(student) {
            return student.studentPhoto !== null
        },
        selectedImageSrc: function(student) {
            return this.isPhotoCharacter(student)
                ? student.studentPhoto
                : `https://download.hiclass.net/static/classroom/student/${student.studentCharacter}_head.png`
        },
        inputOn: function() {
            if(!this.$refs.keyword) return false
            return this.$refs.keyword.value.trim() || this.params.keywordString
        },
        closeStudentDropBox: function() {
            this.selectedStudent = null
            this.isOpenTargetLayer = false
        },
        changeCalendar: function(type) {
            this.calType = type
            this.isOpenCalendar = true
        },
        onEnter: function() {
            if(this.isOpenTargetLayer) {
                if(this.filterStudents.length < 2) {
                    if(this.filterStudents.length === 1) {
                        this.toggleTargetItem(this.filterStudents[0])
                    }
                }
            } else {
                if(this.isStudent) {
                    return
                }
                this.setInputFilter()
            }
        },
        validate: function(e) {
            e.target.value = e.target.value.substr(0, 20)
        },
        inputChange: async function(e) {
            this.validate(e)
            
            if(e.target.value.indexOf('@') === 0) {
                if(!this.isOpenTargetLayer) {
                    this.students = await this.getClassroomStudents({classroomId: this.classroomId})
                    this.isOpenTargetLayer = true
                }
                const value = e.target.value.replace('@', '')
                if(value) {
                    this.filterStudents = this.students.filter(
                        o => o.studentName.indexOf(value) > -1
                    )
                } else {
                    this.filterStudents = [...this.students]
                }
            } else {
                if(this.isOpenTargetLayer) {
                    this.isOpenTargetLayer = false
                }
            }
            this.params.keyword = e.target.value.trim()
        },
        dropdownEnter: function(idx) {
            if(idx !== null) {
                this.toggleTargetItem(this.filterStudents[idx])
            }
        },
        toggleTargetItem: async function(student) {
            const res = await this.getClassroomStudentDetail({
                classroomId: this.classroomId,
                studentId: student.studentId
            })
            
            if(res.status === 200) {
                this.$refs.keyword.value = ''
                this.selectedStudent = {...student}
                const params = {
                    ...this.params,
                    action: 'search',
                    keyword: '',
                    month: '',
                    date: '',
                    studentId: student.studentId,
                    recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                    keywordString: `${student.studentNo}. ${student.studentName}`
                }
                this.sendFilterData(params)
            } else {
                this.$hiClass.alert('삭제된 학생입니다.')
            }
            
            this.isOpenTargetLayer = false
        }, 
        searchBtnClick: function(e) {
            e.preventDefault()
            if(this.isStudent) {
                return
            }
            this.isOpenTargetLayer = false
            const value = this.$refs.keyword.value.trim()
            const params = {
                ...this.params,
                action: value ? 'search' : 'get',
                keyword: this.$refs.keyword.value,
                month: '',
                date: '',
                studentId: '',
                recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                keywordString: value ? value : ''
            }
            this.sendFilterData(params)
        },
        removeTarget: function() {
            this.$refs.keyword.value = ''
            this.selectedStudent = null
            this.isOpenTargetLayer = false
            const params = {
                ...this.params,
                action: 'get',
                keyword: '',
                month: '',
                date: '',
                studentId: '',
                keywordString: ''
            }
            this.sendFilterData(params)
        },
        setInputFilter: function() {
            const value = this.$refs.keyword.value.trim()
            const params = {
                ...this.params,
                action: value ? 'search' : 'get',
                keyword: this.$refs.keyword.value,
                month: '',
                date: '',
                studentId: '',
                recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                keywordString: value ? value : ''
            }
            this.sendFilterData(params)
        },
        openCalendar: function(e) {
            e.preventDefault()
            this.isOpenCalendar = !this.isOpenCalendar
        },
        close: function() {
            if(this.isOpenCalendar) {
                this.isOpenCalendar = false
            }
        },
        setMonthFilter: function(dateTimeJson) {
            this.$refs.keyword.value = ''
            if(this.isOpenCalendar) {
                const month = `${dateTimeJson.year}-${`${dateTimeJson.month}`.padStart(2, '0')}`
                this.selected = dateTimeJson
                const params = {
                    ...this.params,
                    action: 'search',
                    keyword: '',
                    month,
                    date: '',
                    studentId: '',
                    recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                    keywordString: `${dateTimeJson.year}년 ${dateTimeJson.month}월`
                }
                this.sendFilterData(params)
                this.isOpenCalendar = false
            }
        },
        setCalendarFilter: function(dateTimeJson) {
            this.$refs.keyword.value = ''
            if(this.isOpenCalendar) {
                const date = `${dateTimeJson.year}-${`${dateTimeJson.month + 1}`.padStart(2, '0')}-${`${dateTimeJson.date}`.padStart(2, '0')}`
                this.timestamp = this.$moment(date, 'YYYY-MM-DD', true).valueOf()
                const params = {
                    ...this.params,
                    action: 'search',
                    keyword: '',
                    month: '',
                    date,
                    studentId: '',
                    recordType: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA'],
                    keywordString: `${dateTimeJson.year}년 ${dateTimeJson.month + 1}월 ${dateTimeJson.date}일`
                }
                this.sendFilterData(params)
                this.isOpenCalendar = false
            }
        },
        seltCategoryFilter: function(recordType) {
            const params = {
                ...this.params, 
                recordType,
            }
            this.sendFilterData(params)
        },
        sendFilterData: function(filter) {
            const params = {...this.params, ...filter}
            this.params = {...params}
            this.$emit('search', this.params)
        }
    }
}
</script>

<style scoped>
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list {
  position: absolute;
  top: calc(100% - 1px);
  left: 0px;
  width: 248px;
  height: auto;
  max-height: 318px;
  border: 1px solid #D6D6D6;
  border-radius: 10px;
  box-shadow: 0px 5px 10px 0px #0000001F;
  z-index: 3;
  background: #fff;
  overflow: auto;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list::-webkit-scrollbar {
  width: 14px;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list::-webkit-scrollbar-track {
  background: transparent;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list::-webkit-scrollbar-thumb {
  background: #D3D1CB;
  background-clip: padding-box;
  border: 2px solid transparent;
  border-radius: 50px;
  border-top: 0;
  border-bottom: 0;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul {
  padding: 9px 0;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 15px;
  cursor: pointer;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li.on,
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li:hover {
  background: #F6F6F6;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.image {
  display: inline-flex;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f5f6f7;
  overflow: hidden;
  margin-right: 0px;
  justify-content: center;
  align-items: flex-end;
}

.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.image.all {
    background: #FFF0E7;
    display: flex;
    align-items: center;
    justify-content: center;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.image img {
  width: 32px;
  height: 32px;
  -o-object-fit: cover;
  object-fit: cover;
  image-rendering: auto;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.image img.is-photo {
    width: 100%;
    height: 100%;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.image img.all {
    width: 24px;
    height: 24px;
    -o-object-fit: cover;
    object-fit: cover;
    image-rendering: auto;
    content: url('../../../../assets/img/icon/ic_users_fill_24.png')
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.num {
  display: inline-block;
  width: auto;
  height: 18px;
  border-radius: 20px;
  border: 1px solid #9E9E9E;
  font-size: 12px;
  font-weight: 500;
  color: #616161;
  text-align: center;
  line-height: 16px;
  margin-right: 6px;
  margin-left: 5px;
  padding-left: 2px;
  padding-right: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.name {
  display: inline-block;
  font-size: 15px;
  font-weight: 400;
  color: #222;
  text-align: left;
  flex-grow: 1;
  height: 18px;
  line-height: 18px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.name.all {
  color:#FF8737;
}
.behavior-wrapper__body .behavior-wrapper__body__content .record .record-list .record-list__top-menu .search label .search-student-list ul li span.name.hidden {
  color: #9E9E9E
}
.target-chip-wrap {
    display: inline-block;
    border-radius: 27px;
    padding: 8px 32px 8px 12px;
    height: 32px;
    font-size: 15px;
    font-weight: 400;
    line-height: 15px;
    background: #F6F6F6;
    position: absolute;
    left: 0px;
    top: 8px;
    z-index: 999;
}
.target-chip-wrap i.chip-close{
    width: 16px;
    height: 16px;
    background: url('../../../../assets/img/icon/chip_close.png');
    margin-left: 10px;
}
</style>