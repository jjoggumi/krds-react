<template>
  <div class="plan-type" ref="planType">
    <div class="plan-type-inner" ref="planTypeInner">
      <button class="blackboard" @click="viewRotate">
        <span>칠판</span>
        <p type="button" class="rotation" >
          <i class="bh-icon-exchange-16"></i>
          <span>상하전환</span>
        </p>
      </button>
      <!-- 나머지 기존 모둠에 합하기  -->
      <ul class="group-type" :class="addEaClassName">
        <li v-for="item of item.seatSections" :key="`seat-sections-${item.sectionId}`"
          :class="{
            checked: isSeatTotalChecked(item),            
            hovered: isHovered === item.sectionId && isAvailStudentCheck(item)
          }"
          @click="seatTotalChecked(item)"
        >
          <div class="plan-info"
            @mouseenter="planInfoEnter(item.sectionId)" 
            @mouseleave="planInfoLeave">
            <p v-if="sectionNameEditId !== item.sectionId" class="plan-name">
              <span>{{ item.sectionName }}</span>
              <button type="button" @click="sectionNameEdit(item.sectionId, $event)" v-if="!isSelectionMode && !isSeatTotalChecked(item)">
                <i class="bh-icon-modify-16"></i>
              </button>
            </p>
            <p v-if="sectionNameEditId !== item.sectionId && isPointType" class="plan-point">
              <i class="bh-icon-reward-fill-20"></i>
              <span v-if="!isBatching">{{ getSectionTotalPoint(item) }}</span>
              <span v-else>0</span>
            </p>
            <p v-if="sectionNameEditId === item.sectionId" class="plan-name-edit">
              <input type="text" placeholder="분단명을 수정해요" 
                :ref="item.sectionId"
                :value="item.sectionName" 
                @input="inputSectionName($event, item)" 
                @keydown.enter="saveSectionName(item, $event)" 
                @keyup.enter="inputSectionName($event, item)" 
                @blur="saveSectionName(item, $event)" 
              />
              <!-- <input type="text" placeholder="분단명을 수정해요" :value="item.sectionName" 
                @input="inputSectionName($event, item)" @keydown="inputSectionName($event, item)" @keyup="inputSectionName($event, item)" 
                @blur="saveSectionName(item, $event)" v-click-outside="focusOutsectionName"
              /> -->
            </p>
          </div>
          <ul class="plan-student">
            <li v-for="seat of item.seats" :key="`seat-${seat.seatId}`" :class="{fixed: seat.isFixed}">
              <template v-if="!isBatchStart && seat.student">
                <div class="new-good-bg" v-if="givePointMode === 'good' && getStudentNew(seat.student)"></div>
                <div class="new-bad-bg" v-if="givePointMode === 'effort' && getStudentNew(seat.student)"></div>
                <div class="reset-bg" v-if="!getStudentNew(seat.student) && resetAnimationClass(seat.student.studentId)"></div>
              </template>
              <button type="button" v-if="seat.isActive" class="info"
                :class="{
                  'has-profile': showProfileImage && seat.student && seat.student.character,
                  checked: seat.checked,
                  'none-view': !isAvailStudentCheck(item),
                  'bg-trans' : !isBatchStart && seat.student ? getStudentNew(seat.student) || resetAnimationClass(seat.student.studentId) : null,
                  'no-profile': !showProfileImage || !seat.student || !seat.student.character
                }"
                @click="studentCheck(seat, $event)"
              >
                <template v-if="!isBatchStart">
                  <template v-if="seat.student">
                    <span class="num">{{ seat.student.studentNo }}</span>
                    <div
                      v-if="showProfileImage && seat.student && seat.student.character"
                      class="profile"
                      :class="{
                        'good-bg': givePointMode === 'good' && getStudentNew(seat.student),
                        'bad-bg': givePointMode === 'effort' && getStudentNew(seat.student),
                        'reset-bg': !getStudentNew(seat.student) && resetAnimationClass(seat.student.studentId)
                      }"
                    >
                      <div :class="getProfileImageClass(seat.student)">
                        <img
                          :src="getProfileImage(seat.student)"
                          alt="썸네일"
                          @load="onProfileImageLoad(seat.student.studentId, $event)"
                        />
                      </div>
                    </div>
                    <div class="user-info">
                      <template v-if="isSelectionMode">
                        <div class="check">
                          <input
                            type="checkbox"
                            :id="`plan-student-check-${seat.seatId}`"
                            :checked="seat.checked"
                          />
                          <label :for="`plan-student-check-${seat.seatId}`"></label>
                        </div>
                      </template>
                    
                      <template v-else>
                        <p class="point"
                          v-if="isPointType"
                          :class="{
                            blue: seat.student.point >= 0,
                            red: seat.student.point < 0,
                            new: getStudentNew(seat.student),
                            reset: !getStudentNew(seat.student) && resetAnimationClass(seat.student.studentId)
                          }"
                        >
                          <template v-if="seat.student.point >= 9999">
                              9999
                          </template>

                          <template v-else-if="seat.student.point <= -9999">
                              -9999
                          </template>

                          <template v-else>
                              {{ seat.student.point }}
                          </template>  
                        </p>
                      </template>
                      <p class="name">{{ seat.student.studentName }}</p>
                    </div>
                  </template>
                </template>
              </button>
              <button type="button" class="fixed-icon" v-if="seat.student && !isSelectionMode && !seat.checked" @click="isSeatFixed(seat, $event)"></button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div ref="startAlert" class="modal start-alert">
      <div class="random"></div>
      <div class="onece">
        <span>3</span>
        <span>2</span>
        <span>1</span>
      </div>
    </div>

    <confirm-modal
        v-if="confirmModal.isOpen"
        :title="confirmModal.title"
        :description="confirmModal.description"
        :confirmButtonText="confirmModal.confirmButtonText"
        :confirmButtonColor="confirmModal.confirmButtonColor"
        :isAlert="confirmModal.isAlert"
        @closeConfirmDialog="closeConfirmModal"
    />
    
    <toast-type01 
      v-if="toastMessageModal.open === true"
      :item="toastMessageModal"
    />
    
    <audio id="audioContainer" ref="giveBatchSound">
      <source id="audioSource" ref="giveBatchSoundSource" src="" />
    </audio>
  </div>
</template>

<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import {mapFields} from "vuex-map-fields";
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import SeatPlansMixin from "@/apps/behavior/mixins/SeatPlansMixin.vue";

export default {
  name: 'seat-plans-group',
  props: {
    detail: Object,
    isWhoWriteMode: Boolean,
    isTotalGivePointMode: Boolean
  },
  components: {
    ToastType01,
    ConfirmModal
  },
  mixins: [SeatPlansMixin],
  data() {
      return {
        addEaClassName: "",
        item: {},
        isHovered: null,
        sectionNameEditId: null,
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
        isBatching: false,
        confirmModal: {
          isOpen: false,
          title: '',
          description: '',
          confirmButtonText: '',
          confirmButtonColor: '',
          action: '',
          isAlert: false
        },
        isSelectionMode: false,
        isBatchStart: false,
        isNameEditing: false,
        givePointMode: "",
        batchSoundFullview: "https://download.hiclass.net/static/assets/audio/batch_sound_fullview.mp3",
        batchSoundFullStartview: "https://download.hiclass.net/static/assets/audio/batch_sound_fullview_start.mp3",
        batchSoundSingleView: "https://download.hiclass.net/static/assets/audio/batch_sound_singleview.mp3",
        batchSoundSingleStartview: "https://download.hiclass.net/static/assets/audio/batch_sound_singleview_start.mp3",
      }
  },
  computed: {
    ...mapFields({
      htmlPrint: 'htmlPrint',
    }),
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
      newStudentPoints: 'newStudentPoints',
      resetStudentsIds: 'resetStudentsIds',
      detailClass: 'detailClass',
    }),    
    showProfileImage() {
      return this.detailClass.studentViewType === "CHARACTER"
    },
    classroomId: function() {
      return this.curClassroom.classroomId
    },
    studentCountInSection() {
        return ((this.item.seatSections || [])[0] || {}).seatCount || 0
    },
    isHidden() {
      return this.item.isStudentHidden
    },
    isPointType() {
      return this.detailClass.pointViewType === 'NONE' ? false : true
    },
  },
  watch: {
    detail(v) {
        this.item = _.cloneDeep(v)
        if (this.isBatching) {
          this.isBatching = false
        }
        if (this.isBatchStart) {
          this.isBatchStart = false
        }
        this.initDetailClass()
        // if(this.isHidden) this.setHidden()
        this.setChecked()
        this.setRoate()
        this.$nextTick(() => {
            this.viewSizing()
        })
    },
    isWhoWriteMode(v) {
      if(v) {
        this.isSelectionMode = true
      } else {
        this.isSelectionMode = false
      }
    },
    isTotalGivePointMode(v) {
      if(v) {
        this.isSelectionMode = true
      } else {
        this.isSelectionMode = false
      }
    },
    newStudentPoints(v) {
      this.givePointFiish(v)
    },
    resetStudentsIds(v) {
      this.resetPointFiish(v)
    }
    
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudents: 'getClassroomStudents',
      patchStudentSeat: 'patchStudentSeat',
      getDetailSeatPlanSections: 'getDetailSeatPlanSections',
      patchStudentHidden: 'patchStudentHidden',
      getDetailClass: 'getDetailClass'
    }),
    planInfoEnter(sectionId) {
      this.isHovered = sectionId;
    },
    planInfoLeave() {
      this.isHovered = null;
    },
    getSectionTotalPoint(item) {
      let point = 0
      for(const seat of item.seats) {
        if(seat.student) {
          point = point + seat.student.point
        }
      }
      return point
    },
    async getDetailItem() {
      try {
          const params = {
              classroomId: this.classroomId,
              seatPlanId: this.item.seatPlanId,
              version: this.item.version
          }
          const res = await this.getDetailSeatPlanSections(params)
          return res.data
      } catch(err) {
          this.$log.debug('getDetailItem GET() error => ', err)
      }
    },
    async autoPositionBatch() {
      this.setChecked()
      if(this.isHidden) {
        this.autoPositionBatchHidden()
        return
      }
      this.isBatching = true
      this.isBatchStart = true
      const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
      const students = await this.getClassroomStudents(params)
      const studentCount = students.length
      this.$refs.startAlert.classList.remove('on-random', 'on-onece')

      let checkDiff = false
      let activeCount = 0
      let activeCount2 = 0
      let seatCount = 0
      let list = []
      let isBatched = false
      let batchedCount = 0
      for(const seatSection of this.item.seatSections) {
        activeCount = activeCount + seatSection.seats.filter(v => v.isActive).length
        activeCount2 = activeCount2 + seatSection.seats.filter(v => v.isActive && v.student).length
        batchedCount = batchedCount + seatSection.seats.filter(v => v.student).length
        seatCount = seatCount + seatSection.seats.length
        // list.push(seatSection.seats.filter(v => v.isActive))
        list.push(seatSection.seats)
      }

      if(batchedCount > 0) isBatched = true
      if(studentCount < activeCount) checkDiff = true
      if(studentCount > seatCount) checkDiff = true
      if(studentCount === 0) checkDiff = true

      if (checkDiff) {
        this.isBatching = false
        this.isBatchStart = false
        return this.openConfirmModal(studentCount === 0 ? "studentNone" : "studentCount")
      }
      
      let ramainCount = studentCount - activeCount
      const seats = _.cloneDeep(list).reduce((acc, val) => acc.concat(val), [])
      let addStudents = _.cloneDeep(students)

      for(const seat of seats) {
        if(seat.student) {
          addStudents = addStudents.filter(v => v.studentId !== seat.student.studentId)
        }
      }
      if(ramainCount > 0) {
        if(isBatched) {
          let idx = 0
          for(const seats of list) {
            for(const seat of seats) {
              if(!seat.isActive && ramainCount !== 0) {
                seat.isActive = true
                seat.student = addStudents[idx]
                ramainCount--
                idx++
              }

              if(ramainCount === 0) break
            }
          }
        } else {
          for(const seats of list) {
            for(const seat of seats) {
              if(!seat.isActive && ramainCount !== 0) {
                seat.isActive = true
                ramainCount--
              }

              if(ramainCount === 0) break
            }
          }
        }
      }

      if(isBatched) {
        let activeNoneStudentCount = activeCount - activeCount2
        if(activeNoneStudentCount > 0) {
          let idx = 0
          let ramainCount = activeNoneStudentCount
          for(const seats of list) {
            for(const seat of seats) {
              if(seat.isActive && !seat.student) {
                seat.student = addStudents[idx]
                ramainCount--
                idx++
              }

              if(ramainCount === 0) break
            }
          }
        }
      }
    
      let studentSeats = []
      const availSeats = [].concat(...list).sort((a,b) => a.seatRow - b.seatRow)

      const buildSeat = (seatId, studentId, isFixed, isActive) => ({
          seatId, studentId, isFixed, isActive })
      const simpleMapping = (availSeats, students) => [
        ...availSeats.filter(v => v.isActive).map(({ seatId }, index) =>
            buildSeat(seatId, students[index].studentId, false, true)),
        ...availSeats.filter(v => !v.isActive).map(({ seatId }) =>
            buildSeat(seatId, null, false, false))
      ]

      let studentList = []
      let pairSeatList = []
      let pairSeatFixedSingleList = []
      let pairSeatFixedDoubleList = []
      let soloSeatList = []
      let soloSeatFixedList = []
      let studentPairList = []
      let studentSoloList = []

      const pairSeats = this.pairArray(_.cloneDeep(availSeats))
      const studentIdAt = (pairSeat, idx) => pairSeat[idx] && pairSeat[idx].student ? pairSeat[idx].student.studentId : null          
      const beforePairStudentList = pairSeats.map(pairSeat => ({
        studentId1: studentIdAt(pairSeat, 0),
        studentId2: studentIdAt(pairSeat, 1)
      }))
      const findBeforePairFor = ({studentId}) => beforePairStudentList.find(v => v.studentId1 === studentId || v.studentId2 === studentId);
      const findStudentNotInPair = ({students, pair, strict = false}) => students.find(s => ![pair.studentId1, pair.studentId2].includes(s.studentId)) || (strict ? null : students[0]);
      const popStudentFrom = ({students, student}) => {
        if (!student) return null;
        const idx = students.findIndex(v => v.studentId === student.studentId);
        return idx > -1 ? students.splice(idx, 1)[0] : null;
      }
      const popStudentFromNotInPair = ({students, pair}) => popStudentFrom({ students, student: findStudentNotInPair({ students, pair }) });
      const popStudentFromStudentList = student => popStudentFrom({ students: studentList, student });
      const popStudentFromStudentListNotInPair = pair => popStudentFromNotInPair({ students: studentList, pair });
      const flattenPairs = pairs => [].concat(...pairs);

      const buildReference = () => {
        studentList = availSeats.filter(s => s.student && !s.isFixed).map(
            s => _.cloneDeep(students.find(v => v.studentId === s.student.studentId)));

        flattenPairs(pairSeats).forEach(seat => seat.student = 
            seat.isFixed ? _.cloneDeep(students.find(v => v.studentId === seat.student.studentId)) : null)
        
        const activateCountOf = pairSeat => pairSeat.filter(v => v.isActive).length;
        const fixedCountOf = pairSeat => pairSeat.filter(v => v.isFixed).length;
        const duoActivated = pairSeat => activateCountOf(pairSeat) === 2;
        const soloActivated = pairSeat => activateCountOf(pairSeat) === 1;
        const allFixed = pairSeat => fixedCountOf(pairSeat) === 2;
        const oneFixed = pairSeat => fixedCountOf(pairSeat) === 1;
        const noFixed = pairSeat => fixedCountOf(pairSeat) === 0;
        const findActiveObj = pairSeat => pairSeat.find(v => v.isActive);
        pairSeatFixedDoubleList = pairSeats.filter(duoActivated).filter(allFixed);
        pairSeatFixedSingleList = pairSeats.filter(duoActivated).filter(oneFixed);
        pairSeatList = pairSeats.filter(duoActivated).filter(noFixed);
        soloSeatFixedList = pairSeats.filter(soloActivated).filter(oneFixed).map(findActiveObj);
        soloSeatList = pairSeats.filter(soloActivated).filter(noFixed).map(findActiveObj);
      }

      const sortStudentListByGenderOrder = order => studentList.sort(
        (a, b) => order.indexOf(a.studentGender || 'NONE') - order.indexOf(b.studentGender || 'NONE')
      )
      const GENDER_TYPES = ['MALE', 'FEMALE', 'NONE' ];
      const getGenderedList = gender => studentList.filter(student => (student.studentGender || 'NONE') === gender);
      const getOtherGenderedList = gender => studentList.filter(student => (student.studentGender || 'NONE') !== gender);

      const consistStudentPairAndSoloList = () => {
        pairSeatList = this.shuffleArray(pairSeatList)
        studentPairList.filter((_, i) => i < pairSeatList.length).forEach((pair, i) => {
          pairSeatList[i][0].student = pair[0].student
          pairSeatList[i][1].student = pair[1].student
        })
        studentPairList.filter((_, i) => i >= pairSeatList.length)
          .forEach(pair => studentSoloList = studentSoloList.concat(pair.map(({student}) => ({student}))))
      }
      const combineSeats = () => [
        ...flattenPairs(pairSeatFixedSingleList),
        ...flattenPairs(pairSeatFixedDoubleList),
        ...soloSeatFixedList,
        ...flattenPairs(pairSeatList).filter(v => v.student),
        ...flattenPairs(pairSeatList).filter(v => !v.student).map(seat => ({...seat, student: studentSoloList.shift().student})),
        ...soloSeatList.map(seat => ({ ...seat, student: seat.student || (studentSoloList.shift() || {}).student })),
        ...availSeats.filter(v => !v.isActive)
      ].map(item => ({...item, studentId: (item.student || {studentId: null}).studentId}))

      buildReference()
      if(!isBatched) studentList = [...students]
      this.shuffleArray(studentList)

      if(this.item.pairingType != "RANDOM" && students.some(v => !v.studentGender))
        this.genderToast();

      const partnerPicker = isBatched && this.item.avoidPreviousPartner
          ? (pair, studentGender) => {
            sortStudentListByStudent({studentGender})
            return popStudentFromStudentListNotInPair(pair)
          }
          : {
            RANDOM: () => studentList.shift(),
            GENDER_SAME: (_, gender) => popStudentFromStudentList(getGenderedList(gender)[0]),
            GENDER_DIFFERENT: (_, gender) => popStudentFromStudentList(getOtherGenderedList(gender)[0])
          }[this.item.pairingType];

      const sortStudentListByStudent = {
        RANDOM: () => {},
        GENDER_SAME: ({studentGender}) => sortStudentListByGenderOrder({
          MALE: ['MALE', 'NONE', 'FEMALE'],
          FEMALE: ['FEMALE', 'NONE', 'MALE'],
          NONE: ['NONE', 'MALE', 'FEMALE']
        }[studentGender || 'NONE']),
        GENDER_DIFFERENT: ({studentGender}) => sortStudentListByGenderOrder({
          MALE: ['FEMALE', 'NONE', 'MALE'],
          FEMALE: ['MALE', 'NONE', 'FEMALE'],
          NONE: ['MALE', 'FEMALE', 'NONE']
        }[studentGender || 'NONE']),
      }[this.item.pairingType]

      if(isBatched) {
        pairSeatFixedSingleList.forEach(pairSeatFixedSingle => {
          const student = pairSeatFixedSingle.find(v => v.isFixed).student
          sortStudentListByStudent(student)
          pairSeatFixedSingle.find(v => !v.isFixed).student = partnerPicker(pairSeatFixedSingle, student.studentGender)
        })
      }

      if(this.item.pairingType === "RANDOM" && isBatched) {
        studentList.length % 2 === 1 && studentSoloList.push({ student: studentList.pop() });

        while(studentList.length > 0) {
          const student = studentList.shift()
          studentPairList.push([ { student }, { student: partnerPicker(findBeforePairFor(student)) } ])
        }
        consistStudentPairAndSoloList()
      } else if(this.item.pairingType === "GENDER_SAME") {
        GENDER_TYPES.forEach(gender => {
          const getList = () => getGenderedList(gender)
          getList().length % 2 === 1 && studentSoloList.push({ student: popStudentFromStudentList(getList().pop()) });
          while (getList().length > 0) {
            const student = popStudentFromStudentList(getList()[0]);
            studentPairList.push([
              { student },
              { student: partnerPicker(isBatched ? findBeforePairFor(student) : null, gender) }
            ]);
          }
        })
        
        consistStudentPairAndSoloList()
        studentSoloList.sort((a,b) => a.studentGender - b.studentGender)
      } else if(this.item.pairingType === "GENDER_DIFFERENT") {   // 이성
        const buildStandardAndMixedList = () => {
          const [ms, fs, ns] = ["MALE", "FEMALE", "NONE"].map(g => getGenderedList(g))
          return ms.length > 0 && fs.length > 0
          ? { standardList: ms, mixList: this.shuffleArray(fs.concat(ns)) }
          : { standardList: ms.concat(fs), mixList: this.shuffleArray(ns) }
        }
        const { standardList, mixList } = buildStandardAndMixedList()
        const partnerPickerUsingStandard = isBatched && this.item.avoidPreviousPartner
            ? pair => popStudentFrom({
                students: mixList,
                student: findStudentNotInPair({ students: mixList, pair, strict: true }) })
            : _ => mixList.shift();

        while(standardList.length > 0) {
          const student = standardList[0]
          const partner = partnerPickerUsingStandard(findBeforePairFor(student))
          if(!partner) break
          studentPairList.push([ { student: standardList.shift() }, { student: partner } ])
        }

        studentSoloList = [...standardList.map(student => ({student})), ...mixList.map(student => ({student}))];
        consistStudentPairAndSoloList();
        (soloSeatList[0] || {}).student = studentSoloList.length % 2 === 1 ? studentSoloList.pop().student : null;

        if(isBatched && this.item.avoidPreviousPartner) {
          const remainSoloStudents = studentSoloList.map(({student}) => student)
          pairSeatList.filter(pairSeat => !pairSeat[0].student)
            .filter((_, i) => i < remainSoloStudents.length / 2)
            .forEach(pairSeat => {
              pairSeat[0].student = remainSoloStudents.shift()
              pairSeat[1].student = popStudentFromNotInPair({
                                      students: remainSoloStudents,
                                      pair: findBeforePairFor(pairSeat[0].student) })
            })
        }
      }
      studentSeats = this.item.pairingType === "RANDOM" && !isBatched
        ? simpleMapping(availSeats, studentList)
        : combineSeats()

      await this.patchStudentSeat({
        classroomId: this.classroomId,
        seatPlanId: this.item.seatPlanId,
        version: this.item.version,
        studentSeats
      })
      /* 반환값 받음 */ 
      this.item = _.cloneDeep(await this.getDetailItem())

      const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay))
      await wait(1)

      //자동자리배치 모드에 따른 초기 애니메이션 팝업 class 설정
      this.$refs.startAlert.classList.add(this.item.viewMode === 'SINGLE_VIEW' ? 'on-random' : 'on-onece');
      const elements = Array.from(document.querySelectorAll('.info'));
      elements.forEach((element) => element.classList.add('none-view'));

      if (this.item.viewMode === 'SINGLE_VIEW') {
        elements.sort(() => Math.random() - 0.5);
      }

      let soundStart = ""
      let sound = ""
      if(this.item.viewMode === 'SINGLE_VIEW') {
        soundStart = this.batchSoundSingleStartview
        sound = this.batchSoundSingleView
      } else {
        soundStart = this.batchSoundFullStartview
        sound = this.batchSoundFullview
      }

      const audioContainer = this.$refs.giveBatchSound
      const source = this.$refs.giveBatchSoundSource
      source.src = soundStart
      audioContainer.load()
      audioContainer.volume = 1
      audioContainer.play()

      setTimeout(
        () => {
          elements.forEach((element, index) => {
            setTimeout(
              () => {
                element.classList.remove('none-view');
                element.classList.add('active-view');
                setTimeout(
                  () => {
                    element.classList.remove('active-view');
                    if(index === (elements.length-1)) {
                      this.isBatching = false
                      this.setChecked()
                    }
                  },
                  300
                );
              },
              this.item.viewMode === 'SINGLE_VIEW' ? index * 200 : 0
            );
          });
          this.isBatchStart = false

          const audioContainer = this.$refs.giveBatchSound
          const source = this.$refs.giveBatchSoundSource
          source.src = sound
          audioContainer.load()
          audioContainer.volume = 1
          audioContainer.play()
        },
        this.item.viewMode === 'SINGLE_VIEW' ? 1100 : 3000
      );
    },
    genderToast() {      
      setTimeout(() => {
        this.toastMessageModal.open = false
        this.toastMessageModal.message = null
        this.toastMessageModal.bottom = null
        
        this.toastMessageModal.open = true
        this.toastMessageModal.message = "성별 정보가 없는 학생은 랜덤으로 자리배치됩니다."
        this.toastMessageModal.bottom = 88

        setTimeout(() => {
          this.toastMessageModal.open = false
          this.toastMessageModal.message = null
          this.toastMessageModal.bottom = null
        }, 1300);

      }, this.item.viewMode === 'SINGLE_VIEW' ? 1500 : 3000);  
    },
    actionStudentCount() {
      this.$emit("reBatchChangeSutdent")
    },
    actionstudentNone() {
      this.$router.push(`/behavior-records/${this.classroomId}/classrooms/manageStudents`)
    },
    setHidden() {
      for(const seatSection of this.item.seatSections) {
        for(const seat of seatSection.seats) {
          seat.student = null
        }
      }
    },
    async autoPositionBatchHidden() {
      this.isBatching = true
      this.isBatchStart = true
      const hiddenParams = {
        classroomId: this.classroomId,
        seatPlanId: this.item.seatPlanId,
        version: this.item.version,
        isStudentHidden: false
      }
      const hiddenRes = await this.patchStudentHidden(hiddenParams)
      if(hiddenRes.status === 428) {
        if(hiddenRes.data.error === "SeatPlanNotFound") {
          this.$hiClass.alert('자리배치를 찾을 수 없습니다.', 'error')
        } else if(hiddenRes.data.error === "NotClassroomOwner") {
          this.$hiClass.alert('클래스의 주인이 아닙니다.', 'error')
        }

        return
      }

      const res = await this.getDetailItem()

      this.item = _.cloneDeep(res)

      const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay))
      await wait(1)

      //자동자리배치 모드에 따른 초기 애니메이션 팝업 class 설정
      this.$refs.startAlert.classList.add(this.item.viewMode === 'SINGLE_VIEW' ? 'on-random' : 'on-onece');
      const elements = Array.from(document.querySelectorAll('.info'));
      elements.forEach((element) => element.classList.add('none-view'));

      if (this.item.viewMode === 'SINGLE_VIEW') {
        elements.sort(() => Math.random() - 0.5);
      }

      let soundStart = ""
      let sound = ""
      if(this.item.viewMode === 'SINGLE_VIEW') {
        soundStart = this.batchSoundSingleStartview
        sound = this.batchSoundSingleView
      } else {
        soundStart = this.batchSoundFullStartview
        sound = this.batchSoundFullview
      }

      const audioContainer = this.$refs.giveBatchSound
      const source = this.$refs.giveBatchSoundSource
      source.src = soundStart
      audioContainer.load()
      audioContainer.volume = 1
      audioContainer.play()

      setTimeout(
        () => {
          elements.forEach((element, index) => {
            setTimeout(
              () => {
                element.classList.remove('none-view');
                element.classList.add('active-view');
                setTimeout(
                  () => {
                    element.classList.remove('active-view');
                    if(index === (elements.length-1)) {
                      this.isBatching = false
                      this.setChecked()
                    }
                  },
                  300
                );
              },
              this.item.viewMode === 'SINGLE_VIEW' ? index * 100 : 0
            );
          });
          this.isBatchStart = false

          const audioContainer = this.$refs.giveBatchSound
          const source = this.$refs.giveBatchSoundSource
          source.src = sound
          audioContainer.load()
          audioContainer.volume = 1
          audioContainer.play()
        },
        this.item.viewMode === 'SINGLE_VIEW' ? 1100 : 3000
      );

      
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 배열 요소를 교환합니다.
      }
      return array;
    },
    pairArray(array) {
        const result = [];
        for (let i = 0; i < array.length; i += 2) {
            result.push(array.slice(i, i + 2));
        }
        return result;
    },
    viewSizing() {
      const std = this.studentCountInSection;  // 한 모둠의 학생수 
      const group = this.item.sectionCount;  // 모둠 갯수
      const maxGroup = (std < 5 && group >= 10) || (std > 4 && group >= 7);        

      this.addEaClassName = "";
      if (std < 5 && group > 6) {
          this.addEaClassName = "ea4max";
      } else if (std > 4 && group > 3) {
          this.addEaClassName = "ea6max";
      }

      // Vue가 DOM 업데이트를 완료한 후 실행
      this.$nextTick(() => {
        const planTypeEl = this.$refs.planType;
        const planTypeInnerEl = this.$refs.planTypeInner;
        
        //초기화
        let zoom = 1;
        planTypeInnerEl.style.zoom = zoom;
        planTypeEl.classList.remove('group-max');

        const height = planTypeEl.clientHeight;
        const conHeight = planTypeInnerEl.clientHeight;
        const width = planTypeEl.clientWidth;
        const conWidth = planTypeInnerEl.clientWidth;

        if (maxGroup) {
            planTypeEl.classList.add('group-max');
            zoom = width / conWidth;
        } else {
            if (width / conWidth >= height / conHeight) {
                zoom = height / conHeight;
            } else {
                zoom = width / conWidth;
            }
        }

        if (zoom > 1) {
            zoom = 1;
        }
        planTypeInnerEl.style.zoom = zoom;
      });
    },
    // iPad를 감지
    isiPad() {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
    },
    // 칠판 상하전환
    viewRotate(){
      const planTypeEl = this.$refs.planType;     
      const planTypeInnerEl = this.$refs.planTypeInner;     
      planTypeEl.classList.toggle('rotate');
      planTypeInnerEl.style.transition = "1s";
      planTypeEl.scrollTop = planTypeEl.scrollHeight;
      setTimeout(() => {
        planTypeInnerEl.style.transition = "none";
      }, 1000)
      const isContain = planTypeEl.classList.contains('rotate');       
      let list = []
      const seatPlanRoates = JSON.parse(localStorage.getItem("seatPlanRoates"))
      if(isContain) {
        if(seatPlanRoates) {
          list = [
            ...seatPlanRoates,
            {
              seatPlanId: this.item.seatPlanId
            }
          ]
        } else {
          list = [{
            seatPlanId: this.item.seatPlanId
          }]
        }
        localStorage.setItem('seatPlanRoates', JSON.stringify(list))
      } else {
        if(seatPlanRoates) {
          list = seatPlanRoates.filter(v => v.seatPlanId !== this.item.seatPlanId)
        }
        localStorage.setItem('seatPlanRoates', JSON.stringify(list))
      }
    },
    sectionNameEdit(sectionId, e){
      e.stopPropagation()
      this.sectionNameEditId = this.sectionNameEditId === sectionId ? null : sectionId;
      this.$nextTick(() => {
        this.$refs[sectionId][0].focus();
      });
    },    
    limitLengthSectionName(item) {
      if (item.sectionName.length > 10) {
        item.sectionName = item.sectionName.substring(0, 10);
        return
      }
    },
    inputSectionName(e, item) {
      e.target.value = e.target.value.replace(/\s+/g, '').trim()
      e.target.value = e.target.value.substr(0, 10)
      if(e.target.value) item.sectionName = e.target.value
    },
    async saveSectionName(item, e) {
      this.inputSectionName(event, item);
      e.stopPropagation()
      if(!item.sectionName) {
        this.sectionNameEditId = null
        return
      }
      try {
        // 서버로 전송할 데이터 구성
        const res = await this.$axios({
          method: 'PATCH',
          url: `/classroom/${this.classroomId}/seatPlan/${this.item.seatPlanId}/section/${item.sectionId}/rename`,
          params: {
            version: this.item.version
          },
          data: {
            sectionName : item.sectionName
            }
        })
        this.sectionNameEditId = null
        this.isNameEditing = true
      } catch (err) {
        console.error('Failed to update section name:', err);
      }
    },
    async isSeatFixed(seat, e){
      e.stopPropagation()
      seat.isFixed = !seat.isFixed

      this.toastMessageModal.open = false
      this.toastMessageModal.message = null
      this.toastMessageModal.bottom = null

      if(this.timer) {
        clearTimeout(this.timer)
      }
      try {
          const res = await this.$axios({
          method: 'PATCH',
          url: `/classroom/${this.classroomId}/seatPlan/${this.item.seatPlanId}/students/fix`,
          params: {
            version: this.item.version
          },
          data: {
            seatId : seat.seatId,
            isFixed : seat.isFixed
          }
        })

        if(seat.isFixed) {
          this.toastMessageModal.open = true
          this.toastMessageModal.message = "고정되었습니다."
          this.toastMessageModal.bottom = 88
        } else {
          this.toastMessageModal.open = true
          this.toastMessageModal.message = "고정 해제되었습니다."
          this.toastMessageModal.bottom = 88
        }

        this.timer = setTimeout(() => {
          this.toastMessageModal.open = false
          this.toastMessageModal.message = null
          this.toastMessageModal.bottom = null
        }, 1300);
      } catch (err) {
        console.error('Failed to update section name:', err);
      }
    },
    focusOutsectionName() {
      this.sectionNameEditId = null
    },
    onClickSeatPrint(){
      const ele = this.$refs.planType
      this.htmlPrint.content = ele.cloneNode(true)
      this.htmlPrint.isOpen = true      
    },
    setRoate() {
      const seatPlanRoates = JSON.parse(localStorage.getItem("seatPlanRoates"))
      
      if(seatPlanRoates) {
        const idx = seatPlanRoates.findIndex(v => v.seatPlanId === this.item.seatPlanId)
        if(idx > -1) {
          const planTypeEl = this.$refs.planType;  
          planTypeEl.classList.add('rotate');
          planTypeEl.scrollTop = planTypeEl.scrollHeight;
        } else {
          const planTypeEl = this.$refs.planType;  
          planTypeEl.classList.remove('rotate');          
          planTypeEl.scrollTop = 0;
        }
      }
    },
    openConfirmModal: function(action) {
      this.confirmModal = {...this.confirmModal, action}

      switch(action) {
          case 'studentCount' :
              this.confirmModal.title = '학생 수가 변경되었습니다.<br/>대형을 다시 생성해주세요.'
              this.confirmModal.confirmButtonText = '확인'
              this.confirmModal.confirmButtonColor = '#ff8737'
              this.confirmModal.isAlert = true
          break;

          case 'studentNone' :
              this.confirmModal.title = '등록된 학생 명단이 없습니다.<br/>명단을 추가해주세요.'
              this.confirmModal.confirmButtonText = '확인'
              this.confirmModal.confirmButtonColor = '#ff8737'
              this.confirmModal.isAlert = true
          break;
      }
      this.confirmModal = {...this.confirmModal, isOpen: true}
    },
    closeConfirmModal: async function(isConfirm) {
      this.isSubmitClick = false
      if(!isConfirm) {
          this.confirmModal = {
              isOpen: false,
              title: '',
              description: '',
              confirmButtonText: '',
              confirmButtonColor: '',
              action: '',
              isAlert: false
          }
          return
      }

      switch(this.confirmModal.action) {
          case 'studentCount' :
              this.actionStudentCount()
          break;

          case 'studentNone' :
              this.actionstudentNone()
          break;
      }

      this.confirmModal = {
          isOpen: false,
          title: '',
          description: '',
          confirmButtonText: '',
          confirmButtonColor: '',
          action: '',
          isAlert: false
      }
    },
    isSeatTotalChecked(item) {
      let isCheck = false

      const activeLength = item.seats.filter(v => v.isActive && v.student).length
      const checkedLength = item.seats.filter(v => v.checked && v.student).length

      if(activeLength > 0 ) {
        if(activeLength === checkedLength) {
          isCheck = true
        } else {
          isCheck = false
        }
      } else {
        isCheck = false
      }

      return isCheck
    },
    seatTotalChecked(item) {
      if(this.sectionNameEditId === item.sectionId) return
      if(this.isNameEditing) {
        this.isNameEditing = false
        return
      }
      const isTotalCheck = this.isSeatTotalChecked(item)
      if(isTotalCheck) {
        for(const seat of item.seats) {
          if(seat.isActive && seat.student) {
            seat.checked = false
          }
        }
      } else {
        for(const seat of item.seats) {
          if(seat.isActive && seat.student) {
            seat.checked = true
          }
        }
      }
      this.$emit("studentCheck")
    },
    studentCheck(seat, e) {
      e.stopPropagation()
      e.preventDefault()
      if(seat.student) {
        seat.checked = !seat.checked
      }
      this.$emit("studentCheck")
    },
    getTargetStudents() {
      let list = []

      for(const seatSection of this.item.seatSections) {
        list = [
          ...list,
          ...seatSection.seats.filter(v => v.checked && v.student)
        ]
      }

      list = list.map(item => item.student)

      return list
    },
    setChecked() {
      const list = this.item.seatSections.map(item => {
        return {
          ...item, 
          seats: item.seats.map(item2 => {
            return {
              ...item2,
              checked: false
            }
          })
        }
      })
      this.item.seatSections = list
      this.$emit("studentCheck")
    },
    setCheckedChange() {
      const list = this.item.seatSections.map(item => {
        return {
          ...item, 
          seats: item.seats.map(item2 => {
            return {
              ...item2,
              checked: item2.isActive && item2.student ? item2.checked ? false : true : false
            }
          })
        }
      })
      this.item.seatSections = list
      this.$emit("studentCheck")
    },
    setCheckedTotal() {
      const list = this.item.seatSections.map(item => {
        return {
          ...item, 
          seats: item.seats.map(item2 => {
            return {
              ...item2,
              checked: item2.isActive && item2.student ? true : false
            }
          })
        }
      })
      this.item.seatSections = list
      this.$emit("studentCheck")
    },
    givePointFiish(newPointStudents) {
      const list = this.item.seatSections.map(item => {
        return {
          ...item, 
          seats: item.seats.map(item2 => {
            if(item2.student) {
              const obj = newPointStudents.find(v => v.studentId === item2.student.studentId)
              if(obj) {
                item2.student.point = obj.point
              }
            }

            return item2
          })
        }
      })
      this.item.seatSections = list
    },
    resetPointFiish(newPointStudents) {
      const list = this.item.seatSections.map(item => {
        return {
          ...item, 
          seats: item.seats.map(item2 => {
            if(item2.student) {
              const index = newPointStudents.findIndex(v => v === item2.student.studentId)
              if(index > -1) {
                item2.student.point = 0
              }
            }

            return item2
          })
        }
      })
      this.item.seatSections = list
    },    
    isAvailStudentCheck(item) {
      if(this.isBatchStart || this.isBatching) return false

      let isAvailCheck = false
      for(const seat of item.seats) {
        if(seat.student) isAvailCheck = true
      }
      return isAvailCheck
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
    resetAnimationClass: function(id) {
      return this.resetStudentsIds.includes(id)
    },
    isStudentActiveCount() {
      let check = false
        
      for(const seatSection of this.item.seatSections) {
        for(const seat of seatSection.seats) {
          if(seat.student) {
            check = true
            break
          }
        }
      }

      return check
    },
    initDetailClass: async function() {
      await this.getDetailClass({classroomId: this.classroomId})
    },
  },
  created() {
  },
  mounted() {
    this.item = _.cloneDeep(this.detail)
    this.initDetailClass()
    // if(this.isHidden) this.setHidden()
    this.setChecked()
    const seatPlanGroup = this

    if (this.isiPad()) {
      document.body.classList.add('ios');
    }

    window.addEventListener(`resize`, function () {
        seatPlanGroup.viewSizing();
    })

    this.$nextTick(() => {
      this.viewSizing()
      this.setRoate()
    })
  },
  updated() {
    // this.$nextTick(() => {
    //     console.log("updated group viewSizing!!")
    //     this.viewSizing()
    // })
  },
}
</script>

<style lang="scss" scoped>
  .ios {
    .seating-plan-view {
      .plan-info {
        .plan-name {
          font-size: 14px;
        }
        .plan-name-edit {
          input {
            font-size: 14px;
          }
        }
      }
    }
  }
</style>