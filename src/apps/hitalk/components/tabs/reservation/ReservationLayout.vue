<template>
  <div class="tab-cont-item on">
    <strong class="tab-cont-title c-reservation">예약 메시지 목록</strong>
    <div class="opponent-list-wrap c-reservation-wrap">
      <div class="search-name-wrap">
        <div class="input-box-wrap round-search-box search-box-wrap">
          <input
              type="text"
              placeholder="메시지 내용 검색"
              v-model="searchKeyword"
              @keyup.enter="searchReservation"
          >
          <button
              class="input-text-delete-btn"
              :style="deleteBtnStyle"
              @click="resetSearchKeyword"
          />
        </div>
      </div>

      <reservation-list
          ref="reservationList"
          :search-keyword="searchKeyword"
      />
    </div>
  </div>
</template>

<script>
import ReservationList from "@/apps/hitalk/components/tabs/reservation/ReservationList";

export default {
  name: "ReservationLayout",
  components: {ReservationList},
  data() {
    return {
      searchKeyword: ''
    }
  },
  computed: {
    deleteBtnStyle() {
      if (this.searchKeyword.trim().length > 0) {
        return 'display: inline-block;'
      }
      return ''
    }
  },
  methods: {
    /**
     * 검색어 초기화
     */
    resetSearchKeyword() {
      this.searchKeyword = '';
      setTimeout(() => {
        this.$refs.reservationList.clearReservationSearchList();
        this.$refs.reservationList.clearReservationPaging();
        this.$refs.reservationList.searchHitalkReservations(true)
      },50)
    },

    /**
     * 예약메시지 검색
     */
    searchReservation() {
      this.$refs.reservationList.clearReservationSearchList();
      this.$refs.reservationList.clearReservationPaging();
      this.$refs.reservationList.searchHitalkReservations(true)
    }
  }
}
</script>

<style scoped>

</style>