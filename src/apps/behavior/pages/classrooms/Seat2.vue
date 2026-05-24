<template>
  <div class="class__wrap"
    :class="{
      'seating-plan-manual' : seatPlanMode === 'seating-plan-manual',
      'seating-plan-preset' : seatPlanMode === 'seating-plan-preset'
    }"
  >
    <div class="class__content">
      <!-- 자리배치도 컨텐츠 영역  -->

      <template v-if="isEmpty">
        <!-- 자리배치도 만들기 -->
        <div class="seating-plan-add">
            <button class="btn-add" @click="openSeatAdd">
                <i></i>
                <span>자리배치도 만들기</span>
            </button>
        </div>
      </template>

      <template v-else>
        <!-- 자리배치도 컨텐츠 영역  -->
        <seat-plans />
      </template>
    </div>

    <template v-if="!isEmpty">
      <div class="class__badge">
        <template v-if="!isMode">
          <div>
              <span class="reset">
                  <i class="bh-icon-refresh-24"></i>보이는 포인트 초기화
              </span>
              <span class="total"><i class="bh-icon-check-24-gray02"></i>전체선택</span>
          </div>
          <div>
              <button class="who">누가기록</button><button class="effort">노력 지급</button>
              <button class="good">좋음 지급</button>
          </div>
        </template>
      </div>
    </template>

    <seat-add-modal 
      v-if="isOpenSeatAddModal"
        :updateItem="updateItem"
        :isReBatchChangeSutdent="isReBatchChangeSutdent"
        @submit="seatAddSubmit"
        @close="closeSeatAdd"
    />
  </div>
</template>

<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import SeatAddModal from '@/apps/behavior/components/popup/SeatAddModal.vue'
import SeatPlans from '@/apps/behavior/components/list/SeatPlans.vue'

export default {
    name: 'seat',
    props: {
    },
    components: {
      SeatAddModal,
      SeatPlans
    },
    data() {
        return {
          isOpenSeatAddModal: false,
          updateItem: {},
          isReBatchChangeSutdent: false
        }
    },
    computed: {
      ...mapState('storeBehavior', {
        curClassroom: 'curClassroom',
        seatPlans: 'seatPlans',
        seatPlanMode: 'seatPlanMode'
      }),
      classroomId: function() {
        return this.curClassroom.classroomId
      },
      isEmpty: function() {
        return this.seatPlans.length > 0 ? false : true
      },
      isMode: function() {
        return this.seatPlanMode ? true : false
      }
    },
    watch: {
      classroomId() {
        if(this.isEmpty) this.getSeatPlanList()
      }
    },
    methods: {
      ...mapActions('storeBehavior', {
        getSeatPlans: 'getSeatPlans'
      }),
      ...mapMutations('storeBehavior', {
          setSeatPlans: 'setSeatPlans',
          setSeatPlanMode: 'setSeatPlanMode'
      }),
      getSeatPlanList() {
        try {
          this.getSeatPlans({classroomId: this.classroomId})
        } catch (err) {
          this.$log.debug('getSeatPlanList GET() error => ', err)
        }
      },
      openSeatAdd() {
        this.$hiClass.toggleBodyClass('add', 'hidden')
        this.isOpenSeatAddModal = true
      },
      closeSeatAdd() {
        this.$hiClass.toggleBodyClass('remove', 'hidden')
        this.isOpenSeatAddModal = false
      },
      seatAddSubmit(data) {
        const list = [data]
        this.setSeatPlans(list)
        this.closeSeatAdd()
      },
    },
    created() {
    },
    mounted() {
      this.getSeatPlanList()
      this.setSeatPlanMode(null)
    }
}
</script>