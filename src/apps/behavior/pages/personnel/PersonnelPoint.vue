<template>
  <fragment>
    <div class="reward-target">
      <h2>포인트 지급할 대상을 선택해주세요.</h2>
      <div class="top-btn">
        <HiButton
          :color="selectedTab === 'checked' ? 'black' : 'default'"
          :outline="selectedTab !== 'checked'"
          size="sm"
          @click="selectedTab = 'checked'"
        >
          체크
        </HiButton>
        <HiButton
          :color="selectedTab === 'unchecked' ? 'black' : 'default'"
          :outline="selectedTab !== 'unchecked'"
          size="sm"
          @click="selectedTab = 'unchecked'"
        >
          미체크
        </HiButton>
      </div>

      <ul
        class="reward-target-list"
        ref="rewardList"
        :style="{ height: `${maxListHeight}px` }"
      >
        <li
          v-for="(item, idx) in visibleItems"
          :key="`reward-target-item-${idx}`"
        >
          <input
            class="orange"
            type="checkbox"
            :id="`chk-reward-target-item-${idx}`"
            :disabled="getStudentCount(item.itemKey) === 0"
            :value="item.itemKey"
            v-model="selectedItems"
          />
          <label :for="`chk-reward-target-item-${idx}`">
            <span
              class="item"
              :class="{
                'color-bg': item.itemColor === 'BLUE_GREEN',
                'color-b': item.itemColor === 'BLUE',
                'color-g': item.itemColor === 'GREEN',
                'color-y': item.itemColor === 'YELLOW',
                'color-r': item.itemColor === 'RED',
                'color-gr': item.itemColor === 'GR',
                'unchecked': item.type === 'partial'
              }"
              :style="getBorderStyle(item)"
            >
              <div class="item-label">{{ item.itemLabel }}</div>
              <div
                class="count"
                :style="getCountStyle(item)"
                :class="{
                  'unchecked': item.type === 'partial'
                }"
              >
                {{ getStudentCount(item.itemKey) }}명
              </div>
            </span>
          </label>
        </li>
      </ul>

      <div class="btns">
        <button class="btn-effort" @click="doReward(true)">노력 지급</button>
        <button class="btn-good" @click="doReward(false)">좋음 지급</button>
      </div>
    </div>

    <HiModal
      v-if="isOpenStudentConfirm"
      type="type01"
      :modalLayerStyle="{ 'max-width': '450px', width: '100%' }"
      closeSkip
    >
      <template v-slot:heading>
        포인트를 지급할 학생을 선택해주세요.
      </template>
      <template v-slot:footer>
        <HiButton color="orange" size="lg" @click="isOpenStudentConfirm = false">확인</HiButton>
      </template>
    </HiModal>
  </fragment>
</template>

<script>
export default {
  name: "PersonnelPoint",
  data() {
    return {
      selectedItems: [],
      isOpenStudentConfirm: false,
      clickHandler: null,
      selectedTab: 'checked',
      maxListHeight: 0,
      uncheckedListHeight: 0
    };
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    students: {
      type: Array,
      required: true,
    },
  },
  computed: {
    visibleItems() {
      const base = this.items || [];

      if (this.selectedTab === 'checked') {
        return base;
      }
      // 미체크 항목 생성
      const uncheckedItems = base.map((item) => ({
        itemKey: `UNCHECKED_${item.itemKey}`,
        itemLabel: `${item.itemLabel || ''} 미체크`,
        itemColor: 'GR',
        countColor: item.itemColor,
        originKey: item.itemKey,
        type: 'partial',
      }));

      // 전체 미체크 항목은 회색 고정
      const totalUncheckedItem = {
        itemKey: 'UNCHECKED_TOTAL',
        itemLabel: '전체 미체크',
        itemColor: 'GR',
        countColor: 'GR',
        type: 'total',
      };

      return [...uncheckedItems, totalUncheckedItem];
    },
  },
  methods: {
    getCountStyle(item) {
      const colorMap = {
        BLUE: '#3987F8',
        GREEN: '#80B939',
        YELLOW: '#FCD049',
        RED: '#F95F6E',
        BLUE_GREEN: '#32C3D7',
        GR: '#BDBDBD',
        DG: '#8D8D8D',
        LG: '#AEAEAE',
        ORANGE: '#FF8737'
      };
      const colorKey = item.countColor || item.itemColor;
      const baseHex = colorKey === 'GR' ? colorMap.ORANGE : colorMap[colorKey] || colorMap.ORANGE;

      const isTotalUnchecked = item.itemKey === 'UNCHECKED_TOTAL';
      const isPartialUnchecked = item.type === 'partial';      

      const isYellow = (item.itemColor === 'YELLOW' || item.countColor === 'YELLOW');

      const bgOpacity = isPartialUnchecked
        ? (isYellow ? 0.4 : 0.3)
        : 1;

      const background = isTotalUnchecked
        ? this.hexToRgba(colorMap.LG, 0.3)
        : this.hexToRgba(baseHex, bgOpacity);

      const textColor = (isPartialUnchecked || isTotalUnchecked)
      ? 'rgba(0, 0, 0, 0.6)'
      : '#fff';

      return {
        background,
        color: textColor,
      };
    },
    hexToRgba(hex, alpha = 1) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    getBorderStyle(item) {
      const colorMap = {
        BLUE: '#3987F8',
        GREEN: '#80B939',
        YELLOW: '#FCD049',
        RED: '#F95F6E',
        BLUE_GREEN: '#32C3D7',
        GR: '#BDBDBD',
        DG: '#8D8D8D'
      };

      const isChecked = this.selectedItems.includes(item.itemKey);

      // 전체 미체크 아이템
      if (item.itemKey === 'UNCHECKED_TOTAL') {
        return {
          border: isChecked ? `1px solid ${colorMap.DG}` : '1px solid transparent',
        };
      }

      // 미체크 partial 항목이고 체크되었으면 원본 색 보더
      if (item.itemColor === 'GR' && item.type === 'partial') {
        return {
          border: isChecked
            ? `1px solid ${colorMap[item.countColor] || '#FF8737'}`
            : '1px solid transparent',
        };
      }

      // 일반 항목
      return {
        border: isChecked
          ? `1px solid ${colorMap[item.itemColor] || '#FF8737'}`
          : '1px solid transparent',
      };
    },

    getStudentsByKey(key) {
      if (key === 'UNCHECKED_TOTAL') {
        // 전체 미체크: 어떤 항목도 체크 안 된 학생
        return this.students.filter(
          (s) =>
            !s.checkItemA &&
            !s.checkItemB &&
            !s.checkItemC &&
            !s.checkItemD &&
            !s.checkItemE
        );
      }

      if (key.startsWith('UNCHECKED_')) {
        // 부분 미체크: 해당 항목이 체크 안 된 학생
        const originKey = key.replace('UNCHECKED_', '');
        return this.students.filter((s) => !s[`checkItem${originKey}`]);
      }

      // 체크된 학생
      return this.students.filter((s) => s[`checkItem${key}`]);
    },
    getStudentCount(key) {
      return this.getStudentsByKey(key).length;
    },
    doReward(isNegative) {
      if (this.selectedItems.length === 0) {
        this.isOpenStudentConfirm = true;
        return;
      }

      const studentList = this.selectedItems.map((type) =>
        this.getStudentsByKey(type)
      );

      this.$emit('openRewardModal', {
        studentList,
        rewardType: isNegative ? 'effort' : 'good',
      });
    },
    handleClick(e) {
      const personnelPoint = document.querySelector('.reward-target')
      const rewardModal = document.querySelector('#giveTotalPointModal')

      if (personnelPoint && personnelPoint.contains(e.target)) return
      if (rewardModal && rewardModal.contains(e.target)) return
      if (e.target.classList && e.target.classList.contains('modal-close-btn')) return

      this.$emit('closeRewardTargetList')
      this.rewardTargetList = false
    }
  },
  watch: {
    selectedTab() {
      this.$nextTick(() => {
        const el = this.$refs.rewardList;
        if (el) {
          const newHeight = el.scrollHeight;
          this.maxListHeight = Math.max(this.uncheckedListHeight, newHeight);
        }
      });
    }
  },
  mounted() {
    this.clickHandler = (e) => {
      this.handleClick(e);
    };
    document.addEventListener('click', this.clickHandler);
    this.$nextTick(() => {
      const prevTab = this.selectedTab;
      this.selectedTab = 'unchecked';

      this.$nextTick(() => {
        const el = this.$refs.rewardList;
        if (el) {
          this.uncheckedListHeight = el.scrollHeight;
          this.maxListHeight = this.uncheckedListHeight;
        }
        this.selectedTab = prevTab; // 다시 체크 탭으로 복원
      });
    });
  },
  beforeDestroy() {
    document.removeEventListener('click', this.clickHandler);
  },
};
</script>

<style scoped lang="scss">
$color-bg: #32C3D7;
$color-b: #3987F8;
$color-g: #80B939;
$color-y: #FCD049;
$color-r: #F95F6E;
$color-gr: #BDBDBD;
$color-dg: #8D8D8D;
$color-lg: #AEAEAE;

.reward-target {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #d6d6d6;
  width: 370px;
  padding: 30px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  position: absolute;
  z-index: 2;
  top: 40px;

  h2 {
    margin-bottom: 25px;
    font-size: 16px;
    font-weight: bold;
    text-align: left;
  }

  .reward-target-list li + li {
    margin-top: 8px;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .top-btn {
    margin-bottom: 20px;
    display: flex;

    .hi-btn {
      width: 62px;
      font-size: 13px;
      font-weight: 400;

      + .hi-btn {
        margin-left: 8px;
      }
    }
  }
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
    border-radius: 6px;
    height: 44px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease-in-out;
    background: rgba(#ff8737, 0.2);
    margin-left: 0;

    .item-label {
      font-size: 14px;
      font-weight: 400;
      padding-left: 16px;
      overflow: hidden;
      width: 180px;
      height: 14px;
      line-height: 14px;
    }

    .count {
      font-size: 14px;
      font-weight: 700;
      width: 78px;
      height: 100%;
      border-radius: 0 6px 6px 0;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ff8737;
    }
    @mixin color-style($color) {
      background: rgba($color, 0.2);

      .count {
        background: $color;
      }
    }
    @mixin color-style-unchecked($color) {
      background: rgba($color, 0.2); 
      .count {
        background: rgba($color, 0.3);
      }
    }
    &.color-bg {
      @include color-style($color-bg);
    }
    &.color-b {
      @include color-style($color-b);
    }
    &.color-g {
      @include color-style($color-g);
    }
    &.color-y {
      @include color-style($color-y);
    }
    &.color-r {
      @include color-style($color-r);      
    }
    &.color-gr {
      @include color-style($color-gr);
      &.unchecked {
        @include color-style-unchecked($color-gr);
      } 
    }
  }
  input[type='checkbox'] {
    &:checked + label .item {
      border: 1px solid #ff8737;

      &.color-bg {
        border: 1px solid $color-bg;
      }
      &.color-b {
        border: 1px solid $color-b;
      }
      &.color-g {
        border: 1px solid $color-g;
      }
      &.color-y {
        border: 1px solid $color-y;
      }
      &.color-r {
        border: 1px solid $color-r;
      }
      &.color-gr {
        border: 1px solid $color-gr;
      }
    }
  }

  .btns {
    margin-top: 20px;
    display: flex;
    width: 100%;
    align-items: center;
    gap: 8px;
    justify-content: center;

    button {
      width: 140px;
      height: 40px;
      border-radius: 50px;
    }
  }
}

.behavior-wrapper__body {
  .behavior-wrapper__body__content {
    .record.inwon .record-recording {
      .record-recording__content {
        .record-recording__content__inwon {
          .list-wrap {
            .btn-wrap {
              .reward-target {
                .hi-btn {
                  color: #fff;
                  border-radius: 24px;
                  &.btn-black {
                    font-weight: 700;
                    background: #222;
                  }
                  &.btn-line-default {
                    font-weight: 400;
                    background: #fff;
                    color: #616161;
                    border-color: #D6D6D6;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
