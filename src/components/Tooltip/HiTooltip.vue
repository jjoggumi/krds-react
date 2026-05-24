<template>
  <div
    role="button"
    :class="classList"
  > 
    <slot name="button"></slot>
    <div class="hi-tooltip">
      <span v-html="titleHtml"></span>
    </div>
  </div>
</template>


<script>
export default {
  name: "hi-tooltip",
  props: {
    titleHtml: { // 툴팁 내용
      type: String,
      required: true
    },
    color: {     // 툴팁 색상
      type: String
    },
    ico: {       // 툴팁 아이콘
      type: String
    },
    position: {  // 툴팁 위치
      type: String
    },
    isActive: {  // 툴팁 활성화 여부
      type: Boolean
    },
    ani: {       // 툴팁 애니메이션
      type: String
    },
  },
  computed: {
    classList() {
      const className = ["icon-tooltip"];
      this.color ? className.push(`tooltip-${this.color}`) : null;
      this.ico ? className.push(`tooltip-ico-${this.ico}`) : null;
      this.position ? className.push(`tooltip-${this.position}`) : null;
      this.isActive ? className.push(`active`) : null;
      this.ani ? className.push(`tooltip-ani-${this.ani}`) : null;
      return className.join(" ");
    },
  },
}
</script>

<style scoped>

</style>