<!--
@File(Method): TimeSettingLayout.vue
@Description: 상담 가능 시간 설정 팝업 
@Modified: 2025-04-16 - #72806 하이톡웹뷰 상담시간 분류 -  하이톡웹뷰 분기처리위해 식별 class 추가
-->

<template>
  <HiModal size="md" type="type01" class="time-setting" @close="closeLayerPopupTimeSetting" style="display: block;"  v-if="ready">
    <template v-slot:heading>상담 가능 시간 설정</template>
    <template v-slot:content> 
      <EnvironmentSelector v-if="isUnderElectron && isOpenEnvironmentSelector" @close="onCloseEnvironmentSelector"></EnvironmentSelector>
      <confirm-dialog 
      v-if="confirmDialog.isShow" 
      :title="confirmDialog.title" 
      :description="confirmDialog.description"
      @closeConfirmDialog="closeConfirmDialog"
      />
      <div class="setting-cont-wrap"><!-- #70793 상담시간 분류 - 미사용 class (timer-root)삭제 -->
        <div class="tab-wrap mb-15">
          <button
            v-bind:class="{'is-active':curForm === 'chat'}" 
            @click="tabClick('chat')"
          >
            메시지 (하이톡)
          </button>
          <button
            v-bind:class="{'is-active':curForm === 'call'}"
            @click="tabClick('call')"
          >
            전화 (하이콜)
          </button>
        </div>
        <div class="time-wrap"><!-- #70793 상담시간 분류 - 미사용 class ( timer-area)삭제 -->
          <div class="timer-card">
            <div class="sub-title">
              {{onOffTitle}} 사용 여부
              <div class="hi-switch">
                <input type="checkbox" id="isUse" @click="onClickIsUse" v-model="isVisibleEdit">
                <label for="isUse">
                  <span class="track"></span>
                </label>
              </div>
            </div>            
            <div class="on-off-text">
              구성원과 쌍방 소통을 원할 경우 {{ onOffTitle }} 사용을 ON으로,<br>선생님의 일방 소통을 원할 경우 사용을 <span @click="onClickSecretButton">&nbsp;OFF</span>로 설정해주세요.
            </div>              
          </div>
          <div v-if="isVisibleEdit" class="timer-card">
            <div class="sub-title">상담 가능 시간</div>
            <div class="on-off-text" v-if="curForm === 'chat'">
              상담 시간 외에는 알림(푸시)이 오지 않으며, 메시지를 확인해도 읽음처리<br>되지 않습니다.
            </div>
            <div class="on-off-text" v-if="curForm === 'call'">
              구성원은 상담 가능 시간에만 선생님에게 하이콜을 걸 수 있으며,<br>선생님은 상담시간과 관계없이 언제든지 하이콜을 사용할 수 있습니다.
            </div>
            
            <div class="day-wrap">
              <div class="tit">요일 설정</div> <!-- #70793 상담시간 분류 - 타이틀 추가 -->
              <div class="day" v-for="(d, i) in ['일', '월', '화', '수', '목', '금', '토']" :key="i">
                <input type="checkbox" :id="`weekday-${i}`" @change="changeSelectedDays" :value="i" v-model="context[curForm].selectedDays">
                <label :for="`weekday-${i}`"><span :class="{'ft-orange': d === '일', 'ft-blue': d === '토'}">{{ d }}</span></label>
              </div>
            </div>
            <div v-if="!isShowTimeSetNotiMessage" class="setting-time-wrap">                        
              <div class="tit-wrap">
                <div class="tit">시간 설정 
                  <hi-tooltip class="hi-tooltip-wrap info bottom" :title-html="`상담 시간을 최대 3개까지 설정하실 수 있습니다.`" />
                </div>
                <HiButton color="primary" outline size="xs" @click="onClickAddTime" v-if="!disabledAdding">
                  <HiIcon name="ico-plus2" color="primary" size="14"/>
                  시간 추가
                </HiButton>
              </div>
              <div class="start-time-wrap" v-for="t, idx in context[curForm].times" v-if="t.used" :key="idx">
                <div class="stit">상담시간<template v-if="useMultiTimes">({{ idx + 1 }})</template></div>                         
                <div class="st-time-setting">
                  <hi-select-box
                    :clickInjector="clickInjectorOf(idx)"
                    :value.sync="t.start.hour"
                    :items="selectionItems[idx].start.hour"
                    emptyTitle="선택"
                    @update:value="onUpdateHour(idx, 'start')"
                    @open="validateVerticalScroll"/>
                  <hi-select-box 
                    :clickInjector="clickInjectorOf(idx)"
                    :value.sync="t.start.min"
                    :items="selectionItems[idx].start.min"
                    emptyTitle="선택"
                    @update:value="onUpdateMin(idx, 'start')"
                    @open="validateVerticalScroll"/>
                    ~
                  <hi-select-box 
                    :clickInjector="clickInjectorOf(idx)"
                    :value.sync="t.end.hour"
                    :items="selectionItems[idx].end.hour"
                    emptyTitle="선택"
                    @update:value="onUpdateHour(idx, 'end')"
                    @open="validateVerticalScroll"/>
                  <hi-select-box 
                    :clickInjector="clickInjectorOf(idx)"
                    :value.sync="t.end.min"
                    :items="selectionItems[idx].end.min"
                    emptyTitle="선택"
                    @update:value="onUpdateMin(idx, 'end')"
                    @open="validateVerticalScroll"/>
                  <HiButton color="link" class="btn-del-date" v-if="idx > 0" @click="onClickRemoveTimeAt(idx)">
                    <HiIcon name="ico-minus2" color="white" bgColor="default" rounded="rounded" size="14"/>
                  </HiButton>
                </div>
              </div>
            </div>
            <div v-else class="time-set-noti-box mt-15" v-html="getTimeSetNoti"></div>
          </div>
          <div class="timer-card" v-if="curForm === 'chat' && context.chat.isUse">
            <div class="sub-title mb-05">
              <span>상담 시간에만 <span @click="onClickSecretButton">&nbsp;메시지&nbsp;</span> 받기
              <!-- #70793 상담시간 분류 - HiTooltip 적용 -->
              <hi-tooltip class="hi-tooltip-wrap info top ml-05" :title-html="`상담 가능 시간 외에는 구성원들이 선생님께<br>메시지를 보내지 못하도록 설정할 수 있습니다.`" />    
              </span>
              <div class="day">
                <input type="checkbox" id="isOver" @click="onClickIsOverChat" :checked="!originalUserTime.isOverChat">
                <label for="isOver"><span></span></label>
              </div>                        
            </div>                    
            <div class="on-off-text">
              구성원들은 상담 가능 시간에만 메시지를 보낼 수 있습니다.
            </div>
          </div>
          <div class="audio-card" v-if="curForm === 'call'">
            <div>
              <div class="sub-title mb-05">
                <span>
                  하이콜 통화연결음
                  <hi-tooltip class="hi-tooltip-wrap message top ml-05" :title-html="`“전화를 받는 선생님도 누군가의 소중한 가족입니다.<br>존중하는 마음으로 따뜻한 대화를 부탁드립니다.”`" />    
                </span>
              </div>
              <div class="on-off-text">
                선생님의 교권보호를 위한 내용이 포함되어 있습니다.
              </div>
            </div>
            <div>
              <button :class="audioPlayClass" @click="audioPlay">
                <img :src="audioPlayIcon">
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <HiButton color="gray" size="lg" @click="closeLayerPopupTimeSetting">취소</HiButton>
      <HiButton color="primary" size="lg" 
        :class="{dis: disabled}"
        :disabled="disabled"
        @click="updateTimeSetting">확인
      </HiButton>      
    </template>
  </HiModal>
</template>

<script>
import {mapActions, mapMutations, mapState} from 'vuex';
import ConfirmDialog from './ConfirmDialog'
import HiSelectBox from '@/components/Form/HiSelectBox.vue'
import HiTooltip from "@/components/Tooltip/HiTooltip.vue";
import EnvironmentSelector from './electron/EnvironmentSelector.vue';
import { z00, useElectronController } from '../../utils'

const emptyTimeObject = () => ({
  used: false,
  start: {
    hour: 0,
    min: 0
  },
  end: {
    hour: 0,
    min: 0
  }
})

const plusOneMin = ({hour, min}) => min < 59 ? {hour, min: min + 1} : hour < 23 ? {hour: hour + 1, min: 0} : {hour: 0, min: 0}
const resetTime = t => { t.hour = null; t.min = null }
const resetTimeObject = to => { resetTime(to.start); resetTime(to.end) }
const toHhmm = ({hour, min}) => `${z00(hour)}${z00(min)}`
const hasData = ({hour, min}) => hour !== null && min !== null
const valid = ({used, start, end}) => used && hasData(start) && hasData(end)
  
const electronController = useElectronController();

export default {
  name: 'TimeSettingLayout',
  components: {ConfirmDialog, HiSelectBox, HiTooltip, EnvironmentSelector},
  data: () => ({
    context: ['chat', 'call'].reduce((acc, cur) => {
      acc[cur] = {
        isUse: false,
        selectedDays: [],
        times: [...new Array(3)].map(emptyTimeObject)
      }
      return acc
    }, {}),
    originalUserTime: {},
    curForm: 'chat',
    audio: new Audio('/files/sounds/hicall-connect-sound.mp3'),
    isPlay: false,
    confirmDialog : {
      isShow: false,
      title: '',
      description: '',
      changeValiable: ''
    },
    ready: false,
    isOpenEnvironmentSelector: false
  }),
  computed: {
    ...mapState('storeHitalk', [
      'isShowTimeSetting',
      'timeSettingInitData'
    ]),
    isVisibleEdit: function() {
      return this.context[this.curForm].isUse
    },
    audioPlayClass: function() {
      return this.isPlay ? 'audio-pause-btn' : 'audio-play-btn'
    },
    audioPlayIcon: function() {
      return this.isPlay ? require('../../../../assets/img/icon/ic_play_pause.svg') : require('../../../../assets/img/icon/ic_volume.svg')
    },
    onOffTitle: function () {
      return this.curForm === 'chat' ? '하이톡' : '하이콜'
    },
    disabled: function () {
      const context = this.context[this.curForm]
      const series = context.times.filter(t => t.used).map(t => [toHhmm(t.start), toHhmm(t.end)]).flat()
      const sorted = JSON.parse(JSON.stringify(series)).sort()
      return context.isUse && context.selectedDays.length > 0 && (
        context.times.filter(t => t.used).some(t => toHhmm(t.start) === toHhmm(t.end))
        || context.times.filter(t => t.used).some(t => !hasData(t.start) || !hasData(t.end))
        || series.join('') !== sorted.join('')
      )
    },
    isShowTimeSetNotiMessage: function () {
      return this.context[this.curForm].selectedDays.length === 0
    },
    getTimeSetNoti: function () {
      return this.curForm === 'chat' 
        ? '상담 가능 요일이 모두 해제되어 상담 시간을 설정할 수 없습니다.<br>구성원의 메시지 수신은 가능하나<br>메시지를 확인해도 읽음처리 되지 않습니다.'
        : '상담 가능 요일이 모두 해제되어 상담 시간을 설정할 수 없습니다.<br>하이콜 수신이 불가합니다.'
    },
    disabledAdding: function () {
      const ts = this.context[this.curForm].times
      const filtered = ts.filter(t => t.used)
      return filtered.length >= 3
    },
    selectionItems: function () {
      let mins = {hour: 0, min: 0}
      const items = (n, x) => Array.from({length: x - n}, (_, i) => ({title: z00(i + n), value: i + n}))
      const toItems = ({hour, min, maxMin}) => ({hour: items(hour, 24), min: items(min, maxMin || 60)})
      return this.context[this.curForm].times.map((t, idx) => {
        if (mins.hour === -1) return {start: {hour: [], min: []}, end: {hour: [], min: []}}
        const start = { hour: mins.hour, min: t.used && t.start.hour === mins.hour ? mins.min : 0 }
        if (t.used && toHhmm(t.start) === '2359') {
          mins = {hour: -1, min: -1}
          return {
            start: toItems(start),
            end: {hour: [], min: []}
          }
        }
        start.maxMin = t.used && t.start.hour === 23 ? 59 : 60
        mins = plusOneMin(t.used && t.start.hour ? t.start : start)
        const end = { hour: mins.hour, min: t.used && t.end.hour === mins.hour ? mins.min : 0 }
        mins = t.used && t.end.hour ? t.end : end
        if (mins.hour === 0 && mins.min === 0) mins = {hour: -1, min: -1}
        return {
          start: toItems(start),
          end: toItems(end)
        }
      })
    },
    useMultiTimes () {
      return this.context[this.curForm].times.filter(t => t.used).length > 1
    },
    isUnderElectron() {
      return electronController.isUnderElectron()
    }
  },
  methods: {
    ...mapMutations('storeHitalk',[
      // 'toggleTimeSetting',
      'hideTimeSetting',
      'clearTimeSettingInitData',
    ]),
    ...mapActions('storeHitalk', [
      'callUserTime',
      'callUpdateTimeSetting'
    ]),
    changeSelectedDays() {
      if (this.context.chat.selectedDays.length === 0 && !this.originalUserTime.isOverChat) {
        this.$hiClass.alert('상담 가능 시간이 없어 상담 시간에만 메시지 받기가 OFF로 변경됩니다.', 'info')
        this.originalUserTime.isOverChat = true
      } 
    },
    openConfirmDialolg(changeValiable) {
      const title = changeValiable === 'isUseChat' 
        ? '하이톡 사용을\nOFF 하시겠습니까?'
        : changeValiable === 'isUseCall' ? '하이콜 사용을\nOFF 하시겠습니까?' : '상담 시간에만 메시지 받기를\nON 하시겠습니까?'
      const description = changeValiable === 'isUseChat' 
        ? '선생님만 메시지를 보낼수 있습니다.\n(학부모/학생 메시지 발신 불가)'
        : changeValiable === 'isUseCall' ? '선생님만 전화를 걸 수 있습니다.\n(학부모/학생 발신 불가)' : '상담 가능 시간에만 학부모/학생이\n선생님에게 메시지를 보낼 수 았습니다.'  
      const modal = {
        changeValiable,
        title,
        description,
        isShow: true,
      }
      this.confirmDialog = {...modal}
    },
    closeConfirmDialog(isConfirm) {
      if(isConfirm) {
        switch(this.confirmDialog.changeValiable) {
          case 'isUseChat' : {
            this.context['chat'].isUse = !this.context['chat'].isUse
            break;
          }
          case 'isUseCall' : {
            this.context['call'].isUse = !this.context['call'].isUse
            break;
          }
        }
      }

      this.confirmDialog = {
        isShow: false,
        title: '',
        description: '',
        changeValiable: ''
      }
    },
    audioPlay() {
      if(!this.isPlay) {
        this.audio.currentTime = 0; 
        this.audio.play();
      } else {
        this.audio.pause();
      }
      this.isPlay = !this.isPlay
    },
    tabClick(curForm) {
      this.curForm = curForm;
    },
    getHourString: function (value) {
      return value.toString().padStart(2, '0');
    },
    getMinString: function (value) {
      return value.toString().padStart(2, '0');
    },
    closeLayerPopupTimeSetting: function () {
      this.clearTimeSettingInitData();
      this.hideTimeSetting();
    },
    adjustEndTimes () {
      ['Chat', 'Call'].forEach(a => {
        const k = a.toLowerCase()
        const context = this.context[k]
        if (context.isUse && context.selectedDays.length > 0) return;
        context.times.filter(t => t.used && hasData(t.start) && !hasData(t.end)).forEach(t => {
          t.end = plusOneMin(t.start)
        })
      })
    },
    updateTimeSetting: function () {
      this.adjustEndTimes()
      return this.callUpdateTimeSetting({
        ...this.originalUserTime,
        isUseSetting: true,
        isUseChat: this.context.chat.isUse,
        userChatDay: this.context.chat.selectedDays.sort((a, b) => a > b ? 1 : -1).join(','),
        ...['Chat', 'Call'].reduce((acc, cur) => {
          ['', '2', '3'].forEach((s, i) => {
            const time = this.context[cur.toLowerCase()].times[i];
            ['Start', 'End'].forEach(t => {
              acc[`user${cur}${t}Time${s}`] = valid(time)
                ? toHhmm(time[t.toLowerCase()]) : null
            })
          })
          return acc
        }, {}),
        isUseCall: this.context.call.isUse,
        userCallDay: this.context.call.selectedDays.sort((a, b) => a > b ? 1 : -1).join(',')
      })
    },
    onClickIsUse(e) {
      e.preventDefault();
      if (this.context[this.curForm].isUse) {
        this.openConfirmDialolg(this.curForm === 'chat' ? 'isUseChat' : 'isUseCall')
      } else {
        setTimeout(() => {
          this.context[this.curForm].isUse = !this.context[this.curForm].isUse
        })
      }
    },
    async onClickIsOverChat(e) {
      e.preventDefault();
      this.$toasted.clear()
      const options = { duration: 2000 }
      if (this.originalUserTime.isOverChat) {
        if (this.context.chat.selectedDays.length === 0) {
          this.$hiClass.alert('상담 가능 시간이 없어 상담 시간에만 메시지 받기를 설정할 수 없습니다.', 'info')
          return;
        }
        this.$toasted.show('상담 가능 시간에만 학부모/학생이 선생님에게 메시지를 보낼 수 있습니다.', options)
      } else {
        this.$toasted.show('상담시간 외에도 메시지를 받을 수 있으며<br>상담 시간 외에 확인 시 읽음1이 사라지지 않습니다.', options)
      }
      setTimeout(() => {
        this.originalUserTime.isOverChat = !this.originalUserTime.isOverChat
      })
    },
    async callTimeSettingInfo() {
      const r = await this.callUserTime({userId: localStorage.uuid, userType: 'TEACHER', memberRole: 'OWNER', isSetUserTime: false})
      this.originalUserTime = r;
      ['Chat', 'Call'].forEach(a => {
        const k = a.toLowerCase()
        this.context[k].isUse = r[`isUse${a}`]
        this.context[k].selectedDays = r[`user${a}Day`] ? r[`user${a}Day`].split(',') : [];
        ['', '2', '3'].forEach((s, i) => {
          this.context[k].times[i].used = true;
          ['Start', 'End'].forEach(t => {
            const key = `user${a}${t}Time${s}`
            if (!r[key]) {
              this.context[k].times[i].used = false
              return
            }
            this.context[k].times[i][t.toLowerCase()].hour = parseInt(r[key].substr(0, 2))
            this.context[k].times[i][t.toLowerCase()].min = parseInt(r[key].substr(2, 2))
          })
        })
      })

      this.applyTimeSettingInitData();
    },
    async validateVerticalScroll () {
      await this.$nextTick()
      const e = this.$el.querySelector('.time-wrap')
      e.scrollTop = e.scrollHeight
    },
    async onClickAddTime () {
      if (!this.checkFullMaxTime()) return
      const t = this.context[this.curForm].times
      const idx = t.findIndex(t => !t.used)
      if (idx === -1) return
      t[idx].used = true
      await this.$nextTick()
      this.resetNextTimes(idx - 1)
    },
    onClickRemoveTimeAt (idx) {
      this.context[this.curForm].times.splice(idx, 1)
      this.context[this.curForm].times.push(emptyTimeObject())
    },
    checkFullMaxTime (idx = -1) {
      const hasFullMaxTime = this.context[this.curForm].times.filter(t => t.used).some(t => toHhmm(t.end) === '2359')
      if (hasFullMaxTime) {
        if (idx > -1) resetTimeObject(this.context[this.curForm].times[idx])
        this.$hiClass.alert('설정할 수 있는 상담 시간이 없습니다.<br>시간을 확인해 주세요.');
        return false
      }
      return true
    },
    async onUpdateHour (idx, type) {
      if (idx > 0 && !this.checkFullMaxTime(idx)) return
      await this.$nextTick()
      this.context[this.curForm].times[idx][type].min = this.selectionItems[idx][type].min[0].value
      this.resetNextTimes(idx)
    },
    async onUpdateMin (idx) {
      await this.$nextTick()
      this.resetNextTimes(idx)
    },
    resetNextTimes (idx) {
      this.context[this.curForm].times.filter((_, i) => i > idx).forEach(t => {
        t.start = { hour: null, min: null }
        t.end = { hour: null, min: null }
      })
      const thisTime = this.context[this.curForm].times[idx]
      if (toHhmm(thisTime.start) >= toHhmm(thisTime.end)) {
        this.context[this.curForm].times[idx].end.hour = null
        this.context[this.curForm].times[idx].end.min = null
      }
    },
    clickInjectorOf(idx) {
      return () => {
        const validations = this.context[this.curForm].times.map((t, i) => [i, valid(t)])
        const [i, v] = validations.find(([i, v]) => i < idx && !v) || []
        if (i !== undefined) {
          this.$toasted.show(`상담시간 (${i + 1})${i === 0 ? '을' : '를'} 입력해 주세요.`)
          return false
        }
        return true
      }
    },
    onClickSecretButton() {
      this.isOpenEnvironmentSelector = electronController.increaseSecretButtonCount() >= 5
    },
    onCloseEnvironmentSelector() {
      this.isOpenEnvironmentSelector = false
      electronController.resetSecretButtonCount()
    },
    applyTimeSettingInitData() {
      if (!this.timeSettingInitData || this.timeSettingInitData.source !== 'onboarding') return;

      this.context.chat.isUse = !!this.timeSettingInitData.context?.chat?.isUse;
      this.context.call.isUse = !!this.timeSettingInitData.context?.call?.isUse;
      this.curForm = this.timeSettingInitData.initialTab || 'chat';

      // 1회 적용 후 바로 비워서 취소/재진입 시 원상태 유지
      this.clearTimeSettingInitData();
    },
  },
  async created() {
    await this.callTimeSettingInfo()
    const chatLayOutInstance = this;
    await this.$nextTick()
    this.audio.addEventListener('ended', function() {
      chatLayOutInstance.audioPlay()
    });
    this.ready = true
  },
  mounted() {
    this.$nextTick(() => {
      this.$jqueryUtil.scrollbar();
    });
  },
  destroyed() {
    this.audio.pause();
    this.clearTimeSettingInitData();
  }
}
</script>

<style scoped lang="scss">
.setting-cont-wrap {
  width: 100%;
  text-align:left;
  margin: 0 auto;

  .tab-wrap {
    display: flex;
    margin-bottom: 25px;
    button {
      width: 100%;
      height: 46px;
      line-height: 44px;
      color: #bdbdbd;
      font-size: 15px;
      font-weight: 700;
      border: 1px solid #d6d6d6;
      border-radius: 7px 0 0 7px;
    }
    button + button { 
      border-radius: 0 7px 7px 0; 
    }
    button.is-active {
      background-color: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
  }
  .sub-title {
    width: 100%;
    color:#2e2e2e;
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    span{
      color:#2e2e2e;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
    }
  }
  .on-off-text {
    color: #8D8D8D;
    font-feature-settings: 'clig' off, 'liga' off;
    font-family: var(--font-body);
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: -0.2px;
  }
  .time-wrap {
    height: 400px; 
    overflow-y: auto;
  }
  .timer-card {
    padding: 15px 20px;
    border-radius: 8px;
    border: 1px solid #E0E0E0;
    background: #FFF;   
    + .timer-card{margin-top:10px;}
  }
  .day-wrap {
    margin: 15px 0 0px 0;
    font-size:0;
    background:#EBEEF4;
    border-radius: 8px;
    padding: 16px;  
    .tit {
      font-size: 14px;
      font-weight: 500;
      line-height: 21px;
      color: #2E2E2E;
      margin-bottom: 8px;
    }
    .day {
      display:inline-block;
      margin:0 18px 0 0;
      vertical-align:middle;
    }
    .day:last-child {margin:0 ;}
    .day label span {color:#000;}      
  }
  .setting-time-wrap {
    background:#EBEEF4;
    border-radius: 8px;
    padding: 16px;
    margin-top:15px;    
    .tit-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      > .hi-btn{
        background-color: transparent;
      }
      > .hi-btn:hover{
        background-color: var(--primary-04);
      }
    }
    .tit {
      font-size: 14px;
      font-weight: 500;
      color: #2E2E2E;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .tit i{padding:0;}
    .stit{
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
      color: #616161;
      padding-bottom: 4px;
    }
    .start-time-wrap + .start-time-wrap{margin-top:12px;}
    .st-time-setting{
      display: flex;  
      align-items: center;
      gap: 5px;  
      > *{width:100%;}
      .btn-del-date{width:auto;}
      .btn-del-date i{background-color: #9E9E9E !important;}
      .selected{font-size: 14px;}
    }
  }
}

.audio-card {
  padding-top: 20px;
  padding-right: 20px;
  padding-left: 20px;
  padding-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #F4F9FF;
  background: #F4F9FF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top:10px;
}
.audio-icon-tooltip {
    position: relative;
    display: flex; align-items:center;
    width: 56px;
    height: 16px;
    padding-left: 5px;
    vertical-align: middle;
    margin-left: 10px;
    border-radius: 30px;
    border: 1px solid #ADB8C2;
    color: #868E96;
    font-family: var(--font-body);
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: -0.2px;

    &:hover {
      border: 1px solid #343A40;
      background: #343A40;
      color: white;
      #audio-icon-cont {
        stroke: white;
      }
      .hi-tooltip {
          bottom: calc(100% + 10px);
          left: -12px;
          display: block;
          background-color: #3d4655;
          padding: 8px 15px;
          &::before { 
            content: "";
            width: 0;
            height: 0;
            position: absolute;
            top:100%;
            border: 5px solid transparent;
            border-bottom: 0;
            border-top: 5px solid #3d4655;
          }
      }
    }
}
.audio-play-btn {
  width: 56px;
  height: 36px;
  border-radius: 30px;
  background: var(--web-main-blue-20, #4267B2);
}
.audio-pause-btn {
  width: 56px;
  height: 36px;
  border-radius: 30px;
  background: #FF5656;
}
.time-set-noti-box {
  display: flex;
  align-items: center;
  width: 414px;
  height: 92px;
  padding: 14px 40px 14px 40px;
  color: #FF5553;
  text-align: center;
  vertical-align: middle;
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: var(--font-body);
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 153.846% */
  letter-spacing: -0.2px;
  border-radius: 6px;
  background: var(--web-background-gray-03, #F3F3F3);
}

//tooltip 커스텀(아이콘 + 텍스트)
.hi-tooltip-wrap.message{  
  border: 1px solid #ADB8C2;
  width: 56px;
  height: 16px;
  border-radius: 30px;  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  &::before{
    mask-image: url(~@/assets/img/svg/ico-speech-bubble.svg);
    width: 14px;
    height: 14px;
  }
  &::after{
    display:inline-block;
    content: "메시지";
    font-size:10px;
    color: #868E96;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: -0.2px;
  }
  &:hover{background: #3d4655;    border-color: #3d4655;}
  &:hover::before{background-color: #fff;}
  &:hover::after{color: #fff;}
}

// himodal custom 
.hi-modal-common::v-deep{
  .modal__layer{width:520px;}
  .modal__header{padding-top: 30px;}
  .modal__content {padding: 10px 20px 40px 30px;}
}
// hiselectbox custom 
.hi-selectbox::v-deep{
  .option__layer{
    //max-height: 169px;
    max-height: 125px;
  } 
}
</style>
