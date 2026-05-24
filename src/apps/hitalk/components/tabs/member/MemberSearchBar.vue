<!--
@File(Method): MemberSearchBar.vue
@Description: 하이톡 > 대화상대 > 검색바(선생님 아닐때)
@Modified: 2025-03-25 #73255 하이톡 > 대화상대 검색영역을 대화상대 검색과 동일하게 수정 요청
-->
<template>
  <div class="search-box no-btn">
    <div class="input-box-wrap round-search-box">
      <input-text-box v-model="keyword"/>
      <HiButton v-if="keyword" color="link" size="md" class="btn-delete" @click="keyword = ''">
        <HiIcon name="ico-close3" size="14"  color="white" bgColor="gray" rounded="rounded"/>
      </HiButton>
    </div>
  </div>
</template>

<script>
import InputTextBox from "@/apps/hitalk/components/common/InputTextBox";
import {mapMutations, mapState} from "vuex";
export default {
  name: "MemberSearchBar",
  components: {
    InputTextBox
  },
  computed:{
    ...mapState('storeHitalk',['searchKeyword']),
    keyword: {
      get(){
        return this.searchKeyword
      },
      set(keyword){
        return this.setSearchKeyword(keyword);
      }
    }
  },
  methods:{
    ...mapMutations('storeHitalk',[
      'setSearchKeyword'
    ]),
  }
}
</script>

<style scoped>
</style>