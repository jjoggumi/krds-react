<template>
  <i
    :class="iconClasses"
    :style="iconStyle"
    aria-hidden="true"
  ></i>
</template>

<script>
export default {
  name: 'QIcon',
  props: {
    name: {
      type: String,
      required: true, // 아이콘 이름 (예: 'home', 'fa fa-home')
    },
    size: {
      type: String,
      default: '24px', // 아이콘 크기 (예: '16px', '2rem')
    },
    color: {
      type: String,
      default: '', // 아이콘 색상 (예: 'red', 'blue', 'text-primary')
    },
    left: {
      type: Boolean,
      default: false, // 왼쪽 여백 추가
    },
    right: {
      type: Boolean,
      default: false, // 오른쪽 여백 추가
    }
  },
  computed: {
    iconClasses() {
      const classes = [this.name];

      if (this.color) {
        classes.push(`text-${this.color}`);
      }

      if (this.left) {
        classes.push('q-icon--left');
      }

      if (this.right) {
        classes.push('q-icon--right');
      }

      return classes;
    },
    iconStyle() {
      return {
        fontSize: this.size,
      };
    }
  }
};
</script>

<style scoped>
.q-icon--left {
  margin-right: 8px;
}

.q-icon--right {
  margin-left: 8px;
}
</style>