<template>
  <div class="empty-wrap">
    <div class="img-wrap">
      <img src="@/assets/img/icon/icon_nolist_chat.png" alt="">
    </div>
    <div class="text-wrap" v-if="!isSearchResult">
      <p>생성된 대화가 없습니다.<br>지금 바로 1:1 대화를 시작해보세요.</p>
    </div>
    <div class="text-wrap" v-else>
      <p>검색결과가 없습니다.</p>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
export default {
  name: "RoomEmpty",
  computed:{
    ...mapState('storeHitalk',['roomSearchKeyword']),
    isSearchResult: function() {
      return this.roomSearchKeyword !== ''
    }
  }
}
</script>

<style scoped>
.empty-wrap {
  height: 455px;
}
</style>