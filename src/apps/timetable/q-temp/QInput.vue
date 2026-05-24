<template>
  <div :class="['q-input-wrapper', { dense }]">
    <!-- 라벨 -->
    <label v-if="label" class="q-input-label">{{ label }}</label>

    <div class="q-input-container">
      <!-- 인풋 필드 -->
      <input
        class="q-input"
        :class="{ 'q-input--error': error }"
        :type="type"
        :value="value"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('input', $event.target.value)"
      />

      <!-- after slot -->
      <div v-if="$slots.after" class="q-input-after">
        <slot name="after" />
      </div>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="error && errorMessage" class="q-input-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'QInput',
  props: {
    value: [String, Number],
    label: String,
    placeholder: String,
    type: {
      type: String,
      default: 'text'
    },
    dense: Boolean,
    disabled: Boolean,
    error: Boolean,
    errorMessage: String
  }
}
</script>

<style scoped>
.q-input-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
}

.q-input-wrapper.dense .q-input {
  padding: 4px 8px;
  font-size: 13px;
}

.q-input-label {
  margin-bottom: 4px;
  font-weight: bold;
  color: #333;
}

.q-input-container {
  display: flex;
  align-items: center;
  position: relative;
}

.q-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.q-input:focus {
  border-color: #1976d2;
}

.q-input--error {
  border-color: #f44336;
}

.q-input-after {
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.q-input-error {
  margin-top: 0.4em;
  font-size: 12px;
  color: #f44336;
}
</style>
