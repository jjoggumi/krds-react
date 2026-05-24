<template>
  <div class="manage-box" :class="{'left': !isNegative, 'right': isNegative}">
    <div class="box-top">
      <div class="point-title">
        <i :class="{'good': !isNegative, 'bad': isNegative}"></i>
        <span>{{ !isNegative ? '좋음' : '노력' }}</span>
      </div>
      <button class="add-btn" @click="openPointEditModal({point: {}, flag: true})">
        <i class="plus"></i>
        <span>포인트 추가</span>
      </button>
    </div>
    <draggable
        v-if="pointList.length > 0"
        class="box-content custom-scr"
        tag="div"
        handle=".draggable-area"
        v-model="pointList"
        v-bind="dragOptions"
        @start="isDrag = true"
        @end="saveSort"
    >
      <transition-group type="transition" :name="!isDrag ? 'flip-list' : null">
        <div class="point-item-group" v-for="pointItem of pointList" :key="pointItem.pointId">
          <div class="point-item" :class="{'good': pointType === 'good', 'bad': pointType === 'bad'}">
            <div class="move-icon draggable-area"></div>
            <point-item
                class="draggable-area"
                :point="pointItem"
                :isShowEditKebab="true"
                @openPointEditModal="openPointEditModal"
            />
          </div>
        </div>
      </transition-group>
    </draggable>
    <div class="box-content empty" v-else>
      <div class="empty-group">
        <div class="info-icon"></div>
        <p>포인트를 등록해주세요.</p>
        <button class="add-btn" @click="openPointEditModal({point: {}, flag: true})">
          <i class="plus"></i>
          <span>포인트 추가</span>
        </button>
      </div>
    </div>
    <edit-point
        v-if="pointEditModal.isOpen"
        :updatePointItem="pointEditModal.point"
        :popupPointType="pointEditModal.point.pointId ? pointEditModal.popupPointType : pointType"
        @closePointEditModal="closePointEditModal"
        @updatePoint="updatePoint"
        @savePoint="savePoint"
    />
  </div>
</template>

<script>
import draggable from "vuedraggable";
import {mapState} from "vuex";
import PointItem from "@/apps/behavior/components/popup/PointItem.vue";
import EditPoint from "@/apps/behavior/components/popup/EditPoint.vue";
import {usePointController} from "@/apps/behavior/modules/point";
const pointController = usePointController();

export default {
  name: "point-list-card",
  components: {
    EditPoint,
    PointItem,
    draggable
  },
  data() {
    return {
      isDrag: false,
      dragOptions: {
        animation: 200,
        disabled: false,
        forceFallback: true,
        ghostClass: "ghost"
      },
      pointEditModal: {
        isOpen: false,
        point: {},
        popupPointType: 'good'
      }
    }
  },
  props: {
    isNegative: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('storeBehavior', ['curClassroom']),
    pointList: {
      get() {
        return pointController.model.points.filter(p => p.isNegative === this.isNegative)
      },
      set(points) {
        // 현재 포인트의 반대 타입인 포인트 + 현재 포인트
        const newPoints = [...pointController.model.points.filter(p => p.isNegative === !this.isNegative), ...points]
        pointController.setPoints(newPoints, true)
      }
    },
    pointType() {
      return !this.isNegative ? 'good' : 'bad'
    }
  },
  methods: {
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
    savePoint(emitItem) {
      if (Object.keys(emitItem.item).length > 0) {
        pointController.appendPoints(emitItem.item)
      }
      this.closePointEditModal()
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
    async saveSort() {
      this.isDrag = false

      const sortItem = {
        pointIds: this.pointList.map(pointItem => pointItem.pointId),
        isNegative: this.isNegative,
        userId: this.$store.state.user.currentId
      }
      try {
        const res = await this.$axios({
          method: 'PATCH',
          url: `/classroom/${this.curClassroom.classroomId}/point/sorting`,
          data: sortItem
        })
      } catch (e) {}
    }
  }
}
</script>

<style scoped lang="scss">
.ghost {
  opacity: 0;
}
.manage-box {
  min-width: 400px;
  width: calc(100% - 51.5%);
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;  
  border-radius: 16px;
  background: #fff;
}
.manage-box .box-top {
  width: 100%;
  height: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 28px 25px 15px 25px;
  .point-title .good {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('~@/assets/img/icon/icon_reward_fill_good_20.svg') no-repeat;
    vertical-align: middle;
  }
  .point-title .bad {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('~@/assets/img/icon/icon_reward_fill_bad_20.svg') no-repeat;
    vertical-align: middle;
  }
  .point-title span {
    color: #222;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    vertical-align: middle;
    margin-left: 4px;
  }
}
.manage-box .add-btn {
  display: block;
  span {
    text-align: right;
    color: #3aafff;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    vertical-align: middle;
  }
  .plus {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('~@/assets/img/icon/ic_plus_20.svg') no-repeat;
    content: '';
    margin-right: 1px;
    vertical-align: middle;
  }
}
.manage-box .box-content {
  width: 100%;
  overflow: auto;
  height: 710px;
}
.box-content.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  .empty-group {
    text-align: center;
    .info-icon {
      display: inline-block;
      width: 46px;
      height: 46px;
      background: url('~@/assets/img/icon/icon_info_grey.svg') no-repeat;
      content: '';
      margin-bottom: 12px;
    }
    p {
      color: #9e9e9e;
      font-size: 15px;
      font-style: normal;
      font-weight: 400;
      line-height: 15px;
      margin-bottom: 16px;
    }
    .add-btn {
      width: 137px;
      height: 44px;
      border-radius: 6px;
      border: 1px solid #3aafff;
      background: #fff;
      display: inline;
    }
  }
}
@media screen and (max-width: 1370px) {
    .manage-box {
      min-width: 600px;
      margin: 0 auto;
    }
    .manage-box.right {
      margin-top: 30px;
    }
    .manage-box .box-content{
      height:auto;
    }
}
.point-item-group {
  width: 100%;
  height: 74px;
  margin-top: 15px;
  margin-bottom: 15px;
  padding: 0 25px;
  display: flex;
  justify-content: space-between;
  &:last-child {
    margin-bottom: 25px;
  }
  .move-icon {
    width: 24px;
    min-width:24px;
    height: 100%;
    background: url('~@/assets/img/icon/ico_listmove.svg') no-repeat center;
    cursor: pointer;
  }
  .point-btn{
    width: 40px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
}
.point-item {
  border-radius: 6px;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 7px 0 7px 15px;
  justify-content: space-between;
  align-items: center;
  &.good {
    background: #f3f8ff;
  }
  &.bad {
    background: #fff6f7;
  }
  .card{
    width:calc(100% - 24px);
    background: transparent; margin: 0;}
}
</style>