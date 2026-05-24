<template>
  <div
      class="card"
      :class="{'on': point.checked, 'effort': point.isNegative}"
      @click="checkPoint($event, point)"
  >
    <div class="card__info">
      <template v-if="point.checked === false || point.checked === undefined">
        <span class="card__info-image" :style="{ background: point.pointColor }">
          <img :src="`https://download.hiclass.net/static/classroom/point/${point.pointImage}.png`" />
        </span>
        <em :class="{ bad: isNegative }">{{ point.point }}</em>
      </template>
      <template v-else>
        <span class="card__info-image">
          <i class="bh-icon-check-22-transparent"></i>
        </span>
        <em :class="{ bad: isNegative}">{{ point.point }}</em>
      </template>
      <span class="card__info-txt">{{ point.pointName }}</span>
    </div>
    <div class="point__info">
      <p class="point__count" v-if="point.checked">
        <HiSelectBox
          :class="{'opt-top': isDropUp }"
          :value="point.issueCount"
          :items="issueCountSelectItems"
          @update:value="point.issueCount = $event"
          :empty-title="point.issueCount.toString() || 'Default Type'"
        />
      </p>
      <p class="point__total" v-if="point.checked">
        {{ point.point * point.issueCount }}
      </p>
      <p class="point__btns" v-if="isShowEditKebab && !point.checked">
        <HiKebab>
          <button class="btn-edit2" @click="openPointEditModal">수정</button>
          <button class="btn-delete" @click="openConfirmDialog">삭제</button>
        </HiKebab>
      </p>
    </div>

    <confirm-modal
        v-if="confirmModal.isOpen"
        :title="confirmModal.title"
        :description="confirmModal.description"
        :cancelButtonText="confirmModal.cancelButtonText"
        :confirmButtonText="confirmModal.confirmButtonText"
        :confirmButtonColor="confirmModal.confirmButtonColor"
        :isAlert="confirmModal.isAlert"
        @closeConfirmDialog="closeConfirmDialog"
    />
  </div>
</template>
<script>
import ConfirmModal from "@/apps/behavior/components/popup/ConfirmModal.vue";
import {usePointController} from "@/apps/behavior/modules/point";
const pointController = usePointController();

export default {
  name: 'PointItem',
  components: {ConfirmModal},
  data() {
    return {
      confirmModal: {
        isOpen: false,
        title: '포인트를 삭제하시겠습니까?',
        description: '삭제된 포인트는 복원이 불가합니다.<br>단, 과거에 부여했던 포인트 지급 이력은 유지됩니다.',
        confirmButtonText: '삭제',
        confirmButtonColor: '#F04F59',
        isAlert: false
      }
    }
  },
  props: {
    isDropUp: {
      type: Boolean,
      default: false
    },
    point: {
      type: Object
    },
    isNegative: {
      type: Boolean
    },
    isShowEditKebab: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    issueCountSelectItems() {
      let items = []
      for (let i = 1; i <= 10; i++) {
        items.push({ value: i, title: i })
      }
      return items
    }
  },
  methods: {
    checkPoint(e, point) {
      if (e.target.className.split(' ').some(c => ['selected', 'hi-selectbox', 'option'].includes(c))) return
      this.$emit('checkPoint', point)
    },
    openPointEditModal() {
      this.$emit('openPointEditModal', {
        point: this.point,
        flag: true
      })
    },
    openConfirmDialog() {
      this.confirmModal.isOpen = true
    },
    closeConfirmDialog(flag) {
      if (flag) {
        this.deletePoint()
      }
      this.confirmModal.isOpen = false
    },
    async deletePoint() {
      pointController.deletePoint(this.point.pointId, { userId: this.$store.state.user.currentId })
    }
  }
}
</script>
<style scoped lang="scss">
.card {
  width: 100%;
  height: 68px;
  min-height: 68px;
  border-radius: 6px;
  background: #f3f8ff;
  float: left;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  & + .card {
    margin-top: 15px;
  }
  &.effort {
    background: #fff6f7;    
    .card__info  em{
      background: #f95f6e;
      border: 3px solid #fff6f7;
    }
  }
  &.effort.on {
    background: #f95f6e;
  }
  &.on {
    background: #3987f8;    
    &.effort .card__info .card__info-image {
      background: #f95f6e;
    }
    .card__info .card__info-image {
      background: #3987f8;
      border: 3px solid #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .card__info-txt{
        color: #fff;
    }
  }
  .card__info {
    position: relative;
    height: 46px;
    gap: 25px;
    display: flex;
    align-items: center;
    flex-grow: 1;
    width: calc(100% - 193px);
    .card__info-image {
      display: inline-flex;
      min-width: 46px;
      width: 46px;
      height: 46px;
      max-height: 46px;
      border-radius: 50%;
      background: #c4c4c4;
      overflow: hidden;
      justify-content: center;
      align-items: center;
    }
    .card__info-image img {
      width: 70%;
      height: 70%;
      -o-object-fit: cover;
      object-fit: cover;
      image-rendering: auto;
    }
    em {
      position: absolute;
      top: 29px;
      left: 23px;
      display: inline-block;
      width: 36px;
      height: 26px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 24px;
      background: #3987f8;
      font-family: var(--font-body);
      color: #fff;
      text-align: center;
      line-height: 20px;
      border: 3px solid #f3f8ff;
    }
    em.bad {
      background: #f95f6e;
      border: 3px solid #fff6f7;
    }
  }
  .card__info-txt{
    font-size: 15px;
    font-weight: 400;
    color: #222;
    line-height: 21px;
    height: auto;
    max-height: 42px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    text-align: left;
    white-space: nowrap;
    width: 100%;
  }
  .point__info{    
    position: relative;
    height: 46px;
    gap: 13px;
    display: flex;
    align-items: center;
    .point__count{
      display: flex;    
      align-items: center;
      justify-content: space-evenly;
      border-radius: 4px;
      width: 80px;
      height: 38px;
      // input{
      //   width:42px;
      //   height:30px;
      //   font-size:15px;
      //   font-weight:400;color:#222;
      //   text-align:center;
      //   border:1px solid #fff;
      // }
      .hi-selectbox{
        width: 100%;
        height: 100%;
        ::v-deep .option__layer{
          max-height: 169px;
        }
      }
    }
    .point__total{  
      font-family: var(--font-body);
      width: 70px;
      font-size: 20px;
      color: #fff;
      font-weight: 700;
      text-align: center;
    }
    .point__btns{
      .hi-kebabmenu {
        position: relative;
        ::v-deep {
          .btn-kebab{
            height: 34px;
            width: 34px;
            padding: 10px;
            span{
              width:2px;
              height:2px;
              background: #9E9E9E;
              transition: all 0.2s ease-in-out;
            }
            &:hover{
              span{background:#222;}
            }
          } 
          .kebabmenu__layer{          
            border-radius: 6px;
            box-shadow: 0px 3px 15px rgba(0, 0, 0, 0.16);
            width: 100px;
            button{border:0;
              &:hover{background-color: #F6F6F6;}
            }
            .btn-delete{color:var(--warning);}
            .btn-delete::before{background:var(--warning);}            
          }
        }
      }
    }
  }
}
</style>