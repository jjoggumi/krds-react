<template>
    <div
      class="modal normal-modal slick-modal"
      id="seatAddModal"
      style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
          <!-- <div class="modal-cont-inner"
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco"> -->
          <div class="modal-cont-inner">
            <div class="behavior-modal-seating-plan">
              <div class="title-wrap">
                  <h2>자리배치도 
                    <template v-if="isUpdate">
                      설정 
                    </template>
                    <template v-else>
                      만들기
                    </template>
                  </h2>
              </div>
              <div class="content-wrap">
                  <div class="plan-name">
                      <p class="tit">자리배치도 이름
                      </p>
                      <input type="text" :value="item.seatPlanName" placeholder="자리배치도 이름을 입력해주세요." 
                        @input="[removeLeadingSpace($event), inputSeatPlanName($event)]"
                        @keydown="[removeLeadingSpace($event), inputSeatPlanName($event)]"
                        @keyup="[removeLeadingSpace($event), inputSeatPlanName($event)]"
                        maxlength="20"
                      />
                  </div>
                  <div class="plan-type">
                      <p class="tit">대형 유형 선택</p>
                      <div class="plan-type-tab">
                          <button 
                            :class="{
                              active: item.seatPlanType === 'DIVISION'
                            }"
                            @click="onPlanType('DIVISION')"
                          >분단형</button>
                          <button 
                            :class="{
                              active: item.seatPlanType === 'GROUP'
                            }"
                            @click="onPlanType('GROUP')"
                          >모둠형</button>
                          <button 
                            :class="{
                              active: item.seatPlanType === 'FREE'
                            }"
                            @click="onPlanType('FREE')"
                          >자유형</button>
                      </div>
                      <div class="plan-type-con">
                        <template v-if="item.seatPlanType === 'DIVISION'">
                          <!-- 분단 설정 -->
                          <div class="row-set">
                              <p class="tit">분단 설정</p>
                              <p class="smr">*1열은 최대 6분단, 2열은 최대 4분단 까지 생성할 수 있습니다.</p>
                              <div class="shape">
                                  <button class="ea1" 
                                    :class="{
                                      active: item.sectionType === 'SINGLE_COLUMN'
                                    }"
                                    @click="onSectionType('SINGLE_COLUMN')"
                                  >
                                      <ul>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                      </ul>
                                      <p>1열</p>
                                  </button>
                                  <button class="ea2"
                                    :class="{
                                      active: item.sectionType === 'DOUBLE_COLUMN'
                                    }"
                                    @click="onSectionType('DOUBLE_COLUMN')"
                                  >
                                      <ul>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                          <li></li>
                                      </ul>
                                      <p>2열</p>
                                  </button>
                                  <div class="ctr">
                                      <button class="minus" @click="onSectionCount('minus')">
                                          <i class="bh-icon-circle-minus-20"></i>
                                      </button>
                                      <span>{{ item.sectionCount }}</span>
                                      <button class="plus" @click="onSectionCount('plus')">
                                          <i class="bh-icon-circle-plus-20"></i>
                                      </button>
                                      <p>분단</p>
                                  </div>
                              </div>
                          </div>
                          <!-- 짝꿍 설정 -->
                          <div class="buddy-set">
                              <p class="tit">짝꿍 설정</p>
                              <p class="smr">*자리 자동배치 시 짝꿍의 성별을 설정할 수 있습니다.</p>
                              <div class="shape">
                                  <button class="random" 
                                    :class="{
                                      active: item.pairingType === 'RANDOM' && !isSingleCloumn
                                    }"
                                    :disabled="isSingleCloumn"
                                    @click="isSingleCloumn ? null : onPairingType('RANDOM')"
                                  >
                                      <i class="bh-icon-mate-random"></i>
                                      <p>랜덤</p>
                                  </button>
                                  <button class="same"
                                    :class="{
                                      active: item.pairingType === 'GENDER_DIFFERENT'
                                    }"
                                    :disabled="isSingleCloumn"
                                    @click="isSingleCloumn ? null : onPairingType('GENDER_DIFFERENT')"
                                  >
                                      <i class="bh-icon-mate-1"></i>
                                      <p>이성끼리</p>
                                  </button>
                                  <button class="diff"
                                    :class="{
                                      active: item.pairingType === 'GENDER_SAME'
                                    }"
                                    :disabled="isSingleCloumn"
                                    @click="isSingleCloumn ? null : onPairingType('GENDER_SAME')"
                                  >
                                      <i class="bh-icon-mate-2"></i>
                                      <p>동성끼리</p>
                                  </button>
                              </div>
                              <p class="check">
                                  <input type="checkbox" id="seat-add-buddy-change" v-model="item.avoidPreviousPartner" 
                                    :disabled="isSingleCloumn"
                                  />
                                  <label for="seat-add-buddy-change">
                                      <span>이전 짝꿍과 같이 안 앉기</span>
                                  </label>
                              </p>
                          </div>
                        </template>

                        <template v-else-if="item.seatPlanType === 'GROUP'">
                          <!-- 모둠 설정 -->
                          <div class="group-set">
                            <p class="tit">모둠 설정</p>
                            <p class="smr">*모둠에 포함할 인원수를 선택해주세요.</p>
                            <div class="shape">
                                <button class="ea3"
                                  :class="{
                                    active: item.sectionType === 'GROUP_THREE_PERSON'
                                  }"
                                  @click="onSectionType('GROUP_THREE_PERSON')"
                                >
                                    <ul>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                    </ul>
                                    <p>3인</p>
                                </button>
                                <button class="ea4"
                                  :class="{
                                    active: item.sectionType === 'GROUP_FOUR_PERSON'
                                  }"
                                  @click="onSectionType('GROUP_FOUR_PERSON')"
                                >
                                    <ul>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                    </ul>
                                    <p>4인</p>
                                </button>
                                <button class="ea5"
                                  :class="{
                                    active: item.sectionType === 'GROUP_FIVE_PERSON'
                                  }"
                                  @click="onSectionType('GROUP_FIVE_PERSON')"
                                >
                                    <ul>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                    </ul>
                                    <p>5인</p>
                                </button>
                                <button class="ea6"
                                  :class="{
                                    active: item.sectionType === 'GROUP_SIX_PERSON'
                                  }"
                                  @click="onSectionType('GROUP_SIX_PERSON')"
                                >
                                    <ul>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                    </ul>
                                    <p>6인</p>
                                </button>
                            </div>
                            <p class="check">
                                <input type="checkbox" id="seat-add-group-add" v-model="item.isMergeRemaining" />
                                <label for="seat-add-group-add">
                                    <span>남는 학생은 기존 모둠에 합하기</span>
                                </label>
                                <span class="tooltip-wrap">
                                    <i></i>
                                    <span class="tooltip-con">
                                        *설정한 모둠 인원수로 학생 수가 딱 나눠지지 않는 경우, 일부 모둠의 인원수를
                                        늘려서 대형을 생성합니다.<br />
                                        ex) 학생 18명, 모둠 4인으로 설정 > 4인 모둠 2개, 5인 모둠 2개 생성
                                    </span>
                                </span>
                            </p>
                          </div>
                          <!-- 짝꿍 설정 -->
                          <div class="buddy-set">
                            <p class="tit">짝꿍 설정</p>
                            <p class="smr">*자리 자동배치 시 짝꿍의 성별을 설정할 수 있습니다.</p>
                            <div class="shape">
                                <button class="random"
                                  :class="{
                                    active: item.pairingType === 'RANDOM'
                                  }"
                                  @click="onPairingType('RANDOM')"
                                >
                                    <i class="bh-icon-mate-random"></i>
                                    <p>랜덤</p>
                                </button>
                                <button class="same"
                                  :class="{
                                    active: item.pairingType === 'GENDER_DIFFERENT'
                                  }"
                                  @click="onPairingType('GENDER_DIFFERENT')"
                                >
                                    <i class="bh-icon-mate-1"></i>
                                    <p>이성끼리</p>
                                </button>
                                <button class="diff"
                                  :class="{
                                    active: item.pairingType === 'GENDER_SAME'
                                  }"
                                  @click="onPairingType('GENDER_SAME')"
                                >
                                    <i class="bh-icon-mate-2"></i>
                                    <p>동성끼리</p>
                                </button>
                            </div>
                            <p class="check">
                                <input type="checkbox" id="seat-add-buddy-change"  v-model="item.avoidPreviousPartner" />
                                <label for="seat-add-buddy-change">
                                    <span>이전 짝꿍과 같이 안 앉기</span>
                                </label>
                            </p>
                          </div>
                        </template>

                        <template v-else-if="item.seatPlanType === 'FREE'">
                          <!-- 자유형 설정 -->
                          <div class="free-set">
                            <div class="txt">
                                <p class="tit">자유 대형 설정</p>
                                <p class="smr">
                                    *대형 안에서 학생의 자리를 자유롭게 설정할 수 있습니다. <br />사용할 자리를
                                    선택해주세요.
                                </p>
                            </div>
                            <div class="shape">
                              <div class="tit">
                                  <p>칠판</p>
                                  <!-- 여기 작업 -->
                                  <span><em>{{seatIsActiveCount}}</em> / 56</span>
                              </div>
                              <div class="area">
                                  <!-- 클릭시 isActive값 변하게 -->
                                  <button v-for="seat of item.seatSections[0].seats" 
                                    :key="`button-seat-${seat.seatRow}-${seat.seatColumn}`"
                                    type="button"
                                    :class="{
                                      on: seat.isActive
                                    }"                                    
                                    @click="seatIsActive(seat)"
                                  >
                                  </button>
                              </div>
                            </div>
                          </div>
                        </template>
                      </div>
                  </div>
                  <div class="plan-type-effect">
                      <p class="tit">자리배치 결과보기 효과 선택</p>
                      <p class="check">
                          <input type="radio" name="list-count" id="seat-effectOne" 
                            v-model="item.viewMode"
                            value="SINGLE_VIEW"
                          />
                          <label for="seat-effectOne"><span>한 명씩 보기</span></label>
                      </p>
                      <p class="check">
                          <input type="radio" name="list-count" id="seat-effectAll" 
                            v-model="item.viewMode"
                            value="FULL_VIEW"
                          />
                          <label for="seat-effectAll"><span>한 번에 보기</span></label>
                      </p>
                  </div>
              </div>
              <div class="btn-wrap">
                  <button class="reg" @click="submit"
                    :disabled="!isSubmit"
                  >만들기</button>
              </div>
              <div class="modal-close-btn" @click="close"></div>
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
          :isAlert="confirmModal.isAlert"
          @closeConfirmDialog="closeConfirmModal"
      />
      <confirm-modal2
          v-if="confirmModal2.isOpen"
          :title="confirmModal2.title"
          :description="confirmModal2.description"
          :confirmButtonText="confirmModal2.confirmButtonText"
          :confirmButtonColor="confirmModal2.confirmButtonColor"
          :isAlert="confirmModal2.isAlert"
          @closeConfirmDialog="closeConfirmModal2"
      />
    </div>
</template>

<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal.vue'
import ConfirmModal2 from '@/apps/behavior/components/popup/ConfirmModal.vue'

export default {
    name: 'seat-add-modal',
    props: {
      updateItem: Object,
      isReBatchChangeSutdent: Boolean
    },
    components: {
      ConfirmModal,
      ConfirmModal2
    },
    data() {
        return {
          item: {
            seatPlanName: null,
            seatPlanType: "DIVISION", // DIVISION(분단), GROUP(모둠), FREE(자유)
            sectionCount: 3,
            sectionType: "DOUBLE_COLUMN", // section 타입 ( SINGLE_COLUMN(1열), DOUBLE_COLUMN(2열), GROUP_THREE_PERSON(3인 모둠), GROUP_FOUR_PERSON, GROUP_FIVE_PERSON, GROUP_SIX_PERSON, FREE_LAYOUT(자유형) )
            pairingType: "RANDOM",  // 짝궁 설정 유형 ( RANDOM, GENDER_SAME, GENDER_DIFFERENT)
            avoidPreviousPartner: false, // 이전 짝궁이랑 안앉기 여부
            isMergeRemaining: true,   //좌석 배치 못받은 학생 모둠에 합하기 여부
            viewMode: "SINGLE_VIEW", // 변경된 자리 표현 효과 ( SINGLE_VIEW(한명씩보기), FULL_VIEW(한번에보기) )
            seatSections: []
          },
          isSubmitClick: false,
          confirmModal: {
            isOpen: false,
            title: '',
            description: '',
            confirmButtonText: '',
            confirmButtonColor: '',
            action: '',
            isAlert: false
          },
          confirmModal2: {
            isOpen: false,
            title: '',
            description: '',
            confirmButtonText: '',
            confirmButtonColor: '',
            action: '',
            isAlert: false
          },
        }
    },
    computed: {
      ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
        seatPlans: 'seatPlans',
      }),
      classroomId: function() {
        return this.curClassroom.classroomId
      },
      isUpdate() {
        return this.updateItem.seatPlanId ? true : false
      },
      isSubmit() {
        return !this.item.seatPlanName ? false : this.item.seatPlanName.trim() ? true : false
      },
      isSingleCloumn() {
        return this.item.sectionType === 'SINGLE_COLUMN'
      },
      seatIsActiveCount(){
        return this.item.seatSections[0].seats.filter((seat) => seat.isActive).length;
      },
      seatPlanCount() {
        return this.seatPlans.length
      },
      basicTitle() {
        const month = new Date().getMonth() + 1
        const day = new Date().getDate()
        
        return `${day > 15 ? month+1 : month}월 자리배치도 (${this.seatPlanCount+1})`
      }
    },
    methods: {
      ...mapActions('storeBehavior', {
        getClassroomStudents: 'getClassroomStudents',
        addSeatPlan: 'addSeatPlan',
        resetSeatPlan: 'resetSeatPlan',
        updateSeatPlan: 'updateSeatPlan',
        patchStudentHidden: 'patchStudentHidden',
      }),
      inputSeatPlanName(e) {
        this.item.seatPlanName = e.target.value.substr(0, 20)
      },
      async onPlanType(menu) {
        if(menu === "DIVISION") {
          this.item.seatPlanType = menu
          this.item.sectionType = "DOUBLE_COLUMN"
          this.item.pairingType = 'RANDOM'
          this.item.isMergeRemaining = false
          this.item.seatSections = []
          this.item.sectionCount = 3
        } else if(menu === "GROUP") {
          this.item.seatPlanType = menu
          this.item.sectionType = "GROUP_FOUR_PERSON"
          this.item.pairingType = 'RANDOM'
          this.item.isMergeRemaining = true
          this.item.seatSections = []
          this.item.sectionCount = 1
        } else if(menu === "FREE") {
          this.isSubmitClick = false
          this.item.sectionType = "FREE_LAYOUT"

          if(this.isUpdate && this.updateItem.seatPlanType === "FREE") {
            this.item.seatSections = _.cloneDeep(this.updateItem.seatSections)
          } else {
            this.item.seatSections = []
            const seats = []
            let seatRow = 0
            let seatColumn = 1
            for(let i = 0;i<56;i++) {
              if(i%8 === 0) {
                seatRow++
                seatColumn = 1
              } else {
                seatColumn++
              }

              seats.push({
                studentId: null,
                seatRow: seatRow,
                seatColumn: seatColumn,
                isActive: i === 0 ? true : false
              })
            }

            this.item.seatSections.push({
              seatSectionName: '자유',
              seatSectionNo: 1,
              seats: seats
            })
          }

          this.item.seatPlanType = menu
          this.item.pairingType = null
          this.item.isMergeRemaining = false
          this.item.sectionCount = 1
        }

        // this.initItem(menu)
        this.item.avoidPreviousPartner = false
      },
      initItem(menu) {
        if(menu === "DIVISION") {
          this.item.pairingType = null
          this.item.isMergeRemaining = false
          this.item.seatSections = []
          this.item.sectionCount = 3
        } else if(menu === "GROUP") {
          this.item.pairingType = 'RANDOM'
          this.item.isMergeRemaining = true
          this.item.seatSections = []
          this.item.sectionCount = 1
        } else if(menu === "FREE") {
          this.item.pairingType = null
          this.item.isMergeRemaining = false
          this.item.sectionCount = 1
        }

        this.item.avoidPreviousPartner = false
      },
      onSectionType(menu) {
        this.item.sectionType = menu

        if(menu === "SINGLE_COLUMN") {
          this.item.pairingType = null
          this.item.avoidPreviousPartner = false
          this.item.sectionCount = 3
        } else if(menu === "DOUBLE_COLUMN") {
          this.item.pairingType = 'RANDOM'
          this.item.avoidPreviousPartner = false
          this.item.sectionCount = 3
        }
      },
      onSectionCount(data) {
        let sectionMaxCount = 6

        if(this.item.sectionType === "DOUBLE_COLUMN") {
          sectionMaxCount = 4
        }

        if(data === "minus") {
          if(this.item.sectionCount > 1) {
            this.item.sectionCount--
          }
        } else {
          if(this.item.sectionCount < sectionMaxCount) {
            this.item.sectionCount++
          }
        }
      },
      onPairingType(menu) {
        this.item.pairingType = menu
      },
      createSeatSections() {
        let sectionName = ""
        if(this.item.seatPlanType === "DIVISION") {
          sectionName = "분단"
        } else if(this.item.seatPlanType === "GROUP") {
          sectionName = "모둠"
        }

        for(let i = 0;i<this.item.sectionCount;i++) {
          let sort = i + 1
          this.item.seatSections.push({
            seatSectionName: `${sectionName}${this.item.seatPlanType === "FREE" ? "" : sort}`,
            seatSectionNo: sort,
            seats: []
          })
        }
      },
      getSeatSectionSeatRowCol(len) {
        let seatColumn = 0
        let seatRow = 0
        if(len === 0) {
          seatColumn = 1
          seatRow = 1
        } else if(len === 1) {
          seatColumn = 2
          seatRow = 1
        } else if(len === 2) {
          seatColumn = 1
          seatRow = 2
        } else if(len === 3) {
          seatColumn = 2
          seatRow = 2
        } else if(len === 4) {
          seatColumn = 1
          seatRow = 3
        } else if(len === 5) {
          seatColumn = 2
          seatRow = 3
        }

        return {
          seatColumn: seatColumn,
          seatRow: seatRow
        }
      },      
      seatIsActive(seat) {      
        seat.isActive = !seat.isActive;
      },
      async submit() {
        if(this.isSubmitClick) return

        this.isSubmitClick = true
        const params = {classroomId: this.classroomId, isHidden: false, isIncludePoint: true}
        const students = await this.getClassroomStudents(params)  
        if(this.item.seatPlanType === "DIVISION") {              
          this.item.seatSections = []
          this.createSeatSections()
          let checkAvailCount = 0
          if(this.item.sectionType === "SINGLE_COLUMN") {
            // 8행까지 
            const maxStudentCount = this.item.sectionCount * 8
            let row = 0
            let col = 1
            for(let i = 0;i<maxStudentCount;i++) {
              let sectionNo = i % this.item.sectionCount

              if(sectionNo === 0) {
                row++
              }

              if(students[i] || sectionNo !== 0) {
                this.item.seatSections[sectionNo].seats.push({
                  studentId: null,
                  seatRow: row,
                  seatColumn: col,
                  isActive: students[i] ? true : false
                })
                checkAvailCount++
              } else {
                break
              }
            }

            if(maxStudentCount !== 48) {
              if(checkAvailCount < students.length) {
                this.openConfirmModal("seatStudentCount")
                this.isSubmitClick = false
                return
              }
            } else {
              let check = this.changeCheck()
              if(!(this.isUpdate && !check)) {
                if(checkAvailCount < students.length) {
                  this.openConfirmModal("seatCountCheck")
                  this.isSubmitClick = false
                  return
                }
              }
            }
          } else {
            // 7행까지 
            const rowCount = 2  // 열안에 숫자가 변경될시 이 숫자만 변경해주면 된다
            const maxStudentCount = this.item.sectionCount * (7 * rowCount)
            let row = 0
            let col = 1
            let sectionNo = 0
            for(let i = 0;i<maxStudentCount;i++) {
              if(i % rowCount === 0) {
                sectionNo = (i / rowCount) % this.item.sectionCount
                if(sectionNo === 0) {
                  row++
                }
                col = 1
              } else {
                col++
              }
              
              if(sectionNo === 0 && col === 1 && !students[i]) break

              this.item.seatSections[sectionNo].seats.push({
                studentId: null,
                seatRow: row,
                seatColumn: col,
                isActive: students[i] ? true : false
              })
              checkAvailCount++
            }

            if(maxStudentCount !== 56) {
              if(checkAvailCount < students.length) {
                this.openConfirmModal("seatStudentCount")
                this.isSubmitClick = false
                return
              }
            } else {
              let check = this.changeCheck()
              if(!(this.isUpdate && !check)) {
                if(checkAvailCount < students.length) {
                  this.openConfirmModal("seatCountCheck")
                  this.isSubmitClick = false
                  return
                }
              }
            }
          }
        } else if(this.item.seatPlanType === "GROUP") {              
          this.item.seatSections = []
          let countInSeat = 0
          let sectionCount = 0
          let remainCount = 0
          if(this.item.sectionType === "GROUP_THREE_PERSON") {
            countInSeat = 3
          } else if(this.item.sectionType === "GROUP_FOUR_PERSON") {
            countInSeat = 4
          } else if(this.item.sectionType === "GROUP_FIVE_PERSON") {
            countInSeat = 5
          } else if(this.item.sectionType === "GROUP_SIX_PERSON") {
            countInSeat = 6
          }

          if(this.item.isMergeRemaining && this.item.sectionType !== "GROUP_SIX_PERSON") {
            sectionCount = Math.floor(students.length / countInSeat)
            if(sectionCount === 0) {
              sectionCount = 1
              if(students.length > countInSeat) {
                remainCount = students.length % countInSeat
              } else {
                remainCount = 0
              }
            } else {  
              remainCount = students.length % countInSeat
            }
          } else {
            sectionCount = Math.floor(students.length / countInSeat) + (students.length % countInSeat > 0 ? 1 : 0)
          }
          this.item.sectionCount = sectionCount
          this.createSeatSections()

          let stdIdx = 0
          for(const seatSection of this.item.seatSections) {
            // let col = 0
            // let row = 1

            let row = 0
            let col = 1
            // let count = countInSeat % 2 === 0 ? countInSeat : countInSeat + 1
            let count = countInSeat

            for(let i = 0;i<count;i++) {
              if(i%2 === 0) {
                row++
                col = 1
              } else {
                col++
              }

              seatSection.seats.push({
                studentId: null,
                seatRow: row,
                seatColumn: col,
                isActive: students[stdIdx] ? true : false
              })
              stdIdx++
            }

          }

          if(remainCount>0) {
            let sectionIdx = this.item.seatSections.length-1
            while(remainCount > 0) {
              if(sectionIdx<0) sectionIdx = this.item.seatSections.length-1

              const seatLength = this.item.seatSections[sectionIdx].seats.length
              if(seatLength >= 6) break

              const position = this.getSeatSectionSeatRowCol(seatLength)
              this.item.seatSections[sectionIdx].seats.push({
                studentId: null,
                seatRow: position.seatRow,
                seatColumn: position.seatColumn,
                isActive: true
              })

              remainCount--
              sectionIdx--
            }
            
            if(remainCount>0) {
              this.item.sectionCount++
              
              const seats = []
              for(let i = 0;i<6;i++) {
                const position = this.getSeatSectionSeatRowCol(i)
                seats.push({
                  studentId: null,
                  seatRow: position.seatRow,
                  seatColumn: position.seatColumn,
                  isActive: i < remainCount ? true : false
                })
              }

              this.item.seatSections.push({
                seatSectionName: `모둠${this.item.sectionCount}`,
                seatSectionNo: this.item.sectionCount,
                seats: seats
              })
            }
          }
          
          // this.item.seatSections 페어링 
          let seatMaxCount = this.item.seatSections[0].seats.length
          for(let i = 0;i<this.item.seatSections.length;i++) {
            if(this.item.seatSections[i].seats.length % 2 !== 0) {
              const position = this.getSeatSectionSeatRowCol(this.item.seatSections[i].seats.length)
            
              this.item.seatSections[i].seats.push({
                studentId: null,
                seatRow: position.seatRow,
                seatColumn: position.seatColumn,
                isActive: false
              })
            }

            if(this.item.seatSections[i].seats.length > seatMaxCount) {
              seatMaxCount = this.item.seatSections[i].seats.length
            }
          }
          
          for(const seatSection of this.item.seatSections) {
            if(seatSection.seats.length < seatMaxCount) {
              let addList = []
              for(let i = seatSection.seats.length;i<seatMaxCount;i++) {
                const position = this.getSeatSectionSeatRowCol(i)
                addList.push({
                  studentId: null,
                  seatRow: position.seatRow,
                  seatColumn: position.seatColumn,
                  isActive: false
                })
              }

              seatSection.seats = [...seatSection.seats, ...addList]
            }
          }
        } else if(this.item.seatPlanType === "FREE") {
          this.item.sectionCount = 1
          const studentsLength = students.length > 56 ? 56 : students.length
          if(this.seatIsActiveCount < studentsLength){ 
              this.openConfirmModal("seatStudentCount")
              this.isSubmitClick = false
              return
          }
        }
        
        if(this.isUpdate) {
          this.submitUpdateCheck()
        } else {
          this.submitAdd()
        }
      },
      async seatCountCheckSubmitReset() {
        const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay))
        await wait(500)
        if(this.isUpdate) {
          this.submitUpdateCheck()
        } else {
          this.submitAdd()
        }
      },
      changeCheck() {
        let check = false
        if(this.updateItem.seatPlanType !== this.item.seatPlanType) {
          check = true
        } else {
          if((this.updateItem.sectionType !== this.item.sectionType) || this.updateItem.sectionCount !== this.item.sectionCount) {
            check = true
          }

          if(this.updateItem.isMergeRemaining !== this.item.isMergeRemaining) {
            check = true
          }
        }

        if(this.item.seatPlanType === "FREE") {
          const seats = this.item.seatSections[0].seats
          const oriSeats = this.updateItem.seatSections[0].seats

          if(!check) {
            for(const seat of seats) {
              const oriSeat = oriSeats.find(v => v.seatId === seat.seatId)

              if(seat.isActive !== oriSeat.isActive) {
                check = true
                break
              }
            }
          }
        }

        return check
      },
      async submitUpdateCheck() {
        if(this.isReBatchChangeSutdent) {
          this.openConfirmModal('changeSeatPlan')
          return
        }

        let check = this.changeCheck()

        if(check) {
          this.openConfirmModal2('changeSeatPlan')
        } else {
          this.submitUpdate()
        }
      },
      async submitReset() {
        if(this.item.seatPlanType === "FREE") {
          const seats = this.item.seatSections[0].seats.map(item => {
            return {
              studentId: null,
              seatRow: item.seatRow,
              seatColumn: item.seatColumn,
              isActive: item.isActive
            }
          })

          this.item.seatSections[0] = {
            seatSectionName: '자유',
            seatSectionNo: 1,
            seats: seats
          }
        }

        try {
          const hiddenParams = {
            classroomId: this.classroomId,
            seatPlanId: this.updateItem.seatPlanId,
            version: this.updateItem.version,
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

          const params = {
            classroomId: this.classroomId,
            seatPlanId: this.updateItem.seatPlanId,
            version: this.updateItem.version,
            data: this.item
          }
          
          const res = await this.resetSeatPlan(params)
          const data = {
            seatPlanName: this.item.seatPlanName,
            seatPlanId: res.data.seatPlanId,
            version: res.data.version
          }
          this.$emit("submit", data, 'reset')
        } catch(err) {
          this.$log.debug('submitReset submit PUT() error => ', err)
        } finally {
          this.isSubmitClick = false
        }
      },
      async submitUpdate() {
        try {
          const data = {
            seatPlanName: this.item.seatPlanName,
            pairingType: this.item.pairingType,
            avoidPreviousPartner: this.item.avoidPreviousPartner,
            viewMode: this.item.viewMode,
          }
          const params = {
            classroomId: this.classroomId,
            seatPlanId: this.updateItem.seatPlanId,
            version: this.updateItem.version,
            data: {
              seatPlanName: this.item.seatPlanName,
              pairingType: this.item.pairingType,
              avoidPreviousPartner: this.item.avoidPreviousPartner,
              viewMode: this.item.viewMode,
            }
          }
          const res = await this.updateSeatPlan(params)
          this.$emit("submit", data, 'update')
        } catch(err) {
          this.$log.debug('submitUpdate submit PUT() error => ', err)
        } finally {
          this.isSubmitClick = false
        }
      },
      async submitAdd() {
        try {
          const params = {
            classroomId: this.classroomId,
            data: this.item
          }
          const res = await this.addSeatPlan(params)

          if(res.status === 428) {
            if(res.data.error === "SeatPlanGenerationLimitExceeded") {
              this.$hiClass.alert('자리배치도는 최대 10개까지 생성가능합니다.', 'error')
            }
            this.close()
          } else {
            const data = {
              beforeVersion: null,
              ...res.data
            }
            this.$emit("submit", data, 'add')
          }
        } catch(err) {
          this.$log.debug('seatAddModal submit POST() error => ', err)
        } finally {
          this.isSubmitClick = false
        }
      },
      removeLeadingSpace(e) {
        const str = e.target.value
        if (str.charAt(0) === ' ') {
          e.target.value = str.slice(1)
          this.item.seatPlanName = str.slice(1)
        }
      },
      close() {
        this.$emit("close")
      },
      openConfirmModal: function(action) {
        this.confirmModal = {...this.confirmModal, action}

        let title = `대형 (분단/모둠)을 변경하면<br/>현재 <span style='color: #f04f59;'>학생자리배치가 모두 초기화</span>됩니다.`
        if(this.item.seatPlanType === "FREE") {
          title = `대형을 변경하면<br/>현재 <span style='color: #f04f59;'>학생자리배치가 모두 초기화</span>됩니다.`
        }
        switch(action) {
            case 'changeSeatPlan' :
                this.confirmModal.title = title
                this.confirmModal.confirmButtonText = '대형 변경'
                this.confirmModal.confirmButtonColor = '#ff8737'
            break;

            case 'seatStudentCount' :
                this.confirmModal.title = '선택한 자리가 학생수보다 적습니다.<br/>다시 선택하세요.'
                this.confirmModal.confirmButtonText = '확인'
                this.confirmModal.confirmButtonColor = '#ff8737'
                this.confirmModal.isAlert = true
            break;

            case 'seatCountCheck' :
                this.confirmModal.title = '자리배치는 1열 최대 48명, 2열 최대 56명까지만 가능합니다.'
                this.confirmModal.confirmButtonText = '확인'
                this.confirmModal.confirmButtonColor = '#ff8737'
                this.confirmModal.isAlert = true
            break;
        }
        this.confirmModal = {...this.confirmModal, isOpen: true}
      },
      openConfirmModal2: function(action) {
        this.confirmModal2 = {...this.ConfirmModal2, action}

        let title = `대형 (분단/모둠)을 변경하면<br/>현재 <span style='color: #f04f59;'>학생자리배치가 모두 초기화</span>됩니다.`
        if(this.item.seatPlanType === "FREE") {
          title = `대형을 변경하면<br/>현재 <span style='color: #f04f59;'>학생자리배치가 모두 초기화</span>됩니다.`
        }
        switch(action) {
            case 'changeSeatPlan' :
                this.confirmModal2.title = title
                this.confirmModal2.confirmButtonText = '대형 변경'
                this.confirmModal2.confirmButtonColor = '#ff8737'
            break;

            case 'seatStudentCount' :
                this.confirmModal2.title = '선택한 자리가 학생수보다 적습니다.<br/>다시 선택하세요.'
                this.confirmModal2.confirmButtonText = '확인'
                this.confirmModal2.confirmButtonColor = '#ff8737'
                this.confirmModal2.isAlert = true
            break;

            case 'seatCountCheck' :
                this.confirmModal2.title = '자리배치는 1열 최대 48명, 2열 최대 56명까지만 가능합니다.'
                this.confirmModal2.confirmButtonText = '확인'
                this.confirmModal2.confirmButtonColor = '#ff8737'
                this.confirmModal2.isAlert = true
            break;
        }
        this.confirmModal2 = {...this.confirmModal2, isOpen: true}
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
            case 'changeSeatPlan' :
                await this.submitReset()
            break;

            case 'seatCountCheck' :
                await this.seatCountCheckSubmitReset()
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
      closeConfirmModal2: async function(isConfirm) {
        this.isSubmitClick = false

        if(!isConfirm) {
            this.confirmModal2 = {
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

        switch(this.confirmModal2.action) {
            case 'changeSeatPlan' :
                await this.submitReset()
            break;

            case 'seatCountCheck' :
                await this.seatCountCheckSubmitReset()
            break;
        }

        this.confirmModal2 = {
            isOpen: false,
            title: '',
            description: '',
            confirmButtonText: '',
            confirmButtonColor: '',
            action: '',
            isAlert: false
        }
      },
    },
    created() {
    },
    mounted() {
      if(this.isUpdate) {
        this.item.seatPlanName = this.updateItem.seatPlanName
        this.item.seatPlanType = this.updateItem.seatPlanType 
        this.item.sectionCount = this.updateItem.sectionCount
        this.item.sectionType = this.updateItem.sectionType
        this.item.pairingType = this.updateItem.pairingType
        this.item.avoidPreviousPartner = this.updateItem.avoidPreviousPartner
        this.item.isMergeRemaining = this.updateItem.isMergeRemaining
        this.item.viewMode = this.updateItem.viewMode

        if(this.updateItem.seatPlanType === "FREE") {
          this.item.seatSections = _.cloneDeep(this.updateItem.seatSections)
        }
      } else{
        this.item.seatPlanName = this.basicTitle
      }
    }
}
</script>