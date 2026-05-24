<template>
  <div class="minute">
    <div
      class="border-selectbox-wrap custom-select-box-wrap"
      :class="{
        selected: isShowSelectOptions,
        'select-minute' : isUseBoard
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
              v-for="idx in 60"
              :key="idx"
              :class="{
                selected: getItem(idx - 1) === selected
              }"
              @click="selectItem(idx - 1)"
            >
              <div class="option-item">{{ getItem(idx - 1) }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MainBodyMypageSelectBoxMinute",
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
        val += "분";
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
    getItem(item) {
      if (item < 10) item = "0" + item;
      else item = "" + item;

      if (this.isUseBoard) {
        if (item.length === 2 && item.charAt(0) === "0")
          item = item.substring(1);
        item += "분";
      }
      return item;
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
