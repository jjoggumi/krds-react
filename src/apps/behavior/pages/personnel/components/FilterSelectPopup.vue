<template>
  <div class="filter-popup">
    <div class="filter-title">필터 선택</div>
    <div class="filter-list">
      <span class="filter-item">
        <input
            type="checkbox"
            :id="`filter-all-${itemKey}`"
            v-model="showAll"
            :value="['CHECKED', 'UNCHECKED']"
        />
        <label :for="`filter-all-${itemKey}`">
          <div class="label-txt">전체선택</div>
        </label>
      </span>
      <span class="filter-item">
        <input type="checkbox" :id="`filter-checked-${itemKey}`" v-model="showChecked"/>
        <label :for="`filter-checked-${itemKey}`">
          <div class="label-txt">체크 학생만 보기</div>
        </label>
      </span>
      <span class="filter-item">
        <input type="checkbox" :id="`filter-unchecked-${itemKey}`" v-model="showUnchecked"/>
        <label :for="`filter-unchecked-${itemKey}`">
          <div class="label-txt">미체크 학생만 보기</div>
        </label>
      </span>
    </div>
    <div class="filter-actions">
      <button class="btn-cancel" @click="$emit('closeFilterSelectPopup')">취소</button>
      <button class="btn-confirm" @click="applyFilter" :disabled="scopedFilter.length === 0">확인</button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'FilterSelectPopup',
  data() {
    return {
      scopedFilter: []
    }
  },
  props: {
    itemKey: {
      type: String,
      required: true
    },
    curSelect: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.scopedFilter = [...this.curSelect]
  },
  computed: {
    showAll: {
      get() {
        return this.scopedFilter.includes('CHECKED') && this.scopedFilter.includes('UNCHECKED')
      },
      set(value) {
        value ? this.scopedFilter = ['CHECKED', 'UNCHECKED'] : this.scopedFilter = []
      }
    },
    showChecked: {
      get() {
        return this.scopedFilter.includes('CHECKED')
      },
      set(value) {
        value ? this.scopedFilter.push('CHECKED') : this.scopedFilter = this.scopedFilter.filter(item => item !== 'CHECKED')
      }
    },
    showUnchecked: {
      get() {
        return this.scopedFilter.includes('UNCHECKED')
      },
      set(value) {
        value ? this.scopedFilter.push('UNCHECKED') : this.scopedFilter = this.scopedFilter.filter(item => item !== 'UNCHECKED')
      }
    }
  },
  methods: {
    applyFilter() {
      this.$emit('applyFilter', {
        itemKey: this.itemKey,
        selectedFilters: this.scopedFilter
      })
      this.$emit('closeFilterSelectPopup')
    }
  }
}
</script>

<style lang="scss" scoped>
tr {
  &.all-center {
    .check-list {
      .checkbox-filter-wrap {
        .filter-popup {
          top: 41px;
        }
      }
    }
  }
}
.filter-popup {
  position: absolute;
  top: 32px;
  right: 4px;
  z-index: 10;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #D6D6D6;
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.12);
  min-width: 212px;
  height: 263px;
  .filter-title {
    display: flex;
    width: 210px;
    height: 50px;
    padding: 18px 139px 17px 15px;
    align-items: center;
    flex-shrink: 0;
    font-size: 15px;
    font-weight: 700;
    line-height: 15px;
  }
  .filter-list {
    display: flex;
    flex-direction: column;
    // max-height: 150px;
    // overflow: auto;
    &::-webkit-scrollbar {
      height: 12px;
      width: 12px;
    }
    &::-webkit-scrollbar-thumb {
      background: #D3D1CB;
      border-radius: 22px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 6px;
    }
    /* 상하 화살표 버튼 숨기기 */
    &::-webkit-scrollbar-button {
      display: none;
      height: 0;
      width: 0;
    }
    .filter-item {
      display: flex;
      align-items: center;
      padding: 15px;
      margin-top: 0;
      height: 50px;
      min-height: 50px;
      label {
        display: flex;
        align-items: center;
        .label-txt {
          font-size: 14px;
          font-weight: 400;
          color: #222;
          margin-left: 8px;
        }
      }
      input[type=checkbox] {
        &:checked {
          +label {
            &::before {
              background: url('~@/assets/img/icon/icon_checkbox_checked_orange.png') no-repeat 0 0/auto 20px !important;
            }
          }
        }
      }
    }
  }
  .filter-actions {
    display: flex;
    justify-content: center;
    height: 62px;
    padding: 15px 30px;
    gap: 8px;
    border-top: 1px solid var(--web-Border-Gray-04, #EEE);
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      height: 32px;
      border-radius: 40px;
      border: 1px solid transparent;
      &.btn-cancel {
        background: #fff;
        border-color: #D6D6D6;
        color: #333;
        cursor: pointer;
      }
      &.btn-confirm {
        background: #FF8737;
        color: #fff;
        cursor: pointer;
        &:disabled {
          color: #FFF;
          background: #D6D6D6;
          border: 1px solid #D6D6D6;
        }
      }
    }
  }
}
</style>