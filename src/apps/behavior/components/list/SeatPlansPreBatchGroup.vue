<template>
  <div class="plan-type" ref="planType">
    <div class="plan-type-inner" ref="planTypeInner">
        <ul class="group-type" :class="addEaClassName">
            <li v-for="item of item.seatSections" :key="`seat-sections-${item.sectionId}`">
                <div class="plan-info">
                    <p class="plan-name">
                        <span>{{ item.sectionName }}</span>
                    </p>
                </div>
                <ul class="plan-student">
                    <li v-for="(seat, index) of item.seats" :key="`seat-${seat.seatId}-${seat.student ? seat.student.studentId : getSeatKey(index)}`"
                        :class="{
                          fixed: seat.isFixed
                        }"
                    >
                        <button type="button" class="info"
                            :class="{
                                disabled: !seat.isActive,
                                'no-profile': !showProfileImage || !seat.student
                            }"
                            @click="!seat.isFixed ? onClickInfo($event, seat) : seatFixedMsg()"
                        >
                            <template v-if="seat.student">
                              <span class="num">{{ seat.student.studentNo }}</span>
                              <div
                                class="profile"
                                v-if="showProfileImage"
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
    name: 'seat-plans-pre-batch-group',
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
        oriItem: {},
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
        },
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

            let activeCount = 0
            let list = []
            let isBatched = false
            let batchedCount = 0
            for(const seatSection of this.item.seatSections) {
                activeCount = activeCount + seatSection.seats.filter(v => v.isActive).length
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
                    availSeats[i].student = this.convertSeatStudent(students[i])
                }
            }
        },
        async randomPositionBatch() {
          this.isChange = false
          this.changes = []

          const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
          const students = await this.getClassroomStudents(params)
          
          let list = []
          for(const seatSection of this.item.seatSections) {
              list.push(seatSection.seats)
          }

          let addStudents = _.cloneDeep(students).map(student => this.convertSeatStudent(student))
          const seats = _.cloneDeep(list).reduce((acc, val) => acc.concat(val), [])
          for(const seat of seats) {
            if(seat.student) {
              addStudents = addStudents.filter(v => v.studentId !== seat.student.studentId)
            }
          }

          if(addStudents.length > 0) {
            let ramainCount = addStudents.length
            let idx = 0
            for(const seats of list) {
              for(const seat of seats) {
                if(!seat.isActive && ramainCount !== 0) {
                  seat.isActive = true
                  seat.student = addStudents[idx]
                  ramainCount--
                  idx++
                } else if(seat.isActive && !seat.student) {
                  seat.student = addStudents[idx]
                  ramainCount--
                  idx++
                }

                if(ramainCount === 0) break
              }
            }

          }

          let studentSeats = []
          const flattenedArray = list.reduce((acc, val) => acc.concat(val), [])
          const availSeats = flattenedArray.sort((a,b) => a.seatRow - b.seatRow)
          if(this.item.pairingType === "RANDOM") {    // 랜덤 
            if(this.item.avoidPreviousPartner) {
              const pairSeats = this.pairArray(availSeats)
              let studentList = []
              let pairSeatList = []
              let pairSeatFixedSingleList = []
              let pairSeatFixedDoubleList = []
              let soloSeatList = []
              let soloSeatFixedList = []
              let studentPairList = []
              let studentSoloList = []

              let beforePairStudentList = []
              // 시트로 넣을거 안넣을거 구분 
              for(const pairSeat of pairSeats) {
                let fixedCount = 0
                const studentIdObj = {
                  studentId1: null,
                  studentId2: null
                }
                let index = 0
                for(const seat of pairSeat) {
                  if(index === 0) {
                    studentIdObj.studentId1 = seat.student ? seat.student.studentId : null
                  } else {
                    studentIdObj.studentId2 = seat.student ? seat.student.studentId : null
                  }
                  if(!seat.isFixed) {
                    if(seat.student) {
                      studentList.push(this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId))))
                      seat.student = null
                    }
                  } else {
                    seat.student = this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId)))
                    fixedCount++
                  }
                  index++
                }
                beforePairStudentList.push(studentIdObj)

                const activeObj = pairSeat.find(v => v.isActive)
                const noActiveObj = pairSeat.find(v => !v.isActive)

                if(!noActiveObj) {
                  if(fixedCount === 2) {
                    pairSeatFixedDoubleList.push(pairSeat)
                  } else if(fixedCount === 1) {
                    pairSeatFixedSingleList.push(pairSeat)
                  } else {
                    pairSeatList.push(pairSeat)
                  }
                } else if(activeObj && noActiveObj) {
                  if(fixedCount === 1) {
                    soloSeatFixedList.push(activeObj)
                  } else {
                    soloSeatList.push(activeObj)
                  }
                }
              }
              // 시트로 넣을거 안넣을거 구분 
              this.shuffleArray(studentList)
              const totalStudents = _.cloneDeep(studentList)

              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다  
              for(const pairSeatFixedSingle of pairSeatFixedSingleList) {
                const fixedObj = pairSeatFixedSingle.find(v => v.isFixed)
                const nofixedObj = pairSeatFixedSingle.find(v => !v.isFixed)

                const beforePairObj = beforePairStudentList.find(v => v.studentId1 === fixedObj.student.studentId || v.studentId2 === fixedObj.student.studentId)
                const studentPairId = beforePairObj.studentId1 === fixedObj.student.studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 
                const studentIdx = totalStudents.findIndex(v => v.studentId !== studentPairId)
                let obj = {}
                if(studentIdx > -1) {
                  obj = _.cloneDeep(totalStudents[studentIdx])
                  totalStudents.splice(studentIdx, 1)
                } else {
                  obj = _.cloneDeep(totalStudents[0])
                  totalStudents.splice(0, 1)
                }
                nofixedObj.student = obj
              }
              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다 - 끝!!

              let pairStudents = _.cloneDeep(totalStudents)

              let isFinish = false
              while(!isFinish) {
                if(pairStudents.length === 1 || pairStudents.length === 0) {
                  isFinish = true
                } else if(pairStudents.length === 2) {
                  studentPairList.push([
                    {
                      student: pairStudents[0]
                    },
                    {
                      student: pairStudents[1]
                    }
                  ])
                  pairStudents = []
                } else {
                  const studentId = pairStudents[0].studentId
                  const beforePairObj = beforePairStudentList.find(v => v.studentId1 === studentId || v.studentId2 === studentId)
                  const studentPairId = beforePairObj.studentId1 === studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 
                    
                  const pairStudentObj = pairStudents.find(v => v.studentId !== studentId && v.studentId !== studentPairId)
                
                  studentPairList.push([
                    {
                      student: pairStudents[0]
                    },
                    {
                      student: pairStudentObj
                    }
                  ])
                  pairStudents = pairStudents.filter(v => v.studentId !== studentId && v.studentId !== pairStudentObj.studentId)
                }
              }
              
              for(const soloObj of pairStudents) {
                studentSoloList.push({
                  student: soloObj
                })
              }

              // 짝궁이 앉을 자리에 미리 넣는다 
              let pairSeatCount = 0
              for(let i = 0;i<pairSeatList.length;i++) {
                if(!studentPairList[i]) {
                  break
                } else {
                  pairSeatList[i][0].student = studentPairList[i][0].student
                  pairSeatList[i][1].student = studentPairList[i][1].student
                }
                pairSeatCount++
              }

              // 짝궁인데 남는자리가 있어서 못들어갈 경우 
              if(studentPairList.length > pairSeatCount) {
                for(let i = pairSeatCount;i<studentPairList.length;i++) {
                  studentSoloList.push({
                    student: studentPairList[i][0].student
                  })
                  studentSoloList.push({
                    student: studentPairList[i][1].student
                  })
                }
              }

              // pairSeat 평탄화 이후 student가 null인곳에 solo대상자를 넣는다 
              const flattenedPairSeatArray = pairSeatList.reduce((acc, val) => acc.concat(val), [])
              pairSeatList = flattenedPairSeatArray.filter(v => v.student)
              const remainPairSeatList = flattenedPairSeatArray.filter(v => !v.student)

              let rIdx = 0
              for(const remainPairSeat of remainPairSeatList) {
                remainPairSeat.student = studentSoloList[rIdx].student
                rIdx++
              }
              for(const soloSeat of soloSeatList) {
                soloSeat.student = studentSoloList[rIdx].student
                rIdx++
              }

              const noActiveSeats = availSeats.filter(v => !v.isActive)
              studentSeats = [
                ...pairSeatFixedSingleList.reduce((acc, val) => acc.concat(val), []),
                ...pairSeatFixedDoubleList.reduce((acc, val) => acc.concat(val), []),
                ...soloSeatFixedList,
                ...pairSeatList,
                ...soloSeatList,
                ...remainPairSeatList,
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
              const pairSeats = this.pairArray(availSeats)
              let studentList = []
              let pairSeatList = []
              let pairSeatFixedSingleList = []
              let pairSeatFixedDoubleList = []
              let soloSeatList = []
              let soloSeatFixedList = []
              let studentPairList = []
              let studentSoloList = []

              // 시트로 넣을거 안넣을거 구분 
              for(const pairSeat of pairSeats) {
                let fixedCount = 0
                for(const seat of pairSeat) {
                  if(!seat.isFixed) {
                    if(seat.student) {
                      studentList.push(this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId))))
                      seat.student = null
                    }
                  } else {
                    seat.student = this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId)))
                    fixedCount++
                  }
                }

                const activeObj = pairSeat.find(v => v.isActive)
                const noActiveObj = pairSeat.find(v => !v.isActive)

                if(!noActiveObj) {
                  if(fixedCount === 2) {
                    pairSeatFixedDoubleList.push(pairSeat)
                  } else if(fixedCount === 1) {
                    pairSeatFixedSingleList.push(pairSeat)
                  } else {
                    pairSeatList.push(pairSeat)
                  }
                } else if(activeObj && noActiveObj) {
                  if(fixedCount === 1) {
                    soloSeatFixedList.push(activeObj)
                  } else {
                    soloSeatList.push(activeObj)
                  }
                }
              }
              // 시트로 넣을거 안넣을거 구분 
              this.shuffleArray(studentList)
              const totalStudents = _.cloneDeep(studentList)

              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다  
              for(const pairSeatFixedSingle of pairSeatFixedSingleList) {
                // const fixedObj = pairSeatFixedSingle.find(v => v.isFixed)
                const nofixedObj = pairSeatFixedSingle.find(v => !v.isFixed)

                let obj = _.cloneDeep(totalStudents[0])
                totalStudents.splice(0, 1)
                nofixedObj.student = obj
              }
              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다 - 끝!!

              if(totalStudents.length % 2 !== 0) {
                studentSoloList.push({ student: totalStudents.slice(-1)[0]})
                totalStudents.pop()
              }  
              const pairStudents = this.pairArray(_.cloneDeep(totalStudents))
              
              for(const pairStudent of pairStudents) {
                studentPairList.push([
                  {
                    student: pairStudent[0]
                  },
                  {
                    student: pairStudent[1]
                  }
                ])
              }

              // 짝궁이 앉을 자리에 미리 넣는다 
              let pairSeatCount = 0
              for(let i = 0;i<pairSeatList.length;i++) {
                if(!studentPairList[i]) {
                  break
                } else {
                  pairSeatList[i][0].student = studentPairList[i][0].student
                  pairSeatList[i][1].student = studentPairList[i][1].student
                }
                pairSeatCount++
              }

              // 짝궁인데 남는자리가 있어서 못들어갈 경우 
              if(studentPairList.length > pairSeatCount) {
                for(let i = pairSeatCount;i<studentPairList.length;i++) {
                  studentSoloList.push({
                    student: studentPairList[i][0].student
                  })
                  studentSoloList.push({
                    student: studentPairList[i][1].student
                  })
                }
              }
              
              // pairSeat 평탄화 이후 student가 null인곳에 solo대상자를 넣는다 
              const flattenedPairSeatArray = pairSeatList.reduce((acc, val) => acc.concat(val), [])
              pairSeatList = flattenedPairSeatArray.filter(v => v.student)
              const remainPairSeatList = flattenedPairSeatArray.filter(v => !v.student)
              let rIdx = 0
              for(const remainPairSeat of remainPairSeatList) {
                remainPairSeat.student = studentSoloList[rIdx].student
                rIdx++
              }
              for(const soloSeat of soloSeatList) {
                soloSeat.student = studentSoloList[rIdx].student
                rIdx++
              }

              const noActiveSeats = availSeats.filter(v => !v.isActive)
              studentSeats = [
                ...pairSeatFixedSingleList.reduce((acc, val) => acc.concat(val), []),
                ...pairSeatFixedDoubleList.reduce((acc, val) => acc.concat(val), []),
                ...soloSeatFixedList,
                ...pairSeatList,
                ...soloSeatList,
                ...remainPairSeatList,
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
            }
          } else if(this.item.pairingType === "GENDER_SAME") {    // 동성 
            if(this.item.avoidPreviousPartner) {  // 이전 짝궁이랑 같이 안앉기 
              const pairSeats = this.pairArray(availSeats)

              let studentList = []
              let pairSeatList = []
              let pairSeatFixedSingleList = []
              let pairSeatFixedDoubleList = []
              let soloSeatList = []
              let soloSeatFixedList = []
              let studentPairList = []
              let studentSoloList = []

              let beforePairStudentList = []
              // 시트로 넣을거 안넣을거 구분 
              for(const pairSeat of pairSeats) {
                let fixedCount = 0
                const studentIdObj = {
                  studentId1: null,
                  studentId2: null
                }
                let index = 0
                for(const seat of pairSeat) {
                  if(index === 0) {
                    studentIdObj.studentId1 = seat.student ? seat.student.studentId : null
                  } else {
                    studentIdObj.studentId2 = seat.student ? seat.student.studentId : null
                  }

                  if(!seat.isFixed) {
                    if(seat.student) {
                      studentList.push(this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId))))
                      seat.student = null
                    }
                  } else {
                    seat.student = this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId)))
                    fixedCount++
                  }
                  index++
                }
                beforePairStudentList.push(studentIdObj)

                const activeObj = pairSeat.find(v => v.isActive)
                const noActiveObj = pairSeat.find(v => !v.isActive)

                if(!noActiveObj) {
                  if(fixedCount === 2) {
                    pairSeatFixedDoubleList.push(pairSeat)
                  } else if(fixedCount === 1) {
                    pairSeatFixedSingleList.push(pairSeat)
                  } else {
                    pairSeatList.push(pairSeat)
                  }
                } else if(activeObj && noActiveObj) {
                  if(fixedCount === 1) {
                    soloSeatFixedList.push(activeObj)
                  } else {
                    soloSeatList.push(activeObj)
                  }
                }
              }

              this.shuffleArray(studentList)
              const maleStudents = studentList.filter(v => v.studentGender === "MALE")
              const femaleStudents = studentList.filter(v => v.studentGender === "FEMALE")
              const noneGenderStudents = studentList.filter(v => !v.studentGender)

              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다  
              for(const pairSeatFixedSingle of pairSeatFixedSingleList) {
                const fixedObj = pairSeatFixedSingle.find(v => v.isFixed)
                const nofixedObj = pairSeatFixedSingle.find(v => !v.isFixed)
                
                const beforePairObj = beforePairStudentList.find(v => v.studentId1 === fixedObj.student.studentId || v.studentId2 === fixedObj.student.studentId)
                const studentPairId = beforePairObj.studentId1 === fixedObj.student.studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 

                const femaleIdx = femaleStudents.findIndex(v => v.studentId !== studentPairId)
                const maleIdx = maleStudents.findIndex(v => v.studentId !== studentPairId)
                const noneGenderIdx = noneGenderStudents.findIndex(v => v.studentId !== studentPairId)

                if(fixedObj.student.studentGender === "MALE") {
                  let obj = {}
                  if(maleIdx>-1) {
                    obj = _.cloneDeep(maleStudents[maleIdx])
                    maleStudents.splice(maleIdx, 1)
                  } else if(noneGenderIdx>-1) {
                    obj = _.cloneDeep(noneGenderStudents[noneGenderIdx])
                    noneGenderStudents.splice(noneGenderIdx, 1)
                  } else if(femaleIdx>-1) {
                    obj = _.cloneDeep(femaleStudents[femaleIdx])
                    femaleStudents.splice(femaleIdx, 1)
                  } else {
                    if(maleStudents[0]) {
                      obj = _.cloneDeep(maleStudents[0])
                      maleStudents.splice(0, 1)
                    } else if(noneGenderStudents[0]) {
                      obj = _.cloneDeep(noneGenderStudents[0])
                      noneGenderStudents.splice(0, 1)
                    } else if(femaleStudents[0]) {
                      obj = _.cloneDeep(femaleStudents[0])
                      femaleStudents.splice(0, 1)
                    }
                  }
                  nofixedObj.student = obj
                } else if(fixedObj.student.studentGender === "FEMALE") {
                  let obj = {}
                  if(femaleIdx > -1) {
                    obj = _.cloneDeep(femaleStudents[femaleIdx])
                    femaleStudents.splice(femaleIdx, 1)
                  } else if(noneGenderIdx > -1) {
                    obj = _.cloneDeep(noneGenderStudents[noneGenderIdx])
                    noneGenderStudents.splice(noneGenderIdx, 1)
                  } else if(maleIdx > -1) {
                    obj = _.cloneDeep(maleStudents[maleIdx])
                    maleStudents.splice(maleIdx, 1)
                  } else {
                    if(femaleStudents[0]) {
                      obj = _.cloneDeep(femaleStudents[0])
                      femaleStudents.splice(0, 1)
                    } else if(noneGenderStudents[0]) {
                      obj = _.cloneDeep(noneGenderStudents[0])
                      noneGenderStudents.splice(0, 1)
                    } else if(maleStudents[0]) {
                      obj = _.cloneDeep(maleStudents[0])
                      maleStudents.splice(0, 1)
                    }
                  }
                  nofixedObj.student = obj
                } else {
                  let obj = {}
                  if(noneGenderIdx > -1) {
                    obj = _.cloneDeep(noneGenderStudents[noneGenderIdx])
                    noneGenderStudents.splice(noneGenderIdx, 1)
                  } else if(maleIdx > -1) {
                    obj = _.cloneDeep(maleStudents[maleIdx])
                    maleStudents.splice(maleIdx, 1)
                  } else if(femaleIdx > -1) {
                    obj = _.cloneDeep(femaleStudents[femaleIdx])
                    femaleStudents.splice(femaleIdx, 1)
                  } else {
                    if(noneGenderStudents[0]) {
                      obj = _.cloneDeep(noneGenderStudents[0])
                      noneGenderStudents.splice(0, 1)
                    } else if(maleStudents[0]) {
                      obj = _.cloneDeep(maleStudents[0])
                      maleStudents.splice(0, 1)
                    } else if(femaleStudents[0]) {
                      obj = _.cloneDeep(femaleStudents[0])
                      femaleStudents.splice(0, 1)
                    }
                  }
                  nofixedObj.student = obj
                }
              }
              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다 - 끝!!

              let pairMaleStudents = _.cloneDeep(maleStudents)
              let pairFemaleStudents = _.cloneDeep(femaleStudents)
              let pairNoneGenderStudents = _.cloneDeep(noneGenderStudents)

              let isFinishMale = false
              let isFinishFeMale = false
              let isFinishNoneGender = false
              while(!isFinishMale) {
                if(pairMaleStudents.length === 1 || pairMaleStudents.length === 0) {
                  isFinishMale = true
                } else if(pairMaleStudents.length === 2) {
                  studentPairList.push([
                    {
                      student: pairMaleStudents[0]
                    },
                    {
                      student: pairMaleStudents[1]
                    }
                  ])
                  pairMaleStudents = []
                } else {
                  const studentId = pairMaleStudents[0].studentId
                  const beforePairObj = beforePairStudentList.find(v => v.studentId1 === studentId || v.studentId2 === studentId)
                  const studentPairId = beforePairObj.studentId1 === studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 
                    
                  const pairStudentObj = pairMaleStudents.find(v => v.studentId !== studentId && v.studentId !== studentPairId)
                
                  studentPairList.push([
                    {
                      student: pairMaleStudents[0]
                    },
                    {
                      student: pairStudentObj
                    }
                  ])
                  pairMaleStudents = pairMaleStudents.filter(v => v.studentId !== studentId && v.studentId !== pairStudentObj.studentId)
                }
              }

              while(!isFinishFeMale) {
                if(pairFemaleStudents.length === 1 || pairFemaleStudents.length === 0) {
                  isFinishFeMale = true
                } else if(pairFemaleStudents.length === 2) {
                  studentPairList.push([
                    {
                      student: pairFemaleStudents[0]
                    },
                    {
                      student: pairFemaleStudents[1]
                    }
                  ])
                  pairFemaleStudents = []
                } else {
                  const studentId = pairFemaleStudents[0].studentId
                  const beforePairObj = beforePairStudentList.find(v => v.studentId1 === studentId || v.studentId2 === studentId)
                  const studentPairId = beforePairObj.studentId1 === studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 
                    
                  const pairStudentObj = pairFemaleStudents.find(v => v.studentId !== studentId && v.studentId !== studentPairId)
                
                  studentPairList.push([
                    {
                      student: pairFemaleStudents[0]
                    },
                    {
                      student: pairStudentObj
                    }
                  ])
                  pairFemaleStudents = pairFemaleStudents.filter(v => v.studentId !== studentId && v.studentId !== pairStudentObj.studentId)
                }
              }

              while(!isFinishNoneGender) {
                if(pairNoneGenderStudents.length === 1 || pairNoneGenderStudents.length === 0) {
                  isFinishNoneGender = true
                } else if(pairNoneGenderStudents.length === 2) {
                  studentPairList.push([
                    {
                      student: pairNoneGenderStudents[0]
                    },
                    {
                      student: pairNoneGenderStudents[1]
                    }
                  ])
                  pairNoneGenderStudents = []
                } else {
                  const studentId = pairNoneGenderStudents[0].studentId
                  const beforePairObj = beforePairStudentList.find(v => v.studentId1 === studentId || v.studentId2 === studentId)
                  const studentPairId = beforePairObj.studentId1 === studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 
                    
                  const pairStudentObj = pairNoneGenderStudents.find(v => v.studentId !== studentId && v.studentId !== studentPairId)
                
                  studentPairList.push([
                    {
                      student: pairNoneGenderStudents[0]
                    },
                    {
                      student: pairStudentObj
                    }
                  ])
                  pairNoneGenderStudents = pairNoneGenderStudents.filter(v => v.studentId !== studentId && v.studentId !== pairStudentObj.studentId)
                }
              }

              for(const soloObj of [
                ...pairMaleStudents,
                ...pairFemaleStudents,
                ...pairNoneGenderStudents
              ]) {
                studentSoloList.push({
                  student: soloObj
                })
              }
              
              // 짝궁이 앉을 자리에 미리 넣는다 
              let pairSeatCount = 0
              for(let i = 0;i<pairSeatList.length;i++) {
                if(!studentPairList[i]) {
                  break
                } else {
                  pairSeatList[i][0].student = studentPairList[i][0].student
                  pairSeatList[i][1].student = studentPairList[i][1].student
                }
                pairSeatCount++
              }

              // 짝궁인데 남는자리가 있어서 못들어갈 경우 
              if(studentPairList.length > pairSeatCount) {
                for(let i = pairSeatCount;i<studentPairList.length;i++) {
                  studentSoloList.push({
                    student: studentPairList[i][0].student
                  })
                  studentSoloList.push({
                    student: studentPairList[i][1].student
                  })
                }
              }

              // pairSeat 평탄화 이후 student가 null인곳에 solo대상자를 넣는다 
              const flattenedPairSeatArray = pairSeatList.reduce((acc, val) => acc.concat(val), [])
              pairSeatList = flattenedPairSeatArray.filter(v => v.student)
              const remainPairSeatList = flattenedPairSeatArray.filter(v => !v.student)

              const studentSoloSortList = studentSoloList.sort((a,b) => a.studentGender - b.studentGender)

              let rIdx = 0
              for(const remainPairSeat of remainPairSeatList) {
                remainPairSeat.student = studentSoloSortList[rIdx].student
                rIdx++
              }
              for(const soloSeat of soloSeatList) {
                soloSeat.student = studentSoloSortList[rIdx].student
                rIdx++
              }

              const noActiveSeats = availSeats.filter(v => !v.isActive)
              studentSeats = [
                ...pairSeatFixedSingleList.reduce((acc, val) => acc.concat(val), []),
                ...pairSeatFixedDoubleList.reduce((acc, val) => acc.concat(val), []),
                ...soloSeatFixedList,
                ...pairSeatList,
                ...soloSeatList,
                ...remainPairSeatList,
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
            } else {  //
              const pairSeats = this.pairArray(availSeats)
              let studentList = []
              let pairSeatList = []
              let pairSeatFixedSingleList = []
              let pairSeatFixedDoubleList = []
              let soloSeatList = []
              let soloSeatFixedList = []
              let studentPairList = []
              let studentSoloList = []
              for(const pairSeat of pairSeats) {
                let fixedCount = 0
                for(const seat of pairSeat) {
                  if(!seat.isFixed) {
                    if(seat.student) {
                      studentList.push(this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId))))
                      seat.student = null
                    }
                  } else {
                    seat.student = this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId)))
                    fixedCount++
                  }
                }

                const activeObj = pairSeat.find(v => v.isActive)
                const noActiveObj = pairSeat.find(v => !v.isActive)

                if(!noActiveObj) {
                  if(fixedCount === 2) {
                    pairSeatFixedDoubleList.push(pairSeat)
                  } else if(fixedCount === 1) {
                    pairSeatFixedSingleList.push(pairSeat)
                  } else {
                    pairSeatList.push(pairSeat)
                  }
                } else if(activeObj && noActiveObj) {
                  if(fixedCount === 1) {
                    soloSeatFixedList.push(activeObj)
                  } else {
                    soloSeatList.push(activeObj)
                  }
                }
              }
              
              this.shuffleArray(studentList)
              const maleStudents = studentList.filter(v => v.studentGender === "MALE")
              const femaleStudents = studentList.filter(v => v.studentGender === "FEMALE")
              const noneGenderStudents = studentList.filter(v => !v.studentGender)

              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다  
              for(const pairSeatFixedSingle of pairSeatFixedSingleList) {
                const fixedObj = pairSeatFixedSingle.find(v => v.isFixed)
                const nofixedObj = pairSeatFixedSingle.find(v => !v.isFixed)

                if(fixedObj.student.studentGender === "MALE") {
                  let obj = {}
                  if(maleStudents.length > 0) {
                    obj = _.cloneDeep(maleStudents[0])
                    maleStudents.splice(0, 1)
                  } else if(noneGenderStudents.length > 0) {
                    obj = _.cloneDeep(noneGenderStudents[0])
                    noneGenderStudents.splice(0, 1)
                  } else if(femaleStudents.length > 0) {
                    obj = _.cloneDeep(femaleStudents[0])
                    femaleStudents.splice(0, 1)
                  }
                  nofixedObj.student = obj
                } else if(fixedObj.student.studentGender === "FEMALE") {
                  let obj = {}
                  if(femaleStudents.length > 0) {
                    obj = _.cloneDeep(femaleStudents[0])
                    femaleStudents.splice(0, 1)
                  } else if(noneGenderStudents.length > 0) {
                    obj = _.cloneDeep(noneGenderStudents[0])
                    noneGenderStudents.splice(0, 1)
                  } else if(maleStudents.length > 0) {
                    obj = _.cloneDeep(maleStudents[0])
                    maleStudents.splice(0, 1)
                  }
                  nofixedObj.student = obj
                } else {
                  let obj = {}
                  if(noneGenderStudents.length > 0) {
                    obj = _.cloneDeep(noneGenderStudents[0])
                    noneGenderStudents.splice(0, 1)
                  } else if(maleStudents.length > 0) {
                    obj = _.cloneDeep(maleStudents[0])
                    maleStudents.splice(0, 1)
                  } else if(femaleStudents.length > 0) {
                    obj = _.cloneDeep(femaleStudents[0])
                    femaleStudents.splice(0, 1)
                  }
                  nofixedObj.student = obj
                }
              }
              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다 - 끝!!

              if(maleStudents.length % 2 !== 0) {
                studentSoloList.push({ student: maleStudents.slice(-1)[0]})
                maleStudents.pop()
              }  
              if(femaleStudents.length % 2 !== 0) {
                studentSoloList.push({ student: femaleStudents.slice(-1)[0]})
                femaleStudents.pop()
              }
              if(noneGenderStudents.length % 2 !== 0) {
                studentSoloList.push({ student: noneGenderStudents.slice(-1)[0]})
                noneGenderStudents.pop()
              } 

              const pairMaleStudents = this.pairArray(_.cloneDeep(maleStudents))
              const pairFemaleStudents = this.pairArray(_.cloneDeep(femaleStudents))
              const pairNoneGenderStudents = this.pairArray(_.cloneDeep(noneGenderStudents))

              for(const pairMaleStudent of pairMaleStudents) {
                studentPairList.push([
                  {
                    student: pairMaleStudent[0]
                  },
                  {
                    student: pairMaleStudent[1]
                  }
                ])
              }

              for(const pairFemaleStudent of pairFemaleStudents) {
                studentPairList.push([
                  {
                    student: pairFemaleStudent[0]
                  },
                  {
                    student: pairFemaleStudent[1]
                  }
                ])
              }

              for(const pairNoneGenderStudent of pairNoneGenderStudents) {
                studentPairList.push([
                  {
                    student: pairNoneGenderStudent[0]
                  },
                  {
                    student: pairNoneGenderStudent[1]
                  }
                ])
              }

              // 짝궁이 앉을 자리에 미리 넣는다 
              let pairSeatCount = 0
              for(let i = 0;i<pairSeatList.length;i++) {
                if(!studentPairList[i]) {
                  break
                } else {
                  pairSeatList[i][0].student = studentPairList[i][0].student
                  pairSeatList[i][1].student = studentPairList[i][1].student
                }
                pairSeatCount++
              }
            
              // 짝궁인데 남는자리가 있어서 못들어갈 경우 
              if(studentPairList.length > pairSeatCount) {
                for(let i = pairSeatCount;i<studentPairList.length;i++) {
                  studentSoloList.push({
                    student: studentPairList[i][0].student
                  })
                  studentSoloList.push({
                    student: studentPairList[i][1].student
                  })
                }
              }

              // pairSeat 평탄화 이후 student가 null인곳에 solo대상자를 넣는다 
              const flattenedPairSeatArray = pairSeatList.reduce((acc, val) => acc.concat(val), [])
              pairSeatList = flattenedPairSeatArray.filter(v => v.student)
              const remainPairSeatList = flattenedPairSeatArray.filter(v => !v.student)

              const studentSoloSortList = studentSoloList.sort((a,b) => a.studentGender - b.studentGender)

              let rIdx = 0
              for(const remainPairSeat of remainPairSeatList) {
                remainPairSeat.student = studentSoloSortList[rIdx].student
                rIdx++
              }
              for(const soloSeat of soloSeatList) {
                soloSeat.student = studentSoloSortList[rIdx].student
                rIdx++
              }

              const noActiveSeats = availSeats.filter(v => !v.isActive)
              studentSeats = [
                ...pairSeatFixedSingleList.reduce((acc, val) => acc.concat(val), []),
                ...pairSeatFixedDoubleList.reduce((acc, val) => acc.concat(val), []),
                ...soloSeatFixedList,
                ...pairSeatList,
                ...soloSeatList,
                ...remainPairSeatList,
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
            }
          } else if(this.item.pairingType === "GENDER_DIFFERENT") {   // 이성
            if(this.item.avoidPreviousPartner) {  // 이전 짝궁이랑 같이 안앉기 
              const pairSeats = this.pairArray(availSeats)

              let studentList = []
              let pairSeatList = []
              let pairSeatFixedSingleList = []
              let pairSeatFixedDoubleList = []
              let soloSeatList = []
              let soloSeatFixedList = []
              let studentPairList = []
              let studentSoloList = []

              let beforePairStudentList = []
              // 시트로 넣을거 안넣을거 구분 
              for(const pairSeat of pairSeats) {
                let fixedCount = 0
                const studentIdObj = {
                  studentId1: null,
                  studentId2: null
                }
                let index = 0
                for(const seat of pairSeat) {
                  if(index === 0) {
                    studentIdObj.studentId1 = seat.student ? seat.student.studentId : null
                  } else {
                    studentIdObj.studentId2 = seat.student ? seat.student.studentId : null
                  }

                  if(!seat.isFixed) {
                    if(seat.student) {
                      studentList.push(this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId))))
                      seat.student = null
                    }
                  } else {
                    seat.student = this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId)))
                    fixedCount++
                  }
                  index++
                }
                beforePairStudentList.push(studentIdObj)

                const activeObj = pairSeat.find(v => v.isActive)
                const noActiveObj = pairSeat.find(v => !v.isActive)

                if(!noActiveObj) {
                  if(fixedCount === 2) {
                    pairSeatFixedDoubleList.push(pairSeat)
                  } else if(fixedCount === 1) {
                    pairSeatFixedSingleList.push(pairSeat)
                  } else {
                    pairSeatList.push(pairSeat)
                  }
                } else if(activeObj && noActiveObj) {
                  if(fixedCount === 1) {
                    soloSeatFixedList.push(activeObj)
                  } else {
                    soloSeatList.push(activeObj)
                  }
                }
              }

              this.shuffleArray(studentList)
              const maleStudents = studentList.filter(v => v.studentGender === "MALE")
              const femaleStudents = studentList.filter(v => v.studentGender === "FEMALE")
              const noneGenderStudents = studentList.filter(v => !v.studentGender)

              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다  
              for(const pairSeatFixedSingle of pairSeatFixedSingleList) {
                const fixedObj = pairSeatFixedSingle.find(v => v.isFixed)
                const nofixedObj = pairSeatFixedSingle.find(v => !v.isFixed)
                
                const beforePairObj = beforePairStudentList.find(v => v.studentId1 === fixedObj.student.studentId || v.studentId2 === fixedObj.student.studentId)
                const studentPairId = beforePairObj.studentId1 === fixedObj.student.studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 

                const femaleIdx = femaleStudents.findIndex(v => v.studentId !== studentPairId)
                const maleIdx = maleStudents.findIndex(v => v.studentId !== studentPairId)
                const noneGenderIdx = noneGenderStudents.findIndex(v => v.studentId !== studentPairId)

                if(fixedObj.student.studentGender === "MALE") {
                  let obj = {}
                  if(femaleIdx>-1) {
                    obj = _.cloneDeep(femaleStudents[femaleIdx])
                    femaleStudents.splice(femaleIdx, 1)
                  } else if(noneGenderIdx>-1) {
                    obj = _.cloneDeep(noneGenderStudents[noneGenderIdx])
                    noneGenderStudents.splice(noneGenderIdx, 1)
                  } else if(maleIdx>-1) {
                    obj = _.cloneDeep(maleStudents[maleIdx])
                    maleStudents.splice(maleIdx, 1)
                  } else {
                    if(femaleStudents[0]) {
                      obj = _.cloneDeep(femaleStudents[0])
                      femaleStudents.splice(0, 1)
                    } else if(noneGenderStudents[0]) {
                      obj = _.cloneDeep(noneGenderStudents[0])
                      noneGenderStudents.splice(0, 1)
                    } else if(maleStudents[0]) {
                      obj = _.cloneDeep(maleStudents[0])
                      maleStudents.splice(0, 1)
                    }
                  }
                  nofixedObj.student = obj
                } else if(fixedObj.student.studentGender === "FEMALE") {
                  let obj = {}
                  if(maleIdx > -1) {
                    obj = _.cloneDeep(maleStudents[maleIdx])
                    maleStudents.splice(maleIdx, 1)
                  } else if(noneGenderIdx > -1) {
                    obj = _.cloneDeep(noneGenderStudents[noneGenderIdx])
                    noneGenderStudents.splice(noneGenderIdx, 1)
                  } else if(femaleIdx > -1) {
                    obj = _.cloneDeep(femaleStudents[femaleIdx])
                    femaleStudents.splice(femaleIdx, 1)
                  } else {
                    if(maleStudents[0]) {
                      obj = _.cloneDeep(maleStudents[0])
                      maleStudents.splice(0, 1)
                    } else if(noneGenderStudents[0]) {
                      obj = _.cloneDeep(noneGenderStudents[0])
                      noneGenderStudents.splice(0, 1)
                    } else if(femaleStudents[0]) {
                      obj = _.cloneDeep(femaleStudents[0])
                      femaleStudents.splice(0, 1)
                    }
                  }
                  nofixedObj.student = obj
                } else {
                  let obj = {}
                  if(maleIdx > -1) {
                    obj = _.cloneDeep(maleStudents[maleIdx])
                    maleStudents.splice(maleIdx, 1)
                  } else if(femaleIdx > -1) {
                    obj = _.cloneDeep(femaleStudents[femaleIdx])
                    femaleStudents.splice(femaleIdx, 1)
                  } else if(noneGenderIdx > -1) {
                    obj = _.cloneDeep(noneGenderStudents[noneGenderIdx])
                    noneGenderStudents.splice(noneGenderIdx, 1)
                  } else {
                    if(maleStudents[0]) {
                      obj = _.cloneDeep(maleStudents[0])
                      maleStudents.splice(0, 1)
                    } else if(femaleStudents[0]) {
                      obj = _.cloneDeep(femaleStudents[0])
                      femaleStudents.splice(0, 1)
                    } else if(noneGenderStudents[0]) {
                      obj = _.cloneDeep(noneGenderStudents[0])
                      noneGenderStudents.splice(0, 1)
                    }
                  }
                  nofixedObj.student = obj
                }
              }
              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다 - 끝!!

              let standardList = []
              let mixList = []

              if(maleStudents.length === 0 && femaleStudents.length > 0) {
                standardList = [...femaleStudents]
                mixList = [...noneGenderStudents]
              } else if(femaleStudents.length === 0 && maleStudents.length > 0) {
                standardList = [...maleStudents]
                mixList = [...noneGenderStudents]
              } else if(femaleStudents.length === 0 && maleStudents.length === 0) {
                standardList = []
                mixList = [...noneGenderStudents]
              } else {
                standardList = [...maleStudents]
                mixList = [
                  ...femaleStudents,
                  ...noneGenderStudents
                ]
              }

              this.shuffleArray(mixList)
              let pairCount = 0
              for(let i = 0;i<standardList.length;i++) {
                const beforePairObj = beforePairStudentList.find(v => v.studentId1 === standardList[i].studentId || v.studentId2 === standardList[i].studentId)
                const studentPairId = beforePairObj.studentId1 === standardList[i].studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 

                let index = mixList.findIndex(v => v.studentId !== studentPairId)
                if(index < 0) break

                studentPairList.push([
                  {
                    student: standardList[i]
                  }, 
                  {
                    student: mixList[index]
                  }
                ])
                mixList.splice(index, 1)
                pairCount++
              }

              for(let i = pairCount;i<standardList.length;i++) {
                studentSoloList.push({
                  student: standardList[i]
                })
              }

              for(let i = 0;i<mixList.length;i++) {
                studentSoloList.push({
                  student: mixList[i]
                })
              }

              // 짝궁이 앉을 자리에 미리 넣는다 
              let pairSeatCount = 0
              for(let i = 0;i<pairSeatList.length;i++) {
                if(!studentPairList[i]) {
                  break
                } else {
                  pairSeatList[i][0].student = studentPairList[i][0].student
                  pairSeatList[i][1].student = studentPairList[i][1].student
                }
                pairSeatCount++
              }

              // 짝궁인데 남는자리가 있어서 못들어갈 경우 
              if(studentPairList.length > pairSeatCount) {
                for(let i = pairSeatCount;i<studentPairList.length;i++) {
                  studentSoloList.push({
                    student: studentPairList[i][0].student
                  })
                  studentSoloList.push({
                    student: studentPairList[i][1].student
                  })
                }
              }
              
              // sololist에서도 이전짝궁이랑 짝을 안지어줘야한다 
              for(const pairSeat of pairSeatList) {
                const idx = pairSeat.findIndex(v => !v.student)
                if(idx > -1) {
                  if(studentSoloList.length === 2) {
                    pairSeat[0].student = studentSoloList[0].student
                    pairSeat[1].student = studentSoloList[1].student
                  } else {
                    const studentId = studentSoloList[0].student.studentId
                    const beforePairObj = beforePairStudentList.find(v => v.studentId1 === studentId || v.studentId2 === studentId)
                    const studentPairId = beforePairObj.studentId1 === studentId ? beforePairObj.studentId2 : beforePairObj.studentId1 
                    
                    const soloObj = studentSoloList.find(v => v.student.studentId !== studentId && v.student.studentId !== studentPairId)
                    pairSeat[0].student = studentSoloList[0].student
                    pairSeat[1].student = soloObj.student
                    studentSoloList = studentSoloList.filter(v => v.student.studentId !== studentId && v.student.studentId !== soloObj.student.studentId)
                  }
                }
              }
              // sololist에서도 이전짝궁이랑 짝을 안지어줘야한다 

              // pairSeat 평탄화 이후 student가 null인곳에 solo대상자를 넣는다 
              const flattenedPairSeatArray = pairSeatList.reduce((acc, val) => acc.concat(val), [])
              pairSeatList = flattenedPairSeatArray.filter(v => v.student)
              const remainPairSeatList = flattenedPairSeatArray.filter(v => !v.student)

              let rIdx = 0
              for(const soloSeat of soloSeatList) {
                soloSeat.student = studentSoloList[rIdx].student
                rIdx++
              }

              const noActiveSeats = availSeats.filter(v => !v.isActive)
              studentSeats = [
                ...pairSeatFixedSingleList.reduce((acc, val) => acc.concat(val), []),
                ...pairSeatFixedDoubleList.reduce((acc, val) => acc.concat(val), []),
                ...soloSeatFixedList,
                ...pairSeatList,
                ...soloSeatList,
                ...remainPairSeatList,
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
            } else {  //
              let studentList = []
              let pairSeatList = []
              let pairSeatFixedSingleList = []
              let pairSeatFixedDoubleList = []
              let soloSeatList = []
              let soloSeatFixedList = []
              let studentPairList = []
              let studentSoloList = []
              const pairSeats = this.pairArray(availSeats)
              // 시트로 넣을거 안넣을거 구분 
              for(const pairSeat of pairSeats) {
                let fixedCount = 0
                for(const seat of pairSeat) {
                  if(!seat.isFixed) {
                    if(seat.student) {
                      studentList.push(this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId))))
                      seat.student = null
                    }
                  } else {
                    seat.student = this.convertSeatStudent(_.cloneDeep(students.find(v => v.studentId === seat.student.studentId)))
                    fixedCount++
                  }
                }

                const activeObj = pairSeat.find(v => v.isActive)
                const noActiveObj = pairSeat.find(v => !v.isActive)

                if(!noActiveObj) {
                  if(fixedCount === 2) {
                    pairSeatFixedDoubleList.push(pairSeat)
                  } else if(fixedCount === 1) {
                    pairSeatFixedSingleList.push(pairSeat)
                  } else {
                    pairSeatList.push(pairSeat)
                  }
                } else if(activeObj && noActiveObj) {
                  if(fixedCount === 1) {
                    soloSeatFixedList.push(activeObj)
                  } else {
                    soloSeatList.push(activeObj)
                  }
                }
              }
              // 시트로 넣을거 안넣을거 구분 
              
              this.shuffleArray(studentList)
              const maleStudents = studentList.filter(v => v.studentGender === "MALE")
              const femaleStudents = studentList.filter(v => v.studentGender === "FEMALE")
              const noneGenderStudents = studentList.filter(v => !v.studentGender)

              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다  
              for(const pairSeatFixedSingle of pairSeatFixedSingleList) {
                const fixedObj = pairSeatFixedSingle.find(v => v.isFixed)
                const nofixedObj = pairSeatFixedSingle.find(v => !v.isFixed)

                if(fixedObj.student.studentGender === "MALE") {
                  let obj = {}
                  if(femaleStudents.length > 0) {
                    obj = _.cloneDeep(femaleStudents[0])
                    femaleStudents.splice(0, 1)
                  } else if(noneGenderStudents.length > 0) {
                    obj = _.cloneDeep(noneGenderStudents[0])
                    noneGenderStudents.splice(0, 1)
                  } else if(maleStudents.length > 0) {
                    obj = _.cloneDeep(maleStudents[0])
                    maleStudents.splice(0, 1)
                  }
                  nofixedObj.student = obj
                } else if(fixedObj.student.studentGender === "FEMALE") {
                  let obj = {}
                  if(maleStudents.length > 0) {
                    obj = _.cloneDeep(maleStudents[0])
                    maleStudents.splice(0, 1)
                  } else if(noneGenderStudents.length > 0) {
                    obj = _.cloneDeep(noneGenderStudents[0])
                    noneGenderStudents.splice(0, 1)
                  } else if(femaleStudents.length > 0) {
                    obj = _.cloneDeep(femaleStudents[0])
                    femaleStudents.splice(0, 1)
                  }
                  nofixedObj.student = obj
                } else {
                  let obj = {}
                  if(maleStudents.length > 0) {
                    obj = _.cloneDeep(maleStudents[0])
                    maleStudents.splice(0, 1)
                  } else if(femaleStudents.length > 0) {
                    obj = _.cloneDeep(femaleStudents[0])
                    femaleStudents.splice(0, 1)
                  } else if(noneGenderStudents.length > 0) {
                    obj = _.cloneDeep(noneGenderStudents[0])
                    noneGenderStudents.splice(0, 1)
                  }
                  nofixedObj.student = obj
                }
              }
              // 한쪽만 fixed된것 반대쪽 학생 업데이트 해준다 - 끝!!

              let standardList = []
              let mixList = []

              if(maleStudents.length === 0 && femaleStudents.length > 0) {
                standardList = [...femaleStudents]
                mixList = [...noneGenderStudents]
              } else if(femaleStudents.length === 0 && maleStudents.length > 0) {
                standardList = [...maleStudents]
                mixList = [...noneGenderStudents]
              } else if(femaleStudents.length === 0 && maleStudents.length === 0) {
                standardList = []
                mixList = [...noneGenderStudents]
              } else {
                standardList = [...maleStudents]
                mixList = [
                  ...femaleStudents,
                  ...noneGenderStudents
                ]
              }

              this.shuffleArray(mixList)
              let pairCount = 0
              for(let i = 0;i<standardList.length;i++) {
                if(!mixList[i]) break

                studentPairList.push([
                  {
                    student: standardList[i]
                  }, 
                  {
                    student: mixList[i]
                  }
                ])
                pairCount++
              }
              if(standardList.length < mixList.length) {
                for(let i = pairCount;i<mixList.length;i++) {
                  studentSoloList.push({
                    student: mixList[i]
                  })
                }
              } else if(standardList.length > mixList.length) {
                for(let i = pairCount;i<standardList.length;i++) {
                  studentSoloList.push({
                    student: standardList[i]
                  })
                }
              }

              // 짝궁이 앉을 자리에 미리 넣는다 
              let pairSeatCount = 0
              for(let i = 0;i<pairSeatList.length;i++) {
                if(!studentPairList[i]) {
                  break
                } else {
                  pairSeatList[i][0].student = studentPairList[i][0].student
                  pairSeatList[i][1].student = studentPairList[i][1].student
                }
                pairSeatCount++
              }

              // 짝궁인데 남는자리가 있어서 못들어갈 경우 
              if(studentPairList.length > pairSeatCount) {
                for(let i = pairSeatCount;i<studentPairList.length;i++) {
                  studentSoloList.push({
                    student: studentPairList[i][0].student
                  })
                  studentSoloList.push({
                    student: studentPairList[i][1].student
                  })
                }
              }

              // pairSeat 평탄화 이후 student가 null인곳에 solo대상자를 넣는다 
              const flattenedPairSeatArray = pairSeatList.reduce((acc, val) => acc.concat(val), [])
              pairSeatList = flattenedPairSeatArray.filter(v => v.student)
              const remainPairSeatList = flattenedPairSeatArray.filter(v => !v.student)

              let rIdx = 0
              for(const remainPairSeat of remainPairSeatList) {
                remainPairSeat.student = studentSoloList[rIdx].student
                rIdx++
              }
              for(const soloSeat of soloSeatList) {
                soloSeat.student = studentSoloList[rIdx].student
                rIdx++
              }

              const noActiveSeats = availSeats.filter(v => !v.isActive)
              studentSeats = [
                ...pairSeatFixedSingleList.reduce((acc, val) => acc.concat(val), []),
                ...pairSeatFixedDoubleList.reduce((acc, val) => acc.concat(val), []),
                ...soloSeatFixedList,
                ...pairSeatList,
                ...soloSeatList,
                ...remainPairSeatList,
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
            }
          }
          this.studentSeats = [...studentSeats]
        },
        async preBatchFinish() {
          let oriList = []
          for(const seatSection of this.oriItem.seatSections) {
            for(const seat of seatSection.seats) {
              oriList.push(seat)
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
          if(this.isActiveCount >= this.studentCount) {
            this.toastMessageModal.open = false
            this.toastMessageModal.message = null
            this.toastMessageModal.bottom = null

            this.toastMessageModal.open = true
            this.toastMessageModal.message = "자리는 학생 수 만큼 활성화 가능합니다."
            this.toastMessageModal.bottom = 88

            setTimeout(() => {
              this.toastMessageModal.open = false
              this.toastMessageModal.message = null
              this.toastMessageModal.bottom = null
            }, 1300);
          } else {
            item.isActive = true
            this.changes = []
            this.isChange = false
          }
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