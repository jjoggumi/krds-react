<template>
  <div class="point-wrap">
    <div class="filter">
      <HiSelectBox
          :value="searchParams.isNegative"
          :items="pointTypeItem"
          @update:value="setPointTypeSelected($event)"
          :empty-title="'전체'"
          class="sort-box-wrap"
      />
    </div>
    <div
        ref="pointListDiv"
        class="point-list custom-scr"
        v-infinite-scroll="onScroll"
        :infinite-scroll-disabled="isAllDataLoaded"
        :infinite-scroll-distance="50"
        infinite-scroll-immediate-check="false"
    >
      <point-item
          v-for="(item, idx) of pointList" :key="`point-list-${item.pointId}`"
          :isDropUp="isDropUp(idx)"
          :point="item"
          :isShowEditKebab="true"
          @checkPoint="checkPoint"
          @openPointEditModal="openPointEditModal"
          @deletePoint="deletePoint"
      />
      <div v-if="pointList.length === 0" class="no-data">
        <i class="bh-icon-warning-circle-fill-52"></i>
        포인트를 등록해주세요.
        <button><i class="bh-icon-plus-18-blue"></i>포인트 추가</button>
      </div>
    </div>
    <edit-point
        v-if="pointEditModal.isOpen"
        :updatePointItem="pointEditModal.point"
        :popupPointType="pointEditModal.popupPointType"
        @closePointEditModal="closePointEditModal"
        @updatePoint="updatePoint"
    />
  </div>
</template>

<script>
import {mapState} from "vuex";
import PointItem from "@/apps/behavior/components/popup/PointItem.vue";
import EditPoint from "@/apps/behavior/components/popup/EditPoint.vue";
import {usePointController} from "@/apps/behavior/modules/point";
const pointController = usePointController();

export default {
  name: 'RewardPointList',
  components: {
    EditPoint,
    PointItem
  },
  data() {
    return {
      searchParams: {},
      isAllDataLoaded: false,
      pointTypeSelected: null,
      pointTypeItem: [
        { value: null, title: '전체' },
        { value: false, title: '좋음' },
        { value: true, title: '노력' }
      ],
      pointEditModal: {
        isOpen: false,
        point: {},
        popupPointType: 'good'
      }
    }
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    pointList() {
      return pointController.model.points
    },
    isDropUp() {
      return (idx) => {
        if (this.pointList.length <= 2) return false
        return this.pointList.length >= 4 ? this.pointList.length - idx < 3 : this.pointList.length - idx < 2
      }
    }
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
    checkPoint(item) {
      if (this.pointList.filter(p => p.checked).length < 5 || item.checked) {
        this.pointList.find(point => point.pointId === item.pointId).checked = !item.checked
      }
    },
    async setPointTypeSelected(pointType) {
      this.scrollToTop()
      this.initParams()
      this.searchParams.isNegative = pointType
      this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
    },
    async onScroll() {
      if (this.isAllDataLoaded) return
      this.searchParams.page++
      this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
    },
    scrollToTop() {
      this.$nextTick(() => {
        this.$refs.pointListDiv.scrollTop = 0
      })
    },
    openPointEditModal({ point, flag }) {
      this.pointEditModal.point = point
      this.pointEditModal.popupPointType = point.isNegative ? 'bad' : 'good'
      this.pointEditModal.isOpen = true
    },
    closePointEditModal() {
      this.pointEditModal.point = {}
      this.pointEditModal.popupPointType = 'good'
      this.pointEditModal.isOpen = false
    },
    updatePoint({ item, flag }) {
      this.closePointEditModal()
      const targetIdx = this.pointList.findIndex(p => p.pointId === item.pointId)
      if (targetIdx > -1) {
        for (let key of Object.keys(this.pointList[targetIdx])) {
          this.pointList[targetIdx][key] = item[key]
        }
      }
    },
    deletePoint({ item, flag }) {
      const targetIdx = this.pointList.findIndex(p => p.pointId === item.pointId)
      if (targetIdx > -1) this.pointList.splice(targetIdx, 1)
    }
  },
  async mounted() {
    this.initParams()
    this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
  },
  beforeDestroy() {
    pointController.resetPointChecked()
  },
  watch: {
    async curClassroom() {
      this.initParams()
      this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
    }
  }
}
</script>

<style lang="scss" scoped>
.point-wrap {
  width: 50%;
  position: relative;   
  .point-list{
    display: flex;
    flex-direction: column;
    height: calc(100dvh - 403px);
    overflow: scroll;
    padding: 0 15px 0 25px;
  }
  .filter{
    left:0;
    right: auto;
    .hi-selectbox ::v-deep {      
      .selected{
        &::before{
          background-color: var(--gray-08);
          mask-image: url(~@/assets/img/svg/ico-filter2.svg);
          mask-size: 100%;
        }
      }
      .option__layer {
        left:0;
      }
    }
  }

  &.on{
    min-width: 500px;
    .filter{
      left: auto;
      right: 0;  
      .hi-selectbox ::v-deep .option__layer {        
        left: auto;
        right: -6px;
      }    
    }
  }
}
</style>