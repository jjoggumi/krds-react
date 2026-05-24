<template>
  <seat-plans-empty v-if="isEmpty" class="seating-plan-view-wrap" />
  <seat-plans v-else  class="seating-plan-view-wrap" />
</template>

<script>
import {mapActions, mapState, mapMutations} from 'vuex'
import SeatPlans from '@/apps/behavior/components/list/SeatPlans.vue'
import SeatPlansEmpty from '@/apps/behavior/components/list/SeatPlansEmpty.vue'

export default {
    name: 'seat',
    props: {
    },
    components: {
      SeatPlans,
      SeatPlansEmpty
    },
    data() {
        return {
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
          setSeatPlanMode: 'setSeatPlanMode'
      }),
      getSeatPlanList() {
        try {
          this.getSeatPlans({classroomId: this.classroomId})
        } catch (err) {
          this.$log.debug('getSeatPlanList GET() error => ', err)
        }
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