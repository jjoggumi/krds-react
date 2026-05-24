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
      <ul class="free-type">
        <li v-for="item of item.seatSections" :key="`seat-sections-${item.sectionId}`">
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
                  'none-views': isAvailStudentCheck(seat.student),
                  'bg-trans' : !isBatchStart && seat.student ? getStudentNew(seat.student) || resetAnimationClass(seat.student.studentId) : null,
                  'no-profile': !showProfileImage || !(seat.student && seat.student.character)
                }"
                @click="studentCheck(seat, $event)"
              >
                <template v-if="!isBatchStart">
                  <template v-if="seat.student">
                    <span class="num">{{ seat.student.studentNo }}</span>
                    <div
                      v-if="showProfileImage"
                      class="profile"
                      :checked="seat.checked"
                      :class="{
                        'good-bg': givePointMode === 'good' && getStudentNew(seat.student),
                        'bad-bg':  givePointMode === 'effort' && getStudentNew(seat.student),
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
              <button type="button" class="fixed-icon" v-if="seat.student && !isSelectionMode && !seat.checked" @click="isSeatFixed(seat)"></button>
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
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
import {mapFields} from "vuex-map-fields";
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import SeatPlansMixin from "@/apps/behavior/mixins/SeatPlansMixin.vue";

export default {
  name: 'seat-plans-free',
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
        isBatching: false,
        isBatchStart: false,
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
      detailClass: 'detailClass'
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
    item: {
      handler() {
        this.updateNumbering()
      },
      deep: true
    },
    detail(v) {
      this.item = _.cloneDeep(v)
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
      getDetailClass: 'getDetailClass',
    }),
    updateNumbering() {
      this.$nextTick(() => {
        const planStudents = this.$el.querySelectorAll('.seating-plan-view .free-type .plan-student li')
        const totalRows = 7  // 세로 줄 수
        const totalCols = 8  // 가로 칸 수

        planStudents.forEach((li, idx) => {
          const columnIndex = idx % totalCols   // 0~7
          const rowIndex = Math.floor(idx / totalCols) // 0~6

          if (columnIndex === 0) {
            // 앞쪽 첫 번째 열: 1~7
            const number = rowIndex + 1
            li.setAttribute('data-number', number.toString())
          } else if (columnIndex === totalCols - 1) {
            // 뒷쪽 마지막 열: 1~7
            const number = rowIndex + 1
            li.setAttribute('data-number', number.toString())
          } else {
            li.removeAttribute('data-number')
          }
        })
      })
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
      this.isBatchStart = true
      const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
      const students = await this.getClassroomStudents(params)
      const studentCount = students.length
      this.$refs.startAlert.classList.remove('on-random', 'on-onece')

      let checkDiff = false
      let activeCount = 0
      let seatCount = 0
      let list = []
      let isBatched = false
      let batchedCount = 0
      for(const seatSection of this.item.seatSections) {
        activeCount = activeCount + seatSection.seats.filter(v => v.isActive).length
        batchedCount = batchedCount + seatSection.seats.filter(v => v.student).length
        seatCount = seatCount + seatSection.seats.length
        // list.push(seatSection.seats.filter(v => v.isActive))
        list.push(seatSection.seats)
      }

      if(batchedCount > 0) isBatched = true
      // if(activeCount > studentCount) checkDiff = true
      
      if(studentCount === 0) checkDiff = true

      // if(!isBatched && activeCount !== studentCount) checkDiff = true

      if(!checkDiff) {
        let ramainCount = studentCount - activeCount
        if(ramainCount > 0) {
          if(isBatched) {
            const seats = _.cloneDeep(list).reduce((acc, val) => acc.concat(val), [])
            let addStudents = _.cloneDeep(students)

            for(const seat of seats) {
              if(seat.student) {
                addStudents = addStudents.filter(v => v.studentId !== seat.student.studentId)
              }
            }

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
      }

      if(!checkDiff) {
        let studentSeats = []
        this.shuffleArray(students)
        const availSeats = list.reduce((acc, val) => acc.concat(val), [])
        
        if(isBatched) {
          let studentList = _.cloneDeep(students)
          let seatList = []
          let fixedSeatList = []
          const activeSeats = availSeats.filter(v => v.isActive)

          for(const activeSeat of activeSeats) {
            if(activeSeat.isFixed) {
              studentList = studentList.filter(v => v.studentId !== activeSeat.student.studentId)
              fixedSeatList.push(activeSeat)
            } else {
              seatList.push(activeSeat)
            }
          }

          this.shuffleArray(seatList)
          let idx = 0
          for(const seat of seatList) {
            seat.student = _.cloneDeep(studentList[idx])
            idx++
          }

          const noActiveSeats = availSeats.filter(v => !v.isActive)
          studentSeats = [
            ...fixedSeatList,
            ...seatList,
            ...noActiveSeats
          ]

          studentSeats = studentSeats.map(item => {
            return {
              seatId: item.seatId,
              studentId: item.student ? item.student.studentId : null,
              isFixed: item.isFixed,
              isActive: item.isActive
            }
          })
        } else {
          let seatList = _.cloneDeep(availSeats.filter(v => v.isActive))
          this.shuffleArray(seatList)
          this.shuffleArray(students)
          const activeSeats = seatList.map((item, index) => {
            return {
              seatId: item.seatId,
              studentId: students[index] ? students[index].studentId : null,
              isFixed: false,
              isActive: true
            }
          })

          const noActiveSeats = availSeats.filter(v => !v.isActive).map(item => {
            return {
              seatId: item.seatId,
              studentId: null,
              isFixed: false,
              isActive: false
            }
          })

          studentSeats = [
            ...activeSeats,
            ...noActiveSeats
          ]
        }
        
        const params = {
          classroomId: this.classroomId,
          seatPlanId: this.item.seatPlanId,
          version: this.item.version,
          studentSeats: studentSeats
        }
        await this.patchStudentSeat(params)
        /* 반환값 받음 */ 
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
      } else if(studentCount === 0) {
        this.isBatchStart = false
        this.isBatching = false
        // this.$hiClass.alert("등록된 학생 명단이 없습니다.<br/>명단을 추가해주세요.").then(() => {
        //   this.$router.push(`/behavior-records/${this.classroomId}/classrooms/manageStudents`)
        // })
        this.openConfirmModal("studentNone")
      } else {
        this.isBatchStart = false
        this.isBatching = false
        // this.$hiClass.alert("학생 수가 변경되었습니다.<br/>대형을 다시 생성해주세요.").then(() => {
        //   this.$emit("reBatchChangeSutdent")
        // })
        this.openConfirmModal("studentCount")
      }
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
      this.isBatchStart = true
      this.isBatching = true
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
    viewSizing() {
      const planTypeEl = this.$refs.planType;
      const planTypeInnerEl = this.$refs.planTypeInner;
      
      //초기화
      let zoom = 1;
      planTypeInnerEl.style.zoom = zoom;

      const height = planTypeEl.clientHeight;
      const conHeight = planTypeInnerEl.clientHeight;
      const width = planTypeEl.clientWidth;
      const conWidth = planTypeInnerEl.clientWidth;

      if (width / conWidth >= height / conHeight) {
        zoom = height / conHeight;
      } else {
        zoom = width / conWidth;
      }
      if (zoom > 1) {
          zoom = 1;
      }
      planTypeInnerEl.style.zoom = zoom;
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
    async isSeatFixed(seat){
      seat.isFixed = !seat.isFixed;
      
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
        } else {
          const planTypeEl = this.$refs.planType;  
          planTypeEl.classList.remove('rotate');
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

      const idx = item.seats.findIndex(v => !v.checked && v.isActive)
      isCheck = idx > -1 ? false : true

      return isCheck
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
              checked: item2.checked ? false : true
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
              checked: true
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
    isAvailStudentCheck(student) {
      if(this.isBatchStart || this.isBatching) return false
      
      let isAvailCheck = false
      
      if(!student) isAvailCheck = true

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
    this.updateNumbering()
    this.item = _.cloneDeep(this.detail)
    this.initDetailClass()
    this.setRoate()
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
  .seating-plan-view .plan-student {
    padding: 8px;
    gap: 5px;
  }
</style>