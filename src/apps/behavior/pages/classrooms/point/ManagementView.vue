<template>
  <div class="point-manage">
    <point-list-card :isNegative="false" ref="goodPoint"/>
    <point-list-card :isNegative="true" ref="badPoint"/>
  </div>
</template>

<script>
import PointListCard from "@/apps/behavior/components/list/PointListCard.vue";
import {mapState} from "vuex";
import {usePointController} from "@/apps/behavior/modules/point";
const pointController = usePointController();

export default {
  name: "ManagementView",
  components: {
    PointListCard
  },
  data() {
    return {
      searchParams: {},
      isAllDataLoaded: false
    }
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom'])
  },
  methods: {
    initParams() {
      this.isAllDataLoaded = false
      this.searchParams = {
        userId: this.$store.state.user.currentId,
        size: 20,
        page: 0,
        isNegative: null
      }
    },
    async loadAllPoints() {
      while (!this.isAllDataLoaded) {
        this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
        this.searchParams.page++
      }
    }
  },
  async mounted() {
    this.initParams()
    await this.loadAllPoints()
  },
  watch: {
    async curClassroom() {
      this.initParams()
      await this.loadAllPoints()
    }
  }
}
</script>

<style scoped>
.point-manage{
    width: 100%;
    min-height: calc(100vh - 232px);
    display: flex;
    justify-content: space-between;
}
@media screen and (max-width: 1370px) {
  .point-manage {
    flex-wrap: wrap;
  }
} 
</style>