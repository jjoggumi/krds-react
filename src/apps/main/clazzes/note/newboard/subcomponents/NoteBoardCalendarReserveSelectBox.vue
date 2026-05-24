<template>
  <div
    v-click-outside="close"
    class="border-selectbox-wrap custom-select-box-wrap"
    :class="{
      selected: option.isOpen
    }"
  >
    <div class="selected-option" @click="toggle">
      <div class="option-val">{{ selectedValue }}{{ suffix }}</div>
    </div>
    <div class="option-list-wrap">
      <div>
        <ul>
          <li
            :ref="`selectbox-${mode}-0`"
            :class="{
              selected: 0 === selectedValue
            }"
          >
            <div class="option-item" @click="selectItem(0)">
              {{ 0 }}{{ suffix }}
            </div>
          </li>
          <li
            v-for="index in lastIndex"
            :key="index"
            :ref="`selectbox-${mode}-${index}`"
            :class="{
              selected: index === selectedValue
            }"
          >
            <div class="option-item" @click="selectItem(index)">
              {{ index }}{{ suffix }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'note-board-calendar-reserve-select-box',
  props: {
    mode: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true,
      default() {
        return 0
      }
    }
  },
  data() {
    return {
      option: {
        isOpen: false
      }
    }
  },
  computed: {
    isHour() {
      return this.mode === 'HOUR'
    },
    isMinute() {
      return this.mode === 'MINUTE'
    },
    lastIndex() {
      return this.isMinute ? 59 : 23
    },
    suffix() {
      let suffix = ''
      if (this.isHour) suffix = '시'
      else if (this.isMinute) suffix = '분'
      return suffix
    },
    selectedValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('update:value', value)
      }
    }
  },
  created() {},
  mounted() {
  },
  methods: {
    toggle() {
      this.option.isOpen = !this.option.isOpen

      if (this.option.isOpen) {
        this.doFocus(`selectbox-${this.mode}-${this.selectedValue}`)
      }
    },
    close() {
      this.option.isOpen = false
    },
    doFocus(ref) {
      this.$nextTick(() => {
        this.$refs[ref][0].scrollIntoView()
      })
    },
    setSelectedValue(value) {
      this.selectedValue = value
    },
    selectItem(value) {
      this.setSelectedValue(value)
      this.close()
    }
  }
}
</script>

<style scoped></style>
