<template>
  <div
      v-show="isLoaded"
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="giveTotalPointModal"
      style="display: block"
  >
    <div class="modal-cont-wrap" ref="scrollArea">
      <div class="modal-cont">
          <div class="modal-cont-inner">
            <div class="behavior-modal-students-give-totalpoint">
              <div class="top">
                <div class="title">포인트 지급</div>
                <div class="modal-close-btn" @click="close"></div>
              </div>

              <div
                class="content give-points"
                :class="{ effort: isNegative }"
              >
                <div class="content__tl-wrap">
                  <div class="content__top">
                    <div class="content__top-tab">
                      <button
                        v-for="tabItem of [{tab: false, name: '좋음'}, {tab: true, name: '노력'}]"
                        :key="`modal-tab-${tabItem.tab}`"
                        :class="{ on: isNegative === tabItem.tab }"
                        @click="changeContentTab(tabItem.tab)"
                      >
                        {{ tabItem.name }}
                      </button>
                    </div>
                    <div class="content__top-add">
                      <button @click="openPointEditPopup"><i class="bh-icon-plus-18-blue"></i>포인트 추가</button>
                    </div>
                  </div>
                  <div class="content__list">
                    <template v-if="pointList.length > 0">
                      <point-item
                          v-for="(item, idx) of pointList"
                          :key="`content-list-card-${item.pointId}`"
                          :isDropUp="isDropUp(idx)"
                          :point="item"
                          :isNegative="isNegative"
                          @checkPoint="checkPoint"
                      />
                    </template>

                    <template v-else>
                      <div class="nodata">
                        <i class="bh-icon-warning-circle-fill-52"></i>
                        <span>포인트를 등록해주세요.</span>
                        <button @click="openPointEditPopup"><i class="bh-icon-plus-18-blue"></i>포인트 추가</button>
                      </div>
                    </template>
                  </div>
                </div>
                <div class="content__input">
                  <input type="text" placeholder="메모를 남길 수 있습니다." 
                    v-model="givePointItem.memo"
                    maxlength="50" 
                    @input="inputGivePointMemo" 
                    @keydown="inputGivePointMemo" 
                    @keyup="inputGivePointMemo" 
                  />
                  <button
                    :class="{ on: isSubmit }"
                    :disabled="!isSubmit"
                    @click="submitPoint"
                  >
                    <i class="bh-reward-32"></i>
                    {{ !isSubmit ? '포인트지급' : `${totalPoint}포인트 지급` }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <edit-point
        v-if="isShowPointEditPopup"
        :popupPointType="popupPointType"
        @closePointEditModal="closePointEditModal"
        @savePoint="savePoint"
      />
    </div>
</template>

<script>
import EditPoint from '@/apps/behavior/components/popup/EditPoint.vue';
import PointItem from "@/apps/behavior/components/popup/PointItem.vue";
import { usePointController } from '@/apps/behavior/modules/point';
import { mapActions, mapState } from 'vuex';
const pointController = usePointController();

export default {
  name: 'give-total-point',
  components: {PointItem, EditPoint},
  props: {
    mode: String,
    studentList: Array,
    memo: {
      type: String,
      default: ''
    },
    checklistId: {
      type: String,
      default: ''
    }
  },
  data() {
      return {
        isLoaded: false,
        searchParams: {},
        isAllDataLoaded: false,
        isNegative: false,
        givePointItem: {
            memo: ""
        },
        isShowPointEditPopup: false,
        popupPointType: 'good',
        isSubmitClick: false,
        givedPointIds: []
      }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeBehavior', ['curClassroom', 'detailClass']),
    isSubmit() {
      return this.pointList.some(p => p.checked)
    },
    totalPoint() {
      return this.pointList.filter(point => point.checked).map(point => point.point * point.issueCount).reduce((sum, num) => sum + num, 0)
    },
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
  methods:{
    ...mapActions('storeBehavior', ['sendStompClient']),
    close() {
      this.$emit('close')
    },
    getLocalStoragePoint() {
      const behaviorGivePointIds = JSON.parse(localStorage.getItem(`behaviorGive${!this.isNegative ? 'Good' : 'Bad'}PointIds`))
      if (behaviorGivePointIds) {
        this.givedPointIds = behaviorGivePointIds
      }

      if (this.givedPointIds[0]) {
        const targetIdx = this.pointList.findIndex(p => p.pointId === this.givedPointIds[0])
        if (targetIdx > -1) this.pointList[targetIdx].checked = true
      }
    },
    initParams() {
      this.isAllDataLoaded = false
      this.searchParams = {
        userId: this.$store.state.user.currentId,
        size: 20,
        page: 0,
        isNegative: this.isNegative
      }
    },
    async changeContentTab(isNegative) {
      this.isNegative = isNegative
      this.initParams()
      while (!this.isAllDataLoaded) {
        this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
        this.searchParams.page++
      }
      this.getLocalStoragePoint()
    },
    checkPoint(item) {
      if (this.pointList.filter(p => p.checked).length < 5 || item.checked) {
        this.pointList.find(point => point.pointId === item.pointId).checked = !item.checked
      }
    },
    async submitPoint() {
      if (this.isSubmitClick) return
      this.isSubmitClick = true

      const useRewardSound = localStorage.getItem("behavior-givepoint-sound")
      const sendFields = {}
      if (this.checklistId !== '') {
        sendFields.studentViewType = this.detailClass.studentViewType,
        sendFields.useRewardSound = !useRewardSound ? true : useRewardSound === 'ON'
        sendFields.checklistId = this.checklistId
      }
      const send = await pointController.rewardPoints({
        userId: this.user.currentId,
        students: this.studentList,
        memo: this.givePointItem.memo,
        isNegative: this.isNegative,
        issueDt: null,
        isVisiblePoint: true
      }, sendFields)

      if (send) {
        await this.sendStompClient(send)
        this.$emit('closeSubmit', this.isNegative)
      }

      this.isSubmitClick = false
    },
    openPointEditPopup: function() {
      this.isShowPointEditPopup = true
      this.popupPointType = !this.isNegative ? 'good' : 'bad'
    },
    closePointEditModal: function() {
      this.isShowPointEditPopup = false
    },
    inputGivePointMemo: function(e) {
      e.target.value = e.target.value.substr(0, 50)
    },
    savePoint(emitItem) {
      if (Object.keys(emitItem.item).length > 0) {
        pointController.appendPoints({ ...emitItem.item, checked: false, issueCount: 1 })
      }
      this.closePointEditModal()
    }
  },
  async created() {
    if (this.memo !== '') this.givePointItem.memo = this.memo
    pointController.initPoints()
    pointController.setClassroomId(this.curClassroom.classroomId || this.$route.params.classroomId)
    this.isNegative = this.mode !== 'good'
  },
  async mounted() {
    this.initParams()
    try {
      while (!this.isAllDataLoaded) {
        this.isAllDataLoaded = await pointController.reloadPoints(this.searchParams)
        this.searchParams.page++
      }
      this.getLocalStoragePoint()
    } finally {
      this.isLoaded = true
    }
  }
}
</script>

<style scoped lang="scss">
.modal.ofy.slick-modal .modal-close-btn {
  right: 16px;
}
.behavior-modal-students-give-totalpoint {
  width: 610px;
  height: 561px;
  background: #ffffff;
  border-radius: 20px;
  .top {
    height: 83px;
    position: relative;
    padding-left: 20px;
    .title {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;
      font-weight: 700;
      color: #000;
    }
  }
}
</style>