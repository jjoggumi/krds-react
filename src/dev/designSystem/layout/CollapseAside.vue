<template>
  <div class="collapsList" :class="{ active: !active,  on: isActive, nonChild: nonChild }">
    <div class="collapsible" @click="toggleCollapse">
      <slot name="tit"></slot>
    </div>
    <div class="collapsCon" ref="collapsCon" :style="{ maxHeight: activeMaxHeight + 'px' }" >
      <slot name="con"></slot>
    </div>
  </div>
</template>
<script> 
import "@/dev/designSystem/assets/styles/collaps.scss";
export default {
  name : "ComponentsCollapse",
  props: {   
    isActive : Boolean,
    nonChild : Boolean,
  },
  data() {
    return {
      active: false,
      activeMaxHeight: 0
    };
  },  
  methods: {
    toggleCollapse() {
      this.active = !this.active;
      if (!this.active) {
        this.$nextTick(() => {
          this.activeMaxHeight = this.$refs.collapsCon.scrollHeight;
        });
      } else {
        this.activeMaxHeight = '0';
      }
    }
  },
  mounted() {
    if (this.$refs.collapsCon) {
      this.activeMaxHeight = this.$refs.collapsCon.scrollHeight ;
    }
  }
}
</script>