<!--
@File(Method): CheckItemsEdit.vue
@Date Created: 2025-06-20
@Description: 학급기록 > 인원체크 > 상세 > 항목 수정
@Modified: #74594 인원체크 상세 새창 분리
-->
<template>
  <div :class="getClassName">
    <div :class="`${getClassName}__title`">
      <h2>항목 수정</h2>
    </div>

    <div :class="`${getClassName}__list-wrap`">
      <p
          v-for="(item, idx) in itemCheckListItems"
          :key="`check-list-add-${item.itemKey}`"
          class="item"
          :class="`check${checklistType === 'CHECK' ? `-${item.itemKey.toLowerCase()}` : ` ${idx}`}`"
      >
        <template v-if="['SCORE', 'LEVEL_COMMENT'].includes(checklistType)">
          <span class="check-text">{{ item.originalItemLabel }}</span>
          <span class="arrow bh-icon-arrowright-bold-24"></span>
        </template>

        <label>
          <span v-if="checklistType === 'CHECK'" class="check"><i></i></span>
          <input
              type="text"
              maxlength="20"
              placeholder="항목"
              ref="checkListInput"
              v-model="item.itemLabel"
              @keyup.enter="onKeyupEnterInput(idx)"
              @input="validateInput($event, idx)"
          />
        </label>

        <span v-if="itemCheckListItems.length > getMinLength" class="delete" @click="$emit('deleteCheckListItems', item)">
          <i class="bh-icon-close-8"></i>
        </span>
      </p>
      <button v-if="itemCheckListItems.length < 5" class="add" @click="addCheckListItem">
        <i class="bh-plus-orange-24"></i>항목 추가
      </button>
    </div>

    <div :class="`${getClassName}__btn-wrap`">
      <button class="esc" @click="$emit('closeChecklistItems')">취소</button>
      <button class="reg" @click="updateCheckListItems">완료</button>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: 'CheckItemsEdit',
  data() {
    return {}
  },
  props: {
    itemCheckListItems: {
      type: Array,
      default: () => []
    },
    checklistType: {
      type: String,
      required: true
    },
    checklistId: {
      type: String
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('storeBehavior', ['curClassroom']),
    getClassName() {
      return this.checklistType === 'CHECK' ? 'check-list-add' : 'check-list-add-point'
    },
    getMinLength() {
      return {
        'CHECK': 1,
        'SCORE': 2,
        'LEVEL_COMMENT': 1
      }[this.checklistType]
    }
  },
  methods: {
    addCheckListItem() {
      const arr = ['A', 'B', 'C', 'D', 'E']
      let addKey = ''

      for (let i = 0; i < arr.length; i++) {
        let index = this.itemCheckListItems.findIndex(item => item.itemKey === arr[i])
        if (index === -1) {
          addKey = arr[i]
          break
        }
      }

      const color = {
        'A': 'BLUE_GREEN',
        'B': 'BLUE',
        'C': 'GREEN',
        'D': 'YELLOW',
        'E': 'RED'
      }

      this.itemCheckListItems.push({
        itemKey: addKey,
        itemColor: color[addKey],
        itemLabel: null,
        sortNo: 0
      })
    },
    async updateCheckListItems() {
      let list = this.itemCheckListItems.map((item, idx) => {
        if (item.itemLabel) {
          item.itemLabel = item.itemLabel.replace(/[^0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣~!@#$%^&*()\-_=+<>?:,"'`{}\[\]\\\/.;\s]/gi, '')
        }

        let obj = {
          itemKey : item.itemKey,
          itemLabel : item.itemLabel,
          sortNo : idx + 1
        }

        if (this.checklistType === 'CHECK') {
          obj.itemColor = item.itemColor
        }

        return obj
      })

      try {
        const res = await this.$axios.patch(`/classroom/${this.curClassroom.classroomId}/checklist/${this.checklistId}/items`, {
          userId : this.user.currentId, items : list
        })
        this.$emit('updateCheckListItems', res)
      } catch (err) {
        this.$log.debug(' classroom checklist items PATCH() error => ', err)
      }
    },
    onKeyupEnterInput(idx) {
      const targetIdx = this.$refs.checkListInput.length === idx + 1 ? 0 : idx + 1
      this.$refs.checkListInput[targetIdx].focus()
    },
    validateInput(e, idx) {
      const regex = /[^0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣~!@#$%^&*()\-_=+<>?:,"'`{}\[\]\\\/.;\s]/gi
      e.target.value = e.target.value.replace(regex, '').substring(0, 20)
      if (this.itemCheckListItems[idx].itemLabel) {
        this.itemCheckListItems[idx].itemLabel = this.itemCheckListItems[idx].itemLabel.replace(regex, '').substring(0, 20)
      }
    }
  }
}
</script>