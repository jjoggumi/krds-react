<template>
  <div
    class="q-select-wrapper"
    :class="{ focused }"
    @click.stop="toggleDropdown"
    ref="selectWrapper"
  >
    <!-- 선택된 값 -->
    <div class="q-select-label">
      {{ selectedLabel }}
    </div>

    <!-- 드롭다운 아이콘 -->
    <div class="q-select-icon">▼</div>

    <!-- 드롭다운 옵션 -->
    <div v-if="dropdownVisible" class="q-select-dropdown">
      <div
        v-for="option in normalizedOptions"
        :key="optionValue(option)"
        class="q-select-option"
        :class="{ selected: isSelected(option) }"
        @click.stop="selectOption(option)"
      >
        {{ optionLabel(option) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QSelect',
  props: {
    value: {
      type: [String, Number, Object, Array],
      // required: true // v-model을 통해 값이 반드시 전달됨
    },
    options: {
      type: Array,
      required: true // 드롭다운 옵션 리스트
    },
    optionValue: {
      type: Function,
      default: (opt) => opt.value // 옵션의 고유 값을 반환하는 함수
    },
    optionLabel: {
      type: Function,
      default: (opt) => opt.label // 옵션의 라벨을 반환하는 함수
    },
    multiple: {
      type: Boolean,
      default: false // 다중 선택 여부
    }
  },
  data() {
    return {
      dropdownVisible: false, // 드롭다운 표시 여부
      focused: false // 포커스 상태
    };
  },
  computed: {
    normalizedOptions() {
      // 단순 값 배열인 경우 객체 배열로 변환
      return this.options.map((opt) =>
        typeof opt === 'object'
          ? opt
          : { value: opt, label: opt }
      );
    },
    selectedLabel() {
      // 선택된 옵션의 라벨 반환
      if (this.multiple && Array.isArray(this.value)) {
        return this.value
          .map((val) =>
            this.optionLabel(
              this.normalizedOptions.find((opt) => this.optionValue(opt) === val)
            )
          )
          .join(', ');
      }
      const selectedOption = this.normalizedOptions.find(
        (opt) => this.optionValue(opt) === this.value
      );
      return selectedOption ? this.optionLabel(selectedOption) : '선택';
    }
  },
  methods: {
    toggleDropdown() {
      // 드롭다운 표시/숨기기 토글
      this.dropdownVisible = !this.dropdownVisible;
    },
    selectOption(option) {
      // 옵션 선택 처리
      const value = this.optionValue(option);

      if (this.multiple) {
        const newValue = Array.isArray(this.value) ? [...this.value] : [];
        const index = newValue.indexOf(value);

        if (index > -1) {
          newValue.splice(index, 1); // 이미 선택된 경우 제거
        } else {
          newValue.push(value); // 선택되지 않은 경우 추가
        }
        this.$emit('input', newValue); // Vue 2.7에서 v-model은 input 이벤트를 사용
      } else {
        this.$emit('input', value); // Vue 2.7에서 v-model은 input 이벤트를 사용
        this.dropdownVisible = false; // 단일 선택 시 드롭다운 닫기
      }
    },
    isSelected(option) {
      // 옵션이 선택되었는지 확인
      const value = this.optionValue(option);
      if (this.multiple) {
        return Array.isArray(this.value) && this.value.includes(value);
      }
      return this.value === value;
    },
    handleClickOutside(event) {
      // 드롭다운 외부 클릭 시 닫기
      if (
        this.$refs.selectWrapper &&
        !this.$refs.selectWrapper.contains(event.target)
      ) {
        this.dropdownVisible = false;
      }
    }
  },
  mounted() {
    // 외부 클릭 이벤트 리스너 추가
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    // 외부 클릭 이벤트 리스너 제거
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
.q-select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 2px;
  padding: 8px;
  cursor: pointer;
  background-color: white;
}

.q-select-wrapper.focused {
  border-color: #1976d2;
}

.q-select-label {
  font-size: 14px;
  margin-right: 20px;
  color: #333;
}

.q-select-icon {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  font-size: 12px;
  color: #666;
}

.q-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.q-select-option {
  padding: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.q-select-option:hover {
  background-color: #f5f5f5;
}

.q-select-option.selected {
  background-color: #1976d2;
  color: white;
}
</style>