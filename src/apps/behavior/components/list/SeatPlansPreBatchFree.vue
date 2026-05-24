<template>
  <div class="plan-type" ref="planType">
    <div class="plan-type-inner" ref="planTypeInner">
        <ul class="free-type">
            <li v-for="item of item.seatSections" :key="`seat-sections-${item.sectionId}`">
                <ul class="plan-student">
                    <li v-for="(seat, index) of item.seats" :key="`seat-${seat.seatId}-${seat.student ? seat.student.studentId : getSeatKey(index)}`"
                      :class="{
                        fixed: seat.isFixed
                      }"
                    >
                        <button type="button" class="info"
                          :class="{
                            disabled: !seat.isActive,
                            noneInfo : !seat.student,
                            'no-profile': !showProfileImage || !(seat.student)
                          }"                         
                          @click="!seat.isFixed ? onClickInfo($event, seat) : seatFixedMsg()"
                        >
                          <template v-if="seat.student">
                            <span class="num teacher">{{ seat.student.studentNo }}</span>
                            <div
                              v-if="showProfileImage"
                              class="profile"
                            >
                              <div :class="getProfileImageClass(seat.student)">
                                <img
                                    :src="getProfileImage(seat.student)"
                                    alt="썸네일"
                                    @load="onProfileImageLoad(seat.student.studentId, $event)"
                                />
                              </div>
                            </div>
                            <p class="name teacher" v-if="seat.student">
                              {{ seat.student.studentName }}
                            </p>
                          </template>
                        </button>
                        <button type="button" class="hold-icon icon-unlock-fill" @click="onActive(seat)"></button>
                        <button type="button" class="fixed-icon" v-if="seat.isActive" @click="onUnFixed(seat)"></button>
                    </li>
                </ul>
            </li>
        </ul>
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
  </div>
</template>

<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
import SeatPlansMixin from "@/apps/behavior/mixins/SeatPlansMixin.vue";

export default {
    name: 'seat-plans-pre-batch-free',
    props: {
      detail: Object,
      studentCount: Number
    },
    components: {
        ConfirmModal,
        ToastType01
    },
    mixins: [SeatPlansMixin],
    data() {
        return {
            addEaClassName: "",
            item: {},
            studentSeats: [],
            changes: [],
            isChange: false,
            confirmModal: {
                isOpen: false,
                title: '',
                description: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                cancelButtonText: '',
                action: ''
            },
            confirmTargetItem: {},
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
            }
        }
    },
    computed: {
      ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
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
      isActiveCount() {
        let count = 0

        for(const seatSection of this.item.seatSections) {
          for(const seat of seatSection.seats) {
            if(seat.isActive) count++
          }
        }

        return count
      }
    },
    watch: {
        detail(v) {
            this.item = _.cloneDeep(v)
            this.oriItem = _.cloneDeep(this.detail)
            this.setRoate()
            this.setBatch()
            this.$nextTick(() => {
                this.viewSizing()
            })
        }
    },
    methods: {
        ...mapActions('storeBehavior', {
            getClassroomStudents: 'getClassroomStudents',
            patchStudentSeat: 'patchStudentSeat',
            patchStudentHidden: 'patchStudentHidden',
            resetSeatPlan: 'resetSeatPlan'
        }),
        async setBatch() {
          const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
          const students = await this.getClassroomStudents(params)
          // const studentCount = students.length

          //let activeCount = 0
          let list = []
          let isBatched = false
          let batchedCount = 0
          for(const seatSection of this.item.seatSections) {
              //activeCount = activeCount + seatSection.seats.filter(v => v.isActive).length
              batchedCount = batchedCount + seatSection.seats.filter(v => v.student).length
              list.push(seatSection.seats.filter(v => v.isActive))
              // list.push(seatSection.seats)
          }

          if(batchedCount > 0) isBatched = true
          
          // 배치된 학생이 없을때 학생을 순서대로 넣어준다
          if(!isBatched) {
              const flattenedArray = list.reduce((acc, val) => acc.concat(val), [])
              const availSeats = flattenedArray.sort((a,b) => a.seatRow - b.seatRow)
              
              for(let i = 0;i<availSeats.length;i++) {
                  availSeats[i].student = this.convertSeatStudent(students[i]);
              }
          }
        },
        async randomPositionBatch() {
          this.isChange = false
          this.changes = []
          
          // if(this.isActiveCount < 56) {
          //   if(this.isActiveCount < this.studentCount) {
          //     this.toastMessageModal.open = false
          //     this.toastMessageModal.message = null
          //     this.toastMessageModal.bottom = null

          //     this.toastMessageModal.open = true
          //     this.toastMessageModal.message = "선택한 자리가 학생수보다 적습니다. 다시 선택하세요."
          //     this.toastMessageModal.bottom = 88

          //     setTimeout(() => {
          //       this.toastMessageModal.open = false
          //       this.toastMessageModal.message = null
          //       this.toastMessageModal.bottom = null
          //     }, 1300);
          //     return
          //   }
          // }
          const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
          const students = await this.getClassroomStudents(params)
          
          let list = []
          for(const seatSection of this.item.seatSections) {
              list.push(seatSection.seats)
          }
          let studentSeats = []
          const flattenedArray = list.reduce((acc, val) => acc.concat(val), [])
          const availSeats = flattenedArray.sort((a,b) => a.seatRow - b.seatRow)

          this.shuffleArray(students)

          let studentList = _.cloneDeep(students).map(student => this.convertSeatStudent(student))
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
          let activeStudentList = []
          for(const seat of seatList) {
            seat.student = _.cloneDeep(studentList[idx])
            activeStudentList.push(studentList[idx])
            idx++
          }

          const addStudents = studentList.filter(v => activeStudentList.findIndex(v2 => v.studentId === v2.studentId) === -1)
          const noneActiveSeats = availSeats.filter(v => !v.isActive)
          let idx2 = 0
          let ramainCount = addStudents.length
          for(const noneActiveSeat of noneActiveSeats) {
            if(!noneActiveSeat.isActive && ramainCount !== 0) {
              noneActiveSeat.isActive = true
              noneActiveSeat.student = addStudents[idx2]
              ramainCount--
              idx2++
            }

            if(ramainCount === 0) break
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
              isActive: item.isActive,
            }
          })

          this.studentSeats = [...studentSeats]
        },
        async preBatchFinish() {
          let oriList = []
          for(const seatSection of this.oriItem.seatSections) {
            for(const seat of seatSection.seats) {
              oriList.push(seat)
            }
          }
          if(this.isActiveCount < 56) {
            if(this.isActiveCount < this.studentCount) {
              this.toastMessageModal.open = false
              this.toastMessageModal.message = null
              this.toastMessageModal.bottom = null

              this.toastMessageModal.open = true
              this.toastMessageModal.message = "선택한 자리가 학생수보다 적습니다. 다시 선택하세요."
              this.toastMessageModal.bottom = 88

              setTimeout(() => {
                this.toastMessageModal.open = false
                this.toastMessageModal.message = null
                this.toastMessageModal.bottom = null
              }, 1300);
              return
            }
          }

          let isChange = false
          let list = []

          if(this.studentSeats.length > 0) {
            // list = this.studentSeats
            for(const seatSection of this.item.seatSections) {
              for(const seat of seatSection.seats) {
                list.push({
                  seatId: seat.seatId,
                  studentId: seat.student ? seat.student.studentId : null,
                  isFixed: seat.isFixed,
                  isActive: seat.isActive
                })

                const checkObj = oriList.find(v => v.seatId === seat.seatId)
                if(seat.student && !checkObj.student) {
                  isChange = true
                } 
                if(!seat.student && checkObj.student) {
                  isChange = true
                }
                
                if(seat.student && checkObj.student) {
                  if(seat.student.studentId !== checkObj.student.studentId) {
                    isChange = true
                  }
                }
                
                if(seat.isActive !== checkObj.isActive) {
                  isChange = true
                }
                
                if(seat.isFixed !== checkObj.isFixed) {
                  isChange = true
                }
              }
            }
          } else {
            for(const seatSection of this.item.seatSections) {
              for(const seat of seatSection.seats) {
                list.push({
                  seatId: seat.seatId,
                  studentId: seat.student ? seat.student.studentId : null,
                  isFixed: seat.isFixed,
                  isActive: seat.isActive
                })

                const checkObj = oriList.find(v => v.seatId === seat.seatId)
                if(seat.student && !checkObj.student) {
                  isChange = true
                } 
                if(!seat.student && checkObj.student) {
                  isChange = true
                }
                
                if(seat.student && checkObj.student) {
                  if(seat.student.studentId !== checkObj.student.studentId) {
                    isChange = true
                  }
                }
                
                if(seat.isActive !== checkObj.isActive) {
                  isChange = true
                }
                
                if(seat.isFixed !== checkObj.isFixed) {
                  isChange = true
                }
              }
            }
          }

          if(!isChange) {
            this.$emit("submit")
            return
          }

          if(this.item.isStudentHidden) {
              const patchParams = {
                classroomId: this.classroomId,
                seatPlanId: this.item.seatPlanId,
                version: this.item.version,
                studentSeats: list
              }
              const res = await this.patchStudentSeat(patchParams)
              if(res.status === 428) {
                if(res.data.error === "NotClassroomOwner") {
                  this.$hiClass.alert('클래스의 주인이 아닙니다.', 'error')
                } else if(res.data.error === "SeatNotFound") {
                  this.$hiClass.alert('자리(좌석)을 찾을 수 없습니다.', 'error')
                }
                return
              }

              const hiddenParams = {
                classroomId: this.classroomId,
                seatPlanId: this.item.seatPlanId,
                version: this.item.version,
                isStudentHidden: true
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
            } else {
              const sections = this.item.seatSections.map(item => {
                return {
                  seatSectionName: item.sectionName,
                  seatSectionNo: item.sectionNo,
                  seats: item.seats.map(item2 => {
                    return {
                      studentId: item2.student ? item2.student.studentId : null,
                      seatRow: item2.seatRow,
                      seatColumn: item2.seatColumn, 
                      isActive: item2.isActive,
                      isFixed: item2.isFixed
                    }
                  })
                }
              })
              let obj = {
                seatPlanName: this.item.seatPlanName,
                seatPlanType: this.item.seatPlanType,
                sectionCount: this.item.sectionCount,
                sectionType: this.item.sectionType,
                pairingType: this.item.pairingType, 
                avoidPreviousPartner: this.item.avoidPreviousPartner,
                isMergeRemaining: this.item.isMergeRemaining,
                viewMode: this.item.viewMode,
                seatSections: sections
              }

              const params = {
                classroomId: this.classroomId,
                seatPlanId: this.item.seatPlanId,
                version: this.item.version,
                data: obj
              }
              const res = await this.resetSeatPlan(params)
              const data = res.data

              const hiddenParams = {
                classroomId: this.classroomId,
                seatPlanId: data.seatPlanId,
                version: data.version,
                isStudentHidden: true
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
            }

          this.$emit("submit")
        },
        getSeatKey(index) {
            const key = `${index}${Math.floor(1000 + Math.random() * 9000)}`
            return key
        },
        onClickInfo(e, seat) {
          if(this.isChange) return
          this.isChange = true

          const el = e.target
          if(this.changes.length === 0) {
              el.classList.add("active")
              this.changes.push({
                  seat: seat,
                  el: el
              })
              this.isChange = false
          } else {
              this.$emit("changingSeat", true)
              this.changes.push({
                  seat: seat,
                  el: el
              })
              const firstEl = this.changes[0].el
              const seatingPlanView = document.querySelector('.seating-plan-view');
              el.classList.add("active", "ani-in")
              firstEl.classList.add('ani-in')
              seatingPlanView.classList.add('ani-ing');  

              setTimeout(() => {
                  this.swapElements(firstEl, el)
                  el.classList.remove('ani-in');
                  firstEl.classList.remove('ani-in');
                  el.classList.add('ani-out');
                  firstEl.classList.add('ani-out');
                  setTimeout(() => {
                  el.classList.remove('active', 'ani-out');
                  firstEl.classList.remove('active', 'ani-out');
                  seatingPlanView.classList.remove('ani-ing');  
                  // firstElement = null;
                  this.changeSeat()
                  this.changes = []
                  this.isChange = false
                  this.$emit("changingSeat", false)
                  }, 600);
              }, 450);
          }
        },
        changeSeat() {
            const firstSeat = _.cloneDeep(this.changes[0].seat)
            const secondSeat = _.cloneDeep(this.changes[1].seat)

            let firstObj = null
            let secondObj = null
            for(const seatSection of this.item.seatSections) {
            if(!firstObj) {
                firstObj = seatSection.seats.find(v => v.seatId === firstSeat.seatId)
                if(firstObj) {
                firstObj.student = secondSeat.student ? secondSeat.student : null
                firstObj.isFixed = secondSeat.isFixed
                firstObj.isActive = secondSeat.isActive ? true : false
                }
            }
            if(!secondObj) {
                secondObj = seatSection.seats.find(v => v.seatId === secondSeat.seatId)
                if(secondObj) {
                secondObj.student = firstSeat.student ? firstSeat.student : null
                secondObj.isFixed = firstSeat.isFixed
                secondObj.isActive = firstSeat.isActive ? true : false
                }
            }
            }
        },
        swapElements(elem1, elem2) {
            const parent1 = elem1.parentNode
            const sibling1 = elem1.nextSibling === elem2 ? elem1 : elem1.nextSibling
            const parent2 = elem2.parentNode
            const sibling2 = elem2.nextSibling === elem1 ? elem2 : elem2.nextSibling

            parent1.insertBefore(elem2, sibling1)
            parent2.insertBefore(elem1, sibling2)
        },
        onUnFixed(item) {
            this.confirmTargetItem = item
            this.openConfirmModal('unfixed')
        },
        onUnFixedOk() {
            this.confirmTargetItem.isFixed = false

            this.toastMessageModal.open = false
            this.toastMessageModal.message = null
            this.toastMessageModal.bottom = null

            this.toastMessageModal.open = true
            this.toastMessageModal.message = "고정 해제되었습니다."
            this.toastMessageModal.bottom = 88

            setTimeout(() => {
                this.toastMessageModal.open = false
                this.toastMessageModal.message = null
                this.toastMessageModal.bottom = null
            }, 1300);
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
        openConfirmModal: function(action) {
            this.confirmModal = {...this.confirmModal, action}
            switch(action) {
                case 'unfixed' :
                    this.confirmModal.title = `자리 고정을 해제하시겠습니까?<br/>자리배치도에서도 고정이 해제됩니다.`
                    this.confirmModal.confirmButtonText = '확인'
                    this.confirmModal.confirmButtonColor = '#FF8737'
                break;  
            }
            this.confirmModal = {...this.confirmModal, isOpen: true}
        },
        closeConfirmModal: async function(isConfirm) {
            if(!isConfirm) {
                this.confirmModal = {
                    isOpen: false,
                    title: '',
                    description: '',
                    cancelButtonText: '',
                    confirmButtonText: '',
                    confirmButtonColor: '',
                    action: ''
                }
                return
            }

            switch(this.confirmModal.action) {
                case 'unfixed' :
                    this.onUnFixedOk()
                break;
            }

            this.confirmModal = {
                isOpen: false,
                title: '',
                description: '',
                cancelButtonText: '',
                confirmButtonText: '',
                confirmButtonColor: '',
                action: ''
            }
        },
        async seatFixedMsg(){
          this.toastMessageModal.open = false
          this.toastMessageModal.message = null
          this.toastMessageModal.bottom = null

          if(this.timer) {
            clearTimeout(this.timer)
          }

          const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay))
          await wait(100)

          this.toastMessageModal.open = true
          this.toastMessageModal.message = "고정된 자리입니다."
          this.toastMessageModal.bottom = 88

          this.timer = setTimeout(() => {
            this.toastMessageModal.open = false
            this.toastMessageModal.message = null
            this.toastMessageModal.bottom = null
          }, 1300);
        },
        onActive(item) {
          // if(this.isActiveCount >= this.studentCount) {
          //   this.toastMessageModal.open = false
          //   this.toastMessageModal.message = null
          //   this.toastMessageModal.bottom = null

          //   this.toastMessageModal.open = true
          //   this.toastMessageModal.message = "자리는 학생 수 만큼 활성화 가능합니다."
          //   this.toastMessageModal.bottom = 88

          //   setTimeout(() => {
          //     this.toastMessageModal.open = false
          //     this.toastMessageModal.message = null
          //     this.toastMessageModal.bottom = null
          //   }, 1300);
          // } else {
          //   item.isActive = true
          // }
          item.isActive = !item.isActive
          this.changes = []
          this.isChange = false
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
    },
    created() {
    },
    mounted() {
        this.item = _.cloneDeep(this.detail)
        this.oriItem = _.cloneDeep(this.detail)
        this.setRoate()
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
    }
}
</script>

<style lang="scss" scoped>
  .seating-plan-preset {
    .seating-plan-view {
      .plan-student {
        padding: 8px;
        .info {
          .name {
            top: 12px;
          }
        }
      }
    }
  }
</style>