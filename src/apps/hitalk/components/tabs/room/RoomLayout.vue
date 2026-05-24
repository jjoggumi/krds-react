<!--
@File(Method): RoomLayout.vue
@Description: 하이톡 > 대화목록 
@Modified: 2025-03-26 - #73287 하이톡 내 플로팅 UI 공통화
-->
<template>
  <div class="tab-cont-item on">
    <div class="title-wrap">
      <strong class="tab-cont-title c-list">대화목록</strong>
      <div>
        <button class="btn-setting" @click="showSettingLayer"></button>
        <!-- #73287 플로팅 레이어 공통 css 적용-->
        <div v-if="isShowSettingLayer" class="float-layer-wrap">
          <div class="float-layer" v-click-outside="hideSettingLayer">
              <button @click="changeSort(false)"><span :class="{checked: !isUnRead}"></span><span>최신 메시지 순</span></button>
              <button :style="!isTeacher ? {'border-top': '0px'}: {}" @click="changeSort(true)"><span :class="{checked: isUnRead}"></span><span>안 읽은 메시지 순</span></button>
              <button v-if="isTeacher" @click="showMutipleReadLayer"><span>읽음 처리</span></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isShowMulitpleReadLayer" class="setting-function-wrap">
      <div @click="setAlltargets">
        <input
          type="checkbox"
          id="checkAll"
          :class="{ dis : isCheckAbleCount === 0}"
          :disabled="isCheckAbleCount === 0"
          :checked="isCheckAbleCount > 0 && isCheckAbleCount === multipleReadTargets.length"
        >
        <label for="checkAll"><span>전체 선택</span></label>
      </div>
      <div>
        <button @click="hideMutipleReadLayer">취소</button>
        <button :class="{disabled: !isEableMultiReadButton}" :disabled="!isEableMultiReadButton" @click="openConfirmDialolg">읽음</button>
      </div>
    </div>
    <room-search-bar v-else />

    <div class="opponent-list-wrap c-list-wrap">
      <div class="list-cont-wrap">
        <div
          class="scrollbar-outer"
          ref="roomListContainer"
          @scroll.passive="onScroll"
        >
          <ul v-if="!isEmpty">
            <room-list-item
              v-for="(roomItem, index) of chatRoomList"
              :key="`${roomItem.room}-chatRoom-${index}`"
              :roomItem="roomItem"
              :toggleRoomItem="toggleRoomItem"
              :isShowMulitpleReadLayer="isShowMulitpleReadLayer"
              :multipleReadTargets="multipleReadTargets"
              @setMultipleTargets="setMultipleTargets"
              @showMoreLayer="showMoreLayer"
              @hideMoreLayer="hideMoreLayer"
              @closeShareReportHistoryDetail="onCloseShareReportHistoryDetail"
            />
          </ul>
          <room-empty v-else />
        </div>
      </div>
    </div>
    <confirm-dialog 
      v-if="confirmDialog.isShow" 
      :title="confirmDialog.title" 
      :description="confirmDialog.description"
      @closeConfirmDialog="closeConfirmDialog"
    />
  </div>
</template>

<script>

import RoomEmpty from "@/apps/hitalk/components/tabs/room/RoomEmpty";
import {mapActions, mapMutations, mapState, mapGetters} from "vuex";
import RoomListItem from "@/apps/hitalk/components/tabs/room/RoomListItem";
import ConfirmDialog from '@/apps/hitalk/components/popup/ConfirmDialog';
import RoomSearchBar from './RoomSearchBar.vue'

export default {
  name: "RoomLayout",
  components: {RoomListItem, RoomEmpty, ConfirmDialog, RoomSearchBar},
  data() {
    return {
      toggleRoomItem: null,
      isShowSettingLayer: false,
      isShowMulitpleReadLayer: false,
      multipleReadTargets: [],
      confirmDialog : {
        isShow: false,
        title: '',
        description: ''
      }
    }
  },
  computed:{
    ...mapState('storeHitalk', [
      'roomArrayList',
      'roomListPageIndex',
      'classJSONList',
      'isUnReadSort',
      'loginUser',
      'roomListPageInfo'
    ]),
    ...mapGetters('storeHitalk', [
      'chatRoomList'
    ]),
    isEmpty:function(){
      return this.chatRoomList.length === 0;
    },
    isCheckAbleCount: function() {
      return this.roomArrayList.filter(r => {
        const {memberRole} = this.classJSONList[r.classId]
        return r.settings.user['messageCount'] && ['OWNER', 'MANAGER'].includes(memberRole)
      }).length
    },
    isEableMultiReadButton : function() {
      return this.multipleReadTargets.length > 0
    },
    isUnRead: function() {
      return this.isUnReadSort
    },
    isTeacher: function() {
      return this.loginUser.userType === 'TEACHER'
    }
  },
  watch: {
    roomArrayList: {
      handler: function(val) {
        val.forEach(item => {
          if(item.settings.user['messageCount'] || 0 === 0){
            const deleteIndex = this.multipleReadTargets.indexOf(item.room)
            this.multipleReadTargets.splice(deleteIndex, 1)
          }
        });
      }
    },
    roomListPageIndex: {
      handler: function (val) {
        this.callChatRooms();
        if(val === 0) {
          this.$refs.roomListContainer.scrollTop = 0
        }
      }
    },
    isShowChatAreaComponent: {
      handler: function (val) {
        if(!localStorage.getItem("hitalkBannerTimeStamp") || (new Date().getTime() - parseInt(localStorage.getItem("hitalkBannerTimeStamp"))) > 24 * 3600 * 1000){
          this.setShowBanner({
            isShowBanner : !val
          });
        }
      }
    },
  },
  methods: {
    ...mapMutations('storeHitalk',['setRoomListPageIndex', 'setIsUnReadSort', 'setRoomSearchKeyword']),
    ...mapActions('storeHitalk', ['fetchReadMulti', 'callChatRooms', 'reloadPendingMessages']),
    onScroll: function () {
      if (this.$refs.roomListContainer.scrollTop + this.$refs.roomListContainer.clientHeight
        === this.$refs.roomListContainer.scrollHeight) {
        if(this.roomListPageInfo.totalPages > (this.roomListPageIndex + 1)) {
          this.setRoomListPageIndex(this.roomListPageIndex + 1);
        }
      }
    },
    showMoreLayer: function(item) {
      this.toggleRoomItem = item
      this.hideSettingLayer()
    },
    hideMoreLayer: async function(isReload) {
      this.toggleRoomItem = null
      if(isReload) {
        //this.setRoomListPageIndex(0)
        await this.callChatRooms({currentPage: this.roomListPageIndex})
        //this.$refs.roomListContainer.scrollTop = 0
      }
    },
    showSettingLayer: function() {
      this.isShowSettingLayer = true;
    },
    hideSettingLayer: function() {
      this.isShowSettingLayer = false;
    },
    showMutipleReadLayer: async function() {
      this.callChatRooms({isAll: true})
      this.hideSettingLayer()
      this.isShowMulitpleReadLayer = true
    },
    hideMutipleReadLayer: function() {
      this.multipleReadTargets = []
      this.isShowMulitpleReadLayer = false
    },
    multipleRead: async function() {
      const apiArray = this.multipleReadTargets.map(id => {
        return this.fetchReadMulti(this.roomArrayList.find(o => o.room === id))
      })
      await Promise.all(apiArray)
      this.setRoomListPageIndex(0)
      await this.callChatRooms()
      this.hideMutipleReadLayer()
    },
    setMultipleTargets: function(id) {
      const index = this.multipleReadTargets.indexOf(id)
      if(index > -1) {
        this.multipleReadTargets.splice(index, 1)
      } else {
        this.multipleReadTargets.push(id)
      }
    },
    setAlltargets: function(e) {
      e.preventDefault();
      if(this.isCheckAbleCount === this.multipleReadTargets.length) {
        this.multipleReadTargets = []
      } else {
        this.multipleReadTargets = [
          ...this.roomArrayList.filter(r => {
            const {memberRole} = this.classJSONList[r.classId]
            return r.settings.user['messageCount'] && ['OWNER', 'MANAGER'].includes(memberRole)
          }).map(r => r.room)]
      }
    },
    changeSort: async function(value) {
      this.setIsUnReadSort(value)
      this.setRoomListPageIndex(0)
      await this.callChatRooms()
      this.hideSettingLayer()
    },
    openConfirmDialolg: function() {
      const title = '선택한 대화방의 모든 메시지를\n읽음 처리 하시겠습니까?'
      const description = ''
      const modal = {
        title,
        description,
        isShow: true,
      }
      this.confirmDialog = {...modal}
    },
    closeConfirmDialog: async function(isConfirm) {
      if(isConfirm) {
        await this.multipleRead()
      }

      this.confirmDialog = {
        isShow: false,
        title: '',
        description: '',
        changeValiable: ''
      }
    },
    handleVoteChanged () {
      setTimeout(() => this.callChatRooms(), 100)
    },
    onCloseShareReportHistoryDetail() {
      this.$emit('closeShareReportHistoryDetail');
    },
  },
  created() {

  },
  async mounted() {
    // 대화목록 리스트
    this.setRoomSearchKeyword('');
    await this.reloadPendingMessages();
    this.callChatRooms();
    this.$jqueryUtil.scrollbar();
    window.addEventListener('voteChanged', this.handleVoteChanged);
  }, 
  unmounted() {
    window.removeEventListener('voteChanged', this.handleVoteChanged);
  },
}
</script>

<style scoped lang="scss">
.title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  height: 70px;
}
.btn-setting {
    width: 26px;
    height: 26px;
    background: url("../../../../../assets/img/ic_setting_26.png") no-repeat;
    margin-right: 15px;
}
.copy-btn {
  display: flex; justify-content: flex-start; align-items: center;
}
.checked {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("../../../../../assets/img/ic_check.png") no-repeat;
  margin-right: 4px;
}
.float-layer{
  right: 16px;
  button {
    width:160px;
    color: #333;
    &:nth-child(2) {
      border-top: 0;
    }
  }
}
// .more-layer-wrap {
//   position:absolute; margin:0; z-index: 100;
// }
// .more-layer-wrap .more-layer-popup-wrap {
//   display:block;
//   position:absolute;
//   border-radius:4px;
//   background:#fff;
//   box-shadow:0px 4px 12px 0 rgba(0, 0, 0, 0.2);
//   transform: translateX(-85%);
// }
// .more-layer-wrap .more-layer-popup-wrap button {width: 158px;height: 44px;font-size: 0;text-align: left;padding: 0 16px;white-space: nowrap;}
// .more-layer-wrap .more-layer-popup-wrap button:hover {background:#dae4f8;}
// .more-layer-wrap .more-layer-popup-wrap button:last-child {border-top: 1px solid #e6e6e6;}
// .more-layer-wrap .more-layer-popup-wrap button span {
//   color: #333;
//   font-family: var(--font-body);
//   font-size: 15px;
//   font-style: normal;
//   font-weight: 400;
//   line-height: 150%; /* 22.5px */
//   letter-spacing: -0.2px;
// }
.setting-function-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 57px;
  padding: 10px 15px;
  margin-right: 15px;
  border-bottom: 1px solid #e8e8e8;
}
.setting-function-wrap button {
  width: 60px;
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px; /* 153.846% */
  border-radius: 30px;
  color: var(--web-text-gray-09, #616161);
  color: #FFFFFF;
  border: 1px solid var(--primary);
  background: var(--primary);
}
.setting-function-wrap .disabled {
  color:  #FFFFFF;
  background: #D6D6D6;
  border: 1px solid #D6D6D6;
  pointer-events : none;
}
.setting-function-wrap button:not(:last-child) {
  color: var(--web-text-gray-09, #616161);
  border: 1px solid var(--web-border-gray-06, #D6D6D6);
  background: #FFFFFF;
  margin-right: 6px;  
}
.ooo-conversation-cont-wrap .opponent-list-wrap.c-list-wrap .list-cont-wrap, .ooo-conversation-cont-wrap .opponent-list-wrap.c-opponent-wrap {
    height: calc(100vh - 127px);
}
</style>