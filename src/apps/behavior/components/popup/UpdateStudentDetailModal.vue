<template>
    <div
        v-show="isLoaded"
        class="modal normal-modal slick-modal view-main-detail-modal ofy"
        id="updateStudentModal"
        style="display: block"
    >
        <div class="modal-cont-wrap">
            <div class="modal-cont">
                <div class="modal-cont-inner">
                    <div class="behavior-modal-student-detail">
                        <!-- 학생 정보 영역 -->
                        <div class="profile">
                            <div class="info">
                                <p class="photo" :class="{ 'no-use': !isStudentType }">
                                  <img :class="{'is-photo': isStudentType && isPhoto}" :src="isStudentType ? character : ''" alt="" />
                                    <button @click="openChangeCharacterModal">
                                        <i class="bh-icon-modify-gray-24"></i>
                                    </button>
                                </p>

                                <p class="basic">
                                    <span class="num" @click="changeMode('studentNo')">{{ student.studentNo }}
                                      <span v-show="isEditMode.studentNo" class="input">
                                        <input type="text" ref="studentNo" @blur="changeStudentNumber" @click="clickStopCapturing" @input="inputOnlyNumber" maxlength="4"/>
                                      </span>
                                    </span>
                                    <span class="name" @click="changeMode('studentName')">{{ student.studentName }}</span>
                                    <span v-show="isEditMode.studentName" class="input-name">
                                      <textarea ref="studentName" @input="inputNameStyle" @blur="changeStudentName" @keydown.enter="$refs.studentName.blur()" maxlength="20"></textarea>
                                    </span>
                                </p>

                                <p class="birth">
                                    <span class="bh-icon-cake-20" @click="changeMode('studentBirth')"></span>
                                    <span @click="changeMode('studentBirth')">{{ student.studentBirthday ? student.studentBirthday : '생일등록' }}</span>
                                    <span class="input" v-show="isEditMode.studentBirth">
                                        <input
                                            v-for="inputKey of ['year', 'month', 'day']"
                                            :key="`input-${inputKey}`"
                                            v-model="studentBirth[inputKey]"
                                            :ref="inputKey === 'year' ? 'studentBirth' : inputKey"
                                            @click="clickStopCapturing"
                                            type="text"
                                            :class="inputKey"
                                            :maxlength="inputKey === 'year' ? 4 : 2"
                                            :placeholder="inputKey === 'year' ? '년도' : inputKey === 'month' ? '월' : '일'"
                                            @input="inputOnlyNumber"
                                            @blur="blurStudentBirth"
                                            @keydown.enter="changeStudentBirth"
                                        />
                                    </span>
                                </p>

                                <div class="report-view-wrap">
                                    <p class="report-view" @click="openWhoWriteModal">
                                        <span class="bh-icon-mn-whorecord-24"></span>누가기록
                                    </p>
                                    <p class="report-view" @click="moveReports">
                                        <span class="bh-icon-mn-screport-24"></span>학생 리포트
                                    </p>
                                </div>
                            </div>
                            <div class="btn">
                                <span @click="openConfirmModal('hiding')">학생 숨김</span>
                                <span class="line"></span>
                                <span @click="openConfirmModal('delete')">학생 삭제</span>
                            </div>
                        </div>

                        <!-- 포인트 지급 영역 -->
                        <div class="select">
                            <div class="top">
                                <div class="title">포인트 지급</div>
                                <div @click="closeModal(false, 'esc')" class="modal-close-btn"></div>
                            </div>
                            <div class="content give-points"
                                :class="{ effort: isNegative }">
                                <div class="content__tl-wrap">
                                    <div class="content__top">
                                        <div class="content__top-tab">
                                            <button
                                                v-for="tabItem of [{tab: false, name: '좋음'}, {tab: true, name: '노력'}]"
                                                :key="`${tabItem.tab}-button`"
                                                :class="{ on: isNegative === tabItem.tab }"
                                                @click="changeContentTab(tabItem.tab)"
                                            >
                                              {{ tabItem.name }}
                                            </button>
                                        </div>
                                        <div class="content__top-add">
                                            <button @click="openPointEditPopup"><i class="bh-icon-plus-18-blue"></i>포인트 추가</button>
                                        </div>
                                    </div>
                                    <div class="content__list">
                                        <template v-if="pointList.length > 0">
                                          <point-item
                                              v-for="(item, idx) of pointList"
                                              :key="`content-list-card-${item.pointId}`"
                                              :isDropUp="isDropUp(idx)"
                                              :point="item"
                                              :isNegative="isNegative"
                                              :isShowEditKebab="false"
                                              @checkPoint="checkPoint"
                                          />
                                        </template>
                                        <template v-else>
                                            <div class="nodata">
                                                <i class="bh-icon-warning-circle-fill-52"></i>
                                                <span>포인트를 등록해주세요.</span>
                                                <button @click="openPointEditPopup"><i class="bh-icon-plus-18-blue"></i>포인트 추가</button>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                                <div class="content__input">
                                    <input
                                        type="text"
                                        placeholder="메모를 남길 수 있습니다."
                                        v-model="givePointItem.memo"
                                        @input="inputGivePointMemo"
                                    />
                                    <button :class="{ on: isSubmit }" :disabled="!isSubmit" @click="submitPoint">
                                        <i class="bh-icon-reward-fill-24"></i>
                                        {{ !isSubmit ? '포인트 지급' : `${totalPoint}포인트 지급` }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <toast-type01
                            v-if="toastMessageModal.open === true"
                            :item="toastMessageModal"
                        />
                    </div>
                </div>
            </div>
        </div>
       
        <confirm-modal
            v-if="confirmModal.isOpen"
            :title="confirmModal.title"
            :description="confirmModal.description"
            :confirmButtonText="confirmModal.confirmButtonText"
            :confirmButtonColor="confirmModal.confirmButtonColor"
            @closeConfirmDialog="closeConfirmModal"
        />
        <change-student-character-modal
            v-if="isOpenModal.characterEdit"
            :current="studentCharater"
            @close="closeChangeCharacterModal"
        />

        <edit-point
            v-if="isOpenModal.pointEdit"
            :updatePointItem="{}"
            :popupPointType="popupPointType"
            @closePointEditModal="closePointEditModal"
            @savePoint="savePoint"
        />

        <who-write-modal
            v-if="isOpenModal.whoWrite"
            :mode="'write'"
            :studentList="totalGivePointStudents"
            @close="closeWhoWriteModal"
            @closeSubmit="closeWhoWriteModal"
        />
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import ChangeStudentCharacterModal from '@/apps/behavior/components/popup/ChangeStudentCharacterModal.vue'
import EditPoint from '@/apps/behavior/components/popup/EditPoint.vue'
import WhoWriteModal from '@/apps/behavior/components/popup/WhoWriteModal.vue'
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
import PointItem from "@/apps/behavior/components/popup/PointItem.vue";
import { usePointController } from '@/apps/behavior/modules/point';
const pointController = usePointController();

export default {
    name: 'update-student-detail-modal',
    components: {ConfirmModal, ChangeStudentCharacterModal, EditPoint,WhoWriteModal, ToastType01, PointItem},
    props: {
        classroomId: String,
        selectedStudent: Object
    },
    data() {
        return {
            searchParams: {},
            isLoaded: false,
            isAllDataLoaded: false,
            isNegative: false,
            confirmModal: {},
            student: {},
            studentBirth: {
                year: "",
                month: "",
                day: ""
            },
            givePointItem: {
                memo: ""
            },
            loadFinish: false,
            isOpenModal: {
              pointEdit: false,
              whoWrite: false,
              characterEdit: false
            },
            popupPointType: 'good',
            totalGivePointStudents: [],
            isSubmitClick: false,
            givedPointIds: [],
            toastMessageModal: {
                open: false,
                message: '변경 불가한 학생명입니다.',
                top: null,
                bottom: 10,
                left: null,
                right: null,
                width: null, // null = 420px 
                height: null, // null = 66px
                align: "center" // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right
            },
            isEditMode: {
              studentNo: false,
              studentName: false,
              studentBirth: false
            }
        }
    },
    computed: {
      ...mapState(['user']),
        ...mapState('storeBehavior', ['curClassroom', 'characters', 'detailClass']),
        studentCharater: function() {
            return {
                code: this.student.studentCharacter,
                url: `https://download.hiclass.net/static/classroom/student/${this.student.studentCharacter}_head.png`,
                photo: this.student.studentPhoto
            }
        },
        isSubmit() {
            return this.pointList.some(p => p.checked)
        },
        isPhoto: function() {
            return this.student.studentPhoto !== null
        },
        character: function() {
            return this.isPhoto
                ? this.student.studentPhoto
                : `https://download.hiclass.net/static/classroom/student/${this.student.studentCharacter}_fullshot.png`
        },
        isStudentType() {
            return this.detailClass.studentViewType !== 'NONE'
        },
        totalPoint() {
            return this.pointList.filter(point => point.checked).map(point => point.point * point.issueCount).reduce((sum, num) => sum + num, 0)
        },
        pointList() {
          return pointController.model.points
        },
        isDropUp() {
          return (idx) => {
            if (this.pointList.length <= 2) return false
            return this.pointList.length >= 4 ? this.pointList.length - idx < 3 : this.pointList.length - idx < 2
          }
        }
    },
    watch: {
        'toastMessageModal.open': {
            handler: function(value) {
                if(value) {
                    setTimeout(() => {
                        this.toastMessageModal.open = false
                    }, 1300)
                }
            }
        }
    },
    methods: {
        ...mapActions('storeBehavior', [
          'patchClassroomStudentNumber',
          'patchClassroomStudentName',
          'patchClassroomStudentBirth',
          'patchClassroomStudentIsHiding',
          'deleteClassroomStudent',
          'patchClassroomStudentCharacter',
          'sendStompClient',
          'getCharacters'
        ]),
        initParams() {
          this.isAllDataLoaded = false
          this.searchParams = {
            userId: this.user.currentId,
            size: 20,
            page: 0,
            isNegative: this.isNegative
          }
        },
        getLocalStoragePoint() {
          const behaviorGivePointIds = JSON.parse(localStorage.getItem(`behaviorGive${!this.isNegative ? 'Good' : 'Bad'}PointIds`))
          if (behaviorGivePointIds) {
            this.givedPointIds = behaviorGivePointIds
          }

          if (this.givedPointIds[0]) {
            const targetIdx = this.pointList.findIndex(p => p.pointId === this.givedPointIds[0])
            if (targetIdx > -1) this.pointList[targetIdx].checked = true
          }
        },
        moveReports: function() {
            this.$emit('moveReport', this.student.studentId)
        },
        initConfirmModal() {
          this.confirmModal = {
            isOpen: false,
            title: '',
            description: '',
            confirmButtonText: '',
            confirmButtonColor: '',
            action: ''
          }
        },
        openConfirmModal: function(action) {
            this.confirmModal = {...this.confirmModal, action}
            switch(action) {
                case 'hiding' :
                    this.confirmModal.title = `${this.student.studentName} 학생을 숨기시겠습니까?`
                    this.confirmModal.description = '숨김처리된 학생은\n교실에서 더 이상 노출되지 않습니다.'
                    break;
                case 'delete' :
                    this.confirmModal.title = `${this.student.studentName} 학생을 삭제하시겠습니까?`
                    this.confirmModal.description = '삭제된 학생은 복원이 불가합니다.'
                    this.confirmModal.confirmButtonText = '삭제'
                    this.confirmModal.confirmButtonColor = '#F04F59'
                    break;
            }
            this.confirmModal = {...this.confirmModal, isOpen: true}
        },
        closeConfirmModal: async function(isConfirm) {
            if (!isConfirm) {
              this.initConfirmModal()
              return
            }

            let mode = null
            const params = { classroomId: this.classroomId, studentId: this.student.studentId }
            const action = {
              'hiding': async () => {
                mode = 'hiding'
                await this.patchClassroomStudentIsHiding({...params, isHiding: true})
              },
              'delete': async () => { await this.deleteClassroomStudent(params) }
            }
            await action[this.confirmModal.action]()
            this.initConfirmModal()
            this.closeModal(true, mode)
        },
        closeModal: function(isReload, mode = null) {
            if(mode === 'esc') {
                this.$emit('close', isReload, mode, this.student)
            } else {
                this.$emit('close', isReload, mode)
            }
        },
        openChangeCharacterModal: function() {
            this.isOpenModal.characterEdit = true
            this.getCharacters()
        },
        closeChangeCharacterModal: async function(character) {
            if(character) {
                const params = {
                    classroomId: this.classroomId,
                    studentId: this.student.studentId,
                    studentCharacter: character.code,
                    studentPhoto: character.photo
                }
                const res = await this.patchClassroomStudentCharacter(params)
                if(res.status === 200) {
                    this.student = {...this.student, studentCharacter: character.code, studentPhoto: character.photo}
                }
            }
            this.isOpenModal.characterEdit = false
        },
        changeMode(input) {
          if (input !== 'studentBirth') {
            this.$refs[input].value = this.student[input]

          } else if (this.student.studentBirthday) {
            const birthArr = this.student.studentBirthday.split("-")
            this.studentBirth.year = birthArr[0]
            this.studentBirth.month = birthArr[1]
            this.studentBirth.day = birthArr[2]
          }

          this.isEditMode[input] = !this.isEditMode[input]

          if (this.isEditMode[input]) {
            this.$nextTick(() => {
              if (input === 'studentName') {
                this.$refs.studentName.style.height = "44px"
                this.$refs.studentName.style.height = `${this.$refs.studentName.scrollHeight}px`
              }
              const target = this.$refs[input]
              Array.isArray(target) ? target[0].focus() : target.focus()
            })
          }
        },
        changeStudentNumber: async function() {
            if (this.$refs.studentNo.value.trim()) {
                const params = {
                    classroomId: this.classroomId,
                    studentId: this.student.studentId,
                    studentNo: this.$refs.studentNo.value
                }
                await this.patchClassroomStudentNumber(params)
                this.student.studentNo = this.$refs.studentNo.value
            }

            this.changeMode('studentNo')
        },
        inputNameStyle: function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
            }
            e.target.value = e.target.value.replace(/[^A-Za-z0-9ㄱ-힣\s]/gi, '').trim()
            e.target.value = e.target.value.substr(0, 20)
            this.$refs.studentName.style.height = "44px"
            this.$refs.studentName.style.height = `${this.$refs.studentName.scrollHeight}px`
        },
        changeStudentName: async function() {
            this.toastMessageModal.open = false
            const replaceNotFullKorean = /[ㄱ-ㅎㅏ-ㅣ]/gi

            if(this.$refs.studentName.value.match(replaceNotFullKorean)) {
                this.toastMessageModal.open = true
                return
            }

            const params = {
                classroomId: this.classroomId,
                studentId: this.student.studentId,
                studentName: this.$refs.studentName.value
            }
            if(this.$refs.studentName.value.trim()) {
                await this.patchClassroomStudentName(params)
                this.student = {...this.student, studentName: this.$refs.studentName.value}
            }

            this.changeMode('studentName')
        },
        blurStudentBirth(e) {
          if (
              e.relatedTarget && e.relatedTarget.nodeName === "INPUT" &&
              ['year', 'month', 'day'].includes(e.relatedTarget.className)
          ) {
            this.checkStudentBirth()
            this.isEditMode.studentBirth = true
            return
          }
          this.checkStudentBirth()
          this.changeStudentBirth()
        },
        changeStudentBirth: async function() {
            const values = Object.values(this.studentBirth)
            if (values.every(v => v !== '') || values.every(v => v === '')) {
                let date = null
                if (values.some(v => v !== '')) {
                    date = `${this.studentBirth.year}-${String(this.studentBirth.month).padStart(2, "0")}-${String(this.studentBirth.day).padStart(2, "0")}`
                    
                    const format = /^(19[0-9][0-9]|20\d{2})-(0[1-9]|[1-9]|1[0-2])-([1-9]|0[1-9]|[1-2][0-9]|3[0-1])$/

                    if (!format.test(date)){
                        this.$hiClass.alert('유효한 날짜인지 확인해주세요.')
                        return
                    }
                }

                const params = {
                    classroomId: this.classroomId,
                    studentId: this.student.studentId,
                    studentBirthday: date
                }
                await this.patchClassroomStudentBirth(params)
                this.student = {...this.student, studentBirthday: date}
            }
            this.isEditMode.studentBirth = false
        },
        checkStudentBirth: function() {
          const format = {
            'year': /^(19[0-9][0-9]|20\d{2})$/,
            'month': /^(0[1-9]|[1-9]|1[0-2])$/,
            'day': /^([1-9]|0[1-9]|[1-2][0-9]|3[0-1])$/
          }

          for (let key of Object.keys(format)) {
            if(!format[key].test(this.studentBirth[key])) {
              this.studentBirth[key] = ''
            }
          }
        },
        inputOnlyNumber: function(e){
            e.target.value = e.target.value.replace(/^0+/, '')
            e.target.value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
        },
        clickStopCapturing: function(e) {
            e.stopPropagation()
        },
        changeContentTab: async function(isNegative) {
          this.isNegative = isNegative
          this.initParams()
          while (!this.isAllDataLoaded) {
            this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
            this.searchParams.page++
          }
          this.getLocalStoragePoint()
        },
        checkPoint: function(item) {
          if (this.pointList.filter(p => p.checked).length < 5 || item.checked) {
            this.pointList.find(point => point.pointId === item.pointId).checked = !item.checked
          }
        },
        submitPoint: async function() {
          if (this.isSubmitClick) return
          this.isSubmitClick = true

          const send = await pointController.rewardPoints({
            userId: this.user.currentId,
            students: [[this.student]],
            memo: this.givePointItem.memo,
            isNegative: this.isNegative,
            issueDt: null,
            isVisiblePoint: true
          })

          if (send) {
            await this.sendStompClient(send)
            this.closeModal(false, `givePoint-${!this.isNegative ? 'good' : 'bad'}`)
          }

          this.isSubmitClick = false
        },
        openPointEditPopup: function() {
            this.isOpenModal.pointEdit = true
            this.popupPointType = !this.isNegative ? 'good' : 'bad'
        },
        closePointEditModal: function() {
            this.isOpenModal.pointEdit = false
        },
        savePoint: function(emitItem) {
          if (Object.keys(emitItem.item).length > 0) {
            pointController.appendPoints({ ...emitItem.item, checked: false, issueCount: 1 })
          }
          this.closePointEditModal()
        },
        openWhoWriteModal: function() {
            this.$hiClass.toggleBodyClass('add', 'hidden')
            this.isOpenModal.whoWrite = true
            const { studentId, studentNo, studentName, studentCharacter, isHidden, point } = this.student
            this.totalGivePointStudents = [{ studentId, studentNo, studentName, studentCharacter, isHidden, point, checked: true }]
        },
        inputGivePointMemo: function(e) {
            e.target.value = e.target.value.substring(0, 50)
        },
        closeWhoWriteModal: function() {
            this.$hiClass.toggleBodyClass('remove', 'hidden')
            this.isOpenModal.whoWrite = false
            this.totalGivePointStudents = []
        },
        userId() {
            return localStorage.uuid
        },
    },
    async created() {
      pointController.initPoints()
      pointController.setClassroomId(this.curClassroom.classroomId)
      this.initConfirmModal()
      this.student = {...this.selectedStudent}
    },
    async mounted() {
      this.initParams()
      try {
        while (!this.isAllDataLoaded) {
          this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
          this.searchParams.page++
        }
        this.getLocalStoragePoint()
      } finally {
        this.isLoaded = true
      }
    }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
    right: 16px;
}
</style>