<template>
  <div class="point-grant">
    <HiTabs type="type04" size="xs" class="grant-content-wrap" @setCurTab="changeTab">
      <HiTab curTab="POINT" label="포인트 별" onActive class="grant-content">
        <point-list class="on" />
        <student-list :withPoint="false"/>
      </HiTab>
      <HiTab curTab="STUDENT" label="학생별" class="grant-content">
        <student-list ref="studentListWithPoint" :withPoint="true" class="on" />
        <point-list/>
      </HiTab>
    </HiTabs>

    <div class="grant-memo">
      <div class="date-wrap">
        <button class="date" @click="openPopupCalendar">
          {{ $moment(issueDt).format('YY.MM.DD (dd)') }}
          <i class="input-btn-calendar bh-icon-calendar-24 cursor-pointer"></i>
        </button>
        <calendar-monthly
          v-if="isOpenCalendar"
          :timestamp="$moment(this.issueDt).valueOf()"
          :should-set-value="false"
          :minDate="`2024-01-01`"
          :maxDate="$moment().format('YYYY-MM-DD')"
          v-click-outside="closePopupCalendar"
          calendarType="type03"
          @selectedDate="setIssueDt"
        />
      </div>
      <input type="text" placeholder="메모를 남길 수 있습니다." maxlength="50" v-model="memo">
      <button class="btn-reward" @click="checkTimestamp" :disabled="!(isStudentChecked && isPointChecked)">
        <i class="bh-reward-32"></i> {{ totalPoint }} 포인트 지급
      </button>
    </div>

    <HiModal
        v-if="isOpenRewardConfirm"
        type="type01"
        :modalLayerStyle="{'max-width': '450px', 'width': '100%'}"
        @close="isOpenRewardConfirm = false"
    >
      <template v-slot:heading>
        보이는 포인트에 적용하시겠습니까?
      </template>
      <template v-slot:footer>
        <HiButton color="black" size="lg" @click="isOpenRewardConfirm = false; rewardPoints(false)">지급내역에만 추가</HiButton>
        <HiButton color="orange" size="lg" @click="isOpenRewardConfirm = false; rewardPoints(true)">보이는 포인트에 적용</HiButton>
      </template>
    </HiModal>

    <!-- 포인트 지급  -->
    <transition name="fade">
      <div class="toasted-container bottom-center" v-if="isShowToast">
        <div class="toasted type01 toasted-primary">
          <div class="reward-toast">
            <p class="msg"><i v-if="!isCancelReward" class="bh-icon-check-22-transparent"></i>
              {{ !isCancelReward ? '포인트가 지급되었습니다.' : '포인트 지급이 취소되었습니다.' }}
            </p>
            <button v-if="!isCancelReward" class="esc" @click="deleteRewards"><i class="bh-icon-refresh-on-20"></i>
              취소
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import 'moment/locale/ko';
import CalendarMonthly from "@/components/Calendar/CalendarMonthly.vue";
import StudentList from "@/apps/behavior/pages/classrooms/point/RewardStudentList.vue";
import RewardPointList from "@/apps/behavior/pages/classrooms/point/RewardPointList.vue";
import { usePointController } from '@/apps/behavior/modules/point';
import { useStudentController } from '@/apps/behavior/modules/student';
import {mapState} from "vuex";
const pointController = usePointController();
const studentController = useStudentController();

export default {
  name: 'RewardView',
  components: {
    PointList: RewardPointList,
    StudentList,
    CalendarMonthly
  },
  data() {
    return {  
      curTab: 'POINT',
      isOpenCalendar: false,
      isOpenRewardConfirm: false,
      isShowToast: false,
      isCancelReward: false,
      isSubmitClick: false,
      issueDt: this.$moment().startOf('day').valueOf(),
      memo: null,
      rewardId: null
    }
  },
  computed: {
    ...mapState(['user']),
    pointList() {
      return pointController.model.points
    },
    studentList() {
      return this.curTab === 'POINT' ?
          studentController.model.students :
          studentController.model.studentsWithPoints
    },
    totalPoint() {
      const goodPoint = this.pointList.filter(p => p.checked && !p.isNegative).map(p => p.point * p.issueCount).reduce((sum, point) => sum + point, 0)
      const effortPoint = this.pointList.filter(p => p.checked && p.isNegative).map(p => p.point * p.issueCount).reduce((sum, point) => sum + point, 0)
      return goodPoint - effortPoint
    },
    isStudentChecked() {
      return this.studentList.some(s => s.checked)
    },
    isPointChecked() {
      return this.pointList.some(p => p.checked)
    }
  },
  methods:{
    openPopupCalendar() {
      this.isOpenCalendar = true
    },
    closePopupCalendar() {
      this.isOpenCalendar = false
    },
    setIssueDt({year, month, date}) {
      this.issueDt = this.$moment({ year, month, day: date}).valueOf()
      this.closePopupCalendar()
    },
    changeTab({ curTabName }) {
      this.curTab = curTabName
      pointController.resetPointChecked()
      studentController.resetStudentsChecked()
      studentController.resetStudentsWithPointsChecked()
    },
    checkTimestamp() {
      // 과거 날짜이면 컨펌 오픈
      if (this.$moment(this.issueDt).startOf('day').valueOf() < this.$moment().startOf('day').valueOf()) {
        this.issueDt = this.$moment(this.issueDt).format('YYYY-MM-DD')
        this.isOpenRewardConfirm = true
        return
      }
      // 오늘 날짜이면 현재 시간으로
      this.issueDt = this.$moment(this.issueDt).format('YYYY-MM-DD')

      this.rewardPoints(true)
    },
    async rewardPoints(isVisiblePoint) {
      if (this.isSubmitClick) return
      this.isSubmitClick = true

      const send = await pointController.rewardPoints({
        userId: this.user.currentId,
        students: [this.studentList.filter(s => s.checked)],
        memo: this.memo,
        isNegative: null,
        issueDt: this.issueDt,
        isVisiblePoint: isVisiblePoint
      })

      this.isSubmitClick = false
      this.memo = null
      pointController.resetPointChecked()
      studentController.resetStudentsChecked()

      if (send) {
        this.rewardId = JSON.parse(send.content).rewardId
        this.isShowToast = true
        setTimeout(() => {
          this.isShowToast = false
          this.isCancelReward = false
        }, 1500)
      }

      if (this.$refs.studentListWithPoint) {
        const sort = this.$refs.studentListWithPoint.searchParams.sort
        this.$refs.studentListWithPoint.initParams()
        this.$refs.studentListWithPoint.setSort(sort)
        await this.$refs.studentListWithPoint.loadStudents()
      }
    },
    async deleteRewards() {
      if (this.rewardId) {
        const deletedStudentIds = await pointController.deleteReward({
          userId: this.user.currentId,
          rewardId: this.rewardId
        })

        if (this.$refs.studentListWithPoint) {
          for (let studentId of deletedStudentIds) {
            await studentController.reloadStudentTotalPoint({ userId: this.user.currentId, studentId })
          }
        }
      }

      this.rewardId = null
      this.isCancelReward = true
    }
  }
}
</script>
<style scoped lang="scss">
$icon-check: url(~@/assets/img/icon/icon_check_24_gray02.svg);
.point-grant{
  .hi-tabs::v-deep .hi-tab.tab-xs{
    margin-bottom:15px;
    padding: 0 25px;
    button{
      width:100px; 
      font-size:14px;
      transition:0.3s;
      background:#fff;
      border-color:#D6D6D6;
      &:hover{
        background:#fff;
        border-color:rgba(0, 0, 0, 0.4);
      }
      &.is-active{
        background:#222;
        border-color:#222;
        &:hover{
          background:#000;
          border-color:#000;
        }
      }
    }
  }
  .grant-content-wrap{
    background:#fff;
    border-radius: 16px;
    padding:20px 0;
    .grant-content{
      display: flex;
      > div:first-child{        
        &::after{
          content: '';
          position: absolute;
          top: -55px;
          bottom: -8px;
          right: 0;
          width: 1px;
          background-color: #E0E0E0;
        } 
      }      
    }
  }

  ::v-deep {
    .filter{
      position: absolute;
      top: -54px;
      display: flex  ;
      justify-content: flex-end;
      padding: 0 25px 0 25px;
      gap: 10px;
      .hi-selectbox{
        .selected{
          border:0;
          color:#9e9e9e;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          padding: 0;
          &::after{display:none;}
          &::before{
            content:'';
            display: inline-block;
            width: 20px;
            height: 20px;
            background-image: url(~@/assets/img/icon/icon_drawnup_20.svg);
          }
        }
        .option__layer{
          min-width: 100px;
          width: max-content;
          .option{
            border:0;
            &.is-selected,
            &:hover{
              background-color: #F6F6F6;
            }
          }
        }
      }   
      .btns{
        display: flex;
        align-items: center;

        .select-all-btn{
          color:#9E9E9E;
          font-size:14px;
          display: flex;
          align-items: center;
          gap: 5px;
          i{
            mask-image: $icon-check;
            background: #9E9E9E;
            margin-right: 2px;
          }
        }
      }       
      .input-box-wrap.round-search-box{
        padding:0;
        width: 235px;
        input{padding:0 60px 0 16px;}
        button .hi-ico.ico-bg-gray{background-color:#bdbdbd !important;}
      }
    }
    .no-data{
      font-size: 15px;
      font-weight: 400;
      color: #9e9e9e;
      display: flex;
      flex-flow: column;
      gap: 12px;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      button{
        width: 137px;
        height: 44px;
        font-size: 14px;
        font-weight: 500;
        color: #3aafff;
        display: flex    ;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        border: 1px solid #3aafff;
        margin-top: 3px;
        :hover{
          border: 1px solid #3aafff;
        }
      }
    }
  }

  .grant-memo{
    margin-top: 20px;
    font-size: 14px;
    color: #9E9E9E;
    border-radius: 16px;
    padding: 20px 25px;
    background: #fff;
    height: 84px;
    display: flex;
    gap: 8px;
    .date-wrap{
      position: relative;
      .calendar__layer{
        bottom: 51px;
        top: auto;
      }
      button.date{
        width: 176px;
        height: 44px;
        border: 1px solid #E0E0E0;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        color: var(--orange);
      }
    }
    input{
      border: 1px solid #E0E0E0;
      border-radius: 6px;
      padding: 0 16px;
      flex-grow: 1;
      &:focus{
        border: 1px solid #FFB17C;;
        outline: none;
      }
    }
    .btn-reward{
      border-radius: 6px;
      color: #fff;
      background: #3AAFFF;
      width: 180px;
      display: flex  ;
      align-items: center;
      justify-content: center;
      gap: 7px;
      font-size: 15px;
      &:disabled{
        background: #D6D6D6;
      }
    }
  }
}
.toasted-container{
  bottom: 13%;
  .toasted .reward-toast{
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;  
    
    .msg{
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 16px;
      width: 100%;
      justify-content: center;
      min-width: 207px;
      i{
        width: 35px;
        height: 35px;
        text-align: center;
        background-color:  var(--orange);
        border-radius: 50%;
        background-position: center;
      }
    }
    .esc{
      display: flex;
      align-items: center;
      gap: 5px;
      font-size:14px ;
      color: var(--orange);
      flex-grow: 1;
      justify-content: flex-end;
      width: 100%;
    }
  }
}
.fade-leave-from {
  opacity: 1;
}
.fade-leave-active {
  transition: all 0.5s;
}
.fade-leave-to {
  opacity: 0;
}
</style>
<style lang="scss">
@media screen and (max-width: 1334px) {  
  #point-manage-container{
    margin: 15px 35px;
    min-height: 422px;
    overflow: auto;

    .hi-tabs{
      height: calc(100% - 5px);
      .hi-tab-content{
        height: calc(100% - 70px);  
        > div,
        > div .point-grant{
          height:100%;
          .grant-content-wrap{
            height: calc(100% - 104px);  
            .hi-tab-content{
              height: calc(100% - 51px);  
              .grant-content,
              .point-wrap,
              .student-wrap,
              .point-list,
              .student-list{height:100%;}
            }
          }
        }
      }
    }

    .point-grant .hi-tabs .hi-tab.tab-xs,
    .point-grant .filter,
    .student-wrap .student-list,
    .point-wrap .point-list{padding:0 15px;}

    .student-wrap .filter .input-search-wrap{
      width:200px;
    }
    
    .student-wrap.on{
      min-width: 530px;
    }
    .student-wrap.on + .point-wrap{
      min-width: calc(100% - 530px);
    }
  }
}
</style>