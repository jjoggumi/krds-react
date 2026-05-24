<template>
  <label class="q-radio-wrapper" :class="{ disabled }">
    <!-- 라디오 버튼 -->
    <input
      type="radio"
      class="q-radio-input"
      :value="val"
      :checked="isChecked"
      :disabled="disabled"
      @change="onChange"
    />
    <!-- 사용자 정의 스타일 -->
    <span class="q-radio-circle">
      <span v-if="isChecked" class="q-radio-dot"></span>
    </span>
    <!-- 라벨 -->
    <span class="q-radio-label">{{ label }}</span>
  </label>
</template>

<script>
export default {
  name: 'QRadio',
  props: {
    value: {
      type: [String, Number, Boolean],
      required: true // v-model을 통해 값이 반드시 전달됨
    },
    val: {
      type: [String, Number, Boolean],
      required: true // 각 라디오 버튼의 고유 값
    },
    label: {
      type: String,
      default: '' // 라디오 버튼의 라벨
    },
    disabled: {
      type: Boolean,
      default: false // 비활성화 여부
    }
  },
  computed: {
    isChecked() {
      // 현재 라디오 버튼이 선택되었는지 확인
      // console.log('isChecked:', this.value, this.val);
      return this.value === this.val;
    }
  },
  methods: {
    onChange() {
      // 라디오 버튼 값 변경 처리
      if (!this.disabled) {
        // console.log('Radio changed:', this.val);
        this.$emit('input', this.val); // v-model 업데이트
        this.$emit('change', this.val); // 추가 이벤트
      }
    }
  }
};
</script>

<style scoped>
.q-radio-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.q-radio-wrapper.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.q-radio-input {
  display: none;
}

.q-radio-circle {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  transition: border-color 0.2s, background-color 0.2s;
}

.q-radio-wrapper:not(.disabled):hover .q-radio-circle {
  border-color: #1976d2;
}

.q-radio-circle.checked {
  border-color: #1976d2;
  background-color: #1976d2;
}

.q-radio-dot {
  width: 10px;
  height: 10px;
  background-color: #1976d2;
  border-radius: 50%;
}

.q-radio-label {
  line-height: 1;
}
</style>