<!--
@File(Method): RoomSearchBar.vue
@Description: 하이톡 > 대화목록 > 검색바
@Modified: 2026-01-05 - #82737 검색기능 HiSearchBox 컴포넌트로 변경
-->
<template>
   <HiSearchBox class="search-box" v-model="keyword" size="sm" placeholder="대화방 검색"  autoSearch rounded/>
</template>

<script>
// import InputTextBox from "@/apps/hitalk/components/common/InputTextBox";
import {mapMutations, mapState} from "vuex";
export default {
  name: "room-search-bar",
  // components: {
  //   InputTextBox
  // },
  computed:{
    ...mapState('storeHitalk',['roomSearchKeyword']),
    keyword: {
      get(){
        return this.roomSearchKeyword
      },
      set(keyword){
        return this.setRoomSearchKeyword(keyword);
      }
    }
  },
  methods:{
    ...mapMutations('storeHitalk',[
      'setRoomSearchKeyword'
    ]),
  }
}
</script>

<style scoped lang="scss">
.hi-search-box{
  &::v-deep{
    .hi-input{
      width: 100%;        
      input{
        &[type='text'],
        &[type='number'] {
          font-size: 15px;
        }
      }
    }
  }
}
</style>