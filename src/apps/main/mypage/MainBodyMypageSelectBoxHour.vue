<template>
  <div class="hour">
    <div
      class="border-selectbox-wrap custom-select-box-wrap"
      :class="{
        selected: isShowSelectOptions,
        'select-hour' : isUseBoard
      }"
    >
      <div class="selected-option" @click="toggleSelectOptions">
        <div
          class="option-val"
          :class="{
            placeholder: !isAvailable
          }"
        >{{ selectedStr }}</div>
      </div>
      <div
        class="option-list-wrap"
        v-show="isShowSelectOptions"
        v-click-outside="hideSelectOptions"
      >
        <div class="scrollbar-outer">
          <ul>
            <li
              v-for="idx in 24"
              :key="idx"
              :class="{
                selected: hourStr(idx - 1) === selected
              }"
              @click="selectItem(idx - 1)"
            >
              <div class="option-item">{{ hourStr(idx - 1) }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainBodyMypageSelectBoxHour",
  props: {
    isAvailable: Boolean,
    isUseBoard: Boolean,
    selected: String,
    selectType: Number
  },
  data: () => ({
    isShowSelectOptions: false,
    isOpenSelectOptions: false
  }),
  computed: {
    selectedStr() {
      let val = this.selected;
      if (this.isUseBoard) {
        if (val.length === 2 && val.charAt(0) === "0") val = val.substring(1);
        val += "시";
      }
      return val;
    }
  },
  methods: {
    initScrollbar() {
      this.$nextTick(() => {
        this.$jqueryUtil.scrollbar();
      });
    },
    toggleSelectOptions() {
      if (!this.isAvailable) return false;

      this.isShowSelectOptions = !this.isShowSelectOptions;
      setTimeout(() => {
        this.isOpenSelectOptions = true;
      }, 100);
    },
    hideSelectOptions() {
      if (this.isOpenSelectOptions) {
        this.isShowSelectOptions = false;
        this.isOpenSelectOptions = false;
      }
    },
    selectItem(item) {
      if (item < 10) item = "0" + item;
      else item = "" + item;

      if (this.isUseBoard && item.length === 2 && item.charAt(0) === "0")
        item = item.substring(1);

      const timeObj = {
        time: item,
        selectType: this.selectType
      };

      if (this.selected !== item) this.$emit("changeTimeByType", timeObj);
      this.hideSelectOptions();
    },
    hourStr(item) {
      if (item < 10) item = "0" + item;
      else item = "" + item;

      if (this.isUseBoard) {
        if (item.length === 2 && item.charAt(0) === "0")
          item = item.substring(1);
        item += "시";
      }
      return item;
    }
  },
  mounted() {
    this.initScrollbar();
  }
};
</script>

<style scoped>
.option-list-wrap {
  display: block;
}
</style>
