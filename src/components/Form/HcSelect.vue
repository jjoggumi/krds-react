<template>
  <div
    class="border-selectbox-wrap custom-select-box-wrap"
    :class="{ selected: option.isOpen }"
    @click="toggleOpen"
    v-click-outside="setClose"
  >
    <div v-if="isTextModeResult" class="tit-school-class">
      <div :class="labelColor">{{ displayLabel }}</div>
    </div>
    <template v-else>
      <template v-if="scrollbarType === 0">
        <a href="javascript:">
          <div class="selected-option">
            <div
              class="option-val"
              :class="{
                'placeholder': model === null
              }"
            >{{ displayLabel }}</div>
          </div>
        </a>
      </template>
      <template v-else>
        <div class="selected-option">
          <div
            class="option-val"
            :class="{
              'placeholder': model === null
            }"
          >{{ displayLabel }}</div>
        </div>
      </template>
    </template>

    <div class="option-list-wrap">
      <div
        :class="{
          'scrollbar-outer': scrollbarType === 0
        }"
      >
        <ul>
          <template v-if="scrollbarType === 0">
            <a href="javascript:">
              <li
                v-if="isUseAll"
                :class="{ selected: !pModel }"
                @click="changeItem({ code: null, name: defaultLabel })"
              >
                <div class="option-item">{{ defaultLabel }}</div>
              </li>
              <li
                v-for="item in selectItem"
                :key="item[selectValue]"
                :ref="`hc-select-${item[selectValue]}`"
                :class="{ selected: item[selectValue] === pModel }"
                @click="changeItem(item)"
              >
                <div class="option-item">{{ item[selectLabel] }}</div>
              </li>
            </a>
          </template>
          <template v-else>
            <li
              v-if="isUseAll"
              :class="{ selected: !pModel }"
              @click="changeItem({ code: null, name: defaultLabel })"
            >
              <div class="option-item">{{ defaultLabel }}</div>
            </li>
            <li
              v-for="item in selectItem"
              :key="item[selectValue]"
              :ref="`hc-select-${item[selectValue]}`"
              :class="{ selected: item[selectValue] === pModel }"
              @click="changeItem(item)"
            >
              <div class="option-item">{{ item[selectLabel] }}</div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hc-select',
  props: {
    model: {
      required: true,
      default: null
    },
    selectLabel: {
      type: String,
      required: true
    },
    selectValue: {
      type: String,
      required: true
    },
    defaultLabel: {
      type: String
    },
    isTextMode: {
      type: Boolean,
      default() {
        return false
      }
    },
    isFocusMode: {
      type: Boolean,
      default() {
        return true
      }
    },
    isDisabled: {
      type: Boolean,
      default() {
        return false
      }
    },
    isUseAll: {
      type: Boolean,
      default() {
        return false
      }
    },
    item: {
      type: Array,
      default() {
        return null
      }
    },
    /**
     * scrollbarType
     * 0: jQuery scrollbar
     * 1: browser default scrollbar
     */
    scrollbarType: {
      type: Number,
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
    selectItem: {
      get() {
        let pItem = this.item
        if (this.defaultLabel) {
          pItem = pItem.filter(item => {
            return (item.isDefault || false) === false
          })
          for (let item of pItem) {
            item[this.selectLabel] === this.defaultLabel
              ? item.isDefault = true
              : false
          }
          /*pItem.unshift({
            [this.selectLabel]: this.defaultLabel,
            [this.selectValue]: '',
            isDefault: true
          })*/
        }
        return pItem
      }
    },
    optionStyle() {
      // Item이 1개 이상일때만 활성화
      if (this.selectItem.length > 1) {
        if (this.option.isOpen) {
          return 'block'
        } else {
          return 'none'
        }
      } else {
        return 'none'
      }
    },
    displayLabel() {
      if (!this.pModel) {
        return this.defaultLabel
      } else {
        let selectLabel = this.selectItem.find(item => {
          return item[this.selectValue] === this.pModel
        })

        if (selectLabel) {
          return selectLabel[this.selectLabel]
        } else {
          return this.defaultLabel
        }
      }
    },
    pModel: {
      get() {
        return this.model
      },
      set(val) {
        this.$emit('update:model', val)
      }
    },
    isTextModeResult() {
      if (this.isDisabled) {
        return true
      } else {
        if (!this.isTextMode) {
          return false
        } else {
          return this.selectItem.length <= 1;
        }
      }
    },
    labelColor() {
      let labelColor = ""
      if (this.model === 'COMPLETE')
        labelColor = 'ft-blue'
        
      else if (this.model === 'REJECT')
        labelColor = 'ft-orange'
  
      else if (this.model === 'UNIDENTIFIED')
        labelColor = 'ft-lightgray'
      
      return labelColor
    }
  },
  mounted() {
    if (this.scrollbarType === 0) {
      this.$nextTick(() => {
        this.$jqueryUtil.scrollbar()
      })
    }
  },
  watch: {},
  methods: {
    setClose() {
      this.option.isOpen = false
    },
    changeItem(item) {
      this.pModel = item[this.selectValue]
      this.$emit('is-click', item)
    },
    toggleOpen() {
      if (!this.isTextModeResult) this.option.isOpen = !this.option.isOpen

      if (this.option.isOpen) {
        this.doFocus(`hc-select-${this.pModel}`)
      }
    },
    doFocus(ref) {
      if (this.isFocusMode) {
        this.$nextTick(() => {
          this.$refs[ref][0].scrollIntoView()
        })
      }
    }
  }
}
</script>
