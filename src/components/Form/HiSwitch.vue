<template>
  <div
    class="hi-switch"
    :class="rootElementClassList"
  >
    <!-- 값 반전 스위치 -->
    <input
      v-if="invert"
      :key="`${switchUniqueId}-invert`"
      type="checkbox"
      :id="switchUniqueId"
      :disabled="disabled"
      v-model="cModel"
      :true-value="false"
      :false-value="true"
    >
    <input
      v-else
      :key="`${switchUniqueId}-normal`"
      type="checkbox"
      :id="switchUniqueId"
      :disabled="disabled"
      v-model="cModel"
    >
    <label :for="switchUniqueId">
      <span class="track"></span>
    </label>
  </div>
</template>

<script>
import {v4 as uuidv4} from "uuid";

export default {
  name: "hi-switch",
  props: {
    model: {
      type: Boolean,
    },
    disabled: {
      type: Boolean
    },
    invert: {
      type: Boolean
    },
    rootElementClassList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      componentUUID: null
    }
  },
  computed: {
    cModel: {
      get() {
        return this.model
      },
      set(val) {
        this.$emit('update:model', val)
      }
    },
    switchUniqueId() {
      return `hi-switch-${this.componentUUID}`
    }
  },
  created() {
    this.componentUUID = uuidv4()
  },
}
</script>

<style scoped>

</style>