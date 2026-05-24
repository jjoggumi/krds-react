<template>  
  <transition name="fade">
    <div class="scrollTop-btn" v-if="isShowMainToTopBtn">
      <button class="icon"  @click="scrollToTop">
        <span>TOP</span>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// 부모에서 전달받은 스크롤 기준 대상
const props = defineProps<{
  targetRef: HTMLElement | null
}>();

const scrollTop = ref(0);
const isShowMainToTopBtn = computed(() => scrollTop.value > 100); // 0 대신 100px 넘을 때 보여줘도 자연스러움

let scrollTargetEl: HTMLElement | null = null;

const updateScrollTop = () => {
  if (!scrollTargetEl) return;
  scrollTop.value = scrollTargetEl.scrollTop;
};

onMounted(() => {
  watch(
    () => props.targetRef,
    (newVal) => {
      if (newVal) {
        scrollTargetEl = newVal;
        scrollTargetEl.addEventListener('scroll', updateScrollTop);
        updateScrollTop(); // 초기값 세팅
      }
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  scrollTargetEl?.removeEventListener('scroll', updateScrollTop);
});

const scrollToTop = () => {
  if (!scrollTargetEl) return;
  scrollTargetEl.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<style scoped lang="scss">
.scrollTop-btn {
  z-index: 999;
  position: fixed;
  bottom: 30px;
  right: 30px;

  button {
    width:56px;
    height:56px;
    border-radius:50px;
    border:2px solid #fff;
    background:rgba(0, 0, 0, 0.5);

    &:hover {
      background:rgba(0, 0, 0, 0.7);
    }

    span{
      text-indent: -9999px;
      mask-image: url('~@/assets/img/timetable/ico-top.svg');
      background-color: #fff;
      width: 28px;
      height: 28px;
      display: inline-block;
    }
  }
}
</style>
