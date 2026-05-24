<template>
  <div class="accordion">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'HiAccordion',
  props: {
    // multi: true인 경우 여러 아이템을 동시에 열 수 있고, false인 경우 하나의 아이템만 열 수 있습니다.
    multi: {
      type: Boolean,
      default: false
    },
    // animate: false로 설정하면 열림/닫힘 애니메이션을 비활성화합니다.
    animate: {
      type: Boolean,
      default: true
    },
    // 초기에 열려 있을 아이템의 uid 목록
    defaultOpen: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      openList: []
    };
  },
  watch: {
    // 외부에서 defaultOpen을 동적으로 변경할 경우 반영
    defaultOpen(val) {
      this.openList = [...val];
    }
  },
  provide() {
    return { accordion: this, accordionAnimate: this.animate };
  },
  created() {
    this.openList.push(...this.defaultOpen);
  },
  methods: {
    isOpen(uid) {
      return this.openList.includes(uid);
    },
    toggle(uid) {
      if (this.isOpen(uid)) {
        this.openList = this.openList.filter(id => id !== uid);
      } else {
        this.openList = this.multi ? [...this.openList, uid] : [uid];
      }
    },
    open(uid) {
      if (!this.isOpen(uid)) {
        this.openList = this.multi ? [...this.openList, uid] : [uid];
      }
    },
    close(uid) {
      this.openList = this.openList.filter(id => id !== uid);
    },
    closeAll() {
      this.openList = [];
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
