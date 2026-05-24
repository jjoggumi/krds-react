<template>
  <div
      class="modal normal-modal slick-modal view-main-detail-modal ofy"
      id="rewardsModal"
      style="display: block"
  >
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <!-- <div class="modal-cont-inner"
          v-click-outside="vcoConfig"
          @mouseover="offVco"
          @mouseleave="onVco"> -->
        <div class="modal-cont-inner">
          <div class="behavior-modal-point-give-history">
            <div class="title-wrap">
              <p>포인트 지급내역</p>
            </div>
            <div class="give-history-wrap">
              <div class="filter-wrap">
                <!-- 달력 노출됐을 때 on -->
                <button class="select-calendar" :class="{'on': isShowCalendar}" @click="showCalendar(!isShowCalendar)">
                  <span>{{ searchMonthText }}</span>
                  <!-- 달력 노출됐을 때 black, 노출 안됐을 때 grey -->
                  <i class="bh-icon-calendar-black-16" v-if="isShowCalendar"></i>
                  <i class="bh-icon-calendar-grey-16" v-else></i>
                </button>

                <!-- 달력 start -->
                <main-body-calendar-picker-month-v3
                    v-if="isShowCalendar"
                    v-click-outside="showCalendarClose"
                    style="display:block;"
                    :year="selectedCalendar.year"
                    :month="selectedCalendar.month"
                    :total="true"
                    @choiceMonth="choiceMonth"
                    @choiceAll="choiceAll"
                />
                <!-- 달력 end -->

                <div class="right-btn">
                  <button class="sort-btn" @click="showSortOption(!isShowSortOption)">
                    <i class="bh-icon-drawnup-20"></i>
                    <span>{{ searchParam.sort === 'latest' ? '최근순' : '지급순' }}</span>
                    <div class="sort-select-box" v-if="isShowSortOption" v-click-outside="showSortOptionClose">
                      <span class="latest" :class="{'on': searchParam.sort === 'latest'}" @click="setSearchSort('latest', $event)">최근순</span>
                      <span class="registration" :class="{'on': searchParam.sort === 'registration'}" @click="setSearchSort('registration', $event)">지급순</span>
                    </div>
                  </button>
                  <span class="line"></span>
                  <button class="del-btn" :class="{'deldis': rewardsList.length === 0}" @click="openConfirmDialog('all')">
                    <i></i>
                    <span>전체 삭제</span>
                  </button>
                </div>
              </div>
              <div
                  ref="scrollArea"
                  class="content-wrap"
                  :class="{'empty': rewardsList.length === 0}"
                  v-infinite-scroll="getPointRewards"
                  :infinite-scroll-disabled="scrollOption.disabled"
                  :infinite-scroll-distance="scrollOption.scrollLimit"
              >
                <template v-if="rewardsList.length > 0">
                  <div class="content-date-group" v-for="(rewardsGroup, dateText) of groupByDateList">
                    <div class="give-date">{{ dateText }}</div>
                    <div class="give-item" v-for="rewardItem of rewardsGroup">
                      <div class="point-icon">
                        <div class="point-img"
                            :style="{
                                    'background-image': `url('https://download.hiclass.net/static/classroom/point/${rewardItem.pointImage}.png')`,
                                    'background-color': rewardItem.pointColor
                            }"
                        />
                        <div class="point-score" :class="{
                          bad: rewardItem.isNegative === true
                        }">{{ rewardItem.point }}</div>
                      </div>
                      <div class="point-info">
                        <span class="point-name">{{ rewardItem.pointName }}</span>
                        <span class="point-target">{{ rewardItem.targetNames.join(', ') }}</span>
                      </div>
                      <div class="point-give-time">{{ $moment(rewardItem.rewardTimestamp).format('HH:mm') }}</div>
                      <button class="point-del-btn" @click="openConfirmDialog('select', rewardItem)"><i class="bh-icon-delete-20"></i> </button>
                    </div>
                  </div>
                </template>
                <template v-else-if="rewardsList.length === 0 && !scrollOption.isBusy">
                  <div class="empty-group">
                    <div class="info-icon"></div>
                    <p>내역이 없습니다.</p>
                  </div>
                </template>

              </div>
            </div>
            <div class="modal-close-btn" @click="showPointRewardsPopup(false)"></div>
          </div>
        </div>
      </div>
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
import MainBodyCalendarPickerMonthV3 from "@/apps/main/clazzes/MainBodyCalendarPickerMonthV3";
import ConfirmModal from "@/apps/behavior/components/popup/ConfirmModal";
import {mapState,mapMutations,mapActions} from "vuex";
export default {
  name: "point-rewards",
  components: {MainBodyCalendarPickerMonthV3, ConfirmModal},
  data() {
    return {
      isShowSortOption: false,
      isShowCalendar: false,
      selectedCalendar: {
        year: null,
        month: null
      },
      searchParam: {
        userId: '',
        sort: 'latest',
        page: 0,
        size: 20
      },
      searchMonthText: '전체',
      rewardsList: [],
      scrollOption: {
        disabled: false,
        scrollLimit: 400,
        isBusy: false
      },
      confirmModal: {
        isOpen: false,
        title: '포인트 지급내역을 삭제하시겠습니까?',
        description: '삭제된 내역은 복원이 불가합니다.',
        confirmButtonText: '삭제',
        confirmButtonColor: '#F04F59',
        isAlert: false
      },
      deleteRewardItem: {}
    }
  },
  computed: {
    ...mapState('storeBehavior', {
      curClassroom: "curClassroom",
      students: 'students'
    }),
    groupByDateList() {
      return _.groupBy(this.rewardsList, (reward) => {
        return this.$moment(reward.rewardTimestamp).format('YYYY. MM. DD')
      })
    }
  },
  methods: {
    ...mapActions('storeBehavior', {
        deletePaidAllPoint: 'deletePaidAllPoint'
      }),
    ...mapMutations('storeBehavior', {
      setStudents: 'setStudents'
    }),
    showCalendar(flag) {
      this.isShowCalendar = flag
    },
    showCalendarClose() {
      this.isShowCalendar = false
    },
    showSortOption(flag) {
      this.isShowSortOption = flag
    },
    showSortOptionClose() {
      this.isShowSortOption = false
    },
    showPointRewardsPopup(flag) {
      this.$emit('showPointRewardsPopup', flag)
    },

    /**
     * 월 검색
     */
    choiceMonth(date) {
      this.selectedCalendar.year = date.year
      this.selectedCalendar.month = date.month
      this.searchParam.month = this.$moment({year: date.year, month: date.month - 1}).format('yyyy-MM')
      this.searchMonthText = `${date.year}년 ${date.month}월`

      this.showCalendar(false)
      this.initSearch()
      this.getPointRewards()
    },
    choiceAll() {
      this.selectedCalendar.year = parseInt(this.$moment().format('YYYY'))
      this.selectedCalendar.month = parseInt(this.$moment().format('MM'))
      
      const {month, ...newSearchParam} = this.searchParam
      this.searchParam = newSearchParam
      this.searchMonthText = '전체'
      
      this.showCalendar(false)
      this.initSearch()
      this.getPointRewards()
    },

    /**
     * 정렬 조건 검색
     */
    setSearchSort(sort, e) {
      e.stopPropagation()
      this.searchParam.sort = sort
      this.showSortOption(false)
      this.initSearch()
      this.getPointRewards()
    },

    /**
     * 포인트 지급내역 조회
     */
    async getPointRewards() {
      if (this.scrollOption.disabled || this.scrollOption.isBusy) {
        return false
      }
      this.scrollOption.isBusy = true
      const res = await this.$axios({
        method: 'GET',
        url: `/v2/classroom/${this.curClassroom.classroomId}/report/point/rewards`,
        params: this.searchParam
      })

      if (res.data._embedded) {
        this.rewardsList.push(...res.data._embedded.rewards)
        if (res.data.page.totalPages - 1 === this.searchParam.page) {
          this.scrollOption.disabled = true
        } else {
          this.searchParam.page++
        }
      } else {
        this.scrollOption.disabled = true
      }

      this.scrollOption.isBusy = false
    },
    async getPointRewardsOne(params) {
      const res = await this.$axios({
        method: 'GET',
        url: `/v2/classroom/${this.curClassroom.classroomId}/report/point/rewards`,
        params: params
      })

      if (res.data._embedded) {
        this.rewardsList.push(...res.data._embedded.rewards)
      }
    },
    initSearch() {
      this.rewardsList = []
      this.searchParam.page = 0
      this.scrollOption.disabled = false
    },

    /**
     * 포인트 지급내역 삭제
     */
    async deletePointReward() {
      try {
        const deleteItem = {
          userId: this.searchParam.userId,
          rewardId: this.deleteRewardItem.rewardId,
          pointId: this.deleteRewardItem.pointId,
          sortNo: this.deleteRewardItem.sortNo
        }
        const res = await this.$axios({
          method: 'DELETE',
          url: `/v2/classroom/${this.curClassroom.classroomId}/rewards`,
          data: deleteItem
        })

        this.$toasted.show('삭제하였습니다.', { duration: 1500 })

        const studentPoints = []
        for(const [key, value] of Object.entries(res.data.studentPoints)) {
          studentPoints.push({
            studentId: key,
            point: value
          })
        }

        const list = JSON.parse(JSON.stringify(this.students)).map(v => {
          const obj = studentPoints.find(v2 => v.studentId === v2.studentId)
          if(obj) {
            return {
              ...v,
              point: obj.point
            }
          } else {
            return v
          }
        })
        this.$emit('deleteStudentPoints')
        await this.setStudents(list)
        
        const targetIndex = this.rewardsList.findIndex(rewardItem => {
          return rewardItem.rewardId === this.deleteRewardItem.rewardId && rewardItem.pointId === this.deleteRewardItem.pointId
        })
        this.rewardsList.splice(targetIndex, 1)

        // 목록에서 삭제후 1개 size1 조회하여 목록에 추가
        const params = _.cloneDeep(this.searchParam)
        params.page = this.rewardsList.length
        params.size = 1
        await this.getPointRewardsOne(params)
      } catch (e) {}
    },
    deleteAllRewards: async function() {
      const res = await this.deletePaidAllPoint({classroomId: this.curClassroom.classroomId})

      if(res.status === 200) {
        this.$emit('deleteStudentPoints')
        this.initSearch()
        this.showPointRewardsPopup(false)
        this.$toasted.show('삭제하였습니다.', { duration: 1500 })
      }
    },

    /**
     * 컨펌모달 제어
     */
    openConfirmDialog(action, rewardItem) {
      if(this.rewardsList.length === 0) {
        return
      }
      if(action === 'select') {
        this.deleteRewardItem = rewardItem
        this.confirmModal = {
          ...this.confirmModal,
          isOpen: true,
          title: '포인트 지급내역을 삭제하시겠습니까?',
          description: '삭제된 내역은 복원이 불가합니다.',
          confirmButtonText: '삭제'
        }
      } else {
        this.confirmModal = {
          ...this.confirmModal,
          isOpen: true,
          title: '전체 지급내역을 삭제하시겠습니까?',
          description: '<span style="color: #F04F59">지금까지 지급된 모든 포인트</span>를 삭제합니다.<br/>삭제된 포인트는 복원이 불가합니다.',
          confirmButtonText: '전체 삭제'
        }
      }
      this.confirmModal.action = action
      
      this.confirmModal.isOpen = true
    },
    closeConfirmDialog(isConfirm) {
      this.confirmModal.isOpen = false

      if (isConfirm) {
        switch(this.confirmModal.action) {
          case 'select':
            this.deletePointReward()
            break
          case 'all':
            this.deleteAllRewards()
            break
        }
      } else {
        this.deleteRewardItem = {}
      }
    },
    initGiveDateScrollFixed() {
      const scrollEl = this.$refs.scrollArea
      scrollEl.addEventListener('scroll', e => {
      const scrollTop = e.target.scrollTop
        for(let i = 0;i<e.target.children.length;i++) {
          e.target.children[i].classList.remove('fixed')
        }
        for(let i = e.target.children.length-1;i>=0;i--) {
          let top = 0
          if(i === 0) {
              top = e.target.children[i].offsetTop-56
          } else {
              top = e.target.children[i].offsetTop-86
          }

          if(scrollTop > top) {
            e.target.children[i].classList.add('fixed')
            break;
          }
        }
      })
    },
  },
  created() {
    this.selectedCalendar.year = parseInt(this.$moment().format('YYYY'))
    this.selectedCalendar.month = parseInt(this.$moment().format('MM'))
    this.searchParam.userId = this.$store.state.user.currentId
    this.getPointRewards()
  },
  mounted() {
    this.$nextTick(() => {
      this.initGiveDateScrollFixed()
    })
  }
}
</script>

<style scoped>
.modal.ofy.slick-modal .modal-close-btn {
  right: 16px;
}
</style>