<template>
  <div class="behavior-toast-message" :style="style">
    <p class="msg">
      {{ item.message }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'toast-type01',
  props: {
    item: Object
  },
  computed: {
    style: function() {
      let obj = {
        width: this.item.width !== null ? `${this.item.width}px` : '420px',
        height: this.item.height !== null ? `${this.item.height}px` : '66px',
        'line-height': this.item.height !== null ? `${this.item.height}px` : '66px',
        'text-align': this.item.align,
      }
      let c = false
      let r = false

      if(this.item.top !== null) {
        obj.top = `${this.item.top}px`
      } else if(this.item.bottom !== null) {
        obj.bottom = `${this.item.bottom}px`
      } else {
        c = true
        obj.top = "50%"
      }

      if(this.item.left !== null) {
        obj.left = `${this.item.left}px`
      } else if(this.item.right !== null) {
        obj.right = `${this.item.right}px`
      } else {
        r = true
        obj.left = "50%"
      }

      if(c === true && r === true) {
        obj.transform = "translate(-50%, -50%)"
      } else if (c === true) {
        obj.transform = "translateY(-50%)"
      } else if (r === true) {
        obj.transform = "translateX(-50%)"
      }

      return obj
    }
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
.behavior-toast-message {
  z-index: 9999;
}
</style>