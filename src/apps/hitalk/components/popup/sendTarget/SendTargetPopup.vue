<!--
@File(Method): SendTargetPopup.vue
@Description: 하이톡 > 대화상대 > 단체
@Modified: 2025-05-19 - #74553 쌍방향 단체톡 베타오픈 (기간채팅방)
-->
<template>
  <div v-show="sendMessageItem.isGetAllClassSubscribes">
    <HiModal type="type01" size="lg" @close="setTargetPopupIsOpen(false)" class="hitalk">
      <template v-slot:heading>단체방 만들기</template>
      <template v-slot:content>
        <div class="hi-row sm-gutters a-stretch">
          <div class="col-sm-6">
            <div class="box-border box-con-s">
              <div class="tit-h4 fst">
                단체방 종류 선택  
                <!-- #74553 쌍방향 단체톡 베타오픈 (기간채팅방) : 문구 삭제-->
                <hi-tooltip v-if="showGroupChat" class="hi-tooltip-wrap info" :title-html="`
                - 공지방: 선택한 구성원에게 공지성 안내를 할 수 있습니다. (선생님만 채팅 가능)<br>
                - 일반 대화방: 선택한 구성원 모두 대화 가능합니다.<br>
                - 기간 대화방: 선택한 구성원 모두가 채팅 가능하며, 설정한 종료일까지 채팅방이 운영됩니다.`
                " />
                <hi-tooltip v-if="showGroupChatLimit" class="hi-tooltip-wrap info" :title-html="`
                - 공지방: 선택한 구성원에게 공지성 안내를 할 수 있습니다. (선생님만 채팅 가능)<br>
                - 기간 채팅방: 선택한 구성원 모두가 채팅 가능하며, 설정한 종료일까지 채팅방이 운영됩니다.`
                " />
                <span v-if="showGroupChat" class="tooltip-ani type02 sm" >
                  <span>신규기능</span>
                </span>
              </div>
              <div>
                <input type="radio" name="radio" id="radio1" v-model="requestBody.groupType" value="NOTICE" />
                <label for="radio1" class="d-block mb-15"><span>공지방</span></label>

                <input type="radio" name="radio" id="radio2" v-model="requestBody.groupType" value="GENERAL" v-if="showGroupChat"/>
                <label for="radio2" class="d-block mb-15" v-if="showGroupChat"><span>일반 채팅방</span></label>
                
                <div class="mb-15 d-flex j-between a-middle" v-if="showGroupChatLimit">
                  <input type="radio" name="radio" id="radio3" v-model="requestBody.groupType" value="LIMIT" />
                  <label for="radio3" >
                    <span>기간 채팅방</span>                
                    <i class="badge-beta"></i>             
                  </label>
                </div>
                <calendar-input 
                  v-if="requestBody.groupType === 'LIMIT'" 
                  placeholder="기간을 선택해주세요."
                  @select="onSelectDate"
                  :notForReservation="true"
                  :defaultHour="18"
                  :defaultPaddingMinutes="60"
                  :minutePadding="0"
                  :maxDateTimestamp="new Date().getTime() + 1000 * 60 * 60 * 24 * 90"
                />
              </div>
              <div class="tit-h4">단체방 명</div>
              <div class="input-box-wrap">
                <input type="text" maxlength="30" v-model="requestBody.roomName" @keyup="e => setRoomName(e.target.value)">
              </div>
              <div class="tit-h4 d-flex">
                단체방 알림설정 
                <hi-switch :model.sync="requestBody.pushUsed" />
              </div>
              <div class="smr txt-defalut">
                내 알림에 대한 설정이며, 구성원은 “알림 on”<br>으로 생성됩니다.
              </div>
            </div>
          </div>
          <div class="col-sm-6">            
            <div class="box-border pb-00">
              <div class="tit-h4 fst">
                구성원 목록  
                <span class="num">
                  <span class="ft-blue">
                    {{ sendMessageItem.targets.length }}
                  </span>
                 / {{ sendMessageItem.classSubscribes.length }}명
                </span>
              </div>
              <div class="select-target-wrap">
                <MemberSearch :clazzTags="clazzTags" @search="search"/>
                <target-top v-if="sendMessageItem.classSubscribes.length > 0"
                  :memberSearchItem="memberSearchItem"
                  :groupType="requestBody.groupType"
                  />
                <target-list :target="'target'" :memberSearchItem="memberSearchItem" :groupType="requestBody.groupType"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <HiButton color="line-default" size="lg" @click="setTargetPopupIsOpen(false)">취소</HiButton>
          <HiButton color="primary" size="lg" :disabled="!isValidForm"
          @click="createRoom">만들기</HiButton>           
      </template>
    </HiModal>
    <div class="window-popup-atten type2">
    </div>
  </div>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import TargetList from "@/apps/hitalk/components/popup/components/common/targetList/TargetList";
import TargetTop from "@/apps/hitalk/components/popup/components/common/targetList/TargetTop";
import HiTooltip from "@/components/Tooltip/HiTooltip.vue";
import HiSwitch from "@/components/Form/HiSwitch.vue";
import CalendarInput from "@/apps/hitalk/components/popup/components/common/select/CalendarInput";
import MemberSearch from "@/components/Search/MemberSearch";
import {ymdhm, buildLimitTimestampFromDateJson, getDefaultGroupRoomName} from '@/apps/hitalk/utils'

const InitialRequestBody = {
  roomType: "GROUP",
  memberType: "CUSTOM",
  classId: '',
  content: '',
  groupType: 'NOTICE',
  limitTimestamp: 0,
  pushUsed: true,
  roomName: ''
}

export default {
  name: "send-target-popup",
  components: {TargetTop, TargetList, HiTooltip, HiSwitch, CalendarInput, MemberSearch},
  data() {
    return {
      isTenUnder: false,
      unusedFiles: [],
      clazzTags: [],
      memberSearchItem: {
        searchType: 'NONE',
        searchValue: ''
      },
      requestBody: {...InitialRequestBody},
      targetUserTime: {}
    }
  },
  computed: {
    ...mapState('storeHitalk', ['blockedUsers', 'sendMessageItem', 'classJSONList']),
    ...mapState(['user', 'versionData']),
    isValidForm() {
      return this.sendMessageItem.targets.length > 0
        && (this.requestBody.groupType !== 'LIMIT' || this.requestBody.limitTimestamp > 0)
        && this.requestBody.roomName.trim().length > 0
    },
    blockedIds() {
      return this.blockedUsers.map(u => u.userId)
    },
    hasBlockedUser() {
      return this.sendMessageItem.targets.some(t => this.blockedIds.includes(t))
    },
    currentClass() {
      return this.classJSONList[this.sendMessageItem.classId].class
    },
    showGroupChat() {
      return (this.versionData.hitalk || {}).groupRoom || false
    },
    showGroupChatLimit() {
      return (this.versionData.hitalk || {}).groupRoomLimit || false
    }
  },
  watch: {
    'requestBody.groupType' () {
      this.updateRoomName()
    },
    'sendMessageItem.targets' () {
      if (this.sendMessageItem.targets.length > 100) {
        this.$hiClass.alert('최대 100명까지 선택 가능합니다.')
        this.setSendMessageItem({targets: this.sendMessageItem.targets.slice(0, 100)})
      }
    }
  },
  methods: {
    ...mapMutations('storeHitalk', ['setTargetPopupIsOpen', 'clearSendMessageItem', 'setSendMessageItem']),
    ...mapActions('storeHitalk', ['callCreateRoom']),
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    /**
     * 단체방 생성
     * @returns {Promise<void>}
     */
    async createRoom() {
      if (this.hasBlockedUser && !await this.confirmOfBlockedUsers()) return;
      if (!this.checkValidationOfLimitTimestamp()) return;

      this.$emit('closeShareReportHistoryDetail');
      
      await this.callCreateRoom({
        ...this.requestBody,
        content: this.sendMessageItem.targets.join(','),
        limitTimestamp: this.requestBody.groupType === 'LIMIT' ? this.requestBody.limitTimestamp : null
      })

      // 기간 채팅방 생성시 GA 이벤트 발송
      if (this.requestBody.groupType === 'LIMIT') {
        this.triggerAnalyticsLogEvent({code: `analytics.hitalk.create.room.limit`})
      }

      this.setTargetPopupIsOpen(false)
    },
    checkValidationOfLimitTimestamp() {
      const limitYmdhm = ymdhm(new Date(this.requestBody.limitTimestamp))
      const nowYmdhm = ymdhm(new Date())
      if (this.requestBody.groupType === 'LIMIT' && limitYmdhm <= nowYmdhm) {
        this.$hiClass.alert('종료일을 다시 설정해 주세요.')
        return false
      }
      return true
    },
    async confirmOfBlockedUsers() {
      try {
        await this.$hiClass.confirm(`
          메시지 발송이 차단된 구성원이<br>
          포함되어 있습니다.<br>
          단체 채팅방을 생성하시겠습니까?`.trim(), '', {
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            reverseButtons: true
        })
        return true
      } catch (e) {
        return false
      }
    },
    async getTags() {
      const res = await this.$axios.get(`/clazzes/${this.sendMessageItem.classId}/tags`)
      if (res.data._embedded && res.data._embedded.clazzTags.length > 0) {
        this.clazzTags = res.data._embedded.clazzTags
      }
    },
    search({ searchType, searchValue }) {
      this.memberSearchItem = { searchType, searchValue }
    },
    initRequestBody() {
      this.requestBody = {...InitialRequestBody}
      this.requestBody.classId = this.sendMessageItem.classId
      this.updateRoomName()
    },
    updateRoomName() {
      if (this.requestBody.roomName.trim().length > 0
        && !this.isDefaultRoomNamePattern()) return;
      this.setRoomName(getDefaultGroupRoomName(this.currentClass, this.requestBody.groupType))
    },
    setRoomName(roomName) {
      this.requestBody.roomName = roomName
    },
    isDefaultRoomNamePattern() {
      const rn = this.requestBody.roomName
      return rn.startsWith(this.currentClass.classBan) 
        && ['단체 채팅방', '단체 공지방'].includes(rn.replace(this.currentClass.classBan, '').trim())
    },
    onSelectDate(d) {
      this.requestBody.limitTimestamp = buildLimitTimestampFromDateJson(d)
    }
  },
  mounted() {
    this.initRequestBody()
  },
  created() {
    this.getTags()
  },
  beforeDestroy() {
    this.clearSendMessageItem()
  }
}
</script>

<style lang="scss" scoped>
.box-border{
  padding: 25px 20px;
  text-align: left;
}
.tit-h4{ 
  .hi-tooltip-wrap{
    margin-left: 4px;
    ::v-deep .hi-tooltip{
      left: -36px;
      top: 21px;
      &::before{
        left: 40px;
      }
    }
  }
  .tooltip-ani{
    position: static;
    margin-left: 6px;
  }
}
.set-date-wrap{
  margin-top: -5px;
  // position: absolute;
  // right: 20px;
}
.set-date-wrap::v-deep .date-cont-wrap .date-wrap{
  max-width: 170px;
}
.set-date-wrap::v-deep .note-resev-pop{
  right: auto;
  left: calc(100% + 10px);
  top: -123px;
}
.select-target-wrap{
  margin: 0 -20px;
  .select-target__list{
    ::v-deep .hi-nodata{
      padding: 125px 0; 
    }
  }
}
.badge-beta{
  display: inline-block;
  width: 40px;
  height: 18px;
  background-image: url("~@/assets/img/svg/badge-beta.svg");
  vertical-align: middle;
  margin-left: 10px;
}
</style>