<template>
  <div class="hi-kebabmenu" v-click-outside="closeKebab" @click.stop>
    <button class="btn-kebab" @click="toggleKebab">
      <span></span><span></span><span></span>
    </button>
    <div class="kebabmenu__layer" v-if="isOpen" style="display:block;" @click.stop>
       <slot></slot>
       
    </div>
  </div>
</template>

<script>
const openKebabs = new Set();
export default {
  name: "HiKebab",
  data() {
    return {      
      isOpen: false
    };
  },
  methods:{
    toggleKebab(event) {
      if (this.isOpen) {
        this.closeKebab(event); // 현재 Kebab이 열려 있다면 닫기
      } else {
        this.openKebab(); // 현재 Kebab을 열고 다른 모든 Kebab 닫기
      }
    },
    openKebab() {
      // 모든 열려 있는 Kebab 닫기
      openKebabs.forEach((kebab) => kebab.closeKebab());
      openKebabs.clear();

      // 현재 Kebab 열기
      this.isOpen = true;
      openKebabs.add(this);
    },
    closeKebab(event) {
      if (this.isOpen) {
        this.isOpen = false;
        openKebabs.delete(this);
        if (event) event.stopPropagation();
      }
    },
  },
  beforeDestroy() {
    // 컴포넌트가 파괴되면 Set에서 제거
    openKebabs.delete(this);
  },
};
</script>
