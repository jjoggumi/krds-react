<template>
  <div class="plan-type" ref="planType">
    <div class="plan-type-inner">
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
                            'no-profile': !showProfileImage || !(seat.student && seat.student.character)
                          }"                         
                          @click="!seat.isFixed ? onClickInfo($event, seat) : seatFixedMsg()"
                        >
                          <template v-if="!isHidden">
                            <template v-if="seat.student">
                              <span class="num">{{ seat.student.studentNo }}</span>
                              <div
                                v-if="showProfileImage"
                                class="profile"
                                :checked="seat.checked"
                              >
                                <div :class="getProfileImageClass(seat.student)">
                                  <img
                                      :src="getProfileImage(seat.student)"
                                      alt="썸네일"
                                      @load="onProfileImageLoad(seat.student.studentId, $event)"
                                  />
                                </div>
                              </div>
                              <p class="name" v-if="seat.student">
                                {{ seat.student.studentName }}
                              </p>
                            </template>
                          </template>
                        </button>
                        <button type="button" class="hold-icon icon-unlock-fill" @click="onActive(seat)"></button>
                        <button type="button" class="fixed-icon"  v-if="seat.student && !isHidden" @click="isSeatFixed(seat)"></button>
                    </li>
                </ul>
            </li>
        </ul>
    </div>

    <toast-type01 
      v-if="toastMessageModal.open === true"
      :item="toastMessageModal"
    />
  </div>
</template>

<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import ToastType01 from '@/apps/behavior/components/toast/ToastType01.vue'
import SeatPlansMixin from "@/apps/behavior/mixins/SeatPlansMixin.vue";

export default {
    name: 'seat-plans-free',
    props: {
      detail: Object,
      studentCount: Number
    },
    components: {
      ToastType01
    },
    mixins: [SeatPlansMixin],
    data() {
        return {
          item: {},
          changes: [],
          isChange: false,
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
          timer: null
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
      isActiveCount() {
        let count = 0

        for(const seatSection of this.item.seatSections) {
          for(const seat of seatSection.seats) {
            if(seat.isActive) count++
          }
        }

        return count
      },
      isHidden() {
        // return this.item.isStudentHidden
        return false
      }
    },
    watch: {
      classroomId() {
        this.getSeatPlanList()
      },
      detail(v) {
          this.item = _.cloneDeep(v)
          this.setRoate()
          this.$nextTick(() => {
              this.viewSizing()
          })
      },
    },
    methods: {
      ...mapActions('storeBehavior', {
        patchStudentSeat: 'patchStudentSeat',
      }),
      ...mapMutations('storeBehavior', {
        setSeatActiveCount: 'setSeatActiveCount'
      }),
      getSeatKey(index) {
        const key = `${index}${Math.floor(1000 + Math.random() * 9000)}`
        return key
      },
      async onPatchManual() {
        let version = this.item.version

        if(this.item.isStudentHidden) {
          version = version - 1
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

        const studentSeats = []
        for(const seatSection of this.item.seatSections) {
          for(const seat of seatSection.seats) {
            studentSeats.push({
              seatId: seat.seatId,
              studentId: seat.student ? seat.student.studentId : null,
              isFixed: seat.isFixed,
              isActive: seat.isActive
            })
          }
        }

        const params = {
          classroomId: this.classroomId,
          seatPlanId: this.item.seatPlanId,
          version: version,
          studentSeats: studentSeats
        }
        await this.patchStudentSeat(params)
        this.$emit("submit")
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
      viewSizing() {
          const behaviorSeatingPlanEl = document.querySelector('.plan-type');
          const behaviorSeatingPlanInnerEl = document.querySelector('.plan-type .plan-type-inner');
          
          //초기화
          let zoom = 1;
          behaviorSeatingPlanInnerEl.style.zoom = zoom;
          behaviorSeatingPlanEl.classList.remove('group-max');

          const height = behaviorSeatingPlanEl.clientHeight;
          const conHeight = behaviorSeatingPlanInnerEl.clientHeight;
          const width = behaviorSeatingPlanEl.clientWidth;
          const conWidth = behaviorSeatingPlanInnerEl.clientWidth;

          if (width / conWidth >= height / conHeight) {
              zoom = height / conHeight;
          } else {
              zoom = width / conWidth;
          }

          if (zoom > 1) {
              zoom = 1;
          }
          behaviorSeatingPlanInnerEl.style.zoom = zoom;
      },
      // iPad를 감지
      isiPad() {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
      },
      async isSeatFixed(seat){
        seat.isFixed = !seat.isFixed;

        this.toastMessageModal.open = false
        this.toastMessageModal.message = null
        this.toastMessageModal.bottom = null

        if(this.timer) {
          clearTimeout(this.timer)
        }

        const wait = timeToDelay => new Promise(resolve => setTimeout(resolve, timeToDelay))
        await wait(100)

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
        this.setSeatActiveCount(this.isActiveCount)
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
      this.setRoate()
      this.setSeatActiveCount(this.isActiveCount)
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
  .seating-plan-manual {
    .seating-plan-view {
      .plan-student {
        padding: 8px;
        .info {
          .name {
            top: 12px;
          }
          &.no-profile {
            .name {
              top: 0;
            }
          }
        }
      }
    }
  }
</style>