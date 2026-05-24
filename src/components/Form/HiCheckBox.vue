<template>
  <div
    class="checkbox"
    :class="rootElementClassList"
  >
    <input
      type="checkbox"
      :id="checkBoxUniqueId"
      :name="checkBoxUniqueId"
      :value="item.value"
      :disabled="disabled"
      v-model="cModel"
    >
    <label :for="checkBoxUniqueId">
      <span>{{ item.title }}</span>
    </label>
  </div>
</template>

<script>
import {v4 as uuidv4} from "uuid";

export default {
  name: "hi-check-box",
  props: {
    model: {
      type: [Array, Boolean],
    },
    item: {
      type: Object
    },
    disabled: {
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
    checkBoxUniqueId() {
      return `hi-check-box-${this.componentUUID}`
    }
  },
  created() {
    this.componentUUID = uuidv4()
  },
}
</script>

<style scoped>

</style>