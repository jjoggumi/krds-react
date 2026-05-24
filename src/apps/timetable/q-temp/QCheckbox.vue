<template>
  <label class="q-checkbox-wrapper" :class="{ disabled }">
    <!-- 체크박스 -->
    <input
      type="checkbox"
      class="q-checkbox-input"
      :checked="isChecked"
      :disabled="disabled"
      @change="onChange"      
    />
    <!-- 사용자 스타일 체크박스 표시 -->
    <span class="q-checkbox-box">
      <span v-if="isChecked" class="q-checkbox-check">✔</span>
    </span>
    
    <!-- 라벨 -->
    <span class="q-checkbox-label">{{ label }}</span>
  </label>
</template>

<script>
export default {
  name: 'QCheckbox',
  props: {
    value: null, // v-model
    label: {
      type: String,
      default: ''
    },
    val: {
      // required: true // 각 체크박스의 고유 값
    },
    trueValue: {
      default: true
    },
    falseValue: {
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isChecked() {
      if (Array.isArray(this.value)) {
        return this.value.includes(this.val); // 배열에 현재 체크박스의 값이 포함되어 있는지 확인
      }
      return this.value === this.trueValue;
    },
  },
  methods: {
    onChange(event) {
      console.log('Checkbox disabled:', this.disabled);

      const checked = event.target.checked;

      if (Array.isArray(this.value)) {
        const newValue = [...this.value];
        if (checked) {
          if (!newValue.includes(this.val)) {
            newValue.push(this.val); // 배열에 값 추가
          }
        } else {
          const index = newValue.indexOf(this.val);
          if (index > -1) {
            newValue.splice(index, 1); // 배열에서 값 제거
          }
        }
        this.$emit('input', newValue); // 배열 업데이트
      } else {
        const val = checked ? this.trueValue : this.falseValue;
        this.$emit('input', val); // 일반적인 체크박스 값 업데이트
      }

      this.$emit('change', this.value); // change 이벤트도 emit
    }
  }
};
</script>

<style scoped>
.q-checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.q-checkbox-wrapper.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.q-checkbox-input {
  display: none;
}

.q-checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  background: white;
  transition: border-color 0.2s, background-color 0.2s;
}

.q-checkbox-wrapper:not(.disabled):hover .q-checkbox-box {
  border-color: #1976d2;
}

.q-checkbox-box.checked {
  background-color: #1976d2;
  border-color: #1976d2;
}

.q-checkbox-check {
  color: white;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

.q-checkbox-label {
  line-height: 1;
}
</style>