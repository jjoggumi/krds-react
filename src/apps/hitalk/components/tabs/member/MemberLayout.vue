<!--
@File(Method): MemberLayout.vue
@Description: 하이톡 > 대화상대
@Modified: 2026-01-05 - #82737 검색기능 HiSearchBox 컴포넌트로 변경
-->
<template>
  <!-- 대화상대 -->
  <div class="tab-cont-item on">
    <div class="tab-cont-title c-opponent">
      대화상대
      <HiButton v-if="isTeacher" color="link" @click="openBlockedDialog">
        <HiIcon name="ico-block" color="black" size="24"></HiIcon>
      </HiButton>
    </div>

    <template v-if="!isEmpty">
      <member-search-input v-if="isTeacher" :tags="clazzTags" :isAllowMulti="false" @search="search"/>
      <!-- <member-search-bar v-else/> -->
      <HiSearchBox v-else v-model="keyword" size="sm" placeholder="이름검색" @search="onKeywordSearch" autoSearch rounded/>
    </template>

    <div class="opponent-list-wrap" :class="{ 'c-opponent-wrap': !isEmpty, 'd-opponent-wrap': isEmpty }">
      <div class="scrollbar-outer">
        <member-empty v-if="isEmpty" />
        <member-class-list v-if="!isEmpty" :memberSearchItem="memberSearchItem" @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"/>
      </div>
    </div>

    <blocked-list-dialog v-model="showBlockedDialog"/>
    
  </div>
  <!-- 대화상대 -->
</template>

<script>
import MemberEmpty from "@/apps/hitalk/components/tabs/member/MemberEmpty";
// import MemberSearchBar from "@/apps/hitalk/components/tabs/member/MemberSearchBar";
import MemberClassList from "@/apps/hitalk/components/tabs/member/MemberClassList";
import { BlockedListDialog } from "@/apps/hitalk/components/popup/block";
import {UserLevel} from "@/enums";
import {mapActions, mapMutations, mapState} from "vuex";
import MemberSearchInput from "@/components/Search/MemberSearchInput";

export default {
  name: "MemberLayout",
  components: {MemberSearchInput, MemberClassList, /* MemberSearchBar, */ MemberEmpty, BlockedListDialog},
  computed: {
    ...mapState('storeHitalk', [
      'classJSONList',
      'searchKeyword'
    ]),
    ...mapState([
      'user'
    ]),
    isTeacher: function() {
      return (this.user || {}).userType === 'TEACHER';
    },
    isEmpty:function(){
      return Object.keys(this.classJSONList).length === 0;
    },
    noticeClassList: function () {
      return this.classJSONList
        ? Object.keys(this.classJSONList)
            .map((key) => {
              return this.classJSONList[key];
            })
            .filter((classItem) => {
              return classItem.memberRole !== UserLevel.MEMBER;
            })
        : [];
    },
    keyword: {
      get() {
        return this.searchKeyword;
      },
      set(keyword) {
        this.setSearchKeyword((keyword || '').trim());
      },
    },
  },
  data() {
    return {
      showBlockedDialog: false,
      clazzTags: [],
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      }
    }
  },
  methods: {
    ...mapMutations('storeHitalk',['setTabRoom', 'setSearchKeyword']),
    ...mapActions('storeHitalk', ['callChatUserList']),
    openBlockedDialog() {
      this.showBlockedDialog = true;
    },
    async getTags() {
      const allMemberTags = []
      for (let classItem of Object.values(this.classJSONList)) {
        allMemberTags.push(...classItem.users.flatMap(u => (u.tags || [])))
      }

      allMemberTags.forEach(newTag => {
        if (this.clazzTags.map(tag => tag.tagName).includes(newTag.tagName)) {
          const duplicateTag = this.clazzTags.find(tag => tag.tagName === newTag.tagName)
          if (duplicateTag && !duplicateTag.tagIds.includes(newTag.tagId)) {
            duplicateTag.tagIds.push(newTag.tagId)
          }
        } else {
          this.clazzTags.push({...newTag, tagIds: [newTag.tagId]})
        }
      })
    },
    search({ searchType, searchValue }) {
      if (searchType === 'NONE' || searchType === 'KEYWORD') {
        this.setSearchKeyword(searchValue)
      }
      if (searchType === 'TAG') {
        searchValue = this.clazzTags.find(tag => tag.tagId === searchValue).tagIds || []
      }
      this.memberSearchItem = { searchType, searchValue }
    },
    onKeywordSearch(val) {
      const keyword = (val || '').trim();
      this.setSearchKeyword(keyword);
      this.memberSearchItem = { searchType: 'KEYWORD', searchValue: keyword };
    },
    initSearch() {
      this.memberSearchItem = {
        searchType: 'NONE',
        searchValue: ''
      }
      this.setSearchKeyword('')
    },
    onCloseShareReportHistoryDetail() {
      this.$emit('closeShareReportHistoryDetail');
    },
  },
  async mounted() {
    this.initSearch();
    await this.callChatUserList();
    this.$jqueryUtil.scrollbar();
    if (localStorage.getItem("hitalkShareSend")) {
      this.setTabRoom();
      localStorage.removeItem("hitalkShareSend");
    }
    if (this.isTeacher) {
      await this.getTags()
    }
  },
};
</script>

<style lang="scss" scoped>
.title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  height: 70px;
}
/* 대화 상대, 대화 목록의 search-box 공통으로 사용위해 global(hitalk.css)로 이동 
.search-box {
  margin:10px 15px;
}
.search-box + .opponent-list-wrap{border-top:1px solid #e8e8e8; } */
.btn-blocked {
    width: 26px;
    height: 26px;
    background: url("../../../../../assets/img/ic_setting_26.png") no-repeat;
    margin-right: 15px;
}
.ooo-conversation-cont-wrap .opponent-list-wrap.c-list-wrap .list-cont-wrap, .ooo-conversation-cont-wrap .opponent-list-wrap.c-opponent-wrap {
    height: calc(100vh - 127px);
}
.ooo-conversation-cont-wrap .opponent-list-wrap.c-list-wrap .list-cont-wrap,
.ooo-conversation-cont-wrap .opponent-list-wrap.d-opponent-wrap {
  height: calc(100vh - 70px);
}
.hi-search-box{
  margin: 10px 15px;
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
