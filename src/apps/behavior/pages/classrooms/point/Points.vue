<template>
  <div class="class__wrap">
    <div class="class__content" id="point-manage-container">
      <div class="btns">
        <button @click="showPointRewardsPopup(true)">포인트 지급내역</button>
        <button @click="moveReports">리포트 상세</button>
      </div>
      <HiTabs type="type04" size="sm" >
        <HiTab label="포인트 지급" onActive>
          <reward />
        </HiTab>
        <HiTab label="포인트 관리">
          <management />
        </HiTab>
      </HiTabs>
    </div>

    <point-rewards
        v-if="isShowPointRewardsPopup"
        @showPointRewardsPopup="showPointRewardsPopup"
        @deleteStudentPoints="deleteStudentPoints"
    />
  </div>
</template>

<script>
import {mapState} from "vuex";
import {eventBus} from "@/main";
import PointRewards from "@/apps/behavior/components/popup/PointRewards.vue";
import Management from "@/apps/behavior/pages/classrooms/point/ManagementView.vue";
import Reward from "@/apps/behavior/pages/classrooms/point/RewardView.vue";
import { usePointController } from '@/apps/behavior/modules/point';
import { useStudentController } from '@/apps/behavior/modules/student';
const pointController = usePointController();
const studentController = useStudentController();

export default {
  name: "Points",
  components: {
    Reward,
    Management,
    PointRewards
  },
  data() {
    return {
      isShowPointRewardsPopup: false
    }
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    classroomId() {
      return this.curClassroom.classroomId
    }
  },
  methods: {
    showPointRewardsPopup(flag) {
      this.isShowPointRewardsPopup = flag
    },
    moveReports: function() {
      const classroomId = this.$route.params.classroomId
      this.$router.push(`/behavior-records/${classroomId}/reports`)
    },
    deleteStudentPoints() {
      eventBus.$emit('classroom-point-reward-search-students')
    }
  },
  created() {
    pointController.setClassroomId(this.classroomId)
    studentController.setClassroomId(this.classroomId)
  },
  watch: {
    async curClassroom() {
      pointController.setClassroomId(this.classroomId)
      studentController.setClassroomId(this.classroomId)
    }
  }
}
</script>

<style scoped lang="scss">
#point-manage-container {
  position: relative;
  button{
    transition:0.3s;
  }
  .hi-tabs::v-deep .hi-tab.tab-sm{
    padding-bottom: 10px;
    border-bottom:1px solid #E0E0E0;
    margin-bottom: 18px;
    button{
      font-size:16px;
      width:140px;
      background:#fff;
      border-color:#D6D6D6;
      transition:0.3s;
      &:hover{
        background:#fff;
        border-color:rgba(0, 0, 0, 0.4);
      }
    }
    button.is-active{
      background:var(--orange);
      border-color:var(--orange);
      // &:hover{
      //   background:#e87529;
      //   border-color:#e87529;
      // }
    }
  }
  .btns{
    position: absolute;
    top: 14px;
    right: 0;
    button{
      color:#9E9E9E;
      font-size:14px;
      + button{
        margin-left: 10px;
        padding-left: 10px;
        border-left:1px solid #E0E0E0;
      }
      &:hover{
        color:#222;
      }
    }
  }
}

</style>