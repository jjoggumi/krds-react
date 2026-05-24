<template>
    <div class="class__wrap"
        :class="{
            'on-total-give': isTotalGivePointMode === true,
            'on-who': isWhoWriteMode === true,
            'on-total-reset': isResetMode === true,
        }"
    >    
        <div class="class__content" :class="{expand: expanded}" id="behavior-charater-content">
            <div v-if="isStompConnected" class="class__content__card" id="behavior-charater-content-card">
                <div
                    v-for="student of students"
                    :key="student.studentId"
                    @click="studentPointCheck(student)"
                    class="card view cursor-pointer"
                    :class="{
                        checked: student.checked === true
                    }"
                >
                    <div class="checked-outline"></div>
                    <div class="basic">
                        <span class="num">{{ student.studentNo }}</span>
                        <span class="name">{{ student.studentName }}</span>
                    </div>
                    <template v-if="isTotalGivePointMode === true || isWhoWriteMode === true || isResetMode === true">
                        <div class="check">
                          <input type="checkbox" :id="`inwon-check-total-${student.studentId}`" :checked="student.checked === true" @click="studentPointCheck(student)" />
                          <label :for="`inwon-check-total-${student.studentId}`"></label>
                        </div>
                    </template>
    
                    <template v-else>
                        <div class="new-good-bg" v-if="givePointMode === 'good' && getStudentNew(student)"></div>
                        <div class="new-bad-bg" v-if="givePointMode === 'effort' && getStudentNew(student)"></div>
                        <div class="reset-bg" v-if="!getStudentNew(student) && resetAnimationClass(student.studentId)"></div>
                        <!-- <div class="reward" 
                            :class="{
                                new: getStudentNew(student),
                                reset: !getStudentNew(student) && resetAnimationClass(student.studentId)
                            }"
                            v-if="isPointType === true">
                            <span class="bh-bg-num-reward"
                                :class="{
                                    minus: student.point < 0
                                }"
                            >
                                <em :class="{
                                    over: student.point >= 1000 || student.point <= -1000
                                }">
                                    <template v-if="student.point >= 9999">
                                        9999
                                    </template>
    
                                    <template v-else-if="student.point <= -9999">
                                        -9999
                                    </template>
    
                                    <template v-else>
                                        {{ student.point }}
                                    </template>
                                </em>
                                <img />
                            </span>
                        </div> -->
                        
                    </template>
                    <div class="rewardNew"
                        :class="{
                            new: getStudentNew(student),
                            reset: !getStudentNew(student) && resetAnimationClass(student.studentId)
                        }"
                    >
                        <span :class="{
                          minus: student.point < 0
                        }">
                            <template v-if="isPointType === true && isTotalGivePointMode !== true && isWhoWriteMode !== true && isResetMode !== true">
                                <template v-if="student.point >= 9999">
                                    9999
                                </template>
    
                                <template v-else-if="student.point <= -9999">
                                    -9999
                                </template>
    
                                <template v-else>
                                    {{ student.point }}
                                </template>  
                          </template>      
                        </span>
                    </div>
                    <div class="character" 
                        :class="{
                            'no-profile': !isStudentType
                        }" 
                        @click="!isTotalGivePointMode && !isWhoWriteMode && !isResetMode ? openUpdateStudentDetailModal($event, student.studentId) : null">

                        <student-photo :student="student" />
                    </div>
                </div>
                <div  v-if="!isCheckMode" class="card add cursor-pointer" @click="clickAddButton">
                    <i class="bh-icon-plus-circle-fill-72-gray"></i>
                    <span>학생추가</span>
                </div>
            </div>
        </div>
        <div class="class__badge">
            <template v-if="isTotalGivePointMode === true">
                <div>
                  <button class="give-esc" @click="closeTotalGivePointMode">취소</button>
                  <template v-if="isStudentCheckLength > 0">
                    <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{ isStudentCheckLength }}명 선택해제</span>
                    <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
                  </template>
  
                  <template v-else>
                    <span class="total" @click="studentsChecked"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
                  </template>
                </div>
                <div>
                    <button class="give-point" 
                        :class="{
                            dis: isSubmit === false
                        }"
                        :disabled="isSubmit === false"
                        @click="openGiveTotalPointModal"
                    ><i class="bh-reward-32"></i>{{ isCheckLength }}명 포인트 지급</button>
                </div>
            </template>
    
            <template v-else-if="isWhoWriteMode === true">
                <div>
                    <button class="give-esc" @click="closeWhoWriteMode">취소</button>
                    <template v-if="isStudentCheckLength > 0">
                      <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{ isStudentCheckLength }}명 선택해제</span>
                      <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
                    </template>
  
                    <template v-else>
                      <span class="total" @click="studentsChecked"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
                    </template>
                </div>
                <div>
                    <button class="who-write"
                        :class="{
                            dis: isSubmit === false
                        }"
                        :disabled="isSubmit === false"
                        @click="openWhoWriteModal"
                    ><i class="bh-icon-pencil-32"></i>누가기록 작성</button>
    
                </div>
            </template>
    
            <template v-else-if="isResetMode === true">
                <div>
                    <button class="give-esc" @click="closeResetMode">취소</button>
                    <template v-if="isStudentCheckLength > 0">
                      <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{ isStudentCheckLength }}명 선택해제</span>
                      <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
                    </template>
  
                    <template v-else>
                      <span class="total" @click="studentsChecked"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
                    </template>
                </div>
                <div>
                    <button class="check-total" @click="openConfirmModal('resetAllStudents')">전체 초기화</button>
                    <button class="give-point"
                        :class="{
                            dis: isSubmit === false
                        }"
                        :disabled="isSubmit === false"
                        @click="openConfirmModal('resetSelectedStudents')"
                    >
                        {{ isCheckLength }}명 포인트 초기화
                    </button>
                </div>
            </template>
    
            <template v-else>
                <div>
                    <!-- <span class="reset"><i class="bh-icon-refresh-20"></i>포인트 초기화</span> -->
                    <span class="reset" @click="openResetMode"><i class="bh-icon-refresh-24"></i>보이는 포인트 초기화</span>
                    <template v-if="isStudentCheckLength > 0">
                      <span class="chk-out" @click="studentCheckOut"><i class="bh-icon-return-24"></i>{{ isStudentCheckLength }}명 선택해제</span>
                      <span class="change" @click="studentCheckChange"><i class="bh-icon-change-24"></i>선택반전</span>
                    </template>
  
                    <template v-else>
                      <span class="total" @click="studentsChecked"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
                    </template>
                  </div>
                <div>
                    <button class="pick" @click="openRandomPicker">랜덤<br>뽑기</button>
                    <button class="who" @click="openWhoWriteMode">누가<br>기록</button>
                    <button class="effort" @click="openTotalGivePointMode('effort')">노력 지급</button>
                    <button class="good" @click="openTotalGivePointMode('good')">좋음 지급</button>
                </div>
            </template>
    
        </div>
        <confirm-modal
            v-if="confirmModal.isOpen"
            :title="confirmModal.title"
            :description="confirmModal.description"
            :confirmButtonText="confirmModal.confirmButtonText"
            :confirmButtonColor="confirmModal.confirmButtonColor"
            :cancelButtonText="confirmModal.cancelButtonText"
            @closeConfirmDialog="closeConfirmModal"
        />
    
        <toast-type01 
            v-if="toastMessageModal.open === true"
            :item="toastMessageModal"
        />
    
        <add-student-modal 
            v-if="isOpenStudentModal" 
            :curClassroomId="classroomId" 
            @close="closeAddStudentModal" 
        />
        <update-student-detail-modal 
            v-if="isOpenStudentDetailModal"
            :classroomId="classroomId"
            :selectedStudent="selectedStudent"
            @moveReport="moveStudentReport"
            @close="closeUpdateStudentDetailModal" 
        />
    
        <give-total-point-modal 
            v-if="isGiveTotalPointModal === true"
            :mode="totalGivePointKind"
            :studentList="[totalGivePointStudents]"
            @close="closeGiveTotalPointModal"
            @closeSubmit="givePointFinish"
        />
    
        <who-write-modal 
            v-if="isOpenWhoWriteModal === true"
            :mode="'write'"
            :studentList="totalGivePointStudents"
            @close="closeWhoWriteModal"
            @closeSubmit="whoWriteFinish"
        />
    
        <!-- <give-point-finish-toast 
            v-if="givePointFinishModal.open === true"
            :item="givePointFinishModal"
        /> -->
    </div>  
</template>
    
<script>
    import {mapActions, mapState, mapMutations, mapGetters} from 'vuex'
    import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
    import AddStudentModal from '@/apps/behavior/components/popup/AddStudentModal.vue'
    import UpdateStudentDetailModal from '@/apps/behavior/components/popup/UpdateStudentDetailModal.vue'
    import GiveTotalPointModal from '@/apps/behavior/components/popup/GiveTotalPointModal.vue'
    import WhoWriteModal from '@/apps/behavior/components/popup/WhoWriteModal.vue'
    import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
    import StudentPhoto from '@/apps/behavior/components/common/StudentPhoto.vue'
    import { eventBus } from '@/main'

    export default {
        name: 'students',
        components: {
            ConfirmModal,
            AddStudentModal,
            UpdateStudentDetailModal,
            GiveTotalPointModal,
            WhoWriteModal,
            ToastType01,
            StudentPhoto
        },
        props: {
            expanded: Boolean,
            sorting: String
        },
        data() {
            return {
                isOpenStudentModal: false,
                isOpenStudentDetailModal: false,
                confirmModal: {
                    isOpen: false,
                    title: '전체 초기화 하시겠습니까?',
                    description: '현재 교실에서 보이는 포인트만 0으로 되며\n기존 지급내역은 리포트에서 확인 가능합니다.',
                    confirmButtonText: '초기화 하기',
                    confirmButtonColor: '#F04F59',
                    cancelButtonText: '취소',
                    action: 'allReset'
                },
                selectedStudent: null,
                isTotalGivePointMode: false,
                totalGivePointKind: "",
                totalGivePointStudents: [],
                isGiveTotalPointModal: false,
                isWhoWriteMode: false,
                isOpenWhoWriteModal: false,
                givePointFinishModal: {
                    open: false,
                    mode: null
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
                    align: "center" // 텍스트정렬 - 가운데:center, 좌측:left , 우측:right 
                },
                /* 포인트초기화 */
                isResetMode: false,
                givePointMode: "",
                list: []
            }
        },
        computed: {
            ...mapState('storeBehavior', {
                curClassroom: 'curClassroom',
                students: 'students',
                detailClass: 'detailClass',
                newStudentPoints: 'newStudentPoints',
                resetStudentsIds: 'resetStudentsIds'
            }),
            ...mapGetters('storeBehavior', ['isStompConnected']),
            classroomId: function() {
                return this.curClassroom.classroomId
            },
            isSubmit() {
                return this.students.some(v => v.checked === true) 
            },
            isCheckLength() {
                return this.students.filter(v => v.checked === true).length
            },
            isStudentTotalCheck() {
                return this.students.filter(v => v.checked === true).length === this.students.length
            },
            isPointType() {
                return this.detailClass.pointViewType === 'NONE' ? false : true
            },
            isStudentType() {
                return this.detailClass.studentViewType === 'NONE' ? false : true
            },
            isCheckMode: function() {
                return this.isTotalGivePointMode === true || this.isWhoWriteMode === true || this.isResetMode === true
            },
            isStudentCheckLength: function() {
              return this.students.filter(v => v.checked).length
            }
        },
        watch:{
            classroomId: {
                handler: async function (newVal, oldVal) {
                    if(newVal && newVal !== oldVal){
                        this.isWhoWriteMode = false
                        this.isTotalGivePointMode = false
                        this.isResetMode = false
                        this.setResetStudentsIds([])
                        this.totalGivePointKind = ''
                        await this.initDetailClass()
                        const params = {classroomId: newVal, isHidden: false, isIncludePoint: true}
                        if(this.sorting !== 'no') {
                            params.sort = 'point,desc'
                        }
                        this.list = await this.getClassroomStudents(params)
                        if(!this.expanded) {
                            this.$nextTick(() => {
                                this.contentCardSizing()
                                this.setContentsCardWidth()
                            })
                        }

                        if(this.list.length === 0) {
                            this.$router.push(`/behavior-records/${this.classroomId}/classrooms/manageStudents`)
                        }
                    }
                }
            },
            sorting : {
                handler: async function (newVal, oldVal) {
                    if(newVal && newVal !== oldVal){
                        const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
                        if(newVal !== 'no') {
                            params.sort = 'point,desc'
                        }
                        await this.getClassroomStudents(params)
                        if(!this.expanded) {
                            this.$nextTick(() => {
                                this.contentCardSizing()
                                this.setContentsCardWidth()
                            })
                        }
                    }
                }
            },
            'toastMessageModal.open': {
                handler: function(value) {
                    if(value) {
                        setTimeout(() => {
                            this.toastMessageModal.open = false
                        }, 1300)
                    }
                }
            },
        },
        methods:{
            ...mapActions('storeBehavior', {
                patchLoadClassStudents: 'patchLoadClassStudents',
                getClassroomStudents: 'getClassroomStudents',
                getIsClazzStudents: 'getIsClazzStudents',
                patchPointGiveFinishModal: 'patchPointGiveFinishModal',
                getDetailClass: 'getDetailClass',
                patchRewardResetStudents: 'patchRewardResetStudents',
                patchRewardResetAllStudents: 'patchRewardResetAllStudents',
                sendStompClient: 'sendStompClient',
                getClassroomStudentDetail: 'getClassroomStudentDetail',
            }),
            ...mapMutations('storeBehavior', {
                setCurClassroom: 'setCurClassroom',
                setStudents: 'setStudents',
                setNewStudentPoints: 'setNewStudentPoints',
                setResetStudentsIds: 'setResetStudentsIds'
            }),
            isPhoto: function(student) {
                return student.studentPhoto !== null
            },
            moveStudentReport: function(id) {
                this.isOpenStudentDetailModal = false
                this.$router.push({
                    path: `/behavior-records/${this.classroomId}/reports`,
                    query: { studentId: id }
                })
            },
            clickAddButton: async function() {
                this.$hiClass.toggleBodyClass('add', 'hidden')
                this.isOpenStudentModal = true
            },
            openConfirmModal: function(action) {
                switch(action) {
                    case 'resetAllStudents':
                        this.confirmModal = {
                            ...this.confirmModal,
                            title: '전체 초기화 하시겠습니까?',
                            isOpen: true,
                            action
                        }
                        break
                    case 'resetSelectedStudents':
                        this.confirmModal = {
                            ...this.confirmModal,
                            title: `${this.isCheckLength}명 초기화 하시겠습니까?`,
                            isOpen: true,
                            action
                        }
                        break
                }
            },
            closeConfirmModal: async function(isConfirm) {
                if(isConfirm) {
                    if(this.confirmModal.action === 'resetAllStudents') {
                        await this.rewardResetAllStudents()
                    } else {
                        await this.rewardResetStudents()
                    }
                }
    
                this.confirmModal.isOpen = false
            },
            closeAddStudentModal: async function(isReload) {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
                this.isOpenStudentModal = false
                if(isReload) {
                    const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
                    if(this.sorting !== 'no') {
                        params.sort = 'point,desc'
                    }
                    await this.getClassroomStudents(params)
                    if(!this.expanded) {
                        this.$nextTick(() => this.setContentsCardWidth())
                    }
                }
            },
            openUpdateStudentDetailModal: async function(e, selectedStudentId) {
                e.stopPropagation()
  
                this.setResetStudentsIds([])
                this.$hiClass.toggleBodyClass('add', 'hidden')
    
                this.patchPointGiveFinishModal({
                    open: false,
                    mode: null
                })
                const student = await this.getClassroomStudentDetail({
                    classroomId: this.classroomId,
                    studentId: selectedStudentId
                })
                if(student.status !== 200) {
                    this.$hiClass.alert('삭제된 학생입니다.')
                    this.setStudents(this.students.filter(s => s.studentId !== selectedStudentId))
                    return
                }
                this.selectedStudent = student
                this.isOpenStudentDetailModal = true
            },
            closeUpdateStudentDetailModal: async function(isReload, mode, student = false) {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
                if(this.toastMessageModal.open === true) this.toastMessageModal.open = false
        
                this.isOpenStudentDetailModal = false
                if(isReload) {
                    const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
                    if(this.sorting !== 'no') {
                        params.sort = 'point,desc'
                    }
                    await this.getClassroomStudents(params)
                    if(!this.expanded) {
                        this.$nextTick(() => this.setContentsCardWidth())
                    }
                }
    
                if(mode === 'givePoint-good') {
                    this.givePointMode = 'good'
                } else if(mode === 'givePoint-effort') {
                    this.givePointMode = 'effort'
                } else if(mode === 'hiding') {
                    this.toastMessageModal.open = true
                    this.toastMessageModal.message = "숨김처리되었습니다."
                    this.toastMessageModal.bottom = 50
                } else if(mode === 'esc') {
                    const obj = this.students.find(v => v.studentId === student.studentId)
                    obj.studentName = student.studentName
                    obj.studentNo = student.studentNo
                    obj.studentCharacter = student.studentCharacter
                    obj.studentPhoto = student.studentPhoto
                    this.students = this.students.sort(this.sortStudentAct)
                }
            },
            sortStudentAct(a, b) {
                if (a.studentNo !== b.studentNo) {
                    return a.studentNo - b.studentNo
                }

                const isNumeric = (char) => /^[0-9]/.test(char);
                const isEnglish = (char) => /^[a-zA-Z]/.test(char);
                const isKorean = (char) => /^[ㄱ-ㅎ가-힣]/.test(char);

                const firstCharA = a.studentName
                const firstCharB = b.studentName

                if (isNumeric(firstCharA) && !isNumeric(firstCharB)) {
                    return -1; // a가 숫자이고 b가 숫자가 아니면 a를 앞에
                } else if (!isNumeric(firstCharA) && isNumeric(firstCharB)) {
                    return 1; // b가 숫자이고 a가 숫자가 아니면 b를 앞에
                } else if (isEnglish(firstCharA) && !isEnglish(firstCharB)) {
                    return -1; // a가 영문자이고 b가 영문자가 아니면 a를 앞에
                } else if (!isEnglish(firstCharA) && isEnglish(firstCharB)) {
                    return 1; // b가 영문자이고 a가 영문자가 아니면 b를 앞에
                } else if (isKorean(firstCharA) && !isKorean(firstCharB)) {
                    return -1; // a가 한글이고 b가 한글이 아니면 a를 앞에
                } else if (!isKorean(firstCharA) && isKorean(firstCharB)) {
                    return 1; // b가 한글이고 a가 한글이 아니면 b를 앞에
                } else {
                    return a.studentName.localeCompare(b.studentName); // 모두 같은 유형일 경우 사전순으로 정렬
                }  
                },
            contentCardSizing: async function() {
                await this.$comn.asyncWaitFor(() => this.isStompConnected)
                const behaviorCharaterContentEl = document.getElementById("behavior-charater-content")
                const behaviorCharaterContentCardEl = document.getElementById("behavior-charater-content-card")
                const width = behaviorCharaterContentEl.clientWidth
                const height = behaviorCharaterContentEl.clientHeight
                let zoom = 1
    
                if((width / 1584) >= (height / 792)) {
                    zoom = (height / 792)
                } else {
                    zoom = (width / 1584)
                }
    
                behaviorCharaterContentCardEl.style.zoom = zoom
            },
            setContentsCardWidth: async function() {
                await this.$comn.asyncWaitFor(() => this.isStompConnected)
                const viewPortHeight = window.innerHeight
                const behaviorCharaterContentCardEl = document.getElementById("behavior-charater-content-card")
                const cardEls = behaviorCharaterContentCardEl.querySelectorAll(".card")
                console.log('setContentsCardsWidth', cardEls.length)

                if(cardEls.length <= 18) {
                    for(const cardEl of cardEls) {
                        cardEl.classList.remove("type02", "type03")
                        cardEl.classList.add("type01")
                        cardEl.setAttribute("style", "width: 245px; height: 245px; margin: 7px;")
            
                        const basicEl = cardEl.querySelector(".basic")
                        const rewardEl = cardEl.querySelector(".rewardNew")
                        if(!basicEl === false) {
                            const numEl = basicEl.querySelector('.num')
                            const nameEl = basicEl.querySelector('.name')
                            const rewardSpanEl = rewardEl.querySelector('span')                            
                            numEl.setAttribute("style", "height: 28px; font-size: 28px;")
                            nameEl.setAttribute("style", "height: 76px; line-height: 38px; font-size: 38px;")
                            rewardSpanEl.setAttribute("style", "line-height: 50px; font-size: 50px;")
                        }
                    }
                    behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(6, minmax(auto, 259px))"
                    behaviorCharaterContentCardEl.classList.add('ea6');
                } else if(cardEls.length >= 19 && cardEls.length <= 21) {
                    for(const cardEl of cardEls) {
                        cardEl.classList.remove("type01", "type03")
                        cardEl.classList.add("type02")
                        cardEl.setAttribute("style", "width: 207px; height: 207px; margin: 7px; margin-bottom: 26px; margin-top: 26px;")
            
                        const basicEl = cardEl.querySelector(".basic")
                        const rewardEl = cardEl.querySelector(".rewardNew")
                        if(!basicEl === false) {
                            const numEl = basicEl.querySelector('.num')
                            const nameEl = basicEl.querySelector('.name')
                            const rewardSpanEl = rewardEl.querySelector('span')                            
                            numEl.setAttribute("style", "height: 20px; font-size: 20px;")
                            nameEl.setAttribute("style", "height: 68px; font-size: 34px; line-height: 34px;")
                            rewardSpanEl.setAttribute("style", "line-height: 44px; font-size: 44px;")                          
                        }
                    }
                    behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(7, minmax(auto, 221px))"
                    behaviorCharaterContentCardEl.classList.remove('ea6');
                } else {
                    for(const cardEl of cardEls) {
                        if(cardEls.length<=24) {
                            cardEl.setAttribute("style", "width: 179px; height: 179px; margin: 9px; margin-bottom: 40px; margin-top: 40px;")
                        } else {
                            cardEl.setAttribute("style", "width: 179px; height: 179px; margin: 9px;")
                        }
    
                        cardEl.classList.remove("type01", "type02")
                        cardEl.classList.add("type03")
                        const basicEl = cardEl.querySelector(".basic")
                        const rewardEl = cardEl.querySelector(".rewardNew")
                        if(!basicEl === false) {
                            const numEl = basicEl.querySelector('.num')
                            const nameEl = basicEl.querySelector('.name')
                            const rewardSpanEl = rewardEl.querySelector('span')
                            numEl.setAttribute("style", "height: 20px; font-size: 20px;")
                            nameEl.setAttribute("style", "height: 54px; font-size: 28px; line-height: 28px;")
                            rewardSpanEl.setAttribute("style", "line-height: 34px; font-size: 34px;")
                        }
                    }
                    behaviorCharaterContentCardEl.style.gridTemplateColumns = "repeat(8, minmax(auto, 193px))"
                    behaviorCharaterContentCardEl.classList.remove('ea6');
                }
            },
            openTotalGivePointMode: function(data) {
              this.totalGivePointKind = data
              if(this.isStudentCheckLength > 0) {
                  this.openGiveTotalPointModal()
              } else {
                this.setResetStudentsIds([])
                this.isTotalGivePointMode = true
              }
            },
            closeTotalGivePointMode: function() {
                this.isTotalGivePointMode = false
    
                this.studentsUnChecked()
            },
            studentPointCheck: function(item) {
              item.checked = !item.checked
            },
            studentsChecked: function() {
                for(const student of this.students) {
                    student.checked = true
                }
            },
            studentsUnChecked: function() {
                for(const student of this.students) {
                    student.checked = false
                }
            },
            openGiveTotalPointModal: function() {
                this.patchPointGiveFinishModal({
                    open: false,
                    mode: 'null'
                })
                this.$hiClass.toggleBodyClass('add', 'hidden')
                this.isGiveTotalPointModal = true
                this.totalGivePointStudents = JSON.parse(JSON.stringify(this.students.filter(v => v.checked === true)))
            },
            closeGiveTotalPointModal: function() {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
                this.isGiveTotalPointModal = false
                this.totalGivePointStudents = []
            },
            givePointFinish: async function(mode) {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
                this.isGiveTotalPointModal = false
                this.totalGivePointStudents = []
                this.isTotalGivePointMode = false
                this.totalGivePointKind = ""
        
                this.studentsUnChecked()

                this.givePointMode = mode

                if(!this.expanded) {
                    this.$nextTick(() => this.setContentsCardWidth())
                }
            },
            openRandomPicker() {
              eventBus.$emit('behavior-records/openPicker');
            },
            /* 누가기록 */
            openWhoWriteMode: function() {
              if(this.isStudentCheckLength > 0) {
                  this.openWhoWriteModal()
              } else {
                this.setResetStudentsIds([])
                this.isWhoWriteMode = true
              }
            },
            closeWhoWriteMode: function() {
                this.isWhoWriteMode = false
                this.studentsUnChecked()
            },
            openWhoWriteModal: function() {
                this.$hiClass.toggleBodyClass('add', 'hidden')
                this.isOpenWhoWriteModal = true
                this.totalGivePointStudents = JSON.parse(JSON.stringify(this.students.filter(v => v.checked === true)))
            },
            closeWhoWriteModal: function() {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
                this.isOpenWhoWriteModal = false
                this.totalGivePointStudents = []
            },
            whoWriteFinish: function() {
                this.$hiClass.toggleBodyClass('remove', 'hidden')
                this.isOpenWhoWriteModal = false
                this.totalGivePointStudents = []
                this.isWhoWriteMode = false
                this.studentsUnChecked()
            },
            initDetailClass: async function() {
                await this.getDetailClass({classroomId: this.classroomId})
            },
            getStudentNew: function(item) {
                const chkIndex = this.newStudentPoints.findIndex(v => v.mode === 'good')
                if(chkIndex > -1) {
                    this.givePointMode = 'good'
                } else {
                    this.givePointMode = 'effort'
                }
                return this.newStudentPoints.findIndex(v => v.studentId === item.studentId) > -1 ? true : false
            },
            /* 포인트초기화 */
            openResetMode: function() {
                this.setResetStudentsIds([])
                this.isResetMode = true
            },
            closeResetMode: function() {
                this.isResetMode = false
    
                this.studentsUnChecked()
            },
            resetAnimationClass: function(id) {
                return this.resetStudentsIds.includes(id)
            },  
            rewardResetAllStudents: async function() {
                const params = {
                    classroomId: this.classroomId
                }
                const res = await this.patchRewardResetAllStudents(params)
                
                if(res.status === 200) {
                    const studentPoints = this.students
                        .map(o => {
                            return {
                                studentId: o.studentId,
                                studentName: o.studentName,
                                studentCharacter: o.studentCharacter,
                                studentPhoto: o.studentPhoto 
                            }
                        })
                    const message = {
                        contentType: 'pointReset',
                        sender: localStorage.uuid,
                        content: JSON.stringify({
                            classroomId: this.classroomId,
                            isToAll: true,
                            studentPoints
                        })
                    }
                    this.sendStompClient(message)
                }
                this.closeResetMode()
            },
            rewardResetStudents: async function() {
                const selectedStudents = this.students.filter(s => s.checked)
                const params = {
                    classroomId: this.classroomId,
                    studentIds: selectedStudents.map(s => s.studentId)
                }
                const res = await this.patchRewardResetStudents(params)
                
                if(res.status === 200) {
                    const studentPoints = selectedStudents
                        .map(o => {
                            return {
                                studentId: o.studentId,
                                studentName: o.studentName,
                                studentCharacter: o.studentCharacter,
                                studentPhoto: o.studentPhoto 
                            }
                        })
                    const message = {
                        contentType: 'pointReset',
                        sender: localStorage.uuid,
                        content: JSON.stringify({
                            classroomId: this.classroomId,
                            isToAll: false,
                            studentPoints
                        })
                    }
                    this.sendStompClient(message)
                }
                
                this.closeResetMode()
            },
            studentCheckOut: function() {
              for(const student of this.students) {
                student.checked = false
              }
            },
            studentCheckChange: function() {
              for(const student of this.students) {
                student.checked = student.checked ? false : true
              }
            }
        },
        async created() {
            if(this.classroomId) {
                const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
                if(this.sorting !== 'no') {
                    params.sort = "point,desc"
                }
                this.list = await this.getClassroomStudents(params)
                
                if(this.$route.query.mode === "check" && this.list.length === 0) {
                    this.$router.push(`/behavior-records/${this.classroomId}/classrooms/manageStudents`)
                }
            }
        },
        mounted() {
            this.setNewStudentPoints([])
            this.initDetailClass()
            const classrooms = this
            window.addEventListener(`resize`, function() {
                if(!classrooms.expanded) {
                    classrooms.contentCardSizing()
                    classrooms.setContentsCardWidth()
                }
            })
            // iOS 감지 후 class 추가
            const isiPad = () => {
                const ua = navigator.userAgent;
                const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
                const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

                // iPad를 감지하는 조건
                return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
            };

            if (isiPad()) {
                document.body.classList.add('ios');
            }
        },
        updated() {
            if(!this.expanded) {
                this.$nextTick(() => {
                    this.contentCardSizing()
                    this.setContentsCardWidth()
                })
            }
        }
    }
    </script>
    
    <style>
    
    </style>