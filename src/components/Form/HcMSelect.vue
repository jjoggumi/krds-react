<!--
@File(Method): 
@Author: -
@Date Created: -
@Description: 모바일 셀렉트 박스
@ETC : 서비스 제공 안되는 페이지 (삭제 요망)  -  문의하기 글쓰기에서만 사용했었는데 hiseletbox 로 대체 
-->
<template>
  <div class="m-selectbox-wrap border-selectbox-wrap"
    :class="{ selected: option.isOpen }"
    @click="option.isOpen = !option.isOpen"
    v-click-outside="setClose">
    <div class="selected-option">
      <div class="option-val">{{ displayLabel }}</div>
    </div>
    <div class="option-list-wrap">
      <ul>
        <li
          v-for="item in selectItem"
          :key="item[selectValue]"
          :class="{'selected' : item[selectValue] === pModel}"
          @click="changeItem(item)">
            <div class="option-item">{{item[selectLabel]}}</div>
        </li>
      </ul>
    </div>
    </div>
</template>

<script>
export default {
  name: 'hiClass_Select',
  props: {
    model: {
      required: true
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
    item: {
      type: Array,
      default() {
        return null
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
          pItem.unshift({ [this.selectLabel]: this.defaultLabel, [this.selectValue]: '', isDefault: true })
        }
        return pItem
      }
    },
    optionStyle() {
      if (this.option.isOpen) {
        return 'block'
      } else {
        return 'none'
      }
    },
    displayLabel() {
      if (!this.pModel) {
        return this.defaultLabel
      } else
      {
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
    }
  },
  mounted() {},
  watch: {},
  methods: {
    setClose() {
      this.option.isOpen = false
    },
    changeItem(item) {
      this.pModel = item[this.selectValue]
      this.$emit('is-click', item)
    }
  }
}
</script>
<style scoped src="../../assets/css/m-customer.css">
</style>