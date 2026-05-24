<template>
  <div
      class="scroll-wrapper scrollbar-outer"
      style="position: relative;"
      v-if="reservation.searchList.length > 0"
  >

    <div
        class="hitalk-scrollbar"
        ref="roomListContainer"
        @scroll.passive="onScroll"
    >
      <div class="reservation__wrap">
        <p class="text-refer" v-if="!reservation.isSearchMode">
          * 예약 메시지가 많을 경우 약간의 시간 오차가 발생할 수 있습니다.
        </p>
        <div class="reservation__top">
          <template v-if="!reservation.isSearchMode">
            <input type="checkbox" id="ckAll" @click="checkAll($event)" v-model="isCheckedAll">
            <label for="ckAll"><span>전체</span></label>
            <div class="group-btn">
              <button
                  class="hi-btn btn-sm"
                  :disabled="reservation.deleteList.length < 1"
                  @click="deleteHitalkReservationBatch('DELETE')"
              >
                메시지 삭제
              </button>
            </div>
          </template>

          <p v-else class="text-search-result"><span>{{ cloneKeyword }}</span>검색결과</p>
        </div>
        <ul class="reservation__list">
          <reservation-item
              v-for="reservationItem of reservation.searchList"
              :key="reservationItem.scheduleId"
              :reservation-item="reservationItem"
              :cloneKeyword="cloneKeyword"
              @searchHitalkReservations="searchHitalkReservations"
          />
        </ul>
      </div>
    </div>

    <div class="scroll-element scroll-x">
      <div class="scroll-element_outer">
        <div class="scroll-element_size"></div>
        <div class="scroll-element_track"></div>
        <div class="scroll-bar" style="width: 0px;"></div>
      </div>
    </div>
    <div class="scroll-element scroll-y">
      <div class="scroll-element_outer">
        <div class="scroll-element_size"></div>
        <div class="scroll-element_track"></div>
        <div class="scroll-bar" style="height: 0px;"></div>
      </div>
    </div>

  </div>

  <div class="hitalk-scrollbar" v-else>
    <div class="empty-wrap">
      <div class="img-wrap"></div>
      <div v-if="reservation.isSearchMode" class="text-wrap"><p>검색 결과가 없습니다.</p></div>
      <div v-else class="text-wrap"><p>예약한 메시지가 없습니다.<br>메시지를 예약해보세요.</p></div>
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import ReservationItem from "@/apps/hitalk/components/tabs/reservation/ReservationItem";

export default {
  name: "ReservationList",
  components: {ReservationItem},
  data() {
    return {
      scheduleIdList: [],
      isCheckedAll: false,
      cloneKeyword: ''
    }
  },
  props: {
    searchKeyword: {
      type: String
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeHitalk', ['reservation'])
  },
  methods: {
    ...mapMutations('storeHitalk', [
      'clearReservationSearchList',
      'setReservationDeleteList',
      'setReservationPaging',
      'setReservationCount',
      'clearReservationPaging'
    ]),
    ...mapActions('storeHitalk', [
      'searchReservation',
      'patchReservationBatch',
      'getReservationCount',
      'callChatRooms'
    ]),

    /**
     * 예약된 메시지 목록
     * @returns {*}
     */
    searchHitalkReservations(isInit) {
      if (isInit) {
        this.setReservationPaging({
          isEnd: false,
          page: 0
        })
      }

      if (this.reservation.paging.isEnd) {
        return false
      }

      let params = {}
      params.userId = this.user.currentId
      params.page = this.reservation.paging.page
      params.size = this.reservation.paging.size
      if (this.searchKeyword.trim().length > 0) {
        params.keyword = this.searchKeyword
        this.cloneKeyword = _.cloneDeep(this.searchKeyword)
      }

      this.searchReservation({params: params, isInit: isInit})
          .then(res => {
            if (isInit) {
              this.getReservationCount({userId: this.user.currentId})
                  .then(res => {
                    this.setReservationCount(res.data.count)
                    this.$refs.roomListContainer && (this.$refs.roomListContainer.scrollTop = 0)
                  })
              this.setReservationDeleteList([])
            }
          })
    },

    /**
     * 전체 체크박스 클릭
     * @param event
     */
    checkAll(event) {
      if (event.target.checked) {
        this.setReservationDeleteList(this.scheduleIdList)
      } else {
        this.setReservationDeleteList([])
      }
    },

    /**
     * 일괄 삭제
     * @param sendType
     * @returns {*}
     */
    deleteHitalkReservationBatch(sendType) {
      const deletableList = this._checkStatus()

      let requestBody = {}
      requestBody.userId = this.user.currentId
      requestBody.sendType = sendType

      if (!_.isEqual(deletableList, this.reservation.deleteList)) { // 전송중이 포함
        if (this.reservation.deleteList.length === 1) { // 선택된 예약이 1건
          const alertMsg = `전송 중인 메시지는 수정/삭제가 불가합니다.`
          this.$hiClass.alert(alertMsg)

        } else { // 선택된 예약이 2건 이상
          const confirmMsg = `전송 중인 메시지는 수정/삭제가 불가합니다.<br>해당 메시지를 제외하고 삭제 하시겠습니까?`
          this.$hiClass.confirm(confirmMsg)
              .then(() => {
                requestBody.targets = deletableList
                this.patchReservationBatch(requestBody)
                    .then(res => {
                      this.searchHitalkReservations(true)
                    })
              })
              .catch(() => {
                this.searchHitalkReservations(true)
              })
        }

      } else { // 모두 삭제 가능
        requestBody.targets = this.reservation.deleteList
        this.patchReservationBatch(requestBody)
            .then(res => {
              this.searchHitalkReservations(true)
            })
      }
    },

    _checkStatus() {
      let requestBody = {}
      requestBody.userId = this.user.currentId
      requestBody.scheduleIds = this.reservation.deleteList

      let deletableList = []

      this.reservation.deleteList.forEach(deleteScheduleId => {
        const status = this.reservation.searchList.find(searchItem => {
          return searchItem.scheduleId === deleteScheduleId
        }).status

        if (status === 'RESERVATION' || status === 'CANCEL' || status === 'FAILURE') {
          deletableList.push(deleteScheduleId)
        }
      })

      return deletableList
    },

    onScroll() {
      if (Math.ceil(this.$refs.roomListContainer.scrollTop) + this.$refs.roomListContainer.clientHeight
          >= this.$refs.roomListContainer.scrollHeight) {
        this.searchHitalkReservations(false)
      }
    }
  },
  created() {
    this.searchHitalkReservations(true)
  },
  mounted() {
    this.callChatRooms()
  },
  beforeDestroy() {
    this.clearReservationSearchList()
    this.clearReservationPaging()
  },
  watch: {
    'reservation.searchList'(newVal) {
      this.scheduleIdList = newVal.map(reservationItem => reservationItem.scheduleId)
    },
    'reservation.deleteList'(newVal) {
      this.isCheckedAll = _.isEqual(this.scheduleIdList, newVal)
    },
    scheduleIdList(newVal) {
      this.isCheckedAll = _.isEqual(this.reservation.deleteList, newVal)
    }
  }
}
</script>

<style scoped>

</style>