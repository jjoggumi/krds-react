<template>
  <div :class="classList" @click="$emit('click')" :role="this.$listeners.click ? 'button' : null">
    <div class="img-area" :style="imgAreaStyle">
      <span class="sr-only">{{ imgAlt }} </span>
      <slot name="txt"></slot>
    </div>
    <slot name="badge"></slot>
  </div>
</template>
<script>
export default {
  props: {
    type: {
      type: String,
      default: 'profile'
    },
    size: {
      type: String,
      default: 'md'
    },
    img: String,
    color: String,
    alt: String,
    outline: Boolean,
  },
  data() {
    return {
      isValidImg: true, // 이미지가 유효한지 여부
    };
  },
  computed: {
    classList() {  // props 값에 따른 class 추가
      const className = ["avatar-img"];      
      this.type ? className.push(`${this.type}`) : null;
      this.size ? className.push(`${this.size}`) : null;
      this.outline ? className.push('outline') : null;      
      return className.join(" ");
    },
    imgAreaStyle() {  // 이미지가 있을 때, 없을 때, 색상일 때
      if (this.img && this.isValidImg) {
        return { backgroundImage: `url(${this.img})` };
      } else if(this.color) {
        return { background: `${this.color}` };
      }
    },
    imgAlt() { // alt 값이 있으면 alt 값, 없으면 type 값에 따라 다른 값
      if (this.alt) return this.alt;
      return this.type === "class" ? "클래스 이미지" : this.type === "profile" ? "프로필 이미지" : "";
    }
  },
  watch: {
    img: {  // img 값이 바뀔 때마다 실행 
      immediate: true, // 컴포넌트가 처음 생성될 때 실행됨 
      handler(newImg) {  
        this.checkImageExists(newImg);
      },
    },
  },
  methods: {
    checkImageExists(url) { // 이미지가 유효한지 확인
      if (!url) { // url 값이 없으면 false
        this.isValidImg = false;
        return;
      }

      const img = new Image();
      img.src = url;
      img.onload = () => (this.isValidImg = true);  // 이미지가 로드되면 true
      img.onerror = () => (this.isValidImg = false);  // 이미지가 로드되지 않으면 false
    },
  },
};
</script>
<style scoped lang="scss"></style>
