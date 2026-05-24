<template>  
  <aside
    class="rnd"
    :class="{ 'is-closed': panelInert }"
  >
    <div class="help-panel" 
      :inert="panelInert"
      :aria-hidden="panelInert">
      <div class="help-panel-header">        
        <button class="btn btn-tertiary btn-block btn-ico-left" @click="handleClose">
          <i data-v-310e7bc2="" class="ico ico-arrow-right ico-size-20"></i>
        </button>
        <HiSelectBox  
          :value="currentMenus"
          :items="selectItems"
          @update:value="currentMenus = $event"
          :empty-title="currentTitle.label"
          class="md"
        />
      </div>
      <div class="help-content custom-scr" ref="helpContentRef">
        <ul>
          <li
            v-for="(content, j) in selectedHelp.contents"
            :key="j"
            :class="{ active: content.title === helpOn }"
            @click.stop="handleItemClick(content.title)"
            :ref="el => setHelpItemRef(el, content.title)"
          >
            <p class="tit">{{ content.title }}</p>
            <p class="desc" v-html="content.desc"></p>
          </li>
        </ul>
      </div>
    </div>
    <ul class="help-toggle">
      <li @click="$emit('toggle-help')">
        <span>도움말</span>
      </li>
        <li @click="handleDownload">
        <span>가이드</span>
      </li>
        <li @click="handleFaq">
        <span>FAQ</span>
      </li>
        <li @click="handleContact">
        <span>문의하기</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useMenuManager } from '../composables/menuManager';
import helpList from '../resources/titmetable-help.json';

const timetableGuideUri = process.env.VUE_APP_TIMETABLE_GUIDE_URI || '';

const props = defineProps({
  helpOn: { type: String },
  isOpen: { type: Boolean, default: false },
});
// 패널이 닫힌 상태 여부: 패널 열림 상태(isOpen)로만 제어 (helpOn과 분리)
const panelInert = computed(() => !props.isOpen);


// 패널 닫을 때 helpOn 초기화는 하단의 handleClose에서 처리
const menuManager = useMenuManager();

// 현재 단계 인덱스
const currentStepIndex = computed(() => {
  const idx = menuManager.getCurrentMenuIndex();
  return idx >= 0 ? idx : 0;
});

// 현재 스텝에 맞는 데이터 가져오기
const currentTitle = computed(() => {
  const steps = menuManager.getMenuSteps?.() || [];
  const step = steps[currentStepIndex.value] || { label: '', desc: '' };
  return {
    label: step.label,
    desc: step.desc 
  };
});

// 선택된 도움말 메뉴 
const currentMenus = ref(currentTitle.label || '');

// 도움말 메뉴 옵션
const selectItems = computed(() =>
  helpList.map(item => ({
    title: item.menus,
    value: item.menus
  }))
);

// 선택된 메뉴에 해당하는 도움말 데이터
const selectedHelp = computed(() => {
  const found = helpList.find(item => item.menus === currentMenus.value);
  if (found) return found;
  return helpList[currentStepIndex.value] || { contents: [{ title: '', desc: '' }] };
});

// --- 활성화된 도움말 항목으로 스크롤(top) ---
// 각 도움말 항목의 DOM을 저장
const helpItemRefs = ref({});
const helpContentRef = ref(null);
function setHelpItemRef(el, title) {
  if (el && title) helpItemRefs.value[title] = el;
}
// helpOn 값이 바뀔 때 해당 항목을 스크롤 top에 위치

function handleItemClick(title) {
  emit('update-help-on', title);  
}

watch(
  () => props.helpOn,
  async (newHelpOn) => {
    await nextTick();
    const el = helpItemRefs.value[newHelpOn];
    const container = helpContentRef.value;
    if (!el || !container) return;

    // help-content 스크롤 영역 내에서만 스크롤 이동
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const offset = container.scrollTop + (elRect.top - containerRect.top) - 10; // scroll-margin-top 유사 여백
    container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  }
);

//  watch(currentStepIndex => {
//    currentMenus.value = currentTitle.label || '';
//  });

// defineEmits는 script setup에서 호출해야 함
const emit = defineEmits(['close-help', 'toggle-help', 'update-help-on']);

function handleClose() {
  // 패널 닫기 요청 (하이라이트 제거 여부는 부모에서 결정)
  emit('close-help');
}

function openExternal(url) {
  if (!url) return;
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (w) w.opener = null;
  emit('update-help-on', '');
}

function handleDownload() {
  openExternal(timetableGuideUri);
}

function handleFaq() {
  openExternal('/help/faq?category=시간표');
}

function handleContact() {
  openExternal('/help/question?isWrite=true&category=시간표');
}

</script>

<style scoped lang="scss">
.rnd{
  display: flex;
  position: sticky;
  top: 0px;
  z-index: 11;
  width: 56px;
  transition: width 0.3s ease-in-out; 
  height:calc(var(--vh) * 100 - 60px);
  background:red;
  overflow: hidden;
  .help-toggle {
    padding: 14px 8px;
    display: flex;
    flex-flow: column;
    gap: 32px;
    width: 56px;
    background: #F8F9FC;
    border-left: 1px solid var(--gray-05);
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    li {
      position: relative;
      cursor: pointer;
      width: 40px;
      height: 40px;
      background:url(~@/assets/img/timetable/help_icon_01_on.svg) center no-repeat;
      background-size: 24px;
      border-radius: 50px;
      transition: 0.3s ease-in-out;
      @for $i from 1 through 4 {
        &:nth-child(#{$i}) {
          background-image: url(~@/assets/img/timetable/help_icon_0#{$i}_on.svg);
        }
      }
      span {    
        position: absolute;
        top: calc(100% + 3px);
        right: 50%;
        transform: translateX(50%);
        z-index: 1;
        padding: 4px 6px;
        height: 26px;
        border-radius: 4px;
        background-color: #3D4655;
        font-size: 12px;
        color: #fff;
        white-space: nowrap;
        line-height: 150%;         
        display: none;
      }
      &:hover{
        background-color:#EBEEF4;
        span{display: block;}
      } 
    }
  }
  .help-panel {
    background-color: #fff;
    border-left: 1px solid #D6D6D6;
    width: 300px;
    height: 100%;
    transition: width 0.3s ease-in-out; 
    position: absolute;
    left: 0;
    .help-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 72px;
      padding: 15px 15px 16px 15px;
      border-bottom: 1px solid #D6D6D6;
      gap: 8px;
      h2 {
        font-size: 14px;
        font-weight: bold;
        line-height: 144%;
        letter-spacing: 0.5px;
        width: calc(100% - 20px);
      }
      button {
        text-indent: -999999px;
        width: 40px;
        height: 40px;
      }
      .hi-selectbox{
        width: calc(100% - 40px);
      }
    }
    .help-content {      
      height: calc(100% - 92px);
      overflow: auto;
      ul {
        padding: 15px;
        display: flex;
        flex-flow: column;
        gap: 12px;
        li {    
          /* scrollIntoView({ block: 'start' }) 시 상단에 10px 여백 유지 */
          scroll-margin-top: 10px;
          border: 1px solid #D6D6D6;
          border-radius: 8px;
          padding: 12px;    
          cursor: pointer;    
          // &.help-title {
          //   font-size: 16px;
          //   font-weight: bold;
          //   line-height: 150%;
          //   border: 0;
          //   padding: 0 10px 0 5px;
          // }
          .tit {
            font-size: 14px;
            font-weight: bold;
            line-height: 150%;
            margin-bottom: 4px;
          }
          .desc {
            font-size: 14px;
            color: var(--gray-09);
            line-height: 150%;
          }
          &.active {
            border-color:var(--primary);
            color: var(--primary);
            box-shadow: 0 0 0px 4px rgba(var(--primary-rgb), 0.16);
          }
        }
      }
    }
  }
}

// 패널이 닫혔을 때 포커스 및 상호작용 비활성화
.rnd.is-closed {
  .help-panel, .help-content {
    pointer-events: none;
  }
  .help-panel :focus {
    outline: none !important;
  }
}

/* inert 폴리필을 사용하지 않는 브라우저에서의 포커스 차단 대체 (선택적) */
[inert] * {
  user-select: none;
}
</style>
